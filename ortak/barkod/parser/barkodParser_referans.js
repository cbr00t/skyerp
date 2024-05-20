class BarkodParser_Referans extends BarkodParser {
	static get aciklama() { return 'Barkod Referans' }

	/*static get desteklenenEkOzellikTipSet() {
		let result = this._desteklenenEkOzellikTipSet;
		if (!result)
			result = this._desteklenenEkOzellikTipSet = asSet(['model', 'renk', 'desen', 'raf', 'lotNo'])
		return result
	}*/

	constructor(e) {
		e = e || {};
		super(e)
	}

	static get uygunEkOzellikTipSet() {
		const tip2EkOzellik = app.tip2EkOzellik || {};
		const desteklenenEkOzellikTipSet = this.desteklenenEkOzellikTipSet || {};
		const result = {};
		for (const tip of Object.keys(desteklenenEkOzellikTipSet)) {
			if (tip2EkOzellik[tip])
				result[tip] = true
		}
		return result
	}

	async parseDevam(e) {
		e = e || {};
		let result = await super.parseDevam(e);
		if (result)
			return result

	// barkod referans
		const {uygunEkOzellikTipSet} = this.class;
		const {barkod} = this;
		const paketKodClause = `coalesce(pak.kod, '')`;
		const paketIcAdetClause = `(case when ref.bkolibarkodmu <> 0 or ${paketKodClause} <> '' then coalesce(upak.urunmiktari, ref.koliicadet, 0) else NULL end)`;
		const sent = new MQSent({
			from: 'sbarref ref',
			fromIliskiler: [
				{ alias: 'ref', leftJoin: 'paket pak', on: 'ref.paketsayac = pak.kaysayac' },
				{ alias: 'ref', leftJoin: 'urunpaket upak', on: ['ref.paketsayac = upak.paketsayac', 'ref.stokkod = upak.urunkod'] }
			],
			where: [
				{ degerAta: barkod, saha: 'ref.refkod' }
			],
			sahalar: [
				'ref.varsayilan', 'ref.refkod barkod', 'ref.stokkod shKod', `${paketKodClause} paketKod`,
				`${paketIcAdetClause} paketIcAdet`,
				`${paketIcAdetClause} miktar`,
				/*`(case when ref.koliBarkodmu or ref.paketKod <> '' then ref.koliIci else NULL end) paketIcAdet`,
				`(case when ref.koliBarkodmu or ref.paketKod <> '' then ref.koliIci else NULL end) miktar`*/
			]
		});
		/* const {tip2EkOzellik} = app;
		for (const tip of Object.keys(uygunEkOzellikTipSet)) {
			const ekOzellik = tip2EkOzellik[tip] || {};
			const {idSaha} = ekOzellik;
			if (idSaha)
				sent.sahalar.add(`ref.${idSaha} ${idSaha}`);
		} */
		try {
			const stm = new MQStm({ sent: sent, orderBy: ['varsayilan DESC'] });
			let rec = await app.sqlExecTekil({ query: stm });
			if (rec) {
				$.extend(this, rec);
				if (await this.shEkBilgileriBelirle(e)) {
					e.shRec = rec;
					return true
				}
			}/*
			else {
				this.barkod = null;
			}*/
	
		// stok kodu
			let _e = $.extend({}, e, { shKod: barkod });
			if (await this.shEkBilgileriBelirle(_e)) {
				e.shRec = _e.shRec;
				return true
			}
		}
		catch (ex) {
			console.error(ex);
			if (e.basitmi)
				return false
			throw ex
		}
	
		return false
	}
}
