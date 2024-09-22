class MQSablon extends MQDetayliGUIDVeAdiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Şablon' }
	static get kodListeTipi() { return 'SABLON' } static get tableAlias() { return 'sab' } static get detaySinif() { return MQSablonDetay }
}
class MQSablonDetay extends MQDetayGUID { static { window[this.name] = this; this._key2Class[this.name] = this } }

class MQSablonCPT extends MQSablon {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'CPT Şablon' }
	static get kodListeTipi() { return 'SABCPT' } static get table() { return 'esecptsablon' }
	static get detaySinif() { return MQSablonCPTDetay } static get gridKontrolcuSinif() { return MQSablonCPTGridci }
	get resimSayisi() { return this.detaylar?.length }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { resimArasiSn: new PInstNum('resimarasisn'), gecerliResimSeq: new PInstNum('gecerliresimseq') }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(
			/*new GridKolon({ belirtec: 'resimsayisi', text: 'Resim Sayısı', genislikCh: 13, filterType: 'checkedlist', sql: `(select count(*) from esecptsablondetay where id = id)` }),*/
			new GridKolon({ belirtec: 'resimarasisn', text: 'Resim Arası (sn)', genislikCh: 13, filterType: 'checkedlist' }).tipNumerik(),
			new GridKolon({ belirtec: 'gecerliresimseq', text: 'Geçerli Resim No', genislikCh: 13, filterType: 'checkedlist' }).tipNumerik()
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, alias = this.tableAlias, {detayTable} = this
		/*sent.leftJoin({ alias, from: `${detayTable} har`, on: `${alias}.id = har.id` })
		sent.sahalar.add('COUNT(har.*) resimsayisi'); sent.groupByOlustur() ?? */
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(2); form.addNumberInput('resimSayisi', 'Resim Sayısı').readOnly().addStyle_wh(130);
		form.addNumberInput('resimArasiSn', 'Resim Arası (sn)').addStyle_wh(130); form.addNumberInput('gecerliResimSeq', 'Geçerli Resim No').addStyle_wh(160)
	}
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { resimsayisi: this.resimSayisi }) }
}
class MQSablonCPTDetay extends MQSablonDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'esecptsablondetay' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { resimLink: new PInstStr('resimlink') }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(new GridKolon({ belirtec: 'resimlink', text: 'Resim', genislikCh: 50 }))
	}
}
class MQSablonCPTGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/* gridArgsDuzenle(e) { super.gridArgsDuzenle(e) } */
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e); e.tabloKolonlari.push(new GridKolon({ belirtec: 'resimLink', text: 'Resim', genislikCh: 50 }).tipString(256))
	}
}
class MQSablonESE extends MQSablon {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'ESE Şablon' }
	static get kodListeTipi() { return 'SABESE' } static get table() { return 'eseesesablon' }
	static get detaySinif() { return MQSablonESEDetay } static get gridKontrolcuSinif() { return MQSablonESEGridci }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { secenekSayisi: new PInstNum('seceneksayisi') }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(new GridKolon({ belirtec: 'seceneksayisi', text: 'Seçenek Sayısı', genislikCh: 13, filterType: 'checkedlist' }).tipNumerik())
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const {tabPage_genel} = e; let form = tabPage_genel.addFormWithParent().yanYana(2)
		/*form.addNumberInput('secenekSayisi', 'Seçenek Sayısı').setMin(0).setMax(MQSablonESEYanit.maxSecenekSayisi).addStyle_wh(130)*/
	}
}
class MQSablonESEDetay extends MQSablonDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'eseesesablondetay' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { soru: new PInstStr('soru'), yanitId: new PInstGuid('yanitid') }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(...[
			new GridKolon({ belirtec: 'soru', text: 'Soru', genislikCh: 50 }),
			(config.dev ? new GridKolon({ belirtec: 'yanitid', text: 'Yanit ID', genislikCh: 50 }) : null),
			new GridKolon({ belirtec: 'yanitadi', text: 'Yanit Adı', genislikCh: 50, filterType: 'checkedlist', sql: 'ynt.aciklama' })
		].filter(x => !!x))
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, alias = this.tableAlias;
		sent.leftJoin({ alias, from: 'eseeseyanit ynt', on: `${alias}.yanitid = ynt.id` })
		sent.sahalar.add('ynt.aciklama yanitadi')
	}
	setValues(e) { super.setValues(e); const {rec} = e; $.extend(this, { yanitAdi: rec.yanitadi }) }
}
class MQSablonESEGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e); e.tabloKolonlari.push(
			new GridKolon({ belirtec: 'soru', text: 'Soru', genislikCh: 50 }).tipString(512),
			...MQSablonESEYanit.getGridKolonlar({ belirtec: 'yanit', kodAttr: 'yanitId', argsDuzenle: e => e.kolonGrup.kodsuz() })
			/*new GridKolon({ belirtec: 'yanitId', text: 'Yanıt', genislikCh: 20 }).tipTekSecim({ kodsuz: true, source: e => MQSablonESEYanit.loadServerData(e) })*/
		)
	}
}

class MQSablonESEYanit extends MQGuidVeAdiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'ESE Yanıt' } static get maxSecenekSayisi() { return 5 }
	static get kodListeTipi() { return 'ESEYANIT' } static get table() { return 'eseeseyanit' } static get tableAlias() { return 'ynt' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e, {maxSecenekSayisi} = this;
		for (let i = 1; i <= maxSecenekSayisi; i++) { const key = `secenek${i}`; pTanim[key] = new PInstStr(key) }
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e, {maxSecenekSayisi} = this;
		for (let i = 1; i <= maxSecenekSayisi; i++) { liste.push(new GridKolon({ belirtec: `secenek${i}`, text: `Seçenek ${i}`, genislikCh: 50 })) }
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPanel, tabPage_genel} = e, {maxSecenekSayisi} = this;
		let form = tabPage_genel.addFormWithParent().altAlta();
		for (let i = 1; i <= maxSecenekSayisi; i++) { form.addTextInput(`secenek${i}`, `Seçenek ${i}`).setMaxLength(50) }
	}
}
