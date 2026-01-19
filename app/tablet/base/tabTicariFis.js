class TabTicariFis extends TabTSFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return super.araSeviyemi || this == TabTicariFis }
	static get kodListeTipi() { return 'TABTIC' } static get sinifAdi() { return 'Ticari' }
	static get detaySinif() { return TabTicariDetay }
	// static get onlineFisSinif() { return SatisFaturaFis }
	static get dipKullanilirmi() { return true } static get _bedelKullanilirmi() { return true }
	static get dipIskOranSayi() { return 1 } static get dipIskBedelSayi() { return 1 }
	static get iademi() { return false } static get siparismi() { return false }
	static get faturami() { return false } static get irsaliyemi() { return false }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, { sevkYerKod: new PInstStr('sevkyerkod') })
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments)
		let {_dipIslemci: d} = this
		for (let k of ['dipIskOran1', 'dipIskOran2', 'dipIskBedel'])
			hv[k.toLowerCase()] = d?.[k] ?? 0
	}
	setValues({ rec }) {
		super.setValues(...arguments)
		let {dipIslemci} = this
		for (let k of ['dipIskOran1', 'dipIskOran2', 'dipIskBedel'])
			dipIslemci[k] = rec[k.toLowerCase()] ?? 0
	}
	/*dipGridSatirlariDuzenle_ticari({ dipIslemci, liste }) {
		let e = arguments[0]
		super.dipGridSatirlariDuzenle_ticari(e)
		let {dipIskOranSayi, dipIskBedelSayi} = this.class
		for (let seq = 1; seq <= dipIskOranSayi; seq++)
			liste.push(new DipSatir_IskOran({ ...e, seq }))
		for (let seq = 1; seq <= dipIskBedelSayi; seq++)
			liste.push(new DipSatir_IskBedel({ ...e, seq }))
		let {offsetRefs: refs} = dipIslemci
		refs.kdv = liste[liste.length - 1]
	}*/
	async topluHesapla(e = {}) {
		let {kosulYapilar, detaylar} = this
		let {tanimPart = e.sender ?? {}} = e
		let {gridPart: { gridWidget: w } = {}} = tanimPart
		if (kosulYapilar && !empty(detaylar)) {
			let kod2Detaylar = {}
			detaylar.forEach(det => {
				let {stokKod: kod} = det
				; (kod2Detaylar[kod] ??= []).push(det)
			})
			let kodListe = keys(kod2Detaylar)
			{
				let {FY: kosullar} = kosulYapilar
				if (!empty(kosullar))
				for (let k of kosullar) {
					let kod2Rec = await k.getAltKosulYapilar(kodListe)
					for (let [kod, rec] of entries(kod2Rec)) {
						let {fiyat = rec.ozelfiyat, iskontoYokmu} = rec
						if (!fiyat)
							continue
						let subDetListe = kod2Detaylar[kod]
						if (empty(subDetListe))
							continue
						subDetListe
							.filter(_ => !_.ozelFiyat)
							.forEach(det => {
								$.extend(det, { fiyatKosulKod: kod, ozelFiyat: true, fiyat })
								if (iskontoYokmu)                                                  // isk hesaplanmaması için flag set
									det.ozelIsk = true
								det.bedelHesapla().htmlOlustur()
								w?.updaterow(det.uid, det)
							})
					}
				}
			}
			{
				let {SB: kosullar} = kosulYapilar
				if (!empty(kosullar))
				for (let k of kosullar) {
					let kod2Rec = await k.getAltKosulYapilar(kodListe)
					for (let [kod, rec] of entries(kod2Rec)) {
						let {oran1: iskOran1} = rec
						if (!iskOran1)
							continue
						let subDetListe = kod2Detaylar[kod]
						if (empty(subDetListe))
							continue
						subDetListe
							.filter(_ => !_.ozelIsk)
							.forEach(det => {
								$.extend(det, { iskKosulKod: kod, ozelIsk: true, iskOran1 })
								det.bedelHesapla().htmlOlustur()
								w?.updaterow(det.uid, det)
							})
					}
				}
			}
		}
		await super.topluHesapla(e)
		return this
	}
	async uiGirisOncesiIslemler({ islem }) {
		let {detaylar} = this
		if (islem == 'degistir' || islem == 'sil') {
			detaylar.forEach(det =>
				det.ozelFiyat = det.ozelIsk = det.ozelPro = true)
		}
		await super.uiGirisOncesiIslemler(...arguments)
	}
	async satisKosullariReset(e = {}) {
		await super.satisKosullariReset(e)
		let {tanimPart = e.sender} = e
		let {acc, gridPart, gridWidget: w} = tanimPart ?? {}
		let fis = this, {detaylar} = this
		let promises = [], _e = { ...e, fis }
		for (let det of detaylar) {
			det.ozelFiyat = det.ozelIsk = det.ozelPro = false
			det.fiyatKosulKod = det.iskKosulKod = det.proKod = det.fiyat = null
			det.brutBedel = det.bedel = 0
			for (let {ioAttr: k} of TicIskYapi)
				det[k] = null
			promises.push(new Promise(async (r, f) => {
				await det.detayEkIslemler(_e)
				r()
			}))
		}
		await Promise.allSettled(promises)
		await this.topluHesapla(e)
		detaylar.forEach(det =>
			det.bedelHesapla().htmlOlustur())
		gridPart?.tazele()
		acc?.render()
		return this
	}
	async satisKosullariOlustur(e) {
		await super.satisKosullariOlustur(e)
		let {tarih, subeKod, mustKod, detaylar} = this
		// let stokKodListe = detaylar.map(_ => _.stokKod)
		let kapsam = { tarih, subeKod, mustKod }
		try { this.kosulYapilar = await new SatisKosulYapi().uygunKosullar({ kapsam }) }
		catch (ex) { cerr(ex) }
		return this
	}

	static async rootFormBuilderDuzenle_tablet_acc_baslik({ sender: tanimPart, inst: fis, rfb }) {
		let e = arguments[0]
		await super.rootFormBuilderDuzenle_tablet_acc_baslik(e)
		{
			let mfSinif = MQTabSevkAdres, {sinifAdi: etiket} = mfSinif
			let form = rfb.addFormWithParent().altAlta()
			form.addSimpleComboBox('sevkYerKod', etiket, etiket)
				.etiketGosterim_yok()
				// .addStyle(`$elementCSS { max-width: 800px }`)
				.kodsuz().setMFSinif(mfSinif)
		}
	}
	static async rootFormBuilderDuzenle_tablet_acc_dip({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_dip(...arguments)
		let {acc} = tanimPart, {dvKod, dipIslemci, detaylar} = fis
		// rfb.addStyle_wh(null, 200)
		rfb
			.addStyle_wh(null, 'max-content')
			.addStyle(`$elementCSS { padding-bottom: 30px !important }`)
		{
			let form = rfb.addFormWithParent().yanYana()
				.addStyle(`$elementCSS > * { gap: 20px }`)
				.setAltInst(dipIslemci)
			form.addNumberInput('dipIskOran1', 'İsk1 %')
				.setMin(0).setMax(100)
				.addStyle_wh(100, 50).addCSS('center')
				.degisince(({ builder: { input }}) => {
					input.addClass('degisti')
					input[0].value = asFloat(input[0].value) || null
					fis.topluHesapla()
					acc?.render()
				})
				.onAfterRun(({ builder: { id, input, altInst: inst } }) => {
					tanimPart.txtDipIskOran = input
					setTimeout(() => input[0].value = inst[id] || null, 1)
					setTimeout(() => input.focus(), 1)
				})
			form.addNumberInput('dipIskBedel', '+ Bedel')
				.addStyle_wh(200, 50)
				.setMin(0)
				.degisince(({ builder: { input }}) => {
					input.addClass('degisti')
					input[0].value = asFloat(input[0].value) || null
					fis.topluHesapla()
					acc?.render()
				})
				.onAfterRun(({ builder: { id, input, altInst: inst } }) => {
					tanimPart.txtDipIskBedel = input
					setTimeout(() => input[0].value = inst[id] || null, 1)
				})
			form.addDiv().etiketGosterim_placeHolder()
				.addStyle('$elementCSS { margin: 10px 0 0 10px }')
				.addCSS('gray')
				.onBuildEk(({ builder: { input } }) =>
					input.html(dvKod))
		}
	}
}




