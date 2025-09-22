class FRMenuItem extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar || [], 'parentItem', 'parentIDListe'] }
	static get tip() { return null } get cascademi() { return false } get choicemi() { return false }
	constructor(e) {
		super(e); e = e || {}; let mne = e.mnemonic ?? e.mne; if (mne) { mne = mne.toUpperCase() }
		this.mnemonic = mne; this.id = e.id; this.text = e.text; this.vioAdim = e.vioAdim;
		this.parentIDListe = e.parentIDListe || e.parentIDList; this.parentItem = e.parentItem;
		if (!this.id && this.mnemonic) { this.id = this.mnemonic }
		this.isDisabled = asBool(e.disabled ?? e.isDisabled)
	}
	static classFor(e) {
		const tip = typeof e == 'string' ? e : (e ? e.tip : null);
		const {subClasses} = this; return subClasses.find(cls => !cls.araSeviyemi && cls.tip == tip)
	}
	static from(obj) {
		if (!obj) { return null }
		const {tip} = obj; const cls = this.classFor(tip); if (!cls) { return null }
		const result = new cls(); return result.readFrom(obj) ? result : null
	}
	readFrom(obj) {
		if (!obj) { return false } let {mnemonic} = obj; if (mnemonic) { mnemonic = mnemonic.toUpperCase(); this.mnemonic = mnemonic }
		let {id} = obj; if (!id) { id = mnemonic } if (!id) { id = newGUID() } this.id = id;
		if (obj.text != null) { this.text = obj.text }
		return true
	}
	run(e) { let id = this.mnemonic || this.id; if (id && id[0] != '_') { app.lastMenuId = this.mneText } }
	menuSourceDuzenle(e) {
		const {frMenu} = e; frMenu.id2Item[this.id] = this; let mneListe = [], item = this;
		do {
			const mne = item.mnemonic;
			if (mne) { mneListe.unshift(mne.toLocaleUpperCase(culture)) }
			item = item.parentItem
		} while (item != null)
		const {mne2Item} = frMenu, mneText = mneListe.length ? mneListe.join('-') : null;
		if (mneText) { this.mneText = mneText; mne2Item[mneText] = this }
	}
	navLayoutOlustur(e) {
		const {parent} = e; if (!parent?.length) { return }
		const indent = e.indent = e.indent || 0, {id, text} = this, {tip, cascademi} = this.class;
		const li = e.item = $(`<li id="${id}" class="mb-2 ml-${indent}" data-tip="${tip}"><a class="btn btn-toggle d-inline-flex align-items-center rounded border-0 collapsed" href="#">${text}</a></li>`);
		if (this.isDisabled) { li.disabled = true; li.addClass('readOnly') }
		li.appendTo(parent);
		// li.children('a').on('click', evt =>
		li.on('click', evt => {
			evt.stopPropagation(); const {target} = evt, menuItemElement = target.tagName.toUpperCase() == 'LI' ? $(target) : $(target).parent('LI');
			try { this.run({ event: evt, menuItemElement }) }
			catch (ex) { hConfirm(getErrorText(ex), this.text); throw ex }
		})
	}
	uygunmu(e) {
		e = e || {}; let {kosul} = e; if (kosul && typeof kosul == 'string') { kosul = e.kosul = getFunc.call(this, kosul, e) }
		if (kosul) { const _e = $.extend({}, e, { item: this }); const uygunmu = getFuncValue.call(this, kosul, _e); if (!uygunmu) { return false } }
		let {filter} = e; if (filter && typeof filter == 'string') { filter = filter.split(' ').filter(x => !!x) }
		if (filter) {
			let filter2Uygunmu = this._filter2Uygunmu = this._filter2Uygunmu || {};
			let filterText = filter.join(' '); if (filterText.endsWith('-')) { filterText = filterText.slice(0, -1) }
			let result = filter2Uygunmu[filterText]; if (result !== undefined) { return result }
			const {id, text} = this; let {mneText} = this; let uygunmu = true;
			if (mneText) { mneText = mneText.toLocaleUpperCase(culture).trim() }
			if (mneText && mneText.endsWith('-')) { mneText = mneText.slice(0, -1) }
			for (let part of filter) {
				if (!part) { continue } if (part.endsWith('-')) { part = part.slice(0, -1) }
				const partUpper = part.toUpperCase(), partTRUpper = part.toLocaleUpperCase(culture);
				let _uygunmu = (id == part) || (mneText.startsWith(part)) || (mneText.startsWith(partTRUpper));
				if (!_uygunmu) { _uygunmu = (text.toUpperCase().includes(partUpper)) || (text.toLocaleUpperCase(culture).includes(partTRUpper)) }
				if (!_uygunmu) { uygunmu = false; break }
			}
			filter2Uygunmu[filterText] = uygunmu; return uygunmu
		}
		return true
	}
	kisitIcinUygunmu(e) {
		e = e || {}; const {vioAdim} = this;
		if (vioAdim) { const rolYapi = e.rolYapi ?? config.session?.rol; if (rolYapi) { return rolYapi.menuAdimUygunmu(this) } }
		return true
	}
	*[Symbol.iterator]() {
		yield this
	}
}
class FRMenuCascade extends FRMenuItem {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'cascade' } get cascademi() { return true }
	constructor(e) { super(e); e = e || {}; this.items = e.items || []; this.id2Item = e.id2Item }
	readFrom(obj) {
		if (!super.readFrom(obj)) { return false }
		const _items = obj.items; if (_items) {
			const items = []; for (const _item of _items) { const item = _item ? FRMenuItem.from(_item) : null; if (item) { items.push(item) } }
			this.items = items
		}
		return true
	}
	navLayoutOlustur(e) {
		super.navLayoutOlustur(e); const parent = e.item || e.parent; if (!parent?.length) { return }
		const {isDisabled, items} = this; if (isDisabled) { parent.prop('disabled', ''); parent.addClass('readOnly') }
		if (items?.length) {
			let a = parent.children('a'); if (!a.length) { a = parent }
			parent.addClass('dropright'); a.addClass('dropdown-toggle');
			let _parent = $('<ul class="btn-toggle-nav list-unstyled fw-normal pb-1"/>');
			const _e = $.extend({}, e, { parent: _parent, indent: e.indent || 0 });
			for (const subItem of this.items || []) { _e.indent++; subItem.navLayoutOlustur(_e); _e.indent-- }
			_parent = $('<div class="collapse"/>'); _e.parent.appendTo(_parent); _parent.appendTo(parent);
			a.parent('LI').on('click', evt => {
				evt.stopPropagation(); const {target} = evt;
				const menuItemElement = target.tagName.toUpperCase() == 'LI' ? $(target) : $(target).parent('LI'); menuItemElement.toggleClass('dropright');
				for (const elm of [menuItemElement, menuItemElement.children('A')]) { elm.toggleClass('expanded') }
				menuItemElement.children('.collapse').toggleClass('show')
			})
		}
	}
	menuSourceDuzenle(e) {
		e = e || {}; super.menuSourceDuzenle(e);
		const {items} = this; if ($.isEmptyObject(items)) { return }
		const {frMenu} = e, id2Item = this.id2Item = {};
		for (const item of items) {
			item.parentItem = this;
			const parentIDListe = item.parentIDListe = []; const _parentIDListe = this.parentIDListe; if (_parentIDListe && _parentIDListe.length) { parentIDListe.push(..._parentIDListe) }
			const {id} = this; parentIDListe.push(id); item.menuSourceDuzenle(e); id2Item[id] = item
		}
	}
	*[Symbol.iterator]() {
		super[Symbol.iterator](); let {items} = this
		for (let item of items) { for (let subItem of item) { yield subItem } }
	}
}
class FRMenuChoice extends FRMenuItem {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tip() { return 'choice' } get choicemi() { return true }
	get block() { let result = this._block; if (result && typeof result == 'string') { result = this._block = getFunc.call(this, result) } return result }
	set block(value) { this._block = value }

	constructor(e) { super(e); e = e || {}; this.block = e.block }
	readFrom(obj) {
		if (!super.readFrom(obj)) { return false }
		if (obj.block) { this.block = obj.block }
		return true
	}
	run(e) {
		const {block, isDisabled} = this; if (!block || isDisabled) { return null } super.run(e);
		const {mainNav} = app; if (mainNav?.length && mainNav.hasClass('jqx-responsive-panel')) { mainNav.jqxResponsivePanel('close') }
		if (!this.kisitIcinUygunmu(e)) {
			const id = this.mnemonic || this.id, {text} = this;
			const errorText = `<b><span class="darkgray">${id}</span>-<span class="royalblue">${text}</span><span class="firebrick"> adımına giriş yetkiniz yok</span></b>`;
			throw { isError: true, errorText }
		}
		const result =  getFuncValue.call(this, block, e);
		setTimeout(() => { const hizliBulPart = app?.frMenu?.part?.hizliBulPart; if (hizliBulPart?.focus) { hizliBulPart.focus() } }, 10)
		return result
	}
}
