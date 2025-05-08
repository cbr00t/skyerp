class MQSQLOrtak extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { prefix: e.prefix, postfix: e.postfix, params: e.params || null });
	}
	static async topluYazVeyaDegistirIcinYap(e) {
		const {trnId, toplu} = e, eskiWhere = e.eskiWhere ?? e.eskiHVWhere, uniqueKeys = e.uniqueKeys ?? e.attrListe, table = e.table ?? e.tablo;
		const uniqueKeysSet = asSet(uniqueKeys) || {}, silinebilirmi = e.silinebilir ?? e.silinebilirmi ?? true;
		let {hvListe, eskiHVListe} = e; if (!hvListe) { return } if (!$.isArray(hvListe)) { hvListe = [hvListe] }
		const hv = hvListe[0], dateAttrSet = {}; if (hv) { for (const [key, value] of Object.entries(hv)) { if (isDate(value)) { dateAttrSet[key] = true } } }
		if (!(eskiHVListe || $.isEmptyObject(uniqueKeys) || $.isEmptyObject(eskiWhere))) {
			const keys = hv === undefined ? uniqueKeys : Object.keys(hv);
			const sent = new MQSent({ from: table, where: eskiWhere, sahalar: keys }), recs = await app.sqlExecSelect({ trnId, query: sent }); eskiHVListe = recs;
			if (eskiHVListe) { for (const hv of eskiHVListe) { for (const key in hv) { if (dateAttrSet[key]) { let value = hv[key]; if (value && typeof value == 'string') { hv[key] = value = asDate(value) } } } } }
		}
		if ($.isEmptyObject(eskiHVListe)) {		/* sadece yazma */
			if (uniqueKeysSet.kaysayac) { for (const hv of hvListe) { delete hv.kaysayac } }
			toplu.add(new MQInsert({ table, hvListe })); return { eklenecekler: hvListe, degisecekler: [], silinecekler: [] }
		}
		/* ekleme, değiştirme ve silme */
		const farkBilgi = hvListeFarkSonucu({ hv1Liste: hvListe, hv2Liste: eskiHVListe, uniqueKeys }) || {}, {eklenecekler, degisecekler, silinecekler} = farkBilgi;
		for (const keyHV of silinecekler) { toplu.add(new MQIliskiliDelete({ from: table, where: { birlestirDict: keyHV } })) }
		if (!$.isEmptyObject(eklenecekler)) { toplu.add(new MQInsert({ table, hvListe: eklenecekler })) }
		for (const {keyHV, farkHV} of degisecekler) { toplu.add(new MQIliskiliUpdate({ from: table, where: { birlestirDict: keyHV }, set: { birlestirDict: farkHV } })) }
		return farkBilgi
	}
	static sqlServerDegeri(e) {
		if (window?.app?.sqlitemi) { return this.sqliteDegeri(e) }
		if (e == null) { return 'NULL' }
		let value = $.isPlainObject(e) ? e.value : e, ozelDeger = value?.sqlServerDegeri;
		if (typeof value == 'object' && value?.constructor?.name == 'String') { value = value.toString() }
		if (!(ozelDeger === undefined || typeof ozelDeger == 'function')) { return ozelDeger }
		if (value == null) { return 'NULL' }
		if (isDate(value)) { return `CAST('${asReverseDateTimeString(value, 'T')}' AS DATETIME)` }
		if (isGUID(value)) { return `N'${value}'` }
		return this.sqlDegeri(e)
	}
	static sqliteDegeri(e) {
		if (e == null) { return 'NULL' }
		let value = $.isPlainObject(e) ? e.value : e, ozelDeger = value?.sqlServerDegeri; if (value == null) { return 'NULL' }
		if (typeof value == 'object' && value?.constructor?.name == 'String') { value = value.toString() }
		if (!(ozelDeger === undefined || typeof ozelDeger == 'function')) { return ozelDeger }
		if (isDate(value)) { return this.sqliteDegeri(asReverseDateString(value) || '') }
		/*if (isGUID(value)) { return `N'${value}'` }*/
		return this.sqlDegeri(e)
	}
	static sqlDegeri(e) {
		if (e == null) { return 'NULL' }
		let value = $.isPlainObject(e) ? e.value : e, ozelDeger = value?.sqlDegeri;
		if (typeof value == 'object' && value?.constructor?.name == 'String') { value = value.toString() }
		if (!(ozelDeger === undefined || typeof ozelDeger == 'function')) { return ozelDeger }
		if (value == null) { return 'NULL' }
		if (typeof value == 'string') { return `'${value.replaceAll(`'`, `''`)}'` }
		if (typeof value == 'number') { return value }
		return this.sqlParamValue(e)
	}
	static sqlParamValue(e) {
		if (e == null) { return null }
		let value = $.isPlainObject(e) ? e.value : e,  ozelDeger = value?.sqlDegeri;
		if (typeof value == 'object' && value?.constructor?.name == 'String') { value = value.toString() }
		if (!(ozelDeger === undefined || typeof ozelDeger == 'function')) { return ozelDeger }
		if (value == null) { return value }
		if (typeof value == 'boolean') { return value ? 1 : 0 }
		if (isDate(value)) { return this.sqlDegeri(asReverseDateTimeString(value) || '') }
		return value
	}
	static sqlDegeri_unescaped(e) {
		if (e == null) { return null }
		if (typeof e == 'string') {
			if (e?.toUpperCase() == 'NULL') { return null }
			if (e[0] == "'" && e.slice(-1) == "'") { return e.slice(1, -1) }
			if (e?.toUpperCase().includes('AS DATETIME')) { return asDate(e.split("'")[1]) }
			return asFloat(e)
		}
		return e
	}
	static sqlBosDegermi(text) {
		let sqlNull = 'NULL', sqlEmpty = `''`, sqlZero = '0';
		if (!text) { return true } text = text.toUpperCase();
		switch (text) { case sqlNull: case sqlEmpty: case sqlZero: return true }
		if (text.startsWith('CAST(NULL')) { return true }
		return false
	}
	static sqlDoluDegermi(text) { return !this.sqlBosDegermi(text) }
	static sumOlmaksizin(text) {
		let Prefix = 'SUM('; if (!text?.toUpperCase().includes(Prefix)) { return text }
		return text.fastReplaceSplit(Prefix, '(')
	}
	static asSumDeger(text) {
		if (!text || text == 'NULL' || text == `''` || text == '0') { return text }
		return `SUM(${sumOlmaksizin(text)})`
	}
	static asSUMDeger(text) { return this.asSumDeger(text) }
	static boolClause(e, _styled) {
		e = e || {}; let saha = typeof e == 'object' ? e.saha : e;
		let isStyled = typeof e == 'object' ? e.styled : _styled;
		return (
			`(case when ${saha} = '' then '` +
			( isStyled ? `<span class="readOnly">` : '' ) +
			`Hayır` +
			( isStyled ? `</span>` : '' ) +
			`' else '' end)`
	   )
	}
	static tersBoolClause(e, _styled) {
		e = e || {}; let saha = typeof e == 'object' ? e.saha : e;
		let isStyled = typeof e == 'object' ? e.styled : _styled;
		return (
			`(case when ${saha} <> '' then '` +
			( isStyled ? `<span class="forestgreen">` : '' ) +
			`Evet` +
			( isStyled ? `</span>` : '' ) +
			`' else '' end)`
	   )
	}
	static boolBitClause(e, _styled) {
		e = e || {}; let saha = typeof e == 'object' ? e.saha : e;
		let isStyled = typeof e == 'object' ? e.styled : _styled;
		return (
			`(case when ${saha} = 0 then '` +
			( isStyled ? `<span class="readOnly">` : '' ) +
			`Hayır` +
			( isStyled ? `</span>` : '' ) +
			`' else '' end)`
	   )
	}
	static tersBoolBitClause(e, _styled) {
		e = e || {}; let saha = typeof e == 'object' ? e.saha : e;
		let isStyled = typeof e == 'object' ? e.styled : _styled;
		return (
			`(case when ${saha} <> 0 then '` +
			( isStyled ? `<span class="forestgreen">` : '' ) +
			`Evet` +
			( isStyled ? `</span>` : '' ) +
			`' else '' end)`
	   )
	}
	static resimClause_ok(e) {
		e = e ?? {}; let ekCSS = e.ekCSS ?? e.cssEk;
		return (
			`<div style="height: 32px; margin-left: 30%; background-image: url(../../images/tamam_blue.png); background-repeat: no-repeat; background-size: contain` +
			`${ekCSS ? `; ${ekCSS}` : ''}"/>`
		)
	}
	getQueryYapi(e) { let query = this.toString(e); return { query, params: this.params } }
	toString(e) {
		e = e || {}; e.result = e.result || ''; e.params = this.params || [];
		let value = e.prefix || this.prefix; if (value) e.result += `${value} `
		this.buildString(e);
		value = e.postfix || this.postfix; if (value) e.result += ` ${value}`;
		this.params = e.params; return e.result;
	}
	buildString(e) { /* e.result += `` */ }
	asNot() { this.isNot = true; return this }
	/* CDB ext */
	cDB_execute({ ctx }) { }
}
class MQSQLConst extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get sqlDegeri() { return this.value } get sqlServerDegeri() { return this.sqlDegeri }
	constructor(e) { e = e || {}; super(e); this.value = e?.value ?? e }
	toString(e) { return this.sqlServerDegeri }
}
class MQAliasliYapi extends MQSQLOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } get aliasliYapimi() { return true }
	get alias() {
		let {_alias: result} = this;
		if (result == undefined) { result = this._alias = this.class.getSahaDegeri(this.deger) }
		return result
	}
	set alias(value) { this._alias = value }
	get aliasVeyaDeger() { return this.alias || this.deger } get degerAlias() { return this.class.getDegerAlias(this.deger) }
	get degerAliasListe() { return this.class.getDegerAliasListe(this.deger) }
	
	constructor(e) {
		e = e || {}; super(e); this.deger = e.deger || ''; this.alias = e.alias ?? undefined;    /* alias === undefined için getSahaDegeri ile getterda belirlenir */
		this.aliaslimi = e.aliaslimi ?? (e.isCopy ? null : !!this.alias && this.alias != this.sql)
	}
	static newForFromText(e) {
		/* örnek:
				- 'piffis'
				- 'piffis fis'
				- 'piffis AS fis'
				- '(SELECT ... ) AS tbl'
		*/
		e = e || {}; if (!$.isPlainObject(e)) { e = { text: e } }
		let text = (e.text || e.fromText || '').toString().trim(), sonBosInd = text.lastIndexOf(' '); delete e.text;
		if (sonBosInd < 0) { e.deger = e.alias = text; e.aliaslimi = false }								/* bosluk yok */
		else {																								/* bosluk var -- substring (from, end) => end index dahil değil */
			let asLiteralSet = { ' AS': true, ' as': true, ' As': true, ' aS': true };
			let tabloAdi = text.substring(0, sonBosInd).trim(); if (tabloAdi[0] != '(' && asLiteralSet[tabloAdi.slice(-3)]) { tabloAdi = tabloAdi.slice(0, -3) }
			e.deger = tabloAdi; e.alias = text.substring(sonBosInd + 1).trim(); e.aliaslimi = true
		}
		return new this(e)
	}
	static newForSahaText(text) {
		/* örnek:
				- 'stk.kod'
				- 'stk.kod stokKod'
				- 'kod'
				- '(case when ... end) tipText'
		*/
		text = text?.toString()?.trim() ?? ''; let sonBosInd = text.lastIndexOf(' '), sonNoktaInd = text.lastIndexOf('.'); let e = {};
		if (sonBosInd < 0) {																														/* bosluk yok */
			if (sonNoktaInd < 0) { e.deger = e.alias = text; e.aliaslimi = false }																	/* nokta yok */
			else { e.deger = text; e.alias = text.substring(sonNoktaInd + 1).trim(); e.aliaslimi = false }											/* nokta var */
		}
		else {																																		/* bosluk var -- substring (from, end) => end index dahil değil */
			let deger = e.deger = text.substring(0, sonBosInd).trim(), alias = e.alias = text.substring(sonBosInd + 1).trim();
			if (deger && deger.split('.').slice(-1)[0] == alias) { alias = e.alias = null; e.aliaslimi = false } else { e.aliaslimi = true }
		}
		return new this(e)
	}
	static newForIliskiText(text) {
		/* örnek:
				- 'har.fissayac'
				- '(case when fis.silindi='' then ... else .. end)'
		*/
		text = text?.toString()?.trim(); if (!text) { return new this() }
		let noktaInd = text.lastIndexOf('.'); if (noktaInd < 0 || text[0] == '(') { return new this({ deger: text }) }
		return new this({ deger: text, alias: text.substring(0, noktaInd), aliaslimi: true })		/* to dahil degil substring'de */
	}
	static getDegerAlias(deger) {
		// fis.rowid   		gibi ==> 'fis'
		//		aksinde			 ==> null
		deger = deger?.toString().trim(); if (!deger) { return null }
		if (deger[0] >= '0' && deger[0] <= '9') { return null }
		if (deger[0] == '(') { return null }
		let parts = deger.split('.'); if (parts.length != 2) { return null }
		return parts[0]
	}
	static getDegerAliasListe(deger) {
		let result = this.getDegerAlias(deger); if (result != null) { return [result] }
		result = {}; deger = deger?.toString().trim(); const parts = deger.split('.');
		// aslinda nokta oncesi full digit ise bu parca sonrasi ile birlesmeli
		for (let i = 0; i < parts.length; i++) {
			let temp = ''; let part = parts[i]; if (part != null) { part = part.trim() } if (!part) { continue }
			for (let j = part.length - 1; j >= 0; j--) {
				const ch = part[j]; if (!sqlAliasmi(ch)) { break }
				temp = ch + temp
			}
			if (hepsiUygunmu(temp, ch => isDigit(ch))) { continue }
			result[temp] = true
		}
		return Object.keys(result)
	}
	static getSahaDegeri(text) {
		// har.kasakod   		gibi ==> 'kasakod'
		// har.kasakod xkod		gibi ==> 'xkod'
		//		aksinde			 ==> null
		text = text?.toString().trim(); if (!text) { return null }
		let parts = text.split(' '); if (parts.length > 1) { return parts[parts.length - 1] }
		let ilk = text[0]; if (ilk >= '0' && ilk <= '9') { return null }
		if (ilk == '(' || ilk == `'` || text.toUpperCase() == 'NULL') { return null }
		parts = text.split('.'); return parts.length == 2 ? parts[parts.length - 1] : null;
	}
	buildString(e) {
		super.buildString(e); e.result += this.deger || '';
		if (this.aliaslimi) { e.result += ` ${this.alias}` }
	}
}
class MQIliskiYapisi extends MQSQLOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get varsaZincir() { const {sol, sag} = this; return sol.aliaslimi && sag.aliaslimi ? [sol.alias, sag.alias] : null }
	constructor(e) {
		e = e || {}; super(e); if (typeof e == 'string') { return $.extend(this, this.class.newForText(e)) }
		this.sol = e.sol || new MQAliasliYapi(); this.sag = e.sag || new MQAliasliYapi()
		for (const key of ['sol', 'sag']) { let value = this[key]; if (!value?.aliasliYapimi) { this[key] = value = MQAliasliYapi.newForIliskiText(value) } }
	}
	static newForText(text) {
		if (typeof text == 'object') { return $.isPlainObject(text) ? new this(text) : text }
		text = text?.toString()?.trim() ?? ''; let parantezSayilari, solText, ind = -1, esittirVarmi = false;
		do {
			parantezSayilari = { ac: 0, kapat: 0 }; ind = text.indexOf('=', ind + 1); if (ind != -1) { esittirVarmi = true }
			solText = text.substring(0, ind).trim(); for (const ch of solText) { if (ch == '(') { parantezSayilari.ac++ } else if (ch == ')') { parantezSayilari.kapat++ } }
		} while (ind > -1 && parantezSayilari.ac != parantezSayilari.kapat);
		/*if (esittirVarmi && ind < 0) { throw { isError: true, rc: 'queryBuilderError', errorText: 'Dengesiz eşitlik' } }*/
		return new this({ sol: solText, sag: text.substring(ind + 1) })
	}
	buildString(e) { super.buildString(e); e.result += `${this.sol.deger.toString()} = ${this.sag.deger.toString()}` }
}
