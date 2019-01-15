@module {constructor} can-component can-component
@download can/component
@test can/component/test.html
@parent can-views
@collection can-core
@release 2.0
@link ../docco/component/component.html docco
@group can-component.define 0 define
@group can-component.create 1 create
@group can-component.elements 2 elements
@group can-component.create
@group can-component.lifecycle 3 lifecycle hooks
@group can-component.events 4 special events
@group can-component.deprecated 5 deprecated
@package ../package.json
@outline 2

@description Create a custom element that can be used to manage widgets
or application logic.

@signature `Component`

  `can-component` exports a `Component` [can-construct Construct] constructor function used to
  define custom elements.

  Call [can-component.extend Component.extend] to define a custom element. Components are
  extended with a:

  - [can-component.prototype.tag] - The custom element tag name.
  - [can-component.prototype.ViewModel] - The methods and properties that manage the
    logic of the component. This is usually a [can-define/map/map DefineMap] class.
  - [can-component.prototype.view] - A template that writes the the inner HTML of
    the custom element given the `ViewModel`. This is usually a [can-stache] template.

  The following defines a  `<my-counter>` element:

  ```js
  const MyCounter = Component.extend({
    tag: "my-counter",
    view: `
      Count: <span>{{this.count}}</span>
      <button on:click="this.increment()">+1</button>
    `,
    ViewModel: {
      count: {default: 0},
      increment() {
        this.count++;
      }
    }
  });
  ```

  To create a component instance, either:

  - Write the element [can-component/component-element tag and bindings] in a [can-stache] template like:
    ```html
    <my-counter count:from="5"/>
    ```
  - Write the component tag in an HTML page and it will be mounted automatically:
    ```html
    <my-counter></my-counter>
    ```
  - Create a [can-component.new] programatically like:
    ```html
    var myCounter = new MyCounter({
      viewModel: {
        count: 6
      }
    });
    myCounter.element   //-> <my-counter>
    myCounter.viewModel //-> MyCounterVM{count:6}
    ```

@body


## Purpose

`Component` is used to define custom elements.  Those custom elements are
used for many different layers within your application:

- __Application Component__ - A component that houses global state, for example [can-route.data route data] and
  session data, and selects different pages
  based upon the url, session and other information.  Example: `<my-app>`
- __Page Component__ - Components that contain the functionality for a page.  Example: `<todos-page>`
- Functional Components - Component that provide functionality for a segment of a page.  Example: `<todos-list>`, `<todos-create>`
- __Widget/UI Components__ - Components that create controls that could be used many places. Example: `<ui-slider>`, `<ui-tabs>`

`Component` is designed to be:

- __Testable__ - Components separate their logic into independently testable [can-component.prototype.view] and [can-component.prototype.ViewModel] pieces.
- __Flexible__ - There are many ways to manage logic in a component.  Components can be:
  - _dumb_ - Get passed their data and can only call functions passed to them to change state.
  - _smart_ - Manage their own state and request data.

  Components can also:
  - Access their DOM element through [can-component/connectedCallback]. This is an escape hatch when
    the [can-component.prototype.view] is unable to update the DOM in a way you need.
  - Support alternate [can-component.prototype.ViewModel]s types like [can-observe].

- __A bridge to web components__ - In browsers that support
  [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Window/customElements), [can-component.extend] will create a custom element. We've also adopted many custom element
  conventions such as:

  - [connectedCallback](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#Using_the_lifecycle_callbacks) - Component's [can-component/connectedCallback] lifecycle hook
  - [slots](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot) - [can-component/can-slot <can-slot>]
  - [template](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template) - [can-component/can-template <can-slot>]
  - [content](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/content) - [can-component/content <content>] (_now obsolete_)


## Overview

> If you haven't already, we suggest reading through the [guides/html] guide to get a background
> on `Component` and other related CanJS technology. The following briefly summarizes
> that content.

On a high level using `Component` is consists of two steps:

1. Extend `Component` with a [can-component.prototype.tag], [can-component.prototype.view]
   and [can-component.prototype.ViewModel] to create a custom element:

   ```js
   Component.extend({
     tag: "my-counter",
     view: `
       Count: <span>{{this.count}}</span>
       <button on:click="this.increment()">+1</button>
     `,
     ViewModel: {
       count: {default: 0},
       increment() {
         this.count++;
       }
     }
   });
   ```

2. Use that element in your HTML or within another `Component`'s [can-component.prototype.view] and
   use [can-stache-bindings] to pass values into or out of your component:

   ```js
   <my-counter count:from="1"/>
   ```

The following video walks through how this component works:

<iframe width="560" height="315" src="https://www.youtube.com/embed/3zMwoEuyX9g" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Learn

Learning `Component` mostly means learning:

- [can-define/map/map DefineMap] which serves
  as Component's [can-component.prototype.ViewModel]s.
- [can-stache] which serves as Component's [can-component.prototype.view]s.
- [can-stache-bindings] which enable event binding and value passing between components and
  values in [can-stache] templates.

These [guides/logic], [guides/testing], [guides/forms]

The important thing is to

Component is the ""


- approach ... write out the view ... make it read nice, then

## Approach

## Lifecycle / Timing

1. Collect binding values
2. Create an instance of the ViewModel
   - `init`
3. Render the view model into a document fragment
   -
4. Insert the fragment into the element
5. Mutation observers fire `connectedCallback`

## Passing a view / customizing

- inline partials
- can-slot / can-template


## Use




The following list many use cases of


Learning `Component` begin with learning

- [can-define/map/map DefineMap]
- [can-stache]





building block



Extend `Component`




On a high level using `Component` is rather straightforward.  You will:

1. Define a component with:
   1. A tag name
   2. A [can-stache stache] [can-component.prototype.view] that specifies the HTML content
      within the component element.
   2. A [can-component.prototype.ViewModel]

`Component` has _many_ use cases, so learning Component can be challenging.  


Fortunately,
at its core, there's only three technologies that make

At it's core,



Using component effectively is
a combination of using:

- [can-stache]
- [can-define]
- [can-stache-bindings]

As


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
