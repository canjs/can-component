/*can-component@3.0.0-pre.2#control/control*/
define(function (require, exports, module) {
    var Control = require('can-control');
    var canEach = require('can-util/js/each');
    var string = require('can-util/js/string');
    var canCompute = require('can-compute');
    var observeReader = require('can-observe-info/reader');
    var paramReplacer = /\{([^\}]+)\}/g;
    var ComponentControl = Control.extend({
        _lookup: function (options) {
            return [
                options.scope,
                options,
                window
            ];
        },
        _action: function (methodName, options, controlInstance) {
            var hasObjectLookup, readyCompute;
            paramReplacer.lastIndex = 0;
            hasObjectLookup = paramReplacer.test(methodName);
            if (!controlInstance && hasObjectLookup) {
                return;
            } else if (!hasObjectLookup) {
                return Control._action.apply(this, arguments);
            } else {
                readyCompute = canCompute(function () {
                    var delegate;
                    var name = methodName.replace(paramReplacer, function (matched, key) {
                        var value;
                        if (key === 'scope' || key === 'viewModel') {
                            delegate = options.viewModel;
                            return '';
                        }
                        key = key.replace(/^(scope|^viewModel)\./, '');
                        value = observeReader.read(options.viewModel, observeReader.reads(key), { readCompute: false }).value;
                        if (value === undefined) {
                            value = string.getObject(key);
                        }
                        if (typeof value === 'string') {
                            return value;
                        } else {
                            delegate = value;
                            return '';
                        }
                    });
                    var parts = name.split(/\s+/g), event = parts.pop();
                    return {
                        processor: this.processors[event] || this.processors.click,
                        parts: [
                            name,
                            parts.join(' '),
                            event
                        ],
                        delegate: delegate || undefined
                    };
                }, this);
                var handler = function (ev, ready) {
                    controlInstance._bindings.control[methodName](controlInstance.element);
                    controlInstance._bindings.control[methodName] = ready.processor(ready.delegate || controlInstance.element, ready.parts[2], ready.parts[1], methodName, controlInstance);
                };
                readyCompute.bind('change', handler);
                controlInstance._bindings.readyComputes[methodName] = {
                    compute: readyCompute,
                    handler: handler
                };
                return readyCompute();
            }
        }
    }, {
        setup: function (el, options) {
            this.scope = options.scope;
            this.viewModel = options.viewModel;
            return Control.prototype.setup.call(this, el, options);
        },
        off: function () {
            if (this._bindings) {
                canEach(this._bindings.readyComputes || {}, function (value) {
                    value.compute.unbind('change', value.handler);
                });
            }
            Control.prototype.off.apply(this, arguments);
            this._bindings.readyComputes = {};
        },
        destroy: function () {
            Control.prototype.destroy.apply(this, arguments);
            if (typeof this.options.destroy === 'function') {
                this.options.destroy.apply(this, arguments);
            }
        }
    });
    module.exports = ComponentControl;
});