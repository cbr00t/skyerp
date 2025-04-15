class RaporTanimPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'raporTanim' } static get isWindowPart() { return true } get wndDefaultIsModal() { return false }
	get yenimi() { return this.islem == 'yeni' } get degistirmi() { return this.islem == 'degistir' } get silmi() { return this.islem == 'silmi' }
	get kopyami() { return this.islem == 'kopya' } get yeniVeyaKopyami() { return this.yenimi || this.kopyami } get degistirVeyaSilmi() { return this.degistirmi || this.silmi }
	
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {
			islem: e.islem, mfSinif: e.mfSinif, inst: e.inst, eskiInst: e.eskiInst,
			raporcu: e.raporcu, builder: e.builder, kaydedince: e.kaydedince
		});
		let {mfSinif, inst, eskiInst} = this;
		if (!inst && mfSinif) inst = this.inst = new mfSinif(); if (inst && !mfSinif) mfSinif = this.mfSinif = inst.class
		if (inst && !eskiInst && this.degistirmi) eskiInst = this.eskiInst = inst.deepCopy()
		this.title = this.title || `${mfSinif?.sinifAdi || 'Rapor'} Tanım`;
		const {islem} = this;
		if (islem) { const islemText = islem[0].toUpperCase() + islem.slice(1); this.title += ` &nbsp;[<span class="window-title-ek">${islemText}</span>]` }
	}
	async init(e) { e = e || {}; await super.init(e); /*this.hideBasic();*/ const {layout} = this; layout.find('main').addClass('animate-wnd-content-slow') }
	runDevam(e) {
		e = e || {}; super.runDevam(e); const {layout, raporcu} = this;
		if (raporcu) raporcu._promise_wait = raporcu.kategorileriOlustur()
		const header = this.header = layout.find('header'), content = this.content = layout.find('main');
		$.extend(this, { islemTuslari: header.find('#islemTuslari'), subHeader: content.find('.sub-header'), splitMain: content.find('.split-main') });
		this.initIslemTuslari(e); this.initSplit(e); this.initLayout(e)
	}
	afterRun(e) {
		super.afterRun(e); /*setTimeout(() => this.show(), 100);*/
		setTimeout(async () => { await this.initFormBuilder(e); this.formGenelEventleriBagla(e); if (this.yeniVeyaKopyami) this.yeniTanimOncesiIslemler(e) /*this.show()*/ }, 0)
	}
	destroyPart(e) { e = e || {}; for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.destroyPart) builder.destroyPart(e) } super.destroyPart(e) }
	async initFormBuilder(e) {
		let {builder} = this; const {inst} = this;
		if (!builder && inst) { const _e = { sender: this }; builder = (await inst.getRootFormBuilder(_e)) ?? (await inst.getFormBuilders(_e)) } if ($.isEmptyObject(builder)) return
		const {layout} = this, subBuilders = builder.isFormBuilder ? [builder] : builder, id2Builder = this.id2Builder = {};
		for (const key in subBuilders) {
			const builder = subBuilders[key]; if (!builder) continue
			let _parent = builder.parent; builder.part = this;
			if (builder.isRootFormBuilder) {
				this.builder = builder; let _layout = builder.layout;
				if (!( _parent?.length || _layout?.length)) _layout = builder.layout = layout
			}
			else if (!_parent?.length) _parent = builder.parent = layout
			let _id = builder.id; if (!_id) _id = builder.id = builder.newElementId();
			if (_id) id2Builder[_id] = builder
			/*builder.noAutoInitLayout();*/ builder.run()
		}
	}
	initIslemTuslari(e) {
		const rfb = new RootFormBuilder({ part: this });
		rfb.addIslemTuslari('islemTuslari').setLayout(e => e.builder.rootPart.islemTuslari)
			.widgetArgsDuzenleIslemi(e => $.extend(e.args, {
				ekButonlarIlk: [
					{ id: 'ustAltBilgi', text: 'UST-ALT', handler: e => e.sender.ustAltBilgiIstendi(e) },
					{ id: 'frDizayn', text: 'FR', handler: e => e.sender.frDizaynIstendi(e) },
					{ id: 'frDizaynSil', text: 'FR-SİL', handler: e => e.sender.frDizaynSilIstendi(e) },
					{ id: 'tamam', handler: e => e.sender.kaydetIstendi(e) },
					{ id: 'vazgec', handler: e => e.sender.vazgecIstendi(e) }
				],
				ekSagButonIdSet: ['ustAltBilgi', 'frDizayn', 'frDizaynSil']
			}))
			.onAfterRun(e => { const {builder} = e, {part, rootPart} = builder; rootPart.islemTuslariPart = part })
			.addStyle(e => `$elementCSS > * { --button-width: 90px !important } $elementCSS button#tamam { margin-left: 50px }`);
		rfb.run() 
	}
	initSplit(e) {
		const {splitMain} = this; splitMain.jqxSplitter({
			theme, width: false, height: false, orientation: 'vertical', splitBarSize: 20,
			panels: [{ min: 0, size: '15%' }, { min: '70%', size: '80%' }]
		})
	}
	initLayout(e) {
		const {subHeader, splitMain, inst, raporcu} = this, rfb = new RootFormBuilder({ part: this, inst }); inst._arayaAktarFlag = true;
		let gridParent = splitMain.find('.sol .grid-parent');
		let form = rfb.addForm().setParent(subHeader).addFormWithParent();
		form.addTextInput('aciklama', 'Rapor Adı'); form.addTextInput('aciklama2', 'Rapor Adı 2');
		form = rfb.addForm().setParent(splitMain.find('.sol .header')).yanYana();
		form.addModelKullan('kolonKategoriKod', ' ').dropDown().kodsuz().noMF().etiketGosterim_yok()
			.setSource(e => Object.keys(e.builder.rootPart.raporcu?.kolonKategoriler))
			.degisince(e => this.kolonKategoriKodDegisti(e))
		form.addButton('sag-ok').addCSS('button-parent').onClick(e => this.listeyeAlIstendi(e));
		rfb.addGridliGosterici('grid-kalanlar').addStyle_fullWH().rowNumberOlmasin().setParent(gridParent)
			.setTabloKolonlari(e => [
				new GridKolon({ belirtec: 'baslik', text: ' ', width: '92%', maxWidth: 40 * katSayi_ch2Px }),
				new GridKolon({ belirtec: 'attr', text: 'Attr', genislikCh: 30 })
			])
			.setSource(e => this.getKalanlar(e))
			.widgetArgsDuzenleIslemi(e => {
				$.extend(e.builder.part, { gridRendered: e => this.onGridRendered_ortak(e) });
				$.extend(e.args, { adaptive: false, selectionMode: 'checkbox', showFilterRow: true })
			})
			.onAfterRun(e => { const {builder} = e, {part, rootPart} = builder; rootPart.gridKalanlar = part; rootPart.initGrid_kalanlar(e) });
		gridParent = splitMain.find('.sag .grid-parent');
		form = rfb.addForm().setParent(splitMain.find('.sag .header')).yanYana();
		form.addButton('sol-ok').addCSS('button-parent').onClick(e => this.listedenCikarIstendi(e));
		form.addButton('textEkle', 'TXT').addCSS('button-parent').onClick(e => this.textEkleIstendi(e));
		form.addButton('formulEkle', 'FRM').addCSS('button-parent').onClick(e => this.formulEkleIstendi(e));
		form.addButton('kirilmaYap', 'KIR').addCSS('button-parent').onClick(e => this.kirilmaYapIstendi(e));
		form.addCheckBox('_arayaAktarFlag', 'Satır Arasına Aktar').top().addStyle_wh({ width: 'auto' });
		/*rfb.addForm().setLayout(gridParent.parent().children('#sol-ok')).onBuildEk(e => {
			const {builder} = e, {layout} = builder; layout.jqxButton({ theme }); layout.on('click', evt => this.listedenCikarIstendi($.extend({}, e, { event: evt })))
		});*/
		let cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
			const cls = rec?.class;
			if (belirtec == 'baslik' && cls?.kirilmami) html = changeTagContent(html, `<b>- Kırılma -</b>`)
			if (belirtec == 'attr' && cls?.degiskenmi) html = changeTagContent(html, `<span style="color: #999">[ <span class="bold" style="color: #555">${value}</span> ]</span>`)
			return html
		};
		let cellClassName = (sender, rowIndex, belirtec, value, rec) => {
			const result = [belirtec],  cls = rec?.class;
			if (cls?.degiskenmi) { result.push('degisken'); if (belirtec == 'attr') result.push('grid-readOnly') }
			if (cls?.kirilmami) result.push('kirilma bg-lightroyalblue')
			return result.join(' ')
		};
		let cellBeginEdit = (colDef, rowIndex, belirtec, colType, value, result) => {
			const {gridWidget} = colDef.gridPart, rec = gridWidget.getrowdata(rowIndex), cls = rec?.class;
			return cls && !((belirtec == 'attr' && cls.degiskenmi) || cls.kirilmami)
		};
		rfb.addGridliGiris('grid-secilenler').addStyle_fullWH().sabit().setParent(gridParent)
			.setTabloKolonlari(e => [
				new GridKolon({ belirtec: 'baslik', text: 'Başlık 1', genislikCh: 50, cellsRenderer, cellClassName, cellBeginEdit }),
				new GridKolon({ belirtec: 'attr', text: 'Attr', genislikCh: 20, cellsRenderer, cellClassName, cellBeginEdit }),
				new GridKolon({ belirtec: 'genislikCh', text: 'Genişlik', genislikCh: 7, cellsRenderer, cellClassName, cellBeginEdit }).tipNumerik().sifirGosterme()
			])
			.setSource(e => this.getSecilenler(e))
			.widgetArgsDuzenleIslemi(e => {
				$.extend(e.builder.part, { gridRendered: e => this.onGridRendered_ortak(e) });
				$.extend(e.args, { filterMode: 'excel', selectionMode: 'singlecell' })
			})
			.onAfterRun(e => { const {builder} = e, {part, rootPart} = builder; rootPart.gridSecilenler = part; rootPart.initGrid_secilenler(e) });
		/*rfb.onAfterRun(e => setTimeout(() => this.onResize(e), 1));*/
		setTimeout(async () => {
			if (raporcu) { await raporcu._promise_wait; if (inst && !inst.kolonKategoriKod) inst.kolonKategoriKod = Object.keys(raporcu.kolonKategoriler)[0] }
			rfb.run()
		}, 10)
	}
	initGrid_kalanlar(e) { const {builder} = e, gridPart = builder.part, {grid, gridWidget} = gridPart }
	initGrid_secilenler(e) {
		const {builder} = e, gridPart = builder.part, {grid, gridWidget} = gridPart
		/*setTimeout(() => { grid.height(''); this.onResize() }, 1000)*/
	}
	yeniTanimOncesiIslemler(e) {
		e = e || {}; e.sender = this;
		for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.yeniTanimOncesiIslemler) builder.yeniTanimOncesiIslemler(e) }
	}
	async getKalanlar(e) {
		const {raporcu, inst} = this; if (!raporcu) return [{ baslik: 'satır 1' }, { baslik: 'satır 2' }, { baslik: 'satır 3' }]
		const {kolonKategoriler} = raporcu, {detaylar} = inst, kolonKategoriKod = inst.kolonKategoriKod || Object.keys(kolonKategoriler)[0];
		const tumSahalarSet = asSet(inst.tumSahalar.map(saha => saha.attr));
		return $.merge([], kolonKategoriler[kolonKategoriKod]?.detaylar || []).filter(saha => !tumSahalarSet[saha.attr])
	}
	async getSecilenler(e) {
		const {inst} = this, {detaylar} = inst; if (!detaylar) return [{ baslik: 'satır 4' }, { baslik: 'satır 5' }]
		return detaylar || []
	}
	onGridRendered_ortak(e) {
		const {builder} = e, rootPart = builder?.rootPart, gridPart = builder?.part, {grid, gridWidget} = gridPart || {};
		const gridRows = gridWidget ? $(gridWidget.table).find('*[role=row] > div') : null; if (!gridRows?.length) { return }
		/*const dropTargetPart = (
			gridPart == rootPart.gridKalanlar ? rootPart.gridSecilenler :
			gridPart == rootPart.gridSecilenler ? rootPart.gridKalanlar : null
		); if (!dropTargetPart) return;*/
		let currentDropTargetPart, recs;
		gridRows.jqxDragDrop({
			appendTo: 'body', dragZIndex: 99999, dropAction: 'none', revert: true,
			/*dropTarget: $(dropTargetPart.grid),*/ dropTarget: $([rootPart.gridKalanlar.grid, rootPart.gridSecilenler.grid]),
			initFeedback: feedback => feedback.addClass('feedback')
		});
		gridRows.off('dragStart'); gridRows.off('dragEnd'); gridRows.off('dropTargetEnter'); gridRows.off('dropTargetLeave');
		gridRows.on('dragStart', evt => {
			gridPart.disableClickEventsFlag = true; setTimeout(() => gridPart.disableClickEventsFlag = false, 15000);
			const elm = $(evt.target), feedback = elm.jqxDragDrop('feedback'), rowIndexes = gridPart.selectedRowIndexes;
			if (!rowIndexes?.length) { elm.jqxDragDrop({ revert: true }); currentDropTargetPart = recs = null }
			let text = ''; if (rowIndexes?.length > 1) text += ` <span class="ek-bilgi">(+${rowIndexes.length - 1})</span>`
			feedback.html(`<div class="drag-element">${elm.text()}${text}</div>`)
		});
		gridRows.on('dropTargetEnter', evt => {
			/*const {args} = evt, {position} = args; currentDropTargetPart = document.elementFromPoint(position.left, position.top);
			if (currentDropTargetPart) currentDropTargetPart = $(currentDropTargetPart)
			if (currentDropTargetPart?.length && !currentDropTargetPart.hasClass('jqx-grid')) currentDropTargetPart = currentDropTargetPart.parents('.jqx-grid')
			if (currentDropTargetPart?.length) currentDropTargetPart = currentDropTargetPart.data('part')*/
			const recs = gridPart.selectedRecs; gridRows.jqxDragDrop({ revert: false })
		});
		gridRows.on('dropTargetLeave', evt => { currentDropTargetPart = recs = null; gridRows.jqxDragDrop({ revert: true }) });
		gridRows.on('dragEnd', evt => {
			gridPart.disableClickEventsFlag = false; const {args} = evt, position = new $.jqx.position(args);
			currentDropTargetPart = document.elementFromPoint(position.left, position.top);
			if (currentDropTargetPart) currentDropTargetPart = $(currentDropTargetPart)
			if (currentDropTargetPart?.length && !currentDropTargetPart.hasClass('jqx-grid')) currentDropTargetPart = currentDropTargetPart.parents('.jqx-grid')
			if (currentDropTargetPart?.length) currentDropTargetPart = currentDropTargetPart.data('part')
			if (!currentDropTargetPart /*|| currentDropTargetPart == gridPart*/) return; const targetGridWidget = currentDropTargetPart.gridWidget;
			if (gridWidget.editcell) gridWidget.endcelledit()
			let rowIndex, uid; try { rowIndex = targetGridWidget?.getcellatposition(position.left, position.top)?.row; uid = targetGridWidget?.getrowid(rowIndex) } catch (ex) { }
			if (currentDropTargetPart == gridPart) {
				const recs = gridPart.selectedRecs; gridWidget.beginupdate();
				try {
					for (const rec of recs) {
						gridWidget.deleterow(rec.uid); for (const key of ['uid', 'uniqueid', 'boundindex', 'visibleindex']) delete rec[key]
						gridWidget.addrow(null, rec?.shallowCopy() ?? $.extend({}, rec), rowIndex ?? 'last')
					}
				}
				finally { gridWidget.endupdate(false) }
			}
			else {
				const _e = $.extend({}, e, { target: { rowIndex, uid } });
				switch (currentDropTargetPart) {
					case rootPart.gridKalanlar: this.listedenCikarIstendi(_e); break
					case rootPart.gridSecilenler: this.listeyeAlIstendi(_e); break
				}
			}
		})
	}
	kolonKategoriKodDegisti(e) { this.gridKalanlar.tazele() }
	listedenCikarIstendi(e) {
		const {gridKalanlar, gridSecilenler} = this, recs = gridSecilenler.selectedRecs; let rowIndex = e?.target?.rowIndex; if (rowIndex != null && rowIndex < 0) rowIndex = null;
		gridSecilenler.gridWidget.beginupdate(); gridKalanlar.gridWidget.beginupdate();
		try {
			for (const rec of recs)
				if (rec?.uid) gridSecilenler.gridWidget.deleterow(rec.uid)
		}
		finally { gridSecilenler.gridWidget.endupdate(false); gridKalanlar.gridWidget.endupdate(false) }
		gridKalanlar.tazele()
	}
	listeyeAlIstendi(e) {
		const arayaAktarFlag = this.inst._arayaAktarFlag, {gridKalanlar, gridSecilenler} = this; let rowIndex = e?.target?.rowIndex; if (rowIndex != null && rowIndex < 0) rowIndex = null;
		if (arayaAktarFlag && rowIndex == null) rowIndex = gridSecilenler.selectedRowIndexes[0]
		let copyFlag = false, recs = e.recs ?? (e.rec ? [e.rec] : null);
		if (recs == null) { copyFlag = true; recs = gridKalanlar.selectedRecs }
		gridSecilenler.gridWidget.beginupdate(); gridKalanlar.gridWidget.beginupdate();
		try {
			for (const _rec of recs) {
				if (!_rec) continue; let rec = _rec; if (copyFlag) rec = rec.shallowCopy ? rec.shallowCopy() : $.extend({}, rec)
				gridSecilenler.gridWidget.addrow(null, rec, rowIndex ?? 'last');
				if (!copyFlag && rec.uid) gridKalanlar.gridWidget.deleterow(rec?.uid)
			}
		}
		finally { gridSecilenler.gridWidget.endupdate(false); gridKalanlar.gridWidget.endupdate(false) }
	}
	kirilmaYapIstendi(e) { e = e || {}; e.sahaSinif = RRKirilma; return this.ozelSahaEkle(e) }
	textEkleIstendi(e) { e = e || {}; e.sahaSinif = RRSahaText; return this.ozelSahaEkle(e) }
	formulEkleIstendi(e) { e = e || {}; e.sahaSinif = RRFormul; return this.ozelSahaEkle(e) }
	ozelSahaEkle(e) {
		e = e || {}; const {sahaSinif} = e; if (!sahaSinif) return null
		const rec = new sahaSinif(); return this.listeyeAlIstendi({ rec })
	}
	ustAltBilgiIstendi(e) {
		e = e || {}; const {inst} = this, rfb = new RootFormBuilder({ parentPart: this, inst }).asWindow('Üst-Alt Bilgi');
		let fbd_islemTuslari = rfb.addIslemTuslari('islemTuslari').widgetArgsDuzenleIslemi(e => $.extend(e.args, {
			ekButonlarIlk: [{ id: 'tamam', handler: e => e.builder.rootBuilder.part.close() }]
		}));
		let fbd_split_ustAlt = rfb.addForm('split-ustAlt').addStyle_fullWH({ height: `calc(var(--full) - 60px)` })
			.addStyle(e => `$elementCSS { padding-bottom: 500px !important } $elementCSS > div { margin-block-end: 60px }`)
			.setLayout(e => $(`<div id="${e.builder.id}"><div class="ust"/><div class="alt"/></div>`))
			.onAfterRun(e => {
				const {builder} = e, {rootBuilder, layout} = builder, {parentPart} = rootBuilder; parentPart.fbd_split_ustAlt = builder
				/* layout.jqxSplitter({ theme, width: false, height: false, orientation: 'horizontal', splitBarSize: 20, panels: [ { size: '50%' }, { size: '50%' } ] }) */
			});
		let fbd_splitUst = fbd_split_ustAlt.addForm('ust').setLayout(e => { const {id, parentBuilder} = e.builder; return parentBuilder.layout.children(`.${id}`) })
			.onAfterRun(e => { const {builder} = e, {parentPart} = builder.rootBuilder; parentPart.fbd_splitUst = builder });
		let fbd_splitAlt = fbd_split_ustAlt.addForm('alt').setLayout(e => { const {id, parentBuilder} = e.builder; return parentBuilder.layout.children(`.${id}`) })
			.onAfterRun(e => { const {builder} = e, {parentPart} = builder.rootBuilder; parentPart.fbd_splitAlt = builder });
		for (const builder of [fbd_splitUst, fbd_splitAlt]) {
			builder.addStyle_fullWH({ height: '43%' }).setAltInst(e => {
				const {builder} = e, {id, parentBuilder} = builder, inst = parentBuilder.altInst;
				const key = `${id}Bilgi`; return inst[key] = inst[key] || {}
			});
			const handler_buttonClick = e => {
				const elm = e.button, {builder, id} = e, {altInst} = builder;
				elm.toggleClass('selected'); altInst[id] = !altInst[id]
			};
			builder.addIslemTuslari().widgetArgsDuzenleIslemi(e => $.extend(e.args, {
				ekButonlarIlk: [
					{ id: 'isBold', text: `<b>B</b>`, handler: handler_buttonClick },
					{ id: 'isItalic', text: `<i>I</i>`, handler: handler_buttonClick },
					{ id: 'isUnderline', text: `<u>U</u>`, handler: handler_buttonClick }
				]
			})).onAfterRun(e => {
				const {builder} = e, {altInst, layout} = builder, buttons = layout.find('button');
				for (const key of ['isBold', 'isItalic', 'isUnderline']) { if (!!altInst[key]) buttons.filter(`#${key}`).toggleClass('selected') }
			}).addStyle(e => `$elementCSS button.jqx-fill-state-normal.selected { background: #cedae1 !important }`);
			builder.addTextArea('text').etiketGosterim_yok().addStyle_fullWH()
				.addStyle(e => `$elementCSS > textarea { width: var(--full) !important; height: var(--full) !important }`)
		}
		rfb.run()
	}
	async kaydetIstendi(e) {
		e = e || {}; e.sender = this; const {inst, eskiInst, mfSinif} = this; let result;
		try {
			for (const builder of this.getBuilders(e)) {
				if (builder.kaydetIstendi) {
					e.builder = builder; const _result = builder.kaydetIstendi(e);
					if (_result === false) return false; if (result?.isError) throw result
				}
			}
			let result = await this.kaydetOncesiIslemler(e); if (result === false) { return result }
			if (result == null) {
				if (this.yeniVeyaKopyami) result = await inst.yaz()
				else if (this.degistirmi) result = await inst.degistir(eskiInst)
				else if (this.silmi) result = await inst.sil()
				if (!result || result.isError) return false
			}
			await this.kaydetSonrasiIslemler(e);
			const {kaydedince} = this; if (kaydedince) { const _e = $.extend({}, e, { sender: this, mfSinif, inst, eskiInst, result }); getFuncValue.call(this, kaydedince, _e) }
			this.kaydetCalistimi = true; this.destroyPart()
		}
		catch (ex) { console.error(ex); const error = getErrorText(ex); if (error) hConfirm(error, `${mfSinif.sinifAdi || 'Rapor'} Kaydet İşlemi`); return false }
	}
	async kaydetOncesiIslemler(e) {
		e = e || {}; const {builder, islem, inst, eskiInst} = this; e.sender = this;
		for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.kaydetOncesiIslemler) await builder.kaydetOncesiIslemler(e) }
		const _e = $.extend({}, e, { sender: this, builder, islem, inst, eskiInst });
		let result = await this.inst.uiKaydetOncesiIslemler(_e);
		for (const key of ['inst', 'eskiInst']) { const value = _e[key]; if (value !== undefined) this[key] = e[key] = value }
		const {kaydetIslemi} = this; if (kaydetIslemi) { _e.result = result; result = await getFuncValue.call(this, kaydetIslemi, _e) }
		if (result != null) return result
	}
	async kaydetSonrasiIslemler(e) {
		e = e || {}; e.sender = this;
		for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.kaydetSonrasiIslemler) await builder.kaydetSonrasiIslemler(e) }
	}
	async vazgecIstendi(e) {
		e = e || {};
		if (!this.kaydetCalistimi) {
			e.sender = this;
			for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.vazgecIstendi) await builder.vazgecIstendi(e) }
		}
		await super.vazgecIstendi(e)
	}
	formGenelEventleriBagla(e) {
		e = e || {}; e.sender = this;
		for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.formGenelEventleriBagla) builder.formGenelEventleriBagla(e) }
		const inputs = this.layout.find('input[type=textbox], input[type=text], input[type=number]');
		if (inputs.length) { inputs.on('focus', evt => evt.target.select()) }
	}
	*getBuilders(e) {
		const {id2Builder} = this;
		if (id2Builder) { for (const builder of Object.values(id2Builder)) { for (const subBuilder of builder.getBuildersWithSelf()) yield subBuilder } }
	}
}
