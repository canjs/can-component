/* jshint -W079 */
// # can/component/component.js
//
// This implements the `Component` which allows you to create widgets
// that use a template, a view-model and custom tags.
//
// `Component` implements most of it's functionality in the `Component.setup`
// and the `Component.prototype.setup` functions.
//
// `Component.setup` prepares everything needed by the `Component.prototype.setup`
// to hookup the component.
var ComponentControl = require("./control/control");

var Construct = require("can-construct");
var CanMap = require("can-map");

var stache = require("can-stache");
var stacheBindings = require("can-stache-bindings");
var Scope = require("can-view-scope");
var viewCallbacks = require("can-view-callbacks");
var nodeLists = require('can-view-nodelist');

var domData = require('can-util/dom/data/data');
var domMutate = require('can-util/dom/mutate/mutate');
var getChildNodes = require('can-util/dom/child-nodes/child-nodes');
var domDispatch = require('can-util/dom/dispatch/dispatch');

var canEach = require('can-util/js/each/each');
var string = require('can-util/js/string/string');
var isFunction = require('can-util/js/is-function/is-function');
var dev = require('can-util/js/dev/dev');

require('can-util/dom/events/inserted/inserted');
require('can-util/dom/events/removed/removed');
require("can-view-model");


/**
 * @add Component
 */
