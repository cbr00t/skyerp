class IPCApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this } static MaxCloseCount = (asInteger(Math.random() * 10) % 5) + 6;
    get isLoginRequired() { return false } /*get defaultWSPath() { return 'ws/skyERP' }*/
    constructor(e) {
        e = e ?? {}; super(e);
        $.extend(this, { ipcKey: qs.ipc ?? qs.ipcKey ?? 'sky-ipc', ws: null, closeCount: 0 })
    }
    async runDevam(e) {
		if (qs.user) { await app.loginIstendi() }
		await super.runDevam(e)
	}
	async afterRun(e) {
		await super.afterRun(e);
		this.content.children().remove(); this.show(); this.initIPC(e)
    }
    getAnaMenu() { return new FRMenu() }
    /** WebSocket IPC bağlantısını başlatır */
    async initIPC(e) {
        e = e ?? {}; let {content, ipcKey} = this, url = app.getWebSocketURL({ key: ipcKey });
        this.ws?.close(); let ws = this.ws = new WebSocket(url);
        $.extend(ws, {
            onopen: () => {
				content.html(`<div class="info success">IPC WebSocket aktif</div>`);
				this.closeCount = 0; this.initTimerTest({ ...e, content, ipcKey })
			},
            onmessage: async ({ data }) => this.onMessage({ ...e, ws, ipcKey, data }),
            onerror: ({ currentTarget: ws }) => {
				setTimeout(()=> content.html(`<div class="info error">IPC WebSocket erişim sorunu</div>`), 10);
				this.initTimerTest({ ...e, content, ipcKey })
			},
            onclose: ({ reason }) => {
				content.html(`<div class="info error">IPC WebSocket kapandı</div>`);
				if (qs.internal) {
					if (++this.closeCount >= this.class.MaxCloseCount || reason == 'ClosedByServer') {
						clearInterval(this.timerTest); delete this.timerTest
						self.close()
						return
					}
				}
				this.initTimerTest({ ...e, content, ipcKey })
			}
        })
    }
    /** WebSocket IPC bağlantısı için keep-alive mekanizması */
    initTimerTest(e = {}) {
        if (this.timerTest)
			return
		let ipcKey = e.ipcKey ?? this.ipcKey;
        this.timerTest = setInterval(async () => {
			let {ws} = this
			switch (ws?.readyState) {
				case WebSocket.OPEN: break
				case WebSocket.CLOSED: await this.initIPC(e); return
				default: return
			}
            // await ws.send(toJSONStr({ result: undefined }))
        }, 1_000)
    }
    /** Gelen WebSocket mesajlarını işleyerek eval() çalıştırır */
    async onMessage(e) {
        let ws = e.ws ?? this.ws, {data} = e; if (!data) { return }
        e = e ?? {}; $.extend(e, {
            ws, 
            callback: result => ws.send(toJSONStr({ result }))
        });
		let evalStr, result;
        try {
            /* Gelen mesajı `(e => { ... })` formatına dönüştürüp eval() et */
            evalStr = `(async e => { ${data} })`, result = await eval(evalStr);
            /* Eğer sonuç fonksiyon döndürüyorsa, tekrar çalıştır */
            if (isFunction(result) || result?.run) { result = await getFuncValue.call(this, result, e) }
        } catch (ex) {
			e.callback({ isError: true, code: ex.code ?? ex.rc, errorText: getErrorText(ex) });
			console.error('WebSocket eval() hatası', ex, { evalStr, result })
		}
    }
}

