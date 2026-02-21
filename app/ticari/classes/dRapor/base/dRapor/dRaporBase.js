class DRapor extends DMQDetayli {					/* MQCogul tabanlı rapor sınıfları için gerekli inherit desteği için DMQDetayli'dan getirildi */
	static { window[this.name] = this; this._key2Class[this.name] = this } static get partName() { return 'dRapor' } get partName() { return this.class.partName }
	static get anaTip() { return null } static get sinifAdi() { return this.aciklama }
	static get kategoriKod() { return null } static get kod() { return null } static get aciklama() { return null } static get detaylimi() { return false }
	static get uygunmu() { return true } get uygunmu() { return this.class.uygunmu } static get araSeviyemi() { return false }
	static get dRapormu() { return true } get dRapormu() { return this.class.dRapormu } static get dAltRapormu() { return false } get dAltRapormu() { return this.class.dAltRapormu }
	static get mainClass() { return window[`${this.name}_Main`] } static get tumKolonlarGosterilirmi() { return false }
	static get noOverflowFlag() { return false } get isPanelItem() { return !!this.panel || qs.panelItem }
	get raporVarmi() { return this.raporTanim?.secilenVarmi }
	static get raporBilgiler() {
		return values(this.kod2Sinif)
			.filter(({ uygunmu, araSeviyemi, dRapormu, kod }) => uygunmu && !araSeviyemi && dRapormu && kod)
			.map(cls => ({ kod: cls.kod, aciklama: cls.aciklama, vioAdim: cls.vioAdim, cls }))
	}
	static get kod2Sinif() {
		let {_kod2Sinif: result} = this
		if (result == null) {
			result = {}
			let subClasses = this.subClasses.filter(({ araSeviyemi, dAltRapormu, uygunmu, kod }) =>
				!(araSeviyemi || dAltRapormu) && uygunmu && kod)
			console.group('menu sort')
			subClasses = [...subClasses].sort((a, b) => {
				let oncelik_a = (a.oncelik ?? 10000), oncelik_b = (b.oncelik ?? 10000)
				let compare = oncelik_a - oncelik_b, oncelikText = compare < 0 ? 'a' : compare > 0 ? 'b' : '-'
				console.debug('... sort', ['a', a.name, oncelik_a], ['b', b.name, oncelik_b], ['oncelik', compare, oncelikText])
				return compare
			})
			console.groupEnd()
			for (let cls of subClasses)
				result[cls.kod] = cls
			this._kod2Sinif = result
		}
		return result
   }
	static get uygunRaporlar() {
		return values(this.kod2Sinif)
			.filter(cls => cls.uygunmu && cls.dRapormu && !(cls.araSeviyemi || cls.dAltRapormu || cls.dPanelmi))
	}
	static get uygunRaporlarKAListe() {
		return this.uygunRaporlar
			.map(cls => ({ kod: cls.kod, aciklama: cls.aciklama, sinif: cls }))
	}
	
	constructor(e = {}) {
		super(e)
		let { width, height, otoTazeleYapilirmi = e.otoTazeleYapilir, events } = e
		events ??= {}
		for (let k of ['init', 'tazeleOncesi', 'tazeleSonrasi']) {
			let v = e[k]
			if (v !== undefined)
				events[k] = v
		}
		$.extend(this, { width, height, events, otoTazeleYapilirmi })
	}
	static getClass(e) {
		let kod = typeof e == 'object' ? (e.kod ?? e.tip) : e
		return this.kod2Sinif[kod]
	}
	static async goster(e) {
		let inst = new this(e)
		let result = await inst.goster()
		if (result == null)
			return null
		let {part} = result, {builder} = part
		return { inst, part, builder }
	}
	static autoGenerateSubClasses(e) { }
	goster(e) { return null }
	tazele(e) { }
	onInit(e) { }
	onBuildEk(e) { }
	onAfterRun({ rfb }) { /* let {layout} = rfb; layout.addClass('slow-animation') */ }
	setWidth(value) { this.width = value; return this }
	setHeight(value) { this.height = value; return this }
	setWH(width, height) {
		if (width != null) { this.setWidth(width) }
		if (height != null) { this.setHeight(height) }
		return this
	}
	setBaslik(value) { this._baslik = value; return this }
	otoTazeleYapilir() { this.otoTazeleYapilirmi = true; return this }
	otoTazeleYapilmaz() { this.otoTazeleYapilirmi = false; return this }
}
class DRaporMQ extends DRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get anaTip() { return 'mq' } static get dMQRapormu() { return true }
	static get kodListeTipi() { return this.kod } static get sinifAdi() { return this.aciklama }
	static get tanimUISinif() { return ModelTanimPart } static get sadeceTanimmi() { return false }

	goster(e = {}) {
		let args = e.args = e.args || {}
		args.inst = this
		let {sadeceTanimmi} = this.class
		if (sadeceTanimmi)
			e.islem ||= 'yeni'
		let result = this.class[sadeceTanimmi ? 'tanimla' : 'listeEkraniAc'](e)
		if (result == null)
			return null
		let {part} = result, {anaTip} = this.class, {partName} = this
		if (part) {
			if (part.then)
				part.then(part => part?.layout?.addClass(`${anaTip} ${partName}`))
			else
				part.layout?.addClass(`${anaTip} ${partName}`)
			
		}
		let {builder} = part ?? {}
		$.extend(this, { part, builder })
		return result
	}
	tazele(e) { super.tazele(e) }
	static listeEkrani_init(e) { return e.sender.inst.onInit(e) }
	static listeEkrani_afterRun(e) { return e.sender.inst.onAfterRun(e) }
}
class DRaporOzel extends DRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'ozel' } static get dOzelRapormu() { return true }
	async goster(e = {}) {
		let inst = this, {partName, isPanelItem, class: { aciklama }} = this
		let title = e.title ?? `<b class="royalblue">${aciklama}</b> Raporu`
		let rfb = e.rfb ?? new RootFormBuilder({ id: partName }).noDestroy()
			.setInst(this).addCSS('slow-animation')
		if (!isPanelItem) { rfb = rfb.asWindow?.(title) }
		let _e = { ...e, rfb }; this.rootFormBuilderDuzenle(_e)
		rfb = _e.rfb
		await this.ilkIslemler(e); await this.ilkIslemler_ek(e)
		rfb.onInit(e => this.onInit({ ...e, rfb: e.builder }))
		rfb.onBuildEk(e => this.onBuildEk({ ...e, rfb: e.builder }))
		rfb.onAfterRun(e => this.onAfterRun({ ...e, rfb: e.builder }))
		await rfb.run()
		let builder = rfb, {part} = builder, {anaTip} = this.class
		let {layout} = part; //layout.prop('id', partName)
		layout.addClass(`${anaTip} ${partName} part`)
		$.extend(this, { part, builder })
		await this.sonIslemler(e); await this.sonIslemler_ek(e)
		return ({ inst, part, builder })
	}
	async ilkIslemler(e) { this.tazeleCount = 0 }
	async ilkIslemler_ek(e) { this.ilkIslemler_ozel?.(e) }
	async sonIslemler(e) { } async sonIslemler_ek(e) { }
	rootFormBuilderDuzenle({ rfb }) {
		let e = arguments[0], {isPanelItem} = this
		this.rootBuilder = rfb
		/* rfb.addStyle(e => `$elementCSS { overflow: hidden !important }`); */
		if (!isPanelItem) {
			let fbd_islemTuslari = rfb.addIslemTuslari('islemTuslari')
				.addCSS('islemTuslari')
				.setTip('tazeleVazgec')
				.setButonlarDuzenleyici(e => this.islemTuslariArgsDuzenle(e))
				.setId2Handler(this.islemTuslariGetId2Handler(e))
			fbd_islemTuslari.addNumberInput('_otoTazeleDk', null, null, 'Tazele (dk)')
				.etiketGosterim_yok()
				.setAltInst(this)
				.setMin(0).setMax(24 * 60)
				.setValue(this._otoTazeleDk || null)
				.degisince(e => {
					let { value, builder: fbd } = e
					let { layout, input } = fbd
					if (!value)
						input.val(null)
					layout[value ? 'addClass' : 'removeClass']('active')
					this.otoTazele_startTimer({ ...arguments[0], ...e })
				})
				.addStyle_wh(100)
				.addStyle(...[
					`$elementCSS {
						position: absolute !important;
						right: 330px !important;
						border-radius: 13px; z-index: 1001 !important
					}
					 $elementCSS.active { animation: 3000ms infinite anim-dRapor-otoTazele }
					 .dRapor.part.refreshing $elementCSS > input {
						background-color: lightcyan !important;
						background-image: url(../../images/loading.gif) !important;
						background-position: center center !important;
						background-size: 32px 32px !important;
						background-repeat: no-repeat !important
					 }
					 @keyframes anim-dRapor-otoTazele {
						   0% { box-shadow: 0 0 13px 3px forestgreen }
						  70% { box-shadow: 0 0 13px 8px forestgreen }
						 100% { box-shadow: 0 0 13px 3px forestgreen }
					 }`
				])
			rfb.addForm('bulForm')
				.setLayout(e => $(`<div class="${e.builder.id} part"><input class="input full-wh" type="textbox" maxlength="100"></input></div>`))
				.onAfterRun(e => {
					let {builder} = e, {layout} = builder;
					let bulPart = builder.part = new FiltreFormPart({
						layout,
						degisince: e => {
							let {tokens} = e
							this.hizliBulIslemi({ ...e, builder, bulPart, sender: this, layout, tokens })
						}
					})
					bulPart.run()
				})
		}
	}
	onAfterRun(e) {
		super.onAfterRun(e)
		let { isPanelItem } = this, { rfb } = e
		let { part: rootPart, part: { layout }, id2Builder: { islemTuslari } } = rfb
		let resizeHandler = this._resizeHandler = event => this.onResize({ ...e, event })
		$.extend(rootPart, { builder: rfb, inst: this })
		rootPart.builder = rfb
		if (!layout)
			layout = rootPart.layout = rfb.layout
		layout.prop('id', rfb.id)
		if (!isPanelItem)
			$(window).on('resize', resizeHandler)    // !! because this f..ks the grid
		rootPart.kapaninca(e =>
			this.destroyPart(e))
	}
	destroyPart(e) {
		this.otoTazele_stopTimer()
	}
	onResize(e) {
		if (this.part?.isDestroyed) {
			$(window).off('resize', this._resizeHandler)
			return false
		}
	}
	islemTuslariArgsDuzenle(e) { }
	islemTuslariGetId2Handler(e) {
		return ({
			tazele: _e => _e.builder.inst.tazele({ ...e, ..._e }),
			vazgec: _e => _e.builder.rootPart.close({ ...e, ..._e })
		})
	}
	hizliBulIslemi(e) {
		let {bulPart} = e; clearTimeout(this._timer_hizliBulIslemi_ozel)
		this._timer_hizliBulIslemi_ozel = setTimeout(() => {
			try {
				let {input} = bulPart; this.hizliBulIslemi_ara(e);
				for (let  delayMS of [400, 1000]) {
					setTimeout(() => {
						bulPart.focus()
						setTimeout(() => { input[0].selectionStart = input[0].selectionEnd = input[0].value?.length }, 205)
					}, delayMS)
				}
				setTimeout(() => FiltreFormPart.hizliBulIslemi(e), 500)
			}
			finally { delete this._timer_hizliBulIslemi_ozel }
		}, 100)
	}
	hizliBulIslemi_ara(e) { }
	tazele(e) {
		super.tazele(e)
		let {builder: { rootBuilder: rfb }} = e
		let parentBuilder = rfb.id2Builder.items ?? rfb
		for (let {part} of parentBuilder.getBuilders()) {
			part?.tazele?.(e)
			part?.dataBind?.(e)
		}
	}
	super_tazele(e) { super.tazele(e) }
	on(key, handler) { this.events[key] = handler; return this }
	off(key, handler) { delete this.events[key]; return this }
	async signal(key, ...args) {
		let value = this.events[key]
		if (value && isFunction(value))
			value = await value.call(this, ...args)
		return value
	}

	otoTazele_startTimer(e) {
		// let {_timer_otoTazele: timer, secimler: { _otoTazele: { value: otoTazeleDk } = {} } = {}} = this
		let {_timer_otoTazele: timer, _otoTazeleDk: otoTazeleDk} = this
		if (otoTazeleDk)
			otoTazeleDk = Math.max(otoTazeleDk, .05)
		if (!otoTazeleDk) {
			this.otoTazele_stopTimer(e)
			return null
		}
		/*if (timer)
			return timer*/
		this.otoTazele_stopTimer(e)
		return this._timer_otoTazele = setInterval(
			e => this.otoTazele_timerProc(e),
			otoTazeleDk * 60_000
		)
	}
	otoTazele_stopTimer(e) {
		let {_timer_otoTazele: timer} = this
		if (timer) {
			clearInterval(timer)
			delete this._timer_otoTazele
		}
		return timer
	}
	otoTazele_timerProc(e) {
		let { _otoTazeleDk: otoTazeleDk, _inTazeleProc, _otoTazeleDisabled, part: rootPart } = this
		let { activeWndPart } = app, { appActivatedFlag } = window
		if (_otoTazeleDisabled || activeWndPart != rootPart)
			return
		if (!otoTazeleDk)
			otoTazeleDk = Math.max(otoTazeleDk, .05)
		if (!(otoTazeleDk && window.appActivatedFlag) || _inTazeleProc)
			return
		this._inTazeleProc = true
		this.tazele({ ...e, action: 'otoTazele' })
		setTimeout(() => this._inTazeleProc = false, 1_000)
	}
}
class DPanelRapor extends DRaporOzel {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get dPanelRapormu() { return true }
	static get anaTip() { return 'panel' } static get sabitmi() { return false } static get yatayAnalizVarmi() { return !this.sabitmi }
	static get ozetVarmi() { return !this.sabitmi } static get chartVarmi() { return !this.sabitmi } static get yataymi() { return false }
	static get altRaporClassPrefix() { return this.name } static get noOverflowFlag() { return true }
	get main() { return this.id2AltRapor?.main }
	constructor(e = {}) {
		super(e); let {ozelIDListe, zorunluOzelIDSet, id2AltRapor, altRapor_lastZIndex} = e
		zorunluOzelIDSet ??= {}
		$.extend(this, { ozelIDListe, zorunluOzelIDSet, id2AltRapor, altRapor_lastZIndex })
	}
	rootFormBuilderDuzenle(e) {
		if (this.id2AltRapor == null) {
			this.clear()
			this.altRaporlarDuzenle(e)
		}
		super.rootFormBuilderDuzenle(e)
		let {rfb} = e, {id2AltRapor, isPanelItem, ozelIDListe: ozelIDSet, zorunluOzelIDSet, class: { noOverflowFlag, kod, yataymi }} = this
		let form = e.rfb_items = this.rfb_items = rfb.addForm('items')
			.setLayout(e => $(`<div id="${e.builder.id}" class="${kod ? `${kod} ` : ''}full-wh"></div>`));
		if (noOverflowFlag) { form.addCSS('no-overflow') }
		if (typeof ozelIDSet == 'string') { ozelIDSet = [ozelIDSet] }
		if ($.isArray(ozelIDSet)) { ozelIDSet = asSet(ozelIDSet) }
		if (!empty(zorunluOzelIDSet)) { ozelIDSet = { ...ozelIDSet, ...zorunluOzelIDSet } }
		for (let [id, altRapor] of entries(id2AltRapor)) {
			let raporAdi = altRapor.etiket ?? ''
			let fbd = altRapor.parentBuilder = form.addForm(id).addCSS('item').addStyle_fullWH()
				.setLayout(e => $(`<div class="${id}"><label class="item-sortable">${raporAdi || ''}</label></div>`))
				.addStyle(e => `$elementCSS { overflow: hidden !important; z-index: ${this.altRapor_lastZIndex++} !important }`)
			;let _e = { ...e, id, builder: fbd }
			altRapor.subFormBuilderDuzenle(_e)
			let {width, height} = altRapor
			if (isPanelItem) { fbd.addStyle_fullWH(yataymi ? width : null, yataymi ? null : height) }
			else if (width || height) { fbd.addStyle_wh(width, height) }
			altRapor.rootFormBuilderDuzenle(e)
			;fbd.setVisibleKosulu(({ builder: { id }}) =>
				empty(ozelIDSet) || ozelIDSet[id] || zorunluOzelIDSet[id] ? true : 'jqx-hidden')
		}
	}
	async ilkIslemler(e) {
		await super.ilkIslemler(e); let {id2AltRapor} = this
		for (let altRapor of values(id2AltRapor)) { await altRapor.ilkIslemler?.(e) }
	}
	async ilkIslemler_ek(e) {
		await super.ilkIslemler_ek(e); let {id2AltRapor} = this
		for (let altRapor of values(id2AltRapor)) { await altRapor.ilkIslemler_ek?.(e) }
	}
	async sonIslemler(e) {
		await super.sonIslemler(e); let {id2AltRapor} = this
		for (let altRapor of values(id2AltRapor)) { await altRapor.sonIslemler?.(e) }
	}
	async sonIslemler_ek(e) {
		await super.sonIslemler_ek(e); let {id2AltRapor} = this
		for (let altRapor of values(id2AltRapor)) { await altRapor.sonIslemler_ek?.(e) }
	}
	onAfterRun(e) {
		super.onAfterRun(e); let {rfb} = e
		let {items: { layout: itemsLayout }} = rfb.id2Builder
		let itemSelector = '.item', focusSelector = 'hasFocus'
		let elmSubItems = itemsLayout.children(itemSelector)
		elmSubItems.eq(0).addClass(focusSelector);
		let handler = evt => {
			let itemLayout = $(evt.currentTarget);
			itemLayout.parent().children(itemSelector).removeClass(focusSelector);
			itemLayout.addClass(focusSelector)
		}
		for (let key of ['mousedown', 'touchstart', 'click']) 
			elmSubItems.on(key, handler)
	}
	onResize(e) {
		if (super.onResize(e) === false) { return false }
		let {id2AltRapor} = this; if (!id2AltRapor) { return }
		for (let altRapor of values(id2AltRapor)) { altRapor?.onResize?.(e) }
	}
	altRaporlarDuzenle(e) {
		let {ozelIDListe, class: { altRaporClassPrefix: prefix = '', sabitmi, ozetVarmi, chartVarmi }} = this
		let clsMain = window[`${prefix}_Main`]
		if (empty(ozelIDListe)) {
			if (clsMain)
				this.add(clsMain)
			if (ozetVarmi)
				this.add(DAltRapor_Grid_Ozet)
			if (chartVarmi)
				this.add(DAltRapor_Chart)
		}
		else {
			let id2Cls = {
				main: clsMain,
				ozet: DAltRapor_Grid_Ozet,
				chart: DAltRapor_Chart
			}
			if (!$.isArray(ozelIDListe))
				ozelIDListe = typeof ozelIDListe == 'object' ? keys(ozelIDListe) : $.makeArray(ozelIDListe)
			if (!ozelIDListe.includes('main'))
				ozelIDListe.unshift('main')
			let classes = ozelIDListe.map(id => id2Cls[id]).filter(x => !!x)
			if (classes.length)
				this.add(...classes)
		}
	}
	tazele(e) {
		super.super_tazele(e)
		let { id2AltRapor, builder: rfb } = this
		let { layout, id2Builder: { islemTuslari: fbd_islemTuslari } } = rfb
		let { main } = id2AltRapor ?? {}
		let { gridPart: mainGridPart } = main ?? {}
		if (!id2AltRapor) {
			console.warn('id2AltRapor = null')
			return
		}
		// let { _otoTazeleDk: { input } = {} } = fbd_islemTuslari.id2Builder
		this.tazeleCount = 0
		layout.addClass('refreshing')
		for (let altRapor of values(id2AltRapor)) {
			delete altRapor._promise_wait
			if (!altRapor?.tazeleYapilirmi)
				continue
			if (mainGridPart && altRapor != main) {
				let {mainmi} = altRapor.class, {gridPart} = altRapor
				if (mainmi && gridPart)
					gridPart.filtreTokens = mainGridPart.filtreTokens
			}
			altRapor.tazele?.(e)
		}
		setTimeout(() => layout.removeClass('refreshing'), 2_000)
	}
	hizliBulIslemi_ara(e) {
		super.hizliBulIslemi_ara(e); let {tokens} = e, {main} = this;
		for (let altRapor of [main]) {
			if (!altRapor.fbd_grid) { continue }
			let {part: gridPart} = altRapor.fbd_grid; gridPart.filtreTokens = tokens;
			this.tazele({ action: 'hizliBul' })
		}
	}
	add(...items) {
		let {id2AltRapor} = this
		for (let item of items) {
			if (item == null) { continue }
			if ($.isArray(item)) { this.add(...item); continue } 
			let id, altRapor
			if ($.isPlainObject(item)) { id = item.id; altRapor = item.altRapor ?? item.rapor }
			else { altRapor = item }
			if (isClass(altRapor)) { altRapor = new altRapor({ rapor: this }) }
			if (altRapor == null) { continue }
			id ||= altRapor?.class?.kod || newGUID()
			altRapor.rapor = this; id2AltRapor[id] = altRapor
		}
		return this
	}
	clear() { this.id2AltRapor = {}; return this }
	setOzelID(value) { this.ozelIDListe = value; return this }
	clearOzelID() { this.ozelIDListe = null; return this }
	addZorunluOzelID(...keys) {
		let {zorunluOzelIDSet} = this
		if (!zorunluOzelIDSet) { zorunluOzelIDSet = this.zorunluOzelIDSet = {} }
		for (let key of keys) {
			key = key?.kod ?? key?.class?.kod ?? key
			zorunluOzelIDSet[key] = true
		}
		return this
	}
	addWithZorunluOzelID(...keys) {
		this.addZorunluOzelID(...keys)
		return this.add(...keys)
	}
	clearZorunluOzelID(value) { this.zorunluOzelIDSet = {}; return this }
	ozelID_main() { return this.setOzelIDListe('main') }
	ozelID_ozet() { return this.setOzelIDListe('ozet') }
	ozelID_chart() { return this.setOzelIDListe('chart') }
}
class DGrupluPanelRapor extends DPanelRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get dGrupluPanelRapormu() { return true }
	islemTuslariArgsDuzenle({ liste, part: butonPart }) {
		super.islemTuslariArgsDuzenle(...arguments)
		let { class: { sabitmi } } = this
		liste.push(...[
			(sabitmi ? null : { id: 'raporTanim', text: 'Rapor Tanım', handler: _e => this.main.raporTanimIstendi({ ...e, ..._e }) }),
			{ id: 'secimler', text: '', handler: _e => this.main.secimlerIstendi({ ...e, ..._e }) },
			{ id: 'seviyeAc', text: 'Seviye Aç', handler: _e => this.seviyeAcIstendi({ ...e, ..._e }) },
			{ id: 'seviyeKapat', text: 'Seviye Kapat', handler: _e => this.seviyeKapatIstendi({ ...e, ..._e }) },
			{ id: 'excel', text: '', handler: _e => this.exportExcelIstendi({ ...e, ..._e }) },
			/*{ id: 'pdf', text: '', handler: _e => this.exportPDFIstendi({ ...e, ..._e }) },*/
			{ id: 'html', text: '', handler: _e => this.exportHTMLIstendi({ ...e, ..._e }) },
			{ id: 'favoriSil', text: 'Favori Sil', handler: _e => this.favoriSilIstendi({ ...e, ..._e }) }
		].filter(Boolean))
		let sagIdSet = butonPart.ekSagButonIdSet ??= {}
		extend(sagIdSet, asSet(['favoriSil']))
	}
	async onAfterRun(e) {
		await super.onAfterRun(e)
	}
	raporTanimIstendi(e) { for (let altRapor of values(this.id2AltRapor)) { this.main?.raporTanimIstendi?.(e) }; return this }
	secimlerIstendi(e) { for (let altRapor of values(this.id2AltRapor)) { this.main?.secimlerIstendi?.(e) }; return this }
	seviyeAcIstendi(e) { for (let altRapor of values(this.id2AltRapor)) { altRapor?.seviyeAcIstendi?.(e) }; return this }
	seviyeKapatIstendi(e) { for (let altRapor of values(this.id2AltRapor)) { altRapor?.seviyeKapatIstendi?.(e) }; return this }
	exportExcelIstendi(e) { for (let altRapor of values(this.id2AltRapor)) { altRapor?.exportExcelIstendi?.(e) }; return this }
	exportPDFIstendi(e) { for (let altRapor of values(this.id2AltRapor)) { altRapor?.exportPDFIstendi?.(e) }; return this }
	exportHTMLIstendi(e) { for (let altRapor of values(this.id2AltRapor)) { altRapor?.exportHTMLIstendi?.(e) }; return this }
	gridVeriYuklendiIslemi(e) { for (let altRapor of values(this.id2AltRapor)) { altRapor?.gridVeriYuklendiIslemi?.(e) }; return this }
	favoriSilIstendi(e) { for (let altRapor of values(this.id2AltRapor)) { altRapor?.favoriSilIstendi?.(e) }; return this }
}
