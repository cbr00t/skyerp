class TestPart extends Part {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get partName() { return 'test' } static get isWindowPart() { return true }
	get state() { return this.states?.[this.pageIndex] }
	get adimText() { return this.header?.divAdimText.html() } set adimText(value) { this.divAdimText?.html(value ?? '') }
	constructor(e) { e = e || {}; super(e); $.extend(this, { inst: e.inst, pageIndex: e.pageIndex ?? 0 }) }
	init(e) { const {inst} = this, states = this.states = inst.uiStates || []; this.title = `${inst?.class?.aciklama || ''} Test Ekranı`; super.init(e) }
	runDevam(e) {
		super.runDevam(e); const {layout, inst, state} = this;
		$.extend(this, { header: layout.children('.header'), content: layout.children('.content'), islemTuslari: layout.find('.islemTuslari') }); this.divAdimText = this.header.find('.adimText');
		let part = this.islemTuslariPart = new ButonlarPart({ sender: this, layout: this.islemTuslari, tip: 'vazgec', butonlarDuzenleyici: e => this.islemTuslariDuzenle(e) }); part.run();
		this.tazele(e)
	}
	islemTuslariDuzenle(e) { const {liste} = e; liste.find(item => item.id == 'vazgec').handler = e => this.close(e) }
	firstPage(e) { this.pageIndex = 0; this.tazele(e); return this } lastPage(e) { this.pageIndex = Math.max(this.states?.length - 1, 0); this.tazele(e); return this }
	nextPage(e) { this.pageIndex = Math.min(this.pageIndex + 1, this.states?.length - 1); this.tazele(e); return this }
	prevPage(e) { this.pageIndex = Math.max(this.pageIndex - 1, 0); this.tazele(e); return this }
	tazele(e) { const {inst, layout} = this, _e = { ...e, parentPart: this, sender: this, layout }; inst?.testUI_initLayout(_e); return this }
	async kaydetIstendi(e) { 
		try { if (!await this.kaydet(e)) { return false } } catch (ex) { hConfirm(getErrorText(ex), this.title); throw ex }
		this.close(e); return true
	}
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
		super.getLayoutInternal(e);
		return $(`<div><div class="islemTuslari"></div><div class="header"><div class="adimText"></div></div><div class="content"></div></div>`)
	}
}
