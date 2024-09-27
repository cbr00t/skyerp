class LoginPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'loginPart' }
	static get isSubPart() { return true }
	get defaultLayoutSelector() { return '#loginForm' }
	
	runDevam(e) {
		super.runDevam(e); if (window.boot) { window.boot.step() } const {layout} = this;
		const btnAyarlar = layout.find('#ayarlar').jqxButton({ theme: theme, width: false, height: false });
		btnAyarlar.off('click').on('click', evt => this.ayarlarIstendi($.extend({}, e, { event: evt })));
		const ddLoginTipi = layout.find(`#loginTipi`); ddLoginTipi.jqxDropDownList({
			theme, width: '100%', height: 55, itemHeight: 50, dropDownHeight: 200,
			source: app.loginTipleri, valueMember: 'kod', displayMember: 'aciklama',
			renderer: (index, aciklama, kod) => {
				const {partName} = this.class, layoutName = ddLoginTipi.prop('id');
				return `<div class="${partName} ${layoutName} list-item flex-row"><div class="aciklama">${aciklama}</div></div>`
			}
		});
		const loginTipi = qs.loginTipi || app.defaultLoginTipi || Session.DefaultLoginTipi;
		const txtPass = layout.find('#pass'), txtUser = layout.find('#user'); txtUser.off('blur').on('blur', evt => this.loginUserDegisti({ event: evt }));
		const btnSSOLogin = this.btnSSOLogin = layout.find('#ssoLogin').jqxButton({ theme, width: false, height: false });
		btnSSOLogin.off('click').on('click', evt => this.loginIstendi({ event: evt, isSSO: true }));
		const btnLogin = layout.find('#islemTuslari #login'); btnLogin.jqxButton({ theme, width: '100%', height: 60 }); btnLogin.off('click').on('click', evt => this.loginIstendi({ event: evt }));
		if (loginTipi) { ddLoginTipi.val(loginTipi) }
		const {sessionID, session, user} = qs; if (user) { txtUser.val(user); const {pass} = qs; if (pass != null) { txtPass.val(pass) } }
		if (!ddLoginTipi.val()) { ddLoginTipi.val(loginTipi) }
		const promise_uiResult = this.promise_uiResult = new $.Deferred();
		if (sessionID ||session || user) { this.loginIstendi({ sessionID, session }); txtPass.focus() } else { this.show(); txtUser.focus() }
		let elms = layout.find('input[type=textbox], input[type=password]');
		elms.on('focus', evt => evt.target.select());
		elms.on('keyup', evt => { const key = evt.key?.toLowerCase(); if (key == 'enter' || key == 'linefeed') { btnLogin.click() } });
		if (window.boot) window.boot.step()
		return promise_uiResult
	}
	show(e) {
		if (window.boot) { window.boot.end() } const {rootParent, btnLogout} = app;
		for (const elm of [rootParent, btnLogout]) { if (elm?.length) { elm.addClass('jqx-hidden') } }
		return super.show(e)
	}
	hide(e) {
		const {rootParent, btnLogout} = app; for (const elm of [rootParent, btnLogout]) { if (elm?.length) { elm.removeClass('jqx-hidden') } }
		return super.hide(e)
	}
	async loginUserDegisti(e) {
		const {layout} = this; const loginTipi = layout.find('#loginTipi').val()?.trimEnd(), user = layout.find('#user').val()?.trimEnd(); let result;
		try { result = await app.wsLogin({ infoOnly: true, session: new Session({ loginTipi, user }) }) } catch (ex) { console.error(ex); if (window.boot) window.boot.end() }
		const userTextParent = layout.find('#userTextParent'), btnSSOLogin = layout.find('#ssoLogin');
		const {session} = (result || {});
		if (session?.sessionID) {
			const divUserText = userTextParent.children('#userText'), session = result?.session ?? result;
			divUserText.html(`[<b>${session.user || ''}</b>] ${session.userDesc || ''}`); userTextParent.removeClass('jqx-hidden basic-hidden');
			if (session.isSSO || session.hasSSO) { btnSSOLogin.removeClass('jqx-hidden basic-hidden') } else { btnSSOLogin.addClass('jqx-hidden') }
		}
		else { userTextParent.addClass('basic-hidden'); btnSSOLogin.addClass('jqx-hidden') }
	}
	loginIstendi(e) {
		e = e || {}; if (window.boot) { window.boot.step() } const {layout} = this, _session = new Session();
		if (e.sessionID) { _session.sessionID = e.sessionID; _session.useSessionID() }
		else if (e.session) { _session.session = e.session }
		else {
			$.extend(_session, {
				loginTipi: e.loginTipi == null ? layout.find('#loginTipi').val().trimEnd() : e.loginTipi,
				user: e.user == null ? layout.find('#user').val().trimEnd() : e.user,
				pass: e.pass == null ? layout.find('#pass').val().trimEnd() : e.pass
			})
		}
		if (window.boot) { window.boot.step() }
		const {promise_uiResult} = this;
		return app.wsLogin({ isSSO: e.isSSO, session: _session })
			.then(result => { if (promise_uiResult) { promise_uiResult.resolve(result) } if (window.boot) { window.boot.step() } this.hide() })
			.catch(_error => {
				const errorText = getErrorText(_error); this.show();
				createJQXWindow({
					title: 'Oturum Açılamadı', content: errorText, args: { isModal: true, width: 600, height: 300 },
					buttons: { TAMAM: e => { e.close(); setTimeout(() => layout.find(`#user`).focus(), 100) } }
				})
			})
	}
	vazgecIstendi(e) { const {promise_uiResult} = this; if (promise_uiResult) { promise_uiResult.reject({ sessionInfo }) } this.hide() }
	ayarlarIstendi(e) { return app.ayarlarIstendi($.extend({}, e, { parentPart: this })) }
}
