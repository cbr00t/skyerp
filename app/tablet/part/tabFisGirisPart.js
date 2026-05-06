class TabFisGirisPart extends ModelTanimPart {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'tabFisGiris' } get titlePostfix() { return '' }

	async rootFormBuilderDuzenle(e) {
		await super.rootFormBuilderDuzenle(e)
		let { layout, mfSinif, inst } = this
		extend(e, { mfSinif, inst })
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
		let e = arguments[0]
		await super.rootFormBuilderDuzenle_islemTuslari(e)
		rfb.addStyle(`
			$elementCSS,
				$elementCSS > div,
				$elementCSS > div > div { background: unset !important; background-color: transparent !important }
			$elementCSS { position: fixed !important; top: 1px; right: 5px; pointer-events: none !important }
			$elementCSS > div > .sag { width: 100px !important }
			$elementCSS button { width: 40px !important; height: 40px !important; pointer-events: auto !important }
			$elementCSS button#vazgec { margin-left: 10px }
			$elementCSS + .bulForm.part,
				body > .app-titlebar,
				body > #root-parent > #nav-toggle,
				body #windows .tabs > .tabPage.nav-item:not(.selected)
					{ display: none !important }
			$elementCSS > div > * { position: relative !important }
			$elementCSS, $elementCSS > div, $elementCSS > div > * { z-index: 3000 !important }
			/*$elementCSS { width: var(--full) !important }
				$elementCSS > .sag { position: fixed !important; right: 10px !important }*/
			$elementCSS > div #tamam { margin-left: 5px }
			$elementCSS > div #menu { margin-right: 5px }
		`)
		let {mfSinif} = this
		await mfSinif?.rootFormBuilderDuzenle_tablet_islemTuslari?.(e)
	}
	async afterRun(e) {
		await super.afterRun(e)
		let sender = this, {mfSinif, inst, builder: rootBuilder, tanimFormBuiler, acc} = this
		extend(e, { sender, mfSinif, inst, acc, rootBuilder, tanimFormBuiler })
		acc?.deferRedraw(async () =>
			await mfSinif.rootFormBuilderDuzenle_tablet_acc?.(e))
	}
	async vazgecIstendi(e) {
		let res = await ehConfirm(
			`<p class="bold firebrick">Belge Giriş ekranını kapatmak üzeresiniz</p><br/><p style="margin-left: 20px">Devam edilsin mi?</p>`,
			'Belge Giriş Ekranı'
		)
		if (!res)
			return false
		return await super.vazgecIstendi(e)
	}
}
