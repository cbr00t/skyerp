class SayimFis extends MQTicariGenelFis {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 100 } static get table() { return 'butfis' }
	static get kodListeTipi() { return 'SAYIM' } static get sinifAdi() { return 'Sayım' }
	static get detaySinif() { return SayimDetay } static get gridKontrolcuSinif() { return SayimGridci }
	static get tsnKullanilirmi() { return true } static get numTipKod() { return 'SAYIM' }
	static get numYapi() { return new MQNumarator({ kod: this.numTipKod }) }
	static get stokmu() { return true }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			yerKod: new PInstStr({ rowAttr: 'yerkod', init: e => 'A' })
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		let {tableAlias: alias} = this
		sec.addKA('yer', MQStokYer, `${alias}.yerkod`, 'yer.aciklama')
	}
	static rootFormBuilderDuzenle({ builders: { baslikForm: { builders: f } } }) {
		super.rootFormBuilderDuzenle(...arguments)
		f[0].yanYana()
		f[0].addModelKullan('yerKod').autoBind().setMFSinif(MQStokYer).etiketGosterim_normal()
			.addStyle_wh(300)
			.degisince(({ builder: { altInst: inst }}) => inst.yerDegisti?.(e))
			.onAfterRun(({ builder: fbd }) => fbd.rootPart.fbd_yerKod = fbd)
	}
	static orjBaslikListesiDuzenle_ara({ liste }) {
		super.orjBaslikListesiDuzenle_ara(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'yerkod', text: 'Yer', genislikCh: 7 }),
			new GridKolon({ belirtec: 'yeradi', text: 'Yer Adı', genislikCh: 20, sql: 'yer.aciklama' })
		)
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments)
		sent.fromIliski('stkyer yer', 'fis.yerkod = yer.kod')
	}
	static varsayilanKeyHostVarsDuzenle({ hv }) {
		super.varsayilanKeyHostVarsDuzenle(...arguments)
		$.extend(hv, { bttip: 'SY' })
	}
}
class SayimDetay extends MQDetay {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'butstok' }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			stokKod: new PInstStr('stokkod'),
			miktar: new PInstNum('miktar'),
			miktar2: new PInstNum('miktar2')
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			this.getKAKolonlar(
				new GridKolon({ belirtec: 'stokkod', text: 'Stok', genislikCh: 16 }),
				new GridKolon({ belirtec: 'stokadi', text: 'Stok Adı', genislikCh: 40 }),
			),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 8 }).tipDecimal(),
			new GridKolon({ belirtec: 'miktar2', text: 'Miktar 2', genislikCh: 8 }).tipDecimal()
		)
	}
}


class StokFis extends TSOrtakFis {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Stok' } static get table() { return 'stfis' } static get oncelik() { return 999 }
	static get baslikOzelAciklamaTablo() { return 'stbasekaciklama' } static get dipSerbestAciklamaTablo() { return 'stdipaciklama' }
	static get dipEkBilgiTablo() { return 'stdipekbilgi' } static get detaySinif() { return super.detaySinif }
	static get sevkFisTable() { return this.table } static get sevkDetayTable() { return this.detayTable }
	static detaySiniflarDuzenle(e) { super.detaySiniflarDuzenle(e) }
	static get gridKontrolcuSinif() { return StokGridKontrolcu }
	static get mustSaha() { return 'irsmust' }
	static get stokmu() { return true } static get gcTipi() { return null } static get ozelTip() { return '' } static get fisEkAyrim() { return '' }
	static get tsStokDetayTable() { return 'ststok' } static get tsFasonDetayTable() { return 'stfsstok' }
	static get tsDemirbasDetayTable() { return 'stdemirbas' } static get tsAciklamaDetayTable() { return 'staciklama' }
	static loadServerData_queryDuzenle({ sent, sent: { where: wh } }) {
		super.loadServerData_queryDuzenle(...arguments)
		let {aliasVeNokta, pifTipi, iade} = this
		if (pifTipi) { wh.degerAta(pifTipi, `${aliasVeNokta}piftipi`) }
		if (iade != null) { wh.degerAta(iade, `${aliasVeNokta}iade`) }
	}
	static async raporKategorileriDuzenle_baslik(e) {
		await super.raporKategorileriDuzenle_baslik(e); let {kullanim} = app.params.ticariGenel;
		let sections = ['PTBaslikFisIslem', (kullanim.takipNo ? 'TakipNo' : null)]
		await e.kat.ekSahaYukle({ section: sections })
	}
	static varsayilanKeyHostVarsDuzenle({ hv }) {
		super.varsayilanKeyHostVarsDuzenle(...arguments)
		$.extend(hv, {
			gctipi: this.gcTipi, ozeltip: this.ozelTip,
			fisekayrim: this.fisEkAyrim, oncelik: this.oncelik
		})
	}
}

