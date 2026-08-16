class MQCariIl extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'İl' }
	static get table() { return 'caril' }
	static get tableAlias() { return 'il' }
	static get kodListeTipi() { return 'IL' }
    static get il2PostaKodDict() {
        let { _il2PostaKodDict: res } = this
        if (res == null) {
            let { satDef: { LegalPostaKodlari: liste = [] } = {} } = app.sabitTanimlar
            if (liste) {
                res = this._il2PostaKodDict = fromEntries(
                    liste.map(v =>
                        [v.slice(0, 2), v])
                )
            }
        }
        return res
    }

    static normalizePostaKod(posta, ilKod, ihracatmi) {
        if (posta?.length == 5)
            return posta

        ilKod = getFuncValue.call(this, ilKod, posta)
        ihracatmi = getFuncValue.call(this, ihracatmi, posta)
        return this.getPostaKodu(ilKod, ihracatmi)
    }
    static getPostaKodu(ilKod, ihracatmi) {
        if (ihracatmi)
            return '37351'
        
        let { il2PostaKodDict: d } = this
        return d[ilKod]
    }
}



/*
    PSatDefault.txt: [LegalPostaKodları]
    81  010
    il  postakodu

    ihracat: 37351 - sabit posta kodu
*/
