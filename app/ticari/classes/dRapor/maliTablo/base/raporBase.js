class SBRapor extends DGrupluPanelRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get aciklama() { return 'Mali Tablolar' }
	static get kategoriKod() { return 'SB' } static get kategoriAdi() { return 'Mali Tablolar' }
	static get chartVarmi() { return false } static get ozetVarmi() { return false }
	static get araSeviyemi() { return this == SBRapor }

	islemTuslariArgsDuzenle({ liste }) {
		super.islemTuslariArgsDuzenle(...arguments)
		liste.push(...[
			{ id: 'izle', text: '', handler: _e => this.main.hareketKartiGoster({ ...e, ..._e, id: undefined }) }
		].filter(x => !!x))
	}
}
class SBRapor_Main extends DAltRapor_TreeGrid {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get mainmi() { return true }
	get sahaAlias() { return 'bedel' } get tazeleYapilirmi() { return true } get noAutoColumns() { return true }
	static get etiket() { return this.raporTanim?.aciklama ?? super.etiket }
	static get raporTanimSinif() { return SBTablo } static get secimSinif() { return DonemselSecimler }
	get tabloYapi() {
		let {_tabloYapi: result} = this
		if (result == null) {
			let _e = { result: new TabloYapi() }; this.tabloYapiDuzenle(_e); this.tabloYapiDuzenle_son(_e);
			this.tabloYapiDuzenle_ozel?.(_e); result = _e.result
		}
		return result
	}
	
