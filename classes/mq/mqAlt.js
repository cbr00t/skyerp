class MQAlt extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, 'inst'] }
	static get addSelfToPTanimFlag() { return true }
}
class MQExt extends MQAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get extmi() { return true }
	// static get addSelfToPTanimFlag() { return false }
	static altYapiInit(e) {
		const {mfSinif, pTanim} = this;
		const target_pTanim = e.pTanim;
		if (pTanim && target_pTanim) {
			let degistimi = false;
			for (const ioAttr in pTanim) {
				const pInst = pTanim[ioAttr];
				if (pInst != null && !target_pTanim[ioAttr]) {
					target_pTanim[ioAttr] = pInst;
					// delete pTanim[ioAttr];
					degistimi = true
				}
			}
		}
	}
	altYapiInit(e) { }
	/* MQExt için pTanim rowattr için hv/setval işlemi olmaz, referans verilen sınıfta yapılır */
	pIO_hostVarsDuzenle(e) { }
	pIO_setValues(e) { }
}
