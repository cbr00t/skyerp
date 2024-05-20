class ModelRapor extends Secimler {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporGrup() { return null } get defaultRaporGrup() { return this.class.raporGrup }
	
	get attr2Kolon() {
		let result = this._attr2Kolon;
		if (!result) { const _e = { liste: {} }; this.attr2KolonDuzenle(_e); result = this._attr2Kolon = _e.liste }
		return result
	}
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {
			raporGrup: e.raporGrup || this.defaultRaporGrup,
			kolonKategoriler: e.kolonKategoriler || {},				/* RKolonKategori */
			ekRaporlar: e.ekRaporlar || {}
		})
	}
	async kategorileriOlustur(e) { await this.kategorileriOlustur_ara(e); await this.kategorileriOlusturSonrasi(e); }
	async kategorileriOlustur_ara(e) { }
	async kategorileriOlusturSonrasi(e) { await this.raporKategorileriDuzenle_son(e) }
	async raporKategorileriDuzenle_son(e) {
		const {mfSinif} = this;
		if (mfSinif) await mfSinif.raporKategorileriDuzenle_son({ modelRapor: this, kolonKategoriler: this.kolonKategoriler })
	}
	async dataSourceOlustur(e) {
		e = e || {}; $.extend(e, { dataSource: e.dataSource || {}, relations: e.relations || [], raporcu: this });
		await this.dataSourceDuzenle(e); return e.dataSource
	}
	async dataSourceDuzenle(e) {
		let query = this.queryOlustur(e); if (query && query.getQueryYapi) query = query.getQueryYapi(); if (!query) return
		e.dataSource.Data = { tip: 'query', veri: query }; await this.dataSourceDuzenle_ara(e);
		await this.dataSourceDuzenleSonrasi(e)
	}
	async dataSourceDuzenle_ara(e) {
		/*e.dataSource.Data = { tip: 'datasource', veri: [
			{ stokkod: 's1', stokadi: 'stk 1', yerKod: 'A', yerAdi: 'Merkez Ambarı', miktar: 10, brm: 'AD', miktar2: 0, brm2: '' },
			{ stokkod: 's2', stokadi: 'stk 2', yerKod: 'A', yerAdi: 'Merkez Ambarı', miktar: 15.3, brm: 'AD', miktar2: 0, brm2: '' },
		] };*/
	}
	dataSourceDuzenleSonrasi(e) {
		e = e || {}; /*const islemeAlinamayanFiltreRecs = e._islemeAlinamayanFiltreRecs;
		if (!$.isEmptyObject(islemeAlinamayanFiltreRecs)) {}*/
	}
	queryOlustur(e) {
		e = e || {}; const {attr2Kolon} = this; $.extend(e, { stm: new MQStm(), attr2Kolon });
		this.queryDuzenle(e); return this.queryOlusturDevam(e)
	}
	queryOlusturDevam(e) {
		const {filtreRecs} = e;
		if (!$.isEmptyObject(filtreRecs)) {
			const islemeAlinamayanFiltreRecs = e._islemeAlinamayanFiltreRecs = [];
			for (const sent of e.stm.getSentListe()) {
				const attr2Deger = {};
				for (const saha of sent.sahalar.liste) { if (typeof saha == 'object') { const {alias, deger} = saha; attr2Deger[alias] = deger } }
				for (const filtreRec of filtreRecs) {
					const {attr, operator, value} = filtreRec; if (!(attr && operator)) continue
					const sql = attr2Deger[attr]; if (!sql) { islemeAlinamayanFiltreRecs.push(filtreRec); continue }
					const filterObj = filtreRec.getGridFilter({ sql }); if (!filterObj) continue
					const hasAggregate = MQSent.hasAggregateFunctions(sql); sent[hasAggregate ? 'having' : 'where'].fromGridFilter(filterObj)
				}
			}
		}
		return e.stm
	}
	queryDuzenle(e) { }
	queryKolonlariDuzenle(e) {
		e = e || {}; e.index = e.index || 1; e.fazlaSahalar = []; e.degeriBelirsizSahalar = [];
		this.queryKolonlariDuzenleDevam(e); this.queryKolonlariDuzenleSonrasi(e)
	}
	queryKolonlariDuzenleDevam(e) {
		const {index, sent, attrListesi} = e, {attr2Kolon} = this;
		for (const attr of attrListesi) {
			if (!attr) continue
			const saha = attr2Kolon[attr];
			if (!saha) { e.fazlaSahalar.push(attr); /* sent.sahalar.add(`NULL ${attr}`); */ continue }
			const sqlDict = saha.sql; let sql = sqlDict[index]; if (!sql && index > 1) sql = sqlDict[1];
			if (!sql) { e.degeriBelirsizSahalar.push(attr); /* sent.sahalar.add(`NULL ${attr}`); */ continue }
			sent.sahalar .add(`${sql} ${attr}`)
		}
		const mesajlar = [];
		if (e.fazlaSahalar.length) mesajlar.push(`<b>${e.fazlaSahalar.join(', ')}</b> sahaları tanımsızdır`);
		if (e.degeriBelirsizSahalar.length) mesajlar.push(`<b>${e.degeriBelirsizSahalar.join(', ')}</b> sahaları için SQL Değeri belirlenemedi`);
		if (mesajlar.length) displayMessage(`<ul>${mesajlar.map(x => `<li>${x}</li>`)}</ul>`) /* throw { isError: true, rc: 'raporFazlaSaha', errorText: `<ul>${mesajlar.map(x => `<li>${x}</li>`)}</ul>` } */
	}
	queryKolonlariDuzenleSonrasi(e) { }
	attr2KolonDuzenle(e) {
		const {kolonKategoriler} = this, {liste} = e;
		for (const kat of Object.values(kolonKategoriler))
			for (const det of kat.detaylar) { if (det.class.degiskenmi) liste[det.attr] = det }
	}
	addKolonKategori(...liste) {
		const {kolonKategoriler} = this;
		if (liste) {
			const addItem = _item => kolonKategoriler[_item.kod] = _item;
			for (const item of liste) {
				if ($.isArray(item)) for (const subItem of item) addItem(subItem)
				else addItem(item)
			}
		}
		return this
	}
	addKolonKategoriler(liste) { return this.addKolonKategori(liste) }
	kolonKategoriReset() { this.kolonKategoriler = {} }
	addEkRapor(...liste) {
		const {ekRaporlar} = this;
		if (liste) {
			const addItem = _item => ekRaporlar[_item.kod] = _item;
			for (const item of liste) {
				if ($.isArray(item)) for (const subItem of item) addItem(subItem)
				else addItem(item)
			}
		}
		return this
	}
	addEkRaporlar(liste) { return this.addEkRapor(liste) }
	ekRaporlarReset() { this.ekRaporlar = {} }
	static raporEkraniAc(e) { return new this(e).raporEkraniAc(e) }
	static raporEkranaAl(e) { return new this(e).raporEkranaAl(e) }
	raporEkraniAc(e) { e = e || {}; const part = new RaporGosterPart($.extend({}, e, { inst: new RaporcuInst($.extend({}, e.inst, { modelRapor: this })) })); part.run(); return part }
	raporEkranaAl(e) { e.rRaporOlustuHandler = e => e.sender.raporEkranaIstendi(); return this.raporEkraniAc(e) }
}
