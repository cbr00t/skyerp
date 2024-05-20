class MQOEM extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Operasyon Emirleri' }
	static oemHTMLDuzenle(e) {
		e = e || {}; const {parent, rec} = e; if (!rec) { return }
		return $(`<table class="oemBilgi full-wh">
				<thead><tr>
					<th class="emir item">Emir</th>
					<th class="oper item">Operasyon</th>
					<th class="urun item">Ürün</th>
				</tr></thead>
				<tbody><tr>
					<td class="emir item"><span class="veri">${rec.fisnox}</span> <span class="ek-bilgi">${rec.emirtarih}</span></th>
					<td class="oper item"><span class="veri">${rec.opadi}</span> <span class="ek-bilgi">${rec.opno}</span></th>
					<td class="urun item"><span class="veri">${rec.urunadi}</span> <span class="ek-bilgi">${rec.urunkod}</span></th>
				</tr></tbody>
			</table>`).appendTo(parent)
	}
}
class MQPersonel extends MQKAOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Personel' }
	static loadServerData(e) { return app.wsPersoneller() }
}
class MQHat extends MQKAOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Hat' } static get table() { return 'ismerkezi' } static get tableAlias() { return 'hat' }
}
class MQTezgah extends MQKAOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Tezgah' } static get table() { return 'tekilmakina' } static get tableAlias() { return 'tez' }
}
class MQOperasyon extends MQKAOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Operasyon' }
	static get kodSaha() { return 'opNo' } static get adiSaha() { return 'opAdi' } 
	static get kodEtiket() { return 'Op. No' } static get adiEtiket() { return 'Op. Adı' }
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); const rfb = e.rootBuilder;
		this.fbd_listeEkrani_addCheckBox(rfb, 'urunAgacineEkleFlag', 'Ürün Ağacına Ekle').onAfterRun(e => {
			const {builder} = e, {rootPart, layout} = builder, input = layout.children('input'), {grid, gridWidget} = rootPart;
			input.on('change', evt => { const value = rootPart.urunAgacineEkleFlag = $(evt.currentTarget).is(':checked') })
		})
	}
	static loadServerData(e) { const {oemSayac} = e.args; return app.wsBekleyenIs_yeniOperasyonlar({ oemSayac })}
}
class MQDurNeden extends MQKAOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Duraksama Nedeni' }
	static loadServerData(e) { return app.wsDuraksamaNedenleri() }
}
class MQBekleyenIsEmirleri extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Bekleyen İş Emirleri' } static get detaySinif() { return MQOperasyon } static get gridDetaylimi() { return true }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(...[
			new GridKolon({ belirtec: 'emirtarih', text: 'Tarih', genislikCh: 9 }).tipDate(),
			new GridKolon({ belirtec: 'emirnox', text: 'Emir No', genislikCh: 9 }),
			new GridKolon({ belirtec: 'urunkod', text: 'Ürün Kod', genislikCh: 20 }),
			new GridKolon({ belirtec: 'urunadi', text: 'Ürün Adı' }), new GridKolon({ belirtec: 'urunbrm', text: 'Brm', genislikCh: 5 }),
			new GridKolon({ belirtec: 'orjmiktar', text: 'Orj.Mik', genislikCh: 8, cellClassName: 'bold' }).tipDecimal(),
			new GridKolon({ belirtec: 'uretmiktar', text: 'Üret.Mik', genislikCh: 8, cellClassName: 'bold green' }).tipDecimal(),
			new GridKolon({ belirtec: 'kalanmiktar', text: 'Kal.Mik', genislikCh: 8, cellClassName: 'bold red' }).tipDecimal()
		])
	}
	static loadServerData(e) { const {hatKod} = e.args; return app.wsBekleyenIsEmirleri({ hatKod }) }
	static orjBaslikListesiDuzenle_detaylar(e) {
		super.orjBaslikListesiDuzenle_detaylar(e); const {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'opno', text: 'Oper. No', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'opadi', text: 'Oper. Adı' }),
			new GridKolon({ belirtec: 'emirmiktar', text: 'Emir Miktar', genislikCh: 10, cellClassName: 'bold' }).tipDecimal(),
			new GridKolon({ belirtec: 'uretMiktar', text: 'Üretilen', genislikCh: 10, cellClassName: 'forestgreen bold' }).tipDecimal(),
			new GridKolon({ belirtec: 'kalanmiktar', text: 'Kalan', genislikCh: 10 , cellClassName: 'red bold' }).tipDecimal(),
			new GridKolon({ belirtec: 'tezgahsayi', text: 'Aktif Tezgah', genislikCh: 15 }).tipNumerik(),
			new GridKolon({
				belirtec: 'kalansuredk', text: 'Kalan Süre (dk)', genislikCh: 15,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => changeTagContent(html, `<b>${value || 0}</b> <span class="ek-bilgi"> dk</span>`)
			}).tipNumerik()
		])
	}
	static loadServerData_detaylar(e) {
		const {parentRec} = e, emirUrunSayac = parentRec.emirurunsayac;
		return app.wsBekleyenOperasyonlar({ emirUrunSayac }).then(recs =>{ for (const rec of recs) { rec.uretMiktar = (rec.uretbrutmiktar || 0) + (rec.digeruretmiktar || 0) } return recs })
	}
}
class MQSureSayi extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Süre/Sayı Düzenle' } static get tanimUISinif() { return ModelTanimPart }
	constructor(e) {
		e = e || {}; super(e); const rec = this.rec = e.rec;
		if (rec) {
			const donusum = { sinyalSayisi: rec.sinyalsayisi, sinyalTekilSure: rec.sinyaltekilsure, sinyalToplamSure: rec.sinyaltoplamsure };
			for (const [ioAttr, value] of Object.entries(donusum)) { if (value != undefined && this[ioAttr] == null) { this[ioAttr] = value || null } }
		}
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const rfb = e.rootBuilder, tanimForm = e.tanimFormBuilder;
		rfb.onAfterRun(e => { const {part} = e.builder; part.title = this.sinifAdi });
		tanimForm.addForm({ id: 'oemBilgi' })
			.setLayout(e => { const {builder} = e, {id, rootPart} = builder, inst = builder.altInst, {rec} = inst, layout = $(`<div id="${id}"/>`); MQOEM.oemHTMLDuzenle({ parent: layout, rec }); return layout })
			.addStyle_fullWH(undefined, 'unset').addStyle(e => `$elementCSS { position: relative; z-index: 1001; pointer-events: none; margin-bottom: 10px }`);
		let width = 200, form = tanimForm.addFormWithParent().yanYana();
		form.addNumberInput('sinyalSayisi', 'Sinyal Sayısı').addStyle_wh(width); form.addNumberInput('sinyalTekilSure', 'Sinyal Tekil Süre').addStyle_wh(width); form.addNumberInput('sinyalToplamSure', 'Sinyal Toplam Süre').addStyle_wh(width)
	}
}
class MQZamanEtudu extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Zaman Etüdü' } static get tanimUISinif() { return ModelTanimPart }
	constructor(e) {
		e = e || {}; super(e); const rec = this.rec = e.rec, zamanEtuduRec = this.zamanEtuduRec = e.zamanEtuduRec;
		if (zamanEtuduRec) {
			this.degistirmi = asBool(zamanEtuduRec.bzamanetudu);
			const donusum = { 
				sinyalSayisi: zamanEtuduRec.urunagacsinyalsayisi, cevrimMinSn: zamanEtuduRec.sinirminsn, cevrimMaxSn: zamanEtuduRec.sinirmaxsn,
				sinyalArasiMinSn: zamanEtuduRec.enkisasinyalsn, sinyalArasiMaxSn: zamanEtuduRec.enuzunsinyalsn,
				urunAgacCevrimEnKisaSn: zamanEtuduRec.urunagaccevrimenkisasn, urunAgacSinyalEnKisaSn: zamanEtuduRec.urunagacsinyalenkisasn,
				ornekSayisi: zamanEtuduRec.orneksayisi, ornekCevrimEnKisa: zamanEtuduRec.cevrimenkisasn, ornekCevrimEnUzun: zamanEtuduRec.cevrimenuzunsn, ornekCevrimOrtalama: zamanEtuduRec.cevrimagirlikliortalamasn
			};
			for (const [ioAttr, value] of Object.entries(donusum)) { if (value != undefined && this[ioAttr] == null) { this[ioAttr] = value || null } }
			/* placeholder: urunagaccevrimenkisasn urunagacsinyalenkisasn
				örnekleme:
					divOrneklemeContainer.find('#ornekSayisi').val(asFloat(rec.orneksayisi) || 0); divOrneklemeContainer.find('#cevrimEnKisa').val(asFloat(rec.cevrimenkisasn) || 0);
					divOrneklemeContainer.find('#cevrimEnUzun').val(asFloat(rec.cevrimenuzunsn) || 0); divOrneklemeContainer.find('#cevrimOrtalama').val(asFloat(rec.cevrimagirlikliortalamasn) || 0)
			*/
		}
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const rfb = e.rootBuilder, tanimForm = e.tanimFormBuilder;
		rfb.onAfterRun(e => {
			const {builder} = e, {part, altInst} = builder, {urunAgacCevrimEnKisaSn, urunAgacSinyalEnKisaSn, degistirmi} = altInst;
			if (urunAgacCevrimEnKisaSn != null) { part.fbd_cevrimMinSn?.input?.attr('placeholder', urunAgacCevrimEnKisaSn) }
			if (urunAgacSinyalEnKisaSn != null) { part.fbd_sinyalArasiMinSn?.input?.attr('placeholder', urunAgacSinyalEnKisaSn) }
			part.title = `${this.sinifAdi} [<span class="ek-bilgi">${degistirmi ? 'Çalışıyor' : 'YOK'}</span>]`
		});
		rfb.islemTuslariArgsDuzenle = e => {
			const {args} = e, {id2Handler} = args; $.extend(args, { ekButonlarIlk: ['tazele'], ekSagButonIdSet: ['tazele'] });
			$.extend(id2Handler, { tazele: e => this.etudButonTiklandi($.extend(e, { islem: 'tazele' })) })
		};
		tanimForm.addForm('oemBilgi')
			.setLayout(e => { const {builder} = e, {id, rootPart} = builder, inst = builder.altInst, {rec} = inst, layout = $(`<div id="${id}"/>`); MQOEM.oemHTMLDuzenle({ parent: layout, rec }); return layout })
			.addStyle_fullWH(undefined, 'unset').addStyle(e => `$elementCSS { position: relative; z-index: 1001; pointer-events: none; margin-bottom: 10px }`);
		let width = 200;
		let form = tanimForm.addBaslik({ etiket: 'Çevrim' }).addFormWithParent().yanYana();
			form.addNumberInput('sinyalSayisi', 'Sinyal Sayısı').addStyle_wh(width);
			form.addNumberInput('cevrimMinSn', 'En Kısa (sn)').addStyle_wh(width).onAfterRun(e => { const {builder} = e; builder.rootPart.fbd_cevrimMinSn = builder }); form.addNumberInput('cevrimMaxSn', 'En Uzun (sn)').addStyle_wh(width);
		form = tanimForm.addBaslik({ etiket: 'İki Sinyal Arası' }).addFormWithParent().yanYana();
			form.addNumberInput('sinyalArasiMinSn', 'En Kısa (sn)').addStyle_wh(width).onAfterRun(e => { const {builder} = e; builder.rootPart.fbd_sinyalArasiMinSn = builder }); form.addNumberInput('sinyalArasiMaxSn', 'En Uzun (sn)').addStyle_wh(width);
		form = tanimForm.addFormWithParent().yanYana().addStyle(e => `$elementCSS { margin-top: 20px }`).addStyle_wh(undefined, 50);
			form.addButton('baslatVeyaDegistir', e => e.builder.altInst.degistirmi ? 'DEĞİŞTİR' : 'BAŞLAT').onClick(e => this.etudButonTiklandi($.extend(e, { islem: 'baslatVeyaDegistir' }))).addStyle_wh(width * 3);
		let parentForm = tanimForm.addFormWithParent('ornekleme').altAlta()
			.onAfterRun(e => { const {builder} = e; builder.rootPart.fbd_ornekleme = builder })
			.setVisibleKosulu(e => { const {builder} = e, {altInst} = builder; return altInst.degistirmi || 'jqx-hidden' });
		form = parentForm.addBaslik('Çevrim Ortalama').addFormWithParent();
			form.addNumberInput('ornekCevrimEnKisa', 'En Kısa (sn)').readOnly().addStyle_wh(width); form.addNumberInput('ornekCevrimEnUzun', 'En Uzun (sn)').readOnly().addStyle_wh(width);
			form.addNumberInput('ornekCevrimOrtalama', 'Ortalama (sn)').readOnly().addStyle_wh(width);
		form = parentForm.addFormWithParent().addStyle(e => `$elementCSS { margin-top: 10px }`);
			form.addButton('etudReset', 'Edüt Reset').onClick(e => this.etudButonTiklandi($.extend(e, { islem: 'reset' }))).addStyle_wh(width);
			form.addButton('etudKapat', 'Edüt Kapat').onClick(e => this.etudButonTiklandi($.extend(e, { islem: 'kapat' }))).addStyle_wh(width);
			form.addButton('sureGuncelleVeKapat', 'Süre Güncelle & Kapat').onClick(e => this.etudButonTiklandi($.extend(e, { islem: 'sureGuncelleVeKapat' }))).addStyle_wh(width)
	}
	static async etudButonTiklandi(e) {
		const {islem, builder} = e, rootBuilder = builder?.rootBuilder, part = rootBuilder?.part ?? e.parentPart, altInst = builder?.altInst ?? part?.inst;
		const {rec, degistirmi} = altInst, isId = rec.issayac, oemSayac = rec.oemsayac, tezgahKod = rec.tezgahkod;
		try { 
			let durum; switch (islem) {
				case 'tazele': await this.uiReload(e); return
				case 'baslatVeyaDegistir': { durum = degistirmi ? null : 'B' } break
				case 'kapat': if (degistirmi) { durum = 'D' } break
				case 'reset': if (degistirmi) { durum = 'R' } break
			}
			if (durum === undefined) { throw { isError: true, rc: 'hataliDurum', errorText: 'Geçersiz işlem' } }
			const wsArgs = { isId, oemSayac, tezgahKod }; if (durum != null) { $.extend(wsArgs, { durum }) }
			let keys = ['sinyalSayisi', 'cevrimMinSn', 'cevrimMaxSn', 'sinyalArasiMinSn', 'sinyalArasiMaxSn'];
			for (const key of keys) { const value = altInst[key]; if (value != null) { wsArgs[key] = value } }
			if (wsArgs.sinyalArasiMaxSn < wsArgs.sinyalArasiMinSn) throw { isError: true, rc: 'invalidValue', errorText: `Sinyal Max Süre, Sinyal Min Süre'den küçük olamaz` }
			if (wsArgs.enUzunSinyalSn < wsArgs.enKisaSinyalSn) throw { isError: true, rc: 'invalidValue', errorText: `Sinyal En Uzun Süre, Sinyal En Kısa Süre'den küçük olamaz` }
			if (wsArgs.cevrimMaxSn < wsArgs.cevrimMinSn) throw { isError: true, rc: 'invalidValue', errorText: `Çevrim En Uzun Süre, Çevrim En Kısa Süre'den küçük olamaz` }
			await app[islem == 'sureGuncelleVeKapat' ? 'wsGorevZamanEtudSureGuncelleVeKapat' : 'wsGorevZamanEtuduDegistir'](wsArgs); await this.uiReload(e)
		}
		catch (ex) { hConfirm(getErrorText(ex), part.title) }
	}
	static async uiReload(e) {
		const {builder} = e, rootBuilder = builder?.rootBuilder, part = rootBuilder?.part ?? e.parentPart, altInst = builder?.altInst ?? part?.inst;
		const {parentPart, islem, events} = part, {rec} = altInst, isId = rec.issayac, oemSayac = rec.oemsayac, tezgahKod = rec.tezgahkod;
		let zamanEtuduRec = altInst.zamanEtuduRec = await app.wsGorevZamanEtuduVeriGetir({ isId, oemSayac, tezgahKod });
		new this({ rec, zamanEtuduRec, parentPart, events: $.extend({}, events) }).tanimla({ islem }); part.close()
	}
}
class MQEkNotlar extends MQSayacliOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ek Notlar' }
	static get table() { return 'meseknotlar' } static get tableAlias() { return 'eknot' } static get sayacSaha() { return 'kaysayac' }
	static get tanimUISinif() { return ModelTanimPart } static get secimSinif() { return MQCogul.secimSinif }
	static get tanimlanabilirmi() { return true } static get silinebilirmi() { return true } static get urlCount() { return 3 }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, {
			kayitTarih: new PInstDateNow('kayittarih'), kayitZaman: new PInstStr({ rowAttr: 'kayitzaman', init: e => timeToString(now()) }),
			tip: new PInstTekSecim('tip', HatTezgah), hatKod: new PInstStr('hatkod'), tezgahKod: new PInstStr('tezgahkod'),
			notlar: new PInstStr('notlar')
		});
		for (let i = 1; i <= this.urlCount; i++) { pTanim[`url${i}`] = new PInstStr(`url${i}`) }
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const rfb = e.rootBuilder, tanimForm = e.tanimFormBuilder;
		let form = tanimForm.addFormWithParent().yanYana(3);
			form.addDateInput('kayitTarih', 'Kayıt Tarihi'); form.addTimeInput('kayitZaman');
			form.addModelKullan('tip', 'Tip').kodsuz().bosKodAlinmaz().bosKodEklenmez().dropDown().noMF().setSource(e => HatTezgah.kaListe).degisince(e => {
				const {builder} = e, {id2Builder} = builder.parentBuilder, value = builder.value?.char ?? builder.value;
				for (const key of ['hatKod', 'tezgahKod']) { id2Builder[key]?.updateVisible() }
			});
			form.addModelKullan('hatKod', 'Hat').setMFSinif(MQHat).comboBox().setVisibleKosulu(e => { let value = e.builder.altInst.tip; value = value?.char ?? value; return value == 'HT' ? true : 'jqx-hidden' });
			form.addModelKullan('tezgahKod', 'Tezgah').setMFSinif(MQTezgah).comboBox().setVisibleKosulu(e => { let value = e.builder.altInst.tip; value = value?.char ?? value; return value == 'TZ' ? true : 'jqx-hidden' });;
		form = tanimForm.addFormWithParent().yanYana().addStyle(e => `$elementCSS { margin-top: 10px }`);
			form.addTextInput('url1', 'Doküman URL 1'); form.addTextInput('url2', 'Doküman URL 2'); form.addTextInput('url3', 'Doküman URL 3');
		form = tanimForm.addFormWithParent().yanYana().addStyle(e => `$elementCSS { margin-top: 10px }`);
			form.addTextArea('notlar', 'Notlar').setRows(20)
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.secimTopluEkle({
			kayitTarih: new SecimDate({ etiket: 'Kayıt Tarih' }),
			tipSecim: new SecimTekSecim({ etiket: 'Tip', tekSecim: new BuDigerVeHepsi(['Hat', 'Tezgah']) }),
			hatKod: new SecimString({ etiket: 'Hat', mfSinif: MQHat }),
			hatAdi: new SecimOzellik({ etiket: 'Hat Adı' }),
			tezgahKod: new SecimString({ etiket: 'Tezgah', mfSinif: MQTezgah }),
			tezgahAdi: new SecimOzellik({ etiket: 'Tezgah Adı' })
		});
		sec.whereBlockEkle(e => {
			const sec = e.secimler, wh = e.where, alias = e.alias ?? this.tableAlias;
			wh.basiSonu(sec.kayitTarih, `${alias}.kayittarih`);
			let tSec = sec.tipSecim.tekSecim; if (!tSec.hepsimi) { wh.degerAta(tSec.bumu ? 'HT' : 'TZ', `${alias}.tip`) }
			wh.basiSonu(sec.hatKod, `${alias}.hatkod`);
			wh.ozellik(sec.hatAdi, 'hat.aciklama');
			wh.basiSonu(sec.tezgahKod, `${alias}.tezgahkod`);
			wh.ozellik(sec.tezgahAdi, 'tez.aciklama')
		})
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const {rec, result} = e, belirtec = e.belirtec ?? e.dataField ?? e.datafield, {tip} = rec;
		if (belirtec == 'tipText') { result.push('bold'); switch (tip) { case 'HT': result.push('bg-lightgreen'); break; case 'TZ': result.push('bg-lightred'); break } }
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e, alias = e.alias ?? this.tableAlias; liste.push(...[
			new GridKolon({ belirtec: 'tipText', text: 'Tip', genislikCh: 8, sql: HatTezgah.getClause(`${alias}.tip`) }),
			new GridKolon({ belirtec: 'hatkod', text: 'Hat', genislikCh: 8 }),
			new GridKolon({ belirtec: 'hatadi', text: 'Hat Adı', genislikCh: 15, sql: 'hat.aciklama' }),
			new GridKolon({ belirtec: 'tezgahkod', text: 'Tezgah', genislikCh: 16 }),
			new GridKolon({ belirtec: 'tezgahadi', text: 'Tezgah Adı', genislikCh: 30, sql: 'tez.aciklama' }),
			new GridKolon({ belirtec: 'url1', text: 'Dokuman URL 1' }),
			new GridKolon({ belirtec: 'url2', text: 'Dokuman URL 2' }),
			new GridKolon({ belirtec: 'url3', text: 'Dokuman URL 3' }),
			new GridKolon({ belirtec: 'notlar', text: 'Ek Notlar' })
		])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, alias = e.alias ?? this.tableAlias;
		sent.fromIliski('ismerkezi hat', `${alias}.hatkod = hat.kod`);
		sent.fromIliski('tekilmakina tez', `${alias}.tezgahkod = tez.kod`);
		sent.sahalar.add(`${alias}.tip`)
	}
}
