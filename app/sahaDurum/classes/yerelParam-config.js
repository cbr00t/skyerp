class MQYerelParamConfig_SahaDurum extends MQYerelParamConfig {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); const {liste} = e; liste.push('cariTipKod') }
	static async rootFormBuilderDuzenle(e) {
		await super.rootFormBuilderDuzenle(e); const rfb = e.rootBuilder;
		const contentForm = rfb.addForm('content', e => e.builder.parentBuilder.layout.find('.content'));
		contentForm.addTextInput('cariTipKod', 'Cari Tip Kod').addCSS('center').addStyle_wh(150)
	}
}
