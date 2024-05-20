class TicNumaratorPart extends NumaratorPart {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'ticNumarator' }

	runDevam(e) {
		super.runDevam(e); const {layout, fis, numarator} = this;
		const seriNoForm = layout.find('.seriVeNo'), txtNoYil = this.txtNoYil = seriNoForm.find('#noYil');
		if (fis.class.noYilKullanilirmi) {
			txtNoYil.on('keyup', evt => { evt.target.value = asInteger(evt.target.value) || null });
			txtNoYil.on('contextmenu', evt => { const value = fis.noYil = app.params.zorunlu.cariYil || today().getYear(); evt.target.value = value });
			txtNoYil.on('change', evt => { fis.noYil = asInteger(evt.target.value) || null });
			txtNoYil.removeClass('jqx-hidden basic-hidden')
		}
		else { txtNoYil.addClass('jqx-hidden') }
	}
	numaratorListe_ozelKolonDuzenle(e) { }
	numaratorListe_queryDuzenle(e) {		
		const {numarator} = this, {tip} = numarator;
		if (tip != null) { const {alias, sent} = e; sent.where.degerAta(tip, `${alias}.tip`) }
	}
}
