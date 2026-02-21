class SecimBasSon extends Secim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'basSon' } static get tip() { return this.anaTip } get defaultBirKismimi() { return !!this.mfSinif }
	get value() { return this.birKismimi ? this.getConvertedValue(this.kodListe) : { basi: this.basi, sonu: this.sonu } }
	set value(value) { if (this.birKismimi) { this.kodListe = this.getConvertedValue(value) } else super.value = value }
	get ozetBilgiValue() {
		let value = super.ozetBilgiValue
		if (!value)
			return value
		if ($.isArray(value))
			return value.join(', ')
		if ($.isPlainObject(value))
			value = new CBasiSonu(value)
		return (value?.bosmu ?? true) ? null : value.toString()
	}
	set basiSonu(value) {
		this.basi = value
		this.sonu = value
	}
	readFrom(e) {
		if (!super.readFrom(e))
			return false
		let birKismimi = this.birKismimi = e.b ?? e.birKismi ?? e.birKismimi ?? this.defaultBirKismimi
		this.disindakilermi = e.disindakilermi ?? e.disindakiler ?? false
		if (birKismimi) {
			let {kodListe} = e; if (typeof kodListe == 'string') { kodListe = getFunc.call(this, e) }
			if (kodListe) { if (typeof kodListe == 'string') { kodListe = getFunc.call(this, e) } }
			this.kodListe = kodListe || []
		}
		else {		
			for (let key of ['basi', 'sonu']) {
				let value = this.getConvertedValue(e[key])
				if (value !== undefined)
					this[key] = value
			}
			let {basiSonu: value} = e
			if (value !== undefined)
				this.basiSonu = value
		}
		return true
	}
	writeTo(e) {
		if (!super.writeTo(e))
			return false
		let {birKismimi, disindakilermi} = this
		if (birKismimi)
			e.b = true
		if (disindakilermi)
			e.disindakilermi = true
		if (birKismimi) {
			let {kodListe} = this
			if (!empty(kodListe))
				e.kodListe = kodListe
		}
		else {
			let {basi, sonu} = this;
			if (basi != null)
				e.basi = this.getConvertedUIValue(basi)
			if (sonu != null)
				e.sonu = this.getConvertedUIValue(sonu)
		}
		delete e.hepsimi
		if (e._reduce && birKismimi && keys(e).length == 2)
			deleteKeys(e, 'b', 'birKismimi')
		return true
	}
	temizle(e) {
		super.temizle(e)
		$.extend(this, { birKismimi: this.defaultBirKismimi, disindakilermi: false, kodListe: [] })
		this.basi = this.sonu = this.getConvertedValue(null)
		this._ddListPart?.clear()
		return this
	}
	uiSetValues(e) {
		super.uiSetValues(e)
		let {parent} = e
		if (!parent?.length)
			return false
		let {birKismimi, disindakilermi} = this
		let bsParent = parent.find('.bs-parent')
		let birKismiParent = parent.find('.birKismi-parent')
		for (let key of ['basi', 'sonu'])
			bsParent.find(`.${key}.bs`).val(this.getConvertedUIValue(this[key]) ?? '')
		let {value} = this
		if (value?.basi != null) {
			let bs = value
			for (let [_key, _value] of entries(bs))
				this[_key] = bs[_key] = this.getConvertedValue(_value)
		}
		e.value = this.getConvertedValue(value)
		SecimBirKismi.uiSetValues_birKismi(e)
		parent.find('.birKismiToggle').val(birKismimi)
		parent.find('.disindakilermi').val(disindakilermi)
		this.birKismiToggleDegisti(e)
	}
	buildHTMLElementStringInto(e) {
		super.buildHTMLElementStringInto(e); let {mfSinif, birKismimi, isHidden, placeHolder} = this;
		e.target += `<div class="flex-row${isHidden ? ' jqx-hidden' : ''}">`
		if (mfSinif) { e.target += `<div class="birKismiToggle bool ozel"></div>` }
		e.target += `<div class="disindakilermi bool ozel"></div>`
		e.target += 	`<div class="bs-parent flex-row${birKismimi ? ' jqx-hidden' : ''}">`;
		if (mfSinif) { e.target += 	`<div class="veri basi bs" placeholder="${placeHolder}"></div>` }
		else { e.target += 	`<input class="veri basi bs" type="textbox" value="${this.getConvertedUIValue(this.basi) || ''}"></input>` }
		e.target += 		`<button class="kopya" tabindex="-1">--&gt;</button>`
		if (mfSinif) { e.target += 	`<div class="veri sonu bs" placeholder="${placeHolder}"></div>` }
		else { e.target += 	`<input class="veri sonu bs" type="textbox" value="${this.getConvertedUIValue(this.sonu) || ''}"></input>` }
		e.target += 	`</div>`
		if (mfSinif) { $.extend(e, { hidden: true, tip: this.class.tip })
		SecimBirKismi.buildHTMLElementStringInto_birKismi(e) }
		e.target += `</div>`
	}
	initHTMLElements(e) {
		super.initHTMLElements(e); let {tip} = this.class, {mfSinif} = this, {parent} = e;
		let btnKopya = parent.find('button.kopya'); btnKopya.jqxButton({ theme });
		btnKopya.on('click', evt => {
			let basi = parent.find('.basi.bs').val()
			let txtSonu = parent.find('.sonu.bs')
			// let sonu = basi
			let sonu = this.sonu = this.getConvertedValue(basi)
			txtSonu.val(sonu)
			txtSonu.select()
			for (let delayMS of [50, 150])
				setTimeout(() => txtSonu.val(sonu), delayMS)
			let input = txtSonu.find('input')
			if (!input?.length)
				input = txtSonu
		})
		if (mfSinif) {
			let focusWidget, {kodSaha} = mfSinif
			let dropDown = false, autoBind = false, noAutoWidth = true
			let maxRow = (app.params?.ortak?.autoComplete_maxRow || 50) * 4
			let modelKullanOlustur = e => {
				let {parentPart, builder} = this
				let {editor, editor: layout, selector, etiket, etiket: placeHolder} = e
				let value = this.getConvertedUIValue(this[selector])
				let part = new ModelKullanPart({
					parentPart, builder, layout, mfSinif, placeHolder,
					dropDown, noAutoWidth, autoBind, value, maxRow,
					argsDuzenle: ({ args }) => {
						$.extend(args, {
							itemHeight: 30, dropDownHeight: 410,
							renderSelectedItem: (index, rec) =>
								(rec.originalItem ?? rec)?.[kodSaha] ?? ''
						})
					}
				})
				if (part.autoBind)
					part.dataBindYapildiFlag = true
				editor.data('part', part)
				part.run()
				let {widget} = part
				part.change(({ value, item }) => {
					if (value != null)
						this[selector] = value
				})
				widget.input.on('focus', evt => {
					let {source} = widget
					if (!part.dataBindYapildiFlag && source?.dataBind && part && !part.isDestroyed) {
						source.dataBind()
						part.dataBindYapildiFlag = true
					}
					if (focusWidget != widget) {
						setTimeout(() => evt.target.select(), 150)
						focusWidget = widget
					}
				});
				widget.input.on('keyup', ({ key }) => {
					key = key?.toLowerCase()
					if (key == 'enter' || key == 'linefeed' || key == 'tab') {
						if (widget.isOpened())
							widget.close()
					}
				})
			}
			modelKullanOlustur({ selector: 'basi', etiket: 'Başı', editor: parent.find('.basi.bs') })
			modelKullanOlustur({ selector: 'sonu', etiket: 'Sonu', editor: parent.find('.sonu.bs') })
			let coklumu = true
			$.extend(e, {
				secim: this, tip, mfSinif, coklumu, autoBind, maxRow,
				getValue: this.value,
				setValue: e => this.value = this.getConvertedValue(e.value ?? e.kod)
			})
			SecimBirKismi.initHTMLElements_birKismi(e)
			this._ddListPart = e.part
			let chkBirKismiToggle = parent.find('.birKismiToggle')
			chkBirKismiToggle.jqxSwitchButton({ theme, width: 50, height: false, onLabel: 'B', offLabel: 'B', checked: this.birKismimi })
			chkBirKismiToggle.on('change', evt =>
				setTimeout(() => {
					this.birKismimi = $(evt.currentTarget).val()
					this.birKismiToggleDegisti(e)
				}, 10))
			let birKismiParent = parent.find('.birKismi-parent')
			let btnListedenSec = birKismiParent.find('.listedenSec')
			if (btnListedenSec?.length) {
				btnListedenSec.jqxButton({ theme })
				btnListedenSec.on('click', event => {
					let {_ddListPart: part} = this
					if (part && !part.isDestroyed)
						part.listedenSecIstendi({ ...e, sender: this, event })
				})
			}
			if (this.birKismimi)
				setTimeout(() => this.birKismiToggleDegisti(e), 10)
		}
		else {
			parent.find('.basi.bs').on('change', ({ currentTarget: target }) =>
				this.basi = this.getConvertedValue(target.value ?? ''))
			parent.find('.sonu.bs').on('change', ({ currentTarget: target }) =>
				this.sonu = this.getConvertedValue(target.value ?? ''))
		}
	}
	birKismiToggleDegisti(e = {}) {
		let {parent} = e; if (!parent?.length) { return }
		let bsParent = parent.find('.bs-parent'); if (!bsParent?.length) { return }
		let birKismiParent = parent.find('.birKismi-parent'); if (!birKismiParent?.length) { return }
		let {birKismimi} = this
		bsParent[birKismimi ? 'addClass' : 'removeClass']('jqx-hidden')
		birKismiParent[birKismimi ? 'removeClass' : 'addClass']('jqx-hidden')
	}
	getConvertedValue(value) {
		if (!this.birKismimi)
			return super.getConvertedValue(value)
		let arr = value == null ? [] : $.isArray(value) ? value : $.makeArray(value)
		if ($.isArray(arr) && !arr.length)
			arr = null
		return arr
	}
	birKismi() { this.birKismimi = true; return this }
	hepsi() { this.birKismimi = false; return this }
}
class SecimString extends SecimBasSon {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'string' }
}
class SecimInteger extends SecimBasSon {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'integer' }
	initHTMLElements(e) {
		super.initHTMLElements(e); let {parent} = e, inputs = parent.find('.bs-parent input.bs');
		if (inputs?.length) {
			inputs.on('keyup', evt => {
				let {target} = evt; let value = (target.value || '').replace(',', '.'); if (!value.endsWith('.')) { target.value = roundToFra(value, this.fra).toString().replace('.', ',') || null }
			});
			inputs.on('change', evt => {
				let {target} = evt; let value = (target.value || '').replace(',', '.');
				if (!value.endsWith('.')) { target.value = roundToFra(value, this.fra).toString().replace('.', ',') || null }
			})
		}
	}
	getConvertedValue(value) { value = value?.value ?? value; return value && $.isArray(value) ? value : inverseCoalesce(value, x => asInteger(x)) }
}
class SecimNumber extends SecimInteger {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'number' }
	readFrom(e) {
		if (!super.readFrom(e)) { return false }
		this.fra = inverseCoalesce(e.fra, x => asInteger(x)); return true
	}
	getConvertedValue(value) { value = value?.value ?? value; return value && $.isArray(value) ? value : inverseCoalesce(value, x => asFloat(x)) }
}
class SecimDate extends SecimBasSon {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'date' } get hasTime() { return false }
	get ozetBilgiValue() {
		let {value} = this
		if (value == null)
			return value
		if ($.isPlainObject(value))
			value = new CBasiSonu(value)
		return value?.bosmu ? null : new CBasiSonu({ basi: value.basi, sonu: value.sonu }).toString()
		// return value?.bosmu ? null : new CBasiSonu({ basi: dateToString(value.basi), sonu: dateToString(value.sonu) }).toString()
	}
	initHTMLElements(e) {
		super.initHTMLElements(e); let {parent} = e, inputs = parent.find('.bs-parent input.bs');
		if (inputs?.length) {
			let initPart = e => {
				let {selector} = e, layout = inputs.filter(`.${selector}:eq(0)`); let timeLayout;
				if (this.hasTime) { timeLayout = $(`<input class="veri ${selector}-time time bs" type="textbox" maxlength="8"></input>`); timeLayout.insertAfter(layout) }
				let _e = $.extend({}, e, { args: { layout, value: this[selector], timeLayout } }); this.tarihPartArgsDuzenle(_e);
				let part = e.part = this[`part_${selector}`] = new TarihUIPart(_e.args); part.change(e => { this[selector] = e.value }); part.run(); return part
			}
			initPart({ selector: 'basi' }); initPart({ selector: 'sonu' })
		}
	}
	tarihPartArgsDuzenle(e) { }
	getConvertedValue(value) { value = value?.value ?? value; return value && $.isArray(value) ? value : inverseCoalesce(value, x => asDate(tarihDegerDuzenlenmis(x))) }
	getConvertedUIValue(value) { return this.hasTime ? dateTimeToString(value) : dateToString(value) }
}
class SecimDateTime extends SecimDate {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'dateTime' } get hasTime() { return true }
	get ozetBilgiValue() {
		let {value} = this; if (value == null) { return value }
		if ($.isPlainObject(value)) { value = new CBasiSonu(value) }
		if (value?.bosDegilmi) { value = new CBasiSonu({ basi: dateTimeToString(value.basi), sonu: dateTimeToString(value.sonu) }) }
		return value
	}
	uiSetValues(e) {
		super.uiSetValues(e); let {parent} = e; if (!parent.length) { return false }
		let bsParent = parent.find('.bs-parent'); for (let key of ['basi', 'sonu']) { bsParent.find(`.${key}-time.bs`).val(asTimeAndToString(this.getConvertedValue(this[key])), '') }
	}
	initHTMLElements(e) {
		super.initHTMLElements(e); let {parent} = e, btnKopya = parent.find('button.kopya');
		if (btnKopya?.length) { btnKopya.on('click', evt => { let value = this.basi, txtSonu_time = parent.find('.sonu-time.bs'); txtSonu_time.val(asTimeAndToString(value, true)) }) }
	}
	tarihPartArgsDuzenle(e) { super.tarihPartArgsDuzenle(e) }
}

(function() {
	let tip2Sinif = Secim.prototype.constructor._tip2Sinif;
	let subClasses = [SecimBasSon, SecimString, SecimInteger, SecimNumber, SecimDate, SecimDateTime];
	for (let cls of subClasses) { let {tip} = cls; if (tip) tip2Sinif[tip] = cls }
})();
