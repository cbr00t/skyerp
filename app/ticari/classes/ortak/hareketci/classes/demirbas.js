class DemirbasHareketci extends Hareketci {
	static{ window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 37 } static get kisaKod() { return 'DM' }
	static get kod() { return 'demirbas' } static get aciklama() { return 'Demirbaş' }
	static get uygunmu() { return app.params?.ticariGenel?.kullanim?.demirbas }
	static get maliTabloIcinUygunmu() { return true }
	static get donemselIslemlerIcinUygunmu() { return false }
	static get eldekiVarliklarIcinUygunmu() { return true }

	static getAltTipAdiVeOncelikClause({hv}) {
		return {
			...super.getAltTipAdiVeOncelikClause(...arguments),
			yon: `'sol'`
		}
	}
	static mstYapiDuzenle({result}) {
		super.mstYapiDuzenle(...arguments)
		let defHVAlias = 'shkod'
		result.set(defHVAlias, ({ mstYapi, secimler = {}, sent, sent: { sahalar }, kodClause, mstAlias, mstAdiAlias }) => {
			let {sqlEmpty} = Hareketci_UniBilgi.ortakArgs
			let hvAlias, adiClause
			let { demirbasTipi: demTipi = {} } = secimler
			demTipi = demTipi.tekSecim ?? demTipi
			if (demTipi.grupmu) {
				hvAlias = 'grupkod'
				adiClause = 'grp.aciklama'
			}
			else if (demTipi.anaGrupmu) {
				hvAlias = 'anagrupkod'
				adiClause = 'agrp.aciklama'
			}
			else if (demTipi.cinsimi) {
				hvAlias = 'cinskod'
				adiClause = DemirbasCinsi.getClause(kodClause || '')
			}
			else {
				hvAlias = defHVAlias
				adiClause = 'dem.aciklama'
			}
			if (hvAlias)
				mstYapi.hvAlias = hvAlias
			// sent.fromIliski(`demmst ${mstAlias}`, `${kodClause} = ${mstAlias}.kod`)
			sahalar.add(`${adiClause} ${mstAdiAlias}`)
		})
	}

	/* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
	static hareketTipSecim_kaListeDuzenle({kaListe}) {
		super.hareketTipSecim_kaListeDuzenle(arguments)
		kaListe.push(...[
			new CKodVeAdi(['demGiris', 'Demirbaş Giriş']),
			new CKodVeAdi(['demCikis', 'Demirbaş Çıkış']),
			new CKodVeAdi(['demTrf', 'Demirbaş Transfer']),
			new CKodVeAdi(['irsaliye', 'İrsaliye']),
			new CKodVeAdi(['fatura', 'Fatura']),
			new CKodVeAdi(['genelDekont', 'Genel Dekont'])])
	}
	static async ilkIslemler(e) {
		await super.ilkIslemler(e)
	}
	uniDuzenleOncesi({ sender: { finansalAnalizmi, eldekiVarliklarmi } = {}, stm, uni }) {
		super.uniDuzenleOncesi(...arguments)
		let {attrSet} = this
		if (eldekiVarliklarmi) {
			if (attrSet)
				deleteKeys(attrSet, 'bedel', 'brutbedel', 'malmuh', 'malhammadde', 'fmalmuh', 'fmalhammadde')
			attrSet.cinskod = attrSet.miktar = true
			;{
				let sent = new MQSent(), {where: wh, sahalar} = sent
				sent.fromAdd('demmst dem').leftJoin('dem', 'pifdemirbas ahar', [`dem.fiskayittipi = 'A'`, `dem.alimdetaysayac = ahar.kaysayac`]).leftJoin('dem', 'stdemirbas dhar', [`dem.fiskayittipi IN ('D', 'K')`, `dem.devirdetaysayac = dhar.kaysayac`])
				wh.add(`dem.kod <> ''`)
				sahalar.add('dem.kod demkod', 'dem.rayicfiyat', `(CASE
							WHEN dem.fiskayittipi = 'A' THEN ahar.belgefiyat
							WHEN dem.fiskayittipi IN ('D', 'K') THEN dhar.belgefiyat
							ELSE 0
						END) alimfiyat`)
				stm.with.add(sent.asTmpTable('demfiyat'))
			}
			;{
				let sent = new MQSent(), {where: wh, sahalar} = sent
				sent.fromAdd('demfiyat dfiy')
					.innerJoin('dfiy', 'demceyhesap dhes', ['dfiy.demkod = dhes.demkod', `dhes.vtayrim = ''`])
				sahalar.add('dfiy.demkod', `MAX(dhes.hesapyili * 10 + dhes.ceyrekno) sonceyrekyil`)
				sent.groupByOlustur()
				stm.with.add(sent.asTmpTable('demsonhesap'))
			}
			;{
				let sent = new MQSent(), {where: wh, sahalar} = sent
				sent.fromAdd('demsonhesap dson')
					.innerJoin('dson', 'demceyhesap dhes', [
						'dson.demkod = dhes.demkod', `dhes.vtayrim = ''`,
						`dson.sonceyrekyil = (dhes.hesapyili * 10 + dhes.ceyrekno)`
					])
				sahalar.add('dson.demkod', `ROUND(dhes.ydssabitkiymet / dhes.hesmiktar, 2) brmdegerlenmis`)
				stm.with.add(sent.asTmpTable('demsabitkiymet'))
			}

			;{
				let sent = new MQSent()
				  , {where: wh, sahalar} = sent
				sent.fromAdd('demfiyat dfiy')
					.leftJoin('dfiy', 'demsabitkiymet dkiy', 'dfiy.demkod = dkiy.demkod')
				sahalar.add(
					'dfiy.demkod',
					`(CASE
						WHEN dfiy.rayicfiyat > 0 THEN dfiy.rayicfiyat
						ELSE dbo.emptycoalesce(dkiy.brmdegerlenmis, dfiy.alimfiyat)
					END) sonfiyat`)
				stm.with.add(sent.asTmpTable('demsonucfiyat'))
			}
		}
	}
	stmIcinSonIslemler({sender: {finansalAnalizmi, eldekiVarliklarmi}={}, stm, uni}) {
		super.stmIcinSonIslemler(...arguments)
	}
	uniOrtakSonIslem({sender: {finansalAnalizmi, eldekiVarliklarmi}={}, hvDegeri, sent}) {
		let {from, where: wh, sahalar} = sent
		super.uniOrtakSonIslem(...arguments)
		let kodClause = hvDegeri('shkod') || 'har.demirbaskod'
		if (!from.aliasIcinTable('dem'))
			sent.fromIliski('demmst dem', `${kodClause} = dem.kod`)
		if (!from.aliasIcinTable('grp'))
			sent.dem2GrupBagla()
		if (!from.aliasIcinTable('agrp'))
			sent.demGrup2AnaGrupBagla()
		if (!from.aliasIcinTable('mas'))
			sent.dem2MasrafBagla()
		sent.fisSilindiEkle()
		wh.add(`fis.ozelisaret <> 'X'`)

		if (eldekiVarliklarmi) {
			let mstAlias = MQAliasliYapi.getDegerAlias(kodClause)
			let miktarClause = hvDegeri('miktar').sumOlmaksizin()
			sent.leftJoin(mstAlias, 'demsonucfiyat dson', `${kodClause} = dson.demkod`)
			sahalar.add(`SUM(dson.sonfiyat * ${miktarClause}) bedel`)
			// sent.groupByOlustur()
		}
	}
	static varsayilanHVDuzenle({hv, sqlNull, sqlEmpty, sqlZero}) {
		super.varsayilanHVDuzenle(...arguments)
		let kodClause = 'har.demirbaskod'
		extend(hv, {
			kayittipi: `'DM'`,
			shTipi: `'D'`,
			shkod: kodClause,
			ba: ({hv}) => `(CASE WHEN ${hv.gc} = 'C' THEN 'A' ELSE 'B' END)`,
			isladi: ({hv}) => hv.anaislemadi,
			cinskod: 'dem.demcinsi'
		})
	}
	uygunluk2UnionBilgiListeDuzenleDevam(e) {
		super.uygunluk2UnionBilgiListeDuzenleDevam(e)
		this.uniDuzenle_gcVeTrf(e).uniDuzenle_irsFat(e).uniDuzenle_genelDekont(e)
	}
	uniDuzenle_gcVeTrf({uygunluk, liste}) {
		extend(liste, {
			demGiris$demCikis$demTrf: [// Transferin ÇIKIŞ kısmı alınır
			new Hareketci_UniBilgi().sentDuzenleIslemi( ({sent}) => {
				let {where: wh, sahalar} = sent
				let gcTipListe = [(uygunluk.demGiris ? 'G' : null), (uygunluk.demCikis ? 'C' : null), (uygunluk.demTrf ? 'T' : null)].filter(Boolean)
				sent.fisHareket('stfis', 'stdemirbas').fromIliski('stkyer yer', 'har.detrefyerkod = yer.kod').fromIliski('carmst car', 'fis.irsmust = car.must')
				wh.inDizi(gcTipListe, 'fis.gctipi')
			}
			).hvDuzenleIslemi( ({hv, sqlEmpty, sqlZero}) => {
				let wt_anaIslAdi = [
					`WHEN fis.gctipi = 'G' THEN (
						CASE fis.ozeltip
							WHEN 'DD' THEN 'Devir'
							WHEN 'DA' THEN 'Dem. Aktifleştirme' 
							ELSE 'Dem. Giriş'
						END)`, `WHEN fis.gctipi = 'C' THEN (
						CASE fis.ozeltip
							WHEN 'SY' THEN 'Sayım Fişi'
							ELSE 'Dem. Çıkış'
						END)`, `WHEN fis.gctipi = 'T' THEN (
						CASE fis.ozeltip
							WHEN 'SB' THEN 'Şube Transferi'
							ELSE 'Dem. Transfer'
						END)`
				]
				extend(hv, {
					kayittipi: `'DM'`,
					shTipi: `'D'`,
					gc: `(CASE WHEN fis.gctipi = 'T' THEN 'C' ELSE fis.gctipi END)`,
					anaislemadi: `(CASE ${wt_anaIslAdi.join(' ')} END)`,
					yerkod: 'har.detyerkod',
					refkod: `(CASE WHEN fis.gctipi = 'T' THEN har.detrefyerkod ELSE fis.irsmust END)`,
					refadi: `(CASE WHEN fis.gctipi = 'T' THEN yer.aciklama ELSE car.birunvan END)`,
					miktar: 'har.miktar',
					fiyat: 'har.fiyat',
					fisaciklama: 'fis.cariaciklama'
				})
			}
			)],
			demTrf: [// Transferin GİRİŞ kısmı alınır
			new Hareketci_UniBilgi().sentDuzenleIslemi( ({sent}) => {
				let {where: wh, sahalar} = sent
				sent.fisHareket('stfis', 'stdemirbas').fromIliski('stkyer yer', 'har.detyerkod = yer.kod')
				wh.degerAta('T', 'fis.gctipi')
			}
			).hvDuzenleIslemi( ({hv, sqlEmpty, sqlZero}) => {
				extend(hv, {
					gc: `'G'`,
					anaislemadi: `(CASE fis.ozeltip WHEN 'SB' THEN 'Şube Transferi' ELSE 'Dem. Transfer' END)`,
					yerkod: 'har.detyerkod',
					refkod: 'har.detyerkod',
					refadi: 'yer.aciklama',
					miktar: 'har.miktar',
					fiyat: 'har.fiyat',
					fisaciklama: 'fis.cariaciklama'
				})
			}
			)]
		})
		return this
	}
	uniDuzenle_irsFat({uygunluk, liste}) {
		extend(liste, {
			irsaliye$fatura: [new Hareketci_UniBilgi().sentDuzenleIslemi( ({sent}) => {
				let {where: wh, sahalar} = sent
				sent.fisHareket('piffis', 'pifdemirbas').fis2CariBagla()
				wh.add(new MQOrClause([
					(uygunluk.fatura ? `(fis.piftipi = 'F' AND fis.onctip IN ('', 'S') )` : null),
					(uygunluk.irsaliye ? `fis.piftipi = 'I'` : null)
				].filter(Boolean)))
			})
			.hvDuzenleIslemi( ({hv, sqlEmpty, sqlZero}) => {
				let iadeVeATClause = `dbo.iadetext(fis.iade, dbo.almsattext(fis.almsat, 'Alım', 'Satış'))`
				let irsFatClause = `(CASE fis.piftipi WHEN 'I' THEN 'İrsaliye' ELSE 'Fatura' END)`
				extend(hv, {
					gc: `(CASE fis.almsat WHEN 'T' THEN 'C' ELSE 'G' END)`,
					anaislemadi: `(${iadeVeATClause} + ' ' + ${irsFatClause})`,
					// Alım İADE Fatura ...
					yerkod: 'har.detyerkod',
					refkod: 'fis.must',
					refadi: 'car.birunvan',
					miktar: 'har.miktar',
					fiyat: 'har.fiyat',
					fisaciklama: 'fis.cariaciklama'
				})
			}
			)]
		})
		return this
	}
	uniDuzenle_genelDekont({uygunluk, liste}) {
		extend(liste, {
			genelDekont: [new Hareketci_UniBilgi().sentDuzenleIslemi( ({sent}) => {
				let {where: wh, sahalar} = sent
				sent.fisHareket('geneldekontfis', 'geneldekonthar')
				wh.add(`har.kayittipi = 'DM'`)
			}
			).hvDuzenleIslemi( ({hv, sqlEmpty, sqlZero}) => {
				extend(hv, {
					gc: `'G'`,
					anaislemadi: `'Genel Dekont'`,
					yerkod: 'har.yerkod',
					miktar: 'har.miktar',
					fiyat: sqlZero,
					fisaciklama: 'fis.aciklama'
				})
			}
			)]
		})
		return this
	}
	static maliTablo_secimlerYapiDuzenle({result}) {
		super.maliTablo_secimlerYapiDuzenle(...arguments)
		extend(result, {
			sube: DMQSube,
			subeGrup: DMQSubeGrup,
			mst: DMQDemirbas,
			grup: DMQDemirbasGrup,
			anaGrup: DMQDemirbasAnaGrup,
			masraf: DMQMasraf
		})
	}
	static maliTablo_secimlerSentDuzenle({detSecimler: sec, sent, sent: {from}, where: wh, hv, mstClause, maliTablo}) {
		super.maliTablo_secimlerSentDuzenle(...arguments)
		mstClause ||= hv.shkod || 'har.demirbaskod'
		let grpClause = hv.grupkod || 'dem.grupkod'
		let aGrpClause = hv.anagrupkod || 'grp.anagrupkod'
		let masrafClause = hv.masrafkod || 'dem.masrafkod'
		if (sec) {
			wh.basiSonu(sec.subeKod, 'fis.bizsubekod').ozellik(sec.subeAdi, 'sub.aciklama')
			wh.basiSonu(sec.subeGrupKod, 'sub.isygrupkod').ozellik(sec.subeGrupAdi, 'igrp.aciklama')
			wh.basiSonu(sec.mstKod, mstClause).ozellik(sec.mstAdi, 'dem.aciklama')
			wh.basiSonu(sec.grupKod, grpClause).ozellik(sec.grupAdi, 'grp.aciklama')
			wh.basiSonu(sec.anaGrupKod, aGrpClause).ozellik(sec.anaGrupAdi, 'agrp.aciklama')
			wh.basiSonu(sec.masrafKod, masrafClause).ozellik(sec.masrafAdi, 'mas.aciklama')
		}
	}
}
