class AltRapor_TEST1 extends AltRapor_Gridli {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'TEST1' } static get aciklama() { return 'Test 1' }
	tabloKolonlariDuzenle(e) { super.tabloKolonlariDuzenle(e); const {liste} = e; liste.push(...MQKA.orjBaslikListesi, new GridKolon({ belirtec: 'grupKod', text: 'Grup', genislikCh: 10 })) }
	loadServerData(e) { return app.sqlExecSelect(`SELECT TOP 1000 kod, aciklama, grupkod grupKod FROM stkmst WHERE kod <> '' AND silindi = '' AND satilamazfl = ''`) }
	gridBuilderDuzenle(e) { const {gridBuilder} = e; gridBuilder.veriYukleninceIslemi(e => { e.grid.jqxGrid('groups', ['grupKod']) }) }
}
class AltRapor_TEST2 extends AltRapor_Gridli {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'TEST2' } static get aciklama() { return 'Test 2' }
	tabloKolonlariDuzenle(e) { super.tabloKolonlariDuzenle(e); const {liste} = e; liste.push(...MQKA.orjBaslikListesi, new GridKolon({ belirtec: 'grupKod', text: 'Grup', genislikCh: 10 })) }
	loadServerData(e) { return app.sqlExecSelect(`SELECT TOP 1000 must kod, birunvan aciklama, tipkod grupKod FROM carmst WHERE must <> '' AND silindi = '' AND calismadurumu <> ''`) }
	gridBuilderDuzenle(e) { const {gridBuilder} = e; gridBuilder.veriYukleninceIslemi(e => { e.grid.jqxGrid('groups', ['grupKod']) }) }
}
class AltRapor_TEST3 extends AltRapor_Gridli {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'TEST3' } static get aciklama() { return 'Test 3' }
	tabloKolonlariDuzenle(e) { super.tabloKolonlariDuzenle(e); const {liste} = e; liste.push(...MQKA.orjBaslikListesi, new GridKolon({ belirtec: 'tip', text: 'Tip', genislikCh: 10 })) }
	loadServerData(e) { return app.sqlExecSelect(`SELECT TOP 1000 kodno kod, aciklama FROM tahsilsekli WHERE kodno <> 0`) }
}
