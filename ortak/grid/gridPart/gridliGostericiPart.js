class GridliGostericiPart extends GridPart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get wndClassNames() { return $.merge(['gridliGosterici'], super.wndClassNames || []) }

	constructor(e) { super(e); e = e || {}; }
	gridArgsDuzenleDevam(e) { super.gridArgsDuzenleDevam(e); const {args} = e; $.extend(args, { editable: false /* enableBrowserSelection: true */ }) }
}
