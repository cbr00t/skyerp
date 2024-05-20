class Ekran2Part extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'ekran2' }
	static get isWindowPart() { return true }

	constructor(e) {
		e = e || {};
		super(e);

		$.extend(this, {
			tamamIslemi: e.tamamIslemi,
			title: e.title == null ? 'Ekran 2' : (e.title || '')
		})
	}

	runDevam(e) {
		e = e || {};
		super.runDevam(e);
		
		const {layout} = this;
		const btnTamam = layout.find('#tamam');
		btnTamam.jqxButton({ theme: theme, width: false, height: false });
		btnTamam.on('click', evt =>
			this.tamamIstendi($.extend({}, e, { event: evt })))
	}

	afterRun(e) {
		super.afterRun(e);
		this.show()
	}

	activated(e) {
		super.activated(e)
	}

	deactivated(e) {
		super.deactivated(e)
	}

	destroyPart(e) {
		super.destroyPart()
	}

	tamamIstendi(e) {
		e = e || {};
		displayMessage(`${this.title} için TAMAM butonuna basıldı`, ' ');
		
		const {tamamIslemi} = this;
		if (tamamIslemi) {
			const _e = $.extend({}, e, { callbackArg1: 'abc' });
			if (getFuncValue.call(this, tamamIslemi, _e) === false)
				return false
		}
		this.close()
	}
}
