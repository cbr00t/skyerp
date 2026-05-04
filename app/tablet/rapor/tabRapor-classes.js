class TabRapor_IlkIrsaliye extends TabRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'ILKIRSALIYE' }
	static get aciklama() { return 'İlk İrsaliye' }

	getUstBilgi(e) {
		return [
			'MUHTELİF MÜŞTERİLERE GÖNDERİLMEK ÜZERE',
			'ARAÇTAKİ MAL STOĞU'
		]
	}
	getTabloKolonlari(e) {
		return [
			new GridKolon({ belirtec: 'stokText', text: 'Ürün' }).checkedList().setUserData({ }),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 9 }).checkedList().tipDecimal().sum().setUserData({ })
		]
	}
	async getSource(e) {
		return await super.getSource(e)
	}
}

class TabRapor_Satislar extends TabRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'SATISLAR' }
	static get aciklama() { return 'Satışlar' }
}
