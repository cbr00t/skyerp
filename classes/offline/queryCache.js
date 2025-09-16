class QueryCache extends MQLocalTable {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultName() { return 'query-cache' }
}
