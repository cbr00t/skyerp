MQEIslem_Gelen.BekSorguFiltre = class BekSorguFiltre extends DonemselSecimler {
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
