class EFisDetay extends EFisBase {
	get seq() { return this.dict.seq }
	set seq(value) { this.dict.seq = value }
	get shRefDet() { return this._shRefDet }
	set shRefDet(value) { this._shRefDet = value }
	get barkod() {
		return this.getXMLValue('barkod', e =>
			e.xml.querySelector('Item > ManufacturersItemIdentification > ID')?.textContent)
	}
	get eSHKod() {
		return this.getXMLValue('eSHKod', e =>
			e.xml.querySelector('Item > SellersItemIdentification > ID')?.textContent)
	}
	get eSHAdi() {
		return this.getXMLValue('eSHAdi', e =>
			e.xml.querySelector('Item > Name')?.textContent)
	}
	get miktar() {
		return this.getXMLValue('miktar', e =>
			asFloat(e.xml.querySelector('InvoicedQuantity')?.textContent)
		)
	}
	get brm() {
		return this.getXMLValue('brm', e => {
			const intKod = e.xml.querySelector('InvoicedQuantity')?.getAttribute('unitCode');
			return intKod ? ((app.params.stokBirim.intKod2KA[intKod] || {}).kod || intKod) : null
		})
	}
	get fiyat() {
		return this.getXMLValue('fiyat', e =>
			asFloat(e.xml.querySelector('Item > Price > PriceAmount')?.textContent)
		)
	}
	get netBedel() {
		return this.getXMLValue('netBedel', e =>
			asFloat(e.xml.querySelector('LineExtensionAmount')?.textContent)
		)
	}
	get vergiler() {
		return this.getXMLValue('vergiler', e => {
			const {xml} = e;
			const result = { normal: {}, tevfikat: {} };
			const xsubTotals = xml.querySelectorAll('TaxTotal > TaxSubtotal');
			for (const xsubTotal of xsubTotals) {
				const typeCode = xsubTotal.querySelector('TaxCategory > TaxScheme > TaxTypeCode')?.textContent;
				const oran = asFloat(xsubTotal.querySelector('Percent')?.textContent);
				const vioTip = MQVergi.getETip2Belirtec(typeCode) || '?';
				result.normal[vioTip] = oran
			}
			const xtevSubTotals = xml.querySelectorAll('WithholdingTaxTotal > TaxSubtotal');
			for (const xsubTotal of xtevSubTotals) {
				const typeCode = xsubTotal.querySelector('TaxCategory > TaxScheme > TaxTypeCode')?.textContent;
				const oran = asFloat(xsubTotal.querySelector('Percent')?.textContent);
				result.tevfikat[typeCode] = oran
			}
			return result
		})
	}
	get iskOranListe() {
		return this.getXMLValue('iskOranListe', e => {
			const {xml} = e;
			const result = [];
			const xnodes = xml.querySelectorAll('AllowanceCharge');
			for (const xnode of xnodes) {
				const uygunmu = !asBool(xnode.querySelector('ChargeIndicator')?.textContent);	// =false
				if (!uygunmu)
					continue
				const oran = asFloat(xnode.querySelector('MultiplierFactorNumeric')?.textContent) * 100;
				if (oran)
					result.push(oran)
			}
			return result
		})
	}
	get artOranListe() {
		return this.getXMLValue('artOranListe', e => {
			const {xml} = e;
			const result = [];
			const xnodes = xml.querySelectorAll('AllowanceCharge');
			for (const xnode of xnodes) {
				const uygunmu = asBool(xnode.querySelector('ChargeIndicator')?.textContent);		// =true
				if (!uygunmu)
					continue
				const oran = asFloat(xnode.querySelector('MultiplierFactorNumeric')?.textContent) * 100;
				if (oran)
					result.push(oran)
			}
			return result
		})
	}
	get iskOranlarStr() {
		return this.getXMLValue('iskOranlarStr', e =>
			this.iskOranListe.filter(x => !!x).join('+'))
	}
	get artOranlarStr() {
		return this.getXMLValue('artOranlarStr', e =>
			this.artOranListe.filter(x => !!x).join('+'))
	}

	constructor(e) {
		e = e || {};
		super(e);

		$.extend(this, { seq: e.seq })
	}

	alimGeciciDetayHostVars(e) {
		e = e || {};
		const hv = {};
		const {shRefDet} = this;
		let shTipKod = '';
		if (shRefDet) {
			let {shTip} = shRefDet;
			switch (shTip.char) {
				case 'hizmet': shTipKod = 'H'; break;
				case 'demirbas': shTipKod = 'D'; break;
			}
		}

		let vergiler = this.vergiler || {};
		for (const key of ['normal', 'tevfikat']) {
			if (!vergiler[key])
				vergiler[key] = {}
		}
		const tevTip = Object.keys(vergiler.tevfikat)[0] || '';						// 601 gibi
		const tevOran = vergiler.tevfikat[tevTip] || '';
		const tevOranx = tevOran ? `${tevOran / 10}/10` : '';

		$.extend(hv, {
			seq: this.seq, shtip: shTipKod,
			efbarkod: this.barkod || '', efstokkod: this.eSHKod || '',
			efstokadi: (this.eSHAdi || '').substr(0, 120),
			efmiktar: this.miktar || 0, miktar: this.miktar || 0, fiyat: this.fiyat || 0, bedel: this.netBedel || 0,
			iskoranstr: this.iskOranlarStr || '', artoranstr: this.artOranlarStr || '',
			kdvorani: vergiler.normal[MQVergiKdv.belirtec] || 0,
			otvorani: vergiler.normal[MQVergiOtv.belirtec] || 0,
			stopajorani: vergiler.normal[MQVergiStopaj.belirtec] || 0,
			konaklamaorani: vergiler.normal.konaklama || 0,
			tevgibkod: tevTip, tevoranx: tevOranx
		});
		for (const key of MQEIslSHRefDetay.tumSHSahalar)
			hv[key] = ''
		if (shRefDet) {
			let {shKod_rowAttr, shKod, shTip} = shRefDet;
			if (shKod_rowAttr && shKod)
				hv[shKod_rowAttr] = shKod
			switch (shTip.char) {
				case 'hizmet': shTipKod = 'H'; break;
				case 'demirbas': shTipKod = 'D'; break;
			}
		}
		
		return hv
	}
	setValues(e) {
		super.setValues(e);
		
		const {rec} = e;
		const {dict} = this
		/*$.extend(dict, {
		})*/
	}

	ekBilgileriBelirle(e) {
		const {shRefFis} = e.eFis || {};
		if (!shRefFis)
			return this

		const {eSHKod, barkod} = this;
		const {tip2Deger2Detay} = shRefFis;
		let shRefDet = tip2Deger2Detay.kod[eSHKod] ||
							tip2Deger2Detay.barkod[barkod];
		if (!shRefDet)
			shRefDet = this.getUygunMustRefDetay({ rec: this, shRefFis: shRefFis })
		this.shRefDet = shRefDet
		
		if (eSHKod)
			tip2Deger2Detay.kod[eSHKod] = shRefDet
		if (barkod)
			tip2Deger2Detay.barkod[barkod] = shRefDet
		
		return this
	}
	getUygunMustRefDetay(e) {
		const {shRefFis} = e;
		return shRefFis ? shRefFis.uygunDetay(e) : null
	}
}
