class TabDokumYontemi extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return null } static get aciklama() { return null }
	static get question() { return null } static get araSeviyemi() { return this == TabDokumYontemi }
	static get defaultKod() { return app.params.tablet?.dokumYontemi?.char ?? '' }
	static get defaultClass() { return this.getClass(this.defaultKod) }
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
		let {defaultKod} = this
		return this.newFor(defaultKod)
	}
	dataDuzenle({ data } = {}) {
		let { darDokum, sayfaBoyut: { x: maxX, y: maxY } = {} } = e.form ?? {}
		
		// POSCommand hariç maxX + boş satır kontrolü
		data = data.map(v => {
			v = v?.trimEnd?.() ?? ' '                         // boş satır gönderilemez, en az bir ch olmalı
			if (!maxX || this.class.isPOSCommand(v))
				return v
			return v.slice(0, maxX)
		})
		
		// maxY kontrolü
		if (maxY && data.length > maxY)
			data = data.slice(0, maxY)
		
		// traşlanmış veri
		return data
	}
	static isPOSCommand(v) {
		if (!v)
			return false
		return (
			( v[0] == '^' || v[0] == '!') ||
			( value.includes('<') && value.includes('>') ) ||
			( value.includes('QR=') || value.includes('QR-') )
		)
	}
}

class TabDokumYontemi_Epson extends TabDokumYontemi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'EPS' } static get aciklama() { return 'Epson' }
	static get question() { return 'epsonmu' }

	dataDuzenle(e = {}) {
		super.dataDuzenle(e)
		let data = super.dataDuzenle(e)
		let { form } = e
		let { tablet } = app.params
		let { darDokum, sayfaBoyut: { y: maxY } = {} } = form ?? {}
		let sinirY = maxY ? Math.max(maxY, data.length) - 1 : null
		let fillLineCount = maxY ? maxY - data.length : 1
		return [
			(darDokum ? '\u000f' : null),
			...data.map((v, i) => v?.trimEnd?.() || ' '),
			' '.repeat(fillLineCount)
		].filter(Boolean)
	}
}

class TabDokumYontemi_ZPL extends TabDokumYontemi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'EPS' } static get aciklama() { return 'Epson' }
	static get question() { return 'epsonmu' }
	static get zplSatirYukseklik() { return 18 }
	static get zplFontSize() { return 9 }
	static get zplFontKod() { return 'A' }
	
	dataDuzenle(e = {}) {
		super.dataDuzenle(e)
		let data = super.dataDuzenle(e)
		let { tablet } = app.params
		let { form, zplSatirYukseklik, zplFontSize, zplFontKod } = e
		let { darDokum, sayfaBoyut: { y: maxY } = {} } = form ?? {}
		zplSatirYukseklik ??= tablet?.zplSatirYukseklik || this.class.zplSatirYukseklik
		zplFontSize ??= tablet?.zplFontSize || this.class.zplFontSize
		zplFontKod ??= tablet?.zplFontKod || this.class.zplFontKod
		let sinirY = maxY ? Math.max(maxY, data.length) - 1 : null
		let x = 10
		return [
			'^XA$\n^A0N',
			(sinirY ? `^LL${(2 + sinirY) * 30}\n` : null),
			...data.map((v, i) => {
				v = v?.trimEnd?.() ?? ''
				if (!v || this.class.isPOSCommand(v))
					return v
				let y = 10 + (i * zplSatirYukseklik)
				let f = zplFontKod, s = zplFontSize
				return `^FO${x},${y}^A${f}N,${s},${s}^FD${v}^FS`
			}),
			'^XZ'
		].filter(Boolean)
	}
}
