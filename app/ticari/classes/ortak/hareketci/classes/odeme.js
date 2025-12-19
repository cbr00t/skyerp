class OdemeHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kisaKod() { return 'OD' } static get kod() { return 'odeme' } static get aciklama() { return 'Ödeme' }
	static get uygunmu() { return true }  static get oncelik() { return 91 }
	static get maliTabloIcinUygunmu() { return true } static get donemselIslemlerIcinUygunmu() { return true }
	static get eldekiVarliklarIcinUygunmu() { return false }
	static getAltTipAdiVeOncelikClause({ hv }) {
		return {
			...super.getAltTipAdiVeOncelikClause(...arguments),
			yon: `'sag'`
		}
	}
	static mstYapiDuzenle({ result }) {
		super.mstYapiDuzenle(...arguments)
		result.set('must', ({ sent, sent: { sahalar }, kodClause, mstAlias, mstAdiAlias }) => {
			sent.fromIliski(`carmst ${mstAlias}`, `${kodClause} = ${mstAlias}.must`)
			sahalar.add(`${mstAlias}.birunvan ${mstAdiAlias}`)
		})
	}
	/* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
		let {aktarim: { kullanim: { pratikSatis } }} = app.params
        super.hareketTipSecim_kaListeDuzenle(arguments)
		kaListe.push(...[
			new CKodVeAdi(['cari', 'Cari']),
			new CKodVeAdi(['kasa', 'Kasa']),
			new CKodVeAdi(['krediKarti', 'Kredi Kartı']),
			new CKodVeAdi(['fatura', 'Fatura']),
		].filter(_ => _))
    }
	uniOrtakSonIslem({ hvDegeri, sent, sent: { from } }) {
		super.uniOrtakSonIslem(...arguments)
		let kodClause = hvDegeri('tahseklino') || 'har.tahseklino'
		if (!from.aliasIcinTable('tsek'))
			sent.fromIliski('tahsilsekli tsek', `${kodClause} = tsek.kodno`)
	}
    /** Varsayılan değer atamaları (host vars) – temel sınıfa eklemeler.
		Hareketci.varsayilanHVDuzenle değerleri aynen alınır, sadece eksikler eklenir */
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
		super.varsayilanHVDuzenle(...arguments)
		$.extend(hv, {
			anaislemadi: `'Ödeme'`,
			ba: `'A'`, tahseklino: sqlZero,
			dvbedel: sqlZero,
			tahtip: 'tsek.tahsiltipi'
		})
	}
    /** UNION sorgusu hazırlama – hareket tipleri için */
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e)
        this.uniDuzenle_fis(e)
    }
    /** (Ticari Stok/Hizmet) için UNION */
    uniDuzenle_fis({ uygunluk, liste }) {
		$.extend(liste, {
			cari: [
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => {
						sent.fisHareket('carifis', 'carihar')
							.fromIliski('tahsilsekli tsek', 'har.tahseklino = tsek.kodno')
							.fis2CariBagla({ mustSaha: 'mustkod' })
							.x2KasaBagla({ kodClause: 'har.tahkasakod' })
							.fromIliski('banbizhesap bhes', 'har.tahposhesapkod = bhes.kod')
							.fromIliski('carmst ycar', 'har.tahyemekcarikod = ycar.must')
						wh.fisSilindiEkle()
						wh.add(`fis.ba = 'B'`)
						wh.inDizi(['NK', 'KR', 'HG'], 'tsek.tahsiltipi')
					})
					.hvDuzenleIslemi(({ hv }) => {
						$.extend(hv, {
							kayittipi: `(case when tsek.tahsiltipi = 'NK' then 'KS' when tsek.tahsiltipi in ('KR', 'HG') then 'BH' else tsek.tahsiltipi end)`,
							isladi: `'Cari Hesap Ödeme'`, tahseklino: 'har.tahseklino',
							must: 'fis.mustkod', bedel: 'SUM(har.bedel)',
							refkod: `(case when tsek.tahsiltipi = 'NK' then har.tahkasakod when tsek.tahsiltipi in ('KR', 'HG') then har.tahposhesapkod else '??' end)`,
							refadi: `(case when tsek.tahsiltipi = 'NK' then kas.aciklama when tsek.tahsiltipi in ('KR', 'HG') then bhes.aciklama else '??' end)`
						})
					})
			],
			kasa: [
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => {
						sent.fisHareket('finansfis', 'finanshar')
							.har2CariBagla({ mustSaha: 'must' })
							.fis2KasaBagla()
							.fromIliski('carmst ycar', 'har.tahyemekcarikod = ycar.must')
						wh.fisSilindiEkle()
						wh.add(`fis.ba = 'B'`, `fis.fistipi = 'KC'`)
					})
					.hvDuzenleIslemi(({ hv }) => {
						$.extend(hv, {
							kayittipi: `'KS'`, isladi: `'Cari Tahsilat'`,
							must: 'har.must', bedel: 'SUM(har.bedel)',
							refkod: 'fis.kasakod', refadi: 'kas.aciklama'
						})
					})
			],
			krediKarti: [
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => {
						sent.fisHareket('posfis', 'posilkhar')
							.har2CariBagla({ mustSaha: 'must' })
							.fromIliski('banbizhesap bhes', 'har.banhesapkod = bhes.kod')
						wh.fisSilindiEkle()
						wh.add(
							new MQOrClause([
								new MQAndClause([`fis.fistipi = 'AL'`, `fis.almsat = 'A'`]),
								`fis.fistipi = 'MS'`
							])
						)
					})
					.hvDuzenleIslemi(({ hv, sqlZero }) => {
						$.extend(hv, {
							kayittipi: `'BH'`, isladi: `'Kredi Kartı ile Ödeme'`,
							must: 'har.must', bedel: 'SUM(har.bedel)',
							refkod: 'har.banhesapkod', refadi: 'bhes.aciklama'
						})
					})
			],
			fatura: [
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => {
						sent.fromAdd('piffis fis')
							.fromIliski('piftaksit ptak', 'fis.kaysayac = ptak.fissayac')
							.fromIliski('tahsilsekli tsek', 'ptak.taktahsilsekli = tsek.kodno')
							.fis2CariBagla({ mustSaha: 'must' })
							.leftJoin('tsek', 'kasmst kas', ['tsek.kasakod = kas.kod', `tsek.tahsiltipi = 'NK'`])
							.leftJoin('tsek', 'poskosul pkos', ['tsek.poskosulkod = pkos.kod', `tsek.tahsiltipi = 'PS'`])
							.leftJoin('tsek', 'banbizhesap bhes', [
								`(case when tsek.tahsiltipi = 'PS' then pkos.mevduathesapkod else tsek.mevduathesapkod end) = bhes.kod`,
								`tsek.tahsiltipi IN ('PS', 'HV', 'HG')`
							])
						wh.fisSilindiEkle()
						wh.inDizi(['F', 'P'], 'fis.piftipi')                                              // iade olan DAHIL
						wh.add(`fis.ayrimtipi <> 'IN'`)
						wh.inDizi(['NK', 'KR', 'HG'], 'tsek.tahsiltipi')
					})
					.hvDuzenleIslemi(({ hv }) => {
						$.extend(hv, {
							kayittipi: `(case when tsek.tahsiltipi = 'NK' then 'KS' when tsek.tahsiltipi in ('PS', 'HV', 'HG') then 'BH' else tsek.tahsiltipi end)`,
							isladi: `'Fatura ile Ödeme'`,
							tahseklino: 'ptak.taktahsilsekli', must: 'fis.must',
							bedel: `SUM(ptak.bedel * (case when ptak.btersmi > 0 then -1 else 1 end))`,
							refkod: `(case when tsek.tahsiltipi = 'NK' then tsek.kasakod when tsek.tahsiltipi in ('PS', 'HV', 'HG') then bhes.kod else tsek.tahsiltipi end)`,
							refadi: `(case when tsek.tahsiltipi = 'NK' then kas.aciklama when tsek.tahsiltipi in ('PS', 'HV', 'HG') then bhes.aciklama else tsek.tahsiltipi end)`
						})
					})
			],
			cekSenet: [
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => {
						sent.fromAdd('csfis fis')
							.fromIliski('csportfoy prt', 'fis.portfkod = prt.kod')
							.fis2CariBagla({ mustSaha: 'fisciranta' })
							.fis2BankaHesapBagla()
						wh.fisSilindiEkle()
						wh.inDizi(['BC', 'BS'], 'fis.fistipi')
					})
					.hvDuzenleIslemi(({ hv }) => {
						$.extend(hv, {
							kayittipi: `(case when fis.belgetipi = 'BC' then 'BH' else 'CS' end)`,
							isladi: `(case when fis.belgetipi = 'BC' then 'Çek ile Ödeme' else 'Senet ile Ödeme' end)`,
							must: 'fis.fisciranta',
							bedel: `SUM(fis.toplambedel * (case when fis.iade = 'I' then -1 else 1 end))`,
							refkod: `(case when fis.belgetipi = 'BC' then fis.banhesapkod else fis.portfkod end)`,
							refadi: `(case when fis.belgetipi = 'BC' then bhes.aciklama else prt.aciklama end)`
						})
					})
			],
		})
        return this
    }
	static maliTablo_secimlerYapiDuzenle({ result }) {
		super.maliTablo_secimlerYapiDuzenle(...arguments)
		$.extend(result, { mst: DMQTahsilSekli, cari: DMQCari })
	}
	static maliTablo_secimlerSentDuzenle({ detSecimler: sec, sent, sent: { from }, where: wh, hv, mstClause, maliTablo }) {
		super.maliTablo_secimlerSentDuzenle(...arguments)
		mstClause ||= hv.tahseklino || 'har.tahseklino'
		if (sec) {
			wh.basiSonu(sec.tahseklino, mstClause)
			wh.basiSonu(sec.mustKod, hv.must).ozellik(sec.mustAdi, 'car.birunvan')
		}
	}
}

