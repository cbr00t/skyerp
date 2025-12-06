class LayoutBase extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get asyncRunFlag() { return false } get asyncRunFlag() { return this.class.asyncRunFlag }
	get defaultLayoutSelector() { return null } get defaultCSSSelector() { return null }
	static get slowAnimationFlag() { return false }
	get slowAnimationFlag() { return this._slowAnimationFlag ?? this.class.slowAnimationFlag }
	constructor(e) {
		e = e || {}; super(e);
		this.content = e.content; this.layout = e.layout;
		this.layoutSelector = e.layoutSelector; this.cssSelector = e.cssSelector
	}
	run(e) {
		if (this.asyncRunFlag) {
			return new $.Deferred(async p => {
				let result
				try {
					try { await this.init(); result = await this.runDevam() }
					finally { await this.afterRun(e) }
					p.resolve(result === undefined ? this : result)
				}
				catch (ex) { p.reject(ex) }
			})
		}
		{
			let result
			try { this.init(e); result = this.runDevam(e) }
			finally { this.afterRun(e) }
			return result === undefined ? this : result
		}
	}
	init(e) {
		let {content, layout, _css} = this; let hasContent = content?.length;
		if (!hasContent) content = this.content = $(`main#content`)
		if (!layout?.length) { layout = this.layout = this.getLayout(e) }
		if (!layout?.length) { layout = this.layout = content }
		if (!layout?.parent()?.length) { layout.appendTo(hasContent ? content : 'body') }
		if (!_css?.length) { _css = this._css = this.getCSS(e) }
		if (_css) { if (!typeof _css != 'string' && _css.text) { _css = this._css = css.text() } }
		if (_css) { $(`<style>${_css}</style>`).appendTo('head') }
		if (layout?.length && this.slowAnimationFlag) { layout.addClass('slow-animation') }
	}
	runDevam(e) { }
	afterRun(e) {
		/*$(window).on('resize', evt => {
			if (this._inResizeEvent) return
			this._inResizeEvent = true;
			try { this.onResize({ sender: this, event: evt }) } finally { delete this._inResizeEvent }
		})*/
	}
	show(e) { let {layout} = this; layout.css('opacity', 1); layout.removeClass('jqx-hidden basic-hidden'); return this }
	hide(e) { this.layout.addClass('jqx-hidden'); return this }
	hideBasic(e) { /* this.layout.addClass('basic-hidden'); this.layout.css('opacity', .05) */ return this }
	remove(e) { this.layout.remove(); return this }
	detach(e) { this.layout.detach(); return this }
	destroyPart(e) { this.isDestroyed = true; return this }
	getLayout(e) {
		e = e || {}; let layout = this.getLayoutInternal(e); if (layout) { return layout }
		let selector = e.selector || this.layoutSelector || this.defaultLayoutSelector; delete e.selector;
		if (selector) {
			if ($.isFunction(selector)) { selector = selector.call(this, e) } else if (selector.run) { selector = selector.run(e) }
			if (selector && typeof selector != 'string' && selector.length) { return selector }
			let {content} = this; if (content?.length) {
				layout = content.find(selector).eq(0);
				if (layout?.length) { if (layout[0].tagName.toUpperCase() == 'TEMPLATE') layout = layout.eq(0).contents(':not(text)').clone(true) }
				if (layout?.length) return layout
			}
			layout = $(selector).eq(0); if (layout?.length) { if (layout[0].tagName.toUpperCase() == 'TEMPLATE') layout = layout.eq(0).contents(':not(text)').clone(true) }
			if (layout?.length) { return layout }
		}
		return null
	}
	getCSS(e) {
		e = e || {}; let css = this.getCSSInternal(e); if (css) return css
		let selector = e.selector || this.cssSelector || this.defaultCSSSelector; delete e.selector;
		if (selector) {
			if ($.isFunction(selector)) selector = selector.call(this, e)
			else if (selector.run) selector = selector.run(e)
			if (selector && typeof selector != 'string' && selector.length) return selector
			let {content} = this;
			if (content?.length) {
				css = content.find(selector).eq(0);
				if (css?.length) { if (css[0].tagName.toUpperCase() == 'TEMPLATE') css = css.eq(0).contents(':text').clone(true) }
				if (css?.length) return css
			}
			css = $(selector).eq(0);
			if (css?.length) { if (css[0].tagName.toUpperCase() == 'TEMPLATE') css = css.eq(0).contents(':text').clone(true) }
			if (css?.length) { return css }
		}
		return null
		return null
	}
	getLayoutInternal(e) { return null }
	getCSSInternal(e) { return null }
	onResize(e) {
		// if (this._inEventFlag) return
		let {_lastEventTimestamp_resize} = this, _now = this._lastEventTimestamp_resize = now();
		if (_lastEventTimestamp_resize && _now - _lastEventTimestamp_resize < 100) return; this._inEventFlag = true;
		try {
			let {layout} = this
			if (!this.isDestroyed && layout?.length) {
				let elms_dockBottom = layout.find('.dock-bottom')
				if (elms_dockBottom.length) {
					for (let i = 0; i < elms_dockBottom.length; i++) {
						let elm = elms_dockBottom.eq(i)
						/* let elmPos = elm.offsetParent(); */ let elmPos = elm;
						if (!elmPos?.length)
							elmPos = elm
						if (elmPos?.length && !elmPos.height())
							elmPos = elm.parent()
						let y = elmPos.position().top
						elm.height(`calc(var(--full) - (${y}px + 0px))`)
					}
				}
				console.debug('onResize', 'layoutBase', e)
			}
		}
		finally { this._inEventFlag = false }
	}
	slowAnimation() { this._slowAnimationFlag = true; return this }
	normalAnimation() { this._slowAnimationFlag = false; return this }
}
