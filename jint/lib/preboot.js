Object.assign(globalThis, {
	window: globalThis,
	self: globalThis
})
Object.assign(Object.prototype, {
	size() {
		return (
			typeof this == 'object' ? this.keys(...arguments).length :
			this.length
		)
	}
})
Object.assign(globalThis, {
	len(v) { return Object.size(v) },
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
		isArray() { return Array.isArray(arguments[0]) },
		isEmptyObject(v) { return !v || v?.length === 0 || len(v) == 0 }
	},
	addEventListener() { },
	removeEventListener() { },
	navigator: { onLine: true }
})

function setTimeout(ms) { return delay(ms) }
function clearTimeout() { }

