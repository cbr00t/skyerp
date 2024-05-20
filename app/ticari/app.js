class TicariApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { super(e) /*this.mqGlobals = {}*/ }
	paramsDuzenle(e) {
		super.paramsDuzenle(e); const {params} = e;
		$.extend(params, {
			yerel: MQYerelParamTicari.getInstance(), ortak: MQOrtakParam.getInstance(), logocu: MQLogocu.getInstance(), zorunlu: MQZorunluParam.getInstance(), isyeri: MQIsyeri.getInstance(),
			ticariGenel: MQTicariGenelParam.getInstance(), fiyatVeIsk: MQFiyatVeIskontoParam.getInstance(), stokBirim: MQStokBirimParam.getInstance(), stokGenel: MQStokGenelParam.getInstance(),
			cariGenel: MQCariGenelParam.getInstance(), hizmetGenel: MQHizmetGenelParam.getInstance(), demirbasGenel: MQDemirbasGenelParam.getInstance(), bankaGenel: MQBankaGenelParam.getInstance(),
			alim: MQAlimParam.getInstance(), satis: MQSatisParam.getInstance(), eIslem: MQEIslemParam.getInstance(), uretim: MQUretimParam.getInstance(), operGenel: MQOperGenelParam.getInstance()
		})
	}
	sabitTanimlarDuzenle(e) { const {sabitTanimlar} = e; $.extend(sabitTanimlar, { vergi: this.wsSabitTanimlar_xml('EBYN-KDV-Kodlar') }) }
	raporEkSahaDosyalariDuzenle(e) { e.liste.push('VioTicari.RaporEkSaha') }
	async runDevam(e) { await super.runDevam(e); await this.loginIstendi(e); this.anaMenuOlustur(e); this.show() }
	async getAnaMenu() { const response = await ajaxGet({ url: this.getWSUrl({ api: 'frMenu' }) }); return response ? FRMenu.from(response) : null }
	wsSabitTanimlar_xml(e) { e = e || {}; if (e && typeof e != 'object') e = { belirtec: e }; return this.wsSabitTanimlar($.extend({}, e, { tip: 'xml' })) }
	wsSabitTanimlar_secIni(e) { e = e || {}; if (e && typeof e != 'object') e = { belirtec: e }; return this.wsSabitTanimlar($.extend({}, e, { tip: 'sec-ini' })) }
	wsSabitTanimlar_secIni_noDict(e) { e = e || {}; if (e && typeof e != 'object') e = { belirtec: e }; return this.wsSabitTanimlar_secIni($.extend({}, e, { noDict: true })) }
	wsSabitTanimlar_ini(e) { e = e || {}; if (e && typeof e != 'object') e = { belirtec: e }; return this.wsSabitTanimlar($.extend({}, e, { tip: 'ini' })) }
	wsSabitTanimlar_ini_noDict(e) { e = e || {}; if (e && typeof e != 'object') e = { belirtec: e }; return this.wsSabitTanimlar_ini($.extend({}, e, { noDict: true })) }
	async wsSabitTanimlar(e) {
		if (e && typeof e != 'object') e = { belirtec: e };
		if (e) {
			const keys = ['belirtec', 'section', 'belirtecler', 'sections'];
			for (const key of keys) { let value = e[key]; if (value && typeof value != 'string') { value = e[key] = ($.isArray(value) ? value : Object.keys(value)).join(delimWS) } }
		}
		const result = await ajaxGet({ url: this.getWSUrl({ api: 'sabitTanimlar' }), data: e }); return result == null ? null : result
	}
	wsCariEkstre_normal(e) {
		e = e || {}; delete e.args;
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'cariEkstre_normal', args: e }) })
	}
	wsCariEkstre_fiili(e) {
		e = e || {}; delete e.args;
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'cariEkstre_fiili', args: e }) })
	}
	wsBekleyenSiparisler(e) {
		e = e || {}; delete e.args;
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'bekleyenSiparisler', args: e }) })
	}
	async getParamYapilar(e) {
		e = e || {}; const kodListe = typeof e == 'string' ? [e] : $.isArray(e) ? e : (e.kodListe || e.kod);
		const sent = new MQSent({ from: 'yflaglar', where: [`kod <> ''`, `jsonstr <> ''`], sahalar: ['kod', 'jsonstr'] });
		if (kodListe?.length) sent.where.inDizi(kodListe, 'kod')
		const kod2Rec = {}, recs = (await app.sqlExecSelect(sent));
		for (const rec of recs) { kod2Rec[rec.kod] = rec.jsonstr ? JSON.parse(rec.jsonstr) : null }
		return kod2Rec
	}
	wsLogoBilgileri(e) {
		e = e || {}; delete e.args; const streamFlag = e.stream ?? e.streamFlag ?? e.isStream, dataType = streamFlag ? 'text' : undefined;
		return ajaxGet({ timeout: 30000, processData: false, dataType, ajaxContentType: wsContentType, url: app.getWSUrl({ api: 'logoBilgileri', args: e }) })
	}
	wsLogoBilgileriAsStream(e) {
		e = e || {}; e.stream = true; for (const key of ['streamFlag', 'isStream']) { delete e[key] }
		return this.wsLogoBilgileri(e)
	}
}

/*
offset = 5010;
limit = 10;
await ajaxPost({
	cache: false, processData: false,
	dataType: 'json', contentType: 'application/json',
	url: `http://localhost:8200/ws/skyERP/sqlExec/?`+ $.param({
		loginTipi: 'login', user: 'OZER', pass: '',
		offset: offset, maxRow: limit,
		sql: Ortak.toJSONStr({ db: 'BM22ARM' })
	}),
	data: Ortak.toJSONStr({
		execTip: 'dt',
		queries: [
			{ query: `SELECT ${limit ? 'TOP ' + (offset + limit) : ''} * FROM stkmst WHERE kod <> ''` }
		]
	})
});


xw = new XMLWriter();
xw.writeStartDocument();
xw.writeStartElement('cac:Invoice');
xw.writeAttributeString('xmlns', 'http://tempuri.org');
xw.writeAttributeString('xmlns:cac', 'http://cac');
xw.writeAttributeString('xmlns:cbc', 'http://cbc');
xw.writeElementString('ID', 'abc', 'cbc')
xw.writeEndElement();
xw.writeEndDocument();

xml = xw.flush();
console.info(xml);

url = URL.createObjectURL(new Blob([xml], { type: 'application/xml' }))
openNewWindow(url)


document.body.focus();
document.body.scrollTo(0, 0);
html2canvas(app.divMenu[0], { imageTimeout: 3000, removeContainer: true }).then(canvas => {
	img = canvas.toDataURL('image/png');
    doc = new jspdf.jsPDF({ unit: 'px', orientation: 'landscape' });
    doc.addImage(img, 'PNG', 0, 0);
    doc.save()
})

doc = new jspdf.jsPDF({ unit: 'px', orientation: 'landscape' });
doc.html($(`<b>bla bla</b>`)[0], { callback: doc => doc.save() })

*/
