class ParkBulurum_TestBase extends TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'parkBulurum-base' }
	static get DefaultWSPath() { return 'parkBulurum' } static get DefaultLoginTipi() { return 'mobilLogin' }
	runTest(e) { super.runTest(e) /*; const {tip} = this.class; this.callback({ message: 'in test', tip })*/ }
}
class ParkBulurum_Test01 extends ParkBulurum_TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'parkBulurum-test01' }
	async runTest(e) { await super.runTest(e); await this.wsLogin(e); return await this.ajaxCall({ api: 'cihazlar' }) }
}
class ParkBulurum_Test02 extends ParkBulurum_TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'parkBulurum-test02' }
	async runTest(e) { await super.runTest(e); return await this.ajaxCall({ api: 'getSessionInfo' }) }
}
