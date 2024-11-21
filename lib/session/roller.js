class RolYapi extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e);
		for (const key of ['kod2Inst', 'tip2InstListe', 'adimsal', 'iceriksel']) { this[key] = e[key] ?? {} }
	}
	static async oku(e) { e = e || {}; let inst = new this(), result = await inst.yukle(e); return result ? inst : null }
	async yukle(e) {
		e = e || {}; const result = await Rol.oku(e); if (result == null) { return false } $.extend(this, result);
		const {tip2Belirtec2DetListe} = result; if (result) { $.extend(this, tip2Belirtec2DetListe) }
		return true
	}
	menuAdimUygunmu(e) {
		const vioAdim = typeof e == 'object' ? e.vioAdim : e; if (vioAdim) {
			const {adimsal} = this, kisitlar = adimsal[vioAdim] || [], hepsiAdim = adimsal['@'], hepsiKisitlimi = hepsiAdim && !hepsiAdim.yasakmi;
			if (hepsiKisitlimi || kisitlar?.length) { return  kisitlar.find(kisit => kisit.yasakmi == hepsiKisitlimi) }
		}
		return true
	}
	icerikselUygunmu(e, _value) {
		const argIsObject = typeof e == 'object', belirtec = argIsObject ? e.belirtec : e, value = argIsObject ? e.value : _value; if (!argIsObject) { e = { belirtec, value } }
		const {iceriksel} = this.tip2InstListe; return $.isEmptyObject(iceriksel) ? true : !!iceriksel.find(kisit => kisit.uygunmu(e))
	}
	icerikselClauseDuzenle(e) {
		const {iceriksel} = this.tip2InstListe; if ($.isEmptyObject(iceriksel)) { return this }
		const {belirtec} = e; for (const kisit of iceriksel) { kisit.clauseDuzenle(e) }
		return this
	}
	ozelRolVarmi(e) { const kod = typeof e == 'object' ? e.kod : e; return !!this.ozelRolKodSet?.[kod] }
}

