class MQCariUlke extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ülke' }
	static get kodListeTipi() { return 'CULKE' } static get table() { return 'ulke' } static get tableAlias() { return 'ulk' }
}
class MQCariIl extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'İl' }
	static get kodListeTipi() { return 'CIL' } static get table() { return 'caril' } static get tableAlias() { return 'il' }
}
class MQCariTip extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Cari Tip' }
	static get kodListeTipi() { return 'CTIP' } static get table() { return 'cartip' } static get tableAlias() { return 'ctip' }
}
class MQCari extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'ERP Cari' }
	static get kodListeTipi() { return 'CARI' } static get table() { return 'carmst' } static get tableAlias() { return 'car' }
	static get kodSaha() { return 'must' } static get adiSaha() { return 'birunvan' } static get adiEtiket() { return 'Ünvan' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			calismaDurumu: new PInstTrue('calismadurumu'), unvan1: new PInstStr('unvan1'), unvan2: new PInstStr('unvan2'),
			adres1: new PInstStr('adres1'), adres2: new PInstStr('adres2'), adresKod: new PInstNum('adreskod'),
			yore: new PInstStr('yore'), posta: new PInstNum('posta'), ulkeKod: new PInstStr('ulkekod'), ilKod: new PInstStr('ilkod'),
			tipKod: new PInstStr('tipkod')
		})
	}
	static ekCSSDuzenle(e) { const {rec, result} = e; if (!asBool(rec.calismadurumu)) { result.push('bg-lightgray', 'iptal') } }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 20, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8, filterType: 'checkedlist' }), new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 20, sql: 'il.aciklama' }),
			new GridKolon({ belirtec: 'ulkekod', text: 'Ülke', genislikCh: 8, filterType: 'checkedlist' }), new GridKolon({ belirtec: 'ulkeadi', text: 'Ülke Adı', genislikCh: 20, sql: 'ulk.aciklama' }),
			new GridKolon({ belirtec: 'tipkod', text: 'Tip', genislikCh: 8, filterType: 'checkedlist' }), new GridKolon({ belirtec: 'tipadi', text: 'Tip Adı', genislikCh: 20, sql: 'ctip.aciklama' }),
			new GridKolon({ belirtec: 'biradres', text: 'Adres' })
		)
	}
	static rootFormBuilderDuzenle(e) {
		this.formBuilder_addTabPanelWithGenelTab(e); const tabPage_genel = e.tabPage_genel; tabPage_genel.addStyle(e => `$elementCSS .baslik { color: cadetblue }`);
		let form = tabPage_genel.addFormWithParent().yanYana(2);
		form.addTextInput('unvan1', 'Ünvan 1').setMaxLength(50); form.addTextInput('unvan2', 'Ünvan 2').setMaxLength(50);
		form.addTextInput('adres1', 'Adres 1').setMaxLength(50); form.addTextInput('adres2', 'Adres 2').setMaxLength(50);
		form = tabPage_genel.addFormWithParent().yanYana(5); form.addTextInput('adresKod', 'Adres Kodu').setMaxLength(10).addStyle_wh(150);
		form.addTextInput('yore', 'Yöre').setMaxLength(30); form.addTextInput('posta', 'Posta').setMaxLength(10).addStyle_wh(130);
		form.addModelKullan('ilKod', 'İl').comboBox().setMFSinif(MQCariIl).addStyle_wh(200); form.addModelKullan('ulkeKod', 'Ülke').dropDown().setMFSinif(MQCariUlke).addStyle_wh(250);
		form.addModelKullan('tipKod', 'Tip').comboBox().setMFSinif(MQCariTip).addStyle_wh(200)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, alias = this.tableAlias;
		sent.fromIliski('caril il', `${alias}.ilkod = il.kod`).fromIliski('ulke ulk', `${alias}.ulkekod = ulk.kod`).fromIliski('cartip ctip', `${alias}.tipkod = ctip.kod`);
		sent.where.add(`${alias}.silindi = ''`); sent.sahalar.add('calismadurumu')
	}
}
