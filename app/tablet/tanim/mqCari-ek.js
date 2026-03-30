class MQTabPlasiyer extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PLASIYER' } static get sinifAdi() { return 'Plasiyer' }
	static get table() { return MQTabCari.table } static get tableAlias() { return 'pls' }
	static get onlineIdSaha() { return MQTabCari.onlineIdSaha } static get kayitTipi() { return 'X' }
	static get offlineSahaListe() { return [...super.offlineSahaListe, ...this.offlineEkSahaListe] }
	static get offlineEkSahaListe() { return ['kayittipi'] }
	static get createTableYapilmazmi() { return true }
	
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

class MQTabCariBakiye extends MQKodOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'CARBAKIYE' } static get sinifAdi() { return 'Cari Bakiye' }
	static get table() { return 'carbakiye' } static get tableAlias() { return 'bak' }
	static get onlineIdSaha() { return 'must' }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, {
			orjBakiye: new PInstNum('orjbakiye'),
			bakiye: new PInstNum('bakiye'),
			vadeliAlacak: new PInstNum('vadelialacak')
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'unvan', text: 'Ünvan', sql: 'car.aciklama' }),
			new GridKolon({ belirtec: 'bakiye', text: 'Bakiye', genislikCh: 17 }).tipDecimal(),
			new GridKolon({ belirtec: 'vadelialacak', text: 'Vadeli Alacak', genislikCh: 17 }).tipDecimal()
		)
	}
	static loadServerData_queryDuzenle_son(e) {
		super.loadServerData_queryDuzenle_son(e)
		let { alias = this.tableAlias, offlineRequest, offlineMode, stm, sent } = e
		let { where: wh, sahalar } = sent
		let { kodSaha, adiSaha, onlineIdSaha } = this
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			sahalar.liste = []
			sent.fromIliski('carmst car', `${alias}.must = car.must`)
			wh
				// .add(`${alias}.must <> ''`)    // MQKod yapı onlineIdSaha için ekledi
				.inDizi(['', 'M'], 'car.kontipkod')
			sahalar.add(
				`${alias}.must ${kodSaha}`, `SUM(${alias}.bakiye) orjbakiye`, `SUM(${alias}.bakiye) bakiye`,
				`0 vadelialacak`
			)
			sent.groupByOlustur()
		}
		else
			sent.fromIliski('carmst car', `${alias}.${kodSaha} = car.kod`)
	}
	static async bakiyeRiskDuzenle(e) {
	}
}
