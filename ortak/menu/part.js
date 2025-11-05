class MenuPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'menu' } static get isSubPart() { return true } static get delimMenuId() { return ' ' }
	get filter() {
		let result = this._filter; if (result && $.isFunction(result)) { let _e = { sender: this }; result = getFuncValue.call(this, result, _e) }
		if (result === undefined) { result = this.getFilter() }
		return result
	}
	set filter(value) { this._filter = value }
	get source() {
		let result = this._source; if (result && $.isFunction(result)) { let _e = { sender: this }; result = getFuncValue.call(this, result, _e) }
		return result
	}
	set source(value) { this._source = value }
	get parentItem() {
		let result = this._parentItem; if (result && $.isFunction(result)) { let _e = { sender: this }; result = getFuncValue.call(this, result, _e) }
		return result
	}
	set parentItem(value) { this._parentItem = value }
	get visibleItems() {
		let result = this._visibleItems;
		if (result && $.isFunction(result)) { let _e = { sender: this }; result = getFuncValue.call(this, result, _e) }
		if (result === undefined) { result = this.getVisibleItems() }
		return result
	}
	set visibleItems(value) { this._visibleItems = value }
	get userData() {
		let result = this._userData; if (result && $.isFunction(result)) { let _e = { sender: this }; result = getFuncValue.call(this, result, _e) }
		return result
	}
	set userData(value) { this._userData = value }

	constructor(e) { e = e || {}; super(e); $.extend(this, { _filter: e.filter, _source: e.source, _parentItem: e.parentItem, _visibleItems: e.visibleItems, _userData: e.userData }) }
	runDevam(e) {
		e = e || {}; super.runDevam(e); let {layout} = this;
		layout.addClass(`${this.class.partName} part`);
		let menuParent = this.menuParent = layout.find('.menu-parent');
		$.extend(this, {
			nav: menuParent.find('.nav'),
			itemsParent: menuParent.find('.items-parent'),
			hizliBulPart: new ModelKullanPart({
				sender: this, autoBind: true, width: '100%', height: 80, layout: layout.find('.hizliBul'), kodSaha: 'mneText', adiSaha: 'text',
				listeArgsDuzenle: e => { $.extend(e.args, { showGroupsHeader: false }) },
				argsDuzenleBlock: e => { $.extend(e.args, { itemHeight: false, autoDropDownHeight: false, dropDownHeight: 350 }) },
				source: e => {
					e = e || {}; let {sender, value} = e, savedFilter = this.filter;
					let filter = value ? value.split(' ').filter(x => !!x) : null; let result = this.source;
					if (result && $.isFunction(result)) { e.sender = this; result = getFuncValue.call(this, result, e) }
					if (result && result.id2Item) { result = Object.values(result.id2Item || {}) }
					if (result) {
						for (let item of result) { if (item.group == null) { item.group = item.parentItem ? item.parentItem.text : ' ' } }
						let _e = { filter, kosul: e => e.item.choicemi }; result = result.filter(item => item.uygunmu(_e))
					}
					if (sender?.isGridPart) { result = result.map(menuItem => { return { kod: menuItem.id, aciklama: menuItem.text, disabled: menuItem.isDisabled } }) }
					return result
				},
				degisince: e => {
					let {sender, sender: { widget } = {}, item, value} = e
					setTimeout(() => {
						if (widget && widget.isOpened())
							widget.close()
					}, 1)
					/*if (document.activeElement == widget.input[0]) widget.input.select();*/
					let islemBlock = (item = {}) => {
						let {mneText: kod = item.kod} = item
						sender.val(kod || '')
						if (!item) 
							return
						if ($.isPlainObject(item)) {
							let {mne2Item, id2Item} = this.source
							item = mne2Item[kod] ?? id2Item[kod]
						}
						if (item?.cascademi && this.parentItem != item) {
							this.parentItem = item
							this.tazele()
						}
						else if (item?.choicemi) {
							try { item.run({ ...e, menuItemElement: item }) }
							catch (ex) { hConfirm(getErrorText(ex), item.text); throw ex }
						}
					};
					if (item) {
						islemBlock(item)
						return
					}
					if (value) {
						if (value?.endsWith?.('-'))
							value = value.slice(0, -1)
						let {source: recs} = this
						if (recs && isFunction(recs)) {
							e.sender = this
							recs = recs.call(this, e)
						}
						if (recs) {
							let item = recs.mne2Item[value.toLocaleUpperCase(culture)]
							islemBlock(item)
							return
						}
					}
				}
			}).comboBox().noAutoWidth().noAutoGetSelectedItem()
		});
		let {hizliBulPart, itemsParent} = this
		hizliBulPart.run(); let {widget: { input } = {}} = hizliBulPart
		input?.on('focus', evt =>
			hizliBulPart.val('', true))
		this.tazele(e)
	}
	destroyPart(e) {
		super.destroyPart(e); let {layout} = this; if (layout?.length) { layout.children().remove() }
		this.layout = this._source = this.parentItem = this.visibleItems = null;
		return this
	}
	tazele(e) {
		let {hizliBulPart} = this;
		if (hizliBulPart?.widget && !hizliBulPart.isDestroyed) { let {parentItem} = this, mneText = parentItem ? parentItem.mneText : ''; hizliBulPart.val(mneText) }
		return this.tazeleDevam(e)
	}
	async tazeleDevam(e) {
		let docFrgKeys = ['nav', 'itemsParent'], docFrg = {}; for (let key of docFrgKeys) { docFrg[key] = $(document.createDocumentFragment()) }
		let {visibleItems} = this, parentItems = [];
		let _parentItem = this.parentItem; if (_parentItem) {
			do { parentItems.push(_parentItem); _parentItem = _parentItem.parentItem } while (_parentItem);
			parentItems.reverse()
		}
		parentItems.unshift(visibleItems);
		if (parentItems.length > 1) {
			for (let i = 0; i < parentItems.length; i++) {
				if (i) { let elmSep = $(`<span class="nav-separator">&gt;</span>`); elmSep.appendTo(docFrg.nav) }
				let parentItem = parentItems[i], anaMenumu = $.isArray(parentItem), text = anaMenumu ? '[ Ana Menü ]' : parentItem.text;
				let elmItem = $(`<a class="nav-item" onclick="void(0)">${text}</a>`);
				let isCurrentItem = (i == parentItems.length - 1); if (isCurrentItem) { elmItem.addClass('disabled') }
				elmItem.appendTo(docFrg.nav); elmItem.data('item', parentItem);
				if (!isCurrentItem) {
					elmItem.on('click', evt => {
						let parentItem = $(evt.currentTarget).data('item'), anaMenumu = !parentItem || $.isArray(parentItem);
						if (anaMenumu || (parentItem && this.parentItem != parentItem)) { this.parentItem = anaMenumu ? null : parentItem; this.tazele() }
					})
				}
			}
		}
		let parentId2Items = {}, parentId2ParentItem = {};
		for (let item of visibleItems) {
			let {parentItem} = item, parentId = parentItem ? parentItem.id : '';
			(parentId2Items[parentId] = parentId2Items[parentId] || []).push(item);
			if (parentId) { parentId2ParentItem[parentId] = parentItem }
		}
		// let parentIDSize = Object.keys(parentId2Items).length;
		for (let parentId in parentId2Items) {
			let parentItem = parentId2ParentItem[parentId], parentItemText = parentItem ? parentItem.text : '';
			$(`<div class="menu-header">${parentItemText}</div>`).appendTo(docFrg.itemsParent);
			let elmItems = $(`<div class="items"></div>`); elmItems.appendTo(docFrg.itemsParent); makeScrollable(elmItems);
			let items = parentId2Items[parentId]; for (let item of items) {
				let {id, mnemonic, text, parentIDListe} = item;
				let parentIdStr = parentIDListe ? parentIDListe.join(this.class.delimMenuId) : '';
				let elmItem = $(`<button class="item" data-id="${id}" data-mnemonic="${mnemonic}" data-parentid="${parentIdStr}">${text}</button>`);
				elmItem.jqxButton({ theme, disabled: !!item.isDisabled }); elmItem.data('item', item);
				if (item.choicemi) { elmItem.addClass('menu-choice') } else if (item.cascademi) { elmItem.addClass('menu-cascade') }
				elmItem.appendTo(elmItems); elmItem.on('click', evt => {
					this.itemsParent.find('.item').removeClass('selected'); let elm = $(evt.currentTarget), item = elm.data('item');
					if (item) {
						setTimeout(() => elm.addClass('selected'));
						if (item.cascademi) { if (this.parentItem != item) { this.parentItem = item; this.tazele() } }
						else if (item.choicemi) { try { item.run({ ...e, event: evt, menuItemElement: item }) } catch (ex) { hConfirm(getErrorText(ex), item.text); throw ex } }
					}
				})
			}
		}
		for (let key in docFrg) { let parent = this[key]; parent.children().remove(); docFrg[key].appendTo(parent) }
	}
	getVisibleItems() {
		let {parentItem} = this; if (!parentItem) { parentItem = this.source } if (!parentItem) { return null }
		let items = parentItem.items ?? parentItem, result = [];
		if (items) { let {filter} = this; for (let item of items) { if (item.uygunmu({ filter })) { result.push(item) } } }
		return result
	}
	getFilter() {
		let {hizliBulPart} = this; if (!hizliBulPart?.widget || hizliBulPart.isDestroyed) { return null }
		let text = hizliBulPart.input.value; return text ? text.split(' ').filter(x => !!x) : null
	}
	*[Symbol.iterator]() {
		for (let item of this.getVisibleItems()) { yield item }
	}
}
