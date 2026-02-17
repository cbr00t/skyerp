class TabsPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return true } static get partName() { return 'skyTabs' }
	
	constructor(e) {
		e = e || {}; super(e); $.extend(this, { activePageId: e.activePageId, id2TabPage: e.id2TabPage, isSortable: e.isSortable ?? e.sortable });
		let block = e.initContent || e.initTabContent || e.initContentBlock; { if (block) this.on('initContent', block) }
		block = e.tabPageChanged || e.tabPageChangedBlock; if (block) { this.on('tabPageChanged', block) }
		block = e.toggled || e.onToggled; if (block) { this.on('toggled', block) }
	}
	runDevam(e) {
		super.runDevam(e); let {layout} = this; if (!layout?.length) { return }
		let useCloseAllFlag = app.useCloseAll, btnToggle = this.btnToggle = layout.children('#toggle'), btnCloseAll = this.btnCloseAll = layout.children('#closeAll');
		if (btnToggle?.length) {
			btnToggle.jqxButton({ theme, width: false, height: false }); btnToggle.on('click', evt => this.toggle($.extend({}, e, { event: evt })));
			if (useCloseAllFlag) { btnToggle.addClass('jqx-hidden') }
		}
		if (btnCloseAll?.length) {
			btnCloseAll.jqxButton({ theme, width: false, height: false })
			btnCloseAll.on('click', evt =>
				this.closeAllIstendi({ ...e, event: evt }))
			if (useCloseAllFlag)
				btnCloseAll.removeClass('jqx-hidden basic-hidden')
		}
		let divTabs = this.divTabs = layout.children('.tabs'); divTabs.addClass('flex-row');
		if (this.isSortable) { divTabs.jqxSortable({ theme, items: `> .tabPage`}) }
		else { makeScrollable(divTabs, evt => !(document.activeElement && document.activeElement.classList.contains('jqx-widget-content'))) }
		this.refresh()
	}
	destroyPart(e) {
		super.destroyPart(e)
		deleteKeys(this, 'activePageId', 'lastActivePageId', 'id2TabPage')
	}
	async toggle(e = {}) {
		let {layout, activePageId: id} = this
		let _e = { ...e, sender: this, tabPage: null, id, collapsed: false }
		if (!id) {
			_e.collapsed = true
			layout.removeClass('collapsed')
			await this.triggerToggled(_e)
			return
		}
		let tabPage = _e.tabPage = this.id2TabPage[id];
		if (tabPage) {
			let {content} = tabPage, hasContent = !!content?.length
			let prevVisibleFlag = !(hasContent && content.hasClass('jqx-hidden'))
			let visibleFlag = !prevVisibleFlag; layout[visibleFlag ? 'removeClass' : 'addClass']('collapsed')
			if (hasContent) { content[visibleFlag ? 'removeClass' : 'addClass']('jqx-hidden') }
			_e.collapsed = !visibleFlag
			await this.triggerToggled(_e)
		}
	}
	async closeAllIstendi(e = {}) {
		let id2TabPage = this.id2TabPage || {}
		let tabPages = values(id2TabPage)
		if (tabPages?.length) {
			let rdlg = await ehConfirm('Tüm pencereler kapatılacak, emin misiniz?', appName)
			if (rdlg)
				await this.closeAll(e)
		}
		return this
	}
	async closeAll(e = {}) {
		let id2TabPage = this.id2TabPage || {}
		let tabPages = values(id2TabPage)
		for (let tabPage of tabPages) {
			let part = tabPage?.header?.data('part')
			if (part) {
				let {canDestroy} = part
				await part[canDestroy ? 'close' : 'hide']()
				await new $.Deferred(p => setTimeout(() => p.resolve(), 1))
			}
		}
		await this.refresh(e)
		return this
	}
	async refresh(e = {}) {
		await this._buildId2TabPage(e)
		await this.render(e)
	}
	_buildId2TabPage(e) {
		let {layout} = this, headers = this.divTabs.children('.tabPage')
		let id2TabPage = this.id2TabPage ??= {}
		let idSet = {}
		for (let i = 0; i < headers.length; i++) {
			let elmTabPage = headers.eq(i)
			elmTabPage.addClass('nav-item')
			let header = elmTabPage.children('.header')
			header.addClass('nav-link')
			let id = elmTabPage.prop('id')
			let html = header.html()
			idSet[id] = true
			let tabPage = id2TabPage[id] = id2TabPage[id] ?? ({ id, index: i })
			$.extend(tabPage, { html, header, layout: elmTabPage })
			let content = tabPage.content = layout.children('.content').eq(i)
			if (!content.prop('id'))
				content.prop('id', id)
			tabPage.initFlag ??= false
		}
		for (let id in id2TabPage) {
			if (!idSet[id])
				delete id2TabPage[id]
		}
	}
	async render(e = {}) {
		await this._renderHeaders(e)
		let {id2TabPage} = this
		let activePageId = this.activePageId ||= keys(id2TabPage)[0]
		let tabPage = id2TabPage[activePageId]
		if (tabPage) {
			let _e = { ...e, sender: this, tabPage, id: activePageId }
			if (!tabPage.initFlag)
				await this._renderContent(_e)
			else
				await this.triggerTabPageChanged(_e)
		}
		else {
			delete id2TabPage[activePageId]
			await this.triggerTabPageChanged(e)
		}
	}
	_renderHeaders(e = {}) {
		let {id2TabPage} = this
		for (let id in id2TabPage) {
			let tabPage = id2TabPage[id], {header} = tabPage
			for (let elm of [header, header.find('div')]) {
				for (let selector of ['click', 'touchend']) {
					elm.off(selector)
					elm.on(selector, async evt => {
						let targetCSSClass = 'tabPage', header = $(evt.currentTarget)
						if (!header.hasClass(targetCSSClass))
							header = header.parents(`.${targetCSSClass}`)
						let id = header.prop('id')
						let tabPage = this.id2TabPage[id]
						let _e = { ...e, event: evt, id, tabPage }
						await this._renderContent(_e)
					})
				}
			}
		}
	}
	async _renderContent(e = {}) {
		let id = this.activePageId = e.id || this.activePageId
		let sender = this, {builder} = this
		let tabPage = e.tabPage ?? this.id2TabPage[id]
		let _e = { ...e, sender, builder, tabPage, id }
		let promise
		if (!tabPage.initFlag) {
			promise = new Promise((r, f) => setTimeout(async () => {
				try {
					await this.triggerInitContent({ ..._e })
					let {content} = tabPage
					/*if (!(this.noScrollFlag || content?.hasClass('no-scroll') || content?.children().hasClass('no-scroll'))) {
						makeScrollable(tabPage.content, evt =>
							!(document.activeElement && document.activeElement.classList.contains('jqx-widget-content')))
					}*/
					tabPage.initFlag = true
					_e.content = content
					_e.collapsed = content?.length && content.hasClass('jqx-hidden')
					r({ tabPage, content })
				}
				catch (ex) { f(ex) }
			}, 10))
		}
		await promise
		await this.triggerToggled(_e)
		await this.triggerTabPageChanged(_e)
		setTimeout(() => app.activeWndPart?.onResize(e), 20)
	}
	initContent(handler) { return this.on('initContent', handler) }
	initTabContent(handler) { return this.on('initContent', handler) }
	toggled(handler) { return this.on('toggled', handler) }
	tabPageChanged(handler) { return this.on('tabPageChanged', handler) }
	triggerToggled(...args) { return this.trigger('toggled', ...args) }
	triggerInitContent(...args) { return this.trigger('initContent', ...args) }
	triggerTabPageChanged(...args) {
		let id = this.activePageId, {layout, divTabs, parentPart} = this, notSelector = id ? `:not(#${id})` : '';
		divTabs.children(`.tabPage${notSelector}`).removeClass('selected'); layout.children(`.content${notSelector}`).addClass('jqx-hidden');
		let tabPage = this.id2TabPage[id]; if (tabPage) { tabPage.layout.addClass('selected'); tabPage.content.removeClass('jqx-hidden'); layout.removeClass('collapsed') } else { layout.addClass('collapsed') }
		if (id != this.lastActivePageId) {
			this.lastActivePageId = id;
			if (!(parentPart?.isDestroyed || parentPart?.isSubPart)) { this.trigger('tabPageChanged', ...args) }
		}
		return this
	}
	sortable() { this.isSortable = true; return this }
	notSortable() { this.isSortable = false; return this }
}
