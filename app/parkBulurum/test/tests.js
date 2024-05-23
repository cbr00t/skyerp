class ParkBulurum_TestBase extends TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'parkBulurum-base' }
	static get DefaultWSHost() { return 'cloud.vioyazilim.com.tr' }
	static get DefaultWSPath() { return 'parkBulurum' } static get DefaultLoginTipi() { return 'mobilLogin' }
	runInternal(e) { super.runInternal(e) /*; const {tip} = this.class; this.callback({ message: 'in test', tip })*/ }
}
class ParkBulurum_Test01 extends ParkBulurum_TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'parkBulurum-test01' }
	async runInternal(e) { await super.runInternal(e); await this.wsLogin(e); return await this.ajaxCall({ api: 'cihazlar' }) }
}
class ParkBulurum_Test02 extends ParkBulurum_TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'parkBulurum-test02' }
	async runInternal(e) { await super.runInternal(e); return await this.ajaxCall({ api: 'getSessionInfo' }) }
}
