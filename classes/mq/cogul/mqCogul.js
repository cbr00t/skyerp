class MQCogul extends MQYapi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static _altYapiDictOlustuSet = {}; static _extYapiOlustuSet = {};
	static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, 'parentItem'] } static get parentMFSinif() { return null }
	static get listeSinifAdi() { return null } static get kodListeTipi() { return null }
	static get listeUISinif() { return MasterListePart } static get tanimUISinif() { return null } static get secimSinif() { return Secimler }
	static get sabitBilgiRaporcuSinif() { return MasterRapor } static get ozelSahaTipKod() { return null }
	static get ayrimTipKod() { return null } static get ayrimBelirtec() { return this.tableAlias } static get ayrimTable() { return `${this.tableAlias}ayrim`} static get ayrimTableAlias() { return null } 
	static get tanimlanabilirmi() { return !!this.tanimUISinif } static get silinebilirmi() { return true } static get raporKullanilirmi() { return false } static get silindiDesteklenirmi() { return false }
	static get yerelParamBelirtec() { return this.classKey } static get sayacSahaGosterilirmi() { return false } static get tumKolonlarGosterilirmi() { return false }
	static get gridDetaylimi() { return this.detaylimi } static get ozelTanimIslemi() { return null } static get bulFormKullanilirmi() { return true } static get gereksizTablolariSilYapilirmi() { return true }
	static get kolonDuzenlemeYapilirmi() { return true } static get kolonFiltreKullanilirmi() { return true } static get gridIslemTuslariKullanilirmi() { return $(window).width() >= 700 }
	static get islemTuslari_sagButonlar_ekMarginX() { return $(window).width() < 800 ? 0 : 15 } static get orjBaslik_gridRenderDelayMS() { return null } static get defaultOrjBaslik_gridRenderDelayMS() { return 200 }
	static get orjBaslikListesi_panelGrupAttrListe() { const _e = { liste: [] }; this.orjBaslikListesi_panelGrupAttrListeDuzenle(_e); return _e.liste }
	static get orjBaslikListesi_panelUstSeviyeAttrListe() { const _e = { liste: [] }; this.orjBaslikListesi_panelUstSeviyeAttrListeDuzenle(_e); return _e.liste }
	static get orjBaslikListesi_defaultRowsHeight() { return null } static get orjBaslikListesi_maxColCount() { return 5 }  static get orjBaslikListesi_defaultColCount() { return null } static get noAutoFocus() { return false }
	static get yerelParam() { return app.params.yerel } static get mqGlobals() { return app.mqGlobals = app.mqGlobals || {} } static get mqTemps() { return app.mqTemps = app.mqTemps || {} }
	static get globals() { const {classKey, mqGlobals} = this; return mqGlobals[classKey] = mqGlobals[classKey] || {} } static get temps() { const {classKey, mqTemps} = this; return mqTemps[classKey] = mqTemps[classKey] || {} }
	static get paramGlobals() { const dataKey = this.dataKey || this.classKey, {yerelParam} = this, mfSinif2Globals = yerelParam?.mfSinif2Globals || {}, result = mfSinif2Globals[dataKey] = mfSinif2Globals[dataKey] || {}; return result }
	
	static get altYapiDict() {
		const {_altYapiDictOlustuSet} = MQCogul, {classKey} = this;
		let result = _altYapiDictOlustuSet[classKey] ? this._altYapiDict ?? null : undefined;
		if (result === undefined) { const _e = { liste: {} }; this.altYapiDictDuzenle(_e); result = this._altYapiDict = _e.liste; this.altYapiDictDuzenleSonrasi(_e); _altYapiDictOlustuSet[classKey] = true }
		return result
	}
	static get extYapilar() {
		const {_extYapiOlustuSet} = MQCogul, {classKey} = this;
		let result = _extYapiOlustuSet[classKey] ? this._extYapilar ?? null : undefined;
		if (result === undefined) { const _e = { liste: [] }; this.extYapilarDuzenle(_e); result = this._extYapilar = _e.liste; this.extYapilarDuzenleSonrasi(_e); _extYapiOlustuSet[classKey] = true }
		return result
	}
	
	constructor(e) {
		e = e || {}; super(e); $.extend(this, { ayrimlar: {}, ozelSahalar: {} });
		this.class.getOzelSahaYapilari()			// önbellek oluştur
	}
	static pTanimDuzenle(e) { super.pTanimDuzenle(e) }
	static pTanimDuzenleSonrasi(e) {
		super.pTanimDuzenleSonrasi(e); const {altYapiDict} = this;
		if (altYapiDict) {
			const {pTanim} = e;
			for (const key in altYapiDict) {
				if (pTanim[key]) continue
				const cls = altYapiDict[key]; if (!cls) continue
				if (cls.addSelfToPTanimFlag) pTanim[key] = new PInstClass(cls)
			}
		}
	}
	static pTanimDuzenleSonIslemler(e) {
		super.pTanimDuzenleSonIslemler(e); const {altYapiDict} = this;
		if (altYapiDict) { for (const key in altYapiDict) { const cls = altYapiDict[key]; if (cls.altYapiInit) cls.altYapiInit(e) } }
	}
	pTanim2InstSonrasi(e) {
		e = e || {}; super.pTanim2InstSonrasi(e); const {altYapiDict} = this.class;
		if (altYapiDict) {
			for (const key in altYapiDict) {
				const altInst = this._p[key]?.value;
				if (altInst) {
					if (!('inst' in altInst)) altInst.inst = this /* Object.defineProperty((altInst.class.extmi ? altInst.__proto__ : altInst), 'inst', { get: () => this }) */
					if (altInst.altYapiInit) altInst.altYapiInit(e)
				}
			}
		}
	}
	static extYapilarDuzenle(e) { }
	static extYapilarDuzenleSonrasi(e) { }
	static altYapiDictDuzenle(e) {
		const {extYapilar} = this;
		if (extYapilar) {
			const {liste} = e; for (const cls of extYapilar) liste[`_${cls.classKey}`] = cls
		}
	}
	static altYapiDictDuzenleSonrasi(e) {
		const altYapiDict = e.liste;
		if (altYapiDict) {
			for (const key in altYapiDict) {
				const cls = altYapiDict[key];
				if (cls) { cls.__proto__.mfSinif = this /*if (!('mfSinif' in cls)) cls.__proto__.mfSinif = this; // Object.defineProperty(cls.__proto__, 'mfSinif', { get: () => this }) */ }
			}
		}
	}
	static getEkCSS(e) {
		e = e || {}; let {rec} = e; rec = e.rec = rec?.bounddata ?? rec?.boundrec ?? rec?.boundrow ?? rec;
		if (rec) { const _e = $.extend({}, e, { sender: this, rec, result: [] }); this.ekCSSDuzenle(_e); return _e.result }
	}
	static ekCSSDuzenle(e) {
		this.forAltYapiClassesDo('ekCSSDuzenle', e); const {rec, dataField: belirtec, result} = e, {gonderimTSSaha} = this;
		if (gonderimTSSaha && !!rec[gonderimTSSaha]) { result.push('gonderildi') }
	}
	static listeEkrani_init(e) { this.forAltYapiClassesDo('listeEkrani_init', e) }
	static listeEkrani_afterRun(e) { this.forAltYapiClassesDo('listeEkrani_afterRun', e) }
	static listeEkrani_destroyPart(e) { this.forAltYapiClassesDo('listeEkrani_destroyPart', e) }
	static listeEkrani_activated(e) { this.forAltYapiClassesDo('listeEkrani_activated', e) }
	static listeEkrani_deactivated(e) { this.forAltYapiClassesDo('listeEkrani_deactivated', e) }
	static islemTuslariDuzenle_listeEkrani_ilk(e) { this.forAltYapiClassesDo('islemTuslariDuzenle_listeEkrani_ilk', e) }
	static islemTuslariDuzenle_listeEkrani(e) { this.forAltYapiClassesDo('islemTuslariDuzenle_listeEkrani', e) }
	static async getRootFormBuilder(e) {
		e = e || {}; let tanimFormBuilder = new FBuilder_TanimForm(), rootBuilder = new RootFormBuilder().add(tanimFormBuilder);
		if (rootBuilder) { rootBuilder.noAutoInitLayout() }
		const _e = $.extend({}, e, { mfSinif: this, inst: e.inst, rootBuilder, tanimFormBuilder });
		await this.rootFormBuilderDuzenle(_e); await this.rootFormBuilderDuzenleSonrasi(_e); rootBuilder = _e.rootBuilder; return rootBuilder
	}
	getRootFormBuilder(e) { e = e || {}; e.inst = this; return this.class.getRootFormBuilder(e) }
	static rootFormBuilderDuzenle(e) { }
	static async rootFormBuilderDuzenleSonrasi(e) {
		await this.forAltYapiClassesDoAsync('rootFormBuilderDuzenle', e);
		await this.rootFormBuilderDuzenleSonrasi_ayrimVeOzelSahalar(e)
	}
	static async rootFormBuilderDuzenleSonrasi_ayrimVeOzelSahalar(e) {
		const {etiketGosterim} = e, {ayrimIsimleri} = this;
		if (!$.isEmptyObject(ayrimIsimleri)) {
			const parentBuilder = await this.rootFormBuilderDuzenleSonrasi_ayrimVeOzelSahalar_getParentBuilder($.extend({}, e, { tabPageId: 'ayrim', tabPageEtiket: 'Ayrım' }));
			if (parentBuilder) {
				parentBuilder.addCSS('flex-row'); const {sinifAdi, tableAlias, ayrimTable, ayrimTableAlias} = this;
				for (let i = 0; i < ayrimIsimleri.length; i++) {
					const seq = i + 1, id = seq, ayrimAdi = ayrimIsimleri[i];
					const ayrMFSinif = class extends MQKA {
					    static { window[this.name] = this; this._key2Class[this.name] = this }
						static get sinifAdi() { return ayrimAdi }
						static get table() { return `${ayrimTable}${seq}` }
						static get tableAlias() { return `${ayrimTableAlias}${seq}` }
						static get kodSaha() { return this.sayacSaha }
						static get sayacSaha() { return 'sayac' }
					};
					parentBuilder.add(
						new FBuilder_ModelKullan({
							id, etiket: ayrimAdi, mfSinif: ayrMFSinif, kodSaha: ayrMFSinif.adiSaha,
							etiketGosterim: etiketGosterim, placeHolder: ayrimAdi, altInst: e => e.builder.inst.ayrimlar,
							onChange: e => {
								const {builder, sender, item} = e, kodAttr = e.kodAttr || sender.kodAttr || (sender.mfSinif || ayrMFSinif).kodSaha;
								const value = coalesce((item || {})[kodAttr], e.value); builder.altInst[builder.id] = asInteger(value) || null
							},
							styles: [e => { const prefix = e.builder.getCSSElementSelector(e.builder.layout); return `${prefix} { width: 20% !important; min-width: 120px !important; margin-bottom: 8px !important }` }]
						}).dropDown().kodsuz().bosKodEklenir()
					)
				}
				const lastBuilder = parentBuilder.builders[parentBuilder.builders.length - 1];
				if (lastBuilder)
					lastBuilder.onAfterRun(e => { const {parent} = e.builder; /* const parentElmId = parentBuilder.getElementId(parent); */ setTimeout(() => parent.jqxSortable({ theme: theme, items: `> div` }), 10) })
			}
		}
		const ozelSahaYapilari = await this.getOzelSahaYapilari(e);
		if (!$.isEmptyObject(ozelSahaYapilari)) {
			const parentBuilder = await this.rootFormBuilderDuzenleSonrasi_ayrimVeOzelSahalar_getParentBuilder( $.extend({}, e, { tabPageId: 'ozelSaha', tabPageEtiket: 'Özel Saha' }));
			if (parentBuilder) { for (const ozelSahaGrup of ozelSahaYapilari) parentBuilder.add(ozelSahaGrup.getOzelSahaFormBuilders(e)) }
		}
	}
	static async rootFormBuilderDuzenleSonrasi_ayrimVeOzelSahalar_getParentBuilder(e) {
		let parentBuilder = e.tanimFormBuilder;
		if (parentBuilder) {
			let subBuilder = parentBuilder.builders.find(builder => builder.isTabs);
			if (subBuilder) {
				parentBuilder = subBuilder; const tabPageBuilder = new FBuilder_TabPage({ id: getFuncValue.call(this, e.tabPageId, e), etiket: getFuncValue.call(this, e.tabPageEtiket, e) });
				parentBuilder.add(tabPageBuilder); parentBuilder = tabPageBuilder
			}
		}
		return parentBuilder
	}
	static getFormBuilders(e) { const _e = $.extend(e, { liste: [] }); this.formBuildersDuzenle(_e); return e.liste }
	static formBuildersDuzenle(e) { }
	formBuildersDuzenle(e) { this.class.formBuildersDuzenle(e) }
	static getRootFormBuilder_listeEkrani(e) {
		e = e || {}; let rootBuilder = new RootFormBuilder(); const _e = $.extend({}, e, { mfSinif: this, rootBuilder });
		$.extend(rootBuilder, { part: _e.sender, parent: _e.parent, layout: _e.layout, mfSinif: this });
		this.rootFormBuilderDuzenle_listeEkrani(_e); this.rootFormBuilderDuzenleSonrasi_listeEkrani(_e);
		rootBuilder = _e.rootBuilder; return rootBuilder
	}
	static rootFormBuilderDuzenle_listeEkrani(e) { }
	static rootFormBuilderDuzenleSonrasi_listeEkrani(e) { }
	getRootFormBuilder_listeEkrani(e) { return this.class.getRootFormBuilder_listeEkrani(e) }
	static fbd_listeEkrani_addCheckBox(_rfb, e, _text, _value, _handler, _onAfterRun, _styles) {
		const rfb = _rfb ?? (typeof e == 'object' ? e.rfb ?? e.builder : null);
		const id = typeof e == 'object' ? e.id : e, text = typeof e == 'object' ? e.text : _text;
		const handler = typeof e == 'object' ? e.handler : _handler;
		let value = typeof e == 'object' ? e.value : _value;
		const onAfterRun = typeof e == 'object' ? e.onAfterRun : _onAfterRun;
		const styles = typeof e == 'object' ? e.styles : _styles;
		let fbd = rfb.addForm({
			id: id, parent: e => e.builder.rootPart.islemTuslariPart.sol,
			layout: e => $(`<span id="${id}-parent" class="toggle-parent"><input id="${id}" name="${id}" type="checkbox"/><label for="${id}">${text || ''}</label></span>`)
		});
		fbd.addStyle([
			e => `$builderCSS { position: relative; top: 10px; margin-left: 20px }`,
			e => `$builderCSS > label { font-weight: bold; color: #999; position: relative; top: -5px; margin-left: 5px }`,
			e => `$builderCSS > input:checked + label { color: royalblue }`
		]);
		if (!$.isEmptyObject(styles)) fbd.addStyle(styles)
		fbd.onAfterRun(e => {
			if ($.isFunction(value)) value = getFuncValue.call(this, value, e)
			const {builder} = e, input = builder.layout;
			if (value != null) input.children('input').attr('checked', value)
			/* input.appendTo(builder.parent); */
			if (handler) { input.on('change', evt => { const _e = $.extend({}, e, { event: evt, builder }); getFuncValue.call(this, handler, _e) }) }
			if ($.isFunction(onAfterRun)) getFuncValue.call(this, onAfterRun, e)
		})
		return fbd
	}
	static fbd_listeEkrani_addButton(_rfb, e, _text, _width, _handler, _onAfterRun, _styles) {
		const rfb = _rfb ?? (typeof e == 'object' ? e.rfb ?? e.builder : null);
		const id = typeof e == 'object' ? e.id : e;
		const text = typeof e == 'object' ? e.text : _text;
		let width = (typeof e == 'object' ? e.width : _width) || 130;
		if (typeof width == 'string') width = asFloat(width.slice(0, -2))
		let widthPx = typeof width == 'number' ? `${width}px` : width;
		const handler = typeof e == 'object' ? e.handler : _handler;
		const onAfterRun = typeof e == 'object' ? e.onAfterRun : _onAfterRun;
		const styles = typeof e == 'object' ? e.styles : _styles;
		rfb.islemTuslari_totalWidth = (rfb.islemTuslari_totalWidth || 0) + width;
		const fbd = rfb.addForm(id)
			.setLayout(e => {
				const {builder} = e, {parent} = builder;
				let elmBefore = parent.children('#tazele'); if (!elmBefore?.length) { elmBefore = parent.children('#vazgec') }
				return $(`<button id="${id}">${text}</buton>`).insertBefore(elmBefore)
			})
			.setParent(e => e.builder.rootPart.islemTuslariPart.sag).addCSS('bold')
			.addStyle(
				e => `$elementCSS { position: relative; top: 0px; min-width: unset !important; width: ${widthPx} !important; height: unset }`,
				e => `$elementCSS.jqx-fill-state-normal { background-color: var(--islemTuslari-button-bg-normal) !important; border: none }`
			)
			.onBuildEk(e => {
				const {builder} = e, btn = builder.layout;
				// btn.appendTo(builder.parent);
				btn.jqxButton({ theme: theme, width: false, height: false });
				if (handler) { btn.on('click', evt => { const _e = $.extend({}, e, { event: evt, builder }); getFuncValue.call(this, handler, _e) }) }
			})
			.onAfterRun(e => {
				const {builder} = e, {parent, layout, input} = builder, parentParent = parent.parents('.islemTuslari');
				parentParent.css('--width-sag', `calc((var(--button-right) * ${parent.children().length} + ${widthPx} + ${this.islemTuslari_sagButonlar_ekMarginX}px))`);
				/* input.detach().prependTo(parent); layout.remove(); builder.layout = input;
				input.css('position', 'relative'); input.css('width', widthPx); input.css('height', '47px'); input.css('top', '-10px');
				input.css('background-color', 'unset');*/
				if ($.isFunction(onAfterRun)) { getFuncValue.call(this, onAfterRun, e) }
			});
		if (!$.isEmptyObject(styles)) fbd.addStyle(styles)
		return fbd
	}
	getFormBuilders(e) { e = e || {}; const _e = $.extend(e, { liste: [] }); this.formBuildersDuzenle(_e); return _e.liste; }
	static async formBuilder_getTabPanel(e) {
		e = e || {}; const rfb = await this.getRootFormBuilder(), tanimForm = rfb.builders[0];
		const _e = $.extend({}, e, { tanimFormBuilder: tanimForm }); this.formBuilder_addTabPanel(_e);
		return { rootFormBuilder: rfb, tanimFormBuilder: tanimForm, tabPanel: _e.tabPanel }
	}
	static formBuilder_addTabPanel(e) {
		e = e || {}; const {tabPages} = e;
		const tabPanel = e.tabPanel = new FBuilder_Tabs({
			id: 'tabPanel', afterRun: e => {
				const {builder} = e, id2TabPanel = builder.rootPart.id2TabPanel = {};
				for (let subBuilder of builder.builders) { id2TabPanel[subBuilder.id] = subBuilder }
			}
		});
		tabPanel.addStyle_fullWH(); if (tabPages) { tabPanel.builders = tabPages }
		const {tanimFormBuilder} = e; tanimFormBuilder.add(tabPanel)
	}
	static async formBuilder_getTabPanelWithGenelTab(e) {
		const _e = $.extend({}, e), result = await this.formBuilder_getTabPanel(_e); $.extend(_e, result);
		this.formBuilder_addTabPanelWithGenelTab(_e); $.extend(_e, result); return _e
	}
	static formBuilder_addTabPanelWithGenelTab(e) {
		let {tabPanel} = e; if (!tabPanel) { this.formBuilder_addTabPanel(e); tabPanel = e.tabPanel }
		const id_genel = 'genel'; let tabPage_genel = tabPanel.builders.find(builder => builder.id == id_genel);
		if (!tabPage_genel) { tabPanel.builders.unshift(tabPage_genel = new FBuilder_TabPage({ id: id_genel, etiket: 'Genel' })) }
		tabPage_genel.addStyle_fullWH(); e.tabPage_genel = tabPage_genel
	}
	static get newSecimler() {
		const {secimSinif} = this; if (!secimSinif) { return null }
		const _e = { secimler: new secimSinif() }; _e.secimler.beginUpdate(); this.secimlerDuzenle(_e); this.secimlerDuzenleSon(_e);
		if (_e.secimler) { _e.secimler.endUpdate() }
		return _e.secimler
	}
	static secimlerDuzenle(e) {
		const {secimler: sec} = e; if (this.silindiDesteklenirmi) {
			sec.secimEkle('silindiDurumu', new SecimTekSecim({ etiket: `Çalışma Durumu`, tekSecimSinif: AktifVeDevreDisi }));
			sec.whereBlockEkle(e => {
				const {aliasVeNokta} = this, {where: wh, secimler: sec} = e;
				let value = sec.silindiDurumu.value; if (value) { wh.add(`${aliasVeNokta}silindi ${value == '1' ? '=' : '<>'} ''`) }
			})
		}
	}
	static secimlerDuzenleSon(e) { this.forAltYapiClassesDo('secimlerDuzenle', e) }
	static gridVeriYuklendi(e) { this.forAltYapiClassesDo('gridVeriYuklendi', e) }
	static gridVeriYuklendi_detaylar(e) { this.forAltYapiClassesDo('gridVeriYuklendi_detaylar', e) }
	static orjBaslikListesi_getGroups(e) { const _e = $.extend({}, e, { liste: [] }); this.orjBaslikListesi_groupsDuzenle(_e); return _e.liste }
	static orjBaslikListesi_groupsDuzenle(e) { this.forAltYapiClassesDo('orjBaslikListesi_groupsDuzenle', e) }
	static orjBaslikListesi_panelGrupAttrListeDuzenle(e) { this.forAltYapiClassesDo('orjBaslikListesi_panelGrupAttrListeDuzenle', e) }
	static orjBaslikListesi_panelUstSeviyeAttrListeDuzenle(e) { this.forAltYapiClassesDo('orjBaslikListesi_panelUstSeviyeAttrListeDuzenle', e) }
	static orjBaslikListesi_getHizliBulFiltreAttrListe(e) { const _e = { ...e, liste: [] }; this.orjBaslikListesi_hizliBulFiltreAttrListeDuzenle(_e); return _e.liste }
	static orjBaslikListesi_hizliBulFiltreAttrListeDuzenle(e) { this.forAltYapiClassesDo('orjBaslikListesi_hizliBulFiltreAttrListeDuzenle', e) }
	static orjBaslikListesi_gridInit(e) { this.forAltYapiClassesDo('orjBaslikListesi_gridInit', e) }
	static orjBaslikListesi_argsDuzenle(e) { this.forAltYapiClassesDo('orjBaslikListesi_argsDuzenle', e) }
	static orjBaslikListesi_argsDuzenle_detaylar(e) { this.forAltYapiClassesDo('orjBaslikListesi_argsDuzenle_detaylar', e) }
	static gridTazeleIstendi(e) { return this.forAltYapiClassesDo('gridTazeleIstendi', e) }
	static orjBaslikListesi_recsDuzenle(e) { this.forAltYapiClassesDo('orjBaslikListesi_recsDuzenle', e) }
	static orjBaslikListesi_recsDuzenleSon(e) { this.forAltYapiClassesDo('orjBaslikListesi_recsDuzenleSon', e) }
	static orjBaslikListesi_recsDuzenle_hizliBulIslemi(e) { this.forAltYapiClassesDo('orjBaslikListesi_recsDuzenle_hizliBulIslemi', e) }
	static orjBaslikListesi_getPanelDuzenleyici(e) { return null }
	static orjBaslikListesi_initRowDetails(e) { this.forAltYapiClassesDo('orjBaslikListesi_initRowDetails', e) }
	static orjBaslikListesi_initRowDetails_son(e) { this.forAltYapiClassesDo('orjBaslikListesi_initRowDetails_son', e) }
	static orjBaslikListesi_hizliBulIslemi(e) { this.forAltYapiClassesDo('orjBaslikListesi_hizliBulIslemi', e) }
	static orjBaslikListesi_gridContextMenuIstendi(e) { this.forAltYapiClassesDo('orjBaslikListesi_gridContextMenuIstendi', e) }
	static orjBaslikListesi_gridRendered(e) { this.forAltYapiClassesDo('orjBaslikListesi_gridRendered', e) }
	static orjBaslikListesi_rowExpanded(e) { this.forAltYapiClassesDo('orjBaslikListesi_rowExpanded', e) }
	static orjBaslikListesi_rowCollapsed(e) { this.forAltYapiClassesDo('orjBaslikListesi_rowCollapsed', e) }
	static orjBaslikListesi_groupExpanded(e) { this.forAltYapiClassesDo('orjBaslikListesi_groupExpanded', e) }
	static orjBaslikListesi_groupCollapsed(e) { this.forAltYapiClassesDo('orjBaslikListesi_groupCollapsed', e) }
	static orjBaslikListesi_satirTiklandi(e) { this.forAltYapiClassesDo('orjBaslikListesi_satirTiklandi', e) }
	static orjBaslikListesi_satirCiftTiklandi(e) { this.forAltYapiClassesDo('orjBaslikListesi_satirCiftTiklandi', e) }
	static orjBaslikListesi_hucreTiklandi(e) { this.forAltYapiClassesDo('orjBaslikListesi_hucreTiklandi', e) }
	static orjBaslikListesi_hucreCiftTiklandi(e) { this.forAltYapiClassesDo('orjBaslikListesi_hucreCiftTiklandi', e) }
	static getSubRec(e) { const gridPart = e?.gridPart; return gridPart?.getSubRec(e) }
	static gridCellHandler_ilkIslemler(e) {
		const {gridPart} = e, {gridWidget} = gridPart, evt = e.event ?? e.evt, elm = e.elm = e.elm ?? $(evt.currentTarget), tr = e.tr = e.tr ?? elm.parents('[role = row]');
		const /* rowId = asInteger(tr.attr('row-id')) + 1, */ colIndex = e.colIndex = e.colIndex ?? asInteger(elm.parents('[role = gridcell]').attr('columnindex'));
		/*const colDef = e.colDef = gridPart.duzKolonTanimlari[colIndex], {belirtec} = colDef;*/
		const parentRec = e.parentRec = gridPart.selectedRec, rec = e.rec = this.getSubRec({ parentRec, colIndex, gridPart });
		if (gridPart.cokluSecimFlag) { setTimeout(() => gridWidget.clearselection(), 50) } return e
	}
	static get orjBaslikListesi() { const e = { liste: [] }; this.orjBaslikListesiDuzenle(e); this.orjBaslikDuzenleSonrasi(e); return e.liste }
	static orjBaslikListesiDuzenle(e) { }
	static orjBaslikDuzenleSonrasi(e) {
		this.forAltYapiClassesDo('orjBaslikListesiDuzenle', e); this.orjBaslikListesiDuzenle_ayrimVeOzelSahalar(e);
		if (!this.detaymi) {
			const {gonderildiDesteklenirmi, gonderimTSSaha} = this; if (gonderildiDesteklenirmi && gonderimTSSaha) {
				const {liste} = e, {tableAlias: alias} = this; liste.push(
					new GridKolon({ belirtec: gonderimTSSaha, text: 'Gnd.Tarih', genislikCh: 13 }).tipDate(),
					new GridKolon({ belirtec: gonderimTSSaha.toLowerCase().replace('ts', 'saat'), text: 'Gnd.Saat', genislikCh: 13, sql: `${alias}.${gonderimTSSaha}` }).tipTime()
				)
			}
		}
		const getCellClassName = (sender, rowIndex, belirtec, value, rec, prefix) => {
			let result = belirtec; if (prefix) { if ($.isArray(prefix)) { prefix = prefix.join(' ') } if (prefix != result) { result += ` ${prefix}` } }
			if (rec) {
				let ekCSS = this.getEkCSS({ sender, rowIndex, dataField: belirtec, value, rec });
				if (ekCSS) { if ($.isArray(ekCSS)) ekCSS = ekCSS.join(' ') }
				if (ekCSS) result += ` ${ekCSS}`
			}
			return result
		};
		const {liste} = e; for (const colDef of liste) {
			const savedCellClassName = colDef.cellClassName /*, savedCellsRenderer = colDef.cellsRenderer*/;
			colDef.cellClassName = (sender, rowIndex, belirtec, value, rec) => {
				const prefix = savedCellClassName ? getFuncValue.call(this, savedCellClassName, sender, rowIndex, belirtec, value, rec) : null;
				return getFuncValue.call(this, getCellClassName, sender, rowIndex, belirtec, value, rec, prefix)
			}
			/*colDef.cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
				const boundRec = rec?.bounddata ?? rec?.boundrec ?? rec?.boundrow;
				if (boundRec) {
					rec = boundRec; value = boundrec[belirtec];
					html = savedCellsRenderer ? getFuncValue.call(this, savedCellsRenderer, colDef, rowIndex, belirtec, value, html, jqxCol, rec) : changeTagContent(html, value)
				}
				else if (savedCellsRenderer)
					html = getFuncValue.call(this, savedCellsRenderer, colDef, rowIndex, belirtec, value, html, jqxCol, rec)
				return html
			}*/
		}
	}
	static orjBaslikListesiDuzenle_ayrimVeOzelSahalar(e) { this.orjBaslikListesiDuzenle_ayrimSahalari(e); this.orjBaslikListesiDuzenle_ozelSahalar(e) }
	static orjBaslikListesiDuzenle_ayrimSahalari(e) {
		const {ayrimIsimleri} = this; if ($.isEmptyObject(ayrimIsimleri)) return
			/* ayrimBelirtec: 'stk', ayrimTableAlias: 'sayr' */
		const {ayrimBelirtec, ayrimTableAlias} = this, {liste} = e;
		for (let i = 0; i < ayrimIsimleri.length; i++) {
			const seq = i + 1, ayrimAdi = ayrimIsimleri[i];
			const ayrimAlias = `${ayrimTableAlias}${seq}`;									// 'sayr1' ...
			const colDef = new GridKolon({
				belirtec: `${ayrimBelirtec}ayradi${seq}`,									// 'stkayradi1' ...
				text: ayrimAdi, genislikCh: 18,
				sql: `${ayrimAlias}.aciklama`												// 'sayr1.aciklama' ...
			});
			liste.push(colDef)
		}
	}
	static orjBaslikListesiDuzenle_ozelSahalar(e) { }
	static get listeBasliklari() { const e = { liste: [] }; this.listeBasliklariDuzenle(e); return e.liste }
	static listeBasliklariDuzenle(e) {
		const {yerelParamBelirtec} = this, mfSinif2KolonAyarlari = app.params.yerel?.mfSinif2KolonAyarlari || {};
		const kolonAyarlari = mfSinif2KolonAyarlari[yerelParamBelirtec] || {}, {orjBaslikListesi} = this, {liste} = e;
		let {gorunumListesi} = kolonAyarlari; if ($.isEmptyObject(gorunumListesi)) gorunumListesi = this.standartGorunumListesi
		if ($.isEmptyObject(gorunumListesi)) { liste.push(...orjBaslikListesi) }
		else {
			const belirtec2OrjBaslik = {};
			for (const colDef of orjBaslikListesi) belirtec2OrjBaslik[colDef.belirtec] = colDef
			for (const belirtec of gorunumListesi) { const colDef = belirtec2OrjBaslik[belirtec]; if (colDef) liste.push(colDef) }
		}
	}
	static get standartGorunumListesi() {
		const e = { liste: [] }, uniqueKeys = {}; this.standartGorunumListesiDuzenle(e); this.standartGorunumListesiDuzenleDevam(e);
		const _liste = e.liste, liste = []; for (const key of _liste) { if (uniqueKeys[key]) { continue } uniqueKeys[key] = true; liste.push(key) }
		return liste
	}
	static standartGorunumListesiDuzenle(e) {
		if (this.tumKolonlarGosterilirmi) { const {liste} = e; liste.push(...Object.keys(asSet(this.orjBaslikListesi.map(colDef => colDef.belirtec)))) }
	}
	static standartGorunumListesiDuzenleDevam(e) { this.forAltYapiClassesDo('standartGorunumListesiDuzenle', e) }
	static raporSabitKolonlarOlustur(e) {
		const {liste} = e, {orjBaslikListesi} = this; e.alias = this.tableAlias;
		for (const colDef of orjBaslikListesi) liste.push(...(colDef.asRSahalar(e).filter(saha => !!saha)))
		this.forAltYapiClassesDo('raporSabitKolonlarOlustur', e)
	}
	static raporKategorileriDuzenle_master(e) { this.forAltYapiClassesDo('raporKategorileriDuzenle_master', e) }
	static raporKategorileriDuzenle_son(e) { this.forAltYapiClassesDo('raporKategorileriDuzenle_son', e) }
	static raporSabitKolonlarOlustur_detaylar(e) { this.forAltYapiClassesDo('raporSabitKolonlarOlustur_detaylar', e) }
	static sabitRaporKategorileriDuzenle_detaylar(e) { const {modelRapor} = e; debugger }
	static raporQueryDuzenle(e) { this.forAltYapiClassesDo('raporQueryDuzenle', e) }
	static raporQueryDuzenle_detaylar(e) { this.forAltYapiClassesDo('raporQueryDuzenle_detaylar', e) }
	static loadServerData(e) { return this.loadServerDataDogrudan(e) }
	static async loadServerDataDogrudan(e) { e = e || {}; e.query = await this.loadServerData_queryOlustur(e); return await this.loadServerData_querySonucu(e) }
	static loadServerData_queryOlustur(e) {
		e = e || {}; const tabloKolonlari = e.tabloKolonlari = e.tabloKolonlari || this.listeBasliklari, sahalarAlinmasinFlag = e.sahalarAlinmasinFlag ?? e.sahalarAlinmasin;
		const {table} = this, alias = e.alias || this.tableAlias, tableAndAlias = alias ? `${table} ${alias}` : table, aliasVeNokta = alias ? `${alias}.` : '';
		const offlineMode = e.offlineMode ?? e.isOfflineMode ?? e.offline ?? this.isOfflineMode, {gonderildiDesteklenirmi, gonderimTSSaha} = this;
		const sent = new MQSent({ from: tableAndAlias }); if (!sahalarAlinmasinFlag) {
			for (const colDef of tabloKolonlari) {
				if (!colDef.sqlIcinUygunmu) { continue } const {belirtec, sql} = colDef;
				if (!offlineMode && gonderildiDesteklenirmi && gonderimTSSaha && (sql || belirtec)?.endsWith(gonderimTSSaha)) { continue }
				if (sql || belirtec) { sent.add(sql ? `${sql} ${belirtec}` : `${aliasVeNokta}${belirtec}`) }
			}
		}
		const keyHV = this.varsayilanKeyHostVars(e); if (keyHV) { sent.where.birlestirDict({ alias, dict: keyHV }) }
		const {secimler: sec} = e; if (sec) { sent.where.birlestir(sec.getTBWhereClause(e)) }
		if ($.isEmptyObject(sent.sahalar.liste)) { sent.sahalar.add(`${aliasVeNokta}*`) }
		/* sent.groupByOlustur(); */ let stm = new MQStm({ sent });
		$.extend(e, { table: this.table, alias, aliasVeNokta, stm, sent }); { this.loadServerData_queryDuzenle(e) } stm = e.query || e.stm;
		if (this.gereksizTablolariSilYapilirmi) { if (stm?.getSentListe) { for (const _sent of stm.getSentListe()) { _sent.gereksizTablolariSil({ disinda: alias }) } } }
		return stm
	}
	static loadServerData_queryDuzenle(e) {
		e = e || {}; const sender = e.sender ?? e, {offlineGonderRequest} = e;
		const ozelQueryDuzenleBlock = e.ozelQueryDuzenleBlock ?? e.ozelQueryDuzenle ?? sender.ozelQueryDuzenleBlock ?? sender.ozelQueryDuzenle;
		if (ozelQueryDuzenleBlock) { getFuncValue.call(this, ozelQueryDuzenleBlock, e) }
		let {kod, value} = e; const {stm, maxRow, wsArgs} = e; if (wsArgs) { stm.fromGridWSArgs(wsArgs) }
		if (offlineGonderRequest) {
			const {gonderildiDesteklenirmi, gonderimTSSaha, tableAlias: alias} = this;
			if (gonderildiDesteklenirmi && gonderimTSSaha) { for (const sent of stm.getSentListe()) { sent.where.add(`${alias}.${gonderimTSSaha} = ''`) } }
		}
		/* if (value) value = value.toUpperCase() */
		const {kodSaha, adiSaha, tableAlias, aliasVeNokta} = this;
		if (kodSaha && (kod || value || maxRow)) {
			const orClauses = [];
			if (value) {
				const parts = value.split(' '); for (const _part of parts) {
					const part = _part?.trim(); if (!part) { continue }
					const or = new MQOrClause(); or.like(`%${part}%`, `${aliasVeNokta}${kodSaha}`); if (adiSaha) {
						or.like(`%${part.toUpperCase()}%`, `UPPER(${aliasVeNokta}${adiSaha})`);
						or.like(`%${part.toLocaleUpperCase()}%`, `UPPER(${aliasVeNokta}${adiSaha})`)
					}
					orClauses.push(or)
				}
			}
			for (const sent of stm.getSentListe()) {
				if (kodSaha && kod) { sent.where.degerAta(kod, `${aliasVeNokta}${kodSaha}`) }
				if (orClauses) { for (const or of orClauses) { sent.where.add(or) } }
				if (maxRow) { sent.top = maxRow }
			}
		}
		const {ayrimIsimleri, ayrimBelirtec, ayrimTable, ayrimTableAlias} = this;
		if (!$.isEmptyObject(ayrimIsimleri)) {
			const Prefix = `${ayrimBelirtec}ayradi`, {tabloKolonlari} = e; let ayrimIndexStrSet;
			if (tabloKolonlari) {
				ayrimIndexStrSet = {};
				for (const colDef of tabloKolonlari) { const {belirtec} = colDef; if (belirtec.startsWith(Prefix)) { const key = belirtec.substring(Prefix.length); ayrimIndexStrSet[key] = true } }
			}
			else
				ayrimIndexStrSet = asSet(Object.keys(this.ayrimIsimleri).map(x => asInteger(x) + 1))
			for (const sent of stm.getSentListe()) {
				for (const indexStr of Object.keys(ayrimIndexStrSet)) {
					const _ayrimTableAlias = `${ayrimTableAlias}${indexStr}`;									// 'sayr1' ...
					const ayrimTableVeAlias = `${ayrimTable}${indexStr} ${_ayrimTableAlias}`;					// 'stkayrim1 sayr1'
					const iliski = `${tableAlias}.ayrim${indexStr} = ${_ayrimTableAlias}.sayac`;				// 'stk.ayrim1 = sayr1.sayac'
					sent.leftJoin({ alias: tableAlias, table: ayrimTableVeAlias, on: iliski })
				}
			}
		}
		this.forAltYapiClassesDo('loadServerData_queryDuzenle', e)
	}
	static async loadServerData_querySonucu(e) {
		e = e || {}; const sender = e.sender ?? e;
		const ozelQuerySonucuBlock = e.ozelQuerySonucuBlock ?? e.ozelQuerySonucu ?? sender.ozelQuerySonucuBlock ?? sender.ozelQuerySonucu;
		const {trnId, wsArgs, query} = e, defer = e.defer = e.defer ?? e.deferFlag ?? false; delete e.defer; delete e.deferFlag;
		const offlineMode = e.offlineMode ?? e.isOfflineMode ?? e.offline ?? this.isOfflineMode, _e = { offlineMode, defer, trnId, wsArgs, query };
		if (ozelQuerySonucuBlock) { return getFuncValue.call(this, ozelQuerySonucuBlock, _e); }
		let result = await this.forAltYapiClassesDoAsync('loadServerData_querySonucu', e); result = result ? result[result.length - 1] : undefined; if (result !== undefined) { return result }
		result = await this.sqlExecSelect(_e); return result
	}
	tekilOku_queryOlustur(e) {
		e = e || {}; const tabloKolonlari = e.tabloKolonlari = e.tabloKolonlari ?? this.class.listeBasliklari;
		const alias = this.class.tableAlias, {aliasVeNokta} = this.class, sent = new MQSent({ from: this.class.tableAndAlias });
		const offlineMode = e.offlineMode ?? e.isOfflineMode ?? e.offline ?? this.class.isOfflineMode, {gonderildiDesteklenirmi, gonderimTSSaha} = this.class;
		for (const colDef of tabloKolonlari) {
			if (!colDef.sqlIcinUygunmu) { continue } const {belirtec, sql} = colDef;
			if (!offlineMode && gonderildiDesteklenirmi && gonderimTSSaha && (sql || belirtec)?.endsWith(gonderimTSSaha)) { continue }
			if (belirtec || sql) { sent.add(sql ? `${sql} ${belirtec}` : `${aliasVeNokta}${belirtec}`) }
		}
		sent.sahalar.add(`${aliasVeNokta}*`);
		let keyHV = this.keyHostVars(e); if ($.isEmptyObject(keyHV)) { keyHV = this.alternateKeyHostVars(e) }
		if (keyHV) { sent.where.birlestirDict({ alias, dict: keyHV }) }
		/* if ($.isEmptyObject(sent.sahalar.liste)) { sent.sahalar.add(`${aliasVeNokta}*`) } */
		let stm = new MQStm({ sent }); $.extend(e, { stm, sent }); this.tekilOku_queryDuzenle(e); stm = e.query || e.stm;
		if (this.class.gereksizTablolariSilYapilirmi) { sent.gereksizTablolariSil({ disinda: alias }) }
		return stm
	}
	tekilOku_queryDuzenle(e) { this.class.loadServerData_queryDuzenle({ ...e, tekilOku: true }); this.forAltYapiKeysDo('tekilOku_queryDuzenle', e) }
	static async tekilOku_querySonucu(e) {
		e = e || {}; const sender = e.sender ?? e, ozelQuerySonucuBlock = e.ozelQuerySonucuBlock ?? e.ozelQuerySonucu ?? sender.ozelQuerySonucuBlock ?? sender.ozelQuerySonucu;
		const {trnId, wsArgs, query} = e, offlineMode = e.offlineMode ?? e.isOfflineMode ?? e.offline ?? this.isOfflineMode, _e = { offlineMode, trnId, wsArgs, query };
		if (ozelQuerySonucuBlock) { return getFuncValue.call(this, ozelQuerySonucuBlock, _e) }
		let result = await this.forAltYapiClassesDoAsync('tekilOku_querySonucu', _e);
		result = result ? result[result.length - 1] : undefined; if (result !== undefined) { return result }
		if (typeof e.query == 'object' && !$.isPlainObject(e.query) && !(e.query.top || e.query.limit)) { $.extend(e.query, { top: 2, limit: null }) }
		return await this.sqlExecTekil(_e)
	}
	static get orjBaslikListesi_detaylar() { const e = { liste: [] }; this.orjBaslikListesiDuzenle_detaylar(e); return e.liste }
	static orjBaslikListesiDuzenle_detaylar(e) { }
	static get listeBasliklari_detaylar() { const e = { liste: [] }; this.listeBasliklariDuzenle_detaylar(e); return e.liste }
	static listeBasliklariDuzenle_detaylar(e) { this.orjBaslikListesiDuzenle_detaylar(e) }
	static loadServerData_detaylar(e) {
		e = e || {}; /* e.tabloKolonlari = e.tabloKolonlari || this.listeBasliklari_detaylar; */
		e.query = this.loadServerData_detaylar_queryOlustur(e); return this.loadServerData_detaylar_querySonucu(e)
	}
	static loadServerData_detaylar_queryOlustur(e) { return null }
	static loadServerData_detaylar_queryDuzenle(e) { this.forAltYapiClassesDo('loadServerData_detaylar_queryDuzenle', e) }
	static async loadServerData_detaylar_querySonucu(e) {
		let result = await this.forAltYapiClassesDoAsync('loadServerData_detaylar_querySonucu', e);
		result = result ? result[result.length - 1] : undefined; if (result !== undefined) return result
		return await this.loadServerData_querySonucu(e)
	}
	static get ayrimIsimleri() { const {ayrimTipKod} = this; return ayrimTipKod ? (app.params.ticariGenel.ayrimIsimleri[ayrimTipKod] || []) : null }
	static getOzelSahaYapilari(e) {
		let result = this.globals.ozelSahaYapilari;
		if (result === undefined && this.ozelSahaTipKod) result = this.globals.ozelSahaYapilari = this.getOzelSahaYapilariDogrudan(e)
		if (result && result.then) { result.then(_result => result = this.globals.ozelSahaYapilari = _result) }
		return result
	}
	static async getOzelSahaYapilariDogrudan(e) {
		const {ozelSahaTipKod} = this; if (!ozelSahaTipKod) return null
		const sent = new MQSent({
			from: 'OSahaGrup ogrp',
			fromIliskiler: [ { alias: 'ogrp', leftJoin: 'OSahaTanim osaha', on: 'ogrp.kaysayac = osaha.grupsayac' } ],
			where: [{ degerAta: ozelSahaTipKod, saha: 'ogrp.adimTipi' }],
			sahalar: [
				'ogrp.kod grupKod', 'ogrp.aciklama grupAdi', 'osaha.kaysayac sahasayac',
				'(case when ogrp.gorunumSirano=0 then 999 else ogrp.gorunumSirano end) grupSira',
				'(case when osaha.gorunumSirano=0 then 999 else osaha.gorunumSirano end) sahaSira',
				'osaha.*' /* osaha.grupsayac */
			]
		})
		const stm = new MQStm({ sent,  orderBy: ['grupSira', 'grupsayac', 'grupKod', 'sahaSira', 'sahasayac'] }); const recs = await app.sqlExecSelect(stm);
		const result = seviyelendir({
			source: recs, attrListe: ['grupKod'],
			getter: e => { const {item} = e; return new MQOzelSahaGrup({ sayac: item.grupsayac, kod: item.grupKod, aciklama: item.grupAdi }) },
			detayGetter: e => { const inst = new MQOzelSahaDetay(); inst.setValues({ rec: e.item }); return inst }
		});
		return result
	}
	async yukle(e) { await this.cacheOlustur(e); return super.yukle(e) }
	async yaz(e) { let result = await super.yaz(e); this.class.globalleriSil(); return result }
	async degistir(e) { let result = await super.degistir(e); this.class.globalleriSil(); return result }
	async sil(e) { let result = await super.sil(e); this.class.globalleriSil(); return result }
	async yeniTanimOncesiIslemler(e) { await super.yeniTanimOncesiIslemler(e); await this.forAltYapiKeysDoAsync('yeniTanimOncesiIslemler', e) }
	async yukleSonrasiIslemler(e) { await super.yukleSonrasiIslemler(e); await this.forAltYapiKeysDoAsync('yukleSonrasiIslemler', e) }
	async uiKaydetOncesiIslemler(e) {
		await this.forAltYapiKeysDoAsync('uiKaydetOncesiIslemler', e)
		let result = await this.dataDuzgunmu(e);
		if (!(result == null || result == true)) { if (typeof result != 'object') result = { isError: false, rc: 'hataliBilgiGirisi', errorText: (typeof result == 'boolean' ? null : result?.toString()) }; throw result }
	}
	async dataDuzgunmu(e) { await this.forAltYapiKeysDoAsync('dataDuzgunmu', e); return null }
	async kaydetOncesiIslemler(e) { await super.kaydetOncesiIslemler(e); e.ozelSahaYapilari = this.class.getOzelSahaYapilari(e); await this.forAltYapiKeysDoAsync('kaydetOncesiIslemler', e) }
	async kaydetSonrasiIslemler(e) { await super.kaydetSonrasiIslemler(e); await this.forAltYapiKeysDoAsync('kaydetSonrasiIslemler', e) }
	async yeniOncesiIslemler(e) { await super.yeniOncesiIslemler(e); await this.forAltYapiKeysDoAsync('yeniOncesiIslemler', e) }
	async degistirOncesiIslemler(e) { await super.degistirOncesiIslemler(e); await this.forAltYapiKeysDoAsync('degistirOncesiIslemler', e) }
	async silmeOncesiIslemler(e) { await super.silmeOncesiIslemler(e); await this.forAltYapiKeysDoAsync('silmeOncesiIslemler', e) }
	async yeniVeyaDegistirOncesiIslemler(e) { await super.yeniVeyaDegistirOncesiIslemler(e); await this.forAltYapiKeysDoAsync('yeniVeyaDegistirOncesiIslemler', e) }
	async yeniSonrasiIslemler(e) { await super.yeniSonrasiIslemler(e); await this.forAltYapiKeysDoAsync('yeniSonrasiIslemler', e) }
	async degistirSonrasiIslemler(e) { await super.degistirSonrasiIslemler(e); await this.forAltYapiKeysDoAsync('degistirSonrasiIslemler', e) }
	async silmeSonrasiIslemler(e) { await super.silmeSonrasiIslemler(e); await this.forAltYapiKeysDoAsync('silmeSonrasiIslemler', e) }
	async yeniVeyaDegistirSonrasiIslemler(e) { await super.yeniVeyaDegistirSonrasiIslemler(e); await this.forAltYapiKeysDoAsync('yeniVeyaDegistirSonrasiIslemler', e) }
	donusumBilgileriniSil(e) { }
	static varsayilanKeyHostVars(e) {
		const hv = super.varsayilanKeyHostVars(e), _results = this.forAltYapiClassesDo('varsayilanKeyHostVars', e) || [];
		for (const _hv of _results) { if (_hv) $.extend(hv, _hv) } return hv
	}
	static varsayilanKeyHostVarsDuzenle(e) { super.varsayilanKeyHostVarsDuzenle(e); this.forAltYapiClassesDo('varsayilanKeyHostVarsDuzenle', e) }
	keyHostVars(e) { const hv = super.keyHostVars(e), _results = this.forAltYapiKeysDo('keyHostVars', e) || []; for (const _hv of _results) { if (_hv) $.extend(hv, _hv) } return hv }
	keyHostVarsDuzenle(e) { super.keyHostVarsDuzenle(e); this.forAltYapiKeysDo('keyHostVarsDuzenle', e) }
	keySetValues(e) { super.keySetValues(e); this.forAltYapiKeysDo('keySetValues', e) }
	alternateKeyHostVars(e) { const hv = super.alternateKeyHostVars(e), _results = this.forAltYapiKeysDo('alternateKeyHostVars', e) || []; for (const _hv of _results) { if (_hv) $.extend(hv, _hv) } return hv }
	alternateKeyHostVarsDuzenle(e) { super.alternateKeyHostVarsDuzenle(e); this.forAltYapiKeysDo('alternateKeyHostVarsDuzenle', e) }
	hostVars(e) { const hv = super.hostVars(e), _results = []; for (const _hv of _results) { if (!$.isEmptyObject(_hv)) { $.extend(hv, _hv) } } return hv }
	pIO_hostVarsDuzenle(e) { super.pIO_hostVarsDuzenle(e); this.forAltYapiKeysDo('pIO_hostVarsDuzenle', e) }
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {hv, ozelSahaYapilari} = e, {ayrimlar, ozelSahalar} = this, {ayrimIsimleri} = this.class;
		if (!$.isEmptyObject(ayrimIsimleri)) { for (let i = 0; i < ayrimIsimleri.length; i++) { const seq = i + 1, value = ayrimlar[seq] || null; hv[`ayrim${seq}`] = value } }
		if (window.MQOzelSahaDetay && !$.isEmptyObject(ozelSahaYapilari)) {
			const {prefix} = MQOzelSahaDetay;
			for (const ozelSahaGrup of ozelSahaYapilari) {
				for (const ozelSaha of ozelSahaGrup.detaylar) {
					const key = ozelSaha.attr, ozelSahaKey = key.substring(prefix.length), value = ozelSaha.getConvertedValue(ozelSahalar[ozelSahaKey] ?? null);
					hv[key] = value
				}
			}
		}
		this.forAltYapiKeysDo('hostVarsDuzenle', e)
	}
	setValues(e) {
		super.setValues(e); const {rec} = e, ayrimlar = this.ayrimlar = {}, ozelSahalar = this.ozelSahalar = {}, {ayrimIsimleri} = this.class;
		for (const key in rec) {
			let prefix;
			if (!$.isEmptyObject(ayrimIsimleri)) {
				prefix = 'ayrim';
				if (key.length > prefix.length && key.startsWith(prefix)) {
					const value = rec[key];
					if (value != null) { const seq = asInteger(key.substring(prefix.length)), index = seq - 1; if (index < ayrimIsimleri.length) ayrimlar[seq] = value }
				}
			}
			if (window.MQOzelSahaDetay) {
				prefix = MQOzelSahaDetay.prefix;
				if (key.length > prefix.length && key.startsWith(prefix)) {
					const value = rec[key];
					if (value != null) { const ozelSahaKey = key.substring(prefix.length); ozelSahalar[ozelSahaKey] = value }
				}
			}
		}
		this.forAltYapiKeysDo('setValues', e)
	}
	static listeEkraniAc(e) {
		const {listeUISinif} = this; if (!listeUISinif) { return null }
		e = e || {}; e.mfSinif = e.mfSinif || this;
		try { const part = new listeUISinif(e), result = part.run(); return { part, result } }
		catch (ex) { displayMessage(getErrorText(ex)); throw ex }
	}
	static async tanimla(e) {
		e = e || {}; const {tanimUISinif} = this, {tanimOncesiEkIslemler} = e; if (!tanimUISinif) { return null }
		e.islem = e.islem || 'yeni'; e.mfSinif = e.mfSinif || this;
		try {
			const part = e.tanimPart = new tanimUISinif(e);
			if (tanimOncesiEkIslemler) { const _result = await getFuncValue.call(this, tanimOncesiEkIslemler, e); if (_result === false) { return ({ part, result: false }) } }
			const result = await part.run(); return { part, result }
		}
		catch (ex) { hConfirm(getErrorText(ex)); throw ex }
	}
	tanimla(e) { e = e || {}; e.inst = e.inst || this; return this.class.tanimla(e) }
	cacheOlustur(e) { }
	static async getGloAdi2KodListe(e) {
		const {globals} = this; let result = globals.adi2KodListe;
		if (!result) {
			const kod2Adi = await this.getGloKod2Adi(e); result = globals.adi2KodListe = {};
			for (const kod in kod2Adi) { let adi = kod2Adi[kod]; if (adi) { adi = adi.toLocaleUpperCase().trim(); (result[adi] = result[adi] || []).push(kod) } }
		}
		return result
	}
	static async getGloKod2Adi(e) {
		e = e || {}; if (typeof e != 'object') e = { kod: e }
		const {kod} = e, {globals} = this; let result = globals.kod2Adi; delete e.kod;
		if (!result) {
			const kod2Rec = await this.getGloKod2Rec(e), adiSaha = e.adiSaha ?? this.adiSaha;
			result = globals.kod2Adi = {}; for (const kod in kod2Rec) { result[kod] = kod2Rec[kod][adiSaha] }
		}
		return kod ? result[kod] : result
	}
	static async getGloKod2Rec(e) {
		e = e || {}; const {globals} = this; let result = globals.kod2Rec;
		if (!result) {
			const recs = (await this.loadServerData(e)) || [], kodSaha = e.kodSaha ?? this.kodSaha; result = globals.kod2Rec = {};
			for (const rec of recs) { const kod = rec[kodSaha]; result[kod] = rec }
		}
		return result
	}
	static kodVarmi(e) { e = e || {}; const kod = typeof e == 'object' ? e.kod : e; return new this({ kod }).varmi(e) }
	static partLayoutDuzenle(e) {
		const {sender, layout, fis, argsDuzenle} = e, noAutoWidth = e.noAutoWidth ?? false, isDropDown = e.dropDown ?? false, mfSinif = e.mfSinif || this;
		const _e = $.extend({}, e, { args: { sender: sender, layout, dropDown: isDropDown, mfSinif, noAutoWidth, dropDownWidth: '200%', value: getFuncValue.call(this, e.value ?? e.kod, { sender, fis }) } });
		if (argsDuzenle) getFuncValue.call(this, argsDuzenle, _e.args);
		const part = e.result = new ModelKullanPart(_e.args); part.run(); return part
	}
	static getGridKolonlar(e) {
		e = e || {}; const {belirtec} = e, _e = $.extend({}, e, { mfSinif: this, belirtec, liste: [], kodEtiket: e.kodEtiket, adiEtiket: e.adiEtiket });
		const gridKolonGrupcu = e.gridKolonGrupcu || 'getGridKolonGrup';
		let colDef = $.isFunction(gridKolonGrupcu) ? getFuncValue.call(this, gridKolonGrupcu, _e) : getFuncValue.call(this, this[gridKolonGrupcu], _e);
		if (colDef) {
			const sabitleFlag = e.sabitle ?? e.sabitleFlag, hiddenFlag = e.hidden ?? e.hiddenFlag, autoBind = e.autoBind ?? e.autoBindFlag;
			if (sabitleFlag) { colDef.sabitle() } if (hiddenFlag) { colDef.hidden() } if (autoBind) { colDef.autoBind() }
			_e.liste.push(colDef)
		}
		this.gridKolonlarDuzenle(_e); return _e.liste
	}
	static gridKolonlarDuzenle(e) { this.forAltYapiClassesDo('gridKolonlarDuzenle', e) }
	static getGridKolonGrup(e) { }
	static globalleriSil() { const {classKey, mqGlobals} = this, result = mqGlobals[classKey]; delete app.mqGlobals[classKey]; return result }
	static tempsReset() { const {classKey, mqTemps} = this, result = mqTemps[classKey]; delete mqTemps[classKey]; return result }
	static async kodYoksaMesaj(e, _etiket) {
		e = e || {}; const kod = typeof e == 'object' ? e.kod : e;
		const etiket = (typeof e == 'object' ? e.etiket ?? e.sinifAdi : _etiket) ?? this.sinifAdi ?? '';
		return this.kodVarmi && !(await this.kodVarmi(e)) ? `<u>${etiket}</u> için <b class="red">${kod}</b> değeri hatalıdır` : null
	}
	static async sayacYoksaMesaj(e) {
		e = e || {}; const sayac = typeof e == 'object' ? e.sayac : e;
		const etiket = (typeof e == 'object' ? e.etiket ?? e.sinifAdi : _etiket) ?? this.sinifAdi ?? '';
		return this.sayacVarmi && !(await this.sayacVarmi(e)) ? `${etiket} için kayıt bulunamadı` : null
	}
	static get tekrarlayanKolonlar() {
		const sahaSet = {}, result = {};
		for (const colDef of this.orjBaslikListesi) {
			const {belirtec} = colDef; if (sahaSet[belirtec]) { result[belirtec] = colDef; continue }
			sahaSet[belirtec] = true
		}
		return result
	}
	static tazeleVeYakalaDefer(e) { const part = e.part ?? e.builder?.rootPart; part.tazeleDefer() }
	static tazeleVeYakala(e) { const part = e.part ?? e.builder?.rootPart; part.tazele() }
	static getGridRecs(e) { const gridPart = e.gridPart ?? e.part ?? e.builder.rootPart ?? e.sender; return e.recs ?? (e.rec ? [e.rec] : null) ?? gridPart?.selectedRecs }
	static getGridRec(e) { return (this.getGridRecs(e) || [])[0] }
	static forAltYapiClassesDo(e, ..._args) {
		e = e || {}; const blockOrSelector = typeof e == 'object' ? (e.selector ?? e.block ?? e.action) : e, results = [];
		const selector = typeof blockOrSelector == 'string' ? blockOrSelector : null; let block = typeof blockOrSelector == 'string' ? null : blockOrSelector;
		if (blockOrSelector) {
			const args = (typeof e == 'object' ? e.args : _args) || [], {altYapiDict} = this; if (altYapiDict == null) { return }
			for (const cls of Object.values(altYapiDict)) {
				if (cls) {
					cls.__proto__.mfSinif = this;
					if (selector) block = cls[selector]
					if (block) results.push(getFuncValue.call(cls, block, ...args))
				}
			}
		}
		return results
	}
	forAltYapiKeysDo(e, ..._args) {
		e = e || {}; const blockOrSelector = typeof e == 'object' ? (e.selector ?? e.block ?? e.action) : e, results = [];
		const selector = typeof blockOrSelector == 'string' ? blockOrSelector : null; let block = typeof blockOrSelector == 'string' ? null : blockOrSelector;
		if (blockOrSelector) {
			const args = (typeof e == 'object' ? e.args : _args) || [], {altYapiDict} = this.class; if (altYapiDict == null) { return }
			for (const key in altYapiDict) {
				const altInst = this[key];
				if (altInst) {
					if (selector) block = altInst[selector]
					if (block) results.push(getFuncValue.call(altInst, block, ...args))
				}
			}
		}
		return results
	}
	static async forAltYapiClassesDoAsync(e, ..._args) {
		e = e || {};
		const blockOrSelector = typeof e == 'object' ? (e.selector ?? e.block ?? e.action) : e, results = [];
		const selector = typeof blockOrSelector == 'string' ? blockOrSelector : null; let block = typeof blockOrSelector == 'string' ? null : blockOrSelector;
		if (blockOrSelector) {
			const args = (typeof e == 'object' ? e.args : _args) || [], {altYapiDict} = this; if (altYapiDict == null) { return }
			for (const cls of Object.values(altYapiDict)) {
				if (cls) {
					cls.__proto__.mfSinif = this;
					if (selector) { block = cls[selector] }
					if (block) { results.push(await getFuncValue.call(cls, block, ...args)) }
				}
			}
		}
		return results
	}
	async forAltYapiKeysDoAsync(e, ..._args) {
		e = e || {}; const blockOrSelector = typeof e == 'object' ? (e.selector ?? e.block ?? e.action) : e, results = [];
		const selector = typeof blockOrSelector == 'string' ? blockOrSelector : null; let block = typeof blockOrSelector == 'string' ? null : blockOrSelector;
		if (blockOrSelector) {
			const args = (typeof e == 'object' ? e.args : _args) || [], {altYapiDict} = this.class; if (altYapiDict == null) { return }
			for (const key in altYapiDict) {
				const altInst = this[key];
				if (altInst) {
					if (selector) { block = altInst[selector] }
					if (block) { results.push(await getFuncValue.call(altInst, block, ...args)) }
				}
			}
		}
		return results
	}
}


