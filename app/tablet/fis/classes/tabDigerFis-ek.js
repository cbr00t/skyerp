
class TabPlasTeslimFis extends TabTransferFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PS' }
	static get sinifAdi() {
		let { tablet: { ertesiGunSiparisTeslimFisidir: teslim } = {} } = app.params
		return teslim ? 'Plasiyer Teslim' : 'Ertesi Gün Sipariş'
	}
	static get onlineFisSinif() { return super.onlineFisSinif }
	static get yerKullanilirmi() { return false }
	static get refYerKullanilirmi() { return false }
	static get ertesiGunmu() { return true }
	static get onlineFisSinif() {
		let { tablet: { ertesiGunSiparisTeslimFisidir: teslim } = {} } = app.params
		return teslim ? PlasTeslimOnlineFis : PlasSiparisOnlineFis
	}

	constructor(e = {}) {
		super(e)
		let { offlineBuildQuery } = e
		if (!offlineBuildQuery) {
			let { yerKod: appYerKod, subeIcinYerKod: appSubeIcinYerKod } = app
			this.yerKod = appSubeIcinYerKod ?? this.yerKod ?? ''
			this.refYerKod = appYerKod ?? this.refYerKod ?? ''
		}
	}
	async onlineFisDuzenle({ rec, oFis }) {
		await super.onlineFisDuzenle(...arguments)
		mergeIntoIfExists(this, oFis, 'yerKod', 'refYerKod')
	}
	async yeniTanimOncesiIslemler(e) {
		await super.yeniTanimOncesiIslemler(e)
		let { tarih, class: { ertesiGunmu } } = this
		if (ertesiGunmu) {
			tarih ||= today()
			tarih = this.tarih = tarih.clone().yarin()
		}
	}
}
class TabPlasIadeFis extends TabPlasTeslimFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PI' }
	static get sinifAdi() { return 'Plasiyer İADE' }
	static get onlineFisSinif() { return PlasIadeOnlineFis }
	static get iademi() { return true }
	static get ertesiGunmu() { return false }
}


class PlasTeslimOnlineFis extends StokTransferFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get fisEkAyrim() { return 'SC' }
	
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		if (!pTanim.plasiyerKod)
			pTanim.plasiyerKod = new PInstStr('plasiyerkod')
	}	
}
class PlasIadeOnlineFis extends PlasTeslimOnlineFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get iademi() { return true }
}

class PlasSiparisOnlineFis extends MQTicariGenelFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'butfis' }
	static get detaySinif() { return PlasSiparisOnlineDetay }
	static get tsnKullanilirmi() { return true }
	static get numTipKod() { return 'PSSSIP' }
	static get numYapi() { return new MQNumarator({ kod: this.numTipKod }) }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		if (!pTanim.plasiyerKod)
			pTanim.plasiyerKod = new PInstStr('plasiyerkod')
	}
	static varsayilanKeyHostVarsDuzenle({ hv }) {
		super.varsayilanKeyHostVarsDuzenle(...arguments)
		extend(hv, { bttip: 'PS' })
	}
}
class PlasSiparisOnlineDetay extends SayimDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
