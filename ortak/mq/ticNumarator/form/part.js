class TicNumaratorPart extends NumaratorPart {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'ticNumarator' }

	runDevam(e) {
		super.runDevam(e)
		let { layout, fis, numarator } = this
		let seriNoForm = layout.find('.seriVeNo')
		let txtNoYil = this.txtNoYil = seriNoForm.find('#noYil')
		if (fis.class.noYilKullanilirmi) {
			txtNoYil.on('keyup', ({ currentTarget: target }) =>
				target.value = asInteger(target.value) || null)
			txtNoYil.on('contextmenu', ({ currentTarget: target }) => {
				let value = fis.noYil = app.params.zorunlu.cariYil || today().getYear()
				target.value = value
			})
			txtNoYil.on('change', ({ currentTarget: target }) =>
				fis.noYil = asInteger(target.value) || null)
			txtNoYil.removeClass('jqx-hidden basic-hidden')

			/*;{
				new RootFormBuilder().addSelect('belgeTipi', 'Belge Tipi')
					.setParent(layout)
					.setInst(this)
					.setSource(EIslemOrtak.kaListe)
					.setValue(belgeTipi?.char)
					.degisince(({ value }) =>
						this.belgeTipi.char = value)
					.run()
			}*/
		}
		else
			txtNoYil.addClass('jqx-hidden')
	}
	numaratorListe_ozelKolonDuzenle(e) { }
	numaratorListe_queryDuzenle(e) {		
		let {numarator} = this, {tip} = numarator;
		if (tip != null) { let {alias, sent} = e; sent.where.degerAta(tip, `${alias}.tip`) }
	}
}
