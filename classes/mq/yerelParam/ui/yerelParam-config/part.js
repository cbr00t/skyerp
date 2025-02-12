class MQYerelParamConfigTanimPart extends MQYerelParamBaseTanimPart {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get partName() { return 'yerelParamConfigTanim' }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			gelismisFlag: e.gelismis ?? e.gelismisFlag, title: e.title || 'Yerel Parametreler (WS)' })
	}
	runDevam(e) {
		super.runDevam(e); const {layout, inst} = this;
		const txtWSUrl = this.txtWSUrl = layout.find('#wsURL .veri'); txtWSUrl.val(inst.wsURL || '');
		txtWSUrl.on('change', evt => {
			const elm = evt.currentTarget; let value = (elm.value || '').trim(); if (value.startsWith('/')) { value = value.substring(1) } if (value.endsWith('/')) { value = value.slice(0, -1) }
			value = value.trim(); elm.value = value; inst.wsURL = (value || '')
		});
		const txtWSProxyServerURL = this.txtWSProxyURL = layout.find('#wsProxyServerURL .veri'); txtWSProxyServerURL.val(inst.wsProxyServerURL || '');
		txtWSProxyServerURL.on('change', evt => {
			const elm = evt.currentTarget; let value = (elm.value || '').trim(); if (value.startsWith('/')) { value = value.substring(1) } if (value.endsWith('/')) { value = value.slice(0, -1) }
			value = value.trim(); elm.value = value; inst.wsProxyServerURL = (value || '')
		});
		const chkGelismisAyarlar = this.chkGelismisAyarlar = layout.find('#chkGelismisAyarlar');
		chkGelismisAyarlar.val(this.gelismisFlag);
		chkGelismisAyarlar.on('change', ({ currentTarget: target }) => { this.gelismisFlag = $(target).is(':checked'); this.gelismisFlagDegisti(e) });
		const txtSQL_server = this.txtSQL_server = layout.find('#sql-server .veri'); txtSQL_server.val((inst.sql || {}).server || '');
		txtSQL_server.on('change', evt => {
			const elm = evt.currentTarget; let value = (elm.value || '').trim(); elm.value = value;
			const sql = inst.sql = inst.sql || {}; sql.server = value
		});
		const txtSQL_db = this.txtSQL_db = layout.find('#sql-db .veri'); txtSQL_db.val((inst.sql || {}).db || '');
		txtSQL_db.on('change', evt => {
			const elm = evt.currentTarget; let value = (elm.value || '').trim(); elm.value = value;
			const sql = inst.sql = inst.sql || {}; sql.db = value
		});
		const txtSQL_user = this.txtSQL_user = layout.find('#sql-user .veri'); txtSQL_user.val((inst.sql || {}).sqlUser || '');
		txtSQL_user.on('change', evt => {
			const elm = evt.currentTarget; let value = (elm.value || '').trim(); elm.value = value;
			const sql = inst.sql = inst.sql || {}; sql.sqlUser = value
		});
		const txtSQL_pass = this.txtSQL_pass = layout.find('#sql-pass .veri'); txtSQL_pass.val((inst.sql || {}).sqlPass || '');
		txtSQL_pass.on('change', evt => {
			const elm = evt.currentTarget; let value = (elm.value || '').trim(); elm.value = value;
			const sql = inst.sql = inst.sql || {}; sql.sqlPass = value
		});
		const txtUzakScriptURL = this.txtUzakScriptURL = layout.find('#uzakScriptURL .veri'); txtUzakScriptURL.val(inst.uzakScriptURL || '');
		txtUzakScriptURL.on('change', evt => {
			const elm = evt.currentTarget; let value = (elm.value || '').trim();
			elm.value = value; inst.uzakScriptURL = value || ''
		});
		const txtUzakScriptIntervalSecs = this.txtUzakScriptIntervalSecs = layout.find('#uzakScriptIntervalSecs .veri');
		txtUzakScriptIntervalSecs.val(inst.uzakScriptIntervalSecs || null);
		txtUzakScriptIntervalSecs.on('change', evt => {
			const elm = evt.currentTarget; let value = (typeof elm.value == 'string' ? asFloat((elm.value || '').trim()) : asFloat(elm.value)) || null;
			elm.value = value; inst.uzakScriptIntervalSecs = value
		});
		new RootFormBuilder().addModelKullan('colorScheme', 'Renk Şeması').dropDown().kodsuz().noMF().listedenSecilemez()
			.setParent(chkGelismisAyarlar.parent().parent()).setInst(inst).setSource(ColorScheme.kaListe).degisince(e => inst.applyColorScheme())
			.addStyle_wh(150).addStyle(e => `$elementCSS { position: absolute; right: 20px; margin-top: -30px }`)
			.run();
		this.gelismisFlagDegisti(e)
	}
	afterRun(e) { super.afterRun(e); setTimeout(() => { makeScrollable(this.layout); this.txtWSUrl.focus() }, 100) }
	/*wndArgsDuzenle(e) { super.wndArgsDuzenle(e); const {wndArgs} = e; $.extend(wndArgs, { width: $(window).width() < 900 ? '100%' : '60%', height: 580 }) }*/
	gelismisFlagDegisti(e) {
		const {layout, gelismisFlag} = this;
		layout.find('.gelismis')[gelismisFlag ? 'removeClass' : 'addClass']('jqx-hidden')
	}
}
