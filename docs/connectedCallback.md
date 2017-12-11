@typedef {function} can-component/connectedCallback connectedCallback
@parent can-component.events

@description A lifecycle hook called after the component's element is inserted on the document.

@signature `connectedCallback: function () { return disconnectedCallback; }`

Mainly used as the context to orchestrate property bindings that would
otherwise be a stream or an inappropriate side-effect during a getter.

For example, the following listens to changes on the `name` property
and counts them in the `nameChanged` property:

```js
const Person = DefineMap.extend({
  nameChanged: "number",
  name: "string",
  connectedCallback () {
    this.listenTo("name", function () {
      this.nameChanged++;
    });
    return this.stopListening.bind(this);
  }
})
```

`connectedCallback` is named as such to match the [web components](https://developers.google.com/web/fundamentals/web-components/customelements#reactions) spec for the same concept.

If `connectedCallback` returns a function, that function will be the [can-component/disconnectedCallback] that's called during teardown.
