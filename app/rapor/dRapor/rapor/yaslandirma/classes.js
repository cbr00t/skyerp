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
	calc() {
		let { kapanmayanHesap = [], cariEkstre = [] } = this
		let { kademeler } = Yaslandirma
		
		let bakiye = roundToFra2(topla(_ => _.acikkisim || 0, kapanmayanHesap))
		let dengesizmi = false

		// 1) Kapanmayan Hesaplar ile Cari Ekstre dengeli mi kontrolü kapanmayanHesap
		;{
			let ekstreToplam = roundToFra2(topla(
				r => r.isaretlibedel || 0,
				cariEkstre
			))
			dengesizmi = abs(bakiye) != abs(ekstreToplam)
		}
		
		if (dengesizmi) {
			// 2) Cari Ekstre -> Kapanmayan Hesap sanal kayıt oluştur
			;{
				// 2.a) Sanal kayıt dönüşüm kuralını belirle
				let cnv = {
					...fromEntries([
						'must', 'tarih', 'isladi', 'vade',
						'takipno', 'takipadi'
					].map(k => [k, k])),
					fisnox: 'belgeNox',
					isaretlibedel: 'bedel'
				}

				// 2.b) Sanal Kapanmayan Hesap kayıtları oluştur
				// let _kapanmayanHesap = kapanmayanHesap
				kapanmayanHesap = cariEkstre.map(_r => {
					// 2.b.1) Sanal kayıt oluştur
					let r = {}
					for (let [kSrc, kDest] of entries(cnv)) {
						let v = _r[kSrc]
						if (v != null)
							r[kDest] = v
					}

					// 2.b.2) ( Açık Kısım = Bedel )  kabul et
					r.acikkisim = r.bedel

					// 2.b.3) (Tarih, Vade) için String -> Date dönüşümü yap
					;['tarih', 'vade'].forEach(k => {
						let v = r[k]
						if (isString(v))
							r[k] = v = asDate(v)
					})

					// 2.b.4) Vade varsa ( Tarih - Vade ) üzerinden 'İşaretli Gecikme Gün' belirle
					;{
						let { isaretligecikmegun: gun, tarih, vade } = r
						if (gun == null && tarih && vade)
							r.isaretligecikmegun = gun = floor(( tarih - vade ) / Date_OneDayNum)
					}
					return r
				})
			}

			// 3) Dengesiz /(+ ve -) olan/ Kapanmayan Hesapları düzenle
			;{
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
				
				for (let { neg, pos } of iter(arr)) {
					let v = min(-neg.acikkisim, pos.acikkisim)
					neg.acikkisim += v
					pos.acikkisim -= v
				}
				
				kapanmayanHesap = []
				;values(arr).forEach(sub =>
					kapanmayanHesap.push(...sub.filter(r => r.acikkisim)))
			}

			// 4) Yeniden Bakiye Hesapla
			bakiye = roundToFra2(topla(_ => _.acikkisim || 0, kapanmayanHesap))
		}

		// 5) Sabit Yaşlandırma dizisini oluştur
		let yaslandirmalar = []
		;kademeler.forEach((_, index) =>
			yaslandirmalar[index] = new Yaslandirma({ index, gecmis: 0, gelecek: 0 }))

		// 6) Kapanmayan Hesap için Gecikme Gün Hesapla ve Yaşlandırmaları oluştur
		;kapanmayanHesap.forEach(r => {
			// 6.a) İşaretli Gecikme Gün -> Gecikme/Gelecek Gün ayrımını netleştir
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

			// 6.b) Yaşlandırma için Gecikme veya Gelecek Gün'e ait uygun Kademeleri belirle ve Bedelleri Hesapla
			let { gecikmegun: gecikmeGun, gelecekgun: gelecekGun } = r
			let index = Yaslandirma.getGunIcinKademeIndex(gecikmeGun || gelecekGun)
			let yasl = yaslandirmalar[index]
			;{
				let selector = gecikmeGun ? 'gecmis' : 'gelecek'
				yasl[selector] = (yasl[selector] || 0) + acik
			}
		})

		// 7) Yaşlandırma Kademelerinden Öncesi ve Kademe Bedellerini inst içinde sakla
		;{
			this.oncesi = roundToFra2(topla(_ => _.gelecek || 0, yaslandirmalar))
			for (let i = 1; i <= kademeler.length + 1; i++)
				this[`kademe${i}Bedel`] = yaslandirmalar[i - 1]?.gecmis ?? 0
		}

		// 7) Diğer hesap sonuçlarını inst içinde sakla
		extend(this, { dengesizmi, bakiye, kapanmayanHesap, yaslandirmalar })
		
		return this
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
