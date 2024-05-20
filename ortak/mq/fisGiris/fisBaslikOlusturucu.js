class FisBaslikOlusturucu extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }

	constructor(e) {
		e = e || {};
		super(e);

		this._initValue = e.initValue;
		this.ekClassName = coalesce(e.ekClassName, this.class.ekClassName);
		this._hedefBaslikForm = e.hedefBaslikForm;
	}

	static get ekClassName() { return null }
	static getDefaultBaslikForm(e) { return null }
	getInitValue(e) { return coalesce(this._initValue, e.fis[e.ioAttr || this.ioAttr]) }
	getHedefBaslikForm(e) { return this._hedefBaslikForm || this.class.getDefaultBaslikForm(e) }

	run(e) {
		e.mfSinif = e.mfSinif || e.fis.class;
		
		const result = this.runDevam(e);
		if (result != null)
			e.result = result;
		return result;
	}

	runDevam(e) {
		// const {sender, content, layout, header, baslikFormlar, hedefBaslikForm, fis, mfSinif} = e;
	}

	addToParentForm(e) {
		const {parent, hedefBaslikForm} = e;
		if (hedefBaslikForm && hedefBaslikForm.length)
			parent.appendTo(hedefBaslikForm);
	}

	layoutDuzenle(e) {
	}

	initEvents(e) {
	}
	
	baslikSubLayoutOlustur(e) {
		const {mfSinif} = e;
		const ekClassName = e.ekClassName || this.ekClassName || (mfSinif ? mfSinif.name + ' ' : '');
		const content = e.content = e.content || '<div/>';
		let parentHTML = `<div class="sub-parent input-parent">`;
		if (content && !content.html)
			parentHTML += content;
		parentHTML += `</div>`;
		
		const parent = e.parent = $(parentHTML);
		if (content && content.html) {
			e.layout = content;
			content.appendTo(parent);
		}
		else
			e.layout = parent.children().eq(0);

		if (ekClassName)
			parent.addClass(ekClassName);
		e.layout.addClass('veri');

		return e.layout;
	}
}


class FisBaslikOlusturucu_Master extends FisBaslikOlusturucu {
	constructor(e) {
		e = e || {};
		super(e);

		this.mfSinif = e.mfSinif || this.class.mfSinif;
		this.ioAttr = e.ioAttr || this.class.ioAttr;
		this.dropDown = coalesce(e.dropDown, this.class.dropDown);
		this.noAutoWidth = coalesce(e.noAutoWidth, this.class.noAutoWidth);
	}

	static get mfSinif() { return null }
	static get ioAttr() { return null }
	static get dropDown() { return null }
	static get noAutoWidth() { return null }
	// static getDefaultBaslikForm(e) { return e.baslikFormlar[0] }
	
	runDevam(e) {
		const value = this.oldValue =  getFuncValue.call(this, this.getInitValue(e), e);
		const {mfSinif, ioAttr} = this;
		const {fis, header, sender} = e;
		$.extend(e, {
			mfSinif: mfSinif, fis: fis, ioAttr: ioAttr, value: value,
			dropDown: this.dropDown, noAutoWidth: this.noAutoWidth
		});
		this.baslikSubLayoutOlustur(e);
		
		e.hedefBaslikForm = this.getHedefBaslikForm(e);
		this.addToParentForm(e);
		this.layoutDuzenle(e);
		this.initEvents(e);

		const {part} = e;
		const partLayout = (part || {}).layout;
		if (partLayout) {
			const {parent} = e;
			partLayout.data('part', part);
			if (parent && parent.length) {
				const cssClassName = parent.prop('class')
					.replaceAll('sub-parent input-parent', '')
					.trim();
				sender._subParts[cssClassName] = part;
			}
		}
		
		return part;
	}

	layoutDuzenle(e) {
		super.layoutDuzenle(e);

		e.argsDuzenle = e.argsDuzenle || (args => {
			const _e = $.extend({}, e, { args: args });
			this.widgetArgsDuzenle(_e);
		});
		e.part = e.mfSinif.partLayoutDuzenle(e);
	}

	widgetArgsDuzenle(e) {
		const {args} = e;
		if (args.value == null)
			args.value = args.kod;
		if (args.value == null) {
			const ioAttr = e.ioAttr || this.ioAttr;
			args.value = e.fis[ioAttr];
		}
	}

