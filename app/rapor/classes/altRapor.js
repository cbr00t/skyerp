class Rapor_A1 extends AltRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'A1' } static get aciklama() { return 'A1' }
	get width() { return '25%' } get height() { return 550 }
	subFormBuilderDuzenle(e) { super.subFormBuilderDuzenle(e); const parentBuilder = e.builder; parentBuilder.onAfterRun(e => e.builder.input.html('abc')) }
}
class Rapor_A2 extends AltRapor_Gridli {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'A2' } static get aciklama() { return 'A2' }
	get width() { return '45%' }
	tabloKolonlariDuzenle(e) { super.tabloKolonlariDuzenle(e); const {liste} = e; liste.push(...MQKA.orjBaslikListesi, new GridKolon({ belirtec: 'grupKod', text: 'Grup', genislikCh: 10 })) }
	loadServerData(e) { return app.sqlExecSelect(`SELECT TOP 1000 kod, aciklama, grupkod grupKod FROM stkmst WHERE kod <> '' AND silindi = '' AND satilamazfl = ''`) }
	gridBuilderDuzenle(e) { const {gridBuilder} = e; gridBuilder.veriYukleninceIslemi(e => { e.grid.jqxGrid('groups', ['grupKod']) }) }
}
class Rapor_A3 extends AltRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'A3' } static get aciklama() { return 'A3' }
	get width() { return 100 } get height() { return 100 }
	subFormBuilderDuzenle(e) { super.subFormBuilderDuzenle(e); const parentBuilder = e.builder; parentBuilder.onAfterRun(e => e.builder.input.html('xyz')) }
}
class Rapor_A4 extends AltRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'A4' } static get aciklama() { return 'A4' }
	get width() { return 130 } get height() { return 150 }
	subFormBuilderDuzenle(e) { super.subFormBuilderDuzenle(e); const parentBuilder = e.builder; parentBuilder.onAfterRun(e => e.builder.input.html('12345')) }
}
class Rapor_A5 extends AltRapor_Gridli {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'A5' } static get aciklama() { return 'A5' }
	get width() { return '60%' } get height() { return 500 }
	tabloKolonlariDuzenle(e) { super.tabloKolonlariDuzenle(e); const {liste} = e; liste.push(...MQKA.orjBaslikListesi) }
	loadServerData(e) { return app.sqlExecSelect(`SELECT TOP 1000 must kod, birunvan aciklama FROM carmst WHERE must <> '' AND silindi = '' AND calismadurumu <> ''`) }
}
class Rapor_A6 extends AltRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'A6' } static get aciklama() { return 'A6' }
	subFormBuilderDuzenle(e) { super.subFormBuilderDuzenle(e); const parentBuilder = e.builder; parentBuilder.onAfterRun(e => e.builder.input.html('bla bla <p>bla bla bla ....</p> <p>bla bla bla ....</p>')) }
}
class Rapor_A7 extends AltRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'A6' } static get aciklama() { return 'A6' }
	subFormBuilderDuzenle(e) { super.subFormBuilderDuzenle(e); const parentBuilder = e.builder; parentBuilder.onAfterRun(e => e.builder.input.html('bla bla <p>bla bla bla ....</p> <p>bla bla bla ....</p>')) }
}
