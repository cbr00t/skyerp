class KasaHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'kasa' } static get aciklama() { return 'Cari' }
	static hareketTipSecim_kaListeDuzenle(e) {
		super.hareketTipSecim_kaListeDuzenle(e); e.kaListe.push(
			new CKodVeAdi(['devir', 'Kasa Devir']), new CKodVeAdi(['banka', 'Banka']),
			new CKodVeAdi(['kasaCari', 'Kasa/Cari']), new CKodVeAdi(['hizmet', 'Hizmet']),
			new CKodVeAdi(['cariTahsilatOdeme', 'Cari Tahsilat/Ödeme'])
		)
	}
	constructor(e) { e = e || {}; super(e) } defaultSonIslem(e) { this.uniOrtakSonIslem(e) }
	static varsayilanHVDuzenle(e) {
		super.varsayilanHVDuzenle(e); const {hv} = e, sqlEmptyDate = 'cast(null as datetime)', sqlEmpty = `''`, sqlZero = '0';
		for (const key of ['refsubekod', 'refkod', 'refadi', 'plasiyerkod', 'plasiyeradi', 'takipno', 'althesapkod', 'kdetay' ]) { hv[key] = sqlEmpty }
		for (const key of ['oncelik', 'kdetay', 'makbuzno']) { hv[key] = sqlZero }
		/*for (const key of []) { hv[key] = sqlEmptyDate }*/
		$.extend(hv, {
			fissayac: 'fis.kaysayac', kaysayac: 'har.kaysayac', ozelisaret: 'fis.ozelisaret', bizsubekod: 'fis.bizsubekod',
			tarih: 'fis.tarih', seri: 'fis.seri', fisno: 'fis.no', fisnox: 'fis.fisnox', bastarih: 'fis.tarih', basseri: 'fis.seri', basno: 'fis.no',
			fisaciklama: 'fis.aciklama', detaciklama: 'har.aciklama', dvkur: 'har.dvkur', ba: 'fis.ba', bedel: 'har.bedel', dvbedel: 'har.dvbedel'
		})
	}
	static uygunluk2UnionBilgiListeDuzenleDevam(e) { super.uygunluk2UnionBilgiListeDuzenleDevam(e); this.uniDuzenle_finans(e) }
	static uniDuzenle_finans({ liste }) {
		let getUniBilgi_banka = fisTipi => {
			liste[key] = [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {where: wh} = sent; sent.fisHareket('finansfis', 'finanshar')
						.har2KatDetayBagla().har2BankaHesapBagla().har2CariBagla().har2HizmetBagla().fis2PlasiyerBagla();
					wh.fisSilindiEkle().degerAta(fisTipi, 'fis.fistipi')
				}).hvDuzenleIslemi(e => {
					$.extend(e.hv, {
						kasakod: 'fis.kasakod', plasiyerkod: 'fis.plasiyerkod', plasiyeradi: 'pls.birunvan',
						takipno: 'har.takipno', althesapkod: 'har.cariitn', makbuzno: 'har.belgeno',
						kayittipi: `(case fis.fistipi when 'KB' then 'KBNAK' when 'KC' then 'KCNAK' when 'KH' then 'KSHIZ' else '' end)`,
						oncelik: `(case fis.fistipi when 'KB' then dbo.banum(fis.ba, 10, 70) when 'KC' then dbo.banum(fis.ba, 20, 80) 
										when 'KH' then dbo.banum(fis.ba, 15, 95) else 0 end)`,
						islemadi: `(case fis.fistipi when 'KB' then dbo.batext(fis.ba, 'Bankadan Çekilen', 'Bankaya Yatan')
										when 'KC' then dbo.batext(fis.ba, 'Cari Hes.Tahsilat', 'Cari Hes.Ödeme')
										when 'KH' then hiz.aciklama else '' end)`,
						detaciklama: `(case when fis.fistipi in ('KB', 'KC') then har.aciklama 
										when fis.fistipi = 'KH' then dbo.hizmetack(har.belgetarih, har.belgeseri, har.belgeno, har.aciklama)
										else '' end)`,
						refkod: `(case fis.fistipi when 'KB' then har.banhesapkod when 'KC' then har.must when 'KH' then kdet.kdetay end)`,
						refadi: `(case fis.fistipi when 'KB' then bhes.aciklama when 'KC' then car.birunvan when 'KH' then '' end)`
					})
				})
			]
		};
		$.extend(e.liste, {
			devir: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {where: wh} = sent; sent.fisHareket('findevirfis', 'findevirhar')
					wh.fisSilindiEkle().degerAta('KS', 'fis.fistipi')
				}).hvDuzenleIslemi(e => {
					$.extend(e.hv, { kasakod: 'har.kasakod', kayittipi: `'KSDEV'`, islemadi: `'Kasa Devir'` })
				})
			],
			banka: getUniBilgi_banka('KB'), kasaCari: getUniBilgi_banka('KC'), hizmet: getUniBilgi_banka('KH'),
			cariTahsilatOdeme: new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
				const {where: wh} = sent; sent.fisHareket('carifis', 'carihar').har2TahSekliBagla().fis2CariBagla().fis2PlasiyerBagla();
				wh.fisSilindiEkle().degerAta('NK', 'tsek.tahsiltipi')
			}).hvDuzenleIslemi(e => {
				$.extend(e.hv, {
					kasakod: 'har.tahkasakod', ba: `dbo.tersba(fis.ba) ba`, kayittipi: `'CRHAR'`, makbuzno: 'har.belgeno',
					takipno: 'fis.takipno', althesapkod: 'fis.althesapkod',
					refkod: 'fis.mustkod', refadi: 'car.birunvan', oncelik: `(case when fis.ba = 'A' then 5 else 60 end)`,
					islemadi: `(case when fis.ba = 'B' then 'Cari Ödeme' else 'Cari Tahsilat' end)`,
					detaciklama: `dbo.hizmetack(cast(NULL as datetime), har.belgeseri, har.belgeno, har.aciklama)`,
					dvkur: `(case when har.karsidvvar = '' then har.dvkur else har.karsidvkur end)`,
					dvbedel: `(case when har.karsidvvar = '' then har.dvbedel else har.karsidvbedel end)`
				})
			})
		});
		return this
	}
}
