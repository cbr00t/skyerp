class SkyRaporApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'TEST' }
	paramsDuzenle(e) { super.paramsDuzenle(e); const {params} = e; $.extend(params, { yerel: MQYerelParam.getInstance() /*rapor: MQParam_Rapor })*/ }) }
	getAnaMenu(e) {
		const {dev} = config, items = [new FRMenuChoice({ mne: 'TEST', text: 'TEST', block: e => MQDonemselIslemler.listeEkraniAc(e) })].filter(x => !!x);
		return new FRMenu({ items })
	}
}
