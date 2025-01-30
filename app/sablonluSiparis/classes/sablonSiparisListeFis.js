class SablonluSiparisListeOrtakFis extends MQOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Sipariş' } static get fisSinif() { return null }
	static get tableAlias() { return 'grp' } static get tanimUISinif() { return FisGirisPart }
	static get detaySinif() { return SablonluSiparisListeOrtakDetay } static get gridKontrolcuSinif() { return SablonluSiparisListeOrtakGridci }
	static get tumKolonlarGosterilirmi() { return true } static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get raporKullanilirmi() { return false } static get noSaha() { return null }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { sablonSayac: new PInstNum(), tarih: new PInstDateToday(), mustKod: new PInstStr(), fisSayac: new PInstNum() }) }
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); let {root: rfb, baslikForm: fbd_baslikForm} = e.builders, {builders: baslikFormlar} = fbd_baslikForm, {inst} = e;
		rfb.addStyle(e => `$elementCSS .islemTuslari { position: absolute !important; top: 3px !important }`);
		baslikFormlar[0].altAlta().addForm('_baslikBilgi')
			.addStyle(e =>
				`$elementCSS { font-size: 130% } $elementCSS > ._row { gap: 10px } $elementCSS > ._row:not(:last-child) { margin-bottom: 5px }
				$elementCSS .etiket { width: 100px !important } $elementCSS .veri { font-weight: bold; color: royalblue }`
			 ).setLayout(({ builder: fbd }) => {
				let {altInst: inst} = fbd, {tarih, mustKod, sablonSayac} = inst;
				return $(`<div class="full-width">
					<div class="flex-row" style="gap: 100px">
						<div class="tarih _row flex-row"><div class="etiket">Tarih</div><div style="margin-right: 10px"></div><div class="veri">${dateToString(inst.tarih) || ''}</div></div>
						<div class="sablon _row flex-row"><div class="etiket">Şablon</div><div class="veri">${sablonSayac || ''}</div></div>
					</div>
					<div class="must _row flex-row"><div class="etiket">Müşteri</div><div class="veri">${mustKod?.trim() || ''}</div></div>
				</div>`)
			}).onBuildEk(({ builder: fbd }) => {
				let {altInst: inst, layout} = fbd, {mustKod, sablonSayac} = inst;
				let setKA = async (selector, kod, aciklama) => {
					if (!selector) { return } let elm = layout.find(`.${selector}`); if (!elm?.length) { return }
					if (kod) {
						aciklama = await aciklama; if (!aciklama) { return }
						let text = aciklama?.trim(); if (kod && typeof kod == 'string') { text = `<span class="kod bold gray">${kod}</b> <span class="aciklama royalblue normal">${aciklama}</span>` };
						elm.find('.veri').html(text.trim()); elm.removeClass('jqx-hidden basic-hidden')
					}
					else { elm.addClass('jqx-hidden') }
				};
				setKA('sablon', sablonSayac, MQSablon.getGloKod2Adi(sablonSayac)); setKA('must', mustKod, MQCari.getGloKod2Adi(mustKod))
			})
	}
	async yukle(e) {
		e = e || {}; delete e.rec; await this.baslikVeDetaylariYukle(e); await this.detaylariYukleSonrasi(e);
		if (e.rec) { await this.yukleSonrasiIslemler(e) } return true
	}
	async baslikVeDetaylariYukle(e) {
		let {sablonSayac} = this, sent = e.sent = new MQSent({
			from: 'hizlisablongrup grp', fromIliskiler: [
				{ from: 'hizlisablondetay har', iliski: 'har.grupsayac = grp.kaysayac' },
				{ from: 'stkmst stk', iliski: 'har.stokkod = stk.kod' }
			],
			where: [{ degerAta: sablonSayac, saha: 'grp.fissayac' }, 'har.bdevredisi = 0', `stk.silindi = ''`, `stk.satilamazfl = ''`],
			sahalar: ['grp.kaysayac grupsayac', 'grp.seq grupseq', 'grp.grupadi', 'har.grupsayac', 'har.seq seq', 'stk.aciklama stokadi', 'stk.brm']
		}), stm = e.query = e.stm = new MQStm({ sent, orderBy: ['fissayac', 'grupseq', 'seq'] });
		let recs = await this.class.loadServerData_querySonucu(e), {parentRec, gridRec} = e, degistirmi = !!parentRec;
		$.extend(this, { tarih: gridRec?.tarih || this.tarih, mustKod: gridRec?.mustkod || this.mustKod });
		if (degistirmi) { }
		return true
	}
	getYazmaIcinDetaylar(e) { return super.getYazmaIcinDetaylar(e).filter(det => det.miktar) }
	async yeniTanimOncesiIslemler(e) { await super.yeniTanimOncesiIslemler(e); await this.detaylariDuzenle(e) }
	async detaylariYukleSonrasi(e) { await super.detaylariYukleSonrasi(e); await this.detaylariDuzenle(e) }
	yukleSonrasiIslemler(e) { }
	async detaylariDuzenle(e) {
		e = e ?? {}; e.inst = e.fis = this;
		let {detaySinif} = this.class, seq2Det = {}; for (let det of this.detaylar) { seq2Det[det.seq] = det }
		/*let {sender, inst, fis} = e, _e = { sender, inst, fis }, recs = await this.class.loadServerData_detaylar(_e), detaylar = [];
		for (let rec of recs) {
			let _det = seq2Det[rec.seq], det = new detaySinif(); det.setValues({ rec }); if (_det) { $.extend(det, _det) }
			let {stokKod, stokAdi} = det; if (stokKod != null) { det.stokText = `<b>${stokKod}</b> ${stokAdi}` }
			detaylar.push(det)
		}
		this.detaylar = detaylar*/
	}
	uiDuzenle_fisGirisIslemTuslari(e) { /* super yok */ }
}
class SablonluSiparisListeFis extends SablonluSiparisListeOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kodListeTipi() { return 'SSIP' } static get fisSinif() { return SatisSiparisFis }
	static get detaySinif() { return SablonluSiparisListeDetay } static get gridKontrolcuSinif() { return SablonluSiparisListeGridci }
}
class SablonluKonsinyeSiparisListeFis extends SablonluSiparisListeOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kodListeTipi() { return 'KSSIP' } static get sinifAdi() { return `Konsinye ${super.sinifAdi}` }
	static get detaySinif() { return SablonluKonsinyeSiparisListeDetay } static get gridKontrolcuSinif() { return SablonluKonsinyeSiparisListeGridci }
}

class SablonluSiparisListeOrtakDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'hizlisablondetay' } static get fisSayacSaha() { return 'grupsayac' }
	constructor(e) {
		e = e ?? {}; super(e); let {grupSayac, grupAdi, stokKod, stokAdi, brm, miktar} = e;
		$.extend(this, { grupSayac, grupAdi, stokKod, stokAdi, brm, miktar: miktar ?? 0 })
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {sent, fis} = e, {tableAlias: grupAlias} = fis.class, {tableAlias: harAlias} = this;
		let {where: wh, sahalar} = sent, {sablonSayac} = fis;
		sent.fromIliski(`hizlisablongrup ${grupAlias}`, `${harAlias}.grupsayac = ${grupAlias}.kaysayac`).fromIliski('stkmst stk', `${harAlias}.stokkod = stk.kod`)
		wh.add(`${harAlias}.bdevredisi = 0`, `stk.silindi = ''`, `stk.satilamazfl = ''`).degerAta(sablonSayac, `${grupAlias}.fissayac`);
		sahalar.add(`${grupAlias}.grupadi`, 'stk.aciklama stokadi', 'stk.brm brm')
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); let {hv} = e, {grupSayac: grupsayac, stokKod: stokkod} = this, miktar = this.miktar ?? 0;
		$.extend(hv, { grupsayac, stokkod, miktar })
	}
	setValues(e) {
		super.setValues(e); let {rec} = e, {grupsayac: grupSayac, grupadi: grupAdi, stokkod: stokKod, stokadi: stokAdi, brm, miktar} = rec;
		$.extend(this, { grupSayac, grupAdi, stokKod, stokAdi, brm, miktar })
	}
}
class SablonluSiparisListeDetay extends SablonluSiparisListeOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class SablonluKonsinyeSiparisListeDetay extends SablonluSiparisListeOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class SablonluSiparisListeOrtakGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	gridArgsDuzenle(e) {
		super.gridArgsDuzenle(e); let gridPart = e.gridPart ?? e.sender, {args} = e; gridPart.sabit();
		$.extend(args, { rowsHeight: 45, groupsExpandedByDefault: true, editMode: 'click', selectionMode: 'none' })
	}
	tabloKolonlariDuzenle_ilk(e) {
		super.tabloKolonlariDuzenle_ilk(e); e.tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'grupAdi', text: 'Grup Adı', genislikCh: 20 }).hidden(),
			new GridKolon({ belirtec: 'stokText', text: 'Ürün/Hizmet', genislikCh: 60, filterType: 'checkedlist' }).readOnly(),
			new GridKolon({
				belirtec: 'miktar', text: 'Miktar', genislikCh: 13, groupable: false,
				cellValueChanging: (colDef, rowIndex, belirtec, colType, oldValue, newValue) => {
					let {gridWidget} = colDef.gridPart, rec = gridWidget.getrowdata(rowIndex), orj = rec._orj = rec._orj ?? {};
					if (orj[belirtec] === undefined) { orj[belirtec] = rec[belirtec] }
					rec._degistimi = (orj[belirtec] || 0) != newValue; gridWidget.beginupdate(); gridWidget.endupdate(false)
				},
				cellClassName: (colDef, rowIndex, belirtec, value, _rec) => {
					let {gridWidget} = colDef.gridPart, rec = gridWidget.getrowdata(rowIndex);
					let result = [belirtec], {_degistimi: degistimi} = rec;
					if (degistimi) { result.push('bg-lightgreen') }
					return result.join(' ')
				}
			}).tipDecimal().sifirGosterme(),
			new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 5 }).readOnly()
		])
	}
	gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); let {grid} = e;
		grid.jqxGrid({ sortable: true, filterable: true, groupable: true, groups: ['grupAdi'] })
	}
}
class SablonluSiparisListeGridci extends SablonluSiparisListeOrtakGridci { static { window[this.name] = this; this._key2Class[this.name] = this } }
class SablonluKonsinyeSiparisListeGridci extends SablonluSiparisListeOrtakGridci { static { window[this.name] = this; this._key2Class[this.name] = this } }
