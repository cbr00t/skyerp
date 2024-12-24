class BarkodParser extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get aciklama() { return '' } static getKuralSinif(e) { return BarkodKurali }
	constructor(e) { e = e || {}; super(e); this.setGlobals(e) }
	async parse(e) { let result = await this.parseDevam(e); return result ? await this.parseSonrasi(e) : result }
	parseDevam(e) { this.setGlobals(e); return false }
	parseSonrasi(e) { let {carpan} = this; if (carpan && carpan != 1) this.miktar = (this.miktar || 1) * carpan; return true }
	setGlobals(e) {
		e = e || {}; let barkod = e.barkod || this.barkod || this.okunanBarkod;
		if (barkod) { const carpan = e.carpan || 1; $.extend(this, { okunanBarkod: barkod, barkod, carpan }) }
	}
	async shEkBilgileriBelirle(e) {
		e = e || {}; let shKod = this.shKod = e.shKod || this.shKod; if (!shKod) { return false } if (e.basitmi) { return true }
		const {fis} = e, brmFiyatSaha = 'satfiyat1';
		let sent = new MQSent({
			from: 'stkmst stk', where: [
				new MQOrClause([
					{ degerAta: shKod, saha: 'stk.tartireferans' }, { degerAta: shKod, saha: 'stk.kod' },
					{ degerAta: '0'   + shKod, saha: `stk.kod`},
					{ degerAta: '00'   + shKod, saha: `stk.kod` },
					{ degerAta: '000'  + shKod, saha: `stk.kod` },
					{ degerAta: '0000' + shKod, saha: `stk.kod` }
				])
			],
			sahalar: [ 'stk.kod shKod', 'stk.aciklama shAdi', 'stk.brm', `stk.${brmFiyatSaha} fiyat` ]
		});
		const stm = new MQStm({ sent }), rec = e.shRec = await app.sqlExecTekil(stm); if (!rec) { return false }
		for (const key in rec) { const value = rec[key]; if (value != null) { this[key] = value } }
		return true
	}
}
