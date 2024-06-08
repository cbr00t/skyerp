class MQStokGrupX extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Stok Grupları' }
	static get table() { return 'stkgrup' }
	static get tableAlias() { return 'sgrp' }
	static get kodListeTipi() { return 'STOKGRP' }

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

		const {tanimFormBuilder} = e;
		tanimFormBuilder.add(new FBuilder_TanimFormTabs({ id: 'tabPanel' }).add(
			new FBuilder_TabPage({ id: 'genel', etiket: 'Genel' }).add(
				new FBuilderWithInitLayout().yanYana(2).add(
					new FBuilder_ModelKullan({ id: 'anaGrupKod', etiket: 'Ana Grup', mfSinif: MQStokAnaGrup }).dropDown(),
					new FormBuilder({
						layout: e =>
							$(`<button>click me!</button>`),
						buildEk: e => {
							const btn = e.builder.layout;
							btn.jqxButton({ theme: theme, width: 100, height: 50 });
							btn.on('click', evt => displayMessage('butona tıklandı'))
						}
					}).autoAppend()
				)
			)
		))
	}

	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);
		
		const {secimler} = e;
		secimler.secimTopluEkle({
			anaGrupKod: new SecimString({ etiket: 'Ana Grup', mfSinif: MQStokAnaGrup }),
			anaGrupAdi: new SecimOzellik({ etiket: 'Ana Grup Adı' })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
			where.basiSonu(secimler.anaGrupKod, `${aliasVeNokta}anagrupkod`);
			where.ozellik(secimler.anaGrupAdi, `agrp.aciklama`)
		})
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e);
		e.liste.push('anagrupkod')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);

		const {aliasVeNokta} = this;
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 25, sql: `agrp.aciklama` })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);

		const {aliasVeNokta} = this;
		const {sent} = e;
		sent.fromIliski('stkanagrup agrp', `${aliasVeNokta}anagrupkod = agrp.kod`)
	}
};
