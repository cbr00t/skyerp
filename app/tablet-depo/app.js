class TabletDepoApp extends TabletApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    get depomu() { return true }

    uygunFisTipleriDuzenle_ilk({ result }) {
        super.uygunFisTipleriDuzenle_ilk(...arguments)
        let ignoreSet = asSet([
            TabUgramaFis, TabTahsilatFis, TabSutAlimFis
        ].map(_ => _.fisTipi))
        result.push(
            ...keys(TabFis.tip2Sinif)
                .filter(k => !ignoreSet[k])
        )
    }
}
