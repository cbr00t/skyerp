class ExtFis extends MQExt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static tekilOku_queryDuzenle(e) {}
	tekilOku_queryDuzenle(e) { this.class.tekilOku_queryDuzenle(e) }
}
class ExtFis_Cari extends ExtFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { cariKod: new PInstStr('must') })
	}
	static rootFormBuilderDuzenle_ara(e) {
		e = e || {}; const baslikFormlar = e.builders.baslikForm.builders;
		let form = baslikFormlar[0];
		form.addModelKullan({ id: 'cariKod', mfSinif: MQCari }).comboBox()
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.secimTopluEkle({ cariKod: new SecimString({ etiket: 'Cari Kod', mfSinif: MQCari }) });
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this.mfSinif, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.cariKod, `${aliasVeNokta}must`)
		})
	}
	static standartGorunumListesiDuzenle_ara(e) { e.liste.push('must', 'mustunvan', 'yore') }
	static orjBaslikListesiDuzenle_ilk(e) {
		e.liste.push(
			new GridKolon({ belirtec: 'must', text: 'Cari Kod', genislikCh: 16 }),
			new GridKolon({ belirtec: 'mustunvan', text: 'Ünvan', genislikCh: 40, sql: 'car.birunvan' }),
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 40, sql: 'car.yore' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif, {stm} = e;
		for (const sent of stm.getSentListe())
			sent.fromIliski('carmst car', `${aliasVeNokta}must = car.must`)
	}
	static tekilOku_queryDuzenle(e) {
		const {stm} = e;
		for (const sent of stm.getSentListe())
			sent.sahalar.add('car.birunvan', 'car.yore')
	}
	hostVarsDuzenle(e) {
		const {hv} = e, {inst} = this;
		super.hostVarsDuzenle(e);
		if (inst.class.ticMustKullanilirmi && !hv.ticmustkod)
			hv.ticmustkod = hv.must || ''
	}
	dataDuzgunmu(e) { return MQCari.kodYoksaMesaj(this.cariKod) }
}
class ExtFis_AltHesap extends ExtFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodSaha() { return 'cariitn' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { altHesapKod: new PInstStr(this.kodSaha) })
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.secimTopluEkle({ altHesapKod: new SecimString({ etiket: 'Alt Hesap', mfSinif: MQAltHesap }) });
		sec.whereBlockEkle(e => {
			const {aliasVeNokta, kodSaha} = this, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.altHesapKod, `${aliasVeNokta}${kodSaha}`)
		})
	}
	static rootFormBuilderDuzenle_ara(e) {
		e = e || {};
		const baslikFormlar = e.builders.baslikForm.builders;
		let form = baslikFormlar[0];
		form.addModelKullan({ id: 'altHesapKod', mfSinif: MQAltHesap }).dropDown()
	}
	static orjBaslikListesiDuzenle_ilk(e) {
		if (app.params.cariGenel.kullanim.altHesap) {
			e.liste.push(
				new GridKolon({ belirtec: 'althesapkod', text: 'Alt Hesap', genislikCh: 16, sql: `har.${this.kodSaha}` }),
				new GridKolon({ belirtec: 'althesapadi', text: 'Alt Hesap Adı', genislikCh: 40, sql: 'alth.aciklama' })
			)
		}
	}
	static loadServerData_queryDuzenle(e) {
		const {kodSaha} = this, {aliasVeNokta} = this.mfSinif, {stm} = e;
		for (const sent of stm.getSentListe())
			sent.fromIliski('althesap alth', `${aliasVeNokta}${kodSaha} = alth.kod`)
	}
	static tekilOku_queryDuzenle(e) {
		const {stm} = e;
		for (const sent of stm.getSentListe())
			sent.sahalar.add('alth.aciklama althesapadi')
	}
	dataDuzgunmu(e) { return MQAltHesap.kodYoksaMesaj(this.altHesapKod) }
}
class ExtFis_CariVeAltHesap extends ExtFis_Cari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { carDvKod: new PInstStr(), altHesapDvKod: new PInstStr() });
		ExtFis_AltHesap.mfSinif = this.mfSinif; ExtFis_AltHesap.pTanimDuzenle(e)
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);
		ExtFis_AltHesap.mfSinif = this.mfSinif; ExtFis_AltHesap.secimlerDuzenle(e)
	}
	static orjBaslikListesiDuzenle_ilk(e) {
		super.orjBaslikListesiDuzenle_ilk(e);
		ExtFis_AltHesap.mfSinif = this.mfSinif; ExtFis_AltHesap.orjBaslikListesiDuzenle_ilk(e)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		ExtFis_AltHesap.mfSinif = this.mfSinif; ExtFis_AltHesap.loadServerData_queryDuzenle(e)
	}
	static super_loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e) }
	static tekilOku_queryDuzenle(e) {
		const {stm} = e;
		for (const sent of stm.getSentListe())
			sent.sahalar.add('alth.aciklama althesapadi', 'car.dvkod cardvkod', 'alth.dvkod althesapdvkod')
	}
	setValues(e) {
		super.setValues(e); const {inst} = this, {rec} = e;
		$.extend(inst, { cariUnvan: rec.birunvan, yore: rec.yore, carDvKod: rec.cardvkod, altHesapDvKod: rec.althesapdvkod })
	}
	dataDuzgunmu(e) {
		return Promise.all([
			super.dataDuzgunmu(e),
			MQAltHesap.kodYoksaMesaj(this.altHesapKod)
		])
	}
}
class ExtFis_Plasiyer extends ExtFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { plasiyerKod: new PInstStr('plasiyerkod') })
	}
	static rootFormBuilderDuzenle_ara(e) {
		e = e || {};
		const baslikFormlar = e.builders.baslikForm.builders;
		let form = baslikFormlar[0];
		form.addModelKullan({ id: 'plasiyerKod', mfSinif: MQPlasiyer }).dropDown()
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.secimTopluEkle({ plasiyerKod: new SecimString({ etiket: 'Plasiyer Kod', mfSinif: MQPlasiyer }) });
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this.mfSinif, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.plasiyerKod, `${aliasVeNokta}plasiyerkod`)
		})
	}
	static orjBaslikListesiDuzenle_ilk(e) {
		e.liste.push(
			new GridKolon({ belirtec: 'plasiyerkod', text: 'Plasiyer', genislikCh: 16 }),
			new GridKolon({ belirtec: 'plasiyeradi', text: 'Plasiyer Adı', genislikCh: 30, sql: 'pls.birunvan' })
		)
	}
	static standartGorunumListesiDuzenle_ara(e) { e.liste.push('plasiyerkod', 'plasiyeradi') }
	static loadServerData_queryDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif, {stm} = e;
		for (const sent of stm.getSentListe())
			sent.fromIliski('carmst pls', `${aliasVeNokta}plasiyerkod = pls.must`)
	}
	static tekilOku_queryDuzenle(e) {
		const {stm} = e;
		for (const sent of stm.getSentListe())
			sent.sahalar.add('pls.birunvan plasiyeradi')
	}
	dataDuzgunmu(e) { return MQPlasiyer.kodYoksaMesaj(this.plasiyerKod) }
}
class ExtFis_Kasa extends ExtFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, { kasaKod: new PInstStr('kasakod') })
	}
	static rootFormBuilderDuzenle_ara(e) {
		e = e || {};
		const baslikFormlar = e.builders.baslikForm.builders;
		let form = baslikFormlar[0];
		form.addModelKullan({ id: 'kasaKod', mfSinif: MQKasa }).dropDown()
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.secimTopluEkle({ kasaKod: new SecimString({ etiket: 'Kasa Kod', mfSinif: MQKasa }) });
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this.mfSinif, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.kasaKod, `${aliasVeNokta}kasakod`)
		})
	}
	static standartGorunumListesiDuzenle_ara(e) { e.liste.push('kasakod', 'kasaadi') }
	static orjBaslikListesiDuzenle_ilk(e) {
		e.liste.push(
			new GridKolon({ belirtec: 'kasakod', text: 'Kasa Kod', genislikCh: 16 }),
			new GridKolon({ belirtec: 'kasaadi', text: 'Kasa Adı', genislikCh: 30, sql: 'kas.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif, {stm} = e;
		for (const sent of stm.getSentListe())
			sent.fromIliski('kasmst kas', `${aliasVeNokta}kasakod = kas.kod`)
	}
	static tekilOku_queryDuzenle(e) {
		const {stm} = e;
		for (const sent of stm.getSentListe())
			sent.sahalar.add('kas.aciklama kasaadi')
	}
	dataDuzgunmu(e) { return MQKasa.kodYoksaMesaj(this.kasaKod) }
}
class ExtFis_BankaHesap extends ExtFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, { banHesapKod: new PInstStr('banhesapkod') })
	}
	static rootFormBuilderDuzenle_ara(e) {
		e = e || {};
		const baslikFormlar = e.builders.baslikForm.builders;
		let form = baslikFormlar[0];
		form.addModelKullan({ id: 'banHesapKod', mfSinif: MQBankaHesap }).dropDown()
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.secimTopluEkle({ banHesapKod: new SecimString({ etiket: 'Banka Hesap', mfSinif: MQBankaHesap }) });
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this.mfSinif, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.banHesapKod, `${aliasVeNokta}banhesapkod`)
		})
	}
	static standartGorunumListesiDuzenle_ara(e) { e.liste.push('banhesapkod', 'banhesapadi') }
	static orjBaslikListesiDuzenle_ilk(e) {
		e.liste.push(
			new GridKolon({ belirtec: 'banhesapkod', text: 'Banka Hesap', genislikCh: 13 }),
			new GridKolon({ belirtec: 'banhesapadi', text: 'Banka Hesap Adı', genislikCh: 20, sql: 'bhes.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif, {stm} = e;
		for (const sent of stm.getSentListe())
			sent.fromIliski('banbizhesap bhes', `${aliasVeNokta}banhesapkod = bhes.kod`)
	}
	static tekilOku_queryDuzenle(e) {
		const {stm} = e;
		for (const sent of stm.getSentListe())
			sent.sahalar.add('bhes.aciklama banhesapadi')
	}
	dataDuzgunmu(e) { return MQBankaHesap.kodYoksaMesaj(this.banHesapKod) }
}
class ExtFis_RefBankaHesap extends ExtFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, { refBanHesapKod: new PInstStr('bizhesapkod') })
	}
	static rootFormBuilderDuzenle_ara(e) {
		e = e || {};
		const baslikFormlar = e.builders.baslikForm.builders;
		let form = baslikFormlar[0];
		form.addModelKullan({ id: 'bizhesapkod', mfSinif: MQBankaHesap }).dropDown()
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.secimTopluEkle({ refBanHesapKod: new SecimString({ etiket: 'Ref. Banka Hesap', mfSinif: MQBankaHesap }) });
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this.mfSinif, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.refBanHesapKod, `${aliasVeNokta}bizhesapkod`)
		})
	}
	static standartGorunumListesiDuzenle_ara(e) { e.liste.push('bizhesapkod', 'bizhesapadi') }
	static orjBaslikListesiDuzenle_ilk(e) {
		e.liste.push(
			new GridKolon({ belirtec: 'bizhesapkod', text: 'Ref. Banka Hesap', genislikCh: 13 }),
			new GridKolon({ belirtec: 'bizhesapadi', text: 'Ref. Banka Hesap Adı', genislikCh: 20, sql: 'rbhes.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif, {stm} = e;
		for (const sent of stm.getSentListe())
			sent.fromIliski('banbizhesap rbhes', `${aliasVeNokta}bizhesapkod = rbhes.kod`)
	}
	static tekilOku_queryDuzenle(e) {
		const {stm} = e;
		for (const sent of stm.getSentListe())
			sent.sahalar.add('rbhes.aciklama bizhesapadi')
	}
	dataDuzgunmu(e) { return MQBankaHesap.kodYoksaMesaj(this.refBanHesapKod) }
}
class ExtFis_Hizmet extends ExtFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { hizmetKod: new PInstStr('hizmetkod') })
	}
	static rootFormBuilderDuzenle_ara(e) {
		e = e || {};
		const baslikFormlar = e.builders.baslikForm.builders;
		let form = baslikFormlar[0];
		form.addModelKullan({ id: 'hizmetKod', mfSinif: MQHizmet }).comboBox()
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.secimTopluEkle({ hizmetKod: new SecimString({ etiket: 'Hizmet Kod', mfSinif: MQHizmet }) });
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this.mfSinif, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.hizmetKod, `${aliasVeNokta}hizmetkod`)
		})
	}
	static standartGorunumListesiDuzenle_ara(e) { e.liste.push('hizmetkod', 'hizmetadi') }
	static orjBaslikListesiDuzenle_ara(e) {
		e.liste.push(
			new GridKolon({ belirtec: 'hizmetkod', text: 'Hizmet', genislikCh: 16 }),
			new GridKolon({ belirtec: 'hizmetadi', text: 'Hizmet Adı', genislikCh: 30, sql: 'hiz.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif, {stm} = e;
		for (const sent of stm.getSentListe())
			sent.fromIliski('hizmst hiz', `${aliasVeNokta}hizmetkod = hiz.kod`)
	}
	static tekilOku_queryDuzenle(e) {
		const {stm} = e;
		for (const sent of stm.getSentListe())
			sent.sahalar.add('hiz.aciklama hizmetadi')
	}
	dataDuzgunmu(e) { return MQHizmet.kodYoksaMesaj(this.hizmetKod) }
}
class ExtFis_TakipNo extends ExtFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { takipNo: new PInstStr('takipno') })
	}
	static orjBaslikListesiDuzenle_ara(e) {
		if (app.params.ticariGenel.kullanim.takipNo) {
			e.liste.push(
				new GridKolon({ belirtec: 'takipno', text: 'Takip No', genislikCh: 13 }),
				new GridKolon({ belirtec: 'takipadi', text: 'Takip Adı', genislikCh: 25, sql: 'tak.aciklama' })
			)
		}
	}
	static loadServerData_queryDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif, {stm} = e;
		for (const sent of stm.getSentListe())
			sent.fromIliski('takipmst tak', `${aliasVeNokta}takipno = tak.kod`)
	}
	static tekilOku_queryDuzenle(e) {
		const {stm} = e;
		for (const sent of stm.getSentListe())
			sent.sahalar.add('tak.aciklama takipadi')
	}
	dataDuzgunmu(e) { return MQTakipNo.kodYoksaMesaj(this.takipNo) }
}
class ExtFis_Portfoy extends ExtFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, { portfoyKod: new PInstStr('portfkod') })
	}
	static rootFormBuilderDuzenle_ara(e) {
		e = e || {};
		const baslikFormlar = e.builders.baslikForm.builders;
		let form = baslikFormlar[0];
		form.addModelKullan({ id: 'portfoyKod', mfSinif: MQPortfoy }).dropDown()
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.secimTopluEkle({ portfoyKod: new SecimString({ etiket: 'Portföy', mfSinif: MQPortfoy }) });
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this.mfSinif, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.portfoyKod, `${aliasVeNokta}portfkod`)
		})
	}
	static standartGorunumListesiDuzenle_ara(e) { e.liste.push('portfkod', 'portfadi') }
	static orjBaslikListesiDuzenle_ilk(e) {
		e.liste.push(
			new GridKolon({ belirtec: 'portfkod', text: 'Porföy', genislikCh: 16 }),
			new GridKolon({ belirtec: 'portfadi', text: 'Portföy Adı', genislikCh: 30, sql: 'prt.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif, {stm} = e;
		for (const sent of stm.getSentListe())
			sent.fromIliski('csportfoy prt', `${aliasVeNokta}portfkod = prt.kod`)
	}
	static tekilOku_queryDuzenle(e) {
		const {stm} = e;
		for (const sent of stm.getSentListe())
			sent.sahalar.add('prt.aciklama portfoyadi')
	}
	dataDuzgunmu(e) { return MQPortfoy.kodYoksaMesaj(this.portfoyKod) }
}
class ExtFis_Ciranta extends ExtFis_Cari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { cirantaKod: new PInstStr('fisciranta') })
	}
	static rootFormBuilderDuzenle_ara(e) {
		e = e || {};
		const baslikFormlar = e.builders.baslikForm.builders;
		let form = baslikFormlar[0];
		form.addModelKullan('cirantaKod', 'Ciranta').setMFSinif(MQCiranta).comboBox()
	}
	static secimlerDuzenle(e) {
		const sec = e.secimler;
		sec.secimTopluEkle({ cirantaKod: new SecimString({ etiket: 'Ciranta', mfSinif: MQCiranta }) });
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this.mfSinif, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.cirantaKod, `${aliasVeNokta}fisciranta`)
		})
	}
	static standartGorunumListesiDuzenle_ara(e) { e.liste.push('ciranta') }
	static orjBaslikListesiDuzenle_ilk(e) {
		e.liste.push(new GridKolon({ belirtec: 'ciranta', text: 'Ciranta', genislikCh: 40, sql: 'cir.birunvan' }))
	}
	static loadServerData_queryDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif, {stm} = e;
		for (const sent of stm.getSentListe())
			sent.fromIliski('carmst cir', `${aliasVeNokta}fisciranta = cir.must`)
	}
	dataDuzgunmu(e) { return MQCiranta.kodYoksaMesaj(this.ciranta) }
}

