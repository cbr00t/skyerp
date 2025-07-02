class MQLogin extends MQKA {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tableAlias() { return 'usr' }
	static get yetkiSelectors() { return [] } static get yetkiRowAttrPrefix() { return 'b' } static get uygunmu() { return this != MQLogin }
	static get current() { return this._current } static set current(value) { this._current = value }
	static get tumKolonlarGosterilirmi() { return true } static get raporKullanilirmi() { return false } static get kolonFiltreKullanilirmi() { return false }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi && MQLogin.current?.yetkiVarmi('tanimla') }
	static get silinebilirmi() { return super.silinebilirmi && MQLogin.current?.yetkiVarmi('sil') }
	static get adminmi() { return false } static get bayimi() { return false } static get musterimi() { return false }
	get adminmi() { return this.class.adminmi } get bayimi() { return this.class.bayimi } get musterimi() { return this.class.musterimi }
	static get sifreGirilirmi() { return true }
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
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments); let {tableAlias: alias} = this;
		sec.grupTopluEkle([ { kod: 'genel', etiket: 'Genel', kapali: false } ]);
		sec.secimTopluEkle({
			aktifSecim: new SecimTekSecim({ etiket: 'Aktiflik', tekSecim: new AktifVeDevreDisi().bu() })
		})
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
			let {tekSecim: aktifSecim} = sec.aktifSecim;
			wh.birlestir(aktifSecim.getBoolClause(`${alias}.aktifmi`))
		})
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); let {tabPage_genel: tabPage} = e;
		let form = tabPage.addFormWithParent().yanYana();
			form.addPassInput('sifre', 'Şifre').setMaxLength(36).addStyle_wh(500)
				.onBuildEk(({ builder: fbd }) => {
					let {input} = fbd;
					input.attr('autocomplete', 'new-password');
					input.attr('placeholder', 'Değiştirmek için Yeni bir şifre yazınız')
				})
				.setVisibleKosulu(({ builder: fbd }) => this.sifreGirilirmi);
			form.addCheckBox('aktifmi', 'Aktif?')
	}
	static rootFormBuilderDuzenleSonrasi(e) {
		super.rootFormBuilderDuzenleSonrasi(e); let {yetkiSelectors} = this, {tabPanel} = e;
		if (yetkiSelectors?.length) {
			let tabPage = e.tabPage_yetki = tabPanel.addTab('yetki', 'Yetki');
			let form = tabPage.addFormWithParent().yanYana(2).setAltInst(({ builder: fbd }) => fbd.inst.yetki);
			for (let ioAttr of yetkiSelectors) { form.addCheckBox(ioAttr, ioAttr) }
		}
	}
	static ekCSSDuzenle({ rec, result }) {
		super.ekCSSDuzenle(...arguments);
		if (!rec.aktifmi) { result.push('bg-lightgray', 'iptal', 'firebrick') }
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); let {yetkiSelectors, yetkiRowAttrPrefix} = this;
		liste.push(...[
			new GridKolon({ belirtec: 'aktifmi', text: 'Aktif?', genislikCh: 13 }).tipBool()
		]);
		for (let ioAttr of yetkiSelectors) {
			let belirtec = `${yetkiRowAttrPrefix}${ioAttr.toLowerCase()}`, text = ioAttr[0].toUpperCase() + ioAttr.slice(1);
			liste.push(new GridKolon({ belirtec, text, genislikCh: 10 }).tipBool())
		}
	}
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent }) {
		super.loadServerData_queryDuzenle(...arguments);
		let {tableAlias: alias, kodSaha} = this, {where: wh, sahalar, alias2Deger} = sent, {orderBy} = stm;
		sahalar.add(`${alias}.aktifmi`)
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments); let {yetkiSelectors, yetkiRowAttrPrefix} = this.class;
		let {sifre, yetki} = this, md5sifre = sifre ? md5(sifre) : this._md5Sifre;
		if (md5sifre) { $.extend(hv, { md5sifre }) };
		for (let ioAttr of yetkiSelectors) {
			let rowAttr = `${yetkiRowAttrPrefix}${ioAttr.toLowerCase()}`
			hv[rowAttr] = yetki[ioAttr] ?? false
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
	_yetkiClauseDuzenle({ wh, clauses }) { }
}
class MQLogin_Admin extends MQLogin {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return MQLogin.current.adminmi }
	static get kodListeTipi() { return 'USRADMIN' } static get sinifAdi() { return 'Ana Kullanıcı' }
	static get table() { return 'yonetici' } static get adminmi() { return true }
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent, basit }) {
		super.loadServerData_queryDuzenle(...arguments); let {tableAlias: alias, kodSaha} = this, {where: wh} = sent;
		if (!(basit || MQLogin.current.adminmi)) { wh.add('1 = 2') }
	}
}
class MQLogin_Bayi extends MQLogin {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return !MQLogin.current.musterimi }
	static get kodListeTipi() { return 'USRBAYI' } static get sinifAdi() { return 'Bayi' } static get bayimi() { return true }
	static get table() { return 'bayi' } static get yetkiRowAttrPrefix() { return 'byetki' }
	static get yetkiSelectors() { return [...super.yetkiSelectors, 'aktivasyonYap', 'aktivasyonSil', 'anahtarVer', 'demoSureSifirla'] }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			kisaKod: new PInstStr('kisakod'), tip: new PInstStr('tip'), sefmi: new PInstBitBool('bsefmi'),
			anaBayiKod: new PInstStr('anabayikod'), ilKod: new PInstStr('ilkod'),
			yore: new PInstStr('yore'), eMail: new PInstStr('email')
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments); let {tableAlias: alias} = this;
		sec.addKA('il', MQVPIl, `${alias}.ilkod`, 'il.aciklama');
		sec.addKA('anaBayi', MQVPAnaBayi, `${alias}.anabayikod`, 'abay.aciklama')
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); let {tanimFormBuilder: tanimForm, tabPage_genel: tabPage} = e;
		tabPage.builders[tabPage.builders.length - 1].addCheckBox('sefmi', 'Şef');
		let form = tabPage.addFormWithParent().yanYana();
			form.addTextInput('kisaKod', 'Kısa Kod').setMaxLength(10).addStyle_wh(110);
			form.addTextInput('tip', 'Tip').setMaxLength(1).addStyle_wh(50)
			form.addModelKullan('anaBayiKod', 'Ana Bayi').dropDown().setMFSinif(MQVPAnaBayi).autoBind().kodsuz().addStyle_wh(250);
		form = tabPage.addFormWithParent().yanYana();
			form.addModelKullan('ilKod', 'İl').dropDown().setMFSinif(MQVPIl).autoBind().kodsuz().addStyle_wh(250);
			form.addTextInput('yore', 'Yöre').setMaxLength(25).addStyle_wh(250);
			form.addTextInput('eMail', 'e-Mail').setMaxLength(50).addStyle_wh(500)
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments);
		liste.push(
			new GridKolon({ belirtec: 'kisakod', text: 'Kısa Kod', genislikCh: 10 }),
			new GridKolon({ belirtec: 'tip', text: 'Tip', genislikCh: 8 }),
			new GridKolon({ belirtec: 'bsefmi', text: 'Sef?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'anabayikod', text: 'Ana Bayi', genislikCh: 8, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'anabayiadi', text: 'Ana Bayi Adı', genislikCh: 20, sql: 'abay.aciklama', filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8 }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 20, sql: 'il.aciklama' }),
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 15 }),
			new GridKolon({ belirtec: 'email', text: 'e-Mail', genislikCh: 40 })
		)
	}
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent, basit }) {
		super.loadServerData_queryDuzenle(...arguments); let {tableAlias: alias, kodSaha} = this, {from, where: wh, sahalar} = sent;
		sent.fromIliski(`${MQVPIl.table} il`, `${alias}.ilkod = il.kod`);
		sahalar.add(`${alias}.bsefmi`);
		if (!basit) {
			sent.leftJoin(alias, `${MQVPAnaBayi.table} abay`, `${alias}.anabayikod = abay.kod`);
			if (MQLogin.current.musterimi) { wh.add('1 = 2') }
			else {
				let clauses = { bayi: `${alias}.${kodSaha}`, anaBayi: `${alias}.anabayikod` };
				MQLogin.current.yetkiClauseDuzenle({ sent, clauses })
			}
		}
	}
	_yetkiVarmi({ islem }) {
		switch (islem) { case 'sil': return false }
		return super._yetkiVarmi(...arguments)
	}
	_yetkiClauseDuzenle({ wh, clauses }) {
		super._yetkiClauseDuzenle(...arguments);
		if (!this.sefmi) {
			if (this.kod) { let {bayi: kodClause} = clauses; if (kodClause) { wh.degerAta(this.kod, kodClause) } }
			if (this.anaBayiKod) { let {anaBayi: kodClause} = clauses; if (kodClause) { wh.degerAta(this.anaBayiKod, kodClause) } }
		}
	}
}
class MQLogin_Musteri extends MQLogin {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'USRMUST' } static get sinifAdi() { return 'Müşteri' }
	static get table() { return 'musteri' } static get musterimi() { return true }
	static get sifreGirilirmi() { return false }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			tanitim: new PInstStr('tanitim'), bayiKod: new PInstStr('bayikod'), tip: new PInstStr('tip'),
			refListeyeAlinmazmi: new PInstBitTrue('breferanslisteyealma'), ilKod: new PInstStr('ilkod'),
			yore: new PInstStr('yore'), eMail: new PInstStr('email'), firmaTelefon: new PInstStr('firmatelefon'),
			vkn: new PInstStr('vkn'), vergiDaire: new PInstStr('vdaire'), yaptigiIs: new PInstStr('yaptigiis'),
			yetkiliKisi: new PInstStr('yetkilikisi'), yetkiliTelefon: new PInstStr('yetkilitelefon'),
			adres1: new PInstStr('adres1'), adres2: new PInstStr('adres2')
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments); let {tableAlias: alias} = this;
		sec.addKA('il', MQVPIl, `${alias}.ilkod`, 'il.aciklama')
		   .addKA('bayi', MQLogin_Bayi, `${alias}.bayikod`, 'bay.aciklama');
		sec
			.secimTopluEkle({ vkn: new SecimOzellik({ etiket: 'VKN' }) })
			.whereBlockEkle(({ secimler: sec, where: wh }) => { wh.ozellik(sec.vkn, `${alias}.vkn`) })
	}
	static rootFormBuilderDuzenleSonrasi_listeEkrani(e) {
		super.rootFormBuilderDuzenleSonrasi_listeEkrani(e); let {rootBuilder: rfb} = e;
		this.fbd_listeEkrani_addButton(rfb, 'kontorMenu', '...', 50, e => this.kontorMenuIstendi(e))
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); let {tanimFormBuilder: tanimForm, tabPage_genel: tabPage} = e;
		let form = tabPage.builders[tabPage.builders.length - 1];
			form.addCheckBox('refListeyeAlinmazmi', 'Ref. Listeye AlınMAz');
		form = tabPage.addFormWithParent().yanYana(2);
			form.addModelKullan('bayiKod', 'Bayi').comboBox().setMFSinif(MQLogin_Bayi).autoBind().addStyle_wh(500);
			form.addTextInput('tanitim', 'Tanıtım').setMaxLength(39).addCSS('center').addStyle_wh(550);
			form.addTextInput('tip', 'Tip').setMaxLength(2).addStyle_wh(100).addCSS('center');    /* .addStyle(`$elementCSS { margin-left: 10px !important }`) */
		form = tabPage.addFormWithParent().yanYana();
			form.addModelKullan('ilKod', 'İl').dropDown().setMFSinif(MQVPIl).autoBind().kodsuz().addStyle_wh(250);
			form.addTextInput('yore', 'Yöre').setMaxLength(25).addStyle_wh(250);
			form.addTextInput('eMail', 'e-Mail').setMaxLength(50).addStyle_wh(500);
			form.addTextInput('vkn', 'VKN').setMaxLength(11).addStyle_wh(150).addCSS('center');
			form.addTextInput('vergiDaire', 'V.Daire').setMaxLength(25).addStyle_wh(300)
		form = tabPage.addFormWithParent().yanYana();
			form.addTextInput('firmaTelefon', 'Firma Telefon').setMaxLength(13).addStyle_wh(200);
			form.addTextInput('yetkiliKisi', 'Yetkili Kişi').setMaxLength(50).addStyle_wh(300);
			form.addTextInput('yetkiliTelefon', 'Yetkili Telefon').setMaxLength(13).addStyle_wh(200);
			form.addTextInput('yaptigiIs', 'Yaptığı İş').setMaxLength(100).addStyle_wh(450)
		form = tabPage.addFormWithParent().yanYana();
			form.addTextInput('adres1', 'Adres 1').addStyle_wh(800);
			form.addTextInput('adres2', 'Adres 2').addStyle_wh(800)
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments);
		liste.push(
			new GridKolon({ belirtec: 'bayikod', text: 'Bayi Kod', genislikCh: 10 }),
			new GridKolon({ belirtec: 'bayiadi', text: 'Bayi Adı', genislikCh: 30, sql: 'bay.aciklama' }),
			new GridKolon({ belirtec: 'tanitim', text: 'Tanıtım', genislikCh: 45 }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8 }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 25, sql: 'il.aciklama' }),
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 15 }),
			new GridKolon({ belirtec: 'email', text: 'e-Mail', genislikCh: 40 }),
			new GridKolon({ belirtec: 'vkn', text: 'VKN', genislikCh: 13 }),
			new GridKolon({ belirtec: 'vdaire', text: 'V.D', genislikCh: 25 }),
			new GridKolon({ belirtec: 'anabayikod', text: 'Ana Bayi Kod', genislikCh: 10, sql: 'bay.anabayikod' }),
			new GridKolon({ belirtec: 'anabayiadi', text: 'Ana Bayi Adı', genislikCh: 30, sql: 'abay.aciklama' }),
			new GridKolon({ belirtec: 'firmatelefon', text: 'Firma Telefon', genislikCh: 20 }),
			new GridKolon({ belirtec: 'yetkilikisi', text: 'Yetkili Kişi', genislikCh: 50 }),
			new GridKolon({ belirtec: 'yetkilitelefon', text: 'Yetkili Telefon', genislikCh: 20 }),
			new GridKolon({ belirtec: 'yaptigiis', text: 'Yaptığı İş', genislikCh: 80 }),
			new GridKolon({ belirtec: 'breferanslisteyealma', text: 'Ref.AlınMAz', genislikCh: 13 }).tipBool(),
			new GridKolon({ belirtec: 'tip', text: 'Tip', genislikCh: 8 }),
			new GridKolon({ belirtec: 'adres1', text: 'Adres 1', genislikCh: 70 }),
			new GridKolon({ belirtec: 'adres2', text: 'Adres 2', genislikCh: 70 }),
			new GridKolon({ belirtec: 'ekbilgi', text: 'Ek Bilgi', genislikCh: 150 })
		)
	}
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent, basit }) {
		super.loadServerData_queryDuzenle(...arguments); let {tableAlias: alias} = this;
		sent.fromIliski(`${MQLogin_Bayi.table} bay`, `${alias}.bayikod = bay.kod`);
		/*sent.fromIliski(`${MQVPAnaBayi.table} abay`, 'bay.anabayikod = abay.kod');*/
		sent.fromIliski(`${MQVPIl.table} il`, `${alias}.ilkod = il.kod`);
		if (!basit) {
			sent.leftJoin('bay', `${MQVPAnaBayi.table} abay`, 'bay.anabayikod = abay.kod');
			let clauses = { bayi: `${alias}.bayikod`, musteri: `${alias}.kod` };
			MQLogin.current.yetkiClauseDuzenle({ sent, clauses })
		}
	}
	async dataDuzgunmu(e) {
		let result = await super.dataDuzgunmu(e);
		if (result && result != true) { return result }
		let errors = [], {vkn} = this, vknLen = vkn?.length ?? 0;
		let fakeVKNmi = vkn == '0000000000' || vkn == '00000000000';
		if (!this.kod) { errors.push(`<b>Kod</b> boş olamaz`) }
		if (this.aciklama?.length <= 4) { errors.push(`<b>Ünvan</b> değeri geçersizdir`) }
		if (!/^[A-F0-9]{4}(-[A-F0-9]{4}){7}$/.test(this.tanitim)) { errors.push(`<b>Tanıtım</b> değeri geçersizdir`) }
		if (this.vergiDaire?.length <= 3) { errors.push(`<b>Vergi Dairesi</b> değeri geçersizdir`) }
		if (!(fakeVKNmi || VergiVeyaTCKimlik.uygunmu(vkn))) { errors.push(`<b>VKN</b> değeri geçersizdir`) }
		
		return errors.length ? `<ul>${errors.map(x => `<li>${x}</li>`).join(CrLf)}</ul>` : null
	}
	_yetkiVarmi({ islem }) {
		switch (islem) { case 'tanimla': case 'yeni': case 'degistir': case 'sil': case 'kopya': return false }
		return super._yetkiVarmi(...arguments)
	}
	_yetkiClauseDuzenle({ wh, clauses }) {
		super._yetkiClauseDuzenle(...arguments);
		if (this.kod) { let {musteri: kodClause} = clauses; if (kodClause) { wh.degerAta(this.kod, kodClause) } }
		if (this.bayiKod) { let {bayi: kodClause} = clauses; if (kodClause) { wh.degerAta(this.bayiKod, kodClause) } }
	}
	static kontorMenuIstendi(e) {
		this.openContextMenu({
			...e, title: 'Kontör İşlemleri',
			wndArgsDuzenle: ({ wndArgs: args }) => $.extend(args, { height: 150 }),
			formDuzenleyici: ({ form: parentForm, close, rec }) => {
				let listele = cls => {
					let {kod: mustKod} = rec;
					cls.listeEkraniAc({ args: { mustKod } });
				};
				parentForm.altAlta().addStyle(e = `$elementCSS .formBuilder-element.parent { margin-top: 5px !important }`);
				let form = parentForm.addFormWithParent().yanYana(2);
				form.addButton('eBelge', undefined, 'e-Belge Kontör').onClick(() => { close(); listele(MQKontor_EBelge) });
				form.addButton('turmob', undefined, 'Turmob Kontör').onClick(() => { close(); listele(MQKontor_Turmob) })
			}
		})
	}
}
