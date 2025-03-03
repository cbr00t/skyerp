class AppBase extends LayoutBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static { this.xdec2Enc = {}; this.xenc2Dec = {} } static get delimXEnc() { return String.fromCharCode(1) }
	get rootName() { return 'skyERP' } get appName() { return shortAppName } get localParamKey() { return `${this.rootName}.${shortAppName}` }
	get activePart() { const activePartStack = this._activePartStack || []; return activePartStack[activePartStack.length - 1] }
	get defaultWSPath() { return 'ws' } get wsURLBase() { return this.getWSUrlBase() } get useCloseAll() { return false }
	get kioskmu() { return this.kioskmuDogrudan || config.kiosk } get kioskmuDogrudan() { return false } get inKioskMode() { return $('body').hasClass('kiosk') }
	get defaultLoginTipi() { return Session.DefaultLoginTipi } get sqlServermi() { return !this.sqlType } get sqlitemi() { return this.sqlType == 'sqlite' }
	get loginTipleri() {
		let result = this._loginTipleri;
		if (!result) { result = this._loginTipleri = []; this.loginTipleriDuzenle({ loginTipleri: result }) }
		return result
	}

	constructor(e) {
		e = e || {}; super(e); this.appID = e.appID || newGUID(); this.wsPath = e.wsPath || this.defaultWSPath;
		this._activePartStack = []; this.wsKey2Callbacks = {}
	}
	async init(e) {
		setTimeout(() => { if (window.boot) window.boot.end() }, 1000);
		e = e || {}; if (window.boot) { window.boot.step() }
		if (qs.newWindow) { if (this.openNewWindow(e)) { setTimeout(() => window.close(), 1000) } } 
		super.init(e); config.applyColorScheme(e);
		this.promise_inject = this.wsInjectCode(e)
			.then(text => {
				let injectResult; try { injectResult = this.injectResult = eval(text) } catch(ex) { console.error('inject-code-init', ex, text); if (config.dev) { hConfirm(getErrorText(ex), 'Inject Code Error') } }
				if (injectResult) { console.debug('injectCode-init', 'success', injectResult, text) }
				if (injectResult?.init) { injectResult.init({ sender: this, ...e }) }
			})
			.catch(ex => console.error('inject-code-init', ex));
		const appTitleBar = this.appTitleBar = $('body > .app-titlebar'), divDBName = this.divDBName = appTitleBar.find('.db-name'), divUser = this.divUser = appTitleBar.find('.user');
		const divAppTitle = this.divAppTitle = appTitleBar.find('.app-title'), divAppVersion = this.divAppVersion = appTitleBar.find('.app-version');
		const btnLogout = this.btnLogout = $('body > #logout'); this.divBGImage = $('body > .bg-image');
		if (btnLogout.length) { btnLogout.jqxButton({ theme: theme, width: false, height: false }); btnLogout.on('click', evt => this.logoutIstendi()) }
		const rootParent = this.rootParent = $('body #root-parent'), ustParent = this.ustParent = rootParent.children('#ust-parent');
		this.btnMainNavToggle = ustParent.parent().children('#nav-toggle');
		const mainNav = this.mainNav = ustParent.children('#nav'), mainParent = this.mainParent = ustParent.children('#parent');
		const mainWindowsTabs = this.mainWindowsTabs = mainParent.find('#windows-parent > div > #windows');
		this.content = mainParent.children('main'); if (window.boot) { window.boot.step() }
		const $root = $(':root'); $root.css('--appTitle-height', config.noHeader ? '2px' : 'var(--appTitle-height-mini)'); $root.css('--nav-top', 'var(--nav-top-mini)');
		if (config.noHeader) { $('body').addClass('headless'); appTitleBar.css('line-height', '16px'); divDBName.addClass('jqx-hidden') }
		if (this.offlineMode) { $('body').addClass('offline') }
		const mainWindowsPart = this.mainWindowsPart = new TabsPart({ layout: mainWindowsTabs })/*.sortable()*/;
		mainWindowsPart.tabPageChanged(e => {
			const currentWndPart = this.activeWndPart; if (currentWndPart && currentWndPart.deactivated) currentWndPart.deactivated(e)
			const {header} = e.tabPage || {}; let wndPart = ((header ? header.data('part') : null) || {}).asilPart;
			if (wndPart) {
				if (wndPart.isDestroyed || wndPart.isSubPart) { wndPart = wndPart.parentPart }
				else { const {layout} = wndPart; if (!layout?.length /*|| (layout.hasClass('jqx-hidden') || layout.hasClass('basic-hidden'))*/) wndPart = wndPart.parentPart }
			}
			this.activeWndPart = wndPart; if (wndPart?.activated) wndPart.activated(e)
		});
		const {appName} = this; $('body').addClass(`${appName} app`);
		mainWindowsPart.toggled(e => this.content[e.collapsed ? 'removeClass' : 'addClass']('jqx-hidden')); mainWindowsPart.run()
		/*mainWindowsTabs.children('.tabs').jqxResponsivePanel({ width: false, height: false, collapseBreakpoint: 500, toggleButton: mainWindowsTabs.parent().children('#wnd-toggle'), animationType: animationType, autoClose: true })*/
	}
	runDevam(e) {
		e = e || {}; const {injectResult} = this; if (window.boot) { window.boot.step() }
		if (injectResult?.beforeRun) { injectResult.beforeRun({ sender: this, ...e }) } if (injectResult?.run) { injectResult.run({ sender: this, ...e }) }
		super.runDevam(e); if (window.boot) { window.boot.step() }
	}
	afterRun(e) {
		const {injectResult} = this; if (window.boot) { window.boot.step() }
		if (injectResult?.beforeAfterRun) { injectResult.beforeAfterRun({ sender: this, ...e }) }
		super.afterRun(e); if (window.boot) { window.boot.step() }
		(async () => {
			this.updateAppTitle(e); this.onResize(e); const {promise_login} = this; if (promise_login) { await promise_login }
			if (this.kioskmu) { this.enterKioskMode(e) } this.updateAppTitle(e); this.onResize(e); this.updateViewport(e)
			/*if (!config.noFullScreen) { document.body.focus(); for (const timeout of [100, 500, 1000, 2000, 3000, 4000]) { setTimeout(() => requestFullScreen(), timeout) } }*/
			if (injectResult?.afterRun) { injectResult.afterRun({ sender: this, ...e }) }
			setTimeout(() => { if (window.boot) { window.boot.end() } }, 10)
		})()
	}
	updateViewport(e) {
		e = e || {}; const configParam = this.params?.config, {viewportScale} = configParam;
		const elmMeta = $('head > meta[name = viewport]'), tokens = elmMeta.attr('content').split(',').map(x => x.trim()), dict = {};
		if (tokens?.length) {
			for (let token of tokens) {
				token = token.trim(); if (!token) { continue }
				const subTokens = token.split('='); dict[subTokens[0].trim()] = subTokens.slice(1).join(',').trim()
			}
		}
		const defaultValue = asFloat(dict['initial-scale'] || dict['minimum-scale']); if (defaultValue) { dict['default-scale'] = defaultValue }
		let degistimi = false, value = asFloat(e.value || viewportScale || dict['initial-scale'] || dict['minimum-scale']);
		const validKeys = asSet(['initial-scale', 'minimum-scale', 'maximum-scale']); for (const key of Object.keys(validKeys)) { if (asFloat(dict[key]) != value) { dict[key] = value; degistimi = true } }
		let contentValue = '';
		for (const key in dict) {
			let value = dict[key]; if (contentValue) { contentValue += ', ' }
			contentValue += `${key}=${value}`
		}
		if (configParam) { configParam.viewportScale = value; if (configParam.kaydetDefer) { configParam.kaydetDefer() } }
		elmMeta.attr('content', contentValue)
	}
	async loginIstendi(e) {
		const {promise_login} = this, loginPart = this.loginPart = new LoginPart(); let result;
		try { result = await loginPart.run(); if (promise_login) { promise_login.resolve(result) } }
		catch (ex) { if (promise_login) promise_login.reject(ex); throw ex } finally { delete this.loginPart }
		this.updateAppTitle(e); return result
	}
	async ayarlarIstendi(e) {
		e = e || {}; const parentPart = e.parentPart || this.activeWndPart,  param = (this.params || {}).config; let result = { param: param };
		if (param) { $.extend(result, await param.tanimla($.extend({}, e, { parentPart: parentPart })) || {}) }
		this.updateAppTitle(); return result
	}
	async onbellekSilIstendi(e) {
		let cacheKeys = window.caches ? await window.caches.keys() : []; const size = cacheKeys.length;
		if (!size) { displayMessage(`! Önbellekte silinecek veri bulunamadı !`); return }
		if (!navigator.onLine) { displayMessage(`! <b>Önbellek Sil</b> işlemi için <b>İnternete Bağlı</b> olmalısınız !`); return }
		try {
			await this.onbellekSil(e); displayMessage(`<b>${size} adet</b> önbellek deposu silindi`);
			await new Promise(resolve => { setTimeout(async () => resolve(await this.onbellekSil(e)), 500) })
		}
		catch (ex) { }
	}
	async onbellekSil(e) {
		const cacheKeys = window.caches ? await window.caches.keys() : [];
		for (const key of cacheKeys) await caches.delete(key)
	}
	async scaleIstendi(e) {
		const elmMeta = $('head > meta[name = viewport]'), tokens = elmMeta.attr('content').split(',').map(x => x.trim()), dict = {};
		if (tokens?.length) {
			for (let token of tokens) {
				token = token.trim(); if (!token) { continue }
				const subTokens = token.split('='); dict[subTokens[0].trim()] = subTokens.slice(1).join(',').trim()
			}
		}
		const _isTouchDevice = isTouchDevice(), evt = e.event, configParam = app.params?.config, {viewportScale} = configParam;
		const defaultValue = asFloat(dict['default-scale']); let value = asFloat(dict['initial-scale'] || dict['minimum-scale']);
		let layout = $(`
			<div class="scale-parent">
			   <input class="scaler full-wh" name="scaler" type="range" min=".1" max="2" step=".1" value=${value}></input>
			   ${!_isTouchDevice ? `<div class="ek-bilgi"><span class="warning">** UYARI:</span>: Boyutlandırma işlemi sadece <u class="bold">Dokunmatik/Tablet</u> cihazlarda çalışır` :  ''}
			</div>
		`);
		let wnd = createJQXWindow({
			content: layout, title: 'Boyutlandır',
			args: {
				isModal: true, width: 300 + (_isTouchDevice ? 0 : 50), height: 200 + (_isTouchDevice ? 0 : 30),
				showCloseButton: true, showCollapseButton: false, position: { left: $(window).width() * .15, top: $(window).height() * .15 }
			},
			buttons: { 'SIFIRLA': e => { const {wnd} = e, layout = wnd.find('div > .content > .subContent'), scaler = layout.find('.scaler'); scaler.prop('value', defaultValue); scaler.trigger('change') } }
		});
		wnd.addClass('scaler part'); wnd.on('close', evt => $('body').removeClass('bg-modal'))
		let wndLayout = wnd.find('div > .content > .subContent'), input = wndLayout.find('.scale-parent > .scaler');
		input.on('change', evt => {
			const timerKey = '_timer_scale'; clearTimeout(this[timerKey]);
			this[timerKey] = setTimeout(() => {
				try {
					const validKeys = asSet(['initial-scale', 'minimum-scale', 'maximum-scale']); let value = asFloat(evt.currentTarget.value), degistimi = false;
					for (const key of Object.keys(validKeys)) { if (asFloat(dict[key]) != value) { dict[key] = value; degistimi = true } }
					if (degistimi) {
						let contentValue = '';
						for (const key in dict) {
							let value = dict[key]; if (contentValue) { contentValue += ', ' }
							contentValue += `${key}=${value}`
						}
						if (configParam) { configParam.viewportScale = value; if (configParam.kaydetDefer) { configParam.kaydetDefer() } }
						let _layouts = [ this.mainWindowsPart.layout, this.content ]; for (const _layout of _layouts) { _layout.fadeOut('slow') }
						setTimeout(() => { elmMeta.attr('content', contentValue); setTimeout(() => { for (const _layout of _layouts) { _layout.fadeIn('slow') } }, 50) }, 50)
					}
					evt.currentTarget.click()
				}
				finally { delete this[timerKey] }
			}, 1)
		}); $('body').addClass('bg-modal')
	}
	async toggleFullScreen(e) {
		try {
			if (document.fullscreen) await cancelFullScreen({ force: true })
			else await requestFullScreen({ force: true })
			return true
		}
		catch (ex) { return false }
	}
	async openNewWindow(e) {
		e = e || {}; const _qs = { ...qs, inNewWindow: true, ...(e.qs || {}) }, session = config.session ?? {}, {sessionID, user, pass} = session, _session = session.session;
		const removeKeys = ['sessionID', 'session', 'sessionMatch', 'loginTipi', 'user', 'pass', 'menuAdim', 'menuId', 'menuID', 'menu', 'afterRun', 'newWindow', '#nbb'];
		for (const key of removeKeys) { delete _qs[key] }
		for (const key in _qs) { if (!key || key[0] == '_' || key[0] == '-') { delete _qs[key] } }
		if (_session) { _qs.session = _session }
		else if (user) { const loginTipi = session.loginTipi || 'login'; _qs.session = Base64.encode(toJSONStr({ loginTipi, user, pass })) }
		else if (sessionID) { _qs.sessionID = sessionID }
		let {menuId} = e; const {activeWndPart, lastMenuId} = app; if (!menuId && activeWndPart && activeWndPart != app && lastMenuId) { menuId = lastMenuId }
		if (!menuId) { menuId = qs.menuAdim || qs.menuId || qs.menuID || qs.menu }
		if (menuId) { _qs.menuAdim = menuId }
		const url = `${location.origin}${location.pathname}?${$.param(_qs).replaceAll('=true', '')}`;
		try { return openNewWindow(url) } catch (ex) { console.error(ex); return null }
	}
	async logoutIstendi(e) {
		let result; try { result = await this.wsLogout() } catch (ex) { console.error(ex) }
		this.updateAppTitle(); /* this.loginIstendi(e);*/ location.reload(); return result
	}
	updateAppTitle(e) {
		e = e || {}; this.divAppTitle.html(appName); this.divAppVersion.html(appVersion);
		const session = e.session ?? config.session, userSession = e.userSession ?? session;
		this.divDBName.html(session?.dbName || '');
		const userText = `${userSession?.user ? `(<span class="bold lightgray">${userSession.user || ''}</span>) ` : ''}${userSession?.userDesc || ''}`; this.divUser.html(userText)
	}
	loginTipleriDuzenle(e) {
		const {loginTipleri} = e; $.merge(loginTipleri, [
			{ kod: 'login', aciklama: `VIO Kullanıcısı` },
			{ kod: 'plasiyerLogin', aciklama: `Plasiyer` },
			{ kod: 'musteriLogin', aciklama: `Müşteri` }
			/*{ kod: 'kasiyerLogin', aciklama: `Kasiyer` }*/
		])
	}
	enterKioskMode(e) { $('body').addClass('kiosk'); return this } exitKioskMode(e) { $('body').removeClass('kiosk') }
	wsInjectCode(e) {
		let wsURLBase = app.getWSUrlBase({ wsPath: '' }); if (wsURLBase?.endsWith('/')) { wsURLBase = wsURLBase.slice(0, -1) }
		return Promise.any([
			ajaxPost({ dataType: 'text', url: `${wsURLBase}/skyERP.${this.appName}.override.js` }),
			ajaxPost({ dataType: 'text', url: `${wsURLBase}/skyERP-override/${this.appName}.js` })
		])
	}
	async wsPing(e) { const result = await ajaxGet({ url: this.getWSUrl({ api: 'ping' }), data: e }); return result ?? null }
	async wsGetSessionInfo(e) { const result = await ajaxGet({ url: this.getWSUrl({ api: 'getSessionInfo' }), data: e }); return result ?? null }
	async wsEcho(e) {
		e = e || {}; let {data, contentType} = e; delete e.data;
		if (!contentType) {
			if (!data || typeof data == 'object') { data = toJSONStr(data); contentType = 'application/json' }
			if (!contentType) { contentType = 'text/plain' }
			if (contentType) { e.contentType = contentType }
		}
		let dataType; if (e.stream) { dataType = null }
		const result = await (data ? ajaxPost : ajaxGet)({ url: this.getWSUrl({ api: 'echo', args: e }), data: data, ajaxContentType: null, dataType: dataType });
		return result == null ? null : result
	}
	wsEchoAsStream(e) { e = e || {}; return this.wsEcho({ ...e, stream: true }) }
	async xenc(e) {
		e = e || {}; if ($.isArray(e)) { e = { dataArr: e } } else if (typeof e != 'object') { e = { data: e } }
		const dataOrArr = e.dataArr ?? e.data, keys = $.makeArray(dataOrArr); if (!keys?.length) { return null }
		const {delimXEnc, xdec2Enc, xenc2Dec} = this.class, anah = keys.join(delimXEnc);
		let result = xdec2Enc[anah]; if (result === undefined) {
			const valueOrValues = await this.wsXEnc(e); if (valueOrValues != null) {
				if ($.isArray(valueOrValues)) { result = {}; for (let i = 0; i < valueOrValues.length; i++) { result[keys[i]] = valueOrValues[i] } }
				else { result = valueOrValues }
			}
			const reverseAnah = $.makeArray(result).join(delimXEnc); xdec2Enc[anah] = result; xenc2Dec[reverseAnah] = dataOrArr
		}
		return result
	}
	async xdec(e) {
		e = e || {}; if ($.isArray(e)) { e = { dataArr: e } } else if (typeof e != 'object') { e = { data: e } }
		const dataOrArr = e.dataArr ?? e.data, keys = $.makeArray(dataOrArr); if (!keys?.length) { return null }
		const {delimXEnc, xenc2Dec, xdec2Enc} = this.class, anah = keys.join(delimXEnc);
		let result = xenc2Dec[anah]; if (result === undefined) {
			const valueOrValues = await this.wsXDec(e); if (valueOrValues != null) {
				if ($.isArray(valueOrValues)) { result = {}; for (let i = 0; i < valueOrValues.length; i++) { result[keys[i]] = valueOrValues[i] } }
				else { result = valueOrValues }
			}
			const reverseAnah = $.makeArray(result).join(delimXEnc); xenc2Dec[anah] = result; xdec2Enc[reverseAnah] = dataOrArr
		}
		return result
	}
	async wsXEnc(e) {
		e = e || {}; if ($.isArray(e)) { e = { dataArr: e } } else if (typeof e != 'object') { e = { data: e } }
		const result = await ajaxPost({ ajaxContentType: wsContentTypeVeCharSet, url: this.getWSUrl({ api: 'xenc' }), processData: false, data: toJSONStr(e) });
		return result == null || $.isArray(result) ? result : (result.result ?? result)
	}
	async wsXDec(e) {
		e = e || {}; if ($.isArray(e)) { e = { dataArr: e } } else if (typeof e != 'object') { e = { data: e } }
		const result = await ajaxPost({ ajaxContentType: wsContentTypeVeCharSet, url: this.getWSUrl({ api: 'xdec' }), processData: false, data: toJSONStr(e) });
		return result == null || $.isArray(result) ? result : (result.result ?? result)
	}
	wsFork(e) { return ajaxGet({ url: this.getWSUrl({ api: 'fork' }), data: e }) }
	async wsLogin(e) {
		e = e || {}; if (e.isSSO) { return this.wsSSOLogin(e) }
		const args = e.args || {}, infoOnly = asBool(e.infoOnly);
		if (infoOnly) { args.infoOnly = true } let _session = e.session, {loginTipi} = _session; if (!loginTipi) { loginTipi = Session.defaultLoginTipi }
		const api = infoOnly ? loginTipi : 'getSessionInfo', url = this.getWSUrl({ session: _session, api, args });
		lastAjaxObj = ajaxPost({ timeout: 15000, url }); const result = await lastAjaxObj, session = result && result.sessionID ? new Session(result) : null;
		if (result) { for (const key of Session.extraArgs) { const value = result[key]; if (_session[key] === undefined && value != null) { _session[key] = value } } }
		if (session) { for (const key of Session.extraArgs) { const value = _session[key]; if (value != null) { session[key] = value } } }
		/*(() => { let {pass} = session; if (pass && pass.length != md5Length) pass = session.pass = md5(pass) })();*/
		if (!infoOnly) { config.session = session }
		if (!session) {
			let {_loginCalledFlag} = this; if (!_loginCalledFlag) { _loginCalledFlag = this.__loginCalledFlag = true; return await this.wsLogin(e) }
			throw { isError: true, rc: 'notLoggedIn', errorText: 'Hatalı kullanıcı adı veya parola' }
		}
		const _e = { ...e, infoOnly, sso: false, session, result }; delete _e.isSSO; await session.afterLogin(_e); return _e
	}
	async wsSSOLogin(e) {
		e = e || {}; const args = e.args || {}; args.ssoRequest = true;
		const infoOnly = asBool(e.infoOnly); if (infoOnly) { args.infoOnly = true }
		let {session} = e, {loginTipi} = session; if (!loginTipi) { loginTipi = 'login' } session.useUser();
		let result, url = this.getWSUrl({ session: session, api: loginTipi, args: args }); showProgress();
		try { result = await (lastAjaxObj = ajaxPost({ url })) } finally { hideProgress() }
		const {ssoEMails} = result; if ($.isEmptyObject(ssoEMails)) throw { isError: true, rc: 'ssoNotSupported', errorText: 'Bu kullanıcı için Tanımlı e-Mail Adresi bulunamadı'};
		const eMailsStr = ssoEMails.join('; '); let wndContent = $(
			`<div class="ssoLoginWindow" style="padding: 13px;">` +
				`<div><label for="ssoPass">Lütfen ${eMailsStr} e-mail ${eMailsStr.length > 1 ? 'adreslerine' : 'adresine'} gönderilen Tek Kullanımlık şifreyi giriniz:</div>` +
				`<div><input id="ssoPass" name="ssoPass" type="number" maxlength="6" style="font-size: 230%; font-weight: bold; text-align: center; color: forestgreen; width: 98%; height: 50px;"></input></div>` +
			`</div>`
		);
		let promise = new $.Deferred(), wnd = createJQXWindow({
			content: wndContent, title: 'Tek Kullanımlık Şifre ile Giriş', promise,
			args: { isModal: true, showCloseButton: false, showCollapseButton: true, position: 'center', width: 500, height: 320 },
			buttons: {
				'TAMAM': e => {
					setButonEnabled(e.button, false); setTimeout(() => setButonEnabled(e.button, true), 1000);
					const _ssoPass =  (e.wnd.find('.content > .subContent > .ssoLoginWindow #ssoPass').val() || '').toString() || '';
					if (!_ssoPass) { displayMessage('Lütfen Tek Kullanımlık Şifreyi giriniz', 'Şifre Girişi'); return }
					e.promise.resolve({ ssoPass: _ssoPass }); e.close()
				},
				'VAZGEÇ': e => e.close()
			}
		});
		wnd.on('close', () => promise.reject({ isError: true, rc: 'userAbort' }));
		setTimeout(() => {
			const elm = wnd.find('.jqx-window-content #ssoPass');
			elm.on('keyup', evt => {
				const key = (evt.key || '').toLowerCase();
				if (key == 'enter' || key == 'linefeed')
					elm.parents('.jqx-window-content').children('.buttons').children(0).click()
			});
			elm.focus()
		}, 100);
		result = await promise; const {ssoPass} = result; for (const key of ['ssoRequest', 'loginTipi', 'sessionMatch']) { delete args[key] }
		args.sso = ssoPass; url = this.getWSUrl({ session, api: loginTipi, args }); result = await (lastAjaxObj = ajaxPost({ url }));
		for (const key of Session.extraArgs) { const value = result[key]; if (value != null) { session[key] = value } }
		/*(() => { let {pass} = session; if (pass && pass.length != md5Length) pass = session.pass = md5(pass) })();*/
		session.sso(); $.extend(session, { sessionID: result.sessionID, hasSSO: result.hasSSO }); if (!infoOnly) { config.session = session }
		if (!session) { throw { isError: true, rc: 'notLoggedIn', errorText: `Hatalı kullanıcı adı veya parola` } }
		const _e = { ...e, infoOnly, sso: true, session, result }; delete _e.isSSO; await session.afterLogin(_e); return _e
	}
	async wsLogout(e) {
		e = e || {}; const {args} = e, _session = e.session;
		const url = this.getWSUrl({ session: _session, api: 'logout', args }); lastAjaxObj = ajaxPost({ url });
		const session = config.session = null, result = await lastAjaxObj;
		return { session, result };
	}
	async wsReadTemp(e) {
		e = e || {}; let {ssl, port} = e;
		for (const key of ['ssl', 'port']) delete e[key]
		const dataType = e.stream ? undefined : null, result = await ajaxGet({ url: this.getWSUrl({ ssl, port, api: 'readTemp' }), data: e, dataType });
		return result == null ? null : result
	}
	wsReadTempAsStream(e) { e = e || {}; return this.wsReadTemp($.extend({}, e, { stream: true })) }
	async wsWriteTemp(e) {
		e = e || {}; let {data, ssl, port} = e;
		for (const key of ['data', 'ssl', 'port']) delete e[key]; let {contentType} = e;
		if (!contentType) {
			if (!data || typeof data == 'object') { data = toJSONStr(data); contentType = 'application/json' }
			if (!contentType) contentType = 'text/plain'
			if (contentType) e.contentType = contentType
		}
		const result = await ajaxPost({ url: this.getWSUrl({ ssl, port, api: 'writeTemp', args: e }), data, ajaxContentType: null });
		return result == null ? null : result
	}
	async wsClearTemp(e) {
		let {ssl, port} = e; for (const key of ['ssl', 'port']) delete e[key]
		const result = await ajaxGet({ url: this.getWSUrl({ ssl, port, api: 'clearTemp' }), data: e });
		return result == null ? null : result
	}
	async wsClearTemps(e) {
		let {ssl, port} = e; for (const key of ['ssl', 'port']) delete e[key]
		const result = await ajaxGet({ url: this.getWSUrl({ ssl, port, api: 'clearTemps' }), data: e });
		return result == null ? null : result
	}
	wsWait(e) {
		const {key} = e; let dataType = e.dataType || wsDataType, contentType = e.contentType || wsContentType;
		const {wsKey2Callbacks} = this, callbacks = wsKey2Callbacks[key] = wsKey2Callbacks[key] || [];
		const promise = ajaxGet({ dataType, ajaxContentType: contentType, url: this.getWSUrl({ api: 'wait', args: { key } }) }); callbacks.push(promise);
		promise.always(xhr => { const {wsKey2Callbacks} = this, callbacks = wsKey2Callbacks[key]; if (callbacks) { callbacks.splice() } delete wsKey2Callbacks[key] });
		return promise
	}
	wsSignal(e) {
		let {key, data} = e, dataType = e.dataType || wsDataType, contentType = e.contentType;
		if (!contentType) {
			if (data == null || typeof data == 'object') { data = toJSONStr(data); contentType = 'application/json' }
			if (!contentType) contentType = 'text/plain'
		}
		if (contentType) { e.contentType = contentType }
		const promise = ajaxPost({ dataType, ajaxContentType: contentType, processData: false, data, url: this.getWSUrl({ api: 'signal', args: { key } }) });
		return promise
	}
	wsEventStream(e) {
		let {key} = e, dataType = e.dataType || wsDataType, contentType = e.contentType || wsContentType;
		const {wsKey2Callbacks} = this, callbacks = wsKey2Callbacks[key] = wsKey2Callbacks[key] || [];
		let url = this.getEventStreamURL(e), promise = ajaxGet({ dataType, ajaxContentType: contentType, url }); callbacks.push(promise);
		promise.always(xhr => {
			const {wsKey2Callbacks} = this, callbacks = wsKey2Callbacks[key];
			if (callbacks) { callbacks.splice() } delete wsKey2Callbacks[key]
		});
		return promise
	}
	getEventStreamURL(e, _wsPath) {
		const key = typeof e == 'object' ? e.key : e, wsPath = typeof e == 'object' ? e.wsPath : _wsPath;
		const api = 'eventStream', args = { key }; return this.getWSUrl({ api, wsPath, args })
	}
	getWebSocketURL(e, _wsPath) {
		const key = typeof e == 'object' ? e.key : e, wsPath = typeof e == 'object' ? e.wsPath : _wsPath;
		const api = 'webSocket', args = { key }; return this.getWSUrl({ api, wsPath, args })
	}
	wsWebSocket_readAny(e) {
		let {key} = e;
		let url = this.getWSUrl({ api: 'webSocket_readAny', args: { key } });
		return ajaxPost({ url })
	}
	wsWebSocket_readAll(e) {
		let {key} = e, url = this.getWSUrl({ api: 'webSocket_readAll', args: { key } });
		return ajaxPost({ url })
	}
	wsWebSocket_writeAll(e) {
		let {key, data} = e, processData = false, ajaxContentType = typeof data == 'object' ? wsContentTypeVeCharSet : `text/plain; charset=${wsCharSet}`;
		let url = this.getWSUrl({ api: 'webSocket_writeAll', args: { key } });
		data = typeof data == 'object' ? toJSONStr(data) : data?.toString();
		return ajaxPost({ ajaxContentType, processData, url, data })
	}
	wsWebSocket_close(e) {
		let {key} = e, url = this.getWSUrl({ api: 'webSocket_close', args: { key } });
		return ajaxPost({ url })
	}
	async rcon(e, _script, _wsURL) {
		const key = typeof e == 'object' ? e.key : e, script = typeof e == 'object' ? e.script : _script;
		const wsURL = (typeof e == 'object' ? e.wsURL || e.url : _wsURL) || 'https://cloud.vioyazilim.com.tr:9200';
		const ws = { url: wsURL }, ipcKey = key, scriptKey = `${ipcKey}-script`, callbackKey = `${ipcKey}-callback`;
		try {
			const _ws = config.ws; $.extend(config.ws, ws); console.debug('rcon script url', `${this.getWSUrlBase()}/wait/?key=${scriptKey}`);
			await app.wsSignal({ key: scriptKey, data: `new (class extends CObject {
				async run(e) {
					const _ws = config.ws; $.extend(config.ws, ${toJSONStr(ws)});
					const callbackKey = '${callbackKey}', {params} = app; let data = {};
					${script}
					await app.wsWriteTemp({ key: callbackKey, data: toJSONStr(data) });
					setTimeout(() => { app.wsSignal({ key: callbackKey, data: '{}' }); config.ws = _ws }, 3500)
				}
			})()` });
			await app.wsWait({ key: callbackKey }); const data = await app.wsReadTempAsStream({ key: callbackKey }); config.ws = _ws;
			if (data?.isError) { throw data }; return data
		}
		catch (ex) { throw ex }
	}
	wsAbortCallback(e) {
		const {key} = e, {wsKey2Callbacks} = this; const callbacks = wsKey2Callbacks[key]; let count = 0;
		if ($.isEmptyObject(callbacks)) return 0
		for (const callback of callbacks) { if (callback.abort) callback.abort(); count++ }
		callbacks.splice(); delete wsKey2Callbacks[key]; return count
	}
	getWSUrlBase(e) { e = e || {}; const wsPath = e.wsPath ?? this.wsPath; return `${config.getWSUrlBase(e)}/${wsPath}` }
	getWSUrl(e) {
		e = e || {}; const qsFlag = e.qs == null ? true : asBool(e.qs), _e = { args: e.args || {} };
		if (e.session !== undefined) _e.session = e.session
		const buildAjaxArgsCallback = e.buildAjaxArgs || e.buildAjaxArgsCallback || (e => this.buildAjaxArgs(e));
		if (qsFlag) { getFuncValue.call(this, buildAjaxArgsCallback, _e) }
		const apiName = e.api || e.apiName || e.wsMethod, _qs = $.param(_e.args);
		let wsURLBase = this.getWSUrlBase(e); if (wsURLBase?.endsWith('/')) { wsURLBase = wsURLBase.slice(0, -1) }
		return ( (e.wsURLBase || `${wsURLBase}/`) + (apiName ? `${apiName}/` : '') + ($.isEmptyObject(_e.args) ? '' : `?${_qs}`) )
	}
	buildAjaxArgs(e) {
		e = e || {}; const {args} = e; if (!args) { return }
		config.buildAjaxArgs(e); const appID = args.appID === undefined ? this.appID: args.appID; if (appID) { args.appID = appID }
	}
	getLocalParamKey(subKey) {
		const {localParamKey} = this; if (!localParamKey) return null
		return subKey ? `${localParamKey}.${subKey}` : localParamKey
	}
	getLocals(subKey) {
		const key = this.getLocalParamKey(subKey);
		if (!key) return null
		try { return JSON.parse(localStorage.getItem(key)) || {} }
		catch (ex) { console.error(ex); return {} }
	}
	setLocals(subKey, _value) {
		const key = this.getLocalParamKey(subKey); if (!key) return this
		let value = _value; if (typeof value == 'object') value = toJSONStr(value)
		localStorage.setItem(key, value); return this
	}
	uzakScript_startTimer(e) { }
	uzakScript_stopTimer(e) { const {_timer_uzakScript} = this; clearTimeout(this._timer_uzakScript); return _timer_uzakScript }
	onResize(e) { super.onResize(e) /*const {divBGImage} = this; if (divBGImage && divBGImage.length) { divBGImage.width($(window).width()); divBGImage.height($(window).height()); }*/ }
}


/*
await app.rcon('test', `data = { test: 'value' }`, config.ws.url);
rcon-script url = https://ic-ip:9200/ws/skyERP/wait/?key=test-script

console.table(
	await ajaxPost({
		processData: false, ajaxContentType: wsContentType,
		url: app.vioMerkez_getWSUrl({
			ssl: false, hostName: '192.168.1.??', port: 8200,
			wsPath: 'ws/yonetim', api: 'sqlExec',
			session: new Session({ user: 'root', pass: 'pass' })
		}),
		data: toJSONStr({
			sql: { server: '(local)\\SQL2017', db: 'YI21VPORTAL' },
			execTip: 'dt',
			queries: [
				{ query: 'SELECT DISTINCT baktifmi FROM muslisans' }
			]
		})
	})
)
*/
