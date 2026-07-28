(function() {
extend(DRapor_KarZararTablosu.prototype, {
	getPanels(e = {}) {
		let { innerHeight: maxH } = window
		return {
			satis: new AccPanel()
				.setTitle('Satışlar')
				.setExpanded()
				.setHeight(maxH * .45)
				.add(...[
					new AccPanelGrid()
						.setId('satis')
						.fullWH()
						//.setUserData({ keyFields: ['stokKod', 'stokAdi', 'grupKod', 'grupAdi'] })
						.setToplamBelirtec('stokAdi')
						.widgetArgsDuzenleIslemi(({ args }) => {
							extend(args, {
								showGroupsHeader: true, rowsHeight: 50, showGroupAggregates: false,
								groupsExpandedByDefault: true
							})
						})
						.setTabloKolonlari(_e => {
							return [
								...MQCogul.getKAKolonlar(
									new GridKolon({ belirtec: 'shKod', text: 'Stok', genislikCh: 20 }).checkedList(),
									new GridKolon({ belirtec: 'shAdi', text: 'Stok Adı', genislikCh: 50 }).checkedList()
								),
								...MQCogul.getKAKolonlar(
									new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 10 }).tipDecimal().checkedList().sum(),
									new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 5 }).checkedList(),
									true    // mini için ters sıra
								),
								...MQCogul.getKAKolonlar(
									new GridKolon({ belirtec: 'miktar2', text: 'Miktar 2', genislikCh: 10 }).tipDecimal().checkedList().sum(),
									new GridKolon({ belirtec: 'brm2', text: 'Br2', genislikCh: 5 }).checkedList(),
									true    // mini için ters sıra
								),
								...MQCogul.getKAKolonlar(
									new GridKolon({ belirtec: 'brutBedel', text: 'Brüt Bedel', genislikCh: 13 }).tipDecimal_bedel().sum(),
									new GridKolon({ belirtec: 'iskonto', text: 'İskonto', genislikCh: 13 }).tipDecimal_bedel().sum(),
									true
								),
								new GridKolon({ belirtec: 'ciro', text: 'Ciro', genislikCh: 13 }).tipDecimal_bedel().sum(),
								...MQCogul.getKAKolonlar(
									new GridKolon({ belirtec: 'maliyet', text: 'Maliyet', genislikCh: 13 }).tipDecimal_bedel().sum(),
									new GridKolon({ belirtec: 'brutKar', text: 'Brüt Kar', genislikCh: 13 }).tipDecimal_bedel().sum(),
								),
								...MQCogul.getKAKolonlar(
									new GridKolon({ belirtec: 'kzOrani', text: 'K/Z%', genislikCh: 8 }).tipDecimal(1).avg(),
									new GridKolon({ belirtec: 'ciroKZOrani', text: 'Ciro K/Z%', genislikCh: 8 }).tipDecimal(1).avg(),
									true
								),
								new GridKolon({ belirtec: 'grupText', text: 'Grup', genislikCh: 25 }).checkedList(),
								new GridKolon({ belirtec: 'anaGrupText', text: 'Ana Grup', genislikCh: 10 }).checkedList()
							]
						})
						.setQuery(_e => {
							_e = { ...e, ..._e }
							let { sqlZero, sqlEmpty } = Hareketci_UniBilgi.ortakArgs
							let { params = {} } = app
							let { zorunlu, ticariGenel: { kullanim: ticGenel }, finans } = params
							let { ozelIsaret } = zorunlu
							let { karZararTabloMaliyettenBulunsun: kzMaliyetten } = finans
							let { takipNo } = ticGenel
							let { tanimPart: { inst, secimler: sec } } = e
							let { bekSipVeIrs: { value: bekSipVeIrs } } = sec
							let { stokMaliyetYontemi: { value: smYontem = {} } = {} } = sec
							// let { sadeceStoklar: { value: sadeceStoklar } } = sec
							let { kdvliBedel: { value: kdvliBedel } = {} } = sec
							let { gruplama: { tekSecim: gruplama } } = sec
							let { gruplamadaAnaGrup: { value: gruplamadaAnaGrup } } = sec
							
							let uni = new MQUnionAll()
							let fn = {
								pifUniEkle(harTable, duzenle) {
									let sent = _e.sent = new MQSent()
									let { where: wh, sahalar } = sent
									;{
										sent
											.fisHareket('piffis', harTable)
											.fromIliski('stkyer yer', 'har.detyerkod = yer.kod')
										if (bekSipVeIrs)
											sent.leftJoin('fis', 'irs2fat i2f', 'fis.kaysayac = i2f.irssayac')
									}
									;{
										_e.detTakipmi = false
										inst.sentDuzenle_pifOrtak(_e)
									}
									;{
										wh
											.basiSonu(sec.yerKod, 'har.detyerkod')
											.ozellik(sec.yerAdi, 'yer.aciklama')
										// ** secimler takip... bağlantısı 'sentDuzenle_fisOrtak' kısmında
										wh.add(`yer.bkarzararaalinmaz = 0`)
									}
									;{
										let args = { ..._e, sent, where: wh, harTable }
										duzenle?.call(this, args)
									}
									uni.add(sent)
									return sent
								},
								stokGrupla(sent) {
									let { where: wh, sahalar } = sent
									if (gruplama.digermi) {    // İst. Grup
										sent.stok2IstGrupBagla()
										sahalar.add('stk.sistgrupkod grupKod', 'sigrp.aciklama grupAdi')
										if (gruplamadaAnaGrup) {
											sent.fromIliski('stkistanagrup siagrp', 'sigrp.sanagrupkod = siagrp.kod')
											sahalar.add('sigrp.sanagrupkod anaGrupKod', 'siagrp.aciklama anaGrupAdi')
										}
									}
									else {                    // Normal Grup
										sent.stok2GrupBagla()    // ** önceden yapılmıştı ama tedbir olsun.
																 //        fromIliski() alias kontrollü çalışır, o yüzden sorun değil
										sahalar.add('stk.grupkod grupKod', 'grp.aciklama grupAdi')
										if (gruplamadaAnaGrup) {
											sent.stokGrup2AnaGrupBagla()
											sahalar.add('grp.anagrupkod anaGrupKod', 'agrp.aciklama anaGrupAdi')
										}
									}
									
									if (!gruplamadaAnaGrup)
										sahalar.add(`${sqlEmpty} anaGrupKod`, `${sqlEmpty} anaGrupAdi`)
								},
								demGrupla(sent) {    // ** demirbas icin ist. grup yoktur
									let { where: wh, sahalar } = sent
									if (!gruplama.digermi) {    // İst. Grup DEĞİLSE: Normal Grup
										sent.dem2GrupBagla()    // ** önceden yapılmıştı ama tedbir olsun.
																 //        fromIliski() alias kontrollü çalışır, o yüzden sorun değil
										sahalar.add('dem.grupkod grupKod', 'grp.aciklama grupAdi')    // ** dem2GrupBagla için de alias yine 'grp'diger
										if (gruplamadaAnaGrup) {
											sent.demGrup2AnaGrupBagla()
											sahalar.add('grp.anagrupkod anaGrupKod', 'agrp.aciklama anaGrupAdi')
										}
									}
									
									if (!gruplamadaAnaGrup)
										sahalar.add(`${sqlEmpty} anaGrupKod`, `${sqlEmpty} anaGrupAdi`)
								}
							}

							;{
								let cl = {
									kdvliEk: kdvliBedel ? ` + har.perkdv` : '',
									maliyet: (
										kzMaliyetten ? (
											smYontem.sonAlimmi ? `ROUND(stk.revizefiilialimfiyat * har.miktar, 2)` :
											smYontem.ortalamami ? `ROUND(stk.ortmalfiyat * (case when stk.smalduzbirimtipi = '2' then har.miktar2 else har.miktar end), 2)` :
											ozelIsaret ? `har.fmalhammadde + har.fmalmuh` : `har.malhammadde + har.malmuh`
										)
										: sqlZero
									)
								}

								// pifstok
								;{
									let sent = fn.pifUniEkle('pifstok')
									let { where: wh, sahalar } = sent
									sent
										.har2StokBagla()
										.stokYardimciBagla()
									
									wh.add('grp.bkarzararalinmaz = 0')

									sahalar.add(
										`(case when fis.piftipi in ('F', 'P') then '' else fis.piftipi end) bekTipi`,
										`'S' kayitTipi`, `har.stokkod shKod`, `COALESCE(har.degiskenadi, stk.aciklama) shAdi`,
										'stk.brm', 'stk.brm2', 'SUM(har.miktar) miktar', 'SUM(har.miktar2) miktar2',
										`SUM(har.brutbedel${cl.kdvliEk}) brutBedel`,
										`SUM((har.brutbedel - har.bedel) + har.dipiskonto) topIskonto`,
										`SUM(har.bedel - har.dipiskonto${cl.kdvliEk}) ciro`,
										`${cl.maliyet.asSumDeger()} maliyet`
									)
									fn.stokGrupla(sent)
								}
							}

							for (let sent of uni) {
								sent
									.groupByOlustur()
									.gereksizTablolariSil(['stk', 'grp'])
							}
							
							let stm = uni.asToplamStm(), { orderBy } = stm
							orderBy.liste = ['kayitTipi DESC', 'anaGrupKod', 'grupKod', 'bekTipi', 'shKod']
							
							return stm
						})
						.setSource(async _e => {
							// let { tanimPart, panelDetay: item } = _e
							// let { _promises_data: data } = tanimPart
							// return [{ stokAdi: 'A', grupAdi: 'grp' }]
							return null
						})
						.recsDuzenleIslemi(({ recs }) => {
							for (let r of recs) {
								for (let pf of ['grup', 'anaGrup']) {
									let kod = r[`${pf}Kod`]
									let adi = r[`${pf}Adi`]
									r[`${pf}Text`] = (
										kod ? new CKodVeAdi([kod, adi]).parantezliOzet({ styled: true }) :
										null
									)
								}
							}
						})
						.veriYukleninceIslemi(({ builder: { rootPart: tanimPart, part: gridPart }}) => {
							let { tanimPart: { secimler: sec } } = e
							let { grid, gridWidget: w } = gridPart
							let { gruplamadaAnaGrup: { value: gruplamadaAnaGrup } } = sec
							let { miktar2: { value: miktar2 } } = sec

							;['miktar2', 'brm2'].forEach(k =>
								w[miktar2 ? 'showcolumn' : 'hidecolumn'](k))
							
							grid.jqxGrid('groups', [
								( gruplamadaAnaGrup ? 'anaGrupText' : null ),
								'grupText'
							].filter(Boolean))
						})
				]),
			diger: new AccPanel()
				.setTitle('Diğer')
				.setExpanded()
				.setHeight(maxH * .35)
				.add(...[
					new AccPanelGrid()
						.setId('gelir')
						.setWidth('37%')
						.fullHeight()
						// .setUserData({ sortFields: ['aciklama'] })
						.setToplamBelirtec('aciklama')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, { showStatusBar: false, showAggregates: false, showGroupAggregates: false }))
						.setTabloKolonlari(_e => [
							new GridKolon({ belirtec: 'aciklama', text: `<span class=forestgreen>GELİRLER</span>`, genislikCh: 23 }).checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 17 }).tipDecimal_bedel().sum(),
							new GridKolon({ belirtec: 'grupText', text: 'Grup', genislikCh: 20 }).checkedList().hidden()
						])
						.setQuery(_e => {
							let sent = new MQSent(), { where: wh, sahalar } = sent
							this.baslikSentDuzele({ ...arguments[0], ...e, sent })
							let stm = new MQStm({ sent, orderBy: ['grupText', 'bedel DESC', 'aciklama'] })
							return stm
						})
						.setSource(_e => [])
						.recsDuzenleIslemi(({ recs }) => { })
						.veriYukleninceIslemi(({ builder: { part: { grid } }}) =>
							grid.jqxGrid('groups', ['grupText'])),
					new AccPanelGrid()
						.setId('gider')
						.setWidth('37%').fullHeight()
						// .setUserData({ sortFields: ['aciklama'] })
						.setToplamBelirtec('aciklama')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, { showStatusBar: false, showAggregates: false, showGroupAggregates: false }))
						.setTabloKolonlari(_e => [
							new GridKolon({ belirtec: 'aciklama', text: `<span class=orange>GİDERLER</span>`, genislikCh: 23 }).checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 17 }).tipDecimal_bedel().sum(),
							new GridKolon({ belirtec: 'grupText', text: 'Grup', genislikCh: 20 }).checkedList().hidden()
						])
						.setQuery(_e => {
							let sent = new MQSent(), { where: wh, sahalar } = sent
							this.baslikSentDuzele({ ...arguments[0], ...e, sent })
							let stm = new MQStm({ sent, orderBy: ['grupText', 'bedel DESC', 'aciklama'] })
							return stm
						})
						.setSource(_e => [])
						.recsDuzenleIslemi(({ recs }) => { })
						.veriYukleninceIslemi(({ builder: { part: { grid } }}) =>
							grid.jqxGrid('groups', ['grupText'])),
					new AccPanelGrid()
						.setId('sonuc')
						.setWidth(420)
						.fullHeight()
						//.setUserData({ keyFields: ['tipText'], noSort: true })
						.setToplamBelirtec('aciklama')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, {
								autoHeight: true, showStatusBar: false,
								showAggregates: false, showGroupAggregates: false
							})
						)
						.setTabloKolonlari(_e => [
							new GridKolon({ belirtec: 'aciklama', text: `<span class=darkviolet>SONUÇ</span>`, genislikCh: 23 }).checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 17 }).tipDecimal_bedel().sum()
						])
						.setSource(async _e => {
							let { tanimPart, panelDetay: item } = _e
							await delay(10)
							let { _promises_data: data } = tanimPart
							let _keys = ['satis', 'gelir', 'gider']
							let _values = await promiseAll(_keys.map(k => data[k]))
							return []
						})
				])
		}
	}
})
})()
