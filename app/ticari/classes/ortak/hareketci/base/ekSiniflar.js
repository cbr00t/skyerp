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
	sentDuzenle(e) {  /* e: { sent, wh } */
		e = e ?? {}; let {kod, hvAlias} = this, mstAdiAlias = 'mstadi', {tableAlias: mstAlias, aliasVeNokta: mstAliasVeNokta} = this.class;
		if (e.where && !e.wh) { e.wh = e.where; delete e.where }
		let args = { ...e, kod, hvAlias, mstAlias, mstAliasVeNokta, mstAdiAlias }; this.duzenleyici?.call(this, args);
		let {sent} = args; $.extend(e, { sent, wh: sent?.where });
		return this
	}
	set(e, _duzenleyici) {
		e = typeof e == 'object' ? e : { hvAlias: e, duzenleyici: _duzenleyici };
		for (let key of ['hvAlias', 'duzenleyici']) {
			let value = e[key];
			if (value !== undefined) { this[key] = e[key] }
		}
		return this
	}
	setHVAlias(value) { this.hvAlias = value; return this }
	setHVAdiAlias(value) { this.hvAdiAlias = value; return this }
	setDuzenleyici(handler) { this.duzenleyici = handler; return this }
}
