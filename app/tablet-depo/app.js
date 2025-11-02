class TabletDepoApp extends TabletApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    get depomu() { return true }
}
