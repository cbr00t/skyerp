class MQClause extends MQSQLOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get addDogrudanKullanilirmi() { return false } static get baglacsizmi() { return false } static get baglac() { return ', ' } static get onEk() { return '' }
	constructor(e) {
		e = e || {}; super(e);
		if (isArray(e)) { e = { liste: e } } else if (typeof e != 'object') { e = { liste: [e] } }
		this.parantezlimi = asBool(e.parantezlimi || e.parantezli);
		let liste = this.liste = [], _liste = e.liste;
		if (!empty(_liste)) { let {addDogrudanKullanilirmi} = this.class; for (let item of _liste) { if (addDogrudanKullanilirmi) { this.addDogrudan(item) } else { this.add(item) } } }
		let value = e.birlestir; if (value) { this.birlestir(value) }
	}
	add(...sahalar) {
		let {liste} = this; for (let saha of sahalar) {
			if (saha == null) { continue } if (isArray(saha)) { this.add(...saha); continue }
			let value = this.donusmusDeger(saha); if (this.addIcinUygunmu(value)) { liste.push(value) }
		}
		return this
	}
	addDogrudan(...sahalar) {
		let {liste} = this; for (let saha of sahalar) {
			if (saha == null) { continue } if (isArray(saha)) { this.add(...saha); continue }
			let value = this.donusmusDeger(saha); liste.push(value)
		}
		return this
	}
	addAll(coll) {
		if (coll && coll.liste) { coll = coll.liste }
		if ($.isPlainObject(coll) && !isArray(coll))
			coll = keys(coll)
		if (!isArray(coll))
			coll = arguments
		this.add(...coll)
		return this
	}
	birlestir(anMQClause) {
		let liste = typeof anMQClause == 'string' ? [anMQClause] : anMQClause?.liste
		if (!empty(liste))
			this.addAll(liste)
		let _params = anMQClause?.params
		if (!empty(_params)) {
			let params = this.params = this.params || []
			params.push(..._params)
		}
		return this
	}
	donusmusDeger(item) {
		/* return (item == null || item == '') ? null : item ^-- inDizi'deki '' değer için sorun çıktığı için kaldırıldı */
		return item ?? null
	}
	addIcinUygunmu(item) { return !(item == null || item == '' || (typeof item == 'string' && item.trimEnd() == '')) }
	buildString(e) {
		//if (this instanceof MQOuterApply)
		//	debugger
		super.buildString(e)
		let clause = this.toString_baslangicsiz(e)
		if (clause) { 
			let {onEk} = this.class
			e.result += `${onEk ? onEk + ' ' : ''}${clause}`
		}
		return this
	}
	getQueryYapi_baslangicsiz(e = {}) {
		let query = this.toString_baslangicsiz(e)
		let {params} = this
		return { query, params }
	}
	toString_baslangicsiz(e) {
		e = { ...e, result: '' }
		this.buildString_baslangicsiz(e)
		return e.result
	}
	buildString_baslangicsiz(e) {
		let {liste, parantezlimi, class: { baglac }} = this
		let doluListe = liste.filter(item => typeof item != 'string' || item.trim())
		if (!empty(doluListe)) {
			if (parantezlimi)
				e.result += '('
			for (let i = 0; i < doluListe.length; i++) {
				let item = doluListe[i]
				if (!item)
					continue
				let text = item.toString()
				let {class: { baglacsizmi } = {}} = item
				if (i && !baglacsizmi)
					e.result += baglac
				e.result += text
				let {params: _params} = item
				if (!empty(_params))
					e.params?.push(..._params)
			}
			if (parantezlimi)
				e.result += ')'
		}
		let {params: _params} = this
		if (!empty(_params)) {
			_params = _params.filter(x => !!x)
			let resultParams = e.params || []
			let keySet = asSet(resultParams.filter(x => !!x).map(_param => _param.name || _param.key))
			for (let _ in _params) {
				let _param = _params[_], name = _param.name || _param.key
				if (!keySet[name]) {
					keySet[name] = true
					resultParams.push(_param)
				}
			}
		}
		return this
	}
	parantezli() { this.parantezlimi = true; return this }
	parantezsiz() { this.parantezlimi = false; return this }
	*iter() {
		let {liste} = this
		for (let item of liste ?? [])
			yield item		
	}
	[Symbol.iterator]() { return this.iter() }
}
class MQToplu extends MQClause {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get toplumu() { return true } get toplumu() { return this.class.toplumu }
	static get baglac() { return `${MQCogul.isOfflineMode ? ';' : ''}${CrLf}${CrLf}` }
	constructor(e) { e = e || {}; super(e); this.trnFlag = asBool(e.trnFlag) }
	buildString_baslangicsiz(e) {
		let {trnFlag} = this
		if (trnFlag) {
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
		super.buildString_baslangicsiz(e)
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
	get alias2Deger() {
		let result = {}
		for (let item of this.liste) {
			if (!item)
				continue
			if (typeof item != 'object')
				item = MQAliasliYapi.newForSahaText(item)
			let {alias, deger} = item
			if (!alias)
				continue
			if (alias == 'undefined')                                        // bir sorun var
				debugger
			for (let ch of ['.', ',', '(', ')']) {
				if (alias.includes(ch)) {
					console.warn('alias2Deger', 'alias hatası', { saha: this, text, deger, alias })
					break
				}
			}
			result[alias] = deger
			/* if (config.dev && alias?.includes('fis.tarih)')) { debugger } */
		}
		return result
	}
	donusmusDeger(item) {
		item = super.donusmusDeger(item)
		if (item == null)
			return item
		return typeof item == 'object' ? item : MQAliasliYapi.newForSahaText(item)
	}
	addIcinUygunmu(item) {
		if (!super.addIcinUygunmu(item))
			return false
		if (this.liste.find(x => ((x?.aliasVeyaDeger && item?.aliasVeyaDeger) && x.aliasVeyaDeger == item.aliasVeyaDeger))) {
			/* console.warn('MQSahalar::addIcinUygunmu', item, 'duplicate alias'); */
			return false
		}
		return true
	}
	addWithAlias(alias, ...sahalar) { return this.addAllWithAlias({ alias: alias, sahalar: sahalar }) }
	addAllWithAlias(e) { let {alias, sahalar} = e;
		if (!empty(sahalar)) { for (let saha of sahalar) this.add(`${alias}.${saha}`) }
		return this
	}
}
class MQZincirler extends MQClause {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	optimize(e) {
		/* liste: [ ["fis", "har"], ["har", "stk"], ["fis", "car"], ["car", "bol"] ] */
		let {liste} = this
		for (let i = liste.length - 1; i > 0; i--) {			// (i > 0) ==> ilk elemana bakılmaz
			let altDizi = liste[i]
			let ilk = altDizi[0]
			for (let j = i - 1; j >= 0; j--) {
				let ustDizi = liste[j]
				if (ustDizi[ustDizi.length - 1] == ilk) {
					ustDizi.push(...(altDizi.slice(1)))
					liste.splice(i, 1)
					break
				}
			}
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
		if (!super.addIcinUygunmu(aMQTable)) { return false }
		let targetAlias = aMQTable?.aliasVeyaDeger ?? aMQTable, {liste} = this;
		for (let {aliasVeyaDeger: alias, leftVeInner} of liste) {
			if (alias == targetAlias) {
				/* console.warn('MQFromClause::addIcinUygunmu > from', aMQTable, targetAlias, 'duplicate alias'); */
				return false
			}
			if (!!leftVeInner?.find(({ aliasVeyaDeger: alias }) => alias == targetAlias)) {
				console.warn('MQFromClause::addIcinUygunmu > inner/left join', aMQTable, targetAlias, 'duplicate alias');
				return false
			}
		}
		return true
	}
	aliasIcinTable(alias) { return this.liste.find(anMQTable => anMQTable.aliasVarmi(alias)) }
	iliskiler2Where(e) {
		let {liste} = this, {where: birlesikWhere} = e
		for (let anMQTable of liste)
			for (let  anMQIliskiYapisi of anMQTable.iliskiler)
				birlesikWhere.add(anMQIliskiYapisi.toString())
		return this
	}
	/* kullanılmayan tablolar içerdiği ilişkiler ile silinecek. table içindeki (left, inner) için de aynı kural geçerli */
	disindakiTablolariSil(e) {
		let disindaSet = e.disindaSet ?? {}
		let {liste} = this
		for (let i = liste.length - 1; i >= 0; i--) {
			let anMQTable = liste[i], {alias} = anMQTable
			if (disindaSet[alias])
				anMQTable.disindakiXTablolariSil(e)
			else
				liste.splice(i, 1)
		}
		return this
	}
	*iter() {
		let {liste} = this
		for (let aMQTable of liste ?? []) {
			if (typeof aMQTable == 'string')
				aMQTable = MQTable.newForFromText(aMQTable)
			if (!aMQTable)
				continue
			let {leftVeInner = []} = aMQTable
			yield aMQTable
			for (let anMQXJoinTable of leftVeInner)
				yield anMQXJoinTable
		}
	}
	[Symbol.iterator]() { return this.iter() }
}
class MQSubWhereClause extends MQClause {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get baglac() { return `${CrLf}	  AND	 ` }
	constructor(e) {
		e = e || {}; let initBlock = e => {
			if (!$.isPlainObject(e)) { this.add(e); return true }
			let value = e.inDizi; if (value !== undefined) { this.inDizi({ liste: value, saha: e.saha, not: e.not ?? e.disindakilermi ?? e.disindakiler }); return true }
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
			value = e.tekSecim; if (value !== undefined) { this.tekSecim({ deger: value, saha: e.saha, not: e.not ?? e.disindakilermi ?? e.disindakiler }); return true }
			value = e.notTekSecim; if (value !== undefined) { this.notTekSecim({ deger: value, saha: e.saha }); return true }
			value = e.birKismi; if (value !== undefined) { this.birKismi({ deger: value, saha: e.saha, not: e.not ?? e.disindakilermi ?? e.disindakiler }); return true }
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
		if (isArray(e)) { if (!empty(e)) { for (let item of e) { initBlock(item) } } } else { initBlock(e) }
	}
	addIcinUygunmu(item) {
		if (item == ({}).toString())
			debugger
		return super.addIcinUygunmu(item) && !this.liste.includes(item)
	}
	birlestirDict(e, _alias, _not) {
		e = e || {}; let dict = e.dict || e.birlestirDict || e.liste || e, not = e.not ?? _not;
		let alias = e.alias ?? e.tableAlias ?? _alias, aliasVeNokta = alias ? `${alias}.` : '';
		let isSetClause = e.isSetClause ?? this.class.isSetClause, isValuesClause = e.isValuesClause ?? this.class.isValuesClause;
		if (!empty(dict)) {
			let and = new MQAndClause();
			for (let [key, value] of entries(dict)) { and.degerAta({ isSetClause, not, deger: value, saha: `${aliasVeNokta}${key}` }) }
			let isSetOrValues = isSetClause || isValuesClause; this.add(isSetOrValues ? and.liste : and)
		}
		return this
	}
	notBirlestirDict(e, _alias) {
		e = e || {}; if (typeof e == 'object') { e.not = true }
		return this.birlestirDict(e, _alias, true)
	}
	degerAta(e, _saha) {
		e = e?.saha ? e : { deger: e, saha: _saha }; let isSetClause = e.isSetClause ?? this.class.isSetClause; 
		let isNot = typeof e == 'object' && asBool(e.not), {saha, deger} = e;
		/*if (deger != null) { let operand = '='; return this.operand({ saha, operand, deger, not: isNot }) }*/
		let clause = deger == null && !isSetClause ? `${saha} IS${isNot ? ' NOT' : ''} NULL` : `${saha} ${isNot ? '<>' : '='} ${MQSQLOrtak.sqlServerDegeri(deger)}`
		return this.addDogrudan(clause)
	}
	notDegerAta(e, _saha) { e = e.saha ? $.extend({}, e) : { deger: e, saha: _saha }; e.not = true; return this.degerAta(e) }
	inDizi(e, _saha) {
		e = e?.saha ? e : { liste: e, saha: _saha }
		let liste = e.liste = e.liste || e.deger
		delete e.deger
		if (!liste)
			return this
		let inClause = liste.liste ? liste : new MQInClause({ liste, saha: e.saha })
		inClause.isNot = typeof e == 'object' && asBool(e.not ?? e.disindakilermi ?? e.disindakiler)
		return this.addDogrudan(inClause)
	}
	notInDizi(e, _saha) { e = e.saha ? $.extend({}, e) : { liste: e, saha: _saha }; e.not = true; return this.inDizi(e) }
	like(e, _saha, _aynenAlinsinmi, _yazildigiGibimi) {
		e = e.saha ? e : { deger: e, saha: _saha }; let isNot = typeof e == 'object' && asBool(e.not);		
		let aynenAlinsinmi = e.aynenAlinsinmi ?? e.aynenAlinsin ?? _aynenAlinsinmi,  yazildigiGibimi = e.yazildigiGibimi ?? e.yazildigiGibi ?? _yazildigiGibimi;
		let deger = (e.deger || '').toString().replaceAll('*', '%');
		if (!aynenAlinsinmi) { if (deger && deger.slice(-1) != '%') { deger += '%' } if (deger[0] != '%') { deger = '%' + deger } }
		if (yazildigiGibimi) { return this.addDogrudan(`${e.saha} ${isNot ? 'NOT ' : ''}LIKE '${deger}'`) }
		let degerENUpper = deger.toUpperCase(), degerTRUpper = deger.toLocaleUpperCase(culture);
		return this.addDogrudan(new MQOrClause([
			`UPPER(${e.saha}) ${isNot ? 'NOT ' : ''}LIKE '${degerENUpper}'`,
			`UPPER(${e.saha}) ${isNot ? 'NOT ' : ''}LIKE '${degerTRUpper}'`
		]))
	}
	notLike(e, _saha, _yazildigiGibimi) { e = e.saha ? $.extend({}, e) : { deger: e, saha: _saha }; e.not = true; return this.like(e) }
	operand(e, _operand, _deger) {
		e = e.saha ? e : { saha: e, operand: _operand, deger: _deger }; let {saha, operand, deger} = e;
		let isNot = typeof e == 'object' && asBool(e.not); if (!operand) {
			let result = MQOperandClause.newForText(e); if (isNot) { result.asNot() }
			this.addDogrudan(result); return this
		}
		let {saha: sol} = e, sag = MQSQLOrtak.sqlServerDegeri(deger);
		this.addDogrudan(new MQOperandClause({ sol, operand, sag, not: isNot })); return this
	}
	notOperand() { return this.operand(...arguments).asNot() }
	basiSonu(e, _saha) {
		e = e?.saha ? e : { deger: e, saha: _saha };
		let {saha, deger: bs, deger: { birKismimi, disindakilermi = e.disindakiler } = {}} = e
		birKismimi = bs?.birKismimi ?? birKismimi
		disindakilermi = bs?.disindakilermi ?? bs?.disindakiler ?? disindakilermi
		let isNot = typeof e == 'object' && asBool(e.not ?? disindakilermi)
		if (birKismimi)
			this.birKismi({ liste: bs.value, saha, not: isNot })
		let sub = new MQAndClause()
		if (bs) {
			let {basi, sonu} = bs ?? {}, eqOp = { sonu: '=' };
			if (basi) {
				sub.addDogrudan(`${saha} >= ${MQSQLOrtak.sqlServerDegeri(basi)}`) }
			if (sonu) {
				if (isDate(sonu)) { sonu = sonu.clone().addDays(1); eqOp.sonu = '' }
				sub.addDogrudan(`${saha} <${eqOp.sonu} ${MQSQLOrtak.sqlServerDegeri(sonu)}`)
			}
		}
		let text = sub.toString_baslangicsiz()
		if (isNot && text)
			text = `NOT(${text})`
		if (text)
			this.addDogrudan(text)
		return this
	}
	notBasiSonu(e, _saha) { e = e.saha ? $.extend({}, e) : { deger: e, saha: _saha }; e.not = true; return this.basiSonu(e) }
	ozellik(e, _saha) {
		e = e?.saha ? e : { deger: e, saha: _saha };
		let isNot = typeof e == 'object' && asBool(e.not); let deger = e.deger || '';
		let {disindakilermi, yazildigiGibimi} = deger || {};
		if (disindakilermi) { isNot = true }
		if (deger?.value !== undefined) deger = deger.value
		if (deger?.ozellik !== undefined) deger = deger.ozellik
		let {saha} = e, or = new MQOrClause(), parts = deger ? deger.split(' ') : null;
		if (parts) { for (let part of parts) { part = part.trim(); if (part) { or.like({ deger: part, saha, yazildigiGibimi }) } } }
		let text = or.toString(); if (isNot) { text = text ? `NOT(${text})` : '1 = 2' }
		if (text) { this.addDogrudan(text) }
		return this
	}
	notOzellik(e, _saha) { e = e.saha ? $.extend({}, e) : { deger: e, saha: _saha }; e.not = true; return this.ozellik(e) }
	tekSecim(e, _saha) {
		e = e?.saha? e : { deger: e, saha: _saha }
		let isNot = typeof e == 'object' && asBool(e.not ?? e.disindakilermi ?? e.disindakiler)
		let deger = e.deger ?? e.value
		if (deger?.value !== undefined) { deger = deger.value }
		if (deger?.tekSecim !== undefined) { deger = deger.tekSecim } if (deger) { deger = deger.char ?? deger }
		if (deger != null && !(deger instanceof TekSecim)) { return this.degerAta({ saha: e.saha, deger, not: isNot }) }
		return this
	}
	notTekSecim(e, _saha) { e = e.saha ? $.extend({}, e) : { deger: e, saha: _saha }; e.not = true; return this.tekSecim(e) }
	birKismi(e, _saha) {
		e = e?.saha? e : { liste: e, saha: _saha }
		let isNot = typeof e == 'object' && asBool(e.not ?? e.disindakilermi ?? e.disindakiler)
		let liste = e.liste ?? e.deger ?? e.value; delete e.deger
		if (liste?.value !== undefined) { liste = liste.value }
		if (liste && typeof liste != 'object') { liste = $.makeArray(liste) }
		if (liste && !isArray(liste)) { liste = values(liste) }
		if (liste) { liste = liste.map(x => x?.char === undefined ? x : x.char).filter(x => !(x && x instanceof TekSecim)) }
		if (liste?.length)
			return this.inDizi({ saha: e.saha, liste, not: isNot })
		return this
	}
	notBirKismi(e, _saha) { e = e.saha ? $.extend({}, e) : { liste: e, saha: _saha }; e.not = true; return this.birKismi(e) }
	ticariGC(e, _fisAlias, _notFlag) {
		e = e || {};
		let alimmi = (e.alimmi ?? e.alim ?? e.girismi ?? e.giris ?? (e == true)) ?? false;
		let fisAlias = ( e.fisAlias ?? e.alias ?? _fisAlias ) ?? 'fis';
		let notFlag = e.not ?? _notFlag, aliasVeNokta = fisAlias ? `${fisAlias}.` : '';
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
		e = e || {}; let args = ( typeof e == 'object' ? [$.extend({}, e, { not: true })] : [e, _fisAlias, true] );
		return this.ticariGC(...args)
	}
	ticariTSN(e, _fisAlias, _noSahaAdi, _notFlag) {
		e = e || {};
		let tsn = ( e.deger ?? e.tsn ?? e ), fisAlias = ( e.fisAlias ?? e.alias ?? _fisAlias ) ?? 'fis';
		let noSahaAdi = ( e.noSahaAdi ?? e.noSaha ?? _noSahaAdi ) || 'no', notFlag = e.not ?? _notFlag, aliasVeNokta = fisAlias ? `${fisAlias}.` : '';
		if (tsn.seri != null) this.degerAta(tsn.seri, `${aliasVeNokta}seri`)
		if (tsn.noYil != null) this.degerAta(tsn.noYil, `${aliasVeNokta}noyil`)
		this.degerAta(tsn.no, `${aliasVeNokta}${noSahaAdi}`); return this
	}
	notTicariTSN(e, _fisAlias, _noSahaAdi) {
		e = e || {}; let args = typeof e == 'object' ? [$.extend({}, e, { not: true })] : [e, _fisAlias, _noSahaAdi, true];
		return this.ticariTSN(...args)
	}
	fromGridWSArgs(e) {
		e = e || {}; let {alias} = e; let {filters} = e;
		if (!filters) {
			let {filterGroups} = e;
			if (filterGroups) { filters = e.filters = []; for (let filterGroup of filterGroups) { let _filters = filterGroup.filters; if (_filters?.length) { filters.push(..._filters) } } }
		}
		if (filters) { for (let filter of filters) { this.fromGridFilter({ filter, alias }) } }
		return this
	}
	fromGridFilter(e) {
		e = e || {}; let filter = e.filter || e; if (empty(filter)) { return this }
		let saha = filter.field; if (!saha) { return this }
		let _e = { saha, filter }, alias = $.isFunction(e.alias) ? e.alias.call(this, _e) : e.alias;
		if (_e.saha) { saha = _e.saha }
		if (alias) { saha = `${alias}.${saha}` }
		let filterType = (filter.type || '').toLowerCase();
		// let operator = filter.operator.toUpperCase();
		let condition = (filter.comparisonoperator || filter.condition || '').toUpperCase(), isBooleanFilter = filterType == 'booleanfilter';
		// let isNumericFilter = filterType == 'numericfilter';
		let isStringFilter = !filterType || filterType == 'stringfilter';
		let addValueClause = e => {
			let {value} = e; let not = true;
			switch (condition) {
				case 'EMPTY': case 'NOTEMPTY': case 'NOT_EMPTY':
					value = isStringFilter ? '' : 0; break
				case 'IN': case 'NOTIN': case 'NOT_IN':
					let InSeparator = '|';
					value = isArray(value) ? value.join(InSeparator) : value; value = value.split(InSeparator).filter(x => !!x);
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
		let {value} = filter; if (isArray(value)) { for (let subValue of value) { addValueClause({ value: subValue }) } } else { addValueClause({ value }) }
		return this
	}
	//ext
	fisSilindiEkle(e) {
		e = e || {}; let alias = (typeof e == 'object' ? e.alias : e) ?? 'fis', aliasVeNokta = alias ? `${alias}.` : '';
		this.add(`${aliasVeNokta}silindi = ''`); return this
	}
	subeGecerlilikWhereEkle(e) {
		e = e || {}; let subeKodSql = e.subeKodSql || 'fis.bizsubekod', subeGrupSql = e.subeGrupSql || 'sub.isygrupkod';
		let subeYapi = e.subeYapi ?? config.session?.subeYapi ?? {}, {subeGecerlilik} = subeYapi; if (subeGecerlilik == null) return this
		if (subeGecerlilik == 'T') return this
		let {subeGrupKod, subeKod} = subeYapi; this.add(subeGecerlilik == 'G' ? `${subeGrupSql} = '${subeGrupKod}'` : `${subeKodSql} = '${subeKod}'`);
		return this
	}
	icerikKisitDuzenle_x(e) { config.session?.rol?.icerikselClauseDuzenle?.({ ...e, /* saha: ... */ where: this }); return this }
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
	icerikKisitDuzenle_kasa(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'kasa' }) }
	icerikKisitDuzenle_banka(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'banka' }) }
	icerikKisitDuzenle_bankaHesap(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'bankaHesap' }) }
	icerikKisitDuzenle_posKosul(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'posKosul' }) }
	icerikKisitDuzenle_personel(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'personel' }) }
	icerikKisitDuzenle_muhHesap(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'muhHesap' }) }
	icerikKisitDuzenle_takipNo(e) { return this.icerikKisitDuzenle_x({ ...e, belirtec: 'takipNo' }) }
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
		e = e || {}; super(e);
		this.on = ((!e.on || $.isPlainObject(e.on) || typeof e.on == 'string' || isArray(e.on))
							? new MQOnClause(e.on)
							: e.on
						) || new MQOnClause();
	}
	aliasVarmi(alias) { return this.aliasVeyaDeger == alias }
	buildString(e) {
		super.buildString(e)
		this.on.buildString(e)
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
class MQOuterApply extends MQClause {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get outerApplymi() { return true }
	static get _onEk() { return ' OUTER APPLY ' }
	constructor(e = {}) {
		if (isArray(e))
			e = { liste: e }
		super(e)
		this.parantezli()
		this.name = e.name
	}
	aliasVarmi(alias) { return this.table == alias }
	buildString_baslangicsiz(e) {
		// from içinden çağırınca 'okEk' otomatik ekleniyor
		let {class: { _onEk: onEk }, name} = this
		e.result += onEk
		super.buildString_baslangicsiz(e)
		if (name)
			e.result += ` AS ${name}`
	}
}
class MQTable extends MQAliasliYapi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e);
		this.leftVeInner = (e.leftVeInner && !isArray(e.leftVeInner) ? [e.leftVeInner] : e.leftVeInner) || [];
		this.iliskiler = (e.iliskiler && !isArray(e.iliskiler) ? [e.iliskiler] : e.iliskiler) || []
	}
	addLeftInner(e) {
		let {aliasVeyaDeger} = e;
		if (this.aliasVarmi(aliasVeyaDeger)) { console.warn('addLeftInner', e, e?.aliasVeyaDeger, 'duplicate alias'); return this }
		this.leftVeInner.push(e); return this
	}
	addIliski(e) { this.iliskiler.push(e); return this }
	aliasVarmi(alias) {
		if (this.aliasVeyaDeger == alias) { return true }
		let liste = this.leftVeInner || [];
		return liste.find(item => item.aliasVarmi(alias))
	}
	disindakiXTablolariSil(e) {
		/*let disindaSet = e.disindaSet || {}; let liste = this.leftVeInner || [];
		for (let i = liste.length - 1; i >= 0; i--) { let anMQXJoinTable = liste[i]; if (!disindaSet[anMQXJoinTable.alias]) { liste.splice(i, 1) } }*/
		let {aliasSet, disindaSet} = e
		if (!aliasSet && e.alias)
			aliasSet = asSet([e.alias])
		disindaSet ??= {}
		let liste = this.leftVeInner || []
		for (let i = liste.length - 1; i >= 0; i--) {
			let anMQXJoinTable = liste[i], {alias = anMQXJoinTable.name} = anMQXJoinTable    // .alias veya outer.name
			if (aliasSet ? aliasSet[alias] : !disindaSet[alias])
				liste.splice(i, 1)
		}
		return this
	}
	buildString(e) {
		super.buildString(e)
		let liste = this.leftVeInner || []
		for (let item of liste) {
			e.result += CrLf
			e.result += item.class.onEk
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
		this.on = ((!e.on || typeof e.on == 'object' || typeof e.on == 'string' || isArray(e.on))
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
		let {liste, isNot} = this; if (empty(liste)) { e.result += `1 ${isNot ? '<>' : '='} 2` }
		else if (liste.length == 1) { e.result += `${this.saha} ${isNot ? '<>' : '='} ${MQSQLOrtak.sqlServerDegeri(this.liste[0])}` }
		else { e.result += `${this.saha} ${isNot ? 'NOT ' : ''}IN (${this.liste.map(item => MQSQLOrtak.sqlServerDegeri(item)).join(this.class.baglac)})` }
		return this
	}
}
class MQOperandClause extends MQIliskiYapisi {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get addDogrudanKullanilirmi() { return true }
	constructor(e) { e = e || {}; super(e); this.isNot = asBool(e.not); this.operand = e.operand || '' }
	buildString(e) {
		let {sol, sag, isNot} = this; let {operand} = this, notPrefix = isNot;
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
	addIcinUygunmu(value) {
		if (!super.addIcinUygunmu(value)) { return false }
		if (this.liste.includes(value)) { console.warn('MQOrderByClause::addIcinUygunmu', value, 'duplicate alias'); return false }
		return true
	}
	fromGridWSArgs(e) {
		e = e || {}; let alias = e.alias;
		let sahaConverter = alias ? (e => { let _alias = alias; if ($.isFunction(alias)) { _alias = alias.call(this, e) } return _alias ? `${_alias}.${e.saha}` : _alias }) : null;
		let sortDataField = e.sortdatafield || e.sortDataField;
		if (sortDataField && !asBool(e.rowCountOnly)) {
			if (sortDataField && !isArray(sortDataField)) sortDataField = [sortDataField];
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
	get toplamTable() {
		let {liste} = this, {toplamTable} = MQStm;
		return liste.find(({ table }) => table.startsWith(toplamTable))
	}
	get toplamVarmi() { return !!this.toplamTable }
	get debugListe() { return this.sent.liste.map(sent => ({ from: sent.from.toString(), sahalar: sent.sahalar.toString(), where: sent.where.liste.join(' ') })) }
	getTable(value) { let {liste} = this; return liste.find(({ table }) => table == value) }
	hasTable(value) { return !!this.getTable(value) }
}
