class CariTopluIslemFis extends FinansFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'CRTOP' } static get sinifAdi() { return 'Cari Toplu İşlem' }
	static get detaySinif() { return CariTopluIslemDetay }
	static get gridKontrolcuSinif() { return CariTopluIslemGridci }
	static get numTipKod() { return 'CISL' }
	static get fisTipi() { return 'CI' }
	static get ozelTip() { return '' }
	static get ba() { return null }
	static get devirmi() { return false }
	static get numYapi() {
		let { numTipKod: kod } = this
		return kod ? new MQNumarator({ kod }) : null
	}

	static extYapilarDuzenle({ liste }) {
		super.extYapilarDuzenle(...arguments)
		liste.push(...[
			ExtFis_CariIslem,
			( this.devirmi ? null : ExtFis_Plasiyer )
		].filter(Boolean))
	}

	bakiyeKullanimDuzenle({ result: r }) {
		super.bakiyeKullanimDuzenle(...arguments)
		r.cari = true
	}
	bakiyeSqlEkDuzenle_cari({ sent, sent: { where: wh, sahalar } }) {
		// MQOrtakFis::bakiyeSqlOrtakDuzenle  sırasında from ve sayac ataması yapıldı
		let { class: { detayTable } } = this
		super.bakiyeSqlEkDuzenle_cari(...arguments)
		sent.fis2HarBagla(detayTable)
		sahalar
			.addWithAlias('fis', 'ozelisaret')
			.addWithAlias('har', 'ticmustkod must', 'cariitn althesapkod')
			.add(
				`SUM(${ MQCase.baBakiye('fis.ba', 'har.bedel') }) bakiye`,
				`SUM(${ MQCase.baBakiye('fis.ba', 'har.dvbedel') }) dvbakiye`
			)
	}
	
	async kaydetOncesiIslemler(e) {
		await promiseAll([
			super.kaydetOncesiIslemler(e),
			MQCariIslem.getKod2BA()                      // cache
		])
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments)
		let { globals: { kod2BA = {} } } = MQCariIslem
		let { islKod, fisTopNet: toplambedel, fisTopDvNet: toplamdvbedel } = this
		let ba = kod2BA[islKod] ?? (islKod[0] == 'A' ? 'A' : 'B')
		extend(hv, { ba, toplambedel, toplamdvbedel })
	}
}
class CariTopluIslemDetay extends FinansDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get mustSaha() { return 'must' }

	static extYapilarDuzenle({ liste }) {
		super.extYapilarDuzenle(...arguments)
		liste.push(
			Ext_CariVeAltHesap, Ext_BelgeTarihVeNo,
			Ext_Vade, Ext_Bedel,
			//Ext_DvKur, Ext_BedelVeDvBedel,
			Ext_DetAciklama
		)
	}
}
class CariTopluIslemGridci extends FinansGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_ilk({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_ilk(...arguments)
		tabloKolonlari.push(...[
			...MQCari.getGridKolonlar({ gridKolonGrupcu: 'getGridKolonGrup_yoreli', belirtec: 'must', autoBind: true }),
			...MQAltHesap.getGridKolonlar({ belirtec: 'altHesap', autoBind: true })
			
		])
	}
	tabloKolonlariDuzenle_ara({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_ara(...arguments);
		tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'belgeTarih', text: 'Tarih', genislikCh: 14 }).tipDate(),
			new GridKolon({ belirtec: 'belgeSeri', text: 'Seri', genislikCh: 5 }).tipString(3),
			new GridKolon({ belirtec: 'belgeNoYil', text: 'No Yıl', genislikCh: 8 }).tipNumerik().setMaxLength(4),
			new GridKolon({ belirtec: 'belgeNo', text: 'Belge No', genislikCh: 15 }).tipNumerik(),
			new GridKolon({ belirtec: 'vade', text: 'Vade', genislikCh: 12}).tipDate(),
			/*new GridKolon({ belirtec: 'dvBedel', text: 'Dv.Bedel', genislikCh: 18 }).tipDecimal_dvBedel(),*/
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 18 }).tipDecimal_bedel()
		])
	}
	tabloKolonlariDuzenle_son({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_son(...arguments);
		tabloKolonlari.push(new GridKolon({ belirtec: 'detAciklama', text: 'Açıklama', genislikCh: 50 }))
	}
}

