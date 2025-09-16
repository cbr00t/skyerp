class Session extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static DefaultLoginTipi = 'login'; static get extraArgs() {
		return ['userDesc', 'pass', 'useSessionIDFlag', 'isSSO', 'hasSSO', 'eMails', '_isAdmin', 'yetki', 'dbName', 'subeKod', 'remoteIP', 'testId'] }
	get loginTipi() { return this._loginTipi || app?.defaultLoginTipi || this.class.DefaultLoginTipi } set loginTipi(value) { this._loginTipi = value }
	get isAdmin() { return this._isAdmin ?? this.yetki == 'admin' } set isAdmin(value) { this._isAdmin = value }
	get sefmi() { return this._sefmi ?? this.yetki == 'sef' } set sefmi(value) { this._sefmi = value }
	get hasSession() { return !!(this.sessionID || this.user || this.session) } get passMD5() { const {pass} = this; return !pass || pass.length == md5Length ? pass : md5(pass) }
	get userBilgiAsKodAdi() { const {user} = this; return user ? new CKodVeAdi({ kod: user, aciklama: this.userDesc }) : null }
	get rawDBName() { return this.dbName?.substr(4) }

	constructor(e) {
		e = e || {}; super(e); let loginTipi = e.loginTipi || e.sessionMatch || e.ozelTipKod;
		this.useSessionIDFlag = e.useSessionID ?? e.useSessionIDFlag; this.session = e.session;
		this._loginTipi = loginTipi; this.sessionID = e.sessionID || e.sessionId;
		this.user = e.user; this.pass = e.pass; this.userDesc = e.userDesc;
		this._isAdmin = e.isAdmin; this._sefmi = e.sefmi; this.isSSO = e.isSSO; this.hasSSO = e.hasSSO; this.eMails = e.eMails;
		this.yetki = e.yetki; this.dbName = e.dbName; this.subeKod = e.subeKod;
		this.remoteIP = e.remoteIP ?? e.ip;
		this.rol = e.rol ?? e.rolYapi ?? new RolYapi()
	}
	async afterLogin(e) {
		let {user} = this, {params} = app; if (user) {
			try {
				this.encUser = await app.xenc(user); await this.rolleriYukle(e);
				if (params) {
					await MQParam.topluYukleVerisiOlustur(e);
					for (let inst of Object.values(params)) { inst.topluYukle?.(e) }
				}
			}
			catch (ex) { console.error(ex) }
		}
	}
	async rolleriYukle(e) { this.rol = (await RolYapi.oku(e)) ?? { adimsal: {}, iceriksel: {} }; return this }
	userBilgiParantezliOzet(e) { const ka = this.userBilgiAsKodAdi; return ka ? ka.parantezliOzet(e) : null }
	userBilgiCizgiliOzet(e) { const ka = this.userBilgiAsKodAdi; return ka ? ka.parantezliOzet(e) : null }
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
