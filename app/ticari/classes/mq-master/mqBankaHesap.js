class MQBankaHesap extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Banka Hesap' }
	static get table() { return 'banbizhesap' }
	static get tableAlias() { return 'bhes' }
	static get kodListeTipi() { return 'BANHESAP' }
	static get zeminRenkDesteklermi() { return true }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			tipi: new PInstTekSecim('tipi', HesapTipi),
			dvTipi: new PInstStr('dvtipi'),
			calismaDurumu: new PInstBool('calismadurumu'),
			finanAlizKullanilmaz: new PInstBool('finanalizkullanilmaz'),
			bankaKod: new PInstStr('bankakod'),
			subeKod: new PInstStr('subekod'),
			hesapNo: new PInstStr('hesapno'),
			notlar: new PInstStr('notlar'),
			teminatLimiti: new PInstNum('teminatlimiti'),
			cekKullanilir: new PInstBool('cekkullanilir'),
			muhHesap: new PInstStr('muhhesap'),
			muhbCekHesap: new PInstStr('muhbcekhesap'),
			muhaCekHesap: new PInstStr('muhacekhesap'),
			muhaSenetHesap: new PInstStr('muhasenethesap'),
			muhPosHesap: new PInstStr('muhposhesap'),
			muhPosKomHesap: new PInstStr('muhposkomhesap'),
			muhPosOdemeHesap: new PInstStr('muhposodemehesap')
		})
	}	
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		this.formBuilder_addTabPanelWithGenelTab(e);
		const {tabPanel, tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(3);
		form.addTextInput({id: 'aciklama', etiket: 'Açıklama'}).onAfterRun(e=> e.builder.input.attr('maxlength', 100));
		form.addModelKullan({id: 'tipi', etiket: 'Hesap Tipi', source: e => e.builder.inst.tipi.kaListe}).dropDown().kodsuz();
		form.addModelKullan({id: 'dvTipi', etiket: 'Döviz', mfSinif: MQDoviz}).dropDown().kodsuz();
		form.addCheckBox({ id: 'calismaDurumu', etiket: 'Aktif (Çalışıyor)' });
		form.addCheckBox({ id: 'finanAlizKullanilmaz', etiket: 'Finansal Analizlerde Gösterilir' });
		const tabPage_diger = tabPanel.addTab({id: 'diger', etiket: 'Diğer'});
		form = tabPage_diger.addFormWithParent().yanYana(3);
		form.addModelKullan({id: 'bankaKod', etiket: 'Banka', mfSinif: MQBanka}).dropDown().kodsuz();
		form.addModelKullan({id: 'subeKod', etiket: 'Şube', mfSinif: MQBankaSube}).dropDown().kodsuz()
			.ozelQueryDuzenleBlock(e=> {
				const {builder, aliasVeNokta} = e;
				const {bankaKod} = e.builder.inst;
				for (const sent of e.stm.getSentListe())
					sent.where.degerAta(bankaKod, `${aliasVeNokta}bankakod`)
			});
		form.addTextInput({id: 'hesapNo', etiket: 'HesapNo'});
		form.addTextInput({id: 'notlar', etiket: 'Notlar'});
		form.addNumberInput({id: 'teminatLimiti', etiket: 'Teminat Limiti'})
		form.addCheckBox({ id: 'cekKullanilir', etiket: 'Çek Kesilir' });

		/*========================================================================*/

		/*===================Entegrasyon tabPage ının olduğu kısım================*/
		
		const tabPage_Entegrasyon = tabPanel.addTab({id: 'entegrasyon', etiket: 'Entegrasyon'});
		form = tabPage_Entegrasyon.addFormWithParent().yanYana(1);
		const colDef_muhHesap = MQMuhHesap.getGridKolonGrup({
			belirtec: 'muhHesap', adiEtiket: 'Muh. Hesap',
			kodAttr: 'kod', adiAttr: 'aciklama'
		});
		colDef_muhHesap.degisince(e => {
			const {rowindex, owner} = e.args;
			const rec = owner.getrowdata(rowindex);
			const {ioAttr} = rec || {};
			if (!ioAttr)
				return
			const {altInst} = e.gridPart.builder;
			if (altInst) {
				const value = rec.kod;
				const pInst = (altInst._p || {})[ioAttr];
				if (pInst)
					pInst.value = value
				else
					altInst[ioAttr] = value
			}
		})

		form.addGridliGiris_sabit({
			id: 'muhGrid',
			tabloKolonlari: [
				new GridKolon({ belirtec: 'etiket', text: 'Hesap Tipi', genislikCh: 25 }).readOnly(),
				colDef_muhHesap
			],
			source: async e => {
				const {altInst} = e.builder;
				let recs = [];
				recs = [
					{ ioAttr: 'muhHesap', etiket: 'Mevduat Hesabı(102)' },
					{ ioAttr: 'muhbCekHesap', etiket: 'Borç Çek Hesabı(103)' },
					{ ioAttr: 'muhaCekHesap', etiket: 'Tah/Tem Çek Hesabı(101)' },
					{ ioAttr: 'muhaSenetHesap', etiket: 'Tah/Tem Senet Hesabı(121)' },
					{ ioAttr: 'muhPosHesap', etiket: 'POS Tahsil Hesabı(108)' },
				 	{ ioAttr: 'muhPosKomHesap', etiket: 'POS Komis. Hesabı(780)' },
					{ ioAttr: 'muhPosOdemeHesap', etiket: 'Kredi Kartı Hesabı(309)' },
				];
				const kod2GridRecs = {};
				for (const rec of recs) {
					const {ioAttr} = rec;
					if (ioAttr) {
						const kod = rec.kod = altInst[ioAttr];
						if (kod) {
							(kod2GridRecs[kod] = kod2GridRecs[kod] || [])
								.push(rec)
						}
					}
				}
				if (!$.isEmptyObject(kod2GridRecs)) {
					const kodListe = Object.keys(kod2GridRecs);
					let sent = new MQSent({
						from: 'muhhesap',
						where: { inDizi: kodListe, saha: 'kod' },
						sahalar: ['kod', 'aciklama']
					});
					const _recs = await app.sqlExecSelect(sent);
					for (const _rec of _recs) {
						const gridRecs = kod2GridRecs[_rec.kod] || [];
						for (const gridRec of gridRecs)
							gridRec.aciklama = _rec.aciklama
					}
				}
				return recs
			}
		}).addStyle_fullWH();

		/*========================================================================*/
	}
	static secimlerDuzenle(e){
		//Burası filtreleme ekranı yaptığımız alan.
		super.secimlerDuzenle(e);
		const {secimler} = e;
		secimler.grupTopluEkle([//gruplama yaptığımız kısım.
			{ kod: 'bankaBilgi', aciklama: 'Banka Bilgi', zeminRenk: '#33ccaa', kapali: false },
		]);
		secimler.secimTopluEkle({
			banKod: new SecimString({ etiket: 'Banka Kod', grupKod: 'bankaBilgi' }),
			banAdi: new SecimOzellik({ etiket: 'Banka adı', grupKod: 'bankaBilgi' }),
			ibanNo: new SecimString({ etiket: 'Iban No', grupKod: 'bankaBilgi' }),
			hesapNo: new SecimString({ etiket: 'Hesap No', grupKod: 'bankaBilgi' }),
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
			//where.basiSonu(secimler.mrkKod, `${aliasVeNokta}mrkkod`);
			where.basiSonu(secimler.banKod, `${aliasVeNokta}bankakod`);
			where.ozellik(secimler.banAdi, `ban.aciklama`);
			where.basiSonu(secimler.ibanNo, `${aliasVeNokta}ibanno`);
			where.basiSonu(secimler.hesapNo, `${aliasVeNokta}hesapno`);
			//burada secimler.kasKod kısmındaki kasKod  secimler.secimTopluEkle metodundan gelen kasKod olmasına dikkat et.
		})
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'bankakod', text: 'Banka Kod', genislikCh: 5}),
			new GridKolon({ belirtec: 'calismadurumu', text: 'Çalışma Durumu', genislikCh: 5}),
			new GridKolon({ belirtec: 'hesapno', text: 'Hesap no', genislikCh: 20}),
			new GridKolon({ belirtec: 'ibanno', text: 'Iban No', genislikCh: 20}),
			new GridKolon({ belirtec: 'teminatlimiti', text: 'Teminat Limiti', genislikCh: 10}),
			new GridKolon({ belirtec: 'bankaaciklama', text: 'Banka Adı', genislikCh: 20, sql: 'ban.aciklama'}),
			new GridKolon({ belirtec: 'subekod', text: 'Ban. Şube Kod', genislikCh: 5}),
			new GridKolon({ belirtec: 'subeadi', text: 'Ban. Şube Adı', genislikCh: 20, sql: 'bsub.subeadi'}),
			new GridKolon({ belirtec: 'dvtipi', text: 'Döviz', genislikCh: 5}),
			new GridKolon({ belirtec: 'tipi', text: 'Tipi', genislikCh: 5}),//bağlı olduğu tabloya daha sonra bakılacak.
			new GridKolon({ belirtec: 'cekkullanilir', text: 'Borç Çek Kullanılır', genislikCh: 5}),
			new GridKolon({ belirtec: 'yatirimkullanilir', text: 'Yatırım Kullanılır', genislikCh: 5}),
			new GridKolon({ belirtec: 'poskullanilir', text: 'Pos Tahsil Kullanılır', genislikCh: 5}),
			new GridKolon({ belirtec: 'akreditifkullanilir', text: 'Kredi Kartı Kullanılır', genislikCh: 5}),

			new GridKolon({ belirtec: 'temmektupkullanilir', text: 'Teminat Mektubu Kullanılır', genislikCh: 5}),
			new GridKolon({ belirtec: 'finanalizkullanilmaz', text: 'Finansal Analizlerde', genislikCh: 5}),
			new GridKolon({ belirtec: 'subegecerlilik', text: 'Tüm Şubelerde Geçerli', genislikCh: 5}),
			new GridKolon({ belirtec: 'notlar', text: 'Notlar', genislikCh: 20})
			//new GridKolon({ belirtec: 'bakiye', text: 'Bakiye', genislikCh: 20, sql: 'bak.bakiye'}),
			//new GridKolon({ belirtec: 'dvbakiye', text: 'Dv. Bakiye', genislikCh: 20, sql: 'bak.dvbakiye'}),
			//new GridKolon({ belirtec: 'muhmevduat', text: 'Muh. Mevduat Hesabı', genislikCh: 20, sql: 'muh.kod'})
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.fromIliski(`banmst ban`, `ban.kod = ${aliasVeNokta}bankakod`);
		sent.fromIliski(`bansube bsub`, `${aliasVeNokta}subekod = bsub.subekod`);
		//sent.fromIliski(`mevduathesapbakiye bak`, `${aliasVeNokta}kod = bak.banhesapkod`);
		//sent.fromIliski(`muhhesap muh`, `${aliasVeNokta}muhhesap = muh.kod`);//Burayı yazınca sorguda kısıtlama yapıyor.
	}
	/*========================================================================*/
}
