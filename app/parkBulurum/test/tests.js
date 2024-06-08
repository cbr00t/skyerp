class ParkBulurum_TestBase extends TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get rootTip() { return ParkBulurum_RunnableBase.rootTip }
	static get DefaultWSHost() { return ParkBulurum_RunnableBase.DefaultWSHost } static get DefaultWSPath() { return ParkBulurum_RunnableBase.DefaultWSPath } static get DefaultLoginTipi() { return ParkBulurum_RunnableBase.DefaultLoginTipi }
	runInternal(e) { super.runInternal(e) /*; const {tip} = this.class; this.callback({ message: 'in test', tip })*/ }
}
class ParkBulurum_Test01 extends ParkBulurum_TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get altTip() { return 'test01' }
	async runInternal(e) { await super.runInternal(e); await this.wsLogin(e); return await this.ajaxCall({ api: 'cihazlar' }) }
}
class ParkBulurum_Test02 extends ParkBulurum_TestBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get altTip() { return 'test02' }
	async runInternal(e) { await super.runInternal(e); return await this.ajaxCall({ api: 'getSessionInfo' }) }
}
