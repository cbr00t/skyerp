class DRapor_Hareketci_AlimSatisVeSiparisOrtak_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ticarimi() { return true }
	static get almSat() { return this.hareketciSinif.almSat }
	static get maliyetKullanilirmi() { return false }
	tabloYapiDuzenle({ result }) {
		let e = arguments[0]
		super.tabloYapiDuzenle(e)
		let {maliyetKullanilirmi} = this.class
		let {brmDict} = app.params.stokBirim ?? {}
		let {isAdmin, rol} = config.session ?? {}
		let maliyetGorurmu = isAdmin || !rol?.ozelRolVarmi('XMALYT')
		let {tip2BrmListe} = MQStokGenelParam
		let {toplam} = result, brmListe = keys(tip2BrmListe)
		result.addGrupBasit('SHTIP', 'S/H Tip', 'shtiptext')
		this.tabloYapiDuzenle_cari(e)
		this.tabloYapiDuzenle_sh(e)
		result
			.addGrupBasit('SEVKTARIHX', 'Sevk Tarih', 'sevktarihx')
			.addGrupBasit('SEVKNOX', 'Sevk No', 'sevknox', null, null, ({ colDef }) => colDef.alignRight())
			.addToplamBasit('MIKTAR', 'Miktar', 'miktar', null, 10, null)
			.addToplamBasit('MIKTAR2', '2. Miktar', 'miktar2', null, 10, null)
			.addToplamBasit('MIKTAR', 'Miktar', 'miktar')
			.addToplamBasit('MIKTAR2', 'Miktar 2', 'miktar2')
		for (let tip of brmListe) {
			let fra = brmDict[tip]
			result.addToplamBasit(`MIKTAR${tip}`, `Miktar (${tip})`, `miktar${tip}`, null, 10, ({ colDef }) => colDef.tipDecimal(fra))
		}
		if (maliyetKullanilirmi && maliyetGorurmu) {
			let {uretimMalMuh} = app.params.uretim?.kullanim ?? {}
			result
				.addToplamBasit_bedel('STBRCIRO', 'Brüt Ciro', 'stbrciro')
				.addToplamBasit_bedel('ISKBEDEL', 'İskonto Bedel', 'iskbedel')
				.addToplamBasit_bedel('DIPISKONTO', 'Dip İskonto', 'dipiskonto')
				.addToplamBasit_bedel('CIRO', 'Net Ciro', 'ciro')
				.addToplamBasit_bedel('CIROFIYAT', 'Ciro Fiyat', 'cirofiyat', null, null, ({ item }) =>
					item.setFormul(['CIRO', 'MIKTAR'], ({ rec }) => rec.miktar ? roundToFiyatFra(rec.ciro / rec.miktar, 2) : 0))
				.addToplamBasit_bedel('TUMMALIYET', 'Tüm Maliyet', 'tummaliyet')
				.addToplamBasit('YUZDE_CIRO_TUMMALIYET', 'Mal. Ciro(%)', 'yuzde_ciro_tummaliyet', null, null, ({ item }) =>
					item.setFormul(['TUMMALIYET', 'CIRO'], ({ rec }) => rec.ciro ? roundToFra(rec.tummaliyet / rec.ciro * 100, 1) : 0))
				.addToplamBasit_bedel('HAMMALIYET', 'Ham Maliyet', 'hammaliyet')
			if (uretimMalMuh)
				result.addToplamBasit_bedel('MALMUH', 'Maliyet Muhasebesi', 'malmuh')
			result
				.addToplamBasit_bedel('BRUTKAR', 'Brüt Kar', 'brutkar')
				.addToplamBasit('YUZDE_CIRO_BRUTKAR', 'Kar Ciro(%)', 'yuzde_ciro_brutkar', null, null, ({ item }) =>
					item.setFormul(['BRUTKAR', 'CIRO'], ({ rec }) => rec.ciro ? roundToFra(rec.brutkar / rec.ciro * 100, 1) : 0))
				.addToplamBasit('YUZDE_MALIYET_BRUTKAR', 'Kar Mal.(%)', 'yuzde_maliyet_brutkar', null, null, ({ item }) =>
					item.setFormul(['BRUTKAR', 'TUMMALIYET'], ({ rec }) => rec.tummaliyet ? roundToFra(rec.brutkar / rec.tummaliyet * 100, 1) : 0))
				.addToplamBasit_bedel('BRMMALIYET', 'Brm. Maliyet', 'brmmaliyet', null, null, ({ item }) =>
					item.setFormul(['TUMMALIYET', 'MIKTAR'], ({ rec }) => rec.miktar ? roundToFra(rec.tummaliyet / rec.miktar, 2) : 0))
				.addToplamBasit('BRMIKTAR', 'Br. Miktar', 'brmiktar', null, null, ({ item }) =>
					item.setFormul(['BRUTKAR', 'MIKTAR'], ({ rec }) => rec.miktar ? roundToFra(rec.brutkar / rec.miktar, 2) : 0))
			// this.tabloYapiDuzenle_gc({ ...e, tip: 'MALIYET', etiket: 'Maliyet', belirtec: 'tummaliyet' })
		}
		; {
			for (let [belirtec, { ka, colDefs }] of entries(toplam)) {
				if (belirtec.includes('ISARETLIBEDEL')) {
					let {aciklama: ack} = ka
					ka.aciklama = colDefs[0].text = ack
						.replace('B-A ', '')
						.replace('İşaretli ', '')
				}
			}
		}
		//{ let {TUMMALIYET: item} = toplam; if (item) { item.ka.aciklama = item.colDefs[0].text = 'Tüm Maliyet' } }
		let baKeys = ['BORCBEDEL', 'ALACAKBEDEL', 'BORCBAKIYE', 'ALACAKBAKIYE']
		deleteKeys(toplam, ...baKeys)
		{
			let removeKeys = asSet(baKeys)
			for (let k of keys(toplam)) {
				if (k.startsWith('DEG_')) {
					let partialKey = k.split('_')[1]
					if (removeKeys[partialKey])
						delete toplam[k]
				}
			}
		}
	}
	loadServerData_queryDuzenle({ secimler: sec }) {
		let {hareketci: har} = this
		if (har) {
			let {tip: { value: shTip } = {}} = sec
			if (isArray(shTip))
				shTip = asSet(shTip)
			if (shTip) {
				let {stok: stokmu, hizmet: hizmetmi} = shTip
				har.ekUygunluk = { stokmu, hizmetmi }
			}
		}
		return super.loadServerData_queryDuzenle(...arguments)
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e)
		let {maliyetKullanilirmi} = this.class
		let {attrSet, sent, hvDegeri} = e
		let {where: wh, sahalar} = sent
		// let PrefixMiktar = 'MIKTAR'
		// let gcClause = hvDegeri('gc')
		let tarihClause = hvDegeri('tarih')
		/* if (keys(attrSet).find(key => (key.startsWith('GIRIS_') || key.startsWith('CIKIS_')))) { attrSet.GC = true } */
		this.loadServerData_queryDuzenle_sh({ ...e, kodClause: hvDegeri('shkod') })
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause: hvDegeri('must') })
		this.loadServerData_queryDuzenle_takip({ ...e, kodClause: hvDegeri('takipno') })
		/*this.loadServerData_queryDuzenle_gc({ ...e, tip: 'MIKTAR', clause: hvDegeri('miktar'), gcClause, tarihClause })
		this.loadServerData_queryDuzenle_gc({ ...e, tip: 'MIKTAR2', clause: hvDegeri('miktar2'), gcClause, tarihClause })
		if (maliyetKullanilirmi) {
			let clause = hvDegeri('fmaliyet'), gcClause = hvDegeri('gc')
			this.loadServerData_queryDuzenle_gc({ ...e, tip: 'MALIYET', clause, gcClause, tarihClause })
		}*/
		for (let key in attrSet) {
			switch (key) {
				case 'SHTIP': {
					let sh = hvDegeri('sh')
					let clause = `(case when ${sh} = 'H' then 'Hizmet' else 'Stok' end)`
					sahalar.add(`${clause} shtiptext`)
				}
				case 'BRM': sahalar.add(`${hvDegeri('brm')} brm`); break
				case 'BRM2': sahalar.add(`${hvDegeri('brm2')} brm2`); break
				case 'BRMORANI': sahalar.add(`${hvDegeri('brmorani')} brmorani`); break
				case 'MIKTAR': sahalar.add(`${hvDegeri('miktar').asSumDeger()} miktar`); break
				case 'MIKTAR2': sahalar.add(`${hvDegeri('miktar2').asSumDeger()} miktar2`); break
				case 'STBRCIRO': sahalar.add(`SUM(${hvDegeri('brutbedel')}) stbrciro`); break
				case 'CIRO': sahalar.add(`SUM(${hvDegeri('bedel')} - ${hvDegeri('dipiskonto')}) ciro`); break
				case 'DIPISKONTO': sahalar.add(`SUM(${hvDegeri('dipiskonto')}) dipiskonto`); break
				case 'ISKBEDEL': sahalar.add(`SUM(${hvDegeri('brutbedel')} - ${hvDegeri('bedel')}) iskbedel`); break
				case 'TUMMALIYET': sahalar.add(`SUM(${hvDegeri('fmalhammadde')} + ${hvDegeri('fmalmuh')}) tummaliyet`); break
				case 'HAMMALIYET': sahalar.add(`SUM(${hvDegeri('fmalhammadde')}) hammaliyet`); break
				case 'MALMUH': sahalar.add(`SUM(${hvDegeri('fmalmuh')}) malmuh`); break
				case 'BRUTKAR':
					sahalar.add(`SUM(${hvDegeri('bedel')} - ${hvDegeri('dipiskonto')} - (${hvDegeri('fmalhammadde')} + ${hvDegeri('fmalmuh')})) brutkar`)
					break
				default: {
					let hizmetmi = hvDegeri('shTipi') == `'H'`
					let mstAlias = hizmetmi ? 'hiz' : 'stk'
					for (let prefix of ['MIKTAR', 'MIKTAR2']) {
						if (key != prefix && key.startsWith(prefix)) {
							let brmTip = key.slice(prefix.length)?.toUpperCase()
							let clause = this.getBrmliMiktarClause({    // SUM(...) içinde verir
								brmTip, mstAlias, harAlias: '',
								getMiktarClause: hvAlias => hvDegeri(hvAlias)
							})
							sahalar.add(`${clause} miktar${brmTip}`)
						}
					}
					break
				}
			}
		}
	}
}

