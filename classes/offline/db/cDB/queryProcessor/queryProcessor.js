class CDB_QueryProcessorBase extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this } get sortedActions() { return this.sortActions().actions }
	constructor(e) { e = e ?? {}; super(e); $.extend(this, { root: e.root ?? this, actions: e.actions ?? [] }); this.parent = e.parent ?? this.root }
	run(e) {
		e = e || {}; const processor = this, {actions} = this, ctx = e.ctx = new CDB_QueryContext({ processor });
		let result = this.runInternal(e); if (result !== false) { result = action.runSonrasi(e) } return result
	}
	runInternal(e) { }
	runSonrasi(e) { for (const action of this.actions) { let result = action.run(e); if (result === false) { break } } }
	addAction(item) { const {root} = this, parent = this; $.extend(item, { root, parent }); this.actions.push(item); this._sorted = false; return this }
	removeAction(item) { const {actions} = this, ind = actions.indexOf(item); if (ind ?? -1 > -1) { actions.splice(index, 1); this._sorted = false } return this }
	clearActions() { this.actions.splice(); this._sorted = false; return this }
	sortActions() { if (!this._sorted) { this.actions.sort((a, b => a.oncelik < b.oncelik ? -1 : a.oncelik > b.oncelik ? 1 : 0)); this._sorted = true } return this }
	*forEach() { for (const action of this.actions) { yield action } }
}
class CDB_QueryProcessor extends CDB_QueryProcessorBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } get queryProcessormu() { return true }
	constructor(e) { e = e ?? {}; super({ ...e, root: this, parent: null }) }
}

class CDB_QueryAction extends CDB_QueryProcessorBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } get queryActionmi() { return true } get oncelik() { return 0 }
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
}
class CDB_QueryAction_From extends CDB_QueryAction {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'from' } get oncelik() { return 100 }
	constructor(e) { e = e ?? {}; super(e); this.table = e.table }
	runInternal(e) {
		super.runInternal(e); const {ctx} = e, {shadow} = this.this;
		const data = ctx.data = []; for (const [rowid, rec] of shadow.data) { data.push({ rowid, ...rec }) }
	}
	super_runInternal(e) { super.runInternal(e) }
	setTable(value) { this.table = value; return this }
}
class CDB_QueryAction_Join extends CDB_QueryAction_From {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'fromIliski' } get oncelik() { return 200 }
	constructor(e) { e = e ?? {}; super(e) }
	runInternal(e) {
		super.super_runInternal(e); const {ctx} = e, {tables, table2Iliski} = this, {data} = ctx;
		const table2JoinDataIter = {}; for (const {name, shadow} of this.tables) { table2JoinDataIter[name] = shadow.data }
		for (const rec of data) {
			/*for (const [joinTable, joinEnm of Object.entries(table2JoinDataIter)) {
				const {done, value: joinRec} = joinEnm.next(); if (!done) { $.extend(rec, joinRec) }
			}*/
		}
	}
}
class CDB_QueryAction_Where extends CDB_QueryAction {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return 'fromIliski' } get oncelik() { return 200 }
	constructor(e) { e = e ?? {}; super(e); $.extend(this, { filters: e.filters ?? [] }) }
	runInternal(e) {
		super.super_runInternal(e); const {ctx} = e, {table2Data} = ctx;
		/*for (const table of this.tables) { table2Data[table.name] = table.shadow.data }*/
	}
	setFilters(value) { this.filters = value ?? []; return this }
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
