class VergiVeyaTCKimlik extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get perakendeVKN() { return '1'.repeat(this.haneSayisi) }
	static get yurtDisiVKN() { return '2'.repeat(this.haneSayisi) }
}
class VergiNo extends VergiVeyaTCKimlik {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get haneSayisi() { return 10 }
}
class TCKimlik extends VergiVeyaTCKimlik {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get haneSayisi() { return 11 }
}
