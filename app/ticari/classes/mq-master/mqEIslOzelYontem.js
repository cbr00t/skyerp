class MQEIslOzelYontem extends MQKA {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'e-İşlem Özel Yöntem' }
	static get table() { return 'efozelyontem' } static get tableAlias() { return 'efy' }
	static get kodListeTipi() { return 'EISLOYON' } static get tumKolonlarGosterilirmi() { return true }
	get yontemAdi() { return this.aciklama || '' } get varsaGenelYontem() { return null }
	static get pTanimListe_kullanim() {
		return {
			adiYerineAdi2: new PInstBool('fladi2'), stokRefKoduKuKullan: new PInstBool('flcaristokrefkodu'), barkodKullan: new PInstBool('flbarkod'),
			stokYerineRefKoduGoster: new PInstBool('flstokicinrefkullan'), stokYerineBarkodGoster: new PInstBool('flstokicinbarkodkullan'),
			baslikSipRefKullan: new PInstBool('flrefsipno'), konsolideSubeKoduKullan: new PInstBool('flkonsube'), kendiRefKoduKullan: new PInstBool('flkendirefkodu'),
			barkodReferansKaldir: new PInstBool('flbarrefyok'), subeKoduBayiNoOlarakYazilsin: new PInstBool('flsubebayinoolarak'), goMasrafKoduHizmetAdinaEklensin: new PInstBool('flgomasrafkodekle'),
			sipRefTarihNoGosterimTipi: new PInstTekSecim('sipreftarihnogostip', EIslKural_SipTarihVeNo), irsTarihNoGosterimTipi: new PInstTekSecim('irstarihnogostip', EIslKural_IrsTarihVeNo), irsBilgiOzelGosterilir: new PInstBool('flirsbilgiozelgosterim'),
			sevkYerRefKullan: new PInstBool('flsevkyerreferans'),
			sevkYerRefBelirtec: new PInstStr('sevkyerrefkod'),
			sevkYerRefKodVeAdiDipKismaYazilsin: new PInstBool('flsevkyeridipkismayazim'),
			irsQRCodeGereklimi: new PInstBool()
		}
	}
	constructor(e) { super(e) }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, this.pTanimListe_kullanim) }
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e);
		const tabPage = e.tabPage_genel; let form = tabPage.addFormWithParent().yanYana(3);
		for (const [key, pInst] of Object.entries(this.pTanimListe_kullanim)) {
			if (pInst instanceof PInstBool || pInst instanceof PInstBitBool) { form.addCheckBox(key, key) }
			else if (pInst instanceof PInstStr) { form.addTextInput(key, key) }
			else if (pInst instanceof PInstTekSecim) { form.addModelKullan(key, key).dropDown().noMF().kodsuz().setSource(pInst.sinif.kaListe) }
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		for (const [key, pInst] of entries(this.pTanimListe_kullanim)) {
			let { rowAttr } = pInst
			if (!rowAttr)
				continue
			let colDef = gridKolon(rowAttr, key, 15)
			if (pInst instanceof PInstNum)
				colDef.tipDecimal()
			else if (pInst instanceof PInstBool || pInst instanceof PInstBitBool)
				colDef.tipBool()
			liste.push(colDef)
		}
	}
	static loadServerData_queryDuzenle({ sent: { where: wh, sahalar } }) {
		super.loadServerData_queryDuzenle(...arguments)
		let { aliasVeNokta } = this
		wh.add(`${aliasVeNokta}silindi = ''`)
		sahalar.add(`${aliasVeNokta}*`)
	}
	xmlDuzenle_docRefs(e) {
		let { eFis, xw } = e
		let { subeKod } = eFis.baslik
		if (subeKod && this.subeKoduBayiNoOlarakYazilsin)
			eFis.xmlDuzenleInternal_docRef({ xw, type: 'BAYINO', id: subeKod })
	}
	eIslemOnKontrol(e) {
		let err = errorTextsAsObject({ errors: this.eIslemOnKontrolMesajlar(e) }); if (err) { throw err }
		return this
	}
	eIslemOnKontrolMesajlar(e) {
		const _e = $.extend({}, e, { liste: [] }); this.eIslemOnKontrolMesajlarDuzenle(_e); this.eIslemOnKontrolMesajlarDuzenle_son(_e);
		return _e.liste?.filter(x => !!x)
	}
	async xmlDuzenle_xsltOncesi_ve_ozelDip_arasi({ xw, eFis, eFis: { baslik } }) { }
	eIslemOnKontrolMesajlarDuzenle(e) {
		let { varsaGenelYontem: genelYontem } = this
		let { liste, eFis } = e
		let { baslik, detaylar } = eFis
		if (genelYontem?.metrommu)
			liste.push(this.metroIcinUygunmuDegilseMesaj(e))
		
		if (this.baslikSipRefKullan && !baslik.refNox)
			liste.push(`<b>Başlık Sipariş Referansı</b> verilmelidir`)
		
		if (this.kendiRefKoduKullan && !baslik.musRefKod)
			liste.push(`<b>Müşteri Kendi Referans Kodu</b> verilmelidir`)
		
		if (this.stokRefKoduKuKullan) {
			let { mustKod } = baslik
			let subErrors = []
			for (let det of detaylar.filter(d => d.stokmu)) {
				let { stokRefKod: refKod } = det
				if (!refKod) {
					let { shKod, shAdi } = det
					subErrors.push(`<b>${shKod}</b>-${shAdi}`)
				}
			}
			if (subErrors?.length) {
				let subErrorText = subErrors.map(v => `<li class="item">${v}</li>`)
				liste.push(
					`<div class="firebrick"><u><b>${mustKod}</b> kodlu müşteri için ` +
					`<b>Stok Referanslarında</b> sorun var</u>:</div>` +
					`<ul class="subErrors" style="color: #888; margin-left: 10px">${subErrorText}</ul>`
				)
			}
		}
	}
	eIslemOnKontrolMesajlarDuzenle_son(e) { }
	metroIcinUygunmuDegilseMesaj(e) { return null }
	malKabulNoKontrolu(e) {
		let { fis = e.ticariFis } = e
		if (!app.params.satis.malKabulNo)
			return `<u>Satış Genel</u> Parametrelerinde <b class="royalblue">Mal Kabul No</b> kullanımı açılmalıdır`
		if (!fis.malKabulNo)
			return this.getUygunDegilMesaji(`<b>Müşteri Mal Kabul No</b> belirtilmelidir`, fis.fisNo)
		return null
	}
	getUygunDegilMesaji(text, belgeNox) {
		let { yontemAdi } = this
		return `<b class="royalblue">${belgeNox}</b> nolu belge ${yontemAdi} e-İşlem Kuralına uygun değildir (<b>${text}</b>)`
	}
}