class CariTahsilatOdemeOrtakFis extends FinansFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'carifis' } static get noSaha() { return 'fisno' }
	static get mustSaha() { return 'mustkod' }
	static get altHesapSaha() { return 'althesapkod' }
	static get detaySinif() { return CariTahsilatOdemeDetay }
	static get gridKontrolcuSinif() { return CariTahsilatOdemeGridci }
	static get ba() { return null }
	static get tsnKullanilirmi() { return true }
	static get numYapi() {
		let { numTipKod: kod } = this
		return kod ? new MQNumarator({ kod }) : null
	}
	
	static extYapilarDuzenle({ liste }) {
		super.extYapilarDuzenle(...arguments);
		liste.push(ExtFis_Cari, /*ExtFis_CariVeAltHesap,*/ ExtFis_Plasiyer)
		if (app.params.ticariGenel.kullanim.takipNo)
			liste.push(ExtFis_TakipNo)
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments) /*; $.extend(pTanim, {
			mustKod: new PInstStr('mustkod'),
			plasiyerKod: new PInstStr('plasiyerkod')
		})*/
	}
	static varsayilanKeyHostVarsDuzenle({ hv }) {
		super.varsayilanKeyHostVarsDuzenle(...arguments)
		let { ba } = this
		extend(hv, { ba })
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments)
		/* hv.ticmustkod = hv.ticmustkod || hv.must */
	}

	bakiyeKullanimDuzenle({ result: r }) {
		super.bakiyeKullanimDuzenle(...arguments)
		r.cari = r.kasa = r.mevduat = true
	}
	bakiyeSqlEkDuzenle_cari({ sent, sent: { where: wh, sahalar } }) {
		// MQOrtakFis::bakiyeSqlOrtakDuzenle  sırasında from ve sayac ataması yapıldı
		let { class: { ba, detayTable } } = this
		super.bakiyeSqlEkDuzenle_cari(...arguments)
		sent.fis2HarBagla(detayTable)
		sahalar
			.addWithAlias('fis', 'ozelisaret', 'ticmustkod must')
			.addWithAlias('har', 'detalthesapkod althesapkod')
			.add(
				`SUM(${ ba == 'A' ? '0 - ' : '' }har.bedel) bakiye`,
				`SUM(${ ba == 'A' ? '0 - ' : '' }har.dvbedel) dvbakiye`
			)
	}
	bakiyeSqlEkDuzenle_kasa({ sent, sent: { where: wh, sahalar } }) {
		// MQOrtakFis::bakiyeSqlOrtakDuzenle  sırasında from ve sayac ataması yapıldı
		let { class: { ba, detayTable } } = this
		super.bakiyeSqlEkDuzenle_kasa(...arguments)
		sent.fis2HarBagla(detayTable)
		wh.add(`har.tahkasakod <> ''`)
		sahalar
			.addWithAlias('fis', 'ozelisaret')
			.addWithAlias('har', 'tahkasakod kasakod')
			.add(    // ters çalışır
				`SUM(${ ba == 'B' ? '0 - ' : '' }har.bedel) bakiye`,
				`SUM(${ ba == 'B' ? '0 - ' : '' }har.dvbedel) dvbakiye`
			)
	}
	bakiyeSqlEkDuzenle_mevduat({ sent, sent: { where: wh, sahalar } }) {
		// MQOrtakFis::bakiyeSqlOrtakDuzenle  sırasında from ve sayac ataması yapıldı
		let { class: { ba, detayTable } } = this
		super.bakiyeSqlEkDuzenle_mevduat(...arguments)
		sent.fis2HarBagla(detayTable)
		wh.add(`har.tahposhesapkod <> ''`)
		sahalar
			.addWithAlias('fis', 'ozelisaret')
			.addWithAlias('har', 'tahposhesapkod banhesapkod')
			.add(    // ters çalışır
				`SUM(${ ba == 'B' ? '0 - ' : '' }har.bedel) bakiye`,
				`SUM(${ ba == 'B' ? '0 - ' : '' }har.dvbedel) dvbakiye`
			)
	}
}
class CariTahsilatFis extends CariTahsilatOdemeOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'CARITAH' } static get sinifAdi() { return 'Cari Tahsilat' }
	static get numTipKod() { return 'CRTAH' } static get ba() { return 'A' }
}
class CariOdemeFis extends CariTahsilatOdemeOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'CARIODE' } static get sinifAdi() { return 'Cari Ödeme' }
	static get numTipKod() { return 'CRODE' }
	static get ba() { return 'B' }
}

