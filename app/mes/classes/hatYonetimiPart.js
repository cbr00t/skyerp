class HatYonetimiPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isWindowPart() { return true } static get partName() { return 'hatYonetimi' } static get sinifAdi() { return 'Hat Yönetimi' }
	get boxSize() {
		let result = this._boxSize; if (!result) {
			const {globals} = this;
			result = this._boxSize = globals.boxSize = globals.boxSize ?? { rows: 10, cols: 5 }
		}
		return result
	}
	set boxSize(value) { this._boxSize = $.isEmptyObject(value) ? null : value }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			tezgahKod: (e.tezgahKod ?? e.tezgahId)?.trimEnd(), boxSize: e.boxSize, title: 'Hat Yönetimi 2' })
	}
	init(e) {
		e = e || {}; super.init(e); const {layout} = this;
		const header = this.header = layout.children('.header'), islemTuslari = this.islemTuslari = header.children('.islemTuslari');
		const subContent = this.subContent = layout.children('.content'), divListe = this.divListe = subContent.children('.liste')
	}
	run(e) {
		e = e || {}; super.run(e); const {layout} = this;
		const builder = this.builder = this.getRootFormBuilder(e); if (builder) { const {inst} = this; $.extend(builder, { part: this, inst }); builder.autoInitLayout().run(e) }
		this.tazele(e)
	}
	destroyPart(e) { super.destroyPart(e) }
	activated(e) { super.activated(e); this.tazeleBasit(e) }
	tazeleBasit(e) { return this.tazele({ ...e, basit: true }) }
	tazeleWithSignal() { app.signalChange(); return this }
	onSignalChange(e) { this.tazele(e); return this }
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
		let tezgahKod2Rec = {}, isID2TezgahKodSet = {}, hatKod = app.sabitHatKod || this.hatKod, {excludeTezgahKod} = this;
		let wsArgs = {}; if (hatKod) { wsArgs.hatIdListe = hatKod } let recs = await app.wsTezgahBilgileri(wsArgs);
		if (recs) {
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
				let tezgahRec = tezgahKod2Rec[tezgahKod] ?? $.extend({}, rec), {isListe} = tezgahRec;
				if (!tezgahKod2Rec[tezgahKod]) { tezgahKod2Rec[tezgahKod] = tezgahRec; recs.push(tezgahRec); isListe = tezgahRec.isListe = [] }
				let isSaymaInd = tezgahRec.isSaymaInd || 0, isSaymaSayisi = rec.isSaymaSayisi || 0, defSayi = isID ? 1 : 0;
				$.extend(tezgahRec, { isSaymaInd: isSaymaInd + isSaymaInd, isSaymaSayisi: isSaymaSayisi + (isSaymaSayisi || defSayi) });
				if (isID) {
					const {oemgerceklesen, oemistenen} = rec; rec.oee = oemistenen ? roundToFra(Math.max(oemgerceklesen * 100 / oemistenen, 0), 2) : 0;
					delete rec.isListe; isListe.push(rec); let set = isID2TezgahKodSet; (set[isID] = set[isID] || {})[tezgahKod] = true
				}
			}
		}
		if (!basitmi && tezgahKod2Rec && !$.isEmptyObject(isID2TezgahKodSet)) {
			let promises = []; for (let [isId, tezgahKodSet] of Object.entries(isID2TezgahKodSet)) {
				isId = asInteger(isId); promises.push(new $.Deferred(async p => {
					try {
						let rec; try { rec = await app.wsGorevZamanEtuduVeriGetir({ isId }); if (!rec?.bzamanetudu) { rec = null } } catch (ex) { }
						if (rec) { for (const tezgahKod in tezgahKodSet) { rec = tezgahKod2Rec[tezgahKod]; if (rec) { rec.zamanEtuduVarmi = true } } }
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
				`<div class="hat item" data-id="${hatKod}"">
					<div class="grup">
						<div class="title">(<span class="hatKod kod">${hatKod})</span> <span class="hatAdi aciklama">${hatAdi}</span></div>
					</div>
				</div>`);
			for (const rec of detaylar) {
				let {tezgahKod, tezgahAdi} = rec; let itemTezgah = $(
					`<div class="tezgah item" data-id="${tezgahKod}">
						<div class="title">(<span class="tezgahKod kod">${tezgahKod}</span>) <span class="tezgahAdi aciklama">${tezgahAdi}</span></div>
					</div>`
				); itemTezgah.appendTo(itemHat)
			} itemHat.appendTo(parent)
		}
		divListe.children().remove(); parent.appendTo(divListe)
		return this
	}
	updateLayout(e) {
		e = e ?? {}; const {hat2Sev: hat2Sev, divListe} = this; if (!hat2Sev) { return this }
		for (const {hatKod, hatAdi, grupText, detaylar} of Object.values(hat2Sev)) {
			let itemHat = divListe.children(`.hat.item[data-id = "${hatKod}"]`); if (!itemHat?.length) { continue }
			let elm = itemHat.find('.grup > .title'); elm.children('.hatKod').html(hatKod); elm.children('.hatAdi').html(hatAdi);
			for (const rec of detaylar) {
				let {tezgahKod, tezgahAdi} = rec, itemTezgah = itemHat.children(`.tezgah.item[data-id = "${tezgahKod}"]`);
				let elm = itemTezgah.find('.title'); elm.children('.tezgahKod').html(hatKod); elm.children('.tezgahAdi').html(tezgahAdi)
			}
		}
		return this
	}
	getRootFormBuilder(e) {
		const rfb = new RootFormBuilder(), {islemTuslari, divListe} = this;
		rfb.addIslemTuslari('islemTuslari').setLayout(islemTuslari).widgetArgsDuzenleIslemi(({ args }) => $.extend(args, {
			ekButonlarIlk: [
				{ id: 'boyut', handler: e => this.boyutlandirIstendi(e) },
				{ id: 'tazele', handler: e => this.tazele(e) },
				{ id: 'vazgec', handler: e => this.close(e) }
			]
		}));
		return rfb
	}
	boyutlandirIstendi(e) {
		let {boxSize: box} = this, title = 'Boyut Ayarları', wnd, keys = ['rows', 'cols'];
		let content = $(
			`<div class="full-wh">
				<div class="rows scaler item flex-row"><label class="etiket">Dikey:</label><input class="veri" type="range" min="1" max="30" step="1" value="${box.rows}"></input></div>
				<div class="cols scaler item flex-row"><label class="etiket">Yatay:</label><input class="veri" type="range" min="1" max="13" step="1" value="${box.cols}"></input></div>
			</div>`
		);
		const close = e => { if (wnd) { wnd.jqxWindow('close'); wnd = null } }, rfb = new RootFormBuilder({ parentPart: this, layout: content }).autoInitLayout();
		const updateLayout = e => { const layout = e.builder?.layout ?? e.layout ?? e; for (const key of keys) { layout.find(`.item.${key} > .veri`).val(box[key]) } }
		const updateUI = e => { e = e ?? {}; setTimeout(() => { this.createLayout(e).updateLayout(e) }, 100) };
		rfb.onAfterRun(({ builder: fbd }) => {
			const {layout} = fbd; for (const key of keys) {
				layout.find(`.item.${rows} > .veri`).on('change', ({ currentTarget: target }) => {
					const {value} = target; box[key] = asInteger(value); this.saveGlobalsDefer(); updateUI() })
			}
		}).addStyle(...[
				e => `$elementCSS .item { --etiket-width: 130px; margin-inline-end: 10px }`,
				e => `$elementCSS .item > .etiket { color: #aaa; width: var(--etiket-width) }`,
				e => `$elementCSS .item > .veri { font-weight: bold; width: calc(var(--full) - (var(--etiket-width) + 10px)) }`
			]);
		const buttons = { 'SIFIRLA': e => { this.boxSize = box = null; this.saveGlobalsDefer(); updateLayout(rfb.layout); updateUI() } };
		wnd = createJQXWindow({ content, title, buttons, args: { isModal: false, closeButtonAction: 'close', width: Math.min(600, $(window).width() - 50), height: Math.min(200, $(window).height() - 100) } });
		content = wnd.find('div > .content > .subContent'); rfb.run();
		wnd.on('close', evt => { $('body').removeClass('bg-modal'); wnd.jqxWindow('destroy'); wnd = null /* updateMQUI()*/ }); $('body').addClass('bg-modal')
	}
	tblOEMBilgileri_butonTiklandi(e) {
		const {id} = e, evt = e.event, target = evt?.currentTarget; switch (id) {
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
	getLayoutInternal(e) {
		return $(
			`<div>
				<div class="header full-width"><div class="islemTuslari"/></div></div>
				<div class="content"><div class="liste"></div></div>
			</div>`
		)
	}
	getLayout_tblOEMBilgileri(e) {
		e = e ?? {}; const inst = e.rec = this.inst ?? {}, isListe = inst.isListe ?? [], isBilgiHTML = MQHatYonetimi.gridCell_getLayout_isBilgileri(e);
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
}
