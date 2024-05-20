class EFis extends EFisBase {
	static get detaySinif() { return EFisDetay } static get icmalSinif() { return EFisIcmal }
	get eFis() { return this } set eFis(value) { }
	get shRefFis() { return this._shRefFis } set shRefFis(value) { this._shRefFis = value }
	get detaylar() {
		let result = this._detaylar;
		if (result === undefined) {
			result = [];
			const {detaySinif} = this.class;
			const {xml} = this;
			let seq = 0;
			for (const xnode of xml.children) {
				const name = xnode.localName;
				switch (name) {
					case 'InvoiceLine':
					case 'DespatchLine':
						seq++;
						const detay = new detaySinif({ xml: xnode, eFis: this, seq: seq });
						result.push(detay);
						break
				}
			}
			this._detaylar = result
		}
		return result
	}
	get icmal() {
		let result = this._icmal; if (result === undefined) { const {xml} = this; result = this._icmal = new this.class.icmalSinif({ eFis: this, xml }) }
		return result
	}
	get siparisBilgileri() {
		return this.getXMLValue('siparisBilgileri', e => {
			const {xml} = e;
			const xnodes = xml.querySelectorAll('OrderDocumentReference');
			const result = [];
			for (const xnode of xnodes) {
				result.push({
					tsn: TicariSeriliNo.fromText(xnode.querySelector('ID')?.textContent),
					tarih: asReverseDate(xnode.querySelector('IssueDate')?.textContent)
				})
			}
			return result
		})
	}
	get irsaliyeBilgileri() {
		return this.getXMLValue('irsaliyeBilgileri', e => {
			const {xml} = e;
			const xnodes = xml.querySelectorAll('DespatchDocumentReference');
			const result = [];
			for (const xnode of xnodes) {
				result.push({
					tsn: TicariSeriliNo.fromText(xnode.querySelector('ID')?.textContent),
					tarih: asReverseDate(xnode.querySelector('IssueDate')?.textContent)
				})
			}
			return result
		})
	}
	get eIslSinif() {
		let result = this._eIslSinif;
		if (result === undefined) {
			result = EIslFatura;
			switch (this.profileID) {
				case 'TEMELFATURA':
				case 'TICARIFATURA':
				case 'KAMU': result = EIslFatura; break
				case 'IHRACAT': result = EIslIhracat; break
				case 'EARSIVFATURA': result = EIslArsiv; break
				case 'TEMELIRSALIYE': result = EIslIrsaliye; break
				case 'EARSIVBELGE': result = EIslMustahsil; break
			}
			this._eIslSinif = result
			/* if (result == null) debugger */
		}
		return result
	}
	get eIslTip() {
		const {dict} = this; let result = dict._eIslTip; if (result !== undefined) return result
		const {eIslSinif} = this; result = dict._eIslTip = eIslSinif?.tip ?? null
		return result
	}
	get profileID() { return this.getXMLValue('profileID', e => e.xml.querySelector('ProfileID')) }
	get belgeTipi() { return this.getXMLValue('belgeTipi', e => e.xml.querySelector('InvoiceTypeCode') || e.xml.querySelector('DespatchAdviceTypeCode')) }
	get senaryoTipi() {
		return this.getXMLValue('senaryoTipi', e => {
			const {eIslSinif} = this; if (!eIslSinif.eFaturami || eIslSinif.eIhracatmi) { return 'M' }		/* M = TEMELFATURA */
			const {profileID} = this;
			return profileID == 'TEMELFATURA' ? 'M' : profileID == 'TICARIFATURA' ? 'T' : profileID == 'KAMU' ? 'K' : ''
		})
	}
	get fisNox() { return this.getXMLValue('fisNox', e => e.xml.querySelector('ID')) }
	get uuid() { return this.getXMLValue('uuid', e => e.xml.querySelector('UUID')) }
	get tarih() { return this.getXMLValue('tarih', e => asDate(e.xml.querySelector('IssueDate')?.textContent)) }
	get dvKod() {
		return this.getXMLValue('dvKod', e => {
			const value = e.xml.querySelector('DocumentCurrencyCode')?.textContent;
			return value == 'TRL' || value == EIslemOrtak.currCode_tl ? '' : value
		}) || ''
	}
	get dvKur() { return this.getXMLValue('dvKur', e => asFloat(e.xml.querySelector('PricingExchangeRate > CalculationRate')?.textContent)) || 0 }
	get gondericiMustKod() { return this.dict.gondericiMustKod }
	set gondericiMustKod(value) { return this.dict.gondericiMustKod = value }
	get gondericiUnvan() {
		return this.getXMLValue('gondericiUnvan', e => {
			const {xml} = e;
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
		return this.getXMLValue('gondericiVergiDairesi', e => {
			const {xml} = e;
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
		return this.getXMLValue('gondericiAdresYapi', e => {
			const {xml} = e;
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
		return this.getXMLValue('gondericiIletisimYapi', e => {
			const {xml} = e;
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
		return this.getXMLValue('gondericiWebSitesi', e => {
			const {xml} = e;
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
		return this.getXMLValue('gondericiVKN', e => {
			const {xml} = e;
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
		return this.getXMLValue('aliciUnvan', e => {
			const {xml} = e;
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
		return this.getXMLValue('aliciVKN', e => {
			const {xml} = e;
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
		return this.getXMLValue('aliciAdresYapi', e => {
			const {xml} = e;
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
		return this.getXMLValue('aliciIletisimYapi', e => {
			const {xml} = e;
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
		return this.getXMLValue('aliciWebSitesi', e => {
			const {xml} = e;
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
	get dovizlimi() { return !!this.dvKod } get iademi() { return this.belgeTipi == 'IADE' } get tevkifatlimi() { return this.belgeTipi == 'TEVKIFAT' }
	
	constructor(e) {
		e = e || {}; super(e); $.extend(this, { _detaylar: e.detaylar, _icmal: e.icmal });
		let {eIslSinif, efAyrimTipi} = e; if (!eIslSinif && efAyrimTipi != null) { eIslSinif = EIslemOrtak.getClass(efAyrimTipi || 'A') }
		this._eIslSinif = eIslSinif
	}
	alimGeciciBaslikHostVars(e) {
		e = e || {}; const {fisNox, icmal, dovizlimi, eIslTip} = this;
		const geciciTip = (eIslTip == 'E' || eIslTip == 'A') ? '' : eIslTip, tsn = TicariSeriliNo.fromText(fisNox);
		const getBedel = (_dovizlimi, valueOrBlock) => _dovizlimi == dovizlimi ? getFuncValue.call(this, valueOrBlock, e) : 0;
		const hv = {
			tamamlandi: '', efatconfkod: (this.eConf || {}).kod || '',
			iade: (this.iademi ? 'I' : ''), efbelge: geciciTip, efuuid: this.uuid,
			vkno: this.gondericiVKN, mustkod: this.gondericiMustKod || '',
			efmustunvan: (this.gondericiUnvan || '').substr(0, 50), efatsenaryotipi: this.senaryoTipi,
			tarih: this.tarih, effatnox: fisNox, seri: tsn.seri, noyil: tsn.noYil, no: tsn.no,
			dvkod: this.dvKod || '', dvkur: this.dvKur,
		/* TL BEDEL */
			efbrut: getBedel(false, () => icmal.brutBedel), efiskonto: getBedel(false, () => icmal.toplamIskonto),
			efkdv: getBedel(false, () => icmal.toplamKDV), efsonuc: getBedel(false, () => icmal.sonucBedel),
		/* DV BEDEL */
			efdvbrut: getBedel(true, () => icmal.brutBedel), efdviskonto: getBedel(true, () => icmal.toplamIskonto),
			efdvkdv: getBedel(true, () => icmal.toplamKDV), efdvsonuc: getBedel(true, () => icmal.sonucBedel)
		};
		return hv
	}
	setValues(e) {
		super.setValues(e); const {rec} = e;
		let efAyrimTipi = rec.efAyrimTipi || rec.efayrimtipi; if (efAyrimTipi != null) { efAyrimTipi = efAyrimTipi || 'A' }
		if (efAyrimTipi != null) { this._eIslSinif = EIslemOrtak.getClass(efAyrimTipi) }
		const {dict} = this;
		$.extend(dict, { fisNox: rec.fisnox, uuid: rec.uuid || rec.efatuuid })
	}
	static async topluEkBilgileriBelirle(e) {
		const {liste} = e, vkn2EFisListe = {};
		for (const eFis of liste) { const vkn = eFis.gondericiVKN; (vkn2EFisListe[vkn] = vkn2EFisListe[vkn] || []).push(eFis) }
		const vkn2Must = (await MQEIslVKNRef.getVKN2Must_yoksaOlustur({ vknListe: Object.keys(vkn2EFisListe) })) || {};
		for (const vkn in vkn2Must) {
			const mustKod = vkn2Must[vkn], eFisListe = vkn2EFisListe[vkn];
			for (const eFis of eFisListe) { eFis.gondericiMustKod = mustKod }
		}
		const promises = []; for (const eFis of liste) { promises.push(eFis.ekBilgileriBelirle(e)) } await Promise.all(promises)
	}
	async ekBilgileriBelirle(e) {
		e = $.extend({}, e);
		const mustKod = this.gondericiMustKod; if (!mustKod) return this
		const shRefFis = this.shRefFis = await MQEIslSHRef.getMustKod2Inst({ mustKod });
		if (shRefFis) { e.eFis = this; for (const det of this.detaylar) { await det.ekBilgileriBelirle(e) } }
		
		return this
	}
	detaylarReset() { this.detaylar = undefined; return this }
}
