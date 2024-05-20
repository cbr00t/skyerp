class MQAltHesap extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Alt Hesap' }
	static get table() { return 'althesap' }
	static get tableAlias() { return 'alth' }
	static get kodListeTipi() { return 'ALTHESAP' }
	constructor(e) {
		e = e || {};
		super(e)
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			mustKod: new PInstStr('must'),
			grupKod: new PInstStr('ahgrupkod'),
			eFatConfKod: new PInstStr('efatconfkod')
		})
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);
		const {secimler} = e;
		secimler.secimTopluEkle({
			must: new SecimString({ etiket: 'Müşteri', mfSinif: MQCari }),
			mustUnvan: new SecimOzellik({ etiket: 'Müşteri Ünvan' }),
			grup: new SecimString({ etiket: 'Grup', mfSinif: MQAltHesapGrup }),
			grupAdi: new SecimOzellik({ etiket: 'Grup Adı' }),
			eFatConfKod: new SecimString({ etiket: 'e-İşlem Konf. Kod', mfSinif: MQEConf })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
			where.basiSonu(secimler.must, `${aliasVeNokta}must`);
			where.ozellik(secimler.mustUnvan, 'car.birunvan');
			where.basiSonu(secimler.grup, `${aliasVeNokta}ahgrupkod`);
			where.ozellik(secimler.grupAdi, 'ahgrp.aciklama');
			where.basiSonu(secimler.eFatConfKod, `${aliasVeNokta}efatconfkod`);
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);

		const {tanimFormBuilder} = e;
		tanimFormBuilder.add(new FBuilder_TanimFormTabs({ id: 'tabPanel' }).add(
			new FBuilder_TabPage({ id: 'genel', etiket: 'Genel' }).add(
				new FBuilderWithInitLayout().add(
					new FBuilder_ModelKullan({ id: 'mustKod', etiket: 'Müşteri', mfSinif: MQCari }).comboBox()
				),
				new FBuilderWithInitLayout().yanYana(2).add(
					new FBuilder_ModelKullan({ id: 'grupKod', etiket: 'Grup', mfSinif: MQAltHesapGrup }).dropDown(),
					new FBuilder_TextBox({ id: 'eFatConfKod', etiket: 'e-İşlem Konf. Kod' })
				)
			)
		))
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'must', text: 'Müşteri', genislikCh: 16 }),
			new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', sql: 'car.birunvan' }),
			new GridKolon({ belirtec: 'ahgrupkod', text: 'Grup', genislikCh: 8 }),
			new GridKolon({ belirtec: 'ahgrupadi', text: 'Grup Adı', sql: 'ahgrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.fromIliski('carmst car', `${aliasVeNokta}must = car.must`);
		sent.fromIliski('ahgrup ahgrp', `${aliasVeNokta}ahgrupkod = ahgrp.kod`)
	}
	static getGridKolonlar(e) {
		const liste = [];
		if (app.params.cariGenel.kullanim.altHesap)
			liste.push(...super.getGridKolonlar(e))
		return liste
	}
}
