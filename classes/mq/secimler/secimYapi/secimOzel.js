class SecimOzel extends Secim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'ozel' } static get tip() { return this.anaTip }
	static get attr() { return 'value' }
	get value() { return this._value }
	set value(value) { this._value = value }
	get ozellik() { return this.value }
	set ozellik(value) { this.value = value }

	readFrom(e) {
		if (!super.readFrom(e)) return false
		this.defaultValue = coalesce(e.defaultValue, e.default);
		this.value = this.getConvertedValue(e[this.class.attr] || e.value);
		return true
	}
	writeTo(e) {
		e = e || {}; if (!super.writeTo(e)) return false
		const {defaultValue, value} = this;
		if (!e._reduce && defaultValue != null) e.defaultValue = defaultValue
		if (value != null && value !=  '') e[this.class.attr] = value
		return true
	}
	temizle(e) {
		super.temizle(e); this.value = this.getConvertedValue(null);
		return this
	}
}

class SecimText extends SecimOzel {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'text' }

	readFrom(e) {
		if (!super.readFrom(e)) return false
		let cssClasses = e.cssClasses || e.css || []; if (cssClasses && typeof cssClasses == 'string') cssClasses = cssClasses.split(' ').filter(x => !!x)
		this.cssClasses = cssClasses; return true
	}
	writeTo(e) {
		e = e || {}; if (!super.writeTo(e)) return false
		const {cssClasses} = this; if (!$.isEmptyObject(cssClasses)) e.cssClasses = cssClasses
		return true
	}
	buildHTMLElementStringInto(e) {
		super.buildHTMLElementStringInto(e);
		const cssClasses = this.cssClasses || [], cssStr = $.isEmptyObject(cssClasses) ? '' : ` ${cssClasses.join(' ')}`;
		e.target += `<div class="veri ${this.class.tip} ${this.class.anaTip}${cssStr}">${this.getConvertedUIValue(this.value) || ''}</div>`
	}
	getConvertedValue(value) { value = value?.value ?? value; return value || '' }
}
class SecimOzellik extends SecimOzel {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'ozellik' } static get attr() { return 'ozellik' }

	readFrom(e) {
		if (!super.readFrom(e)) return false
		this.disindakilermi = coalesce(coalesce(e.disindakilermi, e.disindakiler), false);
		this.aynenAlinsinmi = coalesce(coalesce(e.aynenAlinsinmi, e.aynenAlinsin), false);
		return true
	}
	writeTo(e) {
		if (!super.writeTo(e))
			return false
		if (this.disindakilermi)
			e.disindakilermi = true
		if (this.aynenAlinsinmi)
			e.aynenAlinsinmi = true
		return true
	}
	temizle(e) {
		super.temizle(e);
		this.yazildigiGibimi = this.disindakilermi = false;
		return this
	}
	uiSetValues(e) {
		super.uiSetValues(e);
		const {parent} = e;
		if (!(parent && parent.length))
			return false
		parent.find('.yazildigiGibimi').val(this.yazildigiGibimi);
		parent.find('.disindakilermi').val(this.disindakilermi);
		parent.find('.ozellik').val(coalesce(this.getConvertedValue(this.value), ''))
	}
	buildHTMLElementStringInto(e) {
		super.buildHTMLElementStringInto(e);
		e.target += (
			`<div class="flex-row">` +
				`<input class="veri ozellik ozel" type="textbox" value="${this.getConvertedUIValue(this.value) || ''}"></input>` +
				`<div class="yazildigiGibimi bool ozel"></div>` +
				`<div class="disindakilermi bool ozel"></div>` +
			`</div>`
		);
	}
	initHTMLElements(e) {
		super.initHTMLElements(e);
		const {parent} = e;
		parent.find('.ozellik').on('change', evt =>
			this.ozellik = (evt.target.value || ''));
		const {yazildigiGibimi, disindakilermi} = this;
		const chkYazildigiGibimi = parent.find('.yazildigiGibimi');
		chkYazildigiGibimi.jqxSwitchButton({
			theme: theme, width: 50, height: false,
			onLabel: 'Y', offLabel: 'Y', checked: yazildigiGibimi
		});
		chkYazildigiGibimi.on('change', evt =>
			setTimeout(() => this.yazildigiGibimi = $(evt.currentTarget).val(), 10));
		const chkDisindakilermi = parent.find('.disindakilermi');
		chkDisindakilermi.jqxSwitchButton({
			theme: theme, width: 50, height: false,
			onLabel: 'D', offLabel: 'D', checked: yazildigiGibimi
		});
		chkDisindakilermi.on('change', evt =>
			setTimeout(() => this.disindakilermi = $(evt.currentTarget).val(), 10));
	}
	getConvertedValue(value) {
		value = value?.value ?? value;
		return value || ''
	}
}
class SecimTekilInteger extends SecimOzel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'tekilInteger' }

	uiSetValues(e) {
		super.uiSetValues(e);
		const {parent} = e;
		if (!(parent && parent.length))
			return false
		parent.find('.input').val(this.getConvertedValue(this.value))
	}
	buildHTMLElementStringInto(e) {
		super.buildHTMLElementStringInto(e);
		e.target += `<div class="flex-row">`;
		e.target += `<input class="veri right input ozel" type="textbox" maxlength="20" value="${this.getConvertedUIValue(this.value) || '0'}"></input>`;
		e.target += `</div>`
	}
	initHTMLElements(e) {
		super.initHTMLElements(e);
		const {parent} = e;
		const input = parent.find('.input');
		input.on('keyup', evt => {
			let value = (evt.target.value || '').replace(',', '.');
			if (!value.endsWith('.'))
				evt.target.value = roundToFra(value, this.fra).toString().replace('.', ',') || null;
		});
		input.on('change', evt =>
			this.value = roundToFra((evt.target.value || '').replace(',', '.'), this.fra) || null);
	}
	getConvertedValue(value) {
		value = value?.value ?? value;
		return value == null ? this.defaultValue : asInteger(value)
	}
}
class SecimTekilNumber extends SecimTekilInteger {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'tekilNumber' }
	readFrom(e) {
		if (!super.readFrom(e))
			return false
		this.fra = inverseNullCoalesce(e.fra, x => asInteger(x));
		return true
	}
	writeTo(e) {
		if (!super.writeTo(e))
			return false
		const {fra} = this;
		if (fra != null)
			e.fra = fra
		return true
	}
	getConvertedValue(value) {
		value = value?.value ?? value;
		return value == null ? this.defaultValue : asFloat(value)
	}
}
class SecimTekilDate extends SecimOzel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'tekilDate' }
	get hasTime() { return false }

	uiSetValues(e) {
		super.uiSetValues(e);
		const {parent} = e;
		if (!(parent && parent.length))
			return false
		parent.find('.input').val(null)
	}
	buildHTMLElementStringInto(e) {
		super.buildHTMLElementStringInto(e);
		e.target += `<div class="flex-row">`;
		e.target += 	`<input class="veri input ozel" type="textbox" maxlength="20" value="${this.getConvertedUIValue(this.value) || '0'}"></input>`;
		if (this.hasTime)
			e.target += `<input class="veri input-time time ozel" type="textbox" maxlength="8"></input>`
		e.target += `</div>`
	}
	initHTMLElements(e) {
		super.initHTMLElements(e);
		const {parent} = e;
		const input = parent.find('.input.ozel');
		if (input && input.length) {
			const _e = $.extend({}, e, { args: {
				layout: input,
				value: this.value,
				timeLayout: this.hasTime ? parent.find('.input-time.ozel') : null
			} });
			this.tarihPartArgsDuzenle(_e);
			const part = e.part = this.part = new TarihUIPart(_e.args);
			part.change(e =>
				this.value = e.value);
			part.run();
			return part
		}
	}
	tarihPartArgsDuzenle(e) { }
	getConvertedValue(value) { value = value?.value ?? value; return inverseCoalesce(value, x => asDate(tarihDegerDuzenlenmis(x))) }
	getConvertedUIValue(value) { return this.hasTime ? dateTimeToString(value) : dateToString(value) }
}
class SecimTekilDateTime extends SecimTekilDate {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get hasTime() { return true }
	uiSetValues(e) {
		super.uiSetValues(e); const {parent} = e;
		if (!parent?.length) return false
		const bsParent = parent.find('.bs-parent');
		bsParent.find('.input.time.ozel').val(asTimeAndToString(this.getConvertedValue(this.value)));
	}
}
class SecimBool extends SecimOzel {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'bool' }
	
	uiSetValues(e) {
		super.uiSetValues(e);
		const {parent} = e;
		if (!(parent && parent.length))
			return false
		parent.find('.bool').jqxSwitchButton({ checked: !!this.value })
	}
	buildHTMLElementStringInto(e) {
		super.buildHTMLElementStringInto(e);
		e.target += `<div class="flex-row">`;
		e.target += `	<div class="veri bool ozel"></div>`;
		e.target += `</div>`
	}
	initHTMLElements(e) {
		super.initHTMLElements(e);
		const {parent} = e;
		const divBool = parent.find('.bool');
		divBool.jqxSwitchButton({
			theme: theme, width: 80,
			checked: !!this.value,
			onLabel: 'EVET', offLabel: ''
		});
		divBool.on('change', evt =>
			setTimeout(() => this.value = $(evt.target).val(), 10))
	}
	getConvertedValue(value) {
		value = value?.value ?? value;
		return value == null ? this.defaultValue : asBool(value)
	}
}
class SecimBoolTrue extends SecimBool {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	readFrom(e) {
		e = e || {};
		super.readFrom(e);
		if (e.value == null)
			this.value = true
	}
}
class SecimTekSecim extends SecimOzel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'tekSecim' }
	static get birKismimi() { return false }
	
	get value() {
		return this.getConvertedValue((this.tekSecim || {}).char)
	}
	set value(value) {
		if (this.tekSecim)
			this.tekSecim.char = this.getConvertedValue(value)
	}
	get kaListe() { return (this.tekSecim || {}).kaListe }
	readFrom(e) {
		if (!super.readFrom(e)) return false
		let {tekSecim, tekSecimSinif, kaListe} = e;
		if (typeof tekSecimSinif == 'string') tekSecimSinif = getFunc.call(this, tekSecimSinif, e);
		if (!tekSecim && tekSecimSinif) tekSecim = new tekSecimSinif();
		if (tekSecim) {
			if (typeof tekSecim == 'string') tekSecim = getFunc.call(this, tekSecim, e);
			if ($.isPlainObject(tekSecim)) tekSecim = tekSecimSinif ? new tekSecimSinif(tekSecim) : null;
		}
		if (!tekSecim) tekSecim = new TekSecim()
		if (kaListe) {
			if (typeof kaListe == 'string') kaListe = getFunc.call(this, kaListe, e)
			if (kaListe) tekSecim.kaListe = kaListe
		}
		this.tekSecim = tekSecim;
		const {value, defaultValue} = this;
		/*if (defaultValue != null) tekSecim.defaultChar = defaultValue;*/
		if (value == null && defaultValue != null) value = defaultValue
		if (value != null) tekSecim.char = value
		return true
	}
	writeTo(e) {
		e = e || {}; if (!super.writeTo(e)) return false
		const {kaListe} = this; if (!e._reduce && kaListe != null) e.kaListe = kaListe
		return true
	}
	uiSetValues(e) {
		super.uiSetValues(e); const {parent} = e; if (!parent?.length) return false
		parent.find('.ddList').val(coalesce(this.getConvertedValue(this.value), ''))
	}
	buildHTMLElementStringInto(e) {
		super.buildHTMLElementStringInto(e); const {kaListe, char} = this;
		e.target += `<div class="flex-row">`;
		if (this.class.birKismimi) e.target += `<div class="hepsimi"></div>`;
		e.tip = this.class.tip;
		this.class.buildHTMLElementStringInto_birKismi(e);
		e.target += `</div>`
	}
	initHTMLElements(e) {
		super.initHTMLElements(e); const {mfSinif} = this;
		$.extend(e, {
			tip: this.class.tip, coklumu: this.class.birKismimi, autoBind: this.autoBind, getValue: this.value,
			setValue: e => this.value = e.value, mfSinif, source: mfSinif ? null : (e => this.kaListe)
		});
		const {parent} = e, btnListedenSec = parent.find('.listedenSec');
		if (btnListedenSec?.length) {
			btnListedenSec.jqxButton({ theme });
			btnListedenSec.on('click', evt => { const part = this._ddListPart; if (part && !part.isDestroyed) { part.listedenSecIstendi({ sender: this, event: evt }) } });
		}
		this.class.initHTMLElements_birKismi(e); this._ddListPart = e.part
	}
	static buildHTMLElementStringInto_birKismi(e) {
		const {tip} = e, isHidden = e.hidden ?? e.isHidden;
		e.target += `<div class="birKismi-parent flex-row${isHidden ? ' jqx-hidden' : ''}">`;
		e.target += 	`<button class="listedenSec">L</button>`;
		e.target += 	`<div class="veri ddList ${tip} ozel"></div>`;
		e.target += `</div>`;
		if (this.birkismimi) {
			e.target += `<div class="birKismi-bos-parent flex-row${isHidden ? ' jqx-hidden' : ''}">`;
			e.target += 	`<div class="veri-etiket ${tip} ozel">HEPSİ</div>`;
			e.target += `</div>`
		}
	}
	static initHTMLElements_birKismi(e) {
		const {parent, mfSinif, autoBind, coklumu, getValue, setValue} = e, source = e.source ?? e.loadServerDataBlock ?? e.loadServerData;
		const editor = parent.find('.ddList'); let focusWidget; 
		const part = e.part = new ModelKullanPart({
			layout: editor, dropDown: true, autoBind, coklumu, maxRow: e.maxRow, mfSinif, value: getFuncValue.call(this, getValue, e), /*placeHolder: this.etiket,*/
			source, kodGosterilsinmi: !source, argsDuzenle: e => { /*$.extend(e.args, { itemHeight: 40, dropDownHeight: 410 })*/ }
		});
		if (part.autoBind) { part.dataBindYapildiFlag = true }
		editor.data('part', part); part.run(); const {widget} = part;
		part.change(_e => { const value = _e.value ?? _e.kod, {item} = _e; if (value != null) getFuncValue.call(this, setValue, $.extend({}, e, _e)) });
		widget.input.on('focus', evt => {
			const {source} = widget;
			if (!part.dataBindYapildiFlag && source && source.dataBind) { source.dataBind(); part.dataBindYapildiFlag = true }
			if (focusWidget != widget) { setTimeout(() => evt.target.select(), 150); focusWidget = widget }
		});
		/*widget.input.on('blur', evt => { widget.focusedFlag = false; });*/
		widget.input.on('keyup', evt => {
			const key = evt.key?.toLowerCase();
			if (key == 'enter' || key == 'linefeed' || key == 'tab') { if (widget.isOpened()) widget.close() }
		})
	}
}
class SecimBirKismi extends SecimTekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'birKismi' } static get birKismimi() { return true }
	get value() { return this.hepsimi ? null : super.value } set value(value) { super.value = value }

	readFrom(e) {
		if (!super.readFrom(e)) return false
		this.hepsimi = e.hepsimi ?? true; return true
	}
	writeTo(e) {
		if (!super.writeTo(e)) return false
		if (!this.hepsimi) e.hepsimi = false
		return true
	}
	temizle(e) { super.temizle(e); this.hepsimi = true; return this }
	uiSetValues(e) {
		super.uiSetValues(e); const {parent} = e;
		if (!parent?.length) return false
		const {hepsimi} = this; parent.find('.hepsimi').val(hepsimi); this.hepsimiDegisti(e);
		$.extend(e, { value: this.getConvertedValue(this.value) }); this.class.uiSetValues_birKismi(e)
	}
	static uiSetValues_birKismi(e) {
		const {parent} = e; if (!parent?.length) return false
		const birKismiParent = parent.find('.birKismi-parent'), ddList = birKismiParent.find('.ddList'), value = e.value ?? null;
		if (value != null) ddList.val(value)
		else parent.jqxDropDownList('uncheckAll')
	}
	initHTMLElements(e) {
		super.initHTMLElements(e); const {parent} = e, {hepsimi} = this;
		const birKismiParent = parent.find('.birKismi-parent'), chkHepsimi = parent.find('.hepsimi');
		chkHepsimi.jqxSwitchButton({ theme: theme, width: 50, height: false, onLabel: 'H', offLabel: 'B', checked: hepsimi });
		chkHepsimi.on('change', evt => { setTimeout(() => { this.hepsimi = $(evt.currentTarget).val(); this.hepsimiDegisti(e) }, 10) });
		this.hepsimiDegisti(e)
	}
	hepsimiDegisti(e) {
		e = e || {}; const {parent} = e; if (!parent?.length) return
		const birKismiParent = parent.find('.birKismi-parent'); if (!(birKismiParent && birKismiParent.length)) return
		const {hepsimi} = this; birKismiParent[hepsimi ? 'addClass' : 'removeClass']('jqx-hidden');
		const birKismiBosParent = parent.find('.birKismi-bos-parent');
		if (birKismiBosParent?.length) birKismiBosParent[hepsimi ? 'removeClass' : 'addClass']('jqx-hidden')
	}
	getConvertedValue(value) { return value === null ? [] : $.isArray(value) ? value : $.makeArray(value) }
}

(function() {
	const tip2Sinif = Secim.prototype.constructor._tip2Sinif, subClasses = [
		SecimOzel, SecimOzellik, SecimTekilInteger, SecimTekilNumber,
		SecimTekilDate, SecimTekilDateTime, SecimBool, SecimBoolTrue,
		SecimTekSecim, SecimBirKismi
	];
	for (const cls of subClasses) { const {tip} = cls; if (tip) tip2Sinif[tip] = cls }
})();
