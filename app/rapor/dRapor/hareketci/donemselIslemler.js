class DRapor_DonemselIslemler extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get uygunmu() { return !!config.dev } static get araSeviyemi() { return false }
	static get sabitmi() { return true } static get vioAdim() { return null }
	static get kategoriKod() { return DRapor_Hareketci.kategoriKod } static get kategoriAdi() { return DRapor_Hareketci.kategoriAdi }
	static get kod() { return 'DONISL' } static get aciklama() { return 'Dönemsel İşlemler' }
	altRaporlarDuzenle(e) {
		super.altRaporlarDuzenle(e);
		this.add(DRapor_DonemselIslemler_Detaylar)
	}
}
class DRapor_DonemselIslemler_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_DonemselIslemler }
	get width() { return 'var(--full)' } get height() { return `calc(var(--full) - 300px)` }
	get detaylar() { return this.ekBilgi?.detaylar } set detaylar(value) { let ekBilgi = this.ekBilgi = this.ekBilgi ?? {}; ekBilgi.detaylar = value }
	get dip() { return this.ekBilgi?.dip } set dip(value) { let ekBilgi = this.ekBilgi = this.ekBilgi ?? {}; ekBilgi.dip = value }
	onGridInit(e) { super.onGridInit(e); this.ekBilgi = {} }
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments);
		result.addKAPrefix('hartip', 'mst')
			.addGrupBasit_numerik('ONCELIK', 'Öncelik', 'oncelik')
			.addGrupBasit('HARTIP', 'Ana Bilgi', 'hartip')
			.addGrupBasit('HARTIPKOD', 'Ana Bilgi', 'hartipkod')
			.addGrupBasit('HARTIPADI', 'Ana Bilgi', 'hartipadi')
			.addGrupBasit('MST', '', 'mst', 'Alt Bilgi')
			.addToplamBasit_bedel('DEVIR', 'Devir', 'devir')
			.addToplamBasit_bedel('BORC', 'Borç', 'borc')
			.addToplamBasit_bedel('ALACAK', 'Alacak', 'alacak')
			.addToplamBasit_bedel('BAKIYE', 'Bakiye', 'bakiye', null, null, ({ item }) =>
				item.setFormul(['DEVIR', 'BORC', 'ALACAK'], ({ rec }) => roundToBedelFra(rec.devir + rec.borc - rec.alacak)))
	}
	sabitRaporTanimDuzenle({ result }) {
		super.sabitRaporTanimDuzenle(...arguments);
		result.resetSahalar()
			.addGrup('HARTIPADI')
			.addIcerik('MST', 'DEVIR', 'BORC', 'ALACAK', 'BAKIYE')
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {stm, donemBS} = e, {grupVeToplam} = this.tabloYapi;
		let harClasses = Object.values(Hareketci.kod2Sinif).filter(cls => !!cls.donemselIslemlerIcinUygunmu);
		let {basi: tBasi, sonu: tSonu} = donemBS;
		if (!(tBasi && tSonu)) { throw { isError: true, errorText: `Seçimlerden <b>Dönem</b> seçilmeli veya <b>Tarih Aralık</b> belirtilmelidir` } }
		let tBasiClause = tBasi.sqlServerDegeri(), tSonuClause = tSonu.sqlServerDegeri();
		/*let belirtecler = Object.keys(attrSet).map(kod => grupVeToplam[kod]?.colDefs?.[0]?.belirtec).filter(x => !!x);*/
		let sabitBelirtecler = ['tarih', 'bedel', 'ba'];
		let harListe = []; for (let cls of harClasses) {
			let {mstYapi} = cls, {hvAlias: mstKodAlias, hvAdiAlias: mstAdiAlias} = mstYapi;
			let belirtecler = [...sabitBelirtecler, mstKodAlias, mstAdiAlias].filter(x => !!x);
			let har = new cls(); har.withAttrs(belirtecler); harListe.push(har)
		}
		let uni = new MQUnionAll(); for (let har of harListe) {
			let {kod, aciklama, oncelik, mstYapi} = har.class, {hvAlias: mstKodAlias, hvAdiAlias: mstAdiAlias} = mstYapi;
			let harUni = har.uniOlustur(); for (let harSent of harUni.getSentListe()) {
				if (!harSent) { continue } let {where: wh, sahalar, alias2Deger} = harSent;
				let {tarih: tarihClause, ba: baClause, bedel: bedelClause} = alias2Deger;
				bedelClause = bedelClause.sumOlmaksizin(); wh.add(`${tarihClause} <= ${tSonuClause}`);
				let kodClause = alias2Deger[mstKodAlias], adiClause = alias2Deger[mstAdiAlias];
				/* if (mstAdiAlias) { debugger } */
				sahalar.liste = [];
				if (adiClause) { sahalar.add(`${adiClause} mstadi`) }
				else { mstYapi.sentDuzenle({ sent: harSent, wh, kodClause }) }
				
				/*   DEBUG  
				if (!harSent.alias2Deger.mstadi) {
					console.info(har, Object.keys(har.attrSet), harSent, harSent.getQueryYapi());
					console.table(harSent.alias2Deger);
					debugger
				}
				*/
				
				sahalar.add(
					/* mstadi, */ `${kodClause} mstkod`, `'${kod}' hartipkod`, `${oncelik} oncelik`, `'${aciklama}' hartipadi`, `'(<b class=gray>${kod}</b> ${aciklama}' hartip`,
					`SUM(case when ${tarihClause} < ${tBasiClause} then (case when ${baClause} = 'B' then ${bedelClause} else 0 - ${bedelClause} end) else 0 end) devir`,
					`SUM(case when ${tarihClause} >= ${tBasiClause} AND ${baClause} = 'B' then ${bedelClause} else 0 end) borc`,
					`SUM(case when ${tarihClause} >= ${tBasiClause} AND ${baClause} = 'A' then ${bedelClause} else 0 end) alacak`
				)
				harSent.groupByOlustur().gereksizTablolariSil();
				uni.add(harSent)
			}
		}
		/* console.table(uni.siraliSahalar) */
		stm = e.stm = uni.asToplamStm();
		stm.orderBy.add('oncelik', 'hartipkod', 'mstkod')
	}
	loadServerData_recsDuzenle({ recs }) {
		super.loadServerData_recsDuzenle(...arguments)
		/* let bakiye = 0; for (let rec of recs) { } */
	}
	async detaylariOlustur({ event: evt }) {
		let {row: rec} = evt.args, {hartipkod: harTip, mstkod: kod, level} = rec ?? {}, harSinif = Hareketci.kod2Sinif[harTip];
		if (!(level && harSinif && kod != null)) { return false }
		let {id2AltRapor} = this.rapor, belirtecler = ['mstkod', 'mstadi', 'tarih', 'fisnox', 'islemadi', 'refkod', 'refadi', 'ba', 'bedel'];
		let {oncelik, kod: tipKod, mstYapi} = harSinif, {hvAlias: mstAlias, hvAdiAlias: mstAdiAlias} = mstYapi;
		mstAlias = mstAlias || 'mstkod'; mstAdiAlias = mstAdiAlias || 'mstadi';
		let har = new harSinif()
			.withAttrs(belirtecler)
			.addEkDuzenleyici('mst', ({ hv, sent, where: wh }) => {
				sent.sahalar.add(`${oncelik} _oncelik`, `'${tipKod}' _hartipkod`);
				wh.degerAta(kod, hv[mstAlias])
			});
		let uni = har.uniOlustur(), orderBy = ['_oncelik', '_hartipkod'];
		let stm = new MQStm({ sent: uni, orderBy }), recs;
		try { recs = await app.sqlExecSelect(stm) }
		catch (ex) { hConfirm(getErrorText(ex), 'Detay Bilgi Yükleme Sorunu'); throw ex }
		recs = recs ?? []; let bakiye = 0;
		for (let rec of recs) {
			let {ba, bedel, islemadi, refkod, refadi} = rec;
			let ref = refkod ? `(<b class=gray>${refkod ?? ''})  ${refadi || ''}</b>` : '';
			if (ba == 'A') { bedel = -bedel } let alacakmi = bedel < 0;
			bakiye += bedel; bedel = Math.abs(bedel);
			$.extend(rec, {
				aciklama: islemadi || '', ref,
				borc: alacakmi ? 0 : bedel, alacak: alacakmi ? bedel : 0, bakiye
			})
		}
		this.detaylar = recs;
		return true
	}
	ozetBilgiRecsOlustur(e) { }
	async gridSatirTiklandi(e) {
		if (await this.detaylariOlustur(...arguments)) {
			let {id2AltRapor} = this.rapor; for (let altRapor of Object.values(id2AltRapor)) {
				if (altRapor != this) { altRapor.tazele?.() } }
		}
	}
}

