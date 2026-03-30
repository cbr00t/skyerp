class TabFisListe extends TabFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get uygunmu() { return true } static get notCacheable() { return true }
	static get araSeviyemi() { return true } static get fisTipi() { return null }
	static get kodListeTipi() { return 'FIS' } static get sinifAdi() { return 'Fiş' }
	static get detaySinif() { return TabFisListeDetay }

	static fisSinifFor(e) {
		let _ = isObject(e) ? e.fisTipi ?? e.fistipi : e
		_ = _?.rec ?? _
		let fisTipi = _?.fisTipi ?? _
		return this.tip2Sinif[fisTipi] ?? null
	}
	static detaySinifFor(e) { return this.fisSinifFor(e)?.detaySinif }
	static async yeniInstOlustur(e = {}) {
		let { gridPart = e.sender, islem, rec, rowIndex, args = {} } = e
		let result = await super.yeniInstOlustur(e)
		islem = e.islem
		if (result != null)
			return result
		
		let { fisTipi } = rec ?? {}
		let { mustKod } = gridPart
		let yenimi = islem == 'yeni'
		if (yenimi) {
			fisTipi = await new Promise(async r => {
				let recs = await MQTabBelgeTipi.loadServerData(e)
				if (recs?.length > 1) {
					await MQTabBelgeTipi.listeEkraniAc({
						secince: ({ value: fisTipi }) => r(fisTipi),
						kapaninca: () => r(null)
					})
				}
				else
					r(recs[0]?.kod)
			}) ?? false
		}
		let fisSinif = fisTipi === false ? false : this.fisSinifFor(fisTipi)
		if (!fisSinif) {
			if (fisSinif === false)
				return null
			throw { rc: 'fisTipi', errorText: 'Fiş Tipi belirlenemedi' }
		}
		let inst = new fisSinif({ ...args })
		if (rec) {
			let _e = { ...e }; delete _e.sayac
			await inst.keySetValues(_e); delete _e.rec
			let { plasiyerkod: plasiyerKod } = rec
			mustKod ||= rec.must
			if (plasiyerKod && !inst.plasiyerKod)
				inst.plasiyerKod = plasiyerKod
			if (mustKod && !inst.mustKod)
				inst.mustKod = mustKod
			if (!yenimi) {
				inst.sayac = rec.sayac
				await inst.yukle(_e)
			}
		}
		return inst
	}
	static async loadServerDataDogrudan({ offlineRequest, offlineMode } = {}) {
		if (!offlineRequest) {
			let cacheClasses = [MQTabStok, MQTabTahsilSekli]
			await Promise.allSettled(cacheClasses.map(_ => _.getGloKod2Rec()))
		}
		let recs = await super.loadServerDataDogrudan(...arguments)
		// recs.reverse()
		return recs
	}
	static async loadServerData_detaylar({ parentRec: { fisTipi } = {}, offlineRequest, offlineMode } = {}) {
		if (offlineRequest)
			return await super.loadServerData_detaylar(...arguments)
		let fisSinif = this.fisSinifFor(fisTipi)
		return fisSinif ? await fisSinif.loadServerData_detaylar(...arguments) : []
	}

	static rootFormBuilderDuzenle_listeEkrani({ sender: gridPart, rootBuilder: rfb }) {
		let e = arguments[0]
		super.rootFormBuilderDuzenle_listeEkrani(e)
		let { layout, header, islemTuslari } = gridPart
		;{
			let parent = rfb.addForm('header', header)
			let ustBilgiForm = parent.addForm('ustBilgi')
				.addStyle_fullWH(null, 35)
				.addCSS('jqx-hidden')
				.addStyle(...[
					`$elementCSS { font-size: 80%; padding: 10px 5px; overflow-y: auto !important }
					 $elementCSS > .item > div { gap: 10px; line-height: 10px }`
				])
				.setLayout(({ builder: fbd }) => {
					let { id } = fbd
					let result = $(`<div class="${id}"></div>`)
					;(async () => {
						let html = await this.getUstBilgiHTML({ ...e, gridPart, rfb, fbd })
						if (html?.html) {
							if (html.children().length) {
								ustBilgiForm.layout.removeClass('jqx-hidden basic-hidden')
								html.appendTo(result)
							}
						}
						else if (html) {
							ustBilgiForm.layout.removeClass('jqx-hidden basic-hidden')
							result.html(html)
						}
					})()
					return result
				})
		}
	}

	static async getUstBilgiHTML(e = {}) {
		let { gridPart = e.sender } = e
		let { mustKod } = gridPart
		let { params: { tablet }, sutAlimmi } = app
		sutAlimmi ||= tablet.sutToplama

		let mustRec = mustKod ? (
			(await MQTabCari.getGloKod2Rec())?.[mustKod] ??
			( sutAlimmi ? (await MQTabMustahsil.getGloKod2Rec())?.[mustKod] : null )
		) : null
		
		let result = []
		if (mustKod) {
			let { aciklama: unvan, yore, iladi: ilAdi } = mustRec
			let { sahismi, vnumara: vkn, tckimlikno: tckn } = mustRec
			let vkno = sahismi ? tckn : vkn
			result.push(...[
				`<div class="mustBilgi item">`,
				`	<div class="flex-row">`,
				`		<div class="adi royalblue">${unvan || ''}</div>`,
				`		<div class="kod lightgray">${mustKod}</div>`,
				`		<div class="yoreVeIl lightgray">${[yore, ilAdi].filter(Boolean).join('/')}</div>`,
		( vkn ? `		<div class="vkno"><span class="lightgray">VKN:</span> <span class="orangered bold">${vkno || ''}</span></div>` : null ),
				`	</div>`,
				`</div>`
			].filter(Boolean))
		}
		result = result.filter(Boolean).join(CrLf)
		return result
	}
}

class TabFisListeDetay extends TabDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

