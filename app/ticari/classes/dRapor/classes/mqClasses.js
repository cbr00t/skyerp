class DMQStokAnaGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Stok Ana Grup' }
	static get kodListeTipi() { return 'STKANAGRP' } static get table() { return 'stkanagrup' } static get tableAlias() { return 'agrp' }
}
class DMQStokGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Stok Grup' }
	static get kodListeTipi() { return 'STKGRP' } static get table() { return 'stkgrup' } static get tableAlias() { return 'grp' }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 10 }), new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 20, sql: 'agrp.aciklama' }))
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.stokGrup2AnaGrupBagla() }
}
class DMQStokIstGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Stok İst. Grup' }
	static get kodListeTipi() { return 'STKISTGRP' } static get table() { return 'stkistgrup' } static get tableAlias() { return 'sigrp' }
}
class DMQStokTip extends StokTip {
    static get kodListeTipi() { return 'STKTIP' } static { window[this.name] = this; this._key2Class[this.name] = this }
}
class DMQYerGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Stok Depo Grup' }
	static get kodListeTipi() { return 'YERGRP' } static get table() { return 'stkyergrup' } static get tableAlias() { return 'ygrp' }
}
class DMQYer extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Stok Depo' }
	static get kodListeTipi() { return 'STKYER' } static get table() { return 'stkyer' } static get tableAlias() { return 'yer' }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(new GridKolon({ belirtec: 'yergrupkod', text: 'Depo Grup', genislikCh: 10 }), new GridKolon({ belirtec: 'yergrupadi', text: 'Depo Grup Adı', genislikCh: 20, sql: 'ygrp.aciklama' }))
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.yer2GrupBagla() }
}
class DMQStok extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Stok' } static get zeminRenkDesteklermi() { return true }
	static get kodListeTipi() { return 'STK' } static get table() { return 'stkmst' } static get tableAlias() { return 'stk' }
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
	static get kodListeTipi() { return 'STKMARKA' } static get table() { return 'stokmarka' } static get tableAlias() { return 'smar' }
}
class DMQHizmetAnaGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Hizmet Ana Grup' }
	static get kodListeTipi() { return 'HIZANAGRP' } static get table() { return 'hizanagrup' } static get tableAlias() { return 'agrp' }
}
class DMQHizmetGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Hizmet Grup' }
	static get kodListeTipi() { return 'HIZGRP' } static get table() { return 'hizgrup' } static get tableAlias() { return 'grp' }
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 20, sql: 'agrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); const {sent} = e; sent.hizmetGrup2AnaGrupBagla() }
}
class DMQHizmetIstGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Hizmet İst. Grup' }
	static get kodListeTipi() { return 'HIZISTGRP' } static get table() { return 'hizistgrup' } static get tableAlias() { return 'higrp' }
}
class DMQHizmet extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Hizmet' } static get zeminRenkDesteklermi() { return true }
	static get kodListeTipi() { return 'HIZ' } static get table() { return 'hizmst' } static get tableAlias() { return 'hiz' }
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
	static get kodListeTipi() { return 'CARTIP' } static get table() { return 'cartip' } static get tableAlias() { return 'ctip' }
}
class DMQCariIstGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Cari İst. Grup' }
	static get kodListeTipi() { return 'CARISTGRP' } static get table() { return 'caristgrup' } static get tableAlias() { return 'cigrp' }
}
class DMQCariAnaBolge extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ana Bölge' }
	static get kodListeTipi() { return 'CARANABOLGE' } static get table() { return 'caranabolge' } static get tableAlias() { return 'abol' }
}
class DMQCariBolge extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Bölge' }
	static get kodListeTipi() { return 'CARBOLGE' } static get table() { return 'carbolge' } static get tableAlias() { return 'bol' }
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'anabolgekod', text: 'Ana Bölge', genislikCh: 10 }),
			new GridKolon({ belirtec: 'anabolgeadi', text: 'Ana Bölge Adı', genislikCh: 20, sql: 'abol.aciklama' })
		)
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments)
		sent.bolge2AnaBolgeBagla()
	}
}
class DMQIl extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'İl' }
	static get kodListeTipi() { return 'IL' } static get table() { return 'caril' } static get tableAlias() { return 'il' }
}
class DMQUlke extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ülke' }
	static get kodListeTipi() { return 'ULKE' } static get table() { return 'ulke' } static get tableAlias() { return 'ulk' }
}
class DMQSubeGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Şube Grup' }
	static get kodListeTipi() { return 'SUBEGRUP' } static get table() { return 'isygrup' } static get tableAlias() { return 'igrp' }
}
class DMQSube extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'SUBE' } static get sinifAdi() { return 'Şube' }
	static get table() { return 'isyeri' } static get tableAlias() { return 'sub' } static get bosKodAlinirmi() { return false }
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments);
		liste.push(
			new GridKolon({ belirtec: 'isygrupkod', text: 'Şube Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'isygrupadi', text: 'Şube Grup Adı', genislikCh: 20, sql: 'igrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments);
		sent.sube2GrupBagla()
	}
	static async loadServerDataDogrudan(e) {
		let recs = await super.loadServerDataDogrudan(e); if (recs == null) { return recs }
		recs.unshift({ kod: ' ', aciklama: '-Merkez Şube-' });
		return recs
	}
}
class DMQTakipGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Takip Grup' }
	static get kodListeTipi() { return 'TAKIPGRP' } static get table() { return 'takipgrup' } static get tableAlias() { return 'tgrp' }
}
class DMQTakipNo extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Takip No' }
	static get table() { return 'takipmst' } static get tableAlias() { return 'tak' }
	static get kodListeTipi() { return 'TAKIP' } static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'grupkod', text: 'Takip Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'grupadi', text: 'Takip Grup Adı', genislikCh: 20, sql: 'tgrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle({ sent, sent: { from } }) {
		super.loadServerData_queryDuzenle(...arguments)
		if (!from.aliasIcinTable('tgrp'))
			sent.takip2GrupBagla()
	}
}
class DMQCari extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Cari' } static get zeminRenkDesteklermi() { return true }
	static get kodListeTipi() { return 'CARI' } static get table() { return 'carmst' } static get tableAlias() { return 'car' }
	static get kodSaha() { return 'must' } static get adiSaha() { return 'birunvan' }
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'tipkod', text: 'Tip', genislikCh: 10 }), new GridKolon({ belirtec: 'tipadi', text: 'Tip Adı', genislikCh: 20, sql: 'ctip.aciklama' }),
			new GridKolon({ belirtec: 'bolgekod', text: 'Bölge', genislikCh: 10, }), new GridKolon({ belirtec: 'bolgeadi', text: 'Bölge Adı', genislikCh: 25, sql: 'bol.aciklama' }),
			new GridKolon({ belirtec: 'cistgrupkod', text: 'İst. Grup', genislikCh: 10 }), new GridKolon({ belirtec: 'cistgrupadi', text: 'İst. Grup Adı', genislikCh: 20, sql: 'cigrp.aciklama' })
		)
	}
	static super_orjBaslikListesiDuzenle(e) { super.orjBaslikListesiDuzenle(e) }
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments)
		sent.cari2TipBagla(); sent.cari2IstGrupBagla(); sent.cari2BolgeBagla(); sent.cari2IlBagla()
	}
	static super_loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e) }
}
class DMQAltHesap extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Alt Hesap' }
	static get kodListeTipi() { return 'ALTHESAP' } static get table() { return 'althesap' } static get tableAlias() { return 'alth' }
}
class DMQPlasiyer extends DMQCari {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PLASIYER' } static get sinifAdi() { return 'Plasiyer' } static get tableAlias() { return 'pls' }
	static orjBaslikListesiDuzenle(e) { super.super_orjBaslikListesiDuzenle(e) }
	static loadServerData_queryDuzenle({ sent }) {
		super.super_loadServerData_queryDuzenle(...arguments); let {tableAlias: alias} = this, {where: wh} = sent;
		wh.add(`${alias}.kayittipi = 'X'`)
	}
}
class DMQKasa extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Kasa' }
	static get kodListeTipi() { return 'KASA' } static get table() { return 'kasmst' } static get tableAlias() { return 'kas' }
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments);
		liste.push(
			new GridKolon({ belirtec: 'grupkod', text: 'Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'grupadi', text: 'Grup Adı', genislikCh: 25, sql: 'kgrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments); let {tableAlias: alias} = this;
		sent.fromIliski('kasagrup kgrp', `${alias}.grupkod = kgrp.kod`)
	}
}
class DMQKasaGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Kasa Grup' }
	static get kodListeTipi() { return 'KASAGRP' } static get table() { return 'kasagrup' } static get tableAlias() { return 'kgrp' }
}
class DMQBanka extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Banka' }
	static get kodListeTipi() { return 'BANKA' } static get table() { return 'banmst' } static get tableAlias() { return 'ban' }
}
class DMQBankaHesap extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Banka Hesap' }
	static get kodListeTipi() { return 'BANHESAP' } static get table() { return 'banbizhesap' } static get tableAlias() { return 'bhes' }
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments);
		liste.push(
			new GridKolon({ belirtec: 'bankakod', text: 'Banka', genislikCh: 10 }),
			new GridKolon({ belirtec: 'bankaadi', text: 'Banka Adı', genislikCh: 25, sql: 'ban.aciklama' }),
			new GridKolon({ belirtec: 'grupkod', text: 'Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'grupadi', text: 'Grup Adı', genislikCh: 25, sql: 'bhgrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments); let {tableAlias: alias} = this
		sent.bankaHesap2BankaBagla()
			.fromIliski('banhesapgrup bhgrp', `${alias}.grupkod = bhgrp.kod`)
	}
}
class DMQBankaHesapGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Banka Hesap Grup' }
	static get kodListeTipi() { return 'BANHESGRP' } static get table() { return 'banhesapgrup' } static get tableAlias() { return 'bhgrp' }
}

