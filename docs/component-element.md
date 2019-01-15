@typedef {can-stache.sectionRenderer} can-component/component-element <tag bindings...>
@parent can-component.create 0


@signature `<TAG BINDINGS...>[TEMPLATES][LIGHT_DOM]</TAG>`

Create an instance of a component on a particular tag in a [can-stache] view.
Use the [can-stache-bindings bindings] syntaxes to set up bindings.

The following creates a `my-autocomplete` element and passes the `my-autocomplete`’s
[can-component.prototype.ViewModel] the `Search` model as its `source` property and
a [can-component/can-template] that is used to render the search results:

```html
<my-autocomplete source:from="Search">
	<can-template name="search-results">
		<li>{{name}}</li>
	</can-template>
</my-autocomplete>
```

	@release 2.3

	@param {String} TAG An HTML tag name that matches the [can-component::tag tag]
	property of the component. Tag names should include a hyphen (`-`) or a colon (`:`) like:
	`acme-tabs` or `acme:tabs`.

	@param {can-stache-bindings} [BINDINGS] Use the following binding syntaxes
	to connect the component’s [can-component::ViewModel] to the view’s [can-view-scope scope]:

	 - [can-stache-bindings.toChild]=[can-stache.expressions expression] — one-way data binding to child
	 - [can-stache-bindings.toParent]=[can-stache.expressions expression] — one-way data binding to parent
	 - [can-stache-bindings.twoWay]=[can-stache.expressions expression] — two-way data binding child to parent
	 - [can-stache-bindings.event]=[can-stache/expressions/call expression] — event binding on the view model

	 @param {can-stache.sectionRenderer} [TEMPLATES] Between the starting and ending tag
	 can exist one or many [can-component/can-template] elements.  Use [can-component/can-template] elements
	 to pass custom templates to child components.  Each `<can-template>`
	 is given a `name` attribute and can be rendered by a corresponding [can-component/can-slot]
	 in the component’s [can-component.prototype.view].

	 For example, the following passes how each search result should look and an error message if
	 the source is unable to request data:

	 ```html
	 <my-autocomplete source:from="Search">
		 <can-template name="search-results">
			 <li>{{name}}</li>
		 </can-template>
		 <can-template name="search-error">
			 <div class="error">{{message}}</div>
		 </can-template>
	 </my-autocomplete>
	 ```

	 @param {can-stache.sectionRenderer} [LIGHT_DOM] The content between the starting and ending
	 tag. For example, `Hello <b>World</b>` is the `LIGHT_DOM` in the following:

	 ```html
	 <my-tag>Hello <b>World</b></my-tag>
	 ```

	 The `LIGHT_DOM` can be positioned with a component’s [can-component.prototype.view] with
	 the [can-component/content] element.  The data accessible to the `LIGHT_DOM` can be controlled
	 with [can-component.prototype.leakScope].
