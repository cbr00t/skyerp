class TabFisListe extends TabFisListeOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'FIS' } static get sinifAdi() { return 'Fiş' }

	static async loadServerDataDogrudan({ offlineRequest, offlineMode } = {}) {
		let recs = await super.loadServerDataDogrudan(...arguments)
		return recs
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
					`$elementCSS { font-size: 110%; padding: 15px 5px !important; overflow-y: auto !important }
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

		// await super.getUstBilgiHTML(...arguments)
		let result = []
		if (mustKod) {
			let { aciklama: unvan, yore, iladi: ilAdi } = mustRec
			let { sahismi, vnumara: vkn, tckimlikno: tckn } = mustRec
			let vkno = sahismi ? tckn : vkn
			let { [mustKod]: { bakiye } } = await MQTabCariBakiye.getGloKod2Rec()
			let bakiyeRenk = bakiye ? ( bakiye ? 'orangered' : 'forestgreen' ) : '_'

			unvan ??= ''
			
			result.push(...[
				`<div class="mustBilgi item">`,
					`<div class="flex-row">`,
						`<div class="adi bold etiket royalblue">${unvan}</div>`,
						`<div class="kod bold etiket lightgray">${mustKod}</div>`,
						(
							`<div class="yoreVeIl etiket lightgray">` +
								[yore, ilAdi].filter(Boolean).join('/') +
							`</div>`
						),
						( vkn ?
							`<div class="vkno">` +
								 `<span class="etiket lightgray">VKN: </span>` +
								 `<span class="orangered bold">${vkno || ''}</span>` +
							 `</div>`
						: null ),
						(
							`<div class="bakiye">` +
								`<span class="bakiye etiket lightgray">Bak: </span>` +
								`<span class="bakiye veri ${bakiyeRenk} bold">${bakiye ? `${bedelToString(bakiye)} TL` : '-Yok-'}</span>` +
							`</div>`
						),
					`</div>`,
				`</div>`
			].filter(Boolean))
		}
		result = result.filter(Boolean).join(CrLf)
		return result
	}
}
