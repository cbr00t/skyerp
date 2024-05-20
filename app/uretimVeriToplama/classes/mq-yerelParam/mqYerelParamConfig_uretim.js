class MQYerelParamConfig_Uretim extends MQYerelParamConfig {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); const {liste} = e; liste.push('hatKod') }
	static async rootFormBuilderDuzenle(e) {
		await super.rootFormBuilderDuzenle(e); const rfb = e.rootBuilder;
		const contentForm = rfb.addForm('content', e => e.builder.parentBuilder.layout.find('.content'));
		if (config.session?.hasSession) { await app.promise_ready; contentForm.addModelKullan('hatKod', 'Hat').setMFSinif(MQHat).dropDown().listedenSecilemez() }
		else {
			contentForm.addForm().autoAppend().setLayout(e =>
				$(`<div class="ek-bilgi firebrick bold center" style="font-size: 90%; margin-top: 15px; padding: 10px; border: 1px solid #aaa">Hat seçimi için önce oturum açılmalıdır</div>`))
		}
	}
}
