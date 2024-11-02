/*class MQX extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'X' }
	static get kodListeTipi() { return 'X' } static get table() { return 'crmx' } static get tableAlias() { return 'x' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { basi: new PInstNum('yasbasx'), sonu: new PInstNum('y') }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'x', text: 'X', genislikCh: 8 }).tipNumerik(), new GridKolon({ belirtec: 'y', text: 'Y', genislikCh: 8 }).tipNumerik())
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {tableAlias: alias} = this;
		sent.sahalar.add(`${alias}.x`, `${alias}.y`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(2); form.addTextInput('x', 'X').setMaxLength(36);
		form.addModelKullan('y', 'Y').comboBox().kodsuz().autoBind().setMFSinif(MQY);
	}
}*/
class MQGorev extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Görev' }
	static get kodListeTipi() { return 'CRMGOREV' } static get table() { return 'crmgorev' } static get tableAlias() { return 'grv' }
}
class MQCagriKaynak extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Çağrı Kaynak' }
	static get kodListeTipi() { return 'CRMCAGRIKAYNAK' } static get table() { return 'crmcagrikaynak' } static get tableAlias() { return 'ck' }
}
class MQIslemTuru extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'İşlem Türü' }
	static get kodListeTipi() { return 'CRMISLTUR' } static get table() { return 'crmislemturu' } static get tableAlias() { return 'itur' }
}
class MQZiyaretKonu extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ziyaret Konusu' }
	static get kodListeTipi() { return 'CRMZIYARETKONU' } static get table() { return 'crmziyaretkonu' } static get tableAlias() { return 'zkon' }
}
class MQZiyaretSonuc extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ziyaret Sonucu' }
	static get kodListeTipi() { return 'CRMZIYARETSONUC' } static get table() { return 'crmziyaretsonuc' } static get tableAlias() { return 'zson' }
}
class MQIl extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'İl' }
	static get kodListeTipi() { return 'CRMIL' } static get table() { return 'caril' } static get tableAlias() { return 'il' }
}
class MQPersonel extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Personel' }
	static get kodListeTipi() { return 'CRMPERSONEL' } static get table() { return 'personel' } static get tableAlias() { return 'per' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { gorevKod: new PInstStr('gorevkod'), eMail: new PInstStr('email') }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'gorevkod', text: 'Görev', genislikCh: 8 }), new GridKolon({ belirtec: 'gorevadi', text: 'Görev Adı', genislikCh: 20, sql: 'grv.aciklama' }),
			new GridKolon({ belirtec: 'email', text: 'e-Mail', genislikCh: 60 })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {tableAlias: alias} = this;
		sent.fromIliski('crmgorev grv', `${alias}.gorevkod = grv.kod`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(2); form.addModelKullan('gorevKod', 'Görev').addStyle_wh(300).dropDown().kodsuz().setMFSinif(MQGorev);
			form.addTextInput('eMail', 'e-Mail').setMaxLength(90).addStyle_wh(700)
	}
}
class MQCari extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Müşteri' } static get kodListeTipi() { return 'CRMMUSTERI' }
	static get table() { return 'carmst' } static get tableAlias() { return 'car' } static get kodSaha() { return 'must' } static get adiSaha() { return 'birunvan' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { yore: new PInstStr('yore'), ilKod: new PInstStr('ilkod'), eMail: new PInstStr('email') }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 20 }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8 }), new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 15, sql: 'il.aciklama' }),
			new GridKolon({ belirtec: 'email', text: 'e-Mail', genislikCh: 50 }),
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {tableAlias: alias} = this;
		sent.fromIliski('caril il', `${alias}.ilkod = il.kod`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(2); form.addTextInput('yore', 'Yöre').setMaxLength(20).addStyle_wh(300);
			form.addModelKullan('ilKod', 'İl').addStyle_wh(400).comboBox().kodsuz().setMFSinif(MQIl); form.addTextInput('eMail', 'e-Mail').setMaxLength(90).addStyle_wh(700)
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {hv} = e, {aciklama: birUnvan} = this, unvanTokens = uygunKelimeliParcalaBirlesik(birUnvan, 50);
		delete hv.birunvan; $.extend(hv, { unvan1: unvanTokens[0] ?? '', unvan2: unvanTokens?.slice(1)?.join(' ') ?? '' })
	}
}
