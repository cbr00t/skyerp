class MQProforma extends MQGuid {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PROFORMA' } static get sinifAdi() { return 'Proforma Gösterimi' }
	static get table() { return 'alimproforma' } static get tableAlias() { return 'prf' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get secimSinif() { return null } static get kolonFiltreKullanilirmi() { return false }
	static get tumKolonlarGosterilirmi() { return true }
	static get gridIslemTuslariKullanilirmi() { return false }
	static get seviyeAcKapatKullanilirmi() { return false }
	// static get noAutoFocus() { return true }

	static listeEkrani_init({ sender: gridPart }) {
		super.listeEkrani_init(...arguments)
		gridPart.secinceKontroluYapilmaz()
	}
	static listeEkrani_afterRun({ sender: gridPart }) {
		super.listeEkrani_afterRun(...arguments)
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e)
		let { liste, gridPart = e.sender, part: { ekSagButonIdSet: sagSet } } = e
		let items = [
			{ id: 'izle', handler: _e => this.izleIstendi({ ..._e, ...e, gridPart }) },
			// { id: 'tamam', handler: _e => this.tamamIstendi({ ..._e, ...e, gridPart }) }
		]
		liste.push(...items)
		extend(sagSet, asSet(items.map(_ => _.id)))
	}
	static rootFormBuilderDuzenle_listeEkrani({ sender: gridPart, rootBuilder: rfb }) {
		super.rootFormBuilderDuzenle_listeEkrani(...arguments)
		let { islemTuslari, parentRec: rec } = gridPart
		let fbd_islemTuslari = rfb.addForm('islemTuslari')
			.setLayout(() => islemTuslari)
			.addStyle(
				`$elementCSS button#sec { margin-right: 30px }
				 $elementCSS button#izle { margin-right: 10px }`
			)
		rfb.addForm('header')
			.setParent(() => islemTuslari.find('.sol'))
			.setLayout(() => $(MQOnayci.getHTML({ rec })))
			.addCSS('absolute fs-110')
			.addStyle(`$elementCSS { top: 3px; left: 90px }`)
	}
	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		let mini = isMiniDevice()
		extend(args, {
			columnsMenu: !mini,
			showGroupsHeader: false,
			rowsHeight: 200,
			// rowsHeight: mini ? 130 : 90
		})
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e)
		let { tableAlias: alias, adiSaha } = this
		let { sender: gridPart, liste } = e
		let mini = isMiniDevice()
		
		liste.push(...[
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 13 }).noSql().tipDate().checkedList(),
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', minWidth: 20 * katSayi_ch2Px }).noSql().input(),
			new GridKolon({
				filterable: false, sortable: false, groupable: false,
				belirtec: 'content', text: 'İçerik', genislikCh: 60,
				cellsRenderer: (cd, i, k, _v, h, jc, r) => {
					let { dosyaAdi: v } = r
					if (v) {
						let url = this.getFileURL(v)
						h = (
							`<iframe
								class="full-wh"
								style="
									border: none; margin: 0; padding: 0;
									pointer-events: none;
									${
										config.colorScheme == 'dark'
											? `; filter: invert(1) hue-rotate(180deg)`
											: ''
									}
								"
								src="data:text/html;,<html><body><img style='width: ${jc.width - 25}px' src='${url}'></img></body></html>"
								onclick="${this.name}.izleIstendi({ gridPart: app.activeWndPart })"
							></iframe>`
						)
					}
					return h
				}
			}).noSql(),
			new GridKolon({ belirtec: 'dosyaAdi', text: 'Dosya Adı', genislikCh: 20, hidden: mini }).noSql().input()
		].filter(Boolean))
	}
	static loadServerData_queryDuzenle({ sender: gridPart, sent }) {
		super.loadServerData_queryDuzenle(...arguments)
		let { tableAlias: alias } = this
		let { from, where: wh, sahalar } = sent
		let { _db: db, mustKod } = gridPart.parentRec
		if (db) {
			let tbl = from.liste[0]
			tbl.deger = `${db}..${tbl.deger}`
		}
		sent.addWithAlias(alias, 'id', 'tarih', 'aciklama', 'hamdosyaadi dosyaAdi')
		wh.degerAta(mustKod, `${alias}.mustkod`)
	}
	static orjBaslikListesi_satirTiklandi(e = {}) {
		let { gridPart = e.sender, event: { args } = {} } = e
		let gridWidget = args?.owner ?? gridPart.gridWidget
		delay(100).then(() => {
			let { belirtec: k = gridWidget?._clickedcolumn } = e
			let { rec = gridPart.selectedRec } = e
			if (rec && k == 'content')
				this.izleIstendi({ ...e, gridPart, rec })
		})
	}
	static async izleIstendi({ gridPart, recs, rec }) {
		let islemAdi = 'İzle'
		recs ??= rec ? makeArray(rec) : gridPart.selectedRecs
		if (empty(recs)) {
			hConfirm(`İzlenecek satırlar seçilmelidir`, islemAdi)
			return
		}
		
		for (let r of recs) {
			let { dosyaAdi: v } = r
			let url = this.getFileURL(v)
			openNewWindow(url)
			await delay(10)
		}
	}
	/*static tamamIstendi({ gridPart }) {
		let islemAdi = 'Belgeye Bağla'
		let { selectedRecs: recs } = gridPart
		if (empty(recs)) {
			hConfirm(`Belgeye Bağlanacak satır seçilmelidir`, islemAdi)
			return
		}
		if (recs.length != 1) {
			hConfirm(`Belgeye Bağlanacak sadece 1 satır seçilmelidir`, islemAdi)
			return
		}

		let { parentRec: pr, parentPart } = gridPart
		pr.proformaId = recs[0].id
		this.close()
		delay(100).then(() =>
			parentPart?.tazeleIstendi())
	}*/

	static getFileURL(n) {
		let { params: { proforma } } = app
		let { anaBolum: rootDir } = proforma
		
		let remoteFile = [rootDir, n]
			.filter(Boolean)
			.join('/')
			.replaceAll('\\', '/')
		
		return app.getWSUrl({
			api: 'download',
			args: { stream: true, remoteFile }
		})
	}
}
