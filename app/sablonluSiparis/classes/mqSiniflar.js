class MQSablonOrtak extends MQDetayliMaster {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get detaySinif() { return SablonluSiparisOrtakFis }
	static get kodListeTipi() { return this.detaySinif.kodListeTipi } static get sinifAdi() { return this.detaySinif.sinifAdi } static get tumKolonlarGosterilirmi() { return true }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false } static get secimSinif() { return null }
	static listeEkrani_init(e) { super.listeEkrani_init(e); let gridPart = e.gridPart ?? e.sender; gridPart.tarih = today(); gridPart.rowNumberOlmasin() }
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); let {rootBuilder: rfb} = e, gridPart = e.gridPart ?? e.sender, {header, islemTuslariPart} = gridPart, {layout, sol} = islemTuslariPart;
		rfb.setInst(gridPart).addStyle(e => `$elementCSS { --header-height: 140px !important } $elementCSS .islemTuslari { overflow: hidden !important }`);
		sol.addClass('flex-row'); rfb.addDateInput('tarih', 'İşlem Tarihi').setParent(sol).etiketGosterim_yok()
			.degisince(({ builder: fbd }) => fbd.rootPart.tazeleDefer(e))
			.addStyle(e => `$elementCSS { margin-left: 30px } $elementCSS > input { width: 130px !important }`);
		rfb.addModelKullan('mustKod', 'Müşteri').setParent(header).comboBox().setMFSinif(MQCari).autoBind().degisince(({ builder: fbd }) => fbd.rootPart.tazeleDefer(e))
	}
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); $.extend(e.args, { rowsHeight: 60, groupable: false }) }
	static orjBaslikListesi_argsDuzenle_detaylar(e) { super.orjBaslikListesi_argsDuzenle_detaylar(e); $.extend(e.args, { rowsHeight: 50 }) }
	static orjBaslikListesiDuzenle(e) { super.orjBaslikListesiDuzenle(e); e.liste.push(...[ ]) }
	static orjBaslikListesiDuzenle_detaylar(e) { super.orjBaslikListesiDuzenle_detaylar(e); e.liste.push(...[ ]) }
	static loadServerDataDogrudan() { return [] }
}
class MQSablon extends MQSablonOrtak { static { window[this.name] = this; this._key2Class[this.name] = this } static get detaySinif() { return SablonluSiparisFis } }
class MQKonsinyeSablon extends MQSablonOrtak { static { window[this.name] = this; this._key2Class[this.name] = this } static get detaySinif() { return SablonluKonsinyeSiparisFis } }

class SablonluSiparisOrtakFis extends MQGenelFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Sipariş' } static get tumKolonlarGosterilirmi() { return true }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	static loadServerDataDogrudan() { return [] }
}
class SablonluSiparisFis extends SablonluSiparisOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kodListeTipi() { return 'SSIP' }
}
class SablonluKonsinyeSiparisFis extends SablonluSiparisOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'KSSIP' } static get sinifAdi() { return `Konsinye ${super.sinifAdi}` }
}
