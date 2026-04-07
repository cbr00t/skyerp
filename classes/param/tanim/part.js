class ParamTanimPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get rootPartName() { return 'paramTanim' } static get partName() { return this.rootPartName }
	static get isWindowPart() { return true } get defaultLayoutSelector() { return `#${this.class.rootPartName}` }
	get yenimi() { return this.islem == 'yeni' } get degistirmi() { return this.islem == 'degistir' } get silmi() { return this.islem == 'silmi' } get kopyami() { return this.islem == 'kopya' }
	get yeniVeyaKopyami() { return this.yenimi || this.kopyami } get degistirVeyaSilmi() { return this.degistirmi || this.silmi }

	constructor(e = {}) {
		super(e)
		extend(this, {
			islem: e.islem, mfSinif: e.mfSinif, inst: e.inst, eskiInst: e.eskiInst,
			kaydedince: e.kaydedince
		})
		let {mfSinif, inst, eskiInst} = this
		if (!inst && mfSinif)
			inst = this.inst = new mfSinif()
		if (inst && !mfSinif)
			mfSinif = this.mfSinif = inst.class
		if (inst && !eskiInst && this.degistirmi) {
			eskiInst = this.eskiInst = inst
			inst = this.inst = inst.deepCopy()
		}
		this.title = this.title || `${(mfSinif || {}).sinifAdi || 'Parametre'} Tanım`;
		let {islem} = this
		if (islem) {
			let islemText = islem[0].toUpperCase() + islem.slice(1)
			this.title += ` &nbsp;[<span class="window-title-ek">${islemText}</span>]`
		}
	}
	init(e = {}) {
		super.init(e)
		let {layout, mfSinif, inst, eskiInst, parentPart, builder} = this
		layout.addClass(`${this.class.partName} ${this.class.rootPartName}`)
		let header = this.header = layout.children('.header')
		let form = this.form = layout.children('.form')
		this.initBulForm(e)
		this.initIslemTuslari(e)
		if (!builder && mfSinif)
			builder = this.builder = mfSinif.getRootFormBuilder({ ...e, sender: this, part: this, parentPart, layout: form, mfSinif, inst, eskiInst })
		if (inst && builder)
			inst.builder = builder
	}
	run(e = {}) {
		super.run(e)
		this.initBuilder(e)
		let {layout} = this
		let inputs = layout.find('input[type=textbox], input[type=number]')
		inputs.on('focus', ({ currentTarget: t }) =>
			t.select())
		inputs.on('keyup', evt => {
			let key = evt?.key?.toLowerCase()
			if (key == 'enter' || key == 'linefeed')
				this.kaydetIstendi({ event: evt })
		})
	}
	initBulForm(e = {}) {
		let {header, form} = this
		let bulPart = this.bulPart = new FiltreFormPart({
			layout: header.find('.bulForm'),
			degisince: _e =>
				FiltreFormPart.hizliBulIslemi({ ...e, ...rest, sender: this, layout: form })
		});
		bulPart.run()
	}
	initIslemTuslari(e) {
		let islemTuslari = this.islemTuslari = this.header.find('.islemTuslari')
		let args = { sender: this, layout: islemTuslari }
		let _e = { args }
		if (this.islemTuslariArgsDuzenle(_e) === false)
			return null
		let islemTuslariPart = this.islemTuslariPart = new ButonlarPart(_e.args)
		islemTuslariPart.run()
		return islemTuslariPart
	}
	initBuilder(e) {
		let {builder} = this
		builder?.autoInitLayout()?.run(e)
	}
	islemTuslariArgsDuzenle(e) {
		let { args, builder } = e
		e.sender = this
		extend(args, {
			tip: 'tamamVazgec',
			id2Handler: {
				tamam: e => this.kaydetIstendi(e),
				vazgec: e => this.vazgecIstendi(e)
			}
		})
		if (builder) {
			e.builder = builder
			for (let _builder of builder.getItemsAndSelf())
				_builder?.islemTuslariArgsDuzenle?.(e)
		}
	}
	async kaydet(e) {
		let { mfSinif, inst, eskiInst } = this
		if (inst && eskiInst) {
			let { builder } = this
			let _e = { ...e, sender: this, builder, mfSinif, inst, eskiInst }
			for (let _builder of builder.getItemsAndSelf())
				await _builder?.kaydetOncesi?.(e)
			if (inst.kaydetOncesiIslemler)
				await inst.kaydetOncesiIslemler(_e)
			let almaSet = asSet(inst.class.deepCopyAlinmayacaklar)
			let _keys = Reflect.ownKeys(inst).filter(key => !almaSet[key])
			for (let key of _keys)
				eskiInst[key] = inst[key]
		}
		return true
	}
	async kaydetIstendi(e) {
		try {
			await this.kaydet(e)
			let { builder, kaydedince, mfSinif, inst, eskiInst } = this
			let _e = { ...e, sender: this, builder, mfSinif, inst, eskiInst }
			for (let _builder of builder.getItemsAndSelf())
				await _builder?.kaydedince?.(_e)
			await inst.kaydet(e)
			await inst?.kaydetSonrasiIslemler?.(_e)
			kaydedince?.call?.(this, _e)
			setTimeout(() => {
				let { activeWndPart: part } = app
				if (part && !part.isDestroyed)
					part.tazele?.()
			}, 100)
		}
		catch (ex) {
			hConfirm(getErrorText(ex, this.title))
			throw ex
		}
		this.close()
	}
	vazgecIstendi(e) {
		this.close()
	}
}
