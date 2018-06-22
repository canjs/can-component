@typedef {function} can-component/connectedCallback connectedCallback
@parent can-component.lifecycle

@description A lifecycle hook called after the component's element is inserted into the document.

@signature `connectedCallback: function () { ... }`

Mainly used as the context to orchestrate property bindings that would
otherwise be a stream or an inappropriate side-effect during a getter.

For example, the following listens to changes on the `name` property
and counts them in the `nameChanged` property:

```js
const Person = DefineMap.extend( {
	nameChanged: "number",
	name: "string",
	connectedCallback() {
		this.listenTo( "name", function() {
			this.nameChanged++;
		} );
		const disconnectedCallback = this.stopListening.bind( this );
		return disconnectedCallback;
	}
} );
```

`connectedCallback` is named as such to match the [web components](https://developers.google.com/web/fundamentals/web-components/customelements#reactions) spec for the same concept.

	@return {Function|undefined} The `disconnectedCallback` function to be called during teardown. Defined in the same closure scope as setup, it's used to tear down anything that was set up during the `connectedCallback` lifecycle hook.
