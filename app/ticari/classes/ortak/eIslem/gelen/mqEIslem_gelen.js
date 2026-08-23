class MQEIslem_Gelen extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    static get kodListeTipi() { return 'EG' }
    static get sinifAdi() { return 'Gelen e-İşlem' }
    static get secimSinif() { return DonemselSecimler }
    static get gridDetaylimi() { return true }
    static get tumKolonlarGosterilirmi() { return true }
    static get tanimlanabilirmi() { return false }
	static get degistirilebilirmi() { return false }
	static get silinebilirmi() { return false }
	static get raporKullanilirmi() { return false }
	static get kolonDuzenlemeYapilirmi() { return true }

    static listeEkrani_init({ sender: listePart }) {
        super.listeEkrani_init(...arguments)
        
        let { eConf } = listePart
        eConf ??= MQEConf.instance
        
        let tip2EYonetici = {}
        ;[EIslFatura, EIslIrsaliye].forEach(eIslSinif =>
            tip2EYonetici[eIslSinif.tip] = new EYonetici_Gelen({ eConf, eIslSinif }))

		let sorguFiltre = new MQEIslem_Gelen_BekSorguFiltre()
        extend(listePart, { eConf, tip2EYonetici, sorguFiltre })
    }
    static listeEkrani_afterRun({ sender: listePart }) {
        super.listeEkrani_afterRun(...arguments)
    }
    static secimlerDuzenle({ sender: listePart, secimler: sec }) {
        super.secimlerDuzenle(...arguments)

        let { donem: { tekSecim: donem } } = sec
        donem.buAy()

        let grupKod = 'donemVeTarih'
        sec
            .secimTopluEkle({
                seri: new SecimString({ grupKod, etiket: 'Seri' }),
                fisNo: new SecimNumber({ grupKod, etiket: 'Fiş No' }),
                fisNox: new SecimOzellik({ grupKod, etiket: 'Belge Nox' }),
                uuid: new SecimOzellik({ grupKod, etiket: 'UUID (ETTN)' }),
                akibet: new SecimBirKismi({
                    grupKod, etiket: 'Akıbet',
                    tekSecimSinif: EIslemOnayDurum
                }).birKismi()
            })
            .whereBlockEkle(({ where: wh, secimler: sec }) => {
                wh
					.basiSonu(sec.tarihBS, 'fis.tarih')
                    .basiSonu(sec.seri, 'fis.seri')
                    .basiSonu(sec.fisNo, 'fis.fisno')
                    .ozellik(sec.fisNox, 'fis.effatnox')
                    .ozellik(sec.uuid, 'fis.uuid')
                let { akibet: { value: akibet }} = sec
                if (!empty(akibet))
                    wh.birKismi(akibet, 'fis.onaydurumu')
            })
    }
    static islemTuslariDuzenle_listeEkrani(e = {}) {
        super.islemTuslariDuzenle_listeEkrani(e)
        let { sender: listePart, liste, part: butonlarPart } = e
        let { ekSagButonIdSet } = butonlarPart
        
        let withErrCheck = async (islemAdi, args, block) => {
            try { await block?.({ ...e, ...args }) }
            catch (ex) { cerr(ex); hConfirm(getErrorText(ex), islemAdi) }
        }
        
        let items = [
            {
                id: 'bekleyenleriGetir',
				text: '📶',
                handler: _e => void(
                    withErrCheck('Bekleyenleri Getir', _e, args =>
                        this.bekleyenleriGetirIstendi(args))
				)
            },
			{
                id: 'musteriBelirle',
				text: '🧑‍💼✓',
				handler: _e => void(
                    withErrCheck('Müşteri Belirle', _e, args =>
                        this.musteriBelirleIstendi(args))
				)
            },
			{
                id: 'ticariyeAktar',
				handler: _e => void(
                    withErrCheck('Ticariye Aktar', _e, args =>
                        this.ticariyeAktarIstendi(args))
				)
            },
            {
                id: 'eIslemIzle',
                handler: _e =>
                    withErrCheck('e-İşlem İzle', _e, args =>
                        this.eIslemIzleIstendi(args))
            },
			{
                id: 'sil',
                handler: _e =>
                    withErrCheck('e-İşlem SİL', _e, args =>
                        this.eIslemKaldirIstendi(args))
            }
        ]
        
        liste.push(...items)
        extend(ekSagButonIdSet, asSet(items.map(r => r.id)))
    }
    static rootFormBuilderDuzenle_islemTuslari({ sender: listePart, fbd_islemTuslari: fbd }) {
		super.rootFormBuilderDuzenle_islemTuslari(...arguments)
    }
    static orjBaslikListesi_argsDuzenle({ sender: listePart, args }) {
        super.orjBaslikListesi_argsDuzenle(...arguments)
        extend(args, {
            rowsHeight: 60, groupsExpandedByDefault: true,
            showStatusBar: true, showAggregates: true
            // showGroupAggregates: true
        })
    }
    static ekCSSDuzenle({ dataField: k, value: v, rec: r, result: res }) {
		super.ekCSSDuzenle(...arguments)
        switch (k) {
            case 'eIslTipText': {
                v = r.eIslTip?.char ?? r.eIslTip
                switch (v) {
                    case 'IR': {
                        res.push('bg-orangered')
                        break
                    }
                    default: {
                        res.push('bg-lightcyan')
                        break
                    }
                }
				break
            }
            case 'akibetText': {
                v = r.akibet?.char ?? r.akibet
                switch (v) {
                    case '@': {                             // Alıcıya Ulaştı
                        res.push('bg-forestgreen')
                        break
                    }
                    case 'O': {                             // Onay
                        res.push('bg-lightgreen')
                        break
                    }
                    case 'R': {                             // RED
                        res.push('bg-orangered')
                        break
                    }
                    case 'X': {                             // HATA
                        res.push('bg-lightred')
                        break
                    }
                }
                break
            }
            case 'sonucBedel': {
                v = Number(r.sonucBedel)
                res.push(
                    'bold', 'fs-110',
                    ( v < 0 ? 'firebrick' : 'forestgreen' )
                )
                break
            }
        }
    }
    static orjBaslikListesiDuzenle({ sender: listePart, liste }) {
        super.orjBaslikListesiDuzenle(...arguments)
        liste.push(...[
            new GridKolon({ belirtec: 'tamamlandi', text: 'Tamam?', genislikCh: 5 }).noSql().checkedList().tipBool(),
            new GridKolon({ belirtec: 'yazdirildi', text: 'Yazdır?', genislikCh: 5 }).noSql().checkedList().tipBool(),
            new GridKolon({ belirtec: 'eIslTipText', text: 'Belge Tipi', genislikCh: 8 }).noSql().checkedList(),
            ...MQCogul.getKAKolonlar(
                new GridKolon({ belirtec: 'kayitTarih', text: 'Kayıt Tarih', genislikCh: 12 }).tipDate().noSql().checkedList(),
                new GridKolon({ belirtec: 'kayitSaat', text: 'K.Zmn', genislikCh: 9 }).tipTime().noSql().center(),
                true    // auto-reverse in mini-device mode
            ),
            ...MQCogul.getKAKolonlar(
                new GridKolon({ belirtec: 'tarih', text: 'Belge Tarih', genislikCh: 13 }).tipDate().noSql().checkedList(),
                new GridKolon({ belirtec: 'fisNox', text: 'Belge No', genislikCh: 23 }).noSql().checkedList(),
                true    // auto-reverse in mini-device mode
            ),
            ...MQCogul.getKAKolonlar(
                new GridKolon({ belirtec: 'gondericiUnvan', text: 'EF Gönderici Ünvan', genislikCh: 40 }).noSql().checkedList(),
                new GridKolon({ belirtec: 'gondericiVKN', text: 'Gönderici VKN', genislikCh: 11 }).noSql().checkedList(),
                false
            ),
            new GridKolon({ belirtec: 'irsVar', text: 'İrs?', genislikCh: 5 }).noSql().checkedList().tipBool(),
            new GridKolon({ belirtec: 'sonucBedel', text: 'Sonuc Bedel', genislikCh: 23 }).noSql().tipDecimal_bedel().sum().input(),
            ...MQCogul.getKAKolonlar(
                new GridKolon({ belirtec: 'gondericiMustKod', text: 'Vio Cari', genislikCh: 18 }).noSql().checkedList(),
                new GridKolon({ belirtec: 'vioMustUnvan', text: 'Vio Cari Ünvan', genislikCh: 40 }).noSql().checkedList(),
                false
            ),
            new GridKolon({ belirtec: 'uuid', text: 'UUID (ETTN)', genislikCh: 42 }).noSql().checkedList()
        ])
    }
    static async loadServerDataDogrudan({ sender: listePart, wsArgs, secimler: sec }) {
        let { grid } = listePart
        if (listePart._rendered)
            listePart._lastGroups = grid.jqxGrid('groups')
        else
            listePart._rendered = true
        
        let recs = await super.loadServerDataDogrudan(...arguments)
        let ka = { akibet: EIslemOnayDurum.kaDict }
        ;recs.forEach(r => {
            let { eIslTip, kayitTS, akibet } = r
			;['tamamlandi', 'yazdirildi', 'bozuk', 'irsVar'].forEach(k =>
                r[k] = !!r[k])
            extend(r, {
                eIslTipText: EIslemOrtak.getClass(eIslTip)?.kisaAdi ?? eIslTip,
                kayitTarih: asDate(kayitTS)?.clone()?.clearTime(),
                kayitSaat: timeToString(kayitTS),
                akibetText: akibet ? ka.akibet[akibet || ' ']?.aciklama : ''
            })
        })
        return recs
        
        // return []
    }
    static loadServerData_queryDuzenle({ sender: listePart, stm, sent, secimler: sec }) {
        super.loadServerData_queryDuzenle(...arguments)
        
        sent.sahalarVeGroupByVeHavingReset()
        let { where: wh, sahalar } = sent
        let { orderBy } = stm
        ;{
            sent
                .fromAdd('efgecicialfatfis fis')
                .x2CariBagla({ kodClause: 'fis.mustkod' })
            sahalar
                .addWithAlias('fis',
                    'kaysayac sayac', 'kayitts kayitTS', 'efuuid uuid', 'tarih', 'seri', 'noyil noYil',
                    'effatnox fisNox', 'mustkod gondericiMustKod', 'efmustunvan gondericiUnvan', 'vkno gondericiVKN',
					'efsonuc sonucBedel', 'tamamlandi', 'yazdirildimi yazdirildi', 'bozukmu bozuk', 'birsaliyevar irsVar',
					'bizsubekod subeKod', 'degadreskod degAdresKod', 'onaydurumu akibet'
                )
                .add(
                    `(CASE WHEN fis.efbelge = '' THEN 'E' ELSE fis.efbelge END) eIslTip`,
                    'car.birunvan vioMustUnvan'
                )
        }
        orderBy.liste = ['eIslTip', 'kayitTS DESC', 'fisNox']

        /*
            (47) [
                'kaysayac', 'vkno', 'kayitts', 'efatconfkod', 'bizsubekod',
                'efbelge', 'ayrimtipi', 'mustkod',
                'yerkod', 'takipno', 'efmustunvan', 'efuuid', 'althesapkod',
                'tarih', 'effatnox', 'seri', 'noyil', 'no',
                'dvkod', 'dvkur', 'bcarihizmetmi', 'tamamlandi',
                'onaydurumu', 'yazdirildimi', 'iade', 'bozukmu', 'digerdurum',
                'kaynaksayac', 'satirbedelbrutmu', 'ozelentalimrefno', 'efatsenaryotipi', 'efbrut', 'efiskonto',
                'efkdv', 'efotv', 'efstopaj', 'efsonuc',
                'efdvbrut', 'efdviskonto', 'efdvkdv', 'efdvotv', 'efdvstopaj', 'efdvsonuc',
                'birsaliyevar', 'degadreskod', 'id', 'alimanlasmafisdurumu'
            ]
        */
    }
    static gridVeriYuklendi({ sender: listePart, recs }) {
        super.gridVeriYuklendi(...arguments)
    }
    static orjBaslikListesi_groupsDuzenle({ sender: listePart, liste }) {
        super.orjBaslikListesi_groupsDuzenle(...arguments)
        let { _lastGroups: groups } = listePart
        groups ??= ['eIslTipText']
        liste.push(...groups)
    }
	static orjBaslikListesi_satirCiftTiklandi({ sender } = {}) {
		super.orjBaslikListesi_satirCiftTiklandi(...arguments)
		// let { row: rec = e.event?.args ?? {}
		this.eIslemIzleIstendi({ sender })
	}

    static async bekleyenleriGetirIstendi({ sender: listePart } = {}) {
		let islemAdi = 'e-İşlem Bekleyenleri Getir'

		let { sorguFiltre: wsSec } = listePart
		await promise(tamamIslemi => {
			let parentPart = listePart
			let mfSinif = this
			wsSec.duzenlemeEkraniAc({ parentPart, mfSinif, tamamIslemi })
		})
		
		let { tarihBS } = wsSec
		let { value: vknKontrol } = wsSec.vknKontrol
		let { value: aliasKontrol } = wsSec.aliasKontrol
        let recsDuzenle = recs => {
            // debugger
        }
		
        let tip2Res = {}
		let pm = await showProgress('Gelen e-İşlem Belgeleri sorgulanıyor...', islemAdi)
		try {
	        for (let eYon of this.getEYoneticiler({ listePart })) {
	            let { eIslTip: k } = eYon
	            tip2Res[k] = await eYon.bekleyenleriGetirVeKaydet({
					tarihBS, recsDuzenle,
					aliasKontrol, vknKontrol
				})
	        }
			delay(10).then(() =>
				listePart?.tazele?.())
		}
		finally {
			pm?.progressEnd()
			delay(20).then(() =>
				hideProgress())
		}
    }
	static async eIslemIzleIstendi({ sender: listePart } = {}) {
		let islemAdi = 'e-İşlem İZLE'
        let { tip2EYonetici } = listePart
        let totalCount = 0, tip2Recs = {}
        for (let r of listePart.selectedRecs) {
            let { eIslTip: k } = r
            k ||= 'E'
            ;(tip2Recs[k] ??= []).push(r)
			totalCount++
        }
        
        if (empty(tip2Recs))
            throw { isError: true, errorText: 'İzlenecek belgeler seçilmelidir' }
        
        let internal = true
        let tip2Res = {}
		let pm = await showProgress('Gelen e-İşlem Görüntüleri oluşturuluyor...', islemAdi)
		try {
			pm?.setProgressMax(totalCount)
	        for (let [tip, recs] of entries(tip2Recs)) {
	            let eYon = tip2EYonetici[tip]
	            if (eYon) {
		            let { url } = await eYon.eIslemIzle({ recs, internal }) ?? {}
		            if (url) {
		                openNewWindow(url)
		                await delay(20)
		            }
				}
				pm?.progressStep()
	        }
		}
		finally {
			pm?.progressEnd()
			delay(20).then(() =>
				hideProgress())
		}

        return tip2Res
    }
	static async eIslemKaldirIstendi({ sender: listePart } = {}) {
		let islemAdi = 'e-İşlem KALDIR'
        let { tip2EYonetici } = listePart
        let totalCount = 0, tip2Recs = {}
        for (let r of listePart.selectedRecs) {
            let { eIslTip: k } = r
            k ||= 'E'
            ;(tip2Recs[k] ??= []).push(r)
			totalCount++
        }
        
        if (empty(tip2Recs))
            throw { isError: true, errorText: 'Silinecek belgeler seçilmelidir' }

		try {
			let rdlg = await ehConfirm(
				(
					`<p><b class="royalblue">${totalCount} adet</b> Gelen e-İşlem Belgesi <u class="bold red">SİLİNECEKTİR</u></p>` +
					`<p>Devam edilsin mi?</p>`
				),
				islemAdi
			)
			if (!rdlg)
				return
		}
		catch (ex) { return }
		
        let internal = true
        let tip2Res = {}
		let pm = await showProgress(`<b class="royalblue">${totalCount} adet</b> Gelen e-İşlem Belgesi <u class="red">SİLİNİYOR</u>...`, islemAdi)
		try {
			pm?.setProgressMax(totalCount)
	        for (let [tip, recs] of entries(tip2Recs)) {
	            let eYon = tip2EYonetici[tip]
	            if (eYon)
		            tip2Res[tip] = await eYon.eIslemKaldir({ recs, internal }) ?? {}
				pm?.progressStep()
	        }

			let { gridWidget: w } = listePart ?? {}
			w?.clearselection()
			delay(10).then(() =>
				listePart?.tazele?.())
		}
		finally {
			pm?.progressEnd()
			delay(20).then(() =>
				hideProgress())
		}

        return tip2Res
    }
	static async musteriBelirleIstendi({ sender: listePart } = {}) {
		let islemAdi = 'Müşteri Belirle'
		let { eConf, selectedRec: rec } = listePart
		if (!rec) {
			hConfirm('Bir satır seçilmelidir', islemAdi)
			return
		}

		let pr = defer()
		let inst = new MQEIslem_Gelen_EkBilgiUI()
			.tip_musteriBelirle()
			.setTitle('Cari Hesap Belirleme')
			.setParentPart(listePart)
			.setEConf(eConf)
			.setRec(rec)
			.setTamamIslemi(res =>
				void(pr.resolve(res)))
		await inst.run()
		
		let { part } = inst
		part?.kapaninca?.(() =>
			pr.resolve(null))
		
		let res = await pr
		if (!res)
			return

		let { uuid, gondericiMustKod: mustkod, degAdresKod: degadreskod = '' } = res.rec
		if (uuid) {
			let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
			upd.fromAdd('efgecicialfatfis')
			wh.degerAta(uuid, 'efuuid')
			set.birlestirDict({ mustkod, degadreskod })
			await upd.execute()
		}

		listePart?.tazele?.()
		
	}
	static async ticariyeAktarIstendi({ sender: listePart } = {}) {
		let islemAdi = 'e-İşlem Ticariye Aktar'
		let { eConf, selectedRec: rec } = listePart
		function err(errorText) {
			throw { isError: true, errorText }
		}
		if (!rec)
			err('Bir satır seçilmelidir')

		let pr = defer()
		let inst = new MQEIslem_Gelen_EkBilgiUI()
			.tip_ticariAktar()
			.setParentPart(listePart)
			.setEConf(eConf)
			.setRec(rec)
			.setTamamIslemi(res =>
				void(pr.resolve(res)))
		await inst.run()
		
		;{
			let { part } = inst
			part?.kapaninca?.(() =>
				pr.resolve(null))
		}
		
		let res = await pr
		rec = res?.rec
		if (!rec)
			return
		
		let { efbelge: efBelge, ayrimtipi: ayrimTipi, iade: iademi } = rec
		let eIslTip = EYonetici_Gelen.normalizeEFAyrimTipi_giden(efBelge)
		let irsaliyemi = eIslTip == 'IR'
		let fisSinif = FisAyrimTipiBasit.gelenFisSinifFor({ irsaliyemi, iademi, ayrimTipi })
		if (!fisSinif)
			err('Fiş Sınıfı belirlenemedi')

		let { params: { zorunlu } } = app
		let { cariYil } = zorunlu
		
		let gridKontrolcuSinif = EIslAlimGridKontrolcu
		let efDonusumler = EYonetici_Gelen.getEFDonusum(rec)
		let yerRec = await MQStokYer.getVarsayilanYerRec() ?? {}
		
		let { fisNox, gondericiMustKod: mustKod, subeKod, yerKod } = rec
		let tsn = TicariSeriliNo.fromText(fisNox)
		let { tarih, seri, noYil, no: fisNo } = tsn
		tarih = asDate(tarih)
		fisNo ||= cariYil
		subeKod = yerRec.bizsubekod || subeKod
		yerKod = yerRec.kod || yerKod

		let eBilgi = { rec, efDonusumler, gridKontrolcuSinif }
		let fis = new fisSinif({
			tarih, seri, noYil, fisNo,
			subeKod, mustKod, yerKod,
			eBilgi
		})
		
		await fis.eBilgiIcinDetaylariYukle(e)
		fis.rootFormBuilderDuzenle_ekIslem(_e => {
			let { builders: b } = _e
			let { baslikForm: { builders: formlar } } = b
			let { style, tools: t } = SimplePart.ekBilgi_styleAndTools
			;{
				let form = formlar[2]
				form.addForm('_eBilgiText')
					.addStyle(style)
					.addStyle(`$elementCSS { margin-top: 5px !important }`)
					.setLayout(({ builder: { id, inst: fis } }) => {
						let { eBilgi: { rec } } = fis
						let { tarih, fisNox, gondericiUnvan: unvan, gondericiVKN: vkn } = rec
						let tarihStr = asDateAndToKisaString(tarih)
						return $([
	                        `<div class="full-wh">`,
	                            `<div class="parent flex-row full-width">`,
	                                t.ka('tarih', 'Tarih:', tarihStr),
	                                t.ka('fisNox', 'Fiş No:', fisNox),
	                            `</div>`,
	                            `<div class="parent flex-row full-width">`,
	                                t.ka('unvan', 'Gönderici:', unvan),
	                                t.ka('vkn', 'VKN:', vkn, null),
	                            `</div>`,
	                        `</div>`
	                    ].filter(Boolean).join(''))
					})
			}
		})
		
		pr = defer()
		;{
			let { part } = await fis.tanimla({
				islem: 'yeni',
				kaydedince: _e => {
					pr.resolve({ ...e, ..._e })
					fis._kaydedildimi = true
				},
				kapaninca: _e => 
					pr.resolve(null)
			}) ?? {}
		}
		return await pr

		
			

		/*eBilgiIcinYukle(e) {
			super.eBilgiIcinYukle(e)
			let eBilgi = this.eBilgi ?? {}
			let { rec } = eBilgi
			if (!rec)
				return this
			
			let yerRec = eBilgi.yerRec ?? {}
			extend(this, {
				tarih: asDate(rec.tarih), seri: rec.seri,
				noYil: asInteger(rec.noyil), fisNo: asInteger(rec.fisNo),
				mustKod: rec.mustkod, yerKod: yerRec.kod || this.yerKod,
				subeKod: yerRec.bizsubekod || this.subeKod
			})
			
			return this
		}*/
		
		
		/*async fisGirisiYap(e) {
			let { rec } = this, { result } = e
			let irsaliyemi = (rec.efayrimtipi ?? rec.efbelge) == 'IR'
			let ayrimTipi = (rec.ayrimtipi || '').trim(), iademi = !!rec.iade
			let fisSinif = FisAyrimTipiBasit.gelenFisSinifFor({ irsaliyemi, iademi, ayrimTipi })
			if (!fisSinif) {
				extend(result, { isError: true, message: 'Fiş Sınıfı belirlenemedi' })
				return result
			}
			let efDonusumler = await this.getEFDonusumBilgileri()
			let yerRec = await MQStokYer.getVarsayilanYerRec()
			rec.noYil ??= app.params.zorunlu.cariYil
			rec.fisNo = rec.no
			delete rec.no
			
			let eBilgi = { rec, efDonusumler, yerRec, gridKontrolcuSinif: EIslAlimGridKontrolcu }
			let fis = new fisSinif({ eBilgi })
			await fis.eBilgiIcinDetaylariYukle(e)
			
			let promise_fis = new $.Deferred()
			await fis.tanimla({
				islem: 'yeni',
				kaydedince: e => { result.message = 'Fiş kaydedildi'; promise_fis.resolve(true); fis._kaydedildimi = true },
				kapaninca: e => { if (!fis._kaydedildimi) { $.extend(result, { isError: true, message: 'İşlem iptal edildi' }); promise_fis.resolve(false) } }
			})
			await promise_fis
			return result
		}*/
    }

    static getEYoneticiler(e = {}) {
        let { tip2EYonetici, listePart = e.gridPart ?? e.sender } = e
        tip2EYonetici ??= listePart?.tip2EYonetici
        return values(tip2EYonetici)
    }
}
