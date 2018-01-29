var QUnit = require("steal-qunit");

var helpers = require("./helpers");
var stache = require("can-stache");
var Component = require("can-component");
var domEvents = require('can-dom-events');
var domMutateNode = require('can-dom-mutate/node');
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

    QUnit.test("Basic can-observe type", function(){
        Component.extend({
            tag: "observe-add",
            view: stache("<button on:click='add()'>+1</button><span>{{count}}</span>"),
            ViewModel: observe.Object.extend("ObserveAdd",{},{
                count: 0,
                add: function(){
                    this.count++;
                }
            })
        });

        var frag = stache("<observe-add/>")();
        var buttons = frag.firstChild.getElementsByTagName("button");
        var spans = frag.firstChild.getElementsByTagName("span");

        QUnit.equal(spans[0].innerHTML, "0", "first value");

        domEvents.dispatch(buttons[0], "click");

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

            domEvents.dispatch(buttons[0], "click");

            QUnit.equal(spans[0].innerHTML, "1", "second value");

        });

        QUnit.test("connectedCallback and disconnectedCallback", 3, function(){
            QUnit.stop();

            Component.extend({
                tag: "connected-component",
                view: stache('rendered'),
                ViewModel: class extends observe.Object {
                    connectedCallback(element) {
                        QUnit.equal(element.innerHTML, "rendered", "rendered view");
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
            domMutateNode.appendChild.call(this.fixture, frag);

            helpers.afterMutation(function(){

                domMutateNode.removeChild.call(first.parentNode, first);
                helpers.afterMutation(function(){
                    QUnit.start();
                });
            });
        });
    }

});
