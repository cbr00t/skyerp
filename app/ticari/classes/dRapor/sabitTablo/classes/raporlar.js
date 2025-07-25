
class SBRapor_X extends SBRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'SBX' } static get aciklama() { return 'Sabit: X' }
}
class SBRapor_X_Main extends SBRapor_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return SBRapor_X }
	tabloKolonlariDuzenle({ liste, recs /*, flatRecs*/ }) {
		super.tabloKolonlariDuzenle(...arguments);
		liste.push(...[
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 50 }),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 20 }).tipDecimal_bedel()
		])
	}
	loadServerDataInternal(e) {
		return super.loadServerDataInternal(e)
		
		/*let {raporTanim} = this, {detaylar} = raporTanim ?? {};
		return detaylar?.map(({ shVeriTipi }) => {
			let {kod, aciklama, kaDict} = shVeriTipi, question = kaDict[kod]?.question;
			return ({ kod, aciklama, question })
		})*/
		/*return [
			{
				test: 'A', test2: 'B', test3: 'x', detaylar: [
					{ test: 'A-1', test2: 'B', test3: 'y' },
					{ test: 'A-2', test2: 'C', test3: 'z' }
				]
			},
			{ test: 'B', test2: 'X', test3: 'Y', detaylar: [] }
		]*/
	}
}
