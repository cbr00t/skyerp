// class MQTabTestFis extends mixin($TabFisTemplate, MQGenelFis) {
class MQTabTestFis extends MQTabFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return MQTabTestFisDetay }
	static pTanimDuzenle({ pTanim }) {
		// MQOrtakFis.pTanimDuzenle(...arguments)
		super.pTanimDuzenle(...arguments)
	}
	static async rootFormBuilderDuzenle_tablet(e) {
		await super.rootFormBuilderDuzenle_tablet(e)
		let {sender: tanimPart, inst, rootBuilder: rfb, kaForm, tanimFormBuilder: tanimForm} = e
		// tanimForm.addForm().setLayout(() => $(`<p><h3>hello world from ${this.name}</h3></p>`))
	}
	static async rootFormBuilderDuzenle_tablet_acc({ sender: tanimPart, acc }) {
		await super.rootFormBuilderDuzenle_tablet_acc(...arguments)
		acc.onExpand(e => setTimeout(() => {
			let {barkodPart} = tanimPart
			barkodPart?.focus()
		}, 1))
	}
	static async rootFormBuilderDuzenle_tablet_acc_dipCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_detayCollapsed(...arguments)
		let {fisTopNet, detaylar: { length: topSatir }} = fis
		rfb.addForm().setLayout(() => $([
			`<div class="flex-row" style="gap: 10px">`,
				`<div class="orangered"><b>${fisTopNet}</b> TL</div>`,
				`<div class="royalblue"><b>${topSatir}</b> satır</div>`,
			`</div>`
		].join(CrLf)))
	}
	static async rootFormBuilderDuzenle_tablet_acc_detay({ sender: tanimPart, sender: { acc }, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_detay(...arguments)
		let {detaylar} = fis
		rfb.addSimpleComboBox('barkod', 'Barkod', 'Barkod giriniz')
			.addStyle(`$elementCSS { max-width: 800px }`)
			.etiketGosterim_yok().autoClear()
			.setMFSinif(MQTabStok)
			//.noMF()
			.degisince(({ type, events = [], ...rest }) => {
				if (type != 'batch')
					return
				let barkodlar = events.map(_ => _.value).filter(_ => _)
				this.barkodOkundu({ ...arguments, ...rest, tanimPart, barkodlar })	
			})
			.onAfterRun(({ builder: { rootPart, part } }) => {
				rootPart.barkodPart = part
				part.focus()
			})
		rfb.addGridliGosterici('grid')
			.addStyle_fullWH(null, `calc(var(--full) - 50px)`)
			.rowNumberOlmasin().notAdaptive()
			.widgetArgsDuzenleIslemi(({ args }) => $.extend(args, {
				rowsHeight: 70
			}))
			.setTabloKolonlari([
				new GridKolon({ belirtec: '_text', text: 'Ürün' }),
				new GridKolon({ belirtec: 'netBedel', text: 'Bedel', genislikCh: 13 }).tipDecimal_bedel(),
				new GridKolon({ belirtec: '_sil', text: ' ', genislikCh: 6 })
					.tipButton('X')
					.onClick(({ gridRec, args: { owner: w } }) => {
						w.deleterow(gridRec.uid)
						acc?.render()
					})
			])
			.setSource(detaylar)
			.onAfterRun(({ builder: { rootPart, part } }) =>
				rootPart.gridPart = part)
	}
	static async barkodOkundu({ tanimPart, barkodlar }) {
		let results = await Promise.allSettled(barkodlar.map(barkod => app.barkodBilgiBelirle({ barkod })))
		results = results.filter(_ => _.value && _.status == 'fulfilled').map(_ => _.value)
		if (empty(results))
			return
		/*{
			let html = [
				`<div>Belirlenen ürünler:</div>`,
				`<ul>`,
				...results.map(({ shAdi: val }) => `<li>${val}</li>`),
				'</ul>'
			].join(CrLf)
			eConfirm(html, 'Barkod Okundu')
		}*/
		let {acc, inst: fis, inst: { class: { detaySinif }}, gridPart, gridPart: { gridWidget: w } = {}} = tanimPart
		if (w) {
			w.beginupdate()
			try {
				for (let item of results) {
					let det = new detaySinif(item)
					await det.detayEkIslemler({ ...arguments, fis })
					w.addrow(null, det, 'first')
				}
			}
			finally {
				w.endupdate(false)
				w.clearselection()
				w.selectrow(0)
				acc?.render()
			}
		}
	}
}

