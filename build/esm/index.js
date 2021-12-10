
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
function noop() { }
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function is_promise(value) {
    return value && typeof value === 'object' && typeof value.then === 'function';
}
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file, line, column, char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function validate_store(store, name) {
    if (store != null && typeof store.subscribe !== 'function') {
        throw new Error(`'${name}' is not a store with a 'subscribe' method`);
    }
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
    let value;
    subscribe(store, _ => value = _)();
    return value;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
    const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_input_value(input, value) {
    input.value = value == null ? '' : value;
}
function set_style(node, key, value, important) {
    node.style.setProperty(key, value, important ? 'important' : '');
}
function select_option(select, value) {
    for (let i = 0; i < select.options.length; i += 1) {
        const option = select.options[i];
        if (option.__value === value) {
            option.selected = true;
            return;
        }
    }
}
function select_value(select) {
    const selected_option = select.querySelector(':checked') || select.options[0];
    return selected_option && selected_option.__value;
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function beforeUpdate(fn) {
    get_current_component().$$.before_update.push(fn);
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
}
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail);
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
        }
    };
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function add_flush_callback(fn) {
    flush_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}

function handle_promise(promise, info) {
    const token = info.token = {};
    function update(type, index, key, value) {
        if (info.token !== token)
            return;
        info.resolved = value;
        let child_ctx = info.ctx;
        if (key !== undefined) {
            child_ctx = child_ctx.slice();
            child_ctx[key] = value;
        }
        const block = type && (info.current = type)(child_ctx);
        let needs_flush = false;
        if (info.block) {
            if (info.blocks) {
                info.blocks.forEach((block, i) => {
                    if (i !== index && block) {
                        group_outros();
                        transition_out(block, 1, 1, () => {
                            if (info.blocks[i] === block) {
                                info.blocks[i] = null;
                            }
                        });
                        check_outros();
                    }
                });
            }
            else {
                info.block.d(1);
            }
            block.c();
            transition_in(block, 1);
            block.m(info.mount(), info.anchor);
            needs_flush = true;
        }
        info.block = block;
        if (info.blocks)
            info.blocks[index] = block;
        if (needs_flush) {
            flush();
        }
    }
    if (is_promise(promise)) {
        const current_component = get_current_component();
        promise.then(value => {
            set_current_component(current_component);
            update(info.then, 1, info.value, value);
            set_current_component(null);
        }, error => {
            set_current_component(current_component);
            update(info.catch, 2, info.error, error);
            set_current_component(null);
            if (!info.hasCatch) {
                throw error;
            }
        });
        // if we previously had a then/catch block, destroy it
        if (info.current !== info.pending) {
            update(info.pending, 0);
            return true;
        }
    }
    else {
        if (info.current !== info.then) {
            update(info.then, 1, info.value, promise);
            return true;
        }
        info.resolved = promise;
    }
}

const globals = (typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
        ? globalThis
        : global);

function bind$1(component, name, callback) {
    const index = component.$$.props[name];
    if (index !== undefined) {
        component.$$.bound[index] = callback;
        callback(component.$$.ctx[index]);
    }
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, Object.assign({ version: '3.35.0' }, detail)));
}
function append_dev(target, node) {
    dispatch_dev('SvelteDOMInsert', { target, node });
    append(target, node);
}
function insert_dev(target, node, anchor) {
    dispatch_dev('SvelteDOMInsert', { target, node, anchor });
    insert(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev('SvelteDOMRemove', { node });
    detach(node);
}
function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
    const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
    if (has_prevent_default)
        modifiers.push('preventDefault');
    if (has_stop_propagation)
        modifiers.push('stopPropagation');
    dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
    const dispose = listen(node, event, handler, options);
    return () => {
        dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
        dispose();
    };
}
function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
        dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
    else
        dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
}
function prop_dev(node, property, value) {
    node[property] = value;
    dispatch_dev('SvelteDOMSetProperty', { node, property, value });
}
function set_data_dev(text, data) {
    data = '' + data;
    if (text.wholeText === data)
        return;
    dispatch_dev('SvelteDOMSetData', { node: text, data });
    text.data = data;
}
function validate_each_argument(arg) {
    if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
        let msg = '{#each} only iterates over array-like objects.';
        if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
            msg += ' You can use a spread to convert this iterable into an array.';
        }
        throw new Error(msg);
    }
}
function validate_slots(name, slot, keys) {
    for (const slot_key of Object.keys(slot)) {
        if (!~keys.indexOf(slot_key)) {
            console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
        }
    }
}
/**
 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
 */
class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
        if (!options || (!options.target && !options.$$inline)) {
            throw new Error("'target' is a required option");
        }
        super();
    }
    $destroy() {
        super.$destroy();
        this.$destroy = () => {
            console.warn('Component was already destroyed'); // eslint-disable-line no-console
        };
    }
    $capture_state() { }
    $inject_state() { }
}

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

var bind = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

var utils = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
var buildURL = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

var InterceptorManager_1 = InterceptorManager;

var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
var enhanceError = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  };
  return error;
};

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
var createError = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
var settle = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

var cookies = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
var isAbsoluteURL = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
var combineURLs = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
var buildFullPath = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
var parseHeaders = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};

var isURLSameOrigin = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

var Cancel_1 = Cancel;

var xhr = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || defaults_1.transitional;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(
        timeoutErrorMessage,
        config,
        transitional.clarifyTimeoutError ? 'ETIMEDOUT' : 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new Cancel_1('canceled') : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = xhr;
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = xhr;
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  },

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data) || (headers && headers['Content-Type'] === 'application/json')) {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw enhanceError(e, this, 'E_JSON_PARSE');
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

var defaults_1 = defaults;

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
var transformData = function transformData(data, headers, fns) {
  var context = this || defaults_1;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};

var isCancel = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new Cancel_1('canceled');
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
var dispatchRequest = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults_1.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
var mergeConfig = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};

var data = {
  "version": "0.24.0"
};

var VERSION = data.version;

var validators$1 = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators$1[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators$1.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new Error(formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')));
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object');
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new TypeError('option ' + opt + ' must be ' + result);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw Error('Unknown option ' + opt);
    }
  }
}

var validator = {
  assertOptions: assertOptions,
  validators: validators$1
};

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager_1(),
    response: new InterceptorManager_1()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

var Axios_1 = Axios;

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel_1(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

var CancelToken_1 = CancelToken;

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
var spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
var isAxiosError = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios_1(defaultConfig);
  var instance = bind(Axios_1.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios_1.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios$1 = createInstance(defaults_1);

// Expose Axios class to allow class inheritance
axios$1.Axios = Axios_1;

// Expose Cancel & CancelToken
axios$1.Cancel = Cancel_1;
axios$1.CancelToken = CancelToken_1;
axios$1.isCancel = isCancel;
axios$1.VERSION = data.version;

// Expose all/spread
axios$1.all = function all(promises) {
  return Promise.all(promises);
};
axios$1.spread = spread;

// Expose isAxiosError
axios$1.isAxiosError = isAxiosError;

var axios_1 = axios$1;

// Allow use of default import syntax in TypeScript
var _default = axios$1;
axios_1.default = _default;

var axios = axios_1;

const domain = writable('');
const appKey = writable('');
const refreshToken = writable('');
const accessToken = writable('');
const modal = writable(true);
const language = writable('en');
const isAuthenticated = writable(false);
const show = writable(false);
const mode = writable('get');
const askForProxy = writable(false);
const compact = writable(false);

class API {

  accessToken = '';
  refreshToken = '';
  domain = '';
  appKey = '';
  proxyConfig = {}

  constructor(
  ) {
    domain.subscribe(value => this.domain = value);
    appKey.subscribe(value => this.appKey = value);
    refreshToken.subscribe(value => this.refreshToken = value);
    
    accessToken.subscribe(value => this.accessToken = value);
  }

  get(path, parameters = {}, useAccessToken = true, additionalHeaders = null, setDefaultHeader = true, useURLSearchParams = true)  {
    return this.call('get', path, parameters, useAccessToken, additionalHeaders, setDefaultHeader, useURLSearchParams);
  }

  post(path, parameters = {}, useAccessToken = true, additionalHeaders = null, setDefaultHeader = true, useURLSearchParams = true) {
    return this.call('post', path, parameters, useAccessToken, additionalHeaders, setDefaultHeader, useURLSearchParams);
  }

  put(path, parameters = {}, useAccessToken = true, additionalHeaders = null, setDefaultHeader = true, useURLSearchParams = true) {
    return this.call('put', path, parameters, useAccessToken, additionalHeaders, setDefaultHeader, useURLSearchParams);
  }

  delete(path, parameters = {}, useAccessToken = true, additionalHeaders = null, setDefaultHeader = true, useURLSearchParams = true) {
    return this.call('delete', path, parameters, useAccessToken, additionalHeaders, setDefaultHeader, useURLSearchParams);
  }

  callAccessToken() {
    return new Promise((resolve, reject) => {
      let requestData = {
        refreshToken: this.refreshToken,
        applicationKey: this.appKey
      };

      this.post('/accessToken', requestData, false)
      .then((data) => {
        if(data.success) {
          this.accessToken = data.accessToken;
          accessToken.update(() => data.accessToken);
          resolve(data);
        } else {
          reject(data);
        }
      }).catch(reject);
    })
    
  }

  call(method, path, parameters = {}, useAccessToken = true, additionalHeaders = null, setDefaultHeader = true, useURLSearchParams = true) {
    this.proxyConfig = JSON.parse(localStorage.getItem('proxy'));
    return new Promise((resolve, reject) => {
      const request = (requestData, headers) => {
        const url = 'https://' + this.domain.replace(/(http|https):\/\//, '') + '/gobackend' + path;
        let params = requestData;
        if (useURLSearchParams) {
          params = new URLSearchParams();
          for (const key of Object.keys(requestData)) {
            let value = requestData[key];
            if (typeof value === 'object') {
              value = JSON.stringify(value);
            }
            params.set(key, value);
          }
          params = params.toString();
        }

        if (!headers) {
          headers = {};
        }
        if (setDefaultHeader) {
          headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        if (additionalHeaders) {
          headers = {...headers, ...additionalHeaders};
        }

        let observeCall = { url: url, request: { method: 'post', headers, data: params } };

        switch (method) {
          case 'get':
            observeCall = { url: url + '?' + params, request: { headers } };
            break;
          case 'put':
            observeCall = { url: url, request: { method: 'put', headers, data: params } };
            break;
          case 'delete':
            observeCall = { url: url, request: { method: 'delete', headers, data: params } };
            break;
        }

        axios({
          url: observeCall.url,
          proxy: this.proxyConfig,
          ...observeCall.request
        }).then(({data}) => {
          
          if (data.success === true || data.success === 'true') {
            resolve(data);
          } else {
            switch (data.errorcode) {
              case 15007:  // API v2
              case 15008:  // API v2
                // get new access Token and retry request
                this.callAccessToken().then(() => {
                  this.call(method, path, parameters).subscribe((newData) => {
                    resolve(newData);
                  });
                });
                break;
              case 5266:
                reject(data.errormessage);
                break;
              default:
                reject(data.errormessage);
                break;
            }
          }
        }).catch(error => reject());
      };

      if (useAccessToken) {
        const accessToken = this.accessToken;
        let headers = {};
        headers = {  // API v2
          Authorization: 'Key ' + accessToken
        };
        request(parameters, headers);
      } else {
        request(parameters);
      }
    });
  }
}

/* src/Logo.svelte generated by Svelte v3.35.0 */

const file$a = "src/Logo.svelte";

function create_fragment$b(ctx) {
	let div1;
	let div0;
	let svg;
	let path0;
	let path1;
	let path2;
	let path3;
	let path4;
	let path5;
	let path6;
	let path7;

	const block = {
		c: function create() {
			div1 = element("div");
			div0 = element("div");
			svg = svg_element("svg");
			path0 = svg_element("path");
			path1 = svg_element("path");
			path2 = svg_element("path");
			path3 = svg_element("path");
			path4 = svg_element("path");
			path5 = svg_element("path");
			path6 = svg_element("path");
			path7 = svg_element("path");
			attr_dev(path0, "d", "M41.34 6.14a5.72 5.72 0 00-3.37-.97 5.54 5.54 0 00-3.33.97 4.9 4.9 0 00-1.07 1 1.58 1.58 0 00-1.58-1.59h-.18a.3.3 0 00-.3.31V24a.3.3 0 00.3.31h.42a1.61 1.61 0 001.61-1.61v-4.37a5.18 5.18 0 00.8.72 5.56 5.56 0 003.33 1 5.72 5.72 0 003.37-.96 6.59 6.59 0 002.17-2.65 8.96 8.96 0 00.76-3.79 8.85 8.85 0 00-.76-3.78 6.37 6.37 0 00-2.17-2.72zm0 9.15a4.11 4.11 0 01-1.37 1.89 3.6 3.6 0 01-2.3.69 3.63 3.63 0 01-3.69-2.58 8.39 8.39 0 01-.44-2.75 7.57 7.57 0 01.44-2.76 4.2 4.2 0 011.34-1.85 3.63 3.63 0 012.28-.66 3.96 3.96 0 012.37.69 4.3 4.3 0 011.38 1.9 7.32 7.32 0 01.44 2.68 7.45 7.45 0 01-.45 2.75z");
			add_location(path0, file$a, 6, 8, 150);
			attr_dev(path1, "d", "M47.44 19.9h1.69a.3.3 0 00.31-.3V6.18a.3.3 0 00-.31-.3h-1.69a.3.3 0 00-.31.3V19.6a.3.3 0 00.31.3z");
			add_location(path1, file$a, 7, 8, 768);
			attr_dev(path2, "d", "M81.31 15.38h1.7a.3.3 0 00.3-.31V6.26a.3.3 0 00-.3-.31h-1.7a.3.3 0 00-.3.31v8.8a.3.3 0 00.3.32z");
			add_location(path2, file$a, 8, 8, 886);
			attr_dev(path3, "d", "M64.36 5.84h-1.97a.31.31 0 00-.27.14L58.4 11l-3.75-5.02a.44.44 0 00-.24-.14h-1.96a.31.31 0 00-.24.51l4.89 6.44-5 6.6a.32.32 0 00.25.52h1.96a.23.23 0 00.24-.14l3.85-5.2 3.86 5.23a.42.42 0 00.27.14h1.96a.31.31 0 00.24-.52l-4.99-6.6 4.89-6.44a.35.35 0 00-.27-.54z");
			add_location(path3, file$a, 9, 8, 1002);
			attr_dev(path4, "d", "M77.98 5.84h-1.96a.31.31 0 00-.28.14L72.03 11l-3.75-5.02a.44.44 0 00-.24-.14h-1.97a.31.31 0 00-.24.51l4.89 6.44-5.02 6.6a.32.32 0 00.24.52h1.96a.23.23 0 00.24-.14l3.85-5.2 3.86 5.2a.42.42 0 00.27.14h1.96a.31.31 0 00.24-.52l-4.99-6.6 4.89-6.44a.31.31 0 00-.24-.51z");
			add_location(path4, file$a, 10, 8, 1283);
			attr_dev(path5, "d", "M99.2 9.04a6.16 6.16 0 00-2.33-2.62 6.94 6.94 0 00-3.65-.96 6.68 6.68 0 00-3.58.93A6.26 6.26 0 0087.27 9a8.63 8.63 0 00-.83 3.9 8.58 8.58 0 00.83 3.84 6.4 6.4 0 002.34 2.62 7.37 7.37 0 007.22.03 6.16 6.16 0 002.34-2.61 8.63 8.63 0 00.83-3.89 8.05 8.05 0 00-.8-3.85zm-2.71 7.6a3.77 3.77 0 01-3.24 1.44 3.86 3.86 0 01-3.23-1.44 6.21 6.21 0 01-1.1-3.82 7.37 7.37 0 01.48-2.72 3.8 3.8 0 011.41-1.82 4.06 4.06 0 012.41-.66 3.84 3.84 0 013.23 1.41 6.1 6.1 0 011.07 3.79 5.92 5.92 0 01-1.03 3.82z");
			add_location(path5, file$a, 11, 8, 1567);
			attr_dev(path6, "class", "logoIcon svelte-bfa57z");
			attr_dev(path6, "d", "M81.31 19.77h1.7a.3.3 0 00.3-.31v-1.68a.3.3 0 00-.3-.31h-1.7a.3.3 0 00-.3.3v1.7a.3.3 0 00.3.3z");
			add_location(path6, file$a, 12, 8, 2077);
			attr_dev(path7, "class", "logoIcon svelte-bfa57z");
			attr_dev(path7, "d", "M13.18 25.78a13.48 13.48 0 01-6.75-1.82l-.68-.4v-3.4H2.27l-.41-.67A12.76 12.76 0 010 12.9 13.06 13.06 0 0113.18 0a13.06 13.06 0 0113.18 12.9 13.06 13.06 0 01-13.18 12.88zm-4.61-3.8a10.27 10.27 0 004.6 1.04A10.26 10.26 0 0023.54 12.9 10.23 10.23 0 0013.18 2.8 10.26 10.26 0 002.82 12.92a10.13 10.13 0 001.07 4.51h1.86v-4.5a7.37 7.37 0 017.43-7.28 7.37 7.37 0 017.43 7.27 7.37 7.37 0 01-7.43 7.27H8.57zm4.6-13.56a4.56 4.56 0 00-4.6 4.5v4.52h4.6a4.51 4.51 0 100-9.02z");
			add_location(path7, file$a, 13, 8, 2209);
			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg, "viewBox", "0 0 100 25.78");
			attr_dev(svg, "class", "svelte-bfa57z");
			add_location(svg, file$a, 5, 6, 77);
			attr_dev(div0, "class", "header__logo svelte-bfa57z");
			add_location(div0, file$a, 4, 2, 44);
			attr_dev(div1, "class", "header svelte-bfa57z");
			add_location(div1, file$a, 3, 1, 21);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);
			append_dev(div0, svg);
			append_dev(svg, path0);
			append_dev(svg, path1);
			append_dev(svg, path2);
			append_dev(svg, path3);
			append_dev(svg, path4);
			append_dev(svg, path5);
			append_dev(svg, path6);
			append_dev(svg, path7);
		},
		p: noop,
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$b.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$b($$self, $$props) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Logo", slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Logo> was created with unknown prop '${key}'`);
	});

	return [];
}

class Logo extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Logo",
			options,
			id: create_fragment$b.name
		});
	}
}

