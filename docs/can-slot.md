@typedef {can-stache.sectionRenderer} can-component.can-slot <can-slot>
@parent can-component.elements

@description Position the content of [can-component.can-slot] elements

@signature `<can-slot name='TEMPLATE_NAME'>DEFAULT_CONTENT</can-slot>`

Replaces any `<can-slot name='TEMPLATE_NAME' />` element found in a component's view with the rendered contents 
of the `<can-template />` element from the `LIGHT_DOM` that has a matching [TEMPLATE_NAME] attribute. Uses the scope of 
the `LIGHT_DOM` by default.

```js
Component.extend({
	tag : 'my-email',
	view : stache(
		'<can-slot name="subject" />'
	)
});

var renderer = stache(
	'<my-email>' +
		'<can-template name="subject">' +
			'{{subject}}' +
		'</can-template>' +
	'</my-email>'
);

renderer({
	subject: 'Hello World'
});
//-> <my-email>Hello World</my-email>
```

@param {String} [TEMPLATE_NAME] The name of the template to match and replace itself with

@param {can-stache.sectionRenderer} [DEFAULT_CONTENT] The content that should be 
used if there is no content in the matching `<can-template>`.

@body

## Use

To use <can-slot> we can create a Component that has <can-slot> elements in it's view 
and render that component with <can-template> elements in the `LIGHT_DOM`.

Any <can-slot> that has a name attribute matching the name attribute of a <can-template> will be 
replaced by the rendered inner contents of the <can-template>.

```js
Component.extend({
	tag : 'my-email',
	view : stache(
		'<can-slot name="subject" />' +
		'<p>My Email</p>' +
		'<can-slot name="body" />'
	)
});

var renderer = stache(
	'<my-email>' +
		'<can-template name="subject">' +
			'<h1>{{subject}}</h1>' +
		'</can-template>' +
		'<can-template name="body">' +
			'<span>{{body}}</span>' +
		'</can-template>' +
	'</my-email>'
);

renderer({
	subject: 'Hello World',
	body: 'The email body'
});

/*
<my-email>
	<h1>Hello World</h1>
	<p>My Email</p>
	<span>The email body</span>
</my-email>
*/
```

### leakScope

With leakScope set to true we can use the data from a component's viewModel

```js
var ViewModel = DefineMap.extend({
	subject: {
		value:"Hello World"
	},
	body: {
		value: "Later Gator"
	}
});

Component.extend({
	tag : 'my-email',
	view : stache(
		'<can-slot name="subject" />' +
		'<can-slot name="body" />'
	),
	ViewModel,
	// This allows us to use the viewModel data
	leakScope: true
});

var renderer = stache(
	'<my-email>' +
		'<can-template name="subject">' +
			'<h1>{{subject}}</h1>' +
		'</can-template>' +
		'<can-template name="body">' +
			'<p>{{body}}</p>' +
		'</can-template>' +
	'</my-email>'
);

var testView = renderer();

/*
<my-email>
	<h1>Hello World</h1>
	<p>Later Gator</p>
</my-email>
*/
```

### Passing context

Context can be bound to and passed to a slot

```js
var ViewModel = DefineMap.extend({
	subject: {
		value:"Hello World"
	},
	body: {
		value: "Later Gator"
	}
});

Component.extend({
	tag : 'my-email',
	view : stache(
		'<can-slot name="subject" {context}="subject" />' +
		'<can-slot name="body" />'
	),
	ViewModel
});

var renderer = stache(
	'<my-email>' +
		'<can-template name="subject">' +
			'<h1>{{subject}}</h1>' +
		'</can-template>' +
		'<can-template name="body">' +
			'<p>{{body}}</p>' +
		'</can-template>' +
	'</my-email>'
);

var testView = renderer({
	subject: 'foo',
	body: 'bar'
});

/*
<my-email>
	<h1>Hello World</h1>
	<p>bar</p>
</my-email>
*/
```

### Default content

Default content can be specified to be used if there is no matching <can-template> 
or the matching <can-template> has no inner content.

```js

Component.extend({
	tag : 'my-email',
	view : stache(
		'<can-slot name="subject">' +
			'<p>This is the default {{subject}}</p>' + 
		'</can-slot>'
	)
});

var renderer = stache(
	'<my-email>' +
		'<can-template name="subject" />' +
	'</my-email>'
);

var testView = renderer({
	subject: 'content'
});

/*
<my-email>
	<p>This is the default content</p>
</my-email>
*/
```
