@function can-component.extend extend
@parent can-component.static

Define the behavior of a custom element.

@signature `Component.extend(prototype)`

Extends the [can-component] [can-construct constructor function] with prototype
properties and methods.  Registers the component by its [can-component::tag] with
[can-view-callbacks.tag can-view-callbacks.tag].

```js
import Component from "can-component";

Component.extend( {
	tag: "tag-name",
	ViewModel: { /* ... */ },
	view: " /* ... */ "
} );
```

@param {{}} prototype An object set as the prototype of the
constructor function. You will typically provide the following values
on the prototype object:

  - __tag__ {[can-component.prototype.tag]} - Defines the
  tag on which instances of the component constructor function will be
  created.

  - __ViewModel__ {[can-component.prototype.ViewModel]} - Specifies an object
  that is used to render the component’s view.

  - __view__ {[can-component.prototype.view]} - Specifies the view
  rendered within the custom element.

And sometimes the following values are provided:

  - __events__ {[can-component.prototype.events]} - Defines events on
  dom elements or observable objects the component listens to.

  - __helpers__ {[can-component.prototype.helpers]} - Specifies mustache helpers
  used to render the component’s view.



@body


## Use

Note that inheriting from components works differently than other CanJS APIs. You can’t call `.extend` on a particular component to create a “subclass” of that component.

Instead, components work more like HTML elements. To reuse functionality from a base component, build on top of it with parent components that wrap other components in their view and pass any needed viewModel properties via attributes.
