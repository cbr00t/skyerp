class HMRBilgi extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get belirtecListe() {
		let result = this._belirtecListe;
		if (!result) {
			result = this._belirtecListe = []; const _hmr = app.params.stokGenel.hmr;
			for (const key in _hmr) { if (_hmr[key]) result.push(key) }
		}
		return result
	}
	static get belirtecSet() { let result = this._belirtecSet; if (result == null) { result = this._belirtecSet = asSet(this.belirtecListe) } return result }
	static get hmrEtiketDict() { let result = this._hmrEtiketDict; if (result == null) { result = this._hmrEtiketDict = app.params.stokGenel.hmrEtiket } return result }
	static get ioAttrListe() { let result = this._ioAttrListe; if (result == null) { result = this._ioAttrListe = Object.values(HMRBilgi.belirtec2Bilgi).map(item => item.ioAttr) } return result }
	static get rowAttrListe() { let result = this._rowAttrListe; if (result == null) { result = this._rowAttrListe = Object.values(HMRBilgi.belirtec2Bilgi).map(item => item.rowAttr) } return result }
	static get belirtec2Bilgi() {
		let result = this._belirtec2Bilgi;
		if (!result) {
			const _result = {
				model: { ioAttr: 'modelKod', adiAttr: 'modelAdi', rowAttr: 'modelkod', etiket: 'Model', kami: true, mfSinif: MQModel },
				renk: { ioAttr: 'renkKod', adiAttr: 'renkAdi', rowAttr: 'renkkod', etiket: 'Renk', kami: true, mfSinif: MQRenk },
				desen: { ioAttr: 'desenkod', adiAttr: 'desenAdi', rowAttr: 'desenkod', etiket: 'Desen', kami: true, mfSinif: MQDesen },
				beden: { ioAttr: 'beden', rowAttr: 'beden', etiket: 'Beden' },
				harDet: { ioAttr: 'harDet', rowAttr: 'hardet', etiket: 'Har.Det.' },
				lotNo: { ioAttr: 'lotNo', rowAttr: 'lotno', etiket: 'Lot No' },
				utsNo: { ioAttr: 'utsNo', rowAttr: 'utsno', etiket: 'UTS No' },
				raf: { ioAttr: 'rafKod', rowAttr: 'rafkod', etiket: 'Raf', kami: true },
				en: { ioAttr: 'en', rowAttr: 'en', etiket: 'En', numerikmi: true },
				boy: { ioAttr: 'boy', rowAttr: 'boy', etiket: 'Boy', numerikmi: true },
				yukseklik: { ioAttr: 'yukseklik', rowAttr: 'yukseklik', etiket: 'Yükseklik', numerikmi: true }
			};
			const {belirtecSet, hmrEtiketDict} = this;
			result = {};
			for (const belirtec in _result) {
				const item = _result[belirtec]; item.belirtec = belirtec; if (!belirtecSet[belirtec]) { continue }
				const etiket = hmrEtiketDict[belirtec]; if (etiket) item.etiket = etiket
				result[belirtec] = item
			}
			this._belirtec2Bilgi = result
		}
		return result
	}

	constructor(e) { e = e || {}; super(e) }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		for (const item of this.hmrIter()) {
			const cls = item.numerikmi ? PInstNum : PInstStr; pTanim[item.ioAttr] = new cls(item.rowAttr);
			const {adiAttr} = this; if (adiAttr) { pTanim[adiAttr] = new PInstStr() }
		}
	}
	static *hmrIter(e) {
		const DefaultGenislikCh = 20, {belirtec2Bilgi, belirtecSet} = this;
		for (const belirtec in belirtec2Bilgi) {
			if (!belirtecSet[belirtec]) { continue }
			const item = $.extend({}, belirtec2Bilgi[belirtec], /*{ belirtec: belirtec }*/);
			yield $.extend(item, {
				get defaultValue() { return item.numerikmi ? 0 : '' },
				asGridKolon(e) {
					e = e || {}; let result = this._gridKolon;
					if (result === undefined) {
						const {kami, mfSinif} = item; if (kami && !mfSinif) { result = null }
						else {
							result = this._gridKolon = kami
								? mfSinif.getGridKolonGrup({
									belirtec: item.belirtec, kodAttr: item.ioAttr, adiAttr: item.adiAttr,
									kodEtiket: item.etiket || ioAttr, text: item.etiket, adiGenislikCh: DefaultGenislikCh
								})
								: new GridKolon({ belirtec: item.ioAttr, text: item.etiket, genislikCh: DefaultGenislikCh });
							if (result) { result.kodZorunluOlmasin() } if (item.numerikmi) { result.tipDecimal(2) }
							if (kami && mfSinif) {
								result.stmDuzenleyiciEkle(e => mfSinif.hmr_queryEkDuzenle(e)); result.degisince(e => mfSinif.hmrSetValuesEk(e));
								let colDef = result; if (colDef?.kaKolonu) { colDef = colDef.kaKolonu }
								mfSinif.hmrTabloKolonDuzenle({ orjColDef: result, colDef })
							}
						}
					}
					return result
				},
				asGridGosterimKolonlar(e) {
					e = e || {}; let result = this._gridGosterimKolonlar;
					if (result === undefined) {
						const {kami, mfSinif} = item;
						if (kami && !mfSinif) { result = null }
						else {
							const {rowAttr, etiket, adiAttr} = item, mfSinif = item.mfSinif ?? MQHMR;
							const kodKolonu = new GridKolon({ belirtec: rowAttr, text: etiket, genislikCh: asInteger(DefaultGenislikCh / 2) });
							if (item.numerikmi) { kodKolonu.tipDecimal(2) }
							result = [kodKolonu];
							if (kami && mfSinif) {
								if (adiAttr) {
									const mfAlias = mfSinif.tableAlias, mfAliasVeNokta = mfAlias ? `${mfAlias}.` : '';
									result.push(new GridKolon({ belirtec: adiAttr, text: `${etiket} Adı`, genislikCh: DefaultGenislikCh, sql: `${mfAliasVeNokta}${mfSinif.adiSaha}` }))
								}
								for (const colDef of result) { mfSinif.hmrTabloKolonDuzenle({ orjColDef: colDef, colDef }) }
							}
							this._gridGosterimKolonlar = result
						}
					}
					return result
				},
				asRaporKolonlari(e) {
					e = e || {}; let result = this._raporKolonlari;
					if (result === undefined) {
						const alias = e.alias || 'har', aliasVeNokta = alias ? `${alias}.` : '', {belirtec, rowAttr, ioAttr, adiAttr, etiket, numerikmi, kami, mfSinif} = item;
						let saha = new RRSahaDegisken({ attr: rowAttr, baslik: etiket, sql: `${aliasVeNokta}${rowAttr}` });
						if (numerikmi) { saha.tipDecimal(2) } result = [saha];
						if (kami && mfSinif) {
							const {tableAlias, adiSaha} = mfSinif;
							saha = new RRSahaDegisken({ attr: `${belirtec}adi`, baslik: `${etiket}\r\nAdı`, sql: `${tableAlias}.${adiSaha}` });
							result.push(saha);
						}
						this._raporKolonlari = result
					}
					return result
				}
			})
		}
	}
	hmrIter(e) { return this.class.hmrIter(e) }
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e) }
	setValues(e) {
		super.setValues(e); const {rec} = e;
		for (const item of this.hmrIter()) {
			const {adiAttr, kami, mfSinif} = item;
			if (adiAttr) { const value = rec[adiAttr]; if (value != null) { this[adiAttr] = value } }
			if (kami && mfSinif) { mfSinif.hmrSetValuesEk($.extend({}, e, { inst: this, rec })) }
		}
	}
}
