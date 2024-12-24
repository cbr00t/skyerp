class DMQStokAnaGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Stok Ana Grup' }
	static get table() { return 'stkanagrup' } static get tableAlias() { return 'agrp' }
}
class DMQStokGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Stok Grup' }
	static get table() { return 'stkgrup' } static get tableAlias() { return 'grp' }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 10 }), new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 20, sql: 'agrp.aciklama' }))
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.stokGrup2AnaGrupBagla() }
}
class DMQStokIstGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Stok İst. Grup' }
	static get table() { return 'stkistgrup' } static get tableAlias() { return 'sigrp' }
}
class DMQYerGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Stok Depo Grup' }
	static get table() { return 'stkyergrup' } static get tableAlias() { return 'ygrp' }
}
class DMQYer extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Stok Depo' }
	static get table() { return 'stkyer' } static get tableAlias() { return 'yer' }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(new GridKolon({ belirtec: 'yergrupkod', text: 'Depo Grup', genislikCh: 10 }), new GridKolon({ belirtec: 'yergrupadi', text: 'Depo Grup Adı', genislikCh: 20, sql: 'ygrp.aciklama' }))
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.yer2GrupBagla() }
}
class DMQStok extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Stok' } static get zeminRenkDesteklermi() { return true }
	static get table() { return 'stkmst' } static get tableAlias() { return 'stk' }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'brm', text: 'Br', genislikCh: 6 }), new GridKolon({ belirtec: 'brm2', text: 'Br2', genislikCh: 6 }),
			new GridKolon({ belirtec: 'grupkod', text: 'Grup', genislikCh: 10 }), new GridKolon({ belirtec: 'grupadi', text: 'Grup Adı', genislikCh: 25, sql: 'grp.aciklama' }),
			new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 10, sql: 'grp.anagrupkod' }), new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 20, sql: 'agrp.aciklama' }),
			new GridKolon({ belirtec: 'sistgrupkod', text: 'İst. Grup', genislikCh: 10 }), new GridKolon({ belirtec: 'sistgrupadi', text: 'İst. Grup Adı', genislikCh: 20, sql: 'sigrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.stok2GrupBagla(); sent.stokGrup2AnaGrupBagla(); sent.stok2IstGrupBagla() }
}
class DMQStokMarka extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Stok Marka' }
	static get table() { return 'stokmarka' } static get tableAlias() { return 'smar' }
}
class DMQHizmetAnaGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Hizmet Ana Grup' }
	static get table() { return 'hizanagrup' } static get tableAlias() { return 'agrp' }
}
class DMQHizmetGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Hizmet Grup' }
	static get table() { return 'hizgrup' } static get tableAlias() { return 'grp' }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 10 }), new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 20, sql: 'agrp.aciklama' }))
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.hizmetGrup2AnaGrupBagla() }
}
class DMQHizmetIstGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Hizmet İst. Grup' }
	static get table() { return 'hizistgrup' } static get tableAlias() { return 'higrp' }
}
class DMQHizmet extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Hizmet' } static get zeminRenkDesteklermi() { return true }
	static get table() { return 'hizmst' } static get tableAlias() { return 'hiz' }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'brm', text: 'Br', genislikCh: 6 }),
			new GridKolon({ belirtec: 'grupkod', text: 'Grup', genislikCh: 10 }), new GridKolon({ belirtec: 'grupadi', text: 'Grup Adı', genislikCh: 25, sql: 'grp.aciklama' }),
			new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 10, sql: 'grp.anagrupkod' }), new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 20, sql: 'agrp.aciklama' }),
			new GridKolon({ belirtec: 'histgrupkod', text: 'İst. Grup', genislikCh: 10 }), new GridKolon({ belirtec: 'histgrupadi', text: 'İst. Grup Adı', genislikCh: 20, sql: 'higrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.hizmet2GrupBagla(); sent.hizmetGrup2AnaGrupBagla(); sent.hizmet2IstGrupBagla() }
}
class DMQCariTip extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Cari Tip' }
	static get table() { return 'cartip' } static get tableAlias() { return 'ctip' }
}
class DMQCariIstGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Cari İst. Grup' }
	static get table() { return 'caristgrup' } static get tableAlias() { return 'cigrp' }
}
class DMQCariAnaBolge extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ana Bölge' }
	static get table() { return 'caranabolge' } static get tableAlias() { return 'abol' }
}
class DMQCariBolge extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Bölge' }
	static get table() { return 'carbolge' } static get tableAlias() { return 'bol' }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(new GridKolon({ belirtec: 'anabolgekod', text: 'Ana Bölge', genislikCh: 10 }), new GridKolon({ belirtec: 'anabolgeadi', text: 'Ana Bölge Adı', genislikCh: 20, sql: 'abol.aciklama' }))
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.bolge2AnaBolgeBagla() }
}
class DMQIl extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'İl' }
	static get table() { return 'caril' } static get tableAlias() { return 'il' }
}
class DMQUlke extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ülke' }
	static get table() { return 'ulke' } static get tableAlias() { return 'ulk' }
}
class DMQSubeGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Şube Grup' }
	static get table() { return 'isygrup' } static get tableAlias() { return 'igrp' }
}
class DMQSube extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Şube' }
	static get table() { return 'isyeri' } static get tableAlias() { return 'sub' }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(new GridKolon({ belirtec: 'subegrupkod', text: 'Şube Grup', genislikCh: 10 }), new GridKolon({ belirtec: 'subegrupadi', text: 'Şube Grup Adı', genislikCh: 20, sql: 'igrp.aciklama' }))
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.sube2GrupBagla() }
}
class DMQTakipGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Takip Grup' }
	static get table() { return 'takipgrup' } static get tableAlias() { return 'tgrp' }
}
class DMQTakipNo extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Takip No' }
	static get table() { return 'takipmst' } static get tableAlias() { return 'tak' }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(new GridKolon({ belirtec: 'takipgrupkod', text: 'Takip Grup', genislikCh: 10 }), new GridKolon({ belirtec: 'takipgrupadi', text: 'Takip Grup Adı', genislikCh: 20, sql: 'tgrp.aciklama' }))
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.takip2GrupBagla() }
}
class DMQCari extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Cari' } static get zeminRenkDesteklermi() { return true }
	static get table() { return 'carmst' } static get tableAlias() { return 'car' } static get kodSaha() { return 'must' } static get adiSaha() { return 'birunvan' }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'tipkod', text: 'Tip', genislikCh: 10 }), new GridKolon({ belirtec: 'tipadi', text: 'Tip Adı', genislikCh: 20, sql: 'ctip.aciklama' }),
			new GridKolon({ belirtec: 'bolgekod', text: 'Bölge', genislikCh: 10, }), new GridKolon({ belirtec: 'bolgeadi', text: 'Bölge Adı', genislikCh: 25, sql: 'bol.aciklama' }),
			new GridKolon({ belirtec: 'cistgrupkod', text: 'İst. Grup', genislikCh: 10 }), new GridKolon({ belirtec: 'cistgrupadi', text: 'İst. Grup Adı', genislikCh: 20, sql: 'cigrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.cari2TipBagla(); sent.cari2IstGrupBagla(); sent.cari2BolgeBagla(); sent.cari2IlBagla() }
}
class DMQPlasiyer extends DMQCari {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Plasiyer' }
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e, {tableAlias: alias} = this.class; sent.where.add(`${alias}.kayittipi = 'X'`) }
}
class DMQMuhHesap extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Muhasebe Hesap' }
	static get table() { return 'muhhesap' } static get tableAlias() { return 'mhes' }
}
class DMQMuhGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Muhasebe Grup' }
	static get table() { return 'muhgrup' } static get tableAlias() { return 'mhgrp' }
}

class DMQHat extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Hat' }
	static get table() { return 'ismerkezi' } static get tableAlias() { return 'hat' }
}
class DMQTezgah extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Tezgah' }
	static get table() { return 'tekilmakina' } static get tableAlias() { return 'tez' }
}
class DMQOperasyon extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Operasyon' }
	static get table() { return 'operasyon' } static get tableAlias() { return 'op' } static get kodSaha() { return 'opno' }
}
class DMQPersonel extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Personel' }
	static get table() { return 'personel' } static get tableAlias() { return 'per' }
}
class DMQDurNeden extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Duraksama Nedeni' }
	static get table() { return 'makdurneden' } static get tableAlias() { return 'dned' }
}
