class DRapor_Hareketci extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return this == DRapor_Hareketci } static get hareketciSinif() { return null }
	// static get oncelik() { return 20 }
	static get oncelik() { return this.hareketciSinif.oncelik } static get uygunmu() { return this.mainClass?.hareketciSinif?.uygunmu ?? true }
	static get yatayAnalizVarmi() { return this.totalmi } static get ozetVarmi() { return this.totalmi } static get chartVarmi() { return this.totalmi }
	static get totalmi() { return !(this.hareketmi || this.envantermi) } static get hareketmi() { return false } static get envantermi() { return false }
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
	static autoGenerateSubClasses(e) {
		let subNames = ['Hareket', 'Envanter'];
		let {raporBilgiler} = this, evalList = [];
		for (let {kod, cls} of raporBilgiler) {
			let parent
			; {
				let {mainClass, sadeceTotalmi, name} = cls
				if (!mainClass || sadeceTotalmi)
					continue
				let {name: mainName} = mainClass
				parent = { cls, name, mainClass, mainName }
			}
			for (let subPostfix of subNames) {
				let selector = subPostfix.toLowerCase();
				let sub = { name: `${parent.name}_${subPostfix}`, selector };
				$.extend(sub, { mainName: `${sub.name}_Main` });
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
		if (evalList.length) { eval(evalList.join(CrLf)) }
		delete this._kod2Sinif;    /* cache reset */
		return this
	}
}
class DRapor_Hareketci_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get hareketciSinif() { return this.raporClass?.hareketciSinif } static get secimWhereBaglanirmi() { return false }
	static get totalmi() { return this.raporClass.totalmi } static get hareketmi() { return this.raporClass.hareketmi }
	static get envantermi() { return this.raporClass.envantermi }
	onInit(e) {
		super.onInit(e)
		let {hareketciSinif} = this.class
		if (hareketciSinif)
			this.hareketci = new hareketciSinif()
	}
	tazele(e) {
		let {rapor: { isPanelItem }, class: { totalmi } } = this, {secimler: sec = {}} = this, {tarihBS} = sec;
		if (!(isPanelItem || totalmi || tarihBS?.basi || this.secimlerIstendimi)) {
			this.secimlerIstendi(); this.secimlerIstendimi = true
			return
		}
		return super.tazele(e)
	}
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		let grupKod = 'donemVeTarih', {hareketci} = this, {totalmi} = this.class
		let {hareketTipSecim: tekSecim} = hareketci?.class ?? {};
		let liste = {}; if (tekSecim) { liste.tip = new SecimBirKismi({ etiket: 'Tip', tekSecim, grupKod }).birKismi().autoBind() }
		if (!totalmi) { liste.devirAlinmasin = new SecimBool({ grupKod, etiket: `Devir <b class=firebrick>AlınMAsın</b>` }) }
		if (!empty(liste))
			sec.secimTopluEkle(liste)
		if (!totalmi) {
			let {donem, tarihAralik} = sec; donem?.tekSecim?.tarihAralik?.()
			if (tarihAralik) {
				tarihAralik.visible()
				tarihAralik.sonu = tarihAralik.sonu || today()
			}
		}
	}
	super_secimlerDuzenle(e) { super.secimlerDuzenle(e) }
	superSuper_secimlerDuzenle(e) { super.super_secimlerDuzenle(e) }
	secimlerInitEvents(e) {
		super.secimlerInitEvents(e)
		let {secimlerPart} = this, {secim2Info} = secimlerPart || {}
		if (!secim2Info)
			return
		let part = secim2Info?.tip?.element?.find('.ddList')?.data('part');
		part?.degisince(e => {
			let {hareketci} = this, {value} = secim2Info.tip.secim
			hareketci.uygunluk = empty(value) ? null : asSet(value)
		})
	}
	tabloYapiDuzenle({ result }) {
		let e = arguments[0]; super.tabloYapiDuzenle(e)
		result.addKAPrefix('ref', 'althesap')
		this.tabloYapiDuzenle_ozelIsaret(e).tabloYapiDuzenle_sube(e)
		result.addGrupBasit('FISNOX', 'Fis No', 'fisnox', null, null, ({ item }) => item.secimKullanilir())
		result.addGrupBasit('ALTHESAP', 'Alt Hesap', 'althesap', DMQAltHesap)
		this.tabloYapiDuzenle_odemeGun(e)
		result.addGrupBasit('REF', 'Referans', 'ref', null, null, ({ item }) => item.setOrderBy('refadi'))
		result.addGrupBasit('ANAISLEM', 'Ana İşlem', 'anaislemadi')
		result.addGrupBasit('ISLEM', 'İşlem', 'isladi')
		this.tabloYapiDuzenle_plasiyer(e)
		this.tabloYapiDuzenle_takip(e)
		result.addGrupBasit('DVKOD', 'Dv.Kod', 'dvkod')
		result.addGrupBasit('DVKUR', 'Dv.Kur', 'dvkur', null, null, ({ item, colDef }) => { item.noOrderBy(); colDef.tipDecimal() })
		this.tabloYapiDuzenle_baBedel(e)
		this.tabloYapiDuzenle_baBakiye(e)
		this.tabloYapiDuzenle_dovizli_baBedel(e)
		this.tabloYapiDuzenle_dovizli_baBakiye(e)
	}
	super_tabloYapiDuzenle(e) { super.tabloYapiDuzenle(e) }
	superSuper_tabloYapiDuzenle(e) { super.super_tabloYapiDuzenle(e) }
	tabloYapiDuzenle_odemeGun(e) { /* do nothing */ }
	super_tabloYapiDuzenle_odemeGun(e) { super.tabloYapiDuzenle_odemeGun(e) }
	async loadServerDataInternal(e = {}) {
		let {hareketci} = e
		hareketci ??= this.hareketci
		let {secimler, raporTanim, class: { totalmi }} = this
		let {value: devirAlinmasin} = secimler.devirAlinmasin ?? { value: true }
		let {attrSet, donemBS} = e, {basi: tarihBasi} = donemBS ?? {}
		attrSet ??= raporTanim.attrSet
		if (!(totalmi || attrSet.TARIH))
			devirAlinmasin = true
		await hareketci?.class?.ilkIslemler(e)
		let result, addRecs = recs => {
			if (recs?.length) {
				if (result) { $.merge(result, recs) }
				else { result = recs }
			}
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
		return result
	}
	super_loadServerDataInternal(e) { return super.loadServerDataInternal(e) }
	superSuper_loadServerDataInternal(e) { return super.super_loadServerDataInternal(e) }
	loadServerData_queryDuzenle(e) {
		e.alias ??= 'hrk'
		super.loadServerData_queryDuzenle(e)
		let {stm, attrSet, hareketci} = e
		let {raporTanim} = this, {kullanim: { yatayAnaliz }} = raporTanim
		hareketci ??= this.hareketci
		hareketci.reset()
		let {uygunluk} = hareketci, uygunlukVarmi = !empty(uygunluk)
		if (!uygunlukVarmi) {
			let {hareketTipSecim} = hareketci.class
			uygunlukVarmi = !empty(hareketTipSecim.kaListe)
			if (uygunlukVarmi)
				uygunluk = asSet(hareketTipSecim.kaListe.map(({ kod }) => kod))
		}
		let {varsayilanHV: hrkDefHV} = hareketci.class
		$.extend(e, { hareketci, hrkDefHV })
		if (yatayAnaliz)
			attrSet[DRapor_AraSeviye_Main.yatayTip2Bilgi[yatayAnaliz]?.kod] = true
		let uni = e.uni = stm.sent = new MQUnionAll(), {uygunluk2UnionBilgiListe} = hareketci
		let calcUygunluk = this.calcUygunluk = uygunlukVarmi ? {} : null
		let uniBilgiYapi = this.uniBilgiYapi = []
		let sender = this, _e = { ...e, sender, hrkDefHV, temps: {}, uniBilgiYapi }
		for (let [selectorStr, unionBilgiListe] of entries(uygunluk2UnionBilgiListe)) {
			let uygunmu = true
			if (uygunlukVarmi) {
				let keys = selectorStr.split('$').filter(x => !!x)
				uygunmu = !!keys.find(key => uygunluk[key])
				if (!uygunmu)
					continue
				keys.forEach(key =>
					calcUygunluk[key] = true)
			}
			unionBilgiListe = unionBilgiListe
				.map(item => getFuncValue.call(this, item, e))
				.filter(_ => !!_)
			for (let uniBilgi of unionBilgiListe) {
				let {sent, hv: hrkHV} = uniBilgi
				$.extend(_e, {
					sent, hrkHV, hv: hrkHV,
					hvDegeri: key => this.hrkHVDegeri({ ..._e, key }),
					sentHVEkle: (...keys) => {
						for (let key of keys)
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
				uniBilgiYapi.push({ sender, uniBilgi, defHV: hrkDefHV })
			}
		}
		return this.loadServerData_queryDuzenle_ek(e)
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		let {attrSet, sentHVEkle, sent, hrkHV: hv, hrkDefHV: defHV, hvDegeri} = e
		let {sahalar} = sent, tarihClause = hvDegeri('tarih')
		this.donemBagla({ ...e, tarihClause })
		for (let key in attrSet) {
			switch (key) {
				case 'FISNOX': sentHVEkle('fisnox'); break; case 'REF': sentHVEkle('refkod', 'refadi'); break
				case 'ANAISLEM': sentHVEkle('anaislemadi'); break; case 'ISLEM': sentHVEkle('isladi'); break
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
		{
			let alias = MQAliasliYapi.getDegerAliasListe(tarihClause)?.at(-1)
			this.loadServerData_queryDuzenle_dovizli_baBedel({ ...e, alias, tarihClause, baClause, bedelClause })
		}
	}
	loadServerData_queryDuzenle_hkrSent_son(e) { }
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e);
		if (this.class.hareketmi)
			this.loadServerData_queryDuzenle_ek_hareket(e)
		if (this.class.envantermi)
			this.loadServerData_queryDuzenle_ek_envanter(e)
	}
	loadServerData_queryDuzenle_ek_hareket(e) {
		let {sqlNull, sqlEmpty} = Hareketci_UniBilgi.ortakArgs
		let {devir: devirmi, attrSet, stm, donemBS} = e
		let {tabloYapi, raporTanim} = this, {grupVeToplam} = tabloYapi
		let {basi: tarih} = donemBS ?? {}, tarihDegerClause = tarih?.sqlServerDegeri() ?? sqlNull
		attrSet = attrSet ?? raporTanim.attrSet; let attrListe = keys(attrSet);
		let alias2Key = {}
		for (let [key, { kaYapimi, colDefs }] of entries(grupVeToplam)) {
			let {belirtec: alias} = colDefs?.[0] ?? {}; if (!alias) { continue }
			alias2Key[alias] = key; if (kaYapimi) { for (let postfix of ['kod', 'adi']) { alias2Key[`${alias}${postfix}`] = key } }
		}
		let kirilmaSet = asSet(attrListe.filter(key => raporTanim.grup[key]))
		let toplamSet = asSet(attrListe.filter(key => tabloYapi.toplam[key]))
		let leafSabitSet = asSet(attrListe.filter(key => grupVeToplam[key] && !(kirilmaSet[key] || toplamSet[key])))
		let cnv = {}; if (devirmi) {
			cnv.TARIH = tarihDegerClause || sqlNull;
			cnv[keys(leafSabitSet)[0]] = `'DEVİR =>'`
		}
		stm = e.stm = stm.deepCopy()
		deleteKeys(e, 'sent', 'uni')
		for (let sent of stm) {
			let {where: wh, sahalar, alias2Deger} = sent, {tarih: tarihClause} = alias2Deger;
			for (let [alias, deger] of entries(alias2Deger)) {
				if (deger.sqlBosDegermi()) { continue }
				let key = alias2Key[alias]; if (!key) { continue }
				alias2Deger[alias] =
					(devirmi && leafSabitSet[key]) ? (cnv[key] || sqlNull) :
					deger    // Kayıtların içinde DEVİR de olabilir
					// toplamSet[key] ? deger.sumOlmaksizin() : deger
			}
			{
				let wrongKey = 'fis.tarih)', correctKey = 'tarih'
				if (alias2Deger[wrongKey]) {
					alias2Deger[correctKey] = `${alias2Deger[wrongKey]} ${wrongKey}`
					delete alias2Deger[wrongKey]
				}
			}
			for (let aMQAliasliYapi of sahalar.liste) {
				aMQAliasliYapi.deger = alias2Deger[aMQAliasliYapi.alias] }
			if (tarihClause && !MQSQLOrtak.sqlBosDegermi(tarihDegerClause))
				wh.add(`(${tarihClause} IS NULL OR ${tarihClause} ${devirmi ? '<' : '>='} ${tarihDegerClause})`)
			sent.groupByOlustur()
		}
	}
	loadServerData_queryDuzenle_ek_envanter(e) { }
	loadServerData_queryDuzenle_son_araIslem({ internal, alias, stm, attrSet }) {
		let e = arguments[0]
		super.loadServerData_queryDuzenle_son_araIslem(e)
		let {with: _with} = stm
		let {degerlemeDvKodListe: dvKodListe} = this
		let dvKodSet = asSet(dvKodListe) ?? {}
		let gecerliDvKodSet = {}, dvKodVarmi = false
		for (let key in attrSet) {
			let dvKod = key.split('_').slice(-1)[0]
			if (dvKodSet[dvKod])
				gecerliDvKodSet[dvKod] = dvKodVarmi = true
		}
		if (!empty(gecerliDvKodSet)) {
			let {hareketci: orj} = this
			let har = new orj.class()
			har.withAttrs('tarih').sonIslem_whereBaglanmaz()
			let withListe = []
			
			// tarih
			let uni = new MQUnion()
			har.uniDuzenle({ uni })
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
	hrkSentHVEkle(e) {
		let {key: alias, sent} = e, {sahalar} = sent
		let deger = this.hrkHVDegeri(e)
		sahalar.add(new MQAliasliYapi({ deger, alias }))
		return this
	}
	hrkHVDegeri(e) {
		let {key, hrkHV: hv, hrkDefHV: defHV} = e
		let result = hv[key] || defHV[key]
		if (isFunction(result)) {
			let sender = this, {hareketci} = this
			result = result?.call(this, { ...e, sender, hareketci, key, hv, defHV })
		}
		return result ?? 'NULL'
	}
}
