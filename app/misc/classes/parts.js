class MiscResimPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get isWindowPart() { return false }
	static get partName() { return 'miscResim' } static get sinifAdi() { return 'Resim Görüntüleyici' }
	constructor(e) { e = e || {}; super(e); $.extend(this, { title: e.title ?? this.class.sinifAdi, urlListe: e.urlListe ?? e.images ?? [] }) }
	run(e) {
		e = e || {}; super.run(e); const {layout} = this;
		const header = this.header = layout.children('.header'), islemTuslari = this.islemTuslari = header.children('.islemTuslari');
		const subContent = this.subContent = layout.children('.content'), dokumanForm = this.dokumanForm = subContent.find('.dokumanForm');
		const builder = this.builder = this.getRootFormBuilder(e); if (builder) { $.extend(builder, { part: this }); builder.autoInitLayout().run(e) }
	}
	destroyPart(e) { super.destroyPart(e) }
	tazele(e) { e = e || {}; const {part} = this, images = this.urlListe; $.extend(part, { images }); part.run(); return this }
	getRootFormBuilder(e) {
		const rfb = new RootFormBuilder(), {islemTuslari, dokumanForm} = this;
		rfb.addIslemTuslari('islemTuslari').setLayout(islemTuslari).widgetArgsDuzenleIslemi(e => $.extend(e.args, { ekButonlarIlk: [{ id: 'vazgec', handler: e => e.builder.rootBuilder.part.close(e) }] }));
		let layout = app.getLayout({ selector: '#skyResim.part' }); layout.appendTo(dokumanForm); layout.addClass('full-wh');
		let part = this.part = new SkyResimPart({ layout }); let form = rfb.addForm('dokumanForm').setLayout(dokumanForm).setPart(part).onAfterRun(e => this.tazele(e)); return rfb
	}
	getLayoutInternal(e) {
		return $(`
			<div class="full-wh">
				<div class="header full-width jqx-hidden">
					<div class="islemTuslari"></div>
				</div>
				<div class="content full-width dock-bottom">
					<div class="dokumanForm full-wh"></div>
				</div>
			</div>`
		)
	}
}
class MiscResimWindowPart extends MiscResimPart { static { window[this.name] = this; this._key2Class[this.name] = this } static get isWindowPart() { return true } }
