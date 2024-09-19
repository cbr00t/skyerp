class MQHatYonetimi extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Hat Yönetimi' }
	static get orjBaslikListesi_defaultColCount() { return 4 } static get orjBaslikListesi_maxColCount() { return 10 } static get orjBaslikListesi_defaultRowsHeight() { return 280 }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false } static get secimSinif() { return null }
	static get gridIslemTuslariKullanilirmi() { return false } static get noAutoFocus() { return true }

	static listeEkrani_afterRun(e) { super.listeEkrani_afterRun(e) /*const gridPart = e.gridPart ?? e.sender*/ }
	static listeEkrani_activated(e) { super.listeEkrani_activated(e); const gridPart = e.gridPart ?? e.sender /*; gridPart.tazeleDefer()*/ }
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); const rfb = e.rootBuilder, gridPart = e.gridPart ?? e.sender ?? rfb?.part, {sabitHatKod} = app;
		/*const fbd_islemTuslari = rfb.addForm('islemTuslari', e => e.builder.part.islemTuslariPart.layout);
		const fbd_sol = fbd_islemTuslari.addForm('sol', e => e.builder.parent.children('.sol')), fbd_sag = fbd_islemTuslari.addForm('sol', e => e.builder.parent.children('.sag'));*/
		this.fbd_listeEkrani_addCheckBox(rfb, 'cokluSecimFlag', 'Çoklu').onAfterRun(e => {
			const {builder} = e, {rootPart, layout} = builder, input = layout.children('input'), {grid, gridWidget} = rootPart; rootPart.fbd_cokluSecim = builder;
			const cokluSecimDegisti = value => { grid.jqxGrid('selectionmode', value ? 'multiplecells' : 'singlecell'); try { gridWidget.clearselection() } catch (ex) { } }
			if (rootPart.cokluSecimFlag) { input.prop('checked', true); cokluSecimDegisti(true) }
			input.on('change', evt => { const value = rootPart.cokluSecimFlag = $(evt.currentTarget).is(':checked'); cokluSecimDegisti(value) })
		});
		this.fbd_listeEkrani_addCheckBox(rfb, 'otoTazeleFlag', 'Oto Tazele').onAfterRun(e => {
			const {builder} = e, {rootPart, layout} = builder, input = layout.children('input'), {grid, gridWidget} = rootPart;
			if (rootPart.otoTazeleFlag) { input.prop('checked', true) }
			input.on('change', evt => {
				const value = rootPart.otoTazeleFlag = $(evt.currentTarget).is(':checked'); app.otoTazeleFlag = !!value;
				const fbd_grupsuz = builder.parentBuilder.id2Builder.grupsuzmu; if (fbd_grupsuz) { fbd_grupsuz.updateVisible() }
				e.action = 'toggle'; rootPart.tazele(e)
			})
		});
		this.fbd_listeEkrani_addCheckBox(rfb, 'grupsuzmu', 'Grupsuz').onAfterRun(e => {
			const {builder} = e, {rootPart, layout} = builder, input = layout.children('input'), {grid, gridWidget} = rootPart;
			builder.setVisibleKosulu(e => e.builder.rootPart.otoTazeleFlag ? 'jqx-hidden' : true);
			if (rootPart.grupsuzmu) { input.prop('checked', true) }
			input.on('change', evt => { const value = rootPart.grupsuzmu = $(evt.currentTarget).is(':checked'); e.action = 'toggle'; rootPart.tazele(e) })
		});
		rfb.addForm('kronometre').addCSS('flex-row')
			.setParent(gridPart.islemTuslariPart.sol).setLayout(e => $(`<div id="${e.builder.id}"><div id="value"class="full-wh"></div><button id="reset" class="jqx-hidden">x</button></div>`))
			.addStyle(e =>
				`$elementCSS { 
					position: absolute !important; left: 400px; top: 3px; width: 150px !important; height: 35px !important;
					background-color: #333333ee !important; border: 2px solid #aaa; border-radius: 8px; cursor: pointer; z-index: 0
				}
				$elementCSS #value { font-family: Corier New !important; font-size: 110%; font-weight: bold; text-align: left; color: whitesmoke; background: transparent !important; padding-left: 20px !important; border: none !important }
				$elementCSS #value:not(.running) ::after { content: 'Kronometre' }
				$elementCSS #reset { font-size: 150%; font-weight: bold; position: absolute; top: -10px; right: -5px; width: 48px; height: 48px; color: orangered }
				$elementCSS:hover { border-color: royalblue }
				$elementCSS.running { border-color: lightgreen; box-shadow: 0px 0px 3px 3px lightgreen }
				$elementCSS.paused { border-color: orange; box-shadow: 0px 0px 2px 2px orange }`
			 )
			.onAfterRun(e => {
				const {builder} = e, {rootPart, layout} = builder, elmValue = layout.find('#value'), btnReset = layout.find('#reset');
				const timerKey = 'timer_kronometre', kronometre = this.kronometre = this.kronometre || {}; elmValue.attr('placeholder', 'Kronometre');
				elmValue.on('click', evt => {
					const {kronometre} = this; let running = !kronometre.running;
					if (running) {
						if (kronometre.startTS == null) { kronometre.startTS = now() }
						kronometre[timerKey] = setInterval(kronometre => {
							if (rootPart?.isDestroyed) { clearInterval(kronometre[timerKey]); kronometre[timerKey] = kronometre.startTS = null; layout.removeClass('running paused'); return }
							const value = kronometre.value = timeToString(now() - kronometre.startTS, false, true); elmValue.html(value)
						}, 90, kronometre);
						layout.addClass('started running'); layout.removeClass('paused')
					}
					else { clearInterval(kronometre[timerKey]); kronometre[timerKey] = null; layout.removeClass('running'); layout.addClass('paused') }
					kronometre.running = running; btnReset.removeClass('jqx-hidden basic-hidden')
				});
				btnReset.jqxButton({ theme }).on('click', evt => {
					const {kronometre} = this; if (!kronometre) { return }
					if (kronometre.running) { clearInterval(kronometre[timerKey]); kronometre[timerKey] = kronometre.startTS = null; layout.removeClass('running paused') }
					const value = kronometre.value = null; kronometre.running = false; elmValue.html(value); btnReset.addClass('jqx-hidden')
				})
			});
		rfb.onAfterRun(e => {
			const gridPart = e.builder.part, hizliBulLayout = gridPart.bulPart?.layout?.children('input');
			if (hizliBulLayout?.length) {
				hizliBulLayout.on('focus', evt => app.otoTazeleDisabledFlag = true )
				hizliBulLayout.on('blur', evt => app.otoTazeleTempDisable({ waitMS: 3000 }) )
			}
		})
		/*let form = rfb.addForm().setLayout(e => e.builder.rootPart.islemTuslariPart.sol);
		gridPart.fbd_ozetBilgi = form.addForm('ozetBilgi').setLayout(e => $(`<div/>`))*/
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e);
		e = $.extend({}, e);  const {liste} = e, {sabitHatKod} = app, gridPart = e.parentPart, butonlarPart = e.part; e.recs = gridPart.selectedRecs;
		const items = [
			{ id: 'boyutlandir', text: 'BYT', handler: e => e.sender.boyutlandirIstendi(e) },
			{ id: 'tezgahMenu', text: 'TEZ', handler: e => this.tezgahMenuIstendi(e) },
			/* { id: 'isEmirleri', text: 'EMR', handler: e => this.bekleyenIsEmirleriIstendi(e) }, */
			{ id: 'topluX', text: 'TPL', handler: e => this.topluXMenuIstendi(e) },
			(sabitHatKod ? null : { id: 'tumEkNotlar', text: 'NOT', handler: e => this.ekNotlarIstendi({ ...e, hepsi: true }) }),
			{ id: 'ozet', text: 'ÖZET', handler: e => this.ozetBilgiGoster(e) }
		].filter(x => !!x);
		liste.splice(liste.findIndex(item => item.id == 'vazgec'), 0, ...items);
		const ekSagButonIdSet = butonlarPart.ekSagButonIdSet = butonlarPart.ekSagButonIdSet || {}; $.extend(ekSagButonIdSet, asSet(items.map(item => item.id)))
	}
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); const {args} = e, gridPart = e.gridPart ?? e.parentPart ?? e.sender; gridPart.rowNumberOlmasin();
		$.extend(args, { showFilterRow: false, showGroupsHeader: false, groupsRenderer: (...args) => this.orjBaslikListesi_renderGroupsHeader(...args) })
	}
	static orjBaslikListesi_getPanelDuzenleyici(e) { const getCellLayoutIslemi = e => this.gridCell_getLayout(e); return new GridPanelDuzenleyici({ getCellLayoutIslemi }) }
	static orjBaslikListesi_renderGroupsHeader(text, group, expanded, groupInfo) {
		const belirtec = groupInfo.groupcolumn.datafield;
		if (belirtec == 'grupText') { return this.orjBaslikListesi_renderGroupsHeader_grupText(text, group, expanded, groupInfo) }
		return group
	}
	static orjBaslikListesi_renderGroupsHeader_grupText(text, group, expanded, groupInfo) {
		const /*kod2EkNotlarRec = this.ekNotlarYapi?.HT || {}*/ allSubItems = [], {sabitHatKod} = app;
		const fillSubItems = info => {
			if (!info) { return } let {subItems, subGroups} = info;
			if (subItems?.length) { allSubItems.push(...subItems) }
			if (subGroups?.length) { for (const subGroup of subGroups) { if (subGroup) { fillSubItems(subGroup) } } }
		}; fillSubItems(groupInfo);
		const rec = allSubItems[0], {hatKod} = rec; /*, ekNotlarRec = kod2EkNotlarRec[hatKod] || {}; */
		return `<table border="0" class="full-wh"><tbody>
			<tr data-hatkod="${hatKod}">
				<td class="groupText">${group}</td>
				<td class="islemTuslari">
					<div class="item">
						<button id="topluX">TPL</button>
						<button id="bekleyenIsEmirleri">EMR</button>
						<!--<button id="hatBekleyenIsler">BEK</button>-->
						${!sabitHatKod ? `<button id="notlar">NOTLAR</button>` : ''}
					</div>
					<div class="item">
						<button id="notEkle">NOT EKLE</button>
						<button id="dokumanYukle">RESİM</button>
						<button id="dokumanSil" class="indianred">RESİM SİL</button>
					</div>
				</td>
			</tr>
		</tbody></table>`
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		liste.push(...[
			new GridKolon({ belirtec: 'hatKod' }).hidden(),
			new GridKolon({ belirtec: 'hatAdi' }).hidden(),
			new GridKolon({ belirtec: 'tezgahKod' }).hidden(),
			new GridKolon({ belirtec: 'tezgahAdi' }).hidden(),
			new GridKolon({ belirtec: 'ip' }).hidden(),
			new GridKolon({ belirtec: 'grupText' }).hidden()
		])
	}
	static orjBaslikListesi_panelGrupAttrListeDuzenle(e) { super.orjBaslikListesi_panelGrupAttrListeDuzenle(e); const {liste} = e; liste.push('grupText') }
	static orjBaslikListesi_groupsDuzenle(e) {
		super.orjBaslikListesi_groupsDuzenle(e); const gridPart = e.gridPart ?? e.sender, {liste} = e;
		if (!(gridPart.grupsuzmu || gridPart.otoTazeleFlag)) { const grupListe = this.orjBaslikListesi_panelGrupAttrListe || []; if (grupListe?.length) { liste.push(...grupListe) } }
	}
	static orjBaslikListesi_panelUstSeviyeAttrListeDuzenle(e) { super.orjBaslikListesi_panelUstSeviyeAttrListeDuzenle(e); const {liste} = e; liste.push('hatKod', 'hatAdi') }
	static orjBaslikListesi_hizliBulFiltreAttrListeDuzenle(e) {
		super.orjBaslikListesi_hizliBulFiltreAttrListeDuzenle(e); const {liste} = e;
		liste.push('hatKod', 'hatAdi', 'tezgahKod', 'tezgahAdi', 'perKod', 'perIsim', 'ip')
	}
	static onSignalChange(e) {
		const gridPart = e.gridPart ?? e.sender; e.action = 'otoTazele';
		if (gridPart?.tazele) { gridPart.tazele(e) } else if (gridPart?.tazeleDefer) { gridPart.tazeleDefer(e) }
		return this
	}
	static orjBaslikListesi_hizliBulIslemi(e) { app.otoTazeleTempDisable(e); super.orjBaslikListesi_hizliBulIslemi(e) }
	static async loadServerData(e) {
		let recs, lastError;
		for (let i = 0; i < 3; i++) {
			try { recs = await this.loadServerData_internal(e); lastError = null; break }
			catch (ex) { lastError = ex; if (i) { await new $.Deferred(p => setTimeout(() => p.resolve(), i * 500) ) } }
		}
		if (lastError) { throw lastError } return recs || []
	}
	static async loadServerData_internal(e) {
		e = e || {}; const gridPart = e.gridPart ?? e.sender, {wsArgs} = e, tezgahKod2Rec = {}, isID2TezgahKodSet = {}, action_otoTazeleFlag = e.action == 'otoTazele';
		const hatKod = app.sabitHatKod || gridPart.hatKod, {excludeTezgahKod} = gridPart; if (hatKod) { $.extend(wsArgs, { hatIdListe: hatKod }) }
		let recs = await app.wsTezgahBilgileri(wsArgs); /*this.ekNotlarYapi = await app.wsEkNotlar();*/
		if (recs) {
			/*let {_lastRecsHash, _lastRecs} = this, recsHash = this._lastRecsHash = toJSONStr(recs); if (_lastRecsHash && recsHash == _lastRecsHash && _lastRecs) { return _lastRecs }*/
			const {durumKod2KisaAdi} = app, donusum = { hatID: 'hatKod', hatAciklama: 'hatAdi', id: 'tezgahKod', aciklama: 'tezgahAdi' };
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
		e.recs = recs; if (recs) {
			let _recs = recs; recs = [];
			for (let rec of _recs) {
				const {hatKod, tezgahKod, isID} = rec; if (excludeTezgahKod && tezgahKod == excludeTezgahKod) { continue }
				let tezgahRec = tezgahKod2Rec[tezgahKod] ?? $.extend({}, rec), {isListe} = tezgahRec;
				if (!tezgahKod2Rec[tezgahKod]) { tezgahKod2Rec[tezgahKod] = tezgahRec; recs.push(tezgahRec); isListe = tezgahRec.isListe = [] }
				tezgahRec.isSaymaInd = (tezgahRec.isSaymaInd || 0) + (rec.isSaymaInd || 0); tezgahRec.isSaymaSayisi = (tezgahRec.isSaymaSayisi || 0) + (rec.isSaymaSayisi || (isID ? 1 : 0));
				if (isID) {
					/*const {isToplamOlasiSureSn, isToplamBrutSureSn, isToplamDuraksamaSureSn} = rec; rec.oee = isToplamOlasiSureSn ? Math.min(Math.round((isToplamBrutSureSn - isToplamDuraksamaSureSn) * 100 / isToplamOlasiSureSn), 100) : 0*/
					const {oemgerceklesen, oemistenen} = rec; rec.oee = oemistenen ? roundToFra(Math.max(oemgerceklesen * 100 / oemistenen, 0), 2) : 0;
					delete rec.isListe; isListe.push(rec); (isID2TezgahKodSet[isID] = isID2TezgahKodSet[isID] || {})[tezgahKod] = true;
				}
			}
		}
		if (!action_otoTazeleFlag && tezgahKod2Rec && !$.isEmptyObject(isID2TezgahKodSet)) {
			for (let [isId, tezgahKodSet] of Object.entries(isID2TezgahKodSet)) {
				isId = asInteger(isId);
				let rec; try { rec = await app.wsGorevZamanEtuduVeriGetir({ isId }); if (!rec?.bzamanetudu) { rec = null } } catch (ex) { } if (!rec) { continue }
				for (const tezgahKod in tezgahKodSet) { rec = tezgahKod2Rec[tezgahKod]; if (rec) { rec.zamanEtuduVarmi = true } }
			}
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
		gridPart._lastRecs = recs;
		/*let {_lastRecs} = gridPart;
		if (_lastRecs && recs && _lastRecs?.length == recs?.length) { for (let i = 0; i < recs.length; i++) { const rec = _lastRecs[i], _rec = recs[i]; $.extend(rec, _rec) } } else { _lastRecs = gridPart._lastRecs = recs }
		return _lastRecs */
		return recs
	}
	static orjBaslikListesi_recsDuzenle(e) { super.orjBaslikListesi_recsDuzenle(e) }
	static gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); const gridPart = e.gridPart ?? e.sender; app.sonSyncTS = now(); this.updateOzetBilgi(e)
		/*if (fbd_ozetBilgi) { const html = this.ozetBilgi_getLayout(e); fbd_ozetBilgi.layout.html(html) }*/
	}
	static orjBaslikListesi_gridRendered(e) {
		super.orjBaslikListesi_gridRendered(e); const {gridPart} = e, {grid, gridWidget} = gridPart, table = gridWidget?.table; if (!table) { return }
		const ustAltFormlar = table.find(`[role = row] > * .ust-alt`);
		if (ustAltFormlar?.length) { for (const key of ['mousedown', 'touchstart']) { ustAltFormlar.on(key, evt => { app.otoTazeleTempDisable() }) } }
		const buttons = table.find(`[role = row] > * button`); if (buttons?.length) {
			buttons.jqxButton({ theme }).off('click').on('click', async evt => {
				let {_lastButonClickEventTime} = this; if (now() - _lastButonClickEventTime < 300) { return }
				this._lastButonClickEventTime = now(); const target = evt.currentTarget; await new $.Deferred(p => setTimeout(() => p.resolve(), isTouchDevice() ? 200 : 100));
				if (gridPart.cokluSecimFlag) {
					let td = $(target).parents('.jqx-grid-cell'), colIndex = asInteger(td.attr('columnindex')), tr = td.parents('[role = row]'), rowIndex = asInteger(tr.attr('row-id')), belirtec = gridWidget.getcolumnat(colIndex)?.datafield;
					$.extend(e, { rowIndex, belirtec }); gridPart.cokluSecimFlag = false; grid.jqxGrid('selectionmode', 'singlecell');
					try { gridWidget.clearselection() } catch (ex) { } try { gridWidget.selectcell(rowIndex, belirtec) } catch (ex) { }
					const {fbd_cokluSecim} = gridPart; if (fbd_cokluSecim) { fbd_cokluSecim.layout.children('input').prop('checked', false) }
				}
				$.extend(e, { event: evt, gridPart }); const id = target.id, grup_hatKod = $(target).parents('tr').data('hatkod');
				let {parentRec, rec} = this.gridCellHandler_ilkIslemler(e); /*if (!rec) { rec = e.rec }*/
				if (grup_hatKod) {
					let selRecs = gridPart.selectedRecs.filter(rec => rec.hatKod == grup_hatKod);
					if (!selRecs.length) { parentRec = e.parentRec = gridPart.recs.find(rec => rec.hatKod == grup_hatKod); rec = e.rec = parentRec ? parentRec._subItems[0] : null }
				}
				if (!rec) { return } const {tezgahAdi} = rec, {boundindex, visibleindex} = parentRec, ctrlFlag = evt?.ctrlKey;
				/*const hatKod = $(target).parents('tr').data('hatkod'), hatRec = hatKod ? gridPart.recs.find(rec => rec.hatKod == hatKod) : null;
				if (hatRec) { parentRec = e.parentRec = hatRec; rec = e.rec = parentRec._subItems[0] }*/
				switch (id) {
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
			})
		}
		console.debug('gridRendered', e)
	}
	static tezgahMenuIstendi(e) {
		const topluMenumu = e.id == 'tezgahMenu'; if (topluMenumu) { e.title = `Seçilen tezgah(lar) için:` }
		$.extend(e, { formDuzenleyici: _e => {
			_e = $.extend({}, e, _e); const {form, close} = _e; form.yanYana(2);
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
	static bekleyenXMenuIstendi(e) {
		$.extend(e, { formDuzenleyici: _e => {
			_e = $.extend({}, e, _e); const {form, close} = _e; form.yanYana(2);
			form.addButton('isEmirleri', undefined, 'İş Emirleri').onClick(() => { close(); this.bekleyenIsEmirleriIstendi(_e) });
			form.addButton('hatBekleyenIsler', undefined, 'Bekleyen İşler (HAT)').onClick(() => { close(); _e.hatBazinda = true; this.bekleyenIslerIstendi_hatBazinda(_e) })
		} }); this.openContextMenu(e)
	}
	static topluXMenuIstendi(e) {
		e = e || {}; const {parentRec} = e, {sabitHatKod} = app, hatKod = e.hatKod = e.hatKod ?? parentRec?.hatKod;
		$.extend(e, { noCheck: true, formDuzenleyici: _e => {
			_e = $.extend({}, e, _e); const {form, close} = _e; form.yanYana(2);
			form.addButton('mola', undefined, 'Mola').onClick(e => { close(); this.topluXIstendi($.extend({}, _e, e, { id: e.builder.id })) });
			form.addButton('vardiyaDegisimi', undefined, 'Vardiya Değişimi').onClick(e => { close(); this.topluXIstendi($.extend({}, _e, e, { id: e.builder.id })) });
			if (!sabitHatKod || hatKod) {
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
	static personelSecIstendi(e) {
		const gridPart = e.gridPart ?? e.sender ?? e.parentPart ?? e.builder?.rootBuilder?.parentPart, {gridWidget} = gridPart;
		const _recs = e.recs ?? gridPart.getSubRecs({ gridPart, cells: gridWidget.getselectedcells().filter(cell => cell.datafield[0] == '_') });
		return MQPersonel.listeEkraniAc({
			tekil: true, args: { _recs }, secince: async e => {
				const perKod = e.value, {sender} = e, tezgahKodListe = sender._recs?.map(rec => rec.tezgahKod);
				if (tezgahKodListe?.length) {
					const promises = []; for (const tezgahKod of tezgahKodListe) { promises.push(app.wsPersonelAta({ tezgahKod, perKod })) }
					try { await Promise.all(promises); gridPart.tazele() } catch (ex) { console.error(ex); hConfirm(getErrorText(ex)) }
				}
			}
		})
	}
	static tezgahTasiIstendi(e) {
		const gridPart = e.gridPart ?? e.sender ?? e.parentPart ?? e.builder?.rootBuilder?.parentPart, {gridWidget} = gridPart;
		const _recs = e.recs ?? gridPart.getSubRecs({ gridPart, cells: gridWidget.getselectedcells().filter(cell => cell.datafield[0] == '_') });
		if (!_recs?.length) { return } let exclude_hatKod;
		try {
			for (const rec of _recs) {
				const {hatKod} = rec;
				if (exclude_hatKod && hatKod != exclude_hatKod) { throw new { isError: true, errorText: `Taşınacak Tezgah(lar) <u class="bold">Aynı Hat üzerinde</u> olmalıdır` } }
				if (!exclude_hatKod) { exclude_hatKod = hatKod }
			}
			return MQHat.listeEkraniAc({
				tekil: true, args: { exclude_hatKod, _recs }, title: `<b class="royalblue">${_recs.length} adet Tezgahı</b> <span class="darkgray">şu Hat'a taşı:</span>`, secince: async e => {
					const hatKod = e.value, {sender} = e, tezgahKodListe = sender._recs?.map(rec => rec.tezgahKod); if (!tezgahKodListe?.length) { return }
					const upd = new MQIliskiliUpdate({ from: 'tekilmakina', where: { inDizi: tezgahKodListe, saha: 'kod' }, set: { degerAta: hatKod, saha: 'ismrkkod' } });
					try { await app.sqlExecNone(upd); gridPart.tazele() } catch (ex) { console.error(ex); hConfirm(getErrorText(ex)) }
				}
			})
		}
		catch (ex) { console.error(ex); hConfirm(getErrorText(ex)) }
	}
	static makineDurumIstendi(e) { const recs = e.recs ?? (e.rec ? [e.rec] : []); for (const rec of recs) { const {tezgahKod} = rec; new MakineYonetimiPart({ tezgahKod }).run() } }
	static siradakiIslerIstendi(e) { e.mfSinif = MQSiradakiIsler; return this.xIslerIstendi(e) }
	static bekleyenIslerIstendi(e) { e.tekil = true; e.mfSinif = MQBekleyenIsler; return this.xIslerIstendi(e) }
	static bekleyenIslerIstendi_hatBazinda(e) { e.hatBazinda = true; return this.bekleyenIslerIstendi(e) }
	static xIslerIstendi(e) {
		const {mfSinif} = e, tekilmi = e.tekil ?? e.tekilmi, hatBazindami = e.hatBazinda ?? e.hatBazindami;
		const gridPart = e.gridPart ?? e.sender ?? e.parentPart ?? e.builder?.rootBuilder?.parentPart, {gridWidget} = gridPart;
		let recs = e.recs; if (!recs?.length && e.rec) { recs = e.recs = [e.rec] }
		if (!recs.length) { recs = e.recs = gridPart.getSubRecs({ gridPart, cells: gridWidget.getselectedcells().filter(cell => cell.datafield[0] == '_') }) }
		if (!recs) { return }
		for (const rec of recs) { const {hatKod, hatAdi, tezgahKod, tezgahAdi} = rec; mfSinif.listeEkraniAc({ args: { hatKod, hatAdi, tezgahKod, tezgahAdi, hatBazindami }}) }
	}
	static topluXIstendi(e) {
		const {id} = e, gridPart = e.gridPart ?? e.sender ?? e.builder?.rootBuilder?.part; let recs = gridPart?._lastRecs;
		const hatKodListe = e.hatKodListe ?? (e.hatKod ? [e.hatKod] : []), wsArgs = {};
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
				gridPart.tazeleDefer()
			}
			catch (ex) { hConfirm(getErrorText(ex), `Toplu ${islemAdi}`); throw ex }
		})
	}
	static ozetBilgiGoster(e) {
		let html = this.ozetBilgi_getLayout(e); if (!html) { return }
		const {classKey} = this, wnd = createJQXWindow({
			content: `<div class="full-width ozetBilgi-parent ozetBilgi">${html}</code></div>`,
			title: `Özet Bilgi`, args: { isModal: false, width: Math.min(850, $(window).width() - 50), height: Math.min(500, $(window).height() - 50) }
		}); wnd.addClass(`ozetBilgi ${classKey} masterListe part`); makeScrollable(wnd.find('.jqx-window-content'))
	}
	static updateOzetBilgi(e) {
		let html = this.ozetBilgi_getLayout(e); if (!html) { return }
		const {classKey} = this, wndSelector = `.jqx-window.ozetBilgi.${classKey}`, wnd = $(wndSelector); if (!wnd.length) { return }
		const layout = wnd.find('.jqx-window-content > .subContent > .ozetBilgi-parent'); if (!layout?.length) { return }
		layout.html(html)
	}
	static ozetBilgi_getLayout(e) {
		const gridPart = e.gridPart ?? e.sender ?? e.parentPart ?? e.builder?.rootBuilder?.parentPart, recs = gridPart?._lastRecs; if (!recs) { return null }
		const hat2Durum2Sayi = {}; let topMakineSayi = 0, topAktifSayi = 0, topPasifSayi = 0, topOffSayi = 0; for (const rec of recs) {
			const {hatKod, sinyalKritik} = rec, hatText = hatKod; let {durumKod} = rec;
			if (durumKod == 'DV') { durumKod = sinyalKritik ? 'APSF' : 'ZON' } else { durumKod = 'XOFF' }
			let durum2Sayi = hat2Durum2Sayi[hatText]; if (durum2Sayi == null) { durum2Sayi = hat2Durum2Sayi[hatText] = {}; for (const key of ['ZON', 'APSF', 'XOFF']) { durum2Sayi[key] = 0 } }
			durum2Sayi[durumKod] = (durum2Sayi[durumKod] || 0) + 1; topMakineSayi++; if (durumKod == 'ZON') { topAktifSayi++ } else if (durumKod == 'APSF') { topPasifSayi++ } else { topOffSayi++ }
		}
		const textList = []; for (const [hat, durum2Sayi] of Object.entries(hat2Durum2Sayi)) {
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
		)
		return `<ul class="text ozetBilgi-container ozetBilgi">${textList?.length ? textList.join(' ') : ''}</ul>`
	}
	static ekBilgiIstendi(e) {
		const gridPart = e.gridPart ?? e.sender ?? e.parentPart ?? e.builder?.rootBuilder?.parentPart, rec = e.rec ?? gridPart.selectedRec, {tezgahKod, tezgahAdi} = rec;
		if (rec) {
			createJQXWindow({
				content: `<code><pre class="full-width bold" style="font-size: 110%; color: lightgreen !important; background: linear-gradient(270deg, #333 5%, #444 80%) !important; line-height: 22px !important">${toJSONStr(rec, ' ')}</pre></code>`,
				title: `Tezgah Ham Verisi &nbsp;[<u class="bold ghostwhite">${tezgahKod}</u> - <span class="bold white">${tezgahAdi}</span>]`,
				args: { isModal: false, width: Math.min(700, $(window).width() - 50), height: '97%' }
			})
		}
	}
	static bekleyenIsEmirleriIstendi(e) {
		const gridPart = e.gridPart ?? e.sender ?? e.parentPart ?? e.builder?.rootBuilder?.parentPart;
		const rec = e.rec ?? gridPart.selectedRec ?? {}; const {hatKod} = rec; if (!hatKod) { return }
		MQBekleyenIsEmirleri.listeEkraniAc({ args: { hatKod } })
	}
	static ekNotlarIstendi(e) {
		const gridPart = e.gridPart ?? e.sender ?? e.parentPart ?? e.builder?.rootBuilder?.parentPart, hepsimi = e.hepsi ?? e.hepsimi;
		const rec = e.rec ?? gridPart.selectedRec ?? {}; const {hatKod} = rec;
		MQEkNotlar.listeEkraniAc({ secimlerDuzenle: e => {
			const sec = e.secimler, isHidden = !!app.params.config.hatKod;
			if (!hepsimi && hatKod) { $.extend(sec.hatKod, { birKismimi: true, value: hatKod, isHidden }); sec.hatAdi.isHidden = isHidden }
		}})
	}
	static ekNotEkleIstendi(e) {
		const gridPart = e.gridPart ?? e.sender ?? e.parentPart ?? e.builder?.rootBuilder?.parentPart, rec = e.rec ?? gridPart.selectedRec ?? {};
		const hatKod = rec.hatKod ?? '', tezgahKod = rec.tezgahKod ?? ''; if (!(hatKod || tezgahKod)) { return }
		let inst = new MQEkNotlar({ hatKod, tezgahKod }); return inst.tanimla({ islem: 'yeni' })
	}
	static dokumanYukleIstendi(e) {
		e = e || {}; const gridPart = e.gridPart ?? e.sender ?? e.parentPart ?? e.builder?.rootBuilder?.parentPart, rec = e.rec ?? gridPart.selectedRec ?? {};
		const hatKod = rec.hatKod ?? ''; if (!hatKod) { return } const resimId = `hat-${hatKod}-01`, islemAdi = 'Hat Resim Yükleme';
		let elm = $(`<input type="file" capture accept="image/*, application/pdf, video/*">`).appendTo('body'); elm.addClass('jqx-hidden');
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
	static async dokumanSilIstendi(e) {
		e = e || {}; const gridPart = e.gridPart ?? e.sender ?? e.parentPart ?? e.builder?.rootBuilder?.parentPart, rec = e.rec ?? gridPart.selectedRec ?? {};
		const hatKod = rec.hatKod ?? ''; if (!hatKod) { return } const resimId = `hat-${hatKod}`, islemAdi = `<b color="indianred">Resim SİL</b>`;
		let rdlg = await ehConfirm(`<b class="royalblue">${hatKod}</b><b class="indianred"> hattına ait Resim silinecek, emin misiniz?</b>`, islemAdi); if (!rdlg) { return }
		const result = await app.wsResimDataSil({ resimId }); if (!result.result) { throw { isError: true, errorText: `${islemAdi} sorunu` } }
		gridPart.tazeleDefer(e); setTimeout(() => eConfirm(`Hat Resim Görüntüsünün güncellenmesi için uygulamadan çıkıp yeniden girilmesi gerekebilir`, islemAdi))
	}
	static async ekBilgiSilItendi(e) {
		const gridPart = e.gridPart ?? e.sender ?? e.parentPart ?? e.builder?.rootBuilder?.parentPart, recs = e.recs ?? gridPart.selectedRecs ?? []; if (!recs?.length) { return }
		const tezgahIdListe = recs.map(rec => rec.tezgahKod);
		try { await app.wsEkBilgiTopluSifirla({ tezgahIdListe }); gridPart.tazele(e) }
		catch (ex) { console.error(ex); hConfirm(getErrorText(ex)) }
	}
	static openContextMenu(e) {
		const noCheckFlag = e.noCheck ?? e.noCheckFlag, gridPart = e.gridPart = e.gridPart ?? e.sender ?? e.parentPart, gridWidget = e.gridWidget = gridPart.gridWidget;
		const cells = e.cells = gridWidget.getselectedcells().filter(cell => cell.datafield[0] == '_');
		let {title} = e; const recs = e.recs = (e.recs ?? gridPart.getSubRecs(e)).filter(rec => !!rec);
		const parentRec = e.parentRec = e.parentRec ?? gridPart.selectedRec, rec = e.rec = (recs || [])[0];
		if (!(noCheckFlag || rec)) { return }
		title = e.title = title ?? `<b class="cyan">(${rec?.tezgahKod || ''})</b> ${rec?.tezgahAdi || ''}${cells?.length > 1 ? ` <b class="cadetblue">(+ ${cells.length - 1})</b>` : ''}`;
		return gridPart.openContextMenu(e)
	}
	static gridCell_getLayout(e) {
		const gridPart = e.gridPart ?? e.sender, rec = e.rec ?? {}, isListe = rec.isListe ?? [], grupsuzmu = gridPart.grupsuzmu || gridPart.otoTazeleFlag;
		const {sinyalKritik, duraksamaKritik, durumKod, durumAdi, durNedenKod, durNedenAdi, ip, siradakiIsSayi, ekBilgi, zamanEtuduVarmi} = rec, {kritikDurNedenKodSet} = app.params.mes;
		const kritikDurNedenmi = kritikDurNedenKodSet && durNedenKod ? kritikDurNedenKodSet[durNedenKod] : false;
		const isBilgiHTML = this.gridCell_getLayout_isBilgileri(e);
		let topSaymaInd = 0, topSaymaSayisi = 0; for (const is of isListe) { topSaymaInd += (is.isSaymaInd || 0); topSaymaSayisi += (is.isSaymaSayisi || 0) }
		return (
			`<div class="ust ust-alt${sinyalKritik ? ' sinyal-kritik' : ''}${duraksamaKritik && kritikDurNedenmi ? ' duraksama-kritik' : ''}${kritikDurNedenmi ? ' kritik-durNeden' : ''}">
				<table class="oemBilgileri parent">
				<tbody>
				${grupsuzmu ?
					`<tr class="hat item">
						<td class="islemTuslari"><button id="hatSec" aria-disabled="true">HAT</button></td>
						<td colspan="2" class="veri"><span class="kod">${rec.hatKod || ''}</span> <span class="adi">${rec.hatAdi || ''}</span></td>
					</tr>` : '' }
					<tr class="tezgah item">
						<!--<td class="islemTuslari"><button id="tezgahMenu">...</button></td>-->
						<td colspan="2" class="veri">
							<div class="asil float-left"><b>${rec.tezgahKod}</b>-${rec.tezgahAdi}</div>
							<div class="diger float-left flex-row">
								${ip ? `<div class="ip">(${ip ||''})</div>` : ''}
								${siradakiIsSayi ? `<div class="siradakiIsSayi"><span>+ </span><span class="_veri">${siradakiIsSayi}</span></div>` : ''}
								${ekBilgi ? `<button id="ekBilgiSil" class="ekBilgi">${ekBilgi}</button>` : ''}
								${zamanEtuduVarmi ? `<div class="zamanEtuduText">Zmn</div>` : ''}
							</div>
						</td>
					</tr>
					<tr class="personel item">
						<td class="islemTuslari"><button id="personelSec">PER</button></td>
						<td class="veri"><b>${rec.perKod}</b>-${rec.perIsim}</td>
					</tr>
				</tbody>
				</table>
				${isBilgiHTML}
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
								<td class="emir">${toStringWithFra(rec.emirMiktar || 0)}</td>
								<td class="uret">${toStringWithFra(rec.onceUretMiktar || 0)} <span class="ek-bilgi">+${toStringWithFra(rec.aktifUretMiktar || 0)}</span></td>
								<td class="isk">${toStringWithFra(rec.isIskMiktar || 0)}</td>
								<td class="net">${toStringWithFra(rec.isNetMiktar || 0)}</td>
							</tr></tbody>
						</table>
						<table class="gsc item">
							<thead><tr>
								<th class="cevrim">Çevrim</th>
								<th class="sayma">Sayma</th>
							</tr></thead>
							<tbody><tr>
								<td class="cevrim">${toStringWithFra(rec.onceCevrimSayisi || 0)} <span class="ek-bilgi">+${toStringWithFra(rec.aktifCevrimSayisi || 0)}</td>
								<td class="sayma"><span class="ind">${toStringWithFra(topSaymaInd || 0)}</span> <span class="ek-bilgi">/</span> <span class="topSayi">${toStringWithFra(topSaymaSayisi || 0)}</span></td>
							</tr></tbody>
						</table>
						<div class="aktifIsSayi item">
							${isListe?.length ? `<span class="veri">${isListe.length || 0}</span><span class="ek-bilgi"> iş</span>` : ''}
						</div>
					</div>
				</div>
				<td class="grafikler"><div class="grafik-parent parent">${this.getLayout_grafikler({ width: 100, isListe })}</div></td>
			</div>
			<div class="alt ust-alt flex-row${sinyalKritik ? ' sinyal-kritik' : ''}${duraksamaKritik && kritikDurNedenmi ? ' duraksama-kritik' : ''}${kritikDurNedenmi ? ' kritik-durNeden' : ''}" data-durum="${durumKod}">
				<table class="parent"><tbody><tr>
					<td class="sol item">
						<span class="durumText veri full-wh">${durumAdi || '??'}</span>
						<span class="nedenText sub-item">${durumKod == 'DR' ? durNedenAdi || '' : ''}</span>
					</td>
					<td class="sag item">
						${grupsuzmu ? `<button id="hatKod" aria-disabled="true">${rec.hatKod}</button>` : ''}
						<button id="makineDurum">MAK</button>
						<button id="tezgahMenu">...</button>
					</td>
				</tr></tbody></table>
			</div>`
		)
	}
	static gridCell_getLayout_isBilgileri(e) {
		e = e ?? {}; const _now = now(), rec = e.rec ?? e.inst ?? {}, isListe = rec.isListe ?? [], isBilgiItems = [], {sinyalKritik, maxAyrilmaDk} = rec;
		const grafikPart = new GaugeGrafikPart(), colors = grafikPart.colors ?? [];
		for (let i = 0; i < isListe.length; i++) {
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
}



/*
	<div class="gauge">
	  <label>30%</label>
	</div>
	<div class="gauge">
	  <label>30%</label>
	</div>
	<div class="gauge">
	  <label>50%</label>
	</div>
	<div class="gauge">
	  <label>70%</label>
	</div>


	0: normal
	1: (initwidth-kucult/2)
	2: (initwidth-kucult/2) + (initwidth-2*kucult/2) 
	3: (initwidth-kucult/2) + (initwidth-2*kucult/2) + (initwidth-3*kucult/2)
	n. islemde
	(n-1). deger + (initwidth - (n)*kucult/2)

	* { margin: 0; padding: 0; box-sizing: border-box }
body{ min-height: 100vh; display: grid; place-items: center }
.gauge {
  --thickness: 13px; --deg: calc(var(--percent) * 1.8deg);
  --init-width: 150px; --kucult: 30px; --parent-width: calc(var(--init-width) - var(--kucult) * (var(--index) - 1));
  --width: calc(var(--init-width) - var(--kucult) * var(--index));
  --top: calc(0px - ((var(--init-width) - var(--kucult) / 2) * (var(--index) + 1)));
  display: grid; place-items: center; position: relative; aspect-ratio: 1; border-radius: 50%;
  width: var(--width); top: var(--top);
  background-image:
    radial-gradient(closest-side, #fff 0%, #fff calc(100% - var(--thickness)), transparent calc(100% - var(--thickness))),
    conic-gradient(from -90deg, var(--color) 0deg var(--deg), transparent var(--deg) 180deg),
    conic-gradient(from -90deg, lightgray 0deg 180deg, transparent 180deg)
}
.gauge > label { font-size: 60%; font-weight: bold; position: relative; top: -20px }
.gauge:first-child { --percent: 20; --color: limegreen; --index: 0; --parent-width: 0px; --width: var(--init-width); --top: 0px }
.gauge:nth-child(2) { --percent: 30; --color: royalblue; --index: 1 }
.gauge:nth-child(3) { --percent: 50; --color: orangered; --index: 2 }
.gauge:nth-child(4) { --percent: 70; --color: orange; --index: 3 }

*/
