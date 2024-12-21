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
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); const rfb = e.rootBuilder;
		if (!app.params.config.hatKod) {
			this.fbd_listeEkrani_addCheckBox(rfb, 'tumHatlariGoster', 'Tüm Hatları Göster').onAfterRun(e => {
				const {builder} = e, {rootPart, layout} = builder, input = layout.children('input'), {grid, gridWidget} = rootPart, args = rootPart.args = rootPart.args || {};
				input.prop('checked', args.tumHatlariGosterFlag)
				input.on('change', evt => { args.tumHatlariGosterFlag = $(evt.currentTarget).is(':checked'); rootPart.tazeleDefer() })
			})
		}
	}
	static async loadServerData_queryOlustur(e) { await super.loadServerData_queryOlustur(e); await this.loadServerData_queryDuzenle_ek(e); return e.query || e.stm }
	static async loadServerData_queryDuzenle_ek(e) {
		await super.loadServerData_queryDuzenle(e); const {sent} = e, alias = e.alias ?? this.tableAlias, {kodSaha} = this, args = e.args || {}, {tumHatlariGosterFlag, exclude_hatKod} = args;
		let {hatKodListe} = args; if (!(tumHatlariGosterFlag || hatKodListe)) {
			try { hatKodListe = (await app.wsTezgahBilgileri()).map(rec => rec.hatKod ?? rec.hatID ?? rec.hatId) }
			catch (ex) { console.error(ex) }
		}
		if (hatKodListe) { hatKodListe = asSet(hatKodListe); sent.where.inDizi(Object.keys(hatKodListe), `${alias}.${kodSaha}`) }
		if (exclude_hatKod) { sent.where.notDegerAta(exclude_hatKod, `${alias}.${kodSaha}`) }
	}
}
class MQTezgah extends MQKAOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Tezgah' } static get table() { return 'tekilmakina' } static get tableAlias() { return 'tez' }
}
class MQOperasyon extends MQKAOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Operasyon' }
	static get table() { return 'operasyon' } static get tableAlias() { return 'op' }
	static get kodSaha() { return 'opno' } static get adiSaha() { return 'aciklama' }  static get kodEtiket() { return 'Op. No' } static get adiEtiket() { return 'Op. Adı' }
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); const rfb = e.rootBuilder;
		this.fbd_listeEkrani_addCheckBox(rfb, 'urunAgacineEkleFlag', 'Ürün Ağacına Ekle').onAfterRun(e => {
			const {builder} = e, {rootPart, layout} = builder, input = layout.children('input'), {grid, gridWidget} = rootPart;
			input.on('change', evt => { rootPart.urunAgacineEkleFlag = $(evt.currentTarget).is(':checked') })
		})
	}
	/*static loadServerData(e) {
		const {oemSayac} = e.args, toplu = new MQToplu([
			`DECLARE @emirDetaySayac	BIGINT`,
			new MQSent({
				from: 'operemri', where: { degerAta: oemSayac, saha: 'kaysayac' },
				sahalar: `@emirDetaySayac = emirdetaysayac`
			}),
			new MQStm({
				sent: new MQSent({
					from: 'operasyon', where: `opno NOT IN (select opno from operemri where emirdetaysayac = @emirDetaySayac)`,
					sahalar: ['opno opNo', 'aciklama opAdi']
				}),
				orderBy: ['opNo']
			})
		]);
		return app.sqlExecSelect(toplu)
	}*/
}
class MQDurNeden extends MQKAOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Duraksama Nedeni' }
	static loadServerData(e) { return app.wsDuraksamaNedenleri() }
}
class MQBekleyenIsEmirleri extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Bekleyen İş Emirleri' } static get detaySinif() { return MQOperasyon } static get gridDetaylimi() { return true }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); const {args} = e; $.extend(args, { showStatusBar: true, showAggregates: true, showGroupAggregates: true }) }
	static orjBaslikListesi_argsDuzenle_detaylar(e) { super.orjBaslikListesi_argsDuzenle_detaylar(e); const {args} = e; $.extend(args, { showStatusBar: true, showAggregates: true, showGroupAggregates: true }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(...[
			new GridKolon({ belirtec: 'emirtarih', text: 'Tarih', genislikCh: 9 }).tipDate(),
			new GridKolon({ belirtec: 'emirnox', text: 'Emir No', genislikCh: 9 }),
			new GridKolon({ belirtec: 'urunkod', text: 'Ürün Kod', genislikCh: 20 }),
			new GridKolon({ belirtec: 'urunadi', text: 'Ürün Adı' }), new GridKolon({ belirtec: 'urunbrm', text: 'Brm', genislikCh: 5 }),
			new GridKolon({ belirtec: 'orjmiktar', text: 'Orj.Mik', genislikCh: 8, cellClassName: 'bold', aggregates: [{'TOPLAM': gridDipIslem_sum}] }).tipDecimal(),
			new GridKolon({ belirtec: 'uretmiktar', text: 'Üret.Mik', genislikCh: 8, cellClassName: 'bold green', aggregates: [{'TOPLAM': gridDipIslem_sum}] }).tipDecimal(),
			new GridKolon({ belirtec: 'kalanmiktar', text: 'Kal.Mik', genislikCh: 8, cellClassName: 'bold red', aggregates: [{'TOPLAM': gridDipIslem_sum}] }).tipDecimal()
		])
	}
	static loadServerData(e) { const {hatKod} = e.args; return app.wsBekleyenIsEmirleri({ hatKod }) }
	static orjBaslikListesiDuzenle_detaylar(e) {
		super.orjBaslikListesiDuzenle_detaylar(e); const {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'opno', text: 'Oper. No', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'opadi', text: 'Oper. Adı' }),
			new GridKolon({ belirtec: 'emirmiktar', text: 'Emir Miktar', genislikCh: 10, cellClassName: 'bold', aggregates: [{'TOPLAM': gridDipIslem_sum}] }).tipDecimal(),
			new GridKolon({ belirtec: 'uretMiktar', text: 'Üretilen', genislikCh: 10, cellClassName: 'forestgreen bold', aggregates: [{'TOPLAM': gridDipIslem_sum}] }).tipDecimal(),
			new GridKolon({ belirtec: 'kalanmiktar', text: 'Kalan', genislikCh: 10 , cellClassName: 'red bold', aggregates: [{'TOPLAM': gridDipIslem_sum}] }).tipDecimal(),
			new GridKolon({ belirtec: 'tezgahsayi', text: 'Aktif Tezgah', genislikCh: 15, aggregates: [{'TOPLAM': gridDipIslem_sum}] }).tipNumerik(),
			new GridKolon({
				belirtec: 'kalansuredk', text: 'Kalan Süre (dk)', genislikCh: 15, aggregates: [{'TOPLAM': gridDipIslem_sum}],
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => changeTagContent(html, `<b>${value || 0}</b> <span class="ek-bilgi"> dk</span>`)
			}).tipNumerik()
		])
	}
	static loadServerData_detaylar(e) {
		const {parentRec} = e, emirUrunSayac = parentRec.emirurunsayac;
		return app.wsBekleyenOperasyonlar({ emirUrunSayac }).then(recs =>{ for (const rec of recs) { rec.uretMiktar = (rec.uretbrutmiktar || 0) + (rec.digeruretmiktar || 0) } return recs })
	}
	static orjBaslikListesi_satirCiftTiklandi(e) {
		super.orjBaslikListesi_satirCiftTiklandi(e); const args = e.event?.args, rowIndex = args?.rowindex;
		const gridPart = e.gridPart ?? e.sender, gridWidget = e?.event?.args?.owner ?? gridPart.gridWidget, {expandedIndexes} = gridPart;
		if (expandedIndexes && rowIndex != null) { gridWidget[expandedIndexes[rowIndex] ? 'hiderowdetails' : 'showrowdetails'](rowIndex) }
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
		const {rootBuilder: rfb, tanimFormBuilder: tanimForm} = e;
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
			$.extend(this, { degistirmi: asBool(zamanEtuduRec.bzamanetudu) });
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
		const {rootBuilder: rfb, tanimFormBuilder: tanimForm} = e;
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
			form.addNumberInput('cevrimMinSn', 'En Kısa (sn)').addStyle_wh(width).onAfterRun(e => { const {builder} = e; builder.rootPart.fbd_cevrimMinSn = builder });
			form.addNumberInput('cevrimMaxSn', 'En Uzun (sn)').addStyle_wh(width);
		form = tanimForm.addBaslik({ etiket: 'İki Sinyal Arası' }).addFormWithParent().yanYana();
			form.addNumberInput('sinyalArasiMinSn', 'En Kısa (sn)').addStyle_wh(width).onAfterRun(e => { const {builder} = e; builder.rootPart.fbd_sinyalArasiMinSn = builder });
			form.addNumberInput('sinyalArasiMaxSn', 'En Uzun (sn)').addStyle_wh(width);
			form.addForm().setLayout(e => $(`<div class="royalblue bold uyari">** Ürün Ağacına eklenir **</div>`))
				.addStyle(e => `$elementCSS { margin-top: 38px !important; margin-left: 15px }`)
				.setVisibleKosulu(e => app.params.hatYonetimi.urunAgacinaEkle ? true : 'jqx-hidden');
		form = tanimForm.addFormWithParent().yanYana().addStyle(e => `$elementCSS { margin-top: 20px }`).addStyle_wh(undefined, 50);
			form.addButton('baslatVeyaDegistir', e => e.builder?.altInst?.degistirmi ? 'DEĞİŞTİR' : 'BAŞLAT').onClick(e => this.etudButonTiklandi($.extend(e, { islem: 'baslatVeyaDegistir' }))).addStyle_wh(width * 3);
		let parentForm = tanimForm.addFormWithParent('ornekleme').altAlta()
			.onAfterRun(e => { const {builder} = e; builder.rootPart.fbd_ornekleme = builder })
			.setVisibleKosulu(e => { const {builder} = e, {altInst} = builder; return altInst.degistirmi || 'jqx-hidden' });
		form = parentForm.addBaslik('Çevrim Ortalama').addFormWithParent();
			form.addNumberInput('ornekCevrimEnKisa', 'En Kısa (sn)').readOnly().addStyle_wh(width).addCSS('center');
			form.addNumberInput('ornekCevrimEnUzun', 'En Uzun (sn)').readOnly().addStyle_wh(width).addCSS('center');
			form.addNumberInput('ornekCevrimOrtalama', 'Ortalama (sn)').readOnly().addStyle_wh(width).addCSS('center');
			form.addNumberInput('ornekSayisi', 'Örnek Sayısı').readOnly().addStyle_wh(width).addCSS('center');
		form = parentForm.addFormWithParent().addStyle(e => `$elementCSS { margin-top: 10px }`);
			form.addButton('etudReset', 'Edüt Reset').onClick(e => this.etudButonTiklandi($.extend(e, { islem: 'reset' }))).addStyle_wh(width);
			form.addButton('etudKapat', 'Edüt Kapat').onClick(e => this.etudButonTiklandi($.extend(e, { islem: 'kapat' }))).addStyle_wh(width);
			form.addButton('sureGuncelleVeKapat', 'Süre Güncelle & Kapat').onClick(e => this.etudButonTiklandi($.extend(e, { islem: 'sureGuncelleVeKapat' }))).addStyle_wh(width)
	}
	static async etudButonTiklandi(e) {
		const {islem, builder} = e, part = builder?.rootPart ?? e.parentPart, altInst = builder?.altInst ?? part?.inst;
		const {rec, degistirmi} = altInst, isId = rec.issayac, oemSayac = rec.oemsayac, tezgahKod = rec.tezgahkod;
		try { 
			let durum, sureGuncelleVeKapatmi = false; switch (islem) {
				case 'tazele': await this.uiReload(e); return
				case 'sureGuncelleVeKapat': durum = null; sureGuncelleVeKapatmi = true; break
				case 'baslatVeyaDegistir': { durum = degistirmi ? null : 'B' } break
				case 'kapat': if (degistirmi) { durum = 'D' } break
				case 'reset': if (degistirmi) { durum = 'R' } break
			}
			if (durum === undefined) { throw { isError: true, rc: 'hataliDurum', errorText: 'Geçersiz işlem' } }
			const wsArgs = { isId, oemSayac, tezgahKod }; if (durum != null) { $.extend(wsArgs, { durum }) }
			if (!sureGuncelleVeKapatmi) {
				let keys = ['sinyalSayisi', 'cevrimMinSn', 'cevrimMaxSn', 'sinyalArasiMinSn', 'sinyalArasiMaxSn'];
				for (const key of keys) { const value = altInst[key]; if (value != null) { wsArgs[key] = value } }
				if (wsArgs.sinyalArasiMaxSn < wsArgs.sinyalArasiMinSn) throw { isError: true, rc: 'invalidValue', errorText: `Sinyal Max Süre, Sinyal Min Süre'den küçük olamaz` }
				if (wsArgs.enUzunSinyalSn < wsArgs.enKisaSinyalSn) throw { isError: true, rc: 'invalidValue', errorText: `Sinyal En Uzun Süre, Sinyal En Kısa Süre'den küçük olamaz` }
				if (wsArgs.cevrimMaxSn < wsArgs.cevrimMinSn) throw { isError: true, rc: 'invalidValue', errorText: `Çevrim En Uzun Süre, Çevrim En Kısa Süre'den küçük olamaz` }
			}
			await app[sureGuncelleVeKapatmi ? 'wsGorevZamanEtudSureGuncelleVeKapat' : 'wsGorevZamanEtuduDegistir'](wsArgs); await this.uiReload(e)
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
class MQSinyal extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kodListeTipi() { return 'SINYAL' } static get tanimUISinif() { return ModelTanimPart }
	static get sinifAdi() { return 'MES Sinyal' } static get table() { return 'messinyal' } static get tableAlias() { return 'sny' } static get menuyeAlinmazmi() { return false }
	static get tanimlanabilirmi() { return true } static get silinebilirmi() { return true }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { tezgahKod: new PInstStr('tezgahkod'), ts: new PInstDateTimeNow('ts') })
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const {secimler: sec} = e;
		sec.secimTopluEkle({
			tezgahKod: new SecimString({ etiket: 'Tezgah', mfSinif: MQTezgah }), tezgahAdi: new SecimOzellik({ etiket: 'Tezgah Adı' }), ts: new SecimDateTime({ etiket: 'Tarih/Saat' }) });
		sec.whereBlockEkle(e => {
			const {secimler: sec, where: wh} = e, {tableAlias: alias} = this;
			wh.basiSonu(sec.tezgahKod, `${alias}.tezgahkod`); wh.ozellik(sec.tezgahAdi, 'tez.aciklama'); wh.basiSonu(sec.ts, `${alias}.ts`)
		})
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(...[
			new GridKolon({ belirtec: 'tezgahkod', text: 'Tezgah', genislikCh: 13 }),
			new GridKolon({ belirtec: 'tezgahadi', text: 'Tezgah Adı', genislikCh: 25, sql: 'tez.aciklama' }),
			new GridKolon({ belirtec: 'ts', text: 'Tarih/Saat', genislikCh: 18 }),
			new GridKolon({ belirtec: 'kayitsayisi', text: 'Sayı', genislikCh: 8, sql: 'COUNT(*)', aggregates: [{'TOPLAM': gridDipIslem_sum}] }).tipNumerik()
		])
	}
	static async loadServerData_queryOlustur(e) {
		await super.loadServerData_queryOlustur(e); const {stm} = e;
		for (const sent of stm.getSentListe()) { sent.groupByOlustur() }
		return stm
	}
	static async loadServerData_queryDuzenle(e) {
		await super.loadServerData_queryDuzenle(e); const {sent} = e, alias = e.alias ?? this.tableAlias;
		sent.fromIliski('tekilmakina tez', 'sny.tezgahkod = tez.kod');
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const {rootBuilder: rfb, tanimFormBuilder: tanimForm} = e;
		let form = tanimForm.addFormWithParent().yanYana();
			form.addModelKullan('tezgahKod', 'Tezgah').comboBox().autoBind().setMFSinif(MQTezgah); form.addDateInput('tarih', 'Tarih'); form.addTimeInput('saat', 'Saat')
	}
	keyHostVarsDuzenle(e) { super.keyHostVarsDuzenle(e); const {hv} = e, {tezgahKod: tezgahkod, ts} = this; $.extend(hv, { tezgahkod, ts }) }
	keySetValues(e) { super.keySetValues(e); const {rec} = e, {tezgahkod: tezgahKod, ts} = rec; $.extend(this, { tezgahKod, ts }) }
}