/*
	b = (await MQCogul.formBuilder_getTabPanelWithGenelTab()).tabPage_genel
*/

/*
	const result = await MQCogul.formBuilder_getTabPanelWithGenelTab();
	const {tabPage_genel, tabPanel, rootFormBuilder} = result;
	
	let form = tabPage_genel.addForm('dis-form', e => $(`<div class="dis-form"/>`));
	form.addTextInput('aciklama', 'Açıklama');
	form.addTextInput('aciklama2', 'Açıklama 2');
	
	form = tabPage_genel.addForm('grid-form', e => $(`<div class="grid-form"/>`));
	form.addForm(null, e => $(`<h2>Stok Grupları</h2>`));
	const grid = form.addGridliGiris_sabit('grid');
	grid.setSource(e => MQStokGrup.loadServerData(e));
	grid.setTabloKolonlari(e => MQStokGrup.orjBaslikListesi);
	grid.widgetArgsDuzenleIslemi(e => {
		e.args.showGroupsHeader = true
	});
	grid.onAfterRun(e => {
		const {builder} = e;
		const {part} = builder;
		part.grid.on('rowclick', evt => {
			const rec = evt.args.row.bounddata;
			console.info('secilen', rec, evt.args.owner);
			builder.inst.grupKod = rec.kod
		})
	})
	
	tabPanel.addStyle(
		`$builderCSS {
			 --dis-form-height: 78px;
			width: var(--full);
			height: calc(var(--full) - 5px);
		}`,
		`$builderCSS > .content > .formBuilder-element {
			width: var(--full);
			height: var(--full);
		}`,
		`$builderCSS > .content .formBuilder-element[data-builder-id = "dis-form"] {
			width: var(--full);
			height: var(--dis-form-height);
			overflow-y: auto;
		}`,
		`$builderCSS > .content .formBuilder-element[data-builder-id = "dis-form"] > .parent {
			float: left;
			min-width: 450px;
			max-width: 49%;
		}`,
		`$builderCSS > .content .formBuilder-element[data-builder-id = "grid-form"] {
			width: var(--full) !important;
			height: calc(var(--full) - (var(--dis-form-height) + 70px + 5px)) !important;
		}`,
		`$builderCSS > .content .formBuilder-element[data-builder-id = "grid-form"] > div[data-builder-id = "grid"],
		 $builderCSS > .content .formBuilder-element[data-builder-id = "grid-form"] > div[data-builder-id = "grid"] > div {
			width: var(--full) !important; 
			height: var(--full) !important;
		}`
	);
	
	part = new ModelTanimPart({ inst: new MQStok(), builder: rootFormBuilder });
	rootFormBuilder.inst = part.inst;
	await part.run()

	document.body.focus();
	document.body.scrollTo(0, 0);
	html2canvas(app.activeWndPart.form[0], { imageTimeout: 2000, removeContainer: false }).then(canvas => {
		img = canvas.toDataURL('image/png');
		doc = new jspdf.jsPDF({ unit: 'px', orientation: 'landscape' });
		doc.addImage(img, 'JPEG', 10, 10);
		doc.save()
	})

	doc = new jspdf.jsPDF({ unit: 'px', orientation: 'landscape' });
	doc.text('ABC', 0, 10, 10);
	doc.save()
*/
