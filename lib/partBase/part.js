class Part extends LayoutBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get rootPartName() { return this._rootPartName ?? this.class.rootPartName } set rootPartName(value) { this._rootPartName = value }
	get partName() { return this._partName ?? this.class.partName } set partName(value) { this._partName = value }
	static get birlesikPartName() { return [this.rootPartName, this.partName].filter(x => !!x).join(' ') }
	get birlesikPartName() { return [this.rootPartName, this.partName].filter(x => !!x).join(' ') }
	get wndDefaultIsModal() { return false } static get isSubPart() { return false } get isSubPart() { return this.class.isSubPart }
	static get isWindowPart() { return false } get isWindowPart() { return this.class.isWindowPart }
	static get canDestroy() { return true } get canDestroy() { return this.class.canDestroy }
	static get isCloseable() { return true } get isCloseable() { return this.class.isCloseable }
	get defaultLayoutSelector() { return `#${this.partName}` } get wndClassNames() { return [this.partName, 'part'] } get formDeferMS() { return 50 }
	static get noFullHeightFlag() { return false } get noFullHeightFlag() { return this.class.noFullHeightFlag }
	get rootGlobals() { return app?.params?.yerel?.partGlobals ?? {} }
	get globals() { const {rootGlobals, partName} = this; return rootGlobals[partName] = rootGlobals[partName] ?? {} }
	
	constructor(e) {
		e = e || {}; super(e);
		this.parentPart = e.parentPart || e.sender; this.builder = e.builder; this.events = e.events || {};
		$.extend(this, { title: e.title, wndArgs: e.wndArgs, wndArgsDuzenleBlock: e.wndArgsDuzenleBlock || e.wndArgsDuzenle });
		this.wndArgs = this.wndArgs || {}; this.initWndArgsDuzenle(e);
		let handler = e.acilinca || e.acilincaEvent; if (handler) this.on('acilinca', handler);
		handler = e.acilincaEk || e.acilincaEvent; if (handler) this.on('acilincaEk', handler);
		handler = e.kapaninca || e.kapanincaEvent; if (handler) this.on('kapaninca', handler);
		handler = e.kapanincaEk; if (handler) this.on('kapanincaEk', handler)
		handler = e.activated ?? e.activatedEvent; if (handler) { this.on('activated', handler) }
		handler = e.deactivated ?? e.deactivatedEvent; if (handler) { this.on('deactivated', handler) }
		const {injectResult} = app || {}; if (injectResult?.partNew) { injectResult.partNew(e) }
	}
	init(e) {
		super.init(e); if (!this.isDestroyed && !this.isSubPart) { app._activePartStack.push(this) }
		const {isWindowPart, partName, content} = this; let {layout} = this;
		if (isWindowPart) {
			if (!layout?.length || layout == content) {
				let wndContent = $(`div#${partName}.part`);
				if (!wndContent?.length) { wndContent = $(`template#${partName}.part`); if (wndContent?.length) { wndContent = wndContent.contents('div').clone(true) } }
				layout = wndContent
			}
			this.wndContent = layout;
			if (!layout?.length) { this.layout = layout }
			if (layout?.length) { layout.addClass('wnd-content dock-bottom') /* this.hideBasic() */ }
		}
		const parentPart = this.parentPart || this.sender;
		if (parentPart) { const _subParts = parentPart._subParts = parentPart._subParts || {}; _subParts[partName || newGUID()] = this }
		if (layout?.length) { layout.addClass('basic-hidden') }
		const {injectResult} = app || {}; if (injectResult?.partInit) { injectResult.partInit({ sender: this, ...e }) }
	}
	run(e) {
		const {injectResult} = app || {}; if (injectResult?.partBeforeRun) { injectResult.partBeforeRun({ sender: this, ...e }) }
		e = e || {}; let result = super.run(e);
		const hasBGModal = this.hasBGModal = $('body').hasClass('bg-modal'); if (hasBGModal) { $('body').removeClass('bg-modal') }
		if (injectResult?.partRun) { let _result = injectResult.partRun({ sender: this, ...e }); if (_result !== undefined) { result = _result} }
		return result
	}
	afterRun(e) {
		e = e || {}; const {injectResult} = app || {}; if (injectResult?.partBeforeAfterRun) { injectResult.partBeforeAfterRun({ sender: this, ...e }) }
		super.afterRun(e); let {layout} = this; const {isWindowPart} = this;
		if (isWindowPart) {
			if (!layout?.length || !layout.hasClass('wnd-content')) layout = this.layout = this.wndContent
			let {wndPart, wnd} = this;
			if (!wndPart) {
				const {title, wndArgs, builder, parentPart} = this; wndPart = this.wndPart = createTabbedWindow({ layout, title, widgetArgs: wndArgs, builder, asilPart: this, parentPart });
				wnd = this.wnd = wndPart.layout; this.wndOnOpen(e); wndPart.kapaninca(e => this.wndOnClose(e))
			}
			if (wnd) {
				const wndCSSClass = (this.wndClassNames || []).join(' '); wnd.addClass(wndCSSClass); layout.addClass(wndCSSClass);
				/* if (!this.noFullHeightFlag) layout.css('height', `calc(var(--full) - (var(--appTitle-bottom) + var(--tabs-header-bottom) + 5px))`) */
				const parentPart = this.parentPart || this.sender; if (parentPart?.kapaninca) { parentPart.kapaninca(e => this.close()) }
			}
		}
		const {partName, rootPartName} = this, cssNames = [partName];
		if (rootPartName && rootPartName != partName) cssNames.push(rootPartName); layout.addClass(`${cssNames.join(' ')} part`);
		this.onResize(e); setTimeout(() => this.triggerAcilincaEvent($.extend({}, e, { sender: this })), 10);
		if (layout?.length) { layout.removeClass('basic-hidden') }
		let handler = this._activatedHandler = evt => { this.activated({ event: evt }) }; window.addEventListener('focus', handler);
		if (injectResult?.partAfterRun) { injectResult.partAfterRun({ sender: this, ...e }) }
	}
	updateWndTitle(e) {
		const title = e?.title ?? e ?? '';
		const {wndPart} = this, wndLayout = wndPart?.layout; if (wndLayout?.length) {
			const id = wndLayout[0].id, wndParent = wndLayout.parents('.skyTabs.part');
			const elmTitle = wndParent.find(`.tabs > #${id}.tabPage > .header`); elmTitle.html(title)
		} return this
	}
	show(e) {
		const {wndPart, wnd, formDeferMS} = this, {injectResult} = app || {};
		if (wndPart && wnd) {
			if (wndPart) { wndPart.bringToFront() }
			if (this.formFocusIslemi) { setTimeout(() => this.formFocusIslemi(), formDeferMS) }
			setTimeout(() => wnd.css('opacity', 1), (formDeferMS || 100) / 2)
		}
		super.show(e); if (injectResult?.partShow) { injectResult.partShow({ sender: this, ...e }) }
	}
	hideBasic(e) {
		super.hideBasic(e); const {wndPart, wnd} = this, {injectResult} = app || {};
		if (wndPart && wnd) { wnd.css('opacity', .01) }
		if (injectResult?.partHideBasic) { injectResult.partHideBasic({ sender: this, ...e }) }
	}
	hide(e) {
		super.hide(e); const {wndPart} = this, {injectResult} = app || {};
		if (wndPart) { wndPart.hide() }
		if (injectResult?.hide) { injectResult.hide({ sender: this, ...e }) }
	}
	initWndArgsDuzenle(e) {
		let {wndArgs} = this, {injectResult} = app || {}; $.extend(wndArgs, {
			isModal: e.isModal == null ? this.wndDefaultIsModal : e.isModal, closeButtonAction: this.canDestroy ? 'destroy' : 'close',
			showCollapseButton: e.showCollapseButton == null ? true : e.showCollapseButton, position: e.wndPosition || { x: 3, y: 3 }, width: e.width, height: e.height
		});
		const _e = $.extend({}, e, { sender: this, args: wndArgs }); this.wndArgsDuzenle(_e); wndArgs = _e.args;
		if (injectResult?.initWndArgsDuzenle) { injectResult.initWndArgsDuzenle({ sender: this, ...e }) }
	}
	wndArgsDuzenle(e) {
		e = e || {}; const {wndArgsDuzenleBlock} = this, {injectResult} = app || {};
		if (wndArgsDuzenleBlock) { getFuncValue.call(this, wndArgsDuzenleBlock, e) }
		if (injectResult?.wndArgsDuzenle) { injectResult.wndArgsDuzenle({ sender: this, ...e }) } 
	}
	activated(e) {
		this.onResize(e); const {injectResult} = app || {}, sender = this, _e = { ...e, sender };
		if (this.hasBGModal) { $('body').removeClass('bg-modal') }
		this.triggerActivatedEvent($.extend({}, e, { sender: this }));
		if (injectResult?.activated) { injectResult.activated(_e) }
	}
	deactivated(e) {
		const {injectResult} = app || {}; setTimeout(() => {
			const sender = this, _e = { ...e, sender }; /*if (this.hasBGModal) { $('body').addClass('bg-modal') }*/
			this.triggerDeactivatedEvent($.extend({}, e, { sender: this }));
			if (injectResult?.deactivated) { injectResult.deactivated(_e) }
		}, 1)
	}
	destroyPart(e) {
		const {injectResult} = app || {}; window.removeEventListener('focus', this._activatedHandler);
		if (!(this.isDestroyed || this.isSubPart)) { app._activePartStack.pop() }
		super.destroyPart(e); setTimeout(() => { const sender = this, _e = { ...e, sender }; this.triggerKapanincaEvent(_e); if (injectResult?.kapaninca) { injectResult.kapaninca(_e) } }, 10);
		const {builder} = this; if (!builder || builder.canDestroy) {
			const subParts = this._subParts; if (subParts) {
				const parentPart = this.parentPart ?? this.sender;
				for (const key in subParts) {
					const subPart = subParts[key]; if (subPart == parentPart || subPart == parentPart?.parentPart) { continue }
					if (!subPart.isDestroyed && subPart.destroyPart) { subPart.destroyPart() }
				}
			}
		}
		if (this.hasBGModal) { $('body').addClass('bg-modal') }
		if (injectResult?.destroyPart) { injectResult.destroyPart({ sender: this, ...e }) } this.closeBasic(e)
	}
	close(e) {
		const {wndPart} = this;
		if (/*!this.isDestroyed &&*/ wndPart) { this.closeBasic(e) }
		else if (!this.isDestroyed) { if (this.canDestroy) { this.destroyPart(e) } else { this.hide() } }
	}
	closeBasic(e) {
		const {wndPart} = this; if (wndPart) { wndPart.destroyPart(); this.wndPart = null }
		this.wnd = null
	}
	saveGlobals(e) { app?.params?.yerel.kaydet(); return this }
	saveGlobalsDefer(e) { app?.params?.yerel.kaydetDefer(); return this }
	wndOnOpen(e) { }
	wndOnClose(e) { if (this.canDestroy) { this.wndPart = this.wnd = null; if (!this.isDestroyed) { this.destroyPart() } } else { this.hide() } }
	vazgecIstendi(e) { /* this.close(e); */ this[this.canDestroy ? 'close' : 'hide']() }
	acilinca(handler) { return this.on('acilinca', handler) }
	kapaninca(handler) { return this.on('kapaninca', handler) }
	onActivated(handler) { return this.on('activated', handler) }
	onDeactivated(handler) { return this.on('deactivated', handler) }
	triggerAcilincaEvent(...args) { return this.trigger('acilinca', ...args) }
	triggerKapanincaEvent(...args) { return this.trigger('kapaninca', ...args) }
	triggerActivatedEvent(...args) { return this.trigger('activated', ...args) }
	triggerDeactivatedEvent(...args) { return this.trigger('deactivated', ...args) }
	addEventListener(eventName, handler) { const {events} = this,  handlers = events[eventName] = events[eventName] || []; handlers.push(handler); return this }
	removeEventListener(eventName, handler) {
		const {events} = this, handlers = events[eventName]; if (!handlers) return this
		if (!handler) { delete handlers[eventName]; return this }
		for (let i = handlers.length - 1; i >= 0; i--) { const _handler = handlers[i]; if (_handler == handler) { handlers.splice(i, 1) } }
		if (!handlers.length) { delete events[eventName] }
		return this
	}
	clearEvents(eventName, handler) { const {events} = this; delete events[eventName]; return this }
	async raiseEvent(eventName, ...args) {
		const {events, asilPart} = this; let handlers = events[eventName], ekHandlers = events[`${eventName}Ek`];
		if (!$.isEmptyObject(ekHandlers)) { handlers = handlers || []; handlers.push(...ekHandlers) }
		if (handlers) { for (const i in handlers) { const handler = handlers[i]; await getFuncValue.call(this, handler, ...args) } }
		let eventSelector = `event_${eventName}`; let func = this[eventSelector] ?? window[eventSelector];
		if (func) { await getFuncValue.call(this, func, ...args); }
		const {injectResult} = app || {}; if (injectResult?.raiseEvent) { const _e = { sender: this, eventName, args }; injectResult.raiseEvent(_e) }
		return this
	}
	on(eventName, handler) { return this.addEventListener(eventName, handler) }
	off(eventName, handler) { return this.removeEventListener(eventName, handler) }
	trigger(eventName, ...args) { const {asilPart} = this; this.raiseEvent(eventName, ...args); if (asilPart) { asilPart.raiseEvent(eventName, ...args) } }
	wndOnResize(e) { this.onResize(e) }
	onResize(e) {
		e = e || {}; super.onResize(e); let {fromWnd} = e;
		if (!fromWnd) {
			const {target} = e.event || {};
			if (target) {
				if (target?.__proto__?.constructor?.name == 'Window') { fromWnd = true }
				else if (target.length ? target.hasClass('jqx-window') : target.classList?.contains && target.classList.contains('jqx-window')) { fromWnd = true }
				e.fromWnd = fromWnd
			}
			/*const {wnd} = this; if (wnd && wnd.length) wnd.jqxWindow('resize');*/
		}
	}
}
