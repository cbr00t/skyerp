class FinansFis extends MQGenelFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return FinansDetay }
	static get gridKontrolcuSinif() { return FinansGridci }
	static get tsnKullanilirmi() { return true }
	static get ticMustKullanilirmi() { return true }
	static get numYapi() { let {numTipKod: kod} = this; return kod ? new MQNumarator({ kod }) : null }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, { baslikAciklama: new PInstStr('aciklama') })
	}
	static rootFormBuilderDuzenle_ilk(e) {
		const baslikFormlar = e.builders.baslikForm.builders;
		baslikFormlar[0].yanYana(3);
		super.rootFormBuilderDuzenle_ilk(e)
	}
	static rootFormBuilderDuzenle_son(e) {
		const baslikFormlar = e.builders.baslikForm.builders;
		baslikFormlar[2].yanYana(2);
		super.rootFormBuilderDuzenle_son(e);
		let form = baslikFormlar[baslikFormlar[0].builders.length < 3 ? 0 : baslikFormlar[1].builders.length < 3 ? 1 : 2];
		form.addTextInput({ id: 'baslikAciklama', etiket: 'Açıklama' });
	}
	static secimlerDuzenleSon(e) {
		super.secimlerDuzenleSon(e);
		const sec = e.secimler;
		sec.secimTopluEkle({ aciklama: new SecimOzellik({ etiket: 'Açıklama' }) });
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this, wh = e.where, sec = e.secimler;
			wh.ozellik(sec.aciklama, `${aliasVeNokta}aciklama`)
		})
	}
	static standartGorunumListesiDuzenle_son(e) {
		super.standartGorunumListesiDuzenle_son(e);
		e.liste.push('fisaciklama')
	}
	static orjBaslikListesiDuzenle_son(e) {
		super.orjBaslikListesiDuzenle_son(e);
		const {aliasVeNokta} = this, {liste} = e;
		liste.push(new GridKolon({ belirtec: 'fisaciklama', text: 'Fiş Açıklama', genislikCh: 50, sql: 'fis.aciklama' }))
	}
}
class FinansDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ticMustKullanilirmi() { return true }
}
class FinansGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	grid_cellClassName(colDef, rowIndex, belirtec, value, det) {
		const result = [belirtec];
		const editableSet = det._editableSet || {};
		if (!editableSet[belirtec])
			result.push('grid-readOnly')
		return result.join(' ')
	}
	grid_cellBeginEdit(colDef, rowIndex, belirtec, colType, value) {
		const det = colDef.gridPart.gridWidget.getrowdata(rowIndex);
		const editableSet = det._editableSet || {};
		return !!editableSet[belirtec]
	}
	async fis2Grid(e) {
		const {fis} = e.sender;
		let result = await super.fis2Grid(e);
		if (!result)
			return result
		if (fis && fis.cacheOlustur)
			fis.cacheOlustur(e)
		return true
	}
}
