class CRMTabletApp extends CRMApp {
    static { window[this.name] = this; this._key2Class[this.name] = this } get offlineMode() { return true }
}
