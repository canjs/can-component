var QUnit = require("steal-qunit");

var helpers = require("./helpers")
var SimpleMap = require("can-simple-map");
var stache = require("can-stache");
var Component = require("can-component");

helpers.makeTests("can-component viewModels", function(){

    QUnit.test("a SimpleMap constructor as .ViewModel", function() {

        var map = new SimpleMap({name: "Matthew"});

        Component.extend({
            tag: "can-map-viewmodel",
            view: stache("{{name}}"),
            ViewModel: function(){
                return map;
            }
        });

        var renderer = stache("<can-map-viewmodel></can-map-viewmodel>");
        equal(renderer().firstChild.firstChild.nodeValue, "Matthew");
    });
});
