class DRapor_StokSatislar extends DRapor_TicariStok {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altRaporClassPrefix() { return 'DRapor_StokSatislar' }
	static get kod() { return 'STSATIS' } static get aciklama() { return 'Satışlar' } static get vioAdim() { return 'SA-RCF' }
}
class DRapor_StokAlimlar extends DRapor_TicariStok {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altRaporClassPrefix() { return 'DRapor_StokAlimlar' }
	static get kod() { return 'STALIM' } static get aciklama() { return 'Alımlar' } static get vioAdim() { return 'AL-RCF' }
}
class DRapor_StokSatisSiparisler extends DRapor_TicariStok {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altRaporClassPrefix() { return 'DRapor_StokSatisSiparisler' }
	static get kod() { return 'STSSIP' } static get aciklama() { return 'Satış Siparişler' } static get vioAdim() { return 'SA-RST' }
}

/*class DRapor_HizmetSatislar extends DRapor_TicariHizmet {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altRaporClassPrefix() { return 'DRapor_HizmetSatislar' }
	static get kod() { return 'HZSATIS' } static get aciklama() { return 'Satışlar' } static get vioAdim() { return DRapor_StokSatislar.vioAdim }
}
class DRapor_HizmetAlimlar extends DRapor_TicariHizmet {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altRaporClassPrefix() { return 'DRapor_HizmetAlimlar' }
	static get kod() { return 'HZALIM' } static get aciklama() { return 'Alımlar' } static get vioAdim() { return DRapor_StokAlimlar.vioAdim }
}
class DRapor_HizmetSatisSiparisler extends DRapor_TicariHizmet {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altRaporClassPrefix() { return 'DRapor_HizmetSatisSiparisler' }
	static get kod() { return 'HZSATSIP' } static get aciklama() { return 'Satış Siparişler' } static get vioAdim() { return DRapor_StokSatisSiparisler.vioAdim }
}*/

class DRapor_StokSatislar_Main extends DRapor_Sevkiyat_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_StokSatislar }
	fisVeHareketBagla(e) { super.fisVeHareketBagla(e); const {sent} = e; sent.where.add(`fis.almsat = 'T'`) }
}
class DRapor_StokAlimlar_Main extends DRapor_Sevkiyat_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_StokAlimlar }
	fisVeHareketBagla(e) { super.fisVeHareketBagla(e); const {sent} = e; sent.where.add(`fis.almsat IN ('A', 'M')`) }
}
class DRapor_StokSatisSiparisler_Main extends DRapor_Ticari_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_StokSatisSiparisler }
	loadServerData_queryDuzenle_tekilSonrasi(e) {
		let {stokGenel} = app.params; if (stokGenel.kullanim.transferSiparisi) {
			let {stm, attrSet} = e, uni = stm.sent = stm.sent.asUnionAll();
			let _e = { ...e, stm : new MQStm(), trfSipmi: true }; this.loadServerData_queryDuzenle_tekil(_e); uni.add(_e.stm.sent)
		}
		super.loadServerData_queryDuzenle_tekilSonrasi(e)		/* üstte konsolide için db union all yapılıyor */
	}
	fisVeHareketBagla(e) {
		super.fisVeHareketBagla(e); let {sent, trfSipmi} = e, {shd} = this, sipStPrefix = trfSipmi ? 'st' : 'sip';
		sent.fisHareket(`${sipStPrefix}fis`, `${sipStPrefix}${shd}`);
		if (trfSipmi) { sent.where.add(`fis.gctipi = 'S'`, `fis.ozeltip = 'IR'`, `fis.fisekayrim = ''`) }
		else { sent.where.add(`fis.almsat = 'T'`, `fis.ozeltip = ''`, `fis.onaytipi = ''`) }
	}
}
class DRapor_HizmetSatislar_Main extends DRapor_StokSatislar_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_HizmetSatislar }
}
class DRapor_HizmetAlimlar_Main extends DRapor_StokAlimlar_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_HizmetAlimlar }
}
class DRapor_HizmetSatisSiparisler_Main extends DRapor_StokSatisSiparisler_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_HizmetSatisSiparisler }
}
