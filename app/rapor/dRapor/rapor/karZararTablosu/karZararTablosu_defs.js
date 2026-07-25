(function() {
extend(DRapor_KarZararTablosu.prototype, {
	getPanels(e = {}) {
		let { Panel, PanelGrid } = this.class
		let { innerHeight: maxH } = window
		return {
			satis: new Panel()
				.setTitle('Satışlar')
				.setExpanded()
				.setHeight(maxH * .4)
				.add(...[
					new PanelGrid()
						.setId('satis')
						.fullWH()
						//.setUserData({ keyFields: ['stokKod', 'stokAdi', 'grupKod', 'grupAdi'] })
						.setToplamBelirtec('stokAdi')
						.widgetArgsDuzenleIslemi(({ args }) => {
							extend(args, {
								showGroupsHeader: true, rowsHeight: 30, showGroupAggregates: false,
								groupsExpandedByDefault: true
							})
						})
						.setTabloKolonlari(_e => [
							new GridKolon({ belirtec: 'stokAdi', text: 'Stok', genislikCh: 23 }).checkedList(),
							new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 10 }).tipDecimal().checkedList().sum(),
							new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 5 }).checkedList(),
							new GridKolon({ belirtec: 'brutBedel', text: 'Brüt Bedel', genislikCh: 13 }).tipDecimal_bedel().sum(),
							new GridKolon({ belirtec: 'iskonto', text: 'İskonto', genislikCh: 13 }).tipDecimal_bedel().sum(),
							new GridKolon({ belirtec: 'ciro', text: 'Ciro', genislikCh: 13 }).tipDecimal_bedel().sum(),
							new GridKolon({ belirtec: 'maliyet', text: 'Maliyet', genislikCh: 13 }).tipDecimal_bedel().sum(),
							new GridKolon({ belirtec: 'brutKar', text: 'Brüt Kar', genislikCh: 13 }).tipDecimal_bedel().sum(),
							new GridKolon({ belirtec: 'kzOrani', text: 'K/Z%', genislikCh: 8 }).tipDecimal(1).avg(),
							new GridKolon({ belirtec: 'ciroKZOrani', text: 'Ciro K/Z%', genislikCh: 8 }).tipDecimal(1).avg(),
							new GridKolon({ belirtec: 'grupAdi', text: 'Grup', genislikCh: 20 }).checkedList()
						])
						/*.setQuery(_e => {
							let sent = new MQSent(), { where: wh, sahalar } = sent
							this.baslikSentDuzele({ ...arguments[0], ...e, sent })
							let stm = new MQStm({ sent, orderBy: ['grupText', 'bedel DESC', 'aciklama'] })
							return stm
						})*/
						.setSource(async _e => {
							let { tanimPart, panelDetay: item } = _e
							let { _promises_data: data } = tanimPart
							return [{stokAdi: 'A', grupAdi: 'grp'}]
						})
						.recsDuzenleIslemi(({ recs }) => { })
						.veriYukleninceIslemi(({ builder: { rootPart: { inst: { secimler } }, part: { grid } }}) =>
							grid.jqxGrid('groups', ['grupAdi']))
				]),
			diger: new Panel()
				.setTitle('Diğer')
				.setExpanded()
				.add(...[
					new PanelGrid()
						.setId('gelir')
						.setWidth('36%')
						.fullHeight()
						// .setUserData({ sortFields: ['aciklama'] })
						.setToplamBelirtec('aciklama')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, { showStatusBar: false, showAggregates: false, showGroupAggregates: false }))
						.setTabloKolonlari(_e => [
							new GridKolon({ belirtec: 'aciklama', text: `<span class=forestgreen>GELİRLER</span>`, genislikCh: 23 }).checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 17 }).tipDecimal_bedel().sum(),
							new GridKolon({ belirtec: 'grupText', text: 'Grup', genislikCh: 20 }).checkedList()
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
					new PanelGrid()
						.setId('gider')
						.setWidth('36%').fullHeight()
						// .setUserData({ sortFields: ['aciklama'] })
						.setToplamBelirtec('aciklama')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, { showStatusBar: false, showAggregates: false, showGroupAggregates: false }))
						.setTabloKolonlari(_e => [
							new GridKolon({ belirtec: 'aciklama', text: `<span class=orange>GİDERLER</span>`, genislikCh: 23 }).checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 17 }).tipDecimal_bedel().sum(),
							new GridKolon({ belirtec: 'grupText', text: 'Grup', genislikCh: 20 }).checkedList()
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
					new PanelGrid()
						.setId('sonuc')
						.setWidth(430)
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
							let { _promises_data: data } = tanimPart
							await delay(10)
							let _keys = ['satis', 'gelir', 'gider']
							let _values = await promiseAll(_keys.map(k => data[k]))
							return []
						})
				])
		}
	}
})
})()
