(function() {
	let cls = DRapor_KarZararTablosu
	cls.Ctx = class Ctx extends CObject {
		get secimler() { return this.tanimPart?.secimler ?? {} }
		get donem() { return this.secimler?.donem.tekSecim ?? {} }
		get tarihAralik() { return this.secimler?.tarihAralik ?? {} }
		get tarihBS() { return this.secimler?.tarihBS }
		get promises_data() { return this.tanimPart?.promises_data ?? {} }
		get tables() { return this.class._tables }
		get params() {
			let { _params: res } = this
			if (res == null) {
				let { params = {} } = app
				let { zorunlu: { ozelIsaret } = {}, ticariGenel: { kullanim: ticGenel = {} }, finans = {} } = params
				let { takipNo } = ticGenel
				let { kzTabloMaliyetten: kzMaliyetten } = finans
				
				let { secimler: sec } = this
				let { bekSipVeIrs: { value: bekSipVeIrs } = {} } = sec
				let { stokMaliyetYontemi: { value: smYontem = {} } = {} } = sec
				let { sadeceStoklar: { value: sadeceStoklar } = {} } = sec
				let { kdvliBedel: { value: kdvliBedel } = {} } = sec
				let { gruplama: { tekSecim: gruplama = {} } = {} } = sec
				let { gruplamadaAnaGrup: { value: gruplamadaAnaGrup } = {} } = sec
				
				res = this._params = {
					ozelIsaret, takipNo, kzMaliyetten,
					bekSipVeIrs, smYontem, sadeceStoklar,
					kdvliBedel, gruplama, gruplamadaAnaGrup
				}
			}
			return res
		}
		
		constructor(e = {}) {
			super(e)
			let { tanimPart = e.sender } = e
			let { inst = tanimPart?.inst } = e
			let { satisTablomu = e.satismi ?? false } = e
			extend(this, { tanimPart, inst, satisTablomu })
		}
		async ilkIslemler(e) {
			this.class._tables ??= await app.sqlGetTables()
		}
	}

	cls.QueryCtx = class QueryCtx extends cls.Ctx {
		// { sqlNull, sqlEmpty, sqlZero }
		get sqlConsts() { return Hareketci_UniBilgi.ortakArgs }
		get clauses() {
			let { _clauses: res } = this
			if (res == null) {
				let e = { result: {} }
				this.clausesDuzenle(e)
				res = this._clauses = e.result
			}
			return res
		}

		constructor(e = {}) {
			super(e)
			this.uni = e.uni ?? e.stm?.sent
		}

		uniOlustur(e) {
			let uni = this.uni = new MQUnionAll()
			if (this.uniDuzenle(e) === false)
				return null
			return uni
		}
		uniDuzenle(e) { }
		clausesDuzenle({ result: res }) {
			let { kdvliBedel } = this.params
			extend(res, {
				kdvliEk: kdvliBedel ? ` + har.perkdv` : '',
				takipNo: {
					ticari: `(case when fis.takiportakdir <> '' then fis.orttakipno else har.dettakipno end)`,
					detay: 'har.takipno'
				}
			})
		}

		// Tools
		stokGrupla(sent) {
			let { where: wh, sahalar } = sent
			let { sqlConsts: { sqlEmpty } } = this
			let { gruplama, gruplamadaAnaGrup } = this.params
			if (gruplama.digermi) {    // İst. Grup
				sent.stok2IstGrupBagla()
				sahalar.add('stk.sistgrupkod grupKod', 'sigrp.aciklama grupAdi')
				if (gruplamadaAnaGrup) {
					sent.fromIliski('stkistanagrup siagrp', 'sigrp.sanagrupkod = siagrp.kod')
					sahalar.add('sigrp.sanagrupkod anaGrupKod', 'siagrp.aciklama anaGrupAdi')
				}
			}
			else {                       // Normal Grup
				sent.stok2GrupBagla()    // ** önceden yapılmıştı ama tedbir olsun. fromIliski() alias kontrollü çalışır, o yüzden sorun değil
				sahalar.add('stk.grupkod grupKod', 'grp.aciklama grupAdi')
				if (gruplamadaAnaGrup) {
					sent.stokGrup2AnaGrupBagla()
					sahalar.add('grp.anagrupkod anaGrupKod', 'agrp.aciklama anaGrupAdi')
				}
			}
			
			if (!gruplamadaAnaGrup)
				sahalar.add(`${sqlEmpty} anaGrupKod`, `${sqlEmpty} anaGrupAdi`)
		}
		hizmetGrupla(sent, satisTablomu) {
			let { where: wh, sahalar } = sent
			let { sqlConsts: { sqlEmpty } } = this
			let { gruplama, gruplamadaAnaGrup } = this.params
			if (gruplama.digermi) {      // İst. Grup
				sent.hizmet2IstGrupBagla()
				sahalar.add('hiz.histgrupkod grupKod', 'higrp.aciklama grupAdi')
				//if (satisTablomu || !gruplamadaAnaGrup)    // hizmet icin ist ana grup yoktur
				sahalar.add(`${sqlEmpty} anaGrupKod`, `${sqlEmpty} anaGrupAdi`)
			}
			else {                       // Normal Grup
				sent.hizmet2GrupBagla()    // ** önceden yapılmıştı ama tedbir olsun. fromIliski() alias kontrollü çalışır, o yüzden sorun değil
				sahalar.add('hiz.grupkod grupKod', 'grp.aciklama grupAdi')
				if (gruplamadaAnaGrup) {
					sent.hizmetGrup2AnaGrupBagla()
					sahalar.add('grp.anagrupkod anaGrupKod', 'agrp.aciklama anaGrupAdi')
				}
				else
					sahalar.add(`${sqlEmpty} anaGrupKod`, `${sqlEmpty} anaGrupAdi`)
			}
		}
		demGrupla(sent) {    // ** demirbas icin ist. grup yoktur
			let { where: wh, sahalar } = sent
			let { sqlConsts: { sqlEmpty } } = this
			let { gruplama, gruplamadaAnaGrup } = this.params
			if (gruplama.digermi) {     // İst. Grup
				sahalar.add(
					`${sqlEmpty} grupKod`, `${sqlEmpty} grupAdi`,
					`${sqlEmpty} anaGrupKod`, `${sqlEmpty} anaGrupAdi`
				)
			}
			else {    // Normal Grup
				sent.dem2GrupBagla()    // ** önceden yapılmıştı ama tedbir olsun. fromIliski() alias kontrollü çalışır, o yüzden sorun değil
				sahalar.add('dem.grupkod grupKod', 'grp.aciklama grupAdi')     // ** dem2GrupBagla için de alias yine 'grp'diger
				if (gruplamadaAnaGrup) {
					sent.demGrup2AnaGrupBagla()
					sahalar.add('grp.anagrupkod anaGrupKod', 'agrp.aciklama anaGrupAdi')
				}
				else
					sahalar.add(`${sqlEmpty} anaGrupKod`, `${sqlEmpty} anaGrupAdi`)
			}
		}
		
		pifUniEkle(harTable, almSat, ekDuzenle) {
			let fisTable = 'piffis'
			return this.ortakUniEkle(
				ekDuzenle,
				{ fisTable, harTable },   // ekDuzenle varsa gönderilecek parametreler
				({ sent }) => {
					let { secimler: sec, params: { bekSipVeIrs } } = this
					let { where: wh, sahalar } = sent
					sent
						.fisHareket(fisTable, harTable)
						.fromIliski('stkyer yer', 'har.detyerkod = yer.kod')
					if (bekSipVeIrs)
						sent.leftJoin('fis', 'irs2fat i2f', 'fis.kaysayac = i2f.irssayac')
					this.sentDuzenle_pifOrtak({ sent, almSat })
					;{
						wh
							.basiSonu(sec.yerKod, 'har.detyerkod')
							.ozellik(sec.yerAdi, 'yer.aciklama')
						// ** secimler takip... bağlantısı 'sentDuzenle_fisOrtak' kısmında
						wh.add(`yer.bkarzararaalinmaz = 0`)
					}
				}
			)
		}
		sipUniEkle(harTable, donTable, ekDuzenle) {
			let fisTable = 'sipfis'
			return this.ortakUniEkle(
				ekDuzenle,
				{ fisTable, harTable, donTable },   // ekDuzenle varsa gönderilecek parametreler
				({ sent }) => {
					let { secimler: sec, params: { bekSipVeIrs } } = this
					let { where: wh, sahalar } = sent
					sent.fisHareket(fisTable, harTable, true)    // true: innerJoin flag
					if (bekSipVeIrs)
						sent.leftJoin('har', `${donTable} don`, 'har.kaysayac = don.sipharsayac')
					this.sentDuzenle_sipOrtak({ sent })
				}
			)
		}
		
		fisHarUniEkle(fisTable, harTable, duzenle, ekDuzenle) {
			return this.ortakUniEkle(
				ekDuzenle,
				{ fisTable, harTable },
				({ sent }) => {
					sent.fisHareket(fisTable, harTable, ekDuzenle)
					this.sentDuzenle_fisOrtak({ sent })
				}
			)
		}
		fromUniEkle(table, alias, ekDuzenle) {
			return this.ortakUniEkle(
				ekDuzenle,
				{ table, alias },
				({ sent }) =>
					sent.fromAdd([table, alias].filter(Boolean).join(' '))
			)
		}
		ortakUniEkle(ekDuzenle, ekArgs = {}, duzenle) {
			let sent = new MQSent()
			let { where: wh, sahalar } = sent
			;{
				let args = { sent, where: wh, ...ekArgs }
				duzenle?.call(this, args)
				ekDuzenle?.call(this, args)
			}
			this.uni.add(sent)
			return sent
		}

		sentDuzenle_pifOrtak(e = {}) {
			let { sent } = e, { where: wh } = sent
			let { params, secimler: sec, almSat } = this
			let { bekSipVeIrs, kzMaliyetten, sadeceStoklar } = params
			
			this.sentDuzenle_fisOrtak(e)
			wh.add(new MQOrClause([
				{ inDizi: ['F', 'P'], saha: 'fis.piftipi' },
				( bekSipVeIrs ? new MQAndClause([
					`fis.piftipi = 'I'`,
					'i2f.kaysayac IS NULL'
				]) : null )
			].filter(Boolean)))
			
			if (almSat) {
				wh.degerAta(almSat, 'fis.almsat')
				if (almSat == 'T')
					wh.notDegerAta(kzMaliyetten ? 'IH' : 'IN', 'fis.ayrimtipi')
			}
			this
				.takipNoBagla_ticari(e)
				.stokBagla(e)
			
			return this
		}
		sentDuzenle_sipOrtak(e = {}) {
			let { sent } = e, { where: wh } = sent
			let { almSat } = this
			this.sentDuzenle_fisOrtak(e)
			wh
				.degerAta(almSat, 'fis.almsat')
				.add(`fis.onaytipi = ''`)
			this
				.takipNoBagla_ticari(e)
				.stokBagla(e)
			return this
		}
		sentDuzenle_gelirGiderOrtak(e = {}) {
			let { satisTablomu } = this
			let { sent, ticarimi, hizmetKodClause } = e
			let { where: wh } = sent
			ticarimi ??= false
			this.sentDuzenle_fisOrtak(e)
			this
				.hizmetBagla({ ...e, kodClause: hizmetKodClause })
				.hizmetDurumBagla({ ...e, satisTablomu })
				.takipNoBagla({ ...e, ticarimi })
			if (!satisTablomu)
				this.gelirGiderDurumBagla(sent)
			return this
		}
		sentDuzenle_fisOrtak(e = {}) {
			let { sent } = e, { where: wh } = sent
			let { tarihBS, secimler: sec } = this
			
			sent.fis2SubeBagla()
			wh
				.fisSilindiEkle()
				.add(`fis.ozelisaret <> 'X'`)
			if (tarihBS)
				wh.basiSonu(tarihBS, 'fis.tarih')
			wh
				.basiSonu(sec.subeKod, 'fis.bizsubekod')
				.ozellik(sec.subeAdi, 'sub.aciklama')
			return this
		}
		takipNoBagla_ticari(e = {}) {
			return this.takipNoBagla({ ...e, ticarimi: true })
		}
		takipNoBagla_detay(e = {}) {
			return this.takipNoBagla({ ...e, ticarimi: false })
		}
		takipNoBagla({ sent, kodClause, ticarimi } = {}) {
			let { where: wh } = sent
			let { params, clauses, secimler: sec } = this
			if (params.takipNo) {
				kodClause ||= clauses.takipNo[ticarimi ? 'ticari' : 'detay']
				sent
					.fromIliski('takipmst tak', `${kodClause} = tak.kod`)
					.fromIliski('takipgrup tgrp', 'tak.grupkod = tgrp.kod')
				wh
					.basiSonu(sec.takipKod, kodClause)
					.ozellik(sec.takipAdi, 'tak.aciklama')
					.basiSonu(sec.takipGrupKod, 'tak.grupkod')
					.ozellik(sec.takipGrupAdi, 'tgrp.aciklama')
			}
			return this
		}
		stokBagla({ sent, kodClause } = {}) {
			let { where: wh } = sent
			let { params, secimler: sec } = this
			let { sadeceStoklar } = params
			if (sadeceStoklar) {
				kodClause ||= 'har.stokkod'
				sent
					.har2StokBagla({ kodClause })
					.stokYardimciBagla()
				wh
					.basiSonu(sec.stokKod, kodClause)
					.ozellik(sec.stokAdi, 'stk.aciklama')
					.basiSonu(sec.stokGrupKod, 'stk.grupkod')
					.ozellik(sec.stokGrupAdi, 'grp.aciklama')
					.basiSonu(sec.stokAnaGrupKod, 'grp.anagrupkod')
					.ozellik(sec.stokAnaGrupAdi, 'agrp.aciklama')
					.basiSonu(sec.stokIstGrupKod, 'stk.sistgrupkod')
					.ozellik(sec.stokIstGrupAdi, 'sigrp.aciklama')
			}	
			return this
		}
		hizmetBagla({ sent, kodClause }) {
			let { where: wh } = sent
			let { sadeceStoklar } = this.params
			if (!sadeceStoklar) {
				sent
					.har2HizmetBagla({ kodClause })
					.hizmetYardimciBagla()
			}
			return this
		}
		hizmetDurumBagla({ sent, satisTablomu } = {}) {
			let { where: wh } = sent
			let st = satisTablomu ? 'S' : ''
			wh.degerAta(st, 'hiz.kztablodurumu')
			return this
		}
		gelirGiderDurumBagla(sent) {
			let { satisTablomu, gidermi } = this
			let { where: wh } = sent
			if (!satisTablomu)
				wh.inDizi(gidermi ? ['G', 'T'] : [''], 'hiz.tip')
			return this
		}
		
		stmSonIslemler({ stm }) {    // AccPanelGrid yapısı tarafından setQuery() sonrası otomatik çağrılır
			;stm.forEach(sent => {
				sent
					.groupByOlustur()
					.gereksizTablolariSil(['stk', 'grp'])
			})
			return this
		}
	}
})()