class CariTahsilatOdemeDetay extends FinansDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'carihar' }
	static get altHesapSaha() { return 'detalthesapkod' }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, {
			tip: new PInstTekSecim({ sinif: TahsilSekliTip }), altTip: new PInstTekSecim({ sinif: TahsilSekliAltTip }),
			refSayac: new PInst(), belgeNo: new PInstNum('belgeno'), dvKur: new PInstNum('dvkur'),
			sanalmi: new PInstBool('sanalmi'), acikKisim: new PInstNum('acikkisim'),
			tahEkKod: new PInstStr(), tahEkAdi: new PInstStr(), tahEkSubeKod: new PInstStr(), dvKod: new PInstStr(),
			tahKasaKod: new PInstStr('tahkasakod'), tahHizmetKod: new PInstStr('tahhizmetkod'),
			tahPosHesapKod: new PInstStr('tahposhesapkod'), tahPosKosulKod: new PInstStr('tahposkosulkod'),
			posNakdeDonusumIlkVade: new PInstDate('posnakdedonusumilkvade')
		})
	}
	static extYapilarDuzenle({ liste }) {
		super.extYapilarDuzenle(...arguments);
		liste.push(Ext_TahSekliNo, Ext_AltHesap, Ext_Bedel, Ext_DetAciklama)
	}
	static orjBaslikListesiDuzenle_ara({ liste }) {
		super.orjBaslikListesiDuzenle_ara(...arguments); let {aliasVeNokta} = this;
		liste.push(
			new GridKolon({ belirtec: 'belgeno', text: 'Belge No', genislikCh: 18 })
		)
	}
	async kaydetOncesiIslemler({ fis }) {
		await super.kaydetOncesiIslemler(...arguments)
		let {tahSekliNo} = this
		let clsTahSekli = (MQCogul.isOfflineMode ? window.MQTabTahsilSekli : null) ?? MQTahsilSekli
		let kod2Rec = await clsTahSekli.getGloKod2Rec()
		/* let rec = (await clsTahSekli.loadServerData({ ozelQueryDuzenle: ({ sent }) => sent.where.degerAta(tahSekliNo, 'kodno') }))?.[0]; */
		let rec = kod2Rec[tahSekliNo]
		if (rec) {
			let {tip, altTip} = this
			tip.char = rec.tahsiltipi
			altTip.char = rec.ahalttip
			$.extend(this, {
				tahEkKod: rec.ekkod, tahEkAdi: rec.ekadi,
				tahEkSubeKod: rec.eksubekod, dvKod: rec.tahdvkod,
				tahposkosulkod: rec.poskosulkod, sanalmi: rec.sanalmi
			})
		}
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments); let {char: tip} = this.tip;
		let {tahEkKod, tahHizmetKod, tahPosKosulKod, sanalmi, bedel: acikkisim} = this;
		switch (tip) {
			case 'NK': $.extend(hv, { tahkasakod: tahEkKod }); break
			case 'HV': $.extend(hv, { tahposhesapkod: tahEkKod }); break
			case 'HG': $.extend(hv, { tahposhesapkod: tahEkKod }); break
			case 'PS': $.extend(hv, { tahposhesapkod: tahEkKod, tahposkosulkod: tahPosKosulKod, sanalmi }); break
			case 'KR': $.extend(hv, { tahposhesapkod: tahEkKod, tahposkosulkod: tahPosKosulKod }); break
			case 'HZ': $.extend(hv, { tahhizmetkod: tahHizmetKod }); break
			case 'YM': $.extend(hv, { tahyemekcarikod: tahyemekcarikod }); break
		}
		$.extend(hv, { acikkisim })
	}
	setValues({ rec }) {
		super.setValues(...arguments)
	}
}
class CariTahsilatOdemeGridci extends FinansGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_ilk({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_ilk(...arguments);
		tabloKolonlari.push(...[
			...MQTahsilSekli.getGridKolonlar({
				belirtec: 'tahSekli', autoBind: true, kodsuz: true, duzenleyici: ({ colDef }) => {
					colDef.ozelStmDuzenleyiciTrigger()
						.stmDuzenleyiciEkle(({ mfSinif, alias, stm, sent }) => {
							mfSinif.loadServerData_queryDuzenle({ alias, stm, sent });
							sent.where.add(`NOT (${alias}.tahsiltipi = '' AND ${alias}.ahalttipi IN ('C', 'S'))`);
						}).degisince(async ({ rec }) => {
							//rec = await rec
							//if (config.dev)
							//	debugger
						})
				}
			}),
			...MQAltHesap.getGridKolonlar({ belirtec: 'altHesap', autoBind: true })
		])
	}
	tabloKolonlariDuzenle_ara({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_ara(...arguments)
		tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'belgeNo', text: 'Belge No', genislikCh: 18 }).tipNumerik(),
			//new GridKolon({ belirtec: 'dvBedel', text: 'Dv Bedel', genislikCh: 15 }).tipDecimal_dvBedel(),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 15 }).tipDecimal_bedel()
		])
	}
	tabloKolonlariDuzenle_son({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_son(...arguments)
		tabloKolonlari.push(new GridKolon({ belirtec: 'detAciklama', text: 'Açıklama', genislikCh: 50 }))
	}
}


