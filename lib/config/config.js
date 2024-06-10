class Config extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static DefaultWSPort = 8200; static DefaultSSLWSPort = 9200; static SSLPortShift = 1000; static DefaultSSLFlag = undefined;
	static DefaultWSHostName = undefined; static DefaultProxyServerURL = undefined;
	constructor(e) {
		e = e || {}; super(e);
		this.dev = e.dev ?? e.programci ?? qs.dev ?? qs.programci; this.test = e.test ?? qs.test;
		this.ssl = e.ssl ?? qs.ssl ?? this.class.DefaultSSLFlag; this.noFullScreen = asBool(e.tamEkranYok ?? e.noFullScreen);
		/* this.noHeader = asBool(e.noHeader ?? qs.noHeader ?? qs.basliksiz ?? qs.headless ?? ($(window).width() <= 900 || $(window).height() <= 700)); */
		this.noHeader = (qs.headless ?? qs.noHeader) ?? (qs.header ? false : $(window).width() < 850);
		const _port = (e.port || qs.port);
		const ws = this.ws = inverseCoalesce(e.ws, value => JSON.parse(value)) || {
			hostName: e.hostName || e.hostname || qs.hostName || qs.hostname || this.class.DefaultWSHostName, port: _port ? asInteger(_port) : undefined,
			url: e.url || e.wsURL || qs.wsURL || undefined,
			proxyServerURL: e.proxyServerURL || e.wsProxyServerURL || qs.proxyServerURL || qs.proxyServerUrl || qs.proxyServer || qs.proxy || this.class.DefaultProxyServerURL || undefined
		};
		let {proxyServerURL} = this; if (proxyServerURL && proxyServerURL.endsWith('/')) { proxyServerURL = ws.proxyServerURL = proxyServerURL.slice(0, -1) }
		this.session = e.session || null
	}
	get hasSession() { return !!(this.session || {}).hasSession }
	get wsURLBase() { return this.getWSUrlBase() }
	getWSUrlBase(e) {
		e = e || {}; const ws = e.ws || this.ws || {};
		const _url = e.url || ws.url; if (_url) { return _url }
		const ssl = e.ssl ?? ws.ssl ?? this.ssl, hostName = e.hostName || e.hostname || e.wsHostName || ws.hostName || ws.hostname || 'localhost', port = e.port || e.wsPort || ws.port;
		return ( `http${ssl ? 's' : ''}://` + `${hostName}:` + (port || (this.class[ssl ? 'DefaultSSLWSPort' : 'DefaultWSPort'])) )
	}
	buildAjaxArgs(e) {
		e = e || {}; const {args} = e; if (!args) { return }
		let {session} = e; if (session === undefined) { session = this.session }
		if (session) { session.buildAjaxArgs(e) }
	}
}
