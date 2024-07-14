class Rapor_DonemselIslemler extends MQRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'DONEMSEL_ISLEMLER' } static get aciklama() { return 'Dönemsel İşlemler' }
	static get detaylimi() { return true }
	static secimlerDuzenle(e) {
		const sec = e.secimler; sec.secimTopluEkle({
			secim1: new SecimOzellik({ etiket: 'Seçim 1' }),
			secim2: new SecimOzellik({ etiket: 'Seçim 2' })
		});
		sec.whereBlockEkle(e => { const sec = e.secimler, wh = e.where })
	}
	static orjBaslikListesi_groupsDuzenle(e) { const {liste} = e; liste.push('grupText') }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(...[
			new GridKolon({ belirtec: 'kod', text: 'Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'islemAdi', text: 'İşlem', genislikCh: 20 }),
			new GridKolon({ belirtec: 'grupText', text: 'Döviz + İşlem' }).hidden()
		])
	}
	static loadServerData(e) {
		const recs = []; for (let i = 0; i < 50; i++) { recs.push({ kod: 'TL', islemAdi: 'ABC' }) }
		for (const rec of recs) { rec.grupText = `<b>${rec.kod || ''}</b> <span>${rec.islemAdi}</span>` }
		return recs
	}
	static orjBaslikListesiDuzenle_detaylar(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(...[
			new GridKolon({ belirtec: 'kod', text: 'Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'islemAdi', text: 'İşlem', genislikCh: 20 })
		])
	}
	static loadServerData_detaylar(e) {
		const recs = []; for (let i = 0; i < 100; i++) { recs.push({ kod: 'TL', islemAdi: 'ABC' }) }
		return recs
	}
}
class Rapor_PanelTest extends PanelRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'PANEL_TEST' } static get aciklama() { return 'Panel Test' }
	altRaporlarDuzenle(e) { super.altRaporlarDuzenle(e); this.add(Rapor_A1, Rapor_A2, Rapor_A7, Rapor_A4, Rapor_A3, Rapor_A5, Rapor_A6) }
}
