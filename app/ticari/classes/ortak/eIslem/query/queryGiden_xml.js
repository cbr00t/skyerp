class EIslemQuery_XML extends EIslemQuery_Giden {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get xmlmi() { return true }
	get table2Yapi() {
		let res = super.table2Yapi
		// res.piffis.mustSaha = res.sipfis.mustSaha = 'ticmust'
		// res.piffis.harTables = { stok: 'pifstok', hizmet: 'pifhizmet', demirbas: 'pifdemirbas', fason: 'piffsstok' }
		// res.sipfis.harTables = { stok: 'sipstok', hizmet: 'siphizmet', demirbas: 'sipdemirbas' }
		return res
	}
	getQuery(e = {}) {
		let stm = super.getQuery(e)
		stm.orderBy.add('_table', 'id', 'seq', 'harSayac')
		return stm
	}
	sentEkDuzenle(e) {
		super.sentEkDuzenle(e)
		let { sqlNull, sqlEmpty, sqlZero } = Hareketci_UniBilgi.ortakArgs
		let { table, sent: orjSent, alias = this.getAlias(table), harTables = this.getHarTables(table) } = e
		let pifFismi = this.getPIFFismi(table)
		let stFismi = this.getSTFismi(table)
		let sutMakbuzmu = this.getSutMakbuzmu(table)
		let ticarimi = !(stFismi || sutMakbuzmu)
		let liste = e.sent = []
		for (let [tip, harTable] of entries(harTables ?? {})) {
			let stokmu = tip == 'stok', demirbasmi = tip == 'demirbas'
			let hizmetmi = tip == 'hizmet' || tip == 'fason'
			let sent = orjSent.deepCopy(), { where: wh, sahalar } = sent
			// Süt makbuzunun ara/har bağlantısı üst sınıfta kurulmuştur.
			if (!sutMakbuzmu)
				sent.innerJoin('fis', `${harTable} har`, 'har.fissayac = fis.kaysayac')
			let mstTable = hizmetmi ? 'hizmst' : demirbasmi ? 'demmst' : 'stkmst'
			let kodSaha = hizmetmi ? 'hizmetkod' : demirbasmi ? 'demirbaskod' : 'stokkod'
			sent.innerJoin('har', `${mstTable} mst`, `har.${kodSaha} = mst.kod`)
			wh.add(`fis.silindi = ''`, `fis.ozelisaret <> '*'`)
			if (table == 'piffis') {
				wh.add(tip == 'fason' ? `fis.ayrimtipi IN ('FS', 'FY')` : `fis.ayrimtipi NOT IN ('FS', 'FY', 'IN')`)
				if (hizmetmi && tip != 'fason')
					wh.add(`fis.ayrimtipi <> 'PR'`)
			}
			if (ticarimi)
				wh.add(new MQOrClause([`fis.almsat = 'T' AND fis.iade = ''`, `fis.almsat = 'A' AND fis.iade = 'I'`]))
			if (sutMakbuzmu)
				wh.add(`ara.biptalmi = ''`)
			let degiskenmi = ticarimi ? `fis.degiskenvknox <> ''` : '1 = 0'
			if (ticarimi) {
				sent.leftJoin('fis', 'degiskenadres dadr', 'fis.degiskenvknox = dadr.vknox')
				sent.leftJoin('fis', 'tahsilsekli tsek', [`fis.tahtipi = 'T'`, 'fis.martahsil = tsek.kodno'])
			}
			let alici = (normal, degisken = normal) => ticarimi
				? `(CASE WHEN ${degiskenmi} THEN ${degisken} ELSE ${normal} END)` : normal
			let ilClause = alici('car.ilkod', 'dadr.ilkod')
			sent.leftJoin('car', 'caril cil', `${ilClause} = cil.kod`)
				.leftJoin('car', 'ulke culk', 'car.ulkekod = culk.kod')
			if (!sutMakbuzmu) {
				sent.leftJoin('fis', 'carmst pls', 'fis.plasiyerkod = pls.must')
					.leftJoin('fis', 'naksekli nak', 'fis.nakseklikod = nak.kod')
			}
			if (ticarimi) {
				sent.leftJoin('har', 'vergihesap kver', 'har.kdvhesapkod = kver.kod')
					.leftJoin('har', 'vergihesap tevver', 'har.dettevhesapkod = tevver.kod')
				if (!demirbasmi)
					sent.leftJoin('har', 'vergihesap sver', 'har.stopajhesapkod = sver.kod')
				if (stokmu)
					sent.leftJoin('har', 'vergihesap otver', 'har.otvhesapkod = otver.kod')
			}
			let barkodClause = sqlEmpty
			let stokRefClause = () => sqlEmpty
			if (stokmu) {
				let barkodKosullari = ['sb.stokkod = har.stokkod', 'sb.paketsayac IS NULL', `sb.varsayilan <> ''`]
				for (let { rowAttr, defaultValue } of HMRBilgi.hmrIter())
					barkodKosullari.push(`sb.${rowAttr} = ${MQSQLOrtak.sqlServerDegeri(defaultValue)}`)
				// Referanslar hareket sayısını çoğaltmamalı; eksik referansta hareket korunur.
				barkodClause = `(SELECT TOP 1 sb.refkod FROM sbarref sb WHERE ${barkodKosullari.join(' AND ')} ORDER BY sb.refkod)`
				if (ticarimi) {
					stokRefClause = attr => `(SELECT TOP 1 rd.${attr}
						FROM pzmusturunfis rf INNER JOIN pzmusturundetay rd ON rf.kaysayac = rd.fissayac
						WHERE rf.mustkod = fis.ticmust AND rf.devredisi = '' AND rd.stokkod = har.stokkod
						ORDER BY rf.kaysayac DESC, rd.seq DESC, rd.kaysayac DESC)`
				}
			}
			// Her UNION dalında aynı sırada ve aynı türde kolonlar üretilir.
			// Başlıktaki sonucBedel ile detay bedelleri birbirine karıştırılmaz.
			let f = {
				_table: table.sqlServerDegeri(), id: `${alias}.id`, fisSayac: `${alias}.kaysayac`,
				uuid: `${alias}.efatuuid`, eIslTip: `${alias}.efayrimtipi`,
				onayDurum: `${alias}.efatonaydurumu`, efImzaTS: `${alias}.efimzats`, efGonderimTS: `${alias}.efgonderimts`,
				tarih: 'fis.tarih', fisNox: sutMakbuzmu ? 'ara.makbuznox' : 'fis.fisnox',
				mustKod: alici('car.must', 'fis.degiskenvknox'),
				mustUnvan: alici('car.birunvan', 'dadr.birunvan'),
				zorunluUUID: sutMakbuzmu ? sqlEmpty : 'fis.zorunluguidstr',
				dvKod: sutMakbuzmu ? sqlEmpty : 'fis.dvkod', dvKur: sutMakbuzmu ? '1' : 'fis.dvkur',
				sonucBedel: sutMakbuzmu ? 'har.sonuc' : stFismi ? sqlZero : `(CASE WHEN RTRIM(fis.dvkod) IN ('', 'TL', 'TRL', 'TRY') THEN fis.net ELSE fis.dvnet END)`,
				bizsubekod: 'fis.bizsubekod', subeKod: 'fis.bizsubekod',
				fisTipi: stFismi ? sqlEmpty : 'fis.fistipi',
				fisAyrim: ticarimi ? 'fis.ayrimtipi' : sqlEmpty,
				faturaOzelTip: ticarimi ? `(CASE fis.ayrimtipi WHEN 'IH' THEN 'IHRACAT' WHEN 'IK' THEN 'IHRACKAYITLI' WHEN 'FS' THEN 'FASON' WHEN 'EM' THEN 'EMANET' WHEN 'KN' THEN 'KONSINYE' ELSE '' END)` : sqlEmpty,
				alimiademi: ticarimi ? `(CASE WHEN fis.almsat = 'A' AND fis.iade = 'I' THEN '*' ELSE '' END)` : sqlEmpty,
				kdvIstisnaTuru: ticarimi ? 'fis.kdvistisnaturu' : sqlEmpty,
				sevkTarih: sutMakbuzmu ? 'fis.tarih' : 'fis.sevktarihi', sevkSaat: sutMakbuzmu ? sqlNull : 'fis.sevksaati',
				ortalamavade: ticarimi ? 'fis.ortalamavade' : sqlNull,
				carsenaryo: alici(`COALESCE(NULLIF(car.efatsenaryotipi, ''), 'M')`, `'M'`),
				genelyontem: 'car.efatyontem', ozelyontem: 'car.efozelyontemkod',
				eaGonderimTipi: 'car.earsivbelgetipi', ozelDipKod: 'car.eislozeldipkod',
				adres: alici('car.biradres', 'dadr.biradres'), yore: alici('car.yore', 'dadr.yore'),
				posta: alici('car.posta', 'dadr.posta'), ilkod: ilClause, ilAdi: 'cil.aciklama',
				ulkeKod: alici('car.ulkekod', sqlEmpty), ulkeAdi: alici('culk.aciklama', sqlEmpty),
				tel1: alici('car.tel1', sqlEmpty), tel2: alici('car.tel2', sqlEmpty), tel3: alici('car.tel3', sqlEmpty),
				fax: alici('car.fax', sqlEmpty), webAdresi: alici('car.webadresi', sqlEmpty),
				eMail: alici(`CASE WHEN ${alias}.efayrimtipi IN ('', 'A') THEN COALESCE(NULLIF(car.emailearsiv, ''), car.email) ELSE car.email END`, 'dadr.email'),
				vkn: alici('car.vnumara', `CASE WHEN dadr.sahismi = '' THEN fis.degiskenvknox ELSE '' END`),
				tckn: alici('car.tckimlikno', `CASE WHEN dadr.sahismi <> '' THEN fis.degiskenvknox ELSE '' END`),
				sahismi: alici('car.sahismi', 'dadr.sahismi'), vergiDairesi: alici('car.vdaire', 'dadr.vdaire'),
				ticSicilNo: alici('car.ticaretsicilno', sqlEmpty), mersisNo: alici('car.mersisno', sqlEmpty),
				gibAlias: alici(`CASE WHEN ${alias}.efayrimtipi = 'IR' THEN COALESCE(NULLIF(car.eirsgibalias, ''), car.efatgibalias) ELSE car.efatgibalias END`, 'dadr.efatgibalias'),
				musrefkod: 'car.musrefkod', kondepomu: 'car.kondepomu',
				tlBakiye: ticarimi ? 'fis.tlacikhesap' : sqlZero, tloncekibakiye: ticarimi ? 'fis.tloncekibakiye' : sqlZero,
				dvBakiye: ticarimi ? 'fis.dvacikhesap' : sqlZero, dvoncekibakiye: ticarimi ? 'fis.dvoncekibakiye' : sqlZero,
				refnox: sutMakbuzmu ? sqlEmpty : 'fis.refstrnox',
				plasiyerkod: sutMakbuzmu ? sqlEmpty : 'fis.plasiyerkod', nakseklikod: sutMakbuzmu ? sqlEmpty : 'fis.nakseklikod',
				plasiyeradi: sutMakbuzmu ? sqlEmpty : 'pls.birunvan', naksekliadi: sutMakbuzmu ? sqlEmpty : 'nak.aciklama',
				tahtipi: ticarimi ? 'fis.tahtipi' : sqlEmpty, tahseklino: ticarimi ? 'fis.martahsil' : sqlZero,
				tahsekliadi: ticarimi ? `CASE WHEN fis.tahtipi = 'K' THEN N'Karma Tahsil' ELSE tsek.aciklama END` : sqlEmpty,
				harTable: harTable.sqlServerDegeri(), harSayac: 'har.kaysayac', seq: 'har.seq',
				kayitTipi: (hizmetmi ? 'H' : demirbasmi ? 'D' : 'S').sqlServerDegeri(),
				shKod: 'mst.kod', shAdi: 'mst.aciklama', shAdi2: 'mst.aciklama2', brm: 'mst.brm',
				brm2: stokmu ? 'mst.brm2' : sqlEmpty, brmOrani: stokmu ? 'mst.brmorani' : sqlZero,
				miktar: 'har.miktar', miktar2: stokmu ? 'har.miktar2' : sqlZero,
				koli: stokmu && !sutMakbuzmu ? 'har.koli' : sqlZero,
				fiyatVeriTipi: sutMakbuzmu ? sqlEmpty : 'har.fiyatveritipi',
				fiyat: 'har.fiyat', dvFiyat: sutMakbuzmu ? sqlZero : 'har.dvfiyat',
				brutBedel: ticarimi ? 'har.brutbedel' : sutMakbuzmu ? 'har.bedel' : 'har.belgebrutbedel',
				brutDvBedel: ticarimi ? 'har.dvbrutbedel' : sqlZero,
				bedel: 'har.bedel', dvBedel: sutMakbuzmu ? sqlZero : 'har.dvbedel',
				ekAciklama: sutMakbuzmu ? 'har.detaciklama' : 'har.ekaciklama',
				barkod: barkodClause, gtipkod: stokmu ? 'mst.gtipkod' : sqlEmpty,
				stokRefKod: stokRefClause('refkod'), stokRefAdi: stokRefClause('refadi'),
				detkdvekvergitipi: ticarimi ? 'har.detkdvekvergitipi' : sqlEmpty,
				detistisnakod: ticarimi ? 'har.detistisnakod' : sqlEmpty,
				perkdv: ticarimi ? 'har.perkdv' : sqlZero, kdvorani: ticarimi ? 'COALESCE(kver.kdvorani, 0)' : sqlZero,
				perstopaj: ticarimi ? 'har.perstopaj' : sutMakbuzmu ? 'har.stopaj' : sqlZero,
				stopajorani: ticarimi && !demirbasmi ? 'COALESCE(sver.stopajorani, 0)' : sqlZero,
				pertevkifat: ticarimi ? 'har.pertevkifat' : sqlZero,
				dettevhesapkod: ticarimi ? 'har.dettevhesapkod' : sqlEmpty,
				kdvtevoranx: ticarimi ? 'COALESCE(tevver.kdvtevoranx, 0)' : sqlZero,
				kdvtevoranpay: ticarimi ? 'COALESCE(tevver.kdvtevoranpay, 0)' : sqlZero,
				tevislemturu: ticarimi ? 'COALESCE(tevver.tevislemturu, \'\')' : sqlEmpty,
				perotv: ticarimi ? 'har.perotv' : sqlZero, otvorani: ticarimi && stokmu ? 'COALESCE(otver.otvorani, 0)' : sqlZero,
				satiriskonto: ticarimi ? 'har.satiriskonto' : sqlZero, sonuciskoran: ticarimi ? 'har.sonuciskoran' : sqlZero,
				konSubeKod: 'car.kendidetaykod'
			}
			for (let { rowAttr, numerikmi } of HMRBilgi)
				f[rowAttr] = stokmu && !sutMakbuzmu ? `har.${rowAttr}` : numerikmi ? sqlZero : sqlEmpty
			for (let { rowAttr, rowAttr_bedel } of TicIskYapi) {
				f[rowAttr] = ticarimi ? `har.${rowAttr}` : sqlZero
				f[rowAttr_bedel] = ticarimi ? `har.${rowAttr_bedel}` : sqlZero
			}
			sahalar.liste = []
			for (let [attr, clause] of entries(f))
				sahalar.add(`${clause} ${attr}`)
			// Sevkiyat alanları e-İrsaliye üreticisinin kendi düzenleyicisinden alınır.
			if (!sutMakbuzmu && (pifFismi || stFismi))
				EIslIrsaliye.eFisBaslikVeDetayStm_araSentDuzenle({ fisTable: table, harTable, sent, uni: null })
			else
				sahalar.add(['teslimAdres', 'teslimYore', 'teslimIlKod', 'teslimIlAdi', 'teslimPosta', 'plaka',
					'sofor1Adi', 'sofor1VknTckn', 'sofor2Adi', 'sofor2VknTckn', 'sofor3Adi', 'sofor3VknTckn',
					'nakVknTckn', 'nakUnvan', 'nakYore', 'nakIlAdi'].map(k => `${sqlEmpty} ${k}`))
			liste.push(sent)
		}
	}
}
