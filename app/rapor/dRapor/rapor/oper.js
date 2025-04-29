class DRapor_Oper_Gercekleme extends DRapor_OperBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return false }
	static get kod() { return 'GERCEKLEME' } static get aciklama() { return 'Gerçekleme Analizi' } static get vioAdim() { return null }
}
class DRapor_Oper_Gercekleme_Main extends DRapor_OperBase_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Oper_Gercekleme }
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments); let grupKod = 'ger';
		sec.grupEkle(grupKod, 'Gerçekleme', false);
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
			.addGrupBasit('BITTS', 'Bit. Zaman', 'bitts')
			.addToplamBasit('BRUTMIKTAR', 'Brüt Miktar', 'brutmiktar')
			.addToplamBasit('FIREMIKTAR', 'Fire Miktar', 'firemiktar')
			.addToplamBasit('ISKMIKTAR', 'Iskarta Miktarı', 'iskmiktar')
			.addToplamBasit('NETMIKTAR', 'Net Miktar', 'netmiktar')
			.addToplamBasit('NETMIKTAR2', 'Net Miktar 2', 'netmiktar2')
			.addToplamBasit('SURESN', 'Olası İşlem (sn)', 'suresn')
			.addToplamBasit('BRUTSURESN', 'Olası Brüt (sn)', 'brutsuresn')
			.addToplamBasit('DURSURESN', 'Olası Duraksama (sn)', 'dursuresn')
			.addToplamBasit('NETSURESN', 'Olası Net (sn)', 'netsuresn')
			.addToplamBasit('FAZLASURESN', 'Fazla Süre (sn)', 'fazlasuresn')
	}
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e); let {stm, attrSet} = e;
		for (let sent of stm) {
			let {sahalar, where: wh} = sent; $.extend(e, { sent });
			this.loadServerData_queryDuzenle_operOrtakBagla({ ...e, sent });
			this.donemBagla({ ...e, tarihSaha: 'emr.tarih' });
			for (const key in attrSet) {
				switch (key) {
					case 'BASTS': sahalar.add(`gdet.detbasts basts`); break
					case 'BITTS': sahalar.add(`gdet.detbitts bitts`); break
					case 'BRUTMIKTAR': sahalar.add(`SUM(gdet.miktar) brutmiktar`); break
					case 'FIREMIKTAR': sahalar.add(`SUM(gdet.firemiktar) firemiktar`); break
					case 'ISKMIKTAR': sahalar.add(`SUM(gdet.iskartamiktar) iskmiktar`); break
					case 'NETMIKTAR': sahalar.add(`SUM(gdet.netmiktar) netmiktar`); break
					case 'NETMIKTAR2': sahalar.add(`SUM(gdet.miktar2) netmiktar2`); break
					case 'SURESN': sahalar.add(`SUM(gdet.olasisuresn) suresn`); break
					case 'BRUTSURESN': sahalar.add(`SUM(gdet.brutislemsuresn) brutsuresn`); break
					case 'DURSURESN': sahalar.add(`SUM(gdet.topduraksamasuresn) dursuresn`); break
					case 'NETSURESN': sahalar.add(`SUM(gdet.netislemsuresn) netsuresn`); break
					case 'FAZLASURESN': sahalar.add(`SUM(gdet.olasifazlasuresn) fazlasuresn`); break
				}
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: 'emr', tarihSaha: 'tarih' })
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
		super.loadServerData_queryDuzenle_ek(e); let {stm, attrSet} = e;
		$.extend(e, { tezgahKodClause: 'mdur.makinakod' });
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
