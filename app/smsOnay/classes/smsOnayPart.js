class SMSOnayPart extends SimplePart {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'MAIN' }
	static get sinifAdi() { return 'SMS Onay' }
	static get partName() { return 'smsOnay' }
	static get title() { return this.sinifAdi }
	static get islemTuslariVarmi() { return false }

	constructor(e = {}) {
		super(e)
		this.id = qs.id ?? null
	}
	run(e) {
		super.run(e)
		let { rfb, content } = this
		
		content
			.setLayout(_e => {
				let elm = this.getLayout({ ...e, ..._e })
				if (elm && !elm.html)
					elm = $(elm)
				return elm
			})
			.addStyle(_e =>
				this.getStyle({ ...e, ..._e }))
		
		rfb.run()

		this._wasInKioskMode = app.inKioskMode
		if (!config.dev)
			delay(10).then(() => app.enterKioskMode())
	}
	async ilkIslemler(e) {
		await super.ilkIslemler(e)
	}
	async afterRun(e) {
		await super.afterRun(e)
		let { content } = this
	}
	destroyPart(e) {
		super.destroyPart(e)
		if (this._wasInKioskMode)
			app.exitKioskMode
		delete this._wasInKioskMode
	}

	getLayout() {
		return (  // string or jQuery DOM Object
			`<div class="_content full-wh">
				<h3>test</h3>
			</div>`
		)
	}
	getStyle() {  // string or array
		// return [ `$elementCSS {}` ]
		return `$elementCSS { width: calc(100% - 30px) !important; height: calc(100% - 40px) !important; padding: 20px } `
	}
}
