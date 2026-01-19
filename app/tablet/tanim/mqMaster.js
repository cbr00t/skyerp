class MQTabStokAnaGrup extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'STOKANAGRUP' } static get sinifAdi() { return 'Stok Ana Grup' }
	static get table() { return 'stkanagrup' } static get tableAlias() { return 'agrp' }
}
class MQTabStokGrup extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'STOKGRUP' } static get sinifAdi() { return 'Stok Grup' }
	static get table() { return 'stkgrup' } static get tableAlias() { return 'grp' }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, { anaGrupKod: new PInstStr('anagrupkod') })
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e)
		let {rootBuilder: rfb, tabPage_genel: tabPage} = e
		let form = tabPage.addFormWithParent().yanYana(5)
		form.addModelKullan('anaGrupKod', 'Ana Grup').dropDown().setMFSinif(MQTabStokAnaGrup).autoBind()
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 13 }),
			new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 20, sql: 'agrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle_son({ sent }) {
		super.loadServerData_queryDuzenle_son(...arguments)
		sent.stokGrup2AnaGrupBagla()
	}
}
class MQTabStokMarka extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'STOKMARKA' } static get sinifAdi() { return 'Stok Marka' }
	static get table() { return 'stokmarka' } static get tableAlias() { return 'smar' }
}

class MQTabBolge extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'BOLGE' } static get sinifAdi() { return 'Bölge' }
	static get table() { return 'carbolge' } static get tableAlias() { return 'bol' }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, { subeKod: new PInstStr('bizsubekod') })
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {tableAlias: alias} = this
		liste.push(
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'bizsubekod', text: 'Şube Kod', genislikCh: 8 }),
				new GridKolon({ belirtec: 'bizsubeadi', text: 'Şube', genislikCh: 15, sql: 'sub.aciklama' })
			)
		)
	}
	static loadServerData_queryDuzenle_son({ sent, sent: { sahalar, where: wh }, offlineRequest, offlineMode, alias = this.tableAlias }) {
		let e = arguments[0]; super.loadServerData_queryDuzenle_son(e)
		sent.x2SubeBagla({ alias })
		/*if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			let {adminmi, sefmi, session: { subeKod } = {}} = config
			if (!(adminmi || sefmi) && subeKod)
				wh.degerAta(subeKod, `${alias}.bizsubekod`)
		}*/
	}
}
class MQTabIl extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'IL' } static get sinifAdi() { return 'İl' }
	static get table() { return 'caril' } static get tableAlias() { return 'il' }
}
class MQTabCariTip extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'CTIP' } static get sinifAdi() { return 'Cari Tip' }
	static get table() { return 'cartip' } static get tableAlias() { return 'ctip' }
}
class MQTabUlke extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'ULKE' } static get sinifAdi() { return 'Ülke' }
	static get table() { return 'ulke' } static get tableAlias() { return 'ulk' }
}
class MQTabSube extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'SUBE' } static get sinifAdi() { return 'Şube' }
	static get table() { return 'isyeri' } static get tableAlias() { return 'sub' }
	static get bosKodAlinirmi() { return true }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, { grupKod: new PInstStr('isygrupkod') })
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {tableAlias: alias} = this
		liste.push(
			// new GridKolon({ belirtec: 'aum', text: 'AUM', genislikCh: 8 }),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'isygrupkod', text: 'Grup Kod', genislikCh: 8 }),
				new GridKolon({ belirtec: 'isygrupadi', text: 'Grup', genislikCh: 15, sql: 'igrp.aciklama' })
			)
		)
	}
	static loadServerData_queryDuzenle_son({ sent, sent: { sahalar, where: wh }, offlineRequest, offlineMode, alias = this.tableAlias }) {
		let e = arguments[0]; super.loadServerData_queryDuzenle_son(e)
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			let {adminmi, sefmi, session: { subeKod } = {}} = config
			if (!(adminmi || sefmi) && subeKod)
				wh.degerAta(subeKod, `${alias}.kod`)
		}
		else
			sent.fromIliski(`isygrup igrp`, `${alias}.isygrupkod = igrp.kod`)
	}
}
class MQTabSubeGrup extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'SGRP' } static get sinifAdi() { return 'Şube Grup' }
	static get table() { return 'isygrup' } static get tableAlias() { return 'igrp' }
}
class MQTabYer extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'YER' } static get sinifAdi() { return 'Yer (Depo)' }
	static get table() { return 'stkyer' } static get tableAlias() { return 'yer' }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			aum: new PInstStr('aum'),
			subeKod: new PInstStr('bizsubekod')
		})
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e)
		let {rootBuilder: rfb, tabPage_genel: tabPage} = e
		let form = tabPage.addFormWithParent().yanYana(5)
		form.addTextInput('aum', 'AUM').addStyle_wh(150)
		form.addModelKullan('subeKod', 'Şube').dropDown().setMFSinif(MQTabSube)
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {tableAlias: alias} = this
		liste.push(
			// new GridKolon({ belirtec: 'aum', text: 'AUM', genislikCh: 8 }),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'bizsubekod', text: 'Şube Kod', genislikCh: 8 }),
				new GridKolon({ belirtec: 'bizsubeadi', text: 'Şube', genislikCh: 15, sql: 'sub.aciklama' })
			)
		)
	}
	static loadServerData_queryDuzenle_son({ sent, sent: { sahalar, where: wh }, offlineRequest, offlineMode, alias = this.tableAlias }) {
		let e = arguments[0]; super.loadServerData_queryDuzenle_son(e)
		sent.x2SubeBagla({ alias })
		sahalar.addWithAlias(alias, 'aum')
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			let {adminmi, sefmi, session: { subeKod } = {}} = config
			if (!(adminmi || sefmi) && subeKod)
				wh.degerAta(subeKod, `${alias}.bizsubekod`)
			wh.inDizi(['', 'A'], `${alias}.aum`)
		}
	}
}

