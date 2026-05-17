class TabFiyatGor extends MQMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'FIYATGOR' } static get sinifAdi() { return 'Fiyat Gör' }
	static get uygunmu() { return true } static get noAutoFocus() { return true }
	static get tanimUISinif() { return ModelTanimPart }
	static get seviyeAcKapatKullanilirmi() { return false } static get kolonDuzenlemeYapilirmi() { return false }
	static get offlineGonderYapilirmi() { return false } static get notCacheable() { return true }

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
						if (type == 'batch')
							setTimeout(() => gridPart.tazele(), 1)    // mustKod sonraki event'de atanacak
					})
					.onAfterRun(({ builder: { part } }) =>
						gridPart.ddMust = part
						// setTimeout(() => part.focus(), 1)
					)
					.addStyle(`$elementCSS { margin-top: 5px !important }`)
			}
			;{
				let mfSinif = MQTabStok
				let { sinifAdi: etiket } = mfSinif
				let form = parent.addFormWithParent().altAlta()
				form.addSimpleComboBox('stokKod', etiket, etiket)
					.etiketGosterim_yok()
					.setMFSinif(mfSinif)
					.degisince(({ type, events, ...rest }) => {
						if (type == 'batch')
							setTimeout(() => gridPart.tazele(), 1)    // stokKod sonraki event'de atanacak
					})
					.onAfterRun(({ builder: { part } }) => {
						gridPart.ddStok = part
						setTimeout(() => part.focus(), 100)
					})
					.addStyle(`$elementCSS { margin-top: -5px !important; margin-bottom: 10px !important }`)
			}
		}
	}
	static orjBaslikListesi_argsDuzenle({ sender: gridPart, args }) {
		extend(args, {
			selectionmode: 'none', enableTooltips: false,
			showGroupsHeader: false, rowsHeight: 55
		})
	}
	static ekCSSDuzenle({ dataField: belirtec, rowIndex, value, rec, result }) {
		super.ekCSSDuzenle(...arguments)
		if (belirtec == 'etiket')
			result.push('gray')
		if (belirtec == 'veri') {
			let { tip } = rec
			let negative = isNumber(value) ? value < 0 : value?.includes('>-')
			result.push('bold')
			switch (tip) {
				case 'bedel': {
					result.push(negative ? 'firebrick' : 'royalblue')
					break
				}
				case 'sonStok': {
					result.push(negative ? 'firebrick' : 'forestgreen')
					break
				}
			}
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'etiket', text: ' ', genislikCh: 25 }).checkedList(),
			new GridKolon({ belirtec: 'veri', text: ' ', maxWidth: 500 }).input()
		)
	}
	static async loadServerDataDogrudan({ sender: gridPart, offlineBuildQuery, offlineRequest, offlineMode } = {}) {
		if (offlineBuildQuery || offlineRequest)
			return []

		let { mustKod, stokKod } = gridPart
		if (!stokKod)
			return []
		
		let tarih = today(), { subeKod } = app
		let { [mustKod]: mr = {} } = await MQTabCari.getGloKod2Rec()
		let { [stokKod]: sr = {} } = await MQTabStok.getGloKod2Rec()
		let ksy, kd = {}
		;{
			let stokKodListe = makeArray(stokKod)
			let kapsam = { tarih, subeKod, mustKod }
			try {
				ksy = await SatisKosulYapi.uygunKosullar({ kapsam })
				if (ksy) {
					;['FY', 'SB'].forEach(async tip => {
						let _ = await ksy[tip]?.getAltKosulYapilar(stokKodListe)
						if (!empty(_))
							mergeIntoIfTargetEmpty(_, kd)
					})
				}
			}
			catch (ex) { cerr(ex) }
		}

		let { depomu } = app
		let { alimNetFiyatGosterilir: almNetFiyatGorur, depoSatisFiyatIskonto: iskGorur, depoBedelGorur: bedelGorur } = app.params.tablet ?? {}
		if (!depomu)
			bedelGorur = true
		if (!bedelGorur)
			almNetFiyatGorur = false
		
		let mustText = mr.aciklama || mustKod
		let stokText = sr.aciklama || stokKod
		let { brm } = sr
		let brmFiyat = ( kd?.fiyat ?? kd.ozelfiyat ) || ( sr.brmFiyat ?? sr.fiyat )
		let { almfiyat: almFiyat, almnetfiyat: almNetFiyat } = sr
		let iskOranText = ''
		if (iskGorur && !kd.iskontoYokmu) {
			const Prefix = 'oran'
			let oranlar = []
			for (let [k, v] of entries(kd)) {
				if (v && k.startsWith(prefix))
					oranlar.push(v)
			}
			if (!empty(oranlar))
				oranText = `%${oranlar.join('+')}`
		}

		let recs = [
			{ tip: 'info', etiket: 'ÜRÜN', veri: `<div class="float-left">${stokText}</div>` },
			( bedelGorur && brmFiyat ? { tip: 'bedel', etiket: 'SATIŞ FIYAT', veri: `<div class="float-right">${fiyatToString(brmFiyat)} TL</div>`} : null ),
			( iskGorur && iskOranText ? { tip: 'oran', etiket: 'İSK', veri: `<div class="float-right">${iskOranText}</div>`} : null ),
			( bedelGorur && almFiyat ? { tip: 'bedel', etiket: 'ALIM FİYAT', veri: `<div class="float-right">${fiyatToString(almFiyat)} TL</div>`} : null ),
			( almNetFiyatGorur && almNetFiyat ?
				 { tip: 'bedel', etiket: `ALIM <b class=forestgreen>NET</b> FİYAT`, veri: `<div class="float-right">${fiyatToString(almNetFiyat)} TL</div>`} : null )
		].filter(Boolean)
		
		let uni = new MQUnionAll()
		;{
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent.fromAdd('sonstok son')
				.innerJoin('son', 'stkyer yer', 'son.yerKod = yer.kod')
			wh.degerAta(stokKod, 'son.stokkod')
			sahalar.add(
				'1 oncelik', '1 numerik', '1 miktarmi',
				`'sonStok' tip`, 'yer.aciklama etiket',
				`SUM(son.orjSonMiktar + son.sonMiktar) veri`
			)
			sent.groupByOlustur()
			uni.add(sent)
		}
		if (!empty(uni.liste)) {
			let stm = new MQStm({ sent: uni, orderBy: ['oncelik'] })
			for (let { tip, numerik, miktarmi, etiket, veri } of await stm.execSelect()) {
				veri = numerik
					? `<div class="float-right">${numberToString(veri)}${miktarmi ? ` ${brm}` : ''}</div>`
					: `<div class="float-left">${veri ?? ''}</div>`
				recs.push({ tip, etiket, veri })
			}
		}
		
		return recs
	}
	static async gridVeriYuklendi(e = {}) {
		await super.gridVeriYuklendi(e)
		// let { sender: gridPart } = e
		// let { boundRecs: recs, selectedRec: rec, selectedUid, gridWidget: w } = gridPart
	}
}
