class DAltRapor_Chart extends DAltRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return null }
	static get uygunmu() { return false } static get kod() { return 'chart' } static get aciklama() { return 'Grafik' }
	get width() { return `calc(var(--full) - ${this.rapor.id2AltRapor.main?.width} - 15px)` } get height() { return '50%' }
	onBuildEk(e) {
		super.onBuildEk(e); const {parentBuilder, noAutoColumns} = this, {layout} = parentBuilder;
		const width = '99.8%', height = 'calc(var(--full) - 5px)';
		this.fbd_chart = parentBuilder.addForm('chart').setLayout(e => $(`<div class="${e.builder.id} part full-wh"/>`))
			.addStyle_wh(width, height).onAfterRun(async e => {
				const fbd_chart = e.builder, chartPart = this.chartPart = fbd_chart.part = { tazele: e => this.tazele(e) }, input = chartPart.input = fbd_chart.layout; this.onChartInit(e);
				const localization = localizationObj, source = await this.getDataAdapter(e), padding = 3;
				let args = {
					theme, localization, source, title: '', description: '', colorScheme: 'scheme03', xAxis: {}, seriesGroups: [], /*, renderEngine: 'SVG',*/
					backgroundColor: 'whitesmoke', enableAnimations: true, enableAxisTextAnimation: true, showLegend: true, showBorderLine: true,
					legendLayout: { left: 10, top: 10, width: '90%', height: 100, flow: 'horizontal' },
					padding: { left: padding, top: padding, right: padding, bottom: padding }
				}; let _e = { ...e, args }; this.chartArgsDuzenle(_e); args = _e.args;
				input.jqxChart(args); let widget = chartPart.widget = input.jqxChart('getInstance'); this.onChartRun(e)
			})
	}
	onResize(e) { if (super.onResize(e) === false) { return false } setTimeout(() => this.tazele(e), 10) }
	async tazele(e) {
		e = e || {}; await super.tazele(e); const {input} = this.chartPart || {}; if (!input) { return }
		const source = await this.getDataAdapter(e); if (!source) { return } const series = this.getChartSeries(e); if (!series?.length) { return }
		const xAxis = this.getChartXAxis(e), seriesGroups = [{ type: 'pie', showLabels: true, series }];
		input.jqxChart({ xAxis, seriesGroups, source })
	}
	super_tazele(e) { super.tazele(e) }
	onChartInit(e) { }
	onChartRun(e) { /*let {input} = this.chartPart*/ }
	chartArgsDuzenle(e) { }
	async getDataAdapter(e) {
		try {
			const recs = await this.loadServerData(e), tRec = recs[0] || {}, key_items = 'detaylar';		/*key_id = 'id',*/
			return new $.jqx.dataAdapter({
				dataType: 'array', localData: recs,
				dataFields: Object.keys(tRec).map(name => ({ name, type: typeof tRec[name] == 'object' ? 'array' : (typeof tRec[name] || 'string') })),
			}, { autoBind: false, loadComplete: (boundRecs, recs) => setTimeout(() => this.chartVeriYuklendi({ ...e, boundRecs, recs }), 10) })
		}
		catch (ex) { console.error(ex); hConfirm(getErrorText(ex), 'Grid Verisi Yüklenemedi'); return null }
	}
	loadServerData(e) {
		const {main} = this.rapor, ozetBilgi = main?.ozetBilgi || {}, {grupAttr, icerikAttr, recs} = ozetBilgi; if (!(icerikAttr && recs)) { return [] }
		let toplam = topla(rec => rec[icerikAttr], recs); const newRecs = [];
		for (let rec of recs) {
			rec = $.extend(true, {}, rec); let grupText = rec[grupAttr]; if (grupText && !grupText.toString().includes('<')) { rec[grupAttr] = grupText = `<span class="bold">${grupText}</span>` }
			rec[icerikAttr] = roundToFra(rec[icerikAttr] * 100 / toplam, 1); newRecs.push(rec)
		}
		if (newRecs.length > 1) { newRecs.unshift(newRecs.pop()) } return newRecs
	}
	chartVeriYuklendi(e) { }
	getChartXAxis(e) {
		return {} /*const {main} = this.rapor, ozetBilgi = main.ozetBilgi || {}, {grupAttr, grupText} = ozetBilgi, result = {};;
		if (grupAttr) {
			$.extend(result, {
				dataField: grupAttr, displayText: grupText ?? grupAttr, labelRadius: 170, initialAngle: 15, radius: 145, centerOffset: 0, tickMarks: {},
				formatFunction: value => value
			})
		}*/
	}
	getChartSeries(e) {
		const {main} = this.rapor, ozetBilgi = main.ozetBilgi || {}, {icerikAttr, grupAttr} = ozetBilgi, result = [];
		if (icerikAttr) {
			result.push({
				dataField: icerikAttr, displayText: grupAttr, labelRadius: 105, initialAngle: 115, radius: '85%', innerRadius: 0, useGradient: true,
				centerOffset: 0, offsetY: this.getChartOffsetY(e), labels: { /*backgroundColor: 'white', backgroundOpacity: 1,*/ class: 'chart-label' },
				formatFunction: value => isNaN(value) ? getTagContent(value) || value : `%${numberToString(value)}`
				/*colorFunction: (value, index, serie, group) => { return '' }*/
			})
		}
		return result
	}
	getChartOffsetY(e) { const {fbd_chart} = this, {layout} = fbd_chart; return (layout?.height() || 0) * 0.56 }
}
