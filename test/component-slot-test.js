var Component = require("can-component");
var stache = require("can-stache");
var QUnit = require("steal-qunit");
var DefineMap = require('can-define/map/map');

var define = require("can-define");
var viewModel = require("can-view-model");

var innerHTML = function(node){
	if(node && "innerHTML" in node) {
		return node.innerHTML;
	}
};

QUnit.module("can-components - can-slots");

test("<can-slot> Works", function() {
	/*The <can-slot> elements within a renderer will replace itself with any 
	<can-template> elements found in the component who have a matching 'name' 
	attribute. Default dynamic scope is used unless passed into the <can-slot>
	element.*/

	var ViewModel = DefineMap.extend({
		subject: {
			value:"Hello World"
		},
		body: {
			value: "Later Gator"
		}
	});

	Component.extend({
		tag : 'my-email',
		view : stache(
			'<can-slot name="subject" />' +
			'<can-slot name="body" />'
		),
		ViewModel,
		leakScope: true
	});

	var renderer = stache(
		'<my-email>' +
			'<can-template name="subject">' +
				'{{subject}}' +
			'</can-template>' +
			'<can-template name="body">' +
				'{{body}}' +
			'</can-template>' +
		'</my-email>'
	);

	var testView = renderer();
	
	equal(testView.firstChild.childNodes[0].nodeValue, 'Hello World');
	equal(testView.firstChild.childNodes[1].nodeValue, 'Later Gator');
});

test("<can-slot> leakScope false acts as expected", function() {

	var ViewModel = DefineMap.extend({
		subject: {
			value:"Hello World"
		},
		body: {
			value: "Later Gator"
		}
	});

	Component.extend({
		tag : 'my-email',
		view : stache(
			'<can-slot name="subject" />' +
			'<can-slot name="body" />'
		),
		ViewModel
	});

	var renderer = stache(
		'<my-email>' +
			'<can-template name="subject">' +
				'{{subject}}' +
			'</can-template>' +
			'<can-template name="body">' +
				'{{body}}' +
			'</can-template>' +
		'</my-email>'
	);

	var testView = renderer({
		subject: 'foo',
		body: 'bar'
	});
	
	equal(testView.firstChild.childNodes[0].nodeValue, 'foo');
	equal(testView.firstChild.childNodes[1].nodeValue, 'bar');
});

test("<can-slot> Re-use templates", function() {
	/*The <can-slot> elements can reuse a template*/

	var ViewModel = DefineMap.extend({
		subject: {
			value:"Hello World"
		},
		body: {
			value: "Later Gator"
		}
	});

	Component.extend({
		tag : 'my-email',
		view : stache(
			'<can-slot name="subject" />' +
			'<can-slot name="subject" />'
		),
		ViewModel,
		leakScope: true
	});

	var renderer = stache(
		'<my-email>' +
			'<can-template name="subject">' +
				'{{subject}}' +
			'</can-template>' +
		'</my-email>'
	);

	var testView = renderer();

	equal(testView.firstChild.childNodes[0].nodeValue, 'Hello World');
	equal(testView.firstChild.childNodes[1].nodeValue, 'Hello World');
});

test("<can-slot> Works with default content", function() {
	/*The <can-slot> elements can reuse a template*/

	var ViewModel = DefineMap.extend({});

	Component.extend({
		tag : 'my-email',
		view : stache(
			'<can-slot name="subject">' + 
				'Default Content' + 
			'</can-slot>'
		),
		ViewModel
	});

	var renderer = stache(
		'<my-email>' +
			'<can-template name="subject" />' + 
		'</my-email>'
	);

	var testView = renderer();

	equal(testView.firstChild.innerHTML, 'Default Content');
});

test("<can-slot> Context one-way binding works", function() {
	/*Passing in a custom context like <can-slot name='subject' {context}='value' />*/

	var ViewModel = DefineMap.extend({
		subject: {
			value: "Hello World"
		}
	});

	Component.extend({
		tag : 'my-email',
		view : stache(
			'<can-slot name="foo" {context}="subject" />'
		),
		ViewModel
	});

	var renderer = stache(
		'<my-email>' +
			'<can-template name="foo"><span>{{context}}</span></can-template>' + 
		'</my-email>'
	);

	var frag = renderer();
	var vm = viewModel(frag.firstChild);
	
	equal(frag.firstChild.firstChild.innerHTML, 'Hello World');

	vm.subject = "Later Gator";

	equal(frag.firstChild.firstChild.innerHTML, 'Later Gator');
});

test("<can-slot> Context two-way binding works", function() {
	/*Passing in a custom context like <can-slot name='subject' {context}='value' />*/

	var ViewModel = DefineMap.extend({
		subject: {
			value: "Hello World"
		}
	});

	Component.extend({
		tag : 'my-email',
		view : stache(
			'<can-slot name="foo" {(context)}="subject" />'
		),
		ViewModel
	});

	Component.extend({
		tag : 'my-subject',
		view : stache(
			'{{context}}'
		),
		viewModel: {}
	});

	var renderer = stache(
		'<my-email>' +
			'<can-template name="foo"><my-subject {(context)}="context" /></can-template>' + 
		'</my-email>'
	);

	var frag = renderer();
	var vm = viewModel(frag.firstChild);
	var childVM = viewModel(frag.firstChild.firstChild);
	
	equal(frag.firstChild.firstChild.innerHTML, 'Hello World');

	vm.subject = "Later Gator";

	equal(frag.firstChild.firstChild.innerHTML, 'Later Gator');

	childVM.context = "After a while crocodile";

	equal(vm.subject, "After a while crocodile");
});
