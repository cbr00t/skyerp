class EIslIrsaliye extends EIslemOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get eIrsaliyemi() { return true }
	static get tip() { return 'IR' }
	static get altBolum() { return 'EIrsaliye' }
	static get sinifAdi() { return 'e-İrsaliye' }
	static get kisaAdi() { return 'e-İrs' }
	static get paramSelector() { return 'eIrsaliye' }
	get xsltBelirtec() { return 'EIrsaliye' }
	
	static get xmlRootTag() { 'DespatchAdvice' }
	static get xmlDetayTag() { return 'cac:DespatchLine' }

	xmlDuzenle_rootElement_ilk(e) {
		super.xmlDuzenle_rootElement_ilk(e);
		const {xw} = e;
		xw.writeAttributeString('xmlns', 'urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2')
	}
	xmlDuzenle_rootElement_son(e) {
		const {xw} = e;
		xw.writeAttributeString('xsi:schemaLocation', 'urn:oasis:names:specification:ubl:schema:xsd:DespatchAdvice-2 UBL-DespatchAdvice-2.1.xsd');
		super.xmlDuzenle_rootElement_son(e)
	}
	
	xmlDuzenle_belgeTipKodu(e) {
		let value = this.xmlGetBelgeTipKodu(e);
		this.baslik._belgeTipKod = value;
		e.xw.writeElementString('cbc:DespatchAdviceTypeCode', value)
	}

	xmlDuzenle_signatureParty(e) {
		super.xmlDuzenle_signatureParty(e);
		$.extend(e, { tagName: 'cac:Signature', source: app.params.isyeri });
		this.xmlDuzenle_partyOrtak(e);
		for (const key of ['tagName', 'source'])
			delete e[key]
	}
	xmlDuzenle_supplierParty(e) {
		super.xmlDuzenle_supplierParty(e);
		$.extend(e, { tagName: 'cac:DespatchSupplierParty', source: app.params.isyeri });
		this.xmlDuzenle_partyOrtak(e);
		for (const key of ['tagName', 'source'])
			delete e[key]
	}
	xmlDuzenle_customerParty(e) {
		super.xmlDuzenle_customerParty(e);
		$.extend(e, { tagName: 'cac:DespatchCustomerParty', source: this.baslik.mustBilgi || {} });
		this.xmlDuzenle_partyOrtak(e);
		for (const key of ['tagName', 'source'])
			delete e[key]
	}
	
	xmlDuzenle_detaylarOncesi(e) {
		super.xmlDuzenle_detaylarOncesi(e);
		this.xmlDuzenle_shipment(e)
	}
	xmlDuzenle_shipment(e) {
		// const {xw} = e
	}
	xmlDuzenle_detayDevam_miktar(e) {
		ssuper.xmlDuzenle_detayDevam_miktar(e);
		
		const det = e.detay;
		const {brm} = det;
		const ulsBrm = (app.params.stokBirim.brmDict['brm'] || {}).intKod || brm;
		
		const {xw} = e;
		xw.writeElementBlock('cbc:DeliveredQuantity', null, () => {
			xw
				.writeAttributeString('unitCode', ulsBrm)
				.writeString(det.miktar || 0)
		})
	}

	xmlGetProfileID(e) {
		return 'TEMELIRSALIYE'
	}
	xmlGetBelgeTipKodu(e) {
		return 'SEVK'
	}
}
