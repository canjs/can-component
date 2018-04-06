var Component = require("can-component");
var QUnit = require("steal-qunit");

QUnit.module("can-component instantiation");

QUnit.test("Components can be instantiated with new", function() {
	var ComponentConstructor = Component.extend({
		tag: "new-instantiation",
		view: "Hello {{message}}",
		ViewModel: {
			message: "string"
		}
	});

	var componentInstance = new ComponentConstructor();
	var element = componentInstance.element;
	var viewModel = componentInstance.viewModel;

	// Basics look correct
	QUnit.ok(element, "instance has element property");
	QUnit.equal(element.textContent, "Hello ", "element has correct text content");
	QUnit.ok(viewModel, "instance has viewModel property");

	// Updating the viewModel should update the element
	viewModel.message = "world";
	QUnit.equal(element.textContent, "Hello world", "element has correct text content after updating viewModel");
});
