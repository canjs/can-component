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
		_action: function(methodName, options, controlInstance) {
			var hasObjectLookup, readyCompute;

			paramReplacer.lastIndex = 0;

			hasObjectLookup = paramReplacer.test(methodName);

			// If we don't have options (a `control` instance), we'll run this
			// later.
			if (!controlInstance && hasObjectLookup) {
				return;
			} else if (!hasObjectLookup) {
				return Control._action.apply(this, arguments);
			} else {
				// We have `hasObjectLookup` and `controlInstance`.

				readyCompute = canCompute(function() {
					var delegate;

					// Set the delegate target and get the name of the event we're listening to.
					var name = methodName.replace(paramReplacer, function(matched, key) {
						var value;

						// If we are listening directly on the `viewModel` set it as a delegate target.
						if (key === "scope" || key === "viewModel") {
							delegate = options.viewModel;
							return "";
						}

						// Remove `viewModel.` from the start of the key and read the value from the `viewModel`.
						key = key.replace(/^(scope|^viewModel)\./, "");
						value = observeReader.read(options.viewModel, observeReader.reads(key), {
							// if we find a compute, we should bind on that and not read it
							readCompute: false
						}).value;

						// If `value` is undefined use `string.getObject` to get the value.
						if (value === undefined) {
							value = string.getObject(key);
						}

						// If `value` is a string we just return it, otherwise we set it as a delegate target.
						if (typeof value === "string") {
							return value;
						} else {
							delegate = value;
							return "";
						}

					});

					// Get the name of the `event` we're listening to.
					var parts = name.split(/\s+/g),
						event = parts.pop();

					// Return everything needed to handle the event we're listening to.
					return {
						processor: this.processors[event] || this.processors.click,
						parts: [name, parts.join(" "), event],
						delegate: delegate || undefined
					};

				}, this);

				// Create a handler function that we'll use to handle the `change` event on the `readyCompute`.
				var handler = function(ev, ready) {
					// unbinds the old binding
					controlInstance._bindings.control[methodName](controlInstance.element);
					// binds the new
					controlInstance._bindings.control[methodName] = ready.processor(
						ready.delegate || controlInstance.element,
						ready.parts[2], ready.parts[1], methodName, controlInstance);
				};

				readyCompute.bind("change", handler);

				controlInstance._bindings.readyComputes[methodName] = {
					compute: readyCompute,
					handler: handler
				};

				return readyCompute();
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
