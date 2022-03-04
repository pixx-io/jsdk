
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
function prevent_default(fn) {
    return function (event) {
        event.preventDefault();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function set_attributes(node, attributes) {
    // @ts-ignore
    const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
    for (const key in attributes) {
        if (attributes[key] == null) {
            node.removeAttribute(key);
        }
        else if (key === 'style') {
            node.style.cssText = attributes[key];
        }
        else if (key === '__value') {
            node.value = node[key] = attributes[key];
        }
        else if (descriptors[key] && descriptors[key].set) {
            node[key] = attributes[key];
        }
        else {
            attr(node, key, attributes[key]);
        }
    }
}
function set_custom_element_data(node, prop, value) {
    if (prop in node) {
        node[prop] = value;
    }
    else {
        attr(node, prop, value);
    }
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
// unfortunately this can't be a constant as that wouldn't be tree-shakeable
// so we cache the result instead
let crossorigin;
function is_crossorigin() {
    if (crossorigin === undefined) {
        crossorigin = false;
        try {
            if (typeof window !== 'undefined' && window.parent) {
                void window.parent.document;
            }
        }
        catch (error) {
            crossorigin = true;
        }
    }
    return crossorigin;
}
function add_resize_listener(node, fn) {
    const computed_style = getComputedStyle(node);
    if (computed_style.position === 'static') {
        node.style.position = 'relative';
    }
    const iframe = element('iframe');
    iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
        'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    const crossorigin = is_crossorigin();
    let unsubscribe;
    if (crossorigin) {
        iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
        unsubscribe = listen(window, 'message', (event) => {
            if (event.source === iframe.contentWindow)
                fn();
        });
    }
    else {
        iframe.src = 'about:blank';
        iframe.onload = () => {
            unsubscribe = listen(iframe.contentWindow, 'resize', fn);
        };
    }
    append(node, iframe);
    return () => {
        if (crossorigin) {
            unsubscribe();
        }
        else if (unsubscribe && iframe.contentWindow) {
            unsubscribe();
        }
        detach(iframe);
    };
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}
class HtmlTag {
    constructor(anchor = null) {
        this.a = anchor;
        this.e = this.n = null;
    }
    m(html, target, anchor = null) {
        if (!this.e) {
            this.e = element(target.nodeName);
            this.t = target;
            this.h(html);
        }
        this.i(anchor);
    }
    h(html) {
        this.e.innerHTML = html;
        this.n = Array.from(this.e.childNodes);
    }
    i(anchor) {
        for (let i = 0; i < this.n.length; i += 1) {
            insert(this.t, this.n[i], anchor);
        }
    }
    p(html) {
        this.d();
        this.h(html);
        this.i(this.a);
    }
    d() {
        this.n.forEach(detach);
    }
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
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
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
function tick() {
    schedule_update();
    return resolved_promise;
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
function outro_and_destroy_block(block, lookup) {
    transition_out(block, 1, 1, () => {
        lookup.delete(block.key);
    });
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--)
        old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = new Map();
    const deltas = new Map();
    i = n;
    while (i--) {
        const child_ctx = get_context(ctx, list, i);
        const key = get_key(child_ctx);
        let block = lookup.get(key);
        if (!block) {
            block = create_each_block(key, child_ctx);
            block.c();
        }
        else if (dynamic) {
            block.p(child_ctx, dirty);
        }
        new_lookup.set(key, new_blocks[i] = block);
        if (key in old_indexes)
            deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = new Set();
    const did_move = new Set();
    function insert(block) {
        transition_in(block, 1);
        block.m(node, next);
        lookup.set(block.key, block);
        next = block.first;
        n--;
    }
    while (o && n) {
        const new_block = new_blocks[n - 1];
        const old_block = old_blocks[o - 1];
        const new_key = new_block.key;
        const old_key = old_block.key;
        if (new_block === old_block) {
            // do nothing
            next = new_block.first;
            o--;
            n--;
        }
        else if (!new_lookup.has(old_key)) {
            // remove old block
            destroy(old_block, lookup);
            o--;
        }
        else if (!lookup.has(new_key) || will_move.has(new_key)) {
            insert(new_block);
        }
        else if (did_move.has(old_key)) {
            o--;
        }
        else if (deltas.get(new_key) > deltas.get(old_key)) {
            did_move.add(new_key);
            insert(new_block);
        }
        else {
            will_move.add(old_key);
            o--;
        }
    }
    while (o--) {
        const old_block = old_blocks[o];
        if (!new_lookup.has(old_block.key))
            destroy(old_block, lookup);
    }
    while (n)
        insert(new_blocks[n - 1]);
    return new_blocks;
}
function validate_each_keys(ctx, list, get_context, get_key) {
    const keys = new Set();
    for (let i = 0; i < list.length; i++) {
        const key = get_key(get_context(ctx, list, i));
        if (keys.has(key)) {
            throw new Error('Cannot have duplicate keys in a keyed each');
        }
        keys.add(key);
    }
}

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}

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
                  this.call(method, path, parameters, useAccessToken, additionalHeaders, setDefaultHeader, useURLSearchParams).subscribe((newData) => {
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

/* src\Logo.svelte generated by Svelte v3.35.0 */

const file$h = "src\\Logo.svelte";

function create_fragment$i(ctx) {
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
			add_location(path0, file$h, 6, 8, 156);
			attr_dev(path1, "d", "M47.44 19.9h1.69a.3.3 0 00.31-.3V6.18a.3.3 0 00-.31-.3h-1.69a.3.3 0 00-.31.3V19.6a.3.3 0 00.31.3z");
			add_location(path1, file$h, 7, 8, 775);
			attr_dev(path2, "d", "M81.31 15.38h1.7a.3.3 0 00.3-.31V6.26a.3.3 0 00-.3-.31h-1.7a.3.3 0 00-.3.31v8.8a.3.3 0 00.3.32z");
			add_location(path2, file$h, 8, 8, 894);
			attr_dev(path3, "d", "M64.36 5.84h-1.97a.31.31 0 00-.27.14L58.4 11l-3.75-5.02a.44.44 0 00-.24-.14h-1.96a.31.31 0 00-.24.51l4.89 6.44-5 6.6a.32.32 0 00.25.52h1.96a.23.23 0 00.24-.14l3.85-5.2 3.86 5.23a.42.42 0 00.27.14h1.96a.31.31 0 00.24-.52l-4.99-6.6 4.89-6.44a.35.35 0 00-.27-.54z");
			add_location(path3, file$h, 9, 8, 1011);
			attr_dev(path4, "d", "M77.98 5.84h-1.96a.31.31 0 00-.28.14L72.03 11l-3.75-5.02a.44.44 0 00-.24-.14h-1.97a.31.31 0 00-.24.51l4.89 6.44-5.02 6.6a.32.32 0 00.24.52h1.96a.23.23 0 00.24-.14l3.85-5.2 3.86 5.2a.42.42 0 00.27.14h1.96a.31.31 0 00.24-.52l-4.99-6.6 4.89-6.44a.31.31 0 00-.24-.51z");
			add_location(path4, file$h, 10, 8, 1293);
			attr_dev(path5, "d", "M99.2 9.04a6.16 6.16 0 00-2.33-2.62 6.94 6.94 0 00-3.65-.96 6.68 6.68 0 00-3.58.93A6.26 6.26 0 0087.27 9a8.63 8.63 0 00-.83 3.9 8.58 8.58 0 00.83 3.84 6.4 6.4 0 002.34 2.62 7.37 7.37 0 007.22.03 6.16 6.16 0 002.34-2.61 8.63 8.63 0 00.83-3.89 8.05 8.05 0 00-.8-3.85zm-2.71 7.6a3.77 3.77 0 01-3.24 1.44 3.86 3.86 0 01-3.23-1.44 6.21 6.21 0 01-1.1-3.82 7.37 7.37 0 01.48-2.72 3.8 3.8 0 011.41-1.82 4.06 4.06 0 012.41-.66 3.84 3.84 0 013.23 1.41 6.1 6.1 0 011.07 3.79 5.92 5.92 0 01-1.03 3.82z");
			add_location(path5, file$h, 11, 8, 1578);
			attr_dev(path6, "class", "logoIcon svelte-bfa57z");
			attr_dev(path6, "d", "M81.31 19.77h1.7a.3.3 0 00.3-.31v-1.68a.3.3 0 00-.3-.31h-1.7a.3.3 0 00-.3.3v1.7a.3.3 0 00.3.3z");
			add_location(path6, file$h, 12, 8, 2089);
			attr_dev(path7, "class", "logoIcon svelte-bfa57z");
			attr_dev(path7, "d", "M13.18 25.78a13.48 13.48 0 01-6.75-1.82l-.68-.4v-3.4H2.27l-.41-.67A12.76 12.76 0 010 12.9 13.06 13.06 0 0113.18 0a13.06 13.06 0 0113.18 12.9 13.06 13.06 0 01-13.18 12.88zm-4.61-3.8a10.27 10.27 0 004.6 1.04A10.26 10.26 0 0023.54 12.9 10.23 10.23 0 0013.18 2.8 10.26 10.26 0 002.82 12.92a10.13 10.13 0 001.07 4.51h1.86v-4.5a7.37 7.37 0 017.43-7.28 7.37 7.37 0 017.43 7.27 7.37 7.37 0 01-7.43 7.27H8.57zm4.6-13.56a4.56 4.56 0 00-4.6 4.5v4.52h4.6a4.51 4.51 0 100-9.02z");
			add_location(path7, file$h, 13, 8, 2222);
			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg, "viewBox", "0 0 100 25.78");
			attr_dev(svg, "class", "svelte-bfa57z");
			add_location(svg, file$h, 5, 6, 82);
			attr_dev(div0, "class", "header__logo svelte-bfa57z");
			add_location(div0, file$h, 4, 2, 48);
			attr_dev(div1, "class", "header svelte-bfa57z");
			add_location(div1, file$h, 3, 1, 24);
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
		id: create_fragment$i.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$i($$self, $$props) {
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
		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Logo",
			options,
			id: create_fragment$i.name
		});
	}
}

const showSelection = writable(false);
const searchTerm = writable('');
const format$1 = writable('preview');
const allowTypes = writable([]);
const allowFormats = writable(null);
const changed = writable(1);
const maxFiles = writable(0);
const additionalResponseFields = writable([]);
const showFileName = writable(false);
const showFileType = writable(false);
const showFileSize = writable(false);

/* src\SearchField.svelte generated by Svelte v3.35.0 */
const file$g = "src\\SearchField.svelte";

function create_fragment$h(ctx) {
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
			attr_dev(input_1, "class", "svelte-8a3fjp");
			add_location(input_1, file$g, 18, 4, 359);
			attr_dev(label, "for", "pixxio-search");
			attr_dev(label, "class", "svelte-8a3fjp");
			add_location(label, file$g, 19, 4, 457);
			attr_dev(div0, "class", "field svelte-8a3fjp");
			add_location(div0, file$g, 17, 2, 334);
			attr_dev(div1, "class", "searchField fields svelte-8a3fjp");
			add_location(div1, file$g, 16, 0, 298);
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
		id: create_fragment$h.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$h($$self, $$props, $$invalidate) {
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
		init(this, options, instance$h, create_fragment$h, safe_not_equal, { value: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "SearchField",
			options,
			id: create_fragment$h.name
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

/* src\Loading.svelte generated by Svelte v3.35.0 */
const file$f = "src\\Loading.svelte";

function create_fragment$g(ctx) {
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
			add_location(path, file$f, 6, 86, 189);
			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg, "id", "pixxioIcon");
			attr_dev(svg, "viewBox", "0 0 76.52 76.52");
			attr_dev(svg, "class", "svelte-fhr97u");
			add_location(svg, file$f, 6, 4, 107);
			attr_dev(div0, "class", "svelte-fhr97u");
			add_location(div0, file$f, 5, 2, 96);
			attr_dev(div1, "id", "pixxio-ta-loading");
			attr_dev(div1, "class", "svelte-fhr97u");
			add_location(div1, file$f, 4, 0, 64);
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
		id: create_fragment$g.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$g($$self, $$props, $$invalidate) {
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
		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Loading",
			options,
			id: create_fragment$g.name
		});
	}
}

/* src\Login.svelte generated by Svelte v3.35.0 */

const { console: console_1$3 } = globals;
const file$e = "src\\Login.svelte";

// (116:2) {#if !$domain}
function create_if_block_5$2(ctx) {
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
			attr_dev(input, "class", "svelte-zok5rk");
			add_location(input, file$e, 117, 4, 3313);
			attr_dev(label, "for", "pixxio-mediaspace");
			attr_dev(label, "class", "svelte-zok5rk");
			add_location(label, file$e, 118, 4, 3453);
			attr_dev(div, "class", "field svelte-zok5rk");
			add_location(div, file$e, 116, 2, 3288);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, input);
			set_input_value(input, /*mediaspace*/ ctx[4]);
			append_dev(div, t0);
			append_dev(div, label);

			if (!mounted) {
				dispose = [
					listen_dev(input, "input", /*input_input_handler*/ ctx[13]),
					listen_dev(input, "keydown", /*handleKeydown*/ ctx[12], false, false, false)
				];

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
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_5$2.name,
		type: "if",
		source: "(116:2) {#if !$domain}",
		ctx
	});

	return block;
}

// (130:2) {#if $askForProxy}
function create_if_block_3$3(ctx) {
	let small;
	let a;
	let t1;
	let if_block_anchor;
	let mounted;
	let dispose;
	let if_block = /*showAdvancedSettings*/ ctx[6] && create_if_block_4$2(ctx);

	const block = {
		c: function create() {
			small = element("small");
			a = element("a");
			a.textContent = `${lang("advanced")}`;
			t1 = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
			attr_dev(a, "href", "#");
			attr_dev(a, "class", "advanced svelte-zok5rk");
			add_location(a, file$e, 130, 11, 4030);
			attr_dev(small, "class", "svelte-zok5rk");
			add_location(small, file$e, 130, 4, 4023);
		},
		m: function mount(target, anchor) {
			insert_dev(target, small, anchor);
			append_dev(small, a);
			insert_dev(target, t1, anchor);
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);

			if (!mounted) {
				dispose = listen_dev(a, "click", /*click_handler*/ ctx[16], false, false, false);
				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			if (/*showAdvancedSettings*/ ctx[6]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_4$2(ctx);
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
		id: create_if_block_3$3.name,
		type: "if",
		source: "(130:2) {#if $askForProxy}",
		ctx
	});

	return block;
}

// (132:4) {#if showAdvancedSettings }
function create_if_block_4$2(ctx) {
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
			add_location(br0, file$e, 132, 4, 4190);
			add_location(br1, file$e, 133, 4, 4200);
			attr_dev(input0, "id", "pixxio-host");
			input0.disabled = /*isLoading*/ ctx[3];
			attr_dev(input0, "type", "text");
			attr_dev(input0, "placeholder", " ");
			attr_dev(input0, "class", "svelte-zok5rk");
			add_location(input0, file$e, 135, 6, 4237);
			attr_dev(label0, "for", "pixxio-host");
			attr_dev(label0, "class", "svelte-zok5rk");
			add_location(label0, file$e, 136, 6, 4363);
			attr_dev(div0, "class", "field svelte-zok5rk");
			add_location(div0, file$e, 134, 4, 4210);
			attr_dev(input1, "id", "pixxio-auth-username");
			input1.disabled = /*isLoading*/ ctx[3];
			attr_dev(input1, "type", "text");
			attr_dev(input1, "placeholder", " ");
			attr_dev(input1, "class", "svelte-zok5rk");
			add_location(input1, file$e, 139, 6, 4474);
			attr_dev(label1, "for", "pixxio-auth-username");
			attr_dev(label1, "class", "svelte-zok5rk");
			add_location(label1, file$e, 140, 6, 4606);
			attr_dev(div1, "class", "field svelte-zok5rk");
			add_location(div1, file$e, 138, 4, 4447);
			attr_dev(input2, "id", "pixxio-auth-password");
			input2.disabled = /*isLoading*/ ctx[3];
			attr_dev(input2, "type", "password");
			attr_dev(input2, "placeholder", " ");
			attr_dev(input2, "class", "svelte-zok5rk");
			add_location(input2, file$e, 143, 6, 4722);
			attr_dev(label2, "for", "pixxio-auth-password");
			attr_dev(label2, "class", "svelte-zok5rk");
			add_location(label2, file$e, 144, 6, 4858);
			attr_dev(div2, "class", "field svelte-zok5rk");
			add_location(div2, file$e, 142, 4, 4695);
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
					listen_dev(input0, "input", /*input0_input_handler_1*/ ctx[17]),
					listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[18]),
					listen_dev(input2, "input", /*input2_input_handler*/ ctx[19])
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
		id: create_if_block_4$2.name,
		type: "if",
		source: "(132:4) {#if showAdvancedSettings }",
		ctx
	});

	return block;
}

// (149:2) {#if hasError && !applicationKeyIsLocked}
function create_if_block_2$5(ctx) {
	let small;

	const block = {
		c: function create() {
			small = element("small");
			small.textContent = `${lang("signin_error")}`;
			attr_dev(small, "class", "error svelte-zok5rk");
			add_location(small, file$e, 149, 2, 5010);
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
		id: create_if_block_2$5.name,
		type: "if",
		source: "(149:2) {#if hasError && !applicationKeyIsLocked}",
		ctx
	});

	return block;
}

// (152:2) {#if hasError && applicationKeyIsLocked}
function create_if_block_1$7(ctx) {
	let small;

	const block = {
		c: function create() {
			small = element("small");
			small.textContent = `${lang("application_key_error")}`;
			attr_dev(small, "class", "error svelte-zok5rk");
			add_location(small, file$e, 152, 2, 5118);
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
		id: create_if_block_1$7.name,
		type: "if",
		source: "(152:2) {#if hasError && applicationKeyIsLocked}",
		ctx
	});

	return block;
}

// (158:2) {#if isLoading}
function create_if_block$9(ctx) {
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
		id: create_if_block$9.name,
		type: "if",
		source: "(158:2) {#if isLoading}",
		ctx
	});

	return block;
}

