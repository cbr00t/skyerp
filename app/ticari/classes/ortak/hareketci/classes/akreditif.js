class BankaAkreditifHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get oncelik() { return 7 }
	static get kod() { return 'akreditif' } static get aciklama() { return 'Banka Akreditif' }
	static get uygunmu() { return app?.params?.bankaGenel?.kullanim?.akreditif }
	static altTipYapilarDuzenle({ def }) { super.altTipYapilarDuzenle(...arguments); def.ortak() }
	static mstYapiDuzenle({ result }) {
		super.mstYapiDuzenle(...arguments);
		result.set('banhesapkod', ({ sent, kodClause, mstAlias, mstAdiAlias }) =>
			sent.fromIliski(`banbizhesap ${mstAlias}`, `${kodClause} = ${mstAlias}.kod`).add(`${mstAlias}.aciklama ${mstAdiAlias}`))
	}
    /* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(arguments); kaListe.push(...[
			new CKodVeAdi(['akrAcilis', 'Akreditif Açılışı']),
			new CKodVeAdi(['akrKapanis', 'Akreditif Kapanışı'])
		])
    }
    /** Varsayılan değer atamaları (host vars) – temel sınıfa eklemeler.
		Hareketci.varsayilanHVDuzenle değerleri aynen alınır, sadece eksikler eklenir */
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
        super.varsayilanHVDuzenle(...arguments);
		for (const key of ['fisaciklama', 'detaciklama']) { hv[key] = sqlEmpty }
		for (const key of ['dvbedel']) { hv[key] = sqlZero }
		$.extend(hv, {
			/* 'anaislemadi' yoksa 'islemadi' degeri esas alinir */
			anaislemadi: ({ hv }) => hv.islemadi,
			/* 'detaciklama' gecicidir - 'detaciklama' ve 'fisaciklama' birleserek 'aciklama' olusturulur. (bos olan alinmaz) */
			aciklama: ({ hv }) => {
                const withCoalesce = (clause) => `COALESCE(${clause}, '')`;
                const {fisaciklama: fisAciklama, detaciklama: detAciklama} = hv;
                return fisAciklama && detAciklama 
                    ? `${withCoalesce(fisAciklama)} + ' ' + ${withCoalesce(detAciklama)}` 
                    : withCoalesce(detAciklama || fisAciklama || sqlEmpty)
            }
		})
    }
    /** UNION sorgusu hazırlama – hareket tipleri için */
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e);
        this.uniDuzenle_akrAcilis(e).uniDuzenle_akrKapanis(e)
    }
    /** (Akreditif kaydı) için UNION */
    uniDuzenle_akrAcilis({ uygunluk, liste }) {
		const kodClause = 'akr.banhesapkod'; $.extend(liste, {
            akrAcilis: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {where: wh} = sent; sent.fromAdd('akreditif akr')
						.fromIliski('carmst car', 'akr.must = car.must')
						.x2BankaHesapBagla({ kodClause })
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						bizsubekod: 'akr.bizsubekod', ozelisaret: 'bhes.ozelisaret', 
						kaysayac: 'akr.kaysayac', kayittipi: `'AKR'`, islemadi: `'Akreditif Açılması'`,
						banhesapkod: kodClause, oncelik: '5', ba: `'A'`,
						detaciklama: `('Akr: ' + rtrim(akr.aknox) + ' ' + rtrim(akr.notlar))`,
						dvkur: 'akr.dvkur', bedel: 'akr.bedel', dvbedel: 'akr.dvbedel',
						tarih: 'akr.tarih', fisnox: 'akr.aknox', takipno: 'akr.takipno',
						refkod: 'akr.must', refadi: 'car.birunvan'
                    })
                })
            ]
        });
        return this
    }
	/** (Akreditif kapanışı) için UNION */
    uniDuzenle_akrKapanis({ uygunluk, liste }) {
		const kodClause = 'aisl.banhesapkod'; $.extend(liste, {
            akrKapanis: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {where: wh} = sent; sent.fromAdd('akrislem aisl')
						.fromIliski('akreditif akr', 'aisl.akrsayac = akr.kaysayac')
						.fromIliski('carmst car', 'aisl.must = car.must')
						.x2BankaHesapBagla({ kodClause })
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						bizsubekod: 'aisl.bizsubekod', ozelisaret: 'aisl.ozelisaret',
						kaysayac: 'aisl.kaysayac', kayittipi: `'AKRDIG'`,
						banhesapkod: kodClause, oncelik: '90', ba: `'B'`,
						islemadi: `(case aisl.tipkod when 'I' then 'Akr. İade' when 'X' then 'Akr. Ödeme' else '**Belirsiz**' end)`,
						anaislemadi: `'Akr. İade/Ödeme'`, detaciklama: `('Akr: ' + rtrim(akr.aknox) + ' ' + rtrim(aisl.aciklama))`,
						dvkur: 'aisl.dvkur', bedel: 'aisl.bedel', dvbedel: 'aisl.dvbedel',
						tarih: 'akr.tarih', fisnox: 'akr.aknox', takipno: 'akr.takipno',
						refKod: 'aisl.must', refadi: 'car.birunvan'
                    })
                })
            ]
        });
        return this
    }
}
