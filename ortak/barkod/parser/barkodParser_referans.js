class BarkodParser_Referans extends BarkodParser {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get aciklama() { return 'Barkod Referans' }
	static get uygunEkOzellikTipSet() {
		let tip2EkOzellik = app.tip2EkOzellik || {}
		let desteklenenEkOzellikTipSet = this.desteklenenEkOzellikTipSet || {}
		let result = {};
		for (let [tip, value] of Object.entries(desteklenenEkOzellikTipSet)) {
			if (value)
				result[tip] = true
		}
		return result
	}
	async parseDevam(e = {}) {
		let result = await super.parseDevam(e)
		if (result)
			return result
	// barkod referans
		let {basitmi} = e, {barkod, class: { uygunEkOzellikTipSet }} = this
		let paketKodClause = `COALESCE(pak.kod, '')`
		let paketIcAdetClause = `(case when bref.bkolibarkodmu <> 0 or ${paketKodClause} <> '' then COALESCE(upak.urunmiktari, bref.koliicadet, 0) else NULL end)`
		let sent = new MQSent({
			from: 'sbarref bref',
			fromIliskiler: [
				{ alias: 'bref', leftJoin: 'paket pak', on: 'bref.paketsayac = pak.kaysayac' },
				{ alias: 'bref', leftJoin: 'urunpaket upak', on: ['bref.paketsayac = upak.paketsayac', 'bref.stokkod = upak.urunkod'] }
			],
			where: [{ degerAta: barkod, saha: 'bref.refkod' }],
			sahalar: [
				'bref.varsayilan', 'bref.refkod barkod', 'bref.stokkod shKod', `${paketKodClause} paketKod`,
				`${paketIcAdetClause} paketIcAdet`, `${paketIcAdetClause} miktar`
			]
		})
		try {
			let obClause_varsayilan = app.offlineMode ? 'bref.varsayilan' : 'varsayilan'
			let stm = new MQStm({ sent, orderBy: [`${obClause_varsayilan} DESC`] })
			let rec = await MQCogul.sqlExecTekil(stm)
			if (rec) {
				$.extend(this, rec)
				if (await this.shEkBilgileriBelirle(e)) {
					e.shRec = rec
					return true
				}
			}
		// stok kodu
			let _e = { ...e, shKod: barkod }
			if (await this.shEkBilgileriBelirle(_e)) {
				e.shRec = _e.shRec
				return true
			}
		}
		catch (ex) {
			console.error(ex)
			if (!basitmi)
				throw ex
		}
		return false
	}
}
