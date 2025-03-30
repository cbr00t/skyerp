class MQMasterOrtak extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get dataKey() { return this.classKey } static get raporKullanilirmi() { return false }
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); const {args, sender} = e;
		$.extend(args, { rowsHeight: 36, showGroupsHeader: true, showFilterRow: true, autoShowColumnsMenuButton: true, showStatusBar: true, showaggregates: true, showgroupaggregates: true });
		if (this.gridDetaylimi) {
			$.extend(args, {
				selectionMode: 'checkbox', /* virtualMode: true, */ rowDetails: true,
				rowDetailsTemplate: rowIndex => ({ rowdetails: `<div class="detay-grid-parent dock-bottom"><div class="detay-grid"/></div>`, rowdetailsheight: 350 }),
				initRowDetails: (rowIndex, _parent, grid, parentRec) => {
					if (grid && !grid?.html) { grid = $(grid) } const gridWidget = grid.jqxGrid('getInstance'), parent = $(_parent).find('.detay-grid');
					this.initRowDetails({ grid, gridWidget, rowIndex, parent, parentRec, args: e.temps })
				}
			});
			$.extend(sender, {
				gridSatirCiftTiklandi: e => {
					if (!this.gridDetaylimi) { return }
					let {sender} = e, {selectedRowIndexes, gridWidget, expandedIndexes} = sender;
					if (selectedRowIndexes?.length) {
						let rowIndex = selectedRowIndexes[0];
						gridWidget[expandedIndexes?.[rowIndex] ? 'hiderowdetails' : 'showrowdetails']?.(rowIndex)
					}
				}
			})
		}
	}
	static gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e) /*const {grid} = e; grid.jqxGrid('groups', ['plasiyerKod'])*/
	}
	static orjBaslikListesi_gridInit(e) {
		super.orjBaslikListesi_gridInit(e); let {sender, grid, gridWidget} = e, {gridDetaylimi} = this;
		sender.expandedIndexes = sender.expandedIndexes || {};
		if (gridDetaylimi) {
			grid.on('rowexpand', evt => {
				const {expandedIndexes} = sender, index = gridWidget.getrowboundindex(evt.args.rowindex);
				if (index != null && index > -1) {
					const animation = 'grid-open-fast'; grid.addClass(animation);
					clearTimeout(sender.timer_animate); sender.timer_animate = setTimeout(() => { grid.removeClass(animation); delete sender.timer_animate }, 2000)
					if (!$.isEmptyObject(expandedIndexes)) { for (let _index in expandedIndexes) { _index = asInteger(_index); if (index != _index) gridWidget.hiderowdetails(_index) } }
					expandedIndexes[index] = true; setTimeout(() => gridWidget.ensurerowvisible(index > 0 ? index - 1 : index), 100);
				}
			});
			grid.on('rowcollapse', evt => {
				const {sender, gridWidget} = e, index = gridWidget.getrowboundindex(evt.args.rowindex);
				if (index != null && index > -1) delete sender.expandedIndexes[index]
			})
		}
	}
	static initRowDetails(e) {
		let {grid, gridWidget, parent, parentRec, rowIndex, args} = e, mfSinif = this;
		if (mfSinif?.orjBaslikListesi_initRowDetails) {
			try {
				let _e = { ...e, sender: this, mfSinif, grid, gridWidget }, result = mfSinif.orjBaslikListesi_initRowDetails(_e);
				if (result === false) { gridWidget.hiderowdetails(rowIndex); return }
			}
			catch (ex) { hConfirm(getErrorText(ex), 'Detay Grid Gösterim'); throw ex }
		}
		const detGridPart = e.detGridPart = new GridliGostericiPart({
			parentPart: this, parentBuilder: this.builder,
			layout: parent, argsDuzenle: e => {
				let {args} = e; $.extend(args, { virtualMode: false, selectionMode: 'multiplerowsextended' });
				if (mfSinif?.orjBaslikListesi_argsDuzenle_detaylar) { mfSinif.orjBaslikListesi_argsDuzenle_detaylar(e) }
			},
			tabloKolonlari: e => mfSinif.tabloKolonlari_detaylar,
			loadServerData: async _e => {
				try {
					return await mfSinif.loadServerData_detaylar({
						parent, parentRec, gridPart: detGridPart,
						grid: detGridPart.grid, gridWidget: detGridPart.gridWidget, args, ..._e
					})
				}
				catch (ex) { console.error(ex); const errorText = getErrorText(ex); hConfirm(`<div style="color: firebrick;">${errorText}</div>`, 'Grid Verisi Alınamadı') }
			},
			veriYuklenince: e => { if (mfSinif?.gridVeriYuklendi_detaylar) { return mfSinif.gridVeriYuklendi_detaylar(e) } }
		});
		detGridPart.run();
		if (mfSinif?.orjBaslikListesi_initRowDetails_son) {
			try {
				let _e = { ...e, sender: this, mfSinif, grid, gridWidget }, result = mfSinif.orjBaslikListesi_initRowDetails_son(_e);
				if (result === false) { gridWidget.hiderowdetails(rowIndex); return }
			}
			catch (ex) { hConfirm(getErrorText(ex), 'Detay Grid Gösterim'); throw ex }
		}
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e); let {liste} = e;
		liste.push(...this.orjBaslikListesi.map(colDef => colDef.belirtec))
	}
	static loadServerData(e) { }
	static loadServerDataDogrudan(e) {
		e = e || {}; let wsArgs = e.wsArgs = e.wsArgs ?? {}, {mustKod} = e;
		let session = config.session || {}, loginTipi = e.loginTipi = session.session;
		let user = e.user = session.user || (session.session ? JSON.parse(Base64.decode(session.session))?.user : null);
		if (user) {
			switch (loginTipi) {
				case 'plasiyerLogin': wsArgs.plasiyerKod = user; break
				case 'musteriLogin': wsArgs.mustKod = user; break
			}
		}
		return null
	}
	static loadServerDataFromMustBilgi(e) {
		e = e || {}; let {localData} = app.params, dataKey = e.dataKey ?? this.dataKey, {mustKod} = e;
		let mustBilgiDict = localData.getData(MQMustBilgi.dataKey) || {}, mustBilgi = mustBilgiDict[mustKod] || {};
		let recs = mustBilgi[dataKey] || []; return recs
	}
}
class MQKAOrtak extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get dataKey() { return this.classKey } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e); let {liste} = e, {kodSaha, adiSaha} = this;
		liste.push(...this.orjBaslikListesi.map(colDef => colDef.belirtec).filter(x => !(x == kodSaha || x == adiSaha)))
	}
	static orjBaslikListesi_gridInit(e) { MQMasterOrtak.orjBaslikListesi_gridInit(e) }
	static gridVeriYuklendi(e) { MQMasterOrtak.gridVeriYuklendi(e) }
	static async loadServerData(e) {
		e = e || {}; const {localData} = app.params, dataKey = e.dataKey ?? this.dataKey; let recs = localData.getData(dataKey);
		if (recs === undefined) { recs = await this.loadServerDataDogrudan(e); localData.setData(dataKey, recs); localData.kaydetDefer() }
		return recs
	}
	static loadServerDataDogrudan(e) { e = e || {}; e.dataKey = this.dataKey; MQMasterOrtak.loadServerDataDogrudan(e) }
	static loadServerDataFromMustBilgi(e) { e = e || {}; e.dataKey = this.dataKey; MQMasterOrtak.loadServerDataFromMustBilgi(e) }
}
