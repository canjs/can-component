"use strict";
/* jshint -W079 */

// # can-component.js
// This implements the `Component` which allows you to create widgets
// that use a view, a view-model, and custom tags.
//
// `Component` implements most of it's functionality in the `Component.setup`
// and the `Component.prototype.setup` functions.
//
// `Component.setup` prepares everything needed by the `Component.prototype.setup`
// to hookup the component.
var namespace = require('can-namespace');
var Bind = require("can-bind");
var Construct = require("can-construct");
var stache = require("can-stache");
var stacheBindings = require("can-stache-bindings");
var Scope = require("can-view-scope");
var viewCallbacks = require("can-view-callbacks");
var nodeLists = require("can-view-nodelist");
var canReflect = require("can-reflect");
var observeReader = require("can-stache-key");
var SettableObservable = require("can-simple-observable/setter/setter");
var SimpleObservable = require("can-simple-observable");
var SimpleMap = require("can-simple-map");
var DefineMap = require("can-define/map/map");
var canLog = require('can-log');
var canDev = require('can-log/dev/dev');
var assign = require('can-assign');
var ObservationRecorder = require("can-observation-recorder");
var queues = require("can-queues");
var domData = require('can-dom-data-state');
var getChildNodes = require('can-child-nodes');
var string = require("can-string");
var domEvents = require('can-dom-events');
var domMutate = require('can-dom-mutate');
var domMutateNode = require('can-dom-mutate/node');
var canSymbol = require('can-symbol');
var DOCUMENT = require('can-globals/document/document');

var ComponentControl = require("./control/control");

// #### Side effects

require('can-view-model');
// DefineList must be imported so Arrays on the ViewModel
// will be converted to DefineLists automatically
require("can-define/list/list");

// Makes sure bindings are added simply by importing component.
stache.addBindings(stacheBindings);

// #### Symbols
var createdByCanComponentSymbol = canSymbol("can.createdByCanComponent");
var getValueSymbol = canSymbol.for("can.getValue");
var setValueSymbol = canSymbol.for("can.setValue");
var viewInsertSymbol = canSymbol.for("can.viewInsert");
var viewModelSymbol = canSymbol.for('can.viewModel');


// ## Helpers
var noop = function(){};
// ### addContext
// For replacement elements like `<can-slot>` and `<context>`, this is used to
// figure out what data they should render with.  Slots can have bindings like
// `this:from="value"` or `x:from="y"`.
//
// If `this` is set, a compute is created for the context.
// If variables are set, a variable scope is created.
//
// Arguments:
//
// - el - the insertion element
// - tagData - the tagData the insertion element will be rendered with
// - insertionElementTagData - the tagData found at the insertion element.
//
// Returns: the tagData the template should be rendered with.
function addContext(el, tagData, insertionElementTagData) {
	var vm,
		newScope;

	// Prevent setting up bindings manually.
	domData.set.call(el, "preventDataBindings", true);

	var teardown = stacheBindings.behaviors.viewModel(el, insertionElementTagData,
		// `createViewModel` is used to create the ViewModel that the
		// bindings will operate on.
		function createViewModel(initialData, hasDataBinding, bindingState) {

			if(bindingState && bindingState.isSettingOnViewModel === true) {
				// If we are setting a value like `x:from="y"`,
				// we need to make a variable scope.
				newScope = tagData.scope.addLetContext(initialData);
				return newScope._context;

			} else {
				// If we are setting the ViewModel itself, we
				// stick the value in an observable: `this:from="value"`.
				return vm = new SimpleObservable(initialData);
			}
		}, undefined, true);

	if(!teardown) {
		// If no teardown, there's no bindings, no need to change the scope.
		return tagData;
	} else {
		// Copy `tagData` and overwrite the scope.
		return assign( assign({}, tagData), {
			teardown: teardown,
			scope: newScope || tagData.scope.add(vm)
		});
	}
}

