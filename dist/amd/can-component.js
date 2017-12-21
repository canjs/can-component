/*can-component@3.3.7#can-component*/
define([
    'require',
    'exports',
    'module',
    './control/control',
    'can-namespace',
    'can-construct',
    'can-stache-bindings',
    'can-view-scope',
    'can-view-callbacks',
    'can-view-nodelist',
    'can-compute',
    'can-util/dom/data',
    'can-util/dom/mutate',
    'can-util/dom/child-nodes',
    'can-util/dom/dispatch',
    'can-types',
    'can-util/js/string',
    'can-reflect',
    'can-util/js/each',
    'can-util/js/assign',
    'can-util/js/is-function',
    'can-util/js/log',
    'can-util/js/dev',
    'can-util/js/make-array',
    'can-util/js/is-empty-object',
    'can-util/dom/events/inserted',
    'can-util/dom/events/removed',
    'can-view-model'
], function (require, exports, module) {
    var ComponentControl = require('./control/control');
    var namespace = require('can-namespace');
    var Construct = require('can-construct');
    var stacheBindings = require('can-stache-bindings');
    var Scope = require('can-view-scope');
    var viewCallbacks = require('can-view-callbacks');
    var nodeLists = require('can-view-nodelist');
    var compute = require('can-compute');
    var domData = require('can-util/dom/data');
    var domMutate = require('can-util/dom/mutate');
    var getChildNodes = require('can-util/dom/child-nodes');
    var domDispatch = require('can-util/dom/dispatch');
    var types = require('can-types');
    var string = require('can-util/js/string');
    var canReflect = require('can-reflect');
    var canEach = require('can-util/js/each');
    var assign = require('can-util/js/assign');
    var isFunction = require('can-util/js/is-function');
    var canLog = require('can-util/js/log');
    var canDev = require('can-util/js/dev');
    var makeArray = require('can-util/js/make-array');
    var isEmptyObject = require('can-util/js/is-empty-object');
    require('can-util/dom/events/inserted');
    require('can-util/dom/events/removed');
    require('can-view-model');
    function addContext(el, tagData, insertionElementTagData) {
        var vm;
        domData.set.call(el, 'preventDataBindings', true);
        var teardown = stacheBindings.behaviors.viewModel(el, insertionElementTagData, function (initialData) {
            return vm = compute(initialData);
        }, undefined, true);
        if (!teardown) {
            return tagData;
        } else {
            return assign(assign({}, tagData), {
                teardown: teardown,
                scope: tagData.scope.add(vm)
            });
        }
    }
    function makeInsertionTagCallback(tagName, componentTagData, shadowTagData, leakScope, getPrimaryTemplate) {
        var options = shadowTagData.options._context;
        return function hookupFunction(el, insertionElementTagData) {
            var template = getPrimaryTemplate(el) || insertionElementTagData.subtemplate, renderingLightContent = template !== insertionElementTagData.subtemplate;
            if (template) {
                delete options.tags[tagName];
                var tagData;
                if (renderingLightContent) {
                    if (leakScope.toLightContent) {
                        tagData = addContext(el, {
                            scope: insertionElementTagData.scope.cloneFromRef(),
                            options: insertionElementTagData.options
                        }, insertionElementTagData);
                    } else {
                        tagData = addContext(el, componentTagData, insertionElementTagData);
                    }
                } else {
                    tagData = addContext(el, insertionElementTagData, insertionElementTagData);
                }
                var nodeList = nodeLists.register([el], function () {
                    if (tagData.teardown) {
                        tagData.teardown();
                    }
                }, insertionElementTagData.parentNodeList || true, false);
                nodeList.expression = '<can-slot name=\'' + el.getAttribute('name') + '\'/>';
                var frag = template(tagData.scope, tagData.options, nodeList);
                var newNodes = makeArray(getChildNodes(frag));
                nodeLists.replace(nodeList, frag);
                nodeLists.update(nodeList, newNodes);
                options.tags[tagName] = hookupFunction;
            }
        };
    }
    var Component = Construct.extend({
        setup: function () {
            Construct.setup.apply(this, arguments);
            if (Component) {
                var self = this;
                if (!isEmptyObject(this.prototype.events)) {
                    this.Control = ComponentControl.extend(this.prototype.events);
                }
                var protoViewModel = this.prototype.viewModel || this.prototype.scope;
                if (protoViewModel && this.prototype.ViewModel) {
                    throw new Error('Cannot provide both a ViewModel and a viewModel property');
                }
                var vmName = string.capitalize(string.camelize(this.prototype.tag)) + 'VM';
                if (this.prototype.ViewModel) {
                    if (typeof this.prototype.ViewModel === 'function') {
                        this.ViewModel = this.prototype.ViewModel;
                    } else {
                        this.ViewModel = types.DefaultMap.extend(vmName, this.prototype.ViewModel);
                    }
                } else {
                    if (protoViewModel) {
                        if (typeof protoViewModel === 'function') {
                            if (canReflect.isObservableLike(protoViewModel.prototype) && canReflect.isMapLike(protoViewModel.prototype)) {
                                this.ViewModel = protoViewModel;
                            } else {
                                this.viewModelHandler = protoViewModel;
                            }
                        } else {
                            if (canReflect.isObservableLike(protoViewModel) && canReflect.isMapLike(protoViewModel)) {
                                this.viewModelInstance = protoViewModel;
                            } else {
                                this.ViewModel = types.DefaultMap.extend(vmName, protoViewModel);
                            }
                        }
                    } else {
                        this.ViewModel = types.DefaultMap.extend(vmName, {});
                    }
                }
                if (this.prototype.template) {
                    this.renderer = this.prototype.template;
                }
                if (this.prototype.view) {
                    this.renderer = this.prototype.view;
                }
                viewCallbacks.tag(this.prototype.tag, function (el, options) {
                    new self(el, options);
                });
            }
        }
    }, {
        setup: function (el, componentTagData) {
            var component = this;
            var teardownFunctions = [];
            var initialViewModelData = {};
            var callTeardownFunctions = function () {
                for (var i = 0, len = teardownFunctions.length; i < len; i++) {
                    teardownFunctions[i]();
                }
            };
            var setupBindings = !domData.get.call(el, 'preventDataBindings');
            var viewModel, frag;
            var teardownBindings;
            if (setupBindings) {
                var setupFn = componentTagData.setupBindings || function (el, callback, data) {
                    return stacheBindings.behaviors.viewModel(el, componentTagData, callback, data);
                };
                teardownBindings = setupFn(el, function (initialViewModelData) {
                    var ViewModel = component.constructor.ViewModel, viewModelHandler = component.constructor.viewModelHandler, viewModelInstance = component.constructor.viewModelInstance;
                    if (viewModelHandler) {
                        var scopeResult = viewModelHandler.call(component, initialViewModelData, componentTagData.scope, el);
                        if (canReflect.isObservableLike(scopeResult) && canReflect.isMapLike(scopeResult)) {
                            viewModelInstance = scopeResult;
                        } else if (canReflect.isObservableLike(scopeResult.prototype) && canReflect.isMapLike(scopeResult.prototype)) {
                            ViewModel = scopeResult;
                        } else {
                            ViewModel = types.DefaultMap.extend(scopeResult);
                        }
                    }
                    if (ViewModel) {
                        viewModelInstance = new component.constructor.ViewModel(initialViewModelData);
                    }
                    viewModel = viewModelInstance;
                    return viewModelInstance;
                }, initialViewModelData);
            }
            this.viewModel = viewModel;
            domData.set.call(el, 'viewModel', viewModel);
            domData.set.call(el, 'preventDataBindings', true);
            var options = {
                helpers: {},
                tags: {}
            };
            canEach(this.helpers || {}, function (val, prop) {
                if (isFunction(val)) {
                    options.helpers[prop] = val.bind(viewModel);
                }
            });
            if (this.constructor.Control) {
                this._control = new this.constructor.Control(el, {
                    scope: this.viewModel,
                    viewModel: this.viewModel,
                    destroy: callTeardownFunctions
                });
            }
            var leakScope = {
                toLightContent: this.leakScope === true,
                intoShadowContent: this.leakScope === true
            };
            var hasShadowTemplate = !!this.constructor.renderer;
            var betweenTagsRenderer;
            var betweenTagsTagData;
            if (hasShadowTemplate) {
                var shadowTagData;
                if (leakScope.intoShadowContent) {
                    shadowTagData = {
                        scope: componentTagData.scope.add(new Scope.Refs()).add(this.viewModel, { viewModel: true }),
                        options: componentTagData.options.add(options)
                    };
                } else {
                    shadowTagData = {
                        scope: Scope.refsScope().add(this.viewModel, { viewModel: true }),
                        options: new Scope.Options(options)
                    };
                }
                options.tags['can-slot'] = makeInsertionTagCallback('can-slot', componentTagData, shadowTagData, leakScope, function (el) {
                    return componentTagData.templates[el.getAttribute('name')];
                });
                options.tags.content = makeInsertionTagCallback('content', componentTagData, shadowTagData, leakScope, function () {
                    return componentTagData.subtemplate;
                });
                betweenTagsRenderer = this.constructor.renderer;
                betweenTagsTagData = shadowTagData;
            } else {
                var lightTemplateTagData = {
                    scope: componentTagData.scope.add(this.viewModel, { viewModel: true }),
                    options: componentTagData.options.add(options)
                };
                betweenTagsTagData = lightTemplateTagData;
                betweenTagsRenderer = componentTagData.subtemplate || el.ownerDocument.createDocumentFragment.bind(el.ownerDocument);
            }
            var nodeList = nodeLists.register([], function () {
                domDispatch.call(el, 'beforeremove', [], false);
                if (teardownBindings) {
                    teardownBindings();
                }
            }, componentTagData.parentNodeList || true, false);
            nodeList.expression = '<' + this.tag + '>';
            teardownFunctions.push(function () {
                nodeLists.unregister(nodeList);
            });
            frag = betweenTagsRenderer(betweenTagsTagData.scope, betweenTagsTagData.options, nodeList);
            domMutate.appendChild.call(el, frag);
            nodeLists.update(nodeList, getChildNodes(el));
        }
    });
    module.exports = namespace.Component = Component;
});