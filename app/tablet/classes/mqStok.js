class MQTabStok extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'STOK' } static get sinifAdi() { return 'Stok' }
	static get table() { return 'stkmst' } static get tableAlias() { return 'stk' }
	static get tanimlanabilirmi() { return true } static get zeminRenkDesteklermi() { return true }
	static get gonderildiDesteklenirmi() { return true }
	static get satFiyatSayi() { return 9 }
	/*static get offlineSahaListe() {
		return super.offlineSahaListe.filter(_ =>
			!(_.endsWith('kdvorani') || _.startsWith('satfiyat')))
	}*/

	static getKdvOraniSaha(alimmi) { return `${alimmi ? 'alm' : 'sat'}kdvorani` }
	getKdvOrani(alimmi) { return this[`${alimmi ? 'alm' : 'sat'}kdvOrani`] }

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
		{
			let form = tabPage.addFormWithParent().yanYana(3)
			form.addCheckBox('aktifmi', 'Aktif')
			form.addCheckBox('satilamazmi', 'SatılaMAz')
				.addStyle(`$elementCSS > input:checked + label { color: firebrick !important }`)
			form.addCheckBox('tartilabilirmi', 'Tartılabilir')
		}
		{
			let form = tabPage.addFormWithParent().yanYana(5)
			form.addModelKullan('grupKod', 'Grup').comboBox().setMFSinif(MQTabStokGrup).autoBind()
			form.addModelKullan('markaKod', 'Marka').comboBox().setMFSinif(MQTabStokMarka).autoBind()
			form.addTextInput('brm', 'Brm')
			form.addTextInput('brm2', 'Brm 2')
			form.addNumberInput('brmOrani', 'Brm Oranı')
		}
		{
			let form = tabPage.addFormWithParent().yanYana(5)
			form.addTextInput('tartiReferans', 'Tartı Referans')
			form.addNumberInput('satKdvOrani', 'Satış KDV%')
			form.addNumberInput('almKdvOrani', 'Alım KDV%')
			form = tabPage.addFormWithParent().yanYana(4)
			form.addNumberInput('almFiyat', 'Alım Fiyat')
			for (let i = 1; i <= this.satFiyatSayi; i++)
				form.addNumberInput(`satFiyat${i}`, `Satış Fiyat ${i}`)
		}
	}
	static ekCSSDuzenle({ dataField: belirtec, value, rec: { silindi, satilamazfl } = {}, result }) {
		super.ekCSSDuzenle(...arguments)
		if (silindi)
			result.push('bg-lightgray', 'iptal')
		else if (satilamazfl)
			result.push('bg-lightred')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 5 }),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'grupkod', text: 'Grup', genislikCh: 15 }),
				new GridKolon({ belirtec: 'grupadi', text: 'Grup Adı', genislikCh: 25, sql: 'grp.aciklama' })
			),
			new GridKolon({ belirtec: 'satkdvorani', text: 'Sat.Kdv%', genislikCh: 8 }).tipNumerik()
			/*new GridKolon({ belirtec: 'calismadurumu', text: 'Aktif?', genislikCh: 10, filterType: 'checkedlist' }).tipBool(),
			new GridKolon({ belirtec: 'satilamazfl', text: 'SatılaMAz?', genislikCh: 10, filterType: 'checkedlist' }).tipBool()*/
		)
		for (let i = 1; i <= this.satFiyatSayi; i++)
			liste.push(new GridKolon({ belirtec: `satfiyat${i}`, text: `S.Fiyat${i}`, genislikCh: 11 }).tipDecimal_fiyat())
		liste.push(
			new GridKolon({ belirtec: 'almkdvorani', text: 'Alm.Kdv%', genislikCh: 8 }).tipNumerik(),
			new GridKolon({ belirtec: 'almfiyat', text: 'Alm.Fiyat', genislikCh: 11 }).tipDecimal_fiyat(),
			new GridKolon({ belirtec: 'smarkakod', text: 'Marka', genislikCh: 15 }),
			new GridKolon({ belirtec: 'smarkaadi', text: 'Marka Adı', genislikCh: 25, sql: 'smar.aciklama' }),
			new GridKolon({ belirtec: 'tartireferans', text: 'Tartı Ref.', genislikCh: 15 })
		)
	}
	static orjBaslikListesi_groupsDuzenle({ liste }) {
		super.orjBaslikListesi_groupsDuzenle(liste)
		liste.push('grupadi')
	}
	static gridVeriYuklendi({ sender: gridPart, sender: { gridWidget } }) {
		super.gridVeriYuklendi(...arguments)
		gridWidget.hidecolumn('grupadi')
	}
	static async loadServerDataDogrudan({ offlineMode, offlineRequest } = {}) {
		if (offlineRequest) {
			this._kdvOran2Kod ??= await MQVergiKdv.oran2KodSet()
			this._kdvKod2Oran ??= await MQVergiKdv.getKod2OranSet()
		}
		return await super.loadServerDataDogrudan(...arguments)
	}
	static loadServerData_queryDuzenle_son({ sent, sent: { where: wh, sahalar }, offlineRequest, offlineMode } = {}) {
		super.loadServerData_queryDuzenle_son(...arguments)
		sent.stok2GrupBagla().stok2MarkaBagla()
		if (offlineRequest) {
			let {tableAlias: alias, _online_sqlColDefs: cd, _kdvOran2Kod: oran2Kod} = this
			let {alias2Deger} = sent
			if (offlineMode) {
				// Bilgi Gönder
				let getKdvKodClauseVeAlias = (kodPrefix, almSatPrefix) => {
					let clause = `${alias}.${almSatPrefix}kdvorani`
					return (    // sqlite
						`(case when ${clause} = 0 then ''` +
						` else '${kodPrefix}' || ${clause}` + 
						` end) ${almSatPrefix}kdvhesapkod`
					)
				}
				sahalar.add(getKdvKodClauseVeAlias('TAH', 'sat'), getKdvKodClauseVeAlias('IND', 'alm'))
			}
			else {
				// Bilgi Yükle
				wh.add(
					`${alias}.silindi = ''`, `${alias}.calismadurumu <> ''`, `${alias}.satilamazfl = ''`,
					new MQOrClause([`stk.grupkod = ''`, `grp.elterkullan <> ''`])
				)
				let kdvHesap_sabitLen = 3
				let getKdvOranClauseVeAlias = (kodPrefix, almSatPrefix) => {
					let clause = `${alias}.${almSatPrefix}kdvhesapkod`
					return (    // mssql
						`(case when ${clause} LIKE '${kodPrefix}%' then` +
						` CAST(RTRIM(SUBSTRING(${clause}, ${kdvHesap_sabitLen + 1}, LEN(${clause}) - ${kdvHesap_sabitLen})) as int)` +
						` else 0 end) ${almSatPrefix}kdvorani`
					)
				}
				sahalar.add(getKdvOranClauseVeAlias('TAH', 'sat'), getKdvOranClauseVeAlias('IND', 'alm'))
				sahalar.addWithAlias(alias, 'kisaadi', 'brm2', 'brmorani', 'tartilabilir')
			}
		}
	}
	hostVarsDuzenle({ hv, offlineRequest, offlineMode }) {
		super.hostVarsDuzenle(...arguments)
//		if (offlineRequest)
//			debugger
	}
	setValues({ rec, offlineRequest, offlineMode }) {
		super.setValues(...arguments)
//		if (offlineRequest)
//			debugger
	}
}
