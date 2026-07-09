Object.defineProperty(Object.prototype, 'size', {
	enumerable: false, writable: false, configurable: true,
	value: function size() {
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
			const target = args.shift()
			const sources = deep
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

