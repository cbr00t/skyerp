class GKG_BelgeTarihVeNo extends GridKolonGrup {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	defaultTabloKolonlariDuzenle(e) {
		super.defaultTabloKolonlariDuzenle(e);
		const {tabloKolonlari} = e;
		tabloKolonlari.push(
			new GridKolon({
				belirtec: 'belgeTarih', text: 'Tarih', genislikCh: 10,
				validation: (...args) => this.tarihVeyaNoYilValidate(...args),
				cellValueChanged: e => this.tarihVeyaNoYilDegisti(e)
			}).tipDate(),
			new GridKolon({ belirtec: 'seri', text: 'Seri', genislikCh: 6, maxLength: 3 }),
			new GridKolon({
				belirtec: 'belgeNoYil', text: 'NoYıl', genislikCh: 8, maxLength: 4,
				validation: (...args) => this.tarihVeyaNoYilValidate(...args),
				cellValueChanged: e => this.tarihVeyaNoYilDegisti(e)
			}).tipNumerik().sifirGosterme()
				.onKeyDown(e => this.noYil_tusaBasildi(e)),
			new GridKolon({ belirtec: 'belgeNo', text: 'No', genislikCh: 18 }).tipNumerik()
		)
	}
	noYil_tusaBasildi(e) {
		let value;
		const {key} = e;
		if (key == 'b')
			value = today().getFullYear()
		else if (key == 'g')
			value = today().addYears(-1).getFullYear()
		
		if (value != null) {
			let input = $(e.event.currentTarget);
			let parent = input.parents().parents('.jqx-numberinput');
			if (parent.length)
				input = parent
			input.val(value)
		}
	}
	tarihVeyaNoYilValidate(colDef, info, value, result) {
		if ((result?.result ?? result) === false)
			return result
		const {gridWidget} = colDef.gridPart;
		const rowIndex = info.row;
		const belirtec = info.datafield;
		const rec = gridWidget.getrowdata(rowIndex);
		const tarihYil = belirtec == 'tarih' ? value : asDate(rec.tarih)?.getFullYear();
		const noYil = belirtec == 'noYil' ? asFloat(value) : rec.noYil;
		if (tarihYil && noYil && tarihYil != noYil)
			return ({ result: false, message: `<u class="bold">${noYil}</u> değeri hatalıdır` })
		return true
	}
	tarihVeyaNoYilDegisti(e) {
	}
}
