class IskartaGirisPart extends GerceklemeIcinAltGridliGirisPart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'iskartaGiris' }

	constructor(e) {
		e = e || {};
		super(e);
		this.kod2Rec = e.kod2Rec || {};
		this.title = (e.title ?? 'Iskarta Giriş Ekranı') || ''
	}
	get defaultTabloKolonlariDogrudan() {
		const gridIslemTuslari_width = 40;
		return [
			...super.defaultTabloKolonlariDogrudan,
			new GridKolon({ belirtec: '_sil', text: ' ', width: gridIslemTuslari_width }).readOnly()
			.tipButton({ value: 'X', onClick: e => this.silIstendi(e) }),
			new GridKolon({
				belirtec: 'aciklama', text: 'Neden', minWidth: 150, maxWidth: 250, width: '45%',
				filterType: 'input'
			}).readOnly(),
			new GridKolon({
				belirtec: 'miktar', text: 'Miktar', genislikCh: 10,
				filterType: null
			}).tipDecimal()
		]
	}
	async defaultLoadServerData(e) {
		const iskartaKodlari = {};
		const _recs = await MQIskartaNeden.loadServerData();
		const kod2Rec = this.kod2Rec = this.kod2Rec || {};
		const recs = [];
		for (const _rec of _recs) {
			const {kod, aciklama} = _rec;
			const rec = kod2Rec[kod] = kod2Rec[kod] || ({ miktar: 0 });
			$.extend(rec, { kod: kod, aciklama: aciklama });
			recs.push(rec)
		}
		return recs
	}
	grid_globalCellClassNameHandler_ek(colDef, rowIndex, belirtec, value, rec) {
		const result = super.grid_globalCellClassNameHandler_ek(colDef, rowIndex, belirtec, value, rec) || [];
		const ozelBelirtecSet = this._ozelBelirtecSet = this._ozelBelirtecSet ?? asSet(['_rowNumber', '_sil']);
		if (!ozelBelirtecSet[belirtec]) {
			if (!colDef.attributes.editable)
				result.push('grid-readOnly')
		}
		return result
	}

	async tamamIstendi(e) {
		e = e || {}; super.tamamIstendi(e); const {tamamIslemi} = this;
		if (tamamIslemi) {
			try {
				const _kod2Rec = {}, {kod2Rec, parentRec} = this, gerMiktar = parentRec.miktar; let topIskMiktar = 0;
				if (kod2Rec) {
					for (const kod in kod2Rec) {
						const rec = kod2Rec[kod], {miktar} = rec;
						if (miktar) { _kod2Rec[kod] = rec; topIskMiktar += miktar }
					}
				}
				if (topIskMiktar > gerMiktar)
					throw { isError: true, code: 'fazlaIskMiktar', errorText: `Iskarta Miktarı (${topIskMiktar}) değeri Gerçekleme Miktar (${gerMiktar}) değerinden büyük olamaz` }
				const _e = $.extend({}, e, { parentRec: this.parentRec, kod2Rec: _kod2Rec });
				if ((await getFuncValue.call(this, tamamIslemi, _e)) === false)
					return false
			}
			catch (ex) {
				hConfirm(getErrorText(ex), this.title);
				throw ex
			}
		}
		this.close()
	}
	silIstendi(e) {
		e = e || {};
		const {gridWidget} = this;
		const rec = e.rec || gridWidget.getrowdata(gridWidget.getselection().cells[0].rowindex);
		if (!rec)
			return
		rec.miktar = 0;
		gridWidget.updaterow(rec.uid, rec);
		this.kod2Rec[rec.kod] = rec;
		setTimeout(() => this.focus(), 50)
	}
}
