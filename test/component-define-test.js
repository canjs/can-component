var Component = require("can-component");
var stache = require("can-stache");
var QUnit = require("steal-qunit");

var define = require("can-define");
var DefineMap = require("can-define/map/map");

var viewModel = require("can-view-model");
var types = require("can-types");

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
		template: stache('Name: {{fullName}}')
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
		template: stache("{{someMethod}}"),
		ViewModel: {
			someMethod: function() {
				ok(true, "Function got called");
				return true;
			}
		}
		
	});
	
	var template = stache("<test-element>");
	template();

});