class MQTabTestFisDetay extends MQTabFisDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ioAttrListe() {
		let {_ioAttrListe: result} = this
		if (!result)
			result = this._ioAttrListe = ['shKod', 'shAdi', 'barkod', 'miktar', 'fiyat', 'kdvOrani', 'bedel', 'netBedel']
		return result
	}
	static get rowAttrListe() {
		let {_rowAttrListe: result} = this
		if (!result)
			result = this._rowAttrListe = ['shKod', 'shAdi', 'barkod', 'miktar', 'fiyat', 'kdvOrani', 'bedel', 'netBedel']
		return result
	}
	static get io2RowAttr() {
		let {_io2RowAttr: result} = this
		if (!result) {
			let {ioAttrListe, rowAttrListe} = this
			result = this._io2RowAttr = {}
			ioAttrListe.forEach((ioAttr, i) => {
				let rowAttr = rowAttrListe[i]
				if (rowAttr)
					result[ioAttr] = rowAttr
			})
		}
		return result
	}
	get _text() {
		let {shAdi, shKod, barkod, miktar, fiyat} = this
		let text = [
			`<div>`,
				`<span class="asil">${shAdi}</span>`,
				`<span class="ek-bilgi bold float-right" style="padding-left: 10px">${shKod}</span>`,
			`</div>`,
			`<div>`,
				`<span class="asil orangered">${barkod}</span>`,
				`<span class="ek-bilgi bold float-right" style="padding-left: 10px">${miktar}</span>`,
			`</div>`
		].join(CrLf)
		return text
	}
	
	constructor(e = {}) {
		super(e)
		let {class: { ioAttrListe: ioKeys }} = this
		for (let {ioAttr} of TicIskYapi.getIskIter())
			ioKeys.push(ioAttr)
		ioKeys.push('_text')
		for (let k of ioKeys) {
			let v = e[k]
			if (v != null)
				this[k] = v
		}
		this.miktar ??= 1; this.fiyat ??= 0; this.kdvOrani ??= 0
		this.bedel ??= 0; this.netBedel ??= 0
		let {carpan} = e
		if (carpan && carpan != 1)
			this.miktar *= carpan
	}
	detayEkIslemler({ fis } = {}) {
		this.bedelHesapla({ fis })
	}
	bedelHesapla({ fis } = {}) {
		let {miktar, fiyat} = this
		miktar ??= 0; fiyat ??= 0
		this.bedel = roundToBedelFra(miktar * fiyat)
		this.netBedelHesapla(...arguments)
	}
	netBedelHesapla({ fis } = {}) {
		let {bedel: netBedel} = this
		for (let {rowAttr} of TicIskYapi.getIskIter())
			netBedel -= this[rowAttr] ?? 0
		netBedel = roundToBedelFra(netBedel)
		this.netBedel = netBedel
	}
	hostVarsDuzenle({ fis, hv }) {
		super.hostVarsDuzenle(...arguments)
		let {io2RowAttr} = this
		for (let [r, i] of entries(io2RowAttr))
			hv[r] = this[i] ?? ''
	}
	setValues({ fis, rec }) {
		super.setValues(...arguments)
		let {io2RowAttr} = this
		for (let [r, i] of entries(io2RowAttr)) {
			let v = rec[i]
			if (v != null)
				this[r] = v
		}
	}
}