class Ext_Cari extends ExtFis_Cari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { cariUnvan: new PInstStr(), yore: new PInstStr() })					// MQCari kolonGrup için ${belirtec}Unvan adiAttr kullanılır
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); this.tekilOku_queryDuzenle(e) }
	setValues(e) {
		const {inst} = this, {rec} = e;
		$.extend(inst, { cariUnvan: rec.birunvan ?? rec.mustunvan, yore: rec.yore })
	}
}
class Ext_AltHesap extends ExtFis_AltHesap {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { altHesapAdi: new PInstStr() })
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); this.tekilOku_queryDuzenle(e) }
	setValues(e) {
		const {inst} = this, {rec} = e;
		$.extend(inst, { altHesapAdi: rec.althesapadi })
	}
}
class Ext_CariVeAltHesap extends ExtFis_CariVeAltHesap {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, { cariUnvan: new PInstStr(), yore: new PInstStr(), altHesapAdi: new PInstStr(), altHesapAdi: new PInstStr() })
	}
	static loadServerData_queryDuzenle(e) {
		super.super_loadServerData_queryDuzenle(e);
		Ext_AltHesap.mfSinif = this.mfSinif; Ext_AltHesap.loadServerData_queryDuzenle(e);
		this.tekilOku_queryDuzenle(e)
	}
	setValues(e) {
		super.setValues(e);
		const {inst} = this, {rec} = e;
		$.extend(inst, { cariUnvan: rec.mustunvan ?? rec.birunvan, yore: rec.yore, altHesapAdi: rec.althesapadi })
	}
}
class Ext_Kasa extends ExtFis_Kasa {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { kasaAdi: new PInstStr() })
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); this.tekilOku_queryDuzenle(e) }
	setValues(e) {
		const {inst} = this, {rec} = e;
		inst.kasaAdi = rec.kasaadi
	}
}
class Ext_BankaHesap extends ExtFis_BankaHesap {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { banHesapAdi: new PInstStr() })
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); this.tekilOku_queryDuzenle(e) }
	setValues(e) {
		const {inst} = this, {rec} = e;
		inst.banHesapAdi = rec.banhesapadi
	}
}
class Ext_RefBankaHesap extends ExtFis_RefBankaHesap {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { refBanHesapAdi: new PInstStr() })
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); this.tekilOku_queryDuzenle(e) }
	setValues(e) {
		const {inst} = this, {rec} = e;
		inst.refBanHesapAdi = rec.bizhesapadi
	}
}
class Ext_Hizmet extends ExtFis_Hizmet {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { hizmetAdi: new PInstStr() })
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); this.tekilOku_queryDuzenle(e) }
	setValues(e) {
		const {inst} = this, {rec} = e;
		inst.hizmetAdi = rec.hizmetadi
	}
}
class Ext_TakipNo extends ExtFis_TakipNo {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		$.extend(e.pTanim, { takipAdi: new PInstStr() })
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); this.tekilOku_queryDuzenle(e) }
	setValues(e) {
		const {inst} = this, {rec} = e;
		inst.takipAdi = rec.takipadi
	}
}

