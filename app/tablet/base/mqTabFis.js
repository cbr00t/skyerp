class MQTabFis extends MQGenelFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return TabFisGirisPart } static get secimSinif() { return null }
	static get detaySinif() { return MQTabFisDetay }
	static get tumKolonlarGosterilirmi() { return true } static get kolonFiltreKullanilirmi() { return false }
	static get gridIslemTuslariKullanilirmi() { return false }
	// static get noAutoFocus() { return true }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
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
				//.addStyle_fullWH()
		let args = { ...e, getBuilder }
		acc.add({
			id: 'baslik', title: 'Başlık', expanded: true,
			collapsedContent: async ({ item, layout }) => {
				let rfb = getBuilder(layout)
				await this.rootFormBuilderDuzenle_tablet_acc_baslikCollapsed({ ...args, rfb, item, layout })
				rfb.run()
			},
			content: async ({ item, layout }) => {
				let rfb = getBuilder(layout)
				rfb.addStyle_fullWH(null, 170)
				{
					let form = rfb.addFormWithParent().yanYana()
					form.addDateInput('tarih', 'Tarih').etiketGosterim_yok()
					form.addTextInput('seri', 'Seri').etiketGosterim_yok()
						.addStyle(`$elementCSS { max-width: 130px }`)
					form.addNumberInput('fisNo', 'No').etiketGosterim_yok()
						.addStyle(`$elementCSS { max-width: 200px }`)
				}
				await this.rootFormBuilderDuzenle_tablet_acc_baslik({ ...args, rfb, item, layout })
				{
					let form = rfb.addFormWithParent().yanYana()
					rfb.addTextInput('fisAciklama', 'Açıklama').etiketGosterim_yok()
						.addStyle(`$elementCSS { max-width: 800px }`)
				}
				setTimeout(() => rfb.run(), 100)
			}
		})
		acc.add({
			id: 'dip', title: 'Dip',
			collapsedContent: async ({ item, layout }) => {
				let rfb = getBuilder(layout)
				await this.rootFormBuilderDuzenle_tablet_acc_dipCollapsed({ ...args, rfb, item, layout })
				rfb.run()
			},
			content: async ({ item, layout }) => {
				let rfb = getBuilder(layout)
				await this.rootFormBuilderDuzenle_tablet_acc_dip({ ...args, rfb, item, layout })
				setTimeout(() => rfb.run(), 100)
			}
		})
		acc.add({
			id: 'detay', title: 'Detay',
			collapsedContent: async ({ item, layout }) => {
				let rfb = getBuilder(layout)
				await this.rootFormBuilderDuzenle_tablet_acc_detayCollapsed({ ...args, rfb, item, layout })
				rfb.run()
			},
			content: async ({ item, layout }) => {
				let rfb = getBuilder(layout)
				await this.rootFormBuilderDuzenle_tablet_acc_detay({ ...args, rfb, item, layout })
				setTimeout(() => rfb.run(), 100)
			}
		})
	}
	static rootFormBuilderDuzenle_tablet_acc_baslik({ rfb }) {
		{
			let form = rfb.addFormWithParent().altAlta()
			// addSimpleComboBox(e, _etiket, _placeholder, _value, _source, _autoClear, _delay, _minLength, _disabled, _name, _userData)
			form.addSimpleComboBox('mustKod', MQTabCari.sinifAdi)
				.etiketGosterim_yok()
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
	static rootFormBuilderDuzenle_tablet_acc_baslikCollapsed({ rfb }) { }
	static rootFormBuilderDuzenle_tablet_acc_dip({ rfb }) { }
	static rootFormBuilderDuzenle_tablet_acc_dipCollapsed({ rfb }) { }
	static rootFormBuilderDuzenle_tablet_acc_detay({ rfb }) { }
	static rootFormBuilderDuzenle_tablet_acc_detayCollapsed({ rfb }) { }
}

class MQTabFisDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
	}
}
