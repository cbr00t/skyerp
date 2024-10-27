class MQDbCommand extends MQSQLOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class MQSentVeIliskiliYapiOrtak extends MQDbCommand {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	asToplamStm(e) {
		e = e || {}; const sumListe = e.sumListe ?? [], orderFlag = e.order ?? e.orderBy, tmpTabloVeAlias = e.tmpTabloVeAlias ?? e.tmpTableVeAlias, {liste} = this;
		let ilkSent; for (const sent of this.getSentListe()) { ilkSent = sent; break } if (!ilkSent) { return new MQStm() }
		const tmpTabloAdi = tmpTabloVeAlias?.deger ?? 'toplam', tmpAlias = tmpTabloVeAlias?.alias ?? 'xtop';		/* aMQAliasliYapi */
		const stm = new MQStm(), sahalarSet = {};
		for (const saha of ilkSent.sahalar.liste) {
			const {aliasVeyaDeger} = saha; if (!aliasVeyaDeger) { continue }
			sahalarSet[aliasVeyaDeger] = true
		}
		let sahalar = Object.keys(sahalarSet), toplanabilirSahalarSet = asSet(sumListe ?? []);
		for (const sent of this.getSentListe()) {
			for (const saha of sent.sahalar.liste) {
				const {deger} = saha; if (!deger) { continue }
				let uygunmu = false; for (const match of ['SUM(', 'COUNT(']) { if (deger.toUpperCase().startsWith(match) && deger.includes(')')) { uygunmu = true; break } }
				if (uygunmu) { toplanabilirSahalarSet[saha.aliasVeyaDeger] = true }
			}
		}
		sahalar = Object.keys(sahalarSet); const toplanabilirSahalar = Object.keys(toplanabilirSahalarSet), digerSahalar = sahalar.filter(saha => !toplanabilirSahalarSet[saha]);
		stm.with.add(new MQTmpTable({ table: tmpTabloAdi, sahalar, sent: this }));
		const asilSent = stm.sent; asilSent.fromAdd(`${tmpTabloAdi} ${tmpAlias}`); asilSent.sahalar.liste = [];
		for (const saha of digerSahalar) { asilSent.sahalar.add(`${tmpAlias}.${saha}`) }
		for (const saha of toplanabilirSahalar) { asilSent.sahalar.add(`SUM(${tmpAlias}.${saha}) ${saha}`) }
		asilSent.groupByOlustur(); if (orderFlag) { stm.orderBy.liste = []; stm.orderBy.addAll(digerSahalar) }
		return stm
	}
	asToplamStmWithOrderBy(e) { e = e || {}; e.order = true; delete e.orderBy; return this.asToplamStm(e) }
	*getSentListe(e) { yield this }
	sentDo(e) {
		e = e || {}; if (typeof e != 'object') e = { callback: e }
		e.callback.call(this, this, { item: this, index: 1, liste: [this] })
	}
}
class MQInsertBase extends MQDbCommand {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get onEk() { return `INSERT INTO ` }
	get isTableInsert() { return this.tableInsertFlag } get isDBWriteClause() { return true }
	constructor(e) {
		e = e || {}; super(e);
		let hvListe = e.hvListe || e.hv; if (hvListe && !$.isArray(hvListe)) { hvListe = [hvListe] }
		$.extend(this, { table: e.table, hvListe, tableInsertFlag: null });
	}
	buildString(e) {
		super.buildString(e);
		const {table, hvListe} = this; if (!table || $.isEmptyObject(hvListe)) { return }
		const {onEk} = this.class, ilkHV = hvListe[0], hvSize = hvListe.length;
			// SQL Bulk Insert (values ?? .. ??) için SQL tarafında en fazla 1000 kayıta kadar izin veriliyor
		let isTableInsert = hvSize > 1000 ? true : this.isTableInsert; if (isTableInsert == null) { isTableInsert = hvSize > 500 }
		e.result += `${onEk}${table} (`; e.result += Object.keys(ilkHV).join(','); e.result += ')';
		if (isTableInsert) { e.result += ' SELECT * FROM @dt'; e.params = [ { name: '@dt', type: 'structured', value: hvListe } ]; }
		else {
			e.result += ' VALUES ';
			for (let i = 0; i < hvSize; i++) {
				if (i != 0) { e.result += ',' }
				e.result += '('; const hv = hvListe[i]; let ilkDegermi = true;
				for (const key in hv) {
					if (ilkDegermi) { ilkDegermi = false } else { e.result += ',' }
					const value = hv[key]; e.result += MQSQLOrtak.sqlServerDegeri(value);
				}
				e.result += ')'
			}
		}
	}
};
class MQInsert extends MQInsertBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { e = e || {}; super(e); this.tableInsertFlag = asBoolQ(e.tableInsert); }
	tableInsert() { this.tableInsertFlag = true; return this }
	queryInsert() { this.tableInsertFlag = false; return this }
}
class MQTableInsert extends MQInsertBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get isTableInsert() { return true }
}
class MQQueryInsert extends MQInsertBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get isTableInsert() { return false }
}

