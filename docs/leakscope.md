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
clashes. It can be helpful to set it to true if you, for example, wanted to customize __user content__ 
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

## Example

If the following component is defined:

    Component.extend({
        tag: "hello-world",
        leakScope: true, // changed to true instead of default value
        view: stache("{{greeting}} <content/>{{exclamation}}"),
        ViewModel: { subject: "LEAK", exclamation: "!" }
    })

And used like so:

    <hello-world>{{subject}}</hello-world>

With the following data in the outer scope:

    { greeting: "Hello", subject: "World"}

Will render the following if `leakScope` is true:

    <hello-world>Hello LEAK!</hello-world>

But if `leakScope` is false:

    <hello-world>Hello World</hello-world>

Because when the scope isn't leaked, the __component's template__
does not see `exclamation`. The __user content__ does not see the
ViewModel's `subject` and uses the outer scope's `subject` which is `"World"`.
