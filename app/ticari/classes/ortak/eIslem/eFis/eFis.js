class EFis extends EFisBase {
	static get detaySinif() { return EFisDetay } static get icmalSinif() { return EFisIcmal }
	get eFis() { return this }
	set eFis(v) { }
	get shRefFis() { return this._shRefFis }
	set shRefFis(v) { this._shRefFis = v }
	get detaylar() {
		let { _detaylar: res } = this
		if (res === undefined) {
			res = []
			let { xml, class: { detaySinif } } = this
			let eFis = this, seq = 0
			for (let xnode of xml.children) {
				let { localName: name } = xnode
				switch (name) {
					case 'InvoiceLine':
					case 'DespatchLine':
						seq++;
						let detay = new detaySinif({ xml: xnode, eFis, seq })
						res.push(detay)
						break
				}
			}
			this._detaylar = res
		}
		return res
	}
	get icmal() {
		let eFis = this, { _icmal: res, xml } = this
		if (res === undefined)
			res = this._icmal = new this.class.icmalSinif({ eFis, xml })
		return res
	}
	get siparisBilgileri() {
		return this.getXMLValue('siparisBilgileri', ({ xml }) => {
			let xnodes = xml.querySelectorAll('OrderDocumentReference')
			let res = []
			for (let xnode of xnodes) {
				res.push({
					tsn: TicariSeriliNo.fromText(xnode.querySelector('ID')?.textContent),
					tarih: asReverseDate(xnode.querySelector('IssueDate')?.textContent)
				})
			}
			return res
		})
	}
	get irsaliyeBilgileri() {
		return this.getXMLValue('irsaliyeBilgileri', ({ xml }) => {
			let xnodes = xml.querySelectorAll('DespatchDocumentReference')
			let res = []
			for (let xnode of xnodes) {
				res.push({
					tsn: TicariSeriliNo.fromText(xnode.querySelector('ID')?.textContent),
					tarih: asReverseDate(xnode.querySelector('IssueDate')?.textContent)
				})
			}
			return res
		})
	}
	get eIslSinif() {
		let { _eIslSinif: res } = this
		if (res === undefined) {
			res = EIslFatura
			switch (this.profileID) {
				case 'TEMELFATURA':
				case 'TICARIFATURA':
				case 'KAMU': res = EIslFatura; break
				case 'IHRACAT': res = EIslIhracat; break
				case 'EARSIVFATURA': res = EIslArsiv; break
				case 'TEMELIRSALIYE': res = EIslIrsaliye; break
				case 'EARSIVBELGE': res = EIslMustahsil; break
			}
			this._eIslSinif = res
			// if (res == null) debugger
		}
		return res
	}
	get eIslTip() {
		let { dict, eIslSinif } = this
		let { _eIslTip: res } = dict
		if (res === undefined)
			res = dict._eIslTip = eIslSinif?.tip ?? null
		return res
	}
	get profileID() {
		return this.getXMLValue('profileID', ({ xml }) =>
			xml.querySelector('ProfileID'))
	}
	get belgeTipi() {
		return this.getXMLValue('belgeTipi', ({ xml }) =>
			xml.querySelector('InvoiceTypeCode') ||
			xml.querySelector('DespatchAdviceTypeCode'))
	}
	get senaryoTipi() {
		return this.getXMLValue('senaryoTipi', () => {
			let { eIslSinif, profileID } = this
			if (!eIslSinif.eFaturami || eIslSinif.eIhracatmi)    // M = TEMELFATURA
				return 'M'
			return (
				!eIslSinif.eFaturami || eIslSinif.eIhracatmi || profileID == 'TEMELFATURA' ? 'M' :
				profileID == 'TICARIFATURA' ? 'T' :
				profileID == 'KAMU' ? 'K' :
				''
			)
		})
	}
	get fisNox() {
		return this.getXMLValue('fisNox', ({ xml }) =>
			xml.querySelector('ID'))
	}
	get uuid() {
		return this.getXMLValue('uuid', ({ xml }) =>
			xml.querySelector('UUID'))
	}
	get tarih() {
		return this.getXMLValue('tarih', ({ xml }) =>
			asDate(xml.querySelector('IssueDate')?.textContent))
	}
	get dvKod() {
		return this.getXMLValue('dvKod', ({ xml }) => {
			let v = xml.querySelector('DocumentCurrencyCode')?.textContent;
			return (
				v == 'TRL' || v == EIslemOrtak.currCode_tl ? '' :
				v
			)
		}) ?? ''
	}
	get dvKur() {
		return this.getXMLValue('dvKur', ({ xml }) =>
			asFloat(xml.querySelector('PricingExchangeRate > CalculationRate')?.textContent)) || 0
	}
	get dovizlimi() { return !!this.dvKod }
	get iademi() { return this.belgeTipi == 'IADE' }
	get tevkifatlimi() { return this.belgeTipi == 'TEVKIFAT' }
	get gondericiMustKod() { return this.dict.gondericiMustKod }
	set gondericiMustKod(v) { return this.dict.gondericiMustKod = v }
	get gondericiUnvan() {
		return this.getXMLValue('gondericiUnvan', ({ xml }) => {
			return inverseCoalesce(
				(
					xml.querySelector('AccountingSupplierParty > Party > PartyName > Name') ||
					xml.querySelector('DespatchSupplierParty > Party > PartyName > Name')
				),
				xnode =>
					xnode?.textContent
			)
		})
	}
	get gondericiVergiDairesi() {
		return this.getXMLValue('gondericiVergiDairesi', ({ xml }) => {
			return inverseCoalesce(
				(
					xml.querySelector('AccountingSupplierParty > Party > PartyTaxScheme > TaxScheme > Name') ||
					xml.querySelector('DespatchSupplierParty > Party > PartyTaxScheme > TaxScheme > Name')
				),
				xnode =>
					xnode?.textContent
			)
		})
	}
	get gondericiAdresYapi() {
		return this.getXMLValue('gondericiAdresYapi', ({ xml }) => {
			return inverseCoalesce(
				(
					xml.querySelector('AccountingSupplierParty > Party > PostalAddress') ||
					xml.querySelector('DespatchSupplierParty > Party > PostalAddress')
				),
				xnode => {
					return {
						adres: xnode.querySelector('StreetName')?.textContent,
						yore: xnode.querySelector('CitySubdivisionName')?.textContent,
						ilAdi: xnode.querySelector('CityName')?.textContent,
						posta: xnode.querySelector('PostalZone')?.textContent,
						ulkeAdi: xnode.querySelector('Country > Name')?.textContent
					}
				}
			)
		})
	}
	get gondericiIletisimYapi() {
		return this.getXMLValue('gondericiIletisimYapi', ({ xml }) => {
			return inverseCoalesce(
				(
					xml.querySelector('AccountingSupplierParty > Party > Contact') ||
					xml.querySelector('DespatchSupplierParty > Party > Contact')
				),
				xnode => {
					return {
						tel: xnode.querySelector('Telephone')?.textContent,
						faks: xnode.querySelector('Telefax')?.textContent,
						eMail: xnode.querySelector('ElectronicMail')?.textContent
					}
				}
			)
		})
	}
	get gondericiWebSitesi() {
		return this.getXMLValue('gondericiWebSitesi', ({ xml }) => {
			return inverseCoalesce(
				(
					xml.querySelector('AccountingSupplierParty > Party') ||
					xml.querySelector('DespatchSupplierParty > Party')
				),
				xnode => xnode.querySelector('WebsiteURI')
			)
		})
	}
	get gondericiVKN() {
		return this.getXMLValue('gondericiVKN', ({ xml }) => {
			return inverseCoalesce(
				(
					xml.querySelector('AccountingSupplierParty > Party > PartyIdentification') ||
					xml.querySelector('DespatchSupplierParty > Party > PartyIdentification')
				),
				xnode =>
					xnode.querySelector('ID[schemeID = VKN_TCKN]') ||
					xnode.querySelector('ID[schemeID = VKN]') ||
					xnode.querySelector('ID[schemeID = TCKN]')
			)
		})
	}
	get aliciUnvan() {
		return this.getXMLValue('aliciUnvan', ({ xml }) => {
			return inverseCoalesce(
				(
					xml.querySelector('AccountingCustomerParty > Party > PartyName > Name') ||
					xml.querySelector('DespatchCustomerParty > Party > PartyName > Name') ||
					xml.querySelector('DeliveryCustomerParty > Party > PartyName > Name')
				),
				xnode => xnode?.textContent
			)
		})
	}
	get aliciVKN() {
		return this.getXMLValue('aliciVKN', ({ xml }) => {
			return inverseCoalesce(
				(
					xml.querySelector('AccountingCustomerParty > Party > PartyIdentification') ||
					xml.querySelector('DespatchCustomerParty > Party > PartyIdentification') ||
					xml.querySelector('DeliveryCustomerParty > Party > PartyIdentification')
				),
				xnode =>
					xnode.querySelector('ID[schemeID = VKN_TCKN]') ||
					xnode.querySelector('ID[schemeID = VKN]') ||
					xnode.querySelector('ID[schemeID = TCKN]')
			)
		})
	}
	get aliciAdresYapi() {
		return this.getXMLValue('aliciAdresYapi', ({ xml }) => {
			return inverseCoalesce(
				(
					xml.querySelector('AccountingCustomerParty > Party > PostalAddress') ||
					xml.querySelector('DespatchCustomerParty > Party > PostalAddress') ||
					xml.querySelector('DeliveryCustomerParty > Party > PostalAddress')
				),
				xnode => {
					return {
						adres: xnode.querySelector('StreetName')?.textContent,
						yore: xnode.querySelector('CitySubdivisionName')?.textContent,
						ilAdi: xnode.querySelector('CityName')?.textContent,
						posta: xnode.querySelector('PostalZone')?.textContent,
						ulkeAdi: xnode.querySelector('Country > Name')?.textContent
					}
				}
			)
		})
	}
	get aliciIletisimYapi() {
		return this.getXMLValue('aliciIletisimYapi', ({ xml }) => {
			return inverseCoalesce(
				(
					xml.querySelector('AccountingCustomerParty > Party > Contact') ||
					xml.querySelector('DespatchCustomerParty > Party > Contact') ||
					xml.querySelector('DeliveryCustomerParty > Party > Contact')
				),
				xnode => {
					return {
						tel: xnode.querySelector('Telephone')?.textContent,
						faks: xnode.querySelector('Telefax')?.textContent,
						eMail: xnode.querySelector('ElectronicMail')?.textContent
					}
				}
			)
		})
	}
	get aliciWebSitesi() {
		return this.getXMLValue('aliciWebSitesi', ({ xml }) => {
			return inverseCoalesce(
				(
					xml.querySelector('AccountingCustomerParty > Party') ||
					xml.querySelector('DespatchCustomerParty > Party') ||
					xml.querySelector('DeliveryCustomerParty > Party')
				),
				xnode => xnode.querySelector('WebsiteURI')
			)
		})
	}
	
	constructor(e = {}) {
		super(e)
		let { eConf, efAyrimTipi, eIslSinif: _eIslSinif, detaylar: _detaylar, icmal: _icmal } = e
		efAyrimTipi = EYonetici_Gelen.normalizeEFAyrimTipi(efAyrimTipi)
		if (!_eIslSinif && efAyrimTipi != null)
			_eIslSinif = EIslemOrtak.getClass(efAyrimTipi || 'A')
		extend(this, { eConf, _eIslSinif, efAyrimTipi, _detaylar, _icmal })
	}
	alimGeciciBaslikHostVars(e = {}) {
		let { fisNox, icmal, dovizlimi } = this
		let geciciTip = EYonetici_Gelen.normalizeEFAyrimTipi(this.eIslTip)
		let tsn = TicariSeriliNo.fromText(fisNox)
		let getBedel = (_dovizlimi, valueOrBlock) =>
			_dovizlimi == dovizlimi ? getFuncValue.call(this, valueOrBlock, e) : 0
		
		let hv = {
			tamamlandi: '',
			efatconfkod: (this.eConf || {}).kod || '',
			iade: (this.iademi ? 'I' : ''),
			efbelge: geciciTip,
			efuuid: this.uuid,
			vkno: this.gondericiVKN,
			mustkod: this.gondericiMustKod || '',
			efmustunvan: (this.gondericiUnvan || '').slice(0, 50),
			efatsenaryotipi: this.senaryoTipi,
			tarih: this.tarih, effatnox: fisNox,
			seri: tsn.seri, noyil: tsn.noYil, no: tsn.no,
			dvkod: this.dvKod || '',
			dvkur: this.dvKur,
			birsaliyevar: !empty(this.irsaliyeBilgileri),
		// TL BEDEL
			efbrut: getBedel(false, icmal.brutBedel),
			efiskonto: getBedel(false, icmal.toplamIskonto),
			efkdv: getBedel(false, icmal.toplamKDV),
			efsonuc: getBedel(false, icmal.sonucBedel),
		// DV BEDEL
			efdvbrut: getBedel(true, icmal.brutBedel),
			efdviskonto: getBedel(true, icmal.toplamIskonto),
			efdvkdv: getBedel(true, icmal.toplamKDV),
			efdvsonuc: getBedel(true, icmal.sonucBedel)
		}
		
		return hv
	}
	setValues({ rec }) {
		super.setValues(...arguments)
		let { efAyrimTipi = rec.efayrimtipi, fisNox = rec.fisnox, uuid = rec.efatuuid } = rec
		if (efAyrimTipi != null) {
			efAyrimTipi = EYonetici_Gelen.normalizeEFAyrimTipi(efAyrimTipi) || 'A'
			this._eIslSinif = EIslemOrtak.getClass(efAyrimTipi)
		}
		extend(this.dict, { fisNox, uuid })
	}
	static async topluEkBilgileriBelirle(e = {}) {
		let liste = isArray(e) ? e : e.liste ?? e.recs
		let vkn2EFisListe = {}
		;liste.forEach(eFis => {
			let { gondericiVKN: vkn } = eFis
			;(vkn2EFisListe[vkn] ??= [])
				.push(eFis)
		})
		
		let vknListe = keys(vkn2EFisListe)
		let vkn2Must = await MQEIslVKNRef.getVKN2Must_yoksaOlustur({ vknListe }) ?? {}
		for (let [vkn, mustKod] in entries(vkn2Must)) {
			;vkn2EFisListe[vkn]?.forEach(eFis =>
				eFis.gondericiMustKod = mustKod)
		}
		
		return await promiseAll(liste.map(eFis =>
			eFis.gerekirseEkBilgileriBelirle(e)))
	}
	async gerekirseEkBilgileriBelirle(e) {
		if (!this._ekBilgilerBelirlendi)
			return await this.ekBilgileriBelirle(e)
		return this
	}
	async ekBilgileriBelirle(e) {
		e = { ...e }
		let { gondericiVKN: vkn, gondericiMustKod: mustKod, detaylar } = this
		if (!mustKod && vkn) {
			let recs = values(await MQCari.getGloKod2Rec())
			mustKod = recs.find(r => r.vkno == vkn)?.must
		}
		if (!mustKod)
			return this

		this.gondericiMustKod = mustKod
		let ref = this.shRefFis = await MQEIslSHRef.getMustKod2Inst({ mustKod })
		if (ref) {
			let _e = { ...e, eFis: this }
			await promiseAll(detaylar.forEach(det =>
				det.gerekirseEkBilgileriBelirle(_e)))
		}

		this._ekBilgilerBelirlendi = true
		return this
	}
	detaylarReset() {
		this.detaylar = undefined
		return this
	}
}
