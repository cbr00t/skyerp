class MQTabPlasiyer extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PLASIYER' } static get sinifAdi() { return 'Plasiyer' }
	static get table() { return MQTabCari.table } static get tableAlias() { return 'pls' }
	static get onlineIdSaha() { return MQTabCari.onlineIdSaha } static get kayitTipi() { return 'X' }
	static get offlineSahaListe() { return [...super.offlineSahaListe, ...this.offlineEkSahaListe] }
	static get offlineEkSahaListe() { return ['kayittipi'] }
	static get createTableYapilmazmi() { return true }

	static async loadServerData({ offlineRequest, offlineMode } = {}) {
		// cache
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			return []
		}
		return await super.loadServerData(...arguments)
	}
	static varsayilanKeyHostVarsDuzenle({ hv }) {
		super.varsayilanKeyHostVarsDuzenle(...arguments)
		let {kayitTipi: kayittipi} = this
		extend(hv, { kayittipi })
	}
	static loadServerData_queryDuzenle_son(e) {
		super.loadServerData_queryDuzenle_son(e)
		let { alias = this.tableAlias, offlineRequest, offlineMode, stm, sent } = e
		let { where: wh, sahalar } = sent
		let { kodSaha, adiSaha, onlineIdSaha, offlineEkSahaListe } = this
		sahalar.add(offlineEkSahaListe.map(saha => `${alias}.${saha}`))
		if (offlineRequest) {
			if (offlineMode) {
				// Bilgi Gönder
				sahalar.add(
					`${alias}.${kodSaha} ${onlineIdSaha}`,
					`SUBSTRING(${alias}.${adiSaha}, 50) unvan1`,
					`SUBSTRING(${alias}.${adiSaha}, 51, 100) unvan2`
				)
			}
			else {
				// Bilgi Yükle
				let {session: { loginTipi, user } = {}} = config
				{
					let match = `${alias}.${kodSaha}`
					let replace = `${alias}.${onlineIdSaha}`
					let {liste} = wh
					liste.forEach((clause, i) => {
						if (clause?.includes?.(match))
							liste[i] = clause = clause.replaceAll(match, replace)
					})
				}
				wh.add(
					`${alias}.silindi = ''`, `${alias}.calismadurumu <> ''`,
					`${alias}.satilamazfl = ''`
				)
				if (loginTipi == 'plasiyerLogin' && user)
					wh.degerAta(user, `${alias}.${onlineIdSaha}`)
				sahalar.add(
					`${alias}.${onlineIdSaha} ${kodSaha}`,
					`RTRIM(LTRIM(${alias}.unvan1 + ' ' + ${alias}.unvan2)) ${adiSaha}`
				)
			}
		}
		stm = e.stm
		sent = wh = sahalar = null
	}
}

class MQTabMustahsil extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'MUSTAHSIL' } static get sinifAdi() { return 'Müstahsil' }
	static get table() { return MQTabCari.table } static get tableAlias() { return 'mus' }
	static get onlineIdSaha() { return MQTabCari.onlineIdSaha } static get kayitTipi() { return 'M' }
	static get offlineSahaListe() { return [...super.offlineSahaListe, ...this.offlineEkSahaListe] }
	static get offlineEkSahaListe() { return ['kayittipi'] }
	static get createTableYapilmazmi() { return true }
	
	static varsayilanKeyHostVarsDuzenle({ hv }) {
		super.varsayilanKeyHostVarsDuzenle(...arguments)
		let { kayitTipi: kayittipi } = this
		extend(hv, { kayittipi })
	}
	static async loadServerData({ basit, sender, offlineRequest, offlineMode }) {
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			return []
		}

		let { rotaDisiMusteriAlinirmi: rotaDisi } = app.params?.tablet ?? {}
		let { rotaKullanilirmi } = app
		if (!(basit || offlineRequest)) {
			// cache
			let classes = []
			if (rotaKullanilirmi && !rotaDisi)
				classes.push(MQTabRota)
			if (!empty(classes)) {
				await Promise.allSettled(classes.map(cls => cls.getGloKod2Rec()))
				await Promise.allSettled(classes.map(cls => cls.loadServerData()))
			}
		}
		
		let recs = await super.loadServerData(...arguments)
		if (basit || empty(recs) || (offlineRequest && offlineMode))
			return recs

		if (rotaKullanilirmi && !rotaDisi) {
			let inst = sender?.inst ?? app.activeWndPart?.inst ?? {}
			let globals = MQTabRota.globals ?? {}
			let { cachedRecs, mustKodSet } = globals
			let rotaID = inst?.rotaID?.toString()
			if (rotaID && cachedRecs)
				cachedRecs = cachedRecs.filter(r => r.rotaID == rotaID)
			// !! her seferinde global override. sonraki liste tazelemeler için
			mustKodSet = globals.mustKodSet =
				rotaID
					? asSet(cachedRecs?.map(r => r.mustKod)) ?? mustKodSet
					: null
			
			if (mustKodSet) {
				let { kodSaha } = this
				recs = recs.filter(r =>
					mustKodSet[r[kodSaha]])
			}
		}
		
		return recs
	}
	static loadServerData_queryDuzenle_son(e) {
		super.loadServerData_queryDuzenle_son(e)
		let { alias = this.tableAlias, offlineRequest, offlineMode, stm, sent } = e
		let { where: wh, sahalar } = sent
		let { kodSaha, adiSaha, onlineIdSaha, offlineEkSahaListe } = this
		sahalar.add(offlineEkSahaListe.map(saha => `${alias}.${saha}`))
		if (offlineRequest) {
			if (offlineMode) {
				// Bilgi Gönder
				sahalar.add(
					`${alias}.${kodSaha} ${onlineIdSaha}`,
					`SUBSTRING(${alias}.${adiSaha}, 50) unvan1`,
					`SUBSTRING(${alias}.${adiSaha}, 51, 100) unvan2`
				)
			}
			else {
				// Bilgi Yükle
				let {session: { loginTipi, user } = {}} = config
				{
					let match = `${alias}.${kodSaha}`
					let replace = `${alias}.${onlineIdSaha}`
					let {liste} = wh
					liste.forEach((clause, i) => {
						if (clause?.includes?.(match))
							liste[i] = clause = clause.replaceAll(match, replace)
					})
				}
				wh.add(
					`${alias}.silindi = ''`, `${alias}.calismadurumu <> ''`,
					`${alias}.satilamazfl = ''`
				)
				if (user && loginTipi == 'musteriLogin')
					wh.degerAta(user, `${alias}.${onlineIdSaha}`)
				sahalar.add(
					`${alias}.${onlineIdSaha} ${kodSaha}`,
					`RTRIM(LTRIM(${alias}.unvan1 + ' ' + ${alias}.unvan2)) ${adiSaha}`
				)
			}
		}
		stm = e.stm
		sent = wh = sahalar = null
	}
}
