class EIslTicariOrtak extends EIslGiden {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ticarimi() { return true }

	static uuidStm_uniDuzenle(e) {
		super.uuidStm_uniDuzenle(e)
		let { uni, ps2SayacListe, genelSentDuzenleyici: genelSentDuzenle, whereDuzenleyici: genelWHDzenle } = e
		
		let psTipVeYapilar = [
			{
				psTip: 'P', table: 'piffis',
				whereDuzenleyici: ({ sent, sent: { sahalar }, where: wh }) => {
					sent
						.fis2TicCariBagla()
						.fromIliski('degiskenadres dadr', 'fis.degiskenvknox = dadr.vknox')
					wh.notDegerAta('IN', 'fis.ayrimtipi')
					sahalar.add(
						`(case
							when fis.efayrimtipi = 'IR'
								then
									(case when fis.degiskenvknox <> ''
										then dadr.efatgibalias
										else dbo.emptycoalesce(car.eirsgibalias, car.efatgibalias)
									end)
								else
									(case when fis.degiskenvknox <> ''
										then dadr.efatgibalias
										else car.efatgibalias
									end)
								end
						 ) gibalias`
					)
				}
			},
			{
				psTip: 'S', table: 'sipfis',
				whereDuzenleyici: ({ sent, sent: { sahalar }, where: wh }) => {
					sent.fis2CariBagla()
					wh
						.degerAta('EM', 'fis.ayrimtipi')
						.degerAta('E', 'fis.ozeltip')
					sent.add(
						`(
							case when fis.efayrimtipi = 'IR'
								then dbo.emptycoalesce(car.eirsgibalias, car.efatgibalias)
								else car.efatgibalias
							end
						) gibalias`
					)
				}
			}
		]
		
		for (let { psTip, table, whereDuzenleyici: whDuzenle } of psTipVeYapilar) {
			let sayaclar = ps2SayacListe[psTip]
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent
				.fromAdd(`${table} fis`)
				.fis2TicCariBagla()
			wh
				.fisSilindiEkle()
				.add(new MQOrClause([
					`(fis.almsat = 'T' AND fis.iade = '')`,
					`(fis.almsat = 'A' AND fis.iade = 'I')`
				]))
			
			wh.inDizi(['E', 'A', 'IR', ''], 'fis.efayrimtipi')
			
			sahalar
				.add(`'${psTip}' pstip`)
				.addWithAlias('fis',
					'kaysayac fissayac', 'efatuuid uuid', 'efayrimtipi', 'tarih', 'fisnox')
			if (sayaclar)
				wh.inDizi(sayaclar, 'fis.kaysayac')
			
			if (whDuzenle || genelWHDzenle) {
				let _e = { ...e, psTip, table, uni, sent, where: sent.where };
				whDuzenle?.call?.(this, _e)
				genelWHDzenle?.call?.(this, _e)
			}
			else if (!empty(ps2SayacListe))
				continue
			
			genelSentDuzenle?.call?.(this, { ...e, psTip, table, uni, sent, where: sent.where })
			
			sent.gereksizTablolariSil()
			uni.add(sent)
		}
	}
    static getEFisBaslikVeDetayStm(e = {}) {
		e.psTip2SayacListe ??= {}
		let { whereDuzenleyici: genelWhereDuzenleyici, ps2SayacListe = e.psTip2SayacListe } = e
		let { eArsivmi } = this
		if (isFunction(ps2SayacListe))
			ps2SayacListe = ps2SayacListe.call(this, e)
		
		let uni = new MQUnionAll()
		let fhBagla = e.fhBagla = ({ psTip, sayacListe, fisTable, harTable }) => {
			let mustIlClause = `(case when fis.degiskenvknox <> '' then dadr.ilkod else car.ilkod end)`
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent
				.fisHareket(fisTable, harTable, true)
				.fis2TicCariBagla()
				.fromIliski('degiskenadres dadr', 'fis.degiskenvknox = dadr.vknox')
				.fromIliski('naksekli nak', 'fis.nakseklikod = nak.kod')
				.fromIliski('carmst pls', 'fis.plasiyerkod = pls.must')
				.fromIliski('caril cil', `${mustIlClause} = cil.kod`)
				.fromIliski('ulke culk', 'car.ulkekod = culk.kod')
				.leftJoin({ alias: 'fis', table: 'tahsilsekli tsek', iliski: [`fis.tahtipi = 'T'`, 'fis.martahsil = tsek.kodno'] })
				.leftJoin({ alias: 'fis', table: 'pifbasekaciklama basack', iliski: 'fis.kaysayac = basack.fissayac' })
				.leftJoin({ alias: 'fis', table: 'pifdipaciklama dipack', iliski: 'fis.kaysayac = dipack.fissayac' })
				.fromIliski('vergihesap kver', 'har.kdvhesapkod = kver.kod')
				.fromIliski('vergihesap tevver', 'har.dettevhesapkod = tevver.kod')
				.fromIliski('vergihesap sver', 'har.stopajhesapkod = sver.kod')
			wh
				.fisSilindiEkle()
				.inDizi(['E', 'A', 'IR', ''], 'fis.efayrimtipi')
				.inDizi(sayacListe, 'fis.kaysayac')
				.add(
					`fis.ozelisaret <> '*'`,
					new MQOrClause([
						`(fis.almsat = 'T' and fis.iade = '')`,
						`(fis.almsat = 'A' and fis.iade = 'I')`
					])
				)
			sahalar.addAll([
				`${psTip.sqlServerDegeri()} pstip`,
				`${fisTable.sqlServerDegeri()} fisTable`,
				`${harTable.sqlServerDegeri()} harTable`,
				`fis.bizsubekod`, 'fis.kaysayac fissayac', 'fis.iade', 'fis.ayrimtipi', 'fis.fistipi', 'fis.efayrimtipi',
				'fis.tarih', 'fis.fisnox', 'fis.sevktarihi sevkTarih', 'fis.sevksaati sevkSaat',
				'fis.ortalamavade', 'car.earsivbelgetipi', 'fis.kdvistisnaturu',
				`(case fis.ayrimtipi when 'IH' then 'IHRACAT' when 'IK' then 'IHRACKAYITLI' when 'FS' then 'FASON' when 'EM' then 'EMANET' when 'KN' then 'KONSINYE' else '' end) faturaozeltip`,
				`(case when fis.almsat = 'A' and fis.iade = 'I' then '*' else '' end) alimiademi`,
																						/* M: TEMEL ; T: TİCARİ ; K: KAMU */
				`(case when fis.degiskenvknox <> '' then 'M' else dbo.emptycoalesce(car.efatsenaryotipi, 'M') end) carsenaryo`,
				`car.efatyontem genelyontem`, `car.efozelyontemkod ozelyontem`, 'fis.tahtipi', 'fis.martahsil tahseklino',
				`(case when fis.tahtipi = 'K' then 'Karma Tahsil' else tsek.aciklama end) tahsekliadi`,
				'fis.plasiyerkod', 'fis.nakseklikod', 'fis.zorunluguidstr', 'fis.efatuuid uuid',
				'fis.dvkod', 'fis.dvkur', 'fis.net sonucbedel',
				`(case when fis.degiskenvknox <> '' then fis.degiskenvknox else fis.ticmust end) mustkod`,
				`(case when fis.degiskenvknox <> '' then dadr.birunvan when fis.must = '' and fis.ayrimtipi = 'PR' then 'Muhtelif Müşteri' else car.birunvan end) unvan`,
				`(case when fis.degiskenvknox <> '' then dadr.biradres else car.biradres end) adres`,
				`(case when fis.degiskenvknox <> '' then dadr.yore else car.yore end) yore`,
				`(case when fis.degiskenvknox <> '' then dadr.posta else car.posta end) posta`,
				`${mustIlClause} ilkod`, 'cil.aciklama iladi',
				`(case when fis.degiskenvknox <> '' then '' else car.ulkekod end) ulkekod`,
				`(case when fis.degiskenvknox <> '' then '' else culk.aciklama end) ulkeadi`,
				`(case when fis.degiskenvknox <> '' then '' else car.tel1 end) tel1`,
				`(case when fis.degiskenvknox <> '' then '' else car.tel2 end) tel2`,
				`(case when fis.degiskenvknox <> '' then '' else car.tel3 end) tel3`,
				`(case when fis.degiskenvknox <> '' then '' else car.fax end) fax`,
				`(case when fis.degiskenvknox <> '' then '' else car.webadresi end) webadresi`,
				`(case when fis.degiskenvknox <> '' then '' else car.posta end) posta`,
				`(case when fis.degiskenvknox <> '' then
						dadr.email
					else
					${
						eArsivmi
						  ? `(CASE WHEN car.emailearsiv = '' THEN car.email ELSE car.emailearsiv END)`
						  : 'car.email'
					}
				 end) email`,
				`(case when fis.degiskenvknox <> '' then (case when dadr.sahismi = '' then fis.degiskenvknox else '' end)
						when fis.must = '' and fis.ayrimtipi = 'PR' then ''
						else car.vnumara end) vkn`,
				`(case when fis.degiskenvknox <> '' then (case when dadr.sahismi <> '' then fis.degiskenvknox else '' end)
						when fis.must = '' and fis.ayrimtipi = 'PR' then ${TCKimlik.perakendeVKN.sqlServerDegeri()}
						else car.tckimlikno end) tckn`,
				`(case when fis.degiskenvknox <> '' then dadr.sahismi
						when fis.must = '' and fis.ayrimtipi = 'PR' then '*' else car.sahismi
					end) sahismi`,
				`(case when fis.degiskenvknox <> '' then dadr.vdaire else car.vdaire end) vergidairesi`,
				`(case when fis.degiskenvknox <> '' then '' else car.ticaretsicilno end) ticsicilno`,
				`(case when fis.degiskenvknox <> '' then '' else car.mersisno end) mersisno`,
				`(case
					when fis.efayrimtipi = 'IR'
						then
							(case when fis.degiskenvknox <> ''
								then dadr.efatgibalias
								else dbo.emptycoalesce(car.eirsgibalias, car.efatgibalias)
							end)
						else
							(case when fis.degiskenvknox <> ''
								then dadr.efatgibalias
								else car.efatgibalias
							end)
						end
				 ) gibalias`,
				`(case when fis.degiskenvknox <> '' then '' else car.webadresi end) webadresi`,
				'pls.birunvan plasiyeradi', 'nak.aciklama naksekliadi', 'car.musrefkod', 'car.kondepomu',
				`fis.tlacikhesap tlbakiye`, `fis.tloncekibakiye`, `fis.dvacikhesap dvbakiye`, `fis.dvoncekibakiye`,
				'fis.refstrnox refnox', /*'fis.borsatescilvarmi', 'fis.kunyenox',*/ 'basack.basaciklama', 'dipack.aciklama dipaciklama',
				'har.seq', 'har.miktar', 'har.fiyat', 'har.dvfiyat', 'har.brutbedel', 'har.dvbrutbedel', 'har.bedel', 'har.dvbedel',
				'har.ekaciklama', 'har.detkdvekvergitipi', 'har.detistisnakod', 'har.perkdv', 'kver.kdvorani', 'har.perstopaj', 'sver.stopajorani',
				'har.dettevhesapkod', 'tevver.kdvtevoranx', 'tevver.kdvtevoranpay', 'tevver.tevislemturu', 'har.pertevkifat', 'har.satiriskonto', 'har.sonuciskoran'
			])
			let args = { ...e, psTip, sayacListe, fisTable, harTable, uni, sent, where: wh }
			;{
				if (this.eFisBaslikVeDetayStm_araSentDuzenle(args) === false)
					return null
				if (genelWhereDuzenleyici?.call?.(this, args) === false)
					return null
			}
			uni.add(sent)
			return sent
		}
		
		let stokBagla = ({ sent, sent: { sahalar, where: wh } }) => {
			sent.har2StokBagla()
			sent.stok2BarkodBagla()
			sent.fromIliski('vergihesap otver', 'har.otvhesapkod = otver.kod')
			sent.leftJoin('har', 'pzmusturunfis mref', 'fis.ticmust = mref.mustkod')
			sent.leftJoin('mref', 'pzmusturundetay mdet', ['mref.kaysayac = mdet.fissayac', 'har.stokkod = mdet.stokkod'])
			sahalar.add(
				`'S' kayittipi`, 'sbar.refkod barkod', 'har.stokkod shkod', 'stk.aciklama shadi', 'stk.aciklama2 shadi2',
				'stk.brm', 'stk.brm2', 'stk.gtipkod', 'har.miktar2', 'har.koli', 'har.fiyatveritipi',
				'mdet.refkod stokrefkod', 'mdet.refadi stokrefadi', 'otver.otvorani', 'har.perotv'
			)
			for (let { rowAttr } of HMRBilgi)
				sahalar.add(`har.${rowAttr}`)
			for (let { belirtec, rowAttr, rowAttr_bedel } of TicIskYapi)
				sahalar.add(`har.${rowAttr}`, `har.${rowAttr_bedel}`)
			return this
		}
		let hizmetBagla = ({ sent, sent: { sahalar, where: wh } }) => {
			sent.har2HizmetBagla()
			sahalar.add(
				`'H' kayittipi`, `NULL barkod`, 'har.hizmetkod shkod', 'hiz.aciklama shadi', 'hiz.aciklama2 shadi2',
				'hiz.brm', `'' brm2`, `'' gtipkod`, `0 miktar2`, `0 koli`, `'' fiyatveritipi`,
				'NULL stokrefkod', 'NULL stokrefadi', '0 otvorani', '0 perotv'
			)
			for (let {numerikmi, rowAttr} of HMRBilgi)
				sahalar.add(`${numerikmi ? '0' : `''`} ${rowAttr}`)
			for (let {belirtec, rowAttr, rowAttr_bedel} of TicIskYapi)
				sahalar.add(`har.${rowAttr}`, `har.${rowAttr_bedel}`)
			return this
		}
		
		;{
			let psTip = 'P', sayacListe = ps2SayacListe[psTip]
			if (sayacListe) {
				let sent = fhBagla({ psTip, sayacListe, fisTable: 'piffis', harTable: 'pifstok' })
				if (sent) {
					sent.where.add(`fis.ayrimtipi NOT IN ('FS', 'IN')`)				// PR -magaza da alinir
					stokBagla({ sent })
				}
				sent = fhBagla({ psTip, sayacListe, fisTable: 'piffis', harTable: 'pifhizmet' })
				if (sent) {
					sent.where.add(`fis.ayrimtipi NOT IN ('FS', 'IN', 'PR')`)
					hizmetBagla({ sent })
				}
				sent = fhBagla({ psTip, sayacListe, fisTable: 'piffis', harTable: 'piffsstok' })				// sadece fason olanlar
				if (sent) {
					sent.where.add(`fis.ayrimtipi = 'FS'`)
					hizmetBagla({ sent })
				}
			}
		}
		{
			let psTip = 'S', sayacListe = ps2SayacListe[psTip]
			if (sayacListe) {
				let sent = fhBagla({ psTip, sayacListe, fisTable: 'sipfis', harTable: 'sipstok' })
				if (sent) {
					sent.where.addAll(`fis.ayrimtipi = 'EM'`, `fis.ozeltip = 'E'`)
					stokBagla({ sent })
				}
			}
		}
		
		let orderBy = ['tarih', 'pstip', 'fisnox', 'fissayac', 'seq']
		if (empty(uni.liste))
			return null
		
		return new MQStm({ sent: uni, orderBy })
	}
	static eFisBaslikVeDetayStm_araSentDuzenle({ psTip, fisTable, harTable, uni, sent, where: wh }) { }
	static tipIcinFislerEkDuzenlemeYapDevam({ yukleIslemi, promises }) {
		super.tipIcinFislerEkDuzenlemeYapDevam(...arguments)
		promises.push(
			yukleIslemi({
				stm: e => this.getDetayAciklamaStm(e),
				seviyelendirici: ({ recs: source }) => seviyelendirAttrGruplari({ source, attrGruplari: [['pstip', 'fissayac']] }),
				yukleyici: ({ eFis, detaylar: recs, ...e }) => eFis.detayAciklamalarYukle({ ...e, recs })
			}),
			yukleIslemi({
				stm: e => this.getDipAciklamaStm(e),
				seviyelendirici: ({ recs: source }) => seviyelendirAttrGruplari({ source, attrGruplari: [['pstip', 'fissayac']] }),
				yukleyici: ({ eFis, detaylar: recs, ...e }) => eFis.dipAciklamaYukle({ ...e, recs })
			}),
			yukleIslemi({
				stm: e => this.getDipEIcmalStm(e),
				seviyelendirici: ({ recs: source }) => seviyelendirAttrGruplari({ source, attrGruplari: [['pstip', 'fissayac']] }),
				yukleyici: ({ eFis, detaylar: recs, ...e }) => eFis.dipEIcmalYukle({ ...e, recs })
			}),
			yukleIslemi({
				stm: e => this.getSubeStm(e),
				yukleyici: e => this.subeYukle({ ...e })
			}),
			yukleIslemi({
				stm: e => this.getOzelYontemStm(e),
				yukleyici: e => this.ozelYontemYukle({ ...e })
			})
		)
	}
	static getDetayAciklamaStm(e) {
		let stm, uni;
		let fhBagla = _e => {
			let {harTable, fisSayaclar, psTip} = _e;
			let sent = new MQSent({
				from: harTable,
				where: [{ inDizi: fisSayaclar, saha: 'fissayac' }],
				sahalar: [
					`${MQSQLOrtak.sqlServerDegeri(psTip)} pstip`,
					'fissayac', 'seq', 'aciklama'
				]
			});
			uni.add(sent)
		};
		uni = new MQUnionAll(); stm = new MQStm({ sent: uni });
		let {ps2SayacListe} = e;
		let fisSayaclar = ps2SayacListe.P;
		if (fisSayaclar) fhBagla(({ harTable: 'pifaciklama', fisSayaclar, psTip: 'P' }))
		fisSayaclar = ps2SayacListe.S;
		if (fisSayaclar) fhBagla(({ harTable: 'sipaciklama', fisSayaclar, psTip: 'S' }))
		if (empty(uni.liste)) return null
		stm.orderBy.addAll('pstip', 'fissayac', 'seq');
		return stm
	}
	detayAciklamalarYukle(e) {
		// 'seq' değerine göre ilgili detaya eklenecektir
		let {recs} = e, {detaylar} = this, seq2Detay = {}
		for (let det of detaylar)
			seq2Detay[det.seq] = det
		for (let rec of recs) {
			let ackSeq = rec.seq, maxSeq = 0; for (let seq in seq2Detay) { if (seq <= ackSeq) maxSeq = Math.max(maxSeq, seq) }
			if (maxSeq) seq2Detay[maxSeq].aciklamaEkle({ aciklama: rec.aciklama })
		}
	}
	static getDipAciklamaStm(e) {
		let stm, uni;
		let fhBagla_baslik = _e => {
			let {harTable, fisSayaclar, psTip} = _e;
			let sent = new MQSent({
				from: harTable, where: [{ inDizi: fisSayaclar, saha: 'fissayac' }],
				sahalar: [`${MQSQLOrtak.sqlServerDegeri(psTip)} pstip`, `'B' alttip`, `0 kayitno`, 'fissayac', 'basaciklama aciklama']
			})
			uni.add(sent)
		};
		let fhBagla_dip = _e => {
			let {harTable, fisSayaclar, psTip} = _e;
			let sent = new MQSent({
				from: harTable,where: [{ inDizi: fisSayaclar, saha: 'fissayac' }],
				sahalar: [`${MQSQLOrtak.sqlServerDegeri(psTip)} pstip`, `'D' alttip`, `0 kayitno`, 'fissayac', 'aciklama']
			})
			uni.add(sent)
		};
		let fhBagla_ekBilgi = _e => {
			let {harTable, fisSayaclar, psTip} = _e;
			let sent = new MQSent({
				from: harTable, where: [{ inDizi: fisSayaclar, saha: 'fissayac' }, `kayittipi IN ('E1', 'E2')` ],
				sahalar: [`${MQSQLOrtak.sqlServerDegeri(psTip)} pstip`, 'kayittipi alttip', 'kayitno', 'fissayac', 'ekbilgi aciklama']
			})
			uni.add(sent)
		};
		uni = new MQUnionAll(); stm = new MQStm({ sent: uni });
		let {ps2SayacListe} = e
		let psTip = 'P', fisSayaclar = ps2SayacListe[psTip];
		if (fisSayaclar) {
			fhBagla_baslik(({ harTable: 'pifbasekaciklama', fisSayaclar, psTip }));
			fhBagla_dip(({ harTable: 'pifdipaciklama', fisSayaclar, psTip }));
			fhBagla_ekBilgi(({ harTable: 'pifdipekbilgi', fisSayaclar, psTip }))
		}
		psTip = 'S';
		fisSayaclar = ps2SayacListe[psTip];
		if (fisSayaclar) {
			fhBagla_baslik(({ harTable: 'sipbasekaciklama', fisSayaclar, psTip }));
			fhBagla_dip(({ harTable: 'sipdipaciklama', fisSayaclar, psTip }));
			fhBagla_ekBilgi(({ harTable: 'sipdipekbilgi', fisSayaclar, psTip }))
		}
		if (empty(uni.liste)) { return null }
		stm.orderBy.addAll('pstip', 'fissayac', 'alttip', 'kayitno');
		return stm
	}
	dipAciklamaYukle({ recs }) {
		let dipNotlar = this.dipNotlar = []
		dipNotlar.push(...recs.map(r => r?.aciklama?.trimEnd() ?? ''))
	}
	static getDipEIcmalStm({ ps2SayacListe } = {}) {
		let fhBagla = ({ fisSayaclar, psTip }) => {
			if (!fisSayaclar)
				return
			
			let fisSayacSaha = psTip == 'S' ? 'sipsayac' : 'pifsayac'
			let sent = new MQSent({
				from: 'dipebilgi',
				where: { inDizi: fisSayaclar, saha: fisSayacSaha },
				sahalar: [
					`${MQSQLOrtak.sqlServerDegeri(psTip)} pstip`,
					`${fisSayacSaha} fissayac`, 'seq', 'xadi', 'xkod',
					'hvtip', 'anatip', 'alttip', 'ustoran', 'oran',
					'matrah', 'dvmatrah', 'bedel', 'dvbedel'
				]
			})
			uni.add(sent)
		}
		
		let uni = new MQUnionAll()
		let stm = new MQStm({ sent: uni })
		let { orderBy } = stm
		fhBagla({ fisSayaclar: ps2SayacListe.P, psTip: 'P' })
		fhBagla({ fisSayaclar: ps2SayacListe.S, psTip: 'S' })
		if (empty(uni.liste))
			return null
		
		orderBy.add('pstip', 'fissayac', 'seq')
		return stm
	}
	dipEIcmalYukle(e) {
		let icmal = this.icmalYoksaOlustur()
		icmal.dipEIcmalYukle(e)
	}
	static getSubeStm(e) {
		let sent = new MQSent(), {where: wh, sahalar} = sent
		sent.fromAdd('isyeri')
		wh.add(`kod <> ''`, `silindi = ''`)
		sahalar.add('*')
		return sent
	}
	static subeYukle({ recs, temps }) {
		let result = temps.subeKod2Rec = {}
		for (let rec of recs)
			result[rec.kod] = rec
	}
	static getOzelYontemStm(e) {
		let sent = new MQSent(), {where: wh, sahalar} = sent
		sent.fromAdd('efozelyontem')
		wh.add(`kod <> ''`, `silindi = ''`)
		sahalar.add('*')
		return sent
	}
	static ozelYontemYukle({ recs, temps }) {
		let result = temps.ozelYontemKod2Rec = {}
		for (let rec of recs)
			result[rec.kod] = rec
	}

