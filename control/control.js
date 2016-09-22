var Control = require("can-control");

var canEach = require('can-util/js/each/each');
var string = require('can-util/js/string/string');
var canCompute = require("can-compute");
var observeReader = require('can-observation/reader/reader');

// ## Helpers
// Attribute names to ignore for setting viewModel values.
var paramReplacer = /\{([^\}]+)\}/g;

var ComponentControl = Control.extend({
		// Change lookup to first look in the viewModel.
		_lookup: function(options) {
			return [options.scope, options, window];
		},
		// Remove `scope` or `viewModel` from key values
		_removeLookupFromKey: function(key) {
			return key.replace(/^(scope|^viewModel)\./, "");
		},
		_inLookup: function(key) {
			return key === 'scope' || key === 'viewModel';
		},
		_action: function(methodName, options, controlInstance) {
			var hasObjectLookup;

			paramReplacer.lastIndex = 0;

			hasObjectLookup = paramReplacer.test(methodName);

			// If we don't have options (a `control` instance), we'll run this later.
			if (!controlInstance && hasObjectLookup) {
				return;
			} else {
				return Control._action.apply(this, arguments);
			}
		}
	},
	// Extend `events` with a setup method that listens to changes in `viewModel` and
	// rebinds all templated event handlers.
	{
		setup: function(el, options) {
			this.scope = options.scope;
			this.viewModel = options.viewModel;
			return Control.prototype.setup.call(this, el, options);
		},
		off: function() {
			// If `this._bindings` exists we need to go through it's `readyComputes` and manually
			// unbind `change` event listeners set by the controller.
			if (this._bindings) {
				canEach(this._bindings.readyComputes || {}, function(value) {
					value.compute.unbind("change", value.handler);
				});
			}
			// Call `Control.prototype.off` function on this instance to cleanup the bindings.
			Control.prototype.off.apply(this, arguments);
			this._bindings.readyComputes = {};
		},
		destroy: function() {
			Control.prototype.destroy.apply(this, arguments);
			if (typeof this.options.destroy === 'function') {
				this.options.destroy.apply(this, arguments);
			}
		}
	});

module.exports = ComponentControl;
