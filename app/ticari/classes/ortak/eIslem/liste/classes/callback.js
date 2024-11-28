class EIslemAkibet_Callback extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {
			parentPart: e.parentPart || e.sender || app.activeWndPart, islemAdi: e.islemAdi,
			tabloKolonlari: e.tabloKolonlari, source: e.source, part: e.part, ekIslemler: e.ekIslemler || []
		});
		if (e.ekIslem) { this.ekIslem(e.ekIslem) }
	}
	run(e) {
		e = e || {};
		if (progressManager && !progressManager.ekBilgiHandler) {
			progressManager.ekBilgiHandler = _e => { progressManager._ekBilgiIstendimi = true; $.extend(e, _e); this.ekBilgiGoster(e) };
			progressManager.showEkBilgi()
		}
		else if (!progressManager || progressManager._ekBilgiIstendimi) { this.ekBilgiGoster(e) }
		const {ekIslemler} = this; if (ekIslemler) { return new $.Deferred(async p => { try { for (const ekIslem of ekIslemler) { await getFuncValue.call(this, ekIslem, e) } p.resolve() } catch (ex) { p.reject(ex) } }) }
	}
	ekBilgiGoster(e) {
		e = e || {}; let {part} = this; if (part && part.isDestroyed) part = this.part = null
		const source = _e => this.getSource($.extend({}, e, _e));
		if (part) { part.source = source; part.tazele() }
		else {
			const {parentPart, tabloKolonlari} = this; let islemAdi = this.islemAdi || 'e-İşlem';
			part = this.part = new EIslemAkibetPart({ parentPart, title: `${islemAdi} Sonucu`, tabloKolonlari, source }); part.run()
		}
	}
	getSource(e) {
		let {source} = this; if (!source) { source = e.uuid2Result } if (!source) { return }
		const recs = []; if (source) {
			if (!$.isArray(source)) { source = Object.values(source) }
			for (const rec of source) {
				const _rec = rec.rec || {}, efAyrimTipi = (rec.efAyrimTipi ?? _rec.efayrimtipi) || 'A';
				const code = rec.code ?? rec.ResponseCode, message = rec.message ?? rec.errorText ?? rec.ResponseDescription;
				$.extend(rec, {
					islemZamaniText: rec.islemZamani ? (rec.islemZamani.toISOString().split('T')[1].replace('Z', '').substr(0, 10)) : '??',
					hataText: rec.isError ? 'HATA' : '', basariliText: rec.isError ? '' : 'BAŞARILI', code, message,
					efAyrimTipi: efAyrimTipi, uuid: _rec.uuid || _rec.efatuuid || _rec.efuuid || rec.UUID,
					tarih: _rec.tarih, fisNox: _rec.fisnox, eIslTipText: (EIslemOrtak.getClass({ tip: efAyrimTipi }) || {}).sinifAdi || efAyrimTipi
				});
				recs.unshift(rec)
			}
		}
		return recs
	}
	ekIslem(handler) { const {ekIslemler} = this; ekIslemler.push(handler); return this }
	ekIslemlerReset(e) { this.ekIslemler = []; return this }
}
