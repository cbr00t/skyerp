class MQGorev extends MQSayacliOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Görev' } static get table() { return '' } static get tableAlias() { return 'grv' }
	static get kodListeTipi() { return 'UGOREV' } static get localDataBelirtec() { return 'gorev' } static get tanimUISinif() { return ModelTanimPart }
	get basTarih() { const {basTS} = this; return basTS?.clearTime ? new Date(basTS).clearTime() : basTS } set basTarih(value) { return value?.clearTime ? new Date(value).clearTime() : value }
	get basSaat() { return timeToString(this.basTS) } set basSaat(value) { const {basTS} = this; if (value) setTime(basTS, asDate(value).getTime()) }

	constructor(e) {
		e = e || {}; super(e); const sabit_hatKod = app.params.config.hatKod || null;
		$.extend(this, {
			oemSayac: e.oemSayac ?? e.oemsayac ?? e.fissayac ?? e.kaysayac ?? this.oemSayac, emirNox: e.emirNox ?? e.emirnox ?? this.emirNox, opNo: e.opNo || e.opno || this.opNo,
			stokKod: e.stokKod || e.shKod || e.stokkod || this.stokKod, islenebilirMiktar: e.islenebilirMiktar ?? e.islenebilirmiktar, miktar: e.miktar /*?? e.islenebilirmiktar ?? e.islenebilirmiktar */ ?? this.miktar,
			hatKod: e.hatKod ?? e.hatkod ?? e.ismrkkod ?? this.hatKod ?? sabit_hatKod, tezgahKod: e.tezgahKod ?? e.tezgahkod ?? this.tezgahkod, perKod: e.perKod ?? e.perkod ?? this.perKod,
			suAnmi: e.suAn ?? e.suan ?? e.suAnmi ?? true, basTS: inverseCoalesce(e.basTS ?? e.basts, value => asDate(value)) || this.basTS || now(), isBaslatilsinmi: e.isBaslatilsin ?? e.isBaslatilsinmi ?? true
		})
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const sabit_hatKod = app.params.config.hatKod || null;
		const style_minWidth = e => `$elementCSS { --width: 500px; min-width: calc(var(--width) / 2) !important }`;
		const rfb = e.rootBuilder, tanimForm = e.tanimFormBuilder;
		rfb.vazgecIstendi = async e => { let rdlg = await ehConfirm('Ekrandan kapatılacak, devam edilsin mi?', e.parentPart?.title); if (rdlg !== true) { throw { isError: true, rc: 'userAbort' } } };
		tanimForm.addForm({ id: 'oemBilgi' })
			.setLayout(e => { const layout = $('<div id="oemBilgi"/>'), {inst} = e.builder.rootPart; MQOEM.oemHTMLDuzenle({ parent: layout, rec: this }); return layout })
			.addStyle_fullWH(undefined, 'unset').addStyle(e => `$elementCSS { position: relative; z-index: 1001; pointer-events: none; margin-bottom: 10px }`);
		let parentForm = tanimForm.addFormWithParent().altAlta().addStyle(e => `$elementCSS { --margin-left: 15px; width: calc(var(--full) - var(--margin-left) * 2) !important; margin: calc(var(--islemTuslari-height) / 4) var(--margin-left) !important }`);
		let form = parentForm.addFormWithParent('hat');
			const fbd_ddHat = form.addModelKullan({ id: 'hatKod', mfSinif: MQHat }).dropDown().addStyle(style_minWidth)
				.degisince(e => e.builder.parentBuilder.parentBuilder.id2Builder.diger.id2Builder.tezgahKod?.part?.dataBind());
		if (sabit_hatKod) { fbd_ddHat.disable() }
		form.addCheckBox('isBaslatilsinmi', 'İş Başlatılsın');
		form = parentForm.addFormWithParent('ts').yanYana().addStyle(e => `$elementCSS > div { width: unset !important; margin-inline-end: 30px }`);
		let _form = form.addFormWithParent('basTS');
		_form.addCheckBox('suAnmi', 'Şu an')
			.degisince(e => {
				const {builder} = e, {id, parentBuilder} = builder, {id2Builder} = parentBuilder;
				for (const subBuilder of Object.values(id2Builder)) {
					if (subBuilder.id != id)
						subBuilder.updateVisible()
				}
			});
		_form.addDateInput('basTarih', 'Baş. Tarih').setVisibleKosulu(e => e.builder.altInst.suAnmi ? 'basic-hidden' : true);
		_form.addTimeInput('basSaat', '').setVisibleKosulu(e => e.builder.altInst.suAnmi ? 'basic-hidden' : true);
		form = form.addFormWithParent({ id: 'miktar-parent' });
		form.addNumberInput({ id: 'miktar', etiket: 'Miktar', maxLength: 10 })
			.addStyle_wh(150)
			.onAfterRun(e => {
				const {builder} = e, {input, altInst} = builder, {miktar, islenebilirMiktar} = altInst;
				if (!input.val())
					input.val(null)
				input.attr('placeholder', islenebilirMiktar);
				input.on('input', evt => {
					const elm = evt.currentTarget; let value = asFloat(elm.value);
					if (islenebilirMiktar && value > islenebilirMiktar)
						value = islenebilirMiktar
					value = Math.max(asFloat(value), 0);
					if (elm.value !== value)
						elm.value = value
				});
				input.on('blur', evt => {
					const elm = evt.currentTarget; let value = asFloat(elm.value);
					if (!value)
						value = elm.value = null
				})
			});
		form = parentForm.addFormWithParent('diger').yanYana(2);
		form.addModelKullan({ id: 'tezgahKod', mfSinif: MQTezgah }).dropDown().addStyle(style_minWidth)
			.ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e, {altInst} = builder, {hatKod} = altInst;
				if (hatKod) {
					for (const sent of stm.getSentListe())
						sent.where.degerAta(hatKod, `${aliasVeNokta}ismrkkod`)
				}
			});
		form.addModelKullan({ id: 'perKod', mfSinif: MQPersonel }).dropDown().addStyle(style_minWidth)
			.onAfterRun(e => {
				const {builder} = e, {id, altInst, part} = builder;
				if (altInst[id])
					part.disable()
			});
	}
	uiKaydetOncesiIslemler(e) {
		super.uiKaydetOncesiIslemler(e); const {inst} = e;
		inst.miktar = inst.miktar || inst.islenebilirMiktar;
		// if ((inst.miktar || 0) <= 0)
		// 	throw { isError: true, rc: 'hataliDeger', errorText: `<b>Miktar</b> 0'dan büyük bir sayı olmalıdır` }
		if ((inst.islenebilirMiktar || 0) > 0 && (inst.miktar || 0) > inst.islenebilirMiktar)
			throw { isError: true, rc: 'hataliDeger', errorText: `<b>Miktar</b> değeri <u>${inst.islenebilirMiktar}</u>'dan büyük olamaz` }
		if (!inst.hatKod)
			throw { isError: true, rc: 'hataliDeger', errorText: `<b>Hat</b> belirtilmelidir` }
	}
}
