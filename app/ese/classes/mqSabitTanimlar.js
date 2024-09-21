class MQYetki extends MQGuidVeAdiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Yetki' }
	static get kodListeTipi() { return 'YETKI' } static get table() { return 'eseyetki' } static get tableAlias() { return 'yet' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { cpt: new PInstBitBool('bcptuygular'), ese: new PInstBitBool('beseuygular'), rapor: new PInstBitBool('btopluraporlar') }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'bcptuygular', text: 'CPT', genislikCh: 8 }).tipBool(), new GridKolon({ belirtec: 'beseuygular', text: 'ESE', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'btopluraporlar', text: 'Rapor', genislikCh: 8 }).tipBool()
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, alias = this.tableAlias;
		sent.sahalar.add(`${alias}.bcptuygular`, `${alias}.beseuygular`, `${alias}.btopluraporlar`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addBaslik('Yetkiler').addFormWithParent().yanYana(3).addStyle(e => `$elementCSS > div { margin-top: 8px !important }`);
		form.addCheckBox('cpt', 'CPT').addStyle_wh(100); form.addCheckBox('ese', 'ESE').addStyle_wh(100); form.addCheckBox('cpt', 'Toplu Raporlar').addStyle_wh(150)
	}
}
class MQUlke extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ülke' }
	static get kodListeTipi() { return 'ULKE' } static get table() { return 'eseulke' } static get tableAlias() { return 'ulk' }
}
class MQIl extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'İl' }
	static get kodListeTipi() { return 'IL' } static get table() { return 'eseil' } static get tableAlias() { return 'il' }
}
class MQYerlesim extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Yerleşim' }
	static get kodListeTipi() { return 'YERLESIM' } static get table() { return 'eseyerlesim' } static get tableAlias() { return 'yer' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { ilKod: new PInstStr('ilkod'), ulkeKod: new PInstStr('ulkekod') }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8, filterType: 'checkedlist' }), new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 20, sql: 'il.aciklama' }),
			new GridKolon({ belirtec: 'ulkekod', text: 'Ülke', genislikCh: 8, filterType: 'checkedlist' }), new GridKolon({ belirtec: 'ulkeadi', text: 'Ülke Adı', genislikCh: 20, sql: 'ulk.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, alias = this.tableAlias;
		sent.fromIliski('eseil il', `${alias}.ilkod = il.kod`).fromIliski('eseulke ulk', `${alias}.ulkekod = ulk.kod`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(2);
		form.addModelKullan('ilKod', 'İl').comboBox().setMFSinif(MQIl).addStyle_wh(300); form.addModelKullan('ulkeKod', 'Ülke').comboBox().setMFSinif(MQUlke).addStyle_wh(300)
	}
}
class MQKurum extends MQGuidVeAdiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Kurum' }
	static get kodListeTipi() { return 'KURUM' } static get table() { return 'esekurum' } static get tableAlias() { return 'kur' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			yerlesimKod: new PInstStr('yerlesimkod'), acikAdres: new PInstStr('acikadres'),
			erpKod: new PInstStr('erpkod'), anlasmaNox: new PInstStr('anlasmanox'), anlasmaTarihi: new PInstDateToday('anlasmatarihi')
		})
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e) /e.liste.push(
			new GridKolon({ belirtec: 'yerlesimkod', text: 'Yerleşim', genislikCh: 10, filterType: 'checkedlist' }), new GridKolon({ belirtec: 'yerlesimadi', text: 'Yerleşim Adı', genislikCh: 30, sql: 'yer.aciklama' }),
			new GridKolon({ belirtec: 'erpkod', text: 'ERP Kod', genislikCh: 16, filterType: 'checkedlist' }), new GridKolon({ belirtec: 'acikadres', text: 'Açık Adres' }),
			new GridKolon({ belirtec: 'anlasmanox', text: 'Anlaşma No', genislikCh: 13 }), new GridKolon({ belirtec: 'anlasmatarihi', text: 'Anlaşma Tarihi', genislikCh: 14 }).tipDate()
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, alias = this.tableAlias;
		sent.fromIliski('eseyerlesim yer', `${alias}.yerlesimkod = yer.kod`).fromIliski('carmst erp', `${alias}.erpkod = erp.must`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(2);
		form.addModelKullan('yerlesimKod', 'Yerleşim').comboBox().setMFSinif(MQYerlesim).addStyle_wh(300); form.addModelKullan('erpKod', 'ERP Kod').comboBox().setMFSinif(MQCari).addStyle_wh(400)
		form.addTextInput('anlasmaNox', 'Anlaşma No').addStyle_wh(350); form.addDateInput('anlasmaTarihi', 'Anlaşma Tarihi').addStyle_wh(180)
	}
}
class MQOkulTipi extends MQGuidVeAdiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Okul Tipi' }
	static get kodListeTipi() { return 'OKULTIPI' } static get table() { return 'eseil' } static get tableAlias() { return 'okt' }
}
class MQHasta extends MQGuidVeAdiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Hasta' } static get yakinSayi() { return 2 }
	static get kodListeTipi() { return 'HASTA' } static get table() { return 'esehasta' } static get tableAlias() { return 'has' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e, {yakinSayi} = this; $.extend(pTanim, {
			tcKimlikNo: new PInstStr('tcno'), okulTipId: new PInstGuid('okultipid'), tel: new PInstStr('tel'),
			yerlesimKod: new PInstStr('yerlesimkod'), acikAdres: new PInstStr('acikadres'), adres: new PInstStr('adres')
		});
		for (let i = 1; i <= yakinSayi; i++) {
			const KeyPrefix = `yakin${i}`; pTanim[`${KeyPrefix}Adi`] = new PInstStr(`${KeyPrefix}adi`);
			pTanim[`${KeyPrefix}Tel`] = new PInstStr(`${KeyPrefix}tel`); pTanim[`${KeyPrefix}Tipi`] = new PInstStr(`${KeyPrefix}tipi`);
		}
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e, {yakinSayi} = this; liste.push(
			new GridKolon({ belirtec: 'tcno', text: 'TC Kimlik No', genislikCh: 13 }),
			new GridKolon({ belirtec: 'okultipadi', text: 'Okul Tipi', genislikCh: 10, sql: 'okt.aciklama' }), new GridKolon({ belirtec: 'tel', text: 'Telefon', genislikCh: 10 }),
			new GridKolon({ belirtec: 'yerlesimkod', text: 'Yerleşim', genislikCh: 10, filterType: 'checkedlist' }), new GridKolon({ belirtec: 'yerlesimadi', text: 'Yerleşim Adı', genislikCh: 30, sql: 'yer.aciklama' }),
			new GridKolon({ belirtec: 'acikadres', text: 'Açık Adres' }), new GridKolon({ belirtec: 'adres', text: 'Adres' })
		);
		for (let i = 1; i <= yakinSayi; i++) {
			liste.push(
				new GridKolon({ belirtec: `yakin${i}adi`, text: `Yakın ${i} Adı`, genislikCh: 20 }),
				new GridKolon({ belirtec: `yakin${i}tel`, text: `Yakın ${i} Tel.`, genislikCh: 13 }),
				new GridKolon({ belirtec: `yakin${i}tipi`, text: `Yakın ${i} Tipi`, genislikCh: 10 })
			)
		}
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, alias = this.tableAlias;
		sent.fromIliski('eseokultipi okt', `${alias}.okultipid = okt.id`).fromIliski('eseyerlesim yer', `${alias}.yerlesimkod = yer.kod`);
		sent.sahalar.add(`${alias}.okultipid`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPanel, tabPage_genel} = e, {yakinSayi} = this;
		let form = tabPage_genel.addFormWithParent().yanYana(2); form.addTextInput('tcKimlikNo', 'T.C Kimlik No').setMaxLength(11).addStyle_wh(200);
		form.addModelKullan('okulTipId', 'Okul Tipi').comboBox().kodsuz().setMFSinif(MQOkulTipi).addStyle_wh(200); form.addModelKullan('yerlesimKod', 'Yerleşim').comboBox().setMFSinif(MQYerlesim).addStyle_wh(300);
		let tabPage_yakinlar = tabPanel.addTab('yakinlar', 'Yakınlar').altAlta();
		for (let i = 1; i <= yakinSayi; i++) {
			let form2 = tabPage_yakinlar.addFormWithParent().yanYana(3); form2.addTextInput(`yakin${i}Adi`, `Yakın ${i} Adı`);
			form2.addTextInput(`yakin${i}Tel`, `Yakın ${i} Tel.`).setMaxLength(13).addStyle_wh(250);
			form2.addTextInput(`yakin${i}Tipi`, `Yakın ${i} Tipi`).setMaxLength(10).addStyle_wh(200)
		}
		form = tabPage_genel.addFormWithParent().altAlta(); form.addTextArea('acikAdres', 'Açık Adres').setMaxLength(70).setRows(3)
	}
}
class MQDoktor extends MQGuidVeAdiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Doktor' }
	static get kodListeTipi() { return 'DOKTOR' } static get table() { return 'esedoktor' } static get tableAlias() { return 'dok' }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { tel: new PInstStr('tel'), tel2: new PInstStr('tel2'), kurumId: new PInstStr('kurumid') }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'tel', text: 'Telefon 1', genislikCh: 10 }), new GridKolon({ belirtec: 'tel2', text: 'Telefon 2', genislikCh: 10 }),
			new GridKolon({ belirtec: 'kurumadi', text: 'Kurum Adı', genislikCh: 25, filterType: 'checkedlist', sql: 'kur.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, alias = this.tableAlias;
		sent.fromIliski('esekurum kur', `${alias}.kurumid = kur.id`).fromIliski('eseyerlesim yer', `${alias}.yerlesimkod = yer.kod`);
		sent.sahalar.add(`${alias}.kurumid`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); const {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent().yanYana(2); form.addTextInput('tel', 'Telefon 1').setMaxLength(11).addStyle_wh(200); form.addTextInput('tel2', 'Telefon 2').setMaxLength(11).addStyle_wh(200);
		form.addModelKullan('kurumId', 'Kurum').comboBox().kodsuz().setMFSinif(MQKurum).addStyle_wh(300)
	}
}

