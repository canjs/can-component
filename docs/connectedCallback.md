@typedef {function} can-component/connectedCallback connectedCallback
@parent can-component.events

@description An event called with the component’s element after it isinserted on the document.

@signature `connectedCallback: function (element) { return disconnectedCallback; }`

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

  @param {HTMLElement} element The component element.
  @return {Function} disconnectedCallback The [can-component/disconnectedCallback] function to be called during teardown.
