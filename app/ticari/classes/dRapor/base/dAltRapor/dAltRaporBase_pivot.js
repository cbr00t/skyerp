class DAltRapor_Pivot extends DAltRapor_Grid {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get dPivotmu() { return true } static get dGridmi() { return false }
	subFormBuilderDuzenle(e) {
		super.super_subFormBuilderDuzenle(e); const parentBuilder = e.builder;
		let fbd = this.fbd_grid = parentBuilder.addForm('pivot').setLayout(e => $(`<div id="${e.builder.id}" class="part"></div>`)).addStyle_fullWH(null, 'calc(var(--full) - 0px)')
			.onInit(e => this.gridArgsDuzenle({ ...e, args: {} })).onBuildEk(e => this.onGridInit(e)).onAfterRun(e => this.onGridRun(e));
		let _e = { ...e, gridBuilder: fbd }; this.gridBuilderDuzenle(_e)
	}
	onGridInit(e) {
		const {builder} = e, {layout} = builder, pivot = builder.input = layout;
		builder.part = this.pivotPart = { pivot }; super.onGridInit(e)
	}
	onGridRun(e) {
		super.onGridRun(e); const {parentBuilder, fbd_grid, pivotPart} = this; let {pivot, pivotWidget} = pivotPart;
		const localization = localizationObj, autoResize = true, cache = false, async = true, autoBind = true, pivotValuesOnRows = false;
		let _e = { ...e, liste: [] }; this.tabloKolonlariDuzenle(_e); const tabloKolonlari = this.tabloKolonlari = _e.liste;
		const asFieldList = (arr, args) => (arr || []).map(colDefOrBelirtec => {
			const dataField = colDefOrBelirtec?.belirtec ?? colDefOrBelirtec; return { dataField, text: dataField, minWidth: 200, ...(args || {}) } });
		const rows = asFieldList(tabloKolonlari.slice(0, 1)), columns = asFieldList(tabloKolonlari.slice(2, 3));
		const filters = asFieldList([]), values = asFieldList(tabloKolonlari.slice(-2, -1), { text: 'Toplam', function: 'sum' });
		const dataAdapter = new $.jqx.dataAdapter(
			{ autoBind, cache, async, id: '', dataType: wsDataType, url: `${webRoot}/empty.php` },
			{ autoBind, cache, async, loadServerData: (wsArgs, source, callback) => {
				let {pivotWidget, pivot} = pivotPart; if (!pivotWidget && pivot?.length) { pivotWidget = pivotPart.pivotWidget = pivot.jqxPivotGrid('getInstance') }
				setTimeout(async () => {
					const action = this._tazele_lastAction; let result = await this.loadServerData({ wsArgs, source, callback, action });
					if (result) {
						if ($.isArray(result)) { result = { totalrecords: result.length, records: result } } result = result ?? { totalrecords: 0, records: [] };
						if (typeof result == 'object') {
							if (result.records && !result.totalrecords) { result.totalrecords = result.records.length }
							try { callback(result) } catch (ex) { console.error(ex) }
						}
					}
				}, 0)
			}
		});
		const source = new $.jqx.pivot(dataAdapter, { pivotValuesOnRows, rows, columns, filters, values });
		pivot.jqxPivotGrid({ theme, localization, autoResize, source });
		pivotWidget = pivotPart.pivotWidget = pivot.jqxPivotGrid('getInstance')
	}
	gridArgsDuzenle(e) { }
	tazele(e) { super.super_tazele(e); const {pivotWidget} = this.pivotPart || {}; if (pivotWidget) { pivotWidget.dataBind() } }
}
