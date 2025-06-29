class SecimlerWindowPart extends SecimlerPart {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isWindowPart() { return true } static get isCloseable() { return true } get formDeferMS() { return 200 }
	afterRun(e) { e = e || {}; super.afterRun(e); setTimeout(() => {this.show(e) }, this.formDeferMS || 0) }
	destroyPart(e) { super.destroyPart(e); let {wnd} = this; if (wnd?.length){ wnd.jqxWindow('close') } }
	initWndArgsDuzenle(e) {
		super.initWndArgsDuzenle(e); const {wndArgs} = this;
		$.extend(wndArgs, { width: '100%', height: '98%', keyboardCloseKey: '' })
	}
	islemTuslariArgsDuzenle(e) {
		super.islemTuslariArgsDuzenle(e); const {args} = e;
		$.extend(args, { tip: 'tamamVazgec', id2Handler: { tamam: e => this.tamamIstendi(e), vazgec: e => this.vazgecIstendi(e) } })
	}
	formFocusIslemi(e) { /*const {secimlerForm} = this; if (secimlerForm?.length) { const elm = secimlerForm.find('input:not([type=hidden]):eq(0)'); if (elm.length) { elm.focus() } }*/ }
}
