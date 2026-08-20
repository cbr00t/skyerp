class EYonetici_Gelen extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    get eIslTip() { return this.eIslSinif?.tip }
    set eIslTip(v) { this.eIslSinif = EIslemOrtak.getClass(v) }

    constructor(e = {}) {
        super(e)
        let { eConf, eIslSinif } = e
        eConf ??= MQEConf.instance
        eIslSinif ??= EIslFatura
        extend(this, { eConf, eIslSinif })
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

    async eIslemKaldir(e = {}) {
        let { recs = e.rec } = e
        recs = makeArray(recs) ?? []
        if (empty(recs))
            return null

        let gelen = true
        let { eConf, eIslSinif, eIslTip } = this
        if (!eIslTip)
            eIslTip = 'E'
        
        let subDir = eConf.getAnaBolumFor(eIslTip)
        if (!subDir)
            throw { isError: true, errorText: 'e-İşlem Ana Bölüm belirlenemedi'}

        let uuidListe = recs.map(r => r.uuid)
        let queryRes = await new MQIliskiliDelete({
            from: 'efgecicialfatfis',
            where: { inDizi: uuidListe, saha: 'efuuid' }
        }).execute()
        
        subDir = `${subDir.replaceAll('/', '\\')}\\ALINAN`
        let cmd = [
            `DEL /F /Q`,
            uuidListe.map(uuid =>
                `"${subDir}\\${uuid}.xml"`)
        ].filter(Boolean).join(' ')
        let df = defer(() =>
            cmd.shell_lines())
        delay(500).then(() =>
            df.resolve())
        let shellRes = await df.catch(() => {})

        return ({ eIslSinif, eIslTip, recs, queryRes, shellRes })
    }
    
    bekleyenleriGetirVeKaydet(e = {}) {
        return this._bekleyenleriGetir({ ...e, defsOnly: false })
    }
    bekleyenleriGetir(e = {}) {
        return this._bekleyenleriGetir({ ...e, defsOnly: true })
    }
    async _bekleyenleriGetir({ tarihBS, eskilerAlinsin, recsDuzenle, defsOnly } = {}) {
        let { eConf, eIslSinif, eIslTip } = this
        let efAyrimTipi = eIslTip
        if (efAyrimTipi == 'E' || efAyrimTipi == 'A')
            efAyrimTipi = ''
        
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
    	let eIslemci = eIslTip
        let eLogin = toJSONStr(eConf.eLogin)
        let ekArgs = toJSONStr(eConf.eIslEkArgs)
        eskilerAlinsin ??= true

        if (tarihBS) {
            let { basi, sonu } = tarihBS
            basi = dateToString(basi)
            sonu = dateToString(sonu)
            tarihBS = { basi, sonu }
        }

        let wsRes
        ;{
        	let args = { gelen, eskilerAlinsin, xmlContentFlag, tarihBS }
        	wsRes = await app.wsEIslemYap({ eIslemci, oe, eIslemAPI, eLogin, ekArgs, args })
        }
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
            ;{
                let { efAyrimTipi: v } = eFis
                if (v == 'E' || v == 'A')
                    v = ''

                if (v == efAyrimTipi)
                    recs.push(eFis)
            }
    	}

        let _recs = recsDuzenle?.call?.(this, { ...arguments[0], efAyrimTipi, recs })
        recs = _recs ?? recs
        if (empty(recs))
            return null

        let uuid2Rec = fromEntries(
            recs.map(r => [r.uuid, r]))

        let res = { efAyrimTipi, recs, uuid2Rec }
        if (defsOnly) {
            await EFis.topluEkBilgileriBelirle(recs)
            return res
        }

        let args = { ...e, ...res }
        await this.geciciFisKaydet(args)
        mergeInto(args, res, 'recs', 'uuid2Rec')
        
        return res
        
    }
    async geciciFisKaydet(e = {}) {
        let { recs, uuid2Rec, silent } = e
        if (empty(recs))
            return null
        
        await EFis.topluEkBilgileriBelirle(recs)
        uuid2Rec ??= fromEntries(
            recs.map(r => [r.uuid, r]))

        let args = { ...e, recs, uuid2Rec }
        await this._kaydet_onKontrol(args)
        mergeInto(args, e, 'recs', 'uuid2Rec')
        
        await this._geciciFisKaydet(args)
        mergeInto(args, e, 'recs', 'uuid2Rec')

        return { recs, uuid2Rec, silent }
    }
    async _kaydet_onKontrol({ efAyrimTipi, recs, uuid2Rec, silent }) {
        let islemAdi = 'Alım Geçici e-İşlem'
        let alim = true

        let { vergi: { vknTckn: isyVKN } = {} } = app.params?.isyeri ?? {}
        let warns = [], errors = []
        for (let r of recs) {
            let { aliciVKN: vkn } = r
            if (vkn && vkn != isyVKN) {
                warns.push([
                    `<div>`,
                        `<span>Alınan e-İşlem Belgesindeki</span>`,
                        `<ul>`,
                            `<li><u>Alıcı VKN bilgisi</u>: <b>${vkn}</b></li>`,
                            `<li><u>Bu İşyerine ait VKN</u>: <b>${isyVKN}</b></li>`,
                        `</ul>`,
                        `<span>farklıdır.</span>`,
                    `</div>`,
                    `<div style="font-weight: bold; color: firebrick; margin-top: 5px; padding-left: 30px;">`,
                        `Yine de devam edilsin mi?`,
                    `</div>`
                ].map('\n'))
            }
        }

        /*;{
            let duplUni = new MQUnionAll()
            duplStm = new MQStm({ sent: duplUni })
            
            let uuidListe = keys(uuid2Rec)
            let fisNoxListe = recs.map(r => r.fisNox)
            ;{
                let sent = new MQSent(), { where: wh, sahalar } = sent
                sent.fromAdd('efgecicialfatfis fis')
                wh
                    .degerAta(efAyrimTipi, 'fis.efbelge')
                    .add(new MQOrClause()
                        //.add(new MQAndClause([]))
                        .inDizi(keys(uuid2Rec), 'fis.efuuid')
                        .inDizi(fisNoxListe, 'fis.effatnox')
                    )
                sahalar.add(`1 gecici`, 'fis.effatnox fisNox', 'fis.efuuid uuid')
                duplUni.add(sent)
            }
            
            ;{
                let sent = new MQSent(), { where: wh, sahalar } = sent
                sent
                    .fromAdd('piffis fis')
                    .fis2CariBagla()
                wh
                    .degerAta(pifTipi, 'fis.piftipi')
                    .add(new MQOrClause()
                        .inDizi(uuidListe, 'fis.efatuuid')
                        .add(new MQAndClause()
                            .ticariGC({ alim })
                            .inDizi(fisNoxListe, 'fis.fisnox')
                        )
                    )
                sahalar.add(`0 gecici`, 'fis.fisnox fisNox', 'fis.efatuuid uuid')
                duplUni.add(sent)
            }
        }

        let duplRecs = await duplStm.execSelect()
        if (!empty(duplRecs)) {
            warns.push(
                ...duplRecs.map(({ gecici, fisNox }) =>
                    `${fisNox} numaralı belge ${gecici ? 'Geçici Listede ' : ''}tekrarlandığı için alınmayacak`)
            )
            deleteKeys(uuid2Rec, duplRecs.map(r => r.uuid))
            recs = values(uuid2Rec)
            extend(e, { recs, uuid2Rec })
        }*/

        ;{
            if (!(silent || empty(warns))) {
                let rdlg = await ehConfirm(
                    getMergedText(null, warns, 'Devam edilsin mi?'),
                    islemAdi
                )
                if (!rdlg)
                    throw { isError: true, rc: 'userAbort' }
            }
            if (!empty(errors))
                throw { isError: true, errorText: getMergedText(null, errors) }
        }
        
        return this
    }
    async _geciciFisKaydet({ efAyrimTipi, recs, uuid2Rec }) {
        let alim = true
        let eIrsmi = efAyrimTipi == 'IR'
        let pifTipi = eIrsmi ? 'I' : 'F'
    
        let toplu = new MQToplu()
        let fissayac = '@fisSayac'.sqlConst()
        ;{
            toplu.add(`DECLARE @fisSayac BIGINT`)
            for (let r of recs) {
                let { uuid, fisNox, mustKod } = r
                toplu.add(
                    `IF NOT EXISTS (`,
                        new MQUnionAll([
                            new MQSent({
                                from: 'efgecicialfatfis fis',
                                sahalar: ['1'],
                                where: new MQWhereClause()
                                    .degerAta(efAyrimTipi, 'fis.efbelge')
                                    .add(new MQOrClause()
                                        .degerAta(uuid, 'fis.efuuid')
                                        .degerAta(fisNox, 'fis.effatnox')
                                    )
                            }),
                            new MQSent({
                                from: 'piffis fis',
                                sahalar: ['1'],
                                where: new MQWhereClause()
                                    .degerAta(pifTipi, 'fis.piftipi')
                                    .add(new MQOrClause()
                                        .degerAta(uuid, 'fis.efatuuid')
                                        .add(new MQAndClause()
                                            .ticariGC({ alim })
                                            .degerAta(mustKod, 'fis.must')
                                            .degerAta(fisNox, 'fis.fisnox')
                                        )
                                    )
                            }).fis2CariBagla()
                        ]),
                    `) BEGIN`,
                        new MQQueryInsert({
                            table: 'efgecicialfatfis',
                            hv: r.alimGeciciBaslikHostVars()
                        }),
    
                        `SET @fisSayac = CONVERT(BIGINT, SCOPE_IDENTITY())`,
    
                        new MQQueryInsert({
                            table: 'efgecicialfatdetay',
                            hvListe: r.detaylar.map(d => ({
                                ...d.alimGeciciDetayHostVars(),
                                fissayac
                            }))
                        }),
                    `END`
                )
            }
        }
    
        await app.sqlTrnDo(null, async () => {
            await toplu.execute()
            return true
        })
    }
}
