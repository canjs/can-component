@typedef {can-stache.sectionRenderer} can-component/can-template <can-template>
@parent can-component.elements

@description Create reusable templates that get positioned and replace `<can-slot>` elements with the same `name` attribute.

@signature `<can-template name='templateName' />`

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
	ViewModel,
	leakScope: true
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
