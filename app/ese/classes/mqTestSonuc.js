class MQTestSonuc extends MQCogul {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TESTSONUC' } static get sinifAdi() { return 'Anket Yanıt' }
	static get table() { return 'esetestdetay' } static get tableAlias() { return 'cvp' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get kolonFiltreKullanilirmi() { return false }

	static orjBaslikListesi_gridInit({ sender: gridPart }) {
		super.orjBaslikListesi_gridInit(...arguments)
	}
	static listeEkrani_afterRun({ sender: gridPart }) {
		super.listeEkrani_afterRun(...arguments)
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, {
			testId: new PInstGuid('testid'),
			soruId: new PInstGuid('soruid'),
			secilen: new PInstNum('cevapindis')
		})
	}
	static secimlerDuzenle({ secimler: sec }) {
		let grupKod = 'genel', {tableAlias: alias} = this
		sec
			.grupEkle({ kod: grupKod, aciklama: 'Genel', kapali: false })
			.secimTopluEkle({
				tarih: new SecimDate({ grupKod, etiket: 'Tarih' })
			})
			.addKA('test', MQTestAnket, 'tst.id', 'tst.tarihsaat')
			.addKA('hasta', MQHasta, 'has.id', 'has.aciklama')
		sec.whereBlockEkle(({ secimler: sec, where: wh }) =>
			wh.basiSonu(sec.tarih, 'tst.tarihsaat'))
	}
	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		let mini = isMiniDevice()
		extend(args, {
			rowsHeight: mini ? 60 : 40,
			groupsExpandedByDefault: true,
			showStatusBar: true, showAggregates: true
		})
	}
	static orjBaslikListesi_groupsDuzenle({ liste }) {
		super.orjBaslikListesi_groupsDuzenle(...arguments)
		liste.push('hastaIsim', 'tsText', 'sablonAdi')
	}
	static ekCSSDuzenle({ dataField: belirtec, rec, result }) {
		super.ekCSSDuzenle(...arguments)
		let colors = ['gray', 'green', 'royalblue', 'orangered', 'red']
		if (belirtec == 'cevap' || belirtec == 'skor') {
			let color = colors[belirtec == 'skor' ? rec.skor : rec.cevapindis - 1]
			result.push('bold')
			if (color)
				result.push(color)
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {maxSecenekSayisi: maxCevap} = MQSablonAnketYanit
		let clauses = {}
		{
			let res = [`(CASE`]
			for (let i = 1; i <= maxCevap; i++)
				res.push(`WHEN cvp.cevapindis = ${i} THEN cdet.secenek${i}`)
			res.push(`ELSE '??' END)`)
			clauses.cevap = res.join('\n')
		}
		
		liste.push(
			/*...MQCogul.getKAKolonlar(
				new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 10, sql: 'tst.tarihsaat' }).tipDate(),
				new GridKolon({ belirtec: 'saat', text: 'Saat', genislikCh: 6, sql: 'tst.tarihsaat' }).tipTime_noSecs()
			),*/
			new GridKolon({ belirtec: 'tsText', text: 'Zaman', genislikCh: 8, filterType: 'checkedlist' }).noSql(),
			new GridKolon({ belirtec: 'soru', text: 'Soru', sql: 'sdet.soru', filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'skor', text: 'Skor', genislikCh: 13, filterType: 'checkedlist', aggregates: ['sum'] }).tipNumerik().sifirGosterme(),
			new GridKolon({ belirtec: 'cevap', text: 'Cevap', genislikCh: 20, sql: clauses.cevap, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'hastaIsim', text: 'Hasta İsim', genislikCh: 30, sql: 'has.aciklama', filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'sablonAdi', text: 'Şablon Adı', genislikCh: 30, sql: 'sab.aciklama', filterType: 'checkedlist' })
		)
	}
	static loadServerData_queryDuzenle({ sent }) {
		super.loadServerData_queryDuzenle(...arguments)
		let { tableAlias: alias } = this
		let { where: wh, sahalar } = sent
		sent
			.innerJoin(alias, 'eseanketsablondetay sdet', `${alias}.soruid = sdet.id`)
			.innerJoin(alias, 'esetest tst', `${alias}.testid = tst.id`)
			.innerJoin('sdet', 'eseanketsablon sab', 'sdet.fisid = sab.id')
			.innerJoin('sab', 'eseanketyanit cdet', 'sab.yanitid = cdet.id')
			.innerJoin('tst', 'esehasta has', 'tst.hastaid = has.id')
		sahalar.addWithAlias(alias, 'testid', 'soruid', 'cevapindis')
		sahalar.add('tst.tarihsaat ts', 'has.id hastaid', 'has.aciklama hastaIsim', 'sab.id sablonid', 'sab.aciklama sablonAdi')
	}
	static orjBaslikListesi_recsDuzenle({ recs }) {
		super.orjBaslikListesi_recsDuzenle(...arguments)
		;recs.forEach(rec => {
			let {ts} = rec
			rec.tsText ??= ts ? dateTimeAsKisaString(asDate(ts)) : ''
		})
	}
	static gridVeriYuklendi({ sender: gridPart }) {
		super.gridVeriYuklendi(...arguments)
	}
	keyHostVarsDuzenle({ hv }) {
		super.keyHostVarsDuzenle(...arguments)
		let { testId: testid, soruId: soruid } = this
		extend(hv, { testid, soruid })
	}
	keySetValues({ rec }) {
		super.keySetValues(...arguments)
		let { testid: testId, soruid: soruId } = rec
		extend(this, { testId, soruId })
	}
}