class MQTabNakliyeSekli extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'NAKLIYE' } static get sinifAdi() { return 'Nakliye Şekli' }
	static get table() { return 'naksekli' } static get tableAlias() { return 'nak' }
}
class MQTabTahsilSekli extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TAHSEKLI' } static get sinifAdi() { return 'Tahsilat Şekli' }
	static get table() { return 'tahsilsekli' } static get tableAlias() { return 'tsek' }
	static get kodSaha() { return 'kodno' } static get emptyKodValue() { return 0 }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			tip: new PInstTekSecim('tahsiltipi', TahsilSekliTip),
			altTip: new PInstTekSecim('ahalttipi', TahsilSekliAltTip),
			gunKodu: new PInstStr('ahgunkodu')
		})
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e)
		let {rootBuilder: rfb, tabPage_genel: tabPage} = e
		let form = tabPage.addFormWithParent().yanYana(5)
		form.addModelKullan('tip', 'Tip').dropDown().noMF().kodsuz().setSource(TahsilSekliTip.kaListe).autoBind()
		form.addModelKullan('altTip', 'Alt Tip').dropDown().noMF().kodsuz().setSource(TahsilSekliAltTip.kaListe).autoBind()
		form.addTextInput('gunKodu', 'Gün Kodu').addStyle_wh(150)
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {tableAlias: alias} = this
		liste.push(
			new GridKolon({ belirtec: 'tahsiltipitext', text: 'Tip', genislikCh: 13, sql: TahsilSekliTip.getClause(`${alias}.tahsiltipi`) }),
			new GridKolon({ belirtec: 'ahalttipitext', text: 'Alt Tip', genislikCh: 13, sql: TahsilSekliAltTip.getClause(`${alias}.ahalttipi`) }),
			new GridKolon({ belirtec: 'ahgunkodu', text: 'Gün Kodu', genislikCh: 10 })
		)
	}
	static loadServerData_queryDuzenle_son({ sent, sent: { sahalar, where: wh }, offlineRequest, offlineMode, alias = this.tableAlias }) {
		let e = arguments[0]; super.loadServerData_queryDuzenle_son(e)
		sahalar.addWithAlias(alias, 'tahsiltipi', 'ahalttipi')
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			wh.add(`${alias}.elterkullan <> ''`)
		}
	}
}

