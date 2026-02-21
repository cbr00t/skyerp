class FRMenu extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		super(e); e = e || {}; let _items = e.items?.items ?? e.items ?? e;
		if (_items && !$.isArray(_items)) { _items = Object.values(_items) }
		this.items = _items; this.id2Item = e.id2Item || {}; this.mne2Item = e.mne2Item ?? {}
	}
	static from(arr) {
		if (!arr) { return null }
		let result = new this(); return result.readFrom(arr) ? result : null
	}
	readFrom(arr) {
		if (!arr) { return false }
		let items = [], id2Item = {}, mne2Item = {};
		for (let _item of arr) {
			let item = _item ? FRMenuItem.from(_item) : null;
			if (item) { let {id} = item; id2Item[id] = item; items.push(item) }
		}
		this.items = items; this.id2Item = id2Item; this.mne2Item = mne2Item;
		return true
	}
	jqxMenuLayoutOlustur(e) {
		let {parent} = e; if (!parent?.length) { return false } let yataymi = e.yatay;
		parent.jqxMenu({
			theme, mode: yataymi ? 'horizontal' : 'vertical', animationShowDuration: 100, animationHideDuration: 100,
			autoOpen: true, autoOpenPopup: true, autoCloseOnClick: false, source: this.getJQXMenuSource()
		});
		parent.on('itemclick', evt => {
			let menuItemElement = evt.args, {id} = menuItemElement;
			let item = this.id2Item[id]; if (item) { item.run({ event: evt, menuItemElement }) }
		});
		return true
	}
	menuLayoutOlustur(e) {
		let {parent} = e; if (!parent?.length) { return false }
		this.menuSourceDuzenle(e); this.menuLayoutDuzenle(e); return true
	}
	menuLayoutDuzenle(e) {
		e = e || {}; let content = e.parent, sender = this, {parentPart} = this, _e = { ...e };
		let part = this.part = new MenuPart({ parentPart, sender, content, source: this.getMenuSource(_e) }); part.run()
	}
	navLayoutOlustur(e) {
		let {parent} = e
		if (!parent?.length)
			return
		let {items} = this, ul = $('<ul class="list-unstyled"/>'), _e = { ...e, parent: ul }
		for (let item of items)
			item.navLayoutOlustur(_e)
		this.navLayoutOlustur_araIslem(_e)
		parent.children().remove(); ul.appendTo(parent)
	}
	navLayoutOlustur_araIslem(e) {
		app?.navLayoutOlustur_araIslem?.(e)
	}
	getMenuSource(e) { this.menuSourceDuzenle(e); return this }
	menuSourceDuzenle(e) {
		e = e || {}; let {items} = this; if ($.isEmptyObject(items)) { return }
		e.frMenu = this; for (let item of items) { item.menuSourceDuzenle(e) }
	}
	static listeEkraniAc({ headerBuilder } = {}) {
		// let secince = e => console.info(e)
		let cls = class extends MQCogul {
			static get classKey() { return 'menu' } static get kodListeTipi() { return this.classKey }
			static get sinifAdi() { return 'Ana Menü' } static get tumKolonlarGosterilirmi() { return true }
			static orjBaslikListesi_gridInit({ sender: gridPart }) {
				super.orjBaslikListesi_gridInit(...arguments)
				gridPart.converter = ({ rec }) => app.frMenu.id2Item[rec.id]
			}
			static rootFormBuilderDuzenle_listeEkrani(e) {
				super.rootFormBuilderDuzenle_listeEkrani(e)
				headerBuilder?.call(this, e)
			}
			static orjBaslikListesi_argsDuzenle({ args }) {
				super.orjBaslikListesi_argsDuzenle(...arguments)
				$.extend(args, { showGroupsHeader: true, groupsExpandedByDefault: true })
			}
			static orjBaslikListesiDuzenle({ liste }) {
				super.orjBaslikListesiDuzenle(...arguments)
				liste.push(...[
					new GridKolon({ belirtec: 'id', text: 'Adım', genislikCh: 30 }),
					new GridKolon({ belirtec: 'label', text: 'Adı' }),
					new GridKolon({ belirtec: '_group', text: 'Üst', genislikCh: 30 })
				])
			}
			static loadServerDataDogrudan({ sender: { args } = {} }) {
				let {frMenu = app.frMenu} = args
				let {part: { hizliBulPart: { widget } }} = frMenu
				return widget.getItems()
					.filter(({ originalItem }) => originalItem?.choicemi)
					.map(({ originalItem: _, id, label, group: _group }) => ({ id: _?.id || _?.mne || id, label, _group }))
			}
			static gridVeriYuklendi({ sender: { grid, gridWidget } }) {
				grid.jqxGrid('groups', ['_group']); gridWidget.hidecolumn('_group')
			}
		}
		return cls.listeEkraniAc(...arguments)
	}
	listeEkraniAc(e) {
		let args = { frMenu: this }
		return this.class.listeEkraniAc({ ...e, args })
	}
	static listedenSec(e) { return new $.Deferred(p => this.listeEkraniAc({ ...e, secince: p.resolve })) }
	listedenSec(e) { return new $.Deferred(p => this.listeEkraniAc({ ...e, secince: p.resolve })) }
	*[Symbol.iterator]() {
		this.getMenuSource(); let {items} = this
		for (let item of items) {
			yield item
			for (let subItem of item) { yield subItem }
		}
	}
}
