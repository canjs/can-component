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
var namespace = require('can-namespace');

var Construct = require("can-construct");
var stacheBindings = require("can-stache-bindings");
var Scope = require("can-view-scope");
var viewCallbacks = require("can-view-callbacks");
var nodeLists = require("can-view-nodelist");

var domData = require('can-util/dom/data/data');
var domMutate = require('can-util/dom/mutate/mutate');
var getChildNodes = require('can-util/dom/child-nodes/child-nodes');
var domDispatch = require('can-util/dom/dispatch/dispatch');
var types = require("can-types");
var string = require("can-util/js/string/string");

var canEach = require('can-util/js/each/each');
var isFunction = require('can-util/js/is-function/is-function');
var canLog = require('can-util/js/log/log');

require('can-util/dom/events/inserted/inserted');
require('can-util/dom/events/removed/removed');
require('can-view-model');

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
				var self = this;

				// Define a control using the `events` prototype property.
				this.Control = ComponentControl.extend(this.prototype.events);

				// Look at viewModel, scope, and ViewModel properties and set one of:
				//  - this.viewModelHandler
				//  - this.ViewModel
				//  - this.viewModelInstance
				var protoViewModel = this.prototype.viewModel || this.prototype.scope;

				if(protoViewModel && this.prototype.ViewModel) {
					throw new Error("Cannot provide both a ViewModel and a viewModel property");
				}
				var vmName = string.capitalize( string.camelize(this.prototype.tag) )+"VM";
				if(this.prototype.ViewModel) {
					if(typeof this.prototype.ViewModel === "function") {
						this.ViewModel = this.prototype.ViewModel;
					} else {
						this.ViewModel = types.DefaultMap.extend(vmName, this.prototype.ViewModel);
					}
				} else {

					if(protoViewModel) {
						if(typeof protoViewModel === "function") {
							if(types.isMapLike(protoViewModel.prototype)) {
								this.ViewModel = protoViewModel;
							} else {
								this.viewModelHandler = protoViewModel;
							}
						} else {
							if(types.isMapLike(protoViewModel)) {
								//!steal-remove-start
								canLog.warn("can-component: "+this.prototype.tag+" is sharing a single map across all component instances");
								//!steal-remove-end
								this.viewModelInstance = protoViewModel;
							} else {
								this.ViewModel = types.DefaultMap.extend(vmName,protoViewModel);
							}
						}
					} else {
						this.ViewModel = types.DefaultMap.extend(vmName,{});
					}
				}

				// Convert the template into a renderer function.
				if (this.prototype.template) {
					//!steal-remove-start
					canLog.warn('can-component.prototype.template: is deprecated and will be removed in a future release. Use can-component.prototype.view');
					//!steal-remove-end
					this.renderer = this.prototype.template;
				}
				if (this.prototype.view) {
					this.renderer = this.prototype.view;
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
			var component = this;
			// If a template is not provided, we fall back to
			// dynamic scoping regardless of settings.
			var lexicalContent = (
					(typeof this.leakScope === "undefined" ? true : !this.leakScope) &&
					!!(this.template || this.view)
				);
			// an array of teardown stuff that should happen when the element is removed
			var teardownFunctions = [];
			var initialViewModelData = {};
			var callTeardownFunctions = function() {
					for (var i = 0, len = teardownFunctions.length; i < len; i++) {
						teardownFunctions[i]();
					}
				};
			var setupBindings = !domData.get.call(el, "preventDataBindings");
			var viewModel, frag;

			// ## Scope
			var teardownBindings;
			if (setupBindings) {
				var setupFn = componentTagData.setupBindings ||
					function(el, callback, data){
						return stacheBindings.behaviors.viewModel(el, componentTagData,
																											callback, data);
					};
				teardownBindings = setupFn(el, function(initialViewModelData) {

					var ViewModel = component.constructor.ViewModel,
						viewModelHandler = component.constructor.viewModelHandler,
						viewModelInstance = component.constructor.viewModelInstance;

					if(viewModelHandler) {
						var scopeResult = viewModelHandler.call(component, initialViewModelData, componentTagData.scope, el);
						if (types.isMapLike( scopeResult ) ) {
							// If the function returns a can.Map, use that as the viewModel
							viewModelInstance = scopeResult;
						} else if ( types.isMapLike(scopeResult.prototype) ) {
							// If `scopeResult` is of a `can.Map` type, use it to wrap the `initialViewModelData`
							ViewModel = scopeResult;
						} else {
							// Otherwise extend `can.Map` with the `scopeResult` and initialize it with the `initialViewModelData`
							ViewModel = types.DefaultMap.extend(scopeResult);
						}
					}

					if(ViewModel) {
						viewModelInstance = new component.constructor.ViewModel(initialViewModelData);
					}
					viewModel = viewModelInstance;
					return viewModelInstance;
				}, initialViewModelData);
			}

			// Set `viewModel` to `this.viewModel` and set it to the element's `data` object as a `viewModel` property
			this.viewModel = viewModel;

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



module.exports = namespace.Component = Component;
