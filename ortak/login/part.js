class LoginPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'loginPart' }
	static get isSubPart() { return true }
	get defaultLayoutSelector() { return '#loginForm' }
	
	runDevam(e) {
		super.runDevam(e); window.boot?.step();
		let {layout} = this, btnAyarlar = layout.find('#ayarlar').jqxButton({ theme: theme, width: false, height: false });
		btnAyarlar.off('click').on('click', evt => this.ayarlarIstendi($.extend({}, e, { event: evt })));
		let ddLoginTipi = layout.find(`#loginTipi`); ddLoginTipi.jqxDropDownList({
			theme, width: '100%', height: 55, itemHeight: 50, dropDownHeight: 200,
			source: app.loginTipleri, valueMember: 'kod', displayMember: 'aciklama',
			renderer: (index, aciklama, kod) => {
				let {partName} = this.class, layoutName = ddLoginTipi.prop('id');
				return `<div class="${partName} ${layoutName} list-item flex-row"><div class="aciklama">${aciklama}</div></div>`
			}
		});
		let loginTipi = qs.loginTipi || app.defaultLoginTipi || Session.DefaultLoginTipi;
		let txtPass = layout.find('#pass'), txtUser = layout.find('#user'); txtUser.off('blur').on('blur', evt => this.loginUserDegisti({ event: evt }));
		let btnSSOLogin = this.btnSSOLogin = layout.find('#ssoLogin').jqxButton({ theme, width: false, height: false });
		btnSSOLogin.off('click').on('click', evt => this.loginIstendi({ event: evt, isSSO: true }));
		let btnLogin = layout.find('#islemTuslari #login'); btnLogin.jqxButton({ theme, width: '100%', height: 60 }); btnLogin.off('click').on('click', evt => this.loginIstendi({ event: evt }));
		if (loginTipi) { ddLoginTipi.val(loginTipi) }
		let {sessionID, session, user, pass} = qs; if (user) { txtUser.val(user); let {pass} = qs; if (pass != null) { txtPass.val(pass) } }
		if (!ddLoginTipi.val()) { ddLoginTipi.val(loginTipi) }
		let promise_uiResult = this.promise_uiResult = new $.Deferred();
		if (sessionID || session || (user && pass)) { this.loginIstendi({ sessionID, session }); txtPass.focus() }
		else { this.show(); (user ? txtPass : txtUser).focus() }
		let elms = layout.find('input[type=textbox], input[type=password]');
		elms.on('focus', evt => evt.target.select());
		elms.on('keyup', evt => { let key = evt.key?.toLowerCase(); if (key == 'enter' || key == 'linefeed') { btnLogin.click() } });
		if (window.boot) window.boot.step()
		return promise_uiResult
	}
	show(e) {
		window.boot?.end();
		let {rootParent, btnLogout} = app;
		for (let elm of [rootParent, btnLogout]) { if (elm?.length) { elm.addClass('jqx-hidden') } }
		return super.show(e)
	}
	hide(e) {
		let {rootParent, btnLogout} = app; for (let elm of [rootParent, btnLogout]) { if (elm?.length) { elm.removeClass('jqx-hidden') } }
		return super.hide(e)
	}
	async loginUserDegisti(e) {
		let {layout} = this; let loginTipi = layout.find('#loginTipi').val()?.trimEnd(), user = layout.find('#user').val()?.trimEnd(); let result;
		try { result = await app.wsLogin({ infoOnly: true, session: new Session({ loginTipi, user }) }) } catch (ex) { console.error(ex); if (window.boot) window.boot.end() }
		let userTextParent = layout.find('#userTextParent'), btnSSOLogin = layout.find('#ssoLogin');
		let {session} = (result || {});
		if (session?.sessionID) {
			let divUserText = userTextParent.children('#userText'), session = result?.session ?? result;
			divUserText.html(`[<b>${session.user || ''}</b>] ${session.userDesc || ''}`); userTextParent.removeClass('jqx-hidden basic-hidden');
			if (session.isSSO || session.hasSSO) { btnSSOLogin.removeClass('jqx-hidden basic-hidden') } else { btnSSOLogin.addClass('jqx-hidden') }
		}
		else { userTextParent.addClass('basic-hidden'); btnSSOLogin.addClass('jqx-hidden') }
	}
	loginIstendi(e) {
		e = e || {}; window.boot?.step()
		let {layout} = this, _session = new Session();
		if (e.sessionID) { _session.sessionID = e.sessionID; _session.useSessionID() }
		else if (e.session) { _session.session = e.session }
		else {
			$.extend(_session, {
				loginTipi: e.loginTipi == null ? layout.find('#loginTipi').val().trimEnd() : e.loginTipi,
				user: e.user == null ? layout.find('#user').val().trimEnd() : e.user,
				pass: e.pass == null ? layout.find('#pass').val().trimEnd() : e.pass
			})
		}
		window.boot?.step()
		let {promise_uiResult} = this;
		return app.wsLogin({ isSSO: e.isSSO, session: _session })
			.then(result => {
				if (promise_uiResult) { promise_uiResult.resolve(result) }
				window.boot?.step(); this.hide()
			})
			.catch(_error => {
				let errorText = getErrorText(_error); this.show();
				createJQXWindow({
					title: 'Oturum Açılamadı', content: errorText, args: { isModal: true, width: 600, height: 300 },
					buttons: { TAMAM: e => { e.close(); setTimeout(() => layout.find(`#user`).focus(), 100) } }
				})
			})
	}
	vazgecIstendi(e) { let {promise_uiResult} = this; if (promise_uiResult) { promise_uiResult.reject({ sessionInfo }) } this.hide() }
	ayarlarIstendi(e) { return app.ayarlarIstendi($.extend({}, e, { parentPart: this })) }
}
