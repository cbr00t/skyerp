class Ticari_RunnableBase extends Runnable {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get rootTip() { return 'ticari' } static get DefaultWSHost() { return 'localhost' }
	static get DefaultWSPath() { return 'ws/skyERP' } static get DefaultLoginTipi() { return 'login' }
	runInternal(e) { super.runInternal(e) /*; const {tip} = this.class; this.callback({ message: 'in test', tip })*/ }
}
/*class Ticari_Action1 extends Ticari_RunnableBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altTip() { return 'action1' }
	static get table() { return 'stkmst' } static get TestAciklama() { return 'WS-TEST' };
	async runInternal(e) {
		super.runInternal(e); const {iterCount} = this, {table} = this.class, hvListe = [], aciklama = this.class.TestAciklama;
		const sozlesmekod = await app.sqlExecTekilDeger(new MQSent({ top: 1, from: 'takipmst', where: `bkontisibitti = 0`, sahalar: 'kod' }));
		for (let i = 0; i < iterCount; i++) { hvListe.push({ id: i.toString() }) }
		if (!hvListe?.length) { return null } return await app.sqlExecNone(new MQInsert({ table, hvListe }))
	}
}
class Ticari_Action1_Sil extends Ticari_RunnableBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altTip() { return 'xSil' } static get olusturClass() { return Ticari_Action1 }
	runInternal(e) {
		super.runInternal(e); const {olusturClass} = this.class, {table} = olusturClass, aciklama = Ticari_Action1.TestAciklama;
		return app.sqlExecNone(new MQIliskiliDelete({ from: table, where: [`bdevredisi = 0`, { degerAta: aciklama, saha: 'aciklama' }] }))
	}
}*/
