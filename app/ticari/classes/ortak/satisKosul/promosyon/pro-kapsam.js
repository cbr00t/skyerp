class ProKapsam extends SatisKosulKapsam {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipListe() {
		return ['tarih', 'must', 'plasiyer', 'plasiyerBolge', 'plasiyerTip', 'sube', 'cariTip', 'cariKosulGrup']
	}
	static get alimTipListe() { return ['tarih', 'must'] }
	static get dateTipSet() { return asSet(['tarih']) }
	/** 'tipListe'deki işlemlerden hangilerinin JS, hangilerinin SQL tarafında yapılacağını belirtir.
		    offlineMode için SqlJS kullanılır ve SQLite'in Date işlemleri güvenlilir değildir.
	    - Online mode (MSSQLServer) için tüm işlemleri SQL tarafında yap
		- Offline mode (SQLite) için 'tarih' karşılaştırmasını JavaScript tabanlı, diğer işlemleri SQL tarafında yap
	*/
	static get uygunmuKontrol() {
		let {_pro_uygunmuKontrol: result} = this
		if (result == null) {
			let {tipListe} = this, offlineMode = window.MQCogul?.isOfflineMode ?? app?.offlineMode ?? false;
			let js = ['sube', 'subeGrup', (offlineMode ? 'tarih' : null)].filter(x => !!x);
			result = this._pro_uygunmuKontrol = { js: asSet(js) };
			result.sql = asSet(tipListe.filter(x => !result.js[x]));
			result.all = { ...result.js, ...result.sql }
		}
		return result
	}
	static get tip2RowAttrListe() {
		let {_pro_tip2RowAttrListe: result} = this
		if (result == null) {
			result = this._pro_tip2RowAttrListe = {
				plasiyer: ['plasb', 'plass'], plasiyerBolge: ['plbolgeb', 'plbolges'], plasiyerTip: ['pltipb', 'pltips'],
				cariTip: ['ctipb', 'ctips'], cariKosulGrup: ['ckgrupb', 'ckgrups'], sube: ['ozelsubekod']
			}
		}
		return result
	}
}