class DRapor_Hareketci_AlimSatisOrtak extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return null } static get araSeviyemi() { return this == DRapor_Hareketci_AlimSatisOrtak }
}
class DRapor_Hareketci_AlimSatisOrtak_Main extends DRapor_Hareketci_AlimSatisVeSiparisOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_AlimSatisOrtak }
	static get maliyetKullanilirmi() { return true }
	tabloYapiDuzenle({ result }) {
		let e = arguments[0]; super.tabloYapiDuzenle(e)
		this.tabloYapiDuzenle_odemeGun(e)
	}
}
class DRapor_Hareketci_Satislar extends DRapor_Hareketci_AlimSatisOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'SATIS' } static get kategoriAdi() { return 'Satışlar' }
	static get vioAdim() { return 'ST-IR' } static get hareketciSinif() { return SatisHareketci } 
}
class DRapor_Hareketci_Satislar_Main extends DRapor_Hareketci_AlimSatisOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Satislar }
}
class DRapor_Hareketci_Alimlar extends DRapor_Hareketci_AlimSatisOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'ALIM' } static get kategoriAdi() { return 'Alımlar' }
	static get vioAdim() { return 'ST-IR' } static get hareketciSinif() { return AlimHareketci } 
}
class DRapor_Hareketci_Alimlar_Main extends DRapor_Hareketci_AlimSatisOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Alimlar }
}

class DRapor_Hareketci_AlimSatisSipOrtak extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return null } static get araSeviyemi() { return this == DRapor_Hareketci_AlimSatisSipOrtak }
}
class DRapor_Hareketci_AlimSatisSipOrtak_Main extends DRapor_Hareketci_AlimSatisVeSiparisOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_AlimSatisSipOrtak }
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		{
			let grupKod = 'donemVeTarih'
			sec.secimTopluEkle({
				beklemeDurumu: new SecimTekSecim({
					grupKod, etiket: 'Bekleme Durumu',
					tekSecim: new BuDigerVeHepsi([
						`<span class=forestgreen>Bekleyenler</span>`,
						`<span class=firebrick>KAPANMIŞ</span>`
					]).buYap()
				})
			})
			/*sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
				let {beklemeDurumu: { tekSecim: beklemeDurumu }} = sec
				if (!beklemeDurumu.hepsimi)
					wh.add(beklemeDurumu.getTersBoolBitClause('fis.kapandi'))
			})*/
		}
	}
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments)
		result
			.addToplamBasit('SEVKMIKTAR', 'Sevk Miktar', 'sevkmiktar')
			.addToplamBasit('SEVKMIKTAR2', 'Sevk Miktar 2', 'sevkmiktar2')
			.addToplamBasit('KALANMIKTAR', 'Kalan Miktar', 'kalanmiktar')
			.addToplamBasit('KALANMIKTAR2', 'Kalan Miktar 2', 'kalanmiktar2')
			.addToplamBasit('FIYAT', 'Fiyat', 'fiyat')
			.addToplamBasit_fiyat('BRUTBEDEL', 'Brüt Bedel', 'brutbedel')
			.addToplamBasit_bedel('BEDEL', 'Net Bedel', 'bedel')
			.addToplamBasit_bedel('SEVKBEDEL', 'Sevk Bedeli', 'sevkbedel')
			.addToplamBasit_bedel('KALANBEDEL', 'Kalan Bedeli', 'kalanbedel')
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e)
		let {secimler: sec, class: { almSat }} = this
		let {attrSet, sent, hvDegeri} = e
		let {where: wh, sahalar} = sent
		let mc = {
			miktar: hvDegeri('miktar'), miktar2: hvDegeri('miktar2'),
			fiyat: hvDegeri('fiyat'), brutBedel: hvDegeri('brutbedel'), bedel: hvDegeri('bedel'),
			sevk: 'COALESCE(sdon.sevkmiktar, 0)'
		}
		mc.kalan = `${mc.miktar} - ${mc.sevk}`
		for (let key in attrSet) {
			switch (key) {
				case 'SEVKTARIHX': sahalar.add(`sdon.sevktarihx`); break
				case 'SEVKNOX': sahalar.add(`sdon.sevknox`); break
				case 'MIKTAR': sahalar.add(`SUM(${mc.miktar}) miktar`); break
				case 'MIKTAR2': sahalar.add(`SUM(${mc.miktar2}) miktar2`); break
				case 'FIYAT': sahalar.add(`SUM(${mc.fiyat}) fiyat`); break
				case 'BRUTBEDEL': sahalar.add(`SUM(${mc.brutBedel}) brutbedel`); break
				case 'BEDEL': sahalar.add(`SUM(${mc.bedel}) bedel`); break
				case 'SEVKMIKTAR': sahalar.add(`SUM(${mc.sevk}) sevkmiktar`); break
				case 'SEVKMIKTAR2': sahalar.add(`SUM(ROUND(${mc.sevk} * ${mc.miktar2} / ${mc.miktar}, 3)) sevkmiktar2`); break
				case 'KALANMIKTAR': sahalar.add(`SUM(${mc.kalan}) kalanmiktar`); break
				case 'KALANMIKTAR2': sahalar.add(`SUM(ROUND(${mc.kalan} * ${mc.miktar2} / ${mc.miktar}, 3)) kalanmiktar2`); break
				case 'SEVKBEDEL': sahalar.add(`SUM(ROUND(${mc.bedel} * ${mc.sevk} / ${mc.miktar}, 2)) sevkbedel`); break
				case 'KALANBEDEL': sahalar.add(`SUM(ROUND(${mc.bedel} * ${mc.kalan} / ${mc.miktar}, 2)) kalanbedel`); break
			}
		}
	}
	loadServerData_queryDuzenle_hrkStm_sonIslemler({  attrSet }) {
		let e = arguments[0]
		super.loadServerData_queryDuzenle_hrkStm_sonIslemler(e)
		let sevkMiktarBedelKeys = ['SEVKMIKTAR', 'SEVKMIKTAR2', 'KALANMIKTAR', 'KALANMIKTAR2', 'SEVKBEDEL', 'KALANBEDEL']
		let sevkBelgeKeys = ['SEVKTARIHX', 'SEVKNOX']
		let gereksinim = e.gereksinim = {
			miktarBedel: sevkMiktarBedelKeys.some(key => attrSet[key]),
			belge: sevkBelgeKeys.some(key => attrSet[key])
		}
		if (gereksinim.miktarBedel || gereksinim.belge)
			this.loadServerData_queryDuzenle_hrkStm_sonIslemler_sevkBaglanti(e)
	}
	loadServerData_queryDuzenle_hrkStm_sonIslemler_sevkBaglanti({ secimler: sec, stm, uni, attrSet, gereksinim }) {
		let {class: { almSat }} = this
		let {tip: { value: shTip } = {}} = sec
		if (isArray(shTip))
			shTip = asSet(shTip)
		let {beklemeDurumu: { tekSecim: beklemeDurumu }} = sec
		let {with: _with} = stm
		let withEkle = hizmetmi => {
			let sh = hizmetmi ? 'hizmet' : 'stok'
			let harTable = `sip${sh}`, donTable = `sip2if${sh}`
			let pifHarTable = `pif${sh}`
			let sent = new MQSent(), {where: wh, sahalar} = sent
			sent
				.fisHareket('sipfis', harTable)
				.leftJoin('har', `${donTable} don`, 'har.kaysayac = don.sipharsayac')
				// .fis2CariBagla().har2StokBagla()
			wh.fisSilindiEkle()
			this.donemBagla({ ...e, sent, tarihSaha: 'fis.tarih' })
			if (almSat)
				wh.degerAta(almSat, 'fis.almsat')
			sahalar.add('har.kaysayac harsayac')
			if (gereksinim.belge) {
				sent
					.leftJoin('don', `${pifHarTable} dhar`, 'don.ifharsayac = dhar.kaysayac')
					.leftJoin('dhar', 'piffis dfis', 'dhar.fissayac = dfis.kaysayac')
				sahalar.add(
					`STRING_AGG(CONVERT(VARCHAR(10), dfis.tarih, 104), '\n') sevktarihx`,
					`STRING_AGG(dfis.fisnox, '\n') sevknox`
				)
			}
			if (gereksinim.miktarBedel)
				sahalar.add('SUM(don.busevkmiktar) sevkmiktar')
			sent.groupByOlustur()
			_with.add(sent.asTmpTable(`sipvedonusum_${sh}`))
		}
		; {
			if (!shTip || shTip.stok)
				withEkle(false)
			if (!shTip || shTip.hizmet)
				withEkle(true)
		}
		let mc = { miktar: 'har.miktar', sevk: `COALESCE(sdon.sevkmiktar, 0)` }
		extend(mc, { kalan: `${mc.miktar} - ${mc.sevk}` })
		uni ??= stm.sent
		for (let sent of uni) {
			let {from, where: wh} = sent
			let hizmetmi = from.aliasIcinTable('har').deger == 'siphizmet'
			let sh = hizmetmi ? 'hizmet' : 'stok', prefix = hizmetmi ? 'h' : 's'
			/*if (shTip) {
				if (hizmetmi && !shTip.hizmet)
					continue
				if (!hizmetmi && !shTip.stok)
					continue
			}*/
			let donTmpTable = `sipvedonusum_${sh}`
			sent.leftJoin('har', `${donTmpTable} sdon`, 'har.kaysayac = sdon.harsayac')
			if (beklemeDurumu?.bumu)            // Bekleyenler
				wh.add(`fis.kapandi = ''`, `har.kapandi = ''`, `${mc.kalan} > 0`)
			else if (beklemeDurumu?.digermi)    // Kapanmışlar
				wh.add(new MQOrClause([`fis.kapandi <> ''`, `har.kapandi <> ''`, `${mc.kalan} <= 0`]))
		}
	}

	/*
		let sent = new MQSent(), {where: wh, sahalar} = sent
		sent
			.fisHareket('sipfis', 'sipstok')
			.leftJoin('har', 'sip2ifstok don', 'har.kaysayac = don.sipharsayac')
			.fis2CariBagla().har2StokBagla()
		wh.fisSilindiEkle()
		this.donemBagla({ ...e, sent, tarihSaha: 'fis.tarih' })
		if (almSat)
			wh.degerAta(almSat, 'fis.almsat')
		sahalar.add('har.kaysayac harsayac', 'SUM(don.busevkmiktar) sevkmiktar')
		if (attrSet.SEVKTARIHX || attrSet.SEVKNOX) {
			sent
				.leftJoin('don', 'pifstok dhar', 'don.ifharsayac = dhar.kaysayac')
				.leftJoin('dhar', 'piffis dfis', 'dhar.fissayac = dfis.kaysayac')
			sahalar.add(
				`STRING_AGG(CONVERT(VARCHAR(10), dfis.tarih, 104), '\n') sevktarihx`,
				`STRING_AGG(dfis.fisnox, '\n') sevknox`
			)
		}
		sent.groupByOlustur()
		stm.with.add(sent.asTmpTable('sipvedonusum'))
	
		{
			let _sent = new MQSent(), {where: wh, sahalar, having} = _sent
			_sent 
				.fromAdd('sipvedonusum sdon')
				.fromIliski('sipstok har', 'sdon.harsayac = har.kaysayac')
				.fromIliski('sipfis fis', 'har.fissayac = fis.kaysayac')
				.fis2CariBagla().har2StokBagla()
			if (beklemeDurumu?.bumu)            // Bekleyenler
				wh.add(`fis.kapandi = ''`, `har.kapandi = ''`, `${mc.kalan} > 0`)
			else if (beklemeDurumu?.digermi)    // Kapanmışlar
				wh.add(new MQOrClause([`fis.kapandi <> ''`, `har.kapandi <> ''`, `${mc.kalan} <= 0`]))
		}
	*/
}
class DRapor_Hareketci_SipSatislar extends DRapor_Hareketci_AlimSatisSipOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'SATIS' } static get kategoriAdi() { return 'Satış Siparişler' }
	static get vioAdim() { return 'ST-IR' } static get hareketciSinif() { return SatisSipHareketci }
}
class DRapor_Hareketci_SipSatislar_Main extends DRapor_Hareketci_AlimSatisSipOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_SipSatislar }
}
class DRapor_Hareketci_SipAlimlar extends DRapor_Hareketci_AlimSatisSipOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'ALIM' } static get kategoriAdi() { return 'Alımlar' }
	static get vioAdim() { return 'ST-IR' } static get hareketciSinif() { return AlimSipHareketci } 
}
class DRapor_Hareketci_SipAlimlar_Main extends DRapor_Hareketci_AlimSatisSipOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_SipAlimlar }
}

