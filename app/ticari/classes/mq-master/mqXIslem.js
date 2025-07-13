class MQIslem extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tableAlias() { return 'isl' } static get tumKolonlarGosterilirmi() { return true }
	static async getKod2OzelIsaret() {
		let {globals} = this, {kod2OzelIsaret: result} = globals;
		if (!result) {
			result = globals.kod2OzelIsaret = {};
			let {table: from} = this;
			let sent = new MQSent({ from, where: `kod <> ''`, sahalar: ['kod', 'ozelisaret'] });
			let recs = await app.sqlExecSelect(sent);
			for (let {kod, ozelisaret} of recs) { result[kod] = ozelisaret }
		}
		return result
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, { ozelIsaret: new PInstTekSecim('ozelisaret', MQOzelIsaret) })
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e);
		let {tabPage_genel: tabPage} = e; tabPage.yanYana(2);
		tabPage.addModelKullan('ozelIsaret', 'Özel İşaret').dropDown().kodsuz().noMF().autoBind().setSource(MQOzelIsaret.kaListe).addStyle_wh(150)
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments);
		sec.secimTopluEkle({ ozelIsaret: new SecimBirKismi({ etiket: 'İşaret', tekSecimSinif: MQOzelIsaret }) });
		sec.whereBlockEkle(({ where: wh, secimler: sec }) => {
			let {aliasVeNokta} = this;
			wh.birKismi(sec.ozelIsaret, `${aliasVeNokta}ozelisaret`)
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments);
		liste.push(new GridKolon({ belirtec: 'ozelisaret', text: 'İşr.', genislikCh: 8 }))
	}
}

class MQMuhIslem extends MQIslem {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'muhisl' }
	static get kodListeTipi() { return 'MUHISL' } static get sinifAdi() { return 'Muh. İşlem' }
	get durumKod() {
		switch (this.tip.char) { case 'VIR': case 'GEN': return 'DIG' }
		return ''
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			eDefterTipi: new PInstTekSecim('edeftertipi', MQMuhIslemTipi),
			ozelIsaret: new PInstTekSecim('ozelisaret', MQOzelIsaret)
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); let {tabPage_genel: tabPage} = e;
		tabPage.addModelKullan('eDefterTipi', 'Tip').dropDown().kodsuz().noMF().autoBind().setSource(MQMuhIslemTipi.kaListe).addStyle_wh(150)
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments);
		sec.secimTopluEkle({ tip: new SecimBirKismi({ etiket: 'Tip', tekSecimSinif: MQMuhIslemTipi }) });
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => { wh.birKismi(secimler.tip, `${this.aliasVeNokta}edeftertipi`) })
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); let {aliasVeNokta} = this;
		liste.push(new GridKolon({ belirtec: 'edeftertipitext', text: 'Tip', genislikCh: 20, sql: MQMuhIslemTipi.getClause(`${aliasVeNokta}.edeftertipi`) }))
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments);
		let {tableAlias: alias} = this, {sahalar} = sent;
		sahalar.add(`${alias}.edeftertipi`)
	}
}
class MQMuhIslemTipi extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultChar() { return ' ' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments);
		kaListe.push(...[
			new CKodVeAdi([' ', ' ', 'normalmi']),
			new CKodVeAdi(['DIG', 'Diğer', 'digermi'])
		])
	}
}

class MQStokIslem extends MQIslem {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'stkisl' }
	static get kodListeTipi() { return 'STKISL' } static get sinifAdi() { return 'Stok İşlem' }
	get durumKod() {
		switch (this.tip.char) {
			case 'SG': case 'AF': return 'G'
			case 'SC': case 'TF': return 'C'
			case 'ST': return 'T'
		}
		return null
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, { tip: new PInstTekSecim('isltip', MQStokIslemTipi) })
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); let {tabPage_genel: tabPage} = e;
		tabPage.addModelKullan('tip', 'Tip').dropDown().kodsuz().noMF().autoBind().setSource(MQStokIslemTipi.kaListe)
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments);
		sec.secimTopluEkle({ tip: new SecimBirKismi({ etiket: 'Tip', tekSecimSinif: MQStokIslemTipi }) });
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => { wh.birKismi(secimler.tip.value, `${this.aliasVeNokta}isltip`) })
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments);
		liste.push(new GridKolon({ belirtec: 'isltip', text: 'Tip', genislikCh: 20, sql: MQStokIslemTipi.getClause(`${aliasVeNokta}.edeftertipi`) }))
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments);
		let {tableAlias: alias} = this, {sahalar} = sent;
		sahalar.add(`${alias}.isltip`)
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments);
		hv['durum'] = this.durumKod
	}
}
class MQStokIslemTipi extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultChar() { return 'TF' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments);
		kaListe.push(...[
			new CKodVeAdi(['SG', 'Stok Giriş']), new CKodVeAdi(['SC', 'Stok Çıkış']), new CKodVeAdi(['ST', 'Stok Transfer']),
			new CKodVeAdi(['AF', 'Alım Fatura']), new CKodVeAdi(['TF', 'Satış Fatura'])
		])
	}
}

class MQCariIslem extends MQIslem {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'carisl' } 
	static kodListeTipi() { return 'CARISL' } static get sinifAdi() { return 'Cari İşlem' }
	static async getKod2BA() {
		let {globals} = this, {kod2BA: result} = globals;
		if (!result) {
			result = globals.kod2BA = {};
			let {table: from} = this;
			let sent = new MQSent({ from, where: `kod <> ''`, sahalar: ['kod', 'bafl ba'] });
			let recs = await app.sqlExecSelect(sent);
			for (let {kod, ba} of recs) { result[kod] = ba }
		}
		return result
	}
	static async ba2Kodlar() {
		let {globals} = this, {ba2Kodlar: result} = globals;
		if (!result) {
			result = globals.ba2Kodlar = {}; let {kod2BA} = this;
			for (let [kod, ba] of Object.entries(kod2BA)) { (result[ba] = result[ba] ?? []).push(kod) }
		}
		return result
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, { ba: new PInstTekSecim('bafl', BorcAlacak) })
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); let {tabPage_genel: tabPage} = e;
		tabPage.addModelKullan('ba', 'B/A').dropDown().kodsuz().noMF().autoBind().setSource(BorcAlacak.kaListe)
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments);
		sec.secimTopluEkle({ ozelIsaret: new SecimBirKismi({ etiket: 'B/A', tekSecimSinif: BorcAlacak }) });
		sec.whereBlockEkle(({ where: wh, secimler: sec }) => { wh.birKismi(sec.ba, `${this.aliasVeNokta}bafl`) })
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); let {aliasVeNokta} = this;
		liste.push(new GridKolon({ belirtec: 'batext', text: 'B/A', genislikCh: 13, sql: BorcAlacak.getClause(`${aliasVeNokta}bafl`) }))
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments);
		let {tableAlias: alias} = this, {sahalar} = sent;
		sahalar.add(`${alias}.bafl ba`)
	}
}

class MQUretimIslem extends MQIslem {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'urtisl' }
	static kodListeTipi() { return 'URTISL' } static get sinifAdi() { return 'Üretim İşlem' }
}
