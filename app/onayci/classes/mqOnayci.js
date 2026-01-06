class MQOnayci extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'ONAYCI' } static get sinifAdi() { return 'Onay İşlemleri' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get secimSinif() { return null } static get kolonFiltreKullanilirmi() { return false }
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e)
		let {liste, part: { ekSagButonIdSet: sagSet }} = e
		let items = [
			{ id: 'onay', text: ' ONAY ', handler: _e => this.onayRedIstendi({ ..._e, ...e, state: true }) },
			{ id: 'red', text: ' RED ', handler: _e => this.onayRedIstendi({ ..._e, ...e, state: false }) },
			{ id: 'eIslemIzle', handler: _e => this.izleIstendi({ ..._e, ...e }) }
		]
		liste.push(...items)
		$.extend(sagSet, asSet(items.map(_ => _.id)))
	}
	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		$.extend(args, { groupsExpandedByDefault: true, rowsHeight: isMiniDevice() ? 70 : 60 })
	}
	static orjBaslikListesi_groupsDuzenle({ liste }) {
		super.orjBaslikListesi_groupsDuzenle(...arguments)
		liste.push('tipText')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {tableAlias: alias} = this
		liste.push(...[
			// new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 13, filterType: 'checkedlist' }).tipDate(),
			new GridKolon({ belirtec: '_text', text: ' ' }),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 16 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'tipText', text: 'Tip', genislikCh: 20, filterType: 'checkedlist' })
		])
	}
	static async loadServerDataDogrudan({ sender: gridPart }) {
		let {encUser, user /*, dbName: db*/} = config.session
		let {ay: buAy, yil2: buKisaYil} = today()
		let _cache = this._cache ??= await (async () => {
			let kurallar = [], kuralKey2Kural = {}, tip2Kural = {}, dbSet = {}
			let kisaYilSet = {}
			{
				let {onayYili} = app.params?.ortak ?? {}
				kisaYilSet[onayYili || buKisaYil] = true
				if (buAy == 1)
					kisaYilSet[buKisaYil - 1] = true
			}
			let sent = new MQSent(), {where: wh, sahalar} = sent
			sent.fromAdd('ORTAK..firmaonayci k')
			wh.degerAta(encUser, 'k.xuserkod')
			sahalar.add(
				'k.firmaadi firmaAdi', 'k.tip',
				`(case when COALESCE(k.onayno, 0) = 0 then 1 else k.onayno end) onayNo`
			)
			kurallar = await this.sqlExecSelect(sent)
			let allDBNames = await app.wsDBListe()
			let ignoreProgBelirtecSet = ['BR', 'MH', 'IS', 'AK']
			allDBNames = allDBNames.filter(_ => 
				!ignoreProgBelirtecSet[_.substr(0, 2)] &&
				kisaYilSet[asInteger(_.substr(2, 2))]
			)
			for (let rec of kurallar) {
				let {tip, firmaAdi} = rec
				kuralKey2Kural[this.getKey(rec)] = rec
				tip2Kural[tip] = rec
				for (let db of allDBNames) {
					let db_firmaAdi = db.substr(4)
					if (db_firmaAdi == firmaAdi)
						dbSet[db] = true
				}
			}
			{
				// eksik tablolu db'leri listeden at
				let dbListe = keys(dbSet)
				let results = await Promise.allSettled(dbListe.map(db => app.sqlHasColumn(`${db}..sipfis`, 'bw1onay')))
				dbListe.forEach((db, i) => {
					let {status, value} = results[i]
					let uygunmu = status == 'fulfilled' && value    // promise hata almadı ve result == true
					if (!uygunmu)
						delete dbSet[db]
				})
			}
			return ({ kurallar, kuralKey2Kural, tip2Kural, dbSet })
		})()
		let {kurallar, kuralKey2Kural, tip2Kural, dbSet} = _cache
		$.extend(gridPart, { kurallar, kuralKey2Kural, dbSet })
		{
			let uni = new MQUnionAll()
			for (let db in dbSet) {
				// /efgecicialfatfis, sipfis
				{
					// Alım e-İşlem
					let table = 'efgecicialfatfis', tip = 'GeciciAlimEFat'
					if (tip2Kural[tip]) {
						let sent = new MQSent(), {where: wh, sahalar} = sent
						sent
							.fromAdd(`${db}..${table} fis`)
						wh.inDizi(['', 'E'], 'fis.efbelge')
						sahalar.add(
							`'${db}' _db`, `'${table}' _table`, `'${tip}' tip`,
							'fis.efbelge eIslTip', 'fis.efuuid uuid', 
							`'Geçici Alım e-İşlem' tipText`,
							`'' mustKod`, 'fis.efmustunvan mustUnvan'
						)
						sahalar.addWithAlias('fis',
							'kaysayac sayac', 'tarih', 'effatnox fisNox', 'efsonuc bedel')
						sahalar.add(`'' ekBilgi`)
						uni.add(sent)
					}
				}
				{
					// Siparişler
					let almSat2Tip = { 'A': 'AlimSip', 'T': 'SatisSip' }
					for (let [almSat, tip] of entries(almSat2Tip)) {
						let table = 'sipfis', psTip = 'S'
						if (tip2Kural[tip]) {
							let sent = new MQSent(), {where: wh, sahalar} = sent
							sent
								.fromAdd(`${db}..${table} fis`)
								.fromIliski(`${db}..carmst car`, 'fis.must = car.must')
							wh.fisSilindiEkle()
							wh.degerAta(almSat, 'fis.almsat')
							wh.add(`fis.ayrimtipi = ''`)
							sahalar.add(
								`'${db}' _db`, `'${table}' _table`, `'${tip}' tip`,
								'fis.efayrimtipi eIslTip', 'fis.efatuuid uuid',
								'(' +
									`(case fis.almsat when 'A' then 'Alım ' when 'T' then 'Satış ' else '' end) + ` +
									`'Sipariş'` +
								') tipText',
								'fis.must mustKod', 'car.birunvan mustUnvan'
							)
							sahalar.addWithAlias('fis',
								'kaysayac sayac', 'tarih', 'fisnox fisNox', 'net bedel', 'cariaciklama ekBilgi')
							uni.add(sent)
						}
					}
				}
			}
			if (!uni.liste.length)
				return []
			for (let sent of uni) {
				let {where: wh, sahalar} = sent
				wh.add(new MQOrClause([
					new MQAndClause([`fis.bw1onay IS NULL`, { degerAta: user, saha: 'fis.w1onayuser' } ]),
					new MQAndClause([`fis.bw1onay = 1`, `fis.bw2onay IS NULL`, { degerAta: user, saha: 'fis.w2onayuser' } ])
				]))
				sahalar.add(`(case when fis.bw1onay IS NULL then 1 when fis.bw2onay IS NULL then 2 else NULL end) onayNo`)
			}
			let stm = new MQStm({ sent: uni })
			let recs = await this.sqlExecSelect(stm)
			recs = recs.filter(rec => kuralKey2Kural[this.getKey(rec)])
			for (let rec of recs)
				rec._text = this.getHTML({ rec })
			return recs
		}
	}
	static gridVeriYuklendi({ sender: gridPart }) {
		let {gridWidget: w, gridWidget: { groups }} = gridPart
		groups.forEach(g =>
			w.hidecolumn(g))
	}
	
	static async onayRedIstendi({ sender: gridPart, state: onaymi }) {
		let islemAdi = `${onaymi ? 'ONAY' : 'RED'} İşlemi`
		try {
			let {selectedRecs: recs, kuralKey2Kural, gridWidget: w} = gridPart
			recs = recs.filter(rec => kuralKey2Kural[this.getKey(rec)] && rec.onayNo)
			if (empty(recs)) {
				hConfirm('Onaylanacak uygun belge bulunamadı', islemAdi)
				return
			}
			let nedenText
			if (onaymi) {
				let middleText = onaymi ? `<b class=forestgreen>ONAYLAMAK</b>` : `<b class=firebrick>REDDETMEK</b>`
				let rdlg = await ehConfirm(`<b class=royalblue>${recs.length}</b> adet kaydı ${middleText} istediğinize emin misiniz?`, islemAdi)
				if (!rdlg)
					return
			}
			else {
				nedenText = await jqxPrompt({ etiket: 'RED Nedeni giriniz', title: islemAdi })
				if (!nedenText)
					return
			}
			let key2Sayaclar = {}
			for (let rec of recs) {
				let {_db, _table, onayNo, sayac} = rec
				let key = [_db, _table, onayNo].join(delimWS)
				; (key2Sayaclar[key] ??= []).push(sayac)
			}
			let {user} = config, _now = now()
			let toplu = new MQToplu().withTrn()
			for (let [key, sayaclar] of entries(key2Sayaclar)) {
				let [db, table, onayNo] = key.split(delimWS)
				onayNo = asInteger(onayNo)
				toplu.add(
					new MQIliskiliUpdate({
						from: `${db}..${table}`,
						where: [
							{ inDizi: sayaclar, saha: 'kaysayac' }
						],
						set: [
							{ degerAta: bool2Int(onaymi), saha: `bw${onayNo}onay` },
							{ degerAta: _now, saha: `w${onayNo}onayredts` },
							(onaymi ? null : { degerAta: nedenText, saha: 'wredtext' })
						].filter(Boolean)
					})
				)
				// ...
				// bw1onay, w1onayuser, w1onayredts ... wredtext
				// /efgecicialfatfis, sipfis)
			}
			if (toplu?.bosDegilmi)
				await this.sqlExecNone(toplu)
			w?.clearselection()
			gridPart.tazele()
			{
				let middleText = onaymi ? `<b class=forestgreen>ONAYLANDI</b>` : `<b class=firebrick>REDDEDİLDİ</b>`
				eConfirm(`<b class=royalblue>${recs.length}</b> adet kayıt ${middleText}!`, islemAdi)
			}
		}
		catch (ex) {
			hConfirm(getErrorText(ex), islemAdi)
			throw ex
		}
		//- IPTAL - -- onaykurali: { tip: GAF }, { tip: TS, OnayNo: 2 }	-- onayNo yoksa =1 demektir
	}
	static async izleIstendi({ sender: gridPart }) {
		let islemAdi = 'e-İşlem İZLE'
		try {
			let {selectedRecs: recs} = gridPart
			let xmlFileNames = recs
					.filter(_ => _.uuid)
					.map(_ => `${_.uuid}.xml`)
			if (empty(xmlFileNames)) {
				hConfirm('Gösterilecek e-İşlem Görüntüsü bulunamadı', islemAdi)
				return
			}
			let eConf = await MQEConf.getInstance()
			// let divContainer = $(`<div/>`)[0]
			let eDocs = [], eDocCount = 0, aborted = false
			let pm = showProgress('e-İşlem Görüntüleri açılıyor...', islemAdi, true, () => aborted = true)
			pm.setProgressMax(xmlFileNames.length * 3)
			let errors = []
			for (let rec of recs) {
				let {uuid, tip, eIslTip} = rec || {}
				if (!uuid)
					continue
				eIslTip ||= 'E'
				let gelenmi = tip == 'GeciciAlimEFat'
				let xmlDosyaAdi = `${uuid}.xml`
				let eIslAltBolum = eConf.getAnaBolumFor({ eIslTip })?.trimEnd()
				let subDirName = gelenmi ? 'ALINAN' : 'IMZALI'
				let remoteFile = [eIslAltBolum, subDirName, xmlDosyaAdi].filter(_ => _).join('/')
				if (aborted)
					break
				let xsltProcessor = new XSLTProcessor()
				try {
					if (aborted)
						break
					let xmlData = await app.wsDownloadAsStream({ remoteFile, localFile: xmlDosyaAdi })
					pm?.progressStep()
					if (!xmlData)
						throw { isError: true, rc: 'noXML', errorText: 'XML (e-İşlem Belge İçeriği) bilgisi belirlenemedi' }
					let xml = $.parseXML(xmlData)
					let docRefs = Array.from(xml.documentElement.querySelectorAll(`AdditionalDocumentReference`))
					let xsltData
					{
						let xbinDoc, subName = 'EmbeddedDocumentBinaryObject'
						xbinDoc = docRefs.find(elm => elm.querySelector('DocumentType')?.innerHTML?.toUpperCase() == 'XSLT' && elm.querySelector(subName))
						if (!xbinDoc)
							xbinDoc = docRefs.find(elm => elm.querySelector(subName))
						if (xbinDoc)
							xsltData = xbinDoc.querySelector(subName)?.textContent
					}
					if (!xsltData)
						throw { isError: true, rc: 'noXSLT', errorText: 'XSLT (e-İşlem Görüntü) bilgisi belirlenemedi' }
					if (Base64.isValid(xsltData))
						xsltData = Base64.decode(xsltData)
					let xslt = $.parseXML(xsltData)
					xsltProcessor.importStylesheet(xslt)
					let eDoc = xsltProcessor.transformToFragment(xml, document)
					if (!eDoc)
						throw { isError: true, rc: 'xsltTransform', errorText: 'XSLT Görüntüsü oluşturulamadı', source: xsltProcessor }
					/*if (eDocCount) {
						let elmPageBreak = $(`<div style="float: none;"><div style="page-break-after: always;"></div></div>`)[0]
						let {lastElementChild} = divContainer
						lastElementChild.after(elmPageBreak)
						lastElementChild.after(eDoc.querySelector('.paper') ?? eDoc)
					}
					else
						divContainer.append(eDoc)*/
					let container = $(`<div/>`).append(eDoc)
					eDocCount++
					eDocs.push(container)
					pm?.progressStep(2)
				}
				catch (ex) {
					pm?.progressStep(3)
					let errorText, {statusText} = ex
					let [code] = statusText?.split(delimWS) ?? []
					if (!statusText) {
						let isObj = isObject(ex)
						code = isObj ? ex.rc ?? ex.code : null
						errorText = ex.errorText ?? ex.toString()
					}
					code = code?.toLowerCase() ?? ''
					if (code == 'filenotfoundexception')
						errorText = `XML Dosyası bulunamadı: [<b class=firebrick>${remoteFile}</b>]`
					errors.push(errorText)
				}
			}
			if (!aborted && eDocCount) {
				for (let eDoc of eDocs) {
					// let html = `<html><head>${divContainer.innerHTML}</head></html>`
					let html = `<html><body>${eDoc[0].innerHTML}</body></html>`
					let url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
					openNewWindow(url)
					setTimeout(() => URL.revokeObjectURL(url), 10_000)
				}
			}
			if (!aborted && errors.length) {
				let errorText = `<ul>${errors.map(_ => `<li class="mt-1">${_}</li>`).join(CrLf)}</ul>`
				hConfirm(errorText, 'e-İşlem Görüntüle')
				console.error(errorText)
			}
			pm?.progressEnd()
			setTimeout(() => hideProgress(), 500)
		}
		catch (ex) {
			hConfirm(getErrorText(ex), islemAdi)
			throw ex
		}
	}

	static getKey({ tip, onayNo } = {}) {
		return [tip, onayNo || 1].filter(_ => _).join('|')
	}
	static getHTML({ rec }) {
		let {dev} = config
		let {tarih, mustUnvan, fisNox, uuid, ekBilgi} = rec
		uuid = uuid?.toLowerCase() ?? ''
		return [
			`<div class="flex-row" style="gap: 0 10px">`,
				`<template class="sort-data">${dateToString(tarih)}|${fisNox}|${mustUnvan}</template>`,
				`<div class="ek-bilgi royalblue">${dateKisaString(asDate(tarih))}</div>`,
				`<div class="asil bold">${mustUnvan}</div>`,
				`<div class="ek-bilgi forestgreen bold float-right">${fisNox}</div>`,
				(dev ? `<div class="ek-bilgi gray">${uuid}</div>` : null),
				`<div class="asil orangered">${ekBilgi}</div>`,
			`</div>`
		].filter(_ => _).join(CrLf)
	}
}