class DRapor_Hareketci_Cari extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/* static get oncelik() { return 10 } */
	static get kategoriKod() { return 'CARI' } static get kategoriAdi() { return 'Cari' }
	static get vioAdim() { return 'CR-TT' } static get hareketciSinif() { return CariHareketci }
}
class DRapor_Hareketci_Cari_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Cari }
	static get ticarimi() { return true }
	tabloYapiDuzenle({ result }) {
		this.tabloYapiDuzenle_cari(...arguments)
		super.tabloYapiDuzenle(...arguments)
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e)
		let {hvDegeri} = e, kodClause = hvDegeri('must')
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause })
		this.loadServerData_queryDuzenle_odemeGun({ ...e, kodClause: hvDegeri('odgunkod') })
	}
	tabloYapiDuzenle_odemeGun(e) { super.super_tabloYapiDuzenle_odemeGun(e) }
}

class DRapor_Hareketci_Kasa extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'KASA' } static get kategoriAdi() { return 'Kasa' }
	static get vioAdim() { return 'KS-RT' }
	static get hareketciSinif() { return KasaHareketci }
}
class DRapor_Hareketci_Kasa_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Kasa }
	static get ticarimi() { return true }
	tabloYapiDuzenle({ result }) {
		result.addKAPrefix('kasa').addGrupBasit('KASA', 'Kasa', 'kasa', DMQKasa);
		super.tabloYapiDuzenle(...arguments)
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e);
		let {attrSet, sent, hvDegeri} = e, {where: wh, sahalar} = sent, kodClause = hvDegeri('kasakod');
		if (attrSet.KASA) { sent.fromIliski('kasmst kas', `${kodClause} = kas.kod`) }
		for (let key in attrSet) {
			switch (key) { case 'KASA': sahalar.add(`${kodClause} kasakod`, 'kas.aciklama kasaadi'); wh.icerikKisitDuzenle_kasa({ ...e, saha: kodClause }); break }
		}
	}
}

