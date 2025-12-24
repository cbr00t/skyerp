class TabDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'tabhar' }
	static get sayacSaha() { return null }
	static get fisSayacSaha() { return 'fisid' }
	static get io2RowAttr() {
		let {_io2RowAttr: result} = this
		if (!result)
			result = this._io2RowAttr = { _text: null, aciklama: 'ekaciklama' }
		return result
	}

	constructor(e = {}) {
		super(e)
		let {class: { io2RowAttr }} = this
		for (let k of keys(io2RowAttr)) {
			let v = e[k]
			if (v != null)
				this[k] = v
		}
	}
	offlineBuildSQLiteQuery({ result: queries }) {
		let {main: db} = app.dbMgr, {table} = this.class
		if (db.hasTable(table)) {
			let cd = db.getColumns(table)
			for (let {rowAttr} of TicIskYapi.getIskIter()) {
				if (!cd[rowAttr])
					queries.push(`ALTER TABLE tabhar ADD ${rowAttr} REAL NOT NULL DEFAULT 0`)
			}
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: '_text', text: 'Tahsilat' }).noSql(),
			new GridKolon({ belirtec: 'bedel', text: 'Net Bedel', genislikCh: 15 }).noSql().tipDecimal_bedel()
		)
	}
	detayEkIslemler({ fis }) { }
	hostVarsDuzenle({ fis, hv }) {
		super.hostVarsDuzenle(...arguments)
		let {class: { io2RowAttr }} = this
		for (let [i, r] of entries(io2RowAttr)) {
			if (r != null)
				hv[r] = this[i] ?? ''
		}
	}
	setValues({ fis, rec }) {
		super.setValues(...arguments)
		let {class: { io2RowAttr }} = this
		for (let [i, r] of entries(io2RowAttr)) {
			if (r == null)
				continue
			let v = rec[r]
			if (v != null)
				this[i] = v
		}
	}

	htmlOlustur(e) {
		this._text = ''
		return this
	}
}
