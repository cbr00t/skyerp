class DAltRapor_Chart extends DAltRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return null }
	static get uygunmu() { return false } static get kod() { return 'chart' } static get tazeleYapilirmi() { return false }
	static get aciklama() { return 'Grafik' } get etiket() { return `${super.etiket}: ${this.class.aciklama}` }
	get width() { return this.isPanelItem ? 'var(--full)' : `calc(var(--full) - ${this.rapor.id2AltRapor.main?.width} - 15px)` }
	get height() { return this.isPanelItem ? 'var(--full)' : '50%' }
	onBuildEk(e) {
		super.onBuildEk(e)
		let {parentBuilder, noAutoColumns} = this, {layout} = parentBuilder
		let width = '99.9%', height = 'calc(var(--full) - 50px)'
		this.fbd_chart = parentBuilder.addForm('chart')
			.setLayout(e => $(`<div class="${e.builder.id} part full-wh"/>`))
			.addStyle_wh(width, height)
			.onAfterRun(async e => {
				let {builder: fbd_chart} = e
				let chartPart = this.chartPart = fbd_chart.part = {
					tazele: e => this.tazele(e)
				}
				let input = chartPart.input = fbd_chart.layout
				this.onChartInit(e)
				let source = await this.getDataAdapter(e)
				let localization = localizationObj, padding = 3
				let args = {
					theme, localization, source, title: '', description: '',
					/*colorScheme: 'scheme03|07',*/
					colorScheme: qs.chartScheme || qs.chartColor || qs.charColorScheme || 'scheme03',
					xAxis: {}, seriesGroups: [],
					/*, renderEngine: 'SVG' | 'HTML5' | undefined,*/
					backgroundColor: 'whitesmoke', showLegend: true, showBorderLine: false,
					enableAnimations: true, enableAxisTextAnimation: true, 
					legendLayout: { left: 10, top: 5, width: '98%', height: 40, flow: 'horizontal' },
					padding: { left: padding, top: padding, right: padding, bottom: padding }
				}
				let _e = { ...e, args }
				this.chartArgsDuzenle(_e); args = _e.args
				input.jqxChart(args)
				let widget = chartPart.widget = input.jqxChart('getInstance')
				this.onChartRun(e)
			})
	}
	onResize(e) {
		if (super.onResize(e) === false)
			return false
		setTimeout(() => this.tazele(e), 10)
	}
	async tazele(e = {}) {
		await super.tazele(e)
		let {input} = this.chartPart || {}; if (!input) { return }
		let source = await this.getDataAdapter(e); if (!source) { return }
		let series = this.getChartSeries(e); if (!series?.length) { return }
		let xAxis = this.getChartXAxis(e), seriesGroups = [{ type: 'pie', showLabels: true, series }]
		input.jqxChart({ xAxis, seriesGroups, source })
	}
	super_tazele(e) { super.tazele(e) }
	onChartInit(e) { }
	onChartRun(e) { /*let {input} = this.chartPart*/ }
	chartArgsDuzenle(e) { }
	async getDataAdapter(e) {
		try {
			let recs = await this.loadServerData(e)
			let tRec = recs[0] || {}, key_items = 'detaylar';		/*key_id = 'id',*/
			return new $.jqx.dataAdapter({
				dataType: 'array', localData: recs,
				dataFields: keys(tRec).map(name => ({ name, type: typeof tRec[name] == 'object' ? 'array' : (typeof tRec[name] || 'string') }))
			}, {
				autoBind: false,
				loadComplete: (boundRecs, recs) => setTimeout(() => this.chartVeriYuklendi({ ...e, boundRecs, recs }), 10)
			})
		}
		catch (ex) { console.error(ex); hConfirm(getErrorText(ex), 'Grid Verisi Yüklenemedi'); return null }
	}
	loadServerData(e) {
		let {main} = this.rapor, ozetBilgi = main?.ozetBilgi || {}
		let {grupAttr, icerikAttr, recs} = ozetBilgi
		if (!(icerikAttr && recs))
			return []
		let toplam = topla(rec => rec[icerikAttr], recs)
		let newRecs = []
		for (let rec of recs) {
			rec = $.extend(true, {}, rec)
			let grupText = rec[grupAttr]
			if (grupText && !grupText.toString().includes('<'))
				rec[grupAttr] = grupText = `<span class="bold">${grupText}</span>`
			rec[icerikAttr] = roundToFra(rec[icerikAttr] * 100 / toplam, 1)
			newRecs.push(rec)
		}
		if (newRecs.length > 1)
			newRecs.unshift(newRecs.pop())
		return newRecs
	}
	chartVeriYuklendi(e) { }
	getChartXAxis(e) {
		return {} /*let {main} = this.rapor, ozetBilgi = main.ozetBilgi || {}, {grupAttr, grupText} = ozetBilgi, result = {};;
		if (grupAttr) {
			$.extend(result, {
				dataField: grupAttr, displayText: grupText ?? grupAttr, labelRadius: 170, initialAngle: 15, radius: 145, centerOffset: 0, tickMarks: {},
				formatFunction: value => value
			})
		}*/
	}
	getChartSeries(e) {
		let {fbd_chart: { layout }, rapor: { main, main: { ozetBilgi } }} = this
		let {icerikAttr, grupAttr} = ozetBilgi ?? {}
		let result = []
		if (icerikAttr) {
			result.push({
				dataField: icerikAttr, displayText: grupAttr,
				labelRadius: layout.width() <= 1000 ? 90 : 200,
				initialAngle: 180, radius: '87%', innerRadius: 0, useGradient: true,
				centerOffset: 0, offsetY: this.getChartOffsetY(e),
				labels: { /*backgroundColor: 'white', backgroundOpacity: 1,*/ class: 'chart-label' },
				formatFunction: value => isNaN(value) ? getTagContent(value) || value : `%${numberToString(value)}`
				/*colorFunction: (value, index, serie, group) => { return '' }*/
			})
		}
		return result
	}
	getChartOffsetY(e) {
		let {fbd_chart} = this, {layout} = fbd_chart
		return (layout?.height() || 0) * 0.558
	}
}
