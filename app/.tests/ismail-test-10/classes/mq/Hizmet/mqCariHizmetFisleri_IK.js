class IK_MQCariHizmetFisleri extends MQGenelFis {
	static get detaySinif() { return MQCariHizmet_Detay }
	//static get gridKontrolcuSinif() { return MQFisTest1_StokGridKontrolcu }
	static get sinifAdi() { return 'MQ Cari Hizmet Fisleri' }
	static get table() { return 'finansfis' }
	static get tableAlias(){return 'fis'}
	static get kodListeTipi() { return 'FISTEST1' }
	//static get tsnKullanilirmi() { return true }
	static get numTipKod() { return 'TS1' }
	static get numYapi() { return new MQTicNumarator({ tip: this.numTipKod }) }
	
	constructor(e) {
		e = e || {};
		super(e)
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		const {tanimFormBuilder} = e;
	}
	
	static secimlerDuzenle(e){
		//Burası filtreleme ekranı yaptığımız alan.
		super.secimlerDuzenle(e);
		const {secimler} = e;
		secimler.grupTopluEkle([//gruplama yaptığımız kısım.
			{ kod: 'bedel', aciklama: 'Bedel', zeminRenk: '00FFFF', kapali: false }
			//{ kod: 'islemVeDepartman2', aciklama: 'İşlem ve Departman-2', zeminRenk: '#33ccaa', kapali: false }
		]);

		secimler.secimTopluEkle({
			toplamBedel: new SecimString({ etiket: 'Toplam Bedel', grupKod: 'bedel' })
		});

		secimler.whereBlockEkle(e=>{
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
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
			new GridKolon({ belirtec: 'duzyaztext', text: 'Düz. Yaz. Text', genislikCh: 20, sql: `(case when fis.bduzyazdirildi=0 then '' else 'X' end)` }),
			new GridKolon({ belirtec: 'batipi', text: 'BA Tipi', genislikCh: 20, sql: `(case fis.ba when 'B' then 'Gelir' when 'A' then 'Gider' else '' end)`}),
			new GridKolon({ belirtec: 'bfesastext', text: 'Bf Esas Text', genislikCh: 20, sql: `(case when fis.bformunaesastir>'' then 'Esas' else '' end)`}),
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 20  }),
			new GridKolon({ belirtec: 'toplambedel', text: 'Fiş Bedeli', genislikCh: 20  }).tipDecimal(),
			new GridKolon({ belirtec: 'toplamdvbedel', text: 'Dv. Bedeli', genislikCh: 20  }).tipDecimal(),
			new GridKolon({ belirtec: 'muhislkod', text: 'Muh. İşlem', genislikCh: 10  }),
			new GridKolon({ belirtec: 'muhisladi', text: 'Muh. İşlem Adı', genislikCh: 20, sql: 'mfis.aciklama' }),
			new GridKolon({ belirtec: 'mno', text: 'Muh. No', genislikCh: 20, sql: 'mfis.no'  }),
			new GridKolon({ belirtec: 'mfistipi', text: 'Muh. Fiş Tipi', genislikCh: 20, sql: 'mfis.fistipi' }),
			new GridKolon({ belirtec: 'menttutarsiz', text: 'Muh. Ent Tutarsız', genislikCh: 20, sql: 'mfis.enttutarsiz' }),
			new GridKolon({ belirtec: 'muhfistiptext', text: 'Muh. Fis Tip Text', genislikCh: 20, sql: `(case mfis.fistipi when 'H' then 'Th' when 'K' then 'Td' when 'M' then 'Mh' else '' end)` }),
			new GridKolon({ belirtec: 'muhfissayacson', text: 'Muh. Fis. Sayac Son', genislikCh: 20  }),
			new GridKolon({ belirtec: 'mfis2no', text: 'Muh. Fis2. No', genislikCh: 20, sql: `mfis2.no` }),
			/*new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 15, sql: 'agrp.aciklama' })*/
		);
	}

	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.leftJoin({ alias: 'fis', table: `muhfis mfis`, on: `${aliasVeNokta}muhfissayac=mfis.kaysayac` });
		sent.leftJoin({ alias: 'fis', table: `muhfis mfis2`, on: `${aliasVeNokta}muhfissayac=mfis2.kaysayac` });
		sent.fromIliski(`muhisl isl`, `${aliasVeNokta}muhislkod=isl.kod`)
		sent.where.addAll(`fis.fistipi='CH'`)
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

	/*static varsayilanKeyHostVarsDuzenle(e) {
		super.varsayilanKeyHostVarsDuzenle(e);

		const {hv} = e;
		hv.piftipi = 'F';
		hv.almsat = 'T';
		hv.iade = '';
		hv.oncelik = 0;
	}*/

	/*hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e);
		
		const {hv} = e;
		hv.ticmust = hv.must
	}*/

	/*static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		
		const {tsnForm, baslikForm} = e.builders;
		if (this.tsnKullanilirmi) {
			tsnForm.add(
				new FormBuilder({
					id: 'numarator',
					layout: e => {
						const {builder} = e;
						const {parentParent, inst} = builder;
						return parentParent.find(inst.numarator.class.fisGirisLayoutSelector)
					},
					init: e => {
						const {builder} = e;
						const {rootPart, inst, layout, parentParent} = builder;
						const {numarator} = inst;
						$(`<label class="_etiket" style="color: #ccc; min-width: 150px; width: 100%; height: 15px;">Seri-No</label>`).prependTo(layout);
						
						const part = numarator.class.partLayoutDuzenle($.extend({}, e, { islem: rootPart.islem, fis: inst, layout: layout }));
						builder.part = rootPart.numaratorPart = part;
						
						layout.removeClass('jqx-hidden basic-hidden');
						parentParent.addClass('flex-row');
						parentParent.removeClass('jqx-hidden basic-hidden');

						const {txtNoYil} = part;
						if (txtNoYil && txtNoYil.length) {
							if (inst.class.satismi == inst.class.iademi)
								txtNoYil.removeAttr('readonly', null)
							else {
								txtNoYil.attr('readonly', '')
								txtNoYil.addClass('readOnly')
							}
						}
							
					}
				}).addStyle(e =>
					`${e.builder.getCSSElementSelector(e.builder.parent)} { width: 350px !important; }`)
			)
		}
		
		baslikForm.builders[1].add(
			new FBuilder_ModelKullan({ id: 'mustKod', mfSinif: MQCari, etiket: MQCari.sinifAdi, placeHolder: MQCari.sinifAdi }).etiketGosterim_normal()
				.ozelQueryDuzenleBlock(e => {
					const {builder, alias} = e;
					e.stm.sentDo(sent => {
						sent.sahalar.add(`${alias}.efaturakullanirmi`)
					})
				})
				.onChange(e => e.builder.inst.cariDegisti(e))
				.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} { min-width: 70% !important; }`)
		)
	}

	cariDegisti(e) {
	}*/
}


