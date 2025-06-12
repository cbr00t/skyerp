class MQLogin extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tableAlias() { return 'usr' }
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
	static getClass(e) {
		let loginTipi = typeof e == 'object' ? e.loginTipi ?? e.rec?.loginTipi : e;
		return this.tip2Sinif[loginTipi] ?? null
	}
	static newFor(e) { let cls = this.getClass(e); return cls ? new cls(e) : null }
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
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments);
		let {sifre} = this, md5sifre = sifre ? md5(sifre) : this._md5Sifre;
		if (md5sifre) { $.extend(hv, { md5sifre }) }
	}
	setValues({ rec }) {
		super.setValues(...arguments)
		let {md5sifre: _md5Sifre} = rec; $.extend(this, { _md5Sifre })
	}
	yetkiVarmi(e) {
		 e = typeof e == 'object' ? e : { islem: e };
		return this._yetkiVarmi(e)
	}
	_yetkiVarmi({ islem }) { return true }
	yetkiClauseDuzenle(e) {
		let wh = e.where ?? e.wh ?? e.sent?.where; if (!wh) { return this }
		let clauses = e.clauses ?? {};
		this._yetkiClauseDuzenle({ ...e, wh, clauses })
		return this
	}
	_yetkiClauseDuzenle({ wh, clauses }) { }
}
class MQLogin_Admin extends MQLogin {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'USRADMIN' } static get sinifAdi() { return 'Ana Kullanıcı' }
	static get table() { return 'yonetici' } static get adminmi() { return true }
}
class MQLogin_Bayi extends MQLogin {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'USRBAYI' } static get sinifAdi() { return 'Bayi' }
	static get table() { return 'bayi' } static get bayimi() { return true }
	static get yetkiSelectors() { return ['aktivasyonYap', 'aktivasyonSil', 'anahtarVer', 'demoSuresiSifirla'] }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			kisaKod: new PInstStr('kisakod'), tip: new PInstStr('tip'), sefmi: new PInstBitBool('bsefmi'),
			ilKod: new PInstStr('ilkod'), yore: new PInstStr('yore'), eMail: new PInstStr('email')
		});
		for (let ioAttr of this.yetkiSelectors) {
			let rowAttr = ioAttr.toLowerCase();
			pTanim[ioAttr] = new PInstBitBool(`byetki${rowAttr}`)
		}
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments); let {tableAlias: alias} = this;
		sec.addKA('il', MQVPIl, `${alias}.ilkod`, 'il.aciklama')
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); let {tanimFormBuilder: tanimForm, tabPage_genel: tabPage} = e;
		let form = tabPage.addFormWithParent().yanYana();
			form.addTextInput('kisaKod', 'Kısa Kod').setMaxLength(10).addStyle_wh(110);
			form.addTextInput('tip', 'Tip').setMaxLength(1).addStyle_wh(50);
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
		);
		for (let ioAttr of this.yetkiSelectors) {
			let belirtec = `b${ioAttr.toLowerCase()}`, text = ioAttr[0].toUpperCase() + ioAttr.slice(1);
			liste.push(new GridKolon({ belirtec, text, genislikCh: 10 }).tipBool())
		}
	}
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent }) {
		super.loadServerData_queryDuzenle(...arguments); let {tableAlias: alias} = this;
		sent.fromIliski(`${MQVPIl.table} il`, `${alias}.ilkod = il.kod`)
	}
	_yetkiVarmi({ islem }) {
		let {yetkiSelectors} = this.class;
		switch (islem) {
			case 'sil': return false
			default:
				let flag = yetkiSelectors.find(s => islem == s);
				if (flag == false) { return false }
		}
		return super._yetkiVarmi(...arguments)
	}
	_yetkiClauseDuzenle({ wh, clauses }) {
		super._yetkiClauseDuzenle(...arguments);
		{ let {bayi: kodClause} = clauses; if (clause) { wh.degerAta(this.kod, kodClause) } }
	}
}
class MQLogin_Musteri extends MQLogin {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'USRMUST' } static get sinifAdi() { return 'Müşteri' }
	static get table() { return 'musteri' } static get musterimi() { return true }
	static get yetkiSelectors() { return ['referanslisteyealma'] }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			tanitim: new PInstStr('tanitim'), bayiKod: new PInstStr('bayikod'), tip: new PInstStr('tip'),
			ilKod: new PInstStr('ilkod'), yore: new PInstStr('yore'), eMail: new PInstStr('email')
		});
		for (let ioAttr of this.yetkiSelectors) {
			let rowAttr = ioAttr.toLowerCase();
			pTanim[ioAttr] = new PInstBitBool(`b${rowAttr}`)
		}
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
		);
		for (let ioAttr of this.yetkiSelectors) {
			let belirtec = `b${ioAttr.toLowerCase()}`, text = ioAttr[0].toUpperCase() + ioAttr.slice(1);
			liste.push(new GridKolon({ belirtec, text, genislikCh: 10 }).tipBool())
		}
	}
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent }) {
		super.loadServerData_queryDuzenle(...arguments); let {tableAlias: alias} = this;
		sent.fromIliski(`${MQLogin_Bayi.table} bay`, `${alias}.bayikod = bay.kod`);
		sent.fromIliski(`${MQVPIl.table} il`, `${alias}.ilkod = il.kod`)
	}
	_yetkiVarmi({ islem }) {
		let {yetkiSelectors} = this.class;
		switch (islem) {
			case 'yeni': case 'degistir': case 'sil': case 'kopya': return false
			default:
				let flag = yetkiSelectors.find(s => islem == s);
				if (flag == false) { return false }
		}
		return super._yetkiVarmi(...arguments)
	}
	_yetkiClauseDuzenle({ wh, clauses }) {
		super._yetkiClauseDuzenle(...arguments);
		{ let {bayi: kodClause} = clauses; if (clause) { wh.degerAta(this.bayiKod, kodClause) } }
	}
}