function create_fragment$f(ctx) {
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
	let if_block0 = !/*$domain*/ ctx[8] && create_if_block_5$2(ctx);
	let if_block1 = /*$askForProxy*/ ctx[10] && create_if_block_3$3(ctx);
	let if_block2 = /*hasError*/ ctx[2] && !/*applicationKeyIsLocked*/ ctx[5] && create_if_block_2$5(ctx);
	let if_block3 = /*hasError*/ ctx[2] && /*applicationKeyIsLocked*/ ctx[5] && create_if_block_1$7(ctx);
	let if_block4 = /*isLoading*/ ctx[3] && create_if_block$9(ctx);

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
			attr_dev(h2, "class", "svelte-zok5rk");
			add_location(h2, file$e, 113, 2, 3202);
			attr_dev(p, "class", "svelte-zok5rk");
			add_location(p, file$e, 114, 2, 3231);
			attr_dev(input0, "id", "pixxio-username");
			input0.disabled = /*isLoading*/ ctx[3];
			attr_dev(input0, "type", "text");
			attr_dev(input0, "placeholder", " ");
			attr_dev(input0, "class", "svelte-zok5rk");
			add_location(input0, file$e, 122, 4, 3560);
			attr_dev(label0, "for", "pixxio-username");
			attr_dev(label0, "class", "svelte-zok5rk");
			add_location(label0, file$e, 123, 4, 3696);
			attr_dev(div0, "class", "field svelte-zok5rk");
			add_location(div0, file$e, 121, 2, 3535);
			attr_dev(input1, "id", "pixxio-password");
			input1.disabled = /*isLoading*/ ctx[3];
			attr_dev(input1, "type", "password");
			attr_dev(input1, "placeholder", " ");
			attr_dev(input1, "class", "svelte-zok5rk");
			add_location(input1, file$e, 126, 4, 3790);
			attr_dev(label1, "for", "pixxio-password");
			attr_dev(label1, "class", "svelte-zok5rk");
			add_location(label1, file$e, 127, 4, 3930);
			attr_dev(div1, "class", "field svelte-zok5rk");
			add_location(div1, file$e, 125, 2, 3765);
			attr_dev(button, "class", "button svelte-zok5rk");
			attr_dev(button, "type", "submit");
			button.disabled = /*isLoading*/ ctx[3];
			add_location(button, file$e, 155, 4, 5244);
			attr_dev(div2, "class", "buttonGroup buttonGroup--fullSize svelte-zok5rk");
			add_location(div2, file$e, 154, 2, 5191);
			attr_dev(div3, "class", "login fields svelte-zok5rk");
			toggle_class(div3, "no-modal", !/*$modal*/ ctx[9]);
			add_location(div3, file$e, 112, 0, 3145);
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
					listen_dev(input0, "input", /*input0_input_handler*/ ctx[14]),
					listen_dev(input0, "keydown", /*handleKeydown*/ ctx[12], false, false, false),
					listen_dev(input1, "input", /*input1_input_handler*/ ctx[15]),
					listen_dev(input1, "keydown", /*handleKeydown*/ ctx[12], false, false, false),
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
					if_block0 = create_if_block_5$2(ctx);
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
					if_block1 = create_if_block_3$3(ctx);
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
					if_block2 = create_if_block_2$5(ctx);
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
					if_block3 = create_if_block_1$7(ctx);
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
					if_block4 = create_if_block$9(ctx);
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
		id: create_fragment$f.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$f($$self, $$props, $$invalidate) {
	let $domain;
	let $appKey;
	let $modal;
	let $askForProxy;
	validate_store(domain, "domain");
	component_subscribe($$self, domain, $$value => $$invalidate(8, $domain = $$value));
	validate_store(appKey, "appKey");
	component_subscribe($$self, appKey, $$value => $$invalidate(20, $appKey = $$value));
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

	const handleKeydown = event => {
		if (event.key === "Enter") {
			login();
		}
	};

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<Login> was created with unknown prop '${key}'`);
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
		handleKeydown,
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
		handleKeydown,
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
		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Login",
			options,
			id: create_fragment$f.name
		});
	}
}

function isOutOfViewport (parent, container) {
    const parentBounding = parent.getBoundingClientRect();
    const boundingContainer = container.getBoundingClientRect();
    const out = {};

    out.top = parentBounding.top < 0;
    out.left = parentBounding.left < 0;
    out.bottom =
        parentBounding.bottom + boundingContainer.height >
        (window.innerHeight || document.documentElement.clientHeight);

    out.right =
        parentBounding.right >
        (window.innerWidth || document.documentElement.clientWidth);
    out.any = out.top || out.left || out.bottom || out.right;

    return out;
}

/* node_modules\svelte-select\src\Item.svelte generated by Svelte v3.35.0 */

const file$d = "node_modules\\svelte-select\\src\\Item.svelte";

function create_fragment$e(ctx) {
	let div;
	let raw_value = /*getOptionLabel*/ ctx[0](/*item*/ ctx[1], /*filterText*/ ctx[2]) + "";
	let div_class_value;

	const block = {
		c: function create() {
			div = element("div");
			attr_dev(div, "class", div_class_value = "item " + /*itemClasses*/ ctx[3] + " svelte-3e0qet");
			add_location(div, file$d, 78, 0, 1837);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			div.innerHTML = raw_value;
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*getOptionLabel, item, filterText*/ 7 && raw_value !== (raw_value = /*getOptionLabel*/ ctx[0](/*item*/ ctx[1], /*filterText*/ ctx[2]) + "")) div.innerHTML = raw_value;
			if (dirty & /*itemClasses*/ 8 && div_class_value !== (div_class_value = "item " + /*itemClasses*/ ctx[3] + " svelte-3e0qet")) {
				attr_dev(div, "class", div_class_value);
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$e.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$e($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Item", slots, []);
	let { isActive = false } = $$props;
	let { isFirst = false } = $$props;
	let { isHover = false } = $$props;
	let { isSelectable = false } = $$props;
	let { getOptionLabel = undefined } = $$props;
	let { item = undefined } = $$props;
	let { filterText = "" } = $$props;
	let itemClasses = "";

	const writable_props = [
		"isActive",
		"isFirst",
		"isHover",
		"isSelectable",
		"getOptionLabel",
		"item",
		"filterText"
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Item> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("isActive" in $$props) $$invalidate(4, isActive = $$props.isActive);
		if ("isFirst" in $$props) $$invalidate(5, isFirst = $$props.isFirst);
		if ("isHover" in $$props) $$invalidate(6, isHover = $$props.isHover);
		if ("isSelectable" in $$props) $$invalidate(7, isSelectable = $$props.isSelectable);
		if ("getOptionLabel" in $$props) $$invalidate(0, getOptionLabel = $$props.getOptionLabel);
		if ("item" in $$props) $$invalidate(1, item = $$props.item);
		if ("filterText" in $$props) $$invalidate(2, filterText = $$props.filterText);
	};

	$$self.$capture_state = () => ({
		isActive,
		isFirst,
		isHover,
		isSelectable,
		getOptionLabel,
		item,
		filterText,
		itemClasses
	});

	$$self.$inject_state = $$props => {
		if ("isActive" in $$props) $$invalidate(4, isActive = $$props.isActive);
		if ("isFirst" in $$props) $$invalidate(5, isFirst = $$props.isFirst);
		if ("isHover" in $$props) $$invalidate(6, isHover = $$props.isHover);
		if ("isSelectable" in $$props) $$invalidate(7, isSelectable = $$props.isSelectable);
		if ("getOptionLabel" in $$props) $$invalidate(0, getOptionLabel = $$props.getOptionLabel);
		if ("item" in $$props) $$invalidate(1, item = $$props.item);
		if ("filterText" in $$props) $$invalidate(2, filterText = $$props.filterText);
		if ("itemClasses" in $$props) $$invalidate(3, itemClasses = $$props.itemClasses);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*isActive, isFirst, isHover, item, isSelectable*/ 242) {
			{
				const classes = [];

				if (isActive) {
					classes.push("active");
				}

				if (isFirst) {
					classes.push("first");
				}

				if (isHover) {
					classes.push("hover");
				}

				if (item.isGroupHeader) {
					classes.push("groupHeader");
				}

				if (item.isGroupItem) {
					classes.push("groupItem");
				}

				if (!isSelectable) {
					classes.push("notSelectable");
				}

				$$invalidate(3, itemClasses = classes.join(" "));
			}
		}
	};

	return [
		getOptionLabel,
		item,
		filterText,
		itemClasses,
		isActive,
		isFirst,
		isHover,
		isSelectable
	];
}

class Item extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
			isActive: 4,
			isFirst: 5,
			isHover: 6,
			isSelectable: 7,
			getOptionLabel: 0,
			item: 1,
			filterText: 2
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Item",
			options,
			id: create_fragment$e.name
		});
	}

	get isActive() {
		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isActive(value) {
		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isFirst() {
		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isFirst(value) {
		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isHover() {
		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isHover(value) {
		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isSelectable() {
		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isSelectable(value) {
		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get getOptionLabel() {
		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set getOptionLabel(value) {
		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get item() {
		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set item(value) {
		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get filterText() {
		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set filterText(value) {
		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules\svelte-select\src\List.svelte generated by Svelte v3.35.0 */
const file$c = "node_modules\\svelte-select\\src\\List.svelte";

function get_each_context$5(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[41] = list[i];
	child_ctx[42] = i;
	return child_ctx;
}

// (309:4) {:else}
function create_else_block$1(ctx) {
	let each_1_anchor;
	let current;
	let each_value = /*items*/ ctx[1];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	let each_1_else = null;

	if (!each_value.length) {
		each_1_else = create_else_block_2(ctx);
	}

	const block = {
		c: function create() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();

			if (each_1_else) {
				each_1_else.c();
			}
		},
		m: function mount(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert_dev(target, each_1_anchor, anchor);

			if (each_1_else) {
				each_1_else.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*getGroupHeaderLabel, items, handleHover, handleClick, Item, filterText, getOptionLabel, value, optionIdentifier, hoverItemIndex, noOptionsMessage, hideEmptyState*/ 114390) {
				each_value = /*items*/ ctx[1];
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$5(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$5(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();

				if (!each_value.length && each_1_else) {
					each_1_else.p(ctx, dirty);
				} else if (!each_value.length) {
					each_1_else = create_else_block_2(ctx);
					each_1_else.c();
					each_1_else.m(each_1_anchor.parentNode, each_1_anchor);
				} else if (each_1_else) {
					each_1_else.d(1);
					each_1_else = null;
				}
			}
		},
		i: function intro(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o: function outro(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d: function destroy(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(each_1_anchor);
			if (each_1_else) each_1_else.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block$1.name,
		type: "else",
		source: "(309:4) {:else}",
		ctx
	});

	return block;
}

// (286:4) {#if isVirtualList}
function create_if_block$8(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;
	var switch_value = /*VirtualList*/ ctx[3];

	function switch_props(ctx) {
		return {
			props: {
				items: /*items*/ ctx[1],
				itemHeight: /*itemHeight*/ ctx[8],
				$$slots: {
					default: [
						create_default_slot$1,
						({ item, i }) => ({ 41: item, 42: i }),
						({ item, i }) => [0, (item ? 1024 : 0) | (i ? 2048 : 0)]
					]
				},
				$$scope: { ctx }
			},
			$$inline: true
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props(ctx));
	}

	const block = {
		c: function create() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert_dev(target, switch_instance_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const switch_instance_changes = {};
			if (dirty[0] & /*items*/ 2) switch_instance_changes.items = /*items*/ ctx[1];
			if (dirty[0] & /*itemHeight*/ 256) switch_instance_changes.itemHeight = /*itemHeight*/ ctx[8];

			if (dirty[0] & /*Item, filterText, getOptionLabel, value, optionIdentifier, hoverItemIndex, items*/ 9814 | dirty[1] & /*$$scope, item, i*/ 11264) {
				switch_instance_changes.$$scope = { dirty, ctx };
			}

			if (switch_value !== (switch_value = /*VirtualList*/ ctx[3])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i: function intro(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$8.name,
		type: "if",
		source: "(286:4) {#if isVirtualList}",
		ctx
	});

	return block;
}

// (331:8) {:else}
function create_else_block_2(ctx) {
	let if_block_anchor;
	let if_block = !/*hideEmptyState*/ ctx[11] && create_if_block_2$4(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (!/*hideEmptyState*/ ctx[11]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block_2$4(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block_2.name,
		type: "else",
		source: "(331:8) {:else}",
		ctx
	});

	return block;
}

// (332:12) {#if !hideEmptyState}
function create_if_block_2$4(ctx) {
	let div;
	let t;

	const block = {
		c: function create() {
			div = element("div");
			t = text(/*noOptionsMessage*/ ctx[12]);
			attr_dev(div, "class", "empty svelte-1uyqfml");
			add_location(div, file$c, 332, 16, 10333);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, t);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*noOptionsMessage*/ 4096) set_data_dev(t, /*noOptionsMessage*/ ctx[12]);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2$4.name,
		type: "if",
		source: "(332:12) {#if !hideEmptyState}",
		ctx
	});

	return block;
}

// (313:12) {:else}
function create_else_block_1(ctx) {
	let div;
	let switch_instance;
	let t;
	let current;
	let mounted;
	let dispose;
	var switch_value = /*Item*/ ctx[4];

	function switch_props(ctx) {
		return {
			props: {
				item: /*item*/ ctx[41],
				filterText: /*filterText*/ ctx[13],
				getOptionLabel: /*getOptionLabel*/ ctx[6],
				isFirst: isItemFirst(/*i*/ ctx[42]),
				isActive: isItemActive(/*item*/ ctx[41], /*value*/ ctx[9], /*optionIdentifier*/ ctx[10]),
				isHover: isItemHover(/*hoverItemIndex*/ ctx[2], /*item*/ ctx[41], /*i*/ ctx[42], /*items*/ ctx[1]),
				isSelectable: isItemSelectable(/*item*/ ctx[41])
			},
			$$inline: true
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props(ctx));
	}

	function mouseover_handler_1() {
		return /*mouseover_handler_1*/ ctx[29](/*i*/ ctx[42]);
	}

	function focus_handler_1() {
		return /*focus_handler_1*/ ctx[30](/*i*/ ctx[42]);
	}

	function click_handler_1(...args) {
		return /*click_handler_1*/ ctx[31](/*item*/ ctx[41], /*i*/ ctx[42], ...args);
	}

	const block = {
		c: function create() {
			div = element("div");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			t = space();
			attr_dev(div, "class", "listItem");
			attr_dev(div, "tabindex", "-1");
			add_location(div, file$c, 313, 16, 9513);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);

			if (switch_instance) {
				mount_component(switch_instance, div, null);
			}

			append_dev(div, t);
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(div, "mouseover", mouseover_handler_1, false, false, false),
					listen_dev(div, "focus", focus_handler_1, false, false, false),
					listen_dev(div, "click", click_handler_1, false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			const switch_instance_changes = {};
			if (dirty[0] & /*items*/ 2) switch_instance_changes.item = /*item*/ ctx[41];
			if (dirty[0] & /*filterText*/ 8192) switch_instance_changes.filterText = /*filterText*/ ctx[13];
			if (dirty[0] & /*getOptionLabel*/ 64) switch_instance_changes.getOptionLabel = /*getOptionLabel*/ ctx[6];
			if (dirty[0] & /*items, value, optionIdentifier*/ 1538) switch_instance_changes.isActive = isItemActive(/*item*/ ctx[41], /*value*/ ctx[9], /*optionIdentifier*/ ctx[10]);
			if (dirty[0] & /*hoverItemIndex, items*/ 6) switch_instance_changes.isHover = isItemHover(/*hoverItemIndex*/ ctx[2], /*item*/ ctx[41], /*i*/ ctx[42], /*items*/ ctx[1]);
			if (dirty[0] & /*items*/ 2) switch_instance_changes.isSelectable = isItemSelectable(/*item*/ ctx[41]);

			if (switch_value !== (switch_value = /*Item*/ ctx[4])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div, t);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i: function intro(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (switch_instance) destroy_component(switch_instance);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block_1.name,
		type: "else",
		source: "(313:12) {:else}",
		ctx
	});

	return block;
}

// (311:12) {#if item.isGroupHeader && !item.isSelectable}
function create_if_block_1$6(ctx) {
	let div;
	let t_value = /*getGroupHeaderLabel*/ ctx[7](/*item*/ ctx[41]) + "";
	let t;

	const block = {
		c: function create() {
			div = element("div");
			t = text(t_value);
			attr_dev(div, "class", "listGroupTitle svelte-1uyqfml");
			add_location(div, file$c, 311, 16, 9415);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, t);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*getGroupHeaderLabel, items*/ 130 && t_value !== (t_value = /*getGroupHeaderLabel*/ ctx[7](/*item*/ ctx[41]) + "")) set_data_dev(t, t_value);
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$6.name,
		type: "if",
		source: "(311:12) {#if item.isGroupHeader && !item.isSelectable}",
		ctx
	});

	return block;
}

// (310:8) {#each items as item, i}
function create_each_block$5(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_1$6, create_else_block_1];
	const if_blocks = [];

	function select_block_type_1(ctx, dirty) {
		if (/*item*/ ctx[41].isGroupHeader && !/*item*/ ctx[41].isSelectable) return 0;
		return 1;
	}

	current_block_type_index = select_block_type_1(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type_1(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$5.name,
		type: "each",
		source: "(310:8) {#each items as item, i}",
		ctx
	});

	return block;
}

// (287:8) <svelte:component             this={VirtualList}             {items}             {itemHeight}             let:item             let:i>
function create_default_slot$1(ctx) {
	let div;
	let switch_instance;
	let current;
	let mounted;
	let dispose;
	var switch_value = /*Item*/ ctx[4];

	function switch_props(ctx) {
		return {
			props: {
				item: /*item*/ ctx[41],
				filterText: /*filterText*/ ctx[13],
				getOptionLabel: /*getOptionLabel*/ ctx[6],
				isFirst: isItemFirst(/*i*/ ctx[42]),
				isActive: isItemActive(/*item*/ ctx[41], /*value*/ ctx[9], /*optionIdentifier*/ ctx[10]),
				isHover: isItemHover(/*hoverItemIndex*/ ctx[2], /*item*/ ctx[41], /*i*/ ctx[42], /*items*/ ctx[1]),
				isSelectable: isItemSelectable(/*item*/ ctx[41])
			},
			$$inline: true
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props(ctx));
	}

	function mouseover_handler() {
		return /*mouseover_handler*/ ctx[26](/*i*/ ctx[42]);
	}

	function focus_handler() {
		return /*focus_handler*/ ctx[27](/*i*/ ctx[42]);
	}

	function click_handler(...args) {
		return /*click_handler*/ ctx[28](/*item*/ ctx[41], /*i*/ ctx[42], ...args);
	}

	const block = {
		c: function create() {
			div = element("div");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			attr_dev(div, "class", "listItem");
			add_location(div, file$c, 292, 12, 8621);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);

			if (switch_instance) {
				mount_component(switch_instance, div, null);
			}

			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(div, "mouseover", mouseover_handler, false, false, false),
					listen_dev(div, "focus", focus_handler, false, false, false),
					listen_dev(div, "click", click_handler, false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			const switch_instance_changes = {};
			if (dirty[1] & /*item*/ 1024) switch_instance_changes.item = /*item*/ ctx[41];
			if (dirty[0] & /*filterText*/ 8192) switch_instance_changes.filterText = /*filterText*/ ctx[13];
			if (dirty[0] & /*getOptionLabel*/ 64) switch_instance_changes.getOptionLabel = /*getOptionLabel*/ ctx[6];
			if (dirty[1] & /*i*/ 2048) switch_instance_changes.isFirst = isItemFirst(/*i*/ ctx[42]);
			if (dirty[0] & /*value, optionIdentifier*/ 1536 | dirty[1] & /*item*/ 1024) switch_instance_changes.isActive = isItemActive(/*item*/ ctx[41], /*value*/ ctx[9], /*optionIdentifier*/ ctx[10]);
			if (dirty[0] & /*hoverItemIndex, items*/ 6 | dirty[1] & /*item, i*/ 3072) switch_instance_changes.isHover = isItemHover(/*hoverItemIndex*/ ctx[2], /*item*/ ctx[41], /*i*/ ctx[42], /*items*/ ctx[1]);
			if (dirty[1] & /*item*/ 1024) switch_instance_changes.isSelectable = isItemSelectable(/*item*/ ctx[41]);

			if (switch_value !== (switch_value = /*Item*/ ctx[4])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div, null);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i: function intro(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (switch_instance) destroy_component(switch_instance);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$1.name,
		type: "slot",
		source: "(287:8) <svelte:component             this={VirtualList}             {items}             {itemHeight}             let:item             let:i>",
		ctx
	});

	return block;
}

function create_fragment$d(ctx) {
	let div;
	let current_block_type_index;
	let if_block;
	let current;
	let mounted;
	let dispose;
	const if_block_creators = [create_if_block$8, create_else_block$1];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*isVirtualList*/ ctx[5]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			div = element("div");
			if_block.c();
			attr_dev(div, "class", "listContainer svelte-1uyqfml");
			attr_dev(div, "style", /*listStyle*/ ctx[14]);
			toggle_class(div, "virtualList", /*isVirtualList*/ ctx[5]);
			add_location(div, file$c, 280, 0, 8325);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			if_blocks[current_block_type_index].m(div, null);
			/*div_binding*/ ctx[32](div);
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(window, "keydown", /*handleKeyDown*/ ctx[17], false, false, false),
					listen_dev(window, "resize", /*computePlacement*/ ctx[18], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(div, null);
			}

			if (!current || dirty[0] & /*listStyle*/ 16384) {
				attr_dev(div, "style", /*listStyle*/ ctx[14]);
			}

			if (dirty[0] & /*isVirtualList*/ 32) {
				toggle_class(div, "virtualList", /*isVirtualList*/ ctx[5]);
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
			if (detaching) detach_dev(div);
			if_blocks[current_block_type_index].d();
			/*div_binding*/ ctx[32](null);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$d.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function isItemActive(item, value, optionIdentifier) {
	return value && value[optionIdentifier] === item[optionIdentifier];
}

function isItemFirst(itemIndex) {
	return itemIndex === 0;
}

function isItemHover(hoverItemIndex, item, itemIndex, items) {
	return isItemSelectable(item) && (hoverItemIndex === itemIndex || items.length === 1);
}

function isItemSelectable(item) {
	return item.isGroupHeader && item.isSelectable || item.selectable || !item.hasOwnProperty("selectable"); // Default; if `selectable` was not specified, the object is selectable
}

function instance$d($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("List", slots, []);
	const dispatch = createEventDispatcher();
	let { container = undefined } = $$props;
	let { VirtualList = null } = $$props;
	let { Item: Item$1 = Item } = $$props;
	let { isVirtualList = false } = $$props;
	let { items = [] } = $$props;
	let { labelIdentifier = "label" } = $$props;

	let { getOptionLabel = (option, filterText) => {
		if (option) return option.isCreator
		? `Create \"${filterText}\"`
		: option[labelIdentifier];
	} } = $$props;

	let { getGroupHeaderLabel = null } = $$props;
	let { itemHeight = 40 } = $$props;
	let { hoverItemIndex = 0 } = $$props;
	let { value = undefined } = $$props;
	let { optionIdentifier = "value" } = $$props;
	let { hideEmptyState = false } = $$props;
	let { noOptionsMessage = "No options" } = $$props;
	let { isMulti = false } = $$props;
	let { activeItemIndex = 0 } = $$props;
	let { filterText = "" } = $$props;
	let { parent = null } = $$props;
	let { listPlacement = null } = $$props;
	let { listAutoWidth = null } = $$props;
	let { listOffset = 5 } = $$props;
	let isScrollingTimer = 0;
	let isScrolling = false;
	let prev_items;

	onMount(() => {
		if (items.length > 0 && !isMulti && value) {
			const _hoverItemIndex = items.findIndex(item => item[optionIdentifier] === value[optionIdentifier]);

			if (_hoverItemIndex) {
				$$invalidate(2, hoverItemIndex = _hoverItemIndex);
			}
		}

		scrollToActiveItem("active");

		container.addEventListener(
			"scroll",
			() => {
				clearTimeout(isScrollingTimer);

				isScrollingTimer = setTimeout(
					() => {
						isScrolling = false;
					},
					100
				);
			},
			false
		);
	});

	beforeUpdate(() => {
		if (!items) $$invalidate(1, items = []);

		if (items !== prev_items && items.length > 0) {
			$$invalidate(2, hoverItemIndex = 0);
		}

		prev_items = items;
	});

	function handleSelect(item) {
		if (item.isCreator) return;
		dispatch("itemSelected", item);
	}

	function handleHover(i) {
		if (isScrolling) return;
		$$invalidate(2, hoverItemIndex = i);
	}

	function handleClick(args) {
		const { item, i, event } = args;
		event.stopPropagation();
		if (value && !isMulti && value[optionIdentifier] === item[optionIdentifier]) return closeList();

		if (item.isCreator) {
			dispatch("itemCreated", filterText);
		} else if (isItemSelectable(item)) {
			$$invalidate(19, activeItemIndex = i);
			$$invalidate(2, hoverItemIndex = i);
			handleSelect(item);
		}
	}

	function closeList() {
		dispatch("closeList");
	}

	async function updateHoverItem(increment) {
		if (isVirtualList) return;
		let isNonSelectableItem = true;

		while (isNonSelectableItem) {
			if (increment > 0 && hoverItemIndex === items.length - 1) {
				$$invalidate(2, hoverItemIndex = 0);
			} else if (increment < 0 && hoverItemIndex === 0) {
				$$invalidate(2, hoverItemIndex = items.length - 1);
			} else {
				$$invalidate(2, hoverItemIndex = hoverItemIndex + increment);
			}

			isNonSelectableItem = !isItemSelectable(items[hoverItemIndex]);
		}

		await tick();
		scrollToActiveItem("hover");
	}

	function handleKeyDown(e) {
		switch (e.key) {
			case "Escape":
				e.preventDefault();
				closeList();
				break;
			case "ArrowDown":
				e.preventDefault();
				items.length && updateHoverItem(1);
				break;
			case "ArrowUp":
				e.preventDefault();
				items.length && updateHoverItem(-1);
				break;
			case "Enter":
				e.preventDefault();
				if (items.length === 0) break;
				const hoverItem = items[hoverItemIndex];
				if (value && !isMulti && value[optionIdentifier] === hoverItem[optionIdentifier]) {
					closeList();
					break;
				}
				if (hoverItem.isCreator) {
					dispatch("itemCreated", filterText);
				} else {
					$$invalidate(19, activeItemIndex = hoverItemIndex);
					handleSelect(items[hoverItemIndex]);
				}
				break;
			case "Tab":
				e.preventDefault();
				if (items.length === 0) {
					return closeList();
				}
				if (value && value[optionIdentifier] === items[hoverItemIndex][optionIdentifier]) return closeList();
				$$invalidate(19, activeItemIndex = hoverItemIndex);
				handleSelect(items[hoverItemIndex]);
				break;
		}
	}

	function scrollToActiveItem(className) {
		if (isVirtualList || !container) return;
		let offsetBounding;
		const focusedElemBounding = container.querySelector(`.listItem .${className}`);

		if (focusedElemBounding) {
			offsetBounding = container.getBoundingClientRect().bottom - focusedElemBounding.getBoundingClientRect().bottom;
		}

		$$invalidate(0, container.scrollTop -= offsetBounding, container);
	}

	let listStyle;

	function computePlacement() {
		const { height, width } = parent.getBoundingClientRect();
		$$invalidate(14, listStyle = "");
		$$invalidate(14, listStyle += `min-width:${width}px;width:${listAutoWidth ? "auto" : "100%"};`);

		if (listPlacement === "top" || listPlacement === "auto" && isOutOfViewport(parent, container).bottom) {
			$$invalidate(14, listStyle += `bottom:${height + listOffset}px;`);
		} else {
			$$invalidate(14, listStyle += `top:${height + listOffset}px;`);
		}
	}

	const writable_props = [
		"container",
		"VirtualList",
		"Item",
		"isVirtualList",
		"items",
		"labelIdentifier",
		"getOptionLabel",
		"getGroupHeaderLabel",
		"itemHeight",
		"hoverItemIndex",
		"value",
		"optionIdentifier",
		"hideEmptyState",
		"noOptionsMessage",
		"isMulti",
		"activeItemIndex",
		"filterText",
		"parent",
		"listPlacement",
		"listAutoWidth",
		"listOffset"
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<List> was created with unknown prop '${key}'`);
	});

	const mouseover_handler = i => handleHover(i);
	const focus_handler = i => handleHover(i);
	const click_handler = (item, i, event) => handleClick({ item, i, event });
	const mouseover_handler_1 = i => handleHover(i);
	const focus_handler_1 = i => handleHover(i);
	const click_handler_1 = (item, i, event) => handleClick({ item, i, event });

	function div_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			container = $$value;
			$$invalidate(0, container);
		});
	}

	$$self.$$set = $$props => {
		if ("container" in $$props) $$invalidate(0, container = $$props.container);
		if ("VirtualList" in $$props) $$invalidate(3, VirtualList = $$props.VirtualList);
		if ("Item" in $$props) $$invalidate(4, Item$1 = $$props.Item);
		if ("isVirtualList" in $$props) $$invalidate(5, isVirtualList = $$props.isVirtualList);
		if ("items" in $$props) $$invalidate(1, items = $$props.items);
		if ("labelIdentifier" in $$props) $$invalidate(20, labelIdentifier = $$props.labelIdentifier);
		if ("getOptionLabel" in $$props) $$invalidate(6, getOptionLabel = $$props.getOptionLabel);
		if ("getGroupHeaderLabel" in $$props) $$invalidate(7, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
		if ("itemHeight" in $$props) $$invalidate(8, itemHeight = $$props.itemHeight);
		if ("hoverItemIndex" in $$props) $$invalidate(2, hoverItemIndex = $$props.hoverItemIndex);
		if ("value" in $$props) $$invalidate(9, value = $$props.value);
		if ("optionIdentifier" in $$props) $$invalidate(10, optionIdentifier = $$props.optionIdentifier);
		if ("hideEmptyState" in $$props) $$invalidate(11, hideEmptyState = $$props.hideEmptyState);
		if ("noOptionsMessage" in $$props) $$invalidate(12, noOptionsMessage = $$props.noOptionsMessage);
		if ("isMulti" in $$props) $$invalidate(21, isMulti = $$props.isMulti);
		if ("activeItemIndex" in $$props) $$invalidate(19, activeItemIndex = $$props.activeItemIndex);
		if ("filterText" in $$props) $$invalidate(13, filterText = $$props.filterText);
		if ("parent" in $$props) $$invalidate(22, parent = $$props.parent);
		if ("listPlacement" in $$props) $$invalidate(23, listPlacement = $$props.listPlacement);
		if ("listAutoWidth" in $$props) $$invalidate(24, listAutoWidth = $$props.listAutoWidth);
		if ("listOffset" in $$props) $$invalidate(25, listOffset = $$props.listOffset);
	};

	$$self.$capture_state = () => ({
		beforeUpdate,
		createEventDispatcher,
		onMount,
		tick,
		isOutOfViewport,
		ItemComponent: Item,
		dispatch,
		container,
		VirtualList,
		Item: Item$1,
		isVirtualList,
		items,
		labelIdentifier,
		getOptionLabel,
		getGroupHeaderLabel,
		itemHeight,
		hoverItemIndex,
		value,
		optionIdentifier,
		hideEmptyState,
		noOptionsMessage,
		isMulti,
		activeItemIndex,
		filterText,
		parent,
		listPlacement,
		listAutoWidth,
		listOffset,
		isScrollingTimer,
		isScrolling,
		prev_items,
		handleSelect,
		handleHover,
		handleClick,
		closeList,
		updateHoverItem,
		handleKeyDown,
		scrollToActiveItem,
		isItemActive,
		isItemFirst,
		isItemHover,
		isItemSelectable,
		listStyle,
		computePlacement
	});

	$$self.$inject_state = $$props => {
		if ("container" in $$props) $$invalidate(0, container = $$props.container);
		if ("VirtualList" in $$props) $$invalidate(3, VirtualList = $$props.VirtualList);
		if ("Item" in $$props) $$invalidate(4, Item$1 = $$props.Item);
		if ("isVirtualList" in $$props) $$invalidate(5, isVirtualList = $$props.isVirtualList);
		if ("items" in $$props) $$invalidate(1, items = $$props.items);
		if ("labelIdentifier" in $$props) $$invalidate(20, labelIdentifier = $$props.labelIdentifier);
		if ("getOptionLabel" in $$props) $$invalidate(6, getOptionLabel = $$props.getOptionLabel);
		if ("getGroupHeaderLabel" in $$props) $$invalidate(7, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
		if ("itemHeight" in $$props) $$invalidate(8, itemHeight = $$props.itemHeight);
		if ("hoverItemIndex" in $$props) $$invalidate(2, hoverItemIndex = $$props.hoverItemIndex);
		if ("value" in $$props) $$invalidate(9, value = $$props.value);
		if ("optionIdentifier" in $$props) $$invalidate(10, optionIdentifier = $$props.optionIdentifier);
		if ("hideEmptyState" in $$props) $$invalidate(11, hideEmptyState = $$props.hideEmptyState);
		if ("noOptionsMessage" in $$props) $$invalidate(12, noOptionsMessage = $$props.noOptionsMessage);
		if ("isMulti" in $$props) $$invalidate(21, isMulti = $$props.isMulti);
		if ("activeItemIndex" in $$props) $$invalidate(19, activeItemIndex = $$props.activeItemIndex);
		if ("filterText" in $$props) $$invalidate(13, filterText = $$props.filterText);
		if ("parent" in $$props) $$invalidate(22, parent = $$props.parent);
		if ("listPlacement" in $$props) $$invalidate(23, listPlacement = $$props.listPlacement);
		if ("listAutoWidth" in $$props) $$invalidate(24, listAutoWidth = $$props.listAutoWidth);
		if ("listOffset" in $$props) $$invalidate(25, listOffset = $$props.listOffset);
		if ("isScrollingTimer" in $$props) isScrollingTimer = $$props.isScrollingTimer;
		if ("isScrolling" in $$props) isScrolling = $$props.isScrolling;
		if ("prev_items" in $$props) prev_items = $$props.prev_items;
		if ("listStyle" in $$props) $$invalidate(14, listStyle = $$props.listStyle);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*parent, container*/ 4194305) {
			{
				if (parent && container) computePlacement();
			}
		}
	};

	return [
		container,
		items,
		hoverItemIndex,
		VirtualList,
		Item$1,
		isVirtualList,
		getOptionLabel,
		getGroupHeaderLabel,
		itemHeight,
		value,
		optionIdentifier,
		hideEmptyState,
		noOptionsMessage,
		filterText,
		listStyle,
		handleHover,
		handleClick,
		handleKeyDown,
		computePlacement,
		activeItemIndex,
		labelIdentifier,
		isMulti,
		parent,
		listPlacement,
		listAutoWidth,
		listOffset,
		mouseover_handler,
		focus_handler,
		click_handler,
		mouseover_handler_1,
		focus_handler_1,
		click_handler_1,
		div_binding
	];
}

class List extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(
			this,
			options,
			instance$d,
			create_fragment$d,
			safe_not_equal,
			{
				container: 0,
				VirtualList: 3,
				Item: 4,
				isVirtualList: 5,
				items: 1,
				labelIdentifier: 20,
				getOptionLabel: 6,
				getGroupHeaderLabel: 7,
				itemHeight: 8,
				hoverItemIndex: 2,
				value: 9,
				optionIdentifier: 10,
				hideEmptyState: 11,
				noOptionsMessage: 12,
				isMulti: 21,
				activeItemIndex: 19,
				filterText: 13,
				parent: 22,
				listPlacement: 23,
				listAutoWidth: 24,
				listOffset: 25
			},
			[-1, -1]
		);

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "List",
			options,
			id: create_fragment$d.name
		});
	}

	get container() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set container(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get VirtualList() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set VirtualList(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get Item() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set Item(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isVirtualList() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isVirtualList(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get items() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set items(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get labelIdentifier() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set labelIdentifier(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get getOptionLabel() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set getOptionLabel(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get getGroupHeaderLabel() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set getGroupHeaderLabel(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get itemHeight() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set itemHeight(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get hoverItemIndex() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set hoverItemIndex(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get value() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get optionIdentifier() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set optionIdentifier(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get hideEmptyState() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set hideEmptyState(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get noOptionsMessage() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set noOptionsMessage(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isMulti() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isMulti(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get activeItemIndex() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set activeItemIndex(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get filterText() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set filterText(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get parent() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set parent(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get listPlacement() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set listPlacement(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get listAutoWidth() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set listAutoWidth(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get listOffset() {
		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set listOffset(value) {
		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules\svelte-select\src\Selection.svelte generated by Svelte v3.35.0 */

const file$b = "node_modules\\svelte-select\\src\\Selection.svelte";

function create_fragment$c(ctx) {
	let div;
	let raw_value = /*getSelectionLabel*/ ctx[0](/*item*/ ctx[1]) + "";

	const block = {
		c: function create() {
			div = element("div");
			attr_dev(div, "class", "selection svelte-pu1q1n");
			add_location(div, file$b, 13, 0, 230);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			div.innerHTML = raw_value;
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*getSelectionLabel, item*/ 3 && raw_value !== (raw_value = /*getSelectionLabel*/ ctx[0](/*item*/ ctx[1]) + "")) div.innerHTML = raw_value;		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$c.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$c($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Selection", slots, []);
	let { getSelectionLabel = undefined } = $$props;
	let { item = undefined } = $$props;
	const writable_props = ["getSelectionLabel", "item"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Selection> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("getSelectionLabel" in $$props) $$invalidate(0, getSelectionLabel = $$props.getSelectionLabel);
		if ("item" in $$props) $$invalidate(1, item = $$props.item);
	};

	$$self.$capture_state = () => ({ getSelectionLabel, item });

	$$self.$inject_state = $$props => {
		if ("getSelectionLabel" in $$props) $$invalidate(0, getSelectionLabel = $$props.getSelectionLabel);
		if ("item" in $$props) $$invalidate(1, item = $$props.item);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [getSelectionLabel, item];
}

class Selection$1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$c, create_fragment$c, safe_not_equal, { getSelectionLabel: 0, item: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Selection",
			options,
			id: create_fragment$c.name
		});
	}

	get getSelectionLabel() {
		throw new Error("<Selection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set getSelectionLabel(value) {
		throw new Error("<Selection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get item() {
		throw new Error("<Selection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set item(value) {
		throw new Error("<Selection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules\svelte-select\src\MultiSelection.svelte generated by Svelte v3.35.0 */
const file$a = "node_modules\\svelte-select\\src\\MultiSelection.svelte";

function get_each_context$4(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[9] = list[i];
	child_ctx[11] = i;
	return child_ctx;
}

// (87:8) {#if !isDisabled && !multiFullItemClearable}
function create_if_block$7(ctx) {
	let div;
	let svg;
	let path;
	let mounted;
	let dispose;

	function click_handler(...args) {
		return /*click_handler*/ ctx[6](/*i*/ ctx[11], ...args);
	}

	const block = {
		c: function create() {
			div = element("div");
			svg = svg_element("svg");
			path = svg_element("path");
			attr_dev(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124 l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
			add_location(path, file$a, 97, 20, 3027);
			attr_dev(svg, "width", "100%");
			attr_dev(svg, "height", "100%");
			attr_dev(svg, "viewBox", "-2 -2 50 50");
			attr_dev(svg, "focusable", "false");
			attr_dev(svg, "aria-hidden", "true");
			attr_dev(svg, "role", "presentation");
			attr_dev(svg, "class", "svelte-liu9pa");
			add_location(svg, file$a, 90, 16, 2775);
			attr_dev(div, "class", "multiSelectItem_clear svelte-liu9pa");
			add_location(div, file$a, 87, 12, 2647);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, svg);
			append_dev(svg, path);

			if (!mounted) {
				dispose = listen_dev(div, "click", click_handler, false, false, false);
				mounted = true;
			}
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$7.name,
		type: "if",
		source: "(87:8) {#if !isDisabled && !multiFullItemClearable}",
		ctx
	});

	return block;
}

// (77:0) {#each value as item, i}
function create_each_block$4(ctx) {
	let div1;
	let div0;
	let raw_value = /*getSelectionLabel*/ ctx[4](/*item*/ ctx[9]) + "";
	let t0;
	let t1;
	let div1_class_value;
	let mounted;
	let dispose;
	let if_block = !/*isDisabled*/ ctx[2] && !/*multiFullItemClearable*/ ctx[3] && create_if_block$7(ctx);

	function click_handler_1(...args) {
		return /*click_handler_1*/ ctx[7](/*i*/ ctx[11], ...args);
	}

	const block = {
		c: function create() {
			div1 = element("div");
			div0 = element("div");
			t0 = space();
			if (if_block) if_block.c();
			t1 = space();
			attr_dev(div0, "class", "multiSelectItem_label svelte-liu9pa");
			add_location(div0, file$a, 83, 8, 2487);
			attr_dev(div1, "class", div1_class_value = "multiSelectItem " + (/*activeValue*/ ctx[1] === /*i*/ ctx[11] ? "active" : "") + " " + (/*isDisabled*/ ctx[2] ? "disabled" : "") + " svelte-liu9pa");
			add_location(div1, file$a, 77, 4, 2256);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);
			div0.innerHTML = raw_value;
			append_dev(div1, t0);
			if (if_block) if_block.m(div1, null);
			append_dev(div1, t1);

			if (!mounted) {
				dispose = listen_dev(div1, "click", click_handler_1, false, false, false);
				mounted = true;
			}
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;
			if (dirty & /*getSelectionLabel, value*/ 17 && raw_value !== (raw_value = /*getSelectionLabel*/ ctx[4](/*item*/ ctx[9]) + "")) div0.innerHTML = raw_value;
			if (!/*isDisabled*/ ctx[2] && !/*multiFullItemClearable*/ ctx[3]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$7(ctx);
					if_block.c();
					if_block.m(div1, t1);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*activeValue, isDisabled*/ 6 && div1_class_value !== (div1_class_value = "multiSelectItem " + (/*activeValue*/ ctx[1] === /*i*/ ctx[11] ? "active" : "") + " " + (/*isDisabled*/ ctx[2] ? "disabled" : "") + " svelte-liu9pa")) {
				attr_dev(div1, "class", div1_class_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
			if (if_block) if_block.d();
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$4.name,
		type: "each",
		source: "(77:0) {#each value as item, i}",
		ctx
	});

	return block;
}

function create_fragment$b(ctx) {
	let each_1_anchor;
	let each_value = /*value*/ ctx[0];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
	}

	const block = {
		c: function create() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert_dev(target, each_1_anchor, anchor);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*activeValue, isDisabled, multiFullItemClearable, handleClear, getSelectionLabel, value*/ 63) {
				each_value = /*value*/ ctx[0];
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$4(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$4(child_ctx);
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
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(each_1_anchor);
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

function instance$b($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("MultiSelection", slots, []);
	const dispatch = createEventDispatcher();
	let { value = [] } = $$props;
	let { activeValue = undefined } = $$props;
	let { isDisabled = false } = $$props;
	let { multiFullItemClearable = false } = $$props;
	let { getSelectionLabel = undefined } = $$props;

	function handleClear(i, event) {
		event.stopPropagation();
		dispatch("multiItemClear", { i });
	}

	const writable_props = [
		"value",
		"activeValue",
		"isDisabled",
		"multiFullItemClearable",
		"getSelectionLabel"
	];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MultiSelection> was created with unknown prop '${key}'`);
	});

	const click_handler = (i, event) => handleClear(i, event);
	const click_handler_1 = (i, event) => multiFullItemClearable ? handleClear(i, event) : {};

	$$self.$$set = $$props => {
		if ("value" in $$props) $$invalidate(0, value = $$props.value);
		if ("activeValue" in $$props) $$invalidate(1, activeValue = $$props.activeValue);
		if ("isDisabled" in $$props) $$invalidate(2, isDisabled = $$props.isDisabled);
		if ("multiFullItemClearable" in $$props) $$invalidate(3, multiFullItemClearable = $$props.multiFullItemClearable);
		if ("getSelectionLabel" in $$props) $$invalidate(4, getSelectionLabel = $$props.getSelectionLabel);
	};

	$$self.$capture_state = () => ({
		createEventDispatcher,
		dispatch,
		value,
		activeValue,
		isDisabled,
		multiFullItemClearable,
		getSelectionLabel,
		handleClear
	});

	$$self.$inject_state = $$props => {
		if ("value" in $$props) $$invalidate(0, value = $$props.value);
		if ("activeValue" in $$props) $$invalidate(1, activeValue = $$props.activeValue);
		if ("isDisabled" in $$props) $$invalidate(2, isDisabled = $$props.isDisabled);
		if ("multiFullItemClearable" in $$props) $$invalidate(3, multiFullItemClearable = $$props.multiFullItemClearable);
		if ("getSelectionLabel" in $$props) $$invalidate(4, getSelectionLabel = $$props.getSelectionLabel);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [
		value,
		activeValue,
		isDisabled,
		multiFullItemClearable,
		getSelectionLabel,
		handleClear,
		click_handler,
		click_handler_1
	];
}

