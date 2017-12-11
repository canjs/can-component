@typedef {function} can-component/disconnectedCallback disconnectedCallback
@parent can-component.events

@description A lifecycle hook called during teardown after component bindings are removed.

@signature `connectedCallback: () => function disconnectedCallback () { ... }`

Used to teardown anything that was set up during the [can-component/connectedCallback] lifecycle hook. `disconnectedCallback` is defined by returning a function from the [can-component/connectedCallback] lifecycle hook. (this allows it to be defined within the same closure scope as setup)

For example, the following removes all `listen` bindings on teardown:

```js
const Person = DefineMap.extend({
  nameChanged: "number",
  name: "string",
  connectedCallback () {
    this.listenTo("name", function () {
      this.nameChanged++;
    });
    var disconnectedCallback = this.stopListening.bind(this);
    return disconnectedCallback;
  }
})
```

`disconnectedCallback` is named as such to match the [web components](https://developers.google.com/web/fundamentals/web-components/customelements#reactions) spec for the same concept.
