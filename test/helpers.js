var MUTATION_OBSERVER = require('can-globals/mutation-observer/mutation-observer');
var globals = require("can-globals");
var DOCUMENT = require("can-globals/document/document");
var makeDocument = require('can-vdom/make-document/make-document');
var domMutate = require('can-dom-mutate');
var domMutateNode = require('can-dom-mutate/node');
var globals = require('can-globals');
var childNodes = require("can-child-nodes");

var removePlaceholderNodes = function(node){
	var children = Array.from(childNodes(node));
	for(var i = 0; i < children.length; i++) {
		if(children[i].nodeType === Node.COMMENT_NODE) {
			node.removeChild(children[i])
		} else if(children[i].nodeType === Node.ELEMENT_NODE) {
			removePlaceholderNodes(children[i]);
		}
	}
	return node;
};

function cloneAndClean(node) {
	return removePlaceholderNodes( node.cloneNode(true) );
}


var helpers = {
    runTasks: function(tasks, done){
    	var nextTask = function(){
    		var next = tasks.shift();
    		next();
    		if(tasks.length) {
    			setTimeout(nextTask, 100);
    		} else {
    			done();
    		}
    	};
    	setTimeout(nextTask, 100);
    },
    makeTest: function(name, doc, mutObs, test, qUnitTest) {
        var DOC = DOCUMENT();
        //var MUT_OBS = MUTATION_OBSERVER();

    	QUnit.module(name, {
    		beforeEach: function (assert) {
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
    		afterEach: function(assert){
    			doc.body.removeChild(this.fixture);
    			var done = assert.async();
    			setTimeout(function(){
    				done();
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
    },
	cloneAndClean: cloneAndClean
};
module.exports = helpers;
