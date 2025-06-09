class DRapor_Ticari extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kategoriKod() { return 'TICARI' } static get shd() { return null }
	get stokmu() { return this.shd == 'stok' } get hizmetmi() { return this.shd == 'hizmet' }
	constructor(e) { e = e || {}; super(e); $.extend(this, { shd: e.shd ?? e.shd ?? this.class.shd }) }
	async ilkIslemler(e) { await super.ilkIslemler(e); await MQStok.getOzelSahaYapilari()}
	stok() { this.shd = 'stok'; return this } hizmet() { this.shd = 'hizmet'; return this }
}
class DRapor_TicariStok extends DRapor_Ticari {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get shd() { return 'stok' } static get kategoriKod() { return `${super.kategoriKod}-STOK` }
}
class DRapor_TicariHizmet extends DRapor_Ticari {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get shd() { return 'hizmet' } static get kategoriKod() { return `${super.kategoriKod}-HIZMET` }
}

class DRapor_Ticari_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get toplamPrefix() { return '' } get shd() { return this.rapor?.shd }
	get stokmu() { return this.rapor?.stokmu } get hizmetmi() { return this.rapor?.hizmetmi }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e, {toplamPrefix} = this.class;
		this.tabloYapiDuzenle_shd(e).tabloYapiDuzenle_cari(e).tabloYapiDuzenle_sube(e);
		this.tabloYapiDuzenle_takip(e).tabloYapiDuzenle_plasiyer(e);
		/*result
			.addKAPrefix('takip', 'takipgrup')
			.addGrup(new TabloYapiItem().setKA('TAKIPNO', 'Takip No').secimKullanilir().setMFSinif(DMQTakipNo).addColDef(new GridKolon({ belirtec: 'takip', text: 'Takip No', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('TAKIPGRUP', 'Takip Grup').secimKullanilir().setMFSinif(DMQTakipGrup).addColDef(new GridKolon({ belirtec: 'takipgrup', text: 'Takip Grup', maxWidth: 450, filterType: 'checkedlist' })))*/
		this.tabloYapiDuzenle_hmr(e).tabloYapiDuzenle_miktar(e).tabloYapiDuzenle_ciro(e)
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {stm, attrSet, trfSipmi} = e, {sent} = stm, {where: wh} = sent, fisMustSaha = trfSipmi ? 'irsmust' : 'must';
		$.extend(e, { sent }); this.fisVeHareketBagla(e); this.donemBagla({ ...e, tarihSaha: 'fis.tarih' });
		wh.fisSilindiEkle(); wh.add(`fis.ozelisaret <> 'X'`);
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause: `fis.${fisMustSaha}` }).loadServerData_queryDuzenle_sube({ ...e, kodClause: 'fis.bizsubekod' });
		this.loadServerData_queryDuzenle_takip({ ...e, kodClause: `(case when fis.takiportakdir = '' then har.dettakipno else fis.orttakipno end)` });
		this.loadServerData_queryDuzenle_plasiyer({ ...e, kodClause: 'fis.plasiyerkod' });
		if (Object.keys(attrSet).find(x => x?.includes('MIKTAR'))) { sent.har2StokBagla() }
		/*for (const key in attrSet) {
			switch (key) {
				case 'TAKIPNO': sahalar.add('tak.kod takipkod', 'tak.aciklama takipadi'); wh.icerikKisitDuzenle_takipNo({ ...e, saha: 'tak.kod' }); break
				case 'TAKIPGRUP': sahalar.add('tgrp.kod takipgrupkod', 'tgrp.aciklama takipgrupadi'); break
			}
		}*/
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: 'fis', tarihSaha: 'tarih' }).loadServerData_queryDuzenle_shd(e);
		this.loadServerData_queryDuzenle_hmr(e).loadServerData_queryDuzenle_miktar(e).loadServerData_queryDuzenle_ciro(e);
		this.loadServerData_queryDuzenle_ek(e)
	}
	loadServerData_queryDuzenle_ek(e) { super.loadServerData_queryDuzenle_ek(e) }
	loadServerData_recsDuzenle(e) { return super.loadServerData_recsDuzenle(e) /*; let {recs} = e; for (let rec of recs) { } return recs */ }
	fisVeHareketBagla(e) { }
	tabloYapiDuzenle_shd(e) { const {shd} = this; if (shd) { this[`tabloYapiDuzenle_${shd}`](e) } return this }
	loadServerData_queryDuzenle_shd(e) { const {shd} = this; if (shd) { this[`loadServerData_queryDuzenle_${shd}`](e) } return this }
	tabloYapiDuzenle_stok({ result }) {
		result
			.addKAPrefix('anagrup', 'grup', 'sistgrup', 'stok', 'stokmarka')
			.addGrupBasit('STANAGRP', 'Stok Ana Grup', 'anagrup', DMQStokAnaGrup)
			.addGrupBasit('STGRP', 'Stok Grup', 'grup', DMQStokGrup)
			.addGrupBasit('STISTGRP', 'Stok İst. Grup', 'sistgrup', DMQStokIstGrup)
			.addGrupBasit('STOK', 'Stok', 'stok', DMQStok)
			.addGrupBasit('STOKMARKA', 'Stok Marka', 'stokmarka', DMQStokMarka)
			.addGrupBasit('STOKRESIM', 'Stok Resim', 'stokresim');
		for (let {attr, aciklama} of MQStok.getOzelSahaYapilari().flatMap(grup => grup.detaylar)) {
			if (attr) { result.addGrupBasit(attr, aciklama, attr) }
		}
		return this
	}
	loadServerData_queryDuzenle_stok(e) {
		let {attrSet, stm} = e; for (let sent of stm) {
			let {where: wh, sahalar} = sent;
			if (attrSet.STANAGRP || attrSet.STGRP || attrSet.STISTGRP || attrSet.STOK || attrSet.STOKMARKA) { sent.har2StokBagla() }
			if (attrSet.STANAGRP) { sent.stok2GrupBagla() } if (attrSet.STOKMARKA) { sent.stok2MarkaBagla() }
			for (const key in attrSet) {
				switch (key) {
					case 'STANAGRP': sent.stokGrup2AnaGrupBagla(); sahalar.add('grp.anagrupkod', 'agrp.aciklama anagrupadi'); wh.icerikKisitDuzenle_stokAnaGrup({ ...e, saha: 'grp.anagrupkod' }); break
					case 'STGRP': sent.stok2GrupBagla(); sahalar.add('stk.grupkod', 'grp.aciklama grupadi'); wh.icerikKisitDuzenle_stokGrup({ ...e, saha: 'stk.grupkod' }); break
					case 'STISTGRP': sent.stok2IstGrupBagla(); sahalar.add('stk.sistgrupkod', 'sigrp.aciklama sistgrupadi'); wh.icerikKisitDuzenle_stokIstGrup({ ...e, saha: 'grp.sistgrupkod' }); break
					case 'STOK': sahalar.add('har.stokkod', 'stk.aciklama stokadi'); wh.icerikKisitDuzenle_stok({ ...e, saha: 'har.stokkod' }); break
					case 'STOKRESIM': sahalar.add('har.stokkod resimid', 'NULL stokresim'); break
					case 'STOKMARKA': sahalar.add('stk.smarkakod stokmarkakod', 'smar.aciklama stokmarkaadi'); break
					default:
						for (let {attr, aciklama} of MQStok.getOzelSahaYapilari().flatMap(grup => grup.detaylar)) {
							if (!(attr && attrSet[attr] )) { continue }
							sahalar.add(`stk.${attr}`)
						}
				}
			}
		}
		return this
	}
	tabloYapiDuzenle_hizmet(e) {
		const {result} = e; result
			.addKAPrefix('anagrup', 'grup', 'histgrup', 'hizmet', 'kategori')
			.addGrup(new TabloYapiItem().setKA('HZANAGRP', 'Hizmet Ana Grup').secimKullanilir().setMFSinif(DMQHizmetAnaGrup)
				.addColDef(new GridKolon({ belirtec: 'anagrup', text: 'Hizmet Ana Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HZGRP', 'Hizmet Grup').secimKullanilir().setMFSinif(DMQHizmetGrup)
				.addColDef(new GridKolon({ belirtec: 'grup', text: 'Hizmet Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HZISTGRP', 'Hizmet İst. Grup').secimKullanilir().setMFSinif(DMQHizmetIstGrup)
				.addColDef(new GridKolon({ belirtec: 'sistgrup', text: 'Hizmet İst. Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HIZMET', 'Hizmet').secimKullanilir().setMFSinif(DMQHizmet)
				.addColDef(new GridKolon({ belirtec: 'hizmet', text: 'Hizmet', maxWidth: 600, filterType: 'input' })))
			.addGrup(new TabloYapiItem().setKA('KATEGORI', 'Kategori').secimKullanilir().setMFSinif(DMQKategori)
				.addColDef(new GridKolon({ belirtec: 'kategori', text: 'Kategori', maxWidth: 600, filterType: 'input' })))
			.addGrup(new TabloYapiItem().setKA('KATDETAY', 'Kategori Detay')
				.addColDef(new GridKolon({ belirtec: 'katdetay', text: 'Kat. Detay', maxWidth: 600, filterType: 'input' })));
		return this
	}
	loadServerData_queryDuzenle_hizmet(e) {
		let {attrSet, stm} = e;
		for (let sent of stm.getSentListe()) {
			let {sahalar, where: wh} = sent;
			if (attrSet.HZANAGRP) { sent.hizmet2GrupBagla() }
			if (attrSet.HZANAGRP || attrSet.HZGRP || attrSet.HZISTGRP || attrSet.HIZMET) { sent.har2HizmetBagla() }
			if (attrSet.KATEGORI || attrSet.KATDETAY) { sent.har2KatDetayBagla() }
			for (const key in attrSet) {
				switch (key) {
					case 'HZANAGRP': sent.hizmetGrup2AnaGrupBagla(); sahalar.add('grp.anagrupkod', 'agrp.aciklama anagrupadi'); wh.icerikKisitDuzenle_hizmetAnaGrup({ ...e, saha: 'grp.anagrupkod' }); break
					case 'HZGRP': sent.hizmet2GrupBagla(); sahalar.add('hiz.grupkod', 'grp.aciklama grupadi'); wh.icerikKisitDuzenle_hizmetGrup({ ...e, saha: 'hiz.grupkod' }); break
					case 'HZISTGRP': sent.hizmet2IstGrupBagla(); sahalar.add('hiz.histgrupkod', 'higrp.aciklama histgrupadi'); wh.icerikKisitDuzenle_hizmetIstGrup({ ...e, saha: 'grp.histgrupkod' }); break
					case 'HIZMET': sahalar.add('har.hizmetkod', 'hiz.aciklama hizmetadi'); wh.icerikKisitDuzenle_hizmet({ ...e, saha: 'har.hizmetkod' }); break
					case 'KATDETAY': sahalar.add('kdet.kdetay katdetay'); break
					case 'KATEGORI': sent.leftJoin('kdet', 'kategori kat', 'kdet.fissayac = kat.kaysayac'); sahalar.add('kat.kod kategorikod', 'kat.aciklama kategoriadi'); break
				}
			}
		}
		return this
	}
	tabloYapiDuzenle_miktar(e) {
		const {result} = e, {stokmu} = this, toplamPrefix = e.toplamPrefix ?? this.class.toplamPrefix;
		result.addToplam(new TabloYapiItem().setKA('MIKTAR', `${toplamPrefix}Miktar`).addColDef(new GridKolon({ belirtec: 'miktar', text: `${toplamPrefix}Miktar`, genislikCh: 15, filterType: 'numberinput' }).tipDecimal()));
		if (stokmu) {
			for (let tip of Object.keys(MQStokGenelParam.tip2BrmListe) ?? []) {
				result.addToplam(new TabloYapiItem().setKA(`MIKTAR${tip}`, `${toplamPrefix}Miktar (${tip})`)
					 .addColDef(new GridKolon({ belirtec: `miktar${tip}`, text: `${toplamPrefix}${tip}`, genislikCh: 15, filterType: 'numberinput' }).tipDecimal()))
			}
		}
		return this
	}
	loadServerData_queryDuzenle_miktar(e) {
		let {attrSet, stm} = e, PrefixMiktar = 'MIKTAR';
		for (let sent of stm.getSentListe()) {
			const {sahalar} = sent;
			if (attrSet.STOK || Object.keys(attrSet).find(x => x.startsWith(PrefixMiktar))) { sahalar.add('brm') }
			for (const key in attrSet) {
				switch (key) {
					case PrefixMiktar: sahalar.add('SUM(har.miktar) miktar'); break
					default:
						if (key.startsWith(PrefixMiktar)) {
							let brmTip = key.slice(PrefixMiktar.length)?.toUpperCase();
							sahalar.add(`${this.getBrmliMiktarClause({ brmTip, mstAlias: 'stk', harAlias: 'har' })} miktar${brmTip}`)
						}
						break
				}
			}
		}
		return this
	}
	tabloYapiDuzenle_ciro(e) {
		let {result} = e, toplamPrefix = e.toplamPrefix ?? this.class.toplamPrefix, {isAdmin, rol} = config.session ?? {};
		result
			.addToplam(new TabloYapiItem().setKA('STBRCIRO', `${toplamPrefix}Brüt Ciro`)
				.addColDef(new GridKolon({ belirtec: 'stbrciro', text: `${toplamPrefix}Brüt Ciro`, genislikCh: 19, filterType: 'numberinput' }).tipDecimal_bedel()))
			.addToplam(new TabloYapiItem().setKA('ISKBEDEL', `${toplamPrefix}İskonto Bedel`)
				.addColDef(new GridKolon({ belirtec: 'iskbedel', text: `${toplamPrefix}İskonto Bedel`, genislikCh: 19, filterType: 'numberinput' }).tipDecimal_bedel()))
			.addToplam(new TabloYapiItem().setKA('CIRO', `${toplamPrefix}Net Ciro`)
				.addColDef(new GridKolon({ belirtec: 'ciro', text: `${toplamPrefix}Net Ciro`, genislikCh: 19, filterType: 'numberinput' }).tipDecimal_bedel()))
			.addToplam(new TabloYapiItem().setKA('CIROFIYAT', `${toplamPrefix}Ciro Fiyat`)
				.setFormul(['CIRO', 'MIKTAR'], ({ rec }) => roundToFiyatFra(rec.miktar ? rec.ciro / rec.miktar : 0))
				.addColDef(new GridKolon({ belirtec: 'cirofiyat', text: `${toplamPrefix}Ciro Fiyat`, genislikCh: 30, filterType: 'numberinput' }).tipDecimal_fiyat()));
		for (const dvKod of this.dvKodListe) {
			result.addToplam(new TabloYapiItem().setKA(`CIRO_${dvKod}`, `${toplamPrefix}Ciro (<b>${dvKod}</b>)`)
				.addColDef(new GridKolon({ belirtec: `ciro_${dvKod}`, text: `${toplamPrefix}Ciro (<b>${dvKod}</b>)`, genislikCh: 19, filterType: 'numberinput' }).tipDecimal_bedel()))
			result.addToplam(new TabloYapiItem().setKA(`CIROORTKUR_${dvKod}`, `${toplamPrefix}Ciro Ort. Kur (<b>${dvKod}</b>)`)
				.setFormul(['CIRO', `CIRO_${dvKod}`], ({ rec }) => { let {ciro} = rec, dvCiro = rec[`ciro_${dvKod}`]; return dvCiro ? roundToKurFra(ciro / dvCiro) : 0 })
				.addColDef(new GridKolon({ belirtec: `ciroortkur_${dvKod}`, text: `${toplamPrefix}Ciro Ort. Kur (<b>${dvKod}</b>)`, genislikCh: 30, filterType: 'numberinput' }).tipDecimal_bedel()))
		}
		return this
	}
	loadServerData_queryDuzenle_ciro(e) {
		const {attrSet, stm} = e, dvBedelFra = app.params?.zorunlu?.dvBedelFra || 2;
		for (const {sahalar} of stm.getSentListe()) {
			for (const key in attrSet) {
				switch (key) {
					case 'STBRCIRO': sahalar.add('SUM(har.brutbedel) stbrciro'); break
					case 'CIRO': sahalar.add('SUM(har.bedel - har.dipiskonto) ciro'); break
					case 'ISKBEDEL': sahalar.add('SUM(har.brutbedel - har.bedel) iskbedel'); break
					case 'TUMMALIYET': sahalar.add('SUM(har.fmalhammadde + har.fmalmuh) tummaliyet'); break;
					case 'HAMMALIYET': sahalar.add('SUM(har.fmalhammadde) hammaliyet'); break;
					case 'MALMUH': sahalar.add('SUM(har.fmalmuh) malmuh'); break;
					case 'BRUTKAR': sahalar.add('SUM(har.bedel - har.dipiskonto - (har.fmalhammadde + har.fmalmuh)) brutkar'); break;
					default:
						for (const dvKod of this.dvKodListe) {
							if (key == `BRCIRO_${dvKod}`) {
								sahalar.add(
									`SUM(case` +
										` when fis.dvkod = '${dvKod}' then har.dvbrutbedel` +
										` else (case when COALESCE(kur${dvKod}.dovizsatis, 0) = 0 then 0 else ROUND(har.brutbedel / kur${dvKod}.dovizsatis, ${dvBedelFra}) end)` +
									` end) ciro_${dvKod}`)
							}
							else if (key == `CIRO_${dvKod}`) {
								sahalar.add(
									`SUM(case` +
										` when fis.dvkod = '${dvKod}' then har.dvbedel` +
										` else (case when COALESCE(kur${dvKod}.dovizsatis, 0) = 0 then 0 else ROUND(har.bedel / kur${dvKod}.dovizsatis, ${dvBedelFra}) end)` +
									` end) ciro_${dvKod}`)
							}
						}
						break
				}
			}
		}
		return this
	}
}
class DRapor_Sevkiyat_Main extends DRapor_Ticari_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get toplamPrefix() { return 'Net ' }
	fisVeHareketBagla(e) { super.fisVeHareketBagla(e); const {sent} = e, {shd} = this; sent.fisHareket('piffis', `pif${shd}`) }
	loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e); for (const {where: wh} of e.stm.getSentListe()) { wh.add(`fis.piftipi = 'F'`) } }
	tabloYapiDuzenle_miktar(e) {
		super.tabloYapiDuzenle_miktar(e); const {result} = e, {stokmu} = this, brmDict = app.params?.stokBirim?.brmDict ?? {};
		const tip2Bilgi = { BR: { miktarPrefix: 'br', etiketPrefix: 'Brüt' }, IA: { miktarPrefix: 'ia', etiketPrefix: 'İADE' } };
		result.addToplam(new TabloYapiItem().setKA('BRMIKTAR', 'Brüt Miktar').addColDef(new GridKolon({ belirtec: 'brmiktar', text: 'Brüt Miktar', genislikCh: 15, filterType: 'numberinput' }).tipDecimal()));
		result.addToplam(new TabloYapiItem().setKA('IAMIKTAR', 'İADE Miktar').addColDef(new GridKolon({ belirtec: 'iamiktar', text: 'İADE Miktar', genislikCh: 15, filterType: 'numberinput' }).tipDecimal()));
		for (const [tip, {miktarPrefix, etiketPrefix}] of Object.entries(tip2Bilgi)) {
			for (const brmTip of Object.keys(MQStokGenelParam.tip2BrmListe) ?? []) {
				const fra = brmDict[brmTip]; result.addToplam(new TabloYapiItem().setKA(`${tip}MIKTAR${brmTip}`, `${etiketPrefix} Miktar (${brmTip})`)
					 .addColDef(new GridKolon({ belirtec: `${miktarPrefix}miktar${brmTip}`, text: `${etiketPrefix} ${brmTip}`, genislikCh: 15, filterType: 'numberinput' }).tipDecimal(fra)))
			}
		}
		return this
	}
	loadServerData_queryDuzenle_miktar(e) {
		super.loadServerData_queryDuzenle_miktar(e); const {attrSet, stm} = e, PrefixMiktar = 'MIKTAR';
		for (const {where: wh, sahalar} of stm.getSentListe()) {
			if (attrSet.STOK || Object.keys(attrSet).find(x => x.startsWith(PrefixMiktar))) { sahalar.add('brm') }
			for (const key in attrSet) {
				if (key == `BR${PrefixMiktar}`) { sahalar.add(`SUM(case when fis.iade = '' then har.miktar else 0 end) brmiktar`) }
				else if (key == `IA${PrefixMiktar}`) { sahalar.add(`SUM(case when fis.iade = '' then 0 else har.miktar end) iamiktar`) }
				else if (key != PrefixMiktar && key.endsWith(PrefixMiktar)) {
					const tipPrefix = key.slice(0, 2), brmTip = key.slice(2 + PrefixMiktar.length)?.toUpperCase();
					const getMiktarClause = miktarClause =>
						tipPrefix == 'BR' ? `(case when fis.iade = '' then ${miktarClause} else 0 end)` :
						tipPrefix == 'IA' ? `(case when fis.iade = '' then 0 else ${miktarClause} end)` : miktarClause;
					sahalar.add(`${this.getBrmliMiktarClause({ brmTip, mstAlias: 'stk', harAlias: 'har', getMiktarClause })} brmiktar${brmTip}`)
				}
			}
		}
		return this
	}
	tabloYapiDuzenle_ciro(e) {
		super.tabloYapiDuzenle_ciro(e); let {isAdmin, rol} = config.session ?? {};
		let maliyetGorurmu = isAdmin || !rol?.ozelRolVarmi('XMALYT'), {uretimMalMuh} = app.params.uretim.kullanim;
		let {result} = e, tip2Bilgi = { BR: { miktarPrefix: 'br', etiketPrefix: 'Brüt' }, IA: { miktarPrefix: 'ia', etiketPrefix: 'İADE' } };
		result
			.addToplam(new TabloYapiItem().setKA('BRCIRO', 'Brüt Ciro').addColDef(new GridKolon({ belirtec: 'brciro', text: 'Brüt Ciro', genislikCh: 19, filterType: 'numberinput' }).tipDecimal()))
			.addToplam(new TabloYapiItem().setKA('IACIRO', 'İADE Ciro').addColDef(new GridKolon({ belirtec: 'iaciro', text: 'İADE Ciro', genislikCh: 19, filterType: 'numberinput' }).tipDecimal()))
			.addToplam(new TabloYapiItem().setKA('BRCIROFIYAT', 'Brüt Ciro Fiyat')
				.setFormul(['BRCIRO', 'BRMIKTAR'], ({ rec }) => roundToFiyatFra(rec.brciro / rec.brmiktar))
				.addColDef(new GridKolon({ belirtec: 'brcirofiyat', text: 'Brüt Ciro Fiyat', genislikCh: 19, filterType: 'numberinput' }).tipDecimal_fiyat()))
			.addToplam(new TabloYapiItem().setKA('IACIROFIYAT', 'İADE Ciro Fiyat')
				.setFormul(['IACIRO', 'IAMIKTAR'], ({ rec }) => roundToFiyatFra(rec.iaciro / rec.iamiktar))
				.addColDef(new GridKolon({ belirtec: 'iacirofiyat', text: 'İADE Ciro Fiyat', genislikCh: 19, filterType: 'numberinput' }).tipDecimal_fiyat()))
		if (maliyetGorurmu) {
			result
				.addToplamBasit_bedel('TUMMALIYET', 'Tüm Maliyet', 'tummaliyet')
				.addToplamBasit('YUZDE_CIRO_TUMMALIYET', 'Mal. Ciro(%)', 'yuzde_ciro_tummaliyet', null, null, ({ item }) =>
					item.setFormul(['TUMMALIYET', 'CIRO'], ({ rec }) => rec.ciro ? roundToFra((rec.tummaliyet / rec.ciro) * 100, 1) : 0))
				.addToplamBasit_bedel('HAMMALIYET', 'Ham Maliyet', 'hammaliyet');
			if (uretimMalMuh) { result.addToplamBasit_bedel('MALMUH', 'Maliyet Muhasebesi', 'malmuh') }
			result
				.addToplamBasit_bedel('BRUTKAR', 'Brüt Kar', 'brutkar')
				.addToplamBasit('YUZDE_CIRO_BRUTKAR', 'Kar Ciro(%)', 'yuzde_ciro_brutkar', null, null, ({ item }) =>
					item.setFormul(['BRUTKAR', 'CIRO'], ({ rec }) => rec.ciro ? roundToFra((rec.brutkar / rec.ciro) * 100, 1) : 0))
				.addToplamBasit('YUZDE_MALIYET_BRUTKAR', 'Kar Mal.(%)', 'yuzde_maliyet_brutkar', null, null, ({ item }) =>
					item.setFormul(['BRUTKAR', 'TUMMALIYET'], ({ rec }) => rec.tummaliyet ? roundToFra((rec.brutkar / rec.tummaliyet) * 100, 1) : 0))
				.addToplamBasit('BRMMALIYET', 'Brm. Maliyet', 'brmmaliyet', null, null, ({ item }) =>
					item.setFormul(['TUMMALIYET', 'MIKTAR'], ({ rec }) => rec.miktar ? roundToFra((rec.tummaliyet / rec.miktar) * 100, 1) : 0))
				.addToplamBasit('BRMIKAR', 'Br. Miktar', 'brmiktar', null, null, ({ item }) =>
					item.setFormul(['BRUTKAR', 'MIKTAR'], ({ rec }) => rec.miktar ? roundToFra((rec.brutkar / rec.miktar) * 100, 1) : 0))
		}
		return this
	}
	loadServerData_queryDuzenle_ciro(e) {
		super.loadServerData_queryDuzenle_ciro(e); const {attrSet, stm} = e, {dvKodListe} = this;
		const getCiroClause = {
			BR: dvmi => `case when fis.iade = '' then har.${dvmi ? 'dv' : ''}bedel else 0 end`,
			IA: dvmi => `case when fis.iade = 'I' then 0 - har.${dvmi ? 'dv' : ''}bedel else 0 end`
		}, sahaAliasPrefix = { BR: 'brut', IA: 'iade' }, PrefixCiro = 'CIRO';
		for (const {where: wh, sahalar} of stm.getSentListe()) {
			for (const key in attrSet) {
				if (key == `BR${PrefixCiro}`) { sahalar.add(`SUM(case when fis.iade = '' then har.bedel else 0 end) brciro`) }
				else if (key == `IA${PrefixCiro}`) { sahalar.add(`SUM(case when fis.iade = '' then 0 else har.bedel end) iaciro`) }
				else {
					for (const dvKod of dvKodListe) {
						for (const prefix of ['BR', 'IA']) {
							if (key == `${prefix}CIRO_${dvKod}`) { sahalar.add(`SUM(${getCiroClause[prefix](false)}) ${sahaAliasPrefix[prefix]}ciro`) }
							else if (key == `${prefix}CIRO_${dvKod}`) {
								sahalar.add(
									`SUM(case` +
										` when fis.dvkod = '${dvKod}' then ${getCiroClause[prefix](true)}` +
										` else (case when COALESCE(kur${dvKod}.dovizsatis, 0) = 0 then 0 else ROUND(${getCiroClause[prefix](false)} / kur${dvKod}.dovizsatis, ${dvBedelFra}) end)` +
									` end) ${sahaAliasPrefix[prefix]}_${dvKod}`)
							}
						}
					}
				}
			}
			/*for (const key in attrSet) {
				switch (key) { default: break }
			}*/
		}
		return this
	}
}
