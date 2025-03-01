class IPCApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    get isLoginRequired() { return false; } get defaultWSPath() { return 'ws/genel' }
    constructor(e) {
        e = e ?? {}; super(e);
        $.extend(this, { ipcKey: qs.ipc ?? qs.ipcKey ?? 'sky-ipc', ws: null })
    }
    async runDevam(e) {
        await super.runDevam(e); await this.anaMenuOlustur();
        this.content.children().remove(); this.show(); this.initIPC(e)
    }
    getAnaMenu() { return new FRMenu(); }
    /** WebSocket IPC bağlantısını başlatır */
    initIPC(e) {
        e = e ?? {}; let {content, ipcKey} = this, url = app.getWebSocketURL({ key: ipcKey });
        this.ws?.close(); let ws = this.ws = new WebSocket(url);
        $.extend(ws, {
            onopen: () => content.html(`<div class="info success">IPC WebSocket aktif</div>`),
            onmessage: async ({ data }) => this.onMessage({ ...e, ws, ipcKey, data }),
            onerror: ({ currentTarget: ws }) => content.html(`<div class="info error">IPC WebSocket erişim sorunu</div>`),
            onclose: () => content.html(`<div class="info error">IPC WebSocket kapandı</div>`)
        });
        this.initTimerTest({ ...e, content, ws, ipcKey })
    }
    /** WebSocket IPC bağlantısı için keep-alive mekanizması */
    initTimerTest(e) {
        if (this.timerTest) { return; } e = e ?? {};
        let ipcKey = e.ipcKey ?? this.ipcKey, ws = e.ws ?? this.ws;
        this.timerTest = setInterval(async () => {
			switch (ws?.readyState) {
				case WebSocket.OPEN: break
				//case WebSocket.CLOSED: this.initIPC(e); return
				default: return
			}
            await ws.send(toJSONStr({ result: undefined }))
        }, 1000)
    }
    /** Gelen WebSocket mesajlarını işleyerek eval() çalıştırır */
    async onMessage(e) {
        let ws = e.ws ?? this.ws, {data} = e; if (!data) { return }
        e = e ?? {}; $.extend(e, {
            ws, 
            callback: data => ws.send(toJSONStr({ result: data }))
        });
        try {
            /* Gelen mesajı `(e => { ... })` formatına dönüştürüp eval() et */
            let evalStr = `(e => { ${data} })`, result = await eval(evalStr);
            /* Eğer sonuç fonksiyon döndürüyorsa, tekrar çalıştır */
            if (isFunction(result) || result?.run) { result = await getFuncValue.call(this, result, e) }
        } catch (err) { console.error("WebSocket eval() hatası:", err) }
    }
}
