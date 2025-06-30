class MQVPAnaBayi extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return true }
	static get kodListeTipi() { return 'ANABAYI' } static get sinifAdi() { return 'Ana Bayi' }
	static get table() { return 'anabayi' } static get tableAlias() { return 'abay' }
	static get tumKolonlarGosterilirmi() { return true } static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi && MQLogin.current?.class?.adminmi }
	static get silinebilirmi() { return super.silinebilirmi && MQLogin.current?.class?.adminmi }
}
class MQVPIl extends MQCariIl {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tumKolonlarGosterilirmi() { return true } static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi && MQLogin.current?.class?.adminmi }
	static get silinebilirmi() { return super.silinebilirmi && MQLogin.current?.class?.adminmi }
}
class MQPSM extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PSM' } static get sinifAdi() { 'Prog/Set/Modül' }
	static get table() { return 'progsetmodul' } static get tableAlias() { return 'psm' }
	static get tumKolonlarGosterilirmi() { return true } static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi && MQLogin.current?.yetkiVarmi('degistir') }
	static get silinebilirmi() { return super.silinebilirmi && MQLogin.current?.class?.adminmi }
}
