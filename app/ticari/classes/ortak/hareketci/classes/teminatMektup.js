class BankaTeminatMektupHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get uygunmu() { return true ||app?.params?.bankaGenel?.kullanim?.teminatMektubu }
    /* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle(e) {
        super.hareketTipSecim_kaListeDuzenle(e); e.kaListe.push(
			new CKodVeAdi(['temAcilis', 'Teminat Mektubu Açılışı']),
			new CKodVeAdi(['temKapanis', 'Teminat Mektubu Kapanışı'])
		)
    }
    /** Varsayılan değer atamaları (host vars) */
    static varsayilanHVDuzenle(e) {
        super.varsayilanHVDuzenle(e); const { hv, sqlNull, sqlEmpty, sqlZero } = e; /* AI: Kısa tanımlar, ilk satırla birleştirilebilir */
        $.extend(hv, {
            detaciklama: sqlEmpty, anaislemadi: ({ hv }) => hv.islemadi,
            aciklama: ({ hv }) => {
                const withCoalesce = (clause) => `COALESCE(${clause}, '')`, {fisaciklama: fisAciklama, detaciklama: detAciklama} = hv;
                return fisAciklama && detAciklama
                    ? `${withCoalesce(fisAciklama)} + ' ' + ${withCoalesce(detAciklama)}`
                    : withCoalesce(detAciklama || fisAciklama)
            }
        })
    }
    /** UNION sorgusu hazırlama – hareket tipleri için */
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e);
        this.uniDuzenle_temAcilis(e).uniDuzenle_temKapanis(e)
    }
    /** (Teminat Mektubu Açılışı) için UNION */
    uniDuzenle_temAcilis({ uygunluk, liste }) {
        const kodClause = 'har.banhesapkod'; $.extend(liste, {
            temAcilis: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {where: wh} = sent;
                    sent.fisHareket('temmektupfis', 'temmekilkhar').har2CariBagla().x2BankaHesapBagla({ kodClause });
                    wh.fisSilindiEkle().inDizi(['', 'D'], 'fis.fistipi')
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kayittipi: `'TMMILK'`, banhesapkod: kodClause,
                        oncelik: `(case when fis.fistipi = 'D' then 0 else 5 end)`, ba: `'A'`,
                        aciklama: `(case when fis.fistipi = 'D' then 'Teminat Mektup Devir' else 'Teminat Mektup Alımı' end)`,
                        detaciklama: `('Mektup: ' + rtrim(har.belgenox) + ' ' + rtrim(har.aciklama))`,
                        bedel: 'har.bedel', takipno: 'har.takipno', refkod: 'har.must', refadi: 'car.birunvan'
                    })
                })
            ]
        });
        return this
    }
    /** (Teminat Mektubu Kapanışı) için UNION */
    uniDuzenle_temKapanis({ uygunluk, liste }) {
        const kodClause = 'bel.banhesapkod'; $.extend(liste, {
            temKapanis: [
                new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {where: wh} = sent;
                    sent.fisHareket('temmektupfis', 'temmekdigerhar')
                        .fromIliski('temmekilkhar bel', 'har.ilksayac = bel.kaysayac')
                        .fromIliski('carmst car', 'bel.must = car.must')
						.x2BankaHesapBagla({ kodClause });
                    wh.fisSilindiEkle().add(`fis.fistipi = 'I'`)
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
                        kayittipi: `'TMMDIG'`, banhesapkod: kodClause,
                        oncelik: `'90'`, ba: `'B'`, islemadi: `'Teminat Mektup İadesi'`,
                        detaciklama: `('Mektup: ' + rtrim(bel.belgenox) + ' ' + rtrim(har.aciklama))`,
                        bedel: 'bel.bedel', takipno: 'bel.takipno', refkod: 'bel.must', refadi: 'car.birunvan'
                    })
                })
            ]
        });
        return this
    }
}
