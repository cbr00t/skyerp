class MQHMR extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tableAlias() { return 'hmr' }
	static hmrTabloKolonDuzenle(e) {}
	static hmr_queryEkDuzenle(e) { }
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e)
		this.hmr_queryEkDuzenle(e)
	}
	static hmrSetValuesEk(e) {
		e.inst = e.inst ?? e.gridRec?.hmr
	}
}
class MQModel extends MQHMR {
	static get sinifAdi() { return 'Model' } static get table() { return 'tmodel' }
	static get tableAlias() { return 'mod' } static get kodListeTipi() { return 'MOD' }
}
class MQRenk extends MQHMR {
	static get sinifAdi() { return 'Renk' } static get table() { return 'trenk' }
	static get tableAlias() { return 'rnk' } static get kodListeTipi() { return 'RENK' }

	offlineBuildSQLiteQuery({ result: r = [] }) {
		super.offlineBuildSQLiteQuery(...arguments)
		;r.forEach((l, i) => {
			if (l.includes('oscolor'))
				r[i] = l = l.replace(/ NOT NULL/i, '')    // case insensitive
		})
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e)
		let { pTanim } = e
		extend(pTanim, { renk1: new PInstStr(), renk2: new PInstStr() })
	}
	static hmrTabloKolonDuzenle(e) {
		super.hmrTabloKolonDuzenle(e); let {colDef} = e;
		let savedHandlers = { cellsRenderer: colDef.cellsRenderer };
		colDef.cellsRenderer = (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			if (savedHandlers.cellsRenderer) { html = getFuncValue.call(this, savedHandlers.cellsRenderer, colDef, rowIndex, columnField, value, html, jqxCol, rec) }
			if (html == null) { return html }
			let {oscolor1, oscolor2} = ((rec.hmr || {})._temps || {}).renk || rec;
			let htmlColor1 = oscolor1 ? os2HTMLColor(oscolor1) : null;
			let htmlColor2 = oscolor2 ? os2HTMLColor(oscolor2) : null;
			if (htmlColor1) {
				let textColor = getContrastedColor(htmlColor1);
				html = html.replace('style="',
					htmlColor2
						? `style="background: linear-gradient(90deg, ${htmlColor1} 20%, ${htmlColor2} 80%) !important; color: ${textColor};`
						: `style="background: ${htmlColor1}; color: ${textColor}; `
					)
			}
			return html
		}
	}
	static async hmrSetValuesEk(e) {
		await super.hmrSetValuesEk(e); let {inst} = e; if (!inst) { return }
		let rec = await e.rec, globalTemps = inst._temps = inst._temps || {}, temps = globalTemps.renk = globalTemps.renk || {};
		for (const key of ['oscolor1', 'oscolor2']) { temps[key] = rec[key] }
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e)
		let styleci_renk = e => `${e.builder.getCSSElementSelector(e.builder.layout)} {
			width: 50px !important;
			min-width: 100px !important;
			height: 100px !important;
		    padding: 8px !important;
			padding-left: 10px !important;
		}`
		let { tanimFormBuilder: tanimForm } = e
		let form = tanimForm.addFormWithParent().yanYana(4)
		form.addColorInput('renk1', 'Renk 1').addStyle(styleci_renk)
		form.addColorInput('renk2', 'Renk 2').addStyle(styleci_renk)
	}
	static standartGorunumListesiDuzenle({ liste }) {
		super.standartGorunumListesiDuzenle(...arguments)
		liste.push('_html')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(new GridKolon({ belirtec: '_html', text: 'Renk', genislikCh: 10 }).noSql())
		/*let cellsRenderer = (colDef, rowIndex, columnField, value, html, jqxCol, rec) =>
			changeTagContent(html, `&nbsp;`)
		let _liste = [
			new GridKolon({ belirtec: '_renk1', text: 'Renk', width: 160, cellsRenderer: cellsRenderer }).noSql(),
			new GridKolon({ belirtec: '_renk2' }).hidden().noSql()
		]
		for (let colDef of liste)
			this.hmrTabloKolonDuzenle({ orjColDef: colDef, colDef })
		liste.push(..._liste)*/
	}
	static async loadServerDataDogrudan() {
		let recs = await super.loadServerDataDogrudan(...arguments)
		if (!recs)
			return

		let dark = $('body').hasClass('dark-theme')
		;recs.forEach(r => {
			let { aciklama, oscolor1: c1, oscolor2: c2 } = r
			let styles_veri = []
			if (c1) {
				c1 = stOS2HTMLColor(c1)
				c2 = c2 ? stOS2HTMLColor(c2) : null
				styles_veri.push(
					( c2 == null ? `background: ${c1}` : `background: linear-gradient(270deg, ${c2} 5%, ${c1} 90%)` ),
					`color: ${getContrastedColor(c1,  'white', 'black')}`
				)
				if (dark)
					styles_veri.push('filter: invert(1) hue-rotate(180deg)')
			}
			;{
				let style = styles_veri.join('; ')
				r._html = `<div class="color-container full-wh" style="${style}">&nbsp;</div>`
				//if (style)
				//	r.aciklama = `<div class="color-container full-wh">${aciklama}</div>`
			}
		})

		return recs
	}
	static hmr_queryEkDuzenle(e) {
		super.hmr_queryEkDuzenle(e)
		let {sent, bosClausemi} = e, {sahalar} = sent, alias = e.alias ?? this.tableAlias
		let aliasVeNokta = alias ? `${alias}.` : ''
		sahalar.add(
			bosClausemi ? `'' oscolor1` : `${aliasVeNokta}oscolor1`,
			bosClausemi ? `'' oscolor2` : `${aliasVeNokta}oscolor2`
		)
	}
	hostVarsDuzenle({ hv, offlineBuildQuery, offlineRequest, offlineMode }) {
		super.hostVarsDuzenle(...arguments)
		let { renk1, renk2 } = this
		extend(hv, {
			oscolor1: html2STOSColor(renk1) || 0,
			oscolor2: html2STOSColor(renk2) || 0
		})
	}
	setValues(e) {
		super.setValues(e); let {rec} = e, {oscolor1, oscolor2} = rec;
		extend(this, {
			renk1: oscolor1 ? stOS2HTMLColor(oscolor1) : '',
			renk2: oscolor1 ? stOS2HTMLColor(oscolor2) : ''
		})
	}
}
class MQDesen extends MQHMR {
	static get sinifAdi() { return 'Desen' }
	static get table() { return 'tdesen' }
	static get tableAlias() { return 'des' }
	static get kodListeTipi() { return 'DESEN' }
}