class Rol extends CKodVeAdi {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get encKeySet() {
		let result = this._encKeySet;
		if (result == null) { result = this._encKeySet = asSet(['userKod', 'tip', 'kod', 'belirtec', 'adim', 'islem', 'basi', 'sonu', 'deger']) }
		return result
	}
	static get tip2Sinif() {
		let result = this._tip2Sinif; if (result == null) {
			result = {}; const {subClasses} = this; for (const cls of subClasses) { const {araSeviyemi, tip} = cls; if (!araSeviyemi && tip) { result[tip] = cls } }
			this._tip2Sinif = result
		}
		return result
   }
	static get araSeviyemi() { return this == Rol } static get tip() { return null }
	static get sinifAdi() { return 'Rol' } static get table() { return 'puserrol' } static get tableAlias() { return 'urol' } static get kodSaha() { return 'rolkod' }
	static get tableAndAlias() { const {table, tableAlias} = this; return tableAlias ? table : `${table} ${tableAlias}` }
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { userKod: e.userKod ?? e.user, kod: e.kod, ozelmi: asBool(e.ozelmi ?? e.ozel), belirtec2Detaylar: e.belirtec2Detaylar ?? {} })
	}
	static getClass(e) { const tip = typeof e == 'object' ? e.tip : e; return this.tip2Sinif[tip] }
	static newFor(e) { if (typeof e != 'object') { e = { tip: e } } const cls = this.getClass(e); return cls ? new cls(e) : null }
	static async oku(e) {
		e = e || {}; let encUser = e.encUser ?? e.xuser ?? config.session?.encUser, user = e.user ?? config.session?.user;
		if (!encUser && user) { encUser = await app.xenc(user) } if (!encUser) { return null } $.extend(e, { encUser }); delete e.xuser;
		let recs = await this.loadServerData(e); if (!recs) { return null }
		const encKodSet = {}; for (const rec of recs) { const {kod} = rec; if (kod) { encKodSet[kod] = true } }
		await this.decryptRecs({ recs }); let tip2InstListe = {}, kod2Inst = {};
		for (const rec of recs) {
			let cls = this.getClass(rec), inst = cls ? new cls() : null; if (inst == null) { continue } inst.setValues({ rec });
			const {tip} = inst.class, tipSelector = tip == 'A' ? 'adimsal' : tip == 'I' ? 'iceriksel' : tip == 'O' ? 'ozel' : tip;
			const {kod} = inst; kod2Inst[kod] = inst; (tip2InstListe[tipSelector] = tip2InstListe[tipSelector] || []).push(inst)
		}
		const encKodListe = Object.keys(encKodSet); await this.detaylariYukle({ ...e, tip2InstListe, kod2Inst, encKodSet });
		const tip2Belirtec2DetListe = {}; for (const [tip, instListe] of Object.entries(tip2InstListe)) {
			const belirtec2DetListe = tip2Belirtec2DetListe[tip] = tip2Belirtec2DetListe[tip] || {};
			for (const inst of instListe) {
				const {belirtec2Detaylar} = inst; if ($.isEmptyObject(belirtec2Detaylar)) { continue }
				for (const [belirtec, detaylar] of Object.entries(belirtec2Detaylar)) {
					for (const det of detaylar) { if (det.bosDegilmi) { (belirtec2DetListe[belirtec] = belirtec2DetListe[belirtec] || []).push(det) } }
				}
			}
		}
		const ozelRolKodSet = asSet(tip2InstListe.ozel?.map(rol => rol.kod) ?? {});
		return { kod2Inst, tip2InstListe, tip2Belirtec2DetListe, ozelRolKodSet }
	}
	static loadServerData(e) { e = e || {}; let queryYapi = this.loadServerData_queryOlustur(e); return app.sqlExecSelect(queryYapi) }
	static loadServerData_queryOlustur(e) {
		const {tableAndAlias} = this; let uni = new MQUnionAll(), stm = new MQStm({ sent: uni });
		const _e = { ...e, stm, uni }; this.loadServerData_queryDuzenle(_e); stm = _e.stm; return { query: stm }
	}
	static loadServerData_queryDuzenle(e) {
		const {table} = this, {stm, uni, encUser} = e;
		let sent = new MQSent({ from: `${table} urol`, where: `urol.rolkod <> ''`, sahalar: ['urol.kullanicikod userKod', 'urol.tip', 'urol.rolkod kod', 'urol.ozelmi'] });
		let wh = sent.where; if (encUser) { wh.degerAta(encUser, 'urol.kullanicikod') }
		uni.add(sent); stm.orderBy.add('userKod', 'tip', 'rolkod', 'ozelmi')
	}
	static async detaylariYukle(e) {
		e = e || {}; let recs = await this.loadServerData_detaylar(e); if (!recs) { return false }
		await this.decryptRecs({ recs }); const {kod2Inst} = e;
		for (const rec of recs) {
			const {_tip, kod} = rec, inst = kod2Inst[kod]; if (inst == null) { continue }
			let cls = Rol_Detay.getClass(_tip), det = cls ? new cls() : null; if (det == null) { continue }
			det.setValues({ rec }); const belirtec2Detaylar = inst.belirtec2Detaylar = inst.belirtec2Detaylar || {};
			const {belirtec} = det; if (det.bosDegilmi) { (belirtec2Detaylar[belirtec] = belirtec2Detaylar[belirtec] || []).push(det) }
		}
		return true
	}
	static loadServerData_detaylar(e) { e = e || {}; let queryYapi = this.loadServerData_detaylar_queryOlustur(e); return app.sqlExecSelect(queryYapi) }
	static loadServerData_detaylar_queryOlustur(e) {
		const {tableAndAlias} = this; let uni = new MQUnionAll(), stm = new MQStm({ sent: uni });
		const _e = { ...e, stm, uni }; this.loadServerData_detaylar_queryDuzenle(_e); stm = _e.stm; return { query: stm }
	}
	static loadServerData_detaylar_queryDuzenle(e) {
		const {table} = this, {stm, uni, encKodListe, islemListe} = e, sentEkle = (detaySinif, duzenleyici) => {
			const {tip, table} = detaySinif; let sent = new MQSent({ from: `${table} det`, where: `det.kod <> ''`, sahalar: [`'${tip}' _tip`, 'det.kod'] });
			let wh = sent.where; if (encKodListe) { wh.degerAta(encKodListe, 'det.kod') } if (duzenleyici) { getFuncValue.call(this, duzenleyici, { ...e, sent, wh }) }
			uni.add(sent); return sent
		};
		sentEkle(Rol_AdimsalDetay, e => {
			const {sent, wh} = e; sent.sahalar.add('det.seq', 'det.adim belirtec', 'NULL basi', 'NULL sonu', 'NULL deger', 'det.islem', 'det.indis');
			if (islemListe?.length) { wh.inDizi(islemListe, 'det.islem') }
		});
		sentEkle(Rol_IcerikselDetay_BasiSonu, e => { const {sent, wh} = e; sent.sahalar.add('det.seq', 'det.belirtec', 'det.basi', 'det.sonu', 'NULL deger', 'NULL islem', 'NULL indis') });
		sentEkle(Rol_IcerikselDetay_BirKismi, e => { const {sent, wh} = e; sent.sahalar.add('10000 seq', 'det.belirtec', 'NULL basi', 'NULL sonu', 'det.bkod deger', 'NULL islem', 'NULL indis') });
		stm.orderBy.add('_tip', 'kod', 'seq')
	}
	setValues(e) { const {rec} = e; $.extend(this, { userKod: rec.userKod ?? rec.user, kod: rec.kod, ozelmi: asBool(rec.ozelmi) }) }
	uygunmu(e) {
		e = e || {}; const {belirtec} = e, {belirtec2Detaylar} = this; if (!belirtec2Detaylar) { return true }
		const detaylar = belirtec2Detaylar[belirtec]; return detaylar ? !!detaylar.find(det => det.uygunmu(e)) : true
   }
	static async decryptRecs(e) {
		e = e || {}; const {encKeySet} = this; if ($.isEmptyObject(encKeySet)) { return this }
		const recs = $.makeArray(e.recs); if (!recs?.length) { return this }
		const valueSet = {}; for (const rec of recs) {
			for (const key in rec) {
				const value = encKeySet[key] ? rec[key] : undefined;
				if (value != null) { valueSet[value] = true }
			}
		}
		if ($.isEmptyObject(valueSet)) { return this }
		let enc2Dec; try { enc2Dec = await app.xdec(Object.keys(valueSet)) } catch (ex) { console.error(ex) } if ($.isEmptyObject(enc2Dec)) { return this }
		for (const rec of recs) {
			for (const key in rec) {
				const decValue = encKeySet[key] ? enc2Dec[rec[key]] : undefined;
				if (decValue != null) { rec[key] = decValue }
			}
		}
		return this
	}
}
class Rol_Adimsal extends Rol {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'A' }
	static get adimsalmi() { return true } static get sinifAdi() { return `${super.sinifAdi}: Adımsal` }
}
class Rol_Iceriksel extends Rol {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'I' }
	static get icerikselmi() { return true } static get sinifAdi() { return `${super.sinifAdi}: İçeriksel` } static get detaySinif() { return Rol_IcerikselDetay }
	clauseDuzenle(e) {
		e = e || {}; const {belirtec} = e, {belirtec2Detaylar} = this, detaylar = belirtec2Detaylar[belirtec]; if (!detaylar?.length) { return this }
		let values = [], bs; for (const det of detaylar) {
			if (det.bosmu) { continue } const {basiSonumu, birKismimi} = det.class, {value} = det;
			if (basiSonumu) { if (value.bosDegilmi) { bs = value } } else if (birKismimi) { values.push(value) }
		}
		if (!(bs || values.length)) { return this } const {saha} = e, wh = e.where ?? e.sent?.where;
		if (bs) { wh.basiSonu(bs, saha) } else if (values?.length) { wh.inDizi(values, saha) }
		return this
	}
}
class Rol_Ozel extends Rol {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'O' }
	static get ozelmi() { return true } static get sinifAdi() { return `${super.sinifAdi}: Özel` }
}

