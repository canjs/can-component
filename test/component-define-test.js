var Component = require("can-component");
var stache = require("can-stache");
var QUnit = require("steal-qunit");

var define = require("can-define");

var viewModel = require("can-view-model");

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
