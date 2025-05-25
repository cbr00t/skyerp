class DRapor_Hareketci extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return this == DRapor_Hareketci } 
	static get uygunmu() { return this.mainClass?.hareketciSinif?.uygunmu ?? true }
	static get yatayAnalizVarmi() { return this.totalmi } static get ozetVarmi() { return this.totalmi } static get chartVarmi() { return this.totalmi }
	static get totalmi() { return !(this.hareketmi || this.envantermi) }
	static get hareketmi() { return false } static get envantermi() { return false }
	static get kategoriKod() { return `FIN${this.totalmi ? '' : `-${this.kodEk}`}` }
	static get kategoriAdi() { return `Finansal (${this.aciklamaEk})` }
	static get kod() {
		let {_kod: result, kodEk: ek} = this;
		if (ek) { result = `${ek}_${result.replace('TOTAL', '')}` }
		return result
	}
	static get aciklama() {
		let {_aciklama: result, aciklamaEk: ek} = this;
		if (ek) { result = `${result.replace('Total', '')} ${ek}` }
		return result
	}
	static get _kod() { return super.kod } static get _aciklama() { return super.aciklama }
	static get kodEk() { let {hareketmi, envantermi} = this; return hareketmi ? 'HAR' : envantermi ? 'ENV' : '' }
	static get aciklamaEk() { let {hareketmi, envantermi} = this; return hareketmi ? 'Hareket' : envantermi ? 'Envanter' : 'Total' }
	static autoGenerateSubClasses(e) {
		let subNames = ['Hareket' /*, 'Envanter'*/], {raporBilgiler} = this;
		let evalList = []; for (let {kod, cls} of raporBilgiler) {
			let parent; {
				let {mainClass, name} = cls; if (!mainClass) { continue }
				let {name: mainName} = mainClass; parent = { cls, name, mainClass, mainName }
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
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return null }
	static get totalmi() { return this.raporClass.totalmi }
	static get hareketmi() { return this.raporClass.hareketmi } static get envantermi() { return this.raporClass.envantermi }
	onInit(e) {
		super.onInit(e); let {hareketciSinif} = this.class;
		if (hareketciSinif) { this.hareketci = new hareketciSinif() }
	}
	tazele(e) {
		let {totalmi} = this.class, {secimler: sec} = this, {tarihBS} = sec;
		if (!(totalmi || tarihBS?.basi || this.secimlerIstendimi)) { this.secimlerIstendi(); this.secimlerIstendimi = true; return }
		return super.tazele(e)
	}
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments);
		let grupKod = 'donemVeTarih', {hareketci} = this, {totalmi} = this.class;
		let {hareketTipSecim: tekSecim} = hareketci?.class ?? {};
		let liste = {}; if (tekSecim) { liste.tip = new SecimBirKismi({ etiket: 'Tip', tekSecim, grupKod }).birKismi().autoBind() }
		if (!totalmi) { liste.devirAlinmasin = new SecimBool({ grupKod, etiket: `Devir <b class=firebrick>AlınMAsın</b>` }) }
		if (!$.isEmptyObject(liste)) { sec.secimTopluEkle(liste) }
		if (!totalmi) {
			let {donem, tarihAralik} = sec; donem?.tekSecim?.tarihAralik?.();
			if (tarihAralik) { tarihAralik.visible(); tarihAralik.sonu = tarihAralik.sonu || today() }
		}
	}
	secimlerInitEvents(e) {
		super.secimlerInitEvents(e); let {secimlerPart} = this, {secim2Info} = secimlerPart || {}; if (!secim2Info) { return }
		let part = secim2Info?.tip?.element?.find('.ddList')?.data('part');
		part?.degisince(e => {
			let {hareketci} = this, {value} = secim2Info.tip.secim;
			hareketci.uygunluk = $.isEmptyObject(value) ? null : asSet(value)
		})
	}
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); let {result} = e; result.addKAPrefix('ref', 'althesap');
		this.tabloYapiDuzenle_ozelIsaret(e).tabloYapiDuzenle_sube(e);
		result.addGrupBasit('FISNOX', 'Fis No', 'fisnox', null, null, ({ item }) => item.secimKullanilir());
		result.addGrupBasit('ALTHESAP', 'Alt Hesap', 'althesap', DMQAltHesap);
		this.tabloYapiDuzenle_odemeGun(e);
		result.addGrupBasit('REF', 'Referans', 'ref', null, null, ({ item }) => item.setOrderBy('refadi'));
		result.addGrupBasit('ANAISLEM', 'Ana İşlem', 'anaislemadi');
		result.addGrupBasit('ISLEM', 'İşlem', 'islemadi');
		this.tabloYapiDuzenle_plasiyer(e);
		this.tabloYapiDuzenle_takip(e);
		result.addGrupBasit('DVKOD', 'Dv.Kod', 'dvkod');
		result.addGrupBasit('DVKUR', 'Dv.Kur', 'dvkur', null, null, ({ item }) => item.noOrderBy());
		this.tabloYapiDuzenle_baBedel(e)
	}
	tabloYapiDuzenle_odemeGun(e) { /* do nothing */ }
	super_tabloYapiDuzenle_odemeGun(e) { super.tabloYapiDuzenle_odemeGun(e) }
	async loadServerDataInternal(e) {
		let {secimler, raporTanim} = this, {totalmi} = this.class;
		let {value: devirAlinmasin} = secimler.devirAlinmasin ?? { value: true };
		let {donemBS, attrSet} = e, {basi: tarihBasi} = donemBS ?? {};
		attrSet = attrSet ?? raporTanim.attrSet;
		if (!(totalmi || attrSet.TARIH)) { devirAlinmasin = true }
		/* if (!totalmi) { attrSet.TARIH = true }
		e.attrSet = attrSet; */
		let result = [], addRecs = recs => { if (recs?.length) { result.push(...recs) } }
		if (!(totalmi || devirAlinmasin)) {
			let devir = true;  /*, attrSet = { ...orjAttrSet, TARIH: true } */
			addRecs(await super.loadServerDataInternal({ ...e, devir, attrSet }))
		}
		addRecs(await super.loadServerDataInternal(e));
		return result
	}
	loadServerData_queryDuzenle(e) {
		e.alias = e.alias ?? 'hrk';
		let {stm, attrSet} = e, {hareketci, raporTanim} = this, {yatayAnaliz} = raporTanim.kullanim;
		hareketci.reset(); let {uygunluk} = hareketci, uygunlukVarmi = !$.isEmptyObject(uygunluk);
		if (!uygunlukVarmi) {
			let {hareketTipSecim} = hareketci.class; uygunlukVarmi = !$.isEmptyObject(hareketTipSecim.kaListe);
			if (uygunlukVarmi) { uygunluk = asSet(hareketTipSecim.kaListe.map(({ kod }) => kod)) }
		}
		let {varsayilanHV: hrkDefHV} = hareketci.class; $.extend(e, { hareketci, hrkDefHV });
		if (yatayAnaliz) { attrSet[DRapor_AraSeviye_Main.yatayTip2Bilgi[yatayAnaliz]?.kod] = true }
		let uni = e.uni = stm.sent = new MQUnionAll(), {uygunluk2UnionBilgiListe} = hareketci;
		let _e = { ...e, sender: this, hrkDefHV, temps: {} };
		for (let [selectorStr, unionBilgiListe] of Object.entries(uygunluk2UnionBilgiListe)) {
			let uygunmu = true; if (uygunlukVarmi) {
				let keys = selectorStr.split('$').filter(x => !!x);
				uygunmu = !!keys.find(key => uygunluk[key]); if (!uygunmu) { continue }
			}
			unionBilgiListe = unionBilgiListe.map(item => getFuncValue.call(this, item, e)).filter(x => !!x);
			for (let { sent, hv: hrkHV } of unionBilgiListe) {
				$.extend(_e, {
					sent, hrkHV, hv: hrkHV, hvDegeri: key => this.hrkHVDegeri({ ..._e, key }),
					sentHVEkle: (...keys) => { for (let key of keys) { this.hrkSentHVEkle({ ..._e, key }) } }
				});
				this.loadServerData_queryDuzenle_hrkSent(_e); hareketci.uniDuzenle_tumSonIslemler(_e);
				this.loadServerData_queryDuzenle_hkrSent_son(_e); sent = _e.sent;
				// let sahaSayisi = sent?.sahalar?.liste?.length ?? 0; if (!sahaSayisi) { continue }
				// if (config.dev && selectorStr.includes('perakende') /* && sahaSayisi != 30 */) { debugger }
				sent.groupByOlustur().gereksizTablolariSil();
				uni.add(sent)
			}
		}
		return this.loadServerData_queryDuzenle_ek(e)
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		let {attrSet, sentHVEkle, sent, hrkHV: hv, hrkDefHV: defHV, hvDegeri} = e;
		let {sahalar} = sent, tarihSaha = hvDegeri('tarih');
		this.donemBagla({ ...e, tarihSaha }); for (let key in attrSet) {
			switch (key) {
				case 'FISNOX': sentHVEkle('fisnox'); break; case 'REF': sentHVEkle('refkod', 'refadi'); break
				case 'ANAISLEM': sentHVEkle('anaislemadi'); break; case 'ISLEM': sentHVEkle('islemadi'); break
				case 'ALTHESAP': sentHVEkle('althesapkod', 'althesapadi'); break
				case 'DVKOD': sentHVEkle('dvkod'); break
			}
		}
		this.loadServerData_queryDuzenle_ozelIsaret({ ...e, kodClause: hvDegeri('ozelisaret') });
		this.loadServerData_queryDuzenle_sube({ ...e, kodClause: hvDegeri('bizsubekod') });
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: '', tarihSaha });
		this.loadServerData_queryDuzenle_takip({ ...e, kodClause: hvDegeri('takipno') });
		this.loadServerData_queryDuzenle_plasiyer({ ...e, kodClause: hvDegeri('plasiyerkod') });
		let baClause = hvDegeri('ba'), bedelClause = hvDegeri('bedel').sumOlmaksizin();
		this.loadServerData_queryDuzenle_baBedel({ ...e, baClause, bedelClause })
	}
	loadServerData_queryDuzenle_hkrSent_son(e) { }
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e);
		if (this.class.hareketmi) { this.loadServerData_queryDuzenle_ek_hareket(e) }
	}
	loadServerData_queryDuzenle_ek_hareket(e) {
		let {devir: devirmi, attrSet, stm, donemBS} = e;
		let {sqlNull, sqlEmpty} = Hareketci_UniBilgi.ortakArgs;
		let {tabloYapi, raporTanim} = this, {grupVeToplam} = tabloYapi;
		let {basi: tarih} = donemBS ?? {}, tarihDegerClause = tarih?.sqlServerDegeri() ?? sqlNull;
		attrSet = attrSet ?? raporTanim.attrSet; let attrListe = Object.keys(attrSet);
		let alias2Key = {}; for (let [key, { kaYapimi, colDefs }] of Object.entries(grupVeToplam)) {
			let {belirtec: alias} = colDefs?.[0] ?? {}; if (!alias) { continue }
			alias2Key[alias] = key; if (kaYapimi) { for (let postfix of ['kod', 'adi']) { alias2Key[`${alias}${postfix}`] = key } }
		}
		let kirilmaSet = asSet(attrListe.filter(key => raporTanim.grup[key]));
		let toplamSet = asSet(attrListe.filter(key => tabloYapi.toplam[key]));
		let leafSabitSet = asSet(attrListe.filter(key => grupVeToplam[key] && !(kirilmaSet[key] || toplamSet[key])));
		let cnv = {}; if (devirmi) {
			cnv.TARIH = tarihDegerClause || sqlNull;
			cnv[Object.keys(leafSabitSet)[0]] = `'DEVİR =>'`
		}
		stm = e.stm = stm.deepCopy(); for (let key of ['sent', 'uni']) { delete e[key] }
		for (let sent of stm) {
			let {where: wh, sahalar, alias2Deger} = sent, {tarih: tarihClause} = alias2Deger;
			for (let [alias, deger] of Object.entries(alias2Deger)) {
				if (deger.sqlBosDegermi()) { continue }
				let key = alias2Key[alias]; if (!key) { continue }
				alias2Deger[alias] =
					(devirmi && leafSabitSet[key]) ? (cnv[key] || sqlNull) :
					toplamSet[key] ? deger.sumOlmaksizin() : deger
			}
			for (let aMQAliasliYapi of sahalar.liste) {
				aMQAliasliYapi.deger = alias2Deger[aMQAliasliYapi.alias] }
			if (tarihClause && tarihDegerClause) {
				wh.add(`(${tarihClause} IS NULL OR ${tarihClause} ${devirmi ? '<' : '>='} ${tarihDegerClause})`)
			}
			sent.groupByOlustur()
		}
	}
	hrkSentHVEkle(e) {
		let {key: alias, sent} = e, {sahalar} = sent;
		let deger = this.hrkHVDegeri(e); sahalar.add(new MQAliasliYapi({ deger, alias }));
		return this
	}
	hrkHVDegeri(e) {
		const{ key, hrkHV: hv, hrkDefHV: defHV } = e;
		let result = hv[key] || defHV[key]; if (isFunction(result)) {
			const sender = this, {hareketci} = this;
			result = result?.call(this, { ...e, sender, hareketci, key, hv, defHV })
		}
		return result ?? 'NULL'
	}
}
