class OrnekPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'ornek' }
	static get isWindowPart() { return true }

	constructor(e) {
		e = e || {};
		super(e);

		$.extend(this, {
			title: e.title == null ? '??' : e.title || '',
			tamamIslemi: e.tamamIslemi
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
		super.activated(e);
		// setTimeout(() => this.gridPart.grid.focus(), 10)
	}

	destroyPart(e) {
        // this.gridPart.destroyPart();
		super.destroyPart()
	}

	tamamIstendi(e) {
		e = e || {};
		const {tamamIslemi} = this;
		if (tamamIslemi) {
			const _e = $.extend({}, e, {
				// recs: $.merge([], (this.gridPart.boundRecs || [])).reverse()
			});
			if (getFuncValue.call(this, tamamIslemi, _e) === false)
				return false
		}
		this.close()
	}
}
