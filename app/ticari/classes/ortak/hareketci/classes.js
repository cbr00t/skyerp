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
	constructor(e) { e = e || {}; super(e) } defaultSonIslem(e) { this.uniOrtakSonIslem(e) }
	static varsayilanHVDuzenle(e) {
		const {hv} = e, sqlEmptyDate = 'cast(null as datetime)', sqlEmpty = `''`, sqlZero = '0';
		for (const key of [
			'iceriktipi', 'anaislemadi', 'islkod', 'isladi', 'plasiyerkod', 'plasiyeradi', 'odemekod', 'odgunkod', 'iade', 'kdetay', 'satistipkod', 'fistipi', 'fisektipi',
			'dovizsanalmi', 'dvkod', 'ticmust', 'must', 'althesapkod', 'althesapadi', 'takipno', 'aciklama', 'ekaciklama', 'gxbnox', 'taksitadi', 'riskdurumu', 'cskendisimi'
		]) { hv[key] = sqlEmpty }
		for (const key of ['seq', 'belgeno', 'dvkur', 'noyil', 'bedel', 'dvbedel', 'acikkisim', 'ekstrarisk', 'ekstrarisk2']) { hv[key] = sqlZero }
		for (const key of ['reftarih', 'karsiodemetarihi', 'vade', 'gxbtarihi']) { hv[key] = sqlEmptyDate }
		$.extend(hv, {
			fissayac: 'fis.kaysayac', kaysayac: 'har.kaysayac', ozelisaret: 'fis.ozelisaret', bizsubekod: 'fis.bizsubekod', tarih: 'fis.tarih', basliktarih: 'fis.tarih',
			seri: 'fis.seri', fisno: 'fis.no', baslikno: 'fis.no', fisnox: 'fis.fisnox', disfisnox: 'fis.fisnox', muhfissayac: 'fis.muhfissayac',
			sonzamants: 'fis.sonzamants', koopdonemno: 'cast(null as int)'
		})
	}
	static uygunluk2UnionBilgiListeDuzenleDevam(e) {
		super.uygunluk2UnionBilgiListeDuzenleDevam(e); const {liste} = e; $.extend(liste, {
				/* Banka */
			havaleEFT: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(e => {
					const {sent} = e, wh = sent.where;
					sent.fisHareket('hefis', 'hehar'); sent.fis2PlasiyerBagla(e).fis2BankaHesapBagla(e).har2AltHesapBagla_eski(e);
					wh.fisSilindiEkle().inDizi(['SH', 'SE', 'SS', 'GL', 'TP'], 'fis.fistipi')
				}).hvDuzenleIslemi(e => {
					$.extend(e.hv, {
						oncelik: '12', unionayrim: `'HavEft'`, isladi: 'dbo.heacik(fis.fistipi, har.hisl)', aciklama: 'har.aciklama', ekaciklama: 'fis.aciklama',
						takipno: 'har.takipno', refkod: 'fis.banhesapkod', refadi: 'bhes.aciklama', vade: 'har.vade', karsiodemetarihi: 'fis.tarih', bedel: 'har.bedel',
						anaislemadi: `(case fis.fistipi when 'GL' then 'Gelen Havale/EFT' when 'TP' then 'Toplu Havale/EFT/POS' else 'Satıcı Havale/EFT' end)`,
						dvbedel: `(case when har.karsidvvar = '' then har.dvbedel else har.karsidvbedel end)`,
						kayittipi: `((case when fis.fistipi = 'GL' then 'G' when fis.fistipi = 'TP' then 'T' else 'S' end) + 'BNHE')`,
						must: 'har.ticmustkod', asilmust: 'har.must', tarih: 'coalesce(har.belgetarih, fis.tarih)', plasiyerkod: 'fis.plasiyerkod', plasiyeradi: 'pls.aciklama',
						dvkur: `(case when har.karsidvvar = '' then har.dvkur else har.karsidvkur end)`, 
						althesapkod: 'har.cariitn', althesapadi: 'alth.aciklama', dvkod: `dbo.emptycoalesce(alth.dvkod, car.dvkod)`,
						ba: `(case when fis.fistipi in ('SH', 'SE', 'SS') then 'B' when fis.fistipi = 'TP' then dbo.tersba(har.hba) else 'A' end)`
					})
				})
			],
			kredi: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(e => {
					const {sent} = e, wh = sent.where; sent.fromAdd('kredifis fis'); sent.fis2KrediBankaHesapBagla(e).fis2AltHesapBagla(e);
					wh.fisSilindiEkle().add(`fis.fistipi = 'A'`, `fis.hedeftipi = 'C'`)
				}).hvDuzenleIslemi(e => $.extend(e.hv, {
					kaysayac: 'fis.kaysayac', oncelik: '30', unionayrim: `'Kre'`, kayittipi: `'KRE'`, anaislemadi: `'Kredi'`, isladi: `'Kredi Alımı'`, fistipi: 'fis.fistipi',
					ba: `'B'`, must: 'fis.must', asilmust: 'fis.must', vade: 'fis.tarih', bedel: 'fis.topbrutbedel', dvbedel: 'fis.topdvbrutbedel',
					althesapkod: 'har.cariitn', althesapadi: 'alth.aciklama', dvkod: `dbo.emptycoalesce(alth.dvkod, car.dvkod)`,
					refkod: 'fis.kredihesapkod', refadi: 'bhes.aciklama', dvkur: 'fis.dvkur', aciklama: 'har.aciklama', ekaciklama: 'fis.aciklama'
				}))
			],
			pos: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(e => {
					const {sent} = e, wh = sent.where; sent.fisHareket('posfis', 'posilkhar'); sent.fis2PlasiyerBagla(e).har2AltHesapBagla_eski(e).har2BankaHesapBagla(e);
					wh.fisSilindiEkle().add(`fis.fistipi = 'AL'`)
				}).hvDuzenleIslemi(e => {
					let {cariGenel} = app.params, k = cariGenel.kullanim;
					let vadeSql = k.posVadelendirmeNakdeDonusummu ? 'har.nakdedonusumvade' : k.posVadelendirmeSerbestmi ? 'har.vade' : 'fis.tarih';
					$.extend(e.hv, {
						kaysayac: 'fis.kaysayac', oncelik: '120', unionayrim: `'POSTah'`, kayittipi: `'POS'`, fisektipi: 'fis.almsat',
						anaislemadi: `(case when fis.almsat = 'T' then 'POS ile Tahsil' else 'Kredi Kartı ile Ödeme' end)`,
						isladi: `(case when fis.almsat = 'T' then 'POS ile Tahsil' else 'Kr.Kart ile Ödeme' end)`, fistipi: 'fis.fistipi',
						ba: `(case when rtrim(fis.almsat + fis.iade) in ('T', 'AI') then 'A' else 'B' end)`,
						must: 'har.ticmustkod', asilmust: 'har.must', plasiyerkod: 'fis.plasiyerkod', plasiyeradi: 'pls.aciklama',
						vade: vadeSql, karsiodemetarihi: vadeSql, bedel: 'sum(har.bedel)', dvbedel: 'sum(har.karsidvbedel)',
						althesapkod: 'har.cariitn', althesapadi: 'alth.aciklama', dvkod: `dbo.emptycoalesce(alth.dvkod, car.dvkod)`,
						refkod: 'har.banhesapkod', refadi: 'bhes.aciklama', dvkur: 'fis.dvkur', aciklama: 'har.aciklama', ekaciklama: 'fis.aciklama'
					})
				})
			],
			masraf: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(e => {
					const {sent} = e, wh = sent.where; sent.fisHareket('posfis', 'posilkhar').fis2PlasiyerBagla(e).har2AltHesapBagla_eski(e).har2BankaHesapBagla(e);
					wh.fisSilindiEkle().add(`fis.fistipi = 'AL'`, `har.masraf <> 0`)
				}).hvDuzenleIslemi(e => {
					let {cariGenel} = app.params, k = cariGenel.kullanim;
					let vadeSql = k.posVadelendirmeNakdeDonusummu ? 'har.nakdedonusumvade' : k.posVadelendirmeSerbestmi ? 'har.vade' : 'fis.tarih';
					$.extend(e.hv, {
						kaysayac: 'fis.kaysayac', oncelik: '120', unionayrim: `'POS'`, kayittipi: `'POSB'`,
						anaislemadi: `(case when fis.almsat = 'T' then 'POS Tahsil Bonus' else 'Kr.Kart Ödeme Bonus' end)`,
						isladi: `(case when fis.almsat = 'T' then 'POS ile Tahsil' else 'Kr.Kart ile Ödeme' end)`,
						ba: `(case when rtrim(fis.almsat + fis.iade) in ('T', 'AI') then 'A' else 'B' end)`,
						must: 'har.ticmustkod', asilmust: 'har.must', plasiyerkod: 'fis.plasiyerkod', plasiyeradi: 'pls.aciklama',
						vade: vadeSql, karsiodemetarihi: vadeSql, bedel: 'sum(har.masraf)', dvbedel: '0',
						althesapkod: 'har.cariitn', althesapadi: 'alth.aciklama',
						refkod: 'har.banhesapkod', refadi: 'bhes.aciklama', aciklama: 'har.aciklama', ekaciklama: 'fis.aciklama'
					})
			   })
			],
				/* Finans */
			dekont: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(e => {
					const {sent} = e, wh = sent.where; sent.fisHareket('finansfis', 'finanshar');
					sent.fis2KasaBagla().har2HizmetBagla().har2BankaHesapBagla()
						.leftJoin({ alias: 'fis', from: 'carisl isl', on: 'fis.carislkod = isl.kod' })
						.leftJoin({ alias: 'har', from: 'kategoridetay kdet', on: 'har.kdetaysayac = kdet.kaysayac' })
						.har2AltHesapBagla_eski().fis2PlasiyerBagla()
					wh.fisSilindiEkle().inDizi(['CI', 'CH', 'KC'], 'fis.fistipi')
				}).hvDuzenleIslemi(e => {
					let fisNoxClause = `(case when har.belgeno = 0 then fis.fisnox else har.belgenox end)`,
						vadeSql = `coalesce(har.vade, har.belgetarih, fis.fisvade, fis.tarih)`;
					$.extend(e.hv, {
						kaysayac: 'har.kaysayac', fisektipi: 'fis.almsat', unionayrim: `'Fin'`, fistipi: `(fis.fistipi + fis.ba)`,
						oncelik: `(case when fis.fistipi = 'CI' and fis.ozeltip = 'D' then 0 else 1 end)`, vade: vadeSql, karsiodemetarihi: vadeSql,
						islkod: `(case when fis.fistipi = 'CI' then fis.carislkod when fis.fistipi = 'CH' then har.hizmetkod else '' end)`,
						isladi: `(case when fis.fistipi = 'CI' then isl.aciklama when fis.fistipi = 'CH' then hiz.aciklama
											when fis.fistipi = 'KC' then dbo.batext(fis.ba, 'Cari Hesap Tahsil', 'Cari Hesap Ödeme') else '' end)`,
						kayittipi: `(case when fis.fistipi = 'CI' then 'CRISL' when fis.fistipi = 'CH' then 'CHIZ' when fis.fistipi = 'KC' then 'KCNAK' else '' end)`,
						anaislemadi: `(case when fis.fistipi = 'CI' then (case when fis.ozeltip = 'D' then 'Cari Devir' else 'Cari Toplu İşlem' end)
											when fis.fistipi = 'CH' then 'Cari Hizmet'
											when fis.fistipi = 'KC' then 'Kasa Tahsilat/Ödeme' else '' end)`,
						tarih: `coalesce(har.belgetarih, fis.tarih)`, seri: `(case when har.belgeno = 0 then fis.seri else har.belgeseri end)`,
						noyil: `(case when har.belgeno = 0 then 0 else har.belgenoyil end)`, fisno: `(case when har.belgeno = 0 then fis.no else har.belgeno end)`,
						fisnox: fisNoxClause, disfisnox: fisNoxClause, must: 'har.ticmustkod', asilmust: 'har.must',
						ba: `(case when fis.fistipi = 'KC' then dbo.tersba(fis.ba) else fis.ba end)`,
						plasiyerkod: `(case when fis.fistipi = 'KC' then fis.plasiyerkod else '' end)`, plasiyeradi: `(case when fis.fistipi = 'KC' then fis.birunvan else '' end)`,
						kdetay: 'kdet.kdetay', bedel: '(har.bedel + har.kredifaiz)', dvbedel: `(case when har.karsidvvar = '' then har.dvbedel else har.karsidvbedel end)`,
						acikkisim: 'har.acikkisim', althesapkod: 'har.cariitn', althesapadi: 'alth.aciklama', dvkod: `dbo.emptycoalesce(alth.dvkod, car.dvkod)`,
						refkod: `(case when fis.fistipi = 'KC' then fis.kasakod else '' end)`, refadi: `(case when fis.fistipi = 'KC' then kas.aciklama else '' end)`,
						dvkur: `(case when har.karsidvvar = '' then har.dvkur else har.karsidvkur end)`, riskdurumu: `'V'`,
						aciklama: `(case when fis.fistipi = 'KC' then har.aciklama else dbo.hizmetack(fis.tarih, fis.seri, fis.no, har.aciklama) end)`,
						ekaciklama: 'fis.aciklama'
					})
				})
			],
			serbestMeslek: [
				/*new Hareketci_UniBilgi().sentDuzenleIslemi(e => {
					const {sent} = e, wh = sent.where; sent.fisHareket('finansfis', 'finanshar');
					sent.har2HizmetBagla().har2BankaHesapBagla()
						.leftJoin({ alias: 'fis', from: 'carisl isl', on: 'fis.carislkod = isl.kod' })
						.leftJoin({ alias: 'har', from: 'kategoridetay kdet', on: 'har.kdetaysayac = kdet.kaysayac' })
						.har2AltHesapBagla_eski().fis2PlasiyerBagla()
					wh.fisSilindiEkle().inDizi(['CI', 'CH', 'KC'], 'fis.fistipi')
				}).hvDuzenleIslemi(e => {
					let fisNoxClause = `(case when har.belgeno = 0 then fis.fisnox else har.belgenox end)`,
						vadeSql = `coalesce(har.vade, har.belgetarih, fis.fisvade, fis.tarih)`;
					$.extend(e.hv, {
						kaysayac: 'har.kaysayac', fisektipi: 'fis.almsat', unionayrim: `'Fin'`, fistipi: `(fis.fistipi + fis.ba)`,
						oncelik: `(case when fis.fistipi = 'CI' and fis.ozeltip = 'D' then 0 else 1 end)`, vade: vadeSql, karsiodemetarihi: vadeSql,
						islkod: `(case when fis.fistipi = 'CI' then fis.carislkod when fis.fistipi = 'CH' then har.hizmetkod else '' end)`,
						isladi: `(case when fis.fistipi = 'CI' then isl.aciklama when fis.fistipi = 'CH' then hiz.aciklama
											when fis.fistipi = 'KC' then dbo.batext(fis.ba, 'Cari Hesap Tahsil', 'Cari Hesap Ödeme') else '' end)`,
						kayittipi: `(case when fis.fistipi = 'CI' then 'CRISL' when fis.fistipi = 'CH' then 'CHIZ' when fis.fistipi = 'KC' then 'KCNAK' else '' end)`,
						anaislemadi: `(case when fis.fistipi = 'CI' then (case when fis.ozeltip = 'D' then 'Cari Devir' else 'Cari Toplu İşlem' end)
											when fis.fistipi = 'CH' then 'Cari Hizmet'
											when fis.fistipi = 'KC' then 'Kasa Tahsilat/Ödeme' else '' end)`,
						tarih: `coalesce(har.belgetarih, fis.tarih)`, seri: `(case when har.belgeno = 0 then fis.seri else har.belgeseri end)`,
						noyil: `(case when har.belgeno = 0 then 0 else har.belgenoyil end)`, fisno: `(case when har.belgeno = 0 then fis.no else har.belgeno end)`,
						fisnox: fisNoxClause, disfisnox: fisNoxClause, must: 'har.ticmustkod', asilmust: 'har.must',
						ba: `(case when fis.fistipi = 'KC' then dbo.tersba(fis.ba) else fis.ba end)`,
						plasiyerkod: `(case when fis.fistipi = 'KC' then fis.plasiyerkod else '' end)`, plasiyeradi: `(case when fis.fistipi = 'KC' then fis.birunvan else '' end)`,
						kdetay: 'kdet.kdetay', bedel: '(har.bedel + har.kredifaiz)', dvbedel: `(case when har.karsidvvar = '' then har.dvbedel else har.karsidvbedel end)`,
						acikkisim: 'har.acikkisim', althesapkod: 'har.cariitn', althesapadi: 'alth.aciklama', dvkod: `dbo.emptycoalesce(alth.dvkod, car.dvkod)`,
						refkod: `(case when fis.fistipi = 'KC' then fis.kasakod else '' end)`, refadi: `(case when fis.fistipi = 'KC' then kas.aciklama else '' end)`,
						dvkur: `(case when har.karsidvvar = '' then har.dvkur else har.karsidvkur end)`, riskdurumu: `'V'`,
						aciklama: `(case when fis.fistipi = 'KC' then har.aciklama else dbo.hizmetack(fis.tarih, fis.seri, fis.no, har.aciklama) end)`,
						ekaciklama: 'fis.aciklama'
					})
				})*/
				/*" finansfis - SM - Serbest meslek --- "
				[	sent := MQSent new.
					sent fis: 'finansfis' hareket: 'finanshar';
								" sonIslem ile cari baglanti yapilacak "
						har2HizmetBagla;
						leftJoin: 'har' -> 'kategoridetay kdet' iliski: 'har.kdetaysayac=kdet.kaysayac';
						har2AltHesapBagla.
					sent where
						fisSilindiEkle;
						add: 'fis.fistipi=''SM'''.
			
					sent sahalar
						addAll: #('har.kaysayac' 'fis.ozelisaret' 'fis.silindi' 
									'1 oncelik' 
									'fis.bizsubekod'
									'''SRBMES'' kayittipi'
									'''Fin'' unionayrim'
									'''Serbest Meslek'' anaislemadi'
									'(fis.fistipi+fis.ba) fistipi'
									''''' iade' 'fis.fisticmustkod must'
									'fis.fismustkod asilmust'
									'coalesce(har.belgetarih,fis.tarih) tarih' 'fis.tarih basliktarih' 'fis.no baslikno'
									''''' odemekod' ''''' odgunkod'
									'(case when har.karsidvvar='''' then har.dvkur else har.karsidvkur end) dvkur' 
									'(case when har.belgeno=0 then fis.seri else har.belgeseri end) seri'
									'(case when har.belgeno=0 then 0 else har.belgenoyil end) noyil' 
									'(case when har.belgeno=0 then fis.no else har.belgeno end) fisno'
									'(case when har.belgeno=0 then fis.fisnox else har.belgenox end) fisnox'
									'(case when har.belgeno=0 then fis.fisnox else har.belgenox end) disfisnox'
									'har.cariitn althesapkod' 'alth.aciklama althesapadi' 'dbo.emptycoalesce(alth.dvkod,car.dvkod) dvkod'
									'fis.ba ba'
									'dbo.hizmetack(fis.tarih,fis.seri,fis.no,har.aciklama) aciklama' 
									'har.hizmetkod islkod'
									'hiz.aciklama isladi'
									''''' plasiyerkod'
									 ''''' plasiyeradi'
									'kdet.kdetay' 'har.takipno' ''''' satistipkod'
									''''' refkod'
									''''' refadi'
									'coalesce(har.vade,har.belgetarih,fis.fisvade,fis.tarih) vade'
									'coalesce(har.vade,har.belgetarih,fis.fisvade,fis.tarih) karsiodemetarihi');
						add: 'har.bedel';
						addAll: #('(case when har.karsidvvar='''' then har.dvbedel else har.karsidvbedel end) dvbedel'
									'har.acikkisim' ''''' taksitadi' '0 seq' '0 belgeno'
									'''V'' riskdurumu'
									''''' cskendisimi' '0 ekstrarisk' '0 ekstrarisk2'
												'fis.kaysayac fissayac').
								" fis.fisvade: serbest meslek icindir, har.vade: hizmetler icindir "
							" kasa tahsilat odeme icin de riskdurum=V yapildi - artik vade kullanan yerler var "
												" dvbedel'de kredidvfaiz sanki gerekli olacak "
					degerci bosGcbEkle value: sent.
					degerci koopDonemEkle value: sent.
					degerci sonIslem value: sent.
					] value.
			*/
			]
		})
	}
}
