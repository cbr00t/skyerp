class IK_MQTicariParamBase extends MQParam {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e)
		/* const {pTanim} = e;
		pTanim.testX = new PInstStr()*/
	}
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e)
	}
}
class IK_MQZorunluParam extends IK_MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Zorunlu Parametreler' }
	static get paramKod() { return 'FGZT' }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e);
		const {paramci} = e;
		paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`);
		let form = paramci.addFormWithParent();
		form.addBool('ozelIsaret', 'Özel İşaret');
		form.addNumber('cariYil', 'Cari Yıl').setValue(today().getFullYear()).addStyle_wh('100px !important');
		
		form = paramci.addForm().setLayout(e => $(`<div>özel content</div>`));
		form.addButton('test', null, 'TEST').addStyle_wh('200px !important', '50px !important');
		
		form = paramci.addGrup({ etiket: 'Ondalık' }).altAlta().addFormWithParent();
		form.addNumber('fiyatFra', 'Fiyat').setValue(2);
		form.addNumber('dvFiyatFra', 'Dv.Fiyat').setValue(2);
		form.addNumber('bedelFra', 'Bedel').setValue(2);
		form.addNumber('dvBedelFra', 'Dv.Bedel').setValue(2);
		form.addNumber('dvKurFra', 'Dv.Kur').setValue(6)

		/*form.addGridGiris('testGrid')
			.addStyle_wh({ width: '500px !important', height: '300px !important' })
			.setTabloKolonlari(e => [
				new GridKolon({ belirtec: 'kod', text: 'Kod', genislikCh: 4 }),
				new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 10 }).readOnly(),
				new GridKolon({ belirtec: 'fra', text: 'Fra', genislikCh: 3 }).tipNumerik(),
				new GridKolon({ belirtec: 'intKod', text: 'Uls.Arası Birim', genislikCh: 10 })
			])
			.setSource([
				{ kod: 'AD', aciklama: 'AD', fra: 0, intKod: 'NIU' },
				{ kod: 'KG', aciklama: 'KG', fra: 3 },
				{ kod: 'LT', aciklama: 'LT', fra: 3 }
			])*/
	}
	paramSetValues(e) {
		e = e || {};
		super.paramSetValues(e);
		const {rec} = e
	}
}
class IK_MQTicariGenelParam extends IK_MQTicariParamBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Ticari Genel Parametreleri' }
	static get paramKod() { return 'CGEN' }
	constructor(e) {
		e = e || {};
		super(e);
		this.ayrimIsimleri = e.ayrimIsimleri || {}
	}
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e);
		const {paramci} = e;
		paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`);
		let kullanim = paramci.addKullanim().addGrup({ etiket: 'Kullanım' });
		let form = kullanim.addFormWithParent();
		form.addBool('doviz', 'Döviz');
		form.addBool('sms', 'SMS İşlemleri');
		form.addBool('plasiyer', 'Plasiyer');
		form.addBool('mustahsil', 'Müstahsil');
		form.addBool('sicakSatis', 'Sıcak Satış');
		form.addBool('muhasebe', 'Muhasebe');
		form.addBool('takipNo', 'Takip No');
		form.addBool('uretim', 'Üretim');
		form = kullanim.addFormWithParent();
		form.addBool('toplamKalite', 'Toplam Kalite');
		form.addBool('demirbas', 'Demirbaş');
		form.addBool('eFatura', 'e-Fatura');
		// form.addBool('eArsiv', 'e-Arşiv');
		form.addBool('eIrsaliye', 'e-İrsaliye');
		form.addBool('eMustahsil', 'e-Müstahsil');
		form.addBool('eArsivLimit', 'e-Belge')
		form.addBool('gelenEArsiv', 'Gelen e-Arşiv');

		let tabPage = paramci.addTabPage('diger', 'Diğer');
		form = tabPage.addFormWithParent().addStyle(e => `$elementCSS > .parent { width: 19% !important }`);
		let altForm = form.addGrup({ etiket: 'Tarih' }).addFormWithParent();
		altForm.addDateInput('enDusukTarih', 'En Düşük');
		altForm.addDateInput('enYuksekTarih', 'En Yüksek');
		altForm = tabPage.addGrup({ etiket: 'Ayrım' });
		altForm.addML('_ayrimIsimleri', 'Ayrım İsimleri').setRowCount(8)
			/* .onBuildEk(e => e.builder.input.val( (e.builder.value || []).join(CrLf) )) */
			.degisince(e => e.builder.value = (e.builder.value || '').split('\n').map(x => x.trimEnd()))
	}
	paramSetValues(e) {
		e = e || {};
		super.paramSetValues(e)
		const {rec} = e;
		/*const {kullanim} = this;
		let attrListe = [
			'doviz', 'sms', 'plasiyer', 'mustahsil', 'sicakSatis', 'muhasebe', 'takipNo', 'uretim',
			'toplamKalite', 'demirbas', 'eFatura', 'eIrsaliye', 'eMustahsil', 'eArsivLimit', 'gelenEArsiv'
		];
		for (const attr of attrListe)
			kullanim[attr] = rec[attr]
		kullanim.eArsiv = kullanim.eFatura
		for (const attr of ['enDusukTarih', 'enYuksekTarih']) {
			// '20221201' gibi
			let value = asReverseDate(rec[attr]);
			this[attr] = value;
		}*/
		this.ayrimIsimleri = rec.ayrimIsimleri || rec.tip2AyrimIsimleri || {}
	}

}
class IK_MQCariGenelParam extends IK_MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Cari Genel Parametreleri' }
	static get paramKod() { return 'XCGEN' }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e);
		const {paramci} = e;
		let kullanim = paramci.addKullanim().addGrup({ etiket: 'Kullanım' });
		let form = kullanim.addFormWithParent();
		form.addBool('konsolide', 'Konsolide');
		form.addBool('altHesap', 'Alt Hesap');
		
	}
	paramSetValues(e) {
		e = e || {};
		super.paramSetValues(e)
		const {rec} =  e;
	
	}
}
class IK_MQStokGenelParam extends IK_MQTicariParamBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Stok Genel Parametreleri' }
	static get paramKod() { return 'SGN' }
	static get hmrYapi() {
		let result = this._hmrYapi;
		if (result === undefined) {
			result = {
				model: { rowAttr: 'hmrModel', etiket: 'Model', etiketEditable: true },
				renk: { rowAttr: 'hmrRenk', etiket: 'Renk', etiketEditable: true },
				desen: { rowAttr: 'hmrDesen', etiket: 'Desen', etiketEditable: true },
				beden: { rowAttr: 'hmrBeden', etiket: 'Beden', etiketEditable: true },
				harDet: { rowAttr: 'hmrHardet', etiket: 'Hareket Detayı', etiketEditable: true },
				lotNo: { rowAttr: 'hmrLotNo', etiket: 'Lot No', etiketEditable: true },
				utsNo: { rowAttr: 'hmrUtsNo', etiket: 'Uts No', etiketEditable: true },
				en: { rowAttr: 'hmrEn', etiket: 'En' },
				boy: { rowAttr: 'hmrBoy', etiket: 'Boy' },
				yukseklik: { rowAttr: 'hmrYukseklik' },
				raf: { rowAttr: 'hmrRaf', etiket: 'Raf' }
			};
			this._hmrYapi = result
		}
		return result
	}
	static get hmr2Belirtec() {
		let result = this._hmr2Belirtec;
		if (result === undefined) {
			result = {
				model: 'MD', renk: 'RN', desen: 'DS', beden: 'BD',
				harDet: 'HD', lotNo: 'LT', utsNo: 'UT', raf: 'RF'
			};
			for (let i = 1; i <= 9; i++)
				result[`ekOz${i}`] = `E${i}`
			for (const [key, value] of Object.entries(result)) {
				for (const postfix of ['Kod', 'kod'])
					result[key + postfix] = value
			}
			this._hmr2Belirtec = result
		}
		return result
	}
	get hmrYapi() { return this.class.hmrYapi }
	get hmr2Belirtec() { return this.class.hmr2Belirtec }
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { hmr: e.hmr || {}, hmrEtiket: e.hmrEtiket || {} });
		const {hmr, hmrEtiket} = this;
		for (const key in this.hmrYapi) {
			for (const altInst of [hmr, hmrEtiket]) {
				if (hmr[key] === undefined)
					altInst[key] = null
			}
		}
	}
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e, {hmrYapi} = this;
		let form = paramci.addKullanim().addGrup({ etiket: 'İşlem Kullanımı' }).addFormWithParent();
		form.addBool('stokKontrol', 'Stok Kontrol');
		form.addBool('depoKismiStokKontrol', 'Depo Kısmi Stok Kontrol');
		form.addBool('konumStatu', 'Konum Statü');
		form.addBool('malFazlasi', 'Mal Fazlası');
		form.addBool('marka', 'Stok Marka');
		form.addBool('hacim', 'Hacim');
		form.addBool('paket', 'Paket');
		form.addBool('rbk', 'RBK Kısıtlaması');
		form.addBool('seriNo', 'Seri No');
		form.addBool('seriMiktarli', 'Seri İçin Miktar Kullanılır');
		form.addBool('dayaniksizGaranti', 'Dayanıksız Mal Garanti Takibi');
		
		let tabPage = paramci.addTabPage('hmr', 'HMR').addFormWithParent();
		tabPage.addGridGiris_sabit('_hmr').setRowAttr(null)
			.addStyle_wh(500, 600)
			.setTabloKolonlari(e => {
				const handlers = {
					grid_cellClassName(colDef, rowIndex, belirtec, value, rec) {
						const {key} = rec, result = [belirtec];
						if (belirtec == 'etiket' && !(hmrYapi[key]?.etiketEditable && rec.kullanim))
							result.push('grid-readOnly')
						return result.join(' ')
					},
					grid_cellBeginEdit(colDef, rowIndex, belirtec, colType, value) {
						const rec = colDef.gridPart.gridWidget.getrowdata(rowIndex), {key} = rec;
						if (belirtec == 'etiket' && !(hmrYapi[key]?.etiketEditable && rec.kullanim))
							return false
					},
					grid_cellEndEdit(colDef, rowIndex, belirtec, colType, value) {
						setTimeout(() => colDef.gridPart.gridWidget.render(), 1)
					}
				}
				return [
					new GridKolon({
						belirtec: 'etiket', text: 'Etiket', genislikCh: 25,
						cellClassName: (...args) => handlers.grid_cellClassName(...args), cellBeginEdit: (...args) => handlers.grid_cellBeginEdit(...args), cellEndEdit: (...args) => handlers.grid_cellEndEdit(...args),
						cellValueChanged: e => {
							const {builder, belirtec, gridRec, value} = e, {key} = gridRec, {altInst} = builder;
							gridRec[belirtec] = altInst.hmrEtiket[key] = (value || hmrYapi[key]?.etiket) ?? null
						}
					}),
					new GridKolon({
						belirtec: 'kullanim', text: ' ', genislikCh: 10,
						cellClassName: (...args) => handlers.grid_cellClassName(...args), cellBeginEdit: (...args) => handlers.grid_cellBeginEdit(...args), cellEndEdit: (...args) => handlers.grid_cellEndEdit(...args),
						cellValueChanged: e => {
							const {builder, belirtec, gridRec, value} = e, {key} = gridRec, {altInst} = builder;
							gridRec[belirtec] = altInst.hmr[key] = asBool(value)
						}
					}).tipBool()
				]
			})
			.setSource(e => {
				const {altInst} = e.builder, hmr = altInst.hmr || {}, hmrEtiket = altInst.hmrEtiket || {}, recs = [];
				for (const [key, yapi] of Object.entries(hmrYapi)) {
					const etiket = hmrEtiket[key] || yapi.etiket || key;
					const kullanim = asBool(hmr[key]);
					recs.push({ key: key, etiket: etiket, kullanim: kullanim })
				}
				return recs
			})
			.veriYukleninceIslemi(e =>
				setTimeout(() => e.builder.part.gridWidget.render(), 0))
	}
	paramHostVarsDuzenle(e) {
		e = e || {};
		super.paramHostVarsDuzenle(e); const {hv} = e, {hmrYapi} = this;
		const hmr = this.hmr || {}, hmrEtiket = this.hmrEtiket || {};
		for (const [key, yapi] of Object.entries(hmrYapi)) {
			const {rowAttr, etiketEditable} = yapi;
			if (!rowAttr)
				continue
			hv[rowAttr] = hmr[key];
			if (etiketEditable)
				hv[rowAttr + 'Etiket'] = hmrEtiket[key]
		}
	}
	paramSetValues(e) {
		e = e || {};
		super.paramSetValues(e); const {rec} = e,  {hmrYapi} = this;
		const hmr = this.hmr = this.hmr || {}, hmrEtiket = this.hmrEtiket = this.hmrEtiket || {};
		for (const [key, yapi] of Object.entries(hmrYapi)) {
			const {rowAttr, etiketEditable} = yapi;
			if (!rowAttr)
				continue
			const kullanim = rec[rowAttr];
			if (kullanim != null)
				hmr[key] = kullanim
			if (etiketEditable) {
				const etiket = rec[rowAttr + 'Etiket'];
				if (etiket)
					hmrEtiket[key] = etiket
			}
		}
	}
}
class IK_MQAlimSatisParam extends IK_MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e; const temps = e.temps = e.temps || {};
		let form = temps.siparis_kullanim = paramci.addGrup({ etiket: 'Sipariş Kullanımı' }).addFormWithParent();
		let kullanim = form.addKullanim();
		kullanim.addInfo('ButceKilo').addBool('sipOnay', 'Sipariş İçin Onay Kullanılır');
		form.addInfo('ParcalamaEtiketBilgi').addBool('sipVarsayilanOnaysiz', 'Sipariş Varsayılan Olarak Onaysızdır');
		form.addInfo('ParamVioFisBilgi').addBool('irs2FatKosulGuncelleme', 'İrsaliye -> Fatura Dönüşümünde Fiyat Ve İskontoların Güncellenmesi');

		let tabPage = paramci.addTabPage('genel2', 'Genel-2');
	    form = temps.form_genel2 = tabPage.addGrup({ id: 'genel2', etiket: 'Genel-2' }).addFormWithParent();
		form.addInfo('StokKonusanKod').addBool('fisGirisiOtoHizmet', 'Fişe Yeni Eklenen Satırlar Hizmet Tipinde Olsun');
		kullanim = form.addKullanim();
		kullanim.addInfo('CariKonusanKod').addBool('dogrudanIrsaliye', 'Siparişsiz İrsaliye girişi yapılır');
		kullanim.addBool('dogrudanFatura', 'İrsaliyesiz Fatura girişi yapılır');
		
	    tabPage = paramci.addTabPage('ekmodul', 'Ek Modül');
		form = temps.islem_kullanim = tabPage.addGrup({ id: 'islemKullanim', etiket: 'İşlem Kullanımı' }).addFormWithParent();
		kullanim = form.addKullanim();
		kullanim.addBool('ihracKaydiyla', 'İhraç Kaydıyla');
		kullanim.addInfo('CTTabletGecerlilik').addBool('konsinye', 'Konsinye');
		kullanim.addBool('emanet', 'Emanet');
		kullanim.addBool('fason', 'Fason');
		kullanim.addBool('talepTeklif', 'Talep/Teklif');
		kullanim.addBool('ticariKosul', 'Alım Koşulları');

		tabPage = paramci.addTabPage('if', 'İrs->Fat');
		form = tabPage.addGrup({ etiket: 'İrs->Fat' }).addFormWithParent();
		form.addBool('irs2FatKosulGuncelleme', 'irsaliye -> Fatura dönüşümünde fiyat ve iskontoların güncellenmesi');
		form.addBool('irs2FatEkransalDuzenleme', 'İrs->Fat Ekransal Dönüşüm');
		form.addBool('irs2FatTopluDonusum', 'İrs->Fat Toplu Dönüşüm');
		form.addBool('irs2FatSecerek', 'İrs->Fat Seçerek Dönüşüm');
		form.addBool('irs2FatIrsaliyeBirlestir', 'irs->fat Uygun Satırlar Birleşir');

		tabPage = paramci.addTabPage('sif', 'Sip->İrs/Fat');
		form = temps.sip2_irsFat = tabPage.addGrup({ etiket: 'Sip->İrs/Fat' }).addFormWithParent();
		form.addBool('sip2XSatirlarBirlesir', 'Sip->İrs/Fat Dönüşümde Satırlar Birleşir');
		form.addBool('sip2XKosullarGuncellenir', 'Sip->İrs/Fat Dönüşümde Fiyat ve İskontolar Güncellenir');
		form.addBool('sip2XSipBaglantiZorunlu', 'Sip->İrs/Fat Dönüşümde Sipariş Harici Kayıt Girilemez')
	}
}
class IK_MQAlimGenelParam extends IK_MQAlimSatisParam {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Alım Genel Parametreleri' }
	static get paramKod() { return 'SFAL' }
}
class IK_MQSatisGenelParam extends IK_MQAlimSatisParam {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Satış Genel Parametreleri' }
	static get paramKod() { return 'SFST' }
	
