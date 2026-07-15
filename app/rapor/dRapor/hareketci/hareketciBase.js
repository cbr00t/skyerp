class DRapor_Hareketci extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return this == DRapor_Hareketci } static get hareketciSinif() { return null }
	// static get oncelik() { return 20 }
	static get hareketcimi() { return true }
	static get oncelik() { return this.hareketciSinif.oncelik } static get uygunmu() { return this.mainClass?.hareketciSinif?.uygunmu ?? true }
	static get yatayAnalizVarmi() { return this.totalmi } static get ozetVarmi() { return this.totalmi } static get chartVarmi() { return this.totalmi }
	static get totalmi() { return !(this.hareketmi || this.envantermi) }
	static get hareketmi() { return false }
	static get envantermi() { return false }
	static get sadeceTotalmi() { return false }
	static get kod() {
		let {_kod: result, kodEk: ek} = this
		if (ek && result)
			result = `${ek}_${result.replace('TOTAL', '')}`
		return result
	}
	static get aciklama() {
		let {_aciklama: result, aciklamaEk: ek} = this
		if (ek && result)
			result = `${result.replace('Total', '')} ${ek}`
		return result
	}
	static get _kod() { return `${this.hareketciSinif?.kod?.toUpperCase()}HAR` }
	static get _aciklama() { return this.hareketciSinif?.aciklama || super.aciklama }
	static get kategoriKod() { return `FIN${this.totalmi ? '' : `-${this.kodEk}`}` }
	static get kategoriAdi() { return `<b class=royalblue>${this.aciklamaEk}</b>` }
	static get kodEk() {
		let {hareketmi, envantermi} = this
		return hareketmi ? 'HAR' : envantermi ? 'ENV' : ''
	}
	static get aciklamaEk() {
		let {hareketmi, envantermi} = this
		return hareketmi ? 'Hareket' : envantermi ? 'Envanter' : 'Total'
	}

	async ilkIslemler(e) {
		await super.ilkIslemler(e)
		await MQVergiKdv.getKod2VergiBilgi()
	}
	islemTuslariArgsDuzenle({ liste, part: butonPart }) {
		let { class: { sabitmi } } = this
		let items = [
			{ id: 'izle', handler: _e => this.main.hareketKartiGoster({ ...e, ..._e }) }
		].filter(Boolean)
		
		let ind = liste.indexOf(r => r.id == 'tazele') ?? -1
		liste.splice(ind - 1, 0, ...items)

		let sagIdSet = butonPart.ekSagButonIdSet ??= {}
		extend(sagIdSet, asSet(items.map(r => r.id)))
		
		super.islemTuslariArgsDuzenle(...arguments)
	}
	
	static autoGenerateSubClasses(e) {
		let subNames = ['Hareket', 'Envanter'];
		let { raporBilgiler } = this
		let evalList = []
		for (let { kod, cls } of raporBilgiler) {
			let parent
			;{
				let {mainClass, sadeceTotalmi, name} = cls
				if (!mainClass || sadeceTotalmi)
					continue
				let {name: mainName} = mainClass
				parent = { cls, name, mainClass, mainName }
			}
			for (let subPostfix of subNames) {
				let selector = subPostfix.toLowerCase();
				let sub = { name: `${parent.name}_${subPostfix}`, selector };
				extend(sub, { mainName: `${sub.name}_Main` })
				evalList.push(
					`class ${sub.name} extends ${parent.name} {`,
					`	static { window[this.name] = this; this._key2Class[this.name] = this }`,
					`	static get uygunmu() { return true /*config.dev*/ } static get ${selector}mi() { return true }`,
					'}',
					`class ${sub.mainName} extends ${parent.mainName} {`,
					`	static { window[this.name] = this; this._key2Class[this.name] = this }`,
					`	static get raporClass() { return ${sub.name} }`,
					'}'
				)
			}
		}
		if (evalList.length)
			eval(evalList.join(CrLf))
		delete this._kod2Sinif    /* cache reset */
		return this
	}
}

