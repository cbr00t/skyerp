class MQClause extends MQSQLOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get addDogrudanKullanilirmi() { return false } static get baglacsizmi() { return false } static get baglac() { return ', ' } static get onEk() { return '' }
	constructor(e) {
		e = e || {}; super(e);
		if ($.isArray(e)) { e = { liste: e } } else if (typeof e != 'object') { e = { liste: [e] } }
		this.parantezlimi = asBool(e.parantezlimi || e.parantezli);
		const liste = this.liste = [], _liste = e.liste;
		if (!$.isEmptyObject(_liste)) { const {addDogrudanKullanilirmi} = this.class; for (const item of _liste) { if (addDogrudanKullanilirmi) { this.addDogrudan(item) } else { this.add(item) } } }
		let value = e.birlestir; if (value) { this.birlestir(value) }
	}
	add(...sahalar) {
		const {liste} = this; for (const saha of sahalar) {
			if (saha == null) { continue } if ($.isArray(saha)) { this.add(...saha); continue }
			const value = this.donusmusDeger(saha); if (this.addIcinUygunmu(value)) { liste.push(value) }
		}
		return this
	}
	addDogrudan(...sahalar) {
		const {liste} = this; for (const saha of sahalar) {
			if (saha == null) { continue } if ($.isArray(saha)) { this.add(...saha); continue }
			const value = this.donusmusDeger(saha); liste.push(value)
		}
		return this
	}
	addAll(coll) {
		if (coll && coll.liste) { coll = coll.liste }
		if ($.isPlainObject(coll) && !$.isArray(coll)) { coll = Object.keys(coll) }
		if (!$.isArray(coll)) { coll = arguments }
		this.add(...coll); return this
	}
	birlestir(anMQClause) {
		const liste = typeof anMQClause == 'string' ? [anMQClause] : anMQClause?.liste;
		if (!$.isEmptyObject(liste)) { this.addAll(liste) }
		const _params = anMQClause?.params; if (!$.isEmptyObject(_params)) { const params = this.params = this.params || []; params.push(..._params) }
		return this
	}
	donusmusDeger(item) {
		/* return (item == null || item == '') ? null : item ^-- inDizi'deki '' değer için sorun çıktığı için kaldırıldı */
		return item ?? null
	}
	addIcinUygunmu(item) { return !(item == null || item == '' || (typeof item == 'string' && item.trimEnd() == '')) }
	buildString(e) {
		super.buildString(e);
		const clause = this.toString_baslangicsiz(e);
		if (clause) { const onEk = this.class.onEk; e.result += `${onEk ? onEk + ' ' : ''}${clause}`; }
		return this
	}
	getQueryYapi_baslangicsiz(e) { e = e || {}; const query = this.toString_baslangicsiz(e), {params} = this; return { query, params } }
	toString_baslangicsiz(e) { e = $.extend({}, e, { result: '' }); this.buildString_baslangicsiz(e); return e.result }
	buildString_baslangicsiz(e) {
		const doluListe = this.liste.filter(item => typeof item != 'string' || item.trim()), Baglac = this.class.baglac, {parantezlimi} = this;
		if (!$.isEmptyObject(doluListe)) {
			if (doluListe.length && parantezlimi) { e.result += '(' }
			for (let ind in doluListe) {
				ind = asInteger(ind); const item = doluListe[ind];
				let text = item.toString(); if (ind && item && !item.class?.baglacsizmi) { e.result += Baglac } e.result += text;
				let _params = item && item.params ? item.params : null; if (_params) { e.params?.push(..._params) }
			}
			if (doluListe.length && parantezlimi) { e.result += ')' }
		}
		let {params: _params} = this; if (_params) {
			_params = _params.filter(x => !!x); const resultParams = e.params || [], keySet = asSet(resultParams.filter(x => !!x).map(_param => _param.name || _param.key));
			for (const i in _params) {
				const _param = _params[i], name = _param.name || _param.key;
				if (!keySet[name]) { keySet[name] = true; resultParams.push(_param) }
			}
		}
		return this
	}
	parantezli() { this.parantezlimi = true; return this } parantezsiz() { this.parantezlimi = false; return this }
}
class MQToplu extends MQClause {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get toplumu() { return true } get toplumu() { return this.class.toplumu }
	static get baglac() { return `${MQCogul.isOfflineMode ? ';' : ''}${CrLf}${CrLf}` }
	constructor(e) { e = e || {}; super(e); this.trnFlag = asBool(e.trnFlag) }
	buildString_baslangicsiz(e) {
		const {trnFlag} = this; if (trnFlag) {
			// e.result += 'DECLARE @tranCount INT = @@TRANCOUNT' + CrLf;
			e.result += `DECLARE @trnUsed BIT = (case @@TRANCOUNT when 0 then 1 else 0 end)`
			if (typeof trnFlag == 'string' && trnFlag.toLowerCase() == 'deftrn') {
				e.result += 'IF @@TRANCOUNT > 0 BEGIN' + CrLf;
				e.result += 'ROLLBACK' + CrLf;
				e.result += `RAISERROR(N'Açık bir transaction var, işleme devam edilemez', 11, 0)` + CrLf;
				e.result += 'RETURN' + CrLf;
				e.result += 'END' + CrLf;
			}
			e.result += 'IF @@TRANCOUNT = 0 BEGIN TRAN' + CrLf;
			e.result += 'BEGIN TRY' + CrLf
		}
		super.buildString_baslangicsiz(e);
		if (trnFlag) {
			e.result += CrLf + CrLf + 'IF (@trnUsed <> 0 AND @@TRANCOUNT = 1) COMMIT' + CrLf + `END TRY` + CrLf + CrLf;
			e.result += 'BEGIN CATCH' + CrLf + 'IF (@trnUsed <> 0 AND @@TRANCOUNT > 0) ROLLBACK;' + CrLf + 'THROW' + CrLf + `END CATCH`
		}
		return this
	}
	withTrn() { this.trnFlag = true; return this }
	withDefTrn() { this.trnFlag = 'deftrn'; return this }
	withoutTrn() { this.trnFlag = false; return this }
	noTrn() { this.withoutTrn(); return this }
}
class MQSahalar extends MQClause {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	donusmusDeger(item) {
		item = super.donusmusDeger(item); if (item == null) { return item }
		return typeof item == 'object' ? item : MQAliasliYapi.newForSahaText(item)
	}
	addIcinUygunmu(item) {
		if (!super.addIcinUygunmu(item)) { return false }
		const {liste} = this; if (liste.find(x => ((x?.aliasVeyaDeger && item?.aliasVeyaDeger) && x.aliasVeyaDeger == item.aliasVeyaDeger))) { return false }
		return true
	}
	addWithAlias(alias, ...sahalar) { return this.addAllWithAlias({ alias: alias, sahalar: sahalar }) }
	addAllWithAlias(e) { const {alias, sahalar} = e;
		if (!$.isEmptyObject(sahalar)) { for (const saha of sahalar) this.add(`${alias}.${saha}`) }
		return this
	}
}
class MQZincirler extends MQClause {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	optimize(e) {
		/* liste: [ ["fis", "har"], ["har", "stk"], ["fis", "car"], ["car", "bol"] ] */
		const {liste} = this;
		for (let i = liste.length - 1; i > 0; i--) {			// (i > 0) ==> ilk elemana bakılmaz
			const altDizi = liste[i]; let ilk = altDizi[0];
			for (let j = i - 1; j >= 0; j--) { let ustDizi = liste[j]; if (ustDizi[ustDizi.length - 1] == ilk) { ustDizi.push(...(altDizi.slice(1))); liste.splice(i, 1); break } }
		}
		return this
	}
}
class MQGroupByClause extends MQClause {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get onEk() { return `	GROUP BY	` }
}
class MQFromClause extends MQClause {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get onEk() { return `	FROM	` }
	donusmusDeger(item) {
		item = super.donusmusDeger(item); if (item == null) return item
		return typeof item == 'object' ? item : MQTable.newForFromText(item)
	}
	addIcinUygunmu(aMQTable) {
		if (!super.addIcinUygunmu(aMQTable)) return false
		const varmi = !!this.liste.find(item => item.aliasVeyaDeger == aMQTable.aliasVeyaDeger); return !varmi
	}
	aliasIcinTable(alias) { return this.liste.find(anMQTable => anMQTable.aliasVarmi(alias)) }
	iliskiler2Where(e) {
		const birlesikWhere = e.where;
		for (const anMQTable of this.liste) { for (const anMQIliskiYapisi of anMQTable.iliskiler) { birlesikWhere.add(anMQIliskiYapisi.toString()) } }
		return this
	}
	/* kullanılmayan tablolar içerdiği ilişkiler ile silinecek. table içindeki (left, inner) için de aynı kural geçerli */
	disindakiTablolariSil(e) {
		const disindaSet = e.disindaSet ?? {}, {liste} = this;
		for (let i = liste.length - 1; i >= 0; i--) {
			const anMQTable = liste[i], {alias} = anMQTable;
			if (disindaSet[alias]) { anMQTable.disindakiXTablolariSil(e) } else { liste.splice(i, 1) } }
		return this
	}
}
class MQSubWhereClause extends MQClause {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get baglac() { return `${CrLf}	  AND	 ` }
	constructor(e) {
		e = e || {}; const initBlock = e => {
			if (!$.isPlainObject(e)) { this.add(e); return true }
			let value = e.inDizi; if (value !== undefined) { this.inDizi({ liste: value, saha: e.saha, not: e.not }); return true }
			value = e.notInDizi; if (value !== undefined) { this.notInDizi({ liste: value, saha: e.saha }); return true; }
			value = e.degerAta; if (value !== undefined) { this.degerAta({ deger: value, saha: e.saha, not: e.not }); return true }
			value = e.notDegerAta; if (value !== undefined) { this.notDegerAta({ deger: value, saha: e.saha }); return true }
			value = e.like; if (value !== undefined) { this.like({ deger: value, saha: e.saha, not: e.not, aynenAlinsin: e.aynenAlinsin }); return true }
			value = e.notLike; if (value !== undefined) { this.notLike({ deger: value, saha: e.saha, aynenAlinsin: e.aynenAlinsin }); return true }
			value = e.operand; if (value !== undefined) { this.operand({ operand: value, saha: e.saha, deger: e.deger, not: e.not }) }
			value = e.notOperand; if (value !== undefined) { this.notOperand({ deger: value, saha: e.saha, operand: e.operand }) }
			value = e.basiSonu; if (value !== undefined) { this.basiSonu({ deger: value, saha: e.saha, not: e.not }); return true }
			value = e.notBasiSonu; if (value !== undefined) { this.notBasiSonu({ deger: value, saha: e.saha }); return true }
			value = e.ozellik; if (value !== undefined) { this.ozellik({ deger: value, saha: e.saha, not: e.not }); return true }
			value = e.notOzellik; if (value !== undefined) { this.notOzellik({ deger: value, saha: e.saha }); return true }
			value = e.tekSecim; if (value !== undefined) { this.tekSecim({ deger: value, saha: e.saha, not: e.not }); return true }
			value = e.notTekSecim; if (value !== undefined) { this.notTekSecim({ deger: value, saha: e.saha }); return true }
			value = e.birKismi; if (value !== undefined) { this.birKismi({ deger: value, saha: e.saha, not: e.not }); return true }
			value = e.notTekSecim; if (value !== undefined) { this.notBirKismi({ deger: value, saha: e.saha }); return true }
			value = e.birlestirDict; if (value !== undefined) { this.birlestirDict({ alias: e.alias, dict: value, not: e.not }); return true }
			value = e.birlestir; if (value !== undefined) { this.birlestir(value); return true }
			value = e.ticariGC; if (value !== undefined) { this.ticariGC({ alimmi: value, fisAlias: e.fisAlias ?? e.alias, not: e.not }); return true }
			value = e.notTicariGC; if (value !== undefined) { this.notTicariGC({ alimmi: value, fisAlias: e.fisAlias ?? e.alias }); return true }
			value = e.ticariTSN; if (value !== undefined) { this.ticariTSN({ deger: value, fisAlias: e.fisAlias ?? e.alias, noSahaAdi: e.noSahaAdi ?? e.noSaha, not: e.not }); return true }
			value = e.notTicariTSN; if (value !== undefined) { this.notTicariTSN({ deger: value, fisAlias: e.fisAlias ?? e.alias, noSahaAdi: e.noSahaAdi ?? e.noSaha }); return true }
			return false
		};
		super({ liste: e.liste, params: e.params, parantezlimi: e.parantezlimi, parantezli: e.parantezli });
		if ($.isArray(e)) { if (!$.isEmptyObject(e)) { for (const item of e) { initBlock(item) } } } else { initBlock(e) }
	}
	addIcinUygunmu(item) {
		if (item == {}.toString()) { debugger } return super.addIcinUygunmu(item) && !this.liste.includes(item)
	}
	birlestirDict(e) {
		e = e || {}; const dict = e.dict || e.birlestirDict || e.liste || e,  aliasVeNokta = e.alias ? `${e.alias}.` : ``, {not} = e;
		const isSetClause = e.isSetClause ?? this.class.isSetClause, isValuesClause = e.isValuesClause ?? this.class.isValuesClause;
		if (!$.isEmptyObject(dict)) {
			let and = new MQAndClause(); for (const key in dict) {
				const value = dict[key]; and.degerAta({ isSetClause, not, deger: value, saha: `${aliasVeNokta}${key}` }) }
			const isSetOrValues = isSetClause || isValuesClause; this.add(isSetOrValues ? and.liste : and)
		}
		return this
	}
	notBirlestirDict(e) {
		e = e || {}; const dict = e.dict || e.birlestirDict || e.liste; if (!dict) e = { dict: e }
		e.not = true; return this.birlestirDict(e)
	}
	degerAta(e, _saha) {
		e = e?.saha ? e : { deger: e, saha: _saha }; const isSetClause = e.isSetClause ?? this.class.isSetClause; 
		const isNot = typeof e == 'object' && asBool(e.not), {saha, deger} = e;
		/*if (deger != null) { const operand = '='; return this.operand({ saha, operand, deger, not: isNot }) }*/
		const clause = deger == null && !isSetClause ? `${saha} IS${isNot ? ' NOT' : ''} NULL` : `${saha} ${isNot ? '<>' : '='} ${MQSQLOrtak.sqlServerDegeri(deger)}`
		return this.addDogrudan(clause)
	}
	notDegerAta(e, _saha) { e = e.saha ? $.extend({}, e) : { deger: e, saha: _saha }; e.not = true; return this.degerAta(e) }
	inDizi(e, _saha) {
		e = e.saha ? e : { liste: e, saha: _saha }; let liste = e.liste = e.liste || e.deger || []; delete e.deger;
		let inClause = liste.liste ? liste : new MQInClause({ liste: liste, saha: e.saha });
		inClause.isNot = typeof e == 'object' && asBool(e.not); return this.addDogrudan(inClause)
	}
	notInDizi(e, _saha) { e = e.saha ? $.extend({}, e) : { liste: e, saha: _saha }; e.not = true; return this.inDizi(e) }
	like(e, _saha, _aynenAlinsinmi, _yazildigiGibimi) {
		e = e.saha ? e : { deger: e, saha: _saha }; let isNot = typeof e == 'object' && asBool(e.not);		
		const aynenAlinsinmi = e.aynenAlinsinmi ?? e.aynenAlinsin ?? _aynenAlinsinmi,  yazildigiGibimi = e.yazildigiGibimi ?? e.yazildigiGibi ?? _yazildigiGibimi;
		let deger = (e.deger || '').toString().replaceAll('*', '%');
		if (!aynenAlinsinmi) { if (deger && deger.slice(-1) != '%') { deger += '%' } if (deger[0] != '%') { deger = '%' + deger } }
		if (yazildigiGibimi) { return this.addDogrudan(`${e.saha} ${isNot ? 'NOT ' : ''}LIKE '${deger}'`) }
		const degerENUpper = deger.toUpperCase(), degerTRUpper = deger.toLocaleUpperCase(culture);
		return this.addDogrudan(new MQOrClause([
			`UPPER(${e.saha}) ${isNot ? 'NOT ' : ''}LIKE '${degerENUpper}'`,
			`UPPER(${e.saha}) ${isNot ? 'NOT ' : ''}LIKE '${degerTRUpper}'`
		]))
	}
	notLike(e, _saha, _yazildigiGibimi) { e = e.saha ? $.extend({}, e) : { deger: e, saha: _saha }; e.not = true; return this.like(e) }
	operand(e, _operand, _deger) {
		e = e.saha ? e : { saha: e, operand: _operand, deger: _deger }; const {saha, operand, deger} = e;
		let isNot = typeof e == 'object' && asBool(e.not); if (!operand) {
			const result = MQOperandClause.newForText(e); if (isNot) { result.asNot() }
			this.addDogrudan(result); return this
		}
		const {saha: sol} = e, sag = MQSQLOrtak.sqlServerDegeri(deger);
		this.addDogrudan(new MQOperandClause({ sol, operand, sag, not: isNot })); return this
	}
	notOperand() { return this.operand(...arguments).asNot() }
	basiSonu(e, _saha) {
		e = e?.saha ? e : { deger: e, saha: _saha };
		const isNot = typeof e == 'object' && asBool(e.not), {saha} = e, bs = e.deger,  birKismimi = bs?.birKismimi;
		if (birKismimi) { this.birKismi({ liste: bs.kodListe, saha, not: isNot }) }
		const sub = new MQAndClause();
		if (bs) {
			if (bs.basi) { sub.addDogrudan(`${saha} >= ${MQSQLOrtak.sqlServerDegeri(bs.basi)}`) }
			if (bs.sonu) { sub.addDogrudan(`${saha} <= ${MQSQLOrtak.sqlServerDegeri(bs.sonu)}`) }
		}
		let text = sub.toString_baslangicsiz(); if (isNot) { text = text ? `NOT(${text})` : '1 = 2' }
		if (text) { this.addDogrudan(text) } return this
	}
	notBasiSonu(e, _saha) { e = e.saha ? $.extend({}, e) : { deger: e, saha: _saha }; e.not = true; return this.basiSonu(e) }
	ozellik(e, _saha) {
		e = e?.saha ? e : { deger: e, saha: _saha };
		const isNot = typeof e == 'object' && asBool(e.not); let deger = e.deger || '';
		const {disindakilermi, yazildigiGibimi} = deger || {};
		if (disindakilermi) { isNot = true }
		if (deger?.value !== undefined) deger = deger.value
		if (deger?.ozellik !== undefined) deger = deger.ozellik
		const {saha} = e, or = new MQOrClause(), parts = deger ? deger.split(' ') : null;
		if (parts) { for (let part of parts) { part = part.trim(); if (part) { or.like({ deger: part, saha, yazildigiGibimi }) } } }
		let text = or.toString(); if (isNot) { text = text ? `NOT(${text})` : '1 = 2' }
		if (text) { this.addDogrudan(text) }
		return this
	}
	notOzellik(e, _saha) { e = e.saha ? $.extend({}, e) : { deger: e, saha: _saha }; e.not = true; return this.ozellik(e) }
	tekSecim(e, _saha) {
		e = e?.saha? e : { deger: e, saha: _saha }; let isNot = typeof e == 'object' && asBool(e.not);
		let deger = coalesce(e.deger, e.value); if (deger?.value !== undefined) { deger = deger.value }
		if (deger?.tekSecim !== undefined) { deger = deger.tekSecim } if (deger) { deger = deger.char ?? deger }
		if (deger != null && !(deger instanceof TekSecim)) { return this.degerAta({ saha: e.saha, deger, not: isNot }) }
		return this
	}
	notTekSecim(e, _saha) { e = e.saha ? $.extend({}, e) : { deger: e, saha: _saha }; e.not = true; return this.tekSecim(e) }
	birKismi(e, _saha) {
		e = e?.saha? e : { liste: e, saha: _saha }; const isNot = typeof e == 'object' && asBool(e.not);
		let liste = e.liste ?? e.deger ?? e.value; delete e.deger; if (liste?.value !== undefined) { liste = liste.value }
		if (liste && typeof liste != 'object') { liste = $.makeArray(liste) }
		if (liste && !$.isArray(liste)) { liste = Object.values(liste) }
		if (liste) { liste = liste.map(x => x?.char === undefined ? x : x.char).filter(x => !(x && x instanceof TekSecim)) }
		if (liste?.length) { return this.inDizi({ saha: e.saha, liste, not: isNot }) }
		return this
	}
	notBirKismi(e, _saha) { e = e.saha ? $.extend({}, e) : { liste: e, saha: _saha }; e.not = true; return this.birKismi(e) }
	ticariGC(e, _fisAlias, _notFlag) {
		e = e || {};
		const alimmi = (e.alimmi ?? e.alim ?? e.girismi ?? e.giris ?? (e == true)) ?? false;
		const fisAlias = ( e.fisAlias ?? e.alias ?? _fisAlias ) ?? 'fis';
		const notFlag = e.not ?? _notFlag, aliasVeNokta = fisAlias ? `${fisAlias}.` : '';
		this.add(new MQOrClause({
			not: notFlag,
			liste: [
				new MQAndClause([
					`${aliasVeNokta}almsat = '${alimmi ? 'A' : 'T'}'`,
					`${aliasVeNokta}iade = ''`,
				]),
				new MQAndClause([
					`${aliasVeNokta}almsat = '${alimmi ? 'T' : 'A'}'`,
					`${aliasVeNokta}iade = 'I'`,
				])
			]
		}))
		return this
	}
	notTicariGC(e, _fisAlias) {
		e = e || {}; const args = ( typeof e == 'object' ? [$.extend({}, e, { not: true })] : [e, _fisAlias, true] );
		return this.ticariGC(...args)
	}
	ticariTSN(e, _fisAlias, _noSahaAdi, _notFlag) {
		e = e || {};
		const tsn = ( e.deger ?? e.tsn ?? e ), fisAlias = ( e.fisAlias ?? e.alias ?? _fisAlias ) ?? 'fis';
		const noSahaAdi = ( e.noSahaAdi ?? e.noSaha ?? _noSahaAdi ) || 'no', notFlag = e.not ?? _notFlag, aliasVeNokta = fisAlias ? `${fisAlias}.` : '';
		if (tsn.seri != null) this.degerAta(tsn.seri, `${aliasVeNokta}seri`)
		if (tsn.noYil != null) this.degerAta(tsn.noYil, `${aliasVeNokta}noyil`)
		this.degerAta(tsn.no, `${aliasVeNokta}${noSahaAdi}`); return this
	}
	notTicariTSN(e, _fisAlias, _noSahaAdi) {
		e = e || {}; const args = typeof e == 'object' ? [$.extend({}, e, { not: true })] : [e, _fisAlias, _noSahaAdi, true];
		return this.ticariTSN(...args)
	}
	fromGridWSArgs(e) {
		e = e || {}; const {alias} = e; let {filters} = e;
		if (!filters) {
			const {filterGroups} = e;
			if (filterGroups) { filters = e.filters = []; for (const filterGroup of filterGroups) { const _filters = filterGroup.filters; if (_filters?.length) { filters.push(..._filters) } } }
		}
		if (filters) { for (const filter of filters) { this.fromGridFilter({ filter, alias }) } }
		return this
	}
	fromGridFilter(e) {
		e = e || {}; let filter = e.filter || e; if ($.isEmptyObject(filter)) { return this }
		let saha = filter.field; if (!saha) { return this }
		const _e = { saha, filter }, alias = $.isFunction(e.alias) ? e.alias.call(this, _e) : e.alias;
		if (_e.saha) { saha = _e.saha }
		if (alias) { saha = `${alias}.${saha}` }
		const filterType = (filter.type || '').toLowerCase();
		// const operator = filter.operator.toUpperCase();
		const condition = (filter.comparisonoperator || filter.condition || '').toUpperCase(), isBooleanFilter = filterType == 'booleanfilter';
		// const isNumericFilter = filterType == 'numericfilter';
		const isStringFilter = !filterType || filterType == 'stringfilter';
		const addValueClause = e => {
			let {value} = e; const not = true;
			switch (condition) {
				case 'EMPTY': case 'NOTEMPTY': case 'NOT_EMPTY':
					value = isStringFilter ? '' : 0; break
				case 'IN': case 'NOTIN': case 'NOT_IN':
					const InSeparator = '|';
					value = $.isArray(value) ? value.join(InSeparator) : value; value = value.split(InSeparator).filter(x => !!x);
					if (isStringFilter) { value = value.map(x => MQSQLOrtak.sqlServerDegeri(x)) }
					break
				case 'EQUAL': case 'EQUALS': case 'NOTEQUAL': case 'NOT_EQUAL': case 'NOTEQUALS': case 'NOT_EQUALS':
				case 'LESS_THAN_OR_EQUAL': case 'LESS_THAN': case 'GREATER_THAN_OR_EQUAL': case 'GREATER_THAN':
					value = MQSQLOrtak.sqlServerDegeri(value); break
			}
			switch (condition) {
				case 'CONTAIN': case 'CONTAINS':
					this.add(new MQOrClause([
						{ like: `%${value}%`, saha },
						(typeof value == 'string' ? { like: `%${value.toUpperCase()}%`, saha: `UPPER(${saha})` } : null)
					].filter(x => !!x)))
					break
				case 'NOTCONTAIN': case 'NOT_CONTAIN': case 'NOT_CONTAINS': case 'DOES_NOT_CONTAIN':
					this.add(new MQOrClause([
						{ not, like: `%${value}%`, saha },
						(typeof value == 'string' ? { not, like: `%${value.toUpperCase()}%`, saha: `UPPER(${saha})` } : null)
					].filter(x => !!x)))
					break
				case 'EQUAL': case 'EQUALS': case 'EMPTY': this.add(`${saha} ${isBooleanFilter ? '<>' : '='} ${value}`); break
				case 'NOT_EQUAL': case 'NOT_EQUALS': case 'NOTEMPTY': case 'NOT_EMPTY': this.add(`${saha} ${isBooleanFilter ? '=' : '<>'} ${value}`); break
				case 'LESS_THAN_OR_EQUAL': if (!isBooleanFilter) { this.add(`${saha} <= ${value}`) } break;
				case 'LESS_THAN': if (!isBooleanFilter) { this.add(`${saha} < ${value}`) } break
				case 'GREATER_THAN_OR_EQUAL': if (!isBooleanFilter) { this.add(`${saha} >= ${value}`) } break;
				case 'GREATER_THAN': if (!isBooleanFilter) { this.add(`${saha} > ${value}`) } break
				case 'IN': this.inDizi(deger, saha); break
				case 'NOTIN': case 'NOT_IN': this.notInDizi(deger, saha); break
			}
		};
		const {value} = filter; if ($.isArray(value)) { for (const subValue of value) { addValueClause({ value: subValue }) } } else { addValueClause({ value }) }
		return this
	}
	//ext
	fisSilindiEkle(e) {
		e = e || {}; const alias = (typeof e == 'object' ? e.alias : e) ?? 'fis', aliasVeNokta = alias ? `${alias}.` : '';
		this.add(`${aliasVeNokta}silindi = ''`); return this
	}
	subeGecerlilikWhereEkle(e) {
		e = e || {}; const subeKodSql = e.subeKodSql || 'fis.bizsubekod', subeGrupSql = e.subeGrupSql || 'sub.isygrupkod';
		const subeYapi = e.subeYapi ?? config.session?.subeYapi ?? {}, {subeGecerlilik} = subeYapi; if (subeGecerlilik == null) return this
		if (subeGecerlilik == 'T') return this
		const {subeGrupKod, subeKod} = subeYapi; this.add(subeGecerlilik == 'G' ? `${subeGrupSql} = '${subeGrupKod}'` : `${subeKodSql} = '${subeKod}'`);
		return this
	}
	icerikKisitDuzenle_x(e) { config.session?.rol?.icerikselClauseDuzenle({ ...e, /* saha: ... */ where: this }); return this }
	icerikKisitDuzenle_sube(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'sube' }) }
	icerikKisitDuzenle_subeGrup(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'subeGrup' }) }
	icerikKisitDuzenle_cari(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'cari' }) }
	icerikKisitDuzenle_cariTip(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'carTip' }) }
	icerikKisitDuzenle_cariIstGrup(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'cariIstGrup' }) }
	icerikKisitDuzenle_cariBolge(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'bolge' }) }
	icerikKisitDuzenle_cariAnaBolge(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'anaBolge' }) }
	icerikKisitDuzenle_cariIl(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'il' }) }
	icerikKisitDuzenle_cariUlke(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'ulke' }) }
	icerikKisitDuzenle_stok(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'stok' }) }
	icerikKisitDuzenle_stokGrup(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'grup' }) }
	icerikKisitDuzenle_stokAnaGrup(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'anaGrup' }) }
	icerikKisitDuzenle_stokIstGrup(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'stokIstGrup' }) }
	icerikKisitDuzenle_yer(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'yer' }).icerikKisitDuzenle_x({ ...e, belirtec: 'stokYer' }) }
	icerikKisitDuzenle_yerGrup(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'yerGrup' }).icerikKisitDuzenle_x({ ...e, belirtec: 'stokYerGrup' }) }
	icerikKisitDuzenle_plasiyer(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'plasiyer' }) }
	icerikKisitDuzenle_plasiyerTip(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'plasiyerTip' }) }
	icerikKisitDuzenle_hizmet(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'hizmet' }) }
	icerikKisitDuzenle_hizmetGrup(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'hizmetGrup' }) }
	icerikKisitDuzenle_hizmetAnaGrup(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'hizmetAnaGrup' }) }
	icerikKisitDuzenle_hizmetIstGrup(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'hizmetIstGrup' }) }
}
class MQWhereClause extends MQSubWhereClause {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get onEk() { return `	WHERE	` }
}
class MQOnClause extends MQSubWhereClause {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get onEk() { return ` ON` }
}
class MQXJoinTable extends MQAliasliYapi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get onEk() { return null }
	constructor(e) {
		e = e || {};
		super(e);
		this.on = ((!e.on || $.isPlainObject(e.on) || typeof e.on == 'string' || $.isArray(e.on))
							? new MQOnClause(e.on)
							: e.on
						) || new MQOnClause();
	}
	aliasVarmi(alias) {
		return this.alias == alias
	}
	buildString(e) {
		super.buildString(e);
		this.on.buildString(e);
		return this
	}
}
class MQInnerJoin extends MQXJoinTable {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get innerJoinmi() { return true } static get onEk() { return ' INNER JOIN ' }
}
class MQOuterJoin extends MQXJoinTable {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get innerJoinmi() { return true } static get onEk() { return ' OUTER JOIN ' }
}
class MQLeftJoin extends MQXJoinTable {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get leftJoinmi() { return true } static get onEk() { return ' LEFT JOIN ' }
}
class MQTable extends MQAliasliYapi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e);
		this.leftVeInner = (e.leftVeInner && !$.isArray(e.leftVeInner) ? [e.leftVeInner] : e.leftVeInner) || [];
		this.iliskiler = (e.iliskiler && !$.isArray(e.iliskiler) ? [e.iliskiler] : e.iliskiler) || []
	}
	addLeftInner(e) { this.leftVeInner.push(e); return this }
	addIliski(e) { this.iliskiler.push(e); return this }
	aliasVarmi(alias) {
		if (this.alias == alias) { return true }
		const liste = this.leftVeInner || []; return liste.find(item => item.aliasVarmi(alias))
	}
	disindakiXTablolariSil(e) {
		let liste = this.leftVeInner || [], disindaSet = e.disindaSet ?? {}, {aliasSet} = e;
		if (!aliasSet && e.alias) { aliasSet = asSet([e.alias]) }
		for (let i = liste.length - 1; i >= 0; i--) {
			const anMQXJoinTable = liste[i], {alias} = anMQXJoinTable;
			if (aliasSet ? aliasSet[alias] : !disindaSet[alias]) { liste.splice(i, 1) }
		}
		return this
	}
	buildString(e) {
		super.buildString(e); const liste = this.leftVeInner || [];
		for (const item of liste) {
			e.result += CrLf; e.result += item.class.onEk;
			e.result += item.toString()
		}
		return this
	}
}
/*class MQLeftJoinClause extends MQClause {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {};
		super(e);

		this.from = ((!e.from || typeof e.from == 'object' || typeof e.from == 'string')
							? new MQFromClause(e.from)
							: null
						) || new MQFromClause();

		let iliskiDizi = (typeof e.iliski == 'string') ? [e.iliski] : e.iliski;
		this.on = ((!e.on || typeof e.on == 'object' || typeof e.on == 'string' || $.isArray(e.on))
							? new MQOnClause(e.on || iliskiDizi)
							: on
						) || new MQOnClause();
	}

	static get onEk() { return `	LEFT JOIN	` }
	static get baglac() { return ' ' }
	static get baglacsizmi() { return true }

	buildString_baslangicsiz(e) {
		super.buildString_baslangicsiz(e);

		this.from.buildString_baslangicsiz(e);
		if (this.on)
			this.on.buildString(e);
	}

	donusmusDeger(item) {
		if (typeof item != 'object')
			return MQAliasliYapi.newForFromText(item);
		
		return item;
	}
}*/
class MQHavingClause extends MQSubWhereClause {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get onEk() { return `	HAVING	` }
	static get baglac() { return ' AND ' }
}
class MQAndOrClause extends MQSubWhereClause {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	buildString_baslangicsiz(e) {
		if (this.liste.length <= 1) { super.buildString_baslangicsiz(e) } else { e.result += '('; super.buildString_baslangicsiz(e); e.result += ')' }
		return this
	}
}
class MQAndClause extends MQAndOrClause {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get baglac() { return ' AND ' }
}
class MQOrClause extends MQAndOrClause {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get baglac() { return ' OR ' }
}
class MQInClause extends MQClause {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get addDogrudanKullanilirmi() { return true }
	constructor(e) { e = e || {}; super(e); this.isNot = asBool(e.not); this.saha = e.saha || ''; }
	buildString(e) {
		let {liste, isNot} = this; if ($.isEmptyObject(liste)) { e.result += `1 ${isNot ? '<>' : '='} 2` }
		else if (liste.length == 1) { e.result += `${this.saha} ${isNot ? '<>' : '='} ${MQSQLOrtak.sqlServerDegeri(this.liste[0])}` }
		else { e.result += `${this.saha} ${isNot ? 'NOT ' : ''}IN (${this.liste.map(item => MQSQLOrtak.sqlServerDegeri(item)).join(this.class.baglac)})` }
		return this
	}
}
class MQOperandClause extends MQIliskiYapisi {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get addDogrudanKullanilirmi() { return true }
	constructor(e) { e = e || {}; super(e); this.isNot = asBool(e.not); this.operand = e.operand || '' }
	buildString(e) {
		const {sol, sag, isNot} = this; let {operand} = this, notPrefix = isNot;
		if (operand == '!=') { operand = '<>' } if ((sag?.deger ?? 'NULL').toUpperCase() == 'NULL') { operand = 'IS'}
		if (isNot) {
			switch (operand) {
				case '=': notPrefix = false; operand = '<>'; break;
				case '<>': notPrefix = false; operand = '='; break;
				case 'IS': notPrefix = false; operand = 'IS NOT'; break;
				case 'IS NOT': notPrefix = false; operand = 'IS'; break;
			}
		}
		let clause = `${sol.deger} ${operand} ${sag.deger}`; if (notPrefix) { clasue = `NOT (${clause})` }
		e.result += clause; return this
	}
}
class MQSetClause extends MQSubWhereClause {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get isSetClause() { return true }
	static get onEk() { return `	SET		` } static get baglac() { return ', ' }
}
class MQValuesClause extends MQClause {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get isValuesClause() { return true }
	static get onEk() { return `VALUES ` } static get baglac() { return ', ' }
}
class MQOrderByClause extends MQClause {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get onEk() { return ` ORDER BY	` }
	fromGridWSArgs(e) {
		e = e || {}; const alias = e.alias;
		const sahaConverter = alias ? (e => { let _alias = alias; if ($.isFunction(alias)) { _alias = alias.call(this, e) } return _alias ? `${_alias}.${e.saha}` : _alias }) : null;
		let sortDataField = e.sortdatafield || e.sortDataField;
		if (sortDataField && !asBool(e.rowCountOnly)) {
			if (sortDataField && !$.isArray(sortDataField)) sortDataField = [sortDataField];
			if (sahaConverter) sortDataField = sortDataField.map(saha => sahaConverter({ saha }));
			let sortOrder = (e.sortorder || e.sortOrder || '').toUpperCase().trim(); if (sortOrder == 'ASC') sortOrder = '';
			sortOrder = sortOrder ? ' ' + sortOrder : '';
			let orderByListe = sortDataField.map(attr => `${attr.trim()}${sortOrder}`); this.addAll(orderByListe);
		}
		return this
	}
}
class MQWith extends MQClause {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get onEk() { return `WITH	` } static get baglac() { return `,${CrLf}` }
}