class CariDevirFis extends CariTopluIslemFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'CARDEV' }  static get sinifAdi() { return 'Cari Devir' }
	static get numTipKod() { return 'CDEV' } static get ozelTip() { return 'D' }
	static get devirmi() { return true }
}


class KasaCariFis extends FinansFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'KSCAR' } static get sinifAdi() { return 'Kasa Tahsilat/Ödeme' }
	static get detaySinif() { return KasaCariDetay }
	static get gridKontrolcuSinif() { return KasaCariGridci }
	static get numTipKod() { return 'KCTAH' } static get fisTipi() { return 'KC' }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, { ba: new PInstTekSecim('ba', TahsilatOdeme) })
	}
	static extYapilarDuzenle({ liste }) {
		super.extYapilarDuzenle(...arguments)
		liste.push(ExtFis_Kasa, ExtFis_Plasiyer)
	}
	static rootFormBuilderDuzenle_son({ builders: { tsnForm, baslikForm: { builders: baslikFormlar } } }) {
		super.rootFormBuilderDuzenle_son(...arguments)
		;{
			let form = tsnForm
			form.addSelect('ba')
				.addStyle_wh(150)
				.setEtiket('Tahsilat/Ödeme')
				.setSource(TahsilatOdeme.kaListe)
		}
	}

	bakiyeKullanimDuzenle({ result: r }) {
		super.bakiyeKullanimDuzenle(...arguments)
		r.cari = r.kasa = true
	}
	bakiyeSqlEkDuzenle_cari({ sent, sent: { where: wh, sahalar } }) {
		// MQOrtakFis::bakiyeSqlOrtakDuzenle  sırasında from ve sayac ataması yapıldı
		let { class: { detayTable } } = this
		super.bakiyeSqlEkDuzenle_cari(...arguments)
		sent.fis2HarBagla(detayTable)
		sahalar
			.addWithAlias('fis', 'ozelisaret')
			.addWithAlias('har', 'ticmustkod must', 'cariitn althesapkod')
			.add(
				`SUM(${ MQCase.baBakiye('dbo.tersba(fis.ba)', 'har.bedel') }) bakiye`,
				`SUM(${ MQCase.baBakiye('dbo.tersba(fis.ba)', 'har.dvbedel') }) dvbakiye`
			)
	}
	bakiyeSqlEkDuzenle_kasa({ sent, sent: { where: wh, sahalar } }) {
		// MQOrtakFis::bakiyeSqlOrtakDuzenle  sırasında from ve sayac ataması yapıldı
		let { class: { detayTable } } = this
		super.bakiyeSqlEkDuzenle_kasa(...arguments)
		sahalar
			.addWithAlias('fis', 'ozelisaret', 'kasakod')
			.add(
				`SUM(${ MQCase.baBakiye('fis.ba', 'fis.toplambedel') }) bakiye`,
				`SUM(${ MQCase.baBakiye('fis.ba', 'fis.toplamdvbedel') }) dvbakiye`
			)
	}
}
class KasaCariDetay extends FinansDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get mustSaha() { return 'must' }

	static extYapilarDuzenle({ liste }) {
		super.extYapilarDuzenle(...arguments)
		let { ticariGenel: { kullanim: ticGenel } } = app.params
		liste.push(...[
			Ext_CariVeAltHesap,
			//Ext_BelgeTarihVeNo,
			Ext_Vade, Ext_Bedel,
			( ticGenel.takipNo ? Ext_TakipNo : null ),
			//Ext_DvKur, Ext_BedelVeDvBedel,
			Ext_DetAciklama
		].filter(Boolean))
	}
}
class KasaCariGridci extends FinansGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_ilk({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_ilk(...arguments)
		tabloKolonlari.push(...[
			...MQCari.getGridKolonlar({ gridKolonGrupcu: 'getGridKolonGrup_yoreli', belirtec: 'must', autoBind: true }),
			...MQAltHesap.getGridKolonlar({ belirtec: 'altHesap', autoBind: true })
			
		])
	}
	tabloKolonlariDuzenle_ara({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_ara(...arguments);
		tabloKolonlari.push(...[
			//new GridKolon({ belirtec: 'belgeTarih', text: 'Tarih', genislikCh: 14 }).tipDate(),
			//new GridKolon({ belirtec: 'belgeSeri', text: 'Seri', genislikCh: 5 }).tipString(3),
			//new GridKolon({ belirtec: 'belgeNoYil', text: 'No Yıl', genislikCh: 8 }).tipNumerik().setMaxLength(4),
			//new GridKolon({ belirtec: 'belgeNo', text: 'Belge No', genislikCh: 15 }).tipNumerik(),
			...MQTakipNo.getGridKolonlar({ belirtec: 'takip', autoBind: true }),
			new GridKolon({ belirtec: 'vade', text: 'Vade', genislikCh: 12 }),
			//new GridKolon({ belirtec: 'dvBedel', text: 'Dv.Bedel', genislikCh: 18 }).tipDecimal_dvBedel()
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 18 }).tipDecimal_bedel()
		])
	}
	tabloKolonlariDuzenle_son({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_son(...arguments);
		tabloKolonlari.push(new GridKolon({ belirtec: 'detAciklama', text: 'Açıklama', genislikCh: 50 }))
	}
}