class MQPaket extends MQSayacliKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PAKET' } static get sinifAdi() { return 'Paket' }
	static get table() { return 'paket' } static get tableAlias() { return 'pak' }
	// static get zeminRenkDesteklermi() { return true }
	static get offlineGonderYapilirmi() { return false }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			anaCins: new PInstStr('anacins'),
			refSayac: new PInst('refsayac')
		})
	}
}
class MQUrunPaket extends MQSayacliOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'UPAK' } static get sinifAdi() { return 'Ürün Paket' }
	static get table() { return 'urunpaket' } static get tableAlias() { return 'upak' }
	static get offlineGonderYapilirmi() { return false }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			urunKod: new PInstStr('urunkod'),
			miktar: new PInstNum('urunmiktari'),
			varsayilanmi: new PInstBool('varsayilan'),
			paketSayac: new PInstNum('paketsayac'),
			refSayac: new PInst('refsayac')
		})
	}
}
class MQCariSatis extends MQMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'CSAT' } static get sinifAdi() { return 'Cari Satış' }
	static get table() { return 'carisatis' } static get tableAlias() { return 'csat' }
	static get offlineGonderYapilirmi() { return false }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			satisTipKod: new PInstStr('satistipkod'),
			mustKod: new PInstStr('must'),
			odemeGunKod: new PInstStr('odemegunkodu'),
			standartIskonto: new PInstNum('standartiskonto'),
			tahSekliNo: new PInst('tahseklino'),
			plasiyerKod: new PInstStr('tavsiyeplasiyerkod')
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {tableAlias: alias} = this
		liste.push(
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'must', text: 'Müşteri', genislikCh: 18 }),
				new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', genislikCh: 40, sql: 'car.aciklama' })
			),
			new GridKolon({ belirtec: 'odemegunkodu', text: 'Gün Kodu', genislikCh: 10 }),
			new GridKolon({ belirtec: 'standartiskonto', text: 'Std.İsk%', genislikCh: 13 }).tipDecimal(1),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'tahseklino', text: 'Tah.Şekli', genislikCh: 10 }).tipNumerik(),
				new GridKolon({ belirtec: 'tahsekliadi', text: 'Tah.Adı', genislikCh: 15, sql: 'tsek.aciklama' })
			),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'tavsiyeplasiyerkod', text: 'Plasiyer', genislikCh: 15 }),
				new GridKolon({ belirtec: 'tavsiyeplasiyeradi', text: 'Plasiyer İsim', genislikCh: 30, sql: 'pls.aciklama' })
			),
			new GridKolon({ belirtec: 'satistipkod', text: 'Sat.Tip', genislikCh: 13 })
		)
	}
	static loadServerData_queryDuzenle_son({ sent, sent: { sahalar, where: wh }, offlineRequest, offlineMode, alias = this.tableAlias }) {
		let e = arguments[0]; super.loadServerData_queryDuzenle_son(e)
		sahalar.addWithAlias(alias, 'satistipkod', 'must')
		wh.add(`${alias}.must <> ''`)
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			// wh.add(`${alias}.elterkullan <> ''`)
		}
		else {
			// Bilgi Al veya Offline Normal durum
			sent
				.fromIliski('carmst car', `${alias}.must = car.kod`)
				.leftJoin(alias, 'tahsilsekli tsek', `${alias}.tahseklino = tsek.kodno`)
				.fromIliski('carmst pls', `${alias}.tavsiyeplasiyerkod = pls.kod`)
		}
	}
	static orjBaslikListesi_groupsDuzenle({ liste }) {
		super.orjBaslikListesi_groupsDuzenle(liste)
		liste.push('tavsiyeplasiyeradi')
	}
	static gridVeriYuklendi({ sender: gridPart, sender: { gridWidget } }) {
		super.gridVeriYuklendi(...arguments)
		gridWidget.hidecolumn('tavsiyeplasiyeradi')
	}
	keyHostVarsDuzenle({ hv }) {
		super.keyHostVarsDuzenle(...arguments)
		let {satisTipKod: satistipkod, mustKod: must} = this
		$.extend(hv, { satistipkod, must })
	}
	keySetValues({ rec }) {
		super.keySetValues(...arguments)
		let {satistipkod: satisTipKod, must: mustKod} = rec
		$.extend(this, { satisTipKod, mustKod })
	}
}

class MQTabKasa extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'KASA' } static get sinifAdi() { return 'Kasa' }
	static get table() { return 'kasmst' } static get tableAlias() { return 'kas' }
}
class MQTabUgramaNeden extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'UGRNEDEN' } static get sinifAdi() { return 'Uğrama Nedeni' }
	static get table() { return 'ssugramasebep' } static get tableAlias() { return 'ned' }
}
class MQTabSevkAdres extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListetipi() { return 'SEVKADRES' } static get sinifAdi() { return 'Sevk Adresi' }
	static get table() { return 'carsevkadres' } static get tableAlias() { return 'sadr' }
	get unvan() { return birlestirBosluk(this.unvan1, this.unvan2) }
	get adres() { return birlestirBosluk(this.adres1, this.adres2) }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, { mustKod: new PInstStr('must')  })
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		let {tableAlias: alias} = this
		sec.addKA('must', MQTabCari, `${alias}.must`, 'car.aciklama')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(...[
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'must', text: 'Müşteri', genislikCh: 12 }),
				new GridKolon({ belirtec: 'mustunvan', text: 'Ünvan', genislikCh: 30, sql: 'car.aciklama' })
			),
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 20, sql: 'car.yore' }),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8, sql: 'car.ilkod' }),
				new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 25, sql: 'il.aciklama' })
			)
		])
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments)
		let {tableAlias: alias} = this
		sent.fromIliski('carmst car', `${alias}.must = car.kod`)
			.cari2IlBagla()
	}
}
