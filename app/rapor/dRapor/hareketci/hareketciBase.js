class DRapor_Hareketci extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'HRK' } static get kategoriAdi() { return 'Hareketci' }
}
class DRapor_Hareketci_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return null }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); let {result} = e;
		this.tabloYapiDuzenle_ozelIsaret(e).tabloYapiDuzenle_sube(e)
	}
	loadServerData_queryDuzenle(e) {
		e.alias = e.alias ?? 'hrk'; let {hareketciSinif} = this.class, {stm, attrSet} = e;
		let hareketci = new hareketciSinif(), {varsayilanHV: hrkDefHV} = hareketci.class; $.extend(e, { hareketci, hrkDefHV });
		hareketci
			/*.withAttrs(Object.keys(hrkAttrSet)).setWHD_master(e => { const {wh, attr2Deger} = e; wh.degerAta('C1', attr2Deger.asilmust) })
			.setWHD_hareket(e => { const {wh, attr2Deger} = e; wh.basiSonu({ basi: today().yilBasi(), sonu: today() }, attr2Deger.tarih) })*/
		let uni = e.uni = stm.sent = new MQUnionAll(), _e = { ...e, hrkDefHV, temps: {} }
		let {uygunluk2UnionBilgiListe} = hareketci.class; for (let [{ sent, hv: hrkHV }] of Object.values(uygunluk2UnionBilgiListe)) {
			$.extend(_e, {
				sent, hrkHV, hvDegeri: key => this.hrkHVDegeri({ ..._e, key }),
				sentHVEkle: (...keys) => { for (let key of keys) { this.hrkSentHVEkle({ ..._e, key }) } }
			})
			this.loadServerData_queryDuzenle_hrkSent(_e); uni.add(sent)
		}
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		let {hvDegeri} = e, tarihSaha = hvDegeri('tarih'); this.donemBagla({ ...e, tarihSaha });
		this.loadServerData_queryDuzenle_ozelIsaret({ ...e, kodClause: hvDegeri('ozelisaret') });
		this.loadServerData_queryDuzenle_sube({ ...e, kodClause: hvDegeri('bizsubekod') });
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: '', tarihSaha })
	}
	hrkSentHVEkle(e) {
		let {key: alias, sent} = e, {sahalar} = sent;
		let deger = this.hrkHVDegeri(e); sahalar.add(new MQAliasliYapi({ deger, alias }));
		return this
	}
	hrkHVDegeri({ key, hrkHV: hv, hrkDefHV: defHV }) { return hv[key] || defHV[key] }
}
