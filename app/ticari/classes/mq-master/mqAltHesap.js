class MQAltHesap extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kodListeTipi() { return 'ALTHESAP' }
	static get sinifAdi() { return 'Alt Hesap' } static get table() { return 'althesap' } static get tableAlias() { return 'alth' }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments); $.extend(pTanim, {
			mustKod: new PInstStr('must'), grupKod: new PInstStr('ahgrupkod'),
			eFatConfKod: new PInstStr('efatconfkod')
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments); sec.secimTopluEkle({
			must: new SecimString({ etiket: 'Müşteri', mfSinif: MQCari }),
			mustUnvan: new SecimOzellik({ etiket: 'Müşteri Ünvan' }),
			grup: new SecimString({ etiket: 'Grup', mfSinif: MQAltHesapGrup }),
			grupAdi: new SecimOzellik({ etiket: 'Grup Adı' }),
			eFatConfKod: new SecimString({ etiket: 'e-İşlem Konf. Kod', mfSinif: MQEConf })
		}).whereBlockEkle(({ where: wh, secimler: sec }) => {
			const {aliasVeNokta} = this;
			wh.basiSonu(sec.must, `${aliasVeNokta}must`).ozellik(sec.mustUnvan, 'car.birunvan');
			wh.basiSonu(sec.grup, `${aliasVeNokta}ahgrupkod`).ozellik(sec.grupAdi, 'ahgrp.aciklama');
			wh.basiSonu(sec.eFatConfKod, `${aliasVeNokta}efatconfkod`)
		})
	}
	static rootFormBuilderDuzenle({ tanimFormBuilder: tanimBuilder }) {
		super.rootFormBuilderDuzenle(...arguments);
		this.formBuilder_addTabPanelWithGenelTab(e); let {tabPanel, tabPage_genel} = e;
		form = tabPage_genel.addFormWithParent().altAlta();
			form.addModelKullan('mustKod', 'Müşteri').comboBox().setMFSinif(MQCari);
		form = tabPage_genel.addFormWithParent().yanYana(2);
			form.addModelKullan('grupKod', 'Grup').dropDown().setMFSinif(MQAltHesapGrup);
			form.addModelKullan('eFatConfKod', 'e-İşlem Özel Konf.').dropDown().setMFSinif(MQEConf)
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); liste.push(
			new GridKolon({ belirtec: 'must', text: 'Müşteri', genislikCh: 16 }),
			new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', sql: 'car.birunvan' }),
			new GridKolon({ belirtec: 'ahgrupkod', text: 'Grup', genislikCh: 8 }),
			new GridKolon({ belirtec: 'ahgrupadi', text: 'Grup Adı', sql: 'ahgrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments); const {aliasVeNokta} = this;
		sent.fromIliski('carmst car', `${aliasVeNokta}must = car.must`)
			.fromIliski('ahgrup ahgrp', `${aliasVeNokta}ahgrupkod = ahgrp.kod`)
	}
	static getGridKolonlar(e) {
		let liste = [];
		if (app.params.cariGenel?.kullanim?.altHesap) { liste.push(...super.getGridKolonlar(e)) }
		return liste
	}
}
