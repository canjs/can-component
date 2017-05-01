var Component = require("can-component");
var stache = require("can-stache");
var QUnit = require("steal-qunit");

var define = require("can-define");
var viewModel = require("can-view-model");

QUnit.module("can-components - extensibility");

QUnit.test("Component renders parent template if one isn't provided", function() {
  var BaseComponent = Component.extend({
    tag: "base-component",
    template: stache("Hello")
  });

  var ExtendedComponent = BaseComponent.extend({
    tag: "extended-component"
  });

  var frag = stache("<extended-component />")({});

  QUnit.equal(frag.firstChild.innerHTML, "Hello");
});

QUnit.test("Component and inherited component each render unique template", function() {
  var BaseComponent = Component.extend({
    tag: "base-component",
    template: stache("Hello")
  });

  var ExtendedComponent = BaseComponent.extend({
    tag: "extended-component",
    template: stache ("Hi there")
  });

  var extendedFrag = stache("<extended-component />")({});
  var baseFrag = stache("<base-component />")({});

  QUnit.equal(extendedFrag.firstChild.innerHTML, "Hi there");
  QUnit.equal(baseFrag.firstChild.innerHTML, "Hello");
});

QUnit.test("Extended component should listen to events it inherits", function() {
  var baseOnInsert = function onInsert() { }
  var baseOnRemove = function onRemove() { }
  var BaseComponent = Component.extend({
    tag: "base-component",
    template: stache("{{name}}"),
    events: {
      " inserted": baseOnInsert,
      " beforeremoved": baseOnRemove,
      "{viewModel} name": function onNameChange(viewModel, ev, name) {
        QUnit.equal(name, "Josh");
      }
    }
  });

  var ExtendedComponent = BaseComponent.extend({
    tag: "extended-component",
    events: {
      " inserted": function() { }
    }
  });

  QUnit.ok(ExtendedComponent.prototype.events["{viewModel} name"], "{viewModel} name inherited");
  QUnit.equal(ExtendedComponent.prototype.events[" beforeremoved"], baseOnRemove, "before remove event inherited");
  QUnit.notEqual(ExtendedComponent.prototype.events[" inserted"], baseOnInsert, "inserted event overwritten");
});

QUnit.test("Extended component should have access to parent helpers", function() {
  var BaseComponent = Component.extend({
    tag: "base-component",
    helpers: {
      prependText: function(value, text) {
        return [text, value].join(" ");
      }
    }
  });

  var ExtendedComponent = BaseComponent.extend({
    tag: "extended-component",
    template: stache("<h1>{{prependText('Dean', 'Mr.'')}}</h1>")
  });

  var frag = stache("<extended-component />")({});

  QUnit.equal(frag.firstChild.innerHTML, "<h1>Mr. Dean</h1>");
});

QUnit.test("Self closed super tag works", function() {
  var ViewModel = define.Constructor({
    firstName: {
      type: "string",
    },
    lastName: {
      type: "string",
    },
    fullName: {
      get: function () {
        return [this.firstName, this.lastName].join(" ");
      },
    },
  });

  var NameComponent = Component.extend({
    tag: "name-component",
    ViewModel: ViewModel,
    template: stache("{{fullName}}")
  })

  var WelcomeComponent = NameComponent.extend({
    tag: "welcome-component",
    template: stache("Welcome to Bitovi <super />!")
  });

  var frag = stache("<welcome-component {first-name}='firstName' {last-name}='lastName' />")({
    firstName: "Josh",
    lastName: "Dean"
  });
  var vm = viewModel(frag.firstChild);

  QUnit.equal(frag.firstChild.innerHTML, "Welcome to Bitovi Josh Dean!", "Rendered tag with super");

  vm.firstName = "Justin";
  vm.lastName = "Meyer";

  QUnit.equal(frag.firstChild.innerHTML, "Welcome to Bitovi Justin Meyer!", "Rendered fullName after change");
});

QUnit.test("<super> tag with inner HTML render in parent component's <content> tag", function() {
  var FormComponent = Component.extend({
    tag: "form-component",
    template: stache("<form><content/></form>")
  });

  var ExampleFormComponent = FormComponent.extend({
    tag: "example-form-component",
    template: stache("<super><input {($value)}=\"val\">{{val}}</super>")
  });

  var frag = stache("<example-form-component {val}=\"value\" />")({
    value: "foo"
  });

  QUnit.equal(frag.firstChild.innerHTML, "<form><input {($value)}=\"val\" value=\"foo\">foo</form>");
  QUnit.equal(frag.firstChild.getElementsByTagName("input")[0].value, "foo");
});

/*QUnit.test("Components that are extended more than once will render all content", function() {
  var FooComponent = Component.extend({
    tag: "foo-component",
    template: stache("Foo")
  });

  var BarComponent = FooComponent.extend({
    tag: "bar-component",
    template: stache("<super /> Bar")
  });

  var BazComponent = BarComponent.extend({
    tag: "baz-component",
    template: stache("<super /> Baz")
  });

  var frag = stache("<bar-component />")({});

  QUnit.equal(frag.firstChild.innerHTML, "Foo Bar Baz", "renders nested supers correctly");
});*/