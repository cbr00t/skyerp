class DPanel extends Part {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get isWindowPart() { return true }
	static get partName() { return 'dPanel' } get partName() { return this.class.partName }
	static get anaTip() { return 'panel' } static get kategoriKod() { return null } static get araSeviyemi() { return false }
	static get kod() { return this.anaTip } static get aciklama() { return 'Panel Rapor' }
	static get uygunmu() { return !!config.dev } get uygunmu() { return this.class.uygunmu }
	static get dPanelmi() { return true } get dPanelmi() { return this.class.dPanelmi }
	get detay() {
		let {items} = this
		let subItem = items.find('.item:where(.hasFocus)'); if (!subItem?.length) { return null }
		let detay = subItem.parents('#items').parent().data('detay'); if (!detay) { return null }
		return detay
	}
	get _inst() {
		let {items} = this
		let subItem = items.find('.item:where(.hasFocus)'); if (!subItem?.length) { return null }
		let inst = subItem.parents('#items').parent().data('inst')
		return inst ?? this.detay?.inst
	}
	static get raporBilgiler() {
		return Object.values(this.kod2Sinif)
			.filter(({ uygunmu, araSeviyemi, dPanelmi, kod }) => uygunmu && !araSeviyemi && dPanelmi && kod)
			.map(cls => ({ kod: cls.kod, aciklama: cls.aciklama, vioAdim: cls.vioAdim, cls }))
	}
	static get kod2Sinif() {
		let result = this._kod2Sinif; if (result == null) {
			result = {}; let {subClasses} = this
			for (let cls of [this, ...subClasses]) {
				let {araSeviyemi, uygunmu, kod} = cls;
				if (!araSeviyemi && uygunmu && kod) { result[kod] = cls }
			}
			this._kod2Sinif = result
		}
		return result
   }

	constructor(e = {}) {
		super(e); let {id2Detay} = e, {raporTanim, class: { aciklama }} = this
		raporTanim ??= this.raporTanim = new DPanelTanim().setId(null)
		let {title = `<b class="royalblue">${aciklama}</b>`} = this
		$.extend(this, { title, raporTanim, id2Detay })
	}
	static getClass(e) {
		let kod = typeof e == 'object' ? (e.kod ?? e.tip) : e
		return this.kod2Sinif[kod]
	}
	async detaylariDuzenle(e) {
		await this.loadLayout()
		/*this.add(
			new DRapor_Hareketci_Cari().setWH('50%', '35%'),
			new SBRapor_Default().setWH('50%', '35%'),
			new DRapor_DonemselIslemler().setWH('100%', '65%')
		)*/
	}
	async loadLayout(e) {
		await this.raporTanim?._promise
		let {raporTanim: { detaylar } = {}} = this
		if (detaylar?.length) { this.add(detaylar) }
	}
	async saveLayout(e) {
		let {raporTanim, id2Detay, items} = this; if (!raporTanim) { return }
		await raporTanim?._promise
		if (raporTanim && id2Detay) {
			raporTanim.detaylarReset()
			for (let det of Object.values(id2Detay)) {
				if (det) { raporTanim.addDetay(det) }
			}
			raporTanim?.kaydet()
		}
	}
	async ilkIslemler(e) {
		let {id2Detay} = this
		for (let rapor of Object.values(id2Detay)) { await rapor.ilkIslemler?.(e) }
	}
	async ilkIslemler_ek(e) {
		let {id2Detay} = this
		for (let rapor of Object.values(id2Detay)) { await rapor.ilkIslemler_ek?.(e) }
		this.ilkIslemler_ozel?.(e)
	}
	async sonIslemler(e) {
		let {id2Detay} = this
		for (let rapor of Object.values(id2Detay)) { await rapor.sonIslemler?.(e) }
	}
	async sonIslemler_ek(e) {
		let {id2Detay} = this
		for (let rapor of Object.values(id2Detay)) { await rapor.sonIslemler_ek?.(e) }
		this.sonIslemler_ozel?.(e)
	}
	static async goster(e) {
		let inst = new this(e), result = await inst.goster()
		return result ?? null
	}
	async goster(e = {}) {
		let inst = this, {partName, title, class: { aciklama, anaTip }} = this
		return await this.run(e)
	}
	runDevam(e) {
		super.runDevam(e); let {raporTanim, layout} = this
		if (raporTanim) { raporTanim._promise = raporTanim.yukle?.() }
		let rfb = e.rfb = new RootFormBuilder()
		rfb.setLayout(layout).setPart(this).setInst(this)
		this.rootFormBuilderDuzenle(e)
		let inst = this, part = this, {rfb: builder} = e
		$.extend(this, { builder }); builder.run(e)
		// makeScrollable(this.items)
		return { inst, part, builder }
	}
	afterRun(e) {
		super.afterRun(e); let {raporTanim: { _promise } = {}} = this
		let block = result => this.panelleriOlustur({ ...e, batch: true, result })
		if (_promise) { _promise.then(block) }
		else { block() }
	}
	destroyPart(e) {
		let children = this.items?.children()
		if (children?.length) {
			for (let i = 0; i < children.length; i++) {
				let item = children.eq(i), part = item.data('builder')
				part?.destroyPart(); item.remove()
			}
		}
		return super.destroyPart(e)
	}
	rootFormBuilderDuzenle({ rfb }) {
		let e = arguments[0];
		let fbd_islemTuslari = rfb.addIslemTuslari('islemTuslari')
			.addCSS('islemTuslari').setTip('tazeleVazgec')
			.setButonlarDuzenleyici(e => this.islemTuslariArgsDuzenle(e))
			.setId2Handler(this.islemTuslariGetId2Handler(e))
			.onAfterRun(({ builder: fbd_islemTuslari, builder: { part: islemTuslariPart } }) => $.extend(this, { fbd_islemTuslari, islemTuslariPart }))
		let fbd_items = rfb.addFormWithParent('items').addCSS('items')
			.onAfterRun(({ builder: fbd_items, builder: { layout: items } }) => $.extend(this, { fbd_items, items }))
		rfb.addForm('bulForm')
			.setLayout(({ builder: { id }}) => $(`<div class="${id} part"><input class="input full-wh" type="textbox" maxlength="100"></input></div>`))
			.onAfterRun(({ builder, builder: { layout } }) => {
				let bulPart = builder.part = new FiltreFormPart({
					layout, degisince: e => {
						let {tokens} = e
						this.hizliBulIslemi({ ...e, builder, bulPart, sender: this, layout, tokens }) }
				});
				bulPart.run()
			})
	}
	islemTuslariArgsDuzenle({ liste }) {
		let e = arguments[0], {sabitmi} = this.class;
		liste.push(...[
			(sabitmi ? null : { id: 'raporTanim', text: 'Rapor Tanım', handler: _e => this.detayTanimIstendi({ ...e, ..._e }) }),
			{ id: 'secimler', text: '', handler: _e => this.secimlerIstendi({ ...e, ..._e }) },
			{ id: 'seviyeAc', text: 'Seviye Aç', handler: _e => this.seviyeAcIstendi({ ...e, ..._e }) },
			{ id: 'seviyeKapat', text: 'Seviye Kapat', handler: _e => this.seviyeKapatIstendi({ ...e, ..._e }) },
			{ id: 'excel', text: '', handler: _e => this.exportExcelIstendi({ ...e, ..._e }) },
			/*{ id: 'pdf', text: '', handler: _e => this.exportPDFIstendi({ ...e, ..._e }) },*/
			{ id: 'html', text: '', handler: _e => this.exportHTMLIstendi({ ...e, ..._e }) },
			{ id: 'yeni', text: '', handler: _e => this.yeniIstendi({ ...e, ..._e }) },
		].filter(x => !!x))
	}
	islemTuslariGetId2Handler(e) {
		return ({
			tazele: e => this.tazele(e),
			vazgec: e => this.close(e)
		})
	}
	tazele(e) {
		let {id2Detay} = this
		for (let { inst } of Object.values(id2Detay))
			inst?.tazele(e)
	}
	super_tazele(e) { super.tazele(e) }
	add(...coll) {
		let {id2Detay, _rendered} = this, {kod2Sinif} = DRapor
		for (let det of coll) {
			if (det == null) { continue }
			if ($.isArray(det)) { this.add(...det); continue } 
			let {id, tip, value, raporTip: { altRaporTip } = {}} = det
			if (!id) { id = det.id = newGUID() }
			if (tip.rapormu) {
				let inst = value
				if (typeof inst == 'string') { inst = kod2Sinif[inst] ?? window[inst] }
				if (isClass(inst)) { inst = new inst() }
				if (altRaporTip != null) { inst.setOzelID?.(altRaporTip) }
				if (inst.dRapormu && $.isEmptyObject(inst.ozelIDListe)) { inst.ozelID_main?.() }
				if (inst) { det.inst = inst }
			}
			$.extend(det, { id, panel: this })
			id2Detay[id] = det
		}
		if (_rendered) { this.panelleriOlustur({ batch: false }) }
		return this
	}
	remove(...coll) {
		let {id2Detay, _rendered} = this
		for (let det of coll) {
			if (det == null) { continue }
			if ($.isArray(det)) { this.remove(...det); continue } 
			if (!id2Detay[det.id])
				det = Object.values(id2Detay).find(_det => det.detay == _det || det.rapor?.detay == _det)
			if (det == null) { continue }
			delete id2Detay[det.id]
		}
		if (_rendered) { this.panelleriOlustur({ batch: false }) }
	}
	clear() {
		this.id2Detay = {}
		if (this._rendered) { this.panelleriOlustur({ batch: false }) }
		return this
	}
	async panelleriOlustur({ batch } = {}) {
		let e = arguments[0], panel = this
		let {builder: rfb, id2Detay, items, layout} = this
		if (id2Detay == null) {
			this.clear(); await this.detaylariDuzenle(e)
			id2Detay = this.id2Detay
		}
		if (batch && !$.isEmptyObject(id2Detay)) { layout.addClass('_loading') }
		let itemSelector = 'div > .item', focusSelector = 'hasFocus'
		let itemsChildren = items.children(), id2Item = {}
		for (let i = 0; i < itemsChildren.length; i++) {
			let item = itemsChildren.eq(i)
			let part = item.data('part'), det = item.data('detay'), {id} = det ?? {}
			if (!(batch || !id2Detay[id])) { id2Item[id] = item; continue }
			part?.destroyPart?.(); part?.rootBuilder?.destroyPart(); item.remove()
			if (det) { for (let key of ['rootBuilder', 'layout']) { delete det[key] } }
		}
		let _rfb = new RootFormBuilder(), promises = [], loadCount = 0, completeCount = 0
		for (let [id, det] of Object.entries(id2Detay)) {
			if (id2Item[id]) { continue }
			let {width, height, inst = {}, tip} = det
			width ||= '49%'; height ||= '49%'
			let item = _rfb.addFormWithParent(id).altAlta()
				.addCSS('item _loading')
				.setInst(this).setPart(inst)
				.setParent(items).setRootBuilder(rfb)
			// item.onInit(({ builder: { layout } }) => $.extend(inst, { layout }))
			let _e = { ...e, rfb: item }, result
			$.extend(inst, { panel: this, detay: det })
			if (tip.rapormu)
				result = inst.goster(_e)
			else if (tip.webmi) {
				item.setPart(det)
				item.setLayout(({ builder: { id, part: { value: url } } }) =>
					$(`<iframe id="${id}" class="full-wh" border="0" src="${url}"></iframe>`))
			}
			else if (tip.evalmi) {
				let {value: code} = det
				if (typeof code == 'string') {
					code = code.trim()
					{
						for (let i = 0; i < 2; i++) {
							let last = code.at(-1)
							if (last == '\r' || last == '\n') { code = code.slice(0, -1) }
						}
					}
					if (code[0] != '(') {
						code += `(e => `
						if (code.at(-1) != ')') { code += ')' }
					}
					code = eval(code)
				}
				item.setPart(det)
				if (code) {
					$.extend(_e, { panel: this, detay: det, layout, items })
					result = await getFuncValue.call(this, code, _e)
				}
			}
			result = await result
			let {layout: itemLayout} = item, part = det.part = item.part
			itemLayout.data('detay', det); itemLayout.data('part', part); itemLayout.data('inst', inst)
			inst.gridVeriYuklendiIslemi?.(({ builder: { id: _id, parentBuilder } = {} } = {}) => {
				let {id} = parentBuilder?.parentBuilder?.parentBuilder ?? {}
				let {layout} = _rfb.id2Builder[id] ?? {}
				if (layout?.length) { layout.removeClass('_loading'); layout.css({ width, height }) }
				if (++completeCount >= loadCount - 1) { this.layout.removeClass('_loading') }
			})
			// promises.push(promise)
			loadCount++
		}
		if (promises.length) { await Promise.allSettled(promises) }
		let subItems = items.find(itemSelector)
		subItems.eq(0).addClass(focusSelector)
		{
			let handler = ({ currentTarget: target }) => {
				let item = $(target)
				item.parents('.items').find(itemSelector).removeClass(focusSelector)
				item.addClass(focusSelector)
			}
			for (let key of ['mousedown', 'touchstart', 'click'])
				subItems.on(key, handler)
		}
		setTimeout(() => {
			let itemsCSS = {}
			for (let key of ['overflow', 'overflow-x', 'overflow-y']) { itemsCSS[key] = items.css(key) }
			let children = items.children('.item')
			children.resizable({
				handles: 'all', /*containment: 'parent',*/
				/*ghost: true, helper: 'ui-resizable-helper',*/
				classes: { '.ui-resizable': 'highlight' },
				start: (evt, info) => {
					let {element: item} = info
					for (let key in itemsCSS) { items.css(key, 'hidden') }
					/*items.children().addClass('basic-hidden')
					item.removeClass('basic-hidden jqx-hidden')*/
				},
				stop: (evt, info) => {
					let {id2Detay} = this, {element: item, size: { width, height }} = info
					for (let [k, v] of Object.entries(itemsCSS)) { items.css(k, v) }
					//items.children().removeClass('basic-hidden jqx-hidden')
					let id = item.prop('id'), det = id2Detay[id]
					if (det) {
						let contW = items.width(), contH = items.height()
						det.width  = `${(width  / contW * 100).toFixed(1)}%`
						det.height = `${(height / contH * 100).toFixed(1)}%`
						this.saveLayout()
					}
				}
			})
			items.sortable({
				connectWith: '> .item:not(.maximized)', handle: '.item label',
				placeholder: '_sorting', zIndex: 3000, opacity: .8, delay: 1000,
				/*tolerance: 'intersect'*/ tolerance: 'pointer',
				update: (evt, info) => {
					let {item} = info, det = item.data('detay'); if (!det) { return }
					let {id} = det; if (!id) { return }
					let {id2Detay} = this, detaylar = Object.values(id2Detay)
					let ind = detaylar.indexOf(det); if (ind  < 0) { return }
					let newInd = item.index(); if (newInd < 0) { return }
					let moved = detaylar.splice(ind, 1)[0]
				    detaylar.splice(newInd, 0, moved)
					id2Detay = this.id2Detay = Object.fromEntries(detaylar.map(det => [det.id, det]))
					this.saveLayout()
				}
			})
		}, 10)
		this.saveLayout(e)
		this._rendered = true
	}
	hizliBulIslemi(e) {
		let {bulPart} = e; clearTimeout(this._timer_hizliBulIslemi_ozel); this._timer_hizliBulIslemi_ozel = setTimeout(() => {
			try {
				let {input} = bulPart; this.hizliBulIslemi_ara(e)
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
	hizliBulIslemi_ara({ tokens }) {
		let e = { ...arguments[0] }; let {id2Detay} = this
		for (let { inst } of Object.values(id2Detay))
			_inst?.hizliBulIslemi_ara?.(e)
	}
	raporTanimIstendi(e) { this._inst?.raporTanimIstendi?.(e); return this }
	secimlerIstendi(e) { this._inst?.secimlerIstendi?.(e); return this }
	seviyeAcIstendi(e) { this._inst?.seviyeAcIstendi?.(e); return this }
	seviyeKapatIstendi(e) { this._inst?.seviyeKapatIstendi?.(e); return this }
	exportExcelIstendi(e) { this._inst?.exportExcelIstendi?.(e); return this }
	exportPDFIstendi(e) { this._inst?.exportPDFIstendi?.(e); return this }
	exportHTMLIstendi(e) { this._inst?.exportHTMLIstendi?.(e); return this }
	async yeniIstendi(e) {
		try { 
			let {values: menuItems} = await app.frMenu.listedenSec() ?? {}
			menuItems = menuItems?.filter(_ => _.choicemi)
			let items = menuItems?.map(({ id }) => DRapor.getClass(id))?.filter(x => !!x)
			items = items.map(({ kod }) => new DPanelDetay().tipRapor().setValue(kod) )
			if (!items?.length) { return }
			await this.add(...items)
			return items
		}
		catch (ex) { console.error(ex); throw ex }
		/* let headerBuilder = ({ sender: part, rootBuilder: rfb }) => {
			let {header} = part
			let form = rfb.addForm('header').setLayout(header)
			form.addTextInput('raporAdi', 'Rapor Adı')
		}
		await app.frMenu.listedenSec({ headerBuilder })*/
	}
	onResize(e) {
		super.onResize(e); let {layout} = this
		if (layout.hasClass('_loading')) { return }
		let {id2Detay} = this; if (id2Detay) {
			for (let det of Object.values(id2Detay))
				det?.onResize?.(e)
		}
	}
	getLayoutInternal(e) {
		super.getLayoutInternal(e)
		return $(`<div></div>`)
	}
}
