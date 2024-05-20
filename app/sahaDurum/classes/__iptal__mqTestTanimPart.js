class MQTestTanimPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'test' } static get isWindowPart() { return true }
	get yenimi() { return this.islem == 'yeni' } get degistirmi() { return this.islem == 'degistir' } get silmi() { return this.islem == 'silmi' }
	get kopyami() { return this.islem == 'kopya' } get yeniVeyaKopyami() { return this.yenimi || this.kopyami } 
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { builder: e.builder, islem: e.islem, mfSinif: e.mfSinif, inst: e.inst, eskiInst: e.eskiInst, kaydetIslemi: e.kaydetIslemi, kaydedince: e.kaydedince });
		let {mfSinif, inst, eskiInst} = this;
		if (!inst && mfSinif) inst = this.inst = new mfSinif(); if (inst && !mfSinif) mfSinif = this.mfSinif = inst.class
		if (inst && !eskiInst && this.degistirmi) eskiInst = this.eskiInst = inst.deepCopy()
		this.title = e.title ?? `${mfSinif?.sinifAdi || ''} Tanım`;
		const {islem} = this; if (islem) { const islemText = islem[0].toUpperCase() + islem.slice(1); this.title += ` &nbsp;[<span class="window-title-ek">${islemText}</span>]` }
	}
	async init(e) { e = e || {}; await super.init(e) }
	runDevam(e) {
		e = e || {}; super.runDevam(e); const {layout} = this;
		const header = this.header = layout.find('header'), content = this.content = layout.find('main');
		$.extend(this, { islemTuslari: header.find('#islemTuslari') }); this.initIslemTuslari(e)
	}
	afterRun(e) {
		super.afterRun(e); /*setTimeout(() => this.show(), 100);*/
		setTimeout(async () => { await this.initFormBuilder(e); this.formGenelEventleriBagla(e); if (this.yeniVeyaKopyami) this.yeniTanimOncesiIslemler(e) /*this.show()*/ }, 0)
	}
	destroyPart(e) { e = e || {}; for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.destroyPart) builder.destroyPart(e) } super.destroyPart(e) }
	async initFormBuilder(e) {
		let {builder} = this; const {inst} = this;
		if (!builder && inst) { const _e = { sender: this }; builder = (await inst.getRootFormBuilder(_e)) ?? (await inst.getFormBuilders(_e)) }
		if ($.isEmptyObject(builder)) return
		const {layout} = this, subBuilders = builder.isFormBuilder ? [builder] : builder, id2Builder = this.id2Builder = {};
		for (const key in subBuilders) {
			const builder = subBuilders[key]; if (!builder) continue
			let _parent = builder.parent; builder.part = this;
			if (builder.isRootFormBuilder) {
				this.builder = builder; let _layout = builder.layout;
				if (!( _parent?.length || _layout?.length)) _layout = builder.layout = layout
			}
			else if (!_parent?.length) _parent = builder.parent = layout
			let _id = builder.id; if (!_id) _id = builder.id = builder.newElementId();
			if (_id) id2Builder[_id] = builder
			/*builder.noAutoInitLayout();*/ builder.run()
		}
	}
	initIslemTuslari(e) {
		const rfb = new RootFormBuilder({ part: this });
		rfb.addIslemTuslari('islemTuslari').setLayout(e => e.builder.rootPart.islemTuslari)
			.widgetArgsDuzenleIslemi(e => $.extend(e.args, {
				ekButonlarIlk: [
					{ id: 'tamam', handler: e => e.sender.kaydetIstendi(e) },
					{ id: 'vazgec', handler: e => e.sender.vazgecIstendi(e) }
				]
			}))
			.onAfterRun(e => { const {builder} = e, {part, rootPart} = builder; rootPart.islemTuslariPart = part });
		rfb.run() 
	}
	yeniTanimOncesiIslemler(e) {
		e = e || {}; e.sender = this;
		for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.yeniTanimOncesiIslemler) builder.yeniTanimOncesiIslemler(e) }
	}
	async kaydetIstendi(e) {
		e = e || {}; e.sender = this; const {inst, eskiInst, mfSinif} = this; let result;
		try {
			for (const builder of this.getBuilders(e)) {
				if (builder.kaydetIstendi) {
					e.builder = builder; const _result = builder.kaydetIstendi(e);
					if (_result === false) return false; if (result?.isError) throw result
				}
			}
			let result = await this.kaydetOncesiIslemler(e); if (result === false) return result
			if (result == null) {
				if (this.yeniVeyaKopyami) result = await inst.yaz()
				else if (this.degistirmi) result = await inst.degistir(eskiInst)
				else if (this.silmi) result = await inst.sil()
				if (!result || result.isError) return false
			}
			await this.kaydetSonrasiIslemler(e);
			const {kaydedince} = this; if (kaydedince) { const _e = $.extend({}, e, { sender: this, mfSinif, inst, eskiInst, result }); getFuncValue.call(this, kaydedince, _e) }
			this.kaydetCalistimi = true; this.destroyPart()
		}
		catch (ex) { console.error(ex); const error = getErrorText(ex); if (error) hConfirm(error, `${mfSinif.sinifAdi || 'Rapor'} Kaydet İşlemi`); return false }
	}
	async kaydetOncesiIslemler(e) {
		e = e || {}; const {builder, islem, inst, eskiInst} = this; e.sender = this;
		for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.kaydetOncesiIslemler) await builder.kaydetOncesiIslemler(e) }
		const _e = $.extend({}, e, { sender: this, builder, islem, inst, eskiInst });
		let result = await this.inst.uiKaydetOncesiIslemler(_e);
		for (const key of ['inst', 'eskiInst']) { const value = _e[key]; if (value !== undefined) this[key] = e[key] = value }
		const {kaydetIslemi} = this; if (kaydetIslemi) { _e.result = result; result = await getFuncValue.call(this, kaydetIslemi, _e) }
		if (result != null) return result
	}
	async kaydetSonrasiIslemler(e) {
		e = e || {}; e.sender = this;
		for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.kaydetSonrasiIslemler) await builder.kaydetSonrasiIslemler(e) }
	}
	async vazgecIstendi(e) {
		e = e || {};
		if (!this.kaydetCalistimi) {
			e.sender = this;
			for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.vazgecIstendi) await builder.vazgecIstendi(e) }
		}
		await super.vazgecIstendi(e)
	}
	formGenelEventleriBagla(e) {
		e = e || {}; e.sender = this;
		for (const builder of this.getBuilders(e)) { e.builder = builder; if (builder.formGenelEventleriBagla) builder.formGenelEventleriBagla(e) }
		const inputs = this.layout.find('input[type=textbox], input[type=text], input[type=number]');
		if (inputs.length) { inputs.on('focus', evt => evt.target.select()) }
	}
	*getBuilders(e) {
		const {id2Builder} = this;
		if (id2Builder) { for (const builder of Object.values(id2Builder)) { for (const subBuilder of builder.getBuildersWithSelf()) yield subBuilder } }
	}
	getLayoutInternal(e) {
		return $(
			`<div>` +
				`<header class="header"><div id="islemTuslari"></div></header>` +
				`<main class="content full-wh dock-bottom">` +
			`</div>`
		)
	}
}
