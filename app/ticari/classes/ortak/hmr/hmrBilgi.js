class HMRBilgi extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ekOzellikListe() {
		let {_ekOzellikListe: result} = this; if (result == null) {
			result = this._ekOzellikListe = []; let {ekOzellikBilgileri} = app.params?.stokGenel ?? {};
			if (ekOzellikBilgileri) { result.push(...ekOzellikBilgileri.filter(x => !!x).map(x => x.adi)) }
		}
		return result
	}
	static set ekOzellikListe(value) {
		if (isObject(value) && !isArray(value)) { value = keys(value) }
		this.cacheReset(); this._ekOzellikListe = value || []
	}
	static get belirtecListe() {
		let { _belirtecListe: result } = this
		if (result == null) {
			result = this._belirtecListe = []
			let { hmr } = app.params?.stokGenel ?? {}
			let { ekOzellikListe } = this
			if (hmr) {
				for (let [k, v] of entries(hmr)) {
					if (v)
						result.push(k)
				}
			}
			result.push(...ekOzellikListe.map(kod =>
				`ekOz${asInteger(string2Numeric(kod))}`))
		}
		return result
	}
	static set belirtecListe(value) {
		if (isObject(value) && !isArray(value))
			value = keys(value)
		this.cacheReset()
		this._belirtecListe = value || []
	}
	static get belirtecSet() {
		let { _belirtecSet: result } = this
		if (result == null)
			result = this._belirtecSet = asSet(this.belirtecListe)
		return result
	}
	static get hmrEtiketDict() {
		let { _hmrEtiketDict: result } = this
		if (result == null) {
			let { hmrEtiket, ekOzellikBilgileri } = app.params?.stokGenel ?? {}
			let { ekOzellikListe } = this
			result = this._hmrEtiketDict = { ...(hmrEtiket ?? {}) }
			for (let kod of ekOzellikListe ?? []) {
				let seq = asInteger(string2Numeric(kod))
				let key = `ekOz${seq}`, adi = hmrEtiket[key] || ekOzellikBilgileri[seq - 1]?.adi
				if (adi)
					result[key] = adi
			}
		}
		return result
	}
	static get ioAttrListe() {
		let { _ioAttrListe: result } = this
		if (result == null) {
			result = this._ioAttrListe =
				values(HMRBilgi.belirtec2Bilgi)
					.map(_ => _.ioAttr)
		}
		return result
	}
	static get rowAttrListe() {
		let { _rowAttrListe: result } = this
		if (result == null) {
			result = this._rowAttrListe =
				values(HMRBilgi.belirtec2Bilgi)
					.map(_ => _.rowAttr)
		}
		return result
	}
	static get belirtec2Bilgi() {
		let { _belirtec2Bilgi: result } = this
		if (!result) {
			let _result = {
				model: { ioAttr: 'modelKod', adiAttr: 'modelAdi', rowAttr: 'modelkod', rowAdiAttr: 'modeladi', etiket: 'Model', kami: true, mfSinif: MQModel },
				renk: { ioAttr: 'renkKod', adiAttr: 'renkAdi', rowAttr: 'renkkod', rowAdiAttr: 'renkadi', etiket: 'Renk', kami: true, mfSinif: MQRenk },
				desen: { ioAttr: 'desenKod', adiAttr: 'desenAdi', rowAttr: 'desenkod', rowAdiAttr: 'desenadi', etiket: 'Desen', kami: true, mfSinif: MQDesen },
				raf: { ioAttr: 'rafKod', adiAttr: 'rafKod', rowAttr: 'rafkod', rowAdiAttr: 'rafkod', etiket: 'Raf', kami: false, mfSinif: MQYerRaf },
				beden: { ioAttr: 'beden', rowAttr: 'beden', etiket: 'Beden' }, harDet: { ioAttr: 'harDet', rowAttr: 'hardet', etiket: 'Har.Det.' },
				lotNo: { ioAttr: 'lotNo', rowAttr: 'lotno', etiket: 'Lot No' }, utsNo: { ioAttr: 'utsNo', rowAttr: 'utsno', etiket: 'UTS No' },
				en: { ioAttr: 'en', rowAttr: 'en', etiket: 'En', numerikmi: true }, boy: { ioAttr: 'boy', rowAttr: 'boy', etiket: 'Boy', numerikmi: true },
				yukseklik: { ioAttr: 'yukseklik', rowAttr: 'yukseklik', etiket: 'Yükseklik', numerikmi: true }
			}
			
			let { ekOzellikListe } = this
			let ekOzSeq2Adi = {}
			for (let kod of ekOzellikListe) {
				let seq = asInteger(string2Numeric(kod))
				ekOzSeq2Adi[seq] = kod
			}
			
			let { ekOzellikBilgileri } = app.params?.stokGenel ?? {}
			// let adi2EkOzSeq = {}; ekOzellikBilgileri?.filter(x => !!x)?.forEach(({ adi }, i) => adi2EkOzSeq[adi] = i + 1)
			for (let i = 0; i < ekOzellikBilgileri?.length ?? 0; i++) {
				let item = ekOzellikBilgileri[i]
				if (!item)
					continue
				let seq = i + 1, adi = ekOzSeq2Adi[seq]
				adi = ekOzellikBilgileri[i]?.adi || adi
				let mfSinif = eval(
					`(class MQEkOzellik${seq} extends MQKA {
						static { window[this.name] = this; this._key2Class[this.name] = this }
						static get sinifAdi() { return '${adi}' }
						static get table() { return '${`stokekoz${seq}`}' }
						static get tableAlias() { return '${`ekoz${seq}`}' }
					})`
				)
				
				_result[`ekOz${seq}`] = {
					index: seq - 1, seq, ioAttr: `ekOz${seq}Kod`, adiAttr: `ekOz${seq}Adi`,
					rowAttr: `ekoz${seq}kod`, rowAdiAttr: `ekoz${seq}adi`,
					etiket: adi, kami: true, ekOzellikmi: true, mfSinif
				}
			}
			
			let { belirtecSet, hmrEtiketDict } = this
			result = {}
			for (let [belirtec, item] of entries(_result)) {
				item.belirtec = belirtec
				if (!belirtecSet[belirtec])
					continue
				
				let etiket = hmrEtiketDict[belirtec]
				if (etiket)
					item.etiket = etiket
				result[belirtec] = item
			}
			this._belirtec2Bilgi = result
		}
		
		return result
	}

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		let { adiAttr } = this
		for (let {numerikmi, ioAttr, rowAttr} of this.hmrIter()) {
			let cls = numerikmi ? PInstNum : PInstStr
			pTanim[ioAttr] = new cls(rowAttr)
			if (adiAttr)
				pTanim[adiAttr] = new PInstStr()
		}
	}
	static *hmrIter(e = {}) {
		let DefaultGenislikCh = 10, DefaultAdiGenislikCh = DefaultGenislikCh + 13
		let { belirtec2Bilgi, belirtecSet } = this
		let { ekOzellikmi = e.ekOzellik } = e
		for (let [belirtec, _] of entries(belirtec2Bilgi)) {
			if (!belirtecSet[belirtec] || (ekOzellikmi == null ? false : ekOzellikmi != _.ekOzellikmi))
				continue
			
			let item = {
				..._,
				get defaultValue() { return item.numerikmi ? 0 : '' },
				get table() { return item.mfSinif?.table },
				get tableAlias() { return item.mfSinif?.tableAlias },
				get tableAndAlias() { return item.mfSinif?.tableAndAlias },
				get kodSaha() { return item.mfSinif?.kodSaha },
				get adiSaha() { return item.mfSinif?.adiSaha },
				asGridKolon(e = {}) {
					let { _gridKolon: result } = this
					if (result === undefined) {
						let { kami, mfSinif } = item
						if (kami && !mfSinif)
							result = null
						else {
							result = this._gridKolon = kami
								? mfSinif.getGridKolonGrup({
									belirtec: item.belirtec, kodAttr: item.ioAttr, adiAttr: item.adiAttr,
									kodEtiket: item.etiket || ioAttr, text: item.etiket,
									adiGenislikCh: DefaultGenislikCh + DefaultAdiGenislikCh
								})
								: new GridKolon({ belirtec: item.ioAttr, text: item.etiket, genislikCh: DefaultGenislikCh })
							result?.kodZorunluOlmasin?.()
							if (item.numerikmi)
								result.tipDecimal(2)
							if (kami && mfSinif) {
								result.stmDuzenleyiciEkle(_e =>
									mfSinif?.hmr_queryEkDuzenle?.({ ...e, ..._e }))
								result.degisince(_e =>
									mfSinif?.hmrSetValuesEk?.({ ...e, ..._e }))
								let colDef = result
								if (colDef?.kaKolonu)
									colDef = colDef.kaKolonu
								mfSinif?.hmrTabloKolonDuzenle?.({ orjColDef: result, colDef })
							}
						}
					}
					return result
				},
				asGridGosterimKolonlar(e = {}) {
					let { _gridGosterimKolonlar: result } = this
					if (result === undefined) {
						let {kami, mfSinif} = item
						if (kami && !mfSinif)
							result = null
						else {
							let { rowAttr, etiket, adiAttr } = item
							let mfSinif = item.mfSinif ?? MQHMR
							let kodKolonu = new GridKolon({
								belirtec: rowAttr, text: etiket,
								genislikCh: asInteger(DefaultGenislikCh)
							})
							result = this._gridGosterimKolonlar = [kodKolonu]
							if (item.numerikmi)
								kodKolonu.tipDecimal(2)
							if (kami && mfSinif) {
								if (adiAttr) {
									let { tableAlias: mfAlias } = mfSinif
									let mfAliasVeNokta = mfAlias ? `${mfAlias}.` : ''
									result.push(new GridKolon({
										belirtec: adiAttr, text: `${etiket} Adı`,
										genislikCh: DefaultAdiGenislikCh, sql: `${mfAliasVeNokta}${mfSinif.adiSaha}`
									}))
								}
								for (let colDef of result)
									mfSinif?.hmrTabloKolonDuzenle?.({ orjColDef: colDef, colDef })
							}
						}
					}
					return result
				},
				asRaporKolonlari(e) {
					let { _raporKolonlari: result } = this
					if (result === undefined) {
						let alias = e.alias || 'har', aliasVeNokta = alias ? `${alias}.` : ''
						let { belirtec, rowAttr, ioAttr, adiAttr, etiket, numerikmi, kami, mfSinif } = item
						let saha = new RRSahaDegisken({ attr: rowAttr, baslik: etiket, sql: `${aliasVeNokta}${rowAttr}` })
						result = this._raporKolonlari = [saha]
						if (numerikmi)
							saha.tipDecimal(2)
						if (kami && mfSinif) {
							let { tableAlias, adiSaha } = mfSinif
							saha = new RRSahaDegisken({ attr: `${belirtec}adi`, baslik: `${etiket}\r\nAdı`, sql: `${tableAlias}.${adiSaha}` })
							result.push(saha)
						}
					}
					return result
				}
			}
			yield item
		}
	}
	hmrIter(e) { return this.class.hmrIter(e) }
	static hmrIter_hmr(e) { return this.hmrIter({ ...e, ekOzellik: false }) }
	static hmrIter_ekOzellik(e) { return this.hmrIter({ ...e, ekOzellik: true }) }
	static [Symbol.iterator](e) { return this.hmrIter(e) }
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e) }
	setValues(e) {
		super.setValues(e)
		let { rec } = e
		for (let { adiAttr, kami, mfSinif } of this.hmrIter()) {
			if (adiAttr) {
				let value = rec[adiAttr]
				if (value != null)
					this[adiAttr] = value
			}
			if (kami && mfSinif)
				mfSinif.hmrSetValuesEk?.({ ...e, inst: this, rec })
		}
	}
	static globalleriSil() { return this.cacheReset() }
	static cacheReset() {
		deleteKeys(this, '_ekOzellikListe', '_belirtecListe', '_belirtecSet', '_belirtec2Bilgi', '_ioAttrListe', '_rowAttrListe', '_hmrEtiketDict')
		return this
	}
}
