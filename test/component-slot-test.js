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

    test("<can-slot> (#4)", function() {
    //can-slots should render s"cope items, or default elements if not provided
    // can-slot attribute "name" matches to the key in the tempalates object and
    // renders that sub-template. If no match, or no default content, it renders
    // nothing

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
            '<div>' +
                '<can-slot name="subject" scope=".">{{subject}}</can-slot>' +
                '<can-slot name="body" scope=".">{{body}}</can-slot>' +
            '</div>'),
        ViewModel,
        leakScope: true
    });

    var template = stache(
        '<my-email>' +
            '<can-template name="subject">' +
                    '<h2>Default Subject {{subject}}</h2>' +
            '</can-template>' +
        '</my-email>');

    // my-email-component.templates.subject = template;

    var frag = template();
    var slot = frag.firstChild;
    debugger

    equal(innerHTML(slot).trim(), "Hello World");

    // canBatch.start();
    // canViewModel(frag.firstChild).attr('emails').each(function(email, index) {
    //     email.attr('render', true);
    // });
    // canBatch.stop();

    // var lis = frag.firstChild.getElementsByTagName("li");
    // ok( innerHTML(lis[0]).indexOf("Item 1") >= 0, "Item 1 written out");
    // ok( innerHTML(lis[1]).indexOf("Item 2") >= 0, "Item 2 written out");

});