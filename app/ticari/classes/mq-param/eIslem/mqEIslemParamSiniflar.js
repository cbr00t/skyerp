class MQEIslemParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return 'PTEFATP' } static get sinifAdi() { return 'e-İşlem Parametreleri' }
	get tekSecimDonusum_receiver() { return this.kural } static get defaultGoruntuOzelPunto() { return 9 }
	get oeParam() { let {char} = this.ozelEntegrator || {}, selector = char; return (this.oe || {})[selector] }
	get gonderimdeKisitKullanilirmi() { return this.kisit?.kullanilirmi }
	get goruntuOzelPunto() { return this._goruntuOzelPunto || this.class.defaultGoruntuOzelPunto }
	get faturaVadeEtiket() { return this._faturaVadeEtiket || 'Fatura Vadesi' }
	static get kullanimKeys() {
		return [
			'redIcinDevredisiYapilsin', 'satirlarBirlessinmi', 'satirBarkod', 'satirIskontoDipteGosterilir',
			'satirKdv', 'satirIskBedeli', 'satirDigerVergi', 'satirNetFiyat', 'satirEFAKoli', 'satirEIrsKoli',
			'satirTakipNo', 'irsDetayBedel', 'ihrDetayKapNosuz', 'ihrDipNetBrutKilo', 'ihrDetayUreticiVeMensei',
			'baslikMusteriKod', 'baslikVade', 'baslikPlasiyer', 'baslikNakliyeSekli',  'baslikTahsilatSekli',
			'musBaslikBabaVeDogum', 'dipNetBrutKilo', 'miktarToplamiKilosuz',  'dipMiktarToplami', 'dipTekstilRBK',
			'subeFislerdeGondericiSubeOlsun', 'ozelConf', 'dipOncekiBakiye', 'dipSonBakiye', 'dipInternetSatis',
			'eFaturaYerineEArsivGoruntuleyici', 'logoKullanilir', 'eFatIcinIslakImza', 'eMusIcinKaseImza',
			'gondericiAliciYanYana', 'koyuCikti', 'firmaLogoUstte', 'kdv0DipteGosterilir',
			'ihracatEskiCizgiliGorunum', '_goruntuOzelPunto', 'kodYerineSiraNo', 'bakiyeDovizliIseAyricaTLBakiye'
		]
	}

	constructor(e = {}) {
		super(e)
		for (let key of ['kural', 'kisit'])
			this[key] ??=  {}
	}
	static paramAttrListeDuzenle({ liste }) {
		super.paramAttrListeDuzenle(...arguments)
		liste.push('efatUzakIP', 'efatWSUzakIP', 'efatGIBAlias', 'earsGIBAlias', 'eirsGIBAlias', 'kdvMuafiyetKod', 'irsMailLojistik')
	}
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); let {paramci} = e
		paramci.addString('anaBolum', 'e-İşlem Ana Bölüm')
		paramci.addModelKullan('ozelEntegrator', 'Özel Entegratör').dropDown().autoBind().noMF().kodsuz()
			.setSource(e => EOzelEntegrator.instance.kaListe)
			.degisince(({ builder: fbd = {}, id, altInst,  builder: { parentBuilder = {} } = {} }) => {
				let {id2Builder} = parentBuilder.id2Builder.oeParam
				let value = altInst?.[id]
				if (typeof value != 'object')
					value = altInst[id] = new EOzelEntegrator(value)
				for (let id of ['wsUser', 'wsPass', 'firmaKodu', 'subeKodu']) {
					let subBuilder = id2Builder[id]
					subBuilder.setAltInst(builder.altInst.oeParam ?? null)
					let {altInst} = subBuilder
					subBuilder.setVisibleKosulu(!!altInst)
					subBuilder.updateVisible()
					if (altInst)
						subBuilder.setValue(altInst[id] ?? '')
				}
			})
		let form = paramci.addKullanim('kullanim').addFormWithParent().yanYana()
		form.addBool('gondericiAliciYanYana', 'Gönderici/Alıcı Yan Yana')
		form.addBool('koyuCikti', 'Koyu Çıktı')
		form.addBool('firmaLogoUstte', 'Firma Logo Üstte')
		form = paramci.addFormWithParent('oeParam').setAltInst(e => e.paramci?.inst?.oeParam)
		form.addString('wsUser', 'WS Kullanıcı').setRowAttr('kullaniciAdi')
		form.addString('wsPass', 'WS Şifre').setRowAttr('sifre')
			.addStyle(`$elementCSS > input { font-size: 80%; text-align: center }`)
		form.addString('firmaKodu', 'Firma Kodu'); form.addString('subeKodu', 'Şube Kodu')
		form.addBool('testmi', 'Test').setAltInst(e => e.paramci?.root?.inst)
		form = paramci.addFormWithParent()
		form.addString('gibAlias', 'GIB Alias').setRowAttr('efatGIBAlias')
		form.addString('eArsGIBAlias', 'e-Arşiv GIB Alias').setRowAttr('earsGIBAlias')
		form.addString('eIrsGIBAlias', 'e-İrs. GIB Alias').setRowAttr('eirsGIBAlias')
		form.addString('_faturaVadeEtiket', 'Fatura Vade Etiket').setRowAttr('faturaVadeEtiket')
		form = paramci.addKullanim().addGrup('Kullanım').addFormWithParent()
		form.addBool('ozelConf', 'Özel Konfigurasyon')
		form.addNumber('_goruntuOzelPunto', 'Görüntü Özel Punto').setRowAttr('goruntuOzelPunto').addStyle_wh(180)
		form.addBool('kodYerineSiraNo', 'Kod Yerine Sıra No'); form.addBool('bakiyeDovizliIseAyricaTLBakiye', 'Dövizli Bakiye için Ayrıca TL Bakiye')
		form = paramci.addAltObject('kisit')
			.setAltInst(e => e.paramci?.inst.kisit)
			.addGrup('Gönderimde Kısıtlama')
			.addFormWithParent()
		form.addBool('kullanilirmi', 'Kullanılır').setRowAttr('gonderimdeTipKisitlamasi')
		form.addBool('fatura', 'Fatura').setRowAttr('gonKisitFatura')
		form.addBool('irsaliye', 'İrsaliye').setRowAttr('gonKisitIrsaliye')
		form.addBool('magaza', 'Mağaza').setRowAttr('gonKisitMagaza')
		form.addBool('musMakbuz', 'Müstahsil Makbuz').setRowAttr('gonKisitMusMakbuz')
		/*for (let item of form.getItems()) { item.setAltInst(altInstci) }*/
		form = paramci.addFormWithParent()
		form.addString('kdvMuafiyetKod', 'KDV Muafiyet Kod').addStyle_wh(130)
	}
	static tekSecimDonusumDuzenle({ liste }) {
		super.tekSecimDonusumDuzenle(...arguments);
		$.extend(liste, {
			shAdi: EIslKural_SHAdi, fason: EIslKural_Fason, doviz: EIslKural_Doviz, aciklamaKapsam: EIslKural_AciklamaKapsam,
			aciklama: EIslKural_Aciklama, miktar: EIslKural_Miktar, fiyat: EIslKural_Fiyat,
			doviz: EIslKural_Doviz, koli: EIslKural_Koli, hmr: EIslKural_HMR,
			irsTarihVeNo: EIslKural_IrsTarihVeNo, irsTarihFormat: EIslKural_IrsTarihFormat,
			irsNoFormat: EIslKural_IrsNoFormat, ihrBrutNet: EIslKural_IhrBrutNet, ihrSatirTekCift: EIslKural_IhrSatirTekCift
		})
	}
	async kaydetSonrasiIslemler(e) {
		let {ozelEntegrator} = this
		if (typeof ozelEntegrator != 'object')
			ozelEntegrator = this.ozelEntegrator = new EOzelEntegrator(ozelEntegrator)
		await super.kaydetSonrasiIslemler(e)
	}
	paramHostVarsDuzenle({ hv }) {
		super.paramHostVarsDuzenle(...arguments)
		let {kullanim, class: { kullanimKeys }} = this
		for (let key of kullanimKeys) {
			let value = kullanim[key]
			if (value != null)
				hv[key] = value
		}
	}
	paramSetValues(e) {
		let {rec, rec: { efatAnaBolum: anaBolum, ozelEntegrator: _oe }} = e
		this.kural = rec.kural ?? this.kural ?? {}
		super.paramSetValues(e)
		let {kullanim, class: { kullanimKeys }} = this
		for (let key of kullanimKeys)
			kullanim[key] = rec[key]
		let ozelEntegrator = new EOzelEntegrator({ char: _oe || ' ' })
		$.extend(this, { anaBolum, ozelEntegrator })
		let oe = this.oe = {
			nesV4: rec.oeNESv4 || {}, innova: rec.oeInnova || {}, edm: rec.oeEDM || {},
			veriban: rec.oeVeriban || {}, eFinans: rec.oeEFinans || {}, nes: rec.oeNES || {},
			uyumsoft: rec.oeUyumsoft || {}, turkkep: rec.oeTurkkep || {}
		};
		let oeKeyDonusum = {
			kullaniciAdi: 'wsUser', sifre: 'wsPass',
			eArsivKullaniciAdi: 'eArsiv_wsUser', eArsivSifre: 'eArsiv_wsPass',
			originatorUserId: 'firmaKodu', institutionId: 'firmaKodu',
			erpKodu: 'firmaKodu', token: 'wsPass'
		}
		for (let p of values(oe)) {
			if (!p)
				continue
			for (let [k, nk] of entries(oeKeyDonusum)) {
				let value = p ? p[k] : undefined
				if (value !== undefined) {
					p[nk] = value
					delete p[k]
				}
			}
		}
		let {oeParam} = this
		if (oeParam) {
			for (let rowAttr of ['kullaniciAdi', 'sifre', 'eArsivKullaniciAdi', 'eArsivSifre']) {
				let value = rec[rowAttr]
				if (value == null)
					continue
				let ioAttr = oeKeyDonusum[rowAttr] ?? rowAttr
				oeParam[ioAttr] = value
			}
			for (let key of ['wsUser', 'wsPass', 'firmaKodu', 'subeKodu']) {
				let value = this[key]
				if (value != null && !oeParam[key])
					oeParam[key] = value
			}
		}
		let keys = ['hmrKodListe', 'hmrKodListeEIrs']
		for (let key of keys)
			this[key] = rec[key] || []
		keys = ['eIhrAlinmayacakKolonlar']
		for (let key of keys)
			this[key] = asSet(rec[key] || {})
		let {kural} = this; for (let key in kural) {
			let recKey = `kural${key[0].toUpperCase()}${key.slice(1)}`
			let value = rec[recKey]
			if (value != null)
				kural[key].char = value || ' '
		}
		kural.shAdi.char = rec.kuralSHAdi || ' '
		kural.hmr.char = rec.kuralHMR || ' '
	}
	getLogoData(e) { return app.params.logocu.getLogoData(e) }
	globalleriSil(e) { app.params.logocu.globalleriSil(e); return this }
}
