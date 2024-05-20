class TicariGridKontrolcu extends TSGridKontrolcu {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle(e) {
		let {tabloKolonlari} = e;
		tabloKolonlari.push(
			new GridKolon({
				belirtec: 'tip', text: ' ', genislikCh: 8,
				cellValueChanged: e => {
					/* e: { owner, datafield, rowindex, oldvalue, newvalue } */
					e = e.args || e;
					const gridWidget = e.owner;
					const tip = e.newvalue;
					let rec = gridWidget.getrowdata(e.rowindex, e.datafield);
					const {uid} = rec;
					switch (tip) {
						case 'stok': rec = new TSStokDetay(rec); break;
						case 'hizmet': rec = new TSHizmetDetay(rec); break;
						case 'demirbas': rec = new TSDemirbasDetay(rec); break;
						case 'aciklama': rec = new (rec.class?.aciklamaDetaySinif ?? TSAciklamaDetay)(rec); break;
					}
					const colDef = this.parentPart.belirtec2Kolon.sh;
					rec.shKod = rec.shAdi = null;
					
					//gridWidget.beginupdate();
					gridWidget.updaterow(uid, rec);
					//gridWidget.endupdate(false)
				}
			}).noSql().alignCenter().sabitle()
				.tipTekSecim({ tekSecimSinif: MQSHTipVeAciklama, kodGosterilmesin: true })
		);
		super.tabloKolonlariDuzenle(e);
		const {fis} = this;
		tabloKolonlari = e.tabloKolonlari;
		const shColDef = tabloKolonlari.find(colDef => colDef.belirtec == 'sh');
		const {kaKolonu} = shColDef;
		const savedEditorHandlers = {};
		for (const selector of ['createEditor', 'initEditor', 'getEditorValue'])
			savedEditorHandlers[selector] = kaKolonu[selector]
		$.extend(kaKolonu, {
			createEditor: (colDef, rowIndex, value, parent, cellText, cellWidth, cellHeight) => {
				const detaySinif = (colDef.gridPart.gridWidget.getrowdata(rowIndex) || {}).class || {};
				if (detaySinif.aciklamami) {
					const editor = $(`<input type="textbox" class="editor full-wh"></input>`);
					editor.jqxInput({ theme: theme });
					editor.appendTo(parent);
					setTimeout(() => editor.focus(), 10);
					return
				}
				const handler = savedEditorHandlers.createEditor;
				if (handler)
					getFuncValue.call(this, handler, colDef, rowIndex, value, parent, cellText, cellWidth, cellHeight)
			},
			initEditor: (colDef, rowIndex, value, parent, cellText, pressedChar) => {
				const detaySinif = (colDef.gridPart.gridWidget.getrowdata(rowIndex) || {}).class || {};
				if (detaySinif.aciklamami) {
					const editor = parent.children('.editor');
					editor.val(value);
					setTimeout(() => editor.focus(), 10);
					return
				}
				const handler = savedEditorHandlers.initEditor;
				if (handler)
					getFuncValue.call(this, handler, colDef, rowIndex, value, parent, cellText, pressedChar)
			},
			getEditorValue: (colDef, rowIndex, value, parent) => {
				const detaySinif = (colDef.gridPart.gridWidget.getrowdata(rowIndex) || {}).class || {};
				if (detaySinif.aciklamami)
					return parent.children('.editor').val()
				const handler = savedEditorHandlers.getEditorValue;
				let result = value;
				if (handler)
					result = getFuncValue.call(this, handler, colDef, rowIndex, value, parent)
				return result
			}
		})
		/*shColDef.kaKolonu.rendererEk = (colDef, text, align, width, html, gridPart, renderBlock) =>
			renderBlock.call(this, gridPart.belirtec2Kolon.sh.mfSinif.sinifAdi);*/
		shColDef.tabloKolonlari.push(
			new GridKolon({
				belirtec: 'kdvKod', text: 'Kdv', genislikCh: 8,
				cellBeginEdit: (colDef, rowIndex, belirtec, colType, value, result) => {
					const {gridWidget} = this;
					const det = gridWidget.getrowdata(rowIndex);
					return !!det.kdvDegiskenmi
				},
				cellValueChanged: e => {
					const {fis, parentPart} = this;
					const {yildizlimi} = fis.class;

					const {args} = e;
					const kdvKod = args.value || '';
					
					let det = args.owner.getrowdata(args.rowindex);
					// det = det.originalRecord || det;
					
					if (!fis.yildizlimi)
						det.orjkdvKod = kdvKod;

					this.gridSatirGuncellendi(e);
					// await det.vergileriHesapla(e);
					// setTimeout(() => parentPart.dipTazele(), 10);
				}
			}).tipTekSecim({ kaListe: fis.class.kdvKAListe }).sifirGosterme(),
			new GridKolon({ belirtec: 'otvBelirtec', text: 'Ötv', genislikCh: 4 }).tipNumerik().sifirGosterme().readOnly().hidden(),
			new GridKolon({ belirtec: 'stopajBelirtec', text: 'Sto', genislikCh: 4 }).tipNumerik().sifirGosterme().readOnly().hidden(),
			new GridKolon({
				belirtec: 'kdvEkText', text: 'KDV Ek', genislikCh: 12,
				cellClassName: 'kdvEkText grid-readOnly'
			}).readOnly().hidden()
		);
		shColDef.stmDuzenleyiciEkle(e => {
			const {aliasVeNokta, stm, fis, mfSinif} = e, {kdvHesapKodPrefix_stok, kdvHesapKodPrefix_hizmet} = fis.class;
			for (const sent of stm.getSentListe()) {
				const hesapSaha_almSatPrefix = (
					(mfSinif.stokmu || mfSinif.demirbasmi) ? kdvHesapKodPrefix_stok :
					mfSinif.hizmetmi ? kdvHesapKodPrefix_hizmet : null
				); if (!hesapSaha_almSatPrefix) return
				const {vergiBelirtecler} = TicariFis;
				for (const key of vergiBelirtecler) {
					if (key == TicariFis.vergiBelirtec_kdv) {
						const kdvDegiskenmiClause = `${aliasVeNokta}${hesapSaha_almSatPrefix}kdvdegiskenmi`;
						sent.sahalar.addAll(`${kdvDegiskenmiClause} kdvDegiskenmi`);
					}
					const vergiHesapClause = `${aliasVeNokta}${hesapSaha_almSatPrefix}${key}hesapkod`;
					sent.fromIliski(`vergihesap ${key}ver`, `${vergiHesapClause} = ${key}ver.kod`);
					sent.sahalar.addAll(`${vergiHesapClause} ${key}Kod`, `${key}ver.belirtec ${key}Belirtec`)
					// ( stk.satkdvhesapkod kdvkod ... ) gibi
				}
			}
		});
		shColDef.degisince(async e => {
			const {fis} = e, det = e.gridRec, detaySinif = (det || {}).class;
			if (detaySinif.aciklamami) return
			const isaretlimi = await fis.kayitIcinOzelIsaretlimi, rec = await e.rec;
			const {vergiBelirtecler, vergiBelirtec_kdv} = TicariFis;
			for (const key of vergiBelirtecler) {
				const kdvmi = key == vergiBelirtec_kdv;
				let colAttr = `${key}Kod`, value = rec[colAttr] || '';
				det[`orj${colAttr}`] = value;
				let duzValue = isaretlimi ? '' : value;
				if (kdvmi) { det._kdvDegiskenmi = asBool(rec.kdvDegiskenmi); e.setCellValue({ belirtec: colAttr, value: duzValue }) } else { det[colAttr] = duzValue }
				if (!kdvmi) {
					colAttr = `${key}Belirtec`; value = rec[colAttr] || '';
					det[`orj${colAttr}`] = value; duzValue = isaretlimi ? '' : value;
					if (kdvmi) det[colAttr] = duzValue; else e.setCellValue({ belirtec: colAttr, value: duzValue })
				}
				delete e.rec; e.detay = det;
				this.satirBedelHesapla(e)
			}
		})
	}
	tabloKolonlariDuzenle_fiyat_netBedel_arasi(e) {
		super.tabloKolonlariDuzenle_fiyat_netBedel_arasi(e);
		const {tabloKolonlari} = e;
		for (const item of TicIskYapi.getIskYapiIter()) {
			const {maxSayi} = item;
			if (!maxSayi)
				continue
			const belirtec = item.selector;
			const etiket = `${item.etiket}%`;
			tabloKolonlari.push(
				new GridKolon({
					userData: { iskYapiItem: item },
					belirtec: belirtec, text: etiket, genislikCh: 25,
					cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
						const oranlar = value;
						if (oranlar) {
							const result = [];
							for (const oran of oranlar) {
								if (oran && oran > 0)
									result.push(oran)
							}
							html = changeTagContent(
								html,
								($.isEmptyObject(result) ? '' : `%${result.map(x => x.toString()).join('+')}`)
							)
						}
						return html
					},
					columnType: 'template',
					createEditor: (colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
						const {gridWidget} = colDef.gridPart;
						const rec = gridWidget.getrowdata(rowIndex);
						const iskYapiItem = (colDef.userData || {}).iskYapiItem || {};
						const iskKey = iskYapiItem.key;
						const {maxSayi} = iskYapiItem;
						for (let i = 0; i < maxSayi; i++) {
							const input = $(`<input class="${iskKey} isk" style="width: 80px;" maxlength="3" data-iskkey="${iskKey}" data-iskindex="${i}"></input>`);
							input.on('focus', evt =>
								evt.target.select());
							input.on('change', evt => {
								let {value} = evt.target;
								value = evt.target.value = roundToBedelFra(asFloat(value))
							})
							input.appendTo(editor);
						}
					},
					initEditor: (colDef, rowIndex, value, editor, cellText) => {
						const {gridWidget} = colDef.gridPart;
						const rec = gridWidget.getrowdata(rowIndex);
						const oranlar = value;
						const inputs = editor.find('.isk');
						if (inputs.length) {
							for (let i = 0; i < inputs.length; i++) {
								const input = inputs.eq(i);
								const iskIndex = asInteger(input.data('iskindex'));
								input.val(asFloat(oranlar[iskIndex]));
							}
							setTimeout(() => inputs.eq(0).focus(), 100)
						}
					},
					getEditorValue: (colDef, rowIndex, value, editor) => {
						const {gridWidget} = colDef.gridPart;
						const rec = gridWidget.getrowdata(rowIndex);
						const result = [];
						const inputs = editor.find('.isk');
						for (let i = 0; i < inputs.length; i++) {
							const input = inputs.eq(i);
							const iskIndex = asInteger(input.data('iskindex'));
							const oran = asFloat(input.val());
							if (oran && oran > 0)
								result.push(oran)
						}
						return result;
					},
					validation: (colDef, cell, value) => {
						value = value || [];
						for (let i = 0; i < value.length; i++) {
							const oran = value[i];
							if (oran && (oran < 0 || oran > 100))
								return { result: false, message: `<u class="bold">${i + 1}.</u> oran değeri <b>(0 - 100)</b> arasında olmalıdır` }
						}
						return true
					},
					cellValueChanged: e => {
						this.satirBedelHesapla(e);
						const {args} = e;
						const gridWidget = args.owner;
						const rec = gridWidget.getrowdata(args.rowindex);
						setTimeout(() => gridWidget.updaterow(rec.uid, rec), 10)
					}
				})
			);
		}
	}
	islKodIsaretDegisti(e) {
		const {fis, gridWidget, parentPart} = this;
		const {ozelIsaret} = e;
		const isaretlimi = (ozelIsaret == '*');
		const {vergiBelirtecler, vergiBelirtec_kdv} = TicariFis;
		gridWidget.beginupdate();
		for (const det of gridWidget.getboundrows()) {
			const rowIndex = det.boundindex;
			for (const key of vergiBelirtecler) {
				const kdvmi = key == vergiBelirtec_kdv;
				let colAttr = `${key}Kod`;
				let value = det[`orj${colAttr}`] || '';
				let duzValue = isaretlimi ? '' : value;
				if (kdvmi)
					gridWidget.setcellvalue(rowIndex, colAttr, duzValue);
				else
					det[colAttr] = duzValue;
				
				colAttr = `${key}Belirtec`;
				value = det[`orj${colAttr}`] || '';
				duzValue = isaretlimi ? '' : value;
				if (kdvmi)
					det[colAttr] = duzValue
				else
					gridWidget.setcellvalue(rowIndex, colAttr, duzValue)
			}
			delete e.rec;
			e.detay = det;
			// this.gridSatirGuncellendi(e)
			this.satirBedelHesapla({ args: { uid: e.uid, rowindex: e.rowIndex } })
		}
		gridWidget.endupdate(false);
		setTimeout(() => parentPart.dipTazele(), 10)
	}
	efAyrimTipiDegisi(e) {
		/*const {fis, gridWidget, parentPart} = this;
		const {value} = e*/
	}
	gridSatirGuncellendi(e) {
		let {args} = e;
		if (!args)
			e.args = { uid: e.uid, rowindex: e.rowIndex };
		this.satirBedelHesapla(e);
		const {parentPart} = this;
		setTimeout(() => parentPart.dipTazele(), 10)
	}
	gridSatirSilindi(e) {
		super.gridSatirSilindi(e);
		const {fis, parentPart} = this;
		const {dipIslemci} = fis;
		if (dipIslemci)
			dipIslemci.topluHesapla(e)
		setTimeout(() => parentPart.dipTazele(), 10)
	}
	miktarFiyatDegisti(e) {
		super.miktarFiyatDegisti(e);
		const {parentPart} = this;
		setTimeout(() => parentPart.dipTazele(), 10)
	}
	satirBedelHesapla(e) {
		const args = e.args || {};
		const {uid} = args;
		const rowIndex = args.rowindex;
		const {gridWidget, fis, parentPart} = this;
		const det = e.detay || e.rec || (uid == null ? gridWidget.getrowdata(rowIndex) : gridWidget.getrowdatabyid(uid));
		const degerler = { eski: det.dipHesabaEsasDegerler };
		super.satirBedelHesapla(e);
		degerler.yeni = det.dipHesabaEsasDegerler;
		const {dipIslemci} = fis;
		if (dipIslemci)
			dipIslemci.satirDegisimIcinHesapla({ detay: det, degerler: degerler })
	}
}
class EIslAlimGridKontrolcu extends TicariGridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e);
		const {fis} = this;
		const ekTabloKolonlari = [
			new GridKolon({ belirtec: 'eSHText', text: 'EF Stok', genislikCh: 40 }).readOnly(),
			new GridKolon({ belirtec: 'eIskOranText', text: 'EF İsk%', genislikCh: 8 }).readOnly(),
			new GridKolon({ belirtec: 'eMiktar', text: 'EF Miktar', genislikCh: 8 }).readOnly().tipDecimal(),
			new GridKolon({ belirtec: 'eBedel', text: 'EF Bedel', genislikCh: 13 }).readOnly().tipDecimal_bedel(),
			new GridKolon({ belirtec: 'ayirac1', text: ' ', minWidth: 1, width: 20, cellClassName: 'ayirac' }).readOnly()
		];
		let {tabloKolonlari} = e;
		for (const colDef of tabloKolonlari)
			colDef.serbestBirak()
		const index_tipColDef = tabloKolonlari.findIndex(colDef => colDef.belirtec == 'tip');
		if (index_tipColDef)
			tabloKolonlari.splice(index_tipColDef, 0, ...ekTabloKolonlari)
		else
			tabloKolonlari.unshift(...ekTabloKolonlari)
	}
}
