class DMQCogul extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	/*static get secimSinif() { return null }*/ static get tumKolonlarGosterilirmi() { return true } 
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); const {args, sender} = e;
		$.extend(args, { showFilterRow: false, groupsExpandedByDefault: true, rowsHeight: 40, groupIndentWidth: 30 })
	}
	static listeEkrani_init(e) {
		super.listeEkrani_init(e);
		let gridPart = e.gridPart ?? e.sender, {args} = gridPart
		if (args) { $.extend(gridPart, args) }
	}
	static listeEkrani_activated(e) { }
}
class DMQKod extends MQKod {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return DMQCogul.tanimlanabilirmi } static get silinebilirmi() { return DMQCogul.silinebilirmi } static get raporKullanilirmi() { return DMQCogul.raporKullanilirmi }
	static get tumKolonlarGosterilirmi() { return DMQCogul.tumKolonlarGosterilirmi } /*static get secimSinif() { return null }*/
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); DMQCogul.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); DMQCogul.listeEkrani_init(e) }
	static listeEkrani_activated(e) { DMQCogul.listeEkrani_activated(e) }
}
class DMQKA extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return DMQCogul.tanimlanabilirmi } static get silinebilirmi() { return DMQCogul.silinebilirmi } static get raporKullanilirmi() { return DMQCogul.raporKullanilirmi }
	static get tumKolonlarGosterilirmi() { return DMQCogul.tumKolonlarGosterilirmi } /*static get secimSinif() { return null }*/
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); DMQCogul.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); DMQCogul.listeEkrani_init(e) }
	static listeEkrani_activated(e) { DMQCogul.listeEkrani_activated(e) }
}
class DMQSayacli extends MQSayacli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return DMQCogul.tanimlanabilirmi } static get silinebilirmi() { return DMQCogul.silinebilirmi } static get raporKullanilirmi() { return DMQCogul.raporKullanilirmi }
	static get tumKolonlarGosterilirmi() { return DMQCogul.tumKolonlarGosterilirmi } /*static get secimSinif() { return null }*/
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); DMQCogul.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); DMQCogul.listeEkrani_init(e) }
	static listeEkrani_activated(e) { DMQCogul.listeEkrani_activated(e) }
}
class DMQSayacliKA extends MQSayacliKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return DMQCogul.tanimlanabilirmi } static get silinebilirmi() { return DMQCogul.silinebilirmi } static get raporKullanilirmi() { return DMQCogul.raporKullanilirmi }
	static get tumKolonlarGosterilirmi() { return DMQCogul.tumKolonlarGosterilirmi } /*static get secimSinif() { return null }*/
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); DMQCogul.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); DMQCogul.listeEkrani_init(e) }
	static listeEkrani_activated(e) { DMQCogul.listeEkrani_activated(e) }
}
class DMQDetayli extends MQDetayli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return DMQCogul.tanimlanabilirmi } static get silinebilirmi() { return DMQCogul.silinebilirmi } static get raporKullanilirmi() { return DMQCogul.raporKullanilirmi }
	static get tumKolonlarGosterilirmi() { return DMQCogul.tumKolonlarGosterilirmi } /*static get secimSinif() { return null }*/
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); DMQCogul.orjBaslikListesi_argsDuzenle(e) }
	static listeEkrani_init(e) { super.listeEkrani_init(e); DMQCogul.listeEkrani_init(e) }
	static listeEkrani_activated(e) { DMQCogul.listeEkrani_activated(e) }
}
