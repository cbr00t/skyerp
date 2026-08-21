class EFisDetay extends EFisBase {
	get seq() { return this.dict.seq }
	set seq(v) { this.dict.seq = v }
	get shRefDet() { return this._shRefDet }
	set shRefDet(v) { this._shRefDet = v }
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
			let intKod = e.xml.querySelector('InvoicedQuantity')?.getAttribute('unitCode')
			return intKod ? ((app.params.stokBirim.intKod2KA[intKod] || {}).kod || intKod) : null
		})
	}
	get fiyat() {
		return this.getXMLValue('fiyat', ({ xml }) =>
			asFloat(xml.querySelector('Item > Price > PriceAmount')?.textContent)
		)
	}
	get netBedel() {
		return this.getXMLValue('netBedel', ({ xml }) =>
			asFloat(xml.querySelector('LineExtensionAmount')?.textContent)
		)
	}
	get vergiler() {
		return this.getXMLValue('vergiler', ({ xml }) => {
			let result = { normal: {}, tevfikat: {} };
			let xsubTotals = xml.querySelectorAll('TaxTotal > TaxSubtotal')
			for (let xsubTotal of xsubTotals) {
				let typeCode = xsubTotal.querySelector('TaxCategory > TaxScheme > TaxTypeCode')?.textContent
				let oran = asFloat(xsubTotal.querySelector('Percent')?.textContent);
				let vioTip = MQVergi.getETip2Belirtec(typeCode) || '?';
				result.normal[vioTip] = oran
			}
			let xtevSubTotals = xml.querySelectorAll('WithholdingTaxTotal > TaxSubtotal')
			for (let xsubTotal of xtevSubTotals) {
				let typeCode = xsubTotal.querySelector('TaxCategory > TaxScheme > TaxTypeCode')?.textContent
				let oran = asFloat(xsubTotal.querySelector('Percent')?.textContent);
				result.tevfikat[typeCode] = oran
			}
			return result
		})
	}
	get iskOranListe() {
		return this.getXMLValue('iskOranListe', e => {
			let {xml} = e;
			let result = [];
			let xnodes = xml.querySelectorAll('AllowanceCharge');
			for (let xnode of xnodes) {
				let uygunmu = !asBool(xnode.querySelector('ChargeIndicator')?.textContent);	// =false
				if (!uygunmu)
					continue
				let oran = asFloat(xnode.querySelector('MultiplierFactorNumeric')?.textContent) * 100;
				if (oran)
					result.push(oran)
			}
			return result
		})
	}
	get artOranListe() {
		return this.getXMLValue('artOranListe', e => {
			let {xml} = e;
			let result = [];
			let xnodes = xml.querySelectorAll('AllowanceCharge');
			for (let xnode of xnodes) {
				let uygunmu = asBool(xnode.querySelector('ChargeIndicator')?.textContent);		// =true
				if (!uygunmu)
					continue
				let oran = asFloat(xnode.querySelector('MultiplierFactorNumeric')?.textContent) * 100;
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

	constructor(e = {}) {
		super(e)
		let { seq } = e
		extend(this, { seq })
	}

	alimGeciciDetayHostVars(e = {}) {
		let { shRefDet, vergiler } = this
		let shTipKod = ''
		if (shRefDet) {
			let { shTip } = shRefDet
			shTip = ( isObject(shTip) ? shTip.char : shTip ) ?? ''
			switch (shTip) {
				case 'hizmet': shTipKod = 'H'; break
				case 'demirbas': shTipKod = 'D'; break
			}
		}

		vergiler ??= {}
		;['normal', 'tevfikat'].forEach(k =>
			vergiler[k] ??= {})
		
		let tevTip = keys(vergiler.tevfikat)[0] || ''						// 601 gibi
		let tevOran = vergiler.tevfikat[tevTip] || ''
		let tevOranx = tevOran ? `${tevOran / 10}/10` : ''

		let hv = {}
		extend(hv, {
			seq: this.seq,
			shtip: shTipKod,
			efbarkod: this.barkod || '',
			efstokkod: this.eSHKod || '',
			efstokadi: this.eSHAdi?.slice(0, 120) || '',
			efmiktar: this.miktar || 0,
			miktar: this.miktar || 0,
			fiyat: this.fiyat || 0,
			bedel: this.netBedel || 0,
			iskorantext: this.iskOranlarStr || '',
			artoranstr: this.artOranlarStr || '',
			kdvorani: vergiler.normal[MQVergiKdv.belirtec] || 0,
			otvorani: vergiler.normal[MQVergiOtv.belirtec] || 0,
			stopajorani: vergiler.normal[MQVergiStopaj.belirtec] || 0,
			konaklamaorani: vergiler.normal.konaklama || 0,
			tevgibkod: tevTip, tevoranx: tevOranx
		})
		;MQEIslSHRefDetay.tumSHSahalar.forEach(k =>
			hv[k] = '')

		if (shRefDet) {
			let { shKod_rowAttr, shKod, shTip } = shRefDet
			shTip = ( isObject(shTip) ? shTip.char : shTip ) ?? ''
			if (shKod_rowAttr && shKod)
				hv[shKod_rowAttr] = shKod
			switch (shTip.char) {
				case 'hizmet': shTipKod = 'H'; break
				case 'demirbas': shTipKod = 'D'; break
			}
		}
		
		return hv
	}

	async gerekirseEkBilgileriBelirle(e) {
		if (!this._ekBilgilerBelirlendi)
			return await this.ekBilgileriBelirle(e)
		return this
	}
	async ekBilgileriBelirle({ shRefFis: ref, eFis } = {}) {
		ref ??= eFis.shRefFis
		if (!ref)
			return this

		let rec = this
		let { eSHKod, barkod } = this
		let { tip2Deger2Detay } = ref
		let shRefDet = (
			tip2Deger2Detay.kod[eSHKod] ??
			tip2Deger2Detay.barkod[barkod]
		)
		if (!shRefDet)
			shRefDet = this.getUygunMustRefDetay({ rec, shRefFis: ref })
		this.shRefDet = shRefDet
		
		if (eSHKod)
			tip2Deger2Detay.kod[eSHKod] = shRefDet
		if (barkod)
			tip2Deger2Detay.barkod[barkod] = shRefDet
		this._ekBilgilerBelirlendi = true
		
		return this
	}
	getUygunMustRefDetay(e = {}) {
		let ref = e.shRefFis ?? e
		return ref?.uygunDetay?.(e)
	}
}
