class MQSayacliKA extends MQSayacli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodKullanilirmi() { return true } static get adiKullanilirmi() { return true }
	static logRecDonusturucuDuzenle({ result }) {
		super.logRecDonusturucuDuzenle(...arguments);
		let {kodSaha} = this.class; result[kodSaha] = 'xkod'
	}
	logHVDuzenle({ hv }) {
		super.logHVDuzenle(...arguments);
		hv.xkod = this.kod || ''
	}
}
