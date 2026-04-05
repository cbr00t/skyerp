class TabFis extends MQDetayliGUIDOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, '_dipIslemci'] }
	static get araSeviyemi() { return this == TabFis }
	static get fisTipi() { return this.kodListeTipi }
	static get sinifAdi() { return 'Tablet Fiş' }
	static get table() { return 'tabfis' } static get tableAlias() { return 'fis' }
	static get detaySinif() { return TabDetay } static get sayacSaha() { return 'id' }
	static get tanimUISinif() { return TabFisGirisPart } static get secimSinif() { return null }
	static get dipKullanilirmi() { return false }
	static get dipSinif() { return TabIcmal }
	static get dipGirisYapilirmi() { return true }
	// static get gridIslemTuslariKullanilirmi() { return false }
	static get tanimlanabilirmi() { return true }
    static get degistirilebilirmi() { return true }
    static get silinebilirmi() { return true }
	static get kolonFiltreKullanilirmi() { return false }
	static get raporKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return true }
	static get noAutoFocus() { return true }
	static get gonderildiDesteklenirmi() { return true }
	static get merkezKayitlarAlinirmi() { return false }
	static get offlineFis() { return true }
	static get almSat() { return null }
	static get satismi() { return this.almSat == 'T' }
	static get alimmi() { return this.almSat == 'A' }
	static get numTipKod() { return this.fisTipi }
	get numTipKod() { return this.class.numTipKod || 'TB' }
	get numKod() { return this.class.getNumKod(this.numTipKod, this.eIslTip, this.yildizlimi) }
	get defaultSeri() { return 'TAB' }
	get eIslemmi() { return !this.yildizlimi && this.eIslTip }
	get eFatmi() { return this.eIslemmi && this.eIslTip != 'A' }
	static get mustZorunlumu() { return true }
	static get _bedelKullanilirmi() { return false }
	static get eIslemKullanilirmi() { return false }
	static get dokumFormTip_normal() { return null }
	static get dokumFormTip_eIslem() { return this.dokumFormTip_normal }
	get dokumFormTip_normal() { return this.class.dokumFormTip_normal }
	get dokumFormTip_eIslem() { return this.class.dokumFormTip_eIslem }
	static get bedelKullanilirmi() {
		let {_bedelKullanilirmi: result} = this
		if (result) {
			let { depomu, params: { tablet } } = app
			let { depoBedelGorur } = tablet
			result &&= !(depomu && depoBedelGorur === false)
		}
		return result
	}
	static get onlineFisSinif() { return null }
	static get cariSinif() { return MQTabCari }
	static get tip2Sinif() {
		let {_tip2Sinif: result} = this
		if (!result) {
			result = this._tip2Sinif = fromEntries(
				TabFis.subClasses
					.filter(_ => !(_.araSeviyemi || _.ozelmi) && _.fisTipi)
					.map(_ => [_.fisTipi, _])
			)
		}
		return result
	}
	get numYapi() {
		let { defaultSeri: seri, numKod: kod } = this
		let aciklama = 'Sky Tablet'
		let { [kod]: id } = app.numYapilar ?? {}
		return kod ? new MQTabNum({ id, kod, aciklama, seri }) : null
	}
	get onlineOtoNumKullanilirmi() { return true }
	get kosulYapilar() { return this._kosulYapilar }
	set kosulYapilar(value) { this._kosulYapilar = value }
	get fisNox() { return this.tsn?.asText() }
	get dipIslemci() {
		let { _dipIslemci: result } = this
		if (result === undefined) {
			this.dipOlustur()
			result = this._dipIslemci
		}
		return result
	}
	set dipIslemci(value) { this._dipIslemci = value }
	get dipGridSatirlari() { return null }
	get bakiyeciler() { return [] }
	get fisTopBrut() {
		let { dipIslemci } = this
		if (dipIslemci)
			return dipIslemci.fisTopBrut
		let detaylar = this.getYazmaIcinDetaylar()
		return detaylar ? roundToBedelFra(topla(_ => _.netBedel || _.bedel || 0, detaylar)) : 0
	}
	get fisTopNet() {
		let { dipIslemci } = this
		return dipIslemci?.sonuc ?? this.fisTopBrut
	}
	get sonucBedel() { return this.fisTopNet }
	get dokumDetaylar() { return this.detaylar.filter(Boolean) }
	static get ba() { return this.cikisGibimi == false ? 'A' : 'B' }
	static get cikisGibimi() {
		let { alimmi, iademi } = this
		return alimmi == null || iademi == null
			? null
			: alimmi == iademi
	}
	static get bedelEtkilesimKatsayi() {
		let { cikisGibimi } = this
		return (
			cikisGibimi == null ? 0 :
			cikisGibimi ? 1 : -1
		)
	}
	get bakiyeEtkileyenKisim() { return 0 }
	get bakiyeArtis() { return ( this.bakiyeEtkileyenKisim * this.class.bedelEtkilesimKatsayi ) || 0 }

	constructor({ isCopy, offlineBuildQuery } = {}) {
		super(...arguments)
		if (isCopy) {
			let {_dipIslemci} = this
			if (_dipIslemci)
				_dipIslemci.fis = this
		}
		else {
			if (!offlineBuildQuery) {
				let num = this.numarator ??= this.numYapi?.deepCopy()
				this.dvKod ||= 'TL'
				this.fisNo ||= null
				;['subeKod', 'mustKod', 'plasiyerKod'].forEach(k => {
					let bu = this[k], def = app[k]
					if (!bu && def != null)
						this[k] = bu = def
				})
			}
		}
		this._prev = {}
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, {
			kayitTS: new PInstDateTimeNow('kayitTS'),
			gecicimi: new PInstBool('gecici'),
			merkezmi: new PInstBool('merkez'),
			yazdirildimi: new PInstBool('yazdirildi'),
			plasiyerKod: new PInstStr('plasiyerkod'),
			tarih: new PInstDateToday('tarih'),
			subeKod: new PInstStr('bizsubekod'),
			seri: new PInstStr('seri'),
			noYil: new PInstNum('noyil'),
			fisNo: new PInst('fisno'),
			mustKod: new PInstStr('must'),
			aciklama: new PInstStr('cariaciklama'),
			fisSonuc: new PInstNum('sonuc')
		})
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e)
		let { parentPart: gridPart, part, liste } = e
		let items = [
			{ id: 'menu', text: '...', handler: async _e => {
				_e = { ...e, ..._e }
				try {
					let args = await this.getDefaultContextMenuArgs(_e)
					if (args) {
						let { selectedRecs: recs } = gridPart
						extend(_e, { recs, ...args })
						gridPart.openContextMenu(_e)
					}
				}
				catch (ex) { cerr(ex); throw ex }
			}}
		]
		let set = part.ekSagButonIdSet ??= {}
		if (items.length) {
			liste.unshift(...items)
			extend(set, asSet(items.map(_ => _.id)))
		}
	}
	static orjBaslikListesi_argsDuzenle({ args }) {
		let e = arguments[0]
		super.orjBaslikListesi_argsDuzenle(e)
		MQMasterOrtak.orjBaslikListesi_argsDuzenle(e)
		extend(args, { groupable: false })
	}
	static ekCSSDuzenle({ dataField: belirtec, rec, result }) {
		super.ekCSSDuzenle(...arguments)
		let { gecici, merkez, yazdirildi } = rec
		if (gecici)
			result.push('gecici', 'bg-lightred-transparent')
		if (merkez)
			result.push('merkez', 'bg-lightcadetblue')
		if (yazdirildi)
			result.push('yazdirildi', 'bg-mediumpurple')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: '_html', text: 'Belge' }).noSql(),
			new GridKolon({ belirtec: 'sonucText', text: 'Fiş Sonuç', genislikCh: 15 }).noSql().alignRight()
		)
	}
	static async loadServerDataDogrudan({ offlineRequest, offlineMode } = {}) {
		let e = arguments[0]
		if (!offlineRequest) {
			let { sutAlimmi, params: { tablet } } = app
			let cacheClasses = [MQTabCari]
			if ( sutAlimmi || tablet.sutToplama )
				cacheClasses.push(MQTabRota, MQTabMustahsil)
			await Promise.allSettled(cacheClasses.map(_ => _.getGloKod2Rec()))
		}
		let recs = await super.loadServerDataDogrudan(...arguments)
		if (!offlineRequest) {
			let { tip2Sinif } = TabFis
			let { detayTable } = this
			let idListe = keys(asSet(recs.map(r => r.id)))
			let id2DetaySayi = {}
			if (detayTable) {
				let sent = new MQSent(), { where: wh, sahalar } = sent
				sent.fromAdd(detayTable)
				wh.inDizi(idListe, 'fisid')
				sahalar.add('fisid id', 'COUNT(*) sayi')
				sent.groupByOlustur()
				;(await sent.execSelect()).forEach(({ id, sayi }) =>
					id2DetaySayi[id] = sayi)
			}
			recs.forEach(rec => {
				let _e = { ...e, rec, idListe, id2DetaySayi }
				rec._html = this.getHTML(_e)
				rec.sonucText = this.getHTML_sonuc(_e)
			})
		}
		return recs
	}
	static loadServerData_queryDuzenle(e = {}) {
		let { gridPart = e.parentPart ?? e.sender, offlineBuildQuery, offlineRequest, offlineMode, stm } = e
		let { plasiyerKod } = app, { mustKod } = gridPart ?? {}
		super.loadServerData_queryDuzenle(e)
		let { tableAlias: alias, idSaha, detaySinif: { table: detayTable, fisSayacSaha } = {} } = this
		let { gonderildiDesteklenirmi, gonderimTSSaha, merkezKayitlarAlinirmi } = this
		let unvanSaha = offlineMode === false ? 'birunvan' : MQTabCari.adiSaha
		for (let sent of stm) {
			let { from, where: wh, sahalar, alias2Deger } = sent
			if (!from.aliasIcinTable('car'))
				sent.leftJoin(alias, 'carmst car', 'fis.must = car.kod')
			if (offlineRequest && offlineMode && gonderildiDesteklenirmi && gonderimTSSaha) {
				// Bilgi Gönder yapılacak - yerel veriler okunuyor
				wh.add(`COALESCE(${alias}.${gonderimTSSaha}, '') = ''`)
			}
			if (!offlineRequest || offlineMode) {
				// tablet local
				wh.add(`${alias}.silindi = ''`)
				if (!merkezKayitlarAlinirmi)
					wh.add(`${alias}.merkez = ''`)
				if (plasiyerKod) {
					let or = new MQOrClause()
						.add(`${alias}.plasiyerkod = ''`)
						.degerAta(plasiyerKod, `${alias}.plasiyerkod`)
					wh.add(or)
				}
				if (mustKod) {
					let or = new MQOrClause()
						.add(`${alias}.must = ''`)
						.degerAta(mustKod, `${alias}.must`)
					wh.add(or)
				}
			}
			sahalar.add(`car.${unvanSaha} mustunvan`, `${alias}.*`)
		}
		let { orderBy } = stm
		orderBy.liste = orderBy.liste
			.filter(_ => !_.startsWith('_'))
			.map(_ => _.toUpperCase().endsWith('DESC') ? _ : `${_} DESC`)
		if (empty(orderBy.liste))
			orderBy.add(
				'merkez',    // Tablet, Merkez
				'tarih DESC', 'seri DESC', 'fisno DESC'
			)
	}
	static async loadServerData_detaylar({ parentRec: { fisTipi } = {}, offlineRequest, offlineMode }) {
		let recs = await super.loadServerData_detaylar(...arguments)
		if (offlineRequest)
			return recs
		for (let rec of recs) {
			let detaySinif = this.detaySinifFor({ rec })
			if (!detaySinif)
				continue
			let det = new detaySinif()
			await det.setValues({ rec })
			rec._html = det.html
		}
		return recs
	}
	static async gridVeriYuklendi({ sender: gridPart }) {
		await super.gridVeriYuklendi(...arguments)
		let { gonderimTSSaha } = this
		let { boundRecs: recs, selectedRec: rec, gridWidget: w } = gridPart
		if (!empty(recs)) {
			/*let { tip2Sinif } = TabFis
			let fisTipleri = keys(asSet(recs.map(r => r.fisTipi)))
			if (!fisTipleri.find(_ => tip2Sinif[_]?.detaySinif?.bedelKullanilirmi))
				w.hidecolumn('sonuc')*/
			if (!rec) {
				let { uid = 0 } = recs.find(r => !r[gonderimTSSaha]) ?? {}
				// ind = w.getrowboundindexbyid(uid)
				setTimeout(() => w.selectrow(uid), 100)
			}
		}
	}
	static async gridVeriYuklendi_detaylar({ sender: gridPart, sender: { gridWidget: w } }) {
		await super.gridVeriYuklendi_detaylar(...arguments)
		let { selectedRec: { fisTipi } = {} } = gridPart.parentPart ?? {}
		let { detaySinif } = TabFis.tip2Sinif[fisTipi] ?? {}
		if (fisTipi && !detaySinif?.bedelKullanilirmi)
			w.hidecolumn('bedel')
	}

	static getNumKod(e, _eIslTip, _yildizlimi) {
		let delim = '-'
		let objmi = isObject(e)
		let tip = objmi ? e.tip : e
		let eIslTip = objmi ? e.eIslTip : _eIslTip
		let yildizlimi = objmi ? e.yildizli ?? e.yildizlimi : _yildizlimi
		let yildizText = isString(yildizlimi) ? yildizlimi : (yildizlimi ? '!' : '')
		// TF, TF-E, TF-A-!, TI-IR, BT, ...
		return [tip, eIslTip, yildizText]
			.join(delim)
			.trimEnd(delim)
	}
	async numaratorBelirle({ sender: tanimPart } = {}) {
		let { numarator: num, numYapi } = this
		if (!(num && num.kod == numYapi.kod))
			num = this.numarator = numYapi?.deepCopy()
		if (num) {
			let res = await (num._promise = num.yukle())
			if (!res)
				await num.kaydet()
			if (num.seri != this.seri) {
				this.seri = num.seri
				this.fisNo = null
				tanimPart?.txtFisNo?.attr('placeholder', num.sonNo + 1)
			}
		}
		return this
	}
	
	async uiGirisOncesiIslemler(e) {
		this._promise_ready = new $.Deferred()
		await super.uiGirisOncesiIslemler(e)
		try { await this.satisKosullariOlustur(e) }
		catch (ex) { cerr(ex) }
	}
	async uiGirisSonrasiIslemler(e) {
		await super.uiGirisSonrasiIslemler(e)
		setTimeout(() => {
			this._promise_ready?.resolve()
			this._uiReady = true
		}, 1000)
	}
	async yeniTanimOncesiIslemler(e) {
		await this.topluHesapla(e)
		await super.yeniTanimOncesiIslemler(e)
		await this.mustDegisti({ ...e })
	}
	async yukleSonrasiIslemler({ islem }) {
		// this.dipOlustur()
		let e = arguments[0]
		await super.yukleSonrasiIslemler(e)
		this.noYil = this.eIslemmi ? today().yil : 0
		this.topluHesapla(e)
		this.detaylar.forEach(det =>
			det.htmlOlustur?.())
	}
	async uiKaydetOncesiIslemler(e) {
		let fis = this, { class: { detaySinif } } = this
		let detaylar = this.getYazmaIcinDetaylar(e)
		let _e = { ...e, fis, detaylar, result: [] }
		await this.dataDuzgunmuDuzenle(_e)
		await detaySinif.uiKaydetOncesiIslemler(_e)
		detaylar.forEach(async (det, i) => {
			_e.seq = i + 1
			await det.uiKaydetOncesiIslemler(_e)
		})
		
		let {result} = _e
		if (!empty(result)) {
			let isError = true
			let errorText = result
				.map(getErrorText)
				.filter(_ => _ != null)
				.map(_ => `<li>${_}</li>`)
				.join(CrLf)
			if (errorText)
				errorText = `<ul>${errorText}</ul>`
			throw { isError, errorText }
		}
		return await super.uiKaydetOncesiIslemler(e)
	}
	async dataDuzgunmuDuzenle({ eskiInst: eskiFis, parentPart, gridPart, result }) {
		let { mustKod, plasiyerKod, class: { mustZorunlumu, cariSinif } } = this
		if (!mustKod && mustZorunlumu)
			result.push(`<b class=firebrick>Müşteri</b> belirtilmelidir`)
		if (mustKod && !await cariSinif.kodVarmi(mustKod))
			result.push(`<b>Müşteri [<span class=firebrick>${mustKod}</span>]</b> hatalıdır`)
		if (plasiyerKod && !await MQTabPlasiyer.kodVarmi(plasiyerKod))
			result.push(`<b>Plasiyer [<span class=firebrick>${plasiyerKod}</span>]</b> hatalıdır`)
		return null
	}
	async kaydetOncesiIslemler({ islem }) {
		let e = arguments[0]
		await this._promise_topluHesapla
		await super.kaydetOncesiIslemler(e)
		let yeniVeyaKopyami = islem == 'yeni' || islem == 'kopya'
		let { eIslemmi, fisNo, numarator: num } = this
		if (eIslemmi)
			this.uuid ||= newGUID()
		this.fisSonuc = this.fisTopNet
		if (yeniVeyaKopyami) {
			this.sayac = null
			if (!fisNo && num) {
				if (!num.id)
					await num.kaydet()
				while (true) {
					await num.kesinlestir()
					this.fisNo = num.sonNo
					if (!await this.varmi())
						break
				}
			}
		}
		await this.dipIslemci?.kaydetOncesiIslemler(...arguments)
	}
	async kaydetSonrasiIslemler(e = {}) {
		let { islem, eskiInst = e.eskiFis ?? e.eskiObj ?? {} } = e
		let { mustKod } = this, { mustKod: onceki_mustKod } = eskiInst
		let toplu = new MQToplu()
		if (mustKod || onceki_mustKod) {
			let { bakiyeArtis } = this
			let { bakiyeArtis: onceki_bakiyeArtis } = eskiInst
			if (bakiyeArtis || onceki_bakiyeArtis) {
				MQTabCariBakiye.globalleriSil()
				let { table, kodSaha } = MQTabCariBakiye
				if (bakiyeArtis) {
					let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
					upd.fromAdd(table)
					wh.degerAta(mustKod, kodSaha)
					set.add(`bakiye = bakiye + ${bakiyeArtis.sqlDegeri()}`)
					toplu.add(upd)
				}
				if (onceki_bakiyeArtis) {
					let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
					upd.fromAdd(table)
					wh.degerAta(onceki_mustKod, kodSaha)
					set.add(`bakiye = bakiye - ${onceki_bakiyeArtis.sqlDegeri()}`)
					toplu.add(upd)
				}
			}
		}
		await super.kaydetSonrasiIslemler(...arguments)
		await toplu.execute(e)
	}
	async yukle(e = {}) {
		let {rec} = e
		if (rec)
			await this.setValues(e)
		else {
			e.rec = undefined
			return await super.yukle(e)
		}
	}
	async sil(e = {}) {
		let { sayac: id, class: { table, idSaha } } = this
		if (!id)
			return false
		
		;{
			let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
			upd.fromAdd(table)
			wh.degerAta(id, idSaha)
			set.degerAta(bool2FileStr(true), 'silindi')
			let res = await this.sqlExecNone(upd)
			if (!res)
				return false
		}

		if (empty(this.detaylar)) {
			if (!await this.yukle({ ...e, rec: undefined }))
				throw { isError: true, rc: 'fatalError', errorText: 'iç hata: Silinecek belge yüklenemedi' }
		}

		let { islem } = e, { mustKod } = this
		let toplu = new MQToplu()
		if (mustKod) {
			let { bakiyeArtis } = this
			if (bakiyeArtis) {
				MQTabCariBakiye.globalleriSil()
				let { table, kodSaha } = MQTabCariBakiye
				let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
				upd.fromAdd(table)
				wh.degerAta(mustKod, kodSaha)
				set.add(`bakiye = bakiye - ${bakiyeArtis.sqlDegeri()}`)
				toplu.add(upd)
			}
		}
		await toplu.execute(e)
		
		return true
	}
	static varsayilanKeyHostVarsDuzenle({ hv }) {
		super.varsayilanKeyHostVarsDuzenle(...arguments)
		let {fisTipi} = this
		if (fisTipi != null)
			extend(hv, { fisTipi })
	}
	keyHostVarsDuzenle({ hv }) {
		super.keyHostVarsDuzenle(...arguments)
		let {class: { idSaha }} = this
		let id = this.id ||= newGUID()
		hv[idSaha] = id
	}
	alternateKeyHostVarsDuzenle({ hv }) {
		let { fisTipi: fistipi, almSat: almsat, iade, seri, fisNo: fisno } = this
		extend(hv, { fistipi, almsat, iade, seri, fisno })
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments)
		let { class: { ba } } = this
		let { tarih, kayitTS } = hv
		if ('tarih' in hv)
			hv.tarih = tarih = asReverseDateString(kayitTS || now())
		if ('kayitTS' in hv)
			hv.kayitTS = kayitTS = asReverseDateTimeString(kayitTS || now())
		extend(hv, { ba })
	}
	kopyaIcinDuzenle(e) {
		super.kopyaIcinDuzenle(e)
		extend(this, { fisNo: null, tarih: today() })
		if (this.sevkTS)
			this.sevkTS = now()
	}
	topluYazmaKomutlariniOlustur_baslikSayacBelirle(e) {
		// super yok
		return this.id ||= newGUID()
	}
	topluYazmaKomutlariniOlustur_sqlParamsDuzenle({ params, paramName_fisSayac }) {
		// do nothing
	}

	static getDefaultContextMenuItems(e) {
		return [
			...(super.getDefaultContextMenuItems(e) ?? []),
			{ id: 'yazdir',  text: 'Yazdır', handler: _e => this.orjBaslikListesi_yazdirIstendi({ ...e, ..._e }) }
		]
	}
	static getTanimPartMenuItems(e = {}) {
		super.getTanimPartMenuItems(e)
		let { sender: tanimPart } = e, { acc } = tanimPart
		return [
			{ id: 'yazdir', text: 'Yazdır', handler: _e => { this.yazdir({ ...e, ..._e, tanimPart }); _e.close?.() } },
			{ id: 'duzenle', text: 'Düzenle', handler: _e => { acc.expand('duzenle'); _e.close() } },
			{ id: 'temizle', text: 'Temizle', handler: _e => this.temizleIstendi({ ...e, ..._e, tanimPart }) }
		]
	}

	static async orjBaslikListesi_yazdirIstendi(e = {}) {
		let {gridPart = e.sender, recs, close} = e
		if (empty(recs))
			return
		let count = recs.length
		showProgress(`${count} adet belge yazdırılıyor...`, 'Yazdır')
		let {progressManager: pm} = window
		pm.setProgressMax(count * 5 + 10)
		try {
			for (let rec of recs) {
				let {fisTipi, id} = rec
				let cls = TabFisListe.fisSinifFor(fisTipi)
				pm?.progressStep()
				let inst = cls ? new cls({ id }) : null
				if (!(await inst?.yukle()))
					continue
				pm?.progressStep()
				await this.yazdir({ ...e, inst })
				pm?.progressStep(3)
			}
		}
		finally {
			pm?.progressEnd()
			setTimeout(() => hideProgress(), 300)
		}
		close?.()
	}
	static temizleIstendi({ tanimPart, close }) {
		let {inst: fis, acc, gridPart} = tanimPart
		fis.detaylar = []
		gridPart?.tazele()
		acc.collapse()
		setTimeout(() => {
			acc.expand('detay')
			close?.()
		}, 50)
	}

	tarihDegisti({ value = this.tarih }) {
		this.satisKosullariOlusturWithReset(...arguments)
	}
	async seriDegisti({ tanimPart, builder: fbd, input, altInst, oldValue = this._prev.seri?.toUpperCase(), value = this.seri?.toUpperCase() }) {
		if (oldValue == value)
			return
		input?.val(value)
		this.seri = value
		let { numarator: num } = this
		if (num) {
			let { sonNo } = num
			num.seri = value
			await num.yukle()
			if (num.sonNo != sonNo && fbd)
				tanimPart?.txtFisNo?.attr('placeholder', sonNo)
		}
		this._prev.seri = value
	}
	plasiyerDegisti({ oldValue = this._prev.plasiyerKod, value = this.plasiyerKod }) {
		this._prev.plasiyerKod = value
	}
	async mustDegisti({ acc, oldValue = this._prev.mustKod, value = this.mustKod }) {
		if (!(oldValue && value == oldValue)) {
			await this.satisKosullariOlusturWithReset(...arguments)
			await this.numaratorBelirle(...arguments)
			this.noYil = this.eIslemmi ? today().yil : 0
			acc?.render()
		}
		this._prev.mustKod = value
	}

	dipOlustur(e) {
		let result = null, fis = this
		let {dipKullanilirmi, dipSinif} = this.class
		if (dipKullanilirmi && dipSinif)
			result = this.dipIslemci = new dipSinif({ fis })
		return result
	}
	topluHesapla(e) {
		let {dipIslemci} = this
		dipIslemci?.topluHesapla(e)
		return this
	}
	topluHesaplaDefer(e = {}) {
		let {acc, tanimPart = e.sender} = e
		acc ??= tanimPart?.acc
		let k = '_timer_topluHesapla'
		clearTimeout(this[k])
		this._promise_topluHesapla?.resolve()
		this._promise_topluHesapla = new $.Deferred()
		this[k] = setTimeout(async e => {
			try {
				await this.topluHesapla(e)
				acc?.render()
			}
			finally {
				delete this[k]
				this._promise_topluHesapla?.resolve()
			}
		}, 500, e)
		return this
	}
	async satisKosullariOlusturWithReset(e = {}) {
		await this.satisKosullariOlustur(e)
		await this.satisKosullariReset(e)
	}
	async satisKosullariReset(e) { return this }
	async satisKosullariOlustur(e) { return this }
	static async yeniInstOlustur(e = {}) {
		let { gridPart = e.sender, islem, rec, rowIndex, args = {} } = e
		let { gonderildiDesteklenirmi, gonderimTSSaha } = this
		let { fisTipi } = rec ?? {}
		let degistirmi = islem == 'degistir'
		let silmi = islem == 'sil'
		let gonderimTS = gonderildiDesteklenirmi ? rec?.[gonderimTSSaha] : null
		if (silmi) {
			let gonderimTS = rec[gonderimTSSaha]
			if (gonderimTS)
				throw { isError: true, errorText: 'Merkeze gönderilmiş belgeler silinemez' }
			let { tip2Sinif } = this
			let cls = tip2Sinif[fisTipi]
			if (cls?.tahsilatmi) {
				let {dev, session: { isAdmin } = {}} = config
				if (!(dev && isAdmin))
					throw { isError: true, errorText: 'Tahsilat Fişi silme yetkiniz yok' }
			}
		}
		else if (degistirmi && gonderimTS)
			e.islem = 'izle'
	}
	async asOnlineFis(e = {}) {
		let { sayac: tabletID, tarih, seri, noYil, fisNo, plasiyerKod, subeKod, mustKod, class: { onlineFisSinif } } = this
		let oFis = onlineFisSinif ? new onlineFisSinif({ tabletID, tarih, seri, noYil, fisNo, plasiyerKod, subeKod, mustKod }) : null
		if (!oFis)
			return null
		let _e = { ...e, oFis }
		let result = await this.onlineFisDuzenle(_e)
		if (result === false)
			return null
		oFis = _e.oFis
		if (!oFis)
			return null
		let { numarator: num } = oFis
		if (num && this.onlineOtoNumKullanilirmi) {
			app.online()
			try {
				while (await oFis.varmi()) {
					await num.kesinlestir()
					oFis.fisNo = num.sonNo
				}
			}
			finally { app.resetOfflineStatus() }
			let seriDegisti = this.seri != oFis.seri
			let noDegisti = this.fisNo != oFis.fisNo
			if (seriDegisti || noDegisti) {
				let {id, class: { idSaha, seriSaha, fisNoSaha, table: from }} = this
				let upd = new MQIliskiliUpdate({ from }), {where: wh, set} = upd
				wh.degerAta(id, idSaha)
				if (seriDegisti)
					set.degerAta(this.seri = seri, 'seri')
				if (noDegisti)
					set.degerAta(this.fisNo = fisNo, 'fisno')
				this.sqlExecNone(upd)    // async - no await
			}
		}
		return oFis
	}
	async onlineFisDuzenle({ oFis } = {}) {
		let e = arguments[0]
		let { class: oFisSinif } = oFis
		let fis = this, { detaylar } = this
		let { detaySinif: detSinif } = this.class
		detSinif ??= MQDetay
		let oDetSinif = (
			oFisSinif.detaySinifFor?.('') ??
			oFisSinif.detaySinif ??
			MQDetay
		)
		for (let det of detaylar) {
			if (isPlainObject(det))
				det = new detSinif(det)
			let oDet = new oDetSinif(det)
			let rec = det.hostVars({ ...e, fis, onlineFisDuzenle: true })
			await oDet.setValues({ rec })
			oFis.addDetay(oDet)
		}
		await oFis.dipOlustur?.()
		await oFis.dipIslemci?.topluHesapla?.()
	}

	static yazdir({ inst }) {
		return inst?.yazdir(...arguments)
	}
	async yazdir(e) {
		let bedelX = 33
		/*let data = ({
			nakil: false, tekDetaySatirSayisi: 2,
			dipYok: false, dipX: bedelX - 20,
			sayfaBoyut: { x: 60, y: 58 },
			otoYBasiSonu: { x: 17, y: 52 },
			sabit: [
				{ text: '[!FUNC(e => (2 + 3))] [!FUNC( ({ inst: { fisNo } }) => `FIS: ${fisNo}` )]', x: 5, y: 1 },
				{ key: 'fisTipText', pos: { x: 5, y: 2 }, length: 19 },
				{ text: '[islemTarih] [islemZaman]', pos: { x: 40, y: 5 }, _comment: '(pos.X = 0) => text length ne ise aynen yazılır, kırpmadan' },
				{ key: 'islemZaman', pos: { x: 48, y: 6 }, _comment: '(pos.X = 0) => text length ne ise aynen yazılır, kırpmadan' },
				{ key: 'yildizlimiText', pos: { x: 1, y: 0 }, length: 5, _comment: '(Y = 0) ==> Cursor ın kaldığı Y pozisyonundan devam et' },
				{ key: 'tahsilatSekliText', pos: { x: 0, y: 0 }, _comment: '(X = 0) => Bu bilgi yazılmaz | (Y = 0) ==> Cursor ın kaldığı Y pozisyonundan devam et' },
				{ text: 'SAYIN [mustUnvan],', pos: { x: 1, y: 8 }, length: 55 },
				{ text: '[vergiDairesi] [vergiNo]', pos: { x: 5, y: 9 }, length: 40 },
				{ text: '** BİLGİ FİŞİ **', pos: { x: 5, y: -1 }, length: 50, ozelIsaret: true, iade: false, _comment: '(Y = -1) => Bittiği yer veya Sayfa Boyutu Y ye göre tersten relative satır no' }
			],
			detay: [
				{ key: 'barkod', pos: { x: 2, y: 1 }, length: 15 },
				{ key: 'stokAdi', pos: { x: 18, y: 1 }, length: 40 },
				{ key: 'miktar', pos: { x: 5, y: 2 }, length: 8, right: true },
				{ key: 'brm', pos: { x: 15, y: 2 }, length: 4, right: true },
				{ key: 'fiyat', pos: { x: 21, y: 2 }, length: 10, right: true },
				{ key: 'netBedel', pos: { x: bedelX, y: 2 }, length: 13, right: true }
			],
			oto: [
				{ key: 'tahsilText', x: 2 },
				{ key: 'miktarText', x: 2 },
				{ key: 'yalnizText', x: 5 },
				{ key: 'bakiyeText', _comment: 'gizli' },
				{ key: 'notlar', _comment: 'gizli' }
			]
		})*/
		let {tablet: { dokumEkrana } = {}} = app.params
		// let form = this.getDokumForm(e) ?? new TabDokumForm(data)
		let form = this.getDokumForm(e) ?? new TabDokumForm()
		if (isPlainObject(form))
			form = new TabDokumForm(form)
		let device = TabDokumDevice.newDefault(e)
		let yontem = TabDokumYontemi.newDefault()
		let dokumcu = new TabDokumcu()
			.setSource(form).setDevice(device)
			.setYontem(yontem)
		if (dokumEkrana)
			dokumcu.ekrana()
		// dokumcu.setPrefix('\nMUHTELİF MÜŞTERİLERE GÖNDERMEK ÜZERE\nSİPARİŞLER AŞAĞIDAKİ GİBİDİR:\n\n\n')
		let inst = this
		await dokumcu.yazdir({ inst })
	}
	getDokumForm(e) {
		let tip = this.getDokumFormTip(e)
		if (!tip)
			return null
		let {tablet: { dokumFormlar = {} } = {}} = app.params
		return dokumFormlar[tip]
	}
	getDokumFormTip(e) {
		let { eIslemmi } = this
		return this[`dokumFormTip_${eIslemmi ? 'eIslem' : 'normal'}`]
	}
	async dokumGetValue({ tip, key } = {}) {
		let e = arguments[0]
		switch (key) {
			case 'musteriKod': case 'mustKod':
				return this.mustKod
			case 'mustUnvan': case 'mustUnvan1': case 'mustUnvan2':
			case 'musteriUnvan': case 'musteriUnvan1': case 'musteriUnvan2':
				return MQTabCari.getGloKod2Rec().then(d => d[this.mustKod]?.aciklama)
			case 'musteriAdres': case 'musteriAdres1': case 'musteriAdres2':
				return MQTabCari.getGloKod2Rec().then(d => d[this.mustKod]?.adres)
			case 'mustYore': case 'musteriYore':
				return MQTabCari.getGloKod2Rec().then(d => d[this.mustKod]?.yore)
			case 'mustIl': case 'musteriIl':
				let { ilkod: kod } = await MQTabCari.getGloKod2Rec().then(d => d[this.mustKod]) ?? {}
				if (!kod)
					return ''
				return MQTabIl.getGloKod2Rec().then(d => d[kod]?.aciklama)
			case 'mustYoreVeIl': case 'musteriYoreVeIl': {
				let yore = await this.dokumGetValue({ ...e, key: 'mustYore' })
				let ilAdi = await this.dokumGetValue({ ...e, key: 'mustIl' })
				return [yore, ilAdi]
					.filter(Boolean)
					.join('/')
			}
			case 'mustVergiDaire': case 'musteriVergiDaire':
				return MQTabCari.getGloKod2Rec().then(d => d[this.mustKod]?.vdaire)
			case 'mustVKN': case 'musteriVKN':
				return MQTabCari.getGloKod2Rec().then(d => {
					let { sahismi, tckimlikno: tckn, vnumara: vkn } = d[this.mustKod] ?? {}
					return asBool(sahismi) ? tckn : vkn
				})
			case 'mustVergiDaireVeVKN': case 'musteriVergiDaireVeVKN': {
				let vDaire = await this.dokumGetValue({ ...e, key: 'mustVergiDaire' })
				let vkn = await this.dokumGetValue({ ...e, key: 'mustVKN' })
				return [vDaire, vkn]
					.filter(Boolean)
					.join(' - ')
			}
			case 'efSenaryoTipi': {
				let { eIslTip, class: { satismi, iademi } } = this
				let { eIslemKullanilirmi: eIslem } = app
				eIslem ??= true
				if (!eIslem)
					return ''
				return (
					eIslTip == 'IR' ? 'TEMELIRSALIYE' :
					eIslTip == 'E' ? (satismi == iademi ? 'IADE' : 'SATIS') :
					'EARSIVFATURA'
				)
			}
			case 'fisTipText':
				return this.class.sinifAdi
			case 'eIslText': {
				let { eIslTip: _ } = this
				let { eIslemKullanilirmi: eIslem } = app
				efatVarmi ??= true
				return (
					_ == 'E' ? 'e-Fatura' :
					_ == 'IR' ? 'e-İrsaliye' :
					_ ? ( eIslem ? 'e-Arşiv' : '' )
					: eIslTip
				)
			}
			case 'tarih': case 'islemTarih':
				return dateToString(asDate(this.tarih))
			case 'saat': case 'zaman': case 'islemZaman':
				return timeToString(this.sevkTS ?? now())
			case 'mustUnvan': case 'mustUnvan1': case 'mustUnvan2':
				return MQTabCari.getGloKod2Adi(this.mustKod)
			case 'vergiDairesi':
				return MQTabCari.getGloKod2Rec().then(d => d[this.mustKod]?.vdaire)
			case 'vergiNo':
				return MQTabCari.getGloKod2Rec().then(d => d[this.mustKod]?.vnumara)
			case 'tahsilText':
				return '...'
		}
		return null
	}

	static getRootFormBuilder(e) { return MQCogul.getRootFormBuilder(e) }
	static getRootFormBuilder_fis(e) { return null }
	static rootFormBuilderDuzenle_listeEkrani({ sender: gridPart, rootBuilder: rfb }) {
		super.rootFormBuilderDuzenle_listeEkrani(...arguments)
		rfb.addStyle(`$elementCSS .header > .islemTuslari > div #menu { margin-right: 15px }`)
	}
	static rootFormBuilderDuzenle_islemTuslari({ fbd_islemTuslari: fbd }) {
		super.rootFormBuilderDuzenle_islemTuslari(...arguments)
		fbd.addStyle(`$elementCSS > div #tamam { margin-left: 20px }`)
	}
	static tanimPart_islemTuslariDuzenle({ parentPart: tanimPart, part, liste }) {
		super.tanimPart_islemTuslariDuzenle(...arguments)
		let items = [
			{ id: 'menu', text: '...', handler: async _e => {
				_e = { ...e, ..._e }
				try {
					let args = await this.getTanimPartMenuArgs(_e)
					if (args) {
						let {inst, inst: parentRec} = tanimPart
						extend(_e, { inst, parentRec, ...args })
						MFListeOrtakPart.openContextMenu(_e)
					}
				}
				catch (ex) { cerr(ex); throw ex }
			}}
		]
		let set = part.ekSagButonIdSet ??= {}
		if (items.length) {
			liste.unshift(...items)
			extend(set, asSet(items.map(_ => _.id)))
		}
	}
	static async rootFormBuilderDuzenle_tablet(e) { }
	static async rootFormBuilderDuzenle_tablet_acc(e) {
		let { sender: tanimPart, inst, acc } = e
		let { mustKod, numarator: num, class: { mustZorunlumu } } = inst
		let getBuilder = e.getBuilder = layout =>
			this.rootFormBuilderDuzenle_tablet_getBuilder({ ...e, layout })
		await acc.deferRedraw(async () => {
			acc.add({
				id: 'baslik', title: 'Belge', expanded: true,
				collapsedContent: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					await this.rootFormBuilderDuzenle_tablet_acc_baslikCollapsed({ ...e, rfb, item, layout })
					rfb.run()
				},
				content: async ({ item, layout }) => {
					let sonNo = num?.sonNo ?? 0
					let rfb = getBuilder(layout)
					// rfb.addStyle_fullWH(null, 350)
					{
						let form = rfb.addFormWithParent().yanYana()
						form.addDateInput('tarih', 'Tarih').etiketGosterim_yok()
							.degisince(_e => inst.tarihDegisti({ ...e, ..._e, tanimPart, value: _e.value }))
						form.addTextInput('seri', 'Seri').etiketGosterim_yok()
							.addCSS('center')
							.addStyle(`$elementCSS { max-width: 90px }`)
							.setMaxLength(3)
							.readOnly()
							.degisince(({ builder, builder: { id, input, altInst }, ...rest }) => {
								let oldValue = altInst[id]?.toUpperCase()
								let value = oldValue?.toUpperCase()
								inst.seriDegisti({ ...rest, ...e, builder, id, input, altInst, value })
							})
						form.addNumberInput('fisNo', 'No', undefined, sonNo + 1).etiketGosterim_yok()
							.addStyle(`$elementCSS { max-width: 200px }`)
							.setMin(0).setMax(999999999).setMaxLength(9)
							.degisince(({ value }) =>
								inst.fisNo = value || null)
							.onAfterRun(({ builder: { input } }) =>
								tanimPart.txtFisNo = input)
					}
					await this.rootFormBuilderDuzenle_tablet_acc_baslik({ ...e, rfb, item, layout })
					{
						let form = rfb.addFormWithParent().yanYana()
						rfb.addTextInput('aciklama', 'Açıklama').etiketGosterim_yok()
							//.addStyle(`$elementCSS { max-width: 800px }`)
					}
					if (rfb.builders?.length)
						setTimeout(() => rfb.run(), 100)
				}
			})
			acc.add({
				id: 'dip', title: 'Sonuç',
				collapsedContent: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					await this.rootFormBuilderDuzenle_tablet_acc_dipCollapsed({ ...e, rfb, item, layout })
					rfb.run()
				},
				content: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					await this.rootFormBuilderDuzenle_tablet_acc_dip({ ...e, rfb, item, layout })
					if (!rfb.builders?.length)
						rfb.addStyle_fullWH(null, 1)
					setTimeout(() => rfb.run(), 100)
				}
			})
			acc.add({
				id: 'detay', title: 'Kalemler',
				collapsedContent: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					await this.rootFormBuilderDuzenle_tablet_acc_detayCollapsed({ ...e, rfb, item, layout })
					rfb.run()
				},
				content: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					await this.rootFormBuilderDuzenle_tablet_acc_detay({ ...e, rfb, item, layout })
					if (rfb.builders?.length)
						setTimeout(() => rfb.run(), 100)
				}
			})
			await this.rootFormBuilderDuzenle_tablet_acc_baslikOncesi(...arguments)
		})
		if (!mustZorunlumu || mustKod)
			acc.expand('detay')

		acc.onExpand(_e => setTimeout(e =>
			this.rootFormBuilderDuzenle_tablet_acc_onExpand(e), 1, { ...e, ..._e }))
		acc.onCollapse(_e => setTimeout(e =>
			this.rootFormBuilderDuzenle_tablet_acc_onCollapse(e), 1, { ...e, ..._e }))
	}
	static async rootFormBuilderDuzenle_tablet_acc_baslikOncesi({ sender: tanimPart, inst: fis, rfb }) { }
	static async rootFormBuilderDuzenle_tablet_acc_baslikCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		let { mustKod, eFatmi, class: { cariSinif } } = fis
		if (mustKod) {
			let aciklama = (await cariSinif.getGloKod2Adi())?.[mustKod] || mustKod
			rfb
				.addCSS('flex-row')
				.addStyle(
					`$elementCSS > div { width: max-content !important }
					 $elementCSS > div:not(:first-child) { margin-left: 20px }`
				)
			rfb.addForm().setLayout(() => $([
				`<div class="flex-row" style="gap: 10px">`,
					// `<div class="orangered"><b>${dateKisaString(asDate(tarih))}</b></div>`,
					`<div class="etiket lightgray">M:</div> `,
					`<div class="royalblue"><b>${aciklama}</b></div>`,
				`</div>`
			].join(CrLf)))
		}
		if (eFatmi) {
			rfb.addForm().setLayout(() => $([
				`<div class="flex-row" style="gap: 5px">`,
					`<div class="bold red">e-İşlem</div>`,
				`</div>`
			].join(CrLf)))
		}
	}
	static rootFormBuilderDuzenle_tablet_acc_baslik({ sender: tanimPart, inst: fis, rfb, acc }) {
		let e = arguments[0]
		let {loginTipi} = config.session ?? {}
		if (!(loginTipi == 'plasiyerLogin' || loginTipi == 'musteriLogin')) {
			let mfSinif = MQTabPlasiyer, {sinifAdi: etiket} = mfSinif
			let form = rfb.addFormWithParent().altAlta()
			form.addSimpleComboBox('plasiyerKod', etiket, etiket)
				.etiketGosterim_yok()
				//.addStyle(`$elementCSS { max-width: 800px }`)
				.kodsuz().setMFSinif(mfSinif)
				.degisince(({ type, events, ...rest }) => {
					if (type == 'batch') {
						// henuz plasiyerKod atanmadı
						let _e = { type, events, ...rest, oldValue: fis.plasiyerKod, value: events.at(-1).value?.trimEnd() }
						setTimeout(() => fis.plasiyerDegisti({ ...e, ..._e, tanimPart }), 5)
					}
				})
		}
		{
			let mfSinif = this.cariSinif, {sinifAdi: etiket} = mfSinif
			let form = rfb.addFormWithParent().altAlta()
			// addSimpleComboBox(e, _etiket, _placeholder, _value, _source, _autoClear, _delay, _minLength, _disabled, _name, _userData)
			form.addSimpleComboBox('mustKod', etiket, etiket)
				.etiketGosterim_yok()
				//.addStyle(`$elementCSS { max-width: 800px }`)
				.kodsuz().setMFSinif(mfSinif)
				.degisince(({ type, events, ...rest }) => {
					if (type == 'batch') {
						// henuz mustKod atanmadı
						let _e = { type, events, ...rest, oldValue: fis.mustKod, value: events.at(-1).value?.trimEnd() }
						setTimeout(() => {
							fis.mustDegisti({ ...e, ..._e, tanimPart })
							acc?.render()
						}, 5)
					}
				})
				.onAfterRun(({ builder: { part } }) =>
					setTimeout(() => part.focus(), 1))
			/*form.addModelKullan('mustKod', MQTabCari.sinifAdi)
				.addStyle(`$elementCSS { max-width: 800px }`)
				.comboBox().autoBind()
				.setMFSinif(MQTabCari)
				.onAfterRun(({ builder: { part } }) =>
					setTimeout(() => part.focus(), 1))*/
		}
	}
	static rootFormBuilderDuzenle_tablet_acc_dipCollapsed({ rfb }) { }
	static rootFormBuilderDuzenle_tablet_acc_dip({ rfb }) { }
	static rootFormBuilderDuzenle_tablet_acc_detayCollapsed({ rfb }) { }
	static rootFormBuilderDuzenle_tablet_acc_detay({ rfb }) { }
	static rootFormBuilderDuzenle_tablet_acc_onExpand({ sender: { parentPart: tanimPart }, acc: { activePanel } }) {
		/*let {id} = activePanel ?? {}
		let {islemTuslari} = tanimPart
		islemTuslari[id == 'duzenle' ? 'addClass' : 'removeClass']('jqx-hidden')*/
	}
	static rootFormBuilderDuzenle_tablet_acc_onCollapse(e) { }

	static rootFormBuilderDuzenle_tablet_getBuilder({ sender: tanimPart, inst, acc, layout }) {
		return new RootFormBuilder()
			.setLayout(layout).setPart(tanimPart)
			.setInst(inst)
	}
	static getHTML(e = {}) {
		let { gridPart = e.sender, rec } = e
		let { fisTipi, tarih, seri, noyil, fisno, must, mustunvan, rotaID, posta } = rec
		let rotaAdi = rotaID
			? MQTabRota.globals?.cachedRecs?.find(r =>
				r.rotaID == rotaID)?.aciklama || rotaID
			: null
		let postaAdi = posta ? new TabPosta(posta)?.aciklama : null
		let fisSinif = TabFisListe.fisSinifFor(fisTipi)
		// let {kod2Rec: kod2Must} = MQTabCari.globals
		let tarihStr = dateToString(tarih) ?? ''
		
		let tsnText = [
			seri || '',
			noyil ? noyil.toString().padStart(4, '0') : '',
			fisno?.toString() || '0'
		].filter(_ => _).join(' ')
		
		let { eIslemKullanilirmi: eIslem } = app
		eIslem ??= true
		let { eisltip: _ } = rec
		let eIslText = (
			_ == 'E' ? 'e-Fat' :
			_ == 'IR' ? 'e-İrs' :
			_ ? ( eIslem ? 'e-Arş' : '' )
			: _
		)

		let ekHTMLLines = { sol: [], sag: [] }
		let _e = { ...e, result: ekHTMLLines }
		this.ekHTMLDuzenle(_e)

		let { noDefault } = _e
		let sagVarmi = !empty(ekHTMLLines.sag)
		let headerMustVarmi = !!gridPart.mustKod
		
		let result = []
		result.push(`<div class="aligned full-wh relative" style="gap: 0 10px">`)
			result.push(
				`<template class="sort-data">`,
					`{rotaAdi || ''}|${posta || ''}|${tarihStr}|${seri}|${noyil}|${fisno}|${mustunvan}`,
				`</template>`
			)
			result.push(`<div class="sol ${sagVarmi ? 'float-left' : 'full-width'}">`)
			result.push(
				`<span class="tarih ek-bilgi bold">${dateKisaString(asDate(tarih)) ?? ''}</span>`,
				`<span class="fisNox asil royalblue">${tsnText}</span>`,
				( headerMustVarmi ? null : `<span class="mustUnvan asil orangered">${mustunvan || ''}</span>` ),
				( headerMustVarmi ? null : `<span class="ek-bilgi bold">${must ? `(${must})` : ''}</span>` ),
				( rotaAdi ? `<span class="rota ek-bilgi">R:</span> <span class="rotaAdi asil blueviolet">${rotaAdi}</span>` : null ),
				( postaAdi ? `<span class="poosta ek-bilgi">P:</span> <span class="posta asil bold darkyellow">${postaAdi}</span>` : null )
			)
			result.push( ...( ekHTMLLines.sol ?? [] ) )
			result.push(`</div>`)
			result.push(`<div class="sag float-right">`)
			result.push(
				( eIslText ? `<span class="ek-bilgi bold red">${eIslText}</span>` : null ),
				( fisSinif ? `<span class="royalblue ek-bilgi">${fisSinif.sinifAdi || ''}</span>` : null )
			)
			result.push( ...( ekHTMLLines.sag ?? [] ) )
			result.push(`</div>`)
		result.push(`</div>`)
		
		return result.filter(Boolean).join(CrLf)
	}
	static ekHTMLDuzenle({ result }) { }

	static getHTML_sonuc(e = {}) {
		let { tip2Sinif } = this
		let { gridPart = e.sender, rec, id2DetaySayi = {} } = e
		let { id, fisTipi: tip, dvKod, sonuc, brm, topMiktar } = rec
		dvKod ||= 'TL'
		if (!sonuc && topMiktar && !brm) {
			let { defaultBrm } = tip2Sinif[tip]?.detaySinif ?? {}
			brm = defaultBrm || 'AD'
		}

		let detaySayi = id2DetaySayi[id]
		let ekHTMLLines = { sol: [], sag: [] }
		let _e = { ...e, result: ekHTMLLines, detaySayi, dvKod, brm }
		this.ekHTMLDuzenle_sonuc(_e)

		let { noDefault } = _e
		let sagVarmi = !empty(ekHTMLLines.sag)
		
		let result = []
		result.push(`<div class="aligned full-wh relative" style="gap: 0 10px">`)
		result.push(
			`<template class="sort-data">`,
				`${sonuc || topMiktar || 0}|${detaySayi || 0}`,
			`</template>`
		)
		result.push(`<div class="sol ${sagVarmi ? 'float-left' : 'full-width'}">`,)
		if (!noDefault) {
			result.push(...[
				`<div class="item">`,
				(
					sonuc ? (
						`<span class="bedel asil bold orangered">${bedelToString(sonuc)}</span> ` +
						`<span class="bedel ek-bilgi gray">${dvKod}</span>`
					) :
					topMiktar ? (
						`<span class="miktar asil bold forestgreen">${numberToString(topMiktar)}</span> ` +
						`<span class="miktar ek-bilgi gray">${brm}</span>`
					) :
					''
				),
				`</div>`
			].filter(Boolean))
			if (detaySayi) {
				result.push(...[
					`<div class="item">`,
						`<span class="detaySayi asil bold royalblue">${numberToString(detaySayi)}</span> `,
						`<span class="detaySayi ek-bilgi gray">kalem</span>`,
					`</div>`
				].filter(Boolean))
			}
		}
		result.push( ...( ekHTMLLines?.sol?.filter(Boolean) ?? [] ) )
		result.push(`</div>`)

		if (sagVarmi) {
			result.push(`<div class="sag float-right">`)
			result.push( ...( ekHTMLLines?.sag?.filter(Boolean) ?? [] ) )
			result.push(`</div>`)
		}
		
		return empty(result) ? '' : result.join('\n')
	}
	static ekHTMLDuzenle_sonuc(e) {
		let { result } = e
		// e.noDefault = true
	}

	shallowCopy(e) {
		let result = super.shallowCopy(e)
		let dip = result._dipIslemci = this._dipIslemci?.shallowCopy(e)
		if (dip)
			dip.fis = result
		return result
	}
	deepCopy(e) {
		let result = super.deepCopy(e)
		let dip = result._dipIslemci = this._dipIslemci?.deepCopy(e)
		if (dip)
			dip.fis = result
		return result
	}

	gecici() { this.gecicimi = true; return this }
	geciciReset() { this.gecicimi = false; return this }
	merkez() { this.merkezmi = true; return this }
	merkezReset() { this.merkezmi = false; return this }
	yazdirildi() { this.yazdirildimi = true; return this }
	yazdirildiReset() { this.yazdirildimi = false; return this }
}
