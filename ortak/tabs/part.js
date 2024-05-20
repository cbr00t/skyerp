class TabsPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return true } static get partName() { return 'skyTabs' }
	
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { activePageId: e.activePageId, id2TabPage: e.id2TabPage, isSortable: e.isSortable ?? e.sortable });
		let block = e.initContent || e.initTabContent || e.initContentBlock; { if (block) this.on('initContent', block) }
		block = e.tabPageChanged || e.tabPageChangedBlock; if (block) { this.on('tabPageChanged', block) }
		block = e.toggled || e.onToggled; if (block) { this.on('toggled', block) }
	}
	runDevam(e) {
		super.runDevam(e);
		const {layout} = this, btnToggle = this.btnToggle = layout.children('#toggle');
		if (btnToggle?.length) { btnToggle.jqxButton({ theme, width: false, height: false }); btnToggle.on('click', evt => this.toggle($.extend({}, e, { event: evt }))) }
		const divTabs = this.divTabs = layout.children('.tabs'); divTabs.addClass('flex-row');
		if (this.isSortable) { divTabs.jqxSortable({ theme, items: `> .tabPage`}) } else { makeScrollable(divTabs) }
		this.refresh()
	}
	destroyPart(e) { super.destroyPart(e); for (const key of ['activePageId', 'lastActivePageId', 'id2TabPage']) { delete this[key] } }
	toggle(e) {
		e = e || {}; const {layout} = this, id = this.activePageId, _e = $.extend({}, e, { sender: this, tabPage: null, id, collapsed: false });
		if (!id) { _e.collapsed = true; layout.removeClass('collapsed'); this.triggerToggled(_e); return }
		const tabPage = _e.tabPage = this.id2TabPage[id];
		if (tabPage) {
			const {content} = tabPage, hasContent = !!content?.length, prevVisibleFlag = !(hasContent && content.hasClass('jqx-hidden'));
			const visibleFlag = !prevVisibleFlag; layout[visibleFlag ? 'removeClass' : 'addClass']('collapsed');
			if (hasContent) { content[visibleFlag ? 'removeClass' : 'addClass']('jqx-hidden') }
			_e.collapsed = !visibleFlag; this.triggerToggled(_e)
		}
	}
	refresh(e) { e = e || {}; this._buildId2TabPage(e); this.render(e) }
	_buildId2TabPage(e) {
		let {id2TabPage} = this; if (!id2TabPage) id2TabPage = this.id2TabPage = {};
		const {layout} = this, headers = this.divTabs.children('.tabPage'), idSet = {};
		for (let i = 0; i < headers.length; i++) {
			const elmTabPage = headers.eq(i); elmTabPage.addClass('nav-item');
			const header = elmTabPage.children('.header'); header.addClass('nav-link');
			const id = elmTabPage.prop('id'), html = header.html(); idSet[id] = true;
			let tabPage = id2TabPage[id] = id2TabPage[id] || ({ id, index: i }); $.extend(tabPage, { html, header, layout: elmTabPage })
			const content = tabPage.content = layout.children('.content').eq(i); if (!content.prop('id')) { content.prop('id', id); }
			if (tabPage.initFlag == null) { tabPage.initFlag = false }
		}
		for (const id in id2TabPage) { if (!idSet[id]) delete id2TabPage[id] }
	}
	render(e) {
		e = e || {}; this._renderHeaders(e);
		const {id2TabPage} = this, activePageId = this.activePageId = this.activePageId || Object.keys(id2TabPage)[0], tabPage = id2TabPage[activePageId];
		if (tabPage) {
			const _e = $.extend({}, e, { sender: this, tabPage, id: activePageId });
			if (!tabPage.initFlag) this._renderContent(_e); else this.triggerTabPageChanged(_e)
		}
		else { delete id2TabPage[activePageId]; this.triggerTabPageChanged(e) }
	}
	_renderHeaders(e) {
		e = e || {}; const {id2TabPage} = this;
		for (const id in id2TabPage) {
			const tabPage = id2TabPage[id], {header} = tabPage;
			for (const elm of [header, header.find('div')]) {
				for (const selector of ['click', 'touchend']) {
					elm.off(selector); elm.on(selector, evt => {
						const targetCSSClass = 'tabPage';
						let header = $(evt.currentTarget); if (!header.hasClass(targetCSSClass)) { header = header.parents(`.${targetCSSClass}`) }
						const id = header.prop('id'), tabPage = this.id2TabPage[id], _e = $.extend({}, e, { event: evt, id, tabPage }); this._renderContent(_e)
					})
				}
			}
		}
	}
	_renderContent(e) {
		const id = e.id || this.activePageId; this.activePageId = id; const tabPage = e.tabPage || this.id2TabPage[id], _e = $.extend({}, e, { sender: this, tabPage, id });
		if (!tabPage.initFlag) {
			this.triggerInitContent($.extend({}, _e)); const {content} = tabPage;
			if (!(this.noScrollFlag || content?.hasClass('no-scroll') || content?.children().hasClass('no-scroll'))) { makeScrollable(tabPage.content) }
			tabPage.initFlag = true; _e.content = content; _e.collapsed = (content?.length) && content.hasClass('jqx-hidden')
		}
		this.triggerToggled(_e); this.triggerTabPageChanged(_e); setTimeout(() => { app.activeWndPart?.onResize(e) }, 10)
	}
	initContent(handler) { return this.on('initContent', handler) }
	initTabContent(handler) { return this.on('initContent', handler) }
	toggled(handler) { return this.on('toggled', handler) }
	tabPageChanged(handler) { return this.on('tabPageChanged', handler) }
	triggerToggled(...args) { return this.trigger('toggled', ...args) }
	triggerInitContent(...args) { return this.trigger('initContent', ...args) }
	triggerTabPageChanged(...args) {
		const id = this.activePageId, {layout, divTabs, parentPart} = this, notSelector = id ? `:not(#${id})` : '';
		divTabs.children(`.tabPage${notSelector}`).removeClass('selected'); layout.children(`.content${notSelector}`).addClass('jqx-hidden');
		const tabPage = this.id2TabPage[id]; if (tabPage) { tabPage.layout.addClass('selected'); tabPage.content.removeClass('jqx-hidden'); layout.removeClass('collapsed') } else { layout.addClass('collapsed') }
		if (id != this.lastActivePageId) {
			this.lastActivePageId = id;
			if (!(parentPart?.isDestroyed || parentPart?.isSubPart)) { this.trigger('tabPageChanged', ...args) }
		}
		return this
	}
	sortable() { this.isSortable = true; return this }
	notSortable() { this.isSortable = false; return this }
}
