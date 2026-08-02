(function() {
	let cls = DRapor_KarZararTablosu
	cls.QueryCtx_GelirGider = class QueryCtx_GelirGider extends cls.QueryCtx {
		constructor(e = {}) {
			super(e)
		}
		clausesDuzenle({ result: res }) {
			super.clausesDuzenle(...arguments)
			let { sqlZero } = this.sqlConsts
			let { kdvliBedel, kzMaliyetten, smYontem } = this.params
			let { kdvliEk } = res    // ortak seviyede atanmıştı: { kdvliBedel ? (' + har.perkdv') : '' }
			
			extend(res, {
				finCiro: kdvliBedel ? 'har.bedel' : 'har.brutbedel',
				ticCiro: `(har.bedel - har.dipiskonto${kdvliEk})`
			})
		}
		
		uniDuzenle(e) {
			let { uni, sqlConsts, params, clauses: cl, satisTablomu, gidermi, tables } = this
			let { sqlEmpty, sqlZero } = sqlConsts
			let { sadeceStoklar, kzMaliyetten } = params
			if (sadeceStoklar)
				return false

			// gelir-gider
			;{
				let sent = this.fisHarUniEkle('finansfis', 'finanshar')
				let { where: wh, sahalar } = sent
				this.sentDuzenle_gelirGiderOrtak({ sent })
				wh.inDizi(['CH', 'KH', 'HH'], 'fis.fistipi')
				// hiz.gelirtablotipi>'' gerekli mi ??

				if (satisTablomu) {
					// satis tablosu
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`'H' kayitTipi`,
						'har.hizmetkod shKod', 'hiz.aciklama shAdi',
						'hiz.brm', `${sqlEmpty} brm2`,
						'SUM(har.miktar) miktar', `${sqlZero} miktar2`,
						`SUM(case when fis.ba = 'B' then ${cl.finCiro} else 0 end) brutBedel`,
						`${sqlZero} topIsk`,
						`SUM(case when fis.ba = 'B' then ${cl.finCiro} else 0 end) ciro`,
						`SUM(case when fis.ba = 'A' then ${cl.finCiro} else 0 end) maliyet`
					)
				}
				else {
					// gelir-gider tablolari
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`(case when fis.ba = 'B' then 'GL' else 'GD' end) islKayitTipi`,
						`(case hiz.tip when 'G' then 'GD' when '' then 'GL' else '' end) hizKayitTipi`,
						'har.hizmetkod shKod', 'hiz.aciklama shAdi',
						`SUM(${cl.finCiro}) bedel`
					)
				}
				this.hizmetGrupla(sent, satisTablomu)
			}
			
			// kr kart masraf
			;{
				let sent = this.fisHarUniEkle('posfis', 'posilkhar')
				let { where: wh, sahalar } = sent
				this.sentDuzenle_gelirGiderOrtak({ sent })
				wh.degerAta('MS', 'fis.fistipi')
				if (satisTablomu) {
					// satis tablosu
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`'H' kayitTipi`,
						'har.hizmetkod shKod', 'hiz.aciklama shAdi',
						'hiz.brm', `${sqlEmpty} brm2`,
						`${sqlZero} miktar`, `${sqlZero} miktar2`,
						`${sqlZero} brutBedel`,
						`${sqlZero} topIsk`,
						`${sqlZero} ciro`,
						`SUM(${cl.finCiro}) maliyet`
					)
				}
				else {
					// gelir-gider tablolari
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`'GD' islKayitTipi`,
						`(case hiz.tip when 'G' then 'GD' when '' then 'GL' else '' end) hizKayitTipi`,
						'har.hizmetkod shKod', 'hiz.aciklama shAdi',
						`SUM((case when fis.iade = 'I' then -1 else 1 end) * ${cl.finCiro}) bedel`
					)
				}
				this.hizmetGrupla(sent, satisTablomu)
			}

			// pos nakde donusum komisyon
			;{
				let sent = this.fisHarUniEkle('posfis', 'posilkhar')
				let { where: wh, sahalar } = sent
				this.sentDuzenle_gelirGiderOrtak({ sent, hizmetKodClause: 'har.masrafkomhizkod' })
				wh
					.degerAta('T', 'fis.almsat')
					.degerAta('ND', 'fis.fistipi')
					.add(`har.olasikomisyon <> 0`)
				if (satisTablomu) {
					// satis tablosu
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`'H' kayitTipi`,
						'har.masrafkomhizkod shKod', `(case when har.masrafkomhizkod = '' then 'Pos Nakde Dön.Komisyon' else hiz.aciklama end) shAdi`,
						`${sqlEmpty} brm`, `${sqlEmpty} brm2`,
						`${sqlZero} miktar`, `${sqlZero} miktar2`,
						`${sqlZero} brutBedel`,
						`${sqlZero} topIsk`,
						`${sqlZero} ciro`,
						`SUM(har.olasikomisyon) maliyet`
					)
				}
				else {
					// gelir-gider tablolari
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`'GD' islKayitTipi`,
						`'GD' hizKayitTipi`,
						'har.masrafkomhizkod shKod', `(case when har.masrafkomhizkod = '' then 'Pos Nakde Dön.Komisyon' else hiz.aciklama end) shAdi`,
						`SUM(har.olasikomisyon) bedel`
					)
				}
				this.hizmetGrupla(sent, satisTablomu)
			}

			// pos nakde donusum komisyon - katki payi
			;{
				let sent = this.fisHarUniEkle('posfis', 'posilkhar')
				let { where: wh, sahalar } = sent
				this.sentDuzenle_gelirGiderOrtak({ sent, hizmetKodClause: 'har.masrafkathizkod' })
				wh
					.degerAta('T', 'fis.almsat')
					.degerAta('ND', 'fis.fistipi')
					.add(`har.olasikatkipayi <> 0`)
				if (satisTablomu) {
					// satis tablosu
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`'H' kayitTipi`,
						'har.masrafkathizkod shKod', `(case when har.masrafkathizkod = '' then 'Pos Nakde Dön. Katkı Payı' else hiz.aciklama end) shAdi`,
						`${sqlEmpty} brm`, `${sqlEmpty} brm2`,
						`${sqlZero} miktar`, `${sqlZero} miktar2`,
						`${sqlZero} brutBedel`,
						`${sqlZero} topIsk`,
						`${sqlZero} ciro`,
						`SUM(har.olasikatkipayi) maliyet`
					)
				}
				else {
					// gelir-gider tablolari
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`'GD' islKayitTipi`,
						`'GD' hizKayitTipi`,
						'har.masrafkathizkod shKod', `(case when har.masrafkathizkod = '' then 'Pos Nakde Dön. Katkı Payı' else hiz.aciklama end) shAdi`,
						`SUM(har.olasikatkipayi) bedel`
					)
				}
				this.hizmetGrupla(sent, satisTablomu)
			}

			// havale eft masrafi
			;{
				let sent = this.fisHarUniEkle('hefis', 'hehar')
				let { where: wh, sahalar } = sent
				this.sentDuzenle_gelirGiderOrtak({ sent, hizmetKodClause: 'har.masrafhizkod' })
				wh.add(`har.masraf <> 0`)
				if (satisTablomu) {
					// satis tablosu
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`'H' kayitTipi`,
						'har.masrafhizkod shKod', `(case when har.masrafhizkod = '' then 'Havale/EFT Masrafı' else hiz.aciklama end) shAdi`,
						`${sqlEmpty} brm`, `${sqlEmpty} brm2`,
						`${sqlZero} miktar`, `${sqlZero} miktar2`,
						`${sqlZero} brutBedel`,
						`${sqlZero} topIsk`,
						`${sqlZero} ciro`,
						`SUM(har.masraf) maliyet`
					)
				}
				else {
					// gelir-gider tablolari
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`'GD' islKayitTipi`,
						`'GD' hizKayitTipi`,
						'har.masrafhizkod shKod', `(case when har.masrafhizkod = '' then 'Havale/EFT Masrafı' else hiz.aciklama end) shAdi`,
						`SUM(har.masraf) bedel`
					)
				}
				this.hizmetGrupla(sent, satisTablomu)
			}

			// fatura hizmet - irs hizmet veya sp hizmet olmayacagi dusunuldu
			;{
				let sent = this.fisHarUniEkle('piffis', 'pifhizmet')
				let { where: wh, sahalar } = sent
				this.sentDuzenle_gelirGiderOrtak({ sent, ticarimi: true })
				wh
					.inDizi(['P', 'F'], 'fis.piftipi')
					.notDegerAta('IN', 'fis.ayrimtipi')    // 'intaç' alınmaz
				if (satisTablomu) {
					// satis tablosu
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`'H' kayitTipi`,
						'har.hizmetkod shKod', 'hiz.aciklama shAdi',
						`${sqlEmpty} brm`, `${sqlEmpty} brm2`,
						`${sqlZero} miktar`, `${sqlZero} miktar2`,
						`SUM(case when fis.almsat = 'T' then ${cl.ticCiro} else 0 end) brutBedel`,
						`${sqlZero} topIsk`,
						`SUM(case when fis.almsat = 'T' then ${cl.ticCiro} else 0 end) ciro`,
						`SUM(case when fis.almsat = 'T' then 0 else ${cl.ticCiro} end) maliyet`
					)
				}
				else {
					// gelir-gider tablolari
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`(case when fis.almsat = 'T' then 'GL' else 'GD' end) islKayitTipi`,
						`(case hiz.tip when 'G' then 'GD' when '' then 'GL' else '' end) hizKayitTipi`,
						'har.hizmetkod shKod', `COALESCE(har.degiskenadi, hiz.aciklama) shAdi`,
						`SUM(${cl.ticCiro}) bedel`    // iade ise bedeller negatif gelir
					)
				}
				this.hizmetGrupla(sent, satisTablomu)
			}

			// fason hizmet/fiyat farki hizmet - satis icin mutlaka var
			if (satisTablomu || !kzMaliyetten) {
				let sent = this.fisHarUniEkle('piffis', 'piffsstok')
				let { where: wh, sahalar } = sent
				this.sentDuzenle_gelirGiderOrtak({ sent, ticarimi: true })
				wh
					.degerAta('F', 'fis.piftipi')
					.inDizi(['FS', 'FY'], 'fis.ayrimtipi')
				if (satisTablomu) {
					// satis tablosu
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`'H' kayitTipi`,
						'har.hizmetkod shKod', 'hiz.aciklama shAdi',
						`${sqlEmpty} brm`, `${sqlEmpty} brm2`,
						`${sqlZero} miktar`, `${sqlZero} miktar2`,
						`SUM(case when fis.almsat = 'T' then ${cl.ticCiro} else 0 end) brutBedel`,
						`${sqlZero} topIsk`,
						`SUM(case when fis.almsat = 'T' then ${cl.ticCiro} else 0 end) ciro`,
						`SUM(case when fis.almsat = 'T' then 0 else ${cl.ticCiro} end) maliyet`
					)
				}
				else {
					// gelir-gider tablolari
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`(case when fis.almsat = 'T' then 'GL' else 'GD' end) islKayitTipi`,
						`(case hiz.tip when 'G' then 'GD' when '' then 'GL' else '' end) hizKayitTipi`,
						'har.hizmetkod shKod', `COALESCE(har.degiskenadi, hiz.aciklama) shAdi`,
						`SUM(${cl.ticCiro}) bedel`    // iade ise bedeller negatif gelir
					)
				}
				this.hizmetGrupla(sent, satisTablomu)
			}

			// satis dip nakliye
			//    alim ise kzMaliyettenmi sorulmali - nakliye alimda maliyete girer, satista gelire girmez
			if (satisTablomu || !kzMaliyetten) {
				// pifdiphizmet icin - .bedel hep pozitiftir
				let cl_ticCiro = `(case when fis.iade = 'I' then 0 - har.bedel else har.bedel end)`
				
				let sent = this.fisHarUniEkle('piffis', 'pifdiphizmet')
				let { where: wh, sahalar } = sent
				this.sentDuzenle_gelirGiderOrtak({ sent, ticarimi: true })
				wh
					.degerAta('F', 'fis.piftipi')
					.degerAta('NK', 'har.anatip')
					.notDegerAta('IN', 'fis.ayrimtipi')    // 'intaç' alınmaz
				if (satisTablomu) {
					// satis tablosu
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`'H' kayitTipi`,
						'har.hizmetkod shKod', 'hiz.aciklama shAdi',
						`${sqlEmpty} brm`, `${sqlEmpty} brm2`,
						`${sqlZero} miktar`, `${sqlZero} miktar2`,
						`SUM(${cl_ticCiro}) brutBedel`,
						`${sqlZero} topIsk`,
						`SUM(${cl_ticCiro}) ciro`,
						`SUM(case when fis.almsat = 'T' then 0 else ${cl_ticCiro} end) maliyet`
					)
				}
				else {
					// gelir-gider tablolari
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`(case when fis.almsat = 'T' then 'GL' else 'GD' end) islKayitTipi`,
						`(case hiz.tip when 'G' then 'GD' when '' then 'GL' else '' end) hizKayitTipi`,
						'har.hizmetkod shKod', `hiz.aciklama shAdi`,
						`SUM(${cl_ticCiro}) bedel`    // iade ise bedeller negatif gelir
					)
				}
				this.hizmetGrupla(sent, satisTablomu)
			}

			// dekont hizmet
			;{
				// pifdiphizmet icin - .bedel hep pozitiftir
				let sent = this.fisHarUniEkle('geneldekontfis', 'geneldekonthar')
				let { where: wh, sahalar } = sent
				this.sentDuzenle_gelirGiderOrtak({ sent })
				wh
					.degerAta('HZ', 'har.kayittipi')         // HD ise hizmet dagitim daima alinir - tablotipi sadece normal dekontda gecerli
					.add(new MQOrClause()
						 .degerAta('ND', 'fis.ozeltip')
						 .add(`hiz.gelirtablotipi <> ''`)    // gelir tablo tipi uygun olanlar alinir - hizmet dagitimda daima alinir
					)
				if (satisTablomu) {
					// satis tablosu
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`'H' kayitTipi`,
						'har.hizmetkod shKod', 'hiz.aciklama shAdi',
						`${sqlEmpty} brm`, `${sqlEmpty} brm2`,
						`${sqlZero} miktar`, `${sqlZero} miktar2`,
						`SUM(case when har.ba = 'B' then 0 else har.bedel end) brutBedel`,
						`${sqlZero} topIsk`,
						`SUM(case when har.ba = 'B' then 0 else har.bedel end) ciro`,
						`SUM(case when har.ba = 'B' then har.bedel else 0 end) maliyet`
					)
				}
				else {
					// gelir-gider tablolari
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`(case when har.ba = 'B' then 'GD' else 'GL' end) islKayitTipi`,
						`(case hiz.tip when 'G' then 'GD' when '' then 'GL' else '' end) hizKayitTipi`,
						'har.hizmetkod shKod', `hiz.aciklama shAdi`,
						`SUM(har.bedel) bedel`    // iade ise bedeller negatif gelir
					)
					// burada kdv anlasilmaz
				}
				this.hizmetGrupla(sent, satisTablomu)
			}

			// guleryuz online
			if (tables.gofirmahakedis) {
				let cl_topBedel = 'ekhiz.ekhizmetbedeli'		// SUM() yapma

				;{
					let sent = this.fromUniEkle('gofirmahakedis', 'ghak')
					let { where: wh, sahalar } = sent
					sent
						.innerJoin('ghak', 'gofirmaekhizmet ekhiz', 'ghak.kaysayac = ekhiz.fissayac')
						.fromIliski('gofmal2tip2hizmet fhdon', ['ghak.firmaid = fhdon.firmaid', 'ekhiz.ekhizmetid = fhdon.hizmetid'])
					this
						.hizmetBagla({ ...e, sent, kodClause: 'fhdon.hizmetkod' })
						.hizmetDurumBagla({ ...e, sent, satisTablomu })
						.takipNoBagla({ ...e, sent, kodClause: 'ghak.takipno' })
					wh
						.basiSonu(this.tarihBS, 'ghak.tarih')
						.add(`fhdon.hizmetkod <> ''`)
					if (satisTablomu) {
						// satis tablosu
						sahalar.add(
							`${sqlEmpty} bekTipi`,
							`'H' kayitTipi`,
							'fhdon.hizmetkod shKod', 'hiz.aciklama shAdi',
							`${sqlEmpty} brm`, `${sqlEmpty} brm2`,
							`${sqlZero} miktar`, `${sqlZero} miktar2`,
								// hiz.tip: { '': gelir | 'G': gider | 'T': tahakkuk }
							`SUM(case when hiz.tip = 'G' then 0 else ${cl_topBedel} end) brutBedel`,
							`${sqlZero} topIsk`,
							`SUM(case when hiz.tip = 'G' then 0 else ${cl_topBedel} end) ciro`,
							`SUM(case when hiz.tip = '' then 0 else ${cl_topBedel} end) maliyet`
						)
					}
					else {    // hizmet tipine gore gelir veya gider - tahakkuk ise: yine 'gelir'
						this.gelirGiderDurumBagla(sent)
						// gelir-gider tablolari
						sahalar.add(
							`${sqlEmpty} bekTipi`,
							`(case when hiz.tip = 'G' then 'GD' else 'GL' end) islKayitTipi`,
							`(case when hiz.tip = 'G' then 'GD' else 'GL' end) hizKayitTipi`,
							'fhdon.hizmetkod shKod', `hiz.aciklama shAdi`,
							`SUM(${cl_topBedel}) bedel`
						)
					}
					this.hizmetGrupla(sent, satisTablomu)
				}

				// tahakkuk tipi ayrica 'gelir' olarak gozukur
				if (!satisTablomu) {
					let sent = this.fromUniEkle('gofirmahakedis', 'ghak')
					let { where: wh, sahalar } = sent
					sent
						.innerJoin('ghak', 'gofirmaekhizmet ekhiz', 'ghak.kaysayac = ekhiz.fissayac')
						.fromIliski('gofmal2tip2hizmet fhdon', ['ghak.firmaid = fhdon.firmaid', 'ekhiz.ekhizmetid = fhdon.hizmetid'])
					this
						.hizmetBagla({ ...e, sent, kodClause: 'fhdon.hizmetkod' })
						.hizmetDurumBagla({ ...e, sent, satisTablomu })
						.takipNoBagla({ ...e, sent, kodClause: 'ghak.takipno' })
					wh
						//.degerAta('F', 'fis.piftipi')
						//.inDizi(['FS', 'FY'], 'fis.ayrimtipi')
						.basiSonu(this.tarihBS, 'ghak.tarih')
						.degerAta('T', 'hiz.tip')               // 'tahakkuk' tipinde olanlar
						.add(`fhdon.hizmetkod <> ''`)
					
					// tahakkuk tipindekiler - ayrica gider olarak gozukur
					// gelir-gider tablolari
					this.gelirGiderDurumBagla(sent)
					sahalar.add(
						`${sqlEmpty} bekTipi`,
						`'GD' islKayitTipi`,
						`'GD' hizKayitTipi`,
						'fhdon.hizmetkod shKod', `hiz.aciklama shAdi`,
						`SUM(${cl_topBedel}) bedel`
					)
					this.hizmetGrupla(sent, satisTablomu)
				}
			}
		}
	}

	cls.QueryCtx_Gelir = class QueryCtx_Gelir extends cls.QueryCtx_GelirGider {
		get gelirmi() { return true }
	}

	cls.QueryCtx_Gider = class QueryCtx_Gelir extends cls.QueryCtx_GelirGider {
		get gidermi() { return true }
	}
})()
