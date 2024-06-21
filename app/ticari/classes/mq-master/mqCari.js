class MQCari extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Cari Hesap' } static get table() { return 'carmst' } static get tableAlias() { return 'car' }
	static get kodSaha() { return 'must' } static get adiSaha() { return 'birunvan' } static get adiEtiket() { return 'Ünvan' }
	static get kodListeTipi() { return 'CAR' } static get ayrimTipKod() { return 'CRAYR' } static get ayrimTableAlias() { return 'cayr' }
	static get ozelSahaTipKod() { return 'CAR' } static get zeminRenkDesteklermi() { return true } static get kayitTipi() { return '' }
	get sahismi() { return this.vergi.sahismi } set sahismi(value) { return this.vergi.sahismi = value }
	get vkn() { return this.vergi.vkn } set vkn(value) { this.vergi.vkn = value }

	static altYapiDictDuzenle(e) {
		super.altYapiDictDuzenle(e); const {liste} = e;
		$.extend(liste, {
			genel: MQCari_Genel, vergi: MQCari_Vergi, iletisim: MQCari_Iletisim,
			finans: MQCari_Finans, ticari: MQCari_Ticari, eIslem: MQCari_EIslem
		})
	}
	static formBuildersDuzenle_ka(e) {
		super.formBuildersDuzenle_ka(e); const {kaForm} = e, builder_aciklama = kaForm.id2Builder.aciklama;
		if (builder_aciklama) builder_aciklama.setVisibleKosulu(false)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta} = this, {sent} = e;
		sent.fromIliski(`efozelyontem efoy`, `${aliasVeNokta}efozelyontemkod = efoy.kod`);
		sent.fromIliski(`eislemozeldip eiod`, `${aliasVeNokta}eislozeldipkod = eiod.kod`)
	}
	static varsayilanKeyHostVarsDuzenle(e) {
		super.varsayilanKeyHostVarsDuzenle(e); const {hv} = e;
		hv.kayittipi = this.kayitTipi
	}
	static getGridKolonGrup(e) {
		e = e || {}; const {belirtec} = e;
		if (!e.adiAttr) e.adiAttr = `${belirtec}Unvan`
		return super.getGridKolonGrup(e)
	}
	static getGridKolonGrup_yoreli(e) {
		const kolonGrup = this.getGridKolonGrup(e); if (!kolonGrup) return kolonGrup
		const {tabloKolonlari} = kolonGrup;
		tabloKolonlari.push(new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 10 }).readOnly());
		kolonGrup.stmDuzenleyiciEkle(e => {
			const {aliasVeNokta} = this;
			for (const sent of e.stm.getSentListe()) { sent.sahalar.add(`${aliasVeNokta}yore`) }
		});
		kolonGrup.degisince(async e => {
			const rec = await e.rec;
			if (rec)
				e.setCellValue({ belirtec: 'yore', value: rec.yore || '' })
		});
		return kolonGrup
	}
	alimEIslIcinSetValues(e) {
		const {rec} = e, eFis = e.eFis || {}, efAyrimTipi = (eFis.eIslTip ?? rec.efayrimtipi) || 'A', vkn = eFis.gondericiVKN || rec.vkno; /* {xml} = eFis; */
		const adresYapi = eFis?.aliciAdresYapi, iletisimYapi = eFis?.aliciIletisimYapi;
		let value = eFis?.aliciUnvan || rec.efmustunvan; const unvanParts = (value ? uygunKelimeliParcala(value.trim(), 40, true) : null) ?? [];
		value = adresYapi?.adres; const adresParts = (value ? uygunKelimeliParcala(value.trim(), 40, true) : null) ?? [];
		const ilAdi = adresYapi?.ilAdi, {genel, iletisim} = this;
		if (ilAdi) {
			(async () => {
				const adi2KodListe = (await MQCariIl.getGloAdi2KodListe()) || {};
				const kod = (adi2KodListe[ilAdi] || [])[0]; if (kod) { genel.ilKod = kod }
			})()
		}
		$.extend(this, { kod: this.kod || vkn, vkn, eFaturaKullanirmi: efAyrimTipi != 'A' });
		$.extend(genel, {
			unvan1: unvanParts[0] || '', unvan2: unvanParts[1] || '', adres1: adresParts[0] || '', adres2: adresParts[1] || '',
			yore: adresYapi?.yore || '', posta: adresYapi?.posta
		});
		$.extend(iletisim, { tel1: iletisimYapi?.tel || '', fax: iletisimYapi?.faks, eMail: iletisimYapi?.eMail });
		this.forAltYapiKeysDo('alimEIslIcinSetValues', e); return this
	}
}
class MQCariAlt extends MQAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	alimEIslIcinSetValues(e) { return this }
}
class MQCari_Genel extends MQCariAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			unvan1: new PInstStr('unvan1'), unvan2: new PInstStr('unvan2'),
			adres1: new PInstStr('adres1'), adres2: new PInstStr('adres2'), adresKod: new PInstNum('adreskod'),
			yore: new PInstStr('yore'), posta: new PInstNum('posta'), ulkeKod: new PInstStr('ulkekod'), ilKod: new PInstStr('ilkod'),
			bolgeKod: new PInstStr('bolgekod'), tipKod: new PInstStr('tipkod'), istGrupKod: new PInstStr('cistgrupkod'),
			calismaDurumu: new PInstTrue('calismadurumu'), potansiyel: new PInstBool('potansiyel')
		})
	}
	static ekCSSDuzenle(e) {
		const {rec, result} = e;
		if (!asBool(rec.calismadurumu))
			result.push('bg-lightgray', 'iptal')
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; const {mfSinif} = this; mfSinif.formBuilder_addTabPanelWithGenelTab(e); const tabPage_genel = e.tabPage_genel;
		tabPage_genel.addStyle(e => `$elementCSS .baslik { color: cadetblue }`);
		tabPage_genel.addBaslik({ etiket: 'Ünvan Ve Adres' });
		
		let form = tabPage_genel.addFormWithParent().yanYana(2);
		tabPage_genel.setAltInst(e => e.builder.inst.genel);
		
		form.addTextInput({ id: 'unvan1', etiket: 'Ünvan-1', maxLength: 50 });
		form.addTextInput({ id: 'unvan2', etiket: 'Ünvan-2', maxLength: 50 });
		form = tabPage_genel.addFormWithParent().yanYana(2);
		form.addTextInput({ id: 'adres1', etiket: 'Adres-1', maxLength: 50 }).addStyle(e => `$elementCSS { max-width: 850px }`);
		form.addTextInput({ id: 'adres2', etiket: 'Adres-2', maxLength: 50 }).addStyle(e => `$elementCSS { max-width: 850px }`);
		
		form = tabPage_genel.addFormWithParent().yanYana(5);
		form.addTextInput({ id: 'adresKod', etiket: 'Adres Kodu', maxLength: 10 }).addStyle(e => `$elementCSS { max-width: 150px }`);
		form.addTextInput({ id: 'yore', etiket: 'Yöre', maxLength: 30 });
		form.addTextInput({ id: 'posta', etiket: 'Posta', maxLength: 10 }).addStyle(e => `$elementCSS { max-width: 100px }`);
		form.addModelKullan({ id: 'ulkeKod', mfSinif: MQUlke }).etiketGosterim_normal().dropDown();
		form.addModelKullan({ id: 'ilKod', mfSinif: MQCariIl }).etiketGosterim_normal().dropDown();

		tabPage_genel.addBaslik({ etiket: 'Diğer' }).addStyle(e => `$elementCSS { color: orangered }`);
		form = tabPage_genel.addFormWithParent().yanYana(4);
		//form.addForm(null, e => $(`<h2>Cari Genel</h2>`));
		form.addModelKullan({ id: 'bolgeKod', mfSinif: MQCariBolge }).etiketGosterim_normal().dropDown();
		form.addModelKullan({ id: 'tipKod', mfSinif: MQCariTip }).etiketGosterim_normal().dropDown();
		form.addModelKullan({ id: 'istGrupKod', mfSinif: MQCariIstGrup }).etiketGosterim_normal().dropDown();
		form.addCheckBox({ id: 'calismaDurumu', etiket: 'Çalışma Durumu' });
		form.addCheckBox({ id: 'potansiyel', etiket: 'Potansiyeldir' })
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.grupTopluEkle([
			{ kod: 'unvanveadres', aciklama: 'Ünvan Ve Adres', renk: '#555', zeminRenk: 'lightgreen', kapali: false },
			{ kod: 'diger', aciklama: 'Diğer', renk: '#555', kapali: false }
		]);
		sec.secimTopluEkle({
			calismaDurumu: new SecimTekSecim({ etiket: 'Çalışma Durumu', tekSecimSinif: CalismaDurumu }),
			adresKod: new SecimString({etiket: 'Adres Kod' , grupKod: 'unvanveadres' }),
			posta: new SecimString({etiket: 'Posta' , grupKod: 'unvanveadres' }),
			ulkeKod: new SecimString({etiket: 'Ülke Kod', mfSinif: MQUlke,  grupKod: 'unvanveadres' }),
			ulkeAdi: new SecimOzellik({etiket: 'Ülke Adı', grupKod: 'unvanveadres' }),
			ilKod: new SecimString({etiket: 'İl Kod', mfSinif: MQCariIl, grupKod: 'unvanveadres' }),
			ilAdi: new SecimOzellik({etiket: 'İl Adı', grupKod: 'unvanveadres' }),
			
			istCariKod: new SecimString({ mfSinif: MQCariIstGrup, grupKod: 'diger' }),
			istCariAdi: new SecimOzellik({ etiket: 'Cari İst. Grup Adı', grupKod: 'diger' }),
			cariBolgeKod: new SecimString({ mfSinif: MQCariBolge, grupKod: 'diger' })
		});
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this.mfSinif;
			const wh = e.where, sec = e.secimler;
			wh.birlestir(sec.calismaDurumu.tekSecim.getBoolClause(`${aliasVeNokta}calismadurumu`));
			wh.basiSonu(sec.adresKod, `${aliasVeNokta}adreskod`);
			wh.basiSonu(sec.posta, `${aliasVeNokta}posta`);
			wh.basiSonu(sec.ulkeKod, `${aliasVeNokta}ulkekod`)
			wh.ozellik(sec.ulkeAdi, `${aliasVeNokta}ulkeadi`)
			wh.basiSonu(sec.ilKod, `${aliasVeNokta}ilkod`)
			wh.ozellik(sec.ilAdi, `${aliasVeNokta}iladi`)
			wh.basiSonu(sec.istCariKod, `${aliasVeNokta}cistgrupkod`);
			wh.ozellik(sec.istCariAdi, `ist.aciklama`);
			wh.basiSonu(sec.cariBolgeKod, `${aliasVeNokta}bolgekod`)
		})
	}
	static orjBaslikListesiDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif;
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'unvan1',text: 'Ünvan-1', genislikCh: 15 }),
			new GridKolon({ belirtec: 'unvan2',text: 'Ünvan-2', genislikCh: 15 }),
			new GridKolon({ belirtec: 'adres1', text: 'Adres-1', genislikCh: 15 }),
			new GridKolon({ belirtec: 'adres2', text: 'Adres-2', genislikCh: 15 }), 
			new GridKolon({ belirtec: 'adreskod', text: 'Adres Kod', genislikCh: 10 }),
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 20 }),
			new GridKolon({ belirtec: 'posta', text: 'Posta', genislikCh: 6 }),
			new GridKolon({ belirtec: 'ulkekod', text: 'Ülke Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'ulkeadi', text: 'Ülke Adı', genislikCh: 15, sql: 'ulk.aciklama' }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8 }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 15, sql: 'il.aciklama' }),
			new GridKolon({ belirtec: 'istadi', text: 'İstatistik Adı', genislikCh: 15, sql: 'ist.aciklama' }),
			new GridKolon({ belirtec: 'kayittipi', text: 'Kayıt Tipi', genislikCh: 6 }),
			new GridKolon({ belirtec: 'bolgekod', text: 'Bölge Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'bolgeadi', text: 'Bölge Adı', genislikCh: 15, sql: 'carb.aciklama' }),
			new GridKolon({ belirtec: 'anabolgeadi', text: 'Ana Bölge Adı', genislikCh: 15, sql: 'carana.aciklama' }),
			new GridKolon({ belirtec: 'tipkod', text: 'Tip Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'tipadi', text: 'Cari Tip Adi', genislikCh: 15, sql: 'ctip.aciklama' }),
			new GridKolon({ belirtec: 'cistgrupkod', text: 'İstatistik Grup', genislikCh: 5 }),
			new GridKolon({ belirtec: 'potansiyel', text: 'Potansiyelmi', genislikCh: 5 })
		);
	}
	static loadServerData_queryDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif;
		const {sent} = e;
		sent.fromIliski('caril il', `${aliasVeNokta}ilkod = il.kod`);
		sent.fromIliski(`ulke ulk `, `${aliasVeNokta}ulkekod = ulk.kod`);
		sent.fromIliski(`carbolge carb`, `${aliasVeNokta}bolgekod = carb.kod`);
		sent.fromIliski(`caranabolge carana`, `carb.anabolgekod = carana.kod`);
		sent.fromIliski(`cartip ctip`, `${aliasVeNokta}tipkod = ctip.kod`);
		sent.fromIliski(`caristgrup ist`, `${aliasVeNokta}cistgrupkod = ist.kod`);
		sent.sahalar.add(`${aliasVeNokta}calismadurumu`)
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e);
		const {hv} = e;
		delete hv[this.inst.class.adiSaha]
	}
}
class MQCari_Iletisim extends MQCariAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			tel1: new PInstStr('tel1'), tel2: new PInstStr('tel2'), tel3: new PInstStr('tel3'), fax: new PInstStr('fax'),
			webAdres: new PInstStr('webadresi'), eArsiv: new PInstStr('emailearsiv'), eMail: new PInstStr('email')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; const {mfSinif} = this, {tabPanel} = e, tabPage = tabPanel.addTab({ id: 'iletisim', etiket: 'İletişim' });
		tabPage.setAltInst(e => e.builder.inst.iletisim);
		let form = tabPage.addFormWithParent().yanYana(4)/*.addStyle(e=>`$elementCSS {box-shadow:5px 5px 20px cadetblue}`)*/;
		form.addTextInput({ id: 'tel1', etiket: 'Tel-1', maxLength: 13 }).addStyle(e => `$elementCSS { max-width: 150px }`);
		form.addTextInput({ id: 'tel2', etiket: 'Tel-2', maxLength: 13}).addStyle(e => `$elementCSS { max-width: 150px }`);
		form.addTextInput({ id: 'tel3', etiket: 'Tel-3', maxLength: 13}).addStyle(e => `$elementCSS { max-width: 150px }`);
		form.addTextInput({ id: 'fax', etiket: 'Fax', maxLength: 13}).addStyle(e => `$elementCSS { max-width: 150px }`);
		form.addTextInput({ id: 'webAdres',	etiket: 'Web Adresi'}).addStyle(e => `$elementCSS { max-width: 450px }`);
		form.addTextInput({ id: 'eArsiv', etiket: 'E-Arşiv'}).addStyle(e => `$elementCSS { max-width: 450px }`);
		form.addTextInput({ id: 'eMail', etiket: 'E-Mail'}).addStyle(e => `$elementCSS { max-width: 450px }`);
	}
	static orjBaslikListesiDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif;
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'tel1', text: 'Telefon', genislikCh: 15 }),
			new GridKolon({ belirtec: 'tel2', text: 'Telefon-2', genislikCh: 15 }),
			new GridKolon({ belirtec: 'fax', text: 'Fax', genislikCh: 15 }),
			new GridKolon({ belirtec: 'webadresi', text: 'Web Adresi', genislikCh: 20 }),
			new GridKolon({ belirtec: 'emailearsiv', text: 'E-Arşiv Mail', genislikCh: 20 }),
			new GridKolon({ belirtec: 'gsm1', text: 'Genel GSM Tel', genislikCh: 20 }),
			new GridKolon({ belirtec: 'telfinans', text: 'Finans Tel', genislikCh: 20 }),
			new GridKolon({ belirtec: 'gsmfinans', text: 'Finans GSM', genislikCh: 20 }),
			new GridKolon({ belirtec: 'ilgilifinans', text: 'Finans İlgili Kişi', genislikCh: 20 }),
			new GridKolon({ belirtec: 'emailfinans', text: 'Finans E-Mail', genislikCh: 20 }),
			new GridKolon({ belirtec: 'telsatis', text: 'Satış Tel', genislikCh: 20 }),
			new GridKolon({ belirtec: 'gsmsatis', text: 'GSM Satış Tel', genislikCh: 20 }),
			new GridKolon({ belirtec: 'emailsatis', text: 'Satış E-Mail', genislikCh: 20 }),
			new GridKolon({ belirtec: 'telsatinalma', text: 'Satın Alma Tel', genislikCh: 20 }),
			new GridKolon({ belirtec: 'gsmsatinalma', text: 'GSM Satın Alma Tel', genislikCh: 20 }),
			new GridKolon({ belirtec: 'emailsatinalma', text: 'E-Mail Alma', genislikCh: 20 }),
			new GridKolon({ belirtec: 'ilgilisatinalma', text: 'İlgili Satın Alma', genislikCh: 20 }),
			new GridKolon({ belirtec: 'ilgilisatis', text: 'İlgili Satış ', genislikCh: 20 }),
			new GridKolon({ belirtec: 'telmuhasebe', text: 'Muhasebe Tel', genislikCh: 20 }),
			new GridKolon({ belirtec: 'emailmuhasebe', text: 'Muhasebe E-Mail', genislikCh: 20 }),
			new GridKolon({ belirtec: 'gsmmuhasebe', text: 'Muhasebe GSM Tel', genislikCh: 20 }),
			new GridKolon({ belirtec: 'ilgilimuhasebe', text: 'Muhasebe İlgli Kişi', genislikCh: 20 }),
			new GridKolon({ belirtec: 'telmutabakat', text: 'Mutabakat Tel', genislikCh: 20 }),
			new GridKolon({ belirtec: 'emailmutabakat', text: 'Mutabakat E-Mail', genislikCh: 20 }),
			new GridKolon({ belirtec: 'gsmmutabakat', text: 'Mutabakat GSM Tel', genislikCh: 20 }),
			new GridKolon({ belirtec: 'ilgilimutabakat', text: 'Mutabakat İlgili Kişi', genislikCh: 20 }),
			new GridKolon({ belirtec: 'tellojistik', text: 'Lojistik Tel', genislikCh: 20 }),
			new GridKolon({ belirtec: 'emaillojistik', text: 'Lojistik E-mail', genislikCh: 20 }),
			new GridKolon({ belirtec: 'gsmlojistik', text: 'Lojistik GSM Tel', genislikCh: 20 }),
			new GridKolon({ belirtec: 'ilgililojistik', text: 'Lojistik İlgili Kişi', genislikCh: 20 })
		)
	}
}
class MQCari_Vergi extends MQCariAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get vkn() { const {sahismi} = this; return this[sahismi ? 'tcKimlikNo' : 'vergiNo'] }
	set vkn(value) {
		const sahismi = value?.length == 11 ? true : value.length == 10 ? false : null;
		if (sahismi != null) { this.sahismi = sahismi; this[sahismi ? 'tcKimlikNo' : 'vergiNo'] = value }
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			vergiDaire: new PInstStr('vdaire'), sahismi: new PInstBool('sahismi'), vergiNo: new PInstStr('vnumara'), tcKimlikNo: new PInstStr('tckimlikno'),
			ticaretSicilNo: new PInstStr('ticaretsicilno'), mersisNo: new PInstStr('mersisno'), mukellefmi: new PInstBitBool('bvergimukellefidir')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; const {mfSinif} = this, {tabPanel} = e;
		// const tabPage = tabPanel.addTab({ id: 'vergi', etiket: 'Vergi' });
		const tabPage = e.tabPage_genel; tabPage.addBaslik({ etiket: 'Vergi' });
		let form = tabPage.addFormWithParent().yanYana(4);
		form.setAltInst(e => e.builder.inst.vergi);
		form.addTextInput({ id: 'vergiDaire',etiket: 'Vergi Dairesi', maxLength: 20 }).addStyle(e => `$elementCSS { max-width: 150px }`);
		form.addTextInput({ id: 'vergiNo', etiket: 'Vergi No', maxLength: 10 }).addStyle(e => `$elementCSS { max-width: 150px }`);
		form.addTextInput({ id: 'tcKimlikNo', etiket: 'tcKimlikNo', maxLength: 11 }).addStyle(e => `$elementCSS { max-width: 150px }`);
		form.addTextInput({ id: 'ticaretSicilNo', etiket: 'Ticaret Sicil No', maxLength: 11 }).addStyle(e => `$elementCSS { max-width: 150px }`);
		form.addTextInput({ id: 'mersisNo',etiket: 'Mersis No', maxLength: 16 }).addStyle(e => `$elementCSS { max-width: 150px }`);
		form.addCheckBox({ id: 'sahismi', etiket: 'Şahıstır' });
		form.addCheckBox({ id: 'mukellefmi', etiket: 'Vergi Mükellefidir' })
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.grupTopluEkle([
			{ kod: 'vergi', aciklama: 'Vergi', kapali: false }
		]);
		sec.secimTopluEkle({
			sahismi: new SecimTekSecim({ etiket: 'Şahıs?', tekSecim: new BuDigerVeHepsi(['Şahıs', 'Tüzel Kişi']) }),
			vkn: new SecimOzellik({ etiket: 'Vergi/TC Kimlik No', grupKod: 'vergi' })
		});
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this.mfSinif;
			const sec = e.secimler, wh = e.where;
			wh.add(sec.sahismi.tekSecim.getBoolClause(`${aliasVeNokta}sahismi`));
			wh.ozellik(sec.vkn, `(case when ${aliasVeNokta}sahismi = '' then ${aliasVeNokta}vnumara else ${aliasVeNokta}tckimlikno end)`)
		})
	}
	static orjBaslikListesiDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif;
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'vdaire', text: 'Vergi Daire',genislikCh: 20 }), 
			new GridKolon({ belirtec: 'sahismi', text: 'Şahıs?', genislikCh: 6 }).tipBool(), 
			new GridKolon({ belirtec: 'vnumara', text: 'Vergi No', genislikCh: 13 }), 
			new GridKolon({ belirtec: 'tckimlikno', text: 'T.C No', genislikCh: 14 }),
			new GridKolon({ belirtec: 'bvergimukellefidir', text: 'Vergi Mükellefi mi?', genislikCh: 5 }),
			new GridKolon({ belirtec: 'mersisno', text: 'Mersis No', genislikCh: 20 }),
			new GridKolon({ belirtec: 'ticaretsicilno', text: 'Ticaret Sicil  No', genislikCh: 20 })
		);
	}
}
class MQCari_Finans extends MQCariAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			totalRisk: new PInstNum('risklimiti'),
			acikHesapRisk: new PInstNum('acikhesaplimiti'),
			vadeliHesapRisk: new PInstNum('vadelirisklimiti'),
			vadeliKendiRisk: new PInstNum('vadelikendilimiti'),
			vadeliDigerRisk: new PInstNum('vadelidigerlimiti'),
			takipBorc: new PInstNum('takipborclimiti'),
			bankaKod:new PInstStr('bankakod'),
			bankaSubeKod: new PInstStr('subekod'),
			hesapNo: new PInstStr('hesapno'),
			ibanNo: new PInstStr('ibanno'),
			banHesapDvKod: new PInstStr('banhesapdvkod'),
			borcVadeFarkOran:  new PInstNum('borcvadefarkoran'),
			alVadeFarkOran: new PInstNum('alvadefarkoran')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; const {mfSinif} = this, {tabPanel} = e, tabPage = tabPanel.addTab({ id: 'finans', etiket: 'Finans' });
		tabPage.addBaslik({ etiket: 'Risk Limitleri' });
		tabPage.setAltInst(e => e.builder.inst.finans);
		let form = tabPage.addFormWithParent().yanYana(8)/*.addStyle(e=>`$elementCSS {box-shadow:5px 5px 20px cadetblue}`)*/;
		form.addNumberInput({ id: 'totalRisk', etiket: 'Total Hesap' });
		form.addNumberInput({ id: 'acikHesapRisk', etiket: 'Açık Hesap' });
		form.addNumberInput({ id: 'vadeliHesapRisk', etiket: 'Vadeli Hesap' });
		form.addNumberInput({ id: 'vadeliKendiRisk',	etiket: 'Vadeli Kendi' });
		form.addNumberInput({ id: 'vadeliDigerRisk',	etiket: 'Vadeli Diğer' });
		form.addNumberInput({ id: 'takipBorc', etiket: 'Takip Borcu' });
		//const renk=e.builder.inst.oscolor;
		
		tabPage.addBaslik({ etiket: 'Banka Hesabı' });
		form = tabPage.addFormWithParent().yanYana(5)/*.addStyle(e=>`$elementCSS {box-shadow:5px 5px 20px cadetblue}`)*/;
		//tabPage_finans.setAltInst(e=>e.builder.inst.finans);
		form.addModelKullan({ id: 'bankaKod', etiket: 'Banka', mfSinif: MQBanka }).etiketGosterim_normal().dropDown();
		form.addModelKullan({ id: 'bankaSubeKod', etiket:'Banka Şube', mfSinif: MQBankaSube }).etiketGosterim_normal().dropDown()
			.ozelQueryDuzenleBlock(e => {
				const {builder, aliasVeNokta} = e;
				const bankaKod = e.builder.inst.finans.bankaKod;
				for (const sent of e.stm.getSentListe())
					sent.where.degerAta(bankaKod, `${aliasVeNokta}bankakod`)
			});
		form.addTextInput({ id: 'hesapNo', etiket: 'Hesap No' });
		form.addModelKullan({ id: 'banHesapDvKod', etiket:' Döviz', mfSinif: MQDoviz}).dropDown();
		form.addTextInput({ id: 'ibanNo', etiket: 'IBAN No' });
		form.addLabel({ id: 'bildirim', etiket: 'Diğer hesaplar Satıcı-Müşteri Banka hesapları adımından tanımlanır.', renk: 'black' });
		
		tabPage.addBaslik({ etiket: 'VF Oranları' });
		form = tabPage.addFormWithParent().yanYana(8)/*.addStyle(e=>`$elementCSS {box-shadow:5px 5px 20px cadetblue}`)*/;
		form.addNumberInput({ id: 'borcVadeFarkOran', etiket: 'Borç' });
		form.addNumberInput({ id: 'alVadeFarkOran', etiket: 'Alacak' });
	}
	static orjBaslikListesiDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif, {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'risklimiti', text: 'Risk Limiti', genislikCh: 10 }),
			new GridKolon({ belirtec: 'vadelirisklimiti', text: 'Vadeli Risk Limiti', genislikCh: 10 }),
			new GridKolon({ belirtec: 'vadelikendilimiti', text: 'Vadeli Kendi Risk Limiti', genislikCh: 10 }),
			new GridKolon({ belirtec: 'vadelidigerlimiti', text: 'Vadeli Diğer Risk Limiti', genislikCh: 10 }),
			new GridKolon({ belirtec: 'acikhesaplimiti', text: 'Açık Hesap Risk Limiti', genislikCh: 10 }),
			new GridKolon({ belirtec: 'takipborclimiti', text: 'Takip Borç Limiti', genislikCh: 10 }),
			new GridKolon({ belirtec: 'bankakod', text: 'Banka Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'hesapno', text: 'Hesap No', genislikCh: 10 }),
			new GridKolon({ belirtec: 'ibanno', text: 'IBAN No', genislikCh: 10 }),
			new GridKolon({ belirtec: 'dvkod', text: 'Döviz', genislikCh: 5 }),
			new GridKolon({ belirtec: 'fiyatlistekod', text: 'Fiyat Liste Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'fiyatlistesi', text: 'Fiyat Listesi', genislikCh: 20, sql:'cflist.aciklama' }),
			//new GridKolon({ belirtec: 'bankaadi', text: 'Banka Adı', genislikCh: 15, sql: 'ban.aciklama' }),
			//new GridKolon({ belirtec: 'banksube', text: 'Şube Adı', genislikCh: 15, sql: 'bsube.subeadi' }),
			new GridKolon({ belirtec: 'konsolidemusterikod', text: 'Konsolide Müşteri Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'konsubeadi', text: 'Konsolide Şube Adı', genislikCh: 10 }),
			new GridKolon({ belirtec: 'kendidetaykod', text: 'Kendi Detay Kodu', genislikCh: 5 }),
			new GridKolon({ belirtec: 'muhhesap', text: 'Muhasebe Hesap Kod', genislikCh: 5 })
			//new GridKolon({ belirtec: 'muhhesapadi', text: 'Muhasebe Hesap Adı', genislikCh: 15, sql: 'muh.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		// ilişkileri ve koşulları buraya yazıyoruz.
		const {aliasVeNokta} = this.mfSinif; const {sent} = e;
		sent.fromIliski(`carfiyatliste cflist`, `${aliasVeNokta}fiyatlistekod = cflist.kod`)
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {hv} = e;
		hv.muhhesap = this.muhHesapKod || null
	}
}
class MQCari_Ticari extends MQCariAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			bFormKonKod: new PInstStr('bformkonkod'),
			kdvFl: new PInstTekSecim('kdvfl', KdvTipi),
			dvKod: new PInstStr('dvkod'),
			alimFisTipi: new PInstTekSecim('alimfistipi', AlimFisTipi),
			satisFisTipi: new PInstTekSecim('satisfistipi', SatisFisTipi),
			fiyatListeKod: new PInstTekSecim('stkfytind', FiyatListeNo),
			otvUygulanir: new PInstBool('otvuygulanir'),
			degiskenAdres: new PInstBool('degiskenadres'),
			satilamazFl: new PInstBool('satilamazfl'),
			altHesapZorunlu: new PInstBool('althesapzorunlu'),
			bKdvSatirdanHesaplanir: new PInstBitBool('bkdvsatirdanhesaplanir'),
			bMatbuuDokumDovizlimi: new PInstBitBool('bmatbuudokumdovizlimi')
		})
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.secimTopluEkle({ satisDurumu: new SecimTekSecim({ etiket: 'Satış Durumu', tekSecimSinif: SatilmaDurumu }) });
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this.mfSinif, wh = e.where, sec = e.secimler;
			wh.birlestir(sec.satisDurumu.tekSecim.getTersBoolClause(`${aliasVeNokta}satilamazfl`))
		})
	}
	static ekCSSDuzenle(e) {
		const {rec, result} = e;
		if (asBool(rec.satilamazfl)) { result.push('bg-lightred') }
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; const {mfSinif} = this, {tabPanel} = e, tabPage = tabPanel.addTab({ id: 'ticari', etiket: 'Ticari' });
		tabPage.setAltInst(e => e.builder.inst.ticari);
		let form = tabPage.addFormWithParent().yanYana(5)/*.addStyle(e=>`$elementCSS {box-shadow:5px 5px 20px cadetblue}`)*/;
		form.addModelKullan({ id: 'bFormKonKod', etiket:' Yurt Dışı B Formu',mfSinif: MQCari }).dropDown();
		form.addModelKullan({ id: 'kdvFl', etiket: 'Kdv Tipi', source: e => KdvTipi.instance.kaListe }).noMF().dropDown();
		form.addModelKullan({ id: 'dvKod', etiket: 'Döviz', mfSinif: MQDoviz}).dropDown();
		form.addModelKullan({ id: 'alimFisTipi', etiket: 'Alım Fiş Tipi', source: e => AlimFisTipi.instance.kaListe}).noMF().dropDown();
		form.addModelKullan({ id: 'satisFisTipi', etiket: 'Satış Fiş Tipi', source: e => SatisFisTipi.instance.kaListe}).noMF().dropDown();
		form.addModelKullan({ id: 'fiyatListeKod', etiket: 'Stok Fiyat No', source: e => FiyatListeNo.instance.kaListe}).noMF().dropDown()
			.addStyle(e => `$elementCSS { max-width: 150px }`);
		form = tabPage.addFormWithParent().yanYana(5);
		form.addCheckBox({ id: 'satilamazFl',etiket: 'Satış Durdurulsun' });
		form.addCheckBox({ id: 'otvUygulanir',etiket: 'ÖTV Uygulanır' });
		form.addCheckBox({ id: 'degiskenAdres',etiket: 'Ticari Fişlerde Adres Değişkendir' });
		form.addCheckBox({ id: 'altHesapZorunlu',etiket: 'Alt Hesap Zorunludur' });
		form.addCheckBox({ id: 'bKdvSatirdanHesaplanir',etiket: 'Satış Kdv Detay Satirdan Hesaplanir' });
		form.addCheckBox({ id: 'bMatbuuDokumDovizlimi',etiket: 'Matbuu Dökümde Dip Bilgileri "Dövizli" Yazdırılır' })
	}
	static orjBaslikListesiDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif;
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'bformkonkod', text: 'Yurtdışı B Form', genislikCh: 5 }),
			new GridKolon({ belirtec: 'alimfistipi', text: 'Alım Fiş Tipi', genislikCh: 5 }),
			new GridKolon({ belirtec: 'satisfistipi', text: 'Satış Fiş Tipi', genislikCh: 5 }),
			new GridKolon({ belirtec: 'satilamazfl', text: 'Satılmaz Mı?', genislikCh: 5 }).tipBool(),
			new GridKolon({ belirtec: 'otvuygulanir', text: 'ÖTV Uygulanır mı?', genislikCh: 5 }).tipBool(),
			new GridKolon({ belirtec: 'degiskenadres', text: 'Adres Değişken mi?', genislikCh: 5 }),
			new GridKolon({ belirtec: 'bmatbuudokumdovizlimi', text: 'Matbuu Döküm Dövizli mi?', genislikCh: 5 }).tipBool()
		)
	}
	static loadServerData_queryDuzenle(e) { const {aliasVeNokta} = this.mfSinif, {sent} = e; sent.sahalar.add(`${aliasVeNokta}calismadurumu`) }
}
class MQCari_EIslem extends MQCariAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			eFaturaKullanirmi: new PInstBool('efaturakullanirmi'),
			senaryoTipi: new PInstTekSecim('efatsenaryotipi', SenaryoTipi),
			eFaturaYontem: new PInstTekSecim('efatyontem', EIslGenelYontem),
			efOzelYontemKod:new PInstStr('efozelyontemkod'),
			ozelButceliVkn: new PInstStr('ozelbutcelivkn'),
			ozelButceliUnvan: new PInstStr('ozelbutceliunvan'),
			bOzelButceliKurumdur: new PInstBitBool('bozelbutcelikurumdur'),
			eFatDovizliDokum: new PInstBool('efatdovizlidokum'),
			beFatDipIsk2Satir: new PInstBitBool('befatdipisk2satir'),
			fiyatGosterim: new PInstTekSecim('fiyatgosterim', EIslKural_Fiyat),
			eArsivBelgeTipi: new PInstTekSecim('earsivbelgetipi', EArsiv_BelgeTipi),
			eIslOzelDipKod: new PInstStr('eislozeldipkod'),
			eIrsAlimiAdetTeslimeDuzenlenirmi: new PInstBitBool('beirsalimiadeteslimeduzenlenir'),
			eFatGIBAlias: new PInstStr('efatgibalias'), eIrsGIBAlias: new PInstStr('eirsgibalias')
		})
	}
	static rootFormBuilderDuzenle(e) {
		const {mfSinif} = this;
		const {tabPanel} = e;
		const tabPage = tabPanel.addTab({ id: 'eislem', etiket: 'E-İşlem' });
		tabPage.setAltInst(e => e.builder.inst.eIslem);
		let form = tabPage.addFormWithParent().yanYana(4)/*.addStyle(e=>`$elementCSS {box-shadow:5px 5px 20px cadetblue}`)*/;
		//tabPanel.addBaslik({ etiket: 'E-Fatura/E-Arşiv' });
		form.addCheckBox({ id: 'eFaturaKullanirmi', etiket: 'E-Fatura' })
			.degisince(e => {
				for (const subBuilder of e.builder.parentBuilder.parentBuilder.id2Builder.ozelButceliKurum_parent.builders)
					subBuilder.updateVisible()
			});
		const eFatKullanimKosulu = e => {e.builder.inst.eIslem.eFaturaKullanirmi};
		form.addButton({ value: 'Özel Entegratörden Kontrol Et', handler: e => this.ozelEntegratordenKontrolEtIstendi(e)});
		form.addModelKullan({ id: 'senaryoTipi', etiket: 'Senaryo Tipi', source: e => SenaryoTipi.instance.kaListe}).noMF().dropDown()
			.setVisibleKosulu(e => eFatKullanimKosulu(e));
		form.addModelKullan({ id: 'eFaturaYontem', etiket: 'Genel Yöntem', source: e => EIslGenelYontem.instance.kaListe}).noMF().dropDown()
			.setVisibleKosulu(e => eFatKullanimKosulu(e));
		form.addModelKullan({ id: 'efOzelYontemKod',etiket:' Özel Yöntem', mfSinif: MQEIslOzelYontem}).dropDown()
			.setVisibleKosulu(e => eFatKullanimKosulu(e));
		form.addCheckBox({ id: 'bOzelButceliKurumdur',etiket: 'Özel Bütçeli Kurumdur'})
			.degisince(e => {
					for (const subBuilder of e.builder.parentBuilder.parentBuilder.id2Builder.ozelButceliKurum_parent.builders)
						subBuilder.updateVisible()
				});
		//form = tabPage_eIslem.addFormWithParent({ id: 'ozleButceliKurum_parent' }).yanYana(6);
		const rayicBedelVisibleKosulu = e =>
			{e.builder.altInst.bOzelButceliKurumdur};
		form.addTextInput({ id: 'ozelButceliVkn',etiket: 'VKN', maxLength: 11}).setVisibleKosulu(e => rayicBedelVisibleKosulu(e));
		form.addTextInput({ id: 'ozelButceliUnvan',etiket: 'Ünvan'}).setVisibleKosulu(e => rayicBedelVisibleKosulu(e));
		form = tabPage.addFormWithParent().yanYana(1);
		form.addLabel({ id: 'uyari', etiket: `SGK kamu kurumu olmasına rağmen senaryo olarak KAMU seçilmemelidir. Satış param'da  'SGK fatura' seçilmeli ve yeni açılan ekranda sgk param doldurulmalıdır.`, renk: 'cadetblue' });
		form = tabPage.addFormWithParent().yanYana(2);
		form.addCheckBox({ id: 'eFatDovizliDokum',etiket: 'E-Fatura Döviz Bedelleri İle Gösterilir' });
		form.addCheckBox({ id: 'beFatDipIsk2Satir',etiket: 'Dip İskonto Satırlara Yansıtılır' });
		form = tabPage.addFormWithParent().yanYana(4);
		form.addModelKullan({ id: 'fiyatGosterim', etiket: 'Fiyat Gösterim', source: e => EIslKural_Fiyat.instance.kaListe}).noMF().dropDown();
		form.addModelKullan({ id: 'eIslOzelDipKod', etiket:'E-İşlem Özel Dip', mfSinif: MQEIslemOzelDip }).dropDown();
		form.addModelKullan({ id: 'eArsivBelgeTipi', etiket: 'E-Arşiv Belge Gönderim Tipi', source: e => EArsiv_BelgeTipi.instance.kaListe}).noMF().dropDown();
		form.addCheckBox({ id: 'eIrsAlimiAdetTeslimeDuzenlenirmi',etiket: `E-İrsaliye Alim İade'de Sevk Yeri Varsa Alıcı Olarak Kabul Edilir`});
		form = tabPage.addFormWithParent().yanYana(2);
		form.addTextInput({ id: 'eFatGIBAlias', etiket: 'e-Fatura GIB Alias' });
		form.addTextInput({ id: 'eIrsGIBAlias',	etiket: 'e-İrsaliye GIB Alias' });
		form = tabPage.addFormWithParent().yanYana(1);
		form.addLabel({ id: 'bildirim1', etiket: `**GIB Alias Değeri 'defaultpk@firmaAdi.com' gibidir.`, renk: 'gray' });
		form.addLabel({ id: 'bildirim2', etiket: `E-İrs. GIB alias izin verilmez ise E-Fat GIB alias esas Alınır.`, renk: 'black' });
		form.addLabel({ id: 'bildirim3', etiket: `Konsolide detaylarda irsaliye GİB alias varsa e-irsaliye o adrese gönderilir.`, renk: 'cadetblue' })
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.liste.instAdi.etiket = 'Cari Ünvan';
		sec.secimTopluEkle({
			eFatDurum: new SecimTekSecim({ etiket: 'e-Fat Kullanım', tekSecimSinif: EvetHayirTekSecim })
		});
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const sec = e.secimler, wh = e.where;
			wh.birlestir(sec.eFatDurum.tekSecim, `${aliasVeNokta}efaturakullanirmi`)
		})
	}
	static standartGorunumListesiDuzenle(e) {
		const {liste} = e;
		liste.push('efaturakullanirmi')
	}
	static orjBaslikListesiDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif;
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'musrefkod', text: 'Müşteri Referans Kodu', genislikCh: 5 }),
			new GridKolon({ belirtec: 'efaturakullanirmi', text: 'E-Fatura Kullanılır', genislikCh: 5 }).tipBool(),
			new GridKolon({ belirtec: 'efatsenaryotipi', text: 'E-Fatura Senaryo Tipi', genislikCh: 5 }),
			new GridKolon({ belirtec: 'efatyontem', text: 'E-Fatura Yöntemi', genislikCh: 5 }),
			new GridKolon({ belirtec: 'efatgibalias', text: 'E-Fatura GIB Alias', genislikCh: 10 }),
			new GridKolon({ belirtec: 'efozelyontemkod', text: 'E-Fatura Özel Yöntem Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'efozelyontem', text: 'E-Fatura Özel Yöntem', genislikCh: 20, sql: 'efoy.aciklama' }),
			new GridKolon({ belirtec: 'efatdovizlidokum', text: 'E-Fat Dövizli Döküm', genislikCh: 5 }),
			new GridKolon({ belirtec: 'efatsorguts', text: 'E-Fat Sorgu Tarih', genislikCh: 10 }),
			new GridKolon({ belirtec: 'eislozeldipkod', text: 'E-İşlem Özel Dip Kod', genislikCh: 5 }),
			new GridKolon({ belirtec: 'eislozeldip', text: 'E-İşlem Özel Dip', genislikCh: 20, sql: 'eiod.aciklama' }),
			new GridKolon({ belirtec: 'earsivbelgetipi', text: 'E-Arşiv Belge Tipi', genislikCh: 5 }),
			new GridKolon({ belirtec: 'bozelbutcelikurumdur', text: 'Özel Bütçeli Kurum mu?', genislikCh: 5 }),
			new GridKolon({ belirtec: 'ozelbutceliunvan', text: 'Özel Bütçeli Kurum Ünvan ', genislikCh: 20 })
		)
	}
	static loadServerData_queryDuzenle(e) {
		// ilişkileri ve koşulları buraya yazıyoruz.
		const {aliasVeNokta} = this.mfSinif;
		const {sent} = e;
		sent.fromIliski(`efozelyontem efoy`, `${aliasVeNokta}efozelyontemkod = efoy.kod`)
		sent.fromIliski(`eislemozeldip eiod`, `${aliasVeNokta}eislozeldipkod = eiod.kod`)
	}
	static ozelEntegratordenKontrolEtIstendi(e) {
		displayMessage('butona tıklandı')
	}
}
class MQCiranta extends MQCari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Ciranta' }
	static get tableAlias() { return 'cir' }
}