/*
		await Promise.all(app.activeWndPart.inst.kosulYapilar.FY.map(async k => k.getAltKosulYapilar(app.activeWndPart.inst.detaylar.map(_ => _.stokKod)))).then(_ => _.flat())
		let fiyatYapilar = await SatisKosul_Fiyat.stoklarIcinFiyatlar(stokKodListe, kosulYapilar?.FY, mustKod), iskontoArastirStokSet = {};
		for (let det of detaylar) {
			if (fiyatYapilar && det.netBedel == undefined) { continue }
			let {stokKod} = det, kosulRec = fiyatYapilar[stokKod] ?? {}, {iskontoYokmu} = kosulRec;
			if (!iskontoYokmu) { iskontoArastirStokSet[stokKod] = true }
			let fiyat = det.fiyat || kosulRec.fiyat; if (fiyat) {
				let miktar = det.miktar || 0, netBedel = roundToBedelFra(miktar * fiyat);
				$.extend(det, { fiyat, netBedel })
			}
		}
		let iskYapilar = await SatisKosul_Iskonto.stoklarIcinOranlar(Object.keys(iskontoArastirStokSet), kosulYapilar?.SB);
		let prefix = 'oran'; for (let det of detaylar) {
			let {stokKod} = det, kosulRec = iskYapilar[stokKod] ?? {};
			for (let [key, value] of Object.entries(iskYapilar)) {
				if (!(value && key.startsWith(prefix))) { continue }
				let i = asInteger(key.slice(prefix.length)); det[`iskOran${i}`] = value
			}
		}
	*/
