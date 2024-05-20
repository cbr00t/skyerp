class FiltreFormPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'filtreForm' } static get isSubPart() { return true }

	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { parentPart: e.parentPart, value: e.value, degisinceEvent: [] });
		const degisinceBlock = e.degisince || e.degisinceBlock; if (degisinceBlock) this.change(degisinceBlock)
	}
	runDevam(e) {
		e = e || {}; super.runDevam(e); const {layout} = this, input = this.input = layout.find('.input');
		input.val((this.value || '').trim());
		input.on('focus', evt => setTimeout(() => evt.target.select(), 200));
		const changeHandler = evt => {
			const value = this.value = (evt && evt.target ? (evt.target.value || '') : input.val()).trim();
			if (value != this.lastValue) { this.onChange({ event: evt }); this.lastValue = value }
		}
		input.on('change', evt => changeHandler(evt));
		input.on('keyup', evt => {
			const key = (evt.key || '').toLowerCase();
			if (key == 'enter' || key == 'linefeed') changeHandler(evt)
			else { this.timer_change = setTimeout(() => { try { changeHandler(evt) } finally { delete this.timer_change } }, 100) }
		})
	}
	static hizliBulIslemi(e) {
		const {layout} = e; let elms = layout.find('*'); if (!elms.length) return
		const css_include = 'find-include', css_exclude = 'find-exclude';
		for (const css of [css_include, css_exclude]) {
			const elms = layout.find(`.${css}`);
			for (let i = 0; i < elms.length; i++) { const elm = elms.eq(i); for (const item of [elm, elm.parent()]) item.removeClass(css) }
		} /* elms = elms.filter(':not(:empty)'); */
		const tokens = (e.tokens ?? e.parts ?? []).map(x => x.toUpperCase()).filter(x => !!x), uygunlar = [], digerleri = [];
		for (let i = 0; i < elms.length; i++) {
			const elm = elms.eq(i), tagName = elm[0].tagName.toUpperCase(); let value;
			let uygunmu = !!tokens.length && (
				( tagName == 'INPUT' && !( elm.attr('type') == 'button' || elm.attr('type') == 'hidden' ) ) ||
				tagName == 'TEXTAREA' || tagName == 'LABEL' || tagName == 'LI' ||
				( elm.hasClass('jqx-grid-cell') || elm.parents('.jqx-grid-cell').length ) ||
				( elm.hasClass('jqx-grid-group-cell') || elm.parents('.jqx-grid-group-cell').length )
			);
			if (uygunmu) { value = (elm.val() || elm.text() || '').toString().toUpperCase(); uygunmu = !!value }
			if (uygunmu) {
				for (const token of tokens) {
					if (!token) continue
					if (!value.includes(token)) { uygunmu = false; break }
				}
			} /* const parent = elm.parent(); */
			for (const item of [elm]) item.addClass(uygunmu ? css_include : css_exclude);
			if (uygunmu) {
				const tabPage_content = elm.parents('.content:not(.tabbedWindow.part)'), tabPanel = tabPage_content?.length ? tabPage_content.parents('.skyTabs.part:not(#windows)') : null;
				const tabPage_item = tabPanel?.length ? tabPanel.find(`.tabs > .tabPage.nav-item:eq(${tabPage_content.index() - 1})`) : null;
				if (tabPage_item?.length) { tabPage_item.addClass(css_include); tabPage_item.removeClass(css_exclude) }
			}
			(uygunmu ? uygunlar : digerleri).push(elm)
		}
		if (!uygunlar.length) { for (const elm of digerleri) { for (const item of [elm, elm.parent()]) item.removeClass(`${css_include} ${css_exclude}`) } }
		return { uygunlar, digerleri }
	}
	focus() { this.input?.focus(); return this }
	onChange(e) {
		e = e || {}; const {degisinceEvent, value} = this;
		if (degisinceEvent) {
			const tokens = value ? value.split(' ').map(x => x.trim()).filter(x => !!x) : null;
			for (const handler of degisinceEvent) getFuncValue.call(this, handler, $.extend({}, e, { sender: this, value, tokens }));
		}
		return this
	}
	change(handler) { const {degisinceEvent} = this; if (!degisinceEvent.find(x => x == handler)) degisinceEvent.push(handler); return this }
	degisince(handler) { return this.change(handler) }
	on(eventName, handler) { if (eventName == 'change') return this.change(handler); return this }
	off(eventName, handler) {
		if (eventName == 'change') {
			if (handler) {
				const {degisinceEvent} = this, ind = degisinceEvent.findIndex(x => x == handler);
				if (ind != null && ind > -1) degisinceEvent.splice(ind, 1);  this
			}
			else { return change(handler) }
			
		}
		return this
	}
}
