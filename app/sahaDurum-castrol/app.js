class SahaDurumCastrolApp extends SahaDurumApp {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	init(e) {
		super.init(e); MustBilgi.kademeler.push(90)
		/* $.extend(MustBilgi, { kademeler: [0, 60, 90] }) */
	}
}
