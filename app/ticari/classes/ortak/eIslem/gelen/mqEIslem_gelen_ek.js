class MQEIslem_Gelen_BekSorguFiltre extends DonemselSecimler {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    constructor() {
        super(...arguments)
        let { donem: { tekSecim: donem } } = this
        donem.buAy()
        this.secimTopluEkle({
            vknKontrol: new SecimBoolTrue({ etiket: 'Sadece Alıcı VKN eşleşenler alınsın' }),
            aliasKontrol: new SecimBool({ etiket: 'Sadece Alıcı GIB Alias eşleşenler alınsın' })
        })
    }
}

class MQEIslem_Gelen_EkBilgiUI extends SimplePart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    static get title() { return 'Alım Fişi İçeri Alımı' }
    get rec() { return this._rec }
    set rec(v) {
        if (v)
            v = { ...v }
        this._rec = v
    }
    get eConf() { return this._eConf }
    set eConf(v) { this._eConf = v ?? MQEConf.instance }

    constructor(e = {}) {
        super(e)
        let { eConf, rec, tamamIslemi } = e
        extend(this, { eConf, rec, tamamIslemi })
    }
    run(e) {
        let { rec } = this
        if (rec)
            rec.fisTipi ??= ''
        return super.run(e)
    }
    
    rfbDuzenle(e) {
        super.rfbDuzenle(e)
		let { islemTuslari, content } = this
        let { style, tools: t } = this.ekBilgi_styleAndTools
        let altInst = () =>
            this.rec

        let width = '80%', maxWidth = 1200
        let btnHeight = 60
		;{
            islemTuslari
    			.setTip('tamamVazgec')
    			.setId2Handler({
    				tamam: _e => this.tamamIstendi({ ...e, ..._e }),
    				vazgec: _e => this.vazgecIstendi({ ...e, ..._e })
    			})
        }

        ;{
            content.addForm('_baslikBilgi')
                .setLayout(() => {
                    let { rec } = this
                    let { tarih, fisNox, eIslTip, gondericiUnvan: unvan, gondericiVKN: vkn } = rec ?? {}
                    let eIrsmi = EYonetici_Gelen.eIrsmi(eIslTip)
                    let tarihStr = asDateAndToKisaString(tarih)
                    
                    return $([
                        `<div class="full-wh">`,
                            `<div class="parent flex-row full-width">`,
                                t.ka('tarih', 'Tarih:', tarihStr),
                                t.ka('fisNox', 'Fiş No:', fisNox),
                                ( eIrsmi ? t.div('İrsaliye', 'bold fs-120 orangered') : null ),
                            `</div>`,
                            `<div class="parent flex-row full-width">`,
                                t.ka('unvan', 'Gönderici:', unvan),
                                t.ka('vkn', 'VKN:', vkn, null),
                            `</div>`,
                        `</div>`
                    ].filter(Boolean).join(''))
                })
                .addStyle_fullWH(null, 'auto')
                .addStyle(style)
                .addStyle(`
                    $elementCSS { width: ${width}; max-width: ${maxWidth - 30}px }
                    $elementCSS .vkn > .veri { color: forestgreen }`
                )
        }

        ;{
            let parentForm = content.addFormWithParent().altAlta()
                .addCSS('center')
                .addStyle_wh(width)
                .addStyle(`$elementCSS { max-width: ${maxWidth}px !important }`)
            ;{
                let form = parentForm.addFormWithParent().altAlta()
                form.addSimpleComboBox('gondericiMustKod', 'Cari Hesap', 'Cari Hesap')
                    .etiketGosterim_yok()
                    .setAltInst(altInst)
                    .setMFSinif(MQCari)
                    .degisince(({ type, events, builder: { parentBuilder } }) => {
                        if (type != 'batch')
                            return

                        let { value: kod } = events.at(-1)
                        let { elmMustBilgi: layout, rec } = this
                        if (layout) {
                            delay(1).then(() =>
                            this.getMustHTML(rec).then(elm => {
                                layout.empty()
                                elm?.appendTo(layout)
                            }))
                        }
                    })
                    .onAfterRun(({ builder: { part } }) =>
                        this.ddMustKod = part)
            }
            ;{
                parentForm.addForm('_mustBilgi')
                    .setLayout(() =>
                        $(`<div class="full-wh"></div>`))
                    .onAfterRun(({ builder: { layout } }) => {
                        this.elmMustBilgi = layout
                        this.getMustHTML(this.rec).then(elm => {
                            layout.empty()
                            elm?.appendTo(layout)
                        })
                    })
                    .addStyle_fullWH(null, 'auto')
                    .addCSS('fs-29')
                    .addStyle(style)
                    .addStyle(...[
                        `$elementCSS { max-width: ${maxWidth - 5}px !important; margin-top: 0 !important }
                         $elementCSS .vkn > .veri { color: forestgreen }`
                    ])
            }
            ;{
                let form = parentForm.addFormWithParent().yanYana()
                    .addStyle(...[
                        `$elementCSS { gap: 20px; margin-bottom: 20px }
                         $elementCSS button { height: ${btnHeight}px !important }
                         $elementCSS button.jqx-fill-state-normal { color: #eee !important }
                         $elementCSS button.jqx-fill-state-hover { color: #fff !important; filter: brightness(0.9) !important }
                         $elementCSS button.jqx-fill-state-pressed { filter: brightness(1.3) !important }`
                    ])
                form.addButton('vknIcinArastir', 'VKN için Araştır')
                    .onClick(_e => this.vknIcinArastirIstendi({ ...e, ..._e }))
                    .addStyle(`$elementCSS > button { background-color: #2b888c !important }`)
                form.addButton('yeniCari', 'VKN için Yeni Satıcı')
                    .onClick(_e => this.yeniCariIstendi({ ...e, ..._e }))
                    .addStyle(`$elementCSS > button { background-color: #107d04 !important }`)
            }
        }
        
        ;{
            content.addForm().setLayout(() =>$(
                `<div class="teal ek-bilgi fs-90 pl-10">` +
                    `Önceden belirlenen dönüşüm '<b>Alım Vergi Cari Hesap Referansı</b>' ` +
                    `adımından değiştirilebilir` +
                `</div>`
            ))
        }
        ;{
            let form = content.addFormWithParent()
                .yanYana(2)
                .addStyle_wh(width)
                .addStyle(...[
                    `$elementCSS { gap: 20px; max-width: 1200px !important; padding-top: 10px; margin-bottom: 20px }
                     $elementCSS button { height: ${btnHeight}px !important }
                     $elementCSS button.jqx-fill-state-normal { color: #eee !important }
                     $elementCSS button.jqx-fill-state-hover { color: #fff !important; filter: brightness(0.9) !important }
                     $elementCSS button.jqx-fill-state-pressed { filter: brightness(1.1) !important }`
                ])
            form.addButton('yeniDegAdr', `VKN için 'Değişken Adres' Oluştur`)
                .onClick(_e => this.yeniDegAdrIstendi({ ...e, ..._e }))
                .addStyle(`$elementCSS > button { background-color: #9ea0a7 !important }`)
        }
        ;{
            let form = content.addFormWithParent()
                .yanYana(2)
                .addStyle_wh(width)
                .addStyle(`$elementCSS { gap: 20px; max-width: 1200px !important; padding-top: 10px; margin-bottom: 20px }`)
            ;{
                form.addForm()
                    .setLayout(() => {
                        return $(
                            `<div
                                    class="pl-20 flex-row"
                                    style="
                                        width: max-content; padding: 15px 25px;
                                        box-shadow: 0 0 1px 0 #ccc;
                                        border-radius: 10px"
                            >` +
                                `<div class="yerKod bold royalblue">??</div>` +
                                `<div class="gray ek-bilgi" style="margin-left: 20px">Alım Şube Param'daki depo kullanılır</div>` +
                            `</div>`
                        )
                    })
                    .onAfterRun(({ builder: { layout } }) => {
                        let yerKod = 'A'  // ??
                        MQStokYer.getGloKod2Adi().then(k2a => {
                            let adi = k2a[yerKod] ?? {}
                            let text = new CKodVeAdi([yerKod, adi])
                                .parantezliOzet({ styled: true })
                            layout.find('.yerKod')
                                ?.html(text)
                        })
                    })
            }
            
            ;{
                form.addSelect('fisTipi')
                    .setEtiket('Ticari Fiş')
                    .setSource([
                        new CKodVeAdi(['', 'Normal Alım', 'normalmi']),
                        new CKodVeAdi(['I', 'Satış İADE', 'iademi'])
                    ])
                    .addStyle_wh(200)
                    .addStyle(`$elementCSS { margin-top: -30px }`)
            }
        }
	}
    
    async tamamIstendi(e = {}) {
        let sender = this
        let { tamamIslemi: handler, rec } = this
        let { gondericiMustKod: mustKod, degAdresKod, fisTipi, yerKod } = rec ?? {}

        try {
            let args = { ...e, sender, rec, mustKod, degAdresKod, fisTipi, yerKod }
            let res = await handler?.call(this, args)
            if (res !== false)
                this.close()
        }
        catch (ex) {
            cerr(ex)
            let msg = getErrorText(ex)
            if (msg)
                hConfirm(msg, this.title)
        }
    }
    vazgecIstendi(e = {}) {
        this.close(e)
    }

    async vknIcinArastirIstendi(e = {}) {
        let { silent } = e
        let { title: islemAdi } = this

        let args = { ...e }
        let res = await this.vknIcinArastir(args)

        let { errors } = args
        if (!(silent || empty(errors))) {
            hConfirm(getMergedText(null, errors), islemAdi)
            return false
        }

        return res
    }
    async vknIcinArastir(e = {}) {
        let { title: islemAdi, ddMustKod } = this
        let rec = this.rec ??= {}
        let { gondericiVKN: vkn, subeKod = '' } = rec

        let errors = e.errors ??= []
        if (!vkn) {
            errors.push('VKN belirlenemedi')
            return
        }

        let stm = new MQStm(), { orderBy } = stm
        ;{
            let uni = stm.sent = new MQUnionAll()
            ;{
                let sent = new MQSent(), { where: wh, sahalar } = sent
                sent.fromAdd('efvergi2cari')
                wh
                    .degerAta(vkn, 'vkno')
                    .add(`mustkod <> ''`)
                sahalar.add(
                    `1 oncelik`, `'' kayitTipi`,
                    `mustkod mustKod`
                )
                uni.add(sent)
            }
            ;{
                let sent = new MQSent(), { where: wh, sahalar } = sent
                sent.fromAdd('efvergi2cari')
                wh
                    .degerAta(vkn, 'vkno')
                    .add(`degadreskod <> ''`)
                sahalar.add(
                    `2 oncelik`, `'D' kayitTipi`,
                    `degadreskod mustKod`
                )
                uni.add(sent)
            }
            ;{
                let sent = new MQSent(), { where: wh, sahalar } = sent
                sent.fromAdd('carmst')
                wh
                    .degerAta(vkn, `(case when sahismi = '' then vnumara else tckimlikno end)`)
                    .add(`silindi <> ''`)
                sahalar.add(
                    `3 oncelik`, `'' kayitTipi`,
                    'must mustKod'
                )
                uni.add(sent)
            }
            ;{
                let sent = new MQSent(), { where: wh, sahalar } = sent
                sent.fromAdd('degiskenadres')
                wh.degerAta(vkn, 'vknox')
                sahalar.add(
                    `4 oncelik`, `'D' kayitTipi`,
                    'vknox mustKod'
                )
                uni.add(sent)
            }
            
            orderBy.liste = ['oncelik']
        }

        let { oncelik, kayitTipi, mustKod } = await stm.execTekil() ?? {}
        if (!mustKod) {
            errors.push('VKN için uygun kayıt bulunamadı')
            return
        }

        let degAdresKod = ''
        if (kayitTipi == 'D') {        // Değişken Adres
            let sent
            ;{
                sent = new MQSent(), { where: wh, sahalar } = sent
                sent.fromAdd('elterparam')
                wh.degerAta(subeKod, 'bizsubekod')
                sahalar.add('pesincarikod pesinCarikod')
            }
            let { pesinCarikod } = await sent.execTekilDeger()
            if (!pesinCarikod) {
                errors.push(`<b>${subeKod || '-Merkez-'}</b> kodlu Şube için Alım Şube Parametresi <b>Peşin Cari Kodu</b> girilmelidir`)
                return
            }
            
            degAdresKod = mustKod
            mustKod = pesinCariKod
        }

        if (oncelik > 1)
            await this.efVergi2CariGuncelle({ vkn, mustKod, degAdresKod })

        extend(rec, res)
        ddMustKod.val(mustKod)

        return { gondericiMustKod: mustKod, degAdresKod }
    }
    async yeniCariIstendi(e) {
        let islemAdi = 'Yeni Cari Tanımla'
        let { rec } = this
        let { gondericiMustKod: mustKod, vkn } = rec ?? {}
        if (await this.vknIcinArastir(e)) {
            hConfirm(`<b class="royalblue">${vkn}</b> VKN için kayıt zaten var`, islemAdi)
            return false
        }

        let eFis = await this.uuid2EFisBelirle(e)
        let gibAliasYapi = await this.getVKN2GIBAliasYapi(e) ?? {}
        for (let [k, v] of entries(gibAliasYapi))
            gibAliasYapi[k] ??= ''

        let { E: eFatGIBAlias, IR: eIrsGIBAlias } = gibAliasYapi
        
        let inst = new MQCari()
        // ...
        await inst.tanimla({
            kaydedince: ({ inst }) => {
                let { ddMustKod } = this
                let { kod: mustKod, vkn } = inst
                this.efVergi2CariGuncelle({ vkn, mustKod })
                rec.gondericiMustKod = mustKod
                ddMustKod?.val(mustKod)
            }
        })

        return true

        
        /*
            - vknIcinArastirIstendi  => silent + sonuç dönecek şekilde
            - vknIcinArastirIstendi(silent) çalıştır.
                varsa uyar ve çık
            - Cari Tanım:
                - Yeni Kod belirleme yapılır
                - ( vkn, gondericiUnvan ) atanır
                - uuid -> XML Dosya -> EFis  belirle.
                  varsa:
                      - adres, yore, ilKod, tel1, eMail (genel)  atanır
                      - efAyrimTipi = 'E'  yapılır  (e-İrsaliye olsa bile)
                      - efSenaryoTipi = '??' (Ticari Fatura)
                      - ORTAK..efatvkn2gibalias:
                          - ('' ve 'IR') için:
                              [vkno] için kayıt varsa:
                                  tanım inst'e atama yap
            - Cari Kaydet:
                - 'efvergi2cari' kayıt  (mustkod)
            - this.rec:  { gondericiMustKod }  atanır
        */
    }
    async yeniDegAdrIstendi(e) {
        let islemAdi = 'Yeni Değişken Adres Tanımla'
        let { rec } = this
        let { gondericiMustKod: mustKod, vkn } = rec ?? {}
        if (await this.vknIcinArastir(e)) {
            hConfirm(`<b class="royalblue">${vkn}</b> VKN için kayıt zaten var`, islemAdi)
            return false
        }

        let eFis = await this.uuid2EFisBelirle(e)

        return true
        
        /*
            - vknIcinArastirIstendi  => silent + sonuç dönecek şekilde
            - vknIcinArastirIstendi(silent) çalıştır.
                varsa uyar ve çık
            - Değ. Adr. Tanım:
                - Yeni Kod belirleme yapılır
                - ( vkn, gondericiUnvan ) atanır
                - uuid -> XML Dosya -> EFis  belirle.
                  varsa:
                      - adres, yore, ilKod, tel1, eMail (genel)  atanır
            - Cari Kaydet:
                - 'efvergi2cari' kayıt  (degadrkod)
            - this.rec:  { degAdresKod }  atanır
        */
    }

    async efVergi2CariGuncelle({ vkn, mustKod: mustKod, degAdresKod: degAdresKod } = {}) {
        let degAdresmi = !!degAdresKod
        let table = 'efvergi2cari'
        let hv = { vkno: vkn }
        if (degAdresmi)
            hv.degadreskod = degAdresKod
        else
            hv.mustkod = mustKod

        let ins = new MQInsert({ table, hv })
        return await ins.execute()
    }
    async getVKN2GIBAliasYapi({ vkn } = {}) {
        if (!vkn)
            return null

        let sent = new MQSent(), { where: wh, sahalar } = sent
        sent.fromAdd('ORTAK..efatvkn2gibalias')
        wh.degerAta(vkn, 'vkno')
        sahalar.add('aliasturu tip', 'gibalias gibAlias')
        
        let res = { 'E': null, IR: null }    // PK nedeniyle her (vkno + aliasturu) için tek kayıt gelmesi bekleniyor
        for (let { tip, gibAlias } of await sent.execSelect()) {
            let k = (
                !tip || tip == 'E' ? 'E' :
                tip == 'I' ? 'IR' : null
            )
            if (k)
                res[k] = gibAlias
        }

        return res
        
    }
    async uuid2EFisBelirle(e = {}) {
        let { rec } = this
        let { eFis, uuid = rec?.uuid } = e
        if (eFis)
            return eFis
        
        if (!uuid)
            return null

        // '' ==> 'E'  (** Giden e-İşlem açısından)
        let efAyrimTipi = EYonetici_Gelen.normalizeEFAyrimTipi(rec.eIslTip) || 'E'
        let { eConf } = this
        let subDir = eConf.getAnaBolumFor(efAyrimTipi)
        if (!subDir)
            return null
            // throw { isError: true, errorText: 'e-İşlem Ana Bölüm belirlenemedi'}

        let localFile = `${uuid}.xml`
        let remoteFile = [subDir, 'ALINAN', localFile]
            .join('/')
            .replaceAll('\\', '/')
        
        let xmlContent
        try { xmlContent = await app.wsDownloadAsStream({ remoteFile, localFile }) }
        catch (ex) { cerr(ex) }

        let xml = xmlContent ? $.parseXML(xmlContent)?.documentElement : null
        eFis = xml ? new EFis({ efAyrimTipi, eConf, xml }) : null
        if (!eFis)
            return null
        
        extend(rec, { eFis })
        return eFis
    }
    async getMustHTML({ gondericiMustKod: mustKod, degAdresKod } = {}) {
        if (!(mustKod || degAdresKod))
            return null

        let degAdresmi = !!degAdresKod
        let sent = new MQSent(), { where: wh, sahalar } = sent
        ;{
            if (degAdresmi) {
                 sent.fromAdd('degiskenadres mst')
                wh.degerAta(degAdresKod, 'mst.vknox')
            }
            else {
                sent.fromAdd('carmst mst')
                wh
                    .add(`mst.silindi = ''`)
                    .degerAta(mustKod, 'mst.must')
            }
            sent.fromIliski('caril il', 'mst.ilkod = il.kod')
            sahalar
                .addWithAlias('mst', 'yore', 'ilkod ilKod')
                .addWithAlias('il', 'aciklama ilAdi')
        }

        let { yore, ilAdi } = await sent.execTekil() ?? {}
        let { tools: t } = this.ekBilgi_styleAndTools
        let items = [
            t.ka('yore', 'Yöre:', yore || ''),
            t.ka('ilAdi', 'İl:', ilAdi || ''),
            ( degAdresmi ? t.div('Değ. Adr.', 'fs-90 bold orangered') : null )
        ].filter(Boolean)
        return empty(items) ? null : $([
            `<div class="parent flex-row full-width">`,
                ...items,
            `</div>`
        ].filter(Boolean).join(''))
    }

    setRec(v) { this.rec = v; return this }
    setEConf(v) { this.eConf = v; return this }
    setTamamIslemi(v) { this.tamamIslemi = v; return this }
}
