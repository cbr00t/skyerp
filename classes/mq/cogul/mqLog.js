class MQLog extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'VTLOG' } static get sinifAdi() { return 'Log Kayıtları' }
	static get table() { return 'vtlog' } static get tableAlias() { return 'log' } 
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...pTanim)
		/*$.extend(pTanim, { })*/
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e);
		this.formBuilder_addTabPanelWithGenelTab(e); let {tabPage_genel: tabPage} = e
		/*let form = tabPage_genel.addFormWithParent();
		form.addModelKullan({ id: 'anaGrupKod', etiket: 'Ana Grup', mfSinif: MQStokAnaGrup }).dropDown()*/
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); liste.push(
			new GridKolon({ belirtec: 'zaman', text: 'Zaman' }),
			new GridKolon({ belirtec: 'adimbelirtec', text: 'Adım' }),
			new GridKolon({ belirtec: 'anatip', text: 'Ana Tip' }),
			new GridKolon({ belirtec: 'islem', text: 'İşlem' }),
			new GridKolon({ belirtec: 'kullanici', text: 'Kullanıcı' }),
			new GridKolon({ belirtec: 'tablo', text: 'Tablo' }),
			new GridKolon({ belirtec: 'terminal', text: 'Terminal' }),
			new GridKolon({ belirtec: 'xbizsubekod', text: 'Şube' }),
			new GridKolon({ belirtec: 'xguid', text: 'GUID' }),
			new GridKolon({ belirtec: 'xiade', text: 'Iade?' }).tipBool(),
			new GridKolon({ belirtec: 'xislkod', text: 'İsl.Kod' }),
			new GridKolon({ belirtec: 'xkod', text: 'Kod' }),
			new GridKolon({ belirtec: 'xno', text: 'Bel.No' }),
			new GridKolon({ belirtec: 'xnoyil', text: 'No Yıl' }),
			new GridKolon({ belirtec: 'xozelisaret', text: 'İşr.' }),
			new GridKolon({ belirtec: 'xsayac', text: 'Sayaç(ID)' }),
			new GridKolon({ belirtec: 'xseri', text: 'Seri' }),
			new GridKolon({ belirtec: 'xtarih', text: 'Bel.Tarih' }),
			new GridKolon({ belirtec: 'xtip1', text: 'Tip 1' }),
			new GridKolon({ belirtec: 'xtip2', text: 'Tip 2' }),
			// new GridKolon({ belirtec: 'yedekislem', text: 'Yedek İşlem' }),
			new GridKolon({ belirtec: 'xdegisenler', text: 'Değişenler' })
		)
	}
	static loadServerData_queryDuzenle({ stm }) {
		super.loadServerData_queryDuzenle(...arguments);
		let {orderBy} = stm; orderBy.liste = ['zaman DESC']
		/*sent.fromIliski('stkanagrup agrp', 'sgrp.anagrupkod = agrp.kod');
		wh.icerikKisitDuzenle_stokGrup({ saha: aliasVeNokta + kodSaha })*/
	}
}
