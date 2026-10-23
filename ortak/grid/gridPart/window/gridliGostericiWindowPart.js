class GridliGostericiWindowPart extends GridliGostericiPart {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return false } static get isWindowPart() { return true } static get partName() { return 'gridliGostericiWindow' }
	get secince() { return (this.secimBilgi || {}).secince } set secince(value) { (this.secimBilgi || {}).secince = value }
	get vazgecince() { return (this.secimBilgi || {}).vazgecince } set vazgecince(value) { (this.secimBilgi || {}).vazgecince = value }
	get tekilmi() { return (this.secimBilgi || {}).tekilmi } set tekilmi(value) { (this.secimBilgi || {}).tekilmi = value }
	get converter() { return (this.secimBilgi || {}).converter } set converter(value) { (this.secimBilgi || {}).converter = value }

	constructor(e) {
		super(e)
		e ??= {}
		if ((e.tekil ?? e.tekilmi) == null)
			e.tekil = false
		
		extend(this, {
			secimBilgi: e.secimBilgi ?? new SecimBilgi(e), gridArgs: $.extend({ selectionMode: e.selectionMode }, e.gridArgs),
			islemTuslariDuzenleyici: e.islemTuslariDuzenle || e.islemTuslariDuzenleyici, secinceKontroluYapilmazmi: e.secinceKontroluYapilmazmi ?? e.secinceKontroluYapilmaz
		})
		let { secimBilgi}  = this
		if (isPlainObject(secimBilgi))
			secimBilgi = this.secimBilgi = new SecimBilgi(secimBilgi)
		
		let keys = ['secince', 'vazgecince', 'tekilmi', 'converter']
		for (let key of keys) {
			let value = e[key]
			if (value !== undefined)
				secimBilgi[key] = value
		}
		
		let { gridArgs, secince, tekilmi } = this
		gridArgs.selectionMode = tekilmi
			? ( this.getSilinebilirmi?.(e) ? 'checkbox' : 'singlerow' )
			: ( secince ? 'checkbox' : 'singlerow' )
	}
	runDevam(e = {}) {
		super.runDevam(e)
		let { layout } = this
		let header = this.header ??= layout.find('.header')
		let islemTuslari = this.islemTuslari ??= layout.find('.islemTuslari')
		let { islemTuslariPart } = this
		if (!islemTuslariPart && islemTuslari?.length) {
			islemTuslariPart = this.islemTuslariPart = new ButonlarPart({
				sender: this, layout: islemTuslari,
				tip: 'tazeleVazgecSec',
				butonlarDuzenleyici: e => this.islemTuslariDuzenle(e)
			})
			islemTuslariPart.run()
		}
	}
	afterRun(e) {
		super.afterRun(e)
		delay(15).then(() => {
			let { grid, gridWidget } = this
			if (!this.isDestroyed && gridWidget) {
				this.show()
				this.onResize(e)
				gridWidget.focus()

				let fix = () => {
					const DefHeight = 400
					if (floor(grid.height()) == DefHeight && gridWidget.height != DefHeight) {
						grid.height('unset')
						grid.jqxGrid('height', grid.jqxGrid('height'))
					}
				}

				fix()
				delay(500).then(() => {
					fix()
					this.onResize(e)
					gridWidget.focus()
				})
			}
		})
	}
	destroyPart(e) {
		super.destroyPart(e)
		let { islemTuslariPart } = this
		islemTuslariPart?.destroyPart?.()
		this.islemTuslariPart = null
	}
	islemTuslariDuzenle(e) {
		let { islemTuslariDuzenleyici } = this
		if (islemTuslariDuzenleyici) {
			let result = getFuncValue.call(this, islemTuslariDuzenleyici, e)
			if (isObject(result))
				e.liste = result = result.liste ?? result
		}
		const {liste} = e, yListe = [];
		for (const item of liste) {
			const {id} = item;
			switch (id) {
				case 'tazele': item.handler = e => this.tazeleIstendi($.extend({}, e, { action: 'button' })); break
				case 'sec': item.handler = e => this.secIstendi(e); if (!this.secince) { continue } break
				case 'vazgec': item.handler = e => this.vazgecIstendi(e); break
			}
			yListe.push(item)
		}
		e.liste = yListe
	}
	gridArgsDuzenleDevam({ args }) {
		super.gridArgsDuzenleDevam(...arguments)
		extend(args, this.gridArgs)
	}
	tazeleIstendi(e) { this.tazele(e) }
	async secIstendi(e = {}) {
		let { secimBilgi, secince, grid, gridWidget, converter, tekilmi } = this
		if (!(secimBilgi && secince))
			return false
		
		let { recs = e.rec ?? this.selectedRecs } = e
		recs = makeArray(recs)
		
		if (!this.secinceKontroluYapilmazmi && empty(recs))
			return false
		
		let _e = {
			sender: this, grid, gridWidget,
			recs, secince, tekilmi, converter,
			mfSinif: this.getMFSinif(e)
		}
		let result = await secimBilgi.sec(_e)
		if (result === false)
			return false
		
		this.secIstendimi = true
		this.destroyPart()
		return true
	}
	gridVeriYuklendi(e = {}) {
		super.gridVeriYuklendi(e)
		let { gridWidget } = e
		let { selectionmode: selectionMode } = gridWidget
		let sel = gridWidget.getselection()
		if (selectionMode && selectionMode != 'none' && empty(sel.rows) && empty(sel.cells)) {
			try { gridWidget?.clearselection() }
			catch (ex) { }
			
			/*if (selectionMode == 'checkbox' || selectionMode.toLowerCase().includes('row')) {
				try { gridWidget.selectrow(0) } catch (ex) { } }
			else {
				let colDef = this.duzKolonTanimlari.find(_colDef => _colDef.isEditable) || {};
				if (colDef) { try { gridWidget.selectcell(0, colDef.belirtec) } catch (ex) { } }
			}*/
		}
		gridWidget?.focus()
	}
	gridSatirCiftTiklandi(e = {}) {
		if (super.gridSatirCiftTiklandi(e) === false)
			return false
		
		let { gridWidget, secimBilgi } = this
		if (gridWidget?._clickedcolumn == '_checkboxcolumn')
			return false
		
		let { args = {} } = e.event ?? {}
		if (secimBilgi?.secince) {
			this.secIstendi({ ...e, rec: args.row?.bounddata, rowIndex: args.rowindex })
			return false
		}
		
		return true
	}
	/*triggerKapanincaEvent(e) { if (!this.secIstendimi) { const vazgecince = (this.secimBilgi || {}).vazgecince; const _e = { sender: this }; return getFuncValue.call(this, vazgecince, _e) } }*/
	secinceKontroluYapilmaz() { this.secinceKontroluYapilmazmi = true; return this }
}
