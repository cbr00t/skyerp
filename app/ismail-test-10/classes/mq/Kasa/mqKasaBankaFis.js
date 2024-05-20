class MQKasaBankaFis extends FinansFis {
	static get detaySinif() { return MQKasaYatanCekenFisleri_Detay }
	static get gridKontrolcuSinif() { return MQKasaYatanCekilen_Gridci }
	static get sinifAdi() { return 'Kasa/Banka Fişi' }
	static get table() { return 'finansfis' }
	static get kodListeTipi() { return 'KASABANKAFIS' }
	static get tsnKullanilirmi() { return true }
	static get numTipKod() { return 'TS1' }
	static get fisTipi() { return 'KB' }
	static get numTipKod() { return 'KSTAH' }
	static get numYapi() { return new MQNumarator({ kod: this.numTipKod }) }
	
	constructor(e) {
		e = e || {};
		super(e)
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {

			ba: new PInstTekSecim('ba', YatanCekilen),
			dvKod: new PInstStr(),
			//dvKur: new PInstNum(),
			kasKod: new PInstStr('kasakod'),
			fisTipi:new PInstStr('fistipi'),
			baslikAciklama:new PInstStr('aciklama'),
			toplamBedel:new PInstNum('toplambedel'),
			
			//mustKod: new PInstStr('must')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		const baslikFormlar = e.builders.baslikForm.builders;
		
		let parentForm = baslikFormlar[0];
		let form = parentForm.addFormWithParent();
		form.addModelKullan({ id: 'ba', etiket: 'Yatan/Çekilen', source: e => YatanCekilen.instance.kaListe })
			.dropDown().kodsuz().bosKodAlinmaz().bosKodEklenmez().noMF()
			.onAfterRun(e => e.builder.altInst.baDegisti(e))
			.degisince(e => e.builder.altInst.baDegisti(e));
		/*form.addNumberInput({ id: 'dvKur', etiket: 'Dv.Kur' })
			.onBuildEk(e => {
				const {builder} = e;
				const {input} = builder;
				input.attr('readonly', '');
				input.addClass('readOnly');
				e.builder.rootPart.fbd_dvKur = builder
			});*/
		
		parentForm = baslikFormlar[1];
		form = parentForm.addFormWithParent().yanYana(2);
		form.addModelKullan({ id: 'kasKod', mfSinif: MQKasa }).dropDown()
				//.degisince(e => e.builder.altInst.kasaDegisti(e));
		form.addTextInput({ id: 'baslikAciklama', etiket: 'Açıklama' })
		
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
			kasKod: new SecimString({ etiket: 'Kasa Kod', mfSinif: MQKasa, grupKod: 'islemVeDepartman' }),
			fisTipi: new SecimString({ etiket: 'Fiş Tipi', grupKod: 'islemVeDepartman' }),
			aciklama: new SecimOzellik({ etiket: 'Açıklama', grupKod: 'islemVeDepartman' }),
			toplamBedel: new SecimString({ etiket: 'Toplam Bedel', grupKod: 'bedel' })
		});

		secimler.whereBlockEkle(e=>{
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
			where.basiSonu(secimler.kasKod, `${aliasVeNokta}kasakod`);
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
		
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'ba', text: 'BA', genislikCh: 5  }),
			new GridKolon({ belirtec: 'yc', text: 'Yatan/Çekilen', genislikCh: 30, sql: `(case fis.ba when 'B' then 'Çekilen' when 'A' then 'Yatan' else '' end)` }),
			new GridKolon({ belirtec: 'kasakod', text: 'Kasa Kod', genislikCh: 20  }),
			new GridKolon({ belirtec: 'kasaaciklama', text: 'Kasa Adı', genislikCh: 20, sql: 'kas.aciklama' }),
			new GridKolon({ belirtec: 'aciklama', text: 'Fiş Açıklama', genislikCh: 20 }),
			new GridKolon({ belirtec: 'muhentyapildi', text: 'Muhent Yapildi', genislikCh: 10 }),
			new GridKolon({ belirtec: 'toplambedel', text: 'Fiş Bedeli', genislikCh: 20 })
		);
	}
	baDegisti(e) {
		const {ba} = this;
		const {builder} = e;
		const {layout, input} = builder;
		const renk = ba.yatanmi ? 'red' : ba.cekilenmi ? 'green' : 'transparent';
		input.css('border', `3px solid ${renk}`);
		input.css('color', renk)
	}

	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.fromIliski('kasmst kas', 'fis.kasakod = kas.kod');
		//sent.where.addAll(`fis.fistipi='KB'`)
		
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

