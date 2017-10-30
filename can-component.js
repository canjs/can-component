/* jshint -W079 */
// # can/component/component.js
//
// This implements the `Component` which allows you to create widgets
// that use a view, a view-model, and custom tags.
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

var compute = require('can-compute');
var domData = require('can-util/dom/data/data');
var domMutate = require('can-util/dom/mutate/mutate');
var getChildNodes = require('can-util/dom/child-nodes/child-nodes');
var domDispatch = require('can-util/dom/dispatch/dispatch');
var types = require("can-types");
var string = require("can-util/js/string/string");
var canReflect = require("can-reflect");

var canEach = require('can-util/js/each/each');
var assign = require('can-util/js/assign/assign');
var isFunction = require('can-util/js/is-function/is-function');
var canLog = require('can-util/js/log/log');
var canDev = require("can-util/js/dev/dev");
var makeArray = require("can-util/js/make-array/make-array");
var isEmptyObject = require("can-util/js/is-empty-object/is-empty-object");

require('can-util/dom/events/inserted/inserted');
require('can-util/dom/events/removed/removed');
require('can-view-model');


// For insertion elements like <can-slot> and <context>, this will add
// a compute viewModel to the top of the context if
// a binding like {this}="value" is present.
// - el - the insertion element
// - tagData - the tagData the insertion element will be rendered with
// - insertionElementTagData - the tagData found at the insertion element
// `returns` - the tagData the template should be rendered with.
function addContext(el, tagData, insertionElementTagData) {
	var vm;

	domData.set.call(el, "preventDataBindings", true);

	// insertionElementTagData is where the <content> element is in the shadow dom
	// it should be used for bindings
	var teardown = stacheBindings.behaviors.viewModel(el, insertionElementTagData, function(initialData) {
		// Create a compute responsible for keeping the vm up-to-date
		return vm = compute(initialData);
	}, undefined, true);


	if(!teardown) {
		// if no teardown, there's no bindings, no need to change the scope
		return tagData;
	} else {
		return assign( assign({}, tagData), {
			teardown: teardown,
			scope: tagData.scope.add(vm)
		});
	}

}

// Returns a hookupFuction that gets the proper tagData in a template, renders it, and adds it to nodeLists
function makeInsertionTagCallback(tagName, componentTagData, shadowTagData, leakScope, getPrimaryTemplate) {
	var options = shadowTagData.options._context;

	return function hookupFunction(el, insertionElementTagData) {
		var template = getPrimaryTemplate(el) || insertionElementTagData.subtemplate,
			renderingLightContent = template !== insertionElementTagData.subtemplate;

		if (template) {
			// However, `_tags.[tagName]` is going to point to this current content callback.  We need to
			// remove that so it will walk up the chain
			delete options.tags[tagName];

			// By default, light dom scoping is
			// dynamic. This means that any `{{foo}}`
			// bindings inside the "light dom" content of
			// the component will have access to the
			// internal viewModel. This can be overridden to be
			// lexical with the leakScope option.
			var tagData;

			if( renderingLightContent ) {

				if(leakScope.toLightContent) {
					// render with the component's viewModel mixed in, however
					// we still want the outer refs to be used, NOT the component's refs
					// <component> {{some value }} </component>
					// To fix this, we
					// walk down the scope to the component's ref, clone scopes from that point up
					// use that as the new scope.
					tagData = addContext(el, {
						scope: insertionElementTagData.scope.cloneFromRef(),
						options: insertionElementTagData.options
					}, insertionElementTagData);
				}
				else {
					// render with the same scope the component was found within.
					tagData = addContext(el, componentTagData, insertionElementTagData);
				}
			} else {
				// we are rendering default content so this content should
				// use the same scope as the <content> tag was found within.
				tagData = addContext(el, insertionElementTagData, insertionElementTagData);
			}


			// the `el` is part of some parent node list

			var nodeList = nodeLists.register([el], function() {
				if(tagData.teardown) {
					tagData.teardown();
				}
			}, insertionElementTagData.parentNodeList || true, false);
			nodeList.expression = "<can-slot name='"+el.getAttribute('name')+"'/>";

			var frag = template(tagData.scope, tagData.options, nodeList);
			var newNodes = makeArray( getChildNodes(frag) );
			nodeLists.replace(nodeList, frag);
			nodeLists.update(nodeList, newNodes);

			// Restore the proper tag function so it could potentially be used again (as in lists)
			options.tags[tagName] = hookupFunction;
		}
	};
}

