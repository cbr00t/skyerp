class AlimSatisSipOrtakHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return this == AlimSatisSipOrtakHareketci } static get ticarimi() { return true }
	static get kod() { return null } static get aciklama() { return 'Ticari' }
	static get kisaKod() { return null } static get almSat() { return null }
	/*static get uygunmu() { return !!config.dev }*/
	static get maliTabloIcinUygunmu() { return true } static get donemselIslemlerIcinUygunmu() { return false }
	static get eldekiVarliklarIcinUygunmu() { return this.donemselIslemlerIcinUygunmu }

	static getAltTipAdiVeOncelikClause({ hv }) {
		return super.getAltTipAdiVeOncelikClause(...arguments)
		/*return {
			adi: `(case ctip.satmustip when 'S' then 'Satıcılar' else 'Müşteriler' end)`,
			oncelik: `(case ctip.satmustip when 'S' then 1 else 0 end)`,
			yon: `(case ctip.satmustip when 'S' then 'sag' else 'sol' end)`
		}*/
	}
	ilkIslemler(e = {}) {
		super.ilkIslemler(e)
	}
	sonIslemler({ stm, attrSet: raporAttrSet } = {}) {
		super.sonIslemler(...arguments)
	}
    /* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(arguments)
		let { dRapor: { trfVeAlimSipBirlesik } = {} } = app.params
		kaListe.push(...[
			new CKodVeAdi(['stok', 'Stok']),
			new CKodVeAdi(['hizmet', 'Hizmet']),
			( trfVeAlimSipBirlesik ? new CKodVeAdi(['trfSip', 'Trf. Sipariş']) : null )
		].filter(Boolean))
    }
    /** Varsayılan değer atamaları (host vars) – temel sınıfa eklemeler.
		Hareketci.varsayilanHVDuzenle değerleri aynen alınır, sadece eksikler eklenir */
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
        super.varsayilanHVDuzenle(...arguments)
		for (let key of ['fisaciklama', 'detaciklama'])
			hv[key] = sqlEmpty
		// for (let key of ['dvbedel']) { hv[key] = sqlZero }
		$.extend(hv, {
			aciklama: ({ hv }) => {
                let withCoalesce = clause => (clause?.sqlDoluDegermi ?? false) ? `COALESCE(${clause}, '')` : sqlEmpty
                let {fisaciklama: fisAciklama, detaciklama: detAciklama} = hv
                return fisAciklama && detAciklama
                    ? `${withCoalesce(fisAciklama)} + ' ' + ${withCoalesce(detAciklama)}` 
                    : withCoalesce(detAciklama || fisAciklama || sqlEmpty)
            }
		})
    }
	uniDuzenleOncesi({ stokmu, hizmetmi } = {}) {
		super.uniDuzenleOncesi(...arguments)
		this.ekUygunluk = (stokmu || hizmetmi)
			? { stokmu, hizmetmi }
			: undefined
	}
	uniOrtakSonIslem({ sender, hv, sent, sent: { from, where: wh }, secimler, det = {}, detSecimler = {}, donemTipi, sqlNull, sqlEmpty, sqlZero }) {
		super.uniOrtakSonIslem(...arguments)
		/*if (!from.aliasIcinTable('sub')) { sent.fis2SubeBagla() }
		if (!from.aliasIcinTable('igrp')) { sent.sube2GrupBagla() }*/
		// ... diğerleri stok/hizmet durumuna göre 'uniDuzenle_stokHizmet()' kısmında bağlanıyor
		if (!from.aliasIcinTable('car'))
			sent.x2CariBagla({ kodClause: hv?.refkod ?? 'fis.must' })
		if (!from.aliasIcinTable('isl'))
			sent.fis2StokIslemBagla()
	}
    /** UNION sorgusu hazırlama – hareket tipleri için */
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
		let { dRapor: { trfVeAlimSipBirlesik } = {} } = app.params
        super.uygunluk2UnionBilgiListeDuzenleDevam(e)
        this.uniDuzenle_stokHizmet(e)
		if (trfVeAlimSipBirlesik)
			this.uniDuzenle_trfSip(e)
    }
    /** (Ticari Stok/Hizmet) için UNION */
    uniDuzenle_stokHizmet(e) {
		let { uygunluk, liste } = e
		let { dRapor: { ihracatIntacdanmi } = {} } = app.params
		let { maliTablo = {}, class: { almSat } } = this
		let { det = {} } = maliTablo, { shStokHizmet, shAyrimTipi } = det ?? {}
		shStokHizmet ??= {}; shAyrimTipi ??= {}
		let { ihracatmi } = shAyrimTipi
		// let ekUygunluk = this.ekUygunluk ?? {
		let ekUygunluk = {
			stokmu: e.stokmu ?? (shStokHizmet?.stokmu || shStokHizmet?.birliktemi) ?? true,
			hizmetmi: e.hizmetmi ?? (shStokHizmet?.hizmetmi || shStokHizmet?.birliktemi) ?? true
		}
		/* let veriTipi_kaListe = veriTipi?.kaListe?.filter(({ ekBilgi: _ }) =>
			_.sentUygunluk?.call(this, { ...e, maliTablo, det, hesapTipi, veriTipi })) */
		let getUniBilgi = hizmetmi => {
			let stokmu = !hizmetmi
			if (uygunluk) {
				if (stokmu && !uygunluk.stok)
					return false
				if (hizmetmi && !uygunluk.hizmet)
					return false
			}
			if (ekUygunluk) {
				if (stokmu && !ekUygunluk.stokmu)
					return null
				else if (hizmetmi && !ekUygunluk.hizmetmi)
					return null
			}
			let mstAlias = hizmetmi ? 'hiz' : 'stk'
			return new Hareketci_UniBilgi()
				.sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => {
					let harTable = hizmetmi ? 'siphizmet' : 'sipstok'
					sent.fisHareket('sipfis', harTable)
					wh.fisSilindiEkle()
					wh.add(`fis.ozeltip = ''`)
					wh.notInDizi(['ON', 'OG', 'RD'], 'fis.onaytipi')
					if (almSat)
						wh.degerAta(almSat, 'fis.almsat')
					let ayrimYapi = {
						in: {},
						notIn: { [ihracatIntacdanmi ? 'IH' : 'IN']: true }
					}
					if (shAyrimTipi?.secilen && !shAyrimTipi.birliktemi) {
						if (ihracatmi) {
							let inEk = ihracatIntacdanmi ? 'IN' : 'IH'
							for (let key of [inEk, 'MI'])
								ayrimYapi.in[key] = true
						}
						else {
							for (let key of ['IN', 'MI', 'IH'])
								ayrimYapi.notIn[key] = true
						}
						ayrimYapi.notIn[ihracatIntacdanmi ? 'IH': 'IN'] = true
						let addAyrimTipiKosul = key => {
							let set = ayrimYapi[key]
							if (!empty(set))
								wh[`${key}Dizi`](keys(set), 'fis.ayrimtipi')
						};
						addAyrimTipiKosul('in')
						addAyrimTipiKosul('notIn')
					}
					sent[`har2${hizmetmi ? 'Hizmet' : 'Stok'}Bagla`]()
					sent[`${hizmetmi ? 'hizmet' : 'stok'}2GrupBagla`]()
					sent[`${hizmetmi ? 'hizmet' : 'stok'}2IstGrupBagla`]()
				})
				.hvDuzenleIslemi(({ hv, sqlEmpty, sqlZero }) => {
					extend(hv, {
						oncelik: '1', ba: `'B'`, fissayac: 'fis.kaysayac', kaysayac: 'har.kaysayac',
						kayittipi: `'AS'`, anaislemadi: hizmetmi ? `'Hizmet'` : `'Stok'`,
						islemadi: (almSat == 'A' ? `'Alım'` : `'Satış'`),
						bizsubekod: 'fis.bizsubekod',
						ozelisaret: 'fis.ozelisaret', tarih: 'fis.tarih', fisnox: 'fis.fisnox',
						refkod: 'fis.must', refadi: 'car.birunvan', dvkod: 'fis.dvkod', dvkur: 'fis.dvkur',
						fisaciklama: 'fis.aciklama', detaciklama: 'har.aciklama',
						brm: `${mstAlias}.brm`, brm2: (hizmetmi ? sqlEmpty : `${mstAlias}.brm2`),
						brmorani: (hizmetmi ? sqlZero : 'har.brmorani'),
						miktar: 'har.miktar', miktar2: (hizmetmi ? sqlZero : 'har.miktar2'),
						brutbedel: 'har.brutbedel', bedel: 'har.bedel', dvbedel: 'har.dvbedel',
						satiriskonto: 'har.satiriskonto', dipiskonto: 'har.dipiskonto',
						harciro: 'har.harciro', topkdv: 'har.tumkdv',
						fmalhammadde: hizmetmi ? sqlZero : 'har.fmalhammadde',
						fmalmuh: hizmetmi ? sqlZero : 'har.fmalmuh',
						shTipi: `'${hizmetmi ? 'H' : 'S'}'`,
						shkod: `har.${hizmetmi ? 'hizmetkod' : 'stokkod'}`, shadi: `${mstAlias}.aciklama`,
						grupkod: `${mstAlias}.grupkod`, istgrupkod: `${mstAlias}.${hizmetmi ? 'h' : 's'}istgrupkod`,
						takipno: `(case when fis.takiportakdir = '' then har.dettakipno else fis.orttakipno end)`
					})
				})
		}
		extend(liste, {
			stok$hizmet: [
				getUniBilgi(false),         // stok
				getUniBilgi(true)           // hizmet
			].filter(Boolean)
		})
        return this
    }
	uniDuzenle_trfSip(e) {
		let { uygunluk, liste } = e
		let { maliTablo = {}, class: { almSat } } = this
		let { det = {} } = maliTablo, { shStokHizmet, shAyrimTipi } = det ?? {}
		shStokHizmet ??= {}; shAyrimTipi ??= {}
		let { ihracatmi } = shAyrimTipi
		let ekUygunluk = {
			stokmu: e.stokmu ?? (shStokHizmet?.stokmu || shStokHizmet?.birliktemi) ?? true,
			hizmetmi: e.hizmetmi ?? (shStokHizmet?.hizmetmi || shStokHizmet?.birliktemi) ?? true
		}
		
		// if (almSat != 'T' || ihracatmi || !ekUygunluk.stokmu)
		if (ihracatmi || !ekUygunluk.stokmu)
			return
		
		extend(liste, {
			trfSip: [
				new Hareketci_UniBilgi()
					.sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => {
						sent
							.fisHareket('stfis', 'ststok')
							.har2StokBagla()
							.stok2GrupBagla()
							.stok2IstGrupBagla()
						wh.fisSilindiEkle()
						wh.add(`fis.ozeltip = 'IR'`, `fis.gctipi = 'S'`)
						wh.notInDizi(['ON', 'OG', 'RD'], 'fis.onaytipi')
					})
					.hvDuzenleIslemi(({ hv, sqlEmpty, sqlZero }) => {
						extend(hv, {
							oncelik: '2', ba: `'B'`, fissayac: 'fis.kaysayac', kaysayac: 'har.kaysayac',
							kayittipi: `'TS'`, anaislemadi: `'Stok'`,
							islemadi: `'Transfer Sipariş'`, bizsubekod: 'fis.bizsubekod',
							ozelisaret: 'fis.ozelisaret', tarih: 'fis.tarih', fisnox: 'fis.fisnox',
							refkod: 'fis.irsmust', refadi: 'car.birunvan', dvkod: 'fis.dvkod', dvkur: 'fis.dvkur',
							fisaciklama: 'fis.aciklama', detaciklama: 'har.aciklama',
							brm: 'stk.brm', brm2: 'stk.brm2', brmorani: 'har.brmorani',
							miktar: 'har.miktar', miktar2: 'har.miktar2',
							brutbedel: 'har.brutbedel', bedel: 'har.bedel', dvbedel: 'har.dvbedel',
							satiriskonto: sqlZero, dipiskonto: sqlZero, harciro: 'har.bedel', topkdv: sqlZero,
							fmalhammadde: 'har.fmalhammadde', fmalmuh: 'har.fmalmuh',
							shTipi: `'S'`, shkod: 'har.stokkod', shadi: 'stk.aciklama',
							grupkod: 'stk.grupkod', istgrupkod: 'stk.sistgrupkod',
							takipno: `(case when fis.takiportakdir = '' then har.dettakipno else fis.orttakipno end)`
						})
					})
			]
		})
	}
	static maliTablo_secimlerYapiDuzenle({ tip2SecimMFYapi, result }) {
		super.maliTablo_secimlerYapiDuzenle(...arguments)
		for (let cls of [StokHareketci, HizmetHareketci]) {
			let {kisaKod: tip} = cls
			let e = { ...arguments[0], result: [] }
			cls.maliTablo_secimlerYapiDuzenle(e)
			tip2SecimMFYapi[tip] = e.result
		}
		/*extend(tip2SecimMFYapi, {
			S: { ...ortakSecimMFYapi, mst: DMQStok, grup: DMQStokGrup, anaGrup: DMQStokAnaGrup, istGrup: DMQStokIstGrup, tip: DMQStokTip, isl: DMQStokIslem },
			H: { ...ortakSecimMFYapi, mst: DMQHizmet, grup: DMQHizmetGrup, anaGrup: DMQHizmetAnaGrup, istGrup: DMQHizmetIstGrup, isl: DMQMuhIslem, muhHesap: DMQMuhHesap }
		})*/
	}
	static maliTablo_secimlerSentDuzenle({ detSecimler: sec, sent, sent: { from }, where: wh, hv, mstClause, maliTablo }) {
		super.maliTablo_secimlerSentDuzenle(...arguments)
		let { shStokHizmet = {} } = maliTablo?.det ?? {}
		let { stokmu, hizmetmi }  = shStokHizmet ?? {}
		let mstAlias = hizmetmi ? 'hiz' : 'stk', prefix = hizmetmi ? 'h' : 's'
		let grpClause = hv.grupkod || `${mstAlias}.grupkod`, aGrpClause = hv.anaGrupkod || 'grp.anagrupkod'
		let iGrpClause = hv.istgrupkod || `${mstAlias}.${prefix}istgrupkod`, iGrpAlias = `${prefix}igrp`
		mstClause ||= hv.shkod || `har.${hizmetmi ? 'hizmet' : 'stok'}kod`
		let tipClause = hv.tipkod || `${mstAlias}.tipi`, islClause = hv.islkod || hv.islemkod || 'fis.islkod'
		let muhHesapClause = hv.muhhesapkod || `${mstAlias}.muhhesap`
		if (sec && shStokHizmet.secilen && !shStokHizmet.birliktemi) {
			let harStokmu = from.aliasIcinTable('har')?.deger == 'sipstok'
			let harHizmetmi = from.aliasIcinTable('har')?.deger == 'siphizmet'
			if (!(stokmu == harStokmu && hizmetmi == harHizmetmi)) {
				wh.add('1 = 2')
				return
			}
			wh.basiSonu(sec.mstKod, mstClause).ozellik(sec.mstAdi, `${mstAlias}.aciklama`)
			wh.basiSonu(sec.grupKod, grpClause).ozellik(sec.grupAdi, 'grp.aciklama')
			wh.basiSonu(sec.anaGrupKod, aGrpClause).ozellik(sec.anaGrupAdi, 'agrp.aciklama')
			wh.basiSonu(sec.istGrupKod, iGrpClause).ozellik(sec.istGrupAdi, `${iGrpAlias}.aciklama`)
			if (harStokmu)
				wh.basiSonu(sec.tipKod, tipClause).ozellik(sec.tipAdi, 'tip.aciklama')
			wh.basiSonu(sec.islKod, islClause).ozellik(sec.islAdi, 'isl.aciklama')
			if (harHizmetmi)
				wh.basiSonu(sec.muhHesapKod, muhHesapClause).ozellik(sec.muhHesapAdi, 'mhes.aciklama')
		}
	}
}

class AlimSipHareketci extends AlimSatisSipOrtakHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 96 }
	static get kod() { return 'almSip' } static get aciklama() { return 'Alım Sip.' }
	static get kisaKod() { return 'XA' } static get almSat() { return 'A' } 
}
class SatisSipHareketci extends AlimSatisSipOrtakHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 97 }
	static get kod() { return 'satSip' } static get aciklama() { return 'Satış Sip.' }
	static get kisaKod() { return 'XT' } static get almSat() { return 'T' }
}
