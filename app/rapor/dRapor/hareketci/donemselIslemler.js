class DRapor_DonemselIslemler extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get uygunmu() { return true } static get araSeviyemi() { return false }
	static get sabitmi() { return true } static get vioAdim() { return null } static get konsolideKullanilirmi() { return false }
	static get kategoriKod() { return DRapor_Hareketci.kategoriKod } static get kategoriAdi() { return DRapor_Hareketci.kategoriAdi }
	static get kod() { return 'DONISL' } static get aciklama() { return 'Dönemsel İşlemler' }
	altRaporlarDuzenle(e) { super.altRaporlarDuzenle(e); this.add(DRapor_DonemselIslemler_Detaylar) }
}
class DRapor_DonemselIslemler_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get donemselIslemlermi() { return true }
	static get raporClass() { return DRapor_DonemselIslemler } get width() { return 'var(--full)' } get height() { return `calc(var(--full) - 328px)` }
	get detaylar() { return this.ekBilgi?.detaylar } set detaylar(value) { let ekBilgi = this.ekBilgi = this.ekBilgi ?? {}; ekBilgi.detaylar = value }
	get dip() { return this.ekBilgi?.dip } set dip(value) { let ekBilgi = this.ekBilgi = this.ekBilgi ?? {}; ekBilgi.dip = value }
	onGridInit(e) { super.onGridInit(e); this.ekBilgi = {} }
	tazele(e) {
		let {secimler: sec, rapor} = this, {tarihBS} = sec;
		if (!(tarihBS?.basi || this.secimlerIstendimi)) { this.secimlerIstendi(); this.secimlerIstendimi = true /*; setTimeout(() => super.tazele(e), 100) */ }
		else { super.tazele(e) }
	}
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments);
		let harClasses = Object.values(Hareketci.kod2Sinif).filter(cls => cls.donemselIslemlerIcinUygunmu);
		let anaTip_kaListe = []; for (let {kod, aciklama} of harClasses) { anaTip_kaListe.push(new CKodVeAdi([kod, aciklama])) }
		let grupKod = 'donemVeTarih'; sec.secimTopluEkle({
			logTS: new SecimDateTime({ etiket: 'Log Zamanı', grupKod }),
			anaTip: new SecimBirKismi({ grupKod, etiket: 'Gösterilecek Bilgiler', kaListe: anaTip_kaListe }).birKismi().autoBind(),
			devirAlinmasin: new SecimBool({ grupKod, etiket: `Devir <b class=firebrick>AlınMAsın</b>` })
		});
		let {donem, tarihAralik} = sec; donem?.tekSecim?.tarihAralik?.();
		if (tarihAralik) { tarihAralik.visible(); tarihAralik.sonu = tarihAralik.sonu || today() }
	}
	tabloYapiDuzenle({ result }) {
		// super.tabloYapiDuzenle(...arguments);
		result.addKAPrefix('mst')
			.addGrupBasit_numerik('ONCELIK', 'Öncelik', 'oncelik', null, null, null, false)
			.addGrupBasit('GRUP', 'Ana Bilgi', 'grup', null, null, ({ item }) => {
				item.setFormul(['GRUP', 'DVKOD'], ({ rec }) =>
					`${rec.grup} (<span class=royalblue>${rec.dvkod || 'TL'}</span>)`)
			}, false)
			.addGrupBasit('GRUP', '', 'grup', null, null, null, false)
			.addGrupBasit('MST', 'Alt Bilgi', 'mst', null, null, null, false)
			/* .addGrupBasit('LOGTS', 'Log Zamanı', 'logTS', null, null, null, false) */
			.addToplamBasit_bedel('DEVIR', 'Devir', 'devir', null, null, null, false)
			.addToplamBasit_bedel('BORC', 'Borç', 'borc', null, null, null, false)
			.addToplamBasit_bedel('ALACAK', 'Alacak', 'alacak', null, null, null, false)
			.addToplamBasit_bedel('BAKIYE', 'Bakiye', 'bakiye', null, null, ({ item }) => {
				item.setFormul(['DEVIR', 'BORC', 'ALACAK'], ({ rec }) =>
					roundToBedelFra(rec.devir + rec.borc - rec.alacak))
			}, false)
	}
	sabitRaporTanimDuzenle({ result }) {
		super.sabitRaporTanimDuzenle(...arguments);
		result.resetSahalar().addGrup('GRUP')
			.addIcerik('MST', 'DEVIR', 'BORC', 'ALACAK', 'BAKIYE')
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {ozelIsaret: ozelIsaretVarmi} = app.params.zorunlu;
		let {stm} = e, {grupVeToplam} = this.tabloYapi, {sqlNull, sqlEmpty} = Hareketci_UniBilgi.ortakArgs;
		let {secimler: sec} = this, {tarihBS: donemBS} = sec, {value: devirAlinmasin} = sec.devirAlinmasin;
		let anaTipSet = asSet(sec.anaTip?.value); if ($.isEmptyObject(anaTipSet)) { anaTipSet = null }
		let harClasses = Object.values(Hareketci.kod2Sinif).filter(cls => !!cls.donemselIslemlerIcinUygunmu && (!anaTipSet || anaTipSet[cls.kod]));
		let {basi: tBasi, sonu: tSonu} = donemBS ?? {}; tSonu = tSonu || today();
		/*if (!(tBasi && tSonu)) { throw { isError: true, errorText: `Seçimlerden <b>Dönem</b> seçilmeli veya <b>Tarih Aralık</b> belirtilmelidir` } }*/
		let tBasiClause = MQSQLOrtak.sqlServerDegeri(tBasi), tSonuClause = MQSQLOrtak.sqlServerDegeri(tSonu);
		/* let devirTBasi = tBasi ? tBasi.clone().addDays(1) : null, devir_tBasiClause = MQSQLOrtak.sqlServerDegeri(devirTBasi); */
		/*let belirtecler = Object.keys(attrSet).map(kod => grupVeToplam[kod]?.colDefs?.[0]?.belirtec).filter(x => !!x);*/
		let sabitBelirtecler = [/*'alttip',*/ 'tarih', 'ba', 'bedel', 'dvbedel', 'dvkod', 'belgetipi', 'finanalizkullanilmaz'];
		if (ozelIsaretVarmi) { sabitBelirtecler.push('ozelisaret') }
		let harListe = []; for (let cls of harClasses) {
			let {mstYapi, altTipYapi} = cls, {hvAlias: mstKodAlias, hvAdiAlias: mstAdiAlias} = mstYapi;
			let belirtecler = [...sabitBelirtecler, mstKodAlias, mstAdiAlias].filter(x => !!x);
			let har = new cls(); har.withAttrs(belirtecler); harListe.push(har)
		}
		let uni = new MQUnionAll(); for (let har of harListe) {
			let {kod: harTipKod, aciklama: harTipAdi, oncelik, altTipYapilar, mstYapi} = har.class;
			let {hvAlias: mstKodAlias, hvAdiAlias: mstAdiAlias} = mstYapi;
			for (let altTipYapi of Object.values(altTipYapilar)) {
				let harUni = har.uniOlustur({ sender: this }), harSentListe = harUni.liste.filter(x => !!x);
				for (let harSent of harSentListe) {
					let {kod: altTipKod, aciklama: altTipAdiClause} = altTipYapi;
					let {from, where: wh, sahalar, alias2Deger} = harSent; sahalar.liste = [];
					/* let {alttip: altTipClause} = alias2Deger; */
					let mstKodClause = alias2Deger[mstKodAlias], mstAdiClause = alias2Deger[mstAdiAlias];
					/* if (mstAdiAlias) { debugger } */
					if (mstAdiClause) { sahalar.add(`${mstAdiClause} mstadi`) }
					else { mstYapi.duzenle({ sent: harSent, wh, mstKodClause }) }
					let grupKod = altTipKod || harTipKod, grupAdiClause = altTipAdiClause || (harTipAdi || '').sqlServerDegeri();
					/*   DEBUG  
					if (!harSent.alias2Deger.mstadi) {
						console.info(har, Object.keys(har.attrSet), harSent, harSent.getQueryYapi());
						console.table(harSent.alias2Deger); debugger
					}
					*/
					let {ozelisaret: ozelIsaretClause, tarih: tarihClause, ba: baClause,
						 bedel: tlBedelClause, dvbedel: dvBedelClause, dvkod: dvKodClause} = alias2Deger;
					dvKodClause = dvKodClause || sqlEmpty;
					let bedelClause = this.getDovizliBedelClause({ dvKodClause, tlBedelClause, dvBedelClause, sumOlmaksizin: true });
					sahalar.add(
						/* mstadi, */ `${mstKodClause} mstkod`, `'${harTipKod}' anatip`, /* `${altTipClause} alttip`, */
						`${grupAdiClause} grup`, `${oncelik} oncelik`, `${this.getRevizeDvKodClause(dvKodClause)} dvkod`
					);
					if (!devirAlinmasin && tBasi) {
						sahalar.add(
							`SUM(case when ${tarihClause} < (${tBasiClause}) then (case when ${baClause} = 'B' then ${bedelClause} else 0 - ${bedelClause} end) else 0 end) devir`,
							`SUM(case when ${tarihClause} >= ${tBasiClause} AND ${baClause} = 'B' then ${bedelClause} else 0 end) borc`,
							`SUM(case when ${tarihClause} >= ${tBasiClause} AND ${baClause} = 'A' then ${bedelClause} else 0 end) alacak`
						)
					}
					else {
						sahalar.add(
							`0 devir`,
							`SUM(case when ${baClause} = 'B' then ${bedelClause} else 0 end) borc`,
							`SUM(case when ${baClause} = 'A' then ${bedelClause} else 0 end) alacak`
						)
					}
					if (devirAlinmasin) { this.donemBagla({ donemBS, tarihSaha: tarihClause, sent: harSent }) }
					else if (tSonu) { wh.add(`${tarihClause} < ${tSonuClause} + 1`) }
					if (ozelIsaretVarmi && ozelIsaretClause) { wh.notDegerAta('X', ozelIsaretClause) }
					let fisAliasVarmi = !!from.liste.find(({ alias }) => alias == 'fis');
					let logZamaniClause = fisAliasVarmi ? 'fis.sonzamants' : sqlNull;
					/* sahalar.add(`${logZamaniClause} logTS`); */
					if (fisAliasVarmi) { wh.basiSonu(sec.logTS, logZamaniClause) }
					altTipYapi.duzenle({
						har, hv: alias2Deger, sent: harSent, wh, harTipKod,
						mstKodClause, mstAdiClause, mstKodAlias, mstAdiAlias
					});
					harSent.groupByOlustur().gereksizTablolariSil();
					uni.add(harSent)
				}
			}
		}
		/* console.table(uni.siraliSahalar) */
		stm = e.stm = uni.asToplamStm();
		stm.orderBy.add('oncelik', 'anatip', 'grup', 'dvkod', 'mstkod')
	}
	loadServerData_recsDuzenle({ recs }) {
		super.loadServerData_recsDuzenle(...arguments)
		for (let rec of recs) {
			let {dvkod: dvKod} = rec;
			if (this.getDovizmi(dvKod)) { rec.grup += ` (<span class="bold orangered">${dvKod}</span>)` }
		}
	}
	async detaylariOlustur(e) {
		let {event: evt} = e, {ozelIsaret: ozelIsaretVarmi} = app.params.zorunlu;
		let {secimler: sec} = this, {tarihBS: donemBS} = sec;
		let {id2AltRapor} = this.rapor, {row: parentRec} = evt.args;
		let {anatip: harTip, mstkod: kod, dvkod: dvKod, level, ozelisaret: ozelIsaret, devir} = parentRec ?? {};
		let harSinif = Hareketci.kod2Sinif[harTip]; if (!(level && harSinif && kod != null)) { return false }
		let tlDvKodSet = asSet(['', 'TL', 'TRY', 'TRL']);
		let sabitBelirtecler = [
			'mstkod', 'mstadi', 'tarih', 'fisnox', 'islemadi', 'refkod', 'refadi',
			'ba', 'bedel', 'dvbedel', 'dvkod', 'aciklama', 'finanalizkullanilmaz'
		];
		if (ozelIsaretVarmi) { sabitBelirtecler.push('ozelisaret') }
		let {oncelik, kod: tipKod, mstYapi} = harSinif, {hvAlias: mstAlias, hvAdiAlias: mstAdiAlias} = mstYapi;
		mstAlias = mstAlias || 'mstkod'; mstAdiAlias = mstAdiAlias || 'mstadi';
		// let dvKodClausecu = hv => `(case when COALESCE(${hv.dvkod || ''}, '') IN ('', 'TL', 'TRY', 'TRL') then '' else ${hv.dvkod || ''} end)`;
		let har = new harSinif().withAttrs(sabitBelirtecler)
			.addEkDuzenleyici('mst', ({ hv, sent, where: wh }) => {
				sent.sahalar.add(`${oncelik} _oncelik`, `'${tipKod}' _hartipkod`);
				wh.degerAta(kod, hv[mstAlias])
			});
		let uni = har.uniOlustur({ sender: this }), orderBy = ['_oncelik', '_hartipkod', 'tarih DESC', 'fisnox DESC', 'islemadi'];
		for (let sent of uni.getSentListe()) {
			let {from, sahalar, where: wh, alias2Deger} = sent;
			let {ozelisaret: ozelIsaretClause, tarih: tarihClause, dvkod: dvKodClause} = alias2Deger;
			if (dvKodClause) { wh.degerAta(dvKod, this.getRevizeDvKodClause({ dvKodClause })) }
			if (ozelIsaretVarmi && ozelIsaretClause) { wh.notDegerAta('X', ozelIsaretClause) }
			if (tarihClause && donemBS) { this.donemBagla({ donemBS, tarihSaha: tarihClause, sent }) }
			let fisAliasVarmi = !!from.liste.find(({ alias }) => alias == 'fis');
			let logZamaniClause = fisAliasVarmi ? 'fis.sonzamants' : sqlNull;
			sahalar.add(`${logZamaniClause} logTS`);
			if (fisAliasVarmi) { wh.basiSonu(sec.logTS, logZamaniClause) }
			sent.groupByOlustur().gereksizTablolariSil();
		}
		let stm = new MQStm({ sent: uni, orderBy }), _recs = (await app.sqlExecSelect(stm)) ?? []
		let bakiye = 0; for (let rec of _recs) {
			let {ba, dvkod: dvKod, bedel: tlBedel, dvbedel: dvBedel, islemadi: islemAdi, refkod: refKod, refadi: refAdi, logTS} = rec;
			let ref = refKod ? `(<b class=gray>${refKod ?? ''})  ${refAdi || ''}</b>` : '';
			let dovizmi = !tlDvKodSet[dvKod || ''], bedel = rec[dovizmi ? 'dvbedel' : 'bedel'];
			if (ba == 'A') { bedel = -bedel } let alacakmi = bedel < 0;
			bakiye += bedel; bedel = Math.abs(bedel);
			$.extend(rec, {
				islemadi: islemAdi || '', ref,
				borc: alacakmi ? 0 : bedel, alacak: alacakmi ? bedel : 0, bakiye,
				logTS: logTS ? dateTimeAsKisaString(asDate(logTS)) : ''
			})
		}
		let recs = _recs; if (devir) {
			let alacakmi = devir < 0, dBedel = Math.abs(devir);
			let dRec = {
				islemadi: `<div class="bold orangered full-wh" style="font-size: 120%">DEVİR</div>`,
				borc: alacakmi ? 0 : dBedel, alacak: alacakmi ? dBedel : 0,
				bakiye: devir
			};
			recs = [..._recs, dRec]
		}
		this.detaylar = recs;
		return true
	}
	ozetBilgiRecsOlustur(e) { }
	gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e);
		let {gridPart, secimler: sec} = this, {gridWidget} = gridPart, {base} = gridWidget, {value: devirAlinmasin} = sec.devirAlinmasin;
		base[devirAlinmasin ? 'hideColumn' : 'showColumn']('devir');
		let {boundRecs: recs} = e; gridPart.expandedRowsSet = {};
		if (recs?.length) { gridWidget.collapseAll() }
	}
	async gridSatirTiklandi(e) {
		let result; try { result = await this.detaylariOlustur(...arguments) }
		catch (ex) { hConfirm(getErrorText(ex), 'Detay Bilgi Yükleme Sorunu'); throw ex }
		if (result) {
			let {id2AltRapor} = this.rapor;
			for (let altRapor of Object.values(id2AltRapor)) { if (altRapor != this) { altRapor.tazele?.() } }
		}
	}
}

class DRapor_DonemselIslemler_DetaylarVeDip extends DAltRapor_Grid {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_DonemselIslemler }
	get height() { return `calc(var(--full) - ${this.rapor.id2AltRapor.main.height})` }
	gridArgsDuzenle({ args }) { $.extend(args, { showStatusBar: false, showAggregates: true, showGroupAggregates: false, showGroupsHeader: true, rowsHeight: 30, columnsHeight: 25 }) }
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
			new GridKolon({ belirtec: 'fisnox', text: 'Fiş No', cellClassName, genislikCh: 13 }).tipNumerik(),
			new GridKolon({ belirtec: 'islemadi', text: 'İşlem', cellClassName, genislikCh: 40, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'ref', text: 'Referans', cellClassName }),
			new GridKolon({ belirtec: 'borc', text: 'Borç', genislikCh: 17, cellClassName }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'alacak', text: 'Alacak', genislikCh: 17, cellClassName }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'bakiye', text: 'Bakiye', genislikCh: 17, cellClassName }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', cellClassName, genislikCh: 40 }),
			new GridKolon({ belirtec: 'logTS', text: 'Log Zamanı', cellClassName, genislikCh: 16 })
		])
	}
}
