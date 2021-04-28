
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
function noop() { }
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
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
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
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
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

function bind(component, name, callback) {
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

/* src/Logo.svelte generated by Svelte v3.35.0 */

const file$7 = "src/Logo.svelte";

function create_fragment$8(ctx) {
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
			add_location(path0, file$7, 6, 8, 150);
			attr_dev(path1, "d", "M47.44 19.9h1.69a.3.3 0 00.31-.3V6.18a.3.3 0 00-.31-.3h-1.69a.3.3 0 00-.31.3V19.6a.3.3 0 00.31.3z");
			add_location(path1, file$7, 7, 8, 768);
			attr_dev(path2, "d", "M81.31 15.38h1.7a.3.3 0 00.3-.31V6.26a.3.3 0 00-.3-.31h-1.7a.3.3 0 00-.3.31v8.8a.3.3 0 00.3.32z");
			add_location(path2, file$7, 8, 8, 886);
			attr_dev(path3, "d", "M64.36 5.84h-1.97a.31.31 0 00-.27.14L58.4 11l-3.75-5.02a.44.44 0 00-.24-.14h-1.96a.31.31 0 00-.24.51l4.89 6.44-5 6.6a.32.32 0 00.25.52h1.96a.23.23 0 00.24-.14l3.85-5.2 3.86 5.23a.42.42 0 00.27.14h1.96a.31.31 0 00.24-.52l-4.99-6.6 4.89-6.44a.35.35 0 00-.27-.54z");
			add_location(path3, file$7, 9, 8, 1002);
			attr_dev(path4, "d", "M77.98 5.84h-1.96a.31.31 0 00-.28.14L72.03 11l-3.75-5.02a.44.44 0 00-.24-.14h-1.97a.31.31 0 00-.24.51l4.89 6.44-5.02 6.6a.32.32 0 00.24.52h1.96a.23.23 0 00.24-.14l3.85-5.2 3.86 5.2a.42.42 0 00.27.14h1.96a.31.31 0 00.24-.52l-4.99-6.6 4.89-6.44a.31.31 0 00-.24-.51z");
			add_location(path4, file$7, 10, 8, 1283);
			attr_dev(path5, "d", "M99.2 9.04a6.16 6.16 0 00-2.33-2.62 6.94 6.94 0 00-3.65-.96 6.68 6.68 0 00-3.58.93A6.26 6.26 0 0087.27 9a8.63 8.63 0 00-.83 3.9 8.58 8.58 0 00.83 3.84 6.4 6.4 0 002.34 2.62 7.37 7.37 0 007.22.03 6.16 6.16 0 002.34-2.61 8.63 8.63 0 00.83-3.89 8.05 8.05 0 00-.8-3.85zm-2.71 7.6a3.77 3.77 0 01-3.24 1.44 3.86 3.86 0 01-3.23-1.44 6.21 6.21 0 01-1.1-3.82 7.37 7.37 0 01.48-2.72 3.8 3.8 0 011.41-1.82 4.06 4.06 0 012.41-.66 3.84 3.84 0 013.23 1.41 6.1 6.1 0 011.07 3.79 5.92 5.92 0 01-1.03 3.82z");
			add_location(path5, file$7, 11, 8, 1567);
			attr_dev(path6, "class", "logoIcon svelte-fa509d");
			attr_dev(path6, "d", "M81.31 19.77h1.7a.3.3 0 00.3-.31v-1.68a.3.3 0 00-.3-.31h-1.7a.3.3 0 00-.3.3v1.7a.3.3 0 00.3.3z");
			add_location(path6, file$7, 12, 8, 2077);
			attr_dev(path7, "class", "logoIcon svelte-fa509d");
			attr_dev(path7, "d", "M13.18 25.78a13.48 13.48 0 01-6.75-1.82l-.68-.4v-3.4H2.27l-.41-.67A12.76 12.76 0 010 12.9 13.06 13.06 0 0113.18 0a13.06 13.06 0 0113.18 12.9 13.06 13.06 0 01-13.18 12.88zm-4.61-3.8a10.27 10.27 0 004.6 1.04A10.26 10.26 0 0023.54 12.9 10.23 10.23 0 0013.18 2.8 10.26 10.26 0 002.82 12.92a10.13 10.13 0 001.07 4.51h1.86v-4.5a7.37 7.37 0 017.43-7.28 7.37 7.37 0 017.43 7.27 7.37 7.37 0 01-7.43 7.27H8.57zm4.6-13.56a4.56 4.56 0 00-4.6 4.5v4.52h4.6a4.51 4.51 0 100-9.02z");
			add_location(path7, file$7, 13, 8, 2209);
			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg, "viewBox", "0 0 100 25.78");
			attr_dev(svg, "class", "svelte-fa509d");
			add_location(svg, file$7, 5, 6, 77);
			attr_dev(div0, "class", "header__logo svelte-fa509d");
			add_location(div0, file$7, 4, 2, 44);
			attr_dev(div1, "class", "header svelte-fa509d");
			add_location(div1, file$7, 3, 1, 21);
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
		id: create_fragment$8.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$8($$self, $$props) {
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
		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Logo",
			options,
			id: create_fragment$8.name
		});
	}
}

function lang(key) {

  const lines = {
    de: {
      username: 'Username',
      password: 'Passwort',
      signin: 'Anmelden',
      signin_description: 'Bitte melde dich in dein pixxio System an um Dateien auszuwählen.',
      signin_error: 'Ungültiger Benutzer oder Passwort',
      cancel: 'Abbrechen',
      select: 'Auswählen',
      selected: 'ausgewählt',
      please_select: 'Format wählen',
      original: 'Original',
      preview: 'Vorschau'
    },
    en: {
      username: 'Username',
      password: 'Password',
      signin: 'Sign in',
      signin_description: 'Please sign in to your pixxio system to select files.',
      signin_error: 'Invalid username or password',
      cancel: 'Cancel',
      select: 'Select',
      selected: 'selected',
      please_select: 'Choose a format',
      original: 'Original',
      preview: 'Preview'
    }
  };
  return lines['de'][key];
}

/* src/Loading.svelte generated by Svelte v3.35.0 */
const file$6 = "src/Loading.svelte";

function create_fragment$7(ctx) {
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
			attr_dev(path, "class", "svelte-2yi7ym");
			add_location(path, file$6, 6, 86, 183);
			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg, "id", "pixxioIcon");
			attr_dev(svg, "viewBox", "0 0 76.52 76.52");
			attr_dev(svg, "class", "svelte-2yi7ym");
			add_location(svg, file$6, 6, 4, 101);
			attr_dev(div0, "class", "svelte-2yi7ym");
			add_location(div0, file$6, 5, 2, 91);
			attr_dev(div1, "id", "pixxio-ta-loading");
			attr_dev(div1, "class", "svelte-2yi7ym");
			add_location(div1, file$6, 4, 0, 60);
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
		id: create_fragment$7.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$7($$self, $$props, $$invalidate) {
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
		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Loading",
			options,
			id: create_fragment$7.name
		});
	}
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

const domain = writable('');
const appKey = writable('');
const refreshToken = writable('');
const accessToken = writable('');
const searchTerm = writable('');
const format = writable('preview');
const v1 = writable(false);

/* src/SearchField.svelte generated by Svelte v3.35.0 */
const file$5 = "src/SearchField.svelte";