// ### makeReplacementTagCallback
// Returns a `viewCallbacks.tag` function for `<can-slot>` or `<content>`.
// The `replacementTag` function:
// - gets the proper tagData
// - renders it the template
// - adds the rendered result to the page using nodeLists
//
// Arguments:
// - `tagName` - the tagName being created (`"can-slot"`).
// - `componentTagData` - the component's tagData, including its scope.
// - `shadowTagData` - the tagData where the element was found.
// - `leakScope` - how scope is being leaked.
// - `getPrimaryTemplate(el)` - a function to call to get the template to be rendered.
function makeReplacementTagCallback(tagName, componentTagData, shadowTagData, leakScope, getPrimaryTemplate) {

	var options = shadowTagData.options;

	// `replacementTag` is called when `<can-slot>` is found.
	// Arguments:
	// - `el` - the element
	// - `insertionElementTagData` - the tagData where the element was found.
	return function replacementTag(el, insertionElementTagData) {

		// If there's no template to be rendered, we'll render what's inside the
		// element. This is usually default content.
		var template = getPrimaryTemplate(el) || insertionElementTagData.subtemplate,
			// `true` if we are rendering something the user "passed" to this component.
			renderingLightContent = template !== insertionElementTagData.subtemplate;

		// If there's no template and no default content, we will do nothing. If
		// there is a template to render, lets render it!
		if (template) {

			// It's possible that rendering the contents of a `<can-slot>` will end up
			// rendering another `<can-slot>`.  We should make sure we can't render ourselves.
			delete options.tags[tagName];

			// First, lets figure out what we should be rendering
			// the template with.
			var tagData;

			// If we are rendering something the user passed.
			if( renderingLightContent ) {

				if(leakScope.toLightContent) {
					// We want to render with the same scope as the
					// `insertionElementTagData.scope`, but we don't want the
					// TemplateContext of the component's view included.
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
				// We are rendering default content so this content should
				// use the same scope as the <content> tag was found within.
				tagData = addContext(el, insertionElementTagData, insertionElementTagData);
			}


			// Now we need to render the right template and insert its result in the page.
			// We need to teardown any bindings created too so we create a nodeList
			// to do this.

			var nodeList = nodeLists.register([el],
				tagData.teardown || noop,
				insertionElementTagData.parentNodeList || true,
				insertionElementTagData.directlyNested);

			nodeList.expression = "<can-slot name='"+el.getAttribute('name')+"'/>";

			var frag = template(tagData.scope, tagData.options, nodeList);
			var newNodes = canReflect.toArray( getChildNodes(frag) );
			var oldNodes = nodeLists.update(nodeList, newNodes);
			nodeLists.replace(oldNodes, frag);

			// Restore the proper tag function so it could potentially be used again (as in lists)
			options.tags[tagName] = replacementTag;
		}
	};
}
// ### getSetupFunctionForComponentVM
// This helper function is used to setup a Component when `new Component({viewModel})`
// is called.
// Arguments:
// - `componentInitVM` - The `viewModel` object used to initialize the actual viewModel.
// Returns: A component viewModel setup function.
function getSetupFunctionForComponentVM(componentInitVM) {

	return ObservationRecorder.ignore(function(el, componentTagData, makeViewModel, initialVMData) {
		var bindingContext = {
			element: el,
			scope: componentTagData.scope,
			parentNodeList: componentTagData.parentNodeList,
			viewModel: undefined
		};

		var bindingSettings = {};

		var bindings = [];

		// Loop through all viewModel props and create dataBindings.
		canReflect.eachKey(componentInitVM, function(parent, propName) {

			var canGetParentValue = parent != null && !!parent[getValueSymbol];
			var canSetParentValue = parent != null && !!parent[setValueSymbol];

			// If we can get or set the value, then we’ll create a binding
			if (canGetParentValue === true || canSetParentValue) {

				// Create an observable for reading/writing the viewModel
				// even though it doesn't exist yet.
				var child = stacheBindings.getObservableFrom.viewModel({
					name: propName,
				}, bindingContext, bindingSettings);

				// Create the binding similar to what’s in can-stache-bindings
				var canBinding = new Bind({
					child: child,
					parent: parent,
					queue: "domUI",

					//!steal-remove-start
					// For debugging: the names that will be assigned to the updateChild
					// and updateParent functions within can-bind
					updateChildName: "update viewModel." + propName + " of <" + el.nodeName.toLowerCase() + ">",
					updateParentName: "update " + canReflect.getName(parent) + " of <" + el.nodeName.toLowerCase() + ">"
					//!steal-remove-end
				});

				bindings.push({
					binding: canBinding,
					siblingBindingData: {
						parent: {
							source: "scope",
							exports: canGetParentValue
						},
						child: {
							source: "viewModel",
							exports: canSetParentValue,
							name: propName
						}
					}
				});

			} else {
				// Can’t get or set the value, so assume it’s not an observable
				initialVMData[propName] = parent;
			}
		});

		// Initialize the viewModel
		var initializeData = stacheBindings.behaviors.initializeViewModel(bindings, initialVMData, function(properties){
			return bindingContext.viewModel = makeViewModel(properties)
		}, bindingContext);

		// Return a teardown function
		return function() {
			for (var attrName in initializeData.onTeardowns) {
				initializeData.onTeardowns[attrName]();
			}
		};
	});
}

var Component = Construct.extend(

	// ## Static
	{
		// ### setup
		//
		// When a component is extended, this sets up the component's internal constructor
		// functions and views for later fast initialization.
		// jshint maxdepth:6
		setup: function() {
			Construct.setup.apply(this, arguments);

			// When `Component.setup` function is ran for the first time, `Component` doesn't exist yet
			// which ensures that the following code is ran only in constructors that extend `Component`.
			if (Component) {
				var self = this;

				// Define a control using the `events` prototype property.
				if(this.prototype.events !== undefined && canReflect.size(this.prototype.events) !== 0) {
					this.Control = ComponentControl.extend(this.prototype.events);
				}

				//!steal-remove-start
				if (process.env.NODE_ENV !== 'production') {
					// If a constructor is assigned to the viewModel, give a warning
					if (this.prototype.viewModel && canReflect.isConstructorLike(this.prototype.viewModel)) {
						canDev.warn("can-component: Assigning a DefineMap or constructor type to the viewModel property may not be what you intended. Did you mean ViewModel instead? More info: https://canjs.com/doc/can-component.prototype.ViewModel.html");
					}
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
						this.ViewModel = DefineMap.extend(vmName, {}, this.prototype.ViewModel);
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
								if (process.env.NODE_ENV !== 'production') {
									canLog.warn("can-component: "+this.prototype.tag+" is sharing a single map across all component instances");
								}
								//!steal-remove-end
								this.viewModelInstance = protoViewModel;
							} else {
								canLog.warn("can-component: "+this.prototype.tag+" is extending the viewModel into a can-simple-map");
								this.ViewModel = SimpleMap.extend(vmName,{},protoViewModel);
							}
						}
					} else {
						this.ViewModel = SimpleMap.extend(vmName,{},{});
					}
				}

				// Convert the template into a renderer function.
				if (this.prototype.template) {
					//!steal-remove-start
					if (process.env.NODE_ENV !== 'production') {
						canLog.warn('can-component.prototype.template: is deprecated and will be removed in a future release. Use can-component.prototype.view');
					}
					//!steal-remove-end
					this.renderer = this.prototype.template;
				}
				if (this.prototype.view) {
					this.renderer = this.prototype.view;
				}

				// default to stache if renderer is a string
				if (typeof this.renderer === "string") {
					var viewName = string.capitalize( string.camelize(this.prototype.tag) )+"View";
					this.renderer = stache(viewName, this.renderer);
				}

				this.view = this.renderer;

				var renderComponent = function(el, tagData) {
					// Check if a symbol already exists on the element; if it does, then
					// a new instance of the component has already been created
					if (el[createdByCanComponentSymbol] === undefined) {
						new self(el, tagData);
					}
				};

				//!steal-remove-start
				if (process.env.NODE_ENV !== 'production') {
					Object.defineProperty(renderComponent, "name",{
						value: "render <"+this.prototype.tag+">",
						configurable: true
					});
					renderComponent = queues.runAsTask(renderComponent, function(el, tagData) {
						return ["Rendering", el, "with",tagData.scope];
					});
				}
				//!steal-remove-end

				// Register this component to be created when its `tag` is found.
				viewCallbacks.tag(this.prototype.tag, renderComponent);
			}
		}
	}, {
		// ## Prototype
		// ### setup
		// When a new component instance is created, setup bindings, render the view, etc.
		setup: function(el, componentTagData) {
			this._initialArgs = [el,componentTagData];
			var component = this;
			var options = {
				helpers: {},
				tags: {}
			};
			// If a view is not provided, we fall back to
			// dynamic scoping regardless of settings.

			// If componentTagData isn’t defined, check for el and use it if it’s defined;
			// otherwise, an empty object is needed for componentTagData.
			if (componentTagData === undefined) {
				if (el === undefined) {
					componentTagData = {};
				} else {
					componentTagData = el;
					el = undefined;
				}
			}

			// Create an element if it doesn’t exist and make it available outside of this
			if (el === undefined) {
				el = DOCUMENT().createElement(this.tag);
				el[createdByCanComponentSymbol] = true;
			}
			this.element = el;

			// Hook up any <content> with which the component was instantiated
			var componentContent = componentTagData.content;
			if (componentContent !== undefined) {
				// Check if it’s already a renderer function or
				// a string that needs to be parsed by stache
				if (typeof componentContent === "function") {
					componentTagData.subtemplate = componentContent;
				} else if (typeof componentContent === "string") {
					componentTagData.subtemplate = stache(componentContent);
				}
			}

			// Check for the component being instantiated with a scope
			var componentScope = componentTagData.scope;
			if (componentScope !== undefined && componentScope instanceof Scope === false) {
				componentTagData.scope = new Scope(componentScope);
			}

			// Hook up any templates with which the component was instantiated
			var componentTemplates = componentTagData.templates;
			if (componentTemplates !== undefined) {
				canReflect.eachKey(componentTemplates, function(template, name) {
					// Check if it’s a string that needs to be parsed by stache
					if (typeof template === "string") {
						var debugName = name + " template";
						componentTemplates[name] = stache(debugName, template);
					}
				});
			}

			// an array of teardown stuff that should happen when the element is removed
			var teardownFunctions = [];
			var initialViewModelData = {};
			var callTeardownFunctions = function() {
					for (var i = 0, len = teardownFunctions.length; i < len; i++) {
						teardownFunctions[i]();
					}
				};
			var preventDataBindings = domData.get.call(el, "preventDataBindings");
			var viewModel, frag;

			// ## Scope
			var teardownBindings;
			if (preventDataBindings) {
				viewModel = el[viewModelSymbol];
			} else {// Set up the bindings
				var setupFn;
				if (componentTagData.setupBindings) {
					setupFn = function(el, componentTagData, callback, initialViewModelData){
						return componentTagData.setupBindings(el, callback, initialViewModelData);
					};
				} else if (componentTagData.viewModel) {
					// Component is being instantiated with a viewModel
					setupFn = getSetupFunctionForComponentVM(componentTagData.viewModel);
				} else {
					setupFn = stacheBindings.behaviors.viewModel;
				}
				teardownBindings = setupFn(el, componentTagData, function(initialViewModelData) {

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
							// Otherwise extend `SimpleMap` with the `scopeResult` and initialize it with the `initialViewModelData`
							ViewModel = SimpleMap.extend(scopeResult);
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

			el[viewModelSymbol] = viewModel;
			el.viewModel = viewModel;
			domData.set.call(el, "preventDataBindings", true);

			// ## Helpers

			// Setup helpers to callback with `this` as the component
			if(this.helpers !== undefined) {
				canReflect.eachKey(this.helpers, function(val, prop) {
					if (typeof val === "function") {
						options.helpers[prop] = val.bind(viewModel);
					}
				});
			}


			// ## `events` control

			// Create a control to listen to events
			if(this.constructor.Control) {
				this._control = new this.constructor.Control(el, {
					// Pass the viewModel to the control so we can listen to it's changes from the controller.
					scope: this.viewModel,
					viewModel: this.viewModel,
					destroy: callTeardownFunctions
				});
			} else {
				var removalDisposal = domMutate.onNodeRemoval(el, function () {
					var doc = el.ownerDocument;
					var rootNode = doc.contains ? doc : doc.documentElement;
					if (!rootNode || !rootNode.contains(el)) {
						removalDisposal();
						callTeardownFunctions();
					}
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
						scope: componentTagData.scope.add(this.viewModel, { viewModel: true }),
						options: options
					};

				} else { // lexical
					// only give access to the VM
					shadowTagData = {
						scope: new Scope(this.viewModel, null, { viewModel: true }),
						options: options
					};
				}

				// Add a hookup for each <can-slot>
				options.tags['can-slot'] = makeReplacementTagCallback('can-slot', componentTagData, shadowTagData, leakScope, function(el) {
					var templates = componentTagData.templates;
					if (templates) {// This is undefined if the component is <self-closing/>
						return templates[el.getAttribute("name")];
					}
				});

				// Add a hookup for <content>
				options.tags.content = makeReplacementTagCallback('content',  componentTagData, shadowTagData, leakScope, function() {
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
					options: options
				};
				betweenTagsTagData = lightTemplateTagData;
				betweenTagsRenderer = componentTagData.subtemplate || el.ownerDocument.createDocumentFragment.bind(el.ownerDocument);
			}
			var disconnectedCallback,
				componentInPage;

			// Keep a nodeList so we can kill any directly nested nodeLists within this component
			var nodeList = nodeLists.register([], function() {
				component._torndown = true;
				domEvents.dispatch(el, "beforeremove", false);
				if(teardownBindings) {
					teardownBindings();
				}
				if(disconnectedCallback) {
					disconnectedCallback(el);
				} else if(typeof viewModel.stopListening === "function"){
					viewModel.stopListening();
				}
			}, componentTagData.parentNodeList || true, false);
			nodeList.expression = "<" + this.tag + ">";
			teardownFunctions.push(function() {
				nodeLists.unregister(nodeList);
			});
			this.nodeList = nodeList;

			frag = betweenTagsRenderer(betweenTagsTagData.scope, betweenTagsTagData.options, nodeList);

			// Append the resulting document fragment to the element
			domMutateNode.appendChild.call(el, frag);

			// update the nodeList with the new children so the mapping gets applied
			nodeLists.update(nodeList, getChildNodes(el));

			if(viewModel && viewModel.connectedCallback) {
				componentInPage = DOCUMENT().body.contains(el);

				if(componentInPage) {
					disconnectedCallback = viewModel.connectedCallback(el);
				} else {
					var insertionDisposal = domMutate.onNodeInsertion(el, function () {
						insertionDisposal();
						disconnectedCallback = viewModel.connectedCallback(el);
					});
				}

			}
			component._torndown = false;
		}
	});

// This adds support for components being rendered as values in stache templates
Component.prototype[viewInsertSymbol] = function(viewData) {
	if(this._torndown) {
		this.setup.apply(this,this._initialArgs);
	}
	viewData.nodeList.newDeepChildren.push(this.nodeList);
	return this.element;
};

module.exports = namespace.Component = Component;
