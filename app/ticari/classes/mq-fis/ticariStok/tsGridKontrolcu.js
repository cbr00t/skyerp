class TSGridKontrolcu extends GridKontrolcu {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { e = e || {}; super(e); }
	gridArgsDuzenle(e) {
		super.gridArgsDuzenle(e);
		$.extend(e.args, {
			rowDetails: true, rowDetailsTemplate: rowIndex => {
				return {
					rowdetails: (
						`<div class="satir-ek full-height" style="position: relative; padding: 0;">` +
							`<textarea class="altAciklama full-wh" style="padding: 8px;"></textarea>` +
						`</div>`
					),
					rowdetailsheight: 150
				}
			},
			initRowDetails: (rowIndex, _parent, grid, parentRec) => {
				grid = $(grid);
				const state_keyboardnavigation = grid.jqxGrid('keyboardnavigation'), {altAciklama} = parentRec, parent = $(_parent).children('.satir-ek');
				const textarea_altAciklama = parent.children('.altAciklama'); textarea_altAciklama.val(altAciklama || '');
				textarea_altAciklama.on('change', evt => parentRec.altAciklama = (evt.currentTarget.value || '').trimEnd());
				textarea_altAciklama.on('focus', evt => grid.jqxGrid('keyboardnavigation', false));
				textarea_altAciklama.on('blur', evt => grid.jqxGrid('keyboardnavigation', state_keyboardnavigation))
			}
		})
	}
	gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); const {gridWidget} = e;
		setTimeout(() => {
			const detaylar = gridWidget.getboundrows();
			gridWidget.beginupdate();
			for (let i = 0; i < detaylar.length; i++) { const det = detaylar[i]; if (!!det.altAciklama) gridWidget.showrowdetails(i) }
			gridWidget.endupdate(false)
		}, 50)
	}
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e);
		const shKolonGrup = MQStok.getGridKolonGrup_brmli({
			belirtec: 'sh', kodAttr: 'shKod', adiAttr: 'shAdi', adiEtiket: 'Stok/Hizmet Adı',
			mfSinif: e => { const {rec} = e; return (rec == null ? TSStokDetay : rec.class)?.mfSinif }
		}).sabitle();
		shKolonGrup.stmDuzenleyiciEkle(e => { const {aliasVeNokta, stm} = e; for (const sent of stm.getSentListe()) sent.sahalar.add(`${aliasVeNokta}adidegisir adiDegisirmi`) });
		/*shKolonGrup.degisince(e => { e.rec.then(rec => e.setCellValue({ belirtec: 'brm', value: rec.brm || '' })) });*/
		const {tabloKolonlari} = e;
		tabloKolonlari.push( shKolonGrup,
			new GridKolon({
				belirtec: 'miktar', text: 'Miktar', genislikCh: 13,
				cellValueChanged: e => setTimeout(() => this.miktarFiyatDegisti(e), 10)
			}).tipDecimal().zorunlu()
		);
		tabloKolonlari.push(
			new GridKolon({
				belirtec: 'fiyat', text: 'Fiyat', genislikCh: 18,
				cellValueChanged: e => setTimeout(() => this.miktarFiyatDegisti(e), 10)
			}).tipDecimal_fiyat()
		);
		this.tabloKolonlariDuzenle_fiyat_netBedel_arasi(e);
		tabloKolonlari.push(
			/* new GridKolon({ belirtec: 'brutBedel', text: 'Bedel', genislikCh: 15 }).tipDecimal_bedel().readOnly(), */
			new GridKolon({ belirtec: 'netBedel', text: 'Net Bedel', genislikCh: 18 }).tipDecimal_bedel().readOnly()
		);
		for (const item of HMRBilgi.hmrIter()) {
			let colDefOrArray = item.asGridKolon();
			if (colDefOrArray) {
				if ($.isArray(colDefOrArray)) tabloKolonlari.push(...colDefOrArray)
				else tabloKolonlari.push(colDefOrArray)
			}
		}
		
		tabloKolonlari.push(
			new GridKolon({ belirtec: 'ekAciklama', text: 'Açıklama', genislikCh: 30 })
		)
	}

	tabloKolonlariDuzenle_fiyat_netBedel_arasi(e) {
	}

	miktarFiyatDegisti(e) {
		this.satirBedelHesapla(e)
		
		/*e.sender.dipEventsDisableDo(() =>
			this.satirBedelHesapla(e));*/
	}

	// Ticari seviyede farklı hesap yapılır
	satirBedelHesapla(e) {
		const args = e.args || {};
		const {uid} = args;
		const rowIndex = args.rowindex;
		
		const {gridWidget, fis} = this;
		const det = e.detay || e.rec || (
			uid == null ? gridWidget.getrowdata(rowIndex) : gridWidget.getrowdatabyid(uid)
		);
		
		const _e = $.extend({}, e, { fis: fis, gridWidget: gridWidget, uid: uid, rowIndex: rowIndex, belirtec: args.datafield });
		det.uiSatirBedelHesapla(_e);
	}
}