	// xmlGetProfileID(e) { }
	xmlGetBelgeTipKodu(e) { return 'SATIS' }

	async xmlDuzenle_docRefs(e) {
		await super.xmlDuzenle_docRefs(e)
		// await this.xmlDuzenle_docRefs_son(e)
	}
	async xmlDuzenle_xsltOncesi(e) {
		await super.xmlDuzenle_xsltOncesi(e)
		// await this.xmlDuzenle_bakiye(e)
	}
	async xmlDuzenle_docRefs_ilk({ xw }) {
		await super.xmlDuzenle_docRefs_ilk(...arguments)
	}
	async xmlDuzenle_docRefs_ara({ xw }) {
		let { eYontem, faturaOzelTipText } = this.baslik
		await super.xmlDuzenle_docRefs_ara(...arguments)
		await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Fatura Ek Tipi', value: faturaOzelTipText })
	}
	async xmlDuzenle_docRefs_sonOncesi({ xw }) {
		let { params } = app
		let { oncekiIrsTSNListe, eArsivBelgeTipBelirtec: eArsiv_belirtec, ortalamavade: ortVade } = this.baslik
		let { diger: { sutOnayKodu, tapdkNox } } = params.isyeri
		let { kullanim: { baslikVade }, faturaVadeEtiket } = params.eIslem
		
		await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Süt Onay', value: sutOnayKodu })
		await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Tapdk No', value: tapdkNox })
		if (empty(oncekiIrsTSNListe))
			await this.xmlDuzenleInternal_docRef({ xw, type: 'IS_DESPATCH' })
		if (eArsiv_belirtec)
			await this.xmlDuzenleInternal_docRef({ xw, typeCode: 'SEND_TYPE', id: eArsiv_belirtec })
		if (baslikVade)
			await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: faturaVadeEtiket, value: asDateAndToString(ortVade) })
	}
	async xmlDuzenle_docRefs_son({ xw }) {
		await super.xmlDuzenle_docRefs_son(...arguments)    // en ust seviyeden ayrıca çağrılıyor
		let { params } = app
		let { plasiyerkod, plasiyeradi, tahsekliadi } = this.baslik
		let { kullanim: { baslikPlasiyer, baslikTahsilatSekli } } = params.eIslem
		let { diger: { sutOnayKodu, tapdkNox } } = params.isyeri
		if (baslikPlasiyer)
			await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Plasiyer', value: plasiyerkod ? `(${plasiyerkod}) ${plasiyeradi}` : null })
		if (baslikTahsilatSekli)
			await this.xmlDuzenleInternal_docRefBaslikEkSaha({ xw, name: 'Tahsil Şekli', value: tahsekliadi })
	}

	xmlDuzenle_notes(e) {
		// this.xmlDuzenle_bakiye(e)
		super.xmlDuzenle_notes(e)
	}
	async xmlDuzenle_bakiye({ xw }) {
		await super.xmlDuzenle_bakiye(...arguments)
		let { dipNotlar, baslik, baslik: { oncekiXBakiye, sonrakiXBakiye, dovizlimi, dvKodUyarlanmis } } = this
		let { dipOncekiBakiye, dipSonBakiye, bakiyeDovizliIseAyricaTLBakiye } = app.params.eIslem.kullanim
		
		const PF = '$$', Sep = '|'
		let keysInNotes = {}  // $$ONCEKI_BAKIYE|... -> note index
		;dipNotlar.forEach((line, index) => {
			if (line.startsWith(PF) && line.includes(Sep)) {    // 'ONCEKI_BAKIYE|...', 'SONRAKI_BAKIYE|...'
				let t = line.slice(PF.length).split(Sep)
				let key = t[0].trim()
				let value = t.slice(1).join(Sep)
				keysInNotes[key] = { index, key, value }
			}
		})
		
		let removeIndexes = []
		let bakiyeTextEkle = args => {
			let { prefix, etiket, bakiye, tlBakiye } = args
			let k = [prefix, 'BAKIYE'].join('_')
			;{
				let { index: i } = keysInNotes[k] ?? {}
				if (i != null) {
					i = Number(i)
					let v = dipNotlar[i]
					if (!bakiye || v.includes(`${Sep}0,00`))
						removeIndexes.push(i)
					else {
						v = v.replace(`${PF}${k}${Sep}`, `${etiket}:  `)
						dipNotlar[i] = v
					}
				}
				else if (bakiye) {
					let textListe = [`${toStringWithFra(bakiye, 2)} ${dvKodUyarlanmis}`]
					if (dovizlimi && bakiyeDovizliIseAyricaTLBakiye) {
						if (isFunction(tlBakiye))
							tlBakiye = tlBakiye(args)
						textListe.push(`${toStringWithFra(tlBakiye, 2)} TL`)
					}
					
					let v = textListe.join('<br/>')
					this.xsltDuzenleyiciEkle({
						args: { k, v },
						handler: ({ args: { k, v }, result: res }) =>
							res.replaceAll(`${PF}${k}`, v)
					})
				}
			}
			
			//for (let desc of textListe)
			//	this.xmlDuzenleInternal_docRef({ xw, id: '0', typeCode, desc })
		}
			
		bakiyeTextEkle({ prefix: 'ONCEKI', etiket: 'Önceki Bakiye', bakiye: dipOncekiBakiye ? oncekiXBakiye : null, tlBakiye: baslik.oncekiTLBakiye })
		bakiyeTextEkle({ prefix: 'SONRAKI', etiket: 'Sonraki Bakiye', bakiye: dipSonBakiye ? sonrakiXBakiye : null, tlBakiye: baslik.sonrakiTLBakiye })

		;removeIndexes.sort().reverse().forEach(i =>
			dipNotlar.splice(i, 1))
	}
	xmlDuzenle_doviz(e) {
		super.xmlDuzenle_doviz(e)
		this.xmlDuzenleInternal_doviz(e)
	}
	xmlDuzenle_dvKur(e) {
		super.xmlDuzenle_dvKur(e)
		if (this.dovizlimi)
			this.xmlDuzenleInternal_dvKur(e)
	}
	xmlDuzenle_docRefs_yalnizYazisi({ xw }) {
		super.xmlDuzenle_docRefs_yalnizYazisi(...arguments)
		let { bedelSelector } = this
		let icmal = this.icmalYoksaOlustur()
		let sonucBedel = icmal.sonucBedelYapi[bedelSelector]
		let type = 'YALNIZYAZISI'
		let desc = `#${yalnizYazisi(sonucBedel)}#`
		this.xmlDuzenleInternal_docRef({ xw, id: '0', type, desc })
	}
	xmlDuzenle_allowanceCharge({ xw }) {
		super.xmlDuzenle_allowanceCharge(...arguments)
		let icmal = this.icmalYoksaOlustur()
		let { hizmetler, sonucBedelYapi = {} } = icmal
		let { bedelSelector, xattrYapi_bedel } = this
		if (empty(hizmetler))
			hizmetler = [{ oran: 0 }]
		
		let dipSonucBedel = sonucBedelYapi[bedelSelector] || 0
		for (let { nakliyemi, oran, bedelYapi } of hizmetler) {
			let bedel = bedelYapi?.[bedelSelector] || 0
			xw.writeElementBlock('cac:AllowanceCharge', null, () =>
				xw.writeElementString('cbc:ChargeIndicator', nakliyemi ?? false)
				  .writeElementString('cbc:MultiplierFactorNumeric', toFileStringWithFra(oran, 4))
				  .writeElementString('cbc:Amount', toFileStringWithFra(bedel, 2), null, xattrYapi_bedel)
				  .writeElementString('cbc:BaseAmount', toFileStringWithFra(dipSonucBedel, 2), null, xattrYapi_bedel)
			)
		}
	}
	xmlDuzenle_taxTotal({ xw }) {
		super.xmlDuzenle_taxTotal(...arguments)
		let { baslik: { istisnaKod } } = this
		let icmal = this.icmalYoksaOlustur()
		let { vergiTip2Oran2EVergiRecs_tevkifatsiz } = icmal
		let { bedelSelector, xattrYapi_bedel, dovizlimi} = this

		let toplamBedel = 0
		for (let oran2Recs of values(vergiTip2Oran2EVergiRecs_tevkifatsiz))
		for (let eSatirlar of values(oran2Recs))
		for (let eRec of eSatirlar)
			toplamBedel += eRec.bedelYapi[bedelSelector]

		if (empty(vergiTip2Oran2EVergiRecs_tevkifatsiz)) {    // ISTISNA için cac:TaxTotal yine yazılmalı
			let oran = 0
			let { eIslTypeCode: tip, belirtec } = MQVergiKdv
			belirtec = belirtec?.toUpperCase() ?? 'KDV'
			vergiTip2Oran2EVergiRecs_tevkifatsiz = {
				[tip]: {
					[oran]: [
						new EIcmalVergi({
							etiket: `${belirtec} % ${oran}`,
							kod: MQVergiKdv.eIslTypeCode,
							matrah: toplamBedel
						})
					]
				}
			}
		}
		
		xw.writeElementBlock('cac:TaxTotal', null, () => {
			xw.writeElementString('cbc:TaxAmount', toFileStringWithFra(toplamBedel, 2), null, xattrYapi_bedel)
			for (let oran2VergiRecs of values(vergiTip2Oran2EVergiRecs_tevkifatsiz))
			for (let [oran, vergiRecs] of entries(oran2VergiRecs)) {
				oran = Number(oran)
				for (let eRec of vergiRecs) {
					let { etiket: taxName, kod: taxTypeCode } = eRec ?? {}
					;{
						taxName = ( taxName?.split?.('%')?.[0] || '').trim()		// KDV % 20  ==>  KDV
						if (taxName?.endsWith('('))
							taxName = taxName.substring(0, taxName.length - 1).trim()
					}
					
					xw.writeElementBlock('cac:TaxSubtotal', null, () => {
						xw.writeElementString('cbc:TaxableAmount', toFileStringWithFra(eRec.getMatrahYapi({ dovizlimi })[bedelSelector], 2), null, xattrYapi_bedel)
						   .writeElementString('cbc:TaxAmount', toFileStringWithFra(eRec.bedelYapi[bedelSelector], 2), null, xattrYapi_bedel)
						   .writeElementString('cbc:CalculationSequenceNumeric', '2.0').writeElementString('cbc:Percent', oran)
						   .writeElementBlock('cac:TaxCategory', null, () => {
							   if (istisnaKod) {
									let tumIstisnaDict = MQVergi.getTumIstisnaDict()
									xw.writeElementString('cbc:TaxExemptionReasonCode', istisnaKod)
									  .writeElementString('cbc:TaxExemptionReason', tumIstisnaDict[istisnaKod]?.aciklama || '.')
								}
								xw.writeElementBlock('cac:TaxScheme', null, () =>
									xw.writeElementString('cbc:Name', taxName || '')
									  .writeElementString('cbc:TaxTypeCode', taxTypeCode || ''))
						   })
					})
				}
			}
		})
	}
	xmlDuzenle_tevkifatli_taxTotal({ xw }) {
		super.xmlDuzenle_tevkifatli_taxTotal(...arguments)
		let icmal = this.icmalYoksaOlustur()
		let { bedelSelector, xattrYapi_bedel, dovizlimi } = this
		let { vergiRecs_tevkifatlar } = icmal
		if (empty(vergiRecs_tevkifatlar))
			return
		
		let toplamBedel = topla(rec > rec.bedelYapi[bedelSelector], vergiRecs_tevkifatlar)
		if (!toplamBedel)
			return
		
		xw.writeElementBlock('cac:WithholdingTaxTotal', null, () => {
			xw.writeElementString('cbc:TaxAmount', toFileStringWithFra(toplamBedel, 2), null, xattrYapi_bedel);
			for (let eRec of vergiRecs_tevkifatlar) {
				xw.writeElementBlock('cac:TaxSubtotal', null, () => {
					xw.writeElementString('cbc:TaxableAmount', toFileStringWithFra(eRec.getMatrahYapi({ dovizlimi })[bedelSelector], 2), null, xattrYapi_bedel)
					  .writeElementString('cbc:TaxAmount', toFileStringWithFra(eRec.bedelYapi[bedelSelector], 2), null, xattrYapi_bedel)
					  .writeElementString('cbc:CalculationSequenceNumeric', '2.0')
					  .writeElementString('cbc:Percent', eRec.oran)
					  .writeElementBlock('cac:TaxCategory', null, () => {
							xw.writeElementBlock('cac:TaxScheme', null, () => {
								xw
									.writeElementString('cbc:Name', eRec.etiket)
									.writeElementString('cbc:TaxTypeCode', eRec.kod)
							})
					  })
				})
			}
		})
	}
	xmlDuzenle_legalMonetaryTotal({ xw }) {
		super.xmlDuzenle_legalMonetaryTotal(...arguments)
		let { bedelSelector, xattrYapi_bedel } = this
		let icmal = this.icmalYoksaOlustur()
		let brutBedel = icmal.brutBedelYapi?.[bedelSelector] || 0
		let topIskBedel = icmal.topIskBedelYapi?.[bedelSelector] || 0
		let vergiHaricBedel = icmal.vergiHaricToplamYapi?.[bedelSelector] || 0
		let vergiDahilBedel = icmal.vergiDahilToplamYapi?.[bedelSelector] || 0
		let sonucBedel = icmal.sonucBedelYapi?.[bedelSelector] || 0
		xw.writeElementBlock('cac:LegalMonetaryTotal', null, () =>
			xw.writeElementString('cbc:LineExtensionAmount', toFileStringWithFra(brutBedel, 2), null, xattrYapi_bedel)
			  .writeElementString('cbc:TaxExclusiveAmount', toFileStringWithFra(vergiHaricBedel, 2), null, xattrYapi_bedel)
			  .writeElementString('cbc:TaxInclusiveAmount', toFileStringWithFra(vergiDahilBedel, 2), null, xattrYapi_bedel)
			  .writeElementString('cbc:AllowanceTotalAmount', toFileStringWithFra(topIskBedel, 2), null, xattrYapi_bedel)
			  .writeElementString('cbc:PayableAmount', toFileStringWithFra(sonucBedel, 2), null, xattrYapi_bedel)
		)
	}
	xmlDuzenle_detayDevam_taxTotal({ xw, detay: det }) {
		/* 'har.detkdvekvergitipi', 'har.detistisnakod', 'har.perkdv', 'har.pertevkifat', 'har.perstopaj', 'kver.kdvorani', 'sver.stopajorani',
			'tevver.kdvtevoranx', 'tevver.kdvtevoranpay', 'tevver.tevislemturu' */
		super.xmlDuzenle_detayDevam_taxTotal(...arguments)
		let { bedelSelector, xattrYapi_bedel, dovizlimi } = this
		let { bedel: matrah } = det
		let tip2VergiYapi = {
			get kdv() {
				return { bedel: det.perkdv, oran: det.kdvorani, taxTypeCode: MQVergiKdv.eIslTypeCode, taxName: 'KDV' }
				//return det.perkdv
				//	? { bedel: det.perkdv, oran: det.kdvorani, taxTypeCode: MQVergiKdv.eIslTypeCode, taxName: 'KDV' }
				//	: null
			},
			get istisna() {
				let { detkdvekvergitipi: ekVergiTipi, detistisnakod: istisnaKod } = det
				return ekVergiTipi == 'KI' || ekVergiTipi == 'IS' || ekVergiTipi == 'OM'
					? { bedel: 0, oran: 0, istisnaKod, taxTypeCode: MQVergiKdv.eIslTypeCode, taxName: 'KDV' }
					: null
			}, 
			get stopaj() {
				return det.perstopaj
					? { bedel: det.perstopaj, oran: det.stopajorani, taxTypeCode: MQVergiStopaj.eIslTypeCode, taxName: 'STOPAJ' }
					: null
			},
			get otv() {
				return det.perotv
					? { bedel: det.perotv, oran: det.otvorani, taxTypeCode: MQVergiOtv.eIslTypeCode, taxName: 'ÖTV' }
					: null
			}
		}

		if (tip2VergiYapi.istisna && tip2VergiYapi.kdv)
			delete tip2VergiYapi.kdv

		let cnv = { kdv: 'perkdv', stopaj: 'perstopaj', otv: 'perotv' }
		let toplamBedel = 0
		for (let [tip, r] of entries(tip2VergiYapi)) {
			let { oran, bedel } = r ?? {}
			if (!bedel)
				continue
			if (!oran) {
				r.bedel = 0
				continue
			}
			toplamBedel += bedel
		}
		toplamBedel = roundToBedelFra(toplamBedel)
		
		let tumIstisnaDict
		xw.writeElementBlock('cac:TaxTotal', null, () => {
			xw.writeElementString('cbc:TaxAmount', toFileStringWithFra(toplamBedel, 2), null, xattrYapi_bedel)
			for (let [tip, rec] of entries(tip2VergiYapi).filter(ent => ent[1])) {
				let { oran, bedel, istisnaKod, taxName, taxTypeCode } = rec
				if (!oran)
					bedel = rec.bedel = 0
				
				xw.writeElementBlock('cac:TaxSubtotal', null, () =>
					//xw.writeElements
					xw.writeElementString('cbc:TaxableAmount', toFileStringWithFra(matrah, 2), null, xattrYapi_bedel)
					  .writeElementString('cbc:TaxAmount', toFileStringWithFra(bedel || 0, 2), null, xattrYapi_bedel)
					  .writeElementString('cbc:CalculationSequenceNumeric', '2.0')
					  .writeElementString('cbc:Percent', oran || 0)
					  .writeElementBlock('cac:TaxCategory', null, () => {
						  if (istisnaKod) {
							  tumIstisnaDict ??= MQVergi.getTumIstisnaDict()
							  xw.writeElementString('cbc:TaxExemptionReasonCode', istisnaKod)
								.writeElementString('cbc:TaxExemptionReason', tumIstisnaDict[istisnaKod]?.aciklama || '.')
						  }
						  xw.writeElementBlock('cac:TaxScheme', null, () =>
							  xw.writeElementString('cbc:Name', taxName || '')
								.writeElementString('cbc:TaxTypeCode', taxTypeCode || ''))
					})
				)
			}
		})
	}
	xmlDuzenle_detayDevam_tevkifatli_taxTotal({ xw, detay: det }) {
		/* 'har.detkdvekvergitipi', 'har.detistisnakod',
			'har.perkdv', 'har.pertevkifat', 'har.perstopaj', 'kver.kdvorani', 'sver.stopajorani',
			'tevver.kdvtevoranx', 'tevver.kdvtevoranpay', 'tevver.tevislemturu' */
		super.xmlDuzenle_detayDevam_tevkifatli_taxTotal(...arguments)
		let { bedelSelector, xattrYapi_bedel, dovizlimi } = this
		let { bedel: matrah, pertevkifat, kdvtevoranpay } = det
		let bedel = pertevkifat || 0, oran = (kdvtevoranpay || 0) * 10
		if (!bedel)
			return
		
		let toplamBedel = bedel
		let tevkifatDict
		xw.writeElementBlock('cac:WithholdingTaxTotal', null, () => {
			xw.writeElementString('cbc:TaxAmount', toFileStringWithFra(toplamBedel, 2), null, xattrYapi_bedel)
			xw.writeElementBlock('cac:TaxSubtotal', null, () => {
				xw
					.writeElementString('cbc:TaxableAmount', toFileStringWithFra(matrah, 2), null, xattrYapi_bedel)
					.writeElementString('cbc:TaxAmount', toFileStringWithFra(bedel, 2), null, xattrYapi_bedel)
					.writeElementString('cbc:CalculationSequenceNumeric', '2.0')
					.writeElementString('cbc:Percent', oran)
					.writeElementBlock('cac:TaxCategory', null, () => {
						xw.writeElementBlock('cac:TaxScheme', null, () => {
							let { tevislemturu: tevIslemTuru } = det
							tevkifatDict ??= MQVergi.getTevkifatDict()
							xw
								.writeElementString('cbc:Name', tevkifatDict[tevIslemTuru]?.aciklama || '.')
								.writeElementString('cbc:TaxTypeCode', tevIslemTuru)
						})
					})
			})
		})
	}
	xmlDuzenle_detayDevam_item_additionalItemIds_miktar2({ xw, detay: det }) {
		super.xmlDuzenle_detayDevam_item_additionalItemIds_miktar2(...arguments)
		let { eMiktarYapi: { miktar2, brm2 } = {} } = det
		if (!miktar2)
			return
		brm2 ||= det.brm2
		let text = [numberToString(miktar2), brm2].filter(Boolean).join(' ')
		this.xmlDuzenleInternal_detAdditionalIdent({ xw, schemeID: 'MIKTAR2GORUNUM', id: text })
		//this.xmlDuzenleInternal_detAdditionalIdent({ xw, schemeID: 'BRM2GORUNUM', id: brm2 })
	}
	xmlDuzenle_detayDevam_item_additionalItemIds_netFiyat({ xw, detay: det }) {
		super.xmlDuzenle_detayDevam_item_additionalItemIds_netFiyat(...arguments)
		let { dovizlimi } = this
		let { netFiyat } = det.getEFiyatYapi({ dovizlimi }) ?? {}
		if (netFiyat) {
			let { zorunlu: { fiyatFra } } = app.params
			this.xmlDuzenleInternal_detAdditionalIdent({ xw, schemeID: 'NET_FIYAT', id: toFileStringWithFra(netFiyat, fiyatFra || 6) })
		}
	}
	xmlDuzenle_detayDevam_item_additionalItemIds_ikGosterim({ xw, detay: det, detay: { rec, topIskBedel } }) {
		let { dovizlimi, dvKodUyarlanmis: dvKod, xattrYapi_bedel } = this
		if (!dovizlimi)
			dvKod = 'TL'
		
		let brut = det.getBrutBedel({ dovizlimi })
		let prefix2Values = []
		for (let { belirtec, rowAttr, rowAttr_bedel } of TicIskYapi.getIskIter()) {
			let prefix = (
				belirtec == 'isk' ? 'ISK' :
				belirtec == 'kam' ? 'KAM' :
				belirtec == 'art' ? 'ART' :
				belirtec.slice(0, 3).toUpperCase()
			)
			let oran = rec[rowAttr]
			if (!oran)
				continue
			;{
				let liste = prefix2Values[`${prefix}ORANLARGORUNUM`] ??= []
				let text = numberToString(oran)
				if (!liste.length)
					text = `%${text}`
				liste.push(text)
			}
			;{
				let liste = prefix2Values[`${prefix}ORANLAR`] ??= []
				liste.push(oran)
			}
		}
		if (topIskBedel) {
			(prefix2Values.ISKTOPBEDELGORUNUM ??= []).push(toStringWithFra(topIskBedel, 2))
			;(prefix2Values.ISKTOPBEDEL ??= []).push(roundToFra(topIskBedel, 2))
		}
		
		for (let [schemeID, values] of entries(prefix2Values)) {
			let id = values.map(v => toFileStringWithFra(v, 2)).join('+')
			this.xmlDuzenleInternal_detAdditionalIdent({ xw, schemeID, id })
		}
	}
	xmlDuzenle_detayDevam_miktar({ xw, detay: det }) {
		super.xmlDuzenle_detayDevam_miktar(...arguments)
		let { eMiktarYapi: { asilMiktar: miktar, brm } = {} } = det
		if (miktar == null)
			return
		brm ||= det.brm || 'AD'
		let unitCode = app.params.stokBirim.brmDict[brm]?.intKod || 'NIU'			/* NIU = AD */
		if (!unitCode)
			throw { isError: true, rc: 'brmUls', errorText: `<b class="royalblue">${brm}</b> Stok Birim kodu için <u class="bold royalblue">Uls. Kod Karşılığı</u>, Stok Birim Parametrelerinden tanımlanmalıdır` }
		
		xw.writeElementString('cbc:InvoicedQuantity', miktar || 0, null, { unitCode })
	}
	xmlDuzenle_detayDevam_fiyat({ xw, detay: det }) {
		super.xmlDuzenle_detayDevam_fiyat(...arguments)
		let { asilFiyat: fiyat } = det.getEFiyatYapi({ dovizlimi: this.dovizlimi })
		if (fiyat == null)
			return
		xw.writeElementBlock('cac:Price', null, () =>
			xw.writeElementString('cbc:PriceAmount', toFileStringWithFra(fiyat || 0), null, this.xattrYapi_bedel))
	}
	xmlDuzenle_detayDevam_allowanceCharge({ xw, detay: det, detay: { rec } }) {
		let { dovizlimi, xattrYapi_bedel } = this
		let brut = det.getBrutBedel({ dovizlimi })
		let iskYapilar = Array.from(TicIskYapi)
		/*if (empty(iskYapilar)) {
			iskYapilar = [
				{ oran: 0 }
			]
		}*/
		for (let { rowAttr, rowAttr_bedel } of iskYapilar) {
			let oran = rec[rowAttr] || 0
			let ikBedel = oran ? rec[rowAttr_bedel] : 0
			if (!oran)
				continue
			xw.writeElementBlock('cac:AllowanceCharge', null, () =>
				xw.writeElementString('cbc:ChargeIndicator', false)
				  .writeElementString('cbc:MultiplierFactorNumeric', toFileStringWithFra(oran / 100, 4))
				  .writeElementString('cbc:Amount', toFileStringWithFra(ikBedel, 2), null, xattrYapi_bedel)
				  .writeElementString('cbc:BaseAmount', toFileStringWithFra(brut, 2), null, xattrYapi_bedel)
			)
		}
	}
}
