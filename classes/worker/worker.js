
self.window ??= self
self.webRoot ??= '../..'

self.urls = { libExt: `${webRoot}/lib_external` }
self.selfRoot = `${webRoot}/classes/worker`

let ortakLibs = [
	`${urls.libExt}/etc/md5.min.js`, `${urls.libExt}/etc/string.js`, `${urls.libExt}/etc/base64.js`,
	`${webRoot}/lib/ortak/utils.js`, `${webRoot}/classes/ortak/CObject.js`, `${selfRoot}/runnable.js`,
	`${webRoot}/app/ticari/test/runnables.js`, `${webRoot}/app/parkBulurum/test/runnables.js`
]
let runnableLibs = []

importScripts(...ortakLibs, ...runnableLibs)
self.runnableClass = Runnable

self.onconnect = ({ ports }) => {
	;ports.forEach(s => {
		s.onmessage = evt =>
			handleMessage({ evt, socket, data: evt.data })
	})
}
self.onmessage = evt =>
	handleMessage({ evt, data: evt.data, socket: self })
self.threadCount = 0


async function handleMessage({ socket: s, data }) {
	let { runnableClass } = self
	let threadIndex = ++self.threadCount
	let threadId = `w${threadIndex}`
	let worker = self, { action } = data
	let result
	switch (action) {
		case 'run': {
			try {
				let inst = runnableClass.newFor(data)
				if (!inst)
					break
				
				let iterCount = 1
				Object.assign(inst, { worker, socket: s, threadId, iterCount })
				s.postMessage({ action: 'start' })
				
				result = await inst.run({ ...data })
				if (result !== undefined) {
					for (let [k, v] of entries(result)) {
						if (v == self || isInstance(v) || isFunction(v))
							delete result[k]
					}
					;['result'].forEach(action => {
						try { s.postMessage({ action, result }) }
						catch (DataCloneError) {
							result = { ...result }
							s.postMessage({ action, result })
						}
					})
				}
			}
			catch (error) {
				s.postMessage({ action: 'callback', isError: true, error })
				throw error
			}
			finally {
				try { s.postMessage({ action: 'end' }) }
				catch { }
			}
			break
		}
	}
}
