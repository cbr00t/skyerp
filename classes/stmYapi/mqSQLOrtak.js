class MQSQLOrtak extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { prefix: e.prefix, postfix: e.postfix, params: e.params || null });
	}
	static async topluYazVeyaDegistirIcinYap(e) {
		let {trnId, toplu} = e, eskiWhere = e.eskiWhere ?? e.eskiHVWhere, uniqueKeys = e.uniqueKeys ?? e.attrListe, table = e.table ?? e.tablo;
		let uniqueKeysSet = asSet(uniqueKeys) || {}, silinebilirmi = e.silinebilir ?? e.silinebilirmi ?? true;
		let {hvListe, eskiHVListe} = e; if (!hvListe) { return } if (!$.isArray(hvListe)) { hvListe = [hvListe] }
		let hv = hvListe[0], dateAttrSet = {}; if (hv) { for (let [key, value] of Object.entries(hv)) { if (isDate(value)) { dateAttrSet[key] = true } } }
		if (!(eskiHVListe || $.isEmptyObject(uniqueKeys) || $.isEmptyObject(eskiWhere))) {
			let keys = hv === undefined ? uniqueKeys : Object.keys(hv);
			let sent = new MQSent({ from: table, where: eskiWhere, sahalar: keys }), recs = await app.sqlExecSelect({ trnId, query: sent }); eskiHVListe = recs;
			if (eskiHVListe) { for (let hv of eskiHVListe) { for (let key in hv) { if (dateAttrSet[key]) { let value = hv[key]; if (value && typeof value == 'string') { hv[key] = value = asDate(value) } } } } }
		}
		if ($.isEmptyObject(eskiHVListe)) {		/* sadece yazma */
			if (uniqueKeysSet.kaysayac) { for (let hv of hvListe) { delete hv.kaysayac } }
			toplu.add(new MQInsert({ table, hvListe })); return { eklenecekler: hvListe, degisecekler: [], silinecekler: [] }
		}
		/* ekleme, değiştirme ve silme */
		let farkBilgi = hvListeFarkSonucu({ hv1Liste: hvListe, hv2Liste: eskiHVListe, uniqueKeys }) || {}, {eklenecekler, degisecekler, silinecekler} = farkBilgi;
		for (let keyHV of silinecekler) { toplu.add(new MQIliskiliDelete({ from: table, where: { birlestirDict: keyHV } })) }
		if (!$.isEmptyObject(eklenecekler)) { toplu.add(new MQInsert({ table, hvListe: eklenecekler })) }
		for (let {keyHV, farkHV} of degisecekler) { toplu.add(new MQIliskiliUpdate({ from: table, where: { birlestirDict: keyHV }, set: { birlestirDict: farkHV } })) }
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
		if (!text) { return text }
		let Prefix = 'SUM(', ind = text.toUpperCase().indexOf(Prefix);
		if (ind > -1) { text = text.substring(0, ind - 1) + text.substring(ind + Prefix.length - 1) }
		/*let lastInd = text.lastIndexOf(')'); if (lastInd < 0) { return text }
		text = text.substring(ind + Prefix.length, lastInd);*/
		return text
	}
	static asSumDeger(text) {
		if (!text || text == 'NULL' || text == `''` || text == '0') { return text }
		return `SUM(${this.sumOlmaksizin(text)})`
	}
	static asSUMDeger(text) { return this.asSumDeger(text) }
