class CariTopluIslemFis extends FinansFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return CariTopluIslemDetay }
	static get gridKontrolcuSinif() { return CariTopluIslemGridci }
	static get sinifAdi() { return 'Cari Toplu İşlem Fişi' }
	static get table() { return 'finansfis' }
	static get tableAlias(){return 'fis'}
	static get kodListeTipi() { return 'CARITOPLUISLEMFIS' }
	//static get tsnKullanilirmi() { return true }
	static get numTipKod() { return 'CISL' }
	static get numYapi() { return new MQNumarator({ kod: this.numTipKod }) }
	static get fisTipi() { return 'CI' }
	static get tsnKullanilirmi() { return true }

	constructor(e) {
		e = e || {};
		super(e)
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			carIslKod: new PInstStr('carislkod'),
			ba: new PInstTekSecim('ba', TahsilatOdeme),
			baslikAciklama: new PInstStr('aciklama')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		const baslikFormlar = e.builders.baslikForm.builders;
		let parentForm = baslikFormlar[0];
		let form = parentForm.addFormWithParent();
		parentForm = baslikFormlar[1];
		form.addModelKullan({ id: 'carIslKod', mfSinif: MQCarIslem }).dropDown()
		form = parentForm.addFormWithParent().yanYana(2);
		form.addTextInput({ id: 'baslikAciklama', etiket: 'Açıklama' })
	}
	
	static secimlerDuzenle(e){
		//Burası filtreleme ekranı yaptığımız alan.
		super.secimlerDuzenle(e);
		const {secimler} = e;
		secimler.grupTopluEkle([//gruplama yaptığımız kısım.
			{ kod: 'islemVeDepartman', aciklama: 'İşlem ve Departman', zeminRenk: '#33ccaa', kapali: false },
			{ kod: 'bedel', aciklama: 'Bedel', zeminRenk: '00FFFF', kapali: false }
		]);
		secimler.secimTopluEkle({
			aciklama: new SecimOzellik({ etiket: 'Açıklama', grupKod: 'islemVeDepartman' }),
			toplamBedel: new SecimString({ etiket: 'Toplam Bedel', grupKod: 'bedel' })
		});
		secimler.whereBlockEkle(e=>{
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
			where.ozellik(secimler.aciklama, `${aliasVeNokta}aciklama`);
			where.basiSonu(secimler.toplamBedel, `${aliasVeNokta}toplambedel`);
		})
	}
	
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e);
		e.liste.push('carislkod', 'aciklama', 'toplambedel', 'bduzyazdirildi', 'mfistipi')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		const {aliasVeNokta} = this;
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'carislkod', text: 'İşlem Kod', genislikCh: 10 }),
			new GridKolon({ belirtec: 'aciklama', text: ' Fiş Açıklama', genislikCh: 20 }),
			new GridKolon({ belirtec: 'toplambedel', text: 'Fiş Bedel', genislikCh: 15 }),
			new GridKolon({ belirtec: 'bduzyazdirildi', text: 'Düz Yazdırıldı', genislikCh: 5, 
						   sql: `(case when fis.bduzyazdirildi=0 then '' else 'X' end)` }),
			new GridKolon({ belirtec: 'mfistipi', text: 'Muh. Fiş Tipi ', genislikCh: 15, 
						   sql: `(case mfis.fistipi when 'H' then 'Th' when 'K' then 'Td' when 'M' then 'Mh' else '' end)` }),
			new GridKolon({ belirtec: 'carislkod', text: 'İşlem Kod', genislikCh: 10 }),
			new GridKolon({ belirtec: 'carislaciklama', text: ' İşlem Açıklama', genislikCh: 20, sql: 'isl.aciklama' }),
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.leftJoin({ alias: 'fis', table: `muhfis mfis`, on: `${aliasVeNokta}muhfissayac=mfis.kaysayac` });
		sent.fromIliski('carisl isl', `${aliasVeNokta}carislkod=isl.kod`);
	}
}

class CariTopluIslemDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'finanshar' }
	static get tableAlias(){return 'har'}
	
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			//cariKod: new PInstStr('must'),
			//cariUnvan: new PInstStr(),
			detAciklama: new PInstStr('aciklama')
		})
	}
	
	static extYapilarDuzenle(e) {
		super.extYapilarDuzenle(e);
		e.liste.push(Ext_Cari, Ext_Bedel, Ext_BelgeTarihVeNo)
	}
	
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'seq', text: 'seq', genislikCh: 5 }),
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 30 }),
			new GridKolon({ belirtec: 'vade', text: 'Vade', genislikCh: 20 }).tipDate(),
		)
	}
}

class CariTopluIslemGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }

	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e);
		const cariKolonGrup = MQCari.getGridKolonGrup({ belirtec: 'cari' }).sabitle();
		const {tabloKolonlari} = e;
		tabloKolonlari.push(
			cariKolonGrup,
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 15 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 50 }),
			new GridKolon({ belirtec: 'belgetarih', text: 'Tarih', genislikCh: 10 }).tipDate(),
			new GridKolon({ belirtec: 'vade', text: 'Vade', genislikCh: 10 }).tipDate(),
		)
	}
}
