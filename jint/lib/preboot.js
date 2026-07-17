Object.defineProperty(Object.prototype, 'size', {
	enumerable: false, configurable: true,
	get: function size() {
		return (
			typeof this == 'object' ? this.keys(...arguments).length :
			this.length
		)
	}
})

Object.assign(g, {
	$: {
		extend(...args) {
			let deep = false
			if (typeof args[0] == 'boolean')
				deep = args.shift()
			let target = args.shift()
			let sources = deep
				? args.map(v => structuredClone(v))
				: args;
			return Object.assign(target, ...sources)
		},
		isEmptyObject(v) { return !v || v?.length === 0 || len(v) == 0 },
		isArray(v) { return Array.isArray(v) },
		makeArray(v) { return Array.isArray(v) ? v : [v] }
	},
	addEventListener() { },
	removeEventListener() { },
	navigator: { onLine: true }
})

function len(v) { return Object.size(v) }
function setTimeout(ms) { return delay(ms) }
function clearTimeout() { }
function clr(ns) { return importNamespace(ns) }
function asJS(v) { return isString(v) ? JSON.parse(v) : v }

Object.assign(Object.prototype, {
	js() { return js(this) },
	asJS() { return asJS(this) }
})

