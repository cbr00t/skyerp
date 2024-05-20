class MQSutRota extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Süt Rotaları' } static get tableAlias() { return 'rot' }
	static loadServerDataDogrudan(e) { return app.sqlExecSP('sut_rotalari') }
}
class MQSutSira extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Süt Sıraları' } static get tableAlias() { return 'sira' }
	static get maxSayi() { return 3 }
	static loadServerDataDogrudan(e) { return app.sqlExecSP('sut_siralari') }
}
