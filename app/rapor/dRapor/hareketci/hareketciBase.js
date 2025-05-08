class DRapor_Hareketci extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return this == DRapor_Hareketci } 
	static get uygunmu() { return this.mainClass?.hareketciSinif?.uygunmu ?? true }
	static get totalmi() { return !(this.hareketmi || this.envantermi) }
	static get hareketmi() { return false } static get envantermi() { return false }
	static get kategoriKod() { return 'FIN' } static get kategoriAdi() { return 'Finansal' }
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
		let subNames = ['Hareket', 'Envanter'], {raporBilgiler} = this;
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
					`	static get uygunmu() { return config.dev } static get ${selector}mi() { return true }`,
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
	onInit(e) {
		super.onInit(e); let {hareketciSinif} = this.class;
		if (hareketciSinif) { this.hareketci = new hareketciSinif() }
	}
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments); let {hareketci} = this, {hareketTipSecim: tekSecim} = hareketci?.class ?? {};
		if (tekSecim) { sec.secimTopluEkle({ tip: new SecimBirKismi({ etiket: 'Tip', tekSecim, grupKod: 'donemVeTarih' }).birKismi().autoBind() }) }
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
		super.tabloYapiDuzenle(e); let {result} = e;
		result.addKAPrefix('ref', 'althesap');
		this.tabloYapiDuzenle_ozelIsaret(e).tabloYapiDuzenle_sube(e);
		result.addGrupBasit('FISNOX', 'Fis No', 'fisnox', null, null, ({ item }) => item.secimKullanilir());
		result.addGrupBasit('ALTHESAP', 'Alt Hesap', 'althesap', DMQAltHesap);
		this.tabloYapiDuzenle_odemeGun(e);
		result.addGrupBasit('REFERANS', 'Referans', 'ref', null, null, ({ item }) => item.setOrderBy('refadi'));
		result.addGrupBasit('ANAISLEM', 'Ana İşlem', 'anaislemadi');
		result.addGrupBasit('ISLEM', 'İşlem', 'islemadi');
		this.tabloYapiDuzenle_plasiyer(e);
		this.tabloYapiDuzenle_takip(e);
		result.addGrupBasit('DVKOD', 'Dv.Kod', 'dvkod');
		result.addGrupBasit('DVKUR', 'Dv.Kur', 'dvkur');
		this.tabloYapiDuzenle_baBedel(e)
	}
	tabloYapiDuzenle_odemeGun(e) { /* do nothing */ }
	super_tabloYapiDuzenle_odemeGun(e) { super.tabloYapiDuzenle_odemeGun(e) }
	loadServerData_queryDuzenle(e) {
		e.alias = e.alias ?? 'hrk'; let {stm, attrSet} = e, {hareketci, raporTanim} = this, {yatayAnaliz} = raporTanim.kullanim;
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
				this.loadServerData_queryDuzenle_hrkSent(_e);
				hareketci.uniDuzenle_tumSonIslemler(_e); sent = _e.sent;
				let sahaSayisi = sent?.sahalar?.liste?.length ?? 0; if (!sahaSayisi) { continue }
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
				case 'FISNOX': sentHVEkle('fisnox'); break; case 'REFERANS': sentHVEkle('refkod', 'refadi'); break;
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
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e);
		if (false) {
			let {attrSet, stm} = e, {tabloYapi, raporTanim, secimler} = this, {grupVeToplam} = tabloYapi, {tarihBS} = secimler;
			attrSet = attrSet ?? raporTanim.attrSet; let attrListe = Object.keys(attrSet);
			let kirilmaSet = asSet(attrListe.filter(key => raporTanim.grup[key]));
			let leafSabitSet = asSet(attrListe.filter(key => tabloYapi.grup[key] && !toplamSet[key]));
			let toplamSet = asSet(attrListe.filter(key => tabloYapi.toplam[key]));
			if (tarihBS?.basi) {
				let {sqlNull} = Hareketci_UniBilgi.ortakArgs, devirDonusum = { tarih: tarihBS?.basi || 'NULL' };
				for (let alias of ['mstadi', 'islemadi', 'isladi', 'refadi']) { devirDonusum[alias] = 'DEVİR ==>' }
				let dStm = stm.asToplamStm();
				for (let {where, sahalar, alias2Deger} of dStm) {
					for (let alias in alias2Deger) {
						if (!leafSabitSet[alias]) { continue }
						alias2Deger[alias] = devirDonusum[alias] || sqlNull
					}
					for (let aMQAliasliYapi of sahalar.liste) {
						let {alias} = aMQAliasliYapi;
						aMQAliasliYapi.deger = alias2Deger[alias]
					}
				}
				stm.birlestir(dStm)
				/* stm.with.add(dStm.with); stm.sent.add(dStm.sent) */
			}
			debugger
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
