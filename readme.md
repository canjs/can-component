# can-component

[![Build Status](https://travis-ci.org/canjs/can-component.png?branch=master)](https://travis-ci.org/canjs/can-component)

Custom elements for CanJS.

- <code>[__can-component__ ](#can-component-)</code>
  - <code>[< TAG BINDINGS... >](#-tag-bindings-)</code>
    - _static_
      - <code>[Component.extend(proto)](#componentextendproto)</code>
    - _prototype_
      - <code>[tag String](#tag-string)</code>
      - <code>[template can-stache.renderer|String](#template-can-stacherendererstring)</code>
      - <code>[viewModel Object|can-map|function(attrs, [parentScope](#-tag-bindings-), element)](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element)</code>
      - <code>[events Object\<can-control.eventDescription,can-control.eventHandler\>](#events-objectcan-controleventdescriptioncan-controleventhandler)</code>
      - <code>[helpers Object\<String,can-stache.helper\>](#helpers-objectstringcan-stachehelper)</code>
      - <code>[leakScope Boolean](#leakscope-boolean)</code>

## API


## <code>__can-component__ </code>
Create widgets that use a template, a view-model  and custom tags.



### <code>< TAG BINDINGS... ></code>


  Create an instance of a component on a particular tag in a [can-stache] template.
  In 2.3, use the [can-stache-bindings bindings] syntaxes to set up bindings.

  

1. __TAG__ <code>{String}</code>:
  An HTML tag name that matches the [tag](#tag-string)
  property of the component.
  
1. __BINDINGS__ <code>{can-stache-bindings}</code>:
  Use the following binding syntaxes
  to connect the component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element) to the template’s [can-view-scope scope]:
  
   - [can-stache-bindings.toChild]=[can-stache.key] — one-way binding to child
   - [can-stache-bindings.toParent]=[can-stache.key] — one-way binding to parent
   - [can-stache-bindings.twoWay]=[can-stache.key] — two-way binding child to parent
   
  Example:
  
  ```
  <my-tag {to-child}="key" 
          {^to-parent}="key" 
          {(two-way)}="key"></my-tag>
  ```
  

#### <code>Component.extend(proto)</code>


Extends the [can-component](#-tag-bindings-) constructor function with prototype 
properties and methods.


1. __proto__ <code>{Object}</code>:
  An object set as the prototype of the 
  constructor function. You will typically provide the following values
  on the prototype object.
  
#### tag `{String}`


Specifies the HTML tag (or node-name) the [can-component](#-tag-bindings-) will be created on.



##### <code>String</code>
The tag name the [can-component](#-tag-bindings-)
will be created on.  Tag names are typically lower cased and
hyphenated like: `foo-bar`.  Components register their
tag with [can-view-callbacks.tag tag].



#### template `{can-stache.renderer|String}`


Provides a template to render directly within the component’s tag. The template is rendered with the
component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).  `<content>` elements within the template are replaced by
the source elements within the component’s tag.



##### <code>can-stache.renderer</code>
A [can-stache.renderer] returned by [can-stache]. For example:

    Component({
      tag: "my-tabs",
      template: stache("<ul>{{#panels}}<li>{{title}}</li> ...")
    })



##### <code>String</code>
The string contents of a [can-stache] template.  For example:

    Component({
      tag: "my-tabs",
      template: "<ul>{{#panels}}<li>{{title}}</li> ..."
    })

Note: Using mustache is deprecated.  Please switch to [can-stache].


#### viewModel `{Object|can-map|function(attrs, [parentScope](#-tag-bindings-), element)}`

 
Provides or describes a [can-map] constructor function or `Map` instance that will be
used to retrieve values found in the component’s [template](#template-can-stacherendererstring). The map
instance is initialized with values specified by the component element’s attributes.

__Note:__ This page documents behavior of components in [can-stache]. [can-mustache] behaves
slightly differently. If you want the behavior of components with [can-mustache], 
please look at versions of this page prior to 2.3. In 2.3, use [can-stache-bindings] [can-stache-bindings.toChild], 
[can-stache-bindings.toParent] and [can-stache-bindings.twoWay] to setup viewModel 
bindings.




##### <code>Object</code>
A plain JavaScript object that is used to define the prototype methods and properties of
[can-construct constructor function] that extends [can-map]. For example:

    Component.extend({
      tag: "my-paginate",
      viewModel: {
        offset: 0,
        limit: 20,
        next: function(){
          this.attr("offset", this.offset + this.limit);
        }
      }
    });


##### <code>can-map</code>
A `Map` constructor function will be used to create an instance of the observable
`Map` placed at the head of the template’s viewModel.  For example:

    var Paginate = Map.extend({
      offset: 0,
      limit: 20,
      next: function(){
        this.attr("offset", this.offset + this.limit);
      }
    })
    Component.extend({
      tag: "my-paginate",
      viewModel: Paginate
    })
    


##### <code>function(attrs, [parentScope](#-tag-bindings-), element)</code>
Returns the instance or constructor function of the object that will be added
to the viewModel.


1. __attrs__ <code>{Object}</code>:
  An object of values specified by the custom element’s attributes. For example,
  a template rendered like:
  
      stache("<my-element title='name'></my-element>")({
        name: "Justin"
      })
  
  Creates an instance of following control:
  
      Component.extend({
      	tag: "my-element",
      	viewModel: function(attrs){
      	  attrs.title //-> "Justin";
      	  return new Map(attrs);
      	}
      })
  
  And calls the viewModel function with `attrs` like `{title: "Justin"}`.
  
1. __parentScope__ <code>{[can-component](#-tag-bindings-)|:|:|viewModel}</code>:
  
  
  The viewModel the custom tag was found within.  By default, any attribute’s values will
  be looked up within the current viewModel, but if you want to add values without needing
  the user to provide an attribute, you can set this up here.  For example:
  
      Component.extend({
      	tag: "my-element",
      	viewModel: function(attrs, parentScope){
      	  return new Map({title: parentScope.attr('name')});
      	}
      });
  
  Notice how the attribute’s value is looked up in `my-element`’s parent viewModel.
  
1. __element__ <code>{HTMLElement}</code>:
  The element the [can-component](#-tag-bindings-) is going to be placed on. If you want
  to add custom attribute handling, you can do that here.  For example:
  
      Component.extend({
      	tag: "my-element",
      	viewModel: function(attrs, parentScope, el){
      	  return new Map({title: el.getAttribute('title')});
      	}
      });
  

- __returns__ <code>{can-map|Object}</code>:
  Specifies one of the following:
  
   - The data used to render the component’s template.
   - The prototype of a `Map` that will be used to render the component’s template.
   
#### events `{Object\<can-control.eventDescription,can-control.eventHandler\>}`


Listen to events on elements and observables.



##### <code>Object\<can-control.eventDescription,can-control.eventHandler\></code>
An object of event names and methods 
that handle the event. For example:

    Component({
      events: {
        ".next click": function(){
          this.viewModel.next()
        }
      },
      viewModel: {
        next: function(){
          this.attr("offset", this.offset + this.limit);
        }
      }
    })


A component’s events object is used as the prototype of a [can-control]. The control gets created on the component’s
element. The component’s viewModel is available within event handlers as `this.viewModel`.


#### helpers `{Object\<String,can-stache.helper\>}`


Helper functions used with the component’s template.



##### <code>Object\<String,can-stache.helper\></code>


An object of [can-stache] helper names and methods. The helpers are only
available within the component’s template and source html. Helpers
are always called back with `this` as the [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).

#### leakScope `{Boolean}`

Allow reading the outer scope values from a component’s template and a component’s viewModel values in the user content.




##### <code>Boolean</code>
`false` limits reading to:
 
- the component’s viewModel from the component’s template, and
- the outer scope values from the user content.

`true` adds the ability to read:

- the outer [can-view-scope scope] values from the component’s template, and
- the component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element) values from the user content.
 
The default value is `true`.  This may reverse in 3.0.

## Contributing

### Making a Build

To make a build of the distributables into `dist/` in the cloned repository run

```
npm install
node build
```

### Running the tests

Tests can run in the browser by opening a webserver and visiting the `test.html` page.
Automated tests that run the tests from the command line in Firefox can be run with

```
npm test
```