class MQKasaYatanCekenFisleri_Detay extends MQDetay {
	static get table() { return 'finanshar' }
	static get tableAlias(){return 'har'}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			dvTipi: new PInstStr(),
			banKod: new PInstStr('banhesapkod'),
			dvKur: new PInstNum('dvkur'),
			bedel: new PInstNum('bedel'),
			dvBedel: new PInstNum('dvbedel'),
			detAciklama: new PInstStr('aciklama')
		})
	}
	
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		
		const {liste} = e;
		liste.push(
			//new GridKolon({ belirtec: 'fissayac', text: 'Fissayac', genislikCh: 15 }),
			new GridKolon({ belirtec: 'kaysayac', text: 'Har Sayac', genislikCh: 5 }),
			new GridKolon({ belirtec: 'seq', text: 'seq', genislikCh: 5 }),
			new GridKolon({ belirtec: 'banhesapkod', text: 'Banka Hesap kod', genislikCh: 10 }),
			new GridKolon({ belirtec: 'bankaadi', text: 'Banka Hesap Adı', genislikCh: 30, sql: `bhes.aciklama` }),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 25 }).tipDecimal(),
			new GridKolon({ belirtec: 'dvbedel', text: 'Dv Bedel', genislikCh: 25 }).tipDecimal(),
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 30 }),
		)
	}

	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent,fissayac} = e;
		sent.fromIliski('banbizhesap bhes', `${aliasVeNokta}banhesapkod = bhes.kod`);
		sent.sahalar.addWithAlias('bhes', 'dvtipi')
	}
	setValues(e) {
		super.setValues(e);
		const {rec} = e;
		$.extend(this, {
			dvTipi: rec.dvtipi,
		})
	}
	
}
class MQKasaYatanCekilen_Gridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }

	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e);

		const banKolonGrup = IK_MQBanBizHesap.getGridKolonGrup({
			belirtec: 'banka', kodAttr: 'banKod', adiEtiket: IK_MQBanBizHesap.sinifAdi, mfSinif: IK_MQBanBizHesap
		}).sabitle();
		banKolonGrup.tabloKolonlari.push(
			new GridKolon({ belirtec: 'dvTipi', text: 'Dv. Tipi', genislikCh: 10 }).readOnly(),
		)
		banKolonGrup.stmDuzenleyiciEkle(e => {
			const {alias} = e;
			for (const sent of e.stm.getSentListe())
				sent.sahalar.addWithAlias(alias, 'dvtipi')
		});
		banKolonGrup.degisince(async e => {
			const rec = await e.rec;
			e.setCellValue({ belirtec: 'dvTipi', value: rec?.dvtipi || '' })
		});
		
		const {tabloKolonlari} = e;
		tabloKolonlari.push(
			banKolonGrup,
			new GridKolon({ belirtec: 'dvKur', text: 'Dv. Kur', genislikCh: 10, cellValueChanged: e => this.bedelDegisti(e) }).tipDecimal_bedel().readOnly(),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 15, cellValueChanged: e => this.bedelDegisti(e) }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'dvBedel', text: 'Dv.Bedel', genislikCh: 15, cellValueChanged: e => this.bedelDegisti(e) }).tipDecimal_dvBedel(),
			new GridKolon({ belirtec: 'detAciklama', text: 'Açıklama', genislikCh: 50 })
		)
	}

	bedelDegisti(e) {
		if (this._inEventFlag)
			return

		this._inEventFlag = true;
		try {
			const {sender, args} = e;
			const {fis} = sender;
			const gridWidget = args.owner;
			const rowIndex = args.rowindex;
			const belirtec = e.belirtec || args.datafield;
			const deger = args.newvalue;
	
			const {dvKur} = fis;
			switch (belirtec) {
				case 'bedel':
					if (dvKur)
						gridWidget.setcellvalue( rowIndex, 'dvBedel', (deger ? roundToDvBedelFra(deger / dvKur) : 0) );
					break
				case 'dvBedel':
					if (dvKur)
						gridWidget.setcellvalue( rowIndex, 'bedel', (deger ? roundToBedelFra(deger * dvKur) : 0) )
					break
			}
		}
		finally {
			setTimeout(() => delete this._inEventFlag, 10)
		}
	}
}


