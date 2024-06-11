class TabbedWindowPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return true }  get partName() { return 'tabbedWindow' }
	
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			wndId: e.id || e.wndId || newGUID(), title: e.title, autoOpenFlag: e.autoOpen ?? e.autoOpenFlag ?? true,
			widgetArgs: e.widgetArgs || {}, parentPart: e.parentPart, asilPart: e.asilPart || this
		});
		const {asilPart, parentPart} = this;
		const ownerPart = this.ownerPart = e.ownerPart ?? asilPart?.parentPart ?? asilPart?.wndPart?.parentPart ?? parentPart?.parentPart ?? parentPart?.wndPart?.parentPart ?? asilPart;
		this.ownerWndPart = ownerPart?.wndPart
	}
	runDevam(e) { super.runDevam(e); if (this.autoOpenFlag) { this.open(e) } }
	destroyPart(e) {
		this.close(e); const {layout} = this; if (layout?.length) { layout.remove() }
		for (const key of ['layout']) { delete this[key] } return super.destroyPart(e)
	}
	open(e) {
		const {wndId, layout, title, asilPart} = this, {mainWindowsPart} = app, {id2TabPage} = mainWindowsPart, {isSubPart, isDestroyed} = asilPart || {};
		if (wndId && isSubPart) { delete id2TabPage[wndId] }
		let elmTabHeader = mainWindowsPart.divTabs.children(`.tabPage#${wndId}`);
		if (elmTabHeader?.length && (elmTabHeader.hasClass('jqx-hidden') || elmTabHeader?.hasClass('basic-hidden'))) { return this.show(e) }
		const elmTabPage = $(`<li id="${wndId}" class="tabPage"><div class="header">${title || ''}</div><button id="kapat" class="tabPage-button">X</button></li>`);
		const {divTabs} = mainWindowsPart; divTabs.prepend(elmTabPage);
		elmTabHeader = mainWindowsPart.divTabs.children(`.tabPage#${wndId}`);
		elmTabHeader.off('mouseup'); elmTabHeader.on('mouseup', evt => {
			let {target} = evt; const {currentTarget} = evt;
			if (target && (target.classList.contains('nav-link') || target.classList.contains('tabPage-button'))) { target = target.parentElement }
			else if (target?.parentElement && (target.parentElement?.classList.contains('nav-link') || target.parentElement?.classList.contains('tabPage-button'))) { target = target.parentElement.parentElement }
			if (target == currentTarget && evt.button == 1) { const btnKapat = $(currentTarget).children('button#kapat'); if (btnKapat?.length) { btnKapat.click() } }
		});
		const wndContent = this.layout = $(`<div id="${wndId}" class="content"/>`); layout.appendTo(wndContent); wndContent.insertAfter(divTabs); /* wndContent.appendTo(elmTabPage) */
		for (const elm of [elmTabPage, elmTabPage.children(), layout, wndContent]) { elm.data('part', this) }
		if (!(isDestroyed /*|| isSubPart*/)) { mainWindowsPart.activePageId = wndId }
		mainWindowsPart.refresh();
		elmTabPage.children('button#kapat').jqxButton({ theme, width: 40, height: 30 }).on('click', evt => {
			const part = $(evt.currentTarget).parents('.tabPage').data('part');
			if (part) { const {canDestroy} = part.asilPart ?? part; part[canDestroy ? 'close' : 'hide']() }
		});
		app.content.addClass('jqx-hidden'); $('body').removeClass('no-wnd');
		this.triggerAcilincaEvent(e); return this
	}
	close(e) {
		const {wndId} = this, {mainWindowsPart} = app, {ownerWndPart, asilPart} = this;
		const elmTabHeader = mainWindowsPart.divTabs.children(`.tabPage#${wndId}`);
		if (elmTabHeader?.length) { elmTabHeader.remove() }
		const wndContent = mainWindowsPart.layout.children(`.content#${wndId}`);
		if (wndContent?.length) { wndContent.detach(); setTimeout(() => { if (wndContent?.length) wndContent.remove() }, 100) }
		if (!asilPart?.class?.isSubPart) {
			const {id2TabPage} = mainWindowsPart;
			let newPageId = ownerWndPart?.wndId; if (!newPageId) { newPageId = Object.keys(id2TabPage).filter(id => !(id == wndId || id2TabPage[id]?.layout?.data('part')?.asilPart?.isSubPart)).slice(-1)[0] };
			if (newPageId && !id2TabPage[newPageId]) { return }
			mainWindowsPart.activePageId = newPageId; mainWindowsPart.refresh()
			const noWndFlag = $.isEmptyObject(id2TabPage); app.content[noWndFlag ? 'removeClass' : 'addClass']('jqx-hidden');
			$('body')[noWndFlag ? 'addClass' : 'removeClass']('no-wnd')
		}
		this.triggerKapanincaEvent(e); return this
	}
	show(e) {
		const {wndId} = this, {mainWindowsPart} = app;
		const elmTabHeader = mainWindowsPart.divTabs.children(`.tabPage#${wndId}`); if (!elmTabHeader?.length || !(elmTabHeader.hasClass('jqx-hidden') || elmTabHeader.hasClass('basic-hidden'))) { return this.open(e) }
		elmTabHeader.removeClass('jqx-hidden'); mainWindowsPart.activePageId = wndId; mainWindowsPart.refresh();
		const noWndFlag = $.isEmptyObject(mainWindowsPart.id2TabPage); app.content[noWndFlag ? 'removeClass' : 'addClass']('jqx-hidden');
		$('body')[noWndFlag ? 'addClass' : 'removeClass']('no-wnd'); return this
	}
	hide(e) {
		const {wndId} = this, {mainWindowsPart} = app, {id2TabPage} = mainWindowsPart;
		const elmTabHeader = mainWindowsPart.divTabs.children(`.tabPage#${wndId}`);
		if (elmTabHeader?.length) { elmTabHeader.addClass('jqx-hidden') }
		let {ownerWndPart} = this; if (ownerWndPart && (!ownerWndPart.asilPart || ownerWndPart.asilPart.isDestroyed)) { ownerWndPart = null }
		let {asilPart} = ownerWndPart || {}; if (asilPart?.isSubPart /*|| (asilPart.layout?.hasClass('jqx-hidden') || asilPart.layout?.hasClass('basic-hidden')))*/) { ownerWndPart = ownerWndPart.ownerWndPart; asilPart = ownerWndPart?.asilPart }
		let newPageId = ownerWndPart?.wndId; if (!newPageId) { newPageId = Object.keys(id2TabPage).filter(id => id != wndId).slice(-1)[0] }
		mainWindowsPart.activePageId = newPageId; mainWindowsPart.refresh();
		const noWndFlag = $.isEmptyObject(id2TabPage); app.content[noWndFlag ? 'removeClass' : 'addClass']('jqx-hidden');
		$('body')[noWndFlag ? 'addClass' : 'removeClass']('no-wnd'); return this
	}
	bringToFront(e) {
		const {wndId} = this, {mainWindowsPart} = app;
		const elmTabHeader = mainWindowsPart.divTabs.children(`.tabPage#${wndId}`); if (!elmTabHeader?.length || !(elmTabHeader.hasClass('jqx-hidden') || elmTabHeader.hasClass('basic-hidden'))) { return this }
		return this.show(e)
	}
	autoOpen() { this.autoOpenFlag = true; return this }
	noAutoOpen() { this.autoOpenFlag = false; return this }
}
