class EIslemQuery_Liste extends EIslemQuery_Giden {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get listemi() { return true }
	sentEkDuzenle(e) {
		super.sentEkDuzenle(e)
		let { table, alias = this.getAlias(table), sent } = e
		let { sahalar } = sent
		let ticarimi = this.getPIFFismi(table) || this.getSIPFismi(table)
		// XML'deki alıcı seçimiyle aynı: konsolide ana firma yerine belge müşterisi.
		if (ticarimi)
			sent.leftJoin('fis', 'degiskenadres dadr', 'fis.degiskenvknox = dadr.vknox')
		let alici = (normal, degisken = normal) => ticarimi
			? `(CASE WHEN fis.degiskenvknox <> '' THEN ${degisken} ELSE ${normal} END)` : normal
		sahalar.add(
			'fis.seri',
			`${alici("CASE WHEN car.sahismi = '' THEN car.vnumara ELSE car.tckimlikno END", 'fis.degiskenvknox')} vknTckn`,
			`${alici("COALESCE(NULLIF(car.efatsenaryotipi, ''), 'M')", "'M'")} senaryoTipi`,
			`${alici(`CASE WHEN ${alias}.efayrimtipi = 'IR' THEN COALESCE(NULLIF(car.eirsgibalias, ''), car.efatgibalias) ELSE car.efatgibalias END`, 'dadr.efatgibalias')} gibAlias`,
			`${alici(`COALESCE(NULLIF(car.revizeeislemmail, ''), CASE WHEN ${alias}.efayrimtipi IN ('', 'A') THEN COALESCE(NULLIF(car.emailearsiv, ''), car.email) ELSE car.email END)`, 'dadr.email')} eMail`
		)
	}
}