class MultiSelection extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
			value: 0,
			activeValue: 1,
			isDisabled: 2,
			multiFullItemClearable: 3,
			getSelectionLabel: 4
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "MultiSelection",
			options,
			id: create_fragment$b.name
		});
	}

	get value() {
		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get activeValue() {
		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set activeValue(value) {
		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isDisabled() {
		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isDisabled(value) {
		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get multiFullItemClearable() {
		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set multiFullItemClearable(value) {
		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get getSelectionLabel() {
		throw new Error("<MultiSelection>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set getSelectionLabel(value) {
		throw new Error("<MultiSelection>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules\svelte-select\src\VirtualList.svelte generated by Svelte v3.35.0 */
const file$9 = "node_modules\\svelte-select\\src\\VirtualList.svelte";

function get_each_context$3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[23] = list[i];
	return child_ctx;
}

const get_default_slot_changes = dirty => ({
	item: dirty & /*visible*/ 32,
	i: dirty & /*visible*/ 32,
	hoverItemIndex: dirty & /*hoverItemIndex*/ 2
});

const get_default_slot_context = ctx => ({
	item: /*row*/ ctx[23].data,
	i: /*row*/ ctx[23].index,
	hoverItemIndex: /*hoverItemIndex*/ ctx[1]
});

// (154:69) Missing template
function fallback_block(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Missing template");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: fallback_block.name,
		type: "fallback",
		source: "(154:69) Missing template",
		ctx
	});

	return block;
}

// (152:8) {#each visible as row (row.index)}
function create_each_block$3(key_1, ctx) {
	let svelte_virtual_list_row;
	let t;
	let current;
	const default_slot_template = /*#slots*/ ctx[15].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], get_default_slot_context);
	const default_slot_or_fallback = default_slot || fallback_block(ctx);

	const block = {
		key: key_1,
		first: null,
		c: function create() {
			svelte_virtual_list_row = element("svelte-virtual-list-row");
			if (default_slot_or_fallback) default_slot_or_fallback.c();
			t = space();
			set_custom_element_data(svelte_virtual_list_row, "class", "svelte-g2cagw");
			add_location(svelte_virtual_list_row, file$9, 152, 12, 3778);
			this.first = svelte_virtual_list_row;
		},
		m: function mount(target, anchor) {
			insert_dev(target, svelte_virtual_list_row, anchor);

			if (default_slot_or_fallback) {
				default_slot_or_fallback.m(svelte_virtual_list_row, null);
			}

			append_dev(svelte_virtual_list_row, t);
			current = true;
		},
		p: function update(new_ctx, dirty) {
			ctx = new_ctx;

			if (default_slot) {
				if (default_slot.p && dirty & /*$$scope, visible, hoverItemIndex*/ 16418) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[14], dirty, get_default_slot_changes, get_default_slot_context);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot_or_fallback, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot_or_fallback, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(svelte_virtual_list_row);
			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$3.name,
		type: "each",
		source: "(152:8) {#each visible as row (row.index)}",
		ctx
	});

	return block;
}

function create_fragment$a(ctx) {
	let svelte_virtual_list_viewport;
	let svelte_virtual_list_contents;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let svelte_virtual_list_viewport_resize_listener;
	let current;
	let mounted;
	let dispose;
	let each_value = /*visible*/ ctx[5];
	validate_each_argument(each_value);
	const get_key = ctx => /*row*/ ctx[23].index;
	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$3(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
	}

	const block = {
		c: function create() {
			svelte_virtual_list_viewport = element("svelte-virtual-list-viewport");
			svelte_virtual_list_contents = element("svelte-virtual-list-contents");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[6] + "px");
			set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[7] + "px");
			set_custom_element_data(svelte_virtual_list_contents, "class", "svelte-g2cagw");
			add_location(svelte_virtual_list_contents, file$9, 148, 4, 3597);
			set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
			set_custom_element_data(svelte_virtual_list_viewport, "class", "svelte-g2cagw");
			add_render_callback(() => /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[18].call(svelte_virtual_list_viewport));
			add_location(svelte_virtual_list_viewport, file$9, 143, 0, 3437);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, svelte_virtual_list_viewport, anchor);
			append_dev(svelte_virtual_list_viewport, svelte_virtual_list_contents);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(svelte_virtual_list_contents, null);
			}

			/*svelte_virtual_list_contents_binding*/ ctx[16](svelte_virtual_list_contents);
			/*svelte_virtual_list_viewport_binding*/ ctx[17](svelte_virtual_list_viewport);
			svelte_virtual_list_viewport_resize_listener = add_resize_listener(svelte_virtual_list_viewport, /*svelte_virtual_list_viewport_elementresize_handler*/ ctx[18].bind(svelte_virtual_list_viewport));
			current = true;

			if (!mounted) {
				dispose = listen_dev(svelte_virtual_list_viewport, "scroll", /*handle_scroll*/ ctx[8], false, false, false);
				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*$$scope, visible, hoverItemIndex*/ 16418) {
				each_value = /*visible*/ ctx[5];
				validate_each_argument(each_value);
				group_outros();
				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, svelte_virtual_list_contents, outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
				check_outros();
			}

			if (!current || dirty & /*top*/ 64) {
				set_style(svelte_virtual_list_contents, "padding-top", /*top*/ ctx[6] + "px");
			}

			if (!current || dirty & /*bottom*/ 128) {
				set_style(svelte_virtual_list_contents, "padding-bottom", /*bottom*/ ctx[7] + "px");
			}

			if (!current || dirty & /*height*/ 1) {
				set_style(svelte_virtual_list_viewport, "height", /*height*/ ctx[0]);
			}
		},
		i: function intro(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o: function outro(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(svelte_virtual_list_viewport);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			/*svelte_virtual_list_contents_binding*/ ctx[16](null);
			/*svelte_virtual_list_viewport_binding*/ ctx[17](null);
			svelte_virtual_list_viewport_resize_listener();
			mounted = false;
			dispose();
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
	validate_slots("VirtualList", slots, ['default']);
	let { items = undefined } = $$props;
	let { height = "100%" } = $$props;
	let { itemHeight = 40 } = $$props;
	let { hoverItemIndex = 0 } = $$props;
	let { start = 0 } = $$props;
	let { end = 0 } = $$props;
	let height_map = [];
	let rows;
	let viewport;
	let contents;
	let viewport_height = 0;
	let visible;
	let mounted;
	let top = 0;
	let bottom = 0;
	let average_height;

	async function refresh(items, viewport_height, itemHeight) {
		const { scrollTop } = viewport;
		await tick();
		let content_height = top - scrollTop;
		let i = start;

		while (content_height < viewport_height && i < items.length) {
			let row = rows[i - start];

			if (!row) {
				$$invalidate(10, end = i + 1);
				await tick();
				row = rows[i - start];
			}

			const row_height = height_map[i] = itemHeight || row.offsetHeight;
			content_height += row_height;
			i += 1;
		}

		$$invalidate(10, end = i);
		const remaining = items.length - end;
		average_height = (top + content_height) / end;
		$$invalidate(7, bottom = remaining * average_height);
		height_map.length = items.length;
		if (viewport) $$invalidate(3, viewport.scrollTop = 0, viewport);
	}

	async function handle_scroll() {
		const { scrollTop } = viewport;
		const old_start = start;

		for (let v = 0; v < rows.length; v += 1) {
			height_map[start + v] = itemHeight || rows[v].offsetHeight;
		}

		let i = 0;
		let y = 0;

		while (i < items.length) {
			const row_height = height_map[i] || average_height;

			if (y + row_height > scrollTop) {
				$$invalidate(9, start = i);
				$$invalidate(6, top = y);
				break;
			}

			y += row_height;
			i += 1;
		}

		while (i < items.length) {
			y += height_map[i] || average_height;
			i += 1;
			if (y > scrollTop + viewport_height) break;
		}

		$$invalidate(10, end = i);
		const remaining = items.length - end;
		average_height = y / end;
		while (i < items.length) height_map[i++] = average_height;
		$$invalidate(7, bottom = remaining * average_height);

		if (start < old_start) {
			await tick();
			let expected_height = 0;
			let actual_height = 0;

			for (let i = start; i < old_start; i += 1) {
				if (rows[i - start]) {
					expected_height += height_map[i];
					actual_height += itemHeight || rows[i - start].offsetHeight;
				}
			}

			const d = actual_height - expected_height;
			viewport.scrollTo(0, scrollTop + d);
		}
	}

	onMount(() => {
		rows = contents.getElementsByTagName("svelte-virtual-list-row");
		$$invalidate(13, mounted = true);
	});

	const writable_props = ["items", "height", "itemHeight", "hoverItemIndex", "start", "end"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<VirtualList> was created with unknown prop '${key}'`);
	});

	function svelte_virtual_list_contents_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			contents = $$value;
			$$invalidate(4, contents);
		});
	}

	function svelte_virtual_list_viewport_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			viewport = $$value;
			$$invalidate(3, viewport);
		});
	}

	function svelte_virtual_list_viewport_elementresize_handler() {
		viewport_height = this.offsetHeight;
		$$invalidate(2, viewport_height);
	}

	$$self.$$set = $$props => {
		if ("items" in $$props) $$invalidate(11, items = $$props.items);
		if ("height" in $$props) $$invalidate(0, height = $$props.height);
		if ("itemHeight" in $$props) $$invalidate(12, itemHeight = $$props.itemHeight);
		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
		if ("start" in $$props) $$invalidate(9, start = $$props.start);
		if ("end" in $$props) $$invalidate(10, end = $$props.end);
		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		onMount,
		tick,
		items,
		height,
		itemHeight,
		hoverItemIndex,
		start,
		end,
		height_map,
		rows,
		viewport,
		contents,
		viewport_height,
		visible,
		mounted,
		top,
		bottom,
		average_height,
		refresh,
		handle_scroll
	});

	$$self.$inject_state = $$props => {
		if ("items" in $$props) $$invalidate(11, items = $$props.items);
		if ("height" in $$props) $$invalidate(0, height = $$props.height);
		if ("itemHeight" in $$props) $$invalidate(12, itemHeight = $$props.itemHeight);
		if ("hoverItemIndex" in $$props) $$invalidate(1, hoverItemIndex = $$props.hoverItemIndex);
		if ("start" in $$props) $$invalidate(9, start = $$props.start);
		if ("end" in $$props) $$invalidate(10, end = $$props.end);
		if ("height_map" in $$props) height_map = $$props.height_map;
		if ("rows" in $$props) rows = $$props.rows;
		if ("viewport" in $$props) $$invalidate(3, viewport = $$props.viewport);
		if ("contents" in $$props) $$invalidate(4, contents = $$props.contents);
		if ("viewport_height" in $$props) $$invalidate(2, viewport_height = $$props.viewport_height);
		if ("visible" in $$props) $$invalidate(5, visible = $$props.visible);
		if ("mounted" in $$props) $$invalidate(13, mounted = $$props.mounted);
		if ("top" in $$props) $$invalidate(6, top = $$props.top);
		if ("bottom" in $$props) $$invalidate(7, bottom = $$props.bottom);
		if ("average_height" in $$props) average_height = $$props.average_height;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*items, start, end*/ 3584) {
			$$invalidate(5, visible = items.slice(start, end).map((data, i) => {
				return { index: i + start, data };
			}));
		}

		if ($$self.$$.dirty & /*mounted, items, viewport_height, itemHeight*/ 14340) {
			if (mounted) refresh(items, viewport_height, itemHeight);
		}
	};

	return [
		height,
		hoverItemIndex,
		viewport_height,
		viewport,
		contents,
		visible,
		top,
		bottom,
		handle_scroll,
		start,
		end,
		items,
		itemHeight,
		mounted,
		$$scope,
		slots,
		svelte_virtual_list_contents_binding,
		svelte_virtual_list_viewport_binding,
		svelte_virtual_list_viewport_elementresize_handler
	];
}

class VirtualList extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
			items: 11,
			height: 0,
			itemHeight: 12,
			hoverItemIndex: 1,
			start: 9,
			end: 10
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "VirtualList",
			options,
			id: create_fragment$a.name
		});
	}

	get items() {
		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set items(value) {
		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get height() {
		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set height(value) {
		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get itemHeight() {
		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set itemHeight(value) {
		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get hoverItemIndex() {
		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set hoverItemIndex(value) {
		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get start() {
		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set start(value) {
		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get end() {
		throw new Error("<VirtualList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set end(value) {
		throw new Error("<VirtualList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules\svelte-select\src\ClearIcon.svelte generated by Svelte v3.35.0 */

const file$8 = "node_modules\\svelte-select\\src\\ClearIcon.svelte";

function create_fragment$9(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			attr_dev(path, "fill", "currentColor");
			attr_dev(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124\n    l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
			add_location(path, file$8, 8, 4, 141);
			attr_dev(svg, "width", "100%");
			attr_dev(svg, "height", "100%");
			attr_dev(svg, "viewBox", "-2 -2 50 50");
			attr_dev(svg, "focusable", "false");
			attr_dev(svg, "aria-hidden", "true");
			attr_dev(svg, "role", "presentation");
			add_location(svg, file$8, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		p: noop,
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
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

function instance$9($$self, $$props) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("ClearIcon", slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ClearIcon> was created with unknown prop '${key}'`);
	});

	return [];
}

class ClearIcon extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "ClearIcon",
			options,
			id: create_fragment$9.name
		});
	}
}

function debounce$2(func, wait, immediate) {
    let timeout;

    return function executedFunction() {
        let context = this;
        let args = arguments;

        let later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        let callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
}

/* node_modules\svelte-select\src\Select.svelte generated by Svelte v3.35.0 */

const { Object: Object_1$1, console: console_1$2 } = globals;
const file$7 = "node_modules\\svelte-select\\src\\Select.svelte";

function get_each_context$2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[103] = list[i];
	return child_ctx;
}

// (876:8) {#if isFocused}
function create_if_block_10(ctx) {
	let span0;
	let t0;
	let t1;
	let span1;
	let t2;

	const block = {
		c: function create() {
			span0 = element("span");
			t0 = text(/*ariaSelection*/ ctx[36]);
			t1 = space();
			span1 = element("span");
			t2 = text(/*ariaContext*/ ctx[37]);
			attr_dev(span0, "id", "aria-selection");
			add_location(span0, file$7, 876, 12, 23842);
			attr_dev(span1, "id", "aria-context");
			add_location(span1, file$7, 877, 12, 23903);
		},
		m: function mount(target, anchor) {
			insert_dev(target, span0, anchor);
			append_dev(span0, t0);
			insert_dev(target, t1, anchor);
			insert_dev(target, span1, anchor);
			append_dev(span1, t2);
		},
		p: function update(ctx, dirty) {
			if (dirty[1] & /*ariaSelection*/ 32) set_data_dev(t0, /*ariaSelection*/ ctx[36]);
			if (dirty[1] & /*ariaContext*/ 64) set_data_dev(t2, /*ariaContext*/ ctx[37]);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(span0);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(span1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_10.name,
		type: "if",
		source: "(876:8) {#if isFocused}",
		ctx
	});

	return block;
}

// (884:4) {#if Icon}
function create_if_block_9(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;
	const switch_instance_spread_levels = [/*iconProps*/ ctx[18]];
	var switch_value = /*Icon*/ ctx[17];

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return {
			props: switch_instance_props,
			$$inline: true
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props());
	}

	const block = {
		c: function create() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert_dev(target, switch_instance_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const switch_instance_changes = (dirty[0] & /*iconProps*/ 262144)
			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*iconProps*/ ctx[18])])
			: {};

			if (switch_value !== (switch_value = /*Icon*/ ctx[17])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i: function intro(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_9.name,
		type: "if",
		source: "(884:4) {#if Icon}",
		ctx
	});

	return block;
}

// (888:4) {#if showMultiSelect}
function create_if_block_8(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;
	var switch_value = /*MultiSelection*/ ctx[26];

	function switch_props(ctx) {
		return {
			props: {
				value: /*value*/ ctx[2],
				getSelectionLabel: /*getSelectionLabel*/ ctx[12],
				activeValue: /*activeValue*/ ctx[30],
				isDisabled: /*isDisabled*/ ctx[9],
				multiFullItemClearable: /*multiFullItemClearable*/ ctx[8]
			},
			$$inline: true
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props(ctx));
		switch_instance.$on("multiItemClear", /*handleMultiItemClear*/ ctx[38]);
		switch_instance.$on("focus", /*handleFocus*/ ctx[40]);
	}

	const block = {
		c: function create() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert_dev(target, switch_instance_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const switch_instance_changes = {};
			if (dirty[0] & /*value*/ 4) switch_instance_changes.value = /*value*/ ctx[2];
			if (dirty[0] & /*getSelectionLabel*/ 4096) switch_instance_changes.getSelectionLabel = /*getSelectionLabel*/ ctx[12];
			if (dirty[0] & /*activeValue*/ 1073741824) switch_instance_changes.activeValue = /*activeValue*/ ctx[30];
			if (dirty[0] & /*isDisabled*/ 512) switch_instance_changes.isDisabled = /*isDisabled*/ ctx[9];
			if (dirty[0] & /*multiFullItemClearable*/ 256) switch_instance_changes.multiFullItemClearable = /*multiFullItemClearable*/ ctx[8];

			if (switch_value !== (switch_value = /*MultiSelection*/ ctx[26])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					switch_instance.$on("multiItemClear", /*handleMultiItemClear*/ ctx[38]);
					switch_instance.$on("focus", /*handleFocus*/ ctx[40]);
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i: function intro(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_8.name,
		type: "if",
		source: "(888:4) {#if showMultiSelect}",
		ctx
	});

	return block;
}

// (910:4) {#if !isMulti && showSelectedItem}
function create_if_block_7(ctx) {
	let div;
	let switch_instance;
	let current;
	let mounted;
	let dispose;
	var switch_value = /*Selection*/ ctx[25];

	function switch_props(ctx) {
		return {
			props: {
				item: /*value*/ ctx[2],
				getSelectionLabel: /*getSelectionLabel*/ ctx[12]
			},
			$$inline: true
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props(ctx));
	}

	const block = {
		c: function create() {
			div = element("div");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			attr_dev(div, "class", "selectedItem svelte-17l1npl");
			add_location(div, file$7, 910, 8, 24725);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);

			if (switch_instance) {
				mount_component(switch_instance, div, null);
			}

			current = true;

			if (!mounted) {
				dispose = listen_dev(div, "focus", /*handleFocus*/ ctx[40], false, false, false);
				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			const switch_instance_changes = {};
			if (dirty[0] & /*value*/ 4) switch_instance_changes.item = /*value*/ ctx[2];
			if (dirty[0] & /*getSelectionLabel*/ 4096) switch_instance_changes.getSelectionLabel = /*getSelectionLabel*/ ctx[12];

			if (switch_value !== (switch_value = /*Selection*/ ctx[25])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div, null);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i: function intro(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (switch_instance) destroy_component(switch_instance);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_7.name,
		type: "if",
		source: "(910:4) {#if !isMulti && showSelectedItem}",
		ctx
	});

	return block;
}

// (919:4) {#if showClearIcon}
function create_if_block_6$1(ctx) {
	let div;
	let switch_instance;
	let current;
	let mounted;
	let dispose;
	var switch_value = /*ClearIcon*/ ctx[23];

	function switch_props(ctx) {
		return { $$inline: true };
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props());
	}

	const block = {
		c: function create() {
			div = element("div");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			attr_dev(div, "class", "clearSelect svelte-17l1npl");
			attr_dev(div, "aria-hidden", "true");
			add_location(div, file$7, 919, 8, 24964);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);

			if (switch_instance) {
				mount_component(switch_instance, div, null);
			}

			current = true;

			if (!mounted) {
				dispose = listen_dev(div, "click", prevent_default(/*handleClear*/ ctx[27]), false, true, false);
				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			if (switch_value !== (switch_value = /*ClearIcon*/ ctx[23])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div, null);
				} else {
					switch_instance = null;
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (switch_instance) destroy_component(switch_instance);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_6$1.name,
		type: "if",
		source: "(919:4) {#if showClearIcon}",
		ctx
	});

	return block;
}

// (928:4) {#if !showClearIcon && (showIndicator || (showChevron && !value) || (!isSearchable && !isDisabled && !isWaiting && ((showSelectedItem && !isClearable) || !showSelectedItem)))}
function create_if_block_4$1(ctx) {
	let div;

	function select_block_type(ctx, dirty) {
		if (/*indicatorSvg*/ ctx[22]) return create_if_block_5$1;
		return create_else_block;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	const block = {
		c: function create() {
			div = element("div");
			if_block.c();
			attr_dev(div, "class", "indicator svelte-17l1npl");
			attr_dev(div, "aria-hidden", "true");
			add_location(div, file$7, 928, 8, 25347);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			if_block.m(div, null);
		},
		p: function update(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(div, null);
				}
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if_block.d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_4$1.name,
		type: "if",
		source: "(928:4) {#if !showClearIcon && (showIndicator || (showChevron && !value) || (!isSearchable && !isDisabled && !isWaiting && ((showSelectedItem && !isClearable) || !showSelectedItem)))}",
		ctx
	});

	return block;
}

// (932:12) {:else}
function create_else_block(ctx) {
	let svg;
	let path;

	const block = {
		c: function create() {
			svg = svg_element("svg");
			path = svg_element("path");
			attr_dev(path, "d", "M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747\n          3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0\n          1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502\n          0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0\n          0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z");
			add_location(path, file$7, 938, 20, 25704);
			attr_dev(svg, "width", "100%");
			attr_dev(svg, "height", "100%");
			attr_dev(svg, "viewBox", "0 0 20 20");
			attr_dev(svg, "focusable", "false");
			attr_dev(svg, "aria-hidden", "true");
			attr_dev(svg, "class", "svelte-17l1npl");
			add_location(svg, file$7, 932, 16, 25494);
		},
		m: function mount(target, anchor) {
			insert_dev(target, svg, anchor);
			append_dev(svg, path);
		},
		p: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(svg);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block.name,
		type: "else",
		source: "(932:12) {:else}",
		ctx
	});

	return block;
}

// (930:12) {#if indicatorSvg}
function create_if_block_5$1(ctx) {
	let html_tag;
	let html_anchor;

	const block = {
		c: function create() {
			html_anchor = empty();
			html_tag = new HtmlTag(html_anchor);
		},
		m: function mount(target, anchor) {
			html_tag.m(/*indicatorSvg*/ ctx[22], target, anchor);
			insert_dev(target, html_anchor, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*indicatorSvg*/ 4194304) html_tag.p(/*indicatorSvg*/ ctx[22]);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(html_anchor);
			if (detaching) html_tag.d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_5$1.name,
		type: "if",
		source: "(930:12) {#if indicatorSvg}",
		ctx
	});

	return block;
}

// (950:4) {#if isWaiting}
function create_if_block_3$2(ctx) {
	let div;
	let svg;
	let circle;

	const block = {
		c: function create() {
			div = element("div");
			svg = svg_element("svg");
			circle = svg_element("circle");
			attr_dev(circle, "class", "spinner_path svelte-17l1npl");
			attr_dev(circle, "cx", "50");
			attr_dev(circle, "cy", "50");
			attr_dev(circle, "r", "20");
			attr_dev(circle, "fill", "none");
			attr_dev(circle, "stroke", "currentColor");
			attr_dev(circle, "stroke-width", "5");
			attr_dev(circle, "stroke-miterlimit", "10");
			add_location(circle, file$7, 952, 16, 26253);
			attr_dev(svg, "class", "spinner_icon svelte-17l1npl");
			attr_dev(svg, "viewBox", "25 25 50 50");
			add_location(svg, file$7, 951, 12, 26188);
			attr_dev(div, "class", "spinner svelte-17l1npl");
			add_location(div, file$7, 950, 8, 26154);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, svg);
			append_dev(svg, circle);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3$2.name,
		type: "if",
		source: "(950:4) {#if isWaiting}",
		ctx
	});

	return block;
}

// (966:4) {#if listOpen}
function create_if_block_2$3(ctx) {
	let switch_instance;
	let updating_hoverItemIndex;
	let switch_instance_anchor;
	let current;
	const switch_instance_spread_levels = [/*listProps*/ ctx[35]];

	function switch_instance_hoverItemIndex_binding(value) {
		/*switch_instance_hoverItemIndex_binding*/ ctx[84](value);
	}

	var switch_value = /*List*/ ctx[24];

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		if (/*hoverItemIndex*/ ctx[28] !== void 0) {
			switch_instance_props.hoverItemIndex = /*hoverItemIndex*/ ctx[28];
		}

		return {
			props: switch_instance_props,
			$$inline: true
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props(ctx));
		binding_callbacks.push(() => bind$1(switch_instance, "hoverItemIndex", switch_instance_hoverItemIndex_binding));
		switch_instance.$on("itemSelected", /*itemSelected*/ ctx[43]);
		switch_instance.$on("itemCreated", /*itemCreated*/ ctx[44]);
		switch_instance.$on("closeList", /*closeList*/ ctx[45]);
	}

	const block = {
		c: function create() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert_dev(target, switch_instance_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const switch_instance_changes = (dirty[1] & /*listProps*/ 16)
			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*listProps*/ ctx[35])])
			: {};

			if (!updating_hoverItemIndex && dirty[0] & /*hoverItemIndex*/ 268435456) {
				updating_hoverItemIndex = true;
				switch_instance_changes.hoverItemIndex = /*hoverItemIndex*/ ctx[28];
				add_flush_callback(() => updating_hoverItemIndex = false);
			}

			if (switch_value !== (switch_value = /*List*/ ctx[24])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					binding_callbacks.push(() => bind$1(switch_instance, "hoverItemIndex", switch_instance_hoverItemIndex_binding));
					switch_instance.$on("itemSelected", /*itemSelected*/ ctx[43]);
					switch_instance.$on("itemCreated", /*itemCreated*/ ctx[44]);
					switch_instance.$on("closeList", /*closeList*/ ctx[45]);
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i: function intro(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_2$3.name,
		type: "if",
		source: "(966:4) {#if listOpen}",
		ctx
	});

	return block;
}

