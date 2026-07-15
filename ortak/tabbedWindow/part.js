class TabbedWindowPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return true }  get partName() { return 'tabbedWindow' }
	
	constructor(e = {}) {
		super(e)
		extend(this, {
			wndId: e.id || e.wndId || newGUID(),
			title: e.title,
			autoOpenFlag: e.autoOpen ?? e.autoOpenFlag ?? true,
			widgetArgs: e.widgetArgs ?? {},
			parentPart: e.parentPart, asilPart: e.asilPart ?? this
		})
		let {asilPart, parentPart} = this
		let ownerPart = this.ownerPart = (
			e.ownerPart ?? asilPart?.parentPart ??
			asilPart?.wndPart?.parentPart ?? parentPart?.parentPart ??
			parentPart?.wndPart?.parentPart ?? asilPart
		)
		this.ownerWndPart = ownerPart?.wndPart
	}
	runDevam(e) {
		super.runDevam(e)
		if (this.autoOpenFlag)
			this.open(e)
	}
	destroyPart(e) {
		this.close(e)
		let { layout } = this
		if (layout?.length)
			layout.remove()
		delete this.layout
		return super.destroyPart(e)
	}
	open(e) {
		let { wndId, layout, title, asilPart } = this
		let { mainWindowsPart } = app
		let { divTabs, id2TabPage } = mainWindowsPart
		let { isSubPart, isDestroyed } = asilPart ?? {}
		if (wndId && isSubPart)
			delete id2TabPage[wndId]

		let elmTabHeader = divTabs.children(`.tabPage#${wndId}`)
		if (elmTabHeader?.length && (elmTabHeader.hasClass('jqx-hidden') || elmTabHeader?.hasClass('basic-hidden')))
			return this.show(e)
		
		let elmTabPage = $(`<li id="${wndId}" class="tabPage"><div class="header">${title || ''}</div><button id="kapat" class="tabPage-button">X</button></li>`)
		//divTabs.prepend(elmTabPage)
		divTabs.append(elmTabPage)
		elmTabHeader = mainWindowsPart.divTabs.children(`.tabPage#${wndId}`)
		elmTabHeader.off('mouseup')
		elmTabHeader.on('mouseup', evt => {
			let { target, currentTarget } = evt
			if (target && (target.classList.contains('nav-link') || target.classList.contains('tabPage-button')))
				target = target.parentElement
			else if (
				target?.parentElement && (
					target.parentElement?.classList.contains('nav-link') ||
					target.parentElement?.classList.contains('tabPage-button'))
			) { target = target.parentElement.parentElement }
			if (target == currentTarget && evt.button == 1) {
				let btnKapat = $(currentTarget).children('button#kapat')
				if (btnKapat?.length)
					btnKapat.click()
			}
		})
		
		let wndContent = this.layout = $(`<div id="${wndId}" class="content"/>`)
		layout.appendTo(wndContent)
		//wndContent.insertAfter(divTabs)
		wndContent.appendTo(divTabs.parent())
		
		;[elmTabPage, elmTabPage.children(), layout, wndContent].forEach(elm =>
			elm.data('part', this))
		if (!(isDestroyed /*|| isSubPart*/))
			mainWindowsPart.activePageId = wndId
		mainWindowsPart.refresh()
		
		elmTabPage.children('button#kapat')
			.jqxButton({ theme, width: 40, height: 30 })
			.on('click', evt => {
				let part = $(evt.currentTarget).parents('.tabPage').data('part');
				if (part) {
					let { canDestroy } = part.asilPart ?? part
					part[canDestroy ? 'close' : 'hide']()
				}
			})
		app.content.addClass('jqx-hidden')
		$('body').removeClass('no-wnd')
		
		this.triggerAcilincaEvent(e)
		return this
	}
	close(e) {
		let {wndId} = this, {mainWindowsPart} = app, {ownerWndPart, asilPart} = this;
		let elmTabHeader = mainWindowsPart.divTabs.children(`.tabPage#${wndId}`); if (elmTabHeader?.length) { elmTabHeader.remove() }
		let wndContent = mainWindowsPart.layout.children(`.content#${wndId}`); if (wndContent?.length) { wndContent.remove() }
		/*if (wndContent?.length) { wndContent.detach(); setTimeout(() => { if (wndContent?.length) { wndContent.remove() } }, 100) } */
		if (!asilPart?.class?.isSubPart) {
			let {id2TabPage} = mainWindowsPart;
			for (let [id, tabPage] of entries(id2TabPage)) {
				let {layout, header} = tabPage, childPart = header?.data('part')
				childPart = childPart?.asilPart ?? childPart
				if (childPart?.parentPart == asilPart)
					childPart.destroyPart(e)
			}
			
			let newPageId = ownerWndPart?.wndId
			if (!newPageId) {
				newPageId = keys(id2TabPage).filter(id => {
					if (id == wndId) { return false }
					let tabPage = id2TabPage[id], layout = tabPage?.layout, header = tabPage?.header
					let asilPart = header?.data('part')
					asilPart = asilPart?.asilPart ?? asilPart
					if (asilPart?.isSubPart) { return false }
					if (layout?.hasClass('jqx-hidden')) { return false }
					if (asilPart?.canDestroy === false) {
						let parentPart = asilPart?.parentPart
						if (!parentPart || parentPart.isDestroyed) { return false }
					}
					return true
				}).slice(-1)[0]
			}
			if (newPageId && !id2TabPage[newPageId]) { return }
			let closeableTabPages = values(id2TabPage).filter(tabPage => {
				let header = tabPage?.header, layout = tabPage?.layout; let asilPart = header?.data('part'); asilPart = asilPart?.asilPart ?? asilPart;
				let uygunmu = asilPart?.canDestroy ? !asilPart?.isDestroyed : layout?.hasClass('jqx-hidden');
				return !!header?.parent()?.length && uygunmu && asilPart != this.asilPart && !(layout?.hasClass('jqx-hidden') || layout?.hasClass('basic-hidden'))
			});
			/*if (closeableTabPages.length == 1) {
				let _asilPart = this.asilPart, tabPage = closeableTabPages[0], header = tabPage?.header; let asilPart = header?.data('part'); asilPart = asilPart?.asilPart ?? asilPart;
				if (asilPart == asilPart || asilPart?.parentPart == asilPart) { closeableTabPages = [] }
			}*/
			mainWindowsPart.activePageId = newPageId; mainWindowsPart.refresh();
			let noWndFlag = !(mainWindowsPart.activePageId && closeableTabPages.length); app.content[noWndFlag ? 'removeClass' : 'addClass']('jqx-hidden');
			$('body')[noWndFlag ? 'addClass' : 'removeClass']('no-wnd'); if (noWndFlag) { $('body').removeClass('bg-modal') }
		}
		this.triggerKapanincaEvent(e); return this
	}
	show(e) {
		let {wndId} = this, {mainWindowsPart} = app, {id2TabPage} = mainWindowsPart;
		let elmTabHeader = mainWindowsPart.divTabs.children(`.tabPage#${wndId}`)
		if (!elmTabHeader?.length || !(elmTabHeader.hasClass('jqx-hidden') || elmTabHeader.hasClass('basic-hidden')))
			return this.open(e)
		
		elmTabHeader.removeClass('jqx-hidden')
		mainWindowsPart.activePageId = wndId
		mainWindowsPart.refresh()
		let closeableTabPages = values(id2TabPage).filter(tabPage =>
			tabPage?.header?.data('part')?.asilPart?.isCloseable)
		let noWndFlag = !closeableTabPages.length
		app.content[noWndFlag ? 'removeClass' : 'addClass']('jqx-hidden')
		$('body')[noWndFlag ? 'addClass' : 'removeClass']('no-wnd')
		return this
	}
	hide(e) {
		let {wndId} = this, {mainWindowsPart} = app, {id2TabPage} = mainWindowsPart
		let elmTabHeader = mainWindowsPart.divTabs.children(`.tabPage#${wndId}`)
		if (elmTabHeader?.length) { elmTabHeader.addClass('jqx-hidden') }
		let {ownerWndPart} = this
		if (ownerWndPart && (!ownerWndPart.asilPart || ownerWndPart.asilPart.isDestroyed)) { ownerWndPart = null }
		let {asilPart} = ownerWndPart || {}; if (asilPart?.isSubPart /*|| (asilPart.layout?.hasClass('jqx-hidden') || asilPart.layout?.hasClass('basic-hidden')))*/) {
			ownerWndPart = ownerWndPart.ownerWndPart
			asilPart = ownerWndPart?.asilPart
		}
		let newPageId = ownerWndPart?.wndId
		if (!newPageId) { newPageId = keys(id2TabPage).filter(id => id != wndId).slice(-1)[0] }
		mainWindowsPart.activePageId = newPageId; mainWindowsPart.refresh()
		let closeableTabPages = values(id2TabPage).filter(tabPage => tabPage?.header?.data('part')?.asilPart?.isCloseable)
		let noWndFlag = !closeableTabPages.length; app.content[noWndFlag ? 'removeClass' : 'addClass']('jqx-hidden')
		$('body')[noWndFlag ? 'addClass' : 'removeClass']('no-wnd')
		if (noWndFlag) { $('body').removeClass('bg-modal') }
		return this
	}
	bringToFront(e) {
		let {wndId} = this, {mainWindowsPart} = app;
		let elmTabHeader = mainWindowsPart.divTabs.children(`.tabPage#${wndId}`);
		if (!elmTabHeader?.length || !(elmTabHeader.hasClass('jqx-hidden') || elmTabHeader.hasClass('basic-hidden'))) {
			$('body').removeClass('no-wnd')
			app.content.addClass('jqx-hidden')
			return this
		}
		return this.show(e)
	}
	autoOpen() { this.autoOpenFlag = true; return this }
	noAutoOpen() { this.autoOpenFlag = false; return this }
}
