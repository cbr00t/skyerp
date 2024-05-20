class MQDurNeden extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tumKolonlarGosterilirmi() { return true }
	static get sinifAdi() { return 'Duraksama Nedeni' } static get table() { return 'makdurneden' } static get tableAlias() { return 'dned' }
	static get kodListeTipi() { return 'UDNED' } static get localDataBelirtec() { return 'durNeden' }
	/*static loadServerData_querySonucu(e) { return app.sqlExecSP(this.table) }*/
}
class MQIskartaNeden extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tumKolonlarGosterilirmi() { return true }
	static get sinifAdi() { return 'Iskarta Neden' } static get table() { return 'opiskartanedeni' } static get tableAlias() { return 'ined' }
	static get kodListeTipi() { return 'UISKNED' } static get localDataBelirtec() { return 'iskartaNeden' }
}
class MQPersonel extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tumKolonlarGosterilirmi() { return true }
	static get sinifAdi() { return 'Personel' } static get table() { return 'personel' } static get tableAlias() { return 'per' }
	static get kodListeTipi() { return 'UPER' } static get localDataBelirtec() { return 'personel' }
}
class MQEmir extends MQSayacliOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Emir' } static get table() { return 'isemri' } static get tableAlias() { return 'emr' }
	static get kodListeTipi() { return 'UEMIR' } static get idSaha() { return ['seri', 'no'] } static get localDataBelirtec() { return 'emir' }
	static get kodSaha() { return 'fisnox' } static get adiSaha() { return 'tarih' }
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e); const {liste} = e;
		if (config.dev) { liste.push(this.sayacSaha) }
		liste.push('fisnox', 'tarih')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'fisnox', text: 'Emir No', genislikCh: 15 }),
			new GridKolon({
				belirtec: 'tarih', text: 'Tarih', genislikCh: 13,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => { value = asDate(value); return changeTagContent(html, dateKisaString(value)) }
			})
		])
	}
	static async loadServerData_querySonucu(e) {
		const recs = await super.loadServerData_querySonucu(e);
		if (recs) { for (const rec of recs) { let value = rec.tarihStr = rec.tarih; if (value && typeof value == 'string') { value = rec.tarih = asDate(value) } } }
		return recs
	}
	/*static getGloKod2Adi(e) { e = $.extend({}, e, { kodSaha: 'fisnox', adiSaha: 'tarih' }); return super.getGloKod2Adi(e) }
	static getGloKod2Rec(e) { e = $.extend({}, e, { kodSaha: 'fisnox', adiSaha: 'tarih' }); return super.getGloKod2Rec(e) }*/
}
class MQHat extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tumKolonlarGosterilirmi() { return true }
	static get sinifAdi() { return 'Hat' } static get table() { return 'ismerkezi' } static get tableAlias() { return 'hat' }
	static get kodListeTipi() { return 'UHAT' } static get localDataBelirtec() { return 'hat' }
}
class MQTezgah extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tumKolonlarGosterilirmi() { return true }
	static get sinifAdi() { return 'Tezgah' } static get table() { return 'tekilmakina' } static get tableAlias() { return 'tez' }
	static get kodListeTipi() { return 'UTEZ' } static get localDataBelirtec() { return 'tezgah' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, { hatKod: new PInstStr('ismrkkod') }) }
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimTopluEkle({ hatKod: new SecimBasSon({ mfSinif: MQHat }), hatAdi: new SecimOzellik({ etiket: 'Hat Adı' }) });
		sec.whereBlockEkle(e => { const {aliasVeNokta} = this, wh = e.where, sec = e.secimler; wh.basiSonu(sec.hatKod, `${aliasVeNokta}ismrkkod`); wh.ozellik(sec.hatAdi, 'hat.aciklama') })
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'ismrkkod', text: 'Hat', genislikCh: 8 }),
			new GridKolon({ belirtec: 'ismrkadi', text: 'Hat Adı', genislikCh: 15, sql: 'hat.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {aliasVeNokta} = this;
		sent.fromIliski('ismerkezi hat', `${aliasVeNokta}ismrkkod = hat.kod`); sent.sahalar.add(`${aliasVeNokta}ismrkkod`)
	}
}
class MQOperasyon extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tumKolonlarGosterilirmi() { return true }
	static get sinifAdi() { return 'Operasyon' } static get table() { return 'operasyon' } static get tableAlias() { return 'op' }
	static get kodListeTipi() { return 'UOPER' } static get kodSaha() { return 'opno' } static get localDataBelirtec() { return 'operasyon' }
	static get kodEtiket() { return 'Op No.' } static get adiEtiket() { return 'Op. Adı' }
	get opNo() { return this.kod } set opNo(value) { return this.aciklama = value }
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); const rfb = e.rootBuilder, gridPart = e.gridPart ?? e.parentPart ?? e.sender, {urunAgacinaEkleYapilirmi} = gridPart;
		if (urunAgacinaEkleYapilirmi) {
			this.fbd_listeEkrani_addCheckBox(rfb, 'urunAgacineEkleFlag', 'Ürün Ağacına Ekle').onAfterRun(e => {
				const {builder} = e, {rootPart, layout} = builder, input = layout.children('input'), {grid, gridWidget} = rootPart;
				input.on('change', evt => { const value = rootPart.urunAgacineEkleFlag = $(evt.currentTarget).is(':checked') })
			})
		}
	}
}
class MQStok extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tumKolonlarGosterilirmi() { return true }
	static get sinifAdi() { return 'Stok' } static get table() { return 'stkmst' } static get tableAlias() { return 'stk' }
	static get kodListeTipi() { return 'USTOK' } static get localDataBelirtec() { return 'stok' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, { brm: new PInstStr('brm') }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 5 }))
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {aliasVeNokta, tableAlias} = this;
		sent.where.add(`${aliasVeNokta}silindi = ''`, `${aliasVeNokta}calismadurumu <> ''`, `${aliasVeNokta}satilamazfl = ''`);
		sent.sahalar.addWithAlias(tableAlias, 'brm')
	}
}
class MQStokYer extends MQKAOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tumKolonlarGosterilirmi() { return true }
	static get localDataBelirtec() { return 'yer' } static get sinifAdi() { return 'Stok Yer' }
	static get table() { return 'stkyer' } static get tableAlias() { return 'yer' }

	static pTanimDuzenle(e) { super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, { subeKod: new PInstStr('bizsubekod') }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'bizsubekod', text: 'Şube', genislikCh: 8 }),
			new GridKolon({ belirtec: 'subeadi', text: 'Şube Adı', genislikCh: 30, sql: 'sub.aciklama' })
		])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta} = this, {sent} = e;
		sent.fromIliski('isyeri sub', `${aliasVeNokta}bizsubekod = sub.kod`)
	}
	static async getVarsayilanYerRec(e) {
		const {globals} = this; let result = globals.varsayilanYerRec;
		if (result === undefined) { result = globals.varsayilanYerRec = await this.getVarsayilanYerRecDogrudan(e) }
		return result
	}
	static async getVarsayilanYerRecDogrudan(e) {
		let query = new MQSent({
			from: 'elterparam par', fromIliskiler: [{ from: 'stkyer yer', iliski: 'par.ticariyerkod = yer.kod' }],
			where: [`par.bizsubekod = ''`], sahalar: ['par.ticariyerkod kod', 'yer.aciklama', 'yer.bizsubekod']
		});
		const recs = (await this.loadServerData({ query })) || []; return recs[0] ?? null
	}
}
class MQYerRaf extends MQKodOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tumKolonlarGosterilirmi() { return true }
	static get sinifAdi() { return 'Yer Raf' } static get table() { return 'yerraf' } static get tableAlias() { return 'raf' }
	static get kodSaha() { return 'rafkod' } static get kodEtiket() { return 'Raf' } static get localDataBelirtec() { return 'raf' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, { yerKod: new PInstStr('yerkod') }) }
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent(); form.addModelKullan({ id: 'yerkod', etiket: 'Şube', mfSinif: MQStokYer }).dropDown()
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimTopluEkle({ yerKod: new SecimBasSon({ mfSinif: MQStokYer }), yerAdi: new SecimOzellik({ etiket: 'Yer Adı' }) });
		sec.whereBlockEkle(e => { const {aliasVeNokta} = this, sec = e.secimler, wh = e.where; wh.basiSonu(sec.yerKod, `${aliasVeNokta}yerkod`); wh.ozellik(sec.yerAdi, `yer.aciklama`) })
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'yerkod', text: 'Yer', genislikCh: 8 }),
			new GridKolon({ belirtec: 'yeradi', text: 'Yer Adı', genislikCh: 20, sql: 'yer.aciklama' })
		])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta} = this, {sent} = e;
		sent.fromIliski('stkyer yer', `${aliasVeNokta}yerkod = yer.kod`)
	}
	static async getYerIcinRafRecs(e) {
		const {globals} = this; let result = globals.yerIcinRafRecs;
		if (result === undefined) { result = globals.yerIcinRafRecs = await this.getYerIcinRafRecsDogrudan(e) }
		return result
	}
	static getYerIcinRafRecsDogrudan(e) {
		e = e || {}; const yerKod = typeof e == 'object' ? e.yerKod : e;
		const query = new MQSent({ from: 'yerraf', where: { degerAta: yerKod, saha: 'yerkod' }, sahalar: ['*'] });
		return this.loadServerData({ query })
	}
}
class MQOlcu extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tumKolonlarGosterilirmi() { return true }
	static get sinifAdi() { return 'Ölçü' } static get table() { return 'muayeneolcu' } static get tableAlias() { return 'olc' }
	static get kodListeTipi() { return 'UOLCU' } static get localDataBelirtec() { return 'olcu' }
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {aliasVeNokta, tableAlias} = this;
		sent.where.add(`${aliasVeNokta}silindi = ''`); sent.sahalar.add(`${tableAlias}.*`)
	}
}
