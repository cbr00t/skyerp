class DRapor_StokAlimlar extends DRapor_TicariStok {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'ALIM' } static get kategoriAdi() { return 'Alımlar' }
	static get altRaporClassPrefix() { return 'DRapor_StokAlimlar' } static get vioAdim() { return 'AL-RCF' }
	static get kod() { return 'STALIM' } static get aciklama() { return 'Alımlar (<span class=royalblue>Stok</span>)' }
}
class DRapor_StokAlimlar_Main extends DRapor_Sevkiyat_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_StokAlimlar }
	fisVeHareketBagla({ sent: { where: wh } }) {
		super.fisVeHareketBagla(...arguments)
		wh.add(`fis.almsat IN ('A', 'M')`)
	}
}

class DRapor_HizmetAlimlar extends DRapor_TicariHizmet {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return DRapor_StokAlimlar.kategoriKod }
	static get kategoriAdi() { return DRapor_StokAlimlar.kategoriAdi }
	static get altRaporClassPrefix() { return 'DRapor_HizmetAlimlar' }
	static get vioAdim() { return DRapor_StokAlimlar_Main.vioAdim }
	static get kod() { return 'HZALIM' } static get aciklama() { return 'Alımlar (<span class=orangered>Hizmet</span>)' }
}
class DRapor_HizmetAlimlar_Main extends DRapor_Sevkiyat_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_HizmetAlimlar }
	fisVeHareketBagla({ sent: { where: wh }}) {
		super.fisVeHareketBagla(...arguments)
		wh.add(`fis.almsat IN ('A', 'M')`)
	}
}
