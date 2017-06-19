@typedef {can-stache.sectionRenderer} can-component/can-template <can-template>
@parent can-component.elements

@description Create reusable templates that replace `<can-slot>` elements.

@signature `<can-template name='TEMPLATE_NAME' />`

When a <can-slot> with matching [TEMPLATE_NAME] is found in a component's view 
<can-template> inner contents are rendered and replace the <can-slot> element.

```js
var ViewModel = DefineMap.extend({
	subject: {
		value:"Hello World"
	}
});

Component.extend({
	tag : 'my-email',
	view : stache(
		'<can-slot name="subject" />'
	),
	ViewModel
});

var renderer = stache(
	'<my-email>' +
		'<can-template name="subject">' +
			'{{subject}}' +
		'</can-template>' +
	'</my-email>'
);

renderer() //-> <my-email>Hello World</my-email>
```

@param {String} [TEMPLATE_NAME] The name of the template to match and replace itself with

@body

## Use

To use <can-template> elements we can create a Component that has <can-slot> elements in it's view 
and render that component with <can-template> elements in the `LIGHT_DOM`.

Any <can-template> that has a name attribute matching the name attribute of a <can-slot> will 
have it's inner contents rendered and replace the <can-slot>.

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
