class MQVPIl extends MQCariIl {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tumKolonlarGosterilirmi() { return true } static get raporKullanilirmi() { return false }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi && MQLogin.current?.class?.adminmi }
	static get silinebilirmi() { return super.silinebilirmi && MQLogin.current?.class?.adminmi }
}
