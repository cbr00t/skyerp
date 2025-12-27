class BDMQPersonel extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PER' } static get sinifAdi() { return 'Personel' }
	static get table() { return 'personel' } static get tableAlias() { return 'per' }
	static get zeminRenkDesteklermi() { return true }
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		let {tableAlias: alias} = this
		sec
			.addKA('grup', BDMQPerGrup, `${alias}.grupkod`, 'grp.aciklama', true)
			.addKA('dep', BDMQPerDep, `${alias}.depkod`, 'dep.aciklama', true)
			.addKA('isyeri', BDMQDepIsyeri, 'dep.isyerikod', 'isy.birunvan', true)
			.addKA('gorev', BDMQPerGorev, `${alias}.gorevkod`, 'gor.aciklama', true)
			.addKA('tip', BDMQPerGorevTipi, 'gor.tipkod', 'tip.aciklama', true)
			.addKA('birim', BDMQPerBirim, `${alias}.birimkod`, 'brm.aciklama', true)
			.addKA('uzmanlik', BDMQPerUzmanlik, `${alias}.uzmanlikkod`, 'uzm.aciklama', true)
			.addKA('yaka', BDMQPerYaka, `${alias}.yakakod`, 'yak.aciklama', true)
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {tableAlias: alias} = this
		liste.push(...[
			new GridKolon({ belirtec: 'adi', text: 'Adı', genislikCh: 40 }),
			new GridKolon({ belirtec: 'soyadi', text: 'Soyadı', genislikCh: 40 }),
			new GridKolon({ belirtec: 'cinsiyetText', text: 'Cinsiyet', genislikCh: 10, sql: Cinsiyet.getClause(`${alias}.cinsiyet`), filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'medeniText', text: 'Medeni Durum', genislikCh: 10, sql: MedeniDurum.getClause(`${alias}.medeni`), filterType: 'checkedlist' }),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'grupkod', text: 'Grup', genislikCh: 10, filterType: 'checkedlist' }),
				new GridKolon({ belirtec: 'grupadi', text: 'Grup Adı', genislikCh: 25, sql: 'grp.aciklama', filterType: 'checkedlist' })
			),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'depkod', text: 'Departman', genislikCh: 10, filterType: 'checkedlist' }),
				new GridKolon({ belirtec: 'depadi', text: 'Dep. Adı', genislikCh: 25, sql: 'dep.aciklama', filterType: 'checkedlist' })
			),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'isyerikod', text: 'İşyeri', genislikCh: 10, sql: 'dep.isyerikod', filterType: 'checkedlist' }),
				new GridKolon({ belirtec: 'isyeriadi', text: 'İşyeri Adı', genislikCh: 25, sql: 'isy.birunvan', filterType: 'checkedlist' })
			),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'masrafkod', text: 'Masraf', genislikCh: 10, filterType: 'checkedlist' }),
				new GridKolon({ belirtec: 'masrafadi', text: 'Masraf Adı', genislikCh: 25, sql: 'mas.aciklama', filterType: 'checkedlist' })
			),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'gorevkod', text: 'Görev', genislikCh: 10, filterType: 'checkedlist' }),
				new GridKolon({ belirtec: 'gorevadi', text: 'Görev Adı', genislikCh: 25, sql: 'gor.aciklama', filterType: 'checkedlist' })
			),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'gorevtipkod', text: 'Görev Tipi', genislikCh: 10, sql: 'gor.tipkod', filterType: 'checkedlist' }),
				new GridKolon({ belirtec: 'gorevtipadi', text: 'Görev Tip Adı', genislikCh: 25, sql: 'tip.aciklama', filterType: 'checkedlist' })
			),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'birimkod', text: 'Birim', genislikCh: 10, filterType: 'checkedlist' }),
				new GridKolon({ belirtec: 'birimadi', text: 'Birim Adı', genislikCh: 25, sql: 'brm.aciklama', filterType: 'checkedlist' })
			),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'uzmanlikkod', text: 'Uzmanlık', genislikCh: 10, filterType: 'checkedlist' }),
				new GridKolon({ belirtec: 'uzmanlikadi', text: 'Uzm. Adı', genislikCh: 25, sql: 'uzm.aciklama', filterType: 'checkedlist' })
			),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'yakakod', text: 'Yaka', genislikCh: 10, filterType: 'checkedlist' }),
				new GridKolon({ belirtec: 'yakaadi', text: 'Yaka Adı', genislikCh: 25, sql: 'yak.aciklama', filterType: 'checkedlist' })
			),
			new GridKolon({ belirtec: 'sskdurum', text: 'SGK Durum', genislikCh: 10, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'isegiristarih', text: 'İşe Giriş', genislikCh: 13, filterType: 'checkedlist' }).tipTarih(),
			new GridKolon({ belirtec: 'istencikistarihi', text: 'İşten Çıkış', genislikCh: 13, filterType: 'checkedlist' }).tipTarih(),
			new GridKolon({ belirtec: 'basgariucretlidir', text: 'Asgari Ücretli?', genislikCh: 10, filterType: 'checkedlist' }).tipBool(),
			new GridKolon({ belirtec: 'ucret', text: 'Ücret', genislikCh: 17 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'ucretTipiText', text: 'Ücret Tipi', genislikCh: 10, sql: BrUcretTipi.getClause(`${alias}.ucrettipi`), filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'netBrutText', text: 'Net/Brüt', genislikCh: 10, sql: NetBrut.getClause(`${alias}.netbrut`), filterType: 'checkedlist' })
		])
	}
	static loadServerData_queryDuzenle({ sent, sent: { where: wh, sahalar } }) {
		super.loadServerData_queryDuzenle(...arguments)
		let {tableAlias: alias} = this
		sent
			.fromIliski('pergrup grp', `${alias}.grupkod = grp.kod`)
			.fromIliski('departman dep', `${alias}.depkod = dep.kod`)
			.fromIliski('bgorev gor', `${alias}.gorevkod = gor.kod`)
			.fromIliski('permasraf mas', `${alias}.masrafkod = mas.kod`)
			.fromIliski('perbirim brm', `${alias}.birimkod = brm.kod`)
			.fromIliski('peruzmanlik uzm', `${alias}.uzmanlikkod = uzm.kod`)
			.fromIliski('peryaka yak', `${alias}.yakakod = yak.kod`)
		sahalar.addWithAlias(alias, 'isegiristarih', 'istencikistarihi')
	}
}

