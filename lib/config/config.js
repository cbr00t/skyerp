class Config extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static DefaultWSPort = 8200; static DefaultSSLWSPort = 9200; static SSLPortShift = 1000; static DefaultSSLFlag = undefined
	static DefaultWSHostName = undefined; static DefaultProxyServerURL = undefined; static DefaultWSHostName_SkyServer = 'cloud.vioyazilim.com.tr'
	get hasSession() { return !!this.session?.hasSession }
	get wsURLBase() { return this.getWSUrlBase() }
	constructor(e = {}) {
		super(e)
		this.dev = e.dev ?? e.programci ?? qs.dev ?? qs.programci
		this.test = e.test ?? qs.test;
		this.beta = e.beta ?? qs.beta
		/* this.noHeader = asBool(e.noHeader ?? qs.noHeader ?? qs.basliksiz ?? qs.headless ?? ($(window).width() <= 900 || $(window).height() <= 700)); */
		this.noHeader = (qs.headless ?? qs.noHeader) ?? (qs.header ? false : $(window).width() < 850)
		this.kiosk = qs.kiosk ?? false
		this.offlineMode = qs.online ? false : qs.offline ? true : undefined;
		this.colorScheme = qs.dark ? 'dark' : qs.syscolor ? 'system' : '';
		this.firmaDBBelirtec = (
			qs.firmaDBBelirtec ?? qs.firmaBelirtec ??
			e.firmaDBBelirtec ?? e.firmaBelirtec
		)
		
		let _port = e.port || qs.port
		let ws = this.ws = inverseCoalesce(e.ws, value => JSON.parse(value)) || {
			hostName: (
				e.hostName || e.hostname ||
				qs.hostName || qs.hostname ||
				this.class.DefaultWSHostName
			),
			port: _port ? asInteger(_port) : undefined,
			url: e.url || e.wsURL || qs.wsURL || undefined, ssl: asBoolQ(e.ssl ?? qs.ssl),
			proxyServerURL: (
				e.proxyServerURL || e.wsProxyServerURL || qs.proxyServerURL ||
				qs.proxyServerUrl || qs.proxyServer || qs.proxy || this.class.DefaultProxyServerURL ||
				undefined
			)
		}
		let { proxyServerURL } = this
		if (proxyServerURL?.endsWith('/'))
			proxyServerURL = ws.proxyServerURL = proxyServerURL.slice(0, -1)
	}
	getWSUrlBase(e) {
		e ??= {}
		let ws = e.ws ?? this.ws ?? {}
		let _url = e.url || ws.url
		if (_url)
			return _url
		let ssl = e.ssl ?? ws.ssl ?? this.ssl
		let hostName = (
			e.hostName || e.hostname |
			e.wsHostName || ws.hostName || ws.hostname ||
			'localhost'
		)
		let port = e.port || e.wsPort || ws.port
		return (
			`http${ssl ? 's' : ''}://` +
			`${hostName}:` +
			(port || (this.class[ssl ? 'DefaultSSLWSPort' : 'DefaultWSPort']))
		)
	}
	buildAjaxArgs(e) {
		e ??= {}
		let { args, session, firmaDBBelirtec = e.firmaBelirtec } = e
		if (!args)
			return
		if (session === undefined)
			session = this.session
		if (firmaDBBelirtec == null)
			firmaDBBelirtec = this.firmaDBBelirtec
		if (firmaDBBelirtec)
			extend(args, { firmaDBBelirtec })
		session?.buildAjaxArgs?.(e)
	}
	applyColorScheme(e) {
		let {colorScheme} = this
		colorScheme = colorScheme?.char ?? colorScheme; colorScheme = colorScheme?.toLowerCase() || ''
		let cssClass = 'dark-theme'
		switch (colorScheme) {
			case 'dark': $('body').addClass(cssClass); break
			default: $('body').removeClass(cssClass); break
		}
	}
}
