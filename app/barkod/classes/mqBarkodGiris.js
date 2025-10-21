class MQBarkodGiris extends MQCogul {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'BARKOD' } static get sinifAdi() { return 'Barkod Giriş' }
	static get tanimUISinif() { return null } static get secimSinif() { return null }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return true }
	static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get tanimmi() { return false }
	static get localData() { return app.params.localData }
	static get recs() { return this.localData.get(this.kodListeTipi, null, () => []) }
	
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, { uid: new PInstNum('uid'), rowIndex: new PInstNum('boundindex'), barkod: new PInstStr('barkod') })
	}
	static islemTuslariDuzenle_listeEkrani({ sender: gridPart, part: { ekSagButonIdSet }, liste }) {
		let items = [
			{ id: 'export', handler: e => this.kaydetIstendi({ ...arguments[0], ...e }) }
		]
		for (let item of items) {
			liste.push(item)
			ekSagButonIdSet[item.id] = true
		}
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e)
		let {rootBuilder: rfb, sender: gridPart, sender: { layout, header }} = e
		let fbd_header = rfb.addForm('header').setLayout(header)
		fbd_header.addTextInput('barkod', 'Barkod').etiketGosterim_yok()
			.setPlaceHolder('Barkod okutunuz')
			.onAfterRun(({ builder: { input } }) => {
				input.on('keyup', ({ key, currentTarget: target, currentTarget: { value: barkod } }) => {
					key = key?.toLowerCase();
					if (key == 'enter' || key == 'linefeed') {
						this.ekleIstendi({ ...e, input: $(target), barkod })
						target.value = ''; target.focus()
					}
				})
				input.focus()
			})
			.addStyle(`$elementCSS > input { font-size: 120%; font-weight: bold; color: forestgreen; text-align: center; padding: 0 30px }`)
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(new GridKolon({ belirtec: 'barkod', text: 'Barkod' }))
	}
	static loadServerDataDogrudan(e) {
		return this.recs
	}
	static async kaydetIstendi({ sender: gridPart }) {
		let {recs, localData, kodListeTipi: key} = this
		debugger
		// ...
		/*localData.delete(key)
		localData.kaydetDefer()*/
	}
	static async ekleIstendi({ sender: gridPart, barkod }) {
		let e = arguments[0], {sinifAdi: islemAdi} = this
		try {
			await this.onKontrol(e)
			this._lastNotify?.close(); delete this._lastNotify
			return await this.ekle(e)
		}
		catch (ex) {
			let errText = getErrorText(ex)
			if (errText)
				this._lastNotify = notify(errText, islemAdi, 'error')
			throw ex
		}
	}
	static async ekle({ sender: gridPart, barkod }) {
		barkod = barkod?.trim()
		if (!barkod)
			return false
		let {recs, localData} = this
		recs.push({ barkod })
		localData.kaydetDefer()
		gridPart?.tazele()
		return true
	}
	sil({ sender: gridPart }) {
		let {rowIndex, class: { recs, localData }} = this
		if (rowIndex < 0)
			return false
		recs.splice(rowIndex, 1)
		localData.kaydetDefer()
		return true
	}
	static async onKontrol({ input, barkod }) {
		let fail = (focusSelector, errorText) => {
			input?.focus()
			throw { isError: true, errorText }
		}
		if (!barkod)
			fail('barkod')
	}
	alternateKeyHostVarsDuzenle({ hv }) {
		super.alternateKeyHostVarsDuzenle(...arguments)
		let {uid, rowIndex: boundindex, barkod} = this
		$.extend(hv, { uid, boundindex, barkod })
	}
	keySetValues({ rec }) {
		super.keySetValues(...arguments)
		let {uid, boundindex: rowIndex, barkod} = rec
		$.extend(this, { uid, rowIndex, barkod })
	}
}
