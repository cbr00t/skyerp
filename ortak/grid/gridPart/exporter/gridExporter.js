class GridExporter extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get mimeType() { return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
	get grid() { return this.gridPart.grid }
	get gridWidget() { return this.gridPart.gridWidget }
	get widget() { return this.gridWidget }

	constructor(e = {}) {
		super(e)
		let { gridPart, title = 'Sky Grid Çıktısı', fileName = 'Grid.xlsx', sheetName = 'Grid' } = e
		extend(this, { gridPart, title, fileName, sheetName })

		let { gridWidget: w } = this.gridPart ?? {}
		if (!w)
			throw new Error('Excel çıktısı için gridPart.gridWidget gereklidir')
	}
	async download(e = {}) {
		let { data = await this.toBuffer(e) } = e
		let { title = this.title, fileName = this.fileName } = e
		if (!/\.xlsx$/i.test(fileName))
			fileName += '.xlsx'

		let { mimeType } = this.class
		// utils.downloadFile kullanılır; geçici URL sonradan serbest bırakılır.
		let url = URL.createObjectURL(new Blob([data], { type: mimeType }))
		try { downloadFile(url, fileName, mimeType) }
		finally { setTimeout(() => URL.revokeObjectURL(url), 60000) }
		return data
	}
	async toBuffer(e = {}) {
		// Binary veri ayrıca upload veya farklı bir indirme işleminde kullanılabilir.
		let { progressManager: old_pm } = globalThis
		if (!old_pm) {
			await showProgress('Excel çıktısı oluşturuluyor...')
			await delay(1)
		}
		try {
			let workbook = await this.createWorkbook(e)
			return await workbook.xlsx.writeBuffer()
		}
		finally {
			if (!old_pm)
				hideProgress()
		}
	}
	
	async createWorkbook(e = {}) {
		if (!window.ExcelJS?.Workbook)
			throw new Error('ExcelJS yüklenemedi. İnternet/CDN erişimini kontrol ediniz.')
		
		this.checkLoaded()
		let columns = this.getColumns(), rows = this.getRows()
		if (!columns.length)
			throw new Error('Excel çıktısına uygun görünür kolon bulunamadı')
		if (columns.length > 16384 || rows.length > 1048572)
			throw new Error('Veri Excel satır/kolon sınırını aşıyor')

		let { title = this.title } = e
		let workbook = new ExcelJS.Workbook()
		let sheetName = String(e.sheetName ?? this.sheetName).replace(/[\\/*?:\[\]]/g, ' ').replace(/^'+|'+$/g, '').slice(0, 31) || 'Grid'
		let sheet = workbook.addWorksheet(sheetName, { properties: { outlineProperties: { summaryBelow: false } } })
		workbook.creator = 'SkyERP'
		sheet.views = [{ state: 'frozen', ySplit: 4 }]
		;columns.forEach((col, i) =>
			sheet.getColumn(i + 1).width = min(255, max(3, (col.width - 5) / 7)))
		// 1: boş, 2: başlık, 3: boş, 4: kolon başlıkları.
		if (columns.length > 1)
			sheet.mergeCells(2, 1, 2, columns.length)
		if (title) {
			sheet.getCell(2, 1).value = title
			sheet.getCell(2, 1).font = { name: 'Calibri', size: 16, bold: true }
		}
		sheet.getRow(2).height = 26
		let probe = this.createProbe(columns.length)
		try {
			for (let [i, col] of columns.entries()) {
				let info = this.readHTML(col.text ?? col.field, '', col, probe, 0)
				let cell = sheet.getCell(4, i + 1)
				cell.value = info.text
				cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF203550' } }
				cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EAF4' } }
				cell.alignment = { horizontal: col.headerAlign ?? 'center', vertical: 'middle', wrapText: true }
				sheet.getRow(4).height = max(sheet.getRow(4).height ?? 24, info.text.split('\n').length * 15 + 8)
			}
			for (let [index, item] of rows.entries()) {
				let row = sheet.getRow(index + 5)
				row.outlineLevel = min(7, item.level ?? 0)
				row.height = 22
				if (item.group) {
					if (columns.length > 1)
						sheet.mergeCells(row.number, 1, row.number, columns.length)
					let info = this.readHTML(this.groupHTML(item), 'jqx-grid-groups-row', columns[0], probe, index)
					let cell = row.getCell(1)
					cell.value = info.text
					this.applyStyle(cell, info, item, 0)
					cell.font = { ...cell.font, bold: true }
				}
				else {
					for (let [i, col] of columns.entries()) {
						try {
							let rendered = this.renderCell(item, col)
							let info = this.readHTML(rendered.html, rendered.css, col, probe, index)
							let cell = row.getCell(i + 1)
							this.setCellValue(cell, col, item, rendered.value, info)
							this.applyStyle(cell, info, item, i)
							let lines = max(info.text.split('\n').length, Math.ceil(info.text.length / max(5, col.width / 8)))
							row.height = min(409, max(row.height, lines * (info.font.size + 3) + 6))
						}
						catch (ex) {
							throw new Error(`Excel: ${index + 1}. kayıt, ${col.field} kolonu: ${ex.message ?? ex}`)
						}
					}
				}
				// Büyük listelerde tarayıcıya kısa bir çalışma aralığı bırakılır.
				if (index && index % 100 == 0)
					await delay(1)
			}
		}
		finally { probe.host.remove() }
		sheet.properties.outlineLevelRow = min(7, rows.reduce((n, r) => max(n, r.level ?? 0), 0) + 1)
		return workbook
	}
	checkLoaded() { }
	getColumns() {
		let defs = { ...(this.gridPart.belirtec2Kolon ?? {}) }
		let collect = list => {
			for (let cd of list ?? []) {
				if (cd.tabloKolonlari) collect(cd.tabloKolonlari)
				else if (cd.belirtec) defs[cd.belirtec] = cd
			}
		}
		collect(this.gridPart.excelKolonTanimlari ?? this.gridPart.duzKolonTanimlari)
		let columns = this.widget.columns?.records ?? this.widget.columns ?? []
		let fields = this.widget.source?._source?.datafields ?? []
		return columns.filter(c => !c.hidden && c.exportable !== false && (c.datafield ?? c.dataField) && !c.checkboxcolumn)
			.map((c, index) => {
				let field = c.datafield ?? c.dataField, def = defs[field]
				let width = isNumber(c.width) ? c.width : c.element?.offsetWidth
				if (!width) width = parseFloat(c.width) || 120
				return { field, def, source: c, width, index, text: c.text, align: c.cellsalign ?? c.cellsAlign ?? def?.align ?? 'left',
					headerAlign: c.align, format: c.cellsformat ?? c.cellsFormat ?? '', dataType: fields.find(f => f.name == field)?.type }
			})
	}
	createProbe(columnCount) {
		// Aynı grid altında ölçüm: uygulama sınıfları ve yüzde font boyutları korunur.
		let host = document.createElement('div')
		host.style.cssText = 'position:fixed;left:-100000px;top:0;pointer-events:none;opacity:0;width:1000px;z-index:-1'
		host.setAttribute('aria-hidden', 'true')
		host.innerHTML = '<table><tbody><tr></tr><tr></tr></tbody></table>'
		for (let tr of host.querySelectorAll('tr'))
			for (let i = 0; i < columnCount; i++) tr.appendChild(document.createElement('td'))
		let root = this.grid?.[0] ?? this.grid
		if (!root?.appendChild)
			throw new Error('gridPart.grid DOM öğesi bulunamadı')
		root.appendChild(host)
		return { host, rows: host.querySelectorAll('tr') }
	}
	readHTML(html, css, col, probe, index) {
		let tr = probe.rows[index % 2]
		for (let r of probe.rows)
			for (let c of r.children) { c.replaceChildren(); c.removeAttribute('class'); c.removeAttribute('style') }
		let elm = tr.children[col.index ?? 0]
		// Temalı temel sınıflar ve kolon konumu CSS ölçümünde korunur.
		let w = this.widget, themeClass = name => w.toTP?.(name) ?? name
		let classes = ['jqx-grid-cell', 'jqx-cell', 'jqx-item', 'jqx-widget-content'].map(themeClass)
		if ((w.altrows ?? w.altRows) && index % 2) classes.push(themeClass('jqx-grid-cell-alt'))
		if (col.source?.pinned) classes.push(themeClass('jqx-grid-cell-pinned'))
		elm.className = classes.join(' ') + ' ' + (css ?? '')
		elm.style.cssText = `width:${col.width}px;max-width:${col.width}px;text-align:${col.align};white-space:normal`
		elm.innerHTML = html == null ? '' : String(html)
		// Renderer HTML'inden yalnızca metin ve temel stil okunur.
		elm.querySelectorAll('script,style,iframe,object,embed').forEach(n => n.remove())
		let runs = [], first, breaks = new Set(['block', 'flex', 'grid', 'table-row', 'list-item'])
		let append = (text, node) => {
			if (!text) return
			let font = this.readFont(getComputedStyle(node))
			if (!first && text.trim()) first = node
			let prev = runs[runs.length - 1]
			if (prev && JSON.stringify(prev.font) == JSON.stringify(font)) prev.text += text
			else runs.push({ text, font })
		}
		let newline = node => {
			if (runs.length && !runs[runs.length - 1].text.endsWith('\n')) append('\n', node)
		}
		let walk = node => {
			if (node.nodeType == 3) {
				let style = getComputedStyle(node.parentElement)
				if (style.visibility != 'hidden')
					append(style.whiteSpace.startsWith('pre') ? node.nodeValue : node.nodeValue.replace(/\s+/g, ' '), node.parentElement)
				return
			}
			if (node.nodeType != 1) return
			let style = getComputedStyle(node)
			if (style.display == 'none' || style.visibility == 'hidden') return
			if (node.tagName == 'BR') { append('\n', node.parentElement); return }
			let block = node != elm && breaks.has(style.display)
			if (block) newline(node)
			if (node.matches('input[type=checkbox]')) append(node.checked ? '☑' : '☐', node)
			else if (node.matches('input,textarea,select')) append(node.value ?? '', node)
			else for (let child of node.childNodes) walk(child)
			if (block) newline(node)
		}
		walk(elm)
		if (runs.length) {
			runs[0].text = runs[0].text.trimStart()
			runs[runs.length - 1].text = runs[runs.length - 1].text.trimEnd()
		}
		runs = runs.filter(r => r.text)
		let text = runs.map(r => r.text).join(''), style = getComputedStyle(first ?? elm)
		let bg, node = first ?? elm
		while (node && node != tr) {
			bg = this.color(getComputedStyle(node).backgroundColor)
			if (bg) break
			node = node.parentElement
		}
		return { text, runs, font: this.readFont(style), bg, align: style.textAlign == 'start' ? col.align : style.textAlign }
	}
	readFont(style) {
		let result = { name: style.fontFamily.split(',')[0].replace(/["']/g, '') || 'Calibri',
			size: max(6, min(100, (parseFloat(style.fontSize) || 14.67) * .75)),
			bold: style.fontWeight == 'bold' || parseInt(style.fontWeight) >= 600, italic: style.fontStyle == 'italic' }
		let color = this.color(style.color)
		if (color) result.color = { argb: color }
		return result
	}
	color(value) {
		let nums = value?.match(/[\d.]+/g)?.map(Number)
		if (!nums || nums.length < 3 || (nums.length > 3 && nums[3] == 0)) return null
		return 'FF' + nums.slice(0, 3).map(n => max(0, min(255, Math.round(n))).toString(16).padStart(2, '0')).join('').toUpperCase()
	}
	applyStyle(cell, info, item, colIndex) {
		cell.font = info.font
		cell.alignment = { horizontal: ['left','center','right','justify'].includes(info.align) ? info.align : 'left',
			vertical: 'middle', wrapText: true, indent: colIndex == 0 ? min(15, item.level ?? 0) : 0 }
		let bg = info.bg
		if (!bg && (item.group || item.parent))
			bg = ['FFE2EAF4','FFF8E8D5','FFD4E6C5','FFECE3F3'][(item.level ?? 0) % 4]
		if (bg) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
	}
	setCellValue(cell, col, item, value, info) {
		let tip = col.def?.tip, type = tip?.anaTip ?? col.dataType
		let bool = tip?.tip == 'bool' || col.source.columntype == 'checkbox' || isBool(value) || type == 'bool' || type == 'boolean'
		if (bool) {
			// 1/0 sayıları checkbox gibi görünür; Excel'de sayılabilir/toplanabilir.
			cell.value = value == null || value === '' ? null : (value === true || value === 1 || /^(true|1|evet)$/i.test(String(value)) ? 1 : 0)
			cell.numFmt = '[=1]"☑";[=0]"☐";General'
			return
		}
		if (value instanceof Date || type == 'date') {
			let date = this.parseDate(value)
			if (date) {
				// Excel saat dilimi tutmaz: ekrandaki yerel saat UTC bileşenlerine taşınır.
				cell.value = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()))
				cell.numFmt = date.getHours() || date.getMinutes() || date.getSeconds() || date.getMilliseconds() ? 'dd.mm.yyyy hh:mm' : 'dd.mm.yyyy'
				return
			}
		}
		let numeric = isNumber(value) || ['number','int','integer','float','decimal'].includes(type)
		if (numeric && value != null && value !== '') {
			let number = isNumber(value) ? value : Number(value)
			let fra = tip?.getFra ? tip.getFra({ rec: item.rec }) : tip?.fra
			if (fra != null && Number.isFinite(Number(fra))) fra = max(0, min(20, Math.trunc(Number(fra))))
			else fra = null
			let fmtMatch = col.format.match(/^([nfpdc])(\d+)?$/i)
			if (fra == null && fmtMatch?.[2] != null) fra = Number(fmtMatch[2])
			let text = info.text.trim(), parsed = this.parseNumberText(text, number)
			// Karma metin hücreleri metin kalır; saf sayılarda ham hassasiyet korunur.
			if (Number.isFinite(number) && (!text || parsed != null)) {
				// Sadece yuvarlama yapılmışsa hassasiyet kaybolmaz; ör. 1000 -> 1 dönüşümü korunur.
				if (parsed && Math.abs(number - parsed.value) > .500001 * Math.pow(10, -parsed.fra))
					number = parsed.value
				// jqx 'p' biçimi yüzde işaretini ekler, Excel ise değeri 100 ile çarpar.
				let percent = /^p/i.test(col.format)
				cell.value = percent ? number / 100 : number
				if (fra == null && parsed) fra = parsed.fra
				let pattern = fra == null ? 'General' : '#,##0' + (fra ? '.' + '0'.repeat(fra) : '')
				let quote = s => s ? '"' + s.replace(/"/g, '""') + '"' : ''
				cell.numFmt = quote(parsed?.prefix ?? '') + pattern + (percent ? '%' : '') + quote((parsed?.suffix ?? '').replace(percent ? /%/g : /$^/, ''))
				if (!text) cell.numFmt = ';;;'
				return
			}
		}
		// Metin olarak yazılır; '=' ile başlayan içerik formüle dönüşmez.
		cell.value = info.runs.length > 1 ? { richText: info.runs } : info.text
	}
	parseNumberText(text, rawValue) {
		// Tek sayılı '1.234,50 TL' gibi içerik de sayısal hücre olabilir.
		let match = text.match(/^([^\d+-]*)([+-]?\d[\d.,\s]*)([^\d]*)$/)
		if (!match || text.includes('\n')) return null
		let [, prefix, numeric, suffix] = match
		let trailing = numeric.match(/\s+$/)?.[0] ?? ''
		suffix = trailing + suffix
		let value = numeric.replace(/\s/g, '')
		let loc = this.widget.gridlocalization ?? {}, decimal = loc.decimalseparator ?? ',', group = loc.thousandsseparator ?? '.'
		if (group && group != decimal) value = value.split(group).join('')
		let parts = value.split(decimal)
		if (parts.length > 2)
			return null
		let number = Number(parts.join('.'))
		// GridKolonTip_Number toString() nokta kullanabilir; TR binlik ayıracıyla karışmasın.
		let nativeText = numeric.replace(/\s/g, '')
		if (/^[+-]?\d+(?:\.\d+)?$/.test(nativeText)) {
			let native = Number(nativeText), nativeFra = nativeText.split('.')[1]?.length ?? 0
			let nativeMatches = Number.isFinite(rawValue) && Math.abs(native - rawValue) <= .500001 * Math.pow(10, -nativeFra)
			let localizedMatches = Number.isFinite(rawValue) && Math.abs(number - rawValue) <= .500001 * Math.pow(10, -(parts[1]?.length ?? 0))
			if (nativeMatches && !localizedMatches) {
				number = native
				parts = nativeText.split('.')
			}
		}
		return Number.isFinite(number) ? { value: number, fra: parts[1]?.length ?? 0, prefix, suffix } : null
	}
	parseDate(value) {
		if (value instanceof Date)
			return Number.isFinite(value.getTime()) ? value : null
		if (!isString(value) || !value.trim())
			return null
		// Sayı/kod alanları tarihe çevrilmez; yalnızca tipDate alanları buraya gelir.
		let match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/)
		if (match) {
			let [, d, m, y, h = 0, n = 0, s = 0] = match
			let date = new Date(+y, +m - 1, +d, +h, +n, +s)
			return date.getDate() == +d && date.getMonth() == +m - 1 && date.getFullYear() == +y && +h < 24 && +n < 60 && +s < 60 ? date : null
		}
		if (!/^\d{4}-\d{2}-\d{2}(?:T| |$)/.test(value)) return null
		// Tarih-only ISO UTC'ye değil yerel gece yarısına karşılık gelir.
		let date = new Date(value.length == 10 ? value + 'T00:00:00' : value.replace(' ', 'T'))
		return Number.isFinite(date.getTime()) ? date : null
	}
}
