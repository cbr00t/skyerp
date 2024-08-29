class CariHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'cari' } static get aciklama() { return 'Cari' }
	static hareketTipSecim_kaListeDuzenle(e) {
		super.hareketTipSecim_kaListeDuzenle(e); const {kaListe} = e; kaListe.push(
			new CKodVeAdi(['kasa', 'Kasa Tahsilat/Ödeme']), new CKodVeAdi(['hizmet', 'Hizmet Gelir/Gider']), new CKodVeAdi(['havaleEFT', 'Havale/EFT']),
			new CKodVeAdi(['tahsilatOdeme', 'Cari Tahsilat/Ödeme']), new CKodVeAdi(['virman', 'Cari Virman', 'virmanmi']), new CKodVeAdi(['dekont', 'Genel Dekont']),
			new CKodVeAdi(['topluIslem', 'Toplu İşlem']), new CKodVeAdi(['devir', 'Cari Devir']), new CKodVeAdi(['cek', 'Çek']), new CKodVeAdi(['SENET', 'Senet']),
			new CKodVeAdi(['kredi', 'Banka Kredi']), new CKodVeAdi(['pos', 'POS İşlemi']), new CKodVeAdi(['fatura', 'Fatura']), new CKodVeAdi(['masraf', 'Faiz/Masraf'])
		)
	}
	constructor(e) { e = e || {}; super(e) } defaultSonIslem(e) { this.uniOrtakSonIslem(e) }
	static varsayilanHVDuzenle(e) {
		super.varsayilanHVDuzenle(e); const {hv} = e, sqlEmptyDate = 'cast(null as datetime)', sqlEmpty = `''`, sqlZero = '0';
		for (const key of [
			'iceriktipi', 'anaislemadi', 'islkod', 'isladi', 'plasiyerkod', 'plasiyeradi', 'odemekod', 'odgunkod', 'iade', 'kdetay', 'satistipkod', 'fistipi', 'fisektipi',
			'dovizsanalmi', 'dvkod', 'ticmust', 'must', 'althesapkod', 'althesapadi', 'takipno', 'aciklama', 'ekaciklama', 'gxbnox'
		]) { hv[key] = sqlEmpty }
		for (const key of ['dvkur', 'noyil', 'bedel', 'dvbedel']) { hv[key] = sqlZero }
		for (const key of ['reftarih', 'karsiodemetarihi', 'vade', 'gxbtarihi']) { hv[key] = sqlEmptyDate }
		$.extend(hv, {
			fissayac: 'fis.kaysayac', kaysayac: 'har.kaysayac', ozelisaret: 'fis.ozelisaret', bizsubekod: 'fis.bizsubekod', tarih: 'fis.tarih', basliktarih: 'fis.tarih',
			seri: 'fis.seri', fisno: 'fis.no', baslikno: 'fis.no', fisnox: 'fis.fisnox', disfisnox: 'fis.fisnox', muhfissayac: 'fis.muhfissayac',
			sonzamants: 'fis.sonzamants', koopdonemno: 'cast(null as int)'
		})
	}
	static uygunluk2UnionBilgiListeDuzenleDevam(e) {
		super.uygunluk2UnionBilgiListeDuzenleDevam(e); const {liste} = e; $.extend(liste, {
			havaleEFT: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(e => {
					const {sent} = e, wh = sent.where;
					sent.fisHareket('hefis', 'hehar'); sent.fis2PlasiyerBagla(e).fis2BankaHesapBagla(e).har2AltHesapBagla_eski(e);
					wh.fisSilindiEkle().inDizi(['SH', 'SE', 'SS', 'GL', 'TP'], 'fis.fistipi')
				}).hvDuzenleIslemi(e => $.extend(e.hv, {
					oncelik: '12', unionayrim: `'HavEft'`, isladi: 'dbo.heacik(fis.fistipi, har.hisl)', aciklama: 'har.aciklama', ekaciklama: 'fis.aciklama',
					takipno: 'har.takipno', refkod: 'fis.banhesapkod', refadi: 'bhes.aciklama', vade: 'har.vade', karsiodemetarihi: 'fis.tarih', bedel: 'har.bedel',
					anaislemadi: `(case fis.fistipi when 'GL' then 'Gelen Havale/EFT' when 'TP' then 'Toplu Havale/EFT/POS' else 'Satıcı Havale/EFT' end)`,
					dvbedel: `(case when har.karsidvvar = '' then har.dvbedel else har.karsidvbedel end)`,
					kayittipi: `((case when fis.fistipi = 'GL' then 'G' when fis.fistipi = 'TP' then 'T' else 'S' end) + 'BNHE')`,
					must: 'har.ticmustkod', asilmust: 'har.must', tarih: 'coalesce(har.belgetarih, fis.tarih)', plasiyerkod: 'fis.plasiyerkod', plasiyeradi: 'pls.aciklama',
					dvkur: `(case when har.karsidvvar = '' then har.dvkur else har.karsidvkur end)`, 
					althesapkod: 'har.cariitn', althesapadi: 'alth.aciklama', dvkod: `dbo.emptycoalesce(alth.dvkod, car.dvkod)`,
					ba: `(case when fis.fistipi in ('SH', 'SE', 'SS') then 'B' when fis.fistipi = 'TP' then dbo.tersba(har.hba) else 'A' end)`
				}))
			],
			kredi: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(e => {
					const {sent} = e, wh = sent.where; sent.fromAdd('kredifis fis'); sent.fis2KrediBankaHesapBagla(e).fis2AltHesapBagla(e);
					wh.fisSilindiEkle().add(`fis.fistipi = 'A'`, `fis.hedeftipi = 'C'`)
				}).hvDuzenleIslemi(e => $.extend(e.hv, {
					kaysayac: 'fis.kaysayac', oncelik: '30', unionayrim: `'Kre'`, kayittipi: `'KRE'`, anaislemadi: `'Kredi'`, isladi: `'Kredi Alımı'`, fistipi: 'fis.fistipi',
					ba: `'B'`, must: 'fis.must', asilmust: 'fis.must', vade: 'fis.tarih', bedel: 'fis.topbrutbedel', dvbedel: 'fis.topdvbrutbedel',
					althesapkod: 'har.cariitn', althesapadi: 'alth.aciklama', dvkod: `dbo.emptycoalesce(alth.dvkod, car.dvkod)`,
					refkod: 'fis.kredihesapkod', refadi: 'bhes.aciklama', dvkur: 'fis.dvkur', aciklama: 'har.aciklama', ekaciklama: 'fis.aciklama'
				}))
			],
			pos: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(e => {
					const {sent} = e, wh = sent.where; sent.fisHareket('posfis', 'posilkhar'); sent.fis2PlasiyerBagla(e).har2AltHesapBagla_eski(e).har2BankaHesapBagla(e);
					wh.fisSilindiEkle().add(`fis.fistipi = 'AL'`)
				}).hvDuzenleIslemi(e => {
					let {cariGenel} = app.params, k = cariGenel.kullanim;
					let vadeSql = k.posVadelendirmeNakdeDonusummu ? 'har.nakdedonusumvade' : k.posVadelendirmeSerbestmi ? 'har.vade' : 'fis.tarih';
					$.extend(e.hv, {
						kaysayac: 'fis.kaysayac', oncelik: '120', unionayrim: `'POSTah'`, kayittipi: `'POS'`, fisektipi: 'fis.almsat',
						anaislemadi: `(case when fis.almsat = 'T' then 'POS ile Tahsil' else 'Kredi Kartı ile Ödeme' end)`,
						isladi: `(case when fis.almsat = 'T' then 'POS ile Tahsil' else 'Kr.Kart ile Ödeme' end)`, fistipi: 'fis.fistipi',
						ba: `(case when rtrim(fis.almsat + fis.iade) in ('T', 'AI') then 'A' else 'B' end)`,
						must: 'har.ticmustkod', asilmust: 'har.must', plasiyerkod: 'fis.plasiyerkod', plasiyeradi: 'pls.aciklama',
						vade: vadeSql, karsiodemetarihi: vadeSql, bedel: 'sum(har.bedel)', dvbedel: 'sum(har.karsidvbedel)',
						althesapkod: 'har.cariitn', althesapadi: 'alth.aciklama', dvkod: `dbo.emptycoalesce(alth.dvkod, car.dvkod)`,
						refkod: 'har.banhesapkod', refadi: 'bhes.aciklama', dvkur: 'fis.dvkur', aciklama: 'har.aciklama', ekaciklama: 'fis.aciklama'
					})
				})
			],
			masraf: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(e => {
					const {sent} = e, wh = sent.where; sent.fisHareket('posfis', 'posilkhar').fis2PlasiyerBagla(e).har2AltHesapBagla_eski(e).har2BankaHesapBagla(e);
					wh.fisSilindiEkle().add(`fis.fistipi = 'AL'`, `har.masraf <> 0`)
				}).hvDuzenleIslemi(e => {
					let {cariGenel} = app.params, k = cariGenel.kullanim;
					let vadeSql = k.posVadelendirmeNakdeDonusummu ? 'har.nakdedonusumvade' : k.posVadelendirmeSerbestmi ? 'har.vade' : 'fis.tarih';
					$.extend(e.hv, {
						kaysayac: 'fis.kaysayac', oncelik: '120', unionayrim: `'POS'`, kayittipi: `'POSB'`,
						anaislemadi: `(case when fis.almsat = 'T' then 'POS Tahsil Bonus' else 'Kr.Kart Ödeme Bonus' end)`,
						isladi: `(case when fis.almsat = 'T' then 'POS ile Tahsil' else 'Kr.Kart ile Ödeme' end)`,
						ba: `(case when rtrim(fis.almsat + fis.iade) in ('T', 'AI') then 'A' else 'B' end)`,
						must: 'har.ticmustkod', asilmust: 'har.must', plasiyerkod: 'fis.plasiyerkod', plasiyeradi: 'pls.aciklama',
						vade: vadeSql, karsiodemetarihi: vadeSql, bedel: 'sum(har.masraf)', dvbedel: '0',
						althesapkod: 'har.cariitn', althesapadi: 'alth.aciklama',
						refkod: 'har.banhesapkod', refadi: 'bhes.aciklama', aciklama: 'har.aciklama', ekaciklama: 'fis.aciklama'
					})
			   })
			]
		})
	}
}
