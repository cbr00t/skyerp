class TicariFis extends TSOrtakFis {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return (this.alimmi ? 'Alım ' : this.satismi ? 'Satış ' : '') + (this.iademi ? 'İADE ' : '') }
	static get ticarimi() { return true } static get detaySinif() { return super.detaySinif }
	static detaySiniflarDuzenle({ liste }) {
		super.detaySiniflarDuzenle(...arguments); liste.push(TSHizmetDetay);
		if (app.params.ticariGenel?.kullanim?.demirbas) { liste.push(TSDemirbasDetay) }
	}
	static get gridKontrolcuSinif() { return TicariGridKontrolcu } static get noYilKullanilirmi() { return true }
	static get dipKullanilirmi() { return true } static get dipNakliyeKullanilirmi() { return false }
	static get tsStokDetayTable() { return this.siparismi ? 'sipstok' : 'pifstok' } static get tsHizmetDetayTable() { return this.siparismi ? 'siphizmet' : 'pifhizmet' }
	static get tsFasonDetayTable() { return this.siparismi ? 'sipfsstok' : 'piffsstok' } static get tsHizmetDetayTable() { return this.siparismi ? 'siphizmet' : 'pifhizmet' }
	static get tsDemirbasDetayTable() { return this.siparismi ? 'sipdemirbas' : 'pifdemirbas' } static get tsAciklamaDetayTable() { return this.siparismi ? 'sipaciklama' : 'pifaciklama' }
	static get almSat() { return null } static get ayrimTipi() { return '' } static get fisEkAyrim() { return null } static get ozelTip() { return null }
	static get ayrimTipKod() { return 'TFSAY' } static get ayrimBelirtec() { return 'tfis' } static get ayrimTableAlias() { return 'tfayr' }
	static get dipIskOranSayi() { return 1 } static get dipIskBedelSayi() { return 1 }
	static get satismi() { return this.almSat == 'T' } static get alimmi() { return this.almSat == 'A' }
	static get mustahsilmi() { return this.almSat == 'M' } static get cikisGibimi() { return this.alimmi == this.iademi } static get girisGibimi() { return !this.cikisGibimi }
	static get vergiBelirtec_kdv() { return 'kdv' } static get vergiBelirtecler() { return [this.vergiBelirtec_kdv, 'otv', 'stopaj'] }
	static get kdvHesapKodPrefix_stok() { return this.alimmi ? 'alm' : 'sat' } static get kdvHesapKodPrefix_hizmet() { return this.alimmi ? 'gid' : 'gel' }
	static get defaultVergiKodPrefix_kdv() { return this.alimmi ? 'IND' : 'TAH' } static get kdvKod_nakliye() { return `${this.defaultVergiKodPrefix_kdv}18` }
	static get kdvKAListe() { return this._kdvKAListe } static get kdvKod2Rec() { return this._kdvKod2Rec }
	static get islTipKod() { return (this.alimmi ? 'AF' : this.satismi ? 'TF' : this.mustahsilmi ? 'MF' : super.islTipKod) }
	static get varsayilanIslKod() { return ( this.alimmi ? 'AF' : this.satismi ? 'TF' : this.mustahsilmi ? 'MF' : super.islTipKod ) }
	static get mustSaha() { return 'must' }
	get fisTopIslBedel() { let toplam = 0; const {detaylar} = this; for (const det of detaylar) { toplam += (det.iskBedelToplam || 0) } return toplam }
	get ekVergiVarmi() { const {detaylar} = this; for (const det of detaylar) { if (det.ekVergiYapi && !det.bosmu) { return true } } return false }
	static async getMustKonKendiDetayKod(e) {
		e = e || {}; const {mustKod} = e; if (!mustKod) { return null }
		const sent = new MQSent({ from: 'carmst', where: { degerAta: mustKod, saha: this.mustSaha }, sahalar: ['kendidetaykod'] })
		return await app.sqlExecTekilDeger(sent)?.trimEnd()
	}
	async getMustKonKendiDetayKod(e) { e = e || {}; return this.getMustKonKendiDetayKod($.extend({}, e, { mustKod: this.mustKod })) }
	static async getMusKarsiRefKod(e) {
		e = e || {}; const {mustKod} = e; if (!mustKod) { return null }
		const sent = new MQSent({ from: 'carmst', where: { degerAta: mustKod, saha: this.mustSaha }, sahalar: ['musrefkod'] })
		return await app.sqlExecTekilDeger(sent)?.trimEnd()
	}
	async getMusKarsiRefKod(e) { e = e || {}; return this.getMusKarsiRefKod($.extend({}, e, { mustKod: this.mustKod })) }
	static async kdvKod2RecGlobalOlustur(e) {
		const kaListe = [ new CKodVeAdi({ kod: '', aciklama: '' }) ];
		const kdvKod2Rec = await MQVergi.getKdvBilgileri({ fisSinif: this });
		for (const rec of Object.values(kdvKod2Rec)) kaListe.push(new CKodVeAdi({ kod: rec.kdvKod, aciklama: rec.kdvBelirtec }))
		$.extend(TicariFis, {
			_kdvKod2Rec: kdvKod2Rec,
			_kdvKAListe: kaListe
		})
	}
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { musteriOncekiBakiyeDurumu: e.musteriOncekiBakiyeDurumu })
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			mustKod: new PInstStr(this.mustSaha), ticMustKod: new PInstStr('ticmust'),
			altHesapKod: new PInstStr('cariitn'), sevkAdresKod: new PInstStr('xadreskod'),
			nakSekliKod: new PInstStr('nakseklikod')
		})
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimTopluEkle({
			must: new SecimString({ etiket: 'Müşteri', mfSinif: MQCari }), mustUnvan: new SecimOzellik({ etiket: 'Müşteri Ünvan' }),
			ticMust: new SecimString({ etiket: 'Tic. Müşteri', mfSinif: MQCari }), altHesapKod: new SecimString({ etiket: 'Alt Hesap', mfSinif: MQAltHesap }),
			yerKod: new SecimString({ etiket: 'Yer', mfSinif: MQStokYer })
		});
		sec.whereBlockEkle(e => {
			const {aliasVeNokta} = this, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.must, `${aliasVeNokta}must`); wh.ozellik(sec.mustUnvan, 'car.birunvan');
			wh.basiSonu(sec.ticMust, `${aliasVeNokta}ticmust`); wh.basiSonu(sec.altHesapKod, `${aliasVeNokta}cariitn`);
			wh.basiSonu(sec.yerKod, `${aliasVeNokta}yerkod`)
		})
	}
	static rootFormBuilderDuzenle({ builders: allBuilders }) {
		super.rootFormBuilderDuzenle(...arguments); let {builders} = allBuilders.baslikForm;
		builders[0].addModelKullan('mustKod').autoBind().setMFSinif(MQCari).etiketGosterim_normal()
			.ozelQueryDuzenleBlock(({ alias, stm }) => { for (let {sahalar} of stm) { sahalar.add(`${alias}.efaturakullanirmi`) } })
			.degisince(({ builder: fbd }) => fbd.altInst.cariDegisti(...arguments)).addStyle(e => `$elementCSS { min-width: 70% !important }`)
	}
	static orjBaslikListesiDuzenle_ara(e) {
		super.orjBaslikListesiDuzenle_ara(e); const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'must', text: 'Müşteri', genislikCh: 25, sql: `fis.${this.mustSaha}` }),
			new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', genislikCh: 50, sql: 'car.birunvan' }),
			new GridKolon({ belirtec: 'xadreskod', text: 'Sevk Adres', genislikCh: 25 }),
			new GridKolon({ belirtec: 'xadresadi', text: 'Sevk Adres Adı', genislikCh: 35, sql: 'sadr.aciklama' })
		)
	}
	static standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e); const {liste} = e; liste.push('must', 'mustunvan') }
	static async raporKategorileriDuzenle_baslik(e) {
		await super.raporKategorileriDuzenle_baslik(e); const {kullanim} = app.params.ticariGenel;
		const section = [
			'FRFisTicari-Baslik',
			( kullanim.plasiyer ? 'Plasiyer' : null ),
			'FRFisTicari-SevkAdres', 'FRFisTicari-DegAdres',
			( kullanim.altHesap ? 'AltHesap' : null ),
			( kullanim.takipNo ? 'TakipNo' : null ),
			'FRFisTicari-RefNoBilgi'
		];
		await e.kat.ekSahaYukle({ section })
	}
	static async raporKategorileriDuzenle_baslikDetayArasi(e) {
		await super.raporKategorileriDuzenle_baslikDetayArasi(e); const {modelRapor} = e;
		let kat = e.kat = await CariRapor.getCariKategori(e);
		const sahaVergiVeyaTCNo = kat.detaylar.find(rSaha => rSaha.attr == 'vergiveyatcno');
		if (sahaVergiVeyaTCNo) {
			sahaVergiVeyaTCNo.sql[1] = (
				`(case ` +
					`when fis.degiskenvknox = '' then car.vkno ` +
					`when len(fis.degiskenvknox in (10, 11)) then fis.degiskenvknox ` +
					`else ` +
						`(case ` +
							`when fis.ayrimtipi = 'IH' then '${VergiNo.yurtDisiVKN}' ` +
							`when deg.sahismi <> '' then '${TCKimlik.perakendeVKN}' ` +
							`else '${VergiNo.perakendeVKN}' ` +
						 `end) ` +
				 `end)`
			)
		};
		modelRapor.addKolonKategori(kat)
	}
	static async raporKategorileriDuzenle_detaylar_tsStokMiktarOncesi(e) {
		await super.raporKategorileriDuzenle_detaylar_tsStokMiktarOncesi(e); const section = ['FRFisTSDetay-SanalDoviz', 'FRFisTicariDetay-GTIP'];
		await e.kat.ekSahaYukle({ section })
	}
	static async raporKategorileriDuzenle_detaylar_fiyatEk(e) {
		await super.raporKategorileriDuzenle_detaylar_fiyatEk(e); const {kat} = e;
		let section = ['FRFisTicariDetay-FiyatBedel']; await kat.ekSahaYukle({ section });
		for (const item of TicIskYapi.getIskIter()) {
			const {rowAttr} = item, rSaha = new RRSahaDegisken({ attr: rowAttr, baslik: item.etiket, genislikCh: 6, sql: `har.${rowAttr}`}).tipNumerik();
			rSaha.sql[2] = '0'; kat.addDetay(rSaha)			/* 0: 'aciklama' tablosu */
		}
		section = ['FRFisTicariDetay-Kategori', 'FRFisTicariDetay-VergiKodVeBedel']; await kat.ekSahaYukle({ section })
	}
	static raporQueryDuzenle(e) {
		super.raporQueryDuzenle(e); const {sent, attrSet} = e;
		sent.fis2CariBagla(); sent.cariHepsiBagla();
		sent.fromIliski('althesap alth', 'fis.cariitn = alth.kod');
		sent.fromIliski('ahgrup ahgrp', 'alth.ahgrupkod = ahgrp.kod');
		sent.fis2PlasiyerBagla();
		sent.fromIliski('takipmst tak', 'fis.orttakipno = tak.kod');				/* yanlislikla PTSOrtak icin 'otak' verildi */
		sent.fromIliski('naksekli nak', 'fis.nakseklikod = nak.kod');
		sent.fromIliski('carsevkadres sadr', 'fis.xadreskod = sadr.kod');
		sent.fromIliski('caril sadril', 'sadr.ilkod = sadril.kod');
		sent.fromIliski('arac arc', 'fis.tasimaarackod = arc.kod');
		sent.fromIliski('aracsofor sof', 'fis.tasimasoforkod = sof.kod');
		sent.leftJoin({ alias: 'fis', table: 'tahsilsekli tsek', on: 'fis.martahsil = tsek.kodno' });
		if (attrSet.degAdresIlAdi) { sent.fromIliski('caril degil', 'deg.ilkod = degil.kod') }
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta, almSat, ayrimTipi, fisEkAyrim} = this, {sent} = e;
		sent.fromIliski('carmst car', 'fis.must = car.must').fromIliski('carsevkadres sadr', `${aliasVeNokta}xadreskod = sadr.kod`);
		if (almSat) { sent.where.degerAta(almSat, `${aliasVeNokta}almsat`) }
		if (ayrimTipi != null) { sent.where.degerAta(ayrimTipi, `${aliasVeNokta}ayrimtipi`) }
		if (fisEkAyrim != null) { sent.where.degerAta(ayrimTipi, `${aliasVeNokta}ayrimtipi`) }
		sent.sahalar.add(`${aliasVeNokta}piftipi`, `${aliasVeNokta}almsat`, `${aliasVeNokta}iade`, `${aliasVeNokta}ayrimtipi`, `${aliasVeNokta}fisekayrim`)
	}
	tekilOku_detaylar_queryDuzenle(e) { super.tekilOku_detaylar_queryDuzenle(e); e.detaySinif.tekilOku_detaylar_queryDuzenle_ticari(e) }
	async uiGirisOncesiIslemler(e) {
		await super.uiGirisOncesiIslemler(e);
		await MQVergiKdv.getKod2VergiBilgi()    /* cache = MQVergi.globals.belirtec2Globals.kdv.kod2VergiBilgi */
	}
	async kaydetOncesiIslemler(e) { await super.kaydetOncesiIslemler(e); await this.fisBakiyeDurumuGerekirseAyarla(e) }
	async disKaydetOncesiIslemler(e) {
		let {tarih, subeKod, mustKod, detaylar} = this, kapsam = { tarih, subeKod, mustKod };
		let kosulYapilar = new SatisKosulYapi({ kapsam }); if (!await kosulYapilar.yukle()) { kosulYapilar = null }
		let {FY} = kosulYapilar ?? {}; if (FY) {
			let duzDetaylar = detaylar.filter(det => det.stokmu && !det.promosyonmu && !det.fiyat);
			let stokKodSet = asSet(duzDetaylar.map(det => det.shKod));
			if (!$.isEmptyObject(stokKodSet)) {
				let kod2KosulResult = (await SatisKosul_Fiyat.getAltKosulYapilar(Object.keys(stokKodSet), kosulYapilar?.FY, mustKod)) ?? {};
				let {fiyat} = kosulResult ?? {}; if (fiyat) { $.extend(det, { fiyat, ozelFiyatVarmi: true }) }
				for (let det of duzDetaylar) {
					let {fiyat} = kod2KosulResult[det.shKod] ?? {};
					if (fiyat) { $.extend(det, { fiyat }) }
				}
			}
		}
		await super.disKaydetOncesiIslemler(e)
	}
	async topluYazmaKomutlariniOlusturSonrasi(e) {
		super.topluYazmaKomutlariniOlusturSonrasi(e); let _e = { ...e, degistir: false };
		await this.dipEBilgiKomutlariniOlustur(_e);
		await this.dipEBilgi2DipAktarKomutlariniOlustur(_e)
	}
	async topluDegistirmeKomutlariniOlusturSonrasi(e) {
		super.topluDegistirmeKomutlariniOlusturSonrasi(e); let _e = { ...e, degistir: true };
		await this.dipEBilgiKomutlariniOlustur(_e);
		await this.dipEBilgi2DipAktarKomutlariniOlustur(_e)
	}
	async dipEBilgiKomutlariniOlustur(e) {
		let degistirmi = e.degistir ?? e.degistirmi, {trnId, toplu, paramName_fisSayac} = e;
		let {sayac} = this, {table: fisTable} = this.class, sayacSaha = fisTable == 'sipfis' ? 'sipsayac' : 'pifsayac';
		let eskiWhere, uniqueKeys = ['pifsayac', 'sipsayac', 'seq'], hvListe = this.getDipEBilgi_hvListe(...arguments);
		if (degistirmi) { eskiWhere = new MQWhereClause({ degerAta: sayac, saha: sayacSaha }) }
		else { let param_fisSayac = new MQSQLConst(paramName_fisSayac); for (let hv of hvListe) { hv[sayacSaha] = param_fisSayac } }
		let table = 'dipebilgi', farkBilgi = await MQSQLOrtak.topluYazVeyaDegistirIcinYap({ trnId, toplu, uniqueKeys, table, hvListe, eskiWhere });
		return farkBilgi
	}
	async dipEBilgi2DipAktarKomutlariniOlustur(e) {
		let degistirmi = e.degistir ?? e.degistirmi, {trnId, toplu, paramName_fisSayac} = e, {sayac} = this;
		let {table: fisTable} = this.class, dsPrefix = fisTable == 'sipfis' ? 'sip' : 'pif';
		let dipVergiTable = `${dsPrefix}dipvergi`, dipHizmetTable = `${dsPrefix}diphizmet`;
		/* (xdipvergi, dipebilgi) için sahalar ortaktır */
		let ortakSahalar = ['anatip', 'alttip', 'ba', 'bedel', 'dvbedel'];
		/* (xdipvergi, dipebilgi) için sahalar Vergi için ortaktır */
		let vergiSahalar = [...ortakSahalar, 'ustoran', 'oran', 'vergikod', 'matrah'];
		/* (xdipvergi, dipebilgi) için sahalar Hizmet için ortaktır */
		let hizmetSahalar = [...ortakSahalar, 'hizmetkod'];
		if (degistirmi) {
			let uniqueOrtakKeys = ['fissayac', 'anatip', 'alttip', 'ba'];
			let ekle = async (dipTable, dipSahalar, hvTip, ekUniqueKeys) => {
				let sent = new MQSent({
					from: 'dipebilgi', sahalar: dipSahalar,
					where: [{ degerAta: sayac, saha: `${dsPrefix}sayac` }, { degerAta: hvTip, saha: 'hvtip' }]
				});
				let hvListe = []; for (let rec of await app.sqlExecSelect(sent)) {
					rec.fissayac = sayac;
					hvListe.push(rec)
				}
				let uniqueKeys = [...uniqueOrtakKeys, ...ekUniqueKeys];
				let eskiWhere = new MQWhereClause({ degerAta: sayac, saha: 'fissayac' });
				await MQSQLOrtak.topluYazVeyaDegistirIcinYap({ trnId, toplu, uniqueKeys, table: dipTable, hvListe, eskiWhere })
			}
			await Promise.all([
				ekle(dipVergiTable, vergiSahalar, 'V', ['vergikod', 'ustoran']),
				ekle(dipHizmetTable, hizmetSahalar, 'H', ['hizmetkod'])
			]);
			return
		}
		toplu.add(
			new MQSelect2Insert({
				table: `${dipVergiTable} (fissayac, ${vergiSahalar.join(', ')})`,
				sent: new MQSent({
					from: 'dipebilgi', where: [
						{ degerAta: paramName_fisSayac.sqlConst(), saha: 'pifsayac' },
						{ degerAta: 'V', saha: 'hvtip' },
						{ degerAta: 'KD', saha: 'anatip' }
					],
					sahalar: [paramName_fisSayac, ...vergiSahalar]
				}).distinctYap()
			})
		)
	}
	// Stok/Hizmet/Demirbaş için Vergi bilgileri ek belirlemeler
	async detaylariYukleSonrasi(e) { e = e || {}; await super.detaylariYukleSonrasi(e); await this.class.kdvKod2RecGlobalOlustur(e) }
	static varsayilanKeyHostVarsDuzenle({ hv }) {
		super.varsayilanKeyHostVarsDuzenle(...arguments); let {almSat, ayrimTipi, fisEkAyrim, ozelTip} = this;
		if (almSat != null) { hv.almsat = almSat }
		if (ayrimTipi != null) { hv.ayrimtipi = ayrimTipi }
		if (fisEkAyrim != null) { hv.fisekayrim = fisEkAyrim }
		if (ozelTip != null) { hv.ozeltip = ozelTip }
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments); if (!hv.ticmust) { hv.ticmust = hv.must }
		this.dipIslemci?.ticariFisHostVarsDuzenle(...arguments)
	}
	detayHostVarsDuzenle(e) {
		super.detayHostVarsDuzenle(e); let {det} = e; e.fis = this;
		if (det?.ticariHostVarsDuzenle) { det.ticariHostVarsDuzenle(e) }
	}
	detaySetValues(e) {
		super.detaySetValues(e); let {det} = e;
		e.fis = this; det?.ticariSetValues?.(e)
	}
	getDipEBilgi_hvListe(e) {
		let {table} = this.class, {sayac, dipIslemci} = this, {belirtec2DipSatir} = dipIslemci ?? {};
		if (!belirtec2DipSatir) { return [] }
		let psAttr = (table == 'sipfis' ? 'sipsayac' : 'pifsayac'), hvListe = [];
		let seq = 0, vergiDahilIcinEklenecek = new TLVeDVBedel();
		let odenecekIcinDusulecek = new TLVeDVBedel(), dipSatir_sonuc;
		let fis = e.fis = this, {alimmi, iademi} = fis.class;
		let fisBA = e.fisBA = alimmi == iademi ? 'A' : 'B';
		for (let dipSatir of Object.values(belirtec2DipSatir)) {
			if (dipSatir.sonucmu) { dipSatir_sonuc = dipSatir; continue }
			let hv = dipSatir.eDipHostVars(e); if (!(hv?.bedel || hv?.dvbedel)) { continue }
			if (dipSatir.vergiDahileEklenirmi(e)) { vergiDahilIcinEklenecek.ekle(dipSatir) }
			if (dipSatir.odenecektenDusulurmu(e)) { odenecekIcinDusulecek.cikar(dipSatir) }
			hv[psAttr] = sayac; hv.seq = ++seq; hvListe.push(hv)
		}
		if (dipSatir_sonuc) {
			let {bedelYapi: sonucBedelYapi} = dipSatir_sonuc, {eDipBosHostVars: hv_vergiDahil} = dipSatir_sonuc, {eDipBosHostVars: hv_odenecek} = dipSatir_sonuc;
			$.extend(hv_vergiDahil, {
				anatip: 'DP', alttip: 'VD', xadi: 'Vergi Dahil Bedel',
				bedel: roundToBedelFra(sonucBedelYapi.tl + vergiDahilIcinEklenecek.tl), dvbedel: roundToBedelFra(sonucBedelYapi.dv + vergiDahilIcinEklenecek.dv) })
			$.extend(hv_odenecek, {
				anatip: 'DP', alttip: 'OD', xadi: 'Ödenecek Bedel',
				bedel: roundToBedelFra(sonucBedelYapi.tl - odenecekIcinDusulecek.tl), dvbedel: roundToBedelFra(sonucBedelYapi.dv - odenecekIcinDusulecek.dv) })
			for (let hv of [hv_vergiDahil, hv_odenecek]) {
				hv[psAttr] = sayac; hv.seq = ++seq; hvListe.push(hv) }
		}
		return hvListe
	}
	dipGridSatirlariDuzenle(e) {
		super.dipGridSatirlariDuzenle(e); const {liste} = e;
		liste.push(new DipSatir_Brut(e));
		if (this.class.mustahsilmi) { this.dipGridSatirlariDuzenle_mustahsil(e)} else { this.dipGridSatirlariDuzenle_ticari(e) }
		liste.push(new DipSatir_Sonuc(e))
	}
	dipGridSatirlariDuzenle_ticari(e) {
		const {dipIslemci, liste} = e, {sabitKdvOranlari} = MQVergi, {dipIskOranSayi, dipIskBedelSayi, dipNakliyeKullanilirmi} = this.class;
		for (let seq = 1; seq <= dipIskOranSayi; seq++) { liste.push(new DipSatir_IskOran($.extend({}, e, { seq }))) }
		for (let seq = 1; seq <= dipIskBedelSayi; seq++) { liste.push(new DipSatir_IskBedel($.extend({}, e, { seq }))) }
		if (dipNakliyeKullanilirmi) { liste.push(new DipSatir_Nakliye(e).basitHidden()) }
		const {offsetRefs} = dipIslemci; offsetRefs.kdv = liste[liste.length - 1]
	}
	dipGridSatirlariDuzenle_mustahsil(e) { }
	uiDuzenle_fisGirisIslemTuslari(e) {
		super.uiDuzenle_fisGirisIslemTuslari(e); const {parent} = e, gridPart = e.gridPart ?? e.sender, sender = gridPart, fis = this;
		let btn = $(`<button id="kdvEk">KDV EK</button>`); btn.on('click', evt => {
			if (this.kayitIcinOzelIsaretlimi) { hConfirm('<u>Özel İşaretli</u> fişler için <b>KDV EK</b> işlemleri kullanılamaz', 'Fiş Giriş'); return }
			const det = gridPart.selectedRec; if (!(det?.class?.shdmi)) { hConfirm('<b>KDV EK</b> işlemleri sadece <u>Stok/Hizmet/Demirbaş</u> satırları için kullanılabilir', 'Fiş Giriş'); return }
			const part = new FisEkVergiWindowPart({
				sender, fis, detay: det, ekVergiYapi: det.ekVergiYapi.deepCopy(),
				tamamIslemi: e => {
					console.info(e); const {ekVergiYapi} = e, colKdvEk = gridPart.belirtec2Kolon.kdvEkText; $.extend(det.ekVergiYapi, ekVergiYapi);
					if (colKdvEk) {
						const {belirtec} = colKdvEk; gridWidget.setcellvalue(rowIndex, belirtec, ekVergiYapi.kdvEkText || null);
						const hideFlag = ekVergiYapi.bosmu; if (!hideFlag) { colKdvEk.attributes.hidden = hideFlag; gridPart[hideFlag ? 'hideColumn' : 'showColumn'](belirtec) }
					}
				}
			}); part.run()
		});
		btn.appendTo(parent)
	}
	fisGiris_gridVeriYuklendi(e) {
		super.fisGiris_gridVeriYuklendi(e); const {detaylar} = this, vergiKullanim = {}; let vergiKullanimSayi = 0;
		for (const det of detaylar) {
			if (!vergiKullanim.otv && det.otvKod) { vergiKullanim.otv = true; vergiKullanimSayi++ }
			if (!vergiKullanim.stopaj && det.stopaj) { vergiKullanim.stopaj = true; vergiKullanimSayi++ }
			if (!vergiKullanim.ekVergi && det.ekVergiYapi && !det.ekVergiYapi.bosmu) { vergiKullanim.ekVergi = true; vergiKullanimSayi++ }
			if (vergiKullanimSayi == 3) { break }
		}
		if (!$.isEmptyObject(vergiKullanim)) {
			const {sender} = e, {belirtec2Kolon} = sender, gridWidget = e.gridWidget ?? sender.gridWidget;
			const kolonGoster = e => { const colDef = e.colDef || (belirtec2Kolon[e.belirtec]); if (colDef) { colDef.visible(); gridWidget.showcolumn(colDef.belirtec) } };
			if (vergiKullanim.otv) { kolonGoster({ belirtec: 'otvBelirtec' }) }
			if (vergiKullanim.stopaj) { kolonGoster({ belirtec: 'stopajBelirtec' }) }
			if (vergiKullanim.ekVergi) { kolonGoster({ belirtec: 'kdvEkText' }) }
		}
	}
	async satisKosulYapiOlustur(e) {
		await super.satisKosulYapiOlustur(e);
		let {tarih, subeKod, mustKod} = this, kapsam = { tarih, subeKod, mustKod };
		let kosulYapilar = new SatisKosulYapi({ kapsam }); if (!await kosulYapilar.yukle()) { kosulYapilar = null }
		$.extend(this, { kosulYapilar }); return this
	}
	async fisBakiyeDurumuGerekirseAyarla(e) {
		if (!this.class.cikisGibimi) { return } let {trnId, eskiFis} = e, {mustKod} = this;
		let {musteriOncekiBakiyeDurumu} = this; if (musteriOncekiBakiyeDurumu && eskiFis && mustKod != eskiFis.mustKod) { musteriOncekiBakiyeDurumu = null }
		if (!musteriOncekiBakiyeDurumu) {
			if (eskiFis && eskiFis.mustKod == mustKod) {
				const {musteriOncekiBakiyeDurumu: _musteriOncekiBakiyeDurumu} = eskiFis;
				if (_musteriOncekiBakiyeDurumu) { musteriOncekiBakiyeDurumu = (_musteriOncekiBakiyeDurumu.deepCopy ? _musteriOncekiBakiyeDurumu.deepCopy() : $.extend(true, {}, _musteriOncekiBakiyeDurumu)) }
				else {
					let query = new MQSent({
						from: 'carbakiye', sahalar: ['SUM(bakiye) bakiye', 'SUM(dvbakiye) dvbakiye'],
						where: [ `ozelisaret <> 'X'`, { degerAta: mustKod, saha: this.class.mustSaha }, { degerAta: this.altHesapKod, saha: 'althesapkod' } ]
					});
					let rec = await app.sqlExecTekil({ trnId, query });
					musteriOncekiBakiyeDurumu = { oncekiBakiye: new TLVeDVBedel({ tl: rec.bakiye, dv: rec.dvbakiye }), bakiyeEkle: new TLVeDVBedel() }
				}
			}
		}
		$.extend(this, musteriOncekiBakiyeDurumu)
	}
}
class SiparisFis extends TicariFis {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get siparismi() { return true }
	static get sinifAdi() { return `${super.sinifAdi}Siparis` } static get table() { return 'sipfis' }
	static get baslikOzelAciklamaTablo() { return 'sipbasekaciklama' } static get dipSerbestAciklamaTablo() { return 'sipdipaciklama' } static get dipEkBilgiTablo() { return 'sipdipekbilgi' }
	static get pifTipi() { return 'S' } static get iade() { return '' } static get ozelTip() { return '' }
	constructor(e) {
		e = e || {}; super(e); this.noYil = 0;
		this.baslikTeslimTarihi = e.teslimTarihi || this.baslikTeslimTarihi;
		if (this.baslikTeslimTarihi) { this.teslimOrtakdir = true }
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments); $.extend(pTanim, {
			teslimOrtakdir: new PInstBitBool('bteslimortakdir'),
			baslikTeslimTarihi: new PInstDate('basteslimtarihi')
		})
	}
	static async raporKategorileriDuzenle_detaylar_tsStokMiktarOncesi(e) {
		await super.raporKategorileriDuzenle_detaylar_tsStokMiktarOncesi(e);
		let section = ['FRFisTicariDetay-Teslim', 'FRSipDetay-SevkVeKalan']; await e.kat.ekSahaYukle({ section })
	}
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments); delete hv.detyerkod;
		hv.basteslimtarihi = hv.basteslimtarihi || this.tarih
	}
	static getDonusumYapi(e) {
		super.getDonusumYapi(e); let {detaySinif} = e;
		return ({ table: detaySinif?.sipDonusumTable, baglantiSaha: 'sipharsayac' })
	}
}
class SatisSiparisFis extends SiparisFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PSATSIP' } static get numTipKod() { return 'TS' } static get almSat() { return 'T' }
}
class AlimSiparisFis extends SiparisFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PALMSIP' } static get numTipKod() { return 'AS' } static get almSat() { return 'A' }
}