class DRapor_Hareketci_Hizmet extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'Hizmet' } static get kategoriAdi() { return 'Hizmet' }
	static get vioAdim() { return 'HZ-TT' } static get hareketciSinif() { return HizmetHareketci }
}
class DRapor_Hareketci_Hizmet_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Hizmet }
	static get ticarimi() { return true }
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		sec.secimTopluEkle({
			hizmetTipi: new SecimBirKismi({ etiket: 'Hizmet Tipi', tekSecimSinif: HizmetTipi, grupKod: 'HIZMET' }).birKismi()
		})
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => { wh.birKismi(sec.hizmetTipi, 'hiz.tip') })
	}
	tabloYapiDuzenle({ result }) {
		result
			.addKAPrefix('anagrup', 'grup', 'histgrup', 'kategori')
			.addGrup(new TabloYapiItem().setKA('HZANAGRP', 'Hizmet Ana Grup').secimKullanilir().setMFSinif(DMQHizmetAnaGrup)
				.addColDef(new GridKolon({ belirtec: 'anagrup', text: 'Hizmet Ana Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HZGRP', 'Hizmet Grup').secimKullanilir().setMFSinif(DMQHizmetGrup)
				.addColDef(new GridKolon({ belirtec: 'grup', text: 'Hizmet Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HZISTGRP', 'Hizmet İst. Grup').secimKullanilir().setMFSinif(DMQHizmetIstGrup)
				.addColDef(new GridKolon({ belirtec: 'sistgrup', text: 'Hizmet İst. Grup', maxWidth: 450, filterType: 'checkedlist' })));
		this.tabloYapiDuzenle_hizmet(...arguments);
		result
			.addGrup(new TabloYapiItem().setKA('KATEGORI', 'Kategori').secimKullanilir().setMFSinif(DMQKategori)
				.addColDef(new GridKolon({ belirtec: 'kategori', text: 'Kategori', maxWidth: 600, filterType: 'input' })))
			.addGrup(new TabloYapiItem().setKA('KATDETAY', 'Kategori Detay')
				.addColDef(new GridKolon({ belirtec: 'katdetay', text: 'Kat. Detay', maxWidth: 600, filterType: 'input' })));
		super.tabloYapiDuzenle(...arguments)
	}
	loadServerData_queryDuzenle_hrkSent({ sent, attrSet, hvDegeri }) {
		super.loadServerData_queryDuzenle_hrkSent(...arguments)
		let {sqlNull} = Hareketci_UniBilgi.ortakArgs;
		let {from, sahalar, where: wh} = sent, kDetayClause;
		let kodClause = hvDegeri('hizmetkod'); this.loadServerData_queryDuzenle_hizmet({ ...arguments[0], kodClause });
		if (attrSet.HZANAGRP) { sent.hizmet2GrupBagla() }
		if (attrSet.HZANAGRP || attrSet.HZGRP || attrSet.HZISTGRP) { sent.x2HizmetBagla({ kodClause }) }
		if (attrSet.KATEGORI || attrSet.KATDETAY) {
			kDetayClause = hvDegeri('kdetaysayac');
			if (kDetayClause?.sqlDoluDegermi()) { sent.har2KatDetayBagla({ kodClause: kDetayClause }) }
			else { sent.x2KatDetayBagla({ alias: 'fis', kodClause: sqlNull }) }
		}
		for (const key in attrSet) {
			switch (key) {
				case 'HZANAGRP': sent.hizmetGrup2AnaGrupBagla(); sahalar.add('grp.anagrupkod', 'agrp.aciklama anagrupadi'); wh.icerikKisitDuzenle_hizmetAnaGrup({ ...arguments[0], saha: 'grp.anagrupkod' }); break
				case 'HZGRP': sent.hizmet2GrupBagla(); sahalar.add('hiz.grupkod', 'grp.aciklama grupadi'); wh.icerikKisitDuzenle_hizmetGrup({ ...arguments[0], saha: 'hiz.grupkod' }); break
				case 'HZISTGRP': sent.hizmet2IstGrupBagla(); sahalar.add('hiz.histgrupkod', 'higrp.aciklama histgrupadi'); wh.icerikKisitDuzenle_hizmetIstGrup({ ...arguments[0], saha: 'grp.histgrupkod' }); break
				case 'KATDETAY': sahalar.add('kdet.kdetay katdetay'); break
				case 'KATEGORI':
					sent.leftJoin('kdet', 'kategori kat', 'kdet.fissayac = kat.kaysayac');
					sahalar.add('kat.kod kategorikod', 'kat.aciklama kategoriadi');
					break
			}
		}
		return this
	}
	tabloYapiDuzenle_odemeGun(e) { super.super_tabloYapiDuzenle_odemeGun(e) }
}

class DRapor_Hareketci_BankaOrtak extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return this == DRapor_Hareketci_BankaOrtak }
	static get kategoriKod() { return 'BANKA' } static get kategoriAdi() { return 'Banka' }
}
class DRapor_Hareketci_BankaOrtak_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_BankaOrtak }
	static get ticarimi() { return true }

	tabloYapiDuzenle({ result }) {
		result.addKAPrefix('banhesap', 'banka')
			.addGrupBasit('BANKAHESAP', 'Banka Hesap', 'banhesap', DMQBankaHesap)
			.addGrupBasit('BANKA', 'Banka', 'banka', DMQBanka, null, ({ item }) => item.secimKullanilmaz())
		super.tabloYapiDuzenle(...arguments)
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e);
		let {attrSet, sent, hvDegeri} = e, {where: wh, sahalar} = sent, kodClause = hvDegeri('banhesapkod');
		if (attrSet.BANKAHESAP || attrSet.BANKA) { sent.fromIliski('banbizhesap bhes', `${kodClause} = bhes.kod`) }
		if (attrSet.BANKA) { sent.fromIliski('banmst ban', 'bhes.bankakod = ban.kod') }
		for (let key in attrSet) {
			switch (key) { case 'BANKAHESAP': sahalar.add(`${kodClause} banhesapkod`, 'bhes.aciklama banhesapadi'); wh.icerikKisitDuzenle_bankaHesap({ ...e, saha: kodClause }); break }
			switch (key) { case 'BANKA': sahalar.add('bhes.bankakod', 'ban.aciklama bankaadi'); wh.icerikKisitDuzenle_banka({ ...e, saha: 'bhes.bankakod' }); break }
		}
	}
}
class DRapor_Hareketci_BankaMevduat extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'BN-MO' } static get hareketciSinif() { return BankaMevduatHareketci }
}
class DRapor_Hareketci_BankaMevduat_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_BankaMevduat }
}
class DRapor_Hareketci_BankaYatirim extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'BN-YO' }
	static get uygunmu() { return super.uygunmu }
	static get hareketciSinif() { return this.totalmi ? BankaYatirimKalanHareketci : BankaYatirimHareketci }
}
class DRapor_Hareketci_BankaYatirim_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_BankaYatirim }
}
class DRapor_Hareketci_POSKrOrtak extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return this == DRapor_Hareketci_POSKrOrtak }
	static get hareketciSinif() { return PsKrOrtakHareketci }
}
class DRapor_Hareketci_POSKrOrtak_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_POSKrOrtak }
	static get posKosulMQSinif() { return DMQPosKrHesap }
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments)
		let {posKosulMQSinif} = this.class
		result.addKAPrefix('poskosul')
		result.addGrupBasit('POSKOSUL', posKosulMQSinif.sinifAdi, 'poskosul', posKosulMQSinif)
	}
	loadServerData_queryDuzenle_hrkSent({ attrSet, hv, hvDegeri, sent, sent: { where: wh, sahalar } }) {
		let e = arguments[0]; super.loadServerData_queryDuzenle_hrkSent(e)
		let clause_posKosul = hvDegeri('poskosulkod')
		if (attrSet.POSKOSUL)
			sent.fromIliski('poskosul kos', `${clause_posKosul} = kos.kod`)
		for (let key in attrSet) {
			switch (key) {
				case 'POSKOSUL':
					sahalar.add(`${clause_posKosul} poskosulkod`, 'kos.aciklama poskosuladi')
					wh.icerikKisitDuzenle_posKosul({ ...e, saha: clause_posKosul})
					break
			}
		}
	}
}
class DRapor_Hareketci_POS extends DRapor_Hareketci_POSKrOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'BN-PRO' } static get hareketciSinif() { return POSHareketci }
}
class DRapor_Hareketci_POS_Main extends DRapor_Hareketci_POSKrOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_POS }
	static get posKosulMQSinif() { return DMQPosHesap }
}
class DRapor_Hareketci_KrediKarti extends DRapor_Hareketci_POSKrOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'BN-DRO' } static get hareketciSinif() { return KrediKartiHareketci }
}
class DRapor_Hareketci_KrediKarti_Main extends DRapor_Hareketci_POSKrOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_KrediKarti }
	static get posKosulMQSinif() { return DMQKrediKarti }
}
class DRapor_Hareketci_KrediTaksit extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'BN-KRO' } static get hareketciSinif() { return KrediTaksitHareketci }
}
class DRapor_Hareketci_KrediTaksit_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_KrediTaksit }
}
class DRapor_Hareketci_Akreditif extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'BN-AHR' } static get hareketciSinif() { return BankaAkreditifHareketci }
}
class DRapor_Hareketci_Akreditif_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Akreditif }
}
class DRapor_Hareketci_TeminatMektup extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'BN-TRH' } static get hareketciSinif() { return BankaTeminatMektupHareketci }
}
class DRapor_Hareketci_TeminatMektup_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_TeminatMektup }
}

class DRapor_Hareketci_CekSenet extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'CS' } static get kategoriAdi() { return 'Çek/Senet' }
	static get vioAdim() { return 'CS-TP' } static get hareketciSinif() { return CSHareketci }
}
class DRapor_Hareketci_CekSenet_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_CekSenet }
	static get ticarimi() { return true }
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		let grupKod = 'donemVeTarih'
		sec.secimTopluEkle({
			belgeTipi: new SecimBirKismi({ grupKod, etiket: 'Belge Tipi', tekSecimSinif: CSBelgeTipi, default: null }).birKismi(),
			portfTipi: new SecimBirKismi({ grupKod, etiket: 'Portf. Tipi', tekSecimSinif: CSPortfTipi, default: null }).birKismi(),
			portfoydeOlanlar: new SecimBoolTrue({ grupKod, etiket: 'Portfoyde Olanlar' })
		})
		sec.whereBlockEkle(({ secimler: sec, where: wh, alias, hvDegeri, hv }) => {
			let {raporClass: { hareketciSinif: harSinif }} = this.class
			{
				let clause = hvDegeri('belgetipi')
				if (clause)
					wh.birKismi(sec.belgeTipi, clause)
			}
			{
				let clause = hvDegeri('portftipi')
				if (clause)
					wh.birKismi(sec.portfTipi, clause)
			}
			if (sec.portfoydeOlanlar.value)
				harSinif.ortakSentDuzenle_isiBitenlerHaric({ sender: this, hv, where: wh })
		})
	}
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments)
		// result.addKAPrefix('portftipi')
		result
			.addGrupBasit('PORTFTIPIADI', 'Portföy Tipi', 'portftipiadi', null, null, ({ item }) => item.noOrderBy())
	}
	loadServerData_queryDuzenle_hrkSent({ attrSet, hvDegeri, sent, sent: { where: wh, sahalar } }) {
		super.loadServerData_queryDuzenle_hrkSent(...arguments)
		// if (attrSet.KASA) { sent.fromIliski('kasmst kas', `${kodClause} = kas.kod`) }
		for (let key in attrSet) {
			switch (key) {
				case 'PORTFTIPI': {
					let alias = 'portftipi', clause = hvDegeri(alias)
					sahalar.add(`${clause} ${alias}`)
					break
				}
				case 'PORTFTIPIADI': {
					let clause = CSPortfTipi.getClause(hvDegeri('portftipi'))
					sahalar.add(`${clause} portftipiadi`)
					break
				}
			}
		}
	}
	tabloYapiDuzenle_takip(e) { /* do nothing */ }
}

