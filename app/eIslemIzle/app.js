class EIslemIzleApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { super(e) }

	getAnaMenu(e) {
		return new FRMenu({ items: [
			new FRMenuCascade({
				mne: 'A', text: 'Alım', items: [
					new FRMenuChoice({
						nme: 'E', text: 'Gelen e-İşlem Listesi',
						block: e => new Ext_GelenEIslemListePart(e).run()
					})
				]
			}),
			new FRMenuCascade({
				mne: 'T', text: 'Satış', items: [
					new FRMenuChoice({
						nme: 'E', text: 'Giden e-İşlem Listesi',
						block: e => new Ext_GidenEIslemListePart(e).run()
					})
				]
			})
		] })
	}
}
