class TestBase extends Runnable {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get workerPath() { return `${webRoot}/ortak/test/worker-ext.js` }
}
