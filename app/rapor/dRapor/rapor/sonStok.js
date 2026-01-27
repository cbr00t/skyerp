class DRapor_SonStok extends DRapor_AraSeviye {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get altRaporClassPrefix() { return 'DRapor_SonStok' }
	static get kategoriKod() { return 'STOK' } static get kategoriAdi() { return 'Stok' }
	static get kod() { return 'SONSTOK' } static get aciklama() { return 'Son Stok' }
	static get vioAdim() { return 'ST-LS' } get stokmu() { return true } 
}
class DRapor_SonStok_Main extends DRapor_AraSeviye_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_SonStok } get stokmu() { return this.rapor?.stokmu }
	secimlerDuzenle({ secimler: sec }) {
		let {violetmi} = app
		{
			let grupKod = 'donemVeTarih'
			sec.grupEkle(grupKod, ' ', false)
			sec.secimTopluEkle({
				tarihdekiDurum: new SecimTekilDate({ etiket: '...Tarihindeki durum', grupKod })
			})
			if (violetmi) {
				sec.secimTopluEkle({
					geciciDurum: new SecimTekSecim({
						etiket: 'Geçici Durum', grupKod,
						tekSecim: new BuDigerVeHepsi([`<span>Normal Stok</span>`, `<span class=orangered>Geçici Stok</span>`]).bu()
					})
				})
				{
					let mfSinif = DMQOperasyon, {adiSaha} = mfSinif
					sec.addKA('oper', mfSinif, null, `op.${adiSaha}`, false)
				}
			}
		}
		super.secimlerDuzenle(...arguments)
	}
	tabloYapiDuzenle({ result }) {
		let e = arguments[0]
		super.tabloYapiDuzenle(e)
		let {toplamPrefix} = this.class, {isAdmin, rol} = config.session ?? {}
		let brmDict = app.params?.stokBirim?.brmDict ?? {}
		let brmListe = keys(MQStokGenelParam.tip2BrmListe ?? {})
		result
			.addKAPrefix('sube', 'subegrup')
			.addGrupBasit('SUBE', 'Şube', 'sube', DMQSube)
			.addGrupBasit('SUBEGRUP', 'Şube Grup', 'subegrup', DMQSubeGrup)
		this.tabloYapiDuzenle_stok(e)
		if (isAdmin || !rol?.ozelRolVarmi('XMALYT')) {
			result
				.addToplamBasit('STK_ALIMNETFIYAT', 'Alım Net Fiyat', 'stk_alimnetfiyat', null, null, ({ colDef }) => colDef.tipDecimal(2))
				.addToplamBasit('STK_ORTMALIYET', 'Ort. Maliyet', 'stk_ortmaliyet', null, null, ({ colDef }) => colDef.tipDecimal(2))
				.addToplamBasit('STK_RAYICALIM', 'Rayiç Alım', 'stk_rayicalim', null, null, ({ colDef }) => colDef.tipDecimal(2))
		}
		this.tabloYapiDuzenle_yer(e)
		result.addToplamBasit('MIKTAR', 'Miktar', 'miktar', null, 160, null)
		result.addToplamBasit('MIKTAR2', '2. Miktar', 'miktar2', null, 160, null)
		for (let tip of brmListe) {
			let fra = brmDict[tip]
			result.addToplamBasit(`MIKTAR${tip}`, `Miktar (${tip})`, `miktar${tip}`, null, 160, ({ colDef }) => colDef.tipDecimal(fra))
		}
		if (isAdmin || !rol?.ozelRolVarmi('XMALYT')) {
			result
				.addToplamBasit_bedel('DEG_ALIMNETFIYAT', 'Alım Net Fiyat Değerleme', 'deg_alimnetfiyat')
				.addToplamBasit_bedel('DEG_RAYICALIM', 'Rayiç Alım Değerleme', 'deg_rayicalim')
				.addToplamBasit_bedel('DEG_ORTMALIYET', 'Ort. Maliyet Değerleme', 'deg_ortmaliyet')
				.addToplamBasit_bedel('DEG_SATFIYAT1', '1. Satış Fiyat Değerleme', 'deg_satfiyat1')
		}
		this.tabloYapiDuzenle_hmr(e)
	}
	loadServerData_queryDuzenle({ stm, attrSet }) {
		let PrefixMiktar = 'MIKTAR', e = arguments[0]
		super.loadServerData_queryDuzenle(e)
		let {violetmi} = app, {secimler = this.secimler} = e
		let {value: tarih} = secimler.tarihdekiDurum
		let har = new StokHareketci().withAttrs([
			'ozelisaret', (tarih ? 'tarih' : null),
			'gc', 'stokkod', 'yerkod', 'miktar', 'miktar2',
			(violetmi ? 'opno' : null),
			...Array.from(HMRBilgi).map(_ => _.rowAttr)
		].filter(_ => _))
		let harUni = stm.sent = har.uniOlustur()    // araSeviye.genelDuzenle_son kisminda, union icin => asToplamStm() yapar
		for (let sent of harUni) {
			e.sent = sent
			let {alias2Deger: hv} = sent
			sent.sahalarVeGroupByVeHavingReset()
			let {where: wh, sahalar} = sent
			let {ozelisaret, stokkod, yerkod, opno, gc} = hv
			sent.fromIliski('stkmst stk', `${stokkod} = stk.kod`)
			if (attrSet.DEPO || attrSet.DEPOGRUP)
				sent.x2YerBagla({ kodClause: yerkod })
			if (attrSet.SUBE || attrSet.SUBEGRUP)
				sent.yer2SubeBagla()
			wh.add(`${ozelisaret} <> 'X'`)
			if (tarih)
				wh.add(`${hv.tarih} <= ${tarih.sqlServerDegeri()}`)
			if (violetmi && !MQSQLOrtak.sqlBosDegermi(opno)) {
				let {tekSecim: { hepsimi, bumu: normalmi }} = secimler.geciciDurum
				if (!hepsimi)
					wh.add(`${opno} IS ${normalmi ? 'NULL' : 'NOT NULL'}`)
				let {operKod: sec_opNo} = secimler
				if (sec_opNo)
					wh.basiSonu(sec_opNo, opno)
			}
			let getKMiktarClause = clause => `(case when ${gc} = 'C' then (0 - ${clause}) else ${clause} end)`
			let miktarClause = getKMiktarClause(hv.miktar.sumOlmaksizin())
			let miktar2Clause = getKMiktarClause(hv.miktar2.sumOlmaksizin())
			let degMiktarClause = `(case when stk.almfiyatmiktartipi = '2' then ${miktar2Clause} else ${miktarClause} end)`
			for (let key in attrSet) {
				switch (key) {
					case 'SUBE': {
						sahalar.add('yer.bizsubekod subekod', 'sub.aciklama subeadi')
						wh.icerikKisitDuzenle_sube({ ...e, saha: 'yer.bizsubekod' })
						break
					}
					case 'SUBEGRUP': {
						sent.sube2GrupBagla()
						sahalar.add('sub.isygrupkod subegrupkod', 'igrp.aciklama subegrupadi')
						wh.icerikKisitDuzenle_subeGrup({ ...e, saha: 'sub.isygrupkod' })
						break
					}
					case 'DEPO': {
						sahalar.add(`${hv.yerkod} yerkod`, 'yer.aciklama yeradi')
						wh.icerikKisitDuzenle_yer({ ...e, saha: hv.yerkod })
						break
					}
					case 'DEPOGRUP': {
						sent.yer2GrupBagla()
						sahalar.add('yer.yergrupkod yergrupkod', 'ygrp.aciklama yergrupadi')
						wh.icerikKisitDuzenle_yerGrup({ ...e, saha: 'yer.yergrupkod' })
						break
					}
					case 'STK_ALIMNETFIYAT': {
						sahalar.add('stk.almnetfiyat stk_alimnetfiyat')
						break
					}
					case 'STK_ORTMALIYET': {
						sahalar.add('stk.ortmalfiyat stk_ortmaliyet')
						break
					}
					case 'STK_RAYICALIM': {
						sahalar.add(`(case when stk.revizerayicalimfiyati < stk.almnetfiyat then stk.almnetfiyat else stk.revizerayicalimfiyati end) stk_rayicalim`)
						break
					}
					case 'DEG_ALIMNETFIYAT': {
						sahalar.add(`SUM(ROUND(${degMiktarClause} * stk.almnetfiyat, 2)) deg_alimnetfiyat`)
						break
					}
					case 'DEG_ORTMALIYET': {
						sahalar.add(`SUM(ROUND(${degMiktarClause} * stk.ortmalfiyat, 2)) deg_ortmaliyet`)
						break
					}
					case 'DEG_RAYICALIM': {
						sahalar.add(`SUM(ROUND(${degMiktarClause} * stk.revizerayicalimfiyati, 2)) deg_rayicalim`)
						break
					}
					case 'DEG_SATFIYAT1': {
						sahalar.add(`SUM(ROUND(${degMiktarClause} * stk.satfiyat1, 2)) deg_satfiyat1`)
						break
					}
					/*case 'SATISCIRO': {
						sahalar.add(`SUM(${degMiktarClause} * stk.satfiyat1) satisciro`)
						break
					}*/
					case PrefixMiktar: {
						sahalar.add(`SUM(${miktarClause}) miktar`)
						break
					}
					case `${PrefixMiktar}2`: {
						sahalar.add(`SUM(${miktar2Clause}) miktar2`)
						break
					}
					default: {
						if (key.startsWith(PrefixMiktar)) {
							let brmTip = key.slice(PrefixMiktar.length)?.toUpperCase()
							sahalar.add(
								`${this.getBrmliMiktarClause({
									brmTip, mstAlias: 'stk', harAlias: 'har',
									getMiktarClause: (_, k) => hv[k].sumOlmaksizin() })} miktar${brmTip}`
							)
						}
						break
					}
				}
			}
			this.loadServerData_queryDuzenle_stok({ ...e, sent, kodClause: stokkod })
			this.loadServerData_queryDuzenle_hmrBasit({ ...e, sent, hv })
		}
	}
}
