var QUnit = require("steal-qunit");

var helpers = require("./helpers");
var SimpleMap = require("can-simple-map");
var stache = require("can-stache");
var Component = require("can-component");
var canViewModel = require('can-view-model');

var SimpleObservable = require("can-simple-observable");
var domEvents = require('can-dom-events');
var domMutateNode = require('can-dom-mutate/node');
var domMutateDomEvents = require('can-dom-mutate/dom-events');
var insertedEvent = domMutateDomEvents.inserted;
var removedEvent = domMutateDomEvents.removed;

helpers.makeTests("can-component events", function(){

    test("value observables formerly (#550)", function () {

        var nameChanges = 0;

        Component.extend({
            tag: "viewmodel-rebinder",
            events: {
                "{name}": function () {
                    nameChanges++;
                }
            }
        });

        var renderer = stache("<viewmodel-rebinder></viewmodel-rebinder>");

        var frag = renderer();
        var viewModel = canViewModel(frag.firstChild);

        var n1 = new SimpleObservable(),
            n2 = new SimpleObservable();

        viewModel.set("name", n1);

        n1.set("updated");

        viewModel.set("name", n2);

        n2.set("updated");


        equal(nameChanges, 2);
    });

    test("Component events bind to window", function(){
        window.tempMap = new SimpleMap();

        Component.extend({
            tag: "window-events",
            events: {
                "{tempMap} prop": function(){
                    ok(true, "called templated event");
                }
            }
        });

        var renderer = stache('<window-events></window-events>');

        renderer();

        window.tempMap.set("prop","value");

        // IE 6-8 throws an error when deleting globals created via assignment:
        // http://perfectionkills.com/understanding-delete/#ie_bugs
        window.tempMap = undefined;
        try{
            delete window.tempMap;
        } catch(e) {}

    });

    QUnit.test("stache conditionally nested components calls inserted once (#967)", function(){
		expect(1);
		var undo = domEvents.addEvent(insertedEvent);

        Component.extend({
            tag: "can-parent-stache",
            viewModel: function(){
                return new SimpleMap({
                    shown: true
                });
            },
            view: stache("{{#if shown}}<can-child></can-child>{{/if}}")
        });
        Component.extend({
            tag: "can-child",
            events: {
                inserted: function(){
                    ok(true, "called inserted once");
                }
            }
        });

        var renderer = stache("<can-parent-stache></can-parent-stache>");

        domMutateNode.appendChild.call(this.fixture, renderer());
        stop();
        setTimeout(function () {
			undo();
			start();
		}, 100);
    });


    QUnit.test('viewModel objects with Constructor functions as properties do not get converted (#1261)', 1, function(){
        stop();
        var HANDLER;
        var Test = SimpleMap.extend({
            addEventListener: function(ev, handler){
                HANDLER = handler;
            },
            removeEventListener: function(){}
        },{
            setup: function(props){
                props.test = 'Yeah';
                return SimpleMap.prototype.setup.apply(this, arguments);
            }
        });

        Component.extend({
            tag:'my-app',
            viewModel: SimpleMap.extend({
                setup: function(props){
                    props.MyConstruct = Test;
                    return SimpleMap.prototype.setup.apply(this, arguments);
                }
            }),
            events: {
                '{MyConstruct} something': function() {
                    ok(true, 'Event got triggered');
                    start();
                }
            }
        });

        var frag = stache('<my-app></my-app>')();

        // element must be inserted, otherwise attributes event will not be fired
        domMutateNode.appendChild.call(this.fixture,frag);
        HANDLER.call(Test,{type:"something"});
    });

    QUnit.test('removing bound viewModel properties on destroy #1415', function(){
        var state = new SimpleMap({
            product: new SimpleMap({
                id: 1,
                name: "Tom"
            })
        });

        Component.extend({
            tag: 'destroyable-component',
            events: {
                destroy: function(){
                    this.viewModel.set("product" , null);
                }
            }
        });

        var frag = stache('<destroyable-component product:bind="product"></destroyable-component>')(state);

        // element must be inserted, otherwise attributes event will not be fired
        domMutateNode.appendChild.call(this.fixture,frag);

        domMutateNode.removeChild.call(this.fixture, this.fixture.firstChild);
        stop();
        helpers.afterMutation(function(){
            ok(state.attr('product') == null, 'product was removed');
            start();
        });
    });

    test('changing viewModel property rebinds {viewModel.<...>} events (#1529)', 2, function(){
		Component.extend({
			tag: 'rebind-viewmodel',
			events: {
				init: function(){
					this.viewModel.set("item" , new SimpleMap({}) );
				},
				'{scope.item} name': function() {
					ok(true, 'Change event on scope');
				},
				'{viewModel.item} name': function() {
					ok(true, 'Change event on viewModel');
				}
			}
		});
		var frag = stache('<rebind-viewmodel></rebind-viewmodel>')();
		var rebind = frag.firstChild;
		domMutateNode.appendChild.call(this.fixture, rebind);

		canViewModel(rebind).get("item").set('name', 'CDN');
	});


    QUnit.test('DOM trees not releasing when referencing CanMap inside CanMap in view (#1593)', function() {
		var undo = domEvents.addEvent(removedEvent)

        var baseTemplate = stache('{{#if show}}<my-outside></my-outside>{{/if}}'),
            show = new SimpleObservable(true),
            state = new SimpleMap({
                inner: 1
            });

        var removeCount = 0;

        Component.extend({
            tag: 'my-inside',
            events: {
                removed: function() {
                    removeCount++;
                }
            },
            leakScope: true
        });

        Component.extend({
            tag: 'my-outside',
            view: stache('{{#if ../state.inner}}<my-inside></my-inside>{{/if}}'),
            leakScope: true
        });

        domMutateNode.appendChild.call(this.fixture, baseTemplate({
            show: show,
            state: state
        }));

        helpers.runTasks([function(){
            show.set(false);
        },function(){
            state.set('inner', null);
        }, function(){
            equal(removeCount, 1, 'internal removed once');
            show.set(true);
        }, function(){
            state.set('inner', 2);
        }, function(){
            state.set('inner', null);
        }, function(){
            equal(removeCount, 2, 'internal removed twice');
			undo();
        }]);

        stop();

    });

});
