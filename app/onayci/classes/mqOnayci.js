class MQOnayci extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'ONAYCI' } static get sinifAdi() { return 'Onay İşlemleri' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get secimSinif() { return null } static get kolonFiltreKullanilirmi() { return false }
	static get gridIslemTuslariKullanilirmi() { return false }
	static get table2Yapi() {
		let { _table2Yapi: result } = this
		if (result == null) {
			result = this._table2Yapi = {
				efgecicialfatfis: {
					idVarmi: true,
					harTable: 'efgecicialfatdetay',
					tipler: {
						GeciciAlimEFat: { tipText: 'Gecici Alım e-İşlem' }
					},
					fisBaglantiDuzenle: ({ alias, clauses }) =>
						clauses.push(`${alias}.efbelge IN ('', 'E')`),
					clauses: {
						oncelik: '1',
						eIslTip: ({ alias }) => `${alias}.efbelge`,
						uuid: ({ alias }) => `${alias}.efuuid`,
						mustUnvan: ({ alias }) => `${alias}.efmustunvan`,
						tarih: ({ alias }) => `${alias}.tarih`,
						fisNox: ({ alias }) => `${alias}.effatnox`,
						bedel: ({ alias }) => `${alias}.efsonuc`
					}
				},
				sipfis: {
					harTable: ['sipstok', 'siphizmet'],
					tipler: {
						AlimSip: { tipText: 'Alım Sipariş' },
						SatisSip: { tipText: 'Satış Sipariş' }
					},
					fisBaglantiDuzenle: ({ alias, clauses }) =>
						clauses.push(`${alias}.silindi = ''`, `${alias}.ozeltip = ''`),
					clauses: {
						oncelik: '2',
						eIslTip: ({ alias }) => `${alias}.efayrimtipi`,
						uuid: ({ alias }) => `${alias}.efatuuid`,
						mustKod: ({ alias }) => `${alias}.must`,
						mustUnvan: 'fis_carmst.birunvan',
						tarih: ({ alias }) => `${alias}.tarih`,
						fisNox: ({ alias }) => `${alias}.fisnox`,
						bedel: ({ alias }) => `${alias}.net`,
						ekBilgi: ({ alias }) => `${alias}.cariaciklama`
					}
				}
			}
			for (let [table, item] of entries(result))
				item.table = table
		}
		return result
	}
	static get tip2Yapi() {
		let { _tip2Yapi: result } = this
		if (result == null) {
			let { table2Yapi } = this
			result = this._tip2Yapi = {}
			for (let item of values(table2Yapi)) {
				let { tipler } = item
				if (empty(tipler))
					continue
				for (let [tip, subItem] of entries(tipler)) {
					let newItem = { ...item, ...subItem }
					delete newItem.tipler
					result[tip] = newItem
				}
			}
		}
		return result
	}

	static listeEkrani_init(e) {
		super.listeEkrani_init(e)
		let { sender: gridPart } = e, { dev } = config
		extend(gridPart, {
			// otoTazeleSecs: qs.otoTazeleYok ? null : qs.otoTazeleSecs || (dev ? 20: 60),
			otoTazeleSecs: qs.otoTazeleYok ? null : ( Number(qs.otoTazeleSecs) || null ),
			otoTazeleDisabled: qs.otoTazeleYok ?? false,
			serviceProc_delaySecs: max(Number(qs.serviceProc_delaySecs) || 10, 2)
		})
	}
	static listeEkrani_afterRun(e = {}) {
		super.listeEkrani_afterRun(e)
		if (config.service)
			this.startServiceProc(e)
		else {
			setTimeout(() => {
				if (!this.ws_ntfy)
					this.registerNTFY(e)
			}, 5_000)
			this.otoTazele_startTimer(e)
		}
		try { Notification.requestPermission() }
		catch (ex) { cerr(ex) }
	}
	static listeEkrani_destroyPart(e = {}) {
		super.listeEkrani_destroyPart(e)
		this.unregisterNTFY(e)
		this.stopServiceProc(e)
		// this.otoTazele_stopTimer(e)
	}
	static listeEkrani_activated({ sender: gridPart }) { super.listeEkrani_activated(...arguments) }
	static listeEkrani_deactivated({ sender: gridPart }) { super.listeEkrani_deactivated(...arguments) }
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e)
		let {liste, part: { ekSagButonIdSet: sagSet }} = e
		let items = [
			{ id: 'onay', text: ' ONAY ', handler: _e => this.onayRedIstendi({ ..._e, ...e, state: true }) },
			{ id: 'red', text: ' RED ', handler: _e => this.onayRedIstendi({ ..._e, ...e, state: false }) },
			{ id: 'eIslemIzle', handler: _e => this.izleIstendi({ ..._e, ...e }) }
		]
		liste.push(...items)
		extend(sagSet, asSet(items.map(_ => _.id)))
	}
	static rootFormBuilderDuzenle_listeEkrani({ sender: gridPart, rootBuilder: rfb }) {
		super.rootFormBuilderDuzenle_listeEkrani(...arguments)
		this.fbd_listeEkrani_addCheckBox(rfb, {
			id: 'hepsiniGoster', text: '+ Onaylı',
			value: gridPart.hepsiniGoster,
			handler: ({ builder: { layout } }) => {
				let input = layout.children('input')
				gridPart.hepsiniGoster = input.is(':checked')
				gridPart.tazele()
			}
		 })
	}
	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		let mini = isMiniDevice()
		extend(args, {
			columnsMenu: !mini, groupsExpandedByDefault: true,
			rowsHeight: mini ? 75 : 65
		})
	}
	static orjBaslikListesi_groupsDuzenle({ sender: gridPart, liste }) {
		super.orjBaslikListesi_groupsDuzenle(...arguments)
		let {hepsiniGoster} = gridPart
		if (hepsiniGoster)
			liste.push('onayDurumText')
		liste.push('_db', 'tipText')
	}
	static orjBaslikListesiDuzenle({ sender: gridPart, liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {tableAlias: alias} = this
		let mini = isMiniDevice()
		liste.push(...[
			// new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 13, filterType: 'checkedlist' }).tipDate(),
			new GridKolon({ belirtec: '_text', text: ' ', minWidth: 25 * katSayi_ch2Px }),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 13 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: '_db', text: 'Veritabanı', genislikCh: 13, filterType: 'checkedlist', hidden: mini }),
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'onayTS', text: 'O/R Zaman', genislikCh: 14, filterType: 'checkedlist' }),
				new GridKolon({ belirtec: 'onayRedNedeni', text: 'Neden Açıklama', genislikCh: mini ? 10 : 20, filterType: 'checkedlist' })
			),
			new GridKolon({ belirtec: 'onayDurumText', text: 'Durum', genislikCh: 13, filterType: 'checkedlist', hidden: mini }),
			new GridKolon({ belirtec: 'tipText', text: 'Tip', genislikCh: 20, filterType: 'checkedlist', hidden: mini })
		].filter(Boolean))
	}
	static async loadServerDataDogrudan({ sender: gridPart }) {
		gridPart.otoTazeleDisabled = true
		try { return await this._loadServerDataDogrudan(...arguments) }
		finally { gridPart.otoTazeleDisabled = false }
	}
	static async _loadServerDataDogrudan({ sender: gridPart }) {
		let e = arguments[0]
		let sqlNull = 'NULL', sqlEmpty = `''`
		let { onayNo: aktifOnayNo, onayMax } = app
		let { encUser, user /*, dbName: db*/ } = config.session
		let { ay: buAy, yil2: buKisaYil } = today()
		let { hepsiniGoster } = gridPart
		aktifOnayNo ||= 1
	
		let _cache = /*this._cache ??=*/ await (async () => {
			// let kurallar = [], kuralKey2Kural = {}
			let kisaYilSet = {}, tip2Kurallar = {}, tip2Param = {}, dbSet = {}
			;{
				let { onayYili } = app.params?.ortak ?? {}
				kisaYilSet[onayYili || buKisaYil] = true
				if (buAy == 1)
					kisaYilSet[buKisaYil - 1] = true
			}
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent
				.fromAdd('ORTAK..firmabilgi fbil')
				.innerJoin('fbil', 'ORTAK..firmatipbilgi ftip', 'fbil.id = ftip.firmaid')
				.innerJoin('ftip', 'ORTAK..onaybildirim fis', 'ftip.id = fis.firmatipid')
				.innerJoin('fis', 'ORTAK..islemonayci har', 'fis.id = har.fisid')
			wh.degerAta(encUser, 'har.xuserkod')
			sahalar.add(...[
				'fis.id', 'fbil.firmaadi firmaAdi', 'ftip.tip',
				`(case when COALESCE(fis.onayno, 0) = 0 then 1 else fis.onayno end) onayNo`,
				'har.onaylimiti onayLimiti', `ftip.paramjson paramJSON`
			])
			let kurallar = await this.sqlExecSelect(sent)
			let allDBNames = await app.wsDBListe()
			let ignoreProgBelirtecSet = ['BR', 'MH', 'IS', 'AK']
			allDBNames = allDBNames.filter(_ => 
				!ignoreProgBelirtecSet[_.substr(0, 2)] &&
				kisaYilSet[asInteger(_.substr(2, 2))]
			)
			for (let rec of kurallar) {
				let { tip, firmaAdi, paramJSON: par } = rec
				// kuralKey2Kural[this.getKey(rec)] = rec
				;(tip2Kurallar[tip] ??= []).push(rec)
				if (par) {
					try {
						par = JSON.parse(par)
						if (!empty(par))
							tip2Param[tip] = par
					}
					catch (ex) { console.error(ex) }
				}
				for (let db of allDBNames) {
					let db_firmaAdi = db.substr(4)
					if (db_firmaAdi == firmaAdi)
						dbSet[db] = true
				}
			}
			;{
				// eksik tablolu db'leri listeden at
				let dbListe = keys(dbSet)
				let results = await promiseAllSet(
					dbListe.map(db => app.sqlHasColumn(`${db}..webonay`, 'id')))
				;dbListe.forEach((db, i) => {
					let { status, value } = results[i]
					let uygunmu = status == 'fulfilled' && value    // promise hata almadı ve result == true
					if (!uygunmu)
						delete dbSet[db]
				})
			}
			return ({ kurallar, tip2Kurallar, tip2Param, dbSet })  // , kurallar, kuralKey2Kural
		})()
		;mergeInto(_cache, app, 'kurallar', 'tip2Kurallar', 'tip2Param', 'dbSet')

		let { table2Yapi, tip2Yapi } = this
		// let userSql = user.sqlServerDegeri()

		let { dbSet } = app
		let orderBy = ['onayDurumText', '_db', 'oncelik']
		let stm = new MQStm({ orderBy }), { with: $with } = stm
		for (let db in dbSet) {
			let uni = new MQUnionAll()
			// for (let i = 1; i <= onayMax; i++) {
			let i = aktifOnayNo
			;{
				let ilkmi = i == 1, sonmu = i == onayMax
				let sent = new MQSent(), { where: wh, sahalar } = sent
				;{
					sent.fromAdd(`${db}..webonay ony`)
					wh.degerAta(user, `ony.w${i}onayuser`)    // her asama icin ayri sent
					if (!hepsiniGoster)
						wh.degerAta('', `ony.w${i}onaydurum`)
					if (!ilkmi)
						wh.degerAta('O', `ony.w${i - 1}onaydurum`)
				}
				;{
					let cl = {
						once: {
							text: ilkmi ? sqlEmpty : `ony.w${i - 1}onayredtext`,
							user: ilkmi ? sqlEmpty : `ony.w${i - 1}onayuser`
						},
						sonra: {
							user: sonmu ? sqlEmpty : `ony.w${i + 1}onayuser`
						}
					}
					sahalar
						.addWithAlias('ony', ...[
							'asiltablo _table', 'adimtipi tip', 'id onayId', 'adimsayac sayac', 'adimid id',
							`w${i}onaydurum onayDurum`, `w${i}onayredts onayTS`, `w${i}onayredtext onayRedNedeni`
						])
						.add(...[
							`${i.sqlServerDegeri()} onayNo`, `${cl.once.text} onceText`,
							`${cl.once.user} onceUser`, `${cl.sonra.user} sonraUser`
						])
				}
				uni.add(sent)
			}
			if (!empty(uni.liste))
				$with.add(uni.asTmpTable(`${db}_onayci`))    // bu vt coklu onay asamalari saklanir
		}
		if (empty($with.liste))
			return []

		let saha2Table2Clause = {}
		for (let [table, tableYapi] of entries(table2Yapi)) {
			let alias = `fis_${table}`
			let { clauses = {} } = tableYapi
			for (let [saha, clause] of entries(clauses)) {
				if (isFunction(clause))
					clause = await clause.call(this, { ...e, ...tableYapi, table, saha, alias })
				if (clause) {
					let t2c = saha2Table2Clause[saha] ??= {}
					t2c[table] = clause
				}
			}
		}
		;{
			let uni = stm.sent = new MQUnionAll()
			for (let db in dbSet) {
				let dbClause = db.sqlServerDegeri()
				
				let sent = new MQSent(), { where: wh, sahalar } = sent
				sent.fromAdd(`${db}_onayci ony`)
				for (let [table, tableYapi] of entries(table2Yapi)) {
					let { idVarmi, fisBaglantiDuzenle } = tableYapi
					let alias = `fis_${table}`
					let idSaha_ony = idVarmi ? 'id' : 'sayac'
					let idSaha_asil = idVarmi ? 'id' : 'kaysayac'
					let _e = {
			            ...e, table, tableYapi,
						sent, alias,
						clauses: [    // fis iliski clauses
							`ony._table = ${table.sqlServerDegeri()}`,
							`ony.${idSaha_ony} = ${alias}.${idSaha_asil}`
						]
			        }
					await fisBaglantiDuzenle?.call?.(this, _e)
					sent.leftJoin('ony', `${db}..${table} ${alias}`, _e.clauses)
				}
				
				let { mustKod: table2MustKodClause } = saha2Table2Clause
				if (!empty(table2MustKodClause)) {
		            let $case = new MQCase()
						.setClause('ony._table')
					for (let [table, clause] of entries(table2MustKodClause))
						$case.when(table.sqlServerDegeri(), clause)
					$case.else(sqlNull)
		            sent.leftJoin(
		                'ony', `${db}..carmst fis_carmst`,
		                `${$case} = fis_carmst.must`
		            )
		        }

				;{
					sahalar
						.add(`${dbClause} _db`)
						.addWithAlias('ony', ...[
							'_table', 'tip', 'onayId', 'sayac', 'id', 'onayNo', 'onayDurum',
							'onayTS', 'onayRedNedeni', 'onceText', 'onceUser', 'sonraUser'
						])
						.add(
							`${new MQCase()
								.when(`ony.onayDurum = ${sqlEmpty}`, `<span class=forestgreen>Cevap Bekleyenler</span>`.sqlServerDegeri())
								.else(`<span class=orangered>Cevaplananlar</span>`.sqlServerDegeri())
							 } onayDurumText`
						)
				}

				for (let [saha, table2Clause] of entries(saha2Table2Clause)) {
					let $case = new MQCase()
						.setClause('ony._table')
					for (let [table, clause] of entries(table2Clause)) {
						let alias = `fis_${table}`
						if (isFunction(clause))
							clause = clause.call(this, { ...e, saha, table, sent, alias })
						if (clause)
							$case.when(table.sqlServerDegeri(), clause)
					}
					if (!empty($case.liste)) {
						$case.else(sqlNull)
						sahalar.add(`${$case} ${saha}`)
					}
				}

				;{
				    let or = new MQOrClause()
				    for (let [table, tableYapi] of entries(table2Yapi)) {
				        let { idVarmi } = tableYapi
				        let alias = `fis_${table}`
				        let keySaha = idVarmi ? 'id' : 'kaysayac'
				        or.add(
				            new MQAndClause()
				                .degerAta(table, 'ony._table')
				                .add(`${alias}.${keySaha} IS NOT NULL`)
				        )
				    }
				    wh.add(or)
				}
				
				uni.add(sent)
			}
		}
		
		let recs = await this.sqlExecSelect(stm)
		if (!app.onayNo) {
			let onayNo = app.onayNo = max(1, ...(recs?.map(_r => Number(_r.onayNo)) ?? []))
			if (onayNo) {
				await this.unregisterNTFY(e)
				await this.registerNTFY(e)
			}
		}
		
		let db2GecAlimSayacListe = {}
		;recs.forEach(({ _db: db, tip, eIslTip, sayac }) => {
			if (tip == 'GeciciAlimEFat' && eIslTip != 'IR')
				(db2GecAlimSayacListe[db] ??= []).push(sayac)
		})
		
		if (!empty(db2GecAlimSayacListe)) {
			let db2Sayac2RecDurum = {}, promises = []
			for (let [db, gecAlimSayacListe] of entries(db2GecAlimSayacListe)) {
				let sent = new MQSent(), { where: wh, sahalar } = sent
				sent
					.fromAdd(`${db}..efgecicialfatirs irs`)
					.innerJoin('irs', `${db}..efgecicialfatfis fis`, 'irs.fissayac = fis.kaysayac')
					.leftJoin('fis', `${db}..carmst car`, `fis.vkno = (case when car.sahismi = '' then car.vnumara else car.tckimlikno end)`)
					.leftJoin('car', `${db}..piffis virs`, [
						`virs.piftipi = 'I'`, `virs.almsat = 'A'`, `virs.iade = ''`,
						'car.must = virs.must', 'irs.irsseri = virs.seri',
						'irs.irsnoyil = virs.noyil', 'irs.irsno = virs.no'
					])
				wh.inDizi(gecAlimSayacListe, 'irs.fissayac')
				sahalar.add('irs.fissayac sayac', 'irs.efirsnobilgi nox', 'COUNT(virs.kaysayac) sayi')
				sent.groupByOlustur()
				
				promises.push(promise(async () => {
					db2Sayac2RecDurum[db] ??= fromEntries(
						(await app.sqlExecSelect(sent))
							.map(_ => [_.sayac, { irsNox: _.nox, irsVarmi: !!_.sayi }])
					)
					return null   // resolve(null) | on error => fail(ex)
				}))
			}
			
			if (!empty(promises))
				await promiseAll(promises)
			
			if (!empty(db2Sayac2RecDurum)) {
				;recs.forEach(rec => {
					let { _db: db, tip, sayac, onayNo } = rec
					let durum = db2Sayac2RecDurum[db]?.[sayac]
					if (durum)
						extend(rec, durum)
					
					let item = tip2Yapi[tip]
					if (item) {
						let { tipText } = item
						if (onayNo) {
							tipText += [
								' ',
								`<span class="etiket darkgray"> | </span>`,
								`<span class="etiket gray">Onay: </span>`,
								`<span class="veri bold orangered">${String(onayNo)}</span>`
							].join('')
						}
						extend(rec, { tipText })
					}
				})
			}
		}

		let user2Adi = app.user2Adi ??= {}
		;{
			let eksikUserSet = new Set()
			;recs
				.flatMap(r => [r.onceUser, r.sonraUser])
				.filter(u => u && user2Adi[u] === undefined)
				.forEach(u => eksikUserSet.add(u))
			if (!empty(eksikUserSet)) {
				await promiseAll(
					arrayFrom(eksikUserSet).map(user =>
						Session.getSessionBasit({ user }).then(s =>
							user2Adi[user] = s?.userDesc ?? null)
					)
				)
			}
			for (let rec of recs)
				rec._text = await this.getHTML({ rec })
		}
		
		return recs
	}
	static gridVeriYuklendi(e = {}) {
		let { sender: gridPart } = e
		let { gridWidget: w, gridWidget: { groups } } = gridPart
		let { hepsiniGoster, prevRecs, boundRecs } = gridPart
		groups.forEach(g =>
			w.hidecolumn(g))
		;['onayRedNedeni', 'onayTS'].forEach(k =>
			w[hepsiniGoster ? 'showcolumn' : 'hidecolumn'](k))
		gridPart.prevRecs = boundRecs
	}
	static startServiceProc(e = {}) {
		let { sender: gridPart } = e
		let { serviceProc_delaySecs: delaySecs } = gridPart
		this.stopServiceProc(e)
		if (!delaySecs)
			return null
		return this._timer_serviceProc = setTimeout(async (...rest) => {
			let aborted = false
			try { aborted = await this.serviceProc(e) === false }
			finally {
				this._timer_serviceProc = null
				if (!aborted)
					this.startServiceProc(e)
			}
		}, delaySecs * 1_000)
	}
	static stopServiceProc(e = {}) {
		let { _timer_serviceProc: timer } = this
		clearTimeout(timer)
		return timer
	}
	static async serviceProc(e = {}) {
		let { sender: gridPart } = e
		let { prevRecs } = gridPart
		
		try { await app._promise_ilkBilgiler }
		catch (ex) { cerr(ex) }
		
		let recs = await this._loadServerDataDogrudan(e)
		let degistimi = prevRecs && recs.length > prevRecs.length
		if (degistimi) {
			let { ntfyTopic: topic } = app
			let priority = 1, tags = ['_new']
			await ntfy({ topic, priority, tags })
		}
		return true
	}
	static async registerNTFY(e = {}) {
		try { await app._promise_ilkBilgiler }
		catch (ex) { cerr(ex) }
		if (!app.portalMustKod) {
			this.unregisterNTFY(e)
			cerr(ex)
			return
		}
		
		let { otoTazeleDisabled, ws_ntfy: ws } = this
		if (ws?.state == EventSource.CLOSED)
			ws = this.ws_ntfy = null

		if (otoTazeleDisabled || ws)
			return ws

		let { sender: gridPart } = e
		let { ntfyTopic: topic } = app
		let url = [app.ntfyWSUrl, topic, 'sse'].filter(Boolean).join('/')
		ws = this.ws_ntfy = new EventSource(url)
		ws.onmessage = async ({ data: _ }) => {
			if (_ && isString(_))
				_ = JSON.parse(_) ?? {}
			let { tags = [], message: msg } = _
			if (msg == 'triggered')
				msg = null
			//if (!msg || msg == 'triggered')
			//	return
			//if (isString(msg))
			//	msg = JSON.parse(msg)
			;{
				let ind = tags?.indexOf('_new') ?? -1
				if (ind > -1) {
					let count = asInteger(tags[ind + 1])
					gridPart?.tazele()
					if (msg != null) {
						let { sinifAdi: title } = this
						let body = msg == '.' ? ( `Onay Bekleyen ${count ? `${count} yeni belge` : 'yeni belgeler'} var` ) : msg
						notify({ title, body })
						if (!isTouchDevice()) {
							try { new Notification(title, { body }) }
							catch (ex) { }
						}
					}
				}
			}
		}
		ws.onopen = evt =>
			clog(evt)
		ws.onclose = ws.onerror = async evt => {
			let { data: err } = evt
			if (err)
				cerr(getErrorText(err))
			this.unregisterNTFY(e)
			await delay(2_000)
			this.registerNTFY(e)
		}
		return ws
	}
	static unregisterNTFY(e = {}) {
		let { ws_ntfy: ws } = this
		if (ws?.state == EventSource.OPEN)
			ws.close()
		this.ws_ntfy = null
		return this
	}
	static otoTazele_startTimer({ sender: gridPart }) {
		let e = arguments[0], { otoTazeleSecs } = gridPart
		this.otoTazele_stopTimer(e)
		gridPart._timer_otoTazele = setTimeout(e =>
			this.otoTazele_timerProc(e),
			otoTazeleSecs * 1_000, e)
	}
	static otoTazele_stopTimer({ sender: gridPart }) {
		clearTimeout(gridPart._timer_otoTazele)
	}
	static otoTazele_timerProc({ sender: gridPart }) {
		let { otoTazeleSecs, otoTazeleDisabled } = gridPart
		if (!otoTazeleSecs || otoTazeleDisabled)
			return
		if (!gridPart.isDestroyed)
			gridPart.tazele()
	}

	static async onayRedIstendi({ sender: gridPart, state: onaymi }) {
		let { dev } = config
		let kisaIslemAdi = `${onaymi ? 'ONAY' : 'RED'}`
		let islemAdi = `${kisaIslemAdi} İşlemi`
		let styledIslemAdi = `${onaymi ? '<b class=forestgreen>ONAY</b>' : '<b class=orangered>RED</b>'} İşlemi`
		try {
			let { boundRecs: allRecs, selectedRecs: recs, gridWidget: w } = gridPart
			recs = recs.filter(rec => rec.onayNo && (dev || !rec.onayDurum))
			if (empty(recs)) {
				hConfirm('Cevaplanacak uygun belge bulunamadı', islemAdi)
				return
			}
			let aktarilmamisIrsaliyeSayi = recs.filter(_ => _.irsNox && !_.irsVarmi).length
			if (aktarilmamisIrsaliyeSayi) {
				let rdlg = await ehConfirm(
					(
						`<b class=firebrick>${aktarilmamisIrsaliyeSayi}</b> adet belgenin İrsaliye bağlantısı, Alım İrsaliye kısmında yok.<br/><br/>` +
						`Yine de devam edilsin mi?`
					), styledIslemAdi
				)
				if (!rdlg)
					return
			}
			
			/*let {
				onayci_onayNedenIstenir: onayNedenIstenir,
				onayci_redNedenIstenir: redNedenIstenir,
				onayci_nedenZorunludur: nedenZorunludur
			} = app.params.web ?? {}*/
			let { web = {} } = app.params
			let fl = fromEntries(
				['onayNedenIstenir', 'redNedenIstenir', 'nedenZorunludur']
					.map(k => [k, null])
			)
			let { tip2Param } = app
			let tipSet = asSet(recs.map(r => r.tip).filter(Boolean))
			for (let tip in tipSet) {
				let par = tip2Param[tip]
				if (empty(par))
					continue
				for (let k in fl)
					fl[k] ||= asBoolQ(par[k])
			}
			for (let k in fl)
				fl[k] ??= asBoolQ(web[`onayci_${k}`])
			
			let nedenIstenir = ( onaymi ? fl.onayNedenIstenir : fl.redNedenIstenir ) ?? !onaymi
			let nedenZorunludur = fl.nedenZorunludur ?? !onaymi
			
			let nedenText
			if (nedenIstenir) {
				nedenText = await jqxPrompt({
					etiket: `${styledIslemAdi} Nedeni giriniz`,
					// title: styledIslemAdi,
					duzenle: ({ fbd_value: fbd }) =>
						fbd.setMaxLength(40)
				})
				nedenText = nedenText?.trim()
				if (nedenText == null)
					return 
				if (nedenZorunludur && !nedenText) {
					hConfirm(`<b>${kisaIslemAdi} Nedeni</b> belirtilmelidir`, islemAdi)
					return
				}
			}
			else {
				let middleText = onaymi ? `<b class=forestgreen>ONAYLAMAK</b>` : `<b class=firebrick>REDDETMEK</b>`
				let rdlg = await ehConfirm(`<b class=royalblue>${recs.length}</b> adet kaydı ${middleText} istediğinize emin misiniz?`, styledIslemAdi)
				if (!rdlg)
					return
			}
			
			let key2OnayIdListe = {}
			for (let rec of recs) {
				let { _db, onayNo, onayId } = rec
				let key = [ _db, onayNo ].join(delimWS)
				;(key2OnayIdListe[key] ??= []).push(onayId)
			}
			
			let _now = now()
			let toplu = new MQToplu().withTrn()
			for (let [key, onayIdListe] of entries(key2OnayIdListe)) {
				let [ db, onayNo ] = key.split(delimWS)
				onayNo = asInteger(onayNo)
				toplu.add(
					new MQIliskiliUpdate({
						from: `${db}..webonay`,
						where: [
							{ inDizi: onayIdListe, saha: 'id' }
						],
						set: [
							{ degerAta: onaymi ? 'O' : 'R', saha: `w${onayNo}onaydurum` },
							{ degerAta: _now, saha: `w${onayNo}onayredts` },
							{ degerAta: nedenText, saha: `w${onayNo}onayredtext` }
						].filter(Boolean)
					})
				)
			}
			if (toplu?.bosDegilmi) {
				let topicSet = new Set()
				let { onayMax, onayNo: aktifOnayNo } = app
				if (!aktifOnayNo)
					app.onayNo = aktifOnayNo = max(1, ...boundRecs.map(r => r.onayNo || 0))
				
				let onayBilgiSet = new Set()
				if (onaymi && aktifOnayNo < onayMax) {
					recs
						.filter(r => r.sonraUser)
						.forEach(r =>
							onayBilgiSet.add(
								[r.sonraUser, r.onayNo || aktifOnayNo]
									.join(delimWS)
							)
						)
				}
				for (let _ of onayBilgiSet) {
					let [ user, onayNo ] = _.split(delimWS)
					onayNo = ( Number(onayNo) || aktifOnayNo ) + 1
					let onayNoStr = String(onayNo)
					
					let tempQS = { ...qs, onayNo }
					;{
						let { _: encVal } = tempQS
						if (encVal)
							extend(tempQS, JSON.parse(Base64.decode(encVal)))
						deleteKeys(tempQS, '#', '_',  'session', 'sessionID', 'user', 'pass')
						tempQS.loginTipi = Session.DefaultLoginTipi
						let { pass } = await Session.getSessionBasit({ user }) ?? {}
						if (pass) {
							if (pass.length != md5Length)
								pass = md5(pass)
							extend(tempQS, {  user, pass })
						}
					}
					
					let _qs = {}
					;['port', 'dev', 'newWindow', 'inNewWindow'].forEach(k => {
						if (k in tempQS) {
							_qs[k] = tempQS[k]
							delete tempQS[k]
						}
					})
					if (!empty(tempQS))
						_qs._ = Base64.encode($.param(tempQS))
					
					let { ntfyTopic: topic } = app
					let seqId
					;{
						let topicOnayNo = Number(topic.at(-1))
						if (topicOnayNo == aktifOnayNo)
							topic = topic.slice(0, -1)
						topic = topic.concat(onayNoStr)
						topicSet.add(topic.join('-'))
						
						let priority = 5
						let tags = ['hourglass', '_new', user, onayNoStr]
						let title = 'VIO Onay İşlemleri'
						let message = 'Onay bekleyen yeni belgeler var'
						let actions = []
						if (_qs) {
							let { origin, pathname: path } = location
							let url = `${origin}${path}?${$.param(_qs)}`
							actions.push({
								action: 'view',
								label: `Onay Portalını Aç (${onayNo})`,
								url
							})
						}

						seqId = newGUID()
						await ntfy({ topic, seqId, priority, tags, title, message, actions })
					}
				}
				
				try { await toplu.execute() }
				catch (ex) {
					if (seqId && !empty(topicSet)) {
						// clear nextUser notifications
						for (let topic of topicSet) {
							if (isArray(topic))
								topic = topic.join('-')
							let url = [app.ntfyWSUrl, topic, seqId].join('/')
							ajaxCall({ method: 'DELETE', url })    // no await - send & forget
						}
					}
					throw ex
				}
			}
			
			w?.clearselection()
			gridPart.tazele()

			;{
				let middleText = onaymi ? `<b class=forestgreen>ONAYLANDI</b>` : `<b class=orangered>REDDEDİLDİ</b>`
				window[onaymi ? 'eConfirm' : 'wConfirm']({
					content: `<b class=royalblue>${recs.length}</b> adet kayıt ${middleText}!`,
					title: islemAdi,
					autotimeout: 4_000
				})
			}
		}
		catch (ex) {
			hConfirm(getErrorText(ex), islemAdi)
			throw ex
		}
		//- IPTAL - -- onaykurali: { tip: GAF }, { tip: TS, OnayNo: 2 }	-- onayNo yoksa =1 demektir
	}
	static async izleIstendi({ sender: gridPart }) {
		let islemAdi = 'Belge İçerik Göster'
		try {
			let {selectedRecs: recs} = gridPart
			let xmlFileNames = recs
					.filter(_ => _.tip == 'GeciciAlimEFat' && _.uuid)
					.map(_ => `${_.uuid}.xml`)
			let eConf = await MQEConf.getInstance()
			// let divContainer = $(`<div/>`)[0]
			let eDocs = [], eDocCount = 0, aborted = false
			let pm = showProgress('Belge İçeriği hazırlanıyor...', islemAdi, true, () => aborted = true)
			pm.setProgressMax(xmlFileNames.length * 3)

			if (!window.XSLTProcessor) {
				showProgress('XSLT İşleyicisi modülü yükleniyor...')
				try { await loadLib_xslt() }
				catch (ex) { cerr(ex) }
				finally { hideProgress() }
			}
			
			let { tip2Yapi } = this
			let errors = []
			for (let rec of recs) {
				if (!rec)
					continue
				let { tip } = rec
				if (tip == 'GeciciAlimEFat') {
					let { uuid, eIslTip } = rec
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

					let xsltProcessor
					try { xsltProcessor = new XSLTProcessor() }
					catch (ex) { cerr(ex) }
					try {
						if (aborted)
							break
						let xmlData
						try { xmlData = await app.wsDownloadAsStream({ remoteFile, localFile: xmlDosyaAdi }) }
						catch (ex) { cerr(ex) }
						pm?.progressStep()
						if (!xmlData)
							throw { isError: true, rc: 'noXML', errorText: 'XML (e-İşlem Belge İçeriği) bilgisi belirlenemedi' }
						let xml = $.parseXML(xmlData)
						let docRefs = Array.from(xml.documentElement.querySelectorAll(`AdditionalDocumentReference`))
						let xsltData
						;{
							let xbinDocs, subName = 'EmbeddedDocumentBinaryObject'
							xbinDocs = docRefs.filter(elm =>
								elm.querySelector(subName) && (
									elm.querySelector(subName)?.getAttribute('filename')?.includes('.xslt') ||
									// elm.querySelector(subName)?.innerHTML?.toUpperCase() == 'XSLT' ||
									elm.querySelector('DocumentType')?.innerHTML?.toUpperCase() == 'XSLT' ||
									elm.querySelector('DocumentTypeCode')?.innerHTML?.toUpperCase() == 'XSLT' ||
									elm.querySelector('ID')?.innerHTML?.toUpperCase() == 'XSLT'
								)
							)
							if (empty(xbinDocs))
								xbinDocs = docRefs.filter(elm => elm.querySelector(subName))
							if (!empty(xbinDocs)) {
								xbinDocs = xbinDocs
									.map(x => x.querySelector(subName))
									.filter(x => x?.getAttribute('mimeCode')?.toLowerCase() == 'application/xml')
							}
							xsltData = (
								xbinDocs.find(elm =>
									elm.getAttribute('filename')?.toLowerCase()?.includes('.xslt')) ??
									xbinDocs?.at(-1)
							)?.textContent
						}
						if (!xsltData)
							throw { isError: true, rc: 'noXSLT', errorText: 'XSLT (e-İşlem Görüntü) bilgisi belirlenemedi' }
						if (Base64.isValid(xsltData))
							xsltData = Base64.decode(xsltData)
						if (aborted)
							break
						let eDoc, source = xsltProcessor
						try {
							let xslt = $.parseXML(xsltData)
							xsltProcessor?.importStylesheet(xslt)
							eDoc = xsltProcessor?.transformToFragment(xml, document)
						}
						catch (ex) { cerr(ex) }
						if (aborted)
							break
						if (!eDoc) {
							xsltProcessor = 'api'
							let xmlURL = remoteFile
							let html = await app.wsXSLTTransformAsStream({ data: { xmlURL, xsltData } })
							if (html)
								eDoc = $(html)
						}
						if (!eDoc)
							throw { isError: true, rc: 'xsltTransform', errorText: 'XSLT Görüntüsü oluşturulamadı', source }
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
				else {
					let { tip, sayac, fisNox, _text: headerHTML } = rec
					let { table, harTable: harTables } = tip2Yapi[tip]
					harTables = makeArray(harTables ?? [])
					// _table: table, _harTable: harTables
					if (isString(harTables))
						harTables = harTables ? harTables.split(delimWS) : null
					if (!(table && sayac) || empty(harTables))
						continue
					let uni = new MQUnionAll()
					if (harTables.length > 1)
						harTables = [harTables[0]]
					for (let harTable of harTables) {
						let sent = new MQSent(), {where: wh, sahalar} = sent
						sent
							.fisHareket(table, harTable)
							.har2StokBagla()
						wh
							.fisSilindiEkle()
							.degerAta(sayac, 'fis.kaysayac')
						sahalar.add(
							'har.kaysayac sayac', 'har.seq',
							'har.stokkod stokKod', 'stk.aciklama stokAdi',
							'SUM(har.miktar) miktar', 'stk.brm',
							'SUM(har.brutbedel) brutBedel', 'SUM(har.bedel) bedel'
						)
						sent.groupByOlustur()
						uni.add(sent)
					}
					let stm = new MQStm({ sent: uni, orderBy: ['seq'] })
					let _recs = await app.sqlExecSelect(stm)
					if (empty(_recs))
						continue

					let rfb = new RootFormBuilder()
						.addStyle_fullWH()
						.asWindow(`Belge İzle: [<span class=orangered>${fisNox}</span>]`)
					rfb.addButton('vazgec')
						.addStyle_wh(50, 40)
						.addCSS('absolute')
						.addStyle(`$elementCSS { top: 0; right: 10px; min-width: unset !important; z-index: 1005 !important }`)
						.onClick(({ builder: { rootPart } }) =>
							rootPart.close())
					rfb.addForm('header').setLayout(({ builder: { parent }}) =>
						$(`<div class="full-width" style="font-size: 110%; padding: 3px 10px; min-height: 60px; max-height: 90px; overflow-y: auto !important">` +
							headerHTML +
						`</div>`)
					)
					rfb.addGridliGosterici('grid')
						.addStyle_fullWH(null, 'calc(var(--full) - 90px)')
						.addCSS('dock-bottom')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, { rowsHeight: 50 })
						)
						.setTabloKolonlari([
							...this.getKAKolonlar(
								new GridKolon({ belirtec: 'stokKod', text: 'Ürün', genislikCh: 16, filterType: 'checkedlist' }),
								new GridKolon({ belirtec: 'stokAdi', text: 'Ürün Adı', genislikCh: 30, filterType: 'checkedlist' }),
							),
							new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 9, filterType: 'checkedlist' }).tipDecimal(),
							new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 4, filterType: 'checkedlist' }),
							new GridKolon({ belirtec: 'bedel', text: 'Net Bedel', genislikCh: 16 }).tipDecimal_bedel()
						])
						.setSource(_recs)
					rfb.run()
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
				hConfirm(errorText, islemAdi)
				console.error(errorText)
			}
			pm?.progressEnd()
			setTimeout(() => hideProgress(), 500)
		}
		catch (ex) {
			hideProgress()
			// hConfirm(getErrorText(ex), islemAdi)
			throw ex
		}
	}

	static getKey({ tip, onayNo } = {}) {
		return [tip, onayNo || 1].filter(_ => _).join('|')
	}
	static getHTML({ rec }) {
		let { dev } = config
		let { user2Adi } = app
		let { tarih, mustUnvan, fisNox, uuid, irsNox, irsVarmi, ekBilgi } = rec
		let { onceUser, onceText, sonraUser, onayNo } = rec
		uuid = uuid?.toLowerCase() ?? ''
		irsNox ??= ''; ekBilgi ??= ''
		return [
			`<div class="flex-row" style="gap: 0 10px">`,
				`<template class="sort-data">${dateToString(tarih)}|${fisNox}|${mustUnvan}</template>`,
				`<div class="ek-bilgi royalblue">${dateKisaString(asDate(tarih))}</div>`,
				`<div class="asil bold">${mustUnvan}</div>`,
				`<div class="ek-bilgi orangered bold float-right">${fisNox}</div>`,
				(dev ? `<div class="ek-bilgi gray">${uuid}</div>` : null),
				(irsNox ? `<div class="ek-bilgi">` +
					 `<span class="etiket bold">İrs: </span>`+
					 `<span class="veri bold ${irsVarmi ? 'bg-lightgreen' : 'ghostwhite bg-lightred'}"}>&nbsp;${irsNox}&nbsp;</span>` +
				 `</div>` : ''),
				`<div class="asil orangered">${ekBilgi}</div>`,
				( onceUser ?
					 `<div class="onceUser ek-bilgi">` +
						 `<span class="etiket lightgray">Önceki: </span>` +
						 `<span class="veri bold cadetblue">${user2Adi[onceUser] || onceUser}</span>` +
					 `</div>`
				 : null ),
				( onceText ?
					 `<div class="onceText ek-bilgi">` +
						 `<span class="etiket lightgray"> - </span>` +
						 `<span class="veri blue">${onceText}</span>` +
					 `</div>`
				 : null ),
				( sonraUser ?
					 `<div class="sonraUser ek-bilgi">` +
						 `<span class="etiket lightgray">Sonraki: </span>` +
						 `<span class="veri bold royalblue">${user2Adi[sonraUser] || sonraUser}</span>` +
					 `</div>`
				 : null ),
			`</div>`
		].filter(Boolean).join('\n')
	}
}
