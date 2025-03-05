class SatisKosul_Fiyat extends SatisKosul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return 'FY' } static get aciklama() { return 'Fiyat' }
	static get table() { return 'fiyliste' } static get detayMustTable() { return 'fiymust' } static get detayTables() { return { stok: 'fiytarife' } }
	getAltKosullar_queryDuzenle({ stm, sent, stokKodListe }) {
		super.getAltKosullar_queryDuzenle(...arguments); const {where: wh, sahalar} = sent, ekClause = 'har.ozelfiyat';
		wh.add(`${ekClause} > 0`); sahalar.add(`${ekClause} fiyat`, 'har.endusukfiyat enDusukFiyat')
	}
}
