class FisEkVergiWindowPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'fisEkVergi' }
	static get isWindowPart() { return true }
	get wndDefaultIsModal() { return false }

	
	constructor(e) {
		e = e || {};
		super(e);

		$.extend(this, {
			title: coalesce(e.title, 'Ek Vergi'),
			fis: e.fis, detay: e.detay,
			tamamIslemi: e.tamamIslemi
		});

		this.ekVergiYapi = e.ekVergiYapi || (this.detay || {}).ekVergiYapi;
		const {fis} = this;
		const cikismi = this.cikismi = coalesce(e.cikis, coalesce(e.cikismi, coalesce(e.cikisGibimi, (((fis || {}).class || {}).cikisGibimi))));
		this.ba = cikismi ? 'B' : 'A';
	}

	runDevam(e) {
		super.runDevam(e);

		const {layout} = this;
		const islemTuslari = this.islemTuslari = layout.find(`.islemTuslari`);
		const islemTuslariPart = this.islemTuslariPart = new ButonlarPart({
			sender: this, layout: islemTuslari,
			tip: 'tamamVazgec',
			butonlarDuzenleyici: e =>
				this.islemTuslariDuzenle(e)
		});
		islemTuslariPart.run();

		
		const {ekVergiYapi} = this;
		const radioTip = this.radioTip = layout.find('.tip');
		let docFrg = $(document.createDocumentFragment());
		for (const ka of ekVergiYapi.tip.kaListe) {
			const btn = $(`<button data-id="${ka.kod}">${ka.aciklama}</button>`);
			btn.appendTo(docFrg);
			btn.jqxButton({ theme: theme });
		}
		docFrg.appendTo(radioTip);
		
		radioTip.find('button').on('click', evt => {
			const target = $(evt.target);
			const id = (target.data('id') || '').trimEnd();
			radioTip.find('button').jqxButton({ template: '' });
			target.jqxButton({ template: 'info' });;
			
			ekVergiYapi.tip.char = id;
			this.tipDegisti($.extend({}, e, { event: evt, id: id }));
		});
		
		let btn = radioTip.find(`button[data-id="${ekVergiYapi.tip.char || ' '}"]`);
		if (btn && btn.length)
			btn.jqxButton({ template: 'info' });

		this.tipAltForm = layout.find('.tipAltForm');
		setTimeout(() => this.tipDegisti(), 1);
	}

	afterRun(e) {
		super.afterRun(e);
		setTimeout(() => this.show(), 10);
	}

	wndOnOpen(e) {
		super.wndOnOpen(e);
	}
	
	wndOnClose(e) {
		super.wndOnClose(e);
	}

	wndArgsDuzenle(e) {
		super.wndArgsDuzenle(e);
		
		const {wndArgs} = this;
		$.extend(wndArgs, {
			width: '50%', height: 500,
			position: 'center'
		});
	}

	islemTuslariDuzenle(e) {
		const {liste} = e;
		const yListe = [];
		for (const item of liste) {
			const {id} = item;
			switch (id) {
				case 'tamam':
					item.handler = e =>
						this.tamamIstendi(e);
					break;
				case 'vazgec':
					item.handler = e =>
						this.vazgecIstendi(e);
					break;
					// continue;
			}
			yListe.push(item);
		}
		
		e.liste = yListe;
	}

	tipDegisti(e) {
		const {tipAltForm, ekVergiYapi} = this;
		const tip = (ekVergiYapi.tip.char || '').trimEnd();
		const {savedTip} = this;
		if (tip == savedTip)
			return;

		this.savedTip = tip;
		if (!ekVergiYapi.bosmu) {
			tipAltForm.removeClass('jqx-hidden');
			
			const ddTevHesapKod_layout = tipAltForm.find('.tevHesapKod');
			const ddBeyannameKodu_layout = tipAltForm.find('.beyannameKodu');
			if (ekVergiYapi.tevkifatmi) {
				let {ddTevHesapKod} = this;
				ddBeyannameKodu_layout.parent().addClass('jqx-hidden');
				ddTevHesapKod_layout.parent().removeClass('jqx-hidden basic-hidden');
				
				if (!ddTevHesapKod) {
					ddTevHesapKod = this.ddTevHesapKod = new ModelKullanPart({
						layout: ddTevHesapKod_layout,
						sender: this, mfSinif: MQVergi,
						ozelQueryDuzenle: e => {
							const vergiTipi = 'KTEV'
							const {ba} = this;
							const {stm, alias} = e;
							stm.sentDo(sent => {
								sent.where.degerAta(vergiTipi, `${alias}.vergitipi`);
								sent.where.degerAta(ba, `${alias}.ba`);
								sent.sahalar.addAll(
									`${alias}.tevislemturu islemTuru`,
									`${alias}.kdvtevoranpay oranPay`,
									`${alias}.kdvtevoranbaz oranBaz`,
								)
							})
						},
						value: ekVergiYapi.kod,
						degisince: e => {
							const {value, item} = e;
							ekVergiYapi.kod = value || '';
							if (item) {
								ekVergiYapi.islemTuru = item.islemTuru || '';
								ekVergiYapi.oran = new Oran({ pay: item.oranPay, baz: item.oranBaz })
							}
						},
						selectionRendererBlock: e => {
							const {wItem, rec} = e;
							if (rec) {
								const kod = wItem.value || '';
								let aciklama = wItem.label || '';
								const {islemTuru} = rec || {};
								if (islemTuru)
									aciklama += ` (<i class="bold royalblue">${islemTuru}</i>)`;
								e.result = e.kodGosterilsinmi ? (kod ? `<b>${kod}</b>-${aciklama}` : '') : aciklama;
							}
						}
					}).dropDown().noAutoWidth();
					ddTevHesapKod.run();
				}
				ddTevHesapKod.dataBind();
				if (tip != savedTip)
					setTimeout(() => ddTevHesapKod.val(''), 10);

				// det.istisnaKod = '';
			}
			else if (ekVergiYapi.istisnami) {
				ddTevHesapKod_layout.parent().addClass('jqx-hidden');
				ddBeyannameKodu_layout.parent().removeClass('jqx-hidden basic-hidden');

				let {ddBeyannameKodu} = this;
				if (!ddBeyannameKodu) {
					ddBeyannameKodu = this.ddBeyannameKodu = new ModelKullanPart({
						layout: ddBeyannameKodu_layout, sender: this,
						source: e =>
							MQVergi.getIstisnalar({ kismimi: ekVergiYapi.kismiIstisnami, ba: this.ba }),
						value: ekVergiYapi.kod,
						degisince: e => {
							const {value, item} = e;
							ekVergiYapi.kod = value || '';
							if (item)
								ekVergiYapi.islemTuru = item.kod || '';
						}
					}).dropDown().noAutoWidth();
					ddBeyannameKodu.run();
				}
				ddBeyannameKodu.dataBind();
				if (tip != savedTip)
					setTimeout(() => ddBeyannameKodu.val(''), 10);

				// det.tevkifatKod = '';
			}
		}
		else {
			tipAltForm.addClass('jqx-hidden');
		}
	}

	ekVergiDegisti(e) {
	}

	tamamIstendi(e) {
		let result;
		try {
			this.tamamOncesiIslemler(e);
			const {tamamIslemi} = this;
			if (tamamIslemi) {
				const _e = $.extend({}, e, { sender: this, detay: this.detay, ekVergiYapi: this.ekVergiYapi });
				const result = getFuncValue.call(this, tamamIslemi, _e);
				if (result === false)
					return false;
			}
		}
		catch (ex) {
			console.error(ex);
			const error = getErrorText(ex);
			if (error)
				hConfirm(error, this.title);
			return false;
		}

		this.close(e);
	}

	tamamOncesiIslemler(e) {
	}
}
