var Component = require("can-component");
var stache = require("can-stache");
var QUnit = require("steal-qunit");

var define = require("can-define");
var DefineMap = require("can-define/map/map");

var viewModel = require("can-view-model");
var types = require("can-types");
var canDev = require("can-util/js/dev/dev");

QUnit.module("can-component with can-define");

QUnit.test('Works with can-define', function () {

	var VM = define.Constructor({
		firstName: {
			type: 'string'
		},
		lastName: {
			type: 'string'
		},
		fullName: {
			get: function () {
				return [this.firstName, this.lastName].join(' ');
			}
		}
	});

	Component.extend({
		tag: 'can-define-component',
		ViewModel: VM,
		view: stache('Name: {{fullName}}')
	});

	var frag = stache('<can-define-component {first-name}="firstName" {last-name}="lastName" />')({
		firstName: 'Chris',
		lastName: 'Gomez'
	});

	var vm = viewModel(frag.firstChild);

	QUnit.ok(vm instanceof VM, 'Constructor was called');
	QUnit.equal(vm.firstName, 'Chris', 'ViewModel was set from scope');
	QUnit.equal(vm.lastName, 'Gomez', 'ViewModel was set from scope');
	QUnit.equal(frag.firstChild.innerHTML, 'Name: Chris Gomez', 'Rendered fullName');

	vm.firstName = 'Justin';
	vm.lastName = 'Meyer';

	QUnit.equal(frag.firstChild.innerHTML, 'Name: Justin Meyer', 'Rendered fullName after change');
});


QUnit.test('scope method works', function () {


	Component.extend({
		tag: "my-element",
		viewModel: function(properties, scope, element){
			QUnit.deepEqual(properties, {first: "Justin", last: "Meyer"});
			return new types.DefaultMap(properties);
		}
	});

	stache("<my-element {first}='firstName' last='Meyer'/>")({
	  firstName: "Justin",
	  middleName: "Barry"
	});

});

QUnit.test('33 - works when instantiated with an object for ViewModel', function () {

	Component.extend({
		tag: "test-element",
		view: stache("{{someMethod}}"),
		ViewModel: {
			someMethod: function() {
				ok(true, "Function got called");
				return true;
			}
		}
	});

	var renderer = stache("<test-element>");
	renderer();

});

QUnit.test("helpers do not leak when leakscope is false (#77)", function () {
	var called = 0;
	var inner = Component.extend({
		tag: "inner-el",
		view: stache("inner{{test}}"),
		leakScope: false
	});
	var outer = Component.extend({
		tag: "outer-el",
		view: stache("outer:<inner-el>"),
		helpers: {
			test: function () {
				called++;
				return "heyo";
			}
		}
	});

	var renderer = stache("<outer-el>");

	renderer();
	QUnit.equal(called, 0, "Outer helper not called");
});

QUnit.test("helpers do leak when leakscope is true (#77)", function () {
	var called = 0;
	var inner = Component.extend({
		tag: "inner-el",
		view: stache("inner{{test}}"),
		leakScope: true
	});
	var outer = Component.extend({
		tag: "outer-el",
		view: stache("outer:<inner-el>"),
		helpers: {
			test: function () {
				called++;
				return "heyo";
			}
		}
	});

	var renderer = stache("<outer-el>");

	renderer();
	QUnit.equal(called, 1, "Outer helper called once");
});

if(System.env.indexOf("production") < 0) {
	QUnit.test('warn if viewModel is assigned a DefineMap (#14)', function() {
		QUnit.expect(1);
		var oldwarn = canDev.warn;
		canDev.warn = function(mesg) {
			QUnit.equal(mesg, "can-component: Assigning a DefineMap or constructor type to the viewModel property may not be what you intended. Did you mean ViewModel instead? More info: https://canjs.com/doc/can-component.prototype.ViewModel.html", "Warning is expected message");
		};

		// should issue a warning
		var VM = DefineMap.extend({});
		Component.extend({
			tag: 'can-vm1-test-component',
			viewModel: VM
		});

		// should not issue a warning
		Component.extend({
			tag: 'can-vm2-test-component',
			viewModel: function(){}
		});

		canDev.warn = oldwarn;
	});
}
