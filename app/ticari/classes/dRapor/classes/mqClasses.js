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
class DMQCari extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Cari' } static get zeminRenkDesteklermi() { return true }
	static get table() { return 'stkmst' } static get tableAlias() { return 'stk' } static get kodSaha() { return 'must' } static get adiSaha() { return 'birunvan' }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'tipkod', text: 'Tip', genislikCh: 10 }), new GridKolon({ belirtec: 'tipadi', text: 'Tip Adı', genislikCh: 20, sql: 'ctip.aciklama' }),
			new GridKolon({ belirtec: 'bolgekod', text: 'Bölge', genislikCh: 10, }), new GridKolon({ belirtec: 'bolgeadi', text: 'Bölge Adı', genislikCh: 25, sql: 'bol.aciklama' }),
			new GridKolon({ belirtec: 'cistgrupkod', text: 'İst. Grup', genislikCh: 10 }), new GridKolon({ belirtec: 'cistgrupadi', text: 'İst. Grup Adı', genislikCh: 20, sql: 'cigrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.cari2TipBagla(); sent.cari2BolgeBagla(); sent.cari2IlBagla() }
}