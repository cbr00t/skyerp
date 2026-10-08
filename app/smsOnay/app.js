class SMSOnayApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get mainClass() { return SMSOnayPart }
	get mainClass() { return this.class.mainClass }
	get isLoginRequired() { return false } 
	get autoExecMenuId() { return this.mainClass.kodListeTipi }
	static get yerelParamSinif() { return MQYerelParam }
	get configParamSinif() { return MQYerelParamConfig_App }
	get defaultWSPath() { return `${super.superDefaultWSPath}/genel` }

	constructor(e = {}) { super(e) }
	async init(e) {
		config.colorScheme ||= 'dark'
		await super.init(e)
	}
	async runDevam(e) {
		await super.runDevam(e)
	}
	async afterRun(e) {
		await super.afterRun(e)
		await this.anaMenuOlustur(e)
		//if (!config.dev)
		//	delay(100).then(() => this.enterKioskMode())
	}
	paramsDuzenle({ params }) { 
		extend(params, {
			localData: MQLocalData.getInstance(),
			smsOnay: MQParam_SMSOnay.getInstance()
		})
	}
	navBarDuzenle(e) {
		if (config.dev)
			return super.navBarDuzenle(e)
		
		let { mainNav } = this
		new FRMenu().navLayoutOlustur({ parent: mainNav })
	}
	async getAnaMenu(e) {
		let { noMenuFlag, params } = this
		if (noMenuFlag)
			return new FRMenu()
		
		let items = []
		let addMenuSubItems = (mne, text, ...classes) => {
			let subItems = classes.flat().map(cls =>
				new FRMenuChoice({
					mne: cls.kodListeTipi || cls.partName, text: cls.sinifAdi,
					block: async e => {
						if (qs.newWindow)
							return null
						let result = await (
							cls.sadeceTanimmi
								? new cls(e).tanimla({ ...e, islem: 'izle' })
								: cls.listeEkraniAc ? cls.listeEkraniAc(e)
								: new cls(e).run()
						)
						
						let part = result?.part ?? result
						if (qs.inNewWindow && part?.kapaninca)
							part.kapaninca(() => globalThis.close())
						
						return result
					}
				})
			)
			
			let menuItems = []
			if (subItems?.length) {
				menuItems = mne ? [
					new FRMenuCascade({ mne, text, items: subItems })
				] : subItems
				items.push(...menuItems)
			}
			
			return menuItems
		}
		addMenuSubItems(null, null, [this.mainClass])
		return new FRMenu({ items })
	}

	sqlExecNoneWithResult(e) { return null }
	_sqlExec(e) { return [] }
}
