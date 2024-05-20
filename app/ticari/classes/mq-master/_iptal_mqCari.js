class MQCari extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get cioClasses() { return [MQCariAlt_UnvanVeAdres, MQCariAlt_Vergi] }
	static get cioClassKeys() { return ['unvanVeAdres', 'vergi'] }
	
	static get sinifAdi() { return 'Cari Hesap' }
	static get table() { return 'carmst' }
	static get tableAlias() { return 'car' }
	static get kodSaha() { return 'must' }
	static get adiSaha() { return 'birunvan' }
	static get adiEtiket() { return 'Ünvan' }
	// static get tanimUISinif() { return MQCariTanimPart }
	static get tanimUISinif() { return ModelTanimPart }
	static get zeminRenkDesteklermi() { return false }
	static get kodListeTipi() { return 'CAR' }
	static get ayrimTipKod() { return 'CRAYR' }
	static get ayrimTableAlias() { return 'cayr' }
	static get ozelSahaTipKod() { return 'CAR' }
	static get kayitTipi() { return '' }
	
	get vkn() { return this.vergiYapi.vkn }
	set vkn(value) { this.vergiYapi.vkn = value }

	constructor(e) {
		e = e || {};
		super(e);
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e);
		const {rec, result} = e;
		if (!asBool(rec.calismadurumu))
			result.push('bg-lightgray', 'iptal')
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			aktifmi: new PInstTrue('calismadurumu'),
			eFaturaKullanirmi: new PInstBool('efaturakullanirmi'),
			unvanVeAdres: new PInstClass(MQCariAlt_UnvanVeAdres),
			vergi: new PInstClass(MQCariAlt_Vergi)
		})
	}

	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);

		this.formBuilder_addTabPanelWithGenelTab(e);
		
		e.kaForm.id2Builder.aciklama.setVisibleKosulu('jqx-hidden');
		
		const {tabPanel, tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(2);
		form.addCheckBox({ id: 'aktifmi', etiket: 'Çalışır' });
		form.addCheckBox({ id: 'eFaturaKullanirmi', etiket: 'e-Fat' })
				.addStyle(e => `$elementCSS > label { color: purple }`);

		for (const cls of this.cioClasses)
			cls.rootFormBuilderDuzenle(e)
	}

	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);
		
		const sec = e.secimler;
		/*secimler.grupTopluEkle([
			{ kod: 'grup', aciklama: 'Grup', renk: '#555', zeminRenk: 'lightgreen' },
			{ kod: 'diger', aciklama: 'Diğer', renk: '#555', kapalimi: true },
			{ kod: 'test', aciklama: 'TEST', renk: '#777', kapalimi: true }
		]);*/
		sec.liste.instAdi.etiket = 'Cari Ünvan';
		sec.secimTopluEkle({
			calismaDurumu: new SecimTekSecim({ etiket: 'Çalışma Durumu', tekSecimSinif: CalismaDurumu }),
			eFatDurum: new SecimTekSecim({ etiket: 'e-Fat Kullanım', tekSecimSinif: EvetHayirTekSecim })
		});
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const sec = e.secimler;
			const wh = e.where;
			let value = sec.calismaDurumu.tekSecim;
			if (value && !value.hepsimi)
				wh.add(`${aliasVeNokta}calismadurumu ${value.bumu ? '<>' : '='} ''`)
			value = sec.eFatDurum.tekSecim;
			if (value && !value.hepsimi)
				wh.add(`${aliasVeNokta}efaturakullanirmi ${value.bumu ? '<>' : '='} ''`)
		});

		for (const cls of this.cioClasses)
			cls.secimlerDuzenle(e)
	}

	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e);
		
		const {liste} = e;
		liste.push('efaturakullanirmitext');

		for (const cls of this.cioClasses)
			cls.standartGorunumListesiDuzenle(e)
	}

	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);

		const {aliasVeNokta} = this;
		const {liste} = e;
		liste.push(
			new GridKolon({
				belirtec: 'efaturakullanirmitext', text: 'e-Fat', genislikCh: 6,
				sql: `(case when ${aliasVeNokta}efaturakullanirmi = '' then  '' else '<span class="eFat">e-Fat</span>' end)`,
				cellClassName: (sender, rowIndex, belirtec, value, rec) => {
					const result = [belirtec];
					if (asBool(rec.efaturakullanirmi))
						result.push('eFat')
					return result
				}
			})
		);

		for (const cls of this.cioClasses)
			cls.orjBaslikListesiDuzenle(e)
	}

	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.fromIliski('caril il', `${aliasVeNokta}ilkod = il.kod`);
		/*sent.where
			.degerAta(this.kayitTipi, `${this.aliasVeNokta}kayittipi`);*/
		sent.where.addAll([
			`${aliasVeNokta}silindi = ''`,
			`${aliasVeNokta}calismadurumu <> ''`
		]);
		sent.sahalar.addAll(
			`${aliasVeNokta}oscolor`,
			`${aliasVeNokta}calismadurumu`,
			`${aliasVeNokta}efaturakullanirmi`,
			`${aliasVeNokta}sahismi`
		)
	}

	static varsayilanKeyHostVarsDuzenle(e) {
		super.varsayilanKeyHostVarsDuzenle(e);
		const {hv} = e;
		hv.kayittipi = this.kayitTipi
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e);
		const {aciklama} = this;
		const {hv} = e;
		delete hv[this.class.adiSaha];
		const unvan1 = hv.unvan1 = aciklama ? aciklama.substr(0, 50) : '';
		$.extend(hv, {
			unvan2: aciklama ? aciklama.substr(unvan1.length) : ''
		});
		
		for (const key of this.class.cioClassKeys)
			$.extend(hv, this[key].hostVars(e))
		e.hv = hv
	}
	setValues(e) {
		super.setValues(e);
		for (const key of this.class.cioClassKeys)
			this[key].setValues(e)
	}

	static getGridKolonGrup_yoreli(e) {
		const kolonGrup = this.getGridKolonGrup(e);
		if (!kolonGrup)
			return kolonGrup;

		const {tabloKolonlari} = kolonGrup;
		tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 10 }).readOnly()
		]);
		kolonGrup.stmDuzenleyiciEkle(e => {
			const {aliasVeNokta} = this;
			e.stm.sentDo(sent => {
				sent.sahalar
					.add(`${aliasVeNokta}yore`);
			})
		});
		kolonGrup.degisince(e => {
			e.rec.then(rec =>
				e.setCellValue({ belirtec: 'yore', value: rec.yore || '' }))
		});
		
		return kolonGrup;
	}
	alimEIslIcinSetValues(e) {
		const {rec} = e;
		const eFis = e.eFis || {};
		const efAyrimTipi = (eFis.eIslTip ?? rec.efayrimtipi) || 'A';
		const vkn = eFis.gondericiVKN || rec.vkno;
		$.extend(this, {
			kod: this.kod || vkn,
			eFaturaKullanirmi: efAyrimTipi != 'A'
		});
		for (const key of this.class.cioClassKeys)
			this[key].alimEIslIcinSetValues(e)
		return this
	}
}


