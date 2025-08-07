class MQMuhIslem extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tumKolonlarGosterilirmi() { return true }
	static get kodListeTipi() { return 'MUHISL' } static get sinifAdi() { return 'Muh. İşlem' }
	static get table() { return 'muhisl' } static get tableAlias() { return 'isl' }
	static async getKod2OzelIsaret() {
		let {globals} = this, {kod2OzelIsaret: result} = globals;
		if (!result) {
			result = globals.kod2OzelIsaret = {};
			let sent = new MQSent({ from: this.table, where: `kod <> ''`, sahalar: ['kod', 'ozelisaret'] });
			let recs = await app.sqlExecSelect({ query: sent });
			for (let {kod, ozelisaret} of recs) { result[kod] = ozelisaret }
		}
		return result
	}
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
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e);
		let {tabPage_genel: tabPage} = e; tabPage.yanYana(2);
		tabPage.addModelKullan('eDefterTipi', 'Tip').dropDown().kodsuz().noMF().autoBind().setSource(MQMuhIslemTipi.kaListe).addStyle_wh(150);
		tabPage.addModelKullan('ozelIsaret', 'Özel İşaret').dropDown().kodsuz().noMF().autoBind().setSource(MQOzelIsaret.kaListe).addStyle_wh(150)
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments);
		sec.secimTopluEkle({
			ozelIsaret: new SecimBirKismi({ etiket: 'İşaret', tekSecimSinif: MQOzelIsaret })
		});
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
			let {aliasVeNokta} = this;
			wh.birKismi(secimler.ozelIsaret.value, `${aliasVeNokta}ozelisaret`)
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments);
		liste.push(
			new GridKolon({ belirtec: 'edeftertipi', text: 'Tip', genislikCh: 8 }),
			new GridKolon({ belirtec: 'ozelisaret', text: 'İşr.', genislikCh: 8 })
		)
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

class MQStokIslem extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get tumKolonlarGosterilirmi() { return true }
	static get kodListeTipi() { return 'STKISL' } static get sinifAdi() { return 'Stok İşlem' }
	static get table() { return 'stkisl' } static get tableAlias() { return 'isl' }
	static async getKod2OzelIsaret() {
		let {globals} = this, {kod2OzelIsaret: result} = globals;
		if (!result) {
			result = globals.kod2OzelIsaret = {};
			let sent = new MQSent({ from: this.table, where: `kod <> ''`, sahalar: ['kod', 'ozelisaret'] });
			let recs = await app.sqlExecSelect({ query: sent });
			for (let {kod, ozelisaret} of recs) { result[kod] = ozelisaret }
		}
		return result
	}
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
		$.extend(pTanim, {
			tip: new PInstTekSecim('isltip', MQStokIslemTipi),
			ozelIsaret: new PInstTekSecim('ozelisaret', MQOzelIsaret)
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e);
		let {tabPage_genel: tabPage} = e; tabPage.yanYana(2);
		tabPage.addModelKullan('tip', 'Tip').dropDown().kodsuz().noMF().autoBind().setSource(MQStokIslemTipi.kaListe);
		tabPage.addModelKullan('ozelIsaret', 'Özel İşaret').dropDown().kodsuz().noMF().autoBind().setSource(MQOzelIsaret.kaListe).addStyle_wh(150);
			/*.setValue(({ builder: fbd }) => {
				let {rootPart, inst} = fbd;
				return rootPart.yenimi ? MQStokIslemTipi.defaultChar : inst.tip.char
			})*/
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments);
		sec.secimTopluEkle({
			tip: new SecimBirKismi({ etiket: 'Tip', tekSecimSinif: MQStokIslemTipi }),
			ozelIsaret: new SecimBirKismi({ etiket: 'İşaret', tekSecimSinif: MQOzelIsaret })
		});
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
			let {aliasVeNokta} = this;
			wh.birKismi(secimler.tip.value, `${aliasVeNokta}isltip`)
			wh.birKismi(secimler.ozelIsaret.value, `${aliasVeNokta}ozelisaret`)
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments);
		liste.push(
			new GridKolon({ belirtec: 'isltip', text: 'Tip', genislikCh: 8 }),
			new GridKolon({ belirtec: 'ozelisaret', text: 'İşr.', genislikCh: 8 })
		)
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
