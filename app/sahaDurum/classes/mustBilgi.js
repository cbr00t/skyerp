class MustBilgi extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ilkKademe() { return 0 }
	static {
		extend(this, {
			yaslandirmaKey: 'kapanmayanHesap_yaslandirma',
			kademeler: [this.ilkKademe, 15, 30, 45, 60],
			kademeEk: 0
		})
	}
	get yaslandirmalar() { return this[this.class.yaslandirmaKey] }
	set yaslandirmalar(value) { this[this.class.yaslandirmaKey] = value }
	get bakiyeText() {
		let { bakiye: v } = this
		return (
			`<span>Bakiye: </span>` +
			`<b class="${v < 0 ? 'orangered' : v > 0 ? 'forestgreen' : 'lightgray'}" style="margin-left: 10px">` +
				( v ? fra2Str(v) : '-Yok-' ) +
			`</b>`
		)
	}

	constructor(e = {}) {
		super(e)
		extend(this, e)
		let { yaslandirmalar } = this
		if (yaslandirmalar) {
			yaslandirmalar.forEach((rec, i) => {
				if (isPlainObject(rec))
					yaslandirmalar[i] = new Yaslandirma(rec)
			})
		}
	}
	kapanmayanHesap_yaslandirmaOlustur(e) {
		let { kod: mustKod, class: { kademeler } } = this
		let yaslandirmalar = this.yaslandirmalar ??= []
		let kapanmayanHesaplar = this[MQKapanmayanHesaplar.dataKey] ?? []
		let cariEkstreler = this[MQCariEkstre.dataKey] ?? []
		
		kademeler.forEach((_, index) =>
			yaslandirmalar[index] = new Yaslandirma({ index, gecmis: 0, gelecek: 0 }))
		
		// if (mustKod == 'M05D47577') { debugger }
		for (let r of kapanmayanHesaplar) {
			let { isaretligecikmegun: gun } = r
			let acikKisim = r.acikkisim || 0
			if (gun != null) {    // normalde gelmemesi lazım
				gun = isString(gun) ? asDate(gun) : gun
				if (isDate(gun))
					gun = ((gun - minDate) / Date_OneDayNum) + 1
				r.gecikmegun = r.gelecekgun = 0
				;{
					let sel = `${gun <= 0 ? 'gelecek' : 'gecikme'}gun`
					r[sel] = abs(gun)
				}
				delete r.isaretligecikmegun
			}
			let { gecikmegun: gecikmeGun, gelecekgun: gelecekGun } = r
			let index = this.class.getGunIcinKademeIndex(gecikmeGun || gelecekGun)
			let yaslandirma = yaslandirmalar[index]
			;{
				let selector = gecikmeGun ? 'gecmis' : 'gelecek'
				yaslandirma[selector] = (yaslandirma[selector] || 0) + acikKisim
			}
		}
		this.bakiye = roundToFra2(topla(_ => _.bedel || 0, yaslandirmalar))
		this.oncesi = roundToFra2(topla(_ => _.gelecek || 0, yaslandirmalar))
		for (let i = 1; i <= kademeler.length + 1; i++)
			this[`kademe${i}Bedel`] = this.getKademeGecmisBedeli(i - 1)

		if (cariEkstreler) {
			let { bakiye } = this
			let ekstreToplam = roundToFra2(topla(
				r => ( r.bedel ?? (r.borcbedel - r.alacakbedel) ) || 0,
				cariEkstreler
			))
			if (bakiye != ekstreToplam) {
				this.dengesizmi = true
				this.bakiye = ekstreToplam
			}
		}
	}
	static getGunIcinKademeIndex(gun) {
		let { kademeler } = this
		for (let i = kademeler.length - 1; i >= 0; i--) {
			let kademe = kademeler[i]
			if (gun > kademe)
				return i
		}
		return 0
	}
	static getKademeText(i) {
		i = Number(i)
		let { kademeler: arr, kademeEk: ek } = this
		let { ilkKademe: ilk } = MustBilgi
		let v = arr[i]
		if (i == arr.length - 1)
			return 'Sonrası'
		
		let bs = new CBasiSonu({
			basi: v + 1,
			sonu: arr[i + 1]
		})
		if (ek) {
			for (let k in bs)
				bs[k] += ek
		}
		return bs.toString()
	}
	getKademeGecmisBedeli(i) {
		return this.yaslandirmalar[i]?.gecmis || 0
	}
}

class Yaslandirma extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get bedel() { return (this.gecmis || 0) + (this.gelecek || 0) }
	get kademe() { return MustBilgi.kademeler[this.index] || 0 }
	get kademeText() {
		let { _kademeText: result } = this
		if (result === undefined)
			result = this._kademeText = MustBilgi.getKademeText(this.index)
		return result
	}
	
	constructor(e = {}) {
		super(e)
		extend(this, e)
	}
}