class Rol_Detay extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get detaymi() { return true }
	static get tip2Sinif() {
		let result = this._tip2Sinif; if (result == null) {
			result = {}; const {subClasses} = this; for (const cls of subClasses) { const {araSeviyemi, tip} = cls; if (!araSeviyemi && tip) { result[tip] = cls } }
			this._tip2Sinif = result
		}
		return result
   }
	static get araSeviyemi() { return true } static get tableAlias() { return 'det' }
	static get tableAndAlias() { const {table, tableAlias} = this; return tableAlias ? table : `${table} ${tableAlias}` }
	get value() { return null } get bosmu() { return $.isEmptyObject(this.value) } get bosDegilmi() { return !this.bosmu }
	constructor(e) { e = e || {}; super(e); $.extend(this, { kod: e.kod, seq: e.seq, belirtec: e.belirtec ?? e.adim }) }
	static getClass(e) { const tip = typeof e == 'object' ? e.tip : e; return this.tip2Sinif[tip] }
	static newFor(e) { if (typeof e != 'object') { e = { tip: e } } const cls = this.getClass(e); return cls ? new cls(e) : null }
	setValues(e) { const {rec} = e; $.extend(this, { belirtec: rec.belirtec ?? rec.adim, kod: rec.kod, seq: e.seq }) }
	uygunmu(e) { const value = e?.value; return this.bosmu || !value ? true : value == this.value }
}
class Rol_AdimsalDetay extends Rol_Detay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'A' } static get araSeviyemi() { return false }
	static get adimsalmi() { return true } static get table() { return 'proladimdet' }
	get adim() { return this.belirtec } get yasakmi() { return this.islem == '*' } get value() { return this.adim }
	constructor(e) { e = e || {}; super(e); $.extend(this, { adim: e.adim, islem: e.islem, index: e.index ?? e.indis }) }
	setValues(e) { super.setValues(e); const {rec} = e; $.extend(this, { islem: rec.islem, index: rec.index ?? rec.indis }) }
}
class Rol_IcerikselDetay extends Rol_Detay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return true } static get icerikselmi() { return true }
}
class Rol_IcerikselDetay_BasiSonu extends Rol_IcerikselDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'BS' } static get araSeviyemi() { return false }
	static get basiSonumu() { return true } static get table() { return 'prolicerikdet' }
	get value() { const {basi, sonu} = this; return (basi || sonu) ? new CBasiSonu({ basi, sonu }) : null }
	constructor(e) { e = e || {}; super(e); $.extend(this, { basi: e.basi ?? e.bs?.basi, sonu: e.sonu ?? e.bs?.sonu }) }
	setValues(e) { super.setValues(e); const {rec} = e; $.extend(this, { basi: rec.basi, sonu: rec.sonu }) }
}
class Rol_IcerikselDetay_BirKismi extends Rol_IcerikselDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'LST' } static get araSeviyemi() { return false }
	static get birKismimi() { return true } static get table() { return 'prolicerikbdizi' } get value() { return this.deger }
	constructor(e) { e = e || {}; super(e); $.extend(this, { deger: e.deger }) }
	setValues(e) { super.setValues(e); const {rec} = e; $.extend(this, { deger: rec.deger }) }
}
