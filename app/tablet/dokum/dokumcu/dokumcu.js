class TabDokumcu extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }

	constructor(e = {}) {
		super(e)
		let {tablet = {}} = app.params
		let {dokumEkranami = e.dokumEkrana ?? this.dokumEkranami, device: orjDevice = this.device, yontem = this.yontem} = e
		dokumEkranami ??= tablet.dokumEkranami ?? tablet.dokumEkrana
		orjDevice ??= TabDokumDevice.newDefault()
		yontem ??= TabDokumYontemi.newDefault()
		extend(this, { orjDevice, device: orjDevice, yontem, dokumEkranami })
	}
	async yazdir(e = {}) {
		let {orjDevice, device, yontem, dokumEkranami = e.dokumEkrana} = e
		device ??= this.device
		orjDevice ??= device
		yontem ??= this.yontem
		dokumEkranami ??= this.dokumEkranami

		/* Döküm Ekrana ise ve Asıl Device Ekran değilse,
			- Ekran Device kullan
			- UI Yazdır işlemi: this.yazdir(orjDevice) olarak çalışsın
		*/
		if (dokumEkranami && !device?.ekranmi) {
			let yazdirIslemi = async e => {
				await this.yazdir({ ...e, device: orjDevice, dokumEkranami: false })
				return true
			}
			device = new TabDokumDevice_Ekran({ yazdirIslemi })
		}
		
		if (!device)
			throw { isError: true, errorText: 'Tablet Parametrelerinden Döküm Yöntemi seçilmelidir' }
		await device.open(e)
		try { await this._yazdir({ ...e, device, yontem }) }
		finally { await device.close(e) }
		return this
	}
	async _yazdir({ device, yontem, source, data, prefix, postfix, count }) {
		source ??= this.source
		data ??= this.data ?? []
		let e = { ...arguments[0], data }
		data = e.data = source?.dataDuzenle
			? await source.dataDuzenle(e)
			: isFunction(source)
				? await source.call(this, e)
				: source
		
		// data: string / string[] / TabDokumForm
		data = e.data = makeArray(data)
		if (empty(data))
			return false

		data = data.map(l =>
			l?.join?.('') ?? l ?? '')

		let {tablet} = app.params
		count ??= this.nushaSayi ?? tablet.dokumNushaSayi
		count ||= 1
		prefix ??= this.prefix ?? tablet.dokumPrefix
		postfix ??= this.postfix ?? tablet.dokumPostfix
		if (prefix || postfix) {
			prefix = makeArray(prefix || null)
			postfix = makeArray(postfix || null)
			data = e.data = [...prefix, ...data, ...postfix].filter(Boolean)
		}
		
		data = e.data = await yontem?.dataDuzenle(e)
		for (let i = 0; i < count; i++)
			await device.write(data)
		
		return true
	}

	epson(e) { this.yontem = new TabDokumYontemi_Epson(e); return this }
	zpl(e) { this.yontem = new TabDokumYontemi_ZPL(e); return this }
	ekrana() { this.dokumEkranami = true; return this }
	yaziciya() { this.dokumEkranami = false; return this }
	setSource(value) { this.source = value; return this }
	setDevice(value) { this.device = value; return this }
	setCount(value) { this.count = value; return this }
	setPrefix(value) { this.prefix = value; return this }
	setPostfix(value) { this.postfix = value; return this }
}



/*


let bedelX = 33
let data = ({
	nakil: false, tekDetaySatirSayisi: 2,
	dipYok: false, dipX: bedelX - 20,
	sayfaBoyut: { x: 60, y: 58 },
	otoYBasiSonu: { x: 17, y: 52 },
	sabit: [
		{ text: '[!FUNC(e => (2 + 3))] [!FUNC( ({ inst: { fisNo } }) => `FIS: ${fisNo}` )]', x: 5, y: 1 },
		{ key: 'fisTipText', pos: { x: 5, y: 2 }, length: 19 },
		{ text: '[islemTarih] [islemZaman]', pos: { x: 40, y: 5 }, _comment: '(pos.X = 0) => text length ne ise aynen yazılır, kırpmadan' },
		{ key: 'islemZaman', pos: { x: 48, y: 6 }, _comment: '(pos.X = 0) => text length ne ise aynen yazılır, kırpmadan' },
		{ key: 'yildizlimiText', pos: { x: 1, y: 0 }, length: 5, _comment: '(Y = 0) ==> Cursor ın kaldığı Y pozisyonundan devam et' },
		{ key: 'tahsilatSekliText', pos: { x: 0, y: 0 }, _comment: '(X = 0) => Bu bilgi yazılmaz | (Y = 0) ==> Cursor ın kaldığı Y pozisyonundan devam et' },
		{ text: 'SAYIN [mustUnvan],', pos: { x: 1, y: 8 }, length: 55 },
		{ text: '[vergiDairesi] [vergiNo]', pos: { x: 5, y: 9 }, length: 40 },
		{ text: '** BİLGİ FİŞİ **', pos: { x: 5, y: -1 }, length: 50, ozelIsaret: true, iade: false, _comment: '(Y = -1) => Bittiği yer veya Sayfa Boyutu Y ye göre tersten relative satır no' }
	],
	detay: [
		{ key: 'barkod', pos: { x: 2, y: 1 }, length: 15 },
		{ key: 'stokAdi', pos: { x: 18, y: 1 }, length: 40 },
		{ key: 'miktar', pos: { x: 5, y: 2 }, length: 8, right: true },
		{ key: 'brm', pos: { x: 15, y: 2 }, length: 4, right: true },
		{ key: 'fiyat', pos: { x: 21, y: 2 }, length: 10, right: true },
		{ key: 'netBedel', pos: { x: bedelX, y: 2 }, length: 13, right: true }
	],
	oto: [
		{ key: 'tahsilText', x: 2 },
		{ key: 'miktarText', x: 2 },
		{ key: 'yalnizText', x: 5 },
		{ key: 'bakiyeText', _comment: 'gizli' },
		{ key: 'notlar', _comment: 'gizli' }
	]
})

let source = new TabDokumForm(data)
//let source = ({ tip, key, ...rest }) => {
//	console.info('get source', tip, key, ...rest)
//	return key
//}
let dokumcu = new TabDokumcu()
	.setSource(source)
	.setDevice(new TabDokumDevice_Console())
	.epson().yaziciya()
	//.ekrana()
let {inst} = app.activeWndPart
let {detaySinif} = inst.class
inst.addDetay(new detaySinif({ stokKod: 'A', miktar: 1 }))
inst.addDetay(new detaySinif({ stokKod: 'B', miktar: 2 }))
inst.addDetay(new detaySinif({ stokKod: 'c', miktar: 3.5 }))
await dokumcu.yazdir({ inst })


*/

