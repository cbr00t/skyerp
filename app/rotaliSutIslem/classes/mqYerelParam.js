class MQYerelParam extends MQYerelParamTicari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static paramAttrListeDuzenle({ liste }) {
		super.paramAttrListeDuzenle(...arguments)
		liste.push('lastSession')
	}
	yukleSonrasi(e) {
		super.yukleSonrasi(e)
		let {session} = config
		if (session?.user) {
			this.lastSession = session
			setTimeout(() => this.kaydet(), 100)
		}
	}
}
class MQYerelParamConfig_App extends MQYerelParamConfig {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); let {liste} = e; liste.push('postaKod') }
	static async rootFormBuilderDuzenle(e) {
		await super.rootFormBuilderDuzenle(e)
		let { rootBuilder: rfb } = e
		let contentForm = rfb.addForm('content', e => e.builder.parentBuilder.layout.find('.content'));
		if (config.session?.hasSession) {
			await app.promise_ready
			let { params } = app, { sut } = params
			contentForm.addModelKullan('postaKod', 'Posta')
				.setSource(e => sut.postaKAListe).dropDown().kodsuz().listedenSecilemez()
		}
		else {
			contentForm.addForm().autoAppend().setLayout(e =>
				$(`<div class="ek-bilgi firebrick bold center" style="font-size: 90%; margin-top: 15px; padding: 10px; border: 1px solid #aaa">Posta seçimi için önce oturum açılmalıdır</div>`))
		}
	}
	sonIslemler(e) {
		let {postaKod} = this
		if (postaKod == null)
			postaKod = this.postaKod = (app.params.sut?.postaKAListe || [])[0]?.kod ?? null }
}
