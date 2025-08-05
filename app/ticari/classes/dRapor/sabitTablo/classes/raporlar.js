
class SBRapor_X extends SBRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'SBX' } static get aciklama() { return super.aciklama }
}
class SBRapor_X_Main extends SBRapor_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return SBRapor_X }
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
