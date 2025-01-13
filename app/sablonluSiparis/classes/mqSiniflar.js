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
			let gridPart = e.gridPart ?? e.sender, {fisSinif} = this; if (!fisSinif) { return null }
			let {tarih, mustKod} = gridPart, {rec} = e, {kaysayac: sayac, bonayli: onaylimi, _parentRec: parentRec} = rec, {kaysayac: sablonSayac} = parentRec;
			if (onaylimi) { throw { isError: true, errorText: 'Bu sipariş zaten onaylanmış' } }
			return true
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Onayla'), 100); throw ex }
	}
	static async degistirIstendi(e) {
		try {
			let gridPart = e.gridPart ?? e.sender, {fisSinif} = this; if (!fisSinif) { return null }
			let {tarih, mustKod} = gridPart, {rec} = e, {kaysayac: sayac, bonayli: onaylimi, _parentRec: parentRec} = rec, {kaysayac: sablonSayac} = parentRec;
			let fis = new fisSinif({ sayac, sablonSayac, tarih, mustKod }), result = await fis.yukle(); if (!result) { return }
			let islem = onaylimi ? 'izle' : 'degistir', kaydedince = e => gridPart.tazeleDefer();
			return await fis.tanimla({ islem, kaydedince })
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Değiştir'), 100); throw ex }
	}
	static async silIstendi(e) {
		try {
			let gridPart = e.gridPart ?? e.sender, {fisSinif} = this; if (!fisSinif) { return false }
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

class SablonluSiparisOrtakFis extends MQGenelFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Sipariş' }
	static get detaySinif() { return SablonluSiparisOrtakDetay } static get gridKontrolcuSinif() { return SablonluSiparisOrtakGridci }
	static get tumKolonlarGosterilirmi() { return true } static get tanimlanabilirmi() { return false }
	static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { sablonSayac: new PInstNum('sablonSayac'), mustKod: new PInstStr('mustkod') }) }
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); let {builders: baslikFormlar} = e.builders.baslikForm, {inst} = e;
		baslikFormlar[0].addForm('_baslikBilgi')
			.addStyle(e =>
				`$elementCSS { font-size: 150% } $elementCSS > ._row { gap: 10px } $elementCSS > ._row:not(:last-child) { margin-bottom: 5px }
				$elementCSS .etiket { width: 130px !important } $elementCSS .veri { font-weight: bold; color: royalblue }`
			 ).setLayout(({ builder: fbd }) => {
				let {altInst: inst} = fbd, {tarih, mustKod, sablonSayac} = inst;
				return $(`<div class="full-width">
					<div class="tarih _row flex-row"><div class="etiket">Tarih:</div> <div class="veri">${dateToString(inst.tarih) || ''}</div></div>
					<div class="must _row flex-row"><div class="etiket">Müşteri:</div> <div class="veri">${mustKod || ''}</div></div>
					<div class="sablon _row flex-row"><div class="etiket">Şablon:</div> <div class="veri">${sablonSayac || ''}</div></div>
				</div>`)
			}).onBuildEk(({ builder: fbd }) => {
				let {altInst: inst, layout} = fbd, {mustKod, sablonSayac} = inst;
				let setKA = async (selector, kod, aciklama) => {
					if (!selector) { return } let elm = layout.find(`.${selector}`); if (!elm?.length) { return }
					if (kod) {
						aciklama = await aciklama; if (!aciklama) { return }
						let text = aciklama; if (kod && typeof kod == 'string') { text = `<span class="kod bold gray">${kod}</b> <span class="aciklama royalblue normal">${aciklama}</span>` };
						elm.find('.veri').html(text); elm.parent().removeClass('jqx-hidden basic-hidden')
					}
					else { elm.parent().addClass('jqx-hidden') }
				};
				setKA('sablon', sablonSayac, MQSablon.getGloKod2Adi(sablonSayac)); setKA('must', mustKod, MQCari.getGloKod2Adi(mustKod))
			})
	}
	static loadServerDataDogrudan(e) { return [] }
	async yeniTanimOncesiIslemler(e) {
		super.yeniTanimOncesiIslemler(e); let {detaySinif} = this.class;
		this.detaylar = (await this.class.loadServerData_detaylar(e)).map(rec => {
			let det = new detaySinif(); det.setValues({ rec }); return rec })
	}
	static loadServerData_detaylar(e) {
		let parentRec = e.parentRec ?? e.fis ?? e.inst, fissayac = parentRec.fissayac ?? parentRec.sayac, sablonsayac = parentRec.kaysayac ?? parentRec.sablonSayac;
		let tarih = parentRec.tarih ?? today(), mustKod = parentRec.mustkod ?? parentRec.mustKod;
		let recs = [
			(sablonsayac == 1 ? { fissayac, seq: 1, shkod: 'S01', shadi: 'ürün 1' } : null),
			(sablonsayac == 1 ? { fissayac, seq: 2, shkod: 'S02', shadi: 'ürün 2' } : null),
			(sablonsayac == 1 ? { fissayac, seq: 3, shkod: 'S03', shadi: 'ürün 3' } : null),
			(sablonsayac == 1 ? { fissayac, seq: 4, shkod: 'S04', shadi: 'ürün 4' } : null),
			(sablonsayac == 2 ? { fissayac, seq: 1, shkod: 'S05', shadi: 'ürün 5' } : null),
			(sablonsayac == 2 ? { fissayac, seq: 2, shkod: 'S06', shadi: 'ürün 6' } : null)
		].filter(x => !!x);
		if (recs) {
			let {detaySinif} = this; recs = recs.map(rec => { let det = new detaySinif(); det.setValues({ rec }); return det })
			for (let rec of recs) { let {shKod, shAdi} = rec; if (shKod != null) { rec.shText = `<b>${shKod}</b> ${shAdi}` } }
		}
		return recs
	}
	uiDuzenle_fisGirisIslemTuslari(e) { }
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
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); $.extend(e.pTanim, { shKod: new PInstStr('shkod'), miktar: new PInstNum('miktar'), shAdi: new PInstStr() }) }
	setValues(e) { super.setValues(e); let {rec} = e; $.extend(this, { shAdi: rec.shadi }) }
}
class SablonluSiparisDetay extends SablonluSiparisOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class SablonluKonsinyeSiparisDetay extends SablonluSiparisOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}

class SablonluSiparisOrtakGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	gridArgsDuzenle(e) { super.gridArgsDuzenle(e); let gridPart = e.gridPart ?? e.sender, {args} = e; gridPart.sabit(); $.extend(args, { rowsHeight: 50 }) }
	tabloKolonlariDuzenle_ilk(e) {
		super.tabloKolonlariDuzenle_ilk(e); e.tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'shText', text: 'Ürün/Hizmet', genislikCh: 40 }).readOnly(),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 13 }).tipDecimal()
		])
	}
}
class SablonluSiparisGridci extends SablonluSiparisOrtakGridci { static { window[this.name] = this; this._key2Class[this.name] = this } }
class SablonluKonsinyeSiparisGridci extends SablonluSiparisOrtakGridci { static { window[this.name] = this; this._key2Class[this.name] = this } }
