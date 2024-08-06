class SecimBasSon extends Secim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'basSon' } static get tip() { return this.anaTip } get defaultBirKismimi() { return !!this.mfSinif }
	get value() { return this.birKismimi ? this.kodListe : { basi: this.basi, sonu: this.sonu } }
	set value(value) { if (this.birKismimi) this.kodListe = this.getConvertedValue(value); else super.value = value }
	get ozetBilgiValue() {
		let value = super.ozetBilgiValue; if (!value) { return value } if ($.isArray(value)) { return value.join(', ') }
		if ($.isPlainObject(value)) { value = new CBasiSonu(value) } return value?.bosmu ? null : value.toString()
	}
	set basiSonu(value) { this.basi = value; this.sonu = value }
	readFrom(e) {
		if (!super.readFrom(e)) { return false }
		const birKismimi = this.birKismimi = e.birKismi ?? e.birKismimi ?? this.defaultBirKismimi;
		if (birKismimi) {
			let {kodListe} = e; if (typeof kodListe == 'string') { kodListe = getFunc.call(this, e) }
			if (kodListe) { if (typeof kodListe == 'string') { kodListe = getFunc.call(this, e) } }
			this.kodListe = kodListe || []
		}
		else {		
			for (const key of ['basi', 'sonu']) { const value = this.getConvertedValue(e[key]); if (value !== undefined) { this[key] = value } }
			let value = e.basiSonu; if (value !== undefined) { this.basiSonu = value }
		}
		return true
	}
	writeTo(e) {
		if (!super.writeTo(e)) { return false } const {birKismimi} = this; if (this.birKismimi) { e.birKismimi = true }
		if (birKismimi) { const {kodListe} = this; if (kodListe != null) { e.kodListe = kodListe } }
		else { const {basi, sonu} = this; if (basi != null) { e.basi = basi } if (sonu != null) { e.sonu = sonu } }
		return true
	}
	temizle(e) {
		super.temizle(e); $.extend(this, { birKismimi: this.defaultBirKismimi, kodListe: [] }); this.basi = this.sonu = this.getConvertedValue(null);
		let part = this._ddListPart; if (part) { part.clear() }
		return this
	}
	uiSetValues(e) {
		super.uiSetValues(e); const {parent} = e; if (!parent?.length) { return false }
		const {birKismimi} = this, bsParent = parent.find('.bs-parent'), birKismiParent = parent.find('.birKismi-parent');
		for (const key of ['basi', 'sonu']) { bsParent.find(`.${key}.bs`).val(this.getConvertedValue(this[key]) ?? '') }
		e.value = this.getConvertedValue(this.value);
		SecimBirKismi.uiSetValues_birKismi(e); parent.find('.birKismiToggle').val(birKismimi); this.birKismiToggleDegisti(e)
	}
	buildHTMLElementStringInto(e) {
		super.buildHTMLElementStringInto(e); const {mfSinif, birKismimi, isHidden} = this;
		e.target += `<div class="flex-row${isHidden ? ' jqx-hidden' : ''}">`;
		if (mfSinif) { e.target += `<div class="birKismiToggle"></div>`; }
		e.target += 	`<div class="bs-parent flex-row${birKismimi ? ' jqx-hidden' : ''}">`;
		if (mfSinif) { e.target += 	`<div class="veri basi bs"></div>` }
		else { e.target += 	`<input class="veri basi bs" type="textbox" value="${this.getConvertedUIValue(this.basi) || ''}"></input>` }
		e.target += 		`<button class="kopya">--&gt;</button>`;
		if (mfSinif) { e.target += 	`<div class="veri sonu bs"></div>` }
		else { e.target += 	`<input class="veri sonu bs" type="textbox" value="${this.getConvertedUIValue(this.sonu) || ''}"></input>` }
		e.target += 	`</div>`;
		if (mfSinif) { $.extend(e, { hidden: true, tip: this.class.tip }); SecimBirKismi.buildHTMLElementStringInto_birKismi(e) }
		e.target += `</div>`
	}
	initHTMLElements(e) {
		super.initHTMLElements(e); const {tip} = this.class, {mfSinif} = this, {parent} = e;
		const btnKopya = parent.find('button.kopya'); btnKopya.jqxButton({ theme });
		btnKopya.on('click', evt => {
			const basi = parent.find('.basi.bs').val(), txtSonu = parent.find('.sonu.bs'), sonu = basi;
			this.sonu = this.getConvertedValue(basi); txtSonu.val(sonu); txtSonu.select();
			for (const delayMS of [50, 150]) { setTimeout(() => txtSonu.val(sonu), delayMS) }
			let input = txtSonu.find('input'); if (!input?.length) { input = txtSonu } /*input?.focus()*/
		});
		if (mfSinif) {
			let focusWidget; const {kodSaha} = mfSinif, dropDown = false, autoBind = false, noAutoWidth = true, maxRow = app.params.ortak.autoComplete_maxRow * 4;
			const modelKullanOlustur = e => {
				const {editor, selector, etiket} = e, value = this.getConvertedUIValue(this[selector]), {parentPart, builder} = this, layout = editor;
				const placeHolder = etiket, kod = value
				const part = new ModelKullanPart({
					parentPart, builder, layout, mfSinif, placeHolder, dropDown, noAutoWidth, autoBind, kod, maxRow,
					argsDuzenle: e => { $.extend(e.args, { itemHeight: 30, dropDownHeight: 410, renderSelectedItem: (index, rec) => { rec = rec.originalItem || rec || {}; return rec[kodSaha] || '' } }) }
				});
				if (part.autoBind) { part.dataBindYapildiFlag = true }
				editor.data('part', part); part.run(); const {widget} = part;
				part.change(_e => { const {kod, item} = _e; if (kod != null) { this[selector] = kod } });
				widget.input.on('focus', evt => {
					const {source} = widget;
					if (!part.dataBindYapildiFlag && source?.dataBind) { if (part && !part.isDestroyed) { source.dataBind(); part.dataBindYapildiFlag = true }}
					if (focusWidget != widget) { setTimeout(() => evt.target.select(), 150); focusWidget = widget }
				});
				widget.input.on('keyup', evt => { const key = evt.key?.toLowerCase(); if (key == 'enter' || key == 'linefeed' || key == 'tab') { if (widget.isOpened()) { widget.close() } } });
			};
			modelKullanOlustur({ selector: 'basi', etiket: 'Başı', editor: parent.find('.basi.bs') }); modelKullanOlustur({ selector: 'sonu', etiket: 'Sonu', editor: parent.find('.sonu.bs') });
			$.extend(e, { tip, mfSinif, coklumu: true, autoBind, maxRow, getValue: this.value, setValue: e => this.value = this.getConvertedValue(e.value ?? e.kod) });
			SecimBirKismi.initHTMLElements_birKismi(e); this._ddListPart = e.part;

			const chkBirKismiToggle = parent.find('.birKismiToggle');
			chkBirKismiToggle.jqxSwitchButton({ theme, width: 50, height: false, onLabel: 'B', offLabel: 'B', checked: this.birKismimi });
			chkBirKismiToggle.on('change', evt => { setTimeout(() => { this.birKismimi = $(evt.currentTarget).val(); this.birKismiToggleDegisti(e) }, 10) });
			const birKismiParent = parent.find('.birKismi-parent'), btnListedenSec = birKismiParent.find('.listedenSec');
			if (btnListedenSec?.length) {
				btnListedenSec.jqxButton({ theme });
				btnListedenSec.on('click', event => { const part = this._ddListPart; if (part && !part.isDestroyed) { part.listedenSecIstendi({ sender: this, event }) } })
			}
			if (this.birKismimi) { setTimeout(() => this.birKismiToggleDegisti(e), 10) }
		}
		else {
			parent.find('.basi.bs').on('change', evt => { this.basi = this.getConvertedValue(evt.target.value || '') })
			parent.find('.sonu.bs').on('change', evt => { this.sonu = this.getConvertedValue(evt.target.value || '') })
		}
	}
	birKismiToggleDegisti(e) {
		e = e || {}; const {parent} = e; if (!parent?.length) { return }
		const bsParent = parent.find('.bs-parent'); if (!bsParent?.length) { return }
		const birKismiParent = parent.find('.birKismi-parent'); if (!birKismiParent?.length) { return }
		const {birKismimi} = this; bsParent[birKismimi ? 'addClass' : 'removeClass']('jqx-hidden'); birKismiParent[birKismimi ? 'removeClass' : 'addClass']('jqx-hidden')
	}
	getConvertedValue(value) {
		if (this.birKismimi) { let arr = value == null ? [] : $.isArray(value) ? value : $.makeArray(value); if ($.isArray(arr) && !arr.length) { arr = null } return arr }
		return super.getConvertedValue(value)
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
		super.initHTMLElements(e); const {parent} = e, inputs = parent.find('.bs-parent input.bs');
		if (inputs?.length) {
			inputs.on('keyup', evt => {
				const {target} = evt; let value = (target.value || '').replace(',', '.'); if (!value.endsWith('.')) { target.value = roundToFra(value, this.fra).toString().replace('.', ',') || null }
			});
			inputs.on('change', evt => {
				const {target} = evt; let value = (target.value || '').replace(',', '.');
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
		let {value} = this; if (value == null) { return value }
		if ($.isPlainObject(value)) { value = new CBasiSonu(value) }
		return value?.bosmu ? null : new CBasiSonu({ basi: dateToString(value.basi), sonu: dateToString(value.sonu) }).toString()
	}
	initHTMLElements(e) {
		super.initHTMLElements(e); const {parent} = e, inputs = parent.find('.bs-parent input.bs');
		if (inputs?.length) {
			const initPart = e => {
				const {selector} = e, layout = inputs.filter(`.${selector}:eq(0)`); let timeLayout;
				if (this.hasTime) { timeLayout = $(`<input class="veri ${selector}-time time bs" type="textbox" maxlength="8"></input>`); timeLayout.insertAfter(layout) }
				const _e = $.extend({}, e, { args: { layout, value: this[selector], timeLayout } }); this.tarihPartArgsDuzenle(_e);
				const part = e.part = this[`part_${selector}`] = new TarihUIPart(_e.args); part.change(e => { this[selector] = e.value }); part.run(); return part
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
		super.uiSetValues(e); const {parent} = e; if (!parent.length) { return false }
		const bsParent = parent.find('.bs-parent'); for (const key of ['basi', 'sonu']) { bsParent.find(`.${key}-time.bs`).val(asTimeAndToString(this.getConvertedValue(this[key])), '') }
	}
	initHTMLElements(e) {
		super.initHTMLElements(e); const {parent} = e, btnKopya = parent.find('button.kopya');
		if (btnKopya?.length) { btnKopya.on('click', evt => { const value = this.basi, txtSonu_time = parent.find('.sonu-time.bs'); txtSonu_time.val(asTimeAndToString(value, true)) }) }
	}
	tarihPartArgsDuzenle(e) { super.tarihPartArgsDuzenle(e) }
}

(function() {
	const tip2Sinif = Secim.prototype.constructor._tip2Sinif;
	const subClasses = [SecimBasSon, SecimString, SecimInteger, SecimNumber, SecimDate, SecimDateTime];
	for (const cls of subClasses) { const {tip} = cls; if (tip) tip2Sinif[tip] = cls }
})();
