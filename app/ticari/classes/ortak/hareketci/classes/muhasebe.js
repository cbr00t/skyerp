class MuhasebeHareketci extends Hareketci {
	static{ window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 97 } static get kisaKod() { return 'MG' }
	static get kod() { return 'muhasebe' } static get aciklama() { return 'Muhasebe' }
	static get vioAdim() { return 'MH-R' }
	static get uygunmu() { return app.params?.ticariGenel?.kullanim?.muhasebe }
	static get maliTabloIcinUygunmu() { return true }
	static get donemselIslemlerIcinUygunmu() { return false }
	static get eldekiVarliklarIcinUygunmu() { return true }

	static getAltTipAdiVeOncelikClause({hv}) {
		return {
			...super.getAltTipAdiVeOncelikClause(...arguments)
			// yon: `'sol'`
		}
	}
	static mstYapiDuzenle({result}) {
		super.mstYapiDuzenle(...arguments)
		let defHVAlias = 'hesapkod'
		result.set(defHVAlias, ({ mstYapi, sent: { sahalar }, kodClause, mstAlias, mstAdiAlias }) =>
			sahalar.add(`mhes.aciklama ${mstAdiAlias}`))
	}

	// Hareket tiplerini (işlem türlerini) belirleyen seçim listesi
	static hareketTipSecim_kaListeDuzenle({ kaListe }) {
		super.hareketTipSecim_kaListeDuzenle(arguments)
		kaListe.push(new CKodVeAdi(['muhasebe', 'Muhasebe']))
	}
	static async ilkIslemler(e) {
		await super.ilkIslemler(e)
	}
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		let { muhasebe: muhParam = {} } = app.params
		let { yil: buYil } = today()
		let maliYil = muhParam.maliYil || buYil
		;{
			let { donem, tarihAralik } = sec
			if (!maliYil || maliYil == buYil)
				donem.tekSecim.buYil()
			else {
				donem.tekSecim.tarihAralik()
				extend(tarihAralik, {
					basi: asDate(`01.01.${maliYil}`),
					sonu: asDate(`31.12.${maliYil}`)
				})
			}
		}
	}
	uniDuzenleOncesi({ sender: { finansalAnalizmi, eldekiVarliklarmi } = {}, stm, uni }) {
		super.uniDuzenleOncesi(...arguments)
	}
	stmIcinSonIslemler({ sender: { finansalAnalizmi, eldekiVarliklarmi } = {}, stm, uni }) {
		super.stmIcinSonIslemler(...arguments)
	}
	uniOrtakSonIslem({ sender: { finansalAnalizmi, eldekiVarliklarmi } = {}, hvDegeri, sent }) {
		let { from, where: wh, sahalar } = sent
		super.uniOrtakSonIslem(...arguments)
		let kodClause = hvDegeri('hesapkod') || 'har.hesapkod'
		sent
			.fisHareket('muhfis', 'muhhar', true)
			.innerJoin('har', 'muhhesap mhes', `${kodClause} = mhes.kod`)
			.innerJoin('mhes', 'muhhesap grp', 'mhes.grupkod = grp.kod')
			.leftJoin('mhes', 'muhhesap uhes', 'mhes.usthesapkod = uhes.kod')
			.innerJoin('har', 'muhhesap khes', `SUBSTRING(${kodClause}, 1, 3) = khes.kod`)
			.innerJoin('har', 'muhhesap shes', `SUBSTRING(${kodClause}, 1, 2) = shes.kod`)
			.innerJoin('har', 'muhhesap ches', `SUBSTRING(${kodClause}, 1, 1) = ches.kod`)

		wh
			.fisSilindiEkle()
			.add(`fis.ozelisaret <> 'X'`)
	}
	static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
		super.varsayilanHVDuzenle(...arguments)
		let kodClause = 'har.hesapkod'
		extend(hv, {
			kayittipi: `'MH'`, shTipi: `'M'`,
			anaislemadi: `'Muhasebe'`,
			isladi: ({ hvDegeri: v }) => v('anaislemadi'),
			hesapkod: kodClause,
			shkod: ({ hvDegeri: v }) => v('hesapkod'),
			ba: 'har.ba', bedel: 'har.bedel',
			fisnox: 'fis.basnox'
		})
		;['ust', 'kebir', 'sinif', 'cerceve'].forEach(p => {
			let alias = `${p[0]}hes`
			hv[`${p}hesapkod`] ??= `${alias}.kod`
		})
	}
	uygunluk2UnionBilgiListeDuzenleDevam(e) {
		super.uygunluk2UnionBilgiListeDuzenleDevam(e)
		this.uniDuzenle_muhasebe(e)
	}
	uniDuzenle_muhasebe({ uygunluk, liste }) {
		extend(liste, {
			muhasebe: [
				// herşey ortak kısımlarda mevcut zaten
				new Hareketci_UniBilgi()
			]
		})
		return this
	}
	static maliTablo_secimlerYapiDuzenle({result}) {
		super.maliTablo_secimlerYapiDuzenle(...arguments)
		extend(result, {
			sube: DMQSube,
			subeGrup: DMQSubeGrup,
			mst: DMQMuhHesap,
			grup: DMQMuhGrup
		})
	}
	static maliTablo_secimlerSentDuzenle({detSecimler: sec, sent, sent: {from}, where: wh, hv, mstClause, maliTablo}) {
		super.maliTablo_secimlerSentDuzenle(...arguments)
		mstClause ||= hv.hesapkod || 'har.hesapkod'
		let grpClause = hv.grupkod || 'mhes.grupkod'
		if (sec) {
			wh.basiSonu(sec.subeKod, 'fis.bizsubekod').ozellik(sec.subeAdi, 'sub.aciklama')
			wh.basiSonu(sec.subeGrupKod, 'sub.isygrupkod').ozellik(sec.subeGrupAdi, 'igrp.aciklama')
			wh.basiSonu(sec.mstKod, mstClause).ozellik(sec.mstAdi, 'mhes.aciklama')
			wh.basiSonu(sec.grupKod, grpClause).ozellik(sec.grupAdi, 'grp.aciklama')
		}
	}
}
