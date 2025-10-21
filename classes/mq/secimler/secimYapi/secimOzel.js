class SecimOzel extends Secim {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'ozel' } static get tip() { return this.anaTip } static get attr() { return 'value' }
	get value() { return this._value } set value(value) { this._value = value }
	get ozetBilgiValue() { let value = super.ozetBilgiValue; if (value == null) { return value } return value?.toString() }
	get ozellik() { return this.value } set ozellik(value) { this.value = value }
	readFrom(e) {
		if (!super.readFrom(e)) { return false }
		this.defaultValue = e.defaultValue ?? e.default; this.value = this.getConvertedValue(e[this.class.attr] || e.value); return true
	}
	writeTo(e) {
		if (!super.writeTo(e))
			return false
		let {defaultValue, value} = this
		if (defaultValue != null)
			e.defaultValue = defaultValue
		if (!(value == null || value == ''))
			e[this.class.attr] = value
		return true
	}
	temizle(e) { super.temizle(e); this.value = this.getConvertedValue(null); return this }
}
class SecimText extends SecimOzel {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'text' }
	readFrom(e) {
		if (!super.readFrom(e)) { return false }
		let cssClasses = e.cssClasses || e.css || []; if (cssClasses && typeof cssClasses == 'string') { cssClasses = cssClasses.split(' ').filter(x => !!x) }
		this.cssClasses = cssClasses; return true
	}
	writeTo(e) {
		e = e || {}; if (!super.writeTo(e)) { return false }
		let {cssClasses} = this; if (!$.isEmptyObject(cssClasses)) { e.cssClasses = cssClasses } return true
	}
	buildHTMLElementStringInto(e) {
		super.buildHTMLElementStringInto(e); let cssClasses = this.cssClasses || [], cssStr = $.isEmptyObject(cssClasses) ? '' : ` ${cssClasses.join(' ')}`;
		e.target += `<div class="veri ${this.class.tip} ${this.class.anaTip}${cssStr}">${this.getConvertedUIValue(this.value) || ''}</div>`
	}
	getConvertedValue(value) { value = value?.value ?? value; return value || '' }
}
class SecimOzellik extends SecimOzel {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'ozellik' } static get attr() { return 'ozellik' }
	readFrom(e) {
		if (!super.readFrom(e)) { return false }
		this.disindakilermi = e.disindakilermi ?? e.disindakiler ?? false;
		this.aynenAlinsinmi = e.aynenAlinsinmi ?? e.aynenAlinsin ?? false;
		return true
	}
	writeTo(e) {
		if (!super.writeTo(e)) { return false }
		if (this.disindakilermi) { e.disindakilermi = true }
		if (this.aynenAlinsinmi) { e.aynenAlinsinmi = true }
		return true
	}
	temizle(e) { super.temizle(e); this.yazildigiGibimi = this.disindakilermi = false; return this }
	uiSetValues({ parent }) {
		super.uiSetValues(...arguments)
		if (!parent?.length)
			return false
		parent.find('.yazildigiGibimi').val(this.yazildigiGibimi)
		parent.find('.disindakilermi').val(this.disindakilermi)
		parent.find('.ozellik').val(this.getConvertedValue(this.value) ?? '')
	}
	buildHTMLElementStringInto(e) {
		super.buildHTMLElementStringInto(e); e.target += (
			`<div class="flex-row">` +
				`<input class="veri ozellik ozel" type="textbox" value="${this.getConvertedUIValue(this.value) || ''}"></input>` +
				`<div class="yazildigiGibimi bool ozel"></div>` +
				`<div class="disindakilermi bool ozel"></div>` +
			`</div>`
		);
	}
	initHTMLElements(e) {
		super.initHTMLElements(e)
		let {parent} = e, {yazildigiGibimi, disindakilermi} = this
		let chkYazildigiGibimi = parent.find('.yazildigiGibimi'), chkDisindakilermi = parent.find('.disindakilermi');
		parent.find('.ozellik').on('change', evt => { this.ozellik = (evt.target.value || '') });
		if (chkYazildigiGibimi?.length) {
			chkYazildigiGibimi.jqxSwitchButton({ theme, width: 50, height: false, onLabel: 'Y', offLabel: 'Y', checked: yazildigiGibimi });
			chkYazildigiGibimi.on('change', evt => setTimeout(() => this.yazildigiGibimi = $(evt.currentTarget).val(), 10))
		}
		if (chkDisindakilermi?.length) {
			chkDisindakilermi.jqxSwitchButton({ theme, width: 50, height: false, onLabel: 'D', offLabel: 'D', checked: yazildigiGibimi });
			chkDisindakilermi.on('change', evt => setTimeout(() => this.disindakilermi = $(evt.currentTarget).val(), 10))
		}
	}
	getConvertedValue(value) {
		value = value?.value ?? value
		return value || ''
	}
}
class SecimTekilInteger extends SecimOzel {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'tekilInteger' }
	uiSetValues(e) {
		super.uiSetValues(e); let {parent} = e; if (!parent.length) { return false }
		parent.find('.input').val(this.getConvertedValue(this.value))
	}
	buildHTMLElementStringInto(e) {
		super.buildHTMLElementStringInto(e); e.target += `<div class="flex-row">`;
		e.target += `<input class="veri right input ozel" type="textbox" maxlength="20" value="${this.getConvertedUIValue(this.value) || '0'}"></input>`;
		e.target += `</div>`
	}
	initHTMLElements(e) {
		super.initHTMLElements(e); let {parent} = e, input = parent.find('.input');
		input.on('keyup', evt => { let value = (evt.target.value || '').replace(',', '.'); if (!value.endsWith('.')) { evt.target.value = roundToFra(value, this.fra).toString().replace('.', ',') || null } });
		input.on('change', evt => { this.value = roundToFra((evt.target.value || '').replace(',', '.'), this.fra) || null })
	}
	getConvertedValue(value) { value = value?.value ?? value; return value == null ? this.defaultValue : asInteger(value) }
}
class SecimTekilNumber extends SecimTekilInteger {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'tekilNumber' }
	readFrom(e) { if (!super.readFrom(e)) { return false } this.fra = inverseNullCoalesce(e.fra, x => asInteger(x)); return true }
	writeTo(e) { if (!super.writeTo(e)) { return false } let {fra} = this; if (fra != null) { e.fra = fra } return true }
	getConvertedValue(value) { value = value?.value ?? value; return value == null ? this.defaultValue : asFloat(value) }
}
class SecimTekilDate extends SecimOzel {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'tekilDate' } get hasTime() { return false }
	get ozetBilgiValue() { let {value} = this; if (value == null) { return value } return dateToString(value) }
	uiSetValues(e) { super.uiSetValues(e); let {parent} = e; if (!parent.length) { return false } parent.find('.input').val(this.getConvertedUIValue(this.value)) }
	buildHTMLElementStringInto(e) {
		super.buildHTMLElementStringInto(e); let {placeHolder} = this;
		e.target += `<div class="flex-row">`;
		e.target += 	`<input class="veri input ozel" type="textbox" maxlength="20" placeholder="${placeHolder}" value="${this.getConvertedUIValue(this.value) || '0'}"></input>`;
		if (this.hasTime) { e.target += `<input class="veri input-time time ozel" type="textbox" maxlength="8"></input>` }
		e.target += `</div>`
	}
	initHTMLElements(e) {
		super.initHTMLElements(e); let {parent} = e, input = parent.find('.input.ozel');
		if (input?.length) {
			let layout = input, {value, hasTime} = this;
			let _e = $.extend({}, e, { args: { layout, value, timeLayout: hasTime ? parent.find('.input-time.ozel') : null } });
			this.tarihPartArgsDuzenle(_e);
			let part = e.part = this.part = new TarihUIPart(_e.args);
			part.change(e => this.value = e.value); part.run(); return part
		}
	}
	tarihPartArgsDuzenle(e) { }
	getConvertedValue(value) { value = value?.value ?? value; return inverseCoalesce(value, x => asDate(tarihDegerDuzenlenmis(x))) }
	getConvertedUIValue(value) { return this.hasTime ? dateTimeToString(value) : dateToString(value) }
}
class SecimTekilDateTime extends SecimTekilDate {
	static { window[this.name] = this; this._key2Class[this.name] = this } get hasTime() { return true }
	get ozetBilgiValue() { let {value} = this; if (value == null) { return value } return dateTimeToString(value) }
	uiSetValues(e) {
		super.uiSetValues(e); let {parent} = e; if (!parent?.length) { return false }
		let bsParent = parent.find('.bs-parent'); bsParent.find('.input.time.ozel').val(asTimeAndToString(this.getConvertedValue(this.value)));
	}
}
class SecimBool extends SecimOzel {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'bool' }
	get ozetBilgiValue() {
		let {value} = this; if (value == null) { return value }
		return typeof (value == 'boolean') ? (value ? this.etiket : null) : value?.toString()
	}
	uiSetValues(e) { super.uiSetValues(e); let {parent} = e; if (!parent.length) { return false } parent.find('.bool').jqxSwitchButton({ checked: !!this.value }) }
	buildHTMLElementStringInto(e) {
		super.buildHTMLElementStringInto(e); e.target += `<div class="flex-row">`;
		e.target += `	<div class="veri bool ozel"></div>`;
		e.target += `</div>`
	}
	initHTMLElements(e) {
		super.initHTMLElements(e); let {parent} = e, divBool = parent.find('.bool');
		divBool.jqxSwitchButton({ theme, width: 80, checked: !!this.value, onLabel: 'EVET', offLabel: '' });
		divBool.on('change', evt => { setTimeout(() => this.value = $(evt.target).val(), 10) })
	}
	getConvertedValue(value) { value = value?.value ?? value; return value == null ? this.defaultValue : asBool(value) }
}
class SecimBoolTrue extends SecimBool {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	readFrom(e) { e = e || {}; super.readFrom(e); if (e.value == null) { this.value = true } }
}
class SecimTekSecim extends SecimOzel {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'tekSecim' }
	static get birKismimi() { return false } get birKismimi() { return this.class.birKismimi }
	get value() { return this.getConvertedValue(this.tekSecim?.char) }
	set value(value) {
		let {tekSecim} = this
		if (tekSecim) { tekSecim.char = this.getConvertedValue(value) }
	}
	get ozetBilgiValue() {
		let {value} = this
		if (value == null)
			return value
		if (!$.isArray(value))
			value = [value]
		value = value.filter(x => !!x)
		let {kaDict} = this.tekSecim; value = value.map(kod => kaDict[kod] ?? kod)
		return this.birKismimi ? value.filter(x => !!x).map(x => x?.aciklama ?? x) : value[0]
	}
	get secilen() {
		let {coklumu, tekSecim: { secilen }} = this
		if (secilen != null && coklumu && !$.isArray(secilen))
			secilen = [secilen]
		return secilen
	}
	get kaListe() { return this.tekSecim?.kaListe }
	
	readFrom(e) {
		if (!super.readFrom(e))
			return false
		let {tekSecim, tekSecimSinif, kaListe} = e
		if (typeof tekSecimSinif == 'string')
			tekSecimSinif = getFunc.call(this, tekSecimSinif, e)
		if (!tekSecim && tekSecimSinif)
			tekSecim = new tekSecimSinif()
		if (tekSecim) {
			if (typeof tekSecim == 'string') { tekSecim = getFunc.call(this, tekSecim, e) }
			if ($.isPlainObject(tekSecim))
				tekSecim = tekSecimSinif ? new tekSecimSinif(tekSecim) : null
		}
		if (!tekSecim) 
			tekSecim = new TekSecim()
		if (kaListe) {
			if (typeof kaListe == 'string')
				kaListe = getFunc.call(this, kaListe, e)
			if (kaListe)
				tekSecim.kaListe = kaListe
		}
		this.tekSecim = tekSecim
		let {value, defaultValue} = this
		if (value == null && defaultValue != null) { value = defaultValue }
		if (value != null) { tekSecim.char = value }
		this.autoBindFlag = e.autoBind ?? e.autoBindFlag ?? false
		this.disindakilermi = e.disindakilermi ?? e.disindakiler ?? false
		return true
	}
	writeTo(e = {}) {
		if (!super.writeTo(e))
			return false
		let {_reduce: reduce} = e, {disindakilermi, kaListe} = this
		e.birKismimi = true
		if (disindakilermi)
			e.disindakilermi = true
		if (!reduce && kaListe != null)
			e.kaListe = kaListe
		return true
	}
	temizle(e) { 
		super.temizle(e)
		this.disindakilermi = false
		return this
	}
	uygunmu(e) {
		let kod = typeof e == 'object' ? e.char ?? e.kod ?? e.value : e
		if (kod === undefined) { return false }
		return this.uygunmuDevam(kod)
	}
	uygunmuDevam(kod) { return this.value == kod }
	uiSetValues({ parent }) {
		super.uiSetValues(...arguments)
		if (!parent?.length)
			return false
		parent.find('.disindakilermi').val(this.disindakilermi)
		parent.find('.ddList').val(this.getConvertedValue(this.value) ?? '')
	}
	buildHTMLElementStringInto(e) {
		super.buildHTMLElementStringInto(e)
		let {kaListe, char, isHidden, class: { tip, birKismimi }} = this
		e.tip = tip;
		e.target += `<div class="flex-row${isHidden ? ' jqx-hidden' : ''}">`;
		if (birKismimi)
			e.target += `<div class="hepsimi bool ozel"></div>`
		e.target += `<div class="disindakilermi bool ozel"></div>`
		this.class.buildHTMLElementStringInto_birKismi(e)
		e.target += `</div>`
	}
	static buildHTMLElementStringInto_birKismi(e) {
		let {tip, hidden = e.isHidden} = e, {birkismimi} = this
		e.target += `<div class="birKismi-parent flex-row${hidden ? ' jqx-hidden' : ''}">`
		e.target += 	`<button class="listedenSec" style="margin-left: 5px">L</button>`
		e.target += 	`<div class="veri ddList ${tip} ozel"></div>`
		e.target += `</div>`
		if (birkismimi) {
			e.target += `<div class="birKismi-bos-parent flex-row${hidden ? ' jqx-hidden' : ''}">`
			e.target += 	`<div class="veri-etiket ${tip} ozel">HEPSİ</div>`
			e.target += `</div>`
		}
	}
	initHTMLElements(e) {
		super.initHTMLElements(e);
		let secim = this, {value, parent} = e
		let {mfSinif, autoBindFlag: autoBind, class: { tip, birKismimi: coklumu }} = this
		$.extend(e, {
			secim, tip, coklumu, autoBind, mfSinif,
			getValue: this.value,
			setValue: ({ value }) => this.value = value,
			source: mfSinif ? null : (e => this.kaListe)
		})
		let btnListedenSec = parent.find('.listedenSec')
		if (btnListedenSec?.length) {
			btnListedenSec.jqxButton({ theme })
			btnListedenSec.on('click', evt => {
				let {_ddListPart: part} = this
				if (part && !part.isDestroyed)
					part.listedenSecIstendi({ sender: this, event: evt })
			})
		}
		this.class.initHTMLElements_birKismi(e)
		this._ddListPart = e.part
	}
	static initHTMLElements_birKismi(e) {
		let {placeHolder} = this, {parent, mfSinif, autoBind, coklumu, getValue, setValue } = e
		let {secim: sec, secim: { disindakilermi } = {}} = e
		let source = e.source ?? e.loadServerDataBlock ?? e.loadServerData
		let editor = parent.find('.ddList')
		let focusWidget, part = e.part = new ModelKullanPart({
			layout: editor, dropDown: !coklumu, autoBind, coklumu, maxRow: e.maxRow, mfSinif, value: getFuncValue.call(this, getValue, e), /*placeHolder: this.etiket,*/
			placeHolder, source, kodGosterilsinmi: !source, argsDuzenle: e => { /*$.extend(e.args, { itemHeight: 40, dropDownHeight: 410 })*/ }
		})
		let chkDisindakilermi = parent.find('.disindakilermi')
		if (chkDisindakilermi?.length) {
			chkDisindakilermi.jqxSwitchButton({ theme, width: 50, height: false, onLabel: 'D', offLabel: 'D', checked: disindakilermi });
			chkDisindakilermi.on('change', ({ currentTarget: target }) =>
				setTimeout(() => sec.disindakilermi = $(target).val(), 10))
		}
		if (part.autoBind)
			part.dataBindYapildiFlag = true
		editor.data('part', part); part.run()
		let {widget} = part
		part.change(_e => {
			let value = _e.value ?? _e.kod, {item} = _e
			if (value !== undefined)
				setValue.call(this, { ...e, ..._e })
		})
		widget.input.on('focus', evt => {
			let {source} = widget
			if (!part.dataBindYapildiFlag && source?.dataBind) {
				source.dataBind()
				part.dataBindYapildiFlag = true
			}
			if (focusWidget != widget) {
				setTimeout(() => evt.target.select(), 150)
				focusWidget = widget
			}
		})
		widget.input.on('keyup', evt => {
			let key = evt.key?.toLowerCase();
			if (key == 'enter' || key == 'linefeed' || key == 'tab') {
				if (widget.isOpened())
					widget.close()
			}
		})
	}
	autoBind() { this.autoBindFlag = true; return this } noAutoBind() { this.autoBindFlag = false; return this }
	disindakiler() { this.disindakilermi = true; return this } secilenler() { this.disindakilermi = false; return this }
}
class SecimBirKismi extends SecimTekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'birKismi' } static get birKismimi() { return true }
	get value() { return this.hepsimi ? null : super.value }
	set value(value) { super.value = value }
	readFrom(e) {
		if (!super.readFrom(e))
			return false
		this.hepsimi = e.hepsimi ?? true
		return true
	}
	writeTo(e) {
		if (!super.writeTo(e))
			return false
		let {hepsimi} = this
		if (!hepsimi)
			e.hepsimi = false
		return true
	}
	temizle(e) { 
		super.temizle(e)
		this.hepsimi = true
		return this
	}
	uygunmuDevam(kod) {
		if (this.hepsimi) { return true } let values = $.makeArray(this.value);
		for (let value of values) { if (value == kod) { return true } }
		return false
	}
	uiSetValues(e) {
		super.uiSetValues(e); let {parent} = e; if (!parent?.length) { return false }
		let {hepsimi} = this; parent.find('.hepsimi').val(hepsimi); this.hepsimiDegisti(e);
		$.extend(e, { value: this.getConvertedValue(this.value) }); this.class.uiSetValues_birKismi(e)
	}
	static uiSetValues_birKismi(e) {
		let {parent} = e; if (!parent?.length) { return false }
		let birKismiParent = parent.find('.birKismi-parent'), ddList = birKismiParent.find('.ddList'), value = e.value ?? null;
		if (value != null) { ddList.val(value) } else { parent.jqxDropDownList('uncheckAll') }
	}
	initHTMLElements(e) {
		super.initHTMLElements(e); let {parent} = e, {hepsimi} = this, birKismiParent = parent.find('.birKismi-parent'), chkHepsimi = parent.find('.hepsimi');
		chkHepsimi.jqxSwitchButton({ theme, width: 50, height: false, onLabel: 'H', offLabel: 'B', checked: hepsimi });
		chkHepsimi.on('change', evt => { setTimeout(() => { this.hepsimi = $(evt.currentTarget).val(); this.hepsimiDegisti(e) }, 10) });
		this.hepsimiDegisti(e)
	}
	hepsimiDegisti(e) {
		e = e || {}; let {parent} = e, {hepsimi} = this; if (!parent?.length) { return }
		let birKismiParent = parent.find('.birKismi-parent'); if (!birKismiParent?.length) { return }
		birKismiParent[hepsimi ? 'addClass' : 'removeClass']('jqx-hidden');
		let birKismiBosParent = parent.find('.birKismi-bos-parent'); if (birKismiBosParent?.length) birKismiBosParent[hepsimi ? 'removeClass' : 'addClass']('jqx-hidden')
	}
	getConvertedValue(value) { return value === null ? [] : $.isArray(value) ? value : $.makeArray(value) }
	hepsi() { this.hepsimi = true; return this } birKismi() { this.hepsimi = false; return this }
}

(function() {
	let tip2Sinif = Secim.prototype.constructor._tip2Sinif, subClasses = [
		SecimOzel, SecimOzellik, SecimTekilInteger, SecimTekilNumber,
		SecimTekilDate, SecimTekilDateTime, SecimBool, SecimBoolTrue,
		SecimTekSecim, SecimBirKismi
	];
	for (let cls of subClasses) { let {tip} = cls; if (tip) tip2Sinif[tip] = cls }
})()