function create_fragment$6(ctx) {
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
			attr_dev(input_1, "class", "svelte-gmuv5t");
			add_location(input_1, file$5, 19, 4, 336);
			attr_dev(label, "for", "pixxio-search");
			attr_dev(label, "class", "svelte-gmuv5t");
			add_location(label, file$5, 20, 4, 433);
			attr_dev(div0, "class", "field svelte-gmuv5t");
			add_location(div0, file$5, 18, 2, 312);
			attr_dev(div1, "class", "searchField fields svelte-gmuv5t");
			add_location(div1, file$5, 17, 0, 277);
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
		id: create_fragment$6.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$6($$self, $$props, $$invalidate) {
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
		init(this, options, instance$6, create_fragment$6, safe_not_equal, { value: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "SearchField",
			options,
			id: create_fragment$6.name
		});
	}

	get value() {
		throw new Error("<SearchField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set value(value) {
		throw new Error("<SearchField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

class API {

  accessToken = '';
  refreshToken = '';
  domain = '';
  appKey = '';
  v1 = false;

  constructor(
  ) {
    domain.subscribe(value => this.domain = value);
    appKey.subscribe(value => this.appKey = value);
    refreshToken.subscribe(value => this.refreshToken = value);
    accessToken.subscribe(value => this.accessToken = value);
    v1.subscribe(value => this.v1 = value);
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

      if(this.v1) {
        requestData = {
          refreshToken: this.refreshToken,
          apiKey: this.appKey
        };
      }

      this.post('/accessToken', requestData, false)
      .then((data) => {
        if(data.success) {
          this.accessToken = data.accessToken;
          accessToken.update(() => data.accessToken);
          resolve();
        } else {
          reject();
        }
      }).catch(reject);
    })
    
  }

  call(method, path, parameters = {}, useAccessToken = true, additionalHeaders = null, setDefaultHeader = true, useURLSearchParams = true) {
    return new Promise((resolve, reject) => {
      const request = (requestData, headers) => {
        const url = this.domain + (this.v1 ? '/cgi-bin/api/pixxio-api.pl/json' : '/gobackend') + path;
        if (this.v1 && this.accessToken) {
          requestData.accessToken = this.accessToken;
        }
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

        let observeCall = { url: url, request: { method: 'post', headers, body: params } };

        switch (method) {
          case 'get':
            observeCall = { url: url + '?' + params, request: { headers } };
            break;
          case 'put':
            observeCall = { url: url, request: { method: 'put', headers, body: params } };
            break;
          case 'delete':
            observeCall = { url: url, request: { method: 'delete', headers, body: params } };
            break;
        }

        fetch(observeCall.url, observeCall.request).then(data => data.json()).then((data) => {
          if (data.success === true || data.success === 'true') {
            resolve(data);
          } else {
            switch (data.errorcode) {
              case '2003':  // API v1
              case '2006':  // API v1
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
        if (!this.v1) {
          headers = {  // API v2
            Authorization: 'Key ' + accessToken
          };
        }
        parameters.accessToken = accessToken;  // API v1
        request(parameters, headers);
      } else {
        request(parameters);
      }
    });
  }
}

/* src/Login.svelte generated by Svelte v3.35.0 */

const { Error: Error_1$2, Object: Object_1 } = globals;
const file$4 = "src/Login.svelte";

// (139:2) {#if hasError}
function create_if_block_1$2(ctx) {
	let small;

	const block = {
		c: function create() {
			small = element("small");
			small.textContent = `${lang("signin_error")}`;
			attr_dev(small, "class", "error svelte-sim3ue");
			add_location(small, file$4, 139, 2, 3697);
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
		id: create_if_block_1$2.name,
		type: "if",
		source: "(139:2) {#if hasError}",
		ctx
	});

	return block;
}

// (146:2) {#if isLoading}
function create_if_block$4(ctx) {
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
		id: create_if_block$4.name,
		type: "if",
		source: "(146:2) {#if isLoading}",
		ctx
	});

	return block;
}

function create_fragment$5(ctx) {
	let div3;
	let h2;
	let t1;
	let p;
	let t3;
	let div0;
	let input0;
	let t4;
	let label0;
	let t6;
	let div1;
	let input1;
	let t7;
	let label1;
	let t9;
	let t10;
	let div2;
	let button0;
	let t12;
	let button1;
	let t13_value = lang("signin") + "";
	let t13;
	let t14;
	let current;
	let mounted;
	let dispose;
	let if_block0 = /*hasError*/ ctx[2] && create_if_block_1$2(ctx);
	let if_block1 = /*isLoading*/ ctx[3] && create_if_block$4(ctx);

	const block = {
		c: function create() {
			div3 = element("div");
			h2 = element("h2");
			h2.textContent = `${lang("signin")}`;
			t1 = space();
			p = element("p");
			p.textContent = `${lang("signin_description")}`;
			t3 = space();
			div0 = element("div");
			input0 = element("input");
			t4 = space();
			label0 = element("label");
			label0.textContent = `${lang("username")}`;
			t6 = space();
			div1 = element("div");
			input1 = element("input");
			t7 = space();
			label1 = element("label");
			label1.textContent = `${lang("password")}`;
			t9 = space();
			if (if_block0) if_block0.c();
			t10 = space();
			div2 = element("div");
			button0 = element("button");
			button0.textContent = `${lang("cancel")}`;
			t12 = space();
			button1 = element("button");
			t13 = text(t13_value);
			t14 = space();
			if (if_block1) if_block1.c();
			attr_dev(h2, "class", "svelte-sim3ue");
			add_location(h2, file$4, 128, 2, 3212);
			attr_dev(p, "class", "svelte-sim3ue");
			add_location(p, file$4, 129, 2, 3240);
			attr_dev(input0, "id", "pixxio-username");
			input0.disabled = /*isLoading*/ ctx[3];
			attr_dev(input0, "type", "text");
			attr_dev(input0, "placeholder", " ");
			attr_dev(input0, "class", "svelte-sim3ue");
			add_location(input0, file$4, 131, 4, 3302);
			attr_dev(label0, "for", "pixxio-username");
			attr_dev(label0, "class", "svelte-sim3ue");
			add_location(label0, file$4, 132, 4, 3410);
			attr_dev(div0, "class", "field svelte-sim3ue");
			add_location(div0, file$4, 130, 2, 3278);
			attr_dev(input1, "id", "pixxio-password");
			input1.disabled = /*isLoading*/ ctx[3];
			attr_dev(input1, "type", "password");
			attr_dev(input1, "placeholder", " ");
			attr_dev(input1, "class", "svelte-sim3ue");
			add_location(input1, file$4, 135, 4, 3501);
			attr_dev(label1, "for", "pixxio-password");
			attr_dev(label1, "class", "svelte-sim3ue");
			add_location(label1, file$4, 136, 4, 3613);
			attr_dev(div1, "class", "field svelte-sim3ue");
			add_location(div1, file$4, 134, 2, 3477);
			attr_dev(button0, "class", "button button--secondary svelte-sim3ue");
			add_location(button0, file$4, 142, 4, 3789);
			attr_dev(button1, "class", "button svelte-sim3ue");
			attr_dev(button1, "type", "submit");
			button1.disabled = /*isLoading*/ ctx[3];
			add_location(button1, file$4, 143, 4, 3878);
			attr_dev(div2, "class", "buttonGroup svelte-sim3ue");
			add_location(div2, file$4, 141, 2, 3759);
			attr_dev(div3, "class", "login fields svelte-sim3ue");
			add_location(div3, file$4, 127, 0, 3183);
		},
		l: function claim(nodes) {
			throw new Error_1$2("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div3, anchor);
			append_dev(div3, h2);
			append_dev(div3, t1);
			append_dev(div3, p);
			append_dev(div3, t3);
			append_dev(div3, div0);
			append_dev(div0, input0);
			set_input_value(input0, /*username*/ ctx[0]);
			append_dev(div0, t4);
			append_dev(div0, label0);
			append_dev(div3, t6);
			append_dev(div3, div1);
			append_dev(div1, input1);
			set_input_value(input1, /*password*/ ctx[1]);
			append_dev(div1, t7);
			append_dev(div1, label1);
			append_dev(div3, t9);
			if (if_block0) if_block0.m(div3, null);
			append_dev(div3, t10);
			append_dev(div3, div2);
			append_dev(div2, button0);
			append_dev(div2, t12);
			append_dev(div2, button1);
			append_dev(button1, t13);
			append_dev(div3, t14);
			if (if_block1) if_block1.m(div3, null);
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(input0, "input", /*input0_input_handler*/ ctx[11]),
					listen_dev(input1, "input", /*input1_input_handler*/ ctx[12]),
					listen_dev(button0, "click", /*cancel*/ ctx[7], false, false, false),
					listen_dev(
						button1,
						"click",
						function () {
							if (is_function(/*version1*/ ctx[4]
							? /*loginV1*/ ctx[6]
							: /*login*/ ctx[5])) (/*version1*/ ctx[4]
							? /*loginV1*/ ctx[6]
							: /*login*/ ctx[5]).apply(this, arguments);
						},
						false,
						false,
						false
					)
				];

				mounted = true;
			}
		},
		p: function update(new_ctx, [dirty]) {
			ctx = new_ctx;

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

			if (/*hasError*/ ctx[2]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_1$2(ctx);
					if_block0.c();
					if_block0.m(div3, t10);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (!current || dirty & /*isLoading*/ 8) {
				prop_dev(button1, "disabled", /*isLoading*/ ctx[3]);
			}

			if (/*isLoading*/ ctx[3]) {
				if (if_block1) {
					if (dirty & /*isLoading*/ 8) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block$4(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(div3, null);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block1);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block1);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div3);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			mounted = false;
			run_all(dispose);
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
	let domainVal;
	let appKeyVal;
	let version1;
	let $domain;
	let $appKey;
	let $v1;
	validate_store(domain, "domain");
	component_subscribe($$self, domain, $$value => $$invalidate(8, $domain = $$value));
	validate_store(appKey, "appKey");
	component_subscribe($$self, appKey, $$value => $$invalidate(9, $appKey = $$value));
	validate_store(v1, "v1");
	component_subscribe($$self, v1, $$value => $$invalidate(10, $v1 = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Login", slots, []);
	const dispatch = createEventDispatcher();
	const api = new API();
	let username = "";
	let password = "";
	let hasError = false;
	let isLoading = false;

	/**
 * check if there is a refreshToken in storage
 */
	const token = sessionStorage.getItem("refreshToken");

	if (token) {
		isLoading = true;
		refreshToken.update(() => token);

		api.callAccessToken().then(() => {
			$$invalidate(3, isLoading = false);
			dispatch("authenticated");
		}).catch(e => {
			refreshToken.update(() => "");
			$$invalidate(3, isLoading = false);
		});
	}

	let handleLogin = null;

	const login = async () => {
		$$invalidate(3, isLoading = true);
		$$invalidate(2, hasError = false);

		try {
			const formData = new FormData();
			formData.set("applicationKey", appKeyVal);
			formData.set("userName", username);
			formData.set("password", password);
			const data = await fetch(`${domainVal}/gobackend/login`, { method: "POST", body: formData });
			const response = await data.json();
			$$invalidate(3, isLoading = false);

			if (!response.success) {
				$$invalidate(2, hasError = true);
				throw new Error();
			}

			// store refreshToken 
			refreshToken.update(() => response.refreshToken);

			sessionStorage.setItem("refreshToken", response.refreshToken);

			api.callAccessToken().then(() => {
				dispatch("authenticated");
			});
		} catch(error) {
			$$invalidate(3, isLoading = false);
			$$invalidate(2, hasError = true);
		}
	};

	const loginV1 = async () => {
		$$invalidate(3, isLoading = true);
		$$invalidate(2, hasError = false);

		try {
			const formData = new FormData();
			formData.set("apiKey", appKeyVal);
			formData.set("options", JSON.stringify({ username, password }));

			const requestData = {
				apiKey: appKeyVal,
				options: { username, password }
			};

			let params = new URLSearchParams();

			for (const key of Object.keys(requestData)) {
				let value = requestData[key];

				if (typeof value === "object") {
					value = JSON.stringify(value);
				}

				params.set(key, value);
			}

			params = params.toString();

			const data = await fetch(`${domainVal}/cgi-bin/api/pixxio-api.pl/json/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded"
				},
				body: params
			});

			const response = await data.json();
			$$invalidate(3, isLoading = false);

			if (response.success !== "true") {
				$$invalidate(2, hasError = true);
				throw new Error();
			}

			// store refreshToken 
			refreshToken.update(() => response.refreshToken);

			sessionStorage.setItem("refreshToken", response.refreshToken);

			api.callAccessToken().then(() => {
				dispatch("authenticated");
			});
		} catch(error) {
			$$invalidate(3, isLoading = false);
			$$invalidate(2, hasError = true);
		}
	};

	const cancel = () => {
		dispatch("cancel");
	};

	const writable_props = [];

	Object_1.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Login> was created with unknown prop '${key}'`);
	});

	function input0_input_handler() {
		username = this.value;
		$$invalidate(0, username);
	}

	function input1_input_handler() {
		password = this.value;
		$$invalidate(1, password);
	}

	$$self.$capture_state = () => ({
		createEventDispatcher,
		lang,
		domain,
		appKey,
		refreshToken,
		v1,
		API,
		Loading,
		dispatch,
		api,
		username,
		password,
		hasError,
		isLoading,
		token,
		handleLogin,
		login,
		loginV1,
		cancel,
		domainVal,
		$domain,
		appKeyVal,
		$appKey,
		version1,
		$v1
	});

	$$self.$inject_state = $$props => {
		if ("username" in $$props) $$invalidate(0, username = $$props.username);
		if ("password" in $$props) $$invalidate(1, password = $$props.password);
		if ("hasError" in $$props) $$invalidate(2, hasError = $$props.hasError);
		if ("isLoading" in $$props) $$invalidate(3, isLoading = $$props.isLoading);
		if ("handleLogin" in $$props) handleLogin = $$props.handleLogin;
		if ("domainVal" in $$props) domainVal = $$props.domainVal;
		if ("appKeyVal" in $$props) appKeyVal = $$props.appKeyVal;
		if ("version1" in $$props) $$invalidate(4, version1 = $$props.version1);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$domain*/ 256) {
			domainVal = $domain;
		}

		if ($$self.$$.dirty & /*$appKey*/ 512) {
			appKeyVal = $appKey;
		}

		if ($$self.$$.dirty & /*$v1*/ 1024) {
			$$invalidate(4, version1 = $v1);
		}
	};

	return [
		username,
		password,
		hasError,
		isLoading,
		version1,
		login,
		loginV1,
		cancel,
		$domain,
		$appKey,
		$v1,
		input0_input_handler,
		input1_input_handler
	];
}

class Login extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Login",
			options,
			id: create_fragment$5.name
		});
	}
}

/* src/DownloadFormats.svelte generated by Svelte v3.35.0 */

const { Error: Error_1$1 } = globals;
const file$3 = "src/DownloadFormats.svelte";

function get_each_context$2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[11] = list[i];
	return child_ctx;
}

// (51:6) {#if showPreview}
function create_if_block_1$1(ctx) {
	let option;

	const block = {
		c: function create() {
			option = element("option");
			option.textContent = `${lang("preview")}`;
			option.__value = "preview";
			option.value = option.__value;
			add_location(option, file$3, 51, 6, 1167);
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
		id: create_if_block_1$1.name,
		type: "if",
		source: "(51:6) {#if showPreview}",
		ctx
	});

	return block;
}

// (54:6) {#if showOriginal}
function create_if_block$3(ctx) {
	let option;

	const block = {
		c: function create() {
			option = element("option");
			option.textContent = `${lang("original")}`;
			option.__value = "original";
			option.value = option.__value;
			add_location(option, file$3, 54, 6, 1261);
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
		id: create_if_block$3.name,
		type: "if",
		source: "(54:6) {#if showOriginal}",
		ctx
	});

	return block;
}

// (57:6) {#each formats as format}
function create_each_block$2(ctx) {
	let option;
	let t_value = /*format*/ ctx[11].name + "";
	let t;
	let option_value_value;

	const block = {
		c: function create() {
			option = element("option");
			t = text(t_value);
			option.__value = option_value_value = /*format*/ ctx[11].id;
			option.value = option.__value;
			add_location(option, file$3, 57, 6, 1364);
		},
		m: function mount(target, anchor) {
			insert_dev(target, option, anchor);
			append_dev(option, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*formats*/ 2 && t_value !== (t_value = /*format*/ ctx[11].name + "")) set_data_dev(t, t_value);

			if (dirty & /*formats*/ 2 && option_value_value !== (option_value_value = /*format*/ ctx[11].id)) {
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
		source: "(57:6) {#each formats as format}",
		ctx
	});

	return block;
}

function create_fragment$4(ctx) {
	let div1;
	let div0;
	let select_1;
	let if_block0_anchor;
	let if_block1_anchor;
	let t0;
	let label;
	let mounted;
	let dispose;
	let if_block0 = /*showPreview*/ ctx[3] && create_if_block_1$1(ctx);
	let if_block1 = /*showOriginal*/ ctx[2] && create_if_block$3(ctx);
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
			attr_dev(select_1, "class", "svelte-1x1v299");
			if (/*selected*/ ctx[0] === void 0) add_render_callback(() => /*select_1_change_handler*/ ctx[5].call(select_1));
			add_location(select_1, file$3, 49, 4, 1026);
			attr_dev(label, "for", "pixxioDownloadFormats__dropdown");
			attr_dev(label, "class", "svelte-1x1v299");
			add_location(label, file$3, 60, 4, 1445);
			attr_dev(div0, "class", "field svelte-1x1v299");
			add_location(div0, file$3, 48, 2, 1002);
			attr_dev(div1, "class", "downloadFormats fields svelte-1x1v299");
			add_location(div1, file$3, 47, 0, 963);
		},
		l: function claim(nodes) {
			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
					listen_dev(select_1, "change", /*select_1_change_handler*/ ctx[5]),
					listen_dev(select_1, "change", /*select*/ ctx[4], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (/*showPreview*/ ctx[3]) if_block0.p(ctx, dirty);
			if (/*showOriginal*/ ctx[2]) if_block1.p(ctx, dirty);

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
		i: noop,
		o: noop,
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
		id: create_fragment$4.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$4($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("DownloadFormats", slots, []);
	const dispatch = createEventDispatcher();
	const api = new API();
	let selected;
	let formats = [];
	let hasError = false;
	let isLoading = false;
	let showOriginal = true;
	let showPreview = true;

	onMount(() => {
		// fetchDownloadFormats();
		select();
	});

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

			$$invalidate(1, formats = data.downloadFormats);
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
		createEventDispatcher,
		onMount,
		API,
		format,
		lang,
		dispatch,
		api,
		selected,
		formats,
		hasError,
		isLoading,
		showOriginal,
		showPreview,
		select,
		fetchDownloadFormats
	});

	$$self.$inject_state = $$props => {
		if ("selected" in $$props) $$invalidate(0, selected = $$props.selected);
		if ("formats" in $$props) $$invalidate(1, formats = $$props.formats);
		if ("hasError" in $$props) hasError = $$props.hasError;
		if ("isLoading" in $$props) isLoading = $$props.isLoading;
		if ("showOriginal" in $$props) $$invalidate(2, showOriginal = $$props.showOriginal);
		if ("showPreview" in $$props) $$invalidate(3, showPreview = $$props.showPreview);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [selected, formats, showOriginal, showPreview, select, select_1_change_handler];
}

class DownloadFormats extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "DownloadFormats",
			options,
			id: create_fragment$4.name
		});
	}
}

