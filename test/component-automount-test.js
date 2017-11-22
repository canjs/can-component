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

helpers.makeTests("can-component autoMount", function(doc){

    QUnit.test("basics", function () {

        var first = doc.createElement("is-autorendered");
        first.id = "first";

        domMutate.appendChild.call(this.fixture, first);

        Component.extend({
            tag: "is-autorendered",
            autoMount: true,
            view: stache("Hello World")
        });

        QUnit.equal( first.innerHTML, "Hello World" );

	});
});
