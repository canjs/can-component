var QUnit = require("steal-qunit");

var helpers = require("./helpers")
var SimpleMap = require("can-simple-map");
var stache = require("can-stache");
var Component = require("can-component");
var canViewModel = require('can-view-model');
var domData = require('can-util/dom/data/data');
var DefineMap = require('can-define/map/map');
var DefineList = require("can-define/list/list");
var domEvents = require('can-util/dom/events/events');
var SetterObservable = require("can-simple-observable/setter/setter");
var SimpleObservable = require("can-simple-observable");
var attr = require("can-util/dom/attr/attr");
var canReflect = require("can-reflect");
var domMutate = require('can-util/dom/mutate/mutate');
var observe = require("can-observe");

var innerHTML = function(el){
    return el && el.innerHTML;
};

var classSupport = (function() {
	try {
		eval('"use strict"; class A{};');
		return true;
	} catch (e) {
		return false;
	}

})();

helpers.makeTests("can-component viewModels with observe", function(){

    QUnit.test("ViewModel as a plain object defaults to a can-observe type", function(){
        Component.extend({
            tag: "observe-add",
            view: stache("<button on:click='add()'>+1</button><span>{{count}}</span>"),
            ViewModel: {
                count: 0,
                add: function(){
                    this.count++;
                }
            }
        });

        var frag = stache("<observe-add/>")();
        var buttons = frag.firstChild.getElementsByTagName("button");
        var spans = frag.firstChild.getElementsByTagName("span");

        QUnit.equal(spans[0].innerHTML, "0", "first value");

        domEvents.dispatch.call(buttons[0], "click");

        QUnit.equal(spans[0].innerHTML, "1", "second value");

    });

    if(classSupport) {
        QUnit.test("ViewModel as observe(class)", function(){

            class Add extends observe.Object{
                constructor(props) {
                    super(props)
                    this.count = 0;
                }
                add(){
                    this.count++;
                }
            }

            Component.extend({
                tag: "observe-class-add",
                view: stache("<button on:click='add()'>+1</button><span>{{count}}</span>"),
                ViewModel: Add
            });

            var frag = stache("<observe-class-add/>")();
            var buttons = frag.firstChild.getElementsByTagName("button");
            var spans = frag.firstChild.getElementsByTagName("span");

            QUnit.equal(spans[0].innerHTML, "0", "first value");

            domEvents.dispatch.call(buttons[0], "click");

            QUnit.equal(spans[0].innerHTML, "1", "second value");

        });

        QUnit.test("connectedCallback and disconnectedCallback", 2, function(){
            QUnit.stop();

            Component.extend({
                tag: "connected-component",
                ViewModel: class extends observe.Object {
                    connectedCallback(element) {
                        QUnit.equal(element.nodeName, "CONNECTED-COMPONENT", "connectedCallback");
                        return function(){
                            QUnit.equal(element.nodeName, "CONNECTED-COMPONENT", "disconnectedCallback");
                        }
                    }
                }
            });
            var template = stache("<connected-component/>");
            var frag = template();
            var first = frag.firstChild;
            domMutate.appendChild.call(this.fixture, frag);

            helpers.afterMutation(function(){

                domMutate.removeChild.call(first.parentNode, first);
                helpers.afterMutation(function(){
                    QUnit.start();
                });
            });
        });
    }

});