const showSelection = writable(false);
const searchTerm = writable('');
const format = writable('preview');
const allowTypes = writable([]);
const allowFormats = writable(null);
const changed = writable(1);
const maxFiles = writable(0);
const additionalResponseFields = writable([]);
const showFileName = writable(false);
const showFileType = writable(true);
const showFileSize = writable(true);

/* src/SearchField.svelte generated by Svelte v3.35.0 */
const file$9 = "src/SearchField.svelte";

function create_fragment$a(ctx) {
	let div1;
	let div0;
	let input_1;
	let t0;
	let label;
	let mounted;
	let dispose;

	const block = {
		c: function create() {
			div1 = element("div");
			div0 = element("div");
			input_1 = element("input");
			t0 = space();
			label = element("label");
			label.textContent = "Search";
			attr_dev(input_1, "id", "pixxio-search");
			attr_dev(input_1, "type", "text");
			attr_dev(input_1, "placeholder", " ");
			attr_dev(input_1, "class", "svelte-1snhqux");
			add_location(input_1, file$9, 18, 4, 341);
			attr_dev(label, "for", "pixxio-search");
			attr_dev(label, "class", "svelte-1snhqux");
			add_location(label, file$9, 19, 4, 438);
			attr_dev(div0, "class", "field svelte-1snhqux");
			add_location(div0, file$9, 17, 2, 317);
			attr_dev(div1, "class", "searchField fields svelte-1snhqux");
			add_location(div1, file$9, 16, 0, 282);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);
			append_dev(div0, input_1);
			set_input_value(input_1, /*value*/ ctx[0]);
			append_dev(div0, t0);
			append_dev(div0, label);

			if (!mounted) {
				dispose = [
					listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[2]),
					listen_dev(input_1, "input", /*input*/ ctx[1], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*value*/ 1 && input_1.value !== /*value*/ ctx[0]) {
				set_input_value(input_1, /*value*/ ctx[0]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$a.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$a($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("SearchField", slots, []);
	let { value = "" } = $$props;
	let timeout = null;

	const input = () => {
		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(
			() => {
				searchTerm.update(() => value);
			},
			200
		);
	};

	const writable_props = ["value"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SearchField> was created with unknown prop '${key}'`);
	});

	function input_1_input_handler() {
		value = this.value;
		$$invalidate(0, value);
	}

	$$self.$$set = $$props => {
		if ("value" in $$props) $$invalidate(0, value = $$props.value);
	};

	$$self.$capture_state = () => ({ searchTerm, value, timeout, input });

	$$self.$inject_state = $$props => {
		if ("value" in $$props) $$invalidate(0, value = $$props.value);
		if ("timeout" in $$props) timeout = $$props.timeout;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [value, input, input_1_input_handler];
}

class SearchField extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$a, create_fragment$a, safe_not_equal, { value: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "SearchField",
			options,
			id: create_fragment$a.name
		});
	}

	get value() {
		throw new Error("<SearchField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<SearchField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

function lang(key) {

  let lang = 'en';
  language.subscribe(value => lang = value);

  const lines = {
    de: {
      mediaspace: 'Mediaspace (example.px.media)',
      username: 'Username oder E-Mail',
      password: 'Passwort',
      signin: 'Anmelden',
      signin_description: 'Bitte melde dich in dein pixxio System an um Dateien auszuwählen.',
      signin_error: 'Ungültiger Benutzer oder Passwort',
      application_key_error: 'Das Plugin ist nicht für deinen Mediaspace freigegeben. Kontaktiere deinen Administrator oder support@pixx.io für weitere Informationen.',
      cancel: 'Abbrechen',
      select: 'Auswählen',
      selected: 'ausgewählt',
      please_select: 'Format wählen',
      original: 'Original',
      preview: 'Vorschau',
      logged_in_as: 'Du bist angemeldet als: ',
      logout: 'Ausloggen',
      duplicate_file: 'Duplikat: Die Datei existiert bereits.',
      success_upload_file: 'Die Datei wurde erfolgreich hochgeladen.',
      advanced: 'Erweiterte Einstellungen',
      proxy_connection_string: "Proxy Verbindung (http://127.0.0.1:8080)",
      proxy_protocol: "Proxy Protokoll",
      proxy_host: "Proxy Host",
      proxy_port: "Proxy Port",
      proxy_auth_username: "Username (optional)",
      proxy_auth_password: "Password (optional)",
    },
    en: {
      mediaspace: 'Mediaspace (example.px.media)',
      username: 'Username or email',
      password: 'Password',
      signin: 'Sign in',
      signin_description: 'Please sign in to your pixxio system to select files.',
      signin_error: 'Invalid username or password',
      application_key_error: 'The plugin is locked for your mediaspace. Contact your administrator or support@pixx.io for more information.',
      cancel: 'Cancel',
      select: 'Select',
      selected: 'selected',
      please_select: 'Choose a format',
      original: 'Original',
      preview: 'Preview',
      logged_in_as: 'You are logged in as: ',
      logout: 'Logout',
      duplicate_file: 'Duplicate file: The file already exists.',
      success_upload_file: 'File successfully uploaded.',
      advanced: 'Advanced settings',
      proxy_connection_string: "Proxy Connection (http://127.0.0.1:8080)",
      proxy_protocol: "Proxy Protocol",
      proxy_host: "Proxy Host",
      proxy_port: "Proxy Port",
      proxy_auth_username: "Username (optional)",
      proxy_auth_password: "Password (optional)",
    }
  };
  return lines[lang || 'en'][key];
}

/* src/Loading.svelte generated by Svelte v3.35.0 */
const file$8 = "src/Loading.svelte";

function create_fragment$9(ctx) {
	let div1;
	let div0;
	let svg;
	let path;

	const block = {
		c: function create() {
			div1 = element("div");
			div0 = element("div");
			svg = svg_element("svg");
			path = svg_element("path");
			attr_dev(path, "stroke", "black");
			attr_dev(path, "stroke-width", "5");
			attr_dev(path, "d", "M24.76 50.76v-13c0-7.17 5.94-13 13.25-13s13.25 5.83 13.25 13c0 7.18-5.94 13-13.25 13H26.27l-11.17.38s-3.34-8.2-3.34-12.88a26.51 26.51 0 0126.5-26.5 26.51 26.51 0 0126.5 26.5 26.51 26.51 0 01-26.5 26.5c-4.85 0-9.58-1.3-13.5-3.6z");
			attr_dev(path, "fill", "none");
			attr_dev(path, "class", "svelte-fhr97u");
			add_location(path, file$8, 6, 86, 183);
			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg, "id", "pixxioIcon");
			attr_dev(svg, "viewBox", "0 0 76.52 76.52");
			attr_dev(svg, "class", "svelte-fhr97u");
			add_location(svg, file$8, 6, 4, 101);
			attr_dev(div0, "class", "svelte-fhr97u");
			add_location(div0, file$8, 5, 2, 91);
			attr_dev(div1, "id", "pixxio-ta-loading");
			attr_dev(div1, "class", "svelte-fhr97u");
			add_location(div1, file$8, 4, 0, 60);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);
			append_dev(div0, svg);
			append_dev(svg, path);
		},
		p: noop,
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$9.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$9($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Loading", slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Loading> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ lang });
	return [];
}

class Loading extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Loading",
			options,
			id: create_fragment$9.name
		});
	}
}

/* src/Login.svelte generated by Svelte v3.35.0 */

const { console: console_1$2 } = globals;
const file$7 = "src/Login.svelte";

// (110:2) {#if !$domain}
function create_if_block_5$1(ctx) {
	let div;
	let input;
	let t0;
	let label;
	let mounted;
	let dispose;

	const block = {
		c: function create() {
			div = element("div");
			input = element("input");
			t0 = space();
			label = element("label");
			label.textContent = `${lang("mediaspace")}`;
			attr_dev(input, "id", "pixxio-mediaspace");
			input.disabled = /*isLoading*/ ctx[3];
			attr_dev(input, "type", "text");
			attr_dev(input, "placeholder", " ");
			attr_dev(input, "class", "svelte-1q3uqb");
			add_location(input, file$7, 111, 4, 3100);
			attr_dev(label, "for", "pixxio-mediaspace");
			attr_dev(label, "class", "svelte-1q3uqb");
			add_location(label, file$7, 112, 4, 3212);
			attr_dev(div, "class", "field svelte-1q3uqb");
			add_location(div, file$7, 110, 2, 3076);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, input);
			set_input_value(input, /*mediaspace*/ ctx[4]);
			append_dev(div, t0);
			append_dev(div, label);

			if (!mounted) {
				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[12]);
				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			if (dirty & /*isLoading*/ 8) {
				prop_dev(input, "disabled", /*isLoading*/ ctx[3]);
			}

			if (dirty & /*mediaspace*/ 16 && input.value !== /*mediaspace*/ ctx[4]) {
				set_input_value(input, /*mediaspace*/ ctx[4]);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_5$1.name,
		type: "if",
		source: "(110:2) {#if !$domain}",
		ctx
	});

	return block;
}

// (124:2) {#if $askForProxy}
function create_if_block_3$2(ctx) {
	let small;
	let a;
	let t1;
	let if_block_anchor;
	let mounted;
	let dispose;
	let if_block = /*showAdvancedSettings*/ ctx[6] && create_if_block_4$1(ctx);

	const block = {
		c: function create() {
			small = element("small");
			a = element("a");
			a.textContent = `${lang("advanced")}`;
			t1 = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
			attr_dev(a, "href", "#");
			attr_dev(a, "class", "advanced svelte-1q3uqb");
			add_location(a, file$7, 124, 11, 3723);
			attr_dev(small, "class", "svelte-1q3uqb");
			add_location(small, file$7, 124, 4, 3716);
		},
		m: function mount(target, anchor) {
			insert_dev(target, small, anchor);
			append_dev(small, a);
			insert_dev(target, t1, anchor);
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);

			if (!mounted) {
				dispose = listen_dev(a, "click", /*click_handler*/ ctx[15], false, false, false);
				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			if (/*showAdvancedSettings*/ ctx[6]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_4$1(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(small);
			if (detaching) detach_dev(t1);
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3$2.name,
		type: "if",
		source: "(124:2) {#if $askForProxy}",
		ctx
	});

	return block;
}

// (126:4) {#if showAdvancedSettings }
function create_if_block_4$1(ctx) {
	let br0;
	let t0;
	let br1;
	let t1;
	let div0;
	let input0;
	let t2;
	let label0;
	let t4;
	let div1;
	let input1;
	let t5;
	let label1;
	let t7;
	let div2;
	let input2;
	let t8;
	let label2;
	let mounted;
	let dispose;

	const block = {
		c: function create() {
			br0 = element("br");
			t0 = space();
			br1 = element("br");
			t1 = space();
			div0 = element("div");
			input0 = element("input");
			t2 = space();
			label0 = element("label");
			label0.textContent = `${lang("proxy_connection_string")}`;
			t4 = space();
			div1 = element("div");
			input1 = element("input");
			t5 = space();
			label1 = element("label");
			label1.textContent = `${lang("proxy_auth_username")}`;
			t7 = space();
			div2 = element("div");
			input2 = element("input");
			t8 = space();
			label2 = element("label");
			label2.textContent = `${lang("proxy_auth_password")}`;
			add_location(br0, file$7, 126, 4, 3881);
			add_location(br1, file$7, 127, 4, 3890);
			attr_dev(input0, "id", "pixxio-host");
			input0.disabled = /*isLoading*/ ctx[3];
			attr_dev(input0, "type", "text");
			attr_dev(input0, "placeholder", " ");
			attr_dev(input0, "class", "svelte-1q3uqb");
			add_location(input0, file$7, 129, 6, 3925);
			attr_dev(label0, "for", "pixxio-host");
			attr_dev(label0, "class", "svelte-1q3uqb");
			add_location(label0, file$7, 130, 6, 4050);
			attr_dev(div0, "class", "field svelte-1q3uqb");
			add_location(div0, file$7, 128, 4, 3899);
			attr_dev(input1, "id", "pixxio-auth-username");
			input1.disabled = /*isLoading*/ ctx[3];
			attr_dev(input1, "type", "text");
			attr_dev(input1, "placeholder", " ");
			attr_dev(input1, "class", "svelte-1q3uqb");
			add_location(input1, file$7, 133, 6, 4158);
			attr_dev(label1, "for", "pixxio-auth-username");
			attr_dev(label1, "class", "svelte-1q3uqb");
			add_location(label1, file$7, 134, 6, 4289);
			attr_dev(div1, "class", "field svelte-1q3uqb");
			add_location(div1, file$7, 132, 4, 4132);
			attr_dev(input2, "id", "pixxio-auth-password");
			input2.disabled = /*isLoading*/ ctx[3];
			attr_dev(input2, "type", "password");
			attr_dev(input2, "placeholder", " ");
			attr_dev(input2, "class", "svelte-1q3uqb");
			add_location(input2, file$7, 137, 6, 4402);
			attr_dev(label2, "for", "pixxio-auth-password");
			attr_dev(label2, "class", "svelte-1q3uqb");
			add_location(label2, file$7, 138, 6, 4537);
			attr_dev(div2, "class", "field svelte-1q3uqb");
			add_location(div2, file$7, 136, 4, 4376);
		},
		m: function mount(target, anchor) {
			insert_dev(target, br0, anchor);
			insert_dev(target, t0, anchor);
			insert_dev(target, br1, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, div0, anchor);
			append_dev(div0, input0);
			set_input_value(input0, /*proxyInput*/ ctx[7].connectionString);
			append_dev(div0, t2);
			append_dev(div0, label0);
			insert_dev(target, t4, anchor);
			insert_dev(target, div1, anchor);
			append_dev(div1, input1);
			set_input_value(input1, /*proxyInput*/ ctx[7].auth.username);
			append_dev(div1, t5);
			append_dev(div1, label1);
			insert_dev(target, t7, anchor);
			insert_dev(target, div2, anchor);
			append_dev(div2, input2);
			set_input_value(input2, /*proxyInput*/ ctx[7].auth.password);
			append_dev(div2, t8);
			append_dev(div2, label2);

			if (!mounted) {
				dispose = [
					listen_dev(input0, "input", /*input0_input_handler_1*/ ctx[16]),
					listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[17]),
					listen_dev(input2, "input", /*input2_input_handler*/ ctx[18])
				];

				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			if (dirty & /*isLoading*/ 8) {
				prop_dev(input0, "disabled", /*isLoading*/ ctx[3]);
			}

			if (dirty & /*proxyInput*/ 128 && input0.value !== /*proxyInput*/ ctx[7].connectionString) {
				set_input_value(input0, /*proxyInput*/ ctx[7].connectionString);
			}

			if (dirty & /*isLoading*/ 8) {
				prop_dev(input1, "disabled", /*isLoading*/ ctx[3]);
			}

			if (dirty & /*proxyInput*/ 128 && input1.value !== /*proxyInput*/ ctx[7].auth.username) {
				set_input_value(input1, /*proxyInput*/ ctx[7].auth.username);
			}

			if (dirty & /*isLoading*/ 8) {
				prop_dev(input2, "disabled", /*isLoading*/ ctx[3]);
			}

			if (dirty & /*proxyInput*/ 128 && input2.value !== /*proxyInput*/ ctx[7].auth.password) {
				set_input_value(input2, /*proxyInput*/ ctx[7].auth.password);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(br0);
			if (detaching) detach_dev(t0);
			if (detaching) detach_dev(br1);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(div0);
			if (detaching) detach_dev(t4);
			if (detaching) detach_dev(div1);
			if (detaching) detach_dev(t7);
			if (detaching) detach_dev(div2);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_4$1.name,
		type: "if",
		source: "(126:4) {#if showAdvancedSettings }",
		ctx
	});

	return block;
}

// (143:2) {#if hasError && !applicationKeyIsLocked}
function create_if_block_2$4(ctx) {
	let small;

	const block = {
		c: function create() {
			small = element("small");
			small.textContent = `${lang("signin_error")}`;
			attr_dev(small, "class", "error svelte-1q3uqb");
			add_location(small, file$7, 143, 2, 4684);
		},
		m: function mount(target, anchor) {
			insert_dev(target, small, anchor);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(small);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2$4.name,
		type: "if",
		source: "(143:2) {#if hasError && !applicationKeyIsLocked}",
		ctx
	});

	return block;
}

// (146:2) {#if hasError && applicationKeyIsLocked}
function create_if_block_1$6(ctx) {
	let small;

	const block = {
		c: function create() {
			small = element("small");
			small.textContent = `${lang("application_key_error")}`;
			attr_dev(small, "class", "error svelte-1q3uqb");
			add_location(small, file$7, 146, 2, 4789);
		},
		m: function mount(target, anchor) {
			insert_dev(target, small, anchor);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(small);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$6.name,
		type: "if",
		source: "(146:2) {#if hasError && applicationKeyIsLocked}",
		ctx
	});

	return block;
}

// (152:2) {#if isLoading}
function create_if_block$6(ctx) {
	let loading;
	let current;
	loading = new Loading({ $$inline: true });

	const block = {
		c: function create() {
			create_component(loading.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(loading, target, anchor);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(loading.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(loading.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(loading, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$6.name,
		type: "if",
		source: "(152:2) {#if isLoading}",
		ctx
	});

	return block;
}

function create_fragment$8(ctx) {
	let div3;
	let h2;
	let t1;
	let p;
	let t3;
	let t4;
	let div0;
	let input0;
	let t5;
	let label0;
	let t7;
	let div1;
	let input1;
	let t8;
	let label1;
	let t10;
	let t11;
	let t12;
	let t13;
	let div2;
	let button;
	let t14_value = lang("signin") + "";
	let t14;
	let t15;
	let current;
	let mounted;
	let dispose;
	let if_block0 = !/*$domain*/ ctx[8] && create_if_block_5$1(ctx);
	let if_block1 = /*$askForProxy*/ ctx[10] && create_if_block_3$2(ctx);
	let if_block2 = /*hasError*/ ctx[2] && !/*applicationKeyIsLocked*/ ctx[5] && create_if_block_2$4(ctx);
	let if_block3 = /*hasError*/ ctx[2] && /*applicationKeyIsLocked*/ ctx[5] && create_if_block_1$6(ctx);
	let if_block4 = /*isLoading*/ ctx[3] && create_if_block$6(ctx);

	const block = {
		c: function create() {
			div3 = element("div");
			h2 = element("h2");
			h2.textContent = `${lang("signin")}`;
			t1 = space();
			p = element("p");
			p.textContent = `${lang("signin_description")}`;
			t3 = space();
			if (if_block0) if_block0.c();
			t4 = space();
			div0 = element("div");
			input0 = element("input");
			t5 = space();
			label0 = element("label");
			label0.textContent = `${lang("username")}`;
			t7 = space();
			div1 = element("div");
			input1 = element("input");
			t8 = space();
			label1 = element("label");
			label1.textContent = `${lang("password")}`;
			t10 = space();
			if (if_block1) if_block1.c();
			t11 = space();
			if (if_block2) if_block2.c();
			t12 = space();
			if (if_block3) if_block3.c();
			t13 = space();
			div2 = element("div");
			button = element("button");
			t14 = text(t14_value);
			t15 = space();
			if (if_block4) if_block4.c();
			attr_dev(h2, "class", "svelte-1q3uqb");
			add_location(h2, file$7, 107, 2, 2993);
			attr_dev(p, "class", "svelte-1q3uqb");
			add_location(p, file$7, 108, 2, 3021);
			attr_dev(input0, "id", "pixxio-username");
			input0.disabled = /*isLoading*/ ctx[3];
			attr_dev(input0, "type", "text");
			attr_dev(input0, "placeholder", " ");
			attr_dev(input0, "class", "svelte-1q3uqb");
			add_location(input0, file$7, 116, 4, 3315);
			attr_dev(label0, "for", "pixxio-username");
			attr_dev(label0, "class", "svelte-1q3uqb");
			add_location(label0, file$7, 117, 4, 3423);
			attr_dev(div0, "class", "field svelte-1q3uqb");
			add_location(div0, file$7, 115, 2, 3291);
			attr_dev(input1, "id", "pixxio-password");
			input1.disabled = /*isLoading*/ ctx[3];
			attr_dev(input1, "type", "password");
			attr_dev(input1, "placeholder", " ");
			attr_dev(input1, "class", "svelte-1q3uqb");
			add_location(input1, file$7, 120, 4, 3514);
			attr_dev(label1, "for", "pixxio-password");
			attr_dev(label1, "class", "svelte-1q3uqb");
			add_location(label1, file$7, 121, 4, 3626);
			attr_dev(div1, "class", "field svelte-1q3uqb");
			add_location(div1, file$7, 119, 2, 3490);
			attr_dev(button, "class", "button svelte-1q3uqb");
			attr_dev(button, "type", "submit");
			button.disabled = /*isLoading*/ ctx[3];
			add_location(button, file$7, 149, 4, 4912);
			attr_dev(div2, "class", "buttonGroup buttonGroup--fullSize svelte-1q3uqb");
			add_location(div2, file$7, 148, 2, 4860);
			attr_dev(div3, "class", "login fields svelte-1q3uqb");
			toggle_class(div3, "no-modal", !/*$modal*/ ctx[9]);
			add_location(div3, file$7, 106, 0, 2937);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div3, anchor);
			append_dev(div3, h2);
			append_dev(div3, t1);
			append_dev(div3, p);
			append_dev(div3, t3);
			if (if_block0) if_block0.m(div3, null);
			append_dev(div3, t4);
			append_dev(div3, div0);
			append_dev(div0, input0);
			set_input_value(input0, /*username*/ ctx[0]);
			append_dev(div0, t5);
			append_dev(div0, label0);
			append_dev(div3, t7);
			append_dev(div3, div1);
			append_dev(div1, input1);
			set_input_value(input1, /*password*/ ctx[1]);
			append_dev(div1, t8);
			append_dev(div1, label1);
			append_dev(div3, t10);
			if (if_block1) if_block1.m(div3, null);
			append_dev(div3, t11);
			if (if_block2) if_block2.m(div3, null);
			append_dev(div3, t12);
			if (if_block3) if_block3.m(div3, null);
			append_dev(div3, t13);
			append_dev(div3, div2);
			append_dev(div2, button);
			append_dev(button, t14);
			append_dev(div3, t15);
			if (if_block4) if_block4.m(div3, null);
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(input0, "input", /*input0_input_handler*/ ctx[13]),
					listen_dev(input1, "input", /*input1_input_handler*/ ctx[14]),
					listen_dev(button, "click", /*login*/ ctx[11], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (!/*$domain*/ ctx[8]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_5$1(ctx);
					if_block0.c();
					if_block0.m(div3, t4);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (!current || dirty & /*isLoading*/ 8) {
				prop_dev(input0, "disabled", /*isLoading*/ ctx[3]);
			}

			if (dirty & /*username*/ 1 && input0.value !== /*username*/ ctx[0]) {
				set_input_value(input0, /*username*/ ctx[0]);
			}

			if (!current || dirty & /*isLoading*/ 8) {
				prop_dev(input1, "disabled", /*isLoading*/ ctx[3]);
			}

			if (dirty & /*password*/ 2 && input1.value !== /*password*/ ctx[1]) {
				set_input_value(input1, /*password*/ ctx[1]);
			}

			if (/*$askForProxy*/ ctx[10]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_3$2(ctx);
					if_block1.c();
					if_block1.m(div3, t11);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (/*hasError*/ ctx[2] && !/*applicationKeyIsLocked*/ ctx[5]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_2$4(ctx);
					if_block2.c();
					if_block2.m(div3, t12);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (/*hasError*/ ctx[2] && /*applicationKeyIsLocked*/ ctx[5]) {
				if (if_block3) {
					if_block3.p(ctx, dirty);
				} else {
					if_block3 = create_if_block_1$6(ctx);
					if_block3.c();
					if_block3.m(div3, t13);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}

			if (!current || dirty & /*isLoading*/ 8) {
				prop_dev(button, "disabled", /*isLoading*/ ctx[3]);
			}

			if (/*isLoading*/ ctx[3]) {
				if (if_block4) {
					if (dirty & /*isLoading*/ 8) {
						transition_in(if_block4, 1);
					}
				} else {
					if_block4 = create_if_block$6(ctx);
					if_block4.c();
					transition_in(if_block4, 1);
					if_block4.m(div3, null);
				}
			} else if (if_block4) {
				group_outros();

				transition_out(if_block4, 1, 1, () => {
					if_block4 = null;
				});

				check_outros();
			}

			if (dirty & /*$modal*/ 512) {
				toggle_class(div3, "no-modal", !/*$modal*/ ctx[9]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block4);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block4);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div3);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			if (if_block3) if_block3.d();
			if (if_block4) if_block4.d();
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$8.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$8($$self, $$props, $$invalidate) {
	let $domain;
	let $appKey;
	let $modal;
	let $askForProxy;
	validate_store(domain, "domain");
	component_subscribe($$self, domain, $$value => $$invalidate(8, $domain = $$value));
	validate_store(appKey, "appKey");
	component_subscribe($$self, appKey, $$value => $$invalidate(19, $appKey = $$value));
	validate_store(modal, "modal");
	component_subscribe($$self, modal, $$value => $$invalidate(9, $modal = $$value));
	validate_store(askForProxy, "askForProxy");
	component_subscribe($$self, askForProxy, $$value => $$invalidate(10, $askForProxy = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Login", slots, []);
	const dispatch = createEventDispatcher();
	const api = new API();
	let username = "";
	let password = "";
	let hasError = false;
	let isLoading = false;
	let mediaspace = "";
	let applicationKeyIsLocked = false;
	let showAdvancedSettings = false;

	let proxyInput = {
		connectionString: "",
		auth: { username: "", password: "" }
	};

	/**
 * check if there is a refreshToken in storage
 */
	const token = localStorage.getItem("refreshToken");

	mediaspace = localStorage.getItem("domain");

	if (mediaspace) {
		domain.update(() => mediaspace);
	}

	if (token && ($domain || mediaspace)) {
		isLoading = true;
		refreshToken.update(() => token);

		api.callAccessToken().then(() => {
			$$invalidate(3, isLoading = false);
			dispatch("authenticated");
		}).catch(e => {
			refreshToken.update(() => "");
			$$invalidate(3, isLoading = false);
			$$invalidate(5, applicationKeyIsLocked = e.errorcode === 15016);
		});
	}

	const login = async () => {
		try {
			$$invalidate(3, isLoading = true);
			$$invalidate(2, hasError = false);
			$$invalidate(4, mediaspace = mediaspace.replace(/(http|https):\/\//, "").trim());
			const formData = new FormData();
			formData.set("applicationKey", $appKey);
			formData.set("userNameOrEmail", username.trim());
			formData.set("password", password.trim());
			let tempProxy = null;

			if (proxyInput.connectionString) {
				const proxyParts = proxyInput.connectionString.split(":");

				tempProxy = {
					protocol: (/^http/gi).test(proxyParts[0]) ? proxyParts[0] : "http",
					host: (/^http/gi).test(proxyParts[0])
					? proxyParts[1].replace("//", "")
					: proxyParts[0].replace("//", ""),
					port: ((/^http/gi).test(proxyParts[0])
					? proxyParts[2]
					: proxyParts[1]) || "",
					auth: proxyInput.auth
				};

				localStorage.setItem("proxy", JSON.stringify(tempProxy));
			}

			const response = await axios({
				url: `https://${mediaspace}/gobackend/login`,
				method: "POST",
				data: formData
			});

			$$invalidate(3, isLoading = false);

			if (!response.data.success) {
				$$invalidate(2, hasError = true);
				throw response.data;
			}

			// store refreshToken 
			refreshToken.update(() => response.data.refreshToken);

			domain.update(() => mediaspace);
			localStorage.setItem("domain", mediaspace);
			localStorage.setItem("refreshToken", response.data.refreshToken);

			api.callAccessToken().then(() => {
				dispatch("authenticated");
			});
		} catch(error) {
			$$invalidate(3, isLoading = false);
			$$invalidate(2, hasError = true);
			console.log(error);
			$$invalidate(5, applicationKeyIsLocked = error.errorcode === 15016);
		}
	};

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Login> was created with unknown prop '${key}'`);
	});

	function input_input_handler() {
		mediaspace = this.value;
		$$invalidate(4, mediaspace);
	}

	function input0_input_handler() {
		username = this.value;
		$$invalidate(0, username);
	}

	function input1_input_handler() {
		password = this.value;
		$$invalidate(1, password);
	}

	const click_handler = () => $$invalidate(6, showAdvancedSettings = !showAdvancedSettings);

	function input0_input_handler_1() {
		proxyInput.connectionString = this.value;
		$$invalidate(7, proxyInput);
	}

	function input1_input_handler_1() {
		proxyInput.auth.username = this.value;
		$$invalidate(7, proxyInput);
	}

	function input2_input_handler() {
		proxyInput.auth.password = this.value;
		$$invalidate(7, proxyInput);
	}

	$$self.$capture_state = () => ({
		createEventDispatcher,
		lang,
		domain,
		appKey,
		refreshToken,
		modal,
		askForProxy,
		API,
		Loading,
		axios,
		dispatch,
		api,
		username,
		password,
		hasError,
		isLoading,
		mediaspace,
		applicationKeyIsLocked,
		showAdvancedSettings,
		proxyInput,
		token,
		login,
		$domain,
		$appKey,
		$modal,
		$askForProxy
	});

	$$self.$inject_state = $$props => {
		if ("username" in $$props) $$invalidate(0, username = $$props.username);
		if ("password" in $$props) $$invalidate(1, password = $$props.password);
		if ("hasError" in $$props) $$invalidate(2, hasError = $$props.hasError);
		if ("isLoading" in $$props) $$invalidate(3, isLoading = $$props.isLoading);
		if ("mediaspace" in $$props) $$invalidate(4, mediaspace = $$props.mediaspace);
		if ("applicationKeyIsLocked" in $$props) $$invalidate(5, applicationKeyIsLocked = $$props.applicationKeyIsLocked);
		if ("showAdvancedSettings" in $$props) $$invalidate(6, showAdvancedSettings = $$props.showAdvancedSettings);
		if ("proxyInput" in $$props) $$invalidate(7, proxyInput = $$props.proxyInput);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		username,
		password,
		hasError,
		isLoading,
		mediaspace,
		applicationKeyIsLocked,
		showAdvancedSettings,
		proxyInput,
		$domain,
		$modal,
		$askForProxy,
		login,
		input_input_handler,
		input0_input_handler,
		input1_input_handler,
		click_handler,
		input0_input_handler_1,
		input1_input_handler_1,
		input2_input_handler
	];
}

class Login extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Login",
			options,
			id: create_fragment$8.name
		});
	}
}

/* src/DownloadFormats.svelte generated by Svelte v3.35.0 */

const { Error: Error_1$3 } = globals;
const file$6 = "src/DownloadFormats.svelte";

function get_each_context$2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[14] = list[i];
	return child_ctx;
}

// (71:0) {#if !hideDropdown}
function create_if_block$5(ctx) {
	let div1;
	let div0;
	let select_1;
	let if_block0_anchor;
	let if_block1_anchor;
	let t0;
	let label;
	let mounted;
	let dispose;
	let if_block0 = /*showPreview*/ ctx[4] && create_if_block_2$3(ctx);
	let if_block1 = /*showOriginal*/ ctx[3] && create_if_block_1$5(ctx);
	let each_value = /*formats*/ ctx[1];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
	}

	const block = {
		c: function create() {
			div1 = element("div");
			div0 = element("div");
			select_1 = element("select");
			if (if_block0) if_block0.c();
			if_block0_anchor = empty();
			if (if_block1) if_block1.c();
			if_block1_anchor = empty();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t0 = space();
			label = element("label");
			label.textContent = `${lang("please_select")}`;
			attr_dev(select_1, "name", "");
			attr_dev(select_1, "id", "pixxioDownloadFormats__dropdown");
			attr_dev(select_1, "placeholder", " ");
			attr_dev(select_1, "class", "svelte-1lpolpy");
			if (/*selected*/ ctx[0] === void 0) add_render_callback(() => /*select_1_change_handler*/ ctx[7].call(select_1));
			add_location(select_1, file$6, 73, 4, 1934);
			attr_dev(label, "for", "pixxioDownloadFormats__dropdown");
			attr_dev(label, "class", "svelte-1lpolpy");
			add_location(label, file$6, 84, 4, 2351);
			attr_dev(div0, "class", "field svelte-1lpolpy");
			add_location(div0, file$6, 72, 2, 1910);
			attr_dev(div1, "class", "downloadFormats fields svelte-1lpolpy");
			add_location(div1, file$6, 71, 0, 1871);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);
			append_dev(div0, select_1);
			if (if_block0) if_block0.m(select_1, null);
			append_dev(select_1, if_block0_anchor);
			if (if_block1) if_block1.m(select_1, null);
			append_dev(select_1, if_block1_anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select_1, null);
			}

			select_option(select_1, /*selected*/ ctx[0]);
			append_dev(div0, t0);
			append_dev(div0, label);

			if (!mounted) {
				dispose = [
					listen_dev(select_1, "change", /*select_1_change_handler*/ ctx[7]),
					listen_dev(select_1, "blur", /*select*/ ctx[5], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			if (/*showPreview*/ ctx[4]) if_block0.p(ctx, dirty);
			if (/*showOriginal*/ ctx[3]) if_block1.p(ctx, dirty);

			if (dirty & /*formats*/ 2) {
				each_value = /*formats*/ ctx[1];
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$2(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(select_1, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (dirty & /*selected, formats*/ 3) {
				select_option(select_1, /*selected*/ ctx[0]);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			destroy_each(each_blocks, detaching);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$5.name,
		type: "if",
		source: "(71:0) {#if !hideDropdown}",
		ctx
	});

	return block;
}

// (75:6) {#if showPreview}
function create_if_block_2$3(ctx) {
	let option;

	const block = {
		c: function create() {
			option = element("option");
			option.textContent = `${lang("preview")}`;
			option.__value = "preview";
			option.value = option.__value;
			add_location(option, file$6, 75, 6, 2073);
		},
		m: function mount(target, anchor) {
			insert_dev(target, option, anchor);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(option);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2$3.name,
		type: "if",
		source: "(75:6) {#if showPreview}",
		ctx
	});

	return block;
}

// (78:6) {#if showOriginal}
function create_if_block_1$5(ctx) {
	let option;

	const block = {
		c: function create() {
			option = element("option");
			option.textContent = `${lang("original")}`;
			option.__value = "original";
			option.value = option.__value;
			add_location(option, file$6, 78, 6, 2167);
		},
		m: function mount(target, anchor) {
			insert_dev(target, option, anchor);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(option);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$5.name,
		type: "if",
		source: "(78:6) {#if showOriginal}",
		ctx
	});

	return block;
}

// (81:6) {#each formats as format}
function create_each_block$2(ctx) {
	let option;
	let t_value = /*format*/ ctx[14].name + "";
	let t;
	let option_value_value;

	const block = {
		c: function create() {
			option = element("option");
			t = text(t_value);
			option.__value = option_value_value = /*format*/ ctx[14].id;
			option.value = option.__value;
			add_location(option, file$6, 81, 6, 2270);
		},
		m: function mount(target, anchor) {
			insert_dev(target, option, anchor);
			append_dev(option, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*formats*/ 2 && t_value !== (t_value = /*format*/ ctx[14].name + "")) set_data_dev(t, t_value);

			if (dirty & /*formats*/ 2 && option_value_value !== (option_value_value = /*format*/ ctx[14].id)) {
				prop_dev(option, "__value", option_value_value);
				option.value = option.__value;
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(option);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$2.name,
		type: "each",
		source: "(81:6) {#each formats as format}",
		ctx
	});

	return block;
}

function create_fragment$7(ctx) {
	let if_block_anchor;
	let if_block = !/*hideDropdown*/ ctx[2] && create_if_block$5(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error_1$3("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
		},
		p: function update(ctx, [dirty]) {
			if (!/*hideDropdown*/ ctx[2]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$5(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$7.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$7($$self, $$props, $$invalidate) {
	let hideDropdown;
	let $allowFormats;
	validate_store(allowFormats, "allowFormats");
	component_subscribe($$self, allowFormats, $$value => $$invalidate(6, $allowFormats = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("DownloadFormats", slots, []);
	const dispatch = createEventDispatcher();
	const api = new API();
	let selected;
	let formats = [];
	let hasError = false;
	let isLoading = false;
	let showOriginal = $allowFormats === null || $allowFormats !== null && $allowFormats.includes("original");
	let showPreview = $allowFormats === null || $allowFormats !== null && $allowFormats.includes("preview");

	onMount(() => {
		if ($allowFormats && $allowFormats.length === 1) {
			$$invalidate(0, selected = $allowFormats[0]);
			format.update(() => $allowFormats[0]);
			$$invalidate(2, hideDropdown = true);
		} else {
			fetchDownloadFormats();
			select();
		}
	});

	const changes = () => {
		if ($allowFormats && $allowFormats.length === 1) {
			$$invalidate(0, selected = $allowFormats[0]);
			format.update(() => $allowFormats[0]);
			$$invalidate(2, hideDropdown = true);
		} else {
			fetchDownloadFormats();
			select();
		}
	};

	const select = () => {
		format.update(() => selected);
	};

	const fetchDownloadFormats = async () => {
		try {
			isLoading = true;
			const options = { responseFields: ["id", "name"] };
			const data = await api.get(`/downloadFormats`, options);

			if (!data.success) {
				throw new Error(data.errormessage);
			}

			$$invalidate(1, formats = data.downloadFormats.filter(format => allowedFormats === null || $allowFormats !== null && allowedFormats.includes(format.id)));
			isLoading = false;
		} catch(e) {
			hasError = true;
			isLoading = false;
		}
	};

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DownloadFormats> was created with unknown prop '${key}'`);
	});

	function select_1_change_handler() {
		selected = select_value(this);
		$$invalidate(0, selected);
		$$invalidate(1, formats);
	}

	$$self.$capture_state = () => ({
		afterUpdate,
		beforeUpdate,
		createEventDispatcher,
		onMount,
		API,
		format,
		lang,
		allowFormats,
		dispatch,
		api,
		selected,
		formats,
		hasError,
		isLoading,
		showOriginal,
		showPreview,
		changes,
		select,
		fetchDownloadFormats,
		$allowFormats,
		hideDropdown
	});

	$$self.$inject_state = $$props => {
		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
		if ("formats" in $$props) $$invalidate(1, formats = $$props.formats);
		if ("hasError" in $$props) hasError = $$props.hasError;
		if ("isLoading" in $$props) isLoading = $$props.isLoading;
		if ("showOriginal" in $$props) $$invalidate(3, showOriginal = $$props.showOriginal);
		if ("showPreview" in $$props) $$invalidate(4, showPreview = $$props.showPreview);
		if ("hideDropdown" in $$props) $$invalidate(2, hideDropdown = $$props.hideDropdown);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$allowFormats*/ 64) {
			$$invalidate(2, hideDropdown = ($allowFormats || []).length === 1);
		}

		if ($$self.$$.dirty & /*$allowFormats*/ 64) {
			(changes());
		}
	};

	return [
		selected,
		formats,
		hideDropdown,
		showOriginal,
		showPreview,
		select,
		$allowFormats,
		select_1_change_handler
	];
}

