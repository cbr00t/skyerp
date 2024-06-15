class MQEIslemParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return 'PTEFATP' } static get sinifAdi() { return 'e-İşlem Parametreleri' }
	get tekSecimDonusum_receiver() { return this.kural } static get defaultGoruntuOzelPunto() { return 9 }
	get oeParam() { const {char} = this.ozelEntegrator || {}, selector = char; return (this.oe || {})[selector] }
	get goruntuOzelPunto() { return this._goruntuOzelPunto || this.class.defaultGoruntuOzelPunto }
	get faturaVadeEtiket() { return this._faturaVadeEtiket || 'Fatura Vadesi' }
	static get kullanimKeys() {
		return [
			'redIcinDevredisiYapilsin', 'satirlarBirlessinmi', 'satirBarkod', 'satirIskontoDipteGosterilir', 'satirKdv', 'satirIskBedeli', 'satirDigerVergi', 'satirNetFiyat', 'satirEFAKoli', 'satirEIrsKoli',
			'satirTakipNo', 'irsDetayBedel', 'ihrDetayKapNosuz', 'ihrDipNetBrutKilo', 'ihrDetayUreticiVeMensei', 'baslikMusteriKod', 'baslikVade', 'baslikPlasiyer', 'baslikNakliyeSekli',  'baslikTahsilatSekli',
			'musBaslikBabaVeDogum', 'dipNetBrutKilo', 'miktarToplamiKilosuz',  'dipMiktarToplami', 'dipTekstilRBK', 'subeFislerdeGondericiSubeOlsun', 'ozelConf', 'dipOncekiBakiye', 'dipSonBakiye', 'dipInternetSatis',
			'eFaturaYerineEArsivGoruntuleyici', 'logoKullanilir', 'eFatIcinIslakImza', 'eMusIcinKaseImza', 'ihracatEskiCizgiliGorunum', '_goruntuOzelPunto', 'kodYerineSiraNo', 'bakiyeDovizliIseAyricaTLBakiye'
		]
	}

	constructor(e) { e = e || {}; super(e); this.kural = e.kural || {} }
	static paramAttrListeDuzenle(e) {
		super.paramAttrListeDuzenle(e); const {liste} = e;
		liste.push('efatUzakIP', 'efatWSUzakIP', 'efatGIBAlias', 'earsGIBAlias', 'eirsGIBAlias', 'kdvMuafiyetKod', 'irsMailLojistik')
	}
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e;
		paramci.addString('anaBolum', 'e-İşlem Ana Bölüm');
		paramci.addModelKullan('ozelEntegrator', 'Özel Entegratör').dropDown().noMF().kodsuz()
			.setSource(e => EOzelEntegrator.instance.kaListe)
			.degisince(e => {
				const {builder} = e, /*oeChar = builder.value?.char ?? builder.value,*/ {id2Builder} = builder.parentBuilder.id2Builder.oeParam;
				const {id, altInst} = builder; let value = altInst[id]; if (typeof value != 'object') { value = altInst[id] = new EOzelEntegrator(value) }
				for (const id of ['wsUser', 'wsPass']) {
					const subBuilder = id2Builder[id]; subBuilder.setAltInst(builder.altInst.oeParam ?? null);
					const {altInst} = subBuilder; subBuilder.setVisibleKosulu(!!altInst); subBuilder.updateVisible();
					if (altInst) { subBuilder.setValue(altInst[id] ?? '') }
				}
			})
		let form = paramci.addFormWithParent('oeParam').setAltInst(e => e.paramci?.inst?.oeParam);
			form.addString('wsUser', 'WS Kullanıcı').setRowAttr('kullaniciAdi'); form.addString('wsPass', 'WS Şifre').setRowAttr('sifre').addStyle(e => `$elementCSS > input { font-size: 80%; text-align: center }`);
		form.addBool('testmi', 'Test').setAltInst(e => e.paramci?.root?.inst);
		form = paramci.addFormWithParent();
			form.addString('gibAlias', 'GIB Alias').setRowAttr('efatGIBAlias'); form.addString('eArsGIBAlias', 'e-Arşiv GIB Alias').setRowAttr('earsGIBAlias'); form.addString('eIrsGIBAlias', 'e-İrs. GIB Alias').setRowAttr('eirsGIBAlias');
			form.addString('_faturaVadeEtiket', 'Fatura Vade Etiket').setRowAttr('faturaVadeEtiket');
		form = paramci.addKullanim().addGrup('Kullanım').addFormWithParent(); form.addBool('ozelConf', 'Özel Konfigurasyon');
			form.addNumber('_goruntuOzelPunto', 'Görüntü Özel Punto').setRowAttr('goruntuOzelPunto').addStyle_wh(180);
			form.addBool('kodYerineSiraNo', 'Kod Yerine Sıra No'); form.addBool('bakiyeDovizliIseAyricaTLBakiye', 'Dövizli Bakiye için Ayrıca TL Bakiye')
	}
	static tekSecimDonusumDuzenle(e) {
		super.tekSecimDonusumDuzenle(e);
		$.extend(e.liste, {
			shAdi: EIslKural_SHAdi, fason: EIslKural_Fason, doviz: EIslKural_Doviz, aciklamaKapsam: EIslKural_AciklamaKapsam,
			aciklama: EIslKural_Aciklama, miktar: EIslKural_Miktar, fiyat: EIslKural_Fiyat, doviz: EIslKural_Doviz, koli: EIslKural_Koli, hmr: EIslKural_HMR,
			irsTarihVeNo: EIslKural_IrsTarihVeNo, irsTarihFormat: EIslKural_IrsTarihFormat, irsNoFormat: EIslKural_IrsNoFormat, ihrBrutNet: EIslKural_IhrBrutNet, ihrSatirTekCift: EIslKural_IhrSatirTekCift
		})
	}
	async kaydetSonrasiIslemler(e) {
		let {ozelEntegrator} = this; if (typeof ozelEntegrator != 'object') { ozelEntegrator = this.ozelEntegrator = new EOzelEntegrator(ozelEntegrator) }
		await super.kaydetSonrasiIslemler(e)
	}
	paramHostVarsDuzenle(e) {
		super.paramHostVarsDuzenle(e); const {hv} = e, {kullanimKeys} = this.class;
		const {kullanim} = this; for (const key of kullanimKeys) { const value = kullanim[key]; if (value != null) { hv[key] = value} }
	}
	paramSetValues(e) {
		e = e || {}; const {rec} = e; this.kural = rec.kural || this.kural || {}; super.paramSetValues(e); $.extend(this, { anaBolum: rec.efatAnaBolum });
		let {kullanimKeys} = this.class; const {kullanim} = this; for (const key of kullanimKeys) { kullanim[key] = rec[key] }
		$.extend(this, { ozelEntegrator: new EOzelEntegrator({ char: rec.ozelEntegrator || ' ' }) });
		const oe = this.oe = {
			innova: rec.oeInnova || {}, edm: rec.oeEDM || {}, veriban: rec.oeVeriban || {}, eFinans: rec.oeEFinans || {}, nes: rec.oeNES || {}, nesV4: rec.oeNESv4 || {},
			uyumsoft: rec.oeUyumsoft || {}, turkkep: rec.oeTurkkep || {}
		};
		const oeKeyDonusum = { kullaniciAdi: 'wsUser', sifre: 'wsPass', eArsivKullaniciAdi: 'eArsiv_wsUser', eArsivSifre: 'eArsiv_wsPass', originatorUserId: 'firmaKodu', institutionId: 'firmaKodu', erpKodu: 'firmaKodu', token: 'wsPass' };
		for (const oeKey in oe) {
			const oeParam = oe[oeKey]; if (!oeParam) { continue }
			for (const [key, newKey] of Object.entries(oeKeyDonusum)) { const value = oeParam ? oeParam[key] : undefined; if (value !== undefined) { oeParam[newKey] = value; delete oeParam[key] } }
		}
		const {oeParam} = this; if (oeParam) {
			for (const rowAttr of ['kullaniciAdi', 'sifre', 'eArsivKullaniciAdi', 'eArsivSifre']) {
				const value = rec[rowAttr]; if (value == null) { continue }
				const ioAttr = oeKeyDonusum[rowAttr] ?? rowAttr; oeParam[ioAttr] = value
			}
		}
		let keys = ['hmrKodListe', 'hmrKodListeEIrs']; for (const key of keys) this[key] = rec[key] || []
		keys = ['eIhrAlinmayacakKolonlar']; for (const key of keys) this[key] = asSet(rec[key] || {})
		const {kural} = this; for (const key in kural) {
			const recKey = `kural${key[0].toUpperCase()}${key.slice(1)}`, value = rec[recKey];
			if (value != null) { kural[key].char = value || ' ' }
		}
		kural.shAdi.char = rec.kuralSHAdi || ' '; kural.hmr.char = rec.kuralHMR || ' '
	}
	getLogoData(e) { return app.params.logocu.getLogoData(e) }
	globalleriSil(e) { app.params.logocu.globalleriSil(e); return this }
}