/* src/Selection.svelte generated by Svelte v3.35.0 */
const file$2 = "src/Selection.svelte";

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[3] = list[i];
	return child_ctx;
}

// (12:2) {#each selected as file}
function create_each_block$1(ctx) {
	let li;
	let img;
	let img_src_value;
	let img_alt_value;
	let mounted;
	let dispose;

	const block = {
		c: function create() {
			li = element("li");
			img = element("img");
			attr_dev(img, "loading", "lazy");
			if (img.src !== (img_src_value = /*file*/ ctx[3].imagePath || /*file*/ ctx[3].modifiedPreviewFileURLs[0])) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", img_alt_value = /*file*/ ctx[3].fileName);
			attr_dev(img, "class", "svelte-2dn8sz");
			add_location(img, file$2, 13, 6, 305);
			attr_dev(li, "class", "pixxioSelection__file svelte-2dn8sz");
			add_location(li, file$2, 12, 4, 226);
		},
		m: function mount(target, anchor) {
			insert_dev(target, li, anchor);
			append_dev(li, img);

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
		source: "(12:2) {#each selected as file}",
		ctx
	});

	return block;
}

// (17:2) {#if selectedFiles.length > 3}
function create_if_block$2(ctx) {
	let li;
	let t0;
	let t1_value = /*selectedFiles*/ ctx[0].length - /*selected*/ ctx[1].length + "";
	let t1;

	const block = {
		c: function create() {
			li = element("li");
			t0 = text("+ ");
			t1 = text(t1_value);
			attr_dev(li, "class", "svelte-2dn8sz");
			add_location(li, file$2, 17, 2, 457);
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
		id: create_if_block$2.name,
		type: "if",
		source: "(17:2) {#if selectedFiles.length > 3}",
		ctx
	});

	return block;
}

