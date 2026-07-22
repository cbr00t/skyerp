(function() { extend(MQYaslandirma, {

MustBilgi: class MustBilgi extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get key() { return this.class.getKey(this) }
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
		let { rec = e ?? {} } = e
		let { mustKod = rec.mustkod ?? rec.must } = rec
		let { altHesapKod = rec.althesapkod, yaslandirmalar } = rec
		extend(this, { mustKod, altHesapKod, yaslandirmalar })
		;['kapanmayanHesap', 'cariEkstre'].forEach(k =>
			this[k] ??= [])
		;{
			let arr = this.yaslandirmalar ??= []
			;arr.forEach((r, i) => {
				if (isPlainObject(r))
					arr[i] = new Yaslandirma(r)
			})
		}
	}
	static getKey(r = {}) {
		let { mustKod = r.mustkod ?? r.must ?? r.kod } = r
		let { altHesapKod = r.althesapkod } = r
		return [mustKod, altHesapKod]
			.filter(Boolean)
			.join(delimWS)
	}
	init() {
		let { kapanmayanHesap = [], cariEkstre } = this
		let { kademeler } = Yaslandirma

		let arr = { neg: [], pos: [] }
		;kapanmayanHesap.forEach(r => {
			let { acikkisim: v } = r
			let k = (
				v < 0 ? 'neg' :
				v > 0 ? 'pos' :
				null
			)
			if (k)
				arr[k].push(r)
		})
		
		function* iter({ neg, pos }) {
			let ni = 0, pi = 0
			while (ni < neg.length && pi < pos.length) {
				let n = neg[ni], p = pos[pi]
				yield { neg: n, pos: p }
				
				if (!n.acikkisim)
					ni++
				if (!p.acikkisim)
					pi++
			}
		}
		for (let { neg, pos } of iter(arr)) {
			let v = min(-neg.acikkisim, pos.acikkisim)
			neg.acikkisim += v
			pos.acikkisim -= v
		}
		kapanmayanHesap = this.kapanmayanHesap = []
		;values(arr).forEach(sub =>
			kapanmayanHesap.push(...sub.filter(r => r.acikkisim)))
			
		/*let it = {
			neg: kapanmayanHesap.filter(r => r.acikkisim < 0).values(),
			pos: kapanmayanHesap.filter(r => r.acikkisim > 0).values(),
			*getIter() {
				let c = this.cur ??= { neg: this.neg.next(), pos: this.pos.next() }
				values(c).forEach(_ => {
					if (!_.value.acikkisim)
						_.next()
				})
				let { neg, pos } = c
				if (!(neg.done && pos.done))
					yield { neg: neg.value, pos: pos.value }
			}
		}

		;{
			let arr = {
				neg: kapanmayanHesap.filter(r => r.acikkisim < 0),
				pos: kapanmayanHesap.filter(r => r.acikkisim > 0)
			}
			let iter = {}, c = {}
			for (let [k, v] of entries(arr)) {
				let it = iter[k] = v.values()
				c[k] = it.next()
			}
			
			while (!(c.neg.done || c.pos.done)) {
				let { value: neg } = c.neg
				let { value: pos } = c.pos
				let minAcik = min( abs(neg.acikkisim), pos.acikkisim )
				neg.acikkisim += minAcik
				pos.acikkisim -= minAcik

				;keys(c)
					.filter(k =>
						abs(c[k].value.acikkisim) <= .001)
					.forEach(k =>
						c[k] = iter[k].next())
			}
			
			kapanmayanHesap = this.kapanmayanHesap =
				values(arr)
					.flat()
					.filter(r => r.acikkisim)
		}
		*/
		
		let yaslandirmalar = this.yaslandirmalar = []
		;kademeler.forEach((_, index) =>
			yaslandirmalar[index] = new Yaslandirma({ index, gecmis: 0, gelecek: 0 }))
		
		;kapanmayanHesap.forEach(r => {
			let { isaretligecikmegun: gun, acikkisim: acik = 0 } = r
			;{
				if (gun && isString(gun))
					gun = asDate(gun)
				if (isDate(gun))
					gun = ((gun - minDate) / Date_OneDayNum) + 1
				if (gun != null) {
					r.gecikmegun = r.gelecekgun = 0
					let sel = `${gun <= 0 ? 'gelecek' : 'gecikme'}gun`
					r[sel] = abs(gun)
				}
				delete r.isaretligecikmegun
			}

			let { gecikmegun: gecikmeGun, gelecekgun: gelecekGun } = r
			let index = Yaslandirma.getGunIcinKademeIndex(gecikmeGun || gelecekGun)
			let yasl = yaslandirmalar[index]
			;{
				let selector = gecikmeGun ? 'gecmis' : 'gelecek'
				yasl[selector] = (yasl[selector] || 0) + acik
			}
		})
		
		let bakiye = this.bakiye = roundToFra2(topla(_ => _.bedel || 0, yaslandirmalar))
		this.oncesi = roundToFra2(topla(_ => _.gelecek || 0, yaslandirmalar))
		for (let i = 1; i <= kademeler.length + 1; i++)
			this[`kademe${i}Bedel`] = this.getKademeGecmisBedeli(i - 1)

		if (!empty(cariEkstre)) {
			let ekstreToplam = roundToFra2(topla(
				r => r.isaretlibedel || 0,
				cariEkstre
			))
			if (abs(bakiye) != abs(ekstreToplam)) {
				this.dengesizmi = true
				this.bakiye = bakiye = ekstreToplam
			}
		}
		
		return this
	}
	getKademeGecmisBedeli(i) {
		let { yaslandirmalar: l } = this
		return l[i]?.gecmis || 0
	}
},

Yaslandirma: class Yaslandirma extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ilkKademe() { return 0 }
	static get kademeler() {
		let { yaslandirmaGunleri: res } = app.params.finans ?? {}
		let  {ilkKademe: ilk } = this
		if (empty(res))
			res = [ilk, 15, 30, 45, 60]
		else {
			if (ilk != 0)
				res = res.filter(Boolean)
			if (res[0] != ilk)
				res.unshift(ilk)
		}
		
		return res
	}
	static get kademeEk() { return 0 }
	get bedel() {
		let { gecmis, gelecek } = this
		return (gecmis || 0) + (gelecek || 0)
	}
	get kademe() {
		let { index: i, class: { kademeler: arr } } = this
		return arr[i] || 0
	}
	get kademeText() {
		let { _kademeText: res, index: i } = this
		if (res === undefined)
			res = this._kademeText = this.class.getKademeText(i)
		return res
	}

	constructor(e = {}) {
		super(e)
		let { rec = e ?? {} } = e
		extend(this, rec)
	}
	static getKademeText(i) {
		i = Number(i)
		let { kademeler: arr, kademeEk: ek, ilkKademe: ilk } = this
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
	static getGunIcinKademeIndex(gun) {
		let { kademeler: arr } = this
		for (let i = arr.length - 1; i >= 0; i--) {
			let kd = arr[i]
			if (gun > kd)
				return i
		}
		return 0
	}
}

}) })()
