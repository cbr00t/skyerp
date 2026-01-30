class SatisKosul extends CKodVeAdi {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return null } static get aciklama() { return null } static get alimmi() { return false }
	static get table() { return null } static get detayTables() { return null }
	static get detayMustTable() { return null } static get fisSayacSaha() { return 'fissayac' }
	static get kapsamSinif() { return SatisKosulKapsam }
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
	constructor(e = {}) {
		super(e)
		let {mustRec, sayac, kapsam} = e
		let {kapsamSinif, alimmi} = this.class
		kapsam ??= {}
		if (isPlainObject(kapsam))
			kapsam = new kapsamSinif(kapsam, alimmi)
		
		this.sayac = sayac ?? null
		for (let key of ['tipKod', 'kod', 'aciklama', 'grupKod', 'dvKod', 'subeIcinOzeldir'])
			this[key] = e[key] ?? ''
		for (let key of ['mustDetaydami', 'iskontoYokmu', 'promosyonYokmu'])
			this[key] = asBool(e[key])
		$.extend(this, { kapsam, mustRec })
	}
	static newFor(e /*, _mustKod*/) {
		if (!isObject(e))
			e = { tipKod: e }
		let cls = this.getClassFor(e)
		let inst = cls ? new cls(e) : null
		return inst
	}
	static getClassFor(e = {}) {
		let tipKod = isObject(e) ? e.tipKod : e
		return this.tip2Sinif[tipKod]
	}
	static async uygunKosullar(e = {}) {
		let {fisSayacSaha, alimmi: alim, kapsamSinif} = this
		let {kapsam = this.kapsam ?? {}, offlineMode = MQCogul.isOfflineMode} = e
		let {mustKod} = kapsam
		/*if (isPlainObject(kapsam))
			kapsam = new kapsamSinif(kapsam, alim)*/
		{
			let {basi, sonu} = kapsam?.must ?? {}
			if (basi && basi == sonu)
				mustKod = basi
		}
		let stm = new MQStm(), {sent} = stm
		let _e = { ...e, stm, sent, mustKod }
		this.yukle_queryDuzenle(_e)
		stm = _e.stm; sent = null
		if (stm?.bosmu ?? true)
			return null
		let recs = await MQCogul.sqlExecSelect({ offlineMode, query: stm })
		let uygunmu = false, result = []
		for (let rec of recs) {
			let inst = new this(e)
			inst.setValues({ rec })
			stm = sent = null
			uygunmu = true
			let {mustDetaydami, sayac} = inst
			if (mustKod && mustDetaydami) {
				let {detayMustTable} = inst.class
				let sent = new MQSent({
					from: `${detayMustTable} mus`, sahalar: 'COUNT(*) sayi',
					where: [{ degerAta: sayac, saha: fisSayacSaha }, { degerAta: mustKod, saha: 'mus.must' }]
				}).distinctYap()
				uygunmu = !!asInteger(await MQCogul.sqlExecTekilDeger({ ...e, query: sent }))
			}
			if (uygunmu) {
				let mustRec = inst.mustRec = e.mustRec ?? await this.getMust2Rec(mustKod)
				uygunmu = inst.kapsam.uygunmu({ kapsam, mustRec, alim })
			}
			if (uygunmu)
				result.push(inst)
		}
		return result
	}
	static async yukle(e) {
		let inst = new this(e)
		return await inst.yukle(e) ? inst : null
	}
	async yukle(e = {}) {
		let {kapsam, mustDetaydami, class: { fisSayacSaha, alimmi: alim, kapsamSinif }} = this
		let {kapsam: istenenKapsam = this.kapsam, offlineMode} = e
		let {mustKod} = istenenKapsam
		/*if (isPlainObject(istenenKapsam))
			istenenKapsam = new kapsamSinif(istenenKapsam, alim)*/
		{
			let {basi, sonu} = istenenKapsam?.must ?? {}
			if (basi && basi == sonu)
				mustKod = basi
		}
		let stm = new MQStm(), {sent} = stm
		let _e = { ...e, stm, sent, mustKod }
		this.yukle_queryDuzenle(_e)
		stm = _e.stm; sent = null
		if (stm?.bosmu ?? true)
			return null
		
		let recs = await MQCogul.sqlExecSelect({ offlineMode, query: stm })
		let uygunmu = false
		for (let rec of recs) {
			this.setValues({ rec })
			stm = sent = null
			uygunmu = true
			if (mustKod && this.mustDetaydami) {
				let {sayac, class: { detayMustTable }} = this
				let sent = new MQSent({
					from: `${detayMustTable} mus`, sahalar: 'COUNT(*) sayi',
					where: [
						{ degerAta: sayac, saha: fisSayacSaha },
						{ degerAta: mustKod, saha: 'mus.must' }
					]
				}).distinctYap()
				uygunmu = !!asInteger(await MQCogul.sqlExecTekilDeger({ ...e, query: sent }))
			}
			if (uygunmu) {
				let mustRec = this.mustRec = e.mustRec ?? await this.class.getMust2Rec(mustKod)
				uygunmu = kapsam.uygunmu({ kapsam: istenenKapsam, mustRec, alim })
			}
			if (uygunmu)
				break
		}
		return uygunmu
    }
	static yukle_queryDuzenle({ stm, sent, mustKod, kapsam: istenenKapsam = this.kapsam, offlineMode }) {  /* edt: a!cbr00t-CGP */
		offlineMode ??= MQCogul.isOfflineMode
		let {alimmi, table, kapsamSinif} = this
		let {where: wh, sahalar} = sent, {orderBy} = stm
		mustKod ||= istenenKapsam.mustKod
		let {tipListe, tip2RowAttrListe} = kapsamSinif
		let alias = 'fis', mustSqlDegeri = MQSQLOrtak.sqlServerDegeri(mustKod)
		sent.fromAdd(`${table} ${alias}`)
		wh.fisSilindiEkle({ alias })
		wh.add(`${alias}.devredisi = ''`)
		let _kapsam = istenenKapsam
		if (isPlainObject(_kapsam))
			_kapsam = new kapsamSinif(_kapsam, alimmi)
		if (mustKod) {
			_kapsam = _kapsam.deepCopy?.() ?? { ..._kapsam }
			delete _kapsam.must
			wh.add(new MQOrClause([
				`fis.detaylimust = ''`,
				new MQAndClause([
					`(COALESCE(${alias}.mustb, '') = '' OR ${alias}.mustb <= ${mustSqlDegeri})`,
					`(COALESCE(${alias}.musts, '') = '' OR ${alias}.musts >= ${mustSqlDegeri})`
				])
			]))
		}
		_kapsam?.uygunlukClauseDuzenle({ alias, where: wh })
		sahalar.addWithAlias(alias,
			'kaysayac sayac', 'kod', 'aciklama', 'kgrupkod grupKod', 'dvkod dvKod',
			'detaylimust mustDetaydami', 'subeicinozeldir subeIcinOzeldir'
		)
		for (let tip of tipListe) {
			let rowAttrs = tip2RowAttrListe[tip] ?? [`${tip}b`, `${tip}s`];
			if (rowAttrs?.length)
				sahalar.addWithAlias('fis', ...rowAttrs)
		}
		if (offlineMode)
			orderBy.add('subeicinozeldir', 'tarihb DESC', 'detaylimust', 'kod')
		else
			orderBy.add('subeIcinOzeldir', 'tarihb DESC', 'mustDetaydami DESC', 'kod')
	}
	yukle_queryDuzenle(e = {}) {
		e.kapsam ??= this.kapsam
		return this.class.yukle_queryDuzenle(e)
	}
	setValues({ rec }) {
		let {alimmi, kapsamSinif} = this.class
		this.sayac = rec.sayac || null
		for (let key of ['tipKod', 'kod', 'aciklama', 'grupKod', 'dvKod', 'subeIcinOzeldir']) { this[key] = rec[key] ?? '' }
		for (let key of ['mustDetaydami', 'iskontoYokmu', 'promosyonYokmu']) { this[key] = asBool(rec[key]) }
		this.konsolideSubemi = rec.konsolideSubemi = rec.konTipKod == 'S';
		let kapsam = this.kapsam = new kapsamSinif(null, alimmi)
		kapsam.setValues(arguments[0], alimmi)
	}
	static getAltKosulYapilar() { return null }
	getAltKosulYapilar(e, _mustKod) { return this.class.getAltKosulYapilar(e, this, _mustKod) }
	async getAltKosullar(e = {}) {
		if (!isObject(e) || isArray(e))
			e = { kodListe: makeArray(e) }
		let {offlineMode} = e
		let _satisKosul = this, {kapsam, kod, mustKod, iskontoYokmu, promosyonYokmu} = this
		//let stokKodListe = $.makeArray(typeof e == 'object' && !$.isArray(e) ? e.stokKodListe ?? e.kodListe : e)
		//if ($.isEmptyObject(stokKodListe)) { return {} }
		let cache = _satisKosul._altKosullar ??= {}
		let anah = toJSONStr({ ...e, kod, kapsam, mustKod })
		return cache[anah] ??= await (async () => {
			let _ = cache['_stokGrupTablo'] ??= await (async () => {
				let result = { grup2StokKodSet: {}, stok2GrupKod: {} }
				{	/* Stoklar için Grup Kodlarını belirle */
					let sent = new MQSent({
						from: 'stkmst stk', sahalar: ['stk.kod stokKod', 'stk.grupkod grupKod'],
						where: [/*{ inDizi: stokKodListe, saha: 'stk.kod' },*/ `stk.grupkod > ''`]
					})
					for (let {stokKod, grupKod} of await MQCogul.sqlExecSelect({ offlineMode, query: sent })) {
						if (!grupKod)
							continue
						result.stok2GrupKod[stokKod] = grupKod
						; (result.grup2StokKodSet[grupKod] ??= {})[stokKod] = true
					}
				}
				return result
			})()
			let {stok2GrupKod, grup2StokKodSet} = _, result = {}
			{	/* Stok Gruplar için Alt Koşulları belirle (init values - öncelik #2) */
				let stm = new MQStm(), {sent} = stm, kodListe = keys(grup2StokKodSet)
				let _e = { ...e, kodListe, stm, sent, grupmu: true };
				if (this.getAltKosullar_queryDuzenle(_e) !== false) {
					stm = _e.stm; sent = _e.sent
					let sevRecs = seviyelendir({
						attrListe: ['xKod'],
						source: await MQCogul.sqlExecSelect({ offlineMode, query: stm })
					})
					let detTip = 'G'
					for (let {detaylar} of sevRecs)
					for (let _rec of detaylar) {
						let {xKod: grupKod} = _rec
						if (!grupKod)		 		 		 		 		 		 		 		 		 		 	  /* sent.where koşulundan dolayı normalde boş grupKod gelmemesi gerekir, sadece önlem */
							continue
						let stokKodSet = grup2StokKodSet[grupKod]
						if (empty(stokKodSet))																			  /* grupKod'a ait stokKod liste boş ise işlem yapma. normalde bu dict values içeriğinin boş gelmemesi bekleniyor */
							continue
						$.extend(_rec, { _satisKosul, detTip, iskontoYokmu, promosyonYokmu })							  /* ortak değerleri orijinal _rec içine ata */
						for (let xKod in stokKodSet)																	  /* grupKod'a ait her 'stokKod' için kopya kayıt ile result'a eklenti yap */
							result[xKod] = { ..._rec, xKod }
					}
				}
			}
			{	/* Stoklar için Alt Koşulları belirle (with override - öncelik #1) */
				let stm = new MQStm(), {sent} = stm  /*, kodListe = stokKodListe;*/
				let _e = { ...e, /*kodListe,*/ stm, sent, grupmu: false }
				if (this.getAltKosullar_queryDuzenle(_e) !== false) {
					stm = _e.stm; sent = _e.sent
					let sevRecs = seviyelendir({
						attrListe: ['xKod'],
						source: await MQCogul.sqlExecSelect({ offlineMode, query: stm })
					})
					let detTip = 'S'
					for (let {detaylar} of sevRecs)
					for (let rec of detaylar) {
						let {xKod} = rec																				  /* stokKod boş ise işlem yapma. normalde boş gelmemesi bekleniyor */
						if (!xKod)
							continue
						$.extend(rec, { _satisKosul, detTip, iskontoYokmu, promosyonYokmu })							  /* ortak değerleri ata */
						result[xKod] = rec																				  /* result'a eklenti yap */
					}
				}
			}
			return result
		})()
	}
	getAltKosullar_queryDuzenle({ stm, sent, kodListe, grupmu }) {
		let {sayac, kapsam, class: { table, detayTables, fisSayacSaha }} = this, {mustKod} = kapsam
		let {where: wh, sahalar} = sent, {orderBy} = stm
		let xKodClause = grupmu ? 'grupkod' : 'stokkod'
		let detTable = detayTables?.[grupmu ? 'grup' : 'stok']
		if (!detTable)
			return false
		sent.fromAdd(`${detTable} har`)
		wh.degerAta(sayac, `har.${fisSayacSaha}`)
		if (kodListe?.length)
			wh.inDizi(kodListe, `har.${xKodClause}`)
		sahalar.addWithAlias('har', `${fisSayacSaha} fisSayac`, `${xKodClause} xKod`)
		orderBy.add('xKod')
	}
	static async getMust2Rec(e = {}) {
		let kod = (isObject(e) ? e.mustKod ?? e.mustkod ?? e.must ?? e.kod : e)?.trimEnd()
		if (!kod)
			return null
		let mustKod2Rec = this._mustKod2Rec ??= {}
		return mustKod2Rec[kod] ??= await (async () => {
			let mustSaha = MQCogul.isOfflineMode ? window.MQTabCari?.kodSaha : 'must'
			let sent = new MQSent(), {where: wh, sahalar} = sent
			sent.fromAdd('carmst car')
				.cari2BolgeBagla().fromIliski('isyeri isy', 'bol.bizsubekod = isy.kod')
	            .leftJoin('car', 'carisatis csat', [`car.${mustSaha} = csat.must`, `csat.satistipkod = ''`])
	            .leftJoin('car', 'carmst kon', [`car.kontipkod = 'S'`, `car.konsolidemusterikod > ''`, `car.konsolidemusterikod = kon.${mustSaha}`])
	            .leftJoin('kon', 'carbolge kbol', 'kon.bolgekod = kbol.kod')
	            .leftJoin('kbol', 'isyeri kisy', 'kbol.bizsubekod = kisy.kod')
			wh.degerAta(kod, `car.${mustSaha}`)
			sahalar.add(
				`car.${mustSaha} mustKod`, 'car.konsolidemusterikod konMustKod', 'car.tipkod tipKod',
				'car.bolgekod bolgeKod', 'car.kosulgrupkod kosulGrupKod',
				'csat.tavsiyeplasiyerkod plasiyerKod',
				'bol.bizsubekod subeKod', 'isy.isygrupkod subeGrupKod',
				'car.kontipkod konTipKod', 'kon.bolgekod konBolgeKod', 'kon.kosulgrupkod konKosulGrupKod',
				'kbol.bizsubekod konSubeKod', 'kisy.isygrupkod konSubeGrupKod'
			)
			return await MQCogul.sqlExecTekil({ ...e, query: sent })
		})()
	}
	uygunmu(e = {}) {
		let {kapsam} = this, diger = (typeof e == 'object' ? e.kapsam : e) ?? {}
		return keys(kapsam)?.every(k => !diger[k] || kapsam[k] == diger[k]) ?? false
	}
	kesisim(e = {}) {
		let {kapsam} = this, diger = (typeof e == 'object' ? e.kapsam : e) ?? {}
		let _keys = keys(kapsam).filter(k => !diger[k] || kapsam[k] == diger[k])
		return fromEntries(_keys.map(k => [k, kapsam[k]]))
	}
}


/* örnek kullanım
let kosul; try { await (kosul = SatisKosul.newFor('FY')).yukle('1200027') ? await kosul?.getAltKosullar(['000025', '100333']) : {} }
catch (ex) { console.error(getErrorText(ex)); throw ex }
*/
