class SatisKosul extends CKodVeAdi {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return null } static get aciklama() { return null }
	static get table() { return null } static get detayMustTable() { return null } static get detayTables() { return null }
	static get tip2Sinif() {
		let {_tip2Sinif: result} = this;
		if (result == null) {
			result = this._tip2Sinif = {};
			for (const cls of this.subClasses) {
				const {tipKod} = cls;
				if (tipKod) { result[tipKod] = cls }
			}
		}
		return result
	}
	constructor(e) {
		e = e ?? {}; super(e); this.sayac = e.sayac || null;
		for (const key of ['kod', 'aciklama', 'grupKod', 'dvKod']) { this[key] = e[key] ?? '' }
		for (const key of ['mustDetaydami', 'subeIcinOzelmi', 'iskontoYokmu', 'promosyonYokmu']) { this[key] = asBool(e[key]) }
		let kapsam = e.kapsam ?? {}; if ($.isPlainObject(kapsam)) { kapsam = new SatisKosulKapsam(kapsam) } this.kapsam = kapsam;
		this.mustRec = e.mustRec
	}
	static newFor(e/*, _mustKod*/) {
		e = e ?? {}; if (typeof e != 'object') { e = { tipKod: e /*, mustKod: _mustKod*/ } }
		const cls = this.getClassFor(e), inst = cls ? new cls(e) : null;
		return inst /* return await inst?.yukle(e) ? inst : null */
	}
	static getClassFor(e) {
		e = e ?? {}; const tipKod = typeof e == 'object' ? e.tipKod : e;
		return this.tip2Sinif[tipKod]
	}
	/** Stoklar için Fiyat, En Düşük Fiyat bilgilerini ver
		@example:
		  let satisKosul = await SatisKosul.newFor('FY');
		  if (!satisKosul.yukle('1200027')) { satisKosul = null }
		  await SatisKosul.stoklarIcinFiyatlar(stokKodListe, satisKosul)
	*/
	static async stoklarIcinFiyatlar(e, _satisKosul) {
	    e = e ?? {}; let isObj = typeof e == 'object' && !$.isArray(e);
		let kodListe = $.makeArray(isObj ? e.kodListe ?? e.kod : e); if (!kodListe.length) { return result }
		let satisKosul = isObj ? e.satisKosul ?? e.kosul : _satisKosul;
	    let result = {}, eksikKodListe = []
	    if (satisKosul) {
	        for (let [stokKod, rec] of Object.entries(await satisKosul.getAltKosullar(kodListe))) {
	            result[stokKod] = rec;
	            if (!rec.fiyat) { eksikKodListe.push(stokKod) }
	        }
	    }
		else { for (let stokKod of kodListe) { result[stokKod] = {}; eksikKodListe.push(stokKod) } }
	    if (eksikKodListe.length) {
	        let sent = new MQSent({ from: 'stkmst' }), { sahalar, where: wh } = sent;
	        sahalar.add('kod stokKod', 'satfiyat1 fiyat');
	        wh.inDizi(eksikKodListe, 'kod'); 
	        for (let { stokKod, fiyat } of await app.sqlExecSelect(sent)) {
	            let rec = result[stokKod] = result[stokKod] ?? {};
	            rec.fiyat = fiyat
	        }
	    }
	    return result
	}
	async yukle(e) {
		e = e ?? {}; const mustKod = typeof e == 'object' ? e.mustKod : e;
		let stm = new MQStm(), {sent} = stm, _e = { ...e, stm, sent, mustKod }; this.yukle_queryDuzenle(_e);
		stm = _e.stm; sent = _e.sent; let recs = (await app.sqlExecSelect(stm));
		let uygunmu = false; for (const rec of recs) {
			this.setValues({ rec }); stm = sent = null;
			uygunmu = true; let {kapsam} = this;
			if (mustKod && this.mustDetaydami) {
				let {sayac} = this, {detayMustTable} = this.class;
				let sent = new MQSent({
					from: detayMustTable, sahalar: 'COUNT(*) sayi',
					where: [{ degerAta: sayac, saha: 'fissayac' }, { degerAta: mustKod, saha: 'must' }]
				}).distinctYap();
				uygunmu = !!asInteger(await app.sqlExecTekilDeger(sent))
			}
			if (uygunmu) {
				let diger = this.mustRec = e.mustRec ?? await this.class.getMust2Rec(mustKod);
				uygunmu = kapsam.uygunmu(diger)
			}
			if (uygunmu) { break }
		}
		return uygunmu
    }
	yukle_queryDuzenle({ stm, sent, mustKod }) {
		const {table, tipKod} = this.class, {where: wh, sahalar} = sent, {orderBy} = stm;
		const {tipListe, tip2RowAttrListe} = SatisKosulKapsam, mustSqlDegeri = mustKod?.sqlServerDegeri();
		sent.fromAdd(`${table} fis`); wh.fisSilindiEkle();
		wh.inDizi(['', 'N'], 'fis.isaretdurum').add(`fis.devredisi = ''`, `fis.ayrimkod = ''`);
		if (mustKod) {
			wh.add(new MQOrClause([
				`fis.detaylimust = ''`,
				new MQAndClause([
					`(COALESCE(fis.mustb, '') = '' OR fis.mustb <= ${mustSqlDegeri})`,
					`(COALESCE(fis.musts, '') = '' OR fis.musts >= ${mustSqlDegeri})`
				])
			]))
		}
		sahalar.addWithAlias('fis',
			'kaysayac sayac', 'kod', 'aciklama', 'kgrupkod grupKod', 'dvkod dvKod', 'detaylimust mustDetaydami',
			'subeicinozeldir subeIcinOzelmi', 'iskontoyok iskontoYokmu', 'promosyonyok promosyonYokmu'
		);
		for (const tip of tipListe) {
			const rowAttrs = tip2RowAttrListe[tip] || [`${tip}b`, `${tip}s`];
			sahalar.addWithAlias('fis', ...rowAttrs)
		}
		orderBy.add('subeIcinOzelmi', 'tarihb', 'kod')
	}
	setValues({ rec }) {
		this.sayac = rec.sayac || null;
		for (const key of ['kod', 'aciklama', 'grupKod', 'dvKod']) { this[key] = rec[key] ?? '' }
		for (const key of ['mustDetaydami', 'subeIcinOzelmi', 'iskontoYokmu', 'promosyonYokmu']) { this[key] = asBool(rec[key]) }
		const kapsam = this.kapsam = new SatisKosulKapsam(); kapsam.setValues(...arguments);
		this.konsolideSubemi = rec.konTipKod == 'S'
	}
	async getAltKosullar(e) {
		e = e ?? {}; const {kapsam} = this;
		const stokKodListe = $.makeArray(typeof e == 'object' && !$.isArray(e) ? e.stokKodListe ?? e.kodListe : e);
		let stm = new MQStm(), {sent} = stm, _e = { ...e, stokKodListe, stm, sent}; this.getAltKosullar_queryDuzenle(_e);
		stm = _e.stm; sent = _e.sent; let recs = await app.sqlExecSelect(stm), sevRecs = seviyelendir({ source: recs, attrListe: ['stokkod'] });
		let result = {}; for (const {detaylar} of sevRecs) {
			for (const rec of detaylar) {
				const {stokKod} = rec;
				if (stokKod) { result[stokKod] = rec }
			}
		}
		return result
	}
	getAltKosullar_queryDuzenle({ stm, sent, stokKodListe }) {
		let {table, detayTables} = this.class, {sayac, kapsam} = this, {mustKod} = kapsam;
		const {where: wh, sahalar} = sent, {orderBy} = stm;
		detayTables = detayTables ?? {}; let {stok: detTable_stok, grup: detTable_grup} = detayTables;
		sent.fromAdd(`${detTable_stok} har`); wh.degerAta(sayac, 'har.fissayac');
		if (stokKodListe?.length) { wh.inDizi(stokKodListe, 'har.stokkod') }
		sahalar.addWithAlias('har', 'fissayac fisSayac', 'kaysayac sayac', 'stokkod stokKod');
		orderBy.add('stokKod')
	}
	static async getMust2Rec(e) {
		e = e ?? {}; const kod = (typeof e == 'object' ? e.mustKod ?? e.mustkod ?? e.must ?? e.kod : e)?.trimEnd();
		if (!kod) { return null }
		let sent = new MQSent(), {where: wh, sahalar} = sent;
		sent.fromAdd('carmst car')
			.cari2BolgeBagla().fromIliski('isyeri isy', 'bol.bizsubekod = isy.kod')
            .leftJoin('car', 'carisatis csat', ['car.must = csat.must', `csat.satistipkod = ''`])
            .leftJoin('car', 'carmst kon', [`car.kontipkod = 'S'`, `car.konsolidemusterikod > ''`, 'car.konsolidemusterikod = kon.must'])
            .leftJoin('kon', 'carbolge kbol', 'kon.bolgekod = kbol.kod')
            .leftJoin('kbol', 'isyeri kisy', 'kbol.bizsubekod = kisy.kod');
		wh.degerAta(kod, 'car.must');
		sahalar.add(
			'car.must mustKod', 'car.konsolidemusterikod konMustKod', 'car.tipkod tipKod',
			'car.bolgekod bolgeKod', 'car.kosulgrupkod kosulGrupKod', 'csat.tavsiyeplasiyerkod plasiyerKod',
			'bol.bizsubekod subeKod','isy.isygrupkod subeGrupKod',
			'car.kontipkod konTipKod','kon.bolgekod konBolgeKod', 'kon.kosulgrupkod konKosulGrupKod',
			'kbol.bizsubekod konSubeKod', 'kisy.isygrupkod konSubeGrupKod'
		)
		return await app.sqlExecTekil(sent)
	}
	uygunmu(e) {
		e = e ?? {}; const {kapsam} = this, diger = (typeof e == 'object' ? e.kapsam : e) ?? {};
		return Object.keys(kapsam).every(key => !diger[key] || kapsam[key] == diger[key])
	}
	kesisim(e) {
		e = e ?? {}; const {kapsam} = this, diger = (typeof e == 'object' ? e.kapsam : e) ?? {};
		const keys = Object.keys(kapsam).filter(key => !diger[key] || kapsam[key] == diger[key]);
		const result = {}; for (const key of keys) { result[key] = kapsam[key] } return result
	}
}


/* örnek kullanım
let kosul; try { await (kosul = SatisKosul.newFor('FY')).yukle('1200027') ? await kosul?.getAltKosullar(['000025', '100333']) : {} }
catch (ex) { console.error(getErrorText(ex)); throw ex }
*/
