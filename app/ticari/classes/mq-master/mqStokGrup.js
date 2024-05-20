class MQStokGrup extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Stok Grup' }
	static get table() { return 'stkgrup' }
	static get tableAlias() { return 'sgrp' }
	static get kodListeTipi() { return 'GRUP' }
	
	
	constructor(e) {
		e = e || {};
		super(e);
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			anaGrupKod: new PInstStr('anagrupkod')
		})
	}

	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);

		this.formBuilder_addTabPanelWithGenelTab(e);
		const {tabPage_genel} = e;
		// let form = tabPage_genel.addFormWithParent().yanYana();
		let form = tabPage_genel.addFormWithParent();
		// tabPage_genel.addModelKullan('anaGrupKod', 'Ana Grup', undefined, MQStokAnaGrup).dropDown()
		form.addModelKullan({ id: 'anaGrupKod', etiket: 'Ana Grup', mfSinif: MQStokAnaGrup }).dropDown()
		
		/*let form2 = tabPage_genel.addFormWithParent();
		form2.addStyle_fullWH({ height: `calc(var(--full) - 160px)` });
		
		const grid = form2.addGridliGosterici('grid');
		grid
			.addStyle_fullWH()
			.setSource(e => [
				{ text: 'satır 1' },
				{ text: 'satır 2' }
			])
			.setTabloKolonlari(e => [
				new GridKolon({ belirtec: 'text', aciklama: ' ' })
			])
			.onAfterRun(e => {
				const gridPart = e.builder.part;
				gridPart.grid.on('rowclick', evt => {
					const rec = evt.args.row.bounddata;
					displayMessage(`<b>${rec.text}</b> yazan satıra tıklandı`, 'DEBUG')
				})
			})*/
	}

	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 15, sql: 'agrp.aciklama' })
		);
	}

	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.fromIliski('stkanagrup agrp', 'sgrp.anagrupkod = agrp.kod');
	}

	tekilOku_queryDuzenle(e) {
		super.tekilOku_queryDuzenle(e);

		/*const {aliasVeNokta} = this;
		const {sent} = e;*/
	}
}
