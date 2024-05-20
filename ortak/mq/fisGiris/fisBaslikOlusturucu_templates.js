
class FisBaslikOlusturucu_Tarih extends FisBaslikOlusturucu_Input {
	static get ioAttr() { return 'tarih' }
	static get etiket() { return 'Tarih' }
	static get ekClassName() { return 'tarih' }
	static get maxLength() { return 12 }
	static getDefaultBaslikForm(e) { return e.tsnForm }

	runDevam(e) {
		super.runDevam(e);
		return e.part;
	}
	
	addToParentForm(e) {
		super.addToParentForm(e);
		
		/*const {parent, tsnForm} = e;
		parent.prependTo(tsnForm);*/
	}

	layoutDuzenle(e) {
		const {layout, fis, ioAttr, value} = e;
		const part = e.part = new TarihUIPart({ layout: layout, value: value });
		part.run();
	}

	initEvents(e) {
		super.superInitEvents(e);
		
		const {ioAttr, fis} = e;
		const {parent, part} = e;
		part.change(e =>
			fis._p[ioAttr].value = asDate(tarihDegerDuzenlenmis(e.value)));
		fis._p[ioAttr].change(e =>
			part.val(dateToString(e.value) || ''));
	}
}


class FisBaslikOlusturucu_Numarator extends FisBaslikOlusturucu {
	runDevam(e) {
		super.runDevam(e);
		
		const {fis, tsnForm, sender} = e;
		const {numarator} = fis;
		const part = numarator.class.partLayoutDuzenle($.extend({}, e, {
			fis: fis,
			layout: tsnForm.find(numarator.class.fisGirisLayoutSelector)
		}));
		tsnForm.removeClass('jqx-hidden');
		part.layout.removeClass('jqx-hidden');
		sender.numaratorPart = part;
		return part;
	}
}

class FisBaslikOlusturucu_Sube extends FisBaslikOlusturucu_Master {
	static get mfSinif() { return MQSube }
	static get ioAttr() { return 'subeKod' }
	static get ekClassName() { return 'sube' }
	// static get isDropDown() { return true }
	static getDefaultBaslikForm(e) { return e.tsnForm }
	
	runDevam(e) {
		const part = super.runDevam(e);
		e.sender.ddSubePart = part;
		
		/*const {fis, subeForm, sender} = e;
		const part = MQSube.partLayoutDuzenle($.extend({}, e, {
			fis: fis,
			layout: subeForm.find('.sube')
		}));
		subeForm.removeClass('jqx-hidden');
		sender.ddSubePart = part;
		return part;*/
	}

	addToParentForm(e) {
		super.addToParentForm(e);
		
		/*const {parent, header} = e;
		parent.prependTo(header);*/
	}
}

class FisBaslikOlusturucu_Cari extends FisBaslikOlusturucu_Master {
	static get mfSinif() { return MQCari }
	static get ioAttr() { return 'mustKod' }
	static get ekClassName() { return 'cari' }
	static getDefaultBaslikForm(e) { return e.baslikFormlar[2] }
}

class FisBaslikOlusturucu_StokYer extends FisBaslikOlusturucu_Master {
	static get mfSinif() { return MQStokYer }
	static get ioAttr() { return 'yerKod' }
	static get ekClassName() { return 'stokYer' }
	static get isDropDown() { return super.isDropDown }
	static getDefaultBaslikForm(e) { return e.baslikFormlar[0] }
}

class FisBaslikOlusturucu_StokIslem extends FisBaslikOlusturucu_Master {
	static get mfSinif() { return MQStokIslem }
	static get ioAttr() { return 'islKod' }
	static get ekClassName() { return 'stokIslem' }
	// static get isDropDown() { return true }
	static getDefaultBaslikForm(e) { return e.baslikFormlar[0] }

	widgetArgsDuzenle(e) {
		super.widgetArgsDuzenle(e);
		
		const {fis, args} = e;
		args.ozelQueryDuzenle = e => {
			const {alias} = e;
			e.stm.sentDo(sent => {
				sent.where
					.degerAta(fis.class.islTipKod, `${alias}.isltip`);
			})
		}
	}

	initEvents(e) {
		super.initEvents(e);

		const {part, fis} = e;
		/*if (islem == 'yeni' || islem == 'kopya')
			this.islKodDegisti($.extend({}, e, { value: e.fis[e.ioAttr] }));*/
		fis._p.ozelIsaret.change(_e =>
			this.ozelIsaretDegisti($.extend({}, e, _e)));
		part.degisince(_e =>
			this.islKodDegisti($.extend({}, e, _e)));
	}

	async islKodDegisti(e) {
		const {fis, parentPart} = e;
		const islKod = e.value;
		const islKod2OzelIsaret = (await MQStokIslem.getKod2OzelIsaret()) || {};
		const ozelIsaret = fis.ozelIsaret = islKod2OzelIsaret[islKod] || '';
		
		const {kontrolcu} = parentPart;
		if (kontrolcu && kontrolcu.islKodIsaretDegisti) {
			const {oldValue} = this;
			const eskiOzelIsaret = islKod2OzelIsaret[oldValue] || '';
			if ((eskiOzelIsaret == '*') != (ozelIsaret == '*')) {
				kontrolcu.islKodIsaretDegisti($.extend({}, e, {
					baslikOlusturucu: this, oldValue: oldValue,
					ozelIsaret: ozelIsaret, eskiOzelIsaret: eskiOzelIsaret
				}))
			}
		}
		this.oldValue = islKod;
	}

	ozelIsaretDegisti(e) {
		const {fis} = e;
		fis.ozelIsaretDegisti(e);
	}
}

class FisBaslikOlusturucu_Kasa extends FisBaslikOlusturucu_Master {
	static get mfSinif() { return MQKasa }
	static get ioAttr() { return 'kasaKod' }
	static get ekClassName() { return 'kasa' }
	static getDefaultBaslikForm(e) { return e.baslikFormlar[1] }
}

class FisBaslikOlusturucu_TahsilatOdeme extends FisBaslikOlusturucu_TekSecim {
	static get ioAttr() { return 'tahsilatOdeme' }
	static get ekClassName() { return 'tahsilatOdeme' }
	// static get tekSecim() { return TahsilatOdeme }
	static getDefaultBaslikForm(e) { return e.baslikFormlar[1] }

	initEvents(e) {
		super.initEvents(e);
	}
}

class FisBaslikOlusturucu_BaslikAciklama extends FisBaslikOlusturucu_Input {
	static get ioAttr() { return 'baslikAciklama' }
	static get etiket() { return 'Fiş Açıklama' }
	static get ekClassName() { return 'baslikAciklama' }
	static get maxLength() { return 50 }
	static getDefaultBaslikForm(e) { return e.baslikFormlar[2] }
}
