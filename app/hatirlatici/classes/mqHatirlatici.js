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
		let {liste, part: { ekSagButonIdSet: sagSet }} = e
		let items = [
			{ id: 'assign', text: 'Görev Al', handler: _e => this.setTaskState({ ..._e, ...e, state: 'assign' }) },
			{ id: 'release', text: 'Görev Bırak', handler: _e => this.setTaskState({ ..._e, ...e, state: 'release' }) },
			{ id: 'tamam', handler: _e => this.setTaskState({ ..._e, ...e, state: 'done' }) }
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
			 $elementCSS > .header > .islemTuslari > div > #tamam { margin-right: 20px !important }`
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
			new GridKolon({ belirtec: '_text', text: ' ', minWidth: 25 * katSayi_ch2Px }).noSql(),
			new GridKolon({ belirtec: 'kalanGun', text: 'Kalan', genislikCh: 9 }).noSql().tipNumerik().checkedList(),
			new GridKolon({ belirtec: 'sonTarih', text: 'Bitiş', genislikCh: 11 }).noSql().tipTarih().checkedList(),
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

			r.eMails ??= (
				eMailsStr
					?.split(Delim)
					?.filter(v => v && v.length >= 4 && v.includes('@'))
					?? []
			)
			r._durumText = kapandi
				? `<span class="orangered">Kapananlar</span>`
				: `<span class="forestgreen">Bekleyenler</span>`
			
			sonTarih = asDate(sonTarih)
			r.kalanGun ??= (
				sonTarih
					? ( sonTarih - today() ) / Date_OneDayNum
					: null
			)
			;users
				.filter(u => !user2Adi[u])
				.forEach(u => eksikUserSet.add(u))

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
		sent.sahalarVeGroupByVeHavingReset()

		let { hepsiniGoster } = gridPart
		let { tableAlias: alias } = this
		let { where: wh, sahalar } = sent, { orderBy } = stm
		sent
			.leftJoin(alias, 'htipbilgi tbil', ['htr.kayittipi = tbil.kayittipi', 'htr.xtipkod = tbil.xtipkod'])
			.leftJoin('tbil', 'htipbilgi tanabil', ['htr.kayittipi = tanabil.kayittipi', `htr.xtipkod = ''`])
		if (hepsiniGoster)
			sahalar.add(`${alias}.bkapandi kapandi`)
		else
			wh.add(`${alias}.bkapandi = 0`)
		wh.add(`DATEDIFF(DAY, getdate(), CAST(htr.sontarih as DATE)) <= htr.hatirlatmagunu`)
		sahalar
			.addWithAlias(alias,
				'id', 'kayittipi kayitTipi', 'sontarih sonTarih', 'hatirlatmagunu hatirlatmaGunu',
				'kesinkullanicikod kesinUser', 'kapanisnotu kapanisNotu', 'referans', 'xtipadi tipAdi',
				'kapanmatarihi kapanmaTarihi')
			.add(
				'COALESCE(tbil.kullanicilistestr, tanabil.kullanicilistestr) usersStr',
				'COALESCE(tbil.emaillistestr, tanabil.emaillistestr) eMailsStr'
			)
		orderBy.liste = ['sonTarih', 'kayitTipi', 'tipAdi']
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

		let islemAdi = (
			assign ? 'Görev Ata' :
			release ? 'Görev Bırak' :
			done ? 'Görev Tamamlandı' :
			state
		)
		let { dev } = config
		let { selectedRecs: recs } = gridPart
		let { user2Adi = {}, ntfyTopic: topic } = app
		let { class: { DefaultWSHostName_SkyServer: cloudHost }, session: { user: buUser } } = config
		let buUserText = user2Adi[buUser] || buUser
		// let { location: loc } = window
		if (!dev) {
			let kosul = (
				assign ? ( r => ( !r?.kapandi && r?.kesinUser != buUser ) ) :
				release ? ( r => ( !r?.kapandi && r?.kesinUser == buUser ) ) :
				done ? ( r => ( !r?.kapandi ) ) :
				null
			)
			recs = recs?.filter(kosul)
		}
	
		if (empty(recs)) {
			hConfirm(`${islemAdi} için uygun kayıt bulunamadı`, islemAdi)
			return false
		}

		let kapanisNotu = ''
		if (done) {
			kapanisNotu = await jqxPrompt({
				title: islemAdi,
				etiket: 'Kapanış notu <span class="lightgray" style="margin-left: 5px">(opsiyonel)</span>',
				maxLength: 250
			})
			if (kapanisNotu == null)    // VAZGEÇ butonu
				return false
		}
		
		let idListe = []
		try {
			for (let r of recs) {
				let { id, users, eMails, tipAdi, sonTarih, referans } = r
				idListe.push(id)
				
				let sonTarihText = asDateAndToKisaString(sonTarih)
				let message = [
					( sonTarihText ? `- **${sonTarihText}** bitişli` : null ),
					( tipAdi || referans ? `**${[tipAdi, referans].filter(Boolean).join(', ')}**` : null ),
					'görevi\n',
					`- **${buUserText}** tarafından alınmıştır`,
					'\n\n_'
				].filter(Boolean).join(' ')

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
				
				let title = [indicator, 'Görev', statusText].filter(Boolean).join(' ')
				for (let u of users) {
					let tags = [indicator, shortStatus, '_']
					let markdown = true
					let click = new URL(topic.join('-'), app.ntfyWSUrl).toString()
					let actions = [
						{
							action: 'view',
							label: 'BİLDİRİMLERİ GÖSTER',
							url: location.href
						}
					]
					ntfy({ topic, priority, tags, markdown, title, message, click, actions })
				}
				if (!empty(eMails)) {
					let to = eMails[0]
					let cc = eMails.slice(1).join(delimWS)
					let subject = `Sky Hatırlatıcı: ${title}`
					let body = message
					app.wsEMailQueue_add({ to, cc, subject, body })
				}
			}
			if (!empty(idListe)) {
				let upd = new MQIliskiliUpdate(), { where: wh, set } = upd
				upd.fromAdd(this.table)
				wh.inDizi(idListe, 'id')
				if (done) {
					set.add('bkapandi = 1')
					if (kapanisNotu)
						set.degerAta(kapanisNotu, 'kapanisnotu')
				}
				else if (assign || release)
					set.degerAta(assign ? buUser : '', 'kesinkullanicikod')
				
				let res = await upd.execute()
				if (res === false)
					return false

				gridPart?.tazele()
			}
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
		let { kayitTipi, tipAdi, referans, kapanmaTarihi, kapanisNotu, users, kesinUser } = rec

		let tipAdiText = tipAdi ? `<span class="violet">${tipAdi}</span>` : null
		let tipRefStr = [tipAdiText, referans].filter(Boolean).join(' - ')
		let kapanmaTarihiStr = kapanmaTarihi
			? [asDateAndToKisaString(kapanmaTarihi), kapanisNotu].filter(Boolean).join(' - ')
			: ''
		let usersText = kesinUser
			? ''
			: users
				?.filter(u => u != buUser)
				?.map(u => `+${user2Adi[u] || u}`)
				?.join(', ')
		
		return [
			`<div class="flex-row" style="gap: 0 10px">`,
				`<template class="sort-data">${[kayitTipi, tipAdi].filter(Boolean).join(delimWS)}</template>`,
				( tipRefStr ? `<div class="lightgray">Ref:</div> <div>${tipRefStr}</div>` : '' ),
				( kapanmaTarihiStr ? `<div class="lightgray">K:</div> <div class="firebrick">${kapanmaTarihiStr}</div>` : '' ),
				( usersText ? `<div class="lightgray"> - </div> <div class="royalblue">${usersText}</div>` : '' ),
				( kesinUser ? `<div>📌</div>` : '' ),
			`</div>`
		].filter(Boolean).join('\n')
	}
}
