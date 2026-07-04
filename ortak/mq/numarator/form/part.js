class NumaratorPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return true } 
	static get partName() { return 'numarator' }
	get defaultLayoutSelector() { return `.${this.class.partName}.sub-part` }
	get yeniVeyaKopyami() { return this.islem == 'yeni' || this.islem == 'kopya' }
	get degistirVeyaSilmi() { return this.islem == 'degistir' || this.islem == 'sil' }
	get numarator() { return this.fis?.numarator }
	get otoNummu() { return !this.fis?.no && (this.numarator?.tip || this.numarator?.kod) && !this.fis?.class?.otoNumKullanilmazmi }
	
	constructor({ islem, fis, secince } = {}) {
		super(...arguments)
		extend(this, { islem, fis, secince })
	}
	runDevam(e) {
		super.runDevam(e)
		let { layout, fis, numarator } = this
		
		let seriNoForm = layout.find('.seriVeNo')
		let btnListedenSec = this.btnListedenSec =
			seriNoForm.find('#listedenSec').jqxButton({ theme })
		btnListedenSec.on('click', event =>
			this.listedenSecIstendi({ event }))
		
		let txtSeri = this.txtSeri = seriNoForm.find('#seri')
		txtSeri.on('change', ({ currentTarget: t }) =>
			t.value = fis.seri = t?.toUpperCase() || '')
		
		// if (!numarator?.tip) { txtSeri.removeClass('readOnly'); txtSeri.removeAttr('readonly') }
		
		let txtFisNo = this.txtFisNo = seriNoForm.find('#fisNo')
		this.fisNo_orjPlaceHolder = txtFisNo.attr('placeholder')
		txtFisNo.on('keyup', ({ currentTarget: t }) =>
			t.value = Number(t.value) || null)
		txtFisNo.on('change', ({ currentTarget: t }) => {
			let v = Number(t.value) || null
			fis.fisNo = v
			numarator.serbestmi = !!v
		})
		
		let { otoNummu, yeniVeyaKopyami } = this
		if (numarator) {
			if (otoNummu && yeniVeyaKopyami)
				this.seriVeSonNoBelirle(e)
			else {
				let uiGoster = () => {
					let seri = fis.seri ?? ''
					let noYil = Number(fis.noYil) || 0
					let sonNo = Number(fis.no ?? fis.fisNo) || null
					extend(numarator, { seri, noYil, sonNo })
					
					let { txtNoYil } = this
					if (txtNoYil?.length)
						txtNoYil.val(noYil)
					txtSeri.val(fis.seri || '')
					txtFisNo.val(sonNo)
				};
				if (yeniVeyaKopyami) {
					/*let inputs = layout.find('input'); if (inputs.length) { inputs.attr('readonly', ''); inputs.addClass('readOnly') }
					let buttons = layout.find('button'); if (buttons.length) { setButonEnabled(buttons, false) }*/
					uiGoster()
				}
				else
					numarator.yukle().finally(() => { uiGoster() })
			}
		}
	}
	async seriVeSonNoBelirle(e = {}) {
		let locals = app.getLocals('sonDegerler')
		let numKod2Seri = locals.numKod2Seri ??= {}
		let { numarator: num } = this

		num.seri = numKod2Seri[num.kod] ?? ''
		if (!await num.yukle()) {
			num.seri = '';
			if (!await num.yukle()) {
				num.sonNo = 0
				await num.yaz()
			}
		}
		
		;{
			let { seri, noYil, sonNo } = num
			this.otoNumGoster({ ...e, seri, noYil, sonNo })
		}
	}
	async numaratorSecildi(e = {}) {
		let rec = e.rec ?? e.recs?.[0]
		if (!rec)
			return

		let sender = this
		let { parentPart, fis, numarator: num, yeniVeyaKopyami, txtFisNo, secince } = this
		let { sayac, belirtec, belgetipi: belgeTipi } = rec
		let seri = rec.seri || ''
		let noYil = rec.noyil || 0
		let sonNo = rec.sonno || 0
		let fisNo = yeniVeyaKopyami ? null : (sonNo + 1)
		extend(fis, { seri, noYil, fisNo })
		extend(num, { sayac, belirtec, seri, noYil, sonNo })
		num.belgeTipi.char = belgeTipi
		/*this.txtSeri.val(fis.seri);*/
		let _e = { ...e, parentPart, sender, seri, noYil, sonNo: yeniVeyaKopyami ? sonNo : null }
		await this.otoNumGoster(_e)
		txtFisNo.focus()

		delay(5).then(async () => {
			await secince?.call(this, _e)
			await fis.numaratorDegisti?.(_e)
		})
	}
	otoNumGoster(e = {}) {
		let { seri, noYil, sonNo } = e
		let { fis, yeniVeyaKopyami, txtNoYil, txtSeri, txtFisNo, fisNo_orjPlaceHolder } = this
		extend(fis, { seri, noYil, fisNo: sonNo })
		if (seri != null)
			txtSeri.val(seri || '')
		if (txtNoYil?.length)
			txtNoYil.val(noYil || null)
		
		txtFisNo.val(yeniVeyaKopyami || sonNo == null ? null : sonNo + 1)
		txtFisNo.attr('placeholder', sonNo == null ? fisNo_orjPlaceHolder : sonNo + 1)
	}
	listedenSecIstendi(e = {}) {
		let { numarator: num } = this
		let result = num.class.listeEkraniAc({
			tekilmi: false,
			wndArgsDuzenle: ({ wndArgs }) => {
				let { fis } = this
				let { numYapi, class: sinifAdi } = fis
				extend(wndArgs,{
					width: 1000, height: 900, position: 'center',
					title: (
						( sinifAdi ? `<u class="bold">${sinifAdi}</u> ` : '' ) +
						`Numaratör listesi &nbsp;&nbsp;[ <span class="window-title-ek">${num.cizgiliOzet()}</span> ]`
					)
				})
			},
			yeniInstOlusturucu: e => this.fis.numYapi.deepCopy(),
			ozelKolonDuzenle: e => this.numaratorListe_ozelKolonDuzenle(e),
			ozelQueryDuzenle: e => this.numaratorListe_queryDuzenle(e),
			secince: e => this.numaratorSecildi(e)
		})
	}
	numaratorListe_ozelKolonDuzenle(e) {
		let {tabloKolonlari} = e, belirtecSet = asSet(['seri', 'noyil', 'sonno']);
		e.tabloKolonlari = tabloKolonlari.filter(colDef => belirtecSet[colDef.belirtec])
	}
	numaratorListe_queryDuzenle(e) {
		let {numarator} = this, {kod} = numarator;
		if (kod != null) { let {alias, sent} = e; sent.where.degerAta(kod, `${alias}.${numarator.class.kodSaha}`) }
	}
}
