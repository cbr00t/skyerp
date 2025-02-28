class AIBarkodluSonStokApp extends MiscApp {
	static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return AIBarkodluSonStok.kodListeTipi }
	paramsDuzenle(e) {
		super.paramsDuzenle(e); const {params} = e;
		$.extend(params, {
			zorunlu: MQZorunluParam.getInstance(), isyeri: MQIsyeri.getInstance(), ticariGenel: MQTicariGenelParam.getInstance(),
            fiyatVeIsk: MQFiyatVeIskontoParam.getInstance(), stokBirim: MQStokBirimParam.getInstance(), stokGenel: MQStokGenelParam.getInstance(),
			web: MQWebParam.getInstance()
		})
	}
	async getAnaMenu(e) {
		const {noMenuFlag, params} = this; if (noMenuFlag) { return new FRMenu() } let items = [];
		const addMenuSubItems = (mne, text, ...classes) => {
			let subItems = classes.flat().map(cls => new FRMenuChoice({ mne: cls.kodListeTipi, text: cls.sinifAdi, block: e => cls.listeEkraniAc(e) }));
			let menuItems = []; if (subItems?.length) { menuItems = mne ? [new FRMenuCascade({ mne, text, items: subItems })] : subItems; items.push(...menuItems) }
			return menuItems
		};
		addMenuSubItems(null, null, [AIBarkodluSonStok]);
		return new FRMenu({ items })
	}
}
class MQBarkodluStok extends MQStok {
	static { window[this.name] = this; this._key2Class[this.name] = this } /* static get table() { return 'stkmst' } */ static get kolonDuzenlemeYapilirmi() { return false }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get secimSinif() { return null }
}
class AIBarkodluSonStok extends MQMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'AI_BARKODLU_SONSTOK' } static get sinifAdi() { return 'Barkodlu Son Stok' }
	static get table() { return 'sonstok' } static get tableAlias() { return 'son' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get secimSinif() { return null }
	static get kolonDuzenlemeYapilirmi() { return false } static get noAutoFocus() { return true }
	static listeEkrani_afterRun(e) {
		super.listeEkrani_afterRun(e); let gridPart = e.gridPart ?? e.sender ?? {}, {input} = gridPart.fbd_barkod ?? {};
		if (input) { setTimeout(() => input.focus(), 10) }
	}
	static listeEkrani_activated(e) {
		super.listeEkrani_activated(e); let gridPart = e.gridPart ?? e.sender ?? {}, {input} = gridPart.fbd_barkod ?? {};
		if (input) { setTimeout(() => input.focus(), 10) }
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); let {rootBuilder: rfb} = e;
		let gridPart = e.gridPart ?? e.sender, {layout, header} = gridPart;
		rfb.addStyle(() => `$elementCSS .jqx-grid .jqx-grid-column-header > div, $elementCSS .jqx-grid [role = row] > div { font-size: 130% !important }`);
		rfb.addButton('listedenSec', 'L').etiketGosterim_yok().setParent(header).addCSS('absolute').addStyle_fullWH(60).onClick(({ builder: fbd }) => {
			let secince = ({ value: barkod }) => this.barkodOkutuldu({ ...e, fbd, barkod });
			let ozelQueryDuzenle = ({ alias, sent }) => sent.where.add(`${alias}.silindi = ''`, `${alias}.satilamazfl = ''`, `${alias}.calismadurumu <> ''`);
			MQBarkodluStok.listeEkraniAc({ secince, ozelQueryDuzenle })
		}).addStyle(() => `$elementCSS { top: 0; left: 230px; min-width: unset !important; z-index: 1000 !important }`);
		rfb.addTextInput('barkod', 'Barkodu okutunuz').etiketGosterim_yok().setParent(header).addCSS('absolute center').addStyle_wh(500)
			.addStyle(() =>
				`$elementCSS { top: 0; left: 300px; z-index: 1001 !important }
				 $elementCSS > input { font-size: 150%; font-weight: bold }
				 $elementCSS > input:hover { color: royalblue } $elementCSS > input:focus { color: green }`
			)
			.onBuildEk(({ builder: fbd }) => {
				let {input, rootPart, parent} = fbd; rootPart.fbd_barkod = fbd;
				input.on('keyup', ({ key, currentTarget: target }) => {
					key = key?.toLowerCase(); if (!(key == 'enter' || key == 'linefeed')) { return }
					this.barkodOkutuldu({ ...e, fbd, target })
				})
			})
	}
	static ekCSSDuzenle(e) {
		let {rec, dataField: belirtec, result} = e; switch (belirtec) {
			case 'veri': {
				let value = parseFloat(rec.veri);
				if (!isNaN(value)) { result.push(!value ? 'darkgray' : value < 0 ? 'red' : 'green') }
			} break
		}
	}
	static orjBaslikListesi_argsDuzenle(e) {
      super.orjBaslikListesi_argsDuzenle(e); let {args} = e;
      $.extend(args, { rowsHeight: 60, showstatusbar: true, statusbarheight: 55, showaggregates: true })
    }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const{liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'etiket', text: 'Etiket', genislikCh: 40, filterType: 'checkedlist' }).noSql(),
			new GridKolon({ belirtec: 'veri', text: 'Veri', minWidth: 400, maxWidth: 900, filterType: 'checkedlist',
                            aggregates: [ { TOP: gridDipIslem_sum }, { ORT: gridDipIslem_avg_minus1 }] }).noSql()
		)
	}
	static async loadServerDataDogrudan(e) {
		let gridPart = e.gridPart ?? e.sender, {barkod} = gridPart; if (!barkod) { return [] }
		let barkodBilgi = (await app.barkodBilgiBelirle(barkod)) ?? {}, {shKod: stokKod, shAdi: stokAdi} = barkodBilgi;
		if (stokAdi == null) {  /* ürün yok, yeni kayıt aç */
			try {
	            const KodPrefix = 'AITST', aciklama = 'Bilinmeyen Ürün';
	            let sent = new MQSent({ from: 'stkmst', where: { like: `${KodPrefix}%`, saha: 'kod', aynenAlinsin: true }, sahalar: ['RTRIM(MAX(kod)) maxkod'] });
	            let kod = await app.sqlExecTekilDeger(sent), seq = asInteger(Array.from(kod ?? '').filter(x => isDigit(x)).join('')) || 0;
	            stokKod = `${KodPrefix}${seq + 1}`; let toplu = new MQToplu([
					new MQInsert({ table: 'stkmst', hv: { kod: stokKod, aciklama } }),
					new MQInsert({ table: 'sonstok', hv: { stokkod: stokKod, yerkod: 'A', sonmiktar: 1 } }),
					new MQInsert({ table: 'sbarref', hv: { refkod: barkod, stokkod: stokKod, varsayilan: bool2FileStr(true) /* '*' */ } })
				]).withDefTrn();  /* withDefTrn: generate transaction begin-end queries */
	            await app.sqlExecNone(toplu); stokAdi = aciklama
			}
			catch (ex) {
				console.error(ex); hConfirm(`<b>${barkod}</b> barkoduna ait ürün bulunamadı ve Yeni Ürün kaydı da yapılamadı!<p/><u class=bold>HATA:</u> <span class=red>${getErrorText(ex)}</span>`, 'Barkod için Yeni Ürün Kaydı İşlemi')
				return []
			}
		}
		let {table, tableAlias: alias} = this, sent = new MQSent({
			from: `${table} ${alias}`, where: [{ degerAta: stokKod, saha: `${alias}.stokkod` }, `${alias}.sonmiktar <> 0`],
			fromIliskiler: [{ from: 'stkmst stk', iliski: `${alias}.stokkod = stk.kod` }],
			sahalar: ['stk.brm', `${alias}.yerkod yerKod`]
		}), {where: wh, sahalar} = sent;
		sahalar.add(`SUM(${alias}.sonmiktar) miktar`); sent.groupByOlustur();
		let styled = true, recs = [ { stokKod, stokAdi, etiket: 'ÜRÜN', veri: new CKodVeAdi([stokKod, stokAdi]).parantezliOzet({ styled }) } ];
		for (const rec of await app.sqlExecSelect(sent)) {
			let {yerKod, miktar} = rec; $.extend(rec, { stokKod, stokAdi, etiket: `<span class=gray>Yer:</span> <b>${yerKod}</b>`, veri: numberToString(miktar) });
			recs.push(rec)
		}
		return recs
	}
	static barkodOkutuldu({ fbd, target, barkod }) {
		const {rootPart} = fbd; if (rootPart) { rootPart.barkod = barkod ?? target?.value?.trim() }
		if (target) { target.value = '' } rootPart?.tazele(); rootPart?.veriYuklenince(() => target?.focus())
	}
}
