class EIslGiden extends EIslemOrtak {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get gidenmi() { return true }

    static getEFisBaslikVeDetayStm(e = {}) {
		let { table2IDListe, whereDuzenleyici: genelWhereDuzenleyici } = e
		let { eArsivmi } = this
		if (isFunction(table2IDListe))
			table2IDListe = table2IDListe.call(this, e)
		
		let uni = new MQUnionAll()
		let fhBagla = e.fhBagla = ({ fisTable, harTable, idListe }) => {
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
				.inDizi(idListe, 'fis.id')
				.add(
					`fis.ozelisaret <> '*'`,
					new MQOrClause([
						`(fis.almsat = 'T' and fis.iade = '')`,
						`(fis.almsat = 'A' and fis.iade = 'I')`
					])
				)
			sahalar.addAll([
				`${fisTable.sqlServerDegeri()} _table`,
				`${harTable.sqlServerDegeri()} harTable`,
				`fis.bizsubekod`, 'fis.id', 'fis.kaysayac fisSayac', 'fis.iade', 'fis.ayrimtipi fisAyrim',
				'fis.fistipi fisTipi', 'fis.efayrimtipi eIslTip',
				'fis.tarih', 'fis.fisnox fisNox', 'fis.sevktarihi sevkTarih', 'fis.sevksaati sevkSaat',
				'fis.ortalamavade', 'car.earsivbelgetipi eaGonderimTipi', 'fis.kdvistisnaturu',
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
			let args = { ...e, idListe, fisTable, harTable, uni, sent, where: wh }
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
			let fisTable = 'piffis'
			let idListe = table2IDListe[fisTable]
			if (!empty(idListe)) {
				;{
					let sent = fhBagla({ fisTable, harTable: 'pifstok', idListe })

					if (sent) {
						sent.where.add(`fis.ayrimtipi NOT IN ('FS', 'FY', 'IN')`)				// PR -magaza da alinir
						stokBagla({ sent })
					}
				}
				;{
					let sent = fhBagla({ fisTable, harTable: 'pifhizmet', idListe })
					if (sent) {
						sent.where.add(`fis.ayrimtipi NOT IN ('FS', 'FY', 'IN', 'PR')`)
						hizmetBagla({ sent })
					}
				}
				;{
					let sent = fhBagla({ fisTable, harTable: 'piffsstok', idListe })
					if (sent) {
						sent.where.add(`fis.ayrimtipi IN ('FS', 'FY')`)
						hizmetBagla({ sent })
					}
				}
			}
		}
		;{
			let fisTable = 'sipfis'
			let idListe = table2IDListe[fisTable]
			if (!empty(idListe)) {
				let sent = fhBagla({ fisTable, harTable: 'sipstok', idListe })
				if (sent) {
					sent.where.add(`NOT (fis.ayrimtipi = 'EM' OR fis.ozeltip = 'E')`)
					stokBagla({ sent })
				}
			}
		}
		
		let orderBy = ['tarih', '_table', 'fisNox', 'fisSayac', 'seq']
		if (empty(uni.liste))
			return null
		
		return new MQStm({ sent: uni, orderBy })
	}
	static eFisBaslikVeDetayStm_araSentDuzenle({ fisTable, harTable, uni, sent, where: wh }) { }

	
	/*getTablo2EkIslem_xmlOlustur = () {
		let tablo2EkIslem = {}
		tablo2EkIslem['piffis'] = (e) => {
			let { sent, sentEkleyici } = e
			sent.fis2hareketBagla('pifstok')
				.har2StokBagla()
				.fis2CariBagla()
			sent.sahalar
				.add(['har.miktar', 'stk.kod shkod', 'stk.aciklama shadi', 'stk.brm'])
	
			sentEkleyici()		// union yeni ek
			sent.fis2hareketBagla('pifhizmet')
				.har2HizmetBagla()
				.fis2CariBagla()
			sent.sahalar
				.add(['har.miktar', 'hiz.kod shkod', 'hiz.aciklama shadi', 'hiz.brm'])
			}
		tablo2EkIslem['sipfis'] = (e) => {
			let { sent, sentEkleyici } = e
			sent.fis2hareketBagla('sipstok')
				.har2StokBagla()
				.fis2CariBagla()
			sent.sahalar
				.add(['har.miktar', 'stk.kod shkod', 'stk.aciklama shadi', 'stk.brm'])
	
			sentEkleyici()		// union yeni ek
			sent.fis2hareketBagla('siphizmet')
				.har2HizmetBagla()
				.fis2CariBagla()
			sent.sahalar
				.add(['har.miktar', 'hiz.kod shkod', 'hiz.aciklama shadi', 'hiz.brm'])
			}
		tablo2EkIslem['stfis'] = (e) => {
			let { sent, sentEkleyici } = e
			sent.fis2hareketBagla('ststok')
				.har2StokBagla()
				.fromIliski('carmst car', 'fis.irsmust=car.must')
			sent.sahalar
				.add(['har.miktar', 'stk.kod shkod', 'stk.aciklama shadi', 'stk.brm'])
			}
		tablo2EkIslem['topmakbuzara'] = (e) => {
			let { sent } = e
			sent.fromIliski('topmakbuzfis fis', 'ara.fissayac=fis.kaysayac')
				.fromIliski('topmakbuzstok har', 'ara.kaysayac=har.arasayac')
				.har2StokBagla()
				.fromIliski('carmst car', 'ara.mustahsilkod=car.must')
			sent.sahalar
				.add(['har.miktar'])
			}
		return tablo2EkIslem
	}
	
	
	// ornek cagrim - xmlolustur icin
	let ortakIslem_xmlOlustur = (e) {
		let { sent } = e
		sent.sahalar
			.add(['car.must mustkod', 'car.birunvan', 'fis.fisnox fisNox', 'fis.tarih'])
	}

	
	getTablo2EkIslem_listeleme = () {
		let tablo2EkIslem = {}
		tablo2EkIslem['piffis'] = (e) => {
			let { sent, sentEkleyici } = e
			sent.fis2CariBagla()
			sent.sahalar.add(['fisdvkod dvKod', 'fis.net sonucBedel'])
				}
		tablo2EkIslem['sipfis'] = (e) => {
			let { sent, sentEkleyici } = e
			sent.fis2CariBagla()
			sent.sahalar.add(['fis.dvkod dvKod', 'fis.net sonucBedel'])
		}
		tablo2EkIslem['topmakbuzara'] = (e) => {
			let { sent } = e
			sent.fromIliski('topmakbuzfis fis', 'ara.fissayac=fis.kaysayac')
				.fromIliski('topmakbuzstok har', 'ara.kaysayac=har.arasayac')
				.fromIliski('carmst car', 'ara.mustahsilkod=car.must')
			sent.sahalar.add([''' dvKod', 'sum(har.sonuc) sonuc'])
		}
		return tablo2EkIslem
	}
	
	
	// ornek cagrim - xmlolustur icin
	let ortakIslem_listeleme = (e) {
		let { sent, tablo } = e
		let als = getTablo2Alias[tablo] || 'fis'
		sent.sahalar
			.add(['car.must mustkod', 'car.birunvan', 'fis.fisnox fisNox', 'fis.tarih'])
		.addWithAlias(als,
			id, kaysayac fisSayac, tarih, fisnox fisNox, efimzats efImzaTS, gonderimts efGonderimTS,
			efayrimtipi eIslTip, efatonaydurum onayDurum(akibet),
			uuid, zorunluUUID, dvKod, sonucBedel
		)
	}



	tabloKernelQueryci( tablo2IDListe: null
			, filtreInst: new EIslemFiltre()	// ..kisitlama yapilir..
			, tablo2EkIslem: getTablo2EkIslem_xmlOlustur()
			, ortakIslem_xmlOlustur
		)

	tabloKernelQueryci( tablo2IDListe: null
			, filtreInst: new EIslemFiltre()	// ..kisitlama yapilir..
			, tablo2EkIslem: getTablo2EkIslem_listeleme()
			, ortakIslem_listeleme
		)
	

	id, fisSayac, tarih, fisNox, efImzaTS, efGonderimTS eIslTip, onayDurum(akibet), mustKod, mustUnvan, uuid, zorunluUUID, dvKod, sonucBedel*/
}
