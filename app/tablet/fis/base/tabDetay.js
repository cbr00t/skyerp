class TabDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'tabhar' }
	static get sayacSaha() { return null } static get fisSayacSaha() { return 'fisid' }
	static get io2RowAttr() {
		let cache = TabDetay._io2RowAttr ??= {}
		let key = this.name, result = cache[key]
		if (!result) {
			result = cache[key] = { _html: null }
			this.io2RowAttrOlustur({ result })
		}
		return result
	}
	get html() {
		let result = this._html = this.getHTML()
		return result
	}
	get netBedel() { return this.bedel }
	set netBedel(value) { this.bedel = value }

	constructor(e = {}) {
		super(e)
		let {class: { io2RowAttr }} = this
		for (let k of keys(io2RowAttr)) {
			let v = e[k]
			if (v != null)
				this[k] = v
		}
	}
	static io2RowAttrOlustur({ result }) {
		$.extend(result, { aciklama: 'ekaciklama' })
	}
	offlineBuildSQLiteQuery({ result: queries }) {
		let {main: db} = app.dbMgr, {table} = this.class
		if (db.hasTable(table)) {
			let cd = db.getColumns(table)
			for (let {rowAttr} of TicIskYapi.getIskIter()) {
				if (!cd[rowAttr])
					queries.push(`ALTER TABLE tabhar ADD ${rowAttr} REAL NOT NULL DEFAULT 0;`)
			}
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {bedelKullanilirmi} = TabTicariFis
		liste.push(...[
			new GridKolon({ belirtec: '_html', text: ' ' }).noSql(),
			(bedelKullanilirmi ? new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 11 }).noSql().tipDecimal_bedel() : null)
		].filter(Boolean))
		
	}
	async detayEkIslemler({ fis }) { }
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
	static uiKaydetOncesiIslemler({ fis, eskiInst: eskiFis, parentPart, gridPart, result }) {
		let {detaylar} = fis
		if (empty(detaylar))
			result.push(`Detay girişi yapılmalıdır`)
	}
	async dataDuzgunmuDuzenle({ fis, eskiInst: eskiFis, parentPart, gridPart, result }) { }

	async dokumGetValue({ tip, key } = {}) {
		let e = arguments[0]
		switch (key) {
			case 'stokKod':
			case 'shKod':
				return this.stokKod
			case 'stokAdi':
			case 'shAdi':
				return MQTabStok.getGloKod2Adi(this.stokKod)
			case 'shText':
			case 'stokText':
				return new CKodVeAdi(this.stokKod, MQTabStok.getGloKod2Adi(this.stokKod)).parantezliOzet()
			case 'miktar':
				return this.miktar
			case 'fiyat':
				return this.fiyat
			case 'bedel':
				return this.bedel
			case 'netBedel':
				return this.netBedel
		}
		return null
	}

	getHTML(e) { return null }
	htmlOlustur(e) {
		this.html
		return this
	}
	static globalleriSil(e) {
		super.globalleriSil(e)
		deleteKeys(TabDetay, '_io2RowAttr')
	}
}
