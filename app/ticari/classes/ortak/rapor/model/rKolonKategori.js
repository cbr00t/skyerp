class RKolonKategori extends CKodAdiVeDetaylar {
	async ekSahaYukle(e) {
		let sections = e.section || e.sections;
		if (!$.isArray(sections)) sections = typeof sections == 'object' ? Object.keys(sections) : [sections];
		sections = sections.filter(x => !!x);
		const section2Result = await app.wsSabitTanimlar_secIni_noDict({ belirtec: app.raporEkSahaDosyalari, sections });
		let result = section2Result || {};
		if (result) {
			for (const section of sections) {
				let liste = result[section];
				if (liste)
					liste = result[section] = liste.map(x => iniTextSonucu(x));
				if (liste)
					this.addDetay(liste.map(def => new RRSahaDegisken(def)))
			}
		}
		return this
	}
}
