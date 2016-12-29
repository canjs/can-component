@module {constructor} can-component can-component
@download can/component
@test can/component/test.html
@parent can-core
@release 2.0
@link ../docco/component/component.html docco
@group can-component.static 0 static
@group can-component.prototype 1 prototype
@group can-component.elements 2 elements
@group can-component.events 3 special events
@package ../package.json

@description Create a custom element that can be used to manage widgets
or application logic.

@signature `<TAG BINDINGS...>[LIGHT_DOM]</TAG>`

  Create an instance of a component on a particular tag in a [can-stache] template.
  In 2.3, use the [can-stache-bindings bindings] syntaxes to set up bindings.

  @release 2.3

  @param {String} TAG An HTML tag name that matches the [can-component::tag tag]
  property of the component. Tag names should include a hypen (`-`) or a colon (`:`) like:
  `acme-tabs` or `acme:tabs`.

  @param {can-stache-bindings} [BINDINGS] Use the following binding syntaxes
  to connect the component’s [can-component::ViewModel] to the template’s [can-view-scope scope]:

   - [can-stache-bindings.toChild]=[can-stache.expressions expression] — one-way data binding to child
   - [can-stache-bindings.toParent]=[can-stache.expressions expression] — one-way data binding to parent
   - [can-stache-bindings.twoWay]=[can-stache.expressions expression] — two-way data binding child to parent
   - [can-stache-bindings.event]=[can-stache/expressions/call expression] — event binding on the view model

   Note that because DOM attribute names are case-insensitive, use hypens (`-`) to
   in the attribute name to setup for `camelCase` properties.

   Example:

   ```
   <my-tag {to-child}="expression"
           {^to-parent}="expression"
           {(two-way)}="expression"
           (event)="callExpression()"></my-tag>
   ```

   @param {can-stache.sectionRenderer} [LIGHT_DOM] The content between the starting and ending
   tag. For example, `Hello <b>World</b>` is the `LIGHT_DOM` in the following:

   ```
   <my-tag>Hello <b>World</b></my-tag>
   ```

   The `LIGHT_DOM` can be positioned with a component’s [can-component.prototype.view] with
   the [can-component/content] element.  The data accessible to the `LIGHT_DOM` can be controlled
   with [can-component.prototype.leakScope].


@body


## Use

To create a Component, you must first [can-component.extend extend] `Component`
with the methods and properties of how your component behaves:

```js
var Component = require("can-component");
var DefineMap = require("can-define/map/map");
var stache = require("can-stache");

var HelloWorldVM = DefineMap.extend({
    visible: {value: false},
    message: {value: "Hello There!"}
});

Component.extend({
  tag: "hello-world",
  view: stache("{{#if visible}}{{message}}{{else}}Click me{{/if}}"),
  ViewModel: HelloWorldVM,
  events: {
    click: function(){
    	this.viewModel.visible = !this.viewModel.visible;
    }
  }
});
```

This element says “Click me” until a user clicks it and then
says “Hello There!”.  To create a a instance of this component on the page,
add `<hello-world/>` to a [can-stache] template, render
the template and insert the result in the page like:

    var template = stache("<hello-world/>");
    document.body.appendChild(template({}));

Check this out here:

@demo demos/can-component/click_me.html


Typically, you do not append a single component at a time.  Instead,
you'll render a template with many custom tags like:

    <srchr-app>
      <srchr-search {models}="models">
        <input name="search"/>
      </srchr-search>
      <ui-panel>
        <srchr-history/>
        <srchr-results {models}="models"/>
      </ui-panel>
    </srchr-app>

### Defining a Component

Use [can-component.extend] to define a `Component` constructor function
that automatically gets initialized whenever the component’s tag is
found.

Note that inheriting from components works differently than other CanJS APIs. You
can’t call `.extend` on a particular component to create a “subclass” of that component.

Instead, components work more like HTML elements. To reuse functionality from a base component, build on top of it with parent
components that wrap other components in their template and pass any needed viewModel properties via attributes.

### Tag

A component’s [can-component::tag tag] is the element node name that
the component will be created on.


The following matches `<hello-world>` elements.

    Component.extend({
      tag: "hello-world"
    });

### View

A component’s [can-component::view view] is a template that is rendered as
the element’s innerHTML.

The following component:

    Component.extend({
      tag: "hello-world",
      view: stache("<h1>Hello World</h1>")
    });

Changes `<hello-world/>` elements into:

    <hello-world><h1>Hello World</h1></hello-world>

Use the [can-component/content] tag to position the custom element’s source HTML.

The following component:

    Component.extend({
      tag: "hello-world",
      view: stache("<h1><content/></h1>")
    });

Changes `<hello-world>Hi There</hello-world>` into:

    <hello-world><h1>Hi There</h1></hello-world>

### ViewModel

A component’s [can-component::ViewModel ViewModel] defines a constructor that creates
instances used to render the component’s template. The instance’s properties
are typically set by attribute [can-stache-bindings data bindings] on the custom element.
By default, every data binding’s value is looked up in the parent [can-view-scope]
of the custom element and added to the viewModel object.

The following component:

    Component.extend({
      tag: "hello-world",
      view: stache("<h1>{{message}}</h1>")
    });

Changes the following rendered template:

    var template = stache("<hello-world {message}='greeting'/>");
    template({
      greeting: "Salutations"
    })

Into:

    <hello-world><h1>Salutations</h1></hello-world>

