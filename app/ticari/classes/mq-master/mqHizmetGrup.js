class MQHizmetGrup extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Hizmet Grup' }
	static get table() { return 'hizgrup' } static get tableAlias() { return 'hgrp' } static get kodListeTipi() { return 'HGRP' }
	static get tanimUISinif() { super.tanimUISinif  /*return MQHizmetGrupTanimPart*/ } static get silindiDesteklenirmi() { return true }
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta, kodSaha} = this, {sent} = e, {where: wh} = sent;
		wh.icerikKisitDuzenle_hizmetGrup({ saha: aliasVeNokta + kodSaha })
	}
}