// (976:4) {#if !isMulti || (isMulti && !showMultiSelect)}
function create_if_block_1$5(ctx) {
	let input_1;
	let input_1_name_value;
	let input_1_value_value;

	const block = {
		c: function create() {
			input_1 = element("input");
			attr_dev(input_1, "name", input_1_name_value = /*inputAttributes*/ ctx[16].name);
			attr_dev(input_1, "type", "hidden");

			input_1.value = input_1_value_value = /*value*/ ctx[2]
			? /*getSelectionLabel*/ ctx[12](/*value*/ ctx[2])
			: null;

			attr_dev(input_1, "class", "svelte-17l1npl");
			add_location(input_1, file$7, 976, 8, 26910);
		},
		m: function mount(target, anchor) {
			insert_dev(target, input_1, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*inputAttributes*/ 65536 && input_1_name_value !== (input_1_name_value = /*inputAttributes*/ ctx[16].name)) {
				attr_dev(input_1, "name", input_1_name_value);
			}

			if (dirty[0] & /*value, getSelectionLabel*/ 4100 && input_1_value_value !== (input_1_value_value = /*value*/ ctx[2]
			? /*getSelectionLabel*/ ctx[12](/*value*/ ctx[2])
			: null)) {
				prop_dev(input_1, "value", input_1_value_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(input_1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$5.name,
		type: "if",
		source: "(976:4) {#if !isMulti || (isMulti && !showMultiSelect)}",
		ctx
	});

	return block;
}

// (983:4) {#if isMulti && showMultiSelect}
function create_if_block$6(ctx) {
	let each_1_anchor;
	let each_value = /*value*/ ctx[2];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
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
			if (dirty[0] & /*inputAttributes, value, getSelectionLabel*/ 69636) {
				each_value = /*value*/ ctx[2];
				validate_each_argument(each_value);
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$2(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$2(child_ctx);
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
		id: create_if_block$6.name,
		type: "if",
		source: "(983:4) {#if isMulti && showMultiSelect}",
		ctx
	});

	return block;
}

// (984:8) {#each value as item}
function create_each_block$2(ctx) {
	let input_1;
	let input_1_name_value;
	let input_1_value_value;

	const block = {
		c: function create() {
			input_1 = element("input");
			attr_dev(input_1, "name", input_1_name_value = /*inputAttributes*/ ctx[16].name);
			attr_dev(input_1, "type", "hidden");

			input_1.value = input_1_value_value = /*item*/ ctx[103]
			? /*getSelectionLabel*/ ctx[12](/*item*/ ctx[103])
			: null;

			attr_dev(input_1, "class", "svelte-17l1npl");
			add_location(input_1, file$7, 984, 12, 27136);
		},
		m: function mount(target, anchor) {
			insert_dev(target, input_1, anchor);
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*inputAttributes*/ 65536 && input_1_name_value !== (input_1_name_value = /*inputAttributes*/ ctx[16].name)) {
				attr_dev(input_1, "name", input_1_name_value);
			}

			if (dirty[0] & /*value, getSelectionLabel*/ 4100 && input_1_value_value !== (input_1_value_value = /*item*/ ctx[103]
			? /*getSelectionLabel*/ ctx[12](/*item*/ ctx[103])
			: null)) {
				prop_dev(input_1, "value", input_1_value_value);
			}
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(input_1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_each_block$2.name,
		type: "each",
		source: "(984:8) {#each value as item}",
		ctx
	});

	return block;
}

function create_fragment$8(ctx) {
	let div;
	let span;
	let t0;
	let t1;
	let t2;
	let input_1;
	let input_1_readonly_value;
	let t3;
	let t4;
	let t5;
	let t6;
	let t7;
	let t8;
	let t9;
	let div_class_value;
	let current;
	let mounted;
	let dispose;
	let if_block0 = /*isFocused*/ ctx[1] && create_if_block_10(ctx);
	let if_block1 = /*Icon*/ ctx[17] && create_if_block_9(ctx);
	let if_block2 = /*showMultiSelect*/ ctx[34] && create_if_block_8(ctx);

	let input_1_levels = [
		{
			readOnly: input_1_readonly_value = !/*isSearchable*/ ctx[13]
		},
		/*_inputAttributes*/ ctx[31],
		{ placeholder: /*placeholderText*/ ctx[33] },
		{ style: /*inputStyles*/ ctx[14] },
		{ disabled: /*isDisabled*/ ctx[9] }
	];

	let input_1_data = {};

	for (let i = 0; i < input_1_levels.length; i += 1) {
		input_1_data = assign(input_1_data, input_1_levels[i]);
	}

	let if_block3 = !/*isMulti*/ ctx[7] && /*showSelectedItem*/ ctx[29] && create_if_block_7(ctx);
	let if_block4 = /*showClearIcon*/ ctx[32] && create_if_block_6$1(ctx);
	let if_block5 = !/*showClearIcon*/ ctx[32] && (/*showIndicator*/ ctx[20] || /*showChevron*/ ctx[19] && !/*value*/ ctx[2] || !/*isSearchable*/ ctx[13] && !/*isDisabled*/ ctx[9] && !/*isWaiting*/ ctx[4] && (/*showSelectedItem*/ ctx[29] && !/*isClearable*/ ctx[15] || !/*showSelectedItem*/ ctx[29])) && create_if_block_4$1(ctx);
	let if_block6 = /*isWaiting*/ ctx[4] && create_if_block_3$2(ctx);
	let if_block7 = /*listOpen*/ ctx[5] && create_if_block_2$3(ctx);
	let if_block8 = (!/*isMulti*/ ctx[7] || /*isMulti*/ ctx[7] && !/*showMultiSelect*/ ctx[34]) && create_if_block_1$5(ctx);
	let if_block9 = /*isMulti*/ ctx[7] && /*showMultiSelect*/ ctx[34] && create_if_block$6(ctx);

	const block = {
		c: function create() {
			div = element("div");
			span = element("span");
			if (if_block0) if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			if (if_block2) if_block2.c();
			t2 = space();
			input_1 = element("input");
			t3 = space();
			if (if_block3) if_block3.c();
			t4 = space();
			if (if_block4) if_block4.c();
			t5 = space();
			if (if_block5) if_block5.c();
			t6 = space();
			if (if_block6) if_block6.c();
			t7 = space();
			if (if_block7) if_block7.c();
			t8 = space();
			if (if_block8) if_block8.c();
			t9 = space();
			if (if_block9) if_block9.c();
			attr_dev(span, "aria-live", "polite");
			attr_dev(span, "aria-atomic", "false");
			attr_dev(span, "aria-relevant", "additions text");
			attr_dev(span, "class", "a11yText svelte-17l1npl");
			add_location(span, file$7, 870, 4, 23680);
			set_attributes(input_1, input_1_data);
			toggle_class(input_1, "svelte-17l1npl", true);
			add_location(input_1, file$7, 899, 4, 24419);
			attr_dev(div, "class", div_class_value = "selectContainer " + /*containerClasses*/ ctx[21] + " svelte-17l1npl");
			attr_dev(div, "style", /*containerStyles*/ ctx[11]);
			toggle_class(div, "hasError", /*hasError*/ ctx[10]);
			toggle_class(div, "multiSelect", /*isMulti*/ ctx[7]);
			toggle_class(div, "disabled", /*isDisabled*/ ctx[9]);
			toggle_class(div, "focused", /*isFocused*/ ctx[1]);
			add_location(div, file$7, 861, 0, 23429);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, span);
			if (if_block0) if_block0.m(span, null);
			append_dev(div, t0);
			if (if_block1) if_block1.m(div, null);
			append_dev(div, t1);
			if (if_block2) if_block2.m(div, null);
			append_dev(div, t2);
			append_dev(div, input_1);
			/*input_1_binding*/ ctx[82](input_1);
			set_input_value(input_1, /*filterText*/ ctx[3]);
			append_dev(div, t3);
			if (if_block3) if_block3.m(div, null);
			append_dev(div, t4);
			if (if_block4) if_block4.m(div, null);
			append_dev(div, t5);
			if (if_block5) if_block5.m(div, null);
			append_dev(div, t6);
			if (if_block6) if_block6.m(div, null);
			append_dev(div, t7);
			if (if_block7) if_block7.m(div, null);
			append_dev(div, t8);
			if (if_block8) if_block8.m(div, null);
			append_dev(div, t9);
			if (if_block9) if_block9.m(div, null);
			/*div_binding*/ ctx[85](div);
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(window, "click", /*handleWindowEvent*/ ctx[41], false, false, false),
					listen_dev(window, "focusin", /*handleWindowEvent*/ ctx[41], false, false, false),
					listen_dev(window, "keydown", /*handleKeyDown*/ ctx[39], false, false, false),
					listen_dev(input_1, "focus", /*handleFocus*/ ctx[40], false, false, false),
					listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[83]),
					listen_dev(div, "click", /*handleClick*/ ctx[42], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			if (/*isFocused*/ ctx[1]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_10(ctx);
					if_block0.c();
					if_block0.m(span, null);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*Icon*/ ctx[17]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty[0] & /*Icon*/ 131072) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_9(ctx);
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

			if (/*showMultiSelect*/ ctx[34]) {
				if (if_block2) {
					if_block2.p(ctx, dirty);

					if (dirty[1] & /*showMultiSelect*/ 8) {
						transition_in(if_block2, 1);
					}
				} else {
					if_block2 = create_if_block_8(ctx);
					if_block2.c();
					transition_in(if_block2, 1);
					if_block2.m(div, t2);
				}
			} else if (if_block2) {
				group_outros();

				transition_out(if_block2, 1, 1, () => {
					if_block2 = null;
				});

				check_outros();
			}

			set_attributes(input_1, input_1_data = get_spread_update(input_1_levels, [
				(!current || dirty[0] & /*isSearchable*/ 8192 && input_1_readonly_value !== (input_1_readonly_value = !/*isSearchable*/ ctx[13])) && { readOnly: input_1_readonly_value },
				dirty[1] & /*_inputAttributes*/ 1 && /*_inputAttributes*/ ctx[31],
				(!current || dirty[1] & /*placeholderText*/ 4) && { placeholder: /*placeholderText*/ ctx[33] },
				(!current || dirty[0] & /*inputStyles*/ 16384) && { style: /*inputStyles*/ ctx[14] },
				(!current || dirty[0] & /*isDisabled*/ 512) && { disabled: /*isDisabled*/ ctx[9] }
			]));

			if (dirty[0] & /*filterText*/ 8 && input_1.value !== /*filterText*/ ctx[3]) {
				set_input_value(input_1, /*filterText*/ ctx[3]);
			}

			toggle_class(input_1, "svelte-17l1npl", true);

			if (!/*isMulti*/ ctx[7] && /*showSelectedItem*/ ctx[29]) {
				if (if_block3) {
					if_block3.p(ctx, dirty);

					if (dirty[0] & /*isMulti, showSelectedItem*/ 536871040) {
						transition_in(if_block3, 1);
					}
				} else {
					if_block3 = create_if_block_7(ctx);
					if_block3.c();
					transition_in(if_block3, 1);
					if_block3.m(div, t4);
				}
			} else if (if_block3) {
				group_outros();

				transition_out(if_block3, 1, 1, () => {
					if_block3 = null;
				});

				check_outros();
			}

			if (/*showClearIcon*/ ctx[32]) {
				if (if_block4) {
					if_block4.p(ctx, dirty);

					if (dirty[1] & /*showClearIcon*/ 2) {
						transition_in(if_block4, 1);
					}
				} else {
					if_block4 = create_if_block_6$1(ctx);
					if_block4.c();
					transition_in(if_block4, 1);
					if_block4.m(div, t5);
				}
			} else if (if_block4) {
				group_outros();

				transition_out(if_block4, 1, 1, () => {
					if_block4 = null;
				});

				check_outros();
			}

			if (!/*showClearIcon*/ ctx[32] && (/*showIndicator*/ ctx[20] || /*showChevron*/ ctx[19] && !/*value*/ ctx[2] || !/*isSearchable*/ ctx[13] && !/*isDisabled*/ ctx[9] && !/*isWaiting*/ ctx[4] && (/*showSelectedItem*/ ctx[29] && !/*isClearable*/ ctx[15] || !/*showSelectedItem*/ ctx[29]))) {
				if (if_block5) {
					if_block5.p(ctx, dirty);
				} else {
					if_block5 = create_if_block_4$1(ctx);
					if_block5.c();
					if_block5.m(div, t6);
				}
			} else if (if_block5) {
				if_block5.d(1);
				if_block5 = null;
			}

			if (/*isWaiting*/ ctx[4]) {
				if (if_block6) ; else {
					if_block6 = create_if_block_3$2(ctx);
					if_block6.c();
					if_block6.m(div, t7);
				}
			} else if (if_block6) {
				if_block6.d(1);
				if_block6 = null;
			}

			if (/*listOpen*/ ctx[5]) {
				if (if_block7) {
					if_block7.p(ctx, dirty);

					if (dirty[0] & /*listOpen*/ 32) {
						transition_in(if_block7, 1);
					}
				} else {
					if_block7 = create_if_block_2$3(ctx);
					if_block7.c();
					transition_in(if_block7, 1);
					if_block7.m(div, t8);
				}
			} else if (if_block7) {
				group_outros();

				transition_out(if_block7, 1, 1, () => {
					if_block7 = null;
				});

				check_outros();
			}

			if (!/*isMulti*/ ctx[7] || /*isMulti*/ ctx[7] && !/*showMultiSelect*/ ctx[34]) {
				if (if_block8) {
					if_block8.p(ctx, dirty);
				} else {
					if_block8 = create_if_block_1$5(ctx);
					if_block8.c();
					if_block8.m(div, t9);
				}
			} else if (if_block8) {
				if_block8.d(1);
				if_block8 = null;
			}

			if (/*isMulti*/ ctx[7] && /*showMultiSelect*/ ctx[34]) {
				if (if_block9) {
					if_block9.p(ctx, dirty);
				} else {
					if_block9 = create_if_block$6(ctx);
					if_block9.c();
					if_block9.m(div, null);
				}
			} else if (if_block9) {
				if_block9.d(1);
				if_block9 = null;
			}

			if (!current || dirty[0] & /*containerClasses*/ 2097152 && div_class_value !== (div_class_value = "selectContainer " + /*containerClasses*/ ctx[21] + " svelte-17l1npl")) {
				attr_dev(div, "class", div_class_value);
			}

			if (!current || dirty[0] & /*containerStyles*/ 2048) {
				attr_dev(div, "style", /*containerStyles*/ ctx[11]);
			}

			if (dirty[0] & /*containerClasses, hasError*/ 2098176) {
				toggle_class(div, "hasError", /*hasError*/ ctx[10]);
			}

			if (dirty[0] & /*containerClasses, isMulti*/ 2097280) {
				toggle_class(div, "multiSelect", /*isMulti*/ ctx[7]);
			}

			if (dirty[0] & /*containerClasses, isDisabled*/ 2097664) {
				toggle_class(div, "disabled", /*isDisabled*/ ctx[9]);
			}

			if (dirty[0] & /*containerClasses, isFocused*/ 2097154) {
				toggle_class(div, "focused", /*isFocused*/ ctx[1]);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block1);
			transition_in(if_block2);
			transition_in(if_block3);
			transition_in(if_block4);
			transition_in(if_block7);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block1);
			transition_out(if_block2);
			transition_out(if_block3);
			transition_out(if_block4);
			transition_out(if_block7);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			/*input_1_binding*/ ctx[82](null);
			if (if_block3) if_block3.d();
			if (if_block4) if_block4.d();
			if (if_block5) if_block5.d();
			if (if_block6) if_block6.d();
			if (if_block7) if_block7.d();
			if (if_block8) if_block8.d();
			if (if_block9) if_block9.d();
			/*div_binding*/ ctx[85](null);
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

function convertStringItemsToObjects(_items) {
	return _items.map((item, index) => {
		return { index, value: item, label: `${item}` };
	});
}

function instance$8($$self, $$props, $$invalidate) {
	let filteredItems;
	let showSelectedItem;
	let showClearIcon;
	let placeholderText;
	let showMultiSelect;
	let listProps;
	let ariaSelection;
	let ariaContext;
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Select", slots, []);
	const dispatch = createEventDispatcher();
	let { id = null } = $$props;
	let { container = undefined } = $$props;
	let { input = undefined } = $$props;
	let { isMulti = false } = $$props;
	let { multiFullItemClearable = false } = $$props;
	let { isDisabled = false } = $$props;
	let { isCreatable = false } = $$props;
	let { isFocused = false } = $$props;
	let { value = null } = $$props;
	let { filterText = "" } = $$props;
	let { placeholder = "Select..." } = $$props;
	let { placeholderAlwaysShow = false } = $$props;
	let { items = null } = $$props;
	let { itemFilter = (label, filterText, option) => `${label}`.toLowerCase().includes(filterText.toLowerCase()) } = $$props;
	let { groupBy = undefined } = $$props;
	let { groupFilter = groups => groups } = $$props;
	let { isGroupHeaderSelectable = false } = $$props;

	let { getGroupHeaderLabel = option => {
		return option[labelIdentifier] || option.id;
	} } = $$props;

	let { labelIdentifier = "label" } = $$props;

	let { getOptionLabel = (option, filterText) => {
		return option.isCreator
		? `Create \"${filterText}\"`
		: option[labelIdentifier];
	} } = $$props;

	let { optionIdentifier = "value" } = $$props;
	let { loadOptions = undefined } = $$props;
	let { hasError = false } = $$props;
	let { containerStyles = "" } = $$props;

	let { getSelectionLabel = option => {
		if (option) return option[labelIdentifier]; else return null;
	} } = $$props;

	let { createGroupHeaderItem = groupValue => {
		return { value: groupValue, label: groupValue };
	} } = $$props;

	let { createItem = filterText => {
		return { value: filterText, label: filterText };
	} } = $$props;

	const getFilteredItems = () => {
		return filteredItems;
	};

	let { isSearchable = true } = $$props;
	let { inputStyles = "" } = $$props;
	let { isClearable = true } = $$props;
	let { isWaiting = false } = $$props;
	let { listPlacement = "auto" } = $$props;
	let { listOpen = false } = $$props;
	let { isVirtualList = false } = $$props;
	let { loadOptionsInterval = 300 } = $$props;
	let { noOptionsMessage = "No options" } = $$props;
	let { hideEmptyState = false } = $$props;
	let { inputAttributes = {} } = $$props;
	let { listAutoWidth = true } = $$props;
	let { itemHeight = 40 } = $$props;
	let { Icon = undefined } = $$props;
	let { iconProps = {} } = $$props;
	let { showChevron = false } = $$props;
	let { showIndicator = false } = $$props;
	let { containerClasses = "" } = $$props;
	let { indicatorSvg = undefined } = $$props;
	let { listOffset = 5 } = $$props;
	let { ClearIcon: ClearIcon$1 = ClearIcon } = $$props;
	let { Item: Item$1 = Item } = $$props;
	let { List: List$1 = List } = $$props;
	let { Selection = Selection$1 } = $$props;
	let { MultiSelection: MultiSelection$1 = MultiSelection } = $$props;
	let { VirtualList: VirtualList$1 = VirtualList } = $$props;

	function filterMethod(args) {
		if (args.loadOptions && args.filterText.length > 0) return;
		if (!args.items) return [];

		if (args.items && args.items.length > 0 && typeof args.items[0] !== "object") {
			args.items = convertStringItemsToObjects(args.items);
		}

		let filterResults = args.items.filter(item => {
			let matchesFilter = itemFilter(getOptionLabel(item, args.filterText), args.filterText, item);

			if (matchesFilter && args.isMulti && args.value && Array.isArray(args.value)) {
				matchesFilter = !args.value.some(x => {
					return x[args.optionIdentifier] === item[args.optionIdentifier];
				});
			}

			return matchesFilter;
		});

		if (args.groupBy) {
			filterResults = filterGroupedItems(filterResults);
		}

		if (args.isCreatable) {
			filterResults = addCreatableItem(filterResults, args.filterText);
		}

		return filterResults;
	}

	function addCreatableItem(_items, _filterText) {
		if (_filterText.length === 0) return _items;
		const itemToCreate = createItem(_filterText);
		if (_items[0] && _filterText === _items[0][labelIdentifier]) return _items;
		itemToCreate.isCreator = true;
		return [..._items, itemToCreate];
	}

	let { selectedValue = null } = $$props;
	let activeValue;
	let prev_value;
	let prev_filterText;
	let prev_isFocused;
	let prev_isMulti;
	let hoverItemIndex;

	const getItems = debounce$2(
		async () => {
			$$invalidate(4, isWaiting = true);

			let res = await loadOptions(filterText).catch(err => {
				console.warn("svelte-select loadOptions error :>> ", err);
				dispatch("error", { type: "loadOptions", details: err });
			});

			if (res && !res.cancelled) {
				if (res) {
					if (res && res.length > 0 && typeof res[0] !== "object") {
						res = convertStringItemsToObjects(res);
					}

					$$invalidate(81, filteredItems = [...res]);
					dispatch("loaded", { items: filteredItems });
				} else {
					$$invalidate(81, filteredItems = []);
				}

				if (isCreatable) {
					$$invalidate(81, filteredItems = addCreatableItem(filteredItems, filterText));
				}

				$$invalidate(4, isWaiting = false);
				$$invalidate(1, isFocused = true);
				$$invalidate(5, listOpen = true);
			}
		},
		loadOptionsInterval
	);

	function setValue() {
		if (typeof value === "string") {
			$$invalidate(2, value = { [optionIdentifier]: value, label: value });
		} else if (isMulti && Array.isArray(value) && value.length > 0) {
			$$invalidate(2, value = value.map(item => typeof item === "string"
			? { value: item, label: item }
			: item));
		}
	}

	let _inputAttributes;

	function assignInputAttributes() {
		$$invalidate(31, _inputAttributes = Object.assign(
			{
				autocapitalize: "none",
				autocomplete: "off",
				autocorrect: "off",
				spellcheck: false,
				tabindex: 0,
				type: "text",
				"aria-autocomplete": "list"
			},
			inputAttributes
		));

		if (id) {
			$$invalidate(31, _inputAttributes.id = id, _inputAttributes);
		}

		if (!isSearchable) {
			$$invalidate(31, _inputAttributes.readonly = true, _inputAttributes);
		}
	}

	function filterGroupedItems(_items) {
		const groupValues = [];
		const groups = {};

		_items.forEach(item => {
			const groupValue = groupBy(item);

			if (!groupValues.includes(groupValue)) {
				groupValues.push(groupValue);
				groups[groupValue] = [];

				if (groupValue) {
					groups[groupValue].push(Object.assign(createGroupHeaderItem(groupValue, item), {
						id: groupValue,
						isGroupHeader: true,
						isSelectable: isGroupHeaderSelectable
					}));
				}
			}

			groups[groupValue].push(Object.assign({ isGroupItem: !!groupValue }, item));
		});

		const sortedGroupedItems = [];

		groupFilter(groupValues).forEach(groupValue => {
			sortedGroupedItems.push(...groups[groupValue]);
		});

		return sortedGroupedItems;
	}

	function dispatchSelectedItem() {
		if (isMulti) {
			if (JSON.stringify(value) !== JSON.stringify(prev_value)) {
				if (checkValueForDuplicates()) {
					dispatch("select", value);
				}
			}

			return;
		}

		if (!prev_value || JSON.stringify(value[optionIdentifier]) !== JSON.stringify(prev_value[optionIdentifier])) {
			dispatch("select", value);
		}
	}

	function setupFocus() {
		if (isFocused || listOpen) {
			handleFocus();
		} else {
			if (input) input.blur();
		}
	}

	function setupMulti() {
		if (value) {
			if (Array.isArray(value)) {
				$$invalidate(2, value = [...value]);
			} else {
				$$invalidate(2, value = [value]);
			}
		}
	}

	function setupSingle() {
		if (value) $$invalidate(2, value = null);
	}

	function setupFilterText() {
		if (filterText.length === 0) return;
		$$invalidate(1, isFocused = true);
		$$invalidate(5, listOpen = true);

		if (loadOptions) {
			getItems();
		} else {
			$$invalidate(5, listOpen = true);

			if (isMulti) {
				$$invalidate(30, activeValue = undefined);
			}
		}
	}

	beforeUpdate(async () => {
		$$invalidate(77, prev_value = value);
		$$invalidate(78, prev_filterText = filterText);
		$$invalidate(79, prev_isFocused = isFocused);
		$$invalidate(80, prev_isMulti = isMulti);
	});

	function checkValueForDuplicates() {
		let noDuplicates = true;

		if (value) {
			const ids = [];
			const uniqueValues = [];

			value.forEach(val => {
				if (!ids.includes(val[optionIdentifier])) {
					ids.push(val[optionIdentifier]);
					uniqueValues.push(val);
				} else {
					noDuplicates = false;
				}
			});

			if (!noDuplicates) $$invalidate(2, value = uniqueValues);
		}

		return noDuplicates;
	}

	function findItem(selection) {
		let matchTo = selection
		? selection[optionIdentifier]
		: value[optionIdentifier];

		return items.find(item => item[optionIdentifier] === matchTo);
	}

	function updateValueDisplay(items) {
		if (!items || items.length === 0 || items.some(item => typeof item !== "object")) return;

		if (!value || (isMulti
		? value.some(selection => !selection || !selection[optionIdentifier])
		: !value[optionIdentifier])) return;

		if (Array.isArray(value)) {
			$$invalidate(2, value = value.map(selection => findItem(selection) || selection));
		} else {
			$$invalidate(2, value = findItem() || value);
		}
	}

	function handleMultiItemClear(event) {
		const { detail } = event;
		const itemToRemove = value[detail ? detail.i : value.length - 1];

		if (value.length === 1) {
			$$invalidate(2, value = undefined);
		} else {
			$$invalidate(2, value = value.filter(item => {
				return item !== itemToRemove;
			}));
		}

		dispatch("clear", itemToRemove);
	}

	function handleKeyDown(e) {
		if (!isFocused) return;

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				$$invalidate(5, listOpen = true);
				$$invalidate(30, activeValue = undefined);
				break;
			case "ArrowUp":
				e.preventDefault();
				$$invalidate(5, listOpen = true);
				$$invalidate(30, activeValue = undefined);
				break;
			case "Tab":
				if (!listOpen) $$invalidate(1, isFocused = false);
				break;
			case "Backspace":
				if (!isMulti || filterText.length > 0) return;
				if (isMulti && value && value.length > 0) {
					handleMultiItemClear(activeValue !== undefined
					? activeValue
					: value.length - 1);

					if (activeValue === 0 || activeValue === undefined) break;
					$$invalidate(30, activeValue = value.length > activeValue ? activeValue - 1 : undefined);
				}
				break;
			case "ArrowLeft":
				if (!isMulti || filterText.length > 0) return;
				if (activeValue === undefined) {
					$$invalidate(30, activeValue = value.length - 1);
				} else if (value.length > activeValue && activeValue !== 0) {
					$$invalidate(30, activeValue -= 1);
				}
				break;
			case "ArrowRight":
				if (!isMulti || filterText.length > 0 || activeValue === undefined) return;
				if (activeValue === value.length - 1) {
					$$invalidate(30, activeValue = undefined);
				} else if (activeValue < value.length - 1) {
					$$invalidate(30, activeValue += 1);
				}
				break;
		}
	}

	function handleFocus() {
		$$invalidate(1, isFocused = true);
		if (input) input.focus();
	}

	function handleWindowEvent(event) {
		if (!container) return;

		const eventTarget = event.path && event.path.length > 0
		? event.path[0]
		: event.target;

		if (container.contains(eventTarget) || container.contains(event.relatedTarget)) {
			return;
		}

		$$invalidate(1, isFocused = false);
		$$invalidate(5, listOpen = false);
		$$invalidate(30, activeValue = undefined);
		if (input) input.blur();
	}

	function handleClick() {
		if (isDisabled) return;
		$$invalidate(1, isFocused = true);
		$$invalidate(5, listOpen = !listOpen);
	}

	function handleClear() {
		$$invalidate(2, value = undefined);
		$$invalidate(5, listOpen = false);
		dispatch("clear", value);
		handleFocus();
	}

	onMount(() => {
		if (isFocused && input) input.focus();
	});

	function itemSelected(event) {
		const { detail } = event;

		if (detail) {
			$$invalidate(3, filterText = "");
			const item = Object.assign({}, detail);

			if (!item.isGroupHeader || item.isSelectable) {
				if (isMulti) {
					$$invalidate(2, value = value ? value.concat([item]) : [item]);
				} else {
					$$invalidate(2, value = item);
				}

				$$invalidate(2, value);

				setTimeout(() => {
					$$invalidate(5, listOpen = false);
					$$invalidate(30, activeValue = undefined);
				});
			}
		}
	}

	function itemCreated(event) {
		const { detail } = event;

		if (isMulti) {
			$$invalidate(2, value = value || []);
			$$invalidate(2, value = [...value, createItem(detail)]);
		} else {
			$$invalidate(2, value = createItem(detail));
		}

		dispatch("itemCreated", detail);
		$$invalidate(3, filterText = "");
		$$invalidate(5, listOpen = false);
		$$invalidate(30, activeValue = undefined);
	}

	function closeList() {
		$$invalidate(3, filterText = "");
		$$invalidate(5, listOpen = false);
	}

	let { ariaValues = values => {
		return `Option ${values}, selected.`;
	} } = $$props;

	let { ariaListOpen = (label, count) => {
		return `You are currently focused on option ${label}. There are ${count} results available.`;
	} } = $$props;

	let { ariaFocused = () => {
		return `Select is focused, type to refine list, press down to open the menu.`;
	} } = $$props;

	function handleAriaSelection() {
		let selected = undefined;

		if (isMulti && value.length > 0) {
			selected = value.map(v => getSelectionLabel(v)).join(", ");
		} else {
			selected = getSelectionLabel(value);
		}

		return ariaValues(selected);
	}

	function handleAriaContent() {
		if (!isFocused || !filteredItems || filteredItems.length === 0) return "";
		let _item = filteredItems[hoverItemIndex];

		if (listOpen && _item) {
			let label = getSelectionLabel(_item);
			let count = filteredItems ? filteredItems.length : 0;
			return ariaListOpen(label, count);
		} else {
			return ariaFocused();
		}
	}

	const writable_props = [
		"id",
		"container",
		"input",
		"isMulti",
		"multiFullItemClearable",
		"isDisabled",
		"isCreatable",
		"isFocused",
		"value",
		"filterText",
		"placeholder",
		"placeholderAlwaysShow",
		"items",
		"itemFilter",
		"groupBy",
		"groupFilter",
		"isGroupHeaderSelectable",
		"getGroupHeaderLabel",
		"labelIdentifier",
		"getOptionLabel",
		"optionIdentifier",
		"loadOptions",
		"hasError",
		"containerStyles",
		"getSelectionLabel",
		"createGroupHeaderItem",
		"createItem",
		"isSearchable",
		"inputStyles",
		"isClearable",
		"isWaiting",
		"listPlacement",
		"listOpen",
		"isVirtualList",
		"loadOptionsInterval",
		"noOptionsMessage",
		"hideEmptyState",
		"inputAttributes",
		"listAutoWidth",
		"itemHeight",
		"Icon",
		"iconProps",
		"showChevron",
		"showIndicator",
		"containerClasses",
		"indicatorSvg",
		"listOffset",
		"ClearIcon",
		"Item",
		"List",
		"Selection",
		"MultiSelection",
		"VirtualList",
		"selectedValue",
		"ariaValues",
		"ariaListOpen",
		"ariaFocused"
	];

	Object_1$1.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Select> was created with unknown prop '${key}'`);
	});

	function input_1_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			input = $$value;
			$$invalidate(6, input);
		});
	}

	function input_1_input_handler() {
		filterText = this.value;
		$$invalidate(3, filterText);
	}

	function switch_instance_hoverItemIndex_binding(value) {
		hoverItemIndex = value;
		$$invalidate(28, hoverItemIndex);
	}

	function div_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			container = $$value;
			$$invalidate(0, container);
		});
	}

	$$self.$$set = $$props => {
		if ("id" in $$props) $$invalidate(46, id = $$props.id);
		if ("container" in $$props) $$invalidate(0, container = $$props.container);
		if ("input" in $$props) $$invalidate(6, input = $$props.input);
		if ("isMulti" in $$props) $$invalidate(7, isMulti = $$props.isMulti);
		if ("multiFullItemClearable" in $$props) $$invalidate(8, multiFullItemClearable = $$props.multiFullItemClearable);
		if ("isDisabled" in $$props) $$invalidate(9, isDisabled = $$props.isDisabled);
		if ("isCreatable" in $$props) $$invalidate(47, isCreatable = $$props.isCreatable);
		if ("isFocused" in $$props) $$invalidate(1, isFocused = $$props.isFocused);
		if ("value" in $$props) $$invalidate(2, value = $$props.value);
		if ("filterText" in $$props) $$invalidate(3, filterText = $$props.filterText);
		if ("placeholder" in $$props) $$invalidate(48, placeholder = $$props.placeholder);
		if ("placeholderAlwaysShow" in $$props) $$invalidate(49, placeholderAlwaysShow = $$props.placeholderAlwaysShow);
		if ("items" in $$props) $$invalidate(50, items = $$props.items);
		if ("itemFilter" in $$props) $$invalidate(51, itemFilter = $$props.itemFilter);
		if ("groupBy" in $$props) $$invalidate(52, groupBy = $$props.groupBy);
		if ("groupFilter" in $$props) $$invalidate(53, groupFilter = $$props.groupFilter);
		if ("isGroupHeaderSelectable" in $$props) $$invalidate(54, isGroupHeaderSelectable = $$props.isGroupHeaderSelectable);
		if ("getGroupHeaderLabel" in $$props) $$invalidate(55, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
		if ("labelIdentifier" in $$props) $$invalidate(56, labelIdentifier = $$props.labelIdentifier);
		if ("getOptionLabel" in $$props) $$invalidate(57, getOptionLabel = $$props.getOptionLabel);
		if ("optionIdentifier" in $$props) $$invalidate(58, optionIdentifier = $$props.optionIdentifier);
		if ("loadOptions" in $$props) $$invalidate(59, loadOptions = $$props.loadOptions);
		if ("hasError" in $$props) $$invalidate(10, hasError = $$props.hasError);
		if ("containerStyles" in $$props) $$invalidate(11, containerStyles = $$props.containerStyles);
		if ("getSelectionLabel" in $$props) $$invalidate(12, getSelectionLabel = $$props.getSelectionLabel);
		if ("createGroupHeaderItem" in $$props) $$invalidate(60, createGroupHeaderItem = $$props.createGroupHeaderItem);
		if ("createItem" in $$props) $$invalidate(61, createItem = $$props.createItem);
		if ("isSearchable" in $$props) $$invalidate(13, isSearchable = $$props.isSearchable);
		if ("inputStyles" in $$props) $$invalidate(14, inputStyles = $$props.inputStyles);
		if ("isClearable" in $$props) $$invalidate(15, isClearable = $$props.isClearable);
		if ("isWaiting" in $$props) $$invalidate(4, isWaiting = $$props.isWaiting);
		if ("listPlacement" in $$props) $$invalidate(63, listPlacement = $$props.listPlacement);
		if ("listOpen" in $$props) $$invalidate(5, listOpen = $$props.listOpen);
		if ("isVirtualList" in $$props) $$invalidate(64, isVirtualList = $$props.isVirtualList);
		if ("loadOptionsInterval" in $$props) $$invalidate(65, loadOptionsInterval = $$props.loadOptionsInterval);
		if ("noOptionsMessage" in $$props) $$invalidate(66, noOptionsMessage = $$props.noOptionsMessage);
		if ("hideEmptyState" in $$props) $$invalidate(67, hideEmptyState = $$props.hideEmptyState);
		if ("inputAttributes" in $$props) $$invalidate(16, inputAttributes = $$props.inputAttributes);
		if ("listAutoWidth" in $$props) $$invalidate(68, listAutoWidth = $$props.listAutoWidth);
		if ("itemHeight" in $$props) $$invalidate(69, itemHeight = $$props.itemHeight);
		if ("Icon" in $$props) $$invalidate(17, Icon = $$props.Icon);
		if ("iconProps" in $$props) $$invalidate(18, iconProps = $$props.iconProps);
		if ("showChevron" in $$props) $$invalidate(19, showChevron = $$props.showChevron);
		if ("showIndicator" in $$props) $$invalidate(20, showIndicator = $$props.showIndicator);
		if ("containerClasses" in $$props) $$invalidate(21, containerClasses = $$props.containerClasses);
		if ("indicatorSvg" in $$props) $$invalidate(22, indicatorSvg = $$props.indicatorSvg);
		if ("listOffset" in $$props) $$invalidate(70, listOffset = $$props.listOffset);
		if ("ClearIcon" in $$props) $$invalidate(23, ClearIcon$1 = $$props.ClearIcon);
		if ("Item" in $$props) $$invalidate(71, Item$1 = $$props.Item);
		if ("List" in $$props) $$invalidate(24, List$1 = $$props.List);
		if ("Selection" in $$props) $$invalidate(25, Selection = $$props.Selection);
		if ("MultiSelection" in $$props) $$invalidate(26, MultiSelection$1 = $$props.MultiSelection);
		if ("VirtualList" in $$props) $$invalidate(72, VirtualList$1 = $$props.VirtualList);
		if ("selectedValue" in $$props) $$invalidate(73, selectedValue = $$props.selectedValue);
		if ("ariaValues" in $$props) $$invalidate(74, ariaValues = $$props.ariaValues);
		if ("ariaListOpen" in $$props) $$invalidate(75, ariaListOpen = $$props.ariaListOpen);
		if ("ariaFocused" in $$props) $$invalidate(76, ariaFocused = $$props.ariaFocused);
	};

	$$self.$capture_state = () => ({
		beforeUpdate,
		createEventDispatcher,
		onMount,
		_List: List,
		_Item: Item,
		_Selection: Selection$1,
		_MultiSelection: MultiSelection,
		_VirtualList: VirtualList,
		_ClearIcon: ClearIcon,
		debounce: debounce$2,
		dispatch,
		id,
		container,
		input,
		isMulti,
		multiFullItemClearable,
		isDisabled,
		isCreatable,
		isFocused,
		value,
		filterText,
		placeholder,
		placeholderAlwaysShow,
		items,
		itemFilter,
		groupBy,
		groupFilter,
		isGroupHeaderSelectable,
		getGroupHeaderLabel,
		labelIdentifier,
		getOptionLabel,
		optionIdentifier,
		loadOptions,
		hasError,
		containerStyles,
		getSelectionLabel,
		createGroupHeaderItem,
		createItem,
		getFilteredItems,
		isSearchable,
		inputStyles,
		isClearable,
		isWaiting,
		listPlacement,
		listOpen,
		isVirtualList,
		loadOptionsInterval,
		noOptionsMessage,
		hideEmptyState,
		inputAttributes,
		listAutoWidth,
		itemHeight,
		Icon,
		iconProps,
		showChevron,
		showIndicator,
		containerClasses,
		indicatorSvg,
		listOffset,
		ClearIcon: ClearIcon$1,
		Item: Item$1,
		List: List$1,
		Selection,
		MultiSelection: MultiSelection$1,
		VirtualList: VirtualList$1,
		filterMethod,
		addCreatableItem,
		selectedValue,
		activeValue,
		prev_value,
		prev_filterText,
		prev_isFocused,
		prev_isMulti,
		hoverItemIndex,
		getItems,
		setValue,
		_inputAttributes,
		assignInputAttributes,
		convertStringItemsToObjects,
		filterGroupedItems,
		dispatchSelectedItem,
		setupFocus,
		setupMulti,
		setupSingle,
		setupFilterText,
		checkValueForDuplicates,
		findItem,
		updateValueDisplay,
		handleMultiItemClear,
		handleKeyDown,
		handleFocus,
		handleWindowEvent,
		handleClick,
		handleClear,
		itemSelected,
		itemCreated,
		closeList,
		ariaValues,
		ariaListOpen,
		ariaFocused,
		handleAriaSelection,
		handleAriaContent,
		filteredItems,
		showSelectedItem,
		showClearIcon,
		placeholderText,
		showMultiSelect,
		listProps,
		ariaSelection,
		ariaContext
	});

	$$self.$inject_state = $$props => {
		if ("id" in $$props) $$invalidate(46, id = $$props.id);
		if ("container" in $$props) $$invalidate(0, container = $$props.container);
		if ("input" in $$props) $$invalidate(6, input = $$props.input);
		if ("isMulti" in $$props) $$invalidate(7, isMulti = $$props.isMulti);
		if ("multiFullItemClearable" in $$props) $$invalidate(8, multiFullItemClearable = $$props.multiFullItemClearable);
		if ("isDisabled" in $$props) $$invalidate(9, isDisabled = $$props.isDisabled);
		if ("isCreatable" in $$props) $$invalidate(47, isCreatable = $$props.isCreatable);
		if ("isFocused" in $$props) $$invalidate(1, isFocused = $$props.isFocused);
		if ("value" in $$props) $$invalidate(2, value = $$props.value);
		if ("filterText" in $$props) $$invalidate(3, filterText = $$props.filterText);
		if ("placeholder" in $$props) $$invalidate(48, placeholder = $$props.placeholder);
		if ("placeholderAlwaysShow" in $$props) $$invalidate(49, placeholderAlwaysShow = $$props.placeholderAlwaysShow);
		if ("items" in $$props) $$invalidate(50, items = $$props.items);
		if ("itemFilter" in $$props) $$invalidate(51, itemFilter = $$props.itemFilter);
		if ("groupBy" in $$props) $$invalidate(52, groupBy = $$props.groupBy);
		if ("groupFilter" in $$props) $$invalidate(53, groupFilter = $$props.groupFilter);
		if ("isGroupHeaderSelectable" in $$props) $$invalidate(54, isGroupHeaderSelectable = $$props.isGroupHeaderSelectable);
		if ("getGroupHeaderLabel" in $$props) $$invalidate(55, getGroupHeaderLabel = $$props.getGroupHeaderLabel);
		if ("labelIdentifier" in $$props) $$invalidate(56, labelIdentifier = $$props.labelIdentifier);
		if ("getOptionLabel" in $$props) $$invalidate(57, getOptionLabel = $$props.getOptionLabel);
		if ("optionIdentifier" in $$props) $$invalidate(58, optionIdentifier = $$props.optionIdentifier);
		if ("loadOptions" in $$props) $$invalidate(59, loadOptions = $$props.loadOptions);
		if ("hasError" in $$props) $$invalidate(10, hasError = $$props.hasError);
		if ("containerStyles" in $$props) $$invalidate(11, containerStyles = $$props.containerStyles);
		if ("getSelectionLabel" in $$props) $$invalidate(12, getSelectionLabel = $$props.getSelectionLabel);
		if ("createGroupHeaderItem" in $$props) $$invalidate(60, createGroupHeaderItem = $$props.createGroupHeaderItem);
		if ("createItem" in $$props) $$invalidate(61, createItem = $$props.createItem);
		if ("isSearchable" in $$props) $$invalidate(13, isSearchable = $$props.isSearchable);
		if ("inputStyles" in $$props) $$invalidate(14, inputStyles = $$props.inputStyles);
		if ("isClearable" in $$props) $$invalidate(15, isClearable = $$props.isClearable);
		if ("isWaiting" in $$props) $$invalidate(4, isWaiting = $$props.isWaiting);
		if ("listPlacement" in $$props) $$invalidate(63, listPlacement = $$props.listPlacement);
		if ("listOpen" in $$props) $$invalidate(5, listOpen = $$props.listOpen);
		if ("isVirtualList" in $$props) $$invalidate(64, isVirtualList = $$props.isVirtualList);
		if ("loadOptionsInterval" in $$props) $$invalidate(65, loadOptionsInterval = $$props.loadOptionsInterval);
		if ("noOptionsMessage" in $$props) $$invalidate(66, noOptionsMessage = $$props.noOptionsMessage);
		if ("hideEmptyState" in $$props) $$invalidate(67, hideEmptyState = $$props.hideEmptyState);
		if ("inputAttributes" in $$props) $$invalidate(16, inputAttributes = $$props.inputAttributes);
		if ("listAutoWidth" in $$props) $$invalidate(68, listAutoWidth = $$props.listAutoWidth);
		if ("itemHeight" in $$props) $$invalidate(69, itemHeight = $$props.itemHeight);
		if ("Icon" in $$props) $$invalidate(17, Icon = $$props.Icon);
		if ("iconProps" in $$props) $$invalidate(18, iconProps = $$props.iconProps);
		if ("showChevron" in $$props) $$invalidate(19, showChevron = $$props.showChevron);
		if ("showIndicator" in $$props) $$invalidate(20, showIndicator = $$props.showIndicator);
		if ("containerClasses" in $$props) $$invalidate(21, containerClasses = $$props.containerClasses);
		if ("indicatorSvg" in $$props) $$invalidate(22, indicatorSvg = $$props.indicatorSvg);
		if ("listOffset" in $$props) $$invalidate(70, listOffset = $$props.listOffset);
		if ("ClearIcon" in $$props) $$invalidate(23, ClearIcon$1 = $$props.ClearIcon);
		if ("Item" in $$props) $$invalidate(71, Item$1 = $$props.Item);
		if ("List" in $$props) $$invalidate(24, List$1 = $$props.List);
		if ("Selection" in $$props) $$invalidate(25, Selection = $$props.Selection);
		if ("MultiSelection" in $$props) $$invalidate(26, MultiSelection$1 = $$props.MultiSelection);
		if ("VirtualList" in $$props) $$invalidate(72, VirtualList$1 = $$props.VirtualList);
		if ("selectedValue" in $$props) $$invalidate(73, selectedValue = $$props.selectedValue);
		if ("activeValue" in $$props) $$invalidate(30, activeValue = $$props.activeValue);
		if ("prev_value" in $$props) $$invalidate(77, prev_value = $$props.prev_value);
		if ("prev_filterText" in $$props) $$invalidate(78, prev_filterText = $$props.prev_filterText);
		if ("prev_isFocused" in $$props) $$invalidate(79, prev_isFocused = $$props.prev_isFocused);
		if ("prev_isMulti" in $$props) $$invalidate(80, prev_isMulti = $$props.prev_isMulti);
		if ("hoverItemIndex" in $$props) $$invalidate(28, hoverItemIndex = $$props.hoverItemIndex);
		if ("_inputAttributes" in $$props) $$invalidate(31, _inputAttributes = $$props._inputAttributes);
		if ("ariaValues" in $$props) $$invalidate(74, ariaValues = $$props.ariaValues);
		if ("ariaListOpen" in $$props) $$invalidate(75, ariaListOpen = $$props.ariaListOpen);
		if ("ariaFocused" in $$props) $$invalidate(76, ariaFocused = $$props.ariaFocused);
		if ("filteredItems" in $$props) $$invalidate(81, filteredItems = $$props.filteredItems);
		if ("showSelectedItem" in $$props) $$invalidate(29, showSelectedItem = $$props.showSelectedItem);
		if ("showClearIcon" in $$props) $$invalidate(32, showClearIcon = $$props.showClearIcon);
		if ("placeholderText" in $$props) $$invalidate(33, placeholderText = $$props.placeholderText);
		if ("showMultiSelect" in $$props) $$invalidate(34, showMultiSelect = $$props.showMultiSelect);
		if ("listProps" in $$props) $$invalidate(35, listProps = $$props.listProps);
		if ("ariaSelection" in $$props) $$invalidate(36, ariaSelection = $$props.ariaSelection);
		if ("ariaContext" in $$props) $$invalidate(37, ariaContext = $$props.ariaContext);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*filterText, value, isMulti*/ 140 | $$self.$$.dirty[1] & /*loadOptions, items, optionIdentifier, groupBy, isCreatable*/ 405340160) {
			$$invalidate(81, filteredItems = filterMethod({
				loadOptions,
				filterText,
				items,
				value,
				isMulti,
				optionIdentifier,
				groupBy,
				isCreatable
			}));
		}

		if ($$self.$$.dirty[2] & /*selectedValue*/ 2048) {
			{
				if (selectedValue) console.warn("selectedValue is no longer used. Please use value instead.");
			}
		}

		if ($$self.$$.dirty[1] & /*items*/ 524288) {
			updateValueDisplay(items);
		}

		if ($$self.$$.dirty[0] & /*value*/ 4) {
			{
				if (value) setValue();
			}
		}

		if ($$self.$$.dirty[0] & /*inputAttributes, isSearchable*/ 73728) {
			{
				if (inputAttributes || !isSearchable) assignInputAttributes();
			}
		}

		if ($$self.$$.dirty[0] & /*isMulti*/ 128 | $$self.$$.dirty[2] & /*prev_isMulti*/ 262144) {
			{
				if (isMulti) {
					setupMulti();
				}

				if (prev_isMulti && !isMulti) {
					setupSingle();
				}
			}
		}

		if ($$self.$$.dirty[0] & /*isMulti, value*/ 132) {
			{
				if (isMulti && value && value.length > 1) {
					checkValueForDuplicates();
				}
			}
		}

		if ($$self.$$.dirty[0] & /*value*/ 4) {
			{
				if (value) dispatchSelectedItem();
			}
		}

		if ($$self.$$.dirty[0] & /*value, isMulti*/ 132 | $$self.$$.dirty[2] & /*prev_value*/ 32768) {
			{
				if (!value && isMulti && prev_value) {
					dispatch("select", value);
				}
			}
		}

		if ($$self.$$.dirty[0] & /*isFocused*/ 2 | $$self.$$.dirty[2] & /*prev_isFocused*/ 131072) {
			{
				if (isFocused !== prev_isFocused) {
					setupFocus();
				}
			}
		}

		if ($$self.$$.dirty[0] & /*filterText*/ 8 | $$self.$$.dirty[2] & /*prev_filterText*/ 65536) {
			{
				if (filterText !== prev_filterText) {
					setupFilterText();
				}
			}
		}

		if ($$self.$$.dirty[0] & /*value, filterText*/ 12) {
			$$invalidate(29, showSelectedItem = value && filterText.length === 0);
		}

		if ($$self.$$.dirty[0] & /*showSelectedItem, isClearable, isDisabled, isWaiting*/ 536904208) {
			$$invalidate(32, showClearIcon = showSelectedItem && isClearable && !isDisabled && !isWaiting);
		}

		if ($$self.$$.dirty[0] & /*isMulti, value*/ 132 | $$self.$$.dirty[1] & /*placeholderAlwaysShow, placeholder*/ 393216) {
			$$invalidate(33, placeholderText = placeholderAlwaysShow && isMulti
			? placeholder
			: value ? "" : placeholder);
		}

		if ($$self.$$.dirty[0] & /*isMulti, value*/ 132) {
			$$invalidate(34, showMultiSelect = isMulti && value && value.length > 0);
		}

		if ($$self.$$.dirty[0] & /*filterText, value, isMulti, container*/ 141 | $$self.$$.dirty[1] & /*optionIdentifier, getGroupHeaderLabel, getOptionLabel*/ 218103808 | $$self.$$.dirty[2] & /*Item, noOptionsMessage, hideEmptyState, isVirtualList, VirtualList, filteredItems, itemHeight, listPlacement, listAutoWidth, listOffset*/ 526326) {
			$$invalidate(35, listProps = {
				Item: Item$1,
				filterText,
				optionIdentifier,
				noOptionsMessage,
				hideEmptyState,
				isVirtualList,
				VirtualList: VirtualList$1,
				value,
				isMulti,
				getGroupHeaderLabel,
				items: filteredItems,
				itemHeight,
				getOptionLabel,
				listPlacement,
				parent: container,
				listAutoWidth,
				listOffset
			});
		}

		if ($$self.$$.dirty[0] & /*value, isMulti*/ 132) {
			$$invalidate(36, ariaSelection = value ? handleAriaSelection() : "");
		}

		if ($$self.$$.dirty[0] & /*hoverItemIndex, isFocused, listOpen*/ 268435490 | $$self.$$.dirty[2] & /*filteredItems*/ 524288) {
			$$invalidate(37, ariaContext = handleAriaContent());
		}
	};

	return [
		container,
		isFocused,
		value,
		filterText,
		isWaiting,
		listOpen,
		input,
		isMulti,
		multiFullItemClearable,
		isDisabled,
		hasError,
		containerStyles,
		getSelectionLabel,
		isSearchable,
		inputStyles,
		isClearable,
		inputAttributes,
		Icon,
		iconProps,
		showChevron,
		showIndicator,
		containerClasses,
		indicatorSvg,
		ClearIcon$1,
		List$1,
		Selection,
		MultiSelection$1,
		handleClear,
		hoverItemIndex,
		showSelectedItem,
		activeValue,
		_inputAttributes,
		showClearIcon,
		placeholderText,
		showMultiSelect,
		listProps,
		ariaSelection,
		ariaContext,
		handleMultiItemClear,
		handleKeyDown,
		handleFocus,
		handleWindowEvent,
		handleClick,
		itemSelected,
		itemCreated,
		closeList,
		id,
		isCreatable,
		placeholder,
		placeholderAlwaysShow,
		items,
		itemFilter,
		groupBy,
		groupFilter,
		isGroupHeaderSelectable,
		getGroupHeaderLabel,
		labelIdentifier,
		getOptionLabel,
		optionIdentifier,
		loadOptions,
		createGroupHeaderItem,
		createItem,
		getFilteredItems,
		listPlacement,
		isVirtualList,
		loadOptionsInterval,
		noOptionsMessage,
		hideEmptyState,
		listAutoWidth,
		itemHeight,
		listOffset,
		Item$1,
		VirtualList$1,
		selectedValue,
		ariaValues,
		ariaListOpen,
		ariaFocused,
		prev_value,
		prev_filterText,
		prev_isFocused,
		prev_isMulti,
		filteredItems,
		input_1_binding,
		input_1_input_handler,
		switch_instance_hoverItemIndex_binding,
		div_binding
	];
}

class Select extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(
			this,
			options,
			instance$8,
			create_fragment$8,
			safe_not_equal,
			{
				id: 46,
				container: 0,
				input: 6,
				isMulti: 7,
				multiFullItemClearable: 8,
				isDisabled: 9,
				isCreatable: 47,
				isFocused: 1,
				value: 2,
				filterText: 3,
				placeholder: 48,
				placeholderAlwaysShow: 49,
				items: 50,
				itemFilter: 51,
				groupBy: 52,
				groupFilter: 53,
				isGroupHeaderSelectable: 54,
				getGroupHeaderLabel: 55,
				labelIdentifier: 56,
				getOptionLabel: 57,
				optionIdentifier: 58,
				loadOptions: 59,
				hasError: 10,
				containerStyles: 11,
				getSelectionLabel: 12,
				createGroupHeaderItem: 60,
				createItem: 61,
				getFilteredItems: 62,
				isSearchable: 13,
				inputStyles: 14,
				isClearable: 15,
				isWaiting: 4,
				listPlacement: 63,
				listOpen: 5,
				isVirtualList: 64,
				loadOptionsInterval: 65,
				noOptionsMessage: 66,
				hideEmptyState: 67,
				inputAttributes: 16,
				listAutoWidth: 68,
				itemHeight: 69,
				Icon: 17,
				iconProps: 18,
				showChevron: 19,
				showIndicator: 20,
				containerClasses: 21,
				indicatorSvg: 22,
				listOffset: 70,
				ClearIcon: 23,
				Item: 71,
				List: 24,
				Selection: 25,
				MultiSelection: 26,
				VirtualList: 72,
				selectedValue: 73,
				handleClear: 27,
				ariaValues: 74,
				ariaListOpen: 75,
				ariaFocused: 76
			},
			[-1, -1, -1, -1]
		);

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Select",
			options,
			id: create_fragment$8.name
		});
	}

	get id() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set id(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get container() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set container(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get input() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set input(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isMulti() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isMulti(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get multiFullItemClearable() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set multiFullItemClearable(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isDisabled() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isDisabled(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isCreatable() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isCreatable(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isFocused() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isFocused(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get value() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get filterText() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set filterText(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get placeholder() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set placeholder(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get placeholderAlwaysShow() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set placeholderAlwaysShow(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get items() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set items(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get itemFilter() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set itemFilter(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get groupBy() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set groupBy(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get groupFilter() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set groupFilter(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isGroupHeaderSelectable() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isGroupHeaderSelectable(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get getGroupHeaderLabel() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set getGroupHeaderLabel(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get labelIdentifier() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set labelIdentifier(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get getOptionLabel() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set getOptionLabel(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get optionIdentifier() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set optionIdentifier(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get loadOptions() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set loadOptions(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get hasError() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set hasError(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get containerStyles() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set containerStyles(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get getSelectionLabel() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set getSelectionLabel(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get createGroupHeaderItem() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set createGroupHeaderItem(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get createItem() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set createItem(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get getFilteredItems() {
		return this.$$.ctx[62];
	}

	set getFilteredItems(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isSearchable() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isSearchable(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get inputStyles() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set inputStyles(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isClearable() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isClearable(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isWaiting() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isWaiting(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get listPlacement() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set listPlacement(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get listOpen() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set listOpen(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get isVirtualList() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set isVirtualList(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get loadOptionsInterval() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set loadOptionsInterval(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get noOptionsMessage() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set noOptionsMessage(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get hideEmptyState() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set hideEmptyState(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get inputAttributes() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set inputAttributes(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get listAutoWidth() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set listAutoWidth(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get itemHeight() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set itemHeight(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get Icon() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set Icon(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get iconProps() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set iconProps(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get showChevron() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set showChevron(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get showIndicator() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set showIndicator(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get containerClasses() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set containerClasses(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get indicatorSvg() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set indicatorSvg(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get listOffset() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set listOffset(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get ClearIcon() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set ClearIcon(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get Item() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set Item(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get List() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set List(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get Selection() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set Selection(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get MultiSelection() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set MultiSelection(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get VirtualList() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set VirtualList(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get selectedValue() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set selectedValue(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get handleClear() {
		return this.$$.ctx[27];
	}

	set handleClear(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get ariaValues() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set ariaValues(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get ariaListOpen() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set ariaListOpen(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get ariaFocused() {
		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set ariaFocused(value) {
		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src\DownloadFormats.svelte generated by Svelte v3.35.0 */

const { Error: Error_1$3 } = globals;
const file$6 = "src\\DownloadFormats.svelte";

// (90:0) {#if !hideDropdown}
function create_if_block$5(ctx) {
	let div1;
	let div0;
	let select_1;
	let updating_value;
	let current;

	function select_1_value_binding(value) {
		/*select_1_value_binding*/ ctx[6](value);
	}

	let select_1_props = {
		id: "pixxioDownloadFormats__dropdown",
		items: /*formats*/ ctx[1],
		isClearable: false,
		isSearchable: false,
		listPlacement: "top",
		showIndicator: true,
		optionIdentifier: "id",
		labelIdentifier: "name",
		containerClasses: "customSelect",
		isWaiting: /*isLoading*/ ctx[2],
		listAutoWidth: true
	};

	if (/*selected*/ ctx[0] !== void 0) {
		select_1_props.value = /*selected*/ ctx[0];
	}

	select_1 = new Select({ props: select_1_props, $$inline: true });
	binding_callbacks.push(() => bind$1(select_1, "value", select_1_value_binding));
	select_1.$on("select", /*select*/ ctx[4]);

	const block = {
		c: function create() {
			div1 = element("div");
			div0 = element("div");
			create_component(select_1.$$.fragment);
			attr_dev(div0, "class", "field svelte-18kl8z0");
			add_location(div0, file$6, 91, 2, 2307);
			attr_dev(div1, "class", "downloadFormats fields svelte-18kl8z0");
			add_location(div1, file$6, 90, 0, 2267);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);
			mount_component(select_1, div0, null);
			current = true;
		},
		p: function update(ctx, dirty) {
			const select_1_changes = {};
			if (dirty & /*formats*/ 2) select_1_changes.items = /*formats*/ ctx[1];
			if (dirty & /*isLoading*/ 4) select_1_changes.isWaiting = /*isLoading*/ ctx[2];

			if (!updating_value && dirty & /*selected*/ 1) {
				updating_value = true;
				select_1_changes.value = /*selected*/ ctx[0];
				add_flush_callback(() => updating_value = false);
			}

			select_1.$set(select_1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(select_1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(select_1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div1);
			destroy_component(select_1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$5.name,
		type: "if",
		source: "(90:0) {#if !hideDropdown}",
		ctx
	});

	return block;
}

function create_fragment$7(ctx) {
	let if_block_anchor;
	let current;
	let if_block = !/*hideDropdown*/ ctx[3] && create_if_block$5(ctx);

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
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (!/*hideDropdown*/ ctx[3]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*hideDropdown*/ 8) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$5(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
	let $allowFormats;
	validate_store(allowFormats, "allowFormats");
	component_subscribe($$self, allowFormats, $$value => $$invalidate(5, $allowFormats = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("DownloadFormats", slots, []);
	const api = new API();
	let selected;
	let formats = [];
	let hasError = false;
	let isLoading = false;
	let showOriginal = false;
	let showPreview = false;
	let hideDropdown = true;

	onMount(() => {
		changes();
	});

	const changes = async () => {
		const downloadFormatIDs = $allowFormats && $allowFormats.length
		? $allowFormats.filter(format => format !== "original" && format !== "preview")
		: [];

		if (downloadFormatIDs.length) {
			await fetchDownloadFormats();
		} else {
			$$invalidate(1, formats = []);
		}

		if (showPreview) {
			formats.unshift({ id: "preview", name: lang("preview") });
		}

		if (showOriginal) {
			formats.unshift({ id: "original", name: lang("original") });
		}

		if ($allowFormats && $allowFormats.length === 1) {
			$$invalidate(0, selected = formats.find(format => format.id === $allowFormats[0]));
		} else {
			$$invalidate(0, selected = formats[0]);
		}

		select();
	};

	const select = () => {
		format$1.update(() => selected.id);
	};

	const fetchDownloadFormats = async () => {
		try {
			$$invalidate(2, isLoading = true);
			const options = { responseFields: ["id", "name"] };
			const data = await api.get(`/downloadFormats`, options);

			if (!data.success) {
				throw new Error(data.errormessage);
			}

			$$invalidate(1, formats = data.downloadFormats.filter(format => allowFormats === null || $allowFormats !== null && $allowFormats.includes(format.id)));
			$$invalidate(2, isLoading = false);
		} catch(e) {
			hasError = true;
			$$invalidate(2, isLoading = false);
		}
	};

	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DownloadFormats> was created with unknown prop '${key}'`);
	});

	function select_1_value_binding(value) {
		selected = value;
		$$invalidate(0, selected);
	}

	$$self.$capture_state = () => ({
		onMount,
		API,
		format: format$1,
		lang,
		allowFormats,
		Select,
		api,
		selected,
		formats,
		hasError,
		isLoading,
		showOriginal,
		showPreview,
		hideDropdown,
		changes,
		select,
		fetchDownloadFormats,
		$allowFormats
	});

	$$self.$inject_state = $$props => {
		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
		if ("formats" in $$props) $$invalidate(1, formats = $$props.formats);
		if ("hasError" in $$props) hasError = $$props.hasError;
		if ("isLoading" in $$props) $$invalidate(2, isLoading = $$props.isLoading);
		if ("showOriginal" in $$props) showOriginal = $$props.showOriginal;
		if ("showPreview" in $$props) showPreview = $$props.showPreview;
		if ("hideDropdown" in $$props) $$invalidate(3, hideDropdown = $$props.hideDropdown);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$allowFormats*/ 32) {
			{
				$$invalidate(3, hideDropdown = ($allowFormats || []).length === 1);
				showOriginal = $allowFormats === null || $allowFormats !== null && $allowFormats.includes("original");
				showPreview = $allowFormats === null || $allowFormats !== null && $allowFormats.includes("preview");
				changes();
			}
		}
	};

	return [
		selected,
		formats,
		isLoading,
		hideDropdown,
		select,
		$allowFormats,
		select_1_value_binding
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

/* src\Selection.svelte generated by Svelte v3.35.0 */
const file$5 = "src\\Selection.svelte";

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
			add_location(img, file$5, 14, 8, 397);
			attr_dev(li, "class", "pixxioSelection__file svelte-1y7flg5");
			add_location(li, file$5, 13, 6, 315);
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
			add_location(li, file$5, 19, 2, 566);
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
			add_location(ul, file$5, 10, 0, 250);
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

var top = 'top';
var bottom = 'bottom';
var right = 'right';
var left = 'left';
var auto = 'auto';
var basePlacements = [top, bottom, right, left];
var start = 'start';
var end = 'end';
var clippingParents = 'clippingParents';
var viewport = 'viewport';
var popper = 'popper';
var reference = 'reference';
var variationPlacements = /*#__PURE__*/basePlacements.reduce(function (acc, placement) {
  return acc.concat([placement + "-" + start, placement + "-" + end]);
}, []);
var placements = /*#__PURE__*/[].concat(basePlacements, [auto]).reduce(function (acc, placement) {
  return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
}, []); // modifiers that need to read the DOM

var beforeRead = 'beforeRead';
var read = 'read';
var afterRead = 'afterRead'; // pure-logic modifiers

var beforeMain = 'beforeMain';
var main = 'main';
var afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)

