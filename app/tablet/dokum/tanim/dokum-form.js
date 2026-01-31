class TabDokumForm extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABMATFORM' } static get sinifAdi() { return 'Tablet Matbuu Form' }
	static get adiKullanilirmi() { return false }

	constructor(e = {}) {
		super(e)
		this.setValues({ rec: e })
	}
	hostVarsDuzenle({ hv }) {
		let e = arguments[0]
		super.hostVarsDuzenle(e)
		let keys = [
			'nakil', 'darDokum', 'dipYok', 'kolonBaslik', 'sayfaBoyut',
			'dipX', 'otoYBasiSonu', 'tekDetaySatirSayisi', 'sabit', 'detay', 'oto',
			'_comment'
		]
		;keys.forEach(k =>  {
			let v = this[k]
			if (v)
				hv[k] = v
		})
		let _e = { ...e, form: this }
		for (let k of ['sabit', 'detay', 'oto']) {
			let arr = hv[k]
			if (!isArray(arr))
				arr = isPlainObject(arr) ? values(arr) : arr ? makeArray(arr) : null
			if (empty(arr))
				continue
			hv[k] = arr = arr
				.filter(Boolean)
				.map(v => v.hostVars?.(_e) ?? v)
		}
	}
	setValues({ rec }) {
		super.setValues(...arguments)
		extend(this, {
			nakil: false, darDokum: false,
			dipYok: false, kolonBaslik: false,
			sayfaBoyut: {}, otoYBasiSonu: {},
			dipX: 0, tekDetaySatirSayisi: 1,
			sabit: [], detay: [], oto: [],
			_comment: null
		})
		;['sayfaBoyut', 'otoYBasiSonu'].forEach(k =>
			this[k] ||= {})
		for (let [k, v] of entries(rec)) {
			if (v != null && this[k] !== undefined)    // değer var ve inst var karşılığı da varsa
				this[k] = v
		}
		for (let k of ['sabit', 'detay', 'oto']) {
			let arr = this[k]
			if (empty(arr))
				continue
			// pos.X dolu olan ve (key veya text) en az biri dolu olanı al
			arr = this[k] = arr
				.map(v => isPlainObject(v) ? new TabDokumSaha(v) : v)
				.filter(({ key, text, x }) => x && (key || text))
		}
	}
}


/*
({
	nakil: false, tekDetaySatirSayisi: 2, dipYok: false,
	sayfaBoyut: { x: 60, y: 58 },
	otoYBasiSonu: { x: 17, y: 52 },
	sabit: [
		{ key: 'fisTipText', pos: { x: 5, y: 2 }, length: 19 },
		{ text: '[islemTarih] [islemZaman]', pos: { x: 40, y: 5 }, _comment: '(pos.X = 0) => text length ne ise aynen yazılır, kırpmadan' },
		{ key: 'islemZaman', pos: { x: 48, y: 6 }, _comment: '(pos.X = 0) => text length ne ise aynen yazılır, kırpmadan' },
		{ key: 'yildizlimiText', pos: { x: 1, y: 0 }, length: 5, _comment: '(Y = 0) ==> Cursor ın kaldığı Y pozisyonundan devam et' },
		{ key: 'tahsilatSekliText', pos: { x: 0, y: 0 }, _comment: '(X = 0) => Bu bilgi yazılmaz | (Y = 0) ==> Cursor ın kaldığı Y pozisyonundan devam et' },
		{ text: 'SAYIN [mustUnvan],', pos: { x: 1, y: 8 }, length: 55 },
		{ text: '[vergiDairesi] [vergiNo]', pos: { x: 5, y: 9 }, length: 40 },
		{ text: '** BİLGİ FİŞİ **', pos: { x: 5, y: -1 }, length: 50, kosul: { ozelIsaret: '*', iade: false }, _comment: '(Y = -1) => Bittiği yer veya Sayfa Boyutu Y ye göre tersten relative satır no' }
	],
	detay: [
		{ key: 'barkod', pos: { x: 2, y: 1 }, length: 15 },
		{ key: 'stokAdi', pos: { x: 18, y: 1 }, length: 40 },
		{ key: 'miktar', pos: { x: 5, y: 2 }, length: 8, right: true },
		{ key: 'brm', pos: { x: 15, y: 2 }, length: 4, right: true },
		{ key: 'fiyat', pos: { x: 21, y: 2 }, length: 10, right: true },
		{ key: 'netBedel', pos: { x: 33, y: 2 }, length: 13, right: true }
	]
})
*/
