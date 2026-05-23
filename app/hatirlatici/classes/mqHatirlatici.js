class MQHatirlatici extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'HATIRLATICI' } static get sinifAdi() { return 'Hatırlatıcı' }
	static get table() { return 'hbelgehatirlatici' } static get tableAlias() { return 'htr' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get secimSinif() { return null } static get kolonFiltreKullanilirmi() { return false }
	static get gridIslemTuslariKullanilirmi() { return false }
	static get seviyeAcKapatKullanilirmi() { return !isMiniDevice() }
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
			{ id: 'gorevAl', text: 'Görev Al', handler: _e => this.gorevAlIstendi({ ..._e, ...e }) },
			{ id: 'gorevBirak', text: 'Görev Bırak', handler: _e => this.gorevBirakIstendi({ ..._e, ...e }) },
			{ id: 'tamam', handler: _e => this.tamamIstendi({ ..._e, ...e }) }
		]
		liste.push(...items)
		extend(sagSet, asSet(items.map(_ => _.id)))
	}
	static rootFormBuilderDuzenle_listeEkrani({ sender: gridPart, rootBuilder: rfb }) {
		super.rootFormBuilderDuzenle_listeEkrani(...arguments)
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
		liste.push('tipAdi')
	}
	static orjBaslikListesiDuzenle({ sender: gridPart, liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let mini = isMiniDevice()		
		let { tableAlias: alias } = this
		liste.push(...[
			new GridKolon({ belirtec: '_text', text: ' ', minWidth: 25 * katSayi_ch2Px }).noSql(),
			new GridKolon({ belirtec: 'tipAdi', text: 'Tip', genislikCh: 20, filterType: 'checkedlist', hidden: mini }).noSql()
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
			let { usersStr, eMailsStr } = r
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
	static loadServerData_queryDuzenle({ sender: gridPart, stm, sent } = {}) {
		super.loadServerData_queryDuzenle(...arguments)
		sent.sahalarVeGroupByVeHavingReset()
		
		let { tableAlias: alias } = this
		let { where: wh, sahalar } = sent, { orderBy } = stm
		sent.innerJoin(alias, 'htipbilgi hbil', ['htr.xtipkod = hbil.xtipkod', 'htr.kayittipi = hbil.kayittipi'])
		wh.add(`${alias}.bkapandi = 0`)
		sahalar
			.addWithAlias(alias, 'id',
				'kayittipi kayitTipi', 'xtipkod tipKod', 'xtipadi tipAdi',
				'kesinkullanicikod kesinUser', 'hatirlatmagunu hatirlatmaGunu',
				'sontarih sonTarih', 'kapanmatarihi kapanmaTarihi', 'kapanisnotu kapanisNotu')
			.addWithAlias('hbil',
				'kullanicilistestr usersStr', 'emaillistestr eMailsStr')
		orderBy.liste = ['sontarih', 'kayitTipi', 'tipAdi']
		
		/*
		    // DATEDIFF( DAY, htr.sontarih, hatirlatmagunu ) 
			SELECT
					htr : id, kayittipi, sontarih, xtipkod, xtipadi, hatirlatmagunu, kesinkullanicikod,
						sontarih, referans, kapanmatarihi, kapanisnotu
					hbil: kullanicilistestr (;), emaillistestr (;)
				FROM hbelgehatirlatici htr
				INNER JOIN htipbilgi hbil ON htr.xtipkod = hbil.xtipkod AND htr.kayittipi = hbil.kayittipi
				WHERE htr.bkapandi = 0

				if (kullanicilistestr)
					if (!split(';') => any({user}))
						continue


			[ görev al ]  ( kesinkullanicikod ? UYAR : devam )
			içerik: {sonTarih} bitişli '{xtipadi}, {referans}' görevi {userDesc} tarafından alınmıştır
				- UPDATE hbelgehatirlatici SET kesinkullanicikod = {user} WHERE id = {r.id}
				  ntfy: (kullanicilistestr [hariç: {user}])
				  email: emaillistestr
			
			[ görev bırak ]  ( kesinkullanicikod = {user} ? devam : UYAR )
			içerik: {sonTarih} bitişli '{xtipadi}, {referans}' görevini {userDesc} BIRAKMIŞTIR
				- UPDATE hbelgehatirlatici SET kesinkullanicikod = '' WHERE id = {r.id}
				  ntfy: (kullanicilistestr [hariç: {user}])
				  email: emaillistestr

			[ tamamlandı ]  ( kesinkullanicikod = {user} ? devam : UYAR )
				notText = jqxPrompt({ etiket: 'Kapanma Nedeni giriniz (opsiyonel)', title: 'Görev Tamamlanıyor' })
				içerik: {sonTarih} bitişli '{xtipadi}, {referans}' görevi {userDesc} tarafından {dateKisaString(today()))} tamamlanmıştır.
							{notText || ''}
					- UPDATE hbelgehatirlatici SET bkapandi = 1, kapanisnotu = notText, kapanmatarihi = getdate() WHERE id = {r.id}
					  email: emaillistestr

		*/
	}
	static gridVeriYuklendi(e = {}) {
		let mini = isMiniDevice()
		let { sender: gridPart } = e
		let { gridWidget: w, gridWidget: { groups } } = gridPart
		let { hepsiniGoster, prevRecs, boundRecs } = gridPart
		groups.forEach(g =>
			w.hidecolumn(g))
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

	static async gorevAlIstendi({ sender: gridPart = {} }) {
		let e = { ...arguments[0] }
		let islemAdi = 'Görev Al'
		let { dev } = config
		let { selectedRecs: recs } = gridPart
		if (!dev)
			recs = recs?.filter(r => !r?.kesinkullanicikod)
	
		if (empty(recs)) {
			hConfirm('Görev Atanacak uygun kayıt bulunamadı', islemAdi)
			return
		}

		let { user2Adi = {}, ntfyTopic: topic } = app
		let { user: buUser } = config.session
		let buUserText = user2Adi[buUser] || buUser
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
	
				let title = '✅ Görev Alındı'
				for (let u of users) {
					let priority = 4
					let tags = ['✅', 'gorev-alindi', '_new']
					let markdown = true
					ntfy({ topic, priority, tags, markdown, title, message })
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
				set.degerAta(buUser, 'kesinkullanicikod')
				let res = await upd.execute()
				if (res === false)
					return
			}
		
			/*içerik: {sonTarih} bitişli '{xtipadi}, {referans}' görevi {userDesc} tarafından alınmıştır
					- UPDATE hbelgehatirlatici SET kesinkullanicikod = {user} WHERE id = {r.id}
					  ntfy: (kullanicilistestr [hariç: {user}])
					  email: emaillistestr*/

		}
		catch (ex) {
			hideProgress()
			// hConfirm(getErrorText(ex), islemAdi)
			throw ex
		}
	}

	static getHTML({ rec }) {
		let { user2Adi } = app
		let { kayitTipi, tipAdi, sonTarih, referans, kapanmaTarihi, kapanisNotu, users } = rec
		let sonTarihNum = asDate(sonTarih)?.getTime() || 0
		let sonTarihStr = asDateAndToKisaString(sonTarih)
		let kapanmaTarihiStr = asDateAndToKisaString(kapanmaTarihi)
		let usersText = users
			?.map(u => user2Adi[u] || u)
			?.join(', ')
		
		return [
			`<div class="flex-row" style="gap: 0 10px">`,
				`<template class="sort-data">${[sonTarihNum, kayitTipi, tipAdi].filter(Boolean).join(delimWS)}</template>`,
				( sonTarihStr ? `<div class="lightgray">Son:</div> <div class="bold orangered">${sonTarihStr}</div>` : '' ),
				( referans ? `<div class="lightgray">Ref:</div> <div>${referans}</div>` : '' ),
				( kapanmaTarihiStr ? `<div class="lightgray">K:</div> <div class="firebrick">${kapanmaTarihiStr}</div>` : '' ),
				( usersText ? `<div class="lightgray"> - </div> <div class="royalblue">${usersText}</div>` : '' ),
			`</div>`
		].filter(Boolean).join('\n')
	}
}
