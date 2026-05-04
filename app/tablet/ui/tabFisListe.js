class TabFisListe extends TabFisListeOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'FIS' } static get sinifAdi() { return 'Fiş' }

	static listeEkrani_afterRun(e = {}) {
		super.listeEkrani_afterRun(...arguments)
	}
	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		extend(args, { groupsExpandedByDefault: false, enableToolTips: false })
	}
	static orjBaslikListesi_groupsDuzenle({ gridPart = e.sender, liste } = {}) {
		super.orjBaslikListesi_groupsDuzenle(...arguments)
		let { rotaID, _lastGroups, gridWidget: w } = gridPart
		;{
			let belirtec = 'rotaText'
			if (!_lastGroups) {
				let { belirtec2Kolon } = gridPart, { groups } = w
				if (belirtec2Kolon[belirtec] && !groups?.includes(belirtec))
					_lastGroups = [belirtec]
			}
			if (!empty(_lastGroups)) {
				if (rotaID && _lastGroups.includes(belirtec))
					_lastGroups = _lastGroups.filter(_ => _ != belirtec)
				liste.push(..._lastGroups)
			}
		}
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(...arguments)
		e.liste = e.liste.filter(_ => _ != 'rotaText')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let { tablet: { sutToplama } } = app.params
		sutToplama ||= app.sutAlimmi
		if (sutToplama)
			liste.push( new GridKolon({ belirtec: 'rotaText', text: 'Rota' }).noSql() )
	}
	static async loadServerData(e = {}) {
		let { gridPart = e.sender, offlineRequest, offlineMode } = e
		let { gridWidget: w, belirtec2Kolon } = gridPart ?? {}
		let recs = await super.loadServerData(...arguments)
		if (empty(recs))
			return recs

		if (!offlineRequest) {
			let rotaKolonVarmi = !!belirtec2Kolon?.rotaText
			if (rotaKolonVarmi) {
				let rotaID2Adi = fromEntries(
					(await MQTabRota.loadServerData()).map(r =>
						[r.rotaID, r.aciklama])
				)
				;recs.forEach(rec => {
					let { rotaID } = rec
					if (rotaID == '0')
						rotaID = rec.rotaID = null
					let rotaAdi = rotaID2Adi[rotaID]
					rec.rotaText ??= rotaID
						? `<span>${rotaAdi || rotaID}</span>`
						: `<span class="royalblue">[ Rota DIŞI ]</span>`
				})
			}
		}
		
		return recs
	}
	static async gridVeriYuklendi(e = {}) {
		await super.gridVeriYuklendi(e)
		let { sender: gridPart } = e
		let { boundRecs: recs, selectedRec: rec, selectedUid, gridWidget: w } = gridPart
		let { rotaID, belirtec2Kolon, ustBilgiForm } = gridPart
		if (rotaID && belirtec2Kolon.rotaText) {
			try { w.hidecolumn('rotaText') }
			catch (ex) {}
		}
		setTimeout(async () => {
			let { groups } = w
			//try { w[groups.includes('rotaText') ? 'showcolumn' : 'hidecolumn']('rotaText') }
			//catch (ex) { }
			w.focus()
			if (!empty(recs)) {
				selectedUid ??= gridPart._lastUid ?? 0
				if (selectedUid != null) {
					w.clearselection()
					let ind = w.getrowboundindexbyid(selectedUid)
					w.selectrow(ind)
					gridPart.expandGroup(selectedUid)
					w.ensurerowvisible(ind)
				}
			}

			if (ustBilgiForm) {
				let html = await this.getUstBilgiHTML({ ...e, gridPart })
				if (html?.html) {
					if (html.children().length) {
						ustBilgiForm.children.remove()
						ustBilgiForm.removeClass('jqx-hidden basic-hidden')
						html.appendTo(ustBilgiForm)
					}
				}
				else if (html) {
					ustBilgiForm.removeClass('jqx-hidden basic-hidden')
					ustBilgiForm.html(html)
				}
				else
					ustBilgiForm.addClass('jqx-hidden')
			}
		}, 10)
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
					`$elementCSS { font-size: 95%; padding: 13px 10px !important; overflow-y: auto !important }
					 $elementCSS > .item > div { gap: 10px; line-height: 10px }`
				])
				.setLayout(({ builder: { id } }) => 
					$(`<div class="${id}"></div>`))
				.onAfterRun( ({ builder: { layout } }) =>
					gridPart.ustBilgiForm = layout)
		}
	}
	static async getUstBilgiHTML(e = {}) {
		let { gridPart = e.sender } = e
		let { mustKod } = gridPart
		let { params: { tablet }, depomu, sutAlimmi } = app
		sutAlimmi ||= tablet.sutToplama
		
		let bakiyeGosterim = tablet[`${depomu ? 'depo' : 'ss'}MusteriBakiye`] != false
		let mustRec = mustKod ? (
			(await MQTabCari.getGloKod2Rec())?.[mustKod] ??
			( sutAlimmi ? (await MQTabMustahsil.getGloKod2Rec())?.[mustKod] : null )
		) : null

		// await super.getUstBilgiHTML(...arguments)
		let result = []
		if (mustRec) {
			let { aciklama: unvan = '', yore, iladi: ilAdi } = mustRec
			let { sahismi, vnumara: vkn, tckimlikno: tckn } = mustRec
			let vkno = sahismi ? tckn : vkn

			let { [mustKod]: mdr = {} } = await MQTabMusDurum.getGloKod2Rec() ?? {}
			function getMDRRenk(value, ters) {
				 return value
						? ( ( ters ? -value : value ) < 0 ? 'orangered' : 'forestgreen' )
						: '_'
			}
			
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
						( bakiyeGosterim && mdr.bakiye ?
							`<div class="bakiye">` +
								`<span class="etiket lightgray">Bak: </span>` +
								`<span class="veri ${getMDRRenk(mdr.bakiye, true)} bold">${mdr.bakiye ? `${bedelToString(mdr.bakiye)} TL` : '-Yok-'}</span>` +
							`</div>`
						: null ),
						( bakiyeGosterim && mdr.kalanRisk ?
							`<div class="kalanRisk">` +
								`<span class="etiket lightgray">KR: </span>` +
								`<span class="veri ${getMDRRenk(mdr.kalanRisk, false)} bold">${mdr.kalanRisk ? `${bedelToString(mdr.kalanRisk)} TL` : '-Yok-'}</span>` +
							`</div>`
						: null ),
						( bakiyeGosterim && mdr.takipBorcu ?
							`<div class="takipBorc">` +
								`<span class="etiket lightgray">TKP: </span>` +
								`<span class="veri ${getMDRRenk(mdr.takipBorcu, true)} bold">${mdr.takipBorcu ? `${bedelToString(mdr.takipBorcutakipBorcu)} TL` : '-Yok-'}</span>` +
							`</div>`
						: null ),
					`</div>`,
				`</div>`
			].filter(Boolean))
		}
		result = result.filter(Boolean).join(CrLf)
		return result
	}
}
