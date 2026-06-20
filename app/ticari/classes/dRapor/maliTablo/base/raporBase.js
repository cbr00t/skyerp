class SBRapor extends DGrupluPanelRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 3 } static get aciklama() { return 'Mali Tablolar' }
	static get kategoriKod() { return 'SB' } static get kategoriAdi() { return 'Mali Tablolar' }
	static get chartVarmi() { return false } static get ozetVarmi() { return false }
	static get araSeviyemi() { return this == SBRapor } get uygunmu() { return this.class.uygunmu }
	static get uygunmu() { return app.params?.dRapor?.maliTablo }

	islemTuslariArgsDuzenle({ liste }) {
		super.islemTuslariArgsDuzenle(...arguments)
		liste.push(...[
			{
				id: 'izle', text: '', handler: _e =>
					setTimeout(() => this.main.hareketKartiGoster({ ...e, ..._e, id: undefined }), 50)
			}
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
			let { args: { row: { id } = {} } = {} } = _e
			this.hareketKartiGoster({ ..._e, ...e, id })
		})
		return result
	}
	tabloYapiDuzenle({ result }) {
		result.addToplamBasit_bedel('BEDEL', 'Bedel', this.sahaAlias)
	}
	tabloYapiDuzenle_son({ result }) { }
	secimlerDuzenle({ secimler }) {
		super.secimlerDuzenle(...arguments)
		this.class.maliTablo_basSecimlerDuzenle(...arguments)
		let {session} = config, {dbName: buDBName} = session, {konsolideCikti, ekDBListe} = app.params?.dRapor ?? {}
		if (konsolideCikti) {
			let tumDBNameSet = asSet([ buDBName, ...(ekDBListe ?? []) ])
			let grupKod = 'donemVeTarih'; secimler.grupEkle(grupKod, 'Veritabanı')
			let sec = new SecimBirKismi({ etiket: 'Veritabanı', grupKod }).birKismi().autoBind();
			app.wsDBListe()
				.then(arr => arr.filter(x => tumDBNameSet[x]).map(x => new CKodVeAdi([x, x])))
				.then(kaListe => sec.tekSecim = new TekSecim({ kaListe }));
			secimler.secimTopluEkle({ db: sec })
		}
	}
	static maliTablo_basSecimlerDuzenle({ secimler }) {
		let {takipNo} = app.params.ticariGenel.kullanim
		if (takipNo)
			secimler.addKA('takip', DMQTakipNo).addKA('takipGrup', DMQTakipGrup)
		secimler.addKA('sube', DMQSube).addKA('subeGrup', DMQSubeGrup)
		let harSiniflar = SBTabloHesapTipi.kaListe.map( ({ ekBilgi }) => ekBilgi?.harSinif ).filter(x => x)
		for (let harSinif of harSiniflar)
			harSinif.maliTablo_secimlerEkDuzenle(...arguments)
	}
	async tazele(e) {
		clearTimeout(this._timer_progress)
		await this.tazeleOncesi(e)
		let {gridPart, gridPart: { grid, gridWidget }, rapor: { isPanelItem }, raporTanim, _tabloTanimGosterildiFlag} = this
		if (!raporTanim) {
			if (!isPanelItem) {
				if (_tabloTanimGosterildiFlag) { hConfirm('<b>Rapor Tanımı</b> seçilmelidir') }
				else { this.raporTanimIstendi(e) }
			}
			return
		}
		let _e = CObject.From(e)
		if (!isPanelItem)
			this._timer_progress = setTimeout(() => showProgress(), 1_000)
		try {
			await super.tazele(_e)    /* super.tazele() ==> this.loadServerData() işlemini çağıracak */
			extend(_e, { liste: _e.tabloKolonlari ?? _e.kolonTanimlari ?? [], recs: gridWidget.getRows() })
			Object.defineProperty(_e, 'flatRecs', {
				get: function() {
					return this.recs.flatMap(rec =>
						[rec, ...(rec.detaylar ?? [])])
				}
			})
			for (let key of ['tabloKolonlari', 'kolonTanimlari']) { delete _e[key] }
			this.tabloKolonlariDuzenle(_e)
			this.tabloKolonlariDuzenle_ozel?.(_e)
			let colDefs = this.tabloKolonlari = _e.liste || []
			let columns = colDefs.flatMap(colDef => colDef.jqxColumns)
			let lastError
			for (let i = 1; i <= 3; i++) {
				try {
					grid.jqxTreeGrid('columns', columns)
					lastError = null
					break
				}
				catch (ex) { await delay(i * 200); lastError = ex }
				return
			}
			if (lastError)
				console.error(lastError)
			await this.tazeleSonrasi(e)
		}
		finally {
			clearTimeout(this._timer_progress)
			this._timer_progress = setTimeout(() => hideProgress(), 50)
		}
	}
	ekCSSDuzenle({ raporTanim, colDefs, colDef, rowIndex, belirtec, value, rec: { cssClassesStr } = {}, result }) {
		if (cssClassesStr)
			result.push(cssClassesStr)
	}
	cellsRenderer({ raporTanim, colDefs, colDef, rowIndex, belirtec, value, html, jqxCol, rec: { cssStyle } = {} }) {
		return cssStyle ? `<span style="${cssStyle}">${getTagContent(html)}</span>` : html
	}
	tabloKolonlariDuzenle({ liste: colDefs, recs, flatRecs, yatayDegerSet }) {
		super.tabloKolonlariDuzenle(...arguments)
		yatayDegerSet ??= this.yatayDegerSet ?? {}
		let { tabloYapi, raporTanim } = this
		let { yatayAnalizVarmi, yatayAnaliz } = raporTanim
		let cellClassName = (colDef, rowIndex, belirtec, value, rec) => {
			let result = ['treeRow', belirtec]
			if (rec)
				result.push(rec.leaf ? 'leaf' : 'grup')
			
			let toplammi = isNumber(value)
			result.push(toplammi ? 'toplam' : 'icerik')
			if (toplammi) {
				let alacakmi = value < 0
				result.push(!value ? 'zero' : alacakmi ? 'negative' : 'positive')
			}
			
			let { level } = rec
			if (level != null)
				result.push('level-' + level.toString())
			
			if (toplammi && yatayAnalizVarmi) {
				let {userData: { yatayToplammi } = {}} = colDef
				if (yatayToplammi) { result.push('yatayToplam') }
			}
			
			let _e = { raporTanim, colDefs, colDef, rowIndex, belirtec, value, rec, result }
			this.ekCSSDuzenle(_e)
			result = _e.result
			return result.filter(Boolean).join(' ')
		}
		let cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
			let { tip } = colDef
			html = tip?.cellsRenderer?.(colDef, rowIndex, belirtec, value, html, jqxCol, rec) ?? html
			let _e = { ...arguments[0], raporTanim, colDefs, colDef, rowIndex, belirtec, value, html, jqxCol, rec }
			let result = this.cellsRenderer(_e)
			result ??= _e.html
			return result ?? html
		}
		colDefs.push(
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 50 }),
			...values(tabloYapi.grup).map(e => e.colDefs).flat()
		);
		for (let {colDefs: [orjColDef]} of values(tabloYapi.toplam)) {
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
			extend(colDef, { cellClassName, cellsRenderer })
	}
	async loadServerData(e) {
		let {session: { dbName: aktifDB } = {}} = config
		let {dRapor: { konsolideCikti, ekDBListe} = {}} = app.params
		ekDBListe = konsolideCikti && aktifDB && ekDBListe?.length
				? ekDBListe.filter(x => x != aktifDB) : null
		extend(e, { konsolideCikti, ekDBListe, aktifDB })
		let sevRecs = await this.loadServerDataDevam(e)
		return sevRecs
	}
	async loadServerDataDevam(e) {
		let sevRecs = await super.loadServerData(e)
		if (!sevRecs)
			return sevRecs
		
		/*let { id2Detay, recs, ind2Rec } = e
		let { tabloYapi: { toplam } } = this
		let attrListe = values(toplam).map(item => item.colDefs[0].belirtec)
		let seq = 1
		for (let parentRec of sevRecs) {
			for (let formulDetaylar of values(formulYapilari))
			for (let formul of formulDetaylar)
			for (let attr of attrListe) {
				let value = await formul.eval({ ...e, det: formul, recs, sevRecs, parentRec, attr, seq, ind2Rec })
				if (!empty(value))
					parentRec[attr] = value
			}
			seq++
		}*/
		
		return sevRecs
	}
	async loadServerDataInternal(e) {
		await super.loadServerDataInternal(e)
		let rapor = this
		let { detayli, konsolideCikti, ekDBListe, aktifDB, detaylar, detay: _det } = e
		let { raporTanim = {}, secimler, sahaAlias: bedelAlias } = this
		let { raporTanim: { yatayAnalizVarmi, yatayAnaliz } = {} } = this
		let yatayDBmi = yatayAnalizVarmi && yatayAnaliz.dbmi
		let { tarihBS: donemBS, db: { value: filtreDBListe = [] } = {} } = secimler
		detaylar ??= _det ? [_det] : raporTanim.detaylar
		
		let id2Promise = {}
		let id2Detay = e.id2Detay = {}
		// let formulYapilari = e.formulYapilari = {}
		
		let filtreDBSet = null
		if (konsolideCikti && filtreDBListe?.length) {
			let tumDBNameSet = asSet([ aktifDB, ...(ekDBListe ?? []) ])
			filtreDBSet = asSet(filtreDBListe.filter(_ => tumDBNameSet[_]))
		}
		let _e = { ...e, rapor, raporTanim, secimler, donemBS, detaylar, yatayAnalizVarmi, yatayAnaliz, filtreDBListe }
		//for (let key of ['altSeviyeToplamimi', 'satirlarToplamimi'])
		//	formulYapilari[key] = []
		
		for (let det of detaylar) {
			let { sayac: id, hesapTipi = {}, veriTipi, veriTipi: { donemTipi } } = det
			let { question: selector, formulGibimi, ekBilgi: { ticarimi, hareketcimi, querymi } = {} } = hesapTipi
			id2Detay[id] = det
			if (!(querymi || formulGibimi)) {    // satır toplam, formul, ... vs
				//if (selector)
				//	formulYapilari[selector]?.push(det)
				continue
			}
			
			if (donemTipi == 'B' && !donemBS?.basi)
				continue

			let sonucUni = new MQUnionAll()
			let stm = new MQStm({ sent: sonucUni })
			extend(_e, { stm, uni: sonucUni })

			// asıl union oluşturma işlemi
			det.raporQueryDuzenle(_e)

			stm = _e.stm ?? {}
			sonucUni = stm.sent
			let { with: _with = {}, sent = {} } = stm
			if (!(_with.liste?.length || sent.liste?.length)) {
				id2Promise[id] = null
				continue
			}
			
			if (konsolideCikti) {
				let orjUni = sonucUni
				let yatayAlias = yatayDBmi ? 'yatay' : null
				sonucUni = _e.uni = stm.sent = new MQUnionAll()
				if (!filtreDBSet || filtreDBSet[aktifDB]) {
					let yatayDBmi = yatayAnalizVarmi && yatayAnaliz.dbmi
					let uni = orjUni.deepCopy()
					for (let {sahalar} of uni) {
						if (detayli)
							sahalar.add(`'${aktifDB}' _db`)
						if (yatayAlias)
							sahalar.add(`'${aktifDB}' ${yatayAlias}`)
						if (detayli && yatayAlias != 'db')
							sahalar.add(`'<b class=forestgreen>[ ${aktifDB} ]</b>' db`)
					}
					sonucUni.addAll(uni)
				}
				for (let db of ekDBListe ?? []) {
					if (filtreDBSet && !filtreDBSet[db])
						continue
					let uni = orjUni.deepCopy()
					for (let { from, sahalar } of uni) {
						for (let aMQAliasliYapi of from) {
							let { deger: table } = aMQAliasliYapi
							if (table && !table.includes('.'))
								table = aMQAliasliYapi.deger = `${db}..${table}`
						}
						if (detayli)
							sahalar.add(`'${db}' _db`)
						if (yatayAlias)
							sahalar.add(`'${db}' ${yatayAlias}`)
						if (detayli && yatayAlias != 'db')
							sahalar.add(`'<span class=royalblue>${db}</span>' db`)
					}
					sonucUni.addAll(uni)
				}
			}
			
			if (!detayli)
				stm = stm.asToplamStm()
			_e.stm =  stm
			
			let promise_recs = stm.execSelect()
			if (promise_recs != null)
				id2Promise[id] = promise_recs
		}
		
		let recs, seq = 0
		let yatayDegerSet = {}
		for (let [id, det] of entries(id2Detay)) {
			seq++
			let { hesapTipi, veriTipi, satirListe, tersIslemmi, shIade = {} } = det
			let { formulGibimi, satirlarToplamimi, altSeviyeToplamimi, formulmu } = hesapTipi ?? {}
			let { donemTipi, ekBilgi: vEkBilgi } = veriTipi ?? {}
			let tersmi = tersIslemmi != shIade.iademi
			
			let _recs = await id2Promise[id] ?? []
			if (empty(_recs))
				continue
			
			let args = { ..._e, recs: recs ?? [], detay: det, seq, id, hesapTipi, veriTipi, donemTipi }
			/*let _recs = args.buRecs = makeArray(
				formulGibimi
					? await det.eval(args)
					: await id2Promise[id]
			)?.map(r =>
				isObject(r) ? r : ({ bedel: r }))*/
			
			if (!formulGibimi) {                                   // recsDuzenle  olabilen normal satır
				let evalRecs = _recs
				/*if (_recs[0].yatay) {
					let bedel = topla(r => r[bedelAlias] || 0, _recs)
					evalRecs = [
						{ bedel },                                 // topBedel satırı
						..._recs                                   // yatay bedel satırları
					]
				}*/
				
				_recs = []
				for (let buRecs of evalRecs) {
					buRecs = makeArray(buRecs)
					args.buRecs = buRecs                           // formül hesabında bu diziyi kullan
					let tempRecs = await det.eval(args)
					if (tempRecs == null) {
						_recs.push(...buRecs)
						continue
					}
					
					if (empty(tempRecs?.filter(r => r[bedelAlias])))
						continue
					
					tempRecs = tempRecs.map(r => ({
						...buRecs[0],
						...r,
						hesaplandimi: true
					}))
					_recs.push(...tempRecs)
				}
				
				if (tersmi) {
					;_recs.forEach(r => {
						let v = r[bedelAlias]
						if (v)
							r[bedelAlias] = -v
					})
				}

				args.buRecs = _recs                                // formul sonucu düzenlenmiş buRecs
				if (empty(_recs))
					continue
			}
			
			if (detayli) {
				if (recs)
					recs.push(..._recs)
				else
					recs = _recs
				continue
			}
			
			let { aciklama } = det
			let topBedel = topla(r => r[bedelAlias] || 0, ..._recs)

			let { hesaplandimi } = _recs[0] ?? {}
			let rec = { id, aciklama, bedel: topBedel, hesaplandimi  }    // asıl rec
			if (yatayAnalizVarmi && !empty(_recs)) {
				let _yatay2Bedel = {}
				_recs.forEach(r => {
					let { yatay, [bedelAlias]: bedel } = r
					if (yatay) {
						yatayDegerSet[yatay] = true
						_yatay2Bedel[yatay] = roundToBedelFra(_yatay2Bedel[yatay] || 0 + bedel)
					}
				})
				extend(rec, {
					...fromEntries(
						entries(_yatay2Bedel).map( ([y, b]) =>
							[`${bedelAlias}_${y}`, b])
					)
				})
				delete rec.yatay
			}
			;( recs ??= [] )
				.push(rec)
		}

		let yatayDegerler = yatayDegerSet ? keys(yatayDegerSet) : null
		;[e, this].forEach(t =>
			extend(t, { yatayDegerler, yatayDegerSet }))
		
		return recs
		/* return [ { aciklama: 'SONUÇ', detaylar: recs } ] */
	}
	loadServerData_recsDuzenleIlk(e) {
		/* do nothing */
	}
	async loadServerData_recsDuzenle_seviyelendir(e = {}) {
		let { detayli, recs: flatRecs } = e
		if (detayli)
			return flatRecs

		let { tabloYapi, raporTanim = {} } = this
		let { id2Detay, yatayDegerSet, bedelAlias = 'bedel', yatayAlias } = e
		let { konsolideCikti, aktifDB, ekDBListe } = e
		let { yatayAnalizVarmi, yatayAnaliz } = raporTanim
		let yatayDBmi = yatayAnalizVarmi && yatayAnaliz.dbmi
		
		await super.loadServerData_recsDuzenle_seviyelendir(...arguments)
		let attrListe = values(tabloYapi.toplam)
			.map(_ => _.colDefs.map(_ => _.belirtec))
			.flat()
		if (yatayAnalizVarmi)
			attrListe.push(...keys(yatayDegerSet).map(k => `${bedelAlias}_${k}`))
		
		let id2GridRec = {}
		for (let [id, det] of entries(id2Detay)) {
			let { hesapTipi: { formulGibimi } = {} } = det
			//let hesaplandimi = !formulGibimi
			let gridRec = id2GridRec[id] = {
				...det.asObject,
				detaylar: [],
				hesaplandimi: false,
				...fromEntries(attrListe.map(attr => [attr, 0])),
				toplamReset() {
					for (let attr of attrListe)
						this[attr] = 0
					return this
				},
				toplamaEkle(digerGridRec) {
					digerGridRec ??= {}
					for (let attr of attrListe) {
						let value = digerGridRec[attr]
						this[attr] += value
					}
					return this
				},
				toplamOlustur() {
					let { detaylar } = this
					if (!empty(detaylar)) {
						this.toplamReset()
						for (let det of detaylar) {
							det.toplamOlustur()
							this.toplamaEkle(det)
						}
					}
					return this
				}
			}
			
			let { hesapTipi: { ekBilgi: { hareketcimi, harSinif } = {} } = {} } = det
			if (hareketcimi && harSinif) {
				let handlerCode = 'app.activeWndPart.inst.main.hareketKartiGoster()';
				gridRec.aciklama += `<button id="izle" class="float-right" style="width: 30px; height: 22px; margin-right: 5px" onclick="${handlerCode}"></button>`
			}
		}
		
		for (let rec of flatRecs) {
			let { id, hesaplandimi } = rec
			let gridRec = id2GridRec[id]
			if (!gridRec)
				continue

			gridRec.hesaplandimi = hesaplandimi ?? false
			for (let attr of attrListe)
				gridRec[attr] = rec[attr] ?? 0
		}
		
		let maxSevNo = 1, sev2Ust = {}
		let gridRecs = values(id2GridRec)
		for (let gridRec of gridRecs) {
			let { seviyeNo: sevNo, detaylar } = gridRec
			sevNo = asInteger(sevNo?.char ?? sevNo) || 1
			maxSevNo = max(sevNo, maxSevNo)
			let ustSevNo = sevNo - 1
			sev2Ust[sevNo] = gridRec
			if (ustSevNo > 0) {
				let ustGridRec = sev2Ust[ustSevNo] ?? {}
				let { detaylar: ustDetaylar } = ustGridRec
				// for (let attr of attrListe) { ustGridRec[attr] += gridRec[attr] }
				ustDetaylar?.push(gridRec)
			}
		}

		;{
			let iterMax = 10
			let done = false
			let args = { ...e }
			for (let i = 1; i <= iterMax; i++) {
				let evalRecs = gridRecs.filter(r => !r.hesaplandimi)
				if (empty(evalRecs)) {
					done = true
					break
				}

				for (let r of evalRecs) {
					let { id, seq, seviyeNo: sevNo, detaylar, tersIslemmi } = r
					let { shIade, satirListe, hesapTipi = {}, veriTipi = {} } = r
					let { ekBilgi: hEkBilgi } = hesapTipi
					let { donemTipi, ekBilgi: vEkBilgi } = veriTipi
					let tersmi = tersIslemmi != shIade.iademi
					let buRecs = makeArray(r)
					let recs = gridRecs

					let buBedelAliaslar = [bedelAlias]
					if (yatayAnalizVarmi) {
						buBedelAliaslar = keys(yatayDegerSet)
							.map(k => `${bedelAlias}_${k}`)
					}

					let abort = false
					for (let buBedelAlias of buBedelAliaslar) {
						let d = isPlainObject(r) ? id2Detay[id] : r
						extend(args, {
							id, seq, i, iterMax, detay: d, det: d,
							hesapTipi, veriTipi, donemTipi,
							tersmi, satirListe, hEkBilgi, vEkBilgi,
							recs, buRecs, bedelAlias: buBedelAlias,
							calcFailed: false
						})
						
						let res = makeArray(await d.eval(args))
						let { calcFailed } = args
						if (calcFailed) {
							abort = true
							break
						}
						
						if (empty(res)) {                                  // formul yok veya return yok veya null döndü (0 hariç)
							r.hesaplandimi = true
							continue
						}
						
						let v = topla(r => r[buBedelAlias], ...res)        // [ { bedel: 1234 } ] | [ { bedel: null } ] | null | [ { bedel: 10 }, { bedel: 20 } ]
						if (v && tersmi)
							v = -v
						
						r[buBedelAlias] = v
					}
					
					if (abort) {
						r.hesaplandimi = false
						continue
					}

					if (yatayAnalizVarmi && !empty(buBedelAliaslar))
						r[bedelAlias] = topla(k => r[k] || 0, ...buBedelAliaslar)
					r.hesaplandimi = true
				}
			}
			if (!done) {
				gridRecs
					.filter(r => !r.hesaplandimi)
					.forEach(r => {
						let { aciklama, cssClassesStr: css } = r
						css ||= []
						if (isString(css))
							css = css.split(' ')
						css.push('bold', 'fs-120', 'bg-red', 'whitesmoke')

						r.aciklama = `⚠️ ${aciklama}`
						r.cssClassesStr = css.join(' ')
					})
				setTimeout(() =>
					wConfirm(`Bazı formüllerde sorun var, hesap değerleri hatalı olabilir`, 'Formül Hesabı'),
					100)
			}
		}

		// ........................

		
		let sevRecs = gridRecs.filter(r =>
			asInteger(r?.seviyeNo?.char ?? r?.seviyeNo) <= 1)
		if (empty(sevRecs) && !empty(gridRecs))
			throw { isError: true, errorText: '1. Seviye olan kayıt bulunamadı, Rapor Tanımını kontrol ediniz' }

		let yatayDegerler, yatay2Bedel = {}
		if (yatayDBmi) {
			yatayDegerler = [aktifDB, ...(ekDBListe ?? [])]    // ekDBListe içinden (aktifDB) değeri ayıklanmış olarak gelir
			yatayDegerSet = asSet(yatayDegerler)
		}
		if (!yatayDBmi && !empty(yatayDegerSet))
			yatayDegerler = keys(yatayDegerSet).sort()

		;[e, this].forEach(t =>
			extend(t, { yatayDegerler, yatayDegerSet, yatay2Bedel }))
		
		return sevRecs
	}
	loadServerData_recsDuzenleSon(e) {
		let { recs } = e, { gridPart: { filtreTokens } } = this
		if (filtreTokens?.length) {
			let _recs = this.loadServerData_recsDuzenle_hizliBulIslemi(e)
			recs = _recs == null ? e.recs : _recs
		}
		
		return recs
	}
	raporTanimIstendi(e) {
		let {rapor, raporTanim} = this, {raporTanimSinif} = this.class
		raporTanimSinif.listeEkraniAc({
			args: { rapor },
			converter: ({ rec }) =>
				raporTanimSinif.oku({ id: rec.id }),
			veriYuklenince: ({ gridPart }) => {
				let {boundRecs: recs, gridWidget} = gridPart
				let ind = recs.findIndex(({ id }) => id == raporTanim?.id)
				if (ind > -1) { gridWidget.selectrow(ind) }
			},
			secince: _e => 
				setTimeout(() => this.raporTanimSecildi({ ...e, ..._e }), 1)
		});
		this._tabloTanimGosterildiFlag = true
	}
	async raporTanimSecildi(e) {
		let {rec, value, tamamIslemi} = e
		let rapor = e.rapor = this.rapor
		let inst = this.raporTanim = await value
		inst?.setDefault?.(e)
		await this.tazele()
		await tamamIslemi?.call(this, e)
	}
	async hareketKartiGoster({ id } = {}) {
		let e = arguments[0]
		let rapor = this
		let { raporTanim, raporTanim: { detaylar } } = this
		let { gridPart: { grid } } = this
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
