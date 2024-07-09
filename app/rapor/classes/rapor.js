class Rapor extends MQDetayliOrtak {				/* MQCogul tabanlı rapor sınıfları için gerekli inherit desteği için MQDetayliOrtak'dan getirildi */
	static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return null } static get araSeviyemi() { return false }
	static get kod() { return null } static get aciklama() { return null } static get detaylimi() { return false } static get sinifAdi() { return this.aciklama }
	static get kod2Sinif() {
		let result = this._kod2Sinif; if (result == null) {
			result = {}; const {subClasses} = this;
			for (const cls of subClasses) { const {araSeviyemi, kod} = cls; if (!araSeviyemi && kod) { result[kod] = cls } }
			this._kod2Sinif = result
		}
		return result
   }
	static getClass(e) { const kod = typeof e == 'object' ? (e.kod ?? e.tip) : e; return this.kod2Sinif[kod] }
	static goster(e) { let inst = new this(e); inst.goster(); return inst }
	goster(e) { }
}
class MQRapor extends Rapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'mq' }
	goster(e) { return this.listeEkraniAc(e) }
}
class OzelRapor extends Rapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'ozel' } static get tanimUISinif() { return ModelTanimPart }
	goster(e) {
		e = e || {}; const {tanimUISinif} = this.class; if (tanimUISinif == null) { return null }
		const _e = { ...e, islem: e.islem ?? 'izle', inst: e.inst ?? this, _title: e.title ?? `<b class="royalblue">${this.class.aciklama}</b> Raporu` }
		let part = new tanimUISinif(_e); part.run(); return part
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const rootPart = e.sender, rfb = e.rootBuilder
		rootPart.acilinca(() => this.onAfterRun({ ...e, builder: rfb }))
	}
	static onAfterRun(e) { const {builder} = e, rootPart = builder.part, _title = rootPart?._title; if (_title) { setTimeout(() => rootPart.updateWndTitle(_title), 10); delete rootPart._title } }
}
class OzelRapor_Sortable extends OzelRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static rootFormBuilderDuzenle(e) { super.rootFormBuilderDuzenle(e); const rootPart = e.sender; rootPart.sortableLayouts = rootPart.sortableLayouts || [] }
	static onAfterRun(e) {
		super.onAfterRun(e); const {builder} = e, {layout} = builder, rootPart = builder.part, {sortableLayouts} = rootPart;
		if (sortableLayouts?.length) {
			$(sortableLayouts).sortable({
				theme, containment: 'parent', tolerance: 'pointer',items: '> .item',
				classes: { 'ui-sortable-helper': 'bg-lightroyalblue' } /*helper: evt => $('<div>dragging...</div>')*/
			})
		}
	}
}

class Rapor_DonemselIslemler extends MQRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'DONEMSEL_ISLEMLER' } static get aciklama() { return 'Dönemsel İşlemler' }
	static secimlerDuzenle(e) {
		const sec = e.secimler; sec.secimTopluEkle({
			secim1: new SecimOzellik({ etiket: 'Seçim 1' }),
			secim2: new SecimOzellik({ etiket: 'Seçim 2' })
		});
		sec.whereBlockEkle(e => { const sec = e.secimler, wh = e.where })
	}
	static orjBaslikListesi_groupsDuzenle(e) { const {liste} = e; liste.push('grupText') }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(...[
			new GridKolon({ belirtec: 'kod', text: 'Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'islemAdi', text: 'İşlem', genislikCh: 20 }),
			new GridKolon({ belirtec: 'grupText', text: 'Döviz + İşlem' }).hidden()
		])
	}
	static loadServerData(e) {
		const recs = []; for (let i = 0; i < 50; i++) { recs.push({ kod: 'TL', islemAdi: 'ABC' }) }
		for (const rec of recs) { rec.grupText = `<b>${rec.kod || ''}</b> <span>${rec.islemAdi}</span>` }
		return recs
	}
	static orjBaslikListesiDuzenle_detaylar(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(...[
			new GridKolon({ belirtec: 'kod', text: 'Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'islemAdi', text: 'İşlem', genislikCh: 20 })
		])
	}
	static loadServerData_detaylar(e) {
		const recs = []; for (let i = 0; i < 100; i++) { recs.push({ kod: 'TL', islemAdi: 'ABC' }) }
		return recs
	}
}
class Rapor_Satislar extends OzelRapor_Sortable {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'SATISLAR' } static get aciklama() { return 'Satışlar' }
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const rootPart = e.sender, rfb = e.rootBuilder, {tanimFormBuilder} = e, {sortableLayouts} = rootPart;
		let form = tanimFormBuilder.addForm('dockable')
			.setLayout(e => $(
				`<div id="${e.builder.id}" class="full-wh">
					<div class="item">grid 1</div>
					<div class="item">grid 2</div>
					<div class="item">div 1</div>
					<div class="item">div 2</div>
					<div class="item">div 2</div>
					<div class="item">chart 1</div>
					<div class="item">chart 2</div>
				</div>`
			))
			.addStyle_fullWH().addStyle(e => `$elementCSS .item { min-width: 400px; min-height: 250px; width: 30%; height: 30%; margin: 10px; padding: 10px; border: 1px solid #aaa; float: left }`);
		sortableLayouts.push(form.layout)
	}
}
