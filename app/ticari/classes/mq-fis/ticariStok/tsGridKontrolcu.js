class TSGridKontrolcu extends GridKontrolcu {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	gridArgsDuzenle(e) {
		super.gridArgsDuzenle(e); $.extend(e.args, {
			rowDetails: this.fis?.class?.aciklamaKullanilirmi, rowDetailsTemplate: rowIndex => {
				return {
					rowdetailsheight: 100,
					rowdetails: (`<div class="satir-ek full-height" style="position: relative; padding: 0;"><textarea class="altAciklama full-wh" style="padding: 8px;"></textarea></div>`),
				}
			},
			initRowDetails: (rowIndex, _parent, grid, parentRec) => {
				grid = $(grid); let state_keyboardnavigation = grid.jqxGrid('keyboardnavigation'), {altAciklama} = parentRec, parent = $(_parent).children('.satir-ek');
				let textarea_altAciklama = parent.children('.altAciklama'); textarea_altAciklama.val(altAciklama || '');
				textarea_altAciklama.on('change', evt => parentRec.altAciklama = (evt.currentTarget.value || '').trimEnd());
				textarea_altAciklama.on('focus', evt => grid.jqxGrid('keyboardnavigation', false));
				textarea_altAciklama.on('blur', evt => grid.jqxGrid('keyboardnavigation', state_keyboardnavigation))
			}
		})
	}
	gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); let {sender: gridPart, gridWidget} = e; gridPart.grid.css('opacity', 0);
		setTimeout(() => {
			let detaylar = gridWidget.getboundrows();
			for (let i = 0; i < detaylar.length; i++) { let det = detaylar[i]; if (!!det.altAciklama) { gridWidget.showrowdetails(i) } }
			setTimeout(() => gridPart.grid.css('opacity', 'unset'), 1)
		}, 200)
	}
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e); let shKolonGrup = MQStok.getGridKolonGrup_brmli({
			belirtec: 'sh', kodAttr: 'shKod', adiAttr: 'shAdi', adiEtiket: 'Stok/Hizmet Adı',
			mfSinif: e => { let {rec} = e; return (rec == null ? TSStokDetay : rec.class)?.mfSinif }
		}).sabitle();
		shKolonGrup.stmDuzenleyiciEkle(({ aliasVeNokta, stm }) => {
			for (let {sahalar} of stm) { sahalar.add(`${aliasVeNokta}adidegisir adiDegisirmi`) }
		});
		let {tabloKolonlari} = e; tabloKolonlari.push(
			shKolonGrup, new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 13, cellValueChanged: e => setTimeout(() => this.miktarFiyatDegisti(e), 10) }).tipDecimal().zorunlu(),
			new GridKolon({ belirtec: 'fiyat', text: 'Fiyat', genislikCh: 18, cellValueChanged: e => setTimeout(() => this.miktarFiyatDegisti(e), 10) }).tipDecimal_fiyat()
		);
		this.tabloKolonlariDuzenle_fiyat_netBedel_arasi(e);
		tabloKolonlari.push(new GridKolon({ belirtec: 'netBedel', text: 'Net Bedel', genislikCh: 18 }).tipDecimal_bedel().readOnly());
		for (let item of HMRBilgi.hmrIter()) {
			let colDefOrArray = item.asGridKolon();
			if (colDefOrArray) {
				if ($.isArray(colDefOrArray)) { tabloKolonlari.push(...colDefOrArray) }
				else { tabloKolonlari.push(colDefOrArray) }
			}
		}
		tabloKolonlari.push(new GridKolon({ belirtec: 'detAciklama', text: 'Açıklama', genislikCh: 40 }))
	}
	tabloKolonlariDuzenle_fiyat_netBedel_arasi(e) {
		let {fis} = this;
		if (!fis.class.siparismi) {
			let {kullanim} = app.params.ticariGenel, {yerOrtakmi, takipOrtakmi} = fis, {tabloKolonlari} = e;
			tabloKolonlari.push(...MQStokYer.getGridKolonlar({ hidden: !!yerOrtakmi, belirtec: 'yer' /*, kodAttr: `${belirtec}Kod`, adiAttr: `${belirtec}Adi`*/ }));
			if (kullanim.takipNo) { tabloKolonlari.push(...MQTakipNo.getGridKolonlar({ hidden: !!takipOrtakmi, belirtec: 'takip', kodAttr: 'takipNo', adiAttr: 'takipAdi' })) }
		}
	}
	geriYuklemeIcinUygunmu(e) {
		let {fis} = this, det = e.detay, rowIndex = e.index, satirNo = rowIndex + 1;
		if (!(fis.class.siparismi || det?.class?.hizmetmi)) {
			let {kullanim} = app.params.ticariGenel;
			if (!fis.yerOrtakmi && !det.yerKod) {
				let belirtec = 'takipNo';
				return { isError: true, errorText: `<b>${satirNo}.</b> satırdaki <b>Detay Yer (Depo)</b> bilgisi boş olamaz`, returnAction: e => e.focusTo({ rowIndex, belirtec }) }
			}
			/* if (kullanim.takipNo && !fis.takipOrtakmi && !det.takipNo) { let belirtec = 'yerKod'; return { isError: true, errorText: `<b>${satirNo}.</b> satırdaki <b>Detay Takip No</b> bilgisi boş olamaz`, returnAction: e => e.focusTo({ rowIndex, belirtec }) } } */
		}
		return super.geriYuklemeIcinUygunmu(e)
	}
	miktarFiyatDegisti(e) { this.satirBedelHesapla(e) }
	satirBedelHesapla(e) {			/* Ticari seviyede farklı hesap yapılır */
		let args = e.args || {}, {uid} = args, rowIndex = args.rowindex, {gridWidget, fis} = this;
		let det = e.detay || e.rec || (uid == null ? gridWidget.getrowdata(rowIndex) : gridWidget.getrowdatabyid(uid));
		let _e = { ...e, fis, gridWidget, uid, rowIndex, belirtec: args.datafield }; det?.uiSatirBedelHesapla(_e)
	}
	yerOrtakmiDegisti(e) { let grupBelirtec = 'yer'; return this.xOrtakmiDegisti({ ...e, grupBelirtec }) }
	takipOrtakmiDegisti(e) { let grupBelirtec = 'takip'; return this.xOrtakmiDegisti({ ...e, grupBelirtec }) }
	xOrtakmiDegisti(e) {
		let gridPart = e.gridPart ?? e.sender, grupBelirtec = e.grupBelirtec ?? e.belirtec, colDef = gridPart.belirtec2Kolon[grupBelirtec].kaKolonu, {value} = e, hiddenFlag = !!value;
		if (colDef) { colDef.isHidden = hiddenFlag; gridPart[hiddenFlag ? 'hideColumn' : 'showColumn'](colDef.belirtec) }
	}
}
