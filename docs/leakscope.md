@property {Boolean} can-component.prototype.leakScope leakScope
@parent can-component.prototype

@description Allow reading the outer scope values from a component's template and
a component's viewModel values in the user content.

@option {Boolean}  `false` limits reading to:

- the component's viewModel from the component's template, and
- the outer scope values from the user content.

`true` adds the ability to read:

- the outer [can-view-scope scope] values from the component's template, and
- the component's [can-component.prototype.ViewModel] values from the user content.

The default value is `false`.

To change leakScope from the default
```js
Component.extend({
	tag: "my-component",
	leakScope: true,
	ViewModel: { message: "Hello World!" },
	view: stache("{{message}}")
})
```

Leaving `leakScope` as the default `false` is useful for hiding and protecting
internal details of `Component`, potentially preventing accidental
clashes. It can be helpful to set it to `true` if you, for example, wanted to customize __user content__
based on some value in the component's ViewModel.

@body

## Use

A component's [can-component::leakScope leakScope] option controls if a
component's template can access the component's outer scope and the
user content can read the component's view model.

Lets define what __outer scope__, __component's template__ and __user content__ mean.

If I have a `<hello-world>` component in a template like:

```
{{#data}}
	<hello-world>{{subject}}</hello-world>
{{/data}}
```

The __outer scope__ of `<hello-world>` has `data` as its context.  The __user content__ of
`<hello-world>` is the template between its tags.  In this case, the __user content__
is `{{subject}}`.

Finally, if `<hello-world>` is defined like:

```
Component.extend({
  tag: "hello-world",
  view: stache("{{greeting}} <content/>{{exclamation}}")
})
```

`{{greeting}} <content/>{{exclamation}}` represents the __component's template__.

## Example - outer scope into component template

If the following component is defined:
```js
Component.extend({
	tag: 'hello-world',
	leakScope: true, // changed to true instead of the default value
	ViewModel: {name: "World"},
	view: stache("Hello {{name}}")
});
```
With this data in the outer scope:
```js
{ name: "John" }
```
And used like so:

    <hello-world />

It will render as such if `leakScope` is `true`:

    <hello-world>Hello John</hello-world>

..and:

    <hello-world>Hello World</hello-world>

if `leakScope` is `false`

This is because if `leakScope` is `true`, the __component's template__ can read the data in the outer scope and will
see `name: "John"` overwriting `name: "World"` in the component's viewModel instance.

## Example - viewModel into user content

If the following component is defined:
```js
Component.extend({
	tag: 'hello-world',
	leakScope: true, // changed to true instead of the default value
	ViewModel: {name: "World"},
	view: stache("Hello <content />")
});
```
And used like so:

    <hello-world>{{name}}</hello-world>

It will render as such if `leakScope` is `true`:

    <hello-world>Hello World</hello-world>

..and:

    <hello-world>Hello </hello-world>
		
if `leakScope` is `false`

This is because if `leakScope` is `true`, the __user content__ is able to see the name property on the component's
viewModel instance. Else, name won't be seen.
