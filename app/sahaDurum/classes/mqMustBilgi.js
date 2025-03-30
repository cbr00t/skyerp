class MQMustBilgi extends MQKAOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get dataKey() { return 'mustBilgi' } static get tableAlias() { return 'mbil' } static get tekilOkuYapilazmi() { return true }
	static get sinifAdi() { return 'Plasiyer için Müşteriler' } static get tanimUISinif() { return ModelTanimPart } static get secimSinif() { return null }
	static islemTuslariDuzenle_listeEkrani(e) {
		let {liste, part} = e; const removeIdSet = asSet(['yeni', 'sil', 'kopya']);
		liste = e.liste = liste.filter(rec => !removeIdSet[rec.id]);
		let rec = liste.find(rec => rec.id == 'degistir'); if (rec) { rec.id = 'izle' }
		(part.ekSagButonIdSet = part.ekSagButonIdSet || {}).izle = true
	}
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); const {args} = e; $.extend(args, { groupsExpandedByDefault: true }) }
	static orjBaslikListesi_gridInit(e) {
		super.orjBaslikListesi_gridInit(e); const {grid} = e;
		grid.on('filter', evt => { if (grid.jqxGrid('groups').length && evt.args.filters?.length) grid.jqxGrid('expandallgroups') })
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const belirtec = e.dataField, {rec, result} = e;
		if (belirtec == 'bakiye' || belirtec.startsWith('kademe')) { let value = rec[belirtec]; if (value) { result.push(value < 0 ? 'red' : 'green') } else { result.push('lightgray') } }
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e, session = config.session ?? app.params.yerel.lastSession ?? {}, {loginTipi, user} = session;
		let colDef = liste.find(colDef => colDef.belirtec == 'kod'); colDef.hidden();
		colDef = liste.find(colDef => colDef.belirtec == 'aciklama'); $.extend(colDef, {
			genislikCh: null, cellsRenderer: (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
				rec = rec?.tanim ?? rec; const marginStyle = 'margin-inline-end: 20px';
				return changeTagContent(html, `<div class="flex-row"><div class="bold gray" style="${marginStyle}">${rec.kod || ''}</div>` + `<div style="${marginStyle}">${rec.aciklama || ''}</div></div>`)
			}
		});
		liste.push(...[
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 25, cellClassName: 'darkgray' }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 16, cellClassName: 'darkgray' }),
			new GridKolon({ belirtec: 'bakiye', text: 'Bakiye', genislikCh: 16, cellClassName: 'bold', aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel()
		]);
		for (let i = 1; i <= MustBilgi.kademeler.length; i++) {
			liste.push(new GridKolon({ belirtec: `kademe${i}Bedel`, text: MustBilgi.getKademeText(i - 1), genislikCh: 16, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel())
		}
		liste.push(new GridKolon({ belirtec: 'plasiyerText', text: 'Plasiyer', genislikCh: 10, cellClassName: 'darkgray' }))
	}
	static gridVeriYuklendi(e) {
		const {grid} = e, session = config.session ?? app.params.yerel.lastSession ?? {}, {loginTipi, user} = session, groups = [];
		if (!(user && loginTipi == 'plasiyerLogin')) { groups.push('plasiyerText') } groups.push('iladi');
		if (groups?.length) { grid.jqxGrid('groups', groups) }
	}
	static async loadServerData(e) {
		e = e || {}; await super.loadServerData(e); let {localData} = app.params, dataKey = this.dataKey, {wsArgs} = e;
		let result = localData.getData(dataKey); if (result == null) {
			let recs = await MQCari.loadServerDataDogrudan(e), classes = [MQKapanmayanHesaplar, MQKapanmayanHesaplar_Dip, MQCariEkstre, MQCariEkstre_Detay];
			result = {}; for (const rec of recs) { let {kod} = rec; if (kod) { result[kod] = new MustBilgi(rec) } }
			let cariEkstre_fisSayac2Rec = {}; for (let cls of classes) {
				let subDataKey = cls.dataKey; if (!subDataKey) { continue }
				let recs = await cls.loadServerDataDogrudan(e) ?? []; for (let rec of recs) {
					let parentRec, {icerikfissayac: fisSayac} = rec;;
					switch (cls) {
						case MQCariEkstre: if (fisSayac) { cariEkstre_fisSayac2Rec[fisSayac] = rec } break
						case MQCariEkstre_Detay: parentRec = cariEkstre_fisSayac2Rec[fisSayac]; break
					}
					let kod = (rec.mustkod ?? rec.mustKod ?? rec.must ?? rec.kod) ??
									(parentRec?.mustkod ?? parentRec?.mustKod ?? parentRec?.must ?? parentRec?.kod);
					if (!kod) { continue }
					let mustBilgi = result[kod]; if (!mustBilgi) { continue }
					let subRecs = mustBilgi[subDataKey] = mustBilgi[subDataKey] || []; subRecs.push(rec)
				}
			}
			let AsyncMax = 5, promises = []; for (let mustBilgi of Object.values(result)) {
				promises.push(new $.Deferred(p => p.resolve( mustBilgi.kapanmayanHesap_yaslandirmaOlustur(e) )));
				if (promises.length >= AsyncMax) { await Promise.all(promises); promises = [] }
			}
			if (promises.length) { await Promise.all(promises) }
			localData.setData(dataKey, result); localData.kaydetDefer()
		}
		if (result) { for (let kod in result) { let rec = result[kod]; if ($.isPlainObject(rec)) { result[kod] = rec = new MustBilgi(rec) } } }
		let recs = Object.values(result); return recs
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e);
		let {rootBuilder: rfb, tanimFormBuilder: tanimForm, sender: rootPart, mfSinif, inst, kaForm} = e, {layout} = rootPart;
		rfb.addCSS('no-scroll').addStyle(e => `$elementCSS .form-layout > [data-builder-id = "kaForm"] { margin-top: -80px }`)
		rfb.setAltInst(e => {
			const {localData} = app.params, dataKey = this.dataKey, mustBilgiDict = localData.getData(dataKey);
			const {builder} = e, {part} = builder, {kod} = part.inst, mustBilgi = mustBilgiDict[kod]; return mustBilgi
		});
		const tanimPart = e.sender; tanimPart.islem = 'izle'; tanimPart.title = tanimPart.title = `<b>${inst.kod}</b><span class="gray"> - Müşteri Detayları</span>`;
		let fbd_islemTuslari = rfb.addForm('islemTuslari_sol').setLayout(e => e.builder.rootPart.layout.find('.header > .islemTuslari'));
		tanimForm.addStyle_wh('var(--full)');
		tanimForm.addForm('bakiyeText').addStyle_wh('auto').setLayout(e => $(`<span class="bakiyeForm">${e.builder.altInst.bakiyeText}</span>`))
			.addStyle(e => `$elementCSS { font-size: 130%; color: gray; position: absolute; top: 30px; right: 130px }`)
		const tabPanel = tanimForm.addTabPanel('tabPanel').addStyle_fullWH(null, 'calc(var(--full) - 100px)')
			.addStyle(e => `$elementCSS > .content > div { padding-bottom: 0 !important }`);
		const addGrid = (id, etiket, mfSinif, ekIslemler, parentBuilder) => {
			ekIslemler = ekIslemler || {}; etiket = etiket ?? mfSinif?.sinifAdi ?? '';
			if (!parentBuilder) { parentBuilder = tabPanel.addTab(id, etiket).yanYana().addStyle_fullWH() } /*const altForm = parentBuilder.addBaslik(id).setEtiket(etiket).addCSS('baslik').addStyle_fullWH(); */
			if (ekIslemler.ilk) { getFuncValue.call(this, ekIslemler.ilk, { id, etiket, mfSinif, etiket, parentBuilder }) }
			let prevFbd = parentBuilder.builders[parentBuilder.builders.length - 1], prevWidth = prevFbd?._width || 0;
			let fbd = parentBuilder.addGridliGosterici(id).addStyle_fullWH()/*.addCSS('dock-bottom')*/.setMFSinif(mfSinif)
				.widgetArgsDuzenleIslemi(({ sender, args, builder: fbd }) => { const {mfSinif} = fbd; mfSinif.orjBaslikListesi_argsDuzenle({ ...e, sender, args, builder: fbd }) })
				.setTabloKolonlari(({ builder: fbd }) => fbd.mfSinif.listeBasliklari)
				.setSource(({ builder: fbd }) => { const {rootPart, mfSinif} = fbd; e.mustKod = rootPart.inst.kod; return mfSinif.loadServerData(e) })
			fbd.addCSS('full-height-important').addStyle(e =>
				`$elementCSS:not(.full-width):not(.full-width-important) { width: calc(var(--full) - ${prevWidth ? prevWidth + 10 : 0}px) !important }`)
			fbd.onAfterRun(({ builder: fbd }) => {
				if (mfSinif?.orjBaslikListesi_gridInit) {
					const {part} = fbd, {grid, gridWidget} = part;
					mfSinif.orjBaslikListesi_gridInit({ ...e, sender: part, gridPart: part, builder: fbd, mfSinif, grid, gridWidget })
				}
			});
			if (ekIslemler.son) { getFuncValue.call(this, ekIslemler.ilk, { id, etiket, mfSinif, etiket, parent, fbd }) }
			return fbd
		};
		addGrid('kapanmayanHesaplar', null, MQKapanmayanHesaplar, { ilk: e => {
			let {parentBuilder} = e;
			parentBuilder.addButton('navToggle')
				.onClick(e => {
					let {builder} = e, {parentBuilder, rootPart} = builder;
					let builder_sol = parentBuilder.id2Builder[id], builder_sag = parentBuilder.id2Builder.kapanmayanHesaplar;
					builder_sol.layout.toggleClass('jqx-hidden'); builder_sag.layout.toggleClass('full-width-important');
					rootPart.onResize()
				}).addStyle(e => `$elementCSS { position: absolute; width: auto !important; height: auto !important; margin-top: -45px; z-index: 500 }`)
				.addStyle(e => `$elementCSS > button { width: 45px !important; height: 45px !important }`);
			let width = 400, subParentBuilder = parentBuilder.addFormWithParent().altAlta().addStyle_fullWH(width); subParentBuilder._width = width;
			{
				let mfSinif = MQKapanmayanHesaplar_Yaslandirma, {dataKey: id} = mfSinif;
				let fbd = subParentBuilder.addGridliGosterici(id).addStyle_fullWH(null, 350)
					.setMFSinif(mfSinif).rowNumberOlmasin()
					.widgetArgsDuzenleIslemi(({ sender, args, builder: fbd }) => {
						let {mfSinif} = fbd; mfSinif.orjBaslikListesi_argsDuzenle({ ...e, sender, args, builder: fbd }) })
					.setTabloKolonlari(({ builder: fbd }) => fbd.mfSinif.listeBasliklari)
					.setSource(({ builder: fbd }) => { let {rootPart, mfSinif} = fbd; e.mustKod = rootPart.inst.kod; return mfSinif.loadServerData(e) });
				fbd.onAfterRun(({ builder: fbd }) => {
					if (mfSinif?.orjBaslikListesi_gridInit) {
						let {part} = fbd, {grid, gridWidget} = part;
						mfSinif.orjBaslikListesi_gridInit({ ...e, sender: part, gridPart: part, builder: fbd, mfSinif, grid, gridWidget })
					}
				})
			}
			{
				let mfSinif = MQKapanmayanHesaplar_Dip, {dataKey: id} = mfSinif;
				let fbd = subParentBuilder.addGridliGosterici(id).addStyle_fullWH(null, 400)
					.setMFSinif(mfSinif).rowNumberOlmasin()
					.widgetArgsDuzenleIslemi(({ sender, args, builder: fbd }) => {
						let {mfSinif} = fbd; mfSinif.orjBaslikListesi_argsDuzenle({ ...e, sender, args, builder: fbd }) })
					.setTabloKolonlari(({ builder: fbd }) => fbd.mfSinif.listeBasliklari)
					.setSource(({ builder: fbd }) => { let {rootPart, mfSinif} = fbd; e.mustKod = rootPart.inst.kod; return mfSinif.loadServerData(e) });
				fbd.onAfterRun(({ builder: fbd }) => {
					if (mfSinif?.orjBaslikListesi_gridInit) {
						let {part} = fbd, {grid, gridWidget} = part;
						mfSinif.orjBaslikListesi_gridInit({ ...e, sender: part, gridPart: part, builder: fbd, mfSinif, grid, gridWidget })
					}
				})
			}
		} });
		addGrid('cariEkstre', null, MQCariEkstre)
	}
	static formBuildersDuzenle_ka(e) {
		super.formBuildersDuzenle_ka(e); const {kaForm} = e;
		for (const builder of kaForm.getBuilders()) builder.etiketGosterim_placeholder().onAfterRun(e => e.builder.input.attr('readonly', ''))
	}
}
