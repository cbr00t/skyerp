class Bakiyeci extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return null } static get table() { return null }
	static get anahtarSahalar() { return [] } static get sumSahalar() { return [] }
	static get defaultBakiyeSqlDuzenleSelector() { return null }
	static get tip2Class() {
		let result = this._tip2Class;
		if (result == null) {
			result = {}; for (const cls of this.subClasses) { const {tipKod} = cls; if (tipKod) { result[tipKod] = cls } }
			this._tip2Class = result
		}
		return result
	}
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { borcmu: e.borcmu ?? e.borc, bakiyeSqlci: e.bakiyeSqlci, sqlDuzenleyici: e.sqlDuzenleyici ?? e.sqlDuzenleSelector ?? this.class.defaultBakiyeSqlDuzenleSelector })
	}
	async getBakiyeDict(e) {
		const result = {}; const {anahtarSahalar, sumSahalar} = this.class, {trnId} = e, borcmu = e.borcmu = getFuncValue.call(this, this.borcmu, e);
		let stm = await this.getBakiyeSql(e), recs = stm ? await app.sqlExecSelect({ trnId, query: stm }) : [];
		for (const rec of recs) {
			const anahStr = anahtarSahalar.map(key => rec[key]?.trimEnd()).join(delimWS), degerler = sumSahalar.map(key => rec[key]);
			let eskiDegerler = result[anahStr]; if (eskiDegerler) { for (let i = 0; i < degerler.length; i++) { eskiDegerler[i] += degerlerler[i] || 0 } } else { result[anahStr] = degerler }
		}
		return result
	}
	getBakiyeSql(e) {
		const {bakiyeSqlci} = this; if (bakiyeSqlci) { return getFuncValue.call(this, bakiyeSqlci, e) }
		const {fis} = e, {borcmu} = this; let {sqlDuzenleyici} = this;
		if (fis || sqlDuzenleyici) {
			if (e.fisSayac == null) { e.fisSayac = fis.sayac } e.borcmu = getFuncValue.call(this, borcmu, e);
			let receiver = this; if (typeof sqlDuzenleyici == 'string') { receiver = fis; sqlDuzenleyici = fis[sqlDuzenleyici] }; const sent = e.sent = new MQSent(), stm = e.stm = new MQStm({ sent });
			fis.bakiyeSqlOrtakDuzenle(e); if (sqlDuzenleyici) { getFuncValue.call(receiver, sqlDuzenleyici, e) }
			let sahaVarmi = false; for (const _sent of stm.getSentListe()) { if (_sent?.sahalar?.liste?.length) { sahaVarmi = true; sent.groupByOlustur(); break } }
			return sahaVarmi ? stm : null
		}
		return null
	}
	setBorcmu(value) { this.borcmu = value; return this }
	setBakiyeSqlci(value) { this.bakiyeSqlci = value; return this }
	setSqlDuzenleyici(value) { this.sqlDuzenleyici = value; return this }
}
class CariBakiyeci extends Bakiyeci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return 'CR' } static get table() { return 'carbakiye' }
	static get anahtarSahalar() { return [...super.anahtarSahalar, 'must', 'ozelisaret', 'althesapkod'] }
	static get sumSahalar() { return [...super.sumSahalar, 'bakiye', 'dvbakiye'] }
	static get defaultBakiyeSqlDuzenleSelector() { return 'cariBakiyeSqlEkDuzenle' }
}
class StokBakiyeci extends Bakiyeci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return 'ST' } static get table() { return 'sonstok' }
	static get anahtarSahalar() { return [...super.anahtarSahalar, 'stokkod', 'yerkod', 'ozelisaret', 'opno', ...HMRBilgi.rowAttrListe] }
	static get sumSahalar() { return [...super.sumSahalar, 'sonmiktar', 'sonmiktar2', 'gelecekmiktar', 'gidecekmiktar'] }
	static get defaultBakiyeSqlDuzenleSelector() { return 'stokBakiyeSqlEkDuzenle' }
}
class KasaBakiyeci extends Bakiyeci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return 'KS' } static get table() { return 'kasabakiye' }
	static get anahtarSahalar() { return [...super.anahtarSahalar, 'kasakod', 'ozelisaret'] }
	static get sumSahalar() { return [...super.sumSahalar, 'bakiye', 'dvbakiye'] }
	static get defaultBakiyeSqlDuzenleSelector() { return 'kasaBakiyeSqlEkDuzenle' }
}
class MevduatBakiyeci extends Bakiyeci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return 'MV' } static get table() { return 'mevduathesapbakiye' }
	static get anahtarSahalar() { return [...super.anahtarSahalar, 'banhesapkod', 'ozelisaret'] }
	static get sumSahalar() { return [...super.sumSahalar, 'bakiye', 'dvbakiye'] }
	static get defaultBakiyeSqlDuzenleSelector() { return 'mevduatBakiyeSqlEkDuzenle' }
}
