@property {function} can-component.prototype.ViewModel ViewModel
@parent can-component.prototype

@description

Provides or describes a constructor function that provides values and methods
to the component’s [can-component::view view]. The constructor function
is initialized with values specified by the component element’s [can-stache-bindings data bindings].

@option {function} A constructor function usually defined by [can-define/map/map.extend DefineMap.extend] or
[can-map Map.extend] that will be used to create a new observable instance accessible by
the component’s [can-component::view].

For example, every time `<my-tag>` is found, a new instance of `MyTagViewModel` will
be created:

```js
var MyTagViewModel = DefineMap.extend("MyTagViewModel",{
	message: "string"
});

Component.extend({
	tag: "my-tag",
	ViewModel: MyTagViewModel,
	view: stache("<h1>{{message}}</h1>")
})
```

Use [can-view-model] to read a component’s view model instance.

@param {Object} properties The initial properties that are passed by the [can-stache-bindings data bindings].

The view bindings on a tag control the properties and values used to instantiate the `ViewModel`. For example, calling `<my-tag>` as follows invokes `MyTagViewModel` as shown in the following example:

```
<my-tag/> <!-- new MyTagViewModel({}) -->

<my-tag
	{message}="'Hi There'"/> <!-- new MyTagViewModel({message: "Hi There"}) -->
```

@return {Object} A new instance of the corresponding constructor function. This instance is
added to the top of the [can-view-scope] the component’s [can-component::view] is rendered with.

@body

## Use

[can-component]’s ViewModel property is used to create an __object__, typically an instance
of a [can-define/map/map], that will be used to render the component’s
view. This is most easily understood with an example.  The following
component shows the current page number based off a `limit` and `offset` value:

```js
var MyPaginateViewModel = DefineMap.extend({
  offset: {value: 0},
  limit: {value: 20},
	get page() {
		return Math.floor(this.offset / this.limit) + 1;
	}
});

Component.extend({
  tag: "my-paginate",
  ViewModel: MyPaginateViewModel,
  view: stache("Page {{page}}.")
})
```

If this component HTML was inserted into the page like:
```js
var renderer = stache("<my-paginate/>");
var frag = renderer();
document.body.appendChild(frag);
```
It would result in:

    <my-paginate>Page 1</my-paginate>

This is because the provided ViewModel object is used to create an instance of [can-define/map/map] like:
```js
var viewModel = new MyPaginateViewModel();
```

The [can-define.types.value] property definition makes offset default to 0 and limit default to 20.

Next, the values are passed into `viewModel` from the [can-stache-bindings data bindings] within `<my-paginate>`
(in this case there is none).

And finally, that data is used to render the component’s view and inserted into the element using [can-view-scope] and [can-stache]:
```js
var newViewModel = new Scope(viewModel),
	result = stache("Page {{page}}.")(newViewModel);
element.innerHTML = result;
```

There is a short-hand for the prototype methods and properties used to extend the
[can-types.DefaultMap default Map type] (typically [can-define/map/map])
by setting the Component’s ViewModel to an object and using
that anonymous type as the view model.

The following does the same as above:
```js
Component.extend({
	tag: "my-paginate",
	ViewModel: {
		offset: {value: 0},
		limit: {value: 20},
		get page() {
			return Math.floor(this.offset / this.limit) + 1;
		}
	},
	view: stache("Page {{page}}.")
})
```

## Values passed from attributes

Values can be "passed" into the viewModel instance of a component, similar to passing arguments into a function. Using
[can-stache-bindings], the following binding types can be setup:

- [can-stache-bindings.toChild] — Update the component’s viewModel instance when the parent scope value changes.
- [can-stache-bindings.toParent] — Update the parent scope when the component’s viewModel instance changes.
- [can-stache-bindings.twoWay] — Update the parent scope or the component’s viewModel instance when the other changes.

Using [can-stache], values are passed into components like this:

    <my-paginate {offset}='index' {limit}='size' />

The above creates an offset and limit property on the component that are initialized to whatever index and size are.

The following component requires an `offset` and `limit`:
```js
Component.extend({
	tag: "my-paginate",
	ViewModel: {
		offset: {value: 0},
		limit: {value: 20},
		get page() {
			return Math.floor(this.offset / this.limit) + 1;
		}
	},
	view: stache("Page {{page}}.")
});
```
If `<my-paginate>` is used like:
```js
var renderer = stache("<my-paginate {offset}='index' {limit}='size' />");

var pageInfo = new DefineMap({index: 0, size: 20});

document.body.appendChild(renderer(pageInfo));
```
... `pageInfo`’s index and size are set as the component’s offset and
limit attributes. If we were to change the value of `pageInfo`’s
index like:
```js
pageInfo.index = 20;
```
... the component’s offset value will change and its view will update to:

    <my-paginate>Page 2</my-paginate>

### Using attribute values

You can also pass a literal string value of the attribute. To do this in [can-stache],
simply pass any value not wrapped in single brackets, and the viewModel instance property will
be initialized to this string value:

    <my-tag title="hello" />

The above will set the title property on the component’s viewModel instance to the string `hello`.

If the tag’s `title` attribute is changed, it updates the viewModel instance property
automatically.  This can be seen in the following example:

@demo demos/can-component/accordion.html

Clicking the __Change title__ button sets a `<panel>` element’s `title` attribute like:

```js
out.addEventListener("click", function(ev){
	var el = ev.target;
	var parent = el.parentNode;
	if(el.nodeName === "BUTTON") {
		parent.setAttribute("title", "Users");
		parent.removeChild(el);
	}
});
```

## Calling methods on ViewModel from events within the view

Using html attributes like `can-EVENT-METHOD`, you can directly call a ViewModel method
from a view. For example, we can make `<my-paginate>` elements include a next
button that calls the ViewModel’s `next` method like:

```js
var ViewModel = DefineMap.extend({
	offset: {value: 0},
	limit: {value: 20},
	next: function(){
		this.offset = this.offset + this.limit;
	},
	get page() {
		return Math.floor(this.offset / this.limit) + 1;
	}
});

Component.extend({
	tag: "my-paginate",
	ViewModel: ViewModel,
	view: stache("Page {{page}} <button ($click)='next()'>Next</button>")
});
```

ViewModel methods get called back with the current context, the element that you are listening to and the event that triggered the callback.

@demo demos/can-component/paginate_next.html

## Publishing events on ViewModels

DefineMaps can publish events on themselves. For instance, the following `<player-edit>` component,
dispatches a `"close"` event when its close method is called:

```js
Component.extend({
	tag: "player-edit",
	view: stache.from('player-edit-stache'),
	ViewModel: DefineMap.extend({
		player: Player,
		close: function(){
			this.dispatch("close");
		}
	}),
	leakScope: true
});
```

These can be listened to with [can-stache-bindings.event] bindings like:

```js
<player-edit
  	(close)="removeEdit()"
  	{player}="editingPlayer" />
```

The following demo uses this ability to create a close button that
hides the player editor:

@demo demos/can-component/paginate_next_event.html
