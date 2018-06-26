@typedef {can-stache.sectionRenderer} can-component/can-slot <can-slot>
@parent can-component.elements

@description Position the content of [can-component/can-template] elements.

@signature `<can-slot name='NAME' BINDING>DEFAULT_CONTENT</can-slot>`

Replaces any `<can-slot name='NAME' />` element found in a component's view with the rendered contents
of the `<can-template />` element from the `LIGHT_DOM` that has a matching [TEMPLATE_NAME] attribute. Uses the scope of
the `LIGHT_DOM` by default.

```js
import Component from "can-component";
import stache from "can-stache";

Component.extend( {
	tag: "my-email",
	view: `
		<can-slot name="subject" />
	`
} );

const renderer = stache(`
	<my-email>
		<can-template name="subject">
			{{subject}}
		</can-template>
	</my-email>
`);

renderer( {
	subject: "Hello World"
} );

//-> <my-email>Hello World</my-email>
```

@param {String} NAME The name of the [can-component/can-template] to render in place of the `<can-slot>`.

@param {can-stache-bindings} BINDING You can bind to the context (also known as [can-stache/keys/this])
of of the corresponding [can-component/can-template].  This lets you pass data to the
template. The following passes `user` as `this` to the corresponding `<can-template name="user-details">`:

```html
<can-slot name="user-details" this:from="user">
```

[can-stache-bindings.toChild], [can-stache-bindings.toParent] and [can-stache-bindings.twoWay] with `this`
all work.

@param {can-stache.sectionRenderer} [DEFAULT_CONTENT] The content that should be
used if there is no content in the matching `<can-template>`.

@body

## Use

To use `<can-slot>` we can create a Component that has `<can-slot>` elements in it's view
and render that component with <can-template> elements in the `LIGHT_DOM`.

Any `<can-slot>` that has a name attribute matching the name attribute of a `<can-template>` will be
replaced by the rendered inner contents of the <can-template>.

```js
import Component from "can-component";
import stache from "can-stache";

Component.extend( {
	tag: "my-email",
	view: `
		<can-slot name="subject" />
		<p>My Email</p>
		<can-slot name="body" />
	`
} );

const renderer = stache(`
	<my-email>
		<can-template name="subject">
			<h1>{{subject}}</h1>
		</can-template>
		<can-template name="body">
			<span>{{body}}</span>
		</can-template>
	</my-email>
`);

renderer( {
	subject: "Hello World",
	body: "The email body"
} );

/*
<my-email>
	<h1>Hello World</h1>
	<p>My Email</p>
	<span>The email body</span>
</my-email>
*/
```

### Passing context

Context ([can-stache/keys/this]) can be bound to and passed to a template. The following
passes `<my-email>`'s `subject` and `body` to the `subject` and `body` templates.  Notice
how `subject` and `body` are read by `{{this}}`.

```js
import Component from "can-component";
import stache from "can-stache";

Component.extend( {
	tag: "my-email",
	view: `
		<can-slot name="subject" this:from="subject" />
		<can-slot name="body" this:from="body" />
	`,
	ViewModel: {
		subject: {
			default: "Hello World"
		},
		body: {
			default: "Later Gator"
		}
	}
} );

const renderer = stache(`
	<my-email>
		<can-template name="subject">
			<h1>{{this}}</h1>
		</can-template>
		<can-template name="body">
			<span>{{this}}</span>
		</can-template>
	</my-email>
`);

const testView = renderer( {
	subject: "Hello World",
	body: "This is a greeting."
} );

/*
<my-email>
	<h1>Hello World</h1>
	<p>This is a greeting.</p>
</my-email>
*/
```

### Default content

Default content can be specified to be used if there is no matching `<can-template>`
or the matching `<can-template>` has no inner content.

```js
import Component from "can-component";
import stache from "can-stache";

Component.extend( {
	tag: "my-email",
	view: `
		<can-slot name="subject">
			<p>This is the default {{subject}}</p>
		</can-slot>
	`
} );

const renderer = stache(`
	<my-email>
		<can-template name="subject" />
	</my-email>
`);

const testView = renderer( {
	subject: "content"
} );

/*
<my-email>
	<p>This is the default content</p>
</my-email>
*/
```
