@typedef {function} can-component/beforeremove beforeremove
@parent can-component.events

An event called only on component’s elements before they are removed from the
document if live binding is performing the removal. It can be listened to
within a component’s [can-component.prototype.events] object or on a component
element with [can-stache-bindings.event] bindings.  This is an additional
special event only on component elements.  [can-util/dom/events/inserted/inserted]
and [can-util/dom/events/removed/removed] events are available on all elements.

@signature `"{element} beforeremove": function(element, event)`

Listens to when the component element is removed.  
This is commonly used for cleaning up and tearing down a component.

For example, the following might remove the component’s ViewModel
from a parent component’s ViewModel:

```js
events: {
	"{element} beforeremove": function(){
		canViewModel(this.element.parentNode)
			.removePanel(this.viewModel);
	}
}
```

  @param {HTMLElement} element The component element.
  @param {Event} event The `beforeremove` event object.

@signature `($beforeremove)="CALL_EXRESSION"`

Uses [can-stache-bindings.event] bindings to listen for a component’s
`beforeremove` event.

```
<my-panel ($beforeremove)="removePanel(%viewModel)"/>
```

  @param {can-stache/expressions/call} CALL_EXRESSION A call expression that calls some method when the event happens.
