@property {Object} can-component.prototype.events events
@parent can-component.prototype

Listen to events on elements and observables.

@option {Object.<can-control.eventDescription,can-control.eventHandler>} An object of event names and methods
that handle the event. For example:

    Component.extend({
	  ViewModel: {
		limit: "number",
		offset: "number",
	    next: function(){
	      this.offset = this.offset + this.limit;
	    }
	  },
      events: {
        ".next click": function(){
          this.viewModel.next()
        },
		"{viewModel} limit": function(viewModel, ev, newValue){
		  console.log("limit is now", newValue);
		}
      }
    })


A component’s events object is used as the prototype of a [can-control]. The control gets created on the component’s
element.

The component’s [can-component.prototype.ViewModel] instance is available within event handlers as `this.viewModel`.

The component element is available as `this.element`.


@body

## Use

[can-component]’s events object allows you to provide low-level [can-control]-like abilities to a `Component`
while still accessing the `Component`’s [can-component::ViewModel].  The following
example listens to clicks on elements with `className="next"` and calls `.next()` on the component’s viewModel.

@demo demos/can-component/paginate_events_next.html

The events object can also listen to objects or properties on the component’s [can-component::ViewModel] instance. For instance, instead
of using live-binding, we could listen to when offset changes and update the page manually:

@demo demos/can-component/paginate_events_next_update_page.html

Components have the ability to bind to special inserted and removed events that are called when a component’s tag has been inserted into or removed from the page:

      events: {
        "inserted": function(){
          // called when the component’s tag is inserted into the DOM
        },
        "removed": function(){
          // called when the component’s tag is removed from the DOM
        }
      }

## High performance template rendering

While [can-stache-bindings] conveniently allows you to call a [can-component::ViewModel] method from a template like:

    <input ($change)="doSomething()"/>

This has the effect of binding an event handler directly to this element. Every element that has a `($click)` or similar attribute has an event handler bound to it. For a large grid or list, this could have a performance penalty.

By contrast, events bound using [can-component]’s events object use event delegation, which is useful for high performance template rendering. In a large grid or list, event delegation only binds a single event handler rather than one per row.
