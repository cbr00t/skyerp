class MQStm extends MQDbCommand {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			with: ($.isPlainObject(e.with) ? new MQWith(e.with) : e.with) || new MQWith(),
			sent: ($.isPlainObject(e.sent) ? new MQSent(e.sent) : e.sent) || new MQSent(),
			orderBy: (($.isArray(e.orderBy) || $.isPlainObject(e.orderBy) || typeof e.orderBy == 'string' ? new MQOrderByClause(e.orderBy) : e.orderBy)) || new MQOrderByClause(),
			limit: e.limit, offset: e.offset
		})
	}
	asToplamStm(e) { return this.sent.asToplamStm(e) } asToplamStmWithOrderBy(e) { return this.sent.asToplamStmWithOrderBy(e) }
	fromGridWSArgs(e) {
		e = e || {}; for (const sent of this.getSentListe()) { sent.fromGridWSArgs(e) }
		this.orderBy.fromGridWSArgs(e);
		let pageNum = e.pagenum || e.pageNum || e.pageIndex || 0, pageSize = e.pagesize || e.pageSize;
		if (pageNum != null && pageSize && !asBool(e.rowCountOnly)) {
			const offset /*= this.offset*/ = (e.recordstartindex ?? e.recordStartIndex ?? e.startindex ?? e.startIndex ?? pageNum * pageSize);
			let limit /*= this.limit*/ = offset == null ? null : (pageSize || 0); if (limit != null) { limit += 5 }
			const top = limit == null ? null : (offset || 0) + limit;
			this.limit = top == null ? null : top * 2;
			if (top != null && this.top == null) { this.top = top }
		}
	}
	getSentListe(e) { return this.sent.getSentListe(e) }
	sentDo(e) { return this.sent.sentDo(e) }
	unionAllYap() { return (this.sent = new MQUnionAll([this.sent])) }
	buildString(e) {
		super.buildString(e); const {sent} = this;
		for (const key of ['offset', 'limit', 'top']) {
			const value = this[key]; if (value == null) { continue }
			for (const sent of this.getSentListe()) { sent[key] = value }
		}
		const sentStr = sent.toString(); if (!sentStr) { return }
		let value = this.with.toString(); if (value) { e.result += value }
		e.result += `${CrLf}${sentStr}`;
		value = this.orderBy.toString(); if (value) { e.result += `${CrLf}${value}` }
		const {sqlitemi} = window?.app ?? {}; if (sqlitemi) {
			let {top, offset} = this, limit = top ?? this.limit;
			if (limit != null) { e.result += ` LIMIT ${limit}` }
			if (offset != null) { e.result += ` OFFSET ${offset}` }
		}
	}
}
class MQTmpTable extends MQDbCommand {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e);
		if ($.isArray(e)) { e = { sahalar: e } } else if (typeof e != 'object') { e = { sahalar: [e] } }
		this.sahalar = []; const _liste = e.sahalar || e.liste; if (!$.isEmptyObject(_liste)) { this.addAll(_liste) }
		$.extend(this, { table: e.table, sent: ($.isPlainObject(e.sent) ? new MQSent(e.sent) : e.sent ) || new MQSent() })
	}
	add(e) { if (e || (typeof e == 'number')) { this.sahalar.push(e) } return this }
	addAll(coll) {
		const _liste = coll ? (coll.sahalar || coll.liste) : null; if (_liste) { coll = _liste }
		if ($.isPlainObject(coll) && !$.isArray(coll)) { coll = Object.keys(coll) }
		if (!$.isArray(coll)) { coll = arguments }
		for (const item of coll) { this.add(item) }
		return this
	}
	buildString(e) {
		super.buildString(e); const sahalarClause = this.sahalar.map(item => item.toString()).join(', ');
		e.result += `${this.table} (${sahalarClause})${CrLf} AS (${this.sent.toString()})`
	}
}
