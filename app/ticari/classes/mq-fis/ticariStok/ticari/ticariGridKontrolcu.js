class TicariGridKontrolcu extends TSGridKontrolcu {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle(e) {
		let {tabloKolonlari} = e; tabloKolonlari.push(
			new GridKolon({
				belirtec: 'tip', text: ' ', genislikCh: 8, cellValueChanged: e => {
					e = e.args || e; let {owner: gridWidget, newvalue: tip} = e, rec = gridWidget.getrowdata(e.rowindex, e.datafield);
					let {uid} = rec; switch (tip) {
						case 'stok': rec = new TSStokDetay(rec); break; case 'hizmet': rec = new TSHizmetDetay(rec); break
						case 'demirbas': rec = new TSDemirbasDetay(rec); break; case 'aciklama': rec = new TSAciklamaDetay(rec); break
					}
					let {sh: colDef} = this.parentPart.belirtec2Kolon;
					rec.shKod = rec.shAdi = null; gridWidget.updaterow(uid, rec)
				}
			}).noSql().alignCenter().sabitle().tipTekSecim({ tekSecimSinif: MQSHTipVeAciklama, kodGosterilmesin: true })
		);
		super.tabloKolonlariDuzenle(e); let {fis} = this; tabloKolonlari = e.tabloKolonlari;
		let shColDef = tabloKolonlari.find(colDef => colDef.belirtec == 'sh'), {kaKolonu} = shColDef;
		let savedEditorHandlers = {}; for (let selector of ['createEditor', 'initEditor', 'getEditorValue']) {
			savedEditorHandlers[selector] = kaKolonu[selector] }
		$.extend(kaKolonu, {
			createEditor: (colDef, rowIndex, value, parent, cellText, cellWidth, cellHeight) => {
				let {gridWidget} = colDef.gridPart, detaySinif = gridWidget.getrowdata(rowIndex)?.class;
				if (detaySinif?.aciklamami) {
					let editor = $(`<input type="textbox" class="editor full-wh"></input>`); editor.jqxInput({ theme }); editor.appendTo(parent);
					setTimeout(() => editor.focus(), 10); return
				}
				let handler = savedEditorHandlers.createEditor;
				if (handler) { getFuncValue.call(this, handler, colDef, rowIndex, value, parent, cellText, cellWidth, cellHeight) }
			},
			initEditor: (colDef, rowIndex, value, parent, cellText, pressedChar) => {
				let {gridWidget} = colDef.gridPart, detaySinif = gridWidget.getrowdata(rowIndex)?.class;
				if (detaySinif?.aciklamami) { let editor = parent.children('.editor'); editor.val(value); setTimeout(() => editor.focus(), 10); return }
				let handler = savedEditorHandlers.initEditor;
				if (handler) { getFuncValue.call(this, handler, colDef, rowIndex, value, parent, cellText, pressedChar) }
			},
			getEditorValue: (colDef, rowIndex, value, parent) => {
				const {gridWidget} = colDef.gridPart, detaySinif = gridWidget.getrowdata(rowIndex)?.class;
				if (detaySinif?.aciklamami) { return parent.children('.editor').val() }
				let result = value, handler = savedEditorHandlers.getEditorValue;
				if (handler) { result = getFuncValue.call(this, handler, colDef, rowIndex, value, parent) }
				return result
			}
		});
		/*shColDef.kaKolonu.rendererEk = (colDef, text, align, width, html, gridPart, renderBlock) => renderBlock.call(this, gridPart.belirtec2Kolon.sh.mfSinif.sinifAdi);*/
		shColDef.tabloKolonlari.push(
			new GridKolon({
				belirtec: 'kdvKod', text: 'Kdv', genislikCh: 8,
				cellBeginEdit: (colDef, rowIndex, belirtec, colType, value, result) => { const {gridWidget} = this, det = gridWidget.getrowdata(rowIndex);  !!det.kdvDegiskenmi },
				cellValueChanged: e => {
					const {fis, parentPart} = this, {yildizlimi} = fis.class, {args} = e, kdvKod = args.value || '';
					let det = args.owner.getrowdata(args.rowindex); if (!fis.yildizlimi) { det.orjkdvKod = kdvKod }
					this.gridSatirGuncellendi(e)
				}
			}).tipTekSecim({ kaListe: fis.class.kdvKAListe }).sifirGosterme(),
			new GridKolon({ belirtec: 'otvBelirtec', text: 'Ötv', genislikCh: 4 }).tipNumerik().sifirGosterme().readOnly().hidden(),
			new GridKolon({ belirtec: 'stopajBelirtec', text: 'Sto', genislikCh: 4 }).tipNumerik().sifirGosterme().readOnly().hidden(),
			new GridKolon({ belirtec: 'kdvEkText', text: 'KDV Ek', genislikCh: 12, cellClassName: 'kdvEkText grid-readOnly' }).readOnly().hidden()
		);
		shColDef.stmDuzenleyiciEkle(e => {
			let {aliasVeNokta, stm, fis, mfSinif} = e, {kdvHesapKodPrefix_stok, kdvHesapKodPrefix_hizmet} = fis.class;
			for (let sent of stm.getSentListe()) {
				let hesapSaha_almSatPrefix = ((mfSinif.stokmu || mfSinif.demirbasmi) ? kdvHesapKodPrefix_stok : mfSinif.hizmetmi ? kdvHesapKodPrefix_hizmet : null);
				if (!hesapSaha_almSatPrefix) { return } let {vergiBelirtecler} = mfSinif;
				for (let key of vergiBelirtecler) {
					if (key == TicariFis.vergiBelirtec_kdv) {
						let kdvDegiskenmiClause = `${aliasVeNokta}${hesapSaha_almSatPrefix}kdvdegiskenmi`; sent.sahalar.add(`${kdvDegiskenmiClause} kdvDegiskenmi`) }
					let vergiHesapClause = `${aliasVeNokta}${hesapSaha_almSatPrefix}${key}hesapkod`;
					sent.fromIliski(`vergihesap ${key}ver`, `${vergiHesapClause} = ${key}ver.kod`);
					sent.sahalar.add(`${vergiHesapClause} ${key}Kod`, `${key}ver.belirtec ${key}Belirtec`)					/* ( stk.satkdvhesapkod kdvkod ... ) gibi */
				}
			}
			mfSinif.ticariGrid_shKolon_stmDuzenleEk?.(e)
		});
		shColDef.degisince(async e => {
			let { fis, mfSinif, gridRec: det, rec, setCellValue } = e;
			let detaySinif = det?.class; if (detaySinif.aciklamami) { return }
			let isaretlimi = await fis.kayitIcinOzelIsaretlimi;
			rec = await rec; let {mustKod} = fis, {shKod} = rec ?? {};
			let kosulResult; if (mustKod && shKod) {
				let {kosulYapilar} = fis, {FY} = kosulYapilar ?? {};
				kosulResult = shKod ? Object.values(await SatisKosul_Fiyat.getAltKosulYapilar([shKod], FY, mustKod))?.[0] : null;
				let {fiyat} = kosulResult ?? {}; if (fiyat) { $.extend(det, { fiyat, ozelFiyatVarmi: true }) }
			}
			let {vergiBelirtecler, vergiBelirtec_kdv} = TicariFis; for (let key of vergiBelirtecler) {
				let kdvmi = key == vergiBelirtec_kdv, colAttr = `${key}Kod`, value = rec[colAttr] || '', duzValue = isaretlimi ? '' : value;
				det[`orj${colAttr}`] = value;
				if (kdvmi) { det._kdvDegiskenmi = asBool(rec.kdvDegiskenmi); setCellValue({ belirtec: colAttr, value: duzValue }) }
				else { det[colAttr] = duzValue }
				if (!kdvmi) {
					colAttr = `${key}Belirtec`; value = rec[colAttr] || ''; det[`orj${colAttr}`] = value; duzValue = isaretlimi ? '' : value;
					if (kdvmi) { det[colAttr] = duzValue } else { setCellValue({ belirtec: colAttr, value: duzValue }) }
				}
				mfSinif.ticariGrid_shKolon_degisinceEk?.({ ...e, rec });
				delete e.rec; /* e.rec => Promise (async) */
				e.detay = det; this.satirBedelHesapla(e)
			}
		})
	}
	tabloKolonlariDuzenle_fiyat_netBedel_arasi(e) {
		super.tabloKolonlariDuzenle_fiyat_netBedel_arasi(e); let {tabloKolonlari} = e;
		for (let item of TicIskYapi.getIskYapiIter()) {
			let {maxSayi} = item; if (!maxSayi) { continue }
			let belirtec = item.selector, etiket = `${item.etiket}%`;
			tabloKolonlari.push(
				new GridKolon({
					userData: { iskYapiItem: item }, belirtec: belirtec, text: etiket, genislikCh: 25,
					cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
						const oranlar = value;
						if (oranlar) {
							let result = []; for (let oran of oranlar) { if (oran && oran > 0) { result.push(oran) } }
							html = changeTagContent(html, ($.isEmptyObject(result) ? '' : `%${result.map(x => x.toString()).join('+')}`))
						}
						return html
					},
					columnType: 'template', createEditor: (colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
						let {gridWidget} = colDef.gridPart, rec = gridWidget.getrowdata(rowIndex);
						let iskYapiItem = (colDef.userData || {}).iskYapiItem || {}, iskKey = iskYapiItem.key, {maxSayi} = iskYapiItem;
						for (let i = 0; i < maxSayi; i++) {
							const input = $(`<input class="${iskKey} isk" style="width: 80px;" maxlength="3" data-iskkey="${iskKey}" data-iskindex="${i}"></input>`);
							input.on('focus', evt => evt.currentTarget.select());
							input.on('change', ({ currentTarget: target }) => target.value = roundToBedelFra(asFloat(target.value)));
							input.appendTo(editor);
						}
					},
					initEditor: (colDef, rowIndex, value, editor, cellText) => {
						let {gridWidget} = colDef.gridPart, rec = gridWidget.getrowdata(rowIndex), oranlar = value, inputs = editor.find('.isk');
						if (inputs.length) {
							for (let i = 0; i < inputs.length; i++) { const input = inputs.eq(i), iskIndex = asInteger(input.data('iskindex')); input.val(asFloat(oranlar[iskIndex])); }
							setTimeout(() => inputs.eq(0).focus(), 100)
						}
					},
					getEditorValue: (colDef, rowIndex, value, editor) => {
						let {gridWidget} = colDef.gridPart, rec = gridWidget.getrowdata(rowIndex), result = [], inputs = editor.find('.isk');
						for (let i = 0; i < inputs.length; i++) {
							let input = inputs.eq(i), iskIndex = asInteger(input.data('iskindex')), oran = asFloat(input.val());
							if (oran && oran > 0) { result.push(oran) }
						}
						return result
					},
					validation: (colDef, cell, value) => {
						value = value || [];
						for (let i = 0; i < value.length; i++) {
							let oran = value[i];
							if (oran && (oran < 0 || oran > 100)) {
								return ({ result: false, message: `<u class="bold">${i + 1}.</u> oran değeri <b>(0 - 100)</b> arasında olmalıdır` }) }
						}
						return true
					},
					cellValueChanged: ({ args }) => {
						this.satirBedelHesapla(e); let {owner: gridWidget} = args, rec = gridWidget.getrowdata(args.rowindex);
						setTimeout(() => gridWidget.updaterow(rec.uid, rec), 10)
					}
				})
			);
		}
	}
	islKodIsaretDegisti(e) {
		const {fis, gridWidget, parentPart} = this, {ozelIsaret} = e, isaretlimi = (ozelIsaret == '*'), {vergiBelirtecler, vergiBelirtec_kdv} = TicariFis;
		gridWidget.beginupdate();
		for (const det of gridWidget.getboundrows()) {
			const rowIndex = det.boundindex;
			for (const key of vergiBelirtecler) {
				const kdvmi = key == vergiBelirtec_kdv; let duzValue;
				let colAttr = `${key}Kod`, value = det[`orj${colAttr}`] || ''; duzValue = isaretlimi ? '' : value; if (kdvmi) { gridWidget.setcellvalue(rowIndex, colAttr, duzValue) } else { det[colAttr] = duzValue }
				colAttr = `${key}Belirtec`; value = det[`orj${colAttr}`] || ''; duzValue = isaretlimi ? '' : value; if (kdvmi) { det[colAttr] = duzValue } else { gridWidget.setcellvalue(rowIndex, colAttr, duzValue) }
			}
			delete e.rec; e.detay = det; this.satirBedelHesapla({ args: { uid: e.uid, rowindex: e.rowIndex } })
		}
		gridWidget.endupdate(false); setTimeout(() => parentPart.dipTazele(), 10)
	}
	efAyrimTipiDegisi(e) { /*const {fis, gridWidget, parentPart} = this; const {value} = e*/ }
	gridSatirGuncellendi(e) {
		let {args} = e; if (!args) { e.args = { uid: e.uid, rowindex: e.rowIndex }; }
		this.satirBedelHesapla(e); const {parentPart} = this; setTimeout(() => parentPart.dipTazele(), 10)
	}
	gridSatirSilindi(e) {
		super.gridSatirSilindi(e); const {fis, parentPart} = this;
		const {dipIslemci} = fis; if (dipIslemci) { dipIslemci.topluHesapla(e) }
		setTimeout(() => parentPart.dipTazele(), 10)
	}
	miktarFiyatDegisti(e) { super.miktarFiyatDegisti(e); const {parentPart} = this; setTimeout(() => parentPart.dipTazele(), 10) }
	satirBedelHesapla(e) {
		const args = e.args || {}, {uid} = args,  rowIndex = args.rowindex, {gridWidget, fis, parentPart} = this;
		const det = e.detay || e.rec || (uid == null ? gridWidget.getrowdata(rowIndex) : gridWidget.getrowdatabyid(uid)), degerler = { eski: det.dipHesabaEsasDegerler };
		super.satirBedelHesapla(e); degerler.yeni = det.dipHesabaEsasDegerler;
		const {dipIslemci} = fis; if (dipIslemci) { dipIslemci.satirDegisimIcinHesapla({ detay: det, degerler }) }
	}
}
class EIslAlimGridKontrolcu extends TicariGridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e);
		const {fis} = this, ekTabloKolonlari = [
			new GridKolon({ belirtec: 'eSHText', text: 'EF Stok', genislikCh: 40 }).readOnly(),
			new GridKolon({ belirtec: 'eIskOranText', text: 'EF İsk%', genislikCh: 8 }).readOnly(),
			new GridKolon({ belirtec: 'eMiktar', text: 'EF Miktar', genislikCh: 8 }).readOnly().tipDecimal(),
			new GridKolon({ belirtec: 'eBedel', text: 'EF Bedel', genislikCh: 13 }).readOnly().tipDecimal_bedel(),
			new GridKolon({ belirtec: 'ayirac1', text: ' ', minWidth: 1, width: 20, cellClassName: 'ayirac' }).readOnly()
		];
		let {tabloKolonlari} = e; for (const colDef of tabloKolonlari) { colDef.serbestBirak() }
		const index_tipColDef = tabloKolonlari.findIndex(colDef => colDef.belirtec == 'tip');
		if (index_tipColDef) { tabloKolonlari.splice(index_tipColDef, 0, ...ekTabloKolonlari) } else { tabloKolonlari.unshift(...ekTabloKolonlari) }
	}
}
