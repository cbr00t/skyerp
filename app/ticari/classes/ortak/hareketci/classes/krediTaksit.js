class KrediTaksitHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get oncelik() { return 5 }
	static get kod() { return 'krediTaksit' } static get aciklama() { return 'Kredi Taksit' }
	static getBuGelecekClause(tarihClause) {
		const sqlNull = 'NULL'; if (!tarihClause || tarihClause?.toUpperCase() == sqlNull) { return sqlNull }
		const cariYil = app?.params?.zorunlu?.cariYil || today().yil;
		return `(case when ${tarihClause} <= ${cariYil} then 'B' else 'G' end)`
	}
	static mstYapiDuzenle({ result }) {
		super.mstYapiDuzenle(...arguments);
		result.set('banhesapkod', ({ sent, kodClause, mstAlias, mstAdiAlias }) =>
			sent.fromIliski(`banbizhesap ${mstAlias}`, `${kodClause} = ${mstAlias}.kod`).add(`${mstAlias}.aciklama ${mstAdiAlias}`))
	}
    /* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle(e) {
        super.hareketTipSecim_kaListeDuzenle(e);
        e.kaListe.push(...[
            new CKodVeAdi(['devir', 'Kredi Devir']), new CKodVeAdi(['krediAlim', 'Kredi Alımı']),
            new CKodVeAdi(['odeme', 'Kredi Ödeme']), new CKodVeAdi(['dekont', 'Genel Dekont'])
        ]/*.filter(x => !!x)*/)
    }
    /** Varsayılan değer atamaları (host vars) – temel sınıfa eklemeler.
		Hareketci.varsayilanHVDuzenle değerleri aynen alınır, sadece eksikler eklenir */
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
        super.varsayilanHVDuzenle(...arguments);
		/* (vade, takipno, refkod, refadi) için gerekli default hv değerleri Hareketci.varsayilanHVDuzenle seviyesinde zaten mevcut */
		/*for (const key of ['vade', 'takipno', 'refkod', 'refadi']) { hv[key] = sqlNull }*/
		/* yeni talimat: { (ozelisaret: '') değerleri (ozelisaret = 'fis.ozelisaret') olmalı.
			bu da base.varsayilanHVDuzenle seviyesinde mevcut.
			sqlEmpty ataması bu yüzden bu seviyede sadece comment yapıldı } */
		for (const key of [/*'ozelisaret',*/ 'mustkod', 'detaciklama']) { hv[key] = sqlEmpty }
		/* 'mustkod' olan durumda ('must', 'ticmust') sahalarına ihtiyaç yok, bunların yerini alır */
		for (const key of ['must', 'ticmust']) { delete hv[key] }
		$.extend(hv, {
			/* 'anaislemadi' yoksa 'islemadi' degeri esas alinir */
			anaislemadi: ({ hv }) => hv.islemadi,
			/* 'detaciklama' gecicidir - 'detaciklama' ve 'fisaciklama' birleserek 'aciklama' olusturulur. (bos olan alinmaz) */
			aciklama: ({ hv }) => {
                const withCoalesce = (clause) => `COALESCE(${clause}, '')`;
                const {fisaciklama: fisAciklama, detaciklama: detAciklama} = hv;
                return fisAciklama && detAciklama 
                    ? `${withCoalesce(fisAciklama)} + ' ' + ${withCoalesce(detAciklama)}` 
                    : withCoalesce(detAciklama || fisAciklama)
            },
			bugel: ({ hv }) => this.getBuGelecekClause(hv.vade)
		})
    }
    /** UNION sorgusu hazırlama – hareket tipleri için */
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e);
		this.uniDuzenle_devir(e).uniDuzenle_krediAlim(e).uniDuzenle_odeme(e).uniDuzenle_dekont(e)
    }
    /** (Kredi Devri) için UNION */
    uniDuzenle_devir({ uygunluk, liste }) {
		const kodClause = 'fis.kredihesapkod'; $.extend(liste, {
            devir: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {where: wh} = sent; sent.fisHareket('kredifis', 'kredihar').x2BankaHesapBagla({ kodClause });
                    wh.fisSilindiEkle().add(`fis.fistipi = 'D'`)
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kaysayac: 'fis.kaysayac', kayittipi: `'KRDEV'`,
						banhesapkod: kodClause, ba: `'A'`, oncelik: '0',
						islemadi: `'Kredi Devir'`, vade: 'har.vade',
						dvkur: 'fis.dvkur', bedel: 'har.brutbedel', dvbedel: 'har.dvbrutbedel',
						faiz: 'har.faiz', dvfaiz: 'har.dvfaiz'
                    })
                })
            ]
        });
        return this
    }
    /** (Kredi Alımı) için UNION */
    uniDuzenle_krediAlim({ uygunluk, liste }) {
        const kodClause = 'fis.kredihesapkod'; $.extend(liste, {
            krediAlim: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {where: wh} = sent; sent.fisHareket('kredifis', 'kredihar')
						.fis2CariBagla().fis2HizmetBagla().fis2KasaBagla()
						.fromIliski('banbizhesap rhes', 'fis.banhesapkod = rhes.kod')
						.x2BankaHesapBagla({ kodClause })
                    wh.fisSilindiEkle().add(`fis.fistipi = 'A'`)
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						kaysayac: 'fis.kaysayac', kayittipi: `'KRE'`,
						banhesapkod: kodClause, ba: `'A'`, oncelik: '60',
						islemadi: `'Kredi Alımı'`, vade: 'har.vade',
						dvkur: 'fis.dvkur', bedel: 'har.brutbedel', dvbedel: 'har.dvbrutbedel',
						faiz: 'har.faiz', dvfaiz: 'har.dvfaiz',
						refkod: `(case fis.hedeftipi when 'C' then fis.must when 'H' then fis.hizmetkod when 'K' then fis.kasakod else fis.banhesapkod end)`,
						refadi: `(case fis.hedeftipi when 'C' then car.birunvan when 'H' then hiz.aciklama when 'K' then kas.aciklama else rhes.aciklama end)`
                    })
                })
            ]
        });
        return this
    }
    /** (Taksit Ödeme - Havale ile Ödeme) için UNION */
    uniDuzenle_odeme({ uygunluk, liste }) {
        $.extend(liste, {
            odeme: [
                (e => {    /* Taksit ödeme (Havale ile ödeme) için Sub-UniBilgi */
					const kodClause = 'har.bizhesapkod'; return new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
						const {where: wh} = sent; sent.fisHareket('hefis', 'hehar')
							.fromIliski('kredihar khar', 'har.krediharsayac = khar.kaysayac')
							.fromIliski('banbizhesap dhes', 'fis.banhesapkod = dhes.kod')
							.x2BankaHesapBagla({ kodClause });
	                    wh.fisSilindiEkle()
							.add(`har.krediharsayac is not null`)
							.inDizi(['BH', 'BE', 'BS'], 'fis.fistipi')
	                }).hvDuzenleIslemi(({ hv }) => {
	                    $.extend(hv, {
							kayittipi: `'BBNHE'`, banhesapkod: kodClause, oncelik: '32', ba: `'B'`,
							islemadi: `(case fis.fistipi when 'BH' then 'Kendimize Havale' when 'BE' then 'Kendimize EFT' when 'BS' then 'Kendimize Swift' else '' end)`,
							anaislemadi: `'Kendimize Havale/EFT/Swift'`,
							detaciklama: 'har.aciklama', vade: 'khar.vade',
							dvkur: 'har.dvkur', bedel: '(har.bedel-har.kredifaiz)', dvbedel: '(har.dvbedel - har.kredidvfaiz)',
							faiz: 'har.kredifaiz', dvfaiz: 'har.kredidvfaiz',
							refkod: 'fis.banhesapkod', refadi: `(case when fis.fistipi in ('BE', 'BH', 'BS') then dhes.aciklama else '' end)`
	                    })
	                })
				}),
				(e => {    /* Taksit ödeme (Kasadan ödeme) için Sub-UniBilgi */
					const kodClause = 'har.banhesapkod'; return new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
						const {where: wh} = sent; sent.fisHareket('finansfis', 'finanshar').fis2KasaBagla()
							.fromIliski('kredihar khar', 'har.krediharsayac = khar.kaysayac')
							.x2BankaHesapBagla({ kodClause });
	                    wh.fisSilindiEkle()
							.inDizi(['BH', 'BE', 'BS'], 'fis.fistipi')
							.add(`har.krediharsayac is not null`)
							/* !! `fis.ba = 'A'` `fis.fistipi = 'KB' { (fis.ba = 'A' ve fis.fistipi = 'KB') değerleri hatalı kullanım, İPTAL } */
	                }).hvDuzenleIslemi(({ hv }) => {
	                    $.extend(hv, {
							kayittipi: `'KBNAK'`, banhesapkod: kodClause, oncelik: '32', ba: `'B'`,
							islemadi: `'Kasadan Ödenen'`, anaislemadi: `'Banka Yatan/Çekilen'`,
							detaciklama: 'har.aciklama', vade: 'khar.vade',
							dvkur: 'har.dvkur', bedel: '(har.bedel - har.kredifaiz)', dvbedel: '(har.dvbedel - har.kredidvfaiz)',
							faiz: 'har.kredifaiz', dvfaiz: 'har.kredidvfaiz',
							refkod: 'fis.kasakod', refadi: 'kas.aciklama'
	                    })
	                })
				})
            ]
        });
        return this
    }
	/** (Dekont) için UNION */
    uniDuzenle_dekont({ uygunluk, liste }) {
		const kodClause = 'har.banhesapkod'; $.extend(liste, {
            devir: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {where: wh} = sent; sent.fisHareket('geneldekontfis', 'geneldekonthar')
						.fis2MuhIslBagla().x2BankaHesapBagla({ kodClause });
                    wh.fisSilindiEkle().add(`fis.ozeltip = ''`, `har.kayittipi = 'TK'`)
					/* NOT: 'TK' yerine belki ileride ('TB' veya 'TG') değeri gelebilir, 'bugel' degeri de buna baglanabilir */
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						bugel: `'B'`, /* (bugel = 'B') => Bu Yıl */
						kayittipi: `'GDEK'`, banhesapkod: kodClause, oncelik: '60', ba: `'har.ba'`,
						islemadi: `'Genel Dekont'`, detaciklama: 'har.aciklama',
						/* üst seviyede { Hareketci.varsayilanHVDuzenle } zaten sqlNull değer var ve (cast .. as datetime) ifadesine ihtiyaç yok */
						/*vade: 'cast(null as datetime)', */
						dvkur: 'har.dvkur', bedel: 'har.bedel', dvbedel: 'har.dvbedel',
						faiz: '0', dvfaiz: '0', refkod: 'fis.islkod', refadi: 'isl.aciklama', takipno: 'har.takipno'
                    })
                })
            ]
        });
        return this
    }
}
