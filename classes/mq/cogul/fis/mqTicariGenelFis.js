class MQTicariGenelFis extends MQGenelFis {
	constructor(e) { e = e || {}; super(e); if (e.isCopy) return }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e) }

	static async raporKategorileriDuzenle_detaylar_hmr(e) {
		const {shdDisi, fiiliHareketmi, kat} = e;
		const alinmayacaklar = fiiliHareketmi ? {} : asSet(['raf', 'lotNo']);
		for (const item of HMRBilgi.hmrIter()) {
			const rSahalar = item.asRaporKolonlari();
			for (const rSaha of rSahalar) {
				const sqlDict = rSaha.sql;
				const def = MQSQLOrtak.sqlServerDegeri(item.numerikmi ? 0 : '');
				for (let i = 2; i <= shdDisi; i++)
					sqlDict[i] = def;
				rSaha.sql = sqlDict;
				
				if (!rSaha.attr.toLowerCase().endsWith('adi'))
					sqlDict[1] = `har.${item.rowAttr}`;
				kat.addDetay(rSaha)
			}
		}
	}
}
