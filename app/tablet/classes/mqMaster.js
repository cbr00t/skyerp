class MQTabStok extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'STOK' } static get sinifAdi() { return 'Stok' }
	static get table() { return 'stkmst' } static get tableAlias() { return 'stk' }
	static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return true } static get zeminRenkDesteklermi() { return true }
	static get satFiyatSayi() { return 9 }
	/*static get offlineSahaListe() {
		return super.offlineSahaListe.filter(_ =>
			!(_.endsWith('kdvorani') || _.startsWith('satfiyat')))
	}*/

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			aktifmi: new PInstTrue('calismadurumu'), satilamazmi: new PInstBool('satilamazfl'),
			brm: new PInstStr('brm'), brm2: new PInstStr('brm2'), brmOrani: new PInstNum('brmorani'),
			kisaAdi: new PInstStr('kisaadi'), grupKod: new PInstStr('grupkod'), markaKod: new PInstStr('smarkakod'),
			satKdvOrani: new PInstNum('satkdvorani'), almKdvOrani: new PInstNum('almkdvorani'),
			tartilabilirmi: new PInstBool('tartilabilir'), tartiReferans: new PInstStr('tartireferans'),
			almFiyat: new PInstNum('almfiyat')
		})
		for (let i = 1; i <= this.satFiyatSayi; i++)
			pTanim[`satFiyat${i}`] = new PInstNum(`satfiyat${i}`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e)
		let {rootBuilder: rfb, tabPage_genel: tabPage} = e
		let form = tabPage.addFormWithParent().yanYana(3)
		form.addCheckBox('aktifmi', 'Aktif')
		form.addCheckBox('satilamazmi', 'SatılaMAz')
			.addStyle(`$elementCSS > input:checked + label { color: firebrick !important }`)
		form.addCheckBox('tartilabilirmi', 'Tartılabilir')
		form = tabPage.addFormWithParent().yanYana(5)
		form.addModelKullan('grupKod', 'Grup').comboBox().setMFSinif(MQTabStokGrup)
		form.addModelKullan('markaKod', 'Marka').comboBox().setMFSinif(MQTabStokMarka)
		form.addTextInput('brm', 'Brm')
		form.addTextInput('brm2', 'Brm 2')
		form.addNumberInput('brmOrani', 'Brm Oranı')
		form = tabPage.addFormWithParent().yanYana(5)
		form.addTextInput('tartiReferans', 'Tartı Referans')
		form.addNumberInput('satKdvOrani', 'Satış KDV%')
		form.addNumberInput('almKdvOrani', 'Alım KDV%')
		form = tabPage.addFormWithParent().yanYana(4)
		form.addNumberInput('almFiyat', 'Alım Fiyat')
		for (let i = 1; i <= this.satFiyatSayi; i++)
			form.addNumberInput(`satFiyat${i}`, `Satış Fiyat ${i}`)
	}
	static ekCSSDuzenle({ dataField: belirtec, value, rec: { calismadurumu, satilamazfl } = {}, result }) {
		super.ekCSSDuzenle(...arguments)
		if (calismadurumu)
			result.push('bg-lightgray', 'iptal')
		else if (satilamazfl)
			result.push('bg-lightred')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'kisaadi', text: 'Kısa Adı', genislikCh: 10 }),
			new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 5 }),
			new GridKolon({ belirtec: 'brm2', text: 'Br2', genislikCh: 5 }),
			new GridKolon({ belirtec: 'brmorani', text: 'Br.Or.', genislikCh: 8 }).tipNumerik(),
			new GridKolon({ belirtec: 'grupkod', text: 'Grup', genislikCh: 15 }),
			new GridKolon({ belirtec: 'grupadi', text: 'Grup Adı', genislikCh: 25, sql: 'grp.aciklama' }),
			new GridKolon({ belirtec: 'satkdvorani', text: 'Sat.Kdv', genislikCh: 8 }).tipNumerik(),
			new GridKolon({ belirtec: 'almkdvorani', text: 'Alm.Kdv', genislikCh: 8 }).tipNumerik(),
			new GridKolon({ belirtec: 'smarkakod', text: 'Marka', genislikCh: 15 }),
			new GridKolon({ belirtec: 'smarkaadi', text: 'Marka Adı', genislikCh: 25, sql: 'smar.aciklama' }),
			new GridKolon({ belirtec: 'tartilabilir', text: 'Tartılabilir?', genislikCh: 10 }).tipBool(),
			new GridKolon({ belirtec: 'tartireferans', text: 'Tartı Ref.', genislikCh: 15 }),
			new GridKolon({ belirtec: 'calismadurumu', text: 'Aktif?', genislikCh: 10 }).tipBool(),
			new GridKolon({ belirtec: 'satilamazfl', text: 'SatılaMAz?', genislikCh: 10 }).tipBool()
		)
		for (let i = 1; i <= this.satFiyatSayi; i++)
			liste.push(new GridKolon({ belirtec: `satfiyat${i}`, text: `S.Fiyat${i}`, genislikCh: 8 }).tipDecimal_fiyat())
		liste.push(new GridKolon({ belirtec: 'almfiyat', text: 'A.Fiyat', genislikCh: 8 }).tipDecimal_fiyat())
	}
	static async loadServerDataDogrudan({ offlineMode, offlineRequest }) {
		if (offlineRequest) {
			this._sqlColDefs ??= await app.sqlGetColumns(this.table)
			if (!offlineMode) {
				this._kdvOran2Kod ??= await MQVergiKdv.oran2KodSet()
				this._kdvKod2Oran ??= await MQVergiKdv.getKod2OranSet()
			}
		}
		return await super.loadServerDataDogrudan(...arguments)
	}
	static loadServerData_queryDuzenle({ sent, offlineRequest, offlineMode }) {
		super.loadServerData_queryDuzenle(...arguments)
		sent.stok2GrupBagla().stok2MarkaBagla()
		if (offlineRequest) {
			let {tableAlias: alias, _sqlColDefs: cd, _kdvOran2Kod: oran2Kod} = this
			let {alias2Deger, where: wh, sahalar} = sent
			for (let key of keys(alias2Deger)) {
				if (!cd[key])
					delete alias2Deger[key]
			}
			if (sahalar.liste.length != keys(alias2Deger).length) {
				sahalar.liste = []
				for (let [alias, deger] of entries(alias2Deger))
					sahalar.add(new MQAliasliYapi({ alias, deger }))
			}
			if (!offlineMode) {
				wh.add(
					`${alias}.silindi <> ''`, `${alias}.calismadurumu <> ''`,
					new MQOrClause([
						`stk.grupkod = ''`,
						`grp.elterkullan <> ''`
					])
				)
			}
		}
	}
	hostVarsDuzenle({ hv, offlineRequest, offlineMode }) {
		super.hostVarsDuzenle(...arguments)
		if (offlineRequest)
			debugger
	}
	setValues({ rec, offlineRequest, offlineMode }) {
		super.setValues(...arguments)
		if (offlineRequest)
			debugger
	}
	static getKdvOraniSaha(alimmi) { return `${alimmi ? 'alm' : 'sat'}kdvorani` }
	getKdvOrani(alimmi) { return this[`${alimmi ? 'alm' : 'sat'}kdvOrani`] }
}

