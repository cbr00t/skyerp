class DistYonetimApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'ONAY' }
	constructor(e) { e = e || {}; super(e) }
	async runDevam(e) {
		await super.runDevam(e); await this.loginIstendi(e); await this.promise_ready;
		try { await this.yetkiKontrol(e) }
		catch (ex) {
			const wnd = createJQXWindow({ content: getErrorText(ex), title: appName, args: { isModal: true, showCloseButton: false, showCollapseButton: false, width: 450, height: 180 } });
			wnd.find('div > .jqx-window-header').css('background-color', 'firebrick'); return
		}
		await this.xuserTanimYukle(e); await this.anaMenuOlustur(e)
	}
	paramsDuzenle(e) {
		super.paramsDuzenle(e);	 const {params} = e;
		$.extend(params, { yerel: MQYerelParam_DistYonetim.getInstance(), ortak: MQOrtakParam.getInstance() })
	}
	getAnaMenu(e) {
		/* const disabledMenuIdSet = this.disabledMenuIdSet || {}; */
		return new FRMenu({ items: [ new FRMenuChoice({ mnemonic: 'ONAY', text: 'Onay Ekranı', block: e => MQOnay.listeEkraniAc() }) ] })
	}
	async yetkiKontrol(e) {
		const {session} = config; if (session.isAdmin) return
		const decTokens = ['T', 'DISTISK', session.user], [tip, rolKod, user] = await this.wsXEnc(decTokens);
		const sent = new MQSent({
			from: 'puserrol',
			where: [
				{ degerAta: tip, saha: 'tip' },
				{ degerAta: rolKod, saha: 'rolkod' },
				{ degerAta: user, saha: 'kullanicikod' }
			],
			sahalar: ['1 sayi']
		});
		if (asInteger(await this.sqlExecTekilDeger(sent))) return
		throw { isError: true, rc: 'accessDenied', errorText: (
			`<div style="line-height: 33px; margin-top: 13px">` +
				`<div>Sayın (<span class="gray bold">${session.user}</span>) <span class="royalblue bold">${session.userDesc}</span>,</div>` +
				`<div class="firebrick" style="font-size: 120%">Bu modülü kullanmaya yetkiniz yok</div>` +
			`</div>`
		) }
	}
	/*wsX(e) {
		e = e || {}; return ajaxPost({
			timeout: 10 * 60000, processData: false, contentType: wsContentTypeVeCharSet,
			url: app.getWSUrl({ wsPath: 'ws/genel', api: 'x', args: e })
		})
	}*/
}
