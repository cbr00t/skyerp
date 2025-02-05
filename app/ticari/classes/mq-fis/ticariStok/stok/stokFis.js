class StokFis extends TSOrtakFis {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Stok' } static get table() { return 'stfis' }
	static get baslikOzelAciklamaTablo() { return 'stbasekaciklama' } static get dipSerbestAciklamaTablo() { return 'stdipaciklama' }
	static get dipEkBilgiTablo() { return 'stdipekbilgi' } static get detaySinif() { return super.detaySinif }
	static detaySiniflarDuzenle(e) { super.detaySiniflarDuzenle(e) }
	static get gridKontrolcuSinif() { return StokGridKontrolcu }
	static get stokmu() { return true } static get gcTipi() { return null } static get ozelTip() { return '' } static get fisEkAyrim() { return '' }
	static get tsStokDetayTable() { return 'ststok' } static get tsFasonDetayTable() { return 'stfsstok' }
	static get tsDemirbasDetayTable() { return 'stdemirbas' } static get tsAciklamaDetayTable() { return 'staciklama' } static get mustSaha() { return 'irsmust' }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { yerKod: new PInstStr({ rowAttr: 'yerkod', init: e => 'A' }), yerOrtakmi: new PInstTrue('byerortakdir') })
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const {secimler} = e;
		secimler.secimTopluEkle({
			yer: new SecimString({ etiket: 'Yer (Depo)', mfSinif: MQStokYer }),
			yerAdi: new SecimOzellik({ etiket: 'Yer Adı' })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this, {where, secimler} = e;
			where.basiSonu(secimler.yer, `${aliasVeNokta}yerkod`); where.ozellik(secimler.yerAdi, 'yer.aciklama')
		})
	}
	static orjBaslikListesiDuzenle_ara(e) {
		super.orjBaslikListesiDuzenle_ara(e); const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'yerkod', text: 'Yer', genislikCh: 7 }),
			new GridKolon({ belirtec: 'yeradi', text: 'Yer Adı', genislikCh: 20, sql: 'yer.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta, pifTipi, iade} = this, {sent} = e;
		sent.fromIliski('stkyer yer', 'fis.yerkod = yer.kod');
		if (pifTipi) { sent.where.degerAta(pifTipi, `${aliasVeNokta}piftipi`) }
		if (iade != null) { sent.where.degerAta(iade, `${aliasVeNokta}iade`) }
	}
	static async raporKategorileriDuzenle_baslik(e) {
		await super.raporKategorileriDuzenle_baslik(e); const {kullanim} = app.params.ticariGenel;
		const sections = ['PTBaslikFisIslem', 'FRFisGenel-Yer', (kullanim.takipNo ? 'TakipNo' : null)]; await e.kat.ekSahaYukle({ section: sections })
	}
	static varsayilanKeyHostVarsDuzenle(e) {
		super.varsayilanKeyHostVarsDuzenle(e); const {hv} = e;
		$.extend(hv, { gctipi: this.gcTipi, ozeltip: this.ozelTip, fisekayrim: this.fisEkAyrim })
	}
	fisBaslikOlusturucularDuzenle(e) { super.fisBaslikOlusturucularDuzenle(e); const {liste} = e; liste.push( FisBaslikOlusturucu_StokYer) }
}
class StokGCFis extends StokFis {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get bakiyeciler() { return [...super.bakiyeciler, new StokBakiyeci({ borcmu: e => (this.gcTipi == 'G') != this.iademi })] }
	stokBakiyeSqlEkDuzenle(e) {
		const {sent, borcmu} = e, {sahalar} = sent; sent.fis2HarBagla('ststok');
		sahalar.addWithAlias('fis', 'ozelisaret'); sahalar.addWithAlias('har', 'stokkod', 'detyerkod yerkod', 'opno', ...HMRBilgi.rowAttrListe);
		sahalar.add('SUM(har.miktar) sonmiktar', 'SUM(har.miktar2) sonmiktar2')
	}
}
class StokGirisOrtakFis extends StokGCFis {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return `${super.sinifAdi} Giriş` }
	static get gcTipi() { return 'G' } static get numTipKod() { return 'SG' } static get islTipKod() { return 'SG' } static get varsayilanIslKod() { return 'G' }
}
class StokGirisFis extends StokGirisOrtakFis {
	 static { window[this.name] = this; this._key2Class[this.name] = this }
}
class StokCikisOrtakFis extends StokGCFis {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return `${super.sinifAdi} Çıkış` }
	static get gcTipi() { return 'C' } static get numTipKod() { return 'SC' } static get islTipKod() { return 'SC' } static get varsayilanIslKod() { return 'C' }
}
class StokCikisFis extends StokCikisOrtakFis {
	 static { window[this.name] = this; this._key2Class[this.name] = this }
}
class StokTransferOrtakFis extends StokFis {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return `${super.sinifAdi} Transfer` }
	static get numTipKod() { return 'ST' } static get islTipKod() { return 'ST' } static get varsayilanIslKod() { return 'T' }
	get bakiyeciler() { return [...super.bakiyeciler, new StokBakiyeci({ borcmu: false })] }
	static async raporKategorileriDuzenle_baslik(e) {
		await super.raporKategorileriDuzenle_baslik(e); const {kullanim} = app.params.ticariGenel;
		const sections = ['FRFisTrf-GYer']; await e.kat.ekSahaYukle({ section: sections })
	}
	stokBakiyeSqlEkDuzenle(e) {
			/* aynı satır hem giriş hem çıkış için kullanılır. union yapıp sonuç birleştirilir */
		const {borcmu} = e; let {stm} = e, uni = new MQUnionAll();
		const sentEkle = _e => {
			const sent = new MQSent(), {sahalar} = sent, {yerKodClause, carpan} = _e;
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
