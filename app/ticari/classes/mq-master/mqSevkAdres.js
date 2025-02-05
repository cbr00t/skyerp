class MQSevkAdres extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kodListetipi() { return 'SEVKADRES' }
	static get sinifAdi() { return 'Sevk Adresi' } static get table() { return 'carsevkadres' } static get tableAlias() { return 'sadr' }
	get unvan() { return birlestirBosluk(this.unvan1, this.unvan2) } get adres() { return birlestirBosluk(this.adres1, this.adres2) }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); let {pTanim} = e; $.extend(pTanim, { mustKod: new PInstStr('must'), ilKod: new PInstStr('ilkod') });
		UnvanVeAdresYapi.pTanimDuzenle(e)
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const {secimler: sec} = e;
		sec.secimTopluEkle({
			mustKod: new SecimString({ etiket: 'Müşteri', mfSinif: MQSCari }), mustUnvan: new SecimOzellik({ etiket: 'Müşteri Ünvan' }),
			yore: new SecimOzellik({ etiket: 'Yöre' }), ilKod: new SecimString({ etiket: 'İl', mfSinif: MQSIl }), ilAdi: new SecimOzellik({ etiket: 'İl Adı' }),
		})
		if (this.adiKullanilirmi) {
			sec.secimEkle('instAdi', new SecimOzellik({ etiket: `${this.sinifAdi} Adı` }));
			sec.whereBlockEkle(e => {
				const {aliasVeNokta} = this, {where: wh, secimler: sec} = e;
				wh.basiSonu(sec.mustKod, `${aliasVeNokta}must`).ozellik(sec.mustUnvan, 'car.birunvan').ozellik(sec.yore, `${aliasVeNokta}yore`);
				wh.basiSonu(sec.ilKod, `${aliasVeNokta}ilkod`).ozellik(sec.ilAdi, 'il.aciklama')
			})
		}
	}
	static standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e); e.liste.push('must', 'mustunvan', 'yore', 'ilkod', 'iladi') }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(...[
			new GridKolon({ belirtec: 'must', text: 'Müşteri', genislikCh: 16 }),
			new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', genislikCh: 40, sql: 'car.birunvan' }),
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 20 }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8 }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 25, sql: 'il.aciklama' })
		])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {tableAlias: alias} = this, {sent} = e;
		sent.fromIliski('carmst car', `${alias}.must = car.must`).fromIliski('caril il', `${alias}.ilkod = il.kod`)
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e);
		let {sender, inst, tabPage_genel: tabPage, kaForm} = e, {mustKod} = sender.parentPart.parentPart.inst ?? {}; if (mustKod) { inst.mustKod = mustKod }
		kaForm.yanYana(2).addModelKullan('mustKod', 'Müşteri').comboBox().autoBind().setMFSinif(MQSCari);
		let form = tabPage.addFormWithParent().yanYana(2);
			form.addTextInput('unvan1', 'Ünvan 1').setMaxLength(50); form.addTextInput('unvan2', 'Ünvan 2').setMaxLength(50);
		form = tabPage.addFormWithParent().yanYana(2);
			form.addTextInput('yore', 'Yöre').setMaxLength(25); form.addModelKullan('ilKod', 'İl').comboBox().autoBind().setMFSinif(MQSIl).addStyle_wh(400, null)
		form = tabPage.addFormWithParent().yanYana(2); let css = `$elementCSS { max-width: 850px }`;
			form.addTextInput('adres1', 'Adres 1').setMaxLength(50); form.addTextInput('adres2', 'Adres 2').setMaxLength(60)
	}
}
