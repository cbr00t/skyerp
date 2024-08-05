class FormBuilderBase extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static CSSClass_FormBuilder = 'formBuilder'; static CSSClass_FormBuilderElement = 'formBuilder-element';
	static CSSClass_BuilderId = 'builder-id'; static CSSClass_ElementId = 'element-id'; static elmSeq = 0;
	get isFormBuilder() { return true } static get defaultAutoAppendFlag() { return false }
	get defaultAutoAppendFlag() { return this.class.defaultAutoAppendFlag }
	get id() { let result = this._id; if (result == null) { result = this._id = this.newElementId() } return result } set id(value) { this._id = value }
	get id2Builder() {
		let result = this._id2Builder;
		if (result == null) {
			result = {}; const {builders} = this;
			for (const key in builders) {
				const builder = builders[key]; if (!builder.parentBuilder) { builder.parentBuilder = this } if (!builder.rootBuilder) { builder.rootBuilder = this.rootBuilder }
				result[builder.id] = builder
			}
			this._id2Builder = result
		}
		return result
	}
	set id2Builder(value) { this._id2Builder = value }
	get parent() {
		let result = this._parent;
		if (result && (result.run || $.isFunction(result))) {
			const _e = this.getBuilderBlockArgs({ result }); result = getFuncValue.call(this, result, _e);
			if (_e.commitFlag) this._parent = result
		}
		return result
	}
	set parent(value) { this._parent = value }
	get layout() {
		let result = this._layout;
		if (result && (result.run || $.isFunction(result))) {
			const _e = this.getBuilderBlockArgs({ result }); result = getFuncValue.call(this, result, _e);
			if (result == null) { const {parent} = this; if (parent?.length) result = parent }
			if (_e.commitFlag) this._layout = result
		}
		return result
	}
	set layout(value) { this._layout = value }
	get parentPart() {
		let result = this._parentPart;
		if (result && $.isFunction(result)) {
			const _e = this.getBuilderBlockArgs({ result }); result = getFuncValue.call(this, result, _e);
			if (_e.commitFlag) this._parentPart = result
		}
		if (!result) result = this.parentBuilder?.part
		return result
	}
	set parentPart(value) { this._parentPart = value }
	get part() {
		let result = this._part;
		if (result && $.isFunction(result)) {
			const _e = this.getBuilderBlockArgs({ result }); result = getFuncValue.call(this, result, _e);
			if (_e.commitFlag) this._part = result
		}
		return result
	}
	set part(value) { this._part = value }
	get parentLayout() { return (this.parentBuilder || {}).layout } get parentParent() { return (this.parentBuilder || {}).parent }
	get rootPart() { return (this.rootBuilder || {}).part } get rootLayout() { return (this.rootBuilder || {}).layout }
	get rootParent() { return (this.rootBuilder || {}).parent } get hasParent() { const {parent} = this; return parent?.length } get hasLayout() { const {layout} = this; return layout?.length }
	get layoutHasParent() { const {layout} = this; return layout && layout.length && !!(layout.parent() || {}).length } get isLayoutAttachedToParent() { const {layout} = this; return layout?.length && layout.parent() == parent }
	get visibleKosulu() {
		let result = this._visibleKosulu;
		if (result && (result.run || $.isFunction(result))) {
			const _e = this.getBuilderBlockArgs({ result, commitFlag: false }); result = getFuncValue.call(this, result, _e);
			if (_e.commitFlag) this._visibleKosulu = result
		}
		return result
	}
	set visibleKosulu(value) { this._visibleKosulu = value }
	
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {
			_id: e.id, _parent: e.parent, _layout: e.layout, _part: e.part, _parentPart: e.parentPart, _visibleKosulu: e.visibleKosulu == null ? e.visibleBlock : e.visibleKosulu,
			autoAppendFlag: e.autoAppend ?? e.autoAppendFlag ?? this.defaultAutoAppendFlag, autoAppendIslemi: e.autoAppendIslemi, autoInitLayoutFlag: e.autoInitLayout ?? e.autoInitLayoutFlag,
			builders: e.builders || [], args: e.args, init: e.init, buildEk: e.buildEk, afterRun: e.afterRun, id2Builder: null, styles: e.styles || [], cssClasses: e.cssClasses || [], userData: e.userData
		});
		if (!this.autoAppendIslemi) { this.autoAppendMode_append() }
		const {sabitDegerler} = e; if (sabitDegerler) { for (const key in sabitDegerler) { const value = sabitDegerler[key]; if (value !== undefined) { this[key] = value } } }
		const {_layout, autoAppendFlag} = this; if (_layout && autoAppendFlag == null) { this.autoAppendFlag = true }
	}
	run(e) {
		e = e || {}; this.preRun(e); if (e.abortFlag) return
		this.runInternal(e); if (e.abortFlag) return
		this.postRun(e)
	}
	preRun(e) { }
	runInternal(e) {
		e = e || {}; $.extend(e, { builder: this, temps: e.temps || {}, abortFlag: false, abort() { this.abortFlag = true; return this } });
		$.extend(this, { isDestroyed: false, _id2Builder: null });
		for (const selector of ['styles', 'cssClasses']) { if (!this[selector]) { this[selector] = [] } }
		this.preInit(e); if (e.abortFlag) return
		this.beforeBuild(e); if (e.abortFlag) return
		this.build(e); if (e.abortFlag) return
		this.afterBuild(e); if (e.abortFlag) return
		this.runDevam(e)
	}
	postRun(e) {
		const styles = [];
		for (const builder of this.getBuildersWithSelf()) {
			const _e = $.extend({}, e, { target: styles });
			builder.applyStyles(_e)
		}
		if (!$.isEmptyObject(styles)) {
			const {CSSClass_BuilderId} = FormBuilderBase;
			const {id} = this;
			const styleHTML = $(`<style data-${CSSClass_BuilderId}="${id}">${styles.join(CrLf)}</style>`);
			styleHTML.appendTo('head')
		}
		if (this.isRootFormBuilder) {
			e.builder = this;
			const {afterRun} = this;
			if (afterRun)
				getFuncValue.call(this, afterRun, e)
		}
	}
	runDevam(e) {
		this.id2Builder;			/* getter ile olustur */
		const {builders, autoInitLayoutFlag} = this;
		for (const key in builders) {
			const builder = builders[key];
			if (builder == null) { debugger }
			if (!builder._parent) {
				const _layout = builder.layout;
				builder.parent = (_layout?.length && _layout.parent()?.length) ? _layout.parent() : (this.layout || this.parent);
			}
			if (builder.autoInitLayoutFlag == null) { builder.autoInitLayoutFlag = autoInitLayoutFlag }
			builder.runInternal(e)
		}
		if (!this._afterBuild_calistimi) { this._afterBuild_calistimi = true; this.afterBuildDevam(e) }
	}
	preInit(e) { }
	beforeBuild(e) { e = e || {}; const {init} = this; if (init) { getFuncValue.call(this, init, e) } }
	build(e) {
		e = e || {};
		this.preBuild(e); if (e.abortFlag) return
		this.buildDevam(e); if (e.abortFlag) return
		this.postBuild(e)
	}
	preBuild(e) { }
	buildDevam(e) { }
	postBuild(e) { e = e || {}; const {buildEk} = this; if (buildEk) { getFuncValue.call(this, buildEk, e) } }
	afterBuild(e) {
		e = e || {}; let {layout} = this;
		if (layout?.length) {
			const {CSSClass_FormBuilder, CSSClass_FormBuilderElement, CSSClass_BuilderId, CSSClass_ElementId} = FormBuilderBase;
			let {parentBuilder, cssClasses} = this; if (parentBuilder == this) { parentBuilder = this.parentBuilder = null }
			if (!parentBuilder) { layout.addClass(CSSClass_FormBuilder) }
			if (!$.isEmptyObject(cssClasses)) {
				let builderBlockArgs;
				for (let cssClass of cssClasses) {
					if (cssClass.run || $.isFunction(cssClass)) {
						if (!builderBlockArgs) { builderBlockArgs = this.getBuilderBlockArgs({ result: cssClass }) }
						cssClass = getFuncValue.call(this, cssClass, builderBlockArgs)
					}
					layout.addClass(cssClass)
				}
			}
			const elms = [layout /*, layout.children()*/]; for (const elm of elms) { elm.addClass(CSSClass_FormBuilderElement); elm.attr(`data-${CSSClass_BuilderId}`, this.id); this.getElementId(elm) }
			this.updateVisible(e);
			if (this.autoAppendFlag) {
				const {parent} = this;
				if (parent?.length) {
					const {autoAppendIslemi} = this; let _e = { sender: this, builder: this };
					if (!parent?.parent()?.length) { const {parentLayout} = this; if (parentLayout?.length) { $.extend(_e, { layout: parent, parent: parentLayout }); getFuncValue.call(this, autoAppendIslemi, _e); } }
					$.extend(_e, { layout, parent }); getFuncValue.call(this, autoAppendIslemi, _e)
				}
			}
		}
		else { if (!this._layout) { layout = this.layout = this._parent } this.parent = null }
		for (const elm of [layout, this.input]) {
			if (!elm?.length) continue
			if (elm?.length && !elm.data('part')) { const {part} = this; if (part) { elm.data('part', part) } }
		}
		if (!this._afterBuild_calistimi) { this._afterBuild_calistimi = true; this.afterBuildDevam(e) } /* this.applyStyles(e) */
		
	}
	afterBuildDevam(e) { if (!this.isRootFormBuilder && !this._afterRun_calistimi) { const {afterRun} = this; if (afterRun) { getFuncValue.call(this, afterRun, e) } } this._afterRun_calistimi = true }
	applyStyles(e) { this.applyStylesOncesi(e); this.applyStylesDevam(e); this.applyStylesSonrasi(e) }
	applyStylesOncesi(e) { } applyStylesDevam(e) { }
	applyStylesSonrasi(e) {
		e = e || {}; const {styles, layout} = this;
		if (!$.isEmptyObject(styles)) {
			const {target} = e, builderId = this.getBuilderId(layout), elementId = this.getElementId(layout);
			let builderBlockArgs, styleHTML = '';
			for (const key in styles) {
				let style = styles[key];
				if (style.run || $.isFunction(style)) {
					if (!builderBlockArgs) { builderBlockArgs = this.getBuilderBlockArgs({ result: style }) }
					style = getFuncValue.call(this, style, builderBlockArgs);
				}
				let text = (style || '').toString();
				if (style) {
					if (builderId) { text = text.replaceAll('$builderId', builderId).replaceAll('$builderCSS', this.getCSSBuilderSelector(builderId)) }
					if (elementId) { text = text.replaceAll('$elementId', elementId) .replaceAll('$elementCSS', this.getCSSElementSelector(elementId)) }
					styleHTML += (text + CrLf + CrLf)
				}
			}
			if (target) { target.push(styleHTML) } else { styleHTML = `<style>${styleHTML}</style>`; $(styleHTML).appendTo('head') }
		}
	}
	updateVisible(e) {
		let {visibleKosulu} = this; if (visibleKosulu == null) { return }
		const {layout} = this; if (!layout?.length) { return } layout.removeClass('jqx-hidden basic-hidden');
		if (visibleKosulu) { if (typeof visibleKosulu != 'string') { visibleKosulu = null } } else { visibleKosulu = 'jqx-hidden' }
		if (visibleKosulu) { layout.addClass(visibleKosulu) }
		return this
	}
	show() { const {layout} = this; if (layout?.length) { layout.removeClass('jqx-hidden basic-hidden') } return this }
	hide() { const {layout} = this; if (layout?.length) { layout.addClass('jqx-hidden') } return this }
	hideBasic() { const {layout} = this; if (layout?.length) { layout.addClass('basic-hidden') } return this }
	destroyPart(e) {
		if (this.isDestroyed || this._destroying) { return } this._destroying = true;
		const rootBuilder = this.rootBuilder ?? this, {builders, id} = this, {CSSClass_BuilderId} = FormBuilderBase;
		try { const styles = $(`style[data-${CSSClass_BuilderId} = "${id}"]`); if (styles?.length) { styles.remove() } } catch (ex) { }
		try { const {layout, input, part} = this; if (part) { if (part.destroyPart) { part.destroyPart(e) } } for (const elm of [input, layout]) { if (elm?.length) { elm.remove()} } } catch (ex) { console.error(ex) }
		try { for (const builder of builders) { if (builder != this && builder.destroyPart) { builder.destroyPart(e) } } } catch (ex) { console.error(ex) }
		delete this._destroying; this.isDestroyed = true
		/*if (!rootBuilder.isDestroyed) { const {CSSClass_BuilderId} = FormBuilderBase, styles = $(`style[data-${CSSClass_BuilderId}="${this.id}"]`); if (styles?.length) { styles.remove() } rootBuilder.isDestroyed = true }*/
	}
	addForm(e, _layout, _parent, _renk, _zeminRenk, _styles) {
		e = e || {}; const id = typeof e == 'object' ? e.id : e;
		const layout = typeof e == 'object' ? e.layout : _layout;
		const parent = typeof e == 'object' ? e.parent : _parent;
		const renk = typeof e == 'object' ? e.renk : _renk;
		const zeminRenk = typeof e == 'object' ? e.zeminRenk : _zeminRenk;
		const styles = typeof e == 'object' ? e.styles : _styles;
		const builder = new FormBuilder({ id: id, layout: layout, parent: parent, styles: styles }); /* .autoAppend(); */
		if (renk || zeminRenk) { builder.addStyle(e => `$elementCSS { ${renk ? `color: ${renk};` : ''}${zeminRenk ? `color: ${zeminRenk};` : ''} }`) }
		this.add(builder); return builder
	}
	addFormWithParent(e, _layout) {
		e = e || {}; const id = typeof e == 'object' ? e.id : e;
		const layout = typeof e == 'object' ? e.layout : _layout;
		const builder = new FBuilderWithInitLayout({ id: id, layout: layout });
		this.add(builder); return builder
	}
	addElement(e, _etiket, _tagName, _layout, _renk, _zeminRenk, _styles) {
		e = e || {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const tagName = typeof e == 'object' ? e.tagName : _tagName;
		const layout = typeof e == 'object' ? e.layout : _layout;
		const renk = typeof e == 'object' ? e.renk : _renk;
		const zeminRenk = typeof e == 'object' ? e.zeminRenk : _zeminRenk;
		const styles = typeof e == 'object' ? e.styles : _styles;
		const builder = new FBuilder_SimpleElement({ id: id, etiket: etiket, tagName: tagName, layout: layout, styles: styles });
		if (renk || zeminRenk) { builder.addStyle(e => `$elementCSS { ${renk ? `color: ${renk};` : ''}${zeminRenk ? `color: ${zeminRenk};` : ''} }`) }
		this.add(builder); return builder
	}
	addDiv(e, _etiket, _tagName, _layout, _renk, _zeminRenk, _styles) {
		e = e || {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const tagName = typeof e == 'object' ? e.tagName : _tagName;
		const layout = typeof e == 'object' ? e.layout : _layout;
		const renk = typeof e == 'object' ? e.renk : _renk;
		const zeminRenk = typeof e == 'object' ? e.zeminRenk : _zeminRenk;
		const styles = typeof e == 'object' ? e.styles : _styles;
		const builder = new FBuilder_DivOrtak({ id: id, etiket: etiket, tagName: tagName, input: layout, styles: styles });
		if (renk || zeminRenk) { builder.addStyle(e => `$elementCSS { ${renk ? `color: ${renk};` : ''}${zeminRenk ? `color: ${zeminRenk};` : ''} }`) }
		this.add(builder); return builder
	}
	addSpan(e, _etiket, _tagName, _layout, _renk, _zeminRenk, _styles) {
		e = e || {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const tagName = typeof e == 'object' ? e.tagName : _tagName;
		const layout = typeof e == 'object' ? e.layout : _layout;
		const renk = typeof e == 'object' ? e.renk : _renk;
		const zeminRenk = typeof e == 'object' ? e.zeminRenk : _zeminRenk;
		const styles = typeof e == 'object' ? e.styles : _styles;
		const builder = new FBuilder_Span({ id: id, etiket: etiket, tagName: tagName, input: layout, styles: styles });
		if (renk || zeminRenk) { builder.addStyle(e => `$elementCSS { ${renk ? `color: ${renk};` : ''}${zeminRenk ? `color: ${zeminRenk};` : ''} }`) }
		this.add(builder); return builder
	}
	addInput(e, _etiket, _tagName, _inputType, _layout) {
		e = e || {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const tagName = typeof e == 'object' ? e.tagName : _tagName;
		const inputType = typeof e == 'object' ? e.inputType : _inputType;
		const layout = typeof e == 'object' ? e.layout : _layout;
		const builder = new FBuilder_DivOrtak({ id: id, etiket: etiket, tagName: tagName, inputType: inputType, layout: layout });
		this.add(builder); return builder
	}
	addTabPanel(e, _etiket) {
		e = e || {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const builder = new FBuilder_Tabs({ id: id, etiket: etiket });
		this.add(builder); return builder
	}
	addTanimFormTabPanel(e, _value) {
		e = e || {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const builder = new FBuilder_TanimFormTabs({ id: id, etiket: etiket });
		this.add(builder); return builder
	}
	addLabel(e, _etiket, _renk, _zeminRenk, _styles) {
		e = e || {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const renk = typeof e == 'object' ? e.renk : _renk;
		const zeminRenk = typeof e == 'object' ? e.zeminRenk : _zeminRenk;
		const styles = typeof e == 'object' ? e.styles : _styles;
		const builder = new FBuilder_Label({ id: id, etiket: etiket, styles: styles });
		if (renk || zeminRenk) { builder.addStyle(e => `$elementCSS { ${renk ? `color: ${renk};` : ''}${zeminRenk ? `color: ${zeminRenk};` : ''} }`) }
		this.add(builder); return builder
	}
	addBaslik(e, _etiket, _renk, _zeminRenk, _styles) {
		e = e || {};
		const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const renk = typeof e == 'object' ? e.renk : _renk;
		const zeminRenk = typeof e == 'object' ? e.zeminRenk : _zeminRenk;
		const styles = typeof e == 'object' ? e.styles : _styles;
		const builder = new FBuilder_Baslik({ id: id, etiket: etiket, styles: styles });
		if (renk || zeminRenk) { builder.addStyle(e => `$elementCSS { ${renk ? `color: ${renk};` : ''}${zeminRenk ? `color: ${zeminRenk};` : ''} }` ) }
		this.add(builder); return builder
	}
	addGroupBox(e, _etiket) {
		e = e || {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const builder = new FBuilder_GroupBox({ id: id, etiket: etiket });
		this.add(builder); return builder
	}
	addTextInput(e, _etiket, _value, _placeHolder, _maxLength) {
		e = e || {};
		const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const placeHolder = typeof e == 'object' ? e.placeHolder ?? e.placeholder : _placeHolder;
		const maxLength = typeof e == 'object' ? e.maxLength : _maxLength;
		const builder = new FBuilder_TextInput({ id, etiket, value: value, placeHolder,  maxLength });
		this.add(builder);
		return builder
	}
	addPassInput(e, _etiket, _value, _placeHolder, _maxLength) {
		e = e || {};
		const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const placeHolder = typeof e == 'object' ? coalesce(e.placeHolder, e.placeholder) : _placeHolder;
		const maxLength = typeof e == 'object' ? e.maxLength : _maxLength;
		const builder = new FBuilder_PassInput({ id: id, etiket: etiket, value: value, placeHolder: placeHolder, maxLength: maxLength });
		this.add(builder);
		return builder
	}
	addNumberInput(e, _etiket, _value, _placeHolder, _maxLength, _fra, _min, _max, _step) {
		e = e || {};
		const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const placeHolder = typeof e == 'object' ? coalesce(e.placeHolder, e.placeholder) : _placeHolder;
		const maxLength = typeof e == 'object' ? e.maxLength : _maxLength;
		const fra = typeof e == 'object' ? e.fra : _fra;
		const min = typeof e == 'object' ? e.min : _min;
		const max = typeof e == 'object' ? e.max : _max;
		const step = typeof e == 'object' ? e.step : _step;
		const builder = new FBuilder_NumberInput({
			id: id, etiket: etiket, value: value, placeHolder: placeHolder, maxLength: maxLength,
			fra: fra, min: min, max: max, step: step
		});
		this.add(builder);
		return builder
	}
	addDateInput(e, _etiket, _value, _placeHolder) {
		e = e || {};
		const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const placeHolder = typeof e == 'object' ? coalesce(e.placeHolder, e.placeholder) : _placeHolder;
		const builder = new FBuilder_DateInput({ id: id, etiket: etiket, value: value, placeHolder: placeHolder });
		this.add(builder);
		return builder
	}
	addTimeInput(e, _etiket, _value, _placeHolder) {
		e = e || {};
		const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const placeHolder = typeof e == 'object' ? coalesce(e.placeHolder, e.placeholder) : _placeHolder;
		const builder = new FBuilder_TimeInput({ id: id, etiket: etiket, value: value, placeHolder: placeHolder });
		this.add(builder);
		return builder
	}
	addTextArea(e, _etiket, _value, _placeHolder, _maxLength, _rowCount) {
		e = e || {};
		const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const placeHolder = typeof e == 'object' ? coalesce(e.placeHolder, e.placeholder) : _placeHolder;
		const maxLength = typeof e == 'object' ? e.maxLength : _maxLength;
		const rowCount = typeof e == 'object' ? coalesce(e.rowCount, e.rows) : _rowCount;
		const builder = new FBuilder_TextArea({
			id: id, etiket: etiket, value: value, placeHolder: placeHolder, maxLength: maxLength,
			rows: rowCount
		});
		this.add(builder);
		return builder
	}
	addToggleButton(e, _etiket, _value) {
		e = e || {};
		const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const builder = new FBuilder_ToggleButton({ id: id, etiket: etiket, value: value });
		this.add(builder);
		return builder
	}
	addCheckBox(e, _etiket, _value) {
		e = e || {};
		const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const builder = new FBuilder_CheckBox({ id: id, etiket: etiket, value: value });
		this.add(builder);
		return builder
	}
	addSwitchButton(e, _etiket, _value, _onLabel, _offLabel) {
		e = e || {};
		const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const onLabel = typeof e == 'object' ? e.onLabel : _onLabel;
		const offLabel = typeof e == 'object' ? e.offLabel : _offLabel;
		const builder = new FBuilder_SwitchButton({ id: id, etiket: etiket, value: value, onLabel: onLabel, offLabel: offLabel });
		this.add(builder);
		return builder
	}
	addButton(e, _etiket, _value, _handler) {
		e = e || {};
		const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = (typeof e == 'object' ? e.value : _value) ?? etiket;
		const handler = typeof e == 'object' ? coalesce(coalesce(e.handler, e.onClick), e.onClickEvent) : _handler;
		const builder = new FBuilder_Button({ id: id, etiket: etiket, value: value, onClick: handler });
		this.add(builder);
		return builder
	}
	addSelectElement(e, _etiket, _value, _source, _kodAttr, _adiAttr) {
		e = e || {};
		const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const source = typeof e == 'object' ? e.source : _source;
		const kodAttr = typeof e == 'object' ? e.kodAttr : _kodAttr;
		const adiAttr = typeof e == 'object' ? e.adiAttr : _adiAttr;
		const builder = new FBuilder_SelectElement({
			id: id, etiket: etiket, value: value,
			source: source, kodAttr: kodAttr, adiAttr: adiAttr
		});
		this.add(builder);
		return builder
	}
	addRadioButton(e, _etiket, _value, _source, _kodAttr, _adiAttr) {
		e = e || {};
		const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const source = typeof e == 'object' ? e.source : _source;
		const kodAttr = typeof e == 'object' ? e.kodAttr : _kodAttr;
		const adiAttr = typeof e == 'object' ? e.adiAttr : _adiAttr;
		const builder = new FBuilder_RadioButton({
			id: id, etiket: etiket, value: value,
			source: source, kodAttr: kodAttr, adiAttr: adiAttr
		});
		this.add(builder);
		return builder
	}
	addColorInput(e, _etiket, _value) {
		e = e || {};
		const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const builder = new FBuilder_Color({ id: id, etiket: etiket, value: value });
		this.add(builder);
		return builder
	}
	addModelKullan(e, _etiket, _value, _mfSinif, _source, _ozelQueryDuzenleBlock, _veriYukleninceBlock, _kodAttr, _adiAttr) {
		e = e || {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const mfSinif = typeof e == 'object' ? e.mfSinif : _mfSinif;
		const source = typeof e == 'object' ? e.source : _source;
		const ozelQueryDuzenle = typeof e == 'object' ? e.ozelQueryDuzenle ?? e.ozelQueryDuzenleBlock : _ozelQueryDuzenleBlock;
		const veriYuklenince = typeof e == 'object' ? e.veriYuklenince ?? e.onBindingComplete : _veriYukleninceBlock;
		const kodAttr = typeof e == 'object' ? e.kodAttr : _kodAttr;
		const adiAttr = typeof e == 'object' ? e.adiAttr : _adiAttr;
		const builder = new FBuilder_ModelKullan({ id, etiket, value, ozelQueryDuzenle, veriYuklenince, mfSinif, source, kodAttr, adiAttr });
		this.add(builder);
		return builder
	}
	addGrid(e, _mfSinif, _source, _tabloKolonlari, _sabitmi, _kontrolcu, _ozelQueryDuzenleBlock, _veriYukleninceBlock, _kodAttr, _adiAttr, _veriDegisinceBlock) {
		e = e || {}; const id = typeof e == 'object' ? e.id : e;
		const mfSinif = typeof e == 'object' ? e.mfSinif : _mfSinif;
		const source = typeof e == 'object' ? e.source : _source;
		const tabloKolonlari = typeof e == 'object' ? e.tabloKolonlari : _tabloKolonlari;
		const sabitmi = typeof e == 'object' ? e.sabitmi : _sabitmi;
		const kontrolcu = typeof e == 'object' ? e.kontrolcu : _kontrolcu;
		const ozelQueryDuzenle = typeof e == 'object' ? e.ozelQueryDuzenle ?? e.ozelQueryDuzenleBlock : _ozelQueryDuzenleBlock;
		const veriYuklenince = typeof e == 'object' ? e.veriYuklenince ?? e.onBindingComplete : _veriYukleninceBlock;
		const kodAttr = typeof e == 'object' ? e.kodAttr : _kodAttr;
		const adiAttr = typeof e == 'object' ? e.adiAttr : _adiAttr;
		const veriDegisince = typeof e == 'object' ? e.veriDegisince : _veriDegisinceBlock;
		const builder = new FBuilder_Grid({ id, mfSinif, source, tabloKolonlari, sabitmi, kontrolcu, ozelQueryDuzenle, veriYuklenince, veriDegisince, kodAttr, adiAttr });
		this.add(builder); return builder
	}
	addGridliGiris(e, _mfSinif, _source, _tabloKolonlari, _kontrolcu, _kodAttr, _adiAttr) {
		return this.addGrid(e, _mfSinif, _source, _tabloKolonlari, false, _kontrolcu, undefined, undefined, _kodAttr, _adiAttr).gridliGiris()
	}
	addGridliGiris_sabit(e, _mfSinif, _source, _tabloKolonlari, _kontrolcu, _kodAttr, _adiAttr) {
		return this.addGrid(e, _mfSinif, _source, _tabloKolonlari, true, _kontrolcu, undefined, undefined, _kodAttr, _adiAttr).gridliGiris()
	}
	addGridliGosterici(e, _mfSinif, _source, _tabloKolonlari, _kontrolcu, _ozelQueryDuzenleBlock, _veriYukleninceBlock, _kodAttr, _adiAttr) {
		return this.addGrid(e, _mfSinif, _source, _tabloKolonlari, false, _kontrolcu, _ozelQueryDuzenleBlock, _veriYukleninceBlock, _kodAttr, _adiAttr).gridliGosterici()
	}
	/*addMasterListe(e, _mfSinif, _source, _tabloKolonlari, _kontrolcu, _ozelQueryDuzenleBlock, _veriYukleninceBlock, _kodAttr, _adiAttr) {
		return this.addGrid(e, _mfSinif, _source, _tabloKolonlari, _kontrolcu, _ozelQueryDuzenleBlock, _veriYukleninceBlock, _kodAttr, _adiAttr).masterListe()
	}
	addFisListe(e, _mfSinif, _source, _tabloKolonlari, _kontrolcu, _ozelQueryDuzenleBlock, _veriYukleninceBlock, _kodAttr, _adiAttr) {
		return this.addGrid(e, _mfSinif, _source, _tabloKolonlari, _kontrolcu, _ozelQueryDuzenleBlock, _veriYukleninceBlock, _kodAttr, _adiAttr).fisListe()
	}*/
	addIslemTuslari(e, _tip, _id2Handler, _ekButonlarIlk, _ekButonlarSon, _butonlarDuzenleyici, _sagButonlar, _prependFlag) {
		e = e || {}; const id = (typeof e == 'object' ? e.id : e) ?? 'islemTuslari';
		const tip = typeof e == 'object' ? e.tip : _tip, id2Handler = typeof e == 'object' ? e.id2Handler : _id2Handler;
		const ekButonlarIlk = typeof e == 'object' ? e.ekButonlarIlk : _ekButonlarIlk, ekButonlarSon = typeof e == 'object' ? e.ekButonlarSon : _ekButonlarSon;
		const butonlarDuzenleyici = typeof e == 'object' ? e.butonlarDuzenleyici : _butonlarDuzenleyici, sagButonlar = typeof e == 'object' ? e.sagButonlar : _sagButonlar;
		const prependFlag = typeof e == 'object' ? e.prependFlag : _prependFlag;
		const builder = new FBuilder_IslemTuslari({ id, tip, id2Handler,  ekButonlarIlk, ekButonlarSon, butonlarDuzenleyici, sagButonlar, prependFlag }); this.add(builder); return builder
	}
	add(...aCollection) {
		if (!aCollection) return this; const {builders} = this;
		for (const key in aCollection) {
			const builderOrArray = aCollection[key];
			if (builderOrArray) {
				if ($.isArray(builderOrArray)) { for (const _key in builderOrArray) { const subBuilder = builderOrArray[_key]; if (subBuilder) builders.push(subBuilder) } }
				else { builders.push(builderOrArray) }
			}
		}
		return this
	}
	addAll(aCollection) { this.add(...aCollection); return this }
	clear() { this.builders = [] }
	addStyle(...aCollection) {
		if (!aCollection) return this; const {styles} = this;
		for (const valueOrArray of aCollection) {
			if (valueOrArray) {
				if ($.isArray(valueOrArray)) { for (const subValue of valueOrArray) { if (subValue) styles.push(subValue) } }
				else { styles.push(valueOrArray) }
			}
		}
		return this
	}
	addStyles(aCollection) { this.addStyle(...aCollection); return this }
	clearStyles() { this.styles = []; return this }
	addCSS(...aCollection) {
		if (!aCollection) return this; const {cssClasses} = this;
		for (const valueOrArray of aCollection) {
			if (valueOrArray) {
				if ($.isArray(valueOrArray)) { for (const subValue of valueOrArray) { if (subValue) cssClasses.push(subValue) } }
				else { cssClasses.push(valueOrArray) }
			}
		}
		return this
	}
	addCSSClasses(aCollection) { this.addCSS(...aCollection); return this }
	clearCSS() { this.cssClasses = []; return this }
	setArgs(value) { this.args = value; return this }
	onInit(handler) { this.init = handler; return this }
	onBuildEk(handler) { this.buildEk = handler; return this }
	onAfterRun(handler) { this.afterRun = handler; return this }
	autoAppend() { this.autoAppendFlag = true; return this }
	noAutoAppend() { this.autoAppendFlag = false; return this }
	setVisibleKosulu(value) { this.visibleKosulu = value; return this }
	autoAppendMode_append() {
		this.autoAppendIslemi = e => {
			const {layout, parent} = e;
			if ((layout || {}).length && (parent || {}).length && !(layout.parent() || {}).length) layout.appendTo(parent)
		};
		return this
	}
	autoAppendMode_prepend() {
		this.autoAppendIslemi = e => {
			const {layout, parent} = e;
			if ((layout || {}).length && (parent || {}).length && !(layout.parent() || {}).length) layout.prependTo(parent)	
		};
		return this
	}
	autoAppendMode_insertBefore() {
		this.autoAppendIslemi = e => {
			const {layout, parent} = e;
			if ((layout || {}).length && (parent || {}).length && !(layout.parent() || {}).length) layout.insertBefore(parent)	
		};
		return this
	}
	autoAppendMode_addAfter() {
		this.autoAppendIslemi = e => {
			const {layout, parent} = e;
			if ((layout || {}).length && (parent || {}).length && !(layout.parent() || {}).length) layout.addAfter(parent)	
		};
		return this
	}
	autoInitLayout() { this.autoInitLayoutFlag = true; return this }
	noAutoInitLayout() { this.autoInitLayoutFlag = false; return this }
	resetAutoInitLayoutFlag() { this.autoInitLayoutFlag = null; return this }
	setUserData(value) { this.userData = value; return this }
	setPart(value) { this.part = value; return this }
	setParentPart(value) { this.parentPart = value; return this }
	setParent(value) { this.parent = value; return this }
	setLayout(value) { this.layout = value; return this }
	addStyle_wh(e, _height) {
		if (e == null || typeof e != 'object') e = { width: e, height: _height }
		const withImportant = value => {
			if (value != null && value != '') value = value.toString()
			if ($.isNumeric(value)) value += 'px'
			const Postfix_Important = ' !important'; if (typeof value == 'string' && !value.endsWith(Postfix_Important)) value += Postfix_Important
			return value
		}
		const _styles = [], width = withImportant(e.width), height = withImportant(e.height);
		if (width) _styles.push(`width: ${width};`)
		if (height) _styles.push(`height: ${height};`)
		if (_styles.length) this.addStyle(e => `$elementCSS { ${_styles.join(' ')} }`)
		return this
	}
	addStyle_fullWH(e, _height) {
		if (e == null || typeof e != 'object') e = { width: e, height: _height };
		for (const key of ['width', 'height']) { if (!e[key]) e[key] = 'var(--full)' }
		return this.addStyle_wh(e)
	}
	getBuilderId(elm) {
		if (!(elm && elm.length)) return null
		const {CSSClass_BuilderId} = FormBuilderBase;
		return elm.data(CSSClass_BuilderId)
	}
	getElementId(elm) {
		if (!(elm && elm.length)) return null
		const {CSSClass_ElementId} = FormBuilderBase;
		let result = elm.data(CSSClass_ElementId);
		if (!result) { result = this.newElementId(); elm.attr(`data-${CSSClass_ElementId}`, result) }
		return result
	}
	newElementId() { return `fe-${++FormBuilderBase.elmSeq}` }
	getCSSBuilderSelector(elmOrId) { return this.getCSSSelector({ builderId: elmOrId }) }
	getCSSElementSelector(elmOrId) { return this.getCSSSelector({ elmId: elmOrId }) }
	getCSSSelector(e) {
		let {builderId} = e; if (builderId && typeof builderId == 'object') builderId = this.getBuilderId(builderId)
		let elmId = coalesce(e.elmId, e.elementId); if (elmId && typeof elmId == 'object') elmId = this.getElementId(elmId)
		const {CSSClass_FormBuilderElement, CSSClass_BuilderId, CSSClass_ElementId} = FormBuilderBase;
		let result = `.${CSSClass_FormBuilderElement}`;
		if (builderId) result += `[data-${CSSClass_BuilderId}="${builderId}"]`
		if (elmId) result += `[data-${CSSClass_ElementId}="${elmId}"]`
		return result
	}
	getItemsAndSelf() { return this.getBuildersWithSelf() }
	getItems() { return this.getBuilders() }
	*getBuilders(e) {
		e = $.extend({}, e || {}); if (e.withSelf) { delete e.withSelf; yield this }
		const {builders} = this;
		for (const key in builders) {
			const builder = builders[key]; yield builder;
			for (const subBuilder of builder.getBuilders(e)) { yield subBuilder }
		}
	}
	getBuildersWithSelf(e) { e = $.extend({}, e || {}, { withSelf: true }); return this.getBuilders(e) }
	getBuilderBlockArgs(e) {
		const _this = this;
		const result = {
			sender: _this, builder: _this, commitFlag: coalesce(e.commitFlag, true),
			commit() { this.commitFlag = true; return this },
			temp() { this.commitFlag = false; return this }
		};
		return $.extend(result, e)
	}
}
