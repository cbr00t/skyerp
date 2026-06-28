class SabFatOlusturucu extends Secimler {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    static get sinifAdi() { return 'Şablondan Fatura Oluştur' }

    constructor(e) {
        super(e)
        this.secimTopluEkle({
            tarih: new SecimDate({ etiket: 'Tarih', basiSonu: today() })
        })
    }
    async defaultTamamIslemi(e) {
        return await this.baslat(e) ?? true
    }
    async baslat(e = {}) {
        const MaxGun = 30
        let { tarih: { value: tarihBS = {} }, class: { sinifAdi: islemAdi } } = this
        if (isPlainObject(tarihBS))
            tarihBS = new CBasiSonu(tarihBS)

        ;{
            ;['basi', 'sonu'].forEach(k =>
                tarihBS[k] = asDate(tarihBS[k]))
            let { basi, sonu } = tarihBS
            if (!(basi && sonu))
                throw { isError: true, errorText: `<b>Tarih Aralığı</b> belirtilmelidir` }
            let gunSayi = ( ( sonu - basi ) / Date_OneDayNum ) + 1
            if (gunSayi < 1)
                throw { isError: true, errorText: `<b>Tarih Aralığı</b> değeri hatalıdır` }
            if (gunSayi > MaxGun)
                throw { isError: true, errorText: `<b>Tarih Aralığı</b> değeri <b class="firebrick">${MaxGun}</b> günden fazla olmamalı</b>` }
        }

        let st = e.state = new (class extends CObject {
            success = 0
            errors = []
            aborted = false
            abort() { this.aborted = true }
            checkAbort() {
                if (this.aborted)
                    throw { isError: true, rc: 'userAbort' }
            }
        })
        let timerProgress = setTimeout(() => showProgress(null, islemAdi, true, st.abort), 100)
        try {
            for (let tarih of tarihBS) {
                let { progressManager: pm } = globalThis
                pm?.setText(`Tarih: <b class="royalblue">${asDateAndToKisaString(tarih)}</b>`)
                st.tarih = tarih
                await this.baslatTekil(e)
            }
        }
        finally {
            clearTimeout(timerProgress)
            delay(100).then(hideProgress)
        }
        
        st = e.state ?? {}

        let { errors } = st
        if (!empty(errors)) {
            let errText = [
                `<ul>`,
                errors
                    .filter(Boolean)
                    .map(v => `<li>${v}</li>`)
                    .join('\n'),
                `</ul>`
            ].join('\n')
            hConfirm(errText, islemAdi)
            return false
        }

        let { success } = st
        if (success)
            eConfirm(`<b class="forestgreen">${success} adet</b> belge oluşturuldu`, islemAdi)

        return true
    }
    async baslatTekil({ state: st = {} } = {}) {
        let { errors = [], tarih } = st
        let { gun, aySonumu: aySonu } = tarih
        await st.checkAbort?.()

        let recs
        ;{
            let sent = new MQSent(), { where: wh, sahalar } = sent
            sent
                .fromAdd('piffis fis')
                .innerJoin('fis', 'pifsablon sab', 'fis.kaysayac = sab.fissayac')
                .innerJoin('fis', 'carmst car', 'fis.kaysayac = sab.fissayac')
                .innerJoin('sab', 'tnumara num', 'sab.numsayac = num.sayac')
            wh
                .add(`fis.piftipi = '1'`, `fis.almsat = 'T'`, `fis.iade = ''`)
                //.degerAta(tarih, 'fis.tarih')
            ;{
                let or = new MQOrClause()
                    .degerAta(gun, 'sab.aygunu')
                if (aySonu)
                    or.add(`sab.baysonumu > 0`)
                wh.add(or)
            }
            sahalar
                .addWithAlias('fis',
                    'kaysayac sablonsayac', 'must mustkod', 'almsat', 'iade',
                    'ayrimtipi', 'fisnox'
                )
                .addWithAlias('sab', 'sablonadi', 'numsayac')
                .addWithAlias('num', 'seri numseri', 'noyil numnoyil')
                .add(`${
                    new MQCase()
                     .setClause('sab.sablononcelik')
                     .when('0', '9999')
                     .else('sab.sablononcelik')
                    } oncelik`
                )
            sent.gereksizTablolariSil()

            await st.checkAbort?.()
            let stm = new MQStm({ sent, orderBy: ['oncelik', 'fisnox', 'mustkod']})
            recs = await stm.execSelect()
        }

        await st.checkAbort?.()
        let duplicate = false
        if (!empty(recs)) {
            let sayac2Rec = fromEntries( recs.map(r => [r.sablonsayac, r]) )
            ;{
                let sent = new MQSent(), { where: wh, sahalar } = sent
                sent
                    .fromAdd('piffis fis')
                    .innerJoin('fis', 'pifsablon sab', 'fis.otosablonsayac = sab.fissayac')
                wh
                    .add(`fis.piftipi = 'F'`, `fis.almsat = 'T'`, `fis.iade = ''`)
                    .degerAta(tarih, 'fis.tarih')
                    .inDizi(keys(sayac2Rec), 'fis.otosablonsayac')
                sahalar.add('fis.otosablonsayac sayac', 'fis.fisnox fisNox', 'sab.sablonadi sablonAdi')
                
                for (let { sayac, sablonAdi, fisNox } of await sent.execSelect()) {
                    duplicate = true
                    delete sayac2Rec[sayac]
                    errors.push([
                        `<b>${asDateAndToKisaString(tarih)}</b> tarihli`,
                        `<b class="royalblue">${sablonAdi}</b> fişi`,
                        `<b class="firebrick">${fisNox}</b> no olarak`,
                        `zaten var`
                    ].join(' '))
                }
            }
            recs = values(sayac2Rec)
        }
        
        if (empty(recs)) {
            if (!duplicate)
                errors.push(`<b>${asDateAndToKisaString(tarih)}</b> tarihine uygun Şablon bulunamadı`)
            return false
        }
        
        let ok = true
        for (let sabRec of recs)
            ok = await this.belgeOlustur({ state: st, sabRec }) && ok

        return ok
    }
    async belgeOlustur(e = {}) {
        let { state: st = {}, sabRec: r } = e
        let { errors = [], tarih } = st
        if (!r)
            return false

        let { sablonsayac: otoSablonSayac, sablonadi: sablonAdi, numsayac: numSayac } = r
        let fisSinif = this.class.getFisSinif(r)
        let { otoSablonSinif: sablonSinif } = fisSinif ?? {}
        if (!fisSinif) {
            errors.push(`<b class="royalblue">${sablonAdi}</b> şablonu için <b class="firebrick">Fiş Sınıfı</b> belirlenemedi`)
            return false
        }
        if (!sablonSinif) {
            errors.push(`<b class="royalblue">${sablonAdi}</b> şablonu için <b class="firebrick">Şablon Fiş Tipi</b> belirlenemedi`)
            return false
        }
        if (!otoSablonSayac) {
            errors.push(`<b class="royalblue">${sablonAdi}</b> şablonu için <b class="firebrick">Şablon Sayaç</b> belirlenemedi`)
            return false
        }

        let s2n = st.sayac2Num ??= {}
        let num = s2n[numSayac] ??= await (async () => {
            let res = fisSinif.numYapi.deepCopy()
            res.sayac = numSayac
            if (!await res.yukle())
                res = null
            return res
        })()
        if (num == null) {
            errors.push(`<b class="royalblue">${sablonAdi}</b> şablonu için <b class="firebrick">Numaratör</b> belirlenemedi`)
            return false
        }

        let sablonFis = new sablonSinif({ sayac: otoSablonSayac })
        if (!await sablonFis.yukle()) {
            errors.push(`<b class="royalblue">${sablonAdi}</b> şablonu için <b class="firebrick">Şablon Fişi</b> oluşturulamadı`)
            return false
        }

        let fis = new fisSinif()
        mergeInto(sablonFis, fis)
        extend(fis, {
            otoSablonSayac, tarih,
            numarator: num,
            sevkTarihi: tarih
        })
        
        let _e = { ...e, fis }
        let { detaylar } = fis
        ;detaylar.forEach(d =>
            d.netBedelHesapla?.(_e))
        
        while (await fis.varmi(_e))
    		fis.fisNo = (await num.kesinlestir(_e)).sonNo

        await fis.disKaydetOncesiIslemler(e)
        
         /*await fis.dipOlustur()
		let { dipIslemci } = this
		await dipIslemci?.dipSatirlariOlustur?.(e)
		await dipIslemci?.topluHesapla?.(e)*/
        let res = await fis.yaz(e)
        if (res === false) {
            errors.push(`<b class="royalblue">${sablonAdi}</b> şablonu için <b class="firebrick">Ticari Belge</b> kaydedilemedi`)
            return false
        }
        
        await fis.disKaydetSonrasiIslemler(e)
        if (st)
            st.success = ( st.success || 0 ) + 1
        
        return true
    }
    
    static getFisSinif(r = {}) {
        let { ayrimTipi: ayr } = r
        return (
            !ayr         ?  SatisFaturaFis :
            ayr == 'FS'  ?  SatisFasonFaturaFis :
            ayr == 'IH'  ?  PSatisIhracatFaturaFis :
            ayr == 'IK'  ?  SatisIhracKaydiylaFaturaFis :
            ayr == 'EX'  ?  SatisEmanetFaturaFis :
                            null
        )
    }
}
