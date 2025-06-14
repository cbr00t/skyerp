class MQAktivasyon extends MQDetayliMaster {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'AKT' } static get sinifAdi() { return 'Aktivasyon' }
	static get table() { return 'muslisans' } static get tableAlias() { return 'fis' } static get sayacSaha() { return 'kaysayac' }
	static get detaySinif() { return MQAktivasyonDetay } static get gridKontrolcuSinif() { return MQAktivasyonGridci }
	static get tumKolonlarGosterilirmi() { return true } static get kolonFiltreKullanilirmi() { return false } static get raporKullanilirmi() { return false }
	static get tanimlanabilirmi() { return super.tanimlanabilirmi && MQLogin.current?.yetkiVarmi('tanimla') }
	static get silinebilirmi() { return super.silinebilirmi && MQLogin.current?.yetkiVarmi('sil') }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments);
		$.extend(pTanim, {
			tarih: new PInstDateToday('tarih'), ilkTarih: new PInstDateToday('ilktarih'), mustKod: new PInstStr('mustkod'),
			baktifmi: new PInstBitTrue('baktifmi'), surum: new PInstStr({ rowAttr: 'surum', init: () => app.defaultSurum }),
			kullaniciSayi: new PInstNum('kullanicisayi'), elTerminalSayi: new PInstNum('elterminalsayi'), dokunmatikSayi: new PInstNum('dokunmatiksayi'),
			topBedel: new PInstNum('topbedel'), demoSuresiSifirlaTarih: new PInstDate('demosuresifirlatarih'),
			ekBilgi: new PInstStr('ekbilgi'), ozelEkBilgi: new PInstStr('ozelekbilgi')
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments); let {tableAlias: alias} = this;
		sec.grupTopluEkle([ { kod: 'genel', etiket: 'Genel', kapali: false } ]);
		sec
			.secimTopluEkle({
				aktifSecim: new SecimTekSecim({ etiket: 'Aktiflik', tekSecimSinif: AktifVeDevreDisi }),
				surum: new SecimString({ etiket: 'Sürüm' })
			})
			.addKA('must', MQLogin_Musteri, `${alias}.mustkod`, 'mus.aciklama')
			.addKA('bayi', MQLogin_Bayi, 'mus.bayikod', 'bay.aciklama')
			.addKA('il', MQVPIl, 'mus.ilkod', 'il.aciklama')
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
			let {tekSecim: aktifSecim} = sec.aktifSecim; wh.birlestir(aktifSecim.getBoolBitClause(`${alias}.baktifmi`));
			wh.basiSonu(sec.surum, `${alias}.surum`)
		})
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e)
	}
	static ekCSSDuzenle({ rec, result }) {
		super.ekCSSDuzenle(...arguments);
		if (!rec.baktifmi) { result.push('bg-lightgray', 'iptal') }
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); liste.push(...[
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'baktifmi', text: 'Aktif?', genislikCh: 8}).tipBool(),
			new GridKolon({ belirtec: 'mustkod', text: 'Müşteri', genislikCh: 16 }),
			new GridKolon({ belirtec: 'mustadi', text: 'Bayi Adı', genislikCh: 45, sql: 'mus.aciklama' }),
			new GridKolon({ belirtec: 'bayikod', text: 'Bayi', genislikCh: 10, sql: 'mus.bayikod' }),
			new GridKolon({ belirtec: 'bayiadi', text: 'Bayi Adı', genislikCh: 30, sql: 'bay.aciklama' }),
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 25, sql: 'mus.yore' }),
			new GridKolon({ belirtec: 'ilkod', text: 'İl', genislikCh: 8, sql: 'mus.ilkod' }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 25, sql: 'il.aciklama' }),
			new GridKolon({ belirtec: 'surum', text: 'Sürüm', genislikCh: 8 }).alignCenter(),
			new GridKolon({ belirtec: 'tanitim', text: 'Tanıtım', genislikCh: 43, sql: 'mus.tanitim' }),
			new GridKolon({ belirtec: 'kullanicisayi', text: 'Kull.Sayı', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'elterminalsayi', text: 'ElTerm.Sayı', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'dokunmatiksayi', text: 'Tablet Sayı', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'topbedel', text: 'Top. Bedel', genislikCh: 17 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'ilktarih', text: 'İlk Lisans', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'demosuresifirlatarih', text: 'Demo Sıfırlama', genislikCh: 13 }).tipDate(),
			new GridKolon({ belirtec: 'ekbilgi', text: 'Ek Bilgi', genislikCh: 50 }),
			new GridKolon({ belirtec: 'ozelekbilgi', text: 'Özel Ek Bilgi', genislikCh: 50 })
		])
	}
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent }) {
		super.loadServerData_queryDuzenle(...arguments); let {tableAlias: alias} = this;
		sent.fromIliski('musteri mus', `${alias}.mustkod = mus.kod`)
			.fromIliski(`${MQLogin_Bayi.table} bay`, `mus.bayikod = bay.kod`)
			.fromIliski(`${MQVPIl.table} il`, `mus.ilkod = il.kod`);
		let clauses = { bayi: 'mus.bayikod', musteri: `${alias}.mustkod` };
		MQLogin.current.yetkiClauseDuzenle({ sent, clauses })
	}
}
class MQAktivasyonDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'muslisansdetay' }
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
	}
	static loadServerData_queryDuzenle({ gridPart, sender, stm, sent }) {
		super.loadServerData_queryDuzenle(...arguments); let {tableAlias: alias} = this;
		sent.fromIliski('progsetmodul psm', `${alias}.psmkod = psm.kod`)
	}
}
class MQAktivasyonGridci extends GridKontrolcu {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static gridArgsDuzenle({ gridPart, sender, args }) {
		gridPart = gridPart ?? sender;
		$.extend(args, { groupsExpandedByDefault: true, editMode: 'click', selectionMode: 'singlecell' })
	}
	static tabloKolonlariDuzenle_ilk({ tabloKolonlari }) {
		tabloKolonlari.push(...[
			new GridKolon({ belirtec: 'grupAdi', text: 'Grup Adı', genislikCh: 20 }).hidden(),
			new GridKolon({ belirtec: 'stokText', text: 'Ürün/Hizmet', genislikCh: 60, filterable: false }).readOnly(),
			new GridKolon({
				belirtec: 'miktar', text: 'Miktar', genislikCh: 13, groupable: false,
				cellValueChanged: e => {
					let { sender: gridPart, gridWidget, rowIndex, belirtec, value } = e;
					let rec = gridWidget.getrowdata(rowIndex), orj = rec._orj = rec._orj ?? {};
					if (orj[belirtec] === undefined) { orj[belirtec] = rec[belirtec] }
					rec._degistimi = (orj[belirtec] || 0) != value;
					gridPart.kontrolcu.miktarFiyatDegisti(e)
					/*gridWidget.beginupdate(); gridWidget.endupdate(false); gridWidget.ensurerowvisible(rowIndex)*/
				},
				cellClassName: (colDef, rowIndex, belirtec, value, _rec) => {
					let {gridWidget} = colDef.gridPart, rec = gridWidget.getrowdata(rowIndex);
					let result = [belirtec], {_degistimi: degistimi} = rec;
					if (degistimi) { result.push('bg-lightgreen') }
					return result.join(' ')
				}
			}).tipDecimal().sifirGosterme(),
			new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 5 }).readOnly()
		]);
		for (let {belirtec, etiket: text, mfSinif} of HMRBilgi.hmrIter_ekOzellik()) {
			tabloKolonlari.push(new GridKolon({ belirtec, text, genislikCh: 20, filterType: 'checkedlist' }).readOnly()) }
	}
	static tabloKolonlariDuzenle_ara({ tabloKolonlari }) {
		let {params} = app, {sabit: iskSayi} = params.fiyatVeIsk?.iskSayi, {webSiparis_sonStokGosterilirmi} = params.web;
		tabloKolonlari.push(...[
			(webSiparis_sonStokGosterilirmi ? new GridKolon({ belirtec: 'sonStokBilgi', text: 'Son Stok', genislikCh: 13, groupable: false }).readOnly() : null),
			new GridKolon({ belirtec: 'fiyat', text: 'Fiyat', genislikCh: 13, groupable: false }).readOnly().tipDecimal_fiyat().sifirGosterme(),
			new GridKolon({ belirtec: 'brutBedel', text: 'Brüt Bedel', genislikCh: 13, groupable: false }).readOnly().tipDecimal_bedel().sifirGosterme(),
			(iskSayi ? new GridKolon({
				belirtec: 'iskOranlar', text: `İsk.`, genislikCh: 13, groupable: false,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					let result = []; for (let i = 1; i <= iskSayi; i++) {
						let value = rec[`iskOran${i}`]; if (value) { result.push(value) } }
					return changeTagContent(html, result.length ? `%${result.join(' + ')}` : '')
				}
			}).readOnly().sifirGosterme() : null)?.readOnly(),
			new GridKolon({ belirtec: 'netBedel', text: 'Net Bedel', genislikCh: 13, groupable: false }).readOnly().tipDecimal_bedel().sifirGosterme()
		].filter(x => !!x))
	}
	static tabloKolonlariDuzenle_son({ tabloKolonlari }) { }
	static miktarFiyatDegisti({ gridWidget, rowIndex, belirtec, gridRec: det, value }) {
		det._degistimi = true
		/* gridWidget.render(); gridWidget.ensurerowvisible(rowIndex) */
	}
	static bedelHesapla(e) { }
}