class DownloadFormats extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "DownloadFormats",
			options,
			id: create_fragment$7.name
		});
	}
}

/* src/Selection.svelte generated by Svelte v3.35.0 */
const file$5 = "src/Selection.svelte";

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[3] = list[i];
	return child_ctx;
}

// (12:2) {#if showSelection}
function create_if_block_1$4(ctx) {
	let each_1_anchor;
	let each_value = /*selected*/ ctx[1];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	const block = {
		c: function create() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m: function mount(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert_dev(target, each_1_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*dispatch, selected*/ 6) {
				each_value = /*selected*/ ctx[1];
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		d: function destroy(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(each_1_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$4.name,
		type: "if",
		source: "(12:2) {#if showSelection}",
		ctx
	});

	return block;
}

// (13:4) {#each selected as file}
function create_each_block$1(ctx) {
	let li;
	let img;
	let img_src_value;
	let img_alt_value;
	let t;
	let mounted;
	let dispose;

	const block = {
		c: function create() {
			li = element("li");
			img = element("img");
			t = space();
			attr_dev(img, "loading", "lazy");
			if (img.src !== (img_src_value = /*file*/ ctx[3].imagePath || /*file*/ ctx[3].modifiedPreviewFileURLs[0])) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", img_alt_value = /*file*/ ctx[3].fileName);
			attr_dev(img, "class", "svelte-1y7flg5");
			add_location(img, file$5, 14, 8, 383);
			attr_dev(li, "class", "pixxioSelection__file svelte-1y7flg5");
			add_location(li, file$5, 13, 6, 302);
		},
		m: function mount(target, anchor) {
			insert_dev(target, li, anchor);
			append_dev(li, img);
			append_dev(li, t);

			if (!mounted) {
				dispose = listen_dev(
					li,
					"click",
					function () {
						if (is_function(/*dispatch*/ ctx[2]("deselect", /*file*/ ctx[3]))) /*dispatch*/ ctx[2]("deselect", /*file*/ ctx[3]).apply(this, arguments);
					},
					false,
					false,
					false
				);

				mounted = true;
			}
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;

			if (dirty & /*selected*/ 2 && img.src !== (img_src_value = /*file*/ ctx[3].imagePath || /*file*/ ctx[3].modifiedPreviewFileURLs[0])) {
				attr_dev(img, "src", img_src_value);
			}

			if (dirty & /*selected*/ 2 && img_alt_value !== (img_alt_value = /*file*/ ctx[3].fileName)) {
				attr_dev(img, "alt", img_alt_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(li);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$1.name,
		type: "each",
		source: "(13:4) {#each selected as file}",
		ctx
	});

	return block;
}

// (19:2) {#if selectedFiles.length > 3}
function create_if_block$4(ctx) {
	let li;
	let t0;
	let t1_value = /*selectedFiles*/ ctx[0].length - /*selected*/ ctx[1].length + "";
	let t1;

	const block = {
		c: function create() {
			li = element("li");
			t0 = text("+ ");
			t1 = text(t1_value);
			attr_dev(li, "class", "svelte-1y7flg5");
			add_location(li, file$5, 19, 2, 547);
		},
		m: function mount(target, anchor) {
			insert_dev(target, li, anchor);
			append_dev(li, t0);
			append_dev(li, t1);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*selectedFiles, selected*/ 3 && t1_value !== (t1_value = /*selectedFiles*/ ctx[0].length - /*selected*/ ctx[1].length + "")) set_data_dev(t1, t1_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(li);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$4.name,
		type: "if",
		source: "(19:2) {#if selectedFiles.length > 3}",
		ctx
	});

	return block;
}

function create_fragment$6(ctx) {
	let ul;
	let t;
	let if_block0 = showSelection && create_if_block_1$4(ctx);
	let if_block1 = /*selectedFiles*/ ctx[0].length > 3 && create_if_block$4(ctx);

	const block = {
		c: function create() {
			ul = element("ul");
			if (if_block0) if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			attr_dev(ul, "class", "svelte-1y7flg5");
			add_location(ul, file$5, 10, 0, 240);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, ul, anchor);
			if (if_block0) if_block0.m(ul, null);
			append_dev(ul, t);
			if (if_block1) if_block1.m(ul, null);
		},
		p: function update(ctx, [dirty]) {
			if (showSelection) if_block0.p(ctx, dirty);

			if (/*selectedFiles*/ ctx[0].length > 3) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block$4(ctx);
					if_block1.c();
					if_block1.m(ul, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(ul);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$6.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$6($$self, $$props, $$invalidate) {
	let selected;
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Selection", slots, []);
	const dispatch = createEventDispatcher();
	let { selectedFiles = [] } = $$props;
	const writable_props = ["selectedFiles"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Selection> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("selectedFiles" in $$props) $$invalidate(0, selectedFiles = $$props.selectedFiles);
	};

	$$self.$capture_state = () => ({
		createEventDispatcher,
		showSelection,
		dispatch,
		selectedFiles,
		selected
	});

	$$self.$inject_state = $$props => {
		if ("selectedFiles" in $$props) $$invalidate(0, selectedFiles = $$props.selectedFiles);
		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*selectedFiles*/ 1) {
			$$invalidate(1, selected = selectedFiles.slice(0, 3));
		}
	};

	return [selectedFiles, selected, dispatch];
}

class Selection extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$6, create_fragment$6, safe_not_equal, { selectedFiles: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Selection",
			options,
			id: create_fragment$6.name
		});
	}

	get selectedFiles() {
		throw new Error("<Selection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set selectedFiles(value) {
		throw new Error("<Selection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/FileItem.svelte generated by Svelte v3.35.0 */
const file_1 = "src/FileItem.svelte";

// (56:0) {#if file}
function create_if_block$3(ctx) {
	let li;
	let figure;
	let div1;
	let img;
	let img_src_value;
	let img_alt_value;
	let t0;
	let div0;
	let t1;
	let t2;
	let li_title_value;
	let mounted;
	let dispose;
	let if_block0 = /*$showFileSize*/ ctx[1] && create_if_block_3$1(ctx);
	let if_block1 = /*$showFileType*/ ctx[2] && create_if_block_2$2(ctx);
	let if_block2 = /*$showFileName*/ ctx[3] && create_if_block_1$3(ctx);

	const block = {
		c: function create() {
			li = element("li");
			figure = element("figure");
			div1 = element("div");
			img = element("img");
			t0 = space();
			div0 = element("div");
			if (if_block0) if_block0.c();
			t1 = space();
			if (if_block1) if_block1.c();
			t2 = space();
			if (if_block2) if_block2.c();
			attr_dev(img, "loading", "lazy");
			if (img.src !== (img_src_value = /*file*/ ctx[0].imagePath || /*file*/ ctx[0].modifiedPreviewFileURLs[0])) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", img_alt_value = /*file*/ ctx[0].fileName);
			attr_dev(img, "class", "svelte-1tzh62p");
			add_location(img, file_1, 59, 6, 1410);
			attr_dev(div0, "class", "tags svelte-1tzh62p");
			add_location(div0, file_1, 60, 6, 1513);
			attr_dev(div1, "class", "pixxioSquare svelte-1tzh62p");
			toggle_class(div1, "pixxioSquare--active", /*file*/ ctx[0].selected);
			add_location(div1, file_1, 58, 4, 1334);
			attr_dev(figure, "class", "svelte-1tzh62p");
			add_location(figure, file_1, 57, 2, 1321);
			attr_dev(li, "title", li_title_value = /*file*/ ctx[0].fileName);
			attr_dev(li, "class", "svelte-1tzh62p");
			add_location(li, file_1, 56, 0, 1258);
		},
		m: function mount(target, anchor) {
			insert_dev(target, li, anchor);
			append_dev(li, figure);
			append_dev(figure, div1);
			append_dev(div1, img);
			append_dev(div1, t0);
			append_dev(div1, div0);
			if (if_block0) if_block0.m(div0, null);
			append_dev(div0, t1);
			if (if_block1) if_block1.m(div0, null);
			append_dev(figure, t2);
			if (if_block2) if_block2.m(figure, null);

			if (!mounted) {
				dispose = listen_dev(li, "click", /*click_handler*/ ctx[7], false, false, false);
				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			if (dirty & /*file*/ 1 && img.src !== (img_src_value = /*file*/ ctx[0].imagePath || /*file*/ ctx[0].modifiedPreviewFileURLs[0])) {
				attr_dev(img, "src", img_src_value);
			}

			if (dirty & /*file*/ 1 && img_alt_value !== (img_alt_value = /*file*/ ctx[0].fileName)) {
				attr_dev(img, "alt", img_alt_value);
			}

			if (/*$showFileSize*/ ctx[1]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_3$1(ctx);
					if_block0.c();
					if_block0.m(div0, t1);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*$showFileType*/ ctx[2]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block_2$2(ctx);
					if_block1.c();
					if_block1.m(div0, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (dirty & /*file*/ 1) {
				toggle_class(div1, "pixxioSquare--active", /*file*/ ctx[0].selected);
			}

			if (/*$showFileName*/ ctx[3]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if_block2 = create_if_block_1$3(ctx);
					if_block2.c();
					if_block2.m(figure, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (dirty & /*file*/ 1 && li_title_value !== (li_title_value = /*file*/ ctx[0].fileName)) {
				attr_dev(li, "title", li_title_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(li);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$3.name,
		type: "if",
		source: "(56:0) {#if file}",
		ctx
	});

	return block;
}

// (62:8) {#if $showFileSize}
function create_if_block_3$1(ctx) {
	let div;
	let t_value = /*readableSize*/ ctx[5](/*file*/ ctx[0].fileSize) + "";
	let t;

	const block = {
		c: function create() {
			div = element("div");
			t = text(t_value);
			attr_dev(div, "class", "tag svelte-1tzh62p");
			add_location(div, file_1, 62, 8, 1568);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*file*/ 1 && t_value !== (t_value = /*readableSize*/ ctx[5](/*file*/ ctx[0].fileSize) + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3$1.name,
		type: "if",
		source: "(62:8) {#if $showFileSize}",
		ctx
	});

	return block;
}

// (65:8) {#if $showFileType}
function create_if_block_2$2(ctx) {
	let div;
	let t_value = /*file*/ ctx[0].fileExtension + "";
	let t;

	const block = {
		c: function create() {
			div = element("div");
			t = text(t_value);
			attr_dev(div, "class", "tag svelte-1tzh62p");
			add_location(div, file_1, 65, 8, 1671);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*file*/ 1 && t_value !== (t_value = /*file*/ ctx[0].fileExtension + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2$2.name,
		type: "if",
		source: "(65:8) {#if $showFileType}",
		ctx
	});

	return block;
}

// (70:4) {#if $showFileName}
function create_if_block_1$3(ctx) {
	let figcaption;
	let t_value = /*file*/ ctx[0].fileName + "";
	let t;

	const block = {
		c: function create() {
			figcaption = element("figcaption");
			t = text(t_value);
			attr_dev(figcaption, "class", "svelte-1tzh62p");
			add_location(figcaption, file_1, 70, 4, 1781);
		},
		m: function mount(target, anchor) {
			insert_dev(target, figcaption, anchor);
			append_dev(figcaption, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*file*/ 1 && t_value !== (t_value = /*file*/ ctx[0].fileName + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(figcaption);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$3.name,
		type: "if",
		source: "(70:4) {#if $showFileName}",
		ctx
	});

	return block;
}

function create_fragment$5(ctx) {
	let if_block_anchor;
	let if_block = /*file*/ ctx[0] && create_if_block$3(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
		},
		p: function update(ctx, [dirty]) {
			if (/*file*/ ctx[0]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$3(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$5.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$5($$self, $$props, $$invalidate) {
	let $maxFiles;
	let $showFileSize;
	let $showFileType;
	let $showFileName;
	validate_store(maxFiles, "maxFiles");
	component_subscribe($$self, maxFiles, $$value => $$invalidate(10, $maxFiles = $$value));
	validate_store(showFileSize, "showFileSize");
	component_subscribe($$self, showFileSize, $$value => $$invalidate(1, $showFileSize = $$value));
	validate_store(showFileType, "showFileType");
	component_subscribe($$self, showFileType, $$value => $$invalidate(2, $showFileType = $$value));
	validate_store(showFileName, "showFileName");
	component_subscribe($$self, showFileName, $$value => $$invalidate(3, $showFileName = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("FileItem", slots, []);
	let { file = null } = $$props;
	let { selected = false } = $$props;
	const dispatch = createEventDispatcher();
	let lastClick = 0;
	let clickTimeout;

	const clickProvider = () => {
		if ($maxFiles === 1) {
			const delta = Date.now() - lastClick;

			if (clickTimeout) {
				clearTimeout(clickTimeout);
			}

			if (delta < 200) {
				selectAndClose();
			} else {
				clickTimeout = setTimeout(
					() => {
						select();
					},
					200
				);
			}

			lastClick = Date.now();
		} else {
			select();
		}
	};

	const select = () => {
		dispatch(!selected ? "select" : "deselect", file);
	};

	const selectAndClose = () => {
		if ($maxFiles === 1) {
			dispatch("selectAndClose", file);
		} else {
			select();
		}
	};

	const readableSize = size => {
		if (size > 100000000) {
			return Math.ceil(size / 1000000000 * 100) / 100 + " GB";
		}

		if (size > 100000) {
			return Math.ceil(size / 1000000 * 100) / 100 + " MB";
		}

		if (size > 1000) {
			return Math.ceil(size / 1000) + " KB";
		}

		return Math.ceil(size) + " B";
	};

	const writable_props = ["file", "selected"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FileItem> was created with unknown prop '${key}'`);
	});

	const click_handler = () => clickProvider();

	$$self.$$set = $$props => {
		if ("file" in $$props) $$invalidate(0, file = $$props.file);
		if ("selected" in $$props) $$invalidate(6, selected = $$props.selected);
	};

	$$self.$capture_state = () => ({
		createEventDispatcher,
		showFileSize,
		showFileType,
		showFileName,
		maxFiles,
		file,
		selected,
		dispatch,
		lastClick,
		clickTimeout,
		clickProvider,
		select,
		selectAndClose,
		readableSize,
		$maxFiles,
		$showFileSize,
		$showFileType,
		$showFileName
	});

	$$self.$inject_state = $$props => {
		if ("file" in $$props) $$invalidate(0, file = $$props.file);
		if ("selected" in $$props) $$invalidate(6, selected = $$props.selected);
		if ("lastClick" in $$props) lastClick = $$props.lastClick;
		if ("clickTimeout" in $$props) clickTimeout = $$props.clickTimeout;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		file,
		$showFileSize,
		$showFileType,
		$showFileName,
		clickProvider,
		readableSize,
		selected,
		click_handler
	];
}

class FileItem extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$5, create_fragment$5, safe_not_equal, { file: 0, selected: 6 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "FileItem",
			options,
			id: create_fragment$5.name
		});
	}

	get file() {
		throw new Error("<FileItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set file(value) {
		throw new Error("<FileItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get selected() {
		throw new Error("<FileItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set selected(value) {
		throw new Error("<FileItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/Error.svelte generated by Svelte v3.35.0 */

const { Error: Error_1$2 } = globals;
const file$4 = "src/Error.svelte";

function create_fragment$4(ctx) {
	let div;
	let current;
	const default_slot_template = /*#slots*/ ctx[2].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

	const block = {
		c: function create() {
			div = element("div");
			if (default_slot) default_slot.c();
			attr_dev(div, "class", "svelte-18x7sgz");
			toggle_class(div, "success", /*$$props*/ ctx[0].success);
			add_location(div, file$4, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope*/ 2) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
				}
			}

			if (dirty & /*$$props*/ 1) {
				toggle_class(div, "success", /*$$props*/ ctx[0].success);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$4.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$4($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Error", slots, ['default']);

	$$self.$$set = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ("$$scope" in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
	};

	$$self.$inject_state = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$props = exclude_internal_props($$props);
	return [$$props, $$scope, slots];
}

class Error$1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Error",
			options,
			id: create_fragment$4.name
		});
	}
}

/* src/Files.svelte generated by Svelte v3.35.0 */

const { Error: Error_1$1, console: console_1$1 } = globals;
const file$3 = "src/Files.svelte";

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[34] = list[i];
	child_ctx[35] = list;
	child_ctx[36] = i;
	return child_ctx;
}

// (259:4) {:catch}
function create_catch_block(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("error");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		p: noop,
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_catch_block.name,
		type: "catch",
		source: "(259:4) {:catch}",
		ctx
	});

	return block;
}

// (235:4) {:then}
function create_then_block(ctx) {
	let section;
	let ul;
	let t0;
	let div1;
	let div0;
	let t1;
	let t2;
	let span;
	let t3;
	let downloadformats;
	let t4;
	let button;
	let t5_value = lang("select") + "";
	let t5;
	let button_disabled_value;
	let current;
	let mounted;
	let dispose;
	let each_value = /*files*/ ctx[4];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	let if_block0 = /*$maxFiles*/ ctx[1] > 0 && create_if_block_1$2(ctx);
	let if_block1 = /*$showSelection*/ ctx[10] && !/*$compact*/ ctx[9] && create_if_block$2(ctx);
	downloadformats = new DownloadFormats({ $$inline: true });

	const block = {
		c: function create() {
			section = element("section");
			ul = element("ul");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t0 = space();
			div1 = element("div");
			div0 = element("div");
			if (if_block0) if_block0.c();
			t1 = space();
			if (if_block1) if_block1.c();
			t2 = space();
			span = element("span");
			t3 = space();
			create_component(downloadformats.$$.fragment);
			t4 = space();
			button = element("button");
			t5 = text(t5_value);
			attr_dev(ul, "class", "svelte-wpisvp");
			add_location(ul, file$3, 237, 6, 5956);
			attr_dev(section, "class", "pixxioFiles__container svelte-wpisvp");
			toggle_class(section, "pixxioFiles__container--maxReached", /*maxReached*/ ctx[6]);
			add_location(section, file$3, 236, 4, 5832);
			set_style(span, "flex-grow", "1");
			add_location(span, file$3, 252, 8, 6666);
			attr_dev(button, "class", "button svelte-wpisvp");
			attr_dev(button, "type", "submit");
			button.disabled = button_disabled_value = !/*valid*/ ctx[7] || /*isLoading*/ ctx[5];
			add_location(button, file$3, 254, 8, 6753);
			attr_dev(div0, "class", "buttonGroup buttonGroup--right svelte-wpisvp");
			add_location(div0, file$3, 244, 6, 6229);
			attr_dev(div1, "class", "svelte-wpisvp");
			toggle_class(div1, "compact", /*$compact*/ ctx[9]);
			add_location(div1, file$3, 243, 4, 6192);
		},
		m: function mount(target, anchor) {
			insert_dev(target, section, anchor);
			append_dev(section, ul);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul, null);
			}

			insert_dev(target, t0, anchor);
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);
			if (if_block0) if_block0.m(div0, null);
			append_dev(div0, t1);
			if (if_block1) if_block1.m(div0, null);
			append_dev(div0, t2);
			append_dev(div0, span);
			append_dev(div0, t3);
			mount_component(downloadformats, div0, null);
			append_dev(div0, t4);
			append_dev(div0, button);
			append_dev(button, t5);
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(section, "scroll", /*lazyLoad*/ ctx[11], false, false, false),
					listen_dev(button, "click", /*submit*/ ctx[15], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*files, selectAndClose, select, deselect*/ 28688) {
				each_value = /*files*/ ctx[4];
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(ul, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}

			if (dirty[0] & /*maxReached*/ 64) {
				toggle_class(section, "pixxioFiles__container--maxReached", /*maxReached*/ ctx[6]);
			}

			if (/*$maxFiles*/ ctx[1] > 0) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_1$2(ctx);
					if_block0.c();
					if_block0.m(div0, t1);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*$showSelection*/ ctx[10] && !/*$compact*/ ctx[9]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty[0] & /*$showSelection, $compact*/ 1536) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block$2(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(div0, t2);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (!current || dirty[0] & /*valid, isLoading*/ 160 && button_disabled_value !== (button_disabled_value = !/*valid*/ ctx[7] || /*isLoading*/ ctx[5])) {
				prop_dev(button, "disabled", button_disabled_value);
			}

			if (dirty[0] & /*$compact*/ 512) {
				toggle_class(div1, "compact", /*$compact*/ ctx[9]);
			}
		},
		i: function intro(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			transition_in(if_block1);
			transition_in(downloadformats.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			transition_out(if_block1);
			transition_out(downloadformats.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(section);
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(t0);
			if (detaching) detach_dev(div1);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			destroy_component(downloadformats);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_then_block.name,
		type: "then",
		source: "(235:4) {:then}",
		ctx
	});

	return block;
}

// (239:8) {#each files as file}
function create_each_block(ctx) {
	let fileitem;
	let updating_file;
	let updating_selected;
	let current;

	function fileitem_file_binding(value) {
		/*fileitem_file_binding*/ ctx[18](value, /*file*/ ctx[34], /*each_value*/ ctx[35], /*file_index*/ ctx[36]);
	}

	function fileitem_selected_binding(value) {
		/*fileitem_selected_binding*/ ctx[19](value, /*file*/ ctx[34]);
	}

	let fileitem_props = {};

	if (/*file*/ ctx[34] !== void 0) {
		fileitem_props.file = /*file*/ ctx[34];
	}

	if (/*file*/ ctx[34].selected !== void 0) {
		fileitem_props.selected = /*file*/ ctx[34].selected;
	}

	fileitem = new FileItem({ props: fileitem_props, $$inline: true });
	binding_callbacks.push(() => bind$1(fileitem, "file", fileitem_file_binding));
	binding_callbacks.push(() => bind$1(fileitem, "selected", fileitem_selected_binding));
	fileitem.$on("selectAndClose", /*selectAndClose*/ ctx[12]);
	fileitem.$on("select", /*select*/ ctx[13]);
	fileitem.$on("deselect", /*deselect*/ ctx[14]);

	const block = {
		c: function create() {
			create_component(fileitem.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(fileitem, target, anchor);
			current = true;
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			const fileitem_changes = {};

			if (!updating_file && dirty[0] & /*files*/ 16) {
				updating_file = true;
				fileitem_changes.file = /*file*/ ctx[34];
				add_flush_callback(() => updating_file = false);
			}

			if (!updating_selected && dirty[0] & /*files*/ 16) {
				updating_selected = true;
				fileitem_changes.selected = /*file*/ ctx[34].selected;
				add_flush_callback(() => updating_selected = false);
			}

			fileitem.$set(fileitem_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(fileitem.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(fileitem.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(fileitem, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block.name,
		type: "each",
		source: "(239:8) {#each files as file}",
		ctx
	});

	return block;
}

// (246:8) {#if $maxFiles > 0}
function create_if_block_1$2(ctx) {
	let p;
	let strong;
	let t0;
	let t1;

	let t2_value = (/*$maxFiles*/ ctx[1] > 0
	? "/" + /*$maxFiles*/ ctx[1]
	: "") + "";

	let t2;
	let t3;
	let t4_value = (!/*$compact*/ ctx[9] ? lang("selected") : "") + "";
	let t4;

	const block = {
		c: function create() {
			p = element("p");
			strong = element("strong");
			t0 = text(/*selectedCount*/ ctx[2]);
			t1 = space();
			t2 = text(t2_value);
			t3 = space();
			t4 = text(t4_value);
			add_location(strong, file$3, 246, 71, 6373);
			set_style(p, "white-space", "nowrap");
			set_style(p, "padding", "0 10px 0 0");
			set_style(p, "margin", "0");
			add_location(p, file$3, 246, 8, 6310);
		},
		m: function mount(target, anchor) {
			insert_dev(target, p, anchor);
			append_dev(p, strong);
			append_dev(strong, t0);
			append_dev(p, t1);
			append_dev(p, t2);
			append_dev(p, t3);
			append_dev(p, t4);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*selectedCount*/ 4) set_data_dev(t0, /*selectedCount*/ ctx[2]);

			if (dirty[0] & /*$maxFiles*/ 2 && t2_value !== (t2_value = (/*$maxFiles*/ ctx[1] > 0
			? "/" + /*$maxFiles*/ ctx[1]
			: "") + "")) set_data_dev(t2, t2_value);

			if (dirty[0] & /*$compact*/ 512 && t4_value !== (t4_value = (!/*$compact*/ ctx[9] ? lang("selected") : "") + "")) set_data_dev(t4, t4_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(p);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$2.name,
		type: "if",
		source: "(246:8) {#if $maxFiles > 0}",
		ctx
	});

	return block;
}

// (250:8) {#if $showSelection && !$compact}
function create_if_block$2(ctx) {
	let selection;
	let updating_selectedFiles;
	let current;

	function selection_selectedFiles_binding(value) {
		/*selection_selectedFiles_binding*/ ctx[20](value);
	}

	let selection_props = {};

	if (/*selectedFiles*/ ctx[0] !== void 0) {
		selection_props.selectedFiles = /*selectedFiles*/ ctx[0];
	}

	selection = new Selection({ props: selection_props, $$inline: true });
	binding_callbacks.push(() => bind$1(selection, "selectedFiles", selection_selectedFiles_binding));
	selection.$on("deselect", /*deselect*/ ctx[14]);

	const block = {
		c: function create() {
			create_component(selection.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(selection, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const selection_changes = {};

			if (!updating_selectedFiles && dirty[0] & /*selectedFiles*/ 1) {
				updating_selectedFiles = true;
				selection_changes.selectedFiles = /*selectedFiles*/ ctx[0];
				add_flush_callback(() => updating_selectedFiles = false);
			}

			selection.$set(selection_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(selection.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(selection.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(selection, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$2.name,
		type: "if",
		source: "(250:8) {#if $showSelection && !$compact}",
		ctx
	});

	return block;
}

// (233:21)        <Loading></Loading>     {:then}
function create_pending_block(ctx) {
	let loading;
	let current;
	loading = new Loading({ $$inline: true });

	const block = {
		c: function create() {
			create_component(loading.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(loading, target, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(loading.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(loading.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(loading, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_pending_block.name,
		type: "pending",
		source: "(233:21)        <Loading></Loading>     {:then}",
		ctx
	});

	return block;
}

function create_fragment$3(ctx) {
	let div;
	let promise;
	let current;

	let info = {
		ctx,
		current: null,
		token: null,
		hasCatch: true,
		pending: create_pending_block,
		then: create_then_block,
		catch: create_catch_block,
		blocks: [,,,]
	};

	handle_promise(promise = /*getFiles*/ ctx[3], info);

	const block = {
		c: function create() {
			div = element("div");
			info.block.c();
			attr_dev(div, "class", "pixxioFiles svelte-wpisvp");
			toggle_class(div, "no-modal", !/*$modal*/ ctx[8]);
			add_location(div, file$3, 231, 0, 5711);
		},
		l: function claim(nodes) {
			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			info.block.m(div, info.anchor = null);
			info.mount = () => div;
			info.anchor = null;
			current = true;
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			info.ctx = ctx;

			if (dirty[0] & /*getFiles*/ 8 && promise !== (promise = /*getFiles*/ ctx[3]) && handle_promise(promise, info)) ; else {
				const child_ctx = ctx.slice();
				info.block.p(child_ctx, dirty);
			}

			if (dirty[0] & /*$modal*/ 256) {
				toggle_class(div, "no-modal", !/*$modal*/ ctx[8]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(info.block);
			current = true;
		},
		o: function outro(local) {
			for (let i = 0; i < 3; i += 1) {
				const block = info.blocks[i];
				transition_out(block);
			}

			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			info.block.d();
			info.token = null;
			info = null;
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$3.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$3($$self, $$props, $$invalidate) {
	let max;
	let selectedCount;
	let maxReached;
	let valid;
	let downloadFormat;
	let $maxFiles;
	let $format;
	let $allowTypes;
	let $additionalResponseFields;
	let $modal;
	let $compact;
	let $showSelection;
	validate_store(maxFiles, "maxFiles");
	component_subscribe($$self, maxFiles, $$value => $$invalidate(1, $maxFiles = $$value));
	validate_store(format, "format");
	component_subscribe($$self, format, $$value => $$invalidate(17, $format = $$value));
	validate_store(allowTypes, "allowTypes");
	component_subscribe($$self, allowTypes, $$value => $$invalidate(25, $allowTypes = $$value));
	validate_store(additionalResponseFields, "additionalResponseFields");
	component_subscribe($$self, additionalResponseFields, $$value => $$invalidate(26, $additionalResponseFields = $$value));
	validate_store(modal, "modal");
	component_subscribe($$self, modal, $$value => $$invalidate(8, $modal = $$value));
	validate_store(compact, "compact");
	component_subscribe($$self, compact, $$value => $$invalidate(9, $compact = $$value));
	validate_store(showSelection, "showSelection");
	component_subscribe($$self, showSelection, $$value => $$invalidate(10, $showSelection = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Files", slots, []);
	const dispatch = createEventDispatcher();
	const api = new API();
	let getFiles = null;
	let page = 1;
	let pageSize = 50;
	let files = [];
	let quantity = 0;
	let isLoading = false;
	let query = "";
	let selectedFiles = [];

	onMount(() => {
		$$invalidate(3, getFiles = fetchFiles());

		searchTerm.subscribe(value => {
			query = value;
			changes();
		});

		changed.subscribe(() => changes());
	});

	const changes = () => {
		page = 1;
		fetchFiles();
	};

	const lazyLoad = event => {
		if (isLoading || files.length >= quantity) {
			return;
		}

		const delta = event.target.scrollHeight - event.target.scrollTop - event.target.offsetHeight;

		if (delta < event.target.offsetHeight / 2) {
			page += 1;
			fetchFiles(true);
		}
	};

	const fetchFiles = async attach => {
		try {
			$$invalidate(5, isLoading = true);
			let allowedTypeFilter = [];
			let queryFilter = [];
			let filter = {};

			if ($allowTypes.length) {
				allowedTypeFilter = [
					{
						filterType: "connectorOr",
						filters: [
							...$allowTypes.map(type => ({
								filterType: "fileExtension",
								fileExtension: type
							}))
						]
					}
				];
			}

			if (query) {
				queryFilter = [{ filterType: "searchTerm", term: query }];
			}

			if (query || $allowTypes.length) {
				filter = {
					filter: {
						filterType: "connectorAnd",
						filters: [...queryFilter, ...allowedTypeFilter]
					}
				};
			}

			const options = {
				page,
				pageSize,
				responseFields: [
					"id",
					"modifiedPreviewFileURLs",
					"previewFileURL",
					"originalFileURL",
					"width",
					"height",
					"fileName",
					"fileExtension",
					"uploadDate",
					"modifyDate",
					"rating",
					"userID",
					"fileSize",
					"dominantColor",
					...$additionalResponseFields
				],
				previewFileOptions: [{ height: 400, quality: 60 }],
				...filter
			};

			const data = await api.get(`/files`, options);

			if (!data.success) {
				throw new Error$1(data.errormessage);
			}

			data.files = data.files.map(file => {
				file.selected = selectedFiles.find(f => f.id === file.id);
				return file;
			});

			if (attach) {
				$$invalidate(4, files = [...files, ...data.files]);
			} else {
				$$invalidate(4, files = data.files);
				quantity = data.quantity;
			}

			$$invalidate(5, isLoading = false);
		} catch(e) {
			console.log(e);
			hasError = true;
			$$invalidate(5, isLoading = false);
		}
	};

	const selectAndClose = event => {
		select(event);
		submit();
	};

	const select = event => {
		// if (max && max <= selectedFiles.length) {
		//   return;
		// }
		const file = files.find(f => f.id === event.detail.id);

		file.selected = true;
		$$invalidate(4, files);

		if (max > 0) {
			$$invalidate(0, selectedFiles = [event.detail, ...selectedFiles.slice(0, max - 1)]);
		} else {
			$$invalidate(0, selectedFiles = [event.detail, ...selectedFiles]);
		}

		markSelected();
	};

	const deselect = event => {
		$$invalidate(0, selectedFiles = selectedFiles.filter(f => f.id !== event.detail.id));
		markSelected();
	};

	const markSelected = () => {
		files.forEach(file => {
			file.selected = false;
		});

		$$invalidate(4, files);

		selectedFiles.forEach(sf => {
			const file = files.find(f => f.id == sf.id);
			file.selected = true;
			$$invalidate(4, files);
		});
	};

	const fetchDownloadFormats = async id => {
		const convert = await api.get("/files/convert", {
			ids: [id],
			downloadType: "downloadFormat",
			downloadFormatID: downloadFormat
		});

		const checkDownload = async () => {
			const download = await api.get("/files/download", { downloadID: convert.downloadID });

			if (!download.downloadURL) {
				return await new Promise(resolve => {
						setTimeout(() => checkDownload().then(result => resolve(result)), 100);
					});
			} else {
				return download.downloadURL;
			}
		};

		return await checkDownload();
	};

	const submit = async () => {
		const preparedFiles = [];
		$$invalidate(5, isLoading = true);

		for (let i = 0; i < selectedFiles.length; i += 1) {
			const file = selectedFiles[i];

			const url = downloadFormat === "preview"
			? file.previewFileURL
			: file.originalFileURL;

			const thumbnail = file.modifiedPreviewFileURLs[0];

			if (!["preview", "original"].includes(downloadFormat)) {
				// catch format
				url = await fetchDownloadFormats(file.id);
			}

			preparedFiles.push({ id: file.id, url, thumbnail, file });
		}

		$$invalidate(5, isLoading = false);
		dispatch("submit", preparedFiles);
	};

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Files> was created with unknown prop '${key}'`);
	});

	function fileitem_file_binding(value, file, each_value, file_index) {
		each_value[file_index] = value;
		$$invalidate(4, files);
	}

	function fileitem_selected_binding(value, file) {
		if ($$self.$$.not_equal(file.selected, value)) {
			file.selected = value;
			$$invalidate(4, files);
		}
	}

	function selection_selectedFiles_binding(value) {
		selectedFiles = value;
		$$invalidate(0, selectedFiles);
	}

	$$self.$capture_state = () => ({
		afterUpdate,
		beforeUpdate,
		createEventDispatcher,
		onMount,
		DownloadFormats,
		Selection,
		FileItem,
		Loading,
		modal,
		compact,
		searchTerm,
		format,
		maxFiles,
		showSelection,
		allowTypes,
		additionalResponseFields,
		changed,
		API,
		lang,
		Error: Error$1,
		dispatch,
		api,
		getFiles,
		page,
		pageSize,
		files,
		quantity,
		isLoading,
		query,
		selectedFiles,
		changes,
		lazyLoad,
		fetchFiles,
		selectAndClose,
		select,
		deselect,
		markSelected,
		fetchDownloadFormats,
		submit,
		max,
		$maxFiles,
		selectedCount,
		maxReached,
		valid,
		$format,
		downloadFormat,
		$allowTypes,
		$additionalResponseFields,
		$modal,
		$compact,
		$showSelection
	});

	$$self.$inject_state = $$props => {
		if ("getFiles" in $$props) $$invalidate(3, getFiles = $$props.getFiles);
		if ("page" in $$props) page = $$props.page;
		if ("pageSize" in $$props) pageSize = $$props.pageSize;
		if ("files" in $$props) $$invalidate(4, files = $$props.files);
		if ("quantity" in $$props) quantity = $$props.quantity;
		if ("isLoading" in $$props) $$invalidate(5, isLoading = $$props.isLoading);
		if ("query" in $$props) query = $$props.query;
		if ("selectedFiles" in $$props) $$invalidate(0, selectedFiles = $$props.selectedFiles);
		if ("max" in $$props) $$invalidate(16, max = $$props.max);
		if ("selectedCount" in $$props) $$invalidate(2, selectedCount = $$props.selectedCount);
		if ("maxReached" in $$props) $$invalidate(6, maxReached = $$props.maxReached);
		if ("valid" in $$props) $$invalidate(7, valid = $$props.valid);
		if ("downloadFormat" in $$props) downloadFormat = $$props.downloadFormat;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*$maxFiles*/ 2) {
			$$invalidate(16, max = $maxFiles);
		}

		if ($$self.$$.dirty[0] & /*selectedFiles*/ 1) {
			$$invalidate(2, selectedCount = selectedFiles.length);
		}

		if ($$self.$$.dirty[0] & /*selectedCount, max*/ 65540) {
			$$invalidate(6, maxReached = selectedCount >= max && max > 0);
		}

		if ($$self.$$.dirty[0] & /*selectedCount, $format*/ 131076) {
			$$invalidate(7, valid = selectedCount >= 1 && $format);
		}

		if ($$self.$$.dirty[0] & /*$format*/ 131072) {
			downloadFormat = $format;
		}
	};

	return [
		selectedFiles,
		$maxFiles,
		selectedCount,
		getFiles,
		files,
		isLoading,
		maxReached,
		valid,
		$modal,
		$compact,
		$showSelection,
		lazyLoad,
		selectAndClose,
		select,
		deselect,
		submit,
		max,
		$format,
		fileitem_file_binding,
		fileitem_selected_binding,
		selection_selectedFiles_binding
	];
}

class Files extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$3, create_fragment$3, safe_not_equal, {}, [-1, -1]);

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Files",
			options,
			id: create_fragment$3.name
		});
	}
}

/* src/User.svelte generated by Svelte v3.35.0 */
const file$2 = "src/User.svelte";

function create_fragment$2(ctx) {
	let small;
	let t0_value = lang("logged_in_as") + "";
	let t0;
	let t1;
	let t2;
	let t3;
	let a0;
	let t4;
	let a0_href_value;
	let t5;
	let a1;
	let mounted;
	let dispose;

	const block = {
		c: function create() {
			small = element("small");
			t0 = text(t0_value);
			t1 = space();
			t2 = text(/*username*/ ctx[0]);
			t3 = text(" in ");
			a0 = element("a");
			t4 = text(/*$domain*/ ctx[2]);
			t5 = text(". ");
			a1 = element("a");
			a1.textContent = "Ausloggen";
			attr_dev(a0, "href", a0_href_value = "https://" + /*$domain*/ ctx[2]);
			attr_dev(a0, "target", "_blank");
			attr_dev(a0, "class", "svelte-a2gk4x");
			add_location(a0, file$2, 25, 69, 523);
			attr_dev(a1, "href", "#");
			attr_dev(a1, "class", "svelte-a2gk4x");
			add_location(a1, file$2, 25, 128, 582);
			attr_dev(small, "class", "svelte-a2gk4x");
			toggle_class(small, "no-modal", !/*$modal*/ ctx[1]);
			add_location(small, file$2, 25, 0, 454);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, small, anchor);
			append_dev(small, t0);
			append_dev(small, t1);
			append_dev(small, t2);
			append_dev(small, t3);
			append_dev(small, a0);
			append_dev(a0, t4);
			append_dev(small, t5);
			append_dev(small, a1);

			if (!mounted) {
				dispose = listen_dev(a1, "click", /*logout*/ ctx[3], false, false, false);
				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*username*/ 1) set_data_dev(t2, /*username*/ ctx[0]);
			if (dirty & /*$domain*/ 4) set_data_dev(t4, /*$domain*/ ctx[2]);

			if (dirty & /*$domain*/ 4 && a0_href_value !== (a0_href_value = "https://" + /*$domain*/ ctx[2])) {
				attr_dev(a0, "href", a0_href_value);
			}

			if (dirty & /*$modal*/ 2) {
				toggle_class(small, "no-modal", !/*$modal*/ ctx[1]);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(small);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$2($$self, $$props, $$invalidate) {
	let $modal;
	let $domain;
	validate_store(modal, "modal");
	component_subscribe($$self, modal, $$value => $$invalidate(1, $modal = $$value));
	validate_store(domain, "domain");
	component_subscribe($$self, domain, $$value => $$invalidate(2, $domain = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("User", slots, []);
	const api = new API();
	let username = "";

	const fetchUser = async () => {
		api.get("/users/current").then(user => {
			$$invalidate(0, username = user.user.displayName);
		});
	};

	fetchUser();
	const dispatch = createEventDispatcher();

	const logout = () => {
		dispatch("logout");
	};

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<User> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({
		API,
		lang,
		domain,
		modal,
		createEventDispatcher,
		api,
		username,
		fetchUser,
		dispatch,
		logout,
		$modal,
		$domain
	});

	$$self.$inject_state = $$props => {
		if ("username" in $$props) $$invalidate(0, username = $$props.username);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [username, $modal, $domain, logout];
}

class User extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "User",
			options,
			id: create_fragment$2.name
		});
	}
}

/* src/Upload.svelte generated by Svelte v3.35.0 */

const { Error: Error_1, Object: Object_1, console: console_1 } = globals;
const file$1 = "src/Upload.svelte";

// (56:2) {#if loading}
function create_if_block_2$1(ctx) {
	let loading_1;
	let current;
	loading_1 = new Loading({ $$inline: true });

	const block = {
		c: function create() {
			create_component(loading_1.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(loading_1, target, anchor);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(loading_1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(loading_1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(loading_1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2$1.name,
		type: "if",
		source: "(56:2) {#if loading}",
		ctx
	});

	return block;
}

// (59:2) {#if errorMessage}
function create_if_block_1$1(ctx) {
	let error;
	let current;

	error = new Error$1({
			props: {
				$$slots: { default: [create_default_slot_1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(error.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(error, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const error_changes = {};

			if (dirty & /*$$scope, errorMessage*/ 258) {
				error_changes.$$scope = { dirty, ctx };
			}

			error.$set(error_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(error.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(error.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(error, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$1.name,
		type: "if",
		source: "(59:2) {#if errorMessage}",
		ctx
	});

	return block;
}

// (60:2) <Error>
function create_default_slot_1(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text(/*errorMessage*/ ctx[1]);
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*errorMessage*/ 2) set_data_dev(t, /*errorMessage*/ ctx[1]);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1.name,
		type: "slot",
		source: "(60:2) <Error>",
		ctx
	});

	return block;
}

// (64:2) {#if successMessage}
function create_if_block$1(ctx) {
	let error;
	let current;

	error = new Error$1({
			props: {
				success: true,
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(error.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(error, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const error_changes = {};

			if (dirty & /*$$scope, successMessage*/ 260) {
				error_changes.$$scope = { dirty, ctx };
			}

			error.$set(error_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(error.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(error.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(error, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$1.name,
		type: "if",
		source: "(64:2) {#if successMessage}",
		ctx
	});

	return block;
}

// (65:2) <Error success={true}>
function create_default_slot(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text(/*successMessage*/ ctx[2]);
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*successMessage*/ 4) set_data_dev(t, /*successMessage*/ ctx[2]);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(65:2) <Error success={true}>",
		ctx
	});

	return block;
}

function create_fragment$1(ctx) {
	let div;
	let t0;
	let t1;
	let current;
	let if_block0 = /*loading*/ ctx[0] && create_if_block_2$1(ctx);
	let if_block1 = /*errorMessage*/ ctx[1] && create_if_block_1$1(ctx);
	let if_block2 = /*successMessage*/ ctx[2] && create_if_block$1(ctx);

	const block = {
		c: function create() {
			div = element("div");
			if (if_block0) if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			if (if_block2) if_block2.c();
			attr_dev(div, "class", "upload svelte-74nv7x");
			toggle_class(div, "no-modal", !/*$modal*/ ctx[3]);
			add_location(div, file$1, 54, 0, 1553);
		},
		l: function claim(nodes) {
			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			if (if_block0) if_block0.m(div, null);
			append_dev(div, t0);
			if (if_block1) if_block1.m(div, null);
			append_dev(div, t1);
			if (if_block2) if_block2.m(div, null);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (/*loading*/ ctx[0]) {
				if (if_block0) {
					if (dirty & /*loading*/ 1) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_2$1(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(div, t0);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (/*errorMessage*/ ctx[1]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*errorMessage*/ 2) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_1$1(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(div, t1);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (/*successMessage*/ ctx[2]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);

					if (dirty & /*successMessage*/ 4) {
						transition_in(if_block2, 1);
					}
				} else {
					if_block2 = create_if_block$1(ctx);
					if_block2.c();
					transition_in(if_block2, 1);
					if_block2.m(div, null);
				}
			} else if (if_block2) {
				group_outros();

				transition_out(if_block2, 1, 1, () => {
					if_block2 = null;
				});

				check_outros();
			}

			if (dirty & /*$modal*/ 8) {
				toggle_class(div, "no-modal", !/*$modal*/ ctx[3]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			transition_in(if_block2);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			transition_out(if_block2);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$1($$self, $$props, $$invalidate) {
	let $modal;
	validate_store(modal, "modal");
	component_subscribe($$self, modal, $$value => $$invalidate(3, $modal = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Upload", slots, []);
	const api = new API();
	let loading = false;
	let { config = {} } = $$props;
	let errorMessage = "";
	let successMessage = "";
	const dispatch = createEventDispatcher();

	const upload = async () => {
		if (loading) {
			return false;
		}

		$$invalidate(0, loading = true);

		try {
			$$invalidate(1, errorMessage = "");
			$$invalidate(2, successMessage = "");
			const formData = new FormData();
			formData.set("asynchronousConversion", false);

			Object.keys(config).forEach(key => {
				if (key !== "file") {
					formData.set(key, JSON.stringify(config[key]));
				} else {
					formData.set(key, config[key]);
				}
			});

			const response = await api.post("/files", formData, true, null, false, false);
			$$invalidate(0, loading = false);
			dispatch("uploaded", response);

			if (response.success && response.isDuplicate) {
				$$invalidate(1, errorMessage = lang("duplicate_file"));
				dispatch("error", lang("duplicate_file"));
			} else {
				$$invalidate(2, successMessage = lang("success_upload_file"));
			}

			return response;
		} catch(error) {
			$$invalidate(0, loading = false);
			$$invalidate(1, errorMessage = error);
			console.error(error);
			dispatch("error", error);
		}

		return false;
	};

	onMount(async () => {
		await upload();
	});

	const writable_props = ["config"];

	Object_1.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Upload> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("config" in $$props) $$invalidate(4, config = $$props.config);
	};

	$$self.$capture_state = () => ({
		onMount,
		API,
		Loading,
		createEventDispatcher,
		Error: Error$1,
		lang,
		modal,
		api,
		loading,
		config,
		errorMessage,
		successMessage,
		dispatch,
		upload,
		$modal
	});

	$$self.$inject_state = $$props => {
		if ("loading" in $$props) $$invalidate(0, loading = $$props.loading);
		if ("config" in $$props) $$invalidate(4, config = $$props.config);
		if ("errorMessage" in $$props) $$invalidate(1, errorMessage = $$props.errorMessage);
		if ("successMessage" in $$props) $$invalidate(2, successMessage = $$props.successMessage);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*config*/ 16) {
			(upload());
		}
	};

	return [loading, errorMessage, successMessage, $modal, config];
}

class Upload extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { config: 4 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Upload",
			options,
			id: create_fragment$1.name
		});
	}

	get config() {
		throw new Error_1("<Upload>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set config(value) {
		throw new Error_1("<Upload>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/App.svelte generated by Svelte v3.35.0 */
const file = "src/App.svelte";

// (46:0) {#if $show}
function create_if_block(ctx) {
	let main;
	let div;
	let header;
	let t0;
	let t1;
	let a;
	let t2;
	let current_block_type_index;
	let if_block2;
	let t3;
	let current;
	let mounted;
	let dispose;
	let if_block0 = !/*$compact*/ ctx[4] && create_if_block_6(ctx);
	let if_block1 = /*$isAuthenticated*/ ctx[5] && /*$mode*/ ctx[6] == "get" && create_if_block_5(ctx);
	const if_block_creators = [create_if_block_2, create_if_block_3, create_if_block_4];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (!/*$isAuthenticated*/ ctx[5]) return 0;
		if (/*$mode*/ ctx[6] == "get") return 1;
		if (/*$mode*/ ctx[6] == "upload") return 2;
		return -1;
	}

	if (~(current_block_type_index = select_block_type(ctx))) {
		if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	let if_block3 = /*$isAuthenticated*/ ctx[5] && !/*$compact*/ ctx[4] && create_if_block_1(ctx);

	const block = {
		c: function create() {
			main = element("main");
			div = element("div");
			header = element("header");
			if (if_block0) if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			a = element("a");
			t2 = space();
			if (if_block2) if_block2.c();
			t3 = space();
			if (if_block3) if_block3.c();
			attr_dev(a, "href", "#");
			attr_dev(a, "class", "close svelte-5zy4kg");
			add_location(a, file, 55, 3, 1404);
			attr_dev(header, "class", "svelte-5zy4kg");
			add_location(header, file, 48, 2, 1237);
			attr_dev(div, "class", "container svelte-5zy4kg");
			toggle_class(div, "container--enlarge", /*$isAuthenticated*/ ctx[5]);
			add_location(div, file, 47, 1, 1167);
			attr_dev(main, "class", "svelte-5zy4kg");
			toggle_class(main, "no-modal", !/*$modal*/ ctx[3]);
			toggle_class(main, "compact", /*$compact*/ ctx[4]);
			add_location(main, file, 46, 0, 1109);
		},
		m: function mount(target, anchor) {
			insert_dev(target, main, anchor);
			append_dev(main, div);
			append_dev(div, header);
			if (if_block0) if_block0.m(header, null);
			append_dev(header, t0);
			if (if_block1) if_block1.m(header, null);
			append_dev(header, t1);
			append_dev(header, a);
			append_dev(div, t2);

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(div, null);
			}

			append_dev(div, t3);
			if (if_block3) if_block3.m(div, null);
			current = true;

			if (!mounted) {
				dispose = listen_dev(a, "click", /*cancel*/ ctx[9], false, false, false);
				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			if (!/*$compact*/ ctx[4]) {
				if (if_block0) {
					if (dirty & /*$compact*/ 16) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_6(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(header, t0);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (/*$isAuthenticated*/ ctx[5] && /*$mode*/ ctx[6] == "get") {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*$isAuthenticated, $mode*/ 96) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_5(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(header, t1);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block2) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block2 = if_blocks[current_block_type_index];

					if (!if_block2) {
						if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block2.c();
					} else {
						if_block2.p(ctx, dirty);
					}

					transition_in(if_block2, 1);
					if_block2.m(div, t3);
				} else {
					if_block2 = null;
				}
			}

			if (/*$isAuthenticated*/ ctx[5] && !/*$compact*/ ctx[4]) {
				if (if_block3) {
					if_block3.p(ctx, dirty);

					if (dirty & /*$isAuthenticated, $compact*/ 48) {
						transition_in(if_block3, 1);
					}
				} else {
					if_block3 = create_if_block_1(ctx);
					if_block3.c();
					transition_in(if_block3, 1);
					if_block3.m(div, null);
				}
			} else if (if_block3) {
				group_outros();

				transition_out(if_block3, 1, 1, () => {
					if_block3 = null;
				});

				check_outros();
			}

			if (dirty & /*$isAuthenticated*/ 32) {
				toggle_class(div, "container--enlarge", /*$isAuthenticated*/ ctx[5]);
			}

			if (dirty & /*$modal*/ 8) {
				toggle_class(main, "no-modal", !/*$modal*/ ctx[3]);
			}

			if (dirty & /*$compact*/ 16) {
				toggle_class(main, "compact", /*$compact*/ ctx[4]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			transition_in(if_block2);
			transition_in(if_block3);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			transition_out(if_block2);
			transition_out(if_block3);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(main);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d();
			}

			if (if_block3) if_block3.d();
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(46:0) {#if $show}",
		ctx
	});

	return block;
}

// (50:3) {#if !$compact}
function create_if_block_6(ctx) {
	let logo;
	let current;
	logo = new Logo({ $$inline: true });

	const block = {
		c: function create() {
			create_component(logo.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(logo, target, anchor);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(logo.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(logo.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(logo, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_6.name,
		type: "if",
		source: "(50:3) {#if !$compact}",
		ctx
	});

	return block;
}

// (53:3) {#if $isAuthenticated && $mode == 'get'}
function create_if_block_5(ctx) {
	let searchfield;
	let updating_value;
	let current;

	function searchfield_value_binding(value) {
		/*searchfield_value_binding*/ ctx[13](value);
	}

	let searchfield_props = {};

	if (/*searchQuery*/ ctx[1] !== void 0) {
		searchfield_props.value = /*searchQuery*/ ctx[1];
	}

	searchfield = new SearchField({ props: searchfield_props, $$inline: true });
	binding_callbacks.push(() => bind$1(searchfield, "value", searchfield_value_binding));

	const block = {
		c: function create() {
			create_component(searchfield.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(searchfield, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const searchfield_changes = {};

			if (!updating_value && dirty & /*searchQuery*/ 2) {
				updating_value = true;
				searchfield_changes.value = /*searchQuery*/ ctx[1];
				add_flush_callback(() => updating_value = false);
			}

			searchfield.$set(searchfield_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(searchfield.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(searchfield.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(searchfield, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_5.name,
		type: "if",
		source: "(53:3) {#if $isAuthenticated && $mode == 'get'}",
		ctx
	});

	return block;
}

// (73:30) 
function create_if_block_4(ctx) {
	let section;
	let upload;
	let updating_config;
	let current;

	function upload_config_binding(value) {
		/*upload_config_binding*/ ctx[14](value);
	}

	let upload_props = {};

	if (/*uploadConfig*/ ctx[0] !== void 0) {
		upload_props.config = /*uploadConfig*/ ctx[0];
	}

	upload = new Upload({ props: upload_props, $$inline: true });
	binding_callbacks.push(() => bind$1(upload, "config", upload_config_binding));
	upload.$on("uploaded", /*uploaded*/ ctx[11]);
	upload.$on("error", /*uploadError*/ ctx[12]);

	const block = {
		c: function create() {
			section = element("section");
			create_component(upload.$$.fragment);
			add_location(section, file, 73, 2, 1813);
		},
		m: function mount(target, anchor) {
			insert_dev(target, section, anchor);
			mount_component(upload, section, null);
			current = true;
		},
		p: function update(ctx, dirty) {
			const upload_changes = {};

			if (!updating_config && dirty & /*uploadConfig*/ 1) {
				updating_config = true;
				upload_changes.config = /*uploadConfig*/ ctx[0];
				add_flush_callback(() => updating_config = false);
			}

			upload.$set(upload_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(upload.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(upload.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(section);
			destroy_component(upload);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_4.name,
		type: "if",
		source: "(73:30) ",
		ctx
	});

	return block;
}

// (66:27) 
function create_if_block_3(ctx) {
	let section;
	let files;
	let current;
	files = new Files({ $$inline: true });
	files.$on("cancel", /*cancel*/ ctx[9]);
	files.$on("submit", /*submit*/ ctx[10]);

	const block = {
		c: function create() {
			section = element("section");
			create_component(files.$$.fragment);
			attr_dev(section, "class", "pixxioSectionFiles");
			add_location(section, file, 66, 2, 1659);
		},
		m: function mount(target, anchor) {
			insert_dev(target, section, anchor);
			mount_component(files, section, null);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(files.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(files.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(section);
			destroy_component(files);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3.name,
		type: "if",
		source: "(66:27) ",
		ctx
	});

	return block;
}

// (59:2) {#if !$isAuthenticated}
function create_if_block_2(ctx) {
	let section;
	let login;
	let current;
	login = new Login({ $$inline: true });
	login.$on("cancel", /*cancel*/ ctx[9]);
	login.$on("authenticated", /*authenticated*/ ctx[7]);

	const block = {
		c: function create() {
			section = element("section");
			create_component(login.$$.fragment);
			attr_dev(section, "class", "pixxioSectionLogin");
			add_location(section, file, 59, 2, 1494);
		},
		m: function mount(target, anchor) {
			insert_dev(target, section, anchor);
			mount_component(login, section, null);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(login.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(login.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(section);
			destroy_component(login);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2.name,
		type: "if",
		source: "(59:2) {#if !$isAuthenticated}",
		ctx
	});

	return block;
}

// (78:2) {#if $isAuthenticated && !$compact}
function create_if_block_1(ctx) {
	let user;
	let current;
	user = new User({ $$inline: true });
	user.$on("logout", /*logout*/ ctx[8]);

	const block = {
		c: function create() {
			create_component(user.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(user, target, anchor);
			current = true;
		},
		p: noop,
		i: function intro(local) {
			if (current) return;
			transition_in(user.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(user.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(user, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1.name,
		type: "if",
		source: "(78:2) {#if $isAuthenticated && !$compact}",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let t0;
	let link0;
	let link1;
	let style;
	let current;
	let if_block = /*$show*/ ctx[2] && create_if_block(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			t0 = space();
			link0 = element("link");
			link1 = element("link");
			style = element("style");
			style.textContent = "/* Global CSS via SASS */\n#pixxio-integration {\n  font-family: \"Heebo\", Arial, Helvetica, sans-serif;\n  font-size: 16px;\n  all: initial;\n}";
			attr_dev(link0, "rel", "preconnect");
			attr_dev(link0, "href", "https://fonts.gstatic.com");
			attr_dev(link0, "crossorigin", "");
			add_location(link0, file, 87, 2, 2083);
			attr_dev(link1, "href", "https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&family=Work+Sans:wght@400;500&display=swap");
			attr_dev(link1, "rel", "stylesheet");
			add_location(link1, file, 88, 2, 2154);
			attr_dev(style, "lang", "scss");
			add_location(style, file, 90, 2, 2291);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, t0, anchor);
			append_dev(document.head, link0);
			append_dev(document.head, link1);
			append_dev(document.head, style);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (/*$show*/ ctx[2]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*$show*/ 4) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(t0.parentNode, t0);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(t0);
			detach_dev(link0);
			detach_dev(link1);
			detach_dev(style);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let $show;
	let $modal;
	let $compact;
	let $isAuthenticated;
	let $mode;
	validate_store(show, "show");
	component_subscribe($$self, show, $$value => $$invalidate(2, $show = $$value));
	validate_store(modal, "modal");
	component_subscribe($$self, modal, $$value => $$invalidate(3, $modal = $$value));
	validate_store(compact, "compact");
	component_subscribe($$self, compact, $$value => $$invalidate(4, $compact = $$value));
	validate_store(isAuthenticated, "isAuthenticated");
	component_subscribe($$self, isAuthenticated, $$value => $$invalidate(5, $isAuthenticated = $$value));
	validate_store(mode, "mode");
	component_subscribe($$self, mode, $$value => $$invalidate(6, $mode = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("App", slots, []);
	let { uploadConfig = {} } = $$props;
	const dispatch = createEventDispatcher();
	let searchQuery = "";

	// authenticated
	const authenticated = () => {
		isAuthenticated.update(() => true);
	};

	const logout = () => {
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("domain");
		isAuthenticated.update(() => false);
		domain.update(() => "");
		refreshToken.update(() => "");
	};

	const cancel = () => {
		dispatch("cancel");
	};

	const submit = ({ detail }) => {
		dispatch("submit", detail);
	};

	const uploaded = ({ detail }) => {
		dispatch("uploaded", detail);
	};

	const uploadError = ({ detail }) => {
		dispatch("uploadError", detail);
	};

	const writable_props = ["uploadConfig"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
	});

	function searchfield_value_binding(value) {
		searchQuery = value;
		$$invalidate(1, searchQuery);
	}

	function upload_config_binding(value) {
		uploadConfig = value;
		$$invalidate(0, uploadConfig);
	}

	$$self.$$set = $$props => {
		if ("uploadConfig" in $$props) $$invalidate(0, uploadConfig = $$props.uploadConfig);
	};

	$$self.$capture_state = () => ({
		Logo,
		SearchField,
		Login,
		Files,
		User,
		createEventDispatcher,
		onMount,
		domain,
		appKey,
		modal,
		refreshToken,
		language,
		isAuthenticated,
		mode,
		show,
		compact,
		Upload,
		uploadConfig,
		dispatch,
		searchQuery,
		authenticated,
		logout,
		cancel,
		submit,
		uploaded,
		uploadError,
		$show,
		$modal,
		$compact,
		$isAuthenticated,
		$mode
	});

	$$self.$inject_state = $$props => {
		if ("uploadConfig" in $$props) $$invalidate(0, uploadConfig = $$props.uploadConfig);
		if ("searchQuery" in $$props) $$invalidate(1, searchQuery = $$props.searchQuery);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		uploadConfig,
		searchQuery,
		$show,
		$modal,
		$compact,
		$isAuthenticated,
		$mode,
		authenticated,
		logout,
		cancel,
		submit,
		uploaded,
		uploadError,
		searchfield_value_binding,
		upload_config_binding
	];
}

class App extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, { uploadConfig: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "App",
			options,
			id: create_fragment.name
		});
	}

	get uploadConfig() {
		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set uploadConfig(value) {
		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

class PIXXIO {
	constructor(config = {}, lang = 'en') {
		this.config = config;
		this.runningPromise;
		this.boot();
		this.storeConfig(config);
		this.app = new App({
			target: this.element,
			props: {
				standalone: true,
				config
			}
		});
	}
	storeConfig(config) {
		language.update(() => config?.language || 'en');
		domain.update(() => config?.appUrl || '');
		appKey.update(() => config?.appKey || '');
		modal.update(() => config?.modal);
		askForProxy.update(() => !!config?.askForProxy);
		compact.update(() => config?.compact || false);
	}
	boot() {
		if (!this.config.element) {
			const root = document.createElement('div');
			root.id = 'pixxio-integration';
			document.body.appendChild(root);
			this.element = root;
		} else {
			this.element = this.config.element;
		}
	};
	destroy() {
		show.update(() => false);
		this.element.parentNode.removeChild(this.element);
	}
	destroyMedia() {
		show.update(() => false);
	}
	getMedia(config) {
		allowTypes.update(() => config?.allowTypes || []);
		allowFormats.update(() => config?.allowFormats || null);
		maxFiles.update(() => config?.max > 0 ? (config?.max || 0) : 0);
		additionalResponseFields.update(() => config?.additionalResponseFields || []);
		showFileName.update(() => config?.showFileName || false);
		showFileType.update(() => config?.showFileType || true);
		showFileSize.update(() => config?.showFileSize || true);
		
	
		const calledTime = Date.now();
		changed.update(() => calledTime);
		mode.update(() => 'get');

		return new Promise((resolve, reject) => {
			show.update(() => true);
			this.app.$on('submit', (event) => {
				show.update(() => false);
				resolve(event.detail);
			});
			this.app.$on('cancel', () => {
				show.update(() => false);
				reject();
			});
			changed.subscribe((value) => {
				if (calledTime !== value) {
					reject();
				}
			});
		});
	}

	on(eventKey, callback) {
		switch(eventKey) {
			case 'authState':
				isAuthenticated.subscribe(value => {
					if (callback && typeof callback === 'function') {
						callback({login: value});
					}
				});
				break;
			default:
				console.error('Error: Event does not extist');
				break;	
		}
		
	}

	pushMedia(config) {
		const calledTime = Date.now();
		changed.update(() => calledTime);
		mode.update(() => 'upload');
		
		return new Promise((resolve, reject) => {
			show.update(() => true);
			this.app.$set({ uploadConfig: config });
			this.app.$on('uploaded', (event) => {
				resolve(event.detail);
			});
			this.app.$on('uploadError', () => {
				reject();
			});
			this.app.$on('cancel', () => {
				show.update(() => false);
				reject();
			});
		});
	}

	bulkMainVersionCheck(ids) {
		const api = new API();
		const auth = get_store_value(isAuthenticated);
		return new Promise(async (resolve, reject) => {
			if (!auth) {
				reject();
			} else {
				try {
					const chunkSize = 200;
					const chunks = [];
					for(let i = 0; i < ids.length; i++) {
						const key = Math.floor(i/chunkSize);
						if (!chunks[key]) {
							chunks[key] = [];
						}
						chunks[key].push(ids[i]);
					}
					
					Promise.all(chunks.map(async chunk => {
						const _options = { 
							ids: chunk,
							responseFields: [
								"id",
								"isMainVersion",
								"mainVersion",
								"mainVersionOriginalFileURL",
								"mainVersionFileName",
								"mainVersionFileSize"
							]
						};
						const data = await api.get(`/files/existence`, _options);
						if(!data.success) {
							throw new Error(data.errormessage)
						}
						return data;
					})).then((data) => {
						let files = [];
						data.forEach(d => {
							files = [...files, ...d.files];
						});
						resolve(files);
					});
				} catch(e) {
					console.log(e);
					reject(e);
				}
			}
		})
	}

	forceLogout = () => {
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('domain');
		localStorage.removeItem('proxy');
		isAuthenticated.update(() => false);
		domain.update(() => '');
		refreshToken.update(() => '');
	}

	getProxyConfiguration() {
		const proxyStettings = localStorage.getItem('proxy');
		if (proxyStettings) {
			return JSON.parse(proxyStettings);
		}
		return null;
	}

	getFileById(id, options) {
		const api = new API();
		const auth = get_store_value(isAuthenticated);
		return new Promise(async (resolve, reject) => {
			if (!auth) {
				reject();
			} else {
				try {
					const _options = { 
						responseFields: [
							"id",
							"originalFileURL",
							"width",
							"height",
							"fileName",
							"fileExtension",
							"uploadDate",
							"modifyDate",
							"rating",
							"userID",
							"fileSize",
							"dominantColor",
							"versions"
						],
						...(options || {})
					};
		
					const data = await api.get(`/files/${id}`, _options);
					if(!data.success) {
						throw new Error(data.errormessage)
					}
					resolve(data);
				} catch(e) {
					console.log(e);
					reject(e);
				}
			}
		})
	}
}

window.PIXXIO = PIXXIO;

export default PIXXIO;
//# sourceMappingURL=index.js.map
