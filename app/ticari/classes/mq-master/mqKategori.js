class MQKategori extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() {return 'Kategoriler' }
	static get table() { return 'kategori' }
	static get tableAlias() { return 'kat' }
	static get kodListeTipi() { return 'KATEGORİLER' }

	static async getKod2Detaylar(e) {
		e = e || {};
		const kod = typeof e == 'object' ? e.kod : e;
		const {globals} = this;
		const cache = globals.kod2Detaylar = globals.kod2Detaylar || {};
		let result = cache[kod];
		if (result === undefined)
			result = cache[kod] = await this.getKod2DetaylarDogrudan(e)
		return result
	}
	static async getKod2DetaylarDogrudan(e) {
		const kod = typeof e == 'object' ? e.kod : e;
		let sent = new MQSent();
		sent.fisHareket('kategori', 'kategoridetay');
		sent.where.add(`fis.kod <> ''`)
		if (kod)
			sent.where.degerAta(kod, 'fis.kod');
		sent.sahalar.add( 'fis.kod kategorikod');
		sent.addWithAlias('har', 'seq', 'kaysayac kod', 'kdetay aciklama');
		let stm = new MQStm({ sent: sent, orderBy: ['seq'] });
		let recs = await app.sqlExecSelect(stm);
		if (kod)
			return recs

		const kod2DetSayac2Rec = {};
		for (const rec of recs) {
			const kod = rec.kategorikod, sayac = rec.kod;
			const detSayac2Rec = kod2DetSayac2Rec[kod] = kod2DetSayac2Rec[kod] || {};
			detSayac2Rec[sayac] = rec
		}
		return kod2DetSayac2Rec
	}

	static mqHizmetKolonGrupDuzenle(e) {
		const {kolonGrup} = e;
		const {tabloKolonlari} = kolonGrup;
		tabloKolonlari.push(
			new GridKolon({ belirtec: 'kategoriKod', text: 'Kat.', genislikCh: 10 }).readOnly(),
			new GridKolon({
				belirtec: 'katDetaySayac', text: 'Kat.Detay', genislikCh: 25,
				cellsRenderer: (colDef, rowIndex, belirtec, value, html, jqxCol, det) => {
					const {fis} = colDef.gridPart;
					let kod2DetSayac2Rec = fis?._kategoriKod2Detaylar || {};
					const {kategoriKod} = det;
					const detSayac2Rec = (kategoriKod ? kod2DetSayac2Rec[kategoriKod] : null) || {};
					return `<div class="jqx-grid-cell-right-left">${detSayac2Rec[value]?.aciklama ?? html}</div>`
				}
			}).tipTekSecim({
					source: async e => {
						const {fis} = e;
						let kod2Detaylar = fis._kategoriKod2Detaylar;
						if (kod2Detaylar === undefined)
							kod2Detaylar = fis._kategoriKod2Detaylar = await MQKategori.getKod2Detaylar()
						const det = e.gridRec || {};
						const {kategoriKod} = det;
						/*let result = kategoriKod2Detaylar[kategoriKod];
						if (result === undefined)
							result = kategoriKod2Detaylar[kategoriKod] = await MQKategori.getKod2Detaylar(kategoriKod)*/
						return kategoriKod ? kod2Detaylar[kategoriKod] : null
					}
				}).kodsuz()
		);
		kolonGrup.stmDuzenleyiciEkle(e => {
			const {stm, aliasVeNokta} = e;
			for (const sent of stm.getSentListe()) {
				sent.sahalar
					.add(`${aliasVeNokta}kategorikod`)
			}
		});
		kolonGrup.degisince(async e => {
			const {setCellValue} = e;
			const rec = await e.rec;
			const kategoriKod = rec?.kategorikod;
			setCellValue({ belirtec: 'kategoriKod', value: kategoriKod || '' });
			setCellValue({ belirtec: 'katDetaySayac', value: null })
		})
	}
}