	static paramYapiDuzenle(e){
		super.paramYapiDuzenle(e); const {paramci, temps} = e;
		let form = temps.islem_kullanim;
		let kullanim = form.addKullanim();
		kullanim.addBool('mikroIhracat', 'Mikro İhracat');
		kullanim.addBool('internetSatisi', 'İnternet Satışı');
		
		form = temps.sip2_irsFat;
		form.addInfo('ConvIsaretliSeriler').addBool('sip2Irsaliye', 'Sip -> İrs Dönüşüm Yapılır');
		form.addBool('sip2XSecerek', 'Sip->İrs/Fat Seçerek Dönüşüm');
		form.addBool('sip2XEkransalDuzenleme', 'Sip->İrs/Fat Toplu Dönüşüm');

		let tabPage = paramci.addTabPage('sf', 'Sip->Fat');
		form = tabPage.addGrup().addFormWithParent();
		kullanim = form.addKullanim();
		form.addInfo('ParamFatDagitimKapsami').addBool('sip2Fatura', 'Sip->Fat Dönüşüm Yapılır');

		form = temps.form_genel2;		
		tabPage = paramci.addTabPage('risk', 'Risk');
		form = tabPage.addGrup({ etiket: 'Ticari Belgelerde Kontrol' }).addFormWithParent().yanYana();
		form.addInfo('UretPraMaliyet').addTekSecim('riskIslem', 'Risk İşlem').setTekSecim(LimitKontrol).kodsuz();
		form.addInfo('ParamEntFinDetayTarih').addTekSecim('takipBorc', 'Takip Borç').setTekSecim(LimitKontrol).kodsuz()
	}
}
