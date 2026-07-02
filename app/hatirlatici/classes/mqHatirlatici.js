class MQHatirlatici extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'HATIRLATICI' } static get sinifAdi() { return 'Hatırlatıcı' }
	static get table() { return 'hbelgehatirlatici' } static get tableAlias() { return 'htr' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get secimSinif() { return null } static get kolonFiltreKullanilirmi() { return false }
	static get gridIslemTuslariKullanilirmi() { return false }
	static get seviyeAcKapatKullanilirmi() { return false }
	//static get seviyeAcKapatKullanilirmi() { return !isMiniDevice() }
	static get noAutoFocus() { return true }

	static listeEkrani_init(e) {
		super.listeEkrani_init(e)
		let { sender: gridPart } = e
		let { dev } = config
		extend(gridPart, {
			otoTazeleSecs: qs.otoTazeleYok ? null : ( Number(qs.otoTazele ?? qs.otoTazeleSecs) || null ),
			otoTazeleDisabled: qs.otoTazeleYok ?? false,
			serviceProc_delaySecs: max(Number(qs.serviceProc_delaySecs) || 10, 2)
		})
		gridPart.noAnimate()
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
		if (!qs.tamEkranYok) {
			setTimeout(async () => {
				for (let i = 0; i < 5; i++) {
					if (document.fullscreen)
						break
					requestFullScreen()
					await delay(1_000)
				}
			}, 100)
		}
	}
	static listeEkrani_destroyPart(e = {}) {
		super.listeEkrani_destroyPart(e)
		this.unregisterNTFY(e)
		this.stopServiceProc(e)
	}
	static listeEkrani_activated({ sender: gridPart }) { super.listeEkrani_activated(...arguments) }
	static listeEkrani_deactivated({ sender: gridPart }) { super.listeEkrani_deactivated(...arguments) }
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e)
		let { liste, part: { ekSagButonIdSet: sagSet }}  = e
		let items = [
			{ id: 'assign', text: 'Grv Al', handler: _e => this.setTaskState({ ..._e, ...e, state: 'assign' }) },
			{ id: 'release', text: 'Grv Bırak', handler: _e => this.setTaskState({ ..._e, ...e, state: 'release' }) },
			{ id: 'finish', text: '🏁', handler: _e => this.setTaskState({ ..._e, ...e, state: 'done' }) }
		]
		liste.push(...items)
		extend(sagSet, asSet(items.map(_ => _.id)))
	}
	static rootFormBuilderDuzenle_listeEkrani({ sender: gridPart, rootBuilder: rfb }) {
		super.rootFormBuilderDuzenle_listeEkrani(...arguments)
		this.fbd_listeEkrani_addCheckBox(rfb, {
			id: 'hepsiniGoster', text: '+ Kapananlar',
			value: gridPart.hepsiniGoster,
			handler: ({ builder: { layout } }) => {
				let input = layout.children('input')
				gridPart.hepsiniGoster = input.is(':checked')
				gridPart.tazele()
			}
		 })

		rfb.addStyle(
			`/*$elementCSS > .header { height: 50px !important }*/
			 $elementCSS > .header > .islemTuslari > div > #finish { margin-right: 20px !important }`
		)
	}
	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		let mini = isMiniDevice()
		extend(args, {
			columnsMenu: !mini, columnsHeight: 25,
			groupsExpandedByDefault: true, showGroupsHeader: true,
			rowsHeight: mini ? 75 : 65
		})
	}
	static orjBaslikListesi_groupsDuzenle({ sender: gridPart, liste }) {
		super.orjBaslikListesi_groupsDuzenle(...arguments)
		let { hepsiniGoster } = gridPart
		if (hepsiniGoster)
			liste.push('_durumText')
	}
	static ekCSSDuzenle({ rowIndex, dataField: belirtec, value, rec, result: res }) {
		super.ekCSSDuzenle(...arguments)
		let { kalanGun: v } = rec
		if (belirtec == 'sonTarih' || belirtec == 'kalanGun') {
			res.push(
				'bold',
				(
					v < 0 ? 'bg-lightred lightgray' :
					v == 0 ? 'bg-orangered whitesmoke' :
					v <= 1 ? 'firebrick' :
					v <= 2 ? 'orangered' :
					v <= 4 ? 'darkgoldenrod' :
					'forestgreen'
				)
			)
		}
	}
	static orjBaslikListesiDuzenle({ sender: gridPart, liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let mini = isMiniDevice()		
		let { tableAlias: alias } = this
		liste.push(...[
			new GridKolon({ belirtec: '_text', text: ' ', minWidth: 30 * katSayi_ch2Px }).noSql(),
			new GridKolon({ belirtec: 'kalanGun', text: 'Kalan', genislikCh: 9 }).noSql().tipNumerik().checkedList(),
			new GridKolon({ belirtec: 'sonTarihText', text: 'Bitiş', genislikCh: 25 }).noSql().checkedList(),
			new GridKolon({ belirtec: '_durumText', text: 'Durum', genislikCh: 13, filterType: 'checkedlist', hidden: mini }).noSql()
		].filter(Boolean))
	}
	static async loadServerDataDogrudan({ sender: gridPart }) {
		gridPart.otoTazeleDisabled = true
		try { return await this._loadServerDataDogrudan(...arguments) }
		finally { gridPart.otoTazeleDisabled = false }
	}
	static async _loadServerDataDogrudan({ sender: gridPart }) {
		const Delim = ';'
		let e = arguments[0]
		let { user: buUser } = config.session
		let user2Adi = app.user2Adi ??= {}
		let recs = [], eksikUserSet = new Set()
		for (let r of await super.loadServerDataDogrudan(...arguments)) {
			let { usersStr, eMailsStr, kapandi, sonTarih } = r
			let users = r.users ??= (
				usersStr
					?.split(Delim)
					?.filter(Boolean)
					?? []
			)
			if (!users.find(u => u == buUser))
				continue

			;users
				.filter(u => !user2Adi[u])
				.forEach(u => eksikUserSet.add(u))

			r.eMails ??= (
				eMailsStr
					?.split(Delim)
					?.filter(v => v && v.length >= 4 && v.includes('@'))
					?? []
			)
			r._durumText = kapandi
				? `<span class="orangered">Kapananlar</span>`
				: `<span class="forestgreen">Bekleyenler</span>`
			
			sonTarih = r.sonTarih = asDate(sonTarih)
			r.kapanmaTarihi = asDate(r.kapanmaTarihi)
			r.kalanGun ??= (
				sonTarih
					? ( sonTarih - today() ) / Date_OneDayNum
					: null
			)
			r.sonTarihText = this.getHTML_sonTarih({ rec: r })
				
			recs.push(r)
		}

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
		
		return recs
	}
	static loadServerData_queryDuzenle({ sender: gridPart = {}, stm, sent } = {}) {
		super.loadServerData_queryDuzenle(...arguments)
		let { user } = config.session ?? {}
		let { hepsiniGoster } = gridPart
		let { tableAlias: alias } = this

		sent.sahalarVeGroupByVeHavingReset()
		let { where: wh, sahalar } = sent, { orderBy } = stm
		sent
			.leftJoin(alias, 'htipbilgi tbil', ['htr.kayittipi = tbil.kayittipi', 'htr.xtipkod = tbil.xtipkod'])
			.leftJoin('tbil', 'htipbilgi tanabil', ['htr.kayittipi = tanabil.kayittipi', `tanabil.xtipkod = ''`])
		sahalar.add(`${alias}.bkapandi kapandi`)
		if (!hepsiniGoster)
			wh.add(`${alias}.bkapandi = 0`)
		if (user) {
			wh.add(new MQOrClause()
				.degerAta('', `${alias}.kesinkullanicikod`)
				.degerAta(user, `${alias}.kesinkullanicikod`)
			)
		}
		wh.add(`DATEDIFF(DAY, CAST(GETDATE() AS DATE), CAST(htr.sontarih as DATE)) <= htr.hatirlatmagunu`)
		sahalar
			.addWithAlias(alias,
				'id', 'xid orjBelgeId', 'kayittipi kayitTipi', 'sontarih sonTarih', 'hatirlatmagunu hatirlatmaGunu',
				'kesinkullanicikod kesinUser', 'referans', 'xtipadi tipAdi',
				'kapanisnotu kapanisNotu', 'kapanmatarihi kapanmaTarihi',
				'yenilenmesuresi yenilenmeSuresi', 'suretipi sureTipi'
			 )
			.add(
				'dbo.emptycoalesce(tbil.kullanicilistestr, tanabil.kullanicilistestr) usersStr',
				'dbo.emptycoalesce(tbil.emaillistestr, tanabil.emaillistestr) eMailsStr'
			)
		orderBy.liste = ['kapandi', 'sonTarih DESC', 'kayitTipi', 'tipAdi']
	}
	static gridVeriYuklendi(e = {}) {
		let mini = isMiniDevice()
		let { sender: gridPart } = e
		let { gridWidget: w, gridWidget: { groups } } = gridPart
		let { hepsiniGoster, prevRecs, boundRecs } = gridPart
		groups.forEach(g =>
			w.hidecolumn(g))
		;['_durumText'].forEach(k =>
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
			let priority = 1, tags = ['_']
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
				let ind = tags?.indexOf('_') ?? -1
				if (ind > -1) {
					let count = asInteger(tags[ind + 1])
					gridPart?.tazele()
					if (msg != null) {
						let { sinifAdi: title } = this
						let body = msg == '.' ? '' : msg
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
		gridPart._timer_otoTazele = setTimeout(async e => {
			try { await this.otoTazele_timerProc(e) }
			finally { this.otoTazele_startTimer(...arguments) }
		}, otoTazeleSecs * 1_000, e)
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

	static async setTaskState({ sender: gridPart = {}, state }) {
		let e = { ...arguments[0] }
		let assign = state == 'assign'
		let release = state == 'release'
		let done = state == 'done'
	
		let islemAdi = `${
			assign ? 'Görev Ata' :
			release ? 'Görev Bırak' :
			done ? 'Görev Tamamlandı' :
			state
		} işlemi`
		let { selectedRecs: recs } = gridPart
		let orjRecs = recs
		let { user2Adi = {}, ntfyTopic: topic, frpPort } = app
		let { dev, ws, session } = config
		let { DefaultWSHostName_SkyServer: cloudHost, DefaultSSLWSPort: defPort } = config.class
		let { url: wsURL, ssl, hostname: host, port } = ws
		let { loginTipi, user: buUser, pass: buPass } = session
		let buUserText = user2Adi[buUser] || buUser
		// let { location: loc } = window

		let kayitTipSet = asSet(recs.map(r => r.kayitTipi))
		if (len(kayitTipSet) > 1) {
			hConfirm(`<b class="red">Farklı Tipler</b> için <b class="royalblue">${islemAdi}</b> işlemi yapılamaz`, islemAdi)
			return false
		}
		
		if (!dev) {
			if (!empty(recs)) {
				let id2Rec = fromEntries(recs.map(r => [r.id, r]))
				let newRecs = await this.loadServerData(e)
				recs = newRecs.filter(r => id2Rec[r.id])
			}
			
			let kosul = (
				assign ? ( r => ( !r?.kapandi && r?.kesinUser != buUser ) ) :
				release ? ( r => ( !r?.kapandi && r?.kesinUser == buUser ) ) :
				done ? ( r => ( !r?.kapandi ) ) :
				null
			)
			recs = recs?.filter(kosul)
			if (empty(recs))
				orjRecs = orjRecs?.filter(kosul)
		}
	
		if (empty(recs)) {
			let degistimi = recs.length != orjRecs.length
			gridPart?.tazele(e)
			let errorText = [
				`${islemAdi} için uygun kayıt bulunamadı`,
				( degistimi ? `<b class="red">**</b> <span class="orangered">Seçilen kayıtlar başka bir kullanıcı tarafından işlem görmüş gibi gözüküyor</span>` : null )
			].filter(Boolean).map(_ => `<li>${_}</li>`).join('\n')
			hConfirm(`<ul>${errorText}</ul>`, islemAdi)
			return false
		}

		let { kayitTipi, sureTipi, yenilenmeSuresi } = recs[0]
		let inst = {}
		let yenilenirmi = false
		let kapanisNotu = ''
		if (done) {
			try {
				let min_v = today().yarin()
				yenilenirmi = !kayitTipi || kayitTipi == 'ARC'
				if (yenilenirmi) {
					if (recs.length > 1) {
						hConfirm(`Seçilen tipler için <b class="red">Birden fazla satıra</b> ait <b class="royalblue">${islemAdi}</b> işlemi yapılamaz`, islemAdi)
						return false
					}
					
					let sel = (
						sureTipi == 'G' ? 'addDays' :
						sureTipi == 'A' ? 'addMonths' :
						'addYears'
					)
					let dt = today()[sel](yenilenmeSuresi)
					if (dt < min_v)
						dt = min_v
					inst.yeniTarih = dt
				}
				
				let title = islemAdi
				let etiket = [
					( 
						yenilenirmi
							? `<p class="fs-90 orangered left pl-20">Asıl belgenin <b class="forestgreen">Yeni Bitişi</b> ayarlanacaktır:</p>`
							: `<p>Kapanış yapılacak</p>`
					)
				].filter(Boolean)
					.join('\n')

				let fbd_yeniTarih
				let duzenle = ({ args, wnd, rfb, fbd_value }) => {
					if (yenilenirmi) {
						fbd_yeniTarih = rfb.addDateInput('yeniTarih', 'Yenileme Tarihi')
							.etiketGosterim_placeHolder()
							.degisince(({ value: v, builder: fbd }) => {
								let { id } = fbd
								if (isInvalidDate(v) || v < min_v)
									v = fbd.value = inst[id] = min_v
							})
							//.onAfterRun(({ builder: { input } }) =>
							//	delay(100).then(() => input.focus()))
							.addCSS('absolute')
							.addStyle(
								`$elementCSS { left: 310px; top: -35px; z-index: 1000 !important }
								 $elementCSS > input { width: 150px !important; height: 40px !important; box-shadow: 0 0 3px 2px forestgreen }`
							)
					}
				}
				let validate = ({ fbd_value: { input }, inst: { yeniTarih: v }}) => {
					if (isInvalidDate(v) || v < min_v) {
						hConfirm(`<b class="royalblue">Bitiş Tarihi</b> dolu ve bugünden büyük bir değer olmalıdır`, islemAdi)
						delay(200).then(() =>
							fbd_yeniTarih?.input?.focus())
						return false
					}
				}
				
				kapanisNotu = await jqxPrompt({
					title, etiket, inst,
					duzenle, validate,
					placeHolder: 'Kapanış notu (opsiyonel)',
					maxLength: 250
				})
				if (kapanisNotu == null)    // VAZGEÇ butonu
					return false
			}
			catch (ex) { return false }
		}

		let yeniTarih = asDate(inst.yeniTarih)
		let idListe = recs.map(r => r.id)
		// let _now = now()
		let sqlNow = 'GETDATE()'
		let sqlToday = `CAST(${sqlNow} AS DATE)`
		try {
			if (empty(idListe))
				return false

			// db update
			;{
				let { table } = this
				let toplu = new MQToplu().withTrn()
				;{
					let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
					upd.fromAdd(table)
					wh.inDizi(idListe, 'id')
					if (done) {
						set.add('bkapandi = 1', `kapanmatarihi = ${sqlNow}`)
						if (kapanisNotu)
							set.degerAta(kapanisNotu, 'kapanisnotu')
						if (yenilenirmi)
							set.degerAta(yeniTarih, 'sontarih')
					}
					else if (assign || release)
						set.degerAta(assign ? buUser : '', 'kesinkullanicikod')
					toplu.add(upd)
				}
				
				if (yenilenirmi) {
					let r = recs[0]                      // bu durumda sadece tek kayıt gelecek
					let { orjBelgeId, sonTarih } = r
					let ortakWh = { degerAta: orjBelgeId, saha: 'id' }
					switch (kayitTipi) {
						case '': {      // diger belgeler
							let table = 'hbelge'
							toplu.add(
								new MQIliskiliUpdate({
									table,
									where: ortakWh,
									set: [
										{ degerAta: yeniTarih, saha: 'bitistarihi' },
										`tarih = ${sqlToday}`,
										`sonyenilenmezamani = ${sqlNow}`
									]
								})
							)
							break
						}
						case 'ARC': {    // araç muayene
							let table = 'aracmuayene'
							toplu.add(
								new MQSelect2Insert({
									table,
									sahalar: [
										'arackod', 'evrakkod', 'sonmuayene',
										'id', 'tarih',
										'bittarih'
									],
									sent: new MQSent({
										table: `${table} mua`,
										where: [
											{ degerAta: orjBelgeId, saha: 'mua.id' },
											`kont.id IS NULL`
										],
										sahalar: [
											'mua.arackod', 'mua.evrakkod', bool2FileStr(true).sqlServerDegeri(),
											'NEWID()', sqlToday,
											`( CAST(${sqlToday} AS DATETIME) + ${(yeniTarih - sonTarih) / Date_OneDayNum} )`
										]
									}).leftJoin('mua', `${table} kont`, [
										`mua.arackod = kont.arackod`,
										`mua.evrakkod = kont.evrakkod`,
										`mua.tarih = kont.tarih`
									])
								}),
								new MQIliskiliUpdate({
									table,
									where: ortakWh,
									set: [`sonmuayene = ''`]
								})
							)
							break
						}
					}
				}

				if (empty(toplu.liste))
					return false

				let res = await toplu.execute()
				if (res === false)
					return false
			}

			for (let r of recs) {
				let { id, users, kesinUser, eMails, tipAdi, sonTarih, referans } = r
				;{
					let targetUsers = kesinUser ? [kesinUser] : users
					let sonTarihText = asDateAndToKisaString(sonTarih)
					let indicator = (
						assign ? '⌛' :
						release ? '❌' :
						done ? '✅' : null
					)
					let statusText = (
						assign ? 'Alındı' :
						release ? 'Bırakıldı' :
							done ? 'TAMAMLANDI' : null
					)
					let title = [indicator, 'Görev', statusText].filter(Boolean).join(' ')
					let message = [
						( sonTarihText ? `- **${sonTarihText}** bitişli` : null ),
						( tipAdi || referans ? `**${[tipAdi, referans].filter(Boolean).join(', ')}**` : null ),
						'görevi\n',
						`- **${buUserText}** tarafından alınmıştır`,
						'\n\n_'
					].filter(Boolean).join(' ')
	
					// ntfy
					{
						let priority = (
							assign ? 4 :
							3
						)
						let shortStatus = (
							assign ? 'alindi' :
							release ? 'birakildi':
							done ? 'tamamlandi' : null
						)
						if (shortStatus)
							shortStatus = `gorev-${shortStatus}`

						let topicPFList = [...targetUsers, 'all']
						for (let u of topicPFList) {
							let url = `${location.origin}${location.pathname}?`
							;{
								let pass = u == buUser ? buPass : null
								if (pass == null) {
									let { pass: _ } = await Session.getSessionBasit({ user: u })
									pass = _
								}
								
								let q = { ...qs }
								deleteKeys(q, 'url', 'wsURL', 'ssl', 'hostname', 'port', 'loginTipi', 'user', 'pass')
								if (wsURL || port || frpPort) {
									if (wsURL)
										q.url = wsURL
									else {
										q.ssl = ssl ?? true
										q.hostname = host ?? defHost
										q.port = port || frpPort
									}
								}
								q.loginTipi = loginTipi || 'login'
								q.user = u
								if (pass)
									q.pass = pass

								if (!empty(q))
									url += `_=${Base64.encode($.param(q), true)}`
							}
							
							let t = topic
							;{
								if (isString(t))
									t = t.split('-')
								t = t.map(v => v == buUser ? u : v)
							}
							
							;{
								let tags = [indicator, shortStatus, '_']
								let markdown = true
								let click = new URL(t.join('-'), app.ntfyWSUrl).toString()
								let actions = [
									{
										action: 'view', url,
										label: 'HATIRLATICILARI GÖSTER'
									}
								]
								ntfy({ topic: t, priority, tags, markdown, title, message, click, actions })
							}
							
							await delay(50)
						}
					}
					
					// email
					if (!empty(eMails)) {
						let to = eMails[0]
						let cc = eMails.slice(1).join(delimWS)
						let subject = `Sky Hatırlatıcı: ${title}`
						let body = message
						app.wsEMailQueue_add({ to, cc, subject, body })
					}
				}
			}

			gridPart?.tazele()
		}
		catch (ex) {
			hideProgress()
			// hConfirm(getErrorText(ex), islemAdi)
			throw ex
		}
		
		return true
	}

	static getHTML({ rec }) {
		let { user2Adi } = app
		let { session: { user: buUser } } = config
		let { kayitTipi, tipAdi, referans, kapandi, kapanisNotu, users, kesinUser } = rec

		let tipAdiText = tipAdi ? `<span class="violet">${tipAdi}</span>` : null
		let tipRefStr = [tipAdiText, referans].filter(Boolean).join(' - ')
		let usersText = kesinUser
			? ''
			: users
				?.filter(u => u != buUser)
				?.map(u => `+${user2Adi[u] || u}`)
				?.join(', ')
		
		return [
			`<div class="flex-row full-width" style="gap: 0 10px">`,
				`<template class="sort-data">${[kayitTipi, tipRefStr].filter(Boolean).join(delimWS)}</template>`,
				( kayitTipi ? `<div class="fs-85 bold royalblue">[${kayitTipi}]</div>` : null ),
				( tipRefStr ? `<div>${tipRefStr}</div>` : null ),
				( usersText ? `<div class="lightgray"> - </div> <div class="royalblue">${usersText}</div>` : null ),
				( kesinUser ? `<div>📌</div>` : null ),
			`</div>`
		].filter(Boolean).join('\n')
	}
	static getHTML_sonTarih({ rec }) {
		let { sonTarih, kapanmaTarihi, kapanisNotu } = rec
		let items = sonTarih || kapanmaTarihi
			? [
				`<div class=flex-row full-width" style="gap: 0 10px">`,
					( sonTarih ? `
						<div class="orangered">
							<span class="gray">Son:</span>
							<b>${asDateAndToKisaString(sonTarih)}</b>
						</div>` : null ),
					( kapanmaTarihi ? `
						<div class="firebrick">
							<span class="lightgray"> | </span>
							<span class="gray">Kap:</span>
							<b>${asDateAndToKisaString(kapanmaTarihi)}</b>
						</div>`
					: null ),
				`</div>`,
				( kapanmaTarihi && kapanisNotu ? `<div class="royalblue"><b>${kapanisNotu}</b></div>` : null ),
				].filter(Boolean)
			: []
		return [
			`<div class="full-width" style="gap: 0 10px">`,
				`<template class="sort-data">${items.join(delimWS)}</template>`,
				...items,
			`</div>`
		].filter(Boolean).join('\n')
	}
}
