(function() {
	let cls = DRapor_KarZararTablosu
	cls.QueryCtx_AlimSatisOrtak = class QueryCtx_Satis extends cls.QueryCtx {
		clausesDuzenle({ result: res }) {
			super.clausesDuzenle(...arguments)
			let { sqlZero } = this.sqlConsts
			let { kdvliBedel, kzMaliyetten, smYontem, ozelIsaret } = this.params
			
			extend(res, {
				maliyet: (
					kzMaliyetten ? (
						smYontem.sonAlimmi ? `ROUND(stk.revizefiilialimfiyat * har.miktar, 2)` :
						smYontem.ortalamami ? `ROUND(stk.ortmalfiyat * (case when stk.smalduzbirimtipi = '2' then har.miktar2 else har.miktar end), 2)` :
						ozelIsaret ? `har.fmalhammadde + har.fmalmuh` : `har.malhammadde + har.malmuh`
					)
					: sqlZero
				)
			})
		}
		
		uniDuzenle(e = {}) {
			let { uni, sqlConsts, params, clauses: cl } = this
			let { sqlEmpty, sqlZero } = sqlConsts
			let { sadeceStoklar, bekSipVeIrs, kzMaliyetten } = params
			;{
				// stok-hizmet
				;{
					let sent = this.pifUniEkle('pifstok')
					let { where: wh, sahalar } = sent
					sent
						.har2StokBagla()
						.stokYardimciBagla()
					wh.add('grp.bkarzararalinmaz = 0')
					sahalar.add(
						`(case when fis.piftipi in ('F', 'P') then '' else fis.piftipi end) bekTipi`,
						`'S' kayitTipi`, `har.stokkod shKod`, `COALESCE(har.degiskenadi, stk.aciklama) shAdi`,
						'stk.brm', 'stk.brm2',
						'SUM(har.miktar) miktar', 'SUM(har.miktar2) miktar2',
						`SUM(har.brutbedel${cl.kdvliEk}) brutBedel`,
						`SUM((har.brutbedel - har.bedel) + har.dipiskonto) topIsk`,
						`SUM(har.bedel - har.dipiskonto${cl.kdvliEk}) ciro`,
						`${cl.maliyet.asSumDeger()} maliyet`
					)
					this.stokGrupla(sent)                             // grup ve ana grup saha eklentisi
					sent.gereksizTablolariSil(['stk', 'grp'])
				}

				// demirbas
				if (!sadeceStoklar) {
					let sent = this.pifUniEkle('pifdemirbas')
					let { where: wh, sahalar } = sent
					sent
						.har2DemBagla()
						.dem2GrupBagla()
					// dem grup için kar zarara alinmama durumu yoktur
					// dem filtresi yoktur
					sahalar.add(
						`(case when fis.piftipi in ('F', 'P') then '' else fis.piftipi end) bekTipi`,
						`'D' kayitTipi`, 'har.demirbaskod shKod', 'dem.aciklama shAdi',
						'dem.brm', `${sqlEmpty} brm2`,
						'SUM(har.miktar) miktar', `${sqlZero} miktar2`,
						`SUM(har.brutbedel${cl.kdvliEk}) brutbedel`,
						'SUM((har.brutbedel - har.bedel) + har.dipiskonto) topIsk',
						`SUM(har.bedel - har.dipiskonto${cl.kdvliEk}) ciro`,
						`${sqlZero} maliyet`
					)
					this.demGrupla(sent)                                 // grup ve ana grup saha eklentisi
					sent.gereksizTablolariSil(['dem', 'grp'])
				}

				// genel dekont satis geliri
				if (sadeceStoklar) {
					let sent = this.fisHarUniEkle('geneldekontfis', 'geneldekonthar')
					let { where: wh, sahalar } = sent
					sent
						.har2StokBagla()
						.stok2GrupBagla()
					this.takipNoBagla_detay({ ...e, sent })
					wh.add(`har.kayittipi = 'GL'`)    // satis gelirinden dusmek icin
					sahalar.add(
						`'' bekTipi`,
						`'S' kayitTipi`, 'har.stokkod shkod', 'stk.aciklama shadi',
						'stk.brm', 'stk.brm2',
						`SUM(case when har.ba = 'A' then har.miktar else 0 - har.miktar end) miktar`,
						`SUM(case when har.ba = 'A' then har.miktar2 else 0 - har.miktar2 end) miktar2`,
						`SUM(case when har.ba = 'A' then har.bedel else 0 - har.bedel end) brutBedel`,
						'0 topiskonto',
						`SUM(case when har.ba = 'A' then har.bedel else 0 - har.bedel end) ciro`,
						`${cl.maliyet.asSumDeger()} maliyet`
						// burada kdv kontrolu olmaz (+perkdv gibi)
					)
					this.stokGrupla(sent)
					sent.gereksizTablolariSil(['stk'])
				}

				// eski ihr fat ve gerekirse bekleyen siparis
				if (!kzMaliyetten && bekSipVeIrs) {
					let sent = this.sipUniEkle('sipstok', 'sip2ifstok')
					let { where: wh, sahalar } = sent
					sent
						.har2StokBagla()
						.stokYardimciBagla()
					wh.add(`fis.ozeltip = ''`, `don.kaysayac IS NULL`)
					sahalar.add(
						`'S' bekTipi`,
						`'S' kayitTipi`, `har.stokkod shKod`, `COALESCE(har.degiskenadi, stk.aciklama) shAdi`,
						'stk.brm', 'stk.brm2',
						'SUM(har.miktar) miktar', 'SUM(har.miktar2) miktar2',
						`SUM(har.brutbedel${cl.kdvliEk}) brutBedel`,
						`SUM((har.brutbedel - har.bedel) + har.dipiskonto) topIsk`,
						`SUM(har.bedel - har.dipiskonto${cl.kdvliEk}) ciro`,
						`${sqlZero} maliyet`
					)
					this.stokGrupla(sent)                             // grup ve ana grup saha eklentisi
					sent.gereksizTablolariSil(['stk', 'grp'])
				}

				// sip demirbas
				if (!(kzMaliyetten || sadeceStoklar) && bekSipVeIrs) {
					let sent = this.sipUniEkle('sipdemirbas', 'sip2ifdemirbas')
					let { where: wh, sahalar } = sent
					sent
						.har2DemBagla()
						.dem2GrupBagla()
					sahalar.add(
						`'S' bekTipi`,
						`'D' kayitTipi`, `har.demirbaskod shKod`, `dem.aciklama shAdi`,
						'dem.brm', `${sqlEmpty} brm2`,
						'SUM(har.miktar) miktar', `${sqlZero} miktar2`,
						`SUM(har.brutbedel${cl.kdvliEk}) brutBedel`,
						`SUM((har.brutbedel - har.bedel) + har.dipiskonto) topIsk`,
						`SUM(har.bedel - har.dipiskonto${cl.kdvliEk}) ciro`,
						`${sqlZero} maliyet`
					)
					this.demGrupla(sent)                             // grup ve ana grup saha eklentisi
					sent.gereksizTablolariSil(['dem', 'grp'])
				}
			}
		}
	}

	cls.QueryCtx_Satis = class QueryCtx_Satis extends cls.QueryCtx_AlimSatisOrtak {
		get satismi() { return true }
		get almSat() { return 'T' }
	}

	cls.QueryCtx_Alim = class QueryCtx_Alim extends cls.QueryCtx_AlimSatisOrtak {
		get alimmi() { return true }
		get almSat() { return 'A' }
	}
})()
