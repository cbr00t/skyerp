class DRapor_StokSatislar extends DRapor_TicariStok {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'SATIS' } static get kategoriAdi() { return 'Satışlar' }
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
