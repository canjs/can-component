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
	
	equal(innerHTML(testView.firstChild.children[0]), 'Hello World');
	equal(innerHTML(testView.firstChild.children[1]), 'Later Gator');
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
	
	equal(innerHTML(testView.firstChild.children[0]), 'Hello World');
	equal(innerHTML(testView.firstChild.children[1]), 'Hello World');
});

test("<can-slot> works with <content>", function() {
	/*The <can-slot> elements will work alongside typical content functionality*/

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
			'<can-slot name="body" />' +
			'<content />'
		),
		ViewModel,
		leakScope: true
	});

	var renderer = stache(
		'<my-email>' +
			'<can-template name="subject">' +
				'{{subject}}' +
			'</can-template>' +
			'My content paragraph' +
		'</my-email>'
	);

	var testView = renderer();
	
	equal(innerHTML(testView.firstChild.children[2]), 'My content paragraph');
});
