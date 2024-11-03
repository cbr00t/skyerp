class MustBilgi extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static yaslandirmaKey = 'kapanmayanHesap_yaslandirma'; static kademeler = [0, 15, 30, 45, 60];
	get yaslandirmalar() { const {yaslandirmaKey} = this.class; return this[yaslandirmaKey] } set yaslandirmalar(value) { this[yaslandirmaKey] = value }
	get bakiyeText() { return `Bakiye: <span class="bold royalblue">${toStringWithFra(this.bakiye, 2)}</b>` }
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
			const gecikmeGun = rec.gecikmegun, gelecekGun = rec.gelecekgun, selector = gecikmeGun ? 'gecmis' : 'gelecek';
			const index = this.class.getGunIcinKademeIndex(gecikmeGun || gelecekGun), yaslandirma = yaslandirmalar[index];
			yaslandirma[selector] = (yaslandirma[selector] || 0) + (rec.acikkisim || 0)
		}
		let bakiye = 0; for (const yaslandirma of yaslandirmalar) { bakiye += yaslandirma.bedel }
		for (let i = 1; i <= kademeler.length; i++) { this[`kademe${i}Bedel`] = this.getKademeGecmisBedeli(i - 1) }
		$.extend(this, { bakiye })
	}
	static getGunIcinKademeIndex(gun) {
		const {kademeler} = this; for (let i = kademeler.length - 1; i >= 0; i--) { const kademe = kademeler[i]; if (gun >= kademe) { return i } }
		return 0
	}
	static getKademeText(index) {
		const {kademeler} = this; const kademe = kademeler[index];
		switch (index) { case 0: return `0 -> ${kademeler[index + 1]}`; case kademeler.length - 1: return 'Sonrası' }
		return `${kademe + 1} -> ${kademeler[index + 1]}`
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
