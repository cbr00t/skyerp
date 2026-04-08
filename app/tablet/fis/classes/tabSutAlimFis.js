class TabSutAlimFis extends TabFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sutAlimmi() { return true } static get alimmi() { return true }
	static get kodListeTipi() { return 'SUT' } static get sinifAdi() { return 'Süt Alım' }
	static get numTipKod() { return 'SUT' } get defaultSeri() { return '' }
	static get detaySinif() { return TabSutAlimDetay }
	static get onlineFisSinif() { return SutAlimOnlineFis }
	static get cariSinif() { return MQTabMustahsil }
	// get sonucBedel() { return this.topMiktar }
	get topMiktar() { return topla(_ => _.miktar || 0, ...this.detaylar) }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, {
			yerKod: new PInstStr('yerkod'),
			plasiyerKod: new PInstStr('plasiyerkod'),
			rotaID: new PInstStr('rotaID'),
			posta: new PInstStr({ ioAttr: 'posta', init: () => TabPosta.defaultChar })
		})
		let { posta: defPosta } = app.params.yerel ?? {}
	}
	async yeniTanimOncesiIslemler(e) {
		await super.yeniTanimOncesiIslemler(e)
		let { posta: defPosta } = app.params.yerel ?? {}
		if (defPosta)
			this.posta = defPosta
	}
	async yeniTanimOncesiVeyaYukleSonrasiIslemler(e) {
		let { detaySinif: { stokSinif } } = this.class
		let { detaylar, class: { detaySinif } } = this
		let kod2Det = fromEntries(detaylar.map(_ => [_.stokKod, _]))
		let _exists = true
		this.detaylar = (await stokSinif.loadServerData())
			.filter(_ => _.kod)
			.map(({ kod: stokKod, aciklama: stokAdi }) => {
				let det = kod2Det[stokKod] ?? {}
				let { miktar = 0, aciklama = '' } = det
				return new detaySinif({ stokKod, stokAdi, miktar, aciklama, _exists }).htmlOlustur()
				
			})
		return await super.yeniTanimOncesiVeyaYukleSonrasiIslemler(e)
	}
	getYazmaIcinDetaylar(e) {
		return this.detaylar.filter(_ => _.miktar)
	}
	async kaydetOncesiIslemler(e) {
		await super.kaydetOncesiIslemler(e)
		// let { tarih, mustKod: must, rotaID, posta, class: { table } } = this
	}
	async dataDuzgunmuDuzenle({ islem, eskiInst: eskiFis, parentPart, gridPart, result }) {
		let { tarih, mustKod: must, rotaID, posta, class: { table } } = this
		tarih = tarih.clone().clearTime()
		if (islem == 'yeni' || islem == 'kopya') {
			let keyHV = extend(
				this.class.varsayilanKeyHostVars(e),
				{ tarih, must, rotaID, posta }
			)
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent.fromAdd(table)
			wh
				.add(`silindi = ''`, `gecici = ''`, `merkez = ''`)
				.birlestirDict(keyHV)
			sahalar.add('COUNT(*) sayi')
			let res = await sent.execTekilDeger()
			if (asBool(res))
				result.push(`<b>Bu (<b class=royalblue>Tarih + Rota + Müstahsil)</b> için belge zaten mevcut`)
		}
		;{
			if (!rotaID)
				result.push(`<b>Rota</b> belirsizdir`)
			if (empty(new TabPosta(posta).secilen))
				result.push(`<b>Posta</b> seçilmelidir`)
			/*if (yerKod && !await MQTabYer.kodVarmi(yerKod))
				result.push(`<b>Yer (Depo) [<span class=firebrick>${yerKod}</span>]</b> hatalıdır`)*/
		}
		return await super.dataDuzgunmuDuzenle(...arguments)
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments)
		let { topMiktar } = this
		extend(hv, { topMiktar })
	}
	
	yerDegisti({ oldValue = this._prev.yerKod, value = this.yerKod }) {
		this._prev.yerKod = value
	}
	postaDegisti({ oldValue = this._prev.posta, value = this.posta }) {
		this._prev.posta = value
	}

	getDokumForm(e) {
		let bedelX = 27
		let data = ({
			dipYok: true,
			// sayfaBoyut: { x: 60, y: 58 },
			otoYBasiSonu: { x: 8 },
			sabit: [
				{ key: 'fisTipText', pos: { x: 5, y: 2 }, length: 19 },
				{ text: '[islemTarih] [islemZaman]', pos: { x: 40, y: 3 } },
				{ text: '[mustUnvan],', pos: { x: 1, y: 5 }, length: 55 },
				{ text: '[vergiDairesi] [vergiNo]', pos: { x: 5, y: 6 }, length: 40 },
				{ text: '** BİLGİ FİŞİ **', pos: { x: 5, y: -1 }, length: 50 }
			],
			detay: [
				{ key: 'stokAdi', pos: { x: 2, y: 1 }, length: 25 },
				{ key: 'miktar', pos: { x: 27, y: 1 }, length: 8, right: true }
			],
			oto: [
				{ key: 'notlar', x: 2 }
			]
		})
		return new TabDokumForm(data)
	}

	static async offlineSaveToRemoteTable({ trnId } = {}) {
		if (!this.dbMgr_db)
			return false

		let e = { ...arguments[0], offlineRequest: true, offlineMode: false }
		let { table: offlineTable, idSaha, gonderildiDesteklenirmi, gonderimTSSaha } = this
		let { params: { tablet } } = app
		let numYapilar = tablet.numYapilar ??= {}
		let { defaultBrm } = this
		let numTable = 'numarator', numKod = 'MUSHZ'                           // uzak
		let { subeKod: bizsubekod } = config.session
		bizsubekod ??= ''
		let { numYapi } = new this()
		await numYapi.yukle()
		let { id: numId, seri } = numYapi
		let fisRecs, idListe, detRecs
		let fisID2Yapi = {}, fisKey2Yapi = {}
		let keyHV = this.varsayilanKeyHostVars(e)
		let okIdList = [], errors = []
		app.online()
		try {
			;{
				// Burada yerelden veri okuyoruz
				;{
					// Yerel Fişler
					let { tableAlias: alias } = this
					let sent = new MQSent(), { where: wh, sahalar } = sent
					sent.fromAdd(`${offlineTable} ${alias}`)
					if (gonderildiDesteklenirmi)
						wh.add(`COALESCE(${alias}.${gonderimTSSaha}, '') = ''`)
					wh
						.add(`${alias}.silindi = ''`, `${alias}.gecici = ''`, `${alias}.merkez = ''`)
						.birlestirDict(keyHV)
					sahalar.addWithAlias(alias,
						`${idSaha} id`, 'kayitTS', 'tarih', 'fisno', 'must', 'yerkod', 'rotaID', 'posta', 'cariaciklama')
					let orderBy = [`${alias}.tarih`, `${alias}.rotaID`, `${alias}.posta`]
					fisRecs = await new MQStm({ sent, orderBy }).execSelect({ ...e, offlineMode: true })
					;fisRecs.forEach(r =>
						r.tarih = asDate(r.tarih))
				}
				window.progressManager?.progressStep(5)
				
				// Fiş ID Liste
				idListe = fisRecs.map(r => r.id)
				window.progressManager?.progressStep(1)
				
				;{
					// Yerel Fiş Detayları
					let { detaySinif } = this
					let { table: detayTable, tableAlias: alias, fisSayacSaha, seqSaha } = detaySinif
					let sent = new MQSent(), { where: wh, sahalar } = sent
					sent.fromAdd(`${detayTable} ${alias}`)
					wh.inDizi(idListe, `${alias}.${fisSayacSaha}`)
					sahalar.addWithAlias(alias, `${fisSayacSaha} fisID`, seqSaha, 'stokkod', 'miktar', 'brm')
					let orderBy = [`${alias}.${fisSayacSaha}`, `${alias}.${seqSaha}`]
					detRecs = await new MQStm({ sent, orderBy }).execSelect({ ...e, offlineMode: true })
				}
				window.progressManager?.progressStep(7)

				;{
					// Fiş -> Detay bağlantı ve düzenleme
					fisRecs.forEach(fisRec =>
						fisID2Yapi[fisRec.id] = { fisRec })
					detRecs.forEach(detRec => {
						let yapi = fisID2Yapi[detRec.fisID]
						if (yapi) {
							let { fisRec: { kayitTS, must } } = yapi
							detRec.tabletkayitts = asDate(kayitTS)
							detRec.must = must
							;(yapi.detRecs ??= []).push(detRec)
						}
					})
					fisRecs.forEach(r =>
						deleteKeys(r, 'kayitTS', 'must'))
				}
				
				;{
					// Gruplanmış Fiş Yapıları
					function getKey({ tarih, rotaID, posta }) {
						if (isDate(tarih))
							tarih = asReverseDateString(tarih)
						return [tarih, rotaID, posta]
							.filter(Boolean)
							.map(String)
							.join(delimWS)
					}
					for (let [id, { fisRec, detRecs } = {}] of entries(fisID2Yapi)) {
						if (!fisRec || empty(detRecs))
							continue
						let key = getKey(fisRec)
						let yapi = fisKey2Yapi[key] ??= { fisRec, detRecs: [] }
						yapi.detRecs.push(...detRecs)
					}
				}
				window.progressManager?.progressStep(3)
			}

			if (!empty(fisKey2Yapi)) {
				// Burada merkeze aktarım yapılacak
				let toplu = new MQToplu().withTrn()
				let _okIdList = []
				
				let table = 'musrotafis', detayTable = 'musrotastok'
				let tipkod = 'M', alttipkod = '', yerkod = 'A'
				let no = `@sonNo + 1`.sqlConst()
				let tabletguid = 'NEWID()'.sqlConst()
				
				toplu.add(...[
					`DECLARE @fisSayac BIGINT`,
					`DECLARE @numSeri CHAR(3)`,
					`DECLARE @sonNo INT`,
					`DECLARE @seq SMALLINT`,
					`DECLARE @id UNIQUEIDENTIFIER`,
					// `DECLARE @numId UNIQUEIDENTIFIER`,
					``
				])

				;{
					if (numId) {
						let sent = new MQSent(), { where: wh, sahalar } = sent
						sent.fromAdd(numTable)
						wh.degerAta(numId, 'id')
						sahalar.add('@numId = id', '@sonNo = sonno', '@numSeri = seri')
						toplu.add(sent)
					}
					
					toplu.add('IF @sonNo IS NULL')
					;{
						let sent = new MQSent(), { where: wh, sahalar } = sent
						sent.fromAdd(numTable)
						// bizsubekod + seri + kod => pri key
						wh
							.degerAta(bizsubekod, 'bizsubekod')
							.degerAta(numKod, 'kod')
							.degerAta(seri, 'seri')
						sahalar.add('@numId = id', '@sonNo = sonno', '@numSeri = seri')
						toplu.add(sent)
					}
					
					toplu.add('IF @sonNo IS NULL', 'BEGIN')
					;{
						let id = numId ||= newGUID()
						let kod = numKod, sonno = 0
						let { seri, aciklama } = numYapi
						seri ??= ''
						let hv = { bizsubekod, id, kod, aciklama, seri, sonno }
						toplu.add(
							`SET @numSeri = ${seri.sqlDegeri()}`,
							new MQInsert({ table: numTable, hv }).insertOnly()
						)
					}
					toplu.add('END')
				}

				// fiş seviyeli toplu işlemler
				for (let { fisRec, detRecs } of values(fisKey2Yapi)) {
					let { id, tarih, rotaID: rotasayac, posta } = fisRec
					let toplam = topla(d => d.miktar || 0, detRecs)
					rotasayac = asInteger(rotasayac)
					
					let getFisSent = () => {
						let sent = new MQSent(), { where: wh, sahalar } = sent
						sent.fromAdd(table)
						wh
							.add(`silindi = ''`)
							.degerAta(bizsubekod, 'bizsubekod')
							.degerAta(tipkod, 'tipkod')
							.degerAta(alttipkod, 'alttipkod')
							.add('seri = @numSeri')
						/*if (!kisitsizmi) {
							wh.degerAta(tarih, 'tarih')
							wh.degerAta(rotasayac, 'rotasayac')
							wh.degerAta(posta, 'posta')
						}*/
						return sent
					}
					let getHarSent = () => {
						let sent = new MQSent(), { where: wh, sahalar } = sent
						sent.fromAdd(detayTable)
						wh.add(`fissayac = @fisSayac`)
						return sent
					}
					
					;{
						let sent = getFisSent(), { where: wh, sahalar } = sent
						wh
							.degerAta(tarih, 'tarih')
							.degerAta(rotasayac, 'rotasayac')
							.degerAta(posta, 'posta')
						sahalar.add(`@fisSayac = MAX(kaysayac)`)
						toplu.add(sent)
					}
					toplu.add(`IF @fisSayac IS NULL BEGIN`)
						;{
							let sent = getFisSent(), { sahalar } = sent
							sahalar.add('@sonNo = COALESCE(MAX(no), 0)')
							toplu.add(sent)
						}
						;{
							// insert
							let seri = '@numSeri'.sqlConst()
							let hv = {
								tipkod, alttipkod, tabletguid,
								tarih, seri, no, yerkod,
								rotasayac, posta,
								detaytoplam: toplam
							}
							toplu.add(new MQInsert({ table, hv }).insertOnly())
						}
						;{
							let sent = getFisSent(), { sahalar } = sent
							sahalar.add(`@fisSayac = MAX(kaysayac)`)
							toplu.add(sent)
						}
					toplu.add('END')
					toplu.add('ELSE BEGIN')
					; {
						// update
						;{
							let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
							upd.fromAdd(table)
							wh.add(`kaysayac = @fisSayac`)
							set.add(`detaytoplam = detaytoplam + ${toplam.sqlDegeri()}`)
							toplu.add(upd)
						}
					}
					toplu.add('END')
					;{
						let sent = getHarSent(), { sahalar } = sent
						sahalar.add(`@seq = COALESCE(MAX(seq), 0) + 1`)
						toplu.add(sent)
					}
					;{
						let fissayac = '@fisSayac'.sqlConst()
						let hvListe = detRecs.map((r, i) => {
							let { tabletkayitts, must, stokkod, miktar } = r
							let seq = `@seq + ${i + 1}`.sqlConst()
							return {
								fissayac, seq, tabletkayitts,
								must, stokkod, miktar
							}
						})
						toplu.add(new MQInsert({ table: detayTable, hvListe }).insertOnly())
					}
					_okIdList.push(...detRecs.map(r => r.fisID))
				}

				;{
					// numId guncellemesi
					toplu.add(`SET @sonNo = @sonNo + 1`)
					
					let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
					upd.fromAdd('numarator')
					wh.degerAta(numId, 'id')
					set.add(`sonno = (CASE WHEN @sonNo > sonno THEN @sonNo ELSE sonno END)`)
					toplu.add(upd)
				}

				let result, success
				let params = [
					{ name: '@numId', type: 'uniqueidentifier', direction: 'output' }
				]
				try {
					result = empty(toplu.liste) ? null : await toplu.executeResult({ ...e, params, offlineMode: false })
					result = result?.[0] ?? result
					if (result && !empty(_okIdList)) {
						okIdList.push(..._okIdList)
						success = true
					}
				}
				catch (ex) { errors.push(ex) }
				window.progressManager?.progressStep(toplu.liste.length)
				
				app.offline()
				;{
					let { params: { ['@numId']: { value: numId } = {} } } = result ?? {}
					if (success && numId && numYapilar.SUT != numId) {
						numYapilar.SUT = numId
						tablet.kaydet()    // async, sonucu bekleme
					}
				}
				
				if (gonderildiDesteklenirmi && !empty(okIdList)) {
					let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
					upd.fromAdd(offlineTable)
					wh.inDizi(okIdList, idSaha)
					set.degerAta(asReverseDateTimeString(now()), gonderimTSSaha)
					await upd.execNone({ offlineMode: true })
				}
			}
		}
		finally {
			app.resetOfflineStatus()
			if (!empty(errors))
				throw {
					isError: true, rc: 'multiError',
					errorText: (
						`<b class="firebrick"><u>Süt Alım Fiş Gönderimi</u>:</b>` +
						`<ul>` +
							`${errors.map(_ => `<li>${getErrorText(_)}</li>`).join(CrLf)}` +
						`</ul>`
					)
				}
		}

		return true
	}
	
	static async rootFormBuilderDuzenle_tablet(e) {
		await super.rootFormBuilderDuzenle_tablet(e)
		// let { sender: tanimPart, inst, rootBuilder: rfb, kaForm, tanimFormBuilder: tanimForm, acc } = e
	}
	static async rootFormBuilderDuzenle_tablet_acc(e) {
		await super.rootFormBuilderDuzenle_tablet_acc(e)
		// let { sender: tanimPart, acc, getBuilder } = e
	}
	static async rootFormBuilderDuzenle_tablet_acc_baslikCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_baslikCollapsed(...arguments)
	}
	static async rootFormBuilderDuzenle_tablet_acc_baslik({ acc, sender: tanimPart, inst: fis, rfb }) {
		let e = arguments[0]
		await super.rootFormBuilderDuzenle_tablet_acc_baslik(e)
		/*;{
			let { wndId } = tanimPart.wndPart
			let mfSinif = MQTabYer.getMFSinif_subeFiltreli(() => fis.subeKod, wndId)
			let { sinifAdi: etiket } = mfSinif
			let form = rfb.addFormWithParent().altAlta()
			form.addSimpleComboBox('yerKod', etiket, etiket)
				.etiketGosterim_yok()
				.kodsuz().setMFSinif(mfSinif)
				.degisince(({ type, events, ...rest }) => {
					if (type == 'batch') {
						let _e = { type, events, ...rest, oldValue: fis.yerKod, value: events.at(-1).value?.trimEnd() }
						setTimeout(() => {
							fis.yerDegisti({ ...e, ..._e, tanimPart })
							acc?.render()
						}, 5)
					}
				})
				.onAfterRun(({ builder: { part } }) =>
					tanimPart.ddYer = part)
		}*/
		;{
			let mfSinif = MQTabPosta, { sinifAdi: etiket } = mfSinif
			let form = rfb.addFormWithParent().altAlta()
			form.addSelect('posta', etiket, etiket)
				.etiketGosterim_yok()
				.setSource(_e =>
					mfSinif.loadServerData(_e))
				.degisince(({ value, ...rest }) => {
					let _e = { ...rest, oldValue: fis.posta, value }
					setTimeout(() => {
						if (empty(new TabPosta(value).secilen))
							value = fis.posta = TabPosta.defaultChar
						fis.postaDegisti({ ...e, ..._e, tanimPart })
					}, 5)
				})
				.onAfterRun(({ builder: { id, altInst: inst, input } }) => {
					tanimPart.ddPosta = input
					setTimeout(() => input?.val(inst[id]), 5)
				})
		}
	}
	static async rootFormBuilderDuzenle_tablet_acc_dipCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_dipCollapsed(...arguments)
		let { rotaID, posta, topMiktar, detaylar, class: { detaySinif: { defaultBrm } } } = fis
		if (rotaID) {
			let aciklama = (await MQTabRota.loadServerData())
				.find(r => r.rotaID == rotaID)?.aciklama || rotaID
			rfb
				.addCSS('flex-row')
				.addStyle(
					`$elementCSS > div { width: max-content !important }
					 $elementCSS > div:not(:first-child) { margin-left: 20px }`
				)
			rfb.addForm().setLayout(() => $([
				`<div class="rota flex-row" style="gap: 10px">`,
					`<div class="etiket lightgray">R:</div> `,
					`<div class="bold blueviolet">${aciklama}</div>`,
				`</div>`
			].join(CrLf)))
		}

		if (posta) {
			let { aciklama = '' } = new TabPosta(posta)
			rfb
				.addCSS('flex-row')
				.addStyle(
					`$elementCSS > div { width: max-content !important }
					 $elementCSS > div:not(:first-child) { margin-left: 20px }`
				)
			rfb.addForm().setLayout(() => $([
				`<div class="posta flex-row" style="gap: 10px">`,
					`<div class="etiket lightgray">P:</div> `,
					`<div class="bold darkyellow">${aciklama}</div>`,
				`</div>`
			].join(CrLf)))
		}
		
		let topSatir = detaylar.filter(_ => _.miktar).length
		let brm = detaylar[0]?.brm ?? defaultBrm
		rfb.addForm().setLayout(() => $([
			`<div class="flex-row" style="gap: 10px">`,
				(topMiktar ? `<div class="topMiktar forestgreen"><b>${numberToString(topMiktar, 2)}</b> ${brm}</div>` : null),
				(topSatir ? `<div class="topSatir royalblue"><b>${numberToString(topSatir)}</b> satır</div>` : null),
			`</div>`
		].filter(Boolean).join(CrLf)))
	}
	static async rootFormBuilderDuzenle_tablet_acc_detayCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_detayCollapsed(...arguments)
		let { gridPart: { selectedRec: det } = {} } = tanimPart
		let { length: topSayi } = fis.detaylar
		let { detaySinif: { defaultBrm } } = fis.class
		if (det) {
			rfb.addForm().setLayout(() => $([
				`<div class="flex-row" style="gap: 10px">`,
					`<div class="orangered bold">${det.stokAdi || ''}</div>`,
					`<div class="royalblue bold"${numberToString(det.miktar)} ${det.brm || defaultBrm}</div>`,
				`</div>`
			].join(CrLf)))
		}
	}
	static async rootFormBuilderDuzenle_tablet_acc_detay({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_detay(...arguments)
		let { acc } = tanimPart, { detaylar } = fis
		let gridPart
		{
			let cellClassName = (sender, rowIndex, belirtec, value, rec) => {
				let result = [belirtec]
				if (rec && belirtec == 'miktar') {
					if (rec._degisti)
						result.push('bg-lightgreen')
					else if (rec.miktar)
						result.push('bg-cyan')
				}
				return result.join(' ')
			}
			rfb.addGridliGiris_sabit('grid')
				.addStyle_fullWH(null, `calc(var(--full) - 20px)`)
				.rowNumberOlmasin().notAdaptive()
				.widgetArgsDuzenleIslemi(({ args }) => extend(args, {
					rowsHeight: 60, selectionMode: 'singlerow',
					editMode: 'selectedcell'
				}))
				.setSource(detaylar)
				.setTabloKolonlari([
					new GridKolon({
						belirtec: '_html', text: 'Ürün',
						filterType: 'input', cellClassName
					}).readOnly(),
					new GridKolon({
						belirtec: 'miktar', text: 'Miktar', genislikCh: 10, cellClassName,
						cellValueChanged: ({ belirtec, rowIndex, value, gridWidget: w, gridRec: det }) =>  {
							// det._degisti = true
							det.htmlOlustur()
							w.updaterow(det.uid, det)
							acc?.render()
							if (gridPart) {
								setTimeout(() => {
									let { selectedBelirtec: newBelirtec, selectedRowIndex: newRowIndex } = gridPart
									let { gridWidget: w } = gridPart
									if (newBelirtec == belirtec && newRowIndex != rowIndex) {
										if (!gridPart.editing)
											w.begincelledit(newRowIndex, belirtec)
									}
								}, 30)
							}
						}
					}).tipDecimal(1),
					new GridKolon({ belirtec: '_sil', text: ' ', genislikCh: 6 })
						.tipButton('X')
						.onClick(({ gridRec: det, args: { owner: w } }) => {
							det.miktar = 0
							det.htmlOlustur?.()
							w.updaterow(det.uid, det)
							acc?.render()
						})
				])
				.veriYukleninceIslemi(({ builder: { part: gridPart } }) => {
					let { boundRecs: recs, gridWidget: w } = gridPart
					let ind = recs.findLastIndex(_ => _.miktar) + 1
					if (ind > -1) {
						let ekSatir = $(window).height() < 800 ? 5 : 7
						w.ensurerowvisible(Math.min(ind + ekSatir, recs.length - 1))
						setTimeout(() => {
							// w.selectcell(ind, 'miktar')
							w.selectrow(ind)
							setTimeout(() => {
								if (!gridPart.editing)
									w.begincelledit(ind, 'miktar')
							}, 200)
						}, 50)
					}
					setTimeout(() => w.focus(), 10)
				})
				.onAfterRun(({ builder: { rootPart, part } }) => {
					gridPart = rootPart.gridPart = part
					extend(part, {
						gridSatirCiftTiklandiBlock: ({ sender: tanimPart = {}, event: { args = {} } = {} }) => {
							let { gridWidget: w, selectedRec: det } = tanimPart
							let { row: { bounddata: _det } = {} } = args
							let { uid } = det ?? {}
							if (det && det != _det) {
								let ind = w.getrowboundindexbyid(uid)
								w.clearselection()
								w.selectrow(ind)
								w.ensurerowvisible(ind)
							}
						}
						/*gridContextMenuIstendiBlock: ({ sender: { gridWidget: w }}) => {
							let { clickedrow: tr } = w.mousecaptureposition ?? {}
							let uid = $(tr).attr('row-id')                                   // tr = null ==> skinti yok, sadece undefined alır
							if (uid == null)
								return true                                                  // continue next events
							let ind = w.getrowboundindexbyid(uid)
							w.clearselection()
							w.selectrow(ind)
							w.ensurerowvisible(ind)
							let { kalanBedel } = fis
							if (kalanBedel > 0) {
								let det = w.getrowdatabyid(uid)
								extend(det, { _degisti: true, bedel: kalanBedel })
								det.htmlOlustur?.()
								w.updaterow(uid, det)
								acc?.render()
							}
							return false                                                     // prevent next events
						}*/
					})
				})
		}
	}
	static rootFormBuilderDuzenle_tablet_acc_onExpand({ sender: { parentPart: tanimPart = {} }, acc, id, item }) {
		super.rootFormBuilderDuzenle_tablet_acc_onExpand(...arguments)
		let { gridPart } = tanimPart
		if (id == 'detay')
			gridPart?.focus()
	}
	static rootFormBuilderDuzenle_tablet_acc_onCollapse({ sender: { parentPart: tanimPart = {} }, id, acc }) {
		super.rootFormBuilderDuzenle_tablet_acc_onCollapse(...arguments)
		if (id != 'detay' && !acc.hasActivePanel)
			acc.expand('detay')
	}
}

