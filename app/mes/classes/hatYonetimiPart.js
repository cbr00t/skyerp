class HatYonetimiPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isWindowPart() { return true } static get partName() { return 'hatYonetimi' } static get sinifAdi() { return 'Hat Yönetimi' }
	get boxSize() {
		let result = this._boxSize; if (!result) {
			const {globals} = this;
			result = this._boxSize = globals.boxSize = globals.boxSize ?? { rows: 15, cols: 5 }
		}
		return result
	}
	set boxSize(value) { this._boxSize = $.isEmptyObject(value) ? null : value }
	get selectedTezgahElmListe() { return this.divListe.find('.tezgah.item.selected') }
	get selectedTezgahKodListe() { return $.makeArray(this.selectedTezgahElmListe).map(elm => elm.dataset.id) }
	get selectedTezgahRecs() { const {tezgah2Rec, selectedTezgahKodListe} = this; return selectedTezgahKodListe.map(kod => tezgah2Rec[kod]) }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			tezgahKod: (e.tezgahKod ?? e.tezgahId)?.trimEnd(), cokluSecimmi: e.cokluSecim ?? e.cokluSecimmi ?? false,
			boxSize: e.boxSize, title: 'Hat Yönetimi 2' })
	}
	init(e) {
		e = e || {}; super.init(e); const {layout} = this;
		const header = this.header = layout.children('.header'), subContent = this.subContent = layout.children('.content');
		const divListe = this.divListe = subContent.children('.liste')
	}
	run(e) {
		e = e || {}; super.run(e); const {layout} = this, builder = this.builder = this.getRootFormBuilder(e);
		if (builder) { const {inst} = this; $.extend(builder, { part: this, inst }); builder.autoInitLayout().run(e) }
		this.tazele(e)
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
		const rfb = new RootFormBuilder(), {header, divListe} = this;
		rfb.addIslemTuslari('islemTuslari').setParent(header).addStyle_fullWH().addCSS('islemTuslari')
			.onAfterRun(({ builder: fbd }) => { const {id, rootPart, input} = fbd; rootPart.islemTuslari = input })
			.setButonlarIlk([
				{ id: 'boyut', text: 'BYT', handler: e => this.boyutlandirIstendi(e) },
				{ id: 'tazele', handler: e => this.tazele(e) },
				{ id: 'vazgec', handler: e => this.close(e) }
			])
			.setEkSagButonlar('boyut');
		return rfb
	}
	tazeleBasit(e) { return this.tazele({ ...e, basit: true }) }
	tazeleWithSignal() { app.signalChange(); return this }
	onSignalChange(e) { this.tazeleBasit(e); return this }
	async tazele(e) {
		e = e ?? {}; let basitmi = e.basit ?? e.basitmi;
		try {
			let recs = this.tezgahRecs = await this.loadServerData(e); if (!recs) { return this }
			let hat2Sev = this.hat2Sev = {}, tezgah2Rec = this.tezgah2Rec = {}; for (const rec of recs) {
				const {hatKod, tezgahKod} = rec; let sev = hat2Sev[hatKod];
				if (!sev) { const {hatAdi, grupText} = rec, detaylar = []; hat2Sev[hatKod] = sev = { hatKod, hatAdi, grupText, detaylar } }
				sev.detaylar.push(rec); tezgah2Rec[tezgahKod] = rec
			}
			let {_lastTezgahRecs: lastRecs} = this; if (basitmi && !(lastRecs && lastRecs.length == recs.length)) { basitmi = false }
			if (!basitmi) { this.createLayout(e) } this.updateLayout(e)
			this._lastTezgahRecs = lastRecs = recs
		}
		catch (ex) { hConfirm(getErrorText(ex)); throw ex }
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
		e = e ?? {}; let basitmi = e.basit ?? e.basitmi, {islemTuslari} = this;
		let tezgah2Rec = {}, isID2TezgahKodSet = {}, hatIdListe = app.sabitHatKodVarmi ? app.sabitHatKodListe : $.makeArray(this.hatKod), {excludeTezgahKod} = this;
		let wsArgs = {}; if (hatIdListe?.length) { $.extend(wsArgs, { hatIdListe: hatIdListe.join(delimWS) }) }
		let recs = await app.wsTezgahBilgileri(wsArgs); if (recs) {
			const {durumKod2KisaAdi, hatBilgi_recDonusum: donusum} = app;
			for (const rec of recs) {
				for (const [key, newKey] of Object.entries(donusum)) { if (rec[newKey] == null) { rec[newKey] = rec[key]?.trimEnd(); delete rec[key] } }
				let {durumKod, durumAdi} = rec; if (durumKod != null) {
					durumKod = rec.durumKod = durumKod.trimEnd();
					if (rec.durumAdi == null) { rec.durumAdi = durumKod2KisaAdi[durumKod] ?? durumKod }
				}
			}
			const getIPNum = ip => asInteger(ip.replaceAll('.', ''));
			recs.sort((a, b) =>
				a.hatKod < b.hatKod ? -1 : a.hatKod > b.hatKod ? 1 :
				getIPNum(a.ip) < getIPNum(b.ip) ? -1 : getIPNum(a.ip) > getIPNum(b.ip) ? 1 :
				a.tezgahKod < b.tezgahKod ? -1 : a.tezgahKod > b.tezgahKod ? 1 :
				0)
		}
		if (recs) {
			let _recs = recs; recs = [];
			for (let rec of _recs) {
				let {hatKod, tezgahKod, isID} = rec; if (excludeTezgahKod && tezgahKod == excludeTezgahKod) { continue }
				let tezgahRec = tezgah2Rec[tezgahKod] ?? $.extend({}, rec), {isListe} = tezgahRec;
				if (!tezgah2Rec[tezgahKod]) { tezgah2Rec[tezgahKod] = tezgahRec; recs.push(tezgahRec); isListe = tezgahRec.isListe = [] }
				let isSaymaInd = tezgahRec.isSaymaInd || 0, isSaymaSayisi = rec.isSaymaSayisi || 0, defSayi = isID ? 1 : 0;
				$.extend(tezgahRec, { isSaymaInd: isSaymaInd + isSaymaInd, isSaymaSayisi: isSaymaSayisi + (isSaymaSayisi || defSayi) });
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
				const {hatKod, hatAdi} = rec, styles_bgImg_url = [], imageInfos = [ { align: 'left' }, { align: 'center', postfix: '-01' }, { align: 'right', postfix: '-02' } ];
				for (const {align, postfix} of imageInfos) {
					let id = `hat-${hatKod}`; if (postfix) { id += postfix } const url = `${app.getWSUrlBase()}/stokResim/?id=${id}`;
					styles_bgImg_url.push(`url(${url}) ${align} center no-repeat`)
				}
				const styles_bgImg_size = styles_bgImg_url.map(x => 'contain'), styles_bgImg = [`background: ${styles_bgImg_url.join(', ')}`, `background-size: ${styles_bgImg_size.join(', ')}`];
				/* styles_bgImg.push(`mix-blend-mode: difference`) */
				rec.grupText = `<div class="grid-cell-group" style="${styles_bgImg.join('; ')}"><div style="mix-blend-mode: plus-lighter"><b>(${rec.hatKod})</b> ${rec.hatAdi}</div></div>`
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
		let parent = $(document.createDocumentFragment());
		for (const {hatKod, hatAdi, grupText, detaylar} of Object.values(hat2Sev)) {
			let itemHat = $(
				`<div class="hat item full-width" data-id="${hatKod}"">
					<div class="grup">
						<div class="title">(<span class="hatKod kod">${hatKod}</span>) <span class="hatAdi aciklama">${hatAdi}</span></div>
					</div>
					<div class="tezgahlar full-width flex-row"></div>
				</div>`), itemTezgahlar = itemHat.children('.tezgahlar');
			for (const rec of detaylar) {
				let {tezgahKod} = rec, itemTezgah = $(
					`<div class="tezgah item flex-row" data-id="${tezgahKod}">
						<div class="sol parent">
							<div class="sub-item"><button id="tezgah" aria-disabled="true">TEZ</button></div>
							<div class="sub-item"><button id="personel">PER</button></div>
						</div>
						<div class="orta parent">
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
					</div>`
				); itemTezgah.appendTo(itemTezgahlar)
			} itemHat.appendTo(parent)
		}
		divListe.children().remove(); parent.appendTo(divListe);
		divListe.find('.hat.item > .grup').on('click', ({ currentTarget: target }) => $(target).parent().toggleClass('toggled'));
		divListe.find('.hat.item > .tezgahlar > .tezgah.item').on('click', ({ currentTarget: target }) => {
			const {id} = target.dataset, $target = $(target), cssClass = 'selected'; $target.toggleClass(cssClass);
			if (!this.cokluSecimmi) { divListe.find(`.hat.item > .tezgahlar > .tezgah.item.${cssClass}:not([data-id = "${id}"])`).removeClass(cssClass) }
		});
		divListe.find('button').jqxButton({ theme }).on('click', evt => this.tezgahButonTiklandi({ ...e, id: evt.currentTarget.id, evt }));
		makeScrollable(this.subContent); return this
	}
	updateLayout(e) {
		e = e ?? {}; const {layout, boxSize: box} = this; for (const [key, value] of Object.entries(box)) { layout.css(`--box-${key}`, `${value}`) }
		const {hat2Sev: hat2Sev, divListe} = this; if (!hat2Sev) { return this }
		const setHTMLValues = (parent, rec, ...keys) => {
			if (!parent?.length) { return } keys = keys?.flat();
			for (const key of keys) {
				let value = rec[key] ?? ''; let elm = parent.find(`.${key}`); if (elm.length) { elm.html(value) }
				elm = parent.find(`.${key}-parent`); if (elm.length) { elm[value ? 'removeClass' : 'addClass']('jqx-hidden') }
			}
		};
		for (const sev of Object.values(hat2Sev)) {
			let {hatKod, detaylar} = sev, itemHat = divListe.find(`.hat.item[data-id = "${hatKod}"]`); if (!itemHat?.length) { continue }
			let elm = itemHat.find('.grup > .title'); setHTMLValues(itemHat, sev, 'hatKod', 'hatAdi');
			for (const rec of detaylar) {
				let {tezgahKod} = rec, itemTezgah = itemHat.find(`.tezgah.item[data-id = "${tezgahKod}"]`); if (!itemTezgah.length) { continue }
				setHTMLValues(itemTezgah, rec, 'tezgahKod', 'tezgahAdi', 'ip', 'siradakiIsSayi', 'ekBilgi', 'zamanEtuduVarmi', 'perKod', 'perIsim')
 			}
		}
		return this
	}
	getLayout_tblOEMBilgileri(e) {
		e = e ?? {}; const inst = e.rec = e.rec ?? e.inst ?? {}, isListe = inst.isListe ?? [], isBilgiHTML = MQHatYonetimi.gridCell_getLayout_isBilgileri(e);
		const {sinyalKritik, duraksamaKritik, durNedenKod, durumKod, durumAdi, ip, siradakiIsSayi} = inst, {kritikDurNedenKodSet} = app.params.mes;
		const kritikDurNedenmi = kritikDurNedenKodSet && durNedenKod ? kritikDurNedenKodSet[durNedenKod] : false, bostami = !durumKod || durumKod == '?' || durumKod == 'KP' || durumKod == 'BK';
		let topSaymaInd = 0, topSaymaSayisi = 0; for (const is of isListe) { topSaymaInd += (is.isSaymaInd || 0); topSaymaSayisi += (is.isSaymaSayisi || 0) }
		return (
			`<table id="oemBilgileri" class="${sinyalKritik ? ' sinyal-kritik' : ''}${duraksamaKritik && kritikDurNedenmi ? ' duraksama-kritik' : ''}${kritikDurNedenmi ? ' kritik-durNeden' : ''}"><tbody>
				<tr class="hat">
					<td class="buttons item"><button id="hatSec" aria-disabled="true">HAT</button></td>
					<td class="veri item" colspan="2"><span class="kod">${inst.hatKod || ''}</span> <span class="adi">${inst.hatAdi || ''}</span></td>
				</tr>
				<tr class="tezgahVeIsSayi">
					<td class="buttons item">
						<button id="isAtaKaldir">İŞ ATA</button>
						<button id="isBitti" class="${bostami ? '' : `bold darkred`}"${bostami ? ` aria-disabled="true"` : ''}>İŞ BİTTİ</button>
					</td>
					<td class=" tezgah veri item">
						<span class="kod">${inst.tezgahKod || ''}</span> <span class="adi">${inst.tezgahAdi || ''}</span>
						${ip ? `<span class="ip">(${ip ||''})</span>` : ''}
					</td>
					<td class="siradakiIsSayi item">${siradakiIsSayi ? `<span>+ </span><span class="veri">${siradakiIsSayi}</span>` : ''}</td>
				</tr>
				<tr class="personel">
					<td class="buttons item"><button id="personelSec"${bostami ? ` aria-disabled="true"` : ''}>PER</button></td>
					<td class="veri item" colspan="2"><span class="kod">${inst.perKod || ''}</span> <span class="adi">${inst.perIsim || ''}</span></td>
				</tr>
				<tr class="miktarVeGSC">
					<td class="buttons item">
						<button id="cevrimYap"${bostami ? ` aria-disabled="true"` : ''}>[ +1 ]</button>
						<button id="saymaYap"${bostami ? ` aria-disabled="true"` : ''}>Sinyal</button>
						<button id="gerceklemeYap">GER</button>
					</td>
					<td class="veri item" colspan="2">
						<div class="flex-row">
							<table class="miktar sub-item">
								<thead><tr>
									<th class="emir">Emir</th>
									<th class="uret">Üret</th>
									<th class="isk">Isk</th>
									<th class="net">Net</th>
								</tr></thead>
								<tbody><tr>
									<td class="emir">${toStringWithFra(inst.emirMiktar || 0)}</td>
									<td class="uret">${toStringWithFra(inst.onceUretMiktar || 0)} <span class="ek-bilgi">+${toStringWithFra(inst.aktifUretMiktar || 0)}</span></td>
									<td class="isk">${toStringWithFra(inst.isIskMiktar || 0)}</td>
									<td class="net">${toStringWithFra(inst.isNetMiktar || 0)}</td>
								</tr></tbody>
							</table>
							<table class="miktar sub-item">
								<thead><tr>
									<th class="cevrim"><button id="cevrimYap">Çevrim</button></th>
									<th class="sayma"><button id="saymaYap">Sayma</button></th>
								</tr></thead>
								<tbody><tr>
									<td class="cevrim">${toStringWithFra(inst.onceCevrimSayisi || 0)} <span class="ek-bilgi">+${toStringWithFra(inst.aktifCevrimSayisi || 0)}</td>
									<td class="sayma"><span class="ind">${toStringWithFra(topSaymaInd || 0)}</span> <span class="ek-bilgi">/</span> <span class="topSayi">${toStringWithFra(topSaymaSayisi || 0)}</span></td>
								</tr></tbody>
							</table>
							<table class="isSayilari sub-item">
								<thead><tr>
									<th class="aktifIs"><button id="isAtaKaldir">Aktif İş</button></th>
									<th class="siradakiIs"><button id="siradakiIsler">Sıradaki İş</button></th>
								</tr></thead>
								<tbody><tr>
									<td class="aktifIs"><span class="veri">${isListe?.length || 0}</div><span class="ek-bilgi"> iş</span></td>
									<td class="siradakiIs"><span class="veri">${siradakiIsSayi || 0}</div><span class="ek-bilgi"> iş</span></td>
								</tr></tbody>
							</table>
						</div>
					</td>
				</tr>
				<tr class="isBilgileri"><td class="item" colspan="3">${isBilgiHTML}</td></tr>
				<tr class="separator" style="height: 30px"><td colspan="3"> </td></tr>
				<tr class="durum-parent">
					<td class="buttons item"><button id="baslatDurdur">${durumKod == 'DV' ? '||' : '|&gt;'}</button></td>
					<td class="veri item flex-row" colspan="2" data-durum="${durumKod || ''}">
						<span class="durumText sub-item">${durumAdi}</span>
						<span class="nedenText sub-item">${durumKod == 'DR' ? inst.durNedenAdi || '' : ''}</span>
					</td>
					<td class="grafikler"><div class="grafik-parent parent">${MQHatYonetimi.getLayout_grafikler({ isListe })}</div></td>
				</tr>
			</tbody></table>`
		)
	}
	initEvents_tblOEMBilgileri(e) {
		const {layout} = e, buttons = layout.find(`td button`).jqxButton({ theme });
		if (buttons?.length) {
			buttons.off('click').on('click', evt => {
				const elm = evt.currentTarget, id = elm.id, parentId = $(elm).parents('td')[0].id;
				this.tblOEMBilgileri_butonTiklandi($.extend({}, e, { event: evt, id, parentId }))
			})
		}
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
	tezgahButonTiklandi(e) { const {id, evt} = e }
	tblOEMBilgileri_butonTiklandi(e) {
		const {id, event: evt} = e, target = evt?.currentTarget; switch (id) {
			case 'isAtaKaldir': case 'siradakiIsler': this.isAtaKaldirIstendi(e); break
			case 'personelSec': this.personelSecIstendi(e); break
			case 'baslatDurdur': this.baslatDurdurIstendi(e); break
			case 'gerceklemeYap': this.gerceklemeYapIstendi(e); break
			case 'saymaYap': this.saymaYapIstendi(e); break
			case 'cevrimYap': this.cevrimYapIstendi(e); break
			case 'iptal': this.iptalIstendi(e); break
			case 'isBitti': this.isBittiIstendi(e); break
		}
	}
	isAtaKaldirIstendi(e) { const {tezgahKod, tezgahAdi} = this.inst; return MQSiradakiIsler.listeEkraniAc({ args: { tezgahKod, tezgahAdi } }) }
	baslatDurdurIstendi(e) {
		const {inst} = this, {tezgahKod, durumKod} = inst;
		if (durumKod == 'DV') {
			return MQDurNeden.listeEkraniAc({
				tekil: true, args: { tezgahKod }, secince: async e => {
					const {sender} = e, {tezgahKod} = sender; if (!tezgahKod) { return false }
					const durNedenKod = e.value; try { await app.wsBaslatDurdur({ tezgahKod, durNedenKod }); this.tazeleWithSignal() } catch (ex) { hConfirm(getErrorText(ex)) }
				}
			})
		}
		else { (async () => { try { await app.wsBaslatDurdur({ tezgahKod }); this.tazeleWithSignal() } catch (ex) { hConfirm(getErrorText(ex)) } })() }
	}
	personelSecIstendi(e) {
		const {tezgahKod} = this.inst; return MQPersonel.listeEkraniAc({
			tekil: true, args: { tezgahKod }, secince: async e => {
				const {sender} = e, {tezgahKod} = sender; if (!tezgahKod) { return false }
				const perKod = e.value; try { await app.wsPersonelAta({ tezgahKod, perKod }); this.tazeleWithSignal() } catch (ex) { hConfirm(getErrorText(ex)) }
			}
		})
	}
	gerceklemeYapIstendi(e) { return this.gcsYapIstendi($.extend({}, e, { api: 'wsGerceklemeYap' })) }
	cevrimYapIstendi(e) { return this.gcsYapIstendi($.extend({}, e, { api: 'wsCevrimArttir' })) }
	saymaYapIstendi(e) { return this.gcsYapIstendi($.extend({}, e, { api: 'wsKesmeYap' })) }
	tersKesmeIstendi_begin(e) { this._tersKesme_startTS = now() }
	tersKesmeIstendi_end(e) { return this.gcsYapIstendi($.extend({}, e, { api: 'wsTersKesmeYap', delayMS: (now - this._tersKesme_startTS).getTime() })); delete this._tersKesme_startTS }
	gcsYapIstendi(e) { const {tezgahKod} = this.inst, {api} = e; (app[api])({ tezgahKod }).then(() => this.tazeleWithSignal()).catch(ex => { hConfirm(getErrorText(ex)); console.error(ex) }) }
	async isBittiIstendi(e) {
		let rdlg = await ehConfirm(`Makine için <b class="darkred">İş Bitti</b> yapılacak, devam edilsin mi?`, this.title); if (!rdlg) { return }
		const {tezgahKod} = this.inst; try { await app.wsIsBittiYap({ tezgahKod }); this.tazeleWithSignal() } catch(ex) { hConfirm(getErrorText(ex)); console.error(ex) }
	}
	tekil() { this.cokluSecimmi = false; return this } coklu() { this.cokluSecimmi = true; return this }
}