class MQEIslGeneldenOzelYontem extends MQEIslOzelYontem {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	get yontemAdi() { return this.genelYontem?.aciklama }
	get varsaGenelYontem() { const rec = this.genelYontem; return rec?.yokmu ? null : (rec ?? null) }
	get iskontoZorunlumu() { const rec = this.genelYontem; return (rec.migrosmu || super.iskontoZorunlumu) ?? false }
	get iskontoTekilYazilirmi() { const rec = this.genelYontem; return (rec.migrosmu || super.iskontoTekilYazilirmi) ?? false }
	get kendiReferansiMusteriNoOlarakYazilirmi() { const rec = this.genelYontem; return (rec.migrosmu || super.kendiReferansiMusteriNoOlarakYazilirmi) ?? false }
	get irsaliyeAsilAliciVeyaSaticiGonderilirmi() { const rec = this.genelYontem; return rec.migrosmu ?? false }
	
	constructor(e) {
		super(e)
		extend(this, { genelYontem: e.genelYontem, subeKodEtiketi: e.subeKodEtiketi || '' })
		if (this.genelYontem)
			this.geneldenYukle(e)
	}
	geneldenYukle(e) {
		let { genelYontem: rec } = this
		if (!rec)
			return this
		
		let konsolidemi = e.konsolide ?? e.konsolidemi
		extend(this, {
			subeKodEtiketi: rec.subeBayimidir ? 'BAYINO' : rec.subeMusterimidir ? 'MUSTERINO' : konsolidemi ? 'SUBENO' : '',
			barkodKullan: rec.stokBarkodZorunlumu ?? false,
			stokRefKoduKuKullan: rec.stokCariReferansZorunlumu ?? false,
			baslikSipRefKullan: rec.baslikSipReferansZorunlumu ?? false,
			konsolideSubeKoduKullan: rec.konsolideSubeReferansZorunlumu ?? false,
			stokYerineRefKoduGoster: rec.stokYerineRefKodmu ?? false,
			stokYerineBarkodGoster: rec.stokYerineBarkodmu ?? false,
			kendiRefKoduKullan: rec.kendiRefKoduZorunlumu ?? false,
			sevkYerRefKullan: rec.sevkYerReferansZorunlumu ?? false,
			irsQRCodeGereklimi: rec.irsQRCodeGereklimi ?? false
		})
		if (this.sevkYerRefKullan)
			this.sevkYerRefBelirtec = rec.sevkYeriReferansZorunluBelirtec
		return this
	}
	