/*
App = Onaycı
[ ONAY İŞLEMLERİ ] adımı
								[ ONAY ] [ RED ]  { İZLE ] (eişlem göster)
	VERİTABANI
		  TİP         TARİH   BELGE NO    CARİ    BEDEL    EK BİLGİ
        (GAF)  Alım e-Fat.     ....     ....    ....     ...        ??
         (TS)  Sat. Sip.

	ORTAK PARAM: {
		onayciKurallari: {
			user: {
				db: {
					YI25ABC: [
						...
						{ tip: 'GAF, TS, AF, ...', onayNo: 2 },
						...
					],
					YI25XYZ: [
						...
						{ tip: 'GAF, TS, AF, ...', onayNo: 1 },
						{ tip: 'GAF, TS, AF, ...', onayNo: 2 },
						...
					]
				}
			}
		}
	}
	onaysiz ==> onay[n] = NULL
	[ONAY / RED] butona basınca:
		db2Kurallar = ortakParam.onayciKurallari[user].db
		uygunRecs = []
		selectedRecs.filter(_ => db2Kurallar [_.db]) as recs:
			recs:
				kurallar = db2Kurallar [rec.db]
				kurallar as kural:
					if rec.tip == kural.tip && rec.onayno == kural.onayNo:
						uygunRecs.push(rec)
		onayRedYap({ islem, recs: uygunRecs })
		
		
		onayRedYap({ islem, recs }):
			(islem):
				- 'onay':
					- {rec.table].onay[n] = 1
						n = 1-based
				- 'red':
					redtext = ...
					- {rec.table].onayno[n] = 0
					  {rec.table].redtext = redtext
				sql-update


	ONAY BEKLEYENLER
	QUERY: db, table(sipfis|piffis), kaysayac, ...
		onayciKurallari[userKod].db:
			- (tip, onayno)
			- rec.onayno == null
			- onayno > 1:
				rec[onayno - 1] == true
			* Önceki onaycı (varsa) onaylamış olmalı

	-- onaykurali: { tip: GAF }, { tip: TS, OnayNo: 2}	-- onayNo yoksa =1 demektir
	create table firmaonayci								--adi Firma Onaycı
		( xuserkod		char(10) not null		-- xenc
		, firmaadi		varchar(30) not null
		, tip           varchar(20) not null
		, onayno        tinyint not null default 1
		);
	alter table firmaonayci add constraint prifirmaonayci primary key (xuserkod, firmaadi, tip, onayno);		--adi Firma Onaycı anahtarı


	let {encUser: xuserkod} = config.session
	let hvListe = [
		{ xuserkod, firmaadi: 'YDDENIZ', onayno: 1, tip: 'TF' },
		{ xuserkod, firmaadi: 'YDDENIZ', onayno: 2, tip: 'TF' },
		{ xuserkod, firmaadi: 'YDCASTROL', onayno: 1, tip: 'AF' },
		{ xuserkod, firmaadi: 'CNGAS', onayno: 1, tip: 'TS' },
		{ xuserkod, firmaadi: 'CNGAS', onayno: 1, tip: 'TF' },
		{ xuserkod, firmaadi: 'CNGAS', onayno: 1, tip: 'AF' },
		{ xuserkod, firmaadi: 'CNGAS', onayno: 2, tip: 'AF' }
	]
	let table = 'ORTAK..firmaonayci'
	let toplu = new MQToplu([
		new MQIliskiliDelete({ from: table }),
		new MQInsert({ table, hvListe })
	]).withTrn()
	try { await app.sqlExecNone(toplu) }
	catch (ex) { cerr(ex) }


	-- onayuser decr durumdadir
	alter table efgecicialfatfis
		add bw1onay				bit		-- null olmali
		, w1onayuser			char(10)
		, w1onayredts			datetime
		, bw2onay				bit		-- null olmali
		, w2onayuser			char(10)
		, w2onayredts			datetime
		, wredtext				varchar(40) not null default '';		-- ilk red yapan kisi icin
	-- max 2 onay
	
	alter table sipfis
		add bw1onay				bit		-- null olmali
		, w1onayuser			char(10)
		, w1onayredts			datetime
		, bw2onay				bit		-- null olmali
		, w2onayuser			char(10)
		, w2onayredts			datetime
		, wredtext				varchar(40) not null default '';		-- ilk red yapan kisi icin

	
*/
