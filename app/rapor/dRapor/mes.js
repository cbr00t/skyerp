class DRapor_Uretim_MESSinyal extends DRapor_MES {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return false } static get vioAdim() { return null }
	static get kod() { return 'MESSINYAL' } static get aciklama() { return 'MES Sinyal Analizi' }
}
class DRapor_Uretim_MESSinyal_Main extends DRapor_MES_Main {
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
