class SecimBasSon extends Secim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'basSon' }
	static get tip() { return this.anaTip }

	get value() { return this.birKismimi ? this.kodListe : { basi: this.basi, sonu: this.sonu } }
	set value(value) { if (this.birKismimi) this.kodListe = this.getConvertedValue(value); else super.value = value }
	set basiSonu(value) { this.basi = value; this.sonu = value }
	readFrom(e) {
		if (!super.readFrom(e)) return false
		const birKismimi = this.birKismimi = coalesce(coalesce(e.birKismimi, e.birKismi, false));
		if (birKismimi) {
			let {kodListe} = e; if (typeof kodListe == 'string') kodListe = getFunc.call(this, tekSecimSinif, e)
			if (kodListe) { if (typeof kodListe == 'string') kodListe = getFunc.call(this, tekSecim, e) }
			this.kodListe = kodListe || []
		}
		else {		
			this.basi = this.getConvertedValue(e.basi); this.sonu = this.getConvertedValue(e.sonu);
			let value = e.basiSonu; if (value !== undefined) this.basiSonu = value
		}
		return true
	}
	writeTo(e) {
		if (!super.writeTo(e))
			return false
		const {birKismimi} = this;
		if (this.birKismimi)
			e.birKismimi = true
		if (birKismimi) {
			const {kodListe} = this;
			if (kodListe != null)
				e.kodListe = kodListe
		}
		else {
			const {basi, sonu} = this;
			if (basi != null)
				e.basi = basi
			if (sonu != null)
				e.sonu = sonu
		}
		return true
	}
	temizle(e) {
		super.temizle(e);
		this.birKismimi = false;
		this.basi = this.sonu = this.getConvertedValue(null);
		this.kodListe = [];
		return this
	}
	uiSetValues(e) {
		super.uiSetValues(e);
		const {parent} = e;
		if (!(parent && parent.length))
			return false
		const {birKismimi} = this;
		const bsParent = parent.find('.bs-parent');
		bsParent.find('.basi.bs').val(coalesce(this.getConvertedValue(this.basi), ''));
		bsParent.find('.sonu.bs').val(coalesce(this.getConvertedValue(this.sonu), ''));
		const birKismiParent = parent.find('.birKismi-parent');
		e.value = this.getConvertedValue(this.value);
		SecimBirKismi.uiSetValues_birKismi(e);
		parent.find('.birKismiToggle').val(birKismimi);
 		this.birKismiToggleDegisti(e)
	}
	buildHTMLElementStringInto(e) {
		super.buildHTMLElementStringInto(e);
		const {mfSinif, birKismimi} = this;
		e.target += `<div class="flex-row">`;
		if (mfSinif)
			e.target += `<div class="birKismiToggle"></div>`;
		e.target += 	`<div class="bs-parent flex-row${birKismimi ? ' jqx-hidden' : ''}">`;
		if (mfSinif)
			e.target += 	`<div class="veri basi bs"></div>`
		else
			e.target += 	`<input class="veri basi bs" type="textbox" value="${this.getConvertedUIValue(this.basi) || ''}"></input>`
		e.target += 		`<button class="kopya">--&gt;</button>`;
		if (mfSinif)
			e.target += 	`<div class="veri sonu bs"></div>`
		else
			e.target += 	`<input class="veri sonu bs" type="textbox" value="${this.getConvertedUIValue(this.sonu) || ''}"></input>`
		e.target += 	`</div>`;
		if (mfSinif) {
			e.hidden = true;
			e.tip = this.class.tip;
			SecimBirKismi.buildHTMLElementStringInto_birKismi(e)
		}
		e.target += `</div>`
	}
	initHTMLElements(e) {
		super.initHTMLElements(e);
		const {mfSinif} = this;
		const {parent} = e;
		const btnKopya = parent.find('button.kopya');
		btnKopya.jqxButton({ theme: theme });
		btnKopya.on('click', evt => {
			const basi = parent.find('.basi.bs').val(), sonu = basi;
			this.sonu = this.getConvertedValue(basi);
			const txtSonu = parent.find('.sonu.bs');
			txtSonu.val(sonu);
			txtSonu.select();
			setTimeout(() => txtSonu.val(sonu), 50);
			setTimeout(() => txtSonu.val(sonu), 150);
			let input = txtSonu.find('input');
			if (!input.length)
				input = txtSonu;
			input.focus()
		});
		if (mfSinif) {
			// let savedDA;
			let focusWidget;
			const {kodSaha} = mfSinif;
			const modelKullanOlustur = e => {
				const {editor, selector, etiket} = e;
				const value = this.getConvertedUIValue(this[selector]);
				const part = new ModelKullanPart({
					parentPart: this.parentPart, builder: this.builder,
					layout: editor, mfSinif: mfSinif, placeHolder: etiket,
					dropDown: false, noAutoWidth: true,  autoBind: false, kod: value,
					maxRow: app.params?.ortak?.autoComplete_maxRow * 4,
					/*dataAdapterBlock: () =>
						savedDA,*/
					argsDuzenle: e => {
						$.extend(e.args, {
							itemHeight: 30, dropDownHeight: 410,
							renderSelectedItem: (index, rec) => {
								rec = rec.originalItem || rec || {};
								return rec[kodSaha] || ''
							}
						})
					}
				});
				if (part.autoBind)
					part.dataBindYapildiFlag = true;
				editor.data('part', part);
				part.run();
				const {widget} = part;
				/*if (widget) {
					if (!savedDA)
						savedDA = widget.source;
				}*/
				part.change(_e => {
					const {kod, item} = _e;
					if (kod != null)
						this[selector] = kod
					// setTimeout(() => widget.input.select(), 10);
				});
				widget.input.on('focus', evt => {
					const {source} = widget;
					if (!part.dataBindYapildiFlag && source && source.dataBind) {
						if (part && !part.isDestroyed) {
							source.dataBind();
							part.dataBindYapildiFlag = true
						}
					}
					if (focusWidget != widget) {
						setTimeout(() => evt.target.select(), 150);
						focusWidget = widget;
					}
				});
				/*widget.input.on('blur', evt => {
					widget.focusedFlag = false;
				});*/
				widget.input.on('keyup', evt => {
					const key = (evt.key || '').toLowerCase();
					if (key == 'enter' || key == 'linefeed' || key == 'tab') {
						if (widget.isOpened())
							widget.close()
					}
				});
				/*widget.input.on('blur', evt => {
					if (widget.isOpened() && !$(document.activeElement).parents('.jqx-combobox').length)
						widget.close();
				});*/
			};
			modelKullanOlustur({ selector: 'basi', etiket: 'Başı', editor: parent.find('.basi.bs') });
			modelKullanOlustur({ selector: 'sonu', etiket: 'Sonu', editor: parent.find('.sonu.bs') });
			$.extend(e, {
				tip: this.class.tip, mfSinif: mfSinif, coklumu: true, autoBind: false,
				maxRow: app.params.ortak.autoComplete_maxRow * 4,
				getValue: this.value,
				setValue: e =>
					this.value = this.getConvertedValue(e.kod)
			});
			SecimBirKismi.initHTMLElements_birKismi(e);
			this._ddListPart = e.part;
			
			const chkBirKismiToggle = parent.find('.birKismiToggle');
			chkBirKismiToggle.jqxSwitchButton({
				theme: theme, width: 50, height: false,
				onLabel: 'B', offLabel: 'B', checked: this.birKismimi
			});
			chkBirKismiToggle.on('change', evt => {
				setTimeout(() => {
					this.birKismimi = $(evt.currentTarget).val();
					this.birKismiToggleDegisti(e)
				}, 10)
			});
			const birKismiParent = parent.find('.birKismi-parent');
			const btnListedenSec = birKismiParent.find('.listedenSec');
			if (btnListedenSec && btnListedenSec.length) {
				btnListedenSec.jqxButton({ theme: theme });
				btnListedenSec.on('click', evt => {
					const part = this._ddListPart;
					if (part && !part.isDestroyed)
						part.listedenSecIstendi({ sender: this, event: evt })
				});
			}
			/*const etiket = parent.find('.etiket');
			if (etiket && etiket.length) {
				etiket.addClass('flex-row');
				chkBirKismiToggle.appendTo(etiket);
			}*/
			if (this.birKismimi)
				setTimeout(() => this.birKismiToggleDegisti(e), 10)
		}
		else {
			parent.find('.basi.bs').on('change', evt =>
				this.basi = this.getConvertedValue(evt.target.value || ''));
			parent.find('.sonu.bs').on('change', evt =>
				this.sonu = this.getConvertedValue(evt.target.value || ''))
		}
	}
	birKismiToggleDegisti(e) {
		e = e || {};
		const {parent} = e;
		if (!(parent && parent.length))
			return
		const bsParent = parent.find('.bs-parent');
		if (!(bsParent && bsParent.length))
			return
		const birKismiParent = parent.find('.birKismi-parent');
		if (!(birKismiParent && birKismiParent.length))
			return
		const {birKismimi} = this;
		bsParent[birKismimi ? 'addClass' : 'removeClass']('jqx-hidden');
		birKismiParent[birKismimi ? 'removeClass' : 'addClass']('jqx-hidden')
	}
	getConvertedValue(value) {
		if (this.birKismimi) { return value == null ? [] : $.isArray(value) ? value : $.makeArray(value) }
		return super.getConvertedValue(value)
	}
	birKismi() { this.birKismimi = true; return this }
	hepsi() { this.birKismimi = false; return this }
}
class SecimString extends SecimBasSon {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'string' }
}
class SecimInteger extends SecimBasSon {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'integer' }

	initHTMLElements(e) {
		super.initHTMLElements(e);
		const {parent} = e;
		const inputs = parent.find('.bs-parent input.bs');
		if (inputs && inputs.length) {
			inputs.on('keyup', evt => {
				const {target} = evt;
				let value = (target.value || '').replace(',', '.');
				if (!value.endsWith('.'))
					target.value = roundToFra(value, this.fra).toString().replace('.', ',') || null
			});
			inputs.on('change', evt => {
				const {target} = evt;
				let value = (target.value || '').replace(',', '.');
				if (!value.endsWith('.'))
					target.value = roundToFra(value, this.fra).toString().replace('.', ',') || null
			})
		}
	}
	getConvertedValue(value) { value = value?.value ?? value; return value && $.isArray(value) ? value : inverseCoalesce(value, x => asInteger(x)) }
}
class SecimNumber extends SecimInteger {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'number' }

	readFrom(e) {
		if (!super.readFrom(e))
			return false
		this.fra = inverseCoalesce(e.fra, x => asInteger(x));
		return true
	}
	getConvertedValue(value) { value = value?.value ?? value; return value && $.isArray(value) ? value : inverseCoalesce(value, x => asFloat(x)) }
}
class SecimDate extends SecimBasSon {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'date' }
	get hasTime() { return false }
	
	initHTMLElements(e) {
		super.initHTMLElements(e);
		const {parent} = e;
		const inputs = parent.find('.bs-parent input.bs');
		if (inputs && inputs.length) {
			const initPart = e => {
				const {selector} = e;
				const layout = inputs.filter(`.${selector}:eq(0)`);
				let timeLayout;
				if (this.hasTime) {
					timeLayout = $(`<input class="veri ${selector}-time time bs" type="textbox" maxlength="8"></input>`);
					timeLayout.insertAfter(layout)
				}
				const _e = $.extend({}, e, { args: { layout: layout, value: this[selector], timeLayout: timeLayout } });
				this.tarihPartArgsDuzenle(_e);
				const part = e.part = this[`part_${selector}`] = new TarihUIPart(_e.args);
				part.change(e =>
					this[selector] = e.value);
				part.run();
				return part
			}
			initPart({ selector: 'basi' });
			initPart({ selector: 'sonu' })
		}
	}
	tarihPartArgsDuzenle(e) { }
	getConvertedValue(value) { value = value?.value ?? value; return value && $.isArray(value) ? value : inverseCoalesce(value, x => asDate(tarihDegerDuzenlenmis(x))) }
	getConvertedUIValue(value) { return this.hasTime ? dateTimeToString(value) : dateToString(value) }
}
class SecimDateTime extends SecimDate {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'dateTime' }
	get hasTime() { return true }

	uiSetValues(e) {
		super.uiSetValues(e);
		const {parent} = e;
		if (!(parent && parent.length))
			return false
		const bsParent = parent.find('.bs-parent');
		bsParent.find('.basi-time.bs').val(asTimeAndToString(this.getConvertedValue(this.basi)), '');
		bsParent.find('.sonu-time.bs').val(asTimeAndToString(this.getConvertedValue(this.sonu)), '')
	}
	initHTMLElements(e) {
		super.initHTMLElements(e);
		const {parent} = e;
		const btnKopya = parent.find('button.kopya');
		if (btnKopya && btnKopya.length) {
			btnKopya.on('click', evt => {
				const value = this.basi;
				const txtSonu_time = parent.find('.sonu-time.bs');
				txtSonu_time.val(asTimeAndToString(value, true))
			})
		}
	}
	tarihPartArgsDuzenle(e) {
	}
}

(function() {
	const tip2Sinif = Secim.prototype.constructor._tip2Sinif;
	const subClasses = [SecimBasSon, SecimString, SecimInteger, SecimNumber, SecimDate, SecimDateTime];
	for (const cls of subClasses) { const {tip} = cls; if (tip) tip2Sinif[tip] = cls }
})();
