class TicariApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get vioProgBelirtec() { return null }
	get testBaseClass() { return Ticari_TestBase }
	get yerelParamSinif() { return MQYerelParamTicari }
	constructor(e = {}) {
		super(e)
		extend(this, { satisTipleri: e.satisTipleri })
	}
	paramsDuzenle({ params }) {
		super.paramsDuzenle(...arguments)
		extend(params, {
			logocu: MQLogocu.getInstance(), zorunlu: MQZorunluParam.getInstance(), isyeri: MQIsyeri.getInstance(),
			ticariGenel: MQTicariGenelParam.getInstance(), aktarim: MQAktarimParam.getInstance(),
			fiyatVeIsk: MQFiyatVeIskontoParam.getInstance(), stokBirim: MQStokBirimParam.getInstance(), stokGenel: MQStokGenelParam.getInstance(),
			cariGenel: MQCariGenelParam.getInstance(), hizmetGenel: MQHizmetGenelParam.getInstance(),
			demirbasGenel: MQDemirbasGenelParam.getInstance(), bankaGenel: MQBankaGenelParam.getInstance(),
			alim: MQAlimParam.getInstance(), satis: MQSatisParam.getInstance(), eIslem: MQEIslemParam.getInstance(),
			uretim: MQUretimParam.getInstance(), operGenel: MQOperGenelParam.getInstance(),
			finans: MQFinansParam.getInstance(), maliyet: MQMaliyetParam.getInstance(),
			kalite: MQKaliteParam.getInstance(), muhasebe: MQMuhasebeParam.getInstance(),
			web: MQWebParam.getInstance(), eMailVT: MQVTMailParam.getInstance(), eMailOrtak: MQOrtakMailParam.getInstance(),
			vergi: MQVergiParam.getInstance(), proforma: MQProformaParam.getInstance()
		})
	}
	sabitTanimlarDuzenle(e = {}) { super.sabitTanimlarDuzenle(e); const {sabitTanimlar} = e; $.extend(sabitTanimlar, { vergi: this.wsSabitTanimlar_xml('EBYN-KDV-Kodlar') }) }
	static tumModulleriDuzenle({ liste }) {
		super.tumModulleriDuzenle(...arguments)
		liste.push(
			...Modul.subClasses
			/*Modul_CokluSube, Modul_EDefter, Modul_Demirbas, Modul_ETicaret, Modul_WebRapor, Modul_WebOzetRapor, Modul_TicariKosul, Modul_Promosyon, Modul_MasrafYeri, Modul_SicakSatis,
			Modul_DisTicaret, Modul_EIslem, Modul_EIrsaliye, Modul_EMustahsil, Modul_Emanet, Modul_Fason, Modul_MustahsilMakbuzu, Modul_TalepTeklif, Modul_TicariPDKS, Modul_Magaza, Modul_YazarKasa,
			Modul_Kalite, Modul_Uretim, Modul_UretimMaliyetMuhasebesi, Modul_SuperAgac, Modul_RBK, Modul_Tekstil, Modul_SevkiyatPlani, Modul_TabletDepo, Modul_TabletSahaSatis,
			Modul_TabletSutToplama, Modul_SutAlim, Modul_UygunsuzlukYonetimi, Modul_OfflineSube, Modul_KonsinyeLojistik, Modul_SiteYonetim*/
		)
	}
	raporEkSahaDosyalariDuzenle({ liste }) {
		super.raporEkSahaDosyalariDuzenle(...arguments)
		liste.push('VioTicari.RaporEkSaha')
	}
	async afterRun(e) {
		await super.afterRun(e)
		// await this.ilkIslemler(e)
		await this.anaMenuOlustur(e)
		this.show()
	}
	async ilkIslemler(e) {
		await super.ilkIslemler(e)
		let { offlineMode } = this
		if (!offlineMode) {
			try { this.violetmi = await app.sqlHasTable('isemri') }
			catch (ex) { cerr(ex) }
		}
	}
	/*async getAnaMenu() {
		let url = this.getWSUrl({ api: 'frMenu' })
		let res = await ajaxGet({ url })
		return res ? FRMenu.from(res) : null
	}*/
	getAnaMenu(e) {
		let { noMenuFlag, mainRaporBase } = this
		if (noMenuFlag)
			return new FRMenu()
		
		let { dev } = config, { isAdmin } = config.session ?? {}
		let { inNewWindow } = qs
		let items = [
			new FRMenuCascade({
				mne: 'G', text: 'Genel', items: [
					new FRMenuChoice({ mne: 'I', text: 'İşyeri Tanımı', block: e => MQIsyeri.tanimla(e) }),
					new FRMenuChoice({ mne: 'S', text: 'Şube Liste', block: e => MQSube.listeEkraniAc(e) }),
				]
			}),
			new FRMenuCascade({
				mne: 'S', text: 'Stok', items: [
					new FRMenuChoice({ mne: 'K', text: 'Stok Kod Liste', block: e => MQStok.listeEkraniAc(e) }),
					new FRMenuCascade({
						mne: 'H', text: 'HMR', items: [
							new FRMenuChoice({ mne: 'M', text: 'Model Liste', block: e => MQModel.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'R', text: 'Renk Liste', block: e => MQRenk.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'D', text: 'Desen Liste', block: e => MQDesen.listeEkraniAc(e) }),
						]
					}),
					new FRMenuCascade({
						mne: 'H', text: 'Hareket', items: [
							new FRMenuChoice({ mne: 'G', text: 'Stok Giriş Fiş', block: e => StokGirisFis.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'C', text: 'Stok Çıkış Fiş', block: e => StokCikisFis.listeEkraniAc(e) })
						]
					}),
					new FRMenuCascade({
						mne: 'G', text: 'Genel', items: [
							new FRMenuChoice({ mne: 'G', text: 'Grup Liste', block: e => MQStokGrup.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'C', text: 'İstatistik Grup Liste', block: e => MQStokIstGrup.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'A', text: 'Ana Grup Liste', block: e => MQStokAnaGrup.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'Y', text: 'Yer Liste', block: e => MQStokYer.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'I', text: 'Stok İşlem Liste', block: e => MQStokIslem.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'B', text: 'Barkod Referans Liste', block: e => MQBarkodReferans.listeEkraniAc(e) }),
						]
					}),
					new FRMenuCascade({
						mne: 'R', text: 'Rapor', items: [
							new FRMenuChoice({ mne: 'S', text: 'Son Stok Raporu', block: e => SonStokRapor.raporEkraniAc(e) })
						]
					})
				]
			}),
			new FRMenuCascade({
				mne: 'H', text: 'Hizmet', items: [
					new FRMenuChoice({ mne: 'K', text: 'Hizmet Kod Liste', block: e => MQHizmet.listeEkraniAc(e) })
				]
			}),
			new FRMenuCascade({
				mne: 'D', text: 'Demirbaş', items: [
					new FRMenuChoice({ mne: 'K', text: 'Demirbaş Kod Liste', block: e => MQDemirbas.listeEkraniAc(e) })
				]
			}),
			new FRMenuCascade({
				mne: 'K', text: 'Kasa', items: [
					new FRMenuChoice({ mne: 'K', text: 'Kasa Kod Liste', block: e => MQKasa.listeEkraniAc(e) }),
					new FRMenuCascade({
						mne: 'F', text: 'Fişler', items: [
							new FRMenuChoice({ mne: 'KH', text: 'Kasa Hizmet Fişleri', block: e => KasaHizmetFis.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'KC', text: 'Kasa Tahsilat/Ödeme Fişleri', block: e => KasaCariFis.listeEkraniAc(e) })
						]
					})
				]
			}),
			new FRMenuCascade({
				mne: 'B', text: 'Banka', items: [
					new FRMenuChoice({ mne: 'B', text: 'Banka Kod Liste', block: e => MQBanka.listeEkraniAc(e) }),
					new FRMenuChoice({ mne: 'H', text: 'Banka Hesap Liste', block: e => MQBankaHesap.listeEkraniAc(e) }),
					new FRMenuChoice({ mne: 'P', text: 'POS Hesap Liste', block: e => MQPosHesap.listeEkraniAc(e) }),
					new FRMenuChoice({ mne: 'K', text: 'Kredi Kartı Liste', block: e => MQKrediKarti.listeEkraniAc(e) }),
					new FRMenuCascade({
						mne: 'F', text: 'Fişler', items: [
							new FRMenuChoice({ mne: 'PT', text: 'POS Tahsil', block: e => PosTahsilFis.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'KO', text: 'Kredi Kartı ile Cari Ödeme', block: e => KrediKartiIleOdemeFis.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'KM', text: 'Kredi Kartı ile Masraf Ödeme', block: e => KrediKartiIleMasrafOdemeFis.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'HG', text: 'Gönderilen Havale/EFT', block: e => HEGonderilenFis.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'HL', text: 'Gelen Havale/EFT', block: e => HEGelenFis.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'HK', text: 'Kendimize Havale/EFT', block: e => HEKendimizeFis.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'BT', text: 'Banka Toplu İşlem', block: e => BankaTopluIslemFis.listeEkraniAc(e) })
						]
					})
				]
			}),
			new FRMenuCascade({
				mne: 'C', text: 'Cari', items: [
					new FRMenuChoice({ mne: 'C', text: 'Cari Hesap Liste', block: e => MQCari.listeEkraniAc(e) }),
					new FRMenuChoice({ mne: 'P', text: 'Plasiyer Liste', block: e => MQPlasiyer.listeEkraniAc(e) }),
					new FRMenuCascade({
						mne: 'F', text: 'Fişler', items: [
							new FRMenuChoice({ mne: 'CH', text: 'Cari Hizmet Fişleri', block: e => CariHizmetFis.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'CI', text: 'Cari Toplu İşlem Fişleri', block: e => CariTopluIslemFis.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'CD', text: 'Cari Devir Fişleri', block: e => CariDevirFis.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'CT', text: 'Cari Tahsilat Fişleri', block: e => CariTahsilatFis.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'CO', text: 'Cari Ödeme Fişleri', block: e => CariOdemeFis.listeEkraniAc(e) })
						]
					}),
					new FRMenuCascade({
						mne: 'D', text: 'Diğer', items: [
							new FRMenuChoice({ mne: 'A', text: 'Alt Hesap Liste', block: e => MQAltHesap.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'G', text: 'Alt Hesap Grup Liste', block: e => MQAltHesapGrup.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'O', text: 'e-İşlem Özel Yöntem', block: e => MQEIslOzelYontem.listeEkraniAc(e) })
						]
					})
				]
			}),
			new FRMenuCascade({
				mne: 'V', text: 'Vergi', items: [
					new FRMenuChoice({ mne: 'K', text: 'Vergi Kod Liste', block: e => MQVergi.listeEkraniAc(e) })
				]
			}),
			new FRMenuCascade({
				mne: 'A', text: 'Alım', items: [
					new FRMenuChoice({ mne: 'EI', text: '<span class="green bold">Gelen e-İşlem Listesi</span>', block: e => GelenEIslemListePart.listele(e) }),
					new FRMenuChoice({ mne: 'AF', text: 'Alım Fatura Listesi', block: e => AlimFaturaFis.listeEkraniAc(e) }),
					new FRMenuChoice({ mne: 'AI', text: 'Alım İrsaliye Listesi', block: e => AlimIrsaliyeFis.listeEkraniAc(e) }),
					new FRMenuChoice({ mne: 'AS', text: 'Alım Sipariş Listesi', block: e => AlimSiparisFis.listeEkraniAc(e) }),
					new FRMenuCascade({
						mne: 'I', text: 'İADE', items: [
							new FRMenuChoice({ mne: 'AF', text: 'Alım İADE Fatura Listesi', block: e => AlimIadeFaturaFis.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'AI', text: 'Alım İADE İrsaliye Listesi', block: e => AlimIadeIrsaliyeFis.listeEkraniAc(e) })
						]
					}),
					new FRMenuCascade({
						mne: 'D', text: 'Diğer', items: [
							new FRMenuChoice({ mne: 'V', text: 'Gelen e-İşlem VKN Referans Listesi', block: e => MQEIslVKNRef.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'S', text: 'Gelen e-İşlem SH Referans Listesi', block: e => MQEIslSHRef.listeEkraniAc(e) })
						]
					}),
					new FRMenuCascade({
						mne: 'P', text: 'Parametreler', items: [
							new FRMenuChoice({ mne: 'A', text: 'Alım Parametreleri', block: e => app.params.alim.tanimla(e) })
							// new FRMenuChoice({ mne: 'E2', text: 'e-İşlem 2. Parametreleri', block: e => app.params.eIslem2.tanimla(e) })
						]
					})
				]
			}),
			new FRMenuCascade({
				mne: 'T', text: 'Satış', items: [
					new FRMenuChoice({ mne: 'EI', text: '<span class="royalblue bold">Giden e-İşlem Listesi</span>', block: e => GidenEIslemListePart.listele() }),
					new FRMenuChoice({ mne: 'TF', text: 'Satış Fatura Listesi', block: e => SatisFaturaFis.listeEkraniAc(e) }),
					new FRMenuChoice({ mne: 'TI', text: 'Satış İrsaliye Listesi', block: e => SatisIrsaliyeFis.listeEkraniAc(e) }),
					new FRMenuChoice({ mne: 'TS', text: 'Satış Sipariş Listesi', block: e => SatisSiparisFis.listeEkraniAc(e) }),
					new FRMenuCascade({
						mne: 'I', text: 'İADE', items: [
							new FRMenuChoice({ mne: 'TF', text: 'Satış İADE Fatura Listesi', block: e => SatisIadeFaturaFis.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'TI', text: 'Satış İADE İrsaliye Listesi', block: e => SatisIadeIrsaliyeFis.listeEkraniAc(e) })
						]
					}),
					new FRMenuCascade({
						mne: 'S', text: 'ŞABLON', items: [
							new FRMenuChoice({ mne: 'S', text: 'Fatura Şablon Listesi', block: e => SatisFaturaFis.otoSablonSinif?.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'O', text: 'Şablondan Fatura Oluştur', block: e => SatisFaturaFis.otoSablonSinif?.faturaOlusturIslemi(e) })
						]
					}),
					new FRMenuCascade({
						mne: 'G', text: 'Genel', items: [
							new FRMenuChoice({ mne: 'RT', text: 'Satış Rotası', block: e => MQSatisRota.listeEkraniAc(e) }),
							new FRMenuChoice({ mne: 'SC', text: 'Stok-Cari Referans', block: e => MQStokCariRef.listeEkraniAc(e) })
						]
					}),
					new FRMenuCascade({
						mne: 'P', text: 'Parametreler', items: [
							new FRMenuChoice({ mne: 'S', text: 'Satış Parametreleri', block: e => app.params.satis.tanimla(e) }),
							new FRMenuChoice({ mne: 'EI', text: 'e-İşlem Parametreleri', block: e => app.params.eIslem.tanimla(e) })
							// new FRMenuChoice({ mne: 'E2', text: 'e-İşlem 2. Parametreleri', block: e => app.params.eIslem2.tanimla(e) })
						]
					})
				]
			}),
			new FRMenuCascade({
				mne: 'F', text: 'Finans', items: [
					new FRMenuCascade({
						mne: 'H', text: 'Hizmet', items: [
							new FRMenuCascade({
								mne: 'F', text: 'Fişler', items: [
									new FRMenuChoice({ mne: 'KH', text: 'Kasa Hizmet Fişleri', block: e => KasaHizmetFis.listeEkraniAc(e) }),
									new FRMenuChoice({ mne: 'CH', text: 'Cari Hizmet Fişleri', block: e => CariHizmetFis.listeEkraniAc(e) }),
									new FRMenuChoice({ mne: 'BH', text: 'Banka Hizmet Fişleri', block: e => BankaHizmetFis.listeEkraniAc(e) })
								]
							})
						]
					})
				]
			}),

			new FRMenuCascade({
				mne: 'T', text: 'Ticari', items: [
					new FRMenuChoice({ mne: 'T', text: 'Tahsil Şekli listesi', block: e => MQTahsilSekli.listeEkraniAc(e) })
				]
			}),

			new FRMenuCascade({
				mne: 'M', text: 'Muhasebe', items: [
					new FRMenuChoice({ mne: 'H', text: 'Muhasebe Hesap listesi', block: e => MQMuhHesap.listeEkraniAc(e) })
				]
			}),
			new FRMenuCascade({
				mne: 'P', text: 'Parametreler', items: [
					new FRMenuChoice({ mne: 'ZR', text: 'Zorunlu Parametreler', block: e => app.params.zorunlu.tanimla(e) }),
					new FRMenuChoice({ mne: 'TG', text: 'Ticari Genel Parametreleri', block: e => app.params.ticariGenel.tanimla(e) }),
					new FRMenuChoice({ mne: 'AK', text: 'Aktarım Parametreleri', block: e => app.params.aktarim.tanimla(e) }),
					new FRMenuChoice({ mne: 'WB', text: 'Web Parametreleri', block: e => app.params.web.tanimla(e) })
				]
			})
		]
		
		return new FRMenu({ items })
	}
	async getMailParam(e) {
		let  {eMailKeys } = MQEMailUst, { params } = this
		let setValues = (source, target) => {
			if (!(source && target)) { return }
			for (let key of eMailKeys) { let value = source[key]; if (value) { target[key] = value } }
			target.port = target.port || target.defaultPort
		}
		let recs = await MQEMailUst.loadServerData(e); if (!recs?.length) {
			let {eMailVT, eMailOrtak} = params, rec;
			for (let param of [eMailOrtak, eMailVT]) {
				if (!param) { continue }
				if (rec == null) { rec = new MQEMailUst() }
				setValues(param, rec); recs = [rec]
			}
		}
		;{
			let rec = recs?.length <= 1 ? recs?.[0] : recs[asInteger(now().getTime()) % recs.length];
			if ($.isPlainObject(rec)) {
				let inst = new MQEMailUst(); await inst.setValues({ rec });
				rec = inst
			}
			return rec
		}
	}
	satisTipleriBelirle(e = {}) {
		let sent = new MQSent({ from: 'satistipi', sahalar: ['kod', 'aciklama'] })
		return app.sqlExecSelect(sent).then(recs => this.satisTipleri = recs)
	}
	wsSabitTanimlar_xml(e = {}) { if (e && !isObject(e)) e = { belirtec: e }; return this.wsSabitTanimlar($.extend({}, e, { tip: 'xml' })) }
	wsSabitTanimlar_secIni(e = {}) { if (e && !isObject(e)) e = { belirtec: e }; return this.wsSabitTanimlar($.extend({}, e, { tip: 'sec-ini' })) }
	wsSabitTanimlar_secIni_noDict(e = {}) { if (e && !isObject(e)) e = { belirtec: e }; return this.wsSabitTanimlar_secIni($.extend({}, e, { noDict: true })) }
	wsSabitTanimlar_ini(e = {}) { if (e && !isObject(e)) e = { belirtec: e }; return this.wsSabitTanimlar($.extend({}, e, { tip: 'ini' })) }
	wsSabitTanimlar_ini_noDict(e = {}) { if (e && !isObject(e)) e = { belirtec: e }; return this.wsSabitTanimlar_ini($.extend({}, e, { noDict: true })) }
	async wsSabitTanimlar(e = {}) {
		let args = isObject(e) ? { ...e } : { belirtec: e }
		args.tip ||= 'xml'
		;['belirtec', 'section', 'belirtecler', 'sections']
			.filter(k => !isString(k))
			.forEach(k => {
				let v = args[k]
				v = args[k] = ( isObject(v) ? keys(v) : makeArray(v) )
					.filter(Boolean)
					.join(delimWS)
			})
		
		let url = this.getWSUrl({ api: 'sabitTanimlar', args })
		let result = await ajaxGet({ url })
		return result ?? null
	}
	wsPlasiyerIcinCariler(e = {}) {
		return ajaxPost({
			timeout: 10 * 60000,
			processData: false, ajaxContentType: wsContentTypeVeCharSet,
			url: app.getWSUrl({ wsPath: 'ws/genel', api: 'plasiyerIcinCariler', args: e })
		})
	}
	/*wsTopluDurum(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({
			timeout: 300000, processData: false, ajaxContentType: wsContentType,
			url: app.getWSUrl({ wsPath: 'ws/genel', api: 'topluDurum', args: e })
		})
	}*/
	wsTicQueryRun(e = {}) {
		let {
			smTipi,    // smTipi: { null: Hepsi | 'S': Sadece Satıcı | 'M': Sadece Müşteri }
			method,
			plasiyereBagliOlanlar = e.sadecePlasiyereBagliOlanlar,
			filtre = {}
		} = e

		for (let [k, v] of entries(filtre))
			filtre[k] = makeArray(v)

		let { plasiyer } = filtre
		smTipi ||= null
		plasiyereBagliOlanlar ??= !empty(plasiyer)
		
		// let { plasiyer, must, bolge } = filtre
		let getFilterParam = k => {
			let vals = filtre[k.toLowerCase()] 
			if (empty(vals))
				return null

			let name = `@arg${k}Liste`
			let value = vals.map(kod => ({ kod }))
			return { name, type: 'structured', typeName: 'type_charList', value }
		}
		let params = [
			getFilterParam('Plasiyer'),
			getFilterParam('Must'),
			getFilterParam('Tip'),
			getFilterParam('Bolge'),
			( plasiyereBagliOlanlar != null ? { name: '@argSadecePlasiyereBagliOlanlar', type: 'bit', value: bool2Int(plasiyereBagliOlanlar) } : null ),
			( smTipi ? { name: '@argSMTipi', type: 'char', size: 1, value: smTipi } : null ),
			( method ? { name: '@argRutin', type: 'nvarchar', value: method } : null )
		].filter(Boolean)
		return this.sqlExecSP({ query: 'tic_queryRun', params })
	}
	wsTopluDurum({ plasiyerKod, mustKod } = {}) {
		return this.wsTicQueryRun({
			method: 'tic_topluDurum',
			filtre: { plasiyer: plasiyerKod, must: mustKod },
			...arguments[0]
		}).catch(() => {
			let params = [
				(plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null),
				(mustKod ? { name: '@argMustKod', value: mustKod } : null)
			].filter(Boolean)
			return this.sqlExecSP({ query: 'tic_topluDurum', params })
		})
	}
	wsTicKapanmayanHesap({ plasiyerKod, mustKod } = {}) {
		return this.wsTicQueryRun({
			method: 'tic_kapanmayanHesap2',
			filtre: { plasiyer: plasiyerKod, must: mustKod },
			...arguments[0]
		}).catch(() => {
			let { params: par } = app
			let { yaslandirmaTarihmi } = par.finans ?? {}
			let params = [
				( plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null ),
				( mustKod ? { name: '@argMustKod', value: mustKod } : null ),
				{ name: '@argSadecePlasiyereBagliOlanlar', type: 'bit', value: bool2Int(!!plasiyerKod) },
				( yaslandirmaTarihmi ? { name: '@argGecikmeTarihten', type: 'bit', value: bool2Int(yaslandirmaTarihmi) } : null )
			].filter(Boolean)
			return this.sqlExecSP({ query: 'tic_kapanmayanHesap', params })
		})
	}
	wsTicCariEkstre({ plasiyerKod, mustKod } = {}) {
		return this.wsTicQueryRun({
			...arguments[0],
			method: 'tic_cariEkstre2',
			filtre: { plasiyer: plasiyerKod, must: mustKod },
			...arguments[0]
		}).catch(() => {
			let params = [
				(plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null),
				(mustKod ? { name: '@argMustKod', value: mustKod } : null),
				{ name: '@argSadecePlasiyereBagliOlanlar', value: bool2Int(!!plasiyerKod) }
			].filter(Boolean)
			return this.sqlExecSP({ query: 'tic_cariEkstre', params })
		})
	}
	wsTicCariEkstre_icerik({ plasiyerKod, mustKod, cariTipKod } = {}) {
		return this.wsTicQueryRun({
			...arguments[0],
			method: 'tic_ticariIcerik2',
			filtre: { plasiyer: plasiyerKod, must: mustKod, tip: cariTipKod },
			...arguments[0]
		}).catch(() => {
			let params = [
				( plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null ),
				( mustKod ? { name: '@argMustKod', value: mustKod } : null ),
				{ name: '@argSadecePlasiyereBagliOlanlar', value: bool2Int(!!plasiyerKod) }
			].filter(Boolean)
			return this.sqlExecSP({ query: 'tic_ticariIcerik', params })
		})
	}
	wsCariEkstre_normal(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'cariEkstre_normal', args: e }) })
	}
	wsCariEkstre_fiili(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'cariEkstre_fiili', args: e }) })
	}
	wsCariEkstre_detaylar(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'cariEkstre_detaylar', args: e }) })
	}
	wsBekleyenSiparisler(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'bekleyenSiparisler', args: e }) })
	}
	wsBekleyenSiparisler_detaylar(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'bekleyenSiparisler_detaylar', args: e }) })
	}
	wsSiparisler(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'siparisler', args: e }) })
	}
	wsSiparisler_detaylar(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'siparisler_detaylar', args: e }) })
	}
	wsBekleyenIrsaliyeler(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'bekleyenIrsaliyeler', args: e }) })
	}
	wsBekleyenIrsaliyeler_detaylar(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'bekleyenIrsaliyeler_detaylar', args: e }) })
	}
	wsIrsaliyeler(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'irsaliyeler', args: e }) })
	}
	wsIrsaliyeler_detaylar(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'irsaliyeler_detaylar', args: e }) })
	}
	wsFaturalar(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'faturalar', args: e }) })
	}
	wsFaturalar_detaylar(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'faturalar_detaylar', args: e }) })
	}
	wsFaturalar_dip(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'faturalar_dip', args: e }) })
	}
	wsStokSonSatisSip(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'stokSonSatisSip', args: e }) })
	}
	async getParamYapilar(e = {}) {
		let kodListe = isString(e) ? [e] : isArray(e) ? e : (e.kodListe || e.kod)
		let sent = new MQSent({
			from: 'yflaglar',
			where: [`kod <> ''`, `jsonstr <> ''`],
			sahalar: ['kod', 'jsonstr']
		})
		if (kodListe?.length)
			sent.where.inDizi(kodListe, 'kod')
		let kod2Rec = {}
		let recs = await app.sqlExecSelect(sent)
		for (let rec of recs)
			kod2Rec[rec.kod] = rec.jsonstr ? JSON.parse(rec.jsonstr) : null
		return kod2Rec
	}
	wsLogoBilgileri(e = {}) {
		deleteKeys(e, 'data', 'args')
		let streamFlag = e.stream ?? e.streamFlag ?? e.isStream
		let dataType = streamFlag ? 'text' : undefined
		return ajaxGet({ timeout: 30000, processData: false, dataType, ajaxContentType: wsContentType, url: app.getWSUrl({ api: 'logoBilgileri', args: e }) })
	}
	wsLogoBilgileriAsStream(e = {}) {
		e.stream = true
		deleteKeys(e, 'streamFlag', 'isStream')
		return this.wsLogoBilgileri(e)
	}
}

