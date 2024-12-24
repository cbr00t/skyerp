class DRapor_Uretim_Duraksama extends DRapor_Uretim {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return super.uygunmu } static get araSeviyemi() { return false }
	static get kod() { return 'DURAKSAMA' } static get aciklama() { return 'Duraksama Analizi' } static get vioAdim() { return '' }
}
class DRapor_Uretim_Duraksama_Main extends DRapor_Uretim_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Uretim_Duraksama }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result
			.addKAPrefix('tezgah', 'durneden', 'stok', 'per')
			.addGrup(new TabloYapiItem().setKA('TEZGAH', 'Tezgah').secimKullanilir().setMFSinif(DMQTezgah).addColDef(new GridKolon({ belirtec: 'tezgah', text: 'Tezgah', minWidth: 230, maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('DURNEDEN', 'Neden').secimKullanilir().setMFSinif(DMQDurNeden).addColDef(new GridKolon({ belirtec: 'durneden', text: 'Neden', minWidth: 210, maxWidth: 300, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('STOK', 'Ürün').secimKullanilir().setMFSinif(DMQStok).addColDef(new GridKolon({ belirtec: 'stok', text: 'Ürün', minWidth: 300, maxWidth: 500, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('PER', 'Personel').secimKullanilir().setMFSinif(DMQPersonel).addColDef(new GridKolon({ belirtec: 'per', text: 'Personel', minWidth: 300, maxWidth: 500, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('EMIR', 'Emir No').secimKullanilir().addColDef(new GridKolon({ belirtec: 'fisnox', text: 'Emir', maxWidth: 380, filterType: 'checkedlist' })))
			.addToplam(new TabloYapiItem().setKA('DURSUREDN', 'Dur. Süre (sn)').addColDef(new GridKolon({ belirtec: 'dursuresn', text: 'Dur. Süre (sn)', maxWidth: 130, filterType: 'input' })))
			.addToplam(new TabloYapiItem().setKA('DURSUREDK', 'Dur. Süre (dk)').addColDef(new GridKolon({ belirtec: 'dursuredk', text: 'Dur. Süre (dk)', maxWidth: 130, filterType: 'input' })))
	}
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e); let {stm, attrSet} = e, {sent} = stm, {sahalar, where: wh} = sent;
		$.extend(e, { sent }); sent.fromAdd('isemri emr').fromIliski('emirdetay edet', 'edet.fissayac = emr.kaysayac').fromIliski('operemri oem', 'oem.emirdetaysayac = edet.kaysayac');
		if (attrSet.DURNEDEN || attrSet.DURSURESN || attrSet.DURSUREDK || attrSet.PER) {
			sent/*.fromIliski('opemirislem oisl', 'oisl.oemsayac = oem.kaysayac')*/.fromIliski('opergerdetay ger', 'ger.fissayac = oem.kaysayac'); sent.where.add(`dned.bkritikmi <> 0`) }
		if (attrSet.DURNEDEN || attrSet.DURSURESN || attrSet.DURSUREDK) { sent.fromIliski('makduraksama mdur', 'mdur.opergersayac = ger.kaysayac') }
		if (attrSet.STOK) { sent.fromIliski('urtfrm frm', 'frm.kaysayac = edet.formulsayac') }
		this.donemBagla({ ...e, tarihSaha: 'mdur.duraksamabasts' }); for (const key in attrSet) {
			switch (key) {
				case 'TEZGAH': sent.fromIliski('tekilmakina tez', 'mdur.makinakod = tez.kod'); sahalar.add('mdur.makinakod tezgahkod', 'tez.aciklama tezgahadi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'tezgah', saha: 'mdur.makinakod' }); break
				case 'DURNEDEN': sent.fromIliski('makdurneden dned', 'mdur.durnedenkod = dned.kod'); sahalar.add('mdur.durnedenkod', 'dned.aciklama durnedenadi'); break
				case 'STOK': sent.fromIliski('stkmst stk', 'frm.formul = stk.kod'); sahalar.add('frm.formul stokkod', 'stk.aciklama stokadi'); wh.icerikKisitDuzenle_stok({ ...e, saha: 'frm.formul' }); break
				case 'PER': sent.fromIliski('personel per', 'ger.perkod = per.kod'); sahalar.add('ger.perkod', 'per.aciklama peradi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'personel', saha: 'ger.perkod' }); break
				case 'EMIR': sahalar.add('emr.fisnox'); break; case 'DURSURESN': sahalar.add('SUM(mdur.dursuresn) dursuresn'); break
				case 'DURSUREDK': sahalar.add('SUM(ROUND(mdur.dursuresn / 60, 1)) dursuredk'); break
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: 'mdur', tarihSaha: 'duraksamabasts' })
	}
}

class DRapor_Uretim_MESSinyal extends DRapor_Uretim {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return super.uygunmu } static get araSeviyemi() { return false }
	static get kod() { return 'MESSINYAL' } static get aciklama() { return 'MES Sinyal Analizi' } static get vioAdim() { return '' }
}
class DRapor_Uretim_MESSinyal_Main extends DRapor_Uretim_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Uretim_MESSinyal }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result
			.addKAPrefix('tezgah')
			.addGrup(new TabloYapiItem().setKA('TEZGAH', 'Tezgah').secimKullanilir().setMFSinif(DMQTezgah).addColDef(new GridKolon({ belirtec: 'tezgah', text: 'Tezgah', minWidth: 230, maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('TIP', 'Tip')
				.setFormul([], ({ rec }) => asBool(rec.bsanal) ? '<span class=orangered>Sanal</span>' : '<span class=royalblue>Cihaz</span>')
				.addColDef(new GridKolon({ belirtec: 'bsanal', text: 'Tip', minWidth: 200, maxWidth: 250, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('IP', 'Cihaz IP').secimKullanilir().addColDef(new GridKolon({ belirtec: 'ip', text: 'Cihaz IP', minWidth: 300, maxWidth: 400, filterType: 'checkedlist' })))
	}
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e); let {stm, attrSet} = e, {sent} = stm, {sahalar, where: wh} = sent;
		$.extend(e, { sent }); sent.fromAdd('messinyal sny');
		this.donemBagla({ ...e, tarihSaha: 'sny.ts' }); for (const key in attrSet) {
			switch (key) {
				case 'TEZGAH': sent.fromIliski('tekilmakina tez', 'sny.tezgahkod = tez.kod'); sahalar.add('sny.tezgahkod', 'tez.aciklama tezgahadi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'tezgah', saha: 'sny.tezgahkod' }); break
				case 'TIP': sahalar.add('sny.bsanal'); break; case 'IP': sent.sahalar.add('sny.ip'); break
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: 'sny', tarihSaha: 'ts' })
	}
}
