class Session extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static DefaultLoginTipi = 'login'; static get extraArgs() {
		return ['userDesc', 'pass', 'useSessionIDFlag', 'isSSO', 'hasSSO', 'eMails', '_isAdmin', 'yetki', 'dbName', 'subeKod', 'remoteIP', 'testId'] }
	get loginTipi() { return this._loginTipi || app?.defaultLoginTipi || this.class.DefaultLoginTipi }
	set loginTipi(value) { this._loginTipi = value }
	get isAdmin() { return this._isAdmin ?? (this.yetki == 'admin' || this.yetki == 'developer') }
	set isAdmin(value) { this._isAdmin = value }
	get sefmi() { return this._sefmi ?? this.yetki == 'sef' }
	set sefmi(value) { this._sefmi = value }
	get hasSession() { return !!(this.sessionID || this.user || this.session) }
	get passMD5() { let {pass} = this; return !pass || pass.length == md5Length ? pass : md5(pass) }
	get userBilgiAsKodAdi() { let {user} = this; return user ? new CKodVeAdi({ kod: user, aciklama: this.userDesc }) : null }
	get rawDBName() { return this.dbName?.substr(4) }

	constructor(e = {}) {
		 super(e)
		let loginTipi = e.loginTipi || e.sessionMatch || e.ozelTipKod
		this.useSessionIDFlag = e.useSessionID ?? e.useSessionIDFlag; this.session = e.session
		this._loginTipi = loginTipi; this.sessionID = e.sessionID || e.sessionId
		this.user = e.user; this.pass = e.pass; this.userDesc = e.userDesc
		this._isAdmin = e.isAdmin; this._sefmi = e.sefmi; this.isSSO = e.isSSO; this.hasSSO = e.hasSSO; this.eMails = e.eMails
		this.yetki = e.yetki; this.dbName = e.dbName; this.subeKod = e.subeKod
		this.remoteIP = e.remoteIP ?? e.ip
		this.rol = e.rol ?? e.rolYapi ?? new RolYapi()
		this.dbKisit = e.dbKisit ?? {}
		this.yetkiVarmi = e.yetkiVarmi
	}
	async afterLogin(e) {
		let {user} = this, {params} = app
		if (user) {
			try {
				this.encUser = await app.xenc(user)
				await Promise.allSettled([
					await this.rolleriYukle(e),
					await this.dbKisitYukle(e)
				])
				if (params) {
					let proc = async e => {
						let lastError, {promise_param: promise, _paramYuklendi: paramYuklendi} = app
						if (paramYuklendi)
							return
						try { await promise }
						catch (ex) { lastError = ex }
						if (!promise || lastError)
							await MQParam.topluYukleVerisiOlustur()
						{
							try { await app.paramsDuzenle({ params }) }
							catch (ex) { console.error(ex); debugger }
							try { await app.paramsDuzenleSonrasi({ params }) }
							catch (ex) { console.error(ex); debugger }
							paramYuklendi = app._paramYuklendi = true
						}
						/*for (let [kod, rec] of entries(kod2Rec)) {
							let param = params[kod]
							if (param)
								await inst.topluYukle?.({ rec })
						}*/
					}
					if (app.offlineMode === false)
						setTimeout(proc, 500, e)
					else
						await proc(e)
				}
			}
			catch (ex) { console.error(ex) }
		}
	}
	async rolleriYukle(e) {
		this.rol = (await RolYapi.oku(e)) ?? new RolYapi({ adimsal: {}, iceriksel: {} })
		return this
	}
	async dbKisitYukle(e) {
		let {isAdmin} = this
		let dbKisit = { prog: {}, db: {}, yil: null }
		$.extend(this, { yetkiVarmi: false, dbKisit })
		if (isAdmin) {
			this.yetkiVarmi = true
			return this
		}
		let {user, encUser, dbName} = this
		if (!encUser)
			return this

		let uni = new MQUnionAll()
		{
			let sent = new MQSent(), {where: wh, sahalar} = sent
			sent.fromAdd('ORTAK..xvtkisit2 k')
			wh.degerAta(encUser, 'k.xkod')
			sahalar.add(`'prog' tip`, '0 enc', 'xprogram value')
			uni.add(sent)
		}
		{
			let sent = new MQSent(), {where: wh, sahalar} = sent
			sent.fromAdd('ORTAK..xvtkisit k')
			wh.degerAta(encUser, 'k.xkod')
			sahalar.add(`'db' tip`, '1 enc', 'xtable value')
			uni.add(sent)
		}
		{
			let sent = new MQSent(), {where: wh, sahalar} = sent
			sent.fromAdd('ORTAK..xuser k')
			wh.degerAta(encUser, 'k.xkod')
			sahalar.add(`'yil' tip`, '0 enc', 'CAST(kisityil AS VARCHAR(2)) value')
			uni.add(sent)
		}
		let stm = new MQStm({ sent: uni })
		let recs = await app.sqlExecSelect(stm)
		let decValues = await app.xdec([
			' ',
			...recs
					.filter(({ enc, value: v }) => enc && v && isString(v))
					.map(_ => _.value)
		])
		for (let {tip: t, value: v, enc} of recs) {
			if (enc)
				v = decValues[v] ?? v
			if (t == 'yil')
				dbKisit[t] = asInteger(v)
			else {
				let set = dbKisit[t] ??= {}
				set[v] = true
			}
		}
		let {vioProgBelirtec} = app
		let {yil: kisitYil} = dbKisit, dbYil = asInteger(dbName.substr(2, 2))
		{
			if (kisitYil && kisitYil < 0)
				kisitYil = 100 - kisitYil
			if (dbYil && dbYil < 0)
				dbYil = 100 - dbYil
		}
		this.yetkiVarmi = !(
			(kisitYil && dbYil && dbYil < kisitYil) ||
			dbKisit.db?.[dbName] || 
			(vioProgBelirtec ? dbKisit.prog?.[vioProgBelirtec] : false)
			/*(vioProgBelirtec
				 ? dbKisit.prog?.[vioProgBelirtec]
				 : !empty(keys(dbKisit.prog).filter(_ => _ != 'VioPer'))
			)*/
		)
		return this
	}
	userBilgiParantezliOzet(e) { let ka = this.userBilgiAsKodAdi; return ka ? ka.parantezliOzet(e) : null }
	userBilgiCizgiliOzet(e) { let ka = this.userBilgiAsKodAdi; return ka ? ka.parantezliOzet(e) : null }
	buildAjaxArgs(e) {
		e ??= {}; let {args} = e; if (!args) { return }
		let {hasSession} = this; if (hasSession) {
			let {useSessionIDFlag, isSSO, loginTipi, session, user, pass} = this;
			if (!(useSessionIDFlag || isSSO) && (user || session)) {
				if (session) { args.session = session }
				else {
					args.loginTipi ||= loginTipi || Session.DefaultLoginTipi;
					args.user = user;
					if (pass) { args.pass = pass }
				}
			}
			else {
				let {sessionID} = this;
				if (sessionID) { args.sessionID = sessionID }
			}
		}
	}
	useSessionID() { this.useSessionIDFlag = true; return this }
	useUser() { this.useSessionIDFlag = false; return this } sso() { this.isSSO = true; return this }
}
