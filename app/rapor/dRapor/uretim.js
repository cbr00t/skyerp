class DRapor_Uretim_Gercekleme extends DRapor_Uretim {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return super.uygunmu } static get araSeviyemi() { return false }
	static get kod() { return 'GERCEKLEME' } static get aciklama() { return 'Gerçekleme Analizi' } static get vioAdim() { return null }
}
class DRapor_Uretim_Gercekleme_Main extends DRapor_Uretim_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Uretim_Gercekleme }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result
			.addToplam(new TabloYapiItem().setKA('MIKTAR', 'Miktar').addColDef(new GridKolon({ belirtec: 'miktar', text: 'Miktar', maxWidth: 130, filterType: 'input' }).tipDecimal()))
			.addToplam(new TabloYapiItem().setKA('MIKTAR2', 'Miktar 2').addColDef(new GridKolon({ belirtec: 'miktar2', text: 'Miktar 2', maxWidth: 130, filterType: 'input' }).tipDecimal()))
	}
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e); let {stm, attrSet} = e, alias = 'ger';
		for (let sent of stm.getSentListe()) {
			let {sahalar, where: wh} = sent; $.extend(e, { sent, alias });
			if (attrSet.DURNEDEN || attrSet.DURSURESN || attrSet.DURSUREDK) { this.loadServerData_queryDuzenle_gerDetayBagla({ ...e, sent }).loadServerData_queryDuzenle_duraksamaBagla({ ...e, sent }) }
			this.donemBagla({ ...e, tarihSaha: `${alias}.detbitts` }); for (const key in attrSet) {
				switch (key) {
					case 'TEZGAH': sent.fromIliski('tekilmakina tez', 'ger.tezgahkod = tez.kod'); break
					case 'MIKTAR': sahalar.add('SUM(ger.miktar) miktar'); break; case 'MIKTAR': sahalar.add('SUM(ger.miktar2) miktar2'); break
				}
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias, tarihSaha: 'detbitts' })
	}
}

class DRapor_Uretim_Duraksama extends DRapor_Uretim {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return super.uygunmu } static get araSeviyemi() { return false }
	static get kod() { return 'DURAKSAMA' } static get aciklama() { return 'Duraksama Analizi' } static get vioAdim() { return null }
}
class DRapor_Uretim_Duraksama_Main extends DRapor_Uretim_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Uretim_Duraksama }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result
			.addKAPrefix('durneden')
			.addGrup(new TabloYapiItem().setKA('DURNEDEN', 'Neden').secimKullanilir().setMFSinif(DMQDurNeden).addColDef(new GridKolon({ belirtec: 'durneden', text: 'Neden', minWidth: 210, maxWidth: 300, filterType: 'checkedlist' })))
			.addToplam(new TabloYapiItem().setKA('DURSUREDN', 'Dur. Süre (sn)').addColDef(new GridKolon({ belirtec: 'dursuresn', text: 'Dur. Süre (sn)', maxWidth: 130, filterType: 'input' })))
			.addToplam(new TabloYapiItem().setKA('DURSUREDK', 'Dur. Süre (dk)').addColDef(new GridKolon({ belirtec: 'dursuredk', text: 'Dur. Süre (dk)', maxWidth: 130, filterType: 'input' })))
	}
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e); let {stm, attrSet} = e, alias = 'mdur';
		for (let sent of stm.getSentListe()) {
			let {sahalar, where: wh} = sent; $.extend(e, { sent, alias });
			if (attrSet.DURNEDEN || attrSet.DURSURESN || attrSet.DURSUREDK) { this.loadServerData_queryDuzenle_gerDetayBagla({ ...e, sent }).loadServerData_queryDuzenle_duraksamaBagla({ ...e, sent }) }
			this.donemBagla({ ...e, tarihSaha: `${alias}.duraksamabasts` }); for (const key in attrSet) {
				switch (key) {
					case 'TEZGAH': sent.fromIliski('tekilmakina tez', `${alias}.makinakod = tez.kod`); break
					case 'DURNEDEN': sent.fromIliski('makdurneden dned', `${alias}.durnedenkod = dned.kod`); wh.add('dned.bkritikmi <> 0'); sahalar.add(`${alias}.durnedenkod`, 'dned.aciklama durnedenadi'); break
					case 'DURSURESN': sahalar.add(`SUM(${alias}.dursuresn) dursuresn`); break; case 'DURSUREDK': sahalar.add(`SUM(ROUND(${alias}.dursuresn / 60, 1)) dursuredk`); break
				}
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias, tarihSaha: 'duraksamabasts' })
	}
}
