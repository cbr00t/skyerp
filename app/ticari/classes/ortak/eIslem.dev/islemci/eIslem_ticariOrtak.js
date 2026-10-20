class EIslTicariOrtak extends EIslGiden {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get ticarimi() { return true }

	static tipIcinFislerEkDuzenlemeYapDevam({ yukleIslemi, promises }) {
		super.tipIcinFislerEkDuzenlemeYapDevam(...arguments)
		promises.push(
			yukleIslemi({
				stm: e => this.getDetayAciklamaStm(e),
				seviyelendirici: ({ recs: source }) =>
					seviyelendirAttrGruplari({ source, attrGruplari: [['_table', 'id']] }),
				yukleyici: ({ eFis, detaylar: recs, ...e }) =>
					eFis.detayAciklamalarYukle({ ...e, recs })
			}),
			yukleIslemi({
				stm: e => this.getDipAciklamaStm(e),
				seviyelendirici: ({ recs: source }) =>
					seviyelendirAttrGruplari({ source, attrGruplari: [['_table', 'id']] }),
				yukleyici: ({ eFis, detaylar: recs, ...e }) =>
					eFis.dipAciklamaYukle({ ...e, recs })
			}),
			yukleIslemi({
				stm: e => this.getDipEIcmalStm(e),
				seviyelendirici: ({ recs: source }) =>
					seviyelendirAttrGruplari({ source, attrGruplari: [['_table', 'id']] }),
				yukleyici: ({ eFis, detaylar: recs, ...e }) =>
					eFis.dipEIcmalYukle({ ...e, recs })
			}),
			yukleIslemi({
				stm: e => this.getSubeStm(e),
				yukleyici: e => this.subeYukle({ ...e })
			}),
			yukleIslemi({
				stm: e => this.getOzelYontemStm(e),
				yukleyici: e => this.ozelYontemYukle({ ...e })
			}),
			yukleIslemi({
				stm: e => this.getCariOzelDipStm(e),
				seviyelendirici: ({ recs: source }) =>
					seviyelendirAttrGruplari({ source, attrGruplari: [['fisSayac', 'seq']] }),
				yukleyici: e => this.cariOzelDipYukle({ ...e })
			})
		)
	}
	static getDetayAciklamaStm({ table2IDListe }) {
		let uni = new MQUnionAll()
		let fhBagla = ({ fisTable, ackTable, idListe }) => {
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent
				.fromAdd(`${ackTable} ack`)
				.innerJoin('ack', `${fisTable} fis`, 'ack.fissayac = fis.kaysayac')
			wh.inDizi(idListe, 'fis.id')
			sahalar.add([
				`${fisTable.sqlServerDegeri()} _table`,
				'fis.id', 'ack.seq',
				'ack.aciklama'
			])
			uni.add(sent)
		}
		
		let stm = new MQStm({ sent: uni })
		let { orderBy } = stm
		let ekle = (fisTable, ackTable) => {
			let idListe = table2IDListe[fisTable]
			if (!empty(idListe))
				fhBagla({ fisTable, ackTable, idListe })
		}
		ekle('piffis', 'pifaciklama')
		ekle('sipfis', 'sipaciklama')
		ekle('stfis', 'staciklama')
		if (empty(uni.liste))
			return null
		
		orderBy.add('_table', 'id', 'seq')
		return stm
	}
	detayAciklamalarYukle({ recs }) {
		// 'seq' değerine göre ilgili detaya eklenecektir
		let { detaylar } = this
		let seq2Detay = fromEntries(
			detaylar.map(d => [d.seq, d]))
		
		for (let rec of recs) {
			let { seq: ackSeq, aciklama } = rec
			let maxSeq = 0
			for (let seq in seq2Detay) {
				if (seq <= ackSeq)
					maxSeq = max(maxSeq, seq)
			}
			if (maxSeq)
				seq2Detay[maxSeq].aciklamaEkle({ aciklama })
		}
	}
	static getDipAciklamaStm({ table2IDListe }) {
		// ** TODO: getDetayAciklamaStm(e)  kısmındaki gibi düzenlenecek
		let uni = new MQUnionAll()
		let ackBagla_baslik = _e => {
			let { fisTable, ackTable, idListe } = _e
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent
				.fromAdd(`${ackTable} ack`)
				.innerJoin('ack', `${fisTable} fis`, 'ack.fissayac = fis.kaysayac')
			wh.inDizi(idListe, 'fis.id')
			sahalar.add([
				`${fisTable.sqlServerDegeri()} _table`,
				'fis.id',
				`'B' altTip`, `0 kayitNo`,
				'ack.basaciklama aciklama'
			])
			uni.add(sent)
		}
		let ackBagla_dip = _e => {
			let { fisTable, ackTable, idListe } = _e
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent
				.fromAdd(`${ackTable} ack`)
				.innerJoin('ack', `${fisTable} fis`, 'ack.fissayac = fis.kaysayac')
			wh.inDizi(idListe, 'fis.id')
			sahalar.add([
				`${fisTable.sqlServerDegeri()} _table`,
				'fis.id',
				`'D' altTip`, `0 kayitNo`,
				'ack.aciklama'
			])
			uni.add(sent)
		}
		let ackBagla_ekBilgi = _e => {
			let { fisTable, ackTable, idListe } = _e
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent
				.fromAdd(`${ackTable} ack`)
				.innerJoin('ack', `${fisTable} fis`, 'ack.fissayac = fis.kaysayac')
			wh
				.inDizi(idListe, 'fis.id')
				.inDizi(['E1', 'E2'], 'ack.kayittipi')
			sahalar.add([
				`${fisTable.sqlServerDegeri()} _table`,
				'fis.id',
				'ack.kayittipi altTip', 'ack.kayitno kayitNo',
				'ack.ekbilgi aciklama'
			])
			uni.add(sent)
		}
		
		let stm = new MQStm({ sent: uni })
		let { orderBy } = stm
		;{
			let fisTable = 'piffis', idListe = table2IDListe[fisTable]
			if (!empty(idListe)) {
				ackBagla_baslik(({ fisTable, ackTable: 'pifbasekaciklama', idListe }))
				ackBagla_dip(({ fisTable, ackTable: 'pifdipaciklama', idListe }))
				ackBagla_ekBilgi(({ fisTable, ackTable: 'pifdipekbilgi', idListe }))
			}
		}
		;{
			let fisTable = 'sipfis', idListe = table2IDListe[fisTable]
			if (!empty(idListe)) {
				ackBagla_baslik(({ fisTable, ackTable: 'sipbasekaciklama', idListe }))
				ackBagla_dip(({ fisTable, ackTable: 'sipdipaciklama', idListe }))
				ackBagla_ekBilgi(({ fisTable, ackTable: 'sipdipekbilgi', idListe }))
			}
		}
		if (empty(uni.liste))
			return null
		
		orderBy.addAll('_table', 'id', 'altTip', 'kayitNo')
		return stm
	}
	dipAciklamaYukle({ recs }) {
		this.dipNotlar = recs.map(r =>
			r?.aciklama?.trimEnd() ?? '')
	}
	static getDipEIcmalStm({ table2IDListe } = {}) {
		let uni = new MQUnionAll()
		let icmalBagla = ({ fisTable, fisSayacSaha, idListe }) => {
			if (!idListe)
				return
			
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent
				.fromAdd('dipebilgi ebil')
				.innerJoin('ebil', `${fisTable} fis`, `ebil.${fisSayacSaha} = fis.kaysayac`)
			wh.inDizi(idListe, 'fis.id')
			sahalar
				.add([
					`${fisTable.sqlServerDegeri()} _table`,
					`fis.id`
				])
				.addWithAlias('ebil', ...[
					'seq', 'xadi', 'xkod',
					'hvtip hvTip', 'anatip anaTip', 'alttip altTip',
					'ustoran ustOran', 'oran',
					'matrah', 'dvmatrah dvMatrah',
					'bedel', 'dvbedel dvBedel'
				])
			uni.add(sent)
		}
		
		let stm = new MQStm({ sent: uni })
		let { orderBy } = stm
		;{
			let fisTable = 'piffis', fisSayacSaha = 'pifsayac'
			let idListe = table2IDListe[fisTable]
			icmalBagla({ fisTable, fisSayacSaha, idListe })
		}
		;{
			let fisTable = 'sipfis', fisSayacSaha = 'sipsayac'
			let idListe = table2IDListe[fisTable]
			icmalBagla({ fisTable, fisSayacSaha, idListe })
		}
		if (empty(uni.liste))
			return null
		
		orderBy.add('_table', 'id', 'seq')
		return stm
	}
	dipEIcmalYukle(e) {
		let icmal = this.icmalYoksaOlustur()
		icmal.dipEIcmalYukle(e)
	}
	static getSubeStm(e) {
		let sent = new MQSent(), {where: wh, sahalar} = sent
		sent.fromAdd('isyeri')
		wh.add(`kod <> ''`, `silindi = ''`)
		sahalar.add('*')
		return sent
	}
	static subeYukle({ recs, temps }) {
		temps.subeKod2Rec = fromEntries(
			recs.map(r => [r.kod, r]))
	}
	static getOzelYontemStm(e) {
		let sent = new MQSent(), { where: wh, sahalar } = sent
		sent.fromAdd('efozelyontem')
		wh.add(`kod <> ''`, `silindi = ''`)
		sahalar.add('*')
		return sent
	}
	static ozelYontemYukle({ recs, temps }) {
		temps.ozelYontemKod2Rec = fromEntries(
			recs.map(r => [r.kod, r]))
	}
	static getCariOzelDipStm({ table2Id2EFis } = {}) {
		let mustKodlar = {}
		for (let id2EFis of values(table2Id2EFis)) {
			for (let eFis of values(id2EFis)) {
				let kod = eFis.baslik?.mustKod
				if (kod)
					mustKodlar[kod] = true
			}
		}
		mustKodlar = keys(mustKodlar)
		if (empty(mustKodlar))
			return null

		let sent = new MQSent(), { where: wh, sahalar } = sent
		let stm = new MQStm({ sent }), { orderBy } = stm
		;{
			sent
				.fromAdd(`carmst car`)
				.innerJoin('car', 'eislemozeldip odip', 'odip.kod = car.eislozeldipkod')
				.innerJoin('odip', 'eislemozeldipdetay har', 'har.fissayac = odip.kaysayac')
			wh.add(`car.eislozeldipkod <> ''`)
			if (mustKodlar)
				wh.inDizi(mustKodlar, 'car.must')
			sahalar
				.add('car.must mustKod')
				.addWithAlias('odip',
					'kaysayac fisSayac', 'kod', 'aciklama',
					'bearsiv tip_A', 'befatura tip_E', 'beirsaliye tip_IR',
					'beihracat tip_IH', 'bemustahsil tip_MS'
				)
				.addWithAlias('har', 'seq', 'html')
		}
		orderBy.add('fisSayac', 'seq')
		
		return stm
	}
	static cariOzelDipYukle({ recs, temps }) {
		function getRec(sev) {
			const PFTip = 'tip_'
			let { orjBilgi: orj, detaylar } = sev
			// detaylar .html
			
			let uygunluk = {}
			let rec = {
				...orj,
				uygunluk,
				html: detaylar
					.map(d => d.html)
					.join('')
			}
			deleteKeys(rec, 'seq', 'detaylar')
			
			;entries(orj)
				.filter(([k, ]) => k.startsWith(PFTip))
				.forEach(([k, v]) => {
					delete rec[k]
					if (v)
						uygunluk[k.slice(PFTip.length)] = true
				})
			
			
			return rec
		}
		temps.kod2OzelDip = fromEntries(
			recs.map(sev => [sev.orjBilgi.kod, getRec(sev)]))
	}
	
	// xmlGetProfileID(e) { }
	xmlGetBelgeTipKodu(e) { return 'SATIS' }

	async xmlDuzenle_docRefs(e) {
		await super.xmlDuzenle_docRefs(e)
		// await this.xmlDuzenle_docRefs_son(e)
	}
	async xmlDuzenle_xsltOncesi(e) {
		await super.xmlDuzenle_xsltOncesi(e)
	}
	async xmlDuzenle_ozelDip(e) {
		await super.xmlDuzenle_ozelDip(e)
	}
	async xmlDuzenle_docRefs_ilk({ xw }) {
		await super.xmlDuzenle_docRefs_ilk(...arguments)
	}
	async xmlDuzenle_docRefs_ara({ xw }) {
		await super.xmlDuzenle_docRefs_ara(...arguments)
		let { faturaOzelTipText } = this.baslik
		await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Fatura Ek Tipi', value: faturaOzelTipText })
	}
	async xmlDuzenle_docRefs_sonOncesi({ xw }) {
		await super.xmlDuzenle_docRefs_sonOncesi(...arguments)
		let { params } = app
		let { oncekiIrsTSNListe, eArsivBelgeTipBelirtec: eArsiv_belirtec, ortalamavade: ortVade } = this.baslik
		let { diger: { sutOnayKodu, tapdkNox } } = params.isyeri
		let { kullanim: { baslikVade }, faturaVadeEtiket } = params.eIslem
		
		await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Süt Onay', value: sutOnayKodu })
		await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Tapdk No', value: tapdkNox })
		if (empty(oncekiIrsTSNListe))
			await this.xmlDuzenleInternal_docRef({ xw, type: 'IS_DESPATCH' })
		if (eArsiv_belirtec)
			await this.xmlDuzenleInternal_docRef({ xw, typeCode: 'SEND_TYPE', id: eArsiv_belirtec })
		if (baslikVade)
			await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: faturaVadeEtiket, value: asDateAndToString(ortVade) })
	}
	async xmlDuzenle_docRefs_son({ xw }) {
		await super.xmlDuzenle_docRefs_son(...arguments)    // en ust seviyeden ayrıca çağrılıyor
		let { params } = app
		let { plasiyerkod, plasiyeradi, tahsekliadi } = this.baslik
		let { kullanim: { baslikPlasiyer, baslikTahsilatSekli } } = params.eIslem
		let { diger: { sutOnayKodu, tapdkNox } } = params.isyeri
		if (baslikPlasiyer)
			await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Plasiyer', value: plasiyerkod ? `(${plasiyerkod}) ${plasiyeradi}` : null })
		if (baslikTahsilatSekli)
			await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Tahsil Şekli', value: tahsekliadi })
	}

	xmlDuzenle_notes(e) {
		// this.xmlDuzenle_bakiye(e)
		super.xmlDuzenle_notes(e)
	}
	async xmlDuzenle_bakiye({ xw }) {
		await super.xmlDuzenle_bakiye(...arguments)
		let { dipNotlar, baslik, baslik: { oncekiXBakiye, sonrakiXBakiye, dovizlimi, dvKodUyarlanmis } } = this
		let { dipOncekiBakiye, dipSonBakiye, bakiyeDovizliIseAyricaTLBakiye } = app.params.eIslem.kullanim
		
		const PF = '$$', Sep = '|'
		let keysInNotes = {}  // $$ONCEKI_BAKIYE|... -> note index
		;dipNotlar.forEach((line, index) => {
			if (line.startsWith(PF) && line.includes(Sep)) {    // 'ONCEKI_BAKIYE|...', 'SONRAKI_BAKIYE|...'
				let t = line.slice(PF.length).split(Sep)
				let key = t[0].trim()
				let value = t.slice(1).join(Sep)
				keysInNotes[key] = { index, key, value }
			}
		})
		
		let removeIndexes = []
		let bakiyeTextEkle = args => {
			let { prefix, etiket, bakiye, tlBakiye } = args
			let k = [prefix, 'BAKIYE'].join('_')
			;{
				let { index: i } = keysInNotes[k] ?? {}
				if (i != null) {
					i = Number(i)
					let v = dipNotlar[i]
					if (!bakiye || v.includes(`${Sep}0,00`))
						removeIndexes.push(i)
					else {
						v = v.replace(`${PF}${k}${Sep}`, `${etiket}:  `)
						dipNotlar[i] = v
					}
				}
				else if (bakiye) {
					let textListe = [`${toStringWithFra(bakiye, 2)} ${dvKodUyarlanmis}`]
					if (dovizlimi && bakiyeDovizliIseAyricaTLBakiye) {
						if (isFunction(tlBakiye))
							tlBakiye = tlBakiye(args)
						textListe.push(`${toStringWithFra(tlBakiye, 2)} TL`)
					}
					
					let v = textListe.join('<br/>')
					this.xsltDuzenleyiciEkle({
						args: { k, v },
						handler: ({ args: { k, v }, result: res }) =>
							res.replaceAll(`${PF}${k}`, v)
					})
				}
			}
			
			//for (let desc of textListe)
			//	this.xmlDuzenleInternal_docRef({ xw, id: '0', typeCode, desc })
		}
			
		bakiyeTextEkle({ prefix: 'ONCEKI', etiket: 'Önceki Bakiye', bakiye: dipOncekiBakiye ? oncekiXBakiye : null, tlBakiye: baslik.oncekiTLBakiye })
		bakiyeTextEkle({ prefix: 'SONRAKI', etiket: 'Sonraki Bakiye', bakiye: dipSonBakiye ? sonrakiXBakiye : null, tlBakiye: baslik.sonrakiTLBakiye })

		;removeIndexes.sort().reverse().forEach(i =>
			dipNotlar.splice(i, 1))
	}
	xmlDuzenle_doviz(e) {
		super.xmlDuzenle_doviz(e)
		this.xmlDuzenleInternal_doviz(e)
	}
	xmlDuzenle_dvKur(e) {
		super.xmlDuzenle_dvKur(e)
		if (this.dovizlimi)
			this.xmlDuzenleInternal_dvKur({ ...e, dvKod: this.dvKod, dvKur: this.dvKur })
	}
	xmlDuzenle_docRefs_yalnizYazisi({ xw }) {
		super.xmlDuzenle_docRefs_yalnizYazisi(...arguments)
		let { bedelSelector } = this
		let icmal = this.icmalYoksaOlustur()
		let sonucBedel = icmal.sonucBedelYapi[bedelSelector]
		let type = 'YALNIZYAZISI'
		let desc = `#${yalnizYazisi(sonucBedel)}#`
		this.xmlDuzenleInternal_docRef({ xw, id: '0', type, desc })
	}
	xmlDuzenle_allowanceCharge({ xw }) {
		super.xmlDuzenle_allowanceCharge(...arguments)
		let icmal = this.icmalYoksaOlustur()
		let { hizmetler, sonucBedelYapi = {} } = icmal
		let { bedelSelector, xattrYapi_bedel } = this
		if (empty(hizmetler))
			hizmetler = [{ oran: 0 }]
		
		let dipSonucBedel = sonucBedelYapi[bedelSelector] || 0
		for (let { nakliyemi, oran, bedelYapi } of hizmetler) {
			let bedel = bedelYapi?.[bedelSelector] || 0
			xw.writeElementBlock('cac:AllowanceCharge', null, () =>
				xw.writeElementString('cbc:ChargeIndicator', nakliyemi ?? false)
				  .writeElementString('cbc:MultiplierFactorNumeric', toFileStringWithFra(oran, 4))
				  .writeElementString('cbc:Amount', toFileStringWithFra(bedel, 2), null, xattrYapi_bedel)
				  .writeElementString('cbc:BaseAmount', toFileStringWithFra(dipSonucBedel, 2), null, xattrYapi_bedel)
			)
		}
	}
	xmlDuzenle_taxTotal({ xw }) {
		super.xmlDuzenle_taxTotal(...arguments)
		let { baslik: { istisnaKod } } = this
		let icmal = this.icmalYoksaOlustur()
		let { vergiTip2Oran2EVergiRecs_tevkifatsiz } = icmal
		let { bedelSelector, xattrYapi_bedel, dovizlimi} = this

		let toplamBedel = 0
		for (let oran2Recs of values(vergiTip2Oran2EVergiRecs_tevkifatsiz))
		for (let eSatirlar of values(oran2Recs))
		for (let eRec of eSatirlar)
			toplamBedel += eRec.bedelYapi[bedelSelector]

		if (empty(vergiTip2Oran2EVergiRecs_tevkifatsiz)) {    // ISTISNA için cac:TaxTotal yine yazılmalı
			let oran = 0
			let { eIslTypeCode: tip, belirtec } = MQVergiKdv
			belirtec = belirtec?.toUpperCase() ?? 'KDV'
			vergiTip2Oran2EVergiRecs_tevkifatsiz = {
				[tip]: {
					[oran]: [
						new EIcmalVergi({
							etiket: `${belirtec} % ${oran}`,
							kod: MQVergiKdv.eIslTypeCode,
							matrah: toplamBedel
						})
					]
				}
			}
		}
		
		xw.writeElementBlock('cac:TaxTotal', null, () => {
			xw.writeElementString('cbc:TaxAmount', toFileStringWithFra(toplamBedel, 2), null, xattrYapi_bedel)
			for (let oran2VergiRecs of values(vergiTip2Oran2EVergiRecs_tevkifatsiz))
			for (let [oran, vergiRecs] of entries(oran2VergiRecs)) {
				oran = Number(oran)
				for (let eRec of vergiRecs) {
					let { etiket: taxName, kod: taxTypeCode } = eRec ?? {}
					;{
						taxName = ( taxName?.split?.('%')?.[0] || '').trim()		// KDV % 20  ==>  KDV
						if (taxName?.endsWith('('))
							taxName = taxName.substring(0, taxName.length - 1).trim()
					}
					
					xw.writeElementBlock('cac:TaxSubtotal', null, () => {
						xw.writeElementString('cbc:TaxableAmount', toFileStringWithFra(eRec.getMatrahYapi({ dovizlimi })[bedelSelector], 2), null, xattrYapi_bedel)
						   .writeElementString('cbc:TaxAmount', toFileStringWithFra(eRec.bedelYapi[bedelSelector], 2), null, xattrYapi_bedel)
						   .writeElementString('cbc:CalculationSequenceNumeric', '2.0').writeElementString('cbc:Percent', oran)
						   .writeElementBlock('cac:TaxCategory', null, () => {
							   if (istisnaKod) {
									let tumIstisnaDict = MQVergi.getTumIstisnaDict()
									xw.writeElementString('cbc:TaxExemptionReasonCode', istisnaKod)
									  .writeElementString('cbc:TaxExemptionReason', tumIstisnaDict[istisnaKod]?.aciklama || '.')
								}
								xw.writeElementBlock('cac:TaxScheme', null, () =>
									xw.writeElementString('cbc:Name', taxName || '')
									  .writeElementString('cbc:TaxTypeCode', taxTypeCode || ''))
						   })
					})
				}
			}
		})
	}
	xmlDuzenle_tevkifatli_taxTotal({ xw }) {
		super.xmlDuzenle_tevkifatli_taxTotal(...arguments)
		let icmal = this.icmalYoksaOlustur()
		let { bedelSelector, xattrYapi_bedel, dovizlimi } = this
		let { vergiRecs_tevkifatlar } = icmal
		if (empty(vergiRecs_tevkifatlar))
			return
		
		let toplamBedel = topla(rec => rec.bedelYapi[bedelSelector], vergiRecs_tevkifatlar)
		if (!toplamBedel)
			return
		
		xw.writeElementBlock('cac:WithholdingTaxTotal', null, () => {
			xw.writeElementString('cbc:TaxAmount', toFileStringWithFra(toplamBedel, 2), null, xattrYapi_bedel);
			for (let eRec of vergiRecs_tevkifatlar) {
				xw.writeElementBlock('cac:TaxSubtotal', null, () => {
					xw.writeElementString('cbc:TaxableAmount', toFileStringWithFra(eRec.getMatrahYapi({ dovizlimi })[bedelSelector], 2), null, xattrYapi_bedel)
					  .writeElementString('cbc:TaxAmount', toFileStringWithFra(eRec.bedelYapi[bedelSelector], 2), null, xattrYapi_bedel)
					  .writeElementString('cbc:CalculationSequenceNumeric', '2.0')
					  .writeElementString('cbc:Percent', eRec.oran)
					  .writeElementBlock('cac:TaxCategory', null, () => {
							xw.writeElementBlock('cac:TaxScheme', null, () => {
								xw
									.writeElementString('cbc:Name', eRec.etiket)
									.writeElementString('cbc:TaxTypeCode', eRec.kod)
							})
					  })
				})
			}
		})
	}
	xmlDuzenle_legalMonetaryTotal({ xw }) {
		super.xmlDuzenle_legalMonetaryTotal(...arguments)
		let { bedelSelector, xattrYapi_bedel } = this
		let icmal = this.icmalYoksaOlustur()
		let brutBedel = icmal.brutBedelYapi?.[bedelSelector] || 0
		let topIskBedel = icmal.topIskBedelYapi?.[bedelSelector] || 0
		let vergiHaricBedel = icmal.vergiHaricToplamYapi?.[bedelSelector] || 0
		let vergiDahilBedel = icmal.vergiDahilToplamYapi?.[bedelSelector] || 0
		let sonucBedel = icmal.sonucBedelYapi?.[bedelSelector] || 0
		xw.writeElementBlock('cac:LegalMonetaryTotal', null, () =>
			xw.writeElementString('cbc:LineExtensionAmount', toFileStringWithFra(brutBedel, 2), null, xattrYapi_bedel)
			  .writeElementString('cbc:TaxExclusiveAmount', toFileStringWithFra(vergiHaricBedel, 2), null, xattrYapi_bedel)
			  .writeElementString('cbc:TaxInclusiveAmount', toFileStringWithFra(vergiDahilBedel, 2), null, xattrYapi_bedel)
			  .writeElementString('cbc:AllowanceTotalAmount', toFileStringWithFra(topIskBedel, 2), null, xattrYapi_bedel)
			  .writeElementString('cbc:PayableAmount', toFileStringWithFra(sonucBedel, 2), null, xattrYapi_bedel)
		)
	}
	xmlDuzenle_detayDevam_taxTotal({ xw, detay: det }) {
		/* 'har.detkdvekvergitipi', 'har.detistisnakod', 'har.perkdv', 'har.pertevkifat', 'har.perstopaj', 'kver.kdvorani', 'sver.stopajorani',
			'tevver.kdvtevoranx', 'tevver.kdvtevoranpay', 'tevver.tevislemturu' */
		super.xmlDuzenle_detayDevam_taxTotal(...arguments)
		let { bedelSelector, xattrYapi_bedel, dovizlimi } = this
		let matrah = det.getSonucBedel({ dovizlimi })
		let vergiBedeli = bedel => dovizlimi ? roundToDvBedelFra((bedel || 0) / (this.dvKur || 1)) : bedel
		let tip2VergiYapi = {
			get kdv() {
				return { bedel: vergiBedeli(det.perkdv), oran: det.kdvorani, taxTypeCode: MQVergiKdv.eIslTypeCode, taxName: 'KDV' }
				//return det.perkdv
				//	? { bedel: det.perkdv, oran: det.kdvorani, taxTypeCode: MQVergiKdv.eIslTypeCode, taxName: 'KDV' }
				//	: null
			},
			get istisna() {
				let { detkdvekvergitipi: ekVergiTipi, detistisnakod: istisnaKod } = det
				return ekVergiTipi == 'KI' || ekVergiTipi == 'IS' || ekVergiTipi == 'OM'
					? { bedel: 0, oran: 0, istisnaKod, taxTypeCode: MQVergiKdv.eIslTypeCode, taxName: 'KDV' }
					: null
			}, 
			get stopaj() {
				return det.perstopaj
					? { bedel: vergiBedeli(det.perstopaj), oran: det.stopajorani, taxTypeCode: MQVergiStopaj.eIslTypeCode, taxName: 'STOPAJ' }
					: null
			},
			get otv() {
				return det.perotv
					? { bedel: vergiBedeli(det.perotv), oran: det.otvorani, taxTypeCode: MQVergiOtv.eIslTypeCode, taxName: 'ÖTV' }
					: null
			}
		}

		if (tip2VergiYapi.istisna && tip2VergiYapi.kdv)
			delete tip2VergiYapi.kdv

		let cnv = { kdv: 'perkdv', stopaj: 'perstopaj', otv: 'perotv' }
		let toplamBedel = 0
		for (let [tip, r] of entries(tip2VergiYapi)) {
			let { oran, bedel } = r ?? {}
			if (!bedel)
				continue
			if (!oran) {
				r.bedel = 0
				continue
			}
			toplamBedel += bedel
		}
		toplamBedel = roundToBedelFra(toplamBedel)
		
		let tumIstisnaDict
		xw.writeElementBlock('cac:TaxTotal', null, () => {
			xw.writeElementString('cbc:TaxAmount', toFileStringWithFra(toplamBedel, 2), null, xattrYapi_bedel)
			for (let [tip, rec] of entries(tip2VergiYapi).filter(ent => ent[1])) {
				let { oran, bedel, istisnaKod, taxName, taxTypeCode } = rec
				if (!oran)
					bedel = rec.bedel = 0
				
				xw.writeElementBlock('cac:TaxSubtotal', null, () =>
					//xw.writeElements
					xw.writeElementString('cbc:TaxableAmount', toFileStringWithFra(matrah, 2), null, xattrYapi_bedel)
					  .writeElementString('cbc:TaxAmount', toFileStringWithFra(bedel || 0, 2), null, xattrYapi_bedel)
					  .writeElementString('cbc:CalculationSequenceNumeric', '2.0')
					  .writeElementString('cbc:Percent', oran || 0)
					  .writeElementBlock('cac:TaxCategory', null, () => {
						  if (istisnaKod) {
							  tumIstisnaDict ??= MQVergi.getTumIstisnaDict()
							  xw.writeElementString('cbc:TaxExemptionReasonCode', istisnaKod)
								.writeElementString('cbc:TaxExemptionReason', tumIstisnaDict[istisnaKod]?.aciklama || '.')
						  }
						  xw.writeElementBlock('cac:TaxScheme', null, () =>
							  xw.writeElementString('cbc:Name', taxName || '')
								.writeElementString('cbc:TaxTypeCode', taxTypeCode || ''))
					})
				)
			}
		})
	}
	xmlDuzenle_detayDevam_tevkifatli_taxTotal({ xw, detay: det }) {
		/* 'har.detkdvekvergitipi', 'har.detistisnakod',
			'har.perkdv', 'har.pertevkifat', 'har.perstopaj', 'kver.kdvorani', 'sver.stopajorani',
			'tevver.kdvtevoranx', 'tevver.kdvtevoranpay', 'tevver.tevislemturu' */
		super.xmlDuzenle_detayDevam_tevkifatli_taxTotal(...arguments)
		let { bedelSelector, xattrYapi_bedel, dovizlimi } = this
		let { pertevkifat, kdvtevoranpay } = det
		let matrah = det.getSonucBedel({ dovizlimi })
		let bedel = dovizlimi ? roundToDvBedelFra((pertevkifat || 0) / (this.dvKur || 1)) : pertevkifat || 0
		let oran = (kdvtevoranpay || 0) * 10
		if (!bedel)
			return
		
		let toplamBedel = bedel
		let tevkifatDict
		xw.writeElementBlock('cac:WithholdingTaxTotal', null, () => {
			xw.writeElementString('cbc:TaxAmount', toFileStringWithFra(toplamBedel, 2), null, xattrYapi_bedel)
			xw.writeElementBlock('cac:TaxSubtotal', null, () => {
				xw
					.writeElementString('cbc:TaxableAmount', toFileStringWithFra(matrah, 2), null, xattrYapi_bedel)
					.writeElementString('cbc:TaxAmount', toFileStringWithFra(bedel, 2), null, xattrYapi_bedel)
					.writeElementString('cbc:CalculationSequenceNumeric', '2.0')
					.writeElementString('cbc:Percent', oran)
					.writeElementBlock('cac:TaxCategory', null, () => {
						xw.writeElementBlock('cac:TaxScheme', null, () => {
							let { tevislemturu: tevIslemTuru } = det
							tevkifatDict ??= MQVergi.getTevkifatDict()
							xw
								.writeElementString('cbc:Name', tevkifatDict[tevIslemTuru]?.aciklama || '.')
								.writeElementString('cbc:TaxTypeCode', tevIslemTuru)
						})
					})
			})
		})
	}
	xmlDuzenle_detayDevam_item_additionalItemIds_miktar2({ xw, detay: det }) {
		super.xmlDuzenle_detayDevam_item_additionalItemIds_miktar2(...arguments)
		let { eMiktarYapi: { miktar2, brm2 } = {} } = det
		if (!miktar2)
			return
		brm2 ||= det.brm2
		let text = [numberToString(miktar2), brm2].filter(Boolean).join(' ')
		this.xmlDuzenleInternal_detAdditionalIdent({ xw, schemeID: 'MIKTAR2GORUNUM', id: text })
		//this.xmlDuzenleInternal_detAdditionalIdent({ xw, schemeID: 'BRM2GORUNUM', id: brm2 })
	}
	xmlDuzenle_detayDevam_item_additionalItemIds_netFiyat({ xw, detay: det }) {
		super.xmlDuzenle_detayDevam_item_additionalItemIds_netFiyat(...arguments)
		let { dovizlimi } = this
		let { netFiyat } = det.getEFiyatYapi({ dovizlimi }) ?? {}
		if (netFiyat) {
			let { zorunlu: { fiyatFra } } = app.params
			this.xmlDuzenleInternal_detAdditionalIdent({ xw, schemeID: 'NET_FIYAT', id: toFileStringWithFra(netFiyat, fiyatFra || 6) })
		}
	}
	xmlDuzenle_detayDevam_item_additionalItemIds_ikGosterim({ xw, detay: det, detay: { rec, topIskBedel } }) {
		let { dovizlimi, dvKodUyarlanmis: dvKod, xattrYapi_bedel } = this
		if (!dovizlimi)
			dvKod = 'TL'
		
		let brut = det.getBrutBedel({ dovizlimi })
		let prefix2Values = []
		for (let { belirtec, rowAttr, rowAttr_bedel } of TicIskYapi.getIskIter()) {
			let prefix = (
				belirtec == 'isk' ? 'ISK' :
				belirtec == 'kam' ? 'KAM' :
				belirtec == 'art' ? 'ART' :
				belirtec.slice(0, 3).toUpperCase()
			)
			let oran = rec[rowAttr]
			if (!oran)
				continue
			;{
				let liste = prefix2Values[`${prefix}ORANLARGORUNUM`] ??= []
				let text = numberToString(oran)
				if (!liste.length)
					text = `%${text}`
				liste.push(text)
			}
			;{
				let liste = prefix2Values[`${prefix}ORANLAR`] ??= []
				liste.push(oran)
			}
		}
		if (topIskBedel) {
			(prefix2Values.ISKTOPBEDELGORUNUM ??= []).push(toStringWithFra(topIskBedel, 2))
			;(prefix2Values.ISKTOPBEDEL ??= []).push(roundToFra(topIskBedel, 2))
		}
		
		for (let [schemeID, values] of entries(prefix2Values)) {
			let id = values.map(v => toFileStringWithFra(v, 2)).join('+')
			this.xmlDuzenleInternal_detAdditionalIdent({ xw, schemeID, id })
		}
	}
	xmlDuzenle_detayDevam_miktar({ xw, detay: det }) {
		super.xmlDuzenle_detayDevam_miktar(...arguments)
		let { eMiktarYapi: { asilMiktar: miktar, brm } = {} } = det
		if (miktar == null)
			return
		brm ||= det.brm || 'AD'
		let unitCode = app.params.stokBirim.brmDict[brm]?.intKod || 'NIU'			/* NIU = AD */
		if (!unitCode)
			throw { isError: true, rc: 'brmUls', errorText: `<b class="royalblue">${brm}</b> Stok Birim kodu için <u class="bold royalblue">Uls. Kod Karşılığı</u>, Stok Birim Parametrelerinden tanımlanmalıdır` }
		
		xw.writeElementString('cbc:InvoicedQuantity', miktar || 0, null, { unitCode })
	}
	xmlDuzenle_detayDevam_fiyat({ xw, detay: det }) {
		super.xmlDuzenle_detayDevam_fiyat(...arguments)
		let { asilFiyat: fiyat } = det.getEFiyatYapi({ dovizlimi: this.dovizlimi })
		if (fiyat == null)
			return
		xw.writeElementBlock('cac:Price', null, () =>
			xw.writeElementString('cbc:PriceAmount', toFileStringWithFra(fiyat || 0), null, this.xattrYapi_bedel))
	}
	xmlDuzenle_detayDevam_allowanceCharge({ xw, detay: det, detay: { rec } }) {
		let { dovizlimi, xattrYapi_bedel } = this
		let brut = det.getBrutBedel({ dovizlimi })
		let iskYapilar = Array.from(TicIskYapi)
		/*if (empty(iskYapilar)) {
			iskYapilar = [
				{ oran: 0 }
			]
		}*/
		for (let { rowAttr, rowAttr_bedel } of iskYapilar) {
			let oran = rec[rowAttr] || 0
			let ikBedel = oran ? rec[rowAttr_bedel] : 0
			if (dovizlimi)
				ikBedel = roundToDvBedelFra((ikBedel || 0) / (this.dvKur || 1))
			if (!oran)
				continue
			xw.writeElementBlock('cac:AllowanceCharge', null, () =>
				xw.writeElementString('cbc:ChargeIndicator', false)
				  .writeElementString('cbc:MultiplierFactorNumeric', toFileStringWithFra(oran / 100, 4))
				  .writeElementString('cbc:Amount', toFileStringWithFra(ikBedel, 2), null, xattrYapi_bedel)
				  .writeElementString('cbc:BaseAmount', toFileStringWithFra(brut, 2), null, xattrYapi_bedel)
			)
		}
	}
}
