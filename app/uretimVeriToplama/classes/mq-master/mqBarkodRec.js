class MQBarkodRec extends MQMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Gerçekleme' } static get kodListeTipi() { return 'UBAR' } get gorevmi() { return this._gorevmi ?? !!this.isId } set gorevmi(value) { this._gorevmi = value }
	static get tanimUISinif() { return ModelTanimPart } static get silinebilirmi() { return true } static get bulFormKullanilirmi() { return true }
	static get ozelBelirtecSet() { let result = this._ozelBelirtecSet; if (!result) result = this._ozelBelirtecSet = asSet(['_rowNumber', '_durum', '_degistir', '_sil']); return result }
	static get ozelDurumKodSet() { let result = this._ozelDurumKodSet; if (!result) result = this._ozelDurumKodSet = asSet(['processing', 'changing', 'removed']); return result }
	static get numerikSahalarSet() { let result = this._numerikSahalarSet; if (!result) result = this._numerikSahalarSet = asSet(['oemSayac', 'isId', 'opNo', 'onceOpNo', 'formulSayac']); return result }
	static get anahtarSahalar() { let result = this._anahtarSahalar; if (!result) result = this._anahtarSahalar = $.merge(this.anahtarSahalarBasit, this.ekOzellikSahalar) ;return result }
	static get anahtarSahalarBasit() { let result = this._anahtarSahalarBasit; if (!result) result = this._anahtarSahalarBasit = ['emirNox', 'opNo', 'stokKod', 'tezgahKod', 'perKod', 'paketKod', 'paketIcAdet']; return result }
	static get ekOzellikSahalar() {
		let result = this._ekOzellikSahalar;
		if (!result) {
			const mevcutSet = asSet(this.anahtarSahalarBasit); result = this._ekOzellikSahalar = [];
			for (const rec of Object.values(BarkodKurali_AyrisimAyiracli.hmrBelirtec2Bilgi)) { const {key} = rec; if (!mevcutSet[key]) { mevcutSet[key] = true; result.push(key) } }
		}
		return result
	}
	get anahtarDegeri() {
		const result = []; for (const key of this.class.anahtarSahalarBasit) result.push(this[key] ?? '')
		const ekOzellikler = this.ekOzellikler || {}; for (const key of this.class.ekOzellikSahalar) result.push(ekOzellikler[key] ?? '')
		return result
	}
	get anahtarStr() { return this.anahtarDegeri.join(delimWS) } get asOEMHtml() { const parent = $('<div/>'); this.oemHTMLDuzenle({ parent }); return parent }
	get basTarih() { const {basTS} = this; return basTS?.clearTime ? new Date(basTS).clearTime() : basTS } set basTarih(value) { this.basTS = value?.clearTime ? new Date(value).clearTime() : value }
	get basSaat() { return timeToString(this.basTS) } set basSaat(value) { const {basTS} = this; if (value) { setTime(basTS, asDate(value).getTime()) } }
	get bitTarih() { const {bitTS} = this; return bitTS?.clearTime ? new Date(bitTS).clearTime() : bitTS } set bitTarih(value) { this.bitTS = value?.clearTime ? new Date(value).clearTime() : value }
	get bitSaat() { return timeToString(this.bitTS) } set bitSaat(value) { const {bitTS} = this; if (value) { setTime(bitTS, asDate(value).getTime()) } }

	constructor(e) {
		e = e || {}; super(e); const sabit_hatKod = app.params.config.hatKod || null, resetFlag = e.reset;
		if (e.rec) { e = e.rec } if (resetFlag) { this.reset(e) }
		$.extend(this, {
			_durum: e._durum ?? e.durum ?? this.durum ?? 'new', id: e.id || this.id || newGUID(), serbestmi: e.serbestmi ?? this.serbestmi ?? false, noCheckFlag: e.noCheck ?? e.noCheckFlag ?? false,
			_gorevmi: e.gorevmi, barkod: e.barkod ?? this.barkod, carpan: e.carpan ?? this.carpan, isKapansinmi: e.isKapansinmi ?? false, sonAsamami: e.sonAsamami ?? asBoolQ(e.sonasama),
			oemSayac: e.oemSayac ?? e.oemsayac ?? e.fissayac ?? e.kaysayac ?? this.oemSayac, isId: e.isId || e.isID || e.isid,
			formulSayac: e.formulSayac ?? e.formulsayac, onceOpNo: e.onceOpNo ?? e.onceopno,
			emirNox: e.emirNox ?? e.emirnox ?? this.emirNox, emirTarih: e.emirTarih || e.emirtarih || this.emirTarih,
			opNo: e.opNo || e.opno || this.opNo, opAdi: e.opAdi || e.opadi || this.opAdi,
			stokKod: e.stokKod || e.shKod || e.stokkod || this.stokKod, stokAdi: e.stokAdi || e.shAdi || e.stokadi || this.stokAdi,
			islenebilirMiktar: e.islenebilirMiktar ?? e.islenebilirmiktar, miktar: e.miktar /*?? e.islenebilirmiktar ?? e.islenebilirmiktar */ ?? this.miktar,
			subeKod: e.subeKod ?? e.bizsubekod ?? config.session?.subeKod,
			hatKod: e.hatKod ?? e.hatkod ?? e.ismrkkod ?? this.hatKod ?? sabit_hatKod, hatAdi: e.hatAdi ?? e.hatadi ?? this.hatAdi,
			tezgahKod: e.tezgahKod ?? e.tezgahkod ?? this.tezgahkod, tezgahAdi: e.tezgahAdi ?? e.tezgahadi ?? this.tezgahAdi,
			perKod: e.perKod ?? e.perkod ?? this.perKod, perAdi: e.perAdi ?? e.peradi ?? this.perAdi,
			basTS: inverseCoalesce(e.basTS ?? e.basts, value => asDate(value)) || this.basTS || now(),
			bitTS: inverseCoalesce(e.bitTS ?? e.bitts, value => asDate(value)) || this.bitTS || now(),
			paketKod: (e.paketKod ?? e.paketkod ?? this.paketIcAdet) || '', paketIcAdet: coalesce(coalesce(e.paketIcAdet, this.paketIcAdet), null),
			vardiyaNo: e.vardiyaNo ?? 1, ekOzellikler: e.ekOzellikler ?? this.ekOzellikler ?? {}, iskartalar: e.iskartalar ?? this.iskartalar, kaliteYapi: e.kaliteYapi ?? e.kalite ?? this.kaliteYapi
		});
		let value = e.suAnmi ?? e.suAn ?? e.suan; if (value !== undefined) { this.suAnmi = value }
		if (this.suAnmi == null && !this.noCheckFlag) { this.suAnmi = !!this.gorevmi }
	}
	static async rootFormBuilderDuzenle(e) {
		await super.rootFormBuilderDuzenle(e); const inst = e.inst ?? e.sender?.inst, sabit_hatKod = app.params.config.hatKod || null;
		if (inst) {
			const {formulSayac, opNo, onceOpNo} = inst, ilkOpermi = !onceOpNo; let {_formulSeriDurumu} = inst;
			if (_formulSeriDurumu == null && !!formulSayac) {
				let recs, params = [
					{ name: '@formulSayac', type: 'int', value: formulSayac },
					( opNo ? { name: '@opNo', type: 'int', value: opNo } : null ),
					( onceOpNo ? { name: '@onceOpNo', type: 'int', value: onceOpNo } : null )
				].filter(x => !!x);
				try { recs = await app.sqlExecSP({ query: 'ou_formulSeriDurumu', params }) } catch (ex) { recs = null }
				if ($.isEmptyObject(recs)) { recs = null }
				if (recs) {
					_formulSeriDurumu = { formul: null, hammadde: {} };
					for (const rec of recs) {
						const tipKod = rec.tipkod, stokKod = rec.stokkod;
						if (tipKod == 'F') { _formulSeriDurumu.formul = rec; if (!ilkOpermi && rec.serikurali == 'EL') { rec.serikurali = 'AL' } }
						else if (tipKod == 'H') { const kod2Rec = _formulSeriDurumu.hammadde; kod2Rec[stokKod] = rec }
					}
				}
				inst._formulSeriDurumu = _formulSeriDurumu
			}
			/*if (_formulSeriDurumu?.formul?.serikurali) {
				const subeKod = inst.subeKod ?? '', hatKod = inst.hatKod ?? sabit_hatKod, sent = new MQSent({
					from: 'subeismrk2depo', where: [ { degerAta: subeKod, saha: 'bizsubekod' }, { degerAta: hatKod, saha: 'ismrkkod' } ],
					sahalar: ['depokod', 'hamdepokod', 'ambdepokod']
				});
				inst._depoRec = (await app.sqlExecTekil(sent)) || {}
			}*/
		}
		const style_minWidth = e => `$elementCSS { --width: 400px; min-width: calc(var(--width) / 2) !important }`;
		const rfb = e.rootBuilder, tanimForm = e.tanimFormBuilder;
		rfb.onAfterRun(e => { setTimeout(builder => { const {part} = builder, {fbd_focusPart} = part; if (fbd_focusPart?.input) fbd_focusPart.input.focus() }, 100, e.builder) })
			.addStyle(e => `$elementCSS { --oemBilgi-height: 38px !important }`)
		rfb.vazgecIstendi = async e => { let rdlg = await ehConfirm('Ekrandan kapatılacak, devam edilsin mi?', e.parentPart?.title); if (rdlg !== true) throw { isError: true, rc: 'userAbort' } };
		tanimForm.addFormWithParent('oemBilgi').onAfterRun(e => { const {builder} = e, {layout, altInst} = builder; altInst.oemHTMLDuzenle({ parent: layout }) })
			.addStyle_fullWH({ height: 'var(--oemBilgi-height)' })
			.addStyle(e => `$elementCSS { position: relative; z-index: 1001; pointer-events: none; margin-top: -48px }`);
		let parentForm = tanimForm.addFormWithParent().altAlta().addCSS('full-wh').addStyle(...[e => `$elementCSS {
		   --margin-left: 15px; width: calc(var(--full) - var(--margin-left) * 2) !important;
			margin: calc(var(--islemTuslari-height) / 4) var(--margin-left) !important; height: calc(var(--full) - var(--oemBilgi-height))
		}`]);
		let form = parentForm.addFormWithParent('hat');
		const fbd_ddHat = form.addModelKullan({ id: 'hatKod', mfSinif: MQHat }).dropDown().addStyle(style_minWidth)
			/*.setVisibleKosulu(e => { const {altInst} = e.builder; return altInst.hatKod ? 'jqx-hidden' : true })*/
			.degisince(e => e.builder.parentBuilder.parentBuilder.id2Builder.diger.id2Builder.tezgahKod?.part?.dataBind() )
		if (sabit_hatKod) { fbd_ddHat.disable() }
		form = parentForm.addFormWithParent('ts').yanYana().addStyle(e => `$elementCSS > div { width: unset !important; margin-inline-end: 30px }`);
		form.addCheckBox('suAnmi', 'Şu an')
			.onAfterRun(e => {
				const {builder} = e, {altInst, input} = builder;
				if (altInst.noCheckFlag || altInst.suAnmi == null) {
					input.prop('indeterminate', true); if (altInst.suAnmi != null) { altInst.suAnmi = null }
					const keys = ['basTS', 'bitTS']; for (const key of keys) { builder.parentBuilder.id2Builder[key].updateVisible() }
				}
			})
			.degisince(e => {
				const {builder} = e, {id, parentBuilder} = builder, {id2Builder} = parentBuilder;
				for (const subBuilder of Object.values(id2Builder)) { if (subBuilder.id != id) subBuilder.updateVisible() }
			});
		let _form = form.addFormWithParent('basTS').setVisibleKosulu(e => { const {altInst} = e.builder; return altInst.gorevmi ? 'jqx-hidden' : altInst.suAnmi === false ? true : 'basic-hidden' });
		_form.addDateInput('basTarih', 'Baş. Tarih');
		_form.addTimeInput('basSaat', '');
		_form = form.addFormWithParent('bitTS').setVisibleKosulu(e => { const {altInst} = e.builder; return altInst.suAnmi === false ? true : 'basic-hidden' });
		_form.addDateInput('bitTarih', 'Bit. Tarih')
		_form.addTimeInput('bitSaat', '');
		const fbd_miktar = form.addNumberInput({ id: 'miktar', etiket: 'Miktar', maxLength: 10 }).addStyle_wh(150)
			.degisince(e => { const input = e.builder.input[0]; input.setCustomValidity(''); input.reportValidity() })
			.onAfterRun(e => {
				const {builder} = e, {input, altInst, rootPart} = builder, {miktar, islenebilirMiktar} = altInst; rootPart.fbd_focusPart = builder;
				if (!input.val()) input.val(null); input.attr('placeholder', miktar ? miktar : islenebilirMiktar);
				input.on('input', evt => {
					const elm = evt.currentTarget; let value = asFloat(elm.value);
					if (islenebilirMiktar && value > islenebilirMiktar) value = islenebilirMiktar
					value = Math.max(asFloat(value), 0); if (elm.value !== value) elm.value = value
				});
				input.on('focus', evt => { const elm = evt.currentTarget; let value = asFloat(elm.value); if (!islenebilirMiktar) { elm.placeholder = value } elm.dataset.lastvalue = value; elm.value = null });
				input.on('blur', evt => { const elm = evt.currentTarget; let value = asFloat(elm.value); if (!value) value = elm.value = elm.dataset.lastvalue ?? null })
			});
		form.addNumberInput('vardiyaNo', 'Vardiya No').addStyle_wh(50);
		form.addCheckBox('isKapansinmi', 'Oper Kapansın')/*.onInit(e => { const {builder} = e, {altInst} = builder; if (!altInst.serbestmi) { builder.etiket = 'Oper Kapansın' } })*/
			.setVisibleKosulu(e => { const {altInst} = e.builder; return altInst.gorevmi || altInst.serbestmi ? 'jqx-hidden' : true });
		form = parentForm.addFormWithParent('diger').yanYana(2.3);
		form.addButton('tezgaKkod_listedenSec', '', 'L').etiketGosterim_yok()
			.setVisibleKosulu(e => { const {altInst} = e.builder; return altInst.gorevmi ? 'jqx-hidden' : true })
			.onClick(e => { e.builder.parentBuilder.id2Builder.tezgahKod.part.listedenSecIstendi() })
			.addStyle(e => `$elementCSS { min-width: unset !important; margin-top: 15px }`).addStyle_wh({ width: 70, height: 45 });
		form.addModelKullan({ id: 'tezgahKod', mfSinif: MQTezgah }).comboBox().autoBind().etiketGosterim_placeholder()
			.addStyle(style_minWidth).addStyle(e => `$elementCSS > label { display: none } $elementCSS > div { margin-top: 15px }`)
			.setVisibleKosulu(e => { const {altInst} = e.builder; return altInst.gorevmi ? 'jqx-hidden' : true })
			.ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e, {altInst} = builder, {hatKod} = altInst;
				if (hatKod) { for (const sent of stm.getSentListe()) { sent.where.degerAta(hatKod, `${aliasVeNokta}ismrkkod`) } }
			})
			.degisince(e => {
				const {item, builder} = e, kod = e.value, {altInst} = builder, fbd_hatKod = builder.parentBuilder.parentBuilder.id2Builder.hat.id2Builder.hatKod;
				altInst.tezgahAdi = item?.aciklama; const hatKod = item?.ismrkkod; if (hatKod /*&& !altInst.hatKod*/) { fbd_hatKod.value = hatKod }
			})
			.onAfterRun(e => { const {id, altInst, part} = e.builder; if (!altInst.serbestmi && altInst[id]) part.disable() })
		form.addButton('perKod_listedenSec', '', 'L').etiketGosterim_yok()
			.setVisibleKosulu(e => { const {altInst} = e.builder; return altInst.gorevmi ? 'jqx-hidden' : true })
			.onClick(e => { e.builder.parentBuilder.id2Builder.perKod.part.listedenSecIstendi() })
			.addStyle(e => `$elementCSS { min-width: unset !important; margin-top: 15px }`).addStyle_wh({ width: 70, height: 45 });
		form.addModelKullan({ id: 'perKod', mfSinif: MQPersonel }).comboBox().autoBind().etiketGosterim_placeholder()
			.addStyle(style_minWidth).addStyle(e => `$elementCSS > label { display: none } $elementCSS > div { margin-top: 15px }`)
			.setVisibleKosulu(e => { const {altInst} = e.builder; return altInst.gorevmi ? 'jqx-hidden' : true })
			.degisince(e => { const {value, item, builder} = e, {altInst} = builder; altInst.perAdi = item?.aciklama })
			.onAfterRun(e => { const {id, altInst, part} = e.builder; if (!altInst.serbestmi && altInst[id]) part.disable() });
		const {belirtec2Bilgi} = HMRBilgi; if (!$.isEmptyObject(belirtec2Bilgi)) {
			/*parentForm.addBaslik({ etiket: 'HMR' }).addStyle(e => `$elementCSS { margin-top: 10px }`);*/
			form = parentForm.addFormWithParent('hmr').yanYana(1.3); /*.setVisibleKosulu(e => !e.builder.altInst.gorevmi);*/
			const {belirtec2Bilgi} = HMRBilgi, hmrEtiketDict = app.params.stokGenel?.hmrEtiket || {};
			for (const [belirtec, rec] of Object.entries(belirtec2Bilgi)) {
				const {ioAttr, numerikmi, kami, mfSinif} = rec, etiket = hmrEtiketDict.etiket || rec.etiket; let fbd;
				if (kami && mfSinif) { fbd = form.addModelKullan(ioAttr, etiket).setMFSinif(mfSinif).addStyle_wh(300) }
				else { fbd = form[numerikmi ? 'addNumberInput' : 'addTextInput'](ioAttr, etiket).addStyle_wh(130) }
				if (fbd) { fbd.setAltInst(e => e.builder.inst.ekOzellikler) }
			}
		}
		const form_seriNo = parentForm.addFormWithParent().yanYana(1.1)
			.setVisibleKosulu(e => {
				const formulSeriDurumu = e.builder.altInst._formulSeriDurumu;
				if (formulSeriDurumu) { if (!$.isEmptyObject(formulSeriDurumu.hammadde)) { return true } else if (formulSeriDurumu.formul?.serikurali) { return true } }
				return 'jqx-hidden'
			})
			.addStyle(e => `$elementCSS { margin: 15px 0 } $elementCSS > * { margin-inline-end: 10px }`);
		form_seriNo.addButton('seriNo_listedenSec', '', 'L').etiketGosterim_normal()
			.onClick(async e => {
				const {builder} = e, {altInst, rootPart} = builder, {noCheckFlag} = altInst;
				if (asFloat(altInst.miktar) <= 0) {
					// try { await hConfirm('Miktar girilmeden Seri seçilemez', 'Seri Seçimi') } catch (ex) { }
					const input = fbd_miktar.input[0]; input.setCustomValidity('Miktar girilmeden Seri seçilemez');
					setTimeout(() => { input.focus(); input.reportValidity(); setTimeout(() => input.setCustomValidity(''), 5000) }, 1); return
				}
				MQSeriNo.listeEkraniAc({
					sender: rootPart, args: { parentRec: altInst }, secinceKontroluYapilmaz: true,
					secince: async e => {
						const {sender} = e, miktar = asFloat(altInst.miktar), seriNoRecs = altInst._seriNoRecs = Object.values(sender.key2SeriNoRecs || {});
						const stokKodSet = asSet(altInst._formulSeriDurumu?.hammadde), stokKod2Recs = {};
						for (const {parentRec, rec} of seriNoRecs) { const {stokKod} = parentRec; (stokKod2Recs[stokKod] = stokKod2Recs[stokKod] || []).push(rec) }
						if (!noCheckFlag) {
							for (const stokKod in stokKodSet) {
								const recs = stokKod2Recs[stokKod] || [];
								if (recs.length != miktar) { hConfirm(`<b>${stokKod}</b> için seçilen seri adedi, Miktar(<b>${miktar}</b>) kadar olmalıdır`, sender.title); return false }
							}
						}
						const arastirStokKodlar = seriNoRecs.map(recBilgi => recBilgi.parentRec).filter(rec => rec && (rec.stokKod ?? rec.stokkod) && !(rec.stokAdi ?? rec.stokadi)).map(rec => rec.stokKod ?? rec.stokkod);
						const arastirOpNolar = seriNoRecs.map(recBilgi => recBilgi.parentRec).filter(rec => rec && (rec.opNo ?? rec.opno) && !(rec.opAdi ?? rec.opadi)).map(rec => rec.opNo ?? rec.opno);
						const stokKod2Adi = {}, stokRecs = ( $.isEmptyObject(arastirStokKodlar) ? null : await app.getMQRecs({ mfSinif: MQStok, idListe: arastirStokKodlar }).promise );
						const opNo2Adi = {}, opRecs = ( $.isEmptyObject(arastirOpNolar) ? null : await app.getMQRecs({ mfSinif: MQOperasyon, idListe: arastirOpNolar }).promise );
						for (const rec of stokRecs || []) stokKod2Adi[rec.kod] = rec.aciklama
						rootPart.fbd_seriNoBilgi.input.html(
							`<div class="items full-wh">` +
								seriNoRecs.map(recInfo => {
									const {rec, parentRec} = recInfo, yerKod = rec.yerkod ?? parentRec?.yerKod, seriNo = rec?.serino;
									let stokAdi = parentRec?.stokAdi ?? parentRec.stokadi; const stokKod = (parentRec?.stokKod ?? parentRec?.stokkod); let stokText = stokAdi || stokKod;
									if (!stokAdi && stokKod) { stokAdi = stokKod2Adi[stokKod]; if (stokAdi) stokText = stokAdi }
									let opAdi = parentRec?.opAdi ?? parentRec.opadi; const opNo = (parentRec?.opNo ?? parentRec?.opno); let opText = opAdi ? `<b>${opNo}</b> - ${opAdi}` : opNo;
									if (!opAdi && opNo) { opAdi = opNo2Adi[opNo]; if (opAdi) opText = `<b>${opNo}</b> - ${opAdi}` }
									return (
										`<div class="item float-left">` +
											`<span class="seriNo">${seriNo || ''}</span>` +
											( opText ? `<span class="ek-bilgi">(</span><span class="opAdi">${opText || ''}</span> <span class="ek-bilgi">)</span>` : '' ) +
											( stokText ? `<span class="ek-bilgi">: </span> <span class="urunAdi">${stokText || ''}</span>` : '' ) +
										`</div>`
									)
								}).join('') +
							`</div>`
						)
					}
				})
			})
			.setVisibleKosulu(e => { const formulSeriDurumu = e.builder.altInst._formulSeriDurumu; return !$.isEmptyObject(formulSeriDurumu?.hammadde) ? true : 'jqx-hidden' })
			.addStyle(e => `$elementCSS { min-width: unset !important }`)
			.addStyle_wh({ width: 70, height: 45 })
		const form_seriNoBilgi_parent = form_seriNo.addFormWithParent('seriNoBilgi_parent').altAlta()
		form_seriNoBilgi_parent.addDiv('serbestSeriler', 'Elle Seri Girişi')
			.setVisibleKosulu(e => {
				const {altInst} = e.builder, {noCheckFlag, onceOpNo} = altInst, ilkOpermi = !onceOpNo, formulSeriDurumu = altInst._formulSeriDurumu;
				return !noCheckFlag && formulSeriDurumu?.formul?.serikurali == 'EL' && ilkOpermi ? true : 'jqx-hidden'
			})
			.onBuildEk(e => {
				const {builder} = e; const {altInst} = builder; let {input} = builder, jqxSelector = 'jqxComboBox';
				input = builder.input = input[jqxSelector]({ theme: theme, width: '100%', height: 70, multiSelect: true });
				// const internalInput = input[jqxSelector]('input');
				input.on('keyup', evt => {
					const key = evt.key?.toLowerCase(); if (!(key == 'enter' || key == 'linefeed')) { return }
					const gerMiktar = asFloat(altInst.miktar) || 0, input = $(evt.currentTarget), widget = input[jqxSelector]('getInstance');
					if (widget.getSelectedItems().length >= gerMiktar) {
						const internalInput = input[jqxSelector]('input')[0]; let blurHandler
						blurHandler = evt => { $(internalInput).off('blur', blurHandler); setTimeout(() => { internalInput.setCustomValidity(''); internalInput.reportValidity() }, 1) };
						$(internalInput).on('blur', blurHandler);
						internalInput.setCustomValidity(`Seri No sayısı Gerçekleme Miktarı(${gerMiktar}) değerinden fazla olamaz`); internalInput.reportValidity();
						return
					} 
					widget.addItem(widget.input.val()); widget.selectIndex(widget.getItems().length - 1)
				});
				input.on('change', evt => {
					const {altInst} = builder, input = $(evt.currentTarget), widget = input[jqxSelector]('getInstance'), timerKey = 'timer_serbestSeriNo_addItem';
					clearTimeout(altInst[timerKey]); altInst[timerKey] = setTimeout(() => {
						try { const liste = altInst._serbestSeriNolar = widget.getSelectedItems().map(rec => rec.value); console.debug(liste) }
						finally { delete altInst[timerKey] }
					}, 1);
				})
			})
			.addStyle(...[
				e => `$elementCSS { margin-bottom: 10px }`,
				e => `$elementCSS > .jqx-widget .jqx-widget-content { font-size: 100%; vertical-align: top !important; padding-top: 0 !important }`,
				e => `$elementCSS > .jqx-widget .jqx-widget-content .jqx-combobox-multi-item { font-size: 100% !important; color: #eee !important; background: royalblue !important; margin: 3px 3px !important; padding: 5px 13px !important }`,
				e => `$elementCSS > .jqx-widget .jqx-widget-content .jqx-combobox-multi-item > a { margin-right: 13px !important; padding-top: 0 !important }`,
				e => `$elementCSS > .jqx-widget .jqx-widget-content .jqx-combobox-multi-item > a + div > .jqx-icon-close { background-image: url(${webRoot}/images/close.png) !important }`
			]);
		form_seriNoBilgi_parent.addDiv('seriNoBilgi', `<span class="bold" style="color: #999">Seri No</span>`)
			.onAfterRun(e => { const {builder} = e, {rootPart, altInst, input} = builder; input.addClass('full-wh'); rootPart.fbd_seriNoBilgi = builder })
			.setVisibleKosulu(e => {
				const {altInst} = e.builder, {noCheckFlag} = altInst, formulSeriDurumu = altInst._formulSeriDurumu;
				return !(noCheckFlag || $.isEmptyObject(formulSeriDurumu?.hammadde)) ? true : 'jqx-hidden'
			})
			.addStyle_wh({ height: 80 })
			.addStyle(...[
				e => `$elementCSS > div { border: 1px solid #aaa; padding: 5px 10px; overflow-y: auto !important }`,
				e => `$elementCSS > div > .items > .item { margin-inline-end: 10px; margin-block-end: 10px }`,
				e => `$elementCSS > div > .items > .item .seriNo { font-weight: bold; color: royalblue }`,
				e => `$elementCSS > div > .items > .item .urunAdi { color: #888 }`
			]);
		parentForm.addForm('resimForm', e => $(`<div id="resimForm" class="full-width dock-bottom" style="margin-top: 10px; padding: 5px"/>`))
			.setVisibleKosulu(e => !!e.builder.altInst.stokKod)
			.onAfterRun(e => {
				const {builder} = e, content = builder.layout, {altInst} = builder, {stokKod} = altInst; if (!stokKod) { return }
				const url = app.getWSUrl({ wsPath: 'ws/genel', api: 'stokResim', args: { id: stokKod } });
				ajaxGet({ dataType: 'text', url }).then(result => {
					if (!result?.trim()) return
					const layout = app.getLayout({ selector: '#skyResim.part' }); layout.appendTo(content); layout.addClass('full-wh');
					const images = altInst._images = [url];
					for (let i = 1; i < 10; i++) {
						const _url = app.getWSUrl({ wsPath: 'ws/genel', api: 'stokResim', args: { id: `${stokKod}-${i.toString().padStart(2, '0')}` } });
						images.push(_url)
					}
					const part = builder.part = new SkyResimPart({ layout, images }); part.run()
				})
			})
	}
	uiKaydetOncesiIslemler(e) {
		super.uiKaydetOncesiIslemler(e); const {inst} = e, {noCheckFlag} = inst;
		if (!noCheckFlag) {
			if ((inst.miktar || 0) <= 0) throw { isError: true, rc: 'hataliDeger', errorText: `<b>Miktar</b> 0'dan büyük bir sayı olmalıdır` }
			if ((inst.islenebilirMiktar || 0) > 0 && (inst.miktar || 0) > inst.islenebilirMiktar) throw { isError: true, rc: 'hataliDeger', errorText: `<b>Miktar</b> değeri <u>${inst.islenebilirMiktar}</u>'dan büyük olamaz` }
			if (!inst.hatKod) throw { isError: true, rc: 'hataliDeger', errorText: `<b>Hat</b> belirtilmelidir` }
		}
	}
	oemHTMLDuzenle(e) { e = e || {}; e.rec = this; return MQOEM.oemHTMLDuzenle(e) }
	asJSON(e) {
		e = e || {}; return {
			_durum: this._durum ?? '', id: this.id || newGUID(), serbestmi: this.serbestmi, isId: this.isId || null,
			barkod: this.barkod, carpan: this.carpan, gerSayac: this.gerSayac || null, oemSayac: this.oemSayac || null,
			emirNox: this.emirNox, emirTarih: this.emirTarih, opNo: this.opNo || null, opAdi: this.opAdi, stokKod: this.stokKod, stokAdi: this.stokAdi,
			miktar: this.miktar, subeKod: this.subeKod,
			hatKod: this.hatKod, hatAdi: this.hatAdi, tezgahKod: this.tezgahKod, tezgahAdi: this.tezgahAdi, perKod: this.perKod, perAdi: this.perAdi,
			basTS: inverseCoalesce(this.basTS, value => dateTimeToString(value)), bitTS: inverseCoalesce(this.bitTS, value => dateTimeToString(value)),
			paketKod: this.paketKod, paketIcAdet: this.paketIcAdet, vardiyaNo: this.vardiyaNo, sonAsamami: this.sonAsamami ?? null,
			ekOzellikler: this.ekOzellikler, iskartalar: this.iskartalar, kaliteYapi: this.kaliteYapi,
		}
	}
	async getQueryYapi(e) {
		const {gorevmi, suAnmi, isKapansinmi} = this, ekOzellikler = this.ekOzellikler || {}, stokGenelParam = app.params.stokGenel;
		const {stokKod, opNo, onceOpNo, sonAsamami, oemSayac} = this, ilkOpermi = !onceOpNo, seriNoRecs = this._seriNoRecs, serbestSeriNolar = this._serbestSeriNolar;
		const miktar = this.miktar ?? 0, bitTS = suAnmi ? null : asDate(this.bitTS);
		const {hmr2Belirtec} = stokGenelParam, hmrListe = HMRBilgi.belirtecListe, hmrBelirtecListe = hmrListe.map(key => hmr2Belirtec[key]).filter(value => !!value);
		const argHMRVeDegerListe = []; for (let [key, value] of Object.entries(ekOzellikler)) {
			if (value == null) { continue } const belirtec = hmr2Belirtec[key]; if (!belirtec) { continue }
			if (value && !isInvalidDate(asDate(value))) { value += ' ' }
			argHMRVeDegerListe.push({ kod1: belirtec, kod2: value })
		}
		if (gorevmi) {
			const params = [
				{ name: '@argIsId', type: 'bigint', value: this.isId },
				(bitTS ? { name: '@argBitts', type: 'datetime', value: dateTimeToString(bitTS) } : null),
				{ name: '@argMiktar', type: 'decimal', value: miktar },
				($.isEmptyObject(hmrBelirtecListe) ? null : { name: '@argHmrListe', type: 'structured', typeName: 'type_strIdList', value: hmrBelirtecListe.map(value => { return { id: value } }) }),
				($.isEmptyObject(argHMRVeDegerListe) ? null : { name: '@argHmrVeriListe', type: 'structured', typeName: 'type_kod12', value: argHMRVeDegerListe }),
				{ name: '@isKapansin', type: 'bit', value: bool2Int(isKapansinmi) }
			].filter(rec => !!rec);
			return ({ query: 'opyon_gerceklemeYap', params: params })
		}
		else {
			const basTS = suAnmi ? null : asDate(this.basTS) || now(), argStokYerVeSeriListe = [], stokVeOpNo2SeriListe = {};
			const {_formulSeriDurumu, vardiyaNo} = this; let seriKurali = _formulSeriDurumu?.formul?.serikurali;
			const serbestSeriZorunlumu = ilkOpermi && seriKurali == 'EL';
			if (serbestSeriZorunlumu && (serbestSeriNolar?.length || 0) < miktar)
				throw { isError: true, rc: 'serbestSerilerBos', errorText: `Serbest Seri Bilgisi <b>Miktar(<span class="royalblue">${numberToString(miktar)}</span>)</b> kadar girilmelidir` }
			if (ilkOpermi && !$.isEmptyObject(serbestSeriNolar)) {
				const yerKod = ''; /* this.yerKod ?? this._depoRec?.depokod; */
				argStokYerVeSeriListe.push(...serbestSeriNolar.map(seriNo => ({ kod1: stokKod, kod2: (opNo || '')?.toString(), kod3: yerKod, kod4: seriNo })))
			}
			if (!$.isEmptyObject(seriNoRecs)) {
				for (const {parentRec, rec} of seriNoRecs) {
					const {stokKod} = parentRec, onceOpNo = parentRec.opNo, yerKod = rec.yerkod || '', seriNo = rec.serino, anah = [stokKod, onceOpNo].join(delimWS);
					argStokYerVeSeriListe.push({ kod1: stokKod, kod2: (onceOpNo || '')?.toString(), kod3: yerKod, kod4: seriNo });
					(stokVeOpNo2SeriListe[anah] = stokVeOpNo2SeriListe[anah] || []).push(seriNo)
				}
			}
			if (seriKurali == 'AL' || seriKurali == 'MT' || seriKurali == 'MS') {
					 /* herhangi bir malzeme için seri miktarı == miktar değilse hata */
				let uygunmu = !$.isEmptyObject(stokVeOpNo2SeriListe);
				if (uygunmu) { for (const seriListe of Object.values(stokVeOpNo2SeriListe || {})) { if (seriListe.length < miktar) { uygunmu = false; break } } }
				if (!uygunmu) { throw { isError: true, rc: 'serilerBos', errorText: `Seri Bilgisi <b>Miktar(<span class="royalblue">${numberToString(miktar)}</span>)</b> kadar seçilmelidir` } }
			}
			if (seriKurali == 'AL' || seriKurali == 'MT' || seriKurali == 'MS' || seriKurali == 'EL') {
				let query = 'ou_seriGirisCakisanlar', seriKontrol_errorList = [];
				const seriNoKontrol = async e => {
					let {stokKod, opNo, seriNoListe} = e; if (opNo) { opNo = asInteger(opNo) }
					const params = [
						{ name: '@argStokKod', type: 'char', value: stokKod },
						( !sonAsamami && opNo ? { name: '@argOpNo', type: 'int', value: opNo } : null ),
						{ name: '@argSeriler', type: 'structured', typeName: 'type_charList', value: seriNoListe.map(kod => ({ kod })) }
					].filter(x => !!x);
					const cakisanSeriNoSet = {}, _recs = await app.sqlExecSP({ query, params }) || [];
					for (const _rec of _recs) { cakisanSeriNoSet[_rec.serino?.trim()] = true }
					if (!$.isEmptyObject(cakisanSeriNoSet)) {
						const errorText = `<div class="darkred">Bazı <b>Seri No</b> bilgileri çakışmaktadır:</div><ul class="errors flex-row" style="margin-top: 10px">${Object.keys(cakisanSeriNoSet).map(x => `<li class="bold royalblue item">${x}</li>`)}</ul>`;
						seriKontrol_errorList.push(errorText); return false
					}
					return true
				};
				if (ilkOpermi && !$.isEmptyObject(serbestSeriNolar)) { const seriNoListe = serbestSeriNolar; await seriNoKontrol({ stokKod, opNo, seriNoListe }) }
				if (!$.isEmptyObject(stokVeOpNo2SeriListe)) {
					for (const [anah, seriNoListe] of Object.entries(stokVeOpNo2SeriListe)) {
						const parts = anah.split(delimWS); const _stokKod = parts[0]; if (_stokKod != stokKod) { continue } /* opNo = this.opNo */
						await seriNoKontrol({ stokKod, opNo, seriNoListe })
					}
				}
				if (!$.isEmptyObject(seriKontrol_errorList)) { const isError = true, errorText = seriKontrol_errorList.join('<p/>'); throw { isError, errorText } }
			}
			const params = [
				(oemSayac ? { name: '@argOemSayac', type: 'bigint', value: oemSayac } : null),
				{ name: '@argKaynakTipi', type: 'char', value: 'VT' },
				{ name: '@argTezgahKod', type: 'char', value: this.tezgahKod || '' },
				{ name: '@argPerKod', type: 'char', value: this.perKod || '' },
				(basTS ? { name: '@argBasts', type: 'datetime', value: dateTimeToString(basTS) } : null),
				(bitTS ? { name: '@argBitts', type: 'datetime', value: dateTimeToString(bitTS) } : null),
				($.isEmptyObject(hmrBelirtecListe) ? null : { name: '@argHmrListe', type: 'structured', typeName: 'type_strIdList', value: hmrBelirtecListe.map(id => ({ id })) }),
				($.isEmptyObject(argHMRVeDegerListe) ? null : { name: '@argHmrVeriListe', type: 'structured', typeName: 'type_kod12', value: argHMRVeDegerListe }),
				/*{ name: '@argLotNo', type: 'char', value: ekOzellikler.lotNo || '' },*/
				{ name: '@argKoli', type: 'smallint', value: this.paketIcAdet || 0 },
				{ name: '@argPaketKod', type: 'char', value: this.paketKod || '' },
				{ name: '@argMiktar', type: 'decimal', value: miktar },
				$.isEmptyObject(argStokYerVeSeriListe) ? null : { name: '@stokYerVeSeriListe', type: 'structured', typeName: 'type_kod1234', value: argStokYerVeSeriListe },
				{ name: '@oemKapansin', type: 'bit', value: bool2Int(isKapansinmi) },
				{ name: '@gerSayac', type: 'bigint', direction: 'output' },
				(vardiyaNo ? { name: '@argVardiyaNo', type: 'smallint', value: asInteger(vardiyaNo) } : null)
			].filter(x => !!x);
			return ({ query: 'ou_gerceklemeYap', params })
		}
	}
	getQueryYapi_iskartalar(e) {
		const {gerSayac, iskartalar} = this; if (!gerSayac || $.isEmptyObject(iskartalar)) return null; const argIskartalar = [];
		if (iskartalar) { for (const kod in iskartalar) argIskartalar.push({ kod: kod, deger: asFloat(iskartalar[kod]) || 0 }) }
		const params = [
			( gerSayac ? { name: '@argGerSayac', type: 'bigint', value: gerSayac } : null ),
			$.isEmptyObject(argIskartalar) ? null : { name: '@argIskartalar', type: 'structured', typeName: 'type_kodVeDegerListe', value: argIskartalar }
		].filter(rec => !!rec);
		return ({ query: 'ou_gerceklemeFireIskartaGuncelle', params })
	}
	getQueryYapi_kalite(e) {
		const {gerSayac, kaliteYapi} = this, {numuneSayisi, recs} = kaliteYapi || {};
		if (!gerSayac || $.isEmptyObject(recs)) return null
		const {subeKod, perKod} = this, seri = 'TAB', numKeyHV = { kod: 'OPERKAL', seri };
		const fisKeyHV = { tipkod: 'OP', bizsubekod: subeKod ?? '', seri }, fisHV = $.extend({}, fisKeyHV, {
			no: new MQSQLConst('@sonNo'), basdurum: 'K', sartlidurum: '',		/* basdurum { K = Kabul } | sartlidurum: Şartlı Kabul ise Nedeni */
			opergersayac: gerSayac, olcumsaati: now(), tarih: today(),
			personelkod: perKod || '', ekrannumunesayisi: numuneSayisi
		}), detHVListe = [];
		for (let i = 0; i < recs.length; i++) {
			const rec = recs[i], hv = {
				fissayac: new MQSQLConst('@fisSayac'), seq: i + 1, olcukod: rec.olcukod,
				sayideger: rec.ortalama || 0, notlar: (rec.notlar || '').slice(0, 120)
			};
			let min, max;
			for (let j = 1; j <= numuneSayisi; j++) {
				const key = `sayideger${j}`, buDeger = hv[key] = rec[key] ||0;
				if (min == null || buDeger < min) min = buDeger
				if (max == null || buDeger > max) max = buDeger
			}
			$.extend(hv, { sonucmindeger: min || 0, sonucmaxdeger: max || 0 });
			detHVListe.push(hv)
		}
		const toplu = new MQToplu().withDefTrn();
		toplu.add(
			`IF NOT EXISTS (`, new MQSent({ from: 'numarator', where: { birlestirDict: numKeyHV }, sahalar: '*' }), `)`,
			new MQInsert({ table: 'numarator', hv: numKeyHV }),
			`WHILE 1 = 1 BEGIN`,
			new MQIliskiliUpdate({ from: 'numarator', where: { birlestirDict: numKeyHV }, set: `sonno = sonno + 1` }),
			new MQSent({ from: 'numarator', where: { birlestirDict: numKeyHV }, sahalar: [`@sonNo = sonno`] }),
			`IF NOT EXISTS (`,
			new MQSent({
				from: 'kalitefis', sahalar: '*',
				where: [ { birlestirDict: fisKeyHV }, { degerAta: new MQSQLConst('@sonNo'), saha: 'no' } ]
			}), `) BREAK`,
			`END`,
			new MQInsert({ table: 'kalitefis', hv: fisHV }),
			new MQSent({
				from: 'kalitefis', sahalar: '@fisSayac = max(kaysayac)',
				where: [ { birlestirDict: fisKeyHV }, { degerAta: new MQSQLConst('@sonNo'), saha: 'no' } ]
			}),
			new MQInsert({ table: 'kalitehar', hvListe: detHVListe })
		)
		const qParams = [
			{ name: '@sonNo', type: 'int', direction: 'output' },
			{ name: '@fisSayac', type: 'int', direction: 'output' }
		];
		return (class extends CObject { run(e) { const {query, params} = this; return app.sqlExecNoneWithResult({ query, params }) } })
					.From({ query: toplu, params: qParams })
	}
	ekBilgileriBelirle_force(e) { e = e || {}; return this.ekBilgileriBelirle($.extend({}, e, { force: true })) }
	ekBilgileriBelirle(e) {
		e = e || {}; const forceFlag = asBool(e.force), promises = [];
		const {oemSayac, emirNox, opNo, stokKod, tezgahKod, perKod} = this;
		if (forceFlag || !oemSayac) {
			if (emirNox && opNo && stokKod) {
				const idListe = [emirNox, opNo, stokKod], anah = idListe.join(MQLocalData.DelimAnah), {promise} = app.getMQRecs({ mfSinif: MQOEM, idListe: [idListe] }) || {};
				if (promise) {
					promises.push(promise); promise.then(recs => {
						const rec = (recs || [])[0], oemSayac = this.oemSayac = rec ? rec[MQOEM.sayacSaha] : null;
						if (rec) { if (this._durum == 'error') this.durum_none() } else if (!this.class.ozelDurumKodSet[this._durum]) this.durum_error()
						if (this._durum == 'error' && !navigator.onLine) this.durum_offline()
					})
				}
			}
		}
		if (emirNox) { const seriVeNo = getSeriVeNo(emirNox), {promise} = app.getMQRecs({ mfSinif: MQEmir, idListe: [[seriVeNo.seri, seriVeNo.no]] }) || {}; if (promise) promises.push(promise) }
		if (opNo) { const {promise} = app.getMQRecs({ mfSinif: MQOperasyon, idListe: [opNo] }) || {}; if (promise) { promises.push(promise); promise.then(recs => { this.opAdi = recs[0].aciklama }) } }
		if (stokKod) { const {promise} = app.getMQRecs({ mfSinif: MQStok, idListe: [stokKod] }) || {}; if (promise) { promises.push(promise); promise.then(recs => { this.stokAdi = recs[0].aciklama }) } }
		if (tezgahKod) { const {promise} = app.getMQRecs({ mfSinif: MQTezgah, idListe: [tezgahKod] }) || {}; if (promise) { promises.push(promise); promise.then(recs => { this.tezgahAdi = recs[0].aciklama }) } }
		if (perKod) { const {promise} = app.getMQRecs({ mfSinif: MQPersonel, idListe: [perKod] }) || {}; if (promise) { promises.push(promise); promise.then(recs => { this.perAdi = recs[0].aciklama }) } }
		if (this._durum == 'error' || this._durum == 'processing') { if (!navigator.onLine) this.durum_offline() }
		return Promise.all(promises)
	}
	reset(e) { this.reset_asil(e); this.reset_diger(e); return this }
	reset_asil(e) {
		$.extend(this, { _durum: 'new', id: newGUID() });
		let keys = ['barkod', 'carpan', 'gerSayac', 'oemSayac', 'isId', 'subeKod', 'formulSayac', 'onceOpNo', 'emirNox', 'opNo', 'stokKod', 'paketKod', 'paketIcAdet', 'sonAsamami'];
		for (const key of keys) { this[key] = null }
		for (const key of ['emirTarih', 'opAdi', 'stokAdi']) { delete this[key] }
		for (const key of ['basTS', 'bitTS']) { let value = this[key]; if (isInvalidDate(value)) value = this[key] = now() }
		this.vardiyaNo = 1;
		$.extend(this, { ekOzellikler: {}, iskartalar: {} }); return this
	}
	reset_diger(e) {
		for (const key of ['formulSayac', 'tezgahKod', 'perKod']) { this[key] = null }
		for (const key of ['tezgahAdi', 'perAdi']) { delete this[key] } return this
	}
	suAn() { this.suAnmi = true; return this } gorev() { this.gorevmi = true; return this } gercekleme() { this.gorevmi = false; return this }
	serbest() { this.serbestmi = true; return this } noCheck() { this.noCheckFlag = true; return this }
	durum_none() { this._durum = ''; return this } durum_new() { this._durum = 'new'; return this } durum_changing() { this._durum = 'changing'; return this }
	durum_removed() { this._durum = 'removed'; return this } durum_offline() { this._durum = 'offline'; return this }
	durum_processing() { this._durum = 'processing'; return this } durum_done() { this._durum = 'done'; return this }
	durum_error() { this._durum = 'error'; return this }
}
