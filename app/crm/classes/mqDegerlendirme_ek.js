class MQKapanmayanHesaplar extends MQMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Kapanmayan Hesaplar' }
	static get kodListeTipi() { return 'CRMKAPHES' } static get silinebilirmi() { return false } static get table() { return '' } static tableAlias() { return 'khes' }
	static loadServerData(e) { const {isOfflineMode} = this; return isOfflineMode ? super.loadServerDataDogrudan(e) : this.loadServerDataDogrudan(e) }
	static loadServerDataDogrudan(e) { e = e || {}; const {mustKod} = e; return app.wsTicKapanmayanHesap({ mustKod }) }
}
