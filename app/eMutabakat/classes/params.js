class MQYerelParam extends MQYerelParamTicari {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
}

class MQYerelParamConfig_App extends MQYerelParamConfig {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
}

class MQParam_EMutabakat extends MQParam {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return 'MUTPARAM' } static get sinifAdi() { return 'Mutabakat Parametreleri' }
	
	static paramYapiDuzenle({ paramci }) {
		super.paramYapiDuzenle(...arguments)
	}
	async tekilOku(e) {
		return {}
	}
	paramSetValues({ rec }) {
		super.paramSetValues(...arguments)
	}
}
