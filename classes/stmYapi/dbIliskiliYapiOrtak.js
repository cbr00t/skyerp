class MQIliskiliYapiOrtak extends MQSentVeIliskiliYapiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e = {}) {
		super(e)
		$.extend(this, {
			from: (isArray(e.from) || $.isPlainObject(e.from) || typeof e.from == 'string' ? new MQFromClause(e.from) : e.from) || new MQFromClause(),
			where: (isArray(e.where) || $.isPlainObject(e.where) || typeof e.where == 'string' ? new MQWhereClause(e.where) : e.where) || new MQWhereClause(),
			zincirler: (isArray(e.zincirler) || $.isPlainObject(e.zincirler) ? new MQZincirler(e.zincirler) : e.zincirler) || new MQZincirler()
		})
		let {fromIliskiler} = e
		if (!empty(fromIliskiler)) {
			for (let fromIliskiOrLeftJoin of fromIliskiler) {
				if (fromIliskiOrLeftJoin.leftJoin || fromIliskiOrLeftJoin.on)
					this.leftJoin(fromIliskiOrLeftJoin)
				else if (fromIliskiOrLeftJoin.outerJoin)
					this.outerJoin(fromIliskiOrLeftJoin)
				else if (fromIliskiOrLeftJoin.outerApply)
					this.outerApply(fromIliskiOrLeftJoin)
				else
					this.fromIliski(fromIliskiOrLeftJoin)
			}
		}
	}
	fromAdd(e) {
		e = e || {}; if (typeof e != 'object') { e = { from: e } } else { e.from = e.from || e.fromText || e.table }
		let fromText = e.from; this.from.add(fromText);
		return this
	}
	innerJoin(e = {}) {
		let {alias} = e
		let fromText = e.from || e.innerJoin || e.fromText || e.table
		let iliskiDizi = makeArray(e.on || e.iliskiDizi || e.iliskiText || e.iliski)
		let xJoin = MQInnerJoin.newForFromText({ text: fromText, on: iliskiDizi })
		let tableYapi = this.from.aliasIcinTable(alias)
		if (!tableYapi) {
			debugger
			throw { isError: true, rc: 'innerJoinTable', errorText: `Inner Join (<i class="bold lightgray">${fromText}</i>) için eklenmek istenen alias (<b class="red">${alias}</b>) bulunamadı` }
		}
		tableYapi.addLeftInner(xJoin)
		return this
	}
	leftJoin(e) {
		let {alias} = e
		let fromText = e.from || e.leftJoin || e.fromText || e.table
		let iliskiDizi = makeArray(e.on || e.iliskiDizi || e.iliskiText || e.iliski)
		let xJoin = MQLeftJoin.newForFromText({ text: fromText, on: iliskiDizi })
		let tableYapi = this.from.aliasIcinTable(alias)
		if (!tableYapi) {
			debugger
			throw { isError: true, rc: 'leftJoinTable', errorText: `Left Join (<i class="bold lightgray">${fromText}</i>) için eklenmek istenen alias (<b class="red">${alias}</b>) bulunamadı` }
		}
		tableYapi.addLeftInner(xJoin)
		return this
	}
	outerApply(e, _table, _liste) {
		if (!isObject(e))
			e = { alias: e, name: _name, liste: _liste }
		let {alias, name = e.outerApply ?? e.table ?? e.from, liste} = e
		liste = makeArray(liste)
		let outer = new MQOuterApply({ name, liste })
		let tableYapi = this.from.aliasIcinTable(alias)
		if (!tableYapi) {
			debugger
			throw { isError: true, rc: 'outerApplyTable', errorText: `Outer Apply (<i class="bold lightgray">${table}</i>) için eklenmek istenen alias (<b class="red">${alias}</b>) bulunamadı` }
		}
		tableYapi.addLeftInner(xJoin)
		return this
	}
	fromIliski(e, _iliskiDizi) {
		e = e || {}; if (typeof e != 'object') { e = { from: e } } else { e.from = e.from || e.fromText || e.table }
		let {from: fromText} = e; if (_iliskiDizi) { e.iliskiDizi = _iliskiDizi } let iliskiDizi = e.iliskiDizi || e.iliskiText || e.iliski;
		if (iliskiDizi && !isArray(iliskiDizi)) { iliskiDizi = [iliskiDizi] }
			// MQFromClause >> #add:
		let isOuter = false, {from} = this, lastTable = from.liste[from.liste.length - 1];
		if (lastTable && config?.alaSQLmi) { isOuter = true; lastTable.addLeftInner(MQOuterJoin.newForFromText({ text: fromText, on: iliskiDizi })) }
		else { from.add(fromText); lastTable = from.liste[from.liste.length - 1] }
		for (let iliskiText of iliskiDizi) {
			//	tablo atılırsa iliskinin de kalkması için table yapısında bırakıldı
			let iliski = MQIliskiYapisi.newForText(iliskiText); if (!isOuter) { lastTable.addIliski(iliski) }
		}
		return this
	}
	buildString(e) {
		super.buildString(e); let {onEk} = this.class, {from} = this, where = new MQWhereClause();
		from.iliskiler2Where({ where }); where.birlestir(this.where);
		e.result += `${onEk} `; if (from.liste.length > 1) { e.result += `${from.liste[0].aliasVeyaDeger} FROM ` }
		from.buildString_baslangicsiz(e); this.buildString_ara(e);
		if (!empty(where.liste)) { e.result += CrLf; where.buildString(e) }
	}
	buildString_ara(e) { }
}
class MQIliskiliUpdate extends MQIliskiliYapiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get onEk() { return 'UPDATE ' } get isDBWriteClause() { return true }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			set: (isArray(e.set) || $.isPlainObject(e.set) || typeof e.set == 'string' ? new MQSetClause(e.set) : e.set) || new MQSetClause() })
	}
	degerAta(e, _saha) { this.set.degerAta(e, _saha); return this }
	add(e) { return this.set.add(e) } addAll(e) { return this.set.addAll(e) }
	buildString_ara(e) { super.buildString_ara(e); e.result += CrLf; this.set.buildString(e) }
}
class MQIliskiliDelete extends MQIliskiliYapiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } get isDBWriteClause() { return true }
	static get onEk() { return 'DELETE FROM ' }
}
