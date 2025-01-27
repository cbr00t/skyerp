class MustBilgi extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static { $.extend(this, { yaslandirmaKey: 'kapanmayanHesap_yaslandirma', kademeler: [0, 15, 30, 45, 60], kademeEk: 0 }) }
	get yaslandirmalar() { return this[this.class.yaslandirmaKey] } set yaslandirmalar(value) { this[this.class.yaslandirmaKey] = value }
	get bakiyeText() { return `Bakiye: <span class="bold green">${toStringWithFra(this.bakiye, 2)}</b>` }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, e); let {yaslandirmalar} = this;
		if (yaslandirmalar) { for (let i = 0; i < yaslandirmalar.length; i++) {
			let rec = yaslandirmalar[i]; if ($.isPlainObject(rec)) { yaslandirmalar[i] = rec = new Yaslandirma(rec) } } }
	}
	kapanmayanHesap_yaslandirmaOlustur(e) {
		const {kademeler} = this.class, yaslandirmalar = this.yaslandirmalar = this.yaslandirmalar || [];
		const kapanmayanHesaplar = this[MQKapanmayanHesaplar.dataKey] || [];
		for (let index = 0; index < kademeler.length; index++) { yaslandirmalar[index] = new Yaslandirma({ index, gecmis: 0, gelecek: 0 }) }
		for (const rec of kapanmayanHesaplar) {
			let {isaretligecikmegun: isaretliGecikmeGun} = rec, selector = isaretliGecikmeGun < 0 ? 'gelecek' : 'gecmis';
			if (isaretliGecikmeGun != null) {
				isaretliGecikmeGun = typeof isaretliGecikmeGun === 'string' ? asDate(isaretliGecikmeGun) : isaretliGecikmeGun;
				if (isDate(isaretliGecikmeGun)) { isaretliGecikmeGun = ((isaretliGecikmeGun - minDate) / Date_OneDayNum) + 1 }
				rec.gecikmegun = rec.gelecekgun = 0; rec[isaretliGecikmeGun < 0 ? 'gelecekgun' : 'gecikmegun'] += Math.abs(isaretliGecikmeGun);
				delete rec.isaretligecikmegun
			}
			let {gecikmegun: gecikmeGun, gelecekgun: gelecekGun} = rec;
			const index = this.class.getGunIcinKademeIndex(gecikmeGun || gelecekGun), yaslandirma = yaslandirmalar[index];
			yaslandirma[selector] = (yaslandirma[selector] || 0) + (rec.acikkisim || 0)
		}
		let bakiye = 0; for (const yaslandirma of yaslandirmalar) { bakiye += yaslandirma.bedel } this.bakiye = bakiye
		for (let i = 1; i <= kademeler.length; i++) { this[`kademe${i}Bedel`] = this.getKademeGecmisBedeli(i - 1) }
	}
	static getGunIcinKademeIndex(gun) {
		const {kademeler} = this; for (let i = kademeler.length - 1; i >= 0; i--) {
			const kademe = kademeler[i]; if (gun >= kademe) { return i } }
		return 0
	}
	static getKademeText(index) {
		const {kademeler, kademeEk} = this; let kademe = kademeler[index];
		if (index == kademeler.length - 1) { return 'Sonrası' }
		let _kademeBS = new CBasiSonu({ basi: kademe ? kademe + 1 : 0, sonu: kademeler[index + 1] });
		if (kademeEk) { for (let key in _kademeBS) { _kademeBS[key] += kademeEk } }
		return _kademeBS.toString()
	}
	getKademeGecmisBedeli(i) { return this.yaslandirmalar[i]?.gecmis || 0 }
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
