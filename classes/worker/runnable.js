class Runnable extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this };
	static get workerPath() { return `${webRoot}/classes/worker/worker.js` }
	static get rootTip() { return null } static get altTip() { return null }
	static get tip() { const {rootTip, altTip} = this; return [rootTip, altTip].filter(x => !!x).join('-') }
	static { Object.assign(this, { Delim_WSPath: '/', Prefix_WSPath: 'ws/', WSContentType: 'application/json; charset=utf-8' }) }
	static get DefaultWSHost() { return 'localhost' } static get DefaultWSPath() { return 'skyERP' } static get DefaultLoginTipi() { return 'login' }
	static get tip2Class() {
		let result = this._tip2Class;
		if (result == null) {
			result = {}
			for (let cls of this.subClasses) {
				let {tip} = cls
				if (tip)
					result[tip] = cls
			}
			this._tip2Class = result
		}
		return result
	}
	get threadId() { return this._threadId }
	set threadId(value) { this._threadId = value || 'main' }
	get currentThreadCount() { return this.worker?.currentThreadCount }
	get inWorker() { return !!this.currentThreadCount }
	get ws() {
		let result = this._ws
		if (result === undefined)
			this.ws = null
		return this._ws
	}
	set ws(value) {
		let {Prefix_WSPath, DefaultWSPath} = this.class
		let ws = value ?? {}, {url} = ws
		let ssl = ws.ssl ?? true, host = ws.host ?? ws.hostName ?? ws.hostname ?? this.class.DefaultWSHost
		let port = ws.port ?? (ssl ? 9200 : 8200)
		let path = (ws.path ?? ws.wsPath)?.trim('/') || DefaultWSPath
		if (path && !path.startsWith(Prefix_WSPath))
			path = Prefix_WSPath + path
		if (path && isArray(path))
			path = path?.length ? path.split(this.Delim_WSPath) : ''
		this._ws = { url, ssl, host, port, path }
	}
	get wsURLBase() { return this.getWSUrlBase(this.ws) }

	constructor(e = {}) {
		super(e)
		this.multiWorker()
		for (let [key, value] of entries(e)) {
			if (value !== undefined)
				this[key] = value
		}
		if (this.runIslemi == null) {
			this.runIslemi = e.runHandler
			delete this.runHandler
		}
		if (this.callbackIslemi == null) {
			this.callbackIslemi = e.callback ?? e.callbackHandler
			deleteKeys(this, 'callback', 'callbackHandler')
		}
		['runIslemi'].forEach(key => {
			let value = this[key]
			if (value && isString(value))
				this[key] = eval(value)
		})
	}
	static getClass(e) {
		let targetTip = isObject(e) ? e.tip : e
		for (let [tip, cls] of entries(this.tip2Class)) {
			if (tip == targetTip)
				return cls
		}
		return null
	}
	static newFor(e = {}) {
		if (!isObject(e))
			e = { tip: e }
		let cls = this.getClass(e)
		delete e.tip
		return cls ? new cls(e) : null
	}
	threadedRun(e = {}) {
		let threadCount = (isObject(e) ? e.threadCount ?? e.iterCount ?? e.count : e) ?? 1
		let args = isObject(e) ? { ...e } : {}
		let data = Object.assign(this.serialize(), { action: 'run', ...args })
		this.abortFlag = false
		for (let i = 0; i < threadCount; i++) {
			let { socket: s } = this.getWorker()
			s.postMessage(data)
		}
		return this
	}
	async run(e = {}) {
		if (!isObject(e))
			e = { iterCount: e }
		e.sender = this
		this.abortFlag = false
		let iterCount = isObject(e) ? e.iterCount ?? e.threadCount ?? e.count : e
		if (iterCount != null && isNumber(iterCount))
			this.iterCount = iterCount
		if (this.iterCount == null)
			iterCount = this.iterCount = 1
		let result = await this.runIslemi?.call?.(this, e)
		if (result === undefined)
			result = await this.runInternal(e)
		return result
	}
	async runSync(e) {
		e = e ?? {}; if (typeof e != 'object') { e = { iterCount: e } }; e.sender = this; this.abortFlag = false
		let iterCount = isObject(e) ? e.iterCount ?? e.threadCount ?? e.count : e; this.iterCount = 1
		if (iterCount != null && typeof iterCount != 'number')
			this.iterCount = null
		if (iterCount == null)
			iterCount = 1
		let results = []
		let {runIslemi, callbackIslemi} = this
		for (let i = 0; !this.abortFlag && ((iterCount || 0) <= 0 || i < iterCount); i++) {
			let result
			if (runIslemi)
				result = await runIslemi.call(this, e)
			if (result === undefined)
				result = await this.runInternal(e)
			results.push(result)
		}
		let result = this.result = results.at(-1)
		callbackIslemi?.call?.(this, { data: { action: 'result', results, result } })
		return result
	}
	async runAsync(e) {
		e = e ?? {}; if (typeof e != 'object') { e = { iterCount: e } }; e.sender = this; this.abortFlag = false
		let iterCount = isObject(e) ? e.iterCount ?? e.threadCount ?? e.count : e; this.iterCount = 1
		if (iterCount != null && typeof iterCount != 'number')
			this.iterCount = null
		if (!iterCount)
			iterCount = 1
		let promises = []
		let {runIslemi, callbackIslemi} = this
		for (let i = 0; !this.abortFlag && i < iterCount; i++) {
			promises.push(new $.Deferred(async p => {
				let result
				try {
					if (runIslemi)
						result = await runIslemi.call(this, e)
					if (result === undefined)
						result = await this.runInternal(e)
				}
				catch (ex) { result = { isError: true, result } }
				p.resolve(result)
			}))
		}
		let results = await Promise.all(promises)
		let result = this.result = results.at(-1)
		callbackIslemi?.call?.(this, { data: { action: 'result', results, result } })
		return result
	}
	stop(e) { this.abortFlag = true; return this }
	runInternal(e) { }
	async wsLogin(e) {
		e = Object.assign({}, e || {}); let session = e.session ?? this.session, loginTipi = e.loginTipi ?? session?.loginTipi;
		if (session == null) { session = { user: e.user ?? '', pass: e.pass ?? '', sessionID: e.sessionID ?? '', session: e.session } } else { session = Object.assign({}, session) }
		if (session != null) { delete session.loginTipi }
		if (loginTipi == null && !(session.sessionID || session.session)) { loginTipi = this.class.DefaultLoginTipi };
		if (session.buildAjaxArgs) { const _session = session; _session.buildAjaxArgs({ args: session = {} }) }
		let result = await this.ajaxCall({ api: loginTipi, args: session ?? {} });
		const {sessionID} = result; this.sessionID = sessionID; return sessionID
	}
	async wsLogout(e) {
		e = e ?? {}; let sessionID = e.sessionID ?? this.sessionID ?? '';
		let result = await this.ajaxCall({ api: 'logout', args: { sessionID } });
		return (sessionID = this.sessionID = null)
	}
	callback(e) {
		let sender = this, {socket, threadId, callbackIslemi} = this
		Object.assign(e, { sender, threadId })
		console.debug('> send callback from thread', e)
		// console.group(); console.debug(e, this); console.groupEnd();
		if (socket) {
			let _e = Object.assign({ action: 'callback' }, e || {})
			deleteKeys(_e, 'sender')
			socket.postMessage(_e)
		}
		else {
			let _e = { ...e }
			entries(_e).forEach(([k, v]) => {
				if (v === undefined)
					delete _e[k]
			})
			callbackIslemi?.call?.(this, { data: { action: 'callback', ..._e } })
		}
		return this
	}
	serialize(e) {
		let { tip } = this.class
		let result = { tip }
		for (let [key, value] of entries(this)) {
			if (value === undefined || (isFunction(value) && !isDate(value)))
				continue
			result[key] = value
		}
		;['runIslemi'].forEach(key => {
			let value = this[key]
			if (value && !isString(value))
				result[key] = value.toString()
		})
		return result
	}
	ajaxGet(e) {
		e.method = 'GET'
		return this.ajaxCall(e)
	}
	ajaxPost(e) {
		e.method = 'POST'
		return this.ajaxCall(e)
	}
	async ajaxCall(e) {
		let {api} = e, qs = e.args ?? e.qs
		let {sessionID} = this
		let session = e.session ?? (sessionID ? { sessionID } : null)
		if (qs && isObject(qs)) {
			let tokens = []
			for (let [key, value] of entries(qs))
				tokens.push(value === undefined ? key : `${key}=${value}`)
			qs = tokens.length ? tokens.join('&') : ''
		}
		if (session) {
			if (session.loginTipi == null && !(session.sessionID || session.session))
				session.loginTipi = this.class.DefaultLoginTipi
			if (session.buildAjaxArgs) {
				let _session = session
				_session.buildAjaxArgs({ args: session = {} })
			}
			/*let sessionStr = JSON.stringify(session); if (sessionStr) { sessionStr = self.Base64 ? Base64.encode(sessionStr) : btoa(sessionStr) }*/
			if (session) {
				let sessionStr
				if (isString(session))
					sessionStr = `session=${session}`
				else {
					let _tokens = []
					for (let [key, value] of entries(session))
						_tokens.push(value === undefined ? key : `${key}=${value}`)
					let _qs = `${_tokens.length ? _tokens.join('&') : ''}`
					if (_qs)
						qs = qs ?`${_qs}&${qs}` : _qs
				}
			}
		}
		let wsURLBase = this.getWSUrlBase(e)
		let qsStr = qs ? ('?' + qs) : ''
		let url = `${wsURLBase}/${api}/${qsStr}`
		let body = e.data ?? e.body
		let method = e.method ?? (body == null ? 'GET' : 'POST')
		let contentType = e.contentType ?? e.type ?? this.class.WSContentType
		let resp = await fetch(url, {
			method, body,
			headers: { 'Content-Type': contentType }
		})
		let res = await resp.json()
		if (!resp.ok)
			throw res 
		return res
	}
	getWSUrlBase(e) {
		let ws = Object.assign({}, this.ws, e || {})
		let {url} = ws
		if (url)
			return url
		let {ssl, host, port, path} = ws
		return `http${ssl ? 's' : ''}://${host}:${port}/${path}`
	}
	getWorker() {
		let {workerPath} = this.class
		let multiWorkerFlag = self.SharedWorker ? this.multiWorkerFlag : false
		let worker = new (multiWorkerFlag ? self.Worker : self.SharedWorker)(workerPath)
		let socket = multiWorkerFlag ? worker : worker.port
		socket.onmessage = evt =>
			this.handleMessage({ evt, worker, socket, data: evt.data })
		socket.onerror = evt =>
			cerr('getWorker', evt)
		return { worker, socket }
	}
	handleMessage(e) {
		let {data, socket} = e, {action} = data
		switch (action) {
			case 'callback':
			case 'result':
				this.onCallback(e)
				/*if (action == 'result')
					socket?.close?.()*/
				break
			case 'end':
				if (socket) {
					socket.close?.()
					socket.terminate?.()
				}
				break
		}
	}
	onCallback(e) {
		let sender = this, data = e.data || {}
		let { action, result, isError } = data
		let { threadId, callbackIslemi } = this
		Object.assign(e, { sender, threadId, action })
		
		if (isError) {
			let {error} = data
			e.error = error
			console.error('< recv error from thread', error)
		}
		else {
			if (action == 'result') {
				this.result = e.result = result
				console.debug('< recv result from thread', result)
			}
			else
				console.debug('< recv callback from thread', data)
			callbackIslemi?.call?.(this, e)
		}
		// console.group(); console.debug(e, this); console.groupEnd()
	}
	multiWorker() { this.multiWorkerFlag = true; return this }
	sharedWorker() { this.multiWorkerFlag = false; return this }
	setRunIslemi(handler) { this.runIslemi = handler; return this }
	setCallbackIslemi(handler) { this.callbackIslemi = handler; return this }
}

class CustomRunnable extends Runnable {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'custom-runnable' }
}



/*
let resolve
let p = new Promise(_ => resolve = _)
let r = new CustomRunnable({
	runIslemi: ({ a, sender: s }) => {
		s.callback({ _: 'ara callback 1', a })
		s.callback({ _: 'ara callback 2', a })
		return 'final result'
	},
	callbackIslemi: ({ data, data: { action } }, ...rest) => {
		console.info('thread callback', data, ...rest)
		if (action == 'result')
			resolve(data)
	}
})
await r.threadedRun({ a: 1 })
await p
r
*/
