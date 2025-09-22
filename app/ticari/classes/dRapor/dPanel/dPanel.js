class DPanel extends Part {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get isWindowPart() { return true }
	static get partName() { return 'dPanel' } get partName() { return this.class.partName }
	static get anaTip() { return 'panel' } static get kategoriKod() { return null } static get araSeviyemi() { return false }
	static get kod() { return this.anaTip } static get aciklama() { return 'Panel Rapor' }
	static get uygunmu() { return !!config.dev } get uygunmu() { return this.class.uygunmu }
	static get dPanelmi() { return true } get dPanelmi() { return this.class.dPanelmi }
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
	get rapor() {
		let {items} = this
		let subItem = items.find('.item:where(.hasFocus)'); if (!subItem?.length) { return null }
		let rapor = subItem.parents('#items').parent().data('rapor'); if (!rapor) { return null }
		return rapor
	}
	constructor(e = {}) {
		super(e); let {id2Rapor} = e, {aciklama} = this.class
		let {title = `<b class="royalblue">${aciklama}</b>`} = this
		$.extend(this, { title, id2Rapor })
	}
	static getClass(e) {
		let kod = typeof e == 'object' ? (e.kod ?? e.tip) : e
		return this.kod2Sinif[kod]
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
		super.runDevam(e); let {layout} = this
		let rfb = e.rfb = new RootFormBuilder()
		rfb.setLayout(layout).setPart(this).setInst(this)
		this.rootFormBuilderDuzenle(e)
		let inst = this, part = this, {rfb: builder} = e
		$.extend(this, { builder }); builder.run(e)
		makeScrollable(this.items)
		return { inst, part, builder }
	}
	afterRun(e) {
		super.afterRun(e)
		this.panelleriOlustur(e)
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
			(sabitmi ? null : { id: 'raporTanim', text: 'Rapor Tanım', handler: _e => this.raporTanimIstendi({ ...e, ..._e }) }),
			{ id: 'secimler', text: '', handler: _e => this.secimlerIstendi({ ...e, ..._e }) },
			{ id: 'seviyeAc', text: 'Seviye Aç', handler: _e => this.seviyeAcIstendi({ ...e, ..._e }) },
			{ id: 'seviyeKapat', text: 'Seviye Kapat', handler: _e => this.seviyeKapatIstendi({ ...e, ..._e }) },
			{ id: 'excel', text: '', handler: _e => this.exportExcelIstendi({ ...e, ..._e }) },
			/*{ id: 'pdf', text: '', handler: _e => this.exportPDFIstendi({ ...e, ..._e }) },*/
			{ id: 'html', text: '', handler: _e => this.exportHTMLIstendi({ ...e, ..._e }) }
		].filter(x => !!x))
	}
	islemTuslariGetId2Handler(e) {
		return ({
			tazele: e => this.tazele(e),
			vazgec: e => this.close(e)
		})
	}
	tazele(e) {
		let {id2Rapor} = this
		for (let rapor of Object.values(id2Rapor))
			rapor?.tazele(e)
	}
	super_tazele(e) { super.tazele(e) }
	async raporlarDuzenle(e) {
		this.add(
			new DRapor_Hareketci_Cari().setWH('50%', '35%'),
			new SBRapor_Default().setWH('50%', '35%'),
			new DRapor_DonemselIslemler().setWH('100%', '65%')
		)
	}
	async panelleriOlustur(e) {
		let panel = this, {builder: rfb, id2Rapor, items, layout} = this
		if (id2Rapor == null) {
			this.clear(); await this.raporlarDuzenle(e)
			id2Rapor = this.id2Rapor
		}
		let itemSelector = 'div > .item', focusSelector = 'hasFocus'
		let _rfb = new RootFormBuilder(), promises = [], loadCount = 0, completeCount = 0
		layout.addClass('_loading'); let itemsChildren = items.children()
		for (let i = 0; i < itemsChildren.length; i++) {
			let item = itemsChildren.eq(i), {part} = item
			part?.destroyPart(); item.remove()
		}
		for (let [id, rapor] of Object.entries(id2Rapor)) {
			let {width = '50%', height = '50%'} = rapor
			let item = _rfb.addFormWithParent(id).altAlta()
				.addCSS('_loading')
				.setInst(this).setPart(rapor)
				.setParent(items).setRootBuilder(rfb)
			// item.onInit(({ builder: { layout } }) => $.extend(rapor, { layout }))
			await rapor.goster({ ...e, rfb: item })
			let {layout: itemLayout} = item, part = rapor.part = item.part
			itemLayout.data('rapor', rapor); itemLayout.data('part', part)
			rapor.gridVeriYuklendiIslemi?.(({ builder: { parentBuilder } = {} } = {}) => {
				let {id} = parentBuilder?.parentBuilder?.parentBuilder ?? {}
				let {layout} = _rfb.id2Builder[id] ?? {}
				if (layout?.length) {
					layout.removeClass('_loading')
					layout.css({ width, height })
				}
				completeCount++
				if (completeCount >= loadCount - 1) { this.layout.removeClass('_loading') }
			})
			// promises.push(promise)
			loadCount++
		}
		if (promises.length) { await Promise.allSettled(promises) }
		let subItems = items.find(itemSelector)
		subItems.eq(0).addClass(focusSelector)
		subItems.on('click', ({ currentTarget: target }) => {
			let item = $(target)
			item.parents('.items').find(itemSelector).removeClass(focusSelector)
			item.addClass(focusSelector)
		})
		/*setTimeout(() =>
			items.jqxSortable({ theme, items: '.item' }),
			10)*/
	}
	add(...items) {
		let {id2Rapor} = this
		for (let item of items) {
			if (item == null) { continue }
			if ($.isArray(item)) { this.add(...item); continue } 
			let {id = newGUID(), rapor} = item
			rapor = item?.rapor ?? item
			if (isClass(rapor)) { rapor = new rapor() }
			if (rapor == null) { continue }
			$.extend(rapor, { panel: this })
			id2Rapor[id] = rapor
		}
		return this
	}
	clear() { this.id2Rapor = {}; return this }
	async ilkIslemler(e) {
		let {id2Rapor} = this
		for (let rapor of Object.values(id2Rapor)) { await rapor.ilkIslemler?.(e) }
	}
	async ilkIslemler_ek(e) {
		let {id2Rapor} = this
		for (let rapor of Object.values(id2Rapor)) { await rapor.ilkIslemler_ek?.(e) }
		this.ilkIslemler_ozel?.(e)
	}
	async sonIslemler(e) {
		let {id2Rapor} = this
		for (let rapor of Object.values(id2Rapor)) { await rapor.sonIslemler?.(e) }
	}
	async sonIslemler_ek(e) {
		let {id2Rapor} = this
		for (let rapor of Object.values(id2Rapor)) { await rapor.sonIslemler_ek?.(e) }
		this.sonIslemler_ozel?.(e)
	}
	onResize(e) {
		super.onResize(e); let {layout} = this
		if (layout.hasClass('_loading')) { return }
		let {id2Rapor} = this; if (id2Rapor) {
			for (let rapor of Object.values(id2Rapor))
				rapor?.onResize?.(e)
		}
	}
	hizliBulIslemi(e) {
		let {bulPart} = e; clearTimeout(this._timer_hizliBulIslemi_ozel); this._timer_hizliBulIslemi_ozel = setTimeout(() => {
			try {
				let {input} = bulPart; this.hizliBulIslemi_ara(e);
				for (let  delayMS of [400, 1000]) {
					setTimeout(() => {
						bulPart.focus();
						setTimeout(() => { input[0].selectionStart = input[0].selectionEnd = input[0].value?.length }, 205)
					}, delayMS)
				}
				setTimeout(() => FiltreFormPart.hizliBulIslemi(e), 500)
			}
			finally { delete this._timer_hizliBulIslemi_ozel }
		}, 100)
	}
	hizliBulIslemi_ara({ tokens }) {
		let e = { ...arguments[0] }; let {id2Rapor} = this
		for (let rapor of Object.values(id2Rapor))
			rapor?.hizliBulIslemi_ara?.(e)
	}
	raporTanimIstendi(e) { this.rapor?.raporTanimIstendi?.(e); return this }
	secimlerIstendi(e) { this.rapor?.secimlerIstendi?.(e); return this }
	seviyeAcIstendi(e) { this.rapor?.seviyeAcIstendi?.(e); return this }
	seviyeKapatIstendi(e) { this.rapor?.seviyeKapatIstendi?.(e); return this }
	exportExcelIstendi(e) { this.rapor?.exportExcelIstendi?.(e); return this }
	exportPDFIstendi(e) { this.rapor?.exportPDFIstendi?.(e); return this }
	exportHTMLIstendi(e) { this.rapor?.exportHTMLIstendi?.(e); return this }
	getLayoutInternal(e) {
		super.getLayoutInternal(e)
		return $(`<div></div>`)
	}
}
