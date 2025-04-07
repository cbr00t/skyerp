class Hareketci_UniBilgi extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ortakArgs() {
		let {_ortakArgs: result} = this;
		if (result == null) { result = this._ortakArgs = { sqlNull: 'NULL', sqlEmpty: `''`, sqlZero: '0' } }
		return result
	}
	get sent() {
		let result = this._sent, sender = this, {temps} = this;
		if (result === undefined) { let e = { sent: new MQSent(), temps }; this.sentDuzenle(e); result = this._sent = e.sent }
		if (isFunction(result)) { result = this._sent = getFuncValue.call(this, result, { sender, temps }) };
		return result
	}
	set sent(value) { this._sent = value }
	get hv() {
		let result = this._hv, sender = this, {temps} = this;
		if (result === undefined) { let e = { hv: {}, temps }; this.hvDuzenle(e); result = this._hv = e.hv }
		if (isFunction(result)) { result = this._hv = getFuncValue.call(this, result, { sender, temps }) };
		return result
	}
	set hv(value) { this._hv = value }

	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			sent: e.sent, hv: e.hv, sentDuzenleyici: e.sentDuzenle ?? e.sentDuzenleyici,
			hvDuzenleyici: e.hvDuzenle ?? e.hvDuzenleyici, temps: e.temps ?? {}
		})
	}
	sentDuzenle(e) {
		let {sentDuzenleyici: handler} = this, {ortakArgs} = this.class, {sent} = e;
		if (handler) { let _e = { ...e, sender: this, sent, ...ortakArgs }; getFuncValue.call(this, handler, _e); sent = this.sent = _e.sent }
		return this
	}
	hvDuzenle(e) {
		let {hvDuzenleyici: handler} = this, {ortakArgs} = this.class, {hv} = e;
		if (handler) { let _e = { ...e, sender: this, hv, ...ortakArgs }; getFuncValue.call(this, handler, _e); hv = this.hv = _e.hv }
		return this
	}
	setSent(value) { this.sent = value; return this } setHV(value) { this.hv = value; return this }
	sentDuzenleIslemi(value) { this.sentDuzenleyici = value; return this }
	hvDuzenleIslemi(value) { this.hvDuzenleyici = value; return this }
}
class Hareketci_MstYapi extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tableAlias() { return 'mst' } static get aliasVeNokta() { return [this.tableAlias, ''].join('.') }
	constructor(e) {
		e = e ?? {}; super(e);
		$.extend(this, { hvAlias: e.hvAlias, hvAdiAlias: e.hvAdiAlias, duzenleyici: e.duzenleyici })
	}
	duzenle(e) {  /* e: { sent, wh } */
		let {duzenleyici: handler} = this; if (!handler) { return this }
		let {sent, where: wh} = e; wh = wh ?? e.wh ?? sent?.where;
		let {tableAlias: mstAlias, aliasVeNokta: mstAliasVeNokta} = this.class;
		let {kod, hvAlias} = this, mstAdiAlias = 'mstadi';
		let _e = { ...e, sent, wh, kod, hvAlias, mstAlias, mstAdiAlias, mstAliasVeNokta }; delete _e.where;
		if (_e.mstKodClause && !_e.kodClause) { _e.kodClause = _e.mstKodClause; delete _e.mstKodClause }
		if (_e.mstAdiClause && !_e.adiClause) { _e.adiClause = _e.mstAdiClause; delete _e.mstAdiClause }
		getFuncValue.call(this, handler, _e);
		sent = _e.sent; wh = _e.where ?? sent?.where; $.extend(e, { sent, wh });
		return this
	}
	set(e, _duzenleyici) {
		e = typeof e == 'object' ? e : { hvAlias: e, duzenleyici: _duzenleyici };
		for (let key of ['hvAlias', 'hvAdiAlias', 'duzenleyici']) {
			let value = e[key];
			if (value !== undefined) { this[key] = e[key] }
		}
		return this
	}
	setHVAlias(value) { this.hvAlias = value; return this }
	setHVAdiAlias(value) { this.hvAdiAlias = value; return this }
	setDuzenleyici(handler) { this.duzenleyici = handler; return this }
}
class DRapor_DuzenleyiciliKAYapi extends CKodVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e ?? {}; super(e);
		if ($.isArray(e)) { $.extend(this, { duzenleyici: e[2] }) }
		else { $.extend(this, { duzenleyici: e.duzenleyici ?? e.duzenle }) }
	}
	duzenle(e) {
		let {duzenleyici: handler} = this; if (!handler) { return this }
		let {sent, where: wh} = e; wh = wh ?? e.wh ?? sent?.where;
		let _e = { ...e, sent, wh }; delete _e.where;
		if (_e.mstKodClause && !_e.kodClause) { _e.kodClause = _e.mstKodClause; delete _e.mstKodClause }
		if (_e.mstAdiClause && !_e.adiClause) { _e.adiClause = _e.mstAdiClause; delete _e.mstAdiClause }
		getFuncValue.call(this, handler, _e);
		sent = _e.sent; wh = _e.where ?? sent?.where; $.extend(e, { sent, wh });
		return this
	}
	setKA(e, _aciklama) {
		let arraymi = $.isArray(e), objmi = !arraymi && typeof e == 'object', plainmi = !(isArray || isObject);
		$.extend(this, {
			kod: arraymi ? e[0] : objmi ? e.kod : e,
			aciklama: arraymi ? e[1] : objmi ? e.aciklama : _aciklama,
		});
		return this
	}
	setDuzenleyici(value) { this.duzenleyici = value; return this }
}
class DRapor_AltTipYapi extends DRapor_DuzenleyiciliKAYapi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get ortakmi() { return !this.target } get solmu() { return this.target == 'sol' } get sagmi() { return this.target == 'sag' }
	constructor(e) {
		e = e ?? {}; super(e);
		if ($.isArray(e)) { $.extend(this, { target: e[3] }) }
		else { $.extend(this, { target: e.target ?? e.yon }) }
	}
	ortak() { this.target = null; return this } sol() { this.target = 'sol'; return this } sag() { this.target = 'sag'; return this }
}
class DRapor_HarYapi extends DRapor_DuzenleyiciliKAYapi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get sinif() {
		let e = { harYapi: this };
		return getFuncValue.call(this, this._sinif, e)
	}
	set sinif(value) { this._sinif = value; this.sinifIcinFix() }
	constructor(e) {
		e = e ?? {}; super(e);
		if ($.isArray(e)) { $.extend(this, { sinif: e[2], duzenleyici: e[3] }) }
		else { $.extend(this, { _sinif: e.sinif, duzenleyici: e.duzenleyici ?? e.duzenle }) }
		this.sinifIcinFix()
	}
	sinifIcinFix(e) {
		let {sinif} = this; if (!sinif) { return this }
		$.extend(this, { kod: this.kod || sinif.kod, aciklama: this.aciklama || sinif.aciklama })
		return this
	}
	setSinif(value) { this.sinif = value; return this }
}
