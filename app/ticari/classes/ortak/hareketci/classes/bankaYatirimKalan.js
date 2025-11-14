class BankaYatirimKalanHareketci extends BankaOrtakHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 3 } static get kisaKod() { return 'BY' }
	static get kod() { return 'bankaYatirimKalan' } static get aciklama() { return 'Banka Yatırım' }
	static get uygunmu() { return app.params?.bankaGenel?.kullanim?.yatirim }
	static get gecerliBankaHesapTipleri() { return ['YT', 'VD'] }
	static get donemselIslemlerIcinUygunmu() { return false }
	static get eldekiVarliklarIcinUygunmu() { return true }
	
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
			new CKodVeAdi(['yatirimKalani', 'Yatırım Kalanı'])
        ])
    }
	uniDuzenleOncesi({ sender: { finansalAnalizmi, eldekiVarliklarmi } = {} }) {
		super.uniDuzenleOncesi(...arguments)
		/*let {attrSet} = this
		if (finansalAnalizmi && !attrSet?.miktar)
			 attrSet[key].miktar = true*/
	}
	uniOrtakSonIslem({ sender, sender: { finansalAnalizmi, eldekiVarliklarmi } = {}, hv, sent, sent: { from, where: wh, sahalar } }) {
		super.uniOrtakSonIslem(...arguments)
		let {attrSet, class: { gecerliBankaHesapTipleri: tipListe }} = this
		if (!from.aliasIcinTable('bhes')) {
			let {banhesapkod: kodClause} = hv
			sent.x2BankaHesapBagla({ kodClause })
		}
		wh.inDizi(tipListe, 'bhes.tipi')
		if (finansalAnalizmi && !attrSet?.miktar) {
			let {miktar: clause} = hv
			sahalar.add(`${clause} miktar`)
		}
	}
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e);
        this.uniDuzenle_yatirimKalani(e)
    }
    uniDuzenle_yatirimKalani({ uygunluk, liste }) {
        $.extend(liste, {
            yatirimKalani: [
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent, sent: { where: wh } }) => {
						sent.fisHareket('finansfis', 'finanshar')
						sent.leftJoin('har',
							`(select digerharsayac, sum(revizeyatirimmiktar) donmiktar from finanshar where digerharsayac>0 group by digerharsayac) don`,
							'har.kaysayac = don.digerharsayac'
						)
						sent.fromIliski('banbizhesap yhes', 'har.yatirimhesapkod = yhes.kod')
						sent.fromIliski('yatirimtipi ytip', 'har.yatirimtipkod = ytip.kod')
						wh.fisSilindiEkle()
						wh.inDizi(['YT', 'VD'], 'fis.fistipi')
						wh.add(new MQOrClause([
							`fis.bvadeli > 0 and don.digerharsayac is null`,
							`fis.bvadeli = 0 and (har.revizeyatirimmiktar - coalesce(don.donmiktar, 0)) > 0`
						]))
					}).hvDuzenleIslemi(({ hv }) => {
						let degerlemeSql = `ROUND((har.revizeyatirimmiktar - coalesce(don.donmiktar, 0)) * har.revizedegerlemexfiyat, 2)`
						$.extend(hv, {
							kaysayac: 'har.kaysayac', banhesapkod: 'har.yatirimhesapkod',
							kayittipi: `(case fis.fistipi when 'YG' then 'YATG' else 'YAT' end)`,
							oncelik: `(case fis.fistipi when 'YG' then 10 else 120 end)`,
							vadegunu: 'har.vadegunu', vade: 'har.vade',
							islemadi: `(case fis.fistipi when 'YG' then 'Yatırım Dönüş' else 'Yatırım' end)`,
							anaislemadi: `(case fis.fistipi when 'YG' then 'Yatırım Dönüş' else 'Yatırım' end)`,
							refkod: 'har.yatirimtipkod', refadi: 'ytip.aciklama', /*detaciklama: 'har.aciklama'*/
							dvkod: 'yhes.dvtipi', dvkur: 'har.revizedegerlemedvkur',
							miktar: `(har.revizeyatirimmiktar - coalesce(don.donmiktar, 0))`,
							fiyat: 'har.revizedegerlemexfiyat', ba: `'B'`,
							bedel: (
								`(case when fis.bvadeli > 0` +
								`    then har.bedel + har.kredifaiz - har.stopaj` +
								`    else (${degerlemeSql} * (case when yhes.dvtipi > '' then har.revizedegerlemedvkur else 1 end))` +
								` end)`
							),
							dvbedel: (
								`(case when yhes.dvtipi > ''` +
								`    then (case when fis.bvadeli > 0 then har.dvbedel + har.kredidvfaiz else ${degerlemeSql} end)` +
								`    else 0` +
								` end)`
							),
							xbedel: (
								`(case when fis.bvadeli > 0` +
								`    then (case when yhes.dvtipi = '' then har.bedel + har.kredifaiz - har.stopaj else har.dvbedel + har.kredidvfaiz end)` +
								`    else ${degerlemeSql}` +
								` end)`
							)
						})
					})
            ]
        })
        return this
    }
}