class MQCariAlt extends MQAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get mfSinif() { return MQCari }
	static rootFormBuilderDuzenle(e) { }
	static secimlerDuzenle(e) { }
	static standartGorunumListesiDuzenle(e) { }
	static orjBaslikListesiDuzenle(e) { }

	alimEIslIcinSetValues(e) {
		return this
	}
}

class MQCariAlt_UnvanVeAdres extends MQCariAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get unvan() { return [this.unvan1, this.unvan2].map(x => !!x).join(' ') }
	set unvan(value) { 
		const max = 50;
		const parts = value ? uygunKelimeliParcalaBirlesik(value, max) : [];
		this.unvan1 = (parts[0] || '').substr(0, max);
		this.unvan2 = (parts[1] || '').substr(0, max)
	}
	get adres() { return [this.adres1, this.adres2].map(x => !!x).join(' ') }
	set adres(value) { 
		const max = 50;
		const parts = value ? uygunKelimeliParcalaBirlesik(value, max) : [];
		this.adres1 = (parts[0] || '').substr(0, max);
		this.adres2 = (parts[1] || '').substr(0, max)
	}
	
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			unvan1: new PInstStr('unvan1'),
			unvan2: new PInstStr('unvan2'),
			yore: new PInstStr('yore'),
			ilKod: new PInstStr('ilkod'),
			adres1: new PInstStr('adres1'),
			adres2: new PInstStr('adres2'),
			sahismi: new PInstBool('sahismi'),
			vergiNo: new PInstStr('vnumara'),
			tcKimlikNo: new PInstStr('tckimlikno')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		
		let tabPage = e.tabPage_genel;
		let parentForm = tabPage.addFormWithParent().yanYana(2);
		parentForm.setAltInst(e => e.builder.inst.unvanVeAdres);
		
		let form = parentForm.addFormWithParent().yanYana(2);
		form.addTextInput({ id: 'unvan1', etiket: 'Ünvan 1' });
		form.addTextInput({ id: 'unvan2', etiket: 'Ünvan 2' });

		form = parentForm.addFormWithParent().yanYana(2);
		form.addTextInput({ id: 'yore', etiket: 'Yöre' });
		form.addModelKullan({ id: 'ilKod', etiket: 'İl', mfSinif: MQCariIl }).dropDown();

		form = parentForm.addFormWithParent().yanYana(2);
		form.addTextInput({ id: 'adres1', etiket: 'Adres 1' });
		form.addTextInput({ id: 'adres2', etiket: 'Adres 2' });
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);
		
		const {secimler} = e;
		secimler.secimTopluEkle({
			yore: new SecimString({ etiket: 'Yöre' }),
			ilKod: new SecimString({ etiket: 'İl', mfSinif: MQCariIl })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this.mfSinif;
			const sec = e.secimler;
			const wh = e.where;
			wh.basiSonu(sec.yore, `${aliasVeNokta}yore`);
			wh.basiSonu(sec.ilKod, `${aliasVeNokta}ilkod`)
		})
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e)
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);

		const {aliasVeNokta} = this.mfSinif;
		const {liste} = e;
		let colDef = liste.find(colDef => colDef.belirtec == this.adiSaha);
		if (colDef)
			colDef.text = 'Ünvan'
		liste.push(
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 10 }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 4 }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 4, sql: 'il.aciklama' }),
			new GridKolon({ belirtec: 'biradres', text: 'Adres' })
		)
	}
	
	alimEIslIcinSetValues(e) {
		super.alimEIslIcinSetValues(e);
		
		const {rec} = e;
		const eFis = e.eFis || {};
		const adresYapi = eFis.gondericiAdresYapi || {};
		$.extend(this, {
			unvan: eFis.gondericiUnvan || rec.efmustunvan || '',
			yore: adresYapi.yore || '',
			posta: adresYapi.posta || '',
			adres: adresYapi.adres || ''
		});

		const {ilAdi} = adresYapi;
		if (ilAdi) {
			MQCariIl.getGloAdi2KodListe().then(adi2Kod => {
				const kod = (adi2Kod[ilAdi.toLocaleUpperCase().trim()] || {})[0];
				if (kod)
					this.ilKod = kod
			})
		}
		
		return this
	}
}

