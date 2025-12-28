class DRapor_BDRaporBase extends DRapor_AraSeviye {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return null }
	static get kod() { return null } static get aciklama() { return null }
	// static get kategoriKod() { return 'BORDRO' } static get kategoriAdi() { return 'Bordro' }
}
class DRapor_BDRaporBase_Main extends DRapor_AraSeviye_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_BDRaporBase }
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		sec
			.addKA('grup', BDMQPerGrup, 'per.grupkod', 'grp.aciklama', true)
			.addKA('dep', BDMQPerDep, 'per.depkod', 'dep.aciklama', true)
			.addKA('isyeri', BDMQDepIsyeri, 'dep.isyerikod', 'isy.birunvan', true)
			.addKA('gorev', BDMQPerGorev, 'per.gorevkod', 'gor.aciklama', true)
			.addKA('tip', BDMQPerGorevTipi, 'gor.tipkod', 'tip.aciklama', true)
			.addKA('birim', BDMQPerBirim, 'per.birimkod', 'brm.aciklama', true)
			.addKA('uzmanlik', BDMQPerUzmanlik, 'per.uzmanlikkod', 'uzm.aciklama', true)
			.addKA('yaka', BDMQPerYaka, 'per.yakakod', 'yak.aciklama', true)
	}
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments)
		result
			.addKAPrefix('per', 'grup', 'dep', 'isyeri', 'gorev', 'tip', 'birim', 'uzmanlik', 'yaka')
			.addGrupBasit('PER', 'Personel', 'per', BDMQPersonel)
			.addGrupBasit('GRUP', 'Grup', 'grup', BDMQPerGrup)
			.addGrupBasit('DEP', 'Departman', 'dep', BDMQPerDep)
			.addGrupBasit('ISYERI', 'İşyeri', 'isyeri', BDMQDepIsyeri)
			.addGrupBasit('GOREV', 'Görev', 'gorev', BDMQPerGorev)
			.addGrupBasit('TIP', 'Görev Tipi', 'tip', BDMQPerGorevTipi)
			.addGrupBasit('BIRIM', 'Birim', 'birim', BDMQPerBirim)
			.addGrupBasit('UZMANLIK', 'Uzmanlık', 'uzmanlik', BDMQPerUzmanlik)
			.addGrupBasit('YAKA', 'Yaka', 'yaka', BDMQPerYaka)
	}
	loadServerData_queryDuzenle({ attrSet, stm }) {
		let e = arguments[0]
		super.loadServerData_queryDuzenle(e)
	}
	loadServerData_queryDuzenle_tekil({ attrSet, stm }) {
		let e = arguments[0]
		super.loadServerData_queryDuzenle_tekil(e)
		for (let sent of stm) {
			let {where: wh, sahalar} = sent
			if (attrSet.DEP || attrSet.ISYERI)
				sent.fromIliski('departman dep', 'per.depkod = dep.kod')
			if (attrSet.GOREV || attrSet.TIP)
				sent.fromIliski('bgorev gor', 'per.gorevkod = gor.kod')
			// sent.brPer2HepsiBagla()
			for (let key in attrSet) {
				switch (key) {
					case 'PER':
						sahalar.add('per.kod perkod', 'per.aciklama peradi')
						wh.icerikKisitDuzenle_personel({ ...e, saha: 'per.kod' })
						break
					case 'GRUP':
						sent.fromIliski('pergrup grp', 'per.grupkod = grp.kod')
						sahalar.add('per.grupkod', 'grp.aciklama grupadi')
						break
					case 'DEP':
						sahalar.add('per.depkod', 'dep.aciklama depadi')
						break
					case 'ISYERI':
						sent.fromIliski('bisyeri isy', 'dep.isyerikod = isy.kod')
						sahalar.add('dep.isyerikod', 'isy.birunvan isyeriadi')
						break
					case 'GOREV':
						sahalar.add('per.gorevkod', 'gor.aciklama goradi')
						break
					case 'TIP':
						sent.fromIliski('bgorevtipi tip', 'gor.tipkod = tip.kod')
						sahalar.add('gor.tipkod', 'tip.aciklama tipadi')
						break
					case 'BIRIM':
						sent.fromIliski('perbirim brm', 'per.birimkod = brm.kod')
						sahalar.add('per.birimkod', 'brm.aciklama birimadi')
						break
					case 'UZMANLIK':
						sent.fromIliski('peruzmanlik uzm', 'per.uzmanlikkod = uzm.kod')
						sahalar.add('per.uzmanlikkod', 'uzm.aciklama uzmanlikadi')
						break
					case 'YAKA':
						sent.fromIliski('peryaka yak', 'per.yakakod = yak.kod')
						sahalar.add('per.yakakod', 'yak.aciklama yakaadi')
						break
				}
			}
		}
	}
}