/*		let wrapSumIfNeeded = clause => {
			clause = clause?.trim() ?? ''
			if (!clause)
				return clause
			if (/^\s*sum\s*\(/i.test(clause))
				return clause
			// notlara uyum: clause "(" ile başlıyorsa "SUM" + clause, değilse SUM(clause)
			return /^\s*\(/.test(clause) ? `SUM${clause}` : `SUM(${clause})`
		}*/
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
	static resimClause_x(e) {
		e = e ?? {}; let ekCSS = e.ekCSS ?? e.cssEk;
		return (
			`<div style="height: 64px; margin-left: 27%; background-image: url(../../images/x.png); background-repeat: no-repeat; background-size: contain` +
			`${ekCSS ? `; ${ekCSS}` : ''}"/>`
		)
	}
	static resimClause_bos(e) {
		e = e ?? {}; let ekCSS = e.ekCSS ?? e.cssEk;
		return (
			`<div style="height: 32px; margin-left: 30%; background-repeat: no-repeat; background-size: contain` +
			`${ekCSS ? `; ${ekCSS}` : ''}"/>`
		)
	}
	getQueryYapi(e) {
		let query = this.toString(e)
		return { query, params: this.params }
	}
	toString(e = {}) {
		e.result = e.result || ''
		e.params = this.params || []
		let value = e.prefix ?? this.prefix
		if (value)
			e.result += `${value} `
		this.buildString(e)
		value = e.postfix ?? this.postfix
		if (value)
			e.result += ` ${value}`
		this.params = e.params
		return e.result
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
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get aliasliYapimi() { return true }
	get alias() {
		let {_alias: result} = this
		if (result == undefined)
			result = this._alias = this.class.getSahaDegeri(this.deger)
		return result
	}
	set alias(value) { this._alias = value }
	get aliasVeyaDeger() { return this.alias || this.deger }
	get degerAlias() { return this.class.getDegerAlias(this.deger) }
	get degerAliasListe() { return this.class.getDegerAliasListe(this.deger) }
	get farkliAliasVarmi() {
		let {deger, alias} = this
		return alias && deger != alias
	}
	
	constructor(e = {}) {
		super(e)
		this.deger = e.deger || ''
		this.alias = e.alias ?? undefined     /* alias === undefined için getSahaDegeri ile getterda belirlenir */
		this.aliaslimi = e.aliaslimi ?? (e.isCopy ? null : !!this.alias && this.alias != this.sql)
		let {alias, deger} = this
		if (alias == 'undefined')
			console.warn('MQAliasliYapi', 'alias hatası', { saha: this, alias, deger })
	}
	static newForFromText(e = {}) {
		/* örnek:
				- 'piffis'
				- 'piffis fis'
				- 'piffis AS fis'
				- '(SELECT ... ) AS tbl'
		*/
		if (!$.isPlainObject(e))
			e = { text: e }
		let text = (e.text || e.fromText || '').toString().trim()
		let sonBosInd = text.lastIndexOf(' ')
		delete e.text
		if (sonBosInd < 0) {
			e.deger = e.alias = text
			e.aliaslimi = false
		}
		else {																								/* bosluk var -- substring (from, end) => end index dahil değil */
			let asLiteralSet = { ' AS': true, ' as': true, ' As': true, ' aS': true };
			let tabloAdi = text.substring(0, sonBosInd).trim()
			if (tabloAdi[0] != '(' && asLiteralSet[tabloAdi.slice(-3)])
				tabloAdi = tabloAdi.slice(0, -3)
			e.deger = tabloAdi
			e.alias = text.substring(sonBosInd + 1).trim()
			e.aliaslimi = true
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
		text = text?.toString()?.trim() ?? ''
		let e = {}, sonBosInd = text.lastIndexOf(' '), sonNoktaInd = text.lastIndexOf('.')
		if (sonBosInd < 0) {																														/* bosluk yok */
			if (sonNoktaInd < 0) { e.deger = e.alias = text; e.aliaslimi = false }																	/* nokta yok */
			else { e.deger = text; e.alias = text.substring(sonNoktaInd + 1).trim(); e.aliaslimi = false }											/* nokta var */
		}
		else {																																		/* bosluk var -- substring (from, end) => end index dahil değil */
			let deger = e.deger = text.substring(0, sonBosInd).trim()
			let alias = e.alias = text.substring(sonBosInd + 1).trim()
			for (let ch of ['.', ',', '(', ')']) {
				if (alias.includes(ch)) {
					console.warn('newForSahaText', 'alias hatası', { text, deger, alias });
					break
				}
			}
			if (deger && deger.split('.').slice(-1)[0] == alias) { alias = e.alias = null; e.aliaslimi = false }
			else { e.aliaslimi = true }
		}
		return new this(e)
	}
	static newForIliskiText(text) {
		/* örnek:
				- 'har.fissayac'
				- '(case when fis.silindi='' then ... else .. end)'
		*/
		text = text?.toString()?.trim()
		if (!text)
			return new this()
		let noktaInd = text.lastIndexOf('.')
		let result = noktaInd < 0 || (text.includes('(') || text.includes(')'))
			? new this({ deger: text, alias: '', aliaslimi: false })
			: new this({ deger: text, alias: text.substring(0, noktaInd), aliaslimi: true })		/* to dahil degil substring'de  -  fis.islkod = ''  */
		{
			let {deger, alias} = result
			for (let ch of ['.', ',', '(', ')']) {
				if (alias?.includes(ch)) {
					console.warn('newForIliskiText', 'alias hatası', { text, deger, alias })
					break
				}
			}
		}
		return result
	}
	static gerekirseAliasli(clause, alias) {
		if (!clause)
			return clause
		// clause'ın son token'ı alias ise tekrar ekleme (case-insensitive)
		let m = clause.match(/([A-Za-z0-9_]+)\s*$/)
		if (m && m[1] && m[1].toLowerCase() == (alias ?? '').toLowerCase())
			return clause
		return `${clause} ${alias}`
	}
	static getDegerAliasListe(deger) {
		deger = deger?.toString().trim()
		let tokens = deger.split('.')
		if (tokens.length)
			tokens = tokens.slice(0, -1)    // sonuncu hariç
		// aslinda nokta oncesi full digit ise bu parca sonrasi ile birlesmeli
		let result = {}
		for (let i = 0; i < tokens.length; i++) {
			let token = tokens[i].split(' ').at(-1)?.trim()
			if (!token)
				continue
			/*let temp = ''
			for (let j = token.length - 1; j >= 0; j--) {
				let ch = token[j]
				if (sqlAliasmi(ch))
					temp = ch + temp
			}*/
			let alias = this.sondakiAlias(token)
			if (alias)
				result[alias] = true
		}
		return keys(result)
	}
	static getDegerAlias(deger) {
		return this.getDegerAliasListe(deger)?.[0] ?? []
	}
	/** '.' ile ayıştırılmış bilgilerde solda kalan alias araştırılır
		- 'coalesce(har' => 'har'
		- 'stk' => 'stk'
	*/
	static sondakiAlias(text) {
		let token = text?.split(' ')?.at(-1)
		if (!token)
			return null
		let ind = token.length - 1
		for (; ind >= 0; ind--) {
			let ch = token[ind]
			if (!sqlAliasmiCh(ch))
				break
		}
		let olasiAlias = token.slice(ind + 1).trim()
		if (!olasiAlias || isDigit(olasiAlias[0]))
			return null
		return olasiAlias
	}
	static getSahaDegeri(text) {
		// har.kasakod   		gibi ==> 'kasakod'
		// har.kasakod xkod		gibi ==> 'xkod'
		//		aksinde			 ==> null
		text = text?.toString()?.trim()
		if (!text)
			return null
		let tokens = text.split(' ')
		if (tokens.length > 1) {
			console.warn('getSahaDegeri', 'muhtemel hatalı alias belirlemesi', text)
			return tokens[tokens.length - 1]
		}
		let ilk = text[0]
		if (ilk >= '0' && ilk <= '9')
			return null
		if (ilk == '(' || ilk == `'` || text.toUpperCase() == 'NULL')
			return null
		tokens = text.split('.')
		return tokens.length == 2 ? tokens[tokens.length - 1] : null
	}
	buildString(e) {
		super.buildString(e); e.result += this.deger || '';
		if (this.aliaslimi) { e.result += ` ${this.alias}` }
	}
}
class MQIliskiYapisi extends MQSQLOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get varsaZincirler() {
		let {sol: { degerAliasListe: solListe }, sag: { degerAliasListe: sagListe }} = this
		let result = []
		for (let sol of solListe)
		for (let sag of sagListe)
			if (sol != sag)
				result.push([sol, sag])
		return result
	}
	constructor(e = {}) {
		super(e)
		if (typeof e == 'string')
			return $.extend(this, this.class.newForText(e))
		this.sol = e.sol || new MQAliasliYapi()
		this.sag = e.sag || new MQAliasliYapi()
		for (let key of ['sol', 'sag']) {
			let value = this[key]
			if (!value?.aliasliYapimi)
				this[key] = value = MQAliasliYapi.newForIliskiText(value)
		}
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
	buildString(e) {
		super.buildString(e)
		let {sol: { deger: sol }, sag: { deger: sag }} = this
		if (sol)
			e.result += sol.toString()
		if (sag) {
			if (sol)
				e.result += ' = '
			e.result += sag.toString()
		}
	}
}
