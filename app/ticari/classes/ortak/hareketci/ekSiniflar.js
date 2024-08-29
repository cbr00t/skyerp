class Hareketci_UniBilgi extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
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

	constructor(e) { e = e || {}; super(e); $.extend(this, { sent: e.sent, hv: e.hv, sentDuzenleyici: e.sentDuzenle ?? e.sentDuzenleyici, hvDuzenleyici: e.hvDuzenle ?? e.hvDuzenleyici, temps: e.temps ?? {} } )}
	sentDuzenle(e) { let handler = this.sentDuzenleyici, {sent} = e; if (handler) { const _e = { ...e, sender: this, sent }; getFuncValue.call(this, handler, _e); sent = this.sent = _e.sent }; return this }
	hvDuzenle(e) { let handler = this.hvDuzenleyici, {hv} = e; if (handler) { const _e = { ...e, sender: this, hv }; getFuncValue.call(this, handler, _e); hv = this.hv = _e.hv }; return this }
	setSent(value) { this.sent = value; return this } setHV(value) { this.hv = value; return this }
	sentDuzenleIslemi(value) { this.sentDuzenleyici = value; return this } hvDuzenleIslemi(value) { this.hvDuzenleyici = value; return this }
}
