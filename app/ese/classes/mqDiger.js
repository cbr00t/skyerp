class MQSablonAnketYanit extends MQGuidVeAdiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'ANKETYANIT' } static get sinifAdi() { return 'Anket Yanıt' }
	static get table() { return 'eseanketyanit' } static get tableAlias() { return 'ynt' }
	static get maxSecenekSayisi() { return 5 }
	
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		let {maxSecenekSayisi} = this
		for (let i = 1; i <= maxSecenekSayisi; i++) {
			let key = `secenek${i}`
			pTanim[key] = new PInstStr(key)
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {maxSecenekSayisi} = this
		for (let i = 1; i <= maxSecenekSayisi; i++)
			liste.push(new GridKolon({ belirtec: `secenek${i}`, text: `Seçenek ${i}`, genislikCh: 200 }))
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e)
		this.formBuilder_addTabPanelWithGenelTab(e)
		let {tabPanel, tabPage_genel} = e
		let {maxSecenekSayisi} = this
		let form = tabPage_genel.addFormWithParent().altAlta()
		for (let i = 1; i <= maxSecenekSayisi; i++)
			form.addTextInput(`secenek${i}`, `Seçenek ${i}`).setMaxLength(50)
	}
}
