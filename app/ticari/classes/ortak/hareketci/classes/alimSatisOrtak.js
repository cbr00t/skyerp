class AlimSatisOrtakHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get oncelik() { return 1 }
	static get araSeviyemi() { return this == AlimSatisOrtakHareketci } static get ticarimi() { return true }
	static get almSat() { return null } /*static get uygunmu() { return !!config.dev }*/
	static get kod() { return 'ticari' } static get aciklama() { return 'Ticari' }
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
        super.hareketTipSecim_kaListeDuzenle(arguments); kaListe.push(...[
			new CKodVeAdi(['stok', 'Stok']),
			new CKodVeAdi(['hizmet', 'Hizmet'])
		])
    }
    /** Varsayılan değer atamaları (host vars) – temel sınıfa eklemeler.
		Hareketci.varsayilanHVDuzenle değerleri aynen alınır, sadece eksikler eklenir */
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
       //  super.varsayilanHVDuzenle(...arguments);
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
	uniOrtakSonIslem({ sender, hv, sent, sent: { where: wh }, secimler, det = {}, detSecimler = {}, donemTipi, sqlNull, sqlEmpty, sqlZero }) {
		/*let {det: {veriTipi, shIade, shAyrimTipi} = {}} = this.maliTablo ?? {};
		if (shIade?.secilen) { wh.add(``) }*/
		super.uniOrtakSonIslem(...arguments)
	}
    /** UNION sorgusu hazırlama – hareket tipleri için */
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e);
        this.uniDuzenle_stokHizmet(e)
    }
    /** (Ticari Stok/Hizmet) için UNION */
    uniDuzenle_stokHizmet(e) {
		let {uygunluk, liste} = e, {maliTablo = {}, class: { almSat }} = this;
		let {dRapor: { ihracatIntacdanmi } = {}} = app.params;
		let {det, det: { hesapTipi, veriTipi, shStokHizmet = {}, shIade, shAyrimTipi, shAyrimTipi: { ihracatmi } = {} } = {}} = maliTablo;
		let hizmetmi = shStokHizmet?.hizmetmi ?? false, mstAlias = hizmetmi ? 'hiz' : 'stk';
		// let veriTipi_kaListe = veriTipi?.kaListe?.filter(({ ekBilgi: _ }) => _.sentUygunluk?.call(this, { ...e, maliTablo, det, hesapTipi, veriTipi }));
		let getUniBilgi = hizmetmi => {
			return new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent, sent: { where: wh, sahalar } }) => {
					let harTable = hizmetmi ? 'pifhizmet' : 'pifstok';
					sent.fisHareket('piffis', harTable);
					wh.fisSilindiEkle().add(`fis.piftipi = 'F'`);
					if (almSat) { wh.degerAta(almSat, 'fis.almsat') }
					if (shIade?.secilen && !shIade.birliktemi) { wh.degerAta(shIade.iademi ? 'I' : '', 'fis.iade') }
					let ayrimYapi = {
						in: { },
						notIn: { [ihracatIntacdanmi ? 'IH' : 'IN']: true }
					};
					if (shAyrimTipi?.secilen && !shAyrimTipi.birliktemi) {
						if (ihracatmi) {
							let inEk = ihracatIntacdanmi ? 'IN' : 'IH';
							for (let key of [inEk, 'MI']) { ayrimYapi.in[key] = true }
						}
						else { for (let key of ['IN', 'MI', 'IH']) { ayrimYapi.notIn[key] = true } }
						ayrimYapi.notIn[ihracatIntacdanmi ? 'IH': 'IN'] = true;
						let addAyrimTipiKosul = key => {
							let set = ayrimYapi[key]; if ($.isEmptyObject(set)) { return }
							let selector = `${key}Dizi`; wh[selector](Object.keys(set), 'fis.ayrimtipi')
						};
						addAyrimTipiKosul('in'); addAyrimTipiKosul('notIn')
					}
					sent[`har2${hizmetmi ? 'Hizmet' : 'Stok'}Bagla`]();
					sent[`${hizmetmi ? 'hizmet' : 'stok'}2GrupBagla`]();
					sent[`${hizmetmi ? 'hizmet' : 'stok'}2IstGrupBagla`]();
                }).hvDuzenleIslemi(({ hv }) => {
                    $.extend(hv, {
						oncelik: '1', ba: `'B'`, fissayac: 'fis.kaysayac', kaysayac: 'har.kaysayac', kayittipi: `'AS'`,
						islemadi: `'Alım/Satış'`, shTipi: `'${uygunluk.hizmet ? 'H' : 'S'}'`,
						bizsubekod: 'fis.bizsubekod', ozelisaret: 'fis.ozelisaret', tarih: 'fis.tarih', fisnox: 'fis.aknox',
						refkod: 'fis.must', refadi: 'car.birunvan', dvkod: 'fis.dvkod', dvkur: 'fis.dvkur',
						fisaciklama: 'fis.aciklama', detaciklama: 'har.aciklama', miktar: 'har.miktar',
						brutbedel: 'har.brutbedel', bedel: 'har.bedel', dvbedel: 'har.dvbedel',
						satiriskonto: 'har.satiriskonto', dipiskonto: 'har.dipiskonto',
						harciro: 'har.harciro', fmalhammadde: 'har.fmalhammadde', fmalmuh: 'har.fmalmuh', topkdv: 'har.tumkdv',
						shkod: `har.${hizmetmi} ? 'hizmetkod' : 'stokkod'`, shadi: `${mstAlias}.aciklama`,
						grupkod: `${mstAlias}.grupkod`, istgrupkod: `${mstAlias}.${hizmetmi ? 'h' : 's'}istgrupkod`
                    })
                })
		};
		$.extend(liste, { stok$hizmet: [getUniBilgi(false), getUniBilgi(true)] });
        return this
    }
	static maliTablo_secimlerYapiDuzenle({ result }) {
		super.maliTablo_secimlerYapiDuzenle(...arguments)
		// $.extend(result, { mst: DMQCari, grup: DMQCariTip, istGrup: DMQCariIstGrup, bolge: DMQCariBolge })
	}
	static maliTablo_secimlerSentDuzenle({ detSecimler: sec, sent, sent: { from }, where: wh, hv, mstClause, maliTablo }) {
		super.maliTablo_secimlerSentDuzenle(...arguments);
		let {det: { shStokHizmet = {} } = {}} = maliTablo ?? {}, {hizmetmi} = shStokHizmet;
		let mstAlias = hizmetmi ? 'hiz' : 'stk', prefix = hizmetmi ? 'h' : 's';
		let iGrpClause = hv.istgrupkod || `${mstAlias}.${prefix}istgrupkod`, iGrpAlias = `${prefix}igrp`;
		mstClause ||= hv.shkod || `har.${hizmetmi ? 'hizmet' : 'stok'}kod`;
		if (sec && shStokHizmet.secilen && !shStokHizmet.birliktemi) {
			let harHizmetmi = from.aliasIcinTable('har')?.deger == 'pifhizmet';
			if (hizmetmi != harHizmetmi) { wh.add('1 = 2'); return }
			wh.basiSonu(sec.mstKod, mstClause).ozellik(sec.mstAdi, `${mstAlias}.aciklama`);
			wh.basiSonu(sec.grupKod, `${mstAlias}.grupkod`).ozellik(sec.grupAdi, 'grp.aciklama');
			wh.basiSonu(sec.istGrupKod, `${iGrpClause}`).ozellik(sec.istGrupAdi, `${iGrpAlias}.aciklama`)
		}
	}
}

class AlimHareketci extends AlimSatisOrtakHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kisaKod() { return 'SA' } static get almSat() { return 'A' } static get aciklama() { return 'Alım' }
}
class SatisHareketci extends AlimSatisOrtakHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kisaKod() { return 'ST' } static get almSat() { return 'T' } static get aciklama() { return 'Satış' }
}