class SevkiyatFis extends TicariFis {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get gridKontrolcuSinif() { return this.eBilgi?.gridKontrolcuSinif || super.gridKontrolcuSinif }
	static get table() { return 'piffis' } static get baslikOzelAciklamaTablo() { return 'pifbasekaciklama' } static get dipSerbestAciklamaTablo() { return 'pifdipaciklama' }
	static get dipEkBilgiTablo() { return 'pifdipekbilgi' } static get pifTipi() { return null } static get iade() { return '' } static get fisEkAyrim() { return '' }
	get bakiyeciler() {
		const {alimmi, iademi, fasonmu} = this.class, stok_sqlDuzenleyici = fasonmu ? 'stokBakiyeSqlEkDuzenle_pifFSStok' : 'stokBakiyeSqlEkDuzenle_pifStok';
		return [...super.bakiyeciler, new StokBakiyeci({ borcmu: e => alimmi != iademi, sqlDuzenleyici: stok_sqlDuzenleyici }) /* sipariş için gelecek/gidecek ayarı yapılacak */]
	}
	constructor(e) {
		e = e || {}; super(e);
		const eBilgi = this.eBilgi = e.eBilgi; if (eBilgi) { this.eBilgiIcinYukle(e) }
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, {
			sevkTarih: new PInstDateToday('sevktarihi'), sevkSaat: new PInstDateTimeNow('sevksaati'),
			yerKod: new PInstStr({ rowAttr: 'yerkod', init: e => 'A' }), yerOrtakmi: new PInstTrue('yerortakdir'),
			malKabulNo: new PInstNum('malkabulno'), kunyeNox: new PInstStr('kunyenox'), borsaTescilYapildimi: new PInstBool('borsatescilvarmi')
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); const {baslikForm} = e.builders;
		baslikForm.builders[1].addCheckBox('yerOrtakmi', 'Yer Ortakdır').degisince(e => {
			const {builder} = e, {altInst, rootPart, parentBuilder} = builder, {kontrolcu} = rootPart; parentBuilder.id2Builder.yerKod.updateVisible();
			e.sender = e.gridPart = rootPart; $.extend(e, { builder });
			if (altInst.yerOrtakmiDegisti) { altInst.yerOrtakmiDegisti(e) } if (kontrolcu.yerOrtakmiDegisti) { kontrolcu.yerOrtakmiDegisti(e) }
		});
		baslikForm.builders[1].addModelKullan('yerKod').setMFSinif(MQStokYer).comboBox().autoBind().etiketGosterim_normal().addStyle_wh(400)
			.setVisibleKosulu(e => e.builder.altInst.yerOrtakmi ? true : 'basic-hidden')
	}
	static orjBaslikListesiDuzenle_ara(e) {
		super.orjBaslikListesiDuzenle_ara(e); const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: 'yerkod', text: 'Yer', genislikCh: 7 }),
			new GridKolon({ belirtec: 'yeradi', text: 'Yer Adı', genislikCh: 20, sql: 'yer.aciklama' })
		);
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta, pifTipi, iade} = this, {sent} = e;
		sent.fromIliski('stkyer yer', 'fis.yerkod = yer.kod');
		if (pifTipi) { sent.where.degerAta(pifTipi, `${aliasVeNokta}piftipi`) }
		if (iade != null) { sent.where.degerAta(iade, `${aliasVeNokta}iade`) }
	}
	static async raporKategorileriDuzenle_baslik(e) {
		await super.raporKategorileriDuzenle_baslik(e); const section = ['PTBaslikFis2', 'PTBaslikFisIslem', 'FRFisGenel-Yer'];
		await e.kat.ekSahaYukle({ section })
	}
	static varsayilanKeyHostVarsDuzenle(e) { super.varsayilanKeyHostVarsDuzenle(e); const {hv} = e; $.extend(hv, { piftipi: this.pifTipi, iade: this.iade }) }
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; hv.oncelik = this.class.oncelik }
	eBilgiIcinYukle(e) {
		super.eBilgiIcinYukle(e); const eBilgi = this.eBilgi || {};
		const {rec} = eBilgi; if (!rec) { return this } const yerRec = eBilgi.yerRec || {};
		$.extend(this, {
			tarih: asDate(rec.tarih), seri: rec.seri, noYil: asInteger(rec.noyil), fisNo: asInteger(rec.fisNo),
			mustKod: rec.mustkod, yerKod: yerRec.kod || this.yerKod, subeKod: yerRec.bizsubekod || this.subeKod
		});
		return this
	}
	async eBilgiIcinDetaylariYukle(e) {
		await super.eBilgiIcinDetaylariYukle(e);
		const {result} = e, eBilgi = this.eBilgi || {}, {rec} = eBilgi; if (!rec) { return this }
		const alimGecFisSayac = rec.fissayac;
		let sent = new MQSent({ from: 'efgecicialfatdetay har', where: { degerAta: alimGecFisSayac, saha: 'har.fissayac' } });
		sent.har2StokBagla(); sent.har2HizmetBagla(); sent.har2DemirbasBagla({ sahaAdi: 'demkod' });
		sent.addWithAlias('har',
			'seq', 'efbarkod', 'efstokkod', 'efstokadi', 'efmiktar', 'iskoranstr',
			'shtip', 'miktar', 'irskabuledilmeyen', 'irseksik', 'irsfazla',
			'fiyat', 'kdvorani', 'otvorani', 'stopajorani', 'konaklamaorani', 'tevoranx', 'bedel',
		);
		sent.add(
			`(case har.shtip when 'H' then har.hizmetkod when 'D' then har.demkod else har.stokkod end) shkod`,
			`(case har.shtip when 'H' then hiz.aciklama when 'D' then dem.aciklama else stk.aciklama end) shadi`,
			`(case har.shtip when 'H' then hiz.brm when 'D' then dem.brm else stk.brm end) shbrm`,
			`(case har.shtip when  '' then stk.brm2 else '' end) shbrm2`,
			`(case har.shtip when  '' then stk.brmorani else 0 end) shbrmorani`,
			`(case har.shtip when 'H' then (case hiz.kkegtipi when '3' then 30 when '1' then 100 else 0 end) else 0 end) kkegyuzde`,
			`(har.irskabuledilmeyen + har.irseksik - har.irsfazla) irsgecersiz`,
			`(case har.shtip when 'H' then hiz.adidegisir when 'D' then '' else stk.adidegisir end) shadidegiskenmi`,
			`(case har.shtip when 'H' then hiz.gidkdvdegiskenmi when 'D' then '' else stk.almkdvdegiskenmi end) shkdvdegiskenmi`,
			`(case har.shtip when 'H' then hiz.gidkdvhesapkod when 'D' then dem.almkdvhesapkod else stk.almkdvhesapkod end) shkdvhesapkod`,
			`(case har.shtip when  '' then stk.almotvhesapkod else '' end) shotvhesapkod`,
			`(case har.shtip when 'H' then hiz.gidstopajhesapkod else '' end) shstopajhesapkod`,
			`(case har.shtip when 'H' then hiz.gidkonaklamahesapkod else '' end) shkonaklamahesapkod`
		);
		const stm = new MQStm({ sent: sent, orderBy: ['seq'] });
		const tip2Vergi = {
			kdv: { oran2Kod: {}, get sinif() { return MQVergiKdv } },
			otv: { oran2Kod: {}, get sinif() { return MQVergiOtv } },
			stopaj: { oran2Kod: {}, get sinif() { return MQVergiStopaj } },
			konaklama: { oran2Kod: {}, get sinif() { return MQVergiKonaklama } }
		};
		const detRecs = await app.sqlExecSelect(stm), errors = [];
		for (const detRec of detRecs) {
			for (const tip in tip2Vergi) {
				const ba = tip == 'stopaj' ? 'A' : 'B', yapi = tip2Vergi[tip], {sinif} = yapi;
				const oran = detRec[`${tip}orani`]; if (!oran) { continue }
				if (yapi.oran2Kod[oran] === undefined) {
					const oran2KodSet = (await sinif.oran2KodSet({ ba })) || {};
					const kodSet = oran2KodSet[oran] || {}, kod = Object.keys(kodSet)[0] ?? null; yapi.oran2Kod[oran] = kod;
					if (kod == null) { errors.push(`${tip}: %${oran}`) }
				}
				detRec[`${tip}Kod`] = yapi.oran2Kod[oran]
			}
		}
		if (!$.isEmptyObject(errors)) {
			if (result) { $.extend(result, { isError: true, message: 'Bazı Vergi Kodları hatalıdır', detail: `<ul class="flex-row firebrick">${errors.map(text => `<li class="bold">${text}</li>`)}</ul>` }) }
			return this
		}
		this.detaylarReset(); const {detaylar} = this;
		const shTip2DetSinif = { '': TSStokDetay, 'H': TSHizmetDetay, 'D': TSDemirbasDetay }; e.fis = this;
		for (const detRec of detRecs) {
			const detSinif = shTip2DetSinif[detRec.shtip.trimEnd()]; if (!detSinif) { continue }
			const det = new detSinif({ seq: detRec.seq, eBilgi: detRec });
			await det.eBilgiSetValues(e); detaylar.push(det)
		}
		if (detaylar.find(det => det.eBilgi.bedel != det.netBedel)) { this.hesapSekli.fiyatYap() }
		return this
	}
	stokBakiyeSqlEkDuzenle_pifStok(e) { e.table = 'pifstok'; return this.stokBakiyeSqlEkDuzenle_pifXStok(e) }
	stokBakiyeSqlEkDuzenle_pifFSStok(e) { e.table = 'piffsstok'; return this.stokBakiyeSqlEkDuzenle_pifXStok(e) }
	stokBakiyeSqlEkDuzenle_pifXStok(e) {
			/* sipariş için gelecek/gidecek ayarı yapılacak */
		const {table, sent, borcmu} = e, {sahalar} = sent; sent.fis2HarBagla(table); sahalar.addWithAlias('fis', 'ozelisaret');
		sahalar.addWithAlias('har', 'stokkod', 'detyerkod yerkod', 'opno', ...HMRBilgi.rowAttrListe);
		sahalar.add('SUM(har.miktar) sonmiktar', 'SUM(har.miktar2) sonmiktar2')
	}
	yerOrtakmiDegisti(e) { }
}