class BDMQPerDep extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'DEP' } static get sinifAdi() { return 'Departman' }
	static get table() { return 'departman' } static get tableAlias() { return 'dep' }
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {tableAlias: alias} = this
		liste.push(...[
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'isyerikod', text: 'İşyeri', genislikCh: 10, filterType: 'checkedlist' }),
				new GridKolon({ belirtec: 'isyeriadi', text: 'İşyeri Adı', genislikCh: 25, sql: 'isy.birunvan', filterType: 'checkedlist' })
			)
		])
	}
	static loadServerData_queryDuzenle({ sent, sent: { where: wh, sahalar } }) {
		super.loadServerData_queryDuzenle(...arguments)
		sent.fromIliski('bisyeri isy', `${alias}.isyerikod = isy.kod`)
	}
}

class BDMQPerGorev extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'GOREV' } static get sinifAdi() { return 'Görev' }
	static get table() { return 'bgorev' } static get tableAlias() { return 'gor' }
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {tableAlias: alias} = this
		liste.push(...[
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'tipkod', text: 'Görev Tipi', genislikCh: 10, filterType: 'checkedlist' }),
				new GridKolon({ belirtec: 'tipadi', text: 'Görev Tip Adı', genislikCh: 25, sql: 'tip.aciklama', filterType: 'checkedlist' })
			)
		])
	}
	static loadServerData_queryDuzenle({ sent, sent: { where: wh, sahalar } }) {
		super.loadServerData_queryDuzenle(...arguments)
		sent.fromIliski('bgorevtipi tip', `${alias}.tipkod = tip.kod`)
	}
}

class BDMQPerGrup extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PERGRUP' } static get sinifAdi() { return 'Per. Grup' }
	static get table() { return 'pergrup' } static get tableAlias() { return 'grp' }
}
class BDMQPerMasraf extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PERMASRAF' } static get sinifAdi() { return 'Masraf' }
	static get table() { return 'permasraf' } static get tableAlias() { return 'mas' }
}
class BDMQPerBirim extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PERBIRIM' } static get sinifAdi() { return 'Birim' }
	static get table() { return 'perbirim' } static get tableAlias() { return 'brm' }
}
class BDMQDepIsyeri extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'ISYERI' } static get sinifAdi() { return 'İşyeri' }
	static get table() { return 'bisyeri' } static get tableAlias() { return 'isy' }
	static get adiSaha() { return 'birunvan' }
}
class BDMQPerGorevTipi extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'GOREVTIPI' } static get sinifAdi() { return 'Görev Tipi' }
	static get table() { return 'bgorevtipi' } static get tableAlias() { return 'tip' }
}
class BDMQPerUzmanlik extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'UZMANLIK' } static get sinifAdi() { return 'Uzmanlık' }
	static get table() { return 'peruzmanlik' } static get tableAlias() { return 'uzm' }
}
class BDMQPerYaka extends DMQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'YAKA' } static get sinifAdi() { return 'Yaka' }
	static get table() { return 'peryaka' } static get tableAlias() { return 'yak' }
}

class BDMQGOFirma extends DMQGuidVeAdi {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'GOFIRMA' } static get sinifAdi() { return 'GO Firma' }
	static get table() { return 'gyuzfirma' } static get tableAlias() { return 'gfir' }
	static get kodSaha() { return 'webrefid' }
}
class BDMQGOBolge extends DMQGuidVeAdi {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'GOBOLGE' } static get sinifAdi() { return 'GO Bölge' }
	static get table() { return 'gyuzbolge' } static get tableAlias() { return 'gbol' }
	static get kodSaha() { return 'webrefid' }
}

/*filtre ek(başa): Firma (SecimBirKismi) - MstGOFirma - gyuzfirma gfir - webrefid ve aciklama sahalar var (webrefid guid degerdir)
filtre ek(başa): Bölge (SecimBirKismi) - MstGOBolge - gyuzbolge gbol - webrefid ve aciklama*/