class DRapor_Hareketci_Masraf extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'MASRAF' } static get kategoriAdi() { return 'Masraf' }
	static get vioAdim() { return null } static get hareketciSinif() { return MasrafHareketci }
}
class DRapor_Hareketci_Masraf_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Masraf }
	static get ticarimi() { return true }
	
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments); this.tabloYapiDuzenle_cari(...arguments);
		result.addKAPrefix('masraf')
			.addGrupBasit('MASRAF', 'Masraf', 'masraf', DMQMasraf, null, null, 'masrafkod')
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e);
		let {attrSet, sent, hvDegeri} = e, {where: wh, sahalar} = sent, kodClause = hvDegeri('masrafkod')
		sent.fromIliski('stkmasraf kas', `${kodClause} = mas.kod`);
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause: 'car.must' });
		for (let key in attrSet) {
			switch (key) {
				case 'MASRAF': sahalar.add(`${kodClause} masrafkod`, 'mas.aciklama masrafadi'); break
			}
		}
	}
	async loadServerData_recsDuzenleIlk({ recs }) {
		/*let kod2Adi; for (let rec of recs) {
			let {masrafkod: kod, masrafadi: adi} = rec;
			if (adi == null) {
				if (kod2Adi == null) { kod2Adi = await DMQMasraf.getGloKod2Adi() }
				adi = rec.masrafadi = kod2Adi[kod]?.trimEnd() ?? ''
			}
		}*/
		await super.loadServerData_recsDuzenleIlk(...arguments)
	}
}

class DRapor_Hareketci_Takip extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'TAKIP' } static get kategoriAdi() { return 'Takip' }
	static get vioAdim() { return null } static get hareketciSinif() { return TakipHareketci } 
}
class DRapor_Hareketci_Takip_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Takip }
	static get ticarimi() { return true }

	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments); let {isAdmin, rol} = config.session ?? {}, maliyetGorurmu = isAdmin || !rol?.ozelRolVarmi('XMALYT');
		this.tabloYapiDuzenle_cari(...arguments).tabloYapiDuzenle_takip(...arguments)
		if (maliyetGorurmu) {
			result
				.addToplamBasit_bedel('TUMMALIYET', 'Tüm Maliyet', 'tummaliyet')
				.addToplamBasit('YUZDE_CIRO_TUMMALIYET', 'Mal. Ciro(%)', 'yuzde_ciro_tummaliyet', null, null, ({ item }) =>
					item.setFormul(['TUMMALIYET', 'ISARETLIBEDEL'], ({ rec }) => rec.isaretlibedel ? roundToFra((rec.tummaliyet / rec.isaretlibedel) * 100, 1) : 0))
				.addToplamBasit_bedel('BRUTKAR', 'Brüt Kar', 'brutkar')
				.addToplamBasit('YUZDE_CIRO_BRUTKAR', 'Kar Ciro(%)', 'yuzde_ciro_brutkar', null, null, ({ item }) =>
					item.setFormul(['BRUTKAR', 'ISARETLIBEDEL'], ({ rec }) => rec.isaretlibedel ? roundToFra((rec.brutkar / rec.isaretlibedel) * 100, 1) : 0))
				.addToplamBasit('YUZDE_MALIYET_BRUTKAR', 'Kar Mal.(%)', 'yuzde_maliyet_brutkar', null, null, ({ item }) =>
					item.setFormul(['BRUTKAR', 'TUMMALIYET'], ({ rec }) => rec.tummaliyet ? roundToFra((rec.brutkar / rec.tummaliyet) * 100, 1) : 0))
		}
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e); let {attrSet, sent, hvDegeri} = e;
		let {where: wh, sahalar} = sent, kodClause = hvDegeri('takipno');
		sent.fromIliski('takipno tak', `${kodClause} = tak.kod`);
		this.loadServerData_queryDuzenle_takip({ ...e, kodClause });
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause: 'car.must' });
		for (let key in attrSet) {
			switch (key) {
				case 'TUMMALIYET': sahalar.add(`${hvDegeri('maliyet').asSumDeger()} tummaliyet`); break
				case 'BRUTKAR': sahalar.add(`SUM(${hvDegeri('isaretlibedel').sumOlmaksizin()} - ${hvDegeri('maliyet').sumOlmaksizin()}) brutkar`); break
			}
		}
	}
}

class DRapor_Hareketci_Stok extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'STOK' } static get kategoriAdi() { return 'Stok' }
	static get vioAdim() { return null } static get araSeviyemi() { return this == DRapor_Hareketci_Stok }
}
class DRapor_Hareketci_Stok_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Stok }
	static get ticarimi() { return true }

	tabloYapiDuzenle({ result }) {
		let e = arguments[0]; super.tabloYapiDuzenle(e)
		let {tip2BrmListe} = MQStokGenelParam
		let {isAdmin, rol} = config.session ?? {}
		let maliyetGorurmu = isAdmin || !rol?.ozelRolVarmi('XMALYT')
		let {toplam} = result, brmListe = keys(tip2BrmListe)
		this.tabloYapiDuzenle_cari(e).tabloYapiDuzenle_stok(e)
		this.tabloYapiDuzenle_gc({ ...e, tip: 'MIKTAR', etiket: 'Miktar' })
		this.tabloYapiDuzenle_gc({ ...e, tip: 'MIKTAR2', etiket: 'Miktar2' })
		if (maliyetGorurmu)
			this.tabloYapiDuzenle_gc({ ...e, tip: 'MALIYET', etiket: 'Maliyet', belirtec: 'tummaliyet' })
		{
			let {ISARETLIBEDEL: item} = toplam
			if (item)
				item.ka.aciklama = item.colDefs[0].text = 'Bedel'
		}
		//{ let {TUMMALIYET: item} = toplam; if (item) { item.ka.aciklama = item.colDefs[0].text = 'Tüm Maliyet' } }
		deleteKeys(toplam, 'BORCBEDEL', 'ALACAKBEDEL', 'TUMMALIYET')
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e); let {attrSet, sent, hvDegeri} = e;
		let {where: wh, sahalar} = sent, PrefixMiktar = 'MIKTAR', gcClause = hvDegeri('gc'), tarihClause = hvDegeri('tarih');
		/* if (Object.keys(attrSet).find(key => (key.startsWith('GIRIS_') || key.startsWith('CIKIS_')))) { attrSet.GC = true } */
		this.loadServerData_queryDuzenle_stok({ ...e, kodClause: hvDegeri('stokkod') });
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause: hvDegeri('must') });
		this.loadServerData_queryDuzenle_takip({ ...e, kodClause: hvDegeri('takipno') });
		this.loadServerData_queryDuzenle_gc({ ...e, tip: 'MIKTAR', clause: hvDegeri('miktar'), gcClause, tarihClause });
		this.loadServerData_queryDuzenle_gc({ ...e, tip: 'MIKTAR2', clause: hvDegeri('miktar2'), gcClause, tarihClause });
		this.loadServerData_queryDuzenle_gc({ ...e, tip: 'MALIYET', clause: hvDegeri('fmaliyet'), gcClause, tarihClause })
		for (let key in attrSet) {
			switch (key) {
				case 'BRM': sahalar.add(`${hvDegeri('brm')} brm`); break
				case 'BRM2': sahalar.add(`${hvDegeri('brm2')} brm2`); break
				case 'BRMORANI': sahalar.add('stk.brmorani'); break
			}
		}
	}
}
class DRapor_Hareketci_Stok_Gercek extends DRapor_Hareketci_Stok {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return this.hareketmi ? 'ST-AH' : this.envantermi ? 'ST-LE' : 'ST-AH' }
	static get hareketciSinif() { return StokHareketci_Gercek } 
}
class DRapor_Hareketci_Stok_Gercek_Main extends DRapor_Hareketci_Stok_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Stok_Gercek }
}
class DRapor_Hareketci_Stok_Maliyetli extends DRapor_Hareketci_Stok {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return this.hareketmi ? 'ST-AH' : this.envantermi ? 'ML-RH' : 'ML-RE' }
	static get hareketciSinif() { return StokHareketci_Maliyetli } 
}
class DRapor_Hareketci_Stok_Maliyetli_Main extends DRapor_Hareketci_Stok_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Stok_Maliyetli }
}

