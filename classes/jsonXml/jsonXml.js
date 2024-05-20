class JsonXml extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }

	get JsonXmlmi() { return true }
	
	constructor(e) {
		e = e || {};
		super(e);

		this.valueDict = e.valueDict;
		this.attributes = e.attributes;
		this.subNodes = e.subNodes
	}

	val(e, _value, _attributes) {
		e = e || {};
		const key = typeof e == 'object' ? e.key : e;
		const value = typeof e == 'object' ? e.value : _value;
		if (value === undefined)
			return (this.valueDict || {})[key]

		if (!this.valueDict)
			this.valueDict = {}
		this.valueDict[key] = value;
		
		const attributes = typeof e == 'object' ? e.attributes : _attributes;
		if (attributes) {
			if (!this.attributes)
				this.attributes = {}
			$.extend(this.attributes, attributes)
		}
		
		return this
	}

	addSub(e) {
		const {node} = e;
		if (!this.subNodes)
			this.subNodes = [];
		
		this.subNodes.push(node);
		return this
	}
}
