@property {function|Object} can-component.prototype.ViewModel ViewModel
@parent can-component.prototype

@description

Provides or describes a constructor function that provides values and methods
to the component's [can-component::view template]. The constructor function
is initialized with values specified by the component element's [can-stache-bindings data bindings].

@option {function} A constructor function usually defined by [can-define/map/map.extend DefineMap.extend] or
[can-map Map.extend] that will be used to create an new observable instance accessible by
the component's [can-component::view].

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

Use [can-view-model] to read a component's view model instance.

  @param {Object} properties The initial properties that are passed by the [can-stache-bindings data bindings].

  The view bindings on a tag control the properties and values used to instantiate the `ViewModel`. For example, calling `<my-tag>` as follows invokes `MyTagViewModel` as shown in the comments:

  ```
  <my-tag/> <!-- new MyTagViewModel({}) -->

  <my-tag
      {message}="'Hi There'"/> <!-- new MyTagViewModel({message: "Hi There"}) -->

  ```

  @return {Object} A new instance of the corresponding constructor function. This instance is
  added to the top of the [can-view-scope] the component's [can-component::view] is rendered with.

@type {Object} A short hand for the prototype methods and properties used to extend the
[can-util/js/types/types.DefaultMap default Map type] (typically [can-define/map/map]) and use
that anonymous type as the view model.

The following:

```js
Component.extend({
    tag: "my-paginate",
    ViewModel: {
        offset: {value: 0},
        limit: {value: 20}
    }
})
```

This is shorthand for:

```js
var AnonymousViewModel = DefineMap.extend({
    offset: {value: 0},
    limit: {value: 20}
})

Component.extend({
    tag: "my-paginate",
    ViewModel: AnonymousViewModel
})
```

@body

## Use

[can-component]'s viewModel property is used to define an __object__, typically an instance
of a [can-map], that will be used to render the component's
template. This is most easily understood with an example.  The following
component shows the current page number based off a `limit` and `offset` value:

```js
var MyPaginateViewModel = DefineMap.extend({
  offset: {value: 0},
  limit: {value: 20},
  page: function(){
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

    var template = stache("<my-paginate/>")
    $("body").append(template())

It would result in:

    <my-paginate>Page 1</my-paginate>

This is because the provided viewModel object is used to extend a [can-map] like:

    CustomMap = Map.extend({
      offset: 0,
      limit: 20,
      page: function(){
        return Math.floor(this.attr('offset') / this.attr('limit')) + 1;
      }
    })

Any primitives found on a `Map`'s prototype (ex: `offset: 0`) are used as
default values.

Next, a new instance of CustomMap is created with the attribute data within `<my-paginate>`
(in this case there is none) like:

    componentData = new CustomMap(attrs);

And finally, that data is added to the [can-view-scope parentScope] of the component, used to
render the component's template, and inserted into the element:

    var newviewModel = parentScope.add(componentData),
        result = stache("Page {{page}}.")(newviewModel);
    $(element).html(result);

## Values passed from attributes

Values can be "passed" into the viewModel of a component, similar to passing arguments into a function. Using
[can-stache-bindings], the following binding types can be setup:

- [can-stache-bindings.toChild] - Update the component's viewModel when the parent scope value changes.
- [can-stache-bindings.toParent] - Update the parent scope when the component's viewModel changes.
- [can-stache-bindings.twoWay] - Update the parent scope or the component's viewModel when the other changes.

As mentioned in the deprecation warning above, using [can-stache], values are passed into components like this:

    <my-paginate {offset}='index' {limit}='size'></my-paginate>

The above would create an offset and limit property on the component that are initialized to whatever index and size are, NOT two-way bind (between component and parent viewModels)
the offset and limit properties to the index and size.

The following component requires an `offset` and `limit`:

    Component.extend({
      tag: "my-paginate",
      viewModel: {
        page: function(){
          return Math.floor(this.attr('offset') / this.attr('limit')) + 1;
        }
      },
      view: stache("Page {{page}}.")
    });

If `<my-paginate>`'s source html is rendered like:

    var template = stache("<my-paginate {offset}='index' {limit}='size'></my-paginate>");

    var pageInfo = new Map({
      index: 0,
      size: 20
    });

    $("body").append( template( pageInfo ) );

... `pageInfo`'s index and size are set as the component's offset and
limit attributes. If we were to change the value of `pageInfo`'s
index like:

    pageInfo.attr("index",20)

... the component's offset value will change and its template will update to:

    <my-paginate>Page 1</my-paginate>

### Using attribute values

You can also pass a literal string value of the attribute. To do this in [can-stache],
simply pass any value not wrapped in single brackets, and the viewModel property will
be initialized to this string value:

    <my-tag title="hello"></my-tag>

The above will create a title property in the component's viewModel, which has a string `hello`.  

If the tag's `title` attribute is changed, it updates the viewModel property
automatically.  This can be seen in the following example:

@demo demos/can-component/accordion.html

Clicking the __Change title__ button sets a `<panel>` element's `title` attribute like:

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

## Calling methods on viewModel from events within the template

Using html attributes like `can-EVENT-METHOD`, you can directly call a viewModel method
from a template. For example, we can make `<my-paginate>` elements include a next
button that calls the viewModel's `next` method like:

```js
var ViewModel = DefineMap.extend({
	offset: {
		value: 0
	},
	limit: {
		value: 20
	},
	next: function(){
		this.offset = this.offset + this.limit;
	},
	page: function(){
		return Math.floor(this.offset / this.limit) + 1;
	}
});

Component.extend({
	tag: "my-paginate",
	ViewModel: ViewModel,
	view: stache("Page {{page}} <button ($click)='next()'>Next</button>")
});
```

viewModel methods get called back with the current context, the element that you are listening to and the event that triggered the callback.

@demo demos/can-component/paginate_next.html

## Publishing events on viewModels

Maps can publish events on themselves. For instance, the following `<player-edit>` component,
dispatches a `"close"` event when it's close method is called:

```
Component.extend({
	tag: "player-edit",
	view: stache($('#player-edit-stache').html()),
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

```
<player-edit
  	(close)="removeEdit()"
  	{player}="editingPlayer"/>
```

The following demo uses this ability to create a close button that
hides the player editor:

@demo demos/can-component/paginate_next_event.html
