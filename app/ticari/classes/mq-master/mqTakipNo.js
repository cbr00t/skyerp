class MQTakipNo extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Takip' }
	static get table() { return 'takipmst' }
	static get tableAlias() { return 'tak' }
	static get kodListeTipi() { return 'TAKIPNO' }

	static getGridKolonGrup(e = {}) {
		e.kodAttr ||= 'takipNo'
		e.adiAttr ||= 'takipAdi'
		return super.getGridKolonGrup(e)
	}
	static getGridKolonlar(e) {
		let liste = []
		if (app.params.ticariGenel.kullanim.takipNo)
			liste.push(...super.getGridKolonlar(e))
		return liste
	}
}
