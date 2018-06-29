var Bind = require("can-bind");
var Component = require("can-component");
var helpers = require("./helpers");
var QUnit = require("steal-qunit");
var SimpleMap = require("can-simple-map");
var stache = require("can-stache");
var value = require("can-value");

QUnit.module("can-component integration with can-bind");

QUnit.test("Using can-bind in connectedCallback works as documented", function(assert) {
	var done = assert.async();

	// This will be used to count the number of times connectedCallback is called
	var connectedCallbackCallCount = 0;

	// This component is similar to what’s shown as an example in can-bind’s docs
	var BindComponent = Component.extend({
		tag: "bind-component",
		view: "{{object.prop}}",
		ViewModel: {
			eventualProp: {
				default: undefined
			},
			object: {
				default: function() {
					return new SimpleMap({
						prop: 15
					});
				}
			},
			connectedCallback: function() {
				connectedCallbackCallCount += 1;
				var binding = new Bind({
					parent: value.from(this, "eventualProp"),
					child: value.to(this, "object.prop")
				});
				binding.start();
				return binding.stop.bind(binding);
			}
		}
	});

	// Create a new instance of our component
	var componentInstance = new BindComponent({});
	var element = componentInstance.element;
	var viewModel = componentInstance.viewModel;

	// Initial component values are correct
	assert.equal(viewModel.object.get("prop"), 15, "view model prop starts off with initial value");

	// Insert the component into the page; connectedCallback will run
	var fixture = document.getElementById("qunit-fixture");
	fixture.appendChild(element);
	helpers.afterMutation(function() {

		// Because this is a one-way parent-to-child binding, the child will be set
		// to the parent’s value (undefined)
		assert.equal(viewModel.object.get("prop"), undefined, "binding updates view model prop");

		// When the eventualProp (parent) changes, the object.prop (child) should be updated
		viewModel.eventualProp = 22;
		assert.equal(viewModel.object.get("prop"), 22, "new value for one prop updates the other");

		// Check to make sure connectedCallback was only called once
		assert.equal(connectedCallbackCallCount, 1, "connectedCallback only called once");

		// Clean up
		fixture.removeChild(element);

		done();
	});
});
