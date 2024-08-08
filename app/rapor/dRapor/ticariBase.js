class DRapor_Donemsel extends DGrupluPanelRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get altRaporClassPrefix() { return this.name }
	altRaporlarDuzenle(e) { super.altRaporlarDuzenle(e); this.add(DAltRapor_Grid_Ozet, DAltRapor_Chart) }
}
class DRapor_Donemsel_Main extends DAltRapor_TreeGridGruplu {
	static { window[this.name] = this; this._key2Class[this.name] = this } get tazeleYapilirmi() { return true }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e;
		result
			.addGrup(new TabloYapiItem().setKA('YILAY', 'Yıl-Ay').addColDef(new GridKolon({ belirtec: 'yilay', text: 'Yıl-Ay', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('YILHAFTA', 'Yıl-Hafta').addColDef(new GridKolon({ belirtec: 'yilhafta', text: 'Yıl-Hafta', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('AYADI', 'Ay').addColDef(new GridKolon({ belirtec: 'ayadi', text: 'Ay', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HAFTA', 'Hafta').addColDef(new GridKolon({ belirtec: 'haftano', text: 'Hafta', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('TARIH', 'Tarih').addColDef(new GridKolon({ belirtec: 'tarih', text: 'Tarih', maxWidth: 450, filterType: 'checkedlist' }).tipDate()))
	}
	secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const {secimler} = e, {tabloYapi} = this, {grupVeToplam} = tabloYapi;
		secimler.grupEkle('donemVeTarih', 'Dönem Ve Tarih');
		secimler.secimTopluEkle({
			donem: new SecimTekSecim({ etiket: 'Dönem', tekSecimSinif: DonemTarihAralikVeHepsiSecim, grupKod: 'donemVeTarih' }).autoBind()
				.setOzetBilgiValueGetter(e => {
					const kod = e.value?.kod ?? e.value, result = [e.value?.aciklama ?? kod];
					if (kod == 'TR') { let value = secimler.tarihAralik.ozetBilgiValueDuzenlenmis; if (value) { result.push(value) } }
					return result
				}),
			tarihAralik: new SecimDate({ etiket: 'Tarih', grupKod: 'donemVeTarih' }).hidden()
		}); /* secimler.whereBlockEkle(e => { const wh = e.where, secimler = e.secimler }) */
		const islemYap = (keys, callSelector, args) => {
			for (const key of keys) {
				const item = key ? grupVeToplam[key] : null; if (item == null) { continue }
				const proc = item[callSelector]; if (proc) { proc.call(item, args) }
			}
		}; islemYap(Object.keys(grupVeToplam), 'secimlerDuzenle', e);
		secimler.whereBlockEkle(_e => {
			islemYap(Object.keys(grupVeToplam) || {}, 'tbWhereClauseDuzenle', { ...e, ..._e })
			/*islemYap(Object.keys(this.raporTanim?.attrSet || {}), 'tbWhereClauseDuzenle', { ...e, ..._e })*/
		})
	}
	secimlerInitEvents(e) {
		super.secimlerInitEvents(e); const {secimlerPart} = this, {secim2Info} = secimlerPart || {}; if (!secim2Info) { return }
		let part = secim2Info.donem.element.find('.ddList').data('part'); if (part) {
			part.degisince(e => {
				const {tarihAralikmi} = secim2Info.donem.secim.tekSecim;
				secim2Info.tarihAralik.element[tarihAralikmi ? 'removeClass' : 'addClass']('jqx-hidden')
			})
		}
	}
	async loadServerDataInternal(e) {
		await super.loadServerDataInternal(e); const {secimler, maxRow} = e;
		let donemBS = new CBasiSonu({ basi: today().yilBasi(), sonu: today().yilSonu() });
		/*const sabit = [...Object.keys(grup)], toplam = []; for (const key in icerik) { (tabloYapi.toplam[key] ? toplam : sabit).push(key) }*/
		if (secimler) {
			const {donem, tarihAralik} = secimler; let {basiSonu, tarihAralikmi} = donem.tekSecim;
			if (tarihAralikmi) { const {basi, sonu} = tarihAralik; basiSonu = new CBasiSonu({ basi, sonu }) } if (basiSonu) { donemBS = basiSonu }
		}
		const _e = { ...e, stm: new MQStm(), donemBS }; this.loadServerData_queryDuzenle(_e); this.loadServerData_queryDuzenle_son(_e);
		const query = _e.stm, recs = query ? await app.sqlExecSelect({ query, maxRow }) : null; return recs
	}
	loadServerData_queryDuzenle(e) { e.alias = 'fis' }
	loadServerData_queryDuzenle_son(e) {
		const {stm} = e, {secimler} = this, wh = secimler?.getTBWhereClause(e);
		if (wh?.liste?.length) { for (const sent of stm.getSentListe()) { sent.where.birlestir(wh) } }
	}
	loadServerData_queryDuzenle_tarih(e) {
		const {attrSet} = this.raporTanim, {stm} = e, alias = e.alias ?? 'fis', tarihSaha = e.tarihSaha ?? 'tarih';
		const tarihClause = alias ? `${alias}.${tarihSaha}` : tarihSaha, {orderBy} = stm;
		for (const sent of stm.getSentListe()) {
			for (const key in attrSet) {
				switch (key) {
					case 'YILAY': sent.sahalar.add(`(CAST(DATEPART(year, ${tarihClause}) AS CHAR(4)) + ' - ' + dbo.ayadi(${tarihClause})) yilay`); orderBy.add('yilay'); break
					case 'YILHAFTA': sent.sahalar.add(`(CAST(DATEPART(year, ${tarihClause}) AS CHAR(4)) + ' - ' + CAST(DATEPART(week, ${tarihClause}) AS VARCHAR(2))) yilhafta`); orderBy.add('yilhafta'); break
					case 'AYADI': sent.sahalar.add(`dbo.ayadi(${tarihClause}) ayadi`); orderBy.add('ayadi'); break
					case 'HAFTA': sent.sahalar.add(`DATEPART(week, ${tarihClause}) haftano`); orderBy.add('haftano'); break
					case 'TARIH': sent.sahalar.add(tarihClause); orderBy.add(tarihSaha); break
				}
			}
		}
	} 
	donemBagla(e) { const {donemBS, tarihSaha, sent} = e; if (donemBS) { sent.where.basiSonu(donemBS, tarihSaha) } }
}
class DRapor_Ticari extends DRapor_Donemsel { static { window[this.name] = this; this._key2Class[this.name] = this } }
class DRapor_Ticari_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get toplamPrefix() { return '' }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e, {toplamPrefix} = this.class, {zorunlu, ticariGenel} = app.params, {sube} = zorunlu, {takipNo, plasiyer} = ticariGenel.kullanim;
		result.setSortAttr('yilay').addKAPrefix('anagrup', 'grup', 'sistgrup', 'stok', 'tip', 'bolge', 'cistgrup', 'cari', 'il', 'ulke', 'sube', 'takip', 'plasiyer');
		result
			.addGrup(new TabloYapiItem().setKA('STANAGRP', 'Stok Ana Grup').secimKullanilir().setMFSinif(DMQStokAnaGrup)
				.addColDef(new GridKolon({ belirtec: 'anagrup', text: 'Stok Ana Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('STGRP', 'Stok Grup').secimKullanilir().setMFSinif(DMQStokGrup)
				.addColDef(new GridKolon({ belirtec: 'grup', text: 'Stok Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('STISTGRP', 'Stok İst. Grup').secimKullanilir().setMFSinif(DMQStokIstGrup)
				.addColDef(new GridKolon({ belirtec: 'sistgrup', text: 'Stok İst. Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('STOK', 'Stok').secimKullanilir().setMFSinif(DMQStok)
				.addColDef(new GridKolon({ belirtec: 'stok', text: 'Stok', maxWidth: 600, filterType: 'input' })))
			.addGrup(new TabloYapiItem().setKA('CRTIP', 'Cari Tip').secimKullanilir().setMFSinif(DMQCariTip)
				.addColDef(new GridKolon({ belirtec: 'tip', text: 'Cari Tip', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('CRANABOL', 'Ana Bölge').secimKullanilir().setMFSinif(DMQCariAnaBolge)
				.addColDef(new GridKolon({ belirtec: 'anabolge', text: 'Ana Bölge', maxWidth: 450, filterType: 'input' })))
			.addGrup(new TabloYapiItem().setKA('CRBOL', 'Bölge').secimKullanilir().setMFSinif(DMQCariBolge)
				.addColDef(new GridKolon({ belirtec: 'bolge', text: 'Bölge', maxWidth: 450, filterType: 'input' })))
			.addGrup(new TabloYapiItem().setKA('CRISTGRP', 'Cari İst. Grup').secimKullanilir().setMFSinif(DMQCariIstGrup)
				.addColDef(new GridKolon({ belirtec: 'cistgrup', text: 'Cari İst. Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('CARI', 'Cari').secimKullanilir().setMFSinif(DMQCari)
				.addColDef(new GridKolon({ belirtec: 'cari', text: 'Cari', maxWidth: 600, filterType: 'input' })))
			.addGrup(new TabloYapiItem().setKA('CRIL', 'İl').secimKullanilir().setMFSinif(DMQIl)
				.addColDef(new GridKolon({ belirtec: 'il', text: 'İl', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('CRULKE', 'Ülke').secimKullanilir().setMFSinif(DMQUlke)
				.addColDef(new GridKolon({ belirtec: 'ulke', text: 'Ülke', maxWidth: 450, filterType: 'checkedlist' })));
		if (sube) { result.addGrup(new TabloYapiItem().setKA('SUBE', 'Şube').addColDef(new GridKolon({ belirtec: 'sube', text: 'Şube', maxWidth: 450, filterType: 'checkedlist' }))) }
		if (takipNo) { result.addGrup(new TabloYapiItem().setKA('TAKIPNO', 'Takip No').addColDef(new GridKolon({ belirtec: 'takip', text: 'Takip No', maxWidth: 450, filterType: 'checkedlist' }))) }
		if (plasiyer) { result.addGrup(new TabloYapiItem().setKA('PLASIYER', 'Plasiyer').addColDef(new GridKolon({ belirtec: 'plasiyer', text: 'Plasiyer', maxWidth: 550, filterType: 'checkedlist' }))) }
		result
			.addToplam(new TabloYapiItem().setKA('MIKTAR', `${toplamPrefix}Miktar`).addColDef(new GridKolon({ belirtec: 'miktar', text: `${toplamPrefix}Miktar`, genislikCh: 15, filterType: 'numberinput' }).tipDecimal()))
			.addToplam(new TabloYapiItem().setKA('MIKTARKG', `${toplamPrefix}Miktar (KG)`).addColDef(new GridKolon({ belirtec: 'miktarkg', text: `${toplamPrefix}KG`, genislikCh: 15, filterType: 'numberinput' }).tipDecimal()))
			.addToplam(new TabloYapiItem().setKA('CIRO', `${toplamPrefix}Ciro`).addColDef(new GridKolon({ belirtec: 'ciro', text: `${toplamPrefix}Ciro`, genislikCh: 19, filterType: 'numberinput' }).tipDecimal()))
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {raporTanim} = this, {attrSet} = raporTanim, {secimler, stm} = e;
		if (secimler) {
			for (const [key, secim] of Object.entries(secimler.liste)) {
				if (secim.isHidden || secim.isDisabled) { continue }
				const kod = secim.userData?.kod; if (!kod) { continue }
				const uygunmu = typeof secim.value == 'object' ? !$.isEmptyObject(secim.value) : !!secim.value; if (!uygunmu) { continue }
				attrSet[kod] = true
			}
		}
		let {sent, orderBy} = stm, wh = sent.where; e.sent = sent; this.fisVeHareketBagla(e); this.donemBagla({ ...e, sent, tarihSaha: 'fis.tarih' });
		const {kgBirimler} = MQStokGenelParam, kgInClause = `(${kgBirimler.map(x => MQSQLOrtak.sqlServerDegeri(x)).join(', ')})`;
		const kgClause = e.kgClause = `(case when stk.brm IN ${kgInClause} then har.miktar when stk.brm2 IN ${kgInClause} then har.miktar2 else 0 end)`;
		wh.fisSilindiEkle(); wh.add(`fis.ozelisaret <> 'X'`);
		if (attrSet.CRTIP || attrSet.CRBOL || attrSet.CRANABOL || attrSet.CARI || attrSet.CRIL || attrSet.CRULKE || attrSet.CRISTGRP) { sent.fis2CariBagla() }
		if (attrSet.STANAGRP || attrSet.STGRP || attrSet.STISTGRP || attrSet.STOK || attrSet.MIKTARKG || attrSet.BRMIKTARKG || attrSet.IAMIKTARKG) { sent.har2StokBagla() }
		if (attrSet.STANAGRP) { sent.stok2GrupBagla() } if (attrSet.CRANABOL) { sent.cari2BolgeBagla() }
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: 'fis', tarihSaha: 'tarih' });
		for (const key in attrSet) {
			switch (key) {
				case 'STANAGRP': sent.stokGrup2AnaGrupBagla(); sent.sahalar.add('grp.anagrupkod', 'agrp.aciklama anagrupadi'); orderBy.add('anagrupkod'); break
				case 'STGRP': sent.stok2GrupBagla(); sent.sahalar.add('stk.grupkod', 'grp.aciklama grupadi'); orderBy.add('grupkod'); break
				case 'STISTGRP': sent.stok2IstGrupBagla(); sent.sahalar.add('stk.sistgrupkod', 'sigrp.aciklama sistgrupadi'); orderBy.add('sistgrupkod'); break
				case 'STOK': sent.sahalar.add('har.stokkod', 'stk.aciklama stokadi'); orderBy.add('stokkod'); break
				case 'CRTIP': sent.cari2TipBagla(); sent.sahalar.add('car.tipkod', 'ctip.aciklama tipadi'); orderBy.add('tipkod'); break
				case 'CRANABOL': sent.bolge2AnaBolgeBagla(); sent.sahalar.add('bol.anabolgekod', 'abol.aciklama anabolgeadi'); orderBy.add('anabolgekod'); break
				case 'CRBOL': sent.cari2BolgeBagla(); sent.sahalar.add('car.bolgekod', 'bol.aciklama bolgeadi'); orderBy.add('bolgekod'); break
				case 'CRISTGRP': sent.cari2IstGrupBagla(); sent.sahalar.add('car.cistgrupkod', 'cigrp.aciklama cistgrupadi'); orderBy.add('cistgrupkod'); break
				case 'CARI': sent.sahalar.add('fis.must carikod', 'car.birunvan cariadi'); orderBy.add('carikod'); break
				case 'CRIL': sent.cari2IlBagla(); sent.sahalar.add('car.ilkod', 'il.aciklama iladi'); orderBy.add('ilkod'); break
				/*case 'CRULKE': sent.cari2UlkeBagla(); sent.sahalar.add('car.ulkekod', `(case when ulk.aciklama = '' then '' else ulk.aciklama end) ulkeadi`); orderBy.add('ulkekod'); break*/
				case 'CRULKE': sent.cari2UlkeBagla(); sent.sahalar.add('car.ulkekod', 'ulk.aciklama ulkeadi'); orderBy.add('ulkekod'); break
				case 'SUBE': sent.fis2SubeBagla(); sent.sahalar.add('fis.bizsubekod subekod', 'sub.aciklama subeadi'); orderBy.add('subekod'); break
				case 'TAKIPNO':
					sent.fromIliski(`(case when fis.takiportakdir = '' then har.dettakipno else fis.orttakipno end) = tak.kod`);
					sent.sahalar.add('tak.kod takipkod', 'tak.aciklama takipadi'); orderBy.add('takipkod'); break
				case 'PLASIYER': sent.fromIliski('carmst pls', 'fis.plasiyerkod = pls.must'); sent.sahalar.add('fis.plasiyerkod', 'pls.birunvan plasiyeradi'); orderBy.add('plasiyerkod'); break
				case 'MIKTAR': sent.sahalar.add('SUM(har.miktar) miktar'); break
				case 'MIKTARKG': sent.sahalar.add(`SUM(${kgClause}) miktarkg`); break
				case 'CIRO': sent.sahalar.add('SUM(har.bedel) ciro'); break
			}
		}
		this.loadServerData_queryDuzenle_ek(e); sent.groupByOlustur()
	}
	loadServerData_queryDuzenle_ek(e) { } fisVeHareketBagla(e) { }
}
class DRapor_Sevkiyat_Main extends DRapor_Ticari_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get toplamPrefix() { return 'Net ' }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e;
		result
			.addToplam(new TabloYapiItem().setKA('BRMIKTAR', 'Brüt Miktar').addColDef(new GridKolon({ belirtec: 'brmiktar', text: 'Brüt Miktar', genislikCh: 15, filterType: 'numberinput' }).tipDecimal()))
			.addToplam(new TabloYapiItem().setKA('BRMIKTARKG', 'Brüt Miktar (KG)').addColDef(new GridKolon({ belirtec: 'brmiktarkg', text: 'Brüt KG', genislikCh: 15, filterType: 'numberinput' }).tipDecimal()))
			.addToplam(new TabloYapiItem().setKA('BRCIRO', 'Brüt Ciro').addColDef(new GridKolon({ belirtec: 'brciro', text: 'Brüt Ciro', genislikCh: 19, filterType: 'numberinput' }).tipDecimal()))
			.addToplam(new TabloYapiItem().setKA('IAMIKTAR', 'İADE Miktar').addColDef(new GridKolon({ belirtec: 'iamiktar', text: 'İADE Miktar', genislikCh: 15, filterType: 'numberinput' }).tipDecimal()))
			.addToplam(new TabloYapiItem().setKA('IAMIKTARKG', 'İADE Miktar (KG)').addColDef(new GridKolon({ belirtec: 'iamiktarkg', text: 'İADE KG', genislikCh: 15, filterType: 'numberinput' }).tipDecimal()))
			.addToplam(new TabloYapiItem().setKA('IACIRO', 'İADE Ciro').addColDef(new GridKolon({ belirtec: 'iaciro', text: 'İADE Ciro', genislikCh: 19, filterType: 'numberinput' }).tipDecimal()))
	}
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e); const {attrSet} = this.raporTanim, {secimler, stm, kgClause} = e; let {orderBy} = stm;
		for (const sent of stm.getSentListe()) {
			const wh = sent.where; wh.add(`fis.piftipi = 'F'`);
			for (const key in attrSet) {
				switch (key) {
					case 'BRMIKTAR': sent.sahalar.add(`SUM(case when fis.iade = '' then har.miktar else 0 end) brutmiktar`); break
					case 'BRMIKTARKG': sent.sahalar.add(`SUM(case when fis.iade = '' then ${kgClause} else 0 end) brutmiktarkg`); break
					case 'BRCIRO': sent.sahalar.add(`SUM(case when fis.iade = '' then har.bedel else 0 end) brutciro`); break
					case 'IAMIKTAR': sent.sahalar.add(`SUM(case when fis.iade = 'I' then 0 - har.miktar else 0 end) iademiktar`); break
					case 'IAMIKTARKG': sent.sahalar.add(`SUM(case when fis.iade = 'I' then 0 - ${kgClause} else 0 end) iademiktarkg`); break
					case 'IACIRO': sent.sahalar.add(`SUM(case when fis.iade = 'I' then 0 - har.bedel else 0 end) iadeciro`); break
				}
			}
		}
	}
	fisVeHareketBagla(e) { super.fisVeHareketBagla(e); const {sent} = e; sent.fisHareket('piffis', 'pifstok') }
}
