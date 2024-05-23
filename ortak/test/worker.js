window = self; const webRoot = '../..', urls = { libExt: `${webRoot}/lib_external` };
const ortakLibs = [`${urls.libExt}/etc/md5.min.js`, `${urls.libExt}/etc/string.js`, `${urls.libExt}/etc/base64.js`, `${webRoot}/lib/ortak/utils.js`, `${webRoot}/classes/ortak/CObject.js`];
const testLibs = ['testBase.js', `${webRoot}/app/parkBulurum/test/tests.js`]
importScripts(...ortakLibs, ...testLibs);

self.onconnect = evt => { const {ports} = evt; for (const socket of ports) { socket.onmessage = evt => handleMessage({ evt, socket, data: evt.data }) } }
self.onmessage = evt => handleMessage({ evt, data: evt.data, socket: self });
self.threadCount = 0;

async function handleMessage(e) {
	const threadIndex = ++self.threadCount, threadId = `w${threadIndex}`, worker = this, {socket, data} = e, {action} = data; let result;
	try {
		switch (action) {
			case 'run':
				const inst = TestBase.newFor(data); if (!inst) { break }
				Object.assign(inst, { worker, socket, threadId }); socket.postMessage({ action: 'start' });
				result = await inst.run();
				if (result !== undefined) { for (const action of ['callback', 'result']) { const _data = { action, result }; socket.postMessage(_data) } }
				socket.postMessage({ action: 'end' }); break
		}
	}
	catch (ex) { socket.postMessage({ action: 'callback', isError: true, error: ex }) }
}
