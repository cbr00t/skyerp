class MakineYonetimiPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isWindowPart() { return true } static get partName() { return 'makineYonetimi' } static get sinifAdi() { return 'Makine Yönetimi' }
	constructor(e) { e = e || {}; super(e); $.extend(this, { tezgahKod: (e.tezgahKod ?? e.tezgahId)?.trimEnd() }); const {tezgahKod} = this }
	run(e) {
		e = e || {}; super.run(e); const {layout} = this; this.updateTitle(e);
		const header = this.header = layout.children('.header'), islemTuslari = this.islemTuslari = header.children('.islemTuslari');
		const subContent = this.subContent = layout.children('.content'), tblOEMBilgileri = this.tblOEMBilgileri = subContent.find('#oemBilgileri');
		const builder = this.builder = this.getRootFormBuilder(e); if (builder) { const {inst} = this; $.extend(builder, { part: this, inst }); builder.autoInitLayout().run(e) }
		this.tazele(e)
	}
	destroyPart(e) { super.destroyPart(e) }
	activated(e) { super.activated(e); this.tazele(e) }
	async tazele(e) {
		try {
			const {tezgahKod} = this; let recs, lastError;
			for (let i = 0; i < 3; i++) {
				try { recs = tezgahKod ? await app.wsTekilTezgahBilgi({ tezgahKod }) : {}; lastError = null; break }
				catch (ex) { lastError = ex; if (i) { await new $.Deferred(p => setTimeout(p.resolve(), i * 500) ) } }
			}
			if (lastError) { throw lastError }
			this.ekNotlarYapi = await app.wsEkNotlar({ tip: 'TZ', kod: tezgahKod || '' });
			let inst; if (recs?.length) {
				const {durumKod2Aciklama} = app, donusum = { hatID: 'hatKod', hatAciklama: 'hatAdi', id: 'tezgahKod', aciklama: 'tezgahAdi' };
				for (const rec of recs) { for (const [key, newKey] of Object.entries(donusum)) { if (rec[newKey] == null) { rec[newKey] = rec[key]?.trimEnd(); delete rec[key] } } }
				inst = this.inst = $.extend({}, recs[0]); const isListe = inst.isListe = [];
				for (const rec of recs) {
					const {isID} = rec; if (isID) {
						/*const {isToplamOlasiSureSn, isToplamBrutSureSn, isToplamDuraksamaSureSn} = rec;
						rec.oee = isToplamOlasiSureSn ? Math.min(Math.round((isToplamBrutSureSn - isToplamDuraksamaSureSn) * 100 / isToplamOlasiSureSn), 100) : 0*/
						const {oemgerceklesen, oemistenen} = rec; rec.oee = oemistenen ? roundToFra(Math.max(oemgerceklesen * 100 / oemistenen, 0), 2) : 0;
						isListe.push(rec);
					}
					inst.isSaymaInd = (inst.isSaymaInd || 0) + (rec.isSaymaInd || 0); inst.isSaymaSayisi = (inst.isSaymaSayisi || 0) + (rec.isSaymaSayisi || (isID ? 1 : 0));
					let {durumKod, durumAdi} = rec; if (durumKod != null) {
						durumKod = inst.durumKod = durumKod.trimEnd();
						if (inst.durumAdi == null) { inst.durumAdi = durumKod2Aciklama[durumKod] ?? durumKod }
					}
				}
			}
			this.updateTitle(e); const {subContent} = this, html_oemBilgileri = this.getLayout_tblOEMBilgileri(e), layout = html_oemBilgileri ? $(html_oemBilgileri) : null;
			subContent.children().remove(); if (layout?.length) { layout.appendTo(subContent); this.initEvents_tblOEMBilgileri({ layout }); makeScrollable(subContent.find('.isListe > .parent')) }
		}
		catch (ex) { hConfirm(getErrorText(ex)); throw ex }
		return this
	}
	tazeleWithSignal() { app.signalChange(); return this }
	onSignalChange(e) { this.tazele(e); return this }
	updateTitle(e) {
		const {sinifAdi} = this.class, {inst} = this; let tezgahText; if (inst) {
			const {tezgahKod, tezgahAdi} = inst; if (tezgahKod) {
				tezgahText = `<u class="gray">${tezgahKod || ''}</u>`;
				if (tezgahAdi) { tezgahText += ` <span class="royalblue">${tezgahAdi}</span>` }
			}
		}
		const title = this.title = `${sinifAdi} ${tezgahText ? `[ ${tezgahText} ]` : ''}`; this.updateWndTitle(title)
	}
	getRootFormBuilder(e) {
		const rfb = new RootFormBuilder(), {islemTuslari, tblOEMBilgileri} = this;
		rfb.addIslemTuslari('islemTuslari').setLayout(islemTuslari).widgetArgsDuzenleIslemi(e => $.extend(e.args, {
			ekButonlarIlk: [
				{ id: 'tazele', handler: e => e.builder.rootBuilder.part.tazele(e) },
				{ id: 'vazgec', handler: e => e.builder.rootBuilder.part.close(e) }
			]
		}));
		rfb.addForm('oemBilgileri').setLayout(tblOEMBilgileri).onAfterRun(e => this.initEvents_tblOEMBilgileri(e.builder));
		return rfb
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
		const html_oemBilgileri = this.getLayout_tblOEMBilgileri(e);
		return $(
			`<div>
				<div class="header full-width"><div class="islemTuslari"/></div></div>
				<div class="content">${html_oemBilgileri}</div>
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
