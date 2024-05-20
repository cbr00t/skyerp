class NumaratorPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return true } static get partName() { return 'numarator' } get defaultLayoutSelector() { return `.${this.class.partName}.sub-part` }
	get yeniVeyaKopyami() { return this.islem == 'yeni' || this.islem == 'kopya' } get degistirVeyaSilmi() { return this.islem == 'degistir' || this.islem == 'sil' }
	get numarator() { return this.fis?.numarator }
	get otoNummu() { return !this.fis?.no && this.numarator?.tip && !this.fis?.class?.otoNumKullanilmazmi }
	
	constructor(e) {
		e = e || {}; super(e); const {islem, fis} = e;
		$.extend(this, { islem, fis })
	}
	runDevam(e) {
		super.runDevam(e); const {layout, fis, numarator} = this, seriNoForm = layout.find('.seriVeNo');
		const btnListedenSec = this.btnListedenSec = seriNoForm.find('#listedenSec').jqxButton({ theme });
		btnListedenSec.on('click', evt => this.listedenSecIstendi({ event: evt }));
		const txtSeri = this.txtSeri = seriNoForm.find('#seri');
		txtSeri.on('change', evt => { const elm = evt.currentTarget; elm.value = fis.seri = elm.value?.toUpperCase() || '' });
		if (!numarator?.tip) { txtSeri.removeClass('readOnly'); txtSeri.removeAttr('readonly') }
		const txtFisNo = this.txtFisNo = seriNoForm.find('#fisNo'); this.fisNo_orjPlaceHolder = txtFisNo.attr('placeholder');
		txtFisNo.on('keyup', evt => evt.target.value = asInteger(evt.target.value) || null);
		txtFisNo.on('change', evt => fis.fisNo = asInteger(evt.target.value) || null);
		const {otoNummu, yeniVeyaKopyami} = this;
		if (numarator) {
			if (otoNummu && yeniVeyaKopyami) { this.seriVeSonNoBelirle(e) }
			else {
				const uiGoster = () => {
					const fisNo = asInteger(fis.no ?? fis.fisNo) || null, noYil = asInteger(fis.noYil) || 0;
					$.extend(numarator, { seri: fis.seri || '', noYil: fis.noYil || 0, sonNo: fisNo });
					const {txtNoYil} = this; if (txtNoYil?.length) { txtNoYil.val(noYil || null) }
					txtSeri.val(fis.seri || ''); txtFisNo.val(fisNo)
				};
				if (yeniVeyaKopyami) {
					const inputs = layout.find('input'); if (inputs.length) { inputs.attr('readonly', ''); inputs.addClass('readOnly') }
					const buttons = layout.find('button'); if (buttons.length) { setButonEnabled(buttons, false) }
					uiGoster()
				}
				else { numarator.yukle().finally(() => { uiGoster() }) }
			}
		}
	}
	async seriVeSonNoBelirle(e) {
		e = e || {}; const locals = app.getLocals('sonDegerler'), numKod2Seri = locals.numKod2Seri = locals.numKod2Seri || {};
		const {numarator} = this, numKod = numarator.kod, seri = numarator.seri = numKod2Seri[numKod] || '';
		if (!await numarator.yukle()) {
			numarator.seri = '';
			if (!await numarator.yukle()) { $.extend(numarator, { sonNo: 0 }); numarator.yaz() }
		}
		const _e = $.extend({}, e, { seri: numarator.seri, noYil: numarator.noYil, sonNo: numarator.sonNo + 1 }); this.otoNumGoster(_e)
	}
	numaratorSecildi(e) {
		const rec = e.rec || (e.recs || [])[0]; if (!rec) { return }
		const {fis, numarator, yeniVeyaKopyami} = this, seri = rec.seri || '', noYil = rec.noyil || 0, sonNo = rec.sonno || 0;
		$.extend(fis, { seri: seri, noYil: noYil, fisNo: yeniVeyaKopyami ? null : (sonNo + 1) })
		$.extend(numarator, { seri, noYil: noYil || 0, sonNo });
		/*this.txtSeri.val(fis.seri);*/
		const _e = $.extend({}, e, { noYil: rec.noyil, sonNo: yeniVeyaKopyami ? sonNo : null }); this.otoNumGoster(_e);
		this.txtFisNo.focus()
	}
	otoNumGoster(e) {
		const {seri, noYil, sonNo} = e, {fis, yeniVeyaKopyami, txtNoYil, txtFisNo} = this;
		$.extend(fis, { seri, noYil, fisNo: sonNo });
		if (seri != null) { this.txtSeri.val(seri || '') } if (txtNoYil?.length) { txtNoYil.val(noYil || null) }
		txtFisNo.val(yeniVeyaKopyami ? null : fis.fisNo); txtFisNo.attr('placeholder', sonNo == null ? this.fisNo_orjPlaceHolder : sonNo)
	}
	listedenSecIstendi(e) {
		const {numarator} = this;
		const result = numarator.class.listeEkraniAc({
			tekilmi: false, wndArgsDuzenle: e => {
				const {fis} = this, {sinifAdi} = fis.class, {numYapi} = fis, {wndArgs} = e;
				$.extend(wndArgs,{
					width: 1000, height: 900,
					title: (( sinifAdi ? `<u class="bold">${sinifAdi}</u> ` : '' ) + `Numaratör listesi &nbsp;&nbsp;[ <span class="window-title-ek">${numarator.cizgiliOzet()}</span> ]`),
					/*isModal: false,*/ position: 'center'
				});
			},
			yeniInstOlusturucu: e => this.fis.numYapi.deepCopy(),
			ozelKolonDuzenle: e => this.numaratorListe_ozelKolonDuzenle(e),
			ozelQueryDuzenle: e => this.numaratorListe_queryDuzenle(e),
			secince: e => this.numaratorSecildi(e)
		})
	}
	numaratorListe_ozelKolonDuzenle(e) {
		const {tabloKolonlari} = e, belirtecSet = asSet(['seri', 'noyil', 'sonno']);
		e.tabloKolonlari = tabloKolonlari.filter(colDef => belirtecSet[colDef.belirtec])
	}
	numaratorListe_queryDuzenle(e) {
		const {numarator} = this, {kod} = numarator;
		if (kod != null) { const {alias, sent} = e; sent.where.degerAta(kod, `${alias}.${numarator.class.kodSaha}`) }
	}
}