class MQCariAlt_Vergi extends MQCariAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get vkn() { return this[this.sahismi ? 'tckimlikno' : 'vergiNo'] }
	set vkn(value) { this[this.sahismi ? 'tckimlikno' : 'vergiNo'] = value }
	
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			vergiDairesi: new PInstStr('vdaire'),
			sahismi: new PInstBool('sahismi'),
			vergiNo: new PInstStr('vnumara'),
			tcKimlikNo: new PInstStr('tckimlikno')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		
		const {tabPanel} = e;
		const tabPage = tabPanel.addTab({ id: 'vergi', etiket: 'Vergi' })
							.setAltInst(e =>
								e.builder.inst.vergi);
		let form = tabPage.addFormWithParent().yanYana(4);
		form.addTextInput({ id: 'vergiDairesi', etiket: 'Vergi Dairesi' });
		form.addCheckBox({ id: 'sahismi', etiket: 'Şahıs?' })
			.degisince(e => {
				for (const builder of e.builder.parentBuilder.builders)
					builder.updateVisible(e)
			});
		form.addTextInput({ id: 'vergiNo', etiket: 'Vergi Numarası' });
		form.addTextInput({ id: 'tcKimlikNo', etiket: 'TC Kimlik No' })
			.setVisibleKosulu(e => e.builder.altInst.sahismi)
			.onAfterRun(e => e.builder.updateVisible())
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);
		
		const {secimler} = e;
		/*secimler.grupTopluEkle([
			{ kod: 'grup', aciklama: 'Grup', renk: '#555', zeminRenk: 'lightgreen' },
			{ kod: 'diger', aciklama: 'Diğer', renk: '#555', kapalimi: true },
			{ kod: 'test', aciklama: 'TEST', renk: '#777', kapalimi: true }
		]);*/
		secimler.secimTopluEkle({
			sahismi: new SecimTekSecim({ etiket: 'Şahıs?', tekSecim: new BuDigerVeHepsi(['Şahıs', 'Tüzel Kişi']) }),
			vkn: new SecimOzellik({ etiket: 'Vergi/TC Kimlik No' })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this.mfSinif;
			const sec = e.secimler;
			const wh = e.where;
			wh.add(sec.sahismi.tekSecim.getBoolClause(`${aliasVeNokta}sahismi`));
			wh.ozellik(sec.vkn, `(case when ${aliasVeNokta}sahismi = '' then ${aliasVeNokta}vnumara else ${aliasVeNokta}tckimlikno end)`)
		})
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e)
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);

		const {aliasVeNokta} = this.mfSinif;
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'sahismitext', text: 'Şahıs?', genislikCh: 8, sql: MQSQLOrtak.tersBoolClause(`${aliasVeNokta}sahismi`) }),
			new GridKolon({ belirtec: 'vdaire', text: 'Vergi Dairesi', genislikCh: 15 }),
			new GridKolon({ belirtec: 'vnumara', text: 'Vergi No', genislikCh: 11 }),
			new GridKolon({ belirtec: 'tckimlikno', text: 'TC Kimlik No', genislikCh: 12 })
		)
	}
	
	alimEIslIcinSetValues(e) {
		super.alimEIslIcinSetValues(e);
		
		const eFis = e.eFis || {};
		const {rec} = e;
		const vkn = eFis.gondericiVKN || rec.vkno;
		const sahismi = vkn && vkn.length == 11;
		$.extend(this, {
			satismi: sahismi,
			vkn: vkn || this.vkn || '',
			vergiDairesi: eFis.gondericiVergiDairesi || ''
		});
		return this
	}
}
