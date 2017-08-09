# # can-component

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
Create widgets that use a view, a view-model, and custom tags.



### <code>< TAG BINDINGS... ></code>


  Create an instance of a component on a particular tag in a [can-stache] view.
  In 2.3, use the [can-stache-bindings bindings] syntaxes to set up bindings.

  

1. __TAG__ <code>{String}</code>:
  An HTML tag name that matches the [tag](#tag-string)
  property of the component.
  
1. __BINDINGS__ <code>{can-stache-bindings}</code>:
  Use the following binding syntaxes
  to connect the component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element) to the view’s [can-view-scope scope]:
  
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



#### view `{can-stache.renderer|String}`


Provides a view to render directly within the component’s tag. The view is rendered with the
component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).  `<content>` elements within the view are replaced by
the source elements within the component’s tag.



##### <code>can-stache.renderer</code>
A [can-stache.renderer] returned by [can-stache]. For example:

    Component({
      tag: "my-tabs",
      view: stache("<ul>{{#panels}}<li>{{title}}</li> ...")
    })



##### <code>String</code>
The string contents of a [can-stache] view.  For example:

    Component({
      tag: "my-tabs",
      view: "<ul>{{#panels}}<li>{{title}}</li> ..."
    })

Note: Using mustache is deprecated.  Please switch to [can-stache].


