class MQSayacli extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sayacSaha() { return 'kaysayac' } static kami() { return this.kodKullanilirmi }
	static get kodKullanilirmi() { return false } static get adiKullanilirmi() { return false }
	static get kodSaha() { return this.kodKullanilirmi ? MQKA.kodSaha : this.sayacSaha } static get bosKodAlinirmi() { return false }
	static get adiSaha() { return this.adiKullanilirmi ? MQKA.adiSaha : null }
	static get kodEtiket() { return MQKA.kodEtiket } static get adiEtiket() { return MQKA.adiEtiket }
	static get offlineSahaListe() {
		return [
			...super.offlineSahaListe,
			this.sayacSaha,
			this.kodKullanilirmi ? this.kodSaha : null,
			this.adiKullanilirmi ? this.adiSaha : null
		].filter(x => !!x)
	}
	static get primaryKeys() { return [this.idSaha] }
	static get zeminRenkDesteklermi() { return MQKA.zeminRenkDesteklermi }
	static get offlineDirect() { return this.kodKullanilirmi }
	
	constructor(e = {}) { super(e) /* this.sayac = this.sayac || 0 */ }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		let {kodKullanilirmi, adiKullanilirmi, adiSaha} = this
		pTanim.sayac = new PInst()
		if (kodKullanilirmi)
			pTanim.kod = new PInstStr() 
		if (adiKullanilirmi)
			pTanim.aciklama = new PInstStr(adiSaha)
	}
	static ekCSSDuzenle(e) { super.ekCSSDuzenle(e); MQKA.ekCSSDuzenle(e) }
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		sec.secimTopluEkle({
			instKod: new SecimString({ mfSinif: this, hidden: !this.kodKullanilirmi }),
			instAdi: new SecimOzellik({ etiket: `${this.sinifAdi} Adı`, hidden: !this.adiKullanilirmi })
		})
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
			let {tableAlias: alias, kodKullanilirmi, adiKullanilirmi, kodSaha, adiSaha} = this
			if (kodKullanilirmi)
				wh.basiSonu(sec.instKod, `${alias}.${kodSaha}`)
			if (adiKullanilirmi)
				wh.ozellik(sec.instAdi, `${alias}.${adiSaha}`)
		})
	}
	static secimlerDuzenleSon({ secimler: sec }) {
		super.secimlerDuzenleSon(...arguments)
		sec.grupTopluEkle([ { kod: 'teknik', aciklama: 'Teknik', renk: '#eee', zeminRenk: 'orangered', kapalimi: true } ])
		sec.secimTopluEkle({ sayac: new SecimInteger({ etiket: 'ID', grupKod: 'teknik' }) })
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
			let {tableAlias: alias, sayacSaha} = this
			wh.basiSonu(sec.sayac, `${alias}.${sayacSaha}`)
		})
	}
	static standartGorunumListesiDuzenle({ liste }) {
		super.standartGorunumListesiDuzenle(...arguments)
		let {kodKullanilirmi, adiKullanilirmi, kodSaha, adiSaha} = this
		if (kodKullanilirmi)
			liste.push(kodSaha)
		if (adiKullanilirmi)
			liste.push(adiSaha)
	}
	static orjBaslikListesiDuzenle(e) { super.orjBaslikListesiDuzenle(e); e.mfSinif = this; MQKA.orjBaslikListesiDuzenle(e) }
	static rootFormBuilderDuzenle(e) { super.rootFormBuilderDuzenle(e); e.mfSinif = this; MQKA.rootFormBuilderDuzenle(e) }
	static getFormBuilders_ka(e) { let _e = { ...e, liste: [] }; this.formBuildersDuzenle_ka(_e); return e.liste }
	static formBuildersDuzenle_ka(e) { MQKA.formBuildersDuzenle_ka(e) }
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e)
		let {aliasVeNokta, sayacSaha, kodKullanilirmi, kodSaha, adiKullanilirmi, adiSaha, zeminRenkDesteklermi} = this
		let {sent, sent: { sahalar }} = e
		if (sayacSaha && !sahalar.liste.find(saha => saha.alias == sayacSaha))
			sahalar.add(`${aliasVeNokta}${sayacSaha}`)
		if (kodKullanilirmi && kodSaha && !sahalar.liste.find(saha => saha.alias == kodSaha))
			sahalar.add(`${aliasVeNokta}${kodSaha}`)
		if (adiKullanilirmi && adiSaha && !sahalar.liste.find(saha => saha.alias == adiSaha))
			sahalar.add(`${aliasVeNokta}${adiSaha}`)
		if (zeminRenkDesteklermi)
			sahalar.add(`${aliasVeNokta}oscolor`)
	}
	tekilOku_queryDuzenle(e) {
		super.tekilOku_queryDuzenle(e)
		let {sayac, kod, class: { aliasVeNokta, sayacSaha, kodKullanilirmi, kodSaha}} = this
		let {sent, sent: { where: wh }} = e
		if (sayacSaha && sayac) { wh.liste = []; wh.degerAta(sayac, `${aliasVeNokta}${sayacSaha}`) }
		else if (kodKullanilirmi && kodSaha && kod) { wh.degerAta(kod, `${aliasVeNokta}${kodSaha}`) }
	}
	async yaz(e) {
		let result = await super.yaz(e); if (result === false) { return result }
		await this.sayacBelirle(e); return result
	}
	async sayacBelirle(e) {
		e = e ?? {}; let {sayacSaha, table} = this.class; if (!sayacSaha) { return null }
		let hv = this.alternateKeyHostVars(e); if ($.isEmptyObject(hv)) { return null }
		let offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {trnId} = e;
		let query = new MQSent({ from: table, where: { birlestirDict: hv }, sahalar: [sayacSaha] });
		let sayac = this.sayac = await this.sqlExecTekilDeger({ offlineMode, trnId, query });
		if (!sayac) throw { isError: true, rc: 'sayacBelirlenemedi', errorText: 'Kaydedilen fiş belirlenemedi' }
		return sayac
	}
	kopyaIcinDuzenle(e) {
		super.kopyaIcinDuzenle(e);
		let {sayacSaha} = this.class; if (sayacSaha) { this.sayac = null }
	}
	static logRecDonusturucuDuzenle({ result }) {
		super.logRecDonusturucuDuzenle(...arguments);
		let {sayacSaha, kodKullanilirmi, kodSaha} = this
		result[sayacSaha] = 'xsayac'
		if (kodKullanilirmi)
			result[kodSaha] = 'xkod'
	}
	logHVDuzenle({ hv }) {
		super.logHVDuzenle(...arguments)
		let {kodKullanilirmi} = this.class
		hv.xsayac = this.sayac || 0
		if (kodKullanilirmi)
			hv.xkod = this.kod || ''
	}
	keyHostVarsDuzenle({ hv, queryBuild, offlineRequest, offlineMode }) {
		super.keyHostVarsDuzenle(...arguments)
		let {sayac, kod, class: { sayacSaha, kodKullanilirmi, kodSaha }} = this
		if (sayacSaha && sayac)
			hv[sayacSaha] = sayac
	}
	keySetValues({ rec }) {
		super.keySetValues(...arguments)
		let {sayacSaha, kodKullanilirmi, kodSaha} = this.class
		if (sayacSaha) {
			let value = rec?.[sayacSaha]
			if (value != null)
				this.sayac = value
		}
		if (kodKullanilirmi && kodSaha) {
			let value = rec?.[kodSaha]
			if (value != null)
				this.kod = value
		}
	}
	alternateKeyHostVarsDuzenle({ hv }) {
		super.alternateKeyHostVarsDuzenle(...arguments)
		let {kodKullanilirmi, kodSaha} = this.class
		if (kodKullanilirmi)
			hv[kodSaha] = this.kod
		else
			delete hv[kodSaha]
	}
	hostVarsDuzenle({ hv, queryBuild, offlineRequest, offlineMode }) {
		super.hostVarsDuzenle(...arguments)
		let {sayacSaha} = this.class
		$.extend(hv, this.alternateKeyHostVars(e))
		if (sayacSaha) {
			if ((queryBuild || (offlineRequest && !offlineMode)))
				hv[sayacSaha] = this.sayac ?? null
			else
				delete hv[sayacSaha]
		}
		if (this.class.zeminRenkDesteklermi)
			hv.oscolor = html2OSColor(this.zeminRenk) || 0
	}
	setValues({ rec: oscolor } = {}) {
		super.setValues(...arguments)
		let {zeminRenkDesteklermi} = this.class
		if (zeminRenkDesteklermi)
			this.zeminRenk = oscolor ? os2HTMLColor(oscolor) : ''
	}
	inExp_setValues({ rec }) {
		super.inExp_setValues(...arguments)
		/*let {guidmi} = this.class; if (!guidmi) { this.sayac = null } */
		this.sayac = null
	}
	static async sayacVarmi(e = {}, _zorunlumu) {
		let sayac = typeof e == 'object' ? e.sayac : e
		let zorunlumu = _zorunlumu ?? (typeof e == 'object' ? e.zorunlu ?? e.zorunlumu : null)
		if (zorunlumu && !sayac)
			return false
		return !sayac || await new this({ sayac }).varmi(e)
	}
	static getGridKolonGrup(e = {}) {
		e.mfSinif = e.mfSinif ?? this
		return MQKA.getGridKolonGrup(e)
	}
	cizgiliOzet(e) { return new CKodVeAdi(this).cizgiliOzet(e) }
	parantezliOzet(e) { return new CKodVeAdi(this).parantezliOzet(e) }
	toString(e) { return this.parantezliOzet(e) }
	setId(value) { this.sayac = value; return this }
}