function create_fragment$3(ctx) {
	let ul;
	let t;
	let each_value = /*selected*/ ctx[1];
	validate_each_argument(each_value);
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	let if_block = /*selectedFiles*/ ctx[0].length > 3 && create_if_block$2(ctx);

	const block = {
		c: function create() {
			ul = element("ul");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = space();
			if (if_block) if_block.c();
			attr_dev(ul, "class", "svelte-2dn8sz");
			add_location(ul, file$2, 10, 0, 190);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, ul, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul, null);
			}

			append_dev(ul, t);
			if (if_block) if_block.m(ul, null);
		},
		p: function update(ctx, [dirty]) {
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
						each_blocks[i].m(ul, t);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}

			if (/*selectedFiles*/ ctx[0].length > 3) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$2(ctx);
					if_block.c();
					if_block.m(ul, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(ul);
			destroy_each(each_blocks, detaching);
			if (if_block) if_block.d();
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
		init(this, options, instance$3, create_fragment$3, safe_not_equal, { selectedFiles: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Selection",
			options,
			id: create_fragment$3.name
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

// (14:0) {#if file}
function create_if_block$1(ctx) {
	let li;
	let figure;
	let div;
	let img;
	let img_src_value;
	let img_alt_value;
	let t0;
	let figcaption;
	let t1_value = /*file*/ ctx[0].fileName + "";
	let t1;
	let mounted;
	let dispose;

	const block = {
		c: function create() {
			li = element("li");
			figure = element("figure");
			div = element("div");
			img = element("img");
			t0 = space();
			figcaption = element("figcaption");
			t1 = text(t1_value);
			attr_dev(img, "loading", "lazy");
			if (img.src !== (img_src_value = /*file*/ ctx[0].imagePath || /*file*/ ctx[0].modifiedPreviewFileURLs[0])) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", img_alt_value = /*file*/ ctx[0].fileName);
			attr_dev(img, "class", "svelte-e9o60a");
			add_location(img, file_1, 17, 6, 391);
			attr_dev(div, "class", "pixxioSquare svelte-e9o60a");
			toggle_class(div, "pixxioSquare--active", /*file*/ ctx[0].selected);
			add_location(div, file_1, 16, 4, 315);
			attr_dev(figcaption, "class", "svelte-e9o60a");
			add_location(figcaption, file_1, 19, 4, 503);
			attr_dev(figure, "class", "svelte-e9o60a");
			add_location(figure, file_1, 15, 2, 302);
			attr_dev(li, "class", "svelte-e9o60a");
			add_location(li, file_1, 14, 0, 269);
		},
		m: function mount(target, anchor) {
			insert_dev(target, li, anchor);
			append_dev(li, figure);
			append_dev(figure, div);
			append_dev(div, img);
			append_dev(figure, t0);
			append_dev(figure, figcaption);
			append_dev(figcaption, t1);

			if (!mounted) {
				dispose = listen_dev(li, "click", /*click_handler*/ ctx[3], false, false, false);
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

			if (dirty & /*file*/ 1) {
				toggle_class(div, "pixxioSquare--active", /*file*/ ctx[0].selected);
			}

			if (dirty & /*file*/ 1 && t1_value !== (t1_value = /*file*/ ctx[0].fileName + "")) set_data_dev(t1, t1_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(li);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$1.name,
		type: "if",
		source: "(14:0) {#if file}",
		ctx
	});

	return block;
}

function create_fragment$2(ctx) {
	let if_block_anchor;
	let if_block = /*file*/ ctx[0] && create_if_block$1(ctx);

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
					if_block = create_if_block$1(ctx);
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
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$2($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("FileItem", slots, []);
	let { file = null } = $$props;
	let { selected = false } = $$props;
	const dispatch = createEventDispatcher();

	const select = () => {
		dispatch(!selected ? "select" : "deselect", file);
	};

	const writable_props = ["file", "selected"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FileItem> was created with unknown prop '${key}'`);
	});

	const click_handler = () => select();

	$$self.$$set = $$props => {
		if ("file" in $$props) $$invalidate(0, file = $$props.file);
		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
	};

	$$self.$capture_state = () => ({
		createEventDispatcher,
		file,
		selected,
		dispatch,
		select
	});

	$$self.$inject_state = $$props => {
		if ("file" in $$props) $$invalidate(0, file = $$props.file);
		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [file, select, selected, click_handler];
}

class FileItem extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$2, create_fragment$2, safe_not_equal, { file: 0, selected: 2 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "FileItem",
			options,
			id: create_fragment$2.name
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

/* src/Files.svelte generated by Svelte v3.35.0 */

const { Error: Error_1 } = globals;
const file$1 = "src/Files.svelte";

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[29] = list[i];
	child_ctx[30] = list;
	child_ctx[31] = i;
	return child_ctx;
}

// (210:4) {:catch}
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
		source: "(210:4) {:catch}",
		ctx
	});

	return block;
}

// (189:4) {:then}
function create_then_block(ctx) {
	let section;
	let ul;
	let t0;
	let div0;
	let downloadformats;
	let t1;
	let div1;
	let p;
	let strong;
	let t2;
	let t3;
	let t4_value = (/*max*/ ctx[0] ? "/" + /*max*/ ctx[0] : "") + "";
	let t4;
	let t5;
	let t6_value = lang("selected") + "";
	let t6;
	let t7;
	let selection;
	let updating_selectedFiles;
	let t8;
	let span;
	let t9;
	let button0;
	let t11;
	let button1;
	let t12_value = lang("select") + "";
	let t12;
	let button1_disabled_value;
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

	downloadformats = new DownloadFormats({ $$inline: true });

	function selection_selectedFiles_binding(value) {
		/*selection_selectedFiles_binding*/ ctx[17](value);
	}

	let selection_props = {};

	if (/*selectedFiles*/ ctx[1] !== void 0) {
		selection_props.selectedFiles = /*selectedFiles*/ ctx[1];
	}

	selection = new Selection({ props: selection_props, $$inline: true });
	binding_callbacks.push(() => bind(selection, "selectedFiles", selection_selectedFiles_binding));
	selection.$on("deselect", /*deselect*/ ctx[10]);

	const block = {
		c: function create() {
			section = element("section");
			ul = element("ul");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t0 = space();
			div0 = element("div");
			create_component(downloadformats.$$.fragment);
			t1 = space();
			div1 = element("div");
			p = element("p");
			strong = element("strong");
			t2 = text(/*selectedCount*/ ctx[2]);
			t3 = space();
			t4 = text(t4_value);
			t5 = space();
			t6 = text(t6_value);
			t7 = space();
			create_component(selection.$$.fragment);
			t8 = space();
			span = element("span");
			t9 = space();
			button0 = element("button");
			button0.textContent = `${lang("cancel")}`;
			t11 = space();
			button1 = element("button");
			t12 = text(t12_value);
			attr_dev(ul, "class", "svelte-1z0y19a");
			add_location(ul, file$1, 191, 6, 4780);
			attr_dev(section, "id", "pixxioFiles__container");
			attr_dev(section, "class", "svelte-1z0y19a");
			toggle_class(section, "pixxioFiles__container--maxReached", /*maxReached*/ ctx[5]);
			add_location(section, file$1, 190, 4, 4659);
			attr_dev(div0, "class", "pixxioFormats svelte-1z0y19a");
			add_location(div0, file$1, 198, 4, 4986);
			add_location(strong, file$1, 203, 9, 5126);
			add_location(p, file$1, 203, 6, 5123);
			set_style(span, "flex-grow", "1");
			add_location(span, file$1, 205, 6, 5299);
			attr_dev(button0, "class", "button button--secondary svelte-1z0y19a");
			add_location(button0, file$1, 206, 6, 5340);
			attr_dev(button1, "class", "button svelte-1z0y19a");
			attr_dev(button1, "type", "submit");
			button1.disabled = button1_disabled_value = !/*valid*/ ctx[6];
			add_location(button1, file$1, 207, 6, 5449);
			attr_dev(div1, "class", "buttonGroup buttonGroup--right svelte-1z0y19a");
			add_location(div1, file$1, 202, 4, 5072);
		},
		m: function mount(target, anchor) {
			insert_dev(target, section, anchor);
			append_dev(section, ul);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(ul, null);
			}

			insert_dev(target, t0, anchor);
			insert_dev(target, div0, anchor);
			mount_component(downloadformats, div0, null);
			insert_dev(target, t1, anchor);
			insert_dev(target, div1, anchor);
			append_dev(div1, p);
			append_dev(p, strong);
			append_dev(strong, t2);
			append_dev(p, t3);
			append_dev(p, t4);
			append_dev(p, t5);
			append_dev(p, t6);
			append_dev(div1, t7);
			mount_component(selection, div1, null);
			append_dev(div1, t8);
			append_dev(div1, span);
			append_dev(div1, t9);
			append_dev(div1, button0);
			append_dev(div1, t11);
			append_dev(div1, button1);
			append_dev(button1, t12);
			current = true;

			if (!mounted) {
				dispose = [
					listen_dev(section, "scroll", /*lazyLoad*/ ctx[8], false, false, false),
					listen_dev(button0, "click", /*click_handler*/ ctx[18], false, false, false),
					listen_dev(button1, "click", /*submit*/ ctx[11], false, false, false)
				];

				mounted = true;
			}
		},
		p: function update(ctx, dirty) {
			if (dirty[0] & /*files, select, deselect*/ 1552) {
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

			if (dirty[0] & /*maxReached*/ 32) {
				toggle_class(section, "pixxioFiles__container--maxReached", /*maxReached*/ ctx[5]);
			}

			if (!current || dirty[0] & /*selectedCount*/ 4) set_data_dev(t2, /*selectedCount*/ ctx[2]);
			if ((!current || dirty[0] & /*max*/ 1) && t4_value !== (t4_value = (/*max*/ ctx[0] ? "/" + /*max*/ ctx[0] : "") + "")) set_data_dev(t4, t4_value);
			const selection_changes = {};

			if (!updating_selectedFiles && dirty[0] & /*selectedFiles*/ 2) {
				updating_selectedFiles = true;
				selection_changes.selectedFiles = /*selectedFiles*/ ctx[1];
				add_flush_callback(() => updating_selectedFiles = false);
			}

			selection.$set(selection_changes);

			if (!current || dirty[0] & /*valid*/ 64 && button1_disabled_value !== (button1_disabled_value = !/*valid*/ ctx[6])) {
				prop_dev(button1, "disabled", button1_disabled_value);
			}
		},
		i: function intro(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			transition_in(downloadformats.$$.fragment, local);
			transition_in(selection.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			transition_out(downloadformats.$$.fragment, local);
			transition_out(selection.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(section);
			destroy_each(each_blocks, detaching);
			if (detaching) detach_dev(t0);
			if (detaching) detach_dev(div0);
			destroy_component(downloadformats);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(div1);
			destroy_component(selection);
			mounted = false;
			run_all(dispose);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_then_block.name,
		type: "then",
		source: "(189:4) {:then}",
		ctx
	});

	return block;
}

// (193:8) {#each files as file}
function create_each_block(ctx) {
	let fileitem;
	let updating_file;
	let updating_selected;
	let current;

	function fileitem_file_binding(value) {
		/*fileitem_file_binding*/ ctx[15](value, /*file*/ ctx[29], /*each_value*/ ctx[30], /*file_index*/ ctx[31]);
	}

	function fileitem_selected_binding(value) {
		/*fileitem_selected_binding*/ ctx[16](value, /*file*/ ctx[29]);
	}

	let fileitem_props = {};

	if (/*file*/ ctx[29] !== void 0) {
		fileitem_props.file = /*file*/ ctx[29];
	}

	if (/*file*/ ctx[29].selected !== void 0) {
		fileitem_props.selected = /*file*/ ctx[29].selected;
	}

	fileitem = new FileItem({ props: fileitem_props, $$inline: true });
	binding_callbacks.push(() => bind(fileitem, "file", fileitem_file_binding));
	binding_callbacks.push(() => bind(fileitem, "selected", fileitem_selected_binding));
	fileitem.$on("select", /*select*/ ctx[9]);
	fileitem.$on("deselect", /*deselect*/ ctx[10]);

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
				fileitem_changes.file = /*file*/ ctx[29];
				add_flush_callback(() => updating_file = false);
			}

			if (!updating_selected && dirty[0] & /*files*/ 16) {
				updating_selected = true;
				fileitem_changes.selected = /*file*/ ctx[29].selected;
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
		source: "(193:8) {#each files as file}",
		ctx
	});

	return block;
}

// (187:19)      <Loading></Loading>     {:then}
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
		source: "(187:19)      <Loading></Loading>     {:then}",
		ctx
	});

	return block;
}

function create_fragment$1(ctx) {
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
			attr_dev(div, "class", "pixxioFiles svelte-1z0y19a");
			add_location(div, file$1, 185, 0, 4567);
		},
		l: function claim(nodes) {
			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$1($$self, $$props, $$invalidate) {
	let selectedCount;
	let maxReached;
	let valid;
	let downloadFormat;
	let version1;
	let $format;
	let $v1;
	validate_store(format, "format");
	component_subscribe($$self, format, $$value => $$invalidate(13, $format = $$value));
	validate_store(v1, "v1");
	component_subscribe($$self, v1, $$value => $$invalidate(14, $v1 = $$value));
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Files", slots, []);
	const dispatch = createEventDispatcher();
	const api = new API();
	let { max = 0 } = $$props;
	let hasError = false;
	let getFiles = null;
	let page = 1;
	let pageSize = 50;
	let files = [];
	let quantity = 0;
	let isLoading = false;
	let query = "";
	let selectedFiles = [];

	onMount(() => {
		$$invalidate(3, getFiles = version1 ? fetchFilesV1() : fetchFiles());

		searchTerm.subscribe(value => {
			query = value;

			if (version1) {
				fetchFilesV1();
			} else {
				fetchFiles();
			}
		});
	});

	const lazyLoad = event => {
		if (isLoading || files.length >= quantity) {
			return;
		}

		const delta = event.target.scrollHeight - event.target.scrollTop - event.target.offsetHeight;

		if (delta < event.target.offsetHeight / 2) {
			page += 1;

			if (version1) {
				fetchFilesV1(true);
			} else {
				fetchFiles(true);
			}
		}
	};

	const fetchFilesV1 = async attach => {
		try {
			isLoading = true;
			const filter = query ? { searchTerm: query } : {};

			const options = {
				pagination: pageSize + "-" + page,
				...filter
			};

			const data = await api.get(`/files`, { options });

			if (data.success !== "true") {
				throw new Error(data.errormessage);
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

			isLoading = false;
		} catch(e) {
			hasError = true;
			isLoading = false;
		}
	};

	const fetchFiles = async attach => {
		try {
			isLoading = true;

			const filter = query
			? {
					filter: { filterType: "searchTerm", term: query }
				}
			: {};

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
					"dominantColor"
				],
				previewFileOptions: [{ height: 400, quality: 60 }],
				...filter
			};

			const data = await api.get(`/files`, options);

			if (!data.success) {
				throw new Error(data.errormessage);
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

			isLoading = false;
		} catch(e) {
			hasError = true;
			isLoading = false;
		}
	};

	const select = event => {
		if (max && max <= selectedFiles.length) {
			return;
		}

		const file = files.find(f => f.id === event.detail.id);
		file.selected = true;
		$$invalidate(4, files);
		$$invalidate(1, selectedFiles = [...selectedFiles, event.detail]);
	};

	const deselect = event => {
		const file = files.find(f => f.id === event.detail.id);
		file.selected = false;
		$$invalidate(4, files);
		$$invalidate(1, selectedFiles = selectedFiles.filter(f => f.id !== event.detail.id));
	};

	const submit = async () => {
		dispatch("submit", selectedFiles.map(file => {
			let url = "";
			let thumbnail = "";

			if (version1) {
				(url = downloadFormat === "preview"
				? file.imagePath
				: file.originalPath, thumbnail = file.imagePath);
			} else {
				url = downloadFormat === "preview"
				? file.previewFileURL
				: file.originalFileURL;

				thumbnail = file.modifiedPreviewFileURLs[0];
			}

			return { url, thumbnail };
		}));
	};

	const writable_props = ["max"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Files> was created with unknown prop '${key}'`);
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
		$$invalidate(1, selectedFiles);
	}

	const click_handler = () => dispatch("cancel");

	$$self.$$set = $$props => {
		if ("max" in $$props) $$invalidate(0, max = $$props.max);
	};

	$$self.$capture_state = () => ({
		createEventDispatcher,
		onMount,
		DownloadFormats,
		Selection,
		FileItem,
		Loading,
		searchTerm,
		format,
		v1,
		API,
		lang,
		dispatch,
		api,
		max,
		hasError,
		getFiles,
		page,
		pageSize,
		files,
		quantity,
		isLoading,
		query,
		selectedFiles,
		lazyLoad,
		fetchFilesV1,
		fetchFiles,
		select,
		deselect,
		submit,
		selectedCount,
		maxReached,
		valid,
		downloadFormat,
		$format,
		version1,
		$v1
	});

	$$self.$inject_state = $$props => {
		if ("max" in $$props) $$invalidate(0, max = $$props.max);
		if ("hasError" in $$props) hasError = $$props.hasError;
		if ("getFiles" in $$props) $$invalidate(3, getFiles = $$props.getFiles);
		if ("page" in $$props) page = $$props.page;
		if ("pageSize" in $$props) pageSize = $$props.pageSize;
		if ("files" in $$props) $$invalidate(4, files = $$props.files);
		if ("quantity" in $$props) quantity = $$props.quantity;
		if ("isLoading" in $$props) isLoading = $$props.isLoading;
		if ("query" in $$props) query = $$props.query;
		if ("selectedFiles" in $$props) $$invalidate(1, selectedFiles = $$props.selectedFiles);
		if ("selectedCount" in $$props) $$invalidate(2, selectedCount = $$props.selectedCount);
		if ("maxReached" in $$props) $$invalidate(5, maxReached = $$props.maxReached);
		if ("valid" in $$props) $$invalidate(6, valid = $$props.valid);
		if ("downloadFormat" in $$props) $$invalidate(12, downloadFormat = $$props.downloadFormat);
		if ("version1" in $$props) version1 = $$props.version1;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty[0] & /*selectedFiles*/ 2) {
			$$invalidate(2, selectedCount = selectedFiles.length);
		}

		if ($$self.$$.dirty[0] & /*selectedCount, max*/ 5) {
			$$invalidate(5, maxReached = selectedCount >= max && max);
		}

		if ($$self.$$.dirty[0] & /*$format*/ 8192) {
			$$invalidate(12, downloadFormat = $format);
		}

		if ($$self.$$.dirty[0] & /*selectedCount, downloadFormat*/ 4100) {
			$$invalidate(6, valid = selectedCount >= 1 && downloadFormat);
		}

		if ($$self.$$.dirty[0] & /*$v1*/ 16384) {
			version1 = $v1;
		}
	};

	return [
		max,
		selectedFiles,
		selectedCount,
		getFiles,
		files,
		maxReached,
		valid,
		dispatch,
		lazyLoad,
		select,
		deselect,
		submit,
		downloadFormat,
		$format,
		$v1,
		fileitem_file_binding,
		fileitem_selected_binding,
		selection_selectedFiles_binding,
		click_handler
	];
}

class Files extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { max: 0 }, [-1, -1]);

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Files",
			options,
			id: create_fragment$1.name
		});
	}

	get max() {
		throw new Error_1("<Files>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set max(value) {
		throw new Error_1("<Files>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/App.svelte generated by Svelte v3.35.0 */
const file = "src/App.svelte";

// (48:0) {#if show}
function create_if_block(ctx) {
	let main;
	let div;
	let header;
	let t0;
	let t1;
	let current_block_type_index;
	let if_block2;
	let current;
	let if_block0 = /*standalone*/ ctx[1] && create_if_block_3(ctx);
	let if_block1 = /*isAuthenticated*/ ctx[3] && create_if_block_2(ctx);
	const if_block_creators = [create_if_block_1, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (!/*isAuthenticated*/ ctx[3]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			main = element("main");
			div = element("div");
			header = element("header");
			if (if_block0) if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			if_block2.c();
			attr_dev(header, "class", "svelte-1c8ayef");
			add_location(header, file, 50, 2, 1094);
			attr_dev(div, "class", "container svelte-1c8ayef");
			toggle_class(div, "container--enlarge", /*enlarge*/ ctx[5]);
			add_location(div, file, 49, 1, 1031);
			attr_dev(main, "class", "svelte-1c8ayef");
			add_location(main, file, 48, 0, 1023);
		},
		m: function mount(target, anchor) {
			insert_dev(target, main, anchor);
			append_dev(main, div);
			append_dev(div, header);
			if (if_block0) if_block0.m(header, null);
			append_dev(header, t0);
			if (if_block1) if_block1.m(header, null);
			append_dev(div, t1);
			if_blocks[current_block_type_index].m(div, null);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (/*standalone*/ ctx[1]) {
				if (if_block0) {
					if (dirty & /*standalone*/ 2) {
						transition_in(if_block0, 1);
					}
				} else {
					if_block0 = create_if_block_3(ctx);
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

			if (/*isAuthenticated*/ ctx[3]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);

					if (dirty & /*isAuthenticated*/ 8) {
						transition_in(if_block1, 1);
					}
				} else {
					if_block1 = create_if_block_2(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(header, null);
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
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block2 = if_blocks[current_block_type_index];

				if (!if_block2) {
					if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block2.c();
				} else {
					if_block2.p(ctx, dirty);
				}

				transition_in(if_block2, 1);
				if_block2.m(div, null);
			}

			if (dirty & /*enlarge*/ 32) {
				toggle_class(div, "container--enlarge", /*enlarge*/ ctx[5]);
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
			if (detaching) detach_dev(main);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if_blocks[current_block_type_index].d();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(48:0) {#if show}",
		ctx
	});

	return block;
}

// (52:3) {#if standalone}
function create_if_block_3(ctx) {
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
		id: create_if_block_3.name,
		type: "if",
		source: "(52:3) {#if standalone}",
		ctx
	});

	return block;
}

// (55:3) {#if isAuthenticated}
function create_if_block_2(ctx) {
	let searchfield;
	let updating_value;
	let current;

	function searchfield_value_binding(value) {
		/*searchfield_value_binding*/ ctx[10](value);
	}

	let searchfield_props = {};

	if (/*searchQuery*/ ctx[4] !== void 0) {
		searchfield_props.value = /*searchQuery*/ ctx[4];
	}

	searchfield = new SearchField({ props: searchfield_props, $$inline: true });
	binding_callbacks.push(() => bind(searchfield, "value", searchfield_value_binding));

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

			if (!updating_value && dirty & /*searchQuery*/ 16) {
				updating_value = true;
				searchfield_changes.value = /*searchQuery*/ ctx[4];
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
		id: create_if_block_2.name,
		type: "if",
		source: "(55:3) {#if isAuthenticated}",
		ctx
	});

	return block;
}

// (64:2) {:else}
function create_else_block(ctx) {
	let section;
	let files;
	let updating_max;
	let current;

	function files_max_binding(value) {
		/*files_max_binding*/ ctx[11](value);
	}

	let files_props = {};

	if (/*max*/ ctx[0] !== void 0) {
		files_props.max = /*max*/ ctx[0];
	}

	files = new Files({ props: files_props, $$inline: true });
	binding_callbacks.push(() => bind(files, "max", files_max_binding));
	files.$on("cancel", /*cancel*/ ctx[7]);
	files.$on("submit", /*submit*/ ctx[8]);

	const block = {
		c: function create() {
			section = element("section");
			create_component(files.$$.fragment);
			add_location(section, file, 64, 2, 1385);
		},
		m: function mount(target, anchor) {
			insert_dev(target, section, anchor);
			mount_component(files, section, null);
			current = true;
		},
		p: function update(ctx, dirty) {
			const files_changes = {};

			if (!updating_max && dirty & /*max*/ 1) {
				updating_max = true;
				files_changes.max = /*max*/ ctx[0];
				add_flush_callback(() => updating_max = false);
			}

			files.$set(files_changes);
		},
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
		id: create_else_block.name,
		type: "else",
		source: "(64:2) {:else}",
		ctx
	});

	return block;
}

// (60:2) {#if !isAuthenticated}
function create_if_block_1(ctx) {
	let section;
	let login;
	let current;
	login = new Login({ $$inline: true });
	login.$on("cancel", /*cancel*/ ctx[7]);
	login.$on("authenticated", /*authenticated*/ ctx[6]);

	const block = {
		c: function create() {
			section = element("section");
			create_component(login.$$.fragment);
			add_location(section, file, 60, 2, 1279);
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
		id: create_if_block_1.name,
		type: "if",
		source: "(60:2) {#if !isAuthenticated}",
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
	let if_block = /*show*/ ctx[2] && create_if_block(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			t0 = space();
			link0 = element("link");
			link1 = element("link");
			style = element("style");
			style.textContent = "/* Global CSS via SASS */\n#pixxio-integration {\n  font-family: 'Heebo', Arial, Helvetica, sans-serif;\n  font-size: 16px;\n  all: initial; }";
			attr_dev(link0, "rel", "preconnect");
			attr_dev(link0, "href", "https://fonts.gstatic.com");
			attr_dev(link0, "crossorigin", "");
			add_location(link0, file, 75, 2, 1553);
			attr_dev(link1, "href", "https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&family=Work+Sans:wght@400;500&display=swap");
			attr_dev(link1, "rel", "stylesheet");
			add_location(link1, file, 76, 2, 1624);
			attr_dev(style, "lang", "scss");
			add_location(style, file, 78, 2, 1761);
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
			if (/*show*/ ctx[2]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*show*/ 4) {
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
	let enlarge;
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("App", slots, []);
	let { standalone = false } = $$props;
	let { config = { appUrl: "", appKey: "", v1: false } } = $$props;
	let { show = false } = $$props;
	let { max = 0 } = $$props;
	const dispatch = createEventDispatcher();

	onMount(async () => {
		domain.update(() => config.appUrl);
		appKey.update(() => config.appKey);
		v1.update(() => config.v1 || false);
	});

	let loading = false;
	let isAuthenticated = false;
	let searchQuery = "";

	// authenticated
	const authenticated = () => {
		$$invalidate(3, isAuthenticated = true);
	};

	const cancel = () => {
		dispatch("cancel");
	};

	const submit = ({ detail }) => {
		dispatch("submit", detail);
	};

	const writable_props = ["standalone", "config", "show", "max"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
	});

	function searchfield_value_binding(value) {
		searchQuery = value;
		$$invalidate(4, searchQuery);
	}

	function files_max_binding(value) {
		max = value;
		$$invalidate(0, max);
	}

	$$self.$$set = $$props => {
		if ("standalone" in $$props) $$invalidate(1, standalone = $$props.standalone);
		if ("config" in $$props) $$invalidate(9, config = $$props.config);
		if ("show" in $$props) $$invalidate(2, show = $$props.show);
		if ("max" in $$props) $$invalidate(0, max = $$props.max);
	};

	$$self.$capture_state = () => ({
		Logo,
		Loading,
		SearchField,
		Login,
		Files,
		lang,
		createEventDispatcher,
		onMount,
		domain,
		appKey,
		v1,
		standalone,
		config,
		show,
		max,
		dispatch,
		loading,
		isAuthenticated,
		searchQuery,
		authenticated,
		cancel,
		submit,
		enlarge
	});

	$$self.$inject_state = $$props => {
		if ("standalone" in $$props) $$invalidate(1, standalone = $$props.standalone);
		if ("config" in $$props) $$invalidate(9, config = $$props.config);
		if ("show" in $$props) $$invalidate(2, show = $$props.show);
		if ("max" in $$props) $$invalidate(0, max = $$props.max);
		if ("loading" in $$props) loading = $$props.loading;
		if ("isAuthenticated" in $$props) $$invalidate(3, isAuthenticated = $$props.isAuthenticated);
		if ("searchQuery" in $$props) $$invalidate(4, searchQuery = $$props.searchQuery);
		if ("enlarge" in $$props) $$invalidate(5, enlarge = $$props.enlarge);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*isAuthenticated*/ 8) {
			$$invalidate(5, enlarge = isAuthenticated);
		}
	};

	return [
		max,
		standalone,
		show,
		isAuthenticated,
		searchQuery,
		enlarge,
		authenticated,
		cancel,
		submit,
		config,
		searchfield_value_binding,
		files_max_binding
	];
}

class App extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance, create_fragment, safe_not_equal, {
			standalone: 1,
			config: 9,
			show: 2,
			max: 0
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "App",
			options,
			id: create_fragment.name
		});
	}

	get standalone() {
		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set standalone(value) {
		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get config() {
		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set config(value) {
		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get show() {
		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set show(value) {
		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get max() {
		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set max(value) {
		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

class PIXXIO {
	constructor(config = {}, lang = 'en') {
		this.boot();
		this.config = config;
		this.app = new App({
			target: document.querySelector('#pixxio-integration'),
			props: {
				standalone: true,
				config
			}
		});
	}
	boot() {
		const root = document.createElement('div');
		root.id = 'pixxio-integration';
		document.body.appendChild(root);
	};
	getMedia(config) {		
		return new Promise((resolve, reject) => {
			if(config.max) {
				this.app.$set({ max: config.max });
			}
			this.app.$set({ show: true });
			this.app.$on('submit', (event) => {
				this.app.$set({ show: false });
				resolve(event.detail);
			});
			this.app.$on('cancel', () => {
				this.app.$set({ show: false });
				reject();
			});
		}) 
	}
}

window.PIXXIO = PIXXIO;

export default PIXXIO;
//# sourceMappingURL=index.js.map