class MQCariHizmet_Detay extends MQDetay {
	static get table() { return 'finanshar' }
	static get tableAlias(){return 'har'}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			
		})
	}
	
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		
		const {liste} = e;
		liste.push(
			//new GridKolon({ belirtec: 'fissayac', text: 'Fissayac', genislikCh: 15 }),
			
			new GridKolon({ belirtec: 'seq', text: 'seq', genislikCh:5}),
			new GridKolon({ belirtec: 'must', text: 'Cari Kod', genislikCh: 15 }),
			new GridKolon({ belirtec: 'unvan1', text: 'Ünvan', genislikCh: 30, sql: 'car.unvan1'}),
			new GridKolon({ belirtec: 'belgetarih', text: 'Belge Tarih', genislikCh: 30}),
			new GridKolon({ belirtec: 'belgeseri', text: 'Belge seri', genislikCh: 15 }),
			new GridKolon({ belirtec: 'belgeno', text: 'Belge No', genislikCh: 15 }),
			new GridKolon({ belirtec: 'hizmetkod', text: 'Hizmet Kod', genislikCh: 10 }),
			new GridKolon({ belirtec: 'hizmetadi', text: 'hizmet Adı', genislikCh: 30, sql: 'hiz.aciklama' }),
			new GridKolon({ belirtec: 'vade', text: 'Vade', genislikCh: 10 }),
			new GridKolon({ belirtec: 'dvbedel', text: 'Dv Bedel', genislikCh: 10 }),
			new GridKolon({ belirtec: 'brutbedel', text: 'Brüt Bedel', genislikCh: 10 }),
			new GridKolon({ belirtec: 'kdv', text: 'KDV', genislikCh: 10 }),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 10 }),
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 10}),
			new GridKolon({ belirtec: 'stopaj', text: 'Stopaj', genislikCh: 10}),
			new GridKolon({ belirtec: 'indirimstr', text: 'İnidirim Str', genislikCh: 10, sql: `(case when har.btersmi=0 then '' else '(-)' end)`}),
			new GridKolon({ belirtec: 'beislemetabidir', text: 'E-İşleme Tabi', genislikCh: 10, slq: `(case when har.beislemetabidir>0 then 'e-' else '' end)`}),
		)
	}

	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent,fissayac} = e;

		sent.leftJoin({ alias: 'har', table: `kategoridetay kdet`, on: `${aliasVeNokta}kdetaysayac=kdet.kaysayac` });
		sent.fromIliski('carmst car', `${aliasVeNokta}must = car.must`);
		sent.fromIliski('hizmst hiz', `${aliasVeNokta}hizmetkod = hiz.kod`)
		//sent.sahalar.addAll(['car.yore']);
		//sent.where.addAll(`${aliasVeNokta}fissayac=${fissayac}`)
	}

	/*setValues(e) {
		super.setValues(e);

		const {rec} = e;
	}*/
}