class DMQPosKrKosul extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tableAlias() { return 'kos' } static get table() { return 'poskosul' }
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'mevduathesapkod', text: 'Ban. Hesap', genislikCh: 15 }),
			new GridKolon({ belirtec: 'mevduathesapadi', text: 'Hesap Adı', genislikCh: 40, sql: 'bhes.aciklama' })
		)
	}
	static varsayilanKeyHostVarsDuzenle({ hv }) {
		super.varsayilanKeyHostVarsDuzenle(...arguments)
		let {almSat} = this
		if (almSat != null)
			hv.almsat = almSat
	}
	static loadServerData_queryDuzenle({ sent, sent: { sahalar } }) {
		super.loadServerData_queryDuzenle(...arguments)
		let {tableAlias: alias} = this
		sent.fromIliski('banbizhesap bhes', `${alias}.mevduathesapkod = bhes.kod`)
		sahalar.add('baktifmi')
	}
}
class DMQPosHesap extends DMQPosKrKosul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'POS Hesap' } static get kodListeTipi() { return '' }
	static get almSat() { return 'T' }
}
class DMQKrediKarti extends DMQPosKrKosul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Kredi Kartı' } static get kodListeTipi() { return  '' }
	static get almSat() { return 'A' }
}



class DMQMuhHesap extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Muhasebe Hesap' }
	static get kodListeTipi() { return 'MUHHESAP' } static get table() { return 'muhhesap' } static get tableAlias() { return 'mhes' }
}
class DMQMuhHesap_Kebir extends DMQMuhHesap {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'MUHHESAPKEB' } static get sinifAdi() { return 'Kebir Hesap' } static get tableAlias() { return 'khes' }
}
class DMQMuhGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Muhasebe Grup' }
	static get kodListeTipi() { return 'MUHHESAPGRP' } static get table() { return 'muhgrup' } static get tableAlias() { return 'mhgrp' }
}
class DMQHat extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Hat' }
	static get kodListeTipi() { return 'HAT' } static get table() { return 'ismerkezi' } static get tableAlias() { return 'hat' }
}
class DMQTezgah extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Tezgah' }
	static get kodListeTipi() { return 'TEZGAH' } static get table() { return 'tekilmakina' } static get tableAlias() { return 'tez' }
}
class DMQOperasyon extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Operasyon' }
	static get kodListeTipi() { return 'OPER' } static get table() { return 'operasyon' } static get tableAlias() { return 'op' } static get kodSaha() { return 'opno' }
}
class DMQPersonel extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Personel' }
	static get kodListeTipi() { return 'PER' } static get table() { return 'personel' } static get tableAlias() { return 'per' }
}
class DMQDepartman extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Departman' }
	static get kodListeTipi() { return 'DEP' } static get table() { return 'maldepartman' } static get tableAlias() { return 'dep' }
}
class DMQDurNeden extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Duraksama Nedeni' }
	static get kodListeTipi() { return 'DURNEDEN' } static get table() { return 'makdurneden' } static get tableAlias() { return 'dned' }
}
class DMQIskNeden extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Iskarta Nedeni' }
	static get kodListeTipi() { return 'ISKNEDEN' } static get table() { return 'opiskartanedeni' } static get tableAlias() { return 'ined' }
}
class DMQPDKSGorev extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Görev' }
	static get kodListeTipi() { return 'PERGOREV' } static get table() { return 'pergorev' } static get tableAlias() { return 'pgor' }
}
class DMQPDKSGorevTip extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Görev Tip' }
	static get kodListeTipi() { return 'GOREVTIP' } static get table() { return 'gorevtipi' } static get tableAlias() { return 'pgtip' }
}
class DMQPDKSNeden extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Neden' }
	static get kodListeTipi() { return 'PDKSIZINNDN' } static get table() { return 'pdksizinneden' } static get tableAlias() { return 'ned' }
}
class PDKSAnaTip extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultChar() { return '' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi(['YL', 'Yıllık', 'yillikmi']),
			new CKodVeAdi(['UC', 'Ücretli Diğer', 'ucretliDigermi']),
			new CKodVeAdi(['DG', 'Doğum', 'dogummu']),
			new CKodVeAdi(['EV', 'Evlenme', 'evlenmemi']),
			new CKodVeAdi(['OL', 'Ölüm', 'olummu']),
			new CKodVeAdi(['', 'Ücretsiz', 'ucretsizmi'])
		)
	}
}
class DMQPDKSAnaTip extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Ana Tip' } static get kodListeTipi() { return 'PDKSANATIP' }
	static loadServerDataDogrudan(e) { return PDKSAnaTip.kaListe }
}
class DMQKategori extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Kategori' }
	static get kodListeTipi() { return 'KATEGORI' } static get table() { return 'kategori' } static get tableAlias() { return 'kat' }
}
class DMQMasraf extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Masraf' }
	static get kodListeTipi() { return 'MASRAF' } static get table() { return 'stkmasraf' } static get tableAlias() { return 'mas' }
}
class DMQOzelIsaret extends MQOzelIsaret {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'OZELISARET' } static get defaultChar() { return ['', '*'] }
}
class DMQStokIslem extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Stok İşlem' }
	static get kodListeTipi() { return 'STKISL' } static get table() { return 'stkisl' } static get tableAlias() { return 'isl' }
}
class DMQMuhIslem extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Muhasebe İşlem' }
	static get kodListeTipi() { return 'MUHISL' } static get table() { return 'muhisl' } static get tableAlias() { return 'isl' }
}
class DMQStokVeMuhIslem extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Stok/Muh. İşlem' }
	static get kodListeTipi() { return 'STMHISL' } static get tableAlias() { return 'isl' }
	static async loadServerDataDogrudan(e = {}) {
		delete e.mfSinif
		return [
			...await DMQStokIslem.loadServerData({ ...e }),
			...await DMQMuhIslem.loadServerData({ ...e })
		]
	}
}

