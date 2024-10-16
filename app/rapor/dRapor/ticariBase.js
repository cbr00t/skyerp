class DRapor_Ticari extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kategoriKod() { return 'TICARI' } static get shd() { return null }
	get stokmu() { return this.shd == 'stok' } get hizmetmi() { return this.shd == 'hizmet' }
	constructor(e) { e = e || {}; super(e); $.extend(this, { shd: e.shd ?? e.shd ?? this.class.shd }) }
	stok() { this.shd = 'stok'; return this } hizmet() { this.shd = 'hizmet'; return this }
}
class DRapor_TicariStok extends DRapor_Ticari {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get shd() { return 'stok' } static get kategoriKod() { return `${super.kategoriKod}-STOK` }
}
class DRapor_TicariHizmet extends DRapor_Ticari {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get shd() { return 'hizmet' } static get kategoriKod() { return `${super.kategoriKod}-HIZMET` }
}

class DRapor_Ticari_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get toplamPrefix() { return '' } get shd() { return this.rapor?.shd }
	get stokmu() { return this.rapor?.stokmu } get hizmetmi() { return this.rapor?.hizmetmi }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e, {toplamPrefix} = this.class, {zorunlu, ticariGenel} = app.params, {sube} = zorunlu, {takipNo, plasiyer} = ticariGenel.kullanim;
		this.tabloYapiDuzenle_shd(e); result
			.addKAPrefix('tip', 'bolge', 'cistgrup', 'cari', 'il', 'ulke', 'sube', 'takip', 'plasiyer')
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
		if (sube) {
			result.addGrup(new TabloYapiItem().setKA('SUBE', 'Şube').secimKullanilir().setMFSinif(DMQSube)
				.addColDef(new GridKolon({ belirtec: 'sube', text: 'Şube', maxWidth: 450, filterType: 'checkedlist' })))
		}
		if (takipNo) {
			result.addGrup(new TabloYapiItem().setKA('TAKIPNO', 'Takip No').secimKullanilir().setMFSinif(DMQTakipNo)
			   .addColDef(new GridKolon({ belirtec: 'takip', text: 'Takip No', maxWidth: 450, filterType: 'checkedlist' })))
		}
		if (plasiyer) {
			result.addGrup(new TabloYapiItem().setKA('PLASIYER', 'Plasiyer').secimKullanilir().setMFSinif(DMQPlasiyer)
				.addColDef(new GridKolon({ belirtec: 'plasiyer', text: 'Plasiyer', maxWidth: 550, filterType: 'checkedlist' })))
		}
		this.tabloYapiDuzenle_miktar(e).tabloYapiDuzenle_ciro(e);
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {stm, attrSet} = e; let {sent} = stm, {where: wh} = sent;
		$.extend(e, { sent }); this.fisVeHareketBagla(e); this.donemBagla({ ...e, tarihSaha: 'fis.tarih' });
		const {kgBirimler} = MQStokGenelParam, kgInClause = `(${kgBirimler.map(x => MQSQLOrtak.sqlServerDegeri(x)).join(', ')})`;
		const kgClause = e.kgClause = `(case when stk.brm IN ${kgInClause} then har.miktar when stk.brm2 IN ${kgInClause} then har.miktar2 else 0 end)`;
		wh.fisSilindiEkle(); wh.add(`fis.ozelisaret <> 'X'`); 
		if (attrSet.CRTIP || attrSet.CRBOL || attrSet.CRANABOL || attrSet.CARI || attrSet.CRIL || attrSet.CRULKE || attrSet.CRISTGRP) { sent.fis2CariBagla() }
		if (attrSet.CRANABOL) { sent.cari2BolgeBagla() } if (attrSet.MIKTARKG || attrSet.BRMIKTARKG || attrSet.IAMIKTARKG) { sent.har2StokBagla() }
		for (const key in attrSet) {
			switch (key) {
				case 'CRTIP': sent.cari2TipBagla(); sent.sahalar.add('car.tipkod', 'ctip.aciklama tipadi'); wh.icerikKisitDuzenle_cariTip({ ...e, saha: 'car.tipkod' }); break
				case 'CRANABOL': sent.bolge2AnaBolgeBagla(); sent.sahalar.add('bol.anabolgekod', 'abol.aciklama anabolgeadi'); wh.icerikKisitDuzenle_cariAnaBolge({ ...e, saha: 'bol.anabolgekod' }); break
				case 'CRBOL': sent.cari2BolgeBagla(); sent.sahalar.add('car.bolgekod', 'bol.aciklama bolgeadi'); wh.icerikKisitDuzenle_cariBolge({ ...e, saha: 'car.bolgekod' }); break
				case 'CRISTGRP': sent.cari2IstGrupBagla(); sent.sahalar.add('car.cistgrupkod', 'cigrp.aciklama cistgrupadi'); wh.icerikKisitDuzenle_cariIstGrup({ ...e, saha: 'car.cistgrupkod' }); break
				case 'CARI': sent.sahalar.add('fis.must carikod', 'car.birunvan cariadi'); wh.icerikKisitDuzenle_cari({ ...e, saha: 'fis.must' }); break
				case 'CRIL': sent.cari2IlBagla(); sent.sahalar.add('car.ilkod', 'il.aciklama iladi'); wh.icerikKisitDuzenle_cariIl({ ...e, saha: 'car.ilkod' }); break
				/*case 'CRULKE': sent.cari2UlkeBagla(); sent.sahalar.add('car.ulkekod', `(case when ulk.aciklama = '' then '' else ulk.aciklama end) ulkeadi`); break*/
				case 'CRULKE': sent.cari2UlkeBagla(); sent.sahalar.add('car.ulkekod', 'ulk.aciklama ulkeadi'); wh.icerikKisitDuzenle_cariUlke({ ...e, saha: 'car.ulkekod' }); break
				case 'SUBE': sent.fis2SubeBagla(); sent.sahalar.add('fis.bizsubekod subekod', 'sub.aciklama subeadi'); wh.icerikKisitDuzenle_sube({ ...e, saha: 'fis.bizsubekod' }); break
				case 'TAKIPNO':
					sent.fromIliski('takipmst tak', `(case when fis.takiportakdir = '' then har.dettakipno else fis.orttakipno end) = tak.kod`);
					sent.sahalar.add('tak.kod takipkod', 'tak.aciklama takipadi'); break
				case 'PLASIYER':
					sent.fromIliski('carmst pls', 'fis.plasiyerkod = pls.must'); sent.sahalar.add('fis.plasiyerkod', 'pls.birunvan plasiyeradi');
					wh.icerikKisitDuzenle_plasiyer({ ...e, saha: 'fis.plasiyerkod' }); break
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: 'fis', tarihSaha: 'tarih' }).loadServerData_queryDuzenle_shd(e);
		this.loadServerData_queryDuzenle_miktar(e).loadServerData_queryDuzenle_ciro(e);
		this.loadServerData_queryDuzenle_ek(e); sent.groupByOlustur()
	}
	loadServerData_queryDuzenle_ek(e) { } fisVeHareketBagla(e) { }
	tabloYapiDuzenle_shd(e) { const {shd} = this; if (shd) { this[`tabloYapiDuzenle_${shd}`](e) } return this }
	loadServerData_queryDuzenle_shd(e) { const {shd} = this; if (shd) { this[`loadServerData_queryDuzenle_${shd}`](e) } return this }
	tabloYapiDuzenle_stok(e) {
		const {result} = e; result
			.addKAPrefix('anagrup', 'grup', 'sistgrup', 'stok')
			.addGrup(new TabloYapiItem().setKA('STANAGRP', 'Stok Ana Grup').secimKullanilir().setMFSinif(DMQStokAnaGrup)
				.addColDef(new GridKolon({ belirtec: 'anagrup', text: 'Stok Ana Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('STGRP', 'Stok Grup').secimKullanilir().setMFSinif(DMQStokGrup)
				.addColDef(new GridKolon({ belirtec: 'grup', text: 'Stok Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('STISTGRP', 'Stok İst. Grup').secimKullanilir().setMFSinif(DMQStokIstGrup)
				.addColDef(new GridKolon({ belirtec: 'sistgrup', text: 'Stok İst. Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('STOK', 'Stok').secimKullanilir().setMFSinif(DMQStok)
				.addColDef(new GridKolon({ belirtec: 'stok', text: 'Stok', maxWidth: 600, filterType: 'input' })));
		return this
	}
	loadServerData_queryDuzenle_stok(e) {
		const {attrSet, stm} = e; for (const sent of stm.getSentListe()) {
			let wh = sent.where; if (attrSet.STANAGRP) { sent.stok2GrupBagla() }
			if (attrSet.STANAGRP || attrSet.STGRP || attrSet.STISTGRP || attrSet.STOK) { sent.har2StokBagla() }
			for (const key in attrSet) {
				switch (key) {
					case 'STANAGRP': sent.stokGrup2AnaGrupBagla(); sent.sahalar.add('grp.anagrupkod', 'agrp.aciklama anagrupadi'); wh.icerikKisitDuzenle_stokAnaGrup({ ...e, saha: 'grp.anagrupkod' }); break
					case 'STGRP': sent.stok2GrupBagla(); sent.sahalar.add('stk.grupkod', 'grp.aciklama grupadi'); wh.icerikKisitDuzenle_stokGrup({ ...e, saha: 'stk.grupkod' }); break
					case 'STISTGRP': sent.stok2IstGrupBagla(); sent.sahalar.add('stk.sistgrupkod', 'sigrp.aciklama sistgrupadi'); wh.icerikKisitDuzenle_stokIstGrup({ ...e, saha: 'grp.sistgrupkod' }); break
					case 'STOK': sent.sahalar.add('har.stokkod', 'stk.aciklama stokadi'); wh.icerikKisitDuzenle_stok({ ...e, saha: 'har.stokkod' }); break
				}
			}
		}
		return this
	}
	tabloYapiDuzenle_hizmet(e) {
		const {result} = e; result
			.addKAPrefix('anagrup', 'grup', 'histgrup', 'hizmet')
			.addGrup(new TabloYapiItem().setKA('HZANAGRP', 'Hizmet Ana Grup').secimKullanilir().setMFSinif(DMQHizmetAnaGrup)
				.addColDef(new GridKolon({ belirtec: 'anagrup', text: 'Hizmet Ana Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HZGRP', 'Hizmet Grup').secimKullanilir().setMFSinif(DMQHizmetGrup)
				.addColDef(new GridKolon({ belirtec: 'grup', text: 'Hizmet Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HZISTGRP', 'Hizmet İst. Grup').secimKullanilir().setMFSinif(DMQHizmetIstGrup)
				.addColDef(new GridKolon({ belirtec: 'sistgrup', text: 'Hizmet İst. Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HIZMET', 'Hizmet').secimKullanilir().setMFSinif(DMQHizmet)
				.addColDef(new GridKolon({ belirtec: 'hizmet', text: 'Hizmet', maxWidth: 600, filterType: 'input' })));
		return this
	}
	loadServerData_queryDuzenle_hizmet(e) {
		const {attrSet, stm} = e; for (const sent of stm.getSentListe()) {
			let wh = sent.where; if (attrSet.HZANAGRP) { sent.hizmet2GrupBagla() }
			if (attrSet.HZANAGRP || attrSet.HZGRP || attrSet.HZISTGRP || attrSet.HIZMET) { sent.har2HizmetBagla() }
			for (const key in attrSet) {
				switch (key) {
					case 'HZANAGRP': sent.hizmetGrup2AnaGrupBagla(); sent.sahalar.add('grp.anagrupkod', 'agrp.aciklama anagrupadi'); wh.icerikKisitDuzenle_hizmetAnaGrup({ ...e, saha: 'grp.anagrupkod' }); break
					case 'HZGRP': sent.hizmet2GrupBagla(); sent.sahalar.add('hiz.grupkod', 'grp.aciklama grupadi'); wh.icerikKisitDuzenle_hizmetGrup({ ...e, saha: 'hiz.grupkod' }); break
					case 'HZISTGRP': sent.hizmet2IstGrupBagla(); sent.sahalar.add('hiz.histgrupkod', 'higrp.aciklama histgrupadi'); wh.icerikKisitDuzenle_hizmetIstGrup({ ...e, saha: 'grp.histgrupkod' }); break
					case 'HIZMET': sent.sahalar.add('har.hizmetkod', 'hiz.aciklama hizmetadi'); wh.icerikKisitDuzenle_hizmet({ ...e, saha: 'har.hizmetkod' }); break
				}
			}
		}
		return this
	}
	tabloYapiDuzenle_miktar(e) {
		const {result} = e, {stokmu} = this, toplamPrefix = e.toplamPrefix ?? this.class.toplamPrefix;
		result.addToplam(new TabloYapiItem().setKA('MIKTAR', `${toplamPrefix}Miktar`).addColDef(new GridKolon({ belirtec: 'miktar', text: `${toplamPrefix}Miktar`, genislikCh: 15, filterType: 'numberinput' }).tipDecimal()));
		if (stokmu) { result.addToplam(new TabloYapiItem().setKA('MIKTARKG', `${toplamPrefix}Miktar (KG)`).addColDef(new GridKolon({ belirtec: 'miktarkg', text: `${toplamPrefix}KG`, genislikCh: 15, filterType: 'numberinput' }).tipDecimal())) }
		return this
	}
	loadServerData_queryDuzenle_miktar(e) {
		const {attrSet, stm, kgClause} = e; for (const sent of stm.getSentListe()) {
			for (const key in attrSet) { switch (key) { case 'MIKTAR': sent.sahalar.add('SUM(har.miktar) miktar'); break; case 'MIKTARKG': sent.sahalar.add(`SUM(${kgClause}) miktarkg`); break } }
		}
		return this
	}
	tabloYapiDuzenle_ciro(e) {
		const {result} = e, toplamPrefix = e.toplamPrefix ?? this.class.toplamPrefix;
		result.addToplam(new TabloYapiItem().setKA('CIRO', `${toplamPrefix}Ciro`).addColDef(new GridKolon({ belirtec: 'ciro', text: `${toplamPrefix}Ciro`, genislikCh: 19, filterType: 'numberinput' }).tipDecimal()));
		return this
	}
	loadServerData_queryDuzenle_ciro(e) {
		const {attrSet, stm} = e; for (const sent of stm.getSentListe()) {
			for (const key in attrSet) { switch (key) { case 'CIRO': sent.sahalar.add('SUM(har.bedel) ciro'); break } } }
		return this
	}
}
class DRapor_Sevkiyat_Main extends DRapor_Ticari_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get toplamPrefix() { return 'Net ' }
	fisVeHareketBagla(e) { super.fisVeHareketBagla(e); const {sent} = e, {shd} = this; sent.fisHareket('piffis', `pif${shd}`) }
	tabloYapiDuzenle_miktar(e) {
		super.tabloYapiDuzenle_miktar(e); const {result} = e, {stokmu} = this;
		result.addToplam(new TabloYapiItem().setKA('BRMIKTAR', 'Brüt Miktar').addColDef(new GridKolon({ belirtec: 'brutmiktar', text: 'Brüt Miktar', genislikCh: 15, filterType: 'numberinput' }).tipDecimal()));
		if (stokmu) { result.addToplam(new TabloYapiItem().setKA('BRMIKTARKG', 'Brüt Miktar (KG)').addColDef(new GridKolon({ belirtec: 'brutmiktarkg', text: 'Brüt KG', genislikCh: 15, filterType: 'numberinput' }).tipDecimal())) }
		result.addToplam(new TabloYapiItem().setKA('BRCIRO', 'Brüt Ciro').addColDef(new GridKolon({ belirtec: 'brutciro', text: 'Brüt Ciro', genislikCh: 19, filterType: 'numberinput' }).tipDecimal()))
			  .addToplam(new TabloYapiItem().setKA('IAMIKTAR', 'İADE Miktar').addColDef(new GridKolon({ belirtec: 'iademiktar', text: 'İADE Miktar', genislikCh: 15, filterType: 'numberinput' }).tipDecimal()));
		if (stokmu) { result.addToplam(new TabloYapiItem().setKA('IAMIKTARKG', 'İADE Miktar (KG)').addColDef(new GridKolon({ belirtec: 'iademiktarkg', text: 'İADE KG', genislikCh: 15, filterType: 'numberinput' }).tipDecimal())) }
		result.addToplam(new TabloYapiItem().setKA('IACIRO', 'İADE Ciro').addColDef(new GridKolon({ belirtec: 'iadeciro', text: 'İADE Ciro', genislikCh: 19, filterType: 'numberinput' }).tipDecimal()));
		return this
	}
	loadServerData_queryDuzenle_miktar(e) {
		super.loadServerData_queryDuzenle_miktar(e); const {stm, attrSet, kgClause} = e;
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
		return this
	}
}
