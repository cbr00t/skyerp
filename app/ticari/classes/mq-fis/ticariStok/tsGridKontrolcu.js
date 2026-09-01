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
		super.gridVeriYuklendi(e)
		let { fis } = this
		let { sender: gridPart } = e
		let { grid = gridPart.grid, gridWidget: w = gridPart.gridWidget } = gridPart 
		grid.css('opacity', 0)
		delay(200).then(() => {
			let detaylar = w.getboundrows()
			for (let i = 0; i < detaylar.length; i++) {
				let det = detaylar[i]
				if (!!det.altAciklama)
					w.showrowdetails(i)
			}
			fis?.hesapSekliDegisti?.({
				sender: gridPart, gridPart,
				kontrolcu: this, force: true
			})
			delay(1).then(() =>
				grid.css('opacity', 'unset'))
		})
	}
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e); let shKolonGrup = MQStok.getGridKolonGrup_brmli({
			belirtec: 'sh', kodAttr: 'shKod', adiAttr: 'shAdi', adiEtiket: 'Stok/Hizmet Adı',
			mfSinif: e => { let {rec} = e; return (rec == null ? TSStokDetay : rec.class)?.mfSinif ?? TSStokDetay }
		}).sabitle();
		shKolonGrup.stmDuzenleyiciEkle(({ aliasVeNokta, stm }) => {
			for (let {sahalar} of stm) { sahalar.add(`${aliasVeNokta}adidegisir adiDegisirmi`) }
		});
		let {tabloKolonlari} = e; tabloKolonlari.push(
			shKolonGrup,
			new GridKolon({
				belirtec: 'miktar', text: 'Miktar', genislikCh: 13,
				cellValueChanged: e =>
					setTimeout(() => this.miktarFiyatDegisti(e), 10)
			}).tipDecimal().zorunlu(),
			new GridKolon({
				belirtec: 'fiyat', text: 'Fiyat', genislikCh: 18,
				cellValueChanged: e =>
					setTimeout(() => this.miktarFiyatDegisti(e), 10)
			}).tipDecimal_fiyat()
		);
		this.tabloKolonlariDuzenle_fiyat_netBedel_arasi(e)
		tabloKolonlari.push(
			new GridKolon({
				belirtec: 'netBedel', text: 'Net Bedel', genislikCh: 18,
				cellValueChanged: e =>
					setTimeout(() => this.miktarFiyatDegisti(e), 10)
			}).tipDecimal_bedel().readOnly()
		)
		for (let item of HMRBilgi.hmrIter()) {
			let colDefOrArray = item.asGridKolon()
			if (colDefOrArray) {
				if (isArray(colDefOrArray))
					tabloKolonlari.push(...colDefOrArray)
				else
					tabloKolonlari.push(colDefOrArray)
			}
		}
		tabloKolonlari.push(
			new GridKolon({ belirtec: 'detAciklama', text: 'Açıklama', genislikCh: 40 })
		)
	}
	tabloKolonlariDuzenle_fiyat_netBedel_arasi({ tabloKolonlari: liste }) {
		let { fis } = this
		if (!fis.class.siparismi) {
			let { kullanim: { takipNo } = {} } = app.params.ticariGenel ?? {}
			let { yerOrtakmi, takipOrtakmi } = fis
			liste.push(...MQStokYer.getGridKolonlar({ hidden: !!yerOrtakmi, belirtec: 'yer' }))
			if (takipNo)
				liste.push(...MQTakipNo.getGridKolonlar({ hidden: !!takipOrtakmi, belirtec: 'takip', kodAttr: 'takipNo', adiAttr: 'takipAdi' }))
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
	miktarFiyatDegisti(e) {
		let { fis = {} } = this
		let { hesapSekli } = fis
		let { args = {} } = e
		if (args.oldvalue == args.newvalue)
			return
		
		hesapSekli = hesapSekli?.char ?? hesapSekli
		let sonucBelirtec = (
			hesapSekli == 'F' ? 'fiyat' :
			hesapSekli == 'M' ? 'miktar' :
			'netBedel'
		)
	
		let { belirtec = args?.datafield } = e
		if (belirtec != sonucBelirtec)
			this.satirBedelHesapla(e)
	}
	satirBedelHesapla(e = {}) {			// Ticari seviyede farklı hesap yapılır
		let { sender: gridPart, args = {} } = e
		let rowIndex = e.rowIndex ?? args.rowindex
		let uid = e.uid ?? args.uid
		let belirtec = e.belirtec ?? args.datafield
		let { gridWidget, fis } = this
		let { detay: det = e.rec } = e
		det ??= uid == null
			? gridWidget.getrowdata(rowIndex)
			: gridWidget.getrowdatabyid(uid)
		let _e = { ...e, fis, gridPart, gridWidget, uid, rowIndex, belirtec }
		det?.uiSatirBedelHesapla(_e)
	}
	yerOrtakmiDegisti(e) { let grupBelirtec = 'yer'; return this.xOrtakmiDegisti({ ...e, grupBelirtec }) }
	takipOrtakmiDegisti(e) { let grupBelirtec = 'takip'; return this.xOrtakmiDegisti({ ...e, grupBelirtec }) }
	xOrtakmiDegisti(e) {
		let gridPart = e.gridPart ?? e.sender, grupBelirtec = e.grupBelirtec ?? e.belirtec, colDef = gridPart.belirtec2Kolon[grupBelirtec].kaKolonu, {value} = e, hiddenFlag = !!value;
		if (colDef) { colDef.isHidden = hiddenFlag; gridPart[hiddenFlag ? 'hideColumn' : 'showColumn'](colDef.belirtec) }
	}
}
