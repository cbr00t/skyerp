class CariTahsilatOdemeOrtakFis extends FinansFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get ba() { return null }
	static get table() { return 'carifis' } static get noSaha() { return 'fisno' }
	static get mustSaha() { return 'mustkod' } static get altHesapSaha() { return 'althesapkod' }
	static get detaySinif() { return CariTahsilatOdemeDetay } static get gridKontrolcuSinif() { return CariTahsilatOdemeGridci }
	static get tsnKullanilirmi() { return true } static get numYapi() { let {numTipKod: kod} = this; return kod ? new MQNumarator({ kod }) : null }
	static extYapilarDuzenle({ liste }) {
		super.extYapilarDuzenle(...arguments);
		liste.push(ExtFis_Cari, /*ExtFis_CariVeAltHesap,*/ ExtFis_Plasiyer);
		if (app.params.ticariGenel.kullanim.takipNo) { liste.push(ExtFis_TakipNo) }
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments) /*; $.extend(pTanim, {
			mustKod: new PInstStr('mustkod'),
			plasiyerKod: new PInstStr('plasiyerkod')
		})*/
	}
	static varsayilanKeyHostVarsDuzenle({ hv }) {
		super.varsayilanKeyHostVarsDuzenle(...arguments);
		let {ba} = this; $.extend(hv, { ba })
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments)
		/* hv.ticmustkod = hv.ticmustkod || hv.must */
	}
}
class CariTahsilatFis extends CariTahsilatOdemeOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get ba() { return 'B' }
	static get kodListeTipi() { return 'CARITAH' } static get sinifAdi() { return 'Cari Tahsilat' }
	static get numTipKod() { return 'CRTAH' }
}
class CariOdemeFis extends CariTahsilatOdemeOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get ba() { return 'A' }
	static get kodListeTipi() { return 'CARIODE' } static get sinifAdi() { return 'Cari Ödeme' }
	static get numTipKod() { return 'CRODE' }
}

class CariTahsilatOdemeDetay extends FinansDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'carihar' } static get altHesapSaha() { return 'detalthesapkod' }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
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
		await super.kaydetOncesiIslemler(...arguments); let {tahSekliNo} = this, kod2Rec = await MQTahsilSekli.getGloKod2Rec();
		/* let rec = (await MQTahsilSekli.loadServerData({ ozelQueryDuzenle: ({ sent }) => sent.where.degerAta(tahSekliNo, 'kodno') }))?.[0]; */
		let rec = kod2Rec[tahSekliNo]; if (rec) {
			let {tip, altTip} = this;
			tip.char = rec.tahsiltipi; altTip.char = rec.ahalttip;
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
						.stmDuzenleyiciEkle(({ mfSinif, alias, sent }) => {
							mfSinif.loadServerData_queryDuzenle({ alias, sent });
							sent.where.add(`NOT (${alias}.tahsiltipi = '' AND ${alias}.ahalttipi IN ('C', 'S'))`);
						}).degisince(async ({ rec }) => {
							/*rec = await rec;
							if (config.dev) { debugger }*/
						})
				}
			}),
			...MQAltHesap.getGridKolonlar({ belirtec: 'altHesap', autoBind: true })
		])
	}
	tabloKolonlariDuzenle_ara({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_ara(...arguments);
		tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'belgeNo', text: 'Belge No', genislikCh: 18 }).tipNumerik(),
			/* new GridKolon({ belirtec: 'dvBedel', text: 'Dv Bedel', genislikCh: 15 }).tipDecimal_dvBedel(), */
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 15 }).tipDecimal_bedel()
		])
	}
	tabloKolonlariDuzenle_son({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_son(...arguments);
		tabloKolonlari.push(new GridKolon({ belirtec: 'detAciklama', text: 'Açıklama', genislikCh: 50 }))
	}
}
