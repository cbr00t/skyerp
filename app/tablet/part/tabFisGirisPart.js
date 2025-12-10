class TabFisGirisPart extends ModelTanimPart {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'tabFisGiris' }
	async rootFormBuilderDuzenle(e) {
		await super.rootFormBuilderDuzenle(e)
		let {layout, mfSinif, inst} = this
		$.extend(e, { mfSinif, inst })
		let {rootBuilder: rfb, tanimFormBuilder: tanimForm} = e
		this.tanimFormBuiler = tanimForm
		// tanimForm.addForm().setLayout(() => $(`<p><h3>hello world from part</h3></p>`))
		await mfSinif.rootFormBuilderDuzenle_tablet?.(e)
		let fbd_acc = e.fbd_acc = this.fbd_acc =
			tanimForm.addAccordion('acc')
				.addStyle_fullWH()
				.onAfterRun(({ builder: { part } }) => this.acc = part)
	}
	async rootFormBuilderDuzenle_islemTuslari({ fbd_islemTuslari: rfb }) {
		await super.rootFormBuilderDuzenle_islemTuslari(...arguments)
		rfb.addStyle(`
			$elementCSS,
				$elementCSS > div,
				$elementCSS > div > div { background: unset !important; background-color: transparent !important }
			$elementCSS { position: fixed !important; top: 1px; right: 80px; pointer-events: none !important }
			$elementCSS > div > .sag { width: 100px !important }
			$elementCSS button { width: 45px !important; height: 40px !important; pointer-events: auto !important; z-index: 1300 !important }
			$elementCSS button#vazgec { margin-left: 20px }
			$elementCSS + .bulForm.part,
				body > .app-titlebar { display: none !important }
		`)
	}
	async afterRun(e) {
		await super.afterRun(e)
		let sender = this, {mfSinif, inst, builder: rootBuilder, tanimFormBuiler, acc} = this
		$.extend(e, { sender, mfSinif, inst, acc, rootBuilder, tanimFormBuiler })
		acc.deferRedraw(async () =>
			await mfSinif.rootFormBuilderDuzenle_tablet_acc?.(e))
	}
}
