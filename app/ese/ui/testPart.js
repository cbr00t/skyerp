class TestPart extends Part {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get partName() { return 'test' } static get isWindowPart() { return true }
	get state() { return this.states?.[this.pageIndex] }
	get adimText() { return this.headerLayouts.adimText?.html() } set adimText(value) { this.headerLayouts.adimText?.html(value ?? '') }
	get progressText() { return this.headerLayouts.progressText?.html() } set progressText(value) { this.headerLayouts.progressText?.html(value ?? '') }
	get headerText() { return this.headerLayouts.headerText?.html() } set headerText(value) { this.headerLayouts.headerText?.html(value ?? '') }
	get tarih() { return asDate(this.headerLayouts.tarih?.html()) } set tarih(value) { this.headerLayouts.tarih?.html(dateTimeAsKisaString(value)) }
	get hastaAdi() { return this.headerLayouts.hastaAdi?.html() } set hastaAdi(value) { this.headerLayouts.hastaAdi?.html(value ?? '') }
	constructor(e) { e = e || {}; super(e); $.extend(this, { inst: e.inst, pageIndex: e.pageIndex ?? 0, headerLayouts: {} }) }
	init(e) { const {inst} = this, states = this.states = inst?.class?.uiStates || []; this.title = `${inst?.class?.aciklama || ''} Test Ekranı`; super.init(e) }
	runDevam(e) {
		super.runDevam(e); const {layout, inst, state} = this; app.enterKioskMode(); $('body').addClass('no-dark-theme');
		$.extend(this, { header: layout.children('.header'), content: layout.children('.content'), islemTuslari: layout.find('.islemTuslari') });
		const {header, islemTuslari, headerLayouts} = this; for (const key of ['adimText', 'headerText', 'progressText', 'tarih', 'hastaAdi', 'countdown']) {
			headerLayouts[key] = layout.find(`.${key}`) }
		if (!app.kioskmu) { let part = this.islemTuslariPart = new ButonlarPart({ sender: this, layout: islemTuslari, tip: 'vazgec', butonlarDuzenleyici: e => this.islemTuslariDuzenle(e) }); part.run() }
		this.tazele(e)
	}
	destroyPart(e) { $('body').removeClass('no-dark-theme'); super.destroyPart(e); if (app.kioskmu) { setTimeout(() => window.close(), 100) } else { app.exitKioskMode() } }
	islemTuslariDuzenle(e) { const {liste} = e; liste.find(item => item.id == 'vazgec').handler = e => this.cikisIstendi(e) }
	firstPage(e) { this.pageIndex = 0; this.tazele(e); return this } lastPage(e) { this.pageIndex = Math.max(this.states?.length - 1, 0); this.tazele(e); return this }
	nextPage(e) { this.pageIndex = Math.min(this.pageIndex + 1, this.states?.length - 1); this.tazele(e); return this }
	prevPage(e) { this.pageIndex = Math.max(this.pageIndex - 1, 0); this.tazele(e); return this }
	tazele(e) {
		const {inst, layout} = this, _e = { ...e, parentPart: this, sender: this, layout };
		inst?.testUI_initLayout(_e); layout.attr('data-state', this.state); return this
	}
	async kaydetIstendi(e) { 
		try { if (!await this.kaydet(e)) { return false } } catch (ex) { hConfirm(getErrorText(ex), this.title); throw ex }
		this.close(e); return true
	}
	cikisIstendi(e) { this.close(e); return this }
	async kaydet(e) {
		const {inst} = e; if (!inst) { return false }
		clearTimeout(this._timerProgress); this._timerProgress = setTimeout(() => showProgress(), 500);
		try {
			if (await inst.testUI_kaydetOncesi(e) === false) { return false }
			if (await inst.testUI_kaydet(e) === false) { return false }
			await inst.testUI_kaydetSonrasi(e); return true
		}
		finally { clearTimeout(this._timerProgress); setTimeout(() => hideProgress(), 10) }
	}
	getLayoutInternal(e) {
		super.getLayoutInternal(e); return $(
		`<div>
			<div class="islemTuslari"></div>
			<div class="header flex-row">
				<div class="adimText"></div>
				<div class="_group">
					<div class="headerText"></div>
					<div class="progressText"></div>
				</div>
				<div class="_group">
					<div class="hastaAdi"></div>
					<div class="tarih"></div>
				</div>
				<div class="countdown jqx-hidden"></div>
			</div>
			<div class="content"></div>
		</div>`)
	}
}
