class TabletSogukApp extends TabletApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    get sogukmu() { return true }
    get eIslemKullanilirmi() { return false }

    uygunFisTipleriDuzenle_ilk({ result }) {
        let { tablet: { sutToplama = true } = {} } = this.params ?? {}
        super.uygunFisTipleriDuzenle_ilk(...arguments)
        result.push(...[
            TabSatisSiparisFis,
            ( sutToplama ? TabSutAlimFis : null )
        ].filter(Boolean).map(_ => _.fisTipi))
    }
}
