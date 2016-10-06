/*can-component@3.0.0-pre.18#can-component*/
define(function (require, exports, module) {
    var ComponentControl = require('./control/control');
    var namespace = require('can-util/namespace');
    var Construct = require('can-construct');
    var stacheBindings = require('can-stache-bindings');
    var Scope = require('can-view-scope');
    var viewCallbacks = require('can-view-callbacks');
    var nodeLists = require('can-view-nodelist');
    var domData = require('can-util/dom/data');
    var domMutate = require('can-util/dom/mutate');
    var getChildNodes = require('can-util/dom/child-nodes');
    var domDispatch = require('can-util/dom/dispatch');
    var types = require('can-util/js/types');
    var string = require('can-util/js/string');
    var canEach = require('can-util/js/each');
    var isFunction = require('can-util/js/is-function');
    require('can-util/dom/events/inserted');
    require('can-util/dom/events/removed');
    require('can-view-model');
    var Component = Construct.extend({
        setup: function () {
            Construct.setup.apply(this, arguments);
            if (Component) {
                var self = this;
                this.Control = ComponentControl.extend(this.prototype.events);
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
                            if (types.isMapLike(protoViewModel.prototype)) {
                                this.ViewModel = protoViewModel;
                            } else {
                                this.viewModelHandler = protoViewModel;
                            }
                        } else {
                            if (types.isMapLike(protoViewModel)) {
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
            var lexicalContent = (typeof this.leakScope === 'undefined' ? true : !this.leakScope) && !!(this.template || this.view);
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
                        if (types.isMapLike(scopeResult)) {
                            viewModelInstance = scopeResult;
                        } else if (types.isMapLike(scopeResult.prototype)) {
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
            var shadowScope;
            if (lexicalContent) {
                shadowScope = Scope.refsScope().add(this.viewModel, { viewModel: true });
            } else {
                shadowScope = (this.constructor.renderer ? componentTagData.scope.add(new Scope.Refs()) : componentTagData.scope).add(this.viewModel, { viewModel: true });
            }
            var options = { helpers: {} }, addHelper = function (name, fn) {
                    options.helpers[name] = function () {
                        return fn.apply(viewModel, arguments);
                    };
                };
            canEach(this.helpers || {}, function (val, prop) {
                if (isFunction(val)) {
                    addHelper(prop, val);
                }
            });
            this._control = new this.constructor.Control(el, {
                scope: this.viewModel,
                viewModel: this.viewModel,
                destroy: callTeardownFunctions
            });
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
            if (this.constructor.renderer) {
                if (!options.tags) {
                    options.tags = {};
                }
                options.tags.content = function contentHookup(el, contentTagData) {
                    var subtemplate = componentTagData.subtemplate || contentTagData.subtemplate, renderingLightContent = subtemplate === componentTagData.subtemplate;
                    if (subtemplate) {
                        delete options.tags.content;
                        var lightTemplateData;
                        if (renderingLightContent) {
                            if (lexicalContent) {
                                lightTemplateData = componentTagData;
                            } else {
                                lightTemplateData = {
                                    scope: contentTagData.scope.cloneFromRef(),
                                    options: contentTagData.options
                                };
                            }
                        } else {
                            lightTemplateData = contentTagData;
                        }
                        if (contentTagData.parentNodeList) {
                            var frag = subtemplate(lightTemplateData.scope, lightTemplateData.options, contentTagData.parentNodeList);
                            nodeLists.replace([el], frag);
                        } else {
                            nodeLists.replace([el], subtemplate(lightTemplateData.scope, lightTemplateData.options));
                        }
                        options.tags.content = contentHookup;
                    }
                };
                frag = this.constructor.renderer(shadowScope, componentTagData.options.add(options), nodeList);
            } else {
                frag = componentTagData.subtemplate ? componentTagData.subtemplate(shadowScope, componentTagData.options.add(options), nodeList) : document.createDocumentFragment();
            }
            domMutate.appendChild.call(el, frag);
            nodeLists.update(nodeList, getChildNodes(el));
        }
    });
    viewCallbacks.tag('content', function (el, tagData) {
        return tagData.scope;
    });
    module.exports = namespace.Component = Component;
});