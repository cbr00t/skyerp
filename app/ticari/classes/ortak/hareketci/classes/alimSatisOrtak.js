class AlimSatisOrtakHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return this == AlimSatisOrtakHareketci } static get ticarimi() { return true }
	static get kod() { return null }  static get aciklama() { return 'Ticari' }
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
    /* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(arguments)
		kaListe.push(...[
			new CKodVeAdi(['stok', 'Stok']),
			new CKodVeAdi(['hizmet', 'Hizmet'])
		])
    }
    /** Varsayılan değer atamaları (host vars) – temel sınıfa eklemeler.
		Hareketci.varsayilanHVDuzenle değerleri aynen alınır, sadece eksikler eklenir */
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
        super.varsayilanHVDuzenle(...arguments)
		for (let key of ['fisaciklama', 'detaciklama']) { hv[key] = sqlEmpty }
		// for (let key of ['dvbedel']) { hv[key] = sqlZero }
		$.extend(hv, {
			aciklama: ({ hv }) => {
                let withCoalesce = clause => (clause?.sqlDoluDegermi ?? false) ? `COALESCE(${clause}, '')` : sqlEmpty;
                let {fisaciklama: fisAciklama, detaciklama: detAciklama} = hv;
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
		if (!from.aliasIcinTable('car')) { sent.fis2CariBagla() }
		if (!from.aliasIcinTable('isl')) { sent.fis2StokIslemBagla() }
	}
    /** UNION sorgusu hazırlama – hareket tipleri için */
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e);
        this.uniDuzenle_stokHizmet(e)
    }
    /** (Ticari Stok/Hizmet) için UNION */
    uniDuzenle_stokHizmet(e) {
		let {uygunluk, liste} = e, {maliTablo = {}, class: { almSat }} = this
		let {dRapor: { ihracatIntacdanmi } = {}} = app.params
		let {det, det: { hesapTipi, veriTipi, shStokHizmet = {}, shIade, shAyrimTipi, shAyrimTipi: { ihracatmi } = {} } = {}} = maliTablo
		let ekUygunluk = this.ekUygunluk ?? {
			stokmu: e.stokmu ?? (shStokHizmet?.stokmu || shStokHizmet?.birliktemi) ?? true,
			hizmetmi: e.hizmetmi ?? (shStokHizmet?.hizmetmi || shStokHizmet?.birliktemi) ?? true
		}
		// let veriTipi_kaListe = veriTipi?.kaListe?.filter(({ ekBilgi: _ }) => _.sentUygunluk?.call(this, { ...e, maliTablo, det, hesapTipi, veriTipi }));
		let getUniBilgi = hizmetmi => {
			let stokmu = !hizmetmi
			if (ekUygunluk) {
				if (stokmu && !ekUygunluk.stokmu)
					return null
				else if (hizmetmi && !ekUygunluk.hizmetmi)
					return null
			}
			let mstAlias = hizmetmi ? 'hiz' : 'stk'
			return new Hareketci_UniBilgi()
				.sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => {
					let harTable = hizmetmi ? 'pifhizmet' : 'pifstok'
					sent.fisHareket('piffis', harTable)
					wh.fisSilindiEkle().add(`fis.piftipi = 'F'`)
					if (almSat)
						wh.degerAta(almSat, 'fis.almsat')
					if (shIade?.secilen && !shIade.birliktemi)
						wh.degerAta(shIade.iademi ? 'I' : '', 'fis.iade')
					let ayrimYapi = {
						in: {},
						notIn: { [ihracatIntacdanmi ? 'IH' : 'IN']: true }
					};
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
							if (empty(set))
								return
							let selector = `${key}Dizi`
							wh[selector](keys(set), 'fis.ayrimtipi')
						};
						addAyrimTipiKosul('in')
						addAyrimTipiKosul('notIn')
					}
					sent[`har2${hizmetmi ? 'Hizmet' : 'Stok'}Bagla`]()
					sent[`${hizmetmi ? 'hizmet' : 'stok'}2GrupBagla`]()
					sent[`${hizmetmi ? 'hizmet' : 'stok'}2IstGrupBagla`]()
				}).hvDuzenleIslemi(({ hv, sqlZero }) => {
					$.extend(hv, {
						oncelik: '1', ba: `'B'`, fissayac: 'fis.kaysayac', kaysayac: 'har.kaysayac',
						kayittipi: `'AS'`, anaislemadi: hizmetmi ? `'Hizmet'` : `'Stok'`,
						islemadi: `'Alım/Satış'`, bizsubekod: 'fis.bizsubekod',
						ozelisaret: 'fis.ozelisaret', tarih: 'fis.tarih', fisnox: 'fis.fisnox',
						refkod: 'fis.must', refadi: 'car.birunvan', dvkod: 'fis.dvkod', dvkur: 'fis.dvkur',
						fisaciklama: 'fis.aciklama', detaciklama: 'har.aciklama', miktar: 'har.miktar',
						brutbedel: 'har.brutbedel', bedel: 'har.bedel', dvbedel: 'har.dvbedel',
						satiriskonto: 'har.satiriskonto', dipiskonto: 'har.dipiskonto',
						harciro: 'har.harciro', topkdv: 'har.tumkdv',
						fmalhammadde: hizmetmi ? sqlZero : 'har.fmalhammadde',
						fmalmuh: hizmetmi ? sqlZero : 'har.fmalmuh',
						shTipi: `'${hizmetmi ? 'H' : 'S'}'`,
						shkod: `har.${hizmetmi} ? 'hizmetkod' : 'stokkod'`, shadi: `${mstAlias}.aciklama`,
						grupkod: `${mstAlias}.grupkod`, istgrupkod: `${mstAlias}.${hizmetmi ? 'h' : 's'}istgrupkod`,
						takipno: `(case when fis.takiportakdir = '' then har.dettakipno else fis.orttakipno end)`
					})
				})
		}
		$.extend(liste, {
			stok$hizmet: [
				getUniBilgi(false),         // stok
				getUniBilgi(true)           // hizmet
			].filter(x => !!x)
		})
        return this
    }
	static maliTablo_secimlerYapiDuzenle({ tip2SecimMFYapi, result }) {
		super.maliTablo_secimlerYapiDuzenle(...arguments)
		for (let cls of [StokHareketci, HizmetHareketci]) {
			let {kisaKod: tip} = cls
			let e = { ...arguments[0], result: [] }
			cls.maliTablo_secimlerYapiDuzenle(e)
			tip2SecimMFYapi[tip] = e.result
		}
		/*$.extend(tip2SecimMFYapi, {
			S: { ...ortakSecimMFYapi, mst: DMQStok, grup: DMQStokGrup, anaGrup: DMQStokAnaGrup, istGrup: DMQStokIstGrup, tip: DMQStokTip, isl: DMQStokIslem },
			H: { ...ortakSecimMFYapi, mst: DMQHizmet, grup: DMQHizmetGrup, anaGrup: DMQHizmetAnaGrup, istGrup: DMQHizmetIstGrup, isl: DMQMuhIslem, muhHesap: DMQMuhHesap }
		})*/
	}
	static maliTablo_secimlerSentDuzenle({ detSecimler: sec, sent, sent: { from }, where: wh, hv, mstClause, maliTablo }) {
		super.maliTablo_secimlerSentDuzenle(...arguments)
		let {det: { shStokHizmet = {} } = {}} = maliTablo ?? {}, {stokmu, hizmetmi} = shStokHizmet
		let mstAlias = hizmetmi ? 'hiz' : 'stk', prefix = hizmetmi ? 'h' : 's'
		let grpClause = hv.grupkod || `${mstAlias}.grupkod`, aGrpClause = hv.anaGrupkod || 'grp.anagrupkod'
		let iGrpClause = hv.istgrupkod || `${mstAlias}.${prefix}istgrupkod`, iGrpAlias = `${prefix}igrp`
		mstClause ||= hv.shkod || `har.${hizmetmi ? 'hizmet' : 'stok'}kod`
		let tipClause = hv.tipkod || `${mstAlias}.tipi`, islClause = hv.islkod || hv.islemkod || 'fis.islkod'
		let muhHesapClause = hv.muhhesapkod || `${mstAlias}.muhhesap`
		if (sec && shStokHizmet.secilen && !shStokHizmet.birliktemi) {
			let harStokmu = from.aliasIcinTable('har')?.deger == 'pifstok'
			let harHizmetmi = from.aliasIcinTable('har')?.deger == 'pifhizmet'
			if (!(stokmu == harStokmu && hizmetmi == harHizmetmi)) { wh.add('1 = 2'); return }
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

class AlimHareketci extends AlimSatisOrtakHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 93 }
	static get kod() { return 'alim' } static get aciklama() { return 'Alım' }
	static get kisaKod() { return 'SA' } static get almSat() { return 'A' } 
}
class SatisHareketci extends AlimSatisOrtakHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 94 }
	static get kod() { return 'satis' } static get aciklama() { return 'Satış' }
	static get kisaKod() { return 'ST' } static get almSat() { return 'T' }
}
