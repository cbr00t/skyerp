class MQTicariParamBase extends MQParam {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e) /* const {pTanim} = e; pTanim.testX = new PInstStr()*/ }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e) /* const {paramci} = e; let kullanim = paramci.addKullanim();
		let grup = kullanim.addGrup('grup1', 'grup1'); grup.addBool('test1', 'TEST 1'); grup.addBool('test2', 'TEST 2');
		grup.addTabPage('diger', 'Diğer').addString('test3', 'TEST 3'); grup.addTabPage('diger', 'Diğer').addString('test3x', 'TEST 3x');
		grup.addNumber('test4', 'TEST 4'); grup.addDate('test5', 'TEST 5'); grup.addTekSecim('test6', 'TEST 6').setTekSecim(BorcAlacak).kodsuz() */
	}
}
class MQZorunluParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Zorunlu Parametreler' } static get paramKod() { return 'FGZT' }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e; paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`);
		let form = paramci.addFormWithParent();
			form.addBool('ozelIsaret', 'Özel İşaret'); form.addBool('sube', 'Şube Kullanılır'); form.addNumber('cariYil', 'Cari Yıl').setValue(today().getFullYear()).addStyle_wh('100px !important');
		/*form = paramci.addForm().setLayout(e => $(`<div>özel content</div>`)); form.addButton('test', null, 'TEST', e => eConfirm( `${e.event.currentTarget.value} butonuna tıklandı` )).addStyle_wh('200px !important', '50px !important');*/
		form = paramci.addGrup({ etiket: 'Ondalık' }).altAlta().addFormWithParent(); form.addNumber('fiyatFra', 'Fiyat').setValue(2); form.addNumber('dvFiyatFra', 'Dv.Fiyat').setValue(2);
			form.addNumber('bedelFra', 'Bedel').setValue(2); form.addNumber('dvBedelFra', 'Dv.Bedel').setValue(2); form.addNumber('dvKurFra', 'Dv.Kur').setValue(6)
	}
	paramSetValues({ rec }) { super.paramSetValues(...arguments) }
}
class MQOrtakMailParam extends MQOrtakParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static DefaultPort = 25; static get sinifAdi() { return 'Mail Parametreleri (ORTAK)' } static get paramKod() { return 'MAIL' }
	static get eMailKeys() { return MQEMailUst.eMailKeys }
	get sslmi() { return this.ssl } set sslmi(value) { this.ssl = value } get defaultPort() { return MQEMailUst.getDefaultPort(sslFlag) }
	get asWSEMailArgs() { let args = {}; this.wsEMailArgsDuzenle({ args }); return args }
	static paramYapiDuzenle(e) { super.paramYapiDuzenle(e); return this.paramYapiDuzenle_ortak(e) }
	paramSetValues(e) { e.inst = this; this.class.paramSetValues_ortak(e) }
	static paramYapiDuzenle_ortak({ paramci }) {
		paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`);
		let form = paramci.addFormWithParent();
			form.addString('smtpServer', 'SMTP Sunucusu');
			form.addNumber('port', 'Port').degisince(({ value, builder: fbd }) => fbd.altInst.ozelPortFlag = !!asInteger(value));
			form.addBool('ssl', 'SSL');
		form = paramci.addFormWithParent(); form.addString('from', 'Gönderici e-Mail');
			form.addString('user', 'Kullanıcı').degisince(({ value, builder: fbd }) => { let {altInst} = fbd; if (!altInst.from) { altInst.from = value } });
			form.addString('pass', 'Şifre')
	}
	static paramSetValues_ortak({ inst, rec }) {
		for (const key of this.eMailKeys) { const value = rec[key]; inst[key] = value }
	}
	wsEMailArgsDuzenle(e) { return MQEMailUst.wsEMailArgsDuzenle({ ...e, inst: this }) }
}
class MQVTMailParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Mail Parametreleri (Bu Firma)' } static get paramKod() { return MQOrtakMailParam.paramKod }
	get sslmi() { return this.ssl } set sslmi(value) { this.ssl = value } get defaultPort() { return MQEMailUst.getDefaultPort(sslFlag) }
	get asWSEMailArgs() { let args = {}; this.wsEMailArgsDuzenle({ args }); return args }
	static paramYapiDuzenle(e) { super.paramYapiDuzenle(e); return MQOrtakMailParam.paramYapiDuzenle_ortak(e) }
	paramSetValues(e) { e.inst = this; MQOrtakMailParam.paramSetValues_ortak(e) }
	wsEMailArgsDuzenle(e) { return MQEMailUst.wsEMailArgsDuzenle({ ...e, inst: this }) }
}
class MQLogocu extends MQOrtakParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Logocu' } static get paramKod() { return 'LOGOCU' }
	getLogoData(e) {
		let result = this._logoData;		/* tip2Rec.RLOGO = { ext, data } */
		if (result === undefined) { result = this._logoData = app.wsLogoBilgileri({ tip: ['RLOGO', 'EFIM', 'EFKI'].join(delimWS) }); result.then(result => this._logoData = result) }
		return result
	}
	globalleriSil(e) { for (const key of ['_logoData']) { delete this[key] } return this }
}
class MQTicariGenelParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Ticari Genel Parametreleri' } static get paramKod() { return 'CGEN' }
	get ayrimIsimleri() { 
		let {_ayrimIsimleri: result} = this; if (!result) { result = this.ayrimIsimleri = {} }
		return result
	}
	set ayrimIsimleri(value) { this._ayrimIsimleri = value }
	get stokAyrimIsimleri() { let {ayrimIsimleri: d} = this; return d.STAYR = d.STAYR ?? [] } set stokAyrimIsimleri(value) { this.ayrimIsimleri.STAYR = $.isArray(value) ? value : null }
	get cariAyrimIsimleri() { let {ayrimIsimleri: d} = this; return d.CRAYR = d.CRAYR ?? [] } set cariAyrimIsimleri(value) { this.ayrimIsimleri.CRAYR = $.isArray(value) ? value : null }
	get stokAyrimIsimleriText() { return this.stokAyrimIsimleri?.join('\n') ?? [] } set stokAyrimIsimleriText(value) { this.stokAyrimIsimleri = value?.split?.('\n')?.map?.(x => x.trimEnd()) ?? [] }
	get cariAyrimIsimleriText() { return this.cariAyrimIsimleri?.join('\n') ?? [] } set cariAyrimIsimleriText(value) { this.cariAyrimIsimleri = value?.split?.('\n')?.map?.(x => x.trimEnd()) ?? [] }
	static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); e.liste.push('ayrimIsimleri') }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e; paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`);
		paramci.addGrup().setEtiket('Genel'); let form = paramci.addFormWithParent();
			form.addTekSecim('borclanmaSekli', 'Borçlanma Şekli').dropDown().noMF().kodsuz().setTekSecim(TicBorclanmaSekli).addStyle_wh(300);
			form.addBool('sipIrsBorclanmaSonrasiEsasAlinir', 'Sip./İrs. Borçlanma Sonrası Esas Alınır');
		let kullanim = paramci.addKullanim().addGrup().setEtiket('Kullanım'); form = kullanim.addFormWithParent();
			form.addBool('doviz', 'Döviz'); form.addBool('sms', 'SMS İşlemleri'); form.addBool('plasiyer', 'Plasiyer');
			form.addBool('mustahsil', 'Müstahsil'); form.addBool('sicakSatis', 'Sıcak Satış'); form.addBool('muhasebe', 'Muhasebe');
			form.addBool('takipNo', 'Takip No'); form.addBool('masraf', 'Masraf Yeri'); form.addBool('uretim', 'Üretim');
			form.addBool('siteYonetimi', 'Site Yönetimi'); form.addBool('sutAlim', 'Süt Alım');
		form = kullanim.addFormWithParent();
			form.addBool('toplamKalite', 'Toplam Kalite'); form.addBool('demirbas', 'Demirbaş'); form.addBool('eFatura', 'e-Fatura'); form.addBool('eIrsaliye', 'e-İrsaliye');
			form.addBool('eMustahsil', 'e-Müstahsil'); form.addBool('eArsivLimit', 'e-Belge'); form.addBool('gelenEArsiv', 'Gelen e-Arşiv');
		form = paramci.addFormWithParent();
			form.addTextInput('wordGenelBolum', 'Word/HTML Ana Bölüm');
		let tabPage = paramci.addTabPage('diger', 'Diğer'); form = tabPage.addFormWithParent().addStyle(e => `$elementCSS > .parent { width: 19% !important }`);
		let altForm = form.addGrup({ etiket: 'Tarih' }).addFormWithParent(); altForm.addDateInput('enDusukTarih', 'En Düşük'); altForm.addDateInput('enYuksekTarih', 'En Yüksek');
		altForm = tabPage.addGrup({ etiket: 'Ayrım' }).addFormWithParent().addStyle_wh(400).yanYana();
			let degisince = ({ builder: fbd, value }) => fbd.altInst[fbd.id] = value?.split('\n')?.map(x => x.trimEnd()) ?? [];
			altForm.addML('stokAyrimIsimleriText', 'Stok Ayrım İsimleri').noRowAttr().setRowCount(8);
			altForm.addML('cariAyrimIsimleriText', 'Cari Ayrım İsimleri').noRowAttr().setRowCount(8)
	}
	paramSetValues({ rec }) {
		super.paramSetValues(...arguments);
		this.ayrimIsimleri = rec.ayrimIsimleri || rec.tip2AyrimIsimleri || {}
	}
}
class MQCariGenelParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Cari Genel Parametreleri' } static get paramKod() { return 'XCGEN' }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e;
		paramci.addGrup().setEtiket('Genel'); let form = paramci.addFormWithParent();
			form.addBool('cekSenetDevirCariyeIslenir', 'Çek/Senet Devir Cariye İşlenir');
		let kullanim = paramci.addKullanim().addGrup().setEtiket('Kullanım'); form = kullanim.addFormWithParent();
			form.addBool('konsolide', 'Konsolide'); form.addBool('altHesap', 'Alt Hesap')
	}
}
class MQStokGenelParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Stok Genel Parametreler' } static get paramKod() { return 'SGN' }
	static get tip2BrmListe() {
		let result = this._tip2BrmListe; if (result == null) {
			result = this._tip2BrmListe = {
				AD: ['AD', 'ADET', 'PK', 'PAKET', 'KL', 'KOLI', 'KOLİ'], KG: ['KG', 'KILO', 'KİLO'],
				LT: ['LT', 'LITRE', 'LİTRE'], MT: ['MT', 'METRE']
			}
		}
		return result
	}
	static get brm2Tip() {
		let result = this._brm2Tip; if (result == null) {
			const {tip2BrmListe} = this, result = {}; for (const [tip, brmListe] of Object.entries(tip2BrmListe)) { for (const brm of brmListe) { result[brm] = tip } }
			this._brm2Tip = result
		}
		return result
	}
	static get hmrYapi() {
		let result = this._hmrYapi; if (result === undefined) {
			result = {
				model:     { rowAttr: 'hmrModel', etiket: 'Model', etiketEditable: true },
				renk:      { rowAttr: 'hmrRenk', etiket: 'Renk', etiketEditable: true },
				desen:     { rowAttr: 'hmrDesen', etiket: 'Desen', etiketEditable: true },
				beden:     { rowAttr: 'hmrBeden', etiket: 'Beden', etiketEditable: true },
				harDet:    { rowAttr: 'hmrHarDet', etiket: 'Hareket Detayı', etiketEditable: true },
				lotNo:     { rowAttr: 'hmrLotNo', etiket: 'Lot No', etiketEditable: true },
				utsNo:     { rowAttr: 'hmrUtsNo', etiket: 'Uts No', etiketEditable: true },
				en:        { rowAttr: 'hmrEn', etiket: 'En' }, boy: { rowAttr: 'hmrBoy', etiket: 'Boy' },
				yukseklik: { rowAttr: 'hmrYukseklik' }, raf: { rowAttr: 'hmrRaf', etiket: 'Raf' }
			};
			this._hmrYapi = result
		}
		return result
	}
	static get hmr2Belirtec() {
		let result = this._hmr2Belirtec;
		if (result === undefined) {
			result = { model: 'MD', renk: 'RN', desen: 'DS', beden: 'BD', harDet: 'HD', lotNo: 'LT', utsNo: 'UT', raf: 'RF' };
			for (let i = 1; i <= 9; i++) { result[`ekOz${i}`] = `E${i}` }
			for (const [key, value] of Object.entries(result)) { for (const postfix of ['Kod', 'kod']) { result[key + postfix] = value } }
			this._hmr2Belirtec = result
		}
		return result
	}
	get hmrYapi() { return this.class.hmrYapi } get hmr2Belirtec() { return this.class.hmr2Belirtec }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, { hmr: e.hmr || {}, hmrEtiket: e.hmrEtiket || {}, ekOzellikBilgileri: e.ekOzellikBilgileri ?? [] });
		const {hmr, hmrEtiket} = this; for (const key in this.hmrYapi) { for (const altInst of [hmr, hmrEtiket]) { if (hmr[key] === undefined) { altInst[key] = null } } }
	}
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e, {hmrYapi} = this;
		let form = paramci.addKullanim().addGrup({ etiket: 'İşlem Kullanımı' }).addFormWithParent();
			form.addBool('miktar2', 'Miktar 2'); form.addBool('stokKontrol', 'Stok Kontrol'); form.addBool('depoKismiStokKontrol', 'Depo Kısmi Stok Kontrol'); form.addBool('konumStatu', 'Konum Statü'); 
			form.addBool('malFazlasi', 'Mal Fazlası'); form.addBool('marka', 'Stok Marka'); form.addBool('hacim', 'Hacim'); form.addBool('paket', 'Paket'); form.addBool('rbk', 'RBK Kısıtlaması');
			form.addBool('seriNo', 'Seri No'); form.addBool('seriMiktarli', 'Seri İçin Miktar Kullanılır'); form.addBool('dayaniksizGaranti', 'Dayanıksız Mal Garanti Takibi');
			form.addBool('transferSiparisi', 'Transfer Siparişi')
		let tabPage_form = paramci.addTabPage('hmr', 'HMR').addFormWithParent();
		tabPage_form.addGridGiris_sabit('_hmr').setRowAttr(null).addStyle_fullWH(null, 800)
			.setTabloKolonlari(e => {
				const handlers = {
					grid_cellClassName(colDef, rowIndex, belirtec, value, rec) {
						const {key} = rec, result = [belirtec]; if (belirtec == 'etiket' && !(hmrYapi[key]?.etiketEditable && rec.kullanim)) { result.push('grid-readOnly') }
						return result.join(' ')
					},
					grid_cellBeginEdit(colDef, rowIndex, belirtec, colType, value) {
						const rec = colDef.gridPart.gridWidget.getrowdata(rowIndex), {key} = rec;
						if (belirtec == 'etiket' && !(hmrYapi[key]?.etiketEditable && rec.kullanim)) { return false }
					},
					grid_cellEndEdit(colDef, rowIndex, belirtec, colType, value) { setTimeout(() => colDef.gridPart.gridWidget.render(), 0) }
				}
				return [
					new GridKolon({
						belirtec: 'etiket', text: 'Etiket', genislikCh: 25,
						cellClassName: (...args) => handlers.grid_cellClassName(...args), cellBeginEdit: (...args) => handlers.grid_cellBeginEdit(...args), cellEndEdit: (...args) => handlers.grid_cellEndEdit(...args),
						cellValueChanged: ({ builder: fbd, belirtec, gridRec, value }) => { let {key} = gridRec, {altInst} = fbd; gridRec[belirtec] = altInst.hmrEtiket[key] = (value || hmrYapi[key]?.etiket) ?? null }
					}),
					new GridKolon({
						belirtec: 'kullanim', text: ' ', genislikCh: 10,
						cellClassName: (...args) => handlers.grid_cellClassName(...args), cellBeginEdit: (...args) => handlers.grid_cellBeginEdit(...args), cellEndEdit: (...args) => handlers.grid_cellEndEdit(...args),
						cellValueChanged: ({ builder: fbd, belirtec, gridRec, value }) => { let {key} = gridRec, {altInst} = fbd; gridRec[belirtec] = altInst.hmr[key] = asBool(value) }
					}).tipBool()
				]
			})
			.setSource(({ builder: fbd }) => {
				const {altInst} = fbd, hmr = altInst.hmr || {}, hmrEtiket = altInst.hmrEtiket || {}, recs = [];
				for (const [key, yapi] of Object.entries(hmrYapi)) { const etiket = hmrEtiket[key] || yapi.etiket || key, kullanim = asBool(hmr[key]); recs.push({ key, etiket, kullanim }) }
				return recs
			})
			.veriYukleninceIslemi(({ builder: fbd }) => setTimeout(() => fbd.part.gridWidget.render(), 0));
		tabPage_form = paramci.addTabPage('ekOzellik', 'Ek Özellik').addFormWithParent();
		tabPage_form.addGridGiris('ekOzellikBilgileri').addStyle_fullWH(null, 800)
			.setTabloKolonlari(e => {
				const handlers = {
					grid_cellClassName(colDef, rowIndex, belirtec, value, rec) {
						const {key} = rec, result = [belirtec]; if (belirtec == 'etiket' && !(hmrYapi[key]?.etiketEditable && rec.kullanim)) { result.push('grid-readOnly') }
						return result.join(' ')
					},
					grid_cellBeginEdit(colDef, rowIndex, belirtec, colType, value) {
						const rec = colDef.gridPart.gridWidget.getrowdata(rowIndex), {key} = rec;
						if (belirtec == 'etiket' && !(hmrYapi[key]?.etiketEditable && rec.kullanim)) { return false }
					},
					grid_cellEndEdit(colDef, rowIndex, belirtec, colType, value) { setTimeout(() => colDef.gridPart.gridWidget.render(), 0) }
				}
				return [
					new GridKolon({
						belirtec: 'adi', text: 'Adı', genislikCh: 50,
						cellClassName: (...args) => handlers.grid_cellClassName(...args), cellBeginEdit: (...args) => handlers.grid_cellBeginEdit(...args), cellEndEdit: (...args) => handlers.grid_cellEndEdit(...args)
						/*cellValueChanged: ({ builder: fbd, belirtec, gridRec, value }) => { let {key} = gridRec, {altInst} = fbd; gridRec[belirtec] = altInst.hmrEtiket[key] = (value || hmrYapi[key]?.etiket) ?? null }*/
					})
				]
			})
			.setSource(({ builder: fbd }) => { let {altInst} = fbd; return (altInst.ekOzellikBilgileri = altInst.ekOzellikBilgileri ?? []) })
			.veriYukleninceIslemi(({ builder: fbd }) => setTimeout(() => fbd.part.gridWidget.render(), 0));
		tabPage_form = paramci.addTabPage('resim', 'Resim').addFormWithParent().altAlta();
		tabPage_form.addGrup({ etiket: 'Stok Resim' }); let altForm = tabPage_form.addFormWithParent().yanYana(2);
			altForm.addBool('stokResimKullanilir', 'Kullanılır'); altForm.addString('resimExt', 'Dosya Ext.');
			altForm.addTekSecim('resimBelirlemeKurali', 'Resim Belirleme Kuralı').dropDown().noMF().kodsuz().setTekSecim(ResimBelirlemeKurali).addStyle_wh('40%');
			altForm.addString('resimAnaBolum', 'Yerel Ana Bölüm'); altForm.addString('resimFTPAnaBolum', 'FTP Ana Bölüm');
		altForm = tabPage_form.addGrup({ etiket: 'RBK Resim' }); altForm = tabPage_form.addFormWithParent().yanYana(2);
			altForm.addBool('rbkResimKullanilir', 'Kullanılır'); altForm.addString('rbkResimAnaBolum', 'Yerel Ana Bölüm'); altForm.addString('rbkResimFTPAnaBolum', 'FTP Ana Bölüm')
	}
	paramHostVarsDuzenle(e) {
		e = e || {}; super.paramHostVarsDuzenle(e); let {hv} = e, {hmrYapi, ekOzellikBilgileri} = this;
		ekOzellikBilgileri = this.ekOzellikBilgileri = ekOzellikBilgileri?.filter(({ adi }) => !!adi);
		const hmr = this.hmr || {}, hmrEtiket = this.hmrEtiket || {};
		for (const [key, yapi] of Object.entries(hmrYapi)) {
			const {rowAttr, etiketEditable} = yapi; if (!rowAttr) { continue }
			hv[rowAttr] = hmr[key]; if (etiketEditable) { hv[rowAttr + 'Etiket'] = hmrEtiket[key] }
		}
	}
	paramSetValues({ rec }) {
		super.paramSetValues(...arguments); let {hmrYapi} = this;
		let ekOzellikBilgileri = [];
		for (let item of this.ekOzellikBilgileri) {
			if (typeof item == 'string') { try { item = JSON.parse(item) } catch (ex) { console.error(ex); item = null } }
			if (item?.adi) { ekOzellikBilgileri.push(item) }
		}
		this.ekOzellikBilgileri = ekOzellikBilgileri;
		let hmr = this.hmr = this.hmr || {}, hmrEtiket = this.hmrEtiket = this.hmrEtiket || {};
		for (let [key, yapi] of Object.entries(hmrYapi)) {
			let {rowAttr, etiketEditable} = yapi; if (!rowAttr) { continue }
			let ekRowAttr = key == 'harDet' ? 'hardet' : null;
			let kullanim = rec[rowAttr] ?? rec[ekRowAttr]; if (kullanim != null) { hmr[key] = kullanim }
			if (etiketEditable) { const etiket = rec[rowAttr + 'Etiket'] ?? rec[ekRowAttr + 'Etiket']; if (etiket) { hmrEtiket[key] = etiket } }
		}
		{	let {kullanim} = this; for (let key in kullanim) {
				if (kullanim[key] != null) { continue }
				let value = rec[key] ?? this[key]; if (value != null) { kullanim[key] = value; delete this[key] }
			}
		}
	}
}
class MQStokBirimParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Stok Birim Parametreleri' } static get paramKod() { return 'SOB' }
	get brmColl() { return this._brmColl } set brmColl(value) { this._brmColl = value; delete this._brmDict }
	get brmDict() { let result = this._brmDict; if (!result) { result = {}; for (const ka of this.brmColl || []) { result[ka.kod] = ka } this._brmDict = result } return result } set brmDict(value) { this._brmDict = value }
	get intKod2KA() {
		let result = this._intKod2KA; if (!result) { result = {}; for (const ka of this.brmColl || []) { const {intKod} = ka; if (intKod) { result[intKod] = ka } } this._intKod2KA = result }
		return result
	}
	set intKod2KA(value) { this._intKod2KA = value }
	constructor(e) {
		e = e || {}; super(e); this.brmColl = e.brmColl || [
			{ kod: 'AD', aciklama: 'AD', fra: 0, intKod: 'NIU' },
			{ kod: 'KG', aciklama: 'KG', fra: 3 }, { kod: 'LT', aciklama: 'LT', fra: 3 }
		]
	}
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e;
		paramci.addGrup({ etiket: 'Birim Listesi' }); let form = paramci.addFormWithParent();
		form.addGridGiris('brmColl').setRowAttr('birimColl').addStyle_wh({ width: '430px !important', height: '250px !important' })
			.setTabloKolonlari(e => [
				new GridKolon({ belirtec: 'kod', text: 'Kod', genislikCh: 8 }).setMaxLength(4),
				new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 15 }).setMaxLength(10),
				new GridKolon({ belirtec: 'fra', text: 'Fra', genislikCh: 6 }).tipNumerik().setMaxLength(2),
				new GridKolon({ belirtec: 'intKod', text: 'Uls.', genislikCh: 8 }).setMaxLength(4)
			]).setSource(e => e.builder.altInst.brmColl)
	}
}
class MQHizmetGenelParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Hizmet Genel Parametreleri' } static get paramKod() { return 'XHIZ' }
}
class MQDemirbasGenelParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Demirbaş Parametreleri' } static get paramKod() { return 'XDEM' }
}
class MQFiyatVeIskontoParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Fiyat ve İskonto Parametreleri' } static get paramKod() { return 'ISK' }
	constructor(e) { e = e || {}; super(e); for (const key of ['iskSayi', 'iskOranMax']) this[key] = e[key] || {} }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e;
		let form = paramci.addFormWithParent(); form.addBool('fiyatKDVlidir', 'KDVli Fiyat').setRowAttr('kdvliFiyat');
		form.addNumber('fiyatSayi', 'Fiyat Sayısı'); form.addNumber('iskFra', 'İskonto Ondalık');
		form = paramci.addKullanim().addGrup('Kullanım').addFormWithParent(); form.addBool('kademeliIskonto', 'Kademeli İskonto')
	}
	paramSetValues(e) {
		e = e || {}; super.paramSetValues(e); const {rec} = e;
		$.extend(this, {
			iskSayi: { sabit: rec.sabitIskSayi || 0, kampanya: rec.kampanyaIskSayi || 0, kademeli: rec.kademeliIskSayi || 0 },
			iskOranMax: { sabit: rec.sabitIskOranMax || 0, kampanya: rec.kampanyaIskOranMax || 0, kademeli: rec.kademeliIskOranMax || 0 }
		});
		const iskEtiketci = e => {
			const prefix = typeof e == 'object' ? e.prefix : e, key = `${prefix}EtiketListe`, result = {}, liste = rec[key];
			if (liste) { for (let i = 0; i < liste.length; i++) { result[i + 1] = liste[i] } } return result
		}
		const iskEtiketDict = this.iskEtiketDict = { sabit: iskEtiketci('sabit'), kampanya: iskEtiketci('kampanya'), kademeli: iskEtiketci('kademeli') };
		if (config.dev) { const {iskSayi} = this; if (!iskSayi.sabit) { iskSayi.sabit = 3 } }
	}
}
class MQAlimSatisParamOrtak extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e; const temps = e.temps = e.temps || {};
		let form = temps.siparis_kullanim = paramci.addGrup({ etiket: 'Sipariş Kullanımı' }).addFormWithParent();
			let kullanim = form.addKullanim(); kullanim.addBool('sipOnay', 'Sipariş İçin Onay Kullanılır');
			form.addBool('sipVarsayilanOnaysiz', 'Sipariş Varsayılan Olarak Onaysızdır'); form.addBool('irs2FatKosulGuncelleme', 'İrsaliye -> Fatura Dönüşümünde Fiyat Ve İskontoların Güncellenmesi');
		let tabPage = paramci.addTabPage('genel2', 'Genel-2'); form = temps.form_genel2 = tabPage.addGrup({ id: 'genel2', etiket: 'Genel-2' }).addFormWithParent(); form.addBool('fisGirisiOtoHizmet', 'Fişe Yeni Eklenen Satırlar Hizmet Tipinde Olsun');
			kullanim = form.addKullanim(); kullanim.addBool('dogrudanIrsaliye', 'Siparişsiz İrsaliye girişi yapılır'); kullanim.addBool('dogrudanFatura', 'İrsaliyesiz Fatura girişi yapılır');
	    tabPage = paramci.addTabPage('ekmodul', 'Ek Modül'); form = temps.islem_kullanim = tabPage.addGrup({ id: 'islemKullanim', etiket: 'İşlem Kullanımı' }).addFormWithParent();
		kullanim = form.addKullanim();
			kullanim.addBool('ihracKaydiyla', 'İhraç Kaydıyla'); kullanim.addBool('konsinye', 'Konsinye');
			kullanim.addBool('emanet', 'Emanet'); kullanim.addBool('yeniEmanet', 'Yeni Emanet'); kullanim.addBool('fason', 'Fason');
			kullanim.addBool('talepTeklif', 'Talep/Teklif'); kullanim.addBool('ticariKosul', 'Alım Koşulları'); kullanim.addBool('serbestMeslekMakbuzu', 'Serbest Meslek Makbuzu');
		tabPage = paramci.addTabPage('if', 'İrs->Fat');
		form = tabPage.addGrup({ etiket: 'İrs->Fat' }).addFormWithParent();
			form.addBool('irs2FatKosulGuncelleme', 'irsaliye -> Fatura dönüşümünde fiyat ve iskontoların güncellenmesi'); form.addBool('irs2FatEkransalDuzenleme', 'İrs->Fat Ekransal Dönüşüm');
			form.addBool('irs2FatTopluDonusum', 'İrs->Fat Toplu Dönüşüm'); form.addBool('irs2FatSecerek', 'İrs->Fat Seçerek Dönüşüm'); form.addBool('irs2FatIrsaliyeBirlestir', 'irs->fat Uygun Satırlar Birleşir');
		tabPage = paramci.addTabPage('sif', 'Sip->İrs/Fat'); form = temps.sip2_irsFat = tabPage.addGrup({ etiket: 'Sip->İrs/Fat' }).addFormWithParent();
			form.addBool('sip2XSatirlarBirlesir', 'Sip->İrs/Fat Dönüşümde Satırlar Birleşir'); form.addBool('sip2XKosullarGuncellenir', 'Sip->İrs/Fat Dönüşümde Fiyat ve İskontolar Güncellenir');
			form.addBool('sip2XSipBaglantiZorunlu', 'Sip->İrs/Fat Dönüşümde Sipariş Harici Kayıt Girilemez')
	}
}
class MQAlimParam extends MQAlimSatisParamOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get paramKod() { return 'SFAL' } static get sinifAdi() { return 'Alım Genel Parametreleri' }
	static paramYapiDuzenle(e){
		super.paramYapiDuzenle(e); const {paramci, temps} = e;
		let form = temps.islem_kullanim, kullanim = form.addKullanim();
			kullanim.addBool('hizmetGiderPusulasi', 'Hizmet Gider Pusulası'); kullanim.addBool('stokGiderPusulasi', 'Stok Gider Pusulası')
	}
}
class MQSatisParam extends MQAlimSatisParamOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get paramKod() { return 'SFST' } static get sinifAdi() { return 'Satış Genel Parametreleri' }
	static paramYapiDuzenle(e){
		super.paramYapiDuzenle(e); const {paramci, temps} = e;
		let form = temps.islem_kullanim, kullanim = form.addKullanim();
			kullanim.addBool('satisRota', 'Satış Rotası'); kullanim.addBool('malKabulNo', 'Mal Kabul No'); kullanim.addBool('kunyeVeBorsa', 'Künye ve Borsa');
			kullanim.addBool('mikroIhracat', 'Mikro İhracat'); kullanim.addBool('internetSatisi', 'İnternet Satışı'); kullanim.addBool('kamuIhale', 'Kamu İhale');
			kullanim.addBool('stokIadeGiderPusulasi', 'Gider Pusulası')
		form = temps.sip2_irsFat; form.addBool('sip2Irsaliye', 'Sip -> İrs Dönüşüm Yapılır'); form.addBool('sip2XSecerek', 'Sip->İrs/Fat Seçerek Dönüşüm'); form.addBool('sip2XEkransalDuzenleme', 'Sip->İrs/Fat Toplu Dönüşüm');
		let tabPage = paramci.addTabPage('sf', 'Sip->Fat'); form = tabPage.addGrup().addFormWithParent(); kullanim = form.addKullanim();
			form.addBool('sip2Fatura', 'Sip->Fat Dönüşüm Yapılır');
		form = temps.form_genel2; tabPage = paramci.addTabPage('risk', 'Risk');
		form = tabPage.addGrup({ etiket: 'Ticari Belgelerde Kontrol' }).addFormWithParent().yanYana(); form.addTekSecim('riskIslem', 'Risk İşlem').setTekSecim(LimitKontrol).kodsuz(); form.addTekSecim('takipBorc', 'Takip Borç').setTekSecim(LimitKontrol).kodsuz()
	}
}
class MQBankaGenelParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get paramKod() { return 'BANGP' } static get sinifAdi() { return 'Banka Genel Parametreleri' }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e;
		let form = paramci.addKullanim().addFormWithParent();
			form.addBool('taksitliKredi', 'Taksitli Kredi'); form.addBool('yatirimGeliri', 'Yatırım');
			form.addBool('akreditif', 'Akreditif'); form.addBool('teminatMektubu', 'Teminat Mektubu');
			form.addBool('zorunluTaksit', 'Zorunlu Taksit'); form.addBool('eskiNakdeDonusum', 'Eski Nakde Dönüşüm')
	}
	paramSetValues({ rec }) {
		super.paramSetValues(...arguments);
		this.yatirimGeliri = rec.yatirimGeliri ?? rec.yatirim ?? this.yatirimGeliri
	}
}
class MQUretimParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return 'URETIM' } static get sinifAdi() { return 'Üretim Parametreleri' }
	constructor(e) { e = e || {}; super(e) }
	static paramYapiDuzenle({ paramci }) {
		super.paramYapiDuzenle(...arguments);
		let form = paramci.addKullanim().addFormWithParent();
			form.addBool('uretimMalMuh', 'Maliyet Muhasebesi')
		/*
		at: 'superAgac'				put: self sablonsalFormul;
		at: 'saOzellikZorunlumu'	put: self sablonsaldaOzellikSecimiZorunludur;
		at: 'ayrisimUretimi'		put: self ayrisimKullanilir;
		at: 'varyantliUretim'		put: self varyantKullanilir;
		at: 'uretimMalMuh'			put: self malMuhKullanilir;
		at: 'formulRevizyon'		put: self formulRevizyonKullanilir;

		at: 'otoLotNo'				put: self otoLotUygulanir;
		at: 'otoLotKurali'			put: self otoLotNoKurali;
		at: 'otoLotUygulamaSekli'	put: self otoLotUygulamaSekli;		" PUretLotlamaTipi "
		at: 'otoSeriNo'				put: self otoSeriUygulanir;
		at: 'otoSeriKurali'			put: self otoSeriNoKurali;

		at: 'formulHizmet'			put: self uretimHizmeti;
		at: 'fasonAlimIcinFasonUrerim'		put: self fasonAlimIcinGerekirseFasonUretimYapilsin;
		at: 'fasoncuYonetimi'		put: self fasoncuYonetimi;
		at: 'mrp'					put: self mrp;
		at: 'formulDerinlemesineMaxSeviye'	put: self formulDerinlemesineSeviye;
		at: 'formulFiyatFra'		put: self formulFiyatFra;
		*/
	}
}
class MQOperGenelParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return 'MALG' } static get sinifAdi() { return 'Operasyon Genel Parametreleri' }
	get _hmr() { const hmr = asSet(this.hmr) || {}; return Object.keys(hmr).join('\r\n') } set _hmr(value) { let hmr = value ? value.split('\n').map(x => x?.trim()).filter(x => !!x) : [] }
	constructor(e) { e = e || {}; super(e); $.extend(this, { hmr: e.hmr || {} }) }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e
		let kullanim = paramci.addKullanim().addGrup({ etiket: 'Kullanım' }), form = kullanim.addFormWithParent();
			form.addBool('operasyonIsYonetimi', 'Operasyon İş Yönetimi'); form.addBool('mesVeriToplama', 'MES Veri Toplama'); form.addBool('pdmKodu', 'PDM Kodu');
			form.addBool('nihaiUrunTeslimAgacVeyaHattaGoredir', 'Nihai Ürün Teslim Ağaç veya Hatta Göredir'); form.addBool('islenebilirMiktarAsilabilir', 'İşlenebilir Miktar Aşılabilir');
			form.addBool('uretildigiYerdeKalir', 'Üretildiği Yerde Kalır'); form.addBool('tabletSadeceSonOperasyon', 'Sadece Son Operasyon');
		form = paramci.addFormWithParent(); form.addNumber('iskartaMaxSayi', 'Iskarta Sayısı').addStyle_wh(200);
		form = paramci.addGrup('HMR').addFormWithParent(); form.addML('_hmr').noRowAttr().setRowCount(8).addStyle_wh(300)
	}
	paramHostVarsDuzenle(e) { e = e || {}; super.paramHostVarsDuzenle(e); const {hv} = e, hmr = asSet(this.hmr) || {}; $.extend(hv, { hmr }) }
	paramSetValues(e) { e = e || {}; super.paramSetValues(e); const {rec} = e; this.hmr = asSet(rec.hmr) || {} }
}
class MQKaliteParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get paramKod() { return 'KALITE' } static get sinifAdi() { return 'Kalite Parametreleri' }
	constructor(e) { e = e || {}; super(e); this.uretimNumuneSayisi = e.uretimNumuneSayisi ?? 5 }
	static paramYapiDuzenle(e) { super.paramYapiDuzenle(e); const {paramci} = e; paramci.addNumber('uretimNumuneSayisi', 'Üretim Numune Sayısı') }
	paramSetValues(e) {
		e = e || {}; super.paramSetValues(e); const {rec} = e;
		this.uretimNumuneSayisi = asInteger(rec.uretimNumuneSayisi ?? this.uretimNumuneSayisi)
	}
}
class MQAktarimParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Ticari Aktarım Parametreleri' } static get paramKod() { return 'CAKT' }
	static paramYapiDuzenle({ paramci }) {
		super.paramYapiDuzenle(...arguments);
		let kullanim = paramci.addKullanim().addGrup({ etiket: 'Kullanım' }), form = kullanim.addFormWithParent();
			form.addBool('webOzetRapor', 'Web Özet Rapor').onBuildEk(({ builder: fbd }) => fbd.input.attr('disabled', ''));
			form.addBool('tablet', 'Sky Tablet'); form.addBool('pdks', 'PDKS'); form.addBool('yazarKasa', 'YazarKasa Aktarımı');
			form.addBool('pratikSatis', 'Pratik Satış'); form.addBool('magaza', 'Mağaza');
			form.addBool('webSiparis', 'Web B2B Sipariş'); form.addBool('konsinyeLojistik', 'Konsinye Lojistik');
			form.addBool('pdks', 'PDKS Veri Aktarımı'); form.addBool('guleryuzOnline', 'Güleryüz Online')
	}
	paramSetValues({ rec }) {
		super.paramSetValues(...arguments);
		this.yazarKasa = rec.yazarKasa ?? rec.yazarkasa ?? this.yazarKasa
	}
}
class MQMaliyetParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Maliyet Parametreleri' } static get paramKod() { return 'STML' }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e; paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`);
		let form = paramci.addFormWithParent();
			form.addTekSecim('yerMaliyetSekli', 'Yer Maliyet Şekli').dropDown().noMF().kodsuz().setTekSecim(YerMaliyetSekli).addStyle_wh(300);
			form.addBool('alimIadeHesap', 'Alım İADEleri Hesaplanır')
	}
	paramSetValues({ rec }) { super.paramSetValues(...arguments) }
}
class MQMuhasebeParam extends MQTicariParamBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Muhasebe Parametreleri' } static get paramKod() { return 'MHGN' }
	constructor(e) { e = e || {}; super(e); $.extend(this, { maliYil: e.maliYil ?? new Date().yil }) }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e;
		let form = paramci.addFormWithParent(); form.addNumber('maliYil', 'Mali Yıl')
		/*let kullanim = paramci.addKullanim().addGrup({ etiket: 'Kullanım' }); let form = kullanim.addFormWithParent();
			form.addBool('webOzetRapor', 'Web Özet Rapor').onBuildEk(e => e.builder.input.attr('disabled', ''));
			form.addBool('tablet', 'Sky Tablet'); form.addBool('yazarkasa', 'YazarKasa Aktarımı');
			form.addBool('webSiparis', 'Web B2B Sipariş'); form.addBool('konsinyeLojistik', 'Konsinye Lojistik'); form.addBool('pdks', 'PDKS Veri Aktarımı')*/
	}
	paramSetValues(e) { e = e || {}; super.paramSetValues(e) /*; const {rec} = e*/ }
}
class MQWebParam extends MQTicariParamBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Web Parametreleri' } static get paramKod() { return 'TICWEB' }
	get ekOzellikKodlariStr() { return array2MLStr(this.ekOzellikKodlari) } set ekOzellikKodlariStr(value) { this.ekOzellikKodlari = mlStr2Array(value) }
	get konBuFirma_eMailListeStr() { return array2EMailStr(this.konBuFirma_eMailListe) } set konBuFirma_eMailListeStr(value) { this.konBuFirma_eMailListe = eMailStr2Array(value) }
	constructor(e) {
		e = e || {}; super(e); let {sablonSip_degisiklik, sablonSip_eMail, ekOzellikKodlari, yerKodListe} = e;
		$.extend(this, { sablonSip_degisiklik: sablonSip_degisiklik ?? true, sablonSip_eMail: sablonSip_eMail ?? true, ekOzellikKodlari: ekOzellikKodlari ?? [], yerKodListe: yerKodListe ?? [] })
	}
	static paramYapiDuzenle({ paramci }) {
		super.paramYapiDuzenle(...arguments); let {dbName} = config.session ?? {}, dbNamePrefix = dbName?.slice(0, 4);
		let form = paramci.addFormWithParent().yanYana(1.4);
			if (window.MQCari) { form.addModelKullan('pesinMustKod', 'Peşin Müşteri').comboBox().autoBind().setMFSinif(MQCari) }
				else { form.addString('pesinMustKod', 'Peşin Müşteri') };
			form.addML('ekOzellikKodlariStr', 'Ek Özellik Kodları').noRowAttr().setRowCount(5).addStyle_wh(200);
		form = paramci.addFormWithParent();
			form.addBool('stokResim', 'Stok Resim Kullanılır');
		let tabPage = paramci.addTabPage('webSiparis', 'Web Sipariş');
		let grup = tabPage.addGrup().setEtiket('Şablonlu Sipariş');
		form = grup.addFormWithParent();
			form.addBool('sablonSip_eMail', 'e-Mail Gönderilir');
		form = tabPage.addAltObject('sablonDefKisit').addGrup().setEtiket('Def.Kısıt').addFormWithParent();
			form.addBool('sablonSip_degisiklik', 'Değişiklik');
			form.addBool('sube', 'Şube'); form.addBool('musteri', 'Müşteri');
		form = tabPage.addFormWithParent().altAlta();
			form.addString('konBuFirma_eMailListeStr', 'Bu Firma e-Mail Adresleri');
		let source_dbList = async e => {
			return (await app.wsDBListe())
				.filter(name => $.isNumeric(name.substr(2, 2)))
				// .filter(name => !dbNamePrefix || name.startsWith(dbNamePrefix))
				.map(adi => new CKodVeAdi([adi, adi]))
		};
		form = tabPage.addFormWithParent().yanYana();
			form.addBool('webSiparis_sonStokGosterilirmi', 'Son Stok Gösterilir');
			form.addModelKullan('webSiparis_sonStokDB', 'Son Stok Veritabanı')
				.comboBox().autoBind().noMF().kodsuz().setSource(source_dbList);
			form.addModelKullan('webSiparis_konDBListe', 'Kon. Ek Veritabanları')
				.comboBox().autoBind().noMF().kodsuz().coklu().setSource(source_dbList);
		form = tabPage.addFormWithParent();
			form.addModelKullan('webSiparis_yerKodListe', 'Depolar')
				.comboBox().autoBind().coklu().setMFSinif(MQStokYer)
				.ozelQueryDuzenleIslemi(({ builder: fbd, sent }) => {
					let {altInst} = fbd, {webSiparis_sonStokDB: db} = altInst, {from} = sent;
					if (db) {
						for (let aMQTable of from.liste) {
							let {deger} = aMQTable;
							if (!deger.includes('..')) { deger = aMQTable.deger = `${db}..${deger}` }
						}
					}
				})
				.setPlaceHolder('(A) Merkez Ambarı');
			form.addNumberInput('otoTeslimTarihi_gunEk', 'Teslim Tarihi<br/><center>(+ Gün)</center>', '(+ Gün)')
				.setFra(0).addStyle_wh(150);
			form.addNumberInput('webSiparis_ayOnceSayisi', 'Örnekleme<br/>Ay Sayısı')
				.setFra(0).addStyle_wh(150)
	}
	paramHostVarsDuzenle({ hv }) {
		super.paramHostVarsDuzenle(...arguments); let {ekOzellikKodlari} = this;
		$.extend(hv, { ekOzellikKodlari });
	}
	paramSetValues({ rec }) {
		super.paramSetValues(...arguments);
		for (let key of ['sablonSip_degisiklik', 'sablonSip_eMail', 'webSiparis_sonStokGosterilirmi']) { this[key] = this[key] ?? true }
		for (let key of ['ekOzellikKodlari', 'yerKodListe']) { this[key] = rec[key] ?? this[key] ?? [] }
		let {sablonDefKisit} = this; if (sablonDefKisit?.sablonDefKisit) {
			$.extend(sablonDefKisit, sablonDefKisit.sablonDefKisit);
			delete sablonDefKisit.sablonDefKisit
		}
	}
}
class MQTabletParam extends MQTicariParamBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Sky Tablet Parametreleri' } static get paramKod() { return 'TABLET' }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e;
		let form = paramci.addFormWithParent(); form.addBool('yaslandirmaTarihmi', `Yaşlandırma Tarih'e göredir`);
			form.addBool('cariHareketTakipNo', 'Cari Hareket Takip No Bazında Gruplanır')
	}
	paramSetValues(e) { e = e || {}; super.paramSetValues(e) /*; const {rec} = e*/ }
}
