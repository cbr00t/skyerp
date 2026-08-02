(function() {
extend(DRapor_KarZararTablosu.prototype, {
	getPanels(e = {}) {
		let { innerHeight: maxH } = window
		let { params } = app
		let { finans: { kzTabloMaliyetten: kzMaliyetten } } = params
		
		return {
			main: new AccPanel()
				.setTitle(kzMaliyetten ? 'Satışlar' : 'Satışlar ve Alımlar')
				.setExpanded()
				.setHeight(maxH * .45)
				.add(...[
					new AccPanelGrid()
						.setId('satis')
						.setWidth(kzMaliyetten ? 'full' : '59.7%')
						.fullHeight()
						.setUserData({ noSort: true, noGroupTotals: true, keyFields: ['shKod'] })
						.setToplamBelirtec('stokAdi')
						.widgetArgsDuzenleIslemi(({ args }) => {
							extend(args, {
								showStatusBar: false, showAggregates: false,
								showGroupAggregates: false, groupsExpandedByDefault: true,
								rowsHeight: 45, showGroupsHeader: true
							})
						})
						.setTabloKolonlari(_e => {
							return [
								...MQCogul.getKAKolonlar(
									new GridKolon({ belirtec: 'shKod', text: 'Stok', genislikCh: 14 }).checkedList(),
									new GridKolon({ belirtec: 'shAdi', text: `<span class=forestgreen>SATIŞLAR</span>`, genislikCh: 35 }).checkedList()
								),
								...MQCogul.getKAKolonlar(
									new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 9 }).tipDecimal().checkedList().sum(),
									new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 4 }).checkedList(),
									true    // mini için ters sıra
								),
								...MQCogul.getKAKolonlar(
									new GridKolon({ belirtec: 'miktar2', text: 'Miktar 2', genislikCh: 10 }).tipDecimal().checkedList().sum().sifirGosterme(),
									new GridKolon({ belirtec: 'brm2', text: 'Br2', genislikCh: 5 }).checkedList(),
									true    // mini için ters sıra
								),
								...MQCogul.getKAKolonlar(
									new GridKolon({ belirtec: 'brutBedel', text: 'Brüt Bedel', genislikCh: 13 }).tipDecimal_bedel().sum(),
									new GridKolon({ belirtec: 'topIsk', text: 'İskonto', genislikCh: 13 }).tipDecimal_bedel().sum().sifirGosterme(),
									true
								),
								new GridKolon({ belirtec: 'ciro', text: 'Ciro', genislikCh: 13 }).tipDecimal_bedel().sum(),
								...( kzMaliyetten ? MQCogul.getKAKolonlar(
									new GridKolon({ belirtec: 'maliyet', text: 'Maliyet', genislikCh: 13 }).tipDecimal_bedel().sum().sifirGosterme(),
									new GridKolon({ belirtec: 'brutKar', text: 'Brüt Kar', genislikCh: 13 }).tipDecimal_bedel().sum().sifirGosterme(),
								) : [] ),
								...( kzMaliyetten ? MQCogul.getKAKolonlar(
									new GridKolon({ belirtec: 'kzOrani', text: 'K/Z%', genislikCh: 10 }).tipDecimal(1).avg().sifirGosterme(),
									new GridKolon({ belirtec: 'ciroKZOrani', text: 'Ciro K/Z%', genislikCh: 13 }).tipDecimal(1).avg().sifirGosterme(),
									true
								) : [] ),
								new GridKolon({ belirtec: 'grupText', text: 'Grup', genislikCh: 25 }).checkedList(),
								new GridKolon({ belirtec: 'anaGrupText', text: 'Ana Grup', genislikCh: 15 }).checkedList()
							]
						})
						.setQuery(async _e => {
							deleteKeys(_e, 'stm', 'sent')
							let { QueryCtx_Satis: ctxCls } = this.class
							let ctx = _e.ctx = new ctxCls(_e)
							await ctx.ilkIslemler(_e)
							let uni = _e.uni = ctx.uni ?? ctx.uniOlustur(_e)
							if (!uni)
								return null
							
							let { tanimPart: { inst } } = _e
								inst.stmSonIslemler(_e)
							
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
							let { params: { finans } } = app
							let { kzOndalikHane: fra } = finans
							fra ??= 1
							
							for (let r of recs) {
								for (let pf of ['grup', 'anaGrup']) {
									let kod = r[`${pf}Kod`]
									let adi = r[`${pf}Adi`]
									r[`${pf}Text`] = (
										kod ? new CKodVeAdi([kod, adi]).parantezliOzet({ styled: true }) :
										null
									)
								}

								let { ciro, maliyet } = r
								let brutKar = r.brutKar = roundToBedelFra(ciro - maliyet)
								extend(r, {
									kzOrani: maliyet ? roundToFra(brutKar * 100 / maliyet, fra) : 0,
									ciroKZOrani: ciro ? roundToFra(brutKar * 100 / ciro, fra) : 0
								})
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
						}),
					( kzMaliyetten ? null :
						 new AccPanelGrid()
							.setId('alim')
							.setWidth('40%')
							.fullHeight()
							.setUserData({ noSort: true, noGroupTotals: true, keyFields: ['shKod'] })
							.setToplamBelirtec('stokAdi')
							.widgetArgsDuzenleIslemi(({ args }) => {
								extend(args, {
									showStatusBar: false, showAggregates: false,
									showGroupAggregates: false, groupsExpandedByDefault: true,
									rowsHeight: 45, showGroupsHeader: true
								})
							})
							.setTabloKolonlari(_e => {
								return [
									...MQCogul.getKAKolonlar(
										new GridKolon({ belirtec: 'shKod', text: 'Stok', genislikCh: 14 }).checkedList(),
										new GridKolon({ belirtec: 'shAdi', text: `<span class=orangered>ALIMLAR</span>`, genislikCh: 35 }).checkedList()
									),
									...MQCogul.getKAKolonlar(
										new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 9 }).tipDecimal().checkedList().sum(),
										new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 4 }).checkedList(),
										true    // mini için ters sıra
									),
									...MQCogul.getKAKolonlar(
										new GridKolon({ belirtec: 'miktar2', text: 'Miktar 2', genislikCh: 10 }).tipDecimal().checkedList().sum().sifirGosterme(),
										new GridKolon({ belirtec: 'brm2', text: 'Br2', genislikCh: 5 }).checkedList(),
										true    // mini için ters sıra
									),
									new GridKolon({ belirtec: 'ciro', text: 'Ciro', genislikCh: 13 }).tipDecimal_bedel().sum(),
									new GridKolon({ belirtec: 'grupText', text: 'Grup', genislikCh: 25 }).checkedList(),
									new GridKolon({ belirtec: 'anaGrupText', text: 'Ana Grup', genislikCh: 15 }).checkedList()
								]
							})
							.setQuery(async _e => {
								deleteKeys(_e, 'stm', 'sent')
								let { QueryCtx_Alim: ctxCls } = this.class
								let ctx = _e.ctx = new ctxCls(_e)
								await ctx.ilkIslemler(_e)
								let uni = _e.uni = ctx.uni ?? ctx.uniOlustur(_e)
								if (!uni)
									return null
								
								let { tanimPart: { inst } } = _e
								inst.stmSonIslemler(_e)
								
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
								let { params: { finans } } = app
								let { kzOndalikHane: fra } = finans
								fra ??= 1
								
								for (let r of recs) {
									for (let pf of ['grup', 'anaGrup']) {
										let kod = r[`${pf}Kod`]
										let adi = r[`${pf}Adi`]
										r[`${pf}Text`] = (
											kod ? new CKodVeAdi([kod, adi]).parantezliOzet({ styled: true }) :
											null
										)
									}
	
									let { ciro, maliyet } = r
									let brutKar = r.brutKar = roundToBedelFra(ciro - maliyet)
									extend(r, {
										kzOrani: maliyet ? roundToFra(brutKar * 100 / maliyet, fra) : 0,
										ciroKZOrani: ciro ? roundToFra(brutKar * 100 / ciro, fra) : 0
									})
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
					)
				].filter(Boolean)),
			diger: new AccPanel()
				.setTitle('Diğer')
				.setExpanded()
				.setHeight(maxH * .35)
				.add(...[
					new AccPanelGrid()
						.setId('gelir')
						.setWidth('37%')
						.fullHeight()
						.setUserData({ noSort: true, keyFields: ['shKod'] })
						.setToplamBelirtec('shAdi')
						.widgetArgsDuzenleIslemi(({ args }) => {
							extend(args, {
								showStatusBar: false, showAggregates: false,
								showGroupAggregates: false, groupsExpandedByDefault: true,
								rowsHeight: 45, showGroupsHeader: true
							})
						})
						.setTabloKolonlari(_e => [
							new GridKolon({ belirtec: 'shText', text: `<span class=forestgreen>GELİRLER</span>`, genislikCh: 36 }).checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 17 }).tipDecimal_bedel().sum(),
							new GridKolon({ belirtec: 'grupText', text: 'Grup', genislikCh: 20 }).checkedList().hidden()
						])
						.setQuery(async _e => {
							deleteKeys(_e, 'stm', 'sent')
							let { QueryCtx_Gelir: ctxCls } = this.class
							let ctx = _e.ctx = new ctxCls({ ..._e, satisTablomu: false })
							await ctx.ilkIslemler(_e)
							let uni = _e.uni = ctx.uni ?? ctx.uniOlustur(_e)
							if (!uni)
								return null
							
							let { tanimPart: { inst } } = _e
							inst.stmSonIslemler(_e)
							
							let stm = uni.asToplamStm(), { orderBy } = stm
							orderBy.liste = ['grupKod', 'shAdi']
							
							return stm
						})
						//.setSource(_e => [])
						.recsDuzenleIslemi(({ recs }) => {
							for (let r of recs) {
								for (let pf of ['grup', 'anaGrup', 'sh']) {
									let kod = r[`${pf}Kod`]
									let adi = r[`${pf}Adi`]
									r[`${pf}Text`] = (
										kod ? new CKodVeAdi([kod, adi]).parantezliOzet({ styled: true }) :
										null
									)
								}

								// Gelir Ters işlem
								;{
									let { bedel, islKayitTipi } = r
									if (bedel && islKayitTipi != 'GL')
										r.bedel = -bedel
								}
							}
						})
						.veriYukleninceIslemi(({ builder: { part: { grid } }}) =>
							grid.jqxGrid('groups', ['grupText'])),
					new AccPanelGrid()
						.setId('gider')
						.setWidth('37%')
						.fullHeight()
						.setUserData({ noSort: true, keyFields: ['shKod'] })
						.setToplamBelirtec('shAdi')
						.widgetArgsDuzenleIslemi(({ args }) => {
							extend(args, {
								showStatusBar: false, showAggregates: false,
								showGroupAggregates: false, groupsExpandedByDefault: true,
								rowsHeight: 45, showGroupsHeader: true
							})
						})
						.setTabloKolonlari(_e => [
							new GridKolon({ belirtec: 'shText', text: `<span class=orange>GİDERLER</span>`, genislikCh: 36 }).checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 17 }).tipDecimal_bedel().sum(),
							new GridKolon({ belirtec: 'grupText', text: 'Grup', genislikCh: 20 }).checkedList().hidden()
						])
						.setQuery(async _e => {
							deleteKeys(_e, 'stm', 'sent')
							let { QueryCtx_Gider: ctxCls } = this.class
							let ctx = _e.ctx = new ctxCls({ ..._e, satisTablomu: false })
							await ctx.ilkIslemler(_e)
							let uni = _e.uni = ctx.uni ?? ctx.uniOlustur(_e)
							if (!uni)
								return null
							
							let { tanimPart: { inst } } = _e
							inst.stmSonIslemler(_e)
							
							let stm = uni.asToplamStm(), { orderBy } = stm
							orderBy.liste = ['grupKod', 'shAdi']
							
							return stm
						})
						//.setSource(_e => [])
						.recsDuzenleIslemi(({ recs }) => {
							for (let r of recs) {
								for (let pf of ['grup', 'anaGrup', 'sh']) {
									let kod = r[`${pf}Kod`]
									let adi = r[`${pf}Adi`]
									r[`${pf}Text`] = (
										kod ? new CKodVeAdi([kod, adi]).parantezliOzet({ styled: true }) :
										null
									)
								}

								// Gider Ters işlem
								;{
									let { bedel, islKayitTipi } = r
									if (bedel && islKayitTipi != 'GD')
										r.bedel = -bedel
								}
							}
						})
						.veriYukleninceIslemi(({ builder: { part: { grid } }}) =>
							grid.jqxGrid('groups', ['grupText'])),
					new AccPanelGrid()
						.setId('sonuc')
						.setWidth(430)
						.fullHeight()
						.setUserData({ noSort: true, noGroupTotals: true })
						//.setToplamBelirtec('aciklama')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, {
								showStatusBar: false, showAggregates: false,
								showGroupAggregates: false, groupsExpandedByDefault: false,
								autoHeight: false, rowsHeight: 45, showGroupsHeader: false,
								groupable: false, sortable: false
							})
						)
						.setTabloKolonlari(_e => [
							new GridKolon({ belirtec: 'aciklama', text: `<span class=cadetblue>SONUÇ</span>`, genislikCh: 25 }).checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 17 }).tipDecimal_bedel()
						])
						.cssDuzenleIslemi(_e => {
							let { dataField: k, value: v, rec: r, result: res } = _e
							let { neg, bedel, _sonucmu } = r
							switch (k) {
								case 'bedel': {
									res.push(
										'bold',
										bedel < 0
											? 'firebrick'
											: 'forestgreen'
									)
								}
							}
							if (_sonucmu) {
								res.push(
									'fs-110', 'bolder',
									( bedel < 0 ? 'bg-lightred-transparent' : 'bg-verylightgreen' )
								)
							}
						})
						.setSource(async _e => {
							let { tanimPart, panelDetay: item } = _e
							let dataKeys = [
								'satis',
								( kzMaliyetten ? null : 'alim' ),
								'gelir', 'gider'
							].filter(Boolean)
							
							let data = {}
							for (let i = 1; i <= 10; i++) {
								await delay(50)
								let { _promises_data } = tanimPart
								if (_promises_data) {
									data = {}
									for (let k of dataKeys) {
										let _recs = await _promises_data[k]
										if (_recs)                               // boş da olsa, nullify olmayan birşey geldiyse
											data[k] = _recs
									}
								}
								if (len(data) >= dataKeys.length)
									break
							}

							// gerekli tüm veriler için fetch henüz başlamamış olabilir. sonraki turda bakılsın
							if (!data || len(data) < dataKeys.length)
								return []

							// diğer veriler hazır
							let toplam = {}
							;{
								let kosul = r =>
									!(r._toplammi ?? r._toplamSatirimi)
								
								let toplamEkle
								toplamEkle = (r, k, neg, text) => {
									let v = kosul(r) ? Number(r[k]) : null
									if (v == null)
										return
									
									let aciklama = text    // grid kolon
									if (neg) {
										aciklama += ` (-)`
										v = -v
									}
									
									let t = toplam[text] ??= { neg, aciklama, bedel: 0 }
									if (v)
										t.bedel += v
								}

								let { satis: satislar, alim: alimlar, gelir: gelirler, gider: giderler } = data
								;{
									;satislar.forEach(r => {
										toplamEkle(r, 'brutBedel', false, `Brüt Bedel`)
										toplamEkle(r, 'topIsk', true, `İskonto`)
										toplamEkle(r, 'ciro', false, `Ciro`)
										if (!alimlar)
											toplamEkle(r, 'maliyet', true, `Maliyet`)
									})
									if (alimlar) {
										;toplam['Alımlar'] = {
											neg: true, aciklama: `Alımlar (-)`,
											bedel: -topla(r => r.ciro || 0, alimlar.filter(kosul))
										}
									}
									toplam[`Diğer Gelirler`] = {
										neg: false, aciklama: `Diğer Gelirler`,
										bedel: topla(r => r.bedel || 0, gelirler.filter(kosul))
									}
									toplam[`Diğer Giderler`] = {
										neg: true, aciklama: `Diğer Giderler (-)`,
										bedel: -topla(r => r.bedel || 0, giderler.filter(kosul))
									}
								}

								for (let [k, t] of entries(toplam)) {
									let { bedel: v } = t
									if (v)
										t.bedel = v = roundToBedelFra(v)
								}

								;{
									let r = {
										neg: false, _sonucmu: true,
										bedel: roundToBedelFra(topla(r => r.bedel, values(toplam)))
									}
									r.aciklama = `NET ${r.bedel < 0 ? 'ZARAR' : 'KAR'}`
									toplam[r.aciklama] = r
								}
							}
							
							return values(toplam)
						})
				])
		}
	}
})
})()
