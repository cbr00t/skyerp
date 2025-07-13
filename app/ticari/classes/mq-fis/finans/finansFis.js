class FinansFis extends MQGenelFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'finansfis' } static get detaySinif() { return FinansDetay } static get gridKontrolcuSinif() { return FinansGridci }
	static get tsnKullanilirmi() { return true } static get ticMustKullanilirmi() { return true } static get mustSaha() { return 'must' }
	static get numYapi() { let {numTipKod: kod} = this; return kod ? new MQNumarator({ kod }) : null }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, { baslikAciklama: new PInstStr('aciklama') })
	}
	static rootFormBuilderDuzenle_ilk(e) {
		let {builders: baslikFormlar} = e.builders.baslikForm; baslikFormlar[0].yanYana(3);
		super.rootFormBuilderDuzenle_ilk(e)
	}
	static rootFormBuilderDuzenle_son(e) {
		let {builders: baslikFormlar} = e.builders.baslikForm; baslikFormlar[2].yanYana(2);
		super.rootFormBuilderDuzenle_son(e);
		let form = baslikFormlar[baslikFormlar[0].builders.length < 3 ? 0 : baslikFormlar[1].builders.length < 3 ? 1 : 2];
		form.addTextInput({ id: 'baslikAciklama', etiket: 'Açıklama' })
	}
	static secimlerDuzenleSon({ secimler: sec }) {
		super.secimlerDuzenleSon(...arguments);
		sec.secimTopluEkle({ aciklama: new SecimOzellik({ etiket: 'Açıklama' }) });
		sec.whereBlockEkle(e => {
			let {aliasVeNokta} = this, {where: wh, secimler: sec} = e;
			wh.ozellik(sec.aciklama, `${aliasVeNokta}aciklama`)
		})
	}
	static standartGorunumListesiDuzenle_son({ liste }) {
		super.standartGorunumListesiDuzenle_son(...arguments);
		liste.push('fisaciklama')
	}
	static orjBaslikListesiDuzenle_son({ liste }) {
		super.orjBaslikListesiDuzenle_son(...arguments); let {aliasVeNokta} = this;
		liste.push(new GridKolon({ belirtec: 'fisaciklama', text: 'Fiş Açıklama', genislikCh: 50, sql: 'fis.aciklama' }))
	}
}
class FinansDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'finanshar' } static get ticMustKullanilirmi() { return true }
}
class FinansGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	grid_cellClassName(colDef, rowIndex, belirtec, value, det) {
		let result = [belirtec], editableSet = det._editableSet || {};
		if (!editableSet[belirtec]) { result.push('grid-readOnly') }
		return result.join(' ')
	}
	grid_cellBeginEdit(colDef, rowIndex, belirtec, colType, value) {
		const det = colDef.gridPart.gridWidget.getrowdata(rowIndex);
		const editableSet = det._editableSet || {};
		return !!editableSet[belirtec]
	}
	async fis2Grid({ sender }) {
		let {fis} = sender, result = await super.fis2Grid(...arguments);
		if (!result) { return result }
		await fis?.cacheOlustur(...arguments);
		return true
	}
}
