/* jshint -W003 */
require("./component-define-test");

var Component = require("can-component");
var stache = require("can-stache");
var QUnit = require("steal-qunit");

var Construct = require("can-construct");
var canCompute = require("can-compute");
var CanMap = require("can-map");
var CanList = require("can-list");
var canEvent = require('can-event');

var canViewModel = require('can-view-model');

var canBatch = require("can-event/batch/batch");

var attr = require("can-util/dom/attr/attr");
var className = require("can-util/dom/class-name/class-name");
var domMutate = require('can-util/dom/mutate/mutate');
var domData = require('can-util/dom/data/data');
var types = require("can-types");

var isPromise = require('can-util/js/is-promise/is-promise');

var globals = require('can-globals');
var makeDocument = require('can-vdom/make-document/make-document');
var getDocument = require("can-globals/document/document");
var getFragment = require("can-util/dom/fragment/fragment");
var Scope = require("can-view-scope");
var viewCallbacks = require("can-view-callbacks");
var canLog = require("can-util/js/log/log");


var DOC = getDocument();
var MUT_OBS = globals.getKeyValue('MutationObserver');
makeTest("can-component - map - dom", document, MUT_OBS);
makeTest("can-component - map - vdom", makeDocument(), null);

var innerHTML = function(node){
	if(node && "innerHTML" in node) {
		return node.innerHTML;
	}
};

var runTasks = function(tasks){
	var nextTask = function(){
		var next = tasks.shift();
		next();
		if(tasks.length) {
			setTimeout(nextTask, 100);
		} else {
			start();
		}
	};
	setTimeout(nextTask, 100);
};

