class TicariGridKontrolcu extends TSGridKontrolcu {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle(e) {
		let { tabloKolonlari } = e
		tabloKolonlari.push(
			new GridKolon({
				belirtec: 'tip', text: ' ', genislikCh: 13, cellValueChanged: e => {
					e = e.args ?? e
					let { owner: gridWidget, rowindex: rowIndex, datafield: belirtec, newvalue: tip }  = e
					let rec = gridWidget.getrowdata(rowIndex, belirtec)
					let { uid } = rec
					switch (tip) {
						case 'stok': rec = new TSStokDetay(rec); break; case 'hizmet': rec = new TSHizmetDetay(rec); break
						case 'demirbas': rec = new TSDemirbasDetay(rec); break; case 'aciklama': rec = new TSAciklamaDetay(rec); break
					}
					let { sh: colDef } = this.parentPart.belirtec2Kolon
					rec.shKod = rec.shAdi = null
					gridWidget.updaterow(uid, rec)
				}
			}).noSql()
				.tipTekSecim({ tekSecimSinif: MQSHTip })
				.kodsuz().listedenSecilmez()
				.alignCenter().sabitle()
		)
		
		super.tabloKolonlariDuzenle(e)
		tabloKolonlari = e.tabloKolonlari
		
		let { fis } = this
		let shColDef = tabloKolonlari.find(colDef => colDef.belirtec == 'sh')
		let { kaKolonu } = shColDef
		let savedEditorHandlers = {}
		for (let selector of ['createEditor', 'initEditor', 'getEditorValue']) {
			savedEditorHandlers[selector] = kaKolonu[selector] }
		extend(kaKolonu, {
			satirEklendi: e => { }, satirSilinecek: e => { }, satirSilindi: e => { },
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
				let { gridWidget } = colDef.gridPart
				let detaySinif = gridWidget?.getrowdata(rowIndex)?.class
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
				cellBeginEdit: (colDef, rowIndex, belirtec, colType, value, result) => {
					let {gridWidget} = this, det = gridWidget.getrowdata(rowIndex)
					return !!det.kdvDegiskenmi
				},
				cellValueChanged: e => {
					let { fis, parentPart } = this
					let { yildizlimi } = fis.class
					let { args } = e
					let kdvKod = args.value || ''
					let det = args.owner.getrowdata(args.rowindex)
					
					if (!fis.yildizlimi)
						det.orjkdvKod = kdvKod
					this.gridSatirGuncellendi(e)
				}
			}).tipTekSecim({ kaListe: fis.class.kdvKAListe }).sifirGosterme(),
			new GridKolon({ belirtec: 'otvBelirtec', text: 'Ötv', genislikCh: 4 }).tipNumerik().sifirGosterme().readOnly().hidden(),
			new GridKolon({ belirtec: 'stopajBelirtec', text: 'Sto', genislikCh: 4 }).tipNumerik().sifirGosterme().readOnly().hidden(),
			new GridKolon({ belirtec: 'kdvEkText', text: 'KDV Ek', genislikCh: 12, cellClassName: 'kdvEkText grid-readOnly' }).readOnly().hidden()
		);
		shColDef.stmDuzenleyiciEkle(e => {
			let { aliasVeNokta, stm, fis, mfSinif } = e
			let { kdvHesapKodPrefix_stok, kdvHesapKodPrefix_hizmet } = fis?.class ?? {}
			for (let sent of stm) {
				let hesapSaha_almSatPrefix = (
					(mfSinif.stokmu || mfSinif.demirbasmi) ? kdvHesapKodPrefix_stok :
					mfSinif.hizmetmi ? kdvHesapKodPrefix_hizmet :
					null
				)
				if (!hesapSaha_almSatPrefix)
					return
				
				let { vergiBelirtecler } = mfSinif
				for (let key of vergiBelirtecler) {
					if (key == TicariFis.vergiBelirtec_kdv) {
						let kdvDegiskenmiClause = `${aliasVeNokta}${hesapSaha_almSatPrefix}kdvdegiskenmi`
						sent.sahalar.add(`${kdvDegiskenmiClause} kdvDegiskenmi`)
					}
					let vergiHesapClause = `${aliasVeNokta}${hesapSaha_almSatPrefix}${key}hesapkod`;
					sent.fromIliski(`vergihesap ${key}ver`, `${vergiHesapClause} = ${key}ver.kod`);
					sent.sahalar.add(`${vergiHesapClause} ${key}Kod`, `${key}ver.belirtec ${key}Belirtec`)					/* ( stk.satkdvhesapkod kdvkod ... ) gibi */
				}
			}
			mfSinif.ticariGrid_shKolon_stmDuzenleEk?.(e)
		});
		shColDef.degisince(async e => {
			let { gridPart, fis, mfSinif, gridRec: det, rec, setCellValue } = e
			let detaySinif = det?.class
			if (detaySinif.aciklamami)
				return

			// let { belirtec2Kolon } = gridPart
			let isaretlimi = await fis.kayitIcinOzelIsaretlimi
			rec = await rec ?? {}
			let { mustKod } = fis
			let { shKod } = rec ?? {}
			let kosulResult
			if (mustKod && shKod) {
				let { kosulYapilar } = fis, { FY } = kosulYapilar ?? {};
				kosulResult = shKod ? values(await SatisKosul_Fiyat.getAltKosulYapilar([shKod], FY, mustKod))?.[0] : null
				let {fiyat} = kosulResult ?? {}
				if (fiyat)
					extend(det, { fiyat, ozelFiyatVarmi: true })
			}
			
			let { vergiBelirtecler, vergiBelirtec_kdv } = TicariFis
			for (let belirtec of vergiBelirtecler) {
				let kod2VergiBilgi = await MQVergi.getKod2VergiBilgi({ belirtec })
				let kdvmi = belirtec == vergiBelirtec_kdv
				let k = `${belirtec}Kod`, value = rec[k] || ''
				let duzValue = isaretlimi ? '' : value
				det[`orj${k}`] = value
				det[k] = duzValue
				det[`${belirtec}Orani`] = kod2VergiBilgi[det[`${belirtec}Kod`]]?.oran
				if (kdvmi) 
					det._kdvDegiskenmi = asBool(rec.kdvDegiskenmi)
				
				k = `${belirtec}Belirtec`; value = rec[k] || ''
				det[`orj${k}`] = value
				
				setCellValue({ belirtec: k, value: duzValue })
			}

			delay(5).then(async () => {
				await mfSinif.ticariGrid_shKolon_degisinceEk?.({ ...e, rec })
				await fis.shKodDegisti(e)
			})
			
			delete e.rec /* e.rec => Promise (async) */
			e.detay = det
			this.satirBedelHesapla(e)
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
						let oranlar = value;
						if (oranlar) {
							let result = []; for (let oran of oranlar) { if (oran && oran > 0) { result.push(oran) } }
							html = changeTagContent(html, ($.isEmptyObject(result) ? '' : `%${result.map(x => x.toString()).join('+')}`))
						}
						return html
					},
					columnType: 'template', createEditor: (colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
						let {gridWidget} = colDef.gridPart, rec = gridWidget?.getrowdata(rowIndex);
						let iskYapiItem = (colDef.userData || {}).iskYapiItem || {}, iskKey = iskYapiItem.key, {maxSayi} = iskYapiItem;
						for (let i = 0; i < maxSayi; i++) {
							let input = $(`<input class="${iskKey} isk" style="width: 80px;" maxlength="3" data-iskkey="${iskKey}" data-iskindex="${i}"></input>`);
							input.on('focus', evt => evt.currentTarget.select());
							input.on('change', ({ currentTarget: target }) => target.value = roundToBedelFra(asFloat(target.value)));
							input.appendTo(editor);
						}
					},
					initEditor: (colDef, rowIndex, value, editor, cellText) => {
						let {gridWidget} = colDef.gridPart, rec = gridWidget?.getrowdata(rowIndex), oranlar = value, inputs = editor.find('.isk');
						if (inputs.length) {
							for (let i = 0; i < inputs.length; i++) { let input = inputs.eq(i), iskIndex = asInteger(input.data('iskindex')); input.val(asFloat(oranlar[iskIndex])); }
							setTimeout(() => inputs.eq(0).focus(), 100)
						}
					},
					getEditorValue: (colDef, rowIndex, value, editor) => {
						let {gridWidget} = colDef.gridPart, rec = gridWidget?.getrowdata(rowIndex), result = [], inputs = editor.find('.isk');
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
						this.satirBedelHesapla(e)
						let { owner: gridWidget } = args
						let rec = gridWidget.getrowdata(args.rowindex)
						setTimeout(() => gridWidget.updaterow(rec.uid, rec), 10)
					}
				})
			);
		}
	}
	islKodIsaretDegisti(e) {
		this.vergiIcinDuzenle(e)
	}
	vergiIcinDuzenle(e) {
		let { vergiBelirtecler, vergiBelirtec_kdv } = TicariFis
		let { fis, gridWidget, parentPart: tanimPart = {} } = this
		let { belirtec2Kolon: b2cd = {} } = tanimPart
		
		let { ozelIsaret, kdvKod, kdvBelirtec } = e
		let isaretlimi = ozelIsaret == '*'
		let sabitKdvAtamasimi = kdvKod !== undefined
		if (sabitKdvAtamasimi)
			vergiBelirtecler = [vergiBelirtec_kdv]
		
		gridWidget.beginupdate()
		try {
			for (let det of gridWidget.getboundrows()) {
				let { boundindex: ri } = det
				for (let vb of vergiBelirtecler) {                           // vb: vergiBelirtec
					let kdvmi = vb == vergiBelirtec_kdv
					let setValue = (sk, tk, orjmi, belirtecmi) => {          // sk: sourceKey, tk: targetKey
						tk ||= sk

						// atanacak 'kdvKod' bildirildiyse onu kullan aksinde (detay değeri + isaretlimi) durumuna bak
						let orjK = orjmi ? sk : `orj${sk}`
						let orjV = det[orjK]
						let kdvKodVeyaBelirtec = ( belirtecmi ? kdvBelirtec : kdvKod ) || kdvKod
						let v = (
							isaretlimi ? '' :
							sabitKdvAtamasimi
								? ( kdvKod == null ? orjV : kdvKodVeyaBelirtec )
								: orjV
						) ?? ''
						
						// Grid Kolon olarak varsa 'setcellvalue', aksinde det[tk]
						if (b2cd[tk]) {
							gridWidget.setcellvalue(ri, tk, v)                // !! 'cellValueChanged' event tetikler
							if (sabitKdvAtamasimi)
								det[orjK] = orjV
						}
						else
							det[tk] = v
					}

					;( sabitKdvAtamasimi ? [''] : ['', 'orj'] ).forEach(pr =>
					['Kod', 'Belirtec'].forEach(pf => {
						setValue(
							`${pr}${vb}${pf}`,                                // source: kdvKod, kdvBelirtec, orjkdvKod, orjkdvBelirtec, ...
							`${vb}${pf}`,                                     // target: kdvKod, kdvBelirtec, kdvKod, kdvBelirtec, ...
							pr == 'orj',
							pf == 'Belirtec'
						)
					}))
				}
	
				let _e = { ...e, detay: det, args: { rowindex: ri } }
				delete _e.rec
				this.satirBedelHesapla(_e)
			}
		}
		finally { gridWidget.endupdate(false) }
		delay(10).then(() =>
			tanimPart.dipTazele())
	}
	efAyrimTipiDegisi(e) {
		// let { fis, gridWidget, parentPart: tanimPart } = this
		// let { value = fis?.efAyrimTipi } = e
	}
	gridSatirGuncellendi(e = {}) {
		let { uid, rowIndex: rowindex } = e
		e.args ??= { uid, rowindex }
		this.satirBedelHesapla(e)
		delay(10).then(() =>
			this.parentPart.dipTazele())
	}
	gridSatirSilindi(e) {
		super.gridSatirSilindi(e)
		let { fis: { dipIslemci } = {}, parentPart } = this
		delay(10).then(() =>
			parentPart.dipTazele())
	}
	miktarFiyatDegisti(e) {
		super.miktarFiyatDegisti(e)
		delay(10).then(() =>
			this.parentPart.dipTazele())
	}
	satirBedelHesapla(e) {
		let { args = {} } = e
		let { uid, rowIndex = args.rowindex } = args
		let { parentPart: tanimPart, gridWidget: w, fis = {} } = this
		let { detay: det = e.rec } = e
		if (!det)
			det = uid == null ? w.getrowdata(rowIndex) : w.getrowdatabyid(uid)
		
		let degerler = { eski: det.dipHesabaEsasDegerler }
		super.satirBedelHesapla(e)
		degerler.yeni = det.dipHesabaEsasDegerler

		let { dipIslemci } = fis
		dipIslemci?.satirDegisimIcinHesapla?.({ detay: det, degerler })
	}
}

class EIslAlimGridKontrolcu extends TicariGridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e);
		let {fis} = this, ekTabloKolonlari = [
			new GridKolon({ belirtec: 'eSHText', text: 'EF Stok', genislikCh: 40 }).readOnly(),
			new GridKolon({ belirtec: 'eIskOranText', text: 'EF İsk%', genislikCh: 8 }).readOnly(),
			new GridKolon({ belirtec: 'eMiktar', text: 'EF Miktar', genislikCh: 8 }).readOnly().tipDecimal(),
			new GridKolon({ belirtec: 'eBedel', text: 'EF Bedel', genislikCh: 13 }).readOnly().tipDecimal_bedel(),
			new GridKolon({ belirtec: 'ayirac1', text: ' ', minWidth: 1, width: 20, cellClassName: 'ayirac' }).readOnly()
		];
		let {tabloKolonlari} = e; for (let colDef of tabloKolonlari) { colDef.serbestBirak() }
		let index_tipColDef = tabloKolonlari.findIndex(colDef => colDef.belirtec == 'tip');
		if (index_tipColDef) { tabloKolonlari.splice(index_tipColDef, 0, ...ekTabloKolonlari) }
		else { tabloKolonlari.unshift(...ekTabloKolonlari) }
	}
}
