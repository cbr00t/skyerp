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
		await super.rootFormBuilderDuzenle(...arguments) /*; let {hasSession, dbName} = session;
		let contentForm = rfb.addForm('content', ({ builder: fbd }) => fbd.parentBuilder.layout.find('.content'));
		if (!hasSession) {
			contentForm.addForm().autoAppend().setLayout(e =>
				$(`<div class="ek-bilgi firebrick bold center" style="font-size: 90%; margin-top: 15px; padding: 10px; border: 1px solid #aaa">` +
				  `<b>Depolar</b> ve <b>Son Stok Veritabanı</b> seçimi için önce oturum açılmalıdır</div>`));
			return
		}
		await app.promise_ready; let dbNamePrefix = dbName?.slice(0, 4);
		let form = contentForm.addFormWithParent().yanYana(2);
		form.addModelKullan('yerKodListe', 'Depolar')
			.comboBox().autoBind().listedenSecilmez().coklu().setMFSinif(MQStokYer);
		form.addModelKullan('sonStokDB', 'Son Stok Veritabanı')
			.comboBox().autoBind().listedenSecilmez().kodsuz().noMF()
			.setPlaceHolder('(A) Merkez Ambarı')
			.setSource(async e =>
				(await app.wsDBListe())
					.filter(name => !dbNamePrefix || name.startsWith(dbNamePrefix))
					.map(adi => new CKodVeAdi([adi, adi]))
			)*/
	}
	async yukleSonrasi(e) {
		let {DefaultWSHostName_SkyServer: host, DefaultSSLWSPort: port} = config.class;
		this.wsURL = this.wsURL || `https://${host}:${port}`;
		await super.yukleSonrasi(e)
	}
}
