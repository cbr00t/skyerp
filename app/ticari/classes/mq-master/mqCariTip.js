class MQCariTip extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Cari Tip' }
	static get table() { return 'cartip' }
	static get tableAlias() { return 'car' }
	static get kodListeTipi() { return 'ANAGRUP' }
	
	
	constructor(e) {
		e = e || {};
		super(e)
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			satMusTip: new PInstStr('satmustip')
		})
	}

	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
		const tanimForm = e.tanimFormBuilder;
		let form = tanimForm.addFormWithParent();
		form.yanYana(2);
		form.addSwitchButton({ id:'satMusTip', onLabel: 'Satıcı', offLabel: 'Musteri' })
			.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.input)} .jqx-switchbutton-label-on { background-color: forestgreen }`)
			.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.input)} .jqx-switchbutton-label-off { background-color: red }`)
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'kod', text: 'Kod', genislikCh: 8 }),
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 15 })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.where.add(`car.kod>''`)
	}
}

