class MQAnaGrupListele extends MQKA{
	static get sinifAdi() { return 'Stok Ana Grup' }
	static get table() { return 'stkanagrup' }
	static get tableAlias() { return 'agrp' }
	static get kodListeTipi() { return 'GRUP' }
	
	
	constructor(e) {
		e = e || {};
		super(e);
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			kod: new PInstStr('kod')
		})
	}

	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);
	
	}

	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'kod', text: 'Kod', genislikCh: 10 }),
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 20})
		);
	}

	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.where.addAll(`agrp.kod>''`);
		sent.fromIliski('stkanagrup agrp', 'sgrp.anagrupkod = agrp.kod');
	}

	tekilOku_queryDuzenle(e) {
		super.tekilOku_queryDuzenle(e);

		/*const {aliasVeNokta} = this;
		const {sent} = e;*/
	}
}