var Component = Construct.extend(

	// ## Static
	{
		// ### setup
		//
		// When a component is extended, this sets up the component's internal constructor
		// functions and views for later fast initialization.
		setup: function() {
			Construct.setup.apply(this, arguments);

			// When `Component.setup` function is ran for the first time, `Component` doesn't exist yet
			// which ensures that the following code is ran only in constructors that extend `Component`.
			if (Component) {
				var self = this;

				// Define a control using the `events` prototype property.
				if(!isEmptyObject(this.prototype.events)) {
					this.Control = ComponentControl.extend(this.prototype.events);
				}

				//!steal-remove-start
				// If a constructor is assigned to the viewModel, give a warning
				if (this.prototype.viewModel && canReflect.isConstructorLike(this.prototype.viewModel)) {
					canDev.warn("can-component: Assigning a DefineMap or constructor type to the viewModel property may not be what you intended. Did you mean ViewModel instead? More info: https://canjs.com/doc/can-component.prototype.ViewModel.html");
				}
				//!steal-remove-end

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
							if(canReflect.isObservableLike(protoViewModel.prototype) && canReflect.isMapLike(protoViewModel.prototype)) {
								this.ViewModel = protoViewModel;
							} else {
								this.viewModelHandler = protoViewModel;
							}
						} else {
							if(canReflect.isObservableLike(protoViewModel) && canReflect.isMapLike(protoViewModel)) {
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
		// ### setup
		// When a new component instance is created, setup bindings, render the view, etc.
		setup: function(el, componentTagData) {
			var component = this;
			// If a view is not provided, we fall back to
			// dynamic scoping regardless of settings.


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
						if (canReflect.isObservableLike(scopeResult) && canReflect.isMapLike(scopeResult) ) {
							// If the function returns a can.Map, use that as the viewModel
							viewModelInstance = scopeResult;
						} else if (canReflect.isObservableLike(scopeResult.prototype) && canReflect.isMapLike(scopeResult.prototype)) {
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


			// ## Helpers
			var options = {
					helpers: {},
					tags: {}
				};
			// Setup helpers to callback with `this` as the component
			canEach(this.helpers || {}, function(val, prop) {
				if (isFunction(val)) {
					options.helpers[prop] = val.bind(viewModel);
				}
			});

			// ## `events` control

			// Create a control to listen to events
			if(this.constructor.Control) {
				this._control = new this.constructor.Control(el, {
					// Pass the viewModel to the control so we can listen to it's changes from the controller.
					scope: this.viewModel,
					viewModel: this.viewModel,
					destroy: callTeardownFunctions
				});
			}


			// ## Rendering

			var leakScope = {
				toLightContent: this.leakScope === true,
				intoShadowContent: this.leakScope === true
			};

			var hasShadowTemplate = !!(this.constructor.renderer);

			// Get what we should render between the component tags
			// and the data for it.
			var betweenTagsRenderer;
			var betweenTagsTagData;
			if( hasShadowTemplate ) {
				var shadowTagData;
				if (leakScope.intoShadowContent) {
					// Give access to the component's data and the VM
					shadowTagData = {
						scope: componentTagData.scope.add(new Scope.Refs()).add(this.viewModel, {
							viewModel: true
						}),
						options: componentTagData.options.add(options)
					};

				} else { // lexical
					// only give access to the VM
					shadowTagData = {
						scope: Scope.refsScope().add(this.viewModel, {
							viewModel: true
						}),
						options: new Scope.Options(options)
					};
				}

				// Add a hookup for each <can-slot>
				options.tags['can-slot'] = makeInsertionTagCallback('can-slot', componentTagData, shadowTagData, leakScope, function(el) {
					return componentTagData.templates[el.getAttribute("name")];
				});

				// Add a hookup for <content>
				options.tags.content = makeInsertionTagCallback('content',  componentTagData, shadowTagData, leakScope, function() {
					return componentTagData.subtemplate;
				});

				betweenTagsRenderer = this.constructor.renderer;
				betweenTagsTagData = shadowTagData;
			}
			else {
				// No shadow template.
				// Render light template with viewModel on top
				var lightTemplateTagData = {
					scope: componentTagData.scope.add(this.viewModel, {
						viewModel: true
					}),
					options: componentTagData.options.add(options)
				};
				betweenTagsTagData = lightTemplateTagData;
				betweenTagsRenderer = componentTagData.subtemplate || el.ownerDocument.createDocumentFragment.bind(el.ownerDocument);
			}

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

			frag = betweenTagsRenderer(betweenTagsTagData.scope, betweenTagsTagData.options, nodeList);

			// Append the resulting document fragment to the element
			domMutate.appendChild.call(el, frag);

			// update the nodeList with the new children so the mapping gets applied
			nodeLists.update(nodeList, getChildNodes(el));
		}
	});

module.exports = namespace.Component = Component;
