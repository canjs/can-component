var Component = require("can-component");
var stache = require("can-stache");
var QUnit = require("steal-qunit");

var define = require("can-define");
var DefineMap = require("can-define/map/");
var DefineList = require("can-define/list/");

var viewModel = require("can-view-model");
var types = require("can-util/js/types/types");

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


QUnit.test('Works with can-define:value', function () {

	var VM = define.Constructor({
		address: {
			value(){
				return {
					city: 'Ticaboo',
					state: 'UT'
				};
			}
		},
		favoriteColor: {
			value: 'blue'
		}
	});

	Component.extend({
		tag: 'can-define-value',
		ViewModel: VM,
		template: stache('Address: {{address.city}}, {{address.state}}')
	});

	var frag = stache('<can-define-value />')();

	var vm = viewModel(frag.firstChild);

	QUnit.deepEqual(vm.address, {
		city: 'Ticaboo',
		state: 'UT'
	}, 'value function ran correctly');
	QUnit.equal(vm.favoriteColor, 'blue', 'value was set correctly');
	QUnit.equal(frag.firstChild.innerHTML, 'Address: Ticaboo, UT', 'Rendered address');

	vm.address = {
		city: 'Timbuktu',
		state: 'CA'
	};
	QUnit.equal(frag.firstChild.innerHTML, 'Address: Timbuktu, CA', 'Rendered address after change');
});


QUnit.test('Works with can-define:value lists', function () {
	var Account = DefineMap.extend({
		name: 'string',
		type: 'string'
	});
	Account.List = DefineList.extend({
		"*": Account
	});

	const VM = DefineMap.extend({
		accounts: {
			value(){
				return new Account.List([{
					name: 'My Checking',
					type: 'Checking'
				}, {
					name: 'My Savings',
					type: 'Savings'
				}]);
			}
		}
	});

	Component.extend({
		tag: 'account-list',
		ViewModel: VM,
		template: stache('{{#each accounts}}{{name}},{{/each}}')
	});

	var frag = stache('<account-list />')();

	var vm = viewModel(frag.firstChild);

	QUnit.deepEqual(vm.accounts.get(), [{
		name: 'My Checking',
		type: 'Checking'
	}, {
		name: 'My Savings',
		type: 'Savings'
	}], 'value function ran correctly');
	QUnit.equal(frag.firstChild.innerHTML, 'My Checking,My Savings,', 'template built correctly from list.');
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
