class EIslGelen extends EIslemOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get gelenmi() { return true }

	static uuidStm_uniDuzenle(e) {
		super.uuidStm_uniDuzenle(e)
		let { uni, ps2SayacListe, whereDuzenleyici, genelWhereDuzenleyici: genelWHDuzenle } = e
		
		let psTip = 'P'
		let sayaclar = ps2SayacListe[psTip]
		let sent = new MQSent({
			from: 'efgecicialfatfis fis',
			sahalar: [`'${psTip}' pstip`, 'fis.kaysayac fissayac', 'fis.efuuid uuid', 'fis.efbelge efayrimtipi', 'fis.tarih', 'fis.effatnox fisnox']
		}), { where: wh, sahalar } = sent
		if (sayaclar || genelWHDuzenle) {
			if (sayaclar)
				wh.inDizi(sayaclar, 'fis.kaysayac')
			
			let args = { ...e, psTip, sent, where: wh }
			whereDuzenleyici?.call?.(this, args)
			genelWHDuzenle?.call?.(this, args)
		}
		else if (!empty(ps2SayacListe)) {
			e.uni = null
			return
		}
		uni.add(sent)
	}
}
