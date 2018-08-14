var Component = require("can-component");
var DefineMap = require("can-define/map/map");
var QUnit = require("steal-qunit");
var SimpleMap = require("can-simple-map");
var stache = require("can-stache");
var value = require("can-value");

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
		view: "<can-slot name='messageInput' />"
	});

	var scopeVM = new DefineMap({
		message: "world"
	});
	var componentInstance = new ComponentConstructor({
		scope: scopeVM,
		templates: {
			messageInput: "<input value:bind='message' />"
		}
	});

	// Basics look correct
	var element = componentInstance.element;
	var inputElement = element.querySelector("input");
	QUnit.ok(inputElement, "template rendered");
	QUnit.equal(inputElement.value, "world", "input has correct value");

	// Updating the scopeVM should update the template
	scopeVM.message = "mundo";
	QUnit.equal(inputElement.value, "mundo", "input has correct value after updating scopeVM");
});

QUnit.test("Components can be instantiated with viewModel", function() {

	// These are the observables that would typically be outside the component’s scope
	var bindMap = new SimpleMap({inner: new SimpleMap({key: "original bind value"})});
	var fromMap = new SimpleMap({inner: new SimpleMap({key: "original from value"})});
	var toMap = new SimpleMap({inner: new SimpleMap({key: "original to value"})});

	// Our component
	var ComponentConstructor = Component.extend({
		tag: "new-instantiation-viewmodel",
		view: "Hello",
		ViewModel: {
			fromChildProp: "string",
			plainProp: "string",
			toParentProp: "string",
			twoWayProp: "string",
			nullProp: {
				default: function() {
					return 'bar';
				}
			}
		}
	});

	// Create a new instance of our component
	var componentInstance = new ComponentConstructor({
		// Pass the viewModel with a mix of plain and observable values
		viewModel: {
			plainProp: "plain value",
			fromChildProp: value.from(fromMap, "inner.key"),
			toParentProp: value.to(toMap, "inner.key"),
			twoWayProp: value.bind(bindMap, "inner.key"),
			nullProp: null
		}
	});
	var element = componentInstance.element;
	var viewModel = componentInstance.viewModel;

	// Initial values are correct
	QUnit.equal(viewModel.fromChildProp, "original from value", "fromChildProp init");
	QUnit.equal(viewModel.plainProp, "plain value", "plainProp init");
	QUnit.equal(viewModel.toParentProp, undefined, "toParentProp init");
	QUnit.equal(viewModel.twoWayProp, "original bind value", "twoWayProp init");
	QUnit.equal(viewModel.nullProp, null, "nullProp init");

	// Updating the fromChildProp
	fromMap.get("inner").set("key", "new from value");
	QUnit.equal(viewModel.fromChildProp, "new from value", "viewModel updated after fromMap set");

	// Updating the toParentProp
	viewModel.toParentProp = "new to value";
	QUnit.equal(toMap.get("inner").get("key"), "new to value", "toMap updated after viewModel set");

	// Updating the twoWayProp
	bindMap.get("inner").set("key", "new bind value");
	QUnit.equal(viewModel.twoWayProp, "new bind value", "viewModel updated after bindMap set");
	viewModel.twoWayProp = "newest bind value";
	QUnit.equal(bindMap.get("inner").get("key"), "newest bind value", "bindMap updated after viewModel set");
});

QUnit.test("Components can be instantiated with all options", function() {

	// Our component
	var HelloWorld = Component.extend({
		tag: "hello-world",
		view: "Hello <content>world</content> <ul>{{#each(items)}} <can-slot name='itemTemplate' this:from='this' /> {{/each}}</ul>",
		ViewModel: {
			items: {}
		}
	});

	// Create a new instance of our component
	var componentInstance = new HelloWorld({
		content: "<em>{{message}}</em>",
		scope: {
			message: "friend"
		},
		templates: {
			itemTemplate: "<li>{{this}}</li>"
		},
		viewModel: {
			items: ["eat"]
		}
	});
	var element = componentInstance.element;
	var viewModel = componentInstance.viewModel;

	// Basics look correct
	QUnit.equal(
		element.innerHTML,
		"Hello <em>friend</em> <ul> <li>eat</li> </ul>",
		"element renders correctly"
	);
	QUnit.equal(viewModel.items.length, 1, "viewModel has items");

	// Changing the view model updates the element
	viewModel.items.push("sleep");
	QUnit.equal(
		element.innerHTML,
		"Hello <em>friend</em> <ul> <li>eat</li>  <li>sleep</li> </ul>",
		"element updates correctly"
	);
});

QUnit.test("Component binding instantiation works as documented", function() {

	// These are the observables that would typically be outside the component’s scope
	var appVM = new SimpleMap({
		family: new SimpleMap({
			first: "Milo",
			last: "Flanders"
		})
	});

	// Our component
	var NameComponent = Component.extend({
		tag: "name-component",
		view: "{{fullName}}",
		ViewModel: {
			givenName: "string",
			familyName: "string",
			get fullName() {
				return this.givenName + " " + this.familyName;
			}
		}
	});

	// Create a new instance of our component
	var componentInstance = new NameComponent({
	  viewModel: {
	    givenName: value.from(appVM, "family.first"),
	    familyName: value.bind(appVM, "family.last"),
	    fullName: value.to(appVM, "family.full")
	  }
	});
	var element = componentInstance.element;
	var viewModel = componentInstance.viewModel;

	// Initial component values are correct
	QUnit.equal(viewModel.familyName, "Flanders", "component “bind” prop is correct");
	QUnit.equal(viewModel.givenName, "Milo", "component “from” prop is correct");
	QUnit.equal(viewModel.fullName, "Milo Flanders", "component “to” prop is correct");

	// Initial map values are correct
	var family = appVM.get("family");
	QUnit.equal(family.get("last"), "Flanders", "map “bind” prop is correct");
	QUnit.equal(family.get("first"), "Milo", "map “from” prop is correct");
	QUnit.equal(family.get("full"), "Milo Flanders", "map “to” prop is correct");
});
