class DRapor_StokSiparisler extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class DRapor_StokSiparisler_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_StokSatisSiparisler }
	static get almSat() { return null }

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
					]).hepsiYap()
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
		let e = arguments[0]; super.tabloYapiDuzenle(e)
		this.tabloYapiDuzenle_ozelIsaret(e)
		this.tabloYapiDuzenle_cari(e)
		this.tabloYapiDuzenle_stok(e)
		result
			.addToplamBasit('MIKTAR', 'Miktar', 'miktar')
			.addToplamBasit('MIKTAR2', 'Miktar 2', 'miktar2')
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
	loadServerData_queryDuzenle({ attrSet, stm }) {
		let e = arguments[0]; super.loadServerData_queryDuzenle(e)
		let {secimler: sec, class: { almSat }} = this
		let {beklemeDurumu: { tekSecim: beklemeDurumu }} = sec
		{
			let otoEklenecekler = { MIKTAR: 'BRM', MIKTAR2: 'BRM2' }
			for (let [s, d] of entries(otoEklenecekler))
				if (attrSet[s] && !attrSet[d])
					attrSet[d] = true
		}
		; {
			let sent = new MQSent(), {where: wh, sahalar} = sent
			sent
				.fisHareket('sipfis', 'sipstok')
				.leftJoin('har', 'sip2ifstok don', 'har.kaysayac = don.sipharsayac')
				.fis2CariBagla().har2StokBagla()
			wh.fisSilindiEkle()
			this.donemBagla({ ...e, sent, tarihSaha: 'fis.tarih' })
			if (almSat)
				wh.degerAta(almSat, 'fis.almsat')
			if (!(beklemeDurumu.hepsimi ?? true))
				wh.add(beklemeDurumu.getTersBoolBitClause('fis.kapandi'))
			sahalar.add('har.kaysayac harsayac', 'SUM(don.busevkmiktar) sevkmiktar')
			sent.groupByOlustur()
			stm.with.add(sent.asTmpTable('sipvedonusum'))
			
		}
		let mc = {
			miktar: 'har.miktar', miktar2: 'har.miktar2',
			fiyat: 'har.fiyat', brutBedel: 'har.brutbedel', bedel: 'har.bedel',
			sevk: 'COALESCE(sdon.sevkmiktar, 0)'
		}
		mc.kalan = `${mc.miktar} - ${mc.sevk}`
		; {
			// asıl sent
			let sent = stm.sent = new MQSent(), {where: wh, sahalar} = sent
			sent 
				.fromAdd('sipvedonusum sdon')
				.fromIliski('sipstok har', 'sdon.harsayac = har.kaysayac')
				.fromIliski('sipfis fis', 'har.fissayac = fis.kaysayac')
				.fis2CariBagla().har2StokBagla()
			this.loadServerData_queryDuzenle_tarih({ ...e, sent, tarihClause: 'fis.tarih' })
			this.loadServerData_queryDuzenle_ozelIsaret({ ...e, sent, kodClause: 'fis.ozelisaret' })
			this.loadServerData_queryDuzenle_cari({ ...e, sent, kodClause: 'fis.must' })
			this.loadServerData_queryDuzenle_stok({ ...e, sent, kodClause: 'har.stokkod' })
			for (let key in attrSet) {
				switch (key) {
					case 'MIKTAR': sahalar.add(`SUM(${mc.miktar}) miktar`); break
					case 'MIKTAR2': sahalar.add(`SUM(${mc.miktar2}) miktar2`); break
					case 'FIYAT': sahalar.add(`SUM(${mc.fiyat}) fiyat`); break
					case 'BRUTBEDEL': sahalar.add(`SUM(${mc.brutBedel}) brutbedel`); break
					case 'BEDEL': sahalar.add(`SUM(${mc.bedel}) bedel`); break
					case 'SEVKMIKTAR': sahalar.add(`SUM(${mc.sevk}) sevkmiktar`); break
					case 'KALANMIKTAR': sahalar.add(`SUM(${mc.kalan}) kalanmiktar`); break
					case 'SEVKMIKTAR2': sahalar.add(`SUM(ROUND(${mc.sevk} * ${mc.miktar2} / ${mc.miktar}, 3)) sevkmiktar2`); break
					case 'KALANMIKTAR2': sahalar.add(`SUM(ROUND(${mc.kalan} * ${mc.miktar2} / ${mc.miktar}, 3)) kalanmiktar2`); break
					case 'SEVKBEDEL': sahalar.add(`SUM(ROUND(${mc.bedel} * ${mc.sevk} / ${mc.miktar}, 2)) sevkbedel`); break
					case 'KALANBEDEL': sahalar.add(`SUM(ROUND(${mc.bedel} * ${mc.kalan} / ${mc.miktar}, 2)) kalanbedel`); break
				}
			}
			sent.groupByOlustur()
		}
	}
}

class DRapor_StokSatisSiparisler extends DRapor_StokSiparisler {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'SATIS' } static get kategoriAdi() { return 'Satışlar' }
	static get kod() { return 'STSSIP' } static get aciklama() { return 'Satış Siparişler' }
	static get vioAdim() { return 'SA-RST' }
}
class DRapor_StokSatisSiparisler_Main extends DRapor_StokSiparisler_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_StokSatisSiparisler }
	static get almSat() { return 'T' }
}

class DRapor_AlimSatisSiparisler extends DRapor_StokSiparisler {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'ALIM' } static get kategoriAdi() { return 'Alımlar' }
	static get kod() { return 'SASSIP' } static get aciklama() { return 'Alım Siparişler' }
	static get vioAdim() { return 'SA-RST' }
}
class DRapor_AlimSatisSiparisler_Main extends DRapor_StokSiparisler_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_AlimSatisSiparisler }
	static get almSat() { return 'A' }
}
