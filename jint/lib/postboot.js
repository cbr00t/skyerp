
function setTimeout(proc, ms, ...args) {
	return delay(ms).then(() =>
		proc?.(...args))
}
function clearTimeout() { }
function defer() { return promise(...arguments) }

