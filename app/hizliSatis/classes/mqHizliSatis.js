class MQHizliSatis extends MQCogul {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporKullanilirmi() { return false }
	static get kodListeTipi() { return 'HIZLI' } static get sinifAdi() { return 'Hızlı Satış' }
	static get tanimmi() { return true } static get tanimUISinif() { return ModelTanimPart }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, { vkn: new PInstStr(), bedel: new PInstNum() })
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e)
		let {sender: tanimPart, islem, inst, rootBuilder: rfb, tanimFormBuilder: tanimForm} = e
		tanimPart.title = this.sinifAdi
		tanimForm.altAlta().addCSS('absolute').addStyle_fullWH('max-content', 'max-content').addStyle(
			`$elementCSS { left: 40%; top: 25%; padding: 20px !important; border: 2px solid royalblue }
			@media(max-width: 950px) { $elementCSS { left: 35%; top: 15% } }
			@media(max-width: 800px) { $elementCSS { left: 28%; top: 10% } }
			@media(max-width: 650px) { $elementCSS { left: 3%; top: 3%; width: 85% !important } }
		`)
		let form = tanimForm.addFormWithParent().altAlta()
		form.addStyle(`
			$elementCSS > div:not(:first-child) { margin-top: 20px !important }
			$elementCSS > div > label { text-align: center !important }
		`).onAfterRun(({ builder: { layout } }) => {
			layout.on('keyup', ({ currentTarget: target, key }) => {
				key = key?.toLowerCase()
				if (key == 'enter' || key == 'linefeed')
					tanimPart.fbd_tamam.input.click()
			})
		})
		form.addTextInput('vkn', 'VKN / TCKN').setMaxLength(11).addCSS('center')
			.onAfterRun(({ builder: fbd }) => fbd.rootPart.fbd_vkn = fbd)
		form.addNumberInput('bedel', 'Bedel').setMaxLength(17).setFra(2)
			.onAfterRun(({ builder: fbd }) => fbd.rootPart.fbd_bedel = fbd)
		tanimForm.addButton('_kaydet', 'FATURA KES')
			.onClick(_e => inst.kaydetIstendi({ ...e, ..._e }))
			.onAfterRun(({ builder: fbd }) => fbd.rootPart.fbd_tamam = fbd)
			.addStyle(`$elementCSS { --margin-right: 40px; margin: 25px 0 0 var(--margin-right) !important }`)
			.addStyle_wh('calc(var(--full) - (var(--margin-right) * 2))', 70)
	}
	async kaydetIstendi({ sender: tanimPart }) {
		let e = arguments[0], {class: { sinifAdi: islemAdi }} = this
		try {
			await this.onKontrol(e)
			this._lastNotify?.close(); delete this._lastNotify
			if (await this.kaydet(e))
				tanimPart?.close()
		}
		catch (ex) {
			this._lastNotify = notify(getErrorText(ex), islemAdi, 'error')
			throw ex
		}
		// tanimPart.vazgecIstendi()
	}
	async kaydet(e) {
		let {class: { sinifAdi: islemAdi }} = this
		notify(`Kaydet işlemi yapılacak ... henüz hazırlanmadı`, islemAdi, 'warning')
		return false
	}
	async onKontrol({ sender: tanimPart }) {
		let {vkn, bedel} = this; bedel ??= 0
		let fail = (focusSelector, errorText) => {
			if (focusSelector) {
				focusSelector = `fbd_${focusSelector}`
				tanimPart[focusSelector]?.input?.focus?.()
			}
			throw { isError: true, errorText }
		}
		if (!vkn) { fail('vkn', `<b>VKN / TCKN</b> değeri girilmelidir`) }
		if (!VergiVeyaTCKimlik.uygunmu(vkn)) { fail('vkn', `<b>VKN / TCKN</b> değeri <b class=firebrick>${vkn}</b> geçersizdir`) }
		if (bedel <= 0) { fail('bedel', `<div><b>Bedel</b> değeri hatalıdır (<b class=firebrick>${numberToString(bedel)}</b>)</div><div/><div>Lütfen Sıfırdan büyük, geçerli bir bedel giriniz</div>`) }
	}
	static yeniTanimOncesiIslemler(e) {
		e.islem = 'izle'
		return super.yeniTanimOncesiIslemler(e)
	}
	async uiKaydetOncesiIslemler(e) {
		await this.kaydetIstendi(e)
		return false
	}
}
