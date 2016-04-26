/*can-component@3.0.0-pre.0#can-component*/
define(function (require, exports, module) {
    var ComponentControl = require('./control/control');
    var Construct = require('can-construct');
    var CanMap = require('can-map');
    var stache = require('can-stache');
    var stacheBindings = require('can-stache-bindings');
    var Scope = require('can-view-scope');
    var viewCallbacks = require('can-view-callbacks');
    var nodeLists = require('can-view-nodelist');
    var domData = require('can-util/dom/data');
    var domMutate = require('can-util/dom/mutate');
    var getChildNodes = require('can-util/dom/child-nodes');
    var domDispatch = require('can-util/dom/dispatch');
    var canEach = require('can-util/js/each');
    var string = require('can-util/js/string');
    var isFunction = require('can-util/js/is-function');
    var dev = require('can-util/js/dev');
    require('can-util/dom/events/inserted');
    require('can-util/dom/events/removed');
    require('can-view-model');
    var Component = Construct.extend({
        setup: function () {
            Construct.setup.apply(this, arguments);
            if (Component) {
                var self = this, protoViewModel = this.prototype.scope || this.prototype.viewModel;
                this.Control = ComponentControl.extend(this.prototype.events);
                if (!protoViewModel || typeof protoViewModel === 'object' && !(protoViewModel instanceof CanMap)) {
                    this.Map = CanMap.extend(protoViewModel || {});
                } else if (protoViewModel.prototype instanceof CanMap) {
                    this.Map = protoViewModel;
                }
                this.attributeScopeMappings = {};
                canEach(this.Map ? this.Map.defaults : {}, function (val, prop) {
                    if (val === '@') {
                        self.attributeScopeMappings[prop] = prop;
                    }
                });
                if (this.prototype.template) {
                    if (typeof this.prototype.template === 'function') {
                        this.renderer = this.prototype.template;
                    } else {
                        this.renderer = stache(this.prototype.template);
                    }
                }
                viewCallbacks.tag(this.prototype.tag, function (el, options) {
                    new self(el, options);
                });
            }
        }
    }, {
        setup: function (el, componentTagData) {
            var initialViewModelData = {}, component = this, lexicalContent = (typeof this.leakScope === 'undefined' ? false : !this.leakScope) && !!this.template, viewModel, frag, teardownFunctions = [], callTeardownFunctions = function () {
                    for (var i = 0, len = teardownFunctions.length; i < len; i++) {
                        teardownFunctions[i]();
                    }
                }, setupBindings = !domData.get.call(el, 'preventDataBindings');
            canEach(this.constructor.attributeScopeMappings, function (val, prop) {
                initialViewModelData[prop] = el.getAttribute(string.hyphenate(val));
            });
            var teardownBindings;
            if (setupBindings) {
                teardownBindings = stacheBindings.behaviors.viewModel(el, componentTagData, function (initialViewModelData) {
                    initialViewModelData['%root'] = componentTagData.scope.attr('%root');
                    var protoViewModel = component.scope || component.viewModel;
                    if (component.constructor.Map) {
                        viewModel = new component.constructor.Map(initialViewModelData);
                    } else if (protoViewModel instanceof CanMap) {
                        viewModel = protoViewModel;
                    } else if (typeof protoViewModel === 'function') {
                        var scopeResult = protoViewModel.call(component, initialViewModelData, componentTagData.scope, el);
                        if (scopeResult instanceof CanMap) {
                            viewModel = scopeResult;
                        } else if (scopeResult.prototype instanceof CanMap) {
                            viewModel = new scopeResult(initialViewModelData);
                        } else {
                            viewModel = new (CanMap.extend(scopeResult))(initialViewModelData);
                        }
                    }
                    var oldSerialize = viewModel.serialize;
                    viewModel.serialize = function () {
                        var result = oldSerialize.apply(this, arguments);
                        delete result['%root'];
                        return result;
                    };
                    return viewModel;
                }, initialViewModelData);
            }
            this.scope = this.viewModel = viewModel;
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
            canEach(this.simpleHelpers || {}, function (val, prop) {
                addHelper(prop, stache.simpleHelper(val));
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
    module.exports = Component;
});