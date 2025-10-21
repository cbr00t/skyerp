class MQBarkodGiris extends MQCogul {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'BARKOD' } static get sinifAdi() { return 'Barkod Giriş' }
	static get tanimUISinif() { return null } static get secimSinif() { return null }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return true }
	static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get tanimmi() { return false } static get noAutoFocus() { return true }
	static get ozelTanimIslemi() { return e => this.ozelTanimYap(e) }
	static get localData() { return app.params.localData }
	static get recs() { return this.localData.get('recs', null, () => []) }
	
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			id: new PInstGUID('id'), rowIndex: new PInstNum('boundindex'),
			status: new PInst('status'), barkod: new PInstStr('barkod'),
			shKod: new PInstStr('shKod'), shAdi: new PInstStr('shAdi')
		})
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
		super.rootFormBuilderDuzenle_listeEkrani(e); let {localData} = this
		let {rootBuilder: rfb, sender: gridPart, sender: { layout, header }} = e
		let fbd_header = rfb.addForm('header').setLayout(header)
		fbd_header.addTextInput('barkod', 'Barkod').etiketGosterim_yok()
			.setPlaceHolder('Barkod okutunuz')
			.onAfterRun(({ builder: { input } }) => {
				gridPart.txtBarkod = input
				input.on('keyup', ({ key, currentTarget: target, currentTarget: { value: barkod } }) => {
					key = key?.toLowerCase()
					if (key == 'enter' || key == 'linefeed')
						this.ekleIstendi({ ...e, input: $(target), barkod })
				})
				input.focus()
			})
			.addStyle(`$elementCSS > input { font-size: 120%; font-weight: bold; color: forestgreen; text-align: center; padding: 0 30px }`)
		fbd_header.addTextInput('aciklama', 'Açıklama').etiketGosterim_yok()
			.setPlaceHolder('Açıklama (opsiyonel)')
			.setValue(localData.get('aciklama'))
			.onAfterRun(({ builder: { input } }) => {
				gridPart.txtAciklama = input
				input.on('keyup', ({ key, currentTarget: target }) => {
					key = key?.toLowerCase()
					if (key == 'enter' || key == 'linefeed') {
						let {barkod} = gridPart
						this.ekleIstendi({ ...e, input: $(target), barkod })
					}
				})
				input.on('change', ({ currentTarget: { value } }) =>
					localData.set('aciklama', value || null))
			})
	}
	static ekCSSDuzenle({ dataField: belirtec, value, rec: { status } = {}, result }) {
		if (belirtec == 'statusImg') {
			// result.push('bg-white')
			return
		}
		if (status != null)
			result.push('bold', status ? 'forestgreen' : 'firebrick strikeout')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'statusImg', text: 'Durum', genislikCh: 8 }).tipImage(),
			new GridKolon({ belirtec: 'barkod', text: 'Barkod', genislikCh: 20 }),
			new GridKolon({ belirtec: 'shKod', text: 'Kod', genislikCh: 18 }),
			new GridKolon({ belirtec: 'shAdi', text: 'Adı', genislikCh: 40 })
		)
	}
	static async loadServerDataDogrudan(e) {
		let {recs = []} = this
		let cls = class extends CObject {
			get statusImg() {
				let {status} = this
				let fileName = status == null ? 'loading.gif' : status ? 'tamam_blue.png' : 'uyari.png'
				return `../../images/${fileName}`
			}
		}
		recs = recs.map(rec => cls.From(rec)).reverse()
		let promises = []
		for (let rec of recs.filter(({ status }) => !status)) {
			rec ??= {}; let {barkod} = rec
			promises.push(this.ekleSonrasi({ ...e, rec, barkod }))
			if (promises.length >= 10) {
				await Promise.allSettled(promises)
				promises = []
			}
		}
		if (promises.length) {
			await Promise.allSettled(promises)
			promises = []
		}
		return recs
	}
	static gridVeriYuklendi({ sender: { txtBarkod } }) {
		super.gridVeriYuklendi(...arguments)
		txtBarkod?.focus()
		this.localData?.kaydetDefer()
	}
	static async kaydetIstendi({ sender: gridPart }) {
		let {sinifAdi: islemAdi, localData, recs = []} = this
		let aciklama = localData.get('aciklama') ?? ''
		recs = recs.filter(rec => !!rec.status)
		if (!recs.length) {
			hConfirm('Kaydedilecek bilgi yok', islemAdi)
			return false
		}
		if (!await ehConfirm(`<b class=royalblue>${recs.length}</b> adet barkod merkeze kaydedilecek, devam edilsin mi?`, islemAdi))
			return false
		let {session: { loginTipi, user: userkod }} = config
		let fisid = newGUID(), kayitts = now()
		let logintipi =
			loginTipi == 'plasiyerLogin' ? 'PL' :
			loginTipi == 'musteriLogin' ? 'CR' :
			''
		let seq = 0
		let toplu = new MQToplu([
			new MQInsert({
				table: 'rafetiketfis',
				hv: { id: fisid, kayitts, logintipi, userkod, aciklama }
			}),
			new MQInsert({
				table: 'rafetiketdetay',
				hvListe: recs.map(({ barkod }) => {
					seq++
					return { fisid, seq, barkod }
				})
			}),
		]).withTrn()
		await app.sqlExecNone(toplu)
		gridPart?.txtAciklama?.val(null)
		await this.reset()
		gridPart?.tazele()
		eConfirm(`<b class=royalblue>${recs.length}</b> adet barkod merkeze kaydedildi`, islemAdi)
		return true
	}
	static async ekleIstendi({ sender: gridPart, sender: { txtBarkod } = {}, barkod }) {
		let e = arguments[0], {sinifAdi: islemAdi} = this
		try {
			if (txtBarkod?.length) { txtBarkod.val(''); txtBarkod.focus() }
			await this.onKontrol(e)
			this._lastNotify?.close(); delete this._lastNotify
			let result = await this.ekle(e)
			if (!result)
				return result
			gridPart?.tazele()
		}
		catch (ex) {
			let errText = getErrorText(ex)
			if (errText)
				this._lastNotify = notify(errText, islemAdi, 'error')
			throw ex
		}
	}
	static ekle({ sender: gridPart, barkod }) {
		barkod = barkod?.trim()
		if (!barkod)
			return false
		let e = arguments[0], id = newGUID(), status = null
		let rec = { id, status, barkod, shKod: '', shAdi: '' }
		let {recs, localData} = this
		recs.push(rec)
		localData.changed()
		this.ekleSonrasi({ ...e, rec }).then(() =>
			gridPart?.tazele())
		return true
	}
	static async ekleSonrasi({ sender: gridPart, rec, rec: { status: oldStatus } = {} }) {
		if (oldStatus != null)
			return
		await this.ekleSonrasi_internal(...arguments)
		/*let {status} = rec
		if (status != oldStatus)
			gridPart?.tazele()*/
	}
	static async ekleSonrasi_internal({ sender: gridPart, barkod, rec: gridRec }) {
		let barkodBilgi = await app.barkodBilgiBelirle({ barkod })
		let rec = this.recs.find(({ id }) => id == gridRec.id)
		if (!rec)
			return
		let {shKod} = barkodBilgi ?? {}
		if (shKod)
			$.extend(rec, barkodBilgi)
		rec.status = !!shKod
		if (gridRec != rec)
			$.extend(gridRec, rec)
		this.localData.changed()
	}
	static async ozelTanimYap({ islem }) {
		if (islem == 'sil') {
			await this.sil(...arguments)
			return true
		}
		return false
	}
	static async sil({ recs: gridRecs }) {
		let id2RemoveRec = Object.fromEntries(gridRecs.map(rec => [rec.id ?? '', rec]))
		let {recs, localData} = this, newRecs = recs.filter(({ id }) => id && !id2RemoveRec[id])
		recs.splice(0)
		recs.push(...newRecs)
		localData.changed()
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
	static async reset({ sender: gridPart }) {
		let {localData, recs} = this
		localData.remove('aciklama')
		recs.splice(0)
	}
	alternateKeyHostVarsDuzenle({ hv }) {
		super.alternateKeyHostVarsDuzenle(...arguments)
		let {id, rowIndex: boundindex, barkod} = this
		$.extend(hv, { id, boundindex, barkod })
	}
	keySetValues({ rec }) {
		super.keySetValues(...arguments)
		let {id, boundindex: rowIndex, barkod} = rec
		$.extend(this, { id, rowIndex, barkod })
	}
}
