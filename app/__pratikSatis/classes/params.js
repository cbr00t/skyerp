class MQYerelParam extends MQYerelParamTicari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/*static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); e.liste.push('x') }
	constructor(e) { e = e || {}; super(e); for (const key of ['y']) { this[key] = this[key] || {} } }
	paramSetValues(e) { super.paramSetValues(e); for (const key of ['y']) { this[key] = this[key] || {} } }*/
}
class MQYerelParamConfig_App extends MQYerelParamConfig {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static paramAttrListeDuzenle({ liste }) {
		super.paramAttrListeDuzenle(...arguments)
		/* liste.push('yerKodListe', 'sonStokDB') */
	}
	static async rootFormBuilderDuzenle({ rootBuilder: rfb }) {
		await super.rootFormBuilderDuzenle(...arguments) /*; let {hasSession, dbName} = session; */
		let contentForm = rfb.addForm('content', ({ builder: fbd }) => fbd.parentBuilder.layout.find('.content'));
		/* if (!hasSession) {
			contentForm.addForm().autoAppend().setLayout(e =>
				$(`<div class="ek-bilgi firebrick bold center" style="font-size: 90%; margin-top: 15px; padding: 10px; border: 1px solid #aaa">` +
				  `Ek parametreleri düzenlemek için önce oturum açılmalıdır</div>`));
			return
		}
		await app.promise_ready; */
		let form = contentForm.addFormWithParent().yanYana(2);
		form.addCheckBox('soundFlag_barkodOkutma', 'Barkod Okutma Sesi');
		form.addCheckBox('soundFlag_barkodHata', 'Barkod Hata Sesi')
	}
}