/*
offset = 5010;
limit = 10;
await ajaxPost({
	cache: false, processData: false,
	dataType: 'json', contentType: 'application/json',
	url: `http://localhost:8200/ws/skyERP/sqlExec/?`+ $.param({
		loginTipi: 'login', user: 'OZER', pass: '',
		offset: offset, maxRow: limit,
		sql: Ortak.toJSONStr({ db: 'BM22ARM' })
	}),
	data: Ortak.toJSONStr({
		execTip: 'dt',
		queries: [
			{ query: `SELECT ${limit ? 'TOP ' + (offset + limit) : ''} * FROM stkmst WHERE kod <> ''` }
		]
	})
});


xw = new XMLWriter();
xw.writeStartDocument();
xw.writeStartElement('cac:Invoice');
xw.writeAttributeString('xmlns', 'http://tempuri.org');
xw.writeAttributeString('xmlns:cac', 'http://cac');
xw.writeAttributeString('xmlns:cbc', 'http://cbc');
xw.writeElementString('ID', 'abc', 'cbc')
xw.writeEndElement();
xw.writeEndDocument();

xml = xw.flush();
console.info(xml);

url = URL.createObjectURL(new Blob([xml], { type: 'application/xml' }))
openNewWindow(url)


document.body.focus();
document.body.scrollTo(0, 0);
html2canvas(app.divMenu[0], { imageTimeout: 3000, removeContainer: true }).then(canvas => {
	img = canvas.toDataURL('image/png');
    doc = new jspdf.jsPDF({ unit: 'px', orientation: 'landscape' });
    doc.addImage(img, 'PNG', 0, 0);
    doc.save()
})

doc = new jspdf.jsPDF({ unit: 'px', orientation: 'landscape' });
doc.html($(`<b>bla bla</b>`)[0], { callback: doc => doc.save() })


== TEST (threaded) ==
const {ws} = config, _session = config.session, session = { loginTipi: _session.loginTipi, user: _session.user, pass: _session.pass, sessionID: _session.sessionID };
const test = new Ticari_TrnListTest({ ws, session }); await test.delay(50).multiWorker().threadedRun(1)

== TEST (runSync) ==
const {ws} = config, _session = config.session, session = { loginTipi: _session.loginTipi, user: _session.user, pass: _session.pass, sessionID: _session.sessionID };
const test = new Ticari_TrnListTest({ ws, session }); await test.delay(50).runSync(-1);
// test.stop()
*/
