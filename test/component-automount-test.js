var QUnit = require("steal-qunit");

var helpers = require("./helpers")
var SimpleMap = require("can-simple-map");
var stache = require("can-stache");
var Component = require("can-component");
var canViewModel = require('can-view-model');
var domData = require('can-util/dom/data/data');
var DefineMap = require('can-define/map/map');
var SetterObservable = require("can-simple-observable/setter/setter");
var SimpleObservable = require("can-simple-observable");
var domMutateNode = require('can-dom-mutate/node');

var innerHTML = function(el){
    return el && el.innerHTML;
};

helpers.makeTests("can-component autoMount", function(doc){

    QUnit.test("basics", function () {

        var first = doc.createElement("is-autorendered");
        first.id = "first";

        domMutateNode.appendChild.call(this.fixture, first);

        Component.extend({
            tag: "is-autorendered",
            autoMount: true,
            view: stache("Hello World")
        });

        QUnit.equal( first.innerHTML, "Hello World" );

	});


    QUnit.test("autoMount and connectedCallback", function () {
        QUnit.stop();
        var first = doc.createElement("is-autorendered");
        first.id = "first";

        domMutateNode.appendChild.call(this.fixture, first);

        Component.extend({
            tag: "is-autorendered",
            autoMount: true,
            view: stache("Hello World"),
            ViewModel: {
                connectedCallback: function(element){
                    QUnit.equal( element.innerHTML, "Hello World" );
                    QUnit.ok(true, "called on automounted components");
                    QUnit.start();
                }
            }
        });

        QUnit.equal( first.innerHTML, "Hello World" );


	});
});
