@module {constructor} can-component can-component
@download can/component
@test can/component/test.html
@parent can-views
@collection can-core
@release 2.0
@link ../docco/component/component.html docco
@group can-component.static 0 static
@group can-component.prototype 1 prototype
@group can-component.elements 2 elements
@group can-component.lifecycle 3 lifecycle hooks
@group can-component.events 4 special events
@package ../package.json

@description Create a custom element that can be used to manage widgets
or application logic.

@signature `<TAG BINDINGS...>[TEMPLATES][LIGHT_DOM]</TAG>`

Create an instance of a component on a particular tag in a [can-stache] view.
Use the [can-stache-bindings bindings] syntaxes to set up bindings.

The following creates a `my-autocomplete` element and passes the `my-autocomplete`’s
[can-component.prototype.ViewModel] the `Search` model as its `source` property and
a [can-component/can-template] that is used to render the search results:

```html
<my-autocomplete source:from="Search">
	<can-template name="search-results">
		<li>{{name}}</li>
	</can-template>
</my-autocomplete>
```

	@release 2.3

	@param {String} TAG An HTML tag name that matches the [can-component::tag tag]
	property of the component. Tag names should include a hyphen (`-`) or a colon (`:`) like:
	`acme-tabs` or `acme:tabs`.

	@param {can-stache-bindings} [BINDINGS] Use the following binding syntaxes
	to connect the component’s [can-component::ViewModel] to the view’s [can-view-scope scope]:

	 - [can-stache-bindings.toChild]=[can-stache.expressions expression] — one-way data binding to child
	 - [can-stache-bindings.toParent]=[can-stache.expressions expression] — one-way data binding to parent
	 - [can-stache-bindings.twoWay]=[can-stache.expressions expression] — two-way data binding child to parent
	 - [can-stache-bindings.event]=[can-stache/expressions/call expression] — event binding on the view model

	 @param {can-stache.sectionRenderer} [TEMPLATES] Between the starting and ending tag
	 can exist one or many [can-component/can-template] elements.  Use [can-component/can-template] elements
	 to pass custom templates to child components.  Each `<can-template>`
	 is given a `name` attribute and can be rendered by a corresponding [can-component/can-slot]
	 in the component’s [can-component.prototype.view].

	 For example, the following passes how each search result should look and an error message if
	 the source is unable to request data:

	 ```html
	 <my-autocomplete source:from="Search">
		 <can-template name="search-results">
			 <li>{{name}}</li>
		 </can-template>
		 <can-template name="search-error">
			 <div class="error">{{message}}</div>
		 </can-template>
	 </my-autocomplete>
	 ```

	 @param {can-stache.sectionRenderer} [LIGHT_DOM] The content between the starting and ending
	 tag. For example, `Hello <b>World</b>` is the `LIGHT_DOM` in the following:

	 ```html
	 <my-tag>Hello <b>World</b></my-tag>
	 ```

	 The `LIGHT_DOM` can be positioned with a component’s [can-component.prototype.view] with
	 the [can-component/content] element.  The data accessible to the `LIGHT_DOM` can be controlled
	 with [can-component.prototype.leakScope].

@signature `new Component([options])`

Create an instance of a component without rendering it in a template. This is
useful when you:

- have complex logic for switching between different components (e.g. routing)
- want to create components without adding them to the page (e.g. testing)

The following defines a `MyGreeting` component and creates a `my-greeting`
element by calling `new` on the component’s constructor function:

