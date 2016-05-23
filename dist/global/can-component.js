/*[global-shim-start]*/
(function(exports, global, doEval){ // jshint ignore:line
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var set = function(name, val){
		var parts = name.split("."),
			cur = global,
			i, part, next;
		for(i = 0; i < parts.length - 1; i++) {
			part = parts[i];
			next = cur[part];
			if(!next) {
				next = cur[part] = {};
			}
			cur = next;
		}
		part = parts[parts.length - 1];
		cur[part] = val;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		result = module && module.exports ? module.exports : result;
		modules[moduleName] = result;

		// Set global exports
		var globalExport = exports[moduleName];
		if(globalExport && !get(globalExport)) {
			set(globalExport, result);
		}
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				doEval(__load.source, global);
			}
		};
	});
}
)({"can-util/namespace":"can"},window,function(__$source__, __$global__) { // jshint ignore:line
	eval("(function() { " + __$source__ + " \n }).call(__$global__);");
}
)
/*can-util@3.0.0-pre.22#js/assign/assign*/
define('can-util/js/assign/assign', function (require, exports, module) {
    module.exports = function (d, s) {
        for (var prop in s) {
            d[prop] = s[prop];
        }
        return d;
    };
});
/*can-util@3.0.0-pre.22#js/is-array/is-array*/
define('can-util/js/is-array/is-array', function (require, exports, module) {
    module.exports = function (arr) {
        return Array.isArray(arr);
    };
});
/*can-util@3.0.0-pre.22#js/is-function/is-function*/
define('can-util/js/is-function/is-function', function (require, exports, module) {
    var isFunction = function () {
        if (typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') {
            return function (value) {
                return Object.prototype.toString.call(value) === '[object Function]';
            };
        }
        return function (value) {
            return typeof value === 'function';
        };
    }();
    module.exports = isFunction;
});
/*can-util@3.0.0-pre.22#js/is-plain-object/is-plain-object*/
define('can-util/js/is-plain-object/is-plain-object', function (require, exports, module) {
    var core_hasOwn = Object.prototype.hasOwnProperty;
    function isWindow(obj) {
        return obj !== null && obj == obj.window;
    }
    function isPlainObject(obj) {
        if (!obj || typeof obj !== 'object' || obj.nodeType || isWindow(obj)) {
            return false;
        }
        try {
            if (obj.constructor && !core_hasOwn.call(obj, 'constructor') && !core_hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
        } catch (e) {
            return false;
        }
        var key;
        for (key in obj) {
        }
        return key === undefined || core_hasOwn.call(obj, key);
    }
    module.exports = isPlainObject;
});
/*can-util@3.0.0-pre.22#js/deep-extend/deep-extend*/
define('can-util/js/deep-extend/deep-extend', function (require, exports, module) {
    var isArray = require('can-util/js/is-array/is-array');
    var isFunction = require('can-util/js/is-function/is-function');
    var isPlainObject = require('can-util/js/is-plain-object/is-plain-object');
    function extend() {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if (typeof target !== 'object' && !isFunction(target)) {
            target = {};
        }
        if (length === i) {
            target = this;
            --i;
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && isArray(src) ? src : [];
                        } else {
                            clone = src && isPlainObject(src) ? src : {};
                        }
                        target[name] = extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    }
    module.exports = extend;
});
/*can-util@3.0.0-pre.22#js/dev/dev*/
define('can-util/js/dev/dev', function (require, exports, module) {
});
/*can-util@3.0.0-pre.22#js/is-array-like/is-array-like*/
define('can-util/js/is-array-like/is-array-like', function (require, exports, module) {
    function isArrayLike(obj) {
        var type = typeof obj;
        if (type === 'string') {
            return true;
        }
        var length = obj && type !== 'boolean' && typeof obj !== 'number' && 'length' in obj && obj.length;
        return typeof arr !== 'function' && (length === 0 || typeof length === 'number' && length > 0 && length - 1 in obj);
    }
    module.exports = isArrayLike;
});
/*can-util@3.0.0-pre.22#js/each/each*/
define('can-util/js/each/each', function (require, exports, module) {
    var isArrayLike = require('can-util/js/is-array-like/is-array-like');
    function each(elements, callback, context) {
        var i = 0, key, len, item;
        if (elements) {
            if (isArrayLike(elements)) {
                for (len = elements.length; i < len; i++) {
                    item = elements[i];
                    if (callback.call(context || item, item, i, elements) === false) {
                        break;
                    }
                }
            } else if (typeof elements === 'object') {
                for (key in elements) {
                    if (Object.prototype.hasOwnProperty.call(elements, key) && callback.call(context || elements[key], elements[key], key, elements) === false) {
                        break;
                    }
                }
            }
        }
        return elements;
    }
    module.exports = each;
});
/*can-util@3.0.0-pre.22#js/make-array/make-array*/
define('can-util/js/make-array/make-array', function (require, exports, module) {
    var each = require('can-util/js/each/each');
    function makeArray(arr) {
        var ret = [];
        each(arr, function (a, i) {
            ret[i] = a;
        });
        return ret;
    }
    module.exports = makeArray;
});
/*can-util@3.0.0-pre.22#js/is-promise/is-promise*/
define('can-util/js/is-promise/is-promise', function (require, exports, module) {
    var isFunction = require('can-util/js/is-function/is-function');
    module.exports = function (obj) {
        return !!obj && (typeof window !== 'undefined' && window.Promise && obj instanceof Promise || isFunction(obj.then) && isFunction(obj.catch));
    };
});
/*can-util@3.0.0-pre.22#js/types/types*/
define('can-util/js/types/types', function (require, exports, module) {
    var isPromise = require('can-util/js/is-promise/is-promise');
    var types = {
        isMapLike: function () {
            return false;
        },
        isListLike: function () {
            return false;
        },
        isPromise: function (obj) {
            return isPromise(obj);
        },
        isConstructor: function (func) {
            if (typeof func !== 'function') {
                return false;
            }
            for (var prop in func.prototype) {
                return true;
            }
            return false;
        },
        isCallableForValue: function (obj) {
            return typeof obj === 'function' && !types.isConstructor(obj);
        },
        isCompute: function (obj) {
            return obj && obj.isComputed;
        },
        DefaultMap: null,
        DefaultList: null
    };
    module.exports = types;
});
/*can-util@3.0.0-pre.22#namespace*/
define('can-util/namespace', function (require, exports, module) {
    module.exports = {};
});
/*can-construct@3.0.0-pre.5#can-construct*/
define('can-construct', function (require, exports, module) {
    'use strict';
    var assign = require('can-util/js/assign/assign');
    var deepAssign = require('can-util/js/deep-extend/deep-extend');
    var dev = require('can-util/js/dev/dev');
    var makeArray = require('can-util/js/make-array/make-array');
    var types = require('can-util/js/types/types');
    var namespace = require('can-util/namespace');
    var initializing = 0;
    var Construct = function () {
        if (arguments.length) {
            return Construct.extend.apply(Construct, arguments);
        }
    };
    var canGetDescriptor;
    try {
        Object.getOwnPropertyDescriptor({});
        canGetDescriptor = true;
    } catch (e) {
        canGetDescriptor = false;
    }
    var getDescriptor = function (newProps, name) {
            var descriptor = Object.getOwnPropertyDescriptor(newProps, name);
            if (descriptor && (descriptor.get || descriptor.set)) {
                return descriptor;
            }
            return null;
        }, inheritGetterSetter = function (newProps, oldProps, addTo) {
            addTo = addTo || newProps;
            var descriptor;
            for (var name in newProps) {
                if (descriptor = getDescriptor(newProps, name)) {
                    this._defineProperty(addTo, oldProps, name, descriptor);
                } else {
                    Construct._overwrite(addTo, oldProps, name, newProps[name]);
                }
            }
        }, simpleInherit = function (newProps, oldProps, addTo) {
            addTo = addTo || newProps;
            for (var name in newProps) {
                Construct._overwrite(addTo, oldProps, name, newProps[name]);
            }
        };
    assign(Construct, {
        constructorExtends: true,
        newInstance: function () {
            var inst = this.instance(), args;
            if (inst.setup) {
                Object.defineProperty(inst, '__inSetup', {
                    configurable: true,
                    enumerable: false,
                    value: true,
                    writable: true
                });
                args = inst.setup.apply(inst, arguments);
                inst.__inSetup = false;
            }
            if (inst.init) {
                inst.init.apply(inst, args || arguments);
            }
            return inst;
        },
        _inherit: canGetDescriptor ? inheritGetterSetter : simpleInherit,
        _defineProperty: function (what, oldProps, propName, descriptor) {
            Object.defineProperty(what, propName, descriptor);
        },
        _overwrite: function (what, oldProps, propName, val) {
            what[propName] = val;
        },
        setup: function (base) {
            this.defaults = deepAssign(true, {}, base.defaults, this.defaults);
        },
        instance: function () {
            initializing = 1;
            var inst = new this();
            initializing = 0;
            return inst;
        },
        extend: function (name, staticProperties, instanceProperties) {
            var shortName = name, klass = staticProperties, proto = instanceProperties;
            if (typeof shortName !== 'string') {
                proto = klass;
                klass = shortName;
                shortName = null;
            }
            if (!proto) {
                proto = klass;
                klass = null;
            }
            proto = proto || {};
            var _super_class = this, _super = this.prototype, Constructor, namespace, prototype;
            prototype = this.instance();
            Construct._inherit(proto, _super, prototype);
            if (shortName) {
            } else if (klass && klass.shortName) {
                shortName = klass.shortName;
            } else if (this.shortName) {
                shortName = this.shortName;
            }
            function init() {
                if (!initializing) {
                    return (!this || this.constructor !== Constructor) && arguments.length && Constructor.constructorExtends ? Constructor.extend.apply(Constructor, arguments) : Constructor.newInstance.apply(Constructor, arguments);
                }
            }
            if (typeof constructorName === 'undefined') {
                Constructor = function () {
                    return init.apply(this, arguments);
                };
            }
            for (var propName in _super_class) {
                if (_super_class.hasOwnProperty(propName)) {
                    Constructor[propName] = _super_class[propName];
                }
            }
            Construct._inherit(klass, _super_class, Constructor);
            assign(Constructor, {
                constructor: Constructor,
                prototype: prototype,
                namespace: namespace
            });
            if (shortName !== undefined) {
                Constructor.shortName = shortName;
            }
            Constructor.prototype.constructor = Constructor;
            var t = [_super_class].concat(makeArray(arguments)), args = Constructor.setup.apply(Constructor, t);
            if (Constructor.init) {
                Constructor.init.apply(Constructor, args || t);
            }
            return Constructor;
        }
    });
    Construct.prototype.setup = function () {
    };
    Construct.prototype.init = function () {
    };
    var oldIsConstructor = types.isConstructor;
    types.isConstructor = function (obj) {
        return obj.prototype instanceof Construct || oldIsConstructor.call(null, obj);
    };
    module.exports = namespace.Construct = Construct;
});
/*can-util@3.0.0-pre.22#js/string/string*/
define('can-util/js/string/string', function (require, exports, module) {
    var isArray = require('can-util/js/is-array/is-array');
    var strUndHash = /_|-/, strColons = /\=\=/, strWords = /([A-Z]+)([A-Z][a-z])/g, strLowUp = /([a-z\d])([A-Z])/g, strDash = /([a-z\d])([A-Z])/g, strReplacer = /\{([^\}]+)\}/g, strQuote = /"/g, strSingleQuote = /'/g, strHyphenMatch = /-+(.)?/g, strCamelMatch = /[a-z][A-Z]/g, getNext = function (obj, prop, add) {
            var result = obj[prop];
            if (result === undefined && add === true) {
                result = obj[prop] = {};
            }
            return result;
        }, isContainer = function (current) {
            return /^f|^o/.test(typeof current);
        }, convertBadValues = function (content) {
            var isInvalid = content === null || content === undefined || isNaN(content) && '' + content === 'NaN';
            return '' + (isInvalid ? '' : content);
        };
    var string = {
        esc: function (content) {
            return convertBadValues(content).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(strQuote, '&#34;').replace(strSingleQuote, '&#39;');
        },
        getObject: function (name, roots, add) {
            var parts = name ? name.split('.') : [], length = parts.length, current, r = 0, i, container, rootsLength;
            roots = isArray(roots) ? roots : [roots || window];
            rootsLength = roots.length;
            if (!length) {
                return roots[0];
            }
            for (r; r < rootsLength; r++) {
                current = roots[r];
                container = undefined;
                for (i = 0; i < length && isContainer(current); i++) {
                    container = current;
                    current = getNext(container, parts[i]);
                }
                if (container !== undefined && current !== undefined) {
                    break;
                }
            }
            if (add === false && current !== undefined) {
                delete container[parts[i - 1]];
            }
            if (add === true && current === undefined) {
                current = roots[0];
                for (i = 0; i < length && isContainer(current); i++) {
                    current = getNext(current, parts[i], true);
                }
            }
            return current;
        },
        capitalize: function (s, cache) {
            return s.charAt(0).toUpperCase() + s.slice(1);
        },
        camelize: function (str) {
            return convertBadValues(str).replace(strHyphenMatch, function (match, chr) {
                return chr ? chr.toUpperCase() : '';
            });
        },
        hyphenate: function (str) {
            return convertBadValues(str).replace(strCamelMatch, function (str, offset) {
                return str.charAt(0) + '-' + str.charAt(1).toLowerCase();
            });
        },
        underscore: function (s) {
            return s.replace(strColons, '/').replace(strWords, '$1_$2').replace(strLowUp, '$1_$2').replace(strDash, '_').toLowerCase();
        },
        sub: function (str, data, remove) {
            var obs = [];
            str = str || '';
            obs.push(str.replace(strReplacer, function (whole, inside) {
                var ob = string.getObject(inside, data, remove === true ? false : undefined);
                if (ob === undefined || ob === null) {
                    obs = null;
                    return '';
                }
                if (isContainer(ob) && obs) {
                    obs.push(ob);
                    return '';
                }
                return '' + ob;
            }));
            return obs === null ? obs : obs.length <= 1 ? obs[0] : obs;
        },
        replacer: strReplacer,
        undHash: strUndHash
    };
    module.exports = string;
});
/*can-util@3.0.0-pre.22#js/is-empty-object/is-empty-object*/
define('can-util/js/is-empty-object/is-empty-object', function (require, exports, module) {
    module.exports = function (obj) {
        for (var prop in obj) {
            return false;
        }
        return true;
    };
});
/*can-util@3.0.0-pre.22#dom/data/data*/
define('can-util/dom/data/data', function (require, exports, module) {
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    var data = {};
    var expando = 'can' + new Date();
    var uuid = 0;
    var setData = function (name, value) {
        var id = this[expando] || (this[expando] = ++uuid), store = data[id] || (data[id] = {});
        if (name !== undefined) {
            store[name] = value;
        }
        return store;
    };
    module.exports = {
        getCid: function () {
            return this[expando];
        },
        cid: function () {
            return this[expando] || (this[expando] = ++uuid);
        },
        expando: expando,
        clean: function (prop) {
            var id = this[expando];
            delete data[id][prop];
            if (isEmptyObject(data[id])) {
                delete data[id];
            }
        },
        get: function (name) {
            var id = this[expando], store = id && data[id];
            return name === undefined ? store || setData(this) : store && store[name];
        },
        set: setData
    };
});
/*can-util@3.0.0-pre.22#dom/class-name/class-name*/
define('can-util/dom/class-name/class-name', function (require, exports, module) {
    var has = function (className) {
        if (this.classList) {
            return this.classList.contains(className);
        } else {
            return !!this.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
        }
    };
    module.exports = {
        has: has,
        add: function (className) {
            if (this.classList) {
                this.classList.add(className);
            } else if (!has.call(this, className)) {
                this.className += ' ' + className;
            }
        },
        remove: function (className) {
            if (this.classList) {
                this.classList.remove(className);
            } else if (has.call(this, className)) {
                var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
                this.className = this.className.replace(reg, ' ');
            }
        }
    };
});
/*can-util@3.0.0-pre.22#dom/events/events*/
define('can-util/dom/events/events', function (require, exports, module) {
    module.exports = {
        addEventListener: function () {
            this.addEventListener.apply(this, arguments);
        },
        removeEventListener: function () {
            this.removeEventListener.apply(this, arguments);
        },
        canAddEventListener: function () {
            return this.nodeName && (this.nodeType === 1 || this.nodeType === 9) || this === window;
        }
    };
});
/*can-util@3.0.0-pre.22#js/cid/cid*/
define('can-util/js/cid/cid', function (require, exports, module) {
    var cid = 0;
    module.exports = function (object, name) {
        if (!object._cid) {
            cid++;
            object._cid = (name || '') + cid;
        }
        return object._cid;
    };
});
/*can-util@3.0.0-pre.22#js/global/global*/
define('can-util/js/global/global', function (require, exports, module) {
    module.exports = function () {
        return typeof window !== 'undefined' ? window : typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope ? self : global;
    };
});
/*can-util@3.0.0-pre.22#dom/document/document*/
define('can-util/dom/document/document', function (require, exports, module) {
    var global = require('can-util/js/global/global');
    var setDocument;
    module.exports = function (setDoc) {
        if (setDoc) {
            setDocument = setDoc;
        }
        return setDocument || global().document;
    };
});
/*can-util@3.0.0-pre.22#dom/dispatch/dispatch*/
define('can-util/dom/dispatch/dispatch', function (require, exports, module) {
    var assign = require('can-util/js/assign/assign');
    var _document = require('can-util/dom/document/document');
    module.exports = function (event, args, bubbles) {
        var doc = _document();
        var ev = doc.createEvent('HTMLEvents');
        var isString = typeof event === 'string';
        ev.initEvent(isString ? event : event.type, bubbles === undefined ? true : bubbles, false);
        if (!isString) {
            assign(ev, event);
        }
        ev.args = args;
        return this.dispatchEvent(ev);
    };
});
/*can-util@3.0.0-pre.22#dom/matches/matches*/
define('can-util/dom/matches/matches', function (require, exports, module) {
    var matchesMethod = function (element) {
        return element.matches || element.webkitMatchesSelector || element.webkitMatchesSelector || element.mozMatchesSelector || element.msMatchesSelector || element.oMatchesSelector;
    };
    module.exports = function () {
        return matchesMethod(this).apply(this, arguments);
    };
});
/*can-util@3.0.0-pre.22#dom/events/delegate/delegate*/
define('can-util/dom/events/delegate/delegate', function (require, exports, module) {
    var domEvents = require('can-util/dom/events/events');
    var domData = require('can-util/dom/data/data');
    var domMatches = require('can-util/dom/matches/matches');
    var each = require('can-util/js/each/each');
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    var dataName = 'delegateEvents';
    var handleEvent = function (ev) {
        var events = domData.get.call(this, dataName);
        var eventTypeEvents = events[ev.type];
        var matches = [];
        if (eventTypeEvents) {
            var selectorDelegates = [];
            each(eventTypeEvents, function (delegates) {
                selectorDelegates.push(delegates);
            });
            var cur = ev.target;
            do {
                selectorDelegates.forEach(function (delegates) {
                    if (domMatches.call(cur, delegates[0].selector)) {
                        matches.push({
                            target: cur,
                            delegates: delegates
                        });
                    }
                });
                cur = cur.parentNode;
            } while (cur && cur !== ev.currentTarget);
        }
        var oldStopProp = ev.stopPropagation;
        ev.stopPropagation = function () {
            oldStopProp.apply(this, arguments);
            this.cancelBubble = true;
        };
        for (var i = 0; i < matches.length; i++) {
            var match = matches[i];
            var delegates = match.delegates;
            for (var d = 0, dLen = delegates.length; d < dLen; d++) {
                if (delegates[d].handler.call(match.target, ev) === false) {
                    return false;
                }
                if (ev.cancelBubble) {
                    return;
                }
            }
        }
    };
    domEvents.addDelegateListener = function (eventType, selector, handler) {
        var events = domData.get.call(this, dataName), eventTypeEvents;
        if (!events) {
            domData.set.call(this, dataName, events = {});
        }
        if (!(eventTypeEvents = events[eventType])) {
            eventTypeEvents = events[eventType] = {};
            domEvents.addEventListener.call(this, eventType, handleEvent, false);
        }
        if (!eventTypeEvents[selector]) {
            eventTypeEvents[selector] = [];
        }
        eventTypeEvents[selector].push({
            handler: handler,
            selector: selector
        });
    };
    domEvents.removeDelegateListener = function (eventType, selector, handler) {
        var events = domData.get.call(this, dataName);
        if (events[eventType] && events[eventType][selector]) {
            var eventTypeEvents = events[eventType], delegates = eventTypeEvents[selector], i = 0;
            while (i < delegates.length) {
                if (delegates[i].handler === handler) {
                    delegates.splice(i, 1);
                } else {
                    i++;
                }
            }
            if (delegates.length === 0) {
                delete eventTypeEvents[selector];
                if (isEmptyObject(eventTypeEvents)) {
                    domEvents.removeEventListener.call(this, eventType, handleEvent, false);
                    delete events[eventType];
                    if (isEmptyObject(events)) {
                        domData.clean.call(this, dataName);
                    }
                }
            }
        }
    };
});
/*can-event@3.0.0-pre.4#can-event*/
define('can-event', function (require, exports, module) {
    var domEvents = require('can-util/dom/events/events');
    var CID = require('can-util/js/cid/cid');
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    var domDispatch = require('can-util/dom/dispatch/dispatch');
    var namespace = require('can-util/namespace');
    require('can-util/dom/events/delegate/delegate');
    var canEvent = {
        addEventListener: function (event, handler) {
            var allEvents = this.__bindEvents || (this.__bindEvents = {}), eventList = allEvents[event] || (allEvents[event] = []);
            eventList.push({
                handler: handler,
                name: event
            });
            return this;
        },
        removeEventListener: function (event, fn, __validate) {
            if (!this.__bindEvents) {
                return this;
            }
            var events = this.__bindEvents[event] || [], i = 0, ev, isFunction = typeof fn === 'function';
            while (i < events.length) {
                ev = events[i];
                if (__validate ? __validate(ev, event, fn) : isFunction && ev.handler === fn || !isFunction && (ev.cid === fn || !fn)) {
                    events.splice(i, 1);
                } else {
                    i++;
                }
            }
            return this;
        },
        dispatch: function (event, args) {
            var events = this.__bindEvents;
            if (!events) {
                return;
            }
            var eventName;
            if (typeof event === 'string') {
                eventName = event;
                event = { type: event };
            } else {
                eventName = event.type;
            }
            var handlers = events[eventName];
            if (!handlers) {
                return;
            } else {
                handlers = handlers.slice(0);
            }
            var passed = [event];
            if (args) {
                passed.push.apply(passed, args);
            }
            for (var i = 0, len = handlers.length; i < len; i++) {
                handlers[i].handler.apply(this, passed);
            }
            return event;
        },
        on: function (eventName, selector, handler) {
            var method = typeof selector === 'string' ? 'addDelegateListener' : 'addEventListener';
            var listenWithDOM = domEvents.canAddEventListener.call(this);
            var eventBinder = listenWithDOM ? domEvents[method] : this[method] || canEvent[method];
            return eventBinder.apply(this, arguments);
        },
        off: function (eventName, selector, handler) {
            var method = typeof selector === 'string' ? 'removeDelegateListener' : 'removeEventListener';
            var listenWithDOM = domEvents.canAddEventListener.call(this);
            var eventBinder = listenWithDOM ? domEvents[method] : this[method] || canEvent[method];
            return eventBinder.apply(this, arguments);
        },
        trigger: function () {
            var listenWithDOM = domEvents.canAddEventListener.call(this);
            var dispatch = listenWithDOM ? domDispatch : canEvent.dispatch;
            return dispatch.apply(this, arguments);
        },
        one: function (event, handler) {
            var one = function () {
                canEvent.off.call(this, event, one);
                return handler.apply(this, arguments);
            };
            canEvent.on.call(this, event, one);
            return this;
        },
        listenTo: function (other, event, handler) {
            var idedEvents = this.__listenToEvents;
            if (!idedEvents) {
                idedEvents = this.__listenToEvents = {};
            }
            var otherId = CID(other);
            var othersEvents = idedEvents[otherId];
            if (!othersEvents) {
                othersEvents = idedEvents[otherId] = {
                    obj: other,
                    events: {}
                };
            }
            var eventsEvents = othersEvents.events[event];
            if (!eventsEvents) {
                eventsEvents = othersEvents.events[event] = [];
            }
            eventsEvents.push(handler);
            canEvent.on.call(other, event, handler);
        },
        stopListening: function (other, event, handler) {
            var idedEvents = this.__listenToEvents, iterIdedEvents = idedEvents, i = 0;
            if (!idedEvents) {
                return this;
            }
            if (other) {
                var othercid = CID(other);
                (iterIdedEvents = {})[othercid] = idedEvents[othercid];
                if (!idedEvents[othercid]) {
                    return this;
                }
            }
            for (var cid in iterIdedEvents) {
                var othersEvents = iterIdedEvents[cid], eventsEvents;
                other = idedEvents[cid].obj;
                if (!event) {
                    eventsEvents = othersEvents.events;
                } else {
                    (eventsEvents = {})[event] = othersEvents.events[event];
                }
                for (var eventName in eventsEvents) {
                    var handlers = eventsEvents[eventName] || [];
                    i = 0;
                    while (i < handlers.length) {
                        if (handler && handler === handlers[i] || !handler) {
                            canEvent.off.call(other, eventName, handlers[i]);
                            handlers.splice(i, 1);
                        } else {
                            i++;
                        }
                    }
                    if (!handlers.length) {
                        delete othersEvents.events[eventName];
                    }
                }
                if (isEmptyObject(othersEvents.events)) {
                    delete idedEvents[cid];
                }
            }
            return this;
        }
    };
    canEvent.bind = canEvent.addEventListener;
    canEvent.addEvent = canEvent.addEventListener;
    canEvent.unbind = canEvent.removeEventListener;
    canEvent.removeEvent = canEvent.removeEventListener;
    canEvent.delegate = canEvent.on;
    canEvent.undelegate = canEvent.off;
    module.exports = namespace.event = canEvent;
});
/*can-control@3.0.0-pre.3#can-control*/
define('can-control', function (require, exports, module) {
    var Construct = require('can-construct');
    var namespace = require('can-util/namespace');
    var string = require('can-util/js/string/string');
    var assign = require('can-util/js/assign/assign');
    var isFunction = require('can-util/js/is-function/is-function');
    var isArray = require('can-util/js/is-array/is-array');
    var each = require('can-util/js/each/each');
    var dev = require('can-util/js/dev/dev');
    var domData = require('can-util/dom/data/data');
    var className = require('can-util/dom/class-name/class-name');
    var domEvents = require('can-util/dom/events/events');
    var canEvent = require('can-event');
    var processors;
    require('can-util/dom/dispatch/dispatch');
    require('can-util/dom/events/delegate/delegate');
    var bind = function (el, ev, callback) {
            canEvent.on.call(el, ev, callback);
            return function () {
                canEvent.off.call(el, ev, callback);
            };
        }, slice = [].slice, paramReplacer = /\{([^\}]+)\}/g, delegate = function (el, selector, ev, callback) {
            canEvent.on.call(el, ev, selector, callback);
            return function () {
                canEvent.off.call(el, ev, selector, callback);
            };
        }, binder = function (el, ev, callback, selector) {
            return selector ? delegate(el, selector.trim(), ev, callback) : bind(el, ev, callback);
        }, basicProcessor;
    var Control = Construct.extend({
        setup: function () {
            Construct.setup.apply(this, arguments);
            if (Control) {
                var control = this, funcName;
                control.actions = {};
                for (funcName in control.prototype) {
                    if (control._isAction(funcName)) {
                        control.actions[funcName] = control._action(funcName);
                    }
                }
            }
        },
        _shifter: function (context, name) {
            var method = typeof name === 'string' ? context[name] : name;
            if (!isFunction(method)) {
                method = context[method];
            }
            return function () {
                context.called = name;
                return method.apply(context, [this].concat(slice.call(arguments, 0)));
            };
        },
        _isAction: function (methodName) {
            var val = this.prototype[methodName], type = typeof val;
            return methodName !== 'constructor' && (type === 'function' || type === 'string' && isFunction(this.prototype[val])) && !!(Control.isSpecial(methodName) || processors[methodName] || /[^\w]/.test(methodName));
        },
        _action: function (methodName, options) {
            paramReplacer.lastIndex = 0;
            if (options || !paramReplacer.test(methodName)) {
                var convertedName = options ? string.sub(methodName, this._lookup(options)) : methodName;
                if (!convertedName) {
                    return null;
                }
                var arr = isArray(convertedName), name = arr ? convertedName[1] : convertedName, parts = name.split(/\s+/g), event = parts.pop();
                return {
                    processor: processors[event] || basicProcessor,
                    parts: [
                        name,
                        parts.join(' '),
                        event
                    ],
                    delegate: arr ? convertedName[0] : undefined
                };
            }
        },
        _lookup: function (options) {
            return [
                options,
                window
            ];
        },
        processors: {},
        defaults: {},
        convertElement: function (element) {
            return typeof element === 'string' ? document.querySelector(element) : element;
        },
        isSpecial: function (eventName) {
            return eventName === 'inserted' || eventName === 'removed';
        }
    }, {
        setup: function (element, options) {
            var cls = this.constructor, pluginname = cls.pluginName || cls.shortName, arr;
            this.element = cls.convertElement(element);
            if (pluginname && pluginname !== 'can_control') {
                className.add.call(element, pluginname);
            }
            arr = domData.get.call(this.element, 'controls');
            if (!arr) {
                arr = [];
                domData.set.call(this.element, 'controls', arr);
            }
            arr.push(this);
            this.options = assign(assign({}, cls.defaults), options);
            this.on();
            return [
                this.element,
                this.options
            ];
        },
        on: function (el, selector, eventName, func) {
            if (!el) {
                this.off();
                var cls = this.constructor, bindings = this._bindings, actions = cls.actions, element = this.element, destroyCB = Control._shifter(this, 'destroy'), funcName, ready;
                for (funcName in actions) {
                    if (actions.hasOwnProperty(funcName)) {
                        ready = actions[funcName] || cls._action(funcName, this.options, this);
                        if (ready) {
                            bindings.control[funcName] = ready.processor(ready.delegate || element, ready.parts[2], ready.parts[1], funcName, this);
                        }
                    }
                }
                domEvents.addEventListener.call(element, 'removed', destroyCB);
                bindings.user.push(function (el) {
                    domEvents.removeEventListener.call(el, 'removed', destroyCB);
                });
                return bindings.user.length;
            }
            if (typeof el === 'string') {
                func = eventName;
                eventName = selector;
                selector = el;
                el = this.element;
            }
            if (func === undefined) {
                func = eventName;
                eventName = selector;
                selector = null;
            }
            if (typeof func === 'string') {
                func = Control._shifter(this, func);
            }
            this._bindings.user.push(binder(el, eventName, func, selector));
            return this._bindings.user.length;
        },
        off: function () {
            var el = this.element[0], bindings = this._bindings;
            if (bindings) {
                each(bindings.user || [], function (value) {
                    value(el);
                });
                each(bindings.control || {}, function (value) {
                    value(el);
                });
            }
            this._bindings = {
                user: [],
                control: {}
            };
        },
        destroy: function () {
            if (this.element === null) {
                return;
            }
            var Class = this.constructor, pluginName = Class.pluginName || Class.shortName && string.underscore(Class.shortName), controls;
            this.off();
            if (pluginName && pluginName !== 'can_control') {
                className.remove.call(this.element, pluginName);
            }
            controls = domData.get.call(this.element, 'controls');
            controls.splice(controls.indexOf(this), 1);
            canEvent.dispatch.call(this, 'destroyed');
            this.element = null;
        }
    });
    processors = Control.processors;
    basicProcessor = function (el, event, selector, methodName, control) {
        return binder(el, event, Control._shifter(control, methodName), selector);
    };
    each([
        'change',
        'click',
        'contextmenu',
        'dblclick',
        'keydown',
        'keyup',
        'keypress',
        'mousedown',
        'mousemove',
        'mouseout',
        'mouseover',
        'mouseup',
        'reset',
        'resize',
        'scroll',
        'select',
        'submit',
        'focusin',
        'focusout',
        'mouseenter',
        'mouseleave',
        'touchstart',
        'touchmove',
        'touchcancel',
        'touchend',
        'touchleave',
        'inserted',
        'removed',
        'dragstart',
        'dragenter',
        'dragover',
        'dragleave',
        'drag',
        'drop',
        'dragend'
    ], function (v) {
        processors[v] = basicProcessor;
    });
    module.exports = namespace.Control = Control;
});
/*can-util@3.0.0-pre.22#js/last/last*/
define('can-util/js/last/last', function (require, exports, module) {
    module.exports = function (arr) {
        return arr && arr[arr.length - 1];
    };
});
/*can-event@3.0.0-pre.4#batch/batch*/
define('can-event/batch/batch', function (require, exports, module) {
    var canEvent = require('can-event');
    var last = require('can-util/js/last/last');
    var namespace = require('can-util/namespace');
    var batchNum = 1, transactions = 0, dispatchingBatch = null, collectingBatch = null, batches = [], dispatchingBatches = false;
    var canBatch = {
        start: function (batchStopHandler) {
            transactions++;
            if (transactions === 1) {
                var batch = {
                    events: [],
                    callbacks: [],
                    number: batchNum++
                };
                batches.push(batch);
                if (batchStopHandler) {
                    batch.callbacks.push(batchStopHandler);
                }
                collectingBatch = batch;
            }
        },
        stop: function (force, callStart) {
            if (force) {
                transactions = 0;
            } else {
                transactions--;
            }
            if (transactions === 0) {
                collectingBatch = null;
                var batch;
                if (dispatchingBatches === false) {
                    dispatchingBatches = true;
                    while (batch = batches.shift()) {
                        var events = batch.events;
                        var callbacks = batch.callbacks;
                        dispatchingBatch = batch;
                        canBatch.batchNum = batch.number;
                        var i, len;
                        if (callStart) {
                            canBatch.start();
                        }
                        for (i = 0, len = events.length; i < len; i++) {
                            canEvent.dispatch.apply(events[i][0], events[i][1]);
                        }
                        canBatch._onDispatchedEvents(batch.number);
                        for (i = 0; i < callbacks.length; i++) {
                            callbacks[i]();
                        }
                        dispatchingBatch = null;
                        canBatch.batchNum = undefined;
                    }
                    dispatchingBatches = false;
                }
            }
        },
        _onDispatchedEvents: function () {
        },
        trigger: function (event, args) {
            var item = this;
            if (!item.__inSetup) {
                event = typeof event === 'string' ? { type: event } : event;
                if (collectingBatch) {
                    event.batchNum = collectingBatch.number;
                    collectingBatch.events.push([
                        item,
                        [
                            event,
                            args
                        ]
                    ]);
                } else if (event.batchNum) {
                    canEvent.dispatch.call(item, event, args);
                } else if (batches.length) {
                    canBatch.start();
                    event.batchNum = collectingBatch.number;
                    collectingBatch.events.push([
                        item,
                        [
                            event,
                            args
                        ]
                    ]);
                    canBatch.stop();
                } else {
                    canEvent.dispatch.call(item, event, args);
                }
            }
        },
        afterPreviousEvents: function (handler) {
            var batch = last(batches);
            if (batch) {
                var obj = {};
                canEvent.addEvent.call(obj, 'ready', handler);
                batch.events.push([
                    obj,
                    [
                        { type: 'ready' },
                        []
                    ]
                ]);
            } else {
                handler({});
            }
        },
        after: function (handler) {
            var batch = collectingBatch || dispatchingBatch;
            if (batch) {
                batch.callbacks.push(handler);
            } else {
                handler({});
            }
        }
    };
    module.exports = namespace.batch = canBatch;
});
/*can-observe-info@3.0.0#can-observe-info*/
define('can-observe-info', function (require, exports, module) {
    require('can-event');
    var canBatch = require('can-event/batch/batch');
    var assign = require('can-util/js/assign/assign');
    var namespace = require('can-util/namespace');
    function ObservedInfo(func, context, compute) {
        this.newObserved = {};
        this.oldObserved = null;
        this.func = func;
        this.context = context;
        this.compute = compute.updater ? compute : { updater: compute };
        this.onDependencyChange = this.onDependencyChange.bind(this);
        this.depth = null;
        this.childDepths = {};
        this.ignore = 0;
        this.inBatch = false;
        this.ready = false;
        compute.observedInfo = this;
        this.setReady = this._setReady.bind(this);
    }
    var observedInfoStack = [];
    assign(ObservedInfo.prototype, {
        getPrimaryDepth: function () {
            return this.compute._primaryDepth || 0;
        },
        _setReady: function () {
            this.ready = true;
        },
        getDepth: function () {
            if (this.depth !== null) {
                return this.depth;
            } else {
                return this.depth = this._getDepth();
            }
        },
        _getDepth: function () {
            var max = 0, childDepths = this.childDepths;
            for (var cid in childDepths) {
                if (childDepths[cid] > max) {
                    max = childDepths[cid];
                }
            }
            return max + 1;
        },
        addEdge: function (objEv) {
            objEv.obj.addEventListener(objEv.event, this.onDependencyChange);
            if (objEv.obj.observedInfo) {
                this.childDepths[objEv.obj._cid] = objEv.obj.observedInfo.getDepth();
                this.depth = null;
            }
        },
        removeEdge: function (objEv) {
            objEv.obj.removeEventListener(objEv.event, this.onDependencyChange);
            if (objEv.obj.observedInfo) {
                delete this.childDepths[objEv.obj._cid];
                this.depth = null;
            }
        },
        dependencyChange: function (ev) {
            if (this.bound && this.ready) {
                if (ev.batchNum !== undefined) {
                    if (ev.batchNum !== this.batchNum) {
                        ObservedInfo.registerUpdate(this);
                        this.batchNum = ev.batchNum;
                    }
                } else {
                    this.updateCompute(ev.batchNum);
                }
            }
        },
        onDependencyChange: function (ev, newVal, oldVal) {
            this.dependencyChange(ev, newVal, oldVal);
        },
        updateCompute: function (batchNum) {
            if (this.bound) {
                var oldValue = this.value;
                this.getValueAndBind();
                this.compute.updater(this.value, oldValue, batchNum);
            }
        },
        getValueAndBind: function () {
            this.bound = true;
            this.oldObserved = this.newObserved || {};
            this.ignore = 0;
            this.newObserved = {};
            this.ready = false;
            observedInfoStack.push(this);
            this.value = this.func.call(this.context);
            observedInfoStack.pop();
            this.updateBindings();
            canBatch.afterPreviousEvents(this.setReady);
        },
        updateBindings: function () {
            var newObserved = this.newObserved, oldObserved = this.oldObserved, name, obEv;
            for (name in newObserved) {
                obEv = newObserved[name];
                if (!oldObserved[name]) {
                    this.addEdge(obEv);
                } else {
                    oldObserved[name] = null;
                }
            }
            for (name in oldObserved) {
                obEv = oldObserved[name];
                if (obEv) {
                    this.removeEdge(obEv);
                }
            }
        },
        teardown: function () {
            this.bound = false;
            for (var name in this.newObserved) {
                var ob = this.newObserved[name];
                this.removeEdge(ob);
            }
            this.newObserved = {};
        }
    });
    var updateOrder = [], curPrimaryDepth = Infinity, maxPrimaryDepth = 0;
    ObservedInfo.registerUpdate = function (observeInfo, batchNum) {
        var depth = observeInfo.getDepth() - 1;
        var primaryDepth = observeInfo.getPrimaryDepth();
        curPrimaryDepth = Math.min(primaryDepth, curPrimaryDepth);
        maxPrimaryDepth = Math.max(primaryDepth, maxPrimaryDepth);
        var primary = updateOrder[primaryDepth] || (updateOrder[primaryDepth] = {
            observeInfos: [],
            current: Infinity,
            max: 0
        });
        var objs = primary.observeInfos[depth] || (primary.observeInfos[depth] = []);
        objs.push(observeInfo);
        primary.current = Math.min(depth, primary.current);
        primary.max = Math.max(depth, primary.max);
    };
    ObservedInfo.batchEnd = function (batchNum) {
        var cur;
        while (true) {
            if (curPrimaryDepth <= maxPrimaryDepth) {
                var primary = updateOrder[curPrimaryDepth];
                if (primary && primary.current <= primary.max) {
                    var last = primary.observeInfos[primary.current];
                    if (last && (cur = last.pop())) {
                        cur.updateCompute(batchNum);
                    } else {
                        primary.current++;
                    }
                } else {
                    curPrimaryDepth++;
                }
            } else {
                updateOrder = [];
                curPrimaryDepth = Infinity;
                maxPrimaryDepth = 0;
                return;
            }
        }
    };
    ObservedInfo.observe = function (obj, event) {
        var top = observedInfoStack[observedInfoStack.length - 1];
        if (top && !top.ignore) {
            var evStr = event + '', name = obj._cid + '|' + evStr;
            if (top.traps) {
                top.traps.push({
                    obj: obj,
                    event: evStr,
                    name: name
                });
            } else if (!top.newObserved[name]) {
                top.newObserved[name] = {
                    obj: obj,
                    event: evStr
                };
            }
        }
    };
    ObservedInfo.trap = function () {
        if (observedInfoStack.length) {
            var top = observedInfoStack[observedInfoStack.length - 1];
            var oldTraps = top.traps;
            var traps = top.traps = [];
            return function () {
                top.traps = oldTraps;
                return traps;
            };
        } else {
            return function () {
                return [];
            };
        }
    };
    ObservedInfo.trapsCount = function () {
        if (observedInfoStack.length) {
            var top = observedInfoStack[observedInfoStack.length - 1];
            return top.traps.length;
        } else {
            return 0;
        }
    };
    ObservedInfo.observes = function (observes) {
        var top = observedInfoStack[observedInfoStack.length - 1];
        if (top) {
            if (top.traps) {
                top.traps.push.apply(top.traps, observes);
            } else {
                for (var i = 0, len = observes.length; i < len; i++) {
                    var trap = observes[i], name = trap.name;
                    if (!top.newObserved[name]) {
                        top.newObserved[name] = trap;
                    }
                }
            }
        }
    };
    ObservedInfo.isRecording = function () {
        var len = observedInfoStack.length;
        return len && observedInfoStack[len - 1].ignore === 0;
    };
    ObservedInfo.notObserve = function (fn) {
        return function () {
            if (observedInfoStack.length) {
                var top = observedInfoStack[observedInfoStack.length - 1];
                top.ignore++;
                var res = fn.apply(this, arguments);
                top.ignore--;
                return res;
            } else {
                return fn.apply(this, arguments);
            }
        };
    };
    canBatch._onDispatchedEvents = ObservedInfo.batchEnd;
    module.exports = namespace.ObservedInfo = ObservedInfo;
});
/*can-event@3.0.0-pre.4#lifecycle/lifecycle*/
define('can-event/lifecycle/lifecycle', function (require, exports, module) {
    var canEvent = require('can-event');
    module.exports = {
        addAndSetup: function () {
            canEvent.addEventListener.apply(this, arguments);
            if (!this.__inSetup) {
                if (!this._bindings) {
                    this._bindings = 1;
                    if (this._eventSetup) {
                        this._eventSetup();
                    }
                } else {
                    this._bindings++;
                }
            }
            return this;
        },
        removeAndTeardown: function (event, handler) {
            if (!this.__bindEvents) {
                return this;
            }
            var handlers = this.__bindEvents[event] || [];
            var handlerCount = handlers.length;
            canEvent.removeEventListener.apply(this, arguments);
            if (this._bindings === null) {
                this._bindings = 0;
            } else {
                this._bindings = this._bindings - (handlerCount - handlers.length);
            }
            if (!this._bindings && this._eventTeardown) {
                this._eventTeardown();
            }
            return this;
        }
    };
});
/*can-compute@3.0.0-pre.4#proto-compute*/
define('can-compute/proto-compute', function (require, exports, module) {
    var ObserveInfo = require('can-observe-info');
    var canEvent = require('can-event');
    var eventLifecycle = require('can-event/lifecycle/lifecycle');
    var canBatch = require('can-event/batch/batch');
    var CID = require('can-util/js/cid/cid');
    var assign = require('can-util/js/assign/assign');
    var types = require('can-util/js/types/types');
    var string = require('can-util/js/string/string');
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    var Compute = function (getterSetter, context, eventName, bindOnce) {
        CID(this, 'compute');
        var args = [];
        for (var i = 0, arglen = arguments.length; i < arglen; i++) {
            args[i] = arguments[i];
        }
        var contextType = typeof args[1];
        if (typeof args[0] === 'function') {
            this._setupGetterSetterFn(args[0], args[1], args[2], args[3]);
        } else if (args[1]) {
            if (contextType === 'string') {
                this._setupProperty(args[0], args[1], args[2]);
            } else if (contextType === 'function') {
                this._setupSetter(args[0], args[1], args[2]);
            } else {
                if (args[1] && args[1].fn) {
                    this._setupAsyncCompute(args[0], args[1]);
                } else {
                    this._setupSettings(args[0], args[1]);
                }
            }
        } else {
            this._setupSimpleValue(args[0]);
        }
        this._args = args;
        this._primaryDepth = 0;
        this.isComputed = true;
    };
    var updateOnChange = function (compute, newValue, oldValue, batchNum) {
        var valueChanged = newValue !== oldValue && !(newValue !== newValue && oldValue !== oldValue);
        if (valueChanged) {
            canBatch.trigger.call(compute, {
                type: 'change',
                batchNum: batchNum
            }, [
                newValue,
                oldValue
            ]);
        }
    };
    var setupComputeHandlers = function (compute, func, context) {
        var readInfo = new ObserveInfo(func, context, compute);
        return {
            _on: function () {
                readInfo.getValueAndBind();
                compute.value = readInfo.value;
                compute.hasDependencies = !isEmptyObject(readInfo.newObserved);
            },
            _off: function () {
                readInfo.teardown();
            },
            getDepth: function () {
                return readInfo.getDepth();
            }
        };
    };
    assign(Compute.prototype, {
        setPrimaryDepth: function (depth) {
            this._primaryDepth = depth;
        },
        _setupGetterSetterFn: function (getterSetter, context, eventName) {
            this._set = context ? getterSetter.bind(context) : getterSetter;
            this._get = context ? getterSetter.bind(context) : getterSetter;
            this._canObserve = eventName === false ? false : true;
            var handlers = setupComputeHandlers(this, getterSetter, context || this);
            assign(this, handlers);
        },
        _setupProperty: function (target, propertyName, eventName) {
            var isObserve = types.isMapLike(target), self = this, handler;
            if (isObserve) {
                handler = function (ev, newVal, oldVal) {
                    self.updater(newVal, oldVal, ev.batchNum);
                };
                this.hasDependencies = true;
                this._get = function () {
                    return target.attr(propertyName);
                };
                this._set = function (val) {
                    target.attr(propertyName, val);
                };
            } else {
                handler = function () {
                    self.updater(self._get(), self.value);
                };
                this._get = function () {
                    return string.getObject(propertyName, [target]);
                };
                this._set = function (value) {
                    var properties = propertyName.split('.'), leafPropertyName = properties.pop(), targetProperty = string.getObject(properties.join('.'), [target]);
                    targetProperty[leafPropertyName] = value;
                };
            }
            this._on = function (update) {
                canEvent.addEventListener.call(target, eventName || propertyName, handler);
                this.value = this._get();
            };
            this._off = function () {
                return canEvent.removeEventListener.call(target, eventName || propertyName, handler);
            };
        },
        _setupSetter: function (initialValue, setter, eventName) {
            this.value = initialValue;
            this._set = setter;
            assign(this, eventName);
        },
        _setupSettings: function (initialValue, settings) {
            this.value = initialValue;
            this._set = settings.set || this._set;
            this._get = settings.get || this._get;
            if (!settings.__selfUpdater) {
                var self = this, oldUpdater = this.updater;
                this.updater = function () {
                    oldUpdater.call(self, self._get(), self.value);
                };
            }
            this._on = settings.on ? settings.on : this._on;
            this._off = settings.off ? settings.off : this._off;
        },
        _setupAsyncCompute: function (initialValue, settings) {
            var self = this;
            var getter = settings.fn;
            var bindings;
            this.value = initialValue;
            this._setUpdates = true;
            this.lastSetValue = new Compute(initialValue);
            this._set = function (newVal) {
                if (newVal === self.lastSetValue.get()) {
                    return this.value;
                }
                return self.lastSetValue.set(newVal);
            };
            this._get = function () {
                return getter.call(settings.context, self.lastSetValue.get());
            };
            if (getter.length === 0) {
                bindings = setupComputeHandlers(this, getter, settings.context);
            } else if (getter.length === 1) {
                bindings = setupComputeHandlers(this, function () {
                    return getter.call(settings.context, self.lastSetValue.get());
                }, settings);
            } else {
                var oldUpdater = this.updater, setValue = function (newVal) {
                        oldUpdater.call(self, newVal, self.value);
                    };
                this.updater = function (newVal) {
                    oldUpdater.call(self, newVal, self.value);
                };
                bindings = setupComputeHandlers(this, function () {
                    var res = getter.call(settings.context, self.lastSetValue.get(), setValue);
                    return res !== undefined ? res : this.value;
                }, this);
            }
            assign(this, bindings);
        },
        _setupSimpleValue: function (initialValue) {
            this.value = initialValue;
        },
        _eventSetup: ObserveInfo.notObserve(function () {
            this.bound = true;
            this._on(this.updater);
        }),
        _eventTeardown: function () {
            this._off(this.updater);
            this.bound = false;
        },
        addEventListener: eventLifecycle.addAndSetup,
        removeEventListener: eventLifecycle.removeAndTeardown,
        clone: function (context) {
            if (context && typeof this._args[0] === 'function') {
                this._args[1] = context;
            } else if (context) {
                this._args[2] = context;
            }
            return new Compute(this._args[0], this._args[1], this._args[2], this._args[3]);
        },
        _on: function () {
        },
        _off: function () {
        },
        get: function () {
            if (ObserveInfo.isRecording() && this._canObserve !== false) {
                ObserveInfo.observe(this, 'change');
                if (!this.bound) {
                    Compute.temporarilyBind(this);
                }
            }
            if (this.bound) {
                return this.value;
            } else {
                return this._get();
            }
        },
        _get: function () {
            return this.value;
        },
        set: function (newVal) {
            var old = this.value;
            var setVal = this._set(newVal, old);
            if (this._setUpdates) {
                return this.value;
            }
            if (this.hasDependencies) {
                return this._get();
            }
            if (setVal === undefined) {
                this.value = this._get();
            } else {
                this.value = setVal;
            }
            updateOnChange(this, this.value, old);
            return this.value;
        },
        _set: function (newVal) {
            return this.value = newVal;
        },
        updater: function (newVal, oldVal, batchNum) {
            this.value = newVal;
            updateOnChange(this, newVal, oldVal, batchNum);
        },
        toFunction: function () {
            return this._computeFn.bind(this);
        },
        _computeFn: function (newVal) {
            if (arguments.length) {
                return this.set(newVal);
            }
            return this.get();
        }
    });
    Compute.prototype.on = Compute.prototype.bind = Compute.prototype.addEventListener;
    Compute.prototype.off = Compute.prototype.unbind = Compute.prototype.removeEventListener;
    var k = function () {
    };
    var computes;
    var unbindComputes = function () {
        for (var i = 0, len = computes.length; i < len; i++) {
            computes[i].removeEventListener('change', k);
        }
        computes = null;
    };
    Compute.temporarilyBind = function (compute) {
        var computeInstance = compute.computeInstance || compute;
        computeInstance.addEventListener('change', k);
        if (!computes) {
            computes = [];
            setTimeout(unbindComputes, 10);
        }
        computes.push(computeInstance);
    };
    Compute.async = function (initialValue, asyncComputer, context) {
        return new Compute(initialValue, {
            fn: asyncComputer,
            context: context
        });
    };
    Compute.truthy = function (compute) {
        return new Compute(function () {
            var res = compute.get();
            if (typeof res === 'function') {
                res = res.get();
            }
            return !!res;
        });
    };
    module.exports = exports = Compute;
});
/*can-compute@3.0.0-pre.4#can-compute*/
define('can-compute', function (require, exports, module) {
    require('can-event');
    require('can-event/batch/batch');
    var Compute = require('can-compute/proto-compute');
    var CID = require('can-util/js/cid/cid');
    var namespace = require('can-util/namespace');
    var COMPUTE = function (getterSetter, context, eventName, bindOnce) {
        var internalCompute = new Compute(getterSetter, context, eventName, bindOnce);
        var addEventListener = internalCompute.addEventListener;
        var removeEventListener = internalCompute.removeEventListener;
        var compute = function (val) {
            if (arguments.length) {
                return internalCompute.set(val);
            }
            return internalCompute.get();
        };
        var cid = CID(compute, 'compute');
        var handlerKey = '__handler' + cid;
        compute.bind = compute.addEventListener = function (ev, handler) {
            var computeHandler = handler && handler[handlerKey];
            if (handler && !computeHandler) {
                computeHandler = handler[handlerKey] = function () {
                    handler.apply(compute, arguments);
                };
            }
            return addEventListener.call(internalCompute, ev, computeHandler);
        };
        compute.unbind = compute.removeEventListener = function (ev, handler) {
            var computeHandler = handler && handler[handlerKey];
            if (computeHandler) {
                delete handler[handlerKey];
                return internalCompute.removeEventListener(ev, computeHandler);
            }
            return removeEventListener.apply(internalCompute, arguments);
        };
        compute.isComputed = internalCompute.isComputed;
        compute.clone = function (ctx) {
            if (typeof getterSetter === 'function') {
                context = ctx;
            }
            return COMPUTE(getterSetter, context, ctx, bindOnce);
        };
        compute.computeInstance = internalCompute;
        return compute;
    };
    COMPUTE.truthy = function (compute) {
        return COMPUTE(function () {
            var res = compute();
            if (typeof res === 'function') {
                res = res();
            }
            return !!res;
        });
    };
    COMPUTE.async = function (initialValue, asyncComputer, context) {
        return COMPUTE(initialValue, {
            fn: asyncComputer,
            context: context
        });
    };
    COMPUTE.temporarilyBind = Compute.temporarilyBind;
    module.exports = namespace.compute = COMPUTE;
});
/*can-observe-info@3.0.0#reader/reader*/
define('can-observe-info/reader/reader', function (require, exports, module) {
    var ObserveInfo = require('can-observe-info');
    var assign = require('can-util/js/assign/assign');
    var CID = require('can-util/js/cid/cid');
    var types = require('can-util/js/types/types');
    var dev = require('can-util/js/dev/dev');
    var canEvent = require('can-event');
    var observeReader;
    var isAt = function (index, reads) {
        var prevRead = reads[index - 1];
        return prevRead && prevRead.at;
    };
    var readValue = function (value, index, reads, options, state, prev) {
        var usedValueReader;
        do {
            usedValueReader = false;
            for (var i = 0, len = observeReader.valueReaders.length; i < len; i++) {
                if (observeReader.valueReaders[i].test(value, index, reads, options)) {
                    value = observeReader.valueReaders[i].read(value, index, reads, options, state, prev);
                }
            }
        } while (usedValueReader);
        return value;
    };
    var specialRead = {
        index: true,
        key: true,
        event: true,
        element: true,
        viewModel: true
    };
    var checkForObservableAndNotify = function (options, state, getObserves, value, index) {
        if (options.foundObservable && !state.foundObservable) {
            if (ObserveInfo.trapsCount()) {
                ObserveInfo.observes(getObserves());
                options.foundObservable(value, index);
                state.foundObservable = true;
            }
        }
    };
    observeReader = {
        read: function (parent, reads, options) {
            options = options || {};
            var state = { foundObservable: false };
            var getObserves;
            if (options.foundObservable) {
                getObserves = ObserveInfo.trap();
            }
            var cur = readValue(parent, 0, reads, options, state), type, prev, readLength = reads.length, i = 0, last;
            checkForObservableAndNotify(options, state, getObserves, parent, 0);
            while (i < readLength) {
                prev = cur;
                for (var r = 0, readersLength = observeReader.propertyReaders.length; r < readersLength; r++) {
                    var reader = observeReader.propertyReaders[r];
                    if (reader.test(cur)) {
                        cur = reader.read(cur, reads[i], i, options, state);
                        break;
                    }
                }
                checkForObservableAndNotify(options, state, getObserves, prev, i);
                last = cur;
                i = i + 1;
                cur = readValue(cur, i, reads, options, state, prev);
                checkForObservableAndNotify(options, state, getObserves, last, i);
                type = typeof cur;
                if (i < reads.length && (cur === null || type !== 'function' && type !== 'object')) {
                    if (options.earlyExit) {
                        options.earlyExit(prev, i - 1, cur);
                    }
                    return {
                        value: undefined,
                        parent: prev
                    };
                }
            }
            if (cur === undefined) {
                if (options.earlyExit) {
                    options.earlyExit(prev, i - 1);
                }
            }
            return {
                value: cur,
                parent: prev
            };
        },
        valueReaders: [
            {
                name: 'function',
                test: function (value, i, reads, options) {
                    return types.isCallableForValue(value) && !types.isCompute(value);
                },
                read: function (value, i, reads, options, state, prev) {
                    if (isAt(i, reads)) {
                        return i === reads.length ? value.bind(prev) : value;
                    } else if (options.callMethodsOnObservables && types.isMapLike(prev)) {
                        return value.apply(prev, options.args || []);
                    } else if (options.isArgument && i === reads.length) {
                        return options.proxyMethods !== false ? value.bind(prev) : value;
                    }
                    return value.apply(prev, options.args || []);
                }
            },
            {
                name: 'compute',
                test: function (value, i, reads, options) {
                    return types.isCompute(value) && !isAt(i, reads);
                },
                read: function (value, i, reads, options, state) {
                    if (options.readCompute === false && i === reads.length) {
                        return value;
                    }
                    return value.get ? value.get() : value();
                }
            }
        ],
        propertyReaders: [
            {
                name: 'map',
                test: function () {
                    return types.isMapLike.apply(this, arguments);
                },
                read: function (value, prop, index, options, state) {
                    var res = value.attr(prop.key);
                    if (res !== undefined) {
                        return res;
                    } else {
                        return value[prop.key];
                    }
                }
            },
            {
                name: 'promise',
                test: function (value) {
                    return types.isPromise(value);
                },
                read: function (value, prop, index, options, state) {
                    var observeData = value.__observeData;
                    if (!value.__observeData) {
                        observeData = value.__observeData = {
                            isPending: true,
                            state: 'pending',
                            isResolved: false,
                            isRejected: false,
                            value: undefined,
                            reason: undefined
                        };
                        CID(observeData);
                        assign(observeData, canEvent);
                        value.then(function (value) {
                            observeData.isPending = false;
                            observeData.isResolved = true;
                            observeData.value = value;
                            observeData.state = 'resolved';
                            observeData.dispatch('state', [
                                'resolved',
                                'pending'
                            ]);
                        }, function (reason) {
                            observeData.isPending = false;
                            observeData.isRejected = true;
                            observeData.reason = reason;
                            observeData.state = 'rejected';
                            observeData.dispatch('state', [
                                'rejected',
                                'pending'
                            ]);
                        });
                    }
                    ObserveInfo.observe(observeData, 'state');
                    return prop.key in observeData ? observeData[prop.key] : value[prop.key];
                }
            },
            {
                name: 'object',
                test: function () {
                    return true;
                },
                read: function (value, prop) {
                    if (value == null) {
                        return undefined;
                    } else {
                        if (prop.key in value) {
                            return value[prop.key];
                        } else if (prop.at && specialRead[prop.key] && '@' + prop.key in value) {
                            prop.at = false;
                            return value['@' + prop.key];
                        }
                    }
                }
            }
        ],
        reads: function (key) {
            var keys = [];
            var last = 0;
            var at = false;
            if (key.charAt(0) === '@') {
                last = 1;
                at = true;
            }
            var keyToAdd = '';
            for (var i = last; i < key.length; i++) {
                var character = key.charAt(i);
                if (character === '.' || character === '@') {
                    if (key.charAt(i - 1) !== '\\') {
                        keys.push({
                            key: keyToAdd,
                            at: at
                        });
                        at = character === '@';
                        keyToAdd = '';
                    } else {
                        keyToAdd = keyToAdd.substr(0, keyToAdd.length - 1) + '.';
                    }
                } else {
                    keyToAdd += character;
                }
            }
            keys.push({
                key: keyToAdd,
                at: at
            });
            return keys;
        },
        write: function (parent, key, value, options) {
            options = options || {};
            if (types.isMapLike(parent)) {
                if (!options.isArgument && parent._data && parent._data[key] && parent._data[key].isComputed) {
                    return parent._data[key](value);
                } else {
                    return parent.attr(key, value);
                }
            }
            if (parent[key] && parent[key].isComputed) {
                return parent[key](value);
            }
            if (typeof parent === 'object') {
                parent[key] = value;
            }
        }
    };
    module.exports = observeReader;
});
/*can-component@3.0.0-pre.7#control/control*/
define('can-component/control/control', function (require, exports, module) {
    var Control = require('can-control');
    var canEach = require('can-util/js/each/each');
    var string = require('can-util/js/string/string');
    var canCompute = require('can-compute');
    var observeReader = require('can-observe-info/reader/reader');
    var paramReplacer = /\{([^\}]+)\}/g;
    var ComponentControl = Control.extend({
        _lookup: function (options) {
            return [
                options.scope,
                options,
                window
            ];
        },
        _action: function (methodName, options, controlInstance) {
            var hasObjectLookup, readyCompute;
            paramReplacer.lastIndex = 0;
            hasObjectLookup = paramReplacer.test(methodName);
            if (!controlInstance && hasObjectLookup) {
                return;
            } else if (!hasObjectLookup) {
                return Control._action.apply(this, arguments);
            } else {
                readyCompute = canCompute(function () {
                    var delegate;
                    var name = methodName.replace(paramReplacer, function (matched, key) {
                        var value;
                        if (key === 'scope' || key === 'viewModel') {
                            delegate = options.viewModel;
                            return '';
                        }
                        key = key.replace(/^(scope|^viewModel)\./, '');
                        value = observeReader.read(options.viewModel, observeReader.reads(key), { readCompute: false }).value;
                        if (value === undefined) {
                            value = string.getObject(key);
                        }
                        if (typeof value === 'string') {
                            return value;
                        } else {
                            delegate = value;
                            return '';
                        }
                    });
                    var parts = name.split(/\s+/g), event = parts.pop();
                    return {
                        processor: this.processors[event] || this.processors.click,
                        parts: [
                            name,
                            parts.join(' '),
                            event
                        ],
                        delegate: delegate || undefined
                    };
                }, this);
                var handler = function (ev, ready) {
                    controlInstance._bindings.control[methodName](controlInstance.element);
                    controlInstance._bindings.control[methodName] = ready.processor(ready.delegate || controlInstance.element, ready.parts[2], ready.parts[1], methodName, controlInstance);
                };
                readyCompute.bind('change', handler);
                controlInstance._bindings.readyComputes[methodName] = {
                    compute: readyCompute,
                    handler: handler
                };
                return readyCompute();
            }
        }
    }, {
        setup: function (el, options) {
            this.scope = options.scope;
            this.viewModel = options.viewModel;
            return Control.prototype.setup.call(this, el, options);
        },
        off: function () {
            if (this._bindings) {
                canEach(this._bindings.readyComputes || {}, function (value) {
                    value.compute.unbind('change', value.handler);
                });
            }
            Control.prototype.off.apply(this, arguments);
            this._bindings.readyComputes = {};
        },
        destroy: function () {
            Control.prototype.destroy.apply(this, arguments);
            if (typeof this.options.destroy === 'function') {
                this.options.destroy.apply(this, arguments);
            }
        }
    });
    module.exports = ComponentControl;
});
/*can-simple-map@3.0.0-pre.1#can-simple-map*/
define('can-simple-map', function (require, exports, module) {
    var Construct = require('can-construct');
    var canBatch = require('can-event/batch/batch');
    var canEvent = require('can-event');
    var assign = require('can-util/js/assign/assign');
    var types = require('can-util/js/types/types');
    var ObserveInfo = require('can-observe-info');
    var SimpleMap = Construct.extend({
        setup: function () {
            this._data = {};
        },
        init: function (initialData) {
            this.attr(initialData);
        },
        attr: function (prop, value) {
            var self = this;
            if (arguments.length > 1) {
                var old = this._data[prop];
                this._data[prop] = value;
                canBatch.trigger.call(this, prop, [old]);
            } else if (typeof prop === 'object') {
                Object.keys(prop).forEach(function (key) {
                    self.attr(key, prop[key]);
                });
            } else {
                if (prop !== 'constructor') {
                    ObserveInfo.observe(this, prop);
                    return this._data[prop];
                }
                return this.constructor;
            }
        }
    });
    assign(SimpleMap.prototype, canEvent);
    var oldIsMapLike = types.isMapLike;
    types.isMapLike = function (obj) {
        if (obj instanceof SimpleMap) {
            return true;
        }
        return oldIsMapLike.call(this, obj);
    };
    if (!types.DefaultMap) {
        types.DefaultMap = SimpleMap;
    }
    module.exports = SimpleMap;
});
/*can-view-scope@3.0.0-pre.6#reference-map*/
define('can-view-scope/reference-map', function (require, exports, module) {
    var types = require('can-util/js/types/types');
    var SimpleMap = require('can-simple-map');
    var ReferenceMap = SimpleMap.extend({});
    var oldIsMapLike = types.isMapLike;
    types.isMapLike = function (obj) {
        if (obj instanceof ReferenceMap) {
            return true;
        }
        return oldIsMapLike.call(this, obj);
    };
    module.exports = ReferenceMap;
});
/*can-view-scope@3.0.0-pre.6#compute_data*/
define('can-view-scope/compute_data', function (require, exports, module) {
    var ObservedInfo = require('can-observe-info');
    var observeReader = require('can-observe-info/reader/reader');
    var makeCompute = require('can-compute');
    var types = require('can-util/js/types/types');
    var isFunction = require('can-util/js/is-function/is-function');
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    var isFastPath = function (computeData) {
        return computeData.reads && computeData.reads.length === 1 && types.isMapLike(computeData.root) && !isFunction(computeData.root[computeData.reads[0].key]);
    };
    var scopeReader = function (scope, key, options, computeData, newVal) {
        if (arguments.length > 4) {
            var root = computeData.root || computeData.setRoot;
            if (root) {
                if (root.isComputed) {
                    root(newVal);
                } else if (computeData.reads.length) {
                    var last = computeData.reads.length - 1;
                    var obj = computeData.reads.length ? observeReader.read(root, computeData.reads.slice(0, last)).value : root;
                    observeReader.write(obj, computeData.reads[last].key, newVal, options);
                }
            } else {
                scope.set(key, newVal, options);
            }
        } else {
            if (computeData.root) {
                return observeReader.read(computeData.root, computeData.reads, options).value;
            }
            var data = scope.read(key, options);
            computeData.scope = data.scope;
            computeData.initialValue = data.value;
            computeData.reads = data.reads;
            computeData.root = data.rootObserve;
            computeData.setRoot = data.setRoot;
            return data.value;
        }
    };
    module.exports = function (scope, key, options) {
        options = options || { args: [] };
        var computeData = {}, scopeRead = function (newVal) {
                if (arguments.length) {
                    return scopeReader(scope, key, options, computeData, newVal);
                } else {
                    return scopeReader(scope, key, options, computeData);
                }
            }, compute = makeCompute(undefined, {
                on: function () {
                    readInfo.getValueAndBind();
                    if (isFastPath(computeData)) {
                        readInfo.dependencyChange = function (ev, newVal) {
                            if (typeof newVal !== 'function') {
                                this.newVal = newVal;
                            } else {
                                readInfo.dependencyChange = ObservedInfo.prototype.dependencyChange;
                                readInfo.getValueAndBind = ObservedInfo.prototype.getValueAndBind;
                            }
                            return ObservedInfo.prototype.dependencyChange.call(this, ev);
                        };
                        readInfo.getValueAndBind = function () {
                            this.value = this.newVal;
                        };
                    }
                    compute.computeInstance.value = readInfo.value;
                    compute.computeInstance.hasDependencies = !isEmptyObject(readInfo.newObserved);
                },
                off: function () {
                    readInfo.teardown();
                },
                set: scopeRead,
                get: scopeRead,
                __selfUpdater: true
            }), readInfo = new ObservedInfo(scopeRead, null, compute.computeInstance);
        computeData.compute = compute;
        return computeData;
    };
});
/*can-view-scope@3.0.0-pre.6#can-view-scope*/
define('can-view-scope', function (require, exports, module) {
    var observeReader = require('can-observe-info/reader/reader');
    var ObserveInfo = require('can-observe-info');
    var ReferenceMap = require('can-view-scope/reference-map');
    var makeComputeData = require('can-view-scope/compute_data');
    var assign = require('can-util/js/assign/assign');
    var each = require('can-util/js/each/each');
    var namespace = require('can-util/namespace');
    function Scope(context, parent, meta) {
        this._context = context;
        this._parent = parent;
        this._meta = meta || {};
        this.__cache = {};
    }
    assign(Scope, {
        read: observeReader.read,
        Refs: ReferenceMap,
        refsScope: function () {
            return new Scope(new this.Refs());
        }
    });
    assign(Scope.prototype, {
        add: function (context, meta) {
            if (context !== this._context) {
                return new this.constructor(context, this, meta);
            } else {
                return this;
            }
        },
        read: function (attr, options) {
            if (attr === '%root') {
                return { value: this.getRoot() };
            }
            var isInCurrentContext = attr.substr(0, 2) === './', isInParentContext = attr.substr(0, 3) === '../', isCurrentContext = attr === '.' || attr === 'this', isParentContext = attr === '..', isContextBased = isInCurrentContext || isInParentContext || isCurrentContext || isParentContext;
            if (isContextBased && this._meta.notContext) {
                return this._parent.read(attr, options);
            }
            var currentScopeOnly;
            if (isInCurrentContext) {
                currentScopeOnly = true;
                attr = attr.substr(2);
            } else if (isInParentContext) {
                var parent = this._parent;
                while (parent._meta.notContext) {
                    parent = parent._parent;
                }
                return parent.read(attr.substr(3) || '.', options);
            } else if (isCurrentContext) {
                return { value: this._context };
            } else if (isParentContext) {
                return { value: this._parent._context };
            }
            var keyReads = observeReader.reads(attr);
            if (keyReads[0].key.charAt(0) === '*') {
                return this.getRefs()._read(keyReads, options, true);
            } else {
                return this._read(keyReads, options, currentScopeOnly);
            }
        },
        _read: function (keyReads, options, currentScopeOnly) {
            var currentScope = this, currentContext, undefinedObserves = [], currentObserve, currentReads, setObserveDepth = -1, currentSetReads, currentSetObserve, readOptions = assign({
                    foundObservable: function (observe, nameIndex) {
                        currentObserve = observe;
                        currentReads = keyReads.slice(nameIndex);
                    },
                    earlyExit: function (parentValue, nameIndex) {
                        if (nameIndex > setObserveDepth) {
                            currentSetObserve = currentObserve;
                            currentSetReads = currentReads;
                            setObserveDepth = nameIndex;
                        }
                    }
                }, options);
            while (currentScope) {
                currentContext = currentScope._context;
                if (currentContext !== null && (typeof currentContext === 'object' || typeof currentContext === 'function')) {
                    var getObserves = ObserveInfo.trap();
                    var data = observeReader.read(currentContext, keyReads, readOptions);
                    var observes = getObserves();
                    if (data.value !== undefined) {
                        ObserveInfo.observes(observes);
                        return {
                            scope: currentScope,
                            rootObserve: currentObserve,
                            value: data.value,
                            reads: currentReads
                        };
                    } else {
                        undefinedObserves.push.apply(undefinedObserves, observes);
                    }
                }
                if (currentScopeOnly) {
                    currentScope = null;
                } else {
                    currentScope = currentScope._parent;
                }
            }
            ObserveInfo.observes(undefinedObserves);
            return {
                setRoot: currentSetObserve,
                reads: currentSetReads,
                value: undefined
            };
        },
        get: ObserveInfo.notObserve(function (key, options) {
            options = assign({ isArgument: true }, options);
            var res = this.read(key, options);
            return res.value;
        }),
        getScope: function (tester) {
            var scope = this;
            while (scope) {
                if (tester(scope)) {
                    return scope;
                }
                scope = scope._parent;
            }
        },
        getContext: function (tester) {
            var res = this.getScope(tester);
            return res && res._context;
        },
        getRefs: function () {
            return this.getScope(function (scope) {
                return scope._context instanceof Scope.Refs;
            });
        },
        getRoot: function () {
            var cur = this, child = this;
            while (cur._parent) {
                child = cur;
                cur = cur._parent;
            }
            if (cur._context instanceof Scope.Refs) {
                cur = child;
            }
            return cur._context;
        },
        set: function (key, value, options) {
            var dotIndex = key.lastIndexOf('.'), slashIndex = key.lastIndexOf('/'), contextPath, propName;
            if (slashIndex > dotIndex) {
                contextPath = key.substring(0, slashIndex);
                propName = key.substring(slashIndex + 1, key.length);
            } else {
                if (dotIndex !== -1) {
                    contextPath = key.substring(0, dotIndex);
                    propName = key.substring(dotIndex + 1, key.length);
                } else {
                    contextPath = '.';
                    propName = key;
                }
            }
            if (key.charAt(0) === '*') {
                observeReader.write(this.getRefs()._context, key, value, options);
            } else {
                var context = this.read(contextPath, options).value;
                observeReader.write(context, propName, value, options);
            }
        },
        attr: ObserveInfo.notObserve(function (key, value, options) {
            options = assign({ isArgument: true }, options);
            if (arguments.length === 2) {
                return this.set(key, value, options);
            } else {
                return this.get(key, options);
            }
        }),
        computeData: function (key, options) {
            return makeComputeData(this, key, options);
        },
        compute: function (key, options) {
            return this.computeData(key, options).compute;
        },
        cloneFromRef: function () {
            var contexts = [];
            var scope = this, context, parent;
            while (scope) {
                context = scope._context;
                if (context instanceof Scope.Refs) {
                    parent = scope._parent;
                    break;
                }
                contexts.unshift(context);
                scope = scope._parent;
            }
            if (parent) {
                each(contexts, function (context) {
                    parent = parent.add(context);
                });
                return parent;
            } else {
                return this;
            }
        }
    });
    function Options(data, parent, meta) {
        if (!data.helpers && !data.partials && !data.tags) {
            data = { helpers: data };
        }
        Scope.call(this, data, parent, meta);
    }
    Options.prototype = new Scope();
    Options.prototype.constructor = Options;
    Scope.Options = Options;
    namespace.view = namespace.view || {};
    module.exports = namespace.view.Scope = Scope;
});
/*can-stache@3.0.0-pre.6#src/utils*/
define('can-stache/src/utils', function (require, exports, module) {
    var Scope = require('can-view-scope');
    var ObserveInfo = require('can-observe-info');
    var isArrayLike = require('can-util/js/is-array-like/is-array-like');
    var Options = Scope.Options;
    module.exports = {
        isArrayLike: isArrayLike,
        emptyHandler: function () {
        },
        jsonParse: function (str) {
            if (str[0] === '\'') {
                return str.substr(1, str.length - 2);
            } else if (str === 'undefined') {
                return undefined;
            } else {
                return JSON.parse(str);
            }
        },
        mixins: {
            last: function () {
                return this.stack[this.stack.length - 1];
            },
            add: function (chars) {
                this.last().add(chars);
            },
            subSectionDepth: function () {
                return this.stack.length - 1;
            }
        },
        convertToScopes: function (helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer) {
            if (truthyRenderer) {
                helperOptions.fn = this.makeRendererConvertScopes(truthyRenderer, scope, options, nodeList);
            }
            if (falseyRenderer) {
                helperOptions.inverse = this.makeRendererConvertScopes(falseyRenderer, scope, options, nodeList);
            }
        },
        makeRendererConvertScopes: function (renderer, parentScope, parentOptions, nodeList) {
            var rendererWithScope = function (ctx, opts, parentNodeList) {
                return renderer(ctx || parentScope, opts, parentNodeList);
            };
            return ObserveInfo.notObserve(function (newScope, newOptions, parentNodeList) {
                if (newScope !== undefined && !(newScope instanceof Scope)) {
                    newScope = parentScope.add(newScope);
                }
                if (newOptions !== undefined && !(newOptions instanceof Options)) {
                    newOptions = parentOptions.add(newOptions);
                }
                var result = rendererWithScope(newScope, newOptions || parentOptions, parentNodeList || nodeList);
                return result;
            });
        },
        Options: Options
    };
});
/*can-view-parser@3.0.0-pre.3#can-view-parser*/
define('can-view-parser', function (require, exports, module) {
    var namespace = require('can-util/namespace');
    function each(items, callback) {
        for (var i = 0; i < items.length; i++) {
            callback(items[i], i);
        }
    }
    function makeMap(str) {
        var obj = {}, items = str.split(',');
        each(items, function (name) {
            obj[name] = true;
        });
        return obj;
    }
    function handleIntermediate(intermediate, handler) {
        for (var i = 0, len = intermediate.length; i < len; i++) {
            var item = intermediate[i];
            handler[item.tokenType].apply(handler, item.args);
        }
        return intermediate;
    }
    var alphaNumeric = 'A-Za-z0-9', alphaNumericHU = '-:_' + alphaNumeric, attributeNames = '[^=>\\s\\/]+', spaceEQspace = '\\s*=\\s*', singleCurly = '\\{[^\\}\\{]\\}', doubleCurly = '\\{\\{[^\\}]\\}\\}\\}?', attributeEqAndValue = '(?:' + spaceEQspace + '(?:' + '(?:' + doubleCurly + ')|(?:' + singleCurly + ')|(?:"[^"]*")|(?:\'[^\']*\')|[^>\\s]+))?', matchStash = '\\{\\{[^\\}]*\\}\\}\\}?', stash = '\\{\\{([^\\}]*)\\}\\}\\}?', startTag = new RegExp('^<([' + alphaNumeric + '][' + alphaNumericHU + ']*)' + '(' + '(?:\\s*' + '(?:(?:' + '(?:' + attributeNames + ')?' + attributeEqAndValue + ')|' + '(?:' + matchStash + ')+)' + ')*' + ')\\s*(\\/?)>'), endTag = new RegExp('^<\\/([' + alphaNumericHU + ']+)[^>]*>'), mustache = new RegExp(stash, 'g'), txtBreak = /<|\{\{/, space = /\s/;
    var empty = makeMap('area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed');
    var block = makeMap('a,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video');
    var inline = makeMap('a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var');
    var closeSelf = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr');
    var special = makeMap('script');
    var tokenTypes = 'start,end,close,attrStart,attrEnd,attrValue,chars,comment,special,done'.split(',');
    var fn = function () {
    };
    var HTMLParser = function (html, handler, returnIntermediate) {
        if (typeof html === 'object') {
            return handleIntermediate(html, handler);
        }
        var intermediate = [];
        handler = handler || {};
        if (returnIntermediate) {
            each(tokenTypes, function (name) {
                var callback = handler[name] || fn;
                handler[name] = function () {
                    if (callback.apply(this, arguments) !== false) {
                        intermediate.push({
                            tokenType: name,
                            args: [].slice.call(arguments, 0)
                        });
                    }
                };
            });
        }
        function parseStartTag(tag, tagName, rest, unary) {
            tagName = tagName.toLowerCase();
            if (block[tagName] && !inline[tagName]) {
                var last = stack.last();
                while (last && inline[last] && !block[last]) {
                    parseEndTag('', last);
                    last = stack.last();
                }
            }
            if (closeSelf[tagName] && stack.last() === tagName) {
                parseEndTag('', tagName);
            }
            unary = empty[tagName] || !!unary;
            handler.start(tagName, unary);
            if (!unary) {
                stack.push(tagName);
            }
            HTMLParser.parseAttrs(rest, handler);
            handler.end(tagName, unary);
        }
        function parseEndTag(tag, tagName) {
            var pos;
            if (!tagName) {
                pos = 0;
            } else {
                tagName = tagName.toLowerCase();
                for (pos = stack.length - 1; pos >= 0; pos--) {
                    if (stack[pos] === tagName) {
                        break;
                    }
                }
            }
            if (pos >= 0) {
                for (var i = stack.length - 1; i >= pos; i--) {
                    if (handler.close) {
                        handler.close(stack[i]);
                    }
                }
                stack.length = pos;
            }
        }
        function parseMustache(mustache, inside) {
            if (handler.special) {
                handler.special(inside);
            }
        }
        var callChars = function () {
            if (charsText) {
                if (handler.chars) {
                    handler.chars(charsText);
                }
            }
            charsText = '';
        };
        var index, chars, match, stack = [], last = html, charsText = '';
        stack.last = function () {
            return this[this.length - 1];
        };
        while (html) {
            chars = true;
            if (!stack.last() || !special[stack.last()]) {
                if (html.indexOf('<!--') === 0) {
                    index = html.indexOf('-->');
                    if (index >= 0) {
                        callChars();
                        if (handler.comment) {
                            handler.comment(html.substring(4, index));
                        }
                        html = html.substring(index + 3);
                        chars = false;
                    }
                } else if (html.indexOf('</') === 0) {
                    match = html.match(endTag);
                    if (match) {
                        callChars();
                        html = html.substring(match[0].length);
                        match[0].replace(endTag, parseEndTag);
                        chars = false;
                    }
                } else if (html.indexOf('<') === 0) {
                    match = html.match(startTag);
                    if (match) {
                        callChars();
                        html = html.substring(match[0].length);
                        match[0].replace(startTag, parseStartTag);
                        chars = false;
                    }
                } else if (html.indexOf('{{') === 0) {
                    match = html.match(mustache);
                    if (match) {
                        callChars();
                        html = html.substring(match[0].length);
                        match[0].replace(mustache, parseMustache);
                    }
                }
                if (chars) {
                    index = html.search(txtBreak);
                    if (index === 0 && html === last) {
                        charsText += html.charAt(0);
                        html = html.substr(1);
                        index = html.search(txtBreak);
                    }
                    var text = index < 0 ? html : html.substring(0, index);
                    html = index < 0 ? '' : html.substring(index);
                    if (text) {
                        charsText += text;
                    }
                }
            } else {
                html = html.replace(new RegExp('([\\s\\S]*?)</' + stack.last() + '[^>]*>'), function (all, text) {
                    text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, '$1$2');
                    if (handler.chars) {
                        handler.chars(text);
                    }
                    return '';
                });
                parseEndTag('', stack.last());
            }
            if (html === last) {
                throw new Error('Parse Error: ' + html);
            }
            last = html;
        }
        callChars();
        parseEndTag();
        handler.done();
        return intermediate;
    };
    var callAttrStart = function (state, curIndex, handler, rest) {
        state.attrStart = rest.substring(typeof state.nameStart === 'number' ? state.nameStart : curIndex, curIndex);
        handler.attrStart(state.attrStart);
        state.inName = false;
    };
    var callAttrEnd = function (state, curIndex, handler, rest) {
        if (state.valueStart !== undefined && state.valueStart < curIndex) {
            handler.attrValue(rest.substring(state.valueStart, curIndex));
        } else if (!state.inValue) {
        }
        handler.attrEnd(state.attrStart);
        state.attrStart = undefined;
        state.valueStart = undefined;
        state.inValue = false;
        state.inName = false;
        state.lookingForEq = false;
        state.inQuote = false;
        state.lookingForName = true;
    };
    HTMLParser.parseAttrs = function (rest, handler) {
        if (!rest) {
            return;
        }
        var i = 0;
        var curIndex;
        var state = {
            inDoubleCurly: false,
            inName: false,
            nameStart: undefined,
            inValue: false,
            valueStart: undefined,
            inQuote: false,
            attrStart: undefined,
            lookingForName: true,
            lookingForValue: false,
            lookingForEq: false
        };
        while (i < rest.length) {
            curIndex = i;
            var cur = rest.charAt(i);
            var next = rest.charAt(i + 1);
            var nextNext = rest.charAt(i + 2);
            i++;
            if (cur === '{' && next === '{') {
                if (state.inValue && curIndex > state.valueStart) {
                    handler.attrValue(rest.substring(state.valueStart, curIndex));
                } else if (state.inName && state.nameStart < curIndex) {
                    callAttrStart(state, curIndex, handler, rest);
                    callAttrEnd(state, curIndex, handler, rest);
                } else if (state.lookingForValue) {
                    state.inValue = true;
                } else if (state.lookingForEq && state.attrStart) {
                    callAttrEnd(state, curIndex, handler, rest);
                }
                state.inDoubleCurly = true;
                state.doubleCurlyStart = curIndex + 2;
                i++;
            } else if (state.inDoubleCurly) {
                if (cur === '}' && next === '}') {
                    var isTriple = nextNext === '}' ? 1 : 0;
                    handler.special(rest.substring(state.doubleCurlyStart, curIndex));
                    state.inDoubleCurly = false;
                    if (state.inValue) {
                        state.valueStart = curIndex + 2 + isTriple;
                    }
                    i += 1 + isTriple;
                }
            } else if (state.inValue) {
                if (state.inQuote) {
                    if (cur === state.inQuote) {
                        callAttrEnd(state, curIndex, handler, rest);
                    }
                } else if (space.test(cur)) {
                    callAttrEnd(state, curIndex, handler, rest);
                }
            } else if (cur === '=' && (state.lookingForEq || state.lookingForName || state.inName)) {
                if (!state.attrStart) {
                    callAttrStart(state, curIndex, handler, rest);
                }
                state.lookingForValue = true;
                state.lookingForEq = false;
                state.lookingForName = false;
            } else if (state.inName) {
                if (space.test(cur)) {
                    callAttrStart(state, curIndex, handler, rest);
                    state.lookingForEq = true;
                }
            } else if (state.lookingForName) {
                if (!space.test(cur)) {
                    if (state.attrStart) {
                        callAttrEnd(state, curIndex, handler, rest);
                    }
                    state.nameStart = curIndex;
                    state.inName = true;
                }
            } else if (state.lookingForValue) {
                if (!space.test(cur)) {
                    state.lookingForValue = false;
                    state.inValue = true;
                    if (cur === '\'' || cur === '"') {
                        state.inQuote = cur;
                        state.valueStart = curIndex + 1;
                    } else {
                        state.valueStart = curIndex;
                    }
                }
            }
        }
        if (state.inName) {
            callAttrStart(state, curIndex + 1, handler, rest);
            callAttrEnd(state, curIndex + 1, handler, rest);
        } else if (state.lookingForEq) {
            callAttrEnd(state, curIndex + 1, handler, rest);
        } else if (state.inValue) {
            callAttrEnd(state, curIndex + 1, handler, rest);
        }
    };
    module.exports = namespace.HTMLParser = HTMLParser;
});
/*can-util@3.0.0-pre.22#js/set-immediate/set-immediate*/
define('can-util/js/set-immediate/set-immediate', function (require, exports, module) {
    var global = require('can-util/js/global/global')();
    module.exports = global.setImmediate || function (cb) {
        return setTimeout(cb, 0);
    };
});
/*can-util@3.0.0-pre.22#dom/mutation-observer/mutation-observer*/
define('can-util/dom/mutation-observer/mutation-observer', function (require, exports, module) {
    var global = require('can-util/js/global/global')();
    var setMutationObserver;
    module.exports = function (setMO) {
        if (setMO !== undefined) {
            setMutationObserver = setMO;
        }
        return setMutationObserver !== undefined ? setMutationObserver : global.MutationObserver || global.WebKitMutationObserver || global.MozMutationObserver;
    };
});
/*can-util@3.0.0-pre.22#dom/child-nodes/child-nodes*/
define('can-util/dom/child-nodes/child-nodes', function (require, exports, module) {
    function childNodes(node) {
        var childNodes = node.childNodes;
        if ('length' in childNodes) {
            return childNodes;
        } else {
            var cur = node.firstChild;
            var nodes = [];
            while (cur) {
                nodes.push(cur);
                cur = cur.nextSibling;
            }
            return nodes;
        }
    }
    module.exports = childNodes;
});
/*can-util@3.0.0-pre.22#dom/contains/contains*/
define('can-util/dom/contains/contains', function (require, exports, module) {
    module.exports = function (child) {
        return this.contains(child);
    };
});
/*can-util@3.0.0-pre.22#dom/mutate/mutate*/
define('can-util/dom/mutate/mutate', function (require, exports, module) {
    var makeArray = require('can-util/js/make-array/make-array');
    var setImmediate = require('can-util/js/set-immediate/set-immediate');
    var CID = require('can-util/js/cid/cid');
    var getMutationObserver = require('can-util/dom/mutation-observer/mutation-observer');
    var childNodes = require('can-util/dom/child-nodes/child-nodes');
    var domContains = require('can-util/dom/contains/contains');
    var domDispatch = require('can-util/dom/dispatch/dispatch');
    var mutatedElements;
    var checks = {
        inserted: function (root, elem) {
            return domContains.call(root, elem);
        },
        removed: function (root, elem) {
            return !domContains.call(root, elem);
        }
    };
    var fireOn = function (elems, root, check, event, dispatched) {
        if (!elems.length) {
            return;
        }
        var children, cid;
        for (var i = 0, elem; (elem = elems[i]) !== undefined; i++) {
            cid = CID(elem);
            if (elem.getElementsByTagName && check(root, elem) && !dispatched[cid]) {
                dispatched[cid] = true;
                children = makeArray(elem.getElementsByTagName('*'));
                domDispatch.call(elem, event, [], false);
                for (var j = 0, child; (child = children[j]) !== undefined; j++) {
                    cid = CID(child);
                    if (!dispatched[cid]) {
                        domDispatch.call(child, event, [], false);
                        dispatched[cid] = true;
                    }
                }
            }
        }
    };
    var fireMutations = function () {
        var mutations = mutatedElements;
        mutatedElements = null;
        var firstElement = mutations[0][1][0];
        var doc = firstElement.ownerDocument || firstElement;
        var root = doc.contains ? doc : doc.body;
        var dispatched = {
            inserted: {},
            removed: {}
        };
        mutations.forEach(function (mutation) {
            fireOn(mutation[1], root, checks[mutation[0]], mutation[0], dispatched[mutation[0]]);
        });
    };
    var mutated = function (elements, type) {
        if (!getMutationObserver() && elements.length) {
            var firstElement = elements[0];
            var doc = firstElement.ownerDocument || firstElement;
            var root = doc.contains ? doc : doc.body;
            if (checks.inserted(root, firstElement)) {
                if (!mutatedElements) {
                    mutatedElements = [];
                    setImmediate(fireMutations);
                }
                mutatedElements.push([
                    type,
                    elements
                ]);
            }
        }
    };
    module.exports = {
        appendChild: function (child) {
            if (getMutationObserver()) {
                this.appendChild(child);
            } else {
                var children;
                if (child.nodeType === 11) {
                    children = makeArray(childNodes(child));
                } else {
                    children = [child];
                }
                this.appendChild(child);
                mutated(children, 'inserted');
            }
        },
        insertBefore: function (child, ref, document) {
            if (getMutationObserver()) {
                this.insertBefore(child, ref);
            } else {
                var children;
                if (child.nodeType === 11) {
                    children = makeArray(childNodes(child));
                } else {
                    children = [child];
                }
                this.insertBefore(child, ref);
                mutated(children, 'inserted');
            }
        },
        removeChild: function (child) {
            if (getMutationObserver()) {
                this.removeChild(child);
            } else {
                mutated([child], 'removed');
                this.removeChild(child);
            }
        },
        replaceChild: function (newChild, oldChild) {
            if (getMutationObserver()) {
                this.replaceChild(newChild, oldChild);
            } else {
                var children;
                if (newChild.nodeType === 11) {
                    children = makeArray(childNodes(newChild));
                } else {
                    children = [newChild];
                }
                mutated([oldChild], 'removed');
                this.replaceChild(newChild, oldChild);
                mutated(children, 'inserted');
            }
        },
        inserted: function (elements) {
            mutated(elements, 'inserted');
        },
        removed: function (elements) {
            mutated(elements, 'removed');
        }
    };
});
/*can-view-nodelist@3.0.0-pre.2#can-view-nodelist*/
define('can-view-nodelist', function (require, exports, module) {
    var CID = require('can-util/js/cid/cid');
    var makeArray = require('can-util/js/make-array/make-array');
    var each = require('can-util/js/each/each');
    var namespace = require('can-util/namespace');
    var domMutate = require('can-util/dom/mutate/mutate');
    var canExpando = true;
    try {
        document.createTextNode('')._ = 0;
    } catch (ex) {
        canExpando = false;
    }
    var nodeMap = {}, textNodeMap = {}, expando = 'stache_' + Math.random(), _id = 0, id = function (node, localMap) {
            var _textNodeMap = localMap || textNodeMap;
            var id = readId(node, _textNodeMap);
            if (id) {
                return id;
            } else {
                if (canExpando || node.nodeType !== 3) {
                    ++_id;
                    return node[expando] = (node.nodeName ? 'element_' : 'obj_') + _id;
                } else {
                    ++_id;
                    _textNodeMap['text_' + _id] = node;
                    return 'text_' + _id;
                }
            }
        }, readId = function (node, textNodeMap) {
            if (canExpando || node.nodeType !== 3) {
                return node[expando];
            } else {
                for (var textNodeID in textNodeMap) {
                    if (textNodeMap[textNodeID] === node) {
                        return textNodeID;
                    }
                }
            }
        }, splice = [].splice, push = [].push, itemsInChildListTree = function (list) {
            var count = 0;
            for (var i = 0, len = list.length; i < len; i++) {
                var item = list[i];
                if (item.nodeType) {
                    count++;
                } else {
                    count += itemsInChildListTree(item);
                }
            }
            return count;
        }, replacementMap = function (replacements, idMap) {
            var map = {};
            for (var i = 0, len = replacements.length; i < len; i++) {
                var node = nodeLists.first(replacements[i]);
                map[id(node, idMap)] = replacements[i];
            }
            return map;
        }, addUnfoundAsDeepChildren = function (list, rMap, foundIds) {
            for (var repId in rMap) {
                if (!foundIds[repId]) {
                    list.newDeepChildren.push(rMap[repId]);
                }
            }
        };
    var nodeLists = {
        id: id,
        update: function (nodeList, newNodes) {
            var oldNodes = nodeLists.unregisterChildren(nodeList);
            newNodes = makeArray(newNodes);
            var oldListLength = nodeList.length;
            splice.apply(nodeList, [
                0,
                oldListLength
            ].concat(newNodes));
            if (nodeList.replacements) {
                nodeLists.nestReplacements(nodeList);
                nodeList.deepChildren = nodeList.newDeepChildren;
                nodeList.newDeepChildren = [];
            } else {
                nodeLists.nestList(nodeList);
            }
            return oldNodes;
        },
        nestReplacements: function (list) {
            var index = 0, idMap = {}, rMap = replacementMap(list.replacements, idMap), rCount = list.replacements.length, foundIds = {};
            while (index < list.length && rCount) {
                var node = list[index], nodeId = readId(node, idMap), replacement = rMap[nodeId];
                if (replacement) {
                    list.splice(index, itemsInChildListTree(replacement), replacement);
                    foundIds[nodeId] = true;
                    rCount--;
                }
                index++;
            }
            if (rCount) {
                addUnfoundAsDeepChildren(list, rMap, foundIds);
            }
            list.replacements = [];
        },
        nestList: function (list) {
            var index = 0;
            while (index < list.length) {
                var node = list[index], childNodeList = nodeMap[id(node)];
                if (childNodeList) {
                    if (childNodeList !== list) {
                        list.splice(index, itemsInChildListTree(childNodeList), childNodeList);
                    }
                } else {
                    nodeMap[id(node)] = list;
                }
                index++;
            }
        },
        last: function (nodeList) {
            var last = nodeList[nodeList.length - 1];
            if (last.nodeType) {
                return last;
            } else {
                return nodeLists.last(last);
            }
        },
        first: function (nodeList) {
            var first = nodeList[0];
            if (first.nodeType) {
                return first;
            } else {
                return nodeLists.first(first);
            }
        },
        flatten: function (nodeList) {
            var items = [];
            for (var i = 0; i < nodeList.length; i++) {
                var item = nodeList[i];
                if (item.nodeType) {
                    items.push(item);
                } else {
                    items.push.apply(items, nodeLists.flatten(item));
                }
            }
            return items;
        },
        register: function (nodeList, unregistered, parent, directlyNested) {
            CID(nodeList);
            nodeList.unregistered = unregistered;
            nodeList.parentList = parent;
            nodeList.nesting = parent && typeof parent.nesting !== 'undefined' ? parent.nesting + 1 : 0;
            if (parent) {
                nodeList.deepChildren = [];
                nodeList.newDeepChildren = [];
                nodeList.replacements = [];
                if (parent !== true) {
                    if (directlyNested) {
                        parent.replacements.push(nodeList);
                    } else {
                        parent.newDeepChildren.push(nodeList);
                    }
                }
            } else {
                nodeLists.nestList(nodeList);
            }
            return nodeList;
        },
        unregisterChildren: function (nodeList) {
            var nodes = [];
            each(nodeList, function (node) {
                if (node.nodeType) {
                    if (!nodeList.replacements) {
                        delete nodeMap[id(node)];
                    }
                    nodes.push(node);
                } else {
                    push.apply(nodes, nodeLists.unregister(node, true));
                }
            });
            each(nodeList.deepChildren, function (nodeList) {
                nodeLists.unregister(nodeList, true);
            });
            return nodes;
        },
        unregister: function (nodeList, isChild) {
            var nodes = nodeLists.unregisterChildren(nodeList, true);
            if (nodeList.unregistered) {
                var unregisteredCallback = nodeList.unregistered;
                nodeList.replacements = nodeList.unregistered = null;
                if (!isChild) {
                    var deepChildren = nodeList.parentList && nodeList.parentList.deepChildren;
                    if (deepChildren) {
                        var index = deepChildren.indexOf(nodeList);
                        if (index !== -1) {
                            deepChildren.splice(index, 1);
                        }
                    }
                }
                unregisteredCallback();
            }
            return nodes;
        },
        after: function (oldElements, newFrag) {
            var last = oldElements[oldElements.length - 1];
            if (last.nextSibling) {
                domMutate.insertBefore.call(last.parentNode, newFrag, last.nextSibling);
            } else {
                domMutate.appendChild.call(last.parentNode, newFrag);
            }
        },
        replace: function (oldElements, newFrag) {
            var selectedValue, parentNode = oldElements[0].parentNode;
            if (parentNode.nodeName.toUpperCase() === 'SELECT' && parentNode.selectedIndex >= 0) {
                selectedValue = parentNode.value;
            }
            if (oldElements.length === 1) {
                domMutate.replaceChild.call(parentNode, newFrag, oldElements[0]);
            } else {
                nodeLists.after(oldElements, newFrag);
                nodeLists.remove(oldElements);
            }
            if (selectedValue !== undefined) {
                parentNode.value = selectedValue;
            }
        },
        remove: function (elementsToBeRemoved) {
            var parent = elementsToBeRemoved[0] && elementsToBeRemoved[0].parentNode;
            each(elementsToBeRemoved, function (child) {
                domMutate.removeChild.call(parent, child);
            });
        },
        nodeMap: nodeMap
    };
    module.exports = namespace.nodeLists = nodeLists;
});
/*can-util@3.0.0-pre.22#dom/fragment/fragment*/
define('can-util/dom/fragment/fragment', function (require, exports, module) {
    var getDocument = require('can-util/dom/document/document'), childNodes = require('can-util/dom/child-nodes/child-nodes');
    var fragmentRE = /^\s*<(\w+)[^>]*>/, toString = {}.toString, fragment = function (html, name, doc) {
            if (name === undefined) {
                name = fragmentRE.test(html) && RegExp.$1;
            }
            if (html && toString.call(html.replace) === '[object Function]') {
                html = html.replace(/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, '<$1></$2>');
            }
            var container = doc.createElement('div'), temp = doc.createElement('div');
            if (name === 'tbody' || name === 'tfoot' || name === 'thead' || name === 'colgroup') {
                temp.innerHTML = '<table>' + html + '</table>';
                container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild;
            } else if (name === 'col') {
                temp.innerHTML = '<table><colgroup>' + html + '</colgroup></table>';
                container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild.firstChild;
            } else if (name === 'tr') {
                temp.innerHTML = '<table><tbody>' + html + '</tbody></table>';
                container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild.firstChild;
            } else if (name === 'td' || name === 'th') {
                temp.innerHTML = '<table><tbody><tr>' + html + '</tr></tbody></table>';
                container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild.firstChild.firstChild;
            } else if (name === 'option') {
                temp.innerHTML = '<select>' + html + '</select>';
                container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild;
            } else {
                container.innerHTML = '' + html;
            }
            var tmp = {}, children = childNodes(container);
            tmp.length = children.length;
            for (var i = 0; i < children.length; i++) {
                tmp[i] = children[i];
            }
            return [].slice.call(tmp);
        };
    var buildFragment = function (html, doc) {
        if (html && html.nodeType === 11) {
            return html;
        }
        if (!doc) {
            doc = getDocument();
        } else if (doc.length) {
            doc = doc[0];
        }
        var parts = fragment(html, undefined, doc), frag = (doc || document).createDocumentFragment();
        for (var i = 0, length = parts.length; i < length; i++) {
            frag.appendChild(parts[i]);
        }
        return frag;
    };
    module.exports = buildFragment;
});
/*can-util@3.0.0-pre.22#dom/frag/frag*/
define('can-util/dom/frag/frag', function (require, exports, module) {
    var getDocument = require('can-util/dom/document/document');
    var fragment = require('can-util/dom/fragment/fragment');
    var each = require('can-util/js/each/each');
    var childNodes = require('can-util/dom/child-nodes/child-nodes');
    var makeFrag = function (item, doc) {
        var document = doc || getDocument();
        var frag;
        if (!item || typeof item === 'string') {
            frag = fragment(item == null ? '' : '' + item, document);
            if (!frag.childNodes.length) {
                frag.appendChild(document.createTextNode(''));
            }
            return frag;
        } else if (item.nodeType === 11) {
            return item;
        } else if (typeof item.nodeType === 'number') {
            frag = document.createDocumentFragment();
            frag.appendChild(item);
            return frag;
        } else if (typeof item.length === 'number') {
            frag = document.createDocumentFragment();
            each(item, function (item) {
                frag.appendChild(makeFrag(item));
            });
            if (!childNodes(frag).length) {
                frag.appendChild(document.createTextNode(''));
            }
            return frag;
        } else {
            frag = fragment('' + item, document);
            if (!childNodes(frag).length) {
                frag.appendChild(document.createTextNode(''));
            }
            return frag;
        }
    };
    module.exports = makeFrag;
});
/*can-util@3.0.0-pre.22#dom/mutation-observer/document/document*/
define('can-util/dom/mutation-observer/document/document', function (require, exports, module) {
    var getDocument = require('can-util/dom/document/document');
    var domData = require('can-util/dom/data/data');
    module.exports = {
        add: function (handler) {
            var documentElement = getDocument().documentElement;
            var globalObserverData = domData.get.call(documentElement, 'globalObserverData');
            if (!globalObserverData) {
                var observer = new MutationObserver(function (mutations) {
                    globalObserverData.handlers.forEach(function (handler) {
                        handler(mutations);
                    });
                });
                observer.observe(documentElement, {
                    childList: true,
                    subtree: true
                });
                globalObserverData = {
                    observer: observer,
                    handlers: []
                };
                domData.set.call(documentElement, 'globalObserverData', globalObserverData);
            }
            globalObserverData.handlers.push(handler);
        },
        remove: function (handler) {
            var documentElement = getDocument().documentElement;
            var globalObserverData = domData.get.call(documentElement, 'globalObserverData');
            if (globalObserverData) {
                var index = globalObserverData.handlers.indexOf(handler);
                if (index >= 0) {
                    globalObserverData.handlers.splice(index, 1);
                }
                if (globalObserverData.handlers.length === 0) {
                    globalObserverData.observer.disconnect();
                    domData.clean.call(documentElement, 'globalObserverData');
                }
            }
        }
    };
});
/*can-util@3.0.0-pre.22#dom/is-of-global-document/is-of-global-document*/
define('can-util/dom/is-of-global-document/is-of-global-document', function (require, exports, module) {
    var getDocument = require('can-util/dom/document/document');
    module.exports = function (el) {
        return (el.ownerDocument || el) === getDocument();
    };
});
/*can-util@3.0.0-pre.22#dom/events/make-mutation-event/make-mutation-event*/
define('can-util/dom/events/make-mutation-event/make-mutation-event', function (require, exports, module) {
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    var each = require('can-util/js/each/each');
    var makeArray = require('can-util/js/make-array/make-array');
    var events = require('can-util/dom/events/events');
    var domData = require('can-util/dom/data/data');
    var getMutationObserver = require('can-util/dom/mutation-observer/mutation-observer');
    var domDispatch = require('can-util/dom/dispatch/dispatch');
    var mutationDocument = require('can-util/dom/mutation-observer/document/document');
    var getDocument = require('can-util/dom/document/document');
    require('can-util/dom/is-of-global-document/is-of-global-document');
    module.exports = function (specialEventName, mutationNodesProperty) {
        var originalAdd = events.addEventListener, originalRemove = events.removeEventListener;
        var dispatchIfListening = function (mutatedNode, specialEventData, dispatched) {
            var id = domData.getCid.call(mutatedNode);
            if (id !== undefined) {
                if (dispatched[id]) {
                    return true;
                }
                dispatched[id] = true;
                if (specialEventData.nodeIdsRespondingToInsert[id]) {
                    domDispatch.call(mutatedNode, specialEventName, [], false);
                }
            }
        };
        events.addEventListener = function (eventName) {
            if (eventName === specialEventName && getMutationObserver()) {
                var documentElement = getDocument().documentElement;
                var specialEventData = domData.get.call(documentElement, specialEventName + 'Data');
                if (!specialEventData) {
                    specialEventData = {
                        handler: function (mutations) {
                            var dispatched = {};
                            mutations.forEach(function (mutation) {
                                each(mutation[mutationNodesProperty], function (mutatedNode) {
                                    var children = mutatedNode.getElementsByTagName && makeArray(mutatedNode.getElementsByTagName('*'));
                                    var alreadyChecked = dispatchIfListening(mutatedNode, specialEventData, dispatched);
                                    if (children && !alreadyChecked) {
                                        for (var j = 0, child; (child = children[j]) !== undefined; j++) {
                                            dispatchIfListening(child, specialEventData, dispatched);
                                        }
                                    }
                                });
                            });
                        },
                        nodeIdsRespondingToInsert: {}
                    };
                    mutationDocument.add(specialEventData.handler);
                    domData.set.call(documentElement, specialEventName + 'Data', specialEventData);
                }
                specialEventData.nodeIdsRespondingToInsert[domData.cid.call(this)] = true;
            }
            return originalAdd.apply(this, arguments);
        };
        events.removeEventListener = function (eventName) {
            if (eventName === specialEventName && getMutationObserver()) {
                var documentElement = getDocument().documentElement;
                var specialEventData = domData.get.call(documentElement, specialEventName + 'Data');
                if (specialEventData) {
                    delete specialEventData.nodeIdsRespondingToInsert[domData.getCid.call(this)];
                    if (isEmptyObject(specialEventData.nodeIdsRespondingToInsert)) {
                        mutationDocument.remove(specialEventData.handler);
                        domData.clean.call(documentElement, specialEventName + 'Data');
                    }
                }
            }
            return originalRemove.apply(this, arguments);
        };
    };
});
/*can-util@3.0.0-pre.22#dom/events/removed/removed*/
define('can-util/dom/events/removed/removed', function (require, exports, module) {
    var makeMutationEvent = require('can-util/dom/events/make-mutation-event/make-mutation-event');
    makeMutationEvent('removed', 'removedNodes');
});
/*can-view-live@3.0.0-pre.1#lib/core*/
define('can-view-live/lib/core', function (require, exports, module) {
    var parser = require('can-view-parser');
    var domEvents = require('can-util/dom/events/events');
    var nodeLists = require('can-view-nodelist');
    var makeFrag = require('can-util/dom/frag/frag');
    var childNodes = require('can-util/dom/child-nodes/child-nodes');
    require('can-util/dom/events/removed/removed');
    var childMutationCallbacks = {};
    var live = {
        setup: function (el, bind, unbind) {
            var tornDown = false, teardown = function () {
                    if (!tornDown) {
                        tornDown = true;
                        unbind(data);
                        domEvents.removeEventListener.call(el, 'removed', teardown);
                    }
                    return true;
                }, data = {
                    teardownCheck: function (parent) {
                        return parent ? false : teardown();
                    }
                };
            domEvents.addEventListener.call(el, 'removed', teardown);
            bind(data);
            return data;
        },
        listen: function (el, compute, change) {
            return live.setup(el, function () {
                compute.computeInstance.addEventListener('change', change);
            }, function (data) {
                compute.computeInstance.removeEventListener('change', change);
                if (data.nodeList) {
                    nodeLists.unregister(data.nodeList);
                }
            });
        },
        getAttributeParts: function (newVal) {
            var attrs = {}, attr;
            parser.parseAttrs(newVal, {
                attrStart: function (name) {
                    attrs[name] = '';
                    attr = name;
                },
                attrValue: function (value) {
                    attrs[attr] += value;
                },
                attrEnd: function () {
                }
            });
            return attrs;
        },
        isNode: function (obj) {
            return obj && obj.nodeType;
        },
        addTextNodeIfNoChildren: function (frag) {
            if (!frag.firstChild) {
                frag.appendChild(frag.ownerDocument.createTextNode(''));
            }
        },
        registerChildMutationCallback: function (tag, callback) {
            if (callback) {
                childMutationCallbacks[tag] = callback;
            } else {
                return childMutationCallbacks[tag];
            }
        },
        callChildMutationCallback: function (el) {
            var callback = el && childMutationCallbacks[el.nodeName.toLowerCase()];
            if (callback) {
                callback(el);
            }
        },
        replace: function (nodes, val, teardown) {
            var oldNodes = nodes.slice(0), frag = makeFrag(val);
            nodeLists.register(nodes, teardown);
            nodeLists.update(nodes, childNodes(frag));
            nodeLists.replace(oldNodes, frag);
            return nodes;
        },
        getParentNode: function (el, defaultParentNode) {
            return defaultParentNode && el.parentNode.nodeType === 11 ? defaultParentNode : el.parentNode;
        },
        makeString: function (txt) {
            return txt == null ? '' : '' + txt;
        }
    };
    module.exports = live;
});
/*can-util@3.0.0-pre.22#dom/events/attributes/attributes*/
define('can-util/dom/events/attributes/attributes', function (require, exports, module) {
    var events = require('can-util/dom/events/events');
    var isOfGlobalDocument = require('can-util/dom/is-of-global-document/is-of-global-document');
    var domData = require('can-util/dom/data/data');
    var getMutationObserver = require('can-util/dom/mutation-observer/mutation-observer');
    var assign = require('can-util/js/assign/assign');
    var domDispatch = require('can-util/dom/dispatch/dispatch');
    var originalAdd = events.addEventListener, originalRemove = events.removeEventListener;
    events.addEventListener = function (eventName) {
        if (eventName === 'attributes') {
            var MutationObserver = getMutationObserver();
            if (isOfGlobalDocument(this) && MutationObserver) {
                var self = this;
                var observer = new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        var copy = assign({}, mutation);
                        domDispatch.call(self, copy, [], false);
                    });
                });
                observer.observe(this, {
                    attributes: true,
                    attributeOldValue: true
                });
                domData.set.call(this, 'canAttributesObserver', observer);
            } else {
                domData.set.call(this, 'canHasAttributesBindings', true);
            }
        }
        return originalAdd.apply(this, arguments);
    };
    events.removeEventListener = function (eventName) {
        if (eventName === 'attributes') {
            var MutationObserver = getMutationObserver();
            if (isOfGlobalDocument(this) && MutationObserver) {
                domData.get.call(this, 'canAttributesObserver').disconnect();
                domData.clean.call(this, 'canAttributesObserver');
            } else {
                domData.clean.call(this, 'canHasAttributesBindings');
            }
        }
        return originalRemove.apply(this, arguments);
    };
});
/*can-util@3.0.0-pre.22#dom/attr/attr*/
define('can-util/dom/attr/attr', function (require, exports, module) {
    var setImmediate = require('can-util/js/set-immediate/set-immediate');
    var getDocument = require('can-util/dom/document/document');
    var global = require('can-util/js/global/global')();
    var isOfGlobalDocument = require('can-util/dom/is-of-global-document/is-of-global-document');
    var isArray = require('can-util/js/is-array/is-array');
    var setData = require('can-util/dom/data/data');
    var domDispatch = require('can-util/dom/dispatch/dispatch');
    var MUTATION_OBSERVER = require('can-util/dom/mutation-observer/mutation-observer');
    require('can-util/dom/events/attributes/attributes');
    var formElements = {
            'input': true,
            'textarea': true,
            'select': true
        }, hasProperty = function (el, attrName) {
            return attrName in el || getDocument() && formElements[el.nodeName.toLowerCase()];
        }, attr = {
            map: {
                'class': function (el, val) {
                    val = val || '';
                    if (el.namespaceURI === 'http://www.w3.org/2000/svg') {
                        el.setAttribute('class', val);
                    } else {
                        el.className = val;
                    }
                    return val;
                },
                'value': 'value',
                'innertext': 'innerText',
                'innerhtml': 'innerHTML',
                'textcontent': 'textContent',
                'for': 'htmlFor',
                'checked': true,
                'disabled': true,
                'readonly': function (el, val) {
                    el.readOnly = true;
                    return val;
                },
                'required': true,
                src: function (el, val) {
                    if (val == null || val === '') {
                        el.removeAttribute('src');
                        return null;
                    } else {
                        el.setAttribute('src', val);
                        return val;
                    }
                },
                style: function () {
                    var el = global.document && getDocument().createElement('div');
                    if (el && el.style && 'cssText' in el.style) {
                        return function (el, val) {
                            return el.style.cssText = val || '';
                        };
                    } else {
                        return function (el, val) {
                            return el.setAttribute('style', val);
                        };
                    }
                }()
            },
            defaultValue: [
                'input',
                'textarea'
            ],
            setAttrOrProp: function (el, attrName, val) {
                attrName = attrName.toLowerCase();
                var prop = attr.map[attrName];
                if (prop === true && !val) {
                    this.remove(el, attrName);
                } else {
                    this.set(el, attrName, val);
                }
            },
            setSelectValue: function (el, val) {
                if (val != null) {
                    var options = el.getElementsByTagName('option');
                    for (var i = 0; i < options.length; i++) {
                        if (val == options[i].value) {
                            options[i].selected = true;
                            return;
                        }
                    }
                }
                el.selectedIndex = -1;
            },
            set: function (el, attrName, val) {
                var usingMutationObserver = isOfGlobalDocument(el) && MUTATION_OBSERVER();
                attrName = attrName.toLowerCase();
                var oldValue;
                if (!usingMutationObserver) {
                    oldValue = attr.get(el, attrName);
                }
                var prop = attr.map[attrName], newValue;
                if (typeof prop === 'function') {
                    newValue = prop(el, val);
                } else if (prop === true && hasProperty(el, attrName)) {
                    newValue = el[attrName] = true;
                    if (attrName === 'checked' && el.type === 'radio') {
                        if (isArray((el.nodeName + '').toLowerCase(), attr.defaultValue) >= 0) {
                            el.defaultChecked = true;
                        }
                    }
                } else if (typeof prop === 'string' && hasProperty(el, prop)) {
                    newValue = val;
                    if (el[prop] !== val || el.nodeName.toUpperCase() === 'OPTION') {
                        el[prop] = val;
                    }
                    if (prop === 'value' && attr.defaultValue.indexOf((el.nodeName + '').toLowerCase()) >= 0) {
                        el.defaultValue = val;
                    }
                } else {
                    attr.setAttribute(el, attrName, val);
                }
                if (!usingMutationObserver && newValue !== oldValue) {
                    attr.trigger(el, attrName, oldValue);
                }
            },
            setAttribute: function () {
                var doc = getDocument();
                if (doc && document.createAttribute) {
                    try {
                        doc.createAttribute('{}');
                    } catch (e) {
                        var invalidNodes = {}, attributeDummy = document.createElement('div');
                        return function (el, attrName, val) {
                            var first = attrName.charAt(0), cachedNode, node;
                            if ((first === '{' || first === '(' || first === '*') && el.setAttributeNode) {
                                cachedNode = invalidNodes[attrName];
                                if (!cachedNode) {
                                    attributeDummy.innerHTML = '<div ' + attrName + '=""></div>';
                                    cachedNode = invalidNodes[attrName] = attributeDummy.childNodes[0].attributes[0];
                                }
                                node = cachedNode.cloneNode();
                                node.value = val;
                                el.setAttributeNode(node);
                            } else {
                                el.setAttribute(attrName, val);
                            }
                        };
                    }
                }
                return function (el, attrName, val) {
                    el.setAttribute(attrName, val);
                };
            }(),
            trigger: function (el, attrName, oldValue) {
                if (setData.get.call(el, 'canHasAttributesBindings')) {
                    attrName = attrName.toLowerCase();
                    return setImmediate(function () {
                        domDispatch.call(el, {
                            type: 'attributes',
                            attributeName: attrName,
                            target: el,
                            oldValue: oldValue,
                            bubbles: false
                        }, []);
                    });
                }
            },
            get: function (el, attrName) {
                attrName = attrName.toLowerCase();
                var prop = attr.map[attrName];
                if (typeof prop === 'string' && hasProperty(el, prop)) {
                    return el[prop];
                } else if (prop === true && hasProperty(el, attrName)) {
                    return el[attrName];
                }
                return el.getAttribute(attrName);
            },
            remove: function (el, attrName) {
                attrName = attrName.toLowerCase();
                var oldValue;
                if (!MUTATION_OBSERVER()) {
                    oldValue = attr.get(el, attrName);
                }
                var setter = attr.map[attrName];
                if (typeof setter === 'function') {
                    setter(el, undefined);
                }
                if (setter === true && hasProperty(el, attrName)) {
                    el[attrName] = false;
                } else if (typeof setter === 'string' && hasProperty(el, setter)) {
                    el[setter] = '';
                } else {
                    el.removeAttribute(attrName);
                }
                if (!MUTATION_OBSERVER() && oldValue != null) {
                    attr.trigger(el, attrName, oldValue);
                }
            },
            has: function () {
                var el = getDocument() && document.createElement('div');
                if (el && el.hasAttribute) {
                    return function (el, name) {
                        return el.hasAttribute(name);
                    };
                } else {
                    return function (el, name) {
                        return el.getAttribute(name) !== null;
                    };
                }
            }()
        };
    module.exports = exports = attr;
});
/*can-view-live@3.0.0-pre.1#lib/attr*/
define('can-view-live/lib/attr', function (require, exports, module) {
    var attr = require('can-util/dom/attr/attr');
    var live = require('can-view-live/lib/core');
    live.attr = function (el, attributeName, compute) {
        live.listen(el, compute, function (ev, newVal) {
            attr.set(el, attributeName, newVal);
        });
        attr.set(el, attributeName, compute());
    };
});
/*can-view-callbacks@3.0.0-pre.2#can-view-callbacks*/
define('can-view-callbacks', function (require, exports, module) {
    var ObserveInfo = require('can-observe-info');
    var dev = require('can-util/js/dev/dev');
    var getGlobal = require('can-util/js/global/global');
    var domMutate = require('can-util/dom/mutate/mutate');
    var namespace = require('can-util/namespace');
    var attr = function (attributeName, attrHandler) {
        if (attrHandler) {
            if (typeof attributeName === 'string') {
                attributes[attributeName] = attrHandler;
            } else {
                regExpAttributes.push({
                    match: attributeName,
                    handler: attrHandler
                });
            }
        } else {
            var cb = attributes[attributeName];
            if (!cb) {
                for (var i = 0, len = regExpAttributes.length; i < len; i++) {
                    var attrMatcher = regExpAttributes[i];
                    if (attrMatcher.match.test(attributeName)) {
                        cb = attrMatcher.handler;
                        break;
                    }
                }
            }
            return cb;
        }
    };
    var attributes = {}, regExpAttributes = [], automaticCustomElementCharacters = /[-\:]/;
    var tag = function (tagName, tagHandler) {
        if (tagHandler) {
            if (getGlobal().html5) {
                getGlobal().html5.elements += ' ' + tagName;
                getGlobal().html5.shivDocument();
            }
            tags[tagName.toLowerCase()] = tagHandler;
        } else {
            var cb = tags[tagName.toLowerCase()];
            if (!cb && automaticCustomElementCharacters.test(tagName)) {
                cb = function () {
                };
            }
            return cb;
        }
    };
    var tags = {};
    var callbacks = {
        _tags: tags,
        _attributes: attributes,
        _regExpAttributes: regExpAttributes,
        tag: tag,
        attr: attr,
        tagHandler: function (el, tagName, tagData) {
            var helperTagCallback = tagData.options.get('tags.' + tagName, { proxyMethods: false }), tagCallback = helperTagCallback || tags[tagName];
            var scope = tagData.scope, res;
            if (tagCallback) {
                res = ObserveInfo.notObserve(tagCallback)(el, tagData);
            } else {
                res = scope;
            }
            if (res && tagData.subtemplate) {
                if (scope !== res) {
                    scope = scope.add(res);
                }
                var result = tagData.subtemplate(scope, tagData.options);
                var frag = typeof result === 'string' ? can.view.frag(result) : result;
                domMutate.appendChild.call(el, frag);
            }
        }
    };
    namespace.view = namespace.view || {};
    module.exports = namespace.view.callback = callbacks;
});
/*can-view-live@3.0.0-pre.1#lib/attrs*/
define('can-view-live/lib/attrs', function (require, exports, module) {
    var live = require('can-view-live/lib/core');
    var viewCallbacks = require('can-view-callbacks');
    var attr = require('can-util/dom/attr/attr');
    var domEvents = require('can-util/dom/events/events');
    var types = require('can-util/js/types/types');
    live.attrs = function (el, compute, scope, options) {
        if (!types.isCompute(compute)) {
            var attrs = live.getAttributeParts(compute);
            for (var name in attrs) {
                attr.set(el, name, attrs[name]);
            }
            return;
        }
        var oldAttrs = {};
        var setAttrs = function (newVal) {
            var newAttrs = live.getAttributeParts(newVal), name;
            for (name in newAttrs) {
                var newValue = newAttrs[name], oldValue = oldAttrs[name];
                if (newValue !== oldValue) {
                    attr.set(el, name, newValue);
                    var callback = viewCallbacks.attr(name);
                    if (callback) {
                        callback(el, {
                            attributeName: name,
                            scope: scope,
                            options: options
                        });
                    }
                }
                delete oldAttrs[name];
            }
            for (name in oldAttrs) {
                attr.remove(el, name);
            }
            oldAttrs = newAttrs;
        };
        var handler = function (ev, newVal) {
            setAttrs(newVal);
        };
        compute.addEventListener('change', handler);
        domEvents.addEventListener.call(el, 'removed', function () {
            compute.removeEventListener('change', handler);
        });
        setAttrs(compute());
    };
});
/*can-view-live@3.0.0-pre.1#lib/html*/
define('can-view-live/lib/html', function (require, exports, module) {
    var live = require('can-view-live/lib/core');
    var nodeLists = require('can-view-nodelist');
    var makeFrag = require('can-util/dom/frag/frag');
    var makeArray = require('can-util/js/make-array/make-array');
    var childNodes = require('can-util/dom/child-nodes/child-nodes');
    live.html = function (el, compute, parentNode, nodeList) {
        var data;
        parentNode = live.getParentNode(el, parentNode);
        data = live.listen(parentNode, compute, function (ev, newVal, oldVal) {
            var attached = nodeLists.first(nodes).parentNode;
            if (attached) {
                makeAndPut(newVal);
            }
            var pn = nodeLists.first(nodes).parentNode;
            data.teardownCheck(pn);
            live.callChildMutationCallback(pn);
        });
        var nodes = nodeList || [el], makeAndPut = function (val) {
                var isFunction = typeof val === 'function', aNode = live.isNode(val), frag = makeFrag(isFunction ? '' : val), oldNodes = makeArray(nodes);
                live.addTextNodeIfNoChildren(frag);
                oldNodes = nodeLists.update(nodes, childNodes(frag));
                if (isFunction) {
                    val(frag.firstChild);
                }
                nodeLists.replace(oldNodes, frag);
            };
        data.nodeList = nodes;
        if (!nodeList) {
            nodeLists.register(nodes, data.teardownCheck);
        } else {
            nodeList.unregistered = data.teardownCheck;
        }
        makeAndPut(compute());
    };
});
/*can-util@3.0.0-pre.22#js/diff/diff*/
define('can-util/js/diff/diff', function (require, exports, module) {
    var slice = [].slice;
    module.exports = exports = function (oldList, newList) {
        var oldIndex = 0, newIndex = 0, oldLength = oldList.length, newLength = newList.length, patches = [];
        while (oldIndex < oldLength && newIndex < newLength) {
            var oldItem = oldList[oldIndex], newItem = newList[newIndex];
            if (oldItem === newItem) {
                oldIndex++;
                newIndex++;
                continue;
            }
            if (newIndex + 1 < newLength && newList[newIndex + 1] === oldItem) {
                patches.push({
                    index: newIndex,
                    deleteCount: 0,
                    insert: [newList[newIndex]]
                });
                oldIndex++;
                newIndex += 2;
                continue;
            } else if (oldIndex + 1 < oldLength && oldList[oldIndex + 1] === newItem) {
                patches.push({
                    index: newIndex,
                    deleteCount: 1,
                    insert: []
                });
                oldIndex += 2;
                newIndex++;
                continue;
            } else {
                patches.push({
                    index: newIndex,
                    deleteCount: oldLength - oldIndex,
                    insert: slice.call(newList, newIndex)
                });
                return patches;
            }
        }
        if (newIndex === newLength && oldIndex === oldLength) {
            return patches;
        }
        patches.push({
            index: newIndex,
            deleteCount: oldLength - oldIndex,
            insert: slice.call(newList, newIndex)
        });
        return patches;
    };
});
/*can-view-live@3.0.0-pre.1#lib/list*/
define('can-view-live/lib/list', function (require, exports, module) {
    var live = require('can-view-live/lib/core');
    var nodeLists = require('can-view-nodelist');
    var makeCompute = require('can-compute');
    var canBatch = require('can-event/batch/batch');
    var frag = require('can-util/dom/frag/frag');
    var domMutate = require('can-util/dom/mutate/mutate');
    var childNodes = require('can-util/dom/child-nodes/child-nodes');
    var makeArray = require('can-util/js/make-array/make-array');
    var each = require('can-util/js/each/each');
    var isFunction = require('can-util/js/is-function/is-function');
    var diff = require('can-util/js/diff/diff');
    var splice = [].splice;
    var renderAndAddToNodeLists = function (newNodeLists, parentNodeList, render, context, args) {
            var itemNodeList = [];
            if (parentNodeList) {
                nodeLists.register(itemNodeList, null, parentNodeList, true);
                itemNodeList.parentList = parentNodeList;
                itemNodeList.expression = '#each SUBEXPRESSION';
            }
            var itemHTML = render.apply(context, args.concat([itemNodeList])), itemFrag = frag(itemHTML);
            var children = makeArray(childNodes(itemFrag));
            if (parentNodeList) {
                nodeLists.update(itemNodeList, children);
                newNodeLists.push(itemNodeList);
            } else {
                newNodeLists.push(nodeLists.register(children));
            }
            return itemFrag;
        }, removeFromNodeList = function (masterNodeList, index, length) {
            var removedMappings = masterNodeList.splice(index + 1, length), itemsToRemove = [];
            each(removedMappings, function (nodeList) {
                var nodesToRemove = nodeLists.unregister(nodeList);
                [].push.apply(itemsToRemove, nodesToRemove);
            });
            return itemsToRemove;
        }, addFalseyIfEmpty = function (list, falseyRender, masterNodeList, nodeList) {
            if (falseyRender && list.length === 0) {
                var falseyNodeLists = [];
                var falseyFrag = renderAndAddToNodeLists(falseyNodeLists, nodeList, falseyRender, list, [list]);
                nodeLists.after([masterNodeList[0]], falseyFrag);
                masterNodeList.push(falseyNodeLists[0]);
            }
        };
    live.list = function (el, compute, render, context, parentNode, nodeList, falseyRender) {
        var masterNodeList = nodeList || [el], indexMap = [], afterPreviousEvents = false, isTornDown = false, add = function (ev, items, index) {
                if (!afterPreviousEvents) {
                    return;
                }
                var frag = text.ownerDocument.createDocumentFragment(), newNodeLists = [], newIndicies = [];
                each(items, function (item, key) {
                    var itemIndex = makeCompute(key + index), itemFrag = renderAndAddToNodeLists(newNodeLists, nodeList, render, context, [
                            item,
                            itemIndex
                        ]);
                    frag.appendChild(itemFrag);
                    newIndicies.push(itemIndex);
                });
                var masterListIndex = index + 1;
                if (!indexMap.length) {
                    var falseyItemsToRemove = removeFromNodeList(masterNodeList, 0, masterNodeList.length - 1);
                    nodeLists.remove(falseyItemsToRemove);
                }
                if (!masterNodeList[masterListIndex]) {
                    nodeLists.after(masterListIndex === 1 ? [text] : [nodeLists.last(masterNodeList[masterListIndex - 1])], frag);
                } else {
                    var el = nodeLists.first(masterNodeList[masterListIndex]);
                    domMutate.insertBefore.call(el.parentNode, frag, el);
                }
                splice.apply(masterNodeList, [
                    masterListIndex,
                    0
                ].concat(newNodeLists));
                splice.apply(indexMap, [
                    index,
                    0
                ].concat(newIndicies));
                for (var i = index + newIndicies.length, len = indexMap.length; i < len; i++) {
                    indexMap[i](i);
                }
                if (ev.callChildMutationCallback !== false) {
                    live.callChildMutationCallback(text.parentNode);
                }
            }, set = function (ev, newVal, index) {
                remove({}, { length: 1 }, index, true);
                add({}, [newVal], index);
            }, remove = function (ev, items, index, duringTeardown, fullTeardown) {
                if (!afterPreviousEvents) {
                    return;
                }
                if (!duringTeardown && data.teardownCheck(text.parentNode)) {
                    return;
                }
                if (index < 0) {
                    index = indexMap.length + index;
                }
                var itemsToRemove = removeFromNodeList(masterNodeList, index, items.length);
                indexMap.splice(index, items.length);
                for (var i = index, len = indexMap.length; i < len; i++) {
                    indexMap[i](i);
                }
                if (!fullTeardown) {
                    addFalseyIfEmpty(list, falseyRender, masterNodeList, nodeList);
                    nodeLists.remove(itemsToRemove);
                    if (ev.callChildMutationCallback !== false) {
                        live.callChildMutationCallback(text.parentNode);
                    }
                } else {
                    nodeLists.unregister(masterNodeList);
                }
            }, move = function (ev, item, newIndex, currentIndex) {
                if (!afterPreviousEvents) {
                    return;
                }
                newIndex = newIndex + 1;
                currentIndex = currentIndex + 1;
                var referenceNodeList = masterNodeList[newIndex];
                var movedElements = frag(nodeLists.flatten(masterNodeList[currentIndex]));
                var referenceElement;
                if (currentIndex < newIndex) {
                    referenceElement = nodeLists.last(referenceNodeList).nextSibling;
                } else {
                    referenceElement = nodeLists.first(referenceNodeList);
                }
                var parentNode = masterNodeList[0].parentNode;
                parentNode.insertBefore(movedElements, referenceElement);
                var temp = masterNodeList[currentIndex];
                [].splice.apply(masterNodeList, [
                    currentIndex,
                    1
                ]);
                [].splice.apply(masterNodeList, [
                    newIndex,
                    0,
                    temp
                ]);
                newIndex = newIndex - 1;
                currentIndex = currentIndex - 1;
                var indexCompute = indexMap[currentIndex];
                [].splice.apply(indexMap, [
                    currentIndex,
                    1
                ]);
                [].splice.apply(indexMap, [
                    newIndex,
                    0,
                    indexCompute
                ]);
                var i = Math.min(currentIndex, newIndex);
                var len = indexMap.length;
                for (i, len; i < len; i++) {
                    indexMap[i](i);
                }
                if (ev.callChildMutationCallback !== false) {
                    live.callChildMutationCallback(text.parentNode);
                }
            }, text = el.ownerDocument.createTextNode(''), list, teardownList = function (fullTeardown) {
                if (list && list.removeEventListener) {
                    list.removeEventListener('add', add);
                    list.removeEventListener('set', set);
                    list.removeEventListener('remove', remove);
                    list.removeEventListener('move', move);
                }
                remove({ callChildMutationCallback: !!fullTeardown }, { length: masterNodeList.length - 1 }, 0, true, fullTeardown);
            }, updateList = function (ev, newList, oldList) {
                if (isTornDown) {
                    return;
                }
                afterPreviousEvents = true;
                if (newList && oldList) {
                    list = newList || [];
                    var patches = diff(oldList, newList);
                    if (oldList.removeEventListener) {
                        oldList.removeEventListener('add', add);
                        oldList.removeEventListener('set', set);
                        oldList.removeEventListener('remove', remove);
                        oldList.removeEventListener('move', move);
                    }
                    for (var i = 0, patchLen = patches.length; i < patchLen; i++) {
                        var patch = patches[i];
                        if (patch.deleteCount) {
                            remove({ callChildMutationCallback: false }, { length: patch.deleteCount }, patch.index, true);
                        }
                        if (patch.insert.length) {
                            add({ callChildMutationCallback: false }, patch.insert, patch.index);
                        }
                    }
                } else {
                    if (oldList) {
                        teardownList();
                    }
                    list = newList || [];
                    add({ callChildMutationCallback: false }, list, 0);
                    addFalseyIfEmpty(list, falseyRender, masterNodeList, nodeList);
                }
                live.callChildMutationCallback(text.parentNode);
                afterPreviousEvents = false;
                if (list.addEventListener) {
                    list.addEventListener('add', add);
                    list.addEventListener('set', set);
                    list.addEventListener('remove', remove);
                    list.addEventListener('move', move);
                }
                canBatch.afterPreviousEvents(function () {
                    afterPreviousEvents = true;
                });
            };
        parentNode = live.getParentNode(el, parentNode);
        var data = live.setup(parentNode, function () {
            if (isFunction(compute)) {
                compute.addEventListener('change', updateList);
            }
        }, function () {
            if (isFunction(compute)) {
                compute.removeEventListener('change', updateList);
            }
            teardownList(true);
        });
        if (!nodeList) {
            live.replace(masterNodeList, text, data.teardownCheck);
        } else {
            nodeLists.replace(masterNodeList, text);
            nodeLists.update(masterNodeList, [text]);
            nodeList.unregistered = function () {
                data.teardownCheck();
                isTornDown = true;
            };
        }
        updateList({}, isFunction(compute) ? compute() : compute);
    };
});
/*can-view-live@3.0.0-pre.1#lib/text*/
define('can-view-live/lib/text', function (require, exports, module) {
    var live = require('can-view-live/lib/core');
    var nodeLists = require('can-view-nodelist');
    live.text = function (el, compute, parentNode, nodeList) {
        var parent = live.getParentNode(el, parentNode);
        var data = live.listen(parent, compute, function (ev, newVal, oldVal) {
            if (typeof node.nodeValue !== 'unknown') {
                node.nodeValue = live.makeString(newVal);
            }
            data.teardownCheck(node.parentNode);
        });
        var node = el.ownerDocument.createTextNode(live.makeString(compute()));
        if (nodeList) {
            nodeList.unregistered = data.teardownCheck;
            data.nodeList = nodeList;
            nodeLists.update(nodeList, [node]);
            nodeLists.replace([el], node);
        } else {
            data.nodeList = live.replace([el], node, data.teardownCheck);
        }
    };
});
/*can-view-live@3.0.0-pre.1#can-view-live*/
define('can-view-live', function (require, exports, module) {
    var live = require('can-view-live/lib/core');
    require('can-view-live/lib/attr');
    require('can-view-live/lib/attrs');
    require('can-view-live/lib/html');
    require('can-view-live/lib/list');
    require('can-view-live/lib/text');
    module.exports = live;
});
/*can-stache@3.0.0-pre.6#helpers/core*/
define('can-stache/helpers/core', function (require, exports, module) {
    var live = require('can-view-live');
    var nodeLists = require('can-view-nodelist');
    var compute = require('can-compute');
    var utils = require('can-stache/src/utils');
    var types = require('can-util/js/types/types');
    var isFunction = require('can-util/js/is-function/is-function');
    var each = require('can-util/js/each/each');
    var assign = require('can-util/js/assign/assign');
    var domData = require('can-util/dom/data/data');
    var resolve = function (value) {
        if (types.isListLike(value) && value.attr('length')) {
            return value;
        } else if (isFunction(value)) {
            return value();
        } else {
            return value;
        }
    };
    var resolveHash = function (hash) {
        var params = {};
        for (var prop in hash) {
            var value = hash[prop];
            if (value && value.isComputed) {
                params[prop] = value();
            } else {
                params[prop] = value;
            }
        }
        return params;
    };
    var helpers = {
        'each': function (items, options) {
            var resolved = resolve(items), result = [], keys, key, i;
            if (types.isListLike(resolved)) {
                return function (el) {
                    var nodeList = [el];
                    nodeList.expression = 'live.list';
                    nodeLists.register(nodeList, null, options.nodeList, true);
                    nodeLists.update(options.nodeList, [el]);
                    var cb = function (item, index, parentNodeList) {
                        return options.fn(options.scope.add({
                            '%index': index,
                            '@index': index
                        }, { notContext: true }).add(item), options.options, parentNodeList);
                    };
                    live.list(el, items, cb, options.context, el.parentNode, nodeList, function (list, parentNodeList) {
                        return options.inverse(options.scope.add(list), options.options, parentNodeList);
                    });
                };
            }
            var expr = resolved;
            if (!!expr && utils.isArrayLike(expr)) {
                for (i = 0; i < expr.length; i++) {
                    result.push(options.fn(options.scope.add({
                        '%index': i,
                        '@index': i
                    }, { notContext: true }).add(expr[i])));
                }
            } else if (types.isMapLike(expr)) {
                keys = expr.constructor.keys(expr);
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    result.push(options.fn(options.scope.add({
                        '%key': key,
                        '@key': key
                    }, { notContext: true }).add(expr[key])));
                }
            } else if (expr instanceof Object) {
                for (key in expr) {
                    result.push(options.fn(options.scope.add({
                        '%key': key,
                        '@key': key
                    }, { notContext: true }).add(expr[key])));
                }
            }
            return result;
        },
        '@index': function (offset, options) {
            if (!options) {
                options = offset;
                offset = 0;
            }
            var index = options.scope.attr('@index');
            return '' + ((isFunction(index) ? index() : index) + offset);
        },
        'if': function (expr, options) {
            var value;
            if (isFunction(expr)) {
                value = compute.truthy(expr)();
            } else {
                value = !!resolve(expr);
            }
            if (value) {
                return options.fn(options.scope || this);
            } else {
                return options.inverse(options.scope || this);
            }
        },
        'is': function () {
            var lastValue, curValue, options = arguments[arguments.length - 1];
            if (arguments.length - 2 <= 0) {
                return options.inverse();
            }
            var args = arguments;
            var callFn = compute(function () {
                for (var i = 0; i < args.length - 1; i++) {
                    curValue = resolve(args[i]);
                    curValue = isFunction(curValue) ? curValue() : curValue;
                    if (i > 0) {
                        if (curValue !== lastValue) {
                            return false;
                        }
                    }
                    lastValue = curValue;
                }
                return true;
            });
            return callFn() ? options.fn() : options.inverse();
        },
        'eq': function () {
            return helpers.is.apply(this, arguments);
        },
        'unless': function (expr, options) {
            return helpers['if'].apply(this, [
                expr,
                assign(assign({}, options), {
                    fn: options.inverse,
                    inverse: options.fn
                })
            ]);
        },
        'with': function (expr, options) {
            var ctx = expr;
            expr = resolve(expr);
            if (!!expr) {
                return options.fn(ctx);
            }
        },
        'log': function (expr, options) {
            if (typeof console !== 'undefined' && console.log) {
                if (!options) {
                    console.log(expr.context);
                } else {
                    console.log(expr, options.context);
                }
            }
        },
        'data': function (attr) {
            var data = arguments.length === 2 ? this : arguments[1];
            return function (el) {
                domData.set.call(el, attr, data || this.context);
            };
        },
        'switch': function (expression, options) {
            resolve(expression);
            var found = false;
            var newOptions = options.helpers.add({
                'case': function (value, options) {
                    if (!found && resolve(expression) === resolve(value)) {
                        found = true;
                        return options.fn(options.scope || this);
                    }
                },
                'default': function (options) {
                    if (!found) {
                        return options.fn(options.scope || this);
                    }
                }
            });
            return options.fn(options.scope, newOptions);
        }
    };
    helpers.eachOf = helpers.each;
    var registerHelper = function (name, callback) {
        helpers[name] = callback;
    };
    var makeSimpleHelper = function (fn) {
        return function () {
            var realArgs = [];
            each(arguments, function (val, i) {
                if (i <= arguments.length) {
                    while (val && val.isComputed) {
                        val = val();
                    }
                    realArgs.push(val);
                }
            });
            return fn.apply(this, realArgs);
        };
    };
    module.exports = {
        registerHelper: registerHelper,
        registerSimpleHelper: function (name, callback) {
            registerHelper(name, makeSimpleHelper(callback));
        },
        getHelper: function (name, options) {
            var helper = options && options.get('helpers.' + name, { proxyMethods: false });
            if (!helper) {
                helper = helpers[name];
            }
            if (helper) {
                return { fn: helper };
            }
        },
        resolve: resolve,
        resolveHash: resolveHash
    };
});
/*can-stache@3.0.0-pre.6#src/expression*/
define('can-stache/src/expression', function (require, exports, module) {
    var Scope = require('can-view-scope');
    var compute = require('can-compute');
    var utils = require('can-stache/src/utils');
    var mustacheHelpers = require('can-stache/helpers/core');
    var each = require('can-util/js/each/each');
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    var dev = require('can-util/js/dev/dev');
    var assign = require('can-util/js/assign/assign');
    var last = require('can-util/js/last/last');
    var getKeyComputeData = function (key, scope, readOptions) {
            var data = scope.computeData(key, readOptions);
            compute.temporarilyBind(data.compute);
            return data;
        }, lookupValue = function (key, scope, helperOptions, readOptions) {
            var computeData = getKeyComputeData(key, scope, readOptions);
            if (!computeData.compute.computeInstance.hasDependencies) {
                return {
                    value: computeData.initialValue,
                    computeData: computeData
                };
            } else {
                return {
                    value: computeData.compute,
                    computeData: computeData
                };
            }
        }, lookupValueOrHelper = function (key, scope, helperOptions, readOptions) {
            var res = lookupValue(key, scope, helperOptions, readOptions);
            if (res.computeData.initialValue === undefined) {
                if (key.charAt(0) === '@' && key !== '@index') {
                    key = key.substr(1);
                }
                var helper = mustacheHelpers.getHelper(key, helperOptions);
                res.helper = helper && helper.fn;
            }
            return res;
        }, convertToArgExpression = function (expr) {
            if (!(expr instanceof Arg) && !(expr instanceof Literal)) {
                return new Arg(expr);
            } else {
                return expr;
            }
        };
    var Literal = function (value) {
        this._value = value;
    };
    Literal.prototype.value = function () {
        return this._value;
    };
    var Lookup = function (key, root) {
        this.key = key;
        this.rootExpr = root;
    };
    Lookup.prototype.value = function (scope, helperOptions) {
        var result = lookupValueOrHelper(this.key, scope, helperOptions);
        this.isHelper = result.helper && !result.helper.callAsMethod;
        return result.helper || result.value;
    };
    var ScopeLookup = function (key, root) {
        Lookup.apply(this, arguments);
    };
    ScopeLookup.prototype.value = function (scope, helperOptions) {
        return lookupValue(this.key, scope, helperOptions).value;
    };
    var Arg = function (expression, modifiers) {
        this.expr = expression;
        this.modifiers = modifiers || {};
        this.isCompute = false;
    };
    Arg.prototype.value = function () {
        return this.expr.value.apply(this.expr, arguments);
    };
    var Hash = function () {
    };
    var Call = function (methodExpression, argExpressions, hashExpressions) {
        this.methodExpr = methodExpression;
        this.argExprs = argExpressions.map(convertToArgExpression);
        var hashExprs = this.hashExprs = {};
        each(hashExpressions, function (expr, name) {
            hashExprs[name] = convertToArgExpression(expr);
        });
    };
    Call.prototype.args = function (scope, helperOptions) {
        var args = [];
        for (var i = 0, len = this.argExprs.length; i < len; i++) {
            var arg = this.argExprs[i];
            var value = arg.value.apply(arg, arguments);
            args.push({
                call: value && value.isComputed && !arg.modifiers.compute,
                value: value
            });
        }
        return function () {
            var finalArgs = [];
            for (var i = 0, len = args.length; i < len; i++) {
                finalArgs[i] = args[i].call ? args[i].value() : args[i].value;
            }
            return finalArgs;
        };
    };
    Call.prototype.hash = function (scope, helperOptions) {
        var hash = {};
        for (var prop in this.hashExprs) {
            var val = this.hashExprs[prop], value = val.value.apply(val, arguments);
            hash[prop] = {
                call: value && value.isComputed && !val.modifiers.compute,
                value: value
            };
        }
        return function () {
            var finalHash = {};
            for (var prop in hash) {
                finalHash[prop] = hash[prop].call ? hash[prop].value() : hash[prop].value;
            }
            return finalHash;
        };
    };
    Call.prototype.value = function (scope, helperScope, helperOptions) {
        var method = this.methodExpr.value(scope, helperScope);
        this.isHelper = this.methodExpr.isHelper;
        var hasHash = !isEmptyObject(this.hashExprs), getArgs = this.args(scope, helperScope), getHash = this.hash(scope, helperScope);
        return compute(function (newVal) {
            var func = method;
            if (func && func.isComputed) {
                func = func();
            }
            if (typeof func === 'function') {
                var args = getArgs();
                if (hasHash) {
                    args.push(getHash());
                }
                if (helperOptions) {
                    args.push(helperOptions);
                }
                if (arguments.length) {
                    args.unshift(new expression.SetIdentifier(newVal));
                }
                return func.apply(null, args);
            }
        });
    };
    var HelperLookup = function () {
        Lookup.apply(this, arguments);
    };
    HelperLookup.prototype.value = function (scope, helperOptions) {
        var result = lookupValueOrHelper(this.key, scope, helperOptions, {
            isArgument: true,
            args: [
                scope.attr('.'),
                scope
            ]
        });
        return result.helper || result.value;
    };
    var HelperScopeLookup = function () {
        Lookup.apply(this, arguments);
    };
    HelperScopeLookup.prototype.value = function (scope, helperOptions) {
        return lookupValue(this.key, scope, helperOptions, {
            callMethodsOnObservables: true,
            isArgument: true,
            args: [
                scope.attr('.'),
                scope
            ]
        }).value;
    };
    var Helper = function (methodExpression, argExpressions, hashExpressions) {
        this.methodExpr = methodExpression;
        this.argExprs = argExpressions;
        this.hashExprs = hashExpressions;
        this.mode = null;
    };
    Helper.prototype.args = function (scope, helperOptions) {
        var args = [];
        for (var i = 0, len = this.argExprs.length; i < len; i++) {
            var arg = this.argExprs[i];
            args.push(arg.value.apply(arg, arguments));
        }
        return args;
    };
    Helper.prototype.hash = function (scope, helperOptions) {
        var hash = {};
        for (var prop in this.hashExprs) {
            var val = this.hashExprs[prop];
            hash[prop] = val.value.apply(val, arguments);
        }
        return hash;
    };
    Helper.prototype.helperAndValue = function (scope, helperOptions) {
        var looksLikeAHelper = this.argExprs.length || !isEmptyObject(this.hashExprs), helper, value, methodKey = this.methodExpr instanceof Literal ? '' + this.methodExpr._value : this.methodExpr.key, initialValue, args;
        if (looksLikeAHelper) {
            helper = mustacheHelpers.getHelper(methodKey, helperOptions);
            var context = scope.attr('.');
            if (!helper && typeof context[methodKey] === 'function') {
                helper = { fn: context[methodKey] };
            }
        }
        if (!helper) {
            args = this.args(scope, helperOptions);
            var computeData = getKeyComputeData(methodKey, scope, {
                    isArgument: false,
                    args: args && args.length ? args : [
                        scope.attr('.'),
                        scope
                    ]
                }), compute = computeData.compute;
            initialValue = computeData.initialValue;
            if (computeData.compute.computeInstance.hasDependencies) {
                value = compute;
            } else {
                value = initialValue;
            }
            if (!looksLikeAHelper && initialValue === undefined) {
                helper = mustacheHelpers.getHelper(methodKey, helperOptions);
            }
        }
        return {
            value: value,
            args: args,
            helper: helper && helper.fn
        };
    };
    Helper.prototype.evaluator = function (helper, scope, helperOptions, readOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly) {
        var helperOptionArg = {
                fn: function () {
                },
                inverse: function () {
                }
            }, context = scope.attr('.'), args = this.args(scope, helperOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly), hash = this.hash(scope, helperOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);
        utils.convertToScopes(helperOptionArg, scope, helperOptions, nodeList, truthyRenderer, falseyRenderer);
        assign(helperOptionArg, {
            context: context,
            scope: scope,
            contexts: scope,
            hash: hash,
            nodeList: nodeList,
            exprData: this,
            helperOptions: helperOptions,
            helpers: helperOptions
        });
        args.push(helperOptionArg);
        return function () {
            return helper.apply(context, args);
        };
    };
    Helper.prototype.value = function (scope, helperOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly) {
        var helperAndValue = this.helperAndValue(scope, helperOptions);
        var helper = helperAndValue.helper;
        if (!helper) {
            return helperAndValue.value;
        }
        var fn = this.evaluator(helper, scope, helperOptions, nodeList, truthyRenderer, falseyRenderer, stringOnly);
        var computeValue = compute(fn);
        compute.temporarilyBind(computeValue);
        if (!computeValue.computeInstance.hasDependencies) {
            return computeValue();
        } else {
            return computeValue;
        }
    };
    var keyRegExp = /[\w\.\\\-_@\/\&%]+/, tokensRegExp = /('.*?'|".*?"|=|[\w\.\\\-_@\/*%\$]+|[\(\)]|,|\~)/g, literalRegExp = /^('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false|null|undefined)$/;
    var isTokenKey = function (token) {
        return keyRegExp.test(token);
    };
    var testDot = /^[\.@]\w/;
    var isAddingToExpression = function (token) {
        return isTokenKey(token) && testDot.test(token);
    };
    var ensureChildren = function (type) {
        if (!type.children) {
            type.children = [];
        }
        return type;
    };
    var Stack = function () {
        this.root = {
            children: [],
            type: 'Root'
        };
        this.current = this.root;
        this.stack = [this.root];
    };
    assign(Stack.prototype, {
        top: function () {
            return last(this.stack);
        },
        isRootTop: function () {
            return this.top() === this.root;
        },
        popTo: function (types) {
            this.popUntil(types);
            if (!this.isRootTop()) {
                this.stack.pop();
            }
        },
        firstParent: function (types) {
            var curIndex = this.stack.length - 2;
            while (curIndex > 0 && types.indexOf(this.stack[curIndex].type) === -1) {
                curIndex--;
            }
            return this.stack[curIndex];
        },
        popUntil: function (types) {
            while (types.indexOf(this.top().type) === -1 && !this.isRootTop()) {
                this.stack.pop();
            }
            return this.top();
        },
        addTo: function (types, type) {
            var cur = this.popUntil(types);
            ensureChildren(cur).children.push(type);
        },
        addToAndPush: function (types, type) {
            this.addTo(types, type);
            this.stack.push(type);
        },
        topLastChild: function () {
            return last(this.top().children);
        },
        replaceTopLastChild: function (type) {
            var children = ensureChildren(this.top()).children;
            children.pop();
            children.push(type);
            return type;
        },
        replaceTopLastChildAndPush: function (type) {
            this.replaceTopLastChild(type);
            this.stack.push(type);
        },
        replaceTopAndPush: function (type) {
            var children;
            if (this.top() === this.root) {
                children = ensureChildren(this.top()).children;
            } else {
                this.stack.pop();
                children = ensureChildren(this.top()).children;
            }
            children.pop();
            children.push(type);
            this.stack.push(type);
            return type;
        }
    });
    var convertKeyToLookup = function (key) {
        var lastPath = key.lastIndexOf('./');
        var lastDot = key.lastIndexOf('.');
        if (lastDot > lastPath) {
            return key.substr(0, lastDot) + '@' + key.substr(lastDot + 1);
        }
        var firstNonPathCharIndex = lastPath === -1 ? 0 : lastPath + 2;
        var firstNonPathChar = key.charAt(firstNonPathCharIndex);
        if (firstNonPathChar === '.' || firstNonPathChar === '@') {
            return key.substr(0, firstNonPathCharIndex) + '@' + key.substr(firstNonPathCharIndex + 1);
        } else {
            return key.substr(0, firstNonPathCharIndex) + '@' + key.substr(firstNonPathCharIndex);
        }
    };
    var convertToAtLookup = function (ast) {
        if (ast.type === 'Lookup') {
            ast.key = convertKeyToLookup(ast.key);
        }
        return ast;
    };
    var convertToHelperIfTopIsLookup = function (stack) {
        var top = stack.top();
        if (top && top.type === 'Lookup') {
            var base = stack.stack[stack.stack.length - 2];
            if (base.type !== 'Helper' && base) {
                stack.replaceTopAndPush({
                    type: 'Helper',
                    method: top
                });
            }
        }
    };
    var expression = {
        convertKeyToLookup: convertKeyToLookup,
        Literal: Literal,
        Lookup: Lookup,
        ScopeLookup: ScopeLookup,
        Arg: Arg,
        Hash: Hash,
        Call: Call,
        Helper: Helper,
        HelperLookup: HelperLookup,
        HelperScopeLookup: HelperScopeLookup,
        SetIdentifier: function (value) {
            this.value = value;
        },
        tokenize: function (expression) {
            var tokens = [];
            (expression.trim() + ' ').replace(tokensRegExp, function (whole, arg) {
                tokens.push(arg);
            });
            return tokens;
        },
        lookupRules: {
            'default': function (ast, methodType, isArg) {
                var name = (methodType === 'Helper' && !ast.root ? 'Helper' : '') + (isArg ? 'Scope' : '') + 'Lookup';
                return expression[name];
            },
            'method': function (ast, methodType, isArg) {
                return ScopeLookup;
            }
        },
        methodRules: {
            'default': function (ast) {
                return ast.type === 'Call' ? Call : Helper;
            },
            'call': function (ast) {
                return Call;
            }
        },
        parse: function (expressionString, options) {
            options = options || {};
            var ast = this.ast(expressionString);
            if (!options.lookupRule) {
                options.lookupRule = 'default';
            }
            if (typeof options.lookupRule === 'string') {
                options.lookupRule = expression.lookupRules[options.lookupRule];
            }
            if (!options.methodRule) {
                options.methodRule = 'default';
            }
            if (typeof options.methodRule === 'string') {
                options.methodRule = expression.methodRules[options.methodRule];
            }
            var expr = this.hydrateAst(ast, options, options.baseMethodType || 'Helper');
            return expr;
        },
        hydrateAst: function (ast, options, methodType, isArg) {
            if (ast.type === 'Lookup') {
                return new (options.lookupRule(ast, methodType, isArg))(ast.key, ast.root && this.hydrateAst(ast.root, options, methodType));
            } else if (ast.type === 'Literal') {
                return new Literal(ast.value);
            } else if (ast.type === 'Arg') {
                return new Arg(this.hydrateAst(ast.children[0], options, methodType, isArg), { compute: true });
            } else if (ast.type === 'Hash') {
                throw new Error('');
            } else if (ast.type === 'Call' || ast.type === 'Helper') {
                var hashes = {}, args = [], children = ast.children;
                if (children) {
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        if (child.type === 'Hash') {
                            hashes[child.prop] = this.hydrateAst(child.children[0], options, ast.type, true);
                        } else {
                            args.push(this.hydrateAst(child, options, ast.type, true));
                        }
                    }
                }
                return new (options.methodRule(ast))(this.hydrateAst(ast.method, options, ast.type), args, hashes);
            }
        },
        ast: function (expression) {
            var tokens = this.tokenize(expression);
            return this.parseAst(tokens, { index: 0 });
        },
        parseAst: function (tokens, cursor) {
            var stack = new Stack(), top;
            while (cursor.index < tokens.length) {
                var token = tokens[cursor.index], nextToken = tokens[cursor.index + 1];
                cursor.index++;
                if (literalRegExp.test(token)) {
                    convertToHelperIfTopIsLookup(stack);
                    stack.addTo([
                        'Helper',
                        'Call',
                        'Hash'
                    ], {
                        type: 'Literal',
                        value: utils.jsonParse(token)
                    });
                } else if (nextToken === '=') {
                    top = stack.top();
                    if (top && top.type === 'Lookup') {
                        var firstParent = stack.firstParent([
                            'Call',
                            'Helper',
                            'Hash'
                        ]);
                        if (firstParent.type === 'Call' || firstParent.type === 'Root') {
                            stack.popUntil(['Call']);
                            top = stack.top();
                            stack.replaceTopAndPush({
                                type: 'Helper',
                                method: top.type === 'Root' ? last(top.children) : top
                            });
                        }
                    }
                    stack.addToAndPush([
                        'Helper',
                        'Call'
                    ], {
                        type: 'Hash',
                        prop: token
                    });
                    cursor.index++;
                } else if (keyRegExp.test(token)) {
                    var lastToken = stack.topLastChild();
                    if (lastToken && lastToken.type === 'Call' && isAddingToExpression(token)) {
                        stack.replaceTopLastChildAndPush({
                            type: 'Lookup',
                            root: lastToken,
                            key: token
                        });
                    } else {
                        convertToHelperIfTopIsLookup(stack);
                        stack.addToAndPush([
                            'Helper',
                            'Call',
                            'Hash',
                            'Arg'
                        ], {
                            type: 'Lookup',
                            key: token
                        });
                    }
                } else if (token === '~') {
                    convertToHelperIfTopIsLookup(stack);
                    stack.addToAndPush([
                        'Helper',
                        'Call',
                        'Hash'
                    ], {
                        type: 'Arg',
                        key: token
                    });
                } else if (token === '(') {
                    top = stack.top();
                    if (top.type === 'Lookup') {
                        stack.replaceTopAndPush({
                            type: 'Call',
                            method: convertToAtLookup(top)
                        });
                    } else {
                        throw new Error('Unable to understand expression ' + tokens.join(''));
                    }
                } else if (token === ')') {
                    stack.popTo(['Call']);
                } else if (token === ',') {
                    stack.popUntil(['Call']);
                }
            }
            return stack.root.children[0];
        }
    };
    module.exports = expression;
});
/*can-view-model@3.0.0-pre.2#can-view-model*/
define('can-view-model', function (require, exports, module) {
    'use strict';
    var domData = require('can-util/dom/data/data');
    var SimpleMap = require('can-simple-map');
    module.exports = function (el, attr, val) {
        var scope = domData.get.call(el, 'viewModel');
        if (!scope) {
            scope = new SimpleMap();
            domData.set.call(el, 'viewModel', scope);
        }
        switch (arguments.length) {
        case 0:
        case 1:
            return scope;
        case 2:
            return 'attr' in scope ? scope.attr(attr) : scope[attr];
        default:
            if ('attr' in scope) {
                scope.attr(attr, val);
            } else {
                scope[attr] = val;
            }
            return el;
        }
    };
});
/*can-stache-bindings@3.0.0-pre.3#can-stache-bindings*/
define('can-stache-bindings', function (require, exports, module) {
    var expression = require('can-stache/src/expression');
    var viewCallbacks = require('can-view-callbacks');
    var live = require('can-view-live');
    var Scope = require('can-view-scope');
    var canViewModel = require('can-view-model');
    var canEvent = require('can-event');
    var canBatch = require('can-event/batch/batch');
    var compute = require('can-compute');
    var observeReader = require('can-observe-info/reader/reader');
    var assign = require('can-util/js/assign/assign');
    var makeArray = require('can-util/js/make-array/make-array');
    var each = require('can-util/js/each/each');
    var string = require('can-util/js/string/string');
    var dev = require('can-util/js/dev/dev');
    var isEmptyObject = require('can-util/js/is-empty-object/is-empty-object');
    var isArray = require('can-util/js/is-array/is-array');
    var types = require('can-util/js/types/types');
    var last = require('can-util/js/last/last');
    var getMutationObserver = require('can-util/dom/mutation-observer/mutation-observer');
    var domEvents = require('can-util/dom/events/events');
    require('can-util/dom/events/removed/removed');
    var domData = require('can-util/dom/data/data');
    var attr = require('can-util/dom/attr/attr');
    var behaviors = {
        viewModel: function (el, tagData, makeViewModel, initialViewModelData) {
            initialViewModelData = initialViewModelData || {};
            var bindingsSemaphore = {}, viewModel, onCompleteBindings = [], onTeardowns = {}, bindingInfos = {}, attributeViewModelBindings = assign({}, initialViewModelData);
            each(makeArray(el.attributes), function (node) {
                var dataBinding = makeDataBinding(node, el, {
                    templateType: tagData.templateType,
                    scope: tagData.scope,
                    semaphore: bindingsSemaphore,
                    getViewModel: function () {
                        return viewModel;
                    },
                    attributeViewModelBindings: attributeViewModelBindings,
                    alreadyUpdatedChild: true,
                    nodeList: tagData.parentNodeList
                });
                if (dataBinding) {
                    if (dataBinding.onCompleteBinding) {
                        if (dataBinding.bindingInfo.parentToChild && dataBinding.value !== undefined) {
                            initialViewModelData[cleanVMName(dataBinding.bindingInfo.childName)] = dataBinding.value;
                        }
                        onCompleteBindings.push(dataBinding.onCompleteBinding);
                    }
                    onTeardowns[node.name] = dataBinding.onTeardown;
                }
            });
            viewModel = makeViewModel(initialViewModelData);
            for (var i = 0, len = onCompleteBindings.length; i < len; i++) {
                onCompleteBindings[i]();
            }
            domEvents.addEventListener.call(el, 'attributes', function (ev) {
                var attrName = ev.attributeName, value = el.getAttribute(attrName);
                if (onTeardowns[attrName]) {
                    onTeardowns[attrName]();
                }
                var parentBindingWasAttribute = bindingInfos[attrName] && bindingInfos[attrName].parent === 'attribute';
                if (value !== null || parentBindingWasAttribute) {
                    var dataBinding = makeDataBinding({
                        name: attrName,
                        value: value
                    }, el, {
                        templateType: tagData.templateType,
                        scope: tagData.scope,
                        semaphore: {},
                        getViewModel: function () {
                            return viewModel;
                        },
                        attributeViewModelBindings: attributeViewModelBindings,
                        initializeValues: true,
                        nodeList: tagData.parentNodeList
                    });
                    if (dataBinding) {
                        if (dataBinding.onCompleteBinding) {
                            dataBinding.onCompleteBinding();
                        }
                        bindingInfos[attrName] = dataBinding.bindingInfo;
                        onTeardowns[attrName] = dataBinding.onTeardown;
                    }
                }
            });
            return function () {
                for (var attrName in onTeardowns) {
                    onTeardowns[attrName]();
                }
            };
        },
        data: function (el, attrData) {
            if (domData.get.call(el, 'preventDataBindings')) {
                return;
            }
            var viewModel = canViewModel(el), semaphore = {}, teardown;
            var dataBinding = makeDataBinding({
                name: attrData.attributeName,
                value: el.getAttribute(attrData.attributeName),
                nodeList: attrData.nodeList
            }, el, {
                templateType: attrData.templateType,
                scope: attrData.scope,
                semaphore: semaphore,
                getViewModel: function () {
                    return viewModel;
                }
            });
            if (dataBinding.onCompleteBinding) {
                dataBinding.onCompleteBinding();
            }
            teardown = dataBinding.onTeardown;
            canEvent.one.call(el, 'removed', function () {
                teardown();
            });
            domEvents.addEventListener.call(el, 'attributes', function (ev) {
                var attrName = ev.attributeName, value = el.getAttribute(attrName);
                if (attrName === attrData.attributeName) {
                    if (teardown) {
                        teardown();
                    }
                    if (value !== null) {
                        var dataBinding = makeDataBinding({
                            name: attrName,
                            value: value
                        }, el, {
                            templateType: attrData.templateType,
                            scope: attrData.scope,
                            semaphore: semaphore,
                            getViewModel: function () {
                                return viewModel;
                            },
                            initializeValues: true,
                            nodeList: attrData.nodeList
                        });
                        if (dataBinding) {
                            if (dataBinding.onCompleteBinding) {
                                dataBinding.onCompleteBinding();
                            }
                            teardown = dataBinding.onTeardown;
                        }
                    }
                }
            });
        },
        reference: function (el, attrData) {
            if (el.getAttribute(attrData.attributeName)) {
                console.warn('*reference attributes can only export the view model.');
            }
            var name = string.camelize(attrData.attributeName.substr(1).toLowerCase());
            var viewModel = canViewModel(el);
            var refs = attrData.scope.getRefs();
            refs._context.attr('*' + name, viewModel);
        },
        event: function (el, data) {
            var attributeName = data.attributeName, legacyBinding = attributeName.indexOf('can-') === 0, event = attributeName.indexOf('can-') === 0 ? attributeName.substr('can-'.length) : removeBrackets(attributeName, '(', ')'), onBindElement = legacyBinding;
            if (event.charAt(0) === '$') {
                event = event.substr(1);
                onBindElement = true;
            }
            var handler = function (ev) {
                var attrVal = el.getAttribute(attributeName);
                if (!attrVal) {
                    return;
                }
                var viewModel = canViewModel(el);
                var expr = expression.parse(removeBrackets(attrVal), {
                    lookupRule: 'method',
                    methodRule: 'call'
                });
                if (!(expr instanceof expression.Call) && !(expr instanceof expression.Helper)) {
                    var defaultArgs = [
                        data.scope._context,
                        el
                    ].concat(makeArray(arguments)).map(function (data) {
                        return new expression.Literal(data);
                    });
                    expr = new expression.Call(expr, defaultArgs, {});
                }
                var scopeData = data.scope.read(expr.methodExpr.key, { isArgument: true });
                if (!scopeData.value) {
                    scopeData = data.scope.read(expr.methodExpr.key, { isArgument: true });
                    return null;
                }
                var localScope = data.scope.add({
                    '@element': el,
                    '@event': ev,
                    '@viewModel': viewModel,
                    '@scope': data.scope,
                    '@context': data.scope._context,
                    '%element': this,
                    '$element': el,
                    '%event': ev,
                    '%viewModel': viewModel,
                    '%scope': data.scope,
                    '%context': data.scope._context
                }, { notContext: true });
                var args = expr.args(localScope, null)(), hash = expr.hash(localScope, null)();
                if (!isEmptyObject(hash)) {
                    args.push(hash);
                }
                return scopeData.value.apply(scopeData.parent, args);
            };
            if (special[event]) {
                var specialData = special[event](data, el, handler);
                handler = specialData.handler;
                event = specialData.event;
            }
            canEvent.on.call(onBindElement ? el : canViewModel(el), event, handler);
            var attributesHandler = function (ev) {
                if (ev.attributeName === attributeName && !this.getAttribute(attributeName)) {
                    canEvent.off.call(onBindElement ? el : canViewModel(el), event, handler);
                    canEvent.off.call(el, 'attributes', attributesHandler);
                }
            };
            canEvent.on.call(el, 'attributes', attributesHandler);
        },
        value: function (el, data) {
            var propName = '$value', attrValue = removeBrackets(el.getAttribute('can-value')).trim(), getterSetter;
            if (el.nodeName.toLowerCase() === 'input' && (el.type === 'checkbox' || el.type === 'radio')) {
                var property = getComputeFrom.scope(el, data.scope, attrValue, {}, true);
                if (el.type === 'checkbox') {
                    var trueValue = attr.has(el, 'can-true-value') ? el.getAttribute('can-true-value') : true, falseValue = attr.has(el, 'can-false-value') ? el.getAttribute('can-false-value') : false;
                    getterSetter = compute(function (newValue) {
                        if (arguments.length) {
                            property(newValue ? trueValue : falseValue);
                        } else {
                            return property() == trueValue;
                        }
                    });
                } else if (el.type === 'radio') {
                    getterSetter = compute(function (newValue) {
                        if (arguments.length) {
                            if (newValue) {
                                property(el.value);
                            }
                        } else {
                            return property() == el.value;
                        }
                    });
                }
                propName = '$checked';
                attrValue = 'getterSetter';
                data.scope = new Scope({ getterSetter: getterSetter });
            } else if (isContentEditable(el)) {
                propName = '$innerHTML';
            }
            var dataBinding = makeDataBinding({
                name: '{(' + propName + '})',
                value: attrValue
            }, el, {
                templateType: data.templateType,
                scope: data.scope,
                semaphore: {},
                initializeValues: true,
                legacyBindings: true,
                syncChildWithParent: true
            });
            canEvent.one.call(el, 'removed', function () {
                dataBinding.onTeardown();
            });
        }
    };
    viewCallbacks.attr(/^\{[^\}]+\}$/, behaviors.data);
    viewCallbacks.attr(/\*[\w\.\-_]+/, behaviors.reference);
    viewCallbacks.attr(/^\([\$?\w\.]+\)$/, behaviors.event);
    viewCallbacks.attr(/can-[\w\.]+/, behaviors.event);
    viewCallbacks.attr('can-value', behaviors.value);
    var getComputeFrom = {
        scope: function (el, scope, scopeProp, bindingData, mustBeACompute, stickyCompute) {
            if (!scopeProp) {
                return compute();
            } else {
                if (mustBeACompute) {
                    var parentExpression = expression.parse(scopeProp, { baseMethodType: 'Call' });
                    return parentExpression.value(scope, new Scope.Options({}));
                } else {
                    return function (newVal) {
                        scope.attr(cleanVMName(scopeProp), newVal);
                    };
                }
            }
        },
        viewModel: function (el, scope, vmName, bindingData, mustBeACompute, stickyCompute) {
            var setName = cleanVMName(vmName);
            if (mustBeACompute) {
                return compute(function (newVal) {
                    var viewModel = bindingData.getViewModel();
                    if (arguments.length) {
                        if (types.isMapLike(viewModel)) {
                            viewModel.attr(setName, newVal);
                        } else {
                            viewModel[setName] = newVal;
                        }
                    } else {
                        return vmName === '.' ? viewModel : observeReader.read(viewModel, observeReader.reads(vmName), {}).value;
                    }
                });
            } else {
                return function (newVal) {
                    var viewModel = bindingData.getViewModel();
                    if (types.isMapLike(viewModel)) {
                        viewModel.attr(setName, newVal);
                    } else {
                        viewModel[setName] = newVal;
                    }
                };
            }
        },
        attribute: function (el, scope, prop, bindingData, mustBeACompute, stickyCompute, event) {
            if (!event) {
                if (prop === 'innerHTML') {
                    event = [
                        'blur',
                        'change'
                    ];
                } else {
                    event = 'change';
                }
            }
            if (!isArray(event)) {
                event = [event];
            }
            var hasChildren = el.nodeName.toLowerCase() === 'select', isMultiselectValue = prop === 'value' && hasChildren && el.multiple, isStringValue, lastSet, scheduledAsyncSet = false, timer, set = function (newVal) {
                    if (hasChildren && !scheduledAsyncSet) {
                        clearTimeout(timer);
                        timer = setTimeout(function () {
                            set(newVal);
                        }, 1);
                    }
                    lastSet = newVal;
                    if (isMultiselectValue) {
                        if (newVal && typeof newVal === 'string') {
                            newVal = newVal.split(';');
                            isStringValue = true;
                        } else if (newVal) {
                            newVal = makeArray(newVal);
                        } else {
                            newVal = [];
                        }
                        var isSelected = {};
                        each(newVal, function (val) {
                            isSelected[val] = true;
                        });
                        each(el.childNodes, function (option) {
                            if (option.value) {
                                option.selected = !!isSelected[option.value];
                            }
                        });
                    } else {
                        if (!bindingData.legacyBindings && hasChildren && 'selectedIndex' in el && prop === 'value') {
                            attr.setSelectValue(el, newVal);
                        } else {
                            attr.setAttrOrProp(el, prop, newVal == null ? '' : newVal);
                        }
                    }
                    return newVal;
                }, get = function () {
                    if (isMultiselectValue) {
                        var values = [], children = el.childNodes;
                        each(children, function (child) {
                            if (child.selected && child.value) {
                                values.push(child.value);
                            }
                        });
                        return isStringValue ? values.join(';') : values;
                    } else if (hasChildren && 'selectedIndex' in el && el.selectedIndex === -1) {
                        return undefined;
                    }
                    return attr.get(el, prop);
                };
            if (hasChildren) {
                setTimeout(function () {
                    scheduledAsyncSet = true;
                }, 1);
            }
            var observer;
            return compute(get(), {
                on: function (updater) {
                    each(event, function (eventName) {
                        canEvent.on.call(el, eventName, updater);
                    });
                    if (hasChildren) {
                        var onMutation = function (mutations) {
                            if (stickyCompute) {
                                set(stickyCompute());
                            }
                            updater();
                        };
                        var MO = getMutationObserver();
                        if (MO) {
                            observer = new MO(onMutation);
                            observer.observe(el, {
                                childList: true,
                                subtree: true
                            });
                        } else {
                            domData.set.call(el, 'canBindingCallback', { onMutation: onMutation });
                        }
                    }
                },
                off: function (updater) {
                    each(event, function (eventName) {
                        canEvent.off.call(el, eventName, updater);
                    });
                    if (hasChildren) {
                        if (getMutationObserver()) {
                            observer.disconnect();
                        } else {
                            domData.clean.call(el, 'canBindingCallback');
                        }
                    }
                },
                get: get,
                set: set
            });
        }
    };
    var bind = {
        childToParent: function (el, parentCompute, childCompute, bindingsSemaphore, attrName, syncChild) {
            var parentUpdateIsFunction = typeof parentCompute === 'function';
            var updateParent = function (ev, newVal) {
                if (!bindingsSemaphore[attrName]) {
                    if (parentUpdateIsFunction) {
                        parentCompute(newVal);
                        if (syncChild) {
                            if (parentCompute() !== childCompute()) {
                                bindingsSemaphore[attrName] = (bindingsSemaphore[attrName] || 0) + 1;
                                childCompute(parentCompute());
                                canBatch.after(function () {
                                    --bindingsSemaphore[attrName];
                                });
                            }
                        }
                    } else if (types.isMapLike(parentCompute)) {
                        parentCompute.attr(newVal, true);
                    }
                }
            };
            if (childCompute && childCompute.isComputed) {
                childCompute.bind('change', updateParent);
            }
            return updateParent;
        },
        parentToChild: function (el, parentCompute, childUpdate, bindingsSemaphore, attrName) {
            var updateChild = function (ev, newValue) {
                bindingsSemaphore[attrName] = (bindingsSemaphore[attrName] || 0) + 1;
                childUpdate(newValue);
                canBatch.after(function () {
                    --bindingsSemaphore[attrName];
                });
            };
            if (parentCompute && parentCompute.isComputed) {
                parentCompute.bind('change', updateChild);
            }
            return updateChild;
        }
    };
    var getBindingInfo = function (node, attributeViewModelBindings, templateType, tagName) {
        var attributeName = node.name, attributeValue = node.value || '';
        var matches = attributeName.match(bindingsRegExp);
        if (!matches) {
            var ignoreAttribute = ignoreAttributesRegExp.test(attributeName);
            var vmName = string.camelize(attributeName);
            if (ignoreAttribute || viewCallbacks.attr(attributeName)) {
                return;
            }
            var syntaxRight = attributeValue[0] === '{' && last(attributeValue) === '}';
            var isAttributeToChild = templateType === 'legacy' ? attributeViewModelBindings[vmName] : !syntaxRight;
            var scopeName = syntaxRight ? attributeValue.substr(1, attributeValue.length - 2) : attributeValue;
            if (isAttributeToChild) {
                return {
                    bindingAttributeName: attributeName,
                    parent: 'attribute',
                    parentName: attributeName,
                    child: 'viewModel',
                    childName: vmName,
                    parentToChild: true,
                    childToParent: true
                };
            } else {
                return {
                    bindingAttributeName: attributeName,
                    parent: 'scope',
                    parentName: scopeName,
                    child: 'viewModel',
                    childName: vmName,
                    parentToChild: true,
                    childToParent: true
                };
            }
        }
        var twoWay = !!matches[1], childToParent = twoWay || !!matches[2], parentToChild = twoWay || !childToParent;
        var childName = matches[3];
        var isDOM = childName.charAt(0) === '$';
        if (isDOM) {
            var bindingInfo = {
                parent: 'scope',
                child: 'attribute',
                childToParent: childToParent,
                parentToChild: parentToChild,
                bindingAttributeName: attributeName,
                childName: childName.substr(1),
                parentName: attributeValue,
                initializeValues: true
            };
            if (tagName === 'select') {
                bindingInfo.stickyParentToChild = true;
            }
            return bindingInfo;
        } else {
            return {
                parent: 'scope',
                child: 'viewModel',
                childToParent: childToParent,
                parentToChild: parentToChild,
                bindingAttributeName: attributeName,
                childName: string.camelize(childName),
                parentName: attributeValue,
                initializeValues: true
            };
        }
    };
    var bindingsRegExp = /\{(\()?(\^)?([^\}\)]+)\)?\}/, ignoreAttributesRegExp = /^(data-view-id|class|id|\[[\w\.-]+\]|#[\w\.-])$/i;
    var makeDataBinding = function (node, el, bindingData) {
        var bindingInfo = getBindingInfo(node, bindingData.attributeViewModelBindings, bindingData.templateType, el.nodeName.toLowerCase());
        if (!bindingInfo) {
            return;
        }
        bindingInfo.alreadyUpdatedChild = bindingData.alreadyUpdatedChild;
        if (bindingData.initializeValues) {
            bindingInfo.initializeValues = true;
        }
        var parentCompute = getComputeFrom[bindingInfo.parent](el, bindingData.scope, bindingInfo.parentName, bindingData, bindingInfo.parentToChild), childCompute = getComputeFrom[bindingInfo.child](el, bindingData.scope, bindingInfo.childName, bindingData, bindingInfo.childToParent, bindingInfo.stickyParentToChild && parentCompute), updateParent, updateChild, childLifecycle;
        if (bindingData.nodeList) {
            if (parentCompute && parentCompute.isComputed) {
                parentCompute.computeInstance.setPrimaryDepth(bindingData.nodeList.nesting + 1);
            }
            if (childCompute && childCompute.isComputed) {
                childCompute.computeInstance.setPrimaryDepth(bindingData.nodeList.nesting + 1);
            }
        }
        if (bindingInfo.parentToChild) {
            updateChild = bind.parentToChild(el, parentCompute, childCompute, bindingData.semaphore, bindingInfo.bindingAttributeName);
        }
        var completeBinding = function () {
            if (bindingInfo.childToParent) {
                updateParent = bind.childToParent(el, parentCompute, childCompute, bindingData.semaphore, bindingInfo.bindingAttributeName, bindingData.syncChildWithParent);
            } else if (bindingInfo.stickyParentToChild) {
                childCompute.bind('change', childLifecycle = function () {
                });
            }
            if (bindingInfo.initializeValues) {
                initializeValues(bindingInfo, childCompute, parentCompute, updateChild, updateParent);
            }
        };
        var onTeardown = function () {
            unbindUpdate(parentCompute, updateChild);
            unbindUpdate(childCompute, updateParent);
            unbindUpdate(childCompute, childLifecycle);
        };
        if (bindingInfo.child === 'viewModel') {
            return {
                value: getValue(parentCompute),
                onCompleteBinding: completeBinding,
                bindingInfo: bindingInfo,
                onTeardown: onTeardown
            };
        } else {
            completeBinding();
            return {
                bindingInfo: bindingInfo,
                onTeardown: onTeardown
            };
        }
    };
    var initializeValues = function (bindingInfo, childCompute, parentCompute, updateChild, updateParent) {
        var doUpdateParent = false;
        if (bindingInfo.parentToChild && !bindingInfo.childToParent) {
        } else if (!bindingInfo.parentToChild && bindingInfo.childToParent) {
            doUpdateParent = true;
        } else if (getValue(childCompute) === undefined) {
        } else if (getValue(parentCompute) === undefined) {
            doUpdateParent = true;
        }
        if (doUpdateParent) {
            updateParent({}, getValue(childCompute));
        } else {
            if (!bindingInfo.alreadyUpdatedChild) {
                updateChild({}, getValue(parentCompute));
            }
        }
    };
    if (!getMutationObserver()) {
        var updateSelectValue = function (el) {
            var bindingCallback = domData.get.call(el, 'canBindingCallback');
            if (bindingCallback) {
                bindingCallback.onMutation(el);
            }
        };
        live.registerChildMutationCallback('select', updateSelectValue);
        live.registerChildMutationCallback('optgroup', function (el) {
            updateSelectValue(el.parentNode);
        });
    }
    var isContentEditable = function () {
            var values = {
                '': true,
                'true': true,
                'false': false
            };
            var editable = function (el) {
                if (!el || !el.getAttribute) {
                    return;
                }
                var attr = el.getAttribute('contenteditable');
                return values[attr];
            };
            return function (el) {
                var val = editable(el);
                if (typeof val === 'boolean') {
                    return val;
                } else {
                    return !!editable(el.parentNode);
                }
            };
        }(), removeBrackets = function (value, open, close) {
            open = open || '{';
            close = close || '}';
            if (value[0] === open && value[value.length - 1] === close) {
                return value.substr(1, value.length - 2);
            }
            return value;
        }, getValue = function (value) {
            return value && value.isComputed ? value() : value;
        }, unbindUpdate = function (compute, updateOther) {
            if (compute && compute.isComputed && typeof updateOther === 'function') {
                compute.unbind('change', updateOther);
            }
        }, cleanVMName = function (name) {
            return name.replace(/@/g, '');
        };
    var special = {
        enter: function (data, el, original) {
            return {
                event: 'keyup',
                handler: function (ev) {
                    if (ev.keyCode === 13) {
                        return original.call(this, ev);
                    }
                }
            };
        }
    };
    module.exports = {
        behaviors: behaviors,
        getBindingInfo: getBindingInfo,
        special: special
    };
});
/*can-util@3.0.0-pre.22#dom/events/inserted/inserted*/
define('can-util/dom/events/inserted/inserted', function (require, exports, module) {
    var makeMutationEvent = require('can-util/dom/events/make-mutation-event/make-mutation-event');
    makeMutationEvent('inserted', 'addedNodes');
});
/*can-component@3.0.0-pre.7#can-component*/
define('can-component', function (require, exports, module) {
    var ComponentControl = require('can-component/control/control');
    var namespace = require('can-util/namespace');
    var Construct = require('can-construct');
    var stacheBindings = require('can-stache-bindings');
    var Scope = require('can-view-scope');
    var viewCallbacks = require('can-view-callbacks');
    var nodeLists = require('can-view-nodelist');
    var domData = require('can-util/dom/data/data');
    var domMutate = require('can-util/dom/mutate/mutate');
    var getChildNodes = require('can-util/dom/child-nodes/child-nodes');
    var domDispatch = require('can-util/dom/dispatch/dispatch');
    var types = require('can-util/js/types/types');
    var assign = require('can-util/js/assign/assign');
    var canEach = require('can-util/js/each/each');
    var isFunction = require('can-util/js/is-function/is-function');
    require('can-util/dom/events/inserted/inserted');
    require('can-util/dom/events/removed/removed');
    require('can-view-model');
    var Component = Construct.extend({
        setup: function () {
            Construct.setup.apply(this, arguments);
            if (Component) {
                var self = this;
                this.Control = ComponentControl.extend(this.prototype.events);
                var protoViewModel = this.prototype.viewModel;
                if (protoViewModel && this.prototype.ViewModel) {
                    throw new Error('Cannot provide both a ViewModel and a viewModel property');
                }
                if (protoViewModel && types.isMapLike(protoViewModel.prototype)) {
                    this.prototype.viewModel = undefined;
                } else {
                    protoViewModel = undefined;
                }
                this.ViewModel = this.prototype.ViewModel || protoViewModel || types.DefaultMap;
                if (this.prototype.template || this.prototype.view) {
                    this.renderer = this.prototype.view || this.prototype.template;
                }
                viewCallbacks.tag(this.prototype.tag, function (el, options) {
                    new self(el, options);
                });
            }
        }
    }, {
        setup: function (el, componentTagData) {
            var component = this;
            var lexicalContent = (typeof this.leakScope === 'undefined' ? false : !this.leakScope) && !!(this.template || this.view);
            var teardownFunctions = [];
            var initialViewModelData = {};
            var callTeardownFunctions = function () {
                for (var i = 0, len = teardownFunctions.length; i < len; i++) {
                    teardownFunctions[i]();
                }
            };
            var setupBindings = !domData.get.call(el, 'preventDataBindings');
            var viewModel, frag;
            var teardownBindings;
            if (setupBindings) {
                teardownBindings = stacheBindings.behaviors.viewModel(el, componentTagData, function (initialViewModelData) {
                    initialViewModelData['%root'] = componentTagData.scope.attr('%root');
                    var protoViewModel = component.scope || component.viewModel;
                    if (typeof protoViewModel === 'function') {
                        var scopeResult = protoViewModel.call(component, initialViewModelData, componentTagData.scope, el);
                        viewModel = scopeResult;
                    } else if (protoViewModel instanceof types.DefaultMap) {
                        viewModel = protoViewModel;
                    } else {
                        var scopeData = assign(assign({}, initialViewModelData), protoViewModel);
                        viewModel = new component.constructor.ViewModel(scopeData);
                    }
                    return viewModel;
                }, initialViewModelData);
            }
            this.scope = this.viewModel = viewModel;
            domData.set.call(el, 'viewModel', viewModel);
            domData.set.call(el, 'preventDataBindings', true);
            var shadowScope;
            if (lexicalContent) {
                shadowScope = Scope.refsScope().add(this.viewModel, { viewModel: true });
            } else {
                shadowScope = (this.constructor.renderer ? componentTagData.scope.add(new Scope.Refs()) : componentTagData.scope).add(this.viewModel, { viewModel: true });
            }
            var options = { helpers: {} }, addHelper = function (name, fn) {
                    options.helpers[name] = function () {
                        return fn.apply(viewModel, arguments);
                    };
                };
            canEach(this.helpers || {}, function (val, prop) {
                if (isFunction(val)) {
                    addHelper(prop, val);
                }
            });
            this._control = new this.constructor.Control(el, {
                scope: this.viewModel,
                viewModel: this.viewModel,
                destroy: callTeardownFunctions
            });
            var nodeList = nodeLists.register([], function () {
                domDispatch.call(el, 'beforeremove', [], false);
                if (teardownBindings) {
                    teardownBindings();
                }
            }, componentTagData.parentNodeList || true, false);
            nodeList.expression = '<' + this.tag + '>';
            teardownFunctions.push(function () {
                nodeLists.unregister(nodeList);
            });
            if (this.constructor.renderer) {
                if (!options.tags) {
                    options.tags = {};
                }
                options.tags.content = function contentHookup(el, contentTagData) {
                    var subtemplate = componentTagData.subtemplate || contentTagData.subtemplate, renderingLightContent = subtemplate === componentTagData.subtemplate;
                    if (subtemplate) {
                        delete options.tags.content;
                        var lightTemplateData;
                        if (renderingLightContent) {
                            if (lexicalContent) {
                                lightTemplateData = componentTagData;
                            } else {
                                lightTemplateData = {
                                    scope: contentTagData.scope.cloneFromRef(),
                                    options: contentTagData.options
                                };
                            }
                        } else {
                            lightTemplateData = contentTagData;
                        }
                        if (contentTagData.parentNodeList) {
                            var frag = subtemplate(lightTemplateData.scope, lightTemplateData.options, contentTagData.parentNodeList);
                            nodeLists.replace([el], frag);
                        } else {
                            nodeLists.replace([el], subtemplate(lightTemplateData.scope, lightTemplateData.options));
                        }
                        options.tags.content = contentHookup;
                    }
                };
                frag = this.constructor.renderer(shadowScope, componentTagData.options.add(options), nodeList);
            } else {
                frag = componentTagData.subtemplate ? componentTagData.subtemplate(shadowScope, componentTagData.options.add(options), nodeList) : document.createDocumentFragment();
            }
            domMutate.appendChild.call(el, frag);
            nodeLists.update(nodeList, getChildNodes(el));
        }
    });
    viewCallbacks.tag('content', function (el, tagData) {
        return tagData.scope;
    });
    module.exports = namespace.Component = Component;
});
/*[global-shim-end]*/
(function(){ // jshint ignore:line
	window._define = window.define;
	window.define = window.define.orig;
}
)();