class DMQRapor extends DMQSayacliKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, 'rapor'] }
	static get kodListeTipi() { return 'DMQRAPOR' } static get sinifAdi() { return 'Rapor' } static get table() { return '' } static get tableAlias() { return 'rap' }
	static get tanimlanabilirmi() { return true } static get silinebilirmi() { return true } static get kodKullanilirmi() { return false }
	static get tanimUISinif() { return ModelTanimPart } static get secimSinif() { return Secimler }
	get attrSet() { const result = {}; for (const selector of ['grup', 'icerik']) { $.extend(result, asSet(Object.keys(this[selector]))) } return result }
	get secilenVarmi() { return !!(Object.keys(this.grup).length || Object.keys(this.icerik).length) }
	constructor(e) {
		e = e || {}; super(e); const {isCopy} = e; this.rapor = e.rapor?.main ?? e.rapor;
		$.extend(this, { grup: e.grupListe ?? e.grup, icerik: e.icerikListe ?? e.icerik, ozetMax: e.ozetMax ?? 5 });
		if (!isCopy) {
			for (const key of ['grup', 'icerik']) {
				let value = this[key], orjValue = value; if ($.isArray(value)) { value = asSet(value) }
				if (value == null) { value = {} } if (value != orjValue) { this[key] = value }
			}
		}
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); const rfb = e.rootBuilder, tanimForm = e.tanimFormBuilder;
		const {inst} = e, {rapor, ozetMax} = inst, {tabloYapi} = rapor, {kaListe} = tabloYapi;
		const kaDict = {}; for (const ka of kaListe) { kaDict[ka.kod] = ka }
		const _inst = { listStates: {}, ozetMax, get ozetAttr() { return this.listStates.grup[0] } };
		const tumAttrSet = asSet(Object.keys(kaDict)); for (const selector of ['grup', 'icerik']) {
			let keys = inst[selector]; if (keys != null) { keys = Object.keys(keys) }
			_inst.listStates[selector] = keys ?? [] /*for (const key of keys) { delete tumAttrSet[key] }*/
		}
		const getKalanlarSource = selector => {
			const {listStates} = _inst, digerAttrSet = asSet([...(listStates.grup || []), ...(listStates.icerik || [])]);
			const tabloYapiItems = selector ? tabloYapi[selector] : null;
			return Object.keys(tumAttrSet).filter(attr => !digerAttrSet[attr] && (!tabloYapiItems || tabloYapiItems[attr]))
		}
		const className_listBox = 'listBox', ustHeight = '50px', contentTop = '13px';
		const solWidth = '200px', ortaWidth = '200px', sagWidth = '100px', ortaHeight = 'calc((var(--full) / 2) - 5px)';
		tanimForm.addStyle(e => `$elementCSS { --ustHeight: ${ustHeight} }`);
		let fbd_content = tanimForm.addFormWithParent('content').yanYana().setAltInst(_inst).addStyle_fullWH(null, 'calc(var(--full) - var(--ustHeight) - var(--top) + 8px)').addStyle([e =>
			`$elementCSS { --top: ${contentTop}; position: relative; top: var(--top); z-index: 100 }
			 $elementCSS > div .${className_listBox} { --label-height: 30px; --label-margin-bottom: 20px }
			 $elementCSS > div .${className_listBox} > label { font-size: 180%; color: #999; height: var(--label-height); padding-bottom: var(--label-margin-bottom) }
			 $elementCSS > div .${className_listBox} > :not(label) { vertical-align: top; height: calc(var(--full) - var(--label-height) - var(--label-margin-bottom)) !important }
			 $elementCSS > div .${className_listBox} > .jqx-listbox .jqx-listitem-element { font-size: 110% }`]);
		const initListBox = e => {
			const {builder} = e, {id, altInst, input, userData} = builder, selector = userData?.selector; let {source} = e;
			if (source == null) { source = (id.startsWith('kalanlar') ? getKalanlarSource(selector) : altInst[id] ?? []).map(kod => kaDict[kod]) }
			if (source?.length && typeof source[0] != 'object') { source = source.map(kod => new CKodVeAdi({ kod, aciklama: kod })) }
			const kalanlarSourceDuzenlenmis = _source => {
				_source = [..._source, ...(new Array(10).fill(null).map(x => ({ /*group: ' ',*/ disabled: true })))];
				/*for (const item of _source) {
					const kod = item?.kod; if (kod == null) { continue }
					item.group = `${tabloYapi.grup[kod] ? '- Grup -' : tabloYapi.toplam[kod] ? '- Toplam -' : ''}`
				}*/
				return _source
			}
			if (id.startsWith('kalanlar')) { source = kalanlarSourceDuzenlenmis(source) }
			const width = '100%', height = width, valueMember = 'kod', displayMember = 'aciklama';
			const allowDrop = true, allowDrag = allowDrop, autoHeight = false, itemHeight = 36, scrollBarSize = 20, filterable = true, filterHeight = 40, filterPlaceHolder = 'Bul';
			input.prop('id', id); if (selector != null) { input.data('selector', selector) }
			input.jqxListBox({ theme, width, height, valueMember, displayMember, source, allowDrag, allowDrop, autoHeight, itemHeight, scrollBarSize, filterable, filterHeight, filterPlaceHolder });
			const changeHandler = evt => {
				const target = evt.currentTarget, type = evt.args?.type, {id} = target;
				if (id.startsWith('kalanlar')) {
					if (!type || type == 'none') {
						clearTimeout(this._timer_kalanlarTazele);
						this._timer_kalanlarTazele = setTimeout(() => {
							try { $(target).jqxListBox('source', kalanlarSourceDuzenlenmis(getKalanlarSource(input.data('selector')).map(kod => kaDict[kod]))) }
							finally { delete this._timer_kalanlarTazele }
						}, 1)
					}
				}
				else { let items = $(target).jqxListBox('getItems'); _inst.listStates[id] = items.map(item => item.value) }
			};
			input.on('change', changeHandler); input.on('dragEnd', changeHandler);
			setTimeout(input => input.jqxListBox('render'), 1, input)
		};
		let fbd_sol = fbd_content.addFormWithParent('sol').altAlta().addStyle_fullWH(solWidth);
		let fbd_tabs = fbd_sol.addTabPanel('kalanlar').addStyle_fullWH().setAltInst(_inst.listStates).tabPageChangedHandler(e => {
			for (const fbd_tabPage of e.builder.builders) {
				const {input} = fbd_tabPage.builders[0]; if (input?.length) { setTimeout(input => input.jqxListBox('render'), 1, input) } }
		});
		fbd_tabs.addTab('grup', 'Grup').addStyle_fullWH().addDiv('kalanlar_grup').setEtiket('Kalanlar').addCSS(className_listBox).addStyle_fullWH().setUserData({ selector: 'grup' }).onAfterRun(e => initListBox(e));
		fbd_tabs.addTab('toplam', 'Toplam').addStyle_fullWH().addDiv('kalanlar_toplam').setEtiket('Kalanlar').addCSS(className_listBox).addStyle_fullWH().setUserData({ selector: 'toplam' }).onAfterRun(e => initListBox(e));
		let fbd_orta = fbd_content.addFormWithParent('orta').altAlta().addStyle_fullWH(ortaWidth);/*.addStyle(e => `$elementCSS { position: absolute; right: 0 }`);*/
		fbd_orta.addDiv('grup').setEtiket('Grup').addCSS(className_listBox).addStyle_fullWH(null, ortaHeight).setAltInst(_inst.listStates).onAfterRun(e => initListBox(e));
		fbd_orta.addDiv('icerik').setEtiket('İçerik').addCSS(className_listBox).addStyle_fullWH(null, ortaHeight).setAltInst(_inst.listStates).onAfterRun(e => initListBox(e));
		let fbd_sag = fbd_content.addFormWithParent('sag').altAlta().addStyle_fullWH(sagWidth); fbd_sag.addNumberInput('ozetMax', 'En Yüksek İlk ... kayıt')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'tipkod', text: 'Tip', genislikCh: 10 }), new GridKolon({ belirtec: 'tipadi', text: 'Tip Adı', genislikCh: 20, sql: 'ctip.aciklama' }),
			new GridKolon({ belirtec: 'bolgekod', text: 'Bölge', genislikCh: 10, }), new GridKolon({ belirtec: 'bolgeadi', text: 'Bölge Adı', genislikCh: 25, sql: 'bol.aciklama' }),
			new GridKolon({ belirtec: 'cistgrupkod', text: 'İst. Grup', genislikCh: 10 }), new GridKolon({ belirtec: 'cistgrupadi', text: 'İst. Grup Adı', genislikCh: 20, sql: 'cigrp.aciklama' })
		)
	}
	static yeniInstOlustur(e) {
		const inst = super.yeniInstOlustur(e), args = e.args || {}, {rapor} = args;
		if (inst && rapor) { inst.rapor = rapor } return inst
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {hv} = e, liste2HV = value => {
			if (value && typeof value == 'object' && !$.isArray(value)) { value = Object.keys(value) };
			return $.isArray(value) ? value.filter(x => !!x).map(x => x.trim()).join(delimWS) : (value?.trim() || '')
		};
		$.extend(hv, { grupliste: liste2HV(this.grup), icerikliste: liste2HV(this.icerik), ozetmax: this.ozetMax })
	}
	setValues(e) {
		super.setValues(e); const {rec} = e, getListe = value => value ? asSet(value.split(delimWS).filter(x => !!x).map(x => x.trim())) : {};
		$.extend(this, { grup: getListe(rec.grupliste), icerik: getListe(rec.icerikliste), ozetMax: rec.ozetmax })
	}
}
