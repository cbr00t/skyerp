class MQZiyaretPlani extends MQSayacliOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ziyaret Planı' } static get gonderildiDesteklenirmi() { return true }
	static get kodListeTipi() { return 'CRMZIYARETPLANI' } static get table() { return 'crmziyaretplani' } static get tableAlias() { return 'zpln' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			planTS: new PInstDateTimeNow(), mustKod: new PInstStr('mustkod'), gorevliUserKod: new PInstStr('gorevlikullanicikod'),
			konuKod: new PInstStr('konukod'), teyitKisi: new PInstStr('teyitkisi'), teyitTS: new PInstDate('teyitzamani'), kisaBilgi: new PInstStr('kisabilgi') })
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {tableAlias: alias} = this, {liste} = e; liste.push(
			new GridKolon({ belirtec: 'plantarih', text: 'Plan Tarih', genislikCh: 10 }).tipDate(), new GridKolon({ belirtec: 'plansaat', text: 'Plan Saat', genislikCh: 10 }).tipZaman(),
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', genislikCh: 16 }), new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', genislikCh: 60, sql: 'car.birunvan' }),
			new GridKolon({ belirtec: 'gorevlikullanicikod', text: 'Ziyaretçi', genislikCh: 16 }), new GridKolon({ belirtec: 'ziyaretciadi', text: 'Ziyaretçi Adı', genislikCh: 35, sql: 'per.aciklama' }),
			new GridKolon({ belirtec: 'konukod', text: 'Konu', genislikCh: 10 }), new GridKolon({ belirtec: 'konuadi', text: 'Konu Adı', genislikCh: 30, sql: 'zkon.aciklama' }),
			new GridKolon({ belirtec: 'teyitkisi', text: 'Teyit Eden', genislikCh: 50 }),
			new GridKolon({ belirtec: 'teyitzamani', text: 'Teyit Tarih', genislikCh: 10 }).tipDate(), new GridKolon({ belirtec: 'teyitsaat', text: 'Teyit Saat', genislikCh: 10, sql: `${alias}.teyitzamani` }).tipZaman(),
			new GridKolon({ belirtec: 'kisabilgi', text: 'Kısa Bilgi', genislikCh: 110 })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {tableAlias: alias} = this;
		sent.fromIliski('carmst car', `${alias}.mustkod = car.must`).fromIliski('personel per', `${alias}.gorevlikullanicikod = per.kod`)
			.fromIliski('crmziyaretkonu zkon', `${alias}.konukod = zkon.kod`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(3); form.addDateInput('planTarih', 'Plan Tarih'); form.addTimeInput('planSaat', 'Plan Saat');
			form.addModelKullan('mustKod', 'Müşteri').comboBox().setMFSinif(MQCari); form.addModelKullan('gorevliUserKod', 'Ziyaretçi').comboBox().autoBind().setMFSinif(MQPersonel);
			form.addModelKullan('konuKod', 'Konu').comboBox().autoBind().setMFSinif(MQZiyaretKonu); form.addTextInput('teyitKisi', 'Teyit Eden').setMaxLength(40).addStyle_wh(600);
		form = tabPage_genel.addFormWithParent().altAlta(); form.addTextArea('kisaBilgi', 'Kısa Bilgi').setMaxLength(200).setRows(5)
	}
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { plantarih: this.planTarih, plansaat: this.planSaat }) }
	setValues(e) { super.setValues(e); const {rec} = e; $.extend(this, { planTarih: rec.plantarih, planSaat: rec.plansaat }) }
}
class MQZiyaret extends MQSayacliOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ziyaret' } static get gonderildiDesteklenirmi() { return true }
	static get kodListeTipi() { return 'CRMZIYARET' } static get table() { return 'crmziyaret' } static get tableAlias() { return 'zyr' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			planSayac: new PInst('plansayac'), ts: new PInstDateTimeNow('ziyaretzamani'), mustKod: new PInstStr('mustkod'), gorevliUserKod: new PInstStr('gorevlikullanicikod'),
			konuKod: new PInstStr('konukod'), sonucKod: new PInstStr('sonuckod'), kisiler: new PInstStr('kisiler'), gorusmeNotu: new PInstStr('gorusmenotu') })
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {tableAlias: alias} = this, {liste} = e; liste.push(
			new GridKolon({ belirtec: 'ziyaretzamani', text: 'Tarih', genislikCh: 10 }).tipDate(), new GridKolon({ belirtec: 'ziyaretsaat', text: 'Saat', genislikCh: 10, sql: `${alias}.ziyaretzamani` }).tipZaman(),
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', genislikCh: 16 }), new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', genislikCh: 60, sql: 'car.birunvan' }),
			new GridKolon({ belirtec: 'gorevlikullanicikod', text: 'Ziyaretçi', genislikCh: 16 }), new GridKolon({ belirtec: 'ziyaretciadi', text: 'Ziyaretçi Adı', genislikCh: 35, sql: 'per.aciklama' }),
			new GridKolon({ belirtec: 'konukod', text: 'Konu', genislikCh: 10 }), new GridKolon({ belirtec: 'konuadi', text: 'Konu Adı', genislikCh: 30, sql: 'zkon.aciklama' }),
			new GridKolon({ belirtec: 'sonuckod', text: 'Sonuç', genislikCh: 10 }), new GridKolon({ belirtec: 'sonucadi', text: 'Sonuç Adı', genislikCh: 40, sql: 'zson.aciklama' }),
			new GridKolon({ belirtec: 'kisiler', text: 'Kişiler', genislikCh: 110 }), new GridKolon({ belirtec: 'gorusmenotu', text: 'Görüşme Notu', genislikCh: 110 })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {tableAlias: alias} = this;
		sent.fromIliski('carmst car', `${alias}.mustkod = car.must`).fromIliski('personel per', `${alias}.gorevlikullanicikod = per.kod`)
			.fromIliski('crmziyaretkonu zkon', `${alias}.konukod = zkon.kod`).fromIliski('crmziyaretsonuc zson', `${alias}.sonuckod = zson.kod`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(3); form.addModelKullan('planSayac', 'Plan').comboBox().setMFSinif(MQZiyaretPlani).addStyle_wh(130);
			form.addDateInput('tarih', 'Tarih'); form.addTimeInput('saat', 'Saat');
			form.addModelKullan('mustKod', 'Müşteri').comboBox().setMFSinif(MQCari); form.addModelKullan('gorevliUserKod', 'Ziyaretçi').comboBox().autoBind().setMFSinif(MQPersonel);
			form.addModelKullan('konuKod', 'Konu').comboBox().autoBind().setMFSinif(MQZiyaretKonu); form.addModelKullan('sonucKod', 'Sonuç').comboBox().autoBind().setMFSinif(MQZiyaretSonuc);
		form = tabPage_genel.addFormWithParent().yanYana();
			form.addTextArea('kisiler', 'Kişiler').setMaxLength(150).setRows(5); form.addTextArea('gorusmeNotu', 'Görüşme Notu').setMaxLength(200).setRows(5)
	}
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { plansayac: this.planSayac ?? null }) }
}
