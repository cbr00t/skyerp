class DRapor_Satislar extends DRapor_Ticari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'SATISLAR' } static get aciklama() { return 'Satışlar' } }
class DRapor_Satislar_Main extends DRapor_Sevkiyat_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Satislar }
	fisVeHareketBagla(e) { super.fisVeHareketBagla(e); const {sent} = e; sent.where.add(`fis.almsat = 'T'`) }
}

class DRapor_Alimlar extends DRapor_Ticari {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'ALIMLAR' } static get aciklama() { return 'Alımlar' } }
class DRapor_Alimlar_Main extends DRapor_Sevkiyat_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Alimlar }
	fisVeHareketBagla(e) { super.fisVeHareketBagla(e); const {sent} = e; sent.where.add(`fis.almsat IN ('A', 'M')`) }
}

class DRapor_SatisSiparisler extends DRapor_Ticari {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'SATIS_SIPARISLER' } static get aciklama() { return 'Satış Siparişler' } }
class DRapor_SatisSiparisler_Main extends DRapor_Ticari_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_SatisSiparisler }
	fisVeHareketBagla(e) { super.fisVeHareketBagla(e); const {sent} = e; sent.fisHareket('sipfis', 'sipstok'); sent.where.add(`fis.almsat = 'T'`, `fis.ozeltip = ''`, `fis.onaytipi = ''`) }
}
