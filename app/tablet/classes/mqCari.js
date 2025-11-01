class MQTabCari extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'CARI' } static get sinifAdi() { return 'Cari' }
	static get table() { return 'carmst' } static get tableAlias() { return 'car' }
	static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return true } static get zeminRenkDesteklermi() { return true }
	static get onlineIdSaha() { return 'must' } static get adiEtiket() { return 'Ünvan' }
	get vkn() { return this.sahismi ? this.tcKimlikNo : this.vergiNo }
	set vkn(value) { this[this.sahismi ? 'tcKimlikNo' : 'vergiNo'] = value }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			aktifmi: new PInstTrue('calismadurumu'), satilamazmi: new PInstBool('satilamazfl'), konTipKod: new PInstStr('kontipkod'),
			efatmi: new PInstBool('efaturakullanirmi'), yore: new PInstStr('yore'), posta: new PInstStr('posta'), 
			bolgeKod: new PInstStr('bolgekod'), ilKod: new PInstStr('ilkod'), 
			ulkeKod: new PInstStr('ulkekod'), sahismi: new PInstBool('sahismi'), 
			vergiDaire: new PInstStr('vdaire'), vergiNo: new PInstStr('vnumara'), tcKimlikNo: new PInstStr('tckimlikno'),
			email: new PInstStr('email'), tel1: new PInstStr('tel1'),
			tel2: new PInstStr('tel2'), tel3: new PInstStr('tel3'),
			adres: new PInstStr('adres'), gpsLat: new PInstNum('gpsenlem'), gpsLong: new PInstNum('gpsboylam'),
			konTipKod: new PInstTekSecim('kontipkod', TabKonsolideTip),
			riskCariKod: new PInstStr('ekstremustkod'), plasiyerKod: new PInstStr('tavsiyeplasiyerkod'),
			odemeGunKodu: new PInstStr('odemegunkodu'), stdDipIskOran: new PInstNum('standartiskonto')
			/* orjBakiye: new PInstNum('orjbakiye'), bakiye: new PInstNum('bakiye'),
				riskLimit: new PInstNum('risklimit'), kalanRisk: new PInstNum('kalanrisk'),
				orjTakipBorc: new PInstNum('orjtakipborclimiti'), takipBorc: new PInstNum('takipborclimiti')
			*/
		})
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e)
		let {rootBuilder: rfb, tabPage_genel: tabPage} = e
		{
			let form = tabPage.addFormWithParent().yanYana(5)
			form.addCheckBox('efatmi', 'e-Fat?')
			form.addTextInput('yore', 'Yöre')
		}
		{
			let form = tabPage.addFormWithParent().yanYana(5)
			form.addModelKullan('bolgeKod', 'Bölge').comboBox().setMFSinif(MQTabBolge).autoBind()
			form.addModelKullan('ilKod', 'İl').comboBox().setMFSinif(MQTabIl).autoBind()
			form.addModelKullan('ulkeKod', 'Ülke').comboBox().setMFSinif(MQTabUlke).autoBind()
		}
		{
			let form = tabPage.addFormWithParent().yanYana(5)
			form.addTextInput('tel1', 'Tel 1')
			form.addTextInput('tel2', 'Tel 2')
			form.addTextInput('tel3', 'Tel 3')
		}
		{
			let form = tabPage.addFormWithParent().yanYana(5)
			form.addCheckBox('sahismi', 'Şahıs?')
				.degisince(({ builder: { parentBuilder: { builders } } }) =>
					builders.forEach(fbd => fbd.updateVisible()))
			form.addTextInput('vergiDaire', 'Vergi Dairesi')
			form.addTextInput('vergiNo', 'Vergi No')
			form.addTextInput('tcKimlikNo', 'TC Kimlik No')
				.setVisibleKosulu(({ builder: { altInst: { sahismi } }}) => sahismi)
		}
		{
			let form = tabPage.addBaslik('gps', 'Konum').yanYana(5)
			form.addNumberInput('gpsLat', 'GPS Enlem').addCSS('center')
			form.addNumberInput('gpsLong', 'GPS Boylam').addCSS('center')
		}
		{
			let form = tabPage.addFormWithParent().altAlta()
			form.addTextArea('adres', 'Adres').setRows(2)
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
		super.orjBaslikListesiDuzenle(...arguments); let {tableAlias: alias} = this
		liste.push(
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 20 }),
			new GridKolon({ belirtec: 'bolgekod', text: 'Bölge Kod', genislikCh: 10 }),
			new GridKolon({ belirtec: 'bolgeadi', text: 'Bölge Adı', genislikCh: 25, sql: 'bol.aciklama' }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl Kod', genislikCh: 8 }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 25, sql: 'il.aciklama' }),
			new GridKolon({ belirtec: 'ulkekod', text: 'Ülke Kod', genislikCh: 8 }),
			new GridKolon({ belirtec: 'ulkeadi', text: 'Ülke Adı', genislikCh: 25, sql: 'ulk.aciklama' }),
			new GridKolon({ belirtec: 'posta', text: 'Posta', genislikCh: 8 }),
			new GridKolon({ belirtec: 'efaturakullanirmi', text: 'e-Fat?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'sahismi', text: 'Şahıs?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'vdaire', text: 'Vergi Dairesi', genislikCh: 25 }),
			new GridKolon({ belirtec: 'vnumara', text: 'Vergi No', genislikCh: 13 }),
			new GridKolon({ belirtec: 'tckimlikno', text: 'TC Kimlik No', genislikCh: 13 }),
			new GridKolon({ belirtec: 'email', text: 'E-posta', genislikCh: 45 }),
			new GridKolon({ belirtec: 'tel1', text: 'Tel 1', genislikCh: 15 }),
			new GridKolon({ belirtec: 'tel2', text: 'Tel 2', genislikCh: 15 }),
			new GridKolon({ belirtec: 'tel3', text: 'Tel 3', genislikCh: 15 }),
			new GridKolon({ belirtec: 'gpsenlem', text: 'GPS Enlem', genislikCh: 13 }).tipNumerik(),
			new GridKolon({ belirtec: 'gpsboylam', text: 'GPS Boylam', genislikCh: 13 }).tipNumerik(),
			new GridKolon({ belirtec: 'calismadurumu', text: 'Aktif?', genislikCh: 8, filterType: 'checkedlist' }).tipBool(),
			new GridKolon({ belirtec: 'satilamazfl', text: 'SatılaMAz?', genislikCh: 10, filterType: 'checkedlist' }).tipBool(),
			new GridKolon({ belirtec: 'adres', text: 'Adres', genislikCh: 80 }),
			new GridKolon({ belirtec: 'kontiptext', text: 'K.Tip', genislikCh: 13, sql: TabKonsolideTip.getClause(`${alias}.kontipkod`), filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'ekstremustkod', text: 'Risk Cari', genislikCh: 18 }),
			new GridKolon({ belirtec: 'odemegunkodu', text: 'Ödeme Gün Kodu', genislikCh: 10 }),
			new GridKolon({ belirtec: 'standartiskonto', text: 'Std.İsk%', genislikCh: 15 }).tipNumerik()
			// new GridKolon({ belirtec: 'tavsiyeplasiyerkod', text: 'Plasiyer', genislikCh: 15 }).hidden()
		)
	}
	static loadServerData_queryDuzenle_son({ sent, sent: { where: wh, sahalar }, offlineRequest, offlineMode } = {}) {
		super.loadServerData_queryDuzenle_son(...arguments)
		let {tableAlias: alias, kodSaha, adiSaha, onlineIdSaha} = this
		sent.cari2BolgeBagla({ alias })
			.cari2IlBagla({ alias })
			.cari2UlkeBagla({ alias })
		if (offlineRequest) {
			if (offlineMode) {
				// Bilgi Gönder
				sahalar.add(
					`${alias}.${kodSaha} ${onlineIdSaha}`,
					`SUBSTRING(${alias}.${adiSaha}, 50) unvan1`,
					`SUBSTRING(${alias}.${adiSaha}, 51, 100) unvan2`,
					`SUBSTRING(${alias}.adres, 60) adres1`,
					`SUBSTRING(${alias}.adres, 61, 120) adres2`
				)
			}
			else {
				// Bilgi Yükle
				{
					let match = `${alias}.${kodSaha}`
					let replace = `${alias}.${onlineIdSaha}`
					let {liste} = wh
					liste.forEach((clause, i) => {
						if (clause.includes(match))
							liste[i] = clause = clause.replaceAll(match, replace)
					})
				}
				sent.leftJoin(alias, 'carisatis csat', `${alias}.${onlineIdSaha} = csat.must`)
				wh.add(`${alias}.silindi = ''`, `${alias}.calismadurumu <> ''`, `${alias}.satilamazfl = ''`)
				sahalar.add(
					`${alias}.${onlineIdSaha} ${kodSaha}`,
					`RTRIM(LTRIM(${alias}.unvan1 + ' ' + ${alias}.unvan2)) ${adiSaha}`,
					`RTRIM(LTRIM(${alias}.adres1 + ' ' + ${alias}.adres2)) adres`,
				)
				sahalar.addWithAlias(alias, 'kontipkod')
				sahalar.addWithAlias('csat',
					'ekstremustkod', 'tavsiyeplasiyerkod', 'odemegunkodu', 'standartiskonto')
			}
		}
	}
	hostVarsDuzenle({ hv, offlineRequest, offlineMode }) {
		super.hostVarsDuzenle(...arguments)
		if (offlineRequest) {
			let removeKeys = [
				'ekstremustkod', 'tavsiyeplasiyerkod', 'odemegunkodu', 'standartiskonto'
				// 'risklimit', 'takipborclimiti'
			]
			for (let key of removeKeys)
				delete hv[key]
		}
	}
	setValues({ rec, offlineRequest, offlineMode }) {
		super.setValues(...arguments)
//		if (offlineRequest)
//			debugger
	}
}
