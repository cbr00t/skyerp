class TabletSogukApp extends TabletApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    get sogukmu() { return true }
}
