class CariTahsilatOdemeOrtakFis extends FinansFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get ba() { return null }
	static get table() { return 'carifis' } static get noSaha() { return 'fisno' }
	static get mustSaha() { return 'mustkod' } static get altHesapSaha() { return 'althesapkod' }
	static get detaySinif() { return CariTahsilatOdemeDetay } static get gridKontrolcuSinif() { return CariTahsilatOdemeGridci }
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
}
class CariOdemeFis extends CariTahsilatOdemeOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get ba() { return 'A' }
	static get kodListeTipi() { return 'CARIODE' } static get sinifAdi() { return 'Cari Ödeme' }
}

class CariTahsilatOdemeDetay extends FinansDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'carihar' } static get altHesapSaha() { return 'detalthesapkod' }
	static extYapilarDuzenle({ liste }) {
		super.extYapilarDuzenle(...arguments);
		liste.push(Ext_TahSekliNo, Ext_AltHesap, Ext_Bedel, Ext_DetAciklama)
	}
}
class CariTahsilatOdemeGridci extends FinansGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_ilk({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_ilk(...arguments);
		tabloKolonlari.push(...[
			...MQTahsilSekli.getGridKolonlar({ belirtec: 'tahSekli', autoBind: true, kodsuz: true }),
			...MQAltHesap.getGridKolonlar({ belirtec: 'altHesap', autoBind: true })
		])
	}
	tabloKolonlariDuzenle_ara({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_ara(...arguments);
		tabloKolonlari.push(...[
			/* new GridKolon({ belirtec: 'dvBedel', text: 'Dv Bedel', genislikCh: 15 }).tipDecimal_dvBedel(), */
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 15 }).tipDecimal_bedel()
		])
	}
	tabloKolonlariDuzenle_son({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_son(...arguments);
		tabloKolonlari.push(new GridKolon({ belirtec: 'detAciklama', text: 'Açıklama', genislikCh: 50 }))
	}
}
