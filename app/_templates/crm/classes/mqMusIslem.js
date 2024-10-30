class MQMusIslem extends MQDetayliMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Müşteri İşlemi' }
	static get detaySinif() { return MQMusIslemDetay } static get gridKontrolcuSinif() { return MQMusIslemGridci }
	static get kodListeTipi() { return 'CRMMUSISLEM' } static get table() { return 'crmmusislem' } static get tableAlias() { return 'fis' } static get hasTabs() { return true }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			seri: new PInstStr('seri'), fisNo: new PInstStr('fisno'), mustKod: new PInstStr('mustkod'), zamanTS: new PInstDateTimeNow('zamants'), terminTS: new PInstDateTime('termints'),
			bitisTS: new PInstDateTime('bitists'), gorevliKullaniciKod: new PInstStr('gorevlikullanicikod'), islemTurKod: new PInstStr('islemturkod'),
			refSatisSayac: new PInstNum('refsatissayac'), refSipSayac: new PInstNum('refsipsayac'), teslimKullaniciKod: new PInstStr('teslimkullanicikod'),
			yapilacakIs: new PInstStr('yapilacakis'), bitisAciklama: new PInstStr('bitisaciklama')
		})
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {tableAlias: alias} = this, {liste} = e; liste.push(
			new GridKolon({ belirtec: 'seri', text: 'Seri', genislikCh: 8 }), new GridKolon({ belirtec: 'fisno', text: 'No', genislikCh: 18 }).tipNumerik(),
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', genislikCh: 16 }), new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', genislikCh: 60, sql: 'car.birunvan' }),
			new GridKolon({ belirtec: 'zamants', text: 'İşlem Tarih', genislikCh: 10 }).tipDate(), new GridKolon({ belirtec: 'zamansaat', text: 'İşlem Saat', genislikCh: 10, sql: `${alias}.zamants` }).tipZaman(),
			new GridKolon({ belirtec: 'termints', text: 'Termin Tarih', genislikCh: 10 }).tipDate(), new GridKolon({ belirtec: 'terminsaat', text: 'Termin Saat', genislikCh: 10, sql: `${alias}.termints` }).tipZaman(),
			new GridKolon({ belirtec: 'bitists', text: 'Bitiş Tarih', genislikCh: 10 }).tipDate(), new GridKolon({ belirtec: 'bitissaat', text: 'Bitiş Saat', genislikCh: 10, sql: `${alias}.bitists` }).tipZaman(),
			new GridKolon({ belirtec: 'gorevlikullanicikod', text: 'Görevli Kullanıcı', genislikCh: 16 }), new GridKolon({ belirtec: 'gorevlikullaniciadi', text: 'Görevli Adı', genislikCh: 30, sql: 'gper.aciklama' }),
			new GridKolon({ belirtec: 'islemturkod', text: 'İşlem Türü', genislikCh: 10 }), new GridKolon({ belirtec: 'islemturadi', text: 'İşlem Tür Adı', genislikCh: 20, sql: 'itur.aciklama' }),
			new GridKolon({ belirtec: 'teslimkullanicikod', text: 'Teslim Eden', genislikCh: 16 }), new GridKolon({ belirtec: 'teslimkullaniciadi', text: 'Teslim Eden Adı', genislikCh: 30, sql: 'tper.aciklama' }),
			new GridKolon({ belirtec: 'yapilacakis', text: 'Yapılacak İş', genislikCh: 200 }), new GridKolon({ belirtec: 'bitisaciklama', text: 'Bitiş Açıklama', genislikCh: 150 })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {tableAlias: alias} = this;
		sent.fromIliski('carmst car', `${alias}.mustkod = car.must`).fromIliski('personel gper', `${alias}.gorevlikullanicikod = gper.kod`)
			.fromIliski('crmislemturu itur', `${alias}.islemturkod = itur.kod`).fromIliski('personel tper', `${alias}.teslimkullanicikod = tper.kod`)
	}
	static orjBaslikListesiDuzenle_detaylar(e) {
		super.orjBaslikListesiDuzenle_detaylar(e); const {tableAlias: alias} = this.detaySinif, {liste} = e; liste.push(
			new GridKolon({ belirtec: 'detayts', text: 'Tarih', genislikCh: 10 }).tipDate(), new GridKolon({ belirtec: 'detaysaat', text: 'Saat', genislikCh: 10, sql: `${alias}.detayts` }).tipZaman(),
			new GridKolon({ belirtec: 'detaykullanicikod', text: 'Kullanıcı', genislikCh: 16 }), new GridKolon({ belirtec: 'detaykullaniciadi', text: 'Kullanıcı Adı', genislikCh: 30, sql: 'dper.aciklama' }),
			new GridKolon({ belirtec: 'detayaciklama', text: 'Detay Açıklama', genislikCh: 150 })
		)
	}
	static loadServerData_detaylar_queryDuzenle(e) {
		super.loadServerData_detaylar_queryDuzenle(e); const {sent} = e, {tableAlias: alias} = this.detaySinif;
		sent.fromIliski('personel dper', `${alias}.detaykullanicikod = dper.kod`); sent.sahalar.add('dper.aciklama detaykullaniciadi')
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPanel, tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana();
			form.addDateInput('tarih', 'İşlem Tarih'); form.addTimeInput('saat', 'İşlem Saat');
			form.addTextInput('seri', 'Seri').setMaxLength(3).addStyle_wh(80); form.addNumberInput('fisNo', 'Fiş No').setMaxLength(17).addStyle_wh(250);
			form.addDateInput('terminTarih', 'Termin Tarih'); form.addTimeInput('terminSaat', 'Termin Saat');
			form.addDateInput('bitisTarih', 'Bitiş Tarih'); form.addTimeInput('bitisSaat', 'Bitiş Saat');
		form = tabPage_genel.addFormWithParent().yanYana(2);
			form.addModelKullan('mustKod', 'Müşteri').comboBox().setMFSinif(MQCari); form.addModelKullan('gorevliKullaniciKod', 'Görevli').comboBox().setMFSinif(MQPersonel);
		form = tabPage_genel.addFormWithParent().yanYana(2);
			form.addModelKullan('islemTurKod', 'İşlem Türü').dropDown().kodsuz().setMFSinif(MQIslemTuru).addStyle_wh(200); form.addModelKullan('teslimKullaniciKod', 'Teslim Eden').comboBox().setMFSinif(MQPersonel);
		form = tabPage_genel.addFormWithParent().yanYana(2);
			form.addTextArea('yapilacakIs', 'Yapılacak İş').setMaxLength(600).setRows(5); form.addTextArea('bitisAciklama', 'Bitiş Açıklama').setMaxLength(200).setRows(5);
		e.gridForm = tabPanel.addTab('detay', 'Detay Girişi').addStyle_fullWH()
	}
}
class MQMusIslemDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'crmmusislemdetay' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			detayTS: new PInstDateTime('detayts'), detayKullaniciKod: new PInstStr('detaykullanicikod'), detayAciklama: new PInstStr('detayaciklama') })
	}
}
class MQMusIslemGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e); e.tabloKolonlari.push(
			new GridKolon({ belirtec: 'detayTarih', text: 'Tarih', genislikCh: 10 }).tipDate(), new GridKolon({ belirtec: 'detaySaat', text: 'Saat', genislikCh: 10 }).tipTime(),
			...MQPersonel.getGridKolonlar({ belirtec: 'detayKullanici' }), new GridKolon({ belirtec: 'detayAciklama', text: 'Detay Açıklama', genislikCh: 150 }).tipString(300))
	}
}
