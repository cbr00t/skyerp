class DRapor_Hareketci extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'FIN' } static get kategoriAdi() { return 'Finansal' }
	static get araSeviyemi() { return this == DRapor_Hareketci } 
	static get uygunmu() { return window[`${this.name}_Main`]?.hareketciSinif?.uygunmu ?? true }
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
		result.addGrupBasit('FISNOX', 'Fis No', 'fisnox');
		result .addGrupBasit('ALTHESAP', 'Alt Hesap', 'althesap');
		this.tabloYapiDuzenle_odemeGun(e);
		result.addGrupBasit('REFERANS', 'Referans', 'ref', null, null, ({ item }) => item.setOrderBy('refadi'));
		result.addGrupBasit('ANAISLEM', 'Ana İşlem', 'anaislemadi');
		result.addGrupBasit('ISLEM', 'İşlem', 'islemadi');
		this.tabloYapiDuzenle_plasiyer(e).tabloYapiDuzenle_takip(e);
		result.addGrupBasit('DVKOD', 'Dv.Kod', 'dvkod');
		result.addGrupBasit('DVKUR', 'Dv.Kur', 'dvkur');
		this.tabloYapiDuzenle_baBedel(e)
	}
	tabloYapiDuzenle_odemeGun(e) { /* do nothing */ }
	loadServerData_queryDuzenle(e) {
		e.alias = e.alias ?? 'hrk'; let {stm, attrSet} = e, {hareketci, raporTanim} = this, {yatayAnaliz} = raporTanim.kullanim;
		hareketci.reset(); let {uygunluk} = hareketci, uygunlukVarmi = !$.isEmptyObject(uygunluk);
		let {varsayilanHV: hrkDefHV} = hareketci.class; $.extend(e, { hareketci, hrkDefHV });
		if (yatayAnaliz) { attrSet[DRapor_AraSeviye_Main.yatayTip2Bilgi[yatayAnaliz]?.kod] = true }
		let uni = e.uni = stm.sent = new MQUnionAll(), {uygunluk2UnionBilgiListe} = hareketci, _e = { ...e, hrkDefHV, temps: {} };
		for (let [selectorStr, unionBilgiListe] of Object.entries(uygunluk2UnionBilgiListe)) {
			let uygunmu = true; if (uygunlukVarmi) {
				let anahStr = selectorStr.split('$').filter(x => !!x).join('$');
				uygunmu = uygunlukVarmi ? !!uygunluk[anahStr] : true; if (!uygunmu) { continue }
			}
			unionBilgiListe = unionBilgiListe.map(item => getFuncValue.call(this, item, e)).filter(x => !!x);
			for (let { sent, hv: hrkHV } of unionBilgiListe) {
				$.extend(_e, {
					sent, hrkHV, hvDegeri: key => this.hrkHVDegeri({ ..._e, key }),
					sentHVEkle: (...keys) => { for (let key of keys) { this.hrkSentHVEkle({ ..._e, key }) } }
				});
				this.loadServerData_queryDuzenle_hrkSent(_e);
				if (sent?.sahalar?.liste?.length) { uni.add(sent) }
			}
		}
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		let { attrSet, sentHVEkle, sent, hrkHV: hv, hrkDefHV: defHV, hvDegeri } = e;
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
	super_tabloYapiDuzenle_odemeGun(e) { super.tabloYapiDuzenle_odemeGun(e) }
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
