@typedef {can-stache.sectionRenderer} can-component/can-template <can-template>
@parent can-component.elements

@description Create reusable templates that get positioned and replace `<can-slot>` elements with the same `name` attribute.

@signature `<can-template name='TEMPLATE_NAME' />`

Renders any `<can-slot name='TEMPLATE_NAME' />` with `<can-template name='TEMPLATE_NAME'>Some content</can-template>`.

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
