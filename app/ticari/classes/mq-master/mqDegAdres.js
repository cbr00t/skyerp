class MQDegAdres extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'DEGADR' } static get sinifAdi() { return 'Değişken Adres' }
	static get table() { return 'degiskenadres' } static get tableAlias() { return 'dadr' }
    static get kodSaha() { return 'vknox' } static get kodEtiket() { return 'VKN/TCKN' }
    static get adiSaha() { return 'birunvan' } static get adiEtiket() { return 'Ünvan' }
    get vkn() { return this.kod }
    set vkn(v) { this.kod = v }
    get unvan() { return this.aciklama }
    set unvan(v) { this.aciklama = v }

    static pTanimDuzenle({ pTanim }) {
        super.pTanimDuzenle(...arguments)
        extend(pTanim, {
            yore: new PInstStr('yore'),
            ilKod: new PInstStr('ilkod'),
            ulkeKod: new PInstStr('ulkekod'),
            posta: new PInstStr('posta'),
            eMail: new PInstStr('email'),
            vergiDaire: new PInstStr('vdaire'),
            sahismi: new PInstBool('sahismi'),
            eFatGIBAlias: new PInstStr('efatgibalias'),
            adres: new PInstStr()
        })
    }
    static rootFormBuilderDuzenle(e = {}) {
		super.rootFormBuilderDuzenle(e)
		this.formBuilder_addTabPanelWithGenelTab(e)
		let { tabPage_genel: page } = e
		
		let form = page.addFormWithParent().yanYana()
			.addStyle_fullWH(null, 'unset')
        ;{
            form.addTextInput('yore', 'Yöre')
				.etiketGosterim_placeHolder()
                .setPlaceHolder('Yöre')
                .addStyle_wh(400)
        }
		;{
			let mfSinif = MQCariIl, { sinifAdi: etiket } = mfSinif
			form.addSimpleComboBox('ilKod', etiket)
				.etiketGosterim_placeHolder()
                .setPlaceHolder(etiket)
				.setMFSinif(mfSinif)
				.addStyle_wh(300)
		}
        ;{
			let mfSinif = MQUlke, { sinifAdi: etiket } = mfSinif
			form.addSimpleComboBox('ulkeKod', etiket)
				.etiketGosterim_placeHolder()
                .setPlaceHolder(etiket)
				.setMFSinif(mfSinif)
				.addStyle_wh(400)
		}

		form = page.addFormWithParent().yanYana()
        ;{
            form.addTextInput('posta', 'Posta')
                .etiketGosterim_placeHolder()
                .addStyle_wh(200)
            form.addTextInput('vergiDaire', 'Vergi Dairesi')
                .etiketGosterim_placeHolder()
                .addStyle_wh(400)
            form.addCheckBox('sahismi', 'Şahıs?')
                .etiketGosterim_placeHolder()
                .addStyle_wh(200)
		}

		form = page.addFormWithParent().yanYana()
		;{
			form.addTextInput('eMail', 'e-Mail')
                .etiketGosterim_placeHolder()
                .addStyle_wh(600)
            form.addTextInput('eFatGIBAlias', 'e-Fat. GIB Alias')
                .etiketGosterim_placeHolder()
                .addStyle_wh(600)
        }
		
        form = page.addFormWithParent().altAlta()
        ;{
            form.addTextArea('adres', 'Adres')
                .etiketGosterim_placeHolder()
                .addStyle_fullWH(null, 'unset')
                .setRows(2)
                //.setCols(100_000)
        }
	}
    static standartGorunumListesiDuzenle({ liste }) {
        super.standartGorunumListesiDuzenle(...arguments)
        liste.push(
            'yore', 'posta', 'ilkod', 'iladi',
            'vdaire', 'sahismi', 'email',
            'biradres'
        )
    }
    static orjBaslikListesiDuzenle({ liste }) {
        super.orjBaslikListesiDuzenle(...arguments)
        liste.push(...[
            ...this.getKAKolonlar(
                gridKolon('yore', 'Yöre', 10).checkedList(),
                gridKolon('posta', 'Posta', 7).input(),
                true    // reverse in mini-device
            ),
            ...this.getKAKolonlar(
                gridKolon('ilkod', 'İl', 5).checkedList(),
                gridKolon('iladi', 'İl Adı', 10, 'il.aciklama').checkedList()
            ),
            ...this.getKAKolonlar(
                gridKolon('ulkekod', 'Ülke', 5).checkedList(),
                gridKolon('ulkeadi', 'Ülke Adı', 15, 'ulk.aciklama').checkedList()
            ),
            gridKolon('vdaire', 'Vergi Dairesi', 10).checkedList(),
            gridKolon('sahismi', 'Şahıs?', 8).checkedList().tipBool(),
            ...this.getKAKolonlar(
                gridKolon('email', 'e-Mail', 40).input(),
                gridKolon('efatgibalias', 'GIB Alias', 50).input()
            ),
            gridKolon('biradres', 'Adres', 40).input()
        ])
    }
    static loadServerData_queryDuzenle({ sent, sent: { where: wh } }) {
		super.loadServerData_queryDuzenle(...arguments)
		let { tableAlias: alias, kodSaha } = this
		sent
            .innerJoin(alias, 'caril il', `${alias}.ilkod = il.kod`)
            .innerJoin(alias, 'carulke ulk', `${alias}.ulkekod = ulk.kod`)
	}
    hostVarsDuzenle({ hv }) {
        super.hostVarsDuzenle(...arguments)
        let { unvan, adres, class: { kodSaha, adiSaha } } = this
        let [ unvan1 = '', unvan2 = '' ] = mergedToTokens(unvan, 50)
        let [ adres1 = '', adres2 = '' ] = mergedToTokens(adres, 50)
        extend(hv, { unvan1, unvan2, adres1, adres2 })
        deleteKeys(hv, kodSaha, adiSaha)
    }
    setValues({ rec }) {
        super.setValues(...arguments)
        let { unvan1, unvan2, adres1, adres2 } = rec
        extend(this,{
            unvan: tokensToMerged([unvan1, unvan2]) ?? '',
            adres: tokensToMerged([adres1, adres2]) ?? ''
        })
    }

	static async gloVKN2Recs(e = {}) {
        let vknListe = makeArray(this.getVKNFromRec(e))
        let { globals } = this
        let cache = globals.vkn2Recs ??= {}
        let k = empty(vknListe) ? '' : vknListe.join(delimWS)
        return cache[k] ??= await this.vkn2Recs(e)
    }
    static async vkn2Recs(e = {}) {
        let vknListe = makeArray(this.getVKNFromRec(e))
        let { table, kodSaha: kodClause } = this
        let sent = new MQSent(), { where: wh, sahalar } = sent
        sent.fromAdd(table)
        wh.add(`${kodClause} <> ''`)
        if (!empty(vknListe))
            wh.inDizi(vknListe, kodClause)
        sahalar.add('*')
        
        let recs = await sent.execSelect()
        return fromEntries(
            recs.map(r => [r[kodClause], r]))
    }
    static async gloVKN2Rec(e = {}) {
        let vkn = this.getVKNFromRec(e)
        if (!vkn)
            return null
        
        let { globals } = this
        let cache = globals.vkn2Rec ??= {}
        return cache[vkn] ??= await this.vkn2Rec(e)
    }
    static async vkn2Rec(e = {}) {
        let vkn = this.getVKNFromRec(e)
        if (!vkn)
            return null
        let args = { ...(isObject(e) ? { ...e } : {}), vkn }
        let recs = values(await this.vkn2Recs(args))
        return recs?.[0]
    }
    static async gloVKN2Inst(e = {}) {
        let vkn = this.getVKNFromRec(e)
        if (!vkn)
            return null
        
        let { globals } = this
        let cache = globals.vkn2Inst ??= {}
        return cache[vkn] ??= await this.vkn2Inst(e)
    }
    static async vkn2Inst(e = {}) {
        let rec = await this.vkn2Rec(e)
        if (rec == null)
            return null

        let res = new this()
        res.setValues({ rec })

        return res
    }
    static getVKNFromRec(e = {}) {
        return ( isObject(e) ? e.vkn ?? e.vkno ?? e.vknox : e )
    }
}


/*
adres1
{name: 'adres1', xtype: 175, length: 50}
adres2
{name: 'adres2', xtype: 175, length: 50}
biradres
{name: 'biradres', xtype: 167, length: 101}
birunvan
{name: 'birunvan', xtype: 167, length: 101}
efatgibalias
{name: 'efatgibalias', xtype: 167, length: 100}
email
{name: 'email', xtype: 167, length: 100}
ilkod
{name: 'ilkod', xtype: 175, length: 3}
posta
{name: 'posta', xtype: 175, length: 10}
sahismi
{name: 'sahismi', xtype: 175, length: 1}
ulkekod
{name: 'ulkekod', xtype: 175, length: 4}
unvan1
{name: 'unvan1', xtype: 175, length: 50}
unvan2
{name: 'unvan2', xtype: 175, length: 50}
vdaire
{name: 'vdaire', xtype: 175, length: 25}
vknox
{name: 'vknox', xtype: 175, length: 11}
yore
{name: 'yore', xtype: 175, length: 30}
*/
