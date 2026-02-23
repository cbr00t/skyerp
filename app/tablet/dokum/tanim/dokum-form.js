class TabDokumForm extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABMATFORM' } static get sinifAdi() { return 'Tablet Matbuu Form' }
	static get table() { return 'tmatbuu' } static get detaySinif() { return TabDokumFormDetay }
	static get adiKullanilirmi() { return false }
	static get ioKeys() {
		return [
			'nakil', 'darDokum', 'dipYok', 'kolonBaslik', 'sayfaBoyut',
			'dipX', 'otoYBasiSonu', 'tekDetaySatirSayisi',
			'sabit', 'detay', 'oto', '_comment'
		]
	}
	constructor(e = {}) {
		super(e)
		this.setValues({ rec: e })
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments)
		let {ioKeys} = this.class
		;ioKeys.forEach(k =>  {
			let v = this[k]
			if (v)
				hv[k] = v
		})
		let _e = { ...arguments[0], form: this }
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
		let {ioKeys} = this.class
		this.tekDetaySatirSayisi ||= 1
		;['nakil', 'darDokum', 'dipYok', 'kolonBaslik'].forEach(k =>
			this[k] ??= false)
		;['sayfaBoyut', 'otoYBasiSonu'].forEach(k =>
			this[k] ||= {})
		;['sabit', 'detay', 'oto'].forEach(k =>
			this[k] ||= [])
		;ioKeys.forEach(k =>  {
			let v = rec[k]
			if (v != null)
				this[k] = v
		})
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

	async dataDuzenle(e = {}) {
		let { inst = {} } = e
		let { dokumDetaylar = [] } = inst
		let { kolonBaslik, tekDetaySatirSayisi, dipYok, sayfaBoyut: { x: maxX, y: maxY } = {} } = this
		let { sabit, detay: detSahalar, oto } = this
		maxX ??= 0; maxY ??= 0; tekDetaySatirSayisi ??= 1
		sabit ??= []; detSahalar ??= []; oto ??= []
		let y2Sabitler = {}, y2DetaySahalar = {}
		let curY = 1
		for (let s of sabit) {
			/*
				- saha.y varsa =>
					- curY = (curY, saha.y)
				- yoksa =>
					- (curY + 1)'e yazılır (son kaldığı yerin +1 sonrasına)
			*/
			if (s.y)
				curY = Math.max(curY, s.y)
			let y = s.y || ++curY
			;(y2Sabitler[y] ??= []).push(s)
		}
		for (let s of detSahalar)
			(y2DetaySahalar[s.y || 1] ??= []).push(s)
		
		let _e = { ...e, form: this, fis: inst }
		let data = maxY ? new Array(maxY).fill(null) : []
		curY = 1
		
		// sabitler
		_e.tip = 'sabit'
		for (let [y, arr] of entries(y2Sabitler)) {
			arr = arr.filter(s => s.uygunmu)
			if (empty(arr))
				continue
			_e.chars = data[y - 1] ??= new Array(maxX).fill(' ')
			for (let s of arr)
				await s.satirDuzenle(_e)
			curY = Math.max(curY, y)
		}

		if (kolonBaslik) {
			_e.tip = 'cols'
			// ...
			curY += 2
		}

		// detay yBas -> ySon tanım olabilir veya kaldığı yerden
		_e.tip = 'detay'
		for (let det of dokumDetaylar) {
			_e.inst = det
			for (let y of keys(y2DetaySahalar).map(Number).sort()) {
				// y = asInteger(y)
				if (y > tekDetaySatirSayisi)
					break
				let arr = y2DetaySahalar[y].filter(s => s.uygunmu)
				if (empty(arr))
					continue
				let relY = curY + y
				_e.chars = data[relY - 1] ??= new Array(maxX).fill(' ')
				for (let s of arr)
					await s.satirDuzenle(_e)
			}
			curY += tekDetaySatirSayisi
		}

		_e.inst = inst
		if (!dipYok) {
			_e.tip = 'dip'
			// ...
		}

		// maxY varsa sondan ...
		curY++
		_e.tip = 'oto'
		for (let s of oto) {
			if (!s.uygunmu)
				continue
			_e.chars = data[curY - 1] ??= new Array(maxX).fill(' ')
			await s.satirDuzenle(_e)
			curY++
		}

		for (let chars of data) {
			if (!isArray(chars))
				continue
			if (empty(chars))
				chars.push(' ')
			else {
				for (let i = 0; i < chars.length; i++)
					chars[i] ??= ' '
			}
		}
		
		return data
	}
}

class TabDokumFormDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'tmatdetay' }
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
