class MQHizmet extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Hizmet' } static get table() { return 'hizmst' } static get tableAlias() { return 'hiz' }
	static get kodListeTipi() { return 'HIZMET' } static get hizmetmi() { return true } static get zeminRenkDesteklermi() { return true }

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			aciklama2: new PInstStr('aciklama2'),
			tip: new PInstTekSecim('tip', HizmetTipi),
			grupKod: new PInstStr('grupkod'),
			hIstGrupKod: new PInstStr('histgrupkod'),
			dvKod: new PInstStr('dvkod'),
			birimFiyat: new PInstNum('birimfiyat'),
			dvFiyat: new PInstNum('dvfiyat'),
			rayicAlimFiyati: new PInstNum('rayicalimfiyati'),
			birim:new PInstStr('brm'),
			calismaDurumu:new PInstStr('calismadurumu'),
			gidKdvHesapKod: new PInstStr('gidkdvhesapkod'),
			giderStopajHesapKod: new PInstStr('gidstopajhesapkod'),
			gidEkVergi1HesapKod: new PInstStr('gidekvergi1hesapkod'),
			gidEkVergi2HesapKod: new PInstStr('gidekvergi2hesapkod'),
			gidKdvTevkifatKesapKod: new PInstStr('gidkdvtevkifathesapkod'),
			gidKonaklamaHesapKod: new PInstStr('gidkonaklamahesapkod'),
			gidKdvDegiskenmi: new PInstStr('gidkdvdegiskenmi'),
			gelKdvHesapKod: new PInstStr('gelkdvhesapkod'),
			gelStopajHesapKod: new PInstStr('gelstopajhesapkod'),
			gelEkVergi1HesapKod: new PInstStr('gelekvergi1hesapkod'),
			gelEkVergi2HesapKod: new PInstStr('gelekvergi2hesapkod'),
			gelKdvTevkifatHesapKod: new PInstStr('gelkdvtevkifathesapkod'),
			gelKonaklamaHesapKod: new PInstStr('gelkonaklamahesapkod'),
			gelKdvDegiskenmi: new PInstStr('gelkdvdegiskenmi'),
			kkEgTipi: new PInstTekSecim('kkegtipi', KkegTipi),
			bFormunaEsastir: new PInstBool('bformunaesastir'),
			bIndirimmi: new PInstBitBool('bindirimmi'),
			depKullanilir: new PInstBool('depkullanilir'),
			bKzTabloAlinmazmi: new PInstBitBool('bkztabloalinmazmi'),
			gelirTabloTipi: new PInstTekSecim('gelirtablotipi', HizGelirTabloTipi),
			muhHesap: new PInstStr('muhhesap'),
			kategoriKod: new PInstStr('kategorikod')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		this.formBuilder_addTabPanelWithGenelTab(e);
		const {tabPanel, tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(4);
		form.addTextInput({ id: 'aciklama2',	etiket: 'Açıklama-2'}).onAfterRun(e => e.builder.input.attr('maxlength', 100));
		form.addModelKullan({ id: 'grupKod', etiket: 'Grup',	mfSinif: MQHizmetGrup }).dropDown().kodsuz();
		form.addModelKullan({ id: 'hIstGrupKod', etiket: 'İstatistik Grup', mfSinif: MQHizmetIstatistikGrup }).dropDown().kodsuz();
		form.addCheckBox({ id: 'calismaDurumu', etiket: 'Aktif Durumda' });
		form.addModelKullan({ id: 'dvKod', etiket: 'Döviz',	mfSinif: MQDoviz }).dropDown().kodsuz();
		form.addNumberInput({ id: 'birimFiyat',	etiket: 'Fiyat'});
		form.addNumberInput({ id: 'dvFiyat',	etiket: 'Döviz Fiyat'});
		form.addNumberInput({ id: 'rayicAlimFiyati', etiket: 'Rayiç Teklif Fiyat'});
		form.addModelKullan({ id: 'birim', etiket: 'Birim',	source: app.params.stokBirim.brmColl })
			.dropDown().kodsuz().addStyle(e => `$elementCSS { max-width: 100px; }`);
		form = tabPage_genel.addFormWithParent().yanYana(1);
		form.addRadioButton({ id: 'tip', etiket: 'Tip  :', source: HizmetTipi.instance.kaListe})
			.onChange(e => {
				const {builder} = e;
				const {rootPart} = builder;
				const tabPanel_gelirGider = rootPart.fbd_tabPanel_gelirGider.part;
				const {id2TabPage} = tabPanel_gelirGider;
				const value = (e.value || '').trim();
				builder.input.attr('data-tip', value);
				tabPanel_gelirGider.divTabs.children('li').removeClass('jqx-hidden basic-hidden');
				switch (value) {
					case '':
						id2TabPage.gider.layout.addClass('jqx-hidden');
						tabPanel_gelirGider.activePageId = 'gelir';
						break
					case 'G':
						id2TabPage.gelir.layout.addClass('jqx-hidden');
						tabPanel_gelirGider.activePageId = 'gider';
						break
				}
				tabPanel_gelirGider.render();
				tabPanel_gelirGider.divTabs.children('li:not(.jqx-hidden):not(.basic-hidden):eq(0)').click()
			})
			.onAfterRun(e => {
				const {builder} = e;
				const {rootPart} = builder;
				rootPart.fbd_tip = builder
			});
		
		const tabPanel_gelirGider = tabPage_genel.addTabPanel({ id: 'gelirGiderTabs' })
			.addStyle_wh({ height: 'max-content !important' })
			.onAfterRun(e => {
				const {builder} = e;
				const {rootPart} = builder;
				rootPart.fbd_tabPanel_gelirGider = builder;
				const {fbd_tip} = rootPart;
				fbd_tip.signalChange({ builder: fbd_tip, value: fbd_tip.altInst.tip.char })
			});
		const tabPage_gelirFiyat = tabPanel_gelirGider.addTab({ id: 'gelir', etiket: 'Gelir' });
		form = tabPage_gelirFiyat.addFormWithParent().yanYana(3);
		form.addModelKullan({ id: 'gelKdvHesapKod',  etiket: 'KDV', mfSinif: MQVergi })
			.dropDown().kodsuz().ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e;
				for (const sent of stm.getSentListe()) {
					const wh = sent.where;
					wh.add(
						`${aliasVeNokta}ba = 'A'`,
						`${aliasVeNokta}vergitipi = 'KDV'`
					);
					wh.inDizi(['', 'ML'], `${aliasVeNokta}alttip`)
				}
			});
		form.addModelKullan({ id: 'gelStopajHesapKod', etiket: 'Stopaj', mfSinif: MQVergi })
			.dropDown().kodsuz().ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e;
				for (const sent of stm.getSentListe()) {
					sent.where.add(
						`${aliasVeNokta}ba = 'B'`,
						`${aliasVeNokta}vergitipi = 'STO'`
					)
				}
			});
		form.addModelKullan({ id: 'gelEkVergi1HesapKod', etiket: 'Ek Vergi', mfSinif: MQVergi })
			.dropDown().kodsuz().ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e;
				for (const sent of stm.getSentListe()) {
					sent.where.add(
						`${aliasVeNokta}ba = 'A'`,
						`${aliasVeNokta}vergitipi = 'EKVER'`
					)
				}
			});
		form.addModelKullan({ id: 'gelEkVergi2HesapKod', etiket: 'Ek Vergi-2', mfSinif: MQVergi })
			.dropDown().kodsuz().ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e;
				for (const sent of stm.getSentListe()) {
					sent.where.add(
						`${aliasVeNokta}ba = 'A'`,
						`${aliasVeNokta}vergitipi = 'EKVER'`
					)
				}
			});
		form.addModelKullan({ id: 'gelKdvTevkifatHesapKod', etiket: 'KDV Tevfikatı', mfSinif: MQVergi })
			.dropDown().kodsuz().ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e;
				for (const sent of stm.getSentListe()) {
					sent.where.add(
						`${aliasVeNokta}ba = 'B'`,
						`${aliasVeNokta}vergitipi = 'KTEV'`
					)
				}
			});
		form.addModelKullan({ id: 'gelKonaklamaHesapKod', etiket: 'Konaklama Vergisi', mfSinif: MQVergi })
			.dropDown().kodsuz().ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e;
				for (const sent of stm.getSentListe()) {
					sent.where.add(
						`${aliasVeNokta}ba = 'A'`,
						`${aliasVeNokta}vergitipi = 'KON'`
					)
				}
			});
		form.addCheckBox({ id: 'gelKdvDegiskenmi', etiket: 'Değişken KDV' });
		
		const tabPage_giderFiyat = tabPanel_gelirGider.addTab({ id: 'gider', etiket: 'Gider' });
		form = tabPage_giderFiyat.addFormWithParent().yanYana(3);
		form.addModelKullan({ id: 'gidKdvHesapKod', etiket: 'KDV', mfSinif: MQVergi })
			.dropDown().kodsuz().ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e;
				for (const sent of stm.getSentListe()) {
					sent.where.add(
						`${aliasVeNokta}ba = 'B'`,
						`${aliasVeNokta}vergitipi='KDV'`,
						`${aliasVeNokta}alttip=''`
					)
				}
			});
		form.addModelKullan({ id: 'giderStopajHesapKod',  etiket: 'Stopaj', mfSinif: MQVergi })
			.dropDown().kodsuz().ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e;
				for (const sent of stm.getSentListe()) {
					sent.where.add(
						`${aliasVeNokta}ba = 'A'`,
						`${aliasVeNokta}vergitipi = 'STO'`
					)
				}
			});
		form.addModelKullan({ id: 'gidEkVergi1HesapKod', etiket: 'Ek Vergi', mfSinif: MQVergi })
			.dropDown().kodsuz().ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e;
				for (const sent of stm.getSentListe()) {
					sent.where.add(
						`${aliasVeNokta}ba = 'B'`,
						`${aliasVeNokta}vergitipi = 'EKVER'`
					)
				}
			});
		form.addModelKullan({ id: 'gidEkVergi2HesapKod', etiket: 'Ek Vergi-2', mfSinif: MQVergi })
			.dropDown().kodsuz().ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e;
				for (const sent of stm.getSentListe()) {
					sent.where.add(
						`${aliasVeNokta}ba = 'B'`,
						`${aliasVeNokta}vergitipi = 'EKVER'`
					)
				}
			});
		form.addModelKullan({ id: 'gidKdvTevkifatKesapKod', etiket: 'KDV Tevfikatı', mfSinif: MQVergi })
			.dropDown().kodsuz().ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e;
				for (const sent of stm.getSentListe()) {
					sent.where.add(
						`${aliasVeNokta}ba = 'A'`,
						`${aliasVeNokta}vergitipi = 'KTEV'`
					)
				}
			});
		form.addModelKullan({ id: 'gidKonaklamaHesapKod', etiket: 'Konaklama Vergisi', mfSinif: MQVergi })
			.dropDown().kodsuz().ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta, stm} = e;
				for (const sent of stm.getSentListe()) {
					sent.where.add(
						`${aliasVeNokta}ba = 'B'`,
						`${aliasVeNokta}vergitipi = 'KON'`
					)
				}
			});
		form.addCheckBox({ id: 'gidKdvDegiskenmi', etiket: 'Değişken KDV' });
		
		const tabPage_diger = tabPanel.addTab({ id: 'diger',etiket: 'Diğer'});
		form = tabPage_diger.addFormWithParent().yanYana(4);
		form.addModelKullan({ id: 'kkEgTipi', etiket: 'KKEG Tipi', source: e => e.builder.inst.kkEgTipi.kaListe}).dropDown().kodsuz();
		form.addModelKullan({ id: 'gelirTabloTipi', etiket: 'Dekont Fişinde İse', source: e => e.builder.inst.gelirTabloTipi.kaListe})
			.dropDown().kodsuz();
		
		form = tabPage_diger.addFormWithParent().yanYana(4);
		form.addCheckBox({ id: 'bFormunaEsastir', etiket: 'B Formuna Esastır' });
		form.addCheckBox({ id: 'bIndirimmi', etiket: 'İndirim İçindir' });
		form.addCheckBox({ id: 'depKullanilir', etiket: 'Masraf Fişlerinde Departman Kullanılır' });
		form.addCheckBox({ id: 'bKzTabloAlinmazmi', etiket: 'Kar/Zarar Tablosuna Alınmaz' });

		form.addLabel({ id: 'uyari', etiket: `Hizmet Kar/Zarar tablosuna Gelir/Gider tipine göre alınır.(Tahakkun tipindekiler yapılan işleme göre alınır.)`, renk: 'cadetblue' });
		form = tabPage_diger.addFormWithParent().yanYana(2);
		form.addModelKullan({ id: 'muhHesap', etiket: 'Muhasebe Kodu', mfSinif: MQMuhHesap }).dropDown().kodsuz()
		form.addModelKullan({ id: 'kategoriKod', etiket: 'Kategori', mfSinif: MQKategori }).dropDown().kodsuz()
		tabPage_diger.addBaslik({ etiket: 'Hizmet Tedarikçiler' })
	}
	/*========================================================================*/

	/*====================Filtre Ekranı Yaptığımız Kısım======================*/
	static secimlerDuzenle(e){
		//Burası filtreleme ekranı yaptığımız alan.
		super.secimlerDuzenle(e);
		const {secimler} = e;
		secimler.grupTopluEkle([//gruplama yaptığımız kısım.
			{ kod: 'grupVeKategori', aciklama: 'Grup Ve Kategoriye Göre', zeminRenk: '#33ccaa', kapali: false },
			{ kod: 'fiyat', aciklama: 'Tarihe Göre', zeminRenk: '#33ccaa', kapali: false },
		]);

		secimler.secimTopluEkle({
			hizGrup: new SecimString({ etiket: 'Hizmet Grup', grupKod: 'grupVeKategori' }),
			hizKategori: new SecimString({etiket: 'Hizmet Kategori', grupKod: 'grupVeKategori'}),
			hizFiyat: new SecimString({etiket: 'Birim Fiyat', grupKod: 'fiyat'})
		});

		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
			where.basiSonu(secimler.hizGrup, `${aliasVeNokta}grupkod`);
			where.basiSonu(secimler.hizKategori, `${aliasVeNokta}kategorikod`);
			where.basiSonu(secimler.hizFiyat, `${aliasVeNokta}birimfiyat`);
			//where.basiSonu(secimler.toplamBedel, `${aliasVeNokta}toplambedel`);
			//burada secimler.kasKod kısmındaki kasKod  secimler.secimTopluEkle metodundan gelen kasKod olmasına dikkat et.
		})
	}
	/*========================================================================*/

	/*===================Listeleme Ekranı Yaptığımız Kısım====================*/
	
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		const {aliasVeNokta} = this;
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'aciklama2', text: 'Açıklama-2', genislikCh: 20}),
			new GridKolon({ belirtec: 'grupkod', text: 'Grup Kod', genislikCh: 5}),
			new GridKolon({ belirtec: 'grupadi', text: 'Grup Adı', genislikCh: 20, sql: 'hizgrp.aciklama'}),
			new GridKolon({
				belirtec: 'tiptext', text: 'Tip', genislikCh:  10, sql: HizmetTipi.getClause(`${aliasVeNokta}tip`),
				// cellsRenderer: (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
				cellClassName: (sender, rowIndex, belirtec, value, rec, prefix) => {
					let result = (prefix ? `${prefix} ` : '') + belirtec;
					const {tip} = rec;
					let ekCSS = (
						!tip ? 'bg-lightgreen' :
						tip == 'G' ? 'bg-orangered white' :
						tip == 'T' ? 'bg-lightcyan' :
						null
					)
					if (ekCSS)
						result += ` ${ekCSS}`
					return result
				}
			}),
			new GridKolon({ belirtec: 'birimfiyat', text: 'Birim Fiyat', genislikCh: 10}).tipDecimal_fiyat(),
			new GridKolon({ belirtec: 'dvfiyat', text: 'Dv Fiyat', genislikCh: 10}).tipDecimal_dvFiyat(),
			new GridKolon({ belirtec: 'histgrupkod', text: 'İst. Grup Kod', genislikCh: 5}),
			new GridKolon({ belirtec: 'histgrupadi', text: 'İst. Grup Adı', genislikCh: 20, sql: 'hizigrp.aciklama'}),
			new GridKolon({ belirtec: 'kategorikod', text: 'Kategori kod', genislikCh: 5}),
			new GridKolon({ belirtec: 'kategoriadi', text: 'Kategori Adı', genislikCh: 20, sql: 'kat.aciklama'}),
			new GridKolon({ belirtec: 'brm', text: 'Birim', genislikCh: 5}),
			new GridKolon({ belirtec: 'dvkod', text: 'Döviz', genislikCh: 5}),
			new GridKolon({ belirtec: 'gelkdvdegiskenmi', text: 'Gelir KDV Değişken mi?', genislikCh: 5}),
			new GridKolon({ belirtec: 'gelkdvhesapkod', text: 'Gelir KDV Hesap ', genislikCh: 5}),
			new GridKolon({ belirtec: 'gelkdvtevkifathesapkod', text: 'Gelir KDV Tevfikat Hesap ', genislikCh: 5}),
			new GridKolon({ belirtec: 'gelstopajhesapkod', text: 'Gelir Stopaj Hesap ', genislikCh: 5}),
			new GridKolon({ belirtec: 'gelkonaklamahesapkod', text: 'Gelir Konaklama Hesap ', genislikCh: 5}),
			new GridKolon({ belirtec: 'gidkdvdegiskenmi', text: 'Gider KDV Değişken mi? ', genislikCh: 5}),
			new GridKolon({ belirtec: 'gidkdvhesapkod', text: 'Gider KDV Hesap', genislikCh: 5}),
			new GridKolon({ belirtec: 'gidkdvtevkifathesapkod', text: 'Gider KDV Tevfikat Hesap ', genislikCh: 5}),
			new GridKolon({ belirtec: 'gidstopajhesapkod', text: 'Gider Stopaj Hesap', genislikCh: 5}),
			new GridKolon({ belirtec: 'gidkonaklamahesapkod', text: 'Gider Konaklama Hesap', genislikCh: 5}),
			new GridKolon({ belirtec: 'bformunaesastir', text: 'B Formuna Esas', genislikCh: 5}),
			new GridKolon({ belirtec: 'depkullanilir', text: 'Dep. Kullanım', genislikCh: 5}),
			new GridKolon({ belirtec: 'adidegisir', text: 'Adı Değişir', genislikCh: 5}),
			new GridKolon({ belirtec: 'kkegtipi', text: 'KKEG Tipi', genislikCh: 5}),
			new GridKolon({ belirtec: 'bkztabloalinmazmi', text: 'Kar/Zarar Tablo Alınmaz', genislikCh: 5}),
			new GridKolon({ belirtec: 'kdvmuafnedenkod', text: 'Kdv Muaf Neden Kod', genislikCh: 5}),
			new GridKolon({ belirtec: 'muhhesap', text: 'Muh. Hesap Kod', genislikCh: 5}),
			//new GridKolon({ belirtec: 'muhhesapadi', text: 'Muh. Hesap Adı', genislikCh: 20, sql: 'muh.aciklama'}),
			new GridKolon({ belirtec: 'muhhesapkkeg', text: 'Muhkkeg Hesap Kod', genislikCh: 5})
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.fromIliski(`hizgrup hizgrp`, `${aliasVeNokta}grupkod = hizgrp.kod`);
		sent.fromIliski(`hizistgrup hizigrp`, `${aliasVeNokta}histgrupkod = hizigrp.kod`);
		sent.fromIliski(`kategori kat`, `${aliasVeNokta}kategorikod = kat.kod`);
		sent.sahalar.add(`${aliasVeNokta}tip`);
	}
	static getGridKolonGrup_kategorili(e) {
		let kolonGrup = this.getGridKolonGrup(e);
		if (!kolonGrup)
			return kolonGrup
		e.kolonGrup = kolonGrup;
		MQKategori.mqHizmetKolonGrupDuzenle(e);
		return e.kolonGrup
	}
}