var beforeWrite = 'beforeWrite';
var write = 'write';
var afterWrite = 'afterWrite';
var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

function getNodeName(element) {
  return element ? (element.nodeName || '').toLowerCase() : null;
}

function getWindow(node) {
  if (node == null) {
    return window;
  }

  if (node.toString() !== '[object Window]') {
    var ownerDocument = node.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }

  return node;
}

function isElement$1(node) {
  var OwnElement = getWindow(node).Element;
  return node instanceof OwnElement || node instanceof Element;
}

function isHTMLElement(node) {
  var OwnElement = getWindow(node).HTMLElement;
  return node instanceof OwnElement || node instanceof HTMLElement;
}

function isShadowRoot(node) {
  // IE 11 has no ShadowRoot
  if (typeof ShadowRoot === 'undefined') {
    return false;
  }

  var OwnElement = getWindow(node).ShadowRoot;
  return node instanceof OwnElement || node instanceof ShadowRoot;
}

// and applies them to the HTMLElements such as popper and arrow

function applyStyles(_ref) {
  var state = _ref.state;
  Object.keys(state.elements).forEach(function (name) {
    var style = state.styles[name] || {};
    var attributes = state.attributes[name] || {};
    var element = state.elements[name]; // arrow is optional + virtual elements

    if (!isHTMLElement(element) || !getNodeName(element)) {
      return;
    } // Flow doesn't support to extend this property, but it's the most
    // effective way to apply styles to an HTMLElement
    // $FlowFixMe[cannot-write]


    Object.assign(element.style, style);
    Object.keys(attributes).forEach(function (name) {
      var value = attributes[name];

      if (value === false) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, value === true ? '' : value);
      }
    });
  });
}

function effect$2(_ref2) {
  var state = _ref2.state;
  var initialStyles = {
    popper: {
      position: state.options.strategy,
      left: '0',
      top: '0',
      margin: '0'
    },
    arrow: {
      position: 'absolute'
    },
    reference: {}
  };
  Object.assign(state.elements.popper.style, initialStyles.popper);
  state.styles = initialStyles;

  if (state.elements.arrow) {
    Object.assign(state.elements.arrow.style, initialStyles.arrow);
  }

  return function () {
    Object.keys(state.elements).forEach(function (name) {
      var element = state.elements[name];
      var attributes = state.attributes[name] || {};
      var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]); // Set all values to an empty string to unset them

      var style = styleProperties.reduce(function (style, property) {
        style[property] = '';
        return style;
      }, {}); // arrow is optional + virtual elements

      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }

      Object.assign(element.style, style);
      Object.keys(attributes).forEach(function (attribute) {
        element.removeAttribute(attribute);
      });
    });
  };
} // eslint-disable-next-line import/no-unused-modules


var applyStyles$1 = {
  name: 'applyStyles',
  enabled: true,
  phase: 'write',
  fn: applyStyles,
  effect: effect$2,
  requires: ['computeStyles']
};

function getBasePlacement$1(placement) {
  return placement.split('-')[0];
}

var max = Math.max;
var min = Math.min;
var round = Math.round;

function getBoundingClientRect(element, includeScale) {
  if (includeScale === void 0) {
    includeScale = false;
  }

  var rect = element.getBoundingClientRect();
  var scaleX = 1;
  var scaleY = 1;

  if (isHTMLElement(element) && includeScale) {
    var offsetHeight = element.offsetHeight;
    var offsetWidth = element.offsetWidth; // Do not attempt to divide by 0, otherwise we get `Infinity` as scale
    // Fallback to 1 in case both values are `0`

    if (offsetWidth > 0) {
      scaleX = round(rect.width) / offsetWidth || 1;
    }

    if (offsetHeight > 0) {
      scaleY = round(rect.height) / offsetHeight || 1;
    }
  }

  return {
    width: rect.width / scaleX,
    height: rect.height / scaleY,
    top: rect.top / scaleY,
    right: rect.right / scaleX,
    bottom: rect.bottom / scaleY,
    left: rect.left / scaleX,
    x: rect.left / scaleX,
    y: rect.top / scaleY
  };
}

// means it doesn't take into account transforms.

function getLayoutRect(element) {
  var clientRect = getBoundingClientRect(element); // Use the clientRect sizes if it's not been transformed.
  // Fixes https://github.com/popperjs/popper-core/issues/1223

  var width = element.offsetWidth;
  var height = element.offsetHeight;

  if (Math.abs(clientRect.width - width) <= 1) {
    width = clientRect.width;
  }

  if (Math.abs(clientRect.height - height) <= 1) {
    height = clientRect.height;
  }

  return {
    x: element.offsetLeft,
    y: element.offsetTop,
    width: width,
    height: height
  };
}

function contains(parent, child) {
  var rootNode = child.getRootNode && child.getRootNode(); // First, attempt with faster native method

  if (parent.contains(child)) {
    return true;
  } // then fallback to custom implementation with Shadow DOM support
  else if (rootNode && isShadowRoot(rootNode)) {
      var next = child;

      do {
        if (next && parent.isSameNode(next)) {
          return true;
        } // $FlowFixMe[prop-missing]: need a better way to handle this...


        next = next.parentNode || next.host;
      } while (next);
    } // Give up, the result is false


  return false;
}

function getComputedStyle$1(element) {
  return getWindow(element).getComputedStyle(element);
}

function isTableElement(element) {
  return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
}

function getDocumentElement(element) {
  // $FlowFixMe[incompatible-return]: assume body is always available
  return ((isElement$1(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
  element.document) || window.document).documentElement;
}

function getParentNode(element) {
  if (getNodeName(element) === 'html') {
    return element;
  }

  return (// this is a quicker (but less type safe) way to save quite some bytes from the bundle
    // $FlowFixMe[incompatible-return]
    // $FlowFixMe[prop-missing]
    element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
    element.parentNode || ( // DOM Element detected
    isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
    getDocumentElement(element) // fallback

  );
}

function getTrueOffsetParent(element) {
  if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
  getComputedStyle$1(element).position === 'fixed') {
    return null;
  }

  return element.offsetParent;
} // `.offsetParent` reports `null` for fixed elements, while absolute elements
// return the containing block


function getContainingBlock(element) {
  var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;
  var isIE = navigator.userAgent.indexOf('Trident') !== -1;

  if (isIE && isHTMLElement(element)) {
    // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
    var elementCss = getComputedStyle$1(element);

    if (elementCss.position === 'fixed') {
      return null;
    }
  }

  var currentNode = getParentNode(element);

  while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
    var css = getComputedStyle$1(currentNode); // This is non-exhaustive but covers the most common CSS properties that
    // create a containing block.
    // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block

    if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === 'filter' || isFirefox && css.filter && css.filter !== 'none') {
      return currentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  return null;
} // Gets the closest ancestor positioned element. Handles some edge cases,
// such as table ancestors and cross browser bugs.


function getOffsetParent(element) {
  var window = getWindow(element);
  var offsetParent = getTrueOffsetParent(element);

  while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === 'static') {
    offsetParent = getTrueOffsetParent(offsetParent);
  }

  if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle$1(offsetParent).position === 'static')) {
    return window;
  }

  return offsetParent || getContainingBlock(element) || window;
}

function getMainAxisFromPlacement(placement) {
  return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
}

function within(min$1, value, max$1) {
  return max(min$1, min(value, max$1));
}
function withinMaxClamp(min, value, max) {
  var v = within(min, value, max);
  return v > max ? max : v;
}

function getFreshSideObject() {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}

function mergePaddingObject(paddingObject) {
  return Object.assign({}, getFreshSideObject(), paddingObject);
}

function expandToHashMap(value, keys) {
  return keys.reduce(function (hashMap, key) {
    hashMap[key] = value;
    return hashMap;
  }, {});
}

var toPaddingObject = function toPaddingObject(padding, state) {
  padding = typeof padding === 'function' ? padding(Object.assign({}, state.rects, {
    placement: state.placement
  })) : padding;
  return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
};

function arrow(_ref) {
  var _state$modifiersData$;

  var state = _ref.state,
      name = _ref.name,
      options = _ref.options;
  var arrowElement = state.elements.arrow;
  var popperOffsets = state.modifiersData.popperOffsets;
  var basePlacement = getBasePlacement$1(state.placement);
  var axis = getMainAxisFromPlacement(basePlacement);
  var isVertical = [left, right].indexOf(basePlacement) >= 0;
  var len = isVertical ? 'height' : 'width';

  if (!arrowElement || !popperOffsets) {
    return;
  }

  var paddingObject = toPaddingObject(options.padding, state);
  var arrowRect = getLayoutRect(arrowElement);
  var minProp = axis === 'y' ? top : left;
  var maxProp = axis === 'y' ? bottom : right;
  var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
  var startDiff = popperOffsets[axis] - state.rects.reference[axis];
  var arrowOffsetParent = getOffsetParent(arrowElement);
  var clientSize = arrowOffsetParent ? axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
  var centerToReference = endDiff / 2 - startDiff / 2; // Make sure the arrow doesn't overflow the popper if the center point is
  // outside of the popper bounds

  var min = paddingObject[minProp];
  var max = clientSize - arrowRect[len] - paddingObject[maxProp];
  var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
  var offset = within(min, center, max); // Prevents breaking syntax highlighting...

  var axisProp = axis;
  state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
}

function effect$1(_ref2) {
  var state = _ref2.state,
      options = _ref2.options;
  var _options$element = options.element,
      arrowElement = _options$element === void 0 ? '[data-popper-arrow]' : _options$element;

  if (arrowElement == null) {
    return;
  } // CSS selector


  if (typeof arrowElement === 'string') {
    arrowElement = state.elements.popper.querySelector(arrowElement);

    if (!arrowElement) {
      return;
    }
  }

  {
    if (!isHTMLElement(arrowElement)) {
      console.error(['Popper: "arrow" element must be an HTMLElement (not an SVGElement).', 'To use an SVG arrow, wrap it in an HTMLElement that will be used as', 'the arrow.'].join(' '));
    }
  }

  if (!contains(state.elements.popper, arrowElement)) {
    {
      console.error(['Popper: "arrow" modifier\'s `element` must be a child of the popper', 'element.'].join(' '));
    }

    return;
  }

  state.elements.arrow = arrowElement;
} // eslint-disable-next-line import/no-unused-modules


var arrow$1 = {
  name: 'arrow',
  enabled: true,
  phase: 'main',
  fn: arrow,
  effect: effect$1,
  requires: ['popperOffsets'],
  requiresIfExists: ['preventOverflow']
};

function getVariation(placement) {
  return placement.split('-')[1];
}

var unsetSides = {
  top: 'auto',
  right: 'auto',
  bottom: 'auto',
  left: 'auto'
}; // Round the offsets to the nearest suitable subpixel based on the DPR.
// Zooming can change the DPR, but it seems to report a value that will
// cleanly divide the values into the appropriate subpixels.

function roundOffsetsByDPR(_ref) {
  var x = _ref.x,
      y = _ref.y;
  var win = window;
  var dpr = win.devicePixelRatio || 1;
  return {
    x: round(x * dpr) / dpr || 0,
    y: round(y * dpr) / dpr || 0
  };
}

