var QUnit = require("steal-qunit");

var helpers = require("./helpers")
var SimpleMap = require("can-simple-map");
var stache = require("can-stache");
var Component = require("can-component");
var canViewModel = require('can-view-model');
var domData = require('can-util/dom/data/data');
var DefineMap = require('can-define/map/map');
var domEvents = require('can-util/dom/events/events');
var SetterObservable = require("can-simple-observable/setter/setter");
var SimpleObservable = require("can-simple-observable");
var domMutate = require('can-util/dom/mutate/mutate');

var innerHTML = function(el){
    return el && el.innerHTML;
};

helpers.makeTests("can-component tag", function(){

    QUnit.test("hyphen-less tag names", function () {
		Component.extend({
			tag: "foobar",
			view: stache("<div>{{name}}</div>"),
			viewModel: function(){
                return new SimpleMap({
    				name: "Brian"
    			});
            }
		});

		var renderer = stache('<span></span><foobar></foobar>');

		var frag = renderer();

		equal(frag.lastChild.firstChild.firstChild.nodeValue, "Brian");

	});
});