class MQTabStokAnaGrup extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'STOKANAGRUP' } static get sinifAdi() { return 'Stok Ana Grup' }
	static get table() { return 'stokmarka' } static get tableAlias() { return 'agrp' }
	static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return true }
}

class MQTabStokGrup extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'STOKGRUP' } static get sinifAdi() { return 'Stok Grup' }
	static get table() { return 'stkgrup' } static get tableAlias() { return 'grp' }
	static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return true }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, { anaGrupKod: new PInstStr('anagrupkod') })
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e)
		let {rootBuilder: rfb, tabPage_genel: tabPage} = e
		let form = tabPage.addFormWithParent().yanYana(5)
		form.addModelKullan('anaGrupKod', 'Ana Grup').comboBox().setMFSinif(MQTabStokAnaGrup)
	}
	static ekCSSDuzenle({ dataField: belirtec, value, rec: { status } = {}, result }) {
		super.ekCSSDuzenle(...arguments)
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 13 }),
			new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 20, sql: 'agrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments)
		sent.stokGrup2AnaGrupBagla()
	}
}
class MQTabStokMarka extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'STOKMARKA' } static get sinifAdi() { return 'Stok Marka' }
	static get table() { return 'stokmarka' } static get tableAlias() { return 'smar' }
	static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return true }
}
