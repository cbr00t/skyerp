class HatYonetimiPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isWindowPart() { return true } static get partName() { return 'hatYonetimi' } static get sinifAdi() { return 'Hat Yönetimi' }
	get boxSize() {
		let result = this._boxSize; if (!result) {
			const {globals} = this;
			result = this._boxSize = globals.boxSize = globals.boxSize ?? { rows: 23, cols: 4 }
		}
		return result
	}
	set boxSize(value) { this._boxSize = $.isEmptyObject(value) ? null : value }
	get selectedTezgahElmListe() { return this.divListe.find('.tezgah.item.selected') }
	get selectedTezgahKodListe() { return $.makeArray(this.selectedTezgahElmListe).map(elm => elm.dataset.id) }
	get selectedTezgahRecs() { const {tezgah2Rec, selectedTezgahKodListe} = this; return selectedTezgahKodListe.map(kod => tezgah2Rec[kod]) }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			title: 'Hat Yönetimi 2', tezgahKod: (e.tezgahKod ?? e.tezgahId)?.trimEnd(), cokluSecimmi: e.cokluSecim ?? e.cokluSecimmi ?? false, boxSize: e.boxSize,
			hizliBulAttrListe: e.hizliBulAttrListe ?? ['hatKod', 'hatAdi', 'tezgahKod', 'tezgahAdi', 'perKod', 'perIsim', 'ip', 'isListe']
		})
	}
	init(e) {
		e = e || {}; super.init(e); const {layout} = this;
		const header = this.header = layout.children('.header'), subContent = this.subContent = layout.children('.content');
		const divListe = this.divListe = subContent.children('.liste')
	}
	run(e) {
		e = e || {}; super.run(e); const {layout} = this, builder = this.builder = this.getRootFormBuilder(e);
		this.tazele(e); if (app.otoTazeleFlag == null) { app.otoTazeleFlag = true }
		if (builder) { const {inst} = this; $.extend(builder, { part: this, inst }); builder.autoInitLayout().run(e) }
	}
	destroyPart(e) { super.destroyPart(e) }
	activated(e) { super.activated(e); this.tazeleBasit(e) }
	getLayoutInternal(e) {
		return $(
			`<div>
				<div class="header full-width"></div>
				<div class="content"><div class="liste flex-row full-width"></div></div>
			</div>`
		)
	}
	getRootFormBuilder(e) {
		const rfb = new RootFormBuilder(), {header, divListe} = this, {sabitHatKodVarmi} = app;
		rfb.addForm('bulForm').setParent(header).onAfterRun(({ builder: fbd }) => { this.bulForm = fbd.layout; this.initBulForm(e) })
			.setLayout(({ builder: fbd }) => $(`<div class="${fbd.id} part"><input class="input full-wh" type="textbox" maxlength="100"></input></div>`));
		rfb.addIslemTuslari('islemTuslari').setParent(header).addStyle_fullWH().addCSS('islemTuslari')
			.onAfterRun(({ builder: fbd }) => { const {id, rootPart, input} = fbd; rootPart.islemTuslari = input })
			.setButonlarIlk([
				{ id: 'tezgahMenu', text: 'TEZ', handler: e => this.tezgahMenuIstendi(e) },
				{ id: 'isEmirleri', text: 'EMR', handler: e => this.bekleyenIsEmirleriIstendi(e) },
				{ id: 'topluX', text: 'TPL', handler: e => this.topluXMenuIstendi(e) },
				(sabitHatKodVarmi ? null : { id: 'tumEkNotlar', text: 'NOT', handler: e => this.ekNotlarIstendi({ ...e, hepsi: true }) }),
				{ id: 'ozet', text: 'ÖZET', handler: e => this.ozetBilgiGoster(e) },
				{ id: 'boyut', text: 'BYT', handler: e => this.boyutlandirIstendi(e) },
				{ id: 'tazele', handler: e => this.tazele(e) }, { id: 'vazgec', handler: e => this.close(e) }
			]).setEkSagButonlar('tezgahMenu', 'isEmirleri', 'topluX', 'tumEkNotlar', 'ozet', 'boyut', 'tazele');
		let parent = rfb.addFormWithParent('checkboxes').setParent(header).addCSS('checkboxes').addStyle(e => `$elementCSS > * { margin-top: calc(3px - var(--islemTuslari-height)) !important }`)
			parent.addCheckBox('otoTazeleFlag', 'Tzl').setAltInst(app).setValue(app.otoTazeleFlag ?? false).degisince(({ builder: fbd }) => this.tazeleBasit(e));
		return rfb
	}
	initBulForm(e) {
		let {bulPart} = this; if (bulPart && !bulPart.isDestroyed) { return this }
		let sender = this, {bulForm: layout} = this; if (layout?.length) {
			bulPart = this.bulPart = new FiltreFormPart({ layout, degisince: e => { const {tokens} = e; this.hizliBulIslemi({ sender, layout, tokens }) } });
			bulPart.run(); layout.removeClass('jqx-hidden')
		}
		return this
	}
	hizliBulIslemi(e) { const {tokens} = e; this.filtreTokens = tokens; this.tazeleBasit(e); return this }
	tazeleBasit(e) { return this.tazele({ ...e, basit: true }) }
	tazeleWithSignal() { app.signalChange(); return this }
	onSignalChange(e) { this.tazeleBasit(e); return this }
	async tazele(e) {
		e = e ?? {}; let basitmi = e.basit ?? e.basitmi;
		try {
			let recs = this.tezgahRecs = await this.loadServerData(e); if (!recs) { return this }
			let hat2Sev = this.hat2Sev = {}, tezgah2Rec = this.tezgah2Rec = {}; for (const rec of recs) {
				const {hatKod, tezgahKod} = rec; let sev = hat2Sev[hatKod];
				if (!sev) { const {hatAdi, grupStyle} = rec, detaylar = []; hat2Sev[hatKod] = sev = { hatKod, hatAdi, grupStyle, detaylar } }
				sev.detaylar.push(rec); tezgah2Rec[tezgahKod] = rec
			}
			let {_lastTezgahRecs: lastRecs} = this; if (basitmi && !(lastRecs && lastRecs.length == recs.length)) { basitmi = false }
			if (!basitmi) { this.createLayout(e) } this.updateLayout(e)
			this._lastTezgahRecs = lastRecs = recs
		}
		catch (ex) { if (!basitmi) { hConfirm(getErrorText(ex)) } throw ex }
		return this
	}
	async loadServerData(e) {
		let recs, lastError; for (let i = 0; i < 3; i++) {
			try { recs = await this.loadServerData_internal(e); lastError = null; break }
			catch (ex) { lastError = ex; if (i) { await new $.Deferred(p => setTimeout(() => p.resolve(), i * 500) ) } }
		}
		if (lastError) { throw lastError }
		return recs || []
	}
	async loadServerData_internal(e) {
		e = e ?? {}; let basitmi = e.basit ?? e.basitmi, {islemTuslari, excludeTezgahKod, filtreTokens} = this;
		let tezgah2Rec = {}, isID2TezgahKodSet = {}, hatIdListe = app.sabitHatKodVarmi ? app.sabitHatKodListe : $.makeArray(this.hatKod);
		let wsArgs = {}; if (hatIdListe?.length) { $.extend(wsArgs, { hatIdListe: hatIdListe.join(delimWS) }) }
		let recs = await app.wsTezgahBilgileri(wsArgs); if (recs) {
			const {durumKod2KisaAdi, hatBilgi_recDonusum: donusum} = app;
			for (const rec of recs) {
				for (const [key, newKey] of Object.entries(donusum)) { if (rec[newKey] == null) { rec[newKey] = rec[key]?.trimEnd(); delete rec[key] } }
				let {durumKod, durumAdi} = rec; if (durumKod != null) {
					durumKod = rec.durumKod = durumKod.trimEnd(); if (rec.durumAdi == null) { rec.durumAdi = durumKod2KisaAdi[durumKod] ?? durumKod }
					if (durumKod != 'DR' && rec.durNedenAdi) { rec.durNedenAdi = '' }
				}
			}
			const getIPNum = ip => asInteger(ip.replaceAll('.', ''));
			recs.sort((a, b) =>
				a.hatKod < b.hatKod ? -1 : a.hatKod > b.hatKod ? 1 :
				getIPNum(a.ip) < getIPNum(b.ip) ? -1 : getIPNum(a.ip) > getIPNum(b.ip) ? 1 :
				a.tezgahKod < b.tezgahKod ? -1 : a.tezgahKod > b.tezgahKod ? 1 :
				0)
		}
		if (recs && filtreTokens?.length) {
			let {hizliBulAttrListe} = this, _recs = recs; recs = [];
			for (const rec of _recs) {
				let uygunmu = true; const values = hizliBulAttrListe.map(key => typeof rec[key] == 'object' ? toJSONStr(rec[key]) : rec[key]?.toString()).filter(value => !!value);
				for (const token of filtreTokens) {
					let _uygunmu = false; for (let value of values) {
						if (value == null) { continue } value = value.toString();
						if (value.toUpperCase().includes(token.toUpperCase()) || value.toLocaleUpperCase(culture).includes(token.toLocaleUpperCase(culture))) { _uygunmu = true; break }
					} if (!_uygunmu) { uygunmu = false; break }
				} if (!uygunmu) { continue }
				recs.push(rec)
			}
		}
		if (recs) {
			let _recs = recs; recs = [];
			for (let rec of _recs) {
				let {hatKod, tezgahKod, isID} = rec; if (excludeTezgahKod && tezgahKod == excludeTezgahKod) { continue }
				let tezgahRec = tezgah2Rec[tezgahKod] ?? { ...rec }, {isListe} = tezgahRec;
				if (!tezgah2Rec[tezgahKod]) { tezgah2Rec[tezgahKod] = tezgahRec; recs.push(tezgahRec); isListe = tezgahRec.isListe = [] }
				let isSaymaInd = tezgahRec.isSaymaInd || 0, isSaymaSayisi = rec.isSaymaSayisi = rec.isSaymaSayisi || (isID ? 1 : 0);
				$.extend(tezgahRec, { isSaymaInd: isSaymaInd + isSaymaInd, isSaymaSayisi: isSaymaSayisi + isSaymaSayisi });
				if (isID) {
					const {oemgerceklesen, oemistenen} = rec; rec.oee = oemistenen ? roundToFra(Math.max(oemgerceklesen * 100 / oemistenen, 0), 2) : 0;
					delete rec.isListe; isListe.push(rec); let set = isID2TezgahKodSet; (set[isID] = set[isID] || {})[tezgahKod] = true
				}
			}
		}
		if (!basitmi && tezgah2Rec && !$.isEmptyObject(isID2TezgahKodSet)) {
			let promises = []; for (let [isId, tezgahKodSet] of Object.entries(isID2TezgahKodSet)) {
				isId = asInteger(isId); promises.push(new $.Deferred(async p => {
					try {
						let rec; try { rec = await app.wsGorevZamanEtuduVeriGetir({ isId }); if (!rec?.bzamanetudu) { rec = null } } catch (ex) { }
						if (rec) { for (const tezgahKod in tezgahKodSet) { rec = tezgah2Rec[tezgahKod]; if (rec) { rec.zamanEtuduVarmi = true } } }
					} catch (ex) { console.error(ex) }
					p.resolve()
				}))
			} if (promises?.length) { await Promise.all(promises) }
		}
		if (recs) {
			for (const rec of recs) {
				const {hatKod} = rec, styles_bgImg_url = [], imageInfos = [ { align: 'left' }, { align: 'center', postfix: '-01' }, { align: 'right', postfix: '-02' } ];
				for (const {align, postfix} of imageInfos) {
					let id = `hat-${hatKod}`; if (postfix) { id += postfix } const url = `${app.getWSUrlBase()}/stokResim/?id=${id}`;
					styles_bgImg_url.push(`url(${url}) ${align} center no-repeat`)
				}
				const styles_bgImg_size = styles_bgImg_url.map(x => 'contain'), styles_bgImg = [`background: ${styles_bgImg_url.join(', ')}`, `background-size: ${styles_bgImg_size.join(', ')}`];
				/* styles_bgImg.push(`mix-blend-mode: difference`) */
				$.extend(rec, { grupStyle: `${styles_bgImg.join('; ')}`, aktifIsSayi: rec.isListe?.length })
			}
		}
		if (!basitmi) {
			MQEkNotlar.loadServerData().then(recs => {
				const btnTumEkNotlar = islemTuslari.find('button#tumEkNotlar'); if (btnTumEkNotlar?.length) { btnTumEkNotlar.removeClass('yeni-not') }
				let maxId = 0; for (const {kaysayac: sayac} of recs) { maxId = Math.max(maxId, sayac) } if (!maxId) { return }
				const {localData} = app.params; let ekNotLastReadId = asInteger(localData.getData('ekNotLastReadId'));
				if (ekNotLastReadId < maxId && btnTumEkNotlar?.length) { btnTumEkNotlar.addClass('yeni-not') }
			})
		}
		return recs
	}
	createLayout(e) {
		e = e ?? {}; const {hat2Sev: hat2Sev, divListe} = this; if (!hat2Sev) { return this }
		let lastSelection = this._lastSelection = this.selectedTezgahKodListe;
		let parent = $(document.createDocumentFragment()); for (const sev of Object.values(hat2Sev)) {
			let itemHat = this.class.getLayout_hat(sev), itemTezgahlar = itemHat?.children('.tezgahlar'); if (!itemTezgahlar?.length) { continue }
			for (const rec of sev.detaylar) { let itemTezgah = this.class.getLayout_tezgah(rec); itemTezgah.appendTo(itemTezgahlar) }
			itemHat.appendTo(parent)
		}
		divListe.children().remove(); parent.appendTo(divListe); this.initLayoutEvents({ divListe });
		makeScrollable(this.subContent);
		if (lastSelection?.length) {
			const cssClass = 'selected'; divListe.find(`.hat.item > .tezgahlar > .tezgah.item.selected`).removeClass(cssClass);
			for (const kod of lastSelection) { divListe.find(`.hat.item > .tezgahlar > .tezgah.item:not(.selected)[data-id = "${kod}"]`).addClass(cssClass) }
		}
		this._lastSelection = this.selectedTezgahKodListe; return this
	}
	updateLayout(e) {
		e = e ?? {}; const {layout, boxSize: box} = this; for (const [key, value] of Object.entries(box)) { layout.css(`--box-${key}`, `${value}`) }
		const {hat2Sev: hat2Sev, divListe} = this; if (!hat2Sev) { return this }
		const basitmi = e.basit ?? e.basitmi, setHTMLValues = (parent, rec, ...keys) => {
			if (!parent?.length) { return } keys = keys?.flat();
			for (const key of keys) {
				let value = rec[key] ?? ''; let elm = parent.find(`.${key}`); if (elm.length) { elm.html(value) }
				elm = parent.find(`.${key}-parent`); if (elm.length) { elm[value || typeof value == 'number' ? 'removeClass' : 'addClass']('jqx-hidden') }
			}
		};
		for (const sev of Object.values(hat2Sev)) {
			let {hatKod, grupStyle, detaylar} = sev, itemHat = divListe.find(`.hat.item[data-id = "${hatKod}"]`); if (!itemHat?.length) { continue }
			setHTMLValues(itemHat, sev, 'hatKod', 'hatAdi');
			let elm = itemHat.find('.grup'); if (elm.length) {
				if (grupStyle) { elm.attr('style', grupStyle); itemHat.addClass('hasGrupStyle') }
				else { elm.attr('style', ''); itemHat.removeClass('hasGrupStyle') }
			}
			for (const rec of detaylar) {
				let {tezgahKod, isListe, durumKod} = rec, topSaymaInd = 0, topSaymaSayisi = 0;
				for (const is of isListe) { topSaymaInd += (is.isSaymaInd || 0); topSaymaSayisi += (is.isSaymaSayisi || 0) }
				let itemTezgah = itemHat.find(`.tezgah.item[data-id = "${tezgahKod}"]`); if (!itemTezgah.length) { continue }
				setHTMLValues(itemTezgah, rec,
					'tezgahKod', 'tezgahAdi', 'ip', 'siradakiIsSayi', 'ekBilgi', 'perKod', 'perIsim',
					'emirMiktar', 'onceUretMiktar', 'aktifUretMiktar', 'isIskMiktar', 'isNetMiktar',
					'onceCevrimSayisi', 'aktifCevrimSayisi', 'aktifIsSayi', 'durumAdi', 'durNedenAdi'
				);
				if (!basitmi) { setHTMLValues(itemTezgah, rec, 'zamanEtuduVarmi') }
				let _rec = { topSaymaInd, topSaymaSayisi }; setHTMLValues(itemTezgah, _rec, Object.keys(_rec));
				itemTezgah.find('.isBilgi-parent').html(this.class.getLayout_isBilgileri(rec));
				let elm = itemTezgah.find('.grafik-parent'); if (elm?.length) { elm.html(this.class.getLayout_grafikler(isListe)) }
 			}
		}
		return this
	}
	static getLayout_hat(e) {
		let rec = e?.sev ?? e?.rec ?? e ?? {}, {hatKod, hatAdi, detaylar} = rec; return $(
			`<div class="hat item full-width" data-id="${hatKod}"">
				<div class="grup">
					<div class="title">(<span class="hatKod kod"></span>) <span class="hatAdi aciklama"></span></div>
				</div>
				<div class="tezgahlar full-width flex-row"></div>
			</div>`
		)
	}
	static getLayout_tezgah(e) {
		let rec = e?.rec ?? e ?? {}, {tezgahKod} = rec; return $(
			`<div class="tezgah item" data-id="${tezgahKod}">
				<div class="ust ust-alt full-width">
					<div class="flex-row full-width">
						<div class="sol parent">
							<div class="sub-item"><button id="tezgah" aria-disabled="true">TEZ</button></div>
							<div class="sub-item"><button id="personel">PER</button></div>
						</div>
						<div class="sag parent">
							<div class="tezgah-parent sub-item parent flex-row">
								<div class="ka">
									(<span class="tezgahKod kod veri"></span>)
									<span class="tezgahAdi aciklama veri"></span>
								</div>
								<div class="ip-parent parent">
									<span class="etiket">IP</span>
									<span class="ip veri"></span>
								</div>
								<div class="siradakiIsSayi-parent parent">
									<span class="etiket">+</span>
									<span class="siradakiIsSayi veri"></span>
								</div>
								<div class="ekBilgi-parent parent">
									<button class="sil etiket"></button>
									<span class="ekBilgi veri"></span>
								</div>
								<div class="zamanEtuduVarmi-parent parent">
									<span class="zamanEtuduText veri">Zmn.</span>
								</div>
							</div>
							<div class="per-parent sub-item parent flex-row">
								<div class="ka">
									(<span class="perKod kod veri"></span>)
									<span class="perIsim aciklama veri"></span>
								</div>
							</div>
						</div>
					</div>
					<div class="isBilgi-parent"></div>
					<div class="miktarVeGSC parent">
						<div class="flex-row">
							<table class="miktar item">
								<thead><tr>
									<th class="emir">Emir</th>
									<th class="uret">Üret</th>
									<th class="isk">Isk</th>
									<th class="net">Net</th>
								</tr></thead>
								<tbody><tr>
									<td class="emir"><span class="emirMiktar"></span></td>
									<td class="uret"><span class="onceUretMiktar"></span> <span class="aktifUretMiktar-parent ek-bilgi">+<span class="aktifUretMiktar"></span></span></td>
									<td class="isk"><span class="isIskMiktar"></span></td>
									<td class="net"><span class="isNetMiktar"></span></td>
								</tr></tbody>
							</table>
							<table class="gsc item">
								<thead><tr>
									<th class="cevrim">Çevrim</th>
									<th class="sayma">Sayma</th>
								</tr></thead>
								<tbody><tr>
									<td class="cevrim"><span class="onceCevrimSayisi"></span> <span class="aktifCevrimSayisi-parent ek-bilgi">+<span class="aktifCevrimSayisi"></span></td>
									<td class="topSaymaInd-parent sayma"><span class="topSaymaInd ind"></span> <span class="ek-bilgi">/</span> <span class="topSaymaSayisi topSayi"></span></td>
								</tr></tbody>
							</table>
							<div class="aktifIsSayi-parent item"><span class="aktifIsSayi"></span><span class="ek-bilgi"> iş</span></div>
						</div>
					</div>
					<div class="grafik-parent parent"></div>
				</div>
				<div class="alt ust-alt flex-row full-width">
					<div class="flex-row parent full-width">
						<div class="sol item">
							<span class="durumAdi durumText veri full-wh"></span>
							<span class="durNedenAdi nedenText sub-item"></span>
						</div>
						<div class="sag item">
							<button id="makineDurum">MAK</button>
							<button id="tezgahMenu">...</button>
						</div>
					</div>
				</div>
			</div>`
		)
	}
	static getLayout_isBilgileri(e) {
		e = e ?? {}; const _now = now(), rec = e.rec ?? e.inst ?? e, isListe = rec.isListe ?? [], isBilgiItems = [], {sinyalKritik, maxAyrilmaDk} = rec;
		const grafikPart = new GaugeGrafikPart(), colors = grafikPart.colors ?? []; for (let i = 0; i < isListe.length; i++) {
			const is = isListe[i], color = colors[i]; if (!is) { continue }
			const {emirTarih, emirNox, operNo, operAciklama, urunKod, urunAciklama, isSaymaSayisi, isSaymaTekilEnDusukSure, isSaymaToplamEnDusukSure} = is;
			const basZamanTS = is.basZamanTS ? asDate(is.basZamanTS) : null, isToplamBrutSureSn = basZamanTS ? asInteger((_now.getTime() - basZamanTS.getTime()) / 1000) : null;
			const isToplamDuraksamaSureSn = is.isToplamDuraksamaSureSn || 0, isToplamNetSureSn = (isToplamBrutSureSn || 0) - (isToplamDuraksamaSureSn || 0);
			const isToplamBrutSureTS = isToplamBrutSureSn ? new Date(isToplamBrutSureSn * 1000).addHours(-new Date(0).getHours()) : null;
			const isToplamNetSureTS = isToplamNetSureSn ? new Date(isToplamNetSureSn * 1000).addHours(-new Date(0).getHours()) : null;
			let item = (
				`<div class="parent flex-row">
					<div class="color item" style="${color ? `background-color: ${color};` : ''}"> </div>
					<div class="emir item"><div class="emirTarih kod">${dateKisaString(asDate(emirTarih))}</div><div class="emirNox aciklama">${emirNox}</div></div>
					<div class="oper item"><div class="opNo kod">${operNo}</div><div class="opAdi aciklama">${operAciklama}</div></div>
					<div class="urun item"><div class="urunKod kod">${urunKod}</div><div class="urunAdi aciklama">${urunAciklama}</div></div>
					<div class="saymaSayilari item">
					${
						`<span class="ek-bilgi">(</span>` +
						`<span class="saymaSayisi veri">${isSaymaSayisi ?? ''}</span><span class="ek-bilgi">;</span>` +
						`<span class="saymaArasiSure veri">${isSaymaTekilEnDusukSure ?? ''}</span><span class="ek-bilgi">;</span>` +
						`<span class="saymaSonSure veri">${isSaymaToplamEnDusukSure ?? ''}</span>` +
						`<span class="ek-bilgi">)</span>`
					}
					</div>
					<div class="sureler item">
					${
						`<div class="basZamanTS veri">${dateKisaString(basZamanTS) ?? ''}</div>` +
						`<div class="isToplamBrutSureSn veri"><span class="ek-bilgi">Br:</span> ${timeToString(isToplamBrutSureTS, false, false, true) ?? ''}</div>` +
						`<div class="isToplamNetSureTS veri"><span class="ek-bilgi">Nt:</span> ${timeToString(isToplamNetSureTS, false, false, true) ?? ''}</div>` +
						(maxAyrilmaDk ? `<div class="ayrilmaSure veri"><span class="ek-bilgi">As:</span> ${timeToString(new Date(0).clearTime().addMinutes(maxAyrilmaDk), false, false, true) ?? ''}</div>` : '')
						/*(maxAyrilmaDk ? `<div class="ayrilmaSure veri"><span class="ek-bilgi">As:</span> ~${asSaniyeKisaString(maxAyrilmaDk * 60) ?? ''}</div>` : '')*/
					}
					</div>
				<div>`
			); isBilgiItems.push(item)
		}
		const isBilgiHTML = isBilgiItems.map(item => `<li class="sub-item">${item}</li>`).join(CrLf);
		return `<div class="isListe item flex-row"><ol class="parent">${isBilgiHTML}</ol></div>`
	}
	static getLayout_grafikler(e) {
		const isListe = $.isArray(e) ? e : e?.isListe; let part = new GaugeGrafikPart(e);
		return isListe.map(is => part.setValue(is.oee || 0).asHTMLWithIcrement()).join('')
	}
	initLayoutEvents(e) {
		const {divListe} = e; divListe.find('.hat.item > .grup').on('click', ({ currentTarget: target }) => $(target).parent().toggleClass('toggled'));
		divListe.find('.hat.item > .tezgahlar > .tezgah.item').on('click', evt => {
			const { target: innerTarget, currentTarget: target } = evt, {id} = target.dataset, $target = $(target), cssClass = 'selected';
			if ($target.hasClass(cssClass)) { const tagName = innerTarget.tagName.toLowerCase(); if (!(tagName == 'input' || tagName == 'button')) { $target.removeClass(cssClass) } }
			else { $target.toggleClass(cssClass) }
			if (!this.cokluSecimmi) { divListe.find(`.hat.item > .tezgahlar > .tezgah.item.${cssClass}:not([data-id = "${id}"])`).removeClass(cssClass) }
		});
		let elms = divListe.find('button'); if (elms.length) {
			elms.jqxButton({ theme }).on('click', evt => { 
				let cssClass = 'selected'; divListe.find(`.hat.item > .tezgahlar > .tezgah.item.${cssClass}`).removeClass(cssClass);
				$(evt.currentTarget).parents('.tezgah.item').addClass(cssClass); this.tezgahButonTiklandi({ ...e, id: evt.currentTarget.id, evt })
			})
		}
		return this
	}
	boyutlandirIstendi(e) {
		let {boxSize: box} = this, title = 'Boyut Ayarları', wnd, keys = ['rows', 'cols'];
		let content = $(
			`<div class="full-wh">
				<div class="cols scaler item flex-row"><label class="etiket">Kolon Sayı:</label><input class="veri" type="range" min="1" max="13" step="1" value="${box.cols}"></input></div>
				<div class="rows scaler item flex-row"><label class="etiket">Satır Yükseklik:</label><input class="veri" type="range" min="1" max="30" step="1" value="${box.rows}"></input></div>
				
			</div>`
		);
		const close = e => { if (wnd) { wnd.jqxWindow('close'); wnd = null } }, rfb = new RootFormBuilder({ parentPart: this, layout: content }).autoInitLayout();
		const updateLayout = e => { const layout = e.builder?.layout ?? e.layout ?? e; for (const key of keys) { layout.find(`.item.${key} > .veri`).val(box[key]) } }
		const updateUI = e => { e = e ?? {}; setTimeout(() => { this.createLayout(e).updateLayout(e) }, 100) };
		rfb.onAfterRun(({ builder: fbd }) => {
			const {layout} = fbd; for (const key of keys) {
				layout.find(`.item.${key} > .veri`).on('change', ({ currentTarget: target }) => {
					const {value} = target; box[key] = asInteger(value); this.saveGlobalsDefer(); updateUI() })
			}
		}).addStyle(...[
				e => `$elementCSS .item { --etiket-width: 130px; margin-inline-end: 10px; padding: 5px 0 }`,
				e => `$elementCSS .item > .etiket { color: #aaa; width: var(--etiket-width) }`,
				e => `$elementCSS .item > .veri { font-weight: bold; width: calc(var(--full) - (var(--etiket-width) + 10px)) }`
			]);
		const buttons = { 'SIFIRLA': e => {
			this.boxSize = this.globals.boxSize = null;
			box = this.boxSize; this.saveGlobalsDefer(); updateLayout(rfb.layout); updateUI()
		} };
		wnd = createJQXWindow({ content, title, buttons, args: { isModal: false, closeButtonAction: 'close', width: Math.min(600, $(window).width() - 50), height: Math.min(200, $(window).height() - 100) } });
		content = wnd.find('div > .content > .subContent'); rfb.run();
		wnd.on('close', evt => { $('body').removeClass('bg-modal'); wnd.jqxWindow('destroy'); wnd = null /* updateMQUI()*/ }); $('body').addClass('bg-modal')
	}
	tezgahButonTiklandi(e) {
		const {id, evt} = e; switch (id) {
			case 'tezgahMenu': this.tezgahMenuIstendi(e); break
			case 'personelSec': this.personelSecIstendi(e); break;
			case 'makineDurum': this.makineDurumIstendi(e); break;
			case 'topluX': this.topluXMenuIstendi(e); break;
			case 'bekleyenIsEmirleri': this.bekleyenIsEmirleriIstendi(e); break;
			case 'hatBekleyenIsler': this.bekleyenIslerIstendi_hatBazinda(e); break;
			case 'notlar': this.ekNotlarIstendi(e); break;
			case 'notEkle': this.ekNotEkleIstendi(e); break;
			case 'dokumanYukle': this.dokumanYukleIstendi(e); break;
			case 'dokumanSil': this.dokumanSilIstendi(e); break;
			case 'ekBilgiSil': this.ekBilgiSilItendi(e); break;
			default: eConfirm(`<b>${visibleindex + 1}. satırdaki</b> ve <b>${tezgahAdi}</b> tezgahına ait <b>${id}</b> id'li butona tıklandı`)
		}
	}
	siradakiIslerIstendi(e) {
		const {selectedTezgahKodListe: kodListe, tezgah2Rec} = this;
		for (const tezgahKod of kodListe) { MQSiradakiIsler.listeEkraniAc({ args: { tezgahKod, tezgahAdi: tezgah2Rec[tezgahKod]?.tezgahAdi } }) }
	}
	bekleyenIslerIstendi(e) {
		const {selectedTezgahKodListe: kodListe, tezgah2Rec} = this;
		for (const tezgahKod of kodListe) { MQBekleyenIsler.listeEkraniAc({ args: { tezgahKod, tezgahAdi: tezgah2Rec[tezgahKod]?.tezgahAdi } }) }
	}
	async baslatDurdurIstendi(e) {
		const {selectedTezgahKodListe: kodListe, tezgah2Rec} = this; let durNedenKod;
		for (const tezgahKod of kodListe) {
			const {durumKod} = tezgah2Rec[tezgahKod] ?? {};
			if (durumKod == 'DV') {
				if (!durNedenKod) {
					durNedenKod = await new $.Deferred(p => {
						MQDurNeden.listeEkraniAc({
							tekil: true, args: { tezgahKod }, secince: async e => {
								const {sender} = e, {tezgahKod} = sender; if (!tezgahKod) { return false }
								p.resolve(e.value)
							}
						})
					})
				}
				try { await app.wsBaslatDurdur({ tezgahKod, durNedenKod }); this.tazeleBasit() } catch (ex) { hConfirm(getErrorText(ex)) }
			}
			else { try { await app.wsBaslatDurdur({ tezgahKod }); this.tazeleBasit() } catch (ex) { hConfirm(getErrorText(ex)) } }
		}
	}
	personelSecIstendi(e) {
		const {selectedTezgahKodListe: kodListe} = this; return MQPersonel.listeEkraniAc({
			tekil: true, args: { kodListe }, secince: async e => {
				const {sender, value: perKod} = e, {kodListe} = sender; if (!kodListe?.length) { return false }
				try { await app.wsPersonelAta({ tezgahKod: kodListe.join(delimWS), perKod }); this.tazeleBasit() } catch (ex) { hConfirm(getErrorText(ex)) }
			}
		})
	}
	makineDurumIstendi(e) {
		const {selectedTezgahKodListe: kodListe} = this;
		for (const tezgahKod of kodListe) { new MakineYonetimiPart({ tezgahKod }).run() }
	}
	tezgahTasiIstendi(e) {
		const _recs = e.recs ?? this.selectedTezgahRecs; if (!_recs?.length) { return }
		let exclude_hatKod; try {
			for (const {hatKod} of _recs) {
				if (exclude_hatKod && hatKod != exclude_hatKod) { throw { isError: true, errorText: `Taşınacak Tezgah(lar) <u class="bold">Aynı Hat üzerinde</u> olmalıdır` } }
				if (!exclude_hatKod) { exclude_hatKod = hatKod }
			}
			let tekil = true, args = { exclude_hatKod, _recs }, title = `<b class="royalblue">${_recs.length} adet Tezgahı</b> <span class="darkgray">şu Hat'a taşı:</span>`;
			return MQHat.listeEkraniAc({
				tekil, args, title, secince: async e => {
					const {sender} = e, {value: hatKod} = e, tezgahKodListe = sender._recs?.map(rec => rec.tezgahKod); if (!tezgahKodListe?.length) { return }
					const upd = new MQIliskiliUpdate({
						from: 'tekilmakina', where: { inDizi: tezgahKodListe, saha: 'kod' },
						set: [{ degerAta: hatKod, saha: 'ismrkkod' }, `perkod = ''`]
					});
					try {
						await app.sqlExecNone(upd); let promises = [];
						for (const tezgahKod of tezgahKodListe) {
							promises.push(app.wsSiradakiIsler({ tezgahKod }).then(isRecs => {
								const isIdListe = isRecs.map(rec => rec.issayac).join(delimWS);
								return isIdListe?.length ? app.wsSiradanKaldir({ tezgahKod, isIdListe }) : null
							}))
						}
						await Promise.all(promises); this.tazele()
					} catch (ex) { console.error(ex); hConfirm(getErrorText(ex)) }
				}
			})
		}
		catch (ex) { console.error(ex); hConfirm(getErrorText(ex)) }
	}
	siradakiIslerIstendi(e) { e.mfSinif = MQSiradakiIsler; return this.xIslerIstendi(e) }
	bekleyenIslerIstendi(e) { e.tekil = true; e.mfSinif = MQBekleyenIsler; return this.xIslerIstendi(e) }
	bekleyenIslerIstendi_hatBazinda(e) { e.hatBazinda = true; return this.bekleyenIslerIstendi(e) }
	xIslerIstendi(e) {
		const {mfSinif} = e, tekilmi = e.tekil ?? e.tekilmi, hatBazindami = e.hatBazinda ?? e.hatBazindami;
		const recs = e.recs ?? this.selectedTezgahRecs;
		for (const {hatKod, hatAdi, tezgahKod, tezgahAdi} of recs) { const args = { hatKod, hatAdi, tezgahKod, tezgahAdi }; mfSinif.listeEkraniAc({ args }) }
	}
	topluXIstendi(e) {
		let {id} = e, recs = e.recs ?? this.selectedTezgahRecs, hatKodListe = e.hatKodListe ?? $.makeArray(e.hatKod), wsArgs = {};
		if (hatKodListe?.length) { const hatKodSet = asSet(hatKodListe); wsArgs.hatIdListe = hatKodListe.join(delimWS); recs = e.recs = recs.filter(rec => hatKodSet[rec.hatKod]); e.rec = recs[0] }
		const islemKod2Adi = { mola: 'Mola', vardiyaDegisimi: 'Vardiya Değişimi', devam: `<span class="forestgreen">Devam</span>`, isBitti: `<span class="red">İş Bitti</span>`, gerceklemeYap: 'Gerçekleme Yap' };
		const hatBazindami = !!e.hatKod, recsCount = !hatBazindami ? 0 : recs?.length, islemAdi = islemKod2Adi[id] ?? id;
		ehConfirm(`${recsCount ? `<b class="royalblue">${recsCount}</b> tezgah için ` : `<u class="bold">Tüm tezgahlar</u> için `}<b>Toplu ${islemAdi}</b> istendi, devam edilsin mi?`, `Toplu ${islemAdi}`).then(async result => {
			if (!result) { return } try {
				switch (id) {
					case 'devam': await app.wsTopluDevamYap(wsArgs); break
					case 'gerceklemeYap': await app.wsTopluGerceklemeYap(wsArgs); break
					case 'isBitti': await app.wsTopluIsBittiYap(wsArgs); break
					case 'zamanEtuduBaslat': await app.wsTopluZamanEtuduBaslat(wsArgs); break
					case 'zamanEtuduKapat': await app.wsTopluZamanEtuduKapat(wsArgs); break
					default: $.extend(wsArgs, { tip: id }); await app.wsTopluDuraksamaYap(wsArgs); break
				}
				this.tazeleBasit()
			}
			catch (ex) { hConfirm(getErrorText(ex), `Toplu ${islemAdi}`); throw ex }
		})
	}
	ekBilgiIstendi(e) {
		const rec = this.selectedTezgahRecs[0]; if (rec) {
			let {tezgahKod, tezgahAdi} = rec, wnd = createJQXWindow({
				content: `<code><pre class="full-width bold" style="font-size: 110%; color: lightgreen !important; background: linear-gradient(270deg, #333 5%, #444 80%) !important; line-height: 22px !important">${toJSONStr(rec, ' ')}</pre></code>`,
				title: `Tezgah Ham Verisi &nbsp;[<u class="bold ghostwhite">${tezgahKod}</u> - <span class="bold white">${tezgahAdi}</span>]`,
				args: { isModal: false, width: Math.min(700, $(window).width() - 50), height: '97%' }
			}); wnd.addClass('ekBilgi')
		}
	}
	ozetBilgiGoster(e) {
		let html = this.ozetBilgi_getLayout(e); if (!html) { return }
		const {classKey} = this, wnd = createJQXWindow({
			content: `<div class="full-width ozetBilgi-parent ozetBilgi">${html}</code></div>`,
			title: `Özet Bilgi`, args: { isModal: false, width: Math.min(850, $(window).width() - 50), height: Math.min(500, $(window).height() - 50) }
		}); wnd.addClass(`ozetBilgi ${classKey} masterListe part`); makeScrollable(wnd.find('.jqx-window-content'))
	}
	updateOzetBilgi(e) {
		let html = this.ozetBilgi_getLayout(e); if (!html) { return }
		let {classKey} = this, wndSelector = `.jqx-window.ozetBilgi.${classKey}`, wnd = $(wndSelector); if (!wnd.length) { return }
		let layout = wnd.find('.jqx-window-content > .subContent > .ozetBilgi-parent'); if (!layout?.length) { return }
		layout.html(html)
	}
	ozetBilgi_getLayout(e) {
		const recs = e.recs ?? this.tezgahRecs; if (!recs) { return null }
		const hat2Durum2Sayi = {}, durNeden2TezgahKod = {}; let topMakineSayi = 0, topAktifSayi = 0, topPasifSayi = 0, topOffSayi = 0;
		for (let {hatKod: hatText, tezgahKod, sinyalKritik, durumKod, durNedenAdi} of recs) {
			let orjDurumKod = durumKod; if (durumKod == 'DV') { durumKod = sinyalKritik ? 'APSF' : 'ZON' } else { durumKod = 'XOFF' }
			let durum2Sayi = hat2Durum2Sayi[hatText]; if (durum2Sayi == null) { durum2Sayi = hat2Durum2Sayi[hatText] = {}; for (const key of ['ZON', 'APSF', 'XOFF']) { durum2Sayi[key] = 0 } }
			durum2Sayi[durumKod] = (durum2Sayi[durumKod] || 0) + 1; topMakineSayi++;
			if (durumKod == 'ZON') { topAktifSayi++ } else if (durumKod == 'APSF') { topPasifSayi++ } else { topOffSayi++ }
			if (orjDurumKod == 'DR') { (durNeden2TezgahKod[durNedenAdi] = durNeden2TezgahKod[durNedenAdi] ?? []).push(tezgahKod) }
		}
		let textList = []; for (const [hat, durum2Sayi] of Object.entries(hat2Durum2Sayi)) {
			let text = `<li class="item"><span class="etiket sub-item">${hat}:</span> `;
			for (let durumKod of Object.keys(durum2Sayi).sort().reverse()) {
				const sayi = durum2Sayi[durumKod], durumText = durumKod == 'ZON' ? 'ON' : durumKod == 'APSF' ? 'PSF' : 'OFF';
				text += `<span class="sub-item ${durumKod == 'ZON' ? 'on' : durumKod == 'APSF' ? 'pasif' : 'off'}">[<span class="durum">${durumText} = </span><span class="sayi">${sayi}</span>]</span>`
			}
			text += `</li>`; textList.push(text)
		}
		const verimlilik = roundToFra(topAktifSayi / topMakineSayi * 100, 1);
		textList.push(
			`<div class="ek-satirlar flex-row">
				<li class="item">
					<div><span class="etiket sub-item highlight">Top. Makine &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span> <span class="sayi sub-item">${numberToString(topMakineSayi)}</span></div>
					<div><span class="etiket sub-item highlight">Mak. Verimlilik </span> <span class="sayi sub-item">%${numberToString(verimlilik)}</span></div>
				</li>
				<li class="item">
					<div class="on"><span class="etiket highlight sub-item">Aktif Makine</span> <span class="sayi sub-item">${numberToString(topAktifSayi)}</span></div>
					<div class="off"><span class="etiket highlight sub-item">Off &nbsp;Makine </span> <span class="sayi sub-item">${numberToString(topOffSayi)}</span></div>
					<div class="pasif"><span class="etiket highlight sub-item">Pasif Makine </span> <span class="sayi sub-item">${numberToString(topPasifSayi)}</span></div>
				</li>
			</div>`
		);
		let ekTextList = []; if (!$.isEmptyObject(durNeden2TezgahKod)) {
			ekTextList.push(`<table class="durNedenleri" cellpadding="3"><tr class="header"><th width="150">Dur. Neden</th><th>Sayı</th></tr>`);
			for (const [neden, kodListe] of Object.entries(durNeden2TezgahKod)) { ekTextList.push(`<tr class="data"><td>${neden}</td><td>${kodListe.length}</td></tr>`) }
			ekTextList.push(`</table>`)
		}
		return `<ul class="text ozetBilgi-container ozetBilgi">${textList?.length ? textList.join(' ') : ''}</ul>${ekTextList.length ? ekTextList.join(CrLf) : ''}`
	}
	bekleyenIsEmirleriIstendi(e) {
		const {hatKod} = (e.rec ?? this.selectedTezgahRecs[0]) ?? {}; if (!hatKod) { return }
		let args = { hatKod }; MQBekleyenIsEmirleri.listeEkraniAc({ args })
	}
	ekNotlarIstendi(e) {
		const hepsimi = e.hepsi ?? e.hepsimi, rec = e.rec ?? this.selectedTezgahRecs[0] ?? {}; const {hatKod} = rec;
		MQEkNotlar.listeEkraniAc({ kapaninca: e => this.tazeleBasit(), secimlerDuzenle: e => {
			const sec = e.secimler, isHidden = !!app.params.config.hatKod;
			if (!hepsimi && hatKod) { $.extend(sec.hatKod, { birKismimi: true, value: hatKod, isHidden }); sec.hatAdi.isHidden = isHidden }
		}})
	}
	ekNotEkleIstendi(e) {
		const rec = e.rec ?? this.selectedTezgahRecs[0], hatKod = rec.hatKod ?? '', tezgahKod = rec.tezgahKod ?? ''; if (!(hatKod || tezgahKod)) { return }
		let inst = new MQEkNotlar({ hatKod, tezgahKod }); return inst.tanimla({ islem: 'yeni' })
	}
	dokumanYukleIstendi(e) {
		e = e || {}; const rec = e.rec ?? this.selectedTezgahRecs[0] ?? {}, hatKod = rec.hatKod ?? ''; if (!hatKod) { return }
		const resimId = `hat-${hatKod}-01`, islemAdi = 'Hat Resim Yükleme';
		let elm = $(`<input type="file" capture="environment" accept="image/*, application/pdf, video/*">`).appendTo('body'); elm.addClass('jqx-hidden');
		elm.on('change', async evt => {
			try {
				const file = evt.target.files[0]; let fileName = file.name.replaceAll(' ', '_'), ext = fileName.split('.').slice(-1)[0] ?? '';
				let data = file ? new Uint8Array(await file.arrayBuffer()) : null; if (!data?.length) { return }
				let result = await app.wsResimDataKaydet({ resimId, ext, data }); if (!result.result) { throw { isError: true, errorText: `${islemAdi} sorunu` } }
				gridPart.tazeleDefer(e); setTimeout(() => eConfirm(`Hat Resim Görüntüsünün güncellenmesi için uygulamadan çıkıp yeniden girilmesi gerekebilir`, islemAdi))
			} finally { $(evt.target).remove() }
		});
		elm.click()
	}
	async dokumanSilIstendi(e) {
		e = e || {}; const rec = e.rec ?? this.selectedTezgahRecs[0] ?? {}, hatKod = rec.hatKod ?? ''; if (!hatKod) { return }
		const resimId = `hat-${hatKod}`, islemAdi = `<b color="indianred">Resim SİL</b>`;
		let rdlg = await ehConfirm(`<b class="royalblue">${hatKod}</b><b class="indianred"> hattına ait Resim silinecek, emin misiniz?</b>`, islemAdi); if (!rdlg) { return }
		const result = await app.wsResimDataSil({ resimId }); if (!result.result) { throw { isError: true, errorText: `${islemAdi} sorunu` } }
		this.tazele(e); setTimeout(() => eConfirm(`Hat Resim Görüntüsünün güncellenmesi için uygulamadan çıkıp yeniden girilmesi gerekebilir`, islemAdi))
	}
	async ekBilgiSilItendi(e) {
		const recs = e.recs ?? this.selectedTezgahRecs; if (!recs?.length) { return } const tezgahIdListe = recs.map(rec => rec.tezgahKod);
		try { await app.wsEkBilgiTopluSifirla({ tezgahIdListe }); this.tazeleBasit() }
		catch (ex) { console.error(ex); hConfirm(getErrorText(ex)) }
	}
	tezgahMenuIstendi(e) {
		const topluMenumu = e.id == 'tezgahMenu'; if (topluMenumu) { e.title = 'Seçilen tezgah(lar) için:' }
		$.extend(e, { formDuzenleyici: _e => {
			_e = { ...e, ..._e }; const {form, close} = _e; form.yanYana(2);
			form.addButton('siradakiIsler', undefined, 'Sıradaki İşler').onClick(() => { close(); this.siradakiIslerIstendi(_e) });
			form.addButton('bekleyenIsler', undefined, 'Bekleyen İşler').onClick(() => { close(); this.bekleyenIslerIstendi(_e) });
			if (topluMenumu) {
				form.addButton('makineDurum', undefined, 'Makine Durum').onClick(() => { close(); this.makineDurumIstendi(_e) })
				/*form.addButton('personelSec', undefined, 'Personel Ata').onClick(() => { close(); this.personelSecIstendi(_e) })*/
			}
			form.addButton('tezgahTasi', undefined, 'Tezgah Taşı').onClick(() => { close(); this.tezgahTasiIstendi(_e) });
			form.addButton('ekBilgi', undefined, 'Ek Bilgi').onClick(() => { close(); this.ekBilgiIstendi(_e) })
		} }); this.openContextMenu(e)
	}
	bekleyenXMenuIstendi(e) {
		$.extend(e, { formDuzenleyici: _e => {
			_e = { ...e, ..._e }; const {form, close} = _e; form.yanYana(2);
			form.addButton('isEmirleri', undefined, 'İş Emirleri').onClick(() => { close(); this.bekleyenIsEmirleriIstendi(_e) });
			form.addButton('hatBekleyenIsler', undefined, 'Bekleyen İşler (HAT)').onClick(() => { close(); _e.hatBazinda = true; this.bekleyenIslerIstendi_hatBazinda(_e) })
		} }); this.openContextMenu(e)
	}
	topluXMenuIstendi(e) {
		e = e || {}; const {selectedTezgahRecs: recs} = e, rec = recs?.[0], {sabitHatKodVarmi} = app, hatKod = e.hatKod = e.hatKod ?? rec?.hatKod;
		$.extend(e, { noCheck: true, formDuzenleyici: _e => {
			_e = { ...e, ..._e }; const {form, close} = _e; form.yanYana(2);
			form.addButton('mola', undefined, 'Mola').onClick(e => { close(); this.topluXIstendi($.extend({}, _e, e, { id: e.builder.id })) });
			form.addButton('vardiyaDegisimi', undefined, 'Vardiya Değişimi').onClick(e => { close(); this.topluXIstendi($.extend({}, _e, e, { id: e.builder.id })) });
			if (!sabitHatKodVarmi || hatKod) {
				if (config.dev) { form.addButton('devam', undefined, 'Toplu Devam').onClick(e => { close(); this.topluXIstendi($.extend({}, _e, e, { id: e.builder.id })) }) }
				form.addButton('isBitti', undefined, 'İş Bitti').onClick(e => { close(); this.topluXIstendi($.extend({}, _e, e, { id: e.builder.id })) });
				form.addButton('gerceklemeYap', undefined, 'Gerçekleme Yap').onClick(e => { close(); this.topluXIstendi($.extend({}, _e, e, { id: e.builder.id })) });
				form.addButton('zamanEtuduBaslat', undefined, 'Zaman Etüdü Başlat').onClick(e => { close(); this.topluXIstendi($.extend({}, _e, e, { id: e.builder.id })) });
				form.addButton('zamanEtuduKapat', undefined, 'Zaman Etüdü Kapat').onClick(e => { close(); this.topluXIstendi($.extend({}, _e, e, { id: e.builder.id })) })
			}
			/*form.addButton('topluEkNotlar', undefined, 'Tüm Notlar').onClick(e => { close(); this.ekNotlarIstendi($.extend({}, _e, e, { id: e.builder.id, hepsi: true })) })
			form.addButton('ozetBilgi', undefined, 'Özet Bilgi').onClick(e => { close(); this.ozetBilgiGoster($.extend({}, _e, e, { id: e.builder.id })) })*/
		} }); this.openContextMenu(e)
	}
	openContextMenu(e) {
		let noCheckFlag = e.noCheck ?? e.noCheckFlag, {title} = e, recs = e.recs = e.recs ?? this.selectedTezgahRecs, rec = recs?.[0]; if (!(noCheckFlag || rec)) { return }
		title = e.title = title ?? `<b class="cyan">(${rec?.tezgahKod || ''})</b> ${rec?.tezgahAdi || ''}${recs?.length > 1 ? ` <b class="cadetblue">(+ ${recs.length - 1})</b>` : ''}`;
		return MFListeOrtakPart.openContextMenu(e)
	}
	tekil() { this.cokluSecimmi = false; return this } coklu() { this.cokluSecimmi = true; return this }
}
