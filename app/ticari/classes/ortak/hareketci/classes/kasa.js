class KasaHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get oncelik() { return 1 }
	static get kod() { return 'kasa' } static get aciklama() { return 'Kasa' }
	static altTipYapilarDuzenle(e) { super.altTipYapilarDuzenle(e); e.def.sol() }
	static mstYapiDuzenle({ result }) {
		super.mstYapiDuzenle(...arguments);
		result.set('kasakod', ({ sent, kodClause, mstAlias, mstAdiAlias }) =>
			sent.fromIliski(`kasmst ${mstAlias}`, `${kodClause} = ${mstAlias}.kod`).add(`${mstAlias}.aciklama ${mstAdiAlias}`))
	}
	static hareketTipSecim_kaListeDuzenle({ kaListe }) {
		super.hareketTipSecim_kaListeDuzenle(...arguments); kaListe.push(
			new CKodVeAdi(['devir', 'Kasa Devir']), new CKodVeAdi(['banka', 'Banka']),
			new CKodVeAdi(['kasaCari', 'Kasa/Cari']), new CKodVeAdi(['hizmet', 'Hizmet']),
			new CKodVeAdi(['cariTahsilatOdeme', 'Cari Tahsilat/Ödeme']),
			new CKodVeAdi(['csBankadanCekilen', 'Çek ile Bankadan Çekilen']), new CKodVeAdi(['csEldenTahsil', 'Çek/Senet Elden Tahsil']),
			new CKodVeAdi(['genelDekont', 'Genel Dekont']), new CKodVeAdi(['kasaVirman', 'Kasa Virman']), new CKodVeAdi(['krediKartOdeme', 'Kredi Kart Ödeme']),
			new CKodVeAdi(['faturaTahsilatOdeme', 'Fatura Tahsilat/Ödeme']), new CKodVeAdi(['perakende', 'Perakende'])
		)
	}
	static varsayilanHVDuzenle({ hv, sqlZero }) {
		super.varsayilanHVDuzenle(...arguments);
		for (const key of ['makbuzno']) { hv[key] = sqlZero }
		$.extend(hv, { bastarih: 'fis.tarih', basseri: 'fis.seri', basno: 'fis.no' })
	}
	uygunluk2UnionBilgiListeDuzenleDevam(e) {
		super.uygunluk2UnionBilgiListeDuzenleDevam(e);
		this.uniDuzenle_finans(e).uniDuzenle_cekSenet(e).uniDuzenle_dekont(e);
		this.uniDuzenle_krediKarti(e).uniDuzenle_ticari(e)
	}
	uniDuzenle_finans({ uygunluk, liste }) {
		let getUniBilgiler_banka = fisTipi => [
			new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
				const {where: wh} = sent; sent.fisHareket('finansfis', 'finanshar')
					.har2KatDetayBagla().har2BankaHesapBagla().har2CariBagla().har2HizmetBagla().fis2PlasiyerBagla();
				wh.fisSilindiEkle().degerAta(fisTipi, 'fis.fistipi')
			}).hvDuzenleIslemi(({ hv }) => {
				$.extend(hv, {
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
					refkod: `(case fis.fistipi when 'KB' then har.banhesapkod when 'KC' then har.must when 'KH' then kdet.kdetay else '' end)`,
					refadi: `(case fis.fistipi when 'KB' then bhes.aciklama when 'KC' then car.birunvan when 'KH' then '' else '' end)`
				})
			})
		];
		$.extend(liste, {
			devir: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {where: wh} = sent; sent.fisHareket('findevirfis', 'findevirhar')
					wh.fisSilindiEkle().degerAta('KS', 'fis.fistipi')
				}).hvDuzenleIslemi(({ hv }) => { $.extend(hv, { kasakod: 'har.kasakod', kayittipi: `'KSDEV'`, islemadi: `'Kasa Devir'` }) })
			],
			banka: getUniBilgiler_banka('KB'), kasaCari: getUniBilgiler_banka('KC'), hizmet: getUniBilgiler_banka('KH'),
			cariTahsilatOdeme: [new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
				const {where: wh} = sent; sent.fisHareket('carifis', 'carihar')
					.har2TahSekliBagla()
					.fis2CariBagla({ mustSaha: 'mustkod' })
					.fis2PlasiyerBagla();
				wh.fisSilindiEkle().degerAta('NK', 'tsek.tahsiltipi')
			}).hvDuzenleIslemi(({ hv }) => {
				$.extend(hv, {
					kasakod: 'har.tahkasakod', ba: `dbo.tersba(fis.ba)`, kayittipi: `'CRHAR'`, makbuzno: 'har.belgeno',
					takipno: 'fis.takipno', althesapkod: 'har.detalthesapkod',
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
	uniDuzenle_cekSenet({ uygunluk, liste }) {
		$.extend(liste, {
			csBankadanCekilen: [new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
				const {where: wh} = sent; sent.fromAdd('csfis fis')
					.fromIliski('csilkhar bel', 'bel.fissayac = fis.kaysayac')
					.fromIliski('banbizhesap bhes', 'bel.banhesapkod = bhes.kod')
				wh.fisSilindiEkle().degerAta('BC', 'fis.belgetipi').degerAta('BN', 'fis.fistipi')
			}).hvDuzenleIslemi(({ hv }) => {
				$.extend(hv, {
					kasakod: 'fis.kasakod', ba: `'B'`, kayittipi: `'CSILK'`, takipno: 'fis.takipno',
					refkod: 'bel.banhesapkod', refadi: 'bhes.aciklama', oncelik: '15',
					islemadi: `'Çek ile Çekilen'`, dvkur: 'fis.dvkur', bedel: 'bel.bedel', dvbedel: 'bel.dvbedel',
					detaciklama: `('No:' + LTRIM(STR(bel.belgeno)))`
				})
			})],
			csEldenTahsil: [new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
				const {where: wh} = sent; sent.fisHareket('csfis', 'csdigerhar')
					.fromIliski('csportfoy prt', 'fis.portfkod = prt.kod')
					.fromIliski('csilkhar bel', 'har.ilksayac = bel.kaysayac')
					.fromIliski('carmst car', 'bel.ciranta = car.must')
				wh.fisSilindiEkle().inDizi(['EL', 'EO'], 'fis.fistipi')
			}).hvDuzenleIslemi(({ hv }) => {
				$.extend(hv, {
					kasakod: 'fis.kasakod', kayittipi: `'CSDIG'`, takipno: 'fis.takipno',
					refkod: 'bel.ciranta', refadi: 'car.birunvan', oncelik: '20', dvkur: 'fis.dvkur',
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
	uniDuzenle_dekont({ uygunluk, liste }) {
		$.extend(liste, {
			genelDekont: [new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
				const {where: wh} = sent; sent.fisHareket('geneldekontfis', 'geneldekonthar')
					.fromIliski('muhisl isl', 'fis.islkod = isl.kod')
				wh.fisSilindiEkle().degerAta('', 'fis.ozeltip').degerAta('KS', 'har.kayittipi')
			}).hvDuzenleIslemi(({ hv }) => {
				$.extend(hv, {
					kasakod: 'har.kasakod', ba: 'har.ba', kayittipi: `'GDEK'`, takipno: 'har.takipno', islemadi: `'Genel Dekont'`,
					refkod: 'fis.islkod', refadi: 'isl.aciklama', oncelik: `(case when har.ba = 'B' then 20 else 55 end)`,
				})
			})],
			kasaVirman: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {												/* çıkış açısından (fis subesi = cikis kasa subesi) */
					const {where: wh} = sent; sent.fisHareket('geneldekontfis', 'geneldekonthar')
						.fromIliski('geneldekonthar gir', 'har.fissayac = gir.fissayac')
						.fromIliski('kasmst gkas', 'gir.kasakod = gkas.kod')
					wh.fisSilindiEkle().degerAta('K', 'fis.ozeltip').add('har.seq % 2 = 1', 'gir.seq = (har.seq + 1)')
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kasakod: 'har.kasakod', ba: 'har.ba', kayittipi: `'KSVIR'`, takipno: 'har.takipno', refsubekod: 'gkas.bizsubekod',
						refkod: 'gir.kasakod', refadi: 'gkas.aciklama', oncelik: '70', islemadi: `'Kasa Virman'`,
						dvkur: 'har.dvkur', bedel: 'har.bedel', dvbedel: 'har.dvbedel'
					})
				}),
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {												/* giriş açısından */
					const {where: wh} = sent; sent.fisHareket('geneldekontfis', 'geneldekonthar')
						.fromIliski('geneldekonthar cik', 'har.fissayac = cik.fissayac')
						.fromIliski('kasmst ckas', 'cik.kasakod = ckas.kod')
						.fromIliski('kasmst kas', 'har.kasakod = kas.kod')
					wh.fisSilindiEkle().degerAta('K', 'fis.ozeltip').add('har.seq % 2 = 0', 'cik.seq = (har.seq - 1)')
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kasakod: 'har.kasakod', ba: 'har.ba', kayittipi: `'KSVIR'`, bizsubekod: 'kas.bizsubekod', refsubekod: 'fis.bizsubekod',
						takipno: 'har.takipno', refkod: 'cik.kasakod', refadi: 'ckas.aciklama', oncelik: '12', islemadi: `'Kasa Virman'`,
						bedel: 'har.bedel', dvbedel: 'har.dvbedel'
					})
				})
			]
		});
		return this
	}
	uniDuzenle_krediKarti({ uygunluk, liste }) {
		$.extend(liste, {
			krediKartOdeme: [new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
				const {where: wh} = sent; sent.fisHareket('posfis', 'posilkhar').har2PosKosulBagla();
				wh.fisSilindiEkle().degerAta('ND', 'fis.fistipi').degerAta('A', 'fis.almsat').add(`har.refkasakod <> ''`)
			}).hvDuzenleIslemi(({ hv }) => {
				$.extend(hv, {
					kasakod: 'har.refkasakod', ba: `'A'`, kayittipi: `'KKART'`, oncelik: '80',
					refkod: 'har.poskosulkod', refadi: 'pkos.aciklama', islemadi: `'Kredi Kart Ödeme'`, detaciklama: 'har.aciklama'
				})
			})]
		});
		return this
	}
	uniDuzenle_ticari({ uygunluk, liste }) {
		$.extend(liste, {
			faturaTahsilatOdeme$perakende: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {perakende: perakendemi} = uygunluk;
					const {where: wh} = sent; sent.fisHareket('piffis', 'piftaksit')
						.fromIliski('tahsilsekli tsek', 'har.taktahsilsekli = tsek.kodno')
						.fis2CariBagla().fis2YerBagla().fis2PlasiyerBagla();
					wh.fisSilindiEkle().degerAta('NK', 'tsek.tahsiltipi')
						.degerAta(perakendemi ? 'P' : 'F', 'fis.piftipi').degerAta('A', 'fis.almsat');
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kasakod: 'tsek.kasakod', kayittipi: `'PIFA'`, plasiyerkod: 'fis.plasiyerkod', plasiyeradi: 'pls.birunvan',
						takipno: 'fis.orttakipno', althesapkod: 'fis.cariitn', oncelik: `(case when fis.almsat = 'T' then 20 else 55 end)`, 
						ba: `(case when har.btersmi = 0 then dbo.ticaricarba(fis.almsat, fis.iade) else dbo.tersba(dbo.ticaricarba(fis.almsat, fis.iade)) end)`,
						islemadi: `(case when fis.piftipi = 'P' then
										(case fis.ayrimtipi when 'PR' then 'Mağaza Satış' when 'GP' then 'Gider Pusula'
										    else dbo.iadetext(fis.iade, dbo.almsattext(fis.almsat, 'Perakende Alım', 'Perakende Satış')) end)
									  else dbo.iadetext(fis.iade, dbo.almsattext(fis.almsat, 'Alım Ödeme', 'Satış Tahsilat')) end)`,
						refkod: `(case when fis.must = '' then fis.yerkod else fis.must end)`, refadi: `(case when fis.must = '' then yer.aciklama else car.birunvan end)`,
						dvkur: `(case when har.karsidvvar = '' then fis.dvkur else har.karsidvkur end)`, dvbedel: `(case when har.karsidvvar = '' then har.dvbedel else har.karsidvbedel end)`,
						bedel: 'har.bedel', fisaciklama: 'fis.cariaciklama', detaciklama: 'har.aciklama' 
					})
				})
			]
		});
		return this
	}
}
