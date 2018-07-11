var Component = require("can-component");
var SimpleMap = require("can-simple-map");
var SimpleObservable = require("can-simple-observable");
var stache = require("can-stache");
var canReflect = require("can-reflect");
var QUnit = require("steal-qunit");

var viewModel = require("can-view-model");
var canDev = require("can-log/dev/dev");
var testHelpers = require("can-test-helpers");

QUnit.module("can-component can be rendered by can-stache");

QUnit.test("basics work", function (assert) {
	var ComponentConstructor = Component.extend({
		tag: "component-in-stache",
		view: "Hello {{message}}",
		ViewModel: {
			message: "string"
		}
	});

	var componentInstance = new ComponentConstructor();

	var fragment = stache("<div>{{{componentInstance}}}</div>")({
		componentInstance: componentInstance
	});
	var viewModel = componentInstance.viewModel;

	// Basics look correct
	assert.equal(fragment.textContent, "Hello ", "fragment has correct text content");

	// Updating the viewModel should update the element
	viewModel.message = "world";
	assert.equal(fragment.textContent, "Hello world", "fragment has correct text content after updating viewModel");
});

QUnit.test("wrapped in a conditional", function (assert) {
	var done = assert.async();

	var ComponentConstructor = Component.extend({
		tag: "component-in-stache",
		view: "Hello {{message}}",
		ViewModel: {
			message: "string"
		}
	});

	var componentInstance = new ComponentConstructor();
	var templateVM = new SimpleMap({
		componentInstance: componentInstance,
		showComponent: false
	});
	var componentVM = componentInstance.viewModel;

	var fragment = stache("<div>{{#if(showComponent)}}{{{componentInstance}}}{{/if}}</div>")(templateVM);

	// Template starts off empty
	assert.equal(fragment.textContent, "", "fragment starts off without content");

	// Show the component
	templateVM.set("showComponent", true);
	assert.equal(fragment.textContent, "Hello ", "fragment updates to include the component");

	// Updating the componentVM should update the element
	componentVM.message = "world";
	assert.equal(fragment.textContent, "Hello world", "fragment has correct text content after updating componentVM");

	// Listen for when the viewmodel is bound; need to make sure it isn’t at the end
	canReflect.onInstanceBoundChange(ComponentConstructor.ViewModel, function(instance, isBound) {
		assert.equal(isBound, false, "view model is no longer bound");
		done();
	});

	// Hide the component
	templateVM.set("showComponent", false);
	assert.equal(fragment.textContent, "", "fragment ends without content");
});

QUnit.test("Component can be removed from the page", 3, function(){

	var ToBeRemoved = Component.extend({
		tag: "to-be-removed",
		view: "{{prop}}",
		ViewModel: {
			prop: "string"
		},
		events: {
			"{element} beforeremove": function(){
				QUnit.ok(true, "torn down");
			}
		}
	});

	var prop = new SimpleObservable(3);

	var toBeRemoved = new ToBeRemoved({
		viewModel: {
			prop: prop
		}
	});

	var show = new SimpleObservable(true);

	var template = stache("<div>{{# if(show) }} {{{toBeRemoved}}} {{/ if}}</div>");

	var frag = template({
		show: show,
		toBeRemoved: toBeRemoved
	});

	show.set(false);
	QUnit.ok(true, "got here without an error");

	show.set(true);

	prop.set(4);
	QUnit.equal(frag.firstChild.getElementsByTagName("to-be-removed")[0].innerHTML, "4");
});
