class TabDokumDevice_Console extends TabDokumDevice {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'CON' } static get aciklama() { return 'Browser Console' }
	static get question() { return 'consolemu' }
	
	async writeChunk(str) {
		await super.writeChunk(str)
		console.info('|', str)
		return this
	}
}

class TabDokumDevice_Ekran extends TabDokumDevice {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'SCR' } static get aciklama() { return 'Ekran' }
	static get question() { return 'ekranmi' } static get ekranmi() { return true }

	constructor({ otoGoster, yazdirIslemi } = {}) {
		super(...arguments)
		otoGoster ??= true
		extend(this, { otoGoster, yazdirIslemi })
	}
	async open(e) {
		await super.open(e)
		this.data = ''
		if (this.otoGoster && !this.part)
			await this.show(e)
	}
	async writeChunk(str) {
		await super.writeChunk(str)
		let {part: { txtData: input } = {}} = this
		this.data ??= ''
		if (str) {
			let data = this.data += str
			if (input?.length)
				input.val(data)
		}
		return this
	}
	async show(e = {}) {
		let {part} = this
		if (!part || part.isDestroyed) {
			let HeaderHeight = 60
			let rfb = new RootFormBuilder().asWindow('Döküm Önizleme').setInst(this)
			rfb
				.addStyle(
					`$elementCSS [data-builder-id = 'data'] > :not(label) {
						font-family: Monospace, Courier New; font-size: 90%
					}
					body:not(.dark-theme) $elementCSS [data-builder-id = 'data'] > :not(label) {
						color: forestgreen !important; background-color: #333 !important
					}`
				)
				.onAfterRun(({ builder: { part } }) =>
					this.part = part)
			let fbd_islemTuslari = rfb.addIslemTuslari('islemTuslari', 'yazdirVazgec')
				.etiketGosterim_yok()
				.addStyle_fullWH(null, HeaderHeight)
				.setId2Handler({
					yazdir: async () => {
						let device = this, {data, part, yazdirIslemi} = this
						if (!data)
							return false
						yazdirIslemi ??= ({ device, data }) => {
							TabDokumDevice.newDefault(device)
						}
						let result = await yazdirIslemi?.call(this, { device, data })
						if (!result)
							return false
						part?.close()
						return true
					},
					vazgec: () =>
						this.part?.close()
				})
			rfb.addTextArea('data')
				.setCols(10000)
				.addStyle_fullWH(null, `calc(var(--full) - ${HeaderHeight}px)`)
				.etiketGosterim_yok()
				// .readOnly()
				.degisince( ({ builder: { inst, input } }) =>
					inst.data = input.val())
				.onAfterRun( ({ builder: { rootPart, inst, input } }) => {
					rootPart.txtData = input
					setTimeout(() => input.focus(), 500)
				})
			await rfb.run()
		}
		return this
	}
}

class TabDokumDevice_SerialPort extends TabDokumDevice {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'SER' } static get aciklama() { return 'Seri Port' }
	static get question() { return 'serialmi' } static get byteBased() { return true }
	static get chunkSize() { return 15 } static get chunkDelayMS() { return 5 }
	
	async open(e) {
		await super.open(e)
		return this
	}
	async close(e) {
		await super.close(e)
		return this
	}
	async writeChunk(bytes) {
		await super.writeChunk(bytes)
		return this
	}
}

class TabDokumDevice_HrefBased extends TabDokumDevice {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return super.araSeviyemi || this == TabDokumDevice_HrefBased }

	async open(e) {
		await super.open(e)
		this.data = ''
		return this
	}
	async writeChunk(str) {
		if (str)
			this.data += str
		return this
	}
	async close(e) {
		await super.close(e)
		let {data} = this
		this.encodedData = data ? encodeURI(data).replaceAll(':', '%3A') : ''
		return this
	}
}
class TabDokumDevice_QuickPrinter extends TabDokumDevice_HrefBased {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'QP' } static get aciklama() { return 'Quick Printer' }
	static get question() { return 'quickPrintermi' }
	async close(e) {
		await super.close(e)
		let {encodedData: data} = this
		let url = `intent://${data}#Intent;scheme=quickprinter;package=pe.diegoveloper.printerserverapp;end;`
		// url = `quickprinter://${data}`
		let wnd
		try { wnd = openNewWindow(url) }
		catch (ex) { cerr(ex) }
		if (!wnd)
			location.href = url
		return this
	}
}
