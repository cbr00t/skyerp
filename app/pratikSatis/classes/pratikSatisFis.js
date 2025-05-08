class PratikSatisFis extends SatisFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'MAIN' } static get sinifAdi() { return 'Pratik Satış' }
	static get detaySinif() { return PratikSatisDetay } static get gridKontrolcuSinif() { return PratikSatisGridci }
	static get noYilKullanilirmi() { return false } static get dipKullanilirmi() { return false } static get dipNakliyeKullanilirmi() { return false }
	static detaySiniflarDuzenle({ liste }) { }
	static getUISplitHeight(e) { return super.getUISplitHeight(e) }
	static pTanimDuzenle({ pTanim }) { super.pTanimDuzenle(...arguments) }
	static rootFormBuilderDuzenle({ rootBuilder: rfb, baslikForm }) {
		/* super.rootFormBuilderDuzenle(...arguments) */ let {builders} = baslikForm;
		this.rootFormBuilderDuzenle_numarator(...arguments)
	}
	static rootFormBuilderDuzenle({ builders: allBuilders }) {
		/* super.rootFormBuilderDuzenle(...arguments); */ let {builders} = allBuilders.baslikForm;
		this.rootFormBuilderDuzenle_numarator(...arguments);
		builders[1].addModelKullan('mustKod').autoBind().setMFSinif(MQCari).etiketGosterim_normal()
			.ozelQueryDuzenleBlock(({ alias, stm }) => { for (let {sahalar} of stm) { sahalar.add(`${alias}.efaturakullanirmi`) } })
			.degisince(({ builder: fbd }) => fbd.altInst.cariDegisti(...arguments)).addStyle(e => `$elementCSS { min-width: 70% !important }`)
	}
	uiDuzenle_fisGirisIslemTuslari(e) { /* do nothing */ }
}
class PratikSatisDetay extends TSStokDetay { static { window[this.name] = this; this._key2Class[this.name] = this } }
class PratikSatisGridci extends TicariGridKontrolcu { static { window[this.name] = this; this._key2Class[this.name] = this } }
