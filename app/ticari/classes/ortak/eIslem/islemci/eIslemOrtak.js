class EIslemOrtak extends CObject {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return this.tip } static get tip() { return null }
	static get ortakSinif() { return this } static get altBolum() { return null }
	static get paramSelector() { return null } static get sinifAdi() { return null }
	static get kisaAdi() { return this.sinifAdi }
	static get question() { return `${this.paramSelector}mi` }
	static get kullanilirmi() { return app.params.ticariGenel?.kullanim?.[this.paramSelector] }
	static get xmlciSinif() { return EXMLOrtak }
	static get anaTip2Sinif() {
		let {_anaTip2Sinif: result} = this
		if (result === undefined) {
			result = {}
			for (let cls of this.subClasses) {
				let {anaTip} = cls
				if (anaTip != null)
					result[anaTip] = cls
			}
			this._anaTip2Sinif = result
		}
		return result
	}
	static get tip2Sinif() {
		let {_tip2Sinif: result} = this
		if (result === undefined) {
			result = {}
			for (let cls of this.subClasses) {
				let {tip} = cls
				if (tip != null)
					result[tip] = cls
			}
			this._tip2Sinif = result
		}
		return result
	}
	static get kaListe() {
		return entries(EIslemOrtak.tip2Sinif)
			.map(([ kod, ekBilgi ]) =>
				new CKodAdiVeEkBilgi({ kod, aciklama: ekBilgi.sinifAdi, ekBilgi }))
	}
	get temps() { return this._temps }
	set temps(v) { this._temps = v }
	get shared() { return this._shared }
	set shared(v) { this._shared = v }
	static get currCode_tl() { return 'TRY' }
	// get xsltBelirtec() { return 'EIslemOrtak' }
	get xsltBelirtec() { return 'EFatura' }    // ** API'den hepsinde 'EFatura' için XSLT istenmeli
	get xsltDosyaAdi() { return `${this.xsltBelirtec}Gosterim.xslt` }
	static get xmlRootTag() { return null } static get xmlDetayTag() { return null }
	static get xml_ublVersionID() { return '2.1' }
	static get xml_customizationID() { return 'TR1.2' }
	static get xmlTipBelirtec() { return null }
    static get xmlRootTag() { return this.xmlTipBelirtec }
	static get xmlDetayTag() { return `cac:${this.xmlTipBelirtec}Line` }    // InvoiceLine, DespatchAdviceLine
    static get xmlTagPF_senderParty() { return 'AccountingSupplierParty' }
	static get xmlTagPF_receiverParty() { return 'AccountingCustomerParty' }
	static get xmlTagPF_buyerParty() { return 'BuyerCustomerParty' }
	static get defaultCountryName() { return 'Türkiye' }
	get dovizlimi() { return this.baslik.dovizlimi }
	get dvKod() { return this.baslik.dvKod } get dvKur() { return this.baslik.dvKur }
	get bedelSelector() { return this.dovizlimi ? 'dv' : 'tl' } 
	get currencyID() { return this.dvKod }
	get xattrYapi_bedel() { return ({ currencyID: this.currencyID }) }
	get gondericiBilgi() {
		let {baslik: { bizsubekod: subeKod }, temps, temps: { subeKod2Rec }} = this
		let {isyeri: inst} = app.params
		let rec = subeKod ? subeKod2Rec[subeKod] : null
		if (rec) {
			let subeKod2Inst = temps.subeKod2Inst ??= {}
			inst = subeKod2Inst[subeKod] ??= (() => {
				inst = new MQSube()
				inst.setValues({ rec })
				return inst
			})()
		}
		return inst
	}
	get gondericiGIBAlias() { return this.eConf.getValue('gibAlias') }
	get aliciBilgi() { return this.baslik.aliciBilgi }
	get aliciGIBAlias() { return this.baslik.gibAlias }
	static get innovami() { return app.params.eIslem.ozelEntegrator.innovami }
	
	constructor(e = {}) {
		super(e)
		let { icmal: _icmal } = e
		if (_icmal && isPlainObject(_icmal))
			_icmal = e.icmal = new EIcmal(_icmal)
		extend(this, {
			eConf: e.eConf ?? MQEConf.instance, baslik: e.baslik,
			detaylar: e.detaylar || [], dipNotlar: e.dipNotlar || [], icmal: _icmal,
			xsltDuzenleyiciler: e.xsltDuzenleyiciler || [], _temps: e._temps ?? e.temps
		})
	}
	static getAnaClass(e = {}, _gelenmi) {
		let isObj = isObject(e)
		let anaTip = isObj ? e.anaTip : e
		let gelenmi = isObj ? e.gelen ?? e.gelenmi : _gelenmi
		let { anaTip2Sinif } = this
		return (
			gelenmi ? EIslGelen :
			anaTip ? anaTip2Sinif[anaTip] :
			EIslemOrtak
		)
	}
	static getClass(e) {
		e ??= {}
		let tip = isObject(e) ? e.tip : e
		let cls = this.tip2Sinif[tip]
		return cls
	}
	static newFor(e) {
		if (!e)
			return null
		let cls = e ? this.getClass(e) : null
		return cls ? new cls(e) : null
	}
	
	static async tipIcinFislerEkDuzenlemeYap(e = {}) {
		let { table2Id2EFis } = e
		if (empty(table2Id2EFis))
			return
		
		let promises = []
		let yukleIslemi = async _e => {
			_e = { ...e, ..._e }
			let stm = _e.stm = getFuncValue.call(this, _e.stm, _e)
			if (!stm)
				return
			
			let { seviyelendirici, yukleyici } = _e
			let recs = _e.recs = await stm.execSelect()
			let sevRecs = seviyelendirici ? _e.sevRecs = getFuncValue.call(this, seviyelendirici, _e) : null
			let _recs = _e.recs = (sevRecs ?? recs)
			for (let sev of _recs) {
				let rec = _e.rec = sev.orjBilgi ?? sev
				let { detaylar } = sev
				let { _table: tbl, id } = rec
				
				let args = { ..._e, sev, detaylar }
				let id2EFis = table2Id2EFis[tbl]
				let eFis = id2EFis?.[id]
				if (tbl && !eFis)
					continue

				args.eFis = eFis
				await yukleyici.call(this, args)
			}
		}

		;{
			let args = { ...e, promises, yukleIslemi }
			await this.tipIcinFislerEkDuzenlemeYapDevam(args)
			promises = args.promises
		}
		
		if (!empty(promises))
			await promiseAll(promises)
	}
	static tipIcinFislerEkDuzenlemeYapDevam({ yukleIslemi, promises }) {
		promises.push(
			yukleIslemi({
				stm: e => this.getEIslemBilgiStm(e),
				seviyelendirici: ({ recs: source }) =>
					seviyelendir({ source, attrListe: ['kod'] }),
				yukleyici: e => this.eIslemBilgiYukle({ ...e })
			}),
			MQSevkAdres.getGloKod2Adi()    // cache
		)
	}
	
	baslikVeDetaylariYukle(e) {
		let { baslik, detaylar, temps = {}, shared = {} } = e
		for (let inst of [this, baslik, ...detaylar]) {
			inst._temps = temps
			inst._shared = shared
		}
		extend(this, { baslik, detaylar })
		//this.baslik = baslik
		// thisDetaylar.push(...detaylar.slice(1))    // [0]: sev.orjBilgi | [1..]: sev.detaylar
		return this
	}
	static getEFisBaslikVeDetayStm() { return null }
	static getEIslemBilgiStm(e) {
		let sent = new MQSent(), { where: wh, sahalar } = sent
		sent.fisHareket('progbuyukdata', 'progbuyukdatadetay')
		wh
			.degerAta('EF', 'fis.tip')
			.degerAta('EKB', 'fis.alttip')
		sahalar.add('fis.kod', 'har.seq', 'har.xdata')
		
		let orderBy = ['kod', 'seq']
		return new MQStm({ sent, orderBy })
	}
	static eIslemBilgiYukle({ sevRecs, temps }) {
		let res = temps.eIslemKod2Bilgi = {}
		for (let sev of sevRecs) {
			let { orjBilgi: { kod }, detaylar } = sev
			let xdata = detaylar.map(_ => _.xdata).join('')
			let data = xdata ? new TextDecoder(encoding_iso).decode(Base64.toUint8Array(xdata)) : null
			if (data)
				res[kod] = data
		}
	}

	static async getEIslemBilgi_kod2Text(e = {}, decode) {
		let kodListe = isString(e) ? [e] : makeArray(e.kodListe ?? e.kodlar ?? e.kod ?? e)
		decode ??= e.decode ?? e.decodeFlag ?? true
		kodListe = empty(kodListe) ? null : kodListe
		
		let stm = EIslemOrtak.getEIslemBilgiStm()
		for (let { where: wh } of stm) {
			if (kodListe)
				wh.inDizi(kodListe, 'fis.kod')
			else
				wh.add(`fis.kod <> ''`)
			
		}

		let source = await stm.execSelect(e)
		let res = {}
		seviyelendir({ source, attrListe: ['kod'] }).forEach(sev => {
			let { orjBilgi: { kod }, detaylar } = sev
			let v = detaylar
				.filter(Boolean)
				.map(r => r.xdata)
				.join('')
				.trimEnd()
			if (decode && isBase64(v))
				v = fromBase64(v)?.trimEnd()
			res[kod] = v
		})
		return res
	}
	static getEIslemBilgiText(e = {}, decode) {
		if (!isPlainObject(e))
			e = { kodListe: e }
		return this.getEIslemBilgi_kod2Text(e, decode).then(res =>
			values(res)?.[0] ?? null)
	}
	
	icmalYoksaOlustur(e) {
		return this.icmal ??= new EIcmal(e)
	}
	xmlGetProfileID(e) { return null }
	xmlGetBelgeTipKodu(e) { return null }
	
	async onKontrol(e) {
		let err = errorTextsAsObject({ errors: await this.onKontrolMesajlar(e) })
		if (err)
			throw err
		
		let { baslik, detaylar, class: { ticarimi } } = this
		if (ticarimi)
			await this.onKontrol_ara(e)
		
		for (let item of [baslik, detaylar]) {
			if (item?.onKontrol)
				await item?.onKontrol(e)
		}
		
		return this
	}
	async onKontrol_ara(e) { }
	async onKontrolMesajlar() {
		let e = { ...arguments[0], liste: [] }
		await this.onKontrolMesajlarDuzenle(e)
		await this.onKontrolMesajlarDuzenle_son(e)
		return e.liste?.filter(x => !!x)
	}
	async onKontrolMesajlarDuzenle(e) { }
	async onKontrolMesajlarDuzenle_son(e) { }
	
	async xmlOlustur(e = {}) {
		e.eFis = this
		await this.onKontrol(e)

		let { xsltBelirtec, baslik, temps, temps: { eIslemXSLT, eIslemScript } } = this
		if (eIslemXSLT === undefined) {
			try { eIslemXSLT = await app.wsEIslemXSLTData({ belirtec: xsltBelirtec }) ?? null }
			catch (ex) { }
			eIslemXSLT = temps.eIslemXSLT = eIslemXSLT ?? null
		}
		if (eIslemScript === undefined) {
			try { eIslemScript = await app.wsEIslemXSLTScript({ belirtec: xsltBelirtec }) ?? null }
			catch (ex) { }
			eIslemScript = temps.eIslemScript = eIslemScript ?? null
		}
		
		let uuidOlustumu = false
		if (!baslik.uuid) {
			baslik.uuid = baslik.zorunluUUID || newGUID()
			uuidOlustumu = true
		}
		
		let xw = e.xw = new XMLWriter()
		xw.writeStartDocument()
		await this.xmlDuzenle(e)
		xw.writeEndDocument()
		let result = xw.flush()
		
		xw = e.xw
		// delete e.xw
		
		extend(e, { islem: 'xml', result })
		try {
			await this.execEIslemScript(e)
			result = e.result
			if (result)
				xw = e.xw = result
		}
		catch (ex) { console.error(ex) }
		deleteKeys(e, 'islem', 'result')
		
		if (uuidOlustumu) {
			let { updCallback: callback } = e
			let { _table: tbl, fisSayac: sayac, uuid } = baslik
			delete e.updCallback
			
			let upd = e.query = new MQIliskiliUpdate()
			;{
				let { where: wh, set } = upd
				upd.fromAdd(tbl)
				wh.degerAta(sayac, 'kaysayac')
				set
					.degerAta(uuid, 'efatuuid')
					.degerAta(now(), 'efimzats')
			}
			
			if (callback)
				await callback.call(this, e)
			else
				await upd.execute()
		}
		
		return result
	}
	async xmlDuzenle(e) {
		let { xw } = e
		let { class: { xmlRootTag } } = this
		xw.writeStartElement(xmlRootTag)
		await this.xmlDuzenle_rootElement(e)
		await this.xmlDuzenle_ublExtensions(e)
		await this.xmlDuzenle_profileID_oncesi(e)
		await this.xmlDuzenle_profileID(e)
		await this.xmlDuzenle_profileIDVeBelgeTipKodu_arasi(e)
		await this.xmlDuzenle_belgeTipKodu(e)
		await this.xmlDuzenle_bakiye(e)
		await this.xmlDuzenle_notes_ilk(e)
		await this.xmlDuzenle_notes(e)
		await this.xmlDuzenle_notes_son(e)
		await this.xmlDuzenle_doviz(e)
		// !! xsltDuzenleyiciEkle kullanan her yer bundan önce çağırılmalı
		await this.xmlDuzenle_detaylarOncesi(e)
		await this.xmlDuzenle_detaylar(e)
		xw.writeEndElement()
	}
	async xmlDuzenle_rootElement(e) {
		await this.xmlDuzenle_rootElement_ilk(e)
		await this.xmlDuzenle_rootElement_ara(e)
		await this.xmlDuzenle_rootElement_son(e)
	}
	xmlDuzenle_rootElement_ilk({ xw }) {
		let { xmlTipBelirtec: belirtec } = this.class
		xw.writeAttributeString('xmlns', `urn:oasis:names:specification:ubl:schema:xsd:${belirtec}-2`)
	}
	xmlDuzenle_rootElement_ara({ xw }) {
		xw.writeAttributes({
			'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
			'xmlns:xades': 'http://uri.etsi.org/01903/v1.3.2#',
			'xmlns:udt': 'urn:un:unece:uncefact:data:specification:UnqualifiedDataTypesSchemaModule:2',
			'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
			'xmlns:ccts': 'urn:un:unece:uncefact:documentation:2',
			'xmlns:ubltr': 'urn:oasis:names:specification:ubl:schema:xsd:TurkishCustomizationExtensionComponents',
			'xmlns:qdt': 'urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2',
			'xmlns:ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
			'xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
			'xmlns:sig': 'urn:oasis:names:specification:ubl:schema:xsd:CommonSignatureComponents-2',
			'xmlns:sac': 'urn:oasis:names:specification:ubl:schema:xsd:SignatureAggregateComponents-2',
			'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
		})
	}
	xmlDuzenle_rootElement_son({ xw }) {
		let { xmlTipBelirtec: belirtec, xml_ublVersionID: ublVer } = this.class
		xw.writeAttributeString('xsi:schemaLocation', `urn:oasis:names:specification:ubl:schema:xsd:${belirtec}-2 UBL-${belirtec}-${ublVer}.xsd`)
	}
	xmlDuzenle_ublExtensions({ xw }) {
		// İmza öncesi standart UBL imza kabı; gerçek ds:Signature imzalama servisinde eklenir.
		xw.writeElementBlock('ext:UBLExtensions', null, () =>
			xw.writeElementBlock('ext:UBLExtension', null, () =>
			xw.writeEmptyElement('ext:ExtensionContent')))
			/*xw.writeElementBlock('ext:ExtensionContent', null, () =>
			xw.writeElementBlock('sig:UBLDocumentSignatures', null, () =>
				xw.writeEmptyElement('sac:SignatureInformation')))))*/
	}
	xmlDuzenle_profileID_oncesi({ xw }) {
		let { xml_ublVersionID: verId, xml_customizationID: custId } = this.class
		xw.writeElements({
			'cbc:UBLVersionID': verId,
			'cbc:CustomizationID': custId
		})
	}
	async xmlDuzenle_profileID({ xw }) {
		let v = this.baslik._profileID = await this.xmlGetProfileID(...arguments)
		xw.writeElementString('cbc:ProfileID', v)
	}
	async xmlDuzenle_profileIDVeBelgeTipKodu_arasi({ xw }) {
		let { baslik, detaylar } = this
		let { fisNox, uuid, tarihStr, sevkTarihStr, sevkSaatStr, eYontem } = baslik
		xw.writeElements({
			'cbc:ID': fisNox,
			'cbc:CopyIndicator': false,
			'cbc:UUID': uuid,
			'cbc:IssueDate': tarihStr,
			'cbc:IssueTime': sevkSaatStr
		})
		await eYontem?.xmlDuzenle_profileIDVeBelgeTipKodu_arasi?.(...arguments)
	}
	async xmlDuzenle_belgeTipKodu({ xw }) {
		let { baslik, class: { xmlTipBelirtec: belirtec } } = this
		let v = baslik._belgeTipKod = this.xmlGetBelgeTipKodu(...arguments)
		xw.writeElementString(`cbc:${belirtec}TypeCode`, v)
	}
	async xmlDuzenle_notes_ilk({ xw }) {
		xw.writeElementString('cbc:Note', '')
	}
	async xmlDuzenle_notes({ xw }) {
		let { dipNotlar, class: { innovami } } = this
		/*if (empty(dipNotlar)) {    // en az 1 adet 'cbc:Note' olmalı
			xw.writeElementString('cbc:Note', '')
			return
		}*/
		for (let v of dipNotlar.filter(Boolean)) {
			if (!(v.startsWith('<span class="') || v.includes('bakiye"')))
				xw[innovami ? 'writeElementString' : 'writeElementCDATA']('cbc:Note', v)
		}
	}
	async xmlDuzenle_notes_son({ xw }) { }
	async xmlDuzenle_doviz(e) { }
	async xmlDuzenleInternal_doviz({ xw }) {
		let { dvKod } = this
		xw.writeElementString('cbc:DocumentCurrencyCode', dvKod, null, {
			'listAgencyName': 'United Nations Economic Commission for Europe',
			'listID': 'ISO 4217 Alpha', 'listName': 'Currency', 'listVersionID': '2001'
		})
	}
	async xmlDuzenle_detaylarOncesi(e) {
		await this.xmlDuzenle_lineCountNumeric(e)
		await this.xmlDuzenle_docRefs_oncesi(e)
		await this.xmlDuzenle_docRefs(e)
		await this.xmlDuzenle_docRefs_sonOncesi(e)
		await this.xmlDuzenle_docRefs_son(e)
		await this.xmlDuzenle_docRefs_sonrasi(e)
		await this.xmlDuzenle_signatureParty(e)
		await this.xmlDuzenle_supplierParty(e)
		await this.xmlDuzenle_customerParty(e)
		await this.xmlDuzenle_buyerCustomerParty(e)
		await this.xmlDuzenle_paymentMeans(e)
		await this.xmlDuzenle_allowanceCharge(e)
		await this.xmlDuzenle_dvKur(e)
		await this.xmlDuzenle_taxTotal(e)
		await this.xmlDuzenle_tevkifatli_taxTotal(e)
		await this.xmlDuzenle_legalMonetaryTotal(e)
	}
	async xmlDuzenle_lineCountNumeric({ xw }) {
		let { detaylar } = this
		xw.writeElementString('cbc:LineCountNumeric', detaylar.length)
	}
	// !! xsltDuzenleyiciEkle kullanan her yer bundan önce çağırılmalı
	async xmlDuzenle_docRefs(e) {
		let { xw } = e, { params } = app
		let { kullanim, kural } = params.eIslem
		let { baslik } = this
		let { _profileID, _belgeTipKod, eYontem, sevkTarihStr } = this.baslik
		if (!_belgeTipKod)
			_belgeTipKod = baslik._belgeTipKod = await this.xmlGetBelgeTipKodu(...arguments)
		
		await this.xmlDuzenle_xsltOncesi(e)    // !! mutlaka  xmlDuzenle_docRefs_xslt()  den önce çağırılmalıdır
		
		await this.xmlDuzenle_docRefs_ara(e)
		await this.xmlDuzenle_docRefs_eIslemEkBilgi(e)
		await this.xmlDuzenle_docRefs_yalnizYazisi(e)
		// await this.xmlDuzenle_docRefs_vioFisBilgi(e)

		await this.xmlDuzenle_docRefs_xslt(e)
	}
	async xmlDuzenle_xsltOncesi(e) {
		let { xw } = e, { params } = app
		let { zorunlu, stokGenel: { kullanim: { miktar2 } }, eIslem } = params
		let { kullanim, kural, goruntuOzelPunto } = eIslem
		let { eIrsaliyemi } = this.class
		let { satirBarkod, satirIskBedeli, satirKdv, satirDigerVergi } = kullanim
		let { baslik, dvKod, dvKur, dovizlimi } = this
		let { _profileID, _belgeTipKod, eYontem, sevkTarihStr, mustKod } = baslik
		if (!_belgeTipKod)
			_belgeTipKod = this.baslik._belgeTipKod = await this.xmlGetBelgeTipKodu(e)
		
		await this.xmlDuzenle_docRefs_ilk(e)
		
		// await this.xmlDuzenleInternal_docRefParam({ xw, name: 'MUKELLEF_KODU', value: '' })
		// await this.xmlDuzenleInternal_docRefParam({ xw, name: 'MUKELLEF_ADI', value: '' })
		// await this.xmlDuzenleInternal_docRefParam({ xw, name: 'DOSYA_NO', value: '' })
		// await this.xmlDuzenleInternal_docRefParam({ xw, name: 'IRSALIYE', value: '' })
		// await this.xmlDuzenleInternal_docRef({ xw, typeCode: name, id: value, type: '--' })

		if (dovizlimi)
			await this.xmlDuzenleInternal_docRefParam({ xw, name: 'DVKUR', value: `(${dvKod}) ${toStringWithFra(roundToBedelFra(abs(dvKur)))}` })
		if (sevkTarihStr && !eIrsaliyemi)
			await this.xmlDuzenleInternal_docRef({ xw, id: '0', tarih: sevkTarihStr, type: 'SEVK_TARIH' })

		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'FIYAT_FORMAT_STR', value: `##.##0,${'0'.repeat(zorunlu.fiyatFra || 5)}` })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'BEDEL_FORMAT_STR', value: `##.##0,${'0'.repeat(zorunlu.bedelFra || 2)}` })
		if (goruntuOzelPunto)
			await this.xmlDuzenleInternal_docRefParam({ xw, name: 'GENEL_PUNTO', value: goruntuOzelPunto })
		if (!eIrsaliyemi || dovizlimi)
			await this.xmlDuzenleInternal_docRefParam({ xw, name: 'DOVIZ_GOSTERIM_KURALI', value: kural.doviz.char ?? '' })
		//await this.xmlDuzenleInternal_docRefParam({ xw, name: 'FIYAT_GOSTERIM_KURALI', value: kural.fiyat.char ?? '' })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'ALICI_SAGDA', value: kullanim.gondericiAliciYanYana })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'KDV_SIFIR_GOSTERILIR', value: kullanim.kdv0DipteGosterilir })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'SATIRDA_BARKOD', value: (satirBarkod && !eYontem?.barkodReferansKaldir) ?? false })
		if (eIrsaliyemi && kullanim.satirEIrsKoli)
			await this.xmlDuzenleInternal_docRefParam({ xw, name: 'KOLI_GOSTERIM_KURALI', value: kural.koli.char })
		let miktar2Gosterilir = (miktar2 && kural.miktar.birliktemi || kural.miktar.fiyataEsasmi) ?? false
		if (eIrsaliyemi)
			miktar2Gosterilir &&= this.detaylar.some(det => !!det.eMiktarYapi?.miktar2)
		//await this.xmlDuzenleInternal_docRefParam({ xw, name: 'SATIRDA_MIKTAR2', value: miktar2Gosterilir })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'SATIRDA_ISKONTO_BEDELI', value: (satirIskBedeli && !kural.fiyat.netmi) ?? false })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'SATIRDA_KDV', value: satirKdv ?? false })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'SATIRDA_DIGER_VERGILER', value: satirDigerVergi ?? false })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'DIPTE_VERGILER_DAHIL_TOPLAM_TUTAR', value: _belgeTipKod != 'ISTISNA' && (!eIrsaliyemi || !!kullanim.irsDetayBedel) })
		
		if (kullanim.baslikMusteriKod)
			await this.xmlDuzenleInternal_docRefParam({ xw, name: 'MUSTERI_KOD', value: mustKod })
		
		await this.xmlDuzenle_docRefs_qrCode(e)
		await eYontem?.xmlDuzenle_xsltOncesi_ve_ozelDip_arasi?.(e)
				
		//await this.xmlDuzenle_bakiye(e)
		await this.xmlDuzenle_ozelDip(e)

		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'QRCODE_GOMULUMU', value: true })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'KOYU_DIZAYN', value: kullanim.koyuCikti })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'FIRMA_LOGO_USTTE', value: kullanim.firmaLogoUstte })
	}
	async xmlDuzenle_docRefs_oncesi(e) {
		let { eYontem } = this.baslik
		await eYontem?.xmlDuzenle_docRefs_oncesi?.(e)
	}
	async xmlDuzenle_docRefs_ilk(e) {
		let { eYontem } = this.baslik
		await eYontem?.xmlDuzenle_docRefs?.(e)
		await this.xmlDuzenleInternal_logoBilgileri(e)
	}
	async xmlDuzenle_docRefs_ara({ xw }) {
		let { eYontem } = this.baslik
		await eYontem?.xmlDuzenle_docRefs_ara?.(e)
	}
	async xmlDuzenle_docRefs_sonOncesi({ xw }) { }
	async xmlDuzenle_docRefs_son({ xw }) {
		let { eYontem } = this.baslik
		await eYontem?.xmlDuzenle_docRefs_son?.(e)
	}
	async xmlDuzenle_docRefs_sonrasi(e) {
		let { eYontem } = this.baslik
		await eYontem?.xmlDuzenle_docRefs_sonrasi?.(e)
	}
	async xmlDuzenleInternal_logoBilgileri({ xw }) {
		let { params: { eIslem = {} } } = app
		let logocu = await eIslem.getLogoData()
		if (!logocu)
			return

		let { eFaturami, eArsivmi, eIrsaliyemi, eMustahsilmi } = this.class
		let { logoKullanilir, eFatIcinIslakImza } = eIslem.kullanim
		
		let k2t = {
			RLOGO: 'FIRMALOGO_IMG',
			EFIM: 'ISLAKIMZA_IMG',
			EFKI: 'KASE_IMG'
		}
		if (logoKullanilir === false)
			delete k2t.RLOGO
		if ((eFaturami || eIrsaliyemi) && eFatIcinIslakImza === false)
			delete k2t.EFIM
		
		for (let [kod, type] of entries(k2t)) {
			let { data: imgData, ext, mimeType } = logocu[kod] ?? {}
			if (!imgData)
				continue
			
			mimeType ||= (
				ext == 'png' ? 'image/png' :
				ext == 'gif' ? 'image/gif' :
				'image/jpeg'
			)

			let args = { type, imgData }
			await this.xsltDuzenleyiciEkle({
				args,
				handler: ({ args: { type }, result: res }) =>
					res.replaceAll(`[${type}]`, `data:${mimeType};base64,${imgData}`)
			})
			await this.xmlDuzenleInternal_docRef({
				xw, id: '0', type,
				typeCode: 'dynamic'
			})
			//this.xmlDuzenleInternal_docRef({ xw, id: '0', type, attachment: { mimeType, imgData } })
		}
	}
	async xmlDuzenle_docRefs_qrCode({ xw }) {
		/*try { temp1 = (await app.wsWebRequest({ args: { method: 'GET', url: `https://localhost:90/skyerp/images/bird_mini.png` } }))?.data?.binary }
			catch (ex) { console.error(getErrorText(ex)) }
			$(`<img width="200" height="200" src="data:image/png;base64,${temp1}"/>`).prependTo(app.content) */
		let { baslik, dvKur, bedelSelector, currencyID, gondericiBilgi, aliciBilgi } = this
		let icmal = this.icmalYoksaOlustur()
		let { brutBedelYapi, vergiDahilToplamYapi, sonucBedelYapi } = icmal
		
		let kdvOran2MatrahVeBedel = {}
		for (let oran2VergiRecs of values(icmal.vergiTip2Oran2EVergiRecs_tevkifatsiz))
		for (let oran in oran2VergiRecs)
		for (let eRec of oran2VergiRecs[oran].filter(r => !r.kdvmi)) {
			kdvOran2MatrahVeBedel[oran] = {
				matrah: eRec.getMatrahYapi({ dvKur })[bedelSelector],
				bedel: eRec.bedelYapi[bedelSelector]
			}
		}
		
		let data = {
			vkntckn: gondericiBilgi.vknTckn,
			avkntckn: aliciBilgi.vknTckn,
			senaryo: baslik._profileID,
			tip: baslik._belgeTipKod,
			tarih: asReverseDateString(baslik.tarih),
			no: baslik.fisNox,
			ettn: baslik.uuid,
			parabirimi: currencyID,
			malhizmettoplam: toFileStringWithFra(brutBedelYapi[bedelSelector], 2),
			vergidahil: toFileStringWithFra(vergiDahilToplamYapi[bedelSelector], 2),
			odenecek: toFileStringWithFra(sonucBedelYapi[bedelSelector], 2)
		}
		for (let oran in kdvOran2MatrahVeBedel) {
			let { matrah, bedel } = kdvOran2MatrahVeBedel[oran]
			data[`kdvmatrah(${oran})`] = toFileStringWithFra(matrah, 2)
			data[`hesaplanankdv(${oran})`] = toFileStringWithFra(bedel || 0, 2)
		}
		
		await this.xmlDuzenle_docRefs_qrCode_ortak({
			...arguments[0],
			type: 'KAREKOD_IMG', data
		})
	}
	async xmlDuzenle_docRefs_qrCode_alt({ xw, data }) {
		await this.xmlDuzenle_docRefs_qrCode_ortak({
			...arguments[0],
			type: 'KAREKOD_IMG_ALT', data
		})
	}
	async xmlDuzenle_docRefs_qrCode_ortak({ xw, type, data: qrData }) {
		let format = 'jpg'
		let encodedQRData = isObject(qrData) ? toJSONStr(qrData) : qrData?.toString()
		if (!encodedQRData)
			return
		
		let imgData
		try {
			let { imageURL, mimeType } = new QRGenerator().qrDraw(qrData, format) ?? {}
			imgData = await imageURL
			if (!imgData)
				throw { isError: true, rc: 'noImgData' }
			/*if (imgData) { imgData = imgData.split(',', 2)[1] || imgData }*/
		}
		catch (_ex) {
			let mimeExt = format == 'jpg' ? 'jpeg' : format
			let mimeType = `image/${mimeExt}`
			try {
				let qrURL = (
					`https://api.qrserver.com/v1/create-qr-code/` +
					`?charset-source=utf-8&ecc=L` +
					`&size=180x180&qzone=1` +
					`&format=${format}&data=${encodedQRData}`
				)
				let args = { method: 'GET', url: qrURL, output: 'binary' }
				let base64Data = (await app.wsWebRequest({ args }))?.data?.binary
				imgData = `data:${mimeType};base64,${base64Data}`
			}
			catch (ex) { console.error(getErrorText(ex))}
		}
		
		if (imgData) {
			await this.xsltDuzenleyiciEkle({
				args: { type, imgData },
				handler: ({ result, args: { type, imgData } }) => 
					result.replaceAll(`[${type}]`, imgData)
			})
			await this.xmlDuzenleInternal_docRef({ xw, id: '1', type, typeCode: 'dynamic' })
			//-- iptal --  this.xmlDuzenleInternal_docRef({ xw, id: '0', type, attachment: { mimeType, value: imgData, fileName: `${type}.png` } })
		}
		else
			await this.xmlDuzenleInternal_docRef({ xw, id: '1', typeCode: qrURL, type })
	}
	async xmlDuzenle_bakiye({ xw }) { }
	async xmlDuzenle_docRefs_eIslemEkBilgi({ xw }) {
		// type: 'UST_BILGI', desc: 'içerik'
		let { class: { efami, innovami, eIrsaliyemi }, temps: { eIslemKod2Bilgi } } = this
		if (!eIslemKod2Bilgi)
			return
		
		let donusum = {
			SAL: 'ALT_BILGI', SUS: 'UST_BILGI',
			STS: 'BODY_SON', STB: 'BODY_BAS',
			STC: 'CSS', STH: 'HTML_HEAD',
			// ETC: e-Ticaret Dip Not
		}
		if (efami)
			donusum.BHT = 'BANKA_HTML_BILGI'
		
		let noEscape = true
		let cdata = !innovami
		for (let [kod, type] of entries(donusum)) {
			let desc = eIslemKod2Bilgi[kod]
			if (desc) {
				desc = turkcesiz(
					desc
						.replaceAll('<', '[lt]')
						.replaceAll('>', '[gt]')
						.replaceAll('\r', '')
						.replaceAll('\n', '')
				)
				await this.xmlDuzenleInternal_docRef({
					xw,
					id: eIrsaliyemi ? '.' : '0',
					typeCode: eIrsaliyemi ? '.' : undefined,
					type, desc, noEscape, cdata
				})
			}
		}
	}
	async xmlDuzenle_ozelDip({ xw }) {
		let { baslik, temps, class: { tip: eIslTip } } = this
		let { mustKod } = baslik, { kod2OzelDip } = temps
		if (empty(kod2OzelDip))
			return

		let html = values(kod2OzelDip)
			.filter(r => r.mustKod == mustKod && r.uygunluk[eIslTip])
			.map(r => r.html)
			.join('')
		if (!html)
			return

		let desc = turkcesiz(html).replaceAll('<', '[lt]').replaceAll('>', '[gt]')
		await this.xmlDuzenleInternal_docRef({ xw, id: '.', typeCode: '.', type: 'ALT_BILGI', desc })
	}
	async xmlDuzenle_docRefs_vioFisBilgi({ xw }) {
		let { baslik: { _: baslik }, detaylar, baslik: { uuid } } = this
		detaylar = detaylar.map(det => det._)
		let rec = { baslik, detaylar }
		let value = Base64.encode(toJSONStr(rec))
		let mimeType = 'text/plain'
		let id = 4, type = 'VIO_FISBILGI', fileName = `${type}.json`
		await this.xmlDuzenleInternal_docRef({
			xw, id, type,
			attachment: { mimeType, value, fileName }
		})
	}
	async xmlDuzenle_docRefs_yalnizYazisi(e) { }

	async xmlDuzenle_docRefs_xslt({ xw }) {
		let e = { ...arguments[0] }
		let value = await this.getXsltBase64(e)
		if (!value)
			throw { isError: true, rc: 'emptyXslt', errorText: 'e-İşlem XML oluşturma için <b>XSLT Bilgisi</b> belirlenemedi' }
		
		let { uuid: id, fisNox } = this.baslik
		let type = 'XSLT', mimeCode = 'application/xml'
		let attachment = { mimeCode, fileName: `${fisNox}.xslt`, value }
		await this.xmlDuzenleInternal_docRef({ xw, id, type, typeCode: null, attachment })
	}
	
	xmlDuzenle_digitalSignatureAttachment({ xw }) {
		xw.writeElementBlock('cac:DigitalSignatureAttachment', null, () =>
			xw.writeElementBlock('cac:ExternalReference', null, () =>
				xw.writeElementString('cbc:URI', '#SignatureId')))
	}
	async xmlDuzenle_signatureParty({ xw }) {
		let e = arguments[0]
		let { gondericiBilgi: source } = this
		xw.writeElementBlock('cac:Signature', null, () => {
			let { vknTckn } = source
			if (vknTckn)
				xw.writeElementString('cbc:ID', vknTckn, null, { schemeID: 'VKN_TCKN' })
			xw.writeElementBlock('cac:SignatoryParty', null, () =>
				this.xmlDuzenle_partyOrtak({ ...e, source, signaturePartymi: true }))
			this.xmlDuzenle_digitalSignatureAttachment(e)
		})
	}
	async xmlDuzenle_supplierParty(e) {
		let { xw } = e
		let { gondericiBilgi: source, class: { xmlTagPF_senderParty } } = this
		xw.writeElementBlock(`cac:${xmlTagPF_senderParty}`, null, () =>
		xw.writeElementBlock('cac:Party', null, () =>
			this.xmlDuzenle_partyOrtak({ ...e, source, supplierPartymi: true })))
	}
	async xmlDuzenle_customerParty(e) {
		let { xw } = e
		let { aliciBilgi: source, class: { xmlTagPF_receiverParty } } = this
		xw.writeElementBlock(`cac:${xmlTagPF_receiverParty}`, null, () =>
		xw.writeElementBlock('cac:Party', null, () =>
			this.xmlDuzenle_partyOrtak({ ...e, source, customerPartymi: true })))
	}
	async xmlDuzenle_buyerCustomerParty(e) {
		// KAMU için eklenti lazım ??
		let { xw } = e
		let { baslik, aliciBilgi: source, class: { xmlTagPF_buyerParty } } = this
		let { kamumu } = baslik
		if (kamumu) {
			xw.writeElementBlock(`cac:${xmlTagPF_buyerParty}`, null, () =>
			xw.writeElementBlock('cac:Party', null, () =>
				this.xmlDuzenle_partyOrtak({ ...e, source, buyerPartymi: true })))
		}
	}
	xmlDuzenle_partyOrtak({ xw, source, signaturePartymi, customerPartymi, supplierPartymi, buyerPartymi }) {
		let { baslik, aliciBilgi, class: { ihracatmi, eIrsaliyemi } } = this
		let alicimi = source == aliciBilgi
		let { sahismi, tckn, vkn, unvan, yore, posta, ilKod, ilAdi, ulkeAdi, webURL } = source
		let { vergiDairesi, adres, tel1, fax, eMail, ticSicilNo, mersisNo, adi, soyadi } = source
		let { eYontem, sevkYerKod } = baslik
		
		let writePartyIdent = (value, schemeID) => {
			if (value) {
				xw.writeElementBlock('cac:PartyIdentification', null, () =>
					xw.writeElementString('cbc:ID', value, null, { schemeID }))
			}
		}
		
		// if (eIrsaliyemi || (!signaturePartymi && webURL))
		if (eIrsaliyemi || (!signaturePartymi || webURL))
			xw.writeElementString('cbc:WebsiteURI', webURL || '')
		
		if (sahismi)
			writePartyIdent(tckn, 'TCKN')
		else
			writePartyIdent(vkn, 'VKN')
		
		writePartyIdent(ticSicilNo, 'TICARETSICILNO')
		writePartyIdent(mersisNo, 'MERSISNO')
		if (sevkYerKod && eYontem?.lezitami)
			writePartyIdent(sevkYerKod, 'MUSTERINO')

		if (!signaturePartymi) {
			xw.writeElementBlock('cac:PartyName', null, () =>
				xw.writeElementString('cbc:Name', unvan || ''))
		}
		
		xw.writeElementBlock('cac:PostalAddress', null, () => {
			xw.writeElements({
				'cbc:Room': eIrsaliyemi && alicimi ? '' : 0, 'cbc:StreetName': adres || '.',
				'cbc:BuildingName': eIrsaliyemi ? '' : '.', 'cbc:BuildingNumber': 0,
				'cbc:CitySubdivisionName': yore || '.',
				'cbc:CityName': ilAdi || '.',
				'cbc:PostalZone': normalizePostaKod(posta, ilKod, ihracatmi),
				'cbc:Region': eIrsaliyemi && alicimi ? '' : '.'
			})
			if (sevkYerKod && (customerPartymi || buyerPartymi)) {
				let { kod2Adi: k2a = {} } = MQSevkAdres.globals ?? {}
				xw.writeElementString('cbc:District', k2a[sevkYerKod] ?? sevkYerKod)
			}
			xw.writeElementBlock('cac:Country', null, () =>
				xw.writeElementString('cbc:Name', ulkeAdi || 'Türkiye'))
		})

		if (!signaturePartymi) {
			xw.writeElementBlock('cac:PartyTaxScheme', null, () =>
				xw.writeElementBlock('cac:TaxScheme', null, () =>
				xw.writeElementString('cbc:Name', vergiDairesi || '.'))
			)
			xw.writeElementBlock('cac:Contact', null, () =>
				xw.writeElements({
					'cbc:Telephone': tel1,
					'cbc:Telefax': fax,
					'cbc:ElectronicMail': eMail
				})
			)
			
			if (sahismi && unvan) {
				xw.writeElementBlock('cac:Person', null, () => {
					if (!adi) {
						let tokens = unvan.split(' ');
						adi = tokens.slice(0, -1).join(' ').trim()
						soyadi = tokens.at(-1).trim()
					}
					xw.writeElements({
						'cbc:FirstName': adi || '.',
						'cbc:FamilyName': soyadi || '.'
					})
				})
			}
		}
	}
	async xmlDuzenle_paymentMeans({ xw }) { }
	async xmlDuzenle_allowanceCharge(e) { }
	async xmlDuzenle_dvKur(e) { }
	async xmlDuzenleInternal_dvKur({ xw, dvKod, dvKur }) {
		let { class: { currCode_tl: hedefDvKod } } = this
		xw.writeElementBlock('cac:PricingExchangeRate', null, () =>
			xw.writeElements({
				'cbc:SourceCurrencyCode': dvKod,
				'cbc:TargetCurrencyCode': hedefDvKod,
				'cbc:CalculationRate': toFileStringWithFra(dvKur, 6)
			})
		)
	}
	xmlDuzenle_taxTotal(e) { }
	xmlDuzenle_tevkifatli_taxTotal(e) { }
	xmlDuzenle_legalMonetaryTotal(e) { }
	async xmlDuzenle_detaylar(e) {
		let { detaylar } = this
		for (let i = 0; i < detaylar.length; i++) {
			let seq = i + 1
			let detay = detaylar[i]
			await this.xmlDuzenle_detay({ ...e, seq, detay })
		}
	}
	async xmlDuzenle_detay({ xw }) {
		let { xmlDetayTag } = this.class
		xw.writeStartElement(xmlDetayTag)
		await this.xmlDuzenle_detayDevam(...arguments)
		xw.writeEndElement()
	}
	async xmlDuzenle_detayDevam(e) {
		await this.xmlDuzenle_detayDevam_id(e)
		await this.xmlDuzenle_detayDevam_notes(e)
		await this.xmlDuzenle_detayDevam_item_additionalItemIds(e)
		await this.xmlDuzenle_detayDevam_miktar(e)
		await this.xmlDuzenle_detayDevam_bedel(e)
		await this.xmlDuzenle_detayDevam_allowanceCharge(e)
		await this.xmlDuzenle_detayDevam_taxTotal(e)
		await this.xmlDuzenle_detayDevam_tevkifatli_taxTotal(e)
		await this.xmlDuzenle_detayDevam_siparisSatirBaglantisi(e)
		await this.xmlDuzenle_detayDevam_item(e)
		await this.xmlDuzenle_detayDevam_fiyat(e)
	}
	xmlDuzenle_detayDevam_id({ xw, seq }) {
		xw.writeElementString('cbc:ID', seq)
	}
	xmlDuzenle_detayDevam_notes({ xw, detay: det }) {
		let { class: { innovami } } = this
		let { eIslem: { kural = {} } = {} } = app.params
		let { aciklama: kuralAciklama, aciklamaKapsam: kapsam } = kural
		
		let hasNote = false
		if ((kapsam.sadeceAciklamami || kapsam.hepsimi) && !kuralAciklama.hepsiDiptemi) {
			let { aciklamalar } = det
			if (!empty(aciklamalar)) {
				for (let value of aciklamalar) {
					if (value)
						xw[innovami ? 'writeElementString' : 'writeElementCDATA']('cbc:Note', escapeXML(value))
				}
				hasNote = true
			}
		}
		if (!hasNote)
			xw.writeElementString('cbc:Note', '')
	}
	async xmlDuzenle_detayDevam_miktar(e) { }
	async xmlDuzenle_detayDevam_bedel({ xw, detay: det }) {
		let { dovizlimi, xattrYapi_bedel } = this
		let value = await det.getSonucBedel({ dovizlimi })
		xw.writeElementString('cbc:LineExtensionAmount', toFileStringWithFra(value, 2), null, xattrYapi_bedel)
	}
	async xmlDuzenle_detayDevam_allowanceCharge(e) { }
	async xmlDuzenle_detayDevam_taxTotal(e) { }
	async xmlDuzenle_detayDevam_tevkifatli_taxTotal(e) { }
	async xmlDuzenle_detayDevam_siparisSatirBaglantisi(e) { }
	async xmlDuzenle_detayDevam_item({ detay: det, xw }) {
		let e = arguments[0]
		xw.writeStartElement('cac:Item')
		await this.xmlDuzenle_detayDevam_item_description(e)
		await this.xmlDuzenle_detayDevam_item_name(e)
		await this.xmlDuzenle_detayDevam_item_buyersItemId(e)
		await this.xmlDuzenle_detayDevam_item_sellersItemId(e)
		await this.xmlDuzenle_detayDevam_item_manfacturersItemId(e)
		xw.writeEndElement()
	}
	async xmlDuzenle_detayDevam_item_description({ detay: det, xw }) {
		let { kural } = app.params.eIslem
		let kural_aciklama = kural?.aciklama
		let kural_kapsam = kural?.aciklamaKapsam
		if ((kural_kapsam.sadeceAciklamami || kural_kapsam.hepsimi) && !kural_aciklama.hepsiDiptemi) {
			let { ekAciklama: value } = det
			if (value)
				xw.writeElementString('cbc:Description', escapeXML(value))
		}
	}
	async xmlDuzenle_detayDevam_item_name({ detay: det, xw }) {
		xw.writeElementString('cbc:Name', escapeXML(det.adiGosterim))
	}
	async xmlDuzenle_detayDevam_item_buyersItemId({ detay: det, xw }) {
		let { revizeRefKod: v, kodGosterim: d } = det
		if (v && v != d)
			await this.xmlDuzenleInternal_detXIdent({ xw, tagName: 'cac:BuyersItemIdentification', id: escapeXML(v) })
	}
	async xmlDuzenle_detayDevam_item_sellersItemId({ detay: det, xw }) {
		let { kodGosterim: v } = det
		if (v)
			await this.xmlDuzenleInternal_detXIdent({ xw, tagName: 'cac:SellersItemIdentification', id: escapeXML(v) })
	}
	async xmlDuzenle_detayDevam_item_manfacturersItemId({ detay: det, xw }) {
		let { barkodGosterim: v, kodGosterim: d } = det
		if (v && v != d)
			await this.xmlDuzenleInternal_detXIdent({ xw, tagName: 'cac:ManufacturersItemIdentification', id: escapeXML(v) })
	}
	async xmlDuzenle_detayDevam_item_additionalItemIds({ detay: det, xw }) {
		let e = arguments[0]
		await this.xmlDuzenleInternal_detAdditionalIdent({ xw, id: det.shKod, schemeID: 'VIO_SHKOD' })
		await this.xmlDuzenleInternal_detAdditionalIdent({ xw, id: det.adiGosterim, schemeID: 'VIO_SHADI' })
		await this.xmlDuzenle_detayDevam_item_additionalItemIds_miktar2(e)
		await this.xmlDuzenle_detayDevam_item_additionalItemIds_netFiyat(e)
		await this.xmlDuzenle_detayDevam_item_additionalItemIds_ikGosterim(e)
	}
	async xmlDuzenle_detayDevam_item_additionalItemIds_miktar2(e) { }
	async xmlDuzenle_detayDevam_item_additionalItemIds_netFiyat(e) { }
	async xmlDuzenle_detayDevam_item_additionalItemIds_ikGosterim(e) { }
	async xmlDuzenle_detayDevam_fiyat(e) { }
	xmlDuzenleInternal_docRef(e) {
		let { baslik } = this
		let { id, xw, type, typeCode, ekIslem, noEscape, cdata } = e
		let { desc: aciklama = e.description ?? e.aciklama, attachment = e.att } = e
		let { tarih = e.date ?? e.issueDate } = e
		if (id == null || (typeof id == 'string' && !id.trim()))
			return this
		
		if (typeof id == 'boolean')
			id = id ? 'true' : 'false'
		
		if (typeCode !== null)
			typeCode ||= '0'
		
		if (aciklama && !(noEscape || cdata))
			aciklama = escapeXML(aciklama)
		
		aciklama ||= '.'
		let tarihStr = tarih ? asReverseDateString(asDate(tarih)) : baslik.tarihStr
		xw.writeStartElement('cac:AdditionalDocumentReference')
			xw.writeElementString('cbc:ID', id || '0')
			xw.writeElementString('cbc:IssueDate', tarihStr)
			if (typeCode)
				xw.writeElementString('cbc:DocumentTypeCode', typeCode || '')
			if (type)
				xw.writeElementString('cbc:DocumentType', type || '')
			xw[cdata && aciklama ? 'writeElementCDATA' : 'writeElementString']('cbc:DocumentDescription', aciklama || '.')
			if (attachment) {
				let encodingCode = 'Base64', characterSetCode = encoding_iso, value = attachment.value ?? attachment.data
				let mimeCode = attachment.type ?? attachment.contentType ?? attachment.mimeType ?? attachment.mimeCode
				let filename = attachment.fileName ?? attachment.filename ?? attachment.file ?? (type || typeCode || newGUID())
				xw.writeElementBlock('cac:Attachment', null, () =>
					xw.writeElementString('cbc:EmbeddedDocumentBinaryObject', value, null, { characterSetCode, encodingCode, filename, mimeCode }))
			}
			ekIslem?.call(this, e)
		xw.writeEndElement()
		return this
	}
	xmlDuzenleInternal_docRefParam({ xw, name, value }) {
		if (value !== false)
			this.xmlDuzenleInternal_docRef({ xw, typeCode: name, id: value, type: 'PARAM' })
		return this
	}
	xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name, value }) {
		if (value)
			this.xmlDuzenleInternal_docRef({ xw, typeCode: name, id: value, type: 'BASLIK_EKSAHA' })
		return this
	}
	/** !! burası artık cbc:Note bitimindedir ve cbc:Note olarak eklenecektir */
	xmlDuzenleInternal_detAdditionalIdent({ xw, schemeID: key, id: value }) {
		let text = `!#${key}=${value}`
		xw.writeElementString('cbc:Note', text)
		return this
		/*e.tagName = 'cac:AdditionalItemIdentification';
		let result = this.xmlDuzenleInternal_detXIdent(e)
		delete e.tagName
		return result*/
	}
	xmlDuzenleInternal_detXIdent({ xw, tagName, id, schemeID }) {
		let attrYapi = schemeID ? { schemeID } : null
		xw.writeStartElement(tagName)
		xw.writeElementString('cbc:ID', id, null, attrYapi)
		xw.writeEndElement()
		return this
	}
	async getXsltBase64(e) {
		e ??= {}
		let result = await this.getXslt(e)
		if (result)
			result = Base64.encode(result)
		return result
	}
	async getXslt(e = {}) {
		let { temps = this.temps } = e
		let result = await temps.eIslemXSLT
		if (result) {
			extend(e, { islem: 'xslt', result })
			await this.xsltDuzenle(e)
			result = this.xsltData = e.result
			try {
				await this.execEIslemScript(e)
				result = this.xsltData = e.result
			}
			catch (ex) { console.error(ex) }
			for (let key of ['islem', 'result'])
				delete e[key]
		}
		return result
	}
	async xsltDuzenle(e) {
		let { islem, result } = e
		let { xsltDuzenleyiciler } = this
		result = e.result = result
			?.replace(/Sevk Tarih\s*\/\s*Saat:/g, 'Düzenleme Zamanı:')
			?.replace('POLEN YAZILIM - VİO TİCARİ', 'SKYLOG YAZILIM - SkyERP')
		
		if (xsltDuzenleyiciler) {
			for (let item of xsltDuzenleyiciler) {
				let { handler, args } = item ?? {}
				if (!handler)
					continue
				
				if (args != null)
					e.args = args
				
				let _result = await handler.call(this, e)
				if (result != null) {
					if (_result === true)
						continue
					if (_result === false)
						break
					result = e.result = _result
				}
			}
		}
	}
	async execEIslemScript(e = {}) {
		let {temps = this.temps} = e
		let result = await temps.eIslemScript
		let func = result ? eval(result) : null
		result = undefined
		if (isFunction(func) || func?.run) {
			e.sender = this
			result = await getFuncValue.call(this, func, e)
			delete e.sender
		}
		return result
	}
	xsltDuzenleyiciEkle(e, _args) {
		if (!e)
			return this
		if (!e.handler)
			e = { handler: e, args: _args }
		this.xsltDuzenleyiciler.push(e)
		return this
	}
	xsltDuzenleyicilerReset() {
		this.xsltDuzenleyiciler = []
		return this
	}
}
