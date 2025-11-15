class DRapor_X extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get kategoriKod() { return 'CRM' }
	static get kod() { return 'X' } static get aciklama() { return 'Test Sonuçları' } static get mainClass() { return null }
	altRaporlarDuzenle(e) { this.add(this.class.mainClass); super.altRaporlarDuzenle(e) }
}
class DRapor_X_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_X }
	static get table() { return null } static get detayVeyaGrupTable() { return null } get tazeleYapilirmi() { return true }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e) /*; const {result} = e; result.addKAPrefix('doktor', 'hasta', 'ilbolge', 'il')
			.addGrup(new TabloYapiItem().setKA('DOKTOR', 'Doktor').setMFSinif(MQDoktor).kodsuz().setOrderBy('doktoradi').addColDef(new GridKolon({ belirtec: 'doktor', text: 'Doktor', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HASTA', 'Hasta').setMFSinif(MQHasta).kodsuz().setOrderBy('hastaadi').addColDef(new GridKolon({ belirtec: 'hasta', text: 'Hasta', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('ILBOLGE', 'İl Bölgesi').setMFSinif(MQIlBolge).addColDef(new GridKolon({ belirtec: 'ilbolge', text: 'İl Bölgesi', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('IL', 'İl').setMFSinif(MQCariIl).addColDef(new GridKolon({ belirtec: 'il', text: 'İl', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('CINSIYET', 'Cinsiyet').addColDef(new GridKolon({ belirtec: 'cinsiyet', text: 'Cinsiyet', filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('AKTIFYAS', 'Aktif Yaş').addColDef(new GridKolon({ belirtec: 'aktifyas', text: 'Aktif Yaş', genislikCh: 25, filterType: 'checkedlist' }).tipNumerik()))
			.addGrup(new TabloYapiItem().setKA('YASGRUP', 'Yaş Grubu').noOrderBy().addColDef(new GridKolon({ belirtec: 'yasgrupadi', text: 'Yaş Grubu', genislikCh: 25, filterType: 'checkedlist' }).tipNumerik()))*/
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {stm, attrSet} = e; let {sent} = stm, {where: wh, sahalar} = sent;
		$.extend(e, { sent }); this.fisVeHareketBagla(e); this.donemBagla({ ...e, sent, tarihSaha: 'fis.tarihsaat' }); wh.add('fis.btamamlandi <> 0');
		/*if (attrSet.DOKTOR) { sent.fromIliski('esemuayene mua', 'fis.muayeneid = mua.id').fromIliski('esedoktor dok', 'mua.doktorid = dok.id') }
		if (attrSet.HASTA || attrSet.IL || attrSet.ILBOLGE || attrSet.CINSIYET) { sent.fromIliski('esehasta has', 'fis.hastaid = has.id') }
		if (attrSet.IL || attrSet.ILBOLGE) { sent.fromIliski('eseyerlesim yer', 'has.yerlesimkod = yer.kod').fromIliski('caril il', 'yer.ilkod = il.kod') }
		for (const key in attrSet) {
			switch (key) {
				case 'HASTA': sahalar.add('fis.hastaid hastakod', 'has.aciklama hastaadi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'esehasta', saha: 'fis.hastaid' }); break
				case 'DOKTOR': sahalar.add('mua.doktorid doktorkod', 'dok.aciklama doktoradi'); wh.icerikKisitDuzenle_x({ ...e, belirtec: 'esedoktor', saha: 'mua.doktorid' }); break
				case 'ILBOLGE': sent.fromIliski('eseilbolge ibol', 'il.ilbolgekod = ibol.kod'); sahalar.add('il.ilbolgekod', 'ibol.aciklama ilbolgeadi'); break;
				case 'IL': sahalar.add('il.kod ilkod', 'il.aciklama iladi'); break;
				case 'CINSIYET': sahalar.add(`${Cinsiyet.getClause('has.cinsiyet')} cinsiyet`); break;
				case 'AKTIFYAS': case 'YASGRUP': sahalar.add('fis.aktifyas'); break
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias: 'fis', tarihSaha: 'tarihsaat' });*/
		this.loadServerData_queryDuzenle_ek(e); sent.groupByOlustur()
	}
	loadServerData_queryDuzenle_ek(e) { super.loadServerData_queryDuzenle_ek(e) }
	loadServerData_queryDuzenle_son(e) { const {stm, attrSet} = e, {orderBy} = stm; super.loadServerData_queryDuzenle_son(e) }
	async loadServerData_recsDuzenle(e) {
		await super.loadServerData_recsDuzenle(e); const {attrSet} = this.raporTanim, {recs} = e
		/*if (attrSet.YASGRUP) {
			let {_yasGrupRecs: yasGrupRecs} = this; if (!yasGrupRecs) {
				let sent = new MQSent({ from: 'eseyasgrup', sahalar: ['id', 'aciklama', 'yasbasi basi', 'yassonu sonu'] });
				yasGrupRecs = this._yasGrupRecs = await app.sqlExecSelect(sent)
			}
			for (const rec of recs) {
				const {aktifyas: aktifYas} = rec, yasGrupRec = yasGrupRecs.find(_rec => (!_rec.basi || _rec.basi >= aktifYas) && (!_rec.sonu || _rec.sonu <= aktifYas));
				if (yasGrupRec) { $.extend(rec, { yasgrupid: yasGrupRec.id, yasgrupadi: yasGrupRec.aciklama }) }
			}
		}*/
	}
	fisVeHareketBagla(e) {
		const {sent} = e, {table, detayVeyaGrupTable} = this.class; sent.fromAdd(`${table} fis`);
		if (detayVeyaGrupTable) { sent.fromIliski(`${detayVeyaGrupTable} har`, `har.fisid = fis.id`) }
		return this
	}
}
