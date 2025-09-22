
class SBRapor_Default extends SBRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kategoriKod() { return null }
	static get kod() { return 'MALI' } static get aciklama() { return super.aciklama }
}
class SBRapor_Default_Main extends SBRapor_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return SBRapor_Default }
	tabloKolonlariDuzenle({ liste, recs /*, flatRecs*/ }) {
		super.tabloKolonlariDuzenle(...arguments)
	}
	loadServerDataInternal(e) {
		return super.loadServerDataInternal(e)
		
		/*let {raporTanim} = this, {detaylar} = raporTanim ?? {};
		return detaylar?.map(({ shStokHizmet }) => {
			let {kod, aciklama, kaDict} = shStokHizmet, question = kaDict[kod]?.question;
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
