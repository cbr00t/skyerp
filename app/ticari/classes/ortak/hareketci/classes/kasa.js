class KasaHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'kasa' } static get aciklama() { return 'Cari' }
	static hareketTipSecim_kaListeDuzenle(e) {
		super.hareketTipSecim_kaListeDuzenle(e); e.kaListe.push(
			new CKodVeAdi(['devir', 'Kasa Devir']), new CKodVeAdi(['banka', 'Banka']),
			new CKodVeAdi(['kasaCari', 'Kasa/Cari']), new CKodVeAdi(['hizmet', 'Hizmet']),
			new CKodVeAdi(['cariTahsilatOdeme', 'Cari Tahsilat/Ödeme']),
			new CKodVeAdi(['csBankadanCekilen', 'Çek ile Bankadan Çekilen']), new CKodVeAdi(['csEldenTahsil', 'Çek/Senet Elden Tahsil']),
			new CKodVeAdi(['genelDekont', 'Genel Dekont']), new CKodVeAdi(['kasaVirman', 'Kasa Virman']), new CKodVeAdi(['krediKartOdeme', 'Kredi Kart Ödeme']),
			new CKodVeAdi(['faturaTahsilatOdeme', 'Fatura Tahsilat/Ödeme']), new CKodVeAdi(['perakende', 'Perakende'])
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
	static uygunluk2UnionBilgiListeDuzenleDevam(e) {
		super.uygunluk2UnionBilgiListeDuzenleDevam(e);
		this.uniDuzenle_finans(e).uniDuzenle_cekSenet(e).uniDuzenle_dekont(e);
		this.uniDuzenle_krediKarti(e).uniDuzenle_ticari(e)
	}
	static uniDuzenle_finans({ liste }) {
		let getUniBilgiler_banka = fisTipi => [
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
		];
		$.extend(liste, {
			devir: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {where: wh} = sent; sent.fisHareket('findevirfis', 'findevirhar')
					wh.fisSilindiEkle().degerAta('KS', 'fis.fistipi')
				}).hvDuzenleIslemi(e => { $.extend(e.hv, { kasakod: 'har.kasakod', kayittipi: `'KSDEV'`, islemadi: `'Kasa Devir'` }) })
			],
			banka: getUniBilgiler_banka('KB'), kasaCari: getUniBilgiler_banka('KC'), hizmet: getUniBilgiler_banka('KH'),
			cariTahsilatOdeme: [new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
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
			})]
		});
		return this
	}
	static uniDuzenle_cekSenet({ liste }) {
		$.extend(liste, {
			csBankadanCekilen: [new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
				const {where: wh} = sent; sent.fromAdd('csfis fis')
					.fromIliski('csilkhar bel', 'bel.fissayac = fis.kaysayac')
					.fromIliski('banbizhesap bhes', 'bel.banhesapkod = bhes.kod')
				wh.fisSilindiEkle().degerAta('BC', 'fis.belgetipi').degerAta('BN', 'fis.fistipi')
			}).hvDuzenleIslemi(e => {
				$.extend(e.hv, {
					kasakod: 'fis.kasakod', ba: 'B', kayittipi: `'CSILK'`, takipno: 'fis.takipno',
					refkod: 'bel.banhesapkod', refadi: 'bhes.aciklama', oncelik: '15',
					islemadi: `(case when fis.ba = 'B' then 'Cari Ödeme' else 'Cari Tahsilat' end)`,
					dvkur: 'fis.dvkur', bedel: 'bel.bedel', dvbedel: 'bel.dvbedel',
					detaciklama: `('No:' + LTRIM(STR(bel.belgeno)))`
				})
			})],
			csEldenTahsil: [new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
				const {where: wh} = sent; sent.fisHareket('csfis', 'csdigerhar')
					.fromIliski('csportfoy prt', 'fis.portfkod = prt.kod')
					.fromIliski('csilkhar bel', 'har.ilksayac = bel.kaysayac')
					.fromIliski('carmst car', 'bel.ciranta = car.must')
				wh.fisSilindiEkle().inDizi(['EL', 'EO'], 'fis.fistipi').degerAta('NK', 'fis.tahsiltipi')
			}).hvDuzenleIslemi(e => {
				$.extend(e.hv, {
					kasakod: 'fis.kasakod', kayittipi: `'CSDIG'`, takipno: 'fis.takipno',
					refkod: 'bel.ciranta', refadi: 'car.birunvan refadi', oncelik: '20', dvkur: 'fis.dvkur',
					ba: `(case when fis.belgetipi in ('AC', 'AS') then 'B' else 'A' end)`,
					islemadi: `(case when fis.belgetipi in ('AC', 'AS') then 'Ç/S Elden Tahsil' else 'Ç/S Elden Ödeme' end)`,
					bedel: `(case when har.bedel = 0 then bel.bedel else har.bedel end)`,
					dvbedel: `(case when har.bedel = 0 then bel.dvbedel else har.dvbedel end)`,
					detaciklama: `('No:' + LTRIM(STR(bel.belgeno)))`
				})
			})]
		});
		return this
	}
	static uniDuzenle_dekont({ liste }) {
		$.extend(liste, {
			genelDekont: [new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
				const {where: wh} = sent; sent.fisHareket('geneldekontfis', 'geneldekonthar')
					.fromIliski('muhisl isl', 'fis.islkod = isl.kod')
					.fromIliski('geneldekonthar gir', 'har.fissayac = gir.fissayac')
					.fromIliski('kasmst gkas', 'gir.kasakod = gkas.kod')
				wh.fisSilindiEkle().degerAta('', 'fis.ozeltip').degerAta('KS', 'har.kayittipi')
			}).hvDuzenleIslemi(e => {
				$.extend(e.hv, {
					kasakod: 'har.kasakod', ba: 'har.ba', kayittipi: `'GDEK'`, takipno: 'har.takipno',
					refkod: 'fis.islkod', refadi: 'isl.aciklama', oncelik: '70', islemadi: `'Kasa Virman'`,
					dvkur: 'har.dvkur', bedel: 'har.bedel', dvbedel: 'har.dvbedel'
				})
			})],
			kasaVirman: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {												/* çıkış açısından (fis subesi = cikis kasa subesi) */
					const {where: wh} = sent; sent.fisHareket('geneldekontfis', 'geneldekonthar')
						.fromIliski('csportfoy prt', 'fis.portfkod = prt.kod')
						.fromIliski('geneldekonthar cik', 'har.fissayac = gir.fissayac')
						.fromIliski('kasmst gkas', 'gir.kasakod = gkas.kod')
					wh.fisSilindiEkle().degerAta('K', 'fis.ozeltip').degerAta(1, 'har.seq%2').add('gir.seq = (har.seq + 1)')
				}).hvDuzenleIslemi(e => {
					$.extend(e.hv, {
						kasakod: 'har.kasakod', ba: 'har.ba', kayittipi: `'KSVIR'`, takipno: 'har.takipno', refsubekod: 'gkas.bizsubekod',
						refkod: 'gir.kasakod', refadi: 'gkas.aciklama', oncelik: '70', islemadi: `'Kasa Virman'`,
						dvkur: 'har.dvkur', bedel: 'bel.bedel', dvbedel: 'bel.dvbedel'
					})
				}),
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {												/* giriş açısından */
					const {where: wh} = sent; sent.fisHareket('geneldekontfis', 'geneldekonthar')
						.fromIliski('csportfoy prt', 'fis.portfkod = prt.kod')
						.fromIliski('geneldekonthar cik', 'har.fissayac = cik.fissayac')
						.fromIliski('kasmst ckas', 'cik.kasakod = ckas.kod')
						.fromIliski('kasmst kas', 'har.kasakod = kas.kod')
					wh.fisSilindiEkle().degerAta('K', 'fis.ozeltip').degerAta(0, 'har.seq%2').add('cik.seq = (har.seq - 1)')
				}).hvDuzenleIslemi(e => {
					$.extend(e.hv, {
						kasakod: 'har.kasakod', ba: 'har.ba', kayittipi: `'KSVIR'`, takipno: 'har.takipno',
						bizsubekod: 'kas.bizsubekod', refsubekod: 'fis.bizsubekod',
						refkod: 'cik.kasakod', refadi: 'ckas.aciklama', oncelik: '12', islemadi: `'Kasa Virman'`,
						dvkur: 'har.dvkur', bedel: 'bel.bedel', dvbedel: 'bel.dvbedel'
					})
				})
			]
		});
		return this
	}
	static uniDuzenle_krediKarti({ liste }) {
		$.extend(liste, {
			krediKartOdeme: [new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
				const {where: wh} = sent; sent.fisHareket('posfis', 'posilkhar').har2PosKosulBagla();
				wh.fisSilindiEkle().degerAta('ND', 'fis.tahsiltipi').degerAta('A', 'fis.almsat').add(`har.refkasakod <> ''`)
			}).hvDuzenleIslemi(e => {
				$.extend(e.hv, {
					kasakod: 'har.refkasakod', ba: `'A'`, kayittipi: `'KKART'`, oncelik: '80',
					refkod: 'har.poskosulkod', refadi: 'pkos.aciklama', islemadi: `'Kredi Kart Ödeme'`, detaciklama: 'har.aciklama'
				})
			})]
		});
		return this
	}
	static uniDuzenle_ticari({ liste }) {
		let getUniBilgiler = perakendemi => [
			new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
				const {where: wh} = sent; sent.fisHareket('posfis', 'posilkhar').har2PosKosulBagla();
				wh.fisSilindiEkle().degerAta('ND', 'fis.tahsiltipi').degerAta('A', 'fis.almsat').add(`har.refkasakod <> ''`)
			}).hvDuzenleIslemi(e => {
				$.extend(e.hv, {
					kasakod: 'har.refkasakod', ba: `'A'`, kayittipi: `'KKART'`, oncelik: '80',
					refkod: 'har.poskosulkod', refadi: 'pkos.aciklama', islemadi: `'Kredi Kart Ödeme'`, detaciklama: 'har.aciklama'
				})
			})
		];
		$.extend(liste, { faturaTahsilatOdeme: getUniBilgiler(false), perakende: getUniBilgiler(true) });
		return this
	}
}
