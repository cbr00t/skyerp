class MQEMailUst extends MQSayacli {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kodListeTipi() { return 'AMPAR' }
	static get sinifAdi() { return 'Alternatif Mail Parametresi' } static get table() { return 'ORTAK..oaltmailparam' } static get tableAlias() { return 'mpar' }
	static get eMailKeys() {
		let {_eMailKeys: result} = this;
		if (result == null) { result = this._eMailKeys = ['ozelPortFlag', 'smtpServer',  'port', 'sslmi', 'from', 'user', 'pass'] }
		return result
	}
	get defaultPort() { return this.class.getDefaultPort(this.sslmi) }
	get asWSEMailArgs() { let args = {}; this.wsEMailArgsDuzenle({ args }); return args }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments); $.extend(pTanim, {
			smtpServer: new PInstStr('smtpserver'), port: new PInstNum('smtpport'),
			user: new PInstStr('smtpuser'), pass: new PInstStr('smtppass'), sslmi: new PInstBool('sslmi'),
			from: new PInstStr('gondericiemail')
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments); sec.secimTopluEkle({
			smtpServer: new SecimOzellik({ etiket: 'SMTP Server' }),
			user: new SecimOzellik({ etiket: 'Kullanıcı' }),
			from: new SecimOzellik({ etiket: 'Gönderici e-Mail' })
		}).whereBlockEkle(({ where: wh, secimler: sec }) => {
			const {aliasVeNokta} = this;
			wh.ozellik(sec.smtpServer, `${aliasVeNokta}smtpserver`).ozellik(sec.user, `${aliasVeNokta}smtpuser`);
			wh.ozellik(sec.from, `${aliasVeNokta}gondericiemail`)
		})
	}
	static rootFormBuilderDuzenle({ tanimFormBuilder: tanimBuilder }) {
		super.rootFormBuilderDuzenle(...arguments);
		this.formBuilder_addTabPanelWithGenelTab(e); let {tabPanel, tabPage_genel} = e;
		form = tabPage_genel.addFormWithParent().yanYana(3);
			form.addTextInput('smtpServer', 'SMTP Server'); form.addNumberInput('port', 'Port'); form.addCheckbox('sslmi', 'SSL');
			form.addTextInput('user', 'Kullanıcı').degisince(({ value, builder: fbd }) => { let {altInst} = fbd; if (!altInst.from) { altInst.from = value } });
			form.addPassInput('pass', 'Şifre'); form.addTextInput('from', 'Gönderici e-Mail')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); liste.push(
			new GridKolon({ belirtec: 'smtpserver', text: 'SMTP Server', genislikCh: 25 }),
			new GridKolon({ belirtec: 'smtpport', text: 'Port', genislikCh: 8 }).tipNumerik(),
			new GridKolon({ belirtec: 'sslmi', text: 'SSL', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'smtpuser', text: 'Kullanıcı', genislikCh: 30 }),
			new GridKolon({ belirtec: 'gondericiemail', text: 'Gönderici e-Mail', genislikCh: 30 })
		)
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments); const {aliasVeNokta} = this;
		const {sahalar} = sent; sahalar.add(`${aliasVeNokta}smtppass`)
	}
	alternateKeyHostVarsDuzenle({ hv }) {
		super.alternateKeyHostVarsDuzenle(...arguments);
		hv.smtpuser = this.smtpuser
	}
	static getDefaultPort(sslmi) { return sslmi ? 587 : 465 }
	static wsEMailArgsDuzenle({ inst, args }) {
		if (!(inst && args)) { return false }
		let donusum = { sslmi: 'ssl' }
		for (let key of this.eMailKeys) {
			let value = inst[key]; if (value == null) { continue }
			let newKey = donusum[key] ?? key; if (newKey == 'ssl' && !value) { value = inst.defaultPort }
			args[newKey] = value
		}
		return true
	}
	wsEMailArgsDuzenle(e) { return this.class.wsEMailArgsDuzenle({ ...e, inst: this }) }
}
class MQEMail extends MQEMailUst {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kodListeTipi() { return 'OMPAR' }
	static get sinifAdi() { return 'Özel Mail Parametresi' } static get table() { return 'ORTAK..omailparam' }
}
