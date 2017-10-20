var MUTATION_OBSERVER = require('can-util/dom/mutation-observer/mutation-observer');
var DOCUMENT = require("can-util/dom/document/document");
var makeDocument = require('can-vdom/make-document/make-document');
var domMutate = require('can-util/dom/mutate/mutate');
var domEvents = require('can-util/dom/events/events');
var globals = require('can-globals');

var helpers = {
    runTasks: function(tasks){
    	var nextTask = function(){
    		var next = tasks.shift();
    		next();
    		if(tasks.length) {
    			setTimeout(nextTask, 100);
    		} else {
    			start();
    		}
    	};
    	setTimeout(nextTask, 100);
    },
    makeTest: function(name, doc, mutObs, test, qUnitTest) {
        var DOC = DOCUMENT();
        var MUT_OBS = MUTATION_OBSERVER();

    	QUnit.module(name, {
    		setup: function () {
    			DOCUMENT(doc);
    			MUTATION_OBSERVER(mutObs);


    			if(doc) {
    				this.fixture = doc.createElement("div");
    				doc.body.appendChild(this.fixture);
    			} else {
    				this.fixture = doc.getElementById("qunit-fixture");
    			}
    		},
    		teardown: function(){
    			doc.body.removeChild(this.fixture);
    			stop();
    			setTimeout(function(){
    				start();
    				DOCUMENT(DOC);
    				MUTATION_OBSERVER(MUT_OBS);
    			}, 100);
    		}
    	});
        test(doc, qUnitTest);
    },
    makeTests: function(name, test) {

        helpers.makeTest(name+" - dom", document, MUTATION_OBSERVER(), test, QUnit.test);
        helpers.makeTest(name+" - vdom", makeDocument(), null, test, function(){});
    },
    afterMutation: function(cb) {
    	var doc = globals.getKeyValue('document');
    	var div = doc.createElement("div");
    	domEvents.addEventListener.call(div, "inserted", function(){
    		doc.body.removeChild(div);
    		setTimeout(cb, 5);
    	});
        setTimeout(function(){
            domMutate.appendChild.call(doc.body, div);
        },10);

    }
};
module.exports = helpers;