class DRapor_Hareketci_Tahsilat extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/* static get oncelik() { return 10 } */
	static get kategoriKod() { return 'TAHSILAT' } static get kategoriAdi() { return 'Tahsilat' }
	static get vioAdim() { return 'CR-CT' } static get hareketciSinif() { return TahsilatHareketci }
}
class DRapor_Hareketci_Tahsilat_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Tahsilat }
	static get ticarimi() { return true }

	tabloYapiDuzenle({ result }) {
		let e = arguments[0]
		this.tabloYapiDuzenle_tahsilSekli(e)
		this.tabloYapiDuzenle_cari(e)
		super.tabloYapiDuzenle(e)
	}
	loadServerData_queryDuzenle_hrkSent({ hvDegeri }) {
		let e = arguments[0]
		super.loadServerData_queryDuzenle_hrkSent(e)
		this.loadServerData_queryDuzenle_tahsilSekli({ ...e, kodClause: hvDegeri('tahseklino') })
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause: hvDegeri('must') })
		this.loadServerData_queryDuzenle_odemeGun({ ...e, kodClause: hvDegeri('odgunkod') })
	}
	tabloYapiDuzenle_odemeGun(e) { super.super_tabloYapiDuzenle_odemeGun(e) }
}

class DRapor_Hareketci_Odeme extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'ODEME' } static get kategoriAdi() { return 'Ödeme' }
	static get vioAdim() { return 'CR-CO' } static get hareketciSinif() { return OdemeHareketci }
}
class DRapor_Hareketci_Odeme_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Odeme }
	static get ticarimi() { return true }

	tabloYapiDuzenle({ result }) {
		let e = arguments[0]
		this.tabloYapiDuzenle_tahsilSekli(e)
		this.tabloYapiDuzenle_cari(e)
		super.tabloYapiDuzenle(e)
	}
	loadServerData_queryDuzenle_hrkSent({ hvDegeri }) {
		let e = arguments[0]
		super.loadServerData_queryDuzenle_hrkSent(e)
		this.loadServerData_queryDuzenle_tahsilSekli({ ...e, kodClause: hvDegeri('tahseklino') })
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause: hvDegeri('must') })
		this.loadServerData_queryDuzenle_odemeGun({ ...e, kodClause: hvDegeri('odgunkod') })
	}
	tabloYapiDuzenle_odemeGun(e) { super.super_tabloYapiDuzenle_odemeGun(e) }
}

/*class DRapor_Hareketci_SonStok extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'STOK' } static get kategoriAdi() { return 'Stok' }
	static get vioAdim() { return 'ST-SN' } static get hareketciSinif() { return SonStokHareketci }
	static get sadeceTotalmi() { return true }
}
class DRapor_Hareketci_SonStok_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_SonStok }
	static get secimSinif() { return Secimler }
	get stokmu() { return this.rapor?.stokmu }
	secimlerDuzenle({ secimler: sec }) {
		{
			let grupKod = 'donemVeTarih'
			sec.grupEkle(grupKod, ' ', false)
			sec.secimEkle('tarih', new SecimTekilDate({ etiket: '...Tarihindeki durum', grupKod }))
			sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
			})
		}
		super.superSuper_secimlerDuzenle(...arguments)
	}
	tabloYapiDuzenle({ result }) {
		let e = arguments[0]
		super.superSuper_tabloYapiDuzenle(e)    // HareketciBase > DonemselBase >> AraSeviye
		let {toplamPrefix} = this.class, {isAdmin, rol} = config.session ?? {}
		let brmDict = app.params?.stokBirim?.brmDict ?? {}
		let brmListe = keys(MQStokGenelParam.tip2BrmListe ?? {})
		result
			.addKAPrefix('sube', 'subegrup')
			.addGrupBasit('SUBE', 'Şube', 'sube', DMQSube)
			.addGrupBasit('SUBEGRUP', 'Şube Grup', 'subegrup', DMQSubeGrup)
		this.tabloYapiDuzenle_stok(e)
		if (isAdmin || !rol?.ozelRolVarmi('XMALYT')) {
			result
				.addToplamBasit_fiyat('STK_ALIMNETFIYAT', 'Alım Net Fiyat', 'stk_alimnetfiyat', null, null, ({ colDef }) => colDef.tipDecimal(2))
				.addToplamBasit_fiyat('STK_ORTMALIYET', 'Ort. Maliyet', 'stk_ortmaliyet', null, null, ({ colDef }) => colDef.tipDecimal(2))
				.addToplamBasit_fiyat('STK_RAYICALIM', 'Rayiç Alım', 'stk_rayicalim', null, null, ({ colDef }) => colDef.tipDecimal(2))
		}
		this.tabloYapiDuzenle_yer(e)
		result.addToplamBasit('MIKTAR', 'Miktar', 'miktar', null, 10, null)
		result.addToplamBasit('MIKTAR2', '2. Miktar', 'miktar2', null, 10, null)
		for (let tip of brmListe) {
			let fra = brmDict[tip]
			result.addToplamBasit(`MIKTAR${tip}`, `Miktar (${tip})`, `miktar${tip}`, null, 10, ({ colDef }) => colDef.tipDecimal(fra))
		}
		if (isAdmin || !rol?.ozelRolVarmi('XMALYT')) {
			result
				.addToplamBasit_bedel('DEG_ALIMNETFIYAT', 'Alım Net Fiyat Değerleme', 'deg_alimnetfiyat')
				.addToplamBasit_bedel('DEG_RAYICALIM', 'Rayiç Alım Değerleme', 'deg_rayicalim')
				.addToplamBasit_bedel('DEG_ORTMALIYET', 'Ort. Maliyet Değerleme', 'deg_ortmaliyet')
				.addToplamBasit_bedel('DEG_SATFIYAT1', '1. Satış Fiyat Değerleme', 'deg_satfiyat1')
		}
		this.tabloYapiDuzenle_hmr(e)
	}
	loadServerData_queryDuzenle_hrkSent({ attrSet, hvDegeri, sent, sent: { where: wh, sahalar } }) {
		let e = arguments[0]
		super.loadServerData_queryDuzenle_hrkSent(e)
		let alias = e.alias = 'son'
		if (attrSet.SUBEGRUP)
			sent.sube2GrupBagla()
		if (attrSet.DEPOGRUP)
			sent.yer2GrupBagla()
		let PrefixMiktar = 'MIKTAR'
		let degMiktarClause = `(case when stk.almfiyatmiktartipi = '2' then son.sonmiktar2 else son.sonmiktar end)`
		for (let key in attrSet) {
			switch (key) {
				case 'SUBE': sahalar.add(`${hvDegeri('bizsubekod')} subekod`, 'sub.aciklama subeadi'); wh.icerikKisitDuzenle_sube({ ...e, saha: hvDegeri('bizsubekod') }); break
				case 'SUBEGRUP': sahalar.add('sub.isygrupkod subegrupkod', 'igrp.aciklama subegrupadi'); wh.icerikKisitDuzenle_subeGrup({ ...e, saha: 'sub.isygrupkod' }); break
				case 'DEPO': sahalar.add(`${hvDegeri('yerkod')} yerkod`, 'yer.aciklama yeradi'); wh.icerikKisitDuzenle_yer({ ...e, saha: hvDegeri('yerkod') }); break
				case 'DEPOGRUP': sahalar.add('yer.yergrupkod yergrupkod', 'ygrp.aciklama yergrupadi'); wh.icerikKisitDuzenle_yerGrup({ ...e, saha: 'yer.yergrupkod' }); break
				case 'STK_ALIMNETFIYAT': sahalar.add('SUM(stk.almnetfiyat) stk_alimnetfiyat'); break
				case 'STK_ORTMALIYET': sahalar.add('SUM(stk.ortmalfiyat) stk_ortmaliyet'); break
				case 'STK_RAYICALIM': sahalar.add(`SUM(case when stk.revizerayicalimfiyati < stk.almnetfiyat then stk.almnetfiyat else stk.revizerayicalimfiyati end) stk_rayicalim`); break
				case 'DEG_ALIMNETFIYAT': sahalar.add(`SUM(ROUND(${degMiktarClause} * stk.almnetfiyat, 2)) deg_alimnetfiyat`); break
				case 'DEG_RAYICALIM': sahalar.add(`SUM(ROUND(${degMiktarClause} * stk.revizerayicalimfiyati, 2)) deg_rayicalim`); break
				case 'DEG_ORTMALIYET': sahalar.add(`SUM(ROUND(${degMiktarClause} * stk.ortmalfiyat, 2)) deg_ortmaliyet`); break
				case 'DEG_SATFIYAT1': sahalar.add(`SUM(ROUND(${degMiktarClause} * stk.satfiyat1, 2)) deg_satfiyat1`); break
				case PrefixMiktar: sahalar.add(`SUM(${hvDegeri('miktar')}) miktar`); break
				case `${PrefixMiktar}2`: sahalar.add(`SUM(${hvDegeri('miktar2')}) miktar2`); break
				case 'BRM': sahalar.add(`${hvDegeri('brm')} brm`); break
				case 'BRM2': sahalar.add(`${hvDegeri('brm2')} brm2`); break
				default: {
					if (key.startsWith(PrefixMiktar)) {
						let brmTip = key.slice(PrefixMiktar.length)?.toUpperCase();
						sahalar.add(`${this.getBrmliMiktarClause({ brmTip, mstAlias: 'stk', harAlias: alias, miktarPrefix: alias })} miktar${brmTip}`)
					}
					break
				}
			}
		}
		this.loadServerData_queryDuzenle_stok({ ...e, sent, kodClause: hvDegeri('shkod') })
		this.loadServerData_queryDuzenle_hmr({ ...e, sent, stm: [sent] })
		this.loadServerData_queryDuzenle_ek({ ...e, sent })
	}
}*/

