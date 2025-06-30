class ParamBuilder extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get copyOzelKeys() { return [
		'_id2Item', 'builder', '_root', '_parent', '_inst', '_altInst', 'converter', 'initValue', '_layout', 'part', '_temps', '_paramHostVarsDuzenle', '_paramSetValues',
		'_tanimUIArgsDuzenle', '_kaydetOncesi', '_kaydedince', '_formBuilderDuzenle', 'fbd_ekIslemler', 'mfSinif', 'source', 'ozelQueryDuzenle', 'veriYuklenince'
	] }
	static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, '_initFlag', '_id', ...this.copyOzelKeys] }
	static get formBuilderClass() { return FormBuilder }
	get id2Item() { let result = this._id2Item; if (result == null) { result = {}; for (const item of (this.items || [])) { result[item.id] = item } this._id2Item = result } return result }
	get defaultAltInst() { return null }
	get id() {
		let result = this._id; if (result === undefined) { result = this._id = this.defaultId }
		if (result === undefined) { result = this._id = newGUID() } return result
	}
	set id(value) { this._id = value }
	get rowAttr() { let result = this._rowAttr; if (result === undefined) { result = this._rowAttr = this.id } return result } set rowAttr(value) { this._rowAttr = value }
	get layout() { let result = this._layout; if (isFunction(result)) { result = this._layout = getFuncValue.call(this, result, this.getBuilderArgs()) } return result }
	set layout(value) { this._layout = value }
	get inst() { let result = this._inst; if (isFunction(result)) { result = this._inst = getFuncValue.call(this, result, this.getBuilderArgs()) } return result }
	set inst(value) { this._inst = value }
	get altInst() {
		let result = this._altInst;
		if (result === undefined) {
			result = this._altInst = e => {
				let _result = this.defaultAltInst ?? this.parent?.altInst;
				return _result === undefined ? this.inst : _result
			}
		}
		if (isFunction(result)) { result = this._altInst = getFuncValue.call(this, result, this.getBuilderArgs()) }
		if (typeof result == 'string') { const {inst} = this; result = this._altInst = inst ? inst[result] : null }
		if (result == null) { result = this._altInst = this.defaultAltInst ?? this.inst }
		return result
	}
	set altInst(value) { this._altInst = value }
	get value() {
		const {altInst} = this; if (altInst == null) { return this.convertedValue_hostVars(this.initValue) }
		let result = altInst[this.id]; return result === undefined ? this.convertedValue_hostVars(this.initValue) : result
	}
	set value(value) {
		const {altInst} = this; value = this.convertedValue_setValues(value);
		if (altInst) { const {id} = this; if (id) { if (value === undefined) delete altInst[id]; else altInst[id] = value } } else { this.initValue = value }
	}
	get root() { return this._root } set root(value) { this._root = value }
	get parent() { return this._parent } set parent(value) { this._parent = value }
	get temps() { return this._temps } set temps(value) { this._temps = value }
	constructor(e) {
		e = e ?? {}; super(e); $.extend(this, {
			_initFlag: e.initFlag ?? false, temps: e.temps || {}, _id: e.id, _rowAttr: e.rowAttr, etiket: e.etiket, converter: e.converter, initValue: e.value, items: e.items || [],
			part: e.part ?? e.parentPart ?? e.sender, _root: e.root, _parent: e.parent, _inst: e.inst, _altInst: e.altInst, _layout: e.layout,
			_paramHostVarsDuzenle: e.paramHostVarsDuzenle, _paramSetValues: e.paramSetValues, _tanimUIArgsDuzenle: e.tanimUIArgsDuzenle,
			_kaydetOncesi: e.kaydetOncesi, _kaydedince: e.kaydedince, _formBuilderDuzenle: e.formBuilderDuzenle, fbd_ekIslemler: e.fbd_ekIslemler || []
		})
	}
	run(e) {
		if (this._initFlag) { return }
		this.runInternal(e); this.afterRun(e); this._initFlag = true; return this
	}
	runInternal(e) {
		let root = this.root = this.root || this;
		if (this == root) {
			this.addStyle(() =>
				`/* $elementCSS .formBuilder-element.parent { margin: 0 0 10px 0 !important } */
				 $elementCSS .formBuilder-element.parent > *:not(label):not(div) { margin-right: 10px !important }`
			)
		}
		this.preBuild(e); this.build(e); this.afterBuild(e); return this
	}
	afterRun(e) {
		const {root, items} = this;
		let {value} = this, initValue; if (value === undefined) { value = initValue = this.convertedValue_setValues(this.initValue) }
		if (initValue !== undefined) { const {altInst} = this; if (altInst) { this.value = initValue } }
		if (!$.isEmptyObject(items)) { const {temps, altInst} = this; for (const item of items) { $.extend(item, { root, parent: this, _inst: altInst }); item.run(e) } }
	}
	preBuild(e) { }
	build(e) { }
	afterBuild(e) { const {altInst} = this; if (altInst) { const {id, value} = this; if (id && altInst[id] === undefined && value !== undefined) { this.value = value } } }
	formBuilderDuzenle(e) {
		e = $.extend({}, e); e.sender = this;
		let builder = this.builder = e.builder; const $this = this;
		$.extend(e, {
			moveTo(e) {
				let target = e.target ?? e; if (isFunction(target)) { target = getFuncValue.call($this, target, this) } if (!target) return null
				if (!(target.class == FormBuilder || target.class == FBuilderWithInitLayout)) { target = e.target = target.addForm() }
				const paramci = this.sender, parentBuilder = paramci.parent.builder, {_id2Builder} = parentBuilder, {builder} = this; const {id} = builder;
				parentBuilder.builders = parentBuilder.builders.filter(x => x.id != id); if (_id2Builder) { delete _id2Builder[id] }
				builder.parentBuilder = target; builder.parent = target.layout;
				if (!target._altInst) { target.altInst = paramci.parent.altInst }
				target.builders.push(builder); return builder
			},
			moveToTabPage(e) {
				let target = e.target ?? e;
				if ($.isPlainObject(target)) {
					let {id, etiket} = target; if (!id) return null
					const {tabPanel} = this; target = tabPanel.id2Builder[id];
					if (!target) {
						if (isFunction(etiket)) { etiket = getFuncValue.call($this, etiket, this) }
						target = tabPanel.addTab(id, etiket); tabPanel.id2Builder[id] = target
					}
					e.target = target
				}
				return this.moveTo(e)
			}
		});
		this.formBuilderDuzenleInternal(e); this.formBuilderDuzenleSonrasi(e)
	}
	formBuilderDuzenleInternal(e) { }
	formBuilderDuzenleSonrasi(e) {
		let {builder} = e; const parentBuilder = builder
		if (this.builder != null) { builder = e.builder = this.builder }
		builder.sender = e.sender;
		for (const key of ['value', 'altInst']) { const value = this[key]; if (value !== undefined) { builder[key] = value } }
		if (builder._inst === undefined && builder.altInst !== undefined) { builder.inst = builder.altInst }
		const {fbd_ekIslemler, _formBuilderDuzenle} = this;
		if (!$.isEmptyObject(fbd_ekIslemler)) { for (const handler of fbd_ekIslemler) { getFuncValue.call(this, handler, e) } }
		if (_formBuilderDuzenle) { getFuncValue.call(this, _formBuilderDuzenle, e) }
		const {_savedBuilder} = e; if (_savedBuilder) { builder = e.builder = _savedBuilder; delete e._savedBuilder } else { builder = e.builder = parentBuilder }
		const {items} = this; if (!$.isEmptyObject(items)) { for (const item of items) { item.formBuilderDuzenle(e) } }
	}
	paramHostVarsDuzenle(e) {
		const {hv} = e, {rowAttr, _paramHostVarsDuzenle} = this;
		if (rowAttr) { const value = this.convertedValue_hostVars(this.value); if (value !== undefined) { hv[rowAttr] = value } }
		if (_paramHostVarsDuzenle) { getFuncValue.call(this, _paramHostVarsDuzenle, e) }
	}
	paramSetValues(e) {
		const {rec} = e, {rowAttr, _paramSetValues} = this;
		if (rowAttr) { const value = this.convertedValue_setValues(rec[rowAttr]); if (value !== undefined) { this.value = value } }
		if (_paramSetValues) { getFuncValue.call(this, _paramSetValues, e) }
	}
	tanimUIArgsDuzenle(e) { const {_tanimUIArgsDuzenle} = this; if (_tanimUIArgsDuzenle) getFuncValue.call(this, _tanimUIArgsDuzenle, e) }
	kaydetOncesi(e) { const {_kaydetOncesi} = this; if (_kaydetOncesi) getFuncValue.call(this, _kaydetOncesi, e) }
	kaydedince(e) { const {_kaydedince} = this; if (_kaydedince) getFuncValue.call(this, _kaydedince, e) }
	convertedValue(value) {
		value = this.convertedValueInternal(value);
		const {converter} = this; if (converter) { value = getFuncValue.call(this, converter, this.getBuilderArgs({ value })) }
		return value
	}
	convertedValueInternal(value) { return value }
	convertedValue_hostVars(value) { return this.convertedValue(value) }
	convertedValue_setValues(value) { return this.convertedValue(value) }
	addAll(...args) { const {items} = this; for (const item of args) { if ($.isArray(item)) this.add(...item); else items.push(item) } return this }
	add(item) { this.items.push(item); return item }
	addUIElement(e) { e = e ?? {}; const id = typeof e == 'object' ? e.id : e; return this.add(new ParamBuilder_UIElement({ id })) }
	addForm(e, _layout) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		const layout = typeof e == 'object' ? e.layout : _layout;
		return this.add(new ParamBuilder_Form({ id, layout }))
	}
	addFormWithParent(e) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		return this.add(new ParamBuilder_FormWithParent({ id }))
	}
	addTabPage(e, _etiket) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		return this.add(new ParamBuilder_TabPage({ id, etiket }))
	}
	addAltInst(e, _instBuilder) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		const instBuilder = typeof e == 'object' ? e.id : _instBuilder;
		return this.add(new ParamBuilder_AltInst({ id, instBuilder }))
	}
	addAltObject(e) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		return this.add(new ParamBuilder_AltObject({ id }))
	}
	addAltArray(e) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		return this.add(new ParamBuilder_AltArray({ id }))
	}
	addKullanim(e) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		return this.add(new ParamBuilder_Kullanim({ id }))
	}
	addGrup(e, _etiket) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		return this.add(new ParamBuilder_Grup({ id, etiket }))
	}
	addCheckBox(e, _etiket, _value) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		return this.add(new ParamBuilder_CheckBox({ id, etiket, value }))
	}
	addSwitchButton(e, _etiket, _value) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		return this.add(new ParamBuilder_SwitchButton({ id, etiket, value }))
	}
	addButton(e, _etiket, _value, _handler) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const handler = typeof e == 'object' ? e.handler ?? e.onClick ?? e.onClickEvent : _handler;
		return this.add(new ParamBuilder_Button({ id, etiket, value, handler }))
	}
	addInfo(e, _modulAdi, _handler) {
		e = e ?? {}; const section = typeof e == 'object' ? e.section : e;
		const modulAdi = typeof e == 'object' ? e.modulAdi ?? e.modul : _modulAdi;
		return this.add(new ParamBuilder_Info({ section, modulAdi }))
	}
	addTextInput(e, _etiket, _value, _maxLength) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const maxLength = typeof e == 'object' ? e.maxLength : _maxLength;
		return this.add(new ParamBuilder_TextInput({ id, etiket, value, maxLength }))
	}
	addPassInput(e, _etiket, _value, _maxLength) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const maxLength = typeof e == 'object' ? e.maxLength : _maxLength;
		return this.add(new ParamBuilder_PassInput({ id, etiket, value, maxLength }))
	}
	addTextArea(e, _etiket, _value, _maxLength, _rowCount) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const maxLength = typeof e == 'object' ? e.maxLength : _maxLength;
		const rowCount = typeof e == 'object' ? e.rowCount : _rowCount;
		return this.add(new ParamBuilder_TextArea({ id, etiket, value, maxLength, rowCount }))
	}
	addNumberInput(e, _etiket, _value, _maxLength, _min, _max, _step) {
		e = e ?? {};
		const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const maxLength = typeof e == 'object' ? e.maxLength : _maxLength;
		const min = typeof e == 'object' ? e.min : _min;
		const max = typeof e == 'object' ? e.max : _max;
		const step = typeof e == 'object' ? e.step : _step;
		return this.add(new ParamBuilder_NumberInput({ id, etiket, value, maxLength, min, max, step }))
	}
	addDateInput(e, _etiket, _value) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		return this.add(new ParamBuilder_DateInput({ id, etiket, value }))
	}
	addModelKullan(e, _etiket, _value, _mfSinif, _source, _ozelQueryDuzenle, _veriYuklenince, _kodAttr, _adiAttr) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const mfSinif = typeof e == 'object' ? e.mfSinif : _mfSinif;
		const source = typeof e == 'object' ? e.source : _source;
		const ozelQueryDuzenle = typeof e == 'object' ? (e.ozelQueryDuzenle ?? e.ozelQueryDuzenleBlock) : _ozelQueryDuzenle;
		const veriYuklenince = typeof e == 'object' ? (e.veriYuklenince ?? e.onBindingComplete) : _veriYuklenince;
		const kodAttr = typeof e == 'object' ? e.kodAttr : _kodAttr;
		const adiAttr = typeof e == 'object' ? e.adiAttr : _adiAttr;
		return this.add(new ParamBuilder_ModelKullan({ id, etiket, value, mfSinif, source, ozelQueryDuzenle, veriYuklenince, kodAttr, adiAttr }))
	}
	addTekSecim(e, _etiket, _value, _tekSecim, _kaListe, _source, _veriYuklenince, _kodAttr, _adiAttr) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const tekSecim = typeof e == 'object' ? (e.tekSecim ?? e.tekSecimSinif) : _tekSecim;
		const kaListe = typeof e == 'object' ? e.kaListe : _kaListe;
		const source = typeof e == 'object' ? e.source : _source;
		const veriYuklenince = typeof e == 'object' ? e.veriYuklenince ?? e.onBindingComplete : _veriYuklenince;
		const kodAttr = typeof e == 'object' ? e.kodAttr : _kodAttr;
		const adiAttr = typeof e == 'object' ? e.adiAttr : _adiAttr;
		return this.add(new ParamBuilder_TekSecim({ id, etiket, value, tekSecim, kaListe, veriYuklenince, kodAttr, adiAttr }))
	}
	addGrid(e, _etiket, _value, _mfSinif, _source, _tabloKolonlari, _sabitmi, _kontrolcu, _ozelQueryDuzenle, _veriYuklenince, _kodAttr, _adiAttr, _veriDegisince) {
		e = e ?? {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket;
		const value = typeof e == 'object' ? e.value : _value;
		const mfSinif = typeof e == 'object' ? e.mfSinif : _mfSinif;
		const tabloKolonlari = typeof e == 'object' ? e.tabloKolonlari : _tabloKolonlari;
		const sabitmi = typeof e == 'object' ? e.sabitmi : _sabitmi;
		const kontrolcu = typeof e == 'object' ? e.kontrolcu : _kontrolcu;
		const source = typeof e == 'object' ? e.source : _source;
		const ozelQueryDuzenle = typeof e == 'object' ? e.ozelQueryDuzenle ?? e.ozelQueryDuzenleBlock : _ozelQueryDuzenle;
		const veriYuklenince = typeof e == 'object' ? e.veriYuklenince ?? e.onBindingComplete : _veriYuklenince;
		const kodAttr = typeof e == 'object' ? e.kodAttr : _kodAttr;
		const adiAttr = typeof e == 'object' ? e.adiAttr : _adiAttr;
		const veriDegisince = typeof e == 'object' ? e.veriDegisince : _veriYuklenince;
		return this.add(new ParamBuilder_Grid({ id, etiket, value, mfSinif, source, tabloKolonlari, sabitmi, kontrolcu, ozelQueryDuzenle, veriYuklenince, veriDegisince, kodAttr, adiAttr }))
	}
	addGridGiris(e, _etiket, _value, _mfSinif, _source, _tabloKolonlari, _kodAttr, _adiAttr) {
		return this.addGrid(e, _etiket, _value, _mfSinif, _source, _tabloKolonlari, false, _kodAttr, _adiAttr).gridliGiris()
	}
	addGridGiris_sabit(e, _etiket, _value, _mfSinif, _source, _tabloKolonlari, _kodAttr, _adiAttr) {
		return this.addGrid(e, _etiket, _value, _mfSinif, _source, _tabloKolonlari, true, _kodAttr, _adiAttr).gridliGiris()
	}
	addGridGosterici(e, _etiket, _value, _mfSinif, _source, _tabloKolonlari, _kontrolcu, _ozelQueryDuzenle, _veriYuklenince, _kodAttr, _adiAttr) {
		return this.addGrid(e, _etiket, _value, _mfSinif, _source, _tabloKolonlari, false, _kontrolcu, _ozelQueryDuzenle, _veriYuklenince, _kodAttr, _adiAttr).gridliGosterici()
	}

	addBool(...args) { return this.addCheckBox(...args) }
	addSwitch(...args) { return this.addSwitchButton(...args) }
	addString(...args) { return this.addTextInput(...args) }
	addText(...args) { return this.addTextInput(...args) }
	addML(...args) { return this.addTextArea(...args) }
	addPass(...args) { return this.addPassInput(...args) }
	addNumber(...args) { return this.addNumberInput(...args) }
	addDate(...args) { return this.addDateInput(...args) }

	setId(value) { this.id = value; return this }
	setRowAttr(value) { this.rowAttr = value; return this }
	noRowAttr() { return this.setRowAttr(null) }
	setEtiket(value) { this.etiket = value; return this }
	setItems(args) { this.items = args; return this }
	setPart(value) { this.part = value; return this }
	setInst(value) { this.inst = value; return this }
	setAltInst(value) { this.altInst = value; return this }
	setLayout(value) { this.layout = value; return this }
	getValueIslemi(...args) { this.fbdEkIslem(({ builder: fbd }) => fbd.getValueIslemi(...args)); return this }
	setValue(value) { this.value = value; return this }
	setConverter(handler) { this.converter = handler; return this }
	paramHostVarsDuzenleIslemi(handler) { this._paramHostVarsDuzenle = handler; return this }
	paramSetValuesIslemi(handler) { this._paramSetValues = handler; return this }
	tanimUIArgsDuzenleIslemi(handler) { this._tanimUIArgsDuzenle = handler; return this }
	kaydedinceIslemi(handler) { this._kaydedince = handler; return this }
	formBuilderDuzenleIslemi(handler) { this._formBuilderDuzenle = handler; return this }
	fbdEkIslem(handler) { this.fbd_ekIslemler.push(handler); return this }
	setPlaceHolder(...args) { this.fbdEkIslem(({ builder: fbd }) => fbd.setPlaceHolder(...args)); return this }
	setPlaceholder(...args) { this.fbdEkIslem(({ builder: fbd }) => fbd.setPlaceholder(...args)); return this }
	altAlta(...args) { this.fbdEkIslem(e => e.builder.altAlta(...args)); return this }
	yanYana(...args) { this.fbdEkIslem(e => e.builder.yanYana(...args)); return this }
	addStyle(...args) { this.fbdEkIslem(e => e.builder.addStyle(...args)); return this }
	addStyles(...args) { this.fbdEkIslem(e => e.builder.addStyles(...args)); return this }
	addCSS(...args) { this.fbdEkIslem(e => e.builder.addCSS(...args)); return this }
	addStyle_wh(...args) { this.fbdEkIslem(e => e.builder.addStyle_wh(...args)); return this }
	addStyle_fullWH(...args) { this.fbdEkIslem(e => e.builder.addStyle_fullWH(...args)); return this }
	etiketGosterim_normal(...args) { this.fbdEkIslem(({ builder: fbd }) => fbd.etiketGosterim_normal(...args)); return this }
	etiketGosterim_placeHolder(...args) { this.fbdEkIslem(({ builder: fbd }) => fbd.etiketGosterim_placeHolder(...args)); return this }
	etiketGosterim_placeholder(...args) { this.fbdEkIslem(({ builder: fbd }) => fbd.etiketGosterim_placeholder(...args)); return this }
	etiketGosterim_yok(...args) { this.fbdEkIslem(({ builder: fbd }) => fbd.etiketGosterim_yok(...args)); return this }
	onInit(handler) { this.fbdEkIslem(e => e.builder.onInit(handler)); return this }
	onBuildEk(handler) { this.fbdEkIslem(e => e.builder.onBuildEk(handler)); return this }
	onAfterRun(handler) { this.fbdEkIslem(e => e.builder.onAfterRun(handler)); return this }
	setVisibleKosulu(handler) { this.fbdEkIslem(e => e.builder.setVisibleKosulu(handler)); return this }
	updateVisible(_e) { this.fbdEkIslem(e => e.builder.updateVisible(_e)); return this }
	show(_e) { this.fbdEkIslem(e => e.builder.show(_e)); return this }
	hide(_e) { this.fbdEkIslem(e => e.builder.hide(_e)); return this }
	hideBasic(_e) { this.fbdEkIslem(e => e.builder.hideBasic(_e)); return this }
	enable(_e) { this.fbdEkIslem(e => e.builder.enable(_e)); return this }
	disable(_e) { this.fbdEkIslem(e => e.builder.disable(_e)); return this }
	shallowCopy(e) {
		const inst = super.shallowCopy(e);
		for (const key of this.class.copyOzelKeys) { inst[key] = this[key] }
		return inst
	}
	deepCopy(e) {
		const inst = super.deepCopy(e);
		for (const key of this.class.copyOzelKeys) { inst[key] = this[key] }
		return inst
	}
	getBuilderArgs(e) { e = e ?? {}; return $.extend({}, e, { paramci: this }) }
	getItemsAndSelf() { return this.getItems({ withSelf: true }) }
	*getItems(e) {
		e = e ?? {}; const {withSelf} = e; if (withSelf) { yield this }
		const items = this.items ?? []; for (const item of items) {
			yield item;
			for (const subItem of item.getItems()) { yield subItem }
		}
	}
	[Symbol.iterator](e) { return this.getItems(e) }
}
class RootParamBuilder extends ParamBuilder {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get formBuilderClass() { return RootFormBuilder }
	formBuilderDuzenle(e) {
		e = e ?? {};
		e = $.extend({}, e);
		let builder = e.rootBuilder ?? e.builder;
		for (const key of ['inst', 'layout']) {
			const value = this[key];
			if (value !== undefined)
				builder[key] = value
		}
		if (e.rootBuilder && e.rootBuilder != e.builder)
			builder = this.builder = e.builder
		super.formBuilderDuzenle(e)
	}
}
class ParamBuilderAlt extends ParamBuilder {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get altSeviyemi() { return true }
}
class ParamBuilder_AltInst extends ParamBuilderAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get altInstmi() { return true } get defaultNewInst() { return undefined }
	get newInst() {
		const {instBuilder} = this; let result;
		if (instBuilder != null) { if (isFunction(instBuilder)) { const _e = { paramci: this, inst() { return this.paramci.inst } }; result = getFuncValue.call(this, instBuilder, _e) } else { result = instBuilder } }
		if (result === undefined) { result = this.defaultNewInst }
		return result
	}
	get defaultAltInst() {
		let {inst} = this, result = inst; if (inst) {
			const {id} = this; result = inst[id];
			if (result == null) {
				const {newInst} = this;
				if (newInst != null) { result = inst[id] = newInst }
			}
		}
		return result
	}
	constructor(e) { e = e ?? {}; super(e); this.instBuilder = e.instBuilder ?? e.newInst }
	setInstBuilder(handler) { this.instBuilder = handler; return this } setNewInst(handler) { return this.setInstBuilder(handler) }
}
class ParamBuilder_AltObject extends ParamBuilder_AltInst { get altObjectmi() { return true } get defaultNewInst() { return {} } }
class ParamBuilder_AltArray extends ParamBuilder_AltInst { get altArraymi() { return true } get defaultNewInst() { return [] } }
class ParamBuilder_Kullanim extends ParamBuilder_AltObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get kullanimmi() { return true } get defaultId() { return 'kullanim' }
}
class ParamBuilder_UIElement extends ParamBuilderAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get uiElementmi() { return true }
	degisince(handler) { this.fbdEkIslem(e => e.builder.degisince(handler)); return this }
	onChange(handler) { this.fbdEkIslem(e => e.builder.onChange(handler)); return this }
}
class ParamBuilder_Form extends ParamBuilder_UIElement {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get formmu() { return true }
	formBuilderDuzenleInternal(e) {
		super.formBuilderDuzenleInternal(e);
		const {builder} = e, {layout} = this;
		e.builder = this.builder = builder.addForm(this.id, layout)
	}
	super_formBuilderDuzenleInternal(e) { super.formBuilderDuzenleInternal(e) }
}
class ParamBuilder_FormWithParent extends ParamBuilder_Form {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get formmu() { return true }
	formBuilderDuzenleInternal(e) {
		super.super_formBuilderDuzenleInternal(e);
		const {builder} = e, {etiket} = this;
		if (etiket != null)
			builder.addLabel({ etiket })
		e.builder = this.builder = builder.addFormWithParent(this.id).yanYana()
	}
}
class ParamBuilder_TabPage extends ParamBuilder_UIElement {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get tabPagemi() { return true }
	formBuilderDuzenleInternal(e) {
		super.formBuilderDuzenleInternal(e); const {builder} = e, {id} = this;
		if (id) {
			const {tabPanel} = e; const {id2Builder} = tabPanel;
			let target = id2Builder[id];
			if (!target) {
				let {etiket} = this;
				if (isFunction(etiket))
					etiket = getFuncValue.call(this, etiket, e)
				target = tabPanel.addTab(id, etiket);
				id2Builder[id] = target
			}
			e.builder = this.builder = target
		}
	}
}
class ParamBuilder_Grup extends ParamBuilder_UIElement {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get grupmu() { return true }
	formBuilderDuzenleInternal(e) {
		super.formBuilderDuzenleInternal(e);
		let {builder} = e, {etiket} = this;
		builder = e.builder = this.builder = builder.addFormWithParent().altAlta().addStyle_wh('var(--full) !important');
		if (etiket != null)
			builder.addBaslik(this.id, etiket)
	}
}
class ParamBuilder_CheckBox extends ParamBuilder_UIElement {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	formBuilderDuzenleInternal(e) {
		super.formBuilderDuzenleInternal(e);
		const {id, etiket, value} = this;
		this.builder = e.builder.addCheckBox({ id, etiket, value })
	}
	bit() { this.bitFlag = true; return this }
	text() { this.bitFlag = false; return this }
	bool() { this.bitFlag = null; return this }
	super_formBuilderDuzenleInternal(e) { super.formBuilderDuzenleInternal(e) }
	convertedValue_hostVars(value) {
		value = asBool(super.convertedValueInternal(value));
		const {bitFlag} = this;
		if (bitFlag != null)
			value = bitFlag ? bool2Int(value) :  bool2FileStr(value)
		return value
	}
	convertedValue_setValues(value) { return asBoolQ(super.convertedValueInternal(value)) }
}
class ParamBuilder_SwitchButton extends ParamBuilder_CheckBox {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	formBuilderDuzenleInternal(e) {
		super.formBuilderDuzenleInternal(e);
		const {id, etiket, value} = this;
		this.builder = e.builder.addSwitchButton({ id, etiket, value })
	}
}
class ParamBuilder_Button extends ParamBuilder_UIElement {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e ?? {}; super(e);
		this.handler = e.handler ?? e.onClick ?? e.onClickEvent
	}
	formBuilderDuzenleInternal(e) {
		super.formBuilderDuzenleInternal(e);
		const {id, etiket, value, handler} = this;
		this.builder = e.builder.addButton({ id, etiket, value, handler })
	}
	setHandler(handler) { this.handler = handler; return this }
	onClickEvent(handler) { return this.setHandler(handler) }
	click(handler) { return this.setHandler(handler) }
	tiklayinca(handler) { return this.setHandler(handler) }
}
class ParamBuilder_Info extends ParamBuilder_UIElement {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e ?? {}; super(e);
		this.section = e.section; this.modulAdi = e.modulAdi ?? e.modul
	}
	formBuilderDuzenleInternal(e) {
		super.formBuilderDuzenleInternal(e);
		const {section, modulAdi} = this;
		this.builder = e.builder.addButton({ id: 'info', etiket: '', value: 'i', handler: e => this.infoIstendi(e) })
			.onBuildEk(e => { const {input} = e.builder; input.attr('title', section) })
			.addStyle(
				e => `$elementCSS { width: 32px !important; height: 32px !important; min-width: unset !important; padding-top: 0 }`,
				e => `$elementCSS > button { font-weight: bold }`,
				e => `$elementCSS > button.jqx-fill-state-normal { color: whitesmoke; background-color: royalblue }`
			)
	}
	async infoIstendi(e) {
		e = e ?? {}; const target = $(e.event?.currentTarget);
		if (target?.length) setButonEnabled(target, false);
		try {
			const section = e.secton ?? this.section, modulAdi = (e.modulAdi ?? e.modul ?? this.modulAdi) || 'PSatis'; if (!section) { console.warn('yardım göster', '(section) belirsiz'); return }
			let data = await app.wsYardimIcerik({ section, modulAdi }); if (!data) { console.warn('yardım göster', section, 'için yardım verisi boş geldi'); return }
			data = `<div class="full-wh">${data}</div>`;
			createJQXWindow({
				title: `<span class="bold lightgray">${section}</span> Yardım`, content: $(data),
				buttons: { TAMAM: e => e.close() },
				args: { isModal: false, width: '80%', height: '80%', position: 'center', closeButtonAction: 'destroy', showCloseButton: true, showCollapseButton: true }
			})
		}
		finally { if (target.length) setTimeout(() => setButonEnabled(target, true), 200) }
	}
}
class ParamBuilder_TextInput extends ParamBuilder_UIElement {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e ?? {}; super(e);
		this.maxLength = e.maxLength
	}
	formBuilderDuzenleInternal(e) {
		super.formBuilderDuzenleInternal(e);
		const {id, etiket, value, maxLength} = this;
		this.builder = e.builder.addTextInput({ id, etiket, value, maxLength })
	}
	super_formBuilderDuzenleInternal(e) { super.formBuilderDuzenleInternal(e) }
	convertedValueInternal(value) {
		value = super.convertedValueInternal(value);
		if (typeof value == 'string')
			value = value.trimEnd()
		return value
	}
}
class ParamBuilder_PassInput extends ParamBuilder_TextInput {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	formBuilderDuzenleInternal(e) {
		super.super_formBuilderDuzenleInternal(e);
		const {id, etiket, value, maxLength} = this;
		this.builder = e.builder.addPassInput({ id, etiket, value, maxLength })
	}
}
class ParamBuilder_TextArea extends ParamBuilder_TextInput {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { e = e ?? {}; super(e); this.rowCount = e.rowCount }
	formBuilderDuzenleInternal(e) {
		super.super_formBuilderDuzenleInternal(e); const {id, etiket, value, maxLength, rowCount} = this;
		this.builder = e.builder.addTextArea({ id, etiket, value, maxLength, rowCount })
	}
	convertedValueInternal(value) { return asFloat(super.convertedValueInternal(value)) }
	setRowCount(value) { this.rowCount = value; return this }
}
class ParamBuilder_NumberInput extends ParamBuilder_TextInput {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e ?? {}; super(e);
		$.extend(this, { min: e.min, max: e.max, step: e.step })
	}
	formBuilderDuzenleInternal(e) {
		super.super_formBuilderDuzenleInternal(e);
		const {id, etiket, value, maxLength, min, max, step} = this;
		this.builder = e.builder.addNumberInput({ id, etiket, value, maxLength, min, max, step })
	}
	convertedValueInternal(value) { return asFloat(super.convertedValueInternal(value)) }
	setMin(value) { this.min = value; return this }
	setMax(value) { this.max = value; return this }
	setStep(value) { this.step = value; return this }
}
class ParamBuilder_DateInput extends ParamBuilder_UIElement {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	formBuilderDuzenleInternal(e) {
		super.formBuilderDuzenleInternal(e);
		this.builder = e.builder.addDateInput(this.id, this.etiket, this.value)
	}
	convertedValueInternal(value) { return asDate(super.convertedValueInternal(value)) }
}
class ParamBuilder_ModelKullan extends ParamBuilder_UIElement {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e ?? {}; super(e);
		$.extend(this, {
			mfSinif: e.mfSinif, source: e.source, ozelQueryDuzenle: e.ozelQueryDuzenle,
			veriYuklenince: e.veriYuklenince, kodAttr: e.kodAttr, adiAttr: e.adiAttr
		})
	}
	formBuilderDuzenleInternal(e) {
		super.formBuilderDuzenleInternal(e);
		const {id, etiket, value, mfSinif, source, ozelQueryDuzenle, veriYuklenince, kodAttr, adiAttr} = this
		this.builder = e.builder.addModelKullan({ id, etiket, value, mfSinif, source, ozelQueryDuzenle, veriYuklenince, kodAttr, adiAttr })
	}
	convertedValue_hostVars(value) {
		value = super.convertedValue_hostVars(value);
		if (value?.char !== undefined)
			value = value.char
		return value
	}
	dropDown() { this.fbdEkIslem(e => e.builder.dropDown()); return this } comboBox() { this.fbdEkIslem(e => e.builder.comboBox()); return this }
	kodlu() { this.fbdEkIslem(e => e.builder.kodlu()); return this } kodsuz() { this.fbdEkIslem(e => e.builder.kodsuz()); return this }
	tekli() { this.fbdEkIslem(e => e.builder.tekil()); return this } tekil() { this.fbdEkIslem(e => e.builder.tekil()); return this } coklu() { this.fbdEkIslem(e => e.builder.coklu()); return this }
	autoBind() { this.fbdEkIslem(e => e.builder.autoBind()); return this } noAutoBind() { this.fbdEkIslem(e => e.builder.noAutoBind()); return this }
	listedenSecilmez() { this.fbdEkIslem(e => e.builder.listedenSecilmez()); return this } listedenSecilir() { this.fbdEkIslem(e => e.builder.listedenSecilir()); return this }
	noMF() { this.fbdEkIslem(e => e.builder.noMF()); return this }  setMFSinif(value) { this.mfSinif = value; return this } setSource(value) { this.source = value; return this }
	ozelQueryDuzenleIslemi(handler) { this.ozelQueryDuzenle = handler; return this } veriYukleninceIslemi(handler) { this.veriYuklenince = handler; return this } onBindingComplete(value) { return this.veriYukleninceIslemi(value) }
	setKodAttr(value) { this.kodAttr = value; return this } setAdiAttr(value) { this.adiAttr = value; return this }
}
class ParamBuilder_TekSecim extends ParamBuilder_ModelKullan {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get value() { let result = super.value; /*if (result && result.char !== undefined) result = result.char*/ return result }
	set value(value) {
		const {altInst, id} = this; if (altInst == null) { return }
		let tSec = altInst[id]; if (typeof tSec != 'object') {
			let {source} = this; if (source != null) {
				if ($.isArray(source)) { source = new TekSecim({ kaListe: source })} else if (source.kaListe == null) { source = null }
				if (source != null) { tSec = altInst[id] = new source() }
			}
		}
		if (tSec != null) { tSec.char = this.convertedValue_setValues(value) }
	}
	constructor(e) {
		e = e ?? {}; super(e); this.noMF();
		this.tekSecim = e.tekSecim?.instance ?? e.tekSecim;
		if (this.source == null) { this.setKAListe(e.kaListe) }
		this.dropDown()
	}
	preBuild(e) {
		super.preBuild(e); const {altInst} = this;
		if (altInst) {
			const {id} =  this; let value = altInst[id];
			if (!value?.tekSecimmi) { const {tekSecim} = this; if (tekSecim) { value = altInst[id] = new tekSecim.class({ char: value }) } }
		}
	}
	paramSetValues(e) { const {rec} = e; super.paramSetValues(e) }
	setTekSecim(value) {
		value = value?.instance ?? value; this.tekSecim = value;
		if (value != null && this.source == null) { this.source = e => value.kaListe } return this
	}
	setKAListe(value) {
		value = value?.instance ?? value; value = value?.kaListe ?? value;
		value = value ?? this.tekSecim?.kaListe; if (value != null) { this.source = e => value } return this
	}
}
class ParamBuilder_Grid extends ParamBuilder_UIElement {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e ?? {}; super(e);
		$.extend(this, {
			mfSinif: e.mfSinif, source: e.source, tabloKolonlari: e.tabloKolonlari, sabitmi: e.sabitmi, kontrolcu: e.kontrolcu,
			ozelQueryDuzenle: e.ozelQueryDuzenle, veriYuklenince: e.veriYuklenince, veriDegisince: e.veriDegisince, kodAttr: e.kodAttr, adiAttr: e.adiAttr
		})
	}
	formBuilderDuzenleInternal(e) {
		super.formBuilderDuzenleInternal(e);
		const {id, etiket, value, gridSinif, mfSinif, source, tabloKolonlari, sabitmi, kontrolcu, ozelQueryDuzenle, veriYuklenince, veriDegisince, kodAttr, adiAttr, rowNumberOlmasinFlag} = this
		this.builder = e.builder.addGrid({ id, etiket, value, gridSinif, mfSinif, source, tabloKolonlari, sabitmi, kontrolcu, ozelQueryDuzenle, veriYuklenince, veriDegisince, kodAttr, adiAttr, rowNumberOlmasinFlag })
	}
	gridliGiris() { this.fbdEkIslem(e => e.builder.gridliGiris()); return this }
	gridliGosterici() { this.fbdEkIslem(e => e.builder.gridliGosterici()); return this }
	masterListe() { this.fbdEkIslem(e => e.builder.masterListe()); return this }
	fisListe() { this.fbdEkIslem(e => e.builder.fisListe()); return this }
	rowNumberOlsun() { this.fbdEkIslem(e => e.builder.rowNumberOlsun()); return this }
	rowNumberOlmasin() { this.fbdEkIslem(e => e.builder.rowNumberOlmasin()); return this }
	setMFSinif(value) { this.mfSinif = value; return this }
	setTabloKolonlari(value) { this.tabloKolonlari = value; return this }
	setSource(value) { this.source = value; return this }
	setSabitmi(value) { this.sabitmi = value; return this }
	sabit() { return this.setSabitmi(true) }
	autoGrow() { return this.setSabitmi(false) }
	ozelQueryDuzenleIslemi(handler) { this.ozelQueryDuzenle = handler; return this }
	veriDegisinceIslemi(handler) { this.veriDegisince = handler; return this }
	veriDegisinceBlock(handler) { return this.veriDegisinceIslemi(handler) }
	veriYukleninceIslemi(handler) { this.veriYuklenince = handler; return this }
	onBindingComplete(value) { return this.veriYukleninceIslemi(value) }
	kodAttr(value) { this.kodAttr = value; return this }
	adiAttr(value) { this.adiAttr = value; return this }
}
