class GridExporter_TreeGrid extends GridExporter {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get widget() { return this.gridWidget.base }
	checkLoaded() {
		if (this.gridWidget.virtualModeCreateRecords || this.widget.serverProcessing)
			throw new Error('Excel çıktısı için tüm ağaç kayıtları yüklenmelidir; sanal/uzak yükleme desteklenmiyor.')
	}
	getRows() {
		let result = [], seen = new Set(), w = this.widget
		let filtered = !!w.dataview?.filters?.length
		let visibleIndexes = new Map((w.renderedRecords ?? []).map((r, i) => [r.uid, i]))
		// dataViewRecords sıralanmış hiyerarşidir; getView kapalı çocukları atlayabilir.
		let roots = w.dataViewRecords ?? this.gridWidget.getRows() ?? []
		let visit = (recs, level) => {
			for (let rec of recs ?? []) {
				if (!rec || seen.has(rec) || (filtered && rec._visible === false)) continue
				seen.add(rec)
				result.push({ rec, level, rowIndex: visibleIndexes.get(rec.uid) ?? result.length, parent: !!rec.records?.length })
				visit(rec.records, level + 1)
			}
		}
		visit(roots, 0)
		return result
	}
	renderCell(item, col) {
		let w = this.widget, c = col.source, rec = item.rec
		let value = w._getcellvalue(c, rec), formatted = value ?? ''
		if (col.format && $.jqx.dataFormat) {
			if ($.jqx.dataFormat.isDate(value)) formatted = $.jqx.dataFormat.formatdate(value, col.format, w.gridlocalization)
			else if (value !== '' && value != null && Number.isFinite(Number(value)))
				formatted = $.jqx.dataFormat.formatnumber(value, col.format, w.gridlocalization)
		}
		// TreeGrid callback imzası: key, field, value, record, formattedValue.
		let html = c.cellsRenderer?.(rec.uid, col.field, value, rec, formatted) ?? formatted
		let css = typeof c.cellclassname == 'function' ? c.cellclassname(item.rowIndex, col.field, value, rec, formatted) : c.cellclassname
		return { value: rec[c.displayfield ?? col.field], html, css }
	}
}
