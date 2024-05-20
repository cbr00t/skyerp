class KaliteGirisPart extends GerceklemeIcinAltGridliGirisPart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'kaliteGiris' }
	static get maxNumuneSayisi() { return 40 }

	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {
			parentRec: e.parentRec ?? e.rec,
			oemSayac: e.oemSayac, gerSayac: e.gerSayac,
			savedRecs: e.savedRecs,
			title: (e.title ?? 'Kalite Giriş Ekranı') || ''
		});
		const {parentRec} = this;
		if (!this.oemSayac) this.oemSayac = parentRec?.oemSayac ?? parentRec?.oemsayac
		if (!this.gerSayac) this.gerSayac = parentRec?.gerSayac ?? (parentRec?.gersayac || parentRec?.kaysayac)
		let value = e.numuneSayisi ?? (app.params.kalite.uretimNumuneSayisi || (parentRec?.miktar)); if (value) value = Math.min(Math.max(value, 0), this.class.maxNumuneSayisi)
		this.numuneSayisi = value;
	}
	initLayout(e) {
		super.initLayout(e); const {layout} = this;
		const fbd_numuneSayisi = new FBuilder_NumberInput({
			parentPart: this, parent: e => this.layout, id: 'numuneSayisi', etiket: 'Numune Sayısı',
			min: 0, max: this.class.maxNumuneSayisi, fra: 0, maxLength: 3, value: this.numuneSayisi,
			degisince: e => this.numuneSayisiDegisti(e)
		}) /*.etiketGosterim_yok()*/.addStyle(e => `$builderCSS { font-size: 120%; text-align: center; position: absolute; width: 150px !important; top: 5px; right: 200px; z-index: 2000 !important }`);
		fbd_numuneSayisi.run()
	}
	gridArgsDuzenleDevam(e) { super.gridArgsDuzenleDevam(e); $.extend(e.args, { autoRowHeight: true, rowsHeight: 35, columnsHeight: 35, showGroupsHeader: true, editMode: 'click' /*, virtualMode: true*/ }) }
	get defaultTabloKolonlariDogrudan() {
		const {numuneSayisi} = this, liste = [
			...super.defaultTabloKolonlariDogrudan,
			new GridKolon({
				belirtec: 'olcukod', text: 'Ölçü', minWidth: 150, maxWidth: 250, width: '35%',
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(
						html,
						`<div class="parent flex-row">
							<div class="kod">${rec.olcukod}</div>
							<div class="aciklama">${rec.olcuadi}</div>
						 </div>`
					)
				}
			}).readOnly().tipTekSecim({ recAdiAttr: 'olcuadi', source: e => MQOlcu.loadServerData() }),
			new GridKolon({ belirtec: 'min', text: 'Min', genislikCh: 8 }).readOnly().tipDecimal(),
			new GridKolon({ belirtec: 'max', text: 'Max', genislikCh: 8 }).readOnly().tipDecimal(),
			new GridKolon({ belirtec: 'mbrm', text: 'Brm', genislikCh: 5 }).readOnly(),
			new GridKolon({
				belirtec: 'ortalama', text: 'Ortalama', genislikCh: 13, columnType: 'custom',
				cellsRenderer: (...args) => this.grid_cellsRenderer_deger(...args),
				createEditor: (...args) => this.grid_createEditor_deger(...args),
				initEditor: (...args) => this.grid_initEditor_deger(...args),
				getEditorValue: (...args) => this.grid_getEditorValue_deger(...args)
			}).readOnly()
			/*new GridKolon({ belirtec: 'uygunluk', text: 'Uygunluk', genislikCh: 13 })
				// .readOnly()
				.tipTekSecim({
					kodsuz: true,
					kaListe: [
						new CKodVeAdi({ kod: 'K', aciklama: 'Kabul' }),
						new CKodVeAdi({ kod: 'R', aciklama: 'Red' }),
						new CKodVeAdi({ kod: 'S', aciklama: 'Şartlı Kabul' }),
					]
				})*/
		];
		for (let i = 1; i <= numuneSayisi; i++)liste.push(this.getColDef_deger(i))
		liste.push(...[new GridKolon({ belirtec: 'notlar', text: 'Notlar', genislikCh: 50 })]);
		return liste
	}
	async defaultLoadServerData(e) {
		/*
		  SELECT fkal.seq, fkal.olcukod, olc.aciklama olcuadi, olc.sayidigit, olc.mbrm, olc.veritipi
					, olc.buyukvevarakibet, olc.kucukveyokakibet, arasindaakibet
					, fkal.mindeger, fkal.maxdeger
			FROM operemri oem, emirdetay edet
					, operkritanim okri, operkridetay fkal, muayeneolcu olc
			WHERE oem.kaysayac=#OEMSAYAC# AND oem.emirdetaysayac=edet.kaysayac
					AND edet.formulsayac=okri.formulsayac AND oem.opno=okri.opno
					AND okri.kaysayac=fkal.fissayac AND fkal.olcukod=olc.kod
			order by fkal.seq
		  */
		let sent = new MQSent({
			from: 'operemri oem',
			fromIliskiler: [
				{ from: 'emirdetay edet', iliski: 'oem.emirdetaysayac = edet.kaysayac' },
				{ from: 'operkritanim okri', iliski: ['edet.formulsayac = okri.formulsayac', 'oem.opno = okri.opno'] },
				{ from: 'operkridetay fkal', iliski: 'okri.formulsayac = fkal.fissayac' },
				{ from: 'muayeneolcu olc', iliski: 'fkal.olcukod = olc.kod' }
			],
			where: [ { degerAta: this.oemSayac, saha: 'oem.kaysayac' } ],
			sahalar: ['oem.kaysayac oemsayac']
		});
		sent.addWithAlias('fkal',
			'seq', 'olcukod', 'mindeger', 'maxdeger');
		sent.addWithAlias('olc',
			'aciklama olcuadi', 'sayidigit', 'mbrm', 'veritipi',
			'buyukvevarakibet', 'kucukveyokakibet', 'arasindaakibet',
		);
		let stm = new MQStm({ sent: sent, orderBy: ['oemsayac', 'seq'] });
		// stm.fromGridWSArgs(e.wsArgs);
		
		// let recs = await MQMasterOrtak.loadServerData({ belirtec: 'kaliteGirisData', query: stm });
		let recs = await app.sqlExecSelect({ query: stm });
		// return { totalrecords: 1000, records: recs }
		return recs
	}
	loadServerData_recsDuzenle(e) {
		super.loadServerData_recsDuzenle(e); const {recs} = e;
		if (recs) {
			const getAnah = rec => `${rec.oemsayac}|${rec.seq}`, {savedRecs} = this;
			const anah2Rec = {}; for (const rec of recs) anah2Rec[getAnah(rec)] = rec
			if (savedRecs) {
				for (const _rec of savedRecs) {
					let rec;
					for (const key in _rec) {
						if (key == 'ortalama' || key.startsWith('sayideger')) {
							const value = _rec[key];
							if (value != null) { if (!rec) rec = anah2Rec[getAnah(_rec)]; if (rec) rec[key] = value }
						}
					}
				}
			}
		}
	}
	gridVeriDegisti(e) {
		super.gridVeriDegisti(e); const args = e.event?.args || {}, belirtec = args.datafield || '';
		if (belirtec.startsWith('sayideger')) {
			const {gridWidget, numuneSayisi} = this, {rowIndex} = e, rec = gridWidget.getrowdata(rowIndex);
			const veriTipi = rec.veritipi; let toplam = 0;
			for (const key in rec) {
				if (key.startsWith('sayideger')) {
					let value = rec[key]; if (typeof value == 'boolean') value = bool2Int(value)
					if (value) toplam += value
				}
			}
			const ortalama = (
				veriTipi == 'U' ? toplam == numuneSayisi :
				veriTipi == 'X' ? !!toplam :
				roundToFra(toplam / numuneSayisi, 5)
			);
			gridWidget.setcellvalue(rowIndex, 'ortalama', ortalama)
		}
	}
	grid_globalCellClassNameHandler_ek(colDef, rowIndex, belirtec, value, rec) {
		const result = super.grid_globalCellClassNameHandler_ek(colDef, rowIndex, belirtec, value, rec) || [];
		const ozelBelirtecSet = this._ozelBelirtecSet = this._ozelBelirtecSet ?? asSet(['_rowNumber', '_sil']);
		if (!ozelBelirtecSet[belirtec]) {
			if (!colDef.attributes.editable)
				result.push('grid-readOnly')
		}
		switch (belirtec) {
			case 'uygunluk':
				result.push('center bold');
				switch (rec.uygunluk) {
					case 'K': result.push('bg-green white'); break
					case 'R': result.push('bg-darkred white'); break
					case 'S': result.push('bg-darkorange'); break
				}
				break
			case 'ortalama':
				result.push('center');
				break
			default:
				if (belirtec.startsWith('sayideger')) {
					result.push('center');
					if (value != null) {
						if (value)
							result.push('bold');
						if (value < 0)
							result.push('red')
						else if (value > 0)
							result.push('royalblue')
					}
				}
				break
		}
		return result
	}
	grid_cellsRenderer_deger(colDef, rowIndex, columnField, value, html, jqxCol, rec) {
		const kolonTip = this.getRec2KolonTip(rec);
		if (kolonTip) {
			const handler = kolonTip.cellsRenderer || kolonTip.cellsRenderer_ozel;
			if (handler)
				return getFuncValue.call(this, handler, colDef, rowIndex, columnField, value, html, jqxCol, rec)
		}
		return changeTagContent(html, value)
	}
	grid_createEditor_deger(colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) {
		const {gridWidget} = colDef.gridPart;
		const kolonTip = this.getRec2KolonTip(gridWidget.getrowdata(rowIndex));
		if (kolonTip) {
			const handler = kolonTip.createEditor || kolonTip.createEditor_ozel;
			if (handler)
				return getFuncValue.call(this, handler, colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight)
		}
	}
	grid_initEditor_deger(colDef, rowIndex, value, editor, cellText, pressedChar) {
		const {gridWidget} = colDef.gridPart;
		const kolonTip = this.getRec2KolonTip(gridWidget.getrowdata(rowIndex));
		if (kolonTip) {
			const handler = kolonTip.initEditor || kolonTip.initEditor_ozel;
			if (handler)
				return getFuncValue.call(this, handler, colDef, rowIndex, value, editor, cellText, pressedChar)
		}
	}
	grid_getEditorValue_deger(colDef, rowIndex, value, editor) {
		const {gridWidget} = colDef.gridPart;
		const kolonTip = this.getRec2KolonTip(gridWidget.getrowdata(rowIndex));
		if (kolonTip) {
			const handler = kolonTip.getEditorValue || kolonTip.getEditorValue_ozel;
			if (handler)
				return getFuncValue.call(this, handler, colDef, rowIndex, value, editor)
		}
		return value
	}
	grid_cellBeginEdit_deger(colDef, rowIndex, belirtec, colType, value) {
		const {gridWidget} = colDef.gridPart;
		const kolonTip = this.getRec2KolonTip(gridWidget.getrowdata(rowIndex));
		if (kolonTip) {
			const handler = kolonTip.cellBeginEdit || kolonTip.cellBeginEdit_ozel;
			if (handler)
				return getFuncValue.call(this, handler, colDef, rowIndex, belirtec, colType, value)
		}
	}
	grid_cellEndEdit_deger(colDef, rowIndex, belirtec, cellType, oldValue, newValue) {
		const {gridWidget} = colDef.gridPart;
		const kolonTip = this.getRec2KolonTip(gridWidget.getrowdata(rowIndex));
		if (kolonTip) {
			const handler = kolonTip.cellEndEdit || kolonTip.cellEndEdit_ozel;
			if (handler)
				return getFuncValue.call(this, handler, colDef, rowIndex, belirtec, cellType, oldValue, newValue)
		}
	}

	getColDef_deger(index) {
		return new GridKolon({
			belirtec: `sayideger${index}`, text: `Num${index}`, genislikCh: 8, columnType: 'custom',
			cellsRenderer: (...args) => this.grid_cellsRenderer_deger(...args),
			createEditor: (...args) => this.grid_createEditor_deger(...args),
			initEditor: (...args) => this.grid_initEditor_deger(...args),
			getEditorValue: (...args) => this.grid_getEditorValue_deger(...args),
			cellBeginEdit: (...args) => this.grid_cellBeginEdit_deger(...args),
			cellEndEdit: (...args) => this.grid_cellEndEdit_deger(...args)
		})
	}
	getRec2KolonTip(rec) { return this.getVeriTipi2KolonTip(rec?.veritipi) }
	getVeriTipi2KolonTip(veriTipi) {
		let kolonTip;
		switch (veriTipi) { case 'U': case 'X': return new GridKolonTip_Bool({ value: veriTipi == 'U' }) }
		return new GridKolonTip_Decimal(/*{ fra: 5 }*/)
	}
	numuneSayisiDegisti(e) {
		const timerKey = '_timer_numuneSayisiDegisti'; let timer = this[timerKey]; if (timer) clearTimeout(timer)
		timer = this[timerKey] = setTimeout(() => {
			try {
				const {builder} = e, numuneSayisi = this.numuneSayisi = e.value, tabloKolonlari = [];
				for (const colDef of this.duzKolonTanimlari) {
					const {belirtec} = colDef; if (!belirtec || belirtec.startsWith('sayideger')) continue
					tabloKolonlari.push(colDef);
					if (belirtec == 'ortalama') { for (let i = 1; i <= numuneSayisi; i++) tabloKolonlari.push(this.getColDef_deger(i)) }
				}
				this.updateColumns(tabloKolonlari)
			}
			finally { delete this[timerKey] }
		}, 500)
	}
	async tamamIstendi(e) {
		e = e || {}; super.tamamIstendi(e); const {tamamIslemi} = this;
		if (tamamIslemi) {
			const recs = this.boundRecs, {parentRec, numuneSayisi, oemSayac, gerSayac} = this, _e = $.extend({}, e, { parentRec, recs, numuneSayisi, oemSayac, gerSayac });
			try { if ((await getFuncValue.call(this, tamamIslemi, _e)) === false) { return false } } catch (ex) { hConfirm(getErrorText(ex)); throw ex }
		}
		this.close()
	}
}
