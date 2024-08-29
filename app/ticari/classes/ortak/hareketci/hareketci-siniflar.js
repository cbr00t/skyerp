class CariHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kod() { return 'cari' } static get aciklama() { return 'Cari' }
	static hareketTipSecim_kaListeDuzenle(e) {
		super.hareketTipSecim_kaListeDuzenle(e); const {kaListe} = e; kaListe.push(
			new CKodVeAdi(['kasa', 'Kasa Tahsilat/Ödeme']), new CKodVeAdi(['hizmet', 'Hizmet Gelir/Gider']), new CKodVeAdi(['havaleEFT', 'Havale/EFT']),
			new CKodVeAdi(['tahsilatOdeme', 'Cari Tahsilat/Ödeme']), new CKodVeAdi(['virman', 'Cari Virman', 'virmanmi']), new CKodVeAdi(['dekont', 'Genel Dekont']),
			new CKodVeAdi(['topluIslem', 'Toplu İşlem']), new CKodVeAdi(['devir', 'Cari Devir']), new CKodVeAdi(['cek', 'Çek']), new CKodVeAdi(['SENET', 'Senet']),
			new CKodVeAdi(['kredi', 'Banka Kredi']), new CKodVeAdi(['pos', 'POS İşlemi']), new CKodVeAdi(['fatura', 'Fatura']), new CKodVeAdi(['masraf', 'Faiz/Masraf'])
		)
	}
	constructor(e) { e = e || {}; super(e) }
	uniDuzenleDevam(e) {
		super.uniDuzenleDevam(e); const {uni, sqlEmpty, ekleyici} = e, {uygunluk, attrSet, whereYapi} = this, {cariGenel} = app.params;
		if (uygunluk.uygunmu('havaleEFT')) {
			let sent = new MQSent().fisHareket('hefis', 'hehar'), wh = sent.where, {serbestliBedelSql} = this;
			sent.fis2PlasiyerBagla(e).fis2BankaHesapBagla(e).har2AltHesapBagla_eski(e); wh.fisSilindiEkle().inDizi(['SH', 'SE', 'SS', 'GL', 'TP'], 'fis.fistipi');
			let _e = { ...e, sent, wh, attr2Deger: {} }; ekleyici(_e,
				['har.kaysayac'], ['fis.ozelisaret'], ['12', 'oncelik'], ['fis.bizsubekod'], [`'HavEft'`, 'unionayrim'],
				[`((case when fis.fistipi = 'GL' then 'G' when fis.fistipi = 'TP' then 'T' else 'S' end) + 'BNHE')`, 'kayittipi'], [sqlEmpty, 'iceriktipi'],
				[`(case when fis.fistipi = 'GL' then 'Gelen Havale/EFT' when fis.fistipi = 'TP' then 'Toplu Havale/EFT/POS' else 'Satıcı Havale/EFT' end)`, 'anaislemadi'], ['fis.fistipi'], [sqlEmpty, 'iade'],
				['har.ticmustkod', 'must'], ['har.must', 'asilmust'], ['coalesce(har.belgetarih, fis.tarih)', 'tarih'], ['fis.tarih', 'basliktarih'], ['fis.no', 'baslikno'], [sqlEmpty, 'odemekod'], [sqlEmpty, 'odgunkod'],
				[`(case when har.karsidvvar = '' then har.dvkur else har.karsidvkur end)`, 'dvkur'], ['fis.seri'], ['0', 'noyil'], ['fis.no', 'fisno'], ['fis.fisnox'], ['fis.fisnox', 'disfisnox'],
				['har.cariitn', 'althesapkod'], ['alth.aciklama', 'althesapadi'], ['dbo.emptycoalesce(alth.dvkod, car.dvkod)', 'dvkod'],
				[`(case when fis.fistipi in ('SH', 'SE', 'SS') then 'B' when fis.fistipi = 'TP' then dbo.tersba(har.hba) else 'A' end)`, 'ba'], ['har.aciklama'], ['fis.aciklama', 'ekaciklama'],
				[sqlEmpty, 'islkod'], ['dbo.heacik(fis.fistipi, har.hisl)', 'isladi'], ['fis.plasiyerkod'], ['pls.aciklama', 'plasiyeradi'],
				[sqlEmpty, 'kdetay'], ['har.takipno'], [sqlEmpty, 'satistipkod'], ['fis.banhesapkod', 'refkod'], ['bhes.aciklama', 'refadi'], ['har.vade'],
				['fis.tarih', 'karsiodemetarihi'], [`cast(null as datetime)`, 'reftarih'],
				[serbestliBedelSql, 'bedel'], [`(case when har.karsidvvar = '' then har.dvbedel else har.karsidvbedel end)`, 'dvbedel'], ['fis.muhfissayac'], [sqlEmpty, 'fisektipi'], [sqlEmpty, 'dovizsanalmi'],
				['fis.kaysayac', 'fissayac'], ['fis.sonzamants']
			);
			/* degerci bosGcbEkle value: sent. degerci koopDonemEkle value: sent. degerci sonIslem value: sent */
			if (whereYapi) { for (const handler of Object.values(whereYapi)) { getFuncValue.call(this, handler, _e) } }
			uni.add(sent)
		}
		if (uygunluk.uygunmu('kredi')) {
			let sent = new MQSent({ from: 'kredifis fis' }), wh = sent.where;
			sent.fis2KrediBankaHesapBagla(e).fis2AltHesapBagla(e); wh.fisSilindiEkle().add(`fis.fistipi = 'A'`, `fis.hedeftipi = 'C'`);
			let _e = { ...e, sent, wh, attr2Deger: {} }; ekleyici(_e,
				['fis.kaysayac'], ['fis.ozelisaret'], ['30', 'oncelik'], ['fis.bizsubekod'], [`'Kre'`, 'unionayrim'], [`'KRE'`, 'kayittipi'], [sqlEmpty, 'iceriktipi'],
				[`'Kredi'`, 'anaislemadi'], ['fis.fistipi'], [sqlEmpty, 'iade'],
				['fis.must'], ['fis.must', 'asilmust'], ['fis.tarih'], ['fis.tarih', 'basliktarih'], ['fis.no', 'baslikno'], [sqlEmpty, 'odemekod'], [sqlEmpty, 'odgunkod'],
				['fis.dvkur'], ['fis.seri'], ['0', 'noyil'], ['fis.no', 'fisno'], ['fis.fisnox'], ['fis.fisnox', 'disfisnox'],
				['fis.althesapkod'], ['alth.aciklama', 'althesapadi'], ['dbo.emptycoalesce(alth.dvkod, car.dvkod)', 'dvkod'],
				[`'B'`, 'ba'], ['har.aciklama'], ['fis.aciklama', 'ekaciklama'],
				[sqlEmpty, 'islkod'], [`'Kredi Alımı'`, 'isladi'], [sqlEmpty, 'plasiyerkod'], [sqlEmpty, 'plasiyeradi'],
				[sqlEmpty, 'kdetay'], [sqlEmpty, 'takipno'], [sqlEmpty, 'satistipkod'], ['fis.kredihesapkod', 'refkod'], ['bhes.aciklama', 'refadi'],
				['fis.tarih', 'vade'], ['fis.tarih', 'karsiodemetarihi'], [`cast(null as datetime)`, 'reftarih'],
				['fis.topbrutbedel', 'bedel'], ['fis.topdvbrutbedel', 'dvbedel'], ['fis.muhfissayac'], [sqlEmpty, 'fisektipi'], [sqlEmpty, 'dovizsanalmi'],
				['fis.kaysayac', 'fissayac'], ['fis.sonzamants']
			);
			/* degerci bosGcbEkle value: sent. degerci koopDonemEkle value: sent. degerci sonIslem value: sent */
			if (whereYapi) { for (const handler of Object.values(whereYapi)) { getFuncValue.call(this, handler, _e) } }
			uni.add(sent)
		}
		if (uygunluk.uygunmu('pos')) {
			let sent = new MQSent().fisHareket('posfis', 'posilkhar'), wh = sent.where, {serbestliBedelSql} = this;
			let k = cariGenel.kullanim, vadeSql = k.posVadelendirmeNakdeDonusummu ? 'har.nakdedonusumvade' : k.posVadelendirmeSerbestmi ? 'har.vade' : 'fis.tarih';
			sent.fis2PlasiyerBagla(e).har2AltHesapBagla_eski(e).har2BankaHesapBagla(e); wh.fisSilindiEkle().add(`fis.fistipi = 'AL'`);
			let _e = { ...e, sent, wh, attr2Deger: {} }; ekleyici(_e,
				['fis.kaysayac'], ['fis.ozelisaret'], ['120', 'oncelik'], ['fis.bizsubekod'], [`'POSTah'`, 'unionayrim'], [`'POS'`, 'kayittipi'], [sqlEmpty, 'iceriktipi'],
				[`(case when fis.almsat = 'T' then 'POS ile Tahsil' else 'Kredi Kartı ile Ödeme' end)`, 'anaislemadi'], ['fis.fistipi'], [sqlEmpty, 'iade'],
				['har.ticmustkod', 'must'], ['har.must', 'asilmust'], ['fis.tarih'], ['fis.tarih', 'basliktarih'], ['fis.no', 'baslikno'], [sqlEmpty, 'odemekod'], [sqlEmpty, 'odgunkod'],
				['fis.dvkur'], ['fis.seri'], ['0', 'noyil'], ['fis.no', 'fisno'], ['fis.fisnox'], ['fis.fisnox', 'disfisnox'],
				['har.cariitn'], ['alth.aciklama', 'althesapadi'], ['dbo.emptycoalesce(alth.dvkod, car.dvkod)', 'dvkod'],
				[`(case when rtrim(fis.almsat + fis.iade) in ('T', 'AI') then 'A' else 'B' end)`, 'ba'], ['har.aciklama'], ['fis.aciklama', 'ekaciklama'],
				[sqlEmpty, 'islkod'], [`(case when fis.almsat = 'T' then 'POS ile Tahsil' else 'Kr.Kart ile Ödeme' end)`, 'isladi'], ['fis.plasiyerkod', 'plasiyerkod'], ['pls.birunvan', 'plasiyeradi'],
				[sqlEmpty, 'kdetay'], ['har.takipno'], [sqlEmpty, 'satistipkod'], ['har.banhesapkod', 'refkod'], ['bhes.aciklama', 'refadi'],
				[vadeSql, 'vade'], [vadeSql, 'karsiodemetarihi'], [`cast(null as datetime)`, 'reftarih'],
				[`sum(${serbestliBedelSql})`, 'bedel'], ['sum(har.karsidvbedel)', 'dvbedel'], ['fis.muhfissayac'], ['fis.almsat', 'fisektipi'], [sqlEmpty, 'dovizsanalmi'],
				['fis.kaysayac', 'fissayac'], ['fis.sonzamants']
			);
			/* degerci bosGcbEkle value: sent. degerci koopDonemEkle value: sent. degerci sonIslem value: sent */
			if (whereYapi) { for (const handler of Object.values(whereYapi)) { getFuncValue.call(this, handler, _e) } }
			uni.add(sent)
		}
		if (uygunluk.uygunmu('masraf')) {
			let sent = new MQSent().fisHareket('posfis', 'posilkhar'), wh = sent.where, vadeSql = 'coalesce(har.vade, fis.tarih)';
			sent.fis2PlasiyerBagla(e).har2AltHesapBagla_eski(e).har2BankaHesapBagla(e); wh.fisSilindiEkle().add(`fis.fistipi = 'AL'`, `har.masraf <> 0`);
			let _e = { ...e, sent, wh, attr2Deger: {} }; ekleyici(_e,
				['fis.kaysayac'], ['fis.ozelisaret'], ['120', 'oncelik'], ['fis.bizsubekod'], [`'POS'`, 'unionayrim'], [`'POSB'`, 'kayittipi'], [sqlEmpty, 'iceriktipi'],
				[`(case when fis.almsat = 'T' then 'POS Tahsil Bonus' else 'Kr.Kart Ödeme Bonus' end)`, 'anaislemadi'], [sqlEmpty, 'fistipi'], [sqlEmpty, 'iade'],
				['har.ticmustkod', 'must'], ['har.must', 'asilmust'], ['fis.tarih'], ['fis.tarih', 'basliktarih'], ['fis.no', 'baslikno'], [sqlEmpty, 'odemekod'], [sqlEmpty, 'odgunkod'],
				['0', 'dvkur'], ['fis.seri'], ['0', 'noyil'], ['fis.no', 'fisno'], ['fis.fisnox'], ['fis.fisnox', 'disfisnox'],
				['har.cariitn'], ['alth.aciklama', 'althesapadi'], [sqlEmpty, 'dvkod'],
				[`(case when rtrim(fis.almsat + fis.iade) in ('T', 'AI') then 'A' else 'B' end)`, 'ba'], ['har.aciklama'], ['fis.aciklama', 'ekaciklama'],
				[sqlEmpty, 'islkod'], [`(case when fis.almsat = 'T' then 'POS ile Tahsil' else 'Kr.Kart ile Ödeme' end)`, 'isladi'], ['fis.plasiyerkod', 'plasiyerkod'], ['pls.birunvan', 'plasiyeradi'],
				[sqlEmpty, 'kdetay'], ['har.takipno'], [sqlEmpty, 'satistipkod'], ['har.banhesapkod', 'refkod'], ['bhes.aciklama', 'refadi'],
				[vadeSql, 'vade'], [vadeSql, 'karsiodemetarihi'], [`cast(null as datetime)`, 'reftarih'],
				['sum(har.masraf)', 'bedel'], ['0', 'dvbedel'], ['fis.muhfissayac'], [sqlEmpty, 'fisektipi'], [sqlEmpty, 'dovizsanalmi'],
				['fis.kaysayac', 'fissayac'], ['fis.sonzamants']
			);
			/* degerci bosGcbEkle value: sent. degerci koopDonemEkle value: sent. degerci sonIslem value: sent */
			if (whereYapi) { for (const handler of Object.values(whereYapi)) { getFuncValue.call(this, handler, _e) } }
			uni.add(sent)
		}
	}
}
