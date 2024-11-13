class MQKasaVirmanFis extends FinansFis {
	static get detaySinif() { return MQVirman_Detay }
	//static get gridKontrolcuSinif() { return MQFisTest1_StokGridKontrolcu }
	static get sinifAdi() { return 'Kasa/Virman Fisleri' }
	static get table() { return 'geneldekontfis' }
	static get tableAlias(){return 'fis'}
	static get kodListeTipi() { return 'KASAVIRMANFIS' }
	//static get tsnKullanilirmi() { return true }
	static get numTipKod() { return 'TS1' }
	static get numYapi() { return new MQNumarator({ kod: this.numTipKod }) }
	
	constructor(e) {
		e = e || {};
		super(e)
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e
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
			new GridKolon({ belirtec: 'muhfissayac', text: 'Muh. Fis Sayac', genislikCh: 10  }),
			new GridKolon({ belirtec: 'mtarih', text: 'Muh. Fis Tarih', genislikCh: 20, sql: 'mfis.tarih' }),
			new GridKolon({ belirtec: 'mno', text: 'Muh. Fis no', genislikCh: 10, sql: 'mfis.no' }),
			new GridKolon({ belirtec: 'no', text: 'No', genislikCh: 5  }),
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 20  }),
			new GridKolon({ belirtec: 'entttutarsiz', text: 'EntTutarsiz', genislikCh: 20, sql: 'mfis.enttutarsiz'  }),
			new GridKolon({ belirtec: 'muhfistiptext', text: 'Muh. Fis Tip Text', genislikCh: 10, sql: `(case mfis.fistipi when 'H' then 'Th' when 'K' then 'Td' when 'M' then 'Mh' else '' end) ` }),
			
			
			/*new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 15, sql: 'agrp.aciklama' })*/
		);
		//kod açıklama belirteç değişecek.(tamamlandı)
		//deparment kod ve adı kolon olarak ekle.
		//query düzenleye bağla 
		//fiş açıklamasını göster.
	}

	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		//const {tableAlias} = IK_MQMuhFis;
		const {sent} = e;
		//sent.leftJoin({ alias: tableAlias, from: 'muhfis mfis', iliski: `${aliasVeNokta}muhfissayac =  mfis.kaysayac` });

		sent.leftJoin({ alias: 'fis', table: `muhfis mfis`, on: `${aliasVeNokta}muhfissayac=mfis.kaysayac` });
		//sent.leftJoin({from: 'muhfis mfis', iliski: `${aliasVeNokta}muhfissayac = mfis.kaysayac` });
		sent.where.addAll(`fis.ozeltip='K'`)
		
		
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


class MQVirman_Detay extends MQDetay {
	static get table() { return 'geneldekonthar' }
	static get tableAlias(){return 'har1'}
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
			
			new GridKolon({ belirtec: 'seq', text: 'seq', genislikCh:5, sql: 'har1.seq'}),
			new GridKolon({ belirtec: 'borckasakod', text: 'Borç Kasa Kod', genislikCh: 10, sql: 'har2.kasakod' }),
			new GridKolon({ belirtec: 'borckasaadi', text: 'Borç Kasa Adı', genislikCh: 30, sql: 'gkas.aciklama'}),
			new GridKolon({ belirtec: 'alacakkasakod', text: 'Alacak Kasa Kod', genislikCh: 10, sql: 'har1.kasakod'}),
			new GridKolon({ belirtec: 'alacakkasaadi', text: 'alacak Kasa Adı', genislikCh: 30, sql: 'ckas.aciklama'}),
			new GridKolon({ belirtec: 'dvbedel', text: 'Dv. Bedel', genislikCh: 15, sql: 'har1.dvbedel' }),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 15, sql: 'har1.bedel' }),
			
			//new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 10}),
		)
	}

	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent,fissayac} = e;
		sent.fromIliski('kasmst ckas', `${aliasVeNokta}kasakod = ckas.kod`);
		sent.fromIliski(`geneldekonthar har2, kasmst gkas`, `har2.kasakod = gkas.kod`);
		sent.where.addAll(`${aliasVeNokta}fissayac=har2.fissayac`);
		sent.where.addAll(`(har1.seq/2*2) <> ${aliasVeNokta}seq`);
		sent.where.addAll(`(${aliasVeNokta}seq+1)=har2.seq`);

		//sent.leftJoin({ alias: 'fis', table: `muhfis mfis`, on: `${aliasVeNokta}muhfissayac=mfis.kaysayac` });
		
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