class FaturaFis extends SevkiyatFis {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return `${super.sinifAdi}Fatura` } static get pifTipi() { return 'F' } static get faturami() { return true }
	get bakiyeciler() { const {alimmi, iademi} = this.class; return [...super.bakiyeciler, new CariBakiyeci({ borcmu: e => alimmi == iademi }) ] }
	static async raporKategorileriDuzenle_baslik(e) {
		await super.raporKategorileriDuzenle_baslik(e); const sections = ['FRFatura-IrsBilgi'];
		await e.kat.ekSahaYukle({ section: sections })
	}
	cariBakiyeSqlEkDuzenle(e) {
		const {sent, borcmu} = e, {sahalar} = sent;
		sahalar.addWithAlias('fis', 'ticmust must', 'cariitn althesapkod', 'ozelisaret', 'net bakiye', 'dvnet dvbakiye');
	}
}
class SatisFaturaFis extends FaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PSATFAT' } static get numTipKod() { return 'TF' } static get almSat() { return 'T' }
}
class AlimFaturaFis extends FaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PALMFAT' } static get almSat() { return 'A' }
}
class SatisIadeFaturaFis extends AlimFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get almSat() { return 'T' }
	static get iade() { return 'I' }
}
class AlimIadeFaturaFis extends SatisFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get almSat() { return 'A' }
	static get iade() { return 'I' }
}
class SatisIhracKaydiylaFaturaFis extends SatisFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'IK' } static get ihracKaydiylami() { return true }
}
class AlimIhracKaydiylaFaturaFis extends AlimFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'IK' } static get ihracKaydiylami() { return true }
}
class SatisIhracatFaturaFis extends SatisFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'IH' } static get ihracatmi() { return true }
}
class AlimIthalatFaturaFis extends AlimFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'IH' } static get ihracatmi() { return true }
}
class SatisEmanetFaturaFis extends SatisFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'EM' }
}
class AlimEmanetFaturaFis extends AlimFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'EM' }
}
class SatisKonsinyeFaturaFis extends SatisFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'KN' }
}
class AlimKonsinyeFaturaFis extends AlimFaturaFis {	
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'KN' }
}
class SatisFasonFaturaFis extends SatisFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'FS' }
}
class AlimFasonFaturaFis extends AlimFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'FS' }
}
class SatisIhracKaydiylaIadeFaturaFis extends AlimIadeFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'IK' } static get ihracKaydiylami() { return true }
}
class AlimIhracKaydiylaIadeFaturaFis extends SatisIadeFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'IK' } static get ihracKaydiylami() { return true }
}
class SatisIhracatIadeFaturaFis extends AlimIadeFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'IH' }
}
class AlimIthalatIadeFaturaFis extends SatisIadeFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'IH' }
}
class SatisEmanetIadeFaturaFis extends AlimIadeFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'EM' }
}
class AlimEmanetIadeFaturaFis extends SatisIadeFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'EM' }
}
class SatisKonsinyeIadeFaturaFis extends AlimIadeFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'KN' }
}
class AlimKonsinyeIadeFaturaFis extends SatisIadeFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'KN' }
}
class SatisFasonIadeFaturaFis extends AlimIadeFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'FS' }
}
class AlimFasonIadeFaturaFis extends SatisIadeFaturaFis {
	static get ayrimTipi() { return 'FS' }
}

