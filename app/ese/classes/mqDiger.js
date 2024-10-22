class MQSablonAnketYanit extends MQGuidVeAdiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Anket Yanıt' } static get maxSecenekSayisi() { return 5 }
	static get kodListeTipi() { return 'ANKETYANIT' } static get table() { return 'eseanketyanit' } static get tableAlias() { return 'ynt' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e, {maxSecenekSayisi} = this;
		for (let i = 1; i <= maxSecenekSayisi; i++) { const key = `secenek${i}`; pTanim[key] = new PInstStr(key) }
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e, {maxSecenekSayisi} = this;
		for (let i = 1; i <= maxSecenekSayisi; i++) { liste.push(new GridKolon({ belirtec: `secenek${i}`, text: `Seçenek ${i}`, genislikCh: 200 })) }
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPanel, tabPage_genel} = e, {maxSecenekSayisi} = this;
		let form = tabPage_genel.addFormWithParent().altAlta();
		for (let i = 1; i <= maxSecenekSayisi; i++) { form.addTextInput(`secenek${i}`, `Seçenek ${i}`).setMaxLength(50) }
	}
}
