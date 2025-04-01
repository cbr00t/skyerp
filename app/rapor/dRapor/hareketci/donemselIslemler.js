class DRapor_DonemselIslemler extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get uygunmu() { return !!config.dev } static get araSeviyemi() { return false }
	static get sabitmi() { return true } static get vioAdim() { return null }
	static get kategoriKod() { return DRapor_Hareketci.kategoriKod } static get kategoriAdi() { return DRapor_Hareketci.kategoriAdi }
	static get kod() { return 'DONISL' } static get aciklama() { return 'Dönemsel İşlemler' }
}
class DRapor_DonemselIslemler_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_DonemselIslemler }
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments);
		result.addKAPrefix('mst')
			.addGrupBasit('ONCELIK', 'Öncelik', 'oncelik')
			.addGrupBasit('HARTIPKOD', 'Har. Tip', 'hartipkod')
			.addGrupBasit('HARTIPADI', 'Har. Tip Adı', 'hartipadi')
			.addGrupBasit('MST', 'Master Tip', 'mst', null, null, ({ item }) => item.setOrderBy('mstkod'))
			.addGrupBasit('TARIH', 'Tarih', 'tarih')
			.addToplamBasit_bedel('BEDEL', 'Bedel', 'bedel')
			.addGrupBasit('BA', 'B/A', 'ba')
			.addToplamBasit_bedel('ISARETLIBEDEL', 'İşaretli Bedel', 'isaretlibedel', null, null, ({ item }) =>
				item.setFormul(['BA', 'BEDEL'], ({ rec }) => rec.ba == 'A' ? -rec.bedel : rec.bedel))
	}
	sabitRaporTanimDuzenle({ result }) {
		super.sabitRaporTanimDuzenle(...arguments);
		result.resetSahalar()
			.addGrup('HARTIPADI')
			.addIcerik('MST', 'TARIH', 'BEDEL', 'BA')
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {stm, donemBS} = e, {grupVeToplam} = this.tabloYapi;
		let harClasses = Object.values(Hareketci.kod2Sinif).filter(cls => !!cls.donemselIslemlerIcinUygunmu);
		let {basi: tBasi, sonu: tSonu} = donemBS;
		if (!(tBasi && tSonu)) { throw { isError: true, errorText: `Seçimlerden <b>Dönem</b> seçilmeli veya <b>Tarih Aralık</b> belirtilmelidir` } }
		let tBasiClause = tBasi.sqlServerDegeri(), tSonuClause = tSonu.sqlServerDegeri();
		/*let belirtecler = Object.keys(attrSet).map(kod => grupVeToplam[kod]?.colDefs?.[0]?.belirtec).filter(x => !!x);*/
		let uni = new MQUnionAll(); for (let cls of harClasses) {
			let har = new cls(), {kod, aciklama, mstYapi} = har.class, {hvAlias: mstKodAlias, hvAdiAlias: mstAdiAlias} = mstYapi;
			let belirtecler = ['tarih', 'bedel', 'ba', mstKodAlias].filter(x => !!x);
			har.withAttrs(belirtecler); let harUni = har.uniOlustur();
			for (let harSent of harUni.getSentListe()) {
				if (!harSent) { continue } let {where: wh, sahalar, alias2Deger} = harSent; sahalar.liste = [];
				let {tarih: tarihClause, ba: baClause, bedel: bedelClause} = alias2Deger;
				bedelClause = bedelClause.sumOlmaksizin(); wh.add(`${tarihClause} <= ${tSonuClause}`);
				let kodClause = alias2Deger[mstKodAlias], adiClause = alias2Deger[mstAdiAlias];
				if (adiClause) { sahalar.add(`${adiClause} mstadi`) }
				else { mstYapi.sentDuzenle({ sent: harSent, wh, kodClause }) }
				sahalar.add(
					/* mstadi, */ `${kodClause} mstkod`, `'${kod}' hartipkod`, `'${aciklama}' hartipadi`,
					`SUM(case when ${tarihClause} < ${tBasiClause} then (case when ${baClause} = 'B' then ${bedelClause} else 0 - ${bedelClause} end) else 0 end) devir`,
					`SUM(case when ${tarihClause} >= ${tBasiClause} AND ${baClause} = 'B' then ${bedelClause} else 0 end) borc`,
					`SUM(case when ${tarihClause} >= ${tBasiClause} AND ${baClause} = 'A' then ${bedelClause} else 0 end) alacak`
				)
				harSent.groupByOlustur().gereksizTablolariSil();
				uni.add(harSent)
			}
		}
		stm = e.stm = uni.asToplamStm();
		stm.orderBy.add('hartipkod', 'mstkod')
		

		/* with tumuni (kod, devir, borç, alacak)
  as (select masterkod, sum(case when tarih<@tarihBasi then (case when ba='B' then bedel else 0-bedel end) else 0 end) devir
    , sum(case when tarih>=@tarihBasi and ba='B' then bedel else 0 end) borc
    , sum(case when tarih>=@tarihBasi and ba='A' then bedel else 0 end) alacak
    from tablo 					-- hareketçi uni her elemani icin dongü
    where tarih<=@tarihSonu
    group by masterkod
    union all
    …)
select tum.kod, mst.aciklama
	, sum(tum.devir) devir, sum(tum.borc) borc, sum(tum.alacak) alacak, sum(tum.devir+tum.borc-tum.alacak) bakiye
	from tumuni tum, master mst		-- ilgili hareketciye ait master tablo
	where tum.kod=mst.kod
	group by tum.kod, mst.aciklama */

		
		/*uni.add(new MQSent().add(`'test' anatipadi`, `'X' mstkod`, `'XYZ' mstadi`, `'B' ba`, `1234.56 bedel`));
		uni.add(new MQSent().add(`'test' anatipadi`, `'Y' mstkod`, `'ABC' mstadi`, `'A' ba`, `10 bedel`));
		uni.add(new MQSent().add(`'test2' anatipadi`, `'Z' mstkod`, `'QWERTY' mstadi`, `'B' ba`, `111 bedel`))*/
		
		/*
		stm.orderBy.liste = ['oncelik'];
		let harClasses = Object.values(Hareketci.kod2Sinif).filter(cls => !!cls.donemselIslemlerIcinUygunmu);
		orderBy.liste = []; for (let cls of harClasses) {
			let har = new cls().withAttrs(belirtecler), {kod, aciklama} = har.class;
			let _uni = har.uniOlustur(); if (!_uni?.liste?.length) { continue }
			for (let _sent of _uni.getSentListe()) {
				if (!_sent) { continue }
				let {alias2Deger, sahalar} = _sent, _sahalar = [...sahalar.liste];
				sahalar.liste = []; sahalar.add(
					`'${kod}' _anatipkod`, `'${aciklama}' _anatipadi`,
					..._sahalar
				);
				//let baClause = hvDegeri('ba'), bedelClause = hvDegeri('bedel').sumOlmaksizin();
				//this.loadServerData_queryDuzenle_baBedel({ ...e, baClause, bedelClause })
				
				_sent.groupByOlustur()
			}
			uni.add(..._uni.liste)
		}
		if (!uni.liste.length) { stm = e.stm = e.sent = null }*/
	}
}
