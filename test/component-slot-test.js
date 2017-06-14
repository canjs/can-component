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
	
	equal(testView.firstChild.childNodes[0].textContent, 'Hello World');
	equal(testView.firstChild.childNodes[1].textContent, 'Later Gator');
});

test("<can-slot> Works without leakScope", function() {

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

	var testView = renderer();
	
	equal(testView.firstChild.childNodes[0].textContent, 'Hello World');
	equal(testView.firstChild.childNodes[1].textContent, 'Later Gator');
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

	equal(testView.firstChild.childNodes[0].textContent, 'Hello World');
	equal(testView.firstChild.childNodes[1].textContent, 'Hello World');
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
		ViewModel,
		leakScope: true
	});

	var renderer = stache(
		'<my-email>' +
			'<can-template name="subject" />' + 
		'</my-email>'
	);

	var testView = renderer();

	equal(testView.firstChild.childNodes[0].textContent, 'Default Content');
});

test("<can-slot> Context one-way binding works", function() {
	/*Passing in a custom context like <can-slot name='subject' {context}='value' />*/

	var ViewModel = DefineMap.extend({
		subject: {
			value:"Hello World"
		}
	});

	Component.extend({
		tag : 'my-email',
		view : stache(
			'<can-slot name="subject" {this}="subject" />'
		),
		ViewModel,
		leakScope: false
	});

	var renderer = stache(
		'<my-email>' +
			'<can-template name="subject"><span>{{subject}}</span></can-template>' + 
		'</my-email>'
	);

	var frag = renderer();
	
	equal(frag.firstChild.firstChild.innerHTML, 'Hello World');

	viewModel(frag.firstChild).subject = "Later Gator";

	equal(frag.firstChild.firstChild.innerHTML, 'Later Gator');
});

test("<can-slot> Context two-way binding works", function() {
	/*Passing in a custom context like <can-slot name='subject' {context}='value' />*/

	var ViewModel = DefineMap.extend({
		subject: {
			value:"Hello World"
		}
	});

	Component.extend({
		tag : 'my-email',
		view : stache(
			'<can-slot name="subject" {(this)}="subject" />'
		),
		ViewModel
	});

	var renderer = stache(
		'<my-email>' +
			'<can-template name="subject"><span>{{subject}}</span></can-template>' + 
		'</my-email>'
	);

	var frag = renderer();

	var vm = viewModel(frag.firstChild);

	debugger;
	
	equal(frag.firstChild.firstChild.innerHTML, 'Hello World');

	vm.subject = "Later Gator";

	equal(frag.firstChild.firstChild.innerHTML, 'Later Gator');

	frag.firstChild.firstChild.innerHTML = "After while crocodile";

	equal(vm.subject, "After while crocodile");
});