	metroIcinUygunmuDegilseMesaj(e) { return this.malKabulNoKontrolu(e) ?? null }
	
	xmlDuzenle_docRefs({ xw, eFis, eFis: { baslik } }) {
		let { varsaGenelYontem: genelYontem } = this
		if (genelYontem?.migrosmu) {
			let oncekiIrsTSNListe = baslik.oncekiIrsTSNListe ?? []
			let { borsatescilvarmi, kunyenox } = baslik
			for (let rec of oncekiIrsTSNListe) {
				let { tarih, nox } = rec
				eFis.xmlDuzenleInternal_docRef({ xw, type: 'IRSALIYE', id: nox, tarih })
			}
			if (borsatescilvarmi)
				eFis.xmlDuzenleInternal_docRef({ xw, type: 'BORSATESCIL', id: 'VAR' })
			if (kunyenox) {
				eFis.xmlDuzenleInternal_docRef({ xw, type: 'KUNYE', id: 'VAR' })
				eFis.xmlDuzenleInternal_docRef({ xw, type: 'KUNYENO', id: kunyenox })
			}
			;{
				let faturaKod = `101.0000${asBool(baslik.kondepomu) ? '4' : '1'}.0000010019`
				eFis.xmlDuzenleInternal_docRef({ xw, type: 'FATURAKODLIST', id: faturaKod })
			}
		}
	}
	async xmlDuzenle_xsltOncesi_ve_ozelDip_arasi({ xw, eFis }) {
		let { baslik, detaylar } = eFis
		let { varsaGenelYontem: eYontem } = this
		let { sokmu, tarimKredimi } = eYontem ?? {}
		
		if (sokmu || tarimKredimi) {
			let { tarih, fisNox, konSubeKod } = baslik
			// ticariFis dokumMusteri konsolideYapi konKendiDetayKod
			let barkodlar = detaylar
				.map(d => `${d.barkod}-${d.miktar}`)
				.filter(Boolean)

			let data = {}
			if (tarimKredimi) {
				extend(data, {
					irsaliyeNo: fisNox,
					magazaNo: konSubeKod,
					tarih: asDateAndToString(tarih),
					barkodlar
				})
			}
			else if (sokmu) {
				extend(data, {
					irsaliye: fisNox,
					barkodlar,
					sayfa: '1-1'
				})
			}

			if (!empty(data))
				await eFis.xmlDuzenle_docRefs_qrCode_alt?.({ xw, data })
		}
	}
}

