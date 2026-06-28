class FisSablonYapi extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    static get table() { return 'pifsablon' }
    static get tableAlias() { return 'sab' }
    static get kodKullanilirmi() { return false }
    static get adiSaha() { return 'sablonadi' }
    static get adiEtiket() { return 'Şablon Adı' }
    static get kaYapimi() { return true }
    static get sayacSaha() { return 'fissayac' }
    get aciklama() { return this.sablonAdi }
    set aciklama(v) { this.sablonAdi = v }
    get tarihBS() {
        let { tarihBasi: basi, tarihSonu: sonu } = this
        return new CBasiSonu({ basi, sonu })
    }
    set tarihBS(bs) {
        this.tarihBasi = bs?.basi
        this.tarihSonu = bs?.sonu
    }

    constructor(e) {
        super(e)
        ;{
            let { numYapi } = SatisFaturaFis, { tip } = numYapi
            let num = this.numarator ??= numYapi.deepCopy()
            num.tip ||= tip
        }
    }
    static pTanimDuzenle({ pTanim }) {
        super.pTanimDuzenle(...arguments)
        let { adiSaha } = this
        let { class: numSinif } = SatisFaturaFis.numYapi ?? {}
        extend(pTanim, {
            sayac: new PInstNum(),
            sablonAdi: new PInstStr(adiSaha),
            sablonOncelik: new PInstNum('sablononcelik'),
            aySonumu: new PInstBitTrue('baysonumu'),
            ayGunu: new PInstNum({ rowAttr: 'aygunu', init: e => 30 }),
            tarihBasi: new PInstDate({ rowAttr: 'bastarih', init: e => today().yilBasi() }),
            tarihSonu: new PInstDate('bittarih'),
            numarator: new PInstClass()
        })
    }
    keyHostVarsDuzenle({ hv }) {
        super.hostVarsDuzenle(...arguments)
        let { sayac, class: { sayacSaha } } = this
        hv[sayacSaha] = sayac
    }
    keySetValues({ rec }) {
        super.keySetValues(...arguments)
        let { sayacSaha } = this.class
        this.sayac = rec[sayacSaha]
    }
    hostVarsDuzenle({ hv }) {
        super.hostVarsDuzenle(...arguments)
        let { sayac: numsayac } = this.numarator ?? {}
        numsayac ||= null
        extend(hv, { numsayac })
    }
    setValues({ rec }) {
        super.setValues(...arguments)
        ;{
            let { numsayac: sayac } = rec
            let { numYapi } = SatisFaturaFis
            let { tip } = numYapi
            let num = this.numarator ??= numYapi.deepCopy()
            num.tip ||= tip
            num.sayac = sayac
        }
    }
    async yukleSonrasiIslemler(e) {
        await super.yukleSonrasiIslemler(e)
        let { numarator: num } = this
        await num.yukle()
    }
}