class IrsaliyeFis extends SevkiyatFis {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return `${super.sinifAdi}İrsaliye` }
	static get pifTipi() { return 'I' }
	static get irsaliyemi() { return true }
	static async raporKategorileriDuzenle_detaylar_miktarEk(e) {
		await super.raporKategorileriDuzenle_detaylar_miktarEk(e);
		let sections = ['FRFisTSDetay-IrsMiktar'];
		await e.kat.ekSahaYukle({ section: sections })
	}
}
class SatisIrsaliyeFis extends IrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PSATIRS' }
	static get almSat() { return 'T' }
}
class SatisIadeIrsaliyeFis extends SatisIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get iade() { return 'I' }
}
class AlimIrsaliyeFis extends IrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'PALMIRS' }
	static get almSat() { return 'A' }
}
class AlimIadeIrsaliyeFis extends AlimIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get iade() { return 'I' }
}
class SatisIhracKaydiylaIrsaliyeFis extends SatisIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'IK' } static get ihracKaydiylami() { return true }
}
class AlimIhracKaydiylaIrsaliyeFis extends AlimIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'IK' } static get ihracKaydiylami() { return true }
}
class SatisIhracatIrsaliyeFis extends SatisIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'IH' }
}
class AlimIthalatIrsaliyeFis extends AlimIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'IH' }
}
class SatisEmanetIrsaliyeFis extends SatisIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'EM' }
}
class AlimEmanetIrsaliyeFis extends AlimIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'EM' }
}
class SatisKonsinyeIrsaliyeFis extends SatisIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'KN' }
}
class AlimKonsinyeIrsaliyeFis extends AlimIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'KN' }
}
class SatisFasonIrsaliyeFis extends SatisIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'FS' }
}
class AlimFasonIrsaliyeFis extends AlimIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'FS' }
}
class SatisIhracKaydiylaIadeIrsaliyeFis extends AlimIadeIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'IK' } static get ihracKaydiylami() { return true }
}
class AlimIhracKaydiylaIadeIrsaliyeFis extends SatisIadeIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'IK' } static get ihracKaydiylami() { return true }
}
class SatisIhracatIadeIrsaliyeFis extends AlimIadeIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'IH' }
}
class AlimIthalatIadeIrsaliyeFis extends SatisIadeIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'IH' }
}
class SatisEmanetIadeIrsaliyeFis extends AlimIadeIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'EM' }
}
class AlimEmanetIadeIrsaliyeFis extends SatisIadeIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'EM' }
}
class SatisKonsinyeIadeIrsaliyeFis extends AlimIadeIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'KN' }
}
class AlimKonsinyeIadeIrsaliyeFis extends SatisIadeIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'KN' }
}
class SatisFasonIadeIrsaliyeFis extends AlimIadeIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'FS' }
}
class AlimFasonIadeIrsaliyeFis extends SatisIadeIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ayrimTipi() { return 'FS' }
}
