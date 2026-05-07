class TabRapor extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return this.kod ?? 'RAPOR' }
	static get sinifAdi() { return this.aciklama ?? 'Raporlar' }
	static get kod() { return null } static get aciklama() { return null }
	static get uygunmu() { return config.dev }
	static get araSeviyemi() { return this == TabRapor }
	static get tanimlanabilirmi() { return false } static get degistirilebilirmi() { return true }
	static get silinebilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get seviyeAcKapatKullanilirmi() { return false } static get gridIslemTuslariKullanilirmi() { return false }
	static get offlineGonderYapilirmi() { return false }
	static get kaDict() {
		let { _kaDict: result } = this
		if (result == null) {
			let { subClasses } = this
			result = this._kaDict = fromEntries(
				subClasses
					.filter(c => c?.uygunmu && !c.araSeviyemi)
					.map(ekBilgi => {
						let { kod, aciklama } = ekBilgi
						return [
							kod,
							new CKodAdiVeEkBilgi({ kod, aciklama, ekBilgi })
						]
					})
			)
		}
		return result
	}
	static get kod2Sinif() {
		let { _kod2Sinif: result } = this
		if (result == null) {
			let { kaDict } = this
			result = this._kod2Sinif = fromEntries(
				values(kaDict).map(ka => [ka.kod, ka.ekBilgi])
			)
		}
		return result
	}

	static islemTuslariDuzenle_listeEkrani({ liste, part }) {
		super.islemTuslariDuzenle_listeEkrani(...arguments)
		liste.find(_ => _.id == 'degistir').id = 'izle'
		extend(part.ekSagButonIdSet ??= {}, asSet(['degistir', 'izle']))
	}
	static loadServerDataDogrudan({ offlineBuildQuery, offlineRequest, offlineMode } = {}) {
		if (offlineBuildQuery || offlineRequest)
			return []
		return values(this.kaDict)
	}
	static yeniInstOlustur(e = {}) {
		e.islem = 'izle'
		let { kod } = e.rec ?? {}
		let mfSinif = this.kod2Sinif[kod]
		return mfSinif ? super.yeniInstOlustur({ ...e, mfSinif }) : null
	}
	yukle(e) { return !!this.kod }

	static rootFormBuilderDuzenle_islemTuslari({ fbd_islemTuslari: fbd }) {
		super.rootFormBuilderDuzenle_islemTuslari(...arguments)
		fbd.addStyle(`$elementCSS > div #tazele { margin-left: 20px }`)
	}
	static tanimPart_islemTuslariDuzenle(e) {
		super.tanimPart_islemTuslariDuzenle(...arguments)
		let { parentPart: tanimPart, part, liste, inst } = e
		e.tanimPart = tanimPart
		let items = [
			{
				id: 'menu', text: '...', handler: async _e => {
					_e = { ...e, ..._e }
					try {
						let args = await this.getTanimPartMenuArgs(_e)
						if (args) {
							let { inst, inst: parentRec } = tanimPart
							extend(_e, { inst, parentRec, ...args })
							MFListeOrtakPart.openContextMenu(_e)
						}
					}
					catch (ex) { cerr(ex); throw ex }
				}
			},
			{
				id: 'yazdir', handler: async _e => {
					let { inst } = tanimPart
					try { return inst.yazdir({ ...e, ..._e }) }
					catch (ex) { cerr(ex); throw ex }
				}
			},
			{
				id: 'tazele', handler: async _e => {
					let { inst } = tanimPart
					try { return inst.tazele({ ...e, ..._e }) }
					catch (ex) { cerr(ex); throw ex }
				}
			}
		]
		let set = part.ekSagButonIdSet ??= {}
		if (items.length) {
			liste.unshift(...items)
			extend(set, asSet(items.map(_ => _.id)))
		}
	}
	static async rootFormBuilderDuzenle(e = {}) {
		let { inst } = e
		await inst.rootFormBuilderDuzenle(e)
	}
	async rootFormBuilderDuzenle(e) {
		let { tanimPart = e.sender, tanimFormBuilder: tanimForm } = e
		e.tanimPart = tanimPart
		let ustBilgiLines = this.getUstBilgi(e)?.filter(_ => _ != null)
		let ustBilgiVarmi = !empty(ustBilgiLines)
		let ustBilgiHeight = ustBilgiVarmi ? 65 : 0
		if (ustBilgiVarmi) {
			tanimForm.addTextArea('ustBilgi').etiketGosterim_yok()
				.addStyle_fullWH(null, ustBilgiHeight)
				.addCSS('bg-ghostwhite')
				.readOnly()
				.setValue(ustBilgiLines.join('\n'))
				.onAfterRun(({ builder: fbd }) => tanimPart.fbd_ustBilgi = fbd)
		}
		tanimForm.addGridliGosterici('grid').etiketGosterim_yok()
			.addStyle_fullWH(null, `calc(var(--full) - (${ustBilgiHeight + 10}px))`)
			.setTabloKolonlari(_e => this.getTabloKolonlari({ ...e, ..._e }))
			.setSource(_e => this.getSource({ ...e, ..._e }))
			.onAfterRun(({ builder: { part } }) => tanimPart.gridPart = part)
	}
	tazele(e = {}) {
		let { tanimPart } = e
		let { gridPart } = tanimPart
		gridPart?.tazele(e)
		return this
	}
	async yazdir(e = {}) {
		let { tanimPart } = e
		let { gridPart } = tanimPart
		let { duzKolonTanimlari: colDefs } = gridPart
		colDefs = colDefs.filter(c => !c.isHidden)
		if (empty(colDefs))
			return null
		
		let { boundRecs: recs } = gridPart
		if (empty(recs))
			return null

		let { tablet: { dokumEkrana, dokumPrefix } = {} } = app.params
		let prefix = await this.getUstBilgi(e)
		let darDokum = true, kolonBaslik = true, tekDetaySatirSayisi = 2
		let sayfaBoyut = { x: 55 },  otoYBasiSonu = { basi: 5 }

		let detay = []
		; {
			let x = 1, y = 1
			for (let cd of colDefs) {
				let { belirtec: key, text, genislikCh: length, tip: { class: tipSinif } = {}, userData: ud } = cd
				let { mfbmi: right } = tipSinif
				let { dokumSaha: d } = ud ?? {}
				d ??= {}
				key = d.key ||= key
				if (key[0] == '_')
					continue
				length = d.length ??= length || 18
				right = d.right ??= right
				if (!(key || text))
					continue

				d.pos = { x, y }
				x += length + 1
				if (x >= sayfaBoyut.x) {
					x = 1
					y++
				}
				if (y > tekDetaySatirSayisi)
					continue
				
				let s = new TabDokumSaha(d)
				detay.push(s)
			}
		}
		
		/*let curY = 1
		let sabit = [ ]
		// let curY = max(...sabit.map(s => s.y || 0), 1)
		// curY += 1 + ( recs.length * tekDetaySatirSayisi )*/

		let oto = [
			new TabDokumSaha({ key: 'dip', x: 1 })
		]
		let form = ( await TabStokFis.instance.getDokumForm() ) ?? new TabDokumForm()
		let defaults = {
			darDokum, kolonBaslik, tekDetaySatirSayisi,
			sayfaBoyut, otoYBasiSonu, detay, oto
		}
		mergeIntoIfTargetEmpty(defaults, form)
		if (isPlainObject(form))
			form = new TabDokumForm(form)

		let device = TabDokumDevice.newDefault(e)
		let yontem = TabDokumYontemi.newDefault()
		let dokumcu = new TabDokumcu()
			.setSource(form).setDevice(device)
			.setYontem(yontem)
		if (dokumEkrana)
			dokumcu.ekrana()
		prefix ||= []
		if (!empty(dokumPrefix))
			prefix = empty(prefix) ? dokumPrefix : dokumPrefix.concat(prefix)
		if (prefix)
			dokumcu.setPrefix(prefix.concat(['', '']))
		
		let inst = {
			dokumDetaylar: recs,
			dokumGetValue: (...args) =>
				this.dokumGetValue(...args)
		}
		return await dokumcu.yazdir({ inst })
	}
	dokumGetColText({ key }) {
		return null
	}
	async dokumGetValue({ tip, key } = {}) {
		let e = arguments[0]
		if (tip == 'cols')
			return await this.dokumGetColText(...arguments)
		return null
	}

	static getTanimPartMenuItems(e = {}) {
		super.getTanimPartMenuItems(e)
		let { tanimPart = e.sender } = e
		e.tanimPart = tanimPart
		return [
			{
				id: 'yazdir', text: 'Yazdır',
				handler: _e => {
					tanimPart.inst.yazdir({ ...e, ..._e })
					_e.close?.()
				}
			}
		]
	}
	getUstBilgi(e) { return [] }
	getTabloKolonlari(e) { return [] }
	async getSource(e) { return [] }
}
