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
		if (typeof value == 'object' && !$.isArray(value)) { value = Object.keys(value) }
		this.cacheReset(); this._ekOzellikListe = value || []
	}
	static get belirtecListe() {
		let {_belirtecListe: result} = this; if (result == null) {
			result = this._belirtecListe = []; let {hmr} = app.params?.stokGenel ?? {}, {ekOzellikListe} = this;
			if (hmr) { for (let key in (hmr ?? {})) { if (hmr[key]) { result.push(key) } } }
			result.push(...ekOzellikListe.map(kod => `ekOz${asInteger(string2Numeric(kod))}`))
		}
		return result
	}
	static set belirtecListe(value) {
		if (typeof value == 'object' && !$.isArray(value)) { value = Object.keys(value) }
		this.cacheReset(); this._belirtecListe = value || []
	}
	static get belirtecSet() {
		let {_belirtecSet: result} = this;
		if (result == null) { result = this._belirtecSet = asSet(this.belirtecListe) }
		return result
	}
	static get hmrEtiketDict() {
		let {_hmrEtiketDict: result} = this; if (result == null) {
			let {hmrEtiket, ekOzellikBilgileri} = app.params?.stokGenel ?? {}, {ekOzellikListe} = this;
			result = this._hmrEtiketDict = { ...(hmrEtiket ?? {}) };
			for (let kod of ekOzellikListe ?? []) {
				let seq = asInteger(string2Numeric(kod));
				let key = `ekOz${seq}`, adi = hmrEtiket[key] || ekOzellikBilgileri[seq - 1]?.adi;
				if (adi) { result[key] = adi }
			}
		}
		return result
	}
	static get ioAttrListe() {
		let {_ioAttrListe: result} = this;
		if (result == null) { result = this._ioAttrListe = Object.values(HMRBilgi.belirtec2Bilgi).map(item => item.ioAttr) }
		return result
	}
	static get rowAttrListe() {
		let {_rowAttrListe: result} = this;
		if (result == null) { result = this._rowAttrListe = Object.values(HMRBilgi.belirtec2Bilgi).map(item => item.rowAttr) }
		return result
	}
	static get belirtec2Bilgi() {
		let result = this._belirtec2Bilgi; if (!result) {
			const _result = {
				model: { ioAttr: 'modelKod', adiAttr: 'modelAdi', rowAttr: 'modelkod', rowAdiAttr: 'modeladi', etiket: 'Model', kami: true, mfSinif: MQModel },
				renk: { ioAttr: 'renkKod', adiAttr: 'renkAdi', rowAttr: 'renkkod', rowAdiAttr: 'renkadi', etiket: 'Renk', kami: true, mfSinif: MQRenk },
				desen: { ioAttr: 'desenKod', adiAttr: 'desenAdi', rowAttr: 'desenkod', rowAdiAttr: 'desenadi', etiket: 'Desen', kami: true, mfSinif: MQDesen },
				raf: { ioAttr: 'rafKod', adiAttr: 'rafKod', rowAttr: 'rafkod', rowAdiAttr: 'rafkod', etiket: 'Raf', kami: false, mfSinif: MQYerRaf },
				beden: { ioAttr: 'beden', rowAttr: 'beden', etiket: 'Beden' }, harDet: { ioAttr: 'harDet', rowAttr: 'hardet', etiket: 'Har.Det.' },
				lotNo: { ioAttr: 'lotNo', rowAttr: 'lotno', etiket: 'Lot No' }, utsNo: { ioAttr: 'utsNo', rowAttr: 'utsno', etiket: 'UTS No' },
				en: { ioAttr: 'en', rowAttr: 'en', etiket: 'En', numerikmi: true }, boy: { ioAttr: 'boy', rowAttr: 'boy', etiket: 'Boy', numerikmi: true },
				yukseklik: { ioAttr: 'yukseklik', rowAttr: 'yukseklik', etiket: 'Yükseklik', numerikmi: true }
			};
			let {ekOzellikBilgileri} = app.params?.stokGenel ?? {}, {ekOzellikListe} = this;
			let ekOzSeq2Adi = {}; for (let kod of ekOzellikListe) {
				let seq = asInteger(string2Numeric(kod)); ekOzSeq2Adi[seq] = kod }
			/* let adi2EkOzSeq = {}; ekOzellikBilgileri?.filter(x => !!x)?.forEach(({ adi }, i) => adi2EkOzSeq[adi] = i + 1); */
			for (let i = 0; i < ekOzellikBilgileri?.length ?? 0; i++) {
				let item = ekOzellikBilgileri[i] ?? {}; if (!item) { continue }
				let seq = i + 1, adi = ekOzSeq2Adi[seq]; if (!adi) { continue }
				adi = ekOzellikBilgileri[i]?.adi || adi;
				let clsDef = `(class MQEkOzellik${seq} extends MQKA {
					static { window[this.name] = this; this._key2Class[this.name] = this }
					static get sinifAdi() { return '${adi}' } static get table() { return '${`stokekoz${seq}`}' } static get tableAlias() { return '${`ekoz${seq}`}' }
				})`;
				_result[`ekOz${seq}`] = {
					index: seq - 1, seq, ioAttr: `ekOz${seq}Kod`, adiAttr: `ekOz${seq}Adi`, rowAttr: `ekoz${seq}kod`, rowAdiAttr: `ekoz${seq}adi`,
					etiket: adi, kami: true, ekOzellikmi: true, mfSinif: eval(clsDef)
				}
			}
			let {belirtecSet, hmrEtiketDict} = this; result = {};
			for (let [belirtec, item] of Object.entries(_result)) {
				item.belirtec = belirtec; if (!belirtecSet[belirtec]) { continue }
				let etiket = hmrEtiketDict[belirtec]; if (etiket) { item.etiket = etiket }
				result[belirtec] = item
			}
			this._belirtec2Bilgi = result
		}
		return result
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments); let {adiAttr} = this;
		for (let {numerikmi, ioAttr, rowAttr} of this.hmrIter()) {
			let cls = numerikmi ? PInstNum : PInstStr; pTanim[ioAttr] = new cls(rowAttr);
			if (adiAttr) { pTanim[adiAttr] = new PInstStr() }
		}
	}
	static *hmrIter(e) {
		e = e ?? {}; let DefaultGenislikCh = 10, DefaultAdiGenislikCh = DefaultGenislikCh + 13;
		let {belirtec2Bilgi, belirtecSet} = this, ekOzellikmi = e.ekOzellik ?? e.ekOzellikmi;
		for (let [belirtec, _item] of Object.entries(belirtec2Bilgi)) {
			if (!belirtecSet[belirtec] || (ekOzellikmi == null ? false : ekOzellikmi != _item.ekOzellikmi)) { continue }
			let item = {
				..._item,
				get defaultValue() { return item.numerikmi ? 0 : '' },
				get table() { return item.mfSinif?.table }, get tableAlias() { return item.mfSinif?.tableAlias }, get tableAndAlias() { return item.mfSinif?.tableAndAlias },
				get kodSaha() { return item.mfSinif?.kodSaha }, get adiSaha() { return item.mfSinif?.adiSaha },
				asGridKolon(e) {
					e = e || {}; let {_gridKolon: result} = this;
					if (result === undefined) {
						let {kami, mfSinif} = item;
						if (kami && !mfSinif) { result = null }
						else {
							result = this._gridKolon = kami
								? mfSinif.getGridKolonGrup({
									belirtec: item.belirtec, kodAttr: item.ioAttr, adiAttr: item.adiAttr,
									kodEtiket: item.etiket || ioAttr, text: item.etiket, adiGenislikCh: DefaultGenislikCh + DefaultAdiGenislikCh
								})
								: new GridKolon({ belirtec: item.ioAttr, text: item.etiket, genislikCh: DefaultGenislikCh });
							if (result) { result.kodZorunluOlmasin() } if (item.numerikmi) { result.tipDecimal(2) }
							if (kami && mfSinif) {
								result.stmDuzenleyiciEkle(e => mfSinif?.hmr_queryEkDuzenle?.(e)); result.degisince(e => mfSinif.hmrSetValuesEk(e));
								let colDef = result; if (colDef?.kaKolonu) { colDef = colDef.kaKolonu }
								mfSinif.hmrTabloKolonDuzenle?.({ orjColDef: result, colDef })
							}
						}
					}
					return result
				},
				asGridGosterimKolonlar(e) {
					e = e || {}; let {_gridGosterimKolonlar: result} = this;
					if (result === undefined) {
						let {kami, mfSinif} = item;
						if (kami && !mfSinif) { result = null }
						else {
							let {rowAttr, etiket, adiAttr} = item, mfSinif = item.mfSinif ?? MQHMR;
							const kodKolonu = new GridKolon({ belirtec: rowAttr, text: etiket, genislikCh: asInteger(DefaultGenislikCh) });
							result = this._gridGosterimKolonlar = [kodKolonu];
							if (item.numerikmi) { kodKolonu.tipDecimal(2) }
							if (kami && mfSinif) {
								if (adiAttr) {
									let {tableAlias: mfAlias} = mfSinif, mfAliasVeNokta = mfAlias ? `${mfAlias}.` : '';
									result.push(new GridKolon({ belirtec: adiAttr, text: `${etiket} Adı`, genislikCh: DefaultAdiGenislikCh, sql: `${mfAliasVeNokta}${mfSinif.adiSaha}` }))
								}
								for (const colDef of result) { mfSinif?.hmrTabloKolonDuzenle?.({ orjColDef: colDef, colDef }) }
							}
						}
					}
					return result
				},
				asRaporKolonlari(e) {
					e = e || {}; let {_raporKolonlari: result} = this;
					if (result === undefined) {
						let alias = e.alias || 'har', aliasVeNokta = alias ? `${alias}.` : '', {belirtec, rowAttr, ioAttr, adiAttr, etiket, numerikmi, kami, mfSinif} = item;
						let saha = new RRSahaDegisken({ attr: rowAttr, baslik: etiket, sql: `${aliasVeNokta}${rowAttr}` });
						result = this._raporKolonlari = [saha];
						if (numerikmi) { saha.tipDecimal(2) }
						if (kami && mfSinif) {
							const {tableAlias, adiSaha} = mfSinif;
							saha = new RRSahaDegisken({ attr: `${belirtec}adi`, baslik: `${etiket}\r\nAdı`, sql: `${tableAlias}.${adiSaha}` });
							result.push(saha);
						}
					}
					return result
				}
			};
			yield item
		}
	}
	hmrIter(e) { return this.class.hmrIter(e) }
	static hmrIter_hmr(e) { return this.hmrIter({ ...e, ekOzellik: false }) }
	static hmrIter_ekOzellik(e) { return this.hmrIter({ ...e, ekOzellik: true }) }
	static [Symbol.iterator](e) { return this.hmrIter(e) }
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e) }
	setValues(e) {
		super.setValues(e); const {rec} = e;
		for (const {adiAttr, kami, mfSinif} of this.hmrIter()) {
			if (adiAttr) { const value = rec[adiAttr]; if (value != null) { this[adiAttr] = value } }
			if (kami && mfSinif) { mfSinif.hmrSetValuesEk?.({ ...e, inst: this, rec }) }
		}
	}
	static globalleriSil() { return this.cacheReset() }
	static cacheReset() {
		deleteKeys(this, '_ekOzellikListe', '_belirtecListe', '_belirtecSet', '_belirtec2Bilgi', '_ioAttrListe', '_rowAttrListe', '_hmrEtiketDict')
		return this
	}
}
