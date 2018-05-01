var Component = require("can-component");
var DefineMap = require("can-define/map/map");
var QUnit = require("steal-qunit");
var stache = require("can-stache");

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

QUnit.test("Components can be instantiated with <content> - no scope", function() {
	var ComponentConstructor = Component.extend({
		tag: "new-instantiation-content-no-scope",
		view: "Hello <content>{{message}}</content>",
		ViewModel: {
			message: {default: "world"}
		}
	});

	var componentInstance = new ComponentConstructor({
		content: stache("<em>mundo</em>")
	});
	var element = componentInstance.element;

	// Basics look correct
	QUnit.equal(element.innerHTML, "Hello <em>mundo</em>", "content is rendered");
});

QUnit.test("Components can be instantiated with <content> - with plain content and scope", function() {
	var ComponentConstructor = Component.extend({
		tag: "new-instantiation-plain-content-and-scope",
		view: "Hello <content>{{message}}</content>",
		ViewModel: {
			message: {default: "world"}
		}
	});

	var componentInstance = new ComponentConstructor({
		content: "<em>{{message}}</em>",
		scope: {
			message: "mundo"
		}
	});
	var element = componentInstance.element;

	// Basics look correct
	QUnit.equal(element.innerHTML, "Hello <em>mundo</em>", "content is rendered");
});

QUnit.test("Components can be instantiated with <content> - with scope - leakScope false", function() {
	var ComponentConstructor = Component.extend({
		leakScope: false,
		tag: "new-instantiation-content-leakscope-false",
		view: "Hello <content>{{message}}</content>",
		ViewModel: {
			message: {default: "world"}
		}
	});

	var scopeVM = new DefineMap({});
	var componentInstance = new ComponentConstructor({
		content: "<em>{{message}}</em>",
		scope: scopeVM
	});
	var element = componentInstance.element;

	// Start off without the key defined in the scope; with leakScope false,
	// no message will be rendered
	QUnit.equal(element.innerHTML, "Hello <em></em>", "content is rendered with the provided scope");

	// Set the key in the scope; now a message will be rendered
	scopeVM.set("message", "mundo");
	QUnit.equal(element.innerHTML, "Hello <em>mundo</em>", "content updates with the provided scope");
});

QUnit.test("Components can be instantiated with <content> - with scope - leakScope true", function() {
	var ComponentConstructor = Component.extend({
		leakScope: true,
		tag: "new-instantiation-content-leakscope-true",
		view: "Hello <content>{{message}}</content>",
		ViewModel: {
			message: {default: "world"}
		}
	});

	var componentInstance = new ComponentConstructor({
		content: "<em>{{scope.find('message')}}</em>",
		scope: {
			message: "mundo"
		}
	});
	var element = componentInstance.element;

	// leakScope works
	QUnit.equal(element.innerHTML, "Hello <em>world</em>", "content is rendered with the component’s scope");
});

QUnit.test("Components can be instantiated with templates", function() {
	var ComponentConstructor = Component.extend({
		tag: "new-instantiation-templates",
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
