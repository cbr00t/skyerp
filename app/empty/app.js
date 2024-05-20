class EmptyApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isLoginRequired() { return true }
	
	constructor(e) {
		e = e || {};
		super(e)
	}
	
	async runDevam(e) {
		await super.runDevam(e);

		await this.loginIstendi(e);
		await this.promise_ready;
		await this.anaMenuOlustur(e);
		await this.initLayout(e)
	}

	paramsDuzenle(e) {
		super.paramsDuzenle(e);
		
		const {params} = e;
		$.extend(params, { yerel: MQYerelParamApp.getInstance() })
	}

	initLayout(e) {
		// $('#ana-ekran-layout').detach().appendTo(app.content)
	}

	getAnaMenu(e) {
		return new FRMenu({ items: [
			new FRMenuChoice({
				mnemonic: 'GUI1', text: 'Ekran 1',
				block: e => new Ekran1Part().run(e)
			}),
			new FRMenuChoice({
				mnemonic: 'GUI2', text: 'Ekran 2',
				block: e => new Ekran2Part().run(e)
			})
		] })
	}
	
	wsSampleAjaxCall_get(e) {
		e = e || {};
		const url = this.getWSUrl({ api: 'sampleAjaxCall_get', args: e });
		return ajaxGet({ timeout: 13000, url: url })
	}
	wsSampleAjaxCall_postWithData(e) {
		e = e || {};
		const data = e.data || {};
		delete e.data;
		
		const url = this.getWSUrl({ api: 'sampleAjaxCall_postWithData', args: e });
		return ajaxPost({
			timeout: 13000, processData: false, ajaxContentType: wsContentType,
			url: url, args: e, data: data ? toJSONStr(data) : null
		})
	}
}