	initEvents(e) {
		super.initEvents(e);
		
		const {part, ioAttr, fis} = e;
		const pInst = fis._p[ioAttr];
		if (pInst) {
			part.degisince(e =>
				pInst.value = e.value);
			pInst.change(e =>
				part.val(e.value));
		}
	}

	superLayoutDuzenle(e) {
		return super.layoutDuzenle(e);
	}

	superInitEvents(e) {
		return super.initEvents(e)
	}
}

class FisBaslikOlusturucu_TekSecim extends FisBaslikOlusturucu_Master {
	constructor(e) {
		e = e || {};
		super(e);

		this.mfSinif = null;
		this.tekSecim = e.tekSecim || this.class.tekSecim;
		let source = e.source || this.class.source;
		if (!source) {
			source = e => {
				const ioAttr = e.ioAttr || this.ioAttr;
				const value = e.fis[ioAttr];
				return coalesce(value, this.tekSecim)
			};
		}
		this.source = source;
	}

	static get dropDown() { return true }
	static get tekSecim() { return null }
	getInitValue(e) { return (super.getInitValue(e) || {}).char }
	static get source() { return null }
	
	layoutDuzenle(e) {
		super.superLayoutDuzenle(e);

		e.argsDuzenle = e.argsDuzenle || (args => {
			const _e = $.extend({}, e, { args: args });
			this.widgetArgsDuzenle(_e);
		});
		e.part = MQKA.partLayoutDuzenle(e);
	}

	widgetArgsDuzenle(e) {
		const {args} = e;
		if (args.value == null)
			args.value = args.kod;

		let {value} = args;
		if (value == null) {
			const ioAttr = e.ioAttr || this.ioAttr;
			value = e.fis[ioAttr];
			if (value)
				value = coalesce(value.char, value);
		}
		value = coalesce(value.char, value);
		args.value = value;
		
		if (args.source == null) {
			let source = getFuncValue.call(this, e.source || this.source, e);
			if (source && source.kaListe)
				source = source.kaListe;
			if (source)
				args.source = source;
		}

		args.kodGosterilsinmi = false;
	}

	initEvents(e) {
		super.superInitEvents(e);
		
		const {part, ioAttr, fis} = e;
		const pInst = fis._p[ioAttr];
		if (pInst) {
			part.degisince(e =>
				pInst.value.char = e.value);
			pInst.change(e =>
				part.val(e.value.char));
		}
	}

	superInitEvents(e) {
		return super.superInitEvents(e)
	}
}

class FisBaslikOlusturucu_Input extends FisBaslikOlusturucu {
	constructor(e) {
		e = e || {};
		super(e);

		$.extend(this, {
			ioAttr: e.ioAttr || this.class.ioAttr,
			defaultValue: coalesce(e.defaultValue, this.class.defaultValue),
			etiket: coalesce(e.etiket, this.class.etiket) || '',
			maxLength: coalesce(e.maxLength, this.class.maxLength)
		});
	}

	static get ioAttr() { return null }
	static get etiket() { return null }
	static get defaultValue() { return '' }
	static get maxLength() { return 100 }
	// static getDefaultBaslikForm(e) { return e.baslikFormlar[2] }
	
	runDevam(e) {
		const {ioAttr} = this;
		const {fis, header, baslikFormlar} = e;
		const value = getFuncValue.call(this, this.getInitValue(e), e);
		// if (value !== undefined) {
		$.extend(e, {
			ioAttr: ioAttr,
			value: fis[ioAttr],
			content: (
				`<input id="${ioAttr}" name="${ioAttr}" type="textbox" maxlength="${this.maxLength}"` +
				` value="${value || this.defaultValue}"` +
				` placeholder="${this.etiket}"` +
				` style="width: 100%; height: 50px;">` +
				`</input>`
			)
		});
		this.baslikSubLayoutOlustur(e);
		
		e.hedefBaslikForm = this.getHedefBaslikForm(e);
		this.addToParentForm(e);
		this.layoutDuzenle(e);
		this.initEvents(e);
		
		return e.layout;
	}

	initEvents(e) {
		super.initEvents(e);
		
		const {ioAttr, fis} = e;
		const {parent, layout} = e;
		const pInst = fis._p[ioAttr];
		if (pInst) {
			layout.on('change', evt =>
				pInst.value = evt.target.value || '');
			pInst.change(e =>
				layout.val(e.value || ''));
		}
	}

	superInitEvents(e) {
		return super.initEvents(e)
	}
}