class DRapor_Hareketci_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get hareketcimi() { return true } 
	static get hareketciSinif() { return this.raporClass?.hareketciSinif } static get secimWhereBaglanirmi() { return false }
	static get totalmi() { return this.raporClass.totalmi } static get hareketmi() { return this.raporClass.hareketmi }
	static get envantermi() { return this.raporClass.envantermi }
	static get ticarimi() { return false }

	async onGridInit(e) {
		let result = await super.onGridInit(e)
		let { gridPart } = this
		let { grid } = gridPart
		grid.on('rowDoubleClick', _e => {
			let { args = {} } = _e
			let { row: rec } = args
			try { this.hareketKartiGoster({ ..._e, ...e, rec }) }
			catch (ex) {
				hConfirm(getErrorText(ex), 'Hareket Kartı Göster')
				throw ex
			}
		})
		return result
	}
	onInit(e) {
		super.onInit(e)
		let { hareketciSinif } = this.class
		if (hareketciSinif)
			this.hareketci = new hareketciSinif()
	}
	tazele(e) {
		let { rapor: { isPanelItem }, class: { totalmi } } = this
		let { secimler: sec = {} } = this, { tarihBS } = sec
		if (!(isPanelItem || totalmi || tarihBS?.basi || this.secimlerIstendimi)) {
			this.secimlerIstendi()
			this.secimlerIstendimi = true
			return
		}
		return super.tazele(e)
	}
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		let grupKod = 'donemVeTarih'
		let { hareketci, class: { totalmi }} = this
		let { hareketTipSecim: tekSecim } = hareketci?.class ?? {}
		
		let liste = {}
		if (tekSecim)
			liste.tip = new SecimBirKismi({ etiket: 'Tip', tekSecim, grupKod }).birKismi().autoBind()
		
		if (totalmi)
			liste._id = new SecimBirKismi({ etiket: 'ID' }).hidden()
		else
			liste.devirAlinmasin = new SecimBool({ grupKod, etiket: `Devir <b class=firebrick>AlınMAsın</b>` })
		if (!empty(liste))
			sec.secimTopluEkle(liste)
		if (!totalmi) {
			let { donem, tarihAralik } = sec
			donem?.tekSecim?.tarihAralik?.()
			if (tarihAralik) {
				tarihAralik.visible()
				tarihAralik.sonu = tarihAralik.sonu || today()
			}
		}

		sec.whereBlockEkle(({ aliasVeNokta = '', where: wh, secimler: sec, hvDegeri }) => {
			;{
				let cl = hvDegeri('kaysayac') ?? hvDegeri('sayac') ?? hvDegeri('id')
				if (cl)
					wh.birKismi(sec._id, aliasVeNokta + cl)
			}
		})

		/*let { muhasebemi } = this.class
		;{
			let mfSinif = muhasebemi ? DMQMuhIslem : DMQStokIslem
			sec.addKA('isl', mfSinif, ({ hv }) => hv.islkod, ({ hv }) => hv.isladi, false)
		}*/
	}
	super_secimlerDuzenle(e) { super.secimlerDuzenle(e) }
	superSuper_secimlerDuzenle(e) { super.super_secimlerDuzenle(e) }
	secimlerInitEvents(e) {
		super.secimlerInitEvents(e)
		let { secimlerPart } = this
		secimlerPart?.acilinca(({ sender: secimlerPart }) => setTimeout(() => {
			let { secim2Info } = secimlerPart
			if (!secim2Info)
				return
			let { hareketci } = this
			let part = secim2Info?.tip?.element?.find('.ddList')?.data('part')
			let timer_set
			part?.degisince(({ value }) => {
				clearTimeout(timer_set)
				timer_set = setTimeout(() => 
					hareketci.uygunluk = empty(value) ? null : asSet(value),
					1)
			})
		}, 50))
	}
	tabloYapiDuzenle({ result }) {
		let e = arguments[0]
		super.tabloYapiDuzenle(e)
		let { ticarimi, muhasebemi, totalmi } = this.class
		result.addKAPrefix('isl')
		if (ticarimi)
			result.addKAPrefix('althesap', 'ref')
		this.tabloYapiDuzenle_ozelIsaret(e)
		this.tabloYapiDuzenle_sube(e)
		result.addGrupBasit('FISNOX', 'Fis No', 'fisnox', null, null, ({ item }) => item.secimKullanilir())
		if (ticarimi) {
			result.addGrupBasit('ALTHESAP', 'Alt Hesap', 'althesap', DMQAltHesap)
			result.addGrupBasit('REF', 'Referans', 'ref', null, null, ({ item }) => item.setOrderBy('refadi'))
		}
		result.addGrupBasit('ANAISLEM', 'Ana İşlem', 'anaislemadi')
		result.addGrupBasit('ISL', 'İşlem', 'isl', (muhasebemi ? DMQMuhIslem : DMQStokIslem))
		if (ticarimi) {
			this.tabloYapiDuzenle_plasiyer(e)
			this.tabloYapiDuzenle_takip(e)
			result
				.addGrupBasit('DVKOD', 'Dv.Kod', 'dvkod')
				.addGrupBasit('DVKUR', 'Dv.Kur', 'dvkur', null, null, ({ item, colDef }) => { item.noOrderBy(); colDef.tipDecimal() })
				.addGrupBasit('KDVKOD', 'Kdv Kod', 'kdvkod', null, 8, ({ item }) => item.setSql_hv())
				.addGrupBasit_numerik('KDVORANI', 'Kdv%', 'kdvorani', null, 8, ({ item }) => {
					item
						.setOrderBy('kdvkod')
						.setFormul(
							['KDVKOD'],
							({ rec: { kdvkod: kod } }) => {
								let { kdv: { kod2VergiBilgi: d = {} } = {} } = MQVergi.globals?.belirtec2Globals ?? {}
								return d[kod]?.oran || 0
							}
						)
				})
				.addToplamBasit('TOPKDV', 'KDV', 'topkdv', null, null, ({ item }) => item.setSql_hv())
			
			this.tabloYapiDuzenle_baBedel(e)
			this.tabloYapiDuzenle_baBakiye(e)
			this.tabloYapiDuzenle_dovizli_baBedel(e)
			this.tabloYapiDuzenle_dovizli_baBakiye(e)
			if (!totalmi)
				result.addGrupBasit('ACIKLAMA', 'Açıklama', 'aciklama', null, null, ({ item }) => item.setSql_hv())
		}
	}
	super_tabloYapiDuzenle(e) { super.tabloYapiDuzenle(e) }
	superSuper_tabloYapiDuzenle(e) { super.super_tabloYapiDuzenle(e) }
	tabloYapiDuzenle_odemeGun(e) { /* do nothing */ }
	super_tabloYapiDuzenle_odemeGun(e) { super.tabloYapiDuzenle_odemeGun(e) }
	async loadServerDataInternal(e = {}) {
		let { hareketci } = e
		e.rapor = this
		hareketci ??= this.hareketci
		let { secimler, raporTanim, class: { totalmi } } = this
		let { value: devirAlinmasin } = secimler.devirAlinmasin ?? { value: true }
		let { attrSet, donemBS } = e, {basi: tarihBasi} = donemBS ?? {}
		attrSet ??= raporTanim.attrSet
		if (!(totalmi || attrSet.TARIH))
			devirAlinmasin = true
		
		await hareketci?.class?.ilkIslemler(e)

		// let harGosterCode = totalmi ? 'app.activeWndPart.inst.main.hareketKartiGoster()' : null
		let harGosterCode = null

		let result
		let addRecs = recs => {
			if (empty(recs))
				return

			if (harGosterCode) {
				let k
				;recs.forEach(r => {
					k = k ?? keys(r)[0]
					r[k] += (
						`<button id="izle" class="float-right"
							style="width: 30px; height: 22px; margin-right: 5px"
							onclick="${harGosterCode}">
						 </button>`
					)
				})
			}
			
			if (result)
				merge(result, recs)
			else
				result = recs
		}
		if (!(totalmi || devirAlinmasin))
			addRecs(await super.loadServerDataInternal({ ...e, devir: true, attrSet }))
		addRecs(await super.loadServerDataInternal(e))
		
		result ??= []
		if (!totalmi && (attrSet.ISARETLIBEDEL || attrSet.BEDEL)) {
			let bakiye = 0, bedelSaha
			for (let rec of result) {
				if (!bedelSaha) {
					bedelSaha = (
						rec.isaretlibedel !== undefined ? 'isaretlibedel' :
						rec.bedel !== undefined ? 'bedel' : null
					)
					if (!bedelSaha)
						break
				}
				let {[bedelSaha]: bedel} = rec
				bakiye += (bedel ?? 0)
				rec[bedelSaha] = bakiye
			}
		}

		let { harYapi = {} } = this
		this.lastRecs = harYapi.recs = result
		
		return result
	}
	super_loadServerDataInternal(e) { return super.loadServerDataInternal(e) }
	superSuper_loadServerDataInternal(e) { return super.super_loadServerDataInternal(e) }
	loadServerData_queryDuzenle(e) {
		e.alias ??= 'hrk'
		super.loadServerData_queryDuzenle(e)
		let { stm, attrSet, hareketci } = e
		let { raporTanim } = this
		let { yatayAnaliz } = raporTanim.kullanim ?? {}
		
		hareketci ??= this.hareketci
		hareketci.reset()
		
		let { uygunluk } = hareketci
		let uygunlukVarmi = !empty(uygunluk)
		if (!uygunlukVarmi) {
			let { hareketTipSecim } = hareketci.class
			uygunlukVarmi = !empty(hareketTipSecim.kaListe)
			if (uygunlukVarmi)
				uygunluk = asSet(hareketTipSecim.kaListe.map(({ kod }) => kod))
		}
		
		let { varsayilanHV: hrkDefHV } = hareketci.class
		extend(e, { hareketci, hrkDefHV })
		
		if (yatayAnaliz)
			attrSet[DRapor_AraSeviye_Main.yatayTip2Bilgi[yatayAnaliz]?.kod] = true
		
		let uni = e.uni = stm.sent = new MQUnionAll()
		let calcUygunluk = this.calcUygunluk = uygunlukVarmi ? {} : null
		let uniBilgiYapi = this.uniBilgiYapi = []
		let harYapi = this.harYapi = { uniBilgiYapi }
		let sender = this
		let _e = { ...e, sender, hrkDefHV, temps: {}, uniBilgiYapi }
		hareketci.ilkIslemler(_e)
		this.loadServerData_queryDuzenle_hrkStm_ilkIslemler(_e)
		stm = _e.stm
		uni = e.uni = stm.sent
		let { uygunluk2UnionBilgiListe } = hareketci
		for (let [selectorStr, unionBilgiListe] of entries(uygunluk2UnionBilgiListe)) {
			let uygunmu = true
			if (uygunlukVarmi) {
				let _keys = selectorStr.split('$').filter(Boolean)
				uygunmu = !!_keys.find(key => uygunluk[key])
				if (uygunmu) {
					_keys.forEach(key =>
						calcUygunluk[key] = true)
				}
			}
			
			unionBilgiListe = unionBilgiListe
				.map(item => getFuncValue.call(this, item, e))
				.filter(Boolean)
			
			for (let uniBilgi of unionBilgiListe) {
				let { sent, hv: hrkHV } = uniBilgi
				extend(_e, {
					sent, hrkHV, hv: hrkHV,
					hvDegeri: key =>
						this.hrkHVDegeri({ ..._e, key }),
					sentHVEkle: (..._keys) => {
						for (let key of _keys)
							this.hrkSentHVEkle({ ..._e, key })
					}
				})
				
				this.loadServerData_queryDuzenle_hrkSent(_e)
				hareketci.uniDuzenle_tumSonIslemler(_e)
				this.loadServerData_queryDuzenle_hkrSent_son(_e)
				sent = _e.sent
				// let sahaSayisi = sent?.sahalar?.liste?.length ?? 0; if (!sahaSayisi) { continue }
				// if (config.dev && selectorStr.includes('perakende') /* && sahaSayisi != 30 */) { debugger }
				sent.groupByOlustur().gereksizTablolariSil()
				uni.add(sent)
				uniBilgiYapi.push({ sender, uniBilgi, sent, defHV: hrkDefHV })
			}
		}
		harYapi.ilkStm = stm.deepCopy()
		return this.loadServerData_queryDuzenle_ek(e)
	}
	loadServerData_queryDuzenle_hrkStm_ilkIslemler({ stm, uni }) { }
	loadServerData_queryDuzenle_hrkStm_sonIslemler({ stm, uni, hareketci: har }) {
		har ??= this.hareketci
		har.stmIcinSonIslemler(...arguments)
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		let { attrSet, sentHVEkle, sent, hrkHV: hv, hrkDefHV: defHV, hvDegeri } = e
		let { sahalar } = sent
		let tarihClause = hvDegeri('tarih')
		this.donemBagla({ ...e, tarihClause })
		for (let key in attrSet) {
			switch (key) {
				case 'FISNOX': sentHVEkle('fisnox'); break
				case 'REF': sentHVEkle('refkod', 'refadi'); break
				case 'ANAISLEM': sentHVEkle('anaislemadi'); break
				case 'ISL': sentHVEkle('islkod', 'isladi'); break
				case 'ALTHESAP': sentHVEkle('althesapkod', 'althesapadi'); break
				case 'DVKOD': sentHVEkle('dvkod'); break
			}
		}
		this.loadServerData_queryDuzenle_ozelIsaret({ ...e, kodClause: hvDegeri('ozelisaret') })
		this.loadServerData_queryDuzenle_sube({ ...e, kodClause: hvDegeri('bizsubekod') })
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: '', tarihClause })
		this.loadServerData_queryDuzenle_takip({ ...e, kodClause: hvDegeri('takipno') })
		this.loadServerData_queryDuzenle_plasiyer({ ...e, kodClause: hvDegeri('plasiyerkod') })
		
		let baClause = hvDegeri('ba'), bedelClause = hvDegeri('bedel').sumOlmaksizin()
		this.loadServerData_queryDuzenle_baBedel({ ...e, baClause, bedelClause })
	
		;{
			let alias = MQAliasliYapi.getDegerAliasListe(tarihClause)?.at(-1)
			this.loadServerData_queryDuzenle_dovizli_baBedel({ ...e, alias, tarihClause, baClause, bedelClause })
		}
	}
	loadServerData_queryDuzenle_hkrSent_son(e) {
		this.loadServerData_queryDuzenle_son_araIslem_sentDuzenleyiciIslemleri({ ...e, stm: null })
	}
	loadServerData_queryDuzenle_ek(e = {}) {
		let { hareket = e.hareketmi, envanter = e.envantermi } = e
		this.loadServerData_queryDuzenle_hrkStm_sonIslemler(e)
		if (e.uni)
			e.uni = e.stm.sent
		
		super.loadServerData_queryDuzenle_ek(e)
		
		if (hareket ?? this.class.hareketmi)
			return this.loadServerData_queryDuzenle_ek_hareket(e)
		
		if (envanter ?? this.class.envantermi)
			return this.loadServerData_queryDuzenle_ek_envanter(e)
	}
	loadServerData_queryDuzenle_ek_hareket(e) {
		let { sqlNull, sqlEmpty } = Hareketci_UniBilgi.ortakArgs
		let { devir: devirmi, attrSet, stm, donemBS } = e
		let { basi: tarih } = donemBS ?? {}
		let tarihDegerClause = tarih?.sqlServerDegeri() ?? sqlNull
		if  (devirmi && !tarih)
			return false
		
		let { tabloYapi, raporTanim, uniBilgiYapi } = this
		let { grupVeToplam } = tabloYapi
		attrSet ??= raporTanim.attrSet
		let attrListe = keys(attrSet)
		let alias2Key = {}
		for (let [key, { kaYapimi, colDefs }] of entries(grupVeToplam)) {
			let {belirtec: alias} = colDefs?.[0] ?? {}
			if (!alias)
				continue
			
			alias2Key[alias] = key
			if (kaYapimi) {
				for (let postfix of ['kod', 'adi'])
					alias2Key[`${alias}${postfix}`] = key
			}
		}
		let kirilmaSet = asSet(attrListe.filter(key => raporTanim.grup[key]))
		let toplamSet = asSet(attrListe.filter(key => tabloYapi.toplam[key]))
		let leafSabitSet = asSet(attrListe.filter(key => grupVeToplam[key] && !(kirilmaSet[key] || toplamSet[key])))
		let cnv = {}
		let { hrkDefHV } = e
		if (devirmi) {
			cnv.TARIH = tarihDegerClause || sqlNull
			cnv[keys(leafSabitSet)[0]] = `'DEVİR =>'`
		}
		stm = e.stm = stm.deepCopy()
		deleteKeys(e, 'sent', 'uni')
		;stm.forEach((sent, i) => {
			let { hv } = uniBilgiYapi[i]?.uniBilgi ?? {}
			let { where: wh, sahalar, alias2Deger } = sent
			let { tarih: tarihClause } = alias2Deger
			tarihClause ||= hv.tarih || hrkDefHV.tarih || sqlNull
			for (let [alias, clause] of entries(alias2Deger)) {
				let key = alias2Key[alias]
				if (!(key && clause))
					continue
				alias2Deger[alias] =
					(devirmi && leafSabitSet[key]) ? (cnv[key] || sqlNull) :
					clause    // Kayıtların içinde DEVİR de olabilir
					// toplamSet[key] ? clause.sumOlmaksizin() : clause
			}
			let wrongKey = 'fis.tarih)', correctKey = 'tarih'
			if (alias2Deger[wrongKey]) {
				alias2Deger[correctKey] = `${alias2Deger[wrongKey]} ${wrongKey}`
				delete alias2Deger[wrongKey]
			}
			for (let aMQAliasliYapi of sahalar.liste)
				aMQAliasliYapi.deger = alias2Deger[aMQAliasliYapi.alias]
			if (tarihDegerClause?.sqlDoluDegermi())
				wh.add(`(${tarihClause} IS NULL OR ${tarihClause} ${devirmi ? '<' : '>='} ${tarihDegerClause})`)
			sent.groupByOlustur()
		})
	}
	loadServerData_queryDuzenle_ek_envanter(e) { }
	loadServerData_queryDuzenle_son_araIslem({ internal, alias, stm, attrSet }) {
		let e = arguments[0]
		super.loadServerData_queryDuzenle_son_araIslem(e)
		let { hareketci: orj } = this
		orj.sonIslemler(e)
		let { with: _with } = stm
		let {degerlemeDvKodListe: dvKodListe} = this
		let dvKodSet = asSet(dvKodListe) ?? {}
		let gecerliDvKodSet = {}, dvKodVarmi = false
		for (let key in attrSet) {
			let dvKod = key.split('_').slice(-1)[0]
			if (dvKodSet[dvKod])
				gecerliDvKodSet[dvKod] = dvKodVarmi = true
		}
		if (!empty(gecerliDvKodSet)) {
			let har = new orj.class()
			har.withAttrs('tarih').sonIslem_whereBaglanmaz()
			let withListe = []
			// tarih
			let uni = new MQUnion()
			let stm = { sent: uni }
			har.uniDuzenle({ uni })
			har.sonIslemler({ ...e, stm })
			for (let sent of uni) {
				sent.distinctYap()
				sent.gereksizTablolariSilDogrudan()                                            // 'har', 'fis' dahil
			}
			withListe.push(uni.asTmpTable('tarihler'))

			// dkur_{dvKod}
			for (let dvKod in gecerliDvKodSet) {
				let kurAlias = `dkur_${dvKod}`
				let wSent = new MQSent(), {where: wh, sahalar} = wSent
				wSent.fromAdd('tarihler trh')
				{
					let sent = new MQSent({ top: 1 })
					let {where: wh, sahalar} = sent
					sent.fromAdd('ORTAK..ydvkur ykur')
					wh.degerAta(dvKod, 'ykur.kod')
					wh.add('ykur.tarih <= trh.tarih')
					sahalar.add('ykur.dovizsatis kur')
					let orderBy = ['ykur.tarih DESC']
					let _stm = new MQStm({ sent, orderBy })
					wSent.outerApply('trh', kurAlias, _stm)
				}
				sahalar.add('trh.tarih', `${kurAlias}.kur`)
				withListe.push(wSent.asTmpTable(kurAlias))
			}
			if (!empty(withListe))
				_with.liste = [...withListe, ..._with.liste]
		}
	}
	loadServerData_queryDuzenle_genelSon({ internal, alias, stm, attrSet }) {
		let { harYapi = {} } = this
		harYapi.araStm = stm.deepCopy()
		super.loadServerData_queryDuzenle_genelSon(...arguments)
		extend(harYapi, { sonStm: stm, attrSet })
	}

	hrkSentHVEkle(e) {
		let { key: alias, sent } = e, { sahalar } = sent
		let deger = this.hrkHVDegeri(e)
		sahalar.add(new MQAliasliYapi({ deger, alias }))
		return this
	}
	hrkHVDegeri(e) {
		let { key, hrkHV: hv, hrkDefHV: defHV } = e
		let result = hv[key] || defHV[key]
		if (isFunction(result)) {
			let sender = this, {hareketci} = this
			result = result?.call(this, { ...e, sender, hareketci, key, hv, defHV })
		}
		return result ?? 'NULL'
	}

	async hareketKartiGoster({ rec: parentRec, uid } = {}) {
		let e = { ...arguments[0] }
		let rapor = this
		let { gridPart } = this
		let { grid, gridWidget: { base: w } } = gridPart
		parentRec ??= w.rowsByKey[uid] ?? w.getSelection()[0]
		if (!parentRec?.leaf)
			return

		let { tabloYapi, raporTanim, harYapi = {}, lastRecs: recs } = this
		let { hareketci: har, hareketci: { class: harSinif } } = this
		let { icerikSabit2Def: sabit2CD } = harSinif
		let { attrSet = raporTanim.attrSet } = e
		let kaSet = asSet(tabloYapi.kaPrefixes)
		
		extend(e, {
			attrSet: attrSet = {
				...attrSet,
				...asSet('TARIH', 'REF', 'ISL', 'FISNOX')
			},
			genelSon_ilkIslem({ stm, toplamColDefs }) {
				let cdYapi = { sabit: {}, toplam: {} }
				let keyYapi = { sabit: {}, toplam: {} }
				let key2Saha = {}, saha2Key = {}
				;{
					let { grup: sabit, toplam, grupVeToplam: all } = tabloYapi
					for (let k in attrSet) {
						let sel = (
							sabit[k] ? 'sabit' :
							toplam[k] ? 'toplam' :
							null
						)
						if (!sel)
							continue
						
						keyYapi[sel][k] = true
						let cd = all[k]?.colDefs?.[0]
						let { belirtec: saha } = cd ?? {}
						if (saha) {
							key2Saha[k] = saha
							saha2Key[saha] = k
							if (sel == 'toplam')
								toplamColDefs.push(cd)
						}
					}
				}
	
				;{
					let { sabit, toplam } = keyYapi
					let dateSet = asSet(
						keys(sabit)
							.map(k => key2Saha[k])
							.filter(b => b?.includes('tarih') || b?.endsWith('vade'))
					)
					
					for (let sent of stm) {
						let { alias2Deger: hv, where: wh, sahalar, groupBy } = sent
						for (let k in sabit) {
							let b = key2Saha[k]
							let kami = kaSet[b]
							let adiSaha
							if (kami) {
								adiSaha = b + 'adi'
								b += 'kod'
							}
							let cl = hv[b]
							let v = parentRec[b]
							if (!cl || v === undefined)
								continue
	
							if (dateSet[b])
								v = asDate(v)
							wh.degerAta(v, cl)
							//}
							if (!sabit2CD[b])
								delete hv[b]
							delete hv[adiSaha]
						}
						
						for (let k in toplam) {
							let b = key2Saha[k]
							let cl = hv[b]
							if (cl)
								hv[b] = cl.sumOlmaksizin()
						}
						sahalar.liste = entries(hv).map(([ alias, deger ]) =>
							new MQAliasliYapi({ alias, deger }))
					}
				}
			},
			genelSon_sonIslem({ stm }) {
				let { orderBy, with: _with } = stm
				// groupBy.liste = []
				;{
					let { liste } = _with
					let i = liste.findIndex(t => t.table == 'toplam')
					stm.sent = liste[i].sent
					liste = _with.liste = liste.slice(0, i - 1)
				}
				;stm.forEach(sent => {
					let { sahalar, groupBy } = sent
					sahalar.liste = sahalar.liste.filter(({ alias }) => alias != 'kayitsayisi')
					groupBy.liste = []
					// groupBy.liste = groupBy.liste.filter(v => v.split('.').at(-1) != 'tarih')
				})
				orderBy.liste = ['tarih']
			}
		})
		
		let args = {
			rapor: this,
			harYapi, parentRec,
			getRecs: async () => {
				e.toplamColDefs = []
				return await this.loadServerData(e) ?? []
			},
			getColDefs: () => [
				...values(sabit2CD),
				... values(e.toplamColDefs)
			]
		}
		await MQHareketKarti.listeEkraniAc({ args })
	}
}
