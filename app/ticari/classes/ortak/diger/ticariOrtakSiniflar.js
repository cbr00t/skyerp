class Oran extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { e = e || {}; super(e); $.extend(this, { pay: e.pay, baz: e.baz }) }
	get anahtarStr() { const {pay, baz} = this; return baz ? `${pay}/${baz}` : null }
	ekle(diger) {
		if (diger) { for (const key of ['pay', 'baz']) { const value = diger[key]; if (value) { this[key] += value } } }
		return this
	}
	aynimi(diger) { return diger && (this.pay == diger.pay && this.baz == diger.baz) }
	toString() { return this.anahtarStr }
}
class TLVeDVBedel extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get bosmu() { return !(this.tl || this.dv) }
	get negated() { return new this.class({ tl: negated(this.tl), dv: negated(this.dv) }) }
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { tl: roundToBedelFra(e.tl ?? e.tlBedel ?? e.bedel ?? 0), dv: roundToBedelFra(e.dv ?? e.dvBedel ?? 0) })
	}
	ekle(diger) {
		if (diger) {
			for (const key of ['tl', 'dv']) {
				const value = diger[key] ?? diger[`${key}Bedel`];
				if (value) { this[key] = roundToBedelFra(this[key] + value) }
			}
		}
		return this
	}
	cikar(diger) {
		if (diger) {
			for (const key of ['tl', 'dv']) {
				const value = diger[key] ?? diger[`${key}Bedel`];
				if (value) { this[key] = roundToBedelFra(this[key] - value) }
			}
		}
		return this
	}
	cikart(diger) { return this.cikar(diger) }
	carp(diger) {
		if (diger) {
			for (const key of ['tl', 'dv']) {
				const value = diger[key] ?? diger[`${key}Bedel`];
				if (value) { this[key] = roundToBedelFra(this[key] * value) }
			}
		}
		return this
	}
	bol(diger) {
		if (diger) {
			for (const key of ['tl', 'dv']) {
				const value = diger[key] ?? diger[`${key}Bedel`];
				if (value) { this[key] = roundToBedelFra(this[key] / value) }
			}
		}
		return this
	}
}
class Taksitci extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get tlVeDvBedel() { return new TLVeDVBedel({ tl: this.bedel, dv: this.dvBedel }) }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, { inst: e.inst });
		if (this.inst) this.taksitSayisiOlustur(e)
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e; $.extend(pTanim, {
			islemTarihi: new PInstDateToday(),
			ilkTaksit: new PInstNum(), taksitSayisi: new PInstNum({ init: e => 1 }),
			dvKod: new PInstStr(), bedel: new PInstNum(), dvBedel: new PInstNum()
		})
	}
	toplamdanTaksitlendir(e) {
		e = e || {};
		e.taksitci = this;
		return this.inst.kosul.toplamdanTaksitlendir(e)
	}
	taksitSayisiOlustur(e) { this.taksitSayisi = this.inst.kosul.taksitSayisi || 1; return this }
	async uiKaydetOncesiIslemler(e) {
		let result = await this.dataDuzgunmu(e);
		if (!(result == null || result == true)) {
			if (typeof result != 'object')
				result = { isError: false, rc: 'hataliBilgiGirisi', errorText: (typeof result == 'boolean' ? null : result?.toString()) }
			throw result
		}
	}
	dataDuzgunmu(e) {
		if (isInvalidDate(this.islemTarihi))
			return 'İşlem Tarihi(İlk Vade) belirtilmelidir'
	}
}
class Yaslandirma extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get bedel() { return (this.gecmis || 0) + (this.gelecek || 0) } get kademe() { return MustBilgi.kademeler[this.index] }
	get kademeText() {
		let result = this._kademeText; if (result === undefined) { const {index} = this; result = this._kademeText = MustBilgi.getKademeText(index) }
		return result
	}
	constructor(e) { e = e || {}; super(e); $.extend(this, e) }
}
