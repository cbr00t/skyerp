class EIslemQuery_XML extends EIslemQuery_Giden {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get xmlmi() { return true }

	sentEkDuzenle(e) {
		super.sentEkDuzenle(e)
		let { table, sent: orjSent } = e
		let { alias = this.getAlias(table) } = e
		let { harTables = this.getHarTables(table) } = e
		
		if (empty(harTables))
			return

		let liste = e.sent = []
		for (let [tip, harTable] of entries(harTables)) {
			let sent = orjSent.deepCopy()
			sent.innerJoin(alias, `${harTable} har`)
			// ...
			liste.push(sent)
		}
	}
}
