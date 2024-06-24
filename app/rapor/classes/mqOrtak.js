class MQMasterOrtak extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	/*static get secimSinif() { return null }*/ static get tumKolonlarGosterilirmi() { return false } 
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); const {args, sender} = e;
		$.extend(args, { showFilterRow: false, groupsExpandedByDefault: true, rowsHeight: 60, groupIndentWidth: 30 })
	}
	static listeEkrani_init(e) { super.listeEkrani_init(e); const gridPart = e.gridPart ?? e.sender, {args} = gridPart; if (args) { $.extend(gridPart, args) } }
	static listeEkrani_activated(e) { }
}
class MQKAOrtak extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return MQMasterOrtak.tumKolonlarGosterilirmi } /*static get secimSinif() { return null }*/
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
	static listeEkrani_activated(e) { MQMasterOrtak.listeEkrani_activated(e) }
}
class MQSayacliOrtak extends MQSayacli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return MQMasterOrtak.tumKolonlarGosterilirmi } /*static get secimSinif() { return null }*/
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
	static listeEkrani_activated(e) { MQMasterOrtak.listeEkrani_activated(e) }
}
class MQDetayliOrtak extends MQDetayli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return MQMasterOrtak.tumKolonlarGosterilirmi } /*static get secimSinif() { return null }*/
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); MQMasterOrtak.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); MQMasterOrtak.listeEkrani_init(e) }
	static listeEkrani_activated(e) { MQMasterOrtak.listeEkrani_activated(e) }
}
