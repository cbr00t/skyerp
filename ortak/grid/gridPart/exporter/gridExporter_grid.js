class GridExporter_Grid extends GridExporter {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	checkLoaded() {
		// Eksik uzak sayfaları tam çıktı gibi sunmayız.
		let w = this.widget
		if (w.virtualmode || w.source?._source?.totalrecords > (w.getboundrows()?.length ?? 0))
			throw new Error('Excel çıktısı için tüm kayıtlar yüklenmelidir; sanal/uzak sayfalama desteklenmiyor.')
	}
	getRows() {
		let w = this.widget, recs = w.getrows() ?? [], groups = w.groups ?? []
		let boundRows = w.getboundrows() ?? []
		let indexes = new Map(boundRows.map((r, i) => [r?.uid, i]))
		let dataItem = (rec, level) => ({ rec, level, rowIndex: indexes.get(rec.uid) ?? rec.dataindex ?? rec.boundindex ?? recs.indexOf(rec) })
		if (!groups.length) return recs.map(rec => dataItem(rec, 0))
		// getrows filtre/sıralamayı korur; gruplama tüm sayfalar üzerinde kurulur.
		let result = []
		let visit = (list, level, parent, liveGroups) => {
			if (level == groups.length) {
				for (let rec of list) result.push(dataItem(rec, level))
				return
			}
			let field = groups[level], buckets = new Map()
			for (let rec of list) {
				let value = rec[field] ?? '', key = value instanceof Date ? value.getTime() : value
				if (!buckets.has(key)) buckets.set(key, { value, recs: [] })
				buckets.get(key).recs.push(rec)
			}
			for (let { value, recs } of buckets.values()) {
				let live = liveGroups?.find(g => String(g.group) == String(value))
				let info = live ?? { group: value, level, parentItem: parent, subItems: recs, subGroups: [] }
				result.push({ group: true, value, field, level, info })
				visit(recs, level + 1, info, live?.subGroups)
			}
		}
		visit(recs, 0, null, w.dataview?.loadedrootgroups)
		return result
	}
	groupHTML(item) {
		let w = this.widget, col = w.getcolumn(item.field)
		let text = `${col?.text ?? item.field}: ${item.value}`
		let info = { ...item.info, groupcolumn: col, parent: item.info.parentItem }
		let expanded = w.expandedgroups?.[item.info.uniqueid]?.expanded ?? false
		let html = w.groupsrenderer?.(text, item.value, expanded, info)
		if (html) return html
		// Özel renderer yoksa jqx'in başlık + değer + adet gösterimi korunur.
		let items = info.subItems?.length ? info.subItems : info.subGroups ?? []
		let count = items.filter(r => !r.totalsrow).length
		let value = col ? w._defaultcellsrenderer(item.value, col) : item.value
		return `${col?.text ?? item.field}: ${value} (${count})`
	}
	renderCell(item, col) {
		let w = this.widget, c = col.source, rec = item.rec, rowIndex = item.rowIndex
		let value = w._getcellvalue ? w._getcellvalue(c, { bounddata: rec }) : rec[c.displayfield ?? col.field] ?? ''
		let html = w._defaultcellsrenderer(value, c)
		// Widget'a bağlanmış son callback kullanılır; GridKolon doğrudan çağrılmaz.
		if (c.cellsrenderer)
			html = c.cellsrenderer(rowIndex, col.field, value, html, c.getcolumnproperties(), rec) ?? html
		let css = typeof c.cellclassname == 'function' ? c.cellclassname(rowIndex, col.field, value, rec) : c.cellclassname
		return { value: rec[c.displayfield ?? col.field], html, css }
	}
}
