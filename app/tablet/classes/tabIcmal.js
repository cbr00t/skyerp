class TabIcmal extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, 'fis'] }
	get topKdv() {
		let {oran2MatrahVeKdv: oran2MK} = this
		return roundToBedelFra(topla(mk => mk.kdv, values(oran2MK)))
	}

	constructor(e = {}) {
		super(e); let {fis = {}} = e
		$.extend(this, { fis })
		let _keys = ['dipIskOran1', 'dipIskOran2', 'dipIskBedel']
		for (let k of _keys)
			this[k] = e[k] ?? 0
		// this.topluHesapla(e)
	}
	topluHesapla(e) {
		let {fis = {}, dipIskOran1, dipIskOran2, dipIskBedel} = this
		let {detaylar = []} = fis
		dipIskOran1 ??= 0; dipIskOran2 ??= 0; dipIskBedel ??= 0
		
		let brut = 0
		let oran2MK = this.oran2MatrahVeKdv = {}
		for (let det of detaylar) {
			let {kdvOrani, bedel = det.netBedel} = det
			kdvOrani ??= 0; bedel ??= 0
			brut += bedel
			let mb = oran2MK[kdvOrani] ??= { matrah: 0, kdv: 0 }
			mb.matrah = roundToBedelFra(mb.matrah + bedel)
		}
		brut = this.brut = roundToBedelFra(brut)
		
		let araDeger = brut, topIskBedel = 0
		for (let oran of [dipIskOran1, dipIskOran2]) {
			if (!oran)
				continue
			let iskBedel = roundToBedelFra(araDeger * oran / 100)
			topIskBedel += iskBedel
			araDeger -= iskBedel
		}
		this.topIskBedel = topIskBedel = roundToBedelFra(topIskBedel + dipIskBedel)
		araDeger = roundToBedelFra(Math.max(araDeger - dipIskBedel, 0))
		if (topIskBedel) {
			dagitimYap({
				detaylar: values(oran2MK),    // ref
				yedirilecek: araDeger,
				getBaz: mk => mk.matrah,
				round: value => roundToBedelFra(value),
				getter: mk => mk.matrah,
				setter: (mk, value) => mk.matrah = value
			})
		}
		for (let [oran, mk] of entries(oran2MK))
			mk.kdv = roundToBedelFra(mk.matrah * oran / 100)
		this.sonuc = roundToBedelFra(araDeger + this.topKdv)
		return this
	}
	async kaydetOncesiIslemler({ islem }) {
		let {fis: { detaylar = [] } = {}} = this
		let {topIskBedel, oran2MatrahVeKdv: oran2MK} = this
		dagitimYap({
			detaylar, yedirilecek: topIskBedel,
			getBaz: det => det.bedel ?? det.netBedel,
			round: value => roundToBedelFra(value),
			getter: det => det.dagitDipIskBedel || 0,
			setter: (det, value) => det.dagitDipIskBedel = value
		})
		let oran2Detaylar = {}
		for (let det of detaylar) {
			let {kdvOrani: oran} = det
			if (oran)
				(oran2Detaylar[oran] ??= []).push(det)
		}
		for (let [oran, mk] of entries(oran2MK)) {
			if (!oran)
				continue
			let kDetaylar = oran2Detaylar[oran]
			if (empty(kDetaylar))
				continue
			dagitimYap({
				detaylar: kDetaylar, yedirilecek: mk.kdv,
				getBaz: det => det.bedel ?? det.netBedel,
				round: value => roundToBedelFra(value),
				getter: det => det.kdv || 0,
				setter: (det, value) => det.kdv = value
			})
		}
	}
}
