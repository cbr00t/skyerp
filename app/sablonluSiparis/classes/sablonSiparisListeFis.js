class SablonluSiparisListeOrtakFis extends MQOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Sipariş' } static get fisSinif() { return null }
	static get tableAlias() { return 'grp' } static get tanimUISinif() { return FisGirisPart }
	static get detaySinif() { return SablonluSiparisListeOrtakDetay } static get gridKontrolcuSinif() { return SablonluSiparisListeOrtakGridci }
	static get tumKolonlarGosterilirmi() { return true } static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get raporKullanilirmi() { return false } static get noSaha() { return null } get listemi() { return true }
	static get fisIcinDetaySinif(){ let {fisSinif} = this; return fisSinif?.detaySinifFor?.('') ?? fisSinif?.detaySinif }
	static get fisIcinDetayTable(){ let {fisSinif, fisIcinDetaySinif} = this; return fisIcinDetaySinif?.getDetayTable?.({ fisSinif }) ?? fisIcinDetaySinif?.table }
	get asilFis() {
		let {fisSinif} = this.class, {fisSayac: sayac, sablonSayac, tarih, subeKod, mustKod, sevkAdresKod} = this, detaylar = this.getYazmaIcinDetaylar();
		let fis = new fisSinif({ sayac, sablonSayac, tarih, subeKod, mustKod, sevkAdresKod, detaylar });
		if (fis.onayTipi == null) { fis.onaysiz() }
		return fis
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			sablonSayac: new PInstNum(), tarih: new PInstDateToday(), subeKod: new PInstStr(),
			mustKod: new PInstStr(), sevkAdresKod: new PInstStr(), fisSayac: new PInstNum()
		})
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); let {root: rfb, baslikForm: fbd_baslikForm} = e.builders, {builders: baslikFormlar} = fbd_baslikForm;
		let {sender: gridPart, inst, islem} = e, {grid, gridWidget, layout} = gridPart;
		rfb.addStyle(e => `$elementCSS .islemTuslari { position: absolute !important; top: 3px !important }`);
		baslikFormlar[0].altAlta().addForm('_baslikBilgi')
			.addStyle(e =>
				`$elementCSS { font-size: 130% } $elementCSS > ._row { gap: 10px } $elementCSS > ._row:not(:last-child) { margin-bottom: 5px }
				$elementCSS .etiket { width: 100px !important } $elementCSS .veri { font-weight: bold; color: royalblue }`
			 ).setLayout(({ builder: fbd }) => {
				let {altInst: inst} = fbd, {tarih, subeKod, mustKod, sablonSayac} = inst;
				return $(`<div class="full-width">
					<div class="flex-row" style="gap: 100px">
						<div class="tarih _row flex-row"><div class="etiket">Tarih</div><div style="margin-right: 10px"></div><div class="veri">${dateToString(inst.tarih) || ''}</div></div>
						<div class="sablon _row flex-row"><div class="etiket">Şablon</div><div class="veri">${sablonSayac || ''}</div></div>
					</div>
					<div class="flex-row" style="gap: 50px">
						${subeKod ? `<div class="sube _row flex-row"><div class="etiket">Şube</div><div class="veri" style="margin-right: 10px">${subeKod?.trim() || ''}</div></div>` : ''}
						${mustKod ? `<div class="must _row flex-row"><div class="etiket">Müşteri</div><div class="veri">${mustKod?.trim() || ''}</div></div>` : ''}
					</div>
				</div>`)
			}).onBuildEk(({ builder: fbd }) => {
				let {altInst: inst, layout} = fbd, {subeKod, mustKod, sablonSayac} = inst;
				let setKA = async (selector, kod, aciklama) => {
					if (!selector) { return } let elm = layout.find(`.${selector}`); if (!elm?.length) { return }
					if (kod) {
						aciklama = await aciklama; if (!aciklama) { return }
						let text = aciklama?.trim(); if (kod && typeof kod == 'string') { text = `<span class="kod bold gray">${kod}</b> <span class="aciklama royalblue normal">${aciklama}</span>` };
						elm.find('.veri').html(text.trim()); elm.removeClass('jqx-hidden basic-hidden')
					}
					else { elm.addClass('jqx-hidden') }
				};
				setKA('sablon', sablonSayac, MQSablon.getGloKod2Adi(sablonSayac)); setKA('sube', subeKod, MQSube.getGloKod2Adi(subeKod))
				setKA('must', mustKod, MQSCari.getGloKod2Adi(mustKod))
			});
		baslikFormlar[0].addModelKullan('sevkAdresKod', 'Sevk Adres').comboBox().autoBind().setMFSinif(MQSSevkAdres)
			.ozelQueryDuzenleHandler(({ builder: fbd, aliasVeNokta, stm }) => {
				let {altInst: inst} = fbd ?? {}, {mustKod} = inst ?? {}; if (!mustKod) { return }
				for (let sent of stm.getSentListe()) { sent.where.degerAta(mustKod, `${aliasVeNokta}must`) }
			});
		let disableWithInfo = ({ color, text }) => {
			grid.jqxGrid('editable', false); gridPart.baslikFormlar[0].parent().css('box-shadow', `0 2px 5px 3px ${color}`);
			baslikFormlar[2].addForm('_ekBilgi').addStyle_fullWH(null, 'unset').addStyle(() => `$elementCSS { margin-top: 5px; padding: 5px 5px 10px 20px }`)
				.setLayout(({ builder: fbd }) => $(`<h4 class="bold ${color}">Bu sipariş ${text}:</h4>`))
		};
		switch (islem) {
			case 'onayla': disableWithInfo({ color: 'green', text: 'onaylanacak' }); break
			case 'sil': disableWithInfo({ color: 'firebrick', text: '<u>SİLİNECEK</u>' }); break
		}
	}
	async yukle(e) {
		e = e || {}; delete e.rec; await this.baslikVeDetaylariYukle(e); await this.detaylariYukleSonrasi(e);
		if (e.rec) { await this.yukleSonrasiIslemler(e) } return true
	}
	async baslikVeDetaylariYukle(e) {
		let {detaySinif} = this.class, {sablonSayac} = this, {parentRec, gridRec} = e, degistirmi = !!parentRec;
		$.extend(this, {
			tarih: gridRec?.tarih || this.tarih || now(), subeKod: gridRec?.subekod || this.subeKod,
			mustKod: gridRec?.mustkod || this.mustKod, sevkAdresKod: gridRec?.sevkadreskod || this.sevkAdresKod
		});
		let getAnahStr = e.getAnahStr = rec => [rec.stokkod, ...ekOzellikler.map(({ rowAttr }) => rec[rowAttr] ?? '')].join(delimWS);
		let ekOzellikler = e.ekOzellikler = Array.from(HMRBilgi.hmrIter_ekOzellik());
		let sent = e.sent = new MQSent({
			from: 'hizlisablongrup grp', fromIliskiler: [
				{ from: 'hizlisablondetay har', iliski: 'har.grupsayac = grp.kaysayac' },
				{ from: 'stkmst stk', iliski: 'har.stokkod = stk.kod' }
			],
			where: [
				{ degerAta: sablonSayac, saha: 'grp.fissayac' },
				'har.bdevredisi = 0', `stk.silindi = ''`, `stk.satilamazfl = ''`
			],
			sahalar: [
				'grp.kaysayac grupsayac', 'grp.seq grupseq', 'grp.grupadi', 'har.seq',
				'har.stokkod', 'stk.aciklama stokadi', 'stk.brm'
			]
		}), {sahalar} = sent;
		for (let {table, tableAlias: alias, rowAttr, rowAdiAttr} of ekOzellikler) {
			sent.fromIliski(`${table} ${alias}`, `har.${rowAttr} = ${alias}.kod`);
			sahalar.add(`har.${rowAttr}`, `${alias}.aciklama ${rowAdiAttr}`)
		}
		let stm = e.stm = e.query = new MQStm({ sent, orderBy: ['fissayac', 'grupseq', 'seq'] });
		let recs = await this.class.loadServerData_querySonucu(e), detaylar = this.detaylar = [];
		let anah2Det = {}; for (let rec of recs) {
			let {stokkod: stokKod, stokadi: stokAdi} = rec, stokText = new CKodVeAdi([stokKod, stokAdi]).parantezliOzet({ styled: true });
			let det = new detaySinif({ stokText }); det.setValues({ rec }); detaylar.push(det);
			for (let {belirtec, ioAttr, adiAttr, rowAttr, rowAdiAttr} of ekOzellikler) {
				let kod = rec[rowAttr], aciklama = rec[rowAdiAttr]; if (kod === undefined) { continue }
				det[ioAttr] = kod; det[adiAttr] = aciklama; det[belirtec] = kod ? `<b>(${kod})</b> ${aciklama}` : ''
			}
			let anahStr = getAnahStr(rec); anah2Det[anahStr] = anah2Det[anahStr] ?? det
		}
		if (degistirmi) {
			let {fisSayac} = this, {fisIcinDetayTable: detayTable} = this.class;
			let query = e.stm = new MQStm(); this.baslikVeDetaylariYukle_degistir_queryDuzenle(e); query = e.stm;
			let recs = await this.class.loadServerData_querySonucu({ ...e, query });
			for (let rec of recs) {
				let anahStr = getAnahStr(rec), det = anah2Det[anahStr]; if (!det) { continue }
				let {kaysayac: okunanHarSayac, miktar} = rec; $.extend(det, { okunanHarSayac, miktar })
			}
		}
		return true
	}
	baslikVeDetaylariYukle_degistir_queryDuzenle(e) {
		let {fisSayac} = this, {fisIcinDetayTable: detayTable} = this.class;
		let {stm, ekOzellikler} = e, sent = e.sent = stm.sent = new MQSent({
			from: `${detayTable} har`, where: { degerAta: fisSayac, saha: 'fissayac' },
			sahalar: ['har.kaysayac', 'har.stokkod', 'SUM(har.miktar) miktar']
		}), {sahalar, where: wh} = sent;
		wh.icerikKisitDuzenle_stok({ saha: 'har.stokkod' });
		for (let {table, tableAlias: alias, rowAttr} of ekOzellikler) {
			sent.fromIliski(`${table} ${alias}`, `har.${rowAttr} = ${alias}.kod`);
			sahalar.add(`har.${rowAttr}`)
		}
		sent.groupByOlustur()
	}
	async yaz(e) {
		e = e ?? {}; let {asilFis: fis} = this; this.asilFis_argFix(e, fis);
		let {numarator: num} = fis; if (num) {
			await num.yukle(); fis.fisNo = (await num.kesinlestir()).sonNo;
			for (let key of ['seri', 'noYil']) { let value = num[key]; if (value != null) { fis[key] = value } }
		}
		return await fis.yaz(e)
	}
	degistir(e) {
		e = e ?? {}; let {asilFis: fis} = this, {eskiInst} = e; if (eskiInst) { eskiInst = e.eskiInst = eskiInst.asilFis ?? eskiInst }
		this.asilFis_argFix(e, fis); fis.degistir(e)
	}
	sil(e) {
		e = e ?? {}; let {asilFis: fis} = this, {eskiInst} = e; if (eskiInst) { eskiInst = e.eskiInst = eskiInst.asilFis ?? eskiInst }
		this.asilFis_argFix(e, fis); fis.sil(e)
	}
	getYazmaIcinDetaylar(e) {
		let {fisIcinDetaySinif} = this.class, detaylar = super.getYazmaIcinDetaylar(e).filter(det => det.miktar);
		detaylar = detaylar.map(det => det.listemi ? new fisIcinDetaySinif(det) : det);
		return detaylar
	}
	yukleSonrasiIslemler(e) { /* super yok */ }
	uiDuzenle_fisGirisIslemTuslari(e) { /* super yok */ }
	asilFis_argFix(e, fis) {
		if (!e) { return this }
		for (let key of ['inst', 'fis']) { if (e[key] !== undefined) { e[key] = fis } }
		return this
	}
}
class SablonluSiparisListeFis extends SablonluSiparisListeOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'SSIP' } static get fisSinif() { return SablonluSatisSiparisFis }
	static get detaySinif() { return SablonluSiparisListeDetay } static get gridKontrolcuSinif() { return SablonluSiparisListeGridci }
}
class SablonluKonsinyeSiparisListeFis extends SablonluSiparisListeOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return `Konsinye ${super.sinifAdi}` }
	static get kodListeTipi() { return 'KSSIP' } static get fisSinif() { return SablonluKonsinyeSiparisFis }
	static get detaySinif() { return SablonluKonsinyeSiparisListeDetay } static get gridKontrolcuSinif() { return SablonluKonsinyeSiparisListeGridci }
	baslikVeDetaylariYukle_degistir_queryDuzenle(e) {
		super.baslikVeDetaylariYukle_degistir_queryDuzenle(e); let {fisSayac} = this, {fisIcinDetayTable: detayTable} = this.class;
		let {stm, ekOzellikler} = e, uni = e.sent = stm.sent = stm.sent.asUnionAll()
		/*let sent = new MQSent({
			from: `${detayTable} har`, where: { degerAta: fisSayac, saha: 'fissayac' },
			sahalar: ['har.kaysayac', 'har.stokkod', 'SUM(har.miktar) miktar']
		}), {sahalar, where: wh} = sent;
		wh.icerikKisitDuzenle_stok({ saha: 'har.stokkod' });
		for (let {table, tableAlias: alias, rowAttr} of ekOzellikler) {
			sent.fromIliski(`${table} ${alias}`, `har.${rowAttr} = ${alias}.kod`);
			sahalar.add(`har.${rowAttr}`)
		}
		sent.groupByOlustur(); uni.add(sent)*/
	}
}

class SablonluSiparisListeOrtakDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'hizlisablondetay' }
	static get fisSayacSaha() { return 'grupsayac' } get listemi() { return true }
	constructor(e) {
		e = e ?? {}; super(e); let {grupSayac, grupAdi, stokKod, stokAdi, stokText, brm} = e, miktar = e.miktar ?? 0;
		$.extend(this, { grupSayac, grupAdi, stokKod, stokAdi, stokText, brm, miktar });
		for (let {ioAttr, adiAttr} of HMRBilgi.hmrIter_ekOzellik()) { for (let key of [ioAttr, adiAttr]) { this[key] = e[key] } }
	}
	setValues(e) {
		super.setValues(e); let {rec} = e, {grupsayac: grupSayac, grupadi: grupAdi, stokkod: stokKod, stokadi: stokAdi, brm} = rec, miktar = rec.miktar ?? 0;
		$.extend(this, { grupSayac, grupAdi, stokKod, stokAdi, brm, miktar })
		for (let {ioAttr, adiAttr} of HMRBilgi.hmrIter_ekOzellik()) { for (let key of [ioAttr, adiAttr]) { this[key] = e[key] } }
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
		$.extend(args, { rowsHeight: 45, groupsExpandedByDefault: true, editMode: 'click', selectionMode: 'singlecell' })
	}
	tabloKolonlariDuzenle_ilk(e) {
		super.tabloKolonlariDuzenle_ilk(e); let {tabloKolonlari} = e;
		tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'grupAdi', text: 'Grup Adı', genislikCh: 20 }).hidden(),
			new GridKolon({ belirtec: 'stokText', text: 'Ürün/Hizmet', genislikCh: 60, filterable: false }).readOnly(),
			new GridKolon({
				belirtec: 'miktar', text: 'Miktar', genislikCh: 13, groupable: false,
				cellValueChanging: (colDef, rowIndex, belirtec, colType, oldValue, newValue) => {
					let {gridWidget} = colDef.gridPart, rec = gridWidget.getrowdata(rowIndex), orj = rec._orj = rec._orj ?? {};
					if (orj[belirtec] === undefined) { orj[belirtec] = rec[belirtec] }
					rec._degistimi = (orj[belirtec] || 0) != newValue
					/*gridWidget.beginupdate(); gridWidget.endupdate(false); gridWidget.ensurerowvisible(rowIndex)*/
				},
				cellClassName: (colDef, rowIndex, belirtec, value, _rec) => {
					let {gridWidget} = colDef.gridPart, rec = gridWidget.getrowdata(rowIndex);
					let result = [belirtec], {_degistimi: degistimi} = rec;
					if (degistimi) { result.push('bg-lightgreen') }
					return result.join(' ')
				}
			}).tipDecimal().sifirGosterme(),
			new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 5 }).readOnly()
		]);
		for (let {belirtec, etiket: text, mfSinif} of HMRBilgi.hmrIter_ekOzellik()) {
			tabloKolonlari.push(new GridKolon({ belirtec, text, genislikCh: 20, filterType: 'checkedlist' }).readOnly()) }
	}
	gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); let {grid} = e;
		grid.jqxGrid({ sortable: true, filterable: true, groupable: true, groups: ['grupAdi'] })
	}
}
class SablonluSiparisListeGridci extends SablonluSiparisListeOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class SablonluKonsinyeSiparisListeGridci extends SablonluSiparisListeOrtakGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
