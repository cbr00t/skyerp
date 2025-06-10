class BankaMevduatHareketci extends BankaOrtakHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get oncelik() { return 2 }
    static get kod() { return 'bankaMevduat' } static get aciklama() { return 'Banka Mevduat' }
	static altTipYapilarDuzenle(e) { super.altTipYapilarDuzenle(e); e.def.sol() }
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(...arguments); kaListe.push(
            new CKodVeAdi(['devir', 'Devir']), new CKodVeAdi(['kasa', 'Kasa Yatan/Çekilen']),
            new CKodVeAdi(['yatirim', 'Yatırım']), new CKodVeAdi(['hizmet', 'Banka Hizmet']),
            new CKodVeAdi(['havaleEFT', 'Havale/EFT']), new CKodVeAdi(['tahsilSekli', 'Fatura ve Cari Tahsil']),
            new CKodVeAdi(['pos', 'POS Nakde Dönüşüm']), new CKodVeAdi(['posKomisyon', 'POS Komisyon']),
            new CKodVeAdi(['krediKartOdeme', 'Kredi Kart Ödeme']), new CKodVeAdi(['csEldenTahsil', 'Elden Tahsil/Ödeme']),
            new CKodVeAdi(['borcCekCekilen', 'Borç Çek ile Çekilen']), new CKodVeAdi(['csTahsilEdilen', 'Çek/Senet Tahsil']),
            new CKodVeAdi(['karsiliksiz', 'Karşılıksız/Protesto']), new CKodVeAdi(['genelDekont', 'Genel Dekont']),
            new CKodVeAdi(['virman', 'Banka Hesap Virman']), new CKodVeAdi(['alimSatis', 'Fatura Nakit']), new CKodVeAdi(['akreditif', 'Akreditif']),
			new CKodVeAdi(['teminatMektup', 'Teminat Mektubu']), new CKodVeAdi(['krediAlim', 'Kredi Alımı'])
        )
    }
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e);
        this.uniDuzenle_devir(e).uniDuzenle_kasaYatirimHizmet(e).uniDuzenle_havaleEFT(e).uniDuzenle_tahsilSekli(e)
			.uniDuzenle_genelDekont(e).uniDuzenle_virman(e).uniDuzenle_krediKartOdeme(e).uniDuzenle_posKomisyon(e).uniDuzenle_pos(e)
			.uniDuzenle_borcCekCekilen(e).uniDuzenle_csTahsilEdilen(e).uniDuzenle_csEldenTahsil(e).uniDuzenle_karsiliksiz(e)
    }
    uniDuzenle_devir({ uygunluk, liste }) {
        $.extend(liste, {
            devir: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
                    let {where: wh} = sent; sent.fisHareket('findevirfis', 'findevirhar');
                    wh.fisSilindiEkle().add(`fis.fistipi = 'BH'`)
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kaysayac: 'har.kaysayac', kayittipi: `'BNDEV'`, banhesapkod: 'har.banhesapkod',
                        oncelik: '0', ba: 'fis.ba', islemadi: `'Devir'`, anaislemadi: `'Devir'`,
                        detaciklama: 'har.aciklama', takipno: '', dvkur: 'har.dvkur', bedel: 'har.bedel', dvbedel: 'har.dvbedel'
                    })
                })
            ]
        });
        return this
    }
    uniDuzenle_kasaYatirimHizmet({ uygunluk, liste }) {
        $.extend(liste, {
            kasa$yatirim$hizmet: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
                    const tipListe = [], tipEkle = (selector, kod) => { if (uygunluk[selector]) { tipListe.push(kod) } };
					tipEkle('kasa', 'KB'); tipEkle('yatirim', 'HY'); tipEkle('hizmet', 'HH');
					let {where: wh} = sent; sent.fisHareket('finansfis', 'finanshar')
                      .fis2KasaBagla().har2HizmetBagla().har2KatDetayBagla();                                                                                          /* ref = https://raw.githubusercontent.com/cbr00t/skyerp/refs/heads/main/classes/stmYapi/dbSent.js */
                    wh.fisSilindiEkle().inDizi(tipListe, 'fis.fistipi')                                                                                                /* bu bir sql clause ancak içinde ' (tek tırnak olmadığı için) `` (string template) kullanmaya gerek duymadık. 2) inDizi, add, fis2...Bagla, har2...Bagla gibi methodlar 'return this' yaptığı için, cascaded message syntax kullanabiliyoruz */
                      .add('har.krediharsayac is null')                                      /* kredi bağlantısı olmamalı */                                           /* bu bir sql clause ancak içinde ' (tek tırnak olmadığı için) `` (string template) kullanmaya gerek duymadık */
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
					  kaysayac: 'har.kaysayac',                                                                                                                        /* bu bir sql clause ancak içinde ' (tek tırnak olmadığı için) `` (string template) kullanmaya gerek duymadık */
                      kayittipi: `(case when fis.fistipi = 'KB' then 'KBNAK' when fis.fistipi = 'HY' then 'BNYAT' when fis.fistipi = 'HH' then 'BNHIZ' else '' end)`,  /* bu bir sql clause ancak içinde ' (tek tırnak VAR). Bu sebeple tamamını `` (string template) içine aldık */
                      oncelik: `(case when fis.fistipi = 'KB' then dbo.banum(dbo.tersba(fis.ba), 50, 15) when fis.fistipi = 'HY' then 40 when fis.fistipi = 'HH' then dbo.banum(fis.ba, 70, 30) else 0 end)`,
                      ba: `(case when fis.fistipi = 'KB' then dbo.tersba(fis.ba) when fis.fistipi = 'HY' then 'B' when fis.fistipi = 'HH' then fis.ba else fis.ba end)`,
                      islemadi: `(case when fis.fistipi = 'KB' then dbo.batext(fis.ba,'Bankadan Çekilen','Bankaya Yatan') when fis.fistipi = 'HY' then 'Yatırım' when fis.fistipi = 'HH' then hiz.aciklama else '' end)`,
                      anaislemadi: `(case when fis.fistipi = 'KB' then 'Yatan/Çekilen' when fis.fistipi = 'HY' then 'Yatırım' when fis.fistipi = 'HH' then 'Banka Hizmet' else '' end)`,
                      detaciklama: `(case when fis.fistipi in ('KB', 'HY') then har.aciklama when fis.fistipi = 'HH' then dbo.hizmetack(har.belgetarih, har.belgeseri, har.belgeno, har.aciklama) else '' end)`,
                      dvkur: 'har.dvkur', bedel: `(case when fis.fistipi = 'HY' then har.brutbedel else (har.bedel - har.kredifaiz) end)`,
                      dvbedel: `(case when fis.fistipi = 'HY' then har.dvbrutbedel else (har.dvbedel - har.kredidvfaiz) end)`,
                      kdetay: 'kdet.kdetay', takipno: 'har.takipno', tarih: 'coalesce(har.belgetarih, fis.tarih)',
                      fisnox: '(case when har.belgeno = 0 then fis.fisnox else har.belgenox end)', banhesapkod: 'har.banhesapkod',                                     /* fazla satır kullanmayalım, justified olarak kısa ifadeleri tek satırda birleştir */
                      refkod: `(case when fis.fistipi = 'KB' then fis.kasakod else '' end)`, refadi: `(case when fis.fistipi = 'KB' then kas.aciklama else '' end)`
                    })
                }),
              (uygunluk.yatirim ? new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
                  let {where: wh} = sent; sent.fisHareket('finansfis', 'finanshar');
                  wh.fisSilindiEkle().add(`fis.fistipi = 'HY'`, 'har.stopaj <> 0')
                }).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kaysayac: 'har.kaysayac', kayittipi: `'BNYAT'`, banhesapkod: 'har.banhesapkod', oncelik: '10', ba: `'A'`,
						anaislemadi: `'Yatırım'`, islemadi: `'Yatırım-Stopaj'`, detaciklama: 'har.aciklama', bedel: 'har.stopaj'
					})
                })
              : null)
            ].filter(x => !!x)
        });
        return this
    }
    uniDuzenle_havaleEFT({ uygunluk, liste }) {
        $.extend(liste, {
            havaleEFT: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {        /* normal havale/eft */
                    let {where: wh} = sent; sent.fisHareket('hefis', 'hehar').har2TicCariBagla()
						.fromIliski('banbizhesap dhes', 'har.bizhesapkod = dhes.kod')
					wh.fisSilindiEkle()
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kaysayac: 'har.kaysayac', banhesapkod: 'fis.banhesapkod', takipno: 'har.takipno',
						kayittipi: `((case when fis.fistipi = 'GL' then 'G' when fis.fistipi = 'TP' then 'T' when fis.fistipi in ('BH', 'BE', 'BS') then 'B' else 'S' end) + 'BNHE')`,    /* (+) CONCAT işlemi sebebiyle dışına parantez koyduk ki sonuna ` ${alias}` geldiğinde sorun olmasın */
						oncelik: `(case when (fis.fistipi = 'GL' or (fis.fistipi = 'TP' and har.hba = 'B')) then 5 when fis.fistipi in ('BH', 'BE', 'BS') then 10 else 60 end)'`,
						ba: `(case when fis.fistipi = 'GL' then 'B' when fis.fistipi = 'TP' then har.hba else 'A' end)`,
						islemadi: `(case when fis.fistipi in ('GL', 'TP') then (
										case har.hisl when 'AEFT' then 'Gönderilen EFT' when 'BEFT' then 'Gelen EFT'
											when 'AHAV' then 'Gönderilen Havale' when 'BHAV' then 'Gelen Havale' when 'ASWF' then 'Gönderilen Swift' when 'BSWF' then 'Gelen Swift'
											when 'APOS' then 'Kr.Kart ile Ödeme' when 'BPOS' then 'POS ile Tahsil' else ''
										end) else (
									case fis.fistipi when 'BH' then 'Kendimize Havale' when 'BE' then 'Kendimize EFT' when 'BS' then 'Kendimize Swift' when 'SH' then 'Satıcıya Havale'
										when 'SE' then 'Satıcıya EFT' when 'SS' then 'Satıcıya Swift' else '' end)
									end)`,
						anaislemadi: `(case fis.fistipi when 'TP' then 'Toplu Havale/EFT/POS' when 'GL' then 'Müşteriden Havale/EFT'
											else (case when fis.fistipi in ('BN', 'BE', 'BS') then 'Kendimize Havale/EFT' else '' end)
											end)`,
						detaciklama: 'har.aciklama', dvkur: 'har.dvkur', bedel: 'har.bedel', dvbedel: 'har.dvbedel',
						tarih: 'coalesce(har.belgetarih, fis.tarih)', fisnox: '(case when har.belgeno = 0 then fis.fisnox else har.belgenox end)',
						refkod: `(case when fis.fistipi in ('BE', 'BH', 'BS') then har.bizhesapkod else har.ticmustkod end)`,
						refadi: `(case when fis.fistipi in ('BE', 'BH', 'BS') then dhes.aciklama else car.birunvan end)`
                    })
                }),
				/* hav/eft masraf */
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
                    let {where: wh} = sent; sent.fisHareket('hefis', 'hehar').har2TicCariBagla()
						.fromIliski('banbizhesap dhes', 'har.bizhesapkod = dhes.kod')
					wh.fisSilindiEkle().add(
						'har.masraf > 0', new MQOrClause([
							{ inDizi: ['SH', 'SE', 'SS', 'BH', 'BE', 'BS'], saha: 'fis.fistipi' },
							new MQAndClause([`fis.fistipi = 'TP'`, { inDizi: ['AHAV', 'AEFT', 'ASWF', 'APOS'], saha: 'har.hisl' }])
						])
					)
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kaysayac: 'har.kaysayac', banhesapkod: 'fis.banhesapkod', oncelik: '70', ba: `'A'`,
						kayittipi: `((case when fis.fistipi = 'TP' then 'T' when fis.fistipi in ('BH', 'BE', 'BS') then 'B' else 'S' end) + 'BNHE')`,
						islemadi: `(case when (fis.fistipi in ('SH', 'BH') or (fis.fistipi = 'TP' and har.hisl = 'AHAV')) then 'Havale Masrafı'
										when (fis.fistipi in ('SE', 'BE') or (fis.fistipi = 'TP' and har.hisl = 'AEFT')) then 'EFT Masrafı'
										when (fis.fistipi in ('SS', 'BS') or (fis.fistipi = 'TP' and har.hisl = 'ASWF')) then 'Swift Masrafı'
										when (fis.fistipi = 'TP' and har.hisl = 'APOS') then 'POS Masrafı' else '' end)`,
						anaislemadi: `(case fis.fistipi when 'TP' then 'Toplu Havale/EFT/POS' when 'GL' then 'Müşteriden Havale/EFT'
											else (case when fis.fistipi in ('BN','BE','BS') then 'Kendimize Havale/EFT' else '' end)
											end)`,
						detaciklama: 'har.aciklama', bedel: 'har.masraf', fisnox: 'fis.fisnox', takipno: 'har.takipno',
						refkod: `(case when fis.fistipi in ('BE', 'BH', 'BS') then har.bizhesapkod else har.ticmustkod end)`,
						refadi: `(case when fis.fistipi in ('BE', 'BH', 'BS') then dhes.aciklama else car.birunvan end)`
                    })
                }),
				/* Kendimize EFT */
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
                    let {where: wh} = sent; sent.fisHareket('hefis', 'hehar').har2TicCariBagla()
						.fromIliski('banbizhesap dhes', 'har.bizhesapkod = dhes.kod')
						.fromIliski('bansube dsub', ['dhes.bankakod = dsub.bankakod', 'dhes.subekod = dsub.subekod'])
					wh.fisSilindiEkle().add('har.krediharsayac is null').inDizi(['BH', 'BE', 'BS'], 'fis.fistipi')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kaysayac: 'har.kaysayac', kayittipi: `'BBNHE'`, banhesapkod: 'har.bizhesapkod', oncelik: '12', ba: `'B'`, anaislemadi: `'Kendimize Havale/EFT'`,
						islemadi: `(case fis.fistipi when 'BH' then 'Kendimize Havale' when 'BE' then 'Kendimize EFT' when 'BS' then 'Kendimize Swift' else '' end)`,
						detaciklama: 'har.aciklama', dvkur: 'har.dvkur', bedel: '(har.bedel - har.kredifaiz)', dvbedel: 'har.dvbedel',
						takipno: 'har.takipno', refkod: 'fis.banhesapkod', refadi: `(case when fis.fistipi in ('BE', 'BH', 'BS') then dhes.aciklama else '' end)`
                    })
                })
            ]
        });
        return this
    }
	uniDuzenle_tahsilSekli({ uygunluk, liste }) {
        $.extend(liste, {
            tahsilSekli: [
				/* Fatura Yoluyla */
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
                    let {where: wh} = sent;
					sent.fisHareket('piffis', 'piftaksit').fis2CariBagla().har2TahSekliBagla({ kodClause: 'har.taktahsilsekli' });
                    wh.fisSilindiEkle().inDizi(['I', 'F', 'P'], 'fis.piftipi').inDizi(['HV', 'HG'], 'tsek.tahsiltipi')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kaysayac: 'har.kaysayac', kayittipi: `'PIFTAK'`, banhesapkod: 'tsek.mevduathesapkod',
                        oncelik: `(case when fis.almsat = 'A' then 140 else 20 end)`, anaislemadi: `'Fatura Havale'`,
                        ba: `(case when fis.almsat + RTRIM(fis.iade) in ('A', 'M', 'TI') then 'A' else 'B' end)`,
                        islemadi: `(case when fis.almsat + RTRIM(fis.iade) in ('A', 'M', 'TI') then 'Fat.Gön.Havale' else 'Fat.Gelen Havale' end)`,
                        fisaciklama: 'fis.cariaciklama', dvkur: 'fis.dvkur', bedel: 'har.bedel', dvbedel: 'har.dvbedel',
                        takipno: 'fis.orttakipno', refkod: 'fis.must', refadi: 'car.birunvan'
                    })
                }),
				/* Cari Tahsil Yoluyla */
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
                    let {where: wh} = sent;
					sent.fisHareket('carifis', 'carihar')
						.fis2CariBagla({ mustSaha: 'ticmustkod' })
						.har2TahSekliBagla();
                    wh.fisSilindiEkle().add(`tsek.tahsiltipi IN ('HV', 'HG')`)
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kaysayac: 'har.kaysayac', kayittipi: `'CARTAH'`, banhesapkod: 'har.tahposhesapkod',
                        oncelik: `(case when fis.ba = 'B' then 140 else 20 end))`, ba: `dbo.tersba(fis.ba)`,
						islemadi: `(case when fis.ba = 'B' then 'Cari.Gön.Havale' else 'Cari Gelen Havale' end)`,
                        detaciklama: 'har.aciklama', dvkur: 'har.dvkur', bedel: 'har.bedel', dvbedel: 'har.dvbedel',
                        takipno: 'fis.takipno', refkod: 'fis.ticmustkod', refadi: 'car.birunvan'
                    })
                })
            ]
        });
        return this
    }
	uniDuzenle_genelDekont({ uygunluk, liste }) {
        $.extend(liste, {
            genelDekont: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
                    let {where: wh} = sent; sent.fisHareket('geneldekontfis', 'geneldekonthar').fis2MuhIslBagla();
                    wh.fisSilindiEkle().add(`fis.ozeltip = ''`, `har.kayittipi = 'MV'`);
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kaysayac: 'har.kaysayac', kayittipi: `'GDEK'`, banhesapkod: 'har.banhesapkod',
                        oncelik: '60', ba: 'har.ba', islemadi: `'Genel Dekont'`,
                        detaciklama: 'har.aciklama', dvkur: 'har.dvkur', bedel: 'har.bedel', dvbedel: 'har.dvbedel',
                        takipno: 'har.takipno', refkod: 'fis.islkod', refadi: 'isl.aciklama'
                    })
                })
            ]
        });
        return this
    }
    uniDuzenle_virman({ uygunluk, liste }) {
        $.extend(liste, {
            virman: [
				/* Çıkış açısından */
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;
                    sent.fisHareket('geneldekontfis', 'geneldekonthar')
                        .fromIliski('geneldekonthar gir', 'har.fissayac = gir.fissayac')
						.fromIliski('banbizhesap ghes', 'gir.banhesapkod = ghes.kod');
					wh.degerAta('H', 'fis.ozeltip').degerAta('MV', 'har.kayittipi')
						.add('har.seq % 2 = 1', 'gir.seq = (har.seq + 1)')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        refsubekod: 'ghes.bizsubekod', kaysayac: 'har.kaysayac', kayittipi: `'BNVIR'`,
						banhesapkod: 'har.banhesapkod', oncelik: '60', ba: 'har.ba', islemadi: `'Banka Hesap Virmanı'`,
						dvkur: 'har.dvkur', bedel: 'har.bedel', dvbedel: 'har.dvbedel',
						takipno: 'har.takipno', refkod: 'gir.banhesapkod', refadi: 'ghes.aciklama',
						detaciklama: 'har.aciklama'
                    })
				}),
				/* Giriş açısından */
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;
                    sent.fisHareket('geneldekontfis', 'geneldekonthar')
                        .fromIliski('geneldekonthar cik', 'har.fissayac = cik.fissayac')
						.fromIliski('banbizhesap ches', 'cik.banhesapkod = ches.kod');
						/*.fromIliski('banbizhesap bhes', 'har.banhesapkod = bhes.kod')*/
					wh.degerAta('H', 'fis.ozeltip').degerAta('MV', 'har.kayittipi')
						.add('har.seq % 2 = 0', 'cik.seq = (har.seq - 1)')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						refsubekod: 'fis.bizsubekod', kaysayac: 'har.kaysayac', kayittipi: `'BNVIR'`,
						banhesapkod: 'har.banhesapkod', oncelik: '61' , ba: 'har.ba', islemadi: `'Banka Hesap Virmanı'`,
						dvkur: 'har.dvkur', bedel: 'har.bedel', dvbedel: 'har.dvbedel',
						takipno: 'har.takipno', refkod: 'cik.banhesapkod', refadi: 'ches.aciklama',
						detaciklama: 'har.aciklama'
                    })
                })
            ]
        });
        return this
    }
	uniDuzenle_krediKartOdeme({ uygunluk, liste }) {
        $.extend(liste, {
            pos$krediKartOdeme: [
				/* Giriş açısından */
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent, or = new MQOrClause();
					if (uygunluk.pos) { or.degerAta('T', 'fis.almsat') }
					if (uygunluk.krediKartOdeme) { or.degerAta('A', 'fis.almsat').inDizi(['', 'MV'], 'har.reftipi') }
                    sent.fisHareket('posfis', 'posilkhar').har2PosKosulBagla();
					wh.fisSilindiEkle().degerAta('ND', 'fis.fistipi').add(or)
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kaysayac: 'har.kaysayac', kayittipi: `'NDON'`, banhesapkod: `(case when fis.almsat = 'T' then har.banhesapkod else har.refmevduatkod end)`,
						oncelik: '70', ba: `(case when fis.almsat = 'T' then 'B' else 'A' end)`,
						islemadi: `(case when fis.almsat = 'T' then 'Pos Nakde Dönüşüm' else 'Kredi Kart Ödeme' end)`, anaislemadi: ({ hv }) => hv.islemadi,
						detaciklama: 'har.aciklama', dvkur: 'har.dvkur', bedel: 'har.brutbedel', dvbedel: 'har.dvbedel',
						tarih: 'coalesce(har.belgetarih, fis.tarih)', fisno: '(case when har.belgeno = 0 then fis.fisnox else har.belgenox end)',
						takipno: 'har.takipno', refkod: 'har.poskosulkod', refadi: 'pkos.aciklama'
                    })
                })
            ]
        });
        return this
    }
	uniDuzenle_posKomisyon({ uygunluk, liste }) {
        $.extend(liste, {
            posKomisyon: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh, sahalar} = sent;
					sent.fisHareket('posfis', 'posilkhar');
					wh.fisSilindiEkle().degerAta('ND', 'fis.fistipi').degerAta('T', 'fis.almsat')
						.add('(har.olasikomisyon + har.olasikatkipayi) > 0')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kaysayac: 'har.kaysayac', kayittipi: `'KKOM'`, oncelik: '90', ba: `'A'`,
						banhesapkod: 'har.banhesapkod', islemadi: `'Pos Komisyon'`, anaislemadi: ({ hv }) => hv.islemadi,
						bedel: '(har.olasikomisyon + har.olasikatkipayi)', tarih: 'coalesce(har.belgetarih, fis.tarih)',
						fisnox: '(case when har.belgeno = 0 then fis.fisnox else har.belgenox end)', detaciklama: 'har.aciklama'
                    })
                })
            ]
        });
        return this
    }
	uniDuzenle_pos({ uygunluk, liste }) {
        $.extend(liste, {
            pos: [
				/* Eski Nakde Dönüşüm */
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh, sahalar} = sent;
					sent.fisHareket('posfis', 'posdigerhar');
					wh.fisSilindiEkle().degerAta('TE', 'fis.fistipi')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kaysayac: 'har.kaysayac', kayittipi: `'POS'`, banhesapkod: 'har.banhesapkod', oncelik: '1',
						ba: `(case when fis.almsat = 'T' then 'B' else 'A' end)`, bedel: 'har.brutbedel',
						islemadi: `(case when fis.almsat = 'A' then 'Kr.Kart Ödeme(Eski)' else 'POS Nakde Dönüşüm(Eski)' end)`
                    })
                }),
				/* POS Komisyon */
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh, sahalar} = sent;
					sent.fisHareket('posfis', 'posdigerhar');
					wh.fisSilindiEkle().degerAta('TE', 'fis.fistipi')
						.add(`(har.komisyon + har.katkipayi) <> 0`)
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kaysayac: 'har.kaysayac', kayittipi: `'POS'`, banhesapkod: 'har.banhesapkod', oncelik: '81',
						ba: `(case when fis.almsat = 'T' then 'A' else 'B' end)`, bedel: `(har.komisyon + har.katkipayi)`,
						islemadi: `'POS Komisyon ve Katkı'`, anaislemadi: `'POS Nakde Dönüşüm'`
                    })
                })
            ]
        });
        return this
    }
	uniDuzenle_borcCekCekilen({ uygunluk, liste }) {
        $.extend(liste, {
            borcCekCekilen: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh, sahalar} = sent;
					sent.fromAdd('csfis fis').fis2KasaBagla()
						.fromIliski('csilkhar bel', 'bel.fissayac = fis.kaysayac')
					wh.fisSilindiEkle().degerAta('BN', 'fis.fistipi').degerAta('BC', 'fis.belgetipi')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kaysayac: 'bel.kaysayac', kayittipi: `(fis.belgetipi + 'CSILK')`, banhesapkod: 'bel.banhesapkod', oncelik: '80',
						islemadi: `'Borç Çek İle Çekilen'`, detaciklama: `('Çek:' + LTRIM(STR(bel.belgeno)))`,
						ba: `'A'`, dvkur: 'fis.dvkur', bedel: 'bel.bedel', dvbedel: 'bel.dvbedel',
						takipno: 'fis.takipno', refkod: 'fis.kasakod', refadi: 'kas.aciklama'
                    })
                })
            ]
        });
        return this
    }
	uniDuzenle_csTahsilEdilen({ uygunluk, liste }) {
        $.extend(liste, {
            csTahsilEdilen: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh, sahalar} = sent;
					sent.fisHareket('csfis', 'csdigerhar')
						.fromIliski('csilkhar bel', 'har.ilksayac = bel.kaysayac')
						.fromIliski('carmst car', 'bel.ciranta = car.must')
					wh.fisSilindiEkle()
						.inDizi(['TE', 'BE'], 'fis.fistipi')
						.inDizi(['AC', 'AS', 'BC', 'BS'], 'fis.belgetipi')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kaysayac: 'har.kaysayac', kayittipi: `fis.belgetipi + 'CSDIGER'`,
				        banhesapkod: `(case when fis.belgetipi = 'BC' then bel.banhesapkod else fis.banhesapkod end)`,
				        oncelik: '50', ba: `(case when fis.belgetipi IN ('BC', 'BS') then 'A' else 'B' end)`,
				        islemadi: `(case when fis.belgetipi IN ('BC', 'BS') then 'Çek/Senet Ödenen' else 'Çek/Senet Nakde Dönüşen' end)`,
				        detaciklama: `(
				            (case fis.belgetipi when 'AC' then (LTRIM(STR(bel.belgeyil)) + '-' + bel.bankakod + LTRIM(STR(bel.belgeno)))
				                when 'AS' then (LTRIM(STR(bel.belgeyil)) + '-' + LTRIM(STR(bel.belgeno)))
				                when 'BC' then (bel.banhesapkod + '-' + LTRIM(STR(bel.belgeno))) 
				                when 'BS' then (LTRIM(STR(bel.belgeyil)) + '-' + LTRIM(STR(bel.belgeno)))
				                else '' end)
				            + ' ' + RTRIM(har.aciklama))`,
				        dvkur: 'fis.dvkur', bedel: '(case when har.bedel = 0 then bel.bedel else har.bedel end)',
				        dvbedel: `(case when har.bedel = 0 then bel.dvbedel else har.dvbedel end)`,
				        takipno: 'fis.takipno', refkod: 'car.must', refadi: 'car.birunvan'
                    })
                })
            ]
        });
        return this
    }
	uniDuzenle_csEldenTahsil({ uygunluk, liste }) {
        $.extend(liste, {
            csEldenTahsil: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh, sahalar} = sent;
					sent.fisHareket('csfis', 'csdigerhar')
						.fromIliski('csportfoy prt', 'fis.portfkod = prt.kod')
						.fromIliski('csilkhar bel', 'har.ilksayac = bel.kaysayac')
						.fromIliski('carmst car', 'bel.ciranta = car.must');
					wh.fisSilindiEkle().inDizi(['EL', 'EO'], 'fis.fistipi')
						.inDizi(['HV', 'HG'], 'fis.tahsiltipi')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kaysayac: 'fis.kaysayac', kayittipi: `'CSDIG'`, banhesapkod: 'fis.refhesapkod',
						oncelik: '50', ba: `(case when fis.belgetipi IN ('AC', 'AS') then 'B' else 'A' end)`,
						islemadi: `(case when fis.belgetipi IN ('AC', 'AS') then 'Ç/S. Elden Tahsil' else 'Ç/S. Elden Ödeme' end)`,
						dvkur: 'fis.dvkur', bedel: `(case when har.bedel = 0 then bel.bedel else har.bedel end)`,
						dvbedel: `(case when har.bedel = 0 then bel.dvbedel else har.dvbedel end)`,
						takipno: 'fis.takipno', refkod: 'bel.ciranta', refadi: 'car.birunvan',
						detaciklama: `('No:' + LTRIM(STR(bel.belgeno)))`
                    })
                })
            ]
        });
        return this
    }
	uniDuzenle_karsiliksiz({ uygunluk, liste }) {
        $.extend(liste, {
            karsiliksiz: [
				/* karsiliksiz isleminde masraf */
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh, sahalar} = sent;
					sent.fisHareket('csfis', 'csdigerhar')
						.fromIliski('csilkhar bel', 'har.ilksayac = bel.kaysayac');
					wh.fisSilindiEkle().inDizi(['EK', 'KR', '3K'], 'fis.fistipi')
						.degerAta('AS', 'fis.tahsiltipi').add('har.masraf <> 0')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kaysayac: 'har.kaysayac', kayittipi: `fis.belgetipi + 'CSDIGER'`,
						banhesapkod: 'fis.banhesapkod', oncelik: '50', ba: `'A'`,
						islemadi: `'Protesto Masrafı'`, detaciklama: '(LTRIM(STR(bel.belgeyil)) + LTRIM(STR(bel.belgeno)))',
						bedel: 'har.masraf', takipno: 'fis.takipno'
                    })
                })
            ]
        });
        return this
    }
}
