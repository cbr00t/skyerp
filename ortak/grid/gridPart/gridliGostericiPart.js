class GridliGostericiPart extends GridPart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get wndClassNames() { return ['gridliGosterici', ...super.wndClassNames] }
	gridArgsDuzenleDevam({ args }) {
		super.gridArgsDuzenleDevam(...arguments);
		$.extend(args, { editable: false /* enableBrowserSelection: true */ })
	}
}
