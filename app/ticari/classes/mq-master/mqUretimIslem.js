class MQUretimIslem extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Üretim İşlem' }
	static get table() { return 'urtisl' }
	static get tableAlias() { return 'uisl' }
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
	

	constructor(e) {
		e = e || {};
		super(e);
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			ozelIsaret: new PInstTekSecim('ozelisaret', MQOzelIsaret)
		})
	}

	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);

		const {tanimFormBuilder} = e;
		tanimFormBuilder.add(new FBuilder_TanimFormTabs({ id: 'tabPanel' }).add(
			new FBuilder_TabPage({ id: 'genel', etiket: 'Genel' }).add(
				new FBuilderWithInitLayout().yanYana(2).add(
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
			ozelIsaret: new SecimBirKismi({ etiket: 'İşaret', tekSecimSinif: MQOzelIsaret })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
			if (secimler.ozelIsaret.value)
				where.birKismi(secimler.ozelIsaret.value, `${aliasVeNokta}ozelisaret`)
		});
	}

	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'ozelisaret', text: 'İşr', genislikCh: 8 })
		)
	}
}