function mapToStyles(_ref2) {
  var _Object$assign2;

  var popper = _ref2.popper,
      popperRect = _ref2.popperRect,
      placement = _ref2.placement,
      variation = _ref2.variation,
      offsets = _ref2.offsets,
      position = _ref2.position,
      gpuAcceleration = _ref2.gpuAcceleration,
      adaptive = _ref2.adaptive,
      roundOffsets = _ref2.roundOffsets,
      isFixed = _ref2.isFixed;
  var _offsets$x = offsets.x,
      x = _offsets$x === void 0 ? 0 : _offsets$x,
      _offsets$y = offsets.y,
      y = _offsets$y === void 0 ? 0 : _offsets$y;

  var _ref3 = typeof roundOffsets === 'function' ? roundOffsets({
    x: x,
    y: y
  }) : {
    x: x,
    y: y
  };

  x = _ref3.x;
  y = _ref3.y;
  var hasX = offsets.hasOwnProperty('x');
  var hasY = offsets.hasOwnProperty('y');
  var sideX = left;
  var sideY = top;
  var win = window;

  if (adaptive) {
    var offsetParent = getOffsetParent(popper);
    var heightProp = 'clientHeight';
    var widthProp = 'clientWidth';

    if (offsetParent === getWindow(popper)) {
      offsetParent = getDocumentElement(popper);

      if (getComputedStyle$1(offsetParent).position !== 'static' && position === 'absolute') {
        heightProp = 'scrollHeight';
        widthProp = 'scrollWidth';
      }
    } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it


    offsetParent = offsetParent;

    if (placement === top || (placement === left || placement === right) && variation === end) {
      sideY = bottom;
      var offsetY = isFixed && win.visualViewport ? win.visualViewport.height : // $FlowFixMe[prop-missing]
      offsetParent[heightProp];
      y -= offsetY - popperRect.height;
      y *= gpuAcceleration ? 1 : -1;
    }

    if (placement === left || (placement === top || placement === bottom) && variation === end) {
      sideX = right;
      var offsetX = isFixed && win.visualViewport ? win.visualViewport.width : // $FlowFixMe[prop-missing]
      offsetParent[widthProp];
      x -= offsetX - popperRect.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }

  var commonStyles = Object.assign({
    position: position
  }, adaptive && unsetSides);

  var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
    x: x,
    y: y
  }) : {
    x: x,
    y: y
  };

  x = _ref4.x;
  y = _ref4.y;

  if (gpuAcceleration) {
    var _Object$assign;

    return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? '0' : '', _Object$assign[sideX] = hasX ? '0' : '', _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
  }

  return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : '', _Object$assign2[sideX] = hasX ? x + "px" : '', _Object$assign2.transform = '', _Object$assign2));
}

function computeStyles(_ref5) {
  var state = _ref5.state,
      options = _ref5.options;
  var _options$gpuAccelerat = options.gpuAcceleration,
      gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat,
      _options$adaptive = options.adaptive,
      adaptive = _options$adaptive === void 0 ? true : _options$adaptive,
      _options$roundOffsets = options.roundOffsets,
      roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;

  {
    var transitionProperty = getComputedStyle$1(state.elements.popper).transitionProperty || '';

    if (adaptive && ['transform', 'top', 'right', 'bottom', 'left'].some(function (property) {
      return transitionProperty.indexOf(property) >= 0;
    })) {
      console.warn(['Popper: Detected CSS transitions on at least one of the following', 'CSS properties: "transform", "top", "right", "bottom", "left".', '\n\n', 'Disable the "computeStyles" modifier\'s `adaptive` option to allow', 'for smooth transitions, or remove these properties from the CSS', 'transition declaration on the popper element if only transitioning', 'opacity or background-color for example.', '\n\n', 'We recommend using the popper element as a wrapper around an inner', 'element that can have any CSS property transitioned for animations.'].join(' '));
    }
  }

  var commonStyles = {
    placement: getBasePlacement$1(state.placement),
    variation: getVariation(state.placement),
    popper: state.elements.popper,
    popperRect: state.rects.popper,
    gpuAcceleration: gpuAcceleration,
    isFixed: state.options.strategy === 'fixed'
  };

  if (state.modifiersData.popperOffsets != null) {
    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.popperOffsets,
      position: state.options.strategy,
      adaptive: adaptive,
      roundOffsets: roundOffsets
    })));
  }

  if (state.modifiersData.arrow != null) {
    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.arrow,
      position: 'absolute',
      adaptive: false,
      roundOffsets: roundOffsets
    })));
  }

  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    'data-popper-placement': state.placement
  });
} // eslint-disable-next-line import/no-unused-modules


var computeStyles$1 = {
  name: 'computeStyles',
  enabled: true,
  phase: 'beforeWrite',
  fn: computeStyles,
  data: {}
};

var passive = {
  passive: true
};

function effect(_ref) {
  var state = _ref.state,
      instance = _ref.instance,
      options = _ref.options;
  var _options$scroll = options.scroll,
      scroll = _options$scroll === void 0 ? true : _options$scroll,
      _options$resize = options.resize,
      resize = _options$resize === void 0 ? true : _options$resize;
  var window = getWindow(state.elements.popper);
  var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);

  if (scroll) {
    scrollParents.forEach(function (scrollParent) {
      scrollParent.addEventListener('scroll', instance.update, passive);
    });
  }

  if (resize) {
    window.addEventListener('resize', instance.update, passive);
  }

  return function () {
    if (scroll) {
      scrollParents.forEach(function (scrollParent) {
        scrollParent.removeEventListener('scroll', instance.update, passive);
      });
    }

    if (resize) {
      window.removeEventListener('resize', instance.update, passive);
    }
  };
} // eslint-disable-next-line import/no-unused-modules


var eventListeners = {
  name: 'eventListeners',
  enabled: true,
  phase: 'write',
  fn: function fn() {},
  effect: effect,
  data: {}
};

var hash$1 = {
  left: 'right',
  right: 'left',
  bottom: 'top',
  top: 'bottom'
};
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, function (matched) {
    return hash$1[matched];
  });
}

var hash = {
  start: 'end',
  end: 'start'
};
function getOppositeVariationPlacement(placement) {
  return placement.replace(/start|end/g, function (matched) {
    return hash[matched];
  });
}

function getWindowScroll(node) {
  var win = getWindow(node);
  var scrollLeft = win.pageXOffset;
  var scrollTop = win.pageYOffset;
  return {
    scrollLeft: scrollLeft,
    scrollTop: scrollTop
  };
}

function getWindowScrollBarX(element) {
  // If <html> has a CSS width greater than the viewport, then this will be
  // incorrect for RTL.
  // Popper 1 is broken in this case and never had a bug report so let's assume
  // it's not an issue. I don't think anyone ever specifies width on <html>
  // anyway.
  // Browsers where the left scrollbar doesn't cause an issue report `0` for
  // this (e.g. Edge 2019, IE11, Safari)
  return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
}

function getViewportRect(element) {
  var win = getWindow(element);
  var html = getDocumentElement(element);
  var visualViewport = win.visualViewport;
  var width = html.clientWidth;
  var height = html.clientHeight;
  var x = 0;
  var y = 0; // NB: This isn't supported on iOS <= 12. If the keyboard is open, the popper
  // can be obscured underneath it.
  // Also, `html.clientHeight` adds the bottom bar height in Safari iOS, even
  // if it isn't open, so if this isn't available, the popper will be detected
  // to overflow the bottom of the screen too early.

  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height; // Uses Layout Viewport (like Chrome; Safari does not currently)
    // In Chrome, it returns a value very close to 0 (+/-) but contains rounding
    // errors due to floating point numbers, so we need to check precision.
    // Safari returns a number <= 0, usually < -1 when pinch-zoomed
    // Feature detection fails in mobile emulation mode in Chrome.
    // Math.abs(win.innerWidth / visualViewport.scale - visualViewport.width) <
    // 0.001
    // Fallback here: "Not Safari" userAgent

    if (!/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }

  return {
    width: width,
    height: height,
    x: x + getWindowScrollBarX(element),
    y: y
  };
}

// of the `<html>` and `<body>` rect bounds if horizontally scrollable

function getDocumentRect(element) {
  var _element$ownerDocumen;

  var html = getDocumentElement(element);
  var winScroll = getWindowScroll(element);
  var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
  var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
  var y = -winScroll.scrollTop;

  if (getComputedStyle$1(body || html).direction === 'rtl') {
    x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
  }

  return {
    width: width,
    height: height,
    x: x,
    y: y
  };
}

function isScrollParent(element) {
  // Firefox wants us to check `-x` and `-y` variations as well
  var _getComputedStyle = getComputedStyle$1(element),
      overflow = _getComputedStyle.overflow,
      overflowX = _getComputedStyle.overflowX,
      overflowY = _getComputedStyle.overflowY;

  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
}

function getScrollParent(node) {
  if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
    // $FlowFixMe[incompatible-return]: assume body is always available
    return node.ownerDocument.body;
  }

  if (isHTMLElement(node) && isScrollParent(node)) {
    return node;
  }

  return getScrollParent(getParentNode(node));
}

/*
given a DOM element, return the list of all scroll parents, up the list of ancesors
until we get to the top window object. This list is what we attach scroll listeners
to, because if any of these parent elements scroll, we'll need to re-calculate the
reference element's position.
*/

function listScrollParents(element, list) {
  var _element$ownerDocumen;

  if (list === void 0) {
    list = [];
  }

  var scrollParent = getScrollParent(element);
  var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
  var win = getWindow(scrollParent);
  var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
  var updatedList = list.concat(target);
  return isBody ? updatedList : // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
  updatedList.concat(listScrollParents(getParentNode(target)));
}

function rectToClientRect(rect) {
  return Object.assign({}, rect, {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  });
}

function getInnerBoundingClientRect(element) {
  var rect = getBoundingClientRect(element);
  rect.top = rect.top + element.clientTop;
  rect.left = rect.left + element.clientLeft;
  rect.bottom = rect.top + element.clientHeight;
  rect.right = rect.left + element.clientWidth;
  rect.width = element.clientWidth;
  rect.height = element.clientHeight;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}

function getClientRectFromMixedType(element, clippingParent) {
  return clippingParent === viewport ? rectToClientRect(getViewportRect(element)) : isElement$1(clippingParent) ? getInnerBoundingClientRect(clippingParent) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
} // A "clipping parent" is an overflowable container with the characteristic of
// clipping (or hiding) overflowing elements with a position different from
// `initial`


function getClippingParents(element) {
  var clippingParents = listScrollParents(getParentNode(element));
  var canEscapeClipping = ['absolute', 'fixed'].indexOf(getComputedStyle$1(element).position) >= 0;
  var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;

  if (!isElement$1(clipperElement)) {
    return [];
  } // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414


  return clippingParents.filter(function (clippingParent) {
    return isElement$1(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body';
  });
} // Gets the maximum area that the element is visible in due to any number of
// clipping parents


function getClippingRect(element, boundary, rootBoundary) {
  var mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
  var clippingParents = [].concat(mainClippingParents, [rootBoundary]);
  var firstClippingParent = clippingParents[0];
  var clippingRect = clippingParents.reduce(function (accRect, clippingParent) {
    var rect = getClientRectFromMixedType(element, clippingParent);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromMixedType(element, firstClippingParent));
  clippingRect.width = clippingRect.right - clippingRect.left;
  clippingRect.height = clippingRect.bottom - clippingRect.top;
  clippingRect.x = clippingRect.left;
  clippingRect.y = clippingRect.top;
  return clippingRect;
}

function computeOffsets(_ref) {
  var reference = _ref.reference,
      element = _ref.element,
      placement = _ref.placement;
  var basePlacement = placement ? getBasePlacement$1(placement) : null;
  var variation = placement ? getVariation(placement) : null;
  var commonX = reference.x + reference.width / 2 - element.width / 2;
  var commonY = reference.y + reference.height / 2 - element.height / 2;
  var offsets;

  switch (basePlacement) {
    case top:
      offsets = {
        x: commonX,
        y: reference.y - element.height
      };
      break;

    case bottom:
      offsets = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;

    case right:
      offsets = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;

    case left:
      offsets = {
        x: reference.x - element.width,
        y: commonY
      };
      break;

    default:
      offsets = {
        x: reference.x,
        y: reference.y
      };
  }

  var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;

  if (mainAxis != null) {
    var len = mainAxis === 'y' ? 'height' : 'width';

    switch (variation) {
      case start:
        offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
        break;

      case end:
        offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
        break;
    }
  }

  return offsets;
}

function detectOverflow(state, options) {
  if (options === void 0) {
    options = {};
  }

  var _options = options,
      _options$placement = _options.placement,
      placement = _options$placement === void 0 ? state.placement : _options$placement,
      _options$boundary = _options.boundary,
      boundary = _options$boundary === void 0 ? clippingParents : _options$boundary,
      _options$rootBoundary = _options.rootBoundary,
      rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary,
      _options$elementConte = _options.elementContext,
      elementContext = _options$elementConte === void 0 ? popper : _options$elementConte,
      _options$altBoundary = _options.altBoundary,
      altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary,
      _options$padding = _options.padding,
      padding = _options$padding === void 0 ? 0 : _options$padding;
  var paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
  var altContext = elementContext === popper ? reference : popper;
  var popperRect = state.rects.popper;
  var element = state.elements[altBoundary ? altContext : elementContext];
  var clippingClientRect = getClippingRect(isElement$1(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary);
  var referenceClientRect = getBoundingClientRect(state.elements.reference);
  var popperOffsets = computeOffsets({
    reference: referenceClientRect,
    element: popperRect,
    strategy: 'absolute',
    placement: placement
  });
  var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
  var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect; // positive = overflowing the clipping rect
  // 0 or negative = within the clipping rect

  var overflowOffsets = {
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
  };
  var offsetData = state.modifiersData.offset; // Offsets can be applied only to the popper element

  if (elementContext === popper && offsetData) {
    var offset = offsetData[placement];
    Object.keys(overflowOffsets).forEach(function (key) {
      var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
      var axis = [top, bottom].indexOf(key) >= 0 ? 'y' : 'x';
      overflowOffsets[key] += offset[axis] * multiply;
    });
  }

  return overflowOffsets;
}

function computeAutoPlacement(state, options) {
  if (options === void 0) {
    options = {};
  }

  var _options = options,
      placement = _options.placement,
      boundary = _options.boundary,
      rootBoundary = _options.rootBoundary,
      padding = _options.padding,
      flipVariations = _options.flipVariations,
      _options$allowedAutoP = _options.allowedAutoPlacements,
      allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
  var variation = getVariation(placement);
  var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function (placement) {
    return getVariation(placement) === variation;
  }) : basePlacements;
  var allowedPlacements = placements$1.filter(function (placement) {
    return allowedAutoPlacements.indexOf(placement) >= 0;
  });

  if (allowedPlacements.length === 0) {
    allowedPlacements = placements$1;

    {
      console.error(['Popper: The `allowedAutoPlacements` option did not allow any', 'placements. Ensure the `placement` option matches the variation', 'of the allowed placements.', 'For example, "auto" cannot be used to allow "bottom-start".', 'Use "auto-start" instead.'].join(' '));
    }
  } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...


  var overflows = allowedPlacements.reduce(function (acc, placement) {
    acc[placement] = detectOverflow(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding
    })[getBasePlacement$1(placement)];
    return acc;
  }, {});
  return Object.keys(overflows).sort(function (a, b) {
    return overflows[a] - overflows[b];
  });
}

function getExpandedFallbackPlacements(placement) {
  if (getBasePlacement$1(placement) === auto) {
    return [];
  }

  var oppositePlacement = getOppositePlacement(placement);
  return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
}

function flip(_ref) {
  var state = _ref.state,
      options = _ref.options,
      name = _ref.name;

  if (state.modifiersData[name]._skip) {
    return;
  }

  var _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis,
      specifiedFallbackPlacements = options.fallbackPlacements,
      padding = options.padding,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      _options$flipVariatio = options.flipVariations,
      flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio,
      allowedAutoPlacements = options.allowedAutoPlacements;
  var preferredPlacement = state.options.placement;
  var basePlacement = getBasePlacement$1(preferredPlacement);
  var isBasePlacement = basePlacement === preferredPlacement;
  var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
  var placements = [preferredPlacement].concat(fallbackPlacements).reduce(function (acc, placement) {
    return acc.concat(getBasePlacement$1(placement) === auto ? computeAutoPlacement(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      padding: padding,
      flipVariations: flipVariations,
      allowedAutoPlacements: allowedAutoPlacements
    }) : placement);
  }, []);
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var checksMap = new Map();
  var makeFallbackChecks = true;
  var firstFittingPlacement = placements[0];

  for (var i = 0; i < placements.length; i++) {
    var placement = placements[i];

    var _basePlacement = getBasePlacement$1(placement);

    var isStartVariation = getVariation(placement) === start;
    var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
    var len = isVertical ? 'width' : 'height';
    var overflow = detectOverflow(state, {
      placement: placement,
      boundary: boundary,
      rootBoundary: rootBoundary,
      altBoundary: altBoundary,
      padding: padding
    });
    var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;

    if (referenceRect[len] > popperRect[len]) {
      mainVariationSide = getOppositePlacement(mainVariationSide);
    }

    var altVariationSide = getOppositePlacement(mainVariationSide);
    var checks = [];

    if (checkMainAxis) {
      checks.push(overflow[_basePlacement] <= 0);
    }

    if (checkAltAxis) {
      checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
    }

    if (checks.every(function (check) {
      return check;
    })) {
      firstFittingPlacement = placement;
      makeFallbackChecks = false;
      break;
    }

    checksMap.set(placement, checks);
  }

  if (makeFallbackChecks) {
    // `2` may be desired in some cases – research later
    var numberOfChecks = flipVariations ? 3 : 1;

    var _loop = function _loop(_i) {
      var fittingPlacement = placements.find(function (placement) {
        var checks = checksMap.get(placement);

        if (checks) {
          return checks.slice(0, _i).every(function (check) {
            return check;
          });
        }
      });

      if (fittingPlacement) {
        firstFittingPlacement = fittingPlacement;
        return "break";
      }
    };

    for (var _i = numberOfChecks; _i > 0; _i--) {
      var _ret = _loop(_i);

      if (_ret === "break") break;
    }
  }

  if (state.placement !== firstFittingPlacement) {
    state.modifiersData[name]._skip = true;
    state.placement = firstFittingPlacement;
    state.reset = true;
  }
} // eslint-disable-next-line import/no-unused-modules


var flip$1 = {
  name: 'flip',
  enabled: true,
  phase: 'main',
  fn: flip,
  requiresIfExists: ['offset'],
  data: {
    _skip: false
  }
};

function getSideOffsets(overflow, rect, preventedOffsets) {
  if (preventedOffsets === void 0) {
    preventedOffsets = {
      x: 0,
      y: 0
    };
  }

  return {
    top: overflow.top - rect.height - preventedOffsets.y,
    right: overflow.right - rect.width + preventedOffsets.x,
    bottom: overflow.bottom - rect.height + preventedOffsets.y,
    left: overflow.left - rect.width - preventedOffsets.x
  };
}

function isAnySideFullyClipped(overflow) {
  return [top, right, bottom, left].some(function (side) {
    return overflow[side] >= 0;
  });
}

function hide(_ref) {
  var state = _ref.state,
      name = _ref.name;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var preventedOffsets = state.modifiersData.preventOverflow;
  var referenceOverflow = detectOverflow(state, {
    elementContext: 'reference'
  });
  var popperAltOverflow = detectOverflow(state, {
    altBoundary: true
  });
  var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
  var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
  var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
  var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
  state.modifiersData[name] = {
    referenceClippingOffsets: referenceClippingOffsets,
    popperEscapeOffsets: popperEscapeOffsets,
    isReferenceHidden: isReferenceHidden,
    hasPopperEscaped: hasPopperEscaped
  };
  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    'data-popper-reference-hidden': isReferenceHidden,
    'data-popper-escaped': hasPopperEscaped
  });
} // eslint-disable-next-line import/no-unused-modules


var hide$1 = {
  name: 'hide',
  enabled: true,
  phase: 'main',
  requiresIfExists: ['preventOverflow'],
  fn: hide
};

function distanceAndSkiddingToXY(placement, rects, offset) {
  var basePlacement = getBasePlacement$1(placement);
  var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;

  var _ref = typeof offset === 'function' ? offset(Object.assign({}, rects, {
    placement: placement
  })) : offset,
      skidding = _ref[0],
      distance = _ref[1];

  skidding = skidding || 0;
  distance = (distance || 0) * invertDistance;
  return [left, right].indexOf(basePlacement) >= 0 ? {
    x: distance,
    y: skidding
  } : {
    x: skidding,
    y: distance
  };
}

function offset(_ref2) {
  var state = _ref2.state,
      options = _ref2.options,
      name = _ref2.name;
  var _options$offset = options.offset,
      offset = _options$offset === void 0 ? [0, 0] : _options$offset;
  var data = placements.reduce(function (acc, placement) {
    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
    return acc;
  }, {});
  var _data$state$placement = data[state.placement],
      x = _data$state$placement.x,
      y = _data$state$placement.y;

  if (state.modifiersData.popperOffsets != null) {
    state.modifiersData.popperOffsets.x += x;
    state.modifiersData.popperOffsets.y += y;
  }

  state.modifiersData[name] = data;
} // eslint-disable-next-line import/no-unused-modules


var offset$1 = {
  name: 'offset',
  enabled: true,
  phase: 'main',
  requires: ['popperOffsets'],
  fn: offset
};

function popperOffsets(_ref) {
  var state = _ref.state,
      name = _ref.name;
  // Offsets are the actual position the popper needs to have to be
  // properly positioned near its reference element
  // This is the most basic placement, and will be adjusted by
  // the modifiers in the next step
  state.modifiersData[name] = computeOffsets({
    reference: state.rects.reference,
    element: state.rects.popper,
    strategy: 'absolute',
    placement: state.placement
  });
} // eslint-disable-next-line import/no-unused-modules


var popperOffsets$1 = {
  name: 'popperOffsets',
  enabled: true,
  phase: 'read',
  fn: popperOffsets,
  data: {}
};

function getAltAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}

function preventOverflow(_ref) {
  var state = _ref.state,
      options = _ref.options,
      name = _ref.name;
  var _options$mainAxis = options.mainAxis,
      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
      _options$altAxis = options.altAxis,
      checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis,
      boundary = options.boundary,
      rootBoundary = options.rootBoundary,
      altBoundary = options.altBoundary,
      padding = options.padding,
      _options$tether = options.tether,
      tether = _options$tether === void 0 ? true : _options$tether,
      _options$tetherOffset = options.tetherOffset,
      tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
  var overflow = detectOverflow(state, {
    boundary: boundary,
    rootBoundary: rootBoundary,
    padding: padding,
    altBoundary: altBoundary
  });
  var basePlacement = getBasePlacement$1(state.placement);
  var variation = getVariation(state.placement);
  var isBasePlacement = !variation;
  var mainAxis = getMainAxisFromPlacement(basePlacement);
  var altAxis = getAltAxis(mainAxis);
  var popperOffsets = state.modifiersData.popperOffsets;
  var referenceRect = state.rects.reference;
  var popperRect = state.rects.popper;
  var tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset(Object.assign({}, state.rects, {
    placement: state.placement
  })) : tetherOffset;
  var normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? {
    mainAxis: tetherOffsetValue,
    altAxis: tetherOffsetValue
  } : Object.assign({
    mainAxis: 0,
    altAxis: 0
  }, tetherOffsetValue);
  var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
  var data = {
    x: 0,
    y: 0
  };

  if (!popperOffsets) {
    return;
  }

  if (checkMainAxis) {
    var _offsetModifierState$;

    var mainSide = mainAxis === 'y' ? top : left;
    var altSide = mainAxis === 'y' ? bottom : right;
    var len = mainAxis === 'y' ? 'height' : 'width';
    var offset = popperOffsets[mainAxis];
    var min$1 = offset + overflow[mainSide];
    var max$1 = offset - overflow[altSide];
    var additive = tether ? -popperRect[len] / 2 : 0;
    var minLen = variation === start ? referenceRect[len] : popperRect[len];
    var maxLen = variation === start ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go
    // outside the reference bounds

    var arrowElement = state.elements.arrow;
    var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
      width: 0,
      height: 0
    };
    var arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
    var arrowPaddingMin = arrowPaddingObject[mainSide];
    var arrowPaddingMax = arrowPaddingObject[altSide]; // If the reference length is smaller than the arrow length, we don't want
    // to include its full size in the calculation. If the reference is small
    // and near the edge of a boundary, the popper can overflow even if the
    // reference is not overflowing as well (e.g. virtual elements with no
    // width or height)

    var arrowLen = within(0, referenceRect[len], arrowRect[len]);
    var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
    var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
    var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
    var clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
    var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
    var tetherMin = offset + minOffset - offsetModifierValue - clientOffset;
    var tetherMax = offset + maxOffset - offsetModifierValue;
    var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset, tether ? max(max$1, tetherMax) : max$1);
    popperOffsets[mainAxis] = preventedOffset;
    data[mainAxis] = preventedOffset - offset;
  }

  if (checkAltAxis) {
    var _offsetModifierState$2;

    var _mainSide = mainAxis === 'x' ? top : left;

    var _altSide = mainAxis === 'x' ? bottom : right;

    var _offset = popperOffsets[altAxis];

    var _len = altAxis === 'y' ? 'height' : 'width';

    var _min = _offset + overflow[_mainSide];

    var _max = _offset - overflow[_altSide];

    var isOriginSide = [top, left].indexOf(basePlacement) !== -1;

    var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;

    var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;

    var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;

    var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);

    popperOffsets[altAxis] = _preventedOffset;
    data[altAxis] = _preventedOffset - _offset;
  }

  state.modifiersData[name] = data;
} // eslint-disable-next-line import/no-unused-modules


var preventOverflow$1 = {
  name: 'preventOverflow',
  enabled: true,
  phase: 'main',
  fn: preventOverflow,
  requiresIfExists: ['offset']
};

function getHTMLElementScroll(element) {
  return {
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop
  };
}

function getNodeScroll(node) {
  if (node === getWindow(node) || !isHTMLElement(node)) {
    return getWindowScroll(node);
  } else {
    return getHTMLElementScroll(node);
  }
}

function isElementScaled(element) {
  var rect = element.getBoundingClientRect();
  var scaleX = round(rect.width) / element.offsetWidth || 1;
  var scaleY = round(rect.height) / element.offsetHeight || 1;
  return scaleX !== 1 || scaleY !== 1;
} // Returns the composite rect of an element relative to its offsetParent.
// Composite means it takes into account transforms as well as layout.


function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
  if (isFixed === void 0) {
    isFixed = false;
  }

  var isOffsetParentAnElement = isHTMLElement(offsetParent);
  var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
  var documentElement = getDocumentElement(offsetParent);
  var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled);
  var scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  var offsets = {
    x: 0,
    y: 0
  };

  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || // https://github.com/popperjs/popper-core/issues/1078
    isScrollParent(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }

    if (isHTMLElement(offsetParent)) {
      offsets = getBoundingClientRect(offsetParent, true);
      offsets.x += offsetParent.clientLeft;
      offsets.y += offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }

  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}

function order(modifiers) {
  var map = new Map();
  var visited = new Set();
  var result = [];
  modifiers.forEach(function (modifier) {
    map.set(modifier.name, modifier);
  }); // On visiting object, check for its dependencies and visit them recursively

  function sort(modifier) {
    visited.add(modifier.name);
    var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
    requires.forEach(function (dep) {
      if (!visited.has(dep)) {
        var depModifier = map.get(dep);

        if (depModifier) {
          sort(depModifier);
        }
      }
    });
    result.push(modifier);
  }

  modifiers.forEach(function (modifier) {
    if (!visited.has(modifier.name)) {
      // check for visited object
      sort(modifier);
    }
  });
  return result;
}

function orderModifiers(modifiers) {
  // order based on dependencies
  var orderedModifiers = order(modifiers); // order based on phase

  return modifierPhases.reduce(function (acc, phase) {
    return acc.concat(orderedModifiers.filter(function (modifier) {
      return modifier.phase === phase;
    }));
  }, []);
}

function debounce$1(fn) {
  var pending;
  return function () {
    if (!pending) {
      pending = new Promise(function (resolve) {
        Promise.resolve().then(function () {
          pending = undefined;
          resolve(fn());
        });
      });
    }

    return pending;
  };
}

function format(str) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return [].concat(args).reduce(function (p, c) {
    return p.replace(/%s/, c);
  }, str);
}

var INVALID_MODIFIER_ERROR = 'Popper: modifier "%s" provided an invalid %s property, expected %s but got %s';
var MISSING_DEPENDENCY_ERROR = 'Popper: modifier "%s" requires "%s", but "%s" modifier is not available';
var VALID_PROPERTIES = ['name', 'enabled', 'phase', 'fn', 'effect', 'requires', 'options'];
function validateModifiers(modifiers) {
  modifiers.forEach(function (modifier) {
    [].concat(Object.keys(modifier), VALID_PROPERTIES) // IE11-compatible replacement for `new Set(iterable)`
    .filter(function (value, index, self) {
      return self.indexOf(value) === index;
    }).forEach(function (key) {
      switch (key) {
        case 'name':
          if (typeof modifier.name !== 'string') {
            console.error(format(INVALID_MODIFIER_ERROR, String(modifier.name), '"name"', '"string"', "\"" + String(modifier.name) + "\""));
          }

          break;

        case 'enabled':
          if (typeof modifier.enabled !== 'boolean') {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"enabled"', '"boolean"', "\"" + String(modifier.enabled) + "\""));
          }

          break;

        case 'phase':
          if (modifierPhases.indexOf(modifier.phase) < 0) {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"phase"', "either " + modifierPhases.join(', '), "\"" + String(modifier.phase) + "\""));
          }

          break;

        case 'fn':
          if (typeof modifier.fn !== 'function') {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"fn"', '"function"', "\"" + String(modifier.fn) + "\""));
          }

          break;

        case 'effect':
          if (modifier.effect != null && typeof modifier.effect !== 'function') {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"effect"', '"function"', "\"" + String(modifier.fn) + "\""));
          }

          break;

        case 'requires':
          if (modifier.requires != null && !Array.isArray(modifier.requires)) {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"requires"', '"array"', "\"" + String(modifier.requires) + "\""));
          }

          break;

        case 'requiresIfExists':
          if (!Array.isArray(modifier.requiresIfExists)) {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"requiresIfExists"', '"array"', "\"" + String(modifier.requiresIfExists) + "\""));
          }

          break;

        case 'options':
        case 'data':
          break;

        default:
          console.error("PopperJS: an invalid property has been provided to the \"" + modifier.name + "\" modifier, valid properties are " + VALID_PROPERTIES.map(function (s) {
            return "\"" + s + "\"";
          }).join(', ') + "; but \"" + key + "\" was provided.");
      }

      modifier.requires && modifier.requires.forEach(function (requirement) {
        if (modifiers.find(function (mod) {
          return mod.name === requirement;
        }) == null) {
          console.error(format(MISSING_DEPENDENCY_ERROR, String(modifier.name), requirement, requirement));
        }
      });
    });
  });
}

function uniqueBy(arr, fn) {
  var identifiers = new Set();
  return arr.filter(function (item) {
    var identifier = fn(item);

    if (!identifiers.has(identifier)) {
      identifiers.add(identifier);
      return true;
    }
  });
}

function mergeByName(modifiers) {
  var merged = modifiers.reduce(function (merged, current) {
    var existing = merged[current.name];
    merged[current.name] = existing ? Object.assign({}, existing, current, {
      options: Object.assign({}, existing.options, current.options),
      data: Object.assign({}, existing.data, current.data)
    }) : current;
    return merged;
  }, {}); // IE11 does not support Object.values

  return Object.keys(merged).map(function (key) {
    return merged[key];
  });
}

var INVALID_ELEMENT_ERROR = 'Popper: Invalid reference or popper argument provided. They must be either a DOM element or virtual element.';
var INFINITE_LOOP_ERROR = 'Popper: An infinite loop in the modifiers cycle has been detected! The cycle has been interrupted to prevent a browser crash.';
var DEFAULT_OPTIONS = {
  placement: 'bottom',
  modifiers: [],
  strategy: 'absolute'
};

function areValidElements() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return !args.some(function (element) {
    return !(element && typeof element.getBoundingClientRect === 'function');
  });
}

