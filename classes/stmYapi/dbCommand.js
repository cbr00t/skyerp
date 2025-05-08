class MQDbCommand extends MQSQLOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class MQSentVeIliskiliYapiOrtak extends MQDbCommand {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get unionSahaListe() {
		let result = []; for (let {sahalar} of this) {
			result.push(sahalar.liste.flat()) }
		return result
	}
	get unionAliasListe() {
		let result = []; for (let {sahalar} of this) {
			result.push(sahalar.liste.flatMap(saha => saha.alias)) }
		return result
	}
	asToplamStm(e) {
		e = e || {}; let sumListe = e.sumListe ?? [], orderFlag = e.order ?? e.orderBy;
		let tmpTabloVeAlias = e.tmpTabloVeAlias ?? e.tmpTableVeAlias, {toplamInd} = e, {liste} = this;
		let ilkSent; for (let sent of this) { ilkSent = sent; break } if (!ilkSent) { return new MQStm() } 
		let tmpTabloAdi = tmpTabloVeAlias?.deger ?? `${MQStm.toplamTable}${toplamInd ?? ''}`;
		let tmpAlias = tmpTabloVeAlias?.alias ?? `xtop${toplamInd ?? ''}`;		/* aMQAliasliYapi */
		let stm = new MQStm(), {with: _with, orderBy} = stm, sahaAdi2Deger = {};
		for (let { alias, deger } of ilkSent.sahalar.liste) { if (deger) { sahaAdi2Deger[alias] = deger } }
		let topSahalarAdiSet = asSet(sumListe ?? []), matchList = ['SUM(', 'COUNT(', 'AVG(', 'STRING_AGG('];
		for (let {sahalar} of this)
		for (let {alias, deger} of sahalar.liste) {
			deger = deger?.toUpperCase(); if (!deger) { continue }
			let uygunmu = !!matchList.find(match => deger.startsWith(match) && deger.includes(')'));
			if (uygunmu) { topSahalarAdiSet[alias] = true }
		}
		let tumSahaAdlari = Object.keys(sahaAdi2Deger), topSahaAdlari = Object.keys(topSahalarAdiSet);
		let digerSahaAdlari = tumSahaAdlari.filter(saha => !topSahalarAdiSet[saha]);
		_with.add(new MQTmpTable({ table: tmpTabloAdi, sahalar: tumSahaAdlari, sent: this }));
		let asilSent = stm.sent; asilSent.fromAdd(`${tmpTabloAdi} ${tmpAlias}`); asilSent.sahalar.liste = [];
		{
			let {sahalar} = asilSent;
			for (let sahaAdi of digerSahaAdlari) { sahalar.add(`${tmpAlias}.${sahaAdi}`) }
			for (let sahaAdi of topSahaAdlari) { sahalar.add(`SUM(${tmpAlias}.${sahaAdi}) ${sahaAdi}`) }
		}
		asilSent.groupByOlustur();
		if (orderFlag) { orderBy.liste = []; orderBy.addAll(digerSahaAdlari) }
		return stm
	}
	asToplamStmWithOrderBy(e) { e = e || {}; e.order = true; delete e.orderBy; return this.asToplamStm(e) }
	*getSentListe(e) { yield this }
	[Symbol.iterator](e) { return this.getSentListe(e) }
	sentDo(e) {
		e = e || {}; if (typeof e != 'object') e = { callback: e }
		e.callback.call(this, this, { item: this, index: 1, liste: [this] })
	}
}
class MQSelect2Insert extends MQDbCommand {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get onEk() { return `INSERT INTO ` } get isDBWriteClause() { return true }
	constructor(e) {
		e = e || {}; super(e); let {sent} = e;
		$.extend(this, { table: e.table ?? e.from, sent })
	}
	buildString(e) {
		super.buildString(e); let {table, sent} = this, {onEk} = this.class;
		if (!(table && sent) || sent?.sahalar?.liste?.length === 0) { return }
		e.result += `${onEk}${table} ${sent.toString()}`
	}
}
class MQInsertBase extends MQDbCommand {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get onEk() { return `INSERT INTO ` }
	get isTableInsert() { return this.tableInsertFlag } get isDBWriteClause() { return true }
	constructor(e) {
		e = e || {}; super(e); let hvListe = e.hvListe ?? e.hv; if (hvListe && !$.isArray(hvListe)) { hvListe = [hvListe] }
		$.extend(this, { table: e.table ?? e.from, hvListe, tableInsertFlag: null })
	}
	buildString(e) {
		super.buildString(e); let {table, hvListe} = this; if (!table || $.isEmptyObject(hvListe)) { return }
		let {sqlitemi, offlineMode} = window?.app ?? {}, {onEk} = this.class, ilkHV = hvListe[0], keys = Object.keys(ilkHV), hvSize = hvListe.length;
			// SQL Bulk Insert (values ?? .. ??) için SQL tarafında en fazla 1000 kayıta kadar izin veriliyor
		let isTableInsert = hvSize > 1000 ? true : this.isTableInsert; if (isTableInsert == null) { isTableInsert = hvSize > 500 }
		e.result += `${onEk}${table} (`; e.result += keys.join(','); e.result += ') ';
		if (sqlitemi && offlineMode !== false) {
			let params = e.params = [], hvParamClauses = [];
			for (let hv of hvListe) {
				let hvParam = []; for (let key of keys) {
					let value = hv[key] ?? null;
					if (isDate(value)) { value = asReverseDateTimeString(value) }
					else if (typeof value == 'boolean') { value = bool2Int(value) }
					hvParam.push(value)
				}
				hvParamClauses.push(`(${hvParam.map(x => '?').join(', ')})`);
				params.push(...hvParam)
			}
			e.result += `VALUES ${hvParamClauses.join(', ')}`
		}
		else {
			if (isTableInsert) {
				e.result += ' SELECT * FROM @dt'; e.params = [ { name: '@dt', type: 'structured', value: hvListe } ] }
			else {
				e.result += ' VALUES ';
				for (let i = 0; i < hvSize; i++) {
					if (i != 0) { e.result += ',' }
					e.result += '(';
					let hv = hvListe[i], ilkDegermi = true; for (const key in hv) {
						if (ilkDegermi) { ilkDegermi = false } else { e.result += ',' }
						const value = hv[key]; e.result += MQSQLOrtak.sqlServerDegeri(value)
					}
					e.result += ')'
				}
			}
		}
	}
};
class MQInsert extends MQInsertBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { e = e || {}; super(e); this.tableInsertFlag = asBoolQ(e.tableInsert); }
	tableInsert() { this.tableInsertFlag = true; return this } queryInsert() { this.tableInsertFlag = false; return this }
}
class MQTableInsert extends MQInsertBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } get isTableInsert() { return true }
}
class MQQueryInsert extends MQInsertBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } get isTableInsert() { return false }
}
class MQInsertOrUpdate extends MQDbCommand {
	static { window[this.name] = this; this._key2Class[this.name] = this } get isDBWriteClause() { return true }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			table: e.table ?? e.from, keyHV: e.keyHV ?? e.keyHostVars, hv: e.hv ?? e.hostVars, operator: e.operator,
			ekHV: e.ekHV ?? { ins: e.ekHV_ins ?? {}, upd: e.ekHV_upd ?? {} }
		})
	}
	buildString(e) {
		let {table, keyHV, hv, operator} = this; if ($.isEmptyObject(keyHV) || $.isEmptyObject(hv)) { return }
		let insHV = {}, updHV = { ...hv }, wh = new MQWhereClause().birlestirDict(keyHV);
		for (let [key, value] of Object.entries(keyHV)) { if (!insHV[key]) { insHV[key] = value } if (updHV[key]) { delete updHV[key] } }
		for (let [key, value] of Object.entries(hv)) { if (!insHV[key]) { insHV[key] = value } }
		let {ekHV} = this; $.extend(insHV, ekHV.ins); $.extend(updHV, ekHV.upd);
		let set = new MQSetClause(); if (operator) {
			for (let [key, value] of Object.entries(updHV)) {
				set.add(`${key} = ${key} ${operator} ${MQSQLOrtak.sqlServerDegeri(value)}`) }
		}
		else { set.birlestirDict(updHV) }
		let delim = ', ', keys = Object.keys(insHV);
		let values = Object.values(insHV).map(value => MQSQLOrtak.sqlServerDegeri(value));
		super.buildString(e); e.result += [
			`IF EXISTS (SELECT * FROM ${table} ${wh})`,
			`	UPDATE ${table} ${set} ${wh}`,
			'ELSE',
			`	INSERT INTO ${table} (${keys.join(delim)}) VALUES (${values.join(delim)})`
		].join(CrLf)
	}
	setTable(value) { this.table = value; return this } setKeyHV(value) { this.keyHV = value; return this } setHV(value) { this.hv = value; return this }
	setInsHV(value) { this.ekHV.ins = value; return this } setUpdHV(value) { this.ekHV.upd = value; return this }
	setOperator(value) { this.operator = value; return this } asEkle() { return this.setOperator('+') } asCikar() { return this.setOperator('-') } asCikart() { return this.asCikar() }
}
