var QUnit = require("steal-qunit");

var helpers = require("./helpers");
var SimpleMap = require("can-simple-map");
var stache = require("can-stache");
var Component = require("can-component");

helpers.makeTests("can-component views", function(){

    QUnit.test("lexical scoping", function() {
		Component.extend({
			tag: "hello-world",
			view: stache("{{greeting}} <content>World</content>{{exclamation}}"),
			viewModel: function(){
                return new SimpleMap({
    				greeting: "Hello"
    			});
            }
		});
		var renderer = stache("<hello-world>{{greeting}}</hello-world>");


		var frag = renderer({
			greeting: "World",
			exclamation: "!"
		});

		var hello = frag.firstChild;

		equal(hello.innerHTML.trim(), "Hello World");

		Component.extend({
			tag: "hello-world-no-template",
			leakScope: false,
			viewModel: function(){
                return new SimpleMap({greeting: "Hello"});
            }
		});
		renderer = stache("<hello-world-no-template>{{greeting}}</hello-world-no-template>");

		frag = renderer({
			greeting: "World",
			exclamation: "!"
		});

		hello = frag.firstChild;

		equal(hello.innerHTML.trim(), "Hello",
			  "If no view is provided to Component, treat <content> bindings as dynamic.");
	});

	QUnit.test("dynamic scoping", function() {

		Component.extend({
			tag: "hello-world",
			leakScope: true,
			view: stache("{{greeting}} <content>World</content>{{exclamation}}"),
			viewModel: function(){
                return new SimpleMap({greeting: "Hello"});
            }
		});

		var renderer = stache("<hello-world>{{greeting}}</hello-world>");
		var frag = renderer({
			greeting: "World",
			exclamation: "!"
		});

		var hello = frag.firstChild;

		equal( hello.innerHTML.trim() , "Hello Hello!");

	});
});