Default values can be provided. The following component:

    Component.extend({
      tag: "hello-world",
      view: stache("<h1>{{message}}</h1>"),
      viewModel: {
        message: "Hi"
      }
    });

Changes the following rendered template:

    var template = stache("<hello-world/>");
    template({})

Into:

    <hello-world><h1>Hi</h1></hello-world>

If you want to set the string value of the attribute on the ViewModel,
set an attribute without any binding syntax.

The following template, with the previous `hello-world` component:

    var template = stache("<hello-world message='Howdy'/>");
    template({})

Renders to:

    <hello-world><h1>Howdy</h1></hello-world>

### Events

A component’s [can-component::events events] object is used to listen to events (that are not
listened to with [can-stache-bindings view bindings]). The following component
adds “!” to the message every time `<hello-world>` is clicked:

    Component.extend({
      tag: "hello-world",
      view: stache("<h1>{{message}}</h1>"),
      events: {
        "click" : function(){
          var currentMessage = this.viewModel.message;
          this.viewModel.message = currentMessage+ "!";
        }
      }
    });

Components have the ability to bind to special [can-util/dom/events/inserted/inserted],
[can-component/beforeremove] and [can-util/dom/events/removed/removed] events
that are called when a component’s tag has been inserted into,
is about to removed, or was removed from the page.

### Helpers

A component’s [can-component::helpers helpers] object provides [can-stache.helper stache helper] functions
that are available within the component’s template.  The following component
only renders friendly messages:

    Component.extend({
      tag: "hello-world",
      view: stache("{{#isFriendly message}}"+
                  "<h1>{{message}}</h1>"+
                "{{/isFriendly}}"),
      helpers: {
        isFriendly: function(message, options){
          if( /hi|hello|howdy/.test(message) ) {
            return options.fn();
          } else {
            return options.inverse();
          }
        }
      }
    });

Generally speaking, helpers should only be used for view related functionality, like
formatting a date.  Data related methods should be in the view model or models.

## Examples

Check out the following examples built with `Component`.

### Tabs

The following demos a tabs widget.  Click “Add Vegetables”
to add a new tab.

@demo demos/can-component/tabs.html

An instance of the tabs widget is created by creating `<my-tabs>` and `<my-panel>`
elements like:

    <my-tabs>
      {{#each foodTypes}}
        <my-panel title='title'>{{content}}</my-panel>
      {{/each}}
    </my-tabs>

To add another panel, all we have to do is add data to `foodTypes` like:

    foodTypes.push({
      title: "Vegetables",
      content: "Carrots, peas, kale"
    })

The secret is that the `<my-panel>` element listens to when it is inserted
and adds its data to the tabs' list of panels with:

    var vm = this.parentViewModel = canViewModel(this.element.parentNode);
    vm.addPanel(this.viewModel);


### TreeCombo

The following tree combo lets people walk through a hierarchy and select locations.

@demo demos/can-component/treecombo.html

The secret to this widget is the viewModel’s `breadcrumb` property, which is an array
of items the user has navigated through, and `selectableItems`, which represents the children of the
last item in the breadcrub.  These are defined on the viewModel like:


    breadcrumb: [],
    selectableItems: function(){
      var breadcrumb = this.attr("breadcrumb");

      // if there’s an item in the breadcrumb
      if(breadcrumb.attr('length')){

        // return the last item’s children
        return breadcrumb.attr(""+(breadcrumb.length-1)+'.children');
      } else{

        // return the top list of items
        return this.attr('items');
      }
    }

When the “+” icon is clicked next to each item, the viewModel’s `showChildren` method is called, which
adds that item to the breadcrumb like:

    showChildren: function(item, ev) {
      ev.stopPropagation();
      this.attr('breadcrumb').push(item)
    },

### Paginate

The following example shows 3
widget-like components: a grid, next / prev buttons, and a page count indicator. And, it shows an application component that puts them all together.

@demo demos/can-component/paginate.html

This demo uses a `Paginate` [can-define/map/map] to assist with maintaining a paginated state:

    var Paginate = DefineMap.extend({
    ...
    });

The `app` component, using [can-define/map/map], creates an instance of the `Paginate` model
and a `websitesPromise` that represents a request for the Websites
that should be displayed.  Notice how the paginate’s `count` value is tied to the
value of the `websitesPromise`’s resolved `value`’s `count`.

```js
var AppViewModel = DefineMap.extend({
	paginate: {
		value: function() {
			return new Paginate({
				limit: 5,
				count: compute(this, "websitesPromise.value.count")
			});
		}
	},
	websitesPromise: {
		get: function() {
			var params = {
					limit: this.paginate.limit,
					offset: this.paginate.offset
				},
				websitesPromise = Website.getList(params),
				self = this;

			websitesPromise.then(function(websites) {
				self.paginate.count = websites.length;
			});

			return websitesPromise;
		}
	}
});
```

The `my-app` component passes paginate, paginate’s values, and websitesPromise to
its sub-components:

    <my-app>
      <my-grid {promise-data}='websitesPromise'>
        {{#each items}}
          <tr>
            <td width='40%'>{{name}}</td>
            <td width='70%'>{{url}}</td>
          </tr>
        {{/each}}
      </my-grid>
      <next-prev {paginate}='paginate'></next-prev>
      <page-count {page}='paginate.page' {count}='paginate.pageCount'/>
    </my-app>
