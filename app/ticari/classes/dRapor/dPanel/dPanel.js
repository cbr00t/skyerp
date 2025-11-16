class DPanel extends Part {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isWindowPart() { return true } static get asyncRunFlag() { return true }
	static get partName() { return 'dPanel' } get partName() { return this.class.partName }
	static get oncelik() { return 2 } static get anaTip() { return 'panel' }
	static get kategoriKod() { return null } static get araSeviyemi() { return false }
	static get kod() { return this.anaTip } static get aciklama() { return 'Panel Rapor' }
	static get uygunmu() { return true } get uygunmu() { return this.class.uygunmu }
	static get dPanelmi() { return true } get dPanelmi() { return this.class.dPanelmi }
	// static get slowAnimationFlag() { return true }
	get detay() {
		let {items} = this
		let subItem = items.find('.item:where(.hasFocus)').last()
		if (!subItem?.length)
			return null
		let detay = (
			subItem.data('detay') ??
				subItem.parents('.item').data('detay') ??
				subItem.parents('#items').parent().data('detay')
		)
		if (!detay)
			return null
		return detay
	}
	get _inst() {
		let {items} = this
		let subItem = items.find('.item:where(.hasFocus)'); if (!subItem?.length) { return null }
		let inst = subItem.parents('#items').parent().data('inst')
		if (inst == null) { inst = subItem.parents('.item').data('inst') }
		return inst ?? this.detay?.inst
	}
	static get raporBilgiler() {
		return values(this.kod2Sinif)
			.filter(({ uygunmu, araSeviyemi, dPanelmi, kod }) => uygunmu && !araSeviyemi && dPanelmi && kod)
			.map(cls => ({ kod: cls.kod, aciklama: cls.aciklama, vioAdim: cls.vioAdim, cls }))
	}
	static get kod2Sinif() {
		let {_kod2Sinif: result} = this
		if (result == null) {
			let {subClasses} = this; result = {}
			for (let cls of [this, ...subClasses]) {
				let {araSeviyemi, uygunmu, kod} = cls
				if (!araSeviyemi && uygunmu && kod)
					result[kod] = cls
			}
			this._kod2Sinif = result
		}
		return result
   }

	constructor({ id2Detay, secimler } = {}) {
		let e = arguments[0]; super(e)
		let {raporTanim, class: { aciklama }} = this
		raporTanim ??= this.raporTanim = new DPanelTanim().noId()
		raporTanim._promise = raporTanim.getDefault(e)
			.then(inst => raporTanim = this.raporTanim = inst)
		if (!secimler) {
			let _e = { ...e }
			this.secimlerDuzenle(_e)
			secimler = _e.secimler
		}
		let {title = `<b class="royalblue">${aciklama}</b>`} = this
		$.extend(this, { title, raporTanim, id2Detay, secimler })
	}
	static getClass(e) {
		let kod = typeof e == 'object' ? (e.kod ?? e.tip) : e
		return this.kod2Sinif[kod]
	}
	async runDevam(e = {}) {
		await super.runDevam(e)
		await this.raporTanim?._promise
		let {layout, raporTanim} = this
		let rfb = e.rfb = new RootFormBuilder()
		rfb.setLayout(layout).setPart(this).setInst(this)
		this.rootFormBuilderDuzenle(e)
		let inst = this, part = this, {rfb: builder} = e
		$.extend(this, { builder }); builder.run(e)
		// makeScrollable(this.items)
		return { inst, part, builder }
	}
	async afterRun(e = {}) {
		await super.afterRun(e); let {raporTanim: { _promise } = {}} = this
		let block = result => this.panelleriOlustur_batch({ ...e, result })
		if (_promise) { _promise.then(block) }
		else { block() }
	}
	destroyPart(e) {
		this.otoTazele_stopTimer()
		let children = this.items?.children()
		if (children?.length) {
			for (let i = 0; i < children.length; i++) {
				let item = children.eq(i), part = item.data('builder')
				part?.destroyPart(); item.remove()
			}
		}
		return super.destroyPart(e)
	}
	static async goster(e) {
		let inst = new this(e), result = await inst.goster()
		return result ?? null
	}
	async goster(e = {}) {
		let inst = this, {partName, title, class: { aciklama, anaTip }} = this
		return await this.run(e)
	}
	async ilkIslemler(e) {
		let {id2Detay} = this
		for (let rapor of values(id2Detay))
			await rapor.ilkIslemler?.(e)
	}
	async ilkIslemler_ek(e) {
		let {id2Detay} = this
		for (let rapor of values(id2Detay))
			await rapor.ilkIslemler_ek?.(e)
		this.ilkIslemler_ozel?.(e)
	}
	async sonIslemler(e) {
		let {id2Detay} = this
		for (let rapor of values(id2Detay))
			await rapor.sonIslemler?.(e)
	}
	async sonIslemler_ek(e) {
		let {id2Detay} = this
		for (let rapor of values(id2Detay))
			await rapor.sonIslemler_ek?.(e)
		this.sonIslemler_ozel?.(e)
	}
	secimlerDuzenle(e) {
		let secimler = e.secimler = new DonemselSecimler()
		/*{
			let grupKod = 'donemVeTarih'
			secimler.secimTopluEkle({
				_otoTazele: new SecimTekilNumber({ etiket: 'Oto Tazele (dk)' })
			})
		}*/
	}
	rootFormBuilderDuzenle({ rfb }) {
		let e = arguments[0]
		let fbd_islemTuslari = rfb.addIslemTuslari('islemTuslari').addCSS('islemTuslari')
			.setTip('tazeleVazgec')
			.setButonlarDuzenleyici(e => this.islemTuslariArgsDuzenle(e))
			.setId2Handler(this.islemTuslariGetId2Handler(e))
			.onAfterRun(({ builder: fbd_islemTuslari, builder: { part: islemTuslariPart } }) =>
				$.extend(this, { fbd_islemTuslari, islemTuslariPart }))
		fbd_islemTuslari.addNumberInput('_otoTazeleDk', null, null, 'Tazele (dk)').etiketGosterim_yok().setAltInst(this)
			.setValue(this._otoTazeleDk || null)
			.degisince(e => {
				let {builder: { layout, input }, value} = e
				if (!value)
					input.val(null)
				layout[value ? 'addClass' : 'removeClass']('active')
				this.otoTazele_startTimer({ ...arguments[0], ...e })
			})
			.addStyle_wh(100)
			.addStyle(
				`$elementCSS { position: absolute !important; right: 230px !important; border-radius: 13px; z-index: 1001 !important }
				 $elementCSS.active { animation: 3000ms infinite anim-dPanel-otoTazele }
				 .dPanel.part.refreshing $elementCSS > input {
					background-color: lightcyan !important;
					background-image: url(../../images/loading.gif) !important;
					background-position: center center !important;
					background-size: 32px 32px !important;
					background-repeat: no-repeat !important
				 }
				 @keyframes anim-dPanel-otoTazele {
					   0% { box-shadow: 0 0 13px 3px forestgreen }
					  70% { box-shadow: 0 0 13px 8px forestgreen }
					 100% { box-shadow: 0 0 13px 3px forestgreen }
				 }`
			)
		let fbd_items = rfb.addFormWithParent('items').addCSS('items')
			.onAfterRun(({ builder: fbd_items, builder: { layout: items } }) => $.extend(this, { fbd_items, items }))
		rfb.addForm('bulForm')
			.setLayout(({ builder: { id }}) =>
				$(`<div class="${id} part"><input class="input full-wh" type="textbox" maxlength="100"></input></div>`))
			.onAfterRun(({ builder, builder: { layout } }) => {
				let bulPart = builder.part = new FiltreFormPart({
					layout, degisince: e => {
						let {tokens} = e
						this.hizliBulIslemi({ ...e, builder, bulPart, sender: this, layout, tokens }) }
				})
				bulPart.run()
			})
	}
	islemTuslariArgsDuzenle({ liste, part: { sagButonIdSet } }) {
		let e = arguments[0], {sabitmi} = this.class
		liste.push(...[
			(sabitmi ? null : { id: 'raporTanim', text: 'Rapor Tanım', handler: _e => this.raporTanimIstendi({ ...e, ..._e }) }),
			{ id: 'genelSecimler', text: '', handler: _e => this.genelSecimlerIstendi({ ...e, ..._e }) },
			{ id: 'secimler', text: '', handler: _e => this.secimlerIstendi({ ...e, ..._e }) },
			{ id: 'seviyeAc', text: 'Seviye Aç', handler: _e => this.seviyeAcIstendi({ ...e, ..._e }) },
			{ id: 'seviyeKapat', text: 'Seviye Kapat', handler: _e => this.seviyeKapatIstendi({ ...e, ..._e }) },
			{ id: 'excel', text: '', handler: _e => this.exportExcelIstendi({ ...e, ..._e }) },
			/*{ id: 'pdf', text: '', handler: _e => this.exportPDFIstendi({ ...e, ..._e }) },*/
			{ id: 'html', text: '', handler: _e => this.exportHTMLIstendi({ ...e, ..._e }) },
			{ id: 'yeni', text: '', handler: _e => this.yeniIstendi({ ...e, ..._e }) },
			{ id: 'degistir', text: '', handler: _e => this.degistirIstendi({ ...e, ..._e }) },
			{ id: 'yukle', text: '', handler: _e => this.yukleIstendi({ ...e, ..._e }) },
			{ id: 'kaydet', text: '', handler: _e => { this.kaydetIstendi({ ...e, ..._e }) } }
		].filter(x => !!x))
		if (sagButonIdSet)
			for (let key of ['yukle', 'kaydet']) { delete sagButonIdSet[key] }
	}
	islemTuslariGetId2Handler(e) {
		return ({
			tazele: e => this.tazele(e),
			vazgec: e => this.close(e)
		})
	}
	tazele(e) {
		let result = this.tazeleDogrudan(e)
		this.otoTazele_startTimer(e)
		return result
	}
	tazeleDogrudan(e) {
		let {layout, id2Detay, secimler: genelSecimler} = this
		this.tazeleOncesi(e)
		layout.addClass('refreshing')
		for (let {inst} of values(id2Detay))
			inst?.tazele(e)
		setTimeout(() => layout.removeClass('refreshing'), 2_000)
	}
	super_tazele(e) { super.tazele(e) }
	tazeleOncesi({ main: { secimler: secimlerListe } = {} } = {}) {
		let {id2Detay, secimler: genelSecimler} = this
		if (!secimlerListe) {
			secimlerListe = values(id2Detay)
				.map(({ inst: { main: { secimler } = {} } = {} }) => secimler)
				.filter(x => !!x)
		}
		if (secimlerListe)
			secimlerListe = $.makeArray(secimlerListe)
		if (genelSecimler) {
			for (let secimler of secimlerListe) {
				if (!secimler)
					continue
				for (let [k, v] of entries(genelSecimler.liste)) {
					if (k[0] == '_')
						continue
					let sec = secimler[k]
					if (!sec)
						continue
					$.extend(sec, v)
					sec.hidden()
				}
			}
		}
	}
	otoTazele_startTimer(e) {
		// let {_timer_otoTazele: timer, secimler: { _otoTazele: { value: otoTazeleDk } = {} } = {}} = this
		let {_timer_otoTazele: timer, _otoTazeleDk: otoTazeleDk} = this
		if (otoTazeleDk)
			otoTazeleDk = Math.max(otoTazeleDk, .05)
		if (!otoTazeleDk) {
			this.otoTazele_stopTimer(e)
			return null
		}
		/*if (timer)
			return timer*/
		this.otoTazele_stopTimer(e)
		return this._timer_otoTazele = setInterval(
			e => this.otoTazele_timerProc(e),
			otoTazeleDk * 60_000
		)
	}
	otoTazele_stopTimer(e) {
		let {_timer_otoTazele: timer} = this
		if (timer) {
			clearInterval(timer)
			delete this._timer_otoTazele
		}
		return timer
	}
	otoTazele_timerProc(e) {
		let {_otoTazeleDk: otoTazeleDk, _inTazeleProc} = this, {appActivatedFlag} = window
		if (!otoTazeleDk)
			otoTazeleDk = Math.max(otoTazeleDk, .05)
		if (!(otoTazeleDk && window.appActivatedFlag) || _inTazeleProc)
			return
		this._inTazeleProc = true
		this.tazeleDogrudan()
		setTimeout(() => this._inTazeleProc = false, 1_000)
	}
	add(...coll) {
		let {id2Detay, _rendered} = this, {kod2Sinif} = DRapor
		for (let det of coll) {
			if (det == null)
				continue
			if ($.isArray(det)) {
				this.add(...det)
				continue 
			}
			let {id, tip, inst, value, raporTip: { altRaporTip } = {}} = det
			if (!id)
				id = det.id = newGUID()
			if (tip.rapormu) {
				let {raporId} = det
				inst ??= value
				if (typeof inst == 'string')
					inst = kod2Sinif[inst] ?? window[inst]
				if (isClass(inst))
					inst = new inst()
				if (altRaporTip != null)
					inst?.setOzelID?.(altRaporTip)
				if (inst?.dRapormu && empty(inst?.ozelIDListe))
					inst?.ozelID_main?.()
				if (inst)
					det.inst = inst
			}
			$.extend(det, { id, panel: this })
			id2Detay[id] = det
		}
		if (_rendered)
			this.panelleriOlustur()
		return this
	}
	remove(...coll) {
		let {id2Detay, _rendered} = this
		for (let det of coll) {
			if (det == null) { continue }
			if ($.isArray(det)) { this.remove(...det); continue } 
			if (!id2Detay[det.id])
				det = values(id2Detay).find(_det => det.detay == _det || det.rapor?.detay == _det)
			if (det == null) { continue }
			delete id2Detay[det.id]
		}
		if (_rendered) { this.panelleriOlustur() }
	}
	clear() {
		this.id2Detay = {}
		if (this._rendered)
			this.panelleriOlustur()
		return this
	}
	async detaylariDuzenle(e) {
		await this.loadLayout(e)
		/*this.add(
			new DRapor_Hareketci_Cari().setWH('50%', '35%'),
			new SBRapor_Default().setWH('50%', '35%'),
			new DRapor_DonemselIslemler().setWH('100%', '65%')
		)*/
	}
	render(e) {
		this.id2Detay = this._rendered = null
		return this.panelleriOlustur_batch(e)
	}
	async loadLayout({ noTitleUpdate } = {}) {
		await this.raporTanim?._promise
		let {title, raporTanim: { class: raporSinif, aciklama: raporAdi, detaylar } = {}} = this
		if (detaylar?.length) {
			let raporAdiSet = asSet(
				detaylar.filter(det => det.tip?.rapormu && det.value && det.raporAdi)
						.map(det => det.raporAdi)
			)
			let raporAdi2Id = {}
			if (!empty(raporAdiSet)) {
				await Promise.allSettled(
					[DMQRapor, SBTablo].map(async raporSinif => {
						let {tableAlias: raporAlias} = raporSinif
						/*let ozelQueryDuzenle = ({ sent: { where: wh } }) =>
							wh.inDizi(keys(raporAdiSet), `${raporAlias}.aciklama`)*/
						let recs = await raporSinif.loadServerData({ /*ozelQueryDuzenle*/ }) ?? []
						$.extend(raporAdi2Id, Object.fromEntries(recs.map(({ id, kaysayac, aciklama }) => [aciklama, id ?? kaysayac])))
					})
				)
			}
			let {kod2Sinif} = DRapor
			for (let det of detaylar) {
				let {tip: { rapormu }, value: raporKod, raporAdi, inst: rapor} = det
				if (!(rapormu && raporKod && raporAdi))
					continue
				let raporId = raporAdi2Id[raporAdi]
				if (raporId) {
					det.raporId = raporId
					let raporSinif = kod2Sinif[raporKod]
					let {mainClass: { raporTanimSinif } = {}} = raporSinif ?? {}
					if (!raporTanimSinif)
						continue
					if (raporTanimSinif) {
						let raporTanim = await new raporTanimSinif({ sayac: raporId }).oku()
						rapor ??= raporKod
						if (typeof rapor == 'string')
							rapor = kod2Sinif[raporKod] ?? window[raporKod]
						if (isClass(rapor))
							rapor = new rapor()
						det.inst = rapor
						if (raporTanim)
							rapor.on('raporTanim', () => raporTanim)
						// raporTanim?.setDefault({ rapor: { raporKod } })
					}
				}
			}
			this.add(detaylar)
		}
		if (!noTitleUpdate && raporAdi) {
			if (!raporSinif.ozelRaporAdimi(raporAdi))
				this._sonRaporAdi = raporAdi
			this.updateWndTitle(`${title} &nbsp;[<span class="bold forestgreen">${raporAdi}</span>]`)
		}
	}
	async saveLayout(e) {
		let {raporTanim, id2Detay, items} = this
		if (!raporTanim)
			return
		await raporTanim._promise
		if (raporTanim && id2Detay) {
			raporTanim.detaylarReset()
			for (let det of values(id2Detay)) {
				if (!det)
					continue
				let {rapor_id, rapor_adi} = det
				if (rapor_id)
					det.raporId = rapor_id
				if (rapor_adi)
					det.raporAdi = rapor_adi
				raporTanim.addDetay(det)
			}
			await raporTanim?.setDefault()
		}
	}
	async panelleriOlustur({ batch } = {}) {
		let e = arguments[0], panel = this
		let {builder: rfb, id2Detay, items, layout} = this
		if (id2Detay == null) {
			this.clear()
			await this.detaylariDuzenle(e)
			id2Detay = this.id2Detay
		}
		if (batch && !empty(id2Detay))
			layout.addClass('_loading')
		let itemSelector = 'div > .item', focusSelector = 'hasFocus'
		let itemsChildren = items.children(), id2Item = {}
		for (let i = 0; i < itemsChildren.length; i++) {
			let item = itemsChildren.eq(i)
			let part = item.data('part')
			let det = item.data('detay')
			let {id} = det ?? {}
			if (!((batch && id2Detay[id]))) {
				id2Item[id] = item
				continue
			}
			part?.destroyPart?.()
			part?.rootBuilder?.destroyPart()
			item.remove()
			if (det) {
				for (let key of ['rootBuilder', 'layout'])
					delete det[key]
			}
		}
		// itemsChildren?.remove()
		let _rfb = new RootFormBuilder(), promises = [], loadCount = 0, completeCount = 0
		let LoadingLockWaitMS = 200, AutoShowWaitMS = 3_000
		let {length: totalCount} = values(id2Detay)
		let maxWaitCount = Math.min(5, totalCount)
		for (let [id, det] of entries(id2Detay)) {
			if (id2Item[id])
				continue
			let {baslik, width, height, inst = {}, tip} = det
			width ||= '49%'; height ||= '49%'
			let item = _rfb.addFormWithParent(id).altAlta()
				.addCSS('item _loading')
				.setParent(items).setRootBuilder(rfb)
			// item.onInit(({ builder: { layout } }) => $.extend(inst, { layout }))
			let _e = { ...e, rfb: item }
			$.extend(inst, { _baslik: baslik, panel: this, detay: det })
			let result
			if (tip.rapormu) {
				item.setInst(this).setPart(inst)
				if (inst && $.isPlainObject(inst))
					inst = null
				if (!inst) {
					delete id2Detay[id]
					console.warn('panel inst yok, muhtemelen class değişti')
					this.saveLayout()
					continue
				}
				inst.on('init', ({ rapor: main }) =>
					this.tazeleOncesi({ ..._e, main }))
				result = await inst?.goster?.(_e)
			}
			else if (tip.webmi || tip.evalmi) {
				let {value: url} = det;
				item.setInst(det.inst = inst)
				$.extend(inst, { exportHTMLIstendi: e => openNewWindow(url) })
				item.noAutoAppend().setLayout(({ builder: { parent } }) => {
					let layout =
						$(`<div id="${id}" class="parent item item-ozel full-wh">
							<div class="item item-sortable full-width">
								<label>${baslik || url || ' '}</label>
								<button id="fullScreen"></button>
								<button id="close"></button>
							</div>
						</div>`)
					layout.appendTo(parent)
					return layout
				})
				let {layout: itemLayout} = item
				if (tip.webmi) {
					let tazele = inst.tazele = async () => {
						let content = itemLayout.find('.content')
						if (!content?.length) {
							content =
								$(`<iframe class="content full-wh" border="0"` +
										` scrolling="auto" allowtransparency="true" crossorigin="anonymous"` +
										` credentialless="true" loading="lazy" referrerpolicy="no-referrer">` +
								  `</iframe>`)
							content.appendTo(itemLayout)
						}
						let {value: url} = det, {contentDocument: doc} = content[0]
						let wsURLBase = `${app.getWSUrlBase({ wsPath: '' }).trim_slashes()}/ws`
						let {session} = config, sessionStr = ''
						{
							let args = {}
							config.session.buildAjaxArgs({ args })
							sessionStr = $.param(args)
						}
						url = url
							.replaceAll('{ws}', wsURLBase)
							.replaceAll('{session}', sessionStr)
						doc?.close()
						doc?.writeln(
							`<html>
								<head></head>
								<body><img width="200" height="200" src="../../images/loading.gif"></img></body>
							</html>`
						)
						doc?.close()
						content.attr('src', url)
						/*app.webRequestAsStream({ url, type: null })
							.then(result => {
								let {origin: newOrigin} = new URL(url)
								// let proxyURL = app.getWSUrl({ api: 'webRequest' })
								result = result
									.replaceAll(`"/`, `"${newOrigin}/`)
									.replaceAll(`'/`, `'${newOrigin}/`)
								doc.close(); doc.writeln(result)
								let {head} = doc
								// if (head && config.colorScheme == 'dark')
								//	$(`<style>body { filter: invert(1) hue-rotate(180deg) !important }</style>`).appendTo($(head))
							})
							.catch(ex => {
								doc.close()
								doc.writeln(`<h2 style="font-weight: bold; color: firebrick">${getErrorText(ex)}</h2>`)
							})
						*/
					}
					tazele()
				}
				if (tip.evalmi) {
					let tazele = inst.tazele = async () => {
						let content = itemLayout.find('.content')
						if (content?.length)
							content.children().remove()
						else {
							content = $(`<div class="content full-wh"></div>`)
							content.appendTo(itemLayout)
						}
						let {value: code} = det
						if (typeof code == 'string') {
							code = code.trim()
							{
								for (let i = 0; i < 2; i++) {
									let last = code.at(-1)
									if (last == '\r' || last == '\n')
										code = code.slice(0, -1)
								}
							}
							/*if (code[0] != '(') {
								code += `(e => `
								if (code.at(-1) != ')') { code += ')' }
							}*/
							try { code = await eval(code) }
							catch (ex) { code = null; console.error('code eval', code, e, ex, getErrorText(ex)) }
						}
						if (code) {
							$.extend(_e, { panel: this, detay: det, layout, items, item, itemLayout, content });
							(async () => {
								try { await getFuncValue.call(this, code, _e) }
								catch (ex) { console.error('code eval #2', code, result, _e, ex, getErrorText(ex)) }
							})()
						}
						if (!code) {
							delete id2Detay[id]
							itemLayout.remove()
							let {raporTanim: { detaylar }} = this
							let ind = detaylar.findIndex(det => det.id == id)
							if (ind > -1) {
								detaylar.splice(ind, 1)
								this.saveLayout()
							}
						}
					}
					tazele()
				}
				itemLayout?.find('#fullScreen')?.on('click', ({ currentTarget: target }) => {
					target = $(target)
					let id = target.parents('.item.parent').prop('id')
					let det = this.id2Detay[id] ?? {}, {tip: { evalmi }, value: url} = det
					if (url) {
						if (evalmi) {
							let {outerHTML: data} = target.parents('.item.parent').find('.content')[0]
							url = URL.createObjectURL(new Blob([data], { type: 'text/html' }))
						}
						let wnd = openNewWindow(url)
						if (evalmi)
							setTimeout(() => URL.revokeObjectURL(url), 5_000)
					}
				})
				itemLayout?.find('#close')?.on('click', ({ currentTarget: target }) => {
					target = $(target)
					let id = target.parents('.item.parent').prop('id')
					let det = this.id2Detay[id]
					if (det)
						this.remove(det)
				})
				itemLayout?.on('click', ({ currentTarget: target }) => {
					target = $(target)
					target.parents('.items').children('.item').removeClass('hasFocus')
					target.addClass('hasFocus')
				})
				if (!baslik) {
					itemLayout?.find('iframe')?.on('load', ({ currentTarget: target }) => {
						setTimeout(() => {
							let {title} = target.contentDocument?.head ?? {}
							if (title)
								$(target).parents('.item').children('label').html(title || ' ')
						}, 1_000)
					})
				}
			}
			result = await result
			let {layout: itemLayout, part} = item
			det.part = part
			if (itemLayout) {
				itemLayout.data('detay', det)
				itemLayout.data('part', part)
				itemLayout.data('inst', inst)
			}
			loadCount++
			if (tip.rapormu && inst?.main?.raporVarmi && inst?.gridVeriYuklendiIslemi) {
				let timer, promise = new $.Deferred()
				timer = setTimeout(({ itemLayout: layout }) => {
					try {
						if (layout?.length) {
							layout.removeClass('_loading')
							layout.css({ width, height })
						}
						if (++completeCount >= maxWaitCount)
							setTimeout(() => this.layout.removeClass('_loading'), LoadingLockWaitMS)
					}
					finally { promise?.resolve() }
				}, AutoShowWaitMS, { itemLayout })
				inst.gridVeriYuklendiIslemi(async ({ builder: { id: _id, parentBuilder } = {} } = {}) => {
					try {
						let {id} = parentBuilder?.parentBuilder?.parentBuilder ?? {}
						let {layout} = _rfb.id2Builder[id] ?? {}
						if (promise && layout?.length) {
							layout.css({ width, height })
							layout.removeClass('_loading')
							clearTimeout(timer)
						}
					}
					finally {
						if (++completeCount >= maxWaitCount)
							setTimeout(() => this.layout.removeClass('_loading'), LoadingLockWaitMS)
						promise?.resolve()
					}
				})
				promises.push(promise)
			}
			else {
				itemLayout?.removeClass('_loading')
				itemLayout?.css({ width, height })
				if (++completeCount >= totalCount)
					setTimeout(() => this.layout.removeClass('_loading'), LoadingLockWaitMS)
			}
			// promises.push(promise)
		}
		if (promises.length) {
			await Promise.allSettled(promises)
			promises = []
		}
		let subItems = items.find(itemSelector)
		subItems.eq(0).addClass(focusSelector)
		{
			let handler = ({ currentTarget: target }) => {
				let item = $(target)
				item.parents('.items').find('.item').removeClass(focusSelector)
				item.addClass(focusSelector)
			}
			for (let key of ['mousedown', 'touchstart', 'click'])
				subItems.on(key, handler)
		}
		setTimeout(() => {
			let itemsCSS = {}
			for (let key of ['overflow', 'overflow-x', 'overflow-y'])
				itemsCSS[key] = items.css(key)
			let children = items.children('.item')
			children.resizable({
				/*handles: 'all', containment: 'parent', ghost: true, helper: 'ui-resizable-helper',*/
				// classes: { '.ui-resizable': 'highlight' },
				handles: 'all', grid: [20, 20], 
				minWidth: Math.min($(window).width() - 100, 300),
				minHeight: 70,
				start: (evt, info) => {
					let {element: item} = info; item.addClass('_resizing')
					for (let key in itemsCSS) { items.css(key, 'hidden') }
					/*items.children().addClass('basic-hidden')
					item.removeClass('basic-hidden jqx-hidden')*/
				},
				stop: (evt, info) => {
					let {id2Detay} = this, {element: item, size: { width, height }} = info
					item.removeClass('_resizing')
					for (let [k, v] of entries(itemsCSS)) { items.css(k, v) }
					//items.children().removeClass('basic-hidden jqx-hidden')
					let id = item.prop('id'), det = id2Detay[id]
					if (det) {
						let contW = items.width(), contH = items.height()
						det.width  = `${(width  / contW * 100).toFixed(1)}%`
						det.height = `${(height / contH * 100).toFixed(1)}%`
						this.saveLayout()
					}
				}
			})
			items.sortable({
				connectWith: '> .item:not(.maximized)', handle: '.item-sortable',
				placeholder: '_sorting', zIndex: 3000, opacity: .8,
				delay: 100, distance: 48, cancel: '.maximized',
				/*tolerance: 'intersect'*/ tolerance: 'pointer',
				update: (evt, info) => {
					let {item} = info, det = item.data('detay'); if (!det) { return }
					let {id} = det; if (!id) { return }
					let {id2Detay} = this, detaylar = values(id2Detay)
					let ind = detaylar.indexOf(det); if (ind  < 0) { return }
					let newInd = item.index(); if (newInd < 0) { return }
					let moved = detaylar.splice(ind, 1)[0]
				    detaylar.splice(newInd, 0, moved)
					id2Detay = this.id2Detay = Object.fromEntries(detaylar.map(det => [det.id, det]))
					this.saveLayout()
				}
			})
		}, 10)
		// if (this._previouslyRendered) {
		{																// Rapor yapıları için bug-fix
			let detaylar = values(this.id2Detay)
			let repeat = 1, wait = 10, inc = 40
			for (let i = 0; i < repeat; i++) {
				await delay(wait); wait += inc
				for (let {tip: { rapormu } = {}, raporTip: { chartmi }, inst} of detaylar) {
					if (rapormu && chartmi && inst)
						await inst.tazele?.(e)
				}
			}
		}
		if (!batch) {
			let {title} = this
			this.saveLayout(e)
			this.updateWndTitle(`${title} &nbsp;[<span class="bold forestgreen">${DPanelTanim.defaultAciklama}</span>]`)
		}
		this._rendered = this._previouslyRendered = true
		hideProgress()
	}
	panelleriOlustur_batch(e) { return this.panelleriOlustur(({ ...e, batch: true })) }
	hizliBulIslemi(e) {
		let {bulPart} = e; clearTimeout(this._timer_hizliBulIslemi_ozel); this._timer_hizliBulIslemi_ozel = setTimeout(() => {
			try {
				let {input} = bulPart; this.hizliBulIslemi_ara(e)
				for (let  delayMS of [400, 1000]) {
					setTimeout(() => {
						bulPart.focus()
						setTimeout(() => { input[0].selectionStart = input[0].selectionEnd = input[0].value?.length }, 205)
					}, delayMS)
				}
				setTimeout(() => FiltreFormPart.hizliBulIslemi(e), 500)
			}
			finally { delete this._timer_hizliBulIslemi_ozel }
		}, 100)
	}
	hizliBulIslemi_ara({ tokens }) {
		let e = { ...arguments[0] }; let {id2Detay} = this
		for (let { inst } of values(id2Detay))
			inst?.hizliBulIslemi_ara?.(e)
	}
	raporTanimIstendi(e) {
		let tamamIslemi = _e =>
			this.saveLayout({ ...e, ..._e })
		e = { ...e, tamamIslemi }
		this._inst?.raporTanimIstendi?.(e)
		return this
	}
	genelSecimlerIstendi(e) {
		let tamamIslemi = _e => this.genelSecimler_tamamIslemi({ ...e, ..._e })
		let title = 'Genel Seçimler'
		return this.secimler?.duzenlemeEkraniAc({ ...e, title, tamamIslemi })
	}
	genelSecimler_tamamIslemi(e) {
		this.tazele()
	}
	secimlerIstendi(e) { this._inst?.secimlerIstendi?.(e); return this }
	seviyeAcIstendi(e) { this._inst?.seviyeAcIstendi?.(e); return this }
	seviyeKapatIstendi(e) { this._inst?.seviyeKapatIstendi?.(e); return this }
	exportExcelIstendi(e) { this._inst?.exportExcelIstendi?.(e); return this }
	exportPDFIstendi(e) { this._inst?.exportPDFIstendi?.(e); return this }
	exportHTMLIstendi(e) { this._inst?.exportHTMLIstendi?.(e); return this }
	yeniIstendi(e) { return this.tanimla({ ...e, islem: 'yeni' }) }
	degistirIstendi(e) { return this.tanimla({ ...e, islem: 'degistir' }) }
	async tanimla(e) {
		let {islem, detay: eDet = e.det} = e
		let yenimi = islem == 'yeni', degistirmi = islem == 'degistir'
		let islemAdi = (
			islem == 'yeni' ? 'Ekle' :
			islem == 'degistir' ? 'Değiştir' :
			islem == 'kopya' ? 'Kopya' : islem
		)
		try {
			let det = new DPanelDetay()
			if (!yenimi) {
				eDet ??= this.detay
				if (!eDet) { hConfirm('Bir panel seçilmelidir', islemAdi); return false }
				$.extend(det, eDet)
				for (let key of ['panel', 'inst', 'part', 'sinif', '_raporId', '_url', '_code', ...keys(CObject.prototype)])
					delete det[key]
				if (!degistirmi)
					for (let key of ['okunanHarSayac', 'sayac', 'eskiSeq', 'seq']) { det = undefined }
				det = det.deepCopy(); let {value} = det
				if (value) {
					let {tip: { rapormu, webmi, evalmi }} = det
					let selector = rapormu ? '_raporId' : webmi ? '_url' : evalmi ? '_code' : null
					if (selector) { det[selector] = value }
					det.value = null
				}
			}
			let validate = () => {
				let {tip: { rapormu, webmi, evalmi }, _raporId, _url, _code} = det
				if (rapormu && !_raporId) { hConfirm(`<b class="firebrick bold">Rapor</b> seçilmelidir`, islemAdi); return false }
				if (webmi && !_url) { hConfirm(`<b class="firebrick bold">Web Adresi (URL)</b> belirtilmelidir`, islemAdi); return false }
				if (evalmi && !_code) { hConfirm(`<b class="firebrick bold">JS Kodu</b> belirtilmelidir`, islemAdi); return false }
				return true
			}
			let rfb = new RootFormBuilder().setInst(det)
			let promise_wait = new $.Deferred()
			{
				rfb.addStyle_fullWH().addStyle(`$elementCSS { --islemTuslari-height: 50px }`)
				let fbd_islemTuslari = rfb.addIslemTuslari('islemTuslari').addCSS('islemTuslari')
					.setTip('tamamVazgec').addStyle_fullWH(null, 'var(--islemTuslari-height)')
					.setId2Handler({
						tamam: async ({ builder, builder: { rootPart: part } }) => {
							if (!await validate({ ...e, builder, part })) { return false }
							promise_wait?.resolve(true); part?.jqxWindow('close')
						},
						vazgec: ({ builder: { rootPart: part } }) => { promise_wait?.resolve(false); part?.jqxWindow('close') }
					})
					.onAfterRun(({ builder: fbd_islemTuslari, builder: { part: islemTuslariPart } }) => $.extend(this, { fbd_islemTuslari, islemTuslariPart }))
				let content = rfb.addFormWithParent('content').addCSS('content').altAlta()
				content.onAfterRun(({ builder: { rootBuilder: { id2Builder: { islemTuslari } }, layout }}) => {
					layout.on('keyup', ({ key }) => {
						key = key?.toLowerCase()
						if (key == 'enter' || key == 'linefeed')
							islemTuslari.layout.find('#tamam').click()
					})
				})
				let form = content.addFormWithParent()
				form.addTextInput('baslik', 'Başlık')
				form = content.addFormWithParent()
				form.addModelKullan('tip', 'Tip').dropDown().kodsuz().noMF().autoBind()
					.bosKodAlinmaz().bosKodEklenmez().listedenSecilmez()
					.setSource(DPanelTip.kaListe).addStyle_wh(350)
					.degisince(({ builder: { parentBuilder } }) => {
						for (let _ of parentBuilder)
							_.updateVisible()
					})
				form.addModelKullan('raporTip', 'Rapor Tip').dropDown().kodsuz().noMF().autoBind()
					.bosKodAlinmaz().bosKodEklenmez().listedenSecilmez()
					.setSource(DAltRaporTip.kaListe).addStyle_wh(300)
					.setVisibleKosulu(({ builder: { inst } }) => inst.tip.rapormu ? true : 'jqx-hidden')
				form.addModelKullan('_urlTemplate', 'Şablonlar').dropDown().kodsuz().noMF()
					.bosKodAlinir().bosKodEklenir().listedenSecilmez()
					.setSource(() => {
						let {colorScheme} = config, dark = colorScheme == 'dark'
						let {DefaultWSHostName_SkyServer: skyHost} = config.class
						return [
							new CKodVeAdi([
								`https://tr.widgets.investing.com/live-currency-cross-rates?theme=${dark ? 'dark' : 'light'}Theme&roundedCorners=true&pairs=1,66,18,1222032`,
								'Canlı Döviz Kurları'
							]),
							new CKodVeAdi([
								`https://${skyHost}:2095/Vio/Pdf/`,
								'VIO Doküman'
							])
						]
					})
					.degisince( ({ builder: fbd, builder: { part, parentBuilder, rootBuilder: { id2Builder: { content }} } }) => {
						let {_ekTanimlar: { id2Builder: { _url: fbd_url } }} = parentBuilder.id2Builder
						let {id2Builder: { baslik: fbd_baslik }} = content.builders[0]
						let {value: url, label: baslik} = part.widget.getSelectedItem()
						part.val('')
						det._url = fbd_url.value = url
						det.baslik = fbd_baslik.value = baslik
					})
					.addStyle_wh(400)
					.setVisibleKosulu(({ builder: { inst: { tip } = {} } }) => tip.webmi ? true : 'jqx-hidden')
				form.addModelKullan('_evalTemplate', 'Şablonlar').dropDown().kodsuz().noMF()
					.bosKodAlinir().bosKodEklenir().listedenSecilmez()
					.setSource(() => {
						/*let {colorScheme} = config, dark = colorScheme == 'dark'
						let {DefaultWSHostName_SkyServer: skyHost} = config.class*/
						return [
							new CKodAdiVeEkBilgi([
								'TURMOB', 'TÜRMOB Haberler', 'turmobmu',
								(async ({ content }) => {
									let output = 'string', url = 'https://www.turmob.org.tr/Haberler'
									let {data: { string: result } = {}} = await app.wsWebRequest({ output, url }) ?? {}
									if (result) {
										result = $(result)
										let inner =
											Array.from(result.find('div > a'))
												.filter(a => $(a).children('p')?.length)
												.map(a => {
													a = $(a)
													a.prop('target', '_blank')
													let relUrl = a.prop('href')
													relUrl = relUrl.replace(location.origin, new URL(url).origin)
													a.prop('href', relUrl)
													return `<li>${a[0].outerHTML}</li>`
													// return `${a.children('p').text()?.trim()} ${a.children('span').html().trim()}`
												})
												.join(CrLf)
										let html = $(`
											<div class="full-wh">
												<ul>${inner}</ul>
											</div>
										`)
										content.children().remove()
										html.appendTo(content)
									}
								})
							]),
							new CKodAdiVeEkBilgi([
								'TURMOB2', 'TÜRMOB Haberler (2 Kolonlu)', 'turmob2mi',
								(async ({ content }) => {
									let output = 'string', url = 'https://www.turmob.org.tr/Haberler'
									let {data: { string: result } = {}} = await app.wsWebRequest({ output, url }) ?? {}
									if (result) {
										result = $(result)
										let inner =
											Array.from(result.find('div > a'))
												.filter(a => $(a).children('p')?.length)
												.map(a => {
													a = $(a)
													a.prop('target', '_blank')
													let relUrl = a.prop('href')
													relUrl = relUrl.replace(location.origin, new URL(url).origin)
													a.prop('href', relUrl)
													return `<li style="width: 49.5%">${a[0].outerHTML}</li>`
													// return `${a.children('p').text()?.trim()} ${a.children('span').html().trim()}`
												})
												.join(CrLf)
										let html = $(`
											<div class="full-wh">
												<ul class="flex-row">${inner}</ul>
											</div>
										`)
										content.children().remove()
										html.appendTo(content)
									}
								})
							]),
							new CKodAdiVeEkBilgi([
							    'IPRESS', 'Interpress Haberleri', 'interpressmi',
							    (async ({ content }) => {
							        try {
							            let output = 'string'
							            let url = 'https://basindabiz.interpress.com/1653_BASIN/2025/1.xml'
							            // XML isteği
							            let { data: { string: xmlText } = {} } = await app.wsWebRequest({ output, url }) ?? {}
							            if (!xmlText)
							                return
							            // XML parse
							            let xml = $.parseXML(xmlText)
							            let $xml = $(xml)
							            let haberler = Array.from($xml.find('Haber'))
							            let items = haberler.map(haber => {
							                haber = $(haber)
							                let id = haber.find('HaberId').text().trim()
							                let baslik = haber.find('Baslik').text().trim()
							                let yayin = haber.find('YayinAdi').text().trim()
							                let tarih = haber.find('YayinTarihi').text().trim()
							                let link = haber.find('Url').text().trim()
							                // Hedefi dış pencere yap
							                link = link.replace(location.origin, new URL(url).origin)
							                return `
							                    <li style="margin-bottom: 6px; width: 100%">
							                        <a href="${link}" target="_blank"
							                           style="font-weight: bold; color: royalblue">
							                           ${baslik}
							                        </a>
							                        <div style="font-size: 11px; opacity: .7">
							                            ${yayin} — ${tarih}
							                        </div>
							                    </li>
							                `
							            }).join(CrLf)
							            // HTML paketle
							            let html = $(`
							                <div class="full-wh">
							                    <ul style="padding-left: 10px">${items}</ul>
							                </div>
							            `)
							            content.children().remove()
							            html.appendTo(content)
							        }
							        catch (ex) {
							            let html = $(`
							                <div class="full-wh" style="padding: 10px; color: firebrick">
							                    XML okunurken hata oluştu:<br>
							                    <b>${getErrorText(ex)}</b>
							                </div>
							            `)
							            content.children().remove()
							            html.appendTo(content)
							            console.error('Interpress XML Error', ex)
							        }
							    })
							]),
							new CKodAdiVeEkBilgi([
							    'IPRESS2', 'Interpress Haberleri (2 Kolonlu)', 'interpress2mi',
							    (async ({ content }) => {
							        try {
							            let output = 'string'
							            let url = 'https://basindabiz.interpress.com/1653_BASIN/2025/1.xml'
							            // XML isteği
							            let { data: { string: xmlText } = {} } = await app.wsWebRequest({ output, url }) ?? {}
							            if (!xmlText)
							                return
							            // XML parse
							            let xml = $.parseXML(xmlText)
							            let $xml = $(xml)
							            let haberler = Array.from($xml.find('Haber'))
							            let items = haberler.map(haber => {
							                haber = $(haber)
							                let id = haber.find('HaberId').text().trim()
							                let baslik = haber.find('Baslik').text().trim()
							                let yayin = haber.find('YayinAdi').text().trim()
							                let tarih = haber.find('YayinTarihi').text().trim()
							                let link = haber.find('Url').text().trim()
							                // Hedefi dış pencere yap
							                link = link.replace(location.origin, new URL(url).origin)
							                return `
							                    <li style="margin-bottom: 6px; width: 49.5%">
							                        <a href="${link}" target="_blank"
							                           style="font-weight: bold; color: royalblue">
							                           ${baslik}
							                        </a>
							                        <div style="font-size: 11px; opacity: .7">
							                            ${yayin} — ${tarih}
							                        </div>
							                    </li>
							                `
							            }).join(CrLf)
							            // HTML paketle
							            let html = $(`
							                <div class="full-wh">
							                    <ul class="flex-row" style="padding-left: 10px">${items}</ul>
							                </div>
							            `)
							            content.children().remove()
							            html.appendTo(content)
							        }
							        catch (ex) {
							            let html = $(`
							                <div class="full-wh" style="padding: 10px; color: firebrick">
							                    XML okunurken hata oluştu:<br>
							                    <b>${getErrorText(ex)}</b>
							                </div>
							            `)
							            content.children().remove()
							            html.appendTo(content)
							            console.error('Interpress XML Error', ex)
							        }
							    })
							])

							/* https://basindabiz.interpress.com/1653_BASIN/2025/1.xml
							   https://basindabiz.interpress.com/1653_BASIN/2025/2.xml
							*/
						]
					})
					.degisince( ({ builder: fbd, builder: { part, parentBuilder, rootBuilder: { id2Builder: { content }} } }) => {
						let {_ekTanimlar: { id2Builder: { _code: fbd_code } }} = parentBuilder.id2Builder
						let {id2Builder: { baslik: fbd_baslik }} = content.builders[0]
						let {label: baslik, originalItem: { ekBilgi: code = '' } = {}} = part.widget.getSelectedItem()
						if (isFunction(code)) {
							code = code.toString()
								.replaceAll('\t\t\t\t\t\t\t\t\t', '\t')
								.replaceAll('\t\t\t\t\t\t\t\t', '')
							code = `(${code})`
						}
						part.val('')
						det._code = fbd_code.value = code
						det.baslik = fbd_baslik.value = baslik
					})
					.addStyle_wh(500)
					.setVisibleKosulu(({ builder: { inst: { tip } = {} } }) => tip.evalmi ? true : 'jqx-hidden')
				let altForm = form.addFormWithParent('_ekTanimlar').altAlta().addStyle_fullWH()
				altForm.addModelKullan('_raporId', 'Rapor').dropDown().noMF().autoBind()
					.addStyle_wh('var(--full)')
					.setSource(e => DRapor.uygunRaporlarKAListe)
					.setVisibleKosulu(({ builder: { inst } }) => inst.tip.rapormu ? true : 'jqx-hidden')
				altForm.addTextInput('_url', 'Web Adresi (URL)').addStyle_wh('var(--full)')
					.setVisibleKosulu(({ builder: { inst } }) => inst.tip.webmi ? true : 'jqx-hidden')
				altForm.addTextArea('_code', 'JavaScript Kodu')
					.addStyle_wh('var(--full)').setRows(8).setCols(1000)
					.setVisibleKosulu(({ builder: { inst } }) => inst.tip.evalmi ? true : 'jqx-hidden')
			}
			{
				let wnd = createJQXWindow({
					title: 'Panel Ekle',
					args: {
						isModal: false, closeButtonAction: 'close',
						width: Math.min($(window).width() - 50, 1000),
						height: Math.min($(window).height() - 50, 500)
					}
				})
				wnd.on('close', evt => { promise_wait?.resolve(false); wnd.jqxWindow('destroy') })
				rfb.setPart(wnd).setLayout(wnd.find('.jqx-window-content .subContent'))
				rfb.run()
			}
			if (!await promise_wait)
				return
			let {tip: { rapormu, webmi, evalmi }} = det
			det.value = (
				rapormu ? det._raporId :
				webmi ? det._url :
				evalmi ? det._code : null
			)
			if (!det?.value)
				return
			showProgress()
			switch (islem) {
				case 'yeni':
				case 'kopya':
					await this.add(det)
					break
				case 'degistir':
					$.extend(eDet, det)
					setTimeout(async () => {
						this.items.children().remove()
						await this.render({ ...e, noTitleUpdate: true })
						this.saveLayout(e)
					}, 10)
					break
			}
			return det
		}
		catch (ex) { hConfirm(getErrorText(ex), islemAdi); throw ex }
		finally { hideProgress() }
		/* let headerBuilder = ({ sender: part, rootBuilder: rfb }) => {
			let {header} = part
			let form = rfb.addForm('header').setLayout(header)
			form.addTextInput('raporAdi', 'Rapor Adı')
		}
		await app.frMenu.listedenSec({ headerBuilder })*/
	}
	async kaydetIstendi(e) {
		let islemAdi = 'Dizayn Kaydet'
		let {title, _sonRaporAdi, raporTanim, raporTanim: { class: raporSinif }} = this
		let mevcutRaporAdiSet = asSet((await raporSinif.loadServerData()).map(rec => rec.aciklama))
		let inst = { ortakmi: true }
		try {
			let raporAdi = await jqxPrompt({
				etiket: 'Panel Tanım Adı', inst,
				value: _sonRaporAdi, args: { height: 260 },
				duzenle: (({ rfb }) => {
					rfb.addDiv('_bilgi').etiketGosterim_yok()
						.onAfterRun(({ builder: { rootPart: part, input } }) =>
							part.divBilgi = input)
						.addStyle_wh('auto', 50)
						.addStyle(`$elementCSS { margin: 70px 0 0 30px !important }`)
					rfb.addCheckBox('ortakmi', 'Tüm kullanıcılar için geçerlidir')
						.addStyle(
							`$elementCSS { margin: -10px 0 30px 0 !important }`,
							`$elementCSS > input:is(:checked) + label { font-weight: bold; color: forestgreen !important }`
						)
				}),
				afterRun: ({ part: { divBilgi }, fbd_value: { input: txtValue } }) => {
					let changeHandler = (({ currentTarget: target } = {}) => {
						let raporAdi = txtValue.val()?.trim()
						if (divBilgi?.length) {
							let html = (
								mevcutRaporAdiSet[raporAdi]
									? `<div class="warning orangered">** Mevcut rapor <u class=bold>DEĞİŞTİRİLECEK</u></div>`
									: `<div class="info royalblue">Yeni rapor eklenecek</div>`
							)
							divBilgi.html(html)
						}
					})
					changeHandler()
					txtValue.autocomplete({
						zIndex: 10000,
						select: (evt, { item: { value }}) =>
					        setTimeout(() => changeHandler(evt), 10),
						source: ({ term } = {}, callback) => {
							let result = keys(mevcutRaporAdiSet)
							if (term) {
								let tokens = term.split(' ')
								result = result.filter(adi =>
									adi[0] != '_' &&
									tokens.every(token =>
										adi.toLocaleUpperCase().includes(token.toLocaleUpperCase()) ||
										adi.toUpperCase().includes(token.toUpperCase())
									)
								)
							}
							callback(result)
						}
					})
					txtValue.on('keyup', evt =>
						setTimeout(() => changeHandler(evt), 10))
				},
				validate: ({ value }) => {
					if (!value) {
						hConfirm(`<b class="firebrick bold">Panel Tanım Adı</b> belirtilmelidir`)
						return false
					}
					if (raporSinif.ozelRaporAdimi(value)) {
						hConfirm(`<b class="firebrick bold">${value}</b> ismi özel bir anlama gelmektedir ve kullanılamaz`)
						return false
					}
					return true
				}
			})
			if (!raporAdi)
				return
			showProgress()
			let yRaporTanim = raporTanim.deepCopy().noId()
			yRaporTanim.ortakmi = inst.ortakmi
			yRaporTanim.aciklama = raporAdi
			{
				let {table: from, adiSaha} = raporSinif
				let whDuzenle = wh => {
					if (yRaporTanim.ortakmi || !yRaporTanim.encUser)
						wh.add(`COALESCE(xuserkod, '') = ''`)
					else
						wh.degerAta(yRaporTanim.encUser, 'xuserkod')
				}
				let del = new MQIliskiliDelete({
					from,
					where: [ { degerAta: raporAdi, saha: adiSaha } ]
				})
				whDuzenle(del.where)
				await app.sqlExecNone(del)
			}
			await yRaporTanim.yaz()
			this._sonRaporAdi = raporAdi
			this.updateWndTitle(`${title} &nbsp;[<span class="bold forestgreen">${raporAdi}</span>]`)
			eConfirm(`Panel Tanımı <b class="bold royalblue">${raporAdi}</b> ismi ile kaydedildi`, islemAdi)
		}
		catch (ex) { hConfirm(getErrorText(ex), islemAdi); throw ex }
		finally { hideProgress() }
	}
	yukleIstendi(e) {
		let islemAdi = 'Dizayn Yükle'
		try {
			let {title, raporTanim: defRaporTanim, raporTanim: { id, aciklama, class: raporSinif }} = this
			let saved = { id, aciklama }
			let secince = async ({ rec: { id, aciklama: raporAdi } }) => {
				let {raporTanim: { class: raporSinif, class: { defaultAciklama: defRaporAdi } }} = this
				try {
					showProgress()
					let raporTanim = new raporSinif().setId(id)
					if (await raporTanim.yukle() === false)
						throw { isError: true, errorText: 'Yükleme başarısız' }
					$.extend(defRaporTanim, raporTanim, saved);
					(async () => {
						try {
							if (raporTanim.aciklama != defRaporAdi)
								defRaporTanim.setAciklamaDefault()
							raporTanim.kaydet()
							this._sonRaporAdi = raporAdi
							await this.render(e)
							this._sonRaporAdi = raporAdi
							this.updateWndTitle(`${title} &nbsp;[<span class="bold forestgreen">${raporAdi}</span>]`)
						}
						finally { hideProgress() }
					})()
					// eConfirm(`<b class="royalblue bold">${raporAdi}</b> isimli Panel Tanımı yüklendi`, islemAdi)
				}
				catch (ex) {
					hideProgress()
					hConfirm(getErrorText(ex), 'Panel Tanımı YÜKLENEMEDİ', islemAdi)
					throw ex
				}
			}
			let veriYuklenince = ({ gridWidget, recs, source }) => {
				gridWidget.clearselection()
				let {_sonRaporAdi: adi} = this ?? {}; if (!adi) { return }
				recs ??= source?.records; if (!recs?.length) { return }
				for (let i = 0; i < recs.length; i++) {
					let rec = recs[i]
					rec = rec.originalItem ?? rec.originalRecord ?? rec
					let {aciklama: _adi} = rec
					if (adi == _adi && !DPanelTanim.ozelRaporAdimi(_adi)) {
						gridWidget.selectrow(i); gridWidget.ensurerowvisible(i)
						break
					}
				}
			}
			raporSinif.listeEkraniAc({ tekil: true, veriYuklenince, secince })
		}
		catch (ex) { hConfirm(getErrorText(ex), islemAdi); throw ex }
	}
	onResize(e) {
		super.onResize(e); let {layout} = this
		if (layout.hasClass('_loading')) { return }
		let {id2Detay} = this; if (id2Detay) {
			for (let det of values(id2Detay))
				(async () => det?.onResize?.(e))()
		}
	}
	getLayoutInternal(e) {
		super.getLayoutInternal(e)
		return $(`<div></div>`)
	}
}


/*
let output = 'string', url = 'https://www.turmob.org.tr/Haberler'
let {data: { string: result } = {}} = await app.wsWebRequest({ output, url }) ?? {}
if (result) {
	result = $(result)
	console.table(
		Array.from(result.find('div > a'))
			.filter(a => $(a).children('p')?.length)
			.map(a => {
				a = $(a)
				return a[0].outerHTML
				// return `${a.children('p').text()?.trim()} ${a.children('span').html().trim()}`
			})
	)
}
*/
