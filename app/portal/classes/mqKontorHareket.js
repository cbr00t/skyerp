class MQKontorHareket extends MQSayacli {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sayacSaha() { return 'kaysayac' }
	static get uygunmu() { return this != MQKontorHareket } static get kontorSinif() { return MQKontor }
	static get tip() { return this.kontorSinif.tip } static get tipAdi() { return this.kontorSinif.tipAdi }
	static get kodListeTipi() { return `KHAR-${this.tip}` } static get sinifAdi() { return `${this.tipAdi} Kontör Hareketleri` }
	static get table() { return this.kontorSinif.detaySinif.table } static get tableAlias() { return 'har' }
	static get vioSeri() { return this.kontorSinif.vioSeri } static get vioHizmetKod() { return this.kontorSinif.vioHizmetKod }
	static get tumKolonlarGosterilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get raporKullanilirmi() { return false } static get noAutoFocus() { return false } static get tanimUISinif() { return true }
	static get tanimlanabilirmi() {
		let login = MQLogin.current?.class;
		return super.tanimlanabilirmi && (login.adminmi || login.bayimi)
	}
	static get silinebilirmi() {
		let {current: login} = MQLogin;
		if (!super.silinebilirmi) { return false }
		if (login?.class?.adminmi) { return true }
		return login.yetkiVarmi('sil') || login.sefmi
	}
	static get faturalastirmaYapilirmi() { return this.kontorSinif.faturalastirmaYapilirmi }
	static get ozelTanimIslemi() { return (e => this.ozelTanimla(e)) }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			tarih: new PInstDateToday('tarih'), mustKod: new PInstStr('mustkod'), ahTipi: new PInstTekSecim('ahtipi', KontorAHTip),
			fisNox: new PInstStr({ rowAttr: 'fisnox', init: e => this.kontorSinif.newFisNox }), kontorSayi: new PInstNum('kontorsayi'),
			fatDurum: new PInstTekSecim('fatdurum', KontorFatDurum), tamamlandimi: new PInstBitBool('btamamlandi')  /*, tahSekliNo: new PInstNum('tahseklino')*/
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		let {tableAlias: alias} = this;
		sec.grupTopluEkle([ { kod: 'genel', etiket: 'Genel', kapali: false } ]);
		sec
			.secimTopluEkle({
				tarih: new SecimDate({ etiket: 'Tarih' }),
				ahTipiSecim: new SecimBirKismi({ etiket: 'Alınan/Harcanan', tekSecim: new KontorAHTip().alinanYap() }).birKismi().autoBind(),
				fatDurumSecim: new SecimBirKismi({ etiket: 'Fat. Durum', tekSecim: new KontorFatDurum().secimYok() }).birKismi().autoBind(),
				tamamlandiSecim: new SecimTekSecim({
					etiket: 'ERP Durumu',
					tekSecim: new BuDigerVeHepsi(['<span class=forestgreen>Tamamlananlar</span>', '<span class=firebrick>TamamlanMAyanlar</span>'])
				}).autoBind()
			})
			.addKA('must', MQLogin_Musteri, 'fis.mustkod', 'mus.aciklama')
			.addKA('bayi', MQLogin_Bayi, 'mus.bayikod', 'bay.aciklama')
			.addKA('anaBayi', MQVPAnaBayi, 'mus.anabayikod', 'abay.aciklama')
			.addKA('il', MQVPIl, 'mus.ilkod', 'il.aciklama')
			/*.addKA('tahSekli', MQVPTahSekli, 'har.tahseklino', 'tsek.aciklama')*/
		sec.whereBlockEkle(({ secimler: sec, sent, where: wh }) => {
			let {ahTipiSecim, fatDurumSecim} = sec, {tekSecim: tamamlandiSecim} = sec.tamamlandiSecim;
			wh.basiSonu(sec.tarih, `${alias}.tarih`);
			if (!$.isEmptyObject(ahTipiSecim.value)) { wh.birKismi(ahTipiSecim, `${alias}.ahtipi`) }
			if (sent && !$.isEmptyObject(fatDurumSecim.value)) {
				wh.degerAta('A', `${alias}.ahtipi`).add(`${alias}.kontorsayi > 0`);
				wh.birKismi(fatDurumSecim, `${alias}.fatdurum`)
			}
			if (!tamamlandiSecim.hepsimi) { wh.add(tamamlandiSecim.getBoolBitClause(`${alias}.btamamlandi`)) }
		})
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(...arguments);
		e.liste = e.liste.filter(item => item.id != 'kopya')
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); let {current: login} = MQLogin;
		let gridPart = e.gridPart ?? e.sender, {header, islemTuslariPart} = gridPart, {layout: islemTuslari, sol} = islemTuslariPart;
		let {rootBuilder: rfb} = e; rfb.setInst(gridPart)
			.addStyle(`$elementCSS .islemTuslari { overflow: hidden hidden !important; margin-bottom: 0 !important }`);
		let form_ek = rfb.addFormWithParent('ekForm').setParent(islemTuslari).yanYana().addStyle(
			`$elementCSS { position: absolute !important; width: max-content !important; left: 510px !important }
			$elementCSS button { min-width: unset !important }`);
		/*if (login.adminmi || login.bayimi) {
			form_ek.addButton('degistir').addStyle_wh(90)
				.addStyle(`$elementCSS { left: 0 !important }`)
				.onClick(async _e => {
					let {selectedRec: rec} = gridPart, parentRec = rec;
					try { await this.kontorSinif.detaySinif.kontor_degistirIstendi({ ..._e, ...e, rec, parentRec }) }
					catch (ex) { hConfirm(getErrorText(ex), 'Kontör Satışı'); throw ex }
			})
		}*/
		if ((login.adminmi || login.sefmi) && this.faturalastirmaYapilirmi) {
			form_ek.addButton('faturalastir', 'FAT').addStyle_wh(90)
				.addStyle(`$elementCSS { left: 50px !important }`)
				.onClick(async _e => {
					let {selectedRecs: recs} = gridPart;
					try { await this.kontorSinif.kontor_topluFaturalastirIstendi({ ..._e, ...e, recs }) }
					catch (ex) {
						if (ex?.rc == 'userClose') { return }
						hConfirm(getErrorText(ex), 'Kontör Faturalaştır'); throw ex
					}
				})
		}
	}
	static rootFormBuilderDuzenle({ sender, inst, rootBuilder: rfb, tanimFormBuilder: tanimForm }) {
		super.rootFormBuilderDuzenle(...arguments);
		let form = tanimForm.addFormWithParent().altAlta();
			form.addModelKullan('mustKod', 'Müşteri').comboBox().autoBind().setMFSinif(MQLogin_Musteri)
				.ozelQueryDuzenleHandler(({ stm, aliasVeNokta, mfSinif }) => {
					let {kodSaha} = mfSinif, clauses = { musteri: `${aliasVeNokta}${kodSaha}`, bayi: `${aliasVeNokta}bayikod`, anaBayi: 'bay.anabayikod' };
					for (let sent of stm) {
						let {where: wh} = sent;
						wh.add(`${aliasVeNokta}aktifmi <> ''`);
						MQLogin.current.yetkiClauseDuzenle({ sent, clauses })
					}
				});
		form = tanimForm.addFormWithParent().yanYana();
			form.addDateInput('tarih', 'Tarih').addStyle_wh(100);
			form.addNumberInput('kontorSayi', 'Kontör Sayı').addStyle_wh(100);
			form.addModelKullan('ahTipi', 'A/H').dropDown().noMF().kodsuz().setSource(KontorAHTip.kaListe).addStyle_wh(150);
			form.addTextInput('fisNox', 'Seri / No').addStyle_wh(200);
			form.addModelKullan('fatDurum', 'Fat. Durum').dropDown().noMF().kodsuz().bosKodAlinmaz().setSource(KontorFatDurum.kaListe).addStyle_wh(200)
	}
	static ekCSSDuzenle({ rec, result, dataField: belirtec }) {
		super.ekCSSDuzenle(...arguments); let value = rec[belirtec];
		switch (belirtec) {
			case 'kontorsayi':
				if (value) {
					let alinanmi = rec.ahtipi == 'A';
					let varmi = value > 0; if (!alinanmi) { value = -value }
					if (value > 0) { result.push('kontor-var green') }
					else { result.push('kontor-yok orangered') }
					result.push('bold'); if (alinanmi) { result.push('fs-130') }
				}
				break
		}
		if (rec.btamamlandi) { result.push('tamamlandi') }
	}
	static orjBaslikListesi_argsDuzenle({ gridPart, sender, args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments); gridPart = gridPart ?? sender;
		$.extend(args, { rowsHeight: 40, groupsExpandedByDefault: true })
	}
	static standartGorunumListesiDuzenle({ liste }) {
		super.standartGorunumListesiDuzenle(...arguments);
		liste.push('tarih', 'mustkod', 'mustadi', 'kontorsayi', 'ahtipitext', 'fatdurumtext', 'btamamlandi', 'fisnox', /*'tahseklino',*/ 'bayikod', 'anabayikod', 'tanitim')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); let {tableAlias: alias} = this;
		liste.push(...[
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 15, filterType: 'checkedlist' }).tipDate(),
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', genislikCh: 15, sql: 'fis.mustkod' }),
			new GridKolon({ belirtec: 'mustadi', text: 'Müşteri Adı', genislikCh: 50, sql: 'mus.aciklama' }),
			new GridKolon({ belirtec: 'ahtipitext', text: 'A/H Tip', genislikCh: 13, sql: KontorAHTip.getClause(`${alias}.ahtipi`), filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'btamamlandi', text: 'Tamam?', genislikCh: 10 }).tipBool(),
			new GridKolon({ belirtec: 'fisnox', text: 'Fiş No', genislikCh: 23 }),
			new GridKolon({ belirtec: 'kontorsayi', text: 'Kontör', genislikCh: 10, filterType: 'checkedlist' }).tipDecimal(0),
			new GridKolon({
				belirtec: 'fatdurumtext', text: 'Fat.Durum', genislikCh: 18,
				sql: KontorFatDurum.getClause(`${alias}.fatdurum`), filterType: 'checkedlist',
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					let {ahtipi: ahTipi, fatdurum: fatDurum} = rec;
					if (!(fatDurum || ahTipi == 'A')) { html = changeTagContent(html, (value = '')) }
					return html
				}
			}),
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 20, sql: 'mus.yore', filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8, sql: 'mus.ilkod', filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 20, sql: 'il.aciklama', filterType: 'checkedlist' }),
			/* new GridKolon({ belirtec: 'tahseklino', text: 'Tah.No', genislikCh: 8 }).tipNumerik().sifirGosterme(),
			new GridKolon({ belirtec: 'tahsekliadi', text: 'Tah. Şekli Adı', genislikCh: 15, sql: 'tsek.aciklama' }), */
			new GridKolon({ belirtec: 'tanitim', text: 'Tanıtım', genislikCh: 43, sql: 'mus.tanitim' }),
			new GridKolon({ belirtec: 'bayikod', text: 'Bayi', genislikCh: 13, sql: 'mus.bayikod', filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'bayiadi', text: 'Bayi Adı', genislikCh: 25, sql: 'bay.aciklama', filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'anabayikod', text: 'Ana Bayi', genislikCh: 13, sql: 'bay.anabayikod', filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'anabayiadi', text: 'Ana Bayi Adı', genislikCh: 20, sql: 'abay.aciklama', filterType: 'checkedlist' })
		].filter(x => !!x))
	}
	static loadServerData_queryDuzenle({ sender, stm, sent, basit, tekilOku, modelKullanmi }) {
		super.loadServerData_queryDuzenle(...arguments);
		let {kontorSinif, tip, tableAlias: alias} = this, {table: fisTable} = kontorSinif;
		let {where: wh, sahalar, alias2Deger} = sent, {orderBy} = stm;
		let {current: login} = MQLogin, {musterimi: loginMusterimi} = login?.class;
		let sabitMustKod = (loginMusterimi ? login.kod : qs.mustKod ?? qs.must);
		sent
			.fromIliski(`${fisTable} fis`, `${alias}.fissayac = fis.kaysayac`)
			.fromIliski('musteri mus', `fis.mustkod = mus.kod`)
			.fromIliski(`${MQLogin_Bayi.table} bay`, `mus.bayikod = bay.kod`)
			.fromIliski(`${MQVPIl.table} il`, `mus.ilkod = il.kod`)
			.har2TahSekliBagla();
		wh.degerAta(tip, 'fis.tip').add(`mus.aktifmi <> ''`);
		if (!alias2Deger.fissayac) { sahalar.add(`${alias}.fissayac`) }
		if (!alias2Deger.kaysayac) { sahalar.add(`${alias}.kaysayac`) }
		if (!alias2Deger.ahtipi) { sahalar.add(`${alias}.ahtipi`) }
		if (!alias2Deger.btamamlandi) { sahalar.add(`${alias}.btamamlandi`) }
		if (!alias2Deger.fatdurum) { sahalar.add(`${alias}.fatdurum`) }
		/* if (!alias2Deger.tahseklino) { sahalar.add(`${alias}.tahseklino`) } */
		if (!alias2Deger.bayikod) { sahalar.add('mus.bayikod') }
		if (!alias2Deger.anabayikod) { sahalar.add('bay.anabayikod') }
		if (!alias2Deger.mustkod) { sahalar.add('fis.mustkod') }
		if (!basit) {
			sent.leftJoin('bay', `${MQVPAnaBayi.table} abay`, `bay.anabayikod = abay.kod`);
			if (sabitMustKod) { wh.degerAta(sabitMustKod, 'fis.mustkod') }
			let clauses = { anaBayi: 'bay.anabayikod', bayi: 'mus.bayikod', musteri: 'fis.mustkod' };
			MQLogin.current.yetkiClauseDuzenle({ sent, clauses });
			if (!alias2Deger.onmuhmustkod) { sahalar.add('abay.onmuhmustkod') }
			if (!(tekilOku || modelKullanmi)) { orderBy.liste = ['ahtipi', 'tarih DESC', 'mustkod'] }
		}
	}
	static orjBaslikListesi_recsDuzenle({ recs }) { super.orjBaslikListesi_recsDuzenle(...arguments) }
	static gridVeriYuklendi({ gridPart, grid, gridWidget }) {
		super.gridVeriYuklendi(...arguments); let grupBelirtec = 'ahtipitext';
		if (grupBelirtec && gridPart.belirtec2Kolon[grupBelirtec]) {
			grid.jqxGrid('groups', [grupBelirtec]);
			gridWidget.hidecolumn(grupBelirtec)
		}
	}
	static orjBaslikListesi_satirCiftTiklandi({ sender: gridPart }) {
		super.orjBaslikListesi_satirCiftTiklandi(...arguments) /*;
		gridPart.islemTuslariPart.layout.find('button#degistir')?.click()*/
	}
	static async ozelTanimla({ sender: gridPart, islem, rec, recs }) {
		let {kontorSinif} = this, {detaySinif: kontorDetaySinif} = kontorSinif;
		if (!(islem == 'yeni' || islem == 'degistir')) { return false }
		let degistirmi = islem == 'degistir';
		let /* {selectedRec: rec, selectedRecs: recs} = gridPart, */ parentRec = rec;
		let e = { ...arguments[0], parentRec, rec, recs, gridPart };
		try {
			if (degistirmi) { await kontorDetaySinif.kontor_degistirIstendi(e) }
			else { await kontorSinif.kontor_yeniIstendi(e) }
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Kontör Satışı'); throw ex }
		return true
	}
}
class MQKontorHareket_EBelge extends MQKontorHareket {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kontorSinif() { return MQKontor_EBelge }
}
class MQKontorHareket_Turmob extends MQKontorHareket {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kontorSinif() { return MQKontor_Turmob }
}