var Component = Construct.extend(

	// ## Static
	/**
	 * @static
	 */

	{
		// ### setup
		//
		// When a component is extended, this sets up the component's internal constructor
		// functions and templates for later fast initialization.
		setup: function() {
			Construct.setup.apply(this, arguments);

			// When `Component.setup` function is ran for the first time, `Component` doesn't exist yet
			// which ensures that the following code is ran only in constructors that extend `Component`.
			if (Component) {
				var self = this,
					protoViewModel = this.prototype.scope || this.prototype.viewModel,
					ViewModel = this.prototype.ViewModel;

				// Define a control using the `events` prototype property.
				this.Control = ComponentControl.extend(this.prototype.events);

				if(ViewModel) {
					// Do nothing, assume constructor
					this.ViewModel = ViewModel;
				}
				// Look to convert `protoViewModel` to a Map constructor function.
				else if (!protoViewModel || (typeof protoViewModel === "object" && !(protoViewModel instanceof CanMap))) {
					// If protoViewModel is an object, use that object as the prototype of an extended
					// Map constructor function.
					// A new instance of that Map constructor function will be created and
					// set a the constructor instance's viewModel.
					this.Map = CanMap.extend(protoViewModel || {});
				} else if (protoViewModel.prototype instanceof CanMap) {
					// If viewModel is a CanMap constructor function, just use that.
					this.Map = protoViewModel;
				}


				// Look for default `@` values. If a `@` is found, these
				// attributes string values will be set and 2-way bound on the
				// component instance's viewModel.
				this.attributeScopeMappings = {};
				canEach(this.Map ? this.Map.defaults : {}, function(val, prop) {
					if (val === "@") {
						self.attributeScopeMappings[prop] = prop;
					}
				});

				// Convert the template into a renderer function.
				if (this.prototype.template) {
					// If `this.prototype.template` is a function create renderer from it by
					// wrapping it with the anonymous function that will pass it the arguments,
					// otherwise create the render from the string
					if (typeof this.prototype.template === "function") {
						this.renderer = this.prototype.template;
					} else {
						this.renderer = stache(this.prototype.template);
					}
				}

				// Register this component to be created when its `tag` is found.
				viewCallbacks.tag(this.prototype.tag, function(el, options) {
					new self(el, options);
				});
			}

		}
	}, {
		// ## Prototype
		/**
		 * @prototype
		 */
		// ### setup
		// When a new component instance is created, setup bindings, render the template, etc.
		setup: function(el, componentTagData) {

			// Setup values passed to component
			var initialViewModelData = {},
				component = this,
				// If a template is not provided, we fall back to
				// dynamic scoping regardless of settings.
				lexicalContent = ((typeof this.leakScope === "undefined" ?
						false :
						!this.leakScope) &&
					!!this.template),

				// the object added to the scope
				viewModel,
				frag,
				// an array of teardown stuff that should happen when the element is removed
				teardownFunctions = [],
				callTeardownFunctions = function() {
					for (var i = 0, len = teardownFunctions.length; i < len; i++) {
						teardownFunctions[i]();
					}
				},

				setupBindings = !domData.get.call(el, "preventDataBindings");

			// ## Scope

			// Add viewModel prototype properties marked with an "@" to the `initialViewModelData` object
			canEach(this.constructor.attributeScopeMappings, function(val, prop) {
				initialViewModelData[prop] = el.getAttribute(string.hyphenate(val));
			});
			var teardownBindings;
			if (setupBindings) {
				teardownBindings = stacheBindings.behaviors.viewModel(el, componentTagData, function(initialViewModelData) {
					// Make %root available on the viewModel.
					initialViewModelData["%root"] = componentTagData.scope.attr("%root");

					// Create the component's viewModel.
					var protoViewModel = component.scope || component.viewModel;
					if (component.constructor.ViewModel) {
						viewModel = new component.constructor.ViewModel(initialViewModelData);
					} else if (component.constructor.Map) {
						// If `Map` property is set on the constructor use it to wrap the `initialViewModelData`
						viewModel = new component.constructor.Map(initialViewModelData);
					} else if (protoViewModel instanceof CanMap) {
						// If `component.viewModel` is instance of `CanMap` assign it to the `viewModel`
						viewModel = protoViewModel;
					} else if (typeof protoViewModel === "function") {
						// If `component.viewModel` is a function, call the function and
						var scopeResult = protoViewModel.call(component, initialViewModelData, componentTagData.scope, el);

						if (scopeResult instanceof CanMap) {
							// If the function returns a CanMap, use that as the viewModel
							viewModel = scopeResult;
						} else if (scopeResult.prototype instanceof CanMap) {
							// If `scopeResult` is of a `CanMap` type, use it to wrap the `initialViewModelData`
							viewModel = new scopeResult(initialViewModelData);
						} else {
							// Otherwise extend `CanMap` with the `scopeResult` and initialize it with the `initialViewModelData`
							viewModel = new(CanMap.extend(scopeResult))(initialViewModelData);
						}
					}

					return viewModel;
				}, initialViewModelData);
			}

			// Set `viewModel` to `this.viewModel` and set it to the element's `data` object as a `viewModel` property
			this.scope = this.viewModel = viewModel;

			domData.set.call(el, "viewModel", viewModel);
			domData.set.call(el, "preventDataBindings", true);

			// Create a real Scope object out of the viewModel property
			// The scope used to render the component's template.
			// However, if there is no template, the "light" dom is rendered with this anyway.
			var shadowScope;
			if (lexicalContent) {
				shadowScope = Scope.refsScope().add(this.viewModel, {
					viewModel: true
				});
			} else {
				// if this component has a template,
				// render the template with it's own Refs scope
				// otherwise, just add this component's viewModel.
				shadowScope = (this.constructor.renderer ?
						componentTagData.scope.add(new Scope.Refs()) :
						componentTagData.scope)
					.add(this.viewModel, {
						viewModel: true
					});
			}
			var options = {
					helpers: {}
				},
				addHelper = function(name, fn) {
					options.helpers[name] = function() {
						return fn.apply(viewModel, arguments);
					};
				};

			// ## Helpers

			// Setup helpers to callback with `this` as the component
			canEach(this.helpers || {}, function(val, prop) {
				if (isFunction(val)) {
					addHelper(prop, val);
				}
			});

			// Setup simple helpers
			canEach(this.simpleHelpers || {}, function(val, prop) {
				//!steal-remove-start
				if (options.helpers[prop]) {
					dev.warn('Component ' + component.tag +
						' already has a helper called ' + prop);
				}
				//!steal-remove-end

				// Convert the helper
				addHelper(prop, stache.simpleHelper(val));
			});

			// ## `events` control

			// Create a control to listen to events
			this._control = new this.constructor.Control(el, {
				// Pass the viewModel to the control so we can listen to it's changes from the controller.
				scope: this.viewModel,
				viewModel: this.viewModel,
				destroy: callTeardownFunctions
			});

			// ## Rendering

			// Keep a nodeList so we can kill any directly nested nodeLists within this component
			var nodeList = nodeLists.register([], function() {
				domDispatch.call(el, "beforeremove", [], false);
				if(teardownBindings) {
					teardownBindings();
				}
			}, componentTagData.parentNodeList || true, false);
			nodeList.expression = "<" + this.tag + ">";
			teardownFunctions.push(function() {
				nodeLists.unregister(nodeList);
			});

			// If this component has a template (that we've already converted to a renderer)
			if (this.constructor.renderer) {
				// If `options.tags` doesn't exist set it to an empty object.
				if (!options.tags) {
					options.tags = {};
				}

				// We need be alerted to when a <content> element is rendered so we can put the original contents of the widget in its place
				options.tags.content = function contentHookup(el, contentTagData) {
					// First check if there was content within the custom tag
					// otherwise, render what was within <content>, the default code.
					// `componentTagData.subtemplate` is the content inside this component
					var subtemplate = componentTagData.subtemplate || contentTagData.subtemplate,
						renderingLightContent = subtemplate === componentTagData.subtemplate;

					if (subtemplate) {

						// `contentTagData.options` is a viewModel of helpers where `<content>` was found, so
						// the right helpers should already be available.
						// However, `_tags.content` is going to point to this current content callback.  We need to
						// remove that so it will walk up the chain

						delete options.tags.content;

						// By default, light dom scoping is
						// dynamic. This means that any `{{foo}}`
						// bindings inside the "light dom" content of
						// the component will have access to the
						// internal viewModel. This can be overridden to be
						// lexical with the leakScope option.
						var lightTemplateData;
						if (renderingLightContent) {
							if (lexicalContent) {
								// render with the same scope the component was found within.
								lightTemplateData = componentTagData;
							} else {
								// render with the component's viewModel mixed in, however
								// we still want the outer refs to be used, NOT the component's refs
								// <component> {{some value }} </component>
								// To fix this, we
								// walk down the scope to the component's ref, clone scopes from that point up
								// use that as the new scope.
								lightTemplateData = {
									scope: contentTagData.scope.cloneFromRef(),
									options: contentTagData.options
								};
							}

						} else {
							// we are rendering default content so this content should
							// use the same scope as the <content> tag was found within.
							lightTemplateData = contentTagData;
						}

						if (contentTagData.parentNodeList) {
							var frag = subtemplate(lightTemplateData.scope, lightTemplateData.options, contentTagData.parentNodeList);
							nodeLists.replace([el], frag);
						} else {
							nodeLists.replace([el], subtemplate(lightTemplateData.scope, lightTemplateData.options));
						}

						// Restore the content tag so it could potentially be used again (as in lists)
						options.tags.content = contentHookup;
					}
				};
				// Render the component's template
				frag = this.constructor.renderer(shadowScope, componentTagData.options.add(options), nodeList);
			} else {
				// Otherwise render the contents between the element
				frag = componentTagData.subtemplate ?
					componentTagData.subtemplate(shadowScope, componentTagData.options.add(options), nodeList) :
					document.createDocumentFragment();

			}
			// Append the resulting document fragment to the element
			domMutate.appendChild.call(el, frag);

			// update the nodeList with the new children so the mapping gets applied
			nodeLists.update(nodeList, getChildNodes(el));
		}
	});

// This was moved from the legacy view/scanner.js to here in prep for 3.0.0
viewCallbacks.tag("content", function(el, tagData) {
	return tagData.scope;
});


module.exports = Component;
