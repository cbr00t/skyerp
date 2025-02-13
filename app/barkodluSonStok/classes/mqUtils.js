class MQBarkodluSonStok extends MQMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kodListeTipi() { return 'BARKODLU_SONSTOK' } static get sinifAdi() { return 'Barkodlu Son Stok' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get secimSinif() { return null } static get noAutoFocus() { return true }
	static get kolonDuzenlemeYapilirmi() { return false } static get kolonFiltreKullanilirmi() { return true }
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
		let sent = new MQSent({
			from: 'sonstok son', where: { degerAta: stokKod, saha: 'son.stokkod' },
			fromIliskiler: [{ from: 'stkmst stk', iliski: 'son.stokkod = stk.kod' }],
			sahalar: ['stk.brm', 'son.yerkod yerKod', 'SUM(son.sonmiktar) miktar']
		}); sent.groupByOlustur();
		let styled = true, recs = [ { etiket: 'ÜRÜN', veri: new CKodVeAdi([stokKod, stokAdi]).parantezliOzet({ styled }) } 	];
		for (let {yerKod, miktar} of await app.sqlExecSelect(sent)) { recs.push({ etiket: `<span class=gray>Yer:</span> <b>${yerKod}</b>`, veri: numberToString(miktar) }) }
		return recs
	}
	static barkodOkutuldu({ fbd, target }) {
		const {rootPart} = fbd; rootPart.barkod = target.value?.trim();
		target.value = ''; rootPart.tazele(); rootPart.veriYuklenince(() => target.focus())
	}
}
