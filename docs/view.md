@property {String|can-stache.renderer} [can-component.prototype.view] view
@parent can-component.prototype

Provides a view to render directly within the component’s element. The view is rendered with the
component’s [can-component::ViewModel] instance.  `<content/>` elements within the view are replaced by the source elements within the component’s tag.

@type {String} A string that will be passed to [can-stache] to create a
[can-stache.renderer]. For example:

```js
import Component from "can-component";

Component.extend( {
	tag: "my-tabs",
	view: "<ul>{{#panels}}<li>{{title}}</li> /* ... */"
} );
```

@type {can-stache.renderer} A [can-stache.renderer] returned by [can-stache].
For example:

```js
import Component from "can-component";
import stache from "can-stache";

Component.extend( {
	tag: "my-tabs",
	view: stache( "<ul>{{#panels}}<li>{{title}}</li> /* ... */" )
} );
```

@body


## Use

The view specified by the `view` property works similar to
the [http://www.w3.org/TR/shadow-dom/ W3C Shadow DOM proposal]. It represents the contents
of a custom element, while being able to reposition the user provided __source__ elements
with the [can-component/content] tag.

There are three things to understand about a [can-component]’s view:

 - It is inserted into the component’s tag.
 - It is rendered with access to the component instance’s viewModel.
 - Any [can-component/content `<content>`] tags within the view act as insertion points for the source elements.

The following example demonstrates all three features:

@demo demos/can-component/my_greeting_full.html

The following explains how each part works:

__Component:__

```js
Component.extend( {
	tag: "my-greeting",
	view: "<h1><content/> - {{title}}</h1>",
	ViewModel: {
		title: {
			default: "can-component"
		}
	}
} );
```

This registers a component for elements like `<my-greeting>`. Its view
will place an `<h1>` element directly within `<my-greeting>` and put
the original contents of `<my-greeting>` within the beginning of `<h1>`. The component’s
[can-component::ViewModel] adds a title value.

__Source view:__

```html
<header>
	<my-greeting>
		 {{site}}
	</my-greeting>
</header>
```

The source view is the view that
uses `<my-greeting>`.  In the demo, this is defined within a `<script>`
tag.

Notice:

 - There is content within `<my-greeting>`.  This is called the __light__ or __user__ content.
 - The content looks for a `site` value.

__Source data:__

```js
stache( "..." )( {
	site: "CanJS"
} );
```

This is how we render the source view that uses `<my-greeting>`. The view is rendered with `site` in its [can-component::ViewModel].

__HTML Result:__

```html
<header>
	<my-greeting>
		<h1>CanJS - can-component</h1>
	</my-greeting>
</header>
```

This is the result of the view transformations. The
__user__ content within the original `<my-greeting>` is placed within the start of the `<h1>`
tag.  Also, notice that the __user__ content is able to access data from
the source data.

The following sections break this down more.


## View insertion

The view specified by `view` is rendered directly within the custom tag.

For example the following component:

```js
Component.extend( {
	tag: "my-greeting",
	view: "<h1>Hello There</h1>"
} );
```

With the following source html:

```html
<header>
	<my-greeting></my-greeting>
</header>
```

Produces the following html:

```html
<header>
	<my-greeting><h1>Hello There</h1></my-greeting>
</header>
```

However, if there was existing content within the source html, like:

```html
<header>
	<my-greeting>DO REMOVE ME!!!</my-greeting>
</header>
```

…that content is removed and replaced by the component’s view:

```html
<header>
	<my-greeting><h1>Hello There</h1></my-greeting>
</header>
```

### The `<content>` element

Use the `<content>` element to place the source content in the
component’s element within the component’s
view. For example, if we change the component to look like:

```js
Component.extend( {
	tag: "my-greeting",
	view: "<h1><content/></h1>"
} );
```

and rendered with source html, like:

```html
<my-greeting>Hello World</my-greeting>
```

it produces:

```html
<my-greeting><h1>Hello World</h1></my-greeting>
```

### `<content>` element default content

If the user does not provide source content, the html
between the `<content>` tags will be used. For example, if we
change the component to look like:

```js
Component.extend( {
	tag: "my-greeting",
	view: "<h1><content>Hello World</content></h1>"
} );
```

and rendered with source html like:

```html
<my-greeting></my-greeting>
```

it produces:

```html
<my-greeting><h1>Hello World</h1></my-greeting>
```