class EIslGenelYontem extends TekSecim {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this } get stokYerineBarkodmu() { return this.getirmi } get stokYerineRefKodmu() { return this.kipami || this.carrefourmu }
	static get defaultChar() { return ' ' }
	get varsaGenelYontem() { return this }
	get yokmu() { return this.char == ' ' } get migrosmu() { return this.char == 'MIG' } get metromu() { return this.char == 'MET' }
	get carrefourmu() { return this.char == 'CSA' } get bimmi() { return this.char == 'BIM' }
	get a101mi() { return this.char == 'A101' } get kilermi() { return this.char == 'KIL' }
	get kipami() { return this.char == 'KIP' } get adesami() { return this.char == 'ADE' }
	get ozenmi() { return this.char == 'OZN' } get eformu() { return this.char == 'EFOR' }
	get cetinkayami() { return this.char == 'CET' }
	get lezitami() { return this.char == 'LEZ' } 
	get sofraGrupmu() { return this.char == 'SOF' } get getirmi() { return this.char == 'GET' }
	get tofasmi() { return this.char == 'TOF' } get fordmu() { return this.char == 'FOR' }
	get sgkmi() { return this.char == 'SGK' } get dmomu() { return this.char == 'DMO' }
	get ibbmi() { return this.char == 'IBB' } get sokmu() { return this.char == 'SOK' }
	get tarimKredimi() { return this.char == 'TRK' }
	
	get subeMusterimidir() { return false }
	get subeBayimidir() { return this.migrosmu || this.kilermi || this.a101mi || this.metromu || this.bimmi || this.carrefourmu }
	get stokCariReferansZorunlumu() {
		return (
			this.carrefourmu || this.migrosmu || this.metromu || this.kilermi || this.sofraGrupmu ||
			this.kipami || this.tofasmi || this.getirmi || this.fordmu || this.a101mi ||
			this.tarimKredimi
		)
	}
	get stokBarkodZorunlumu() {
		return (
			this.carrefourmu || this.migrosmu || this.metromu || this.kilermi || this.bimmi ||
			this.getirmi || this.tarimKredimi
		)
	}
	get sevkYerReferansZorunlumu() { return this.ibbmi }
	get irsQRCodeGereklimi() { return this.sokmu || this.tarimKredimi }
	get konsolideSubeReferansZorunlumu() { return this.carrefourmu || this.cetinkayami || this.eformu || this.kilermi || this.kipami || this.metrommu || this.migrosmu || this.ozenmi || this.adesemi }
	get kendiRefKoduZorunlumu() { return this.migrosmu || this.metrommu || this.tofasmi }
	get baslikSipReferansZorunlumu() { return this.carrefourmu || this.fordmu || this.kilermi || this.kipami || this.metromu || this.migrosmu || this.ozenmi || this.soframi }
	get sevkYeriReferansZorunluBelirtec() { return this.ibbmi ? 'TESISKODLIST' : '' }
	
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		kaListe.push(
			new CKodVeAdi([' ', 'Yok']),
			new CKodVeAdi(['TRK', 'Tarım Kredi']),
			new CKodVeAdi(['MIG', 'Migros Market']),
			new CKodVeAdi(['MET', 'Metro Market']),
			new CKodVeAdi(['CSA', 'CarrefourSA Market']),
			new CKodVeAdi(['SOK', 'Şok']),
			new CKodVeAdi(['BIM', 'BİM Market']),
			new CKodVeAdi(['A101', 'A-101 Market']),
			new CKodVeAdi(['KIL', 'Kiler Market']),
			new CKodVeAdi(['KIP', 'Kipa Market']),
			new CKodVeAdi(['ADE', 'Adesa Market']), 
			new CKodVeAdi(['OZN', 'Özen AVM']),
			new CKodVeAdi(['EFOR', 'EFOR AVM']),
			new CKodVeAdi(['CET', 'Çetinkaya Market']), 
			new CKodVeAdi(['LEZ', 'Lezita']),
			new CKodVeAdi(['SOF', 'Sofra Grup']),
			new CKodVeAdi(['GET', 'Getir']),
			new CKodVeAdi(['TOF', 'Tofaş Otomativ']),
			new CKodVeAdi(['FOR', 'Ford Otomativ']), 
			new CKodVeAdi(['SGK', 'SGK']),
			new CKodVeAdi(['DMO', 'Devlet Malzeme Ofisi']), 
			new CKodVeAdi(['IBB', 'İstanbul Büyükşehir Belediyesi'])
		)
	}
	async getEkstraNotSatirlari(e) {
		const fis = e.fis ?? e.ticariFis, {} = ticariFis, result = [];
		if (this.kilermi) {
			let mustKonKendiDetayKod = await fis.getMustKonKendiDetayKod()
			if (mustKonKendiDetayKod)
				result.push(`"${mustKonKendiDetayKod}"`)
		}
		else if (this.metromu) {
			let mustKonKendiDetayKod = await fis.getMustKonKendiDetayKod()
			let karsiRefKod = await fis.getMusKarsiRefKod()
			let { malKabulNo } = fis, ekBilgiler = []
			if (mustKonKendiDetayKod) { ekBilgiler.push(`Mağaza No: ${mustKonKendiDetayKod}`) }
			if (karsiRefKod) { ekBilgiler.push(`Satıcı No: ${karsiRefKod}`) }
			if (malKabulNo) { ekBilgiler.push(`Mal Kabul No: ${malKabulNo}`) }
			if (ekBilgiler?.length) { result.push(ekBilgiler.join(' ')) }
		}
		return result
	}
}
