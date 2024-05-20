class MQStokListele extends MQKA {
	static get sinifAdi() {
		return 'Stok Grup'
	}
	static get table() {
		return 'stkgrup'
	}
	static get tableAlias() {
		return 'sgrp'
	}
	static get kodListeTipi() {
		return 'GRUP'
	}

	constructor(e) {
		e = e || {};
		super(e);
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);

		const {pTanim} = e;
		$.extend(pTanim, {
			kod: new PInstStr('kod'),
			anaGrupKod: new PInstStr('anagrupkod')//aciklama: new PInstStr('aciklama')
		})
	}

	static rootFormBuilderDuzenle(e) {
		e = e || {};
		super.rootFormBuilderDuzenle(e);

		const {tanimFormBuilder} = e;

		/*let form = tanimFormBuilder.addFormWithParent().yanYana(2);
		form.addModelKullan({ id: 'anaGrupKod', etiket: 'Ana Grup', mfSinif: MQStokAnaGrup }).dropDown();
		form.addTextInput({ etiket: 'deneme' })*/

		/*let form = tanimFormBuilder.addFormWithParent();
		form.yanYana(1);
		let modelKullan = form.addModelKullan({ id: 'anaGrupKod', etiket: 'Ana Grup', mfSinif: MQStokAnaGrup });
		modelKullan.dropDown()*/

		let form = tanimFormBuilder.addFormWithParent().yanYana(1);
		form.addModelKullan({
			id: 'anaGrupKod',
			etiket: 'Ana Grup',
			mfSinif: MQStokAnaGrup
		}).dropDown()

		/*this.formBuilder_addTabPanelWithGenelTab(e);
		const {tabPanel, tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(1);
		form.addModelKullan({ id: 'anaGrupKod', etiket: 'Ana Grup', mfSinif: MQStokAnaGrup }).dropDown()
		const tabPage_diger = tabPanel.addTab({ id: 'diger', etiket: 'Diğer' });
		tabPage_diger.addButton({ value: 'click me', handler: e => {
			displayMessage('butona tıklandı')
		} })*/

		/*let form_test = tanimFormBuilder.addFormWithParent().yanYana(1);
		let item_anaGrupKod = form_test.addModelKullan({ id: 'anaGrupKod', etiket: 'Ana Grup', mfSinif: MQStokAnaGrup }).dropDown();
		item_anaGrupKod.onChange(e => {
			const {builder} = e;
			builder.parentBuilder.id2Builder.anaGrupAdi.value = e.item.aciklama
		});
		let item_anaGrupAdi = form_test.addTextInput({ id: 'anaGrupAdi', etiket: 'Ana Grup Adı' });
		item_anaGrupAdi.onAfterRun(e => {
			const {input} = e.builder;
			input.attr('readonly', '');
			input.addClass('readOnly')
		})*/
	}

	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e);

		const {liste} = e;
		liste.push('anagrupkod', 'anagrupadi')
	}

	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);

		const {liste} = e;
		liste.push(new GridKolon({
			belirtec: 'kod',
			text: 'Kod',
			genislikCh: 10
		}), new GridKolon({
			belirtec: 'aciklama',
			text: 'Açıklama',
			genislikCh: 20
		}), new GridKolon({
			belirtec: 'anagrupkod',
			text: 'Ana Grup',
			genislikCh: 10
		}), new GridKolon({
			belirtec: 'anagrupadi',
			text: 'Ana Grup Adı',
			genislikCh: 20,
			sql: 'agrp.aciklama'
		}));
	}

	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.fromIliski('stkanagrup agrp', `${aliasVeNokta}anagrupkod = agrp.kod`);
		//sent.where.addAll(`stk.kod > ''`)	
	}

	tekilOku_queryDuzenle(e) {
		super.tekilOku_queryDuzenle(e);

		/*const {aliasVeNokta} = this;
		const {sent} = e;*/
	}
}
