class SkyRaporApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'SATISLAR' }
	paramsDuzenle(e) { super.paramsDuzenle(e); const {params} = e; $.extend(params, { yerel: MQYerelParam.getInstance() /*rapor: MQParam_Rapor })*/ }) }
	getAnaMenu(e) {
		const {kod2Sinif} = Rapor, items_raporlar = [];
		for (const [mne, sinif] of Object.entries(kod2Sinif)) { if (sinif.altRapormu) { continue } items_raporlar.push(new FRMenuChoice({ mne, text: sinif.aciklama, block: e => sinif.goster() })) }
		/*const menu_test = (config.dev ? new FRMenuCascade({ mne: 'TEST', text: 'TEST', items: items_raporlar }) : null);*/
		return new FRMenu({ items: items_raporlar.filter(x => !!x) })
	}
}
