class StokHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get oncelik() { return 20 }
	static get kisaKod() { return 'S' } static get kod() { return `stok-${this.kodEk}` } static get aciklama() { return `Stok ${this.adiEk}` }
	static get kodEk() { return '' } static get adiEk() { return '' } static get sablonsalVarmi() { return this._sablonsalVarmi }
	static get uygunmu() { return true } static get maliTabloIcinUygunmu() { return true }
	static get araSeviyemi() { return this == StokHareketci } static get maliTabloIcinUygunmu() { return true }
	static get donemselIslemlerIcinUygunmu() { return false }
	static get eldekiVarliklarIcinUygunmu() { return this.gercekmi && app.params?.finans?.eldekiVarlikStokDegerlemesiYapilir }
	static get gercekmi() { return false } static get maliyetlimi() { return false }
	static get clausecu() {
		let {_clausecu: result} = this;
		if (result == null) {
			result = this._clausecu = {
				ticNetBedel: () =>
					`(har.bedel - har.dipiskonto + har.satirfisdagitim +` +
						` (case when fis.almsat = 'T' then 0 else har.dipnakliye + har.dipotvvegekap end))`,
				tumMaliyet: malClause =>
					app.params.maliyet.alimIadeHesap
				        ? `dbo.ticarimaliyetnum(fis.almsat, fis.iade, ${malClause}, ${this.clausecu.ticNetBedel()})`
				        : `dbo.almsatnum(fis.almsat, ${this.clausecu.ticNetBedel()}, ${malClause})`,
				irsDisiMaliyet: malClause =>
					`(case when fis.piftipi = 'I' then 0.0 else ${this.clausecu.tumMaliyet(malClause)} end)`,
				urunMiktarClause: () =>
					'coalesce(hbed.miktar, cast(har.urunsayisi as dec(17,5)))',
				tekstilSentBaslat: (sent, harTablo) => {
					let {where: wh} = sent;
					sent.fisHareket('kesimfis', harTablo)
						.leftJoin('fis', 'ufis uret', 'fis.kaysayac = uret.kesimfissayac');
					wh.fisSilindiEkle().add('uret.kesimfissayac IS NULL', 'fis.bdevirmi = 0');    /* uretim fisine donusmemis kesim */
				},
				tekstilUrunSentBaslat: (sent, harTablo) => {
					this.clausecu.tekstilSentBaslat(sent, 'kesimdetay'); let {where: wh} = sent;
					sent.leftJoin('har', 'kesimdetbeden hbed', 'har.kaysayac = hbed.harsayac')
						.fromIliski('maldepartman dep', 'fis.depkod = dep.kod');
					wh.add(`coalesce(hbed.miktar, har.urunsayisi) <> 0`)
				},
				tekstilDigerSentBaslat: (sent, harTablo) => {
					this.clausecu.tekstilSentBaslat(sent, 'kesimdetay'); let {where: wh} = sent;
					sent.fromIliski('stkmst urn', 'fis.urunkod = urn.kod');
				}
			}
		}
		return result
	}
	static get hvci() {
		let {_hvci: result} = this;
		if (result == null) {
			let {sqlZero} = Hareketci_UniBilgi.ortakArgs;
			result = this._hvci = {
				basitToplanamaz: hv => ({
					kayittipi: `'PIFST'`, maltip: 'fis.almsat', iadetip: 'fis.iade', oncelik: 'fis.oncelik',
					must: 'fis.must', sevktarihi: 'coalesce(fis.sevktarihi, fis.tarih)',
					malbrm: 'dbo.malbrmtext(stk.smalduzbirimtipi, stk.brm2, stk.brm)',
					fiyat: 'har.fiyat', dvkod: 'fis.dvkod', dvfiyat: 'har.dvfiyat',
					althesapkod: 'fis.irscariitn', ...this.getHV_hmr_normal({ hv }),
					opno: 'har.opno', iskorantext: 'har.iskorantext', belgefiyat: 'har.belgefiyat'
				}),
				basitToplanabilir: miktarClause => ({
					koli: 'har.koli', miktar: miktarClause, miktar2: 'har.miktar2', revizemiktar: 'har.revizemiktar',
					malmiktar: `dbo.malbrmnum(stk.smalduzbirimtipi, har.miktar2, ${miktarClause})`,
					dvbedel: 'har.dvbedel', belgebedel: 'har.belgebedel',
					belgedipisk: '(har.dipiskonto - har.satirfisdagitim)', belgedipnak: 'har.dipnakliye',
					belgedipotvvegekap: 'har.dipotvvegekap', bedel: 'har.bedel'
				}),
				basit: (hv, miktarClause) =>
					({ ...this.hvci.basitToplanamaz(hv), ...this.hvci.basitToplanabilir(miktarClause) }),
				tum: ({ hv, yerKodClause, miktarClause, maliyetsizmi }) => ({
					...this.hvci.basit(hv, miktarClause), unionayrim: `'IrsFat'`,
					dosyatipi: `(case when fis.iade = 'I' then (case when fis.almsat = 'T' then 'FatTI' else 'FatAI' end) else 'FatN' end)`,
					anaislemadi:
						`dbo.iadetext(fis.iade, (dbo.ticonek(fis.ayrimtipi, fis.almsat) + ` +
							` (case when fis.piftipi = 'I' then dbo.almmussattext(fis.almsat, 'Alım İrsaliye', 'Müstahsil Emanet Alım', 'Satış İrsaliye')` +
								`  else dbo.almmussattext(fis.almsat, 'Alım Fatura', 'Müstahsil Makbuzu', 'Satış Fatura') end)))`,
					yerkod: yerKodClause, gc: `dbo.almsattext(fis.almsat, 'G', 'C')`,
					islkod: `(case when fis.piftipi = 'I' then '' else fis.islkod end)`,
					islemadi: `(dbo.ticonek(fis.ayrimtipi,fis.almsat) +` +
								` (case when fis.piftipi = 'I' then dbo.iadetext(fis.iade,dbo.almmussattext(fis.almsat, 'Alım İrsaliye', 'Müstahsil Emanet Alım', 'Satış İrsaliye'))` +
									` else dbo.iadetext(fis.iade,isl.aciklama) end))`,
					must: 'fis.must', sevktarihi: 'coalesce(fis.sevktarihi, fis.tarih)',
					refkod: 'fis.must', refadi: 'car.birunvan', fisaciklama: 'fis.cariaciklama', detaciklama: `dbo.strconcat(coalesce(har.degiskenadi, ''), har.ekaciklama)`,
					takipno: 'har.dettakipno', miktar: miktarClause, miktar2: 'har.miktar2', revizemiktar: 'har.revizemiktar',
					malmiktar: `dbo.malbrmnum(stk.smalduzbirimtipi, har.miktar2, ${miktarClause})`, malbrm: 'dbo.malbrmtext(stk.smalduzbirimtipi,stk.brm2,stk.brm)',
					fiyat: 'har.fiyat', dvkod: 'fis.dvkod', dvfiyat: 'har.dvfiyat', dvbedel: 'har.dvbedel', althesapkod: 'fis.irscariitn',
					...this.getHV_hmr_normal({ hv }), opno: 'har.opno', iskorantext: 'har.iskorantext',
					belgefiyat: 'har.belgefiyat', belgebedel: 'har.belgebedel', belgedipisk: '(har.dipiskonto - har.satirfisdagitim)',
					belgedipnak: 'har.dipnakliye', belgedipotvvegekap: 'har.dipotvvegekap', bedel: 'har.bedel',
					maliyet: this.clausecu.irsDisiMaliyet(maliyetsizmi ? sqlZero : '(har.malhammadde + har.malmuh)'),
					fmaliyet: this.clausecu.irsDisiMaliyet(maliyetsizmi ? sqlZero : '(har.fmalhammadde + har.fmalmuh)')
				}),
				hmrKumas: hv =>
					({ renkkod: hv.renkkod || 'har.renkkod', desenkod: hv.desenkod || 'har.desenkod' }),
				hmrEkUrun: hv =>
					({ ...this.hvci.hmrKumas(hv), beden: hv.beden || 'har.beden' }),
				hmrAsilUrun: hv => ({
					renkkod: hv.renkkod || 'har.karmarenkkod', desenkod: hv.desenkod || 'har.desenkod',
					beden: hv.beden || `coalesce(hbed.asortiveyabeden, '')`
				}),
				tekstilDef: () => ({
					kayittipi: `'KESDET'`, dosyatipi: `'Kes'`, anaislemadi: `'Kesim İşlemi'`, yerkod: 'fis.yerkod',
					fisaciklama: 'fis.basaciklama' , maliyet: sqlZero
				}),
				tekstilUrunDef: () =>
					({ ...this.hvci.tekstilDef(), refkod: 'fis.depkod', refadi: 'dep.aciklama' }),
				tekstilDigerDef: () =>
					({ ...this.hvci.tekstilDef(), refkod: 'fis.urunkod', refadi: 'urn.aciklama' }),
			}
		}
		return result
	}
	static getAltTipAdiVeOncelikClause({ hv }) {
		return super.getAltTipAdiVeOncelikClause(...arguments)
		/*return {
			...super.getAltTipAdiVeOncelikClause(...arguments)
			yon: `'${this.maliyetlimi ? 'sag' : 'sol'}'`
		}*/
	}
	static mstYapiDuzenle({ result }) {
		super.mstYapiDuzenle(...arguments); let defHVAlias = 'stokkod'
		result.set(defHVAlias, ({ mstYapi, secimler: { stokTipi = {} } = {}, sent: { sahalar }, kodClause, mstAlias, mstAdiAlias }) => {
			let hvAlias, adiClause
			stokTipi = stokTipi?.tekSecim ?? stokTipi
			if (stokTipi.grupmu) { hvAlias = 'grupkod'; adiClause = 'grp.aciklama' }
			else if (stokTipi.anaGrupmu) { hvAlias = 'anagrupkod'; adiClause = 'agrp.aciklama' }
			else if (stokTipi.istGrupmu) { hvAlias = 'sistgrupkod'; adiClause = 'sigrp.aciklama' }
			else if (stokTipi.markami) { hvAlias = 'smarkakod'; adiClause = 'smar.aciklama' }
			else { hvAlias = defHVAlias; adiClause = 'stk.aciklama' }
			if (hvAlias)
				mstYapi.hvAlias = hvAlias
			sahalar.add(`${adiClause} ${mstAdiAlias}`)
		})
	}
    /* Hareket tiplerini (işlem türlerini) belirleyen seçim listesi */
    static hareketTipSecim_kaListeDuzenle({ kaListe }) {
        super.hareketTipSecim_kaListeDuzenle(arguments); let {gercekmi, maliyetlimi} = this;
		let {params} = app, {kullanim: ticari} = params.ticariGenel, {kullanim: satis} = params.satis, {kullanim: uretim} = params.uretim;
		kaListe.push(...[
			new CKodVeAdi(['stokGiris', 'Stok Hareket Giriş']), new CKodVeAdi(['stokCikis', 'Stok Hareket Çıkış']), new CKodVeAdi(['stokTransfer', 'Stok Transfer']),
			(gercekmi ? new CKodVeAdi(['irsaliye', 'İrsaliye']) : null), new CKodVeAdi(['fatura', 'Fatura']), new CKodVeAdi(['perakende', 'Perakende']),
			new CKodVeAdi(['fatura', 'Fatura']), (ticari.pratikSatis ? new CKodVeAdi(['pratikSatis', 'Pratik Satış']) : null),
			new CKodVeAdi(['magaza', 'Mağaza']), new CKodVeAdi(['uretim', 'Üretim']),
			(gercekmi && uretim.iskarta ? new CKodVeAdi(['iskarta', 'Üretim Iskarta']) : null), new CKodVeAdi(['genelDekont', 'Genel Dekont']),
			(satis.stokIadeGiderPusulasi ? new CKodVeAdi(['giderPusulasi', 'Gider Pusulası']) : null),
			(ticari.sutAlim ? new CKodVeAdi(['topluAlimMakbuz', 'Toplu Alım Makbuz']) : null),
			(gercekmi && uretim.tekstil ? new CKodVeAdi(['kesimIslemi', 'Kesim İşlemi']) : null)
		].filter(x => !!x))
    }
	static async ilkIslemler(e) {
		await super.ilkIslemler(e)
		if (this._sablonsalVarmi == null) { this._sablonsalVarmi = await app.sqlHasTable('ozellikbirlesim') }
	}
	uniDuzenleOncesi({ sender: { finansalAnalizmi } = {} }) {
		super.uniDuzenleOncesi(...arguments); let {attrSet} = this
		if (finansalAnalizmi && attrSet) {
			$.extend(attrSet, asSet(['miktar', 'miktar2']))
			for (let key of ['bedel', 'brutbedel', 'malmuh', 'malhammadde', 'fmalmuh', 'fmalhammadde'])
				delete attrSet[key]
		}
	}
	uniOrtakSonIslem({ sender: { finansalAnalizmi } = true, secimler: sec, hvDegeri, hv, sent, sent: { from, where: wh, sahalar }, attrSet }) {
		super.uniOrtakSonIslem(...arguments)
		let {sqlNull} = Hareketci_UniBilgi.ortakArgs, {sablonsalVarmi} = this.class
		let yerKodClause = hvDegeri('yerkod'), mustClause = hvDegeri('must')
		let kodClause = hvDegeri('stokkod'), fiilimi = (sec?.ISARET?.value || 'F') == 'F';
		if (!from.aliasIcinTable('stk')) { sent.fromIliski('stkmst stk', `${kodClause} = stk.kod`) }
		if (!from.aliasIcinTable('grp')) { sent.stok2GrupBagla() }
		if (!from.aliasIcinTable('agrp')) { sent.stokGrup2AnaGrupBagla() }
		if (!from.aliasIcinTable('sigrp')) { sent.stok2IstGrupBagla() }
		if (!from.aliasIcinTable('smar')) { sent.stok2MarkaBagla() }
		if (!from.aliasIcinTable('yer') && yerKodClause) { sent.x2YerBagla({ kodClause: yerKodClause }) }
		if (!from.aliasIcinTable('car') && mustClause) { sent.x2CariBagla({ kodClause: mustClause }) }
		{
			let obirguidClause = hvDegeri('hvDegeri')
			if (sablonsalVarmi && obirguidClause && obirguidClause != sqlNull && !from.aliasIcinTable('obir')) {
				sent.leftJoin('har', 'ozellikbirlesim obir', 'har.obirguid = obir.guid');
				hv.birozellikadi = 'obir.ozellikadi'
			}
		}
		/*let istenmeyenIsaret = fiilimi ? 'X' : '*';
		wh.notDegerAta(istenmeyenIsaret, hvDegeri('ozelisaret'))*/
		wh.add(`${kodClause} > ''`)
		if (finansalAnalizmi) {
			//let {}
			if (yerKodClause) {
				wh.notInDizi(['H', 'IS', 'EM'], 'yer.aum')
				wh.add(`yer.finanaliztipi = ''`)
			}
			let {eldekiVarlikStokDegerlemeTipi: degTipi = {}} = app?.params?.finans
			degTipi = degTipi?.char ?? ''
			let miktarClause = hvDegeri('miktar').sumOlmaksizin(), miktar2Clause = hvDegeri('miktar2').sumOlmaksizin()
			let xMiktarClause = `(case when stk.almfiyatmiktartipi = '2' then ${miktar2Clause} else ${miktarClause} end)`
			let fiyatClause = `(case '${degTipi}' when 'R' then stk.revizerayicalimfiyati when 'M' then stk.ortmalfiyat else stk.revizefiilialimfiyat end)`
			let bedelClause = `ROUND(${xMiktarClause} * ${fiyatClause}, 2)`
			sahalar.add(`${bedelClause} bedel`)
		}
	}
    /** Varsayılan değer atamaları (host vars) – temel sınıfa eklemeler.
		Hareketci.varsayilanHVDuzenle değerleri aynen alınır, sadece eksikler eklenir */
    static varsayilanHVDuzenle({ hv, sqlNull, sqlEmpty, sqlZero }) {
        super.varsayilanHVDuzenle(...arguments)
		for (let key of ['belgetarih', 'obirguid']) { hv[key] = sqlNull }
		for (let key of ['dosyatipi', 'iadetip', 'must', 'refyerkod', 'masrafkod', 'takipno', 'birozellikadi']) { hv[key] = sqlEmpty }
		for (let key of [
			'malfazmkt', 'firemiktar', 'hurdamiktar', 'dipiskonto', 'fiyat', 'dvfiyat',
			'belgebedel', 'belgedipisk', 'belgedipnak', 'belgedipotvvegekap', 'belgeiskkamtop'
		]) { hv[key] = sqlZero }
		for (let key of ['mustkod', 'ticmust', 'fisaciklama', 'detaciklama']) { delete hv[key] }
		$.extend(hv, {
			seq: 'har.seq', stokkod: 'har.stokkod', koli: 'har.koli', miktar: 'har.miktar', miktar2: 'har.miktar2',
			brm: 'stk.brm', malbrm: 'stk.brm', ba: sqlEmpty,
			grupkod: 'stk.grupkod', anagrupkod: 'grp.anagrupkod',
			sistgrupkod: 'stk.sistgrupkod', smarkakod: 'stk.smarkakod',
			...this.getHV_hmr_bos({ hv })
		});
		let altDonusum = {
			unionayrim: 'kayittipi', brutbedel: 'bedel', sevktarihi: 'tarih', asilmiktar: 'miktar', revizemiktar: 'miktar', malmiktar: 'miktar',
			belgefiyat: 'fiyat', belgebedel: 'bedel', fbedel: 'bedel', maliyet: 'bedel', fmaliyet: 'maliyet'
		}
		for (let [dest, src] of Object.entries(altDonusum))
			hv[dest] = hv => hv[src]
    }
    /** UNION sorgusu hazırlama – hareket tipleri için */
    uygunluk2UnionBilgiListeDuzenleDevam(e) {
        super.uygunluk2UnionBilgiListeDuzenleDevam(e)
        this.uniDuzenle_stokGirisCikisTransfer(e).uniDuzenle_ticari(e)
		this.uniDuzenle_perakendeVeGiderPusulasi(e).uniDuzenle_magaza(e)
		this.uniDuzenle_fason(e).uniDuzenle_uretim(e).uniDuzenle_genelDekont(e)
		this.uniDuzenle_topluAlimMakbuz(e).uniDuzenle_kesimIslemi(e)
    }
	static getHV_hmr_normal(e) { return this.getHV_hmr({ ...e, empty: false }) }
	static getHV_hmr_bos(e) { return this.getHV_hmr({ ...e, empty: true }) }
	static getHV_hmr({ hv, empty }) {
		let {sqlNull} = Hareketci_UniBilgi.ortakArgs;
		for (let {rowAttr} of HMRBilgi) { hv[rowAttr] = `har.${rowAttr}` }
	}
    /** (Stok GC/Transfer) için UNION */
    uniDuzenle_stokGirisCikisTransfer({ uygunluk, liste }) {
		let {gercekmi, maliyetlimi} = this.class, {params} = app;
		let {yerMaliyetSekli} = params.maliyet, yerBazindaMaliyetmi = yerMaliyetSekli?.yerBazindami;
		let uniBilgici = {
			stokGC: () => {
				return new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent, tipListe = [
						(uygunluk.stokGiris ? 'G' : null),
						(uygunluk.stokCikis ? 'C' : null)
					].filter(x => !!x);
					let gerMalTipi = gercekmi ? 'G': maliyetlimi ? 'M': null;
					sent.fisHareket('stfis', 'ststok')
						.fis2StokIslemBagla().x2CariBagla({ kodClause: 'fis.irsmust' });
					wh.fisSilindiEkle().inDizi(tipListe, 'fis.gctipi');
					if (gerMalTipi != null) { wh.inDizi(['', gerMalTipi], 'fis.germaltipi') }
				}).hvDuzenleIslemi(({ hv }) => {
					let gcAnaIslemAdi =
						`(case when fis.gctipi = 'G' then (case fis.ozeltip when 'DV' then 'Stok Devir' else 'Stok Giriş' end) else` +
							` (case fis.ozeltip when 'SY' then 'Sayım Fişi' else 'Stok Çıkış' end)` + 
						` end)`;
					$.extend(hv, {
						kayittipi: `'STST'`, dosyatipi: `'Stk'`, unionayrim: `'Stk'`,
						maltip: 'fis.gctipi', iadetip: 'fis.iade', anaislemadi: gcAnaIslemAdi,
						islemadi: 'isl.aciklama', yerkod: 'har.detyerkod', gc: 'fis.gctipi', oncelik: 'fis.oncelik',
						islkod: 'fis.islkod', must: 'fis.irsmust',
						refkod: `(case when fis.gctipi = 'C' then (case when fis.masrafortakdir = '' then har.detmasrafkod else fis.masrafkod end) else fis.irsmust end)`,
						refadi: `(case when fis.gctipi = 'C' then mas.aciklama else car.birunvan end)`,
						fisaciklama: 'fis.cariaciklama', detaciklama: `dbo.strconcat(coalesce(har.degiskenadi, ''), har.ekaciklama)`,
						masrafkod: `(case when fis.masrafortakdir = '' then har.detmasrafkod else fis.masrafkod end)`,
						takipno: 'har.dettakipno', koli: 'har.koli', miktar2: 'har.miktar2',
						revizemiktar: 'har.revizemiktar', malmiktar: 'dbo.malbrmnum(stk.smalduzbirimtipi, har.miktar2, har.miktar)',
						malbrm: 'dbo.malbrmtext(stk.smalduzbirimtipi, stk.brm2, stk.brm)',
						fiyat: 'har.fiyat', dvkod: 'fis.dvkod', dvfiyat: 'har.dvfiyat', dvbedel: 'har.dvbedel',
						althesapkod: 'fis.irscariitn', ...this.class.getHV_hmr_normal({ hv }), opno: 'har.opno',
						iskorantext: 'har.iskorantext', belgefiyat: 'har.belgefiyat', belgebedel: 'har.belgebedel', bedel: '(har.bedel + har.maldevmuh)',
						maliyet: 'dbo.gcnum(fis.gctipi, (har.bedel + har.maldevmuh), (har.malhammadde + har.malmuh))',
						fmaliyet: 'dbo.gcnum(fis.gctipi, (har.bedel + har.maldevmuh), (har.fmalhammadde + har.fmalmuh))'
					})
				})
			},
			transfer: ({ yerKodClause, refYerKodClause, gcKod, unionAyrim }) => {
				return new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent, tipListe = [
						(uygunluk.stokGiris ? 'G' : null),
						(uygunluk.stokCikis ? 'C' : null)
					].filter(x => !!x);
					sent.fisHareket('stfis', 'ststok').fis2StokIslemBagla()
						.fromIliski('stkyer refyer', `${refYerKodClause} = refyer.kod`)
						.x2CariBagla({ kodClause: 'fis.irsmust' });
					wh.fisSilindiEkle().degerAta('T', 'fis.gctipi');
					if (maliyetlimi) { wh.add('fis.bizsubekod <> fis.refsubekod') }
				}).hvDuzenleIslemi(({ hv }) => {
					let transferAnaIslemAdi = 
						`(case fis.ozeltip` +
							` when 'HR' then 'Hurdaya Ayırma' when 'IR' then 'İrsaliyeli Transfer'` +
							` when 'FS' then 'Fasona Gönderilen' when 'SB' then 'Şubeler Arası Trf'` +
							` when 'UC' then 'Üretime Çıkış' else 'Transfer'` +
						` end)`
					$.extend(hv, {
						kayittipi: `'STST'`, dosyatipi: `'Trf'`, unionayrim: unionAyrim.sqlServerDegeri(),
						maltip: 'fis.gctipi', anaislemadi: transferAnaIslemAdi, islemadi: 'isl.aciklama',
						yerkod: yerKodClause, refyerkod: refYerKodClause, gc: gcKod.sqlServerDegeri(), oncelik: 'fis.oncelik',
						islkod: 'fis.islkod', must: 'fis.irsmust', refkod: refYerKodClause, refadi: `refyer.aciklama`,
						fisaciklama: 'fis.cariaciklama', detaciklama: `dbo.strconcat(coalesce(har.degiskenadi, ''), har.ekaciklama)`,
						takipno: 'har.dettakipno', miktar2: 'har.miktar2', revizemiktar: 'har.revizemiktar',
						malmiktar: 'dbo.malbrmnum(stk.smalduzbirimtipi, har.miktar2, har.miktar)',
						malbrm: 'dbo.malbrmtext(stk.smalduzbirimtipi, stk.brm2, stk.brm)', fiyat: 'har.fiyat', althesapkod: 'fis.irscariitn',
						...this.class.getHV_hmr_normal({ hv }), opno: 'har.opno', iskorantext: 'har.iskorantext',
						belgefiyat: 'har.belgefiyat', belgebedel: 'har.belgebedel', bedel: '(har.bedel + har.maldevmuh)',
						maliyet: 'dbo.gcnum(fis.gctipi, (har.bedel + har.maldevmuh), (har.malhammadde + har.malmuh))',
						fmaliyet: 'dbo.gcnum(fis.gctipi, (har.bedel + har.maldevmuh), (har.fmalhammadde + har.fmalmuh))'
					})
				})
			}
		};
		$.extend(liste, { stokGiris$stokCikis: [uniBilgici.stokGC()] })
		if (uygunluk.stokTransfer && (gercekmi || yerBazindaMaliyetmi)) {
			liste.stokTransfer = [
				uniBilgici.transfer({ yerKodClause: 'har.detyerkod', refYerKodClause: 'har.detyerkod', gcKod: 'C', unionAyrim: 'TCik' }),
				uniBilgici.transfer({
					yerKodClause: `(case when fis.girisonaysiz = '' then har.detrefyerkod else '' end)`,
					refYerKodClause: 'har.yerkod', gcKod: 'G', unionAyrim: 'TGir'
				})
			]
        }
        return this
    }
	/** (Ticari İşlemler) için UNION */
    uniDuzenle_ticari({ uygunluk, liste }) {
		let {params} = app, {kullanim: alim} = params.alim, {kullanim: satis} = params.satis, {maliyet} = params;
		let yeniEmanet = alim.yeniEmanet || satis.yeniEmanet, {alimIadeHesap: alimIadeleriHesaplanirmi} = maliyet;
		let {gercekmi, maliyetlimi, clausecu, hvci} = this.class;
		$.extend(liste, {
			fatura$irsaliye: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;
					sent.fisHareket('piffis', 'pifstok').fis2StokIslemBagla().fis2CariBagla();
					wh.fisSilindiEkle().notDegerAta('PR', 'fis.ayrimtipi');                         /* magaza fisleri buraya gelmez ('FS' icin pifstok kaydi olmaz) */
					if (uygunluk.fatura && maliyetlimi) {
						sent.leftJoin('fis', 'ihrfat2intac ihrdon', ['fis.kaysayac = ihrdon.ihrfatsayac', `fis.ayrimtipi = 'IH'`])
						wh.degerAta('F', 'fis.piftipi');
						wh.add(new MQOrClause([                                                     /* ihr fat intaca donusmus ise alinmaz (ayrimtipi = 'IN' olanlar alinir) */
							{ notDegerAta: 'IH', saha: 'fis.ayrimtipi'},
							`ihrdon.intacfissayac IS NULL`
						]))
					}
					if (gercekmi) {
						let or = new MQOrClause();
						if (uygunluk.fatura) {
							or.add(
								new MQAndClause([{ degerAta: 'F', saha: 'fis.piftipi' }, { inDizi: ['', 'S'], saha: 'fis.onctip' }]),
								new MQAndClause([{ degerAta: 'I', saha: 'fis.piftipi' }])
							)
						}
						wh.notDegerAta('IN', 'fis.ayrimtipi');                                      /* gercek harekette 'IN' (intaç) alinmaz */
						if (or.liste.length) { wh.add(or) }
						wh.add(
							`fis.stokkontrolagirmez = ''`,
							new MQOrClause([
								{ degerAta: 'I', saha: 'fis.piftipi'},
								new MQAndClause([{ degerAta: 'F', saha: 'fis.piftipi'}, { notDegerAta: 'I', saha: 'fis.onctip' }])
							])
						)
					}
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						...hvci.tum({ hv, yerKodClause: 'har.detyerkod', miktarClause: '(har.miktar + har.malfazmkt)', maliyetsizmi: false }),
						refyerkod: 'fis.detrefyerkod'
					})
				}),
				(yeniEmanet && gercekmi ? new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;
					sent.fisHareket('piffis', 'pifstok').fis2StokIslemBagla().fis2CariBagla();
					wh.fisSilindiEkle().degerAta('EX', 'fis.ayrimtipi');                                                                                     /* sadece 'Yeni Emanet' */
					wh.add(`fis.fisekayrim = ''`, `fis.stokkontrolagirmez = ''`);
					wh.add(new MQOrClause([
						{ degerAta: 'I', saha: 'fis.piftipi' },
						(uygunluk.fatura ? new MQAndClause([{ degerAta: 'F', saha: 'fis.piftipi' }, { degerAta: 'T', saha: 'fis.almsat' } ]) : null),        /* Satış Fatura */
						(uygunluk.irsaliye ? new MQAndClause([{ degerAta: 'I', saha: 'fis.piftipi' }, { degerAta: 'A', saha: 'fis.almsat' } ]) : null),      /* Alım İrsaliye */
						new MQAndClause([{ degerAta: 'F', saha: 'fis.piftipi' }, { notDegerAta: 'I', saha: 'fis.onctip' }])
					].filter(x => !!x)));
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						...hvci.tum({ hv, yerKodClause: 'fis.refyerkod', miktarClause: '(har.miktar + har.malfazmkt)', maliyetsizmi: false }),
						refyerkod: 'fis.yerkod'
					})
				}) : null)
			].filter(x => !!x)
		});
        return this
    }
	/** (Perakende ve Gider Pusulası) için UNION */
    uniDuzenle_perakendeVeGiderPusulasi({ uygunluk, liste }) {
		let {clausecu, hvci} = this.class;
		$.extend(liste, {
			perakende$giderPusulasi: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let tipListe = [
						(uygunluk.perakende ? '' : null),
						(uygunluk.giderPusulasi ? ['GP', 'GS'] : null),
					].filter(x => x != null).flat();
					let {where: wh} = sent;
					sent.fisHareket('piffis', 'pifstok').fis2CariBagla()
						.fromIliski('degiskenadres dadr', 'fis.degiskenvknox = dadr.vknox');
					wh.fisSilindiEkle().degerAta('P', 'fis.piftipi').inDizi(tipListe, 'fis.ayrimtipi')
				}).hvDuzenleIslemi(({ hv }) => {
					let islemAdiClause =
						`(case when fis.ayrimtipi in ('GP', 'GS') then 'Gider Pusulası' else` +
							` dbo.iadetext(fis.iade, dbo.almsattext(fis.almsat, 'Perakende Alım', 'Perakende Satış'))` +
						` end)`;
					$.extend(hv, {
						...hvci.basit(hv, 'har.miktar'), unionayrim: `'Per'`, anaislemadi: islemAdiClause,
						yerkod: 'fis.yerkod', gc: `dbo.almsattext(fis.almsat, 'G', 'C')`,
						dosyatipi: `(case when fis.ayrimtipi in ('GP', 'GS') then 'GPus' when fis.iade = 'I' then 'PerI' else 'PerN' end)`,
						refkod: `(case when fis.ayrimtipi in ('GP', 'GS') then fis.degiskenvknox else fis.must end)`,
						refadi: `(case when fis.ayrimtipi in ('GP', 'GS') then dadr.birunvan else car.birunvan end)`,
					/* perakende ve gider pusulasinda  -  vio'da miktar/bedel sum() verilirken burada sum() olmadan verildi */
						maliyet: clausecu.tumMaliyet('(har.malhammadde + har.malmuh)'),
						fmaliyet: clausecu.tumMaliyet('(har.fmalhammadde + har.fmalmuh)')
					})
				})
			]
		});
        return this
    }
	/** (Mağaza Satışı) için UNION - miktar/bedel sum() yapilir */
    uniDuzenle_magaza({ uygunluk, liste }) {
		let {hvci, clausecu} = this.class;
		$.extend(liste, {
			magaza: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;
					sent.fisHareket('piffis', 'pifstok').fis2CariBagla();
					wh.fisSilindiEkle().degerAta('F', 'fis.piftipi').degerAta('PR', 'fis.ayrimtipi')
				}).hvDuzenleIslemi(({ hv }) => {
					let islemAdiClause =
						`(case when fis.ayrimtipi in ('GP', 'GS') then 'Gider Pusulası' else` +
							` dbo.iadetext(fis.iade, dbo.almsattext(fis.almsat, 'Perakende Alım', 'Perakende Satış'))` +
						` end)`;
					$.extend(hv, {
						...hvci.basitToplanamaz(hv), unionayrim: `'Per'`, oncelik: '160', anaislemadi: islemAdiClause,
						islemadi: `dbo.iadetext(fis.iade, 'Mağaza Satış')`, sevktarihi: 'fis.tarih',
						dosyatipi: `(case when fis.iade = 'I' then 'MagI' else 'MagN' end)`,
						yerkod: 'fis.yerkod', gc: `dbo.almsattext(fis.almsat, 'G', 'C')`,
						refkod: `(case when fis.must <> '' then fis.must else '' end)`,
						refadi: `(case when fis.must <> '' then car.birunvan else '' end)`,
					/* miktar/bedel sahalari sum() hale gelir */
						maliyet: clausecu.tumMaliyet('(har.malhammadde + har.malmuh)'),
						fmaliyet: clausecu.tumMaliyet('(har.fmalhammadde + har.fmalmuh)')
					});
					let _hv = hvci.basitToplanabilir('har.miktar');
					for (let [key, value] of Object.entries(_hv)) { hv[key] = value.asSumDeger() }
				})
			]
		});
        return this
    }
	/** (Fason) için UNION */
    uniDuzenle_fason({ uygunluk, liste }) {
		if (!(uygunluk.irsaliye || uygunluk.fatura)) { return this }
		let {gercekmi, maliyetlimi, hvci, clausecu} = this.class;
		$.extend(liste, {
			fason: [
				/* Giriş Hareketi */
				(gercekmi ? new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;
					sent.fisHareket('piffis', 'piffsstok').fis2StokIslemBagla().fis2CariBagla();
					let irsFatTipOr = new MQOrClause();
					if (uygunluk.fatura) { irsFatTipOr.add(new MQAndClause([`(fis.piftipi = 'F'`, `fis.onctip in ('', 'S'))`])) }
					if (uygunluk.irsaliye) { irsFatTipOr.add(`fis.piftipi = 'I'`) }
					wh.fisSilindiEkle().add(
						`fis.almsat = 'A'`, `fis.ayrimtipi = 'FS'`, `fis.refyerkod > ''`,
						'fis.bdevirdir = 0', `fis.stokkontrolagirmez = ''`,
						new MQOrClause([`fis.piftipi = 'I'`, new MQAndClause([`fis.piftipi = 'F'`, `fis.onctip <> 'I'` ])]),
						irsFatTipOr
					)
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						...hvci.tum({ hv, yerKodClause: 'fis.refyerkod', miktarClause: '(har.miktar + har.malfazmkt)', maliyetsizmi: true }),    /* cikis maliyetsiz */
						refyerkod: 'har.detyerkod'
					});
					let _hv = hvci.basitToplanabilir('har.miktar');
					for (let [key, value] of Object.entries(_hv)) { hv[key] = value.asSumDeger() }
				}) : null),
				/* Çıkış Hareketi */
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;
					sent.fisHareket('piffis', 'piffsstok').fis2StokIslemBagla().fis2CariBagla();
					wh.fisSilindiEkle().add(`fis.ayrimtipi = 'FS'`, 'fis.bdevirdir = 0', `fis.stokkontrolagirmez = ''`);                          /* sadece fasonlar */
					let irsFatTipOr = new MQOrClause();
					if (uygunluk.fatura && maliyetlimi) {                                                                                         /* maliyetlide cikis alinmaz */
						irsFatTipOr.add(new MQAndClause([`(fis.piftipi = 'F'`, `dbo.almsattext(fis.almsat, 'G', 'C') = 'G'`]))
					}
					if (gercekmi) {                                                                                                               /* sadece gercek hareket - irsaliye veya fatura */
						if (uygunluk.fatura) { irsFatTipOr.add(new MQAndClause([`(fis.piftipi = 'F'`, `fis.onctip in ('', 'S')`])) }
						if (uygunluk.irsaliye) { irsFatTipOr.add(`fis.piftipi = 'I'`) };
						wh.add(new MQOrClause([`fis.piftipi = 'I'`, new MQAndClause([`fis.piftipi = 'F'`, `fis.onctip <> 'I'` ])]))
					}
					if (irsFatTipOr?.liste?.length) wh.add(irsFatTipOr)
				}).hvDuzenleIslemi(({ hv }) => {
					let islemAdiClause =
						`('Fason - ' + (case when fis.piftipi = 'I'` +
							` then dbo.iadetext(fis.iade,dbo.almmussattext(fis.almsat, 'Alım İrsaliye', 'Müstahsil İrsaliye', 'Satış İrsaliye'))` +
							` else dbo.iadetext(fis.iade, isl.aciklama)` +
						` end))`;
					$.extend(hv, {
						...hvci.tum({ hv, yerKodClause: 'har.detyerkod', miktarClause: '(har.miktar + har.malfazmkt)', maliyetsizmi: true }),     /* cikis maliyetsiz */
						islemadi: islemAdiClause, dosyatipi: `'FatFS'`, refyerkod: 'fis.refyerkod'
					});
					let _hv = hvci.basitToplanabilir('har.miktar');
					for (let [key, value] of Object.entries(_hv)) { hv[key] = value.asSumDeger() }
				})
			]
		});
        return this
    }
	/** (Üretim) için UNION */
    uniDuzenle_uretim({ uygunluk, liste }) {
		let {gercekmi, maliyetlimi, hvci, clausecu} = this.class;
		let miktarClause = 'dbo.uhnum(har.udurum, har.miktar - har.firemiktar - har.hurdamiktar, har.miktar)';
		let nMaliyetClause = '(har.malhammadde + har.malmuh + har.malaktmuh)';
		$.extend(liste, {
			uretim: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;
					sent.fisHareket('ufis', 'ustok').fis2UretimIslemBagla()
						.leftJoin('har', 'ustok refhar', ['har.fissayac = refhar.fissayac', `har.udurum <> 'U'`, `refhar.udurum = 'U'`, 'refhar.seq = 1'])
						.leftJoin('refhar', 'stkmst refstk', 'refhar.stokkod = refstk.kod');
					wh.fisSilindiEkle().add(`har.udurum <> 'A'`)    /* ara urun alinmaz */
					if (maliyetlimi) { wh.notInDizi(['EV', 'EL'], 'fis.utip') }
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kayittipi: `'URTST'`, unionayrim: `'Urt'`,
						dosyatipi: `(case fis.utip when 'VR' then 'Vir' when 'EV' then 'EkOz' when 'EL' then 'ElGeç' else 'Urt' end)`,
						maltip: 'fis.udurum', iadetip: 'fis.iade',
						anaislemadi: `(case fis.utip when 'VR' then 'Stok Virmanı' when 'EV' then 'Ek Özellik Virmanı' when 'EL' then 'Elden Geçirme' else 'Üretim' end)`,
						yerkod: 'har.yerkod', gc: `dbo.uhtext(har.udurum, 'G', 'C')`, oncelik: 'fis.oncelik',
						islkod: 'fis.islkod', islemadi: 'isl.aciklama',
						refkod: `(case when fis.utip in ('', 'AY') then refhar.stokkod else '' end)`,
						refadi: `(case when fis.utip in ('', 'AY') then refstk.aciklama else '' end)`,
						fisaciklama: 'fis.aciklama', takipno: 'har.takipno',
						koli: 'har.koli', miktar: miktarClause, miktar2: 'har.miktar2',
						firemiktar: 'har.firemiktar', hurdamiktar: 'har.hurdamiktar',
						malmiktar: `dbo.malbrmnum(stk.smalduzbirimtipi, har.miktar2, ${miktarClause})`,
						malbrm: 'dbo.malbrmtext(stk.smalduzbirimtipi, stk.brm2, stk.brm)',
						...this.class.getHV_hmr_normal({ hv }), opno: 'har.opno',
						bedel: nMaliyetClause, maliyet: nMaliyetClause,
						fmaliyet: '(har.fmalhammadde + har.fmalmuh + har.fmalaktmuh)'
					})
				})
			]
		});
        return this
    }
	/* (Genel Dekont) için UNOON */
	uniDuzenle_genelDekont({ uygunluk, liste }) {
	    $.extend(liste, {
	        genelDekont: [
	            new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;
	                sent.fisHareket('geneldekontfis', 'geneldekonthar').fis2MuhIslBagla();  /*.leftJoin('fis', 'muhisl isl', 'fis.islkod = isl.kod');*/
	                wh.fisSilindiEkle().inDizi(['ST', 'GL', 'SH'], 'har.kayittipi')
						.add('har.stokkod IS NOT NULL');
	            }).hvDuzenleIslemi(({ hv }) => {
	                $.extend(hv, {
	                    kayittipi: `'GENDK'`, dosyatipi: `'GDek'`, maltip: 'har.kayittipi', anaislemadi: `'Genel Dekont'`,
						yerkod: 'har.yerkod', gc: `dbo.batext(har.ba, 'G', 'C')`, oncelik: '220', islkod: 'fis.islkod', islemadi: 'isl.aciklama',
						fisaciklama: 'fis.aciklama', detaciklama: 'har.aciklama', takipno: 'har.takipno',
						malmiktar: 'dbo.malbrmnum(stk.smalduzbirimtipi, har.miktar2,har.miktar)',
						malbrm: 'dbo.malbrmtext(stk.smalduzbirimtipi, stk.brm2, stk.brm)',
						...this.class.getHV_hmr_normal({ hv }), opno: 'har.opno', bedel: 'har.bedel',
						maliyet: `dbo.banum(har.ba, (case when har.kayittipi in ('ST', 'SH') then har.bedel else 0 end), (har.malhammadde + har.malmuh))`,
						fmaliyet: `dbo.banum(har.ba, (case when har.kayittipi in ('ST', 'SH') then har.bedel else 0 end), (har.fmalhammadde + har.fmalmuh))`
	                })
	            })
	        ]
	    });
	    return this
	}
	/* (Rotalı Alım) için UNOON */
	uniDuzenle_topluAlimMakbuz({ uygunluk, liste, sqlZero }) {
		let {gercekmi, maliyetlimi} = this.class;
	    $.extend(liste, {
	        topluAlimMakbuz: [
				/* rotali alim - gercek giris */
	            (gercekmi ? new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;
	                sent.fisHareket('musrotafis', 'musrotastok')
						.fromIliski('rota rot', 'fis.rotasayac = rot.kaysayac');
							/* dogrudan Mustahsil, Toplayıcı, Tanker(Mustahsil detay icin) -- toplu satis=T alinmadi */
	                wh.fisSilindiEkle().inDizi(['M', 'P', 'K'], 'fis.tipkod')
	            }).hvDuzenleIslemi(({ hv }) => {
	                $.extend(hv, {
						kayittipi: `'HIZAS'`, dosyatipi: `'Rot'`,
						maltip: 'fis.tipkod', anaislemadi: `'Toplu Alım'`,
						yerkod: '(case when fis.bozeldepo = 1 then coalesce(odep.yerkod,fis.yerkod) else fis.yerkod end)',
						gc: `'G'`, oncelik: '220', refkod: 'rot.kod', refadi: 'rot.aciklama',
						islemadi: `(case fis.tipkod when 'M' then 'Müstahsilden Alım' when 'P' then 'Toplayıcıdan Alım' when 'K' then 'Tanker ile Alım' else '' end)`,
							/* miktarlar sum() olarak verilir */
						miktar: 'SUM(har.miktar)', maliyet: sqlZero
	                })
	            }) : null),
				/* rotalı alım tanker detayında toplayıcı hareketi */
	            (gercekmi ? new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;
	                sent.fisHareket('musrotafis', 'rfisrotadetay')
						.fromIliski('rota rot', 'fis.toprotasayac = rot.kaysayac');
	                wh.fisSilindiEkle().degerAta('K', 'fis.tipkod').add('har.miktar <> 0')
	            }).hvDuzenleIslemi(({ hv }) => {
	                $.extend(hv, {
						kayittipi: `'TPALM'`, dosyatipi: `'TPAlm'`,
						maltip: 'fis.tipkod', anaislemadi: `'Toplu Alım'`,
						yerkod: 'fis.yerkod', gc: `'G'`,
						oncelik: '15', refkod: 'rot.kod', refadi: 'rot.aciklama',
						islemadi: `'Toplayıcıdan Alım'`, must: 'rot.toplayicikod',
							/* miktarlar sum() olarak verilir */
						miktar: 'SUM(har.miktar)', maliyet: sqlZero
	                })
	            }) : null),
				/* rotali alim - makbuz */
	            new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;
	                sent.fromAdd('topmakbuzfis fis')
						.fromIliski('topmakbuzara ara', 'fis.kaysayac = ara.fissayac')
						.fromIliski('topmakbuzstok har', 'ara.kaysayac = har.arasayac');
	                wh.fisSilindiEkle().degerAta('M', 'fis.fistipi')
						.add('ara.biptalmi = 0', 'har.miktar <> 0');
					if (gercekmi) { wh.add(`fis.donusmus = ''`) }
	            }).hvDuzenleIslemi(({ hv }) => {
	                $.extend(hv, {
						kayittipi: `'TPALM'`, dosyatipi: `'TMak'`,
						maltip: 'fis.fistipi', anaislemadi: `'Toplu Alım Makbuzu'`,
						yerkod: 'fis.yerkod', gc: `'G'`, oncelik: '20',
						must: 'ara.mustahsilkod', bedel: 'har.matrah'    /* maliyet ve fmaliyet verilmedigi icin bedel bilgisi alinir */
	                })
	            })
	        ].filter(x => !!x)
	    });
	    return this
	}
	/** (Tekstil: Kesim) için UNION */
    uniDuzenle_kesimIslemi({ uygunluk, liste }) {
		let {gercekmi} = this.class; if (!gercekmi) { return this }
		let {hvci, clausecu} = this.class;
		$.extend(liste, {
			kesimIslemi: [
				/* Tekstil Kesim Kumas */
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					clausecu.tekstilDigerSentBaslat(sent, 'kesimdetay'); let {where: wh} = sent;
					wh.add('har.kumasmiktar <> 0')
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, { ...hvci.tekstilDigerDef() });
					$.extend(hv, { ...hvci.hmrKumas(hv) })
				}),
				/* fire kumastan ek urun */
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					clausecu.tekstilDigerSentBaslat(sent, 'kesimdetay'); let {where: wh} = sent;
					wh.add('har.firedenuretmiktar <> 0', `har.firedenstokkod > ''`)
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						...hvci.tekstilDigerDef(), oncelik: '35', gc: `'G'`,
						stokkod: 'fis.firedenstokkod', miktar: 'har.firedenuretmiktar'
					});
					$.extend(hv, { ...hvci.hmrEkUrun(hv) })
				}),
				/* tekstil ek malzeme cikisi ve yari mamul girisi */
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					clausecu.tekstilDigerSentBaslat(sent, 'kesimek'); let {where: wh} = sent;
					wh.add('har.firedenuretmiktar <> 0', `har.firedenstokkod > ''`)
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						...hvci.tekstilDigerDef(), oncelik: '38',
						gc: `(case when har.kayittipi = 'E' then 'G' else 'C' end)`,
						stokkod: 'har.firedenstokkod', miktar: 'har.miktar'
					});
					$.extend(hv, { ...hvci.hmrEkUrun(hv) })
				}),
				/* tekstil urun girisi */
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					clausecu.tekstilUrunSentBaslat(sent, 'kesimdetay'); let {where: wh} = sent;
					wh.add('har.firedenuretmiktar <> 0', `har.firedenstokkod > ''`)
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						...hvci.tekstilUrunDef(), oncelik: '40', gc: `'G'`,
						stokkod: 'fis.urunkod', miktar: clausecu.urunMiktarClause()
					});
					$.extend(hv, { ...hvci.hmrAsilUrun(hv) })
				}),
				/* tekstil urun-2 girisi */
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					clausecu.tekstilUrunSentBaslat(sent, 'kesimdetay'); let {where: wh} = sent;
					wh.add(`har.urunkod2 > ''`)
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						...hvci.tekstilUrunDef(), oncelik: '40', gc: `'G'`,
						stokkod: 'fis.urunkod2', miktar: clausecu.urunMiktarClause()
					});
					$.extend(hv, { ...hvci.hmrAsilUrun(hv) })
				}),
				/* tekstil urun-3 girisi */
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					clausecu.tekstilUrunSentBaslat(sent, 'kesimdetay'); let {where: wh} = sent;
					wh.add(`har.urunkod3 > ''`)
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						...hvci.tekstilUrunDef(), oncelik: '40', gc: `'G'`,
						stokkod: 'fis.urunkod3', miktar: clausecu.urunMiktarClause()
					});
					$.extend(hv, { ...hvci.hmrAsilUrun(hv) })
				})
			]
		});
        return this
    }

	static maliTablo_secimlerYapiDuzenle({ result }) {
		super.maliTablo_secimlerYapiDuzenle(...arguments)
		$.extend(result, {
			sube: DMQSube, subeGrup: DMQSubeGrup, mst: DMQStok, grup: DMQStokGrup,
			anaGrup: DMQStokAnaGrup, istGrup: DMQStokIstGrup, tip: DMQStokTip, isl: DMQStokIslem
		})
	}
	static maliTablo_secimlerSentDuzenle({ detSecimler: sec, sent, sent: { from, where: wh }, hv, mstClause }) {
		super.maliTablo_secimlerSentDuzenle(...arguments)
		sent.stok2GrupBagla().hizmetGrup2AnaGrupBagla().stok2IstGrupBagla()
		if (mstClause) {
			wh.basiSonu(sec.mstKod, mstClause).ozellik(sec.mstAdi, 'stk.aciklama')
			wh.basiSonu(sec.grupKod, 'stk.grupkod').ozellik(sec.grupAdi, 'grp.aciklama')
			wh.basiSonu(sec.anaGrupKod, 'grp.anagrupkod').ozellik(sec.anaGrupAdi, 'agrp.aciklama')
			wh.basiSonu(sec.istGrupKod, 'stk.histgrupkod').ozellik(sec.istGrupAdi, 'higrp.aciklama')
			wh.basiSonu(sec.tipKod, tipClause).ozellik(sec.tipAdi, 'tip.aciklama')
		}
	}
}
class StokHareketci_Gercek extends StokHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get gercekmi() { return true }
	static get kodEk() { return 'gercek' } static get adiEk() { return 'Gerçek' }
}
class StokHareketci_Maliyetli extends StokHareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get maliyetlimi() { return true }
	static get kodEk() { return 'maliyetli' } static get adiEk() { return 'Maliyetli' }
}
