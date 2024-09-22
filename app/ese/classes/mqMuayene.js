class MQMuayene extends MQGuidOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Muayene' }
	static get kodListeTipi() { return 'MUAYENE' } static get table() { return 'esemuayene' } static get tableAlias() { return 'mua' }
	static get ignoreBelirtecSet() { return {...super.ignoreBelirtecSet, ...asSet(['hastaid']) } }
	get tarih() { const {tarihSaat} = this; return tarihSaat?.clearTime ? new Date(tarihSaat).clearTime() : tarihSaat } set tarih(value) { this.tarihSaat = value?.clearTime ? new Date(value).clearTime() : value }
	get saat() { return timeToString(this.tarihSaat) } set saat(value) { const {tarihSaat} = this; if (value) { setTime(tarihSaat, asDate(value).getTime()) } }
	get fisNox() { return [this.seri || '', this.fisNo?.toString()].join('') }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			hastaId: new PInstGuid('hastaid'), tarihSaat: new PInstDateNow('tarihsaat'), seri: new PInstStr('seri'), fisNo: new PInstNum('fisno'),
			doktorId: new PInstGuid('doktorid'), cpt: new PInstBitBool('bcptyapilacak'), ese: new PInstBitBool('beseyapilacak'),
			cptPuani: new PInstNum('cptpuani'), esePuani: new PInstNum('esepuani'), testSifre: new PInstStr('testsifre'), tani: new PInstStr('tani')
		})
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(
			new GridKolon({ belirtec: 'hastaid', text: 'Hasta ID', genislikCh: 40 }), new GridKolon({ belirtec: 'hastaadi', text: 'Hasta Adı', genislikCh: 30, sql: 'has.aciklama' }),
			new GridKolon({ belirtec: 'tarihsaat', text: 'Tarih/Saat', genislikCh: 20 }),
			new GridKolon({ belirtec: 'seri', text: 'Seri', genislikCh: 5, filterType: 'checkedlist' }), new GridKolon({ belirtec: 'fisno', text: 'No', genislikCh: 15, filterType: 'checkedlist' }).tipNumerik(),
			new GridKolon({ belirtec: 'beseyapilacak', text: 'ESE?', genislikCh: 5, filterType: 'checkedlist' }).tipBool(), new GridKolon({ belirtec: 'bcptyapilacak', text: 'CPT?', genislikCh: 5, filterType: 'checkedlist' }).tipBool(),
			new GridKolon({ belirtec: 'esepuani', text: 'ESE Puanı', genislikCh: 13 }).tipDecimal(), new GridKolon({ belirtec: 'cptpuani', text: 'CPT Puanı', genislikCh: 13 }).tipDecimal(),
			new GridKolon({ belirtec: 'tani', text: 'Tanı' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, alias = this.tableAlias;
		sent.fromIliski('esehasta has', `${alias}.hastaid = has.id`);
		sent.sahalar.add(`${alias}.hastaid`, 'has.aciklama hastaadi')
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(2); form.addModelKullan('hastaId', 'Hasta').comboBox().kodsuz().autoBind().setMFSinif(MQHasta);
			form.addDateInput('tarih', 'Tarih'); form.addTimeInput('saat', 'Saat');
			form.addTextInput('seri', 'Seri').setMaxLength(3).addStyle_wh(70).addCSS('center'); form.addNumberInput('fisNo', 'No').setMaxLength(17).addStyle_wh(200);
		form = tabPage_genel.addFormWithParent().yanYana().addStyle(e => `$elementCSS [data-builder-id = 'cpt'] { margin-left: 100px }`);
			form.addCheckBox('ese', 'ESE?'); form.addNumberInput('esePuani', 'ESE Puanı').readOnly().etiketGosterim_placeholder().addStyle_wh(90);
			form.addCheckBox('cpt', 'CPT?'); form.addNumberInput('cptPuani', 'CPT Puanı').readOnly().etiketGosterim_placeholder().addStyle_wh(90);
		form = tabPage_genel.addFormWithParent().altAlta(); form.addTextArea('tani', 'Tanı').setMaxLength(3000).setRows(8)
	}
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { resimsayisi: this.resimSayisi }) }
}
