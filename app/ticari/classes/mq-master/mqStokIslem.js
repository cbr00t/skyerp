class MQStokIslem extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Stok İşlem' }
	static get table() { return 'stkisl' }
	static get tableAlias() { return 'isl' }
	// static get tanimUISinif() { return MQStokIslemTanimPart }
	static get tanimUISinif() { return ModelTanimPart }
	
	static async getKod2OzelIsaret() {
		const {globals} = this;
		let result = globals.kod2OzelIsaret;
		if (!result) {
			result = globals.kod2OzelIsaret = {};
			const sent = new MQSent({
				from: this.table,
				where: `kod <> ''`,
				sahalar: ['kod', 'ozelisaret']
			});
			const recs = await app.sqlExecSelect({ query: sent });
			for (const rec of recs)
				result[rec.kod] = rec.ozelisaret;
		}
		return result;
	}

	get durumKod() {
		switch (this.tip.char) {
			case 'SG':
			case 'AF':
				return 'G';
			case 'SC':
			case 'TF':
				return 'C';
			case 'ST':
				return 'T';
		}
		return null;
	}
	

	constructor(e) {
		e = e || {};
		super(e);
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			tip: new PInstTekSecim('isltip', MQStokIslemTipi),
			ozelIsaret: new PInstTekSecim('ozelisaret', MQOzelIsaret)
		});
	}

	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);

		const {tanimFormBuilder} = e;
		tanimFormBuilder.add(new FBuilder_TanimFormTabs({ id: 'tabPanel' }).add(
			new FBuilder_TabPage({ id: 'genel', etiket: 'Genel' }).add(
				new FBuilderWithInitLayout().yanYana(2).add(
					new FBuilder_ModelKullan({ id: 'tip', etiket: 'Tip' })
						.dropDown().noMF()
						.setSource(e =>
							MQStokIslemTipi.instance.kaListe)
						.setValue(e => {
							const {builder} = e;
							const {rootPart, inst} = builder;
							return rootPart.yenimi ? MQStokIslemTipi.defaultChar : inst.tip.char
						}),
					new FBuilder_ModelKullan({ id: 'ozelIsaret', etiket: 'Özel İşaret' })
						.dropDown().noMF().kodGosterilmesin()
						.widgetArgsDuzenleIslemi(e =>
							e.args.dropDownHeight = 200)
						.setSource(e =>
							MQOzelIsaret.instance.kaListe)
						.setValue(e => {
							const {builder} = e;
							const {rootPart, inst} = builder;
							return rootPart.yenimi ? MQOzelIsaret.defaultChar : inst.ozelIsaret.char
						})
						.addStyle(e =>
							`${e.builder.getCSSElementSelector(e.builder.layout)} { max-width: 150px !important; }`
						)
				)
			)
		))
	}

	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);
		
		const {secimler} = e;
		/*secimler.grupTopluEkle([
			{ kod: 'grup', aciklama: 'Grup', renk: '#555', zeminRenk: 'lightgreen' }
		]);*/
		secimler.secimTopluEkle({
			tip: new SecimBirKismi({ etiket: 'Tip', tekSecimSinif: MQStokIslemTipi }),
			ozelIsaret: new SecimBirKismi({ etiket: 'İşaret', tekSecimSinif: MQOzelIsaret })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
			if (secimler.tip.value)
				where.birKismi(secimler.tip.value, `${aliasVeNokta}isltip`);
			if (secimler.ozelIsaret.value)
				where.birKismi(secimler.ozelIsaret.value, `${aliasVeNokta}ozelisaret`);
		});
	}

	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'isltip', text: 'Tip', genislikCh: 8 }),
			new GridKolon({ belirtec: 'ozelisaret', text: 'İşr', genislikCh: 8 })
		);
	}

	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent} = e;
		/* sent.fromIliski('isyeri sub', 'yer.bizsubekod = sub.kod'); */
	}

	tekilOku_queryDuzenle(e) {
		super.tekilOku_queryDuzenle(e);

		/*const {aliasVeNokta} = this;
		const {sent} = e;*/
	}

	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e);

		const {hv} = e;
		hv['durum'] = this.durumKod;
	}

	static partLayoutDuzenle(e) {
		e.dropDown = coalesce(e.dropDown, true);
		// e.kod = coalesce(e.kod, e.fis.islKod);
		return super.partLayoutDuzenle(e);
	}
}


class MQStokIslemTipi extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'TF' }
	
	kaListeDuzenle(e) {
		e.kaListe.push(...[
			new CKodVeAdi(['SG', 'Stok Giriş']),
			new CKodVeAdi(['SC', 'Stok Çıkış']),
			new CKodVeAdi(['ST', 'Stok Transfer']),
			new CKodVeAdi(['AF', 'Alım Fatura']),
			new CKodVeAdi(['TF', 'Satış Fatura'])
		])
	}
}
