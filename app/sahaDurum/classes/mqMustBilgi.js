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
		for (let i = 1; i <= MustBilgi.kademeler.length; i++) { liste.push(new GridKolon({ belirtec: `kademe${i}Bedel`, text: MustBilgi.getKademeText(i - 1), genislikCh: 16, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel()) }
		liste.push(new GridKolon({ belirtec: 'plasiyerText', text: 'Plasiyer', genislikCh: 10, cellClassName: 'darkgray' }))
	}
	static gridVeriYuklendi(e) {
		const {grid} = e, session = config.session ?? app.params.yerel.lastSession ?? {}, {loginTipi, user} = session, groups = [];
		if (!(user && loginTipi == 'plasiyerLogin')) { groups.push('plasiyerText') } groups.push('iladi');
		if (groups?.length) { grid.jqxGrid('groups', groups) }
	}
	static async loadServerData(e) {
		e = e || {}; await super.loadServerData(e); const {localData} = app.params, dataKey = this.dataKey, {wsArgs} = e;
		let result = localData.getData(dataKey); if (result == null) {
			let recs = await MQCari.loadServerDataDogrudan(e); result = {}; const classes = [MQKapanmayanHesaplar, MQCariEkstre, MQCariEkstre_Detay];
			for (const rec of recs) { const {kod} = rec; if (!kod) { continue } result[kod] = new MustBilgi(rec) }
			const cariEkstre_fisSayac2Rec = {}; for (const cls of classes) {
				const subDataKey = cls.dataKey; if (!subDataKey) { continue }
				const recs = await cls.loadServerDataDogrudan(e);
				for (const rec of recs) {
					let parentRec; if (cls == MQCariEkstre) { const fisSayac = rec.icerikfissayac; if (fisSayac) { cariEkstre_fisSayac2Rec[fisSayac] = rec } }
					else if (cls == MQCariEkstre_Detay) { const fisSayac = rec.icerikfissayac; parentRec = cariEkstre_fisSayac2Rec[fisSayac] }
					const kod = (rec.mustkod ?? rec.mustKod ?? rec.must ?? rec.kod) ?? (parentRec?.mustkod ?? parentRec?.mustKod ?? parentRec?.must ?? parentRec?.kod); if (!kod) { continue }
					const mustBilgi = result[kod]; if (!mustBilgi) { continue }
					const subRecs = mustBilgi[subDataKey] = mustBilgi[subDataKey] || []; subRecs.push(rec)
				}
			}
			const AsyncMax = 10; let promises = [];
			for (const mustBilgi of Object.values(result)) {
				promises.push(new $.Deferred(p => p.resolve( mustBilgi.kapanmayanHesap_yaslandirmaOlustur(e) )));
				if (promises.length >= AsyncMax) { await Promise.all(promises); promises = [] }
			}
			if (promises.length) { await Promise.all(promises) } localData.setData(dataKey, result); localData.kaydetDefer()
		}
		if (result) { for (let kod in result) { let rec = result[kod]; if ($.isPlainObject(rec)) { result[kod] = rec = new MustBilgi(rec) } } }
		const recs = Object.values(result); return recs
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const rfb = e.rootBuilder, tanimForm = e.tanimFormBuilder, rootPart = e.sender, {mfSinif, inst, kaForm} = e;
		const {layout} = rootPart, width = 'var(--full)';
		rfb.addCSS('no-scroll').addStyle(e => `$elementCSS .form-layout > [data-builder-id = "kaForm"] { margin-top: -40px }`)
		rfb.setAltInst(e => {
			const {localData} = app.params, dataKey = this.dataKey, mustBilgiDict = localData.getData(dataKey);
			const {builder} = e, {part} = builder, {kod} = part.inst, mustBilgi = mustBilgiDict[kod]; return mustBilgi
		});
		const tanimPart = e.sender; tanimPart.islem = 'izle'; tanimPart.title = tanimPart.title = `<b>${inst.kod}</b><span class="gray"> - Müşteri Detayları</span>`;
		let fbd_islemTuslari = rfb.addForm('islemTuslari_sol').setLayout(e => e.builder.rootPart.layout.find('.header > .islemTuslari'));
		fbd_islemTuslari.addForm('bakiyeText').setLayout(e => $(`<span class="bakiyeForm">${e.builder.altInst.bakiyeText}</span>`))
			.addStyle(e => `$elementCSS { font-size: 130%; color: gray; position: absolute; top: 10px; left: 50px }`)
		const tabPanel = tanimForm.addTabPanel('tabPanel').addStyle_fullWH(null, 'calc(var(--full) - 155px)').addStyle(e => `$elementCSS > .content > div { padding-bottom: 0 !important }`);
		const addGrid = (id, etiket, mfSinif, ekIslemler, parentBuilder) => {
			ekIslemler = ekIslemler || {}; etiket = etiket ?? mfSinif?.sinifAdi ?? '';
			if (!parentBuilder) { parentBuilder = tabPanel.addTab(id, etiket).yanYana() } /*const altForm = parentBuilder.addBaslik(id).setEtiket(etiket).addCSS('baslik').addStyle_fullWH(); */
			if (ekIslemler.ilk) { getFuncValue.call(this, ekIslemler.ilk, { id, etiket, mfSinif, etiket, parentBuilder }) }
			const prevFbd = parentBuilder.builders[parentBuilder.builders.length - 1], prevWidth = prevFbd?._width || 0;
			const fbd = parentBuilder.addGridliGosterici(id).addStyle_fullWH()/*.addCSS('dock-bottom')*/.setMFSinif(mfSinif)
				.widgetArgsDuzenleIslemi(e => { const {mfSinif} = e.builder; mfSinif.orjBaslikListesi_argsDuzenle(e) })
				.setTabloKolonlari(e => e.builder.mfSinif.listeBasliklari) .setSource(e => { const {builder} = e, {rootPart, mfSinif} = builder; e.mustKod = rootPart.inst.kod; return mfSinif.loadServerData(e) });
			fbd.addCSS('full-height-important'); fbd.addStyle(e => `$elementCSS:not(.full-width):not(.full-width-important) { width: calc(var(--full) - ${ prevWidth ? prevWidth + 10 : 0 }px) !important }`)
			/* fbd.addStyle_wh({ width: `calc(var(--full) - ${ prevWidth ? prevWidth + 10 : 0 }px)`, height: 'var(--full)' }) */
			fbd.onAfterRun(e => {
				if (mfSinif?.orjBaslikListesi_gridInit) {
					const {builder} = e, {part} = builder, {grid, gridWidget} = part; const _e = $.extend({}, e, { sender: part, builder, mfSinif, grid, gridWidget });
					mfSinif.orjBaslikListesi_gridInit(_e)
				}
			})
			if (ekIslemler.son) { getFuncValue.call(this, ekIslemler.ilk, { id, etiket, mfSinif, etiket, parent, fbd }) }
			return fbd
		};
		addGrid('kapanmayanHesaplar', null, MQKapanmayanHesaplar, { ilk: e => {
			const id = MQKapanmayanHesaplar_Yaslandirma.dataKey, mfSinif = MQKapanmayanHesaplar_Yaslandirma, width = 400, {parentBuilder} = e;
			parentBuilder.addButton('navToggle')
				.onClick(e => {
					const {builder} = e, {parentBuilder, rootPart} = builder; const builder_sol = parentBuilder.id2Builder[id], builder_sag = parentBuilder.id2Builder.kapanmayanHesaplar;
					builder_sol.layout.toggleClass('jqx-hidden'); builder_sag.layout.toggleClass('full-width-important'); rootPart.onResize()
				})
				.addStyle(e => `$elementCSS { position: absolute; width: auto !important; height: auto !important; margin-top: -45px; z-index: 500 }`)
				.addStyle(e => `$elementCSS > button { width: 45px !important; height: 45px !important }`);
			const fbd = parentBuilder.addGridliGosterici(id).addStyle_fullWH({ width }).addCSS('dock-bold').setMFSinif(mfSinif).rowNumberOlmasin()
				.widgetArgsDuzenleIslemi(e => { const {mfSinif} = e.builder; mfSinif.orjBaslikListesi_argsDuzenle(e) })
				.setTabloKolonlari(e => { const {mfSinif} = e.builder; return mfSinif.listeBasliklari })
				.setSource(e => { const {builder} = e, {rootPart, mfSinif} = builder; e.mustKod = rootPart.inst.kod; return mfSinif.loadServerData(e) });
			fbd._width = width
		} });
		addGrid('cariEkstre', null, MQCariEkstre)
	}
	static formBuildersDuzenle_ka(e) {
		super.formBuildersDuzenle_ka(e); const {kaForm} = e;
		for (const builder of kaForm.getBuilders()) builder.etiketGosterim_placeholder().onAfterRun(e => e.builder.input.attr('readonly', ''))
	}
}
