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
			new GridKolon({ belirtec: 'stokText', text: 'Ürün' }).checkedList().setUserData({ dokumSaha: { width: 35 } }),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 13 }).checkedList().tipDecimal().sum().setUserData({ }),
			new GridKolon({ belirtec: 'brm', text: 'Br', genislikCh: 4 }).checkedList().setUserData({ })
		]
	}
	async getSource(e) {
		let recs = await super.getSource(e) ?? []
		;{
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent.fromAdd('sonstok son')
			wh.add(`son.stokKod <> ''`, `son.sonMiktar <> 0`)
			sahalar.add('son.stokKod', `SUM(son.sonMiktar) miktar`)
			sent.groupByOlustur()
			let orderBy = ['miktar DESC']
			let stm = new MQStm({ sent, orderBy })
			let kod2Rec = await MQTabStok.getGloKod2Rec()
			;( await stm.execSelect() ).forEach(rec => {
				let { stokKod: kod } = rec
				let { aciklama: adi, brm } = kod2Rec[kod] ?? {}
				rec.stokText = adi ?? `(${kod})`
				rec.brm = brm || 'AD'
				recs.push(rec)
			})
		}
		return recs
	}
	dokumGetColText({ key }) {
		switch (key) {
			case 'stokText': return 'Ürün'
			case 'miktar': return 'Miktar'
			case 'brm': return 'Brm'
		}
		return super.dokumGetColText(...arguments)
	}
	async dokumGetValue({ tip, key, inst: { dokumDetaylar: recs } } = {}) {
		let e = arguments[0]
		if (tip == 'cols')
			return await this.dokumGetColText(...arguments)
		switch (key) {
			case 'dip': {
				let brm2TopMiktar = {}
				;recs.forEach(({ brm, miktar }) =>
					brm2TopMiktar[brm] = (brm2TopMiktar[brm] ?? 0) + Number(miktar))
				let items = entries(brm2TopMiktar).map(([brm, topMiktar]) =>
					`${topMiktar} ${brm}`)
				let toplamText = items.join(' | ')
				toplamText = `T: ${toplamText}`
				return [
					'-'.repeat(toplamText.length),
					toplamText
				]
			}
		}
		return await super.dokumGetValue(...arguments)
	}
}

class TabRapor_Satislar extends TabRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'SATISLAR' }
	static get aciklama() { return 'Satışlar' }
}
