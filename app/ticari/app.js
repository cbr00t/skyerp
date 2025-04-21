class TicariApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get testBaseClass() { return Ticari_TestBase } get yerelParamSinif() { return MQYerelParamTicari }
	constructor(e) { e = e ?? {}; super(e); $.extend(this, { satisTipleri: e.satisTipleri }) }
	paramsDuzenle(e) {
		super.paramsDuzenle(e); const {params} = e;
		$.extend(params, {
			logocu: MQLogocu.getInstance(), zorunlu: MQZorunluParam.getInstance(), isyeri: MQIsyeri.getInstance(),
			ticariGenel: MQTicariGenelParam.getInstance(), aktarim: MQAktarimParam.getInstance(), fiyatVeIsk: MQFiyatVeIskontoParam.getInstance(), stokBirim: MQStokBirimParam.getInstance(), stokGenel: MQStokGenelParam.getInstance(),
			cariGenel: MQCariGenelParam.getInstance(), hizmetGenel: MQHizmetGenelParam.getInstance(), demirbasGenel: MQDemirbasGenelParam.getInstance(), bankaGenel: MQBankaGenelParam.getInstance(),
			alim: MQAlimParam.getInstance(), satis: MQSatisParam.getInstance(), eIslem: MQEIslemParam.getInstance(), uretim: MQUretimParam.getInstance(), operGenel: MQOperGenelParam.getInstance(),
			kalite: MQKaliteParam.getInstance(), muhasebe: MQMuhasebeParam.getInstance(), web: MQWebParam.getInstance(),
			eMailVT: MQVTMailParam.getInstance(), eMailOrtak: MQOrtakMailParam.getInstance()
		})
	}
	sabitTanimlarDuzenle(e) { super.sabitTanimlarDuzenle(e); const {sabitTanimlar} = e; $.extend(sabitTanimlar, { vergi: this.wsSabitTanimlar_xml('EBYN-KDV-Kodlar') }) }
	static tumModulleriDuzenle(e) {
		super.tumModulleriDuzenle(e); const {liste} = e; liste.push(
			...Modul.subClasses
			/*Modul_CokluSube, Modul_EDefter, Modul_Demirbas, Modul_ETicaret, Modul_WebRapor, Modul_WebOzetRapor, Modul_TicariKosul, Modul_Promosyon, Modul_MasrafYeri, Modul_SicakSatis,
			Modul_DisTicaret, Modul_EIslem, Modul_EIrsaliye, Modul_EMustahsil, Modul_Emanet, Modul_Fason, Modul_MustahsilMakbuzu, Modul_TalepTeklif, Modul_TicariPDKS, Modul_Magaza, Modul_YazarKasa,
			Modul_Kalite, Modul_Uretim, Modul_UretimMaliyetMuhasebesi, Modul_SuperAgac, Modul_RBK, Modul_Tekstil, Modul_SevkiyatPlani, Modul_TabletDepo, Modul_TabletSahaSatis,
			Modul_TabletSutToplama, Modul_SutAlim, Modul_UygunsuzlukYonetimi, Modul_OfflineSube, Modul_KonsinyeLojistik, Modul_SiteYonetim*/
		)
	}
	raporEkSahaDosyalariDuzenle(e) { super.raporEkSahaDosyalariDuzenle(e); const {liste} = e; liste.push('VioTicari.RaporEkSaha') }
	async afterRun(e) { await super.afterRun(e); await this.anaMenuOlustur(e); this.show() }
	async getAnaMenu() { const response = await ajaxGet({ url: this.getWSUrl({ api: 'frMenu' }) }); return response ? FRMenu.from(response) : null }
	async getMailParam(e) {
		let {eMailKeys} = MQEMailUst, {params} = this;
		let setValues = (source, target) => {
			if (!(source && target)) { return }
			for (let key of eMailKeys) { let value = source[key]; if (value) { target[key] = value } }
			target.port = target.port || target.defaultPort
		};
		let recs = await MQEMailUst.loadServerData(e); if (!recs?.length) {
			let {eMailVT, eMailOrtak} = params, rec;
			for (let param of [eMailOrtak, eMailVT]) {
				if (!param) { continue }
				if (rec == null) { rec = new MQEMailUst() }
				setValues(param, rec); recs = [rec]
			}
		}
		{
			let rec = recs?.length <= 1 ? recs?.[0] : recs[asInteger(now().getTime()) % recs.length];
			if ($.isPlainObject(rec)) {
				let inst = new MQEMailUst(); await inst.setValues({ rec });
				rec = inst
			}
			return rec
		}
	}
	satisTipleriBelirle(e) {
		let sent = new MQSent({ from: 'satistipi', sahalar: ['kod', 'aciklama'] })
		return app.sqlExecSelect(sent).then(recs => this.satisTipleri = recs)
	}
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
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] }
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'cariEkstre_normal', args: e }) })
	}
	wsCariEkstre_fiili(e) {
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] }
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'cariEkstre_fiili', args: e }) })
	}
	wsCariEkstre_detaylar(e) {
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] }
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'cariEkstre_detaylar', args: e }) })
	}
	wsKapanmayanHesaplar(e) {
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] }
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'kapanmayanHesaplar', args: e }) })
	}
	wsTopluDurum(e) {
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] }
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'topluDurum', args: e }) })
	}
	wsBekleyenSiparisler(e) {
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] }
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'bekleyenSiparisler', args: e }) })
	}
	wsBekleyenSiparisler_detaylar(e) {
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] }
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'bekleyenSiparisler_detaylar', args: e }) })
	}
	wsSiparisler(e) {
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] }
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'siparisler', args: e }) })
	}
	wsSiparisler_detaylar(e) {
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] }
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'siparisler_detaylar', args: e }) })
	}
	wsBekleyenIrsaliyeler(e) {
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] }
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'bekleyenIrsaliyeler', args: e }) })
	}
	wsBekleyenIrsaliyeler_detaylar(e) {
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] }
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'bekleyenIrsaliyeler_detaylar', args: e }) })
	}
	wsIrsaliyeler(e) {
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] }
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'irsaliyeler', args: e }) })
	}
	wsIrsaliyeler_detaylar(e) {
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] }
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'irsaliyeler_detaylar', args: e }) })
	}
	wsFaturalar(e) {
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] }
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'faturalar', args: e }) })
	}
	wsFaturalar_detaylar(e) {
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] }
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'faturalar_detaylar', args: e }) })
	}
	wsFaturalar_dip(e) {
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] }
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'faturalar_dip', args: e }) })
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
		e = e || {}; for (const key of ['data', 'args']) { delete e[key] } const streamFlag = e.stream ?? e.streamFlag ?? e.isStream, dataType = streamFlag ? 'text' : undefined;
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


== TEST (threaded) ==
const {ws} = config, _session = config.session, session = { loginTipi: _session.loginTipi, user: _session.user, pass: _session.pass, sessionID: _session.sessionID };
const test = new Ticari_TrnListTest({ ws, session }); await test.delay(50).multiWorker().threadedRun(1)

== TEST (runSync) ==
const {ws} = config, _session = config.session, session = { loginTipi: _session.loginTipi, user: _session.user, pass: _session.pass, sessionID: _session.sessionID };
const test = new Ticari_TrnListTest({ ws, session }); await test.delay(50).runSync(-1);
// test.stop()
*/