function popperGenerator(generatorOptions) {
  if (generatorOptions === void 0) {
    generatorOptions = {};
  }

  var _generatorOptions = generatorOptions,
      _generatorOptions$def = _generatorOptions.defaultModifiers,
      defaultModifiers = _generatorOptions$def === void 0 ? [] : _generatorOptions$def,
      _generatorOptions$def2 = _generatorOptions.defaultOptions,
      defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
  return function createPopper(reference, popper, options) {
    if (options === void 0) {
      options = defaultOptions;
    }

    var state = {
      placement: 'bottom',
      orderedModifiers: [],
      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
      modifiersData: {},
      elements: {
        reference: reference,
        popper: popper
      },
      attributes: {},
      styles: {}
    };
    var effectCleanupFns = [];
    var isDestroyed = false;
    var instance = {
      state: state,
      setOptions: function setOptions(setOptionsAction) {
        var options = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
        cleanupModifierEffects();
        state.options = Object.assign({}, defaultOptions, state.options, options);
        state.scrollParents = {
          reference: isElement$1(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
          popper: listScrollParents(popper)
        }; // Orders the modifiers based on their dependencies and `phase`
        // properties

        var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers))); // Strip out disabled modifiers

        state.orderedModifiers = orderedModifiers.filter(function (m) {
          return m.enabled;
        }); // Validate the provided modifiers so that the consumer will get warned
        // if one of the modifiers is invalid for any reason

        {
          var modifiers = uniqueBy([].concat(orderedModifiers, state.options.modifiers), function (_ref) {
            var name = _ref.name;
            return name;
          });
          validateModifiers(modifiers);

          if (getBasePlacement$1(state.options.placement) === auto) {
            var flipModifier = state.orderedModifiers.find(function (_ref2) {
              var name = _ref2.name;
              return name === 'flip';
            });

            if (!flipModifier) {
              console.error(['Popper: "auto" placements require the "flip" modifier be', 'present and enabled to work.'].join(' '));
            }
          }

          var _getComputedStyle = getComputedStyle$1(popper),
              marginTop = _getComputedStyle.marginTop,
              marginRight = _getComputedStyle.marginRight,
              marginBottom = _getComputedStyle.marginBottom,
              marginLeft = _getComputedStyle.marginLeft; // We no longer take into account `margins` on the popper, and it can
          // cause bugs with positioning, so we'll warn the consumer


          if ([marginTop, marginRight, marginBottom, marginLeft].some(function (margin) {
            return parseFloat(margin);
          })) {
            console.warn(['Popper: CSS "margin" styles cannot be used to apply padding', 'between the popper and its reference element or boundary.', 'To replicate margin, use the `offset` modifier, as well as', 'the `padding` option in the `preventOverflow` and `flip`', 'modifiers.'].join(' '));
          }
        }

        runModifierEffects();
        return instance.update();
      },
      // Sync update – it will always be executed, even if not necessary. This
      // is useful for low frequency updates where sync behavior simplifies the
      // logic.
      // For high frequency updates (e.g. `resize` and `scroll` events), always
      // prefer the async Popper#update method
      forceUpdate: function forceUpdate() {
        if (isDestroyed) {
          return;
        }

        var _state$elements = state.elements,
            reference = _state$elements.reference,
            popper = _state$elements.popper; // Don't proceed if `reference` or `popper` are not valid elements
        // anymore

        if (!areValidElements(reference, popper)) {
          {
            console.error(INVALID_ELEMENT_ERROR);
          }

          return;
        } // Store the reference and popper rects to be read by modifiers


        state.rects = {
          reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
          popper: getLayoutRect(popper)
        }; // Modifiers have the ability to reset the current update cycle. The
        // most common use case for this is the `flip` modifier changing the
        // placement, which then needs to re-run all the modifiers, because the
        // logic was previously ran for the previous placement and is therefore
        // stale/incorrect

        state.reset = false;
        state.placement = state.options.placement; // On each update cycle, the `modifiersData` property for each modifier
        // is filled with the initial data specified by the modifier. This means
        // it doesn't persist and is fresh on each update.
        // To ensure persistent data, use `${name}#persistent`

        state.orderedModifiers.forEach(function (modifier) {
          return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
        });
        var __debug_loops__ = 0;

        for (var index = 0; index < state.orderedModifiers.length; index++) {
          {
            __debug_loops__ += 1;

            if (__debug_loops__ > 100) {
              console.error(INFINITE_LOOP_ERROR);
              break;
            }
          }

          if (state.reset === true) {
            state.reset = false;
            index = -1;
            continue;
          }

          var _state$orderedModifie = state.orderedModifiers[index],
              fn = _state$orderedModifie.fn,
              _state$orderedModifie2 = _state$orderedModifie.options,
              _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2,
              name = _state$orderedModifie.name;

          if (typeof fn === 'function') {
            state = fn({
              state: state,
              options: _options,
              name: name,
              instance: instance
            }) || state;
          }
        }
      },
      // Async and optimistically optimized update – it will not be executed if
      // not necessary (debounced to run at most once-per-tick)
      update: debounce$1(function () {
        return new Promise(function (resolve) {
          instance.forceUpdate();
          resolve(state);
        });
      }),
      destroy: function destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };

    if (!areValidElements(reference, popper)) {
      {
        console.error(INVALID_ELEMENT_ERROR);
      }

      return instance;
    }

    instance.setOptions(options).then(function (state) {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state);
      }
    }); // Modifiers have the ability to execute arbitrary code before the first
    // update cycle runs. They will be executed in the same order as the update
    // cycle. This is useful when a modifier adds some persistent data that
    // other modifiers need to use, but the modifier is run after the dependent
    // one.

    function runModifierEffects() {
      state.orderedModifiers.forEach(function (_ref3) {
        var name = _ref3.name,
            _ref3$options = _ref3.options,
            options = _ref3$options === void 0 ? {} : _ref3$options,
            effect = _ref3.effect;

        if (typeof effect === 'function') {
          var cleanupFn = effect({
            state: state,
            name: name,
            instance: instance,
            options: options
          });

          var noopFn = function noopFn() {};

          effectCleanupFns.push(cleanupFn || noopFn);
        }
      });
    }

    function cleanupModifierEffects() {
      effectCleanupFns.forEach(function (fn) {
        return fn();
      });
      effectCleanupFns = [];
    }

    return instance;
  };
}

var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
var createPopper = /*#__PURE__*/popperGenerator({
  defaultModifiers: defaultModifiers
}); // eslint-disable-next-line import/no-unused-modules

/**!
* tippy.js v6.3.7
* (c) 2017-2021 atomiks
* MIT License
*/
var BOX_CLASS = "tippy-box";
var CONTENT_CLASS = "tippy-content";
var BACKDROP_CLASS = "tippy-backdrop";
var ARROW_CLASS = "tippy-arrow";
var SVG_ARROW_CLASS = "tippy-svg-arrow";
var TOUCH_OPTIONS = {
  passive: true,
  capture: true
};
var TIPPY_DEFAULT_APPEND_TO = function TIPPY_DEFAULT_APPEND_TO() {
  return document.body;
};

function hasOwnProperty(obj, key) {
  return {}.hasOwnProperty.call(obj, key);
}
function getValueAtIndexOrReturn(value, index, defaultValue) {
  if (Array.isArray(value)) {
    var v = value[index];
    return v == null ? Array.isArray(defaultValue) ? defaultValue[index] : defaultValue : v;
  }

  return value;
}
function isType(value, type) {
  var str = {}.toString.call(value);
  return str.indexOf('[object') === 0 && str.indexOf(type + "]") > -1;
}
function invokeWithArgsOrReturn(value, args) {
  return typeof value === 'function' ? value.apply(void 0, args) : value;
}
function debounce(fn, ms) {
  // Avoid wrapping in `setTimeout` if ms is 0 anyway
  if (ms === 0) {
    return fn;
  }

  var timeout;
  return function (arg) {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      fn(arg);
    }, ms);
  };
}
function removeProperties(obj, keys) {
  var clone = Object.assign({}, obj);
  keys.forEach(function (key) {
    delete clone[key];
  });
  return clone;
}
function splitBySpaces(value) {
  return value.split(/\s+/).filter(Boolean);
}
function normalizeToArray(value) {
  return [].concat(value);
}
function pushIfUnique(arr, value) {
  if (arr.indexOf(value) === -1) {
    arr.push(value);
  }
}
function unique(arr) {
  return arr.filter(function (item, index) {
    return arr.indexOf(item) === index;
  });
}
function getBasePlacement(placement) {
  return placement.split('-')[0];
}
function arrayFrom(value) {
  return [].slice.call(value);
}
function removeUndefinedProps(obj) {
  return Object.keys(obj).reduce(function (acc, key) {
    if (obj[key] !== undefined) {
      acc[key] = obj[key];
    }

    return acc;
  }, {});
}

function div() {
  return document.createElement('div');
}
function isElement(value) {
  return ['Element', 'Fragment'].some(function (type) {
    return isType(value, type);
  });
}
function isNodeList(value) {
  return isType(value, 'NodeList');
}
function isMouseEvent(value) {
  return isType(value, 'MouseEvent');
}
function isReferenceElement(value) {
  return !!(value && value._tippy && value._tippy.reference === value);
}
function getArrayOfElements(value) {
  if (isElement(value)) {
    return [value];
  }

  if (isNodeList(value)) {
    return arrayFrom(value);
  }

  if (Array.isArray(value)) {
    return value;
  }

  return arrayFrom(document.querySelectorAll(value));
}
function setTransitionDuration(els, value) {
  els.forEach(function (el) {
    if (el) {
      el.style.transitionDuration = value + "ms";
    }
  });
}
function setVisibilityState(els, state) {
  els.forEach(function (el) {
    if (el) {
      el.setAttribute('data-state', state);
    }
  });
}
function getOwnerDocument(elementOrElements) {
  var _element$ownerDocumen;

  var _normalizeToArray = normalizeToArray(elementOrElements),
      element = _normalizeToArray[0]; // Elements created via a <template> have an ownerDocument with no reference to the body


  return element != null && (_element$ownerDocumen = element.ownerDocument) != null && _element$ownerDocumen.body ? element.ownerDocument : document;
}
function isCursorOutsideInteractiveBorder(popperTreeData, event) {
  var clientX = event.clientX,
      clientY = event.clientY;
  return popperTreeData.every(function (_ref) {
    var popperRect = _ref.popperRect,
        popperState = _ref.popperState,
        props = _ref.props;
    var interactiveBorder = props.interactiveBorder;
    var basePlacement = getBasePlacement(popperState.placement);
    var offsetData = popperState.modifiersData.offset;

    if (!offsetData) {
      return true;
    }

    var topDistance = basePlacement === 'bottom' ? offsetData.top.y : 0;
    var bottomDistance = basePlacement === 'top' ? offsetData.bottom.y : 0;
    var leftDistance = basePlacement === 'right' ? offsetData.left.x : 0;
    var rightDistance = basePlacement === 'left' ? offsetData.right.x : 0;
    var exceedsTop = popperRect.top - clientY + topDistance > interactiveBorder;
    var exceedsBottom = clientY - popperRect.bottom - bottomDistance > interactiveBorder;
    var exceedsLeft = popperRect.left - clientX + leftDistance > interactiveBorder;
    var exceedsRight = clientX - popperRect.right - rightDistance > interactiveBorder;
    return exceedsTop || exceedsBottom || exceedsLeft || exceedsRight;
  });
}
function updateTransitionEndListener(box, action, listener) {
  var method = action + "EventListener"; // some browsers apparently support `transition` (unprefixed) but only fire
  // `webkitTransitionEnd`...

  ['transitionend', 'webkitTransitionEnd'].forEach(function (event) {
    box[method](event, listener);
  });
}
/**
 * Compared to xxx.contains, this function works for dom structures with shadow
 * dom
 */

function actualContains(parent, child) {
  var target = child;

  while (target) {
    var _target$getRootNode;

    if (parent.contains(target)) {
      return true;
    }

    target = target.getRootNode == null ? void 0 : (_target$getRootNode = target.getRootNode()) == null ? void 0 : _target$getRootNode.host;
  }

  return false;
}

var currentInput = {
  isTouch: false
};
var lastMouseMoveTime = 0;
/**
 * When a `touchstart` event is fired, it's assumed the user is using touch
 * input. We'll bind a `mousemove` event listener to listen for mouse input in
 * the future. This way, the `isTouch` property is fully dynamic and will handle
 * hybrid devices that use a mix of touch + mouse input.
 */

function onDocumentTouchStart() {
  if (currentInput.isTouch) {
    return;
  }

  currentInput.isTouch = true;

  if (window.performance) {
    document.addEventListener('mousemove', onDocumentMouseMove);
  }
}
/**
 * When two `mousemove` event are fired consecutively within 20ms, it's assumed
 * the user is using mouse input again. `mousemove` can fire on touch devices as
 * well, but very rarely that quickly.
 */

function onDocumentMouseMove() {
  var now = performance.now();

  if (now - lastMouseMoveTime < 20) {
    currentInput.isTouch = false;
    document.removeEventListener('mousemove', onDocumentMouseMove);
  }

  lastMouseMoveTime = now;
}
/**
 * When an element is in focus and has a tippy, leaving the tab/window and
 * returning causes it to show again. For mouse users this is unexpected, but
 * for keyboard use it makes sense.
 * TODO: find a better technique to solve this problem
 */

function onWindowBlur() {
  var activeElement = document.activeElement;

  if (isReferenceElement(activeElement)) {
    var instance = activeElement._tippy;

    if (activeElement.blur && !instance.state.isVisible) {
      activeElement.blur();
    }
  }
}
function bindGlobalEventListeners() {
  document.addEventListener('touchstart', onDocumentTouchStart, TOUCH_OPTIONS);
  window.addEventListener('blur', onWindowBlur);
}

var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
var isIE11 = isBrowser ? // @ts-ignore
!!window.msCrypto : false;

function createMemoryLeakWarning(method) {
  var txt = method === 'destroy' ? 'n already-' : ' ';
  return [method + "() was called on a" + txt + "destroyed instance. This is a no-op but", 'indicates a potential memory leak.'].join(' ');
}
function clean(value) {
  var spacesAndTabs = /[ \t]{2,}/g;
  var lineStartWithSpaces = /^[ \t]*/gm;
  return value.replace(spacesAndTabs, ' ').replace(lineStartWithSpaces, '').trim();
}

function getDevMessage(message) {
  return clean("\n  %ctippy.js\n\n  %c" + clean(message) + "\n\n  %c\uD83D\uDC77\u200D This is a development-only message. It will be removed in production.\n  ");
}

function getFormattedMessage(message) {
  return [getDevMessage(message), // title
  'color: #00C584; font-size: 1.3em; font-weight: bold;', // message
  'line-height: 1.5', // footer
  'color: #a6a095;'];
} // Assume warnings and errors never have the same message

var visitedMessages;

{
  resetVisitedMessages();
}

function resetVisitedMessages() {
  visitedMessages = new Set();
}
function warnWhen(condition, message) {
  if (condition && !visitedMessages.has(message)) {
    var _console;

    visitedMessages.add(message);

    (_console = console).warn.apply(_console, getFormattedMessage(message));
  }
}
function errorWhen(condition, message) {
  if (condition && !visitedMessages.has(message)) {
    var _console2;

    visitedMessages.add(message);

    (_console2 = console).error.apply(_console2, getFormattedMessage(message));
  }
}
function validateTargets(targets) {
  var didPassFalsyValue = !targets;
  var didPassPlainObject = Object.prototype.toString.call(targets) === '[object Object]' && !targets.addEventListener;
  errorWhen(didPassFalsyValue, ['tippy() was passed', '`' + String(targets) + '`', 'as its targets (first) argument. Valid types are: String, Element,', 'Element[], or NodeList.'].join(' '));
  errorWhen(didPassPlainObject, ['tippy() was passed a plain object which is not supported as an argument', 'for virtual positioning. Use props.getReferenceClientRect instead.'].join(' '));
}

var pluginProps = {
  animateFill: false,
  followCursor: false,
  inlinePositioning: false,
  sticky: false
};
var renderProps = {
  allowHTML: false,
  animation: 'fade',
  arrow: true,
  content: '',
  inertia: false,
  maxWidth: 350,
  role: 'tooltip',
  theme: '',
  zIndex: 9999
};
var defaultProps = Object.assign({
  appendTo: TIPPY_DEFAULT_APPEND_TO,
  aria: {
    content: 'auto',
    expanded: 'auto'
  },
  delay: 0,
  duration: [300, 250],
  getReferenceClientRect: null,
  hideOnClick: true,
  ignoreAttributes: false,
  interactive: false,
  interactiveBorder: 2,
  interactiveDebounce: 0,
  moveTransition: '',
  offset: [0, 10],
  onAfterUpdate: function onAfterUpdate() {},
  onBeforeUpdate: function onBeforeUpdate() {},
  onCreate: function onCreate() {},
  onDestroy: function onDestroy() {},
  onHidden: function onHidden() {},
  onHide: function onHide() {},
  onMount: function onMount() {},
  onShow: function onShow() {},
  onShown: function onShown() {},
  onTrigger: function onTrigger() {},
  onUntrigger: function onUntrigger() {},
  onClickOutside: function onClickOutside() {},
  placement: 'top',
  plugins: [],
  popperOptions: {},
  render: null,
  showOnCreate: false,
  touch: true,
  trigger: 'mouseenter focus',
  triggerTarget: null
}, pluginProps, renderProps);
var defaultKeys = Object.keys(defaultProps);
var setDefaultProps = function setDefaultProps(partialProps) {
  /* istanbul ignore else */
  {
    validateProps(partialProps, []);
  }

  var keys = Object.keys(partialProps);
  keys.forEach(function (key) {
    defaultProps[key] = partialProps[key];
  });
};
function getExtendedPassedProps(passedProps) {
  var plugins = passedProps.plugins || [];
  var pluginProps = plugins.reduce(function (acc, plugin) {
    var name = plugin.name,
        defaultValue = plugin.defaultValue;

    if (name) {
      var _name;

      acc[name] = passedProps[name] !== undefined ? passedProps[name] : (_name = defaultProps[name]) != null ? _name : defaultValue;
    }

    return acc;
  }, {});
  return Object.assign({}, passedProps, pluginProps);
}
function getDataAttributeProps(reference, plugins) {
  var propKeys = plugins ? Object.keys(getExtendedPassedProps(Object.assign({}, defaultProps, {
    plugins: plugins
  }))) : defaultKeys;
  var props = propKeys.reduce(function (acc, key) {
    var valueAsString = (reference.getAttribute("data-tippy-" + key) || '').trim();

    if (!valueAsString) {
      return acc;
    }

    if (key === 'content') {
      acc[key] = valueAsString;
    } else {
      try {
        acc[key] = JSON.parse(valueAsString);
      } catch (e) {
        acc[key] = valueAsString;
      }
    }

    return acc;
  }, {});
  return props;
}
function evaluateProps(reference, props) {
  var out = Object.assign({}, props, {
    content: invokeWithArgsOrReturn(props.content, [reference])
  }, props.ignoreAttributes ? {} : getDataAttributeProps(reference, props.plugins));
  out.aria = Object.assign({}, defaultProps.aria, out.aria);
  out.aria = {
    expanded: out.aria.expanded === 'auto' ? props.interactive : out.aria.expanded,
    content: out.aria.content === 'auto' ? props.interactive ? null : 'describedby' : out.aria.content
  };
  return out;
}
function validateProps(partialProps, plugins) {
  if (partialProps === void 0) {
    partialProps = {};
  }

  if (plugins === void 0) {
    plugins = [];
  }

  var keys = Object.keys(partialProps);
  keys.forEach(function (prop) {
    var nonPluginProps = removeProperties(defaultProps, Object.keys(pluginProps));
    var didPassUnknownProp = !hasOwnProperty(nonPluginProps, prop); // Check if the prop exists in `plugins`

    if (didPassUnknownProp) {
      didPassUnknownProp = plugins.filter(function (plugin) {
        return plugin.name === prop;
      }).length === 0;
    }

    warnWhen(didPassUnknownProp, ["`" + prop + "`", "is not a valid prop. You may have spelled it incorrectly, or if it's", 'a plugin, forgot to pass it in an array as props.plugins.', '\n\n', 'All props: https://atomiks.github.io/tippyjs/v6/all-props/\n', 'Plugins: https://atomiks.github.io/tippyjs/v6/plugins/'].join(' '));
  });
}

var innerHTML = function innerHTML() {
  return 'innerHTML';
};

function dangerouslySetInnerHTML(element, html) {
  element[innerHTML()] = html;
}

function createArrowElement(value) {
  var arrow = div();

  if (value === true) {
    arrow.className = ARROW_CLASS;
  } else {
    arrow.className = SVG_ARROW_CLASS;

    if (isElement(value)) {
      arrow.appendChild(value);
    } else {
      dangerouslySetInnerHTML(arrow, value);
    }
  }

  return arrow;
}

function setContent(content, props) {
  if (isElement(props.content)) {
    dangerouslySetInnerHTML(content, '');
    content.appendChild(props.content);
  } else if (typeof props.content !== 'function') {
    if (props.allowHTML) {
      dangerouslySetInnerHTML(content, props.content);
    } else {
      content.textContent = props.content;
    }
  }
}
function getChildren(popper) {
  var box = popper.firstElementChild;
  var boxChildren = arrayFrom(box.children);
  return {
    box: box,
    content: boxChildren.find(function (node) {
      return node.classList.contains(CONTENT_CLASS);
    }),
    arrow: boxChildren.find(function (node) {
      return node.classList.contains(ARROW_CLASS) || node.classList.contains(SVG_ARROW_CLASS);
    }),
    backdrop: boxChildren.find(function (node) {
      return node.classList.contains(BACKDROP_CLASS);
    })
  };
}
function render(instance) {
  var popper = div();
  var box = div();
  box.className = BOX_CLASS;
  box.setAttribute('data-state', 'hidden');
  box.setAttribute('tabindex', '-1');
  var content = div();
  content.className = CONTENT_CLASS;
  content.setAttribute('data-state', 'hidden');
  setContent(content, instance.props);
  popper.appendChild(box);
  box.appendChild(content);
  onUpdate(instance.props, instance.props);

  function onUpdate(prevProps, nextProps) {
    var _getChildren = getChildren(popper),
        box = _getChildren.box,
        content = _getChildren.content,
        arrow = _getChildren.arrow;

    if (nextProps.theme) {
      box.setAttribute('data-theme', nextProps.theme);
    } else {
      box.removeAttribute('data-theme');
    }

    if (typeof nextProps.animation === 'string') {
      box.setAttribute('data-animation', nextProps.animation);
    } else {
      box.removeAttribute('data-animation');
    }

    if (nextProps.inertia) {
      box.setAttribute('data-inertia', '');
    } else {
      box.removeAttribute('data-inertia');
    }

    box.style.maxWidth = typeof nextProps.maxWidth === 'number' ? nextProps.maxWidth + "px" : nextProps.maxWidth;

    if (nextProps.role) {
      box.setAttribute('role', nextProps.role);
    } else {
      box.removeAttribute('role');
    }

    if (prevProps.content !== nextProps.content || prevProps.allowHTML !== nextProps.allowHTML) {
      setContent(content, instance.props);
    }

    if (nextProps.arrow) {
      if (!arrow) {
        box.appendChild(createArrowElement(nextProps.arrow));
      } else if (prevProps.arrow !== nextProps.arrow) {
        box.removeChild(arrow);
        box.appendChild(createArrowElement(nextProps.arrow));
      }
    } else if (arrow) {
      box.removeChild(arrow);
    }
  }

  return {
    popper: popper,
    onUpdate: onUpdate
  };
} // Runtime check to identify if the render function is the default one; this
// way we can apply default CSS transitions logic and it can be tree-shaken away

render.$$tippy = true;

var idCounter = 1;
var mouseMoveListeners = []; // Used by `hideAll()`

