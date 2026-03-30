class TabletSutAlimApp extends TabletApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    get sutAlimmi() { return true }
    get eIslemKullanilirmi() { return false }

    uygunFisTipleriDuzenle_ilk({ result }) {
        result.push(...[
            TabSutAlimFis
        ].map(_ => _.fisTipi))
        // super.uygunFisTipleriDuzenle_ilk(...arguments)
    }
    uygunFisTipleriDuzenle_son({ result }) {
        // super yok - tahsilatsız
    }
}
