class FBuilder_TanimForm extends FormBuilder {
    static { window[this.name] = this; this._key2Class[this.name] = this } get isTanimForm() { return true }
	preInit(e) {
		super.preInit(e); const {rootPart} = this, {formParent} = rootPart;
		let {form} = rootPart; if (!form?.length || (form.parent() != formParent)) { form = rootPart.form = $(`<div class="form-layout dock-bottom"/>`); form.appendTo(formParent) }
		let {layout} = this; if (!layout.length) { layout = this.layout = form }
		parent = this.parent = layout.parent();
		/*if (parent != form) this.parent = form;*/
	}
}
class FBuilder_TabsOrtak extends FormBuilder {
    static { window[this.name] = this; this._key2Class[this.name] = this } get isTabs() { return true }
	constructor(e) { e = e || {}; super(e); this.tabPages = e.tabPages || {}; }
	buildDevam(e) { super.buildDevam(e); const layout = this.layout = $(`<div class="tabPanel dock-bottom"><ul class="tabs"/></div>`); layout.appendTo(this.parent) }
	postBuild(e) {
		super.postBuild(e);
		const {layout, builders} = this, ulTabs = layout.children('.tabs'), tabPages = {};
		for (const key in builders) {
			const builder = builders[key], {id} = builder; if (!builder.isTabPage || tabPages[id]) { continue }
			tabPages[id] = builder; let subParent = builder.parent, subParentParent = subParent?.length ? subParent.parent() : null;
			if (!subParentParent?.length && subParentParent == layout) {
				subParentParent = layout; if (subParent && subParent.length) { subParent.detach() } else { subParent = builder.parent = $(`<div id="${builder.tabID}" class="content"/>`) } subParent.appendTo(subParentParent);
				let subLayout = builder.layout; if (!subLayout?.length && subLayout.parent() == subParent) {
					if (subLayout && subLayout.length) { subLayout.detach() } else { subLayout = builder.layout = $(`<div/>`) }
					subLayout.appendTo(subParent);
				}
			}
		}
		const _tabPages = this.tabPages; for (const key in _tabPages) { const tabPage = _tabPages[key], id = tabPage.id || key; if (!tabPages[id]) { tabPages[id] = tabPage } }
		for (const id in tabPages) {
			const tabPage = tabPages[id], {text} = tabPage; $(`<li id="${id}" class="tabPage"><div class="header">${text}</div></li>`).appendTo(ulTabs);
			let tabPageParent = tabPage.parent;
			if (!tabPageParent?.length) { tabPageParent = layout.children(`div#${id}`); tabPage.parent = tabPageParent && tabPageParent.length ? tabPageParent : null }
			if (!(tabPageParent && tabPageParent.length)) { tabPageParent = tabPage.parent = $(`<div id="${builder.tabID}" class="content"/>`) }
			if (tabPageParent.parent()[0] != layout[0]) { if (tabPageParent.parent().length) { tabPageParent.detach() } tabPageParent.appendTo(layout) }
		}
	}
	addTab(e, _etiket) {
		e = e || {}; const id = typeof e == 'object' ? e.id : e;
		const etiket = typeof e == 'object' ? e.etiket : _etiket, tabPage = new FBuilder_TabPage({ id, etiket });
		this.add(tabPage); return tabPage
	}
}
class FBuilder_TanimFormTabs extends FBuilder_TabsOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	preInit(e) { super.preInit(e); this.rootPart.hasTabPages = true }
	buildDevam(e) { super.buildDevam(e); const {layout, rootPart} = this; layout.prop('id', 'tabPanel'); rootPart.tabPanel = layout }
}
class FBuilder_Tabs extends FBuilder_TabsOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { super(e); $.extend(this, { widgetArgsDuzenle: e.widgetArgsDuzenle, initTabLayoutBlock: e.initTabLayout || e.initTabLayoutBlock }) }
	postBuild(e) {
		super.postBuild(e); const {parent, layout, parentPart} = this; this._initTabIDSet = {};
		const _e = $.extend({}, e, { args: {
			builder: this, parent, layout, parentPart, initTabContent: e => {
				const {layout, initTabLayoutBlock} = this, {tabPage} = e, tabID = tabPage.id, tabIndex = tabPage.index, sender = this, builder = this;
				const _e = { ...e,  sender, builder, tabPage, tabID, tabIndex }; if (this.initTabLayout) { this.initTabLayout(_e) }
				if (initTabLayoutBlock) { getFuncValue.call(this, initTabLayoutBlock, _e) } this._initTabIDSet[tabID] = true
			}
		} });
		const {widgetArgsDuzenle} = this; if (widgetArgsDuzenle) { getFuncValue.call(this, widgetArgsDuzenle, _e) }
		const part = this.part = this.widget = new TabsPart(_e.args); part.run()
	}
}
class FBuilder_TabPage extends FormBuilder {
    static { window[this.name] = this; this._key2Class[this.name] = this } get isTabPage() { return true }
	constructor(e) { e = e || {}; super(e); $.extend(this, { tabID: e.tabID || e.tabId || e.id, text: e.text ?? e.etiket, tabActivatedFlag: false }); }
	preInit(e) { super.preInit(e); this.parent = this.parent.children(`div#${this.tabID}`); }
	buildDevam(e) { super.buildDevam(e); const {layout, parent} = this; if (layout === undefined) { debugger } if (layout.parent() != parent) { layout.appendTo(parent) } }
	initTabLayout(e) { if (e.tabID != (this.tabID || this.id)) { return } e.builder = this; this.tabActivatedFlag = true; this.afterBuildDevam(e) }
	afterBuildDevam(e) { if (!this.tabActivatedFlag) { return } super.afterBuildDevam(e) }
}
