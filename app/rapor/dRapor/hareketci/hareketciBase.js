class DRapor_Hareketci extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'FIN' } static get kategoriAdi() { return 'Finansal' }
	static get uygunmu() { return window[`${this.name}_Main`]?.hareketciSinif?.uygunmu ?? true }
}
class DRapor_Hareketci_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return null }
	onInit(e) {
		super.onInit(e); let {hareketciSinif} = this.class;
		this.hareketci = new hareketciSinif()
	}
	secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const {secimler: sec} = e, {hareketci} = this, {hareketTipSecim: tekSecim} = hareketci.class;
		sec.secimTopluEkle({ tip: new SecimBirKismi({ etiket: 'Tip', tekSecim, grupKod: 'donemVeTarih' }).birKismi().autoBind() })
	}
	secimlerInitEvents(e) {
		super.secimlerInitEvents(e); const {secimlerPart} = this, {secim2Info} = secimlerPart || {}; if (!secim2Info) { return }
		let part = secim2Info.tip.element.find('.ddList').data('part'); part?.degisince(e => {
			let {hareketci} = this, {value} = secim2Info.tip.secim;
			hareketci.uygunluk = $.isEmptyObject(value) ? null : asSet(value)
		})
	}
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); let {result} = e;
		this.tabloYapiDuzenle_ozelIsaret(e).tabloYapiDuzenle_sube(e);
		result.addKAPrefix('ref', 'islem', 'althesap')
			.addGrupBasit('FISNOX', 'Fis No', 'fisnox').addGrupBasit('ALTHESAP', 'Alt Hesap', 'althesap').addGrupBasit('ODEMEGUN', 'Ödeme Gün', 'odgunkod')
			.addGrupBasit('REFERANS', 'Referans', 'ref').addGrupBasit('ANAISLEM', 'Ana İşlem', 'anaislemadi').addGrupBasit('ISLEM', 'İşlem', 'islem');
		this.tabloYapiDuzenle_plasiyer(e).tabloYapiDuzenle_takip(e);
		result.addGrupBasit('DVKOD', 'Dv.Kod', 'dvkod').addGrupBasit('DVKUR', 'Dv.Kur', 'dvkur');
		this.tabloYapiDuzenle_baBedel(e)
	}
	loadServerData_queryDuzenle(e) {
		e.alias = e.alias ?? 'hrk'; let {stm, attrSet} = e, {hareketci, raporTanim} = this, {yatayAnaliz} = raporTanim.kullanim, {uygunluk} = hareketci;
		hareketci.reset(); let {varsayilanHV: hrkDefHV} = hareketci.class; $.extend(e, { hareketci, hrkDefHV });
		if (yatayAnaliz) { attrSet[DRapor_AraSeviye_Main.yatayTip2Bilgi[yatayAnaliz]?.kod] = true }
		let uni = e.uni = stm.sent = new MQUnionAll(), {uygunluk2UnionBilgiListe} = hareketci, _e = { ...e, hrkDefHV, temps: {} }
		for (let [selectorStr, unionBilgiListe] of Object.entries(uygunluk2UnionBilgiListe)) {
			let selectors = selectorStr.split('$').filter(x => !!x);
			let uygunmu = selectors.find(selector => uygunluk[selector]); if (!uygunmu) { continue }
			unionBilgiListe = unionBilgiListe.map(item => getFuncValue.call(this, item, e)).filter(x => !!x);
			for (let { sent, hv: hrkHV } of unionBilgiListe) {
				$.extend(_e, {
					sent, hrkHV, hvDegeri: key => this.hrkHVDegeri({ ..._e, key }),
					sentHVEkle: (...keys) => { for (let key of keys) { this.hrkSentHVEkle({ ..._e, key }) } }
				});
				uni.add(sent); this.loadServerData_queryDuzenle_hrkSent(_e)
			}
		}
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		let {attrSet, sentHVEkle, sent, hrkHV: hv, hrkDefHV: defHV, hvDegeri} = e, {sahalar} = sent;
		let tarihSaha = hvDegeri('tarih'); this.donemBagla({ ...e, tarihSaha });
		for (let key in attrSet) {
			switch (key) {
				case 'FISNOX': sentHVEkle('fisnox'); break; case 'REFERANS': sentHVEkle('refkod', 'refadi'); break;
				case 'ANAISLEM': sentHVEkle('anaislemadi'); break; case 'ISLEM': sentHVEkle('islemkod', 'islemadi'); break
				case 'ODEMEGUN': sentHVEkle('odgunkod'); break; case 'ALTHESAP': sentHVEkle('althesapkod', 'althesapadi'); break
				case 'DVKOD': sentHVEkle('dvkod'); break
			}
		}
		this.loadServerData_queryDuzenle_ozelIsaret({ ...e, kodClause: hvDegeri('ozelisaret') });
		this.loadServerData_queryDuzenle_sube({ ...e, kodClause: hvDegeri('bizsubekod') });
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: '', tarihSaha });
		this.loadServerData_queryDuzenle_takip({ ...e, kodClause: hvDegeri('takipno') });
		let baClause = hvDegeri('ba'), bedelClause = hvDegeri('bedel').sumOlmaksizin();
		this.loadServerData_queryDuzenle_baBedel({ ...e, baClause, bedelClause })
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
