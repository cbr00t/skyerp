class FRMenu extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		super(e); e = e || {};
		let _items = (e.items || {}).items || e.items || e;
		if (_items && !$.isArray(_items))
			_items = Object.values(_items)
		this.items = _items; this.id2Item = e.id2Item || {}; this.mne2Item = e.mne2Item || {}
	}

	static from(arr) {
		if (!arr) return null
		const result = new this();
		return result.readFrom(arr) ? result : null
	}
	readFrom(arr) {
		if (!arr) return false
		const items = [], id2Item = {}, mne2Item = {};
		for (const _item of arr) {
			const item = _item ? FRMenuItem.from(_item) : null;
			if (item) {
				const {id} = item; id2Item[id] = item;
				items.push(item)
			}
		}
		this.items = items; this.id2Item = id2Item; this.mne2Item = mne2Item;
		return true
	}
	jqxMenuLayoutOlustur(e) {
		const {parent} = e;
		if (!(parent && parent.length))
			return false
		const yataymi = e.yatay;
		parent.jqxMenu({
			theme: theme, mode: yataymi ? 'horizontal' : 'vertical',
			animationShowDuration: 100, animationHideDuration: 100,
			autoOpen: true, autoOpenPopup: true, autoCloseOnClick: false,
			source: this.getJQXMenuSource()
		});
		parent.on('itemclick', evt => {
			const menuItemElm = evt.args;
			const {id} = menuItemElm;
			const item = this.id2Item[id];
			if (item)
				item.run({ event: evt, menuItemElement: menuItemElm });
		})
		return true
	}
	menuLayoutOlustur(e) {
		const {parent} = e; if (!parent?.length) return false
		this.menuSourceDuzenle(e);
		this.menuLayoutDuzenle(e);
		return true
	}
	menuLayoutDuzenle(e) {
		e = e || {}; const {parent} = e, _e = $.extend({}, e);
		const part = this.part = new MenuPart({
			parentPart: this.parentPart, sender: this,
			content: e.parent,
			source: this.getMenuSource(_e)
		});
		part.run()
	}
	navLayoutOlustur(e) {
		const {parent} = e; if (!parent?.length) return
		const ul = $('<ul class="list-unstyled"/>'), _e = $.extend({}, e, { parent: ul }), {items} = this;
		for (const item of items)
			item.navLayoutOlustur(_e)
		this.navLayoutOlustur_araIslem(_e);
		parent.children().remove();
		ul.appendTo(parent)
	}
	navLayoutOlustur_araIslem(e) {
		if (app.navLayoutOlustur_araIslem)
			app.navLayoutOlustur_araIslem(e)
	}
	menuSourceDuzenle(e) {
		e = e || {}; const {items} = this; if ($.isEmptyObject(items)) return
		e.frMenu = this;
		for (const item of items)
			item.menuSourceDuzenle(e)
	}
	getMenuSource(e) { this.menuSourceDuzenle(e); return this }
}
