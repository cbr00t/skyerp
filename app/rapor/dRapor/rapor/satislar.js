class DRapor_StokSatislar extends DRapor_TicariStok {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get altRaporClassPrefix() { return 'DRapor_StokSatislar' } static get vioAdim() { return 'SA-RCF' }
	static get kod() { return 'STSATIS' } static get aciklama() { return 'Satışlar' }
}
class DRapor_StokSatislar_Main extends DRapor_Sevkiyat_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_StokSatislar }
	fisVeHareketBagla({ sent: { where: wh }}) {
		super.fisVeHareketBagla(...arguments)
		wh.add(`fis.almsat = 'T'`)
	}
}
class DRapor_HizmetSatislar_Main extends DRapor_StokSatislar_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_HizmetSatislar }
}

class DRapor_StokAlimlar extends DRapor_TicariStok {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get altRaporClassPrefix() { return 'DRapor_StokAlimlar' } static get vioAdim() { return 'AL-RCF' }
	static get kod() { return 'STALIM' } static get aciklama() { return 'Alımlar' }
}
class DRapor_StokAlimlar_Main extends DRapor_Sevkiyat_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_StokAlimlar }
	fisVeHareketBagla({ sent: { where: wh } }) {
		super.fisVeHareketBagla(...arguments)
		wh.add(`fis.almsat IN ('A', 'M')`)
	}
}
class DRapor_HizmetAlimlar_Main extends DRapor_StokAlimlar_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_HizmetAlimlar }
}

class DRapor_StokSatisSiparisler extends DRapor_TicariStok {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get altRaporClassPrefix() { return 'DRapor_StokSatisSiparisler' } static get vioAdim() { return 'SA-RST' }
	static get kod() { return 'STSSIP' } static get aciklama() { return 'Satış Siparişler' }
}
class DRapor_StokSatisSiparisler_Main extends DRapor_Ticari_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_StokSatisSiparisler }
	loadServerData_queryDuzenle_tekilSonrasi({ stm, attrSet } = {}) {
		let e = arguments[0], {stokGenel} = app.params
		if (stokGenel.kullanim.transferSiparisi) {
			let uni = stm.sent = stm.sent.asUnionAll()
			let _e = { ...e, stm : new MQStm(), trfSipmi: true }
			this.loadServerData_queryDuzenle_tekil(_e)
			uni.add(_e.stm.sent)
		}
		super.loadServerData_queryDuzenle_tekilSonrasi(e)		/* üstte konsolide için db union all yapılıyor */
	}
	fisVeHareketBagla({ sent, sent: { where: wh }, trfSipmi }) {
		super.fisVeHareketBagla(...arguments)
		let {shd} = this, sipStPrefix = trfSipmi ? 'st' : 'sip'
		sent.fisHareket(`${sipStPrefix}fis`, `${sipStPrefix}${shd}`)
		if (trfSipmi)
			wh.add(`fis.gctipi = 'S'`, `fis.ozeltip = 'IR'`, `fis.fisekayrim = ''`)
		else
			wh.add(`fis.almsat = 'T'`, `fis.ozeltip = ''`, `fis.onaytipi = ''`)
	}
}
class DRapor_HizmetSatisSiparisler_Main extends DRapor_StokSatisSiparisler_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_HizmetSatisSiparisler }
}
