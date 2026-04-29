class MQYerelParamConfig_App extends MQYerelParamConfig {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class MQYerelParam extends MQYerelParamTicari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return `${super.paramKod}.local` }
	static get sinifAdi() { return 'Sky Tablet Parametreleri' }

	constructor(e = {}) { super(e) }
	static paramAttrListeDuzenle({ liste }) {
		super.paramAttrListeDuzenle(...arguments)
		// liste.push('posta')
	}
	static paramYapiDuzenle({ paramci }) {
		super.paramYapiDuzenle(...arguments)
		let { sicakSogukVeyaSutAlimmi } = app
		;{
			let form = paramci.addFormWithParent()
			form.addSelect('dokumDevice', 'Döküm Türü')
				.addStyle_wh(250)
				.setSource(TabDokumDevice.kaListe)
				.onAfterRun(async ({ builder: { id, altInst: inst, input } }) => {
					await delay(5)
					input.val(inst[id])
					input.focus()
				})
			form.addSelect('dokumYontemi', 'Döküm Yöntemi')
				.addStyle_wh(250)
				.setSource(TabDokumYontemi.kaListe)
				.onAfterRun(async ({ builder: { id, altInst: inst, input } }) => {
					await delay(5)
					input.val(inst[id])
				})
		}
		if (sicakSogukVeyaSutAlimmi) {
			// let tab = paramci.addTabPage('sutAlim', 'Süt Alım')
			let form = paramci.addFormWithParent()
			form.addSelect('posta', 'Posta')
				.addStyle_wh(200)
				.setSource(TabPosta.kaListe)
				.degisince(({ builder: { id, altInst: inst }, value }) => {
					//debugger
					//inst[id] = value
				})
				.onAfterRun(async ({ builder: { id, altInst: inst, input } }) => {
					await delay(5)
					input.val(inst[id])
					input.focus()
				})
		}
	}
	paramSetValues({ rec } = {}) {
		super.paramSetValues(...arguments)
	}
}