/*
	ÖRNEK KULLANIM  [console]:
		let key = 'x', data = `alert('A'); e.callback(await MQCari.loadServerData())`;
		await app.wsWebSocket_writeAll({ key, data })
		let result; try { result = await app.wsWebSocket_readAny({ key }) } catch (ex) { console.error(getErrorText(ex)) }
		result = result?.result;
		console.table(result)

		
		let key = 'skyERP-1';
		{
			let result; try { result = await app.wsBrowserIPC({ key }) } catch (ex) { console.error(getErrorText(ex)) }
			result = result?.result ?? result;
			console.table(result)
		}
		new $.Deferred(p => setTimeout(() => p.resolve(), 1000))
		{
			let {loginTipi, user, pass} = config.session, sessionStr = toJSONStr({ loginTipi, user, pass });
		    let wsSQLStr = toJSONStr(app.wsSQL), data = `let {callback} = e;
		    app.wsSQL = ${wsSQLStr};
		    config.session = new Session(${sessionStr});
		    let fis = new SatisFaturaFis({
		        seri: 'TST', fisNo: 100001, mustKod: '12011003', detaylar: [
		            { seq: 1, shKod: '42-695', miktar: 1 },
		            { seq: 2, shKod: '42-609', miktar: 1 }
		        ]
		    });
		    let result = await fis.yaz();
			await callback({ result, session: config.session, wsSQL: app.wsSQL });
			`;
		    console.info('eval', data);
			await app.wsWebSocket_write({ key, data })
			let result; try { result = await app.wsWebSocket_read({ key }) } catch (ex) { console.error(getErrorText(ex)) }
			result = result?.result;
			console.table(result)
		}

		let key = 'skyERP-1';
		{
			let result; try { result = await app.wsBrowserIPC({ key }) } catch (ex) { console.error(getErrorText(ex)) }
			result = result?.result ?? result;
			console.table(result)
		}
		new $.Deferred(p => setTimeout(() => p.resolve(), 1000))
		{
			let {loginTipi, user, pass} = config.session, sessionStr = toJSONStr({ loginTipi, user, pass });
		    let wsSQLStr = toJSONStr(app.wsSQL), data = `let {callback} = e;
		    app.wsSQL = ${wsSQLStr};
		    config.session = new Session(${sessionStr});
		    await callback({ result: 'opened' });
			await callback({ result: 'closing' });
		    self.close()
			`;
		    console.info('eval', data);
			await app.wsWebSocket_write({ key, data })
		    for (let i = 0; i < 2; i++) {
		        let result; try { result = await app.wsWebSocket_read({ key }) } catch (ex) { console.error(getErrorText(ex)) }
		    	result = result?.result; console.table(result)
		    }
		}

		let key = 'skyERP-1';
		{
			let result; try { result = await app.wsBrowserIPC({ key }) } catch (ex) { console.error(getErrorText(ex)) }
			result = result?.result ?? result;
			console.table(result)
		}
		new $.Deferred(p => setTimeout(() => p.resolve(), 1000))
		{
			let {loginTipi, user, pass} = config.session, sessionStr = toJSONStr({ loginTipi, user, pass });
		    let wsSQLStr = toJSONStr(app.wsSQL), data = `let {callback} = e;
		    app.wsSQL = ${wsSQLStr};
		    config.session = new Session(${sessionStr});
		    await callback({ result: 'opened' });
		    await eConfirm('s.a');
			await callback({ result: 'a.s' });
		    await new $.Deferred(p => setTimeout(() => p.resolve(), 2000));
		    await callback({ result: 'closing' });
		    self.close()
			`;
		    console.info('eval', data);
			await app.wsWebSocket_write({ key, data })
		    for (let i = 0; i < 3; i++) {
		        let result; try { result = await app.wsWebSocket_read({ key }) } catch (ex) { console.error(getErrorText(ex)) }
		    	result = result?.result; console.table(result)
		    }
		}


		# WebAPI Call
		let ws = new WebSocket(`ws://localhost:8200/ws/genel/webSocket/?key=mes`)
		ws.onmessage = ({ data }) => {
			try { data = JSON.parse(data) } catch (ex) { }
			console.info(data)
		}
		ws.onerror = evt => console.error(evt)
		let payload = { ws: 'ws/genel', api: 'ping' }
		await delay(200)
		ws.send(toJSONStr(payload))



		let code = `import app; thread(lambda: app.updateSelf())`
		let actions = [{ cmd: 'exec', args: [code] }]
		let data = toJSONStr({ actions })
		await ajaxPost({ ajaxContentType: 'text', url: `https://localhost:9200/ws/skyMES/makineDurum/setExecCode/?ip=192.168.1.123`, data });
		/*let ws = new WebSocket(`ws://localhost:8200/ws/skyMES/makineDurum/webSocket/?key=mes&.ip=192.168.1.123&`)
		ws.onmessage = ({ data }) => {
			try { data = JSON.parse(data) } catch (ex) { }
			console.table(data)
		}
		ws.onerror = evt => console.error(evt)
		await delay(50)
		{ let payload = { api: 'fnIslemi', id: 'primary' }; ws.send(toJSONStr(payload)) }
		{ let payload = { api: 'fnIslemi', id: 'primary' }; ws.send(toJSONStr(payload)) }
		
		
		let ws = new WebSocket(`ws://localhost:8200/ws/skyMES/makineDurum/webSocket/?key=mes&.ip=192.168.1.123&`)
		ws.onmessage = ({ data }) => {
			try { data = JSON.parse(data) } catch (ex) { }
			console.table(data)
		}
		ws.onerror = evt => console.error(evt)
		await delay(50)
		{ let payload = { api: 'fnIslemi', id: 'primary' }; ws.send(toJSONStr(payload)) }
		{ let payload = { api: 'fnIslemi', id: 'primary' }; ws.send(toJSONStr(payload)) }


		let code = `# !! indent önemli !! #
import app
async def proc():
	await app.onKeyPressed('enter')
	await app.onKeyPressed('enter')
	await app.onKeyPressed('enter')
	await app.onKeyPressed('enter')
thread(proc)`
		let actions = [{ cmd: 'exec', args: [code] }]
		let data = toJSONStr({ actions })
		await ajaxPost({ ajaxContentType: 'text', url: `https://localhost:9200/ws/skyMES/makineDurum/setExecCode/?ip=192.168.1.123`, data });
		/-*let ws = new WebSocket(`ws://localhost:8200/ws/skyMES/makineDurum/webSocket/?key=mes&.ip=192.168.1.123&`)
		ws.onmessage = ({ data }) => {
			try { data = JSON.parse(data) } catch (ex) { }
			console.table(data)
		}
		ws.onerror = evt => console.error(evt)
		await delay(50)
		{ let payload = { api: 'fnIslemi', id: 'primary' }; ws.send(toJSONStr(payload)) }
		{ let payload = { api: 'fnIslemi', id: 'primary' }; ws.send(toJSONStr(payload)) }*-/
*/