class TabSutAlimDetay extends TabStokDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get bedelKullanilirmi() { return false }
	static get stokSinif() { return MQTabSutSira }
	static get stokKodGosterilirmi() { return false }
	static get defaultBrm() { return 'LT' }

	constructor(e = {}) {
		super(e)
	}
	static io2RowAttrOlustur({ result }) {
		super.io2RowAttrOlustur(...arguments)
		let _keys = ['stokKod', 'miktar', 'brm']
		for (let k of _keys)
			result[k] = k.toLowerCase()
		extend(result, { stokAdi: null, aciklama: 'ekaciklama', _exists: null })
	}

	/*static loadServerData_queryDuzenle({ sent, sent: { from, sahalar } }) {
		super.loadServerData_queryDuzenle(...arguments)
		let { tableAlias: alias, stokSinif } = this
		if (!from.aliasIcinTable('stk'))
			sent.innerJoin(alias, `${stokSinif.table} stk`, `${alias}.stokkod = stk.kod`)
		sahalar.add('stk.aciklama stokAdi')
	}
	hostVarsDuzenle({ fis, hv }) {
		super.hostVarsDuzenle(...arguments)
		// deleteKeys(hv, 'brm')
	}
	setValues({ fis, rec }) {
		super.setValues(...arguments)
		let { stokAdi } = rec
		extend(this, { stokAdi })
	}*/
	
	async detayEkIslemler({ fis } = {}) {
		await super.detayEkIslemler(...arguments)
		let { stokKod } = this
		if (stokKod) {
			let { stokSinif, defaultBrm } = this.class ?? {}
			let { [stokKod]: rec } = await stokSinif.getGloKod2Rec() ?? {}
			if (rec) {
				let bosDegilseAktar = (i, r) => {
					let rv = rec[r]
					if (rv)
						this[i] = rv
				}
				bosDegilseAktar('stokAdi', 'aciklama')
				bosDegilseAktar('brm', 'brm')
			}
			this.brm ||= defaultBrm
		}
		return this
	}

	getHTML(e) {
		let _ = super.getHTML(e) ?? ''
		return _
		/*let { stokAdi, miktar, brm } = this
		return [
			_,
			`<div class="asil flex-row" style="gap: 0 10px">`,
				( stokAdi ? `<div class="stokAdi">${stokAdi}</div>` : null ),
				// ( stokKod ? `<div class="stokKod orangered">${stokKod}</div>` : null ),
			`</div>`,
			( miktar ?
				`<div class="miktarFiyat ek-bilgi float-right" style="gap: 0 10px">` +
					`<span class="miktar bold forestgreen">${miktar} ${brm}</span>` +
				`</div>`
			: null)
		].filter(Boolean).join(CrLf)*/
	}
}

class MQTabPosta extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get tekSecimSinif() { return TabPosta } static get kodKullanilirmi() { return false } 
	static get kodListeTipi() { return this.tekSecimSinif.kodListeTipi }
	static get sinifAdi() { return this.tekSecimSinif.sinifAdi }
	
	static loadServerDataDogrudan(e) { return this.tekSecimSinif.kaListe }
}
class TabPosta extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABPOSTA' } static get sinifAdi() { return 'Posta' }
	static get kodSaha() { return 'kod' } static get adiSaha() { return 'aciklama' }
	static get defaultChar() { return 'S' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		kaListe.push(
			new CKodVeAdi(['S', `<span class=teal>Sabah</span>`, 'sabahmi']),
			new CKodVeAdi(['A', `<span class=darkgoldenrod>Akşam</span>`, 'aksammi'])
		)
	}
}
