class SubPartBuilder extends FormBuilderBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultAutoAppendFlag() { return true }
	get mfSinif() {
		let result = this._mfSinif;
		if (result === undefined) {
			result = this._mfSinif = e => {
				e.temp();
				let _result = (this.parentBuilder || {}).mfSinif;
				if (_result !== undefined)
					return _result;
				const {rootPart} = this;
				if (rootPart)
					return rootPart.mfSinif || (rootPart.inst || {}).mfSinif
			}
		}
		if (result != null && !result.prototype && $.isFunction(result)) {
			const e = this.getBuilderBlockArgs({ result: result });
			result = getFuncValue.call(this, result, e);
			if (e.commitFlag)
				this._mfSinif = result
		}
		return result
	}
	set mfSinif(value) { this._mfSinif = value }
	get inst() {
		let result = this._inst;
		if (result === undefined) {
			result = this._inst = e => {
				e.temp(); let _result = this.parentBuilder?.inst; if (_result !== undefined) { return _result }
				return (this.rootPart ?? this.part)?.inst
			}
		}
		if (result != null && $.isFunction(result)) {
			const e = this.getBuilderBlockArgs({ result }); result = getFuncValue.call(this, result, e);
			if (e.commitFlag) { this._inst = result }
		}
		return result
	}
	set inst(value) { this._inst = value }
	get altInst() {
		let result = this._altInst;
		if (result === undefined) {
			result = this._altInst = e => {
				e.temp(); let _result = this.parentBuilder?.inst; if (_result !== undefined) { return _result }
				return this.inst
			}
		}
		if (result != null && $.isFunction(result)) {
			const e = this.getBuilderBlockArgs({ result }); result = getFuncValue.call(this, result, e);
			if (e.commitFlag) { this._altInst = result }
		}
		return result
	}
	set altInst(value) { this._altInst = value }
	get ioAttr() {
		let result = this._ioAttr;
		if (result === undefined)
			result = this._ioAttr = e => this.id
		if (result != null && $.isFunction(result)) {
			const e = this.getBuilderBlockArgs({ result: result });
			result = getFuncValue.call(this, result, e);
			if (e.commitFlag)
				this._ioAttr = result
		}
		return result
	}
	set ioAttr(value) { this._ioAttr = value }
	constructor(e) {
		e = e || {};
		super(e);
		$.extend(this, {
			_mfSinif: e.mfSinif, _inst: e.inst,
			_altInst: e.altInst, _ioAttr: e.ioAttr
		})
	}
	setMFSinif(value) { this.mfSinif = value; return this }
	noMF() { this.mfSinif = null; return this }
	resetMF() { this.mfSinif = undefined; return this }
	setInst(value) { this.inst = value; return this }
	setAltInst(value) { this.altInst = value; return this }
	resetAltInst() { this.altInst = undefined; return this }
}
class FormBuilder extends SubPartBuilder {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultYanSayi() { return null }
	get defaultCSSClasses() {
		const _e = { liste: [] };
		this.defaultCSSClassesDuzenle(_e);
		return _e.liste
	}
	constructor(e) {
		e = e || {}
		super(e);
		$.extend(this, {
			cssClass: e.cssClass,
			yanSayi: coalesce(e.yanSayi, coalesce(e.yanYana, e.yanYanami) ? 2 : this.class.defaultYanSayi)
		})
	}
	defaultCSSClassesDuzenle(e) { }
	preBuild(e) {
		super.preBuild(e);
		this.build_defaultLayout(e);
		const {layout} = this;
		if (layout?.length) {
			const {yanSayi, cssClass, defaultCSSClasses} = this;
			if (yanSayi != null)
				layout.addClass('flex-row');
			if (!$.isEmptyObject(cssClass))
				layout.addClass(cssClass)
			if (!$.isEmptyObject(defaultCSSClasses))
				layout.addClass(defaultCSSClasses)
		}
	}
	afterBuildDevam(e) {
		const {layout} = this;
		if (layout?.length) {
			const {parentBuilder, styles} = this;
			let parentYanSayi = (this.parentBuilder || {}).yanSayi;
			let widthYuzde = this._widthYuzde = 100;
			if (parentYanSayi != null) {
				if ((!parentYanSayi || parentYanSayi > 1) && this != parentBuilder.builders.slice(-1)[0]) {
					/*const {parentLayout} = this;
					if ((parentLayout && parentLayout.length) && parentLayout.children().length) {
						$(`<div class="formBuilder-separator" style="width: 8px; height: 100%"/>`)
							.appendTo(parentLayout)
					}*/
				}
				if (!parentYanSayi) { parentYanSayi = parentBuilder.builders.length }
				if (parentYanSayi > 1) { widthYuzde = roundToFra(widthYuzde / parentYanSayi, 0) - (.5 + (parentYanSayi * .6)) }
			}
			styles.push(`$elementCSS { min-width: 80px; width: ${widthYuzde ? `calc(${widthYuzde}% - 5px)` : 'unset'}; padding-inline-end: 5px }`)
		}
		super.afterBuildDevam(e)
	}
	build_defaultLayout(e) { return this }
	yanYana(yanSayi) { this.yanSayi = coalesce(yanSayi, 0); return this }
	altAlta() { this.yanSayi = null; return this }
}
class FBuilderWithInitLayout extends FormBuilder {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultYanSayi() { return 0 }
	build_defaultLayout(e) {
		super.build_defaultLayout(e);
		this.layout = $(`<div class="parent"/>`);
		return this
	}
}
