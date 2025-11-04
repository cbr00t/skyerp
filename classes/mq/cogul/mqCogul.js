class MQCogul extends MQYapi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static _altYapiDictOlustuSet = {}; static _extYapiOlustuSet = {}; static get mqCogulmu() { return true }
	static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, 'parentItem'] } static get parentMFSinif() { return null }
	static get listeSinifAdi() { return null } static get kodListeTipi() { return this.classKey } static get noAutoFocus() { return false }
	static get listeUISinif() { return MasterListePart } static get tanimUISinif() { return null } static get secimSinif() { return Secimler }
	static get sabitBilgiRaporcuSinif() { return MasterRapor } static get ozelSahaTipKod() { return null }
	static get ayrimTipKod() { return null } static get ayrimBelirtec() { return this.tableAlias } static get ayrimTable() { return `${this.tableAlias}ayrim`} static get ayrimTableAlias() { return null } 
	static get tanimlanabilirmi() { return !!this.tanimUISinif } static get degistirilebilirmi() { return this.tanimlanabilirmi }
	static get silinebilirmi() { return true } static get raporKullanilirmi() { return false } static get silindiDesteklenirmi() { return false }
	static get kolonDuzenlemeYapilirmi() { return true } static get kolonFiltreKullanilirmi() { return true } static get gridIslemTuslariKullanilirmi() { return $(window).width() >= 700 }
	static get yerelParamBelirtec() { return this.classKey } static get sayacSahaGosterilirmi() { return false } static get tumKolonlarGosterilirmi() { return false }
	static get gridDetaylimi() { return this.detaylimi } static get ozelTanimIslemi() { return null } static get bulFormKullanilirmi() { return true } static get gereksizTablolariSilYapilirmi() { return true }
	static get islemTuslari_sagButonlar_ekMarginX() { return $(window).width() < 800 ? 0 : 15 } static get orjBaslik_gridRenderDelayMS() { return null }
	static get defaultOrjBaslik_gridRenderDelayMS() { return 200 }
	static get orjBaslikListesi_panelGrupAttrListe() { let _e = { liste: [] }; this.orjBaslikListesi_panelGrupAttrListeDuzenle(_e); return _e.liste }
	static get orjBaslikListesi_panelUstSeviyeAttrListe() { let _e = { liste: [] }; this.orjBaslikListesi_panelUstSeviyeAttrListeDuzenle(_e); return _e.liste }
	static get orjBaslikListesi_defaultRowsHeight() { return null } static get orjBaslikListesi_maxColCount() { return 5 } static get orjBaslikListesi_defaultColCount() { return null }
	static get yerelParam() { return app.params.yerel } static get mqGlobals() { return app.mqGlobals = app.mqGlobals || {} } static get mqTemps() { return app.mqTemps = app.mqTemps || {} }
	static get globals() { let {classKey, mqGlobals} = this; return mqGlobals[classKey] = mqGlobals[classKey] || {} } static get temps() { let {classKey, mqTemps} = this; return mqTemps[classKey] = mqTemps[classKey] || {} }
	static get paramGlobals() { let dataKey = this.dataKey || this.classKey, {yerelParam} = this, mfSinif2Globals = yerelParam?.mfSinif2Globals || {}, result = mfSinif2Globals[dataKey] = mfSinif2Globals[dataKey] || {}; return result }
	static get emptyKodValue() { return '' }
	
	static get altYapiDict() {
		let {_altYapiDictOlustuSet} = MQCogul, {classKey} = this;
		let result = _altYapiDictOlustuSet[classKey] ? this._altYapiDict ?? null : undefined;
		if (result === undefined) { let _e = { liste: {} }; this.altYapiDictDuzenle(_e); result = this._altYapiDict = _e.liste; this.altYapiDictDuzenleSonrasi(_e); _altYapiDictOlustuSet[classKey] = true }
		return result
	}
	static get extYapilar() {
		let {_extYapiOlustuSet} = MQCogul, {classKey} = this;
		let result = _extYapiOlustuSet[classKey] ? this._extYapilar ?? null : undefined;
		if (result === undefined) { let _e = { liste: [] }; this.extYapilarDuzenle(_e); result = this._extYapilar = _e.liste; this.extYapilarDuzenleSonrasi(_e); _extYapiOlustuSet[classKey] = true }
		return result
	}
	
	constructor(e) {
		e = e || {}; super(e); $.extend(this, { ayrimlar: {}, ozelSahalar: {} });
		this.class.getOzelSahaYapilari?.()			// önbellek oluştur
	}
	static pTanimDuzenle(e) { super.pTanimDuzenle(e) }
	static pTanimDuzenleSonrasi(e) {
		super.pTanimDuzenleSonrasi(e); let {altYapiDict} = this;
		if (altYapiDict) {
			let {pTanim} = e;
			for (let key in altYapiDict) {
				if (pTanim[key]) continue
				let cls = altYapiDict[key]; if (!cls) continue
				if (cls.addSelfToPTanimFlag) pTanim[key] = new PInstClass(cls)
			}
		}
	}
	static pTanimDuzenleSonIslemler(e) {
		super.pTanimDuzenleSonIslemler(e); let {altYapiDict} = this;
		if (altYapiDict) { for (let key in altYapiDict) { let cls = altYapiDict[key]; if (cls.altYapiInit) cls.altYapiInit(e) } }
	}
	pTanim2InstSonrasi(e) {
		e = e || {}; super.pTanim2InstSonrasi(e); let {altYapiDict} = this.class;
		if (altYapiDict) {
			for (let key in altYapiDict) {
				let altInst = this._p[key]?.value;
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
		let {extYapilar} = this;
		if (extYapilar) {
			let {liste} = e; for (let cls of extYapilar) liste[`_${cls.classKey}`] = cls
		}
	}
	static altYapiDictDuzenleSonrasi(e) {
		let altYapiDict = e.liste;
		if (altYapiDict) {
			for (let key in altYapiDict) {
				let cls = altYapiDict[key];
				if (cls) { cls.__proto__.mfSinif = this /*if (!('mfSinif' in cls)) cls.__proto__.mfSinif = this; // Object.defineProperty(cls.__proto__, 'mfSinif', { get: () => this }) */ }
			}
		}
	}
	static openContextMenu(e) {
		let {title} = e, gridPart = e.gridPart = e.gridPart ?? e.sender ?? e.parentPart ?? e.builder?.rootPart;
		let rec = e.rec = e.rec ?? gridPart.selectedRec, recs = e.recs = gridPart.selectedRecs;
		return gridPart.openContextMenu(e)
	}
	static getEkCSS(e) {
		e = e || {}; let {rec} = e; rec = e.rec = rec?.bounddata ?? rec?.boundrec ?? rec?.boundrow ?? rec;
		if (rec) { let _e = $.extend({}, e, { sender: this, rec, result: [] }); this.ekCSSDuzenle(_e); return _e.result }
	}
	static ekCSSDuzenle(e) {
		this.forAltYapiClassesDo('ekCSSDuzenle', e); let {rec, dataField: belirtec, result} = e, {gonderimTSSaha} = this;
		if (gonderimTSSaha && !!rec[gonderimTSSaha]) { result.push('gonderildi') }
	}
	static listeEkrani_init(e) { this.forAltYapiClassesDo('listeEkrani_init', e) }
	static async listeEkrani_vazgecOncesi(e) {
		let result = await this.forAltYapiClassesDoAsync('listeEkrani_vazgecOncesi', e);
		result = result ? result[result.length - 1] : undefined; if (result !== undefined) { return result }
		return true
	}
	static listeEkrani_afterRun(e) { this.forAltYapiClassesDo('listeEkrani_afterRun', e) }
	static listeEkrani_destroyPart(e) { this.forAltYapiClassesDo('listeEkrani_destroyPart', e) }
	static listeEkrani_activated(e) { this.forAltYapiClassesDo('listeEkrani_activated', e) }
	static listeEkrani_deactivated(e) { this.forAltYapiClassesDo('listeEkrani_deactivated', e) }
	static islemTuslariDuzenle_listeEkrani_ilk(e) { this.forAltYapiClassesDo('islemTuslariDuzenle_listeEkrani_ilk', e) }
	static islemTuslariDuzenle_listeEkrani(e) { this.forAltYapiClassesDo('islemTuslariDuzenle_listeEkrani', e) }
	static async getRootFormBuilder(e) {
		e = e || {}; let tanimFormBuilder = new FBuilder_TanimForm(), rootBuilder = new RootFormBuilder().add(tanimFormBuilder);
		if (rootBuilder) { rootBuilder.noAutoInitLayout() }
		let _e = $.extend({}, e, { mfSinif: this, inst: e.inst, rootBuilder, tanimFormBuilder });
		await this.rootFormBuilderDuzenle(_e); await this.rootFormBuilderDuzenleSonrasi(_e); rootBuilder = _e.rootBuilder; return rootBuilder
	}
	getRootFormBuilder(e) { e = e || {}; e.inst = this; return this.class.getRootFormBuilder(e) }
	static rootFormBuilderDuzenle(e) { }
	static async rootFormBuilderDuzenleSonrasi(e) {
		await this.forAltYapiClassesDoAsync('rootFormBuilderDuzenle', e);
		await this.rootFormBuilderDuzenleSonrasi_ayrimVeOzelSahalar(e)
	}
	static async rootFormBuilderDuzenleSonrasi_ayrimVeOzelSahalar(e) {
		let {etiketGosterim} = e, {ayrimIsimleri} = this; if (!$.isEmptyObject(ayrimIsimleri)) {
			let parentBuilder = await this.rootFormBuilderDuzenleSonrasi_ayrimVeOzelSahalar_getParentBuilder({ ...e, tabPageId: 'ayrim', tabPageEtiket: 'Ayrım' });
			if (parentBuilder) {
				parentBuilder.addCSS('flex-row'); let {sinifAdi, tableAlias, ayrimTable, ayrimTableAlias} = this;
				for (let i = 0; i < ayrimIsimleri.length; i++) {
					let seq = i + 1, id = seq, ayrimAdi = ayrimIsimleri[i], ayrMFSinif = class extends MQKA {
					    static { window[this.name] = this; this._key2Class[this.name] = this }
						static get sinifAdi() { return ayrimAdi } static get table() { return `${ayrimTable}${seq}` } static get tableAlias() { return `${ayrimTableAlias}${seq}` }
						static get kodSaha() { return this.sayacSaha } static get sayacSaha() { return 'sayac' }
					};
					parentBuilder.add(
						new FBuilder_ModelKullan({ id, etiket: ayrimAdi, kodSaha: ayrMFSinif.adiSaha, etiketGosterim, placeHolder: ayrimAdi })
							.dropDown().kodsuz().bosKodEklenir().setMFSinif(ayrMFSinif).setAltInst(({ builder: fbd }) => fbd.inst.ayrimlar)
							.degisince(({ builder: fbd, sender, item, value, kodAttr }) => {
								let {id} = fbd; kodAttr ||= sender.kodAttr || (sender.mfSinif || ayrMFSinif).kodSaha;
								value = item?.[kodAttr] ?? value; fbd.altInst[id] = asInteger(value) || null
							}).addStyle(e => `$elementCSS { width: 20% !important; min-width: 120px !important; margin-bottom: 8px !important }`)
					)
				}
				let lastBuilder = parentBuilder.builders[parentBuilder.builders.length - 1]; if (lastBuilder) {
					lastBuilder.onAfterRun(({ builder: fbd }) => {
						/* let {parent} = fbd, parentElmId = parentBuilder.getElementId(parent); */
						setTimeout(() => parent.jqxSortable({ theme, items: `> div` }), 10)
					})
				}
			}
		}
		let ozelSahaYapilari = await this.getOzelSahaYapilari?.(e); if (!$.isEmptyObject(ozelSahaYapilari)) {
			let parentBuilder = await this.rootFormBuilderDuzenleSonrasi_ayrimVeOzelSahalar_getParentBuilder({ ...e, tabPageId: 'ozelSaha', tabPageEtiket: 'Özel Saha' });
			if (parentBuilder) { for (let ozelSahaGrup of ozelSahaYapilari) { parentBuilder.add(ozelSahaGrup.getOzelSahaFormBuilders(e)) } }
		}
	}
	static async rootFormBuilderDuzenleSonrasi_ayrimVeOzelSahalar_getParentBuilder(e) {
		let {tanimFormBuilder: parentBuilder} = e; if (parentBuilder) {
			let subBuilder = parentBuilder.builders.find(fbd => fbd.isTabs); if (subBuilder) {
				parentBuilder = subBuilder; let id = getFuncValue.call(this, e.tabPageId, e), etiket = getFuncValue.call(this, e.tabPageEtiket, e);
				let tabPageBuilder = new FBuilder_TabPage({ id, etiket }); parentBuilder.add(tabPageBuilder); parentBuilder = tabPageBuilder
			}
		}
		return parentBuilder
	}
	static getFormBuilders(e) { let _e = $.extend(e, { liste: [] }); this.formBuildersDuzenle(_e); return e.liste }
	static formBuildersDuzenle(e) { }
	formBuildersDuzenle(e) { this.class.formBuildersDuzenle(e) }
	static getRootFormBuilder_listeEkrani(e) {
		e = e || {}; let rootBuilder = new RootFormBuilder(); let _e = $.extend({}, e, { mfSinif: this, rootBuilder });
		$.extend(rootBuilder, { part: _e.sender, parent: _e.parent, layout: _e.layout, mfSinif: this });
		this.rootFormBuilderDuzenle_listeEkrani(_e); this.rootFormBuilderDuzenleSonrasi_listeEkrani(_e);
		rootBuilder = _e.rootBuilder; return rootBuilder
	}
	static rootFormBuilderDuzenle_listeEkrani(e) { }
	static rootFormBuilderDuzenleSonrasi_listeEkrani(e) { }
	getRootFormBuilder_listeEkrani(e) { return this.class.getRootFormBuilder_listeEkrani(e) }
	static fbd_listeEkrani_addCheckBox(_rfb, e, _text, _value, _handler, _onAfterRun, _styles) {
		let rfb = _rfb ?? (typeof e == 'object' ? e.rfb ?? e.builder : null);
		let id = typeof e == 'object' ? e.id : e, text = typeof e == 'object' ? e.text : _text;
		let handler = typeof e == 'object' ? e.handler : _handler;
		let value = typeof e == 'object' ? e.value : _value;
		let onAfterRun = typeof e == 'object' ? e.onAfterRun : _onAfterRun;
		let styles = typeof e == 'object' ? e.styles : _styles;
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
			let {builder} = e, input = builder.layout;
			if (value != null) input.children('input').attr('checked', value)
			/* input.appendTo(builder.parent); */
			if (handler) { input.on('change', evt => { let _e = $.extend({}, e, { event: evt, builder }); getFuncValue.call(this, handler, _e) }) }
			if ($.isFunction(onAfterRun)) getFuncValue.call(this, onAfterRun, e)
		})
		return fbd
	}
	static fbd_listeEkrani_addButton(_rfb, e, _text, _width, _handler, _onAfterRun, _styles) {
		let rfb = _rfb ?? (typeof e == 'object' ? e.rfb ?? e.builder : null);
		let id = typeof e == 'object' ? e.id : e;
		let text = typeof e == 'object' ? e.text : _text;
		let width = (typeof e == 'object' ? e.width : _width) || 130;
		if (typeof width == 'string') width = asFloat(width.slice(0, -2))
		let widthPx = typeof width == 'number' ? `${width}px` : width;
		let handler = typeof e == 'object' ? e.handler : _handler;
		let onAfterRun = typeof e == 'object' ? e.onAfterRun : _onAfterRun;
		let styles = typeof e == 'object' ? e.styles : _styles;
		rfb.islemTuslari_totalWidth = (rfb.islemTuslari_totalWidth || 0) + width;
		let fbd = rfb.addForm(id)
			.setLayout(e => {
				let {builder} = e, {parent} = builder;
				let elmBefore = parent.children('#tazele'); if (!elmBefore?.length) { elmBefore = parent.children('#vazgec') }
				return $(`<button id="${id}">${text}</buton>`).insertBefore(elmBefore)
			})
			.setParent(e => e.builder.rootPart.islemTuslariPart.sag).addCSS('bold')
			.addStyle(
				e => `$elementCSS { position: relative; top: 0px; min-width: unset !important; width: ${widthPx} !important; height: unset }`,
				e => `$elementCSS.jqx-fill-state-normal { background-color: var(--islemTuslari-button-bg-normal) !important; border: none }`
			)
			.onBuildEk(e => {
				let {builder} = e, btn = builder.layout;
				// btn.appendTo(builder.parent);
				btn.jqxButton({ theme: theme, width: false, height: false });
				if (handler) { btn.on('click', evt => { let _e = $.extend({}, e, { event: evt, builder }); getFuncValue.call(this, handler, _e) }) }
			})
			.onAfterRun(e => {
				let {builder} = e, {parent, layout, input} = builder, parentParent = parent.parents('.islemTuslari');
				parentParent.css('--width-sag', `calc((var(--button-right) * ${parent.children().length} + ${widthPx} + ${this.islemTuslari_sagButonlar_ekMarginX}px))`);
				/* input.detach().prependTo(parent); layout.remove(); builder.layout = input;
				input.css('position', 'relative'); input.css('width', widthPx); input.css('height', '47px'); input.css('top', '-10px');
				input.css('background-color', 'unset');*/
				if ($.isFunction(onAfterRun)) { getFuncValue.call(this, onAfterRun, e) }
			});
		if (!$.isEmptyObject(styles)) fbd.addStyle(styles)
		return fbd
	}
	getFormBuilders(e) { e = e || {}; let _e = $.extend(e, { liste: [] }); this.formBuildersDuzenle(_e); return _e.liste; }
	static async formBuilder_getTabPanel(e) {
		e = e || {}; let rfb = await this.getRootFormBuilder(), tanimForm = rfb.builders[0];
		let _e = $.extend({}, e, { tanimFormBuilder: tanimForm }); this.formBuilder_addTabPanel(_e);
		return { rootFormBuilder: rfb, tanimFormBuilder: tanimForm, tabPanel: _e.tabPanel }
	}
	static formBuilder_addTabPanel(e) {
		e = e || {}; let {tabPages} = e;
		let tabPanel = e.tabPanel = new FBuilder_Tabs({
			id: 'tabPanel', afterRun: e => {
				let {builder} = e, id2TabPanel = builder.rootPart.id2TabPanel = {};
				for (let subBuilder of builder.builders) { id2TabPanel[subBuilder.id] = subBuilder }
			}
		});
		tabPanel.addStyle_fullWH(); if (tabPages) { tabPanel.builders = tabPages }
		let {tanimFormBuilder} = e; tanimFormBuilder.add(tabPanel)
	}
	static async formBuilder_getTabPanelWithGenelTab(e) {
		let _e = $.extend({}, e), result = await this.formBuilder_getTabPanel(_e); $.extend(_e, result);
		this.formBuilder_addTabPanelWithGenelTab(_e); $.extend(_e, result); return _e
	}
	static formBuilder_addTabPanelWithGenelTab(e) {
		let {tabPanel} = e; if (!tabPanel) { this.formBuilder_addTabPanel(e); tabPanel = e.tabPanel }
		let id_genel = 'genel'; let tabPage_genel = tabPanel.builders.find(builder => builder.id == id_genel);
		if (!tabPage_genel) { tabPanel.builders.unshift(tabPage_genel = new FBuilder_TabPage({ id: id_genel, etiket: 'Genel' })) }
		tabPage_genel.addStyle_fullWH(); e.tabPage_genel = tabPage_genel
	}
	static get newSecimler() {
		let {secimSinif} = this; if (!secimSinif) { return null }
		let _e = { secimler: new secimSinif() }; _e.secimler.beginUpdate(); this.secimlerDuzenle(_e); this.secimlerDuzenleSon(_e);
		if (_e.secimler) { _e.secimler.endUpdate() }
		return _e.secimler
	}
	static secimlerDuzenle(e) {
		let {secimler: sec} = e; if (this.silindiDesteklenirmi) {
			sec.secimEkle('silindiDurumu', new SecimTekSecim({ etiket: `Çalışma Durumu`, tekSecimSinif: AktifVeDevreDisi }));
			sec.whereBlockEkle(e => {
				let {aliasVeNokta} = this, {where: wh, secimler: sec} = e;
				let value = sec.silindiDurumu.value; if (value) { wh.add(`${aliasVeNokta}silindi ${value == '1' ? '=' : '<>'} ''`) }
			})
		}
	}
	static secimlerDuzenleSon(e) { this.forAltYapiClassesDo('secimlerDuzenle', e) }
	static gridVeriYuklendi(e) { this.forAltYapiClassesDo('gridVeriYuklendi', e) }
	static gridVeriYuklendi_detaylar(e) { this.forAltYapiClassesDo('gridVeriYuklendi_detaylar', e) }
	static orjBaslikListesi_getGroups(e) { let _e = $.extend({}, e, { liste: [] }); this.orjBaslikListesi_groupsDuzenle(_e); return _e.liste }
	static orjBaslikListesi_groupsDuzenle(e) { this.forAltYapiClassesDo('orjBaslikListesi_groupsDuzenle', e) }
	static orjBaslikListesi_panelGrupAttrListeDuzenle(e) { this.forAltYapiClassesDo('orjBaslikListesi_panelGrupAttrListeDuzenle', e) }
	static orjBaslikListesi_panelUstSeviyeAttrListeDuzenle(e) { this.forAltYapiClassesDo('orjBaslikListesi_panelUstSeviyeAttrListeDuzenle', e) }
	static orjBaslikListesi_getHizliBulFiltreAttrListe(e) { let _e = { ...e, liste: [] }; this.orjBaslikListesi_hizliBulFiltreAttrListeDuzenle(_e); return _e.liste }
	static orjBaslikListesi_hizliBulFiltreAttrListeDuzenle(e) { this.forAltYapiClassesDo('orjBaslikListesi_hizliBulFiltreAttrListeDuzenle', e) }
	static orjBaslikListesi_gridInit(e) { this.forAltYapiClassesDo('orjBaslikListesi_gridInit', e) }
	static orjBaslikListesi_argsDuzenle(e) { this.forAltYapiClassesDo('orjBaslikListesi_argsDuzenle', e) }
	static orjBaslikListesi_argsDuzenle_detaylar(e) { this.forAltYapiClassesDo('orjBaslikListesi_argsDuzenle_detaylar', e) }
	static gridTazeleIstendi(e) { return this.forAltYapiClassesDo('gridTazeleIstendi', e) }
	static orjBaslikListesi_recsDuzenle(e) { this.forAltYapiClassesDoAsync('orjBaslikListesi_recsDuzenle', e) }
	static orjBaslikListesi_recsDuzenleSon(e) { this.forAltYapiClassesDoAsync('orjBaslikListesi_recsDuzenleSon', e) }
	static orjBaslikListesi_recsDuzenle_hizliBulIslemi(e) { this.forAltYapiClassesDoAsync('orjBaslikListesi_recsDuzenle_hizliBulIslemi', e) }
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
	static getSubRec(e) { let gridPart = e?.gridPart; return gridPart?.getSubRec(e) }
	static gridCellHandler_ilkIslemler(e) {
		let {gridPart} = e, {gridWidget} = gridPart, evt = e.event ?? e.evt, elm = e.elm = e.elm ?? $(evt.currentTarget), tr = e.tr = e.tr ?? elm.parents('[role = row]');
		let /* rowId = asInteger(tr.attr('row-id')) + 1, */ colIndex = e.colIndex = e.colIndex ?? asInteger(elm.parents('[role = gridcell]').attr('columnindex'));
		/*let colDef = e.colDef = gridPart.duzKolonTanimlari[colIndex], {belirtec} = colDef;*/
		let parentRec = e.parentRec = gridPart.selectedRec, rec = e.rec = this.getSubRec({ parentRec, colIndex, gridPart });
		if (gridPart.cokluSecimFlag) { setTimeout(() => gridWidget.clearselection(), 50) } return e
	}
	static get orjBaslikListesi() { let e = { liste: [] }; this.orjBaslikListesiDuzenle(e); this.orjBaslikDuzenleSonrasi(e); return e.liste }
	static orjBaslikListesiDuzenle(e) { }
	static orjBaslikDuzenleSonrasi(e) {
		this.forAltYapiClassesDo('orjBaslikListesiDuzenle', e); this.orjBaslikListesiDuzenle_ayrimVeOzelSahalar(e);
		if (!this.detaymi) {
			let {gonderildiDesteklenirmi, gonderimTSSaha} = this; if (gonderildiDesteklenirmi && gonderimTSSaha) {
				let {liste} = e, {tableAlias: alias} = this; liste.push(
					new GridKolon({ belirtec: gonderimTSSaha, text: 'Gnd.Tarih', genislikCh: 13 }).tipDate(),
					new GridKolon({ belirtec: gonderimTSSaha.toLowerCase().replace('ts', 'saat'), text: 'Gnd.Saat', genislikCh: 13, sql: `${alias}.${gonderimTSSaha}` }).tipTime()
				)
			}
		}
		let getCellClassName = (sender, rowIndex, belirtec, value, rec, prefix) => {
			let result = belirtec; if (prefix) { if ($.isArray(prefix)) { prefix = prefix.join(' ') } if (prefix != result) { result += ` ${prefix}` } }
			if (rec) {
				let ekCSS = this.getEkCSS({ sender, rowIndex, dataField: belirtec, value, rec });
				if (ekCSS) { if ($.isArray(ekCSS)) ekCSS = ekCSS.join(' ') }
				if (ekCSS) result += ` ${ekCSS}`
			}
			return result
		};
		let {liste} = e; for (let colDef of liste) {
			let {cellClassName: savedCellClassName} = colDef /*, savedCellsRenderer = colDef.cellsRenderer*/;
			colDef.cellClassName = (sender, rowIndex, belirtec, value, rec) => {
				let prefix = savedCellClassName ? getFuncValue.call(this, savedCellClassName, sender, rowIndex, belirtec, value, rec) : null;
				return getFuncValue.call(this, getCellClassName, sender, rowIndex, belirtec, value, rec, prefix)
			}
			/*colDef.cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
				let boundRec = rec?.bounddata ?? rec?.boundrec ?? rec?.boundrow;
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
		let {ayrimIsimleri} = this; if ($.isEmptyObject(ayrimIsimleri)) return
			/* ayrimBelirtec: 'stk', ayrimTableAlias: 'sayr' */
		let {ayrimBelirtec, ayrimTableAlias} = this, {liste} = e;
		for (let i = 0; i < ayrimIsimleri.length; i++) {
			let seq = i + 1, ayrimAdi = ayrimIsimleri[i];
			let ayrimAlias = `${ayrimTableAlias}${seq}`;									// 'sayr1' ...
			let colDef = new GridKolon({
				belirtec: `${ayrimBelirtec}ayradi${seq}`,									// 'stkayradi1' ...
				text: ayrimAdi, genislikCh: 18,
				sql: `${ayrimAlias}.aciklama`												// 'sayr1.aciklama' ...
			});
			liste.push(colDef)
		}
	}
	static orjBaslikListesiDuzenle_ozelSahalar(e) { }
	static get listeBasliklari() { let e = { liste: [] }; this.listeBasliklariDuzenle(e); return e.liste }
	static listeBasliklariDuzenle(e) {
		let {yerelParamBelirtec} = this, mfSinif2KolonAyarlari = app.params.yerel?.mfSinif2KolonAyarlari || {};
		let kolonAyarlari = mfSinif2KolonAyarlari[yerelParamBelirtec] || {}, {orjBaslikListesi} = this, {liste} = e;
		let {gorunumListesi} = kolonAyarlari; if ($.isEmptyObject(gorunumListesi)) { gorunumListesi = this.standartGorunumListesi }
		if ($.isEmptyObject(gorunumListesi)) { liste.push(...orjBaslikListesi) }
		else {
			let belirtec2OrjBaslik = {};
			for (let colDef of orjBaslikListesi) belirtec2OrjBaslik[colDef.belirtec] = colDef
			for (let belirtec of gorunumListesi) { let colDef = belirtec2OrjBaslik[belirtec]; if (colDef) liste.push(colDef) }
		}
	}
	static get standartGorunumListesi() {
		let e = { liste: [] }, uniqueKeys = {}; this.standartGorunumListesiDuzenle(e); this.standartGorunumListesiDuzenleDevam(e);
		let _liste = e.liste, liste = []; for (let key of _liste) { if (uniqueKeys[key]) { continue } uniqueKeys[key] = true; liste.push(key) }
		return liste
	}
	static standartGorunumListesiDuzenle(e) {
		if (this.tumKolonlarGosterilirmi) { let {liste} = e; liste.push(...Object.keys(asSet(this.orjBaslikListesi.map(colDef => colDef.belirtec)))) }
	}
	static standartGorunumListesiDuzenleDevam(e) { this.forAltYapiClassesDo('standartGorunumListesiDuzenle', e) }
	static raporSabitKolonlarOlustur(e) {
		let {liste} = e, {orjBaslikListesi} = this; e.alias = this.tableAlias;
		for (let colDef of orjBaslikListesi) liste.push(...(colDef.asRSahalar(e).filter(saha => !!saha)))
		this.forAltYapiClassesDo('raporSabitKolonlarOlustur', e)
	}
	static raporKategorileriDuzenle_master(e) { this.forAltYapiClassesDo('raporKategorileriDuzenle_master', e) }
	static raporKategorileriDuzenle_son(e) { this.forAltYapiClassesDo('raporKategorileriDuzenle_son', e) }
	static raporSabitKolonlarOlustur_detaylar(e) { this.forAltYapiClassesDo('raporSabitKolonlarOlustur_detaylar', e) }
	static sabitRaporKategorileriDuzenle_detaylar(e) { let {modelRapor} = e; debugger }
	static raporQueryDuzenle(e) { this.forAltYapiClassesDo('raporQueryDuzenle', e) }
	static raporQueryDuzenle_detaylar(e) { this.forAltYapiClassesDo('raporQueryDuzenle_detaylar', e) }
	static loadServerData(e) { return this.loadServerDataDogrudan(e) }
	static async loadServerDataDogrudan(e) {
		e ??= {}; let {offlineRequest, offlineMode} = e
		if (offlineRequest)
			this._online_sqlColDefs ??= await app.sqlGetColumns(this.table)
		e.query = await this.loadServerData_queryOlustur(e)
		return await this.loadServerData_querySonucu(e)
	}
	static loadServerData_queryOlustur(e = {}) {
		let {offlineRequest, secimler: sec} = e
		let offlineMode = e.offlineMode ?? e.isOfflineMode ?? e.offline ?? this.isOfflineMode
		let {gonderildiDesteklenirmi, gonderimTSSaha, gereksizTablolariSilYapilirmi} = this
		let tabloKolonlari = e.tabloKolonlari ??= offlineRequest ? this.orjBaslikListesi : this.listeBasliklari
		let sahalarAlinmasinFlag = e.sahalarAlinmasinFlag ?? e.sahalarAlinmasin
		let {table} = this, alias = e.alias || this.tableAlias
		let tableAndAlias = alias ? `${table} ${alias}` : table, aliasVeNokta = alias ? `${alias}.` : ''
		let sent = new MQSent({ from: tableAndAlias }), {where: wh, sahalar} = sent
		if (!sahalarAlinmasinFlag) {
			for (let colDef of tabloKolonlari) {
				if (!colDef.sqlIcinUygunmu)
					continue
				let {belirtec, sql} = colDef
				if (!offlineMode && gonderildiDesteklenirmi && gonderimTSSaha && (sql || belirtec)?.endsWith(gonderimTSSaha))
					continue
				// bilgi yükle-gönder için kolon tanım özel sql içeren bilgiler alınmaz (adı, teksecim clause ...)
				if (offlineRequest && !!sql)
					continue
				if (sql || belirtec)
					sahalar.add(sql ? `${sql} ${belirtec}` : `${aliasVeNokta}${belirtec}`)
			}
		}
		let keyHV = this.varsayilanKeyHostVars(e)
		if (keyHV)
			wh.birlestirDict({ alias, dict: keyHV })
		if (sec)
			wh.birlestir(sec.getTBWhereClause({ ...e, sent }))
		if (empty(sahalar.liste))
			sahalar.add(`${aliasVeNokta}*`)
		/* sent.groupByOlustur(); */
		let stm = new MQStm({ sent })
		$.extend(e, { table, alias, aliasVeNokta, stm, sent })
		this.loadServerData_queryDuzenle(e)
		stm = e.query ?? e.stm
		if (offlineRequest) {
			let {_online_sqlColDefs: cd} = this
			for (let {where: wh, sahalar, alias2Deger} of stm) {
				/* offlineMode == true : bilgi aktar  |  offlineMode == false : bilgi yükle */
				if (offlineMode && gonderildiDesteklenirmi && gonderimTSSaha)  // offline - gonderimTSSaha (sadece gönderilmeyenler gönderilir)
					wh.add(`${alias}.${gonderimTSSaha} = ''`)
				for (let key of keys(alias2Deger)) {
					if (!cd[key])
						delete alias2Deger[key]
				}
				if (sahalar.liste.length != keys(alias2Deger).length) {
					sahalar.liste = []
					for (let [alias, deger] of entries(alias2Deger))
						sahalar.add(new MQAliasliYapi({ alias, deger }))
				}
			}
		}
		this.loadServerData_queryDuzenle_son(e)
		if (gereksizTablolariSilYapilirmi) {
			if (stm?.getSentListe) {
				let disinda = alias
				for (let _sent of stm)
					_sent.gereksizTablolariSil({ disinda })
			}
		}
		return stm
	}
	static loadServerData_queryDuzenle(e = {}) {
		let sender = e.sender ?? e, {offlineRequest, offlineMode, parentPart} = e
		let ozelQueryDuzenleBlock = e.ozelQueryDuzenleBlock ?? e.ozelQueryDuzenle ?? e.stmDuzenle ?? e.stmDuzenleyici ??
			sender.ozelQueryDuzenleBlock ?? sender.ozelQueryDuzenle ??
			sender.stmDuzenle ?? sender.stmDuzenleyici
		let mfSinif = this, {kod, value, stm, stm: { sent, orderBy }, maxRow, wsArgs, tekilOku, basit, modelKullanmi} = e
		let {gonderildiDesteklenirmi, gonderimTSSaha, table, tableAlias: alias, aliasVeNokta} = this
		let {kodKullanilirmi, adiKullanilirmi, kodSaha, adiSaha} = this
		if (wsArgs)
			stm.fromGridWSArgs(wsArgs)
		/* if (value) value = value.toUpperCase() */
		if (kodSaha && (kod || value || maxRow)) {
			let orClauses = [];
			if (value) {
				let parts = value.split(' ')
				for (let _part of parts) {
					let part = _part?.trim()
					if (!part)
						continue
					let or = new MQOrClause()
					or.like(`%${part}%`, `${aliasVeNokta}${kodSaha}`)
					if (adiSaha) {
						or.like(`%${part.toUpperCase()}%`, `${aliasVeNokta}${adiSaha}`)
						or.like(`%${part.asTRUpper()}%`, `${aliasVeNokta}${adiSaha}`)
					}
					orClauses.push(or)
				}
			}
			for (let sent of stm) {
				let {where: wh} = sent
				if (kodSaha && kod)
					wh.degerAta(kod, `${aliasVeNokta}${kodSaha}`)
				if (orClauses) {
					for (let or of orClauses)
						wh.add(or)
				}
				if (maxRow)
					sent.top = sent.limit = maxRow
			}
		}
		if (!offlineRequest) {
			let {ayrimIsimleri, ayrimBelirtec, ayrimTable, ayrimTableAlias} = this
			if (!empty(ayrimIsimleri)) {
			let Prefix = `${ayrimBelirtec}ayradi`, {tabloKolonlari} = e, ayrimIndexStrSet
			if (tabloKolonlari) {
				ayrimIndexStrSet = {}
				for (let {belirtec} of tabloKolonlari) {
					if (belirtec.startsWith(Prefix)) {
						let key = belirtec.substring(Prefix.length)
						ayrimIndexStrSet[key] = true
					}
				}
			}
			else
				ayrimIndexStrSet = asSet(keys(ayrimIsimleri).map(x => asInteger(x) + 1))
			for (let sent of stm) {
				for (let indexStr of keys(ayrimIndexStrSet)) {
					let _ayrimTableAlias = `${ayrimTableAlias}${indexStr}`									// 'sayr1' ...
					let ayrimTableVeAlias = `${ayrimTable}${indexStr} ${_ayrimTableAlias}`					// 'stkayrim1 sayr1'
					let iliski = `${tableAlias}.ayrim${indexStr} = ${_ayrimTableAlias}.sayac`				// 'stk.ayrim1 = sayr1.sayac'
					sent.leftJoin(tableAlias, ayrimTableVeAlias, iliski)
				}
			}
		}
		this.forAltYapiClassesDo('loadServerData_queryDuzenle', e)
		; {
			let colDef = e.colDef ?? sender?.colDef ?? parentPart?.belirtec ? parentPart : null
			let {stmDuzenleyiciler} = parentPart ?? {}
			let _e = { ...e, sender, colDef, mfSinif, alias, aliasVeNokta, stm, sent }
			if (!kodKullanilirmi && adiKullanilirmi && adiSaha && !(tekilOku || basit || modelKullanmi))
				orderBy.add(adiSaha)
			ozelQueryDuzenleBlock?.call(this, _e)
			if (stmDuzenleyiciler) {
				for (let handler of stmDuzenleyiciler)
					handler?.call(this, _e)
			}
		}
	}
	}
	static loadServerData_queryDuzenle_son(e = {}) { }
	static async loadServerData_querySonucu(e = {}) {
		let sender = e.sender ?? e
		let ozelQuerySonucuBlock = e.ozelQuerySonucuBlock ?? e.ozelQuerySonucu ?? sender.ozelQuerySonucuBlock ?? sender.ozelQuerySonucu
		let {trnId, wsArgs, query} = e, defer = e.defer = e.defer ?? e.deferFlag ?? false
		delete e.defer; delete e.deferFlag
		let offlineMode = e.offlineMode ?? e.isOfflineMode ?? e.offline ?? this.isOfflineMode
		let _e = { offlineMode, defer, trnId, wsArgs, query }
		if (ozelQuerySonucuBlock)
			return getFuncValue.call(this, ozelQuerySonucuBlock, _e)
		let result = await this.forAltYapiClassesDoAsync('loadServerData_querySonucu', e)
		result = result ? result[result.length - 1] : undefined
		if (result !== undefined)
			return result
		result = await this.sqlExecSelect(_e)
		return result
	}
	tekilOku_queryOlustur(e) {
		e = e || {}; let tabloKolonlari = e.tabloKolonlari = e.tabloKolonlari ?? this.class.listeBasliklari;
		let alias = this.class.tableAlias, {aliasVeNokta} = this.class, sent = new MQSent({ from: this.class.tableAndAlias });
		let offlineMode = e.offlineMode ?? e.isOfflineMode ?? e.offline ?? this.class.isOfflineMode, {gonderildiDesteklenirmi, gonderimTSSaha} = this.class;
		for (let colDef of tabloKolonlari) {
			if (!colDef.sqlIcinUygunmu) { continue } let {belirtec, sql} = colDef;
			if (!offlineMode && gonderildiDesteklenirmi && gonderimTSSaha && (sql || belirtec)?.endsWith(gonderimTSSaha)) { continue }
			if (belirtec || sql) { sent.add(sql ? `${sql} ${belirtec}` : `${aliasVeNokta}${belirtec}`) }
		}
		sent.sahalar.add(`${aliasVeNokta}*`);
		let keyHV = this.keyHostVars(e); if ($.isEmptyObject(keyHV)) { keyHV = this.alternateKeyHostVars(e) }
		if (keyHV) { sent.where.birlestirDict({ alias, dict: keyHV }) }
		/* if ($.isEmptyObject(sent.sahalar.liste)) { sent.sahalar.add(`${aliasVeNokta}*`) } */
		let stm = new MQStm({ sent })
		$.extend(e, { stm, sent })
		this.tekilOku_queryDuzenle(e)
		stm = e.query || e.stm
		if (this.class.gereksizTablolariSilYapilirmi)
			sent.gereksizTablolariSil({ disinda: alias })
		return stm
	}
	tekilOku_queryDuzenle(e) {
		this.class.loadServerData_queryDuzenle({ ...e, tekilOku: true })
		this.forAltYapiKeysDo('tekilOku_queryDuzenle', e)
		this.class.loadServerData_queryDuzenle_son({ ...e, tekilOku: true })
	}
	static async tekilOku_querySonucu(e) {
		e = e || {}; let sender = e.sender ?? e, ozelQuerySonucuBlock = e.ozelQuerySonucuBlock ?? e.ozelQuerySonucu ?? sender.ozelQuerySonucuBlock ?? sender.ozelQuerySonucu;
		let {trnId, wsArgs, query} = e, offlineMode = e.offlineMode ?? e.isOfflineMode ?? e.offline ?? this.isOfflineMode, _e = { offlineMode, trnId, wsArgs, query };
		if (ozelQuerySonucuBlock) { return getFuncValue.call(this, ozelQuerySonucuBlock, _e) }
		let result = await this.forAltYapiClassesDoAsync('tekilOku_querySonucu', _e);
		result = result ? result[result.length - 1] : undefined; if (result !== undefined) { return result }
		if (typeof e.query == 'object' && !$.isPlainObject(e.query) && !(e.query.top || e.query.limit)) { $.extend(e.query, { top: 2, limit: null }) }
		return await this.sqlExecTekil(_e)
	}
	static get orjBaslikListesi_detaylar() { let e = { liste: [] }; this.orjBaslikListesiDuzenle_detaylar(e); return e.liste }
	static orjBaslikListesiDuzenle_detaylar(e) { }
	static get listeBasliklari_detaylar() { let e = { liste: [] }; this.listeBasliklariDuzenle_detaylar(e); return e.liste }
	static listeBasliklariDuzenle_detaylar(e) { this.orjBaslikListesiDuzenle_detaylar(e) }
	static loadServerData_detaylar(e) {
		e = e || {}; /* e.tabloKolonlari = e.tabloKolonlari || this.listeBasliklari_detaylar; */
		e.query = this.loadServerData_detaylar_queryOlustur(e); return this.loadServerData_detaylar_querySonucu(e)
	}
	static loadServerData_detaylar_queryOlustur(e) { return null }
	static loadServerData_detaylar_queryDuzenle(e) { this.forAltYapiClassesDo('loadServerData_detaylar_queryDuzenle', e) }
	static async loadServerData_detaylar_querySonucu(e) {
		let result = await this.forAltYapiClassesDoAsync('loadServerData_detaylar_querySonucu', e);
		result = result ? result[result.length - 1] : undefined; if (result !== undefined) { return result }
		return await this.loadServerData_querySonucu(e)
	}
	static get ayrimIsimleri() { let {ayrimTipKod} = this; return ayrimTipKod ? (app.params.ticariGenel?.ayrimIsimleri[ayrimTipKod] || []) : null }
	static getOzelSahaYapilari(e) {
		let result = this.globals?.ozelSahaYapilari;
		if (result === undefined && this.ozelSahaTipKod) result = this.globals.ozelSahaYapilari = this.getOzelSahaYapilariDogrudan(e)
		if (result && result.then) { result.then(_result => result = this.globals.ozelSahaYapilari = _result) }
		return result
	}
	static async getOzelSahaYapilariDogrudan(e) {
		let {ozelSahaTipKod} = this; if (!ozelSahaTipKod) return null
		let sent = new MQSent({
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
		let stm = new MQStm({ sent,  orderBy: ['grupSira', 'grupsayac', 'grupKod', 'sahaSira', 'sahasayac'] }); let recs = await app.sqlExecSelect(stm);
		let result = seviyelendir({
			source: recs, attrListe: ['grupKod'],
			getter: e => { let {item} = e; return new MQOzelSahaGrup({ sayac: item.grupsayac, kod: item.grupKod, aciklama: item.grupAdi }) },
			detayGetter: e => { let inst = new MQOzelSahaDetay(); inst.setValues({ rec: e.item }); return inst }
		});
		return result
	}
	async yukle(e) { await this.cacheOlustur(e); return super.yukle(e) }
	async yaz(e) { let result = await super.yaz(e); this.class.globalleriSil(); return result }
	async degistir(e) { let result = await super.degistir(e); this.class.globalleriSil(); return result }
	async sil(e) { let result = await super.sil(e); this.class.globalleriSil(); return result }
	async yeniTanimOncesiIslemler(e) { await super.yeniTanimOncesiIslemler(e); await this.forAltYapiKeysDoAsync('yeniTanimOncesiIslemler', e) }
	async yukleSonrasiIslemler(e) { await super.yukleSonrasiIslemler(e); await this.forAltYapiKeysDoAsync('yukleSonrasiIslemler', e) }
	async yeniTanimOncesiVeyaYukleSonrasiIslemler(e) { await super.yeniTanimOncesiVeyaYukleSonrasiIslemler(e); await this.forAltYapiKeysDoAsync('yeniTanimOncesiVeyaYukleSonrasiIslemler', e) }
	async uiGirisOncesiIslemler(e) { await this.forAltYapiKeysDoAsync('uiGirisOncesiIslemler', e) }
	async uiKaydetOncesiIslemler(e) {
		await this.forAltYapiKeysDoAsync('uiKaydetOncesiIslemler', e);
		let result = await this.dataDuzgunmu(e);
		if (!(result == null || result == true)) {
			if (typeof result != 'object') {
				result = { isError: false, rc: 'hataliBilgiGirisi', errorText: (typeof result == 'boolean' ? null : result?.toString()) };
				throw result
			}
		}
	}
	async dataDuzgunmu(e) {
		let results = (await this.forAltYapiKeysDoAsync('dataDuzgunmu', e))?.flat()?.filter(x => !!x);
		return results?.length ? `<ul>${results.map(x => `<li>${x}</li>`).join(CrLf)}</ul>` : null
	}
	async kaydetVeyaSilmeOncesiIslemler(e = {}) { await super.kaydetVeyaSilmeOncesiIslemler(e); await this.forAltYapiKeysDoAsync('kaydetVeyaSilmeOncesiIslemler', e) }
	async yeniOncesiIslemler(e = {}) { await super.yeniOncesiIslemler(e); await this.forAltYapiKeysDoAsync('yeniOncesiIslemler', e) }
	async degistirOncesiIslemler(e = {}) { await super.degistirOncesiIslemler(e); await this.forAltYapiKeysDoAsync('degistirOncesiIslemler', e) }
	async silmeOncesiIslemler(e = {}) { await super.silmeOncesiIslemler(e); await this.forAltYapiKeysDoAsync('silmeOncesiIslemler', e) }
	async kaydetOncesiIslemler(e = {}) { await super.kaydetOncesiIslemler(e); e.ozelSahaYapilari = this.class?.getOzelSahaYapilari?.(e); await this.forAltYapiKeysDoAsync('kaydetOncesiIslemler', e) }
	async yeniSonrasiIslemler(e = {}) { await super.yeniSonrasiIslemler(e); await this.forAltYapiKeysDoAsync('yeniSonrasiIslemler', e) }
	async degistirSonrasiIslemler(e = {}) { await super.degistirSonrasiIslemler(e); await this.forAltYapiKeysDoAsync('degistirSonrasiIslemler', e) }
	async silmeSonrasiIslemler(e = {}) { await super.silmeSonrasiIslemler(e); await this.forAltYapiKeysDoAsync('silmeSonrasiIslemler', e) }
	async kaydetOncesiIslemler(e = {}) { await super.kaydetOncesiIslemler(e); e.ozelSahaYapilari = this.class?.getOzelSahaYapilari?.(e); await this.forAltYapiKeysDoAsync('kaydetOncesiIslemler', e) }
	async kaydetSonrasiIslemler(e = {}) { await super.kaydetSonrasiIslemler(e); await this.forAltYapiKeysDoAsync('kaydetSonrasiIslemler', e) }
	async kaydetVeyaSilmeSonrasiIslemler(e = {}) { await super.kaydetVeyaSilmeSonrasiIslemler(e); await this.forAltYapiKeysDoAsync('kaydetVeyaSilmeSonrasiIslemler', e) }
	donusumBilgileriniSil(e) { }
	static varsayilanKeyHostVars(e) {
		let hv = super.varsayilanKeyHostVars(e), _results = this.forAltYapiClassesDo('varsayilanKeyHostVars', e) || [];
		for (let _hv of _results) { if (_hv) $.extend(hv, _hv) } return hv
	}
	static varsayilanKeyHostVarsDuzenle(e) { super.varsayilanKeyHostVarsDuzenle(e); this.forAltYapiClassesDo('varsayilanKeyHostVarsDuzenle', e) }
	keyHostVars(e) { let hv = super.keyHostVars(e), _results = this.forAltYapiKeysDo('keyHostVars', e) || []; for (let _hv of _results) { if (_hv) $.extend(hv, _hv) } return hv }
	keyHostVarsDuzenle(e) { super.keyHostVarsDuzenle(e); this.forAltYapiKeysDo('keyHostVarsDuzenle', e) }
	keySetValues(e) { super.keySetValues(e); this.forAltYapiKeysDo('keySetValues', e) }
	alternateKeyHostVars(e) { let hv = super.alternateKeyHostVars(e), _results = this.forAltYapiKeysDo('alternateKeyHostVars', e) || []; for (let _hv of _results) { if (_hv) $.extend(hv, _hv) } return hv }
	alternateKeyHostVarsDuzenle(e) { super.alternateKeyHostVarsDuzenle(e); this.forAltYapiKeysDo('alternateKeyHostVarsDuzenle', e) }
	hostVars(e) { let hv = super.hostVars(e), _results = []; for (let _hv of _results) { if (!$.isEmptyObject(_hv)) { $.extend(hv, _hv) } } return hv }
	pIO_hostVarsDuzenle(e) { super.pIO_hostVarsDuzenle(e); this.forAltYapiKeysDo('pIO_hostVarsDuzenle', e) }
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); let {hv, ozelSahaYapilari} = e, {ayrimlar, ozelSahalar} = this, {ayrimIsimleri} = this.class;
		if (!$.isEmptyObject(ayrimIsimleri)) { for (let i = 0; i < ayrimIsimleri.length; i++) { let seq = i + 1, value = ayrimlar[seq] || null; hv[`ayrim${seq}`] = value } }
		if (window.MQOzelSahaDetay && !$.isEmptyObject(ozelSahaYapilari)) {
			let {prefix} = MQOzelSahaDetay;
			for (let ozelSahaGrup of ozelSahaYapilari) {
				for (let ozelSaha of ozelSahaGrup.detaylar) {
					let key = ozelSaha.attr, ozelSahaKey = key.substring(prefix.length), value = ozelSaha.getConvertedValue(ozelSahalar[ozelSahaKey] ?? null);
					hv[key] = value
				}
			}
		}
		this.forAltYapiKeysDo('hostVarsDuzenle', e)
	}
	setValues(e) {
		super.setValues(e); let {rec} = e, ayrimlar = this.ayrimlar = {}, ozelSahalar = this.ozelSahalar = {}, {ayrimIsimleri} = this.class;
		for (let key in rec) {
			let prefix;
			if (!$.isEmptyObject(ayrimIsimleri)) {
				prefix = 'ayrim';
				if (key.length > prefix.length && key.startsWith(prefix)) {
					let value = rec[key];
					if (value != null) { let seq = asInteger(key.substring(prefix.length)), index = seq - 1; if (index < ayrimIsimleri.length) ayrimlar[seq] = value }
				}
			}
			if (window.MQOzelSahaDetay) {
				prefix = MQOzelSahaDetay.prefix;
				if (key.length > prefix.length && key.startsWith(prefix)) {
					let value = rec[key];
					if (value != null) { let ozelSahaKey = key.substring(prefix.length); ozelSahalar[ozelSahaKey] = value }
				}
			}
		}
		this.forAltYapiKeysDo('setValues', e)
	}
	static listeEkraniAc(e) {
		let {listeUISinif} = this; if (!listeUISinif) { return null }
		e = e || {}; e.mfSinif = e.mfSinif || this;
		try { let part = new listeUISinif(e), result = part.run(); return { part, result } }
		catch (ex) { displayMessage(getErrorText(ex)); throw ex }
	}
	static async tanimla(e) {
		e = e || {}; let {tanimUISinif} = this, {tanimOncesiEkIslemler} = e; if (!tanimUISinif) { return null }
		e.islem = e.islem || 'yeni'; e.mfSinif = e.mfSinif || this;
		try {
			let part = e.tanimPart = new tanimUISinif(e);
			if (tanimOncesiEkIslemler) {
				let _result = await getFuncValue.call(this, tanimOncesiEkIslemler, e);
				if (_result === false) { return ({ part, result: false }) }
			}
			let result = await part.run();
			return { part, result }
		}
		catch (ex) { hConfirm(getErrorText(ex)); throw ex }
	}
	tanimla(e) { e = e || {}; e.inst = e.inst || this; return this.class.tanimla(e) }
	cacheOlustur(e) { }
	static async getGloAdi2KodListe(e) {
		let {globals} = this; let result = globals.adi2KodListe;
		if (!result) {
			let kod2Adi = await this.getGloKod2Adi(e); result = globals.adi2KodListe = {};
			for (let kod in kod2Adi) { let adi = kod2Adi[kod]; if (adi) { adi = adi.toLocaleUpperCase().trim(); (result[adi] = result[adi] || []).push(kod) } }
		}
		return result
	}
	static async getGloKod2Adi(e) {
		e = e || {}; if (typeof e != 'object') e = { kod: e }
		let {kod} = e, {globals} = this, {kod2Adi: result} = globals; delete e.kod;
		if (!result) {
			let kod2Rec = await this.getGloKod2Rec(e), adiSaha = e.adiSaha ?? this.adiSaha;
			result = globals.kod2Adi = {}; for (let kod in kod2Rec) {
				result[kod] = kod2Rec[kod][adiSaha] }
		}
		return kod ? result[kod] : result
	}
	static async getGloKod2Rec(e) {
		let {globals} = this, {kod2Rec: result} = globals;
		if (result == null) { result = globals.kod2Rec = await this.getKod2Rec(e) }
		return result
	}
	static async getKod2Rec(e) {
		let basit = true, kodSaha = e?.kodSaha ?? this.kodSaha;
		let recs = (await this.loadServerData({ ...e, basit })) || [];
		let result = {}; for (let rec of recs) {
			let kod = rec[kodSaha]; result[kod] = rec }
		return result
	}
	static async getGloKod2Inst(e) {
		let {globals} = this, {kod2Inst: result} = globals;
		if (result == null) { result = globals.kod2Inst = await this.getKod2Inst(e) }
		return result
	}
	static async getKod2Inst(e) {
		let kod2Rec = await this.getKod2Rec(e) ?? {};
		let result = {}; for (let [kod, rec] of Object.entries(kod2Rec)) {
			let inst = new this();
			if (await inst.yukle({ rec })) { result[kod] = rec }
		}
		return result
	}
	static kodVarmi(e, _zorunlumu) {
		e = e || {}; let kod = typeof e == 'object' ? e.kod : e;
		let zorunlumu = _zorunlumu ?? (typeof e == 'object' ? e.zorunlu ?? e.zorunlumu : null);
		if (zorunlumu && !kod) { return false }
		return !kod || new this({ kod }).varmi(e)
	}
	static partLayoutDuzenle(e) {
		let {sender, layout, fis, argsDuzenle} = e, noAutoWidth = e.noAutoWidth ?? false, isDropDown = e.dropDown ?? false, mfSinif = e.mfSinif || this;
		let _e = $.extend({}, e, { args: { sender: sender, layout, dropDown: isDropDown, mfSinif, noAutoWidth, dropDownWidth: '200%', value: getFuncValue.call(this, e.value ?? e.kod, { sender, fis }) } });
		if (argsDuzenle) getFuncValue.call(this, argsDuzenle, _e.args);
		let part = e.result = new ModelKullanPart(_e.args); part.run(); return part
	}
	static getGridKolonlar(e) {
		e = e || {}; let {belirtec} = e, gridKolonGrupcu = e.gridKolonGrupcu || 'getGridKolonGrup', {duzenleyici} = e, stmDuzenleyici = e.stmDuzenle ?? e.stmDuzenleyici;
		let _e = { ...e, mfSinif: this, belirtec, liste: [], kodEtiket: e.kodEtiket, adiEtiket: e.adiEtiket, stmDuzenleyici };
		let colDef = $.isFunction(gridKolonGrupcu) ? gridKolonGrupcu.call(this, _e) : this[gridKolonGrupcu].call(this, _e);
		if (colDef) {
			let sabitleFlag = e.sabitle ?? e.sabitleFlag, hiddenFlag = e.hidden ?? e.hiddenFlag, autoBind = e.autoBind ?? e.autoBindFlag;
			let readOnly = e.readOnly ?? e.readOnlyFlag, kodsuzFlag = e.kodsuz ?? e.kodsuzFlag;
			if (sabitleFlag) { colDef.sabitle() } if (hiddenFlag) { colDef.hidden() }
			if (autoBind) { colDef.autoBind() } if (readOnly) { colDef.readOnly() }
			if (kodsuzFlag) { colDef.kodsuz() }
			_e.colDef = colDef; duzenleyici?.call(this, _e);
			_e.liste.push(colDef)
		}
		this.gridKolonlarDuzenle(_e); return _e.liste
	}
	static gridKolonlarDuzenle(e) { this.forAltYapiClassesDo('gridKolonlarDuzenle', e) }
	static getGridKolonGrup(e) { }
	static globalleriSil() { let {classKey, mqGlobals} = this, result = mqGlobals[classKey]; delete app.mqGlobals[classKey]; return result }
	static tempsReset() { let {classKey, mqTemps} = this, result = mqTemps[classKey]; delete mqTemps[classKey]; return result }
	static async kodYoksaMesaj(e, _etiket, _zorunlumu) {
		e = e || {}; let kod = typeof e == 'object' ? e.kod : e;
		let etiket = (typeof e == 'object' ? e.etiket ?? e.sinifAdi : _etiket) ?? this.sinifAdi ?? '';
		let zorunlu = _zorunlumu ?? e.zorunlu ?? e.zorunlu;
		return this.kodVarmi && !(await this.kodVarmi({ kod, zorunlu }))
			? `<u class="bold royalblue">${etiket}</u> ${kod ? `için <b class="red">${kod}</b> değeri hatalıdır` : `<b>boş olamaz</b>`}`
			: null
	}
	static bosVeyaKodYoksaMesaj(e, _etiket) { return this.kodYoksaMesaj(e, _etiket, true) }
	static async sayacYoksaMesaj(e) {
		e = e || {}; let sayac = typeof e == 'object' ? e.sayac : e;
		let etiket = (typeof e == 'object' ? e.etiket ?? e.sinifAdi : _etiket) ?? this.sinifAdi ?? '';
		let zorunlu = _zorunlumu ?? e.zorunlu ?? e.zorunlu;
		return this.sayacVarmi && !(await this.sayacVarmi({ sayac, zorunlu })) ? `${etiket} için kayıt bulunamadı` : null
	}
	static bosVeyaSayacYoksaMesaj(e, _etiket) { return this.sayacYoksaMesaj(e, _etiket, true) }
	static get tekrarlayanKolonlar() {
		let sahaSet = {}, result = {};
		for (let colDef of this.orjBaslikListesi) {
			let {belirtec} = colDef; if (sahaSet[belirtec]) { result[belirtec] = colDef; continue }
			sahaSet[belirtec] = true
		}
		return result
	}
	static tazeleVeYakalaDefer(e) { let part = e.part ?? e.builder?.rootPart; part.tazeleDefer() }
	static tazeleVeYakala(e) { let part = e.part ?? e.builder?.rootPart; part.tazele() }
	static getGridRecs(e) { let gridPart = e.gridPart ?? e.part ?? e.builder.rootPart ?? e.sender; return e.recs ?? (e.rec ? [e.rec] : null) ?? gridPart?.selectedRecs }
	static getGridRec(e) { return (this.getGridRecs(e) || [])[0] }
	static forAltYapiClassesDo(e, ..._args) {
		e = e || {}; let blockOrSelector = typeof e == 'object' ? (e.selector ?? e.block ?? e.action) : e, results = [];
		let selector = typeof blockOrSelector == 'string' ? blockOrSelector : null;
		let block = typeof blockOrSelector == 'string' ? null : blockOrSelector;
		if (blockOrSelector) {
			let args = (typeof e == 'object' ? e.args : _args) || [], {altYapiDict} = this; if (altYapiDict == null) { return }
			for (let cls of Object.values(altYapiDict)) {
				if (cls) {
					cls.__proto__.mfSinif = this;
					if (selector) { block = cls[selector] }
					if (block) { results.push(getFuncValue.call(cls, block, ...args)) }
				}
			}
		}
		return results
	}
	forAltYapiKeysDo(e, ..._args) {
		e = e || {}; let blockOrSelector = typeof e == 'object' ? (e.selector ?? e.block ?? e.action) : e, results = [];
		let selector = typeof blockOrSelector == 'string' ? blockOrSelector : null;
		let block = typeof blockOrSelector == 'string' ? null : blockOrSelector;
		if (blockOrSelector) {
			let args = (typeof e == 'object' ? e.args : _args) || [], {altYapiDict} = this.class; if (altYapiDict == null) { return }
			for (let key in altYapiDict) {
				let altInst = this[key];
				if (altInst) {
					if (selector) { block = altInst[selector] }
					if (block) { results.push(getFuncValue.call(altInst, block, ...args)) }
				}
			}
		}
		return results
	}
	static async forAltYapiClassesDoAsync(e, ..._args) {
		e = e || {};
		let blockOrSelector = typeof e == 'object' ? (e.selector ?? e.block ?? e.action) : e, results = [];
		let selector = typeof blockOrSelector == 'string' ? blockOrSelector : null;
		let block = typeof blockOrSelector == 'string' ? null : blockOrSelector;
		if (blockOrSelector) {
			let args = (typeof e == 'object' ? e.args : _args) || [], {altYapiDict} = this; if (altYapiDict == null) { return }
			for (let cls of Object.values(altYapiDict)) {
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
		e = e || {}; let blockOrSelector = typeof e == 'object' ? (e.selector ?? e.block ?? e.action) : e, results = [];
		let selector = typeof blockOrSelector == 'string' ? blockOrSelector : null;
		let block = typeof blockOrSelector == 'string' ? null : blockOrSelector;
		if (blockOrSelector) {
			let args = (typeof e == 'object' ? e.args : _args) || [], {altYapiDict} = this.class; if (altYapiDict == null) { return }
			for (let key in altYapiDict) {
				let altInst = this[key];
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
	let result = await MQCogul.formBuilder_getTabPanelWithGenelTab();
	let {tabPage_genel, tabPanel, rootFormBuilder} = result;
	
	let form = tabPage_genel.addForm('dis-form', e => $(`<div class="dis-form"/>`));
	form.addTextInput('aciklama', 'Açıklama');
	form.addTextInput('aciklama2', 'Açıklama 2');
	
	form = tabPage_genel.addForm('grid-form', e => $(`<div class="grid-form"/>`));
	form.addForm(null, e => $(`<h2>Stok Grupları</h2>`));
	let grid = form.addGridliGiris_sabit('grid');
	grid.setSource(e => MQStokGrup.loadServerData(e));
	grid.setTabloKolonlari(e => MQStokGrup.orjBaslikListesi);
	grid.widgetArgsDuzenleIslemi(e => {
		e.args.showGroupsHeader = true
	});
	grid.onAfterRun(e => {
		let {builder} = e;
		let {part} = builder;
		part.grid.on('rowclick', evt => {
			let rec = evt.args.row.bounddata;
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
