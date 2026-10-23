class GidenEIslemFiltre extends EIslemFiltre {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get gidenmi() { return true }
	get querySinif() { return EIslemQuery_Liste }
	
	/*getQueryStm(e = {}) {
		let uni = new MQUnionAll()
		let stm = new MQStm({ sent: uni })
		let args = { ...e, stm, uni, alias: 'fis' }
		this.queryStmDuzenle(args)
		return args.stm
	}
	queryStmDuzenle(e = {}) {
		super.queryStmDuzenle(e)
		
		let { stm, uni, eConf = this.eConf } = e
		uni ??= e.uni = stm.sent
		
		let { isyeri = {} } = app.params
		let { _colDefs: cd = {} } = app

		let getIdClause = (table, clause) =>
			`${!cd?.[table] || cd?.[table].id ? clause : `''`} id`
		let sentEkle = args => {
			args = { ...e, ...args }
			let secWH = this.getTBWhereClause(args)
			if (!secWH)
				return null
			
			let { fisTable: table, oncelik, psTip, ifSql, efAyrimTipiClause } = args
			oncelik ??= 10
			let sent = new MQSent(), { where: wh, sahalar } = sent
			;{
				sent
					.fromAdd(`${table} fis`)
					.fis2TicCariBagla()
					.fromIliski('degiskenadres dadr', 'fis.degiskenvknox = dadr.vknox')
			}
			wh.birlestir(secWH)
			;{
				sahalar
					.add(...[
						`${table.sqlServerDegeri()} _table`,
						`${psTip.sqlServerDegeri()} psTip`,
						`${oncelik.sqlServerDegeri()} oncelik`,
						getIdClause(table, 'fis.id'),
						'fis.kaysayac fisSayac',
						`${ifSql} pifTipi`,
						`${efAyrimTipiClause} eIslTip`
					])
					.addWithAlias('fis', ...[
						'almsat almSat', 'iade', 'ayrimtipi fisAyrim',
						'tarih', 'fisnox fisNox', 'ticmust mustKod', 'efatuuid uuid',
						'efimzats imzaTS', 'efgonderimts gonderimTS',
						'efatonaydurumu onayDurum', 'net bedel'
					])
					.add(`${table == 'piffis' ? 'fis.zorunluguidstr' : `''`} zorunluUUID`)
					.addWithAlias('car', ...[
						'birunvan mustUnvan', 'vkno vkn',
						'revizeeislemmail eMail',
						'efatsenaryotipi efSenaryoTipi',
						'earsivbelgetipi eaGonderimTipi'
					])
					.add(...[`${
						new MQCase().setClause('fis.efayrimtipi')
							.when(`'IR'`, new MQCase()
								.setClause('fis.degiskenvknox')
									.when(`''`, 'dbo.emptycoalesce(car.eirsgibalias, car.efatgibalias)')
									.else('dadr.efatgibalias')
							)
							.else(new MQCase()
								.setClause('fis.degiskenvknox')
									.when(`''`, 'car.efatgibalias')
									.else('dadr.efatgibalias')
							)
						} gibAlias`
					])
			}

			eConf?.eIslListeSentDuzenle({ ...args, sent })
			
			uni.add(sent)
			return sent
		}
		
		let eIslTipClause = (defVal, duzenle) => {
			let res = new MQCase()
				.when(`fis.ayrimtipi = 'IH'`, `'IH'`)
				.when(`fis.ayrimtipi = ''`, MQSQLOrtak.sqlServerDegeri(defVal))
			duzenle?.call(this, res, defVal)
			res.else('fis.efayrimtipi')    // ** 'when/else ==>  liste.push' yapar. else en son eklenmeli
			return res
		}
		;{
			if (!(
				sentEkle({
					fisTable: 'piffis', oncelik: 10,
					psTip: 'P', ifSql: 'fis.piftipi',
					efAyrimTipiClause: eIslTipClause('A', cs => {
						cs
							.when(`fis.piftipi = 'I'`, `'IR'`)
							.when(`fis.almsat = 'M'`, `'MS'`)
					})
				}) &&
				sentEkle({
					fisTable: 'sipfis', oncelik: 13,
					psTip: 'S', ifSql: `'F'`,
					efAyrimTipiClause: eIslTipClause('')
				})
			)) { return null }
		}
		
		;{
			let table = 'stfis'
			let secWH = this.getTBWhereClause({ ...e, psTip: 'ST', fisTable: table })
			if (!secWH)
				return
			
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent
				.fromAdd(`${table} fis`)
				.fromIliski('carmst car', 'fis.irsmust = car.must')
			wh.birlestir(secWH)
			sahalar
				.add(...[
					`${table.sqlServerDegeri()} _table`,
					`'ST' psTip`,
					'20 oncelik',
					getIdClause(table, 'fis.id'),
					'fis.kaysayac fisSayac',
					'fis.ozeltip pifTipi',
					`'IR' eIslTip`,
					`'T' almSat`, `'' iade`, `fis.fisekayrim fisAyrim`,
					`fis.tarih`, `fis.fisnox fisNox`, `'' mustKod`
				])
				.addWithAlias('fis', ...[
					'efatuuid uuid',
					'efimzats imzaTS', 'efgonderimts gonderimTS',
					'efatonaydurumu onayDurum'
				])
				.add(...[
					`0 bedel`,
					`'' zorunluUUID`,
					`'' mustUnvan`,
					`${
						new MQCase().setClause('fis.fisekayrim')
							.when(`'SC'`, VergiNo.perakendeVKN.sqlServerDegeri())
							.else(isyeri.vergiVeyaVKN || `''`)
					 } vkn`
				])
				.addWithAlias('car', ...[
					'revizeeislemmail eMail',
					'efatsenaryotipi efSenaryoTipi',
					'earsivbelgetipi eaGonderimTipi'
				])
				.add(...[
					`${
						new MQCase().setClause('fis.efayrimtipi')
							.when(`'IR'`, 'dbo.emptycoalesce(car.eirsgibalias, car.efatgibalias)')
							.else('car.efatgibalias')
					} gibAlias`
				])
			uni.add(sent)
		}
	
		;{
			let table = 'topmakbuzara'
			let secWH = this.getTBWhereClause({ ...e, psTip: 'SM', fisTable: table })
			if (!secWH)
				return
	
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent
				.fromAdd(`${table} fis`)
				.fromIliski('topmakbuzfis ust', 'fis.fissayac = ust.kaysayac')
				.fromIliski('carmst car', 'fis.mustahsilkod = car.must')
			wh.birlestir(secWH)
			sahalar
				.add(...[
					`${table.sqlServerDegeri()} _table`,
					`'SM' psTip`,
					'30 oncelik',
					getIdClause(table, 'fis.id'),
					'fis.kaysayac fisSayac',
					`'' pifTipi`,
					`'MS' eIslTip`,
					`'T' almsat`, `'' iade`, , `'' fisAyrim`,
					'ust.tarih', 'fis.makbuznox fisNox', 'fis.mustahsilkod mustKod'
				])
				.addWithAlias('fis', ...[
					'efatuuid uuid',
					`efimzats imzaTS`, `efgonderimts gonderimTS`,
					'efatonaydurumu onayDurum'
				])
				.add(...[
					`0 bedel`,
					`'' zorunluUUID`
				])
				.addWithAlias('car', ...[
					`birunvan mustUnvan`,
					'vkno vkn',
					'revizeeislemmail eMail',
					'efatsenaryotipi efSenaryoTipi',
					'earsivbelgetipi eaGonderimTipi'
				])
				.add(...[
					`${
						new MQCase().setClause('fis.efayrimtipi')
							.when(`'IR'`, 'dbo.emptycoalesce(car.eirsgibalias, car.efatgibalias)')
							.else('car.efatgibalias')
					} gibAlias`
				])
			uni.add(sent)
		}
		
		sentEkle({ fisTable: 'piffis', psTip: 'SR', ifSql: `fis.piftipi`, efAyrimTipiClause: `'MS'` })

		for (let sent of stm)
			this.sayaclarBagla({ ...e, sent })
		
		stm.orderBy
			.add('tarih DESC', 'eIslTip', 'oncelik', 'fisNox DESC')
	}*/

	static getBelgeTipText(e) {
		let { rec = e } = e
		let { psTip, pifTipi, almSat, iade, fisAyrim: ayrimTipi } = rec
		
		if (psTip == 'S') {												/* S: sipfis */
			if (almSat == 'T') {
				switch (ayrimTipi) {
					case 'IH': return 'İhracat Fatura'
					case 'EM': return 'Eski Emanet Fatura'
				}
			}
			return null
		}
		
		if (psTip == 'ST') {											/* ST: stfis */
			if (ayrimTipi == 'SB' || pifTipi == 'SB') return 'Şube Transfer'
			if (ayrimTipi == 'SC' || pifTipi == 'SC') return 'Plasiyer Teslim'
			if (ayrimTipi == 'IR' || pifTipi == 'IR') return 'İrsaliyeli Transfer'
			if (ayrimTipi == 'FS' || pifTipi == 'FS') return 'Fasona Malzeme Çıkış'
			return 'Plasiyere Teslim'
		}
		
		if (psTip == 'SM')												/* SM: topmakbuzfis */
			return 'Süt Makbuz'
		
		if (psTip == 'SR')												/* SR: piffis */
			return 'Sürü Müstahsil'
		
		if (pifTipi == 'P')												/* P: piffis - Mağaza */
			return 'Mağaza Satış'

		if (almSat == 'M')
			return 'Müstahsil Makbuzu'
		
		// Normal Satış veya Alım İADE
		let alimmi = almSat == 'A'
		let iademi = iade == 'I'
		let atText = alimmi ? 'Alım' : 'Satış'
		let iadePrefix = iademi ? ' İADE' : ''
		let ifText = (pifTipi == 'I' ? 'İrsaliye' : 'Fatura')
		
		switch (ayrimTipi) {
			case '': return `${atText}${iadePrefix} ${ifText}`
			case 'IK': return `${atText} İhraç Kaydıyla${iadePrefix} ${ifText}`
			case 'EM': return `${atText} Eski Emanet${iadePrefix} ${ifText}`
			case 'EX': return `${atText} Emanet${iadePrefix} ${ifText}`
			case 'FS': return `${atText} Fason${iadePrefix} ${ifText}`
			case 'KN': return `${atText} Konsinye${iadePrefix} ${ifText}`
			case 'IH': return `${alimmi ? 'İthalat' : 'İhracat'}${iadePrefix} ${ifText}`
			case 'MI': return 'Mikro İhracat'
		}
		
		return `${atText}${iadePrefix} ${ifText}`
	}
	listeOlustur(e = {}) {
		super.listeOlustur(e)
		let tarihBasi = null   //today().addMonths(-5); tarihBasi.setDate(1);
		this.grupEkle({ kod: 'PRG', aciklama: 'Yazılımsal', renk: '#111', zeminRenk: '#eee', kapali: true })
		
		let { liste, eConf = this.eConf ?? {} } = e
		let sec_eIslem, sec_faturaAyrim
		extend(liste, {
			uygunOlmayanlarGosterilirmiFlag: new SecimBool({
				etiket: 'Seri-No Yıl Uygun OLMAYANLAR da gösterilsin'
			}),
			eIslemBirKismi: (
				sec_eIslem = new SecimBirKismi({
					etiket: 'e-İşlem',
					tekSecim: new EIslemTip({ hepsi: true })
				}).birKismi()
			),
			faturaAyrimSecim: (
				sec_faturaAyrim = new SecimTekSecim({
					etiket: 'Fatura Ayrım',
					tekSecim: new BuDigerVeHepsi(['Mağaza Fişi', 'Normal Fatura'])
				})
			)
		})

		let { kisitUyarlanmis: kisit } = eConf
		if (kisit.kullanilirmi) {
			let eIslKodlar = []
				if (kisit.fatura) {
					eIslKodlar.push('E', 'IH')
					if (kisit.magaza)
						eIslKodlar.push('A')
				}
				if (kisit.irsaliye)
					eIslKodlar.push('IR')
				if (kisit.musMakbuz)
					eIslKodlar.push('MS')
			
			if (eIslKodlar.length) {
				let { kaDict } = EIslemTip
				liste.uyari_kisitEIslTip = new SecimText({
					etiket: `Kısıtlanacak e-İşlem Tipleri:`,
					value: `[ <b class="indianred">${eIslKodlar.map(eIslTip => kaDict[eIslTip] || eIslTip)}</b> ]`
				})
			}
			liste.uyari_kisitAyrim = new SecimText({
				etiket: `Kısıtlanacak Ayrımlar`,
				value: `[ <b class="indianred">${magazami ? 'Mağaza' : 'Normal Faturalar'}</b> ]`
			})
		}
		
		extend(liste, {
			sube: new SecimBirKismi({ etiket: 'Fiş Şubesi', mfSinif: MQSube }),
			tarih: new SecimDate({ etiket: 'Tarih', basi: tarihBasi }),
			seri: new SecimString({ etiket: 'Belge Seri' }),
			fisNo: new SecimNumber({ etiket: 'Belge No' }),
			must: new SecimString({ etiket: 'Müşteri', mfSinif: MQCari }),
			mustUnvan1: new SecimOzellik({ etiket: 'Müşteri Ünvan 1' }),
			gonderimDurumSecim: new SecimTekSecim({
				etiket: 'Gönderim Durumu',
				tekSecim: new BuDigerVeHepsi(['Bekleyenler', 'GÖNDERİLENLER']).bu()
			}),
			gonderimTarihi: new SecimDate({ etiket: 'Gönderim Tarihi' }),
			akibetDurumBirKismi: new SecimBirKismi({
				etiket: 'Akıbet',
				tekSecimSinif: EIslemOnayDurum
			}).birKismi(),
			uuid: new SecimOzellik({ etiket: 'UUID' }),
			xmlDurumSecim: new SecimTekSecim({
				etiket: 'XML Durumu',
				tekSecim: new BuDigerVeHepsi([
					`<span class="green">XML Oluşmuş Olanlar</span>`,
					`<span class="red">XML OLUŞMAMIŞ Olanlar</span>`
				])
			}),
			fisSayac: new SecimInteger({ etiket: 'VIO ID (fisSayac)', grupKod: 'PRG' })
		})
	}
	
	tbWhereClauseDuzenle(e = {}) {
		super.tbWhereClauseDuzenle(e)
		let uygunmu = (
			this.tbWhereClauseDuzenle_ilk(e) !== false &&
			this.tbWhereClauseDuzenle_son(e) !== false
		)
		if (!uygunmu) {
			let { where: wh } = e
			wh.add('1 = 2')
		}
		return uygunmu
	}

	tbWhereClauseDuzenle_ilk(e = {}) {
		let eIslemTipSet
		;{
			let { value: eIslTipler } = this.eIslemBirKismi
			if (!empty(eIslTipler))
				eIslemTipSet = asSet(eIslTipler)
		}
		
		let { table } = e
		let args = { ...e, eIslemTipSet }
		switch (table) {
			case 'piffis':
				return this.tbWhereClauseDuzenle_pifFis(args)
			case 'sipfis':
				return this.tbWhereClauseDuzenle_sipFis(args)
			case 'stfis':
				return this.tbWhereClauseDuzenle_stFis(args)
			case 'topmakbuzara':
				return this.tbWhereClauseDuzenle_sutMakbuzFis(args)
		}

		return true
	}
	tbWhereClauseDuzenle_son(e = {}) {
		let uygunmu = this.tbWhereClauseDuzenle_kisit(e) !== false
		uygunmu = uygunmu && this.tbWhereClauseDuzenle_ortak(e) !== false
		uygunmu = uygunmu && this.tbWhereClauseDuzenle_eIslem(e) !== false
		return uygunmu
	}
	tbWhereClauseDuzenle_kisit(e) {
		let eConf = this.eConf ?? MQEConf.getInstance()
		let { kisitUyarlanmis: kisit } = eConf
		if (!kisit?.kullanilirmi)
			return
		
		let { table, where: wh, alias, aliasVeNokta } = e
		let { magaza: magazami } = kisit
		let alinmazPSTipSet = {}
		switch (table) {
			case 'piffis':
				if (kisit.fatura) {
					wh.add(`NOT (fis.piftipi = 'F' and fis.almsat <> 'M')`)
					alinmazPSTipSet.sipfis = true
				}
				if (kisit.irsaliye) {
					wh.add(`fis.piftipi <> 'I'`)
					alinmazPSTipSet.stfis = true
				}
				if (magazami)
					wh.add(`not (fis.piftipi = 'F' and fis.ayrimtipi = 'PR')`)
				if (kisit.musMakbuz) {
					wh.add(`not (fis.piftipi = 'F' and fis.almsat = 'M')`)
					alinmazPSTipSet.topmakbuzara = true
				}
				break
		}
		
		if (alinmazPSTipSet[table])
			return false
	}
	tbWhereClauseDuzenle_ortak(e = {}) {
		let { table, alias, aliasVeNokta, where: wh } = e
		let { value: hataliSeriGoster } = this.uygunOlmayanlarGosterilirmiFlag
		let sutMakbuzmu = table == 'topmakbuzara'
		let cl = {
			seri: sutMakbuzmu ? 'makbuzseri' : 'seri',
			noYil: sutMakbuzmu ? 'makbuznoyil' : 'noyil',
			no: sutMakbuzmu ? 'makbuzno' : 'no',
			
		}
		
		wh.add(`fis.silindi = ''`, `fis.ozelisaret <> '*'`)
		if (!hataliSeriGoster) {
			wh.add(
				`LEN(${aliasVeNokta}${cl.seri}) = 3`,
				`${aliasVeNokta}${cl.noYil} > 0`
			)
		}
		;{
			wh
				.birKismi(this.sube, 'fis.bizsubekod')
				.basiSonu(this.tarih, 'fis.tarih')
				.basiSonu(this.seri, `${aliasVeNokta}${cl.seri}`)
				.basiSonu(this.fisNo, `${aliasVeNokta}${cl.no}`)
		}
	}
	tbWhereClauseDuzenle_sutMakbuz(e = {}) {
		let { alias, aliasVeNokta, where: wh } = e
		let ustAliasVeNokta = 'ust.'
		wh.add(
			`${ustAliasVeNokta}silindi = ''`,
			`${ustAliasVeNokta}ozelisaret <> '*'`
		)
		if (this.uygunOlmayanlarGosterilirmiFlag.value)
			wh.add(`LEN(${aliasVeNokta}makbuzseri) = 3`, `${aliasVeNokta}makbuznoyil > 0`)
		wh.birKismi(this.sube, `${ustAliasVeNokta}bizsubekod`)
		wh.basiSonu(this.tarih, `${ustAliasVeNokta}tarih`)
		wh.basiSonu(this.seri, `${aliasVeNokta}makbuzseri`)
		wh.basiSonu(this.no, `${aliasVeNokta}makbuzno`)
	}
	tbWhereClauseDuzenle_cari(e = {}) {
		let { alias, aliasVeNokta, where: wh } = e
		wh.basiSonu(this.must, 'car.must'); wh.ozellik(this.mustUnvan1, 'car.birunvan')
	}
	tbWhereClauseDuzenle_eIslem(e = {}) {
		let { alias, aliasVeNokta, where: wh, eIslemTipSet } = e
		let { eIslemBirKismi, akibetDurumBirKismi } = this
		if (eIslemTipSet && (eIslemTipSet.E || eIslemTipSet.A))
			eIslemTipSet[''] = true
		
		wh.add(`${aliasVeNokta}efayrimtipi <> 'BL'`)
		wh.basiSonu(this.gonderimTarihi, `${aliasVeNokta}efgonderimts`);
		if (!empty(eIslemTipSet))
			wh.birKismi(keys(eIslemTipSet), `${aliasVeNokta}efayrimtipi`)
		if (!empty(eIslemBirKismi.value))
			wh.birKismi(eIslemBirKismi, `${aliasVeNokta}efayrimtipi`)
		if (!empty(akibetDurumBirKismi.value))
			wh.birKismi(akibetDurumBirKismi, `${aliasVeNokta}efatonaydurumu`)
		wh.ozellik(this.uuid, `${aliasVeNokta}efatuuid`)
		
		let xmlDurum = this.xmlDurumSecim.tekSecim
		if (!xmlDurum.hepsimi)
			wh.add(`${aliasVeNokta}efatuuid ${xmlDurum.bumu ? '<>' : '='} ''`)
		let gonderimDurum = this.gonderimDurumSecim.tekSecim
		if (!gonderimDurum.hepsimi)
			wh.add(`${aliasVeNokta}efgonderimts IS${gonderimDurum.digermi ? ' NOT' : ''} NULL`)
	}
	tbWhereClauseDuzenle_pifFis(e) {
		let { eIslemTipSet: eTip, alias, aliasVeNokta, where: wh } = e
		let { tekSecim: faturaAyrim } = this.faturaAyrimSecim
		let { hepsimi: fatTipHepsimi, bumu: magazami, digermi: faturami } = faturaAyrim
		
		let ayrimDizi = []
		if (fatTipHepsimi || faturami) {
			ayrimDizi.push('', 'IK', 'KN', 'FS', 'EX', 'FY')
			if (!eTip || eTip.IH)
				ayrimDizi.push('IH', 'MI')
		}
		if (fatTipHepsimi || magazami)
			ayrimDizi.push('PR')


		// IIF(fis.almsat = 'T', 1, 0) <> IIF(fis.iade = 'I', 1, 0)
		let atClause = `IIF(fis.almsat = 'T', 1, 0) <> IIF(fis.iade = 'I', 1, 0)`
		let pifDizi = []
		if (!eTip || (eTip.A || eTip.E || eTip.IH || eTip.MS))
			pifDizi.push('F')
		if (!eTip || eTip.IR)
			pifDizi.push('I')
		
		wh.add(new MQOrClause([
			new MQAndClause([
				{ inDizi: pifDizi, saha: `${aliasVeNokta}piftipi` },
				atClause,
				{ inDizi: ayrimDizi, saha: `${aliasVeNokta}ayrimtipi` }
			]),
			( !eTip || eTip.IR ? new MQAndClause([
				`${aliasVeNokta}piftipi = 'F'`,
				`${aliasVeNokta}almsat = 'T'`,
				`${aliasVeNokta}iade = ''`,
				`${aliasVeNokta}ayrimtipi = 'EM'`
			]) : null ),
			( !eTip || eTip.MS ? new MQAndClause([
				`${aliasVeNokta}piftipi = 'F'`,
				`${aliasVeNokta}almsat = 'M'`,
				`${aliasVeNokta}iade = ''`,
				{ inDizi: ['', 'SM'], saha: `${aliasVeNokta}ayrimtipi` }
			]) : null )
		].filter(Boolean)))
	}
	tbWhereClauseDuzenle_sipFis(e = {}) {
		let { eIslemTipSet: eTip, alias, aliasVeNokta, where: wh } = e
		if (eTip && !(eTip.A || eTip.E))
			return false

		let { eskiEmanet } = app.params?.satis?.kullanim ?? {}
		if (!eskiEmanet)
			return false
		
		let ozelTip2AlimSat2Ayrimlar = {}
		let dizici = e => {
			let { ozelTip, almSat, ayrimlar } = e
			let almSat2Ayrimlar = ozelTip2AlimSat2Ayrimlar[ozelTip] ??= {}
			let _ayrimlar = almSat2Ayrimlar[almSat] ?? {}
			if (!empty(ayrimlar))
				extend(_ayrimlar, (isArray(ayrimlar) ? asSet(ayrimlar) : ayrimlar))
		}
		
		let or = new MQOrClause()
		if (!eTip || (eTip.A || eTip.E))
			dizici({ ozelTip: 'E', almSat: 'T', ayrimlar: ['EM'] })
		
		for (let ozelTip in ozelTip2AlimSat2Ayrimlar) {
			let almSat2Ayrimlar = ozelTip2AlimSat2Ayrimlar[ozelTip]
			for (let almSat in almSat2Ayrimlar) {
				let ayrimlar = keys(almSat2Ayrimlar[almSat] ?? {})
				or.add(new MQAndClause([
					{ degerAta: ozelTip, saha: `${aliasVeNokta}ozeltip` },
					{ degerAta: almSat, saha: `${aliasVeNokta}almsat` },
					{ inDizi: ayrimlar, saha: `${aliasVeNokta}ayrimtipi` }
				]).parantezli())
			}
		}
		if (!empty(or.liste))
			wh.add(or)
	}
	tbWhereClauseDuzenle_stFis(e = {}) {
		let { eIslemTipSet: eTip, alias, aliasVeNokta, where: wh } = e
		if (eTip && !eTip.IR)
			return false
		
		wh
			.degerAta('T', `${aliasVeNokta}gctipi`)
			.add(...[
				new MQOrClause()
					.add(
						new MQAndClause()
							 .add(`${aliasVeNokta}fisekayrim = ''`)
							 .inDizi(['SB', 'FS', 'IR'], `${aliasVeNokta}ozeltip`)
					)
					.add(
						new MQAndClause()
							 .add(`${aliasVeNokta}fisekayrim = 'SC'`)
							 .add(`${aliasVeNokta}ozeltip = ''`)
					)
			])
	}
	tbWhereClauseDuzenle_sutMakbuzFis(e) {
		let { eIslemTipSet: eTip, alias, aliasVeNokta, where: wh } = e
		if (eTip && !eTip.MS)
			return false
		
		wh.add(`fis.fistipi = 'M'`)
	}
}
