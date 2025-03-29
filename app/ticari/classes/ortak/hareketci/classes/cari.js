class CariHareketci extends Hareketci {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return 'cari' } static get aciklama() { return 'Cari' }
	static hareketTipSecim_kaListeDuzenle(e) {
		super.hareketTipSecim_kaListeDuzenle(e); e.kaListe.push(
			new CKodVeAdi(['kasa', 'Kasa Tahsilat/Ödeme']), new CKodVeAdi(['hizmet', 'Hizmet Gelir/Gider']), new CKodVeAdi(['havaleEFT', 'Havale/EFT']),
			new CKodVeAdi(['tahsilatOdeme', 'Cari Tahsilat/Ödeme']), new CKodVeAdi(['virman', 'Cari Virman', 'virmanmi']), new CKodVeAdi(['genelDekont', 'Genel Dekont']),
			new CKodVeAdi(['topluIslem', 'Toplu İşlem/Devir']), new CKodVeAdi(['cekSenet', 'Çek/Senet']),
			new CKodVeAdi(['kredi', 'Banka Kredi']), new CKodVeAdi(['pos', 'POS İşlemi']), new CKodVeAdi(['fatura', 'Fatura']), new CKodVeAdi(['masraf', 'Faiz/Masraf']),
			new CKodVeAdi(['cariTahsilatOdeme', 'Cari Tahsilat/Ödeme'])
		)
	}
	constructor(e) { e = e || {}; super(e) }
	static varsayilanHVDuzenle(e) {
		super.varsayilanHVDuzenle(e); const {hv, sqlNull, sqlEmpty, sqlZero} = e;
		for (const key of ['satistipkod', 'taksitadi', 'riskdurumu', 'cskendisimi', 'gxbnox', 'gxbtarihi', 'koopdonemno']) { hv[key] = sqlNull }
		for (const key of ['acikkisim', 'ekstrarisk', 'ekstrarisk2']) { hv[key] = sqlZero }
	}
	uygunluk2UnionBilgiListeDuzenleDevam(e) {
		super.uygunluk2UnionBilgiListeDuzenleDevam(e);
		this.uniDuzenle_banka(e).uniDuzenle_finans(e).uniDuzenle_genelDekont(e);
		this.uniDuzenle_cariTahsilatOdeme(e).uniDuzenle_cekSenet(e).uniDuzenle_ticari(e)
	}
	uniDuzenle_banka({ uygunluk, liste }) {
		$.extend(liste, {
			havaleEFT: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;
					sent.fisHareket('hefis', 'hehar'); sent.fis2PlasiyerBagla().fis2BankaHesapBagla().har2AltHesapBagla();
					wh.fisSilindiEkle().inDizi(['SH', 'SE', 'SS', 'GL', 'TP'], 'fis.fistipi')
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						oncelik: '12', unionayrim: `'HavEft'`, islemadi: 'dbo.heacik(fis.fistipi, har.hisl)', fisaciklama: 'har.aciklama', detaciklama: 'fis.aciklama',
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
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; sent.fromAdd('kredifis fis').fis2KrediBankaHesapBagla().fis2AltHesapBagla();
					wh.fisSilindiEkle().add(`fis.fistipi = 'A'`, `fis.hedeftipi = 'C'`)
				}).hvDuzenleIslemi(({ hv }) => $.extend(hv, {
					kaysayac: 'fis.kaysayac', oncelik: '30', unionayrim: `'Kre'`, kayittipi: `'KRE'`, anaislemadi: `'Kredi'`, islemadi: `'Kredi Alımı'`, fistipi: 'fis.fistipi',
					ba: `'B'`, must: 'fis.must', asilmust: 'fis.must', vade: 'fis.tarih', bedel: 'fis.topbrutbedel', dvbedel: 'fis.topdvbrutbedel',
					althesapkod: 'fis.althesapkod', althesapadi: 'alth.aciklama', dvkod: `dbo.emptycoalesce(alth.dvkod, car.dvkod)`,
					refkod: 'fis.kredihesapkod', refadi: 'bhes.aciklama', dvkur: 'fis.dvkur', fisaciklama: 'har.aciklama', detaciklama: 'fis.aciklama'
				}))
			],
			pos: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; sent.fisHareket('posfis', 'posilkhar').fis2PlasiyerBagla().har2AltHesapBagla().har2BankaHesapBagla();
					wh.fisSilindiEkle().add(`fis.fistipi = 'AL'`)
				}).hvDuzenleIslemi(({ hv }) => {
					let {cariGenel} = app.params, {kullanim: k} = cariGenel;
					let vadeSql = k.posVadelendirmeNakdeDonusummu ? 'har.nakdedonusumvade' : k.posVadelendirmeSerbestmi ? 'har.vade' : 'fis.tarih';
					$.extend(hv, {
						kaysayac: 'fis.kaysayac', oncelik: '120', unionayrim: `'POSTah'`, kayittipi: `'POS'`, fisektipi: 'fis.almsat',
						anaislemadi: `(case when fis.almsat = 'T' then 'POS ile Tahsil' else 'Kredi Kartı ile Ödeme' end)`,
						islemadi: `(case when fis.almsat = 'T' then 'POS ile Tahsil' else 'Kr.Kart ile Ödeme' end)`, fistipi: 'fis.fistipi',
						ba: `(case when rtrim(fis.almsat + fis.iade) in ('T', 'AI') then 'A' else 'B' end)`,
						must: 'har.ticmustkod', asilmust: 'har.must', plasiyerkod: 'fis.plasiyerkod', plasiyeradi: 'pls.aciklama',
						vade: vadeSql, karsiodemetarihi: vadeSql, bedel: 'sum(har.bedel)', dvbedel: 'sum(har.karsidvbedel)',
						althesapkod: 'har.cariitn', althesapadi: 'alth.aciklama', dvkod: `dbo.emptycoalesce(alth.dvkod, car.dvkod)`,
						refkod: 'har.banhesapkod', refadi: 'bhes.aciklama', dvkur: 'fis.dvkur', fisaciklama: 'har.aciklama', detaciklama: 'fis.aciklama'
					})
				})
			],
			masraf: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; sent.fisHareket('posfis', 'posilkhar').fis2PlasiyerBagla().har2AltHesapBagla().har2BankaHesapBagla();
					wh.fisSilindiEkle().add(`fis.fistipi = 'AL'`, `har.masraf <> 0`)
				}).hvDuzenleIslemi(({ hv }) => {
					let {cariGenel} = app.params, {kullanim: k} = cariGenel;
					let vadeSql = k.posVadelendirmeNakdeDonusummu ? 'har.nakdedonusumvade' : k.posVadelendirmeSerbestmi ? 'har.vade' : 'fis.tarih';
					$.extend(hv, {
						kaysayac: 'fis.kaysayac', oncelik: '120', unionayrim: `'POS'`, kayittipi: `'POSB'`,
						anaislemadi: `(case when fis.almsat = 'T' then 'POS Tahsil Bonus' else 'Kr.Kart Ödeme Bonus' end)`,
						islemadi: `(case when fis.almsat = 'T' then 'POS ile Tahsil' else 'Kr.Kart ile Ödeme' end)`,
						ba: `(case when rtrim(fis.almsat + fis.iade) in ('T', 'AI') then 'A' else 'B' end)`,
						must: 'har.ticmustkod', asilmust: 'har.must', plasiyerkod: 'fis.plasiyerkod', plasiyeradi: 'pls.aciklama',
						vade: vadeSql, karsiodemetarihi: vadeSql, bedel: 'sum(har.masraf)', dvbedel: '0',
						althesapkod: 'har.cariitn', althesapadi: 'alth.aciklama',
						refkod: 'har.banhesapkod', refadi: 'bhes.aciklama', fisaciklama: 'har.aciklama', detaciklama: 'fis.aciklama'
					})
			   })
			]
		});
		return this
	}
	uniDuzenle_finans({ uygunluk, liste }) {
		$.extend(liste, {
			kasa$hizmet$topluIslem: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; sent.fisHareket('finansfis', 'finanshar')
						.fis2IslBagla_leftJoin().har2KatDetayBagla().fis2PlasiyerBagla()
						.fis2KasaBagla().har2AltHesapBagla().har2HizmetBagla()
					let fisTipi = uygunluk.kasa ? 'KC' : uygunluk.hizmet ? 'CH' : 'CI';
					wh.fisSilindiEkle().degerAta(fisTipi, 'fis.fistipi')
				}).hvDuzenleIslemi(({ hv }) => {
					let fisNoxClause = `(case when har.belgeno = 0 then fis.fisnox else har.belgenox end)`, vadeSql = `coalesce(har.vade, har.belgetarih, fis.fisvade, fis.tarih)`;
					$.extend(hv, {
						kaysayac: 'har.kaysayac', fisektipi: 'fis.almsat', unionayrim: `'Fin'`, fistipi: `(fis.fistipi + fis.ba)`,
						oncelik: `(case when fis.fistipi = 'CI' and fis.ozeltip = 'D' then 0 else 1 end)`, vade: vadeSql, karsiodemetarihi: vadeSql,
						islemkod: `(case when fis.fistipi = 'CI' then fis.carislkod when fis.fistipi = 'CH' then har.hizmetkod else '' end)`,
						islemadi: `(case when fis.fistipi = 'CI' then isl.aciklama when fis.fistipi = 'CH' then hiz.aciklama
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
						dvkur: `(case when har.karsidvvar = '' then har.dvkur else har.karsidvkur end)`, riskdurumu: `'V'`, detaciklama: 'fis.aciklama',
						fisaciklama: `(case when fis.fistipi = 'KC' then har.aciklama else dbo.hizmetack(fis.tarih, fis.seri, fis.no, har.aciklama) end)`
					})
				})
			],
			serbestMeslek: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; sent.fisHareket('finansfis', 'finanshar')
						.fis2IslBagla_leftJoin().har2KatDetayBagla().fis2KasaBagla().fis2PlasiyerBagla().har2AltHesapBagla().har2HizmetBagla()
					wh.fisSilindiEkle().add(`fis.fistipi = 'SM'`)
				}).hvDuzenleIslemi(({ hv }) => {
					let fisNoxClause = `(case when har.belgeno=0 then fis.fisnox else har.belgenox end)`, vadeSql = `coalesce(har.vade, har.belgetarih, fis.fisvade, fis.tarih)`;
					$.extend(hv, {
						kaysayac: 'har.kaysayac', fisektipi: 'fis.ozeltip', oncelik: '1', unionayrim: `'Fin'`, kayittipi: `'SRBMES'`, fistipi: '(fis.fistipi + fis.ba)',
						anaislemadi: `'Serbest Meslek'`, islemkod: 'har.hizmetkod', islemadi: 'hiz.aciklama', tarih: 'coalesce(har.belgetarih, fis.tarih)', ba: 'fis.ba',
						vade: vadeSql, karsiodemetarihi: vadeSql, seri: `(case when har.belgeno = 0 then fis.seri else har.belgeseri end)`,
						noyil: `(case when har.belgeno = 0 then 0 else har.belgenoyil end)`, fisno: `(case when har.belgeno = 0 then fis.no else har.belgeno end)`,
						fisnox: fisNoxClause, disfisnox: fisNoxClause, must: 'fis.fisticmustkod', asilmust: 'fis.fismustkod', althesapkod: 'har.cariitn', althesapadi: 'alth.aciklama',
						kdetay: 'kdet.kdetay', takipno: 'har.takipno', riskdurumu: `'V'`, detaciklama: 'fis.aciklama',
						bedel: 'har.bedel', dvbedel: `(case when har.karsidvvar = '' then har.dvbedel else har.karsidvbedel end)`,
						acikkisim: 'har.acikkisim', dvkod: `dbo.emptycoalesce(alth.dvkod, car.dvkod)`, dvkur: `(case when har.karsidvvar = '' then har.dvkur else har.karsidvkur end)`,
						fisaciklama: `dbo.hizmetack(fis.tarih, fis.seri, fis.no, har.aciklama)`
					})
				})
			]
		});
		return this
	}
	uniDuzenle_genelDekont({ uygunluk, liste }) {
		$.extend(liste, {
			genelDekont$virman: [new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
				let {where: wh} = sent; sent.fisHareket('geneldekontfis', 'geneldekonthar')
					.leftJoin('fis', 'muhisl isl', 'fis.islkod = isl.kod').har2KatDetayBagla()
					.leftJoin('har','geneldekonthar dig', ['har.fissayac = dig.fissayac', 'dig.seq = (case when har.seq % 2 = 0 then har.seq - 1 else har.seq + 1 end)'])
					.har2AltHesapBagla().leftJoin('dig', 'carmst dcar', 'dig.must = dcar.must');
				wh.fisSilindiEkle();
				if (uygunluk.genelDekont) { wh.add(`fis.ozeltip = ''`, `har.kayittipi = 'CR'`) }
				if (uygunluk.virman) { wh.add(`fis.ozeltip = 'C'`) }
			}).hvDuzenleIslemi(({ hv }) => {
				$.extend(hv, {
					kaysayac: 'har.kaysayac', oncelik: '20', unionayrim: `'GDek'`, kayittipi: `'GDEK'`, anaislemadi: `'Genel Dekont'`,
					must: 'har.ticmustkod', asilmust: 'har.must', islemkod: `(case when fis.ozeltip = 'C' then '' else fis.islkod end)`,
					islemadi: `(case when fis.ozeltip='C' then 'Cari Virman' else isl.aciklama end)`,
					ba: 'har.ba', vade: 'coalesce(har.vade, fis.tarih)', althesapkod: 'har.cariitn',  takipno: 'har.takipno',
					refkod: `(case when fis.ozeltip='C' then dig.must else '' end)`,  refadi: `(case when fis.ozeltip='C' then dcar.birunvan else '' end)`,
					fisaciklama: 'har.aciklama', detaciklama: 'fis.aciklama'
				})
			})]
		});
		return this
	}
	uniDuzenle_cariTahsilatOdeme({ uygunluk, liste }) {
		$.extend(liste, {
			cariTahsilatOdeme: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; sent.fisHareket('carifis', 'carihar').fis2PlasiyerBagla()
						.fromIliski('tahsilsekli tsek', 'har.tahseklino = tsek.kodno');
					wh.fisSilindiEkle().add(`tsek.tahsiltipi > ''`)
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kaysayac: 'har.kaysayac', oncelik: `(case when fis.ba = 'A' then 240 else 210 end)`,
						unionayrim: `'Cari'`, kayittipi: `'CRHAR'`, must: 'fis.ticmustkod', asilmust: 'fis.must',
						anaislemadi: `'Cari Tahsilat/Ödeme'`, islemadi: `(case when fis.ba = 'B' then 'Cari Ödeme' else 'Cari Tahsilat' end)`,
						ba: `dbo.tersba(fis.ba)`, althesapkod: 'har.detalthesapkod', refkod: 'LTRIM(str(har.tahseklino))', refadi: 'tsek.aciklama',
						fisaciklama: 'har.aciklama', detaciklama: 'fis.aciklama'
					})
				})
			]
		});
		return this
	}
	uniDuzenle_cekSenet({ uygunluk, liste }) {
		let {cariGenel} = app.params, {cekSenetDevirCariyeIslenir} = cariGenel ?? {};
		$.extend(liste, {
			cekSenet: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent;sent.fromAdd('csfis fis')
						.fis2PlasiyerBagla().fis2AltHesapBagla_eski()
						.fromIliski('csportfoy prt', 'fis.portfkod = prt.kod');
					wh.fisSilindiEkle().add(`fis.iade = ''`)
						.inDizi(['BC', 'BS', 'AL'], 'fis.fistipi')    /* İlk Alınan veya İlk Verilen */
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kaysayac: 'fis.kaysayac', oncelik: '15', unionayrim: `'CekSen'`, kayittipi: `(fis.belgetipi + 'CSFIS')`, iceriktipi: `'CSFIS'`,
						fistipi: 'fis.fistipi', iade: 'fis.iade', anaislemadi: `'Çek/Senet'`, must: 'fis.fisticciranta', asilmust: 'fis.fisciranta',
						plasiyerkod: 'fis.plasiyerkod', althesapkod: 'fis.cariitn', takipno: 'fis.takipno',
						refkod: 'fis.portfkod', refadi: 'prt.aciklama', ba: `dbo.csba(fis.fistipi, fis.iade)`,
						islemadi: `dbo.csacik2(fis.belgetipi, '', fis.fistipi, fis.iade)`,
						vade: 'coalesce(har.vade, fis.tarih)', bedel: 'fis.toplambedel', dvbedel: 'fis.toplamdvbedel',
						fisaciklama: 'har.aciklama', detaciklama: 'fis.aciklama'
					})
				}),
				cekSenetDevirCariyeIslenir ? (
					new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
						let {where: wh} = sent; sent.fisHareket('csfis', 'csilkhar')
							.fis2PlasiyerBagla().fis2AltHesapBagla_eski()
							.fromIliski('csportfoy prt', 'fis.portfkod = prt.kod').fromIliski('banbizhesap bhes', 'fis.banhesapkod = bhes.kod');
						wh.fisSilindiEkle().add(`fis.iade = ''`)
							.inDizi(['D', 'H'], 'fis.fistipi')
					}).hvDuzenleIslemi(({ hv }) => {
						$.extend(hv, {
							kaysayac: 'fis.kaysayac', oncelik: '15', unionayrim: `'CekSen'`, kayittipi: `(fis.belgetipi + 'CSILK')`, iceriktipi: `'CSILK'`,
							fistipi: 'fis.fistipi', iade: 'fis.iade', anaislemadi: `'Çek/Senet'`, must: 'har.ciranta', asilmust: 'har.ciranta',
							islemadi: `dbo.csacik2(fis.belgetipi, '', fis.fistipi, fis.iade)`, ba: `'A'`,
							plasiyerkod: 'fis.plasiyerkod', vade: 'coalesce(fis.ortalamavade, fis.tarih)', bedel: 'SUM(har.bedel)', dvbedel: 'SUM(har.dvbedel)',
							althesapkod: 'fis.cariitn', takipno: 'fis.takipno', refkod: `(case when fis.fistipi = 'H' then fis.banhesapkod else fis.portfkod end)`,
							refadi: `(case when fis.fistipi = 'H' then bhes.aciklama else prt.aciklama end)`, fisaciklama: 'fis.aciklama'
						})
					})
				) : null,
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; sent.fisHareket('csfis', 'csdigerhar')
						.fis2PlasiyerBagla().fis2BankaHesapBagla().fis2AltHesapBagla_eski()
						.fromIliski('csilkhar bel', 'har.ilksayac = bel.kaysayac')
						.fromIliski('csportfoy prt', 'fis.portfkod = prt.kod');
					wh.fisSilindiEkle().inDizi(['BC', 'BS', '3S', 'AL'], 'fis.fistipi')    /* ?? - İade kontrolü yapılmayacak */
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kaysayac: 'har.kaysayac', oncelik: '15', unionayrim: `'CSDiger'`, kayittipi: `(fis.belgetipi + 'CSDIG')`,
						iceriktipi: `'CSDIG'`,  fistipi: 'fis.fistipi', iade: 'fis.iade', anaislemadi: `'Çek/Senet'`,
						islemadi: `dbo.csacik2(fis.belgetipi, '', fis.fistipi, fis.iade)`, detaciklama: 'fis.aciklama',
						must: 'fis.fisticciranta', asilmust: 'fis.fisciranta', ba: 'dbo.csba(fis.fistipi, fis.iade)',
						plasiyerkod: 'fis.plasiyerkod', vade: 'bel.vade', bedel: 'har.bedel', dvbedel: 'har.dvbedel',
						althesapkod: 'fis.cariitn', althesapadi: 'alth.acikama', takipno: 'fis.takipno',
						refkod: 'fis.portfkod', refadi: 'prt.aciklama', fisaciklama: 'fis.aciklama'
					})
				}),
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; sent.fisHareket('csfis', 'csdigerhar')
						.fis2PlasiyerBagla().fis2BankaHesapBagla()
						.fromIliski('csilkhar bel', 'har.ilksayac = bel.kaysayac').fis2AltHesapBagla_eski()
						.fromIliski('csportfoy prt', 'fis.portfkod = prt.kod').fromIliski('althesap haralth', 'har.ciralthesapkod = haralth.kod');
					wh.fisSilindiEkle().inDizi(['KR', 'EK', '3K'], 'fis.fistipi')    /* Karşılıksızlar */
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kaysayac: 'har.kaysayac', oncelik: '18', unionayrim: `'CekSen'`, kayittipi: `(fis.belgetipi + 'CSDIGK')`,
						iceriktipi: `'CSDIG'`,  fistipi: 'fis.fistipi', iade: 'fis.iade', anaislemadi: `'Çek/Senet'`,
						must: `(case when fis.fistipi = 'EK' then fis.fisticciranta else har.ciranta end)`,
						asilmust: `(case when fis.fistipi = 'EK' then fis.fisciranta else har.ciranta end)`,
						islemadi: `dbo.csacik2(fis.belgetipi, '', fis.fistipi, fis.iade)`, detaciklama: 'fis.aciklama',
						ba: `(case when fis.belgetipi in ('AC', 'AS') then 'B' else 'A' end)`,
						plasiyerkod: 'fis.plasiyerkod', vade: 'bel.vade', bedel: 'har.bedel', dvbedel: 'har.dvbedel',
						althesapkod: `(case when fis.fistipi = 'EK' then fis.cariitn else har.ciralthesapkod end)`,
						althesapadi: `(case when fis.fistipi = 'EK' then alth.aciklama else haralth.aciklama end)`,
						takipno: 'fis.takipno', refkod: `(case when fis.fistipi = 'KR' then fis.banhesapkod else fis.portfkod end)`,
						refadi: `(case when fis.fistipi = 'KR' then bhes.aciklama else prt.aciklama end)`,
						fisaciklama: 'dbo.csbelgestr(fis.belgetipi, bel.belgeyil, bel.bankakod, bel.belgeno, bel.banhesapkod)'
					})
				}),
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; sent.fisHareket('csfis', 'csdigerhar')
						.fis2PlasiyerBagla().fis2AltHesapBagla_eski().fis2BankaHesapBagla()
						.fromIliski('csilkhar bel', 'har.ilksayac = bel.kaysayac')
						.fromIliski('csportfoy prt', 'fis.portfkod = prt.kod');
					wh.fisSilindiEkle().add(`fis.fistipi = '3K'`)
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kaysayac: 'har.kaysayac', oncelik: '18', unionayrim: `'CekSen'`, kayittipi: `(fis.belgetipi + 'CSDIGK')`, iceriktipi: `'CSDIG'`,
						fistipi: 'fis.fistipi', iade: 'fis.iade', anaislemadi: `'Çek/Senet'`, must: 'fis.fisticciranta', asilmust: 'fis.fisciranta',
						islemadi: `dbo.csacik2(fis.belgetipi, '', fis.fistipi, fis.iade)`, ba: `'A'`, plasiyerkod: 'fis.plasiyerkod', 
						vade: 'bel.vade', bedel: 'har.bedel', dvbedel: 'har.dvbedel', althesapkod: 'fis.cariitn', takipno: 'fis.takipno',
						fisaciklama: 'dbo.csbelgestr(fis.belgetipi, bel.belgeyil, bel.bankakod, bel.belgeno, bel.banhesapkod)', detaciklama: 'fis.aciklama'
					})
				}),
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; sent.fisHareket('csfis', 'csdigerhar').fis2PlasiyerBagla().fis2BankaHesapBagla()
					.fromIliski('csilkhar bel', 'har.ilksayac = bel.kaysayac').fis2AltHesapBagla_eski()
					.fromIliski('csportfoy prt', 'fis.portfkod = prt.kod')
					wh.fisSilindiEkle().inDizi(['KR', 'EK', '3K'], 'fis.fistipi')
					  .inDizi(['AS', 'BS'], 'fis.belgetipi').add('har.masraf > 0') 
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kaysayac: 'fis.kaysayac', oncelik: '19', unionayrim: `'CekSen'`, kayittipi: `(fis.belgetipi + 'CSMAS')`,
						fistipi: 'fis.fistipi', iade: 'fis.iade', anaislemadi: `'Senet Protesto Masrafı'`, islemadi: `'Senet Protesto Masrafı'`,
						must: 'bel.ciranta', asilmust: 'bel.ciranta', ba: `(case when fis.belgetipi in ('AC', 'AS') then 'B' else 'A' end)`,
						vade: 'fis.tarih', bedel: 'har.masraf', dvbedel: '0', althesapkod: 'har.ciralthesapkod', takipno: 'fis.takipno',
						refkod: `(case when fis.fistipi = 'KR' then fis.banhesapkod else fis.portfkod end)`,
						refadi: `(case when fis.fistipi = 'KR' then bhes.aciklama else prt.aciklama end)`,
						fisaciklama: 'dbo.csbelgestr(fis.belgetipi,bel.belgeyil,bel.bankakod,bel.belgeno,bel.banhesapkod)', detaciklama: 'fis.aciklama'
					})
				}),
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; sent.fisHareket('csfis', 'csdigerhar')
						.fis2BankaHesapBagla()
						.fromIliski('csilkhar bel', 'har.ilksayac = bel.kaysayac')
						.fromIliski('althesap alth', 'har.ciralthesapkod=alth.kod')
						.fromIliski('csportfoy prt', 'fis.portfkod = prt.kod')
					wh.fisSilindiEkle().inDizi(['AS', 'BS'], 'fis.belgetipi')
					  .add(`fis.fistipi = '3K'`, 'har.masraf > 0')
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kaysayac: 'fis.kaysayac', oncelik: '19', unionayrim: `'CekSen'`, kayittipi: `(fis.belgetipi + 'CSMAS')`,
						fistipi: 'fis.fistipi', iade: 'fis.iade', anaislemadi: `'Senet Protesto Masrafı'`,
						must: `fis.fisticciranta`, asilmust: `fis.fisciranta`, islemadi: `'Senet Protesto Masrafı'`,
						ba: `(case when fis.belgetipi in ('AC', 'AS') then 'A' else 'B' end)`,
						vade: 'fis.tarih', bedel: 'har.masraf', dvbedel: '0', althesapkod: 'har.ciralthesapkod',
						refkod: 'fis.portfkod', refadi: 'prt.aciklama', takipno: 'fis.takipno', ekAciklama: 'fis.aciklama',
						fisaciklama: 'dbo.csbelgestr(fis.belgetipi, bel.belgeyil, bel.bankakod, bel.belgeno, bel.banhesapkod)'
					})
				})
			].filter(x => !!x)
		});
		return this
	}
	uniDuzenle_ticari({ uygunluk, liste }) {
		let {zorunlu, ticariGenel} = app.params, {ozelIsaret} = zorunlu;
		let {borclanmaSekli, sipIrsBorclanmaSonrasiEsasAlinir: sifSonrasiAlinir} = ticariGenel;
		let _etkilenmeOr, getEtkilenmeOr = () => {
			if (_etkilenmeOr == null) {
				const bekIrsClause = `NOT EXISTS (SELECT xdon.fatsayac FROM irs2fat xdon WHERE fis.kaysayac = xdon.irssayac)`;
				let or = _etkilenmeOr = new MQOrClause();
				if (borclanmaSekli.faturami) { or.add(`fis.piftipi = 'F'`) }
				else if (borclanmaSekli.faturaVeBekleyenIrsaliyemi) {
					or.add(new MQOrClause([
						`fis.piftipi = 'F'`,
						new MQAndClause([`fis.piftipi = 'I'`, bekIrsClause])
					]))
				}
				else if (borclanmaSekli.irsaliyemi) {
					if (sifSonrasiAlinir) {
						or.add(new MQOrClause([
							new MQAndClause([`fis.piftipi = 'I'`, `fis.ayrimtipi <> 'KN'`]),
							new MQAndClause([`fis.piftipi = 'F'`, `fis.onctip <> 'I'`])
						]))
					}
				}
				else if (borclanmaSekli.siparismi) {
					or.add(new MQOrClause(sifSonrasiAlinir
						? [
							`fis.piftipi = 'F'`,
							new MQAndClause([`fis.piftipi = 'I'`, `fis.onctip <> 'KN'`, bekIrsClause])
						]
						: new MQAndClause([`fis.piftipi = 'F'`, `fis.onctip = ''`])
				  ))
				}
			}
			return _etkilenmeOr
		}
		$.extend(liste, {
			ticari: [
				(borclanmaSekli.siparismi ?
					new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
						let {where: wh} = sent; sent.fromAdd('sipfis fis').fis2PlasiyerBagla().fis2StokIslemBagla().fis2AltHesapBagla_eski();
						wh.fisSilindiEkle().add(`fis.onaytipi = ''`, 'fis.bdevirdir = 0', `fis.caridisi = ''`, `fis.kapandi = ''`)
					}).hvDuzenleIslemi(({ hv }) => {
						$.extend(hv, {
							kaysayac: 'fis.kaysayac', oncelik: '1', unionayrim: `'SipEM'`, kayittipi: `'SIPA'`, fistipi: 'fis.almsat', iade: `''`,
							must: 'fis.ticmust', asilmust: 'fis.must', anaislemadi: `'Çek/Senet'`, islemkod: 'fis.islkod',
							islemadi: `(case fis.ayrimtipi when 'EX' then 'Emanet Sip.' when 'KN' then 'Konsinye Sip.' when 'IH' then 'İhracat Sip.'' when 'IK' then 'İhraç Kaydıyla Sip.' else ''(Sip) '' + RTRIM(isl.aciklama) end)`,
							ba: `dbo.ticaricarba(fis.almsat, '')`, plasiyerkod: 'fis.plasiyerkod', vade: 'coalesce(fis.ortalamavade, fis.tarih)',
							karsiodemetarihi: 'coalesce(fis.karsiortodemetarihi, fis.ortalamavade, fis.tarih)', bedel: 'fis.net', dvbedel: 'fis.dvnet',
							althesapkod: 'fis.cariitn', takipno: 'fis.orttakipno', fisaciklama: 'fis.cariaciklama'
						})
					})
				: null),
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; sent.fromAdd('piffis fis').fis2PlasiyerBagla().fis2StokIslemBagla().fis2AltHesapBagla_eski();
					wh.fisSilindiEkle().add(`fis.bdevirdir = 0`, `fis.fisekayrim <> 'DV'`, getEtkilenmeOr());
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kaysayac: 'fis.kaysayac', oncelik: '1', unionayrim: `'IrsFat'`, icerikTipi: `'PIF'`, fistipi: 'fis.almsat', iade: 'fis.iade',
						kayittipi: `(case when fis.piftipi = 'P' then 'PERA' when fis.piftipi = 'I' then 'IRSA' else 'PIFA' end)`,
						anaislemadi: `dbo.iadetext(fis.iade, (case when fis.piftipi = 'P' then 'Per.Fatura' when fis.piftipi = 'I' then 'İrsaliye' else 'Fatura' end))`,
						must: 'fis.ticmust', asilmust: 'fis.must', islemkod: 'fis.islkod',
						islemadi: `dbo.iadetext(fis.iade,(case when fis.piftipi = 'P' then 'Perakende Fat.' else dbo.ticonek(fis.ayrimtipi, fis.almsat) + RTRIM(isl.aciklama) end))`,
						ba: `dbo.ticaricarba(fis.almsat, fis.iade)`, plasiyerkod: 'fis.plasiyerkod', 
						vade: 'coalesce(fis.ortalamavade, fis.tarih)', karsiodemetarihi: 'coalesce(fis.karsiortodemetarihi, fis.ortalamavade, fis.tarih)',
						bedel: 'fis.net', dvbedel: 'fis.dvnet', althesapkod: 'fis.cariitn', takipno: 'fis.orttakipno', fisaciklama: 'fis.cariaciklama'
					})
				}),
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; sent.fromAdd('sipfis fis').fis2PlasiyerBagla().fis2StokIslemBagla().fis2AltHesapBagla_eski()
						.fromIliski('piftaksit stak', 'fis.kaysayac = stak.fissayac')
						.leftJoin('stak', 'tahsilsekli tsek', 'stak.taktahsilsekli = tsek.kodno');
					wh.fisSilindiEkle().add(`fis.piftipi = 'F'`, 'fis.bdevirdir = 0', `fis.fisekayrim <> 'DV'`, getEtkilenmeOr())
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kaysayac: 'fis.kaysayac', oncelik: '2', unionayrim: `'IrsFat'`, kayittipi: `'PIFK'`, fistipi: 'fis.almsat', iade: `fis.iade`,
						anaislemadi: `(case when RTRIM(fis.almsat + fis.iade) IN ('T', 'AI') then 'Fatura Tahsilatı' else 'Fatura Ödemesi' end)`,
						must: 'fis.ticmust', asilmust: 'fis.must', islemkod: 'fis.islkod',
						islemadi: `dbo.iadetext(fis.iade, (case when fis.piftipi = 'P' then 'Perakende Fat.' else dbo.ticonek(fis.ayrimtipi, fis.almsat) + RTRIM(isl.aciklama) end))`,
						ba: `dbo.tersba(dbo.ticaricarba(fis.almsat, fis.iade))`, plasiyerkod: 'fis.plasiyerkod',
						vade: 'coalesce(stak.vade, fis.tarih)', karsiodemetarihi: 'coalesce(stak.karsiodemetarihi, stak.vade, fis.tarih)',
						bedel: 'har.bedel', dvbedel: 'har.dvbedel', althesapkod: 'fis.cariitn', takipno: 'fis.orttakipno', fisaciklama: 'fis.cariaciklama'
					})
				}),
				(ozelIsaret ? new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					let {where: wh} = sent; sent.fromAdd('piffis fis').fis2PlasiyerBagla().fis2StokIslemBagla().fis2AltHesapBagla_eski();
					wh.fisSilindiEkle().add(
						`fis.piftipi = 'F'`, `fis.ayrimtipi <> 'IK'`,
						new MQOrClause(['fis.topfiktifkdv <> 0', 'fis.topfiktifdvkdv <> 0']),
						`fis.ozelisaret = 'X'`, 'fis.bdevirdir = 0', getEtkilenmeOr(), `fis.fisekayrim <> 'DV'`
					);
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kaysayac: 'fis.kaysayac', oncelik: '2', unionayrim: `'IrsFat'`, kayittipi: `'PIFK'`,
						fistipi: 'fis.almsat', iade: `fis.iade`, anaislemadi: `'Fatura(Kdv)'`, must: 'fis.ticmust', asilmust: 'fis.must',
						islemkod: 'fis.islkod', islemadi: `'Fatura Kdvsi'`, ba: `dbo.ticaricarba(fis.almsat, fis.iade)`,
						plasiyerkod: 'fis.plasiyerkod', vade: 'fis.tarih', bedel: 'fis.topfiktifdvkdv', dvbedel: 'fis.topfiktifdvkdv',
						althesapkod: 'fis.cariitn', takipno: 'fis.orttakipno', fisaciklama: 'fis.cariaciklama'
					})
				}) : null)
			].filter(x => !!x)
		});
		return this
	}
}
