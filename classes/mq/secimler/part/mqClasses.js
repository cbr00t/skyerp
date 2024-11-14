class MQSecim extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Seçim Tanımları' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return true } static get secimSinif() { return null }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { tipBelirtec: new PInstStr(), aciklama: new PInstStr(), icerik: new PInstStr() }) }
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); $.extend(e.args, { rowsHeight: 50 })
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'tipBelirtec', text: 'Tip', genislikCh: 10 }),
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 50 }),
			new GridKolon({ belirtec: 'icerikStr', text: 'İçerik', genislikCh: 200 })
		)
	}
	static loadServerDataDogrudan(e) {
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tipBelirtec} = gridPart;
		const rootConfig = app.params?.yerel ?? {}, baseConfig = rootConfig.secimler ?? {};
		let config = baseConfig; if (tipBelirtec) { config = {}; config[tipBelirtec] = baseConfig[tipBelirtec] ?? {} }
		let recs = []; for (const [_tipBelirtec, aciklama2Icerik] of Object.entries(config)) {
			for (const [aciklama, icerik] of Object.entries(aciklama2Icerik)) {
				const icerikStr = icerik ? toJSONStr(icerik) : null;
				recs.push({ tipBelirtec: _tipBelirtec, aciklama, icerik, icerikStr })
			} }
		return recs
	}
	sil(e) {
		e = e ?? {}; let {recs} = e; if (!recs && e.rec) { recs = [e.rec] }
		if (!recs) {
			const {listePart: gridPart, rowIndexes} = e, _recs = recs = gridPart?.boundRecs;
			if (_recs && rowIndexes) { recs = []; for (const ind of rowIndexes) { recs.push(_recs[ind]) } }
		}
		if (!recs?.length) { return false }
		const rootConfig = app.params?.yerel ?? {}, baseConfig = rootConfig.secimler ?? {};
		let degistimi = false; for (const rec of recs) {
			let {tipBelirtec, aciklama} = rec, config = baseConfig[tipBelirtec]; if (!config) { continue }
			if (config[aciklama] !== undefined) { delete config[aciklama]; degistimi = true }
		}
		if (degistimi) { rootConfig.kaydetDefer?.() }
		return true
	}
}
