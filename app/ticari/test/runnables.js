class Ticari_RunnableBase extends Runnable {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get rootTip() { return 'ticari' } static get DefaultWSHost() { return 'localhost' }
	static get DefaultWSPath() { return 'ws/skyERP' } static get DefaultLoginTipi() { return 'login' }
	runInternal(e) { super.runInternal(e) /*; const {tip} = this.class; this.callback({ message: 'in test', tip })*/ }
}
class Ticari_TrnRollbackAll extends Ticari_RunnableBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get altTip() { return 'trnRollbackAll' }
	constructor(e) { e = e || {}; super(e) }
	async runInternal(e) {
		await super.runInternal(e); const {tip} = this.class;
		console.debug('runnable', tip, 'başladı'); let result;
		try {
			await this.wsLogin(e); const id2Trn = await this.ajaxGet({ api: 'sqlTrnList' }); result = [];
			if (id2Trn && Object.keys(id2Trn).length) {
				const promises = []; for (const trnId in id2Trn) { promises.push(this.ajaxGet({ api: 'sqlTrnRollback', args: { trnId } })) }
				result = await Promise.all(promises)
			}
			result = { id2Trn, result }
		}
		catch (ex) { console.error('runnable', tip, getErrorText(ex, this.wsURLBase)) }
		console.debug('runnable', tip, 'bitti'); return result
	}
}
