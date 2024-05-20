class EFisIcmal extends EFisBase {
	get brutBedel() {
		return this.getXMLValue('brutBedel', e =>
			asFloat((e.xml.querySelector('LegalMonetaryTotal > LineExtensionAmount') || {}).textContent)
		)
	}
	get kdvHaricBedel() {
		return this.getXMLValue('kdvHaricBedel', e =>
			asFloat((e.xml.querySelector('LegalMonetaryTotal > TaxExclusiveAmount') || {}).textContent)
		)
	}
	get kdvDahilBedel() {
		return this.getXMLValue('kdvDahilBedel', e =>
			asFloat((e.xml.querySelector('LegalMonetaryTotal > TaxInclusiveAmount') || {}).textContent)
		)
	}
	get toplamIskonto() {
		return this.getXMLValue('toplamIskonto', e =>
			asFloat((e.xml.querySelector('LegalMonetaryTotal > AllowanceTotalAmount') || {}).textContent)
		)
	}
	get toplamKDV() {
		return this.getXMLValue('toplamKDV', e =>
			asFloat((e.xml.querySelector('TaxTotal > TaxAmount') || {}).textContent)
		)
	}
	get sonucBedel() {
		return this.getXMLValue('sonucBedel', e =>
			asFloat((e.xml.querySelector('LegalMonetaryTotal > PayableAmount') || {}).textContent)
		)
	}
}
