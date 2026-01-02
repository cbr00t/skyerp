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
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {tableAlias: alias} = this
		liste.push(...[
			new GridKolon({ belirtec: 'tiptext', text: 'Tip', genislikCh: 20, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 13, filterType: 'checkedlist' }).tipDate(),
			new GridKolon({ belirtec: 'fisnox', text: 'Belge No', genislikCh: 23, filterType: 'checkedlist' }),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'must', text: 'Müşteri', genislikCh: 18, filterType: 'checkedlist' }),
				new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', genislikCh: 50, filterType: 'checkedlist' })
			),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 19 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'ekbilgi', text: 'Ek Bilgi' })
		])
	}
	static async loadServerDataDogrudan({ sender: gridPart }) {
		let kurallar = [], kuralKey2Kural = {}, dbSet = {}
		{
			let {encUser /*, dbName: db*/} = config.session
			let {ay: buAy, yil2: buKisaYil} = today()
			let kisaYillar = []
			{
				let {onayYili} = app.params?.ortak ?? {}
				kisaYillar.push(onayYili || buKisaYil)
				if (buAy == 1)
					kisaYillar.push(buKisaYil - 1)
			}
			let sent = new MQSent(), {where: wh, sahalar} = sent
			sent.fromAdd('ORTAK..firmaonayci k')
			wh.degerAta(encUser, 'k.xuserkod')
			/*{
				let or = new MQOrClause()
				for (let kisaYil of kisaYillar)
					or.like(`__${kisaYil}%`, 'k.firmaadi')
				if (or.liste.length)
					wh.add(or)
			}*/
			sahalar.add(
				'k.firmaadi', 'k.tip',
				`(case when COALESCE(k.onayno, 0) = 0 then 1 else k.onayno end) onayno`
			)
			kurallar = await this.sqlExecSelect(sent)
			let allDBNames = await app.wsDBListe()
			kuralKey2Kural = {}; dbSet = {}
			for (let rec of kurallar) {
				let {firmaadi} = rec
				kuralKey2Kural[this.getKey(rec)] = rec
				for (let db of allDBNames) {
					if (db.slice(2).includes(firmaadi))
						dbSet[db] = true
				}
			}
		}
		$.extend(gridPart, { kurallar, kuralKey2Kural, dbSet })
		{
			let uni = new MQUnionAll()
			for (let db in dbSet) {
				{
					// Ticari Belgeler
					let table = 'piffis', psTip = 'P'
					let sent = new MQSent(), {where: wh, sahalar} = sent
					sent.fromAdd(`${db}..${table} fis`)
					sent.fromIliski(`${db}..carmst car`, 'fis.must = car.must')
					wh.fisSilindiEkle()
					wh.inDizi(['I', 'F'], 'fis.piftipi')
					wh.add(`fis.ayrimtipi = ''`, `fis.efatuuid <> ''`/*, `fis.efgonderimts IS NULL`, `fis.onaytipi = 'ON'`*/)
					sahalar.add(
						`'${table}' _table`, `'${psTip}' pstip`,
						'fis.efayrimtipi', 'fis.efatuuid', `RTRIM(fis.piftipi) anatip`,
						`(RTRIM(fis.almsat) + RTRIM(fis.iade) + RTRIM(fis.piftipi)) tip`,
						'(' +
							`(case fis.almsat when 'A' then 'Alım ' when 'T' then 'Satış ' else '' end) + ` +
							`(case fis.iade when 'I' then 'İADE ' else '' end) + ` +
							`(case fis.piftipi when 'F' then 'Fatura' when 'I' then 'İrsaliye' when 'P' then 'Perakende' else fis.piftipi end)` +
						') tiptext')
					sahalar.addWithAlias('fis', 'kaysayac', 'tarih', 'fisnox', 'must', 'net bedel', 'cariaciklama ekbilgi')
					sahalar.add('car.birunvan mustunvan')
					uni.add(sent)
				}
				{
					// Siparişler
					let table = 'sipfis', psTip = 'S'
					let sent = new MQSent(), {where: wh, sahalar} = sent
					sent.fromAdd(`${db}..${table} fis`)
					sent.fromIliski(`${db}..carmst car`, 'fis.must = car.must')
					wh.fisSilindiEkle()
					wh.add(`fis.ayrimtipi = ''`, `fis.efatuuid <> ''`/*, `fis.efgonderimts IS NULL`, `fis.onaytipi = 'ON'`*/)
					sahalar.add(
						`'${table}' _table`, `'${psTip}' pstip`,
						'fis.efayrimtipi', 'fis.efatuuid', `'S' anatip`,
						`(RTRIM(fis.almsat) + 'S') tip`,
						'(' +
							`(case fis.almsat when 'A' then 'Alım ' when 'T' then 'Satış ' else '' end) + ` +
							`'Sipariş'` +
						') tiptext')
					sahalar.addWithAlias('fis', 'kaysayac', 'tarih', 'fisnox', 'must', 'net bedel', 'cariaciklama ekbilgi')
					sahalar.add('car.birunvan mustunvan')
					uni.add(sent)
				}
			}
			if (!uni.liste.length)
				return []
			let stm = new MQStm({ sent: uni })
			let recs = await this.sqlExecSelect(stm)
			recs = recs.filter(rec => kuralKey2Kural[this.getKey(rec)])
			return recs
		}
	}
	static async onayRedIstendi({ sender: gridPart, state }) {
		let islemAdi = `${state ? 'ONAY' : 'RED'} İşlemi`
		try {
			let {selectedRecs: recs, kuralKey2Kural: kuralKeySet} = gridPart
			recs = recs.filter(rec => kuralKeySet[this.getKey(rec)])
			if (empty(recs)) {
				hConfirm('Onaylanacak uygun belge bulunamadı', islemAdi)
				return
			}
			{
				let middleText = state ? `<b class=forestgreen>ONAYLAMAK</b>` : `<b class=firebrick>REDDETMEK</b>`
				let rdlg = await ehConfirm(`<b class=royalblue>${recs.length}</b> adet kaydı ${middleText} istediğinize emin misiniz?`, islemAdi)
				if (!rdlg)
					return
			}
			let toplu = new MQToplu().withTrn()
			for (let rec of recs) {
				// ...
			}
			if (toplu?.bosDegilmi)
				await this.sqlExecNone(toplu)
			gridPart.tazele()
			{
				let middleText = state ? `<b class=forestgreen>ONAYLANDI</b>` : `<b class=firebrick>REDDEDİLDİ</b>`
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
			let ext = 'html'
			let fileNames = recs
				.filter(_ => _.efatuuid)
				.map(_ => `${_.efatuuid}.${ext}`)
			let dir = (await MQEConf.getInstance()).getAnaBolumFor('E').trimEnd()
			let recursive = true, includeDirs = false, pattern = `*.${ext}`
			let files
			if (!empty(fileNames)) {
				files = await app.wsDosyaListe({ dir, recursive, includeDirs, fileNames: fileNames.join(delimWS), pattern })
				files = files?.recs ?? files
			}
			if (empty(files)) {
				hConfirm(`Gösterilecek e-İşlem Görüntüsü bulunamadı: [${dir} :: ${pattern}]`, islemAdi)
				return
			}
			let promises = [], aborted = false
			let pm = showProgress('e-İşlem Görüntüleri açılıyor...', islemAdi, true, () => aborted = true)
			pm.setProgressMax(files.length * 3)
			for (let file of files) {
				let {relDir, name} = file
				let remoteFile = [dir, relDir, name].join('/')
				let localFile = name
				if (aborted)
					break
				promises.push(new Promise(async (resolve, reject) => {
					if (aborted)
						return
					try {
						let data = await app.wsDownloadAsStream({ remoteFile, localFile })
						pm?.progressStep(2)
						if (data) {
							let url = URL.createObjectURL(new Blob([data], { type: 'text/html' }))
							openNewWindow(url)
							pm?.progressStep()
							setTimeout(() => URL.revokeObjectURL(url), 10_000)
						}
						resolve(data)
					}
					catch (ex) {
						pm?.progressStep(3)
						hConfirm(getErrorText(ex), `${relDir}/${name}`)
						reject(ex)
					}
				}))
			}
			pm?.progressEnd()
			setTimeout(() => hideProgress(), 500)
		}
		catch (ex) {
			hConfirm(getErrorText(ex), islemAdi)
			throw ex
		}
	}
	static getKey({ tip, onayno } = {}) {
		return [tip, onayno || 1].filter(_ => _).join('|')
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
*/
