class MQIliskiliYapiOrtak extends MQSentVeIliskiliYapiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			from: ($.isArray(e.from) || $.isPlainObject(e.from) || typeof e.from == 'string' ? new MQFromClause(e.from) : e.from) || new MQFromClause(),
			where: ($.isArray(e.where) || $.isPlainObject(e.where) || typeof e.where == 'string' ? new MQWhereClause(e.where) : e.where) || new MQWhereClause(),
			zincirler: ($.isArray(e.zincirler) || $.isPlainObject(e.zincirler) ? new MQZincirler(e.zincirler) : e.zincirler) || new MQZincirler()
		})
	}
	fromAdd(e) {
		e = e || {}; if (typeof e != 'object') { e = { from: e } } else { e.from = e.from || e.fromText || e.table }
		let fromText = e.from; this.from.add(fromText);
		return this
	}
	innerJoin(e) {
		e = e || {}; let {alias} = e; const fromText = e.from || e.leftJoin || e.fromText || e.table;
		let iliskiDizi = e.on || e.iliskiDizi || e.iliskiText || e.iliski; if (iliskiDizi && !$.isArray(iliskiDizi)) { iliskiDizi = [iliskiDizi] }
		const xJoin = MQInnerJoin.newForFromText({ text: fromText, on: iliskiDizi });
		const tableYapi = this.from.aliasIcinTable(alias);
		if (!tableYapi) { debugger;
			throw { isError: true, rc: 'innerJoinTable', errorText: `Inner Join (<i class="bold lightgray">${fromText}</i>) için eklenmek istenen alias (<b class="red">${alias}</b>) bulunamadı` }
		}
		tableYapi.addLeftInner(xJoin);
		for (const iliskiText of iliskiDizi) {
			const iliski = MQIliskiYapisi.newForText(iliskiText);
			const {varsaZincir: zincir} = iliski; if (zincir) { this.zincirEkle(zincir) }
		}	
		return this
	}
	leftJoin(e) {
		e = e || {}; let {alias} = e; const fromText = e.from || e.leftJoin || e.fromText || e.table;
		let iliskiDizi = e.on || e.iliskiDizi || e.iliskiText || e.iliski; if (iliskiDizi && !$.isArray(iliskiDizi)) { iliskiDizi = [iliskiDizi] }
		const xJoin = MQLeftJoin.newForFromText({ text: fromText, on: iliskiDizi }), tableYapi = this.from.aliasIcinTable(alias);
		if (!tableYapi) { debugger;
			throw { isError: true, rc: 'leftJoinTable', errorText: `Left Join (<i class="bold lightgray">${fromText}</i>) için eklenmek istenen alias (<b class="red">${alias}</b>) bulunamadı` }
		}
		tableYapi.addLeftInner(xJoin);
		for (const iliskiText of iliskiDizi) {
			const iliski = MQIliskiYapisi.newForText(iliskiText);
			const {varsaZincir: zincir} = iliski; if (zincir) { this.zincirEkle(zincir) }
		}	
		return this
	}
	fromIliski(e, _iliskiDizi) {
		e = e || {}; if (typeof e != 'object') { e = { from: e } } else { e.from = e.from || e.fromText || e.table }
		let {from: fromText} = e; if (_iliskiDizi) { e.iliskiDizi = _iliskiDizi }
		let iliskiDizi = e.iliskiDizi || e.iliskiText || e.iliski; if (iliskiDizi && !$.isArray(iliskiDizi)) { iliskiDizi = [iliskiDizi] }
		const {from} = this; let lastTable = from.add(fromText);
		for (const iliskiText of iliskiDizi) {
			//	tablo atılırsa iliskinin de kalkması için table yapısında bırakıldı
			const iliski = MQIliskiYapisi.newForText(iliskiText); lastTable.addIliski(iliski);
			const {varsaZincir: zincir} = iliski; if (zincir) { this.zincirEkle(zincir) }
		}	
		return this
	}
	buildString(e) {
		super.buildString(e); const from = this.from, where = new MQWhereClause();
		this.from.iliskiler2Where({ where }); where.birlestir(this.where);
		e.result += this.class.onEk + ' '; from.buildString_baslangicsiz(e); this.buildString_ara(e);
		if (!$.isEmptyObject(where.liste)) { e.result += CrLf; where.buildString(e) }
	}
	buildString_ara(e) { }
}
class MQIliskiliUpdate extends MQIliskiliYapiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get onEk() { return 'UPDATE ' } get isDBWriteClause() { return true }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			set: ($.isArray(e.set) || $.isPlainObject(e.set) || typeof e.set == 'string' ? new MQSetClause(e.set) : e.set) || new MQSetClause() })
	}
	degerAta(e, _saha) { this.set.degerAta(e, _saha); return this }
	add(e) { return this.set.add(e) } addAll(e) { return this.set.addAll(e) }
	buildString_ara(e) { super.buildString_ara(e); e.result += CrLf; this.set.buildString(e) }
}
class MQIliskiliDelete extends MQIliskiliYapiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get onEk() { return 'DELETE FROM ' } get isDBWriteClause() { return true }
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
		let set = new MQSetClause(); if (operator) { for (let [key, value] of Object.entries(updHV)) { set.add(`${key} = ${key} ${operator} ${value.sqlServerDegeri()}`) } }
		else { set.birlestirDict(updHV) }
		let delim = ', ', keys = Object.keys(insHV), values = Object.values(insHV).map(value => MQSQLOrtak.sqlServerDegeri(value));
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
