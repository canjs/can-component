@typedef {can-stache.sectionRenderer} can-component/can-slot <can-slot>
@parent can-component.elements

@description Positions `<can-template />` elements with matching name attribute using current scope.

@signature `<can-slot name='TEMPLATE_NAME'>DEFAULT_CONTENT</can-slot>`

Renders any `<can-slot name='subject' />` with `<can-template name='subject'>Some content</can-template>`.

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

@param {string} [TEMPLATE_NAME] The name of the template to match and replace itself with

@param {can-stache.sectionRenderer} [DEFAULT_CONTENT] The content that should be 
used if there is no content in the matching `<can-template>`.
