class DRapor_Oper_GerDurumOrtak extends DRapor_OperBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return true }
}
class DRapor_Oper_GerDurumOrtak_Main extends DRapor_OperBase_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Oper_GerDurumOrtak } static get defaultAlias() { return null }
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments); let grupKod = 'emirOper';
		sec.grupEkle(grupKod, 'Emir/Oper.', false);
		sec.secimTopluEkle({
			sadeceDevamEdenEmirler: new SecimBoolTrue({ grupKod, etiket: 'Sadece Devam Eden Emirler' }),
			operasyonDurumu: new SecimTekSecim({
				grupKod, etiket: 'Operasyon Durumu',
				tekSecim: new BuDigerVeHepsi(['<span class=royalblue>Sadece Son</span>', '<span class=firebrick>Sadece Kritik</span>'])
			}),
			operasyonIslenebilirlik: new SecimTekSecim({
				etiket: 'İşlenebilirlik',
				tekSecim: new BuDigerVeHepsi(['<span class=royalblue>İşlenebilir</span>', '<span class=firebrick>İşleneMEZ</span>'])
			})
		}).whereBlockEkle(({ secimler: sec, where: wh }) => {
			let {value: sadeceDevamEdenEmirler} = sec.sadeceDevamEdenEmirler, {tekSecim: operasyonDurumu} = sec.operasyonDurumu;
			let {tekSecim: operasyonIslenebilirlik} = sec.operasyonIslenebilirlik;
			if (sadeceDevamEdenEmirler) { wh.degerAta('D', 'emr.durumu').add('oem.bittarih IS NULL') }
			if (!operasyonDurumu.hepsimi) {
				let saha = operasyonDurumu.bumu ? 'sonasama' : 'kritikmi';
				wh.add(`oem.${saha} <> ''`)
			}
			if (!operasyonIslenebilirlik.hepsimi) {
				let operand = operasyonIslenebilirlik.bumu ? '>' : '=';
				wh.add(`oem.islenebilirmiktar ${operand} 0`)
			}
		})
	}
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments);
		result
			.addGrupBasit('BASTS', 'Baş. Zaman', 'basts')
			.addGrupBasit('BITTS', 'Bit. Zaman', 'bitts');
		this.tabloYapiDuzenle_brutMiktarOncesi(...arguments);
		result
			.addToplamBasit('BRUTMIKTAR', 'Brüt Mkt.', 'brutmiktar')
			.addToplamBasit('FIREMIKTAR', 'Fire Mkt.', 'firemiktar')
			.addToplamBasit('ISKMIKTAR', 'Iskarta Mkt.', 'iskmiktar')
			.addToplamBasit('NETMIKTAR', 'Net Mkt.', 'netmiktar')
			.addToplamBasit('NETMIKTAR2', 'Net Mkt 2', 'netmiktar2');
		let brmDict = app.params?.stokBirim?.brmDict ?? {}, {tip2BrmListe} = MQStokGenelParam;
		let brmListe = Object.keys(tip2BrmListe ?? {});
		for (let tip of brmListe) {
			let fra = brmDict[tip];
			result.addToplamBasit(`NETMIKTAR${tip}`, `Net Mkt-${tip}`, `netmiktar${tip}`, null, 100, ({ colDef }) => colDef.tipDecimal(fra))
		}
	}
	tabloYapiDuzenle_brutMiktarOncesi(e) { }
	loadServerData_queryDuzenle_ek(e) {
		let {defaultAlias: alias} = this.class; $.extend(e, { tezgahKodClause: `${alias}.tezgahkod`, perKodClause: `${alias}.perkod` });
		super.loadServerData_queryDuzenle_ek(e); let {stm, attrSet, netMiktarClause} = e, PrefixMiktar = 'NETMIKTAR';
		for (let sent of stm) {
			let {sahalar, where: wh} = sent; $.extend(e, { sent });
			this.loadServerData_queryDuzenle_operOrtakBagla({ ...e, sent });
			if (attrSet.STOK || Object.keys(attrSet).find(x => x.startsWith(PrefixMiktar))) {
				this.loadServerData_queryDuzenle_formulBagla(e);
				sent.x2StokBagla({ kodClause: 'frm.formul' });
				sahalar.add('stk.brm')
			}
			for (let key in attrSet) {
				switch (key) {
					case PrefixMiktar:
						sahalar.add(`SUM(${netMiktarClause}) netmiktar`);
						break
					default:
						if (key.startsWith(PrefixMiktar)) {
							let brmTip = key.slice(PrefixMiktar.length)?.toUpperCase();
							sahalar.add(`${this.getBrmliMiktarClause({ brmTip, mstAlias: 'stk', getMiktarClause: () => netMiktarClause })} netmiktar${brmTip}`)
						}
						break
				}
			}
			this.donemBagla({ ...e, tarihSaha: 'emr.tarih' })
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: 'emr', tarihSaha: 'tarih' })
	}
}

