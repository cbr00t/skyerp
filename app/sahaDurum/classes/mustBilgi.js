class MustBilgi extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static {
		$.extend(this, {
			yaslandirmaKey: 'kapanmayanHesap_yaslandirma',
			kademeler: [0, 15, 30, 45, 60],
			kademeEk: 0
		})
	}
	get yaslandirmalar() { return this[this.class.yaslandirmaKey] }
	set yaslandirmalar(value) { this[this.class.yaslandirmaKey] = value }
	get bakiyeText() { return `Bakiye: <span class="bold green">${toStringWithFra(this.bakiye, 2)}</b>` }

	constructor(e = {}) {
		super(e); $.extend(this, e)
		let {yaslandirmalar} = this
		if (yaslandirmalar) {
			yaslandirmalar.forEach((rec, i) => {
				if (isPlainObject(rec))
					yaslandirmalar[i] = new Yaslandirma(rec)
			})
		}
	}
	kapanmayanHesap_yaslandirmaOlustur(e) {
		let {kademeler} = this.class
		let yaslandirmalar = this.yaslandirmalar ??= []
		let kapanmayanHesaplar = this[MQKapanmayanHesaplar.dataKey] || []
		kademeler.forEach((_, index) =>
			yaslandirmalar[index] = new Yaslandirma({ index, gecmis: 0, gelecek: 0 }))
		let {kod: mustKod} = this
		// if (mustKod == 'M05D47577') { debugger }
		for (let rec of kapanmayanHesaplar) {
			let {isaretligecikmegun: isaretliGecikmeGun} = rec
			let acikKisim = rec.acikkisim || 0
			if (isaretliGecikmeGun != null) {    // normalde gelmemesi lazım
				isaretliGecikmeGun = isString(isaretliGecikmeGun) ? asDate(isaretliGecikmeGun) : isaretliGecikmeGun
				if (isDate(isaretliGecikmeGun))
					isaretliGecikmeGun = ((isaretliGecikmeGun - minDate) / Date_OneDayNum) + 1
				rec.gecikmegun = rec.gelecekgun = 0
				{
					let selector = isaretliGecikmeGun < 0 ? 'gelecekgun' : 'gecikmegun'
					rec[selector] += Math.abs(isaretliGecikmeGun)
				}
				delete rec.isaretligecikmegun
			}
			let {gecikmegun: gecikmeGun, gelecekgun: gelecekGun} = rec
			let index = this.class.getGunIcinKademeIndex(gecikmeGun || gelecekGun)
			let yaslandirma = yaslandirmalar[index]
			{
				let selector = gelecekGun ? 'gelecek' : 'gecmis'
				yaslandirma[selector] = (yaslandirma[selector] || 0) + acikKisim
			}
		}
		this.bakiye = topla(_ => _.bedel || 0, yaslandirmalar)
		for (let i = 1; i <= kademeler.length + 1; i++)
			this[`kademe${i}Bedel`] = this.getKademeGecmisBedeli(i - 1)
	}
	static getGunIcinKademeIndex(gun) {
		let {kademeler} = this
		for (let i = kademeler.length - 1; i >= 0; i--) {
			let kademe = kademeler[i]
			if (gun > kademe)
				return i
		}
		return 0
	}
	static getKademeText(index) {
		let {kademeler, kademeEk} = this
		let kademe = kademeler[index]
		if (index == kademeler.length - 1)
			return 'Sonrası'
		let _kademeBS = new CBasiSonu({ basi: kademe ? kademe + 1 : 0, sonu: kademeler[index + 1] })
		if (kademeEk) {
			for (let key in _kademeBS)
				_kademeBS[key] += kademeEk
		}
		return _kademeBS.toString()
	}
	getKademeGecmisBedeli(i) {
		return this.yaslandirmalar[i]?.gecmis || 0
	}
}
class Yaslandirma extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get bedel() { return (this.gecmis || 0) + (this.gelecek || 0) }
	get kademe() { return MustBilgi.kademeler[this.index] }
	get kademeText() {
		let {_kademeText: result} = this
		if (result === undefined)
			result = this._kademeText = MustBilgi.getKademeText(this.index)
		return result
	}
	constructor(e = {}) {
		super(e)
		$.extend(this, e)
	}
}
