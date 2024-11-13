class IK_MQBankaMevduatDevirFis extends MQGenelFis {
	static get detaySinif() { return MQBankaDevir_Detay }
	static get gridKontrolcuSinif() { return MQBankaDevir_Gridci }
	static get sinifAdi() { return 'MQ Banka Devir Fis' }
	static get table() { return 'findevirfis' }
	static get tableAlias(){return 'fis'}
	static get kodListeTipi() { return 'FISTEST1' }
	//static get numTipKod() { return 'KSDEV' }
	static get numYapi() { return new MQTicNumarator({ tip: this.numTipKod }) }
	static get tsnKullanilirmi() { return true }
	static get fisTipi() { return 'BH' }

	constructor(e) {
		e = e || {};
		super(e)
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			ba: new PInstTekSecim('ba', BorcAlacak),
			fisTipi: new PInstStr('fistipi')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		const baslikFormlar = e.builders.baslikForm.builders;
		
		let parentForm = baslikFormlar[0];
		let form = parentForm.addFormWithParent();

		form.addModelKullan({ id: 'ba', etiket: 'Borç/Alacak', source: e => BorcAlacak.instance.kaListe })
			.dropDown().kodsuz().bosKodAlinmaz().bosKodEklenmez().noMF()
			.onAfterRun(e => e.builder.altInst.baDegisti(e))
			.degisince(e => e.builder.altInst.baDegisti(e));
	}

	alternateKeyHostvars(e) {
		super.alternateKeyHostvars(e);
		const {hv} = e;
		$.extend(hv, { ba: this.ba.char })
	}
	
	setValues(e) {
		super.setValues(e);
		const {rec} = e;
		$.extend(this, { dvKod: rec.dvkod })
	}
	
	baDegisti(e) {
		const {ba} = this;
		const {builder} = e;
		const {layout, input} = builder;
		const renk = ba.borcmu ? 'green' : ba.alacakmi ? 'red' : 'transparent';
		input.css('border', `3px solid ${renk}`);
		input.css('color', renk)
	}
	
	static secimlerDuzenle(e){
		//Burası filtreleme ekranı yaptığımız alan.
		super.secimlerDuzenle(e);
		const {secimler} = e;
		secimler.grupTopluEkle([//gruplama yaptığımız kısım.
			{ kod: 'islemVeDepartman', aciklama: 'İşlem ve Departman', zeminRenk: '#33ccaa', kapali: false },
			{ kod: 'bedel', aciklama: 'Bedel', zeminRenk: '00FFFF', kapali: false }
			//{ kod: 'islemVeDepartman2', aciklama: 'İşlem ve Departman-2', zeminRenk: '#33ccaa', kapali: false }
		]);

		secimler.secimTopluEkle({
		//	banKod: new SecimString({ etiket: 'Bank Kod', mfSinif: MQBanka, grupKod: 'islemVeDepartman' }),
			fisTipi: new SecimString({ etiket: 'Fiş Tipi', grupKod: 'islemVeDepartman' }),
			aciklama: new SecimOzellik({ etiket: 'Açıklama', grupKod: 'islemVeDepartman' }),
			toplamBedel: new SecimString({ etiket: 'Toplam Bedel', grupKod: 'bedel' })
		});

		secimler.whereBlockEkle(e=>{
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
		//	where.basiSonu(secimler.banKod, `${aliasVeNokta}bizsubekod`);
			where.basiSonu(secimler.fisTipi, `${aliasVeNokta}fistipi`);
			where.ozellik(secimler.aciklama, `${aliasVeNokta}aciklama`);
			where.basiSonu(secimler.toplamBedel, `${aliasVeNokta}toplambedel`);
			//burada secimler.kasKod kısmındaki kasKod  secimler.secimTopluEkle metodundan gelen kasKod olmasına dikkat et.
		})
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e);
		e.liste.push('kasakod', 'aciklama','fisaciklama','toplambedel')
	}

	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		const {aliasVeNokta} = this;
		/*sql:    BorcAlacak.getClause(`${aliasVeNokta}ba`)`*/
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'bduzyazdirildi', text: 'Duz Yaz. Text', genislikCh: 10, sql: `(case when fis.bduzyazdirildi=0 then '' else 'X' end)` }),
			new GridKolon({ belirtec: 'ba', text: 'Borç/Alacak', genislikCh: 10, sql: `(case fis.ba when 'B' then 'Borç' when 'A' then 'Alacak' else '' end)` }),
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 20  }),
			new GridKolon({ belirtec: 'toplambedel', text: 'Toplam Bedel', genislikCh: 5  }),
		);
	}

	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent} = e;
		//sent.where.addAll(`fis.fistipi='KS'`)
	}

	tekilOku_queryDuzenle(e) {
		super.tekilOku_queryDuzenle(e);
		const {aliasVeNokta, sayacSaha} = this.class;
		const {sayac} = this;
		const {sent} = e;
		if (sayac && sayacSaha) {
			sent.where.liste = [];
			sent.where
				.degerAta(sayac, `${aliasVeNokta}${sayacSaha}`)
		}
	}
}

