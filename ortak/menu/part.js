class MenuPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'menu' } static get isSubPart() { return true } static get delimMenuId() { return ' ' }
	get filter() {
		let result = this._filter; if (result && $.isFunction(result)) { const _e = { sender: this }; result = getFuncValue.call(this, result, _e) }
		if (result === undefined) { result = this.getFilter() }
		return result
	}
	set filter(value) { this._filter = value }
	get source() {
		let result = this._source; if (result && $.isFunction(result)) { const _e = { sender: this }; result = getFuncValue.call(this, result, _e) }
		return result
	}
	set source(value) { this._source = value }
	get parentItem() {
		let result = this._parentItem; if (result && $.isFunction(result)) { const _e = { sender: this }; result = getFuncValue.call(this, result, _e) }
		return result
	}
	set parentItem(value) { this._parentItem = value }
	get visibleItems() {
		let result = this._visibleItems;
		if (result && $.isFunction(result)) { const _e = { sender: this }; result = getFuncValue.call(this, result, _e) }
		if (result === undefined) { result = this.getVisibleItems() }
		return result
	}
	set visibleItems(value) { this._visibleItems = value }
	get userData() {
		let result = this._userData; if (result && $.isFunction(result)) { const _e = { sender: this }; result = getFuncValue.call(this, result, _e) }
		return result
	}
	set userData(value) { this._userData = value }

	constructor(e) { e = e || {}; super(e); $.extend(this, { _filter: e.filter, _source: e.source, _parentItem: e.parentItem, _visibleItems: e.visibleItems, _userData: e.userData }) }
	runDevam(e) {
		e = e || {}; super.runDevam(e); const {layout} = this;
		layout.addClass(`${this.class.partName} part`);
		const menuParent = this.menuParent = layout.find('.menu-parent');
		$.extend(this, {
			nav: menuParent.find('.nav'),
			itemsParent: menuParent.find('.items-parent'),
			hizliBulPart: new ModelKullanPart({
				sender: this, autoBind: true, width: '100%', height: 80, layout: layout.find('.hizliBul'), kodSaha: 'mneText', adiSaha: 'text',
				listeArgsDuzenle: e => { $.extend(e.args, { showGroupsHeader: false }) },
				argsDuzenleBlock: e => { $.extend(e.args, { itemHeight: false, autoDropDownHeight: false, dropDownHeight: 350 }) },
				source: e => {
					e = e || {}; const {sender, value} = e, savedFilter = this.filter;
					const filter = value ? value.split(' ').filter(x => !!x) : null; let result = this.source;
					if (result && $.isFunction(result)) { e.sender = this; result = getFuncValue.call(this, result, e) }
					if (result && result.id2Item) { result = Object.values(result.id2Item || {}) }
					if (result) {
						for (const item of result) { if (item.group == null) { item.group = item.parentItem ? item.parentItem.text : ' ' } }
						const _e = { filter, kosul: e => e.item.choicemi }; result = result.filter(item => item.uygunmu(_e))
					}
					if (sender?.isGridPart) { result = result.map(menuItem => { return { kod: menuItem.id, aciklama: menuItem.text, disabled: menuItem.isDisabled } }) }
					return result
				},
				degisince: e => {
					const {sender, item} = e; let {value} = e, {widget} = sender;
					setTimeout(() => { if (widget && widget.isOpened()) widget.close() }, 1);
					/*if (document.activeElement == widget.input[0]) widget.input.select();*/
					const islemBlock = item => {
						const {mneText} = (item || {}); sender.val(mneText || ''); if (!item) { return }
						if ($.isPlainObject(item)) { item = this.source.mne2Item[item.mneText] }
						if (item?.cascademi && this.parentItem != item) { this.parentItem = item; this.tazele() }
						else if (item?.choicemi) {
							try { item.run({ ...e, menuItemElement: item }) }
							catch (ex) { hConfirm(getErrorText(ex), item.text); throw ex }
						}
					};
					if (item) { islemBlock(item); return }
					if (value) {
						if (value.endsWith('-')) { value = value.slice(0, -1) }
						const {source} = this; let recs = source; if (recs && $.isFunction(recs)) { e.sender = this; recs = getFuncValue.call(this, recs, e) }
						if (recs) { const item = recs.mne2Item[value.toLocaleUpperCase(culture)]; islemBlock(item); return }
					}
				}
			}).comboBox().noAutoWidth().noAutoGetSelectedItem()
		});
		const {hizliBulPart, itemsParent} = this; hizliBulPart.run();
		hizliBulPart.widget.input.on('focus', evt => hizliBulPart.val('', true)); this.tazele(e)
	}
	destroyPart(e) {
		super.destroyPart(e); const {layout} = this; if (layout?.length) { layout.children().remove() }
		this.layout = this._source = this.parentItem = this.visibleItems = null;
		return this
	}
	tazele(e) {
		const {hizliBulPart} = this;
		if (hizliBulPart?.widget && !hizliBulPart.isDestroyed) { const {parentItem} = this, mneText = parentItem ? parentItem.mneText : ''; hizliBulPart.val(mneText) }
		return this.tazeleDevam(e)
	}
	async tazeleDevam(e) {
		const docFrgKeys = ['nav', 'itemsParent'], docFrg = {}; for (const key of docFrgKeys) { docFrg[key] = $(document.createDocumentFragment()) }
		const {visibleItems} = this, parentItems = [];
		let _parentItem = this.parentItem; if (_parentItem) {
			do { parentItems.push(_parentItem); _parentItem = _parentItem.parentItem } while (_parentItem);
			parentItems.reverse()
		}
		parentItems.unshift(visibleItems);
		if (parentItems.length > 1) {
			for (let i = 0; i < parentItems.length; i++) {
				if (i) { const elmSep = $(`<span class="nav-separator">&gt;</span>`); elmSep.appendTo(docFrg.nav) }
				const parentItem = parentItems[i], anaMenumu = $.isArray(parentItem), text = anaMenumu ? '[ Ana Menü ]' : parentItem.text;
				const elmItem = $(`<a class="nav-item" onclick="void(0)">${text}</a>`);
				const isCurrentItem = (i == parentItems.length - 1); if (isCurrentItem) { elmItem.addClass('disabled') }
				elmItem.appendTo(docFrg.nav); elmItem.data('item', parentItem);
				if (!isCurrentItem) {
					elmItem.on('click', evt => {
						const parentItem = $(evt.currentTarget).data('item'), anaMenumu = !parentItem || $.isArray(parentItem);
						if (anaMenumu || (parentItem && this.parentItem != parentItem)) { this.parentItem = anaMenumu ? null : parentItem; this.tazele() }
					})
				}
			}
		}
		const parentId2Items = {}, parentId2ParentItem = {};
		for (const item of visibleItems) {
			const {parentItem} = item, parentId = parentItem ? parentItem.id : '';
			(parentId2Items[parentId] = parentId2Items[parentId] || []).push(item);
			if (parentId) { parentId2ParentItem[parentId] = parentItem }
		}
		// const parentIDSize = Object.keys(parentId2Items).length;
		for (const parentId in parentId2Items) {
			const parentItem = parentId2ParentItem[parentId], parentItemText = parentItem ? parentItem.text : '';
			$(`<div class="menu-header">${parentItemText}</div>`).appendTo(docFrg.itemsParent);
			const elmItems = $(`<div class="items"></div>`); elmItems.appendTo(docFrg.itemsParent); makeScrollable(elmItems);
			const items = parentId2Items[parentId]; for (const item of items) {
				const {id, mnemonic, text, parentIDListe} = item;
				const parentIdStr = parentIDListe ? parentIDListe.join(this.class.delimMenuId) : '';
				const elmItem = $(`<button class="item" data-id="${id}" data-mnemonic="${mnemonic}" data-parentid="${parentIdStr}">${text}</button>`);
				elmItem.jqxButton({ theme, disabled: !!item.isDisabled }); elmItem.data('item', item);
				if (item.choicemi) { elmItem.addClass('menu-choice') } else if (item.cascademi) { elmItem.addClass('menu-cascade') }
				elmItem.appendTo(elmItems); elmItem.on('click', evt => {
					this.itemsParent.find('.item').removeClass('selected'); const elm = $(evt.currentTarget), item = elm.data('item');
					if (item) {
						setTimeout(() => elm.addClass('selected'));
						if (item.cascademi) { if (this.parentItem != item) { this.parentItem = item; this.tazele() } }
						else if (item.choicemi) { try { item.run({ ...e, event: evt, menuItemElement: item }) } catch (ex) { hConfirm(getErrorText(ex), item.text); throw ex } }
					}
				})
			}
		}
		for (const key in docFrg) { const parent = this[key]; parent.children().remove(); docFrg[key].appendTo(parent) }
	}
	getVisibleItems() {
		let {parentItem} = this; if (!parentItem) { parentItem = this.source } if (!parentItem) { return null }
		const items = parentItem.items ?? parentItem, result = [];
		if (items) { const {filter} = this; for (const item of items) { if (item.uygunmu({ filter })) { result.push(item) } } }
		return result
	}
	getFilter() {
		const {hizliBulPart} = this; if (!hizliBulPart?.widget || hizliBulPart.isDestroyed) { return null }
		const text = hizliBulPart.input.value; return text ? text.split(' ').filter(x => !!x) : null
	}
	*[Symbol.iterator]() {
		for (let item of this.getVisibleItems()) { yield item }
	}
}
