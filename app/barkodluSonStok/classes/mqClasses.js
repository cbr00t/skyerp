class MQBarkodluSonStok extends MQDetayliMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this; this.Delim_HMR = ' | ' }
	static get kodListeTipi() { return 'BARKODLU_SONSTOK' } static get sinifAdi() { return 'Barkodlu Son Stok' }
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
				}) /* input.detach().prependTo(parent) */
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
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); let {args} = e; $.extend(args, { rowsHeight: 60, showstatusbar: true, statusbarheight: 55, showaggregates: true }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const{liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'etiket', text: 'Etiket', genislikCh: 40, filterType: 'checkedlist' }).noSql(),
			new GridKolon({ belirtec: 'veri', text: 'Veri', minWidth: 400, maxWidth: 900, filterType: 'checkedlist', aggregates: [ { TOP: gridDipIslem_sum }, { ORT: gridDipIslem_avg_minus1 }] }).noSql()
		)
	}
	static async loadServerDataDogrudan(e) {
		let gridPart = e.gridPart ?? e.sender, {barkod} = gridPart; if (!barkod) { return [] }
		let barkodBilgi = (await app.barkodBilgiBelirle(barkod)) ?? {}, {shKod: stokKod, shAdi: stokAdi} = barkodBilgi;
		if (stokAdi == null) { return [] }
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
	static orjBaslikListesi_argsDuzenle_detaylar(e) { super.orjBaslikListesi_argsDuzenle(e); let {args} = e; $.extend(args, { rowsHeight: 33, showstatusbar: true, statusbarheight: 33, showaggregates: true }) }
	static orjBaslikListesiDuzenle_detaylar(e) {
		super.orjBaslikListesiDuzenle_detaylar(e); let {liste} = e;
		let cellClassName = (colDef, rowIndex, belirtec, value, rec) => {
			let {belirtec: tip} = rec, result = [belirtec];
			switch (belirtec) {
				case 'veri': {
					let value = parseFloat(rec.veri);
					if (!isNaN(value)) { result.push(!value ? 'darkgray' : value < 0 ? 'red' : 'green') }
				} break
			}
			return result.join(' ')
		};
		liste.push(
			new GridKolon({ belirtec: 'etiket', text: 'Ek Özellik', minWidth: 600, maxWidth: 1000, filterType: 'checkedlist', cellClassName }).noSql(),
			new GridKolon({ belirtec: 'veri', text: 'Miktar', genislikCh: 15, filterType: 'checkedlist', cellClassName, aggregates: [ { TOP: gridDipIslem_sum } ] }).tipDecimal(null).noSql()
		)
	}
	static async loadServerData_detaylar(e) {
		let {parentRec} = e, {yerKod, stokKod} = parentRec;
		let {table, tableAlias: alias} = this, sent = new MQSent({
			from: `${table} ${alias}`,
			where: [{ degerAta: stokKod, saha: `${alias}.stokkod` }, `${alias}.sonmiktar <> 0`]
		}), {where: wh, sahalar} = sent;
		if (yerKod != null) { wh.degerAta(yerKod, `${alias}.yerkod`) }
		let hmrCount = 0, hmrBilgiler = Array.from(HMRBilgi.hmrIter());
		for (const {belirtec, rowAttr, kami, mfSinif} of hmrBilgiler) {
			const tip = belirtec.toUpperCase(), hmrTable = kami ? mfSinif?.table : null;
			if (hmrTable) {
				let {tableAlias: hmrTableAlias, idSaha, adiSaha} = mfSinif;
				sent.fromIliski(`${hmrTable} ${hmrTableAlias}`, `${alias}.${rowAttr} = ${hmrTableAlias}.${idSaha}`);
				sahalar.add(`${alias}.${rowAttr} ${belirtec}kod`);
				if (adiSaha) { sahalar.add(`${hmrTableAlias}.${adiSaha} ${belirtec}adi`) }
				switch (tip) {
					case 'RENK': sahalar.add(`${hmrTableAlias}.oscolor1`, `${hmrTableAlias}.uyarlanmisoscolor2 oscolor2`); break
					case 'DESEN': sahalar.add(`${hmrTableAlias}.imagesayac`); break
				}
			}
			else { sahalar.add(`${alias}.${rowAttr} ${belirtec}`) }
			hmrCount++
		}
		if (!hmrCount) { return [] }
		sahalar.add(`SUM(${alias}.sonmiktar) miktar`); sent.groupByOlustur();
		let {Delim_HMR: delim} = this, anahStr2Item = {}; for (let rec of await app.sqlExecSelect(sent)) {
			let {oscolor1, oscolor2, imagesayac, miktar} = rec; if (!miktar) { continue }
			let etiket = hmrBilgiler.map(({ rowAttr, rowAdiAttr }) => (rec[rowAdiAttr] || rec[rowAttr])?.toString() ?? '').filter(x => !!x).join(delim);
			if (oscolor1) {
				let color = { start: os2HTMLColor(oscolor1), end: os2HTMLColor(oscolor2) };
				etiket = `<div class="full-wh" style="font-weight: bold; color: ${getContrastedColor(color.start ?? '')}; background-repeat: no-repeat !important; background: linear-gradient(180deg, ${color.end} 20%, ${color.start} 80%) !important">${etiket}</div>`
			}
			if (imagesayac) {
				let url = `${app.getWSUrlBase({ wsPath: 'ws/genel' })}/dbResimData/?id=${imagesayac}`;
				etiket = `<div class="grid-resim full-wh" style="font-weight: bold; background-repeat: no-repeat !important; background-size: cover; background-image: url(${url}) !important">${etiket}</div>`
			}
			let item = anahStr2Item[etiket] = anahStr2Item[etiket] || { ...rec, etiket, veri: 0 };
			item.veri += miktar
		}
		return Object.values(anahStr2Item)
	}
	static barkodOkutuldu({ fbd, target, barkod }) {
		const {rootPart} = fbd; if (rootPart) { rootPart.barkod = barkod ?? target?.value?.trim() }
		if (target) { target.value = '' } rootPart?.tazele(); rootPart?.veriYuklenince(() => target?.focus())
	}
}
