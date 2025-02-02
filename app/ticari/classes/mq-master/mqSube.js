class MQSube extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Şube' } static get table() { return 'isyeri' } static get tableAlias() { return 'sub' }
	static get kodListeTipi() { return 'SUBE' } static get bosKodAlinirmi() { return true }
	static get cioClassKeys() { return ['asil', 'iletisim', 'vergi', 'teknik', 'musavir', 'diger'] }
	get unvan() { return this.asil.unvan }
	get ulkeAdi() { return null }
	get ilAdi() { return this.asil.ilAdi }
	get yore() { return this.asil.yore }
	get posta() { return this.asil.posta }
	get adres() { return this.asil.adres }
	get vknTckn() { return this.vergi.vknTckn }
	get sahismi() { return this.vergi.sahismi }
	get tckn() { return this.vergi.tckn }
	get vkn() { return this.vergi.vkn }
	get vergiDairesi() { return this.vergi.vergiDairesi }
	get ticSicilNo() { return this.vergi.ticSicilNo }
	get mersisNo() { return this.vergi.mersisNo }
	get tel1() { return this.iletisim.tel1 }
	get tel2() { return this.iletisim.tel2 }
	get tel3() { return this.iletisim.tel3 }
	get eMail() { return this.iletisim.eMail }
	get fax() { return this.iletisim.fax }
	get webURL() { return this.iletisim.webAdresi }
	get gibAlias() { return null }

	constructor(e) { e = e || {}; super(e) }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			grupKod: new PInstStr('isygrupkod'),
			asil: new PInstClass(MQSube_AsilBilgi),
			iletisim: new PInstClass(MQSube_Iletisim),
			vergi: new PInstClass(MQSube_Vergi),
			teknik: new PInstClass(MQSube_Teknik),
			musavir: new PInstClass(MQSube_Musavir),
			diger: new PInstClass(MQSube_Diger)
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e);
		const {tanimFormBuilder} = e;
		tanimFormBuilder.add(new FBuilder_TanimFormTabs({ id: 'tabPanel', builders: [
			new FBuilder_TabPage({ id: 'genel', etiket: 'Genel', builders: [
				new FBuilderWithInitLayout({ builders: [
					new FBuilder_ModelKullan({ id: 'grupKod', etiket: 'Grup', mfSinif: MQSubeGrup }).dropDown()
				] }).yanYana(4)
			] })
		] }))
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const {secimler} = e;
		secimler.grupTopluEkle([
			{ kod: 'grup', aciklama: 'Grup', renk: '#555', zeminRenk: 'lightgreen', kapali: true }
		]);
		secimler.secimTopluEkle({
			grupKod: new SecimString({ mfSinif: MQSubeGrup, grupKod: 'grup' }),
			grupAdi: new SecimOzellik({ etiket: 'Grup Adı', grupKod: 'grup' })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this, {where, secimler} = e;
			where.basiSonu(secimler.grupKod, `${aliasVeNokta}isygrupkod`);
			where.ozellik(secimler.grupAdi, `igrp.aciklama`)
		})
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'isygrupkod', text: 'Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'isygrupadi', text: 'Grup Adı', genislikCh: 20, sql: 'igrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta, kodSaha} = this, {sent} = e, {where: wh} = sent;
		sent.fromIliski('isygrup igrp', `${aliasVeNokta}isygrupkod = igrp.kod`);
		wh.add(`${aliasVeNokta}silindi = ''`).icerikKisitDuzenle_sube({ saha: `${aliasVeNokta}${kodSaha}`})
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {hv} = e;
		for (const key of this.class.cioClassKeys) { $.extend(hv, this[key].hostVars(e)) }
		e.hv = hv;
	}
	setValues(e) {
		super.setValues(e);
		for (const key of this.class.cioClassKeys) this[key].setValues(e)
	}
}
class MQSubeGrup extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'İşyeri Grubu' } static get table() { return 'isygrup' } static get tableAlias() { return 'igrp' } static get kodListeTipi() { return 'FISYGRUP' }
}
class MQSubeAlt extends MQAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
}
class MQSube_AsilBilgi extends UnvanVeAdresYapi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { ilAdi: new PInstStr('iladi') })
	}
}
class MQSube_Iletisim extends MQSubeAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e; $.extend(pTanim, {
			tel1: new PInstStr('tel1'),
			tel2: new PInstStr('tel2'),
			eMail: new PInstStr('email'),
			fax: new PInstStr('fax'),
			webAdresi: new PInstStr('webadresi'),
			imzaYetkili: new PInstStr('imzayetkili'),
			iban: new PInstStr('isyiban')
		})
	}
}
class MQSube_Vergi extends MQSubeAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get vknTckn() { return this.sahismi ? this.tckn : this.vkn }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			sahismi: new PInstBool('sahisfirmasi'),
			tckn: new PInstStr('tckimlikno'),
			vkn: new PInstStr('vergino'),
			vergiDairesi: new PInstStr('vergidaire'),
			vergiDaireKod: new PInstStr('vergidairekodu'),
			vergiDaireYore: new PInstStr('vergidaireyore'),
			vergiDaireIlAdi: new PInstStr('vergidaireiladi'),
			naceKodu: new PInstStr('nacekodu'),
			ticSicilNo: new PInstStr('ticsicilno'),
			mersisNo: new PInstStr('mersisno')
		})
	}
}
class MQSube_Teknik extends MQSubeAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class MQSube_Musavir extends MQSubeAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class MQSube_Diger extends MQSubeAlt {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
			$.extend(pTanim, {
				sutOnayKodu: new PInstStr('sutonaykodu'), tapdkNox: new PInstStr('tapdknox'),
				betonIzinBilgi: new PInstStr('betonizinbilgi'), ruhsatNo: new PInstStr('ruhsatno'), ruhsatTarihi: new PInstDate('ruhsattarihi'), ilTarimKodu: new PInstStr('iltarimkodu')
			})
	}
}
