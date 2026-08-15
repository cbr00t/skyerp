class EIslIrsaliye extends EIslTicariOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get eIrsaliyemi() { return true }
	static get tip() { return 'IR' }
	static get altBolum() { return 'EIrsaliye' }
	static get sinifAdi() { return 'e-İrsaliye' }
	static get kisaAdi() { return 'e-İrs' }
	static get paramSelector() { return 'eIrsaliye' }
	static get xmlTipBelirtec() { return 'DespatchAdvice' }
	static get xmlDetayTag() { return 'cac:DespatchLine' }
	static get xmlTagPF_senderParty() { return 'DespatchSupplierParty' }
	static get xmlTagPF_receiverParty() { return 'DeliveryCustomerParty' }

	async onKontrol_ara(e) {
		await super.onKontrol_ara(e)
	}
	
	xmlGetProfileID(e) { return 'TEMELIRSALIYE' }
	xmlGetBelgeTipKodu(e) { return 'SEVK' }

	async xmlDuzenle_docRefs_ara({ xw }) {
		await super.xmlDuzenle_docRefs_ara(...arguments)
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'FIYATBEDEL_GOSTERILIR', value: irsDetayBedel })
	}
	async xmlDuzenle_detaylarOncesi(e) {
		await super.xmlDuzenle_detaylarOncesi(e)
		this.xmlDuzenle_shipment(e)
	}
	xmlDuzenle_shipment({ xw }) {
	}
	xmlDuzenle_detayDevam_miktar({ xw, detay: det }) {
		super.xmlDuzenle_detayDevam_miktar(...arguments)
		let { stokBirim: { brmDict = {} } } = app.params
		let { miktar, brm } = det
		let { [brm]: { intKod } = {} } = brmDict
		intKod ||= brm
		
		xw.writeElementBlock('cbc:DeliveredQuantity', null, () => {
			xw
				.writeAttributeString('unitCode', intKod)
				.writeString(miktar || 0)
		})
	}

	xmlDuzenle_docRefs_yalnizYazisi(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_docRefs_yalnizYazisi(e)
	}
	xmlDuzenle_allowanceCharge(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_allowanceCharge(e)
	}
	xmlDuzenle_taxTotal(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_taxTotal(e)
	}
	xmlDuzenle_tevkifatli_taxTotal(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_tevkifatli_taxTotal(e)
	}
	xmlDuzenle_legalMonetaryTotal(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_legalMonetaryTotal(e)
	}
	
	xmlDuzenle_detayDevam_taxTotal(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_detayDevam_taxTotal(e)
	}
	xmlDuzenle_detayDevam_tevkifatli_taxTotal(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_detayDevam_tevkifatli_taxTotal(e)
	}
	xmlDuzenle_detayDevam_item_additionalItemIds_netFiyat(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_detayDevam_item_additionalItemIds_netFiyat(e)
	}
	xmlDuzenle_detayDevam_item_additionalItemIds_ikGosterim(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_detayDevam_item_additionalItemIds_ikGosterim(e)
	}

	xmlDuzenle_detayDevam_fiyat(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_detayDevam_fiyat(e)
	}
	xmlDuzenle_detayDevam_allowanceCharge(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_detayDevam_allowanceCharge(e)
	}
}
