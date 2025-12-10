class TabFisTemplate extends MQCogul {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return TabFisGirisPart }
	static get secimSinif() { return null }
	static get tumKolonlarGosterilirmi() { return true }
	static get kolonFiltreKullanilirmi() { return false }
	static get gridIslemTuslariKullanilirmi() { return false }
	// static get noAutoFocus() { return true }

	static pTanimDuzenle({ pTanim }) {
		$.extend(pTanim, { mustKod: new PInstStr('must') })
	}
	static getRootFormBuilder(e) { return MQCogul.getRootFormBuilder(e) }
	static getRootFormBuilder_fis(e) { return null }
	static async rootFormBuilderDuzenle_tablet(e) { }
	static async rootFormBuilderDuzenle_tablet_acc(e) {
		let {sender: tanimPart, inst, acc} = e
		let getBuilder = layout =>
			new RootFormBuilder()
				.setLayout(layout).setPart(tanimPart).setInst(inst)
				.addStyle_fullWH()
		let args = { ...e, getBuilder }
		acc.add({
			id: 'baslik', title: 'Başlık', expanded: true,
			content: ({ item, layout }) => {
				let rfb = getBuilder(layout)
				{
					let form = rfb.addFormWithParent().yanYana()
					form.addDateInput('tarih', 'Tarih')
					form.addTextInput('seri', 'Seri')
						.addStyle(`$elementCSS { max-width: 130px }`)
					form.addNumberInput('fisNo', 'No')
						.addStyle(`$elementCSS { max-width: 200px }`)
				}
				this.rootFormBuilderDuzenle_tablet_acc_baslik({ ...args, rfb, item, layout })
				{
					let form = rfb.addFormWithParent().yanYana()
					rfb.addTextInput('fisAciklama', 'Açıklama')
						.addStyle(`$elementCSS { max-width: 800px }`)
				}
				rfb.run()
			}
		})
		acc.add('dip', 'Dip', true)
	}
	static rootFormBuilderDuzenle_tablet_acc_baslik({ rfb }) {
		{
			let form = rfb.addFormWithParent().altAlta()
			// addSimpleComboBox(e, _etiket, _placeholder, _value, _source, _autoClear, _delay, _minLength, _disabled, _name, _userData)
			form.addSimpleComboBox('mustKod', MQTabCari.sinifAdi)
				.addStyle(`$elementCSS { max-width: 800px }`)
				.kodsuz().setMFSinif(MQTabCari)
				.onAfterRun(({ builder: { part } }) =>
					setTimeout(() => part.focus(), 1))
			/*form.addModelKullan('mustKod', MQTabCari.sinifAdi)
				.addStyle(`$elementCSS { max-width: 800px }`)
				.comboBox().autoBind()
				.setMFSinif(MQTabCari)
				.onAfterRun(({ builder: { part } }) =>
					setTimeout(() => part.focus(), 1))*/
		}
	}
	test() { }
}
