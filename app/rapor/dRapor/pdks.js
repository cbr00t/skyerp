class DRapor_PDKS_Izin extends DRapor_PDKS {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return false } static get vioAdim() { return null }
	static get kod() { return 'PDKSIZIN' } static get aciklama() { return 'PDKS İzin' }
}
class DRapor_PDKS_Izin_Main extends DRapor_PDKS_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_PDKS_Izin }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result
			.addKAPrefix('per', 'gorev', 'gorevTip', 'dep', 'neden', 'anaTip')
			.addGrup(new TabloYapiItem().setKA('PER', 'Personel').secimKullanilir().setMFSinif(DMQPersonel).addColDef(new GridKolon({ belirtec: 'per', text: 'Personel', minWidth: 300, maxWidth: 500, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('GOREV', 'Görev').secimKullanilir().setMFSinif(DMQPDKSGorev).addColDef(new GridKolon({ belirtec: 'gorev', text: 'Görev', minWidth: 230, maxWidth: 300, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('GOREVTIP', 'Görev Tip').secimKullanilir().setMFSinif(DMQPDKSGorevTip).addColDef(new GridKolon({ belirtec: 'gorevtip', text: 'Görev Tip', minWidth: 230, maxWidth: 300, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('DEP', 'Departman').secimKullanilir().setMFSinif(DMQDepartman).addColDef(new GridKolon({ belirtec: 'dep', text: 'Departman', minWidth: 230, maxWidth: 300, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('SURETIPI', 'Süre Tipi').secimKullanilir().addColDef(new GridKolon({ belirtec: 'suretipi', text: 'Süre Tipi', minWidth: 230, maxWidth: 300, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('NEDEN', 'Neden').secimKullanilir().setMFSinif(DMQPDKSNeden).addColDef(new GridKolon({ belirtec: 'neden', text: 'Neden', minWidth: 230, maxWidth: 300, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('ANATIP', 'Ana Tip').secimKullanilir().setMFSinif(DMQPDKSAnaTip).addColDef(new GridKolon({ belirtec: 'anatip', text: 'Ana Tip', minWidth: 230, maxWidth: 300, filterType: 'checkedlist' })))
	
	}
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e); let {stm, attrSet} = e, {sent} = stm, {sahalar, where: wh} = sent;
		let alias = 'izn'; $.extend(e, { sent, alias }); sent.fromAdd(`pdksizin ${alias}`);
		if (attrSet.PER || attrSet.GOREV || attrSet.GOREVTIP || attrSet.DEP) { sent.fromIliski('personel per', `${alias}.perkod = per.kod`) }
		if (attrSet.GOREV || attrSet.GOREVTIP) { sent.fromIliski('pergorev pgor', 'per.gorevkod = dep.kod') }
		if (attrSet.NEDEN || attrSet.ANATIP) { sent.fromIliski('pdksizinneden ned', `${alias}.nedenkod = ned.kod`) }
		this.donemBagla({ ...e, tarihSaha: `${alias}.cikists` }); for (const key in attrSet) {
			switch (key) {
				case 'PER': sahalar.add(`${alias}.perkod`, 'per.aciklama peradi'); wh.icerikKisitDuzenle_personel({ ...e, saha: `${alias}.perkod` }); break
				case 'GOREV': sahalar.add('per.gorevkod', 'pgor.aciklama gorevadi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'gorev', saha: 'per.gorevkod' }); break
				case 'GOREVTIP': sent.fromIliski('gorevtipi pgtip', 'pgor.gorevtipkod = pgtip.kod'); sahalar.add('pgor.gorevtipkod', 'pgtip.aciklama gorevtipadi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'gorevTip', saha: 'pgor.gorevtipkod' }); break
				case 'DEP': sent.fromIliski('maldepartman dep', 'per.depkod = dep.kod'); sahalar.add('per.depkod', 'dep.aciklama depadi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'departman', saha: 'per.depkod' }); break
				case 'SURETIPI': sahalar.add(`${alias}.suretipi`); break
				case 'NEDEN': sahalar.add(`${alias}.nedenkod`, 'ned.aciklama nedenadi'); break
				case 'ANATIP':
					sahalar.add('per.depkod', 'dep.aciklama depadi');
					break
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias, tarihSaha: `${alias}.cikists` })
	}
}