class Ext_PosKrediOrtak extends MQExt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kisaAdi() { return null }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			posKosulKod: new PInstStr('poskosulkod'), posKosulAdi: new PInstStr(),
			banHesapKod: new PInstStr('banhesapkod'), banHesapAdi: new PInstStr()
		})
	}
	static orjBaslikListesiDuzenle_ilk(e) {
		const {kisaAdi} = this;
		e.liste.push(
			new GridKolon({ belirtec: 'poskosulkod', text: kisaAdi, genislikCh: 13 }),
			new GridKolon({ belirtec: 'poskosuladi', text: `${kisaAdi} Adı`, genislikCh: 20, sql: 'pkos.aciklama' }),
			new GridKolon({ belirtec: 'banhesapkod', text: 'Banka Hesap', genislikCh: 13 }),
			new GridKolon({ belirtec: 'banhesapadi', text: 'Banka Hesap Adı', genislikCh: 20, sql: 'bhes.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		const {aliasVeNokta} = this.mfSinif, {stm} = e;
		for (const sent of stm.getSentListe()) {
			sent.fromIliski('poskosul pkos', `${aliasVeNokta}poskosulkod = pkos.kod`);
			sent.fromIliski('banbizhesap bhes', `${aliasVeNokta}banhesapkod = bhes.kod`);
			sent.sahalar.add(/*'pos.mevduathesapkod banhesapkod',*/ 'pkos.aciklama poskosuladi', 'bhes.aciklama banhesapadi')
		}
	}
	setValues(e) {
		const {inst} = this, {rec} = e;
		$.extend(inst, { posKosulAdi: rec.poskosuladi, banHesapKod: rec.banhesapkod, banHesapAdi: rec.banhesapadi })
	}
}
class Ext_PosHesap extends Ext_PosKrediOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kisaAdi() { return 'POS Hesap' }
}
class Ext_KrediKartiHesap extends Ext_PosKrediOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kisaAdi() { return 'Kredi Kartı' }
}
class Ext_BelgeTarihVeNo extends MQExt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			belgeTarih: new PInstDateToday('belgetarih'),
			belgeSeri: new PInstStr('belgeseri'),
			belgeNoYil: new PInstNum('belgenoyil'),
			belgeNo: new PInstNum('belgeno')
		})
	}
	static orjBaslikListesiDuzenle_ara(e) {
		e.liste.push(
			new GridKolon({ belirtec: 'belgetarih', text: 'Tarih', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'belgenox', text: 'Belge No', genislikCh: 17 })
		)
	}
}
class Ext_BedelVeDvBedel extends MQExt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			bedel: new PInstNum('bedel'),
			dvBedel: new PInstNum('dvbedel')
		})
	}
	static orjBaslikListesiDuzenle_son(e) {
		e.liste.push(
			new GridKolon({ belirtec: 'dvbedel', text: 'Dv Bedel', genislikCh: 15 }).tipDecimal_dvBedel(),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 15 }).tipDecimal_bedel()
		)
	}
}
class Ext_DvKur extends MQExt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, { dvKur: new PInstNum('dvkur') })
	}
	static orjBaslikListesiDuzenle_son(e) {
		e.liste.push(new GridKolon({ belirtec: 'dvkur', text: 'Dv Kur', genislikCh: 13 }).tipDecimal_dvBedel())
	}
}
class Ext_NDVade extends MQExt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, { dvKur: new PInstDate('nakdedonusumvade') })
	}
	static orjBaslikListesiDuzenle_ara(e) {
		e.liste.push(new GridKolon({ belirtec: 'nakdedonusumvade', text: 'Nakde Dönüşüm Vade', genislikCh: 13 }).tipDate())
	}
}
class Ext_Vade extends MQExt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, { dvKur: new PInstDate('vade') })
	}
	static orjBaslikListesiDuzenle_ara(e) {
		e.liste.push(new GridKolon({ belirtec: 'vade', text: 'Vade', genislikCh: 13 }).tipDate())
	}
}
class Ext_DetAciklama extends MQExt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, { detAciklama: new PInstStr('aciklama') })
	}
	static orjBaslikListesiDuzenle_son(e) {
		e.liste.push(new GridKolon({ belirtec: 'aciklama', text: 'Fiş Açıklama', genislikCh: 50 }))
	}
}