class CDB_QueryContext extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/*get tables() { let result = this._tables; if (result === undefined) { result = this.tables = [] } return result } set tables(value) { this._tables = value }
	get table2Data() { let result = this._table2Data; if (result === undefined) { result = this.table2Data = {} } return result } set table2Data(value) { this._table2Data = value }*/
	constructor(e) { e = e ?? {}; super(e); for (const [key, value] of Object.entries(e)) { if (value !== undefined) { this[key] = value } } }
}
