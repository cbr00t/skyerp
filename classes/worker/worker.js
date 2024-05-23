window = self; self.webRoot = '../..'; self.urls = { libExt: `${webRoot}/lib_external` }; self.selfRoot = `${webRoot}/classes/worker`;
const ortakLibs = [
	`${urls.libExt}/etc/md5.min.js`, `${urls.libExt}/etc/string.js`, `${urls.libExt}/etc/base64.js`,
	`${webRoot}/lib/ortak/utils.js`, `${webRoot}/classes/ortak/CObject.js`, `${selfRoot}/runnable.js`
];
const runnableLibs = [];
importScripts(...ortakLibs, ...runnableLibs);

self.runnableClass = Runnable;
self.onconnect = evt => { const {ports} = evt; for (const socket of ports) { socket.onmessage = evt => handleMessage({ evt, socket, data: evt.data }) } }
self.onmessage = evt => handleMessage({ evt, data: evt.data, socket: self });
self.threadCount = 0;

async function handleMessage(e) {
	const threadIndex = ++self.threadCount, threadId = `w${threadIndex}`, worker = this, {socket, data} = e, {action} = data; let result;
	try {
		switch (action) {
			case 'run':
				const inst = self.runnableClass.newFor(data); if (!inst) { break }
				const iterCount = 1; Object.assign(inst, { worker, socket, threadId, iterCount }); socket.postMessage({ action: 'start' });
				result = await inst.run();
				if (result !== undefined) { for (const action of ['callback', 'result']) { const _data = { action, result }; socket.postMessage(_data) } }
				socket.postMessage({ action: 'end' }); break
		}
	}
	catch (ex) { socket.postMessage({ action: 'callback', isError: true, error: ex }) }
}
