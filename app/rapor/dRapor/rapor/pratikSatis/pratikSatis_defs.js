(function() {
extend(DRapor_PratikSatis.prototype, {
	getPanels(e = {}) {
		let { class: { Panel, PanelGrid } } = this
		return {
			ozet: new Panel()
				.setTitle('Özet')
				.setExpanded()
				.add(...[
					new PanelGrid()
						.setId('ozet')
						.setUserData({ keyFields: ['tipText'], noSort: true })
						.setToplamBelirtec('tipText')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, {
								autoHeight: true, showStatusBar: false,
								showAggregates: false, showGroupAggregates: false
							})
						)
						.setTabloKolonlari(_e => [
							new GridKolon({ belirtec: 'tipText', text: `<span class=darkviolet>ÖZET</span>`, genislikCh: 16 }).checkedList(),
							new GridKolon({ belirtec: 'fisSayi', text: 'Fiş Sayı', genislikCh: 10 }).tipNumerik().sum().checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Hasılat', genislikCh: 18 }).tipDecimal_bedel().sum()
						])
						.setQuery(_e => {
							let uni = new MQUnionAll()
							;{
								let sent = new MQSent(), { where: wh, sahalar } = sent
								this.baslikSentDuzele({ ...arguments[0], ...e, sent })
								sahalar.add(
									`(case` +
										` when fis.efayrimtipi = 'E' then 1` +
										` when fis.efayrimtipi = 'A' then 2` +
										` when fis.fisanatipi = 'YM' then 4` +
										` when fis.ozelisaret = '*' then 10` +
										` else 3` +
									` end) oncelik`,
									`(case` +
										` when fis.efayrimtipi = 'E' then 'EFAT'` +
										` when fis.efayrimtipi = 'A' then 'EARS'` +
										` when fis.fisanatipi = 'YM' then 'YMK'` +
										` when fis.ozelisaret = '*' then '*'` +
										` else 'DIG'` +
									` end) tip`,
									`(case` +
										` when fis.efayrimtipi = 'E' then 'e-Fatura'` +
										` when fis.efayrimtipi = 'A' then 'e-Arşiv'` +
										` when fis.fisanatipi = 'YM' then 'Yemek Kartı'` +
										` when fis.ozelisaret = '*' then 'Fiili Fiş'` +
										` else 'Diğer'` +
									` end) tipText`,
									`'' almaText`,
									`COUNT(*) fisSayi`, `SUM(fis.fissonuc) bedel`
								)
								sent.groupByOlustur()
								uni.add(sent)
							}
							let stm = new MQStm({ sent: uni, orderBy: ['oncelik'] })
							return stm
						}),
					new PanelGrid()
						.setId('ozetEk')
						.setUserData({ keyFields: ['tipText'], noSort: true })
						.setToplamBelirtec('tipText')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, { showGroupsHeader: false, columnsHeight: 25 }))
						.setTabloKolonlari(_e => [
							new GridKolon({ belirtec: 'tipText', text: `<span class=violet>ÖZET-EK</span>`, genislikCh: 16 }).checkedList(),
							new GridKolon({ belirtec: 'fisSayi', text: 'Fiş Sayı', genislikCh: 10 }).tipNumerik().sum().checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Hasılat', genislikCh: 18 }).tipDecimal_bedel().sum()
						])
						.setQuery(_e => {
							let uni = new MQUnionAll()
							;{
								let sent = new MQSent(), { where: wh, sahalar } = sent
								this.baslikSentDuzele({ ...arguments[0], ...e, iptalAlma: true, sent })
								sahalar.add(
									`11 oncelik`,
									`'IPT' tip`,
									`'İptal Fiş' tipText`,
									`'X' almaText`,
									`COUNT(*) fisSayi`, `SUM(fis.fissonuc) bedel`
								)
								wh.add(`fis.biptalmi > 0`)
								sent.groupByOlustur()
								uni.add(sent)
							}
							;{
								let sent = new MQSent(), { where: wh, sahalar } = sent
								this.baslikSentDuzele({ ...arguments[0], ...e, sent, harTable: 'restorandetay' })
								wh.add(new MQOrClause([
									`har.biptalmi > 0`, `har.bikrammi > 0`]))
								sahalar.add(
									`(case when har.biptalmi > 0 then 20 else 22 end) oncelik`,
									`(case when har.biptalmi > 0 then 'IHAR' when har.bikrammi > 0 then 'IKR' else '' end) tip`,
									`(case when har.biptalmi > 0 then 'İPTAL Satırı' when har.bikrammi > 0 then 'İkram Satırı' else '??' end) tipText`,
									`'X' almaText`, `COUNT(*) fisSayi`, `SUM(ROUND(har.miktar * har.kdvlifiyat, 2)) bedel`
								)
								sent.groupByOlustur()
								uni.add(sent)
							}
							;{
								let sent = new MQSent(), { where: wh, sahalar } = sent
								this.baslikSentDuzele({ ...arguments[0], ...e, sent, harTable: 'restorandetay' })
								wh.add(`har.biptalmi = 0`, `har.bikrammi = 0`)
								wh.inDizi(['MS', 'DG'], 'fis.fisanatipi')          // 'YM' alınmaz
								sahalar.add(
									`(case fis.fisanatipi when 'MS' then 24 when 'DG' then 25 else 28 end) oncelik`,
									`(case fis.fisanatipi when 'MS' then 'MUS' when 'DG' then 'DADR' else '' end) tip`,
									`(case fis.fisanatipi when 'MS' then 'Müşterili' when 'DG' then 'Değişken Adres' else '??' end) tipText`,
									`'X' almaText`, `COUNT(*) fisSayi`, `SUM(ROUND(har.miktar * har.kdvlifiyat, 2)) bedel`
								)
								sent.groupByOlustur()
								uni.add(sent)
							}
							let stm = new MQStm({ sent: uni, orderBy: ['oncelik'] })
							return stm
						})
				]),
			tahsilat: new Panel()
				.setTitle('Tahsilat')
				.add(...[
					new PanelGrid()
						.setId('tahsilat')
						.setUserData({ sortFields: ['oncelik', 'aciklama'] })
						.setToplamBelirtec('aciklama')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, { showStatusBar: false, showAggregates: false, showGroupAggregates: false }))
						.setTabloKolonlari(_e => [
							new GridKolon({ belirtec: 'aciklama', text: `<span class=limegreen>TAHSİLAT</span>`, genislikCh: 25 }).checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 18 }).tipDecimal_bedel().sum()
						])
						.setQuery(_e => {
							let sent = new MQSent(), { where: wh, sahalar } = sent
							this.baslikSentDuzele({ ...arguments[0], ...e, sent, harTable: 'restorantahsil' })
							sent.har2TahSekliBagla()
							sahalar.add(
								'har.tahseklino kod', 'tsek.aciklama aciklama',
								`(case tsek.tahsiltipi when 'NK' then 1 when 'PS' then 2 else 9 end) oncelik`,
								'SUM(har.bedel) bedel'
							)
							sent.groupByOlustur()
							return sent
						})
				]),
			kdv: new Panel()
				.setTitle('KDV')
				.add(...[
					new PanelGrid()
						.setId('matrahKdv')
						.setUserData({ keyFields: ['oran', 'ozelIsaret'] })
						.setToplamBelirtec('text')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, { showStatusBar: false, showAggregates: false, showGroupAggregates: false }))
						.setTabloKolonlari(_e => [
							new GridKolon({ belirtec: 'text', text: `<span class=orangered>KDV</span>`, genislikCh: 10 }).alignRight().checkedList(),
							new GridKolon({ belirtec: 'matrah', text: 'Matrah', genislikCh: 16 }).tipDecimal_bedel().sum(),
							new GridKolon({ belirtec: 'kdv', text: 'Kdv', genislikCh: 16 }).tipDecimal_bedel().sum()
						])
						.setQuery(_e => {
							let sent = new MQSent(), { where: wh, sahalar } = sent
							this.baslikSentDuzele({ ...arguments[0], ...e, sent, harTable: 'restorandetay' })
							wh.add(`har.biptalmi = 0`, `har.bikrammi = 0`)
							sahalar.add(
								`fis.ozelisaret ozelIsaret`, 'har.kdvorani oran',
								'SUM(har.kdvsizbedel) matrah', 'SUM(har.kdv) kdv'
							)
							sent.groupByOlustur()
							let stm = new MQStm({ sent, orderBy: ['oran', 'ozelIsaret'] })
							return stm
						})
						.recsDuzenleIslemi(({ recs }) => {
							;recs.forEach(r => {
								let { oran, ozelIsaret } = r
								r.text = `%${oran}`
								if (ozelIsaret)
									r.text += ` (*)`
							})
						})
				]),
			kasiyer: new Panel()
				.setTitle('Kasiyer')
				.add(...[
					new PanelGrid()
						.setId('kasiyer')
						// .setUserData({ sortFields: ['aciklama'] })
						.setToplamBelirtec('aciklama')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, { showStatusBar: false, showAggregates: false, showGroupAggregates: false }))
						.setTabloKolonlari(_e => [
							new GridKolon({ belirtec: 'aciklama', text: `<span class=orange>KASİYER</span>`, genislikCh: 25 }).checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Hasılat', genislikCh: 18 }).tipDecimal_bedel().sum()
						])
						.setQuery(_e => {
							let sent = new MQSent(), { where: wh, sahalar } = sent
							this.baslikSentDuzele({ ...arguments[0], ...e, sent })
							sent.fromIliski('kasiyer ksy', 'fis.kasiyerkod = ksy.kod')
							sahalar.add(
								'fis.kasiyerkod kod', 'ksy.aciklama aciklama',
								'SUM(fis.fissonuc) bedel'
							)
							sent.groupByOlustur()
							let stm = new MQStm({ sent, orderBy: ['bedel DESC', 'aciklama'] })
							return stm
						})
				]),
			satis: new Panel()
				.setTitle('Satışlar').subesiz()
				.add(...[
					new PanelGrid()
						.setId('satis').fullWH()
						.setUserData({ keyFields: ['stokKod', 'stokAdi', 'grupKod', 'grupAdi'] })
						.setToplamBelirtec('stokAdi')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, { showGroupsHeader: true, showGroupAggregates: true, rowsHeight: 40 }))
						.setTabloKolonlari(_e => [
							new GridKolon({ belirtec: 'stokAdi', text: 'Stok', genislikCh: 23 }).checkedList(),
							new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 9 }).tipDecimal().checkedList().sum(),
							new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 4 }).checkedList(),
							new GridKolon({ belirtec: 'hasilat', text: 'Hasılat (Kdvli)', genislikCh: 13 }).tipDecimal_bedel().sum(),
							new GridKolon({ belirtec: 'grupAdi', text: 'Grup', genislikCh: 20 }).checkedList()
						])
						.setSource(async _e => {
							let { panelDetay: item } = _e
							let { sqlEmpty } = Hareketci_UniBilgi.ortakArgs
							let getSatisStm = iade => {
								let sent = new MQSent(), { where: wh, sahalar } = sent
								this.baslikSentDuzele({ ...arguments[0], ...e, sent, iade, harTable: 'restorandetay' })
								sent
									.har2StokBagla()
									.stok2GrupBagla()
								wh.add('har.biptalmi = 0')
								sahalar.add(
									'har.stokkod stokKod', 'stk.aciklama stokAdi', 'stk.brm',
									'SUM(har.kdvlinetbedel) hasilat', 'SUM(har.miktar) miktar',
									`${iade ? sqlEmpty : 'stk.grupkod'} grupKod`,
									`${iade ? `'<İade>'` : 'grp.aciklama'} grupAdi`,
								)
								sent.groupByOlustur()
								let stm = new MQStm({ sent, orderBy: ['grupAdi', 'stokAdi'] })
								return stm
							}
							let recs = [
								...await item.getGridData({ ..._e, query: getSatisStm(false) }),
								...await item.getGridData({ ..._e, query: getSatisStm(true) })
							]
							return recs
						})
						.veriYukleninceIslemi(({ builder: { part: { grid } }}) =>
							grid.jqxGrid('groups', ['grupAdi']))
				])
		}
	}
})
})()
