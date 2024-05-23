class Runnable extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }; static get tip() { return null }
	static { Object.assign(this, { Delim_WSPath: '/', Prefix_WSPath: 'ws/', WSContentType: 'application/json; charset=utf-8' }) }
	static get workerPath() { return `${webRoot}/classes/worker/worker.js` }
	static get DefaultWSHost() { return 'localhost' } static get DefaultWSPath() { return 'skyERP' } static get DefaultLoginTipi() { return 'login' }
	static get tip2Class() {
		let result = this._tip2Class;
		if (result == null) {
			result = {}; for (const cls of this.subClasses) { const {tip} = cls; if (tip) { result[tip] = cls } }
			this._tip2Class = result
		}
		return result
	}
	get threadId() { return this._threadId } set threadId(value) { this._threadId = value || 'main' }
	get ws() { let result = this._ws; if (result === undefined) { this.ws = null } return this._ws }
	set ws(value) {
		const {Prefix_WSPath, DefaultWSPath} = this.class, ws = value ?? {}, {url} = ws;
		const ssl = ws.ssl ?? true, host = ws.host ?? ws.hostName ?? ws.hostname ?? this.class.DefaultWSHost, port = ws.port ?? (ssl ? 9200 : 8200);
		let path = (ws.path ?? ws.wsPath)?.trim('/') || DefaultWSPath; if (path && !path.startsWith(Prefix_WSPath)) { path = Prefix_WSPath + path }
		if (path && Array.isArray(path)) { path = path?.length ? path.split(this.Delim_WSPath) : '' }
		this._ws = { url, ssl, host, port, path }
	}
	get wsURLBase() { return this.getWSUrlBase(this.ws) }

	constructor(e) {
		e = e || {}; super(e);
		for (const [key, value] of Object.entries(e)) { if (value !== undefined) { this[key] = value } }
		if (this.runIslemi == null) { this.runIslemi = e.runHandler; for (const key of ['runHandler']) { delete this[key]} }
		if (this.callbackIslemi == null) { this.callbackIslemi = e.callback ?? e.callbackHandler; for (const key of ['callback', 'callbackHandler']) { delete this[key]} }
		for (const key of ['runIslemi']) { const value = this[key]; if (value && typeof value == 'string') { this[key] = eval(value) } }
	}
	static getClass(e) {
		const targetTip = typeof e == 'object' ? e.tip : e;
		for (const [tip, cls] of Object.entries(this.tip2Class)) { if (tip == targetTip) { return cls } }
		return null
	}
	static newFor(e) {
		e = e || {}; if (typeof e != 'object') { e = { tip: e } }
		const cls = this.getClass(e); delete e.tip; return cls ? new cls(e) : null
	}
	threadedRun(e) {
		let threadCount = typeof e == 'object' ? e.threadCount ?? e.count : e; if (threadCount == null) { threadCount = 1 }
		const data = Object.assign({ action: 'run' }, this.serialize());
		for (let i = 0; i < threadCount; i++) { const {socket} = this.getWorker(); socket.postMessage(data) }
		return this
	}
	async run(e) {
		e = e || {}; e.sender = this; const {runIslemi} = this; let result;
		if (runIslemi) { result = await runIslemi.call(this, e) }
		if (result === undefined) { result = await this.runInternal(e) }
		return result
	}
	runInternal(e) { }
	async wsLogin(e) {
		e = e || {}; let session = e.session ?? this.session, loginTipi = e.loginTipi ?? session?.loginTipi;
		if (session == null) { session = { user: e.user ?? '', pass: e.pass ?? '' } }
		if (session != null) { delete session.loginTipi }
		if (loginTipi == null && !(session.sessionID || session.session)) { loginTipi = this.class.DefaultLoginTipi };
		if (session.buildAjaxArgs) { const _session = session; _session.buildAjaxArgs({ args: session = {} }) }
		let result = await this.ajaxCall({ api: loginTipi, args: session ?? {} });
		const {sessionID} = result; this.sessionID = sessionID; return sessionID
	}
	async wsLogout(e) {
		e = e || {}; let sessionID = e.sessionID ?? this.sessionID ?? '';
		let result = await this.ajaxCall({ api: 'logout', args: { sessionID } });
		return (sessionID = this.sessionID = null)
	}
	callback(e) {
		const {socket, threadId} = this, sender = this; Object.assign(e, { sender, threadId });
		console.info('> send callback from thread', e);
		// console.group(); console.debug(e, this); console.groupEnd();
		if (socket) { const _e = Object.assign({ action: 'callback' }, e || {}); delete _e.sender; socket.postMessage(_e) }
		return this
	}
	serialize(e) {
		const {tip} = this.class, result = { tip };
		for (const [key, value] of Object.entries(this)) {
			if (value === undefined) { continue }
			if (typeof value == 'function') { if (typeof value == 'date' || value?.__proto__?.constructor?.name?.toLowerCase() != 'date') { continue } }
			result[key] = value
		}
		for (const key of ['runIslemi']) { const value = this[key]; if (value && typeof value != 'string') { result[key] = value.toString() } }
		return result
	}
	ajaxGet(e) { e.method = 'GET'; return this.ajaxCall(e) } ajaxPost(e) { e.method = 'POST'; return this.ajaxCall(e) }
	async ajaxCall(e) {
		const wsURLBase = this.getWSUrlBase(e), {api} = e; let qs = e.args ?? e.qs, {sessionID} = this, session = e.session ?? (sessionID ? { sessionID } : null);
		if (qs && typeof qs == 'object') {
			const tokens = []; for (const [key, value] of Object.entries(qs)) { tokens.push(value === undefined ? key : `${key}=${value}`) };
			qs = tokens.length ? tokens.join('&') : ''
		}
		if (session) {
			if (session.loginTipi == null && !(session.sessionID || session.session)) { session.loginTipi = this.class.DefaultLoginTipi };
			if (session.buildAjaxArgs) { const _session = session; _session.buildAjaxArgs({ args: session = {} }) }
			/*let sessionStr = JSON.stringify(session); if (sessionStr) { sessionStr = self.Base64 ? Base64.encode(sessionStr) : btoa(sessionStr) }*/
			if (session) {
				let sessionStr;
				if (typeof session == 'string') { sessionStr = `session=${session}` }
				else {
					const _tokens = []; for (const [key, value] of Object.entries(session)) { _tokens.push(value === undefined ? key : `${key}=${value}`) }
					const _qs = `${_tokens.length ? _tokens.join('&') : ''}`;
					if (_qs) { qs = qs ?`${_qs}&${qs}` : _qs }
				}
			}
		}
		const qsStr = qs ? `?${qs}` : ''; const url = `${wsURLBase}/${api}/${qsStr}`;
		const body = e.data ?? e.body, method = e.method ?? (body == null ? 'GET' : 'POST'), contentType = e.contentType ?? e.type ?? this.class.WSContentType;
		const resp = await fetch(url, { method, body, headers: { 'Content-Type': contentType } }), respData = await resp.json();
		if (resp.ok) { return respData } else { throw respData }
	}
	getWSUrlBase(e) {
		const ws = Object.assign({}, this.ws, e || {}), {url} = ws; if (url) { return url }
		const {ssl, host, port, path} = ws; return `http${ssl ? 's' : ''}://${host}:${port}/${path}`
	}
	getWorker() {
		const multiWorkerFlag = self.SharedWorker ? this.multiWorkerFlag : false, {workerPath} = this.class, worker = new (multiWorkerFlag ? self.Worker : self.SharedWorker)(workerPath);
		const socket = multiWorkerFlag ? worker : worker.port;
		socket.onmessage = evt => this.handleMessage({ evt, worker, socket, data: evt.data });
		return { worker, socket }
	}
	handleMessage(e) {
		const {data, socket} = e, {action} = data;
		switch (action) {
			case 'callback': case 'result': this.onCallback(e); break
			case 'end': if (socket?.close) { socket?.close() } break
		}
	}
	onCallback(e) {
		const {callbackIslemi, threadId} = this, sender = this, data = e.data || {}, {action, result, isError} = data;
		Object.assign(e, { sender, threadId, action });
		if (isError) { const {error} = data; e.error = error; console.error('< recv error from thread', error) }
		else { if (action == 'result') { e.result = result; console.info('< recv result from thread', result) } else { console.debug('< recv callback from thread', data) } }
		// console.group(); console.debug(e, this); console.groupEnd();
		if (callbackIslemi) { callbackIslemi.call(this, e) }
	}
	multiWorker() { this.multiWorkerFlag = true; return this }
	sharedWorker() { this.multiWorkerFlag = false; return this }
	setRunIslemi(handler) { this.runIslemi = handler; return this }
	setCallbackIslemi(handler) { this.callbackIslemi = handler; return this }
}
class CustomRunnable extends Runnable { static { window[this.name] = this; this._key2Class[this.name] = this }; static get tip() { return 'custom-runnable' } }
