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

QUnit.test("Components can be instantiated with templates", function() {
	var ComponentConstructor = Component.extend({
		tag: "new-instantiation",
		view: "Hello {{message}} {{>message-input}}",
		ViewModel: {
			message: {default: "world"}
		}
	});

	var componentInstance = new ComponentConstructor({
		templates: {
			"message-input": "<input value:bind='message' />"
		}
	});

	// Basics look correct
	var element = componentInstance.element;
	var inputElement = element.querySelector("input");
	QUnit.ok(inputElement, "template rendered");
	QUnit.equal(inputElement.value, "world", "input has correct value");

	// Updating the viewModel should update the template
	var viewModel = componentInstance.viewModel;
	viewModel.message = "mundo";
	QUnit.equal(element.textContent, "Hello mundo ", "element has correct text content after updating viewModel");
	QUnit.equal(inputElement.value, "mundo", "input has correct value after updating viewModel");
});
