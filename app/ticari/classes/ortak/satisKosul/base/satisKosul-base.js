class SatisKosul extends CKodVeAdi {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return null } static get aciklama() { return null } static get alimmi() { return false }
	static get table() { return null } static get detayTables() { return null }
	static get detayMustTable() { return null } static get fisSayacSaha() { return 'fissayac' }
	static get tip2Sinif() {
		let {_tip2Sinif: result} = this;
		if (result == null) {
			result = this._tip2Sinif = {};
			for (let cls of this.subClasses) {
				let {tipKod} = cls;
				if (tipKod) { result[tipKod] = cls }
			}
		}
		return result
	}
	constructor(e) {
		e = e ?? {}; super(e); let {alimmi} = this.class;
		this.sayac = e.sayac || null;
		for (let key of ['kod', 'aciklama', 'grupKod', 'dvKod', 'subeIcinOzeldir']) { this[key] = e[key] ?? '' }
		for (let key of ['mustDetaydami', 'iskontoYokmu', 'promosyonYokmu']) { this[key] = asBool(e[key]) }
		let kapsam = e.kapsam ?? {}; if ($.isPlainObject(kapsam)) { kapsam = new SatisKosulKapsam(kapsam, alimmi) }
		let {mustRec} = e; $.extend(this, { kapsam, mustRec })
	}
	static newFor(e /*, _mustKod*/) {
		e = e ?? {}; if (typeof e != 'object') { e = { tipKod: e /*, mustKod: _mustKod*/ } }
		let cls = this.getClassFor(e), inst = cls ? new cls(e) : null;
		return inst /* return await inst?.yukle(e) ? inst : null */
	}
	static getClassFor(e) {
		e = e ?? {}; let tipKod = typeof e == 'object' ? e.tipKod : e;
		return this.tip2Sinif[tipKod]
	}
	static getAltKosulYapilar() { return null }
	getAltKosulYapilar(e, _mustKod) { return this.class.getAltKosulYapilar(e, this, _mustKod) }
	static async yukle(e) { let inst = new this(e); return await inst.yukle(e) ? inst : null }
	async yukle(e) {
		e = e ?? {}; let kapsam = e.kapsam ?? this.kapsam ?? {}, mustKod, {fisSayacSaha, alimmi} = this.class;
		if ($.isPlainObject(kapsam)) { kapsam = new SatisKosulKapsam(kapsam, alimmi) }
		{
			let {basi, sonu} = kapsam?.must ?? {};
			if (basi && basi == sonu) { mustKod = basi }
		}
		let stm = new MQStm(), {sent} = stm, _e = { ...e, stm, sent, mustKod }; this.yukle_queryDuzenle(_e);
		stm = _e.stm; sent = _e.sent; let recs = await app.sqlExecSelect(stm), uygunmu = false;
		for (let rec of recs) {
			this.setValues({ rec }); stm = sent = null;
			uygunmu = true; if (mustKod && this.mustDetaydami) {
				let {sayac} = this, {detayMustTable} = this.class;
				let sent = new MQSent({
					from: detayMustTable, sahalar: 'COUNT(*) sayi',
					where: [{ degerAta: sayac, saha: fisSayacSaha }, { degerAta: mustKod, saha: 'must' }]
				}).distinctYap();
				uygunmu = !!asInteger(await app.sqlExecTekilDeger(sent))
			}
			if (uygunmu && kapsam) {
				let mustRec = this.mustRec = e.mustRec ?? await this.class.getMust2Rec(mustKod);
				uygunmu = kapsam.uygunmu(mustRec, alimmi)
			}
			if (uygunmu) { break }
		}
		return uygunmu
    }
	yukle_queryDuzenle({ stm, sent, mustKod }) {  /* edt: a!cbr00t-CGP */
		let {kapsam} = this, {table} = this.class, {where: wh, sahalar} = sent, {orderBy} = stm, alias = 'fis';
		let {tipListe, tip2RowAttrListe} = SatisKosulKapsam, mustSqlDegeri = MQSQLOrtak.sqlServerDegeri(mustKod);
		sent.fromAdd(`${table} ${alias}`); wh.fisSilindiEkle().add(`${alias}.devredisi = ''`);
		if (mustKod) {
			wh.add(new MQOrClause([
				`fis.detaylimust = ''`,
				new MQAndClause([
					`(COALESCE(${alias}.mustb, '') = '' OR ${alias}.mustb <= ${mustSqlDegeri})`,
					`(COALESCE(${alias}.musts, '') = '' OR ${alias}.musts >= ${mustSqlDegeri})`
				])
			]))
		}
		kapsam?.uygunlukClauseDuzenle({ alias, where: wh });
		sahalar.addWithAlias(alias,
			'kaysayac sayac', 'kod', 'aciklama', 'kgrupkod grupKod', 'dvkod dvKod',
			'detaylimust mustDetaydami', 'subeicinozeldir subeIcinOzeldir'
		);
		for (let tip of tipListe) {
			let rowAttrs = tip2RowAttrListe[tip] ?? [`${tip}b`, `${tip}s`];
			if (rowAttrs?.length) { sahalar.addWithAlias('fis', ...rowAttrs) }
		}
		orderBy.add('subeIcinOzeldir', 'tarihb', 'kod')
	}
	setValues({ rec }) {
		this.sayac = rec.sayac || null; let {alimmi} = this.class;
		for (let key of ['kod', 'aciklama', 'grupKod', 'dvKod', 'subeIcinOzeldir']) { this[key] = rec[key] ?? '' }
		for (let key of ['mustDetaydami', 'iskontoYokmu', 'promosyonYokmu']) { this[key] = asBool(rec[key]) }
		this.konsolideSubemi = rec.konsolideSubemi = rec.konTipKod == 'S';
		let kapsam = this.kapsam = new SatisKosulKapsam(null, alimmi);
		kapsam.setValues(arguments[0], alimmi)
	}
	async getAltKosullar(e) {
		e = e ?? {}; let _satisKosul = this, {iskontoYokmu, promosyonYokmu} = this;
		let stokKodListe = $.makeArray(typeof e == 'object' && !$.isArray(e) ? e.stokKodListe ?? e.kodListe : e);
		let result = {}; if ($.isEmptyObject(stokKodListe)) { return result }
		let stok2GrupKod = {}, grup2StokKodSet = {};
		{	/* Stoklar için Grup Kodlarını belirle */
			let sent = new MQSent({
				from: 'stkmst stk', sahalar: ['stk.kod stokKod', 'stk.grupkod grupKod'],
				where: [{ inDizi: stokKodListe, saha: 'stk.kod' }, `stk.grupkod > ''`]
			});
			for (let {stokKod, grupKod} of await app.sqlExecSelect(sent)) {
				if (!grupKod) { continue } stok2GrupKod[stokKod] = grupKod;
				(grup2StokKodSet[grupKod] = grup2StokKodSet[grupKod] ?? {})[stokKod] = true
			}
		}
		{	/* Stok Gruplar için Alt Koşulları belirle (init values - öncelik #2) */
			let stm = new MQStm(), {sent} = stm, kodListe = Object.keys(grup2StokKodSet);
			let _e = { ...e, kodListe, stm, sent, grupmu: true }; if (this.getAltKosullar_queryDuzenle(_e) !== false) {
				stm = _e.stm; sent = _e.sent; let sevRecs = seviyelendir({ source: await app.sqlExecSelect(stm), attrListe: ['xKod'] });
				let detTip = 'G'; for (let {detaylar} of sevRecs) {
					for (let _rec of detaylar) {
						let {xKod: grupKod} = _rec; if (!grupKod) { continue }										  /* sent.where koşulundan dolayı normalde boş grupKod gelmemesi gerekir, sadece önlem */
						let stokKodSet = grup2StokKodSet[grupKod]; if ($.isEmptyObject(stokKodSet)) { continue }		  /* grupKod'a ait stokKod liste boş ise işlem yapma. normalde bu dict values içeriğinin boş gelmemesi bekleniyor */
						$.extend(_rec, { _satisKosul, detTip, iskontoYokmu, promosyonYokmu });							  /* ortak değerleri orijinal _rec içine ata */
						for (let xKod in stokKodSet) { let rec = { ..._rec, xKod }; result[xKod] = rec }				  /* grupKod'a ait her 'stokKod' için kopya kayıt ile result'a eklenti yap */
					}
				}
			}
		}
		{	/* Stoklar için Alt Koşulları belirle (with override - öncelik #1) */
			let stm = new MQStm(), {sent} = stm, kodListe = stokKodListe;
			let _e = { ...e, kodListe, stm, sent, grupmu: false }; if (this.getAltKosullar_queryDuzenle(_e) !== false) {
				stm = _e.stm; sent = _e.sent; let sevRecs = seviyelendir({ source: await app.sqlExecSelect(stm), attrListe: ['xKod'] });
				let detTip = 'S'; for (let {detaylar} of sevRecs) {
					for (let rec of detaylar) {
						let {xKod} = rec; if (!xKod) { continue }														 /* stokKod boş ise işlem yapma. normalde boş gelmemesi bekleniyor */
						$.extend(rec, { _satisKosul, detTip, iskontoYokmu, promosyonYokmu });							 /* ortak değerleri ata */
						result[xKod] = rec																				 /* result'a eklenti yap */
					}
				}
			}
		}
		return result
	}
	getAltKosullar_queryDuzenle({ stm, sent, kodListe, grupmu }) {
		let {table, detayTables, fisSayacSaha} = this.class, {sayac, kapsam} = this, {mustKod} = kapsam;
		let {where: wh, sahalar} = sent, {orderBy} = stm, xKodClause = grupmu ? 'grupkod' : 'stokkod';
		let detTable = detayTables?.[grupmu ? 'grup' : 'stok']; if (!detTable) { return false }
		sent.fromAdd(`${detTable} har`); wh.degerAta(sayac, `har.${fisSayacSaha}`);
		if (kodListe?.length) { wh.inDizi(kodListe, `har.${xKodClause}`) }
		sahalar.addWithAlias('har', `${fisSayacSaha} fisSayac`, `${xKodClause} xKod`);
		orderBy.add('xKod');
	}
	static async getMust2Rec(e) {
		e = e ?? {}; let kod = (typeof e == 'object' ? e.mustKod ?? e.mustkod ?? e.must ?? e.kod : e)?.trimEnd();
		if (!kod) { return null }
		let mustKod2Rec = this._mustKod2Rec ??= {};
		return mustKod2Rec[kod] ??= await (async () => {
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
				'bol.bizsubekod subeKod', 'isy.isygrupkod subeGrupKod',
				'car.kontipkod konTipKod', 'kon.bolgekod konBolgeKod', 'kon.kosulgrupkod konKosulGrupKod',
				'kbol.bizsubekod konSubeKod', 'kisy.isygrupkod konSubeGrupKod'
			)
			return await app.sqlExecTekil(sent)
		});
	}
	uygunmu(e) {
		e = e ?? {}; let {kapsam} = this, diger = (typeof e == 'object' ? e.kapsam : e) ?? {};
		return Object.keys(kapsam).every(key => !diger[key] || kapsam[key] == diger[key])
	}
	kesisim(e) {
		e = e ?? {}; let {kapsam} = this, diger = (typeof e == 'object' ? e.kapsam : e) ?? {};
		let keys = Object.keys(kapsam).filter(key => !diger[key] || kapsam[key] == diger[key]);
		let result = {}; for (let key of keys) { result[key] = kapsam[key] } return result
	}
}


/* örnek kullanım
let kosul; try { await (kosul = SatisKosul.newFor('FY')).yukle('1200027') ? await kosul?.getAltKosullar(['000025', '100333']) : {} }
catch (ex) { console.error(getErrorText(ex)); throw ex }
*/
