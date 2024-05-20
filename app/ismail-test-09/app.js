class IsmailTest09App extends App {
	static get isLoginRequired() { return true }
	
	constructor(e) {
		e = e || {};
		super(e);

		this.mqGlobals = {}
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
		$.extend(params, {
			yerel: MQYerelParamTicari.getInstance(),
			ortak: MQOrtakParam.getInstance(),
			zorunlu: MQZorunluParam.getInstance(),
			isyeri: MQIsyeri.getInstance(),
			ticariGenel: MQTicariGenelParam.getInstance(),
			fiyatVeIsk: MQFiyatVeIskontoParam.getInstance(),
			stokBirim: MQStokBirimParam.getInstance(),
			stokGenel: MQStokGenelParam.getInstance(),
			cariGenel: MQCariGenelParam.getInstance(),
			hizmetGenel: MQHizmetGenelParam.getInstance(),
			demirbasGenel: MQDemirbasGenelParam.getInstance(),
			bankaGenel: MQBankaGenelParam.getInstance(),
			eIslem: MQEIslemParam.getInstance(),
			eIslem2: MQEIslem2Param.getInstance()
		})
	}

	sabitTanimlarDuzenle(e) {
		const {sabitTanimlar} = e;
		/*$.extend(sabitTanimlar, {
			vergi: this.wsSabitTanimlar_xml('EBYN-KDV-Kodlar')
		})*/
	}

	raporEkSahaDosyalariDuzenle(e) {
		e.liste.push(
			'VioTicari.RaporEkSaha'
		)
	}

	initLayout(e) {
		// $('#ana-ekran-layout').detach().appendTo(app.content)
	}

	getAnaMenu(e) {
		return new FRMenu({ items: [
			new FRMenuChoice({ mnemonic: 'G1', text: 'Ana Grup Listele', block: e => MQAnaGrupListele.listeEkraniAc() }),
			new FRMenuChoice({ mnemonic: 'G1', text: 'Stok Grup Listele', block: e => MQStokListele.listeEkraniAc() })
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
