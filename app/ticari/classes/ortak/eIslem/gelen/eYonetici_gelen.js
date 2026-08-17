class EYonetici_Gelen extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    get eIslTip() { return this.eIslSinif?.tip }
    set eIslTip(v) { this.eIslSinif = EIslemOrtak.getClass(v) }

    constructor(e = {}) {
        super(e)
        let { eConf, eIslSinif } = this
        eConf ??= MQEConf.instance
        eIslSinif ??= EIslFatura
        extend(this, { eConf, eIslSinif })
    }

    async bekleyenleriGetir({ tarihBS, eskilerAlinsin, recsDuzenle } = {}) {
        let { eConf, eIslSinif, eIslTip: efAyrimTipi } = this
        let gelen = true, xmlContentFlag = true
    	let subDir = eConf.getAnaBolumFor(efAyrimTipi)
        if (!subDir)
            throw { isError: true, errorText: 'e-İşlem Ana Bölüm belirlenemedi'}
        
    	let oe = eConf.getValue('ozelEntegrator')
    	if (isObject(oe))
    		oe = oe.char
        if (!oe)
            throw { isError: true, errorText: 'Özel Entegratör belirsizdir'}
    	
    	let eIslemAPI = 'gelenBelgeleriGetir'
    	let eIslemci = efAyrimTipi
        let eLogin = toJSONStr(eConf.eLogin)
        let ekArgs = toJSONStr(eConf.eIslEkArgs)
        eskilerAlinsin ??= true

        if (tarihBS) {
            let { basi, sonu } = tarihBS
            basi = dateToString(basi)
            sonu = dateToString(sonu)
            tarihBS = { basi, sonu }
        }
        
    	let args = { gelen, eskilerAlinsin, xmlContentFlag, tarihBS }
    	let wsRes = await app.wsEIslemYap({ eIslemci, oe, eIslemAPI, eLogin, ekArgs, args })
    	if (isArray(wsRes))
    		wsRes = wsRes[0]
    	wsRes = wsRes?.results ?? []
	
    	let recs = []
    	for (let { uuid, xmlFileName: localFile, xmlContent } of wsRes) {
    		if (!xmlContent) {
    			let remoteFile = [subDir, 'ALINAN', localFile]
    				.join('/')
    				.replaceAll('\\', '/')
    			xmlContent = await app.wsDownloadAsStream({ remoteFile, localFile })
    		}
    		let xml = xmlContent ? $.parseXML(xmlContent)?.documentElement : null
    		if (!xml)
                continue

            let eFis = new EFis({ eIslSinif, eConf, xml })
            recs.push(eFis)
    	}

        let _recs = recsDuzenle?.call?.(this, { ...arguments[0], recs })
        if (_recs === null)
            return null
        
        recs = _recs ?? recs
        if (!empty(recs))
            await EFis.topluEkBilgileriBelirle(recs)

    	return recs
    }
    async eIslemIzle(e = {}) {
        let { recs = e.rec } = e
        recs = makeArray(recs) ?? []
        if (empty(recs))
            return

        let gelen = true
        let { eConf, eIslSinif, eIslTip } = this
        let eYon = new EYonetici({ eConf, eIslSinif })
        
        let uuid2Result = {}
        //let callback = ({ uuid2Result: res }) => { }
        await eYon.eIslemIzle({ ...e, gelen, recs, uuid2Result })
        if (empty(uuid2Result))
            return null

        let html = values(uuid2Result)
            .map(r => r.divContainer?.outerHTML)
            .filter(Boolean)
            .join('\n\n')
        
        let url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
        delay(30_000).then(() =>
            URL.revokeObjectURL(url))
    
        return ({ eIslSinif, eIslTip, recs, html, url, uuid2Result })
    }
}
