class IPCApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get isLoginRequired() { return false }
	constructor(e) {
		e = e ?? {}; super(e);
		$.extend(this, { ipcKey: qs.ipc ?? qs.ipcKey ?? 'sky-ipc' })
	}
	async runDevam(e) {
		await super.runDevam(e); await this.anaMenuOlustur();
		this.content.children().remove(); this.show(); this.initIPC(e)
	}
	getAnaMenu() { return new FRMenu() }
	initIPC(e) {
		let {content, ipcKey} = this, url = app.getEventStreamURL(ipcKey);
		let es = this.es = new EventSource(url); $.extend(es, {
			onmessage: ({ data }) => this.onMessage({ es, url, ipcKey, data }),
			onopen: () => { content.html(`<div class="info success">ipc running</b>`) },
			onerror: ({ currentTarget: es }) => { content.html(`<div class="info error">ipc stopped</b>`) }
		});
		this.initTimerTest({ ...e, content, es, ipcKey })
	}
	initTimerTest(e) {
		if (this.timerTest) { return } e = e ?? {};
		let ipcKey = e.ipcKey ?? this.ipcKey, es = e.es ?? this.es;
		this.timerTest = setInterval(async () => {
			if (es?.readyState == EventSource.OPEN) { return }
			await app.wsSignal({ key: ipcKey, data: 'undefined' });
		}, 100)
	}
	async onMessage(e) {
		let es = e.es ?? this.es, {data} = e; if (!data) { return }
		let result = eval(data); if (isFunction(result) || result?.call) { result = await getFuncValue.call(this, result, { ...e, es }) }
		if (result === undefined) { return }
		let key = `${e.ipcKey ?? this.ipcKey}-callback`; await app.wsSignal({ key, data: result })
	}
}
