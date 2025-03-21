class MQSIl extends MQCariIl {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
}
class MQSCari extends MQCari {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
}
class MQSTeslimatci extends MQSCari {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kayitTipi() { return 'KT' }
}
class MQSSevkAdres extends MQSevkAdres {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tanimlanabilirmi() { return true } static get silinebilirmi() { return false }
}
class MQSKLFirma extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get table() { return 'klfirma' } static get tableAlias() { return 'kfir' }
}
class MQSKLFirmaBolge extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get table() { return 'klfirmabolge' } static get tableAlias() { return 'kfirbol' }
}
