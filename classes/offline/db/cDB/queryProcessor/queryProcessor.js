class CDB_QueryProcessor extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this } get queryProcessormu() { return true }
	get sortedActions() { return this.sortActions().actions } get handlers() { return this.buildHandlers()._handlers }
	constructor(e) { e = e ?? {}; super(e); $.extend(this, { root: e.root ?? this, actions: e.actions ?? [] }); this.parent = e.parent ?? this.root }
	run(e) {
		e = e || {}; const processor = e.processor = this, {handlers} = this; let result;
		for (const handler of handlers) { result = e.result = getFuncValue.call(this, handler, e) }
		return result
	}
	buildHandlers(e) {
		e = e || {}; const processor = e.processor ?? this, handlers = this._handlers = [], temps = {}, e = { ...e, processor, handlers, temps };
		for (const action of actions) { action.buildHandlers(e) } return this
	}
	addAction(item) { const {root} = this, parent = this; $.extend(item, { root, parent }); this.actions.push(item); this._sorted = false; return this }
	removeAction(item) { const {actions} = this, ind = actions.indexOf(item); if (ind ?? -1 > -1) { actions.splice(index, 1); this._sorted = false } return this }
	clearActions() { this.actions.splice(); this._sorted = false; return this }
	sortActions() { if (!this._sorted) { this.actions.sort((a, b => a.oncelik < b.oncelik ? -1 : a.oncelik > b.oncelik ? 1 : 0)); this._sorted = true } return this }
	clearHandlers() { delete this._handlers; return this }
}

class CDB_QueryAction extends CDB_QueryProcessor {
	static { window[this.name] = this; this._key2Class[this.name] = this } get queryProcessormu() { return false } get queryActionmi() { return true } get oncelik() { return 0 }
	static get araSeviyemi() { return this == CDB_QueryAction } static get tip() { return null } static get kod() { return this.tip } static get aciklama() { return this.kod }
	static get tip2Sinif() {
		let result = this._tip2Sinif; if (result == null) {
			result = {}; const {subClasses} = this; for (const cls of subClasses) { const {araSeviyemi, tip} = cls; if (!araSeviyemi && tip) { result[tip] = cls } }
			this._tip2Sinif = result
		}
		return result
   }
	constructor(e) { e = e ?? {}; super(e); $.extend(this, { handlers: e.handlers ?? [] }) }
	static getClass(e) { const tip = typeof e == 'object' ? e.tip : e; return this.tip2Sinif[tip] }
	static newFor(e) { if (typeof e != 'object') { e = { tip: e } } const cls = this.getClass(e); return cls ? new cls(e) : null }
	buildHandlers(e) { }
	addHandler(handler) { this.handlers.push(handler); return this }
	removeHandler(handler) { const {handlers} = this, ind = handlers.indexOf(handler); if (ind ?? -1 > -1) { handlers.splice(index, 1) } return this }
	clearHandlers() { this.handlers.splice(); return this }
}
class CDB_QueryAction_From extends CDB_QueryAction {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'from' } get oncelik() { return 100 }
	get db() { return this.table?.db } get dbMgr() { return this.db?.dbMgr }
	constructor(e) { e = e ?? {}; super(e); $.extend(this, { table: e.table }) }
	buildHandlers(e) {
		super.buildHandlers(e); this.addHandler(e => {
			const {temps} = e, {table: primaryTable} = this, tables = [primaryTable], {data} = primaryTable.shadow;
			const table2Data = temps.table2Data ?? {}; table2Data[primaryTable.name] = data; $.extend(temps, { tables, table2Data })
		})
	}
	super_buildHandlers(e) { super.buildHandlers(e) }
	setTable(value) { this.table = value; return this }
}
class CDB_QueryAction_FromIliski extends CDB_QueryAction_From {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'fromIliski' } get oncelik() { return 200 }
	constructor(e) { e = e ?? {}; super(e); $.extend(this, { table: e.table }) }
	buildHandlers(e) {
		super.super_buildHandlers(e); this.addHandler(e => {
			const {parent} = this; if (!parent) { return } const {temps} = e, {tables} = temps;
			const table2Data = temps.table2Data ?? {}; for (const table of tables) { table2Data[table.name] = table.shadow.data }
			$.extend(temps, { tables, table2Data })
		})
	}
}
class CDB_QueryAction_Select extends CDB_QueryAction {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'select' } get oncelik() { return 1000 }
	constructor(e) { e = e ?? {}; super(e); $.extend(this, { fields: e.fields }) }
	buildHandlers(e) {
		super.buildHandlers(e); this.addHandler(e => {
			const {temps} = e, {tables, table2Data} = temps, {fields} = this;
			let result = [], i = 0, filter = fields ? (_rec => { let rec = {}; for (const key of fields) { rec[key] = _rec[key] } return rec }) : rec;
			const primaryTable = tables[0], primaryData = table2Data[primaryTable.name], table2JoinData = { ...table2Data }; delete table2JoinData[primaryTable.name];
			for (let [rowid, priRec] of primaryData) {
				let rec;
				if ($.isEmptyObject(table2JoinData)) { rec = { rowid, ...filter(priRec) } }
				else {
					for (const joinData of Object.values(table2JoinData)) {
						for (const joinRec of joinData.values()) {
							/* index veya whereAction ile filtreleme yap veya table2JoinData kadar rec döner */
							rec = { rowid, ...filter(priRec), ...filter(joinData) }
						}
					}
				}
				if (rec) { result.push(rec) } i++
			}
			return result
		})
	}
	setTable(value) { this.table = value; return this }
}
