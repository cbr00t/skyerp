class MQAktivasyon extends MQDetayliMaster {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'AKT' } static get sinifAdi() { return 'Aktivasyon' }
	static get table() { return 'muslisans' } static get tableAlias() { return 'fis' } static get sayacSaha() { return 'kaysayac' }
	static get detaySinif() { return MQAktivasyonDetay } static get gridKontrolcuSinif() { return MQAktivasyonGridci }
	static get tumKolonlarGosterilirmi() { return true } static get kolonFiltreKullanilirmi() { return false } static get raporKullanilirmi() { return false }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi && MQLogin.current?.yetkiVarmi('tanimla') }
	static get silinebilirmi() { return super.silinebilirmi && MQLogin.current?.yetkiVarmi('sil') }
	static get gridHeight_bosluk() { return 360 }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			tarih: new PInstDateToday('tarih'), ilkTarih: new PInstDateToday('ilktarih'), mustKod: new PInstStr('mustkod'),
			aktifmi: new PInstBitTrue('baktifmi'), surum: new PInstTekSecim('surum', VIOSurum), tanitim: new PInstStr(),
			kullaniciSayi: new PInstNum('kullanicisayi'), elTerminalSayi: new PInstNum('elterminalsayi'), dokunmatikSayi: new PInstNum('dokunmatiksayi'),
			topBedel: new PInstNum('topbedel'), demoSuresiSifirlaTarih: new PInstDate('demosuresifirlatarih'),
			ekBilgi: new PInstStr('ekbilgi'), ozelEkBilgi: new PInstStr('ozelekbilgi')
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		let {tableAlias: alias} = this;
		sec.grupTopluEkle([ { kod: 'genel', etiket: 'Genel', kapali: false } ]);
		sec
			.secimTopluEkle({
				aktifSecim: new SecimTekSecim({ etiket: 'Aktiflik', tekSecim: new AktifVeDevreDisi().bu() }),
				surum: new SecimBirKismi({ etiket: 'Sürüm', tekSecim: new VIOSurum().secimYok() }).birKismi(),
				tanitim: new SecimOzellik({ etiket: 'Tanıtım' })
			})
			.addKA('must', MQLogin_Musteri, `${alias}.mustkod`, 'mus.aciklama')
			.addKA('bayi', MQLogin_Bayi, 'mus.bayikod', 'bay.aciklama')
			.addKA('il', MQVPIl, 'mus.ilkod', 'il.aciklama')
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
			let {tekSecim: aktifSecim} = sec.aktifSecim; wh.birlestir(aktifSecim.getBoolBitClause(`${alias}.baktifmi`));
			wh
				.birKismi(sec.surum, `${alias}.surum`)
				.ozellik(sec.tanitim, 'mus.tanitim')
		})
	}
	static rootFormBuilderDuzenleSonrasi_listeEkrani(e) {
		super.rootFormBuilderDuzenleSonrasi_listeEkrani(e); let {rootBuilder: rfb} = e;
		this.fbd_listeEkrani_addButton(rfb, 'kontorMenu', '...', 50, e => this.kontorMenuIstendi(e))
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e);
		let {current: login} = MQLogin, {tanimFormBuilder: tanimForm, tabPage_genel: tabPage} = e;
		let form = tabPage.addFormWithParent().yanYana();
			form.addDateInput('tarih', 'Tarih'); form.addDateInput('ilkTarih', 'İlk Lisans');
			form.addModelKullan('surum', 'Sürüm').dropDown().noMF().kodsuz().autoBind().addStyle_wh(150);
			form.addNumberInput('kullaniciSayi', 'Kullanıcı').setMaxLength(4).addStyle_wh(150);
			form.addNumberInput('elTerminalSayi', 'El Term.').setMaxLength(4).addStyle_wh(150);
			form.addNumberInput('dokunmatikSayi', 'Tablet').setMaxLength(4).addStyle_wh(150);
			form.addCheckBox('aktifmi', 'Aktif?').addStyle(`$elementCSS { margin: 40px 0 0 20px !important }`);
		form = tabPage.addFormWithParent().yanYana();
			form.addModelKullan('mustKod', 'Müşteri').comboBox().setMFSinif(MQLogin_Musteri).autoBind().addStyle_wh(800);
			form.addNumberInput('topBedel', 'Toplam Bedel').setFra(2).setMaxLength(17).addStyle_wh(200);
		form = tabPage.addFormWithParent().yanYana();
			form.addTextInput('tanitim', 'Tanıtım').addStyle_wh(800).readOnly().addCSS('center');
		form = tabPage.addFormWithParent().yanYana();
			form.addTextArea('ekBilgi', 'Ek Bilgi').setRows(3).setMaxLength(300);
			if (login.adminmi || login.sefmi) { form.addTextArea('ozelEkBilgi', 'Ek Bilgi').setRows(3).setMaxLength(300) }
	}
	static ekCSSDuzenle({ rec, result }) {
		super.ekCSSDuzenle(...arguments);
		if (!rec.baktifmi) { result.push('bg-lightgray', 'iptal', 'firebrick') }
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); let {tableAlias: alias} = this;
		liste.push(...[
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'baktifmi', text: 'Aktif?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', genislikCh: 16 }),
			new GridKolon({ belirtec: 'mustadi', text: 'Müşteri Adı', genislikCh: 45, sql: 'mus.aciklama' }),
			new GridKolon({ belirtec: 'surumtext', text: 'Sürüm', genislikCh: 13, sql: VIOSurum.getClause(`${alias}.surum`) }).alignCenter(),
			new GridKolon({ belirtec: 'bayikod', text: 'Bayi', genislikCh: 10, sql: 'mus.bayikod' }),
			new GridKolon({ belirtec: 'bayiadi', text: 'Bayi Adı', genislikCh: 25, sql: 'bay.aciklama' }),
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 25, sql: 'mus.yore' }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8, sql: 'mus.ilkod' }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 25, sql: 'il.aciklama' }),
			new GridKolon({ belirtec: 'tanitim', text: 'Tanıtım', genislikCh: 43, sql: 'mus.tanitim' }),
			new GridKolon({ belirtec: 'kullanicisayi', text: 'Kull.Sayı', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'elterminalsayi', text: 'ElTerm.Sayı', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'dokunmatiksayi', text: 'Tablet Sayı', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'topbedel', text: 'Top. Bedel', genislikCh: 17 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'ilktarih', text: 'İlk Lisans', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'demosuresifirlatarih', text: 'Demo Sıfırlama', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'ekbilgi', text: 'Ek Bilgi', genislikCh: 50 }),
			new GridKolon({ belirtec: 'ozelekbilgi', text: 'Özel Ek Bilgi', genislikCh: 50 })
		])
	}
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent }) {
		super.loadServerData_queryDuzenle(...arguments);
		let {tableAlias: alias} = this, {sahalar} = sent;
		sent.fromIliski('musteri mus', `${alias}.mustkod = mus.kod`)
			.fromIliski(`${MQLogin_Bayi.table} bay`, `mus.bayikod = bay.kod`)
			.fromIliski(`${MQVPIl.table} il`, `mus.ilkod = il.kod`);
		let clauses = { bayi: 'mus.bayikod', musteri: `${alias}.mustkod` };
		MQLogin.current.yetkiClauseDuzenle({ sent, clauses });
		sahalar.add(`${alias}.surum`, 'mus.tanitim')
	}
	setValues({ rec }) {
		super.setValues(...arguments); let {tanitim} = rec;
		$.extend(this, { tanitim })
	}
	static kontorMenuIstendi(e) {
		this.openContextMenu({
			...e, title: 'Kontör İşlemleri',
			wndArgsDuzenle: ({ wndArgs: args }) => $.extend(args, { height: 150 }),
			formDuzenleyici: ({ form: parentForm, close, rec }) => {
				let listele = cls => {
					let {mustkod: mustKod} = rec;
					cls.listeEkraniAc({ args: { mustKod } });
				};
				parentForm.altAlta().addStyle(e = `$elementCSS .formBuilder-element.parent { margin-top: 5px !important }`);
				let form = parentForm.addFormWithParent().yanYana(2);
				form.addButton('eBelge', undefined, 'e-Belge Kontör').onClick(() => { close(); listele(MQKontor_EBelge) });
				form.addButton('turmob', undefined, 'Turmob Kontör').onClick(() => { close(); listele(MQKontor_Turmob) })
			}
		})
	}
}
class MQAktivasyonDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'muslisansdetay' }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			psmKod: new PInstStr('psmkod'), psmAdi: new PInstStr(),
			hesapSekli: new PInstTekSecim('hesapsekli', AktHesapSekli),
			otoAnahtarmi: new PInstBitBool('botoanahtarverilirmi'), anahtar: new PInstStr('anahtar')
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); let {tableAlias: alias} = this;
		liste.push(...[
			new GridKolon({ belirtec: 'psmkod', text: 'Prog/Set/Modül', genislikCh: 16 }),
			new GridKolon({ belirtec: 'psmadi', text: 'Prog. Adı', genislikCh: 30, sql: 'psm.aciklama' }),
			new GridKolon({ belirtec: 'botoanahtarverilirmi', text: 'Oto?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'anahtar', text: 'Anahtar', genislikCh: 20 }).alignCenter(),
			new GridKolon({ belirtec: 'hesapseklitext', text: 'Hesap Şekli', genislikCh: 13, sql: AktHesapSekli.getClause(`${alias}.hesapsekli`) })
		])
	}
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent }) {
		super.loadServerData_queryDuzenle(...arguments);
		let {tableAlias: alias} = this, {sahalar} = sent;
		sent.fromIliski('progsetmodul psm', `${alias}.psmkod = psm.kod`);
		sahalar.add('psm.aciklama psmadi', `${alias}.hesapsekli`)
	}
	setValues({ rec }) {
		super.setValues(...arguments); let {psmadi: psmAdi} = rec;
		$.extend(this, { psmAdi })
	}
}
class MQAktivasyonGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	gridArgsDuzenle({ gridPart, sender, args }) {
		gridPart = gridPart ?? sender;
		$.extend(args, { groupsExpandedByDefault: true /*, editMode: 'click'*/ })
	}
	tabloKolonlariDuzenle_ilk({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_ilk(...arguments);
		tabloKolonlari.push(...[
			...MQPSM.getGridKolonlar({ belirtec: 'psm', kodEtiket: 'Program' }),
			new GridKolon({ belirtec: 'otoAnahtarmi', text: 'Oto?', genislikCh: 8, degisince: e => this.otoAnahtarmiDegisti(e) }).tipBool(),
			new GridKolon({ belirtec: 'anahtar', text: 'Anahtar', genislikCh: 20, degisince: e => this.bedelHesapla(e) }).readOnly().alignCenter(),
			new GridKolon({ belirtec: 'hesapSekli', text: 'Hesap Şekli', genislikCh: 15 }).tipTekSecim({ tekSecimSinif: AktHesapSekli }).kodsuz().autoBind()
		]);
		for (let {belirtec, etiket: text, mfSinif} of HMRBilgi.hmrIter_ekOzellik()) {
			tabloKolonlari.push(new GridKolon({ belirtec, text, genislikCh: 20, filterType: 'checkedlist' }).readOnly()) }
	}
	static async otoAnahtarmiDegisti({ sender: gridPart, rowIndex, belirtec, gridRec: det, value: flag }) {
		if (flag) {
			/*
				let anahtar = await (skyws'den anahtar üret);
				gridPart.setcellvalue(rowIndex, 'anahtar', anahtar)
			*/ 
		}
		this.bedelHesapla(...arguments)
	}
	static bedelHesapla({ sender: gridPart, rowIndex, belirtec, gridRec: det, value }) { }
}
