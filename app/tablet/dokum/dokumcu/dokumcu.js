class TabDokumcu extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }

	constructor(e = {}) {
		super(e)
		let {dokumEkranami} = app.params.tablet
		let orjDevice = TabDokumDevice.newDefault()
		let device = orjDevice
		/* Döküm Ekrana ise ve Asıl Device Ekran değilse,
			- Ekran Device kullan
			- UI Yazdır işlemi: this.yazdir(orjDevice) olarak çalışsın
		*/
		if (device && !device.ekranmi) {
			let yazdirIslemi = async (...rest) => {
				await this.yazdir({ ...rest, device: this.orjDevice })
				return true
			}
			device = new TabDokumDevice_Ekran({ yazdirIslemi })
		}
		let yontem = TabDokumYontemi.newDefault()
		extend(this, { device, orjDevice, yontem })
	}
	async yazdir(e = {}) {
		let {device, yontem} = e
		device ??= this.device
		yontem ??= this.yontem
		if (!device)
			throw { isError: true, errorText: 'Tablet Parametrelerinden Döküm Yöntemi seçilmelidir' }
		await device.open(e)
		try { await this._yazdir({ ...e, device, yontem }) }
		finally { await device.close(e) }
		return this
	}
	async _yazdir({ device, yontem, source, data, prefix, postfix, count }) {
		data ??= []
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
		prefix ??= tablet.dokumPrefix
		postfix ??= tablet.dokumPostfix
		if (prefix || postfix) {
			prefix = makeArray(prefix || null)
			postfix = makeArray(postfix || null)
			data = e.data = [...prefix, ...data, ...postfix].filter(Boolean)
		}
		
		data = e.data = await yontem?.dataDuzenle(e)
		count ||= tablet.dokumNushaSayi || 1
		for (let i = 0; i < count; i++)
			await device.write(e)
		
		return true
	}
}
