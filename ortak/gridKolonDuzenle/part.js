class GridKolonDuzenlePart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'gridKolonDuzenle' } static get isWindowPart() { return true }
	get defaultLayoutSelector() { return super.defaultLayoutSelector }
	get mfSinif() { let result = this._mfSinif; if (!result) result = this.parentPart?.mfSinif; return result }
	get orjBaslikListesi() {
		let result = this._orjBaslikListesi; if (!result) result = this.mfSinif?.orjBaslikListesi
		if ($.isEmptyObject(result)) result = this.gridTabloKolonlari; return result
	}
	get gridTabloKolonlari() { let result = this._gridTabloKolonlari; if (!result) result = this.parentPart?.duzKolonTanimlari; return result }

	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {
			_mfSinif: e.mfSinif, _orjBaslikListesi: e.orjBaslikListesi, _gridTabloKolonlari: e.gridTabloKolonlari,
			islemTuslariDuzenleyici: e.islemTuslariDuzenle || e.islemTuslariDuzenleyici, tamamIslemi: e.tamamIslemi
		});
		this.title = e.title || 'Kolon Düzenleme Ekranı'
	}
	afterRun(e) {
		e = e || {}; super.afterRun(e); const {layout} = this, header = this.header = layout.find('.header');
		const islemTuslari = this.islemTuslari = layout.find(`.islemTuslari`);
		const islemTuslariPart = this.islemTuslariPart = new ButonlarPart({ sender: this, layout: islemTuslari, tip: 'tamamVazgec', butonlarDuzenleyici: e => this.islemTuslariDuzenle(e) }); islemTuslariPart.run();
		const splitMain = this.splitMain = layout.find('#splitMain'), divSol = this.divSol = splitMain.find('#sol'), divSag = this.divSag = splitMain.find('#sag');
		const divKalanlar = this.divKalanlar = divSol.find('#kalanlar'), divSecilenler = this.divSecilenler = divSag.find('#secilenler');
		splitMain.jqxSplitter({ theme: theme, width: '100%', height: $(window).height(), orientation: 'vertical', splitBarSize: 20, panels: [ { size: '50%' }, { size: '50%' } ] });
		for (const elm of [divKalanlar, divSecilenler]) {
			/* elm.addClass('float-left');*/
			elm.jqxListBox({
				theme: theme, width: '100%', height: '90%', filterable: true, filterHeight: 55, filterPlaceHolder: 'Hızlı Bul', searchMode: 'containsignorecase',
				allowDrag: true, allowDrop: true, itemHeight: 45, checkboxes: false, valueMember: 'belirtec', displayMember: 'text', source: []
				/*renderer: (index, label, value) => `<div class="list-item" style="font-size: 110%; color: #555; width: 100%; height: 100%;">${label}</div>`*/
			})/*.jqxSortable({ theme: theme, items: `div[role=option]` }) */
		}
		splitMain.find('#kaldir').jqxButton({ theme }).on('click', evt => this.kaldirIstendi($.extend({}, e, { event: evt })));
		splitMain.find('#aktar').jqxButton({ theme }).on('click', evt => this.aktarIstendi($.extend({}, e, { event: evt })));
		const belirtec2OrjBaslik = this.belirtec2OrjBaslik = {};
		for (const colDef of this.orjBaslikListesi) belirtec2OrjBaslik[colDef.belirtec] = colDef
		const _belirtec2OrjBaslik = $.extend({}, belirtec2OrjBaslik), gridAttrListe = this.gridTabloKolonlari.map(colDef => colDef.belirtec), secilenler = [];
		for (const belirtec of gridAttrListe) {
			const colDef = _belirtec2OrjBaslik[belirtec]; if (!colDef) continue
			secilenler.push(colDef); delete _belirtec2OrjBaslik[belirtec]
		}
		divSecilenler.jqxListBox('source', secilenler);
		const kalanlar = Object.values(_belirtec2OrjBaslik); divKalanlar.jqxListBox('source', kalanlar);
		this.show(); const rfb = this.builder = this.getRootFormBuilder(e); rfb.run()
	}
	getRootFormBuilder(e) { const rfb = new RootFormBuilder({ part: this }); return rfb }
	initWndArgsDuzenle(e) { super.initWndArgsDuzenle(e); const {wndArgs} = this; /*$.extend(wndArgs, { keyboardCloseKey: '' })*/ }
	islemTuslariDuzenle(e) {
		const {islemTuslariDuzenleyici} = this;
		if (islemTuslariDuzenleyici) {
			let result = getFuncValue.call(this, islemTuslariDuzenleyici, e);
			if (typeof result == 'object') e.liste = result = result.liste || result;
		}
		const {liste} = e, yListe = [
			/*{ id: 'sablonYukle', handler: e => this.sablonYukleIstendi(e) },
			{ id: 'sablonSakla', handler: e => this.sablonSaklaIstendi(e) }*/
			{ id: 'tumunuKaldir', handler: e => this.tumunuKaldirIstendi(e) },
			{ id: 'tumunuAktar', handler: e => this.tumunuAktarIstendi(e) }
		];
		for (const item of liste) {
			const {id} = item;
			switch (id) {
				case 'tamam': item.handler = e => this.tamamIstendi(e); break
				case 'vazgec': item.handler = e => this.vazgecIstendi(e); break
			}
			yListe.push(item)
		}
		e.liste = yListe
	}
	tamamIstendi(e) {
		const {divSecilenler, belirtec2OrjBaslik, mfSinif} = this;
		const recs = divSecilenler.jqxListBox('getItems').map(rec => belirtec2OrjBaslik[rec.value]);
		const yerelParam = app.params.yerel || {}, mfSinif2KolonAyarlari = yerelParam.mfSinif2KolonAyarlari = yerelParam.mfSinif2KolonAyarlari || {};
		let kolonAyarlari = {}; const yerelParamBelirtec = mfSinif?.yerelParamBelirtec || this.parentPart.class.classKey;
		if (yerelParamBelirtec) kolonAyarlari = mfSinif2KolonAyarlari[yerelParamBelirtec] = mfSinif2KolonAyarlari[yerelParamBelirtec] || {}
		kolonAyarlari.gorunumListesi = recs.map(colDef => colDef.belirtec); if (yerelParamBelirtec && yerelParam.kaydet) yerelParam.kaydet()
		const {tamamIslemi} = this; if (tamamIslemi) { if (getFuncValue.call(this, tamamIslemi, { sender: this, recs, kolonAyarlari }) === false) return false }
		this.close(e)
	}
	sablonYukleIstendi(e) { }
	sablonSaklaIstendi(e) { }
	kaldirIstendi(e) {
		e = e || {}; const {divKalanlar, divSecilenler} = this, recs = divSecilenler.jqxListBox('getSelectedItems') || [];
		for (const rec of recs) { divKalanlar.jqxListBox('addItem', rec); divSecilenler.jqxListBox('removeItem', rec) }
	}
	aktarIstendi(e) {
		e = e || {}; const {divKalanlar, divSecilenler} = this, recs = divKalanlar.jqxListBox('getSelectedItems') || [];
		for (const rec of recs) { divSecilenler.jqxListBox('addItem', rec); divKalanlar.jqxListBox('removeItem', rec) }
	}
	tumunuAktarIstendi(e) { e = e || {}; this.divSecilenler.jqxListBox('source', this.orjBaslikListesi); this.divKalanlar.jqxListBox('source', []) }
	tumunuKaldirIstendi(e) { e = e || {}; this.divSecilenler.jqxListBox('source', []); this.divKalanlar.jqxListBox('source', this.orjBaslikListesi) }
}