class TransferVeGCOrtakFis extends StokFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			yerKod: new PInstStr({ rowAttr: 'yerkod', init: e => 'A' }),
			yerOrtakmi: new PInstTrue('yerortakdir')
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(e)
		let {tableAlias: alias} = this
		sec.addKA('yer', MQStokYer, `${alias}.yerkod`, 'yer.aciklama')
	}
	static rootFormBuilderDuzenle({ builders: { baslikForm: { builders: f } } }) {
		super.rootFormBuilderDuzenle(...arguments)
		f[0].yanYana()
		f[0].addCheckBox('yerOrtakmi', 'Yer Ortaktır')
			.degisince(({ builder: { rootPart: part } }) => part.fbd_yerKod?.updateVisible())
		f[0].addModelKullan('yerKod').autoBind().setMFSinif(MQStokYer).etiketGosterim_normal()
			.degisince(({ builder: { altInst: inst }}) => inst.yerDegisti?.(e))
			.onAfterRun(({ builder: fbd }) => fbd.rootPart.fbd_yerKod = fbd)
			.setVisibleKosulu(({ builder: { altInst: inst } }) => inst.yerOrtakmi ? 'jqx-hidden' : true)
	}
	static orjBaslikListesiDuzenle_ara({ liste }) {
		super.orjBaslikListesiDuzenle_ara(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'yerkod', text: 'Yer', genislikCh: 7 }),
			new GridKolon({ belirtec: 'yeradi', text: 'Yer Adı', genislikCh: 20, sql: 'yer.aciklama' })
		)
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments)
		sent.fromIliski('stkyer yer', 'fis.yerkod = yer.kod')
	}
	static async raporKategorileriDuzenle_baslik(e) {
		await super.raporKategorileriDuzenle_baslik(e); let {kullanim} = app.params.ticariGenel;
		let sections = ['FRFisGenel-Yer']; await e.kat.ekSahaYukle({ section: sections })
	}
	// fisBaslikOlusturucularDuzenle(e) { super.fisBaslikOlusturucularDuzenle(e); let {liste} = e; liste.push( FisBaslikOlusturucu_StokYer) }
}
class StokGCFis extends TransferVeGCOrtakFis {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get bakiyeciler() { return [...super.bakiyeciler, new StokBakiyeci({ borcmu: e => (this.gcTipi == 'G') != this.iademi })] }
	stokBakiyeSqlEkDuzenle(e) {
		let {sent, borcmu} = e, {sahalar} = sent; sent.fis2HarBagla('ststok');
		sahalar.addWithAlias('fis', 'ozelisaret'); sahalar.addWithAlias('har', 'stokkod', 'detyerkod yerkod', 'opno', ...HMRBilgi.rowAttrListe);
		sahalar.add('SUM(har.miktar) sonmiktar', 'SUM(har.miktar2) sonmiktar2')
	}
}
class StokGirisOrtakFis extends StokGCFis {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return `${super.sinifAdi} Giriş` }
	static get gcTipi() { return 'G' } static get numTipKod() { return 'SG' }
	static get islTipKod() { return 'SG' } static get varsayilanIslKod() { return 'G' }
}
class StokGirisFis extends StokGirisOrtakFis {
	 static { window[this.name] = this; this._key2Class[this.name] = this }
}
class StokCikisOrtakFis extends StokGCFis {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return `${super.sinifAdi} Çıkış` }
	static get gcTipi() { return 'C' } static get numTipKod() { return 'SC' }
	static get islTipKod() { return 'SC' } static get varsayilanIslKod() { return 'C' }
}
class StokCikisFis extends StokCikisOrtakFis {
	 static { window[this.name] = this; this._key2Class[this.name] = this }
}

