class RaporGosterPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'raporGoster' }
	static get isWindowPart() { return true }
	get wndDefaultIsModal() { return false }
	
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { inst: e.inst || new RaporcuInst(), rRaporOlustuHandler: e.rRaporOlustuHandler });
		this.title = e.title == null ? 'Raporcu' : e.title || ''
	}
	runDevam(e) {
		e = e || {}; super.runDevam(e);
		const {inst, layout} = this, {raporcu} = inst;
		if (raporcu) raporcu._promise_wait = raporcu.kategorileriOlustur()
		const header = this.header = layout.find('.header');
		$.extend(this, {
			islemTuslari: header.find('#islemTuslari'),
			secimlerSplit: layout.find('.secimlerSplit.parent'),
			secimlerOncesiParent: layout.find('.secimlerOncesi.parent')
		});
		const styleci_marginTop = e => `${e.builder.getCSSElementSelector(e.builder.input)} { margin-top: 13px !important }`;
		const builder = this.builder = new RootFormBuilder({
			part: this, layout: e => e.builder.part.secimlerOncesiParent,
			inst: e => e.builder.part.inst
		}).autoInitLayout().add(
			new FBuilderWithInitLayout().yanYana(2).add(
				new FBuilder_ModelKullan({
					id: 'rapSayac', etiket: 'Rapor', mfSinif: RRapor,
					visibleKosulu: e => { const inst = e.inst ?? e.fis ?? e.builder.inst, raporGrup = inst?.raporcu?.raporGrup ?? inst?.raporGrup; return !!raporGrup },
					ozelQueryDuzenle: e => {
						const inst = e.inst ?? e.fis ?? e.builder.inst, raporGrup = inst?.raporcu?.raporGrup ?? inst?.raporGrup, {sent} = e;
						const alias = e.alias || inst?.class?.tableAlias || e.mfSinif?.tableAlias;
						if (raporGrup) sent.where.degerAta(raporGrup, `${alias}.raporgrup`)
						sent.sahalar.add(`${alias}.ekaciklama`, `${alias}.frvarmi`)
					},
					ekDuzenleyici: e => {
						const {recs} = e;
						for (const rec of recs) {
							const {ekaciklama} = rec; if (ekaciklama) rec.aciklama += ` (<span class="ek-bilgi lightgray">${ekaciklama}</span>)`
							const frVarmi = asBool(rec.frvarmi);
							if (frVarmi) { const {aciklama} = rec; rec.aciklama = `<div class="rapor-frVar" style="width: 100%;">${aciklama} <span class="ek-bilgi royalblue bold" style="margin-left: 20px;">[ FR ]</span></div>` }
						}
					},
					veriYuklenince: e => {
						const {sender, recs} = e;
						if (sender.value == null && !$.isEmptyObject(recs)) { const {mfSinif} = sender, kodSaha = sender.kodSaha || (mfSinif ? mfSinif.kodSaha : MQKA.kodSaha); sender.value = recs[0][kodSaha] }
					},
					degisince: e => this.rRaporOlustur(e),
					listeArgsDuzenle: e => {
						const {sender, builder} = e, {rootPart} = builder, {inst} = rootPart, {raporcu} = inst;
						sender.tanimOncesiEkIslemler = e => e.tanimPart.raporcu = raporcu
					}
				}).dropDown().noAutoWidth().kodsuz()
					.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} { min-width: 400px !important; max-width: 900px !important; }`)
					.addStyle(styleci_marginTop),
				new FBuilder_ModelKullan({
					id: 'raporTip', etiket: 'Rapor Tip',
					source: RaporTip.instance.kaListe
				}).dropDown().noAutoWidth().noMF().kodsuz()
					.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} { min-width: 400px !important; max-width: 800px !important; }`)
					.addStyle(styleci_marginTop)
			)
		);
		builder.run();
		const secimlerPart = this.secimlerPart = new SecimlerPart({
			parentPart: this, content: layout.find('#secimler'),
			secimler: raporcu, kolonFiltreDuzenleyici: this.getKolonFiltreDuzenleyici(e)
		});
		secimlerPart.run();
		this.initIslemTuslari(e);
		const {rapSayac} = inst;
		if (rapSayac) this.rRaporOlustur()
	}
	afterRun(e) {
		super.afterRun(e);
		const {secimlerPart, wnd, header} = this;
		if (secimlerPart) secimlerPart.wnd = wnd;
		this.show();
		this.secimlerSplit.jqxSplitter({
			theme: theme, width: '100%', height: wnd.height() - header.height(), orientation: 'horizontal', splitBarSize: 20,
			panels: [ { min: 90, size: 175 }, { min: '70%' } ]
		})
	}
	destroyPart(e) {
		const {secimlerPart} = this;
		if (secimlerPart && !secimlerPart.isDestroyed) { secimlerPart.destroyPart(e); delete this.secimlerPart }
		super.destroyPart(e)
	}
	initWndArgsDuzenle(e) { super.initWndArgsDuzenle(e); const {wndArgs} = this; }
	initIslemTuslari(e) {
		const {islemTuslari} = this; let _e = { args: { sender: this, layout: islemTuslari } };
		if (this.islemTuslariArgsDuzenle(_e) === false) return null
		const islemTuslariPart = this.islemTuslariPart = new ButonlarPart(_e.args); islemTuslariPart.run(); return islemTuslariPart
	}
	islemTuslariArgsDuzenle(e) {
		const {args} = e; $.extend(args, {
			tip: 'vazgec',
			ekButonlarIlk: [
				{ id: 'raporEkrana', handler: e => this.raporEkranaIstendi(e) },
				{ id: 'raporDizayn', handler: e => this.raporDizaynIstendi(e) },
			],
			id2Handler: { vazgec: e => this.vazgecIstendi(e) }, ekSagButonIdSet: ['raporEkrana', 'raporDizayn']
		})
	}
	async rRaporOlustur(e) {
		e = e || {}; const {inst} = this, rapSayac = e.value == null ? inst.rapSayac : e.value;
		if (!rapSayac) return null
		const rRapor = new RRapor({ sayac: rapSayac }); await rRapor.yukle();
		inst.rRapor = rRapor; inst.rapSayac = rRapor.sayac;
		if (!this.rRaporOlustumu) {
			this.rRaporOlustumu = true; const {rRaporOlustuHandler} = this;
			if (rRaporOlustuHandler)
				setTimeout(() => getFuncValue.call(this, rRaporOlustuHandler, $.extend({}, e, { sender: this, inst: inst, rRapor: rRapor })), 10)
		}		
		return rRapor
	}
	async raporEkranaIstendi(e) {
		e = e || {}; const {inst} = this, {raporcu, rRapor, rapSayac} = inst;
		if (!raporcu) return; if (!rRapor) { hConfirm('Lütfen bir rapor seçiniz', this.title); return }
		const {secimlerPart} = this;
		const kolonFiltreDuzenleyici = secimlerPart.kolonFiltreDuzenleyici || {};
		const filtreBilgi = kolonFiltreDuzenleyici._filtreBilgi || {};
		const filtreRecs = filtreBilgi.recs || [], {secimler} = secimlerPart, secimlerObj = secimler.asObject;
		if (raporcu._promise_wait) { await raporcu._promise_wait; delete raporcu._promise_wait }
		let dataSource, _e = $.extend({}, e, { sender: this, inst, builder: this.builder, rapSayac, rRapor, dataSource: {}, relations: [], filtreRecs });
		try {
			dataSource = await raporcu.dataSourceOlustur(_e); if (!dataSource) return;
			_e.dataSource = dataSource
		}
		catch (ex) {
			console.error(ex); const errorText = ex && ex.errorText ? ex.errorText : getErrorText(ex);
			hConfirm(errorText, this.title); return
		}
		if (!dataSource) { hConfirm('Gösterilecek bilgi yok', this.title); return }
		/*const result = await app.wsFRRaporExport_pdf(_e);
		if (result && result.url) openNewWindow(result.url, '_blank')*/
		showProgress(' ', this.title); let result;
		try {
			const {raporTip} = inst, raporTip_gridmi = raporTip.char == 'grid';
			const wsArgs = {
				exportType: raporTip.char, raporGrup: raporcu.raporGrup, rapSayac,
				secimler: secimlerObj, dataSource, relations: _e.relations
			};
			if (rRapor.frXMLStr) wsArgs.frXMLStr = _e.frXMLStr || rRapor.frXMLStr;
			else wsArgs.frxDosya = _e.frxDosya || 'f:/tmp/test.frx';
			if (raporTip_gridmi) { $.extend(_e, wsArgs); this.raporGoster_grid(_e) }
			else {
				result = await app.wsFRRaporExport(wsArgs);
				if (result?.url) await downloadFile(result.url, undefined, undefined, raporTip.secilen?.ekBilgi?.newWindow)
			}
		}
		catch (ex) { console.error(ex); const errText = getErrorText(ex); hConfirm(errText, this.title) }
		finally { setTimeout(() => hideProgress(), 1000) }
	}
	raporGoster_grid(e) {
		let {inst} = this, {raporcu, rRapor} = inst, {dataSource, filtreRecs} = e, islemeAlinamayanFiltreRecs = e._islemeAlinamayanFiltreRecs;
		let fbd_islemTuslari = new FormBuilder({
			id: 'islemTuslari',
			buildEk: e => {
				const {builder} = e, {rootPart, parentBuilder} = builder, {layout} = parentBuilder;
				const header = $(`<div class="header"/>`).appendTo(layout);
				const islemTuslari = $(`<div id="islemTuslari"/>`).appendTo(header);
				const _e = {
					sender: rootPart, layout: islemTuslari, builder, tip: 'tazeleVazgec', ekButonlarIlk: [],
					id2Handler: { tazele: e => rootPart.gridPart.tazele(e), vazgec: e => rootPart.vazgecIstendi(e) }
				};
				const islemTuslariPart = rootPart.islemTuslariPart = new ButonlarPart(_e); islemTuslariPart.run()
			},
			styles: [
				e => `${e.builder.getCSSElementSelector(e.builder.parentBuilder.layout)} .header { width: 99%; margin-bottom: 0 }`,
				e => `${e.builder.getCSSElementSelector(e.builder.parentBuilder.layout)} .header #islemTuslari { text-align: right; height: 60px }`,
				e => `${e.builder.getCSSElementSelector(e.builder.parentBuilder.layout)} .header #islemTuslari button { width: 80px; margin: 0 1px }`
			]
		}).addStyle_fullWH()
		let fbd_grid = new FBuilder_Grid({
			id: 'grid', widgetArgsDuzenle: e => {
				const {builder} = e;
				$.extend(e.args, {
					rowsHeight: 40, groupsExpandedByDefault: true,
					showGroupsHeader: true, groupIndentWidth: 30, groupsHeaderHeight: 30,
					groupsRenderer: (text, group, expanded, groupInfo) => {
						let getRec;
						getRec = item => {
							const _rec = (item.subItems || [])[0]; if (_rec) return _rec
							for (const subGroup of item.subGroups || []) return getRec(subGroup)
						}
						const rec = getRec(groupInfo), colAttr = groupInfo.groupcolumn.datafield;
						const kir = rec ? builder.rootPart.grupAttr2Kirilma[colAttr] : null, ekStyle = `margin-right: 30px;`;
						const subElms = kir?.detaylar?.length
							? kir.detaylar.map(det => {
								const {degiskenmi} = det.class;
								const ekCSS = degiskenmi ? ' bold' : '', value = (degiskenmi ? rec[det.attr] : det.value) ?? '';
								return `<span class="grup-saha${ekCSS}" data-degiskenmi="${degiskenmi}" data-attr="${det.attrOrValue}" style="${ekStyle}">${value}</span>`
							  })
							: [`<span class="grup-saha" data-degiskenmi="${false}" data-attr="${colAttr}" style="${ekStyle}">${group}</span>`]
						return `<div class="grid-cell-group" style="font-size: 120%; color: #888;">${subElms.join('')}</div>`
					}
				})
			},
			tabloKolonlari: e => {
				const {builder} = e, {rootPart} = builder, {attr2Kolon} = raporcu;
				const grupAttr2Kirilma = rootPart.grupAttr2Kirilma = {}, grupAttrListe = rootPart.grupAttrListe = [], result = [];
				for (const kir of rRapor.gruplamalar) {
					const {detaylar} = kir; let grupAttr = (detaylar.find(saha => !saha.class.degiskenmi) || detaylar[0]).attr;
					// grupAttrListe, tazele sonrası grid gruplandırması için rootPart içinden alınacaktır
					if (grupAttr) grupAttrListe.push(grupAttr)
					for (const saha of detaylar) {
						const {attr} = saha, rKol = attr2Kolon[attr] || {};
						const etiket = saha.baslik || rKol.baslik || ''; grupAttr2Kirilma[attr] = kir;
						result.push(new GridKolon({
							belirtec: attr, text: etiket, genislikCh: saha.genislikCh || rKol.genislikCh,
							align: saha.align || rKol.align, tip: rKol.tip || saha.tip
						}))
					}
				}
				for (const saha of rRapor.detaylar) {
					const {attr} = saha, rKol = attr2Kolon[attr] || {}, etiket = saha.baslik || rKol.baslik || '';
					result.push(new GridKolon({
						belirtec: attr, text: etiket, genislikCh: saha.genislikCh || rKol.genislikCh,
						align: saha.align || rKol.align, tip: rKol.tip || saha.tip
					}))
				}
				return result
			},
			source: async e => {
				const ds = dataSource.Data; let recs = ds.veri;
				if (ds.tip == 'query') recs = await app.sqlExecSelect(recs)
				/*if (true) { if (!$.isEmptyObject(recs) && !$.isEmptyObject(filtreRecs) && $.isEmptyObject(islemeAlinamayanFiltreRecs)) islemeAlinamayanFiltreRecs.push(...filtreRecs) }*/
				if (!$.isEmptyObject(recs) && !$.isEmptyObject(islemeAlinamayanFiltreRecs)) {
					const _e = $.extend({}, e);
					recs = recs.filter(rec => {
						let duzgunmu = true;
						for (const filtreRec of islemeAlinamayanFiltreRecs) {
							const {attr} = filtreRec, rec_value = rec[attr];
							if (rec_value === undefined) continue; _e.rec = rec;
							if (!filtreRec.uygunmu(_e)) { duzgunmu = false; break }
						}
						return duzgunmu
					})
				}
				return recs
			},
			afterRun: e => {
				const {builder} = e, {rootPart} = builder, gridPart = rootPart.gridPart = builder.part, {grid, gridWidget} = gridPart;
				const groupsChangedHandler = rootPart.gridGroupsChangedHandler = evt => {
					let {args} = evt || {};
					if (!args) args = { owner: gridWidget, groups: gridWidget.groups };
					const {grupAttr2Kirilma} = rootPart, _gridWidget = args.owner, groupsSet = {}, _groups = args.groups || [];
					for (const attr of _groups) {
						const kir = grupAttr2Kirilma[attr];
						const altAttrListe = kir && !$.isEmptyObject(kir.detaylar) ? kir.detaylar.filter(saha => saha.class.degiskenmi).map(saha => saha.attr) : [attr];
						for (const altAttr of altAttrListe)
							groupsSet[altAttr] = true
					}
					const jqxCols = _gridWidget.columns.records; _gridWidget.beginupdate();
					for (const jqxCol of jqxCols) {
						const {datafield} = jqxCol;
						if (!datafield) continue
						const visible = !jqxCol.hidden;
						const flag = !groupsSet[datafield];
						if (visible != flag) _gridWidget[flag ? 'showcolumn' : 'hidecolumn'](datafield)
					}
					_gridWidget.endupdate(false)
				};
				grid.on('groupschanged', groupsChangedHandler);
				const gridGruplayici = rootPart.gridGruplayici = e => {
					const {rootPart} = e.builder, {grupAttrListe, gridPart} = rootPart, {grid} = gridPart;
					grid.jqxGrid('groups', grupAttrListe || []); groupsChangedHandler()
				};
				/* if (gridGruplayici) getFuncValue.call(this, gridGruplayici, e) */
			},
			bindingComplete: e => {
				const {builder, grid} = e, {gridGruplayici} = builder.rootPart;
				if (gridGruplayici) getFuncValue.call(this, gridGruplayici, e)
			},
			styles: [
				e => `${e.builder.getCSSElementSelector(e.builder.layout)} .jqx-grid-cell,
					  ${e.builder.getCSSElementSelector(e.builder.layout)} .jqx-grid-group-cell { font-size: 80% !important }`
			]
		}).gridliGosterici().addStyle_fullWH({ height: '99%' });
		const rfb = new RootFormBuilder({
			parentPart: this, inst: e => e.builder.parentPart.inst,
			formDeferMS: 1500, wndArgsDuzenle: e => $.extend(e.wndArgs, { isModal: false })
		}).asWindow('Rapor Ekranı').addCSS('raporEkrani part').addStyle_fullWH({ height: `calc(var(--full) - 75px)` });
		rfb.add(new FBuilderWithInitLayout().altAlta().add(fbd_islemTuslari, fbd_grid).addStyle_fullWH());
		rfb.run()
	}
	async raporDizaynIstendi(e) {
		e = e || {}; const {inst} = this, {raporcu, rRapor, rapSayac} = inst;
		if (!raporcu) return; if (!rRapor) { hConfirm('Lütfen bir rapor seçiniz', this.title); return }
		const islem = 'degistir'; rRapor.tanimla({ islem, raporcu })
	}
	getKolonFiltreDuzenleyici(e) {
		const $this = this;
		return new class extends CObject {
		    static { window[this.name] = this; this._key2Class[this.name] = this }
			uygunmu(e) { const {rRapor} = $this.inst; return !!rRapor }
			attrKAListe(e) {
				const {raporcu, rRapor} = $this.inst; rRapor.detayEkIslemler({ raporcu: raporcu });
				const result = [];
				for (const saha of rRapor.tumDegiskenSahalarIter()) {
					const {attr} = saha, baslik = (saha.baslik || '').replaceAll('\r', '').replaceAll('\n', ' ');
					/* if (baslik) baslik += ` <span class="ek-bilgi bold" style="font-size: 90%; color: #aaa; position: absolute; right: 8px;">[${attr}]</span>` */
					const tipBelirtec = saha.tipBelirtec || 'string', kaListe = tipBelirtec == 'tekSecim' ? (saha.tip || {}).kaListe : undefined;
					result.push(new CKodAdiVeEkBilgi({ kod: attr, aciklama: baslik || attr, ekBilgi: { tip: tipBelirtec, kaListe } }))
				}
				return result
			}
		}
	}
	onResize(e) { super.onResize(e); const {secimlerPart} = this; if (secimlerPart) secimlerPart.onResize(e) }
}
class RaporcuInst extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { e = e || {}; super(e); if (!this.raporcu) this.raporcu = e.modelRapor }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { rapSayac: new PInst(), raporTip: new PInstTekSecim(RaporTip), raporcu: new PInst() })
	}
}
class RaporTip extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'grid' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e);
		const {kaListe} = e, newWindow = true, ekBilgici = text =>
			`<span class="ek-bilgi" style="position: absolute; left: 150px;">(<i>${text}</i>)</span>`;
		kaListe.push(
			new CKodAdiVeEkBilgi(['grid', 'Seviyeli Rapor' + ekBilgici(`Grid üzerinde dinamik gösterim`)]),
			new CKodAdiVeEkBilgi(['fpx', 'Hazır Rapor' + ekBilgici(`<u>fpx</u> - Sadece bilgisayarınızda <b>FastReport</b> veya <b>VIO</b> yüklü ise kullanınız`)]),
			new CKodAdiVeEkBilgi(['pdf', 'PDF' + ekBilgici(`** <u>Hazır Rapor</u>'a göre biraz daha yavaştır **`), null, { newWindow }]),
			new CKodAdiVeEkBilgi(['pdc', 'PDF (Sıkıştırılmış)' + ekBilgici(`** Veri tasarrufu sağlar ancak <u>Hazır Rapor</u>'a göre oldukça yavaştır **`), null, { newWindow }]),
			new CKodAdiVeEkBilgi(['html', 'HTML' + ekBilgici(`Web Sayfası görünümü`), null, { newWindow }]),
			new CKodAdiVeEkBilgi(['text', 'Düz Metin' + ekBilgici(`Metin tabanlı / Nokta Vuruşlu yazdırmaya uygun çıktı`), null, { newWindow }]),
			new CKodAdiVeEkBilgi(['word', 'Word']),
			new CKodAdiVeEkBilgi(['excel', 'Excel']),
			new CKodAdiVeEkBilgi(['xml', 'Excel (XML)' + ekBilgici(`XML Formatında Excel çıktısı`), null, { newWindow }]),
			new CKodAdiVeEkBilgi(['csv', 'CSV' + ekBilgici(`<b>','</b> ile ayrılmış veri çıktısı`), null, { newWindow }]),
			new CKodAdiVeEkBilgi(['json', 'JSON' + ekBilgici(`<b>JSON</b> biçiminde veri çıktısı [<u>Yazılımsal kullanıma yönelik</u>]`), null, { newWindow }]),
			new CKodAdiVeEkBilgi(['png', 'Resim (PNG)' + ekBilgici(`<b>PNG</b> biçiminde resim çıktısı`), null, { newWindow }]),
			new CKodAdiVeEkBilgi(['tiff', 'Resim (TIFF)' + ekBilgici(`<b>TIFF</b> biçiminde resim çıktısı (<u>çoklu sayfa</u> desteği olan Tarama/Fax resim biçimi)`)])
		)
	}
}

/* modelRapor = new SonStokRapor();
	part = new RaporcuPart({ inst: new RaporcuInst({ modelRapor: modelRapor, rapSayac: 336, raporTip: new RaporTip('grid') }) }); part.run() */