/*class MQFisTest1_StokGridKontrolcu extends GridKontrolcu {
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e);

		const kaKolonu = MQStok.getGridKolonGrup({
			belirtec: 'stok', kodAttr: 'stokKod', adiAttr: 'stokAdi',
			adiEtiket: 'Stok Adı'
		}).sabitle();
		kaKolonu.stmDuzenleyiciEkle(e => {
			const {stm, aliasVeNokta} = e;
			for (const sent of stm.getSentListe())
				// sent.sahalar.addAll(`100.5 fiyat`, `${aliasVeNokta}brm`)
				sent.sahalar.addAll(`${aliasVeNokta}satfiyat1 fiyat`, `${aliasVeNokta}brm`)
		})
		kaKolonu.degisince(e => {
			const det = e.gridRec;
			if (!det)
				return
			
			if (!det.miktar)
				det.miktar = 1
			det.fiyat = det.bedel = 0;
			
			const {gridWidget, rowIndex} = e;
			e.rec.then(stokRec => {
				const fiyat = det.fiyat = asFloat(stokRec.fiyat || 0);
				const miktar = asFloat(det.miktar) || 0;
				const bedel = roundToBedelFra(miktar * fiyat);
				gridWidget.setcellvalue(rowIndex, 'bedel', bedel)
			})
		})
		
		const {tabloKolonlari} = e;
		tabloKolonlari.push(
			// new GridKolon({ belirtec: 'stokKod', text: 'Stok Kodu', genislikCh: 20 }),
			kaKolonu,
			new GridKolon({
				belirtec: 'miktar', text: 'Miktar', genislikCh: 13,
				cellValueChanged: e => this.miktarFiyatDegisti(e)
			}).tipDecimal(),
			new GridKolon({
				belirtec: 'fiyat', text: 'Fiyat', genislikCh: 15,
				cellValueChanged: e => this.miktarFiyatDegisti(e)
			}).tipDecimal(),
			new GridKolon({
				belirtec: 'bedel', text: 'Bedel', genislikCh: 15
			}).tipDecimal().readOnly()
		)
	}

	miktarFiyatDegisti(e) {
		const {args} = e;
		const gridWidget = args.owner;
		const det = gridWidget.getrowdata(args.rowindex);
		const bedel = roundToBedelFra(
			(asFloat(det.miktar) || 0) * (asFloat(det.fiyat) || 0),
			2);
		gridWidget.setcellvalue(args.rowindex, 'bedel', bedel)
	}
}*/
