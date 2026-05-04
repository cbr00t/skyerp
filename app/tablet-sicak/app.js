class TabletSicakApp extends TabletApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    get sicakmi() { return true }
    get yerKod() {
		let { cache, cache: { _yerKod: result } } = this
		if (result === undefined) {
			let { plasiyerKod } = this
			result = cache._yerKod = plasiyerKod
		}
		return result
	}

    uygunFisTipleriDuzenle_ilk({ result }) {
        let { tablet: { sutToplama = true } = {} } = this.params ?? {}
        super.uygunFisTipleriDuzenle_ilk(...arguments)
        result.push(
			...[
	            TabSatisFaturaFis, TabAlimIadeFaturaFis,
	            TabSatisIrsaliyeFis, TabAlimIadeIrsaliyeFis,
	            TabSatisSiparisFis,
	            ( sutToplama ? TabSutAlimFis : null ),
	            TabPlasTeslimFis, TabPlasIadeFis
		    ]
			.filter(_ => _ != null && _?.uygunmu !== false)
			.map(_ => _.fisTipi)
		)
    }
}
