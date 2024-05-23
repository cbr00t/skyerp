class ParkBulurum_RunnableBase extends Runnable {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get rootTip() { return 'parkBulurum'} static get DefaultWSHost() { return 'cloud.vioyazilim.com.tr' }
	static get DefaultWSPath() { return 'parkBulurum' } static get DefaultLoginTipi() { return 'mobilLogin' }
	runInternal(e) { super.runInternal(e) /*; const {tip} = this.class; this.callback({ message: 'in test', tip })*/ }
}
class ParkBulurum_TopluCihazOlustur extends Runnable {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altTip() { return 'topluCihazOlustur' } 
	runInternal(e) {
		super.runInternal(e); const {iterCount} = this, hvListe = [];
		for (let i = 0; i < iterCount; i++) { hvListe.push({ id: newGUID() }) }
		if (!hvListe?.length) { return null }
		return new MQInsert({ table: 'ocihaz', hvListe })
	}
}
