class TahsilatHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kisaKod() { return 'TH' }
	static get kod() { return 'tahsilat' } static get aciklama() { return 'Tahsilat' }
	static get uygunmu() { return true }  static get oncelik() { return 90 }
	static get maliTabloIcinUygunmu() { return true } static get donemselIslemlerIcinUygunmu() { return true }
	static get eldekiVarliklarIcinUygunmu() { return this.donemselIslemlerIcinUygunmu }
	static getAltTipAdiVeOncelikClause({ hv }) {
		return {
			...super.getAltTipAdiVeOncelikClause(...arguments),
			yon: `'sol'`
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
        super.hareketTipSecim_kaListeDuzenle(arguments)
		kaListe.push(
			new CKodVeAdi(['cari', 'Cari']),
			new CKodVeAdi(['kasa', 'Kasa']),
			new CKodVeAdi(['pos', 'POS']),
			new CKodVeAdi(['fatura', 'Fatura'])
		)
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
			anaislemadi: `'Tahsilat'`,
			ba: `'B'`, tahseklino: sqlZero,
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
							.fis2CariBagla({ mustSaha: 'mustkod' })
							.x2KasaBagla({ kodClause: 'har.tahkasakod' })
							.fromIliski('banbizhesap bhes', 'har.tahposhesapkod = bhes.kod')
							.fromIliski('carmst ycar', 'har.tahyemekcarikod = ycar.must')
						wh.fisSilindiEkle()
						wh.add(`fis.ba = 'A'`)
						wh.inDizi(['NK', 'PS', 'HV', 'HG', 'YM'], 'tsek.tahsiltipi')
					})
					.hvDuzenleIslemi(({ hv }) => {
						$.extend(hv, {
							kayittipi: `(case when tsek.tahsiltipi = 'NK' then 'KS' when tsek.tahsiltipi in ('PS', 'HV', 'HG') then 'BH' when tsek.tahsiltipi = 'YM' then 'CR' else tsek.tahsiltipi end)`,
							isladi: `'Cari Tahsilat'`, tahseklino: 'har.tahseklino',
							must: 'fis.mustkod', bedel: 'SUM(har.bedel)',
							refkod: `(case when tsek.tahsiltipi = 'NK' then har.tahkasakod when tsek.tahsiltipi in ('PS', 'HV', 'HG') then har.tahposhesapkod
											when tsek.tahsiltipi = 'YM' then har.tahyemekcarikod end)`,
							refadi: `(case when tsek.tahsiltipi = 'NK' then kas.aciklama when tsek.tahsiltipi in ('PS', 'HV', 'HG') then bhes.aciklama
											when tsek.tahsiltipi = 'YM' then ycar.birunvan end)`
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
						wh.add(`fis.ba = 'A'`, `fis.fistipi = 'KC'`)
					})
					.hvDuzenleIslemi(({ hv }) => {
						$.extend(hv, {
							kayittipi: `'KS'`, isladi: `'Kasa Tahsilat'`,
							must: 'har.must', bedel: 'SUM(har.bedel)',
							refkod: 'fis.kasakod', refadi: 'kas.aciklama'
						})
					})
			],
			pos: [
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => {
						sent.fisHareket('posfis', 'posilkhar')
							.har2CariBagla({ mustSaha: 'must' })
							.fromIliski('banbizhesap bhes', 'har.banhesapkod = bhes.kod')
						wh.fisSilindiEkle()
						wh.add(`fis.fistipi = 'AL'`, `fis.almsat = 'T'`)
					})
					.hvDuzenleIslemi(({ hv, sqlZero }) => {
						$.extend(hv, {
							kayittipi: `'BH'`, isladi: `'POS Tahsilat'`,
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
							.fis2CariBagla({ mustSaha: 'must' })
							.fromIliski('tahsilsekli tsek', 'ptak.taktahsilsekli = tsek.kodno')
							.leftJoin('tsek', 'kasmst kas', ['tsek.kasakod = kas.kod', `tsek.tahsiltipi = 'NK'`])
							.leftJoin('tsek', 'poskosul pkos', ['tsek.poskosulkod = pkos.kod', `tsek.tahsiltipi = 'PS'`])
							.leftJoin('tsek', 'banbizhesap bhes', [
								`(case when tsek.tahsiltipi = 'PS' then pkos.mevduathesapkod else tsek.mevduathesapkod end) = bhes.kod`,
								`tsek.tahsiltipi IN ('PS', 'HV', 'HG')`
							])
						wh.fisSilindiEkle()
						wh.add(`fis.piftipi = 'F'`)                                              // iade olan DAHIL
						wh.inDizi(['NK', 'PS', 'HV', 'HG'], 'tsek.tahsiltipi')
					})
					.hvDuzenleIslemi(({ hv }) => {
						$.extend(hv, {
							kayittipi: `(case when tsek.tahsiltipi = 'NK' then 'KS' when tsek.tahsiltipi in ('PS', 'HV', 'HG') then 'BH' else tsek.tahsiltipi end)`,
							isladi: `'Fatura Tahsilat'`,
							tahseklino: 'ptak.taktahsilsekli', must: 'fis.must',
							bedel: `SUM(ptak.bedel * (case when ptak.btersmi > 0 then -1 else 1 end))`,
							refkod: `(case when tsek.tahsiltipi = 'NK' then tsek.kasakod when tsek.tahsiltipi in ('PS', 'HV', 'HG') then bhes.kod else tsek.tahsiltipi end)`,
							refadi: `(case when tsek.tahsiltipi = 'NK' then kas.aciklama when tsek.tahsiltipi in ('PS', 'HV', 'HG') then bhes.aciklama else tsek.tahsiltipi end)`
						})
					})
			]
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

