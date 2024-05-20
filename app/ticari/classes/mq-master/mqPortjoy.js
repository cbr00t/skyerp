class MQPortfoy extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Portföy' }
	static get table() { return 'csportfoy' }
	static get tableAlias() { return 'prt' }
	static get kodListeTipi() { return 'PORTFOY' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		const {pTanim} = e;
		$.extend(pTanim, {
			ozelIsaret: new PInstTekSecim('ozelisaret', MQOzelIsaret),
			csTip: new PInstTekSecim('cstip', CSBelgeTipi),
			dvTipi: new PInstStr('dvtipi'),
			muhHesap: new PInstStr('muhhesap'),
			finAnalizKullanilmazmi: new PInstBool('finanalizkullanilmaz')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e);
		const tanimForm = e.tanimFormBuilder;
		let form = tanimForm.addFormWithParent().yanYana(6);
		form.addModelKullan('ozelIsaret', 'Özel İşaret').setSource(e.builder.inst.ozelIsaret.kaListe).noMF().dropDown().kodsuz()
		form.addModelKullan('csTip', 'Belge Tipi').setSource(e.builder.inst.csTip.kaListe).noMF().dropDown().kodsuz()
		form.addModelKullan('dvTipi', 'Döviz').setMFSinif(MQDoviz).dropDown().kodsuz();
		form.addModelKullan('muhHesap', 'Muhasebe Kodu').setMFSinif(MQMuhHesap).dropDown().kodsuz();
		form.addCheckBox('finAnalizKullanilmazmi', 'Finansal Analizlerde Gösteril<u>MEZ</u>')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e, {aliasVeNokta} = this;
		liste.push(
			new GridKolon({ belirtec: 'bizsubekod', text: 'Biz. Sube Kod', genislikCh: 10 }),
			new GridKolon({ belirtec: 'ozelisaret', text: 'Özel İşaret', genislikCh: 5 }),
			new GridKolon({ belirtec: 'cstiptext', text: 'CS Tip', genislikCh: 10, sql: BelgeTipi.clause(`${aliasVeNokta}cstip`) }),
			new GridKolon({ belirtec: 'dvtipi', text: 'Dv.Tipi', genislikCh: 10 }),
			new GridKolon({ belirtec: 'finanalizkullanilmaz', text: 'Fin. Analiz Kullanılmaz', genislikCh: 5 }).tipBool(),
			new GridKolon({ belirtec: 'muhhesap', text: 'Muh. Hesap Kod', genislikCh: 10 })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta} = this; const {sent} = e;
		sent.sahalar.add(`${aliasVeNokta}cstip`)
	}
}
