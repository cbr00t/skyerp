class BarkodKurali_Ayrisim extends BarkodKurali {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class BarkodKurali_AyrisimAyiracli extends BarkodKurali_Ayrisim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get hmrBelirtec2Bilgi() {
		let {_hmrBelirtec2Bilgi: result} = this
		if (result == null) {
			result = this._hmrBelirtec2Bilgi = {
				P: { key: 'paketKod' }, M: { key: 'modelKod' }, R: { key: 'renkKod' },
				D: { key: 'desenKod' }, B: { key: 'bedenKod' },
				L: { key: 'lotNo' }, N: { key: 'seriNo' },
				F: { key: 'rafKod' }, E: { key: 'emirNox' },
				O: { key: 'opNo', isNumber: true }, Q: { key: 'eou' },
				T: { key: 'tezgahKod' }, C: { key: 'perKod' }, W: { key: 'oemID' }
			};
			for (let i = 1; i <= 9; i++)
				result[i.toString()] = { key: `ekOz${i}Kod` }
		}
		return result
	}
	static get hmrBas2IOAttrDonusum() {
		let {_hmrBas2IOAttrDonusum: result} = this
		if (result == null) {
			result = this._hmrBas2IOAttrDonusum = {
				personel: 'per', operasyon: 'opNo', emir: 'emirNox',
				eou: 'eou', oemID: 'oemID'
			}
		}
		return result
	}
	constructor(e) { e = e || {}; super(e); this.belirtecleriBelirle(e) }
	belirtecleriBelirle(e) {
		let bas2Belirtec = {}
		let ekle = (belirtec, bas) => {
			if (bas)
				bas2Belirtec[bas] = belirtec
		}
		ekle('V', this.barkodbas); ekle('S', this.stokbas); ekle('K', this.miktarbas); ekle('P', this.paketbas)
		ekle('M', this.modelbas); ekle('R', this.renkbas); ekle('D', this.desenbas); ekle('B', this.bedenbas)
		ekle('L', this.lotnobas); ekle('N', this.serinobas); ekle('F', this.rafbas); ekle('E', this.emirbas)
		ekle('O', this.operasyonbas); ekle('Q', this.eoubas); ekle('T', this.tezgahbas)
		ekle('C', this.personelbas); ekle('W', this.oemidbas)
		for (let i = 1; i <= 9; i++)
			ekle(i.toString(), this[`ekoz${i}bas`])
		this.belirtecler = values(bas2Belirtec)
		this.zVarmi = this.bosformat?.includes('Z') ?? false
	}
}
