class ModelTanimPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get slowAnimationFlag() { return true }
	static get rootPartName() { return 'modelTanim' } static get partName() { return this.rootPartName }
	static get asyncRunFlag() { return true } static get isWindowPart() { return true }
	static get formDeferMS() { return 30 }
	// get wndDefaultIsModal() { return true }
	get defaultLayoutSelector() { const {rootPartName} = this.class; return `#${rootPartName}` }
	get formLayoutSelector() { const {partName, rootPartName} = this.class; return partName == rootPartName ? null : `#${partName}.form-layout` }
	get altFormLayoutSelector() { return '.altform-layout' }
	get hasTabPages() { return this._hasTabPages }
	set hasTabPages(value) { this._hasTabPages = value }
	get currentTabPageIndex() { const {tabPanelWidget} = this; return tabPanelWidget ? tabPanelWidget.selectedItem : null }
	get currentTabPage() {
		const {currentTabPageIndex, tabPanelWidget} = this;
		return currentTabPageIndex == null || currentTabPageIndex < 0 ? null : tabPanelWidget.getContentAt(currentTabPageIndex)
	}
	get currentTabPageId() { return this.getCurrentTabPageId() }
	getCurrentTabPageId(e) {
		e = e || {}; let {tabID} = e;
		if (!tabID) { const {currentTabPage} = this; tabID = currentTabPage == null ? null : currentTabPage.id } return tabID
	}
	get currentAltFormParts() { return this.getCurrentAltFormParts() }
	getCurrentAltFormParts(e) { e = e || {}; const tabID = this.getCurrentTabPageId(e); return tabID ? this.tabID2AltFormParts[tabID] : this.genelAltFormParts }
	get builder() {
		let result = this._builder;
		if (result && $.isFunction(result)) {
			const _e = { sender: this, commitFlag: false, commit() { this.commitFlag = true; return this }, temp() { this.commitFlag = false; return this } };
			result = getFuncValue.call(this, result, _e);
			if (_e.commitFlag) this._builder = result
		}
		return result
	}
	set builder(value) { this._builder = value }
	get yenimi() { return this.islem == 'yeni' } get degistirmi() { return this.islem == 'degistir' }
	get silmi() { return this.islem == 'sil' } get izlemi() { return this.islem == 'izle' }
	get kopyami() { return this.islem == 'kopya' } get yeniVeyaKopyami() { return this.yenimi || this.kopyami } 

	constructor(e) {
		e = e || {}; super(e); const args = e.args || {}; $.extend(this, {
			_title: e._title, islem: e.islem, mfSinif: e.mfSinif, inst: e.inst, eskiInst: e.eskiInst,
			_builder: e.builder, _hasTabPages: false, kaydetIslemi: e.kaydetIslemi, kaydedince: e.kaydedince,
			...args, genelAltFormParts: e.genelAltFormParts || {}, tabID2AltFormParts: e.tabID2AltFormParts || {}, initTabIDSet: {}
		});
		let {mfSinif, inst, eskiInst} = this;
		if (!inst && mfSinif) inst = this.inst = new mfSinif(); if (inst && !mfSinif) mfSinif = this.mfSinif = inst.class
		if (inst && !eskiInst && this.degistirmi) eskiInst = this.eskiInst = inst.deepCopy()
		this.title = this.title || `${mfSinif?.sinifAdi || 'Model'} Tanım`;
		const {islem} = this; if (islem) { const islemText = islem[0].toUpperCase() + islem.slice(1); this.title += ` &nbsp;[<span class="window-title-ek">${islemText}</span>]` }
	}
	async init(e) { await super.init(e); this.initDevam(e); await this.initFormBuilder(e); if (this.builder) { await this.initDevam(e) } }
	async initDevam(e) {
		const mfSinif = this.mfSinif ?? this?.inst?.class, {rootPartName, partName} = this.class, {layout, hasTabPages, formLayoutSelector} = this;
		if (mfSinif) { layout.addClass(mfSinif.dataKey || mfSinif.classKey) }
		layout.addClass(`${partName} ${rootPartName}`); this.header = layout.find('.header'); let form = this.form = this.formParent = layout.find('.form');
		if (formLayoutSelector) {
			const formLayout = this.getLayout({ selector: formLayoutSelector });
			if (formLayout?.length) { formLayout.appendTo(form); form = this.form = formLayout }
		}
		form.addClass(`${partName} form-layout`);
		if (hasTabPages) { layout.addClass('with-tabs'); this.tabPanel = form.find('#tabPanel') }
		await this.inst?.uiGirisOncesiIslemler(e)
	}
	runDevam(e) {
		e = e || {}; super.runDevam(e);
		this.initBulForm(e); this.initIslemTuslari(e); this.initLayoutOncesi(e);
		this.initLayout(e); this.initLayoutSonrasi(e);
	}
	afterRun(e) {
		e = e || {}; super.afterRun(e);
		if (this.hasTabPages) {
			const {rootPartName} = this.class; const elms = [this.wnd, this.wndContent];
			for (const elm of elms) { elm?.addClass(`${rootPartName} with-tabs`) } this.initTabPages(e)
		}
		if (this.yeniVeyaKopyami) { this.yeniTanimOncesiIslemler(e) } /* setTimeout(() => this.wnd?.trigger('resize'), 0) */
	}
	async initFormBuilder(e) {
		try {
			let {builder} = this; let {inst} = this; if (!builder && inst) { const _e = { sender: this }; builder = (await inst.getRootFormBuilder(_e)) ?? (await inst.getFormBuilders(_e)) } if ($.isEmptyObject(builder)) { return }
			const {layout} = this, subBuilders = builder.isFormBuilder ? [builder] : builder, id2Builder = this.id2Builder = {};
			for (const key in subBuilders) {
				const builder = subBuilders[key]; if (!builder) { continue }
				let _parent = builder.parent; builder.part = this;
				if (builder.isRootFormBuilder) { this.builder = builder; let _layout = builder.layout; if (!(_parent?.length || _layout?.length)) { _layout = builder.layout = layout } } else if (!_parent?.length) { _parent = builder.parent = layout }
				let _id = builder.id; if (!_id) { _id = builder.id = builder.newElementId(); } if (_id) { id2Builder[_id] = builder }
				builder.noAutoInitLayout(); builder.run()
			}
		}
		catch (ex) { console.error(ex); throw ex }
	}
	initBulForm(e) {
		const {header, form, mfSinif} = this, bulForm = header.find('.bulForm');
		if (!mfSinif || mfSinif.bulFormKullanilirmi) {
			const bulPart = this.bulPart = new FiltreFormPart({ layout: bulForm, degisince: e => FiltreFormPart.hizliBulIslemi({ sender: this, layout: form, tokens: e.tokens }) });
			bulPart.run()
		}
		else { bulForm.addClass('jqx-hidden') }
	}
	initIslemTuslari(e) {
		const {header} = this, islemTuslari = this.islemTuslari = header.find(`.islemTuslari`);
		let _e = { args: { sender: this, layout: islemTuslari, butonlarDuzenleyici: e => this.islemTuslariDuzenle(e) } }; if (this.islemTuslariArgsDuzenle(_e) === false) { return null }
		const islemTuslariPart = this.islemTuslariPart = new ButonlarPart(_e.args); islemTuslariPart.run(); return islemTuslariPart
	}
	initTabPages(e) {
		const _e = { sender: this, args: {} }; this.initTabPagesArgsDuzenle(_e);
		const tabPanel = c = this.tabPanel.jqxTabs(_e.args); this.tabPanelWidget = tabPanel.jqxTabs('getInstance')
	}
	initLayoutOncesi(e) {
		e = e || {}; e.sender = this;
		const altFormLayoutSelector = `${this.altFormLayoutSelector}[data-notabs]`;
		const result = this.altFormPartsOlustur({ selector: altFormLayoutSelector, target: this.genelAltFormParts, layout: this.form });
		const altLayoutParts = result?.parts; e.altLayoutParts = altLayoutParts
		if (altLayoutParts) {
			for (const part of altLayoutParts) part.initLayoutOncesi(e)
			for (const part of altLayoutParts) part.initLayout(e)
		}
		for (const builder of this.getBuilders(e)) { if (builder.initLayoutOncesi) builder.initLayoutOncesi(e) }
	}
	initLayout(e) {
		e = e || {}; e.sender = this; const {id2FormBuilder} = this; let waitMS = 0;
		for (const builder of this.getBuilders(e)) { setTimeout(e => { e.builder = builder; if (builder.initLayout) builder.initLayout(e) }, waitMS, e); waitMS += 3 }
	}
	initLayoutSonrasi(e) {
		e = e || {}; e.sender = this;
		const {altLayoutParts} = e; if (altLayoutParts) { for (const part of altLayoutParts) part.initLayoutSonrasi(e) } delete e.altLayoutParts;
		for (const builder of this.getBuilders(e)) {
			e.builder = builder;
			if (builder.initLayoutSonrasi) builder.initLayoutSonrasi(e)
		}
		this.formGenelEventleriBagla(e);
		setTimeout(() => { this.formFocusIslemi(e); this.formShowIslemi(e) }, this.formDeferMS ?? 0)
	}
	initTabLayoutOncesi(e) {
		const {tabPage, tabID} = e, {form, altFormLayoutSelector} = this;
		const result = this.altFormPartsOlustur({
			selector: altFormLayoutSelector, target: () => this.tabID2AltFormParts[tabID] = this.tabID2AltFormParts[tabID] || {},
			layout: tabPage, tabID: tabID
		});
		const altLayoutParts = result?.parts; e.altLayoutParts = altLayoutParts;
		if (altLayoutParts) {
			for (const part of altLayoutParts) part.initLayoutOncesi(e)
			for (const part of altLayoutParts) part.initLayout(e)
		}
		for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.initTabLayoutOncesi) builder.initTabLayoutOncesi(e) }
	}
	initTabLayout(e) { e = e || {}; for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.initTabLayout) builder.initTabLayout(e) } }
	initTabLayoutSonrasi(e) {
		e = e || {};
		for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.initTabLayoutSonrasi) builder.initTabLayoutSonrasi(e) }
		const {altLayoutParts} = e; if (altLayoutParts) { for (const part of altLayoutParts) part.initLayoutSonrasi(e) } delete e.altLayoutParts
	}
	async yeniTanimOncesiIslemler(e) {
		e = e || {}; e.sender = this;
		for (const _e of this.getAltFormParts()) { await _e.part?.yeniTanimOncesiIslemler?.(e) }
		for (const builder of this.getBuilders(e)) { e.builder = builder; await builder?.yeniTanimOncesiIslemler?.(e) }
		let {mfSinif, inst, eskiInst, islem} = this; if (this.yeniVeyaKopyami) { await inst.yeniTanimOncesiIslemler({ ...e, mfSinif, inst, eskiInst, islem }) }
	}
	formGenelEventleriBagla(e) {
		e = e || {}; e.sender = this;
		for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.formGenelEventleriBagla) builder.formGenelEventleriBagla(e) }
		const inputs = this.form.find('input[type=textbox], input[type=text], input[type=number]');
		if (inputs.length) { inputs.on('focus', evt => evt.target.select()) }
	}
	formFocusIslemi(e) {
		e = e || {}; e.sender = this;
		let abortFlag = false;
		for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.formFocusIslemi) { if (builder.formFocusIslemi(e)) { abortFlag = true; break } } }
		if (!abortFlag) { const elm = this.form.children('input:eq(0)'); if (elm.length) elm.focus() }
	}
	formShowIslemi(e) {
		e = e || {}; e.sender = this;
		let abortFlag = false; const {id2FormBuilder} = this;
		for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.formShowIslemi) { if (builder.formShowIslemi(e)) { abortFlag = true; break } } }
		if (!abortFlag) this.show()
	}
	initWndArgsDuzenle(e) {
		super.initWndArgsDuzenle(e); const {wndArgs} = this; const _e = $.extend({}, e, { sender: this, wndArgs });
		/*$.extend(wndArgs, { width: '99.5%', height: '98.8%' });*/
		for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.initWndArgsDuzenle) builder.initWndArgsDuzenle(_e) }
	}
	islemTuslariArgsDuzenle(e) {
		const {args} = e; e.sender = this;
		$.extend(args, { tip: this.izlemi ? 'vazgec' : 'tamamVazgec', id2Handler: { tamam: e => this.kaydetIstendi(e), vazgec: e => this.vazgecIstendi(e) } });
		for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.islemTuslariArgsDuzenle) { builder.islemTuslariArgsDuzenle(e) } }
	}
	islemTuslariDuzenle(e) {
		let {args, liste} = e, yListe = [];
		for (let item of liste) {
			let {id} = item; switch (id) {
				case 'tamam':
					if (this.izlemi) { continue }
					if (this.silmi) { item.id = 'sil' }
					break
			}
			yListe.push(item)
		}
		e.liste = yListe
	}
	initTabPagesArgsDuzenle(e) {
		const {args} = e, {wnd} = this;
		$.extend(e, { sender: this, wnd });
		$.extend(args, {
			theme: theme, position: 'top', /* width: 1, */ height: 'auto',
			initTabContent: tabIndex => {
				const {form, initTabIDSet} = this;
				const tabPage = form.find(`.jqx-tabs-content > .jqx-tabs-content-element:eq(${tabIndex})`), tabID = tabPage.prop('id');
				if (initTabIDSet[tabID]) return
				const _e = $.extend({}, e || {}, { sender: this, tabIndex, tabPage, tabID });
				this.initTabLayoutOncesi(_e); this.initTabLayout(_e); this.initTabLayoutSonrasi(_e); initTabIDSet[tabID] = true
			}
		});
		for (const builder of this.getBuilders(e)) { if (builder.initTabPagesArgsDuzenle) builder.initTabPagesArgsDuzenle(e) }
	}
	altFormPartsOlustur(e) {
		const {selector, layout} = e; if (!selector) return false
		const newParts = [], altFormlar = layout.find(selector);
		if (altFormlar.length) {
			const {args, tabID} = e, {form} = this;
			for (let i = 0; i < altFormlar.length; i++) {
				const altForm = altFormlar.eq(i); let altFormPartClass = altForm.data('class'); if (typeof altFormPartClass == 'string') altFormPartClass = eval(altFormPartClass);
				let id = altForm.prop('id');
				if (!id && altFormPartClass) id = altFormPartClass.partName
				if (id) altForm.prop('id', id)
				const target = getFuncValue.call(this, e.target, e);
				if (id && target) { const part = target[id]; if (part && part.initFlag && !part.isDestroyed) continue }
				const _e = $.extend({}, args || {}, { parentPart: this, parentContent: form, parentLayout: layout, layout: altForm, abID, altFormID: id, altFormPartClass });
				this.altFormPart_argsDuzenle(_e);
				const altFormPart = _e.part = new altFormPartClass(_e);
				const onCreateBlock = _e.onCreate; if (onCreateBlock) getFuncValue.call(this, onCreateBlock, _e)
				if (!id) {
					if (altFormPart) id = altFormPart.class.partName; if (!id) id = newGUID()
					altForm.prop('id', id);
				}
				_e.target = target; if (target) target[id] = altFormPart
				altFormPart.run(); newParts.push(altFormPart);
				const onInitBlock = _e.onInit; if (onInitBlock) getFuncValue.call(this, onInitBlock, _e)
			}
		}
		return { parts: newParts, layouts: altFormlar }
	}
	altFormPart_argsDuzenle(e) { }
	async kaydetIstendi(e) {
		e = e || {}; e.sender = this; const {inst, eskiInst, mfSinif} = this; let result;
		try {
			for (const builder of this.getBuilders(e)) {
				if (builder.kaydetIstendi) {
					e.builder = builder; const _result = builder.kaydetIstendi(e);
					if (_result === false) return false; if (result?.isError) throw result
				}
			}
			let result = await this.kaydetOncesiIslemler(e); if (result === false) { return result }
			if (result == null) {
				if (this.yeniVeyaKopyami) { result = await inst.yaz() }
				else if (this.degistirmi) { result = await inst.degistir(eskiInst) }
				else if (this.silmi) { result = await inst.sil() }
				if (!result || result.isError) { return false }
			}
			await this.kaydetSonrasiIslemler(e);
			const {kaydedince} = this; if (kaydedince) { const _e = $.extend({}, e, { sender: this, mfSinif, inst, eskiInst, result }); getFuncValue.call(this, kaydedince, _e) }
		}
		catch (ex) { console.error(ex); const error = getErrorText(ex); if (error) hConfirm(error, `${mfSinif.sinifAdi || 'Tanım'} Kaydet İşlemi`); return false }
		this.kaydetCalistimi = true; this.destroyPart()
	}
	async kaydetOncesiIslemler(e) {
		e = e || {}; const {builder, gridPart, islem, inst, eskiInst} = this; e.sender = this;
		for (const _e of this.getAltFormParts()) await _e.part.kaydetOncesiIslemler(e)
		for (const builder of this.getBuilders(e)) {
			e.builder = builder;
			if (builder.kaydetOncesiIslemler) { await builder.kaydetOncesiIslemler(e) }
		}
		const _e = $.extend({}, e, { sender: this, builder, gridPart, islem, inst, eskiInst });
		let result = await this.inst.uiKaydetOncesiIslemler(_e); if (typeof result == 'boolean') { return result }
		for (const key of ['inst', 'eskiInst']) { const value = _e[key]; if (value !== undefined) this[key] = e[key] = value }
		const {kaydetIslemi} = this; if (kaydetIslemi) { _e.result = result; result = await getFuncValue.call(this, kaydetIslemi, _e) }
		if (result != null) { return result }
	}
	async kaydetSonrasiIslemler(e) {
		e = e || {}; e.sender = this;
		for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.kaydetSonrasiIslemler) { await builder.kaydetSonrasiIslemler(e) } }
		for (const _e of this.getAltFormParts()) { await _e.part.kaydetSonrasiIslemler(e) }
	}
	destroyPart(e) {
		e = e || {}; for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.destroyPart) builder.destroyPart(e) }
		super.destroyPart(e)
	}
	async vazgecIstendi(e) {
		e = e || {};
		if (!this.kaydetCalistimi) {
			e.sender = this;
			for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.vazgecIstendi) await builder.vazgecIstendi(e) }
		}
		await super.vazgecIstendi(e)
	}
	onResize(e) {
		super.onResize(e)
		/*if (this.hasTabPages && e.fromWnd) {
			const {wnd, tabPanel} = this; if (!wnd?.length) return
			const prevElm = tabPanel.prev(); let {timer_tabsResize} = this; if (timer_tabsResize) clearTimeout(timer_tabsResize);
			timer_tabsResize = this.timer_tabsResize = setTimeout(() => {
				try {
					const prevElm = tabPanel.prev();
					tabPanel.jqxTabs({ width: wnd.width() - 23, height: Math.max(wnd.height() - (prevElm.length ? prevElm.height() : 0) - 160, 0) })
				}
				finally { delete this.timer_tabsResize }
			}, 10)
		}*/
	}
	*getAltFormParts(e) {
		e = e || {}; const filter = e.filter ? asSet(typeof e.filter == 'object' ? e.filter : [e.filter]) : null;
		const {genelAltFormParts, tabID2AltFormParts} = this;
		if (genelAltFormParts && (!filter || (filter.genel || filter.noTabs || filter.noTab))) {
			for (const id in genelAltFormParts) { yield { id, part: genelAltFormParts[id] } }
		}
		if (tabID2AltFormParts && (!filter || (filter.tabs || filter.tab))) {
			for (const [tabID, altFormParts] of Object.entries(tabID2AltFormParts))
			for (const id in altFormParts) yield { id, part: altFormParts[id], tabID }
		}
	}
	*getBuilders(e) {
		const {id2Builder} = this; if (id2Builder) {
			for (const builder of Object.values(id2Builder))
			for (const subBuilder of builder.getBuildersWithSelf()) { yield subBuilder }
		}
	}
	setKaydetIslemi(value) { this.kaydetIslemi = value; return this } setKaydedince(value) { this.kaydedince = value; return this }
	veriYuklenince(handler) { this.bindingCompleteBlock = handler; return this }
}


/*
const uygunlar = [];
const parentSelector = `.formBuilder-element.parent`;
const elms = app.activeWndPart.layout.find(parentSelector);
for (let i = 0; i < elms.length; i++) {
	const elm = elms.eq(i);
	if (elm.find(parentSelector).length)
		continue
	const label = elm.children('label');
	const uygunmu = (label.length && label.html().includes('KDV'));
	elm[uygunmu ? 'addClass' : 'removeClass']('find-include');
	elm[uygunmu ? 'removeClass' : 'addClass']('find-exclude');
	if (uygunmu)
		uygunlar.push(elm)
}
if (!uygunlar.length)
	elms.removeClass('find-incldue find-exclude')
uygunlar.length
*/