	onGridInit(e) {
		let result = super.onGridInit(e); let {grid} = this.gridPart
		grid.on('rowDoubleClick', _e => {
			let {args: { row: { id } = {} } = {}} = _e
			this.hareketKartiGoster({ ..._e, ...e, id })
		})
		return result
	}
	tabloYapiDuzenle({ result }) {
		result.addToplamBasit_bedel('BEDEL', 'Bedel', this.sahaAlias)
	}
	tabloYapiDuzenle_son({ result }) { }
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		this.class.maliTablo_basSecimlerDuzenle(...arguments)
	}
	static maliTablo_basSecimlerDuzenle({ secimler: sec }) {
		let {takipNo} = app.params.ticariGenel.kullanim
		if (takipNo) { sec.addKA('takip', DMQTakipNo).addKA('takipGrup', DMQTakipGrup) }
		sec.addKA('sube', DMQSube).addKA('subeGrup', DMQSubeGrup)
	}
	async tazele(e) {
		await this.tazeleOncesi(e);
		let {gridPart, gridPart: { grid, gridWidget }, rapor: { isPanelItem }, raporTanim, _tabloTanimGosterildiFlag} = this
		if (!raporTanim) {
			if (!isPanelItem) {
				if (_tabloTanimGosterildiFlag) { hConfirm('<b>Rapor Tanımı</b> seçilmelidir') }
				else { this.raporTanimIstendi(e) }
			}
			return
		}
		let _e = CObject.From(e); await super.tazele(_e)    /* super.tazele() ==> this.loadServerData() işlemini çağıracak */
		$.extend(_e, { liste: _e.tabloKolonlari ?? _e.kolonTanimlari ?? [], recs: gridWidget.getRows() })
		Object.defineProperty(_e, 'flatRecs', {
			get: function() { return this.recs.flatMap(rec => [rec, ...rec.detaylar]) }
		})
		for (let key of ['tabloKolonlari', 'kolonTanimlari']) { delete _e[key] }
		this.tabloKolonlariDuzenle(_e)
		this.tabloKolonlariDuzenle_ozel?.(_e)
		let colDefs = this.tabloKolonlari = _e.liste || []
		let columns = colDefs.flatMap(colDef => colDef.jqxColumns)
		try { grid.jqxTreeGrid('columns', columns) }
		catch (ex) { console.error(ex); return }
		await this.tazeleSonrasi(e)
	}
	ekCSSDuzenle({ raporTanim, colDefs, colDef, rowIndex, belirtec, value, rec: { cssClassesStr } = {}, result }) {
		if (cssClassesStr)
			result.push(cssClassesStr)
	}
	cellsRenderer({ raporTanim, colDefs, colDef, rowIndex, belirtec, value, html, jqxCol, rec: { cssStyle } = {} }) {
		return cssStyle ? `<span style="${cssStyle}">${getTagContent(html)}</span>` : html
	}
	tabloKolonlariDuzenle({ liste: colDefs, recs, flatRecs, yatayDegerSet }) {
		super.tabloKolonlariDuzenle(...arguments); yatayDegerSet ??= {}
		let {raporTanim, raporTanim: { yatayAnalizVarmi, yatayAnaliz }, tabloYapi} = this
		let cellClassName = (colDef, rowIndex, belirtec, value, rec) => {
			let result = ['treeRow', belirtec];
			if (rec) { result.push(rec.leaf ? 'leaf' : 'grup') }
			let toplammi = (typeof value == 'number');
			result.push(toplammi ? 'toplam' : 'icerik')
			if (toplammi) {
				let alacakmi = value < 0;
				result.push(!value ? 'zero' : alacakmi ? 'negative' : 'positive')
			}
			let {level} = rec; if (level != null) { result.push('level-' + level.toString()) }
			if (toplammi && yatayAnalizVarmi) {
				let {userData: { yatayToplammi } = {}} = colDef
				if (yatayToplammi) { result.push('yatayToplam') }
			}
			let _e = { raporTanim, colDefs, colDef, rowIndex, belirtec, value, rec, result }
			this.ekCSSDuzenle(_e); result = _e.result;
			return result.filter(x => !!x).join(' ')
		}
		let cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
			let {tip} = colDef
			html = tip?.cellsRenderer?.(colDef, rowIndex, belirtec, value, html, jqxCol, rec) ?? html
			let _e = { ...arguments[0], raporTanim, colDefs, colDef, rowIndex, belirtec, value, html, jqxCol, rec }
			let result = this.cellsRenderer(_e); result ??= _e.html
			return result ?? html
		}
		colDefs.push(
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 50 }),
			...Object.values(tabloYapi.grup).map(e => e.colDefs).flat()
		);
		for (let {colDefs: [orjColDef]} of Object.values(tabloYapi.toplam)) {
			let colDef = orjColDef.deepCopy()
			colDef.userData = { toplammi: true }
			{
				let {text} = colDef
				text = colDef.text = `<div class="forestgreen" style="border: 1px solid forestgreen; padding: 10px">Top.${text}</div>`
			}
			colDefs.push(colDef)
			if (yatayAnalizVarmi) {
				colDef.userData.yatayToplammi = true
				for (let yatay in yatayDegerSet) {
					let _colDef = orjColDef.deepCopy()
					_colDef.userData = { yatayDegermi: true }
					_colDef.belirtec += `_${yatay}`
					_colDef.text = `<span class=royalblue>${yatay || '<i>&lt;BOŞ&gt;</i>'}</span>`
					colDefs.push(_colDef)
				}
			}
		}
		for (let colDef of colDefs)
			$.extend(colDef, { cellClassName, cellsRenderer })
	}
	async loadServerData(e) {
		let {session: { dbName: aktifDB } = {}} = config
		let {dRapor: { konsolideCikti, ekDBListe} = {}} = app.params
		ekDBListe = konsolideCikti && aktifDB && ekDBListe?.length
				? ekDBListe.filter(x => x != aktifDB) : nulls
		$.extend(e, { konsolideCikti, ekDBListe, aktifDB })
		let sevRecs = await this.loadServerDataDevam(e)
		/*if (konsolideCikti) {
			sevRecs = e.sevRecs = [{
				seviyeNo: 0, aciklama: `<span class="forestgreen bold">(${aktifDB})</span>`,
				detaylar: sevRecs
			}];
			ekDBListe ??= []; for (let db of ekDBListe) {
				$.extend(_e, { db });
				let _sevRecs = await this.loadServerDataDevam(_e); if (!_sevRecs) { continue }
				if (_sevRecs?.length) {
					sevRecs.push({
						seviyeNo: 0, aciklama: `<span class="royalblue">${db}</span>`,
						detaylar: _sevRecs
					})
				}
			}
		}*/
		return sevRecs
	}
	async loadServerDataDevam(e) {
		let sevRecs = await super.loadServerData(e)
		if (!sevRecs)
			return sevRecs
		let {id2Detay, formulYapilari, recs, ind2Rec} = e, {tabloYapi: { toplam }} = this
		let attrListe = Object.values(toplam).map(item => item.colDefs[0].belirtec)
		for (let parentRec of sevRecs) {
			for (let formulDetaylar of Object.values(formulYapilari))
			for (let formul of formulDetaylar)
			for (let attr of attrListe) {
				let value = await formul.eval({ ...e, det: formul, recs, sevRecs, parentRec, attr, ind2Rec })
				if (value != null) { parentRec[attr] = value }
			}
		}
		return sevRecs
	}
	async loadServerDataInternal(e) {
		await super.loadServerDataInternal(e)
		let {detayli, ekDBListe, aktifDB, detaylar, detay: _det} = e, yatayDegerSet = e.yatayDegerSet = {}
		let rapor = this, {raporTanim = {}, secimler, secimler: {tarihBS: donemBS}, sahaAlias} = this
		let {raporTanim: { yatayAnalizVarmi, yatayAnaliz } = {}} = this
		detaylar ??= _det ? [_det] : raporTanim.detaylar
		let yatayDBmi = yatayAnalizVarmi && yatayAnaliz.dbmi
		let id2Promise = {}, id2Detay = e.id2Detay = {}, formulYapilari = e.formulYapilari = {}
		let _e = { ...e, rapor, raporTanim, secimler, donemBS, detaylar, yatayAnalizVarmi, yatayAnaliz }
		for (let key of ['altSeviyeToplamimi', 'satirlarToplamimi']) { formulYapilari[key] = [] }
		for (let det of detaylar) {
			let {sayac: id, hesapTipi = {}, veriTipi: { donemTipi }} = det; id2Detay[id] = det
			let {question: selector, ekBilgi: { ticarimi, hareketcimi, querymi } = {}} = hesapTipi
			if (!querymi) {    /* satır toplam, formul, ... vs */
				if (selector) { formulYapilari[selector]?.push(det) }
				continue
			}
			if (donemTipi == 'B' && !donemBS?.basi) { continue }
			let sonucUni = new MQUnionAll(), stm = new MQStm({ sent: sonucUni })
			$.extend(_e, { stm, uni: sonucUni })

			// asıl union oluşturma işlemi
			det.raporQueryDuzenle(_e)

			stm = _e.stm ?? {}; sonucUni = stm.sent
			let {with: _with = {}, sent = {}} = stm
			if (!(_with.liste?.length || sent.liste?.length)) {
				id2Promise[id] = null
				continue
			}
			if (yatayDBmi || ekDBListe?.length) {
				let orjUni = sonucUni, alias = 'yatay';
				{
					sonucUni = _e.uni = stm.sent = new MQUnionAll()
					let uni = orjUni.deepCopy()
					if (yatayDBmi) {
						let clause = aktifDB.sqlServerDegeri()
						for (let {sahalar} of uni) { sahalar.add(`${clause} ${alias}`) }
					}
					sonucUni.addAll(uni)
				}
				for (let db of ekDBListe ?? []) {
					let clause = db.sqlServerDegeri()
					let uni = orjUni.deepCopy()
					for (let {from, sahalar} of uni) {
						for (let aMQAliasliYapi of from) {
							let {deger: table} = aMQAliasliYapi;
							if (!table || table.includes('.')) { continue }
							table = aMQAliasliYapi.deger = `${db}..${table}`
						}
						if (yatayAnalizVarmi && yatayAnaliz.dbmi) { sahalar.add(`${clause} ${alias}`) }
					}
					sonucUni.addAll(uni)
				}
			}
			if (!detayli)
				stm = stm.asToplamStm()
			_e.stm =  stm
			let promise_recs = app.sqlExecSelect(stm)
			if (promise_recs != null)
				id2Promise[id] = promise_recs
		}
		let yatayDegerler;     /* ekDBListe içinden (aktifDB) değeri ayıklanmış olarak gelir */
		if (yatayDBmi) { yatayDegerler = [aktifDB, ...(ekDBListe ?? [])] }
		let recs
		for (let [id, promise] of Object.entries(id2Promise)) {
			let det = id2Detay[id]; if (!det) { continue }
			let _recs = await promise ?? []
			if (!(detayli || _recs?.length)) { continue }
			let yatay2Bedel = {}; if (yatayAnalizVarmi) {
				for (let {yatay, bedel} of _recs) {
					if (!yatayDBmi)
						yatayDegerSet[yatay] = true
					if (!detayli)
						yatay2Bedel[yatay] = (yatay2Bedel[yatay] || 0) + bedel
				}
			}
			if (detayli) {
				if (recs) { recs.push(..._recs) }
				else { recs = _recs }                          /* large data performance optimization */
				continue
			}
			let {aciklama} = det, topBedel = topla(rec => rec[sahaAlias] || 0, _recs)
			let rec = { id, aciklama, bedel: topBedel }
			if (yatayAnalizVarmi) {
				for (let [yatay, bedel] of Object.entries(yatay2Bedel))
					rec[`bedel_${yatay}`] = bedel
			}
			if (!recs) { recs = [] }
			recs.push(rec)
		}
		if (yatayAnalizVarmi && !yatayDBmi && !empty(yatayDegerSet))
			yatayDegerler = Object.keys(yatayDegerSet).sort()
		yatayDegerSet = e.yatayDegerSet = yatayDegerler ? asSet(yatayDegerler) : {}
		return recs
		/* return [ { aciklama: 'SONUÇ', detaylar: recs } ] */
	}
	async loadServerData_recsDuzenle_seviyelendir({ detayli, recs: sqlRecs, id2Detay, yatayDegerSet }) {
		if (detayli)
			return sqlRecs
		await super.loadServerData_recsDuzenle_seviyelendir(...arguments)
		let {tabloYapi, raporTanim = {}} = this, {yatayAnalizVarmi, yatayAnaliz} = raporTanim
		let attrListe = Object.values(tabloYapi.toplam).map(item => item.colDefs.map(_ => _.belirtec)).flat()
		if (yatayAnalizVarmi && !empty(yatayDegerSet)) {
			let topBelirtecListe = attrListe
			attrListe = []; for (let belirtec of topBelirtecListe) {
				attrListe.push(belirtec)
				attrListe.push(...Object.keys(yatayDegerSet).map(yatay => `${belirtec}_${yatay}`))
			}
		}
		let id2GridRec = {}; for (let [id, det] of Object.entries(id2Detay)) {
			let gridRec = id2GridRec[id] = {
				...det.asObject, detaylar: [], hesaplandimi: false,
				...Object.fromEntries(attrListe.map(attr => [attr, 0])),
				toplamReset() {
					for (let attr of attrListe) { this[attr] = 0 }
					return this
				},
				toplamaEkle(digerGridRec) {
					let {tersIslemmi} = digerGridRec
					for (let attr of attrListe) {
						let value = digerGridRec[attr]
						this[attr] += value
						// if (tersIslemmi) { this[attr] -= value }
						// else { this[attr] += value }
					}
					return this
				},
				toplamOlustur() {
					let {detaylar} = this
					if (detaylar.length) {
						this.toplamReset()
						for (let det of detaylar) {
							det.toplamOlustur(); this.toplamaEkle(det)
							if (det.tersIslemmi && (det.satirlarToplamimi || det.altSeviyeToplamimi))
								det.negated()
						}
					}
					return this
				},
				negated() {
					for (let attr of attrListe)
						this[attr] = -this[attr]
					return this
				}
			}
		}
		for (let rec of sqlRecs) {
			let {id} = rec, gridRec = id2GridRec[id]
			for (let attr of attrListe)
				gridRec[attr] = rec[attr] ?? 0
			gridRec.hesaplandimi = true
		}
		let maxSevNo = 1, sev2Ust = {}, gridRecs = Object.values(id2GridRec)
		for (let gridRec of gridRecs) {
			let {seviyeNo: sevNo, detaylar} = gridRec
			sevNo = asInteger(sevNo?.char ?? sevNo) || 1
			maxSevNo = Math.max(sevNo, maxSevNo)
			let ustSevNo = sevNo - 1; sev2Ust[sevNo] = gridRec
			if (ustSevNo > 0) {
				let ustGridRec = sev2Ust[ustSevNo], {detaylar: ustDetaylar} = ustGridRec;
				// for (let attr of attrListe) { ustGridRec[attr] += gridRec[attr] }
				ustDetaylar.push(gridRec)
			}
		}
		let sevRecs = gridRecs.filter(rec => asInteger(rec?.seviyeNo?.char ?? rec?.seviyeNo) <= 1);
		for (let sev of sevRecs) {
			let {hesapTipi, satirListe, hesaplandimi} = sev; if (hesaplandimi) { continue }
			if (hesapTipi?.altSeviyeToplamimi)
				sev.toplamOlustur()
			else if (hesapTipi?.satirlarToplamimi && satirListe?.length) {
				sev.toplamReset()
				for (let i of satirListe)
					sev.toplamaEkle(gridRecs[i])
			}
			hesaplandimi = sev.hesaplandimi = true
		}
		return sevRecs
	}
	raporTanimIstendi(e) {
		let {rapor, raporTanim} = this, {raporTanimSinif} = this.class;
		raporTanimSinif.listeEkraniAc({
			args: { rapor },
			converter: ({ rec }) =>
				raporTanimSinif.oku({ id: rec.id }),
			veriYuklenince: ({ gridPart }) => {
				let {boundRecs: recs, gridWidget} = gridPart
				let ind = recs.findIndex(({ id }) => id == raporTanim?.id)
				if (ind > -1) { gridWidget.selectrow(ind) }
			},
			secince: _e => this.raporTanimSecildi({ ...e, ..._e })
		});
		this._tabloTanimGosterildiFlag = true
	}
	async raporTanimSecildi(e) {
		let {rec, value} = e, rapor = e.rapor = this.rapor
		let inst = this.raporTanim = await value
		inst?.setDefault?.(e)
		this.tazele(e)
	}
	async hareketKartiGoster({ id } = {}) {
		let e = arguments[0], {gridPart: { grid }} = this
		let rapor = this, {raporTanim, raporTanim: { detaylar }} = this
		try {
			id = id || grid.jqxTreeGrid('getSelection')?.[0]?.id
			let det = id ? detaylar.find(det => det.id == id) : null
			if (!det)
				return
			let {part} = await det?.hareketKartiGoster({ ...e, raporTanim, rapor }) ?? {}
			part?.kapaninca?.(() => this.tazele(e))
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Hareket Kartı'); throw ex }
	}
}
