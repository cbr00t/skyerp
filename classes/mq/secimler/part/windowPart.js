class SecimlerWindowPart extends SecimlerPart {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isWindowPart() { return true }
	static get canDestroy() { return false }
	get formDeferMS() { return 200 }
	
	afterRun(e) {
		e = e || {};
		super.afterRun(e);
		setTimeout(() => {
			this.formFocusIslemi(e);
			this.formShowIslemi(e)
		}, this.formDeferMS || 0)
	}
	initWndArgsDuzenle(e) {
		super.initWndArgsDuzenle(e);
		
		const {wndArgs} = this;
		$.extend(wndArgs, {
			width: '100%', height: '98%',
			// width: Math.max($(window).width() - 200, $(window).width()),
			// Math.min($(window).width(), 1000),
			// height: Math.min(1000, $(window).height()),
			keyboardCloseKey: ''
			// showCloseButton: false
		})
	}
	islemTuslariArgsDuzenle(e) {
		super.islemTuslariArgsDuzenle(e);
		
		const {args} = e;
		$.extend(args, {
			tip: 'tamamVazgec',
			id2Handler: {
				tamam: e => this.tamamIstendi(e),
				vazgec: e => this.vazgecIstendi(e)
			}
		})
	}
	formFocusIslemi(e) {
		const {secimlerForm} = this;
		if (secimlerForm && secimlerForm.length) {
			const elm = secimlerForm.find('input:not([type=hidden]):eq(0)');
			if (elm.length)
				elm.focus()
		}
	}
	formShowIslemi(e) {
		this.show()
	}
}