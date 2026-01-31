class TabDokumDevice extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return null } static get aciklama() { return null }
	static get question() { return null }
	static get araSeviyemi() { return this == TabDokumDevice }
	static get ekranmi() { return false } static get byteBased() { return false }
	static get chunkSize() { return null } static get chunkDelayMS() { return 0 }
	// static get dokumEncoding() { return 'iso-8859-1' }    // trDonusum?.encodingmi => parametrede verilmezse varsayılan encoding değer
	static get trYontem() { return app.params.tablet?.trYontem }
	static get defaultDeviceKod() { return app.params.tablet?.dokumDevice?.char }
	static get defaultDeviceClass() { return this.getClass(this.dokumDeviceKod) }
	static get kod2Sinif() {
		let {_kod2Sinif: result} = this
		if (result == null) {
			result = this._kod2Sinif = fromEntries(
				this.subClasses
					.filter(_ => _.kod && !_.araSeviyemi)
					.map(_ => [_.kod, _])
			)
		}
		return result
	}
	static get kaListe() {
		let {_kaListe: result} = this
		if (result == null) {
			result = this._kaListe =
				entries(this.tip2Sinif)
					.map( ([kod, cls]) => {
						let {aciklama, question} = cls
						return new CKodVeAdi([kod, aciklama, question])
					})
		}
		return result
	}
	static get trYontem_kaListe() {
		let {_trYontem_kaListe: result} = this
		if (!result) {
			result = this._trYontem_kaListe = [
				new CKodVeAdi(['', 'Türkçe Harfler Gönderilir', 'turkcemi']),
				new CKodVeAdi(['TRS', 'Türkçe HARFSİZ olarak Gönderilir', 'turkcesizmi'])
				// new CKodVeAdi(['ENC', 'Karakter Kodlaması Değiştirilir', 'encodingmi'])
			]
		}
		return result
	}
	static get kod2TRYontem() {
		let {_kod2TRYontem: result} = this
		if (!result) {
			result = this._kod2TRYontem = fromEntries(
				this.trYontem_kaListe
					.map(ka => [ka.kod, ka.aciklama])
			)
		}
		return result
	}
	static get trDonusum() {
		let {_trDonusum: result} = this
		if (!result) {
			result = this._trDonusum = {
				'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
				'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U'
			}
		}
		return result
	}
	static get epsonChars() {
		let {epsonChars: result} = this
		if (!result) {
			result = this._epsonChars = [
				new CKodVeAdi({ kod: `\u000f`, aciklama: 'Dar Döküm' }),
				new CKodVeAdi({ kod: `\u0012`, aciklama: 'Geniş Döküm' }),
				new CKodVeAdi({ kod: `\u001bG`, aciklama: 'Koyu Punto' }),
				new CKodVeAdi({ kod: `\u001bH`, aciklama: 'Normal Punto' })
			]
		}
		return result
	}

	constructor(e = {}) {
		super(e)
		let {trYontem, chunkSize, chunkDelayMS} = e
		trYontem ??= this.class.trYontem
		chunkSize ??= this.class.chunkSize
		chunkDelayMS ??= this.class.chunkDelayMS
		extend(this, { trYontem, chunkSize, chunkDelayMS })
	}
	static classFor(tip) { return this.kod2Sinif[tip] }
	static newFor(e) {
		e = isObject(e) ? e : { kod: e }
		let {kod = e.cls} = e
		if (isInstance(kod))
			return kod
		let cls = isClass(kod) ? kod : this.classFor(kod)
		return cls ? new cls(e) : null
	}
	static newDefault(e) {
		let {defaultDeviceKod} = this
		return this.newFor(defaultDeviceKod)
	}
	async open() {
		if (this.opened)
			return this
		this.opened = true
		console.debug(this, 'dokumDevice, open')
		return this
	}
	async close() {
		if (!this.opened)
			return this
		this.opened = false
		console.debug(this, 'dokumDevice, close')
		return this
	}
	async write(data) {
		if (empty(data))
			return this
		let bytes = this.normalizeData(data)
		if (empty(bytes))
			return this
		if (!this.opened)
			await this.open()
		let {chunkSize, chunkDelayMS} = this
		if (!chunkSize || bytes.length <= chunkSize)
			await this.writeChunk(bytes)
		else {
			for (let i = 0; i < bytes.length; i += chunkSize) {
				let chunk = bytes.slice(i, i + chunkSize)
				await this.writeChunk(chunk)
				if (chunkDelayMS)
					await delay(chunkDelayMS)
			}
		}
		return this
	}
	async writeChunk(chunkOrBytes) {
		return this
	}
	normalizeData(data) {
		if (data == null)
			return data    // null veya undefined
		let {byteBased} = this.class
		let isBytes = isBuffer(data)
		if (isBytes && byteBased)
			return data
		
		let str = isArray(data)
			? data.join('')
			: isBytes
				? new TextDecoder().decode(data)
				: data.toString()
		if (!str)
			return str
		
		let {trYontem} = this
		if (trYontem?.turkcesizmi) {
			let {trDonusum} = this
			str = [...str].map(ch => trDonusum[ch] ?? ch).join('')
		}

		// En son format kararı
		// let encoding = trYontem?.encodingmi ? this.dokumEncoding : undefined
		return byteBased ? new TextEncoder().encode(str) : str
			// ? new TextEncoder(encoding).encode(str)
		
	}
	static globalleriSil() {
		deleteKeys(this, '_kod2Sinif', '_kaListe')
		return this
	}
}
