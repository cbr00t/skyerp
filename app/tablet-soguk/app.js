class TabletSogukApp extends TabletApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    get sogukmu() { return true }

    uygunFisTipleriDuzenle_ilk({ result }) {
        super.uygunFisTipleriDuzenle_ilk(...arguments)
        result.push(...[
            TabSatisSiparisFis
        ].map(_ => _.kodListeTipi))
    }
}
