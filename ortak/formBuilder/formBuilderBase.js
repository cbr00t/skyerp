class FormBuilderBase extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static CSSClass_FormBuilder = 'formBuilder'; static CSSClass_FormBuilderElement = 'formBuilder-element';
	static CSSClass_BuilderId = 'builder-id'; static CSSClass_ElementId = 'element-id'; static elmSeq = 0;
	get isFormBuilder() { return true } static get defaultAutoAppendFlag() { return false }
	get defaultAutoAppendFlag() { return this.class.defaultAutoAppendFlag }
	get id() { let result = this._id; if (result == null) { result = this._id = this.newElementId() } return result } set id(value) { this._id = value }
	get id2Builder() {
		let {_id2Builder: result} = this
		if (result == null) {
			result = {}
			let {builders} = this
			for (let key in builders) {
				let builder = builders[key]
				if (!builder.parentBuilder)
					builder.parentBuilder = this
				if (!builder.rootBuilder)
					builder.rootBuilder = this.rootBuilder
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
			let _e = this.getBuilderBlockArgs({ result }); result = getFuncValue.call(this, result, _e);
			if (_e.commitFlag) this._parent = result
		}
		return result
	}
	set parent(value) { this._parent = value }
	get layout() {
		let result = this._layout;
		if (result && (result.run || $.isFunction(result))) {
			let _e = this.getBuilderBlockArgs({ result }); result = getFuncValue.call(this, result, _e);
			if (result == null) { let {parent} = this; if (parent?.length) result = parent }
			if (_e.commitFlag) this._layout = result
		}
		return result
	}
	set layout(value) { this._layout = value }
	get parentPart() {
		let result = this._parentPart;
		if (result && $.isFunction(result)) {
			let _e = this.getBuilderBlockArgs({ result }); result = getFuncValue.call(this, result, _e);
			if (_e.commitFlag) this._parentPart = result
		}
		if (!result) result = this.parentBuilder?.part
		return result
	}
	set parentPart(value) { this._parentPart = value }
	get part() {
		let {_part: result} = this
		if (result && $.isFunction(result)) {
			let _e = this.getBuilderBlockArgs({ result })
			result = getFuncValue.call(this, result, _e)
			if (_e.commitFlag)
				this._part = result
		}
		return result
	}
	set part(value) { this._part = value }
	get parentLayout() { return (this.parentBuilder || {}).layout } get parentParent() { return (this.parentBuilder || {}).parent }
	get rootPart() { return (this.rootBuilder || {}).part } get rootLayout() { return (this.rootBuilder || {}).layout }
	get rootParent() { return (this.rootBuilder || {}).parent } get hasParent() { let {parent} = this; return parent?.length } get hasLayout() { let {layout} = this; return layout?.length }
	get layoutHasParent() { let {layout} = this; return layout && layout.length && !!(layout.parent() || {}).length } get isLayoutAttachedToParent() { let {layout} = this; return layout?.length && layout.parent() == parent }
	get visibleKosulu() {
		let result = this._visibleKosulu;
		if (result && (result.run || $.isFunction(result))) {
			let _e = this.getBuilderBlockArgs({ result, commitFlag: false }); result = getFuncValue.call(this, result, _e);
			if (_e.commitFlag) this._visibleKosulu = result
		}
		return result
	}
	set visibleKosulu(value) { this._visibleKosulu = value }
	
	constructor(e) {
		e = e || {}; super(e)
		$.extend(this, {
			_id: e.id, _parent: e.parent, _layout: e.layout, _part: e.part, _parentPart: e.parentPart, _visibleKosulu: e.visibleKosulu == null ? e.visibleBlock : e.visibleKosulu,
			autoAppendFlag: e.autoAppend ?? e.autoAppendFlag ?? this.defaultAutoAppendFlag, autoAppendIslemi: e.autoAppendIslemi, autoInitLayoutFlag: e.autoInitLayout ?? e.autoInitLayoutFlag,
			builders: e.builders || [], args: e.args, init: e.init, buildEk: e.buildEk, afterRun: e.afterRun, id2Builder: null, styles: e.styles || [], cssClasses: e.cssClasses || [],
			canDestroy: e.canDestroy ?? true, userData: e.userData
		});
		let {sabitDegerler} = e; if (sabitDegerler) { for (let key in sabitDegerler) { let value = sabitDegerler[key]; if (value !== undefined) { this[key] = value } } }
		if (!e.isCopy) {
			if (!this.autoAppendIslemi) { this.autoAppendMode_append() }
			let {_layout, autoAppendFlag} = this; if (_layout && autoAppendFlag == null) { this.autoAppendFlag = true }
		}
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
		for (let selector of ['styles', 'cssClasses']) { if (!this[selector]) { this[selector] = [] } }
		this.preInit(e); if (e.abortFlag) return
		this.beforeBuild(e); if (e.abortFlag) return
		this.build(e); if (e.abortFlag) return
		this.afterBuild(e); if (e.abortFlag) return
		this.runDevam(e)
	}
	postRun(e) {
		let styles = []; for (let builder of this.getBuildersWithSelf()) { let _e = $.extend({}, e, { target: styles }); builder.applyStyles(_e) }
		if (!$.isEmptyObject(styles)) {
			let {CSSClass_BuilderId} = FormBuilderBase, {id} = this;
			let styleHTML = $(`<style data-${CSSClass_BuilderId}="${id}">${styles.join(CrLf)}</style>`); styleHTML.appendTo('head')
		}
		if (this.isRootFormBuilder) {
			e.builder = this; let {afterRun} = this; delete this._id2Builder;
			if (afterRun) { getFuncValue.call(this, afterRun, e) }
		}
	}
	runDevam(e) {
		this.id2Builder;			/* getter ile olustur */
		let {builders, autoInitLayoutFlag} = this;
		for (let [key, builder] of Object.entries(builders)) {
			if (builder == null) { debugger }
			if (!builder._parent) {
				let {layout: _layout} = builder;
				// if (_layout && !isFunction(_layout?.parent)) { debugger }
				builder.parent = (_layout?.length && _layout?.parent?.()?.length) ? _layout.parent() : (this.layout || this.parent);
			}
			if (builder.autoInitLayoutFlag == null) { builder.autoInitLayoutFlag = autoInitLayoutFlag }
			builder.runInternal(e)
		}
		this.afterBuildDevam(e)
	}
	preInit(e) { }
	beforeBuild(e = {}) {
		let {init} = this
		if (init)
			getFuncValue.call(this, init, e)
	}
	build(e = {}) {
		this.preBuild(e); if (e.abortFlag) return
		this.buildDevam(e); if (e.abortFlag) return
		this.postBuild(e)
	}
	preBuild(e) { }
	buildDevam(e) { }
	postBuild(e) { e = e || {}; let {buildEk} = this; if (buildEk) { getFuncValue.call(this, buildEk, e) } }
	afterBuild(e) {
		e = e || {}; let {layout} = this;
		if (layout?.length) {
			let {CSSClass_FormBuilder, CSSClass_FormBuilderElement, CSSClass_BuilderId, CSSClass_ElementId} = FormBuilderBase;
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
			let elms = [layout /*, layout.children()*/]
			for (let elm of elms) {
				elm.addClass?.(CSSClass_FormBuilderElement)
				elm.attr?.(`data-${CSSClass_BuilderId}`, this.id)
				this.getElementId(elm)
			}
			this.updateVisible(e);
			if (this.autoAppendFlag) {
				let {parent} = this;
				if (parent?.length) {
					let {autoAppendIslemi} = this; let _e = { sender: this, builder: this };
					if (!parent?.parent()?.length) { let {parentLayout} = this; if (parentLayout?.length) { $.extend(_e, { layout: parent, parent: parentLayout }); getFuncValue.call(this, autoAppendIslemi, _e); } }
					$.extend(_e, { layout, parent }); getFuncValue.call(this, autoAppendIslemi, _e)
				}
			}
		}
		else { if (!this._layout) { layout = this.layout = this._parent } this.parent = null }
		for (let elm of [layout, this.input]) {
			if (!elm?.length) continue
			if (elm?.length && !elm.data('part')) { let {part} = this; if (part) { elm.data('part', part) } }
		}
		this.afterBuildDevam(e)
		/* this.applyStyles(e) */
	}
	afterBuildDevam(e) {
		if (!(this.isRootFormBuilder || this._afterRun_calistimi)) {
			let {afterRun} = this
			if (afterRun)
				getFuncValue.call(this, afterRun, e)
		}
		this._afterRun_calistimi = true
	}
	applyStyles(e) { this.applyStylesOncesi(e); this.applyStylesDevam(e); this.applyStylesSonrasi(e) }
	applyStylesOncesi(e) { } applyStylesDevam(e) { }
	applyStylesSonrasi(e) {
		e = e || {}; let {styles, layout} = this;
		if (!$.isEmptyObject(styles)) {
			let {target} = e, builderId = this.getBuilderId(layout), elementId = this.getElementId(layout);
			let builderBlockArgs, styleHTML = '';
			for (let key in styles) {
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
		let {layout} = this; if (!layout?.length) { return } layout.removeClass('jqx-hidden basic-hidden');
		if (visibleKosulu) { if (typeof visibleKosulu != 'string') { visibleKosulu = null } } else { visibleKosulu = 'jqx-hidden' }
		if (visibleKosulu) { layout.addClass(visibleKosulu) }
		return this
	}
	show() { let {layout} = this; if (layout?.length) { layout.removeClass('jqx-hidden basic-hidden') } return this }
	hide() { let {layout} = this; if (layout?.length) { layout.addClass('jqx-hidden') } return this }
	hideBasic() { let {layout} = this; if (layout?.length) { layout.addClass('basic-hidden') } return this }
	destroyPart(e) {
		if (this.isDestroyed || this._destroying) { return } this._destroying = true;
		let rootBuilder = this.rootBuilder ?? this, {builders, id} = this, {CSSClass_BuilderId} = FormBuilderBase;
		if (this.canDestroy) {
			try { let styles = $(`style[data-${CSSClass_BuilderId} = "${id}"]`); if (styles?.length) { styles.remove() } } catch (ex) { }
			try {
				let {layout, input, part} = this; if (part) { if (part.destroyPart) { part.destroyPart(e) } }
				for (let elm of [input, layout]) { if (elm?.length) { elm?.remove()} }
			}
			catch (ex) { console.error(ex) }
			try { for (let builder of builders) { if (builder != this && builder.destroyPart) { builder.destroyPart(e) } } } catch (ex) { console.error(ex) }
		}
		delete this._destroying; this.isDestroyed = true
		/*if (!rootBuilder.isDestroyed) { let {CSSClass_BuilderId} = FormBuilderBase, styles = $(`style[data-${CSSClass_BuilderId}="${this.id}"]`); if (styles?.length) { styles.remove() } rootBuilder.isDestroyed = true }*/
	}
	addForm(e, _layout, _parent, _renk, _zeminRenk, _styles) {
		e = e || {}; let id = isObject(e) ? e.id : e;
		let layout = isObject(e) ? e.layout : _layout;
		let parent = isObject(e) ? e.parent : _parent;
		let renk = isObject(e) ? e.renk : _renk;
		let zeminRenk = isObject(e) ? e.zeminRenk : _zeminRenk;
		let styles = isObject(e) ? e.styles : _styles;
		let builder = new FormBuilder({ id: id, layout: layout, parent: parent, styles: styles }); /* .autoAppend(); */
		if (renk || zeminRenk) { builder.addStyle(e => `$elementCSS { ${renk ? `color: ${renk};` : ''}${zeminRenk ? `color: ${zeminRenk};` : ''} }`) }
		this.add(builder); return builder
	}
	addFormWithParent(e, _layout) {
		e = e || {}; let id = isObject(e) ? e.id : e;
		let layout = isObject(e) ? e.layout : _layout;
		let builder = new FBuilderWithInitLayout({ id: id, layout: layout });
		this.add(builder); return builder
	}
	addElement(e, _etiket, _tagName, _layout, _renk, _zeminRenk, _styles) {
		e = e || {}; let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let tagName = isObject(e) ? e.tagName : _tagName;
		let layout = isObject(e) ? e.layout : _layout;
		let renk = isObject(e) ? e.renk : _renk;
		let zeminRenk = isObject(e) ? e.zeminRenk : _zeminRenk;
		let styles = isObject(e) ? e.styles : _styles;
		let builder = new FBuilder_SimpleElement({ id: id, etiket: etiket, tagName: tagName, layout: layout, styles: styles });
		if (renk || zeminRenk) { builder.addStyle(e => `$elementCSS { ${renk ? `color: ${renk};` : ''}${zeminRenk ? `color: ${zeminRenk};` : ''} }`) }
		this.add(builder); return builder
	}
	addDiv(e, _etiket, _tagName, _layout, _renk, _zeminRenk, _styles) {
		e = e || {}; let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let tagName = isObject(e) ? e.tagName : _tagName;
		let layout = isObject(e) ? e.layout : _layout;
		let renk = isObject(e) ? e.renk : _renk;
		let zeminRenk = isObject(e) ? e.zeminRenk : _zeminRenk;
		let styles = isObject(e) ? e.styles : _styles;
		let builder = new FBuilder_DivOrtak({ id: id, etiket: etiket, tagName: tagName, input: layout, styles: styles });
		if (renk || zeminRenk) { builder.addStyle(e => `$elementCSS { ${renk ? `color: ${renk};` : ''}${zeminRenk ? `color: ${zeminRenk};` : ''} }`) }
		this.add(builder); return builder
	}
	addSpan(e, _etiket, _tagName, _layout, _renk, _zeminRenk, _styles) {
		e = e || {}; let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let tagName = isObject(e) ? e.tagName : _tagName;
		let layout = isObject(e) ? e.layout : _layout;
		let renk = isObject(e) ? e.renk : _renk;
		let zeminRenk = isObject(e) ? e.zeminRenk : _zeminRenk;
		let styles = isObject(e) ? e.styles : _styles;
		let builder = new FBuilder_Span({ id: id, etiket: etiket, tagName: tagName, input: layout, styles: styles });
		if (renk || zeminRenk) { builder.addStyle(e => `$elementCSS { ${renk ? `color: ${renk};` : ''}${zeminRenk ? `color: ${zeminRenk};` : ''} }`) }
		this.add(builder); return builder
	}
	addInput(e, _etiket, _tagName, _inputType, _layout) {
		e = e || {}; let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let tagName = isObject(e) ? e.tagName : _tagName;
		let inputType = isObject(e) ? e.inputType : _inputType;
		let layout = isObject(e) ? e.layout : _layout;
		let builder = new FBuilder_DivOrtak({ id: id, etiket: etiket, tagName: tagName, inputType: inputType, layout: layout });
		this.add(builder); return builder
	}
	addTabPanel(e, _etiket, _initTabContent, _tabPageChanged) {
		e = e || {}; let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let initTabContent = isObject(e) ? e.initTabContent ?? e.initTabContentBlock : _initTabContent;
		let tabPageChanged = isObject(e) ? e.tabPageChanged ?? e.tabPageChangedBlock : _tabPageChanged;
		let builder = new FBuilder_Tabs({ id, etiket, initTabContent, tabPageChanged });
		this.add(builder); return builder
	}
	addTanimFormTabPanel(e, _value) {
		e = e || {}; let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let builder = new FBuilder_TanimFormTabs({ id: id, etiket: etiket });
		this.add(builder); return builder
	}
	addLabel(e, _etiket, _renk, _zeminRenk, _styles) {
		e = e || {}; let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let renk = isObject(e) ? e.renk : _renk;
		let zeminRenk = isObject(e) ? e.zeminRenk : _zeminRenk;
		let styles = isObject(e) ? e.styles : _styles;
		let builder = new FBuilder_Label({ id: id, etiket: etiket, styles: styles });
		if (renk || zeminRenk) { builder.addStyle(e => `$elementCSS { ${renk ? `color: ${renk};` : ''}${zeminRenk ? `color: ${zeminRenk};` : ''} }`) }
		this.add(builder); return builder
	}
	addBaslik(e, _etiket, _renk, _zeminRenk, _styles) {
		e = e || {}; let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let renk = isObject(e) ? e.renk : _renk;
		let zeminRenk = isObject(e) ? e.zeminRenk : _zeminRenk;
		let styles = isObject(e) ? e.styles : _styles;
		let builder = new FBuilder_Baslik({ id: id, etiket: etiket, styles: styles });
		if (renk || zeminRenk) { builder.addStyle(e => `$elementCSS { ${renk ? `color: ${renk};` : ''}${zeminRenk ? `color: ${zeminRenk};` : ''} }` ) }
		this.add(builder); return builder
	}
	addGroupBox(e, _etiket) {
		e = e || {}; let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let builder = new FBuilder_GroupBox({ id: id, etiket: etiket });
		this.add(builder); return builder
	}
	addTextInput(e, _etiket, _value, _placeHolder, _maxLength) {
		e = e || {};
		let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let value = isObject(e) ? e.value : _value;
		let placeHolder = isObject(e) ? e.placeHolder ?? e.placeholder : _placeHolder;
		let maxLength = isObject(e) ? e.maxLength : _maxLength;
		let builder = new FBuilder_TextInput({ id, etiket, value: value, placeHolder,  maxLength });
		this.add(builder);
		return builder
	}
	addPassInput(e, _etiket, _value, _placeHolder, _maxLength) {
		e = e || {};
		let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let value = isObject(e) ? e.value : _value;
		let placeHolder = isObject(e) ? e.placeHolder ?? e.placeholder : _placeHolder;
		let maxLength = isObject(e) ? e.maxLength : _maxLength;
		let builder = new FBuilder_PassInput({ id: id, etiket: etiket, value: value, placeHolder: placeHolder, maxLength: maxLength });
		this.add(builder);
		return builder
	}
	addNumberInput(e, _etiket, _value, _placeHolder, _maxLength, _fra, _min, _max, _step) {
		e = e || {};
		let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let value = isObject(e) ? e.value : _value;
		let placeHolder = isObject(e) ? e.placeHolder ?? e.placeholder : _placeHolder;
		let maxLength = isObject(e) ? e.maxLength : _maxLength;
		let fra = isObject(e) ? e.fra : _fra;
		let min = isObject(e) ? e.min : _min;
		let max = isObject(e) ? e.max : _max;
		let step = isObject(e) ? e.step : _step;
		let builder = new FBuilder_NumberInput({
			id: id, etiket: etiket, value: value, placeHolder: placeHolder, maxLength: maxLength,
			fra: fra, min: min, max: max, step: step
		});
		this.add(builder);
		return builder
	}
	addDateInput(e, _etiket, _value, _placeHolder) {
		e = e || {};
		let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let value = isObject(e) ? e.value : _value;
		let placeHolder = isObject(e) ? e.placeHolder ?? e.placeholder : _placeHolder;
		let builder = new FBuilder_DateInput({ id: id, etiket: etiket, value: value, placeHolder: placeHolder });
		this.add(builder);
		return builder
	}
	addTimeInput(e, _etiket, _value, _placeHolder) {
		e = e || {};
		let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let value = isObject(e) ? e.value : _value;
		let placeHolder = isObject(e) ? e.placeHolder ?? e.placeholder : _placeHolder;
		let builder = new FBuilder_TimeInput({ id: id, etiket: etiket, value: value, placeHolder: placeHolder });
		this.add(builder);
		return builder
	}
	addTextArea(e, _etiket, _value, _placeHolder, _maxLength, _rowCount) {
		e = e || {};
		let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let value = isObject(e) ? e.value : _value;
		let placeHolder = isObject(e) ? e.placeHolder ?? e.placeholder : _placeHolder;
		let maxLength = isObject(e) ? e.maxLength : _maxLength;
		let rowCount = isObject(e) ? coalesce(e.rowCount, e.rows) : _rowCount;
		let builder = new FBuilder_TextArea({
			id: id, etiket: etiket, value: value, placeHolder: placeHolder, maxLength: maxLength,
			rows: rowCount
		});
		this.add(builder);
		return builder
	}
	addToggleButton(e, _etiket, _value) {
		e = e || {};
		let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let value = isObject(e) ? e.value : _value;
		let builder = new FBuilder_ToggleButton({ id: id, etiket: etiket, value: value });
		this.add(builder);
		return builder
	}
	addCheckBox(e, _etiket, _value) {
		e = e || {};
		let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let value = isObject(e) ? e.value : _value;
		let builder = new FBuilder_CheckBox({ id: id, etiket: etiket, value: value });
		this.add(builder);
		return builder
	}
	addSwitchButton(e, _etiket, _value, _onLabel, _offLabel) {
		e = e || {};
		let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let value = isObject(e) ? e.value : _value;
		let onLabel = isObject(e) ? e.onLabel : _onLabel;
		let offLabel = isObject(e) ? e.offLabel : _offLabel;
		let builder = new FBuilder_SwitchButton({ id: id, etiket: etiket, value: value, onLabel: onLabel, offLabel: offLabel });
		this.add(builder);
		return builder
	}
	addButton(e, _etiket, _value, _handler) {
		e = e || {};
		let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let value = (isObject(e) ? e.value : _value) ?? etiket;
		let handler = isObject(e) ? coalesce(coalesce(e.handler, e.onClick), e.onClickEvent) : _handler;
		let builder = new FBuilder_Button({ id: id, etiket: etiket, value: value, onClick: handler });
		this.add(builder);
		return builder
	}
	addSelectElement(e, _etiket, _value, _source, _kodAttr, _adiAttr) {
		e = e || {};
		let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let value = isObject(e) ? e.value : _value;
		let source = isObject(e) ? e.source : _source;
		let kodAttr = isObject(e) ? e.kodAttr : _kodAttr;
		let adiAttr = isObject(e) ? e.adiAttr : _adiAttr;
		let builder = new FBuilder_SelectElement({
			id, etiket, value,
			source, kodAttr, adiAttr
		});
		this.add(builder);
		return builder
	}
	addRadioButton(e, _etiket, _value, _source, _kodAttr, _adiAttr) {
		e = e || {};
		let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let value = isObject(e) ? e.value : _value;
		let source = isObject(e) ? e.source : _source;
		let kodAttr = isObject(e) ? e.kodAttr : _kodAttr;
		let adiAttr = isObject(e) ? e.adiAttr : _adiAttr;
		let builder = new FBuilder_RadioButton({
			id: id, etiket: etiket, value: value,
			source: source, kodAttr: kodAttr, adiAttr: adiAttr
		});
		this.add(builder);
		return builder
	}
	addColorInput(e, _etiket, _value) {
		e = e || {};
		let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let value = isObject(e) ? e.value : _value;
		let builder = new FBuilder_Color({ id: id, etiket: etiket, value: value });
		this.add(builder);
		return builder
	}
	addModelKullan(e, _etiket, _value, _mfSinif, _source, _ozelQueryDuzenleBlock, _veriYukleninceBlock, _kodAttr, _adiAttr) {
		e = e || {}; let id = isObject(e) ? e.id : e;
		let etiket = isObject(e) ? e.etiket : _etiket;
		let value = isObject(e) ? e.value : _value;
		let mfSinif = isObject(e) ? e.mfSinif : _mfSinif;
		let source = isObject(e) ? e.source : _source;
		let ozelQueryDuzenle = isObject(e) ? e.ozelQueryDuzenle ?? e.ozelQueryDuzenleBlock : _ozelQueryDuzenleBlock;
		let veriYuklenince = isObject(e) ? e.veriYuklenince ?? e.onBindingComplete : _veriYukleninceBlock;
		let kodAttr = isObject(e) ? e.kodAttr : _kodAttr;
		let adiAttr = isObject(e) ? e.adiAttr : _adiAttr;
		let builder = new FBuilder_ModelKullan({ id, etiket, value, ozelQueryDuzenle, veriYuklenince, mfSinif, source, kodAttr, adiAttr });
		this.add(builder);
		return builder
	}
	addGrid(e, _mfSinif, _source, _tabloKolonlari, _sabitmi, _kontrolcu, _ozelQueryDuzenleBlock, _veriYukleninceBlock, _kodAttr, _adiAttr, _veriDegisinceBlock) {
		e = e || {}; let id = isObject(e) ? e.id : e;
		let mfSinif = isObject(e) ? e.mfSinif : _mfSinif;
		let source = isObject(e) ? e.source : _source;
		let tabloKolonlari = isObject(e) ? e.tabloKolonlari : _tabloKolonlari;
		let sabitmi = isObject(e) ? e.sabitmi : _sabitmi;
		let kontrolcu = isObject(e) ? e.kontrolcu : _kontrolcu;
		let ozelQueryDuzenle = isObject(e) ? e.ozelQueryDuzenle ?? e.ozelQueryDuzenleBlock : _ozelQueryDuzenleBlock;
		let veriYuklenince = isObject(e) ? e.veriYuklenince ?? e.onBindingComplete : _veriYukleninceBlock;
		let kodAttr = isObject(e) ? e.kodAttr : _kodAttr;
		let adiAttr = isObject(e) ? e.adiAttr : _adiAttr;
		let veriDegisince = isObject(e) ? e.veriDegisince : _veriDegisinceBlock;
		let builder = new FBuilder_Grid({ id, mfSinif, source, tabloKolonlari, sabitmi, kontrolcu, ozelQueryDuzenle, veriYuklenince, veriDegisince, kodAttr, adiAttr });
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
		e ??= {}
		let id = (isObject(e) ? e.id : e) ?? 'islemTuslari'
		let tip = isObject(e) ? e.tip : _tip
		let id2Handler = isObject(e) ? e.id2Handler : _id2Handler
		let ekButonlarIlk = isObject(e) ? e.ekButonlarIlk : _ekButonlarIlk
		let ekButonlarSon = isObject(e) ? e.ekButonlarSon : _ekButonlarSon
		let butonlarDuzenleyici = isObject(e) ? e.butonlarDuzenleyici : _butonlarDuzenleyici
		let sagButonlar = isObject(e) ? e.sagButonlar : _sagButonlar
		let prependFlag = isObject(e) ? e.prependFlag : _prependFlag
		let builder = new FBuilder_IslemTuslari({
			id, tip, id2Handler,  ekButonlarIlk, ekButonlarSon,
			butonlarDuzenleyici, sagButonlar, prependFlag
		})
		this.add(builder)
		return builder
	}
	addAccordion(e, _etiket, _panels, _coklu, _defaultCollapsed, _userData) {
	    e ??= {}
	    let id = (isObject(e) ? e.id : e) ?? 'accordion'
	    let etiket = isObject(e) ? e.etiket : _etiket
	    let panels = isObject(e) ? e.panels : _panels
	    let coklu = isObject(e) ? e.coklu ?? e.coklumu : _coklu
	    let defaultCollapsed = isObject(e) ? e.defaultCollapsed : _defaultCollapsed
		let userData = isObject(e) ? e.userData : _userData
	    let builder = new FBuilder_AccordionPart({ id, etiket, panels, coklu, defaultCollapsed, userData })
	    this.add(builder)
	    return builder
	}
	addSimpleComboBox(e, _etiket, _placeholder, _value, _source, _autoClear, _delay, _minLength, _disabled, _name, _userData) {
	    e ??= {}
	    let id = isObject(e) ? e.id : e
	    let etiket = isObject(e) ? e.etiket : _etiket
	    let placeholder = isObject(e) ? (e.placeholder ?? e.placeHolder) : _placeholder
	    let value = isObject(e) ? e.value : _value
	    let source = isObject(e) ? e.source : _source
	    let autoClearFlag = isObject(e) ? e.autoClear : _autoClear
	    let comboBox_delay = isObject(e) ? e.delay : _delay
	    let comboBox_minLength = isObject(e) ? e.minLength : _minLength
		let disabled = isObject(e) ? e.disabled : _disabled
	    let name = isObject(e) ? e.name : _name
		let userData = isObject(e) ? e.userData : _userData
		let builder = new FBuilder_SimpleComboBox({
	        id, etiket, placeholder,
			value, source, autoClearFlag,
	        comboBox_delay, comboBox_minLength,
			name, userData
	    })
	    this.add(builder)
	    return builder
	}
	add(...aCollection) {
		if (!aCollection)
			return this
		let {builders} = this
		for (let key in aCollection) {
			let builderOrArray = aCollection[key]
			if (builderOrArray) {
				if (isArray(builderOrArray)) {
					for (let _key in builderOrArray) {
						let subBuilder = builderOrArray[_key]
						if (subBuilder) builders.push(subBuilder)
					}
				}
				else
					builders.push(builderOrArray)
			}
		}
		return this
	}
	addAll(aCollection) { this.add(...aCollection); return this }
	clear() { this.builders = [] }
	addStyle(...aCollection) {
		if (!aCollection)
			return this
		let {styles} = this
		for (let valueOrArray of aCollection) {
			if (valueOrArray) {
				if (isArray(valueOrArray)) {
					for (let subValue of valueOrArray) {
						if (subValue)
							styles.push(subValue)
					}
				}
				else
					styles.push(valueOrArray)
			}
		}
		return this
	}
	addStyles(aCollection) { this.addStyle(...aCollection); return this }
	clearStyles() { this.styles = []; return this }
	addCSS(...aCollection) {
		if (!aCollection) return this; let {cssClasses} = this;
		for (let valueOrArray of aCollection) {
			if (valueOrArray) {
				if ($.isArray(valueOrArray)) { for (let subValue of valueOrArray) { if (subValue) cssClasses.push(subValue) } }
				else { cssClasses.push(valueOrArray) }
			}
		}
		return this
	}
	addCSSClasses(aCollection) { this.addCSS(...aCollection); return this }
	clearCSS() { this.cssClasses = []; return this }
	setId(value) { this.id = value; return this }
	setArgs(value) { this.args = value; return this }
	onInit(handler) { this.init = handler; return this }
	onBuildEk(handler) { this.buildEk = handler; return this }
	onAfterRun(handler) { this.afterRun = handler; return this }
	autoAppend() { this.autoAppendFlag = true; return this }
	noAutoAppend() { this.autoAppendFlag = false; return this }
	setVisibleKosulu(value) { this.visibleKosulu = value; return this }
	autoAppendMode_append() {
		this.autoAppendIslemi = e => {
			let {layout, parent} = e
			if ((layout || {})?.length && (parent || {}).length && !(layout?.parent() || {}).length)
				layout?.appendTo(parent)
		};
		return this
	}
	autoAppendMode_prepend() {
		this.autoAppendIslemi = e => {
			let {layout, parent} = e;
			if ((layout || {}).length && (parent || {}).length && !(layout.parent() || {}).length) layout.prependTo(parent)	
		};
		return this
	}
	autoAppendMode_insertBefore() {
		this.autoAppendIslemi = e => {
			let {layout, parent} = e;
			if ((layout || {}).length && (parent || {}).length && !(layout.parent() || {}).length) layout.insertBefore(parent)	
		};
		return this
	}
	autoAppendMode_addAfter() {
		this.autoAppendIslemi = e => {
			let {layout, parent} = e;
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
	setRootBuilder(value) { this.rootBuilder = value; return this }
	setParentBuilder(value) { this.parentBuilder = value; return this }
	destroyable() { this.canDestroy = true; return this }
	noDestroy() { this.canDestroy = false; return this }
	addStyle_wh(e, _height) {
		if (e == null || typeof e != 'object') e = { width: e, height: _height }
		let withImportant = value => {
			if (value != null && value != '') { value = value.toString() }
			if ($.isNumeric(value)) { value += 'px' }
			let Postfix_Important = ' !important';
			if (typeof value == 'string' && !value.endsWith(Postfix_Important)) { value += Postfix_Important }
			return value
		}
		let _styles = [], width = withImportant(e.width), height = withImportant(e.height);
		if (width) _styles.push(`width: ${width};`)
		if (height) _styles.push(`height: ${height};`)
		if (_styles.length) this.addStyle(e => `$elementCSS { ${_styles.join(' ')} }`)
		return this
	}
	addStyle_fullWH(e, _height) {
		if (e == null || typeof e != 'object') e = { width: e, height: _height };
		for (let key of ['width', 'height']) { if (!e[key]) e[key] = 'var(--full)' }
		return this.addStyle_wh(e)
	}
	getBuilderId(elm) {
		if (!(elm && elm.length)) return null
		let {CSSClass_BuilderId} = FormBuilderBase;
		return elm.data(CSSClass_BuilderId)
	}
	getElementId(elm) {
		if (!(elm && elm.length)) return null
		let {CSSClass_ElementId} = FormBuilderBase;
		let result = elm.data?.(CSSClass_ElementId);
		if (!result) { result = this.newElementId(); elm.attr?.(`data-${CSSClass_ElementId}`, result) }
		return result
	}
	newElementId() { return `fe-${++FormBuilderBase.elmSeq}` }
	getCSSBuilderSelector(elmOrId) { return this.getCSSSelector({ builderId: elmOrId }) }
	getCSSElementSelector(elmOrId) { return this.getCSSSelector({ elmId: elmOrId }) }
	getCSSSelector(e) {
		let {builderId} = e; if (builderId && typeof builderId == 'object') builderId = this.getBuilderId(builderId)
		let elmId = coalesce(e.elmId, e.elementId); if (elmId && typeof elmId == 'object') elmId = this.getElementId(elmId)
		let {CSSClass_FormBuilderElement, CSSClass_BuilderId, CSSClass_ElementId} = FormBuilderBase;
		let result = `.${CSSClass_FormBuilderElement}`;
		if (builderId) result += `[data-${CSSClass_BuilderId}="${builderId}"]`
		if (elmId) result += `[data-${CSSClass_ElementId}="${elmId}"]`
		return result
	}
	getItemsAndSelf() { return this.getBuildersWithSelf() }
	getItems() { return this.getBuilders() }
	*getBuilders(e) {
		e = $.extend({}, e || {}); if (e.withSelf) { delete e.withSelf; yield this }
		let {builders} = this;
		for (let key in builders) {
			let builder = builders[key]; yield builder;
			for (let subBuilder of builder.getBuilders(e)) { yield subBuilder }
		}
	}
	getBuildersWithSelf(e) { e = $.extend({}, e || {}, { withSelf: true }); return this.getBuilders(e) }
	getBuilderBlockArgs(e) {
		let _this = this;
		let result = {
			sender: _this, builder: _this, commitFlag: coalesce(e.commitFlag, true),
			commit() { this.commitFlag = true; return this },
			temp() { this.commitFlag = false; return this }
		};
		return $.extend(result, e)
	}
	[Symbol.iterator](e) { return this.getBuilders(e) }
}
