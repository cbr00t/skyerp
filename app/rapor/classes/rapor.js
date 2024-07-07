class Rapor extends MQDetayliOrtak {				/* MQCogul tabanlı rapor sınıfları için gerekli inherit desteği için MQDetayliOrtak'dan getirildi */
	static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return null } static get araSeviyemi() { return false }
	static get kod() { return null } static get aciklama() { return null } static get detaylimi() { return false } static get sinifAdi() { return this.aciklama }
	static get kod2Sinif() { let result = this._kod2Sinif; if (result == null) { result = this._kod2Sinif = this.subclasses.map(cls => !cls.araSeviyemi && !!cls.kod) } return result }
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
		super.rootFormBuilderDuzenle(e); const part = e.sender, rfb = e.rootBuilder, {tanimFormBuilder} = e;
		rfb.onAfterRun(e => { const {part} = rfb, {_title} = part; if (_title) { setTimeout(() => part.updateWndTitle(_title), 10); delete part._title } });
		let form = tanimFormBuilder.addForm('dockable')
			.setLayout(e => $(
				`<div id="${e.builder.id}" class="full-wh">
					<div id="widget">
						<div class="item" style="width: 200px; height: 200px"><div class="xheader">a</div><div class="xcontent">a</div></div>
						<div class="item" style="width: 200px; height: 200px"><div class="xheader">b</div><div class="xcontent">a</div></div>
						<div class="item" style="width: 200px; height: 200px"><div class="xheader">c</div><div class="xcontent">a</div></div>
						<div class="item" style="width: 200px; height: 200px"><div class="xheader">d</div><div class="xcontent">a</div></div>
						<div class="item" style="width: 200px; height: 200px"><div class="xheader">e</div><div class="xcontent">a</div></div>
					</div>
				</div>`
			))
			/*.addStyle_fullWH().addStyle(e => `$elementCSS .item { width: 200px !important; height: 200px !important }`)*/
			.onAfterRun(e => e.builder.layout.jqxDocking({ theme, width: '100%', height: '100%', orientation: 'horizontal', mode: 'default' }))
	}
}
class MQDonemselIslemler extends MQRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'DONEMSEL_ISLEMLRE' } static get aciklama() { return 'Dönemsel İşlemler' }
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