class DRapor_Oper_Gercekleme extends DRapor_Oper_GerDurumOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return false }
	static get kod() { return 'GERCEKLEME' } static get aciklama() { return 'Gerçekleme Analizi' } static get vioAdim() { return null }
}
class DRapor_Oper_Gercekleme_Main extends DRapor_Oper_GerDurumOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return false }
	static get raporClass() { return DRapor_Oper_Gercekleme } static get defaultAlias() { return 'gdet' }
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments);
		result
			.addToplamBasit('SURESN', 'Olası İşlem (sn)', 'suresn')
			.addToplamBasit('BRUTSURESN', 'Olası Brüt (sn)', 'brutsuresn')
			.addToplamBasit('DURSURESN', 'Olası Duraksama (sn)', 'dursuresn')
			.addToplamBasit('NETSURESN', 'Olası Net (sn)', 'netsuresn')
			.addToplamBasit('FAZLASURESN', 'Fazla Süre (sn)', 'fazlasuresn')
	}
	loadServerData_queryDuzenle_ek(e) {
		let {defaultAlias: alias} = this.class, {stm, attrSet} = e;
		let netMiktarClause = e.netMiktarClause = `${alias}.netmiktar`;
		super.loadServerData_queryDuzenle_ek(e);
		for (let {sahalar, where: wh} of stm) {
			for (let key in attrSet) {
				switch (key) {
					case 'BASTS': sahalar.add(`${alias}.detbasts basts`); break
					case 'BITTS': sahalar.add(`${alias}.detbitts bitts`); break
					case 'BRUTMIKTAR': sahalar.add(`SUM(${alias}.miktar) brutmiktar`); break
					case 'FIREMIKTAR': sahalar.add(`SUM(${alias}.firemiktar) firemiktar`); break
					case 'ISKMIKTAR': sahalar.add(`SUM(${alias}.iskartamiktar) iskmiktar`); break
					case 'NETMIKTAR2': sahalar.add(`SUM(${alias}.miktar2) netmiktar2`); break
					case 'SURESN': sahalar.add(`SUM(${alias}.olasisuresn) suresn`); break
					case 'BRUTSURESN': sahalar.add(`SUM(${alias}.brutislemsuresn) brutsuresn`); break
					case 'DURSURESN': sahalar.add(`SUM(${alias}.topduraksamasuresn) dursuresn`); break
					case 'NETSURESN': sahalar.add(`SUM(${alias}.netislemsuresn) netsuresn`); break
					case 'FAZLASURESN': sahalar.add(`SUM(${alias}.olasifazlasuresn) fazlasuresn`); break
				}
			}
		}
	}
}

class DRapor_Oper_Durum extends DRapor_Oper_GerDurumOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return false }
	static get kod() { return 'OPERDURUM' } static get aciklama() { return 'Oper. Durum Analizi' } static get vioAdim() { return null }
}
class DRapor_Oper_Durum_Main extends DRapor_Oper_GerDurumOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return false }
	static get raporClass() { return DRapor_Oper_Durum } static get defaultAlias() { return 'oem' }
	tabloYapiDuzenle_brutMiktarOncesi({ result }) {
		super.tabloYapiDuzenle_brutMiktarOncesi(...arguments);
		result.addToplamBasit('EMIRMIKTAR', 'Emir Miktar', 'emirmiktar')
	}
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments);
		result.addGrupBasit('ISLENEBILIRMIKTAR', 'İşl.Mikt.', 'islenebilirmiktar')
	}
	loadServerData_queryDuzenle_ek(e) {
		let {defaultAlias: alias} = this.class, {stm, attrSet} = e;
		let netMiktarClause = e.netMiktarClause = `${alias}.uretnetmiktar`;
		super.loadServerData_queryDuzenle_ek(e);
		for (let {sahalar, where: wh} of stm) {
			for (let key in attrSet) {
				switch (key) {
					case 'BASTS': sahalar.add(`(case when ${alias}.bastarih IS NULL then NULL else ${alias}.bastarih + ${alias}.baszaman end) basts`); break
					case 'BITTS': sahalar.add(`(case when ${alias}.bittarih IS NULL then NULL else ${alias}.bittarih + ${alias}.bitzaman end) bitts`); break
					case 'ISLENEBILIRMIKTAR': sahalar.add(`SUM(${alias}.islenebilirmiktar) islenebilirmiktar`); break
					case 'EMIRMIKTAR': sahalar.add(`SUM(${alias}.emirmiktar) emirmiktar`); break
					case 'BRUTMIKTAR': sahalar.add(`SUM(${alias}.uretbrutmiktar) brutmiktar`); break
					case 'FIREMIKTAR': sahalar.add(`SUM(${alias}.uretfiremiktar) firemiktar`); break
					case 'ISKMIKTAR': sahalar.add(`SUM(${alias}.uretiskartamiktar) iskmiktar`); break
					case 'NETMIKTAR2': sahalar.add(`SUM(${alias}.uretnetmiktar2) netmiktar2`); break
				}
			}
		}
	}
}


