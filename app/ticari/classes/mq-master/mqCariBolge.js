class MQCariBolge extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() {return 'Cari Bölge' }
	static get table() {return 'carbolge' }
	static get tableAlias() {return 'cbol' }
	static get kodListeTipi() {return 'CARBOLGE' }

	constructor(e) {
		e = e || {};
		super(e)
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);

		const {pTanim} = e;
		$.extend(pTanim, {
			anaBolgeKod: new PInstStr('anabolgekod')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		const tanimForm = e.tanimFormBuilder;
		let form = tanimForm.addFormWithParent().yanYana(2);
		form.addModelKullan({
			id: 'anaBolgeKod',
			etiket: 'Ana Bolge',
			mfSinif: MQCariAnaBolge
		}).dropDown()
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e);
		const {liste} = e;
		liste.push('anabolgekod', 'anabolgeadi')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'anabolgekod', text: 'Ana Bölge Kodu', genislikCh: 8 }),
			new GridKolon({ belirtec: 'anabolgeadi', text: 'Ana Bölge Adı', genislikCh: 20, sql: 'cab.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.fromIliski('caranabolge cab', `${aliasVeNokta}anabolgekod = cab.kod`)
	}
}
