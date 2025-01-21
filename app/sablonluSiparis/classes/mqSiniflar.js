class MQSablonOrtak extends MQDetayliVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get fisSinif() { return SablonluSiparisOrtakFis }
	static get table() { return 'hizlisablon' } static get tableAlias() { return 'sab' } static get adiEtiket() { return 'Şablon Adı' }
	static get kodListeTipi() { return this.fisSinif.kodListeTipi } static get sinifAdi() { return this.fisSinif.sinifAdi } static get tumKolonlarGosterilirmi() { return true }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { mustKod: new PInstStr('mustkod') }) }
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); let {secimler: sec} = e;
		sec.grupTopluEkle([ { kod: 'inst', etiket: 'Şablon', kapali: false } ])
		sec.secimTopluEkle({
			inst: new SecimBasSon({ etiket: 'Şablon', mfSinif: this, grupKod: 'inst' }),
			aciklama: new SecimOzellik({ etiket: 'Şablon Adı', grupKod: 'inst' })
		});
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
			let {tableAlias: alias} = this, {sayacSaha, adiSaha} = this;
			wh.basiSonu(sec.inst, `${alias}.${sayacSaha}`).ozellik(sec.aciklama, `${alias}.${adiSaha}`)
		})
	}
	static listeEkrani_init(e) { super.listeEkrani_init(e); let gridPart = e.gridPart ?? e.sender; gridPart.tarih = today(); gridPart.rowNumberOlmasin() }
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); let {rootBuilder: rfb} = e, gridPart = e.gridPart ?? e.sender, {header, islemTuslariPart} = gridPart, {layout, sol} = islemTuslariPart;
		rfb.setInst(gridPart).addStyle(e => `$elementCSS { --header-height: 140px !important } $elementCSS .islemTuslari { overflow: hidden !important }`);
		sol.addClass('flex-row'); rfb.addDateInput('tarih', 'İşlem Tarihi').setParent(sol).etiketGosterim_yok()
			.degisince(({ builder: fbd }) => fbd.rootPart.tazeleDefer(e))
			.addStyle(e => `$elementCSS { margin-left: 30px } $elementCSS > input { width: 130px !important }`);
		rfb.addModelKullan('mustKod', 'Müşteri').setParent(header).comboBox().setMFSinif(MQCari).autoBind().degisince(({ builder: fbd }) => fbd.rootPart.tazeleDefer(e))
	}
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); $.extend(e.args, { rowsHeight: 60, groupable: false, selectionMode: 'none' }) }
	static orjBaslikListesi_argsDuzenle_detaylar(e) { super.orjBaslikListesi_argsDuzenle_detaylar(e); $.extend(e.args, { rowsHeight: 50, groupable: true, filterable: true, showGroupsHeader: true, adaptive: false }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(...[
			new GridKolon({ belirtec: 'topsayi', text: 'Sip.Sayı', genislikCh: 10 }).noSql().tipNumerik(),
			new GridKolon({ belirtec: 'yeni', text: ' ', genislikCh: 8 }).noSql().tipButton('+').onClick(_e => { this.yeniIstendi({ ...e, ..._e }) })
		])
	}
	static orjBaslikListesiDuzenle_detaylar(e) {
		super.orjBaslikListesiDuzenle_detaylar(e); e.liste.push(...[
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 15 }).tipDate(),
			new GridKolon({ belirtec: 'fisnox', text: 'Sip. No', genislikCh: 20 }),
			new GridKolon({ belirtec: 'sevkadresadi', text: 'Sevk Adres', genislikCh: 30 }),
			new GridKolon({ belirtec: 'bonayli', text: 'Onay?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'onayla', text: ' ', genislikCh: 5 }).noSql().tipButton('O').onClick(_e => { this.onaylaIstendi({ ...e, ..._e }) }),
			new GridKolon({ belirtec: 'degistir', text: ' ', genislikCh: 5 }).noSql().tipButton('D').onClick(_e => { this.degistirIstendi({ ...e, ..._e }) }),
			new GridKolon({ belirtec: 'sil', text: ' ', genislikCh: 5 }).noSql().tipButton('X').onClick(_e => { this.silIstendi({ ...e, ..._e }) })
		])
	}
	static loadServerData_detaylar(e) {
		const {parentRec} = e, {kaysayac: sablonsayac} = parentRec, tarih = today();
		let recs = [
			(sablonsayac == 1 ? { kaysayac: 1, seq: 1, sablonsayac, tarih, fisnox: 'ABC 1', sevkadresadi: '', bonayli: 0 } : null),
			(sablonsayac == 1 ? { kaysayac: 2, seq: 2, sablonsayac, tarih, fisnox: 'ABC 2', sevkadresadi: '', bonayli: 1 } : null),
			(sablonsayac == 2 ? { kaysayac: 3, seq: 1, sablonsayac, tarih, fisnox: 'ABC 3', sevkadresadi: '', bonayli: 0 } : null)
		].filter(x => !!x);
		if (recs) { for (let rec of recs) { rec._parentRec = parentRec } }
		return recs
	}
	static yeniIstendi(e) {
		try {
			let gridPart = e.gridPart ?? e.sender, {fisSinif} = this; if (!fisSinif) { return null }
			let {tarih, mustKod} = gridPart, {rec} = e, {kaysayac: sablonSayac} = rec;
			let islem = 'yeni', kaydedince = e => gridPart.tazeleDefer(), fis = new fisSinif({ sablonSayac, tarih, mustKod });
			return fis.tanimla({ islem, kaydedince })
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Yeni'), 100); throw ex }
	}
	static async onaylaIstendi(e) {
		try {
			let gridPart = (e.gridPart ?? e.sender).parentPart, {fisSinif} = this; if (!fisSinif) { return null }
			let {tarih, mustKod} = gridPart, {rec} = e, {kaysayac: sayac, bonayli: onaylimi, _parentRec: parentRec} = rec, {kaysayac: sablonSayac} = parentRec;
			if (onaylimi) { throw { isError: true, errorText: 'Bu sipariş zaten onaylanmış' } }
			return true
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Onayla'), 100); throw ex }
	}
	static async degistirIstendi(e) {
		try {
			let gridPart = (e.gridPart ?? e.sender).parentPart, {fisSinif} = this; if (!fisSinif) { return null }
			let {tarih, mustKod} = gridPart, {rec} = e, {kaysayac: sayac, bonayli: onaylimi, _parentRec: parentRec} = rec, {kaysayac: sablonSayac} = parentRec;
			let fis = new fisSinif({ sayac, sablonSayac, tarih, mustKod }), result = await fis.yukle({ ...e, rec: undefined }); if (!result) { return }
			let islem = onaylimi ? 'izle' : 'degistir', kaydedince = e => gridPart.tazeleDefer();
			return await fis.tanimla({ islem, kaydedince })
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Değiştir'), 100); throw ex }
	}
	static async silIstendi(e) {
		try {
			let gridPart = (e.gridPart ?? e.sender).parentPart, {fisSinif} = this; if (!fisSinif) { return false }
			let {tarih, mustKod} = gridPart, {rec} = e, {kaysayac: sayac, bonayli: onaylimi} = rec; if (!sayac) { return false }
			if (onaylimi) { throw { isError: true, errorText: 'Onaylı sipariş silinemez' } }
			let fis = new fisSinif({ sayac, sablonSayac, tarih, mustKod }), result = await fis.yukle(); if (!result) { return }
			result = await fis.sil(); gridPart.tazeleDefer(); return result
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Değiştir'), 100); throw ex }
	}
}
class MQSablon extends MQSablonOrtak { static { window[this.name] = this; this._key2Class[this.name] = this } static get fisSinif() { return SablonluSiparisFis } }
class MQKonsinyeSablon extends MQSablonOrtak { static { window[this.name] = this; this._key2Class[this.name] = this } static get fisSinif() { return SablonluKonsinyeSiparisFis } }

class SablonluSiparisOrtakFis extends MQOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Sipariş' }
	static get table() { return 'hizlisablongrup' } static get tableAlias() { return 'grp' } static get tanimUISinif() { return FisGirisPart }
	static get detaySinif() { return SablonluSiparisOrtakDetay } static get gridKontrolcuSinif() { return SablonluSiparisOrtakGridci }
	static get tumKolonlarGosterilirmi() { return true } static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get raporKullanilirmi() { return false } static get noSaha() { return null }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			sablonSayac: new PInstNum('sablonsayac'), tarih: new PInstDateToday(),
			mustKod: new PInstStr('mustkod')
		})
	}
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
	static loadServerDataDogrudan(e) { return [] }
	topluYazmaKomutlariniOlustur(e) {
		const {toplu, paramName_fisSayac} = e, {table} = this.class, hv = this.hostVars(e); toplu.add(new MQInsert({ table, hv }));
		const keyHV = this.alternateKeyHostVars(e); e.keyHV = keyHV; let sayac = e.sayac = this.topluYazmaKomutlariniOlustur_baslikSayacBelirle(e);
		const detHVArg = { fis: this.shallowCopy() }; detHVArg.fis.sayac = sayac ?? new MQSQLConst(paramName_fisSayac);
		const {detaylar} = this, detTable2HVListe = e.detTable2HVListe = {};
		for (const det of detaylar) {
			const hv = det.hostVars(detHVArg); if (!hv) { return false }
			const detTable = det.class.getDetayTable(detHVArg), hvListe = detTable2HVListe[detTable] = detTable2HVListe[detTable] || [];
			hvListe.push(hv)
		}
		for (const detTable in detTable2HVListe) { const hvListe = detTable2HVListe[detTable]; toplu.add(new MQInsert({ table: detTable, hvListe })) }
		e.params = toplu.params = toplu.params || []; this.topluYazmaKomutlariniOlustur_sqlParamsDuzenle(e)
	}
	async topluDegistirmeKomutlariniOlustur(e) {
		const offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {toplu, trnId} = e;
		let {table, sayacSaha, detaySinif: thisDetaySinif} = this.class, harSayacSaha, fisSayacSaha, seqSaha;
		let detTable2HVListe = e.detTable2HVListe = {}, {detaylar} = this, detHVArg = { fis: this };
		for (let det of detaylar) {
			let detaySinif = det?.class ?? thisDetaySinif; if (detaySinif && $.isPlainObject(det)) { det = new detaySinif(det) }
		}
	}
	topluSilmeKomutlariniOlustur(e) {
		const {toplu, sayac} = e, {table, sayacSaha, detaySiniflar, detayTablolar} = this.class, {fisSayacSaha} = detaySiniflar[0];
		for (const detTable of detayTablolar) { toplu.add(new MQIliskiliDelete({ from: detTable, where: { degerAta: sayac, saha: fisSayacSaha } })) }
		toplu.add(new MQIliskiliDelete({ from: table, where: { degerAta: sayac, saha: sayacSaha } }))
	}
	async yeniTanimOncesiIslemler(e) { await super.yeniTanimOncesiIslemler(e); await this.detaylariDuzenle(e) }
	async detaylariYukleSonrasi(e) { await super.detaylariYukleSonrasi(e); await this.detaylariDuzenle(e) }
	async detaylariDuzenle(e) {
		e = e ?? {}; e.inst = e.fis = this;
		let {detaySinif} = this.class, seq2Det = {}; for (let det of this.detaylar) { seq2Det[det.seq] = det }
		let {sender, inst, fis} = e, _e = { sender, inst, fis }, recs = await this.class.loadServerData_detaylar(_e), detaylar = [];
		for (let rec of recs) {
			let _det = seq2Det[rec.seq], det = new detaySinif(); det.setValues({ rec }); if (_det) { $.extend(det, _det) }
			let {stokKod, stokAdi} = det; if (stokKod != null) { det.stokText = `<b>${stokKod}</b> ${stokAdi}` }
			detaylar.push(det)
		}
		this.detaylar = detaylar
	}
	uiDuzenle_fisGirisIslemTuslari(e) { /* super yok */ }
}
class SablonluSiparisFis extends SablonluSiparisOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kodListeTipi() { return 'SSIP' }
	static get detaySinif() { return SablonluSiparisDetay } static get gridKontrolcuSinif() { return SablonluSiparisGridci }
}
class SablonluKonsinyeSiparisFis extends SablonluSiparisOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kodListeTipi() { return 'KSSIP' } static get sinifAdi() { return `Konsinye ${super.sinifAdi}` }
	static get detaySinif() { return SablonluKonsinyeSiparisDetay } static get gridKontrolcuSinif() { return SablonluKonsinyeSiparisGridci }
}

class SablonluSiparisOrtakDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get table() { return 'hizlisablondetay' } static get fisSayacSaha() { return 'grupsayac' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); $.extend(e.pTanim, {
			stokKod: new PInstStr('stokkod'), miktar: new PInstNum('miktar'),
			stokAdi: new PInstStr(), brm: new PInstStr()
		})
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {sent, fis} = e, {tableAlias: grupAlias} = fis.class, {tableAlias: harAlias} = this;
		let {where: wh, sahalar} = sent, {sablonSayac} = fis;
		sent.fromIliski(`hizlisablongrup ${grupAlias}`, `${harAlias}.grupsayac = ${grupAlias}.kaysayac`).fromIliski('stkmst stk', `${harAlias}.stokkod = stk.kod`)
		wh.add(`${harAlias}.bdevredisi = 0`, `stk.silindi = ''`, `stk.satilamazfl = ''`).degerAta(sablonSayac, `${grupAlias}.fissayac`);
		sahalar.add('stk.aciklama stokadi', 'stk.brm brm')
	}
	static loadServerData(e) {
		return super.loadServerData(e)
		/*let parentRec = e.parentRec ?? e.fis ?? e.inst, fissayac = parentRec.fissayac ?? parentRec.sayac, sablonsayac = parentRec.kaysayac ?? parentRec.sablonSayac;
		let tarih = parentRec.tarih ?? today(), mustKod = parentRec.mustkod ?? parentRec.mustKod;
		let recs = [
			(sablonsayac == 1 ? { fissayac, seq: 1, stokkod: 'S01', stokadi: 'ürün 1' } : null),
			(sablonsayac == 1 ? { fissayac, seq: 2, stokkod: 'S02', stokadi: 'ürün 2' } : null),
			(sablonsayac == 1 ? { fissayac, seq: 3, stokkod: 'S03', stokadi: 'ürün 3' } : null),
			(sablonsayac == 1 ? { fissayac, seq: 4, stokkod: 'S04', stokadi: 'ürün 4' } : null),
			(sablonsayac == 2 ? { fissayac, seq: 1, stokkod: 'S05', stokadi: 'ürün 5' } : null),
			(sablonsayac == 2 ? { fissayac, seq: 2, stokkod: 'S06', stokadi: 'ürün 6' } : null)
		].filter(x => !!x);
		let recs = await super.loadServerData(e); if (recs) {
			let {detaySinif} = this; recs = recs.map(rec => { let det = new detaySinif(); det.setValues({ rec }); return det })
			for (let rec of recs) { let {stokKod, stokAdi} = rec; if (stokKod != null) { rec.stokText = `<b>${stokKod}</b> ${stokAdi}` } }
		}
		return recs*/
	}
	setValues(e) { super.setValues(e); let {rec} = e; $.extend(this, { stokAdi: rec.stokadi, brm: rec.brm }) }
}
class SablonluSiparisDetay extends SablonluSiparisOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class SablonluKonsinyeSiparisDetay extends SablonluSiparisOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class SablonluSiparisOrtakGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	gridArgsDuzenle(e) { super.gridArgsDuzenle(e); let gridPart = e.gridPart ?? e.sender, {args} = e; gridPart.sabit(); $.extend(args, { rowsHeight: 45 }) }
	tabloKolonlariDuzenle_ilk(e) {
		super.tabloKolonlariDuzenle_ilk(e); e.tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'stokText', text: 'Ürün/Hizmet', genislikCh: 60 }).readOnly(),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 13 }).tipDecimal()
		])
	}
}
class SablonluSiparisGridci extends SablonluSiparisOrtakGridci { static { window[this.name] = this; this._key2Class[this.name] = this } }
class SablonluKonsinyeSiparisGridci extends SablonluSiparisOrtakGridci { static { window[this.name] = this; this._key2Class[this.name] = this } }
