class MQMusIslem extends MQDetayliMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Müşteri İşlemi' }
	static get detaySinif() { return MQMusIslemDetay } static get gridKontrolcuSinif() { return MQMusIslemGridci }
	static get kodListeTipi() { return 'CRMMUSISLEM' } static get table() { return 'crmmusislem' } static get tableAlias() { return 'fis' } static get hasTabs() { return true }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			seri: new PInstStr('seri'), fisNo: new PInstStr('fisno'), mustKod: new PInstStr('mustkod'), zamanTS: new PInstDateTimeNow('zamants'), terminTS: new PInstDateTime('termints'),
			bitisTS: new PInstDateTime('bitists'), gorevliKullaniciKod: new PInstStr('gorevlikullanicikod'), islemTurKod: new PInstStr('islemturkod'),
			teslimKullaniciKod: new PInstStr('teslimkullanicikod'), yapilacakIs: new PInstStr('yapilacakis'), bitisAciklama: new PInstStr('bitisaciklama')
		})
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e); const {liste} = e; liste.push(
			{ id: 'ekIslem', text: 'Ek İşlem', handler: _e => this.ekIslemIstendi({ ...e, ..._e }) })
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
			.fromIliski('crmislemturu itur', `${alias}.islemturkod = itur.kod`).fromIliski('personel tper', `${alias}.teslimkullanicikod = tper.kod`);
		sent.sahalar.add(`${alias}.zamants`, `${alias}.seri`, `${alias}.fisno`, 'car.birunvan mustunvan', `${alias}.termints`, `${alias}.bitists`, `${alias}.yapilacakis`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {kaForm, tabPanel, tabPage_genel} = e; kaForm?.addCSS('jqx-hidden');
		let form = tabPage_genel.addFormWithParent().yanYana(); form.addDateInput('zamanTarih', 'İşlem Tarih');
			form.addTimeInput('zamanSaat', 'İşlem Saat'); form.addTextInput('seri', 'Seri').setMaxLength(3).addStyle_wh(80);
		form.addNumberInput('fisNo', 'Fiş No').setMaxLength(17).addStyle_wh(250);
			form.addDateInput('terminTarih', 'Termin Tarih'); form.addTimeInput('terminSaat', 'Termin Saat');
			form.addDateInput('bitisTarih', 'Bitiş Tarih'); form.addTimeInput('bitisSaat', 'Bitiş Saat');
		form = tabPage_genel.addFormWithParent().yanYana(2);
			form.addModelKullan('mustKod', 'Müşteri').comboBox().setMFSinif(MQCari); form.addModelKullan('gorevliKullaniciKod', 'Görevli').comboBox().autoBind().setMFSinif(MQPersonel);
		form = tabPage_genel.addFormWithParent().yanYana(2);
			form.addModelKullan('islemTurKod', 'İşlem Türü').dropDown().kodsuz().autoBind().setMFSinif(MQIslemTuru).addStyle_wh(400);
			form.addModelKullan('teslimKullaniciKod', 'Teslim Eden').comboBox().autoBind().setMFSinif(MQPersonel);
		form = tabPage_genel.addFormWithParent().yanYana(2);
			form.addTextArea('yapilacakIs', 'Yapılacak İş').setMaxLength(600).setRows(5); form.addTextArea('bitisAciklama', 'Bitiş Açıklama').setMaxLength(200).setRows(5);
		e.gridForm = tabPanel.addTab('detay', 'Detay Girişi').addStyle_fullWH()
	}
	static ekIslemIstendi(e) {
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {selectedRec: rec} = gridPart; if (!rec) { return }
		const {classKey, sayacSaha, detaySinif} = this, sayac = rec[sayacSaha], inst = new detaySinif({ detayTS: now() });
		const rfb = new RootFormBuilder('Müşteri Ek İşlem').setInst(inst).asWindow('Ek İşlem Ekranı').addCSS(`${classKey} ekIslem part`);
		let islemTuslari = rfb.addIslemTuslari('islemTuslari').setTip('tamamVazgec').addStyle_fullWH(null, 50)
			.setId2Handler({ tamam: _e => this.ekIslem_tamamIstendi({ ...e, ..._e, gridPart, rec, inst: _e.builder.inst }), vazgec: _e => _e.builder.rootPart.close() })
			.addStyle(e => `$elementCSS .butonlar.part > .sol { z-index: -1; background-color: unset !important; background: transparent !important }`);
		rfb.addForm('header').addStyle_fullWH('calc(var(--full) - 20px)', 50)
			.addStyle(e =>
				`$elementCSS { position: relative; top: -40px; padding: 10px; line-height: 20px; user-select: all; overflow-y: auto !important; z-index: 101; cursor: default }
				 $elementCSS ._row { padding: 3px } $elementCSS .item { --etiket-width: 150px max-width: 49% }
				 $elementCSS .item:not(:last-child) { margin-right: 20px } $elementCSS .item > .etiket { width: var(--etiket-width); margin-right: 10px }
				 $elementCSS .item > .veri { font-weight: bold; color: royalblue; width: calc(var(--full) - var(--etiket-width)) }`)
			.setLayout(e => $(`<div>
				<div class="_row flex-row">
					<div class="item flex-row"><div class="etiket">Fiş No</div><div class="veri">${[rec.seri, rec.fisno].join(' ')}</div></div>
					<div class="item flex-row"><div class="etiket">Müşteri</div><div class="veri">${rec.mustunvan}</div></div>
					<div class="item flex-row"><div class="etiket">Başlangıç</div><div class="veri">${dateTimeAsKisaString(asDate(rec.zamants))}</div></div>
					${rec.terimts ? `<div class="item flex-row"><div class="etiket">Termin</div><div class="veri">${dateTimeAsKisaString(asDate(rec.termints))}</div></div>` : '' }
					${rec.bitists ? `<div class="item flex-row"><div class="etiket">Bitiş</div><div class="veri">${dateTimeAsKisaString(asDate(rec.bitists))}</div></div>` : '' }
				</div>
			</div>`)).onAfterRun(e => makeScrollable(e.builder.layout));
		let content = rfb.addFormWithParent('content').altAlta().addStyle_fullWH(null, `calc(var(--full) - ${50 + 30}px)`)
			.addStyle(e => `$elementCSS { position: relative; top: -35px; z-index: 102 }`);
		let cellClassName = (sender, rowIndex, belirtec, value, rec) => { let result = [belirtec]; if (rec.aktifmi) { result.push('aktif', 'bold', 'green') } return result.join(' ') };
		content.addGridliGosterici('_grid').addStyle_fullWH(null, $(window).height() < 500 ? 100 : 200)
			.onBuildEk(({ builder }) => builder.part.id = '').onAfterRun(({ builder }) => builder.rootPart.gridPart = builder.part)
			.setTabloKolonlari(e => [
				new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 12, cellClassName }).tipDate(),
				new GridKolon({ belirtec: 'saat', text: 'Sasat', genislikCh: 9, cellClassName }).tipTime(),
				new GridKolon({ belirtec: 'aciklama', text: ' ', cellClassName })
			])
			.setSource(_e => this.ekIslem_getSource({ ...e, ..._e, gridPart, rec, inst }));
		let form = content.addFormWithParent().yanYana(); form.addDateInput('detayTarih', 'İşlem Tarih'); form.addTimeInput('detaySaat', 'Saat');
			form.addModelKullan('detayKullaniciKod', 'Yapan').comboBox().autoBind().setMFSinif(MQPersonel).etiketGosterim_placeholder()
		form = content.addFormWithParent().altAlta(); content.addTextArea('detayAciklama', 'Ara İşlemler').setRows($(window).height() < 500 ? 2 : 4).addStyle_fullWH(null, 'unset').addStyle(e =>
			`$elementCSS { vertical-align: top !important; margin: 0 !important } $elementCSS > textarea { width: var(--full) !important; height: var(--full) !important }`);
		rfb.run()
	}
	static async ekIslem_getSource(e) {
		const {table, detayTable} = this, {rec} = e, {kaysayac: sayac, zamants: ts, gorevlikullanicikod: userKod, yapilacakis: aciklama} = rec;
		const result = []; let sent = new MQSent({ from: detayTable, where: { degerAta: sayac, saha: 'fissayac' }, sahalar: ['detayts', 'detaykullanicikod', 'detayaciklama'] });
		let stm = new MQStm({ sent, orderBy: ['detayts DESC'] });
		for (const {sayac, detayts: ts, detaykullanicikod: userKod, detayaciklama: aciklama} of await this.sqlExecSelect(stm)) {
			result.push({ aktifmi: false, sayac, ts, userKod, aciklama }) }
		if (aciklama) { result.push({ aktifmi: true, sayac, ts, userKod, aciklama }) }
		for (const _rec of result) { _rec.tarih = _rec.saat = _rec.ts; delete _rec.ts }
		return result
	}
	static async ekIslem_tamamIstendi(e) {
		const {gridPart, parentPart, rec, inst: det} = e, {table, sayacSaha, detayTable, sinifAdi} = this;
		const {kaysayac: sayac} = rec; if (!sayac) { return } const {detayKullaniciKod, detayAciklama} = det;
		if (!detayKullaniciKod) { hConfirm(`<b>Kullanıcı</b> seçilmelidir`, sinifAdi); return }
		if (!detayAciklama) { hConfirm(`<b>Ara İşlemler</b> girilmelidir`, sinifAdi); return }
		try {
			if (!det.seq) {
				let sent = new MQSent({ from: detayTable, where: { degerAta: sayac, saha: 'fissayac' }, sahalar: 'max(seq) maxseq' });
				det.seq = ((await this.sqlExecTekilDeger(sent)) || 0) + 1
			}
			let hv = det.hostVars({ fis: { sayac } }); if (!hv) { return }
			let ins = new MQInsert({ table: detayTable, hv }); await this.sqlExecNone(ins);
			parentPart.close(); gridPart?.tazele()
		}
		catch (ex) { hConfirm(getErrorText(ex), sinifAdi); throw ex }
	}
}
class MQMusIslemDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'crmmusislemdetay' }
	get offlineSahaListe() { return [...super.offlineSahaListe, 'fissayac'] } static get gonderildiDesteklenirmi() { return true }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			detayTS: new PInstDateTimeNow('detayts'), detayKullaniciKod: new PInstStr('detaykullanicikod'), detayAciklama: new PInstStr('detayaciklama') })
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {tableAlias: alias} = this, {liste} = e; liste.push(
			new GridKolon({ belirtec: 'detayts', text: 'Tarih', genislikCh: 10 }).tipDate(), new GridKolon({ belirtec: 'detaysaat', text: 'Saat', genislikCh: 10, sql: `${alias}.detayts` }).tipZaman(),
			new GridKolon({ belirtec: 'detaykullanicikod', text: 'Kullanıcı', genislikCh: 16 }), new GridKolon({ belirtec: 'detaykullaniciadi', text: 'Kullanıcı Adı', genislikCh: 30, sql: 'dper.aciklama' }),
			new GridKolon({ belirtec: 'detayaciklama', text: 'Detay Açıklama', genislikCh: 150 })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {tableAlias: alias} = this;
		sent.fromIliski('personel dper', `${alias}.detaykullanicikod = dper.kod`); sent.sahalar.add('dper.aciklama detaykullaniciadi')
	}
}
class MQMusIslemGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get bilgiGirisiZorunlumu() { return false }
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e); e.tabloKolonlari.push(
			new GridKolon({ belirtec: 'detayTarih', text: 'Tarih', genislikCh: 10 }).tipDate(), new GridKolon({ belirtec: 'detaySaat', text: 'Saat', genislikCh: 10 }).tipTime(),
			...MQPersonel.getGridKolonlar({ belirtec: 'detayKullanici', autoBind: true }), new GridKolon({ belirtec: 'detayAciklama', text: 'Detay Açıklama', genislikCh: 150 }).tipString(300))
	}
}
