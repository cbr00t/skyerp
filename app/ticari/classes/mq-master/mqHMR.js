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
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); let {pTanim} = e;
		$.extend(pTanim, { renk1: new PInstStr(), renk2: new PInstStr() })
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
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		const styleci_renk = e => `${e.builder.getCSSElementSelector(e.builder.layout)} {
			width: 50px !important;
			min-width: 100px !important;
			height: 100px !important;
		    padding: 8px !important;
			padding-left: 10px !important;
		}`
		const tanimForm = e.tanimFormBuilder;
		let form = tanimForm.addFormWithParent().yanYana(4);
		form.addColorInput('renk1', 'Renk 1').addStyle(styleci_renk);
		form.addColorInput('renk2', 'Renk 2').addStyle(styleci_renk)
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		const cellsRenderer = (colDef, rowIndex, columnField, value, html, jqxCol, rec) =>
			changeTagContent(html, `&nbsp;`)
		const _liste = [
			new GridKolon({ belirtec: '_renk1', text: 'Renk', width: 160, cellsRenderer: cellsRenderer }).noSql(),
			new GridKolon({ belirtec: '_renk2' }).hidden().noSql()
		];
		for (const colDef of _liste)
			this.hmrTabloKolonDuzenle({ orjColDef: colDef, colDef: colDef })
		e.liste.push(..._liste)
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
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); let {hv} = e;
		$.extend(hv, {
			oscolor1: html2OSColor(this.renk1) || 0,
			oscolor2: html2OSColor(this.renk2) || 0
		})
	}
	setValues(e) {
		super.setValues(e); let {rec} = e, {oscolor1, oscolor2} = rec;
		$.extend(this, {
			renk1: oscolor1 ? os2HTMLColor(oscolor1) : '',
			renk2: oscolor1 ? os2HTMLColor(oscolor2) : ''
		})
	}
}
class MQDesen extends MQHMR {
	static get sinifAdi() { return 'Desen' }
	static get table() { return 'tdesen' }
	static get tableAlias() { return 'des' }
	static get kodListeTipi() { return 'DESEN' }
}