var mountedInstances = [];
function createTippy(reference, passedProps) {
  var props = evaluateProps(reference, Object.assign({}, defaultProps, getExtendedPassedProps(removeUndefinedProps(passedProps)))); // ===========================================================================
  // 🔒 Private members
  // ===========================================================================

  var showTimeout;
  var hideTimeout;
  var scheduleHideAnimationFrame;
  var isVisibleFromClick = false;
  var didHideDueToDocumentMouseDown = false;
  var didTouchMove = false;
  var ignoreOnFirstUpdate = false;
  var lastTriggerEvent;
  var currentTransitionEndListener;
  var onFirstUpdate;
  var listeners = [];
  var debouncedOnMouseMove = debounce(onMouseMove, props.interactiveDebounce);
  var currentTarget; // ===========================================================================
  // 🔑 Public members
  // ===========================================================================

  var id = idCounter++;
  var popperInstance = null;
  var plugins = unique(props.plugins);
  var state = {
    // Is the instance currently enabled?
    isEnabled: true,
    // Is the tippy currently showing and not transitioning out?
    isVisible: false,
    // Has the instance been destroyed?
    isDestroyed: false,
    // Is the tippy currently mounted to the DOM?
    isMounted: false,
    // Has the tippy finished transitioning in?
    isShown: false
  };
  var instance = {
    // properties
    id: id,
    reference: reference,
    popper: div(),
    popperInstance: popperInstance,
    props: props,
    state: state,
    plugins: plugins,
    // methods
    clearDelayTimeouts: clearDelayTimeouts,
    setProps: setProps,
    setContent: setContent,
    show: show,
    hide: hide,
    hideWithInteractivity: hideWithInteractivity,
    enable: enable,
    disable: disable,
    unmount: unmount,
    destroy: destroy
  }; // TODO: Investigate why this early return causes a TDZ error in the tests —
  // it doesn't seem to happen in the browser

  /* istanbul ignore if */

  if (!props.render) {
    {
      errorWhen(true, 'render() function has not been supplied.');
    }

    return instance;
  } // ===========================================================================
  // Initial mutations
  // ===========================================================================


  var _props$render = props.render(instance),
      popper = _props$render.popper,
      onUpdate = _props$render.onUpdate;

  popper.setAttribute('data-tippy-root', '');
  popper.id = "tippy-" + instance.id;
  instance.popper = popper;
  reference._tippy = instance;
  popper._tippy = instance;
  var pluginsHooks = plugins.map(function (plugin) {
    return plugin.fn(instance);
  });
  var hasAriaExpanded = reference.hasAttribute('aria-expanded');
  addListeners();
  handleAriaExpandedAttribute();
  handleStyles();
  invokeHook('onCreate', [instance]);

  if (props.showOnCreate) {
    scheduleShow();
  } // Prevent a tippy with a delay from hiding if the cursor left then returned
  // before it started hiding


  popper.addEventListener('mouseenter', function () {
    if (instance.props.interactive && instance.state.isVisible) {
      instance.clearDelayTimeouts();
    }
  });
  popper.addEventListener('mouseleave', function () {
    if (instance.props.interactive && instance.props.trigger.indexOf('mouseenter') >= 0) {
      getDocument().addEventListener('mousemove', debouncedOnMouseMove);
    }
  });
  return instance; // ===========================================================================
  // 🔒 Private methods
  // ===========================================================================

  function getNormalizedTouchSettings() {
    var touch = instance.props.touch;
    return Array.isArray(touch) ? touch : [touch, 0];
  }

  function getIsCustomTouchBehavior() {
    return getNormalizedTouchSettings()[0] === 'hold';
  }

  function getIsDefaultRenderFn() {
    var _instance$props$rende;

    // @ts-ignore
    return !!((_instance$props$rende = instance.props.render) != null && _instance$props$rende.$$tippy);
  }

  function getCurrentTarget() {
    return currentTarget || reference;
  }

  function getDocument() {
    var parent = getCurrentTarget().parentNode;
    return parent ? getOwnerDocument(parent) : document;
  }

  function getDefaultTemplateChildren() {
    return getChildren(popper);
  }

  function getDelay(isShow) {
    // For touch or keyboard input, force `0` delay for UX reasons
    // Also if the instance is mounted but not visible (transitioning out),
    // ignore delay
    if (instance.state.isMounted && !instance.state.isVisible || currentInput.isTouch || lastTriggerEvent && lastTriggerEvent.type === 'focus') {
      return 0;
    }

    return getValueAtIndexOrReturn(instance.props.delay, isShow ? 0 : 1, defaultProps.delay);
  }

  function handleStyles(fromHide) {
    if (fromHide === void 0) {
      fromHide = false;
    }

    popper.style.pointerEvents = instance.props.interactive && !fromHide ? '' : 'none';
    popper.style.zIndex = "" + instance.props.zIndex;
  }

  function invokeHook(hook, args, shouldInvokePropsHook) {
    if (shouldInvokePropsHook === void 0) {
      shouldInvokePropsHook = true;
    }

    pluginsHooks.forEach(function (pluginHooks) {
      if (pluginHooks[hook]) {
        pluginHooks[hook].apply(pluginHooks, args);
      }
    });

    if (shouldInvokePropsHook) {
      var _instance$props;

      (_instance$props = instance.props)[hook].apply(_instance$props, args);
    }
  }

  function handleAriaContentAttribute() {
    var aria = instance.props.aria;

    if (!aria.content) {
      return;
    }

    var attr = "aria-" + aria.content;
    var id = popper.id;
    var nodes = normalizeToArray(instance.props.triggerTarget || reference);
    nodes.forEach(function (node) {
      var currentValue = node.getAttribute(attr);

      if (instance.state.isVisible) {
        node.setAttribute(attr, currentValue ? currentValue + " " + id : id);
      } else {
        var nextValue = currentValue && currentValue.replace(id, '').trim();

        if (nextValue) {
          node.setAttribute(attr, nextValue);
        } else {
          node.removeAttribute(attr);
        }
      }
    });
  }

  function handleAriaExpandedAttribute() {
    if (hasAriaExpanded || !instance.props.aria.expanded) {
      return;
    }

    var nodes = normalizeToArray(instance.props.triggerTarget || reference);
    nodes.forEach(function (node) {
      if (instance.props.interactive) {
        node.setAttribute('aria-expanded', instance.state.isVisible && node === getCurrentTarget() ? 'true' : 'false');
      } else {
        node.removeAttribute('aria-expanded');
      }
    });
  }

  function cleanupInteractiveMouseListeners() {
    getDocument().removeEventListener('mousemove', debouncedOnMouseMove);
    mouseMoveListeners = mouseMoveListeners.filter(function (listener) {
      return listener !== debouncedOnMouseMove;
    });
  }

  function onDocumentPress(event) {
    // Moved finger to scroll instead of an intentional tap outside
    if (currentInput.isTouch) {
      if (didTouchMove || event.type === 'mousedown') {
        return;
      }
    }

    var actualTarget = event.composedPath && event.composedPath()[0] || event.target; // Clicked on interactive popper

    if (instance.props.interactive && actualContains(popper, actualTarget)) {
      return;
    } // Clicked on the event listeners target


    if (normalizeToArray(instance.props.triggerTarget || reference).some(function (el) {
      return actualContains(el, actualTarget);
    })) {
      if (currentInput.isTouch) {
        return;
      }

      if (instance.state.isVisible && instance.props.trigger.indexOf('click') >= 0) {
        return;
      }
    } else {
      invokeHook('onClickOutside', [instance, event]);
    }

    if (instance.props.hideOnClick === true) {
      instance.clearDelayTimeouts();
      instance.hide(); // `mousedown` event is fired right before `focus` if pressing the
      // currentTarget. This lets a tippy with `focus` trigger know that it
      // should not show

      didHideDueToDocumentMouseDown = true;
      setTimeout(function () {
        didHideDueToDocumentMouseDown = false;
      }); // The listener gets added in `scheduleShow()`, but this may be hiding it
      // before it shows, and hide()'s early bail-out behavior can prevent it
      // from being cleaned up

      if (!instance.state.isMounted) {
        removeDocumentPress();
      }
    }
  }

  function onTouchMove() {
    didTouchMove = true;
  }

  function onTouchStart() {
    didTouchMove = false;
  }

  function addDocumentPress() {
    var doc = getDocument();
    doc.addEventListener('mousedown', onDocumentPress, true);
    doc.addEventListener('touchend', onDocumentPress, TOUCH_OPTIONS);
    doc.addEventListener('touchstart', onTouchStart, TOUCH_OPTIONS);
    doc.addEventListener('touchmove', onTouchMove, TOUCH_OPTIONS);
  }

  function removeDocumentPress() {
    var doc = getDocument();
    doc.removeEventListener('mousedown', onDocumentPress, true);
    doc.removeEventListener('touchend', onDocumentPress, TOUCH_OPTIONS);
    doc.removeEventListener('touchstart', onTouchStart, TOUCH_OPTIONS);
    doc.removeEventListener('touchmove', onTouchMove, TOUCH_OPTIONS);
  }

  function onTransitionedOut(duration, callback) {
    onTransitionEnd(duration, function () {
      if (!instance.state.isVisible && popper.parentNode && popper.parentNode.contains(popper)) {
        callback();
      }
    });
  }

  function onTransitionedIn(duration, callback) {
    onTransitionEnd(duration, callback);
  }

  function onTransitionEnd(duration, callback) {
    var box = getDefaultTemplateChildren().box;

    function listener(event) {
      if (event.target === box) {
        updateTransitionEndListener(box, 'remove', listener);
        callback();
      }
    } // Make callback synchronous if duration is 0
    // `transitionend` won't fire otherwise


    if (duration === 0) {
      return callback();
    }

    updateTransitionEndListener(box, 'remove', currentTransitionEndListener);
    updateTransitionEndListener(box, 'add', listener);
    currentTransitionEndListener = listener;
  }

  function on(eventType, handler, options) {
    if (options === void 0) {
      options = false;
    }

    var nodes = normalizeToArray(instance.props.triggerTarget || reference);
    nodes.forEach(function (node) {
      node.addEventListener(eventType, handler, options);
      listeners.push({
        node: node,
        eventType: eventType,
        handler: handler,
        options: options
      });
    });
  }

  function addListeners() {
    if (getIsCustomTouchBehavior()) {
      on('touchstart', onTrigger, {
        passive: true
      });
      on('touchend', onMouseLeave, {
        passive: true
      });
    }

    splitBySpaces(instance.props.trigger).forEach(function (eventType) {
      if (eventType === 'manual') {
        return;
      }

      on(eventType, onTrigger);

      switch (eventType) {
        case 'mouseenter':
          on('mouseleave', onMouseLeave);
          break;

        case 'focus':
          on(isIE11 ? 'focusout' : 'blur', onBlurOrFocusOut);
          break;

        case 'focusin':
          on('focusout', onBlurOrFocusOut);
          break;
      }
    });
  }

  function removeListeners() {
    listeners.forEach(function (_ref) {
      var node = _ref.node,
          eventType = _ref.eventType,
          handler = _ref.handler,
          options = _ref.options;
      node.removeEventListener(eventType, handler, options);
    });
    listeners = [];
  }

  function onTrigger(event) {
    var _lastTriggerEvent;

    var shouldScheduleClickHide = false;

    if (!instance.state.isEnabled || isEventListenerStopped(event) || didHideDueToDocumentMouseDown) {
      return;
    }

    var wasFocused = ((_lastTriggerEvent = lastTriggerEvent) == null ? void 0 : _lastTriggerEvent.type) === 'focus';
    lastTriggerEvent = event;
    currentTarget = event.currentTarget;
    handleAriaExpandedAttribute();

    if (!instance.state.isVisible && isMouseEvent(event)) {
      // If scrolling, `mouseenter` events can be fired if the cursor lands
      // over a new target, but `mousemove` events don't get fired. This
      // causes interactive tooltips to get stuck open until the cursor is
      // moved
      mouseMoveListeners.forEach(function (listener) {
        return listener(event);
      });
    } // Toggle show/hide when clicking click-triggered tooltips


    if (event.type === 'click' && (instance.props.trigger.indexOf('mouseenter') < 0 || isVisibleFromClick) && instance.props.hideOnClick !== false && instance.state.isVisible) {
      shouldScheduleClickHide = true;
    } else {
      scheduleShow(event);
    }

    if (event.type === 'click') {
      isVisibleFromClick = !shouldScheduleClickHide;
    }

    if (shouldScheduleClickHide && !wasFocused) {
      scheduleHide(event);
    }
  }

  function onMouseMove(event) {
    var target = event.target;
    var isCursorOverReferenceOrPopper = getCurrentTarget().contains(target) || popper.contains(target);

    if (event.type === 'mousemove' && isCursorOverReferenceOrPopper) {
      return;
    }

    var popperTreeData = getNestedPopperTree().concat(popper).map(function (popper) {
      var _instance$popperInsta;

      var instance = popper._tippy;
      var state = (_instance$popperInsta = instance.popperInstance) == null ? void 0 : _instance$popperInsta.state;

      if (state) {
        return {
          popperRect: popper.getBoundingClientRect(),
          popperState: state,
          props: props
        };
      }

      return null;
    }).filter(Boolean);

    if (isCursorOutsideInteractiveBorder(popperTreeData, event)) {
      cleanupInteractiveMouseListeners();
      scheduleHide(event);
    }
  }

  function onMouseLeave(event) {
    var shouldBail = isEventListenerStopped(event) || instance.props.trigger.indexOf('click') >= 0 && isVisibleFromClick;

    if (shouldBail) {
      return;
    }

    if (instance.props.interactive) {
      instance.hideWithInteractivity(event);
      return;
    }

    scheduleHide(event);
  }

  function onBlurOrFocusOut(event) {
    if (instance.props.trigger.indexOf('focusin') < 0 && event.target !== getCurrentTarget()) {
      return;
    } // If focus was moved to within the popper


    if (instance.props.interactive && event.relatedTarget && popper.contains(event.relatedTarget)) {
      return;
    }

    scheduleHide(event);
  }

  function isEventListenerStopped(event) {
    return currentInput.isTouch ? getIsCustomTouchBehavior() !== event.type.indexOf('touch') >= 0 : false;
  }

  function createPopperInstance() {
    destroyPopperInstance();
    var _instance$props2 = instance.props,
        popperOptions = _instance$props2.popperOptions,
        placement = _instance$props2.placement,
        offset = _instance$props2.offset,
        getReferenceClientRect = _instance$props2.getReferenceClientRect,
        moveTransition = _instance$props2.moveTransition;
    var arrow = getIsDefaultRenderFn() ? getChildren(popper).arrow : null;
    var computedReference = getReferenceClientRect ? {
      getBoundingClientRect: getReferenceClientRect,
      contextElement: getReferenceClientRect.contextElement || getCurrentTarget()
    } : reference;
    var tippyModifier = {
      name: '$$tippy',
      enabled: true,
      phase: 'beforeWrite',
      requires: ['computeStyles'],
      fn: function fn(_ref2) {
        var state = _ref2.state;

        if (getIsDefaultRenderFn()) {
          var _getDefaultTemplateCh = getDefaultTemplateChildren(),
              box = _getDefaultTemplateCh.box;

          ['placement', 'reference-hidden', 'escaped'].forEach(function (attr) {
            if (attr === 'placement') {
              box.setAttribute('data-placement', state.placement);
            } else {
              if (state.attributes.popper["data-popper-" + attr]) {
                box.setAttribute("data-" + attr, '');
              } else {
                box.removeAttribute("data-" + attr);
              }
            }
          });
          state.attributes.popper = {};
        }
      }
    };
    var modifiers = [{
      name: 'offset',
      options: {
        offset: offset
      }
    }, {
      name: 'preventOverflow',
      options: {
        padding: {
          top: 2,
          bottom: 2,
          left: 5,
          right: 5
        }
      }
    }, {
      name: 'flip',
      options: {
        padding: 5
      }
    }, {
      name: 'computeStyles',
      options: {
        adaptive: !moveTransition
      }
    }, tippyModifier];

    if (getIsDefaultRenderFn() && arrow) {
      modifiers.push({
        name: 'arrow',
        options: {
          element: arrow,
          padding: 3
        }
      });
    }

    modifiers.push.apply(modifiers, (popperOptions == null ? void 0 : popperOptions.modifiers) || []);
    instance.popperInstance = createPopper(computedReference, popper, Object.assign({}, popperOptions, {
      placement: placement,
      onFirstUpdate: onFirstUpdate,
      modifiers: modifiers
    }));
  }

  function destroyPopperInstance() {
    if (instance.popperInstance) {
      instance.popperInstance.destroy();
      instance.popperInstance = null;
    }
  }

  function mount() {
    var appendTo = instance.props.appendTo;
    var parentNode; // By default, we'll append the popper to the triggerTargets's parentNode so
    // it's directly after the reference element so the elements inside the
    // tippy can be tabbed to
    // If there are clipping issues, the user can specify a different appendTo
    // and ensure focus management is handled correctly manually

    var node = getCurrentTarget();

    if (instance.props.interactive && appendTo === TIPPY_DEFAULT_APPEND_TO || appendTo === 'parent') {
      parentNode = node.parentNode;
    } else {
      parentNode = invokeWithArgsOrReturn(appendTo, [node]);
    } // The popper element needs to exist on the DOM before its position can be
    // updated as Popper needs to read its dimensions


    if (!parentNode.contains(popper)) {
      parentNode.appendChild(popper);
    }

    instance.state.isMounted = true;
    createPopperInstance();
    /* istanbul ignore else */

    {
      // Accessibility check
      warnWhen(instance.props.interactive && appendTo === defaultProps.appendTo && node.nextElementSibling !== popper, ['Interactive tippy element may not be accessible via keyboard', 'navigation because it is not directly after the reference element', 'in the DOM source order.', '\n\n', 'Using a wrapper <div> or <span> tag around the reference element', 'solves this by creating a new parentNode context.', '\n\n', 'Specifying `appendTo: document.body` silences this warning, but it', 'assumes you are using a focus management solution to handle', 'keyboard navigation.', '\n\n', 'See: https://atomiks.github.io/tippyjs/v6/accessibility/#interactivity'].join(' '));
    }
  }

  function getNestedPopperTree() {
    return arrayFrom(popper.querySelectorAll('[data-tippy-root]'));
  }

  function scheduleShow(event) {
    instance.clearDelayTimeouts();

    if (event) {
      invokeHook('onTrigger', [instance, event]);
    }

    addDocumentPress();
    var delay = getDelay(true);

    var _getNormalizedTouchSe = getNormalizedTouchSettings(),
        touchValue = _getNormalizedTouchSe[0],
        touchDelay = _getNormalizedTouchSe[1];

    if (currentInput.isTouch && touchValue === 'hold' && touchDelay) {
      delay = touchDelay;
    }

    if (delay) {
      showTimeout = setTimeout(function () {
        instance.show();
      }, delay);
    } else {
      instance.show();
    }
  }

  function scheduleHide(event) {
    instance.clearDelayTimeouts();
    invokeHook('onUntrigger', [instance, event]);

    if (!instance.state.isVisible) {
      removeDocumentPress();
      return;
    } // For interactive tippies, scheduleHide is added to a document.body handler
    // from onMouseLeave so must intercept scheduled hides from mousemove/leave
    // events when trigger contains mouseenter and click, and the tip is
    // currently shown as a result of a click.


    if (instance.props.trigger.indexOf('mouseenter') >= 0 && instance.props.trigger.indexOf('click') >= 0 && ['mouseleave', 'mousemove'].indexOf(event.type) >= 0 && isVisibleFromClick) {
      return;
    }

    var delay = getDelay(false);

    if (delay) {
      hideTimeout = setTimeout(function () {
        if (instance.state.isVisible) {
          instance.hide();
        }
      }, delay);
    } else {
      // Fixes a `transitionend` problem when it fires 1 frame too
      // late sometimes, we don't want hide() to be called.
      scheduleHideAnimationFrame = requestAnimationFrame(function () {
        instance.hide();
      });
    }
  } // ===========================================================================
  // 🔑 Public methods
  // ===========================================================================


  function enable() {
    instance.state.isEnabled = true;
  }

  function disable() {
    // Disabling the instance should also hide it
    // https://github.com/atomiks/tippy.js-react/issues/106
    instance.hide();
    instance.state.isEnabled = false;
  }

  function clearDelayTimeouts() {
    clearTimeout(showTimeout);
    clearTimeout(hideTimeout);
    cancelAnimationFrame(scheduleHideAnimationFrame);
  }

  function setProps(partialProps) {
    /* istanbul ignore else */
    {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('setProps'));
    }

    if (instance.state.isDestroyed) {
      return;
    }

    invokeHook('onBeforeUpdate', [instance, partialProps]);
    removeListeners();
    var prevProps = instance.props;
    var nextProps = evaluateProps(reference, Object.assign({}, prevProps, removeUndefinedProps(partialProps), {
      ignoreAttributes: true
    }));
    instance.props = nextProps;
    addListeners();

    if (prevProps.interactiveDebounce !== nextProps.interactiveDebounce) {
      cleanupInteractiveMouseListeners();
      debouncedOnMouseMove = debounce(onMouseMove, nextProps.interactiveDebounce);
    } // Ensure stale aria-expanded attributes are removed


    if (prevProps.triggerTarget && !nextProps.triggerTarget) {
      normalizeToArray(prevProps.triggerTarget).forEach(function (node) {
        node.removeAttribute('aria-expanded');
      });
    } else if (nextProps.triggerTarget) {
      reference.removeAttribute('aria-expanded');
    }

    handleAriaExpandedAttribute();
    handleStyles();

    if (onUpdate) {
      onUpdate(prevProps, nextProps);
    }

    if (instance.popperInstance) {
      createPopperInstance(); // Fixes an issue with nested tippies if they are all getting re-rendered,
      // and the nested ones get re-rendered first.
      // https://github.com/atomiks/tippyjs-react/issues/177
      // TODO: find a cleaner / more efficient solution(!)

      getNestedPopperTree().forEach(function (nestedPopper) {
        // React (and other UI libs likely) requires a rAF wrapper as it flushes
        // its work in one
        requestAnimationFrame(nestedPopper._tippy.popperInstance.forceUpdate);
      });
    }

    invokeHook('onAfterUpdate', [instance, partialProps]);
  }

  function setContent(content) {
    instance.setProps({
      content: content
    });
  }

  function show() {
    /* istanbul ignore else */
    {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('show'));
    } // Early bail-out


    var isAlreadyVisible = instance.state.isVisible;
    var isDestroyed = instance.state.isDestroyed;
    var isDisabled = !instance.state.isEnabled;
    var isTouchAndTouchDisabled = currentInput.isTouch && !instance.props.touch;
    var duration = getValueAtIndexOrReturn(instance.props.duration, 0, defaultProps.duration);

    if (isAlreadyVisible || isDestroyed || isDisabled || isTouchAndTouchDisabled) {
      return;
    } // Normalize `disabled` behavior across browsers.
    // Firefox allows events on disabled elements, but Chrome doesn't.
    // Using a wrapper element (i.e. <span>) is recommended.


    if (getCurrentTarget().hasAttribute('disabled')) {
      return;
    }

    invokeHook('onShow', [instance], false);

    if (instance.props.onShow(instance) === false) {
      return;
    }

    instance.state.isVisible = true;

    if (getIsDefaultRenderFn()) {
      popper.style.visibility = 'visible';
    }

    handleStyles();
    addDocumentPress();

    if (!instance.state.isMounted) {
      popper.style.transition = 'none';
    } // If flipping to the opposite side after hiding at least once, the
    // animation will use the wrong placement without resetting the duration


    if (getIsDefaultRenderFn()) {
      var _getDefaultTemplateCh2 = getDefaultTemplateChildren(),
          box = _getDefaultTemplateCh2.box,
          content = _getDefaultTemplateCh2.content;

      setTransitionDuration([box, content], 0);
    }

    onFirstUpdate = function onFirstUpdate() {
      var _instance$popperInsta2;

      if (!instance.state.isVisible || ignoreOnFirstUpdate) {
        return;
      }

      ignoreOnFirstUpdate = true; // reflow

      void popper.offsetHeight;
      popper.style.transition = instance.props.moveTransition;

      if (getIsDefaultRenderFn() && instance.props.animation) {
        var _getDefaultTemplateCh3 = getDefaultTemplateChildren(),
            _box = _getDefaultTemplateCh3.box,
            _content = _getDefaultTemplateCh3.content;

        setTransitionDuration([_box, _content], duration);
        setVisibilityState([_box, _content], 'visible');
      }

      handleAriaContentAttribute();
      handleAriaExpandedAttribute();
      pushIfUnique(mountedInstances, instance); // certain modifiers (e.g. `maxSize`) require a second update after the
      // popper has been positioned for the first time

      (_instance$popperInsta2 = instance.popperInstance) == null ? void 0 : _instance$popperInsta2.forceUpdate();
      invokeHook('onMount', [instance]);

      if (instance.props.animation && getIsDefaultRenderFn()) {
        onTransitionedIn(duration, function () {
          instance.state.isShown = true;
          invokeHook('onShown', [instance]);
        });
      }
    };

    mount();
  }

  function hide() {
    /* istanbul ignore else */
    {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('hide'));
    } // Early bail-out


    var isAlreadyHidden = !instance.state.isVisible;
    var isDestroyed = instance.state.isDestroyed;
    var isDisabled = !instance.state.isEnabled;
    var duration = getValueAtIndexOrReturn(instance.props.duration, 1, defaultProps.duration);

    if (isAlreadyHidden || isDestroyed || isDisabled) {
      return;
    }

    invokeHook('onHide', [instance], false);

    if (instance.props.onHide(instance) === false) {
      return;
    }

    instance.state.isVisible = false;
    instance.state.isShown = false;
    ignoreOnFirstUpdate = false;
    isVisibleFromClick = false;

    if (getIsDefaultRenderFn()) {
      popper.style.visibility = 'hidden';
    }

    cleanupInteractiveMouseListeners();
    removeDocumentPress();
    handleStyles(true);

    if (getIsDefaultRenderFn()) {
      var _getDefaultTemplateCh4 = getDefaultTemplateChildren(),
          box = _getDefaultTemplateCh4.box,
          content = _getDefaultTemplateCh4.content;

      if (instance.props.animation) {
        setTransitionDuration([box, content], duration);
        setVisibilityState([box, content], 'hidden');
      }
    }

    handleAriaContentAttribute();
    handleAriaExpandedAttribute();

    if (instance.props.animation) {
      if (getIsDefaultRenderFn()) {
        onTransitionedOut(duration, instance.unmount);
      }
    } else {
      instance.unmount();
    }
  }

  function hideWithInteractivity(event) {
    /* istanbul ignore else */
    {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('hideWithInteractivity'));
    }

    getDocument().addEventListener('mousemove', debouncedOnMouseMove);
    pushIfUnique(mouseMoveListeners, debouncedOnMouseMove);
    debouncedOnMouseMove(event);
  }

  function unmount() {
    /* istanbul ignore else */
    {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('unmount'));
    }

    if (instance.state.isVisible) {
      instance.hide();
    }

    if (!instance.state.isMounted) {
      return;
    }

    destroyPopperInstance(); // If a popper is not interactive, it will be appended outside the popper
    // tree by default. This seems mainly for interactive tippies, but we should
    // find a workaround if possible

    getNestedPopperTree().forEach(function (nestedPopper) {
      nestedPopper._tippy.unmount();
    });

    if (popper.parentNode) {
      popper.parentNode.removeChild(popper);
    }

    mountedInstances = mountedInstances.filter(function (i) {
      return i !== instance;
    });
    instance.state.isMounted = false;
    invokeHook('onHidden', [instance]);
  }

  function destroy() {
    /* istanbul ignore else */
    {
      warnWhen(instance.state.isDestroyed, createMemoryLeakWarning('destroy'));
    }

    if (instance.state.isDestroyed) {
      return;
    }

    instance.clearDelayTimeouts();
    instance.unmount();
    removeListeners();
    delete reference._tippy;
    instance.state.isDestroyed = true;
    invokeHook('onDestroy', [instance]);
  }
}

function tippy(targets, optionalProps) {
  if (optionalProps === void 0) {
    optionalProps = {};
  }

  var plugins = defaultProps.plugins.concat(optionalProps.plugins || []);
  /* istanbul ignore else */

  {
    validateTargets(targets);
    validateProps(optionalProps, plugins);
  }

  bindGlobalEventListeners();
  var passedProps = Object.assign({}, optionalProps, {
    plugins: plugins
  });
  var elements = getArrayOfElements(targets);
  /* istanbul ignore else */

  {
    var isSingleContentElement = isElement(passedProps.content);
    var isMoreThanOneReferenceElement = elements.length > 1;
    warnWhen(isSingleContentElement && isMoreThanOneReferenceElement, ['tippy() was passed an Element as the `content` prop, but more than', 'one tippy instance was created by this invocation. This means the', 'content element will only be appended to the last tippy instance.', '\n\n', 'Instead, pass the .innerHTML of the element, or use a function that', 'returns a cloned version of the element instead.', '\n\n', '1) content: element.innerHTML\n', '2) content: () => element.cloneNode(true)'].join(' '));
  }

  var instances = elements.reduce(function (acc, reference) {
    var instance = reference && createTippy(reference, passedProps);

    if (instance) {
      acc.push(instance);
    }

    return acc;
  }, []);
  return isElement(targets) ? instances[0] : instances;
}

tippy.defaultProps = defaultProps;
tippy.setDefaultProps = setDefaultProps;
tippy.currentInput = currentInput;

// every time the popper is destroyed (i.e. a new target), removing the styles
// and causing transitions to break for singletons when the console is open, but
// most notably for non-transform styles being used, `gpuAcceleration: false`.

Object.assign({}, applyStyles$1, {
  effect: function effect(_ref) {
    var state = _ref.state;
    var initialStyles = {
      popper: {
        position: state.options.strategy,
        left: '0',
        top: '0',
        margin: '0'
      },
      arrow: {
        position: 'absolute'
      },
      reference: {}
    };
    Object.assign(state.elements.popper.style, initialStyles.popper);
    state.styles = initialStyles;

    if (state.elements.arrow) {
      Object.assign(state.elements.arrow.style, initialStyles.arrow);
    } // intentionally return no cleanup function
    // return () => { ... }

  }
});

tippy.setDefaultProps({
  render: render
});

/* src\FileItem.svelte generated by Svelte v3.35.0 */
const file_1 = "src\\FileItem.svelte";

// (84:0) {#if file}
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
	let mounted;
	let dispose;
	let if_block0 = /*$showFileSize*/ ctx[2] && create_if_block_3$1(ctx);
	let if_block1 = /*$showFileType*/ ctx[3] && create_if_block_2$2(ctx);
	let if_block2 = /*$showFileName*/ ctx[4] && create_if_block_1$3(ctx);

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
			add_location(img, file_1, 87, 6, 1961);
			attr_dev(div0, "class", "tags svelte-1tzh62p");
			add_location(div0, file_1, 88, 6, 2065);
			attr_dev(div1, "class", "pixxioSquare svelte-1tzh62p");
			toggle_class(div1, "pixxioSquare--active", /*file*/ ctx[0].selected);
			add_location(div1, file_1, 86, 4, 1884);
			attr_dev(figure, "class", "svelte-1tzh62p");
			add_location(figure, file_1, 85, 2, 1870);
			attr_dev(li, "class", "svelte-1tzh62p");
			add_location(li, file_1, 84, 0, 1829);
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
				dispose = listen_dev(li, "click", /*click_handler*/ ctx[9], false, false, false);
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

			if (/*$showFileSize*/ ctx[2]) {
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

			if (/*$showFileType*/ ctx[3]) {
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

			if (/*$showFileName*/ ctx[4]) {
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
		source: "(84:0) {#if file}",
		ctx
	});

	return block;
}

// (90:8) {#if $showFileSize}
function create_if_block_3$1(ctx) {
	let div;
	let t_value = /*readableSize*/ ctx[6](/*file*/ ctx[0].fileSize) + "";
	let t;

	const block = {
		c: function create() {
			div = element("div");
			t = text(t_value);
			attr_dev(div, "class", "tag svelte-1tzh62p");
			add_location(div, file_1, 90, 8, 2122);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*file*/ 1 && t_value !== (t_value = /*readableSize*/ ctx[6](/*file*/ ctx[0].fileSize) + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_3$1.name,
		type: "if",
		source: "(90:8) {#if $showFileSize}",
		ctx
	});

	return block;
}

// (93:8) {#if $showFileType}
function create_if_block_2$2(ctx) {
	let div;
	let t_value = /*file*/ ctx[0].fileExtension + "";
	let t;

	const block = {
		c: function create() {
			div = element("div");
			t = text(t_value);
			attr_dev(div, "class", "tag svelte-1tzh62p");
			add_location(div, file_1, 93, 8, 2228);
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
		source: "(93:8) {#if $showFileType}",
		ctx
	});

	return block;
}

// (98:4) {#if $showFileName}
function create_if_block_1$3(ctx) {
	let figcaption;
	let t_value = /*file*/ ctx[0].fileName + "";
	let t;

	const block = {
		c: function create() {
			figcaption = element("figcaption");
			t = text(t_value);
			attr_dev(figcaption, "class", "svelte-1tzh62p");
			add_location(figcaption, file_1, 98, 4, 2343);
		},
		m: function mount(target, anchor) {
			insert_dev(target, figcaption, anchor);
			append_dev(figcaption, t);
			/*figcaption_binding*/ ctx[8](figcaption);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*file*/ 1 && t_value !== (t_value = /*file*/ ctx[0].fileName + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(figcaption);
			/*figcaption_binding*/ ctx[8](null);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$3.name,
		type: "if",
		source: "(98:4) {#if $showFileName}",
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
	component_subscribe($$self, maxFiles, $$value => $$invalidate(13, $maxFiles = $$value));
	validate_store(showFileSize, "showFileSize");
	component_subscribe($$self, showFileSize, $$value => $$invalidate(2, $showFileSize = $$value));
	validate_store(showFileType, "showFileType");
	component_subscribe($$self, showFileType, $$value => $$invalidate(3, $showFileType = $$value));
	validate_store(showFileName, "showFileName");
	component_subscribe($$self, showFileName, $$value => $$invalidate(4, $showFileName = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("FileItem", slots, []);
	let { file = null } = $$props;
	let { selected = false } = $$props;
	let tooltipElement = null;
	let tippyInstance = null;
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

	const createTippy = () => {
		if (tooltipElement) {
			destroyTippy();
			tippyInstance = tippy(tooltipElement, { content: file.fileName, arrow: false });
		}
	};

	const destroyTippy = () => {
		if (tippyInstance) {
			tippyInstance.destroy();
		}
	};

	onDestroy(() => destroyTippy());
	const writable_props = ["file", "selected"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FileItem> was created with unknown prop '${key}'`);
	});

	function figcaption_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			tooltipElement = $$value;
			$$invalidate(1, tooltipElement);
		});
	}

	const click_handler = () => clickProvider();

	$$self.$$set = $$props => {
		if ("file" in $$props) $$invalidate(0, file = $$props.file);
		if ("selected" in $$props) $$invalidate(7, selected = $$props.selected);
	};

	$$self.$capture_state = () => ({
		tippy,
		createEventDispatcher,
		onDestroy,
		showFileSize,
		showFileType,
		showFileName,
		maxFiles,
		file,
		selected,
		tooltipElement,
		tippyInstance,
		dispatch,
		lastClick,
		clickTimeout,
		clickProvider,
		select,
		selectAndClose,
		readableSize,
		createTippy,
		destroyTippy,
		$maxFiles,
		$showFileSize,
		$showFileType,
		$showFileName
	});

	$$self.$inject_state = $$props => {
		if ("file" in $$props) $$invalidate(0, file = $$props.file);
		if ("selected" in $$props) $$invalidate(7, selected = $$props.selected);
		if ("tooltipElement" in $$props) $$invalidate(1, tooltipElement = $$props.tooltipElement);
		if ("tippyInstance" in $$props) tippyInstance = $$props.tippyInstance;
		if ("lastClick" in $$props) lastClick = $$props.lastClick;
		if ("clickTimeout" in $$props) clickTimeout = $$props.clickTimeout;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*file*/ 1) {
			if (file) {
				createTippy();
			}
		}
	};

	return [
		file,
		tooltipElement,
		$showFileSize,
		$showFileType,
		$showFileName,
		clickProvider,
		readableSize,
		selected,
		figcaption_binding,
		click_handler
	];
}

class FileItem extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$5, create_fragment$5, safe_not_equal, { file: 0, selected: 7 });

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

/* src\Error.svelte generated by Svelte v3.35.0 */

const { Error: Error_1$2 } = globals;
const file$4 = "src\\Error.svelte";

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

/* src\Files.svelte generated by Svelte v3.35.0 */

const { Error: Error_1$1, console: console_1$1 } = globals;
const file$3 = "src\\Files.svelte";

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[34] = list[i];
	child_ctx[35] = list;
	child_ctx[36] = i;
	return child_ctx;
}

// (260:4) {:catch}
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
		source: "(260:4) {:catch}",
		ctx
	});

	return block;
}

// (236:4) {:then}
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
			add_location(ul, file$3, 238, 6, 6257);
			attr_dev(section, "class", "pixxioFiles__container svelte-wpisvp");
			toggle_class(section, "pixxioFiles__container--maxReached", /*maxReached*/ ctx[6]);
			add_location(section, file$3, 237, 4, 6132);
			set_style(span, "flex-grow", "1");
			add_location(span, file$3, 253, 8, 6982);
			attr_dev(button, "class", "button svelte-wpisvp");
			attr_dev(button, "type", "submit");
			button.disabled = button_disabled_value = !/*valid*/ ctx[7] || /*isLoading*/ ctx[5];
			add_location(button, file$3, 255, 8, 7071);
			attr_dev(div0, "class", "buttonGroup buttonGroup--right svelte-wpisvp");
			add_location(div0, file$3, 245, 6, 6537);
			attr_dev(div1, "class", "svelte-wpisvp");
			toggle_class(div1, "compact", /*$compact*/ ctx[9]);
			add_location(div1, file$3, 244, 4, 6499);
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
		source: "(236:4) {:then}",
		ctx
	});

	return block;
}

// (240:8) {#each files as file}
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
		source: "(240:8) {#each files as file}",
		ctx
	});

	return block;
}

// (247:8) {#if $maxFiles > 0}
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
			add_location(strong, file$3, 247, 71, 6683);
			set_style(p, "white-space", "nowrap");
			set_style(p, "padding", "0 10px 0 0");
			set_style(p, "margin", "0");
			add_location(p, file$3, 247, 8, 6620);
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
		source: "(247:8) {#if $maxFiles > 0}",
		ctx
	});

	return block;
}

// (251:8) {#if $showSelection && !$compact}
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
		source: "(251:8) {#if $showSelection && !$compact}",
		ctx
	});

	return block;
}

// (234:21)         <Loading></Loading>      {:then}
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
		source: "(234:21)         <Loading></Loading>      {:then}",
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
			add_location(div, file$3, 232, 0, 6006);
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
	validate_store(format$1, "format");
	component_subscribe($$self, format$1, $$value => $$invalidate(17, $format = $$value));
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
		console.log("=> submit downloadFormat: ", downloadFormat);
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
		format: format$1,
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

/* src\User.svelte generated by Svelte v3.35.0 */
const file$2 = "src\\User.svelte";

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
			add_location(a0, file$2, 25, 69, 548);
			attr_dev(a1, "href", "#");
			attr_dev(a1, "class", "svelte-a2gk4x");
			add_location(a1, file$2, 25, 128, 607);
			attr_dev(small, "class", "svelte-a2gk4x");
			toggle_class(small, "no-modal", !/*$modal*/ ctx[1]);
			add_location(small, file$2, 25, 0, 479);
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

/* src\Upload.svelte generated by Svelte v3.35.0 */

const { Error: Error_1, Object: Object_1, console: console_1 } = globals;
const file$1 = "src\\Upload.svelte";

// (108:2) {#if loading}
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
		source: "(108:2) {#if loading}",
		ctx
	});

	return block;
}

// (111:2) {#if errorMessage}
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

			if (dirty & /*$$scope, errorMessage*/ 1026) {
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
		source: "(111:2) {#if errorMessage}",
		ctx
	});

	return block;
}

// (112:2) <Error>
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
		source: "(112:2) <Error>",
		ctx
	});

	return block;
}

// (116:2) {#if successMessage}
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

			if (dirty & /*$$scope, successMessage*/ 1028) {
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
		source: "(116:2) {#if successMessage}",
		ctx
	});

	return block;
}

// (117:2) <Error success={true}>
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
		source: "(117:2) <Error success={true}>",
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
			add_location(div, file$1, 106, 0, 3372);
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
	let $domain;
	let $accessToken;
	let $modal;
	validate_store(domain, "domain");
	component_subscribe($$self, domain, $$value => $$invalidate(5, $domain = $$value));
	validate_store(accessToken, "accessToken");
	component_subscribe($$self, accessToken, $$value => $$invalidate(6, $accessToken = $$value));
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
			let uploadJobID = null;
			let finishedWebsocketEvents = [];
			const websocketUrl = "wss://" + $domain.replace(/^(http|https):\/\//, "") + "/gobackend/ws?accessToken=" + $accessToken;
			const socket = new WebSocket(websocketUrl);

			const onFoundWebsocketEvent = returnData => {
				socket.close();
				uploadJobID = null;
				finishedWebsocketEvents = [];
				dispatch("uploaded", returnData);
				return returnData;
			};

			socket.onmessage = event => {
				try {
					const lines = event.data.split("\n");

					lines.forEach(line => {
						let eventData = JSON.parse(line);

						if (eventData.type === "finishedJob") {
							finishedWebsocketEvents.push(eventData);

							if (uploadJobID && eventData.jobID === uploadJobID) {
								const returnData = {
									success: true,
									id: eventData.jobData.fileID,
									isDuplicate: eventData.jobData.isDuplicate || false
								};

								onFoundWebsocketEvent(returnData);
							}
						}
					});
				} catch(e) {
					
				}
			};

			const formData = new FormData();
			formData.set("asynchronousConversion", true);

			Object.keys(config).forEach(key => {
				if (key !== "file") {
					formData.set(key, JSON.stringify(config[key]));
				} else {
					formData.set(key, config[key]);
				}
			});

			const response = await api.post("/files", formData, true, null, false, false);
			$$invalidate(0, loading = false);

			if (response.success && response.isDuplicate) {
				$$invalidate(1, errorMessage = lang("duplicate_file"));
				dispatch("error", lang("duplicate_file"));
			} else {
				$$invalidate(2, successMessage = lang("success_upload_file"));
			}

			if (response.jobID) {
				uploadJobID = response.jobID;
				const foundWebsocketEvent = finishedWebsocketEvents.find(finishedEvent => finishedEvent.jobID === uploadJobID);

				if (foundWebsocketEvent) {
					const returnData = {
						success: true,
						id: foundWebsocketEvent.jobData.fileID,
						isDuplicate: foundWebsocketEvent.jobData.isDuplicate || false
					};

					onFoundWebsocketEvent(returnData);
				}
			}

			if (!response.success) {
				dispatch("uploaded", response);
				return response;
			}
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
		domain,
		accessToken,
		api,
		loading,
		config,
		errorMessage,
		successMessage,
		dispatch,
		upload,
		$domain,
		$accessToken,
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

/* src\App.svelte generated by Svelte v3.35.0 */
const file = "src\\App.svelte";

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
			attr_dev(a, "class", "close svelte-6ibcny");
			add_location(a, file, 55, 3, 1459);
			attr_dev(header, "class", "svelte-6ibcny");
			add_location(header, file, 48, 2, 1285);
			attr_dev(div, "class", "container svelte-6ibcny");
			toggle_class(div, "container--enlarge", /*$isAuthenticated*/ ctx[5]);
			add_location(div, file, 47, 1, 1214);
			attr_dev(main, "class", "svelte-6ibcny");
			toggle_class(main, "no-modal", !/*$modal*/ ctx[3]);
			toggle_class(main, "compact", /*$compact*/ ctx[4]);
			add_location(main, file, 46, 0, 1155);
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
			add_location(section, file, 73, 2, 1886);
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
			add_location(section, file, 66, 2, 1725);
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
			add_location(section, file, 59, 2, 1553);
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
			add_location(link0, file, 87, 2, 2170);
			attr_dev(link1, "href", "https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&family=Work+Sans:wght@400;500&display=swap");
			attr_dev(link1, "rel", "stylesheet");
			add_location(link1, file, 88, 2, 2242);
			attr_dev(style, "lang", "scss");
			add_location(style, file, 90, 2, 2381);
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
		showFileName.update(() => config?.showFileName);
		showFileType.update(() => config?.showFileType);
		showFileSize.update(() => config?.showFileSize);
		
	
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

if (typeof window !== 'undefined') {
	window.PIXXIO = PIXXIO;
}

export default PIXXIO;
//# sourceMappingURL=index.js.map
