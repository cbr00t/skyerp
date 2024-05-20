class BarkodParser_Kuralli extends BarkodParser {
	get formatTipi() { return (this.kural || {}).formattipi }
	get formatBaslangicmi() { return !this.formatTipi }
	get formatAyiraclimi() { return this.formatTipi == 'A' }

	constructor(e) { e = e || {}; super(e); this.kural = e.kural }
	static kuralFor(e) {
		e = e || {}; const basKod = e.basKod || e.kod, barkod = e.barkod; if (!barkod) return null;
		if (!(this.baslangicKod2Kural && this.ayrisimKurallari)) this.barkodKurallariBelirle()
		let kural = (this.baslangicKod2Kural || {})[basKod]; if (kural) return kural
		const ayrisimKurallari = this.ayrisimKurallari || [];
		for (const kural of ayrisimKurallari) {
			const formatTipi = kural.formattipi, ayiracStr = kural.ayiracstr;
			if (formatTipi && ayiracStr) {
				const kuralAyiracSayi = asInteger(kural.ayiracsayi), barkodAyiracSayi = barkod.split(ayiracStr).length - 1 || 0;
				if (kuralAyiracSayi == barkodAyiracSayi) return kural
			}
		}
		return null
	}
	static barkodKurallariBelirle(e) {
		e = e || {}; const _recs = e.recs = e.recs || {}, baslangicKod2Kural = this.baslangicKod2Kural = {}, ayrisimKurallari = this.ayrisimKurallari = [], promises = [];
		promises.push(new $.Deferred(async p => {
			try {
				const parserSinif = BarkodParser_Tarti;
				let recs = _recs.baslangicKod2Kural;
				if (!recs) {
					/*const stm = new MQStm({ sent: new MQSent({ from: 'mst_BarTarti', where: `kod <> ''`, sahalar: '*' }), orderBy: 'kod' }); recs = _recs.baslangicKod2Kural = await app.sqlExecSelect(stm)*/
					recs = _recs.baslangicKod2Kural = []
				}
				for (const rec of recs) { const kuralSinif = parserSinif.getKuralSinif(), kural = new kuralSinif($.extend({ parserSinif }, rec)); baslangicKod2Kural[rec.kod] = kural; }
				p.resolve(recs)
			}
			catch (ex) { p.reject(ex) }
		}));
		promises.push(new $.Deferred(async p => {
			try {
				const promise_wait = new $.Deferred(); setTimeout(() => promise_wait.resolve(), 500); await promise_wait;
				const parserSinif = BarkodParser_Ayrisim; let recs = _recs.ayrisimKurallari;
				if (!recs) {
					const stm = new MQStm({ sent: new MQSent({ from: 'barayrim', where: `kod <> ''`, sahalar: '*' }), orderBy: 'kod' });
					recs = _recs.ayrisimKurallari = await app.sqlExecSelect(stm)
				}
				for (const rec of recs) {
					const formatTipi = rec.formattipi, kuralSinif = parserSinif.getKuralSinif({ formatTipi }), kural = new kuralSinif($.extend({ parserSinif }, rec));
					if (formatTipi) ayrisimKurallari.push(kural)
					else baslangicKod2Kural[rec.kod] = kural
				}
				p.resolve(recs)
			}
			catch (ex) { p.reject(ex) }
		}));
		return Promise.all(promises)
	}

	parseDevam(e) { let result = super.parseDevam(e); return result || false }
	parcaAl(e) {
		if (!e.bas || !e.hane) return false
		let value = e.value || this.barkod; if (value.length < (e.bas + e.hane - 1)) return false
		value = value.substr(e.bas - 1, e.hane).trim(); e.callback.call(this, value, { value: value }); return true
	}
}
