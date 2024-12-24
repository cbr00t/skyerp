class BarkodParser_Referans extends BarkodParser {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get aciklama() { return 'Barkod Referans' }
	static get uygunEkOzellikTipSet() {
		const tip2EkOzellik = app.tip2EkOzellik || {}, desteklenenEkOzellikTipSet = this.desteklenenEkOzellikTipSet || {}, result = {};
		for (const tip of Object.keys(desteklenenEkOzellikTipSet)) { if (tip2EkOzellik[tip]) { result[tip] = true } }
		return result
	}
	async parseDevam(e) {
		e = e || {}; let result = await super.parseDevam(e); if (result) { return result }
	// barkod referans
		const {uygunEkOzellikTipSet} = this.class, {barkod} = this, paketKodClause = `coalesce(pak.kod, '')`;
		const paketIcAdetClause = `(case when ref.bkolibarkodmu <> 0 or ${paketKodClause} <> '' then coalesce(upak.urunmiktari, ref.koliicadet, 0) else NULL end)`;
		const sent = new MQSent({
			from: 'sbarref ref',
			fromIliskiler: [
				{ alias: 'ref', leftJoin: 'paket pak', on: 'ref.paketsayac = pak.kaysayac' },
				{ alias: 'ref', leftJoin: 'urunpaket upak', on: ['ref.paketsayac = upak.paketsayac', 'ref.stokkod = upak.urunkod'] }
			],
			where: [{ degerAta: barkod, saha: 'ref.refkod' }],
			sahalar: ['ref.varsayilan', 'ref.refkod barkod', 'ref.stokkod shKod', `${paketKodClause} paketKod`, `${paketIcAdetClause} paketIcAdet`, `${paketIcAdetClause} miktar`]
		});
		try {
			let stm = new MQStm({ sent, orderBy: ['varsayilan DESC'] }), rec = await app.sqlExecTekil(stm);
			if (rec) { $.extend(this, rec); if (await this.shEkBilgileriBelirle(e)) { e.shRec = rec; return true } }
		// stok kodu
			let _e = $.extend({}, e, { shKod: barkod }); if (await this.shEkBilgileriBelirle(_e)) { e.shRec = _e.shRec; return true }
		}
		catch (ex) { console.error(ex); if (!e.basitmi) { throw ex } }
		return false
	}
}