```js
const HelloWorld = Component.extend({
	tag: "hello-world",
	view: `
		<can-slot name="greetingTemplate" />
		<content>world</content>
		<ul>{{#each(items)}} {{this}} {{/each}}</ul>
	`,
	ViewModel: {
		items: {}
	}
});

// Create a new instance of our component
const componentInstance = new HelloWorld({

	// values with which to initialize the component’s view model
	viewModel: {
		items: ["eat"]
	},

	// can-stache template to replace any <content> elements in the component’s view
	content: "<em>{{message}}</em>",

	// <can-template> strings rendered by can-stache with the scope
	templates: {
		greetingTemplate: "{{greeting}}"
	},

	// scope with which to render the <content> and templates
	scope: {
		greeting: "Hello",
		message: "friend"
	}
});

myGreetingInstance.element; // is like <my-greeting>Hello <em>friend</em> <ul> <li>eat</li> </ul></my-greeting>

myGreetingInstance.viewModel; // is HelloWorld.ViewModel{items: ["eat"]}
```

Changing the component’s view model will cause its element and any bindings to
be updated:

```js
myGreetingInstance.viewModel.items.push("sleep");

myGreetingInstance.element; // is like <my-greeting>Hello <em>friend</em> <ul> <li>eat</li> <li>sleep</li> </ul></my-greeting>
```

See the [Programmatically instantiating a component](#Programmaticallyinstantiatingacomponent)
section for details.

@param {Object} [options] Options for rendering the component, including:
- **content** `{String|Function}`: Similar to the [can-component/content] tag, the `LIGHT_DOM` to be rendered between the component’s starting and ending tags; can either be a string (which will be parsed by [can-stache] by default) or a [can-stache.renderer] function.
- **scope** `{Object}`: An object that is the scope with which the content should be rendered.
- **templates** `{Object<String,String|Function>}`: An object that has keys that are [can-component/can-template] names and values that are either plain strings (parsed by [can-stache] by default) or [can-stache.renderer] functions.
- **viewModel** `{Object}`: An object with values to bind to the component’s view model.

  @release 4.3

@body

## Use

To create a Component, you must first [can-component.extend extend] `Component`
with the methods and properties of how your component behaves:

```js
import Component from "can-component";

Component.extend( {
	tag: "hello-world",
	view: "{{#if visible}}{{message}}{{else}}Click me{{/if}}",
	ViewModel: {
		visible: { default: false },
		message: { default: "Hello There!" }
	},
	events: {
		click: function() {
			this.viewModel.visible = !this.viewModel.visible;
		}
	}
} );
```

This element says “Click me” until a user clicks it and then
says “Hello There!”.  To create an instance of this component on the page,
add `<hello-world/>` to a [can-stache] view, render
the view, and insert the result in the page like:

```js
import stache from "can-stache";

const renderer = stache( "<hello-world/>" );
document.body.appendChild( renderer( { } ) );
```

Check this out here:

@demo demos/can-component/click_me.html


Typically, you do not append a single component at a time.  Instead,
you’ll render a view with many custom tags like:

```html
<srchr-app>
	<srchr-search models:from="models">
		<input name="search"/>
	</srchr-search>
	<ui-panel>
		<srchr-history/>
		<srchr-results models:from="models"/>
	</ui-panel>
</srchr-app>
```

You can also create an instance of a component without rendering it in the page.
See the [Programmatically instantiating a component](#Programmaticallyinstantiatingacomponent)
section for details.

### Defining a Component

Use [can-component.extend] to define a `Component` constructor function
that automatically gets initialized whenever the component’s tag is
found.

Note that inheriting from components works differently than other CanJS APIs. You
can’t call `.extend` on a particular component to create a “subclass” of that component.

Instead, components work more like HTML elements. To reuse functionality from a base component, build on top of it with parent
components that wrap other components in their view and pass any needed viewModel properties via attributes.

### Tag

A component’s [can-component::tag tag] is the element node name that
the component will be created on.


The following matches `<hello-world>` elements.

```js
Component.extend( {
	tag: "hello-world"
} );
```

### View

A component’s [can-component::view view] is a template that is rendered as
the element’s innerHTML.

The following component:

```js
Component.extend( {
	tag: "hello-world",
	view: "<h1>Hello World</h1>"
} );
```

Changes `<hello-world/>` elements into:

```html
<hello-world><h1>Hello World</h1></hello-world>
```

Use the [can-component/content] tag to position the custom element’s source HTML.

The following component:

```js
Component.extend( {
	tag: "hello-world",
	view: "<h1><content/></h1>"
} );
```

Changes `<hello-world>Hi There</hello-world>` into:

```html
<hello-world><h1>Hi There</h1></hello-world>
```

### ViewModel

A component’s [can-component::ViewModel ViewModel] defines a constructor that creates
instances used to render the component’s view. The instance’s properties
are typically set by attribute [can-stache-bindings data bindings] on the custom element.
By default, every data binding’s value is looked up in the parent [can-view-scope]
of the custom element and added to the viewModel object.

The following component:

```js
Component.extend( {
	tag: "hello-world",
	view: "<h1>{{message}}</h1>"
} );
```

Changes the following rendered view:

```js
const renderer = stache( "<hello-world message:from='greeting'/>" );
renderer( {
	greeting: "Salutations"
} );
```

Into:

```html
<hello-world><h1>Salutations</h1></hello-world>
```

Default values can be provided. The following component:

```js
Component.extend( {
	tag: "hello-world",
	view: "<h1>{{message}}</h1>",
	viewModel: {
		message: "Hi"
	}
} );
```

Changes the following rendered view:

```js
const renderer = stache( "<hello-world/>" );
renderer( {} );
```

Into:

```html
<hello-world><h1>Hi</h1></hello-world>
```

If you want to set the string value of the attribute on the ViewModel,
set an attribute without any binding syntax.

The following view, with the previous `hello-world` component:

```js
const renderer = stache( "<hello-world message='Howdy'/>" );
renderer( {} );
```

Renders:

```html
<hello-world><h1>Howdy</h1></hello-world>
```

### Lifecycle Hooks

Mainly used to set up special bindings, [can-component/connectedCallback] is defined on the viewModel and is called automatically when a component is inserted into the DOM. When writing tests, since `connectedCallback` is on the viewModel, it can be called manually to reduce complexity of tests that would otherwise need the full component to be initialized and inserted into the/a DOM. For that reason, `connectedCallback` is preferred to using `inserted` in [can-component::events events].

The following example listens to changes on the `name` property
and counts them in the `nameChanged` property:

```js
const Person = DefineMap.extend( {
	nameChanged: "number",
	name: "string",
	connectedCallback() {
		this.listenTo( "name", function() {
			this.nameChanged++;
		} );
		const disconnectedCallback = this.stopListening.bind( this );
		return disconnectedCallback;
	}
} );
```

The [can-component/connectedCallback] function may return a `disconnectedCallback` function this is called during teardown. Defined in the same closure scope as setup, its primary use is to tear down anything that was set up during the `connectedCallback` lifecycle hook.

Special bindings are used to set up observable property behaviors that are
unable to be represented easily within the declarative APIs of the `viewModel`.
It doesn’t remove all imperative code but will help keep imperative code
isolated and leave other properties more testable. Otherwise, properties like
`name` in the example above, would need side-effects in setters or getters:

```js
const Person = DefineMap.extend( {
	nameChanged: "number",
	name: {
		type: "string",
		set: function( newVal, lastSetVal ) {
			this.nameChanged = ( this.nameChanged || 0 ) + 1;
			return newVal;
		}
	}
} );
```

This might look preferable but this pattern should be avoided. A more complex example would have side-effects changing a property (like `nameChanged` is in the `name` setter) coming from several different getters, setters, and methods all updating a common property. This makes debugging and testing each property more difficult.

There are additional ways to achieve the behavior, the most common are listed here in order of least preferable to most preferable:

side-effects < vm event bindings < listenTo in connectedCallback < streams

`connectedCallback` is named as such to match the [web components](https://developers.google.com/web/fundamentals/web-components/customelements#reactions) spec for the same concept.

### Events

A component’s [can-component::events events] object is used to listen to events (that are not
listened to with [can-stache-bindings view bindings]). The following component
adds “!” to the message every time `<hello-world>` is clicked:

```js
Component.extend( {
	tag: "hello-world",
	view: "<h1>{{message}}</h1>",
	events: {
		"click": function() {
			const currentMessage = this.viewModel.message;
			this.viewModel.message = currentMessage + "!";
		}
	}
} );
```

Use [can-component/connectedCallback] to listen to when an component’s element
is inserted or removed from the DOM.


### Helpers

A component’s [can-component::helpers helpers] object provides [can-stache.helper stache helper] functions
that are available within the component’s view.  The following component
only renders friendly messages:

```js
Component.extend( {
	tag: "hello-world",
	view: `
		{{#isFriendly message}}
			<h1>{{message}}</h1>
		{{/isFriendly}}
	`
	helpers: {
		isFriendly: function( message, options ) {
			if ( /hi|hello|howdy/.test( message ) ) {
				return options.fn();
			} else {
				return options.inverse();
			}
		}
	}
} );
```

Generally speaking, helpers should only be used for view related functionality, like
formatting a date.  Data related methods should be in the view model or models.

## Programmatically instantiating a component

You can also instantiate new component instances programmatically by using the
component’s constructor function. This is useful when you:

- have complex logic for switching between different components (e.g. routing)
- want to create components without adding them to the page (e.g. testing)

The following defines a `MyGreeting` component and creates a `my-greeting`
element by calling `new` on the component’s constructor function:

```js
import Component from "can-component";

const MyGreeting = Component.extend({
  tag: "my-greeting",
  view: "Hello {{subject}}",
  ViewModel: {
    subject: "string"
  }
});

const myGreetingInstance = new MyGreeting({
  viewModel: {
    subject: "friend"
  }
});

myGreetingInstance.element; // is <my-greeting>Hello friend</my-greeting>

myGreetingInstance.viewModel; // is MyGreeting.ViewModel{subject: "friend"}
```

In the example above, the `viewModel` is passed in as an option to the
component’s constructor function.

In addition to `viewModel`, there are `templates`, `scope`, and `content`
options. Read below for details on all the options.

### viewModel

The `viewModel` option is used to create the component’s view model and bind to
it. For example:

```js
import Component from "can-component";
import DefineMap from "can-define/map/map";
import value from "can-value";

const appVM = new DefineMap({
  association: "friend"
});

const MyGreeting = Component.extend({
  tag: "my-greeting",
  view: "{{greeting}} {{subject}}",
  ViewModel: {
    greeting: "string",
    subject: "string"
  }
});

const myGreetingInstance = new MyGreeting({
  viewModel: {
    greeting: "Hello",
    subject: value.bind(appVM, "association")
  }
});

myGreetingInstance.element; // is <my-greeting>Hello friend</my-greeting>

myGreetingInstance.viewModel; // is MyGreeting.ViewModel{subject: "friend"}
```

The way the component is instantiated above is similar to this example below,
assuming it’s rendered by [can-stache] with `appVM` as the current scope:

```html
<my-greeting greeting:raw="Hello" subject:bind="association"></my-greeting>
```

You can recreate one-way and two-way bindings with [can-value], which has
[can-value.bind], [can-value.from], and [can-value.to] methods for creating
two-way, one-way parent-to-child, and one-way child-to-parent bindings,
respectively.

```js
const appVM = new DefineMap({
  family: {
    first: "Milo",
    last: "Flanders"
  }
});

const NameComponent = Component.extend({
  tag: "name-component",
  view: "{{fullName}}",
  ViewModel: {
    givenName: "string",
    familyName: "string",
    get fullName() {
      return this.givenName + " " + this.familyName;
    }
  }
});

const componentInstance = new NameComponent({
  viewModel: {
    givenName: value.from(appVM, "family.first"),
    familyName: value.bind(appVM, "family.last"),
    fullName: value.to(appVM, "family.full"),
  }
});
```

The way the component is instantiated above is similar to this example below,
assuming it’s rendered by [can-stache] with `appVM` as the current scope:

```html
<my-greeting
  givenName:from="family.first"
  familyName:bind="family.last"
  fullName:to="family.full"
></my-greeting>
```

This will result in an `appVM` with the following data:

```js
{
  family: {
    first: "Milo",
    full: "Milo Flanders",
    last: "Flanders"
  }
}
```

Changing the component’s view model will cause its element and any bindings to
be updated:

```js
componentInstance.viewModel.familyName = "Smith";

componentInstance.element; // is <name-component>Milo Smith</name-component>

appVM.family.last; // is "Smith"
```

### content

The `content` option is used to pass `LIGHT_DOM` into a component when it is
instantiated, similar to the [can-component/content] tag.

```js
import Component from "can-component";

const HelloWorld = Component.extend({
  tag: "hello-world",
  view: "Hello <content>world</content>"
});

const helloWorldInstance = new HelloWorld({
  content: "<em>mundo</em>"
});
```

This would make `helloWorldInstance.element` an element with the following structure:

```html
<hello-world>Hello <em>mundo</em></hello-world>
```

### scope

You can also provide a `scope` with which the content should be rendered:

```js
import Component from "can-component";

const HelloWorld = Component.extend({
  tag: "hello-world",
  view: "Hello <content>world</content>"
});

const helloWorldInstance = new HelloWorld({
  content: "<em>{{message}}</em>",
  scope: {
    message: "mundo"
  }
});
```

This would make `helloWorldInstance.element` a fragment with the following structure:

```html
<hello-world>Hello <em>mundo</em></hello-world>
```

### templates

The `templates` option is used to pass a [can-component/can-template] into a
component when it is instantiated.

```js
import Component from "can-component";

const TodosPage = Component.extend({
	tag: "todos-page",
	view: "<ul><can-slot name='itemList' /></ul>"
});

const todosPageInstance = new TodosPage({
	scope: {
		items: ["eat"]
	},
	templates: {
		itemList: "{{#each(items)}} <li>{{this}}</li> {{/each}}"
	}
});
```

This would make `todosPageInstance.element` a fragment with the following structure:

```html
<todos-page>
  <ul>
    <li>eat</li>
  </ul>
</todos-page>
```

## Examples

Check out the following examples built with `Component`.

### Tabs

The following demos a tabs widget.  Click “Add Vegetables”
to add a new tab.

@demo demos/can-component/tabs.html

An instance of the tabs widget is created by creating `<my-tabs>` and `<my-panel>`
elements like:

```html
<my-tabs>
	{{#each(foodTypes)}}
		<my-panel title:from="title">{{content}}</my-panel>
	{{/each}}
</my-tabs>
```

To add another panel, all we have to do is add data to `foodTypes` like:

```js
foodTypes.push( {
	title: "Vegetables",
	content: "Carrots, peas, kale"
} );
```

The secret is that the `<my-panel>` element listens to when it is inserted
and adds its data to the tabs’ list of panels with:

```js
const vm = this.parentViewModel = canViewModel( this.element.parentNode );
vm.addPanel( this.viewModel );
```

### TreeCombo

The following tree combo lets people walk through a hierarchy and select locations.

@demo demos/can-component/treecombo.html

The secret to this widget is the viewModel’s `breadcrumb` property, which is an array
of items the user has navigated through, and `selectableItems`, which represents the children of the
last item in the breadcrumb.  These are defined on the viewModel like:

```js
DefineMap.extend( {
	breadcrumb: {
		Default: DefineList
	},
	selectableItems: {
		get: function() {
			const breadcrumb = this.breadcrumb;

			// if there’s an item in the breadcrumb
			if ( breadcrumb.length ) {

				// return the last item’s children
				const i = breadcrumb.length - 1;
				return breadcrumb[ i ].children;
			} else {

				// return the top list of items
				return this.items;
			}
		}
	}
} );
```

When the “+” icon is clicked next to each item, the viewModel’s `showChildren` method is called, which
adds that item to the breadcrumb like:

```js
DefineMap.extend( {
	showChildren: function( item, ev ) {
		ev.stopPropagation();
		this.breadcrumb.push( item );
	}
} );
```

### Paginate

The following example shows 3
widget-like components: a grid, next / prev buttons, and a page count indicator. And, it shows an application component that puts them all together.

@demo demos/can-component/paginate.html

This demo uses a `Paginate` [can-define/map/map] to assist with maintaining a paginated state:

```js
const Paginate = DefineMap.extend( {

	// ...
} );
```

The `app` component, using [can-define/map/map], creates an instance of the `Paginate` model
and a `websitesPromise` that represents a request for the Websites
that should be displayed.  Notice how the `websitesCount` value is updated when
the `websitesPromise` resolves. [can-component/connectedCallback] is used to
listen for changes to `websitesCount`, which then updates the paginate’s `count`
value.

```js
const AppViewModel = DefineMap.extend( {
	connectedCallback: function() {
		this.listenTo( "websitesCount", function( event, count ) {
			this.paginate.count = count;
		} );
		return this.stopListening.bind( this );
	},
	paginate: {
		default: function() {
			return new Paginate( {
				limit: 5
			} );
		}
	},
	websitesCount: {
		get: function( lastValue, setValue ) {
			this.websitesPromise.then( function( websites ) {
				setValue( websites.count );
			} );
		}
	},
	websitesPromise: {
		get: function() {
			return Website.getList( {
				limit: this.paginate.limit,
				offset: this.paginate.offset
			} );
		}
	}
} );
```

The `my-app` component passes paginate, paginate’s values, and websitesPromise to
its sub-components:

```html
<my-app>
	<my-grid promiseData:from="websitesPromise">
		{{#each(items)}}
			<tr>
				<td width="40%">{{name}}</td>
				<td width="70%">{{url}}</td>
			</tr>
		{{/each}}
	</my-grid>
	<next-prev paginate:from="paginate"></next-prev>
	<page-count page:from="paginate.page" count:from="paginate.pageCount"></page-count>
</my-app>
```
