class TabletSicakApp extends TabletApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    get sicakmi() { return true }

    uygunFisTipleriDuzenle_ilk({ result }) {
        let { tablet: { sutToplama = true } = {} } = this.params ?? {}
        super.uygunFisTipleriDuzenle_ilk(...arguments)
        result.push(...[
            TabSatisFaturaFis, TabAlimIadeFaturaFis,
            TabSatisIrsaliyeFis, TabAlimIadeIrsaliyeFis,
            TabSatisSiparisFis,
            ( sutToplama ? TabSutAlimFis : null )
        ].filter(Boolean).map(_ => _.fisTipi))
    }
}
