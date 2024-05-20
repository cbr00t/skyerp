class MQIsyeri extends MQSube {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'İşyeri' }

	static async tanimla(e) {
		e = e || {}; const inst = new this(e);
		let result = await inst.yukle(e);
		if (!e.islem || e.islem == 'yeni') { e.islem = result ? 'degistir' : 'yeni' }
		return await super.tanimla(e)
	}
	static varsayilanKeyHostVarsDuzenle(e) { super.varsayilanKeyHostVarsDuzenle(e); const {hv} = e; hv[this.kodSaha] = '' }
	keyHostVarsDuzenle(e) { super.keyHostVarsDuzenle(e); const {hv} = e; hv[this.class.kodSaha] = '' }
}
