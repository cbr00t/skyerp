class MQEMutOnay extends MQCogul {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'MAIN' } static get sinifAdi() { return 'Mutabakat Onay' }
	static get sadeceTanimmi() { return true } static get tanimUISinif() { return ModelTanimPart }
	static get bulFormKullanilirmi() { return false }
	get cevapVerildimi() { return !!this.cevapTS }

	constructor(e = {}) {
		super(e)
		this.id = qs.id ?? null
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		;['id'].forEach(k =>
			pTanim[k] = new PInstGuid())
		;['telNo', 'cevaplayan', 'fileName', 'fileData', 'notlar'].forEach(k =>
			pTanim[k] = new PInstStr())
		;['bakiye'].forEach(k =>
			pTanim[k] = new PInstNum())
		;['zamanDamgasi'].forEach(k =>
			pTanim[k] = new PInstBool())
		;['tarih'].forEach(k =>
			pTanim[k] = new PInstDate())
		;['cevapTS'].forEach(k =>
			pTanim[k] = new PInstDateTime())
	}
	async uiGirisOncesiIslemler(e) {
		await super.uiGirisOncesiIslemler(e)
		let { sender: tanimPart } = e, islem = 'izle'
		let { class: { sinifAdi: title } } = this
		extend(e, { title, islem })
		setTimeout(() => app.enterKioskMode(), 100)
		tanimPart.kapaninca(() =>
			app.exitKioskMode())
		try {
			if (!await this.getWSResult(e))
				throw null
		}
		catch (ex) {
			let errText = getErrorText(ex)
			if (errText)
				await hConfirm(errText)
			if (!config.dev)
				tanimPart.close()
			return
			// throw { isError: true, rc: 'userClose' }
		}
	}
	async uiGirisSonrasiIslemler({ sender: tanimPart }) {
		await super.uiGirisSonrasiIslemler(...arguments)
	}
	static tanimPart_islemTuslariDuzenle(e) {
		let { sender: tanimPart, sender: { inst }, part, liste } = e
		super.tanimPart_islemTuslariArgsDuzenle(e)
		let items = [
			// { id: 'tamam', handler: _e => inst.tamamIstendi({ ..._e, ...e }) }
			{ id: 'onay', text: 'ONAY', handler: _e => inst.onayRedIstendi({ ..._e, ...e, state: true }) },
			{ id: 'red', text: 'RED', handler: _e => inst.onayRedIstendi({ ..._e, ...e, state: false }) }
		].filter(Boolean)
		if (!empty(items)) {
			liste.unshift(...items)
			part.ekSagButonIdSet = extend(part.ekSagButonIdSet ?? {}, asSet(items.map(_ => _.id)))
		}
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e)
		let {sender: tanimPart, islem, inst, rootBuilder: rfb, tanimFormBuilder: tanimForm, kaForm} = e
		rfb.addStyle(
			`$elementCSS .header { padding: 10px 0 }
			 $elementCSS .islemTuslari { --button-height: var(--full); height: 60px !important }
			 $elementCSS .islemTuslari .sag { width: 400px !important }
			 $elementCSS .islemTuslari #onay, $elementCSS .islemTuslari #red { color: ghostwhite; width: 130px !important }
			 $elementCSS .islemTuslari #onay.jqx-fill-state-normal { background-color: forestgreen !important }
			 $elementCSS .islemTuslari #onay.jqx-fill-state-hover { background-color: darkgreen !important }
			 $elementCSS .islemTuslari #onay.jqx-fill-state-pressed { background-color: green !important }
			 $elementCSS .islemTuslari #red.jqx-fill-state-normal { background-color: firebrick !important }
			 $elementCSS .islemTuslari #red.jqx-fill-state-hover { background-color: darkred !important }
			 $elementCSS .islemTuslari #red.jqx-fill-state-pressed { background-color: red !important }
			 $elementCSS .islemTuslari #red { margin-right: 50px !important }
			 $elementCSS .islemTuslari #vazgec { filter: invert(1) hue-rotate(180deg) }
			 $elementCSS .islemTuslari #vazgec.jqx-fill-state-normal { background-color: transparent !important }
			 @media (max-width: 800px) {
				 $elementCSS .header { padding: 5px 0 }
				 $elementCSS .islemTuslari { height: 50px !important }
				 $elementCSS .islemTuslari #onay, $elementCSS .islemTuslari #red { color: ghostwhite; width: 100px !important }
				 $elementCSS .islemTuslari #red { margin-right: 30px !important }
			 }
		`)
		tanimForm.addStyle(
			`$elementCSS {
				width: 850px !important; height: 600px !important;
				max-width: calc(var(--full) - 80px) !important;
				max-height: calc(var(--full) - 80px) !important;
				margin: 10px auto !important; padding: 30px !important;
				border-radius: 15px !important; box-shadow: 0 0 13px 0px darkcyan !important;
				overflow-x: hidden !important; overflow-y: auto !important
			}
			$elementCSS > div { margin-bottom: 20px !important }
			@media (max-width: 800px) {
				$elementCSS { width: 500px !important }
			}
			@media (max-height: 850px) {
				$elementCSS { margin: -35px auto !important }
			}
		`)
		/*
			;{
			//let fbd_islemTuslari = tanimPart.fbd_islemTuslari = rfb.addForm('islemTuslari')
			//	.setLayout(tanimPart.header.find('.islemTuslari'))
			let fbd_logo = rfb.addForm('logo')
				.setLayout(e => $(`<div/>`))
				.addStyle_wh(150, 100)
				.addCSS('fixed')
				.addStyle(
					`$elementCSS {
						top: 10px; right: 410px;
						opacity: .8;
						background-image: url(../../images/logo_217x217.png);
						background-size: cover;
						background-repeat: no-repeat
					}
					body.dark-theme $elementCSS { filter: invert(1) hue-rotate(180deg) }
					@media (max-width: 800px) {
						$elementCSS { right: 350px }
					}
				`)
		}
		*/
		;{
			tanimPart.fbd_header = tanimForm.addForm()
				.setLayout(_e => inst.getHeaderHTML({ ..._e, ..._e }))
				.addCSS('relative')
				.addStyle_fullWH(null, 'auto')
				.addStyle(
					`$elementCSS { font-size: 100%; padding-bottom: 0 }
					 $elementCSS .etiket { color: #555; font-size: 110%; margin-right: 10px }
					 $elementCSS .veri { font-weight: bold; font-size: 120%; color: royalblue }
					 $elementCSS .veri .ek-bilgi { font-size: 90%; color: mediumpurple; margin-left: 10px }
					 $elementCSS .veri.bakiye-var { color: forestgreen !important }
					 $elementCSS .veri.bakiye-yok { color: orangered !important }
					 $elementCSS .warn, $elementCSS .info { font-weight: bold; font-size: 100% }
					 $elementCSS .warn-etiket { font-weight: bolder; color: orange !important }
					 $elementCSS .warn { color: red !important }
					 $elementCSS .info { color: #888 !important }
					 $elementCSS .isyeri,
						 $elementCSS .musteri { min-height: 70px !important }
					 $elementCSS .isyeri .etiket { font-size: 90% }
					 $elementCSS .isyeri .veri { font-size: unset; color: violetred !important }
					 $elementCSS .footer { margin-top: 10px }
					 $elementCSS .logo {
						position: absolute !important;
						width: 150px; height: 100px;
						top: 120px; right: -30px;
						opacity: .8; pointer-events: none;
						background-size: contain;
						background-repeat: no-repeat;
						filter: drop-shadow(0 0 4px rgba(0, 0, 0,.4))
					}
					@media (max-width: 800px) {
						$elementCSS .logo {
							height: 80px;
							top: 140px; right: -75px
						}
					}
				`)
			tanimForm.addTextInput('cevaplayan', 'Cevaplayan').onAfterRun(({ builder: { input } }) =>
				setTimeout(() => input.focus(), 200))
			tanimForm.addTextInput('notlar', 'Notlar')
			tanimForm.addDiv('_dosyaAdi', 'Dosya Eki')
				.onBuildEk(({ builder: { input: parent } }) => {
					parent.addClass('full-wh')
					let accept = [
					    // Text
					    'text/plain',
					    'text/rtf',
					    'text/csv',
						'text/markdown',
						// HTML
						'text/html',
						'text/mhtml',
						'application/x-mhtml',
						// FastReport
						'application/x-frx',
						'application/x-fpx',
					    // PDF
					    'application/pdf',
					    // Office
					    'application/msword',                                                      // .doc
					    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
					    'application/vnd.ms-excel',                                                // .xls
					    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',       // .xlsx
					    // Images
					    'image/*'
					]
					let elm = $(`<input type="file" class="full-wh" accept="${accept.join(', ')}">`).appendTo(parent)
					elm.on('change', event =>
						inst.dosyaSecildi({ ...e, event, file: event.currentTarget.files?.[0] }))
				})
		}
		/*;{
			let form = tanimForm.addFormWithParent().yanYana()
				.addStyle(`$elementCSS { position: fixed !important; top: 10px !important; right: 10px !important; z-index: 10 !important }`)
			form.addButton('onay', 'ONAY')
				.addStyle_wh(150, 60)
				.addStyle(
					`$elementCSS > button { color: ghostwhite }
					 $elementCSS > button.jqx-fill-state-normal { background-color: forestgreen !important }
					 $elementCSS > button.jqx-fill-state-hover { background-color: darkgreen !important }
					 $elementCSS > button.jqx-fill-state-pressed { background-color: green !important }
				`)
				.onClick(_e => inst.onayRedIstendi({ ..._e, ...e, state: true }))
			form.addButton('red', 'RED')
				.addStyle_wh(150, 60)
				.addStyle(
					`$elementCSS > button { color: ghostwhite }
					 $elementCSS > button.jqx-fill-state-normal { background-color: firebrick !important }
					 $elementCSS > button.jqx-fill-state-hover { background-color: darkred !important }
					 $elementCSS > button.jqx-fill-state-pressed { background-color: red !important }
				`)
				.onClick(_e => inst.onayRedIstendi({ ..._e, ...e, state: false }))
		}*/
	}
	async dosyaSecildi({ sender: tanimPart, file }) {
		if (!file) {
			this.fileName = this.fileData = null
			return
		}
		let { name: fileName /*, type */ } = file
		let fileData = await file.bytes()
		fileData = fileData ? Base64.fromUint8Array(fileData) : null
		extend(this, { fileName, fileData })
	}
	async onayRedIstendi({ sender: tanimPart, state }) {
		let { wsResult } = this
		if (!wsResult)
			return
		
		let { sms, zamanDamgasi, telNo } = this
		if (sms) {
			let onayKodu = await jqxPrompt({
				etiket: `Lütfen ${'abc'} nolu telefona gelen SMS Onay Kodunu giriniz`,
				maxLength: 6,
				// placeHolder: '______',
				validate: ({ value: v }) => {
					if (asInteger(v) >= 100000 && asInteger(v) <= 999999)
						return true
					return hConfirm('Onay Kodu 6 haneli bir sayı olmalıdır')
				},
				buildEk: ({ builder: { id2Builder: { value: fbd } } }) => {
					fbd.addStyle(
						`$elementCSS > input {
							font-size: 170%; font-weight: bold; color: forestgreen; width: 250px !important;
							margin: 8px auto !important; padding: 3px 15px;
							text-align: center; letter-spacing: 13px
					}`)
				}
			})?.trim()
			if (!onayKodu)
				return
		}
		
		/* zamanDamgasi SMS onayı istenecek
		ekranda telNo input => telNo
		zaman damgasına gönderilirken:
			hash üretilecek text = 
				"Kaynak Vkn: [isyRow.vkno]	Unvan: [isyRow.birunvan]
				Hedef Vkn: [car.vkno]  Unvan: [car.birunvan]
				Hedef Bakiye: [mut.bakiye] + ' ' + ([mut.dvkod].bosmu() ? 'TL' : [mut.dvkod])
				Cevaplayan: ... (web sitesinde adını yazan) - [mut.cevaplayan]
				Onay Tel: [ekranTekNo], OnayKod: [ekranOnayKod]"
		email ile sonuç bildirilirken bu metin ve hash bilgisi de gönderilir


		SAYIN ....,
		... tarihli mutabakat için ... TL bakiye için onay/red verdiniz
		... telefon numarası ile SMS Onayı belirttiniz
		
		Yanıtınız zaman damgası ile kesinleştirilmiştir
		

		Teknik Bilgi:
		    docHash, tsr, timeUTC
		*/
		
		debugger
	}
	async getWSResult({ sender: tanimPart }) {
		let {id} = this
		id ??= ''
		let wsResult = this.wsResult = await app.wsMutabakatBilgi({ id })
		if (empty(wsResult))
			throw { isError: true, errorText: 'Mutabakat bilgileri belirlenemedi' }
		;['tarih', 'cevapTS'].forEach(k => {
			let v = wsResult[k]
			if (v && isString(v))
				v = wsResult[k] = asDate(v)
		})
		let {tarih, cevapTS, state, logoData} = wsResult
		if (cevapTS) {
			let cevapTSHTML = `<b class=orangered>${dateTimeAsKisaString(asDate(cevapTS))}</b>`
			let stateHTML = (
				state ? `<span class=forestgreen>ONAYLANMIŞTIR</span>` :
				`<span class=firebrick>RED EDİLMİŞTİR</span>`
			)
			throw { isError: true, errorText: `Bu mutabakat <b>${cevapTSHTML} tarihinde ${stateHTML}` }
		}
		if (isBuffer(logoData))
			logoData = wsResult.logoData = Base64.fromUint8Array(logoData)
		/*let wsResult = this.wsResult = {
			id: '12345',
			isyeri: { unvan: 'SKYLOG YAZILIM', vkn: '111' },
			must: { kod: 'MUS001', unvan: 'POLEN YAZILIM bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla ', vkn: '12345678901' },
			bakiye: 10_500.55, dvKod: '',
			telNo: '123', zamanDamgasi: true
		}*/
		return wsResult
	}
	getHeaderHTML({ sender: tanimPart }) {
		let {wsResult} = this
		wsResult ??= {}
		let {isyeri = {}, must = {}, bakiye, dvKod, zamanDamgasi, logoData} = wsResult
		dvKod ||= 'TL'
		bakiye = bakiye ? roundToBedelFra(bakiye) : null
		let tsUyariHTML = zamanDamgasi
			? [
				`<p>`,
					`⚠ <span class="warn-etiket">Uyarı</span>: <span class="warn">Onay veya Red butonuna tıklandığında Zaman Damgası için SMS Onayı alınacaktır</span>`,
				`</p>`
			].filter(Boolean).join('\n')
			: ''
		let logoCSS = logoData
			? `background-image: url(data:image/png;base64,${logoData})`
			: ''

		return $([
			`<div>`,
				`<div class="isyeri">`,
					`<span class="etiket">Mutabakat İsteyen:</span>`,
					`<span class="veri">${isyeri.unvan || ''}<span>`,
				`</div>`,
				`<hr>`,
				`<div class="musteri">`,
					`<div>`,
						`<span class="etiket">Sayın </span>`,
						`<span class="veri">${must.unvan || ''} <span>`,
						`<span class="veri ek-bilgi">(${must.vkn || ''}),<span>`,
					`</div>`,
				`</div>`,
				`<div class="bakiye">`,
					`<div>`,
						`<span class="etiket">Bakiyeniz </span>`,
						`<span class="veri ${bakiye ? 'bakiye-var' : 'bakiye-yok'}">${bakiye ? `${numberToString(bakiye)} ${dvKod}'dir` : 'YOKTUR'} <span>`,
					`</div>`,
				`</div>`,
				`<div class="footer">`,
					`<span class="info">Onay veya Red vermeniz rica olunur.</span>`,
				`</div>`,
				tsUyariHTML,
				`<hr>`,
				`<div class="logo" style="${logoCSS}" />`,
				// `<div class="logo" style="background-image: url(../../images/logo_217x217.png)" />`,
			`</div>`
		].join('\n'))
	}
}

/* 2aeb7ee5-b0fe-439d-a6b6-6443f2400e8a */