class DRapor_Oper_Iskarta extends DRapor_OperBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return false } static get uygunmu() { return false }
	static get kod() { return 'ISKARTA' } static get aciklama() { return 'Iskarta Analizi' } static get vioAdim() { return null }
}
class DRapor_Oper_Iskarta_Main extends DRapor_OperBase_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Oper_Iskarta }
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments); let {iskartaMaxSayi} = app.params.operGenel;
		result.addKAPrefix('neden')
			.addGrupBasit('NEDEN', 'Neden', 'neden', DMQDurNeden)
			.addToplamBasit('MIKTAR', 'Miktar', 'miktar')
	}
	loadServerData_queryDuzenle_ek(e) {
		$.extend(e, { tezgahKodClause: 'gdet.tezgahkod', perKodClause: 'gdet.perkod' });
		super.loadServerData_queryDuzenle_ek(e); let {iskartaMaxSayi} = app.params.operGenel, {stm, attrSet} = e;
		let wUni = new MQUnionAll(); for (let i = 1; i <= iskartaMaxSayi; i++) {
			let sent = new MQSent({
				from: 'operemri', where: `iskartanedenkod${i} <> ''`,
				sahalar: ['gersayac', 'nedenkod', `iskartamiktar${i} iskmiktar`]
			});
			wUni.add(sent)
		}
		stm.with.add(new MQToplu([
			`onkomut ${new MQClause(['gersayac', 'nedenkod', 'iskmiktar']).parantezli()} AS`,
			new MQClause([wUni]).parantezli()
		]));
		for (let sent of stm) {
			let {sahalar, where: wh} = sent; $.extend(e, { sent });
			sent.fromAdd('onkomut onk'); this.loadServerData_queryDuzenle_gerDetayBagla(e);
			wh.add(`gdet.kaysayac = onk.gersayac`); this.donemBagla({ ...e, tarihSaha: 'onk.gertarih' });
			for (let key in attrSet) {
				switch (key) {
					case 'NEDEN':
						sent.fromIliski('opiskartanedeni ined', 'onk.isknedenkod = ined.kod');
						sahalar.add('ined.kod nedenkod', 'ined.aciklama nedenadi');
						break
					case 'MIKTAR':
						sahalar.add('SUM(onk.iskmiktar) miktar');
						break
				}
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: 'onk', tarihSaha: 'gertarih' })
	}
}

class DRapor_Oper_Duraksama extends DRapor_OperBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return false }
	static get kod() { return 'DURAKSAMA' } static get aciklama() { return 'Duraksama Analizi' } static get vioAdim() { return null }
}
class DRapor_Oper_Duraksama_Main extends DRapor_OperBase_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Oper_Duraksama }
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments);
		result.addKAPrefix('neden')
			.addGrupBasit('NEDEN', 'Neden', 'neden', DMQDurNeden)
			.addToplamBasit('SURESN', 'Dur. Süre (sn)', 'suresn')
			.addToplamBasit('SUREDK', 'Dur. Süre (dk)', 'suredk')
	}
	loadServerData_queryDuzenle_ek(e) {
		$.extend(e, { tezgahKodClause: 'mdur.makinakod', perKodClause: 'gdet.perkod' });
		super.loadServerData_queryDuzenle_ek(e); let {stm, attrSet} = e;
		for (let sent of stm) {
			let {sahalar, where: wh} = sent; $.extend(e, { sent });
			this.loadServerData_queryDuzenle_operOrtakBagla(e).loadServerData_queryDuzenle_gerDetayBagla(e);
			this.loadServerData_queryDuzenle_duraksamaBagla(e).donemBagla({ ...e, tarihSaha: 'mdur.duraksamabasts' });
			for (let key in attrSet) {
				switch (key) {
					case 'NEDEN': sent.fromIliski('makdurneden dned', `mdur.durnedenkod = dned.kod`); wh.add('dned.bkritikmi <> 0'); sahalar.add('dned.kod nedenkod', 'dned.aciklama nedenadi'); break
					case 'SURESN': sahalar.add(`SUM(mdur.dursuresn) suresn`); break;
					case 'SUREDK': sahalar.add(`SUM(ROUND(mdur.dursuresn / 60, 1)) suredk`); break
				}
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: 'mdur', tarihSaha: 'duraksamabasts' })
	}
}