class StokTransferOrtakFis extends TransferVeGCOrtakFis {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return `${super.sinifAdi} Transfer` }
	static get numTipKod() { return 'ST' } static get islTipKod() { return 'ST' }
	static get gcTipi() { return 'T' } static get varsayilanIslKod() { return 'T' }
	get bakiyeciler() { return [...super.bakiyeciler, new StokBakiyeci({ borcmu: false })] }
	static async raporKategorileriDuzenle_baslik(e) {
		await super.raporKategorileriDuzenle_baslik(e); let {kullanim} = app.params.ticariGenel;
		let sections = ['FRFisTrf-GYer']; await e.kat.ekSahaYukle({ section: sections })
	}
	stokBakiyeSqlEkDuzenle(e) {
			/* aynı satır hem giriş hem çıkış için kullanılır. union yapıp sonuç birleştirilir */
		let {borcmu} = e; let {stm} = e, uni = new MQUnionAll();
		let sentEkle = _e => {
			let sent = new MQSent(), {sahalar} = sent, {yerKodClause, carpan} = _e;
			sent.fisHareket('stfis', 'ststok');
			sahalar.addWithAlias('fis', 'ozelisaret'); sahalar.addWithAlias('har', 'stokkod', 'opno', ...HMRBilgi.rowAttrListe);
			sahalar.add(`${yerKodClause} yerkod`, `SUM(har.miktar * ${carpan}) sonmiktar`, `SUM(har.miktar2 * ${carpan}) sonmiktar2`)
			uni.add(sent); return sent
		};
		sentEkle({ yerKodClause: 'har.detyerkod', carpan: -1 });
		sentEkle({ yerKodClause: 'har.detrefyerkod', carpan: 1 });
		stm = e.stm = uni.asToplamStm(); e.sent = stm.sent
	}
}
class StokTransferFis extends StokTransferOrtakFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class IrsaliyeliTransferFis extends StokTransferOrtakFis {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'İrsaliyeli Transfer Fiş' } static get ozelTip() { return 'IR' }
	static get numTipKod() { return SatisIrsaliyeFis.numTipKod } static get numYapi() { return SatisIrsaliyeFis.numYapi }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments); let {mustSaha} = this
		$.extend(pTanim, { mustKod: new PInstStr(mustSaha), sevkYerKod: new PInstStr('xadreskod') })
	}
}


class TransferSiparisOrtakFis extends StokFis {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 200 }
	static get islTipKod() { return StokTransferOrtakFis.islTipKod } static get gcTipi() { return 'S' }
	static get varsayilanIslKod() { return StokTransferOrtakFis.varsayilanIslKod }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments); $.extend(pTanim, {
			teslimOrtakdir: new PInstBitBool('bteslimortakdir'), baslikTeslimTarihi: new PInstDate('basteslimtarihi')
		})
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments);
		$.extend(hv, { oncelik: this.class.oncelik, basteslimtarihi: hv.basteslimtarihi || this.tarih })
	}
}
class TransferSiparisFis extends TransferSiparisOrtakFis {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PIRSIP' } static get sinifAdi() { return 'İrsaliyeli Transfer Sipariş' }
	static get numTipKod() { return 'XI' } static get ozelTip() { return 'IR' }
	static get sevkFisSinif() { return IrsaliyeliTransferFis }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments); let {mustSaha} = this
		$.extend(pTanim, {
			mustKod: new PInstStr(mustSaha), sevkAdresKod: new PInstStr('xadreskod'),
			cYerKod: new PInstStr('yerkod'), gYerKod: new PInstStr('refyerkod')
		})
	}
	static getDonusumYapi(e) {
		super.getDonusumYapi(e); let {detaySinif} = e;
		return ({ table: detaySinif?.stDonusumTable, baglantiSaha: 'sipharsayac' })
	}
}
class SubelerArasiSiparisFis extends TransferSiparisOrtakFis {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Şubeler Arası Sipariş' }
	static get numTipKod() { return 'XS' } static get ozelTip() { return 'SB' }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, { cRefSubeKod: new PInstStr('refsubekod') })
	}
}
