class TabletSicakApp extends TabletApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    get sicakmi() { return true }

    uygunFisTipleriDuzenle_ilk({ result }) {
        super.uygunFisTipleriDuzenle_ilk(...arguments)
        result.push(...[
            TabSatisFaturaFis, TabAlimIadeFaturaFis,
            TabSatisIrsaliyeFis, TabAlimIadeIrsaliyeFis,
            TabSatisSiparisFis
        ].map(_ => _.kodListeTipi))
    }
}
