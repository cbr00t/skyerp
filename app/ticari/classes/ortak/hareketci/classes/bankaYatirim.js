class BankaYatirimHareketci extends BankaOrtakHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 2 } static get kisaKod() { return 'BY' }
	static get kod() { return 'bankaYatirim' } static get aciklama() { return 'Banka Yatırım' }
	static get uygunmu() { return app.params?.bankaGenel?.kullanim?.yatirim }
	static get gecerliBankaHesapTipleri() { return ['YT', 'VD'] }
	static get donemselIslemlerIcinUygunmu() { return true }
	static get eldekiVarliklarIcinUygunmu() { return false }
	
	// static altTipYapilarDuzenle(e) { super.altTipYapilarDuzenle(e); e.def.sol() }
	static getAltTipAdiVeOncelikClause({ hv }) {
		return {
			...super.getAltTipAdiVeOncelikClause(...arguments),
			yon: `'sol'`
		}
	}
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(...arguments)
		kaListe.push(...[
            new CKodVeAdi(['devir', 'Devir']),
			new CKodVeAdi(['yatirim', 'Yatırım']),
			new CKodVeAdi(['geriDonus', 'Geri Dönüş'])
        ])
    }
	uniOrtakSonIslem({ sender, hv, sent, sent: { from, where: wh } }) {
		super.uniOrtakSonIslem(...arguments)
		let {banhesapkod: kodClause} = hv
		let {class: { gecerliBankaHesapTipleri: tipListe }} = this
		if (!from.aliasIcinTable('bhes'))
			sent.x2BankaHesapBagla({ kodClause })
		wh.inDizi(tipListe, 'bhes.tipi')
	}
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e);
        this.uniDuzenle_devir(e).uniDuzenle_yatirimVeGeriDonus(e)
    }
    uniDuzenle_devir({ uygunluk, liste }) {
		// ileride yapılacak
       /* $.extend(liste, {
            devir: [
                new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent, sent: { where: wh } }) => {
	                    sent.fisHareket('findevirfis', 'findevirhar')
	                    wh.fisSilindiEkle().add(`fis.fistipi = 'BH'`)
	                }).hvDuzenleIslemi(({ hv }) => {
	                    $.extend(hv, {
	                        kaysayac: 'har.kaysayac', kayittipi: `'BNDEV'`, banhesapkod: 'har.banhesapkod',
	                        oncelik: '0', ba: 'fis.ba', islemadi: `'Devir'`, anaislemadi: `'Devir'`,
	                        detaciklama: 'har.aciklama', takipno: '', dvkur: 'har.dvkur', bedel: 'har.bedel', dvbedel: 'har.dvbedel'
	                    })
	                })
            ]
        })*/
        return this
    }
    uniDuzenle_yatirimVeGeriDonus({ uygunluk, liste }) {
        $.extend(liste, {
            yatirim$geriDonus: [
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent, sent: { where: wh } }) => {
						let tipListe = [], tipEkle = (selector, ...kodlar) => {
							if (uygunluk[selector])
								tipListe.push(...kodlar)
						}
						tipEkle('yatirim', 'YT')
						tipEkle('geriDonus', 'YG')
						sent.fisHareket('finansfis', 'finanshar')
						sent.fromIliski('banbizhesap yhes', 'har.yatirimhesapkod = yhes.kod')
						sent.fromIliski('yatirimtipi ytip', 'har.yatirimtipkod = ytip.kod')
						wh.fisSilindiEkle().inDizi(tipListe, 'fis.fistipi')
					}).hvDuzenleIslemi(({ hv }) => {
						$.extend(hv, {
							kaysayac: 'har.kaysayac', banhesapkod: 'har.yatirimhesapkod',
							kayittipi: `(case fis.fistipi when 'YG' then 'YATG' else 'YAT' end)`,
							oncelik: `(case fis.fistipi when 'YG' then 10 else 120 end)`,
							ba: `(case fis.fistipi when 'YG' then 'A' else 'B' end)`,
							islemadi: `(case fis.fistipi when 'YG' then 'Yatırım Dönüş' else 'Yatırım' end)`,
							anaislemadi: `(case fis.fistipi when 'YG' then 'Yatırım Dönüş' else 'Yatırım' end)`,
							refkod: 'har.yatirimtipkod', refadi: 'ytip.aciklama', dvkur: 'har.dvkur',
							miktar: 'har.miktar',
							bedel: `(case fis.fistipi when 'YG' then har.bedel + har.kredifaiz - har.stopaj else har.bedel end)`,
							dvbedel: `(case fis.fistipi when 'YG' then har.dvbedel + har.kredidvfaiz else har.dvbedel end)`,
							faiz: 'har.kredifaiz', dvfaiz: 'har.kredidvfaiz', stopaj: 'har.stopaj'                                                                // gerekirse kullanılır
						})
					})
            ]
        })
        return this
    }
}