class DRapor_Hareketci_OperBase extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'URETIM' } static get kategoriAdi() { return 'Üretim' }
	static get aciklama() { return this._aciklama }
	static get vioAdim() { return 'UR-OP' } static get hareketciSinif() { return OperBaseHareketci }
	static get sadeceTotalmi() { return true }
}
class DRapor_Hareketci_OperBase_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_OperBase }
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		let grupKod = 'donemVeTarih'
		{
			let {EMIRDURUM: item} = sec.liste
			item.birKismi().value = ['D']
			extend(item, { grupKod, etiket: 'Emir Durumu'})
		}
		sec.secimTopluEkle({
			fisNo: new SecimNumber({ grupKod, etiket: 'Emir No' }),
			operDurum: new SecimTekSecim({
				grupKod, etiket: 'Oper. Durum',
				tekSecim: new OperDurum().bu()
			})
		})
		sec.whereBlockEkle(({ secimler: sec, where: wh, hvDegeri }) => {
			wh.basiSonu(sec.fisNo, hvDegeri('fisno'))
			wh.birlestir(sec.operDurum.tekSecim.getTersNullClause('oem.bittarih'))
		})
		let {grupListe} = sec
		;['tip'].forEach(k =>
			sec.liste[k]?.hidden())
		;['EMIRDURUM'].forEach(k =>
			grupListe[k].kapalimi = false)
		// sec.addKA('must', DMQCari, ({ hv }) => hv.mustkod, 'ecar.aciklama')
	}
	tabloYapiDuzenle({ result }) {
		let e = arguments[0]; super.tabloYapiDuzenle(e)
		this.tabloYapiDuzenle_sube(e)
		result
			.addKAPrefix('fistip', 'durum', 'hat', 'oper', 'sipmust', 'kstok')
			.addGrupBasit('FISTIP', 'Fiş Tipi', 'fistip', OperFisTipi, null, null,
				'fistipkod', [_ => _.hvDegeri('fistip'), OperFisTipi.getClause('emr.fistipi')])
			.addGrupBasit('EMIRDURUM', 'Emir Durumu', 'emirdurum', EmirDevamDurumu, null, null,
				'emirdurum', [_ => _.hvDegeri('emirdurum'), EmirDevamDurumu.getClause('emr.durumu')])
			.addGrupBasit('OPERDURUM', 'Oper. Durum', 'operdurum', null, null, null,
				null, [_ => _.hvDegeri('operdurum')] )
			.addGrupBasit('HAT', 'Hat', 'hat', DMQHat, null, null,
				null, [_ => _.hvDegeri('hatkod'), 'uhat.aciklama'])
			.addGrupBasit('FISNOX', 'Emir No', 'fisnox', null, null, ({ item }) => item.setSql_hv())
			.addGrupBasit('OPER', 'Operasyon', 'oper', DMQOperasyon, null, null,
				null, [_ => _.hvDegeri('opno'), 'op.aciklama'])
			.addGrupBasit('SIPMUST', 'Sipariş Cari', 'sipmust', DMQCari, null, null,
				null, [_ => _.hvDegeri('sipmustkod'), 'ecar.birunvan'])
			.addGrupBasit('KSTOK', 'Komple Kodu', 'kstok', DMQStok, null, null,
				null, [_ => _.hvDegeri('kstokkod'), 'kstk.aciklama'])
			.addGrupBasit('SEVIYE', 'Seviye Belirtim', 'seviyebelirtim', null, null, ({ item }) => item.setSql_hv())
			.addGrupBasit('ACIKLAMA', 'Açıklama', 'aciklama', null, null, ({ item }) => item.setSql_hv())
		deleteKeys(result.grup, 'SAAT', 'ANAISLEM', 'ISLEM')
		this.tabloYapiDuzenle_stok(e)
		this.tabloYapiDuzenle_hmr(e)
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		e.alias = 'emr'
		super.loadServerData_queryDuzenle_hrkSent(e)
		let {sent, attrSet, hvDegeri} = e
		let {sahalar, where: wh} = sent
		this.donemBagla({ ...e, tarihSaha: hvDegeri('tarih') })
		this.loadServerData_queryDuzenle_sube({ ...e, kodClause: 'emr.bizsubekod' })
		this.loadServerData_queryDuzenle_stok({ ...e, kodClause: 'frm.formul' })
		this.loadServerData_queryDuzenle_hmrBasit({ ...e, alias: 'edet' })
		/*for (let key in attrSet) {
			switch (key) { }
		}*/
		this.loadServerData_queryDuzenle_tarih({ ...e, tarihClause: hvDegeri('tarih') })
	}
	tabloYapiDuzenle_ozelIsaret() { /* do nothing */ }
	loadServerData_queryDuzenle_ozelIsaret() { /* do nothing */ }
}
class DRapor_Hareketci_OperDurum extends DRapor_Hareketci_OperBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get hareketciSinif() { return OperDurumHareketci }
}
class DRapor_Hareketci_OperDurum_Main extends DRapor_Hareketci_OperBase_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_OperDurum }

	tabloYapiDuzenle({ result }) {
		let e = arguments[0]; super.tabloYapiDuzenle(e)
		result
			//.addGrupBasit('PAKET', 'Paket', 'paket', null, null, ({ item }) => item.setOrderBySaha('paketkod'))
			//.addToplamBasit('KOLI', 'Koli', 'koli')
			.addToplamBasit('EMIRMIKTAR', 'Emir Mik.', 'emirmiktar', null, null, ({ item }) => item.setSql_hv())
			.addToplamBasit('URETBRUTMIKTAR', 'Üret. Brüt', 'uretbrutmiktar', null, null, ({ item }) => item.setSql_hv())
			.addToplamBasit('URETFIREMIKTAR', 'Fire Mik.', 'uretfiremiktar', null, null, ({ item }) => item.setSql_hv())
			.addToplamBasit('ISKARTAMIKTAR', 'Isk. Mik.', 'iskartamiktar', null, null, ({ item }) => item.setSql_hv())
			.addToplamBasit('URETNETMIKTAR', 'Üret. Net', 'uretnetmiktar', null, null, ({ item }) => item.setSql_hv())
			.addToplamBasit('KALANMIKTAR', 'Kalan Mik.', 'kalanmiktar', null, null, ({ item }) => item.setSql_hv())
			.addToplamBasit('ISLENEBILIRMIKTAR', 'İşl. Mik.', 'islenebilirmiktar', null, null, ({ item }) => item.setSql_hv())
			.addToplamBasit('HAZSURESN', 'Haz.Süre (sn)', 'hazsuresn', null, null, ({ item }) => item.setSql_hv())
			.addToplamBasit('TOPSURESN', 'Top.Süre (sn)', 'topsuresn', null, null, ({ item }) => item.setSql_hv())
			.addGrupBasit('TOPSURETEXT', 'Top.Süre Text', 'topsuretext', null, 13, ({ item, colDef }) => {
				item.noOrderBy()
					.setFormul(['TOPSURESN'], ({ rec: { topsuresn: v } }) => timeToString(asDate(v)))
				colDef.alignCenter()
				extend(colDef.userData ??= {}, { ekCSS: ['bold', 'royalblue'] })
			})
	}
}
class DRapor_Hareketci_OperGer extends DRapor_Hareketci_OperBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get hareketciSinif() { return OperGerHareketci }
}
class DRapor_Hareketci_OperGer_Main extends DRapor_Hareketci_OperBase_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_OperGer }

	async ilkIslemler(e) {
		await super.ilkIslemler(e)
		this.iskNedenKod2Adi = await DMQIskNeden.getGloKod2Adi()
	}
	tabloYapiDuzenle({ result }) {
		let e = arguments[0]
		super.tabloYapiDuzenle(e)
		result.addKAPrefix('per', 'tezgah')
		result
			.addGrupBasit('PER', 'Personel', 'per', DMQPersonel, null, null,
				null, [_ => _.hvDegeri('perkod'), 'per.aciklama'])
			.addGrupBasit('TEZGAH', 'Tezgah', 'tezgah', DMQPersonel, null, null,
				null, [_ => _.hvDegeri('tezgahkod'), 'tez.aciklama'])
			.addGrupBasit('EMIRMIKTAR', 'Emir Mik.', 'emirmiktar', null, null, ({ item }) => item.setSql_hv())
			.addToplamBasit('BRUTMIKTAR', 'Brüt Mik.', 'brutmiktar', null, null, ({ item }) => item.setSql_hv())
			.addToplamBasit('FIREMIKTAR', 'Fire Mik.', 'firemiktar', null, null, ({ item }) => item.setSql_hv())
			.addToplamBasit('ISKARTAMIKTAR', 'Isk. Mik.', 'iskartamiktar', null, null, ({ item }) => item.setSql_hv())
			.addToplamBasit('NETMIKTAR', 'Net Mik.', 'netmiktar', null, null, ({ item }) => item.setSql_hv())
			.addToplamBasit('NETMIKTAR2', 'Net Mik.2', 'netmiktar2', null, null, ({ item }) => item.setSql_hv())
		let {toplam} = result
		let brmListe = keys(MQStokGenelParam.tip2BrmListe)
		let {brmDict} = app.params.stokBirim ?? {}
		for (let prefix of ['BRUT', 'FIRE', 'ISKARTA', 'NET'])
		for (let mid of ['', '2']) {
			let key = `${prefix}MIKTAR${mid}`
			let item = toplam[key]
			if (!item)
				continue
			let { colDefs: [colDef] } = item
			let { belirtec, text } = colDef
			for (let tip of brmListe) {
				let fra = brmDict[tip]
				result.addToplamBasit(`${key}${tip}`, `${text} (${tip})`, `${belirtec}${tip}`, null,
					10, ({ colDef }) => colDef.tipDecimal(fra))
			}
		}
		result
			.addToplamBasit('BRUTISLEMSURESN', 'Brüt Süre (sn)', 'brutislemsuresn', null, null, ({ item }) => item.setSql_hv())
			.addGrupBasit('BRUTISLEMSURETEXT', 'Brüt Süre Text', 'brutislemsuretext', null, 13, ({ item, colDef }) => {
				item.noOrderBy()
					.setFormul(['BRUTISLEMSURESN'], ({ rec: { brutislemsuresn: v } }) => timeToString(asDate(v)))
				colDef.alignCenter()
				extend(colDef.userData ??= {}, { ekCSS: ['bold', 'royalblue'] })
			})
			.addToplamBasit('TOPDURSURESN', 'Top Dur. (sn)', 'topduraksamasuresn', null, null, ({ item }) => item.setSql_hv())
			.addGrupBasit('TOPDURSURETEXT', 'Top Dur. Text', 'topduraksamasuretext', null, 13, ({ item, colDef }) => {
				item.noOrderBy()
					.setFormul(['TOPDURSURESN'], ({ rec: { topduraksamasuresn: v } }) => timeToString(asDate(v)))
				colDef.alignCenter()
				extend(colDef.userData ??= {}, { ekCSS: ['bold', 'royalblue'] })
			})
			.addToplamBasit('NETISLEMSURESN', 'Net Süre (sn)', 'netislemsuresn', null, null, ({ item }) => item.setSql_hv())
			.addGrupBasit('NETISLEMSURETEXT', 'Net Süre Text', 'netislemsuretext', null, 13, ({ item, colDef }) => {
				item.noOrderBy()
					.setFormul(['NETISLEMSURESN'], ({ rec: { netislemsuresn: v } }) => timeToString(asDate(v)))
				colDef.alignCenter()
				extend(colDef.userData ??= {}, { ekCSS: ['bold', 'royalblue'] })
			})

		{
			let {operGenel: { iskartaMaxSayi: iskMaxSayi = 8 } = {}} = app.params
			let {iskNedenKod2Adi} = this
			let getIskMiktarClause = kod => {
				let result = []
				for (let i = 1; i <= iskMaxSayi; i++)
					result.push(`when gdet.iskartaneden${i}kod = '${kod}' then gdet.iskartamiktar${i}`)
				return `SUM(case ${result.join(' ')} else 0 end)`
			}
			for (let [kod, adi] of entries(iskNedenKod2Adi)) {
				result.addToplamBasit(    // '...MIKTAR....' ifadesi için brm'li miktar işlemi var
					`ISKMIK${kod}`, `${adi}) Mik.`, `iskmik${kod}`, null, null, ({ item, colDef }) =>
						item.setSql([_ => getIskMiktarClause(kod)])
				)
			}
		}
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e)
		let {tabloYapi} = this, {toplam} = tabloYapi
		let {attrSet, sent, hvDegeri} = e
		let {where: wh, sahalar} = sent
		{
			let mstAlias = 'stk'
			for (let key in attrSet) 
			for (let mid of ['', '2']) {
				let partial = `MIKTAR${mid}`
				if (!key.includes(partial))
					continue
				let brmTip = key.slice(key.indexOf(partial) + partial.length)?.toUpperCase()
				if (!brmTip)
					continue
				let item = toplam[key]
				if (!item)
					continue
				let { colDefs: [colDef] } = item
				let { belirtec, belirtec: hvAlias } = colDef
				if (!hvAlias)
					continue
				if (hvAlias.endsWith(brmTip))
					hvAlias = hvAlias.slice(0, -2)
				let hvAlias2 = `${hvAlias}2`
				let clause = this.getBrmliMiktarClause({    // SUM(...) olarak verir
					brmTip, mstAlias, hvAlias, hvAlias2,
					getMiktarClause: hvAlias =>
						hvDegeri(hvAlias)
				})
				sahalar.add(`${clause} ${belirtec}`)
			}
		}
	}
}
class DRapor_Hareketci_Iskarta extends DRapor_Hareketci_OperBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get hareketciSinif() { return IskartaHareketci }
}
class DRapor_Hareketci_Iskarta_Main extends DRapor_Hareketci_OperBase_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Iskarta }

	tabloYapiDuzenle({ result }) {
		let e = arguments[0]
		super.tabloYapiDuzenle(e)
		result.addKAPrefix('neden')
		result
			.addGrupBasit('NEDEN', 'Neden', 'neden', DMQIskNeden, null, null)
				// null, [_ => _.hvDegeri('nedkod'), 'ned.aciklama'])     -- özel olarak eklenecek
			.addToplamBasit('ISKARTAMIKTAR', 'Isk. Mik.', 'iskartamiktar', null)
				// null, ({ item }) => item.setSql_hv())                  -- özel olarak eklenecek
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e)
		// let {attrSet, sent, hvDegeri} = e
		// let {where: wh, sahalar} = sent
	}
	loadServerData_queryDuzenle_hrkStm_sonIslemler(e) {
		super.loadServerData_queryDuzenle_hrkStm_sonIslemler(e)
		// let { attrSet, stm } = e
	}
}
class DRapor_Hareketci_Duraksama extends DRapor_Hareketci_OperBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get hareketciSinif() { return DuraksamaHareketci }
}
class DRapor_Hareketci_Duraksama_Main extends DRapor_Hareketci_OperBase_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Duraksama}

	tabloYapiDuzenle({ result }) {
		let e = arguments[0]
		super.tabloYapiDuzenle(e)
		result.addKAPrefix('per', 'neden', 'durtip')
		result
			.addGrupBasit('PER', 'Personel', 'per', DMQPersonel, null, null,
				null, [_ => _.hvDegeri('perkod'), 'per.aciklama'])
			.addGrupBasit('NEDEN', 'Neden', 'neden', DMQDurNeden, null, null,
				null, [_ => _.hvDegeri('nedenkod'), 'dned.aciklama'])
			.addGrupBasit('DURTIP', 'Dur. Tip', 'durtip', DurTipi, null, null,
				null, [_ => _.hvDegeri('durtipi'), _ => DurTipi.getClause(_.hvDegeri('durtipi'))])
			.addToplamBasit('DURSURESN', 'Süre (sn)', 'dursuresn', null, null, ({ item }) => item.setSql_hv())
			.addGrupBasit('DURSURETEXT', 'Süre Text', 'dursuretext', null, 13, ({ item, colDef }) => {
				item.noOrderBy()
					.setFormul(['DURSURESN'], ({ rec: { dursuresn: v } }) => timeToString(asDate(v)))
				colDef.alignCenter()
				extend(colDef.userData ??= {}, { ekCSS: ['bold', 'royalblue'] })
			})
			.addGrupBasit('DURBASTS', null, 'durbasts', null, null, ({ item }) =>
				item.setSql_hv().hidden())
			.addGrupBasit('DURBASTSTEXT', 'Başlangıç', 'durbaststext', null, null, ({ item }) =>
				item.noOrderBy()
					.setFormul(['DURBASTS'], ({ rec: { durbasts: v } }) => dateTimeAsKisaString(asDate(v)))
			)
			.addGrupBasit('DURSONTS', null, 'dursonts', null, null, ({ item }) =>
				item.setSql_hv().hidden())
			.addGrupBasit('DURSONTSTEXT', 'Bitiş', 'dursontstext', null, null, ({ item }) =>
				item.noOrderBy()
					.setFormul(['DURSONTS'], ({ rec: { dursonts: v } }) => dateTimeAsKisaString(asDate(v)))
			)
			.addGrupBasit('DURACIKLAMA', 'Dur. Açıklama', 'duraciklama', null, null, ({ item }) => item.setSql_hv())
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e)
		// let {attrSet, sent, hvDegeri} = e
		// let {where: wh, sahalar} = sent
	}
	loadServerData_queryDuzenle_hrkStm_sonIslemler(e) {
		super.loadServerData_queryDuzenle_hrkStm_sonIslemler(e)
		// let { attrSet, stm } = e
	}
}
