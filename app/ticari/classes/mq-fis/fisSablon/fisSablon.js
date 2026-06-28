class SatisFatura_OtoSablonFis extends SatisFaturaFis {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    static get kodListeTipi() { return 'TFS' }
    static get sinifAdi() { return `${super.sinifAdi} Şablonu` }
    static get sablonmu() { return true }
    static get pifTipi() { return '1' }
	static get numTipKod() { return 'OS' }
	static get tsnKullanilirmi() { return true }
	static get numaratorGosterilirmi() { return false }
	static get dipKullanilirmi() { return super.dipKullanilirmi }
	static get dipNakliyeKullanilirmi() { return super.dipNakliyeKullanilirmi }

    static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
        extend(pTanim, {
            sablonYapi: new PInstClass(FisSablonYapi)
        })
    }
    async yukleSonrasiIslemler({ sender, islem, trnId }) {
        await super.yukleSonrasiIslemler(...arguments)
		let { sayac, sablonYapi: sy } = this
		if (sayac) {
			extend(sy, { sayac })
			await sy.yukle({ sender, islem, trnId })
		}
    }
	async yeniSonrasiIslemler(e) {
		await super.yeniSonrasiIslemler(e)
		let { sablonYapi: sy, sayac } = this
		extend(sy, { sayac })
		await sy.yaz(e)
	}
	async degistirSonrasiIslemler(eskiFis) {
		await super.degistirSonrasiIslemler(...arguments)
		let { sablonYapi: sy } = this
		let { sablonYapi: eskiSY } = eskiFis
		await sy.degistir(eskiSY)
	}
	async silmeSonrasiIslemler(e) {
		await super.silmeSonrasiIslemler(e)
		let { sablonYapi: sy } = this
		await sy.sil(e)
	}
    /*async topluYazmaKomutlariniOlusturSonrasi(e) {
        await super.topluYazmaKomutlariniOlusturSonrasi(e)
    }
    async topluDegistirmeKomutlariniOlusturSonrasi(e) {
        await super.topluDegistirmeKomutlariniOlusturSonrasi(e)
    }*/
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e)
		/*let { hv } = e
		let { sablonYapi: sy } = this
		extend(hv, sy.hostVars(e))*/
	}
	setValues(e) {
		super.setValues(e)
		/*let { rec } = e
		let { sablonYapi: sy } = this
		sy.setValues(e)*/
	}
    async fisBakiyeDurumuGerekirseAyarla(e) {
        // bakiye düzenleme yapılmaz
    }

    static rootFormBuilderDuzenle({ inst, builders: all }) {
		let { sablonYapi: sy = {} } = inst
		let { builders: b } = all.baslikForm

		let getAltInst = sy
		let thinStyle = [
			`$elementCSS { margin: 15px 0 !important }
			 $elementCSS label, $elementCSS span, $elementCSS b,
				 $elementCSS .etiket { width: auto !important; min-width: unset !important; margin-right: 20px !important }
			 $elementCSS input:not([type = checkbox]) { height: 40px !important; margin-top: -10px !important }`
		]
		
		b[0].yanYana()
		b[1].yanYana()
		
		;{
			b[0].addTextInput('sablonAdi', 'Şablon Adı')
				.setAltInst(getAltInst)
				.etiketGosterim_yok().addStyle_wh(400)
			b[0].addNumberInput('sablonOncelik', 'Öncelik')
				.setAltInst(getAltInst)
				.etiketGosterim_yok().addStyle_wh(100)
		}

		;{
			let { numarator: num } = sy
			let { tip, class: numSinif } = num
			b[0].addSimpleComboBox('_numarator', 'Numarator')
				.setAltInst(getAltInst)
				.etiketGosterim_yok().kodsuz()
				.setMFSinif(numSinif)
				.setValue(num)
				.setSource(async ({ sender: { builder: fbd = {} }  }) => {
					let stmDuzenle = ({ alias, sent: { where: wh, sahalar } }) => {
						let { tip, class: { sayacSaha } } = num
						if (tip)
							wh.degerAta(tip, `${alias}.tip`)
						sahalar.add(`${alias}.${sayacSaha}`)
					}
					return await numSinif.loadServerData({ stmDuzenle })
				})
				.degisince(async ({ sender: { builder: fbd = {} }, type, events: [ evt = {} ] = [] }) => {
					if (type != 'batch')
						return
					
					let { altInst: sy } = fbd
					if (!sy)
						return

					let { item: rec } = evt
					let num = new numSinif({ tip })
					await num.yukle({ rec })
					sy.numarator = num
				})
				.addStyle_wh(400)
		}
		
		;{
			let form = b[1].addFormWithParent().yanYana()
				.setAltInst(getAltInst)
				.addStyle(thinStyle)
			form.addForm().setLayout(() => $(`<b class="etiket">Fiş Tarih:</b>`))
			form.addCheckBox('aySonumu', 'Ay Sonu')
				.setAltInst(getAltInst)
				.etiketGosterim_yok()
			form.addForm().setLayout(() => $(`<span> ayın </span>`))
			form.addNumberInput('ayGunu', ' ')
				.setAltInst(getAltInst)
				.etiketGosterim_yok().addStyle_wh(50)
			form.addForm().setLayout(() => $(`<span>. günü</span>`))
		}
		;{
			let form = b[1].addFormWithParent().yanYana()
				.setAltInst(getAltInst)
				.addStyle(thinStyle)
			form.addForm().setLayout(() => $(`<b class="etiket">Dönem:</b>`))
			form.addDateInput('tarihBasi', 'Başı').etiketGosterim_yok()
			form.addDateInput('tarihSonu', 'Sonu').etiketGosterim_yok()
		}
		
		super.rootFormBuilderDuzenle(...arguments)
	}
}
