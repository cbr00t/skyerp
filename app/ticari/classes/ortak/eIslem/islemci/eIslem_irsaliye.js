class EIslIrsaliye extends EIslTicariOrtak {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	static get eIrsaliyemi() { return true }
	static get xml_customizationID() { return 'TR1.2.1' }
	static get tip() { return 'IR' }
	static get altBolum() { return 'EIrsaliye' }
	static get sinifAdi() { return 'e-İrsaliye' }
	static get kisaAdi() { return 'e-İrs' }
	static get paramSelector() { return 'eIrsaliye' }
	static get xmlTipBelirtec() { return 'DespatchAdvice' }
	static get xmlDetayTag() { return 'cac:DespatchLine' }
	static get xmlTagPF_senderParty() { return 'DespatchSupplierParty' }
	static get xmlTagPF_receiverParty() { return 'DeliveryCustomerParty' }

	async onKontrolMesajlarDuzenle(e) {
		await super.onKontrolMesajlarDuzenle(e)
	}
	static eFisBaslikVeDetayStm_araSentDuzenle({ fisTable, harTable, uni, sent }) {
		// super.eFisBaslikVeDetayStm_araSentDuzenle(...arguments)
		let { sqlEmpty } = Hareketci_UniBilgi.ortakArgs
		let { isyeri: { unvan: isyUnvan = '', vknTckn: isyVknTckn, yore: isyYore, ilAdi: isyIlAdi } } = app.params
		let c = {
			isyUnvan: isyUnvan.sqlServerDegeri(),
			isyVknTckn: isyVknTckn.sqlServerDegeri(),
			isyYore: isyYore.sqlServerDegeri(),
			isyIlAdi: isyIlAdi.sqlServerDegeri(),
			teslim(attr, cariClause, sevkClause) {
				return `${new MQCase()
					.setClause('fis.xadreskod')
					.when(sqlEmpty, cariClause)
					.else(sevkClause)
				} ${attr}`
			},
			tasimaSoforAdi(ind, soforAlinmaz) {
				return new MQCase()
					.when(
						`fis.tasima${ind}sayac IS NULL`,
						soforAlinmaz
							? sqlEmpty
							: new MQCase()
								.when(`fis.tasimasoforkod${ind} = ${sqlEmpty}`, sqlEmpty)
								.else(`sof${ind}.aciklama`)
					)
					.else(`tas${ind}.soforadi`)
			   // when fis.tasima2sayac IS NULL then (case fis.tasimasoforkod2 = '' then '' else sof2.aciklama end) else tas2.soforadi
			},
			tasimaSoforTC(ind, soforAlinmaz) {
				return new MQCase()
					.when(
						`fis.tasima${ind}sayac IS NULL`,
						soforAlinmaz
							? sqlEmpty
							: new MQCase()
								.when(`fis.tasimasoforkod${ind} = ${sqlEmpty}`, sqlEmpty)
								.else(`sof${ind}.tckimlikno`)
					)
					.else(`tas${ind}.sofortckimlik`)
				   // when fis.tasima2sayac IS NULL then (case fis.tasimasoforkod2 = '' then '' else sof2.tckimlikno end) else tas2.sofortckimlik
			}
		}
		
		let { where: wh, sahalar } = sent
		sent
			.leftJoin('fis', 'carsevkadres sadr', 'fis.xadreskod = sadr.kod')
			.leftJoin('sadr', 'caril sil', 'sadr.ilkod = sil.kod')
			.leftJoin('fis', 'aracsofor sof1', 'fis.tasimasoforkod = sof1.kod')
			.leftJoin('fis', 'aracsofor sof2', 'fis.tasimasoforkod2 = sof2.kod')
			.leftJoin('fis', 'arac arc', 'fis.tasimaarackod = arc.kod')
			.leftJoin('nak', 'carmst ncar', 'nak.mustkod = ncar.must')
			.leftJoin('ncar', 'caril nil', 'ncar.ilkod = nil.kod')
			// .fromIliski('naksekli nak', 'fis.nakseklikod = nak.kod')              // ust seviyede var
			.leftJoin('fis', 'tasima tas1', 'fis.tasimasayac = tas1.kaysayac')
			.leftJoin('fis', 'tasima tas2', 'fis.tasima2sayac = tas2.kaysayac')
			.leftJoin('fis', 'tasima tas3', 'fis.tasima3sayac = tas3.kaysayac')
		sahalar.add(...[
			...[
				c.teslim('teslimAdres', 'car.biradres', 'sadr.biradres'),
				c.teslim('teslimYore', 'car.yore', 'sadr.yore'),
				c.teslim('teslimIlKod', 'cil.kod', 'sil.kod'),
				c.teslim('teslimIlAdi', 'cil.aciklama', 'sil.aciklama'),
				c.teslim('teslimPosta', 'car.posta', 'sadr.posta')
			],
			...[
				`${new MQCase()
					.when(
						`fis.tasimasayac IS NULL`,
						new MQCase()
							.setClause('fis.tasimaarackod')
							.when(sqlEmpty, sqlEmpty)
							.else('arc.plaka')
					)
					.else('tas1.aracplaka')} plaka`,
				`${new MQCase()
					.when(
						`fis.tasimasayac IS NULL`,
						new MQCase()
							.setClause('fis.tasimasoforkod')
							.when(sqlEmpty,
								new MQCase()
								  .setClause('fis.nakseklikod')
									.when(sqlEmpty, c.isyUnvan)
									.else('nak.aciklama')
							 )
							.else('sof1.aciklama')
					)
					.else('tas1.soforadi')} sofor1Adi`,
				`${new MQCase()
					.when(
						`fis.tasimasayac IS NULL`,
						new MQCase()
							.setClause('fis.tasimasoforkod')
							.when(sqlEmpty, c.isyVknTckn)
							.else('sof1.tckimlikno')
					)
					.else('tas1.sofortckimlik')} sofor1VknTckn`
			],
			...[
				`${c.tasimaSoforAdi(2)} sofor2Adi`,
				`${c.tasimaSoforTC(2)} sofor2VknTckn`,
				`${c.tasimaSoforAdi(3, true)} sofor3Adi`,
				`${c.tasimaSoforTC(3, true)} sofor3VknTckn`
			],
			...[
				`COALESCE(NULLIF(RTRIM(${new MQCase()
					.when(
						new MQAndClause([`fis.tasimasayac IS NULL`, `fis.tasimasoforkod <> ${sqlEmpty}`]),
						'sof1.tckimlikno'
					)
					.when(
						new MQAndClause([`fis.tasimasayac IS NOT NULL`, `tas1.nakliyetipi IN ('', 'F')`]),
						'tas1.sofortckimlik'
					)
					.when(
						`fis.tasimasayac IS NOT NULL AND tas1.nakliyetipi = 'S'`,
						'tas1.nakliyecivkn'
					)
				   .else(c.isyVknTckn)
				}), ''), CASE WHEN ncar.sahismi <> '' THEN ncar.tckimlikno ELSE ncar.vnumara END, '') nakVknTckn`,
				`COALESCE(NULLIF(RTRIM(${new MQCase()
					.when(
						new MQAndClause([`fis.tasimasayac IS NULL`, `fis.tasimasoforkod <> ${sqlEmpty}`]),
						'sof1.aciklama'
					)
					.when(
						new MQAndClause([`fis.tasimasayac IS NOT NULL`, `tas1.nakliyetipi IN ('', 'F')`]),
						'tas1.soforadi'
					)
				   .when(
						`fis.tasimasayac IS NOT NULL AND tas1.nakliyetipi = 'S'`,
						'tas1.nakliyeciunvan'
					)
				   .else(c.isyUnvan)
				}), ''), ncar.birunvan, '') nakUnvan`
			],
			...[
				`COALESCE(NULLIF(RTRIM(${new MQCase()
				   .when(
						`(fis.tasimasayac IS NULL OR tas1.nakliyetipi = 'B')`,
						c.isyYore
					)
				   .else(sqlEmpty)
				}), ''), ncar.yore, '') nakYore`,
				`COALESCE(NULLIF(RTRIM(${new MQCase()
				   .when(
						`(fis.tasimasayac IS NULL OR tas1.nakliyetipi = 'B')`,
						c.isyIlAdi
					)
				   .else(sqlEmpty)
				}), ''), nil.aciklama, '') nakIlAdi`
			]
		])
	}

	
	xmlGetProfileID(e) { return 'TEMELIRSALIYE' }
	xmlGetBelgeTipKodu(e) { return 'SEVK' }
	async xsltDuzenle(e) {
		await super.xsltDuzenle(e)
	}
	xmlDuzenle_notes_son(e) {
		super.xmlDuzenle_notes_son(e)
	}
	xmlDuzenle_detayDevam_item_additionalItemIds({ xw, detay: det }) {
		let { kullanim } = app.params.eIslem
		let { satirEIrsKoli } = kullanim ?? {}
		
		super.xmlDuzenle_detayDevam_item_additionalItemIds(...arguments)
		if (!satirEIrsKoli)
			return
		
		let bilgi = this.getKoliBilgi(det)
		if (!bilgi)
			return
		
		let { koli, cinsi, icAdet, gorunum } = bilgi
		for (let [key, value] of entries({ KOLI_ADET: koli, KOLI_CINSI: cinsi, KOLI_ICI_ADET: icAdet, KOLI_GORUNUM: gorunum }))
			this.xmlDuzenleInternal_detAdditionalIdent({ xw, schemeID: key, id: value })
	}
	xmlDuzenle_doviz(e) { }
	xmlDuzenle_lineCountNumeric(e) { }
	xmlDuzenle_detayDevam_bedel(e) {
		let { kullanim } = app.params.eIslem
		let { irsDetayBedel } = kullanim ?? {}
		if (irsDetayBedel)
			super.xmlDuzenle_detayDevam_bedel(e)
	}
	xmlDuzenle_detayDevam_notes(e) {
		if (e.detay.aciklamalar?.some(Boolean))
			super.xmlDuzenle_detayDevam_notes(e)
	}
	xmlDuzenle_detayDevam_siparisSatirBaglantisi({ xw, seq }) {
		xw.writeElementBlock('cac:OrderLineReference', null, () =>
			xw.writeElementString('cbc:LineID', seq))
	}

	async xmlDuzenle_docRefs_ara({ xw }) {
		await super.xmlDuzenle_docRefs_ara(...arguments)
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		await this.xmlDuzenleInternal_docRefParam({ xw, name: 'FIYATBEDEL_GOSTERILIR', value: irsDetayBedel })
	}
	async xmlDuzenle_detaylarOncesi(e) {
		await super.xmlDuzenle_detaylarOncesi(e)
		this.xmlDuzenle_shipment(e)
	}
	xmlDuzenle_shipment({ xw }) {
		/*<cac:TransportMeans>
				<cac:RoadTransport>
					<cbc:LicensePlateID schemeID="PLAKA"> 42 ASS 330</cbc:LicensePlateID>
				</cac:RoadTransport>
			</cac:TransportMeans>
			<cac:DriverPerson>
			<cbc:FirstName>ABDULLAH</cbc:FirstName>
			<cbc:FamilyName>ÖZTAŞ</cbc:FamilyName>
			<cbc:Title/>
			<cbc:NationalityID>51100361164</cbc:NationalityID>
			</cac:DriverPerson>*/
		
		let { baslik, class: { ihracatmi, defaultCountryName } } = this
		let { sevkTarihStr, sevkSaatStr, rec } = baslik
		let { teslimYore, teslimIlKod, teslimIlAdi, teslimPosta, teslimAdres, plaka } = rec
		let { sofor1Adi, sofor1VknTckn, sofor2Adi, sofor2VknTckn, sofor3Adi, sofor3VknTckn } = rec
		let { nakVknTckn, nakUnvan, nakYore, nakIlAdi } = rec
		
		// Vio uyumu: hiçbir şoför adı yoksa temsili varsayılan kullanılır
		let varsayilanSofor = ![1, 2, 3].some(i =>
			rec[`sofor${i}Adi`]?.trim())
		xw.writeElementBlock('cac:Shipment', null, () => {
			xw
				.writeElementString('cbc:ID', '')
				.writeElementBlock('cac:ShipmentStage', null, () => {
					if (plaka) {
						xw.writeElementBlock('cac:TransportMeans', null, () =>
						xw.writeElementBlock('cac:RoadTransport', null, () =>
							xw.writeElementString('cbc:LicensePlateID', plaka, null, { schemeID: 'PLAKA' })
						))
					}
					for (let i = 1; i <= 3; i++) {
						let soforAdi = rec[`sofor${i}Adi`]
						let vknTckn = rec[`sofor${i}VknTckn`] ?? ''
						if (i == 1 && varsayilanSofor) {
							soforAdi = 'Sofor'
							vknTckn ||= '11111111111'
						}
						
						if (soforAdi) {
							xw.writeElementBlock('cac:DriverPerson', null, () => {
								let sahismi = vknTckn.length == 11
								if (sahismi) {
									let { adi, soyadi } = getAdiSoyadi(soforAdi) ?? {}
									if (i == 1 && varsayilanSofor) {
										adi = soforAdi
										soyadi = '.'
									}
									xw
										.writeElementString('cbc:FirstName', adi || '.')
										.writeElementString('cbc:FamilyName', soyadi || '.')
										.writeElementString('cbc:Title', '')
								}
								else
									xw.writeElementString('cbc:Title', soforAdi)
								xw.writeElementString('cbc:NationalityID', vknTckn)
							})
						}
					}
				})
				.writeElementBlock('cac:Delivery', null, () => {
					xw
						.writeElementBlock('cac:DeliveryAddress', null, () => {
							xw
								.writeElementString('cbc:Room', 0)
								.writeElementString('cbc:StreetName', teslimAdres || '.')
								.writeElementString('cbc:BuildingName', '.')
								.writeElementString('cbc:BuildingNumber', 0)
								.writeElementString('cbc:CitySubdivisionName', teslimYore)
								.writeElementString('cbc:CityName', teslimIlAdi)
								.writeElementString('cbc:PostalZone', normalizePostaKod(teslimPosta, teslimIlKod, ihracatmi))
								.writeElementString('cbc:Region', '.')
								.writeElementBlock('cac:Country', null, () =>
									xw.writeElementString('cbc:Name', defaultCountryName))
						})
						.writeElementBlock('cac:CarrierParty', null, () => {
							//nakVknTckn, nakUnvan, nakYore, nakIlAdi
							let sahismi = nakVknTckn?.length == 11
							let schemeID = sahismi ? 'TCKN' : 'VKN'
							;{
								xw
									.writeElementBlock('cac:PartyIdentification', null, () =>
										xw.writeElementString('cbc:ID', nakVknTckn, null, { schemeID }))
									.writeElementBlock('cac:PartyName', null, () =>
										xw.writeElementString('cbc:Name', nakUnvan))
									.writeElementBlock('cac:PostalAddress', null, () => {
										xw
											.writeElementString('cbc:CitySubdivisionName', nakYore)
											.writeElementString('cbc:CityName', nakIlAdi)
											.writeElementBlock('cac:Country', null, () =>
												xw.writeElementString('cbc:Name', defaultCountryName))
								})
							}
						})
						.writeElementBlock('cac:Despatch', null, () => {
							xw
								.writeElementString('cbc:ActualDespatchDate', sevkTarihStr)
								.writeElementString('cbc:ActualDespatchTime', sevkSaatStr)
							
						})
				})
		})
	}
	xmlDuzenle_detayDevam_miktar({ xw, detay: det }) {
		let { stokBirim: { brmDict = {} } } = app.params
		let { miktar, brm } = det
		let { [brm]: { intKod } = {} } = brmDict
		intKod ||= brm

		xw.writeElementString('cbc:DeliveredQuantity', miktar || 0, null, { unitCode: intKod })
		/*xw.writeElementBlock('cbc:DeliveredQuantity', null, () => {
			xw
				.writeAttributeString('unitCode', intKod)
				.writeString(miktar || 0)
		})*/
	}

	xmlDuzenle_docRefs_yalnizYazisi(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_docRefs_yalnizYazisi(e)
	}
	xmlDuzenle_allowanceCharge(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_allowanceCharge(e)
	}
	xmlDuzenle_taxTotal(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_taxTotal(e)
	}
	xmlDuzenle_tevkifatli_taxTotal(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_tevkifatli_taxTotal(e)
	}
	xmlDuzenle_legalMonetaryTotal(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_legalMonetaryTotal(e)
	}
	
	xmlDuzenle_detayDevam_taxTotal(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_detayDevam_taxTotal(e)
	}
	xmlDuzenle_detayDevam_tevkifatli_taxTotal(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_detayDevam_tevkifatli_taxTotal(e)
	}
	xmlDuzenle_detayDevam_item_additionalItemIds_netFiyat(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_detayDevam_item_additionalItemIds_netFiyat(e)
	}
	xmlDuzenle_detayDevam_item_additionalItemIds_ikGosterim(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_detayDevam_item_additionalItemIds_ikGosterim(e)
	}

	xmlDuzenle_detayDevam_fiyat(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_detayDevam_fiyat(e)
	}
	xmlDuzenle_detayDevam_allowanceCharge(e) {
		let { eIslem } = app.params
		let { irsDetayBedel } = eIslem.kullanim
		if (irsDetayBedel)
			super.xmlDuzenle_detayDevam_allowanceCharge(e)
	}
}
