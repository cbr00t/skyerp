class EIslFaturaArsivOrtak extends EIslTicariOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'EA' }
	static get efami() { return true }
	static get paramSelector() { return 'eFatura' }
	static get xmlTipBelirtec() { return 'Invoice' }

	static tipIcinFislerEkDuzenlemeYapDevam({ yukleIslemi, promises }) {
		super.tipIcinFislerEkDuzenlemeYapDevam(...arguments)
		promises.push(
			yukleIslemi({
				stm: e => this.getOncekiIrsTSNStm(e),
				seviyelendirici: ({ recs: source }) => seviyelendirAttrGruplari({ source, attrGruplari: [['pstip', 'fissayac']] }),
				yukleyici: ({ eFis, detaylar: recs, ...e }) => eFis.oncekiIrsTSNYukle({ ...e, recs })
			})
		)
	}
	static getOncekiIrsTSNStm({ ps2SayacListe } = {}) {
		let uni = new MQUnionAll()
		let stm = new MQStm({ sent: uni })
		let { orderBy } = stm
		;{
			let { P: fisSayaclar } = ps2SayacListe
			if (fisSayaclar) {
				let sent = new MQSent({
					from: 'irs2fat don', where: { inDizi: fisSayaclar, saha: 'don.fatsayac' },
					fromIliskiler: [ { from: 'piffis irs', iliski: 'don.irssayac = irs.kaysayac' } ],
					sahalar: [`'P' pstip`, `don.fatsayac fissayac`, 'irs.tarih', 'irs.fisnox nox']
				})
				uni.add(sent)
			}
		}
		if (empty(uni.liste))
			return null
		
		orderBy.addAll('pstip', 'fissayac', 'tarih', 'nox')
		return stm
	}
	oncekiIrsTSNYukle({ _detaylar: d } = {}) {
		this.baslik.oncekiIrsTSNListe = d
	}
	
	async onKontrol_ara(e) {
		await super.onKontrol_ara(e)
		let { baslik, detaylar, temps, dipNotlar } = this
		let { fisTipi, istisnaKod } = baslik
		let icmal = this.icmalYoksaOlustur()
		
		let hDetIstTip, hDetTevKod
		// dettevhesapkod
		switch (fisTipi) {
			case 'TV': {
				// ??
				break
			}
			case 'TK': {
				istisnaKod = baslik.istisnaKod = '223'          // TEVKIFAT
				hDetIstTip = 'IS'
				break
			}
			case 'IS': case 'KI': case 'OM': {
				hDetIstTip = fisTipi
				break
			}
		}

		if (!istisnaKod && icmal.bedelsizmi)
			istisnaKod = baslik.istisnaKod = '350'              // DIGER

		let detayTipSet = asSet(['S', 'H', 'D'])
		let istisnaTipSet = asSet(['IS', 'KI', 'OM'])
		if (istisnaKod) {
			;detaylar.forEach(d => {
				let { kayittipi: tip, detkdvekvergitipi: vergiTipi } = d
				if (detayTipSet[tip] && !vergiTipi) {
					d.detkdvekvergitipi = hDetIstTip
					d.detistisnakod = istisnaKod
				}
			})
		}

		let detIstKodSet = temps.detIstKodSet ??= {}
		;detaylar.forEach(d => {
			let { detkdvekvergitipi: vergiTipi, detistisnakod: istKod } = d
			if (istisnaTipSet[vergiTipi])
				detIstKodSet[istKod] = true
		})

		;{
			let istDict = await MQVergi.getTumIstisnaDict()
			for (let istKod in detIstKodSet) {
				let { aciklama } = istDict[istKod] ?? {}
				dipNotlar.push([ `<b>${istKod}</b>`, aciklama ].filter(Boolean).join('-'))
			}
		}
		
		return this
	}

	xmlGetProfileID(e) {
		let { baslik, class: { eArsivmi } } = this
		return (
			eArsivmi ? 'EARSIVFATURA':
			baslik.alimIademi ? 'TEMELFATURA' :
			EIslemSenaryo.getSenaryoText(baslik.carsenaryo)
		)
	}
	xmlGetBelgeTipKodu(e) {
		let { baslik, detaylar } = this
		let { alimIademi, fistipi: fisTipi, ayrimtipi: ayrimTipi, eYontem } = baslik

		if (alimIademi) 
			return fisTipi == 'SR' ? 'TEVKIFATIADE' : 'IADE'
		
		if (fisTipi == 'TV')
			return 'TEVKIFAT'
		
		if (ayrimTipi == 'IK')
			return 'IHRACKAYITLI'
		
		if (fisTipi == 'OM')
			return 'OZELMATRAH'

		let icmal = this.icmalYoksaOlustur()
		let istisnaTipler = ['KI', 'TK', 'IS']
		let ihrTipler = ['IH', 'MI']
		let { vergiTip2Oran2EVergiRecs_tevkifatsiz: vt2Oran2Recs } = icmal
		if (istisnaTipler.includes(fisTipi) || ihrTipler.includes(ayrimTipi) || empty(vt2Oran2Recs?.[MQVergiKdv.eIslTypeCode]))
			return 'ISTISNA'

		let ekVergiTipleri = detaylar
			.map(d => d.detkdvekvergitipi)
			.filter(Boolean)
		if (ekVergiTipleri.includes('TV'))
			return 'TEVKIFAT'
		
		let detayIstisnami = ekVergiTipleri.some(v => v == 'IS' || v == 'KI')
		if (detayIstisnami)
			return 'ISTISNA'
		
		if (eYontem?.varsaGenelYontem?.sgkmi)
			return 'SGK'
		
		return super.xmlGetBelgeTipKodu(e)
	}

	async xmlDuzenle_docRefs_ilk({ xw }) {
		await super.xmlDuzenle_docRefs_ilk(...arguments)
		await this.xmlDuzenle_docRefs_sgk(e)
	}
	async xmlDuzenle_docRefs_sonOncesi({ xw }) {
		await super.xmlDuzenle_docRefs_sonOncesi(...arguments)
	}
	xmlDuzenle_docRefs_sgk(e) { }

	xmlDuzenle_notes(e) {
		this.xmlDuzenle_notes_eArsiv(e)
		super.xmlDuzenle_notes(e)
	}
	xmlDuzenle_notes_eArsiv({ xw }) {
		let { eArsivBelgeTipBelirtec } = this.baslik
		if (eArsivBelgeTipBelirtec) {
			let value = `Gönderim Şekli: ${eArsivBelgeTipBelirtec}`
			xw.writeElementString('cbc:Note', value)
		}
	}
}


class EIslFatura extends EIslFaturaArsivOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get eFaturami() { return true }
	static get ortakSinif() { return EIslFaturaArsivOrtak }
	static get tip() { return 'E' } static get sinifAdi() { return 'e-Fatura' }
	static get kisaAdi() { return 'e-Fat' }
}

class EIslArsiv extends EIslFaturaArsivOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get eArsivmi() { return true }
	static get ortakSinif() { return EIslFaturaArsivOrtak }
	static get tip() { return 'A' }
	static get altBolum() { return 'EArsiv' }
	static get sinifAdi() { return 'e-Arşiv' }
	static get kisaAdi() { return 'e-Arş' }
	get xsltBelirtec() { return 'EArsiv' }
}

class EIslIhracat extends EIslFatura {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get eIhracatmi() { return true }
	static get tip() { return 'IH' }
	static get sinifAdi() { return 'e-İhracat' }
	static get kisaAdi() { return 'e-İhr' }
	get xsltBelirtec() { return 'EIhracat' }
}
