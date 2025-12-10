class MQTabTestFis extends mixin(TabFisTemplate, MQOrtakFis) {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle({ pTanim }) {
		MQOrtakFis.pTanimDuzenle(...arguments)
		super.pTanimDuzenle(...arguments)
	}
	static async rootFormBuilderDuzenle_tablet(e) {
		await super.rootFormBuilderDuzenle_tablet(e)
		let {sender: tanimPart, inst, rootBuilder: rfb, kaForm, tanimFormBuilder: tanimForm} = e
		// tanimForm.addForm().setLayout(() => $(`<p><h3>hello world from ${this.name}</h3></p>`))
	}
	static async rootFormBuilderDuzenle_tablet_acc_baslik({ rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_baslik(...arguments)
	}
}