#### viewModel `{Object|can-map|function(attrs, [parentScope](#-tag-bindings-), element)}`

 
Provides or describes a [can-map] constructor function or `Map` instance that will be
used to retrieve values found in the component’s [view](#template-can-stacherendererstring). The map
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
`Map` placed at the head of the view’s viewModel.  For example:

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
  a view rendered like:
  
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
  
   - The data used to render the component’s view.
   - The prototype of a `Map` that will be used to render the component’s view.
   
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


Helper functions used with the component’s view.



##### <code>Object\<String,can-stache.helper\></code>


An object of [can-stache] helper names and methods. The helpers are only
available within the component’s view and source html. Helpers
are always called back with `this` as the [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).

#### leakScope `{Boolean}`

Allow reading the outer scope values from a component’s view and a component’s viewModel values in the user content.




##### <code>Boolean</code>
`false` limits reading to:
 
- the component’s viewModel from the component’s view, and
- the outer scope values from the user content.

`true` adds the ability to read:

- the outer [can-view-scope scope] values from the component’s view, and
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


[![Join the chat at https://gitter.im/canjs/canjs](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/canjs/canjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/canjs/# can-component

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
Create widgets that use a view, a view-model, and custom tags.



### <code>< TAG BINDINGS... ></code>


  Create an instance of a component on a particular tag in a [can-stache] view.
  In 2.3, use the [can-stache-bindings bindings] syntaxes to set up bindings.

  

1. __TAG__ <code>{String}</code>:
  An HTML tag name that matches the [tag](#tag-string)
  property of the component.
  
1. __BINDINGS__ <code>{can-stache-bindings}</code>:
  Use the following binding syntaxes
  to connect the component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element) to the view’s [can-view-scope scope]:
  
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



#### view `{can-stache.renderer|String}`


Provides a view to render directly within the component’s tag. The view is rendered with the
component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).  `<content>` elements within the view are replaced by
the source elements within the component’s tag.



##### <code>can-stache.renderer</code>
A [can-stache.renderer] returned by [can-stache]. For example:

    Component({
      tag: "my-tabs",
      view: stache("<ul>{{#panels}}<li>{{title}}</li> ...")
    })



##### <code>String</code>
The string contents of a [can-stache] view.  For example:

    Component({
      tag: "my-tabs",
      view: "<ul>{{#panels}}<li>{{title}}</li> ..."
    })

Note: Using mustache is deprecated.  Please switch to [can-stache].


#### viewModel `{Object|can-map|function(attrs, [parentScope](#-tag-bindings-), element)}`

 
Provides or describes a [can-map] constructor function or `Map` instance that will be
used to retrieve values found in the component’s [view](#template-can-stacherendererstring). The map
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
`Map` placed at the head of the view’s viewModel.  For example:

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
  a view rendered like:
  
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
  
   - The data used to render the component’s view.
   - The prototype of a `Map` that will be used to render the component’s view.
   
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


Helper functions used with the component’s view.



##### <code>Object\<String,can-stache.helper\></code>


An object of [can-stache] helper names and methods. The helpers are only
available within the component’s view and source html. Helpers
are always called back with `this` as the [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).

#### leakScope `{Boolean}`

Allow reading the outer scope values from a component’s view and a component’s viewModel values in the user content.




##### <code>Boolean</code>
`false` limits reading to:
 
- the component’s viewModel from the component’s view, and
- the outer scope values from the user content.

`true` adds the ability to read:

- the outer [can-view-scope scope] values from the component’s view, and
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
/blob/master/LICENSE.md)
[![npm version](https://badge.fury.io/js/# can-component

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
Create widgets that use a view, a view-model, and custom tags.



### <code>< TAG BINDINGS... ></code>


  Create an instance of a component on a particular tag in a [can-stache] view.
  In 2.3, use the [can-stache-bindings bindings] syntaxes to set up bindings.

  

1. __TAG__ <code>{String}</code>:
  An HTML tag name that matches the [tag](#tag-string)
  property of the component.
  
1. __BINDINGS__ <code>{can-stache-bindings}</code>:
  Use the following binding syntaxes
  to connect the component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element) to the view’s [can-view-scope scope]:
  
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



#### view `{can-stache.renderer|String}`


Provides a view to render directly within the component’s tag. The view is rendered with the
component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).  `<content>` elements within the view are replaced by
the source elements within the component’s tag.



##### <code>can-stache.renderer</code>
A [can-stache.renderer] returned by [can-stache]. For example:

    Component({
      tag: "my-tabs",
      view: stache("<ul>{{#panels}}<li>{{title}}</li> ...")
    })



##### <code>String</code>
The string contents of a [can-stache] view.  For example:

    Component({
      tag: "my-tabs",
      view: "<ul>{{#panels}}<li>{{title}}</li> ..."
    })

Note: Using mustache is deprecated.  Please switch to [can-stache].


#### viewModel `{Object|can-map|function(attrs, [parentScope](#-tag-bindings-), element)}`

 
Provides or describes a [can-map] constructor function or `Map` instance that will be
used to retrieve values found in the component’s [view](#template-can-stacherendererstring). The map
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
`Map` placed at the head of the view’s viewModel.  For example:

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
  a view rendered like:
  
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
  
   - The data used to render the component’s view.
   - The prototype of a `Map` that will be used to render the component’s view.
   
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


Helper functions used with the component’s view.



##### <code>Object\<String,can-stache.helper\></code>


An object of [can-stache] helper names and methods. The helpers are only
available within the component’s view and source html. Helpers
are always called back with `this` as the [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).

#### leakScope `{Boolean}`

Allow reading the outer scope values from a component’s view and a component’s viewModel values in the user content.




##### <code>Boolean</code>
`false` limits reading to:
 
- the component’s viewModel from the component’s view, and
- the outer scope values from the user content.

`true` adds the ability to read:

- the outer [can-view-scope scope] values from the component’s view, and
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
.svg)](https://www.npmjs.com/package/# can-component

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
Create widgets that use a view, a view-model, and custom tags.



### <code>< TAG BINDINGS... ></code>


  Create an instance of a component on a particular tag in a [can-stache] view.
  In 2.3, use the [can-stache-bindings bindings] syntaxes to set up bindings.

  

1. __TAG__ <code>{String}</code>:
  An HTML tag name that matches the [tag](#tag-string)
  property of the component.
  
1. __BINDINGS__ <code>{can-stache-bindings}</code>:
  Use the following binding syntaxes
  to connect the component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element) to the view’s [can-view-scope scope]:
  
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



#### view `{can-stache.renderer|String}`


Provides a view to render directly within the component’s tag. The view is rendered with the
component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).  `<content>` elements within the view are replaced by
the source elements within the component’s tag.



##### <code>can-stache.renderer</code>
A [can-stache.renderer] returned by [can-stache]. For example:

    Component({
      tag: "my-tabs",
      view: stache("<ul>{{#panels}}<li>{{title}}</li> ...")
    })



##### <code>String</code>
The string contents of a [can-stache] view.  For example:

    Component({
      tag: "my-tabs",
      view: "<ul>{{#panels}}<li>{{title}}</li> ..."
    })

Note: Using mustache is deprecated.  Please switch to [can-stache].


#### viewModel `{Object|can-map|function(attrs, [parentScope](#-tag-bindings-), element)}`

 
Provides or describes a [can-map] constructor function or `Map` instance that will be
used to retrieve values found in the component’s [view](#template-can-stacherendererstring). The map
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
`Map` placed at the head of the view’s viewModel.  For example:

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
  a view rendered like:
  
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
  
   - The data used to render the component’s view.
   - The prototype of a `Map` that will be used to render the component’s view.
   
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


Helper functions used with the component’s view.



##### <code>Object\<String,can-stache.helper\></code>


An object of [can-stache] helper names and methods. The helpers are only
available within the component’s view and source html. Helpers
are always called back with `this` as the [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).

#### leakScope `{Boolean}`

Allow reading the outer scope values from a component’s view and a component’s viewModel values in the user content.




##### <code>Boolean</code>
`false` limits reading to:
 
- the component’s viewModel from the component’s view, and
- the outer scope values from the user content.

`true` adds the ability to read:

- the outer [can-view-scope scope] values from the component’s view, and
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
)
[![Travis build status](https://travis-ci.org/canjs/# can-component

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
Create widgets that use a view, a view-model, and custom tags.



### <code>< TAG BINDINGS... ></code>


  Create an instance of a component on a particular tag in a [can-stache] view.
  In 2.3, use the [can-stache-bindings bindings] syntaxes to set up bindings.

  

1. __TAG__ <code>{String}</code>:
  An HTML tag name that matches the [tag](#tag-string)
  property of the component.
  
1. __BINDINGS__ <code>{can-stache-bindings}</code>:
  Use the following binding syntaxes
  to connect the component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element) to the view’s [can-view-scope scope]:
  
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



#### view `{can-stache.renderer|String}`


Provides a view to render directly within the component’s tag. The view is rendered with the
component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).  `<content>` elements within the view are replaced by
the source elements within the component’s tag.



##### <code>can-stache.renderer</code>
A [can-stache.renderer] returned by [can-stache]. For example:

    Component({
      tag: "my-tabs",
      view: stache("<ul>{{#panels}}<li>{{title}}</li> ...")
    })



##### <code>String</code>
The string contents of a [can-stache] view.  For example:

    Component({
      tag: "my-tabs",
      view: "<ul>{{#panels}}<li>{{title}}</li> ..."
    })

Note: Using mustache is deprecated.  Please switch to [can-stache].


#### viewModel `{Object|can-map|function(attrs, [parentScope](#-tag-bindings-), element)}`

 
Provides or describes a [can-map] constructor function or `Map` instance that will be
used to retrieve values found in the component’s [view](#template-can-stacherendererstring). The map
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
`Map` placed at the head of the view’s viewModel.  For example:

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
  a view rendered like:
  
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
  
   - The data used to render the component’s view.
   - The prototype of a `Map` that will be used to render the component’s view.
   
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


Helper functions used with the component’s view.



##### <code>Object\<String,can-stache.helper\></code>


An object of [can-stache] helper names and methods. The helpers are only
available within the component’s view and source html. Helpers
are always called back with `this` as the [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).

#### leakScope `{Boolean}`

Allow reading the outer scope values from a component’s view and a component’s viewModel values in the user content.




##### <code>Boolean</code>
`false` limits reading to:
 
- the component’s viewModel from the component’s view, and
- the outer scope values from the user content.

`true` adds the ability to read:

- the outer [can-view-scope scope] values from the component’s view, and
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
.svg?branch=master)](https://travis-ci.org/canjs/# can-component

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
Create widgets that use a view, a view-model, and custom tags.



### <code>< TAG BINDINGS... ></code>


  Create an instance of a component on a particular tag in a [can-stache] view.
  In 2.3, use the [can-stache-bindings bindings] syntaxes to set up bindings.

  

1. __TAG__ <code>{String}</code>:
  An HTML tag name that matches the [tag](#tag-string)
  property of the component.
  
1. __BINDINGS__ <code>{can-stache-bindings}</code>:
  Use the following binding syntaxes
  to connect the component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element) to the view’s [can-view-scope scope]:
  
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



#### view `{can-stache.renderer|String}`


Provides a view to render directly within the component’s tag. The view is rendered with the
component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).  `<content>` elements within the view are replaced by
the source elements within the component’s tag.



##### <code>can-stache.renderer</code>
A [can-stache.renderer] returned by [can-stache]. For example:

    Component({
      tag: "my-tabs",
      view: stache("<ul>{{#panels}}<li>{{title}}</li> ...")
    })



##### <code>String</code>
The string contents of a [can-stache] view.  For example:

    Component({
      tag: "my-tabs",
      view: "<ul>{{#panels}}<li>{{title}}</li> ..."
    })

Note: Using mustache is deprecated.  Please switch to [can-stache].


#### viewModel `{Object|can-map|function(attrs, [parentScope](#-tag-bindings-), element)}`

 
Provides or describes a [can-map] constructor function or `Map` instance that will be
used to retrieve values found in the component’s [view](#template-can-stacherendererstring). The map
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
`Map` placed at the head of the view’s viewModel.  For example:

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
  a view rendered like:
  
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
  
   - The data used to render the component’s view.
   - The prototype of a `Map` that will be used to render the component’s view.
   
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


Helper functions used with the component’s view.



##### <code>Object\<String,can-stache.helper\></code>


An object of [can-stache] helper names and methods. The helpers are only
available within the component’s view and source html. Helpers
are always called back with `this` as the [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).

#### leakScope `{Boolean}`

Allow reading the outer scope values from a component’s view and a component’s viewModel values in the user content.




##### <code>Boolean</code>
`false` limits reading to:
 
- the component’s viewModel from the component’s view, and
- the outer scope values from the user content.

`true` adds the ability to read:

- the outer [can-view-scope scope] values from the component’s view, and
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
)
[![AppVeyor build status](https://ci.appveyor.com/api/projects/status/github/canjs/can-zone?branch=master&svg=true)](https://ci.appveyor.com/project/matthewp/can-zone)
[![Coverage status](https://coveralls.io/repos/github/donejs/donejs/badge.svg?branch=master)](https://coveralls.io/github/donejs/donejs?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/donejs/cli.svg)](https://greenkeeper.io/)

undefined

## Documentation

Read the [API docs on CanJS.com](https://canjs.com/doc/# can-component

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
Create widgets that use a view, a view-model, and custom tags.



### <code>< TAG BINDINGS... ></code>


  Create an instance of a component on a particular tag in a [can-stache] view.
  In 2.3, use the [can-stache-bindings bindings] syntaxes to set up bindings.

  

1. __TAG__ <code>{String}</code>:
  An HTML tag name that matches the [tag](#tag-string)
  property of the component.
  
1. __BINDINGS__ <code>{can-stache-bindings}</code>:
  Use the following binding syntaxes
  to connect the component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element) to the view’s [can-view-scope scope]:
  
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



#### view `{can-stache.renderer|String}`


Provides a view to render directly within the component’s tag. The view is rendered with the
component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).  `<content>` elements within the view are replaced by
the source elements within the component’s tag.



##### <code>can-stache.renderer</code>
A [can-stache.renderer] returned by [can-stache]. For example:

    Component({
      tag: "my-tabs",
      view: stache("<ul>{{#panels}}<li>{{title}}</li> ...")
    })



##### <code>String</code>
The string contents of a [can-stache] view.  For example:

    Component({
      tag: "my-tabs",
      view: "<ul>{{#panels}}<li>{{title}}</li> ..."
    })

Note: Using mustache is deprecated.  Please switch to [can-stache].


#### viewModel `{Object|can-map|function(attrs, [parentScope](#-tag-bindings-), element)}`

 
Provides or describes a [can-map] constructor function or `Map` instance that will be
used to retrieve values found in the component’s [view](#template-can-stacherendererstring). The map
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
`Map` placed at the head of the view’s viewModel.  For example:

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
  a view rendered like:
  
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
  
   - The data used to render the component’s view.
   - The prototype of a `Map` that will be used to render the component’s view.
   
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


Helper functions used with the component’s view.



##### <code>Object\<String,can-stache.helper\></code>


An object of [can-stache] helper names and methods. The helpers are only
available within the component’s view and source html. Helpers
are always called back with `this` as the [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).

#### leakScope `{Boolean}`

Allow reading the outer scope values from a component’s view and a component’s viewModel values in the user content.




##### <code>Boolean</code>
`false` limits reading to:
 
- the component’s viewModel from the component’s view, and
- the outer scope values from the user content.

`true` adds the ability to read:

- the outer [can-view-scope scope] values from the component’s view, and
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
.html).

## Changelog

See the [latest releases on GitHub](https://github.com/canjs/# can-component

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
Create widgets that use a view, a view-model, and custom tags.



### <code>< TAG BINDINGS... ></code>


  Create an instance of a component on a particular tag in a [can-stache] view.
  In 2.3, use the [can-stache-bindings bindings] syntaxes to set up bindings.

  

1. __TAG__ <code>{String}</code>:
  An HTML tag name that matches the [tag](#tag-string)
  property of the component.
  
1. __BINDINGS__ <code>{can-stache-bindings}</code>:
  Use the following binding syntaxes
  to connect the component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element) to the view’s [can-view-scope scope]:
  
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



#### view `{can-stache.renderer|String}`


Provides a view to render directly within the component’s tag. The view is rendered with the
component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).  `<content>` elements within the view are replaced by
the source elements within the component’s tag.



##### <code>can-stache.renderer</code>
A [can-stache.renderer] returned by [can-stache]. For example:

    Component({
      tag: "my-tabs",
      view: stache("<ul>{{#panels}}<li>{{title}}</li> ...")
    })



##### <code>String</code>
The string contents of a [can-stache] view.  For example:

    Component({
      tag: "my-tabs",
      view: "<ul>{{#panels}}<li>{{title}}</li> ..."
    })

Note: Using mustache is deprecated.  Please switch to [can-stache].


#### viewModel `{Object|can-map|function(attrs, [parentScope](#-tag-bindings-), element)}`

 
Provides or describes a [can-map] constructor function or `Map` instance that will be
used to retrieve values found in the component’s [view](#template-can-stacherendererstring). The map
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
`Map` placed at the head of the view’s viewModel.  For example:

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
  a view rendered like:
  
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
  
   - The data used to render the component’s view.
   - The prototype of a `Map` that will be used to render the component’s view.
   
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


Helper functions used with the component’s view.



##### <code>Object\<String,can-stache.helper\></code>


An object of [can-stache] helper names and methods. The helpers are only
available within the component’s view and source html. Helpers
are always called back with `this` as the [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).

#### leakScope `{Boolean}`

Allow reading the outer scope values from a component’s view and a component’s viewModel values in the user content.




##### <code>Boolean</code>
`false` limits reading to:
 
- the component’s viewModel from the component’s view, and
- the outer scope values from the user content.

`true` adds the ability to read:

- the outer [can-view-scope scope] values from the component’s view, and
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
/releases).

## Contributing

The [contribution guide](https://github.com/canjs/# can-component

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
Create widgets that use a view, a view-model, and custom tags.



### <code>< TAG BINDINGS... ></code>


  Create an instance of a component on a particular tag in a [can-stache] view.
  In 2.3, use the [can-stache-bindings bindings] syntaxes to set up bindings.

  

1. __TAG__ <code>{String}</code>:
  An HTML tag name that matches the [tag](#tag-string)
  property of the component.
  
1. __BINDINGS__ <code>{can-stache-bindings}</code>:
  Use the following binding syntaxes
  to connect the component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element) to the view’s [can-view-scope scope]:
  
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



#### view `{can-stache.renderer|String}`


Provides a view to render directly within the component’s tag. The view is rendered with the
component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).  `<content>` elements within the view are replaced by
the source elements within the component’s tag.



##### <code>can-stache.renderer</code>
A [can-stache.renderer] returned by [can-stache]. For example:

    Component({
      tag: "my-tabs",
      view: stache("<ul>{{#panels}}<li>{{title}}</li> ...")
    })



##### <code>String</code>
The string contents of a [can-stache] view.  For example:

    Component({
      tag: "my-tabs",
      view: "<ul>{{#panels}}<li>{{title}}</li> ..."
    })

Note: Using mustache is deprecated.  Please switch to [can-stache].


#### viewModel `{Object|can-map|function(attrs, [parentScope](#-tag-bindings-), element)}`

 
Provides or describes a [can-map] constructor function or `Map` instance that will be
used to retrieve values found in the component’s [view](#template-can-stacherendererstring). The map
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
`Map` placed at the head of the view’s viewModel.  For example:

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
  a view rendered like:
  
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
  
   - The data used to render the component’s view.
   - The prototype of a `Map` that will be used to render the component’s view.
   
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


Helper functions used with the component’s view.



##### <code>Object\<String,can-stache.helper\></code>


An object of [can-stache] helper names and methods. The helpers are only
available within the component’s view and source html. Helpers
are always called back with `this` as the [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).

#### leakScope `{Boolean}`

Allow reading the outer scope values from a component’s view and a component’s viewModel values in the user content.




##### <code>Boolean</code>
`false` limits reading to:
 
- the component’s viewModel from the component’s view, and
- the outer scope values from the user content.

`true` adds the ability to read:

- the outer [can-view-scope scope] values from the component’s view, and
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
/blob/master/CONTRIBUTING.md) has information on getting help, reporting bugs, developing locally, and more.

## License

[MIT](https://github.com/canjs/# can-component

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
Create widgets that use a view, a view-model, and custom tags.



### <code>< TAG BINDINGS... ></code>


  Create an instance of a component on a particular tag in a [can-stache] view.
  In 2.3, use the [can-stache-bindings bindings] syntaxes to set up bindings.

  

1. __TAG__ <code>{String}</code>:
  An HTML tag name that matches the [tag](#tag-string)
  property of the component.
  
1. __BINDINGS__ <code>{can-stache-bindings}</code>:
  Use the following binding syntaxes
  to connect the component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element) to the view’s [can-view-scope scope]:
  
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



#### view `{can-stache.renderer|String}`


Provides a view to render directly within the component’s tag. The view is rendered with the
component’s [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).  `<content>` elements within the view are replaced by
the source elements within the component’s tag.



##### <code>can-stache.renderer</code>
A [can-stache.renderer] returned by [can-stache]. For example:

    Component({
      tag: "my-tabs",
      view: stache("<ul>{{#panels}}<li>{{title}}</li> ...")
    })



##### <code>String</code>
The string contents of a [can-stache] view.  For example:

    Component({
      tag: "my-tabs",
      view: "<ul>{{#panels}}<li>{{title}}</li> ..."
    })

Note: Using mustache is deprecated.  Please switch to [can-stache].


#### viewModel `{Object|can-map|function(attrs, [parentScope](#-tag-bindings-), element)}`

 
Provides or describes a [can-map] constructor function or `Map` instance that will be
used to retrieve values found in the component’s [view](#template-can-stacherendererstring). The map
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
`Map` placed at the head of the view’s viewModel.  For example:

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
  a view rendered like:
  
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
  
   - The data used to render the component’s view.
   - The prototype of a `Map` that will be used to render the component’s view.
   
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


Helper functions used with the component’s view.



##### <code>Object\<String,can-stache.helper\></code>


An object of [can-stache] helper names and methods. The helpers are only
available within the component’s view and source html. Helpers
are always called back with `this` as the [viewModel](#viewmodel-objectcan-mapfunctionattrs-parentscope-tag-bindings--element).

#### leakScope `{Boolean}`

Allow reading the outer scope values from a component’s view and a component’s viewModel values in the user content.




##### <code>Boolean</code>
`false` limits reading to:
 
- the component’s viewModel from the component’s view, and
- the outer scope values from the user content.

`true` adds the ability to read:

- the outer [can-view-scope scope] values from the component’s view, and
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
/blob/master/LICENSE.md)