class MQBankaDevir_Detay extends MQDetay {
	static get table() { return 'findevirhar' }
	static get tableAlias(){return 'har'}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			kasaKod : new PInstStr('kasakod'),
			bedel: new PInstNum('bedel'),
			dvBedel: new PInstNum('dvbedel'),
			detAciklama: new PInstStr('aciklama')
		})
	}
	static extYapilarDuzenle(e) {
		super.extYapilarDuzenle(e);
		e.liste.push(Ext_Bedel)
	}
	
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		
		const {liste} = e;
		liste.push(
			//new GridKolon({ belirtec: 'fissayac', text: 'Fissayac', genislikCh: 15 }),
			
			//new GridKolon({ belirtec: 'seq', text: 'seq', genislikCh:5}),
			new GridKolon({ belirtec: 'banhesapkod', text: 'Banka Kod', genislikCh:10}),
			new GridKolon({ belirtec: 'banaciklama', text: 'Banka Adı', genislikCh:30, sql: 'bhes.aciklama'}),
			//new GridKolon({ belirtec: 'dvbedel', text: 'Dv. Bedel', genislikCh:10}),
			//new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh:10}),
			new GridKolon({ belirtec: 'aciklama', text: 'Det. Açıklama', genislikCh:30}),
			
			//new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 10}),
		)
	}

	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent,fissayac} = e;
		sent.fromIliski('banbizhesap bhes', `${aliasVeNokta}banhesapkod = bhes.kod`);
		//sent.sahalar.addAll(['car.yore']);
		//sent.where.addAll(`${aliasVeNokta}fissayac=${fissayac}`)
	}
}

class MQBankaDevir_Gridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }

	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e);

		const devirKolonGrup = MQBanka.getGridKolonGrup({
			belirtec: 'kasa', kodAttr: 'kasaKod',
			adiEtiket: MQBanka.sinifAdi, mfSinif: MQBanka 
		}).sabitle();
		/*cariKolonGrup.tabloKolonlari.push(
			new GridKolon({ belirtec: 'cariYore', text: 'Yöre', genislikCh: 15 }).readOnly()
		)
		cariKolonGrup.stmDuzenleyiciEkle(e => {
			const {alias} = e;
			for (const sent of e.stm.getSentListe())
				sent.sahalar.addWithAlias(alias, 'yore')
		});
		cariKolonGrup.degisince(async e => {
			const rec = await e.rec;
			e.setCellValue({ belirtec: 'yore', value: rec?.yore || '' })
		});*/
		
		const {tabloKolonlari} = e;
		tabloKolonlari.push(
			devirKolonGrup,
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 15, cellValueChanged: e => this.bedelDegisti(e) }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'dvBedel', text: 'Dv.Bedel', genislikCh: 15, cellValueChanged: e => this.bedelDegisti(e) }).tipDecimal_dvBedel(),
			new GridKolon({ belirtec: 'detAciklama', text: 'Açıklama', genislikCh: 50 })
		)
	}
}
	
