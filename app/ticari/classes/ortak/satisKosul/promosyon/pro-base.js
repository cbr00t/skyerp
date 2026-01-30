class Promosyon extends SatisKosul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return 'PR' } static get aciklama() { return 'Promosyon' }
	static get promu() { return true } static get kapsamSinif() { return ProKapsam }
	static get kosulSiniflar() {
		let {_kosulSiniflar: result} = this
		if (result == null)
			result = this._kosulSiniflar = [this]
		return result
	}
	static get tipListe() {
		let {_tipListe: result} = this
		if (result == null)
			result = this._tipListe = this.kosulSiniflar.map(cls => cls.tipKod)
		return result
	}
	static get table() { return 'promo' }
	static get detayTables() { return { stok: null, grup: 'proozelgrup' } }
	static get detayMustTable() { return 'protekmust' }
	static yukle_queryDuzenle(e = {}) {
		if (!config.dev) {
			e.stm = null
			return
		}
		
		let {stm, sent, mustKod} = e
		let {kapsam = this.kapsam, offlineMode = MQCogul.isOfflineMode} = e
		let {alimmi, table, kapsamSinif} = this
		let {where: wh, sahalar} = sent, {orderBy} = stm
		mustKod ||= kapsam.mustKod
		let {tipListe, tip2RowAttrListe} = kapsamSinif
		let alias = 'fis', mustSqlDegeri = MQSQLOrtak.sqlServerDegeri(mustKod)
		sent.fromAdd(`${table} ${alias}`)
		wh.fisSilindiEkle({ alias })
		wh.add(`${alias}.devredisi = ''`)
		let _kapsam = kapsam
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
		sahalar.addWithAlias(alias, ...[
			'kaysayac sayac', 'kod', 'aciklama', 'tipkod tipKod',
			'detaylimust mustDetaydami', 'subeicinozeldir subeIcinOzeldir',
			'veritipi veriTipi', 'hedeftipi hedefTipi',
			'vciro vCiro', 'vcirokdvlimi vCiroKdvlimi',
			'vstokkod vStokKod', 'hstokkod hStokKod',
			'vgrupkod vGrupKod', 'hgrupkod hGrupKod',
			'vmiktar vMiktar', 'hmiktar hMiktar',
			'hbrm hBrm', 'hdipisk hDipIsk', 'hmfvarsasatiriskkapat hMFVarsaSatiriKapat',
			'hproiskoran hProIskOran'
		])
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
	static async getAltKosulYapilar(e, _kosul, _mustKod) {
		e ??= {}
		let cache = this._cache ??= {}
		let anah = toJSONStr({ ...e, _kosul, _mustKod })
		let result = cache[anah] ??= await this._getAltKosulYapilar(e, _kosul, _mustKod)
		if (result) {
			for (const [xKod, rec] of entries(result)) {
				rec.detTip ??= 'S'
				rec.xKod ??= xKod
			}
		}
		return result
	}
	static async _getAltKosulYapilar(e = {}, _kosullar, _mustKod) {
	    let isObj = isObject(e) && !isArray(e)
		let kodListe = makeArray(isObj ? e.kodListe ?? e.kod : e)
		if (empty(kodListe))
			return {}
		let kosullar = makeArray(isObj ? e.kosullar ?? e.kosul : _kosullar)
		let mustKod = isObj ? e.mustKod : _mustKod
		
		let result = {}, eksikKodSet = asSet(kodListe)
		if (!empty(kosullar)) {
			let altKosullar = {}
			for (let kosul of kosullar)
				$.extend(altKosullar, await kosul.getAltKosullar(kodListe))
	        for (let [stokKod, rec] of entries(altKosullar)) {
	            result[stokKod] ??= rec
				rec.kayitTipi = 'K'
	            // if (rec.hstokkod)
				// 	delete eksikKodSet[stokKod]
	        }
	    }
	    if (empty(eksikKodSet))
			return result
		
		// ...
		// ...
		
		return result
	}
}