class DRapor_DonemselIslemler_DetaylarVeDip extends DAltRapor_Grid {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_DonemselIslemler }
	get height() { return `calc(var(--full) - ${this.rapor.id2AltRapor.main.height})` }
	gridArgsDuzenle({ args }) { $.extend(args, { showStatusBar: true, showAggregates: true, showGroupAggregates: false, showGroupsHeader: false, rowsHeight: 30, columnsHeight: 25 }) }
	tazele(e) { super.tazele(e) }
	tabloKolonlariDuzenle(e) { super.tabloKolonlariDuzenle(e) }
	loadServerData(e) {
		super.loadServerData(e); let {kod} = this.class, {main} = this.rapor;
		return main[kod] || []
	}
}
class DRapor_DonemselIslemler_Detaylar extends DRapor_DonemselIslemler_DetaylarVeDip {
	static { window[this.name] = this; this._key2Class[this.name] = this } get width() { return 'var(--full)' }
	static get kod() { return 'detaylar' } static get aciklama() { return 'Detaylar' }
	tabloKolonlariDuzenle({ liste }) {
		let cellClassName = (sender, rowIndex, belirtec, value, rec, prefix) => {
			let result = [belirtec];
			if (value) {
				switch (belirtec) {
					case 'borc': result.push('bold green'); break
					case 'alacak': result.push('bold red'); break
					case 'bakiye': result.push(`bold ${value < 0 ? 'red' : 'green'}`); break
				}
			}
			return result.join(' ')
		};
		super.tabloKolonlariDuzenle(...arguments); liste.push(...[
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 12, cellClassName }).tipTarih(),
			new GridKolon({ belirtec: 'fisnox', text: 'Fiş No', cellClassName, genislikCh: 13 }).alignRight(),
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', cellClassName, genislikCh: 25 }),
			new GridKolon({ belirtec: 'ref', text: 'Referans', cellClassName }),
			new GridKolon({ belirtec: 'borc', text: 'Borç', genislikCh: 17, cellClassName }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'alacak', text: 'Alacak', genislikCh: 17, cellClassName }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'bakiye', text: 'Bakiye', genislikCh: 17, cellClassName }).tipDecimal_bedel()
		])
	}
}
