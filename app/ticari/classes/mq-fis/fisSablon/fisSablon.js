class SatisFaturaFis_OtoSablon extends SatisFaturaFis {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    static get kodListeTipi() { return 'TFS' }
    static get sinifAdi() { return `${super.sinifAdi} Şablonu` }
    static get sablonmu() { return true }
    static get pifTipi() { return '1' }
	static get numTipKod() { return 'OS' }
	static get tsnKullanilirmi() { return true }
	static get numaratorGosterilirmi() { return false }
	static get noYilKullanilirmi() { return false }
	static get dipKullanilirmi() { return super.dipKullanilirmi }
	static get dipNakliyeKullanilirmi() { return super.dipNakliyeKullanilirmi }

    static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
        extend(pTanim, {
            sablonYapi: new PInstClass(FisSablonYapi)
        })
    }
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		let { tarih } = sec.liste
		tarih.basi = tarih.sonu = null
	}
	static standartGorunumListesiDuzenle({ liste }) {
		liste.push('sablonAdi')
		super.standartGorunumListesiDuzenle(...arguments)
		liste.push('ayGunu', 'aySonumu')
			
		;{
			let i = liste.findIndex(k => k == 'cariaciklama') ?? -1
			if (i > -1) {
				let k = liste.splice(i, 1)[0]
				liste.push(k)
			}
		}
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e)
		let { liste } = e
		let { tarihSaha, seriSaha, noSaha } = this
		let removeKeys = asSet([ tarihSaha, seriSaha, 'noyil', noSaha ])
		liste = liste.filter(cd => !removeKeys[cd.belirtec])
		e.liste = liste
	}
	static orjBaslikListesiDuzenle_ilk({ liste }) {
		super.orjBaslikListesiDuzenle_ilk(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'sablonAdi', text: 'Şablon Adı', genislikCh: 40, sql: 'sab.sablonadi' })
		)
	}
	static orjBaslikListesiDuzenle_ara({ liste }) {
		super.orjBaslikListesiDuzenle_ara(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'ayGunu', text: 'Ay Günü', genislikCh: 8, sql: 'sab.aygunu' }).tipNumerik().checkedList(),
			new GridKolon({ belirtec: 'aySonumu', text: 'Ay Sonu?', genislikCh: 8, sql: 'sab.baysonumu' }).tipBool().checkedList()
		)
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments)
		let { tableAlias: alias } = this
		sent.leftJoin(alias, 'pifsablon sab', `${alias}.kaysayac = sab.fissayac`)
	}
	static async loadServerData_recsDuzenle({ recs }) {
		return await super.loadServerData_recsDuzenle(...arguments)
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
	async degistirSonrasiIslemler({ eskiFis }) {
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
	hostVarsDuzenle({ hv }) {
		let { aySonumu } = this
		super.hostVarsDuzenle(...arguments)
		delete hv.otosablonsayac
		if (aySonumu)
			hv.aygunu = 0
	}
	setValues({ rec }) {
		super.setValues(...arguments)
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
				.degisince(({ builder: { altInst: inst, parentBuilder: parent } }) => {
					for (let fbd of parent)
						fbd.updateVisible()
				})
				.etiketGosterim_yok()

			let checkVisible = ({ builder: fbd }) =>
				fbd.altInst.aySonumu ? 'basic-hidden' : true
			form.addForm()
				.setLayout(() => $(`<span> ayın </span>`))
				.setVisibleKosulu(checkVisible)
			form.addNumberInput('ayGunu', ' ')
				.setAltInst(getAltInst)
				.setVisibleKosulu(checkVisible)
				.etiketGosterim_yok()
				.addStyle_wh(50)
			form.addForm()
				.setLayout(() => $(`<span>. günü</span>`))
				.setVisibleKosulu(checkVisible)
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

	static faturaOlusturIslemi(e = {}) {
		let sec = new SabFatOlusturucu()
		let _e = { ...e, sender: null }
		return sec.duzenlemeEkraniAc(_e)
	}
}