function makeTest(name, doc, mutObs) {
	var oldDoc, oldDefaultMap;
	QUnit.module(name, {
		setup: function () {
			getDocument(doc);
			if(!mutObs){
				globals.setKeyValue('MutationObserver', mutObs);
			}

			oldDefaultMap = types.DefaultMap;
			types.DefaultMap = CanMap;

			if(doc) {
				this.fixture = doc.createElement("div");
				doc.body.appendChild(this.fixture);
			} else {
				this.fixture = doc.getElementById("qunit-fixture");
			}
		},
		teardown: function(){
			doc.body.removeChild(this.fixture);
			stop();
			setTimeout(function(){
				types.DefaultMap = oldDefaultMap;
				start();
				getDocument(DOC);
				globals.deleteKeyValue('MutationObserver');
			}, 100);
		}
	});

	var Paginate = CanMap.extend({
		count: Infinity,
		offset: 0,
		limit: 100,
		// Prevent negative counts
		setCount: function (newCount, success, error) {
			return newCount < 0 ? 0 : newCount;
		},
		// Prevent negative offsets
		setOffset: function (newOffset) {
			return newOffset < 0 ?
				0 :
				Math.min(newOffset, !isNaN(this.count - 1) ?
					this.count - 1 :
					Infinity);
		},
		// move next
		next: function () {
			this.attr('offset', this.offset + this.limit);
		},
		prev: function () {
			this.attr('offset', this.offset - this.limit);
		},
		canNext: function () {
			return this.attr('offset') < this.attr('count') -
				this.attr('limit');
		},
		canPrev: function () {
			return this.attr('offset') > 0;
		},
		page: function (newVal) {
			if (newVal === undefined) {
				return Math.floor(this.attr('offset') / this.attr('limit')) + 1;
			} else {
				this.attr('offset', (parseInt(newVal) - 1) * this.attr('limit'));
			}
		},
		pageCount: function () {
			return this.attr('count') ?
				Math.ceil(this.attr('count') / this.attr('limit')) : null;
		}
	});

	test("lexical scoping", function() {
		Component.extend({
			tag: "hello-world",
			view: stache("{{greeting}} <content>World</content>{{exclamation}}"),
			viewModel: {
				greeting: "Hello"
			}
		});
		var renderer = stache("<hello-world>{{greeting}}</hello-world>");


		var frag = renderer({
			greeting: "World",
			exclamation: "!"
		});

		var hello = frag.firstChild;

		equal(innerHTML(hello).trim(), "Hello World");

		Component.extend({
			tag: "hello-world-no-template",
			leakScope: false,
			viewModel: {greeting: "Hello"}
		});
		renderer = stache("<hello-world-no-template>{{greeting}}</hello-world-no-template>");

		frag = renderer({
			greeting: "World",
			exclamation: "!"
		});

		hello = frag.firstChild;

		equal(innerHTML(hello).trim(), "Hello",
			  "If no view is provided to Component, treat <content> bindings as dynamic.");
	});

	test("dynamic scoping", function() {

		Component.extend({
			tag: "hello-world",
			leakScope: true,
			view: stache("{{greeting}} <content>World</content>{{exclamation}}"),
			viewModel: {greeting: "Hello"}
		});

		var renderer = stache("<hello-world>{{greeting}}</hello-world>");
		var frag = renderer({
			greeting: "World",
			exclamation: "!"
		});

		var hello = frag.firstChild;

		equal( innerHTML(hello).trim() , "Hello Hello!");

	});

	test("treecombo", function () {

		var TreeComboViewModel = CanMap.extend({
			items: [],
			breadcrumb: [],
			selected: [],
			selectableItems: function () {
				var breadcrumb = this.attr("breadcrumb");

				// if there's an item in the breadcrumb
				if (breadcrumb.attr('length')) {

					// return the last item's children
					return breadcrumb.attr("" + (breadcrumb.length - 1) + '.children');
				} else {

					// return the top list of items
					return this.attr('items');
				}
			},
			showChildren: function (item, el, ev) {
				ev.stopPropagation();
				this.attr('breadcrumb')
					.push(item);
			},
			emptyBreadcrumb: function () {
				this.attr("breadcrumb")
					.attr([], true);
			},
			updateBreadcrumb: function (item) {
				var breadcrumb = this.attr("breadcrumb"),
					index = breadcrumb.indexOf(item);
				breadcrumb.splice(index + 1, breadcrumb.length - index - 1);
			},
			toggle: function (item) {
				var selected = this.attr('selected'),
					index = selected.indexOf(item);
				if (index === -1) {
					selected.push(item);
				} else {
					selected.splice(index, 1);
				}
			},
			isSelected: function (item) {
				return this.attr("selected").indexOf(item) > -1;
			}
		});

		Component.extend({
			tag: "treecombo",
			view: stache("<ul class='breadcrumb'>" +
				"<li can-click='emptyBreadcrumb'>{{title}}</li>" +
				"{{#each breadcrumb}}" +
				"<li can-click='updateBreadcrumb'>{{title}}</li>" +
				"{{/each}}" +
				"</ul>" +
				"<ul class='options'>" +
				"<content>" +
				"{{#selectableItems}}" +
				"<li {{#isSelected(.)}}class='active'{{/isSelected}} can-click='toggle'>" +
				"<input type='checkbox' {{#isSelected(.)}}checked{{/isSelected}}/>" +
				"{{title}}" +
				"{{#if children.length}}" +
				"<button class='showChildren' can-click='showChildren'>+</button>" +
				"{{/if}}" +
				"</li>" +
				"{{/selectableItems}}" +
				"</content>" +
				"</ul>"),
			ViewModel: TreeComboViewModel
		});

		var renderer = stache("<treecombo {(items)}='locations' title='Locations'></treecombo>");

		var base = new CanMap({});

		var frag = renderer(base);
		var root = doc.createElement("div");
		root.appendChild(frag);

		var items = [{
			id: 1,
			title: "Midwest",
			children: [{
				id: 5,
				title: "Illinois",
				children: [{
					id: 23423,
					title: "Chicago"
				}, {
					id: 4563,
					title: "Springfield"
				}, {
					id: 4564,
					title: "Naperville"
				}]
			}, {
				id: 6,
				title: "Wisconsin",
				children: [{
					id: 232423,
					title: "Milwaulkee"
				}, {
					id: 45463,
					title: "Green Bay"
				}, {
					id: 45464,
					title: "Madison"
				}]
			}]
		}, {
			id: 2,
			title: "East Coast",
			children: [{
				id: 25,
				title: "New York",
				children: [{
					id: 3413,
					title: "New York"
				}, {
					id: 4613,
					title: "Rochester"
				}, {
					id: 4516,
					title: "Syracuse"
				}]
			}, {
				id: 6,
				title: "Pennsylvania",
				children: [{
					id: 2362423,
					title: "Philadelphia"
				}, {
					id: 454663,
					title: "Harrisburg"
				}, {
					id: 454664,
					title: "Scranton"
				}]
			}]
		}];

		stop();

		setTimeout(function () {

			base.attr('locations', items);

			var itemsList = base.attr('locations');

			// check that the DOM is right
			var treecombo = root.firstChild,
				breadcrumb = treecombo.firstChild,
				breadcrumbLIs = function(){
					return breadcrumb.getElementsByTagName('li');
				},
				options = treecombo.lastChild,
				optionsLis = function(){
					return options.getElementsByTagName('li');
				};

			equal(breadcrumbLIs().length, 1, "Only the default title is shown");

			equal( innerHTML( breadcrumbLIs()[0] ) , "Locations", "The correct title from the attribute is shown");

			equal( itemsList.length, optionsLis().length, "first level items are displayed");

			// Test toggling selected, first by clicking
			canEvent.trigger.call(optionsLis()[0], "click");

			equal(optionsLis()[0].className, "active", "toggling something not selected adds active");

			ok(optionsLis()[0].getElementsByTagName('input')[0].checked, "toggling something not selected checks checkbox");
			equal(canViewModel(treecombo, "selected")
				.length, 1, "there is one selected item");
			equal(canViewModel(treecombo, "selected.0"), itemsList.attr("0"), "the midwest is in selected");

			// adjust the state and everything should update
			canViewModel(treecombo, "selected")
				.pop();
			equal(optionsLis()[0].className, "", "toggling something not selected adds active");

			// Test going in a location
			canEvent.trigger.call(optionsLis()[0].getElementsByTagName('button')[0], "click");
			equal(breadcrumbLIs().length, 2, "Only the default title is shown");
			equal(innerHTML(breadcrumbLIs()[1]), "Midwest", "The breadcrumb has an item in it");
			ok(/Illinois/.test( innerHTML(optionsLis()[0])), "A child of the top breadcrumb is displayed");

			// Test going in a location without children
			canEvent.trigger.call(optionsLis()[0].getElementsByTagName('button')[0], "click");
			ok(/Chicago/.test( innerHTML(optionsLis()[0] ) ), "A child of the top breadcrumb is displayed");
			ok(!optionsLis()[0].getElementsByTagName('button')
				.length, "no show children button");

			// Test poping off breadcrumb
			canEvent.trigger.call(breadcrumbLIs()[1], "click");
			equal(innerHTML(breadcrumbLIs()[1]), "Midwest", "The breadcrumb has an item in it");
			ok(/Illinois/.test( innerHTML( optionsLis()[0])), "A child of the top breadcrumb is displayed");

			// Test removing everything
			canEvent.trigger.call(breadcrumbLIs()[0], "click");
			equal(breadcrumbLIs().length, 1, "Only the default title is shown");
			equal( innerHTML(breadcrumbLIs()[0]), "Locations", "The correct title from the attribute is shown");

			start();

		}, 100);

	});

	test("deferred grid", function () {

		// This test simulates a grid that reads a `deferreddata` property for
		// items and displays them.
		// If `deferreddata` is a deferred, it waits for those items to resolve.
		// The grid also has a `waiting` property that is true while the deferred is being resolved.

		var GridViewModel = CanMap.extend({
			items: [],
			waiting: true
		});

		Component.extend({
			tag: "grid",
			ViewModel: GridViewModel,
			view: stache("<table><tbody><content></content></tbody></table>"),
			leakScope: true,
			events: {
				init: function () {
					this.update();
				},
				"{viewModel} deferreddata": "update",
				update: function () {
					var deferred = this.viewModel.attr('deferreddata'),
						viewModel = this.viewModel;

					if (isPromise(deferred)) {
						this.viewModel.attr("waiting", true);
						deferred.then(function (items) {
							viewModel.attr('items')
								.attr(items, true);
						});
					} else {
						viewModel.attr('items')
							.attr(deferred, true);
					}
				},
				"{items} change": function () {
					this.viewModel.attr("waiting", false);
				}
			}
		});

		// The context object has a `set` property and a
		// deferredData property that reads from it and returns a new deferred.
		var SimulatedScope = CanMap.extend({
			set: 0,
			deferredData: function () {
				var deferred = {};
				var promise = new Promise(function(resolve, reject){
					deferred.resolve = resolve;
					deferred.reject = reject;
				});
				var set = this.attr('set');
				if (set === 0) {
					setTimeout(function () {
						deferred.resolve([{
							first: "Justin",
							last: "Meyer"
						}]);
					}, 100);
				} else if (set === 1) {
					setTimeout(function () {
						deferred.resolve([{
							first: "Brian",
							last: "Moschel"
						}]);
					}, 100);
				}
				return promise;
			}
		});
		var viewModel = new SimulatedScope();

		var renderer = stache("<grid {(deferreddata)}='viewModel.deferredData'>" +
			"{{#each items}}" +
			"<tr>" +
			"<td width='40%'>{{first}}</td>" +
			"<td width='70%'>{{last}}</td>" +
			"</tr>" +
			"{{/each}}" +
			"</grid>");

		domMutate.appendChild.call(this.fixture, renderer({
			viewModel: viewModel
		}));

		var gridScope = canViewModel(this.fixture.firstChild);

		equal(gridScope.attr("waiting"), true, "The grid is initially waiting on the deferreddata to resolve");

		stop();
		var self = this;

		var waitingHandler = function() {
			gridScope.unbind('waiting', waitingHandler);

			setTimeout(function () {
				var tds = self.fixture.getElementsByTagName("td");
				equal(tds.length, 2, "there are 2 tds");

				gridScope.bind("waiting", function (ev, newVal) {
					if (newVal === false) {
						setTimeout(function () {
							equal(innerHTML(tds[0]), "Brian", "td changed to brian");
							start();
						}, 100);

					}
				});

				// update set to change the deferred.
				viewModel.attr("set", 1);

			}, 100);
		};

		gridScope.bind('waiting', waitingHandler);
	});

	test("nextprev", function () {

		Component.extend({
			tag: "next-prev",
			view: stache(
				'<a href="javascript://"' +
				'class="prev {{#paginate.canPrev}}enabled{{/paginate.canPrev}}" ($click)="paginate.prev()">Prev</a>' +
				'<a href="javascript://"' +
				'class="next {{#paginate.canNext}}enabled{{/paginate.canNext}}" ($click)="paginate.next()">Next</a>')
		});

		var paginator = new Paginate({
			limit: 20,
			offset: 0,
			count: 100
		});
		var renderer = stache("<next-prev {(paginate)}='paginator'></next-prev>");

		var frag = renderer({
			paginator: paginator
		});
		var nextPrev = frag.firstChild;

		var prev = nextPrev.firstChild,
			next = nextPrev.lastChild;

		ok(!/enabled/.test( prev.className ), "prev is not enabled");
		ok(/enabled/.test( next.className ), "next is  enabled");

		canEvent.trigger.call(next, "click");
		ok(/enabled/.test( prev.className ), "prev is enabled");
	});

	test("page-count", function () {

		Component.extend({
			tag: "page-count",
			view: stache('Page <span>{{page}}</span>.')
		});

		var paginator = new Paginate({
			limit: 20,
			offset: 0,
			count: 100
		});

		var renderer = stache("<page-count {(page)}='paginator.page'></page-count>");

		var frag = renderer( new CanMap({
			paginator: paginator
		}) );

		var span = frag.firstChild.getElementsByTagName("span")[0];

		equal(span.firstChild.nodeValue, "1");
		paginator.next();
		equal(span.firstChild.nodeValue, "2");
		paginator.next();
		equal(span.firstChild.nodeValue, "3");

	});

	test("hello-world and whitespace around custom elements", function () {

		Component.extend({
			tag: "hello-world",
			view: stache("{{#if visible}}{{message}}{{else}}Click me{{/if}}"),
			viewModel: {
				visible: false,
				message: "Hello There!"
			},
			events: {
				click: function () {
					this.viewModel.attr("visible", true);
				}
			}
		});

		var renderer = stache("  <hello-world></hello-world>  ");
		var frag = renderer({});

		var helloWorld = frag.childNodes.item(1);

		canEvent.trigger.call(helloWorld, "click");

		equal( innerHTML(helloWorld) , "Hello There!");

	});

	test("self closing content tags", function () {

		Component.extend({
			"tag": "my-greeting",
			view: stache("<h1><content/></h1>"),
			viewModel: {
				title: "Component"
			}
		});

		var renderer = stache("<my-greeting><span>{{site}} - {{title}}</span></my-greeting>");

		var frag = renderer({
			site: "CanJS"
		});

		equal(frag.firstChild.getElementsByTagName("span")
			.length, 1, "there is an h1");
	});

	test("canViewModel utility", function() {
		Component({
			tag: "my-taggy-tag",
			view: stache("<h1>hello</h1>"),
			viewModel: {
				foo: "bar"
			}
		});

		var frag = stache("<my-taggy-tag id='x'></my-taggy-tag>")();


		var el = frag.firstChild;

		equal(canViewModel(el), domData.get.call(el, "viewModel"), "one argument grabs the viewModel object");
		equal(canViewModel(el, "foo"), "bar", "two arguments fetches a value");
		canViewModel(el, "foo", "baz");
		equal(canViewModel(el, "foo"), "baz", "Three arguments sets the value");
	});

	test("canViewModel creates one if it doesn't exist", function(){
		var frag = stache("<div id='me'></div>")();

		var el = frag.firstChild;
		var viewModel = canViewModel(el);
		ok(!!viewModel, "viewModel created where it didn't exist.");
		equal(viewModel, domData.get.call(el, "viewModel"), "viewModel is in the data.");
	});

	test('setting passed variables - two way binding', function () {
		Component.extend({
			tag: "my-toggler",
			view: stache("{{#if visible}}<content/>{{/if}}"),
			leakScope: true,
			viewModel: {
				visible: true,
				show: function () {
					this.attr('visible', true);
				},
				hide: function () {
					this.attr("visible", false);
				}
			}
		});

		Component.extend({
			tag: "my-app",
			viewModel: {
				visible: true,
				show: function () {
					this.attr('visible', true);
				}
			}
		});

		var renderer = stache("<my-app>" +
			'{{^visible}}<button can-click="show">show</button>{{/visible}}' +
			'<my-toggler {(visible)}="visible">' +
			'content' +
			'<button can-click="hide">hide</button>' +
			'</my-toggler>' +
			'</my-app>');

		var frag = renderer({});

		var myApp = frag.firstChild,
			buttons = myApp.getElementsByTagName("button");

		equal( buttons.length, 1, "there is one button");
		equal( innerHTML(buttons[0]) , "hide", "the button's text is hide");

		canEvent.trigger.call(buttons[0], "click");
		buttons = myApp.getElementsByTagName("button");

		equal(buttons.length, 1, "there is one button");
		equal(innerHTML(buttons[0]), "show", "the button's text is show");

		canEvent.trigger.call(buttons[0], "click");
		buttons = myApp.getElementsByTagName("button");

		equal(buttons.length, 1, "there is one button");
		equal(innerHTML(buttons[0]), "hide", "the button's text is hide");
	});

	test("helpers reference the correct instance (#515)", function () {
		expect(2);
		Component({
			tag: 'my-text',
			view: stache('<p>{{valueHelper}}</p>'),
			helpers: {
				valueHelper: function () {
					return this.attr('value');
				}
			}
		});

		var renderer = stache('<my-text value="value1"></my-text><my-text value="value2"></my-text>');

		var frag = renderer({});

		equal(frag.firstChild.firstChild.firstChild.nodeValue, 'value1');
		equal(frag.lastChild.firstChild.firstChild.nodeValue, 'value2');
	});

	test('access hypenated attributes via camelCase or hypenated', function () {
		Component({
			tag: 'hyphen',
			view: stache('<p>{{valueHelper}}</p>'),
			helpers: {
				valueHelper: function () {
					return this.attr('camelCase');
				}
			}
		});

		var renderer = stache('<hyphen camel-case="value1"></hyphen>');
		var frag = renderer({});


		equal(frag.firstChild.firstChild.firstChild.nodeValue, 'value1');

	});

	test("a map as viewModel", function () {

		var me = new CanMap({
			name: "Justin"
		});

		Component.extend({
			tag: 'my-viewmodel',
			view: stache("{{name}}}"),
			viewModel: me
		});

		var renderer = stache('<my-viewmodel></my-viewmodel>');
		equal(renderer().firstChild.firstChild.nodeValue, "Justin");

	});

	test("a CanMap constructor as viewModel", function() {
		var MyMap = CanMap.extend({
			name: "Matthew"
		});

		Component.extend({
			tag: "can-map-viewmodel",
			view: stache("{{name}}"),
			viewModel: MyMap
		});

		var renderer = stache("<can-map-viewmodel></can-map-viewmodel>");
		equal(renderer().firstChild.firstChild.nodeValue, "Matthew");
	});

	test("a CanMap constructor as scope", function() {
		var MyMap = CanMap.extend({
			name: "Matthew"
		});

		Component.extend({
			tag: "can-map-viewmodel",
			view: stache("{{name}}"),
			scope: MyMap
		});

		var renderer = stache("<can-map-viewmodel></can-map-viewmodel>");
		equal(renderer().firstChild.firstChild.nodeValue, "Matthew");
	});

	test("an object is turned into a CanMap as viewModel", function() {
		Component.extend({
			tag: "can-map-viewmodel",
			view: stache("{{name}}"),
			viewModel: {
				name: "Matthew"
			}
		});

		var renderer = stache("<can-map-viewmodel></can-map-viewmodel>");

		var fragOne = renderer();
		var vmOne = canViewModel(fragOne.firstChild);

		var fragTwo = renderer();
		var vmTwo = canViewModel(fragTwo.firstChild);

		vmOne.attr("name", "Wilbur");

		equal(fragOne.firstChild.firstChild.nodeValue, "Wilbur", "The first map changed values");
		equal(fragTwo.firstChild.firstChild.nodeValue, "Matthew", "The second map did not change");
	});

	test("Providing viewModel and ViewModel throws", function() {
		try {
			Component.extend({
				tag: "viewmodel-test",
				view: stache("<div></div>"),
				viewModel: {},
				ViewModel: CanMap.extend({})
			});

			ok(false, "Should have thrown because we provided both");
		} catch(er) {
			ok(true, "It threw because we provided both viewModel and ViewModel");
		}
	});

	test("content in a list", function () {
		var renderer = stache('<my-list>{{name}}</my-list>');

		Component.extend({
			tag: "my-list",
			view: stache("{{#each items}}<li><content/></li>{{/each}}"),
			leakScope: true,
			viewModel: {
				items: new CanList([{
					name: "one"
				}, {
					name: "two"
				}])
			}
		});

		var lis = renderer()
			.firstChild.getElementsByTagName("li");

		equal(innerHTML(lis[0]), "one", "first li has correct content");
		equal(innerHTML(lis[1]), "two", "second li has correct content");

	});

	test("don't update computes unnecessarily", function () {
		var sourceAge = 30,
			timesComputeIsCalled = 0;

		var age = canCompute(function (newVal) {
			timesComputeIsCalled++;
			if (timesComputeIsCalled === 1) {
				ok(true, "reading initial value to set as years");
			} else if (timesComputeIsCalled === 2) {
				equal(newVal, 31, "updating value to 31");
			} else if (timesComputeIsCalled === 3) {
				ok(true, "called back another time after set to get the value");
			} else {
				ok(false, "You've called the callback " + timesComputeIsCalled + " times");
			}

			if (arguments.length) {
				sourceAge = newVal;
			} else {
				return sourceAge;
			}
		});

		Component.extend({
			tag: "age-er"
		});

		var renderer = stache("<age-er {(years)}='age'></age-er>");

		renderer({
			age: age
		});

		age(31);

	});

	test("component does not respect canCompute passed via attributes (#540)", function () {

		var data = {
			compute: canCompute(30)
		};

		Component.extend({
			tag: "my-component",
			view: stache("<span>{{blocks}}</span>")
		});

		var renderer = stache("<my-component {(blocks)}='compute'></my-component>");

		var frag = renderer(data);

		equal( innerHTML(frag.firstChild.firstChild), "30");

	});

	test("defined view models (#563)", function () {

		var HelloWorldModel = CanMap.extend({
			visible: true,
			toggle: function () {
				this.attr("visible", !this.attr("visible"));
			}
		});

		Component.extend({
			tag: "my-helloworld",
			view: stache("<h1>{{#if visible}}visible{{else}}invisible{{/if}}</h1>"),
			ViewModel: HelloWorldModel
		});

		var renderer = stache("<my-helloworld></my-helloworld>");

		var frag = renderer({});

		equal( innerHTML(frag.firstChild.firstChild), "visible");
	});

	test("viewModel not rebound correctly (#550)", function () {

		var nameChanges = 0;

		Component.extend({
			tag: "viewmodel-rebinder",
			events: {
				"{name} change": function () {
					nameChanges++;
				}
			}
		});

		var renderer = stache("<viewmodel-rebinder></viewmodel-rebinder>");

		var frag = renderer();
		var viewModel = canViewModel(frag.firstChild);

		var n1 = canCompute(),
			n2 = canCompute();

		viewModel.attr("name", n1);

		n1("updated");

		viewModel.attr("name", n2);

		n2("updated");


		equal(nameChanges, 2);
	});

	test("content extension stack overflow error", function () {

		Component({
			tag: 'outer-tag',
			view: stache('<inner-tag>inner-tag CONTENT <content/></inner-tag>')
		});

		Component({
			tag: 'inner-tag',
			view: stache('inner-tag TEMPLATE <content/>')
		});

		// currently causes Maximum call stack size exceeded
		var renderer = stache("<outer-tag>outer-tag CONTENT</outer-tag>");

		// RESULT = <outer-tag><inner-tag>inner-tag TEMPLATE inner-tag CONTENT outer-tag CONTENT</inner-tag></outer-tag>

		var frag = renderer();

		equal( innerHTML(frag.firstChild.firstChild), 'inner-tag TEMPLATE inner-tag CONTENT outer-tag CONTENT');

	});

	test("inserted event fires twice if component inside live binding block", function () {

		var inited = 0,
			inserted = 0;

		Component.extend({
			tag: 'child-tag',

			ViewModel: CanMap.extend({
				init: function () {
					inited++;
				}
			}),
			events: {
				' inserted': function () {
					inserted++;
				}
			}
		});

		Component.extend({
			tag: 'parent-tag',

			view: stache('{{#shown}}<child-tag></child-tag>{{/shown}}'),

			viewModel: {
				shown: false
			},
			events: {
				' inserted': function () {
					this.viewModel.attr('shown', true);
				}
			}
		});

		var frag = stache("<parent-tag id='pt'></parent-tag>")({});

		domMutate.appendChild.call(this.fixture, frag);
		stop();
		function checkCount(){
			if(inserted >= 1) {
				equal(inited, 1, "inited");
				equal(inserted, 1, "inserted");
				start();
			} else {
				setTimeout(checkCount,30);
			}
		}

		checkCount();
	});


	test("@ keeps properties live now", function () {

		Component.extend({
			tag: "attr-fun",
			view: stache("<h1>{{fullName}}</h1>"),
			ViewModel: CanMap.extend({
				fullName: function () {
					return this.attr("firstName") + " " + this.attr("lastName");
				}
			})
		});

		var frag = stache("<attr-fun first-name='Justin' last-name='Meyer'></attr-fun>")();

		var attrFun = frag.firstChild;

		this.fixture.appendChild(attrFun);

		equal( innerHTML(attrFun.firstChild), "Justin Meyer");

		attr.set(attrFun, "first-name", "Brian");

		stop();

		setTimeout(function () {
			equal(attrFun.firstChild.firstChild.nodeValue, "Brian Meyer");
			start();
		}, 100);

	});

	test("id and class should work now (#694)", function () {
		Component.extend({
			tag: "stay-classy",
			ViewModel: CanMap.extend({
				notid: "foo",
				notclass: 5,
				notdataviewid: {}
			})
		});

		var data = {
			idData: "id-success",
			classData: "class-success"
		};

		var frag = stache(
			"<stay-classy {(id)}='idData'" +
			" {(class)}='classData'></stay-classy>")(data);

		var stayClassy = frag.firstChild;

		domMutate.appendChild.call(this.fixture, frag);

		var viewModel = canViewModel(stayClassy);

		equal(viewModel.attr("id"), "id-success");
		equal(viewModel.attr("class"), "class-success");
	});

	test("Component can-click method should be not called while component's init", function () {

		var called = false;

		Component.extend({
			tag: "child-tag"
		});

		Component.extend({
			tag: "parent-tag",
			view: stache('<child-tag can-click="method"></child-tag>'),
			viewModel: {
				method: function () {
					called = true;
				}
			}
		});

		stache('<parent-tag></parent-tag>')();

		equal(called, false);
	});


	test('Same component tag nested', function () {
		Component({
			'tag': 'my-tag',
			view: stache('<p><content/></p>')
		});
		//simplest case
		var renderer = stache('<div><my-tag>Outter<my-tag>Inner</my-tag></my-tag></div>');
		//complex case
		var renderer2 = stache('<div><my-tag>3<my-tag>2<my-tag>1<my-tag>0</my-tag></my-tag></my-tag></my-tag></div>');
		//edge case for new logic (same custom tag at same depth as one previously encountered)
		var renderer3 = stache('<div><my-tag>First</my-tag><my-tag>Second</my-tag></div>');


		equal( renderer({}).firstChild.getElementsByTagName('p').length, 2, 'proper number of p tags');

		equal( renderer2({}).firstChild.getElementsByTagName('p').length, 4, 'proper number of p tags');

		equal( renderer3({}).firstChild.getElementsByTagName('p').length, 2, 'proper number of p tags');

	});

	test("Component events bind to window", function(){
		window.tempMap = new CanMap();

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

		window.tempMap.attr("prop","value");

		// IE 6-8 throws an error when deleting globals created via assignment:
		// http://perfectionkills.com/understanding-delete/#ie_bugs
		window.tempMap = undefined;
		try{
			delete window.tempMap;
		} catch(e) {}

	});

	test("Construct are passed normally", function(){
		var Constructed = Construct.extend({foo:"bar"},{});

		Component.extend({
			tag: "con-struct",
			view: stache("{{con.foo}}")
		});

		var stached = stache("<con-struct {(con)}='Constructed'></con-struct>");

		var res = stached({
			Constructed: Constructed
		});

		equal(innerHTML(res.firstChild), "bar");


	});


	test("passing id works now", function(){

		Component.extend({
			tag: 'my-thing',
			view: stache('hello')
		});
		var renderer = stache("<my-thing {(id)}='productId'></my-tagged>");
		var frag = renderer(new CanMap({productId: 123}));
		equal( canViewModel(frag.firstChild).attr("id"), 123);
	});


	test("stache conditionally nested components calls inserted once (#967)", function(){
		expect(1);

		Component.extend({
			tag: "can-parent-stache",
			viewModel: {
				shown: true
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

		domMutate.appendChild.call(this.fixture, renderer());
		stop();
		setTimeout(start, 100);
	});

	test("hyphen-less tag names", function () {
		Component.extend({
			tag: "foobar",
			view: stache("<div>{{name}}</div>"),
			viewModel: {
				name: "Brian"
			}
		});

		var renderer = stache('<span></span><foobar></foobar>');

		var frag = renderer();

		equal(frag.lastChild.firstChild.firstChild.nodeValue, "Brian");

	});

	test('nested component within an #if is not live bound(#1025)', function() {
		Component.extend({
			tag: 'parent-component',
			view: stache('{{#if shown}}<child-component></child-component>{{/if}}'),
			viewModel: {
				shown: false
			}
		});

		Component.extend({
			tag: 'child-component',
			view: stache('Hello world.')
		});

		var renderer = stache('<parent-component></parent-component>');
		var frag = renderer({});

		equal( innerHTML(frag.firstChild), '', 'child component is not inserted');
		canViewModel(frag.firstChild).attr('shown', true);

		equal( innerHTML(frag.firstChild.firstChild), 'Hello world.', 'child component is inserted');
		canViewModel(frag.firstChild).attr('shown', false);

		equal( innerHTML(frag.firstChild), '', 'child component is removed');
	});

	test('component does not update viewModel on id, class, and data-view-id attribute changes (#1079)', function(){

		Component.extend({
			tag:'x-app'
		});

		var frag=stache('<x-app></x-app>')({});

		var el = frag.firstChild;
		var viewModel = canViewModel(el);

		// element must be inserted, otherwise attributes event will not be fired
		domMutate.appendChild.call(this.fixture,frag);

		// update the class
		className.add.call(el,"foo");

		stop();
		setTimeout(function(){
			equal(viewModel.attr('class'),undefined, "the viewModel is not updated when the class attribute changes");
			start();
		}, 100);

	});

	test('viewModel objects with Constructor functions as properties do not get converted (#1261)', 1, function(){
		stop();

		var Test = CanMap.extend({
			test: 'Yeah'
		});

		Component.extend({
			tag:'my-app',
			viewModel: {
				MyConstruct: Test
			},
			events: {
				'{MyConstruct} something': function() {
					ok(true, 'Event got triggered');
					start();
				}
			}
		});

		var frag = stache('<my-app></my-app>')();

		// element must be inserted, otherwise attributes event will not be fired
		domMutate.appendChild.call(this.fixture,frag);

		canEvent.trigger.call(Test, 'something');
	});

	test('removing bound viewModel properties on destroy #1415', function(){
		var state = new CanMap({
			product: {
				id: 1,
				name: "Tom"
			}
		});

		Component.extend({
			tag: 'destroyable-component',
			events: {
				destroy: function(){
					this.viewModel.attr('product', null);
				}
			}
		});

		var frag = stache('<destroyable-component {(product)}="product"></destroyable-component>')(state);

		// element must be inserted, otherwise attributes event will not be fired
		domMutate.appendChild.call(this.fixture,frag);

		domMutate.removeChild.call(this.fixture, this.fixture.firstChild);
		stop();
		setTimeout(function(){
			ok(state.attr('product') == null, 'product was removed');
			start();
		}, 100);
	});

	test('changing viewModel property rebinds {viewModel.<...>} events (#1529)', 2, function(){
		Component.extend({
			tag: 'rebind-viewmodel',
			events: {
				init: function(){
					this.viewModel.attr('item', {});
				},
				'{scope.item} change': function() {
					ok(true, 'Change event on scope');
				},
				'{viewModel.item} change': function() {
					ok(true, 'Change event on viewModel');
				}
			}
		});
		var frag = stache('<rebind-viewmodel></rebind-viewmodel>')();
		var rebind = frag.firstChild;
		domMutate.appendChild.call(this.fixture, rebind);

		canViewModel(rebind).attr('item.name', 'CDN');
	});


	test('Component two way binding loop (#1579)', function() {
		var changeCount = 0;

		Component.extend({
			tag: 'product-swatch-color',
			viewModel: {
				tag: 'product-swatch-color'
			}
		});


		Component.extend({
			tag: 'product-swatch',
			view: stache('<product-swatch-color {(variations)}="variations"></product-swatch-color>'),
			ViewModel: CanMap.extend({
				tag: "product-swatch",
				define: {
					variations: {
						set: function(variations) {
							if(changeCount > 500) {
								return;
							}
							changeCount++;
							return new CanList(variations.attr());
						}
					}
				}
			})
		});

		var frag = stache('<product-swatch></product-swatch>')(),
			productSwatch = frag.firstChild;

		canBatch.start();
		canViewModel( productSwatch ).attr('variations', new CanList());
		canBatch.stop();


		ok(changeCount < 500, "more than 500 events");
	});

	test("references scopes are available to bindings nested in components (#2029)", function(){

		var renderer = stache('<export-er {^value}="*reference" />'+
			'<wrap-er><simple-example {key}="*reference"/></wrap-er>');

		Component.extend({
			tag : "wrap-er"
		});
		Component.extend({
			tag : "export-er",
			events : {
				"init" : function() {
					var self = this.viewModel;
					stop();
					setTimeout(function() {
						self.attr("value", 100);
						var wrapper = frag.lastChild,
							simpleExample = wrapper.firstChild,
							textNode = simpleExample.firstChild;
						equal(textNode.nodeValue, "100", "updated value with reference");
						start();
					}, 100);

				}
			}
		});

		Component.extend({
			tag : "simple-example",
			view : stache("{{key}}"),
			viewModel : {}
		});
		var frag = renderer({});

	});

	test('two-way binding syntax PRIOR to v2.3 shall NOT let a child property initialize an undefined parent property (#2020)', function(){
		var renderer = stache('<pa-rent/>');

		Component.extend({
			tag : 'pa-rent',
			view: stache('<chi-ld child-prop="{parentProp}" />')
		});

		Component.extend({
			tag : 'chi-ld',
			viewModel: {
				childProp: 'bar'
			}
		});

		var frag = renderer({});

		var parentVM = canViewModel(frag.firstChild);
		var childVM = canViewModel(frag.firstChild.firstChild);

		equal(parentVM.attr('parentProp'), undefined, 'parentProp is undefined');
		equal(childVM.attr('childProp'), 'bar', 'childProp is bar');

		parentVM.attr('parentProp', 'foo');

		equal(parentVM.attr('parentProp'), 'foo', 'parentProp is foo');
		equal(childVM.attr('childProp'), 'foo', 'childProp is foo');

		childVM.attr('childProp', 'baz');

		equal(parentVM.attr('parentProp'), 'baz', 'parentProp is baz');
		equal(childVM.attr('childProp'), 'baz', 'childProp is baz');
	});

	test('two-way binding syntax INTRODUCED in v2.3 ALLOWS a child property to initialize an undefined parent property', function(){
		var renderer = stache('<pa-rent/>');

		Component.extend({
			tag : 'pa-rent',
			view: stache('<chi-ld {(child-prop)}="parentProp" />')
		});

		Component.extend({
			tag : 'chi-ld',
			viewModel: {
				childProp: 'bar'
			}
		});

		var frag = renderer({});

		var parentVM = canViewModel(frag.firstChild);
		var childVM = canViewModel(frag.firstChild.firstChild);

		equal(parentVM.attr('parentProp'), 'bar', 'parentProp is bar');
		equal(childVM.attr('childProp'), 'bar', 'childProp is bar');

		parentVM.attr('parentProp', 'foo');

		equal(parentVM.attr('parentProp'), 'foo', 'parentProp is foo');
		equal(childVM.attr('childProp'), 'foo', 'childProp is foo');

		childVM.attr('childProp', 'baz');

		equal(parentVM.attr('parentProp'), 'baz', 'parentProp is baz');
		equal(childVM.attr('childProp'), 'baz', 'childProp is baz');
	});

	test("conditional attributes (#2077)", function(){
		Component.extend({
			tag: 'some-comp'
		});
		var renderer = stache("<some-comp "+
			"{{#if preview}}{next}='nextPage'{{/if}} "+
			"{swap}='{{swapName}}' "+
			"{{#preview}}checked{{/preview}} "+
			"></some-comp>");

		var map = new CanMap({
			preview: true,
			nextPage: 2,
			swapName: "preview"
		});
		var frag = renderer(map);

		var vm = canViewModel(frag.firstChild);

		var threads = [
			function(){

				equal(vm.attr("next"), 2, "has binidng");
				equal(vm.attr("swap"), true, "swap - has binding");
				equal(vm.attr("checked"), "", "attr - has binding");
				map.attr("preview", false);
			},
			function(){
				equal(vm.attr("swap"), false, "swap - updated binidng");

				ok(vm.attr("checked") === null, "attr - value set to null");

				map.attr("nextPage", 3);
				equal(vm.attr("next"), 2, "not updating after binding is torn down");
				map.attr("preview", true);

			},
			function(){
				equal(vm.attr("next"), 3, "re-initialized with binding");
				equal(vm.attr("swap"), true, "swap - updated binidng");
				equal(vm.attr("checked"), "", "attr - has binding set again");
				map.attr("swapName", "nextPage");
			},
			function(){
				equal(vm.attr("swap"), 3, "swap - updated binding key");
				map.attr("nextPage",4);
				equal(vm.attr("swap"), 4, "swap - updated binding");
			}
		];
		stop();
		var index = 0;
		var next = function(){
			if(index < threads.length) {
				threads[index]();
				index++;
				setTimeout(next, 150);
			} else {
				start();
			}
		};
		setTimeout(next, 100);
	});

	test("<content> (#2151)", function(){
		var mapInstance = new CanMap({
			items:[{
				id : 1,
				context : 'Item 1',
				render : false
			}, {
				id : 2,
				context : 'Item 2',
				render : false
			}]
		});

		Component.extend({
			tag : 'list-items',
			view : stache("<ul>"+
				"{{#items}}"+
					"{{#if render}}"+
						"<li><content /></li>"+
					"{{/if}}"+
					"{{/items}}"+
				"</ul>"),
			viewModel: mapInstance,
			leakScope: true
		});

		Component.extend({
			tag : 'list-item',
			view : stache("{{item.context}}")
		});

		var renderer = stache("<list-items><list-item item='{.}'/></list-items>");

		var frag = renderer();

		canBatch.start();
		canViewModel(frag.firstChild).attr('items').each(function(item, index) {
			item.attr('render', true);
		});
		canBatch.stop();

		var lis = frag.firstChild.getElementsByTagName("li");
		ok( innerHTML(lis[0]).indexOf("Item 1") >= 0, "Item 1 written out");
		ok( innerHTML(lis[1]).indexOf("Item 2") >= 0, "Item 2 written out");

	});

	test("one-way - child to parent - parent that does not leak scope, but has no view", function(){
		Component.extend({
			tag: "outer-noleak",
			viewModel: {
				isOuter: true
			},
			leakScope: false
		});
		Component.extend({
			tag: "my-child",
			viewModel : {
				isChild: true
			},
			leakScope: false
		});


		var renderer = stache("<outer-noleak><my-child {^.}='myChild'/></outer-noleak>");
		var frag = renderer();
		var vm = canViewModel(frag.firstChild);
		ok(vm.attr("myChild") instanceof CanMap, "got instance");

	});

	test('two-way - reference - with <content> tag', function(){
		Component.extend({
			tag: "other-export",
			viewModel: {
				name: "OTHER-EXPORT"
			}
		});

		Component.extend({
			tag: "ref-export",
			view: stache('<other-export {(name)}="*otherExport"/><content>{{*otherExport}}</content>')
		});

		// this should have otherExport name in the page
		var t1 = stache("<ref-export></ref-export>");

		// this should not have anything in 'one', but something in 'two'
		//var t2 = stache("<form><other-export *other/><ref-export><b>{{*otherExport.name}}</b><label>{{*other.name}}</label></ref-export></form>");

		var f1 = t1();
		equal(canViewModel( f1.firstChild.firstChild ).attr("name"), "OTHER-EXPORT", "viewModel set correctly");
		equal(f1.firstChild.lastChild.nodeValue, "OTHER-EXPORT", "content");

		/*var f2 = t2();
		var one = f2.firstChild.getElementsByTagName('b')[0];
		var two = f2.firstChild.getElementsByTagName('label')[0];

		equal(one.firstChild.nodeValue, "", "external content, internal export");
		equal(two.firstChild.nodeValue, "OTHER-EXPORT", "external content, external export");*/
	});

	test("custom renderer can provide setupBindings", function(){
		getDocument(document);
		var rendererFactory = function(tmpl){
			var frag = getFragment(tmpl);
			return function(scope, options){
				scope = scope || new Scope();
				options = options || new Scope.Options({});

				if(frag.firstChild.nodeName === "CUSTOM-RENDERER") {
					viewCallbacks.tagHandler(frag.firstChild, "custom-renderer", {
						scope: scope,
						options: options,
						templateType: "my-renderer",
						setupBindings: function(el, callback, data){
							callback({
								foo: "qux"
							});
						}
					});
				} else {
					var tn = frag.firstChild.firstChild;
					tn.nodeValue = scope.read("foo").value;
				}

				return frag;
			};
		};

		Component.extend({
			tag: "custom-renderer",
			view: rendererFactory("<div>{{foo}}</div>"),
			ViewModel: CanMap.extend({})
		});

		var renderer = rendererFactory("<custom-renderer foo='bar'></custom-renderer>");
		var frag = renderer();

		var tn = frag.firstChild.firstChild.firstChild;
		equal(tn.nodeValue, "qux", "was bound!");
	});

if(System.env !== 'canjs-test') {
		// Brittle in IE
		test("basic tabs", function () {
			var TabsViewModel = CanMap.extend({
				init: function() {
					this.attr('panels', []);
				},
				addPanel: function (panel) {

					if (this.attr("panels")
						.length === 0) {
						this.makeActive(panel);
					}
					this.attr("panels")
						.push(panel);
				},
				removePanel: function (panel) {
					var panels = this.attr("panels");
					canBatch.start();
					var index = panels.indexOf(panel);
					canLog.log(index);
					panels.splice(index, 1);
					if (panel === this.attr("active")) {
						if (panels.length) {
							this.makeActive(panels[0]);
						} else {
							this.removeAttr("active");
						}
					}
					canBatch.stop();
				},
				makeActive: function (panel) {
					this.attr("active", panel);
					this.attr("panels")
						.each(function (panel) {
							panel.attr("active", false);
						});
					panel.attr("active", true);

				},
				// this is viewModel, not stache
				// consider removing viewModel as arg
				isActive: function (panel) {
					return this.attr('active') === panel;
				}
			});

			// new Tabs() ..
			Component.extend({
				tag: "tabs",
				ViewModel: TabsViewModel,
				view: stache("<ul>" +
					"{{#panels}}" +
					"<li {{#isActive(.)}}class='active'{{/isActive}} can-click='makeActive'>{{title}}</li>" +
					"{{/panels}}" +
					"</ul>" +
					"<content></content>")
			});

			Component.extend({
				// make sure <content/> works
				view: stache("{{#if active}}<content></content>{{/if}}"),
				tag: "panel",
				ViewModel: CanMap.extend({
					active: false
				}),
				events: {
					" inserted": function () {
						canViewModel(this.element.parentNode)
							.addPanel(this.viewModel);

					},

					" beforeremove": function () {
						canLog.log("I AM BEING REMOVED");
						canViewModel(this.element.parentNode)
							.removePanel(this.viewModel);
					}
				}
			});

			var renderer = stache("<tabs>{{#each foodTypes}}<panel title='{{title}}'>{{content}}</panel>{{/each}}</tabs>");

			var foodTypes = new CanList([{
				title: "Fruits",
				content: "oranges, apples"
			}, {
				title: "Breads",
				content: "pasta, cereal"
			}, {
				title: "Sweets",
				content: "ice cream, candy"
			}]);

			var frag = renderer({
				foodTypes: foodTypes
			});

			domMutate.appendChild.call(this.fixture, frag);

			var testArea = this.fixture;

			stop();

			runTasks([
				function() {
					var lis = testArea.getElementsByTagName("li");

					equal(lis.length, 3, "three lis added");

					foodTypes.each(function (type, i) {
						equal(innerHTML(lis[i]), type.attr("title"), "li " + i + " has the right content");
					});

					foodTypes.push({
						title: "Vegies",
						content: "carrots, kale"
					});
				}, function(){
					var lis = testArea.getElementsByTagName("li");

					equal(lis.length, 4, "li added");


					foodTypes.each(function (type, i) {
						equal( innerHTML(lis[i]), type.attr("title"), "li " + i + " has the right content");
					});

					equal(testArea.getElementsByTagName("panel")
						.length, 4, "panel added");
					canLog.log("SHIFTY");
					foodTypes.shift();
				},
				function(){
					var lis = testArea.getElementsByTagName("li");

					equal(lis.length, 3, "removed li after shifting a foodType");
					foodTypes.each(function (type, i) {
						equal( innerHTML(lis[i]), type.attr("title"), "li " + i + " has the right content");
					});

					// test changing the active element
					var panels = testArea.getElementsByTagName("panel");

					equal(lis[0].className, "active", "the first element is active");
					equal(innerHTML( panels[0] ), "pasta, cereal", "the first content is shown");
					equal(innerHTML( panels[1] ), "", "the second content is removed");

					canEvent.trigger.call(lis[1], "click");
					lis = testArea.getElementsByTagName("li");

					equal(lis[1].className, "active", "the second element is active");
					equal(lis[0].className, "", "the first element is not active");

					equal( innerHTML( panels[0]), "", "the second content is removed");
					equal( innerHTML( panels[1]), "ice cream, candy", "the second content is shown");
				}
			]);
		});

		test('DOM trees not releasing when referencing CanMap inside CanMap in view (#1593)', function() {
			var baseTemplate = stache('{{#if show}}<my-outside></my-outside>{{/if}}'),
				show = canCompute(true),
				state = new CanMap({
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
				view: stache('{{#if state.inner}}<my-inside></my-inside>{{/if}}'),
				leakScope: true
			});

			domMutate.appendChild.call(this.fixture, baseTemplate({
				show: show,
				state: state
			}));

			runTasks([function(){
				show(false);
			},function(){
				state.removeAttr('inner');
			}, function(){
				equal(removeCount, 1, 'internal removed once');
				show(true);
			}, function(){
				state.attr('inner', 2);
			}, function(){
				state.removeAttr('inner');
			}, function(){
				equal(removeCount, 2, 'internal removed twice');
			}]);

			stop();

		});
	}
}
