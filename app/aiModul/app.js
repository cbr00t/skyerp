class AIApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get isLoginRequired() { return false } // Login istenmiyor ve zaten LoginPart için referans da mevcut değil
    get autoExecMenuId() { return 'AI'; }  // uygulama açılır açılmaz 'AI' menü komutunu çalıştırır
	async runDevam(e) { await super.runDevam(e); await this.anaMenuOlustur(e); this.show() }
    async getAnaMenu(e) {
        if (this.noMenuFlag) return new FRMenu();
        return new FRMenu({ items: [
            new FRMenuChoice({ 
                mne: 'AI', 
                text: 'AI Sorgu', 
                block: e => new AIPart(e).run()
            })
        ]})
    }
}
