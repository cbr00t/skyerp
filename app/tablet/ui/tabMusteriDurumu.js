class TabMusteriDurumu extends TabFisListeOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'MUSDUR' } static get sinifAdi() { return 'Müşteri Durumu' }
	static get uygunmu() { return !!app.params?.tablet?.depoMusteriDurumu }
	static get merkezKayitlarAlinirmi() { return true } static get noAutoFocus() { return true }

	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(e)
		extend(args, {
			groupable: true, showGroupsHeader: true,
			groupsExpandedByDefault: true
		})
	}
	static orjBaslikListesi_groupsDuzenle({ liste }) {
		super.orjBaslikListesi_groupsDuzenle(liste)
		liste.push('merkezDurum')
	}
	static gridVeriYuklendi({ sender: gridPart, sender: { gridWidget: w } }) {
		super.gridVeriYuklendi(...arguments)
		let { gonderimTSSaha } = this
		w.beginupdate()
		;['merkezDurum',
			gonderimTSSaha,
			gonderimTSSaha.replace('ts', 'saat')
		].forEach(k =>
			w.hidecolumn(k))
		w.endupdate()

		let { mustKod, ddMust } = gridPart
		if (!mustKod?.trim())
			setTimeout(() => ddMust?.focus(), 100)
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.find(c => c.belirtec == 'sonucText').text = 'B/A Bedel'
		liste.push(new GridKolon({ belirtec: 'merkezDurum', text: 'Merkez Durum' }).noSql())
	}
	static async loadServerDataDogrudan(e = {}) {
		let { gridPart = e.sender, offlineRequest, offlineMode } = e
		let { mustKod } = gridPart
		let hepsimi = mustKod == '*'
		if (!(hepsimi || mustKod?.trim()))
			return []
		if (hepsimi)
			mustKod = gridPart.mustKod = ''
		let recs = await super.loadServerDataDogrudan(...arguments)
		if (!recs)
			return recs
		;recs.forEach(rec => {
			let { merkez } = rec
			let merkezDurumRenk = merkez ? 'royalblue' : 'forestgreen'
			rec.merkezDurum = (
				`<span class="${merkezDurumRenk}">` +
					`${merkez ? '2-Merkezden Gelenler' : '1-Tabletteki Belgeler'}` +
				`</span>`
			)
		})
		return recs
	}
	static rootFormBuilderDuzenle_listeEkrani({ sender: gridPart, rootBuilder: rfb }) {
		let e = arguments[0]
		super.rootFormBuilderDuzenle_listeEkrani(e)
		let { layout, header, islemTuslari } = gridPart
		;{
			let parent = rfb.addForm('header', header)
				.setAltInst(gridPart)
				// .addStyle_wh(null, 130)

			;{
				let mfSinif = app.sutAlimmi ? MQTabMustahsil : MQTabCari
				let { sinifAdi: etiket } = mfSinif
				let form = parent.addFormWithParent().altAlta()
				form.addSimpleComboBox('mustKod', etiket, etiket)
					.etiketGosterim_yok()
					.setMFSinif(mfSinif)
					.degisince(({ type, events, ...rest }) => {
						if (type == 'batch') {
							// inst -> mustKod
							// gridPart.mustKod = events.at(-1).value?.trimEnd()
							setTimeout(() => gridPart.tazele(), 1)    // mustKod sonraki event'de atanacak
						}
					})
					.onAfterRun(({ builder: { part } }) =>
						gridPart.ddMust = part
						// setTimeout(() => part.focus(), 1)
					)
					.addStyle(`$elementCSS { margin: 10px 0 !important}`)
			}
		}
	}

	static ekHTMLDuzenle_sonuc(e) {
		super.ekHTMLDuzenle_sonuc(e)
		let { gridPart = e.sender, rec, id2DetaySayi = {}, result } = e
		let { sol, sag } = result
		let { dvKod, detaySayi, brm } = e
		let { id, fisTipi: tip, sonuc, ba, topMiktar } = rec

		//if (!sonuc)
		//	return super.ekHTMLDuzenle_sonuc(e)
		
		e.noDefault = true
		;[sol, sag].forEach(target =>
			target.push(`&nbsp;`))
		;{
			let alacakmi = ba == 'A'
			let baCSS = alacakmi ? 'alacak' : 'borc'
			let target = alacakmi ? sag : sol
			target.push(`<div class="item bedel ${baCSS}">`)
			if (sonuc) {
				target.push(
					`<span class="asil bold orangered">${bedelToString(sonuc)}</span>`,
					`<span class="ek-bilgi gray">${dvKod}</span>`
				)
			}
			target.push(`</div>`)
		}
	}
}
