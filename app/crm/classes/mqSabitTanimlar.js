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
	static get kodListeTipi() { return 'CRMZIYARETSONUC' } static get table() { return 'crmziyaretsonuc' } static get tableAlias() { return 'zsnc' }
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
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Müşteri' }
	static get kodListeTipi() { return 'CRMMUSTERI' } static get table() { return 'carmst' } static get tableAlias() { return 'car' }
	static get kodSaha() { return 'must' } static get adiSaha() { return 'birunvan' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { yore: new PInstStr('yore'), ilKod: new PInstStr('ilkod'), eMail: new PInstStr('email') }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 20 }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8 }), new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 15, sql: 'il.aciklama' }),
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
class MQZiyaretPlani extends MQSayacliOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ziyaret Planı' }
	static get kodListeTipi() { return 'CRMZIYARETPLANI' } static get table() { return 'crmziyaretplani' } static get tableAlias() { return 'zpln' }
	get planTarih() { const {planTS: ts} = this; return ts?.clearTime ? new Date(ts).clearTime() : ts } set planTarih(value) { this.planTS = value?.clearTime ? new Date(value).clearTime() : value }
	get planSaat() { return timeToString(this.planTS) } set planSaat(value) { const {planTS: ts} = this; if (value) { setTime(ts, asDate(value).getTime()) } }
	get teyitTarih() { const {teyitTS: ts} = this; return ts?.clearTime ? new Date(ts).clearTime() : ts } set teyitTarih(value) { this.teyitTS = value?.clearTime ? new Date(value).clearTime() : value }
	get teyitSaat() { return timeToString(this.teyitTS) } set teyitSaat(value) { const {teyitTS: ts} = this; if (value) { setTime(ts, asDate(value).getTime()) } }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			planTS: new PInstDateNow(), mustKod: new PInstStr('mustkod'), ziyaretciKod: new PInstStr('ziyaretcikod'),
			konuKod: new PInstStr('konukod'), teyitKisi: new PInstStr('teyitkisi'), teyitTS: new PInstDate('teyitzamani'), kisaBilgi: new PInstStr('kisabilgi') })
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {tableAlias: alias} = this, {liste} = e; liste.push(
			new GridKolon({ belirtec: 'plantarih', text: 'Plan Tarih', genislikCh: 10 }).tipDate(), new GridKolon({ belirtec: 'plansaat', text: 'Plan Saat', genislikCh: 10 }).tipZaman(),
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', genislikCh: 16 }), new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', genislikCh: 60, sql: 'car.birunvan' }),
			new GridKolon({ belirtec: 'ziyaretcikod', text: 'Ziyaretçi', genislikCh: 16 }), new GridKolon({ belirtec: 'ziyaretciadi', text: 'Ziyaretçi Adı', genislikCh: 35, sql: 'per.aciklama' }),
			new GridKolon({ belirtec: 'konukod', text: 'Konu', genislikCh: 10 }), new GridKolon({ belirtec: 'konuadi', text: 'Konu Adı', genislikCh: 30, sql: 'zkon.aciklama' }),
			new GridKolon({ belirtec: 'teyitkisi', text: 'Teyit Eden', genislikCh: 50 }),
			new GridKolon({ belirtec: 'teyitzamani', text: 'Teyit Tarih', genislikCh: 10 }).tipDate(), new GridKolon({ belirtec: 'teyitsaat', text: 'Teyit Saat', genislikCh: 10, sql: `${alias}.teyitzamani` }).tipZaman(),
			new GridKolon({ belirtec: 'kisabilgi', text: 'Kısa Bilgi', genislikCh: 110 })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {tableAlias: alias} = this;
		sent.fromIliski('carmst car', `${alias}.mustkod = car.must`).fromIliski('personel per', `${alias}.ziyaretcikod = per.kod`)
			.fromIliski('crmziyaretkonu zkon', `${alias}.konukod = zkon.kod`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(3); form.addDateInput('planTarih', 'Plan Tarih'); form.addTimeInput('planSaat', 'Plan Saat');
			form.addModelKullan('mustKod', 'Müşteri').comboBox().setMFSinif(MQCari); form.addModelKullan('ziyaretciKod', 'Ziyaretçi').comboBox().setMFSinif(MQPersonel);
			form.addModelKullan('konuKod', 'Konu').comboBox().setMFSinif(MQZiyaretKonu); form.addTextInput('teyitKisi', 'Teyit Eden').setMaxLength(40).addStyle_wh(600);
		form = tabPage_genel.addFormWithParent().altAlta(); form.addTextArea('kisaBilgi', 'Kısa Bilgi').setMaxLength(200).setRows(10)
	}
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { plantarih: this.planTarih, plansaat: this.planSaat }) }
	setValues(e) { super.setValues(e); const {rec} = e; $.extend(this, { planTarih: rec.plantarih, planSaat: rec.plansaat }) }
}
class MQZiyaret extends MQSayacliOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ziyaret' }
	static get kodListeTipi() { return 'CRMZIYARET' } static get table() { return 'crmziyaretplani' } static get tableAlias() { return 'zyr' }
	get tarih() { const {ts} = this; return ts?.clearTime ? new Date(ts).clearTime() : ts } set tarih(value) { this.ts = value?.clearTime ? new Date(value).clearTime() : value }
	get saat() { return timeToString(this.ts) } set saat(value) { const {ts} = this; if (value) { setTime(ts, asDate(value).getTime()) } }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			planSayac: new PInstNum('plansayac'), ts: new PInstDateNow('ziyaretzamani'), mustKod: new PInstStr('mustkod'), ziyaretciKod: new PInstStr('ziyaretcikod'),
			konuKod: new PInstStr('konukod'), sonucKod: new PInstStr('sonuckod'), kisiler: new PInstStr('kisiler'), gorusmeNotu: new PInstStr('gorusmenotu') })
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {tableAlias: alias} = this, {liste} = e; liste.push(
			new GridKolon({ belirtec: 'ziyaretzamani', text: 'Tarih', genislikCh: 10 }).tipDate(), new GridKolon({ belirtec: 'ziyaretsaat', text: 'Saat', genislikCh: 10 }).tipZaman(),
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', genislikCh: 16 }), new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', genislikCh: 60, sql: 'car.birunvan' }),
			new GridKolon({ belirtec: 'ziyaretcikod', text: 'Ziyaretçi', genislikCh: 16 }), new GridKolon({ belirtec: 'ziyaretciadi', text: 'Ziyaretçi Adı', genislikCh: 35, sql: 'per.aciklama' }),
			new GridKolon({ belirtec: 'konukod', text: 'Konu', genislikCh: 10 }), new GridKolon({ belirtec: 'konuadi', text: 'Konu Adı', genislikCh: 30, sql: 'zkon.aciklama' }),
			new GridKolon({ belirtec: 'sonuckod', text: 'Sonuç', genislikCh: 10 }), new GridKolon({ belirtec: 'sonucadi', text: 'Sonuç Adı', genislikCh: 40, sql: 'zsnc.aciklama' }),
			new GridKolon({ belirtec: 'kisiler', text: 'Kişiler', genislikCh: 110 }), new GridKolon({ belirtec: 'gorusmenotu', text: 'Görüşme Notu', genislikCh: 110 })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {tableAlias: alias} = this;
		sent.fromIliski('carmst car', `${alias}.mustkod = car.must`).fromIliski('personel per', `${alias}.ziyaretcikod = per.kod`)
			.fromIliski('crmziyaretkonu zkon', `${alias}.konukod = zkon.kod`).fromIliski('crmziyaretsonuc zson', `${alias}.sonuckod = zson.kod`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(3); form.addModelKullan('planSayac', 'Plan').comboBox().kodsuz().setMFSinif(MQZiyaretPlani);
			form.addDateInput('tarih', 'Tarih'); form.addTimeInput('saat', 'Saat');
			form.addModelKullan('mustKod', 'Müşteri').comboBox().setMFSinif(MQCari); form.addModelKullan('ziyaretciKod', 'Ziyaretçi').comboBox().setMFSinif(MQPersonel);
			form.addModelKullan('konuKod', 'Konu').comboBox().setMFSinif(MQZiyaretKonu); form.addModelKullan('sonucKod', 'Sonuç').comboBox().setMFSinif(MQZiyaretSonuc);
		form = tabPage_genel.addFormWithParent().yanYana();
			form.addTextArea('kisiler', 'Kişiler').setMaxLength(150).setRows(10); form.addTextArea('gorusmeNotu', 'Görüşme Notu').setMaxLength(200).setRows(10)
	}
}
