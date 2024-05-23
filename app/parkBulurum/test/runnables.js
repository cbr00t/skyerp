class ParkBulurum_RunnableBase extends Runnable {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get rootTip() { return 'parkBulurum'} static get DefaultWSHost() { return 'cloud.vioyazilim.com.tr' }
	static get DefaultWSPath() { return 'parkBulurum' } static get DefaultLoginTipi() { return 'mobilLogin' }
	runInternal(e) { super.runInternal(e) /*; const {tip} = this.class; this.callback({ message: 'in test', tip })*/ }
}
class ParkBulurum_TopluAlanOlustur extends ParkBulurum_RunnableBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altTip() { return 'topluCihazOlustur' }
	static get table() { return 'oparkalani' } static get TestAciklama() { return 'WS-TEST' };
	async runInternal(e) {
		super.runInternal(e); const {iterCount} = this, {table} = this.class, hvListe = [], aciklama = this.class.TestAciklama, parksayisi = 5;
		const sozlesmekod = await app.sqlExecTekilDeger(new MQSent({ top: 1, from: 'takipmst', where: `bkontisibitti = 0`, sahalar: 'kod' }));
		for (let i = 0; i < iterCount; i++) { hvListe.push({ id: newGUID(), sozlesmekod, aciklama, parksayisi }) }
		if (!hvListe?.length) { return null } return await app.sqlExecNone(new MQInsert({ table, hvListe }))
	}
}
class ParkBulurum_TopluAlanSil extends ParkBulurum_RunnableBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altTip() { return 'topluCihazSil' } static get olusturClass() { return ParkBulurum_TopluAlanOlustur }
	runInternal(e) {
		super.runInternal(e); const {olusturClass} = this.class, {table} = olusturClass, aciklama = ParkBulurum_TopluAlanOlustur.TestAciklama;
		return app.sqlExecNone(new MQIliskiliDelete({ from: table, where: [`bdevredisi = 0`, { degerAta: aciklama, saha: 'aciklama' }] }))
	}
}
class ParkBulurum_TopluCihazOlustur extends ParkBulurum_RunnableBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altTip() { return 'topluCihazOlustur' }
	static get table() { return 'ocihaz' } static get TestAciklama() { return 'WS-TEST' };
	async runInternal(e) {
		super.runInternal(e); const {iterCount} = this, {table} = this.class, hvListe = [], aciklama = this.class.TestAciklama;
		const alanid = await app.sqlExecTekilDeger(new MQSent({ top: 1, from: 'oparkalani', where: [`bdevredisi = 0`, { degerAta: ParkBulurum_TopluAlanOlustur.TestAciklama, saha: 'aciklama' }], sahalar: 'id' }));
		for (let i = 0; i < iterCount; i++) { hvListe.push({ id: newGUID(), alanid, aciklama }) }
		if (!hvListe?.length) { return null } return await app.sqlExecNone(new MQInsert({ table: table, hvListe }))
	}
}
class ParkBulurum_TopluCihazSil extends ParkBulurum_RunnableBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altTip() { return 'topluCihazSil' } static get olusturClass() { return ParkBulurum_TopluCihazOlustur }
	runInternal(e) {
		super.runInternal(e); const {olusturClass} = this.class, {table} = olusturClass, aciklama = olusturClass.TestAciklama;
		return app.sqlExecNone(new MQIliskiliDelete({ from: table, where: [`bdevredisi = 0`, { degerAta: aciklama, saha: 'aciklama' }] }))
	}
}
