class EFisIcmal extends EFisBase {
	get brutBedel() {
		return this.getXMLValue('brutBedel', ({ xml }) =>
			asFloat(xml.querySelector('LegalMonetaryTotal > LineExtensionAmount')?.textContent))
	}
	get kdvHaricBedel() {
		return this.getXMLValue('kdvHaricBedel', ({ xml }) =>
			asFloat(xml.querySelector('LegalMonetaryTotal > TaxExclusiveAmount')?.textContent))
	}
	get kdvDahilBedel() {
		return this.getXMLValue('kdvDahilBedel', ({ xml }) =>
			asFloat(xml.querySelector('LegalMonetaryTotal > TaxInclusiveAmount')?.textContent))
	}
	get toplamIskonto() {
		return this.getXMLValue('toplamIskonto', ({ xml }) =>
			asFloat(xml.querySelector('LegalMonetaryTotal > AllowanceTotalAmount')?.textContent))
	}
	get toplamKDV() {
		return this.getXMLValue('toplamKDV', ({ xml }) =>
			asFloat(xml.querySelector('TaxTotal > TaxAmount')?.textContent))
	}
	get sonucBedel() {
		return this.getXMLValue('sonucBedel', ({ xml }) =>
			asFloat(xml.querySelector('LegalMonetaryTotal > PayableAmount')?.textContent))
	}
}
