class MQLogin extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tableAlias() { return 'usr' }
	static get yetkiSelectors() { return [] } static get yetkiRowAttrPrefix() { return 'b' } static get uygunmu() { return this != MQLogin }
	static get current() { return this._current } static set current(value) { this._current = value }
	static get tumKolonlarGosterilirmi() { return true } static get raporKullanilirmi() { return false }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi && MQLogin.current?.yetkiVarmi('tanimla') }
	static get silinebilirmi() { return super.silinebilirmi && MQLogin.current?.yetkiVarmi('sil') }
	static get kolonFiltreKullanilirmi() { return false }
	static get tip2Sinif() {
		let {_tip2Sinif: result} = this;
		if (result == null) {
			result = this._tip2Sinif = {
				admin: MQLogin_Admin, login: MQLogin_Admin, vio: MQLogin_Admin, normal: MQLogin_Admin,
				bayi: MQLogin_Bayi, musteri: MQLogin_Musteri 
			}
		}
		return result
	}
	get mevcutYetkiler() { return Object.entries(this.yetki).filter(x => x[1]).map(x => x[0]) }
	static getClass(e) {
		let loginTipi = typeof e == 'object' ? e.loginTipi ?? e.rec?.loginTipi : e;
		let Prefix = 'Login' ;if (loginTipi?.endsWith(Prefix)) { loginTipi = loginTipi.slice(0, -Prefix.length) }
		return this.tip2Sinif[loginTipi] ?? null
	}
	static newFor(e) { let cls = this.getClass(e); return cls ? new cls(e) : null }
	constructor(e) {
		e = e ?? {}; super(e); let {yetkiSelectors} = this.class;
		let yetki = this.yetki = e.yetki ?? {};
		for (let ioAttr of yetkiSelectors) {
			let rowAttr = ioAttr.toLowerCase();
			let value = e[ioAttr]; if (value != null) { yetki[ioAttr] = value }
		}
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, { sifre: new PInstStr(), aktifmi: new PInstTrue('aktifmi') })
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e);
		this.formBuilder_addTabPanelWithGenelTab(e); let {tabPage_genel: tabPage} = e;
		let form = tabPage.addFormWithParent().yanYana();
			form.addPassInput('sifre', 'Şifre').setMaxLength(36).addStyle_wh(500)
				.onBuildEk(({ builder: fbd }) => {
					let {input} = fbd;
					input.attr('autocomplete', 'new-password');
					input.attr('placeholder', 'Değiştirmek için Yeni bir şifre yazınız')
				});
			form.addCheckBox('aktifmi', 'Aktif?')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); let {yetkiSelectors, yetkiRowAttrPrefix} = this;
		liste.push(...[
			new GridKolon({ belirtec: 'aktifmi', text: 'Aktif?', genislikCh: 16 }).tipBool()
		]);
		for (let ioAttr of yetkiSelectors) {
			let belirtec = `${yetkiRowAttrPrefix}${ioAttr.toLowerCase()}`, text = ioAttr[0].toUpperCase() + ioAttr.slice(1);
			liste.push(new GridKolon({ belirtec, text, genislikCh: 10 }).tipBool())
		}
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments); let {yetkiSelectors, yetkiRowAttrPrefix} = this.class;
		let {sifre, yetki} = this, md5sifre = sifre ? md5(sifre) : this._md5Sifre;
		if (md5sifre) { $.extend(hv, { md5sifre }) };
		for (let ioAttr of yetkiSelectors) {
			let rowAttr = `${yetkiRowAttrPrefix}${ioAttr.toLowerCase()}`
			hv[rowAttr] = yetki[ioAttr]
		}
	}
	setValues({ rec }) {
		super.setValues(...arguments); let {yetkiSelectors, yetkiRowAttrPrefix} = this.class;
		let {md5sifre: _md5Sifre} = rec, {yetki} = this;
		$.extend(this, { _md5Sifre });
		for (let ioAttr of yetkiSelectors) {
			let rowAttr = `${yetkiRowAttrPrefix}${ioAttr.toLowerCase()}`
			let value = rec[rowAttr]; if (value != null) { yetki[ioAttr] = value }
		}
	}
	yetkiVarmi(e) {
		e = typeof e == 'object' && !$.isArray(e) ? e : { islem: e }; let {islem} = e;
		if (typeof islem == 'object' && !$.isArray(islem)) { islem = Object.keys(islem) }
		if ($.isArray(islem)) {
			for (let _islem of islem) {
				let result = this._yetkiVarmi({ ...e, islem: _islem });
				if (!result) { return false }
			}
			return true
		}
		return this._yetkiVarmi(e)
	}
	_yetkiVarmi({ islem }) { return islem && this.yetki[islem] != false }
	yetkiClauseDuzenle(e) {
		let wh = e.where ?? e.wh ?? e.sent?.where; if (!wh) { return this }
		let clauses = e.clauses ?? {}; this._yetkiClauseDuzenle({ ...e, wh, clauses });
		return this
	}
}
class MQLogin_Admin extends MQLogin {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return MQLogin.current.adminmi }
	static get kodListeTipi() { return 'USRADMIN' } static get sinifAdi() { return 'Ana Kullanıcı' }
	static get table() { return 'yonetici' } static get adminmi() { return true }
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent }) {
		super.loadServerData_queryDuzenle(...arguments); let {tableAlias: alias, kodSaha} = this, {where: wh} = sent;
		if (!MQLogin.current.adminmi) { wh.add('1 = 2') }
		else { let clauses = { bayi: `${alias}.${kodSaha}` }; MQLogin.current.yetkiClauseDuzenle({ sent, clauses }) }
	}
}
class MQLogin_Bayi extends MQLogin {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return !MQLogin.current.musterimi }
	static get kodListeTipi() { return 'USRBAYI' } static get sinifAdi() { return 'Bayi' }
	static get table() { return 'bayi' } static get bayimi() { return true } static get yetkiRowAttrPrefix() { return 'byetki' }
	static get yetkiSelectors() { return [...super.yetkiSelectors, 'aktivasyonYap', 'aktivasyonSil', 'anahtarVer', 'demoSureSifirla'] }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			kisaKod: new PInstStr('kisakod'), tip: new PInstStr('tip'), sefmi: new PInstBitBool('bsefmi'),
			ilKod: new PInstStr('ilkod'), yore: new PInstStr('yore'), eMail: new PInstStr('email')
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments); let {tableAlias: alias} = this;
		sec.addKA('il', MQVPIl, `${alias}.ilkod`, 'il.aciklama')
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); let {tanimFormBuilder: tanimForm, tabPage_genel: tabPage} = e;
		tabPage.builders[tabPage.builders.length - 1].addCheckBox('sefmi', 'Şef');
		let form = tabPage.addFormWithParent().yanYana();
			form.addTextInput('kisaKod', 'Kısa Kod').setMaxLength(10).addStyle_wh(110);
			form.addTextInput('tip', 'Tip').setMaxLength(1).addStyle_wh(50)
		form = tabPage.addFormWithParent().yanYana();
			form.addModelKullan('ilkod', 'İl').dropDown().setMFSinif(MQVPIl).autoBind().kodsuz().addStyle_wh(250);
			form.addTextInput('yore', 'Yöre').setMaxLength(25).addStyle_wh(250);
			form.addTextInput('email', 'e-Mail').setMaxLength(25).addStyle_wh(250)
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments);
		liste.push(
			new GridKolon({ belirtec: 'kisakod', text: 'Kısa Kod', genislikCh: 10 }),
			new GridKolon({ belirtec: 'tip', text: 'Tip', genislikCh: 8 }),
			new GridKolon({ belirtec: 'bsefmi', text: 'Sef?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8 }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 20, sql: 'il.aciklama' }),
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 15 }),
			new GridKolon({ belirtec: 'email', text: 'e-Mail', genislikCh: 40 })
		)
	}
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent }) {
		super.loadServerData_queryDuzenle(...arguments); let {tableAlias: alias, kodSaha} = this, {where: wh} = sent;
		sent.fromIliski(`${MQVPIl.table} il`, `${alias}.ilkod = il.kod`);
		if (MQLogin.current.musterimi) { wh.add('1 = 2') }
		else { let clauses = { bayi: `${alias}.${kodSaha}` }; MQLogin.current.yetkiClauseDuzenle({ sent, clauses }) }
	}
	_yetkiVarmi({ islem }) {
		switch (islem) { case 'sil': return false }
		return super._yetkiVarmi(...arguments)
	}
	_yetkiClauseDuzenle({ wh, clauses }) {
		if (!this.sefmi) { let {bayi: kodClause} = clauses; if (kodClause) { wh.degerAta(this.kod, kodClause) } }
	}
}
class MQLogin_Musteri extends MQLogin {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'USRMUST' } static get sinifAdi() { return 'Müşteri' }
	static get table() { return 'musteri' } static get musterimi() { return true }
	static get yetkiSelectors() { return [...super.yetkiSelectors, 'referanslisteyealma'] }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			tanitim: new PInstStr('tanitim'), bayiKod: new PInstStr('bayikod'), tip: new PInstStr('tip'),
			ilKod: new PInstStr('ilkod'), yore: new PInstStr('yore'), eMail: new PInstStr('email')
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments); let {tableAlias: alias} = this;
		sec.addKA('il', MQVPIl, `${alias}.ilkod`, 'il.aciklama')
		   .addKA('bayi', MQLogin_Bayi, `${alias}.bayikod`, 'bay.aciklama')
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); let {tanimFormBuilder: tanimForm, tabPage_genel: tabPage} = e;
		let form = tabPage.addFormWithParent().yanYana();
			form.addModelKullan('bayiKod', 'Bayi').comboBox().setMFSinif(MQLogin_Bayi).autoBind();
			form.addTextInput('tip', 'Tip').setMaxLength(1).addStyle_wh(50);
		form = tabPage.addFormWithParent().yanYana();
			form.addTextInput('tanitim', 'Tanıtım').setMaxLength(39).addCSS('center');
		form = tabPage.addFormWithParent().yanYana();
			form.addModelKullan('ilkod', 'İl').dropDown().setMFSinif(MQVPIl).autoBind().kodsuz().addStyle_wh(250);
			form.addTextInput('yore', 'Yöre').setMaxLength(25).addStyle_wh(250);
			form.addTextInput('email', 'e-Mail').setMaxLength(25).addStyle_wh(250);
		form = tabPage.addFormWithParent().altAlta();
			form.addTextArea('ekbilgi', 'Ek Bilgi').setRows(5).setMaxLength(300)
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments);
		liste.push(
			new GridKolon({ belirtec: 'bayikod', text: 'Bayi Kod', genislikCh: 10 }),
			new GridKolon({ belirtec: 'bayiadi', text: 'Bayi Adı', genislikCh: 30, sql: 'bay.aciklama' }),
			new GridKolon({ belirtec: 'tip', text: 'Tip', genislikCh: 8 }),
			new GridKolon({ belirtec: 'tanitim', text: 'Tanıtım', genislikCh: 45 }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8 }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 25, sql: 'il.aciklama' }),
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 15 }),
			new GridKolon({ belirtec: 'email', text: 'e-Mail', genislikCh: 40 }),
			new GridKolon({ belirtec: 'ekbilgi', text: 'Ek Bilgi', genislikCh: 100 })
		)
	}
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent }) {
		super.loadServerData_queryDuzenle(...arguments); let {tableAlias: alias} = this;
		sent.fromIliski(`${MQLogin_Bayi.table} bay`, `${alias}.bayikod = bay.kod`)
			.fromIliski(`${MQVPIl.table} il`, `${alias}.ilkod = il.kod`);
		let clauses = { bayi: `${alias}.bayikod` }; MQLogin.current.yetkiClauseDuzenle({ sent, clauses })
	}
	_yetkiVarmi({ islem }) {
		switch (islem) { case 'tanimla': case 'yeni': case 'degistir': case 'sil': case 'kopya': return false }
		return super._yetkiVarmi(...arguments)
	}
	_yetkiClauseDuzenle({ wh, clauses }) {
		super._yetkiClauseDuzenle(...arguments);
		{ let {bayi: kodClause} = clauses; if (kodClause) { wh.degerAta(this.bayiKod, kodClause) } }
	}
}
