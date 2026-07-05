class EIslemOrtak extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
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
	get temps() { return this._temps } get shared() { return this._shared }
	static get currCode_tl() { return 'TRY' } /* get xsltBelirtec() { return 'EIslemOrtak' } */
	get xsltBelirtec() { return 'EIslemOrtak' } get xsltDosyaAdi() { return `${this.xsltBelirtec}Gosterim.xslt` }
	static get xmlRootTag() { return null } static get xmlDetayTag() { return null }
	static get xml_ublVersionID() { return '2.1' } static get xml_customizationID() { return 'TR1.2' }
	get dovizlimi() { return this.baslik.dovizlimi } get dvKod() { return this.baslik.dvKod } get dvKur() { return this.baslik.dvkur }
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
	get aliciBilgi() { return this.baslik.aliciBilgi }
	get gondericiGIBAlias() { return this.eConf.getValue('gibAlias') } get aliciGIBAlias() { return this.baslik.gibAlias }
	static get innovami() { return app.params.eIslem.ozelEntegrator.innovami }
	get innovami() { return this.class.innovami }
	
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
	static getAnaClass(e = {}) {
		let anaTip = typeof e == 'object' ? e.anaTip : e
		let cls = anaTip ? this.anaTip2Sinif[anaTip] ?? cls : EIslemOrtak
		return cls
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
	static getUUIDStm(e) { return null }
	static getEFisBaslikVeDetayStm() { return null }
	baslikVeDetaylariYukle(e) {
		let {baslik, detaylar, temps, shared} = e, {detaylar: thisDetaylar} = this
		for (let inst of [this, baslik, ...detaylar]) {
			inst._temps = temps
			inst._shared = shared
		}
		this.baslik = baslik
		thisDetaylar.splice(0)
		thisDetaylar.push(...detaylar)
		return this
	}
	static async tipIcinFislerEkDuzenlemeYap({ ps2Sayac2EFis } = {}) {
		let e = arguments[0] ?? {}
		let promises = e.promises = []
		let yukleIslemi = e.yukleIslemi = async _e => {
			_e = { ...e, ..._e }
			let stm = _e.stm = getFuncValue.call(this, _e.stm, _e)
			if (!stm)
				return this
			let {seviyelendirici, yukleyici} = _e
			let recs = _e.recs = await app.sqlExecSelect(stm)
			let sevRecs = seviyelendirici ? _e.sevRecs = getFuncValue.call(this, seviyelendirici, _e) : null
			let _recs = _e.recs = (sevRecs ?? recs)
			for (let sev of _recs) {
				let rec = _e.rec = sev.orjBilgi ?? sev, {pstip: psTip, fissayac: sayac} = rec
				_e.detaylar = sev.detaylar
				let sayac2EFis = _e.sayac2EFis = ps2Sayac2EFis[psTip] ?? values(ps2Sayac2EFis)[0]
				let eFis = sayac2EFis[sayac]
				if (!eFis)
					eFis = values(sayac2EFis)[0]
				_e.eFis = eFis
				await getFuncValue.call(this, yukleyici, _e)
			}
			return this
		}
		await this.tipIcinFislerEkDuzenlemeYapDevam(e)
		if (promises?.length)
			await Promise.all(promises)
	}
	static tipIcinFislerEkDuzenlemeYapDevam({ yukleIslemi, promises }) {
		promises.push(
			yukleIslemi({
				stm: e => this.getEIslemBilgiStm(e),
				yukleyici: e => this.eIslemBilgiYukle({ ...e }),
				seviyelendirici: ({ recs: source }) =>
					seviyelendir({ source, attrListe: ['kod'] })
			})
		)
	}
	static getEIslemBilgiStm(e) {
		let sent = new MQSent(), {where: wh, sahalar} = sent
		sent.fisHareket('progbuyukdata', 'progbuyukdatadetay')
		wh.degerAta('EF', 'fis.tip').degerAta('EKB', 'fis.alttip')
		sahalar.add('fis.kod', 'har.seq', 'har.xdata')
		let orderBy = ['kod', 'seq']
		return new MQStm({ sent, orderBy })
	}
	static eIslemBilgiYukle({ sevRecs, temps }) {
		let result = temps.eIslemKod2Bilgi = {}
		for (let sev of sevRecs) {
			let {orjBilgi: { kod }, detaylar} = sev
			let xdata = detaylar.map(_ => _.xdata).join('')
			let data = xdata ? new TextDecoder(encoding_iso).decode(Base64.toUint8Array(xdata)) : data
			if (data)
				result[kod] = data
		}
	}
	icmalYoksaOlustur(e) {
		return this.icmal ??= new EIcmal(e)
	}
	async onKontrol(e) {
		let err = errorTextsAsObject({ errors: await this.onKontrolMesajlar(e) })
		if (err)
			throw err
		
		let { baslik, detaylar, class: { efami } } = this
		if (efami)
			await this.onKontrol_efa(e)
		
		for (let item of [baslik, detaylar]) {
			if (item?.onKontrol)
				await item?.onKontrol(e)
		}
		
		return this
	}
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
		let {xsltBelirtec, baslik, temps, temps: { eIslemXSLT, eIslemScript }} = this
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
			baslik.uuid = baslik.zorunluguidstr || newGUID()
			uuidOlustumu = true
		}
		let xw = e.xw = new XMLWriter()
		xw.writeStartDocument()
		await this.xmlDuzenle(e)
		xw = e.xw; xw.writeEndDocument()
		/* delete e.xw; */
		let result = xw.flush()
		$.extend(e, { islem: 'xml', result })
		try {
			await this.execEIslemScript(e)
			result = e.result
			if (result)
				xw = e.xw = result
		}
		catch (ex) { console.error(ex) }
		for (let key of ['islem', 'result'])
			delete e[key]
		if (uuidOlustumu) {
			let {updCallback} = e; delete e.updCallback
			let query = e.query = new MQIliskiliUpdate({
				from: baslik.fisTable, where: { degerAta: baslik.fissayac, saha: 'kaysayac'},
				set: [{ degerAta: baslik.uuid, saha: 'efatuuid' }, { degerAta: now(), saha: 'efimzats' }]
			})
			if (updCallback)
				await updCallback.call(this, e)
			else
				await app.sqlExecNone({ query })
		}
		return result
	}
	async xmlDuzenle({ xw }) {
		let e = arguments[0], {class: { xmlRootTag }} = this
		xw.writeStartElement(xmlRootTag)
		await this.xmlDuzenle_rootElement(e)
		await this.xmlDuzenle_ublExtensions(e)
		await this.xmlDuzenle_profileID_oncesi(e)
		await this.xmlDuzenle_profileID(e)
		await this.xmlDuzenle_profileIDVeBelgeTipKodu_arasi(e)
		await this.xmlDuzenle_belgeTipKodu(e)
		await this.xmlDuzenle_notes(e)
		await this.xmlDuzenle_doviz(e)
		await this.xmlDuzenle_detaylarOncesi(e)
		await this.xmlDuzenle_detaylar(e)
		xw.writeEndElement()
	}
	xmlDuzenle_rootElement(e) {
		this.xmlDuzenle_rootElement_ilk(e)
		this.xmlDuzenle_rootElement_ara(e)
		this.xmlDuzenle_rootElement_son(e)
	}
	xmlDuzenle_rootElement_ilk(e) { }
	xmlDuzenle_rootElement_ara(e) {
		let {xw} = e; xw.writeAttributes({
			'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
			'xmlns:xades': 'http://uri.etsi.org/01903/v1.3.2#',
			'xmlns:udt': 'urn:un:unece:uncefact:data:specification:UnqualifiedDataTypesSchemaModule:2',
			'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
			'xmlns:ccts': 'urn:un:unece:uncefact:documentation:2',
			'xmlns:ubltr': 'urn:oasis:names:specification:ubl:schema:xsd:TurkishCustomizationExtensionComponents',
			'xmlns:qdt': 'urn:oasis:names:specification:ubl:schema:xsd:QualifiedDatatypes-2',
			'xmlns:ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
			'xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
			'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
		})
	}
	xmlDuzenle_rootElement_son(e) { }
	xmlDuzenle_ublExtensions({ xw }) {
		xw.writeElementBlock('ext:UBLExtensions', null, () =>
			xw.writeElementBlock('ext:UBLExtension', null, () =>
				xw.writeEmptyElement('ext:ExtensionContent'))
		)
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
	xmlDuzenle_profileIDVeBelgeTipKodu_arasi({ xw }) {
		let { baslik, detaylar } = this
		let { fisnox: fisNox, uuid, tarihStr, sevkTarihStr, sevkSaatStr } = baslik
		xw.writeElements({
			'cbc:ID': fisNox,
			'cbc:CopyIndicator': false,
			'cbc:UUID': uuid,
			'cbc:IssueDate': tarihStr,
			'cbc:IssueTime': sevkSaatStr
		})
	}
	xmlDuzenle_belgeTipKodu(e) { }
	xmlDuzenle_notes({ xw }) {
		let { dipNotlar } = this
		if (empty(dipNotlar)) {    // en az 1 adet 'cbc:Note' olmalı
			xw.writeElementString('cbc:Note', '')
			return
		}
		
		for (let value of dipNotlar) {
			if (!(value && value.startsWith('<span class="') && value.includes('bakiye"')))
				xw.writeElementString('cbc:Note', value)
		}
	}
	xmlDuzenle_doviz(e) { }
	xmlDuzenleInternal_doviz({ xw }) {
		let { dvKod } = this
		xw.writeElementString('cbc:DocumentCurrencyCode', dvKod, null, {
			'listAgencyName': 'United Nations Economic Commission for Europe',
			'listID': 'ISO 4217 Alpha', 'listName': 'Currency', 'listVersionID': '2001'
		})
	}
	async xmlDuzenle_detaylarOncesi(e) {
		await this.xmlDuzenle_lineCountNumeric(e)
		await this.xmlDuzenle_docRefs(e)
		await this.xmlDuzenle_docRefs_son(e)
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
	xmlDuzenle_lineCountNumeric({ xw }) {
		let { detaylar } = this
		xw.writeElementString('cbc:LineCountNumeric', detaylar.length)
	}
	async xmlDuzenle_docRefs({ xw }) {
		let e = arguments[0]
		let { params } = app
		let { zorunlu, isyeri, stokGenel: stok, eIslem } = params
		let { kullanim, kural } = eIslem
		let { dipteVergilerDahilToplamTutar } = kullanim
		let { baslik, dvKod, dvKur, dovizlimi } = this
		let { _profileID, _belgeTipKod, eYontem, sevkTarihStr } = baslik
		if (!_belgeTipKod)
			_belgeTipKod = this.baslik._belgeTipKod = await this.xmlGetBelgeTipKodu(...arguments)
		
		await this.xmlDuzenle_docRefs_sgk(e)
		// await this.xmlDuzenleInternal_docRefParam({ xw, name: 'MUKELLEF_KODU', value: '' })
		// await this.xmlDuzenleInternal_docRefParam({ xw, name: 'MUKELLEF_ADI', value: '' })
		// await this.xmlDuzenleInternal_docRefParam({ xw, name: 'DOSYA_NO', value: '' })
		// await this.xmlDuzenleInternal_docRefParam({ xw, name: 'IRSALIYE', value: '' })
		// await this.xmlDuzenleInternal_docRef({ xw, typeCode: name, id: value, type: '--' })
		if (dovizlimi)
			await this.xmlDuzenleInternal_docRefParam({ xw, name: 'DVKUR', value: `(${dvKod}) ${toStringWithFra(roundToBedelFra(Math.abs(dvKur)))}` })
		if (sevkTarihStr)
			await this.xmlDuzenleInternal_docRef({ xw, id: '0', tarih: sevkTarihStr, type: 'SEVK_TARIH' })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'FIYAT_FORMAT_STR', value: `##.##0,${'0'.repeat(zorunlu.fiyatFra || 5)}` })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'BEDEL_FORMAT_STR', value: `##.##0,${'0'.repeat(zorunlu.bedelFra || 2)}` })
		if (eIslem.goruntuOzelPunto)
			await this.xmlDuzenleInternal_docRefParam({ xw, name: 'GENEL_PUNTO', value: eIslem.goruntuOzelPunto })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'SATIRDA_BARKOD', value: (kullanim.satirBarkod && !eYontem?.barkodReferansKaldir) ?? false })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'SATIRDA_MIKTAR2', value: (stok.miktar2 && kullanim.miktar.birliktemi) ?? false })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'SATIRDA_ISKONTO_BEDELI', value: (kullanim.satirIskBedeli && !kural.fiyat.netmi) ?? false })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'SATIRDA_KDV', value: kullanim.satirKdv ?? false })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'SATIRDA_DIGER_VERGILER', value: kullanim.satirDigerVergi ?? false })
		await this.xmlDuzenleInternal_docRefParam({
			xw, name: 'DIPTE_VERGILER_DAHIL_TOPLAM_TUTAR',
			value: _belgeTipKod != 'ISTISNA'
		})
		
		await this.xmlDuzenle_docRefs_qrCode(e)    // !! mutlaka  xmlDuzenle_docRefs_xslt()  den önce çağırılmalıdır
		await this.xmlDuzenle_docRefs_xslt(e)
		
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'FIYAT_GOSTERIM_KURALI', value: kural.fiyat.char ?? '' })
		// await this.xmlDuzenleInternal_docRefParam({ xw, name: 'KOLI_GOSTERIM_KURALI', value: kural.koli.char ?? '' })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'DOVIZ_GOSTERIM_KURALI', value: kural.doviz.char ?? '' })
		// await this.xmlDuzenleInternal_docRefParam({ xw, name: 'MIKTAR_GOSTERIM_KURALI', value: kural.miktar.char ?? '' })
		// await this.xmlDuzenleInternal_docRefParam({ xw, name: 'KOD_YERINE_SIRANO', value: kullanim.kodYerineSiraNo ?? false })
		// await this.xmlDuzenleInternal_docRefParam({ xw, name: 'SIPREF_GOSTERIM_KURALI', value: kural.sipRef.char ?? '' })
		// await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Fatura Ek Tipi', value: '' })
		// await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Plasiyer', value: '' })
		// await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Tahsil Şekli', value: 'Karma Tahsil' })
		// await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Nakliye Şekli', value: '' })
		// await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Tapdk No', value: '' })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'QRCODE_GOMULUMU', value: true })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'KOYU_DIZAYN', value: kullanim.koyuCikti })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'FIRMA_LOGO_USTTE', value: kullanim.firmaLogoUstte })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'ALICI_SAGDA', value: kullanim.gondericiAliciYanYana })
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'KDV_SIFIR_GOSTERILIR', value: kullanim.kdv0DipteGosterilir })
		await this.xmlDuzenle_docRefs_eIslemEkBilgi(e)
		if (kullanim.baslikMusteriKod)
			await this.xmlDuzenle_docRefs_mustKod(e)
		// await this.xmlDuzenle_docRefs_vioFisBilgi(e)
		await this.xmlDuzenle_docRefs_yalnizYazisi(e)
	}
	async xmlDuzenle_docRefs_son(e) { }
	xmlDuzenle_docRefs_sgk(e) { }
	async xmlDuzenle_docRefs_xslt({ xw }) {
		let e = { ...arguments[0] }
		let value = await this.getXsltBase64(e)
		if (!value)
			throw { isError: true, rc: 'emptyXslt', errorText: 'e-İşlem XML oluşturma için <b>XSLT Bilgisi</b> belirlenemedi' }
		
		let { uuid: id, fisnox: fisNox } = this.baslik
		let type = 'XSLT', mimeCode = 'application/xml'
		let attachment = { mimeCode, fileName: `${fisNox}.xslt`, value }
		await this.xmlDuzenleInternal_docRef({ xw, id, type, typeCode: null, attachment })
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
		
		let qrData = {
			vkntckn: gondericiBilgi.vknTckn,
			avkntckn: aliciBilgi.vknTckn,
			senaryo: baslik._profileID,
			tip: baslik._belgeTipKod,
			tarih: asReverseDateString(baslik.tarih),
			no: baslik.fisnox,
			ettn: baslik.uuid,
			parabirimi: currencyID,
			malhizmettoplam: toFileStringWithFra(brutBedelYapi[bedelSelector], 2),
			vergidahil: toFileStringWithFra(vergiDahilToplamYapi[bedelSelector], 2),
			odenecek: toFileStringWithFra(sonucBedelYapi[bedelSelector], 2)
		};
		for (let oran in kdvOran2MatrahVeBedel) {
			let {matrah, bedel} = kdvOran2MatrahVeBedel[oran]
			qrData[`kdvmatrah(${oran})`] = toFileStringWithFra(matrah, 2)
			qrData[`hesaplanankdv(${oran})`] = toFileStringWithFra(bedel || 0, 2)
		}
		
		let format = 'jpg', type = 'KAREKOD_IMG'
		let encodedQRData = toJSONStr(qrData)
		let qrURL = `https://api.qrserver.com/v1/create-qr-code/?charset-source=utf-8&ecc=L&size=180x180&qzone=1&format=${format}&data=${encodedQRData}`
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
			await this.xmlDuzenleInternal_docRef({ xw, id: '1', type: 'KAREKOD_IMG', typeCode: 'dynamic' })
			/*-- iptal --  this.xmlDuzenleInternal_docRef({ xw, id: '0', type, attachment: { mimeType, value: imgData, fileName: `${type}.png` } })*/
		}
		else
			await this.xmlDuzenleInternal_docRef({ xw, id: '1', typeCode: qrURL, type })
	}
	xmlDuzenle_docRefs_eIslemEkBilgi({ xw }) {
		// type: 'UST_BILGI', desc: 'içerik'
		let { innovami, temps: { eIslemKod2Bilgi } } = this
		if (!eIslemKod2Bilgi)
			return
		
		let donusum = {
			SUS: 'UST_BILGI', SAL: 'ALT_BILGI',
			STB: 'BODY_BAS', STS: 'BODY_SON',
			BHT: 'BANKA_HTML_BILGI',
			STH: 'HTML_HEAD', STC: 'CSS'
		}
		let noEscape = true, cdata = !innovami
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
				this.xmlDuzenleInternal_docRef({ xw, id: '0', type, desc, noEscape, cdata })
			}
		}
	}
	xmlDuzenle_docRefs_mustKod({ xw }) {
		let { must } = this.baslik
		if (must)
			this.xmlDuzenleInternal_docRefParam({ xw, name: 'MUSTERI_KOD', value: must })
	}
	xmlDuzenle_docRefs_vioFisBilgi({ xw }) {
		let {baslik: { _: baslik }, detaylar, baslik: { uuid }} = this
		detaylar = detaylar.map(det => det._)
		let rec = { baslik, detaylar }
		let value = Base64.encode(toJSONStr(rec)), mimeType = 'text/plain'
		let id = 4, type = 'VIO_FISBILGI', fileName = `${type}.json`
		this.xmlDuzenleInternal_docRef({
			xw, id, type,
			attachment: { mimeType, value, fileName }
		})
	}
	xmlDuzenle_docRefs_yalnizYazisi(e) { }
	xmlDuzenle_signatureParty(e) { }
	xmlDuzenle_digitalSignatureAttachment({ xw }) {
		xw.writeElementBlock('cac:DigitalSignatureAttachment', null, () =>
			xw.writeElementBlock('cac:ExternalReference', null, () =>
				xw.writeElementString('cbc:URI', '#SignatureId')))
	}
	xmlDuzenle_supplierParty(e) { }
	xmlDuzenle_customerParty(e) { }
	xmlDuzenle_partyOrtak({ xw, source, signaturePartymi }) {
		let { sahismi, unvan } = source;
		let writePartyIdent = (value, schemeID) => {
			if (!value)
				return this
			xw.writeElementBlock('cac:PartyIdentification', null, () =>
				xw.writeElementString('cbc:ID', value, null, { schemeID }));
			return this
		}
		
		if (!signaturePartymi) {
			let { webURL: value } = source
			if (value)
				xw.writeElementString('cbc:WebsiteURI', value)
		}
		if (sahismi)
			writePartyIdent(source.tckn, 'TCKN')
		else
			writePartyIdent(source.vkn, 'VKN')
		
		writePartyIdent(source.ticSicilNo, 'TICARETSICILNO')
		writePartyIdent(source.mersisNo, 'MERSISNO')

		if (!signaturePartymi) {
			xw.writeElementBlock('cac:PartyName', null, () =>
				xw.writeElementString('cbc:Name', unvan || ''))
		}
		
		xw.writeElementBlock('cac:PostalAddress', null, () => {
			xw.writeElements({
				'cbc:Room': 0, 'cbc:StreetName': source.adres || '.',
				'cbc:BuildingName': '.', 'cbc:BuildingNumber': 0,
				'cbc:CitySubdivisionName': source.yore || '.',
				'cbc:CityName': source.ilAdi || '.',
				'cbc:PostalZone': source.posta || '00000',
				'cbc:Region': '.'
			})
			xw.writeElementBlock('cac:Country', null, () => xw.writeElementString('cbc:Name', source.ulkeAdi || 'Türkiye'))
		})

		if (!signaturePartymi) {
			xw.writeElementBlock('cac:PartyTaxScheme', null, () =>
				xw.writeElementBlock('cac:TaxScheme', null, () =>
					xw.writeElementString('cbc:Name', source.vergiDairesi || '.'))
			)
			xw.writeElementBlock('cac:Contact', null, () =>
				xw.writeElements({
					'cbc:Telephone': source.tel1,
					'cbc:Telefax': source.fax,
					'cbc:ElectronicMail': source.eMail
				})
			)
			if (sahismi && unvan) {
				xw.writeElementBlock('cac:Person', null, () => {
					let { adi, soyadi } = source
					if (!adi) {
						let tokens = unvan.split(' ');
						adi = tokens.slice(0, -1).join(' ').trim();
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
	xmlDuzenle_buyerCustomerParty(e) { }
	xmlDuzenle_paymentMeans({ xw }) {
		/*let {eIslemKod2Bilgi} = this.temps, temp = eIslemKod2Bilgi?.BSK
		let bankaBilgi = temp ? JSON.parse(temp) : null
		let {currencyID} = this, bankaRecs = (bankaBilgi?.dipteBankaGoster ? bankaBilgi.bankaAdiVeIBANListe : null) ?? []
		for (let arr of bankaRecs) {		// [banka adı, şube adı, iban, dvKod ??]
			let [bankaAdi, subeAdi, iban, _dvKod] = arr;
			let dvKod = _dvKod || currencyID; if (dvKod == 'TL' || dvKod == 'TRL') { dvKod = currencyID }
			xw.writeElementBlock('cac:PaymentMeans', null, () => {
				xw.writeElementString('cbc:PaymentMeansCode', 42);
				xw.writeElementBlock('cac:PayeeFinancialAccount', null, () => {
					xw.writeElements({ 'cbc:ID': iban, 'cbc:CurrencyCode': dvKod, 'cbc:PaymentNote': bankaAdi });
					if (subeAdi.trim()) {
						xw.writeElementBlock('cac:FinancialInstitutionBranch', null, () =>
							xw.writeElementString('cbc:Name', subeAdi))
					}
				})
			})
		}*/
	}
	xmlDuzenle_allowanceCharge(e) { }
	xmlDuzenle_dvKur(e) { }
	xmlDuzenleInternal_dvKur({ xw, dvKod, dvKur }) {
		xw.writeElementBlock('cac:PricingExchangeRate', null, () =>
			xw.writeElements({
				'cbc:SourceCurrencyCode': dvKod,
				'cbc:TargetCurrencyCode': this.class.currCode_tl,
				'cbc:CalculationRate': toFileStringWithFra(dvKur, 6)
			})
		)
	}
	xmlDuzenle_taxTotal(e) { }
	xmlDuzenle_tevkifatli_taxTotal(e) { }
	xmlDuzenle_legalMonetaryTotal(e) { }
	xmlDuzenle_detaylar(e) {
		let {detaylar} = this
		for (let i = 0; i < detaylar.length; i++) {
			e.seq = i + 1; e.detay = detaylar[i]
			this.xmlDuzenle_detay(e)
		}
		deleteKeys(e, 'seq', 'detay')
	}
	xmlDuzenle_detay({ xw }) {
		let {xmlDetayTag} = this.class
		xw.writeStartElement(xmlDetayTag)
		this.xmlDuzenle_detayDevam(...arguments)
		xw.writeEndElement()
	}
	xmlDuzenle_detayDevam(e) {
		this.xmlDuzenle_detayDevam_id(e)
		this.xmlDuzenle_detayDevam_notes(e)
		this.xmlDuzenle_detayDevam_item_additionalItemIds(e)
		this.xmlDuzenle_detayDevam_miktar(e)
		this.xmlDuzenle_detayDevam_bedel(e)
		this.xmlDuzenle_detayDevam_allowanceCharge(e)
		this.xmlDuzenle_detayDevam_taxTotal(e)
		this.xmlDuzenle_detayDevam_tevkifatli_taxTotal(e)
		this.xmlDuzenle_detayDevam_siparisSatirBaglantisi(e)
		this.xmlDuzenle_detayDevam_item(e)
		this.xmlDuzenle_detayDevam_fiyat(e)
	}
	xmlDuzenle_detayDevam_id({ xw, seq }) {
		xw.writeElementString('cbc:ID', seq)
	}
	xmlDuzenle_detayDevam_notes({ xw }) {
		let { kural } = app.params.eIslem
		let { aciklama: kuralAciklama, aciklamaKapsam: kapsam } = kural
		let { detaylar } = this
		let hasNote = false
		if ((kapsam.sadeceAciklamami || kapsam.hepsimi) && !kuralAciklama.hepsiDiptemi) {
			for (let det of detaylar) {
				let { aciklamalar } = det
				if (empty(aciklamalar))
					continue
				
				for (let value of aciklamalar) {
					if (value)
						xw.writeElementString('cbc:Note', escapeXML(value))
				}
				hasNote = true
			}
		}
		if (!hasNote)
			xw.writeElementString('cbc:Note', '')
	}
	xmlDuzenle_detayDevam_miktar(e) { }
	xmlDuzenle_detayDevam_bedel({ xw, detay: det }) {
		let {dovizlimi, xattrYapi_bedel} = this
		let value = det.getSonucBedel({ dovizlimi })
		xw.writeElementString('cbc:LineExtensionAmount', toFileStringWithFra(value, 2), null, xattrYapi_bedel)
	}
	xmlDuzenle_detayDevam_allowanceCharge(e) { }
	xmlDuzenle_detayDevam_taxTotal(e) { }
	xmlDuzenle_detayDevam_tevkifatli_taxTotal(e) { }
	xmlDuzenle_detayDevam_siparisSatirBaglantisi(e) { }
	xmlDuzenle_detayDevam_item({ detay: det, xw }) {
		let e = arguments[0]
		xw.writeStartElement('cac:Item');
		this.xmlDuzenle_detayDevam_item_description(e)
		this.xmlDuzenle_detayDevam_item_name(e)
		this.xmlDuzenle_detayDevam_item_buyersItemId(e)
		this.xmlDuzenle_detayDevam_item_sellersItemId(e)
		this.xmlDuzenle_detayDevam_item_manfacturersItemId(e)
		xw.writeEndElement()
	}
	xmlDuzenle_detayDevam_item_description({ detay: det, xw }) {
		let {kural} = app.params.eIslem, kural_aciklama = kural.aciklama, kural_kapsam = kural.aciklamaKapsam;
		if ((kural_kapsam.sadeceAciklamami || kural_kapsam.hepsimi) && !kural_aciklama.hepsiDiptemi) {
			let {ekaciklama: value} = det;
			if (value) { xw.writeElementString('cbc:Description', escapeXML(value)) }
		}
	}
	xmlDuzenle_detayDevam_item_name({ detay: det, xw }) {
		xw.writeElementString('cbc:Name', escapeXML(det.adiGosterim))
	}
	xmlDuzenle_detayDevam_item_buyersItemId({ detay: det, xw }) {
		let { revizeRefKod: v, kodGosterim: d } = det
		if (v && v != d)
			this.xmlDuzenleInternal_detXIdent({ xw, tagName: 'cac:BuyersItemIdentification', id: escapeXML(v) })
	}
	xmlDuzenle_detayDevam_item_sellersItemId({ detay: det, xw }) {
		let { kodGosterim: v } = det
		if (v)
			this.xmlDuzenleInternal_detXIdent({ xw, tagName: 'cac:SellersItemIdentification', id: escapeXML(v) })
	}
	xmlDuzenle_detayDevam_item_manfacturersItemId({ detay: det, xw }) {
		let { barkodGosterim: v, kodGosterim: d } = det
		if (v && v != d)
			this.xmlDuzenleInternal_detXIdent({ xw, tagName: 'cac:ManufacturersItemIdentification', id: escapeXML(v) })
	}
	xmlDuzenle_detayDevam_item_additionalItemIds({ detay: det, xw }) {
		let e = arguments[0]
		this.xmlDuzenleInternal_detAdditionalIdent({ xw, id: det.shkod, schemeID: 'VIO_SHKOD' })
		this.xmlDuzenleInternal_detAdditionalIdent({ xw, id: det.adiGosterim, schemeID: 'VIO_SHADI' })
		this.xmlDuzenle_detayDevam_item_additionalItemIds_miktar2(e)
		this.xmlDuzenle_detayDevam_item_additionalItemIds_netFiyat(e)
		this.xmlDuzenle_detayDevam_item_additionalItemIds_ikGosterim(e)
	}
	xmlDuzenle_detayDevam_item_additionalItemIds_miktar2(e) { }
	xmlDuzenle_detayDevam_item_additionalItemIds_netFiyat(e) { }
	xmlDuzenle_detayDevam_item_additionalItemIds_ikGosterim(e) { }
	xmlDuzenle_detayDevam_fiyat(e) { }
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
		let tarihStr = tarih ? dateToString(tarih) : baslik.tarihStr
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
	xmlGetProfileID(e) { return null }
	xmlGetBelgeTipKodu(e) { return null }
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
		result = e.result = result.replaceAll(`POLEN YAZILIM - VİO TİCARİ`, `SKYLOG YAZILIM - SkyERP`)
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
