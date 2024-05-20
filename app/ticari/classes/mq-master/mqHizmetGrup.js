class MQHizmetGrup extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Hizmet Grup' }
	static get table() { return 'hizgrup' }
	static get tableAlias() { return 'hgrp' }
	static get tanimUISinif() { super.tanimUISinif  /*return MQHizmetGrupTanimPart*/ }
	static get silindiDesteklenirmi() { return true }
	static get kodListeTipi() { return 'HGRP' }
	
	
	constructor(e) {
		e = e || {};
		super(e);
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		/*$.extend(pTanim, {
			anaGrupKod: new PInstStr('anagrupkod')
		})*/;
	}

	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		
		const {liste} = e;
		/*liste.push(...[
			new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 15, sql: 'agrp.aciklama' })
		]);*/
	}

	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent} = e;
		// sent.fromIliski('stkanagrup agrp', 'sgrp.anagrupkod = agrp.kod');
	}

	tekilOku_queryDuzenle(e) {
		super.tekilOku_queryDuzenle(e);

		/*const {aliasVeNokta} = this;
		const {sent} = e;*/
	}
}
