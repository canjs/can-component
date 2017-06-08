@typedef {can-stache.sectionRenderer} can-component/can-slot <can-slot>
@parent can-component.elements

@description Positions `<can-template />` elements with matching name attribute using current scope.

@signature `<can-slot name='templateName' />`

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
