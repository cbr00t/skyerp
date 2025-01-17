class MQSatisRota extends MQDetayliVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kodKullanilirmi() { return true }
	static get kodListeTipi() { return 'SATISROTA' } static get detaySinif() { return MQSatisRotaDetay } static get gridKontrolcuSinif() { return MQSatisRotaGridci }
	static get sinifAdi() { return 'Satış Rotası' } static get table() { return 'rota' } static get tableAlias() { return 'rot' }
	static varsayilanKeyHostVarsDuzenle(e) { super.varsayilanKeyHostVarsDuzenle(e); let {hv} = e; $.extend(hv, { tipkod: 'T', sutalttip: '' }) }
	static get gunKodlari() {
		let result = this._gunKodlari;
		if (result == null) { result = this._gunKodlari = ['HER', 'PZT', 'SAL', 'CAR', 'PRS', 'CUM', 'CMT', 'PAZ'] }
		return result
	}
	static get gun2Index() {
		let result = this._gun2Index;
		if (result == null) {
			let {gunKodlari} = this; result = this._gun2Index = {};
			for (let i = 0; i < gunKodlari.length; i++) { result[gunKodlari[i]] = i }
		}
		return result
	}
}
class MQSatisRotaDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'rotadetay' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); let {pTanim} = e; $.extend(pTanim, { mustKod: new PInstStr('must'), mustUnvan: new PInstStr(), yore: new PInstStr() }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); let {liste} = e; liste.push(...[
			new GridKolon({ belirtec: 'must', text: 'Cari', genislikCh: 18 }),
			new GridKolon({ belirtec: 'mustunvan', text: 'Cari Ünvan', genislikCh: 40, sql: 'car.birunvan' }),
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 25, sql: 'car.yore' })
		])
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); let {tableAlias: alias} = this, {sent} = e; sent.har2CariBagla() }
	setValues(e) { super.setValues(e); let {rec} = e; $.extend(this, { mustUnvan: rec.mustunvan, yore: rec.yore }) }
}
class MQSatisRotaGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_ilk(e) {
		super.tabloKolonlariDuzenle_ilk(e); let {tabloKolonlari: liste} = e; liste.push(...[
			...MQCari.getGridKolonlar({ gridKolonGrupcu: 'getGridKolonGrup_yoreli', belirtec: 'must', adiGenislikCh: 100 })
		])
	}
	geriYuklemeIcinUygunmu(e) {
		let {detay: det, index, belirtec2Kolon, temps, mesajsiz} = e, kodSet = temps.kodSet = temps.kodSet ?? {}, {mustKod: kod} = det;
		if (kodSet[kod]) {
			let belirtec = 'mustKod', satirNo = index + 1, kolonText = belirtec2Kolon[belirtec].text;
			return mesajsiz ? false : { isError: true, errorText: `<b>${satirNo}.</b> satırdaki <b>${kolonText}</b> bilgisi tekrar ediyor`, returnAction: e => e.focusTo({ rowIndex: index, belirtec }) }
		}
		kodSet[kod] = true; return true
	}
}
