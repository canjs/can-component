var MUTATION_OBSERVER = require('can-globals/mutation-observer/mutation-observer');
var globals = require("can-globals");
var DOCUMENT = require("can-globals/document/document");
var makeDocument = require('can-vdom/make-document/make-document');
var domMutate = require('can-dom-mutate');
var domMutateNode = require('can-dom-mutate/node');
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
        //var MUT_OBS = MUTATION_OBSERVER();

    	QUnit.module(name, {
    		setup: function () {
    			DOCUMENT(doc);
                if(!mutObs) {
                    globals.setKeyValue("MutationObserver", mutObs);
                }


    			if(doc) {
					this.document = doc;
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
    				globals.deleteKeyValue("MutationObserver");
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
    	var insertionDisposal = domMutate.onNodeInsertion(div, function(){
			insertionDisposal();
    		doc.body.removeChild(div);
    		setTimeout(cb, 5);
    	});
        setTimeout(function(){
            domMutateNode.appendChild.call(doc.body, div);
        }, 10);
    }
};
module.exports = helpers;
