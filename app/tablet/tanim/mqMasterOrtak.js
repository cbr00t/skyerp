class MQMasterOrtak extends MQMasterOrtakBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kolonFiltreKullanilirmi() { return false } static get raporKullanilirmi() { return false }
    static get tanimlanabilirmi() { return false } static get degistirilebilirmi() { return super.degistirilebilirmi }
    static get silinebilirmi() { return false }


    static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		$.extend(args, { columnsMenu: false, autoShowColumnsMenuButton: true, columnsHeight: 26, groupsHeaderHeight: 28, filterable: false, updateDelay: 1 })
	}
    /*static islemTuslariDuzenle_listeEkrani({ liste }) {
        let e = arguments[0]; super.islemTuslariDuzenle_listeEkrani(e)
        liste = e.liste = liste.filter(_ => _.id != 'degistir')
    }
    static uiGirisOncesiIslemler({ islem }) {
        if (islem == 'degistir')
            throw { isError: true, errorText: 'Değişiklik yapılamaz' }
        return super.uiGirisOncesiIslemler(...arguments)
    }*/
}
