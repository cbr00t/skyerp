class IPC2App extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get isLoginRequired() { return false }
	get autoExecMenuId() { return null }

    constructor(e = {}) {
        super(e)
    }
    async init(e) {
		await super.init(e)
		if (!config.dev) {
			;['inNewWindow', 'tamEkranYok', 'kiosk', 'dark', 'internal'].forEach(k =>
				qs[k] = true)
			extend(config, { kiosk: true, colorScheme: 'dark' })
			//config.applyColorScheme()
		}
    }
    async runDevam(e) {
		await super.runDevam(e)
	}
	async afterRun(e) {
		await super.afterRun(e)
		let { content } = this
		content.empty()
		$(`<div class="info success">${appName}</div>`)
			.appendTo(content)
		this.show()
    }
	async ilkIslemler(e) {
		// do nothing
		super.ilkIslemler(e)    // no await
		await delay(1)
	}
    getAnaMenu() { return new FRMenu() }
}
