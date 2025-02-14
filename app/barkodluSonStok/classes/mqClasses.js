class MQBarkodluSonStok extends MQMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'BARKODLU_SONSTOK' } static get sinifAdi() { return 'Barkodlu Son Stok' }
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
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); let {args} = e;
		$.extend(args, { rowsHeight: 60 })
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
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const{liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'etiket', text: 'Etiket', genislikCh: 40, filterType: 'checkedlist' }).noSql(),
			new GridKolon({ belirtec: 'veri', text: 'Veri', filterType: 'checkedlist' }).noSql()
		)
	}
	static async loadServerDataDogrudan(e) {
		let gridPart = e.gridPart ?? e.sender, {barkod} = gridPart; if (!barkod) { return [] }
		let barkodBilgi = (await app.barkodBilgiBelirle(barkod)) ?? {}, {shKod: stokKod, shAdi: stokAdi} = barkodBilgi;
		if (stokAdi == null) { return [] }
		let alias = 'son', sent = new MQSent({
			from: `sonstok ${alias}`, where: { degerAta: stokKod, saha: `${alias}.stokkod` },
			fromIliskiler: [{ from: 'stkmst stk', iliski: `${alias}.stokkod = stk.kod` }],
			sahalar: ['stk.brm', `${alias}.yerkod yerKod`]
		}), {where: wh, sahalar} = sent;
		/*for (const {belirtec, rowAttr, kami, mfSinif} of HMRBilgi.hmrIter()) {
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
		}*/
		sahalar.add('SUM(son.sonmiktar) miktar'); sent.groupByOlustur();
		let styled = true, recs = [ { etiket: 'ÜRÜN', veri: new CKodVeAdi([stokKod, stokAdi]).parantezliOzet({ styled }) } 	];
		for (const rec of await app.sqlExecSelect(sent)) {
			let {yerKod, miktar} = rec;
			recs.push({ etiket: `<span class=gray>Yer:</span> <b>${yerKod}</b>`, veri: numberToString(miktar) })
		}
		return recs
	}
	static barkodOkutuldu({ fbd, target, barkod }) {
		const {rootPart} = fbd; if (rootPart) { rootPart.barkod = barkod ?? target?.value?.trim() }
		if (target) { target.value = '' } rootPart?.tazele(); rootPart?.veriYuklenince(() => target?.focus())
	}
}
class MQBarkodluStok extends MQStok {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get secimSinif() { return null }
	static get kolonDuzenlemeYapilirmi() { return false }
}
