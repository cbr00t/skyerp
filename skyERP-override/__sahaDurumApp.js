class InjectCode extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	init(e) {
		MustBilgi.kademeler.push(90)
		/* $.extend(MustBilgi, { kademeler: [0, 60, 90] }); */
		setTimeout(() => app.divAppTitle.html(`${app.divAppTitle.html()} <span class=orangered>i</span>`), 1000)
	}
}
(function() { if (app.ozelKonfYuklendimi) { return } app.ozelKonfYuklendimi = true; return new InjectCode() })()
