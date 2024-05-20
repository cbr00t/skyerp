class RRaporDetay extends MQDetay {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip2Sinif() {
		let result = this._tip2Sinif;
		if (result == null) {
			result = {}; for (const cls of this.subClasses) { const {kayitTipi} = cls; if (kayitTipi != null) result[kayitTipi] = cls }
			this._tip2Sinif = result
		}
		return result
	}
	static get kayitTipi() { return null } static get table() { return 'rstdrapordetay' }
	static get fisSayacSaha() { return 'sayac' } static get sayacSaha() { return 'sayac' }
	constructor(e) { super(e); e = e || {} }
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {hv} = e;
		$.extend(hv, { dettip: this.class.kayitTipi, attr: '', baslik1: '', baslik2: '', xgenislik: 0 })
	}
}
class RRSahaOrtak extends RRaporDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get tipBelirtec() { return this.tip?.anaTip }
	constructor(e) {
		super(e); e = this.getConstructorArgs(e) || {}; const _baslikDizi = e.baslik || e.baslikDizi;
		$.extend(this, { genislikCh: e.GENISLIK ?? e.genislikCh, align: e.ALIGN ?? e.align, wordWrapFlag: asBool(e.WRAP ?? e.wordWrap ?? e.wordWrapFlag) });
		let baslikDizi = ($.isArray(_baslikDizi) ? _baslikDizi : [ e.BAS1 ?? e.BASLIK1 ?? e.baslik1 ?? e.baslik1, e.BAS2 ?? e.BASLIK2 ?? e.baslik2 ?? e.baslik2 ]).filter(x => !!x);
		this.baslik = baslikDizi.length ? baslikDizi.join('\r\n') : ''; this.sifirGostermeFlag = asBool(coalesce(e.ZSUPP, e.sifirGosterme)); this.tipAta({ rec: e });
	}
	tipAta(e) {
		const {rec} = e, tipOrDef = rec.TIP ?? rec.tip; let tip = null, tipAtandimi = false;
		if (tipOrDef) {
			if (typeof tipOrDef == 'object')
				tip = $.isPlainObject(tipOrDef) ? GridKolonTip.from(tipOrDef) : tipOrDef
			else if (typeof tipOrDef == 'string') {
				const sifirGosterme = this.sifirGostermeFlag;
				if (tipOrDef) {
					switch (tipOrDef) {
						case 'T': this.tipDate(); tipAtandimi = true; break
						case 'N': this.tipNumerik(); tipAtandimi = true; break
						case 'D': this.tipDecimal({ fra: 0, sifirGosterme }); tipAtandimi = true; break
						default:
							if (tipOrDef[0] == 'D') { const fra = asInteger(tipOrDef.slice(1)); this.tipDecimal({ fra: fra, sifirGosterme }); tipAtandimi = true }
							else if (tipOrDef[0] == '@') {
								const sonrasi = tipOrDef.slice(1);
								switch (sonrasi) {
									case 'FIYAT': this.tipDecimal_fiyat({ sifirGosterme }); tipAtandimi = true; break
									case 'DVFIYAT': this.tipDecimal_dvFiyat({ sifirGosterme }); tipAtandimi = true; break
									case 'BEDEL': this.tipDecimal_bedel({ sifirGosterme }); tipAtandimi = true; break
									case 'DVBEDEL': this.tipDecimal_dvBedel({ sifirGosterme }); tipAtandimi = true; break
									default:
										// @MIKBU-brm ... gibi
										const Prefix_MIKBU = 'MIKBU-', fraAttr = sonrasi.startsWith(Prefix_MIKBU) ? sonrasi.slice(Prefix_MIKBU.length) : null;
										if (fraAttr) { this.tipDecimal({ fra: fraAttr, sifirGosterme }); tipAtandimi = true }
										break
								}
							}
							break
					}
					/* tip = GridKolonTip.from($.extend({}, e, { tip: tipOrDef })) */
				}
			}
		}
		if (!tipAtandimi) { if (!tip) tip = new GridKolonTip_String(); this.tip = tip }
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {hv} = e;
		const _baslik = this.baslik.split('\n').filter(x => !!x), baslik1 = (_baslik[0] || '').replace('\n', ''), baslik2 = (_baslik[1] || '').replace('\n', '');
		$.extend(hv, { baslik1, baslik2, xgenislik: (this.genislikCh || 0) * katSayi_ch2STRapor })
	}
	setValues(e) {
		super.setValues(e); const {rec} = e, baslikDizi = [rec.baslik1, rec.baslik2].filter(x => !!x);
		$.extend(this, { baslik: baslikDizi.length ? baslikDizi.join('\r\n') : '', genislikCh: rec.xgenislik * katSayi_stRapor2Ch });
	}
	getConstructorArgs(e) { if (e != null && $.isArray(e)) return ({ attr: e[0], baslik: e[1], genislikCh: e[2], sql: e[3] }); return e }

	alignLeft() { this.align = 'left'; return this }
	alignCenter() { this.align = 'center'; return this }
	alignRight() { this.align = 'right'; return this }
	wordWrap() { this.wordWrapFlag = true; return this }
	noWrap() { this.wordWrapFlag = false; return this }
	sifirGosterme() { const {tip} = this; if (tip && tip.sifirGosterme) tip.sifirGosterme(); return this }
	sifirGoster() { const {tip} = this; if (tip && tip.sifirGoster) tip.sifirGoster(); return this }
	tipString(e) { this.tip = new GridKolonTip_String(); return this }
	tipNumerik(e) { e = e || {}; const sifirGosterme = e.sifirGosterme ?? e.sifirGostermeFlag; this.tip = new GridKolonTip_Number({ sifirGosterme }); this.alignRight(); return this }
	tipDecimal(e) {
		e = e || {}; const sifirGosterme = e.sifirGosterme ?? e.sifirGostermeFlag; const fra = typeof e == 'object' ? e.fra : e;
		this.tip = new GridKolonTip_Decimal({ fra: sifirGosterme }); this.alignRight(); return this
	}
	tipDecimal_fiyat(e) { return this.tipDecimal({ fra: 'fiyat' }) }
	tipDecimal_dvFiyat(e) { return this.tipDecimal({ fra: 'dvFiyat' }) }
	tipDecimal_bedel(e) { return this.tipDecimal({ fra: 'bedel' }) }
	tipDecimal_dvBedel(e) { return this.tipDecimal({ fra: 'dvBedel' }) }
	tipDate() { this.tip = new GridKolonTip_Date(); return this }
}
