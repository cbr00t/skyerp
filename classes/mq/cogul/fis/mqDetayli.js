class MQDetayli extends MQSayacli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaylimi() { return true } static get detayliMastermi() { return false }
	static get gridKontrolcuSinif() { return null } get gridKontrolcuSinif() { return this.class.gridKontrolcuSinif }
	static get detaySiniflar() {
		let _e = { liste: [] }; this.detaySiniflarDuzenle(_e); let {liste} = _e;
		if ($.isEmptyObject(liste)) { let {detaySinif} = this; if (detaySinif) { liste.push(detaySinif) } }
		return liste
	}
	static get detayTablolar() {
		let result = this._detayTablolar; if (!result) {
			let {detaySiniflar} = this, detayTabloSet = {};
			for (let detaySinif of detaySiniflar) { let {table} = detaySinif; if (table) { detayTabloSet[table] = true } }
			result = this._detayTablolar = Object.keys(detayTabloSet)
		}
		return result
	}
	static get detaySinif() { return null } static get detayTable() { return this.detaySinif?.table }
	static get gridDetaySinif() { return this.detaySinif || (this.detaySiniflar || [])[0] }
	static get detayTableAlias() { return (this.detaySinif || MQDetay).tableAlias }
	static detaySinifFor(e) { e = e || {}; return e.detaySinif || (this.detaySiniflar || [])[0] }
	static get sabitBilgiRaporcuSinif() { return FisRapor } static get logAnaTip() { return 'F' }
	static get gridHeight_bosluk() { return 50 }
	constructor(e) {
		e = e || {}; super(e); let detaylar = this.detaylar = e.detaylar || [];
		let hasNull = false; for (let [i, det] of Object.entries(detaylar)) {
			if (det == null) { hasNull = true; continue }
			if (!$.isPlainObject(det)) { continue }
			let detTip = det.detTip ?? det.dettip ?? det._detTip ?? det.tip ?? '';
			let detSinif = this.class.detaySinifFor({ detTip, rec: det });
			if (detSinif) { det = detaylar[i] = new detSinif(det) }
		}
		if (hasNull) { detaylar = this.detaylar = detaylar.filter(x => x != null) }
	}
	static getUISplitHeight(e) { return null }
	static detaySiniflarDuzenle(e) { }
	static async getRootFormBuilder_fis(e) {
		e = e || {}; let {sender} = e, {baslikFormlar} = sender;
		let templateBuilder = new FormBuilder({ id: 'templates' }).setInst(e => e.builder.rootPart.fis)
			.add(...[
				new FBuilderWithInitLayout({ id: 'gridIslemTuslari', parent: e => e.builder.rootPart.gridIslemTuslari }),
				new FormBuilder({ id: 'tsnForm', layout: e => e.builder.rootPart.tsnForm }), new FormBuilder({ id: 'baslikForm' })
			]);
		for (let i = 0; i < baslikFormlar.length; i++) {
			let subBuilder = new FormBuilder({ id: `baslikForm${i + 1}` }).yanYana().setLayout(e => e.builder.rootPart.baslikFormlar[i])
			templateBuilder.id2Builder.baslikForm.add(subBuilder)
		}
		let tsnFormBuilder = templateBuilder.id2Builder.tsnForm, baslikFormBuilder = templateBuilder.id2Builder.baslikForm;
		baslikFormBuilder.builders[0].altAlta();
		baslikFormBuilder.builders[1].yanYana();
		baslikFormBuilder.builders[2].yanYana(2);
		let rootBuilder = new RootFormBuilder().add(templateBuilder);
		let fis = e.fis ?? e.inst, inst = fis, _e = $.extend({}, e, {
			sender, fis, inst, fismi: true, /*etiketGosterim: 'none',*/
			builders: {
				root: rootBuilder, template: templateBuilder, tsnForm: tsnFormBuilder, baslikForm: baslikFormBuilder,
				gridIslemTuslari: templateBuilder.id2Builder.gridIslemTuslari
			}
		});
		await this.rootFormBuilderDuzenle(_e); await this.rootFormBuilderDuzenleSonrasi(_e);
		if (_e.root) { rootBuilder = _e.root }
		return rootBuilder
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); let {builders, sender} = e, {islemTuslariPart} = sender;
		if (islemTuslariPart) {
			let {ekButonlarIlk, ekSagButonIdSet} = islemTuslariPart;
			ekButonlarIlk.push({ id: 'kolonFiltre', handler: e => this.kolonFiltreIstendi(e) }); ekSagButonIdSet.kolonFiltre = true;
			islemTuslariPart.butonlariOlustur()
		}
	}
	static orjBaslikListesi_argsDuzenle_detaylar(e) {
		let {detaySiniflar} = this;
		if (!$.isEmptyObject(detaySiniflar)) { for (let cls of detaySinif) { detaySinif?.orjBaslikListesi_argsDuzenle(e) } }
	}
	static get orjBaslikListesi_detaylar() {
		let {detaySiniflar} = this, result;
		if (!$.isEmptyObject(detaySiniflar)) { result = detaySiniflar[0].orjBaslikListesi }
		if (!result) { result = super.orjBaslikListesi_detaylar }
		return result
	}
	static orjBaslikListesiDuzenle_detaylar(e) {
		e.fisSinif = e.fisSinif || this; let {detaySiniflar} = this;
		if (!$.isEmptyObject(detaySiniflar)) { return detaySiniflar[0].orjBaslikListesiDuzenle(e) }
		return super.orjBaslikListesiDuzenle_detaylar(e)
	}
	static get listeBasliklari_detaylar() {
		let {detaySiniflar} = this, result;
		if (!$.isEmptyObject(detaySiniflar)) { result = detaySiniflar[0].listeBasliklari }
		if ($.isEmptyObject(result)) { result = super.listeBasliklari_detaylar }
		return result
	}
	static listeBasliklariDuzenle_detaylar(e) {
		e.fisSinif = e.fisSinif || this; let {detaySiniflar} = this, result;
		if (!$.isEmptyObject(detaySiniflar)) { result = detaySiniflar[0].listeBasliklariDuzenle(e) }
		if (!result) { result = super.listeBasliklariDuzenle_detaylar(e) }
		return result
	}
	static raporSabitKolonlarOlustur_detaylar(e) {
		super.raporSabitKolonlarOlustur_detaylar(e);
		let {liste} = e, {orjBaslikListesi_detaylar} = this; e.alias = this.tableAlias;
		for (let colDef of orjBaslikListesi_detaylar) { liste.push(...colDef.asRSahalar(e).filter(saha => !!saha)) }
	}
	static raporKategorileriDuzenle_baslik(e) { }
	static raporKategorileriDuzenle_baslikDetayArasi(e) { }
	static raporKategorileriDuzenle_detaylar(e) { }
	static raporQueryDuzenle_detaylar(e) {
		super.raporQueryDuzenle_detaylar(e); /* let {sent, detaySinif, index, attrListesi} = e; */
		e.fisSinif = this; e.detaySinif.raporQueryDuzenle(e)
	}
	tekilOku_detaylar(e) {
		e = e || {}; /* e.tabloKolonlari = e.tabloKolonlari || this.listeBasliklari; */
		e.query = this.tekilOku_detaylar_queryOlustur(e); return this.class.tekilOku_detaylar_querySonucu(e)
	}
	tekilOku_detaylar_queryOlustur(e) {
		e.fis = e.fis || this; e.fisSinif = e.fisSinif || this.class;
		let {detaySinif} = e; if (!detaySinif && e.detaySiniflar) { detaySinif = (e.detaySiniflar ?? this.detaySiniflar)[0] }
		if (!detaySinif) { return null }
		let uni = e.uni = new MQUnionAll(), stm = e.stm = new MQStm({ sent: uni });
		this.tekilOku_detaylar_queryDuzenle(e); return stm
	}
	tekilOku_detaylar_queryDuzenle(e) {
		let fis = e.fis = e.fis || this; e.fisSinif = e.fisSinif || this.class;
		let {detaySinif} = e; if (!detaySinif && e.detaySiniflar) { detaySinif = (e.detaySiniflar ?? this.detaySiniflar)[0] } if (!detaySinif) { return null }
		let alias = detaySinif.tableAlias || MQDetay.tableAlias, aliasVeNokta = detaySinif.aliasVeNokta || `${alias}.`;
		/*let {stm, uni} = e; let sent = e.sent = new MQSent({ from: `${detaySinif.getDetayTable({ fis })} ${alias}`, sahalar: [`${aliasVeNokta}*`] }); uni.add(sent);
		let tabloKolonlari = detaySinif.listeBasliklari ?? e.tabloKolonlari;
		for (let colDef of tabloKolonlari) {
			if (!colDef.sqlIcinUygunmu) { continue }
			let {belirtec, sql} = colDef; if (sql) sent.sahalar.add(`${sql} ${belirtec}`)
		}*/
		this.class.loadServerData_detaylar_queryDuzenle(e); let result = detaySinif.tekilOku_queryDuzenle(e), {stm} = e;
		for (let sent of stm.getSentListe()) { sent.gereksizTablolariSil({ disinda: alias }) }
		return result
	}
	static tekilOku_detaylar_querySonucu(e) { return this.loadServerData_detaylar_querySonucu(e) }
	static async loadServerData_detaylar(e) {
		e = e || {}; let {detaySiniflar} = e, recs = [];
		if (!detaySiniflar && e.detaySinif) { detaySiniflar = [e.detaySinif] }
		if (!detaySiniflar) { detaySiniflar = this.detaySiniflar }
		if (!$.isEmptyObject(detaySiniflar)) {
			for (let detaySinif of detaySiniflar) {
				delete e.detaySiniflar; e.detaySinif = detaySinif; e.query = this.loadServerData_detaylar_queryOlustur(e);
				let _recs = await this.loadServerData_detaylar_querySonucu(e); if (!_recs) { return _recs }
				recs.push(..._recs)
			}
		}
		if (!$.isEmptyObject(recs)) { let ilkRec = recs[0]; if (ilkRec.seq != null) { recs.sort((a, b) => a.seq < b.seq ? -1 : 1) } }
		return recs
	}
	static loadServerData_detaylar_queryOlustur(e) {
		e.fisSinif = e.fisSinif ?? this; let {detaySiniflar} = e;
		if (!detaySiniflar && e.detaySinif) { detaySiniflar = [e.detaySinif] }
		if (!detaySiniflar) { detaySiniflar = this.detaySiniflar }
		if (!$.isEmptyObject(detaySiniflar)) {
			let uni = e.uni = new MQUnionAll(), stm = e.stm = new MQStm({ sent: uni });
			this.loadServerData_detaylar_queryDuzenle(e); return stm
		}
		return super.loadServerData_detaylar_queryOlustur(e)
	}
	static loadServerData_detaylar_queryDuzenle(e) {
		let fisSinif = e.fisSinif = e.fisSinif ?? e.fis?.class ?? this; let {detaySiniflar} = e;
		if (!detaySiniflar && e.detaySinif) { detaySiniflar = [e.detaySinif] }
		if (!detaySiniflar) { detaySiniflar = this.detaySiniflar }
		if (!$.isEmptyObject(detaySiniflar)) {
			let {stm} = e, fisTableAndAlias = this.tableAndAlias, fisAlias = this.tableAlias, {sayacSaha} = this;
			let sahalarAlinmasinFlag = e.sahalarAlinmasinFlag ?? e.sahalarAlinmasin; let result;
			for (let detaySinif of detaySiniflar) {
				let table = detaySinif.getDetayTable({ fisSinif }), alias = detaySinif.tableAlias || MQDetay.tableAlias, {fisSayacSaha} = detaySinif;
				let aliasVeNokta = detaySinif.aliasVeNokta || `${alias}.`, uni = stm.sent;
				let sent = e.sent = new MQSent({
					from: `${table} ${alias}`, /* sahalar: [`${aliasVeNokta}*`] */
					fromIliskiler: [{ from: fisTableAndAlias, iliski: `${aliasVeNokta}${fisSayacSaha} = ${fisAlias}.${sayacSaha}` }]
				}); uni.add(sent);
				if (!sahalarAlinmasinFlag) {
					let tabloKolonlari = e.tabloKolonlari ?? detaySinif.listeBasliklari;
					for (let colDef of tabloKolonlari) {
						if (!colDef.sqlIcinUygunmu) { continue } let {belirtec, sql} = colDef;
						/*if (sql) sent.sahalar.add(`${sql} ${belirtec}`);*/
						if (belirtec || sql) {sent.sahalar.add((sql ? sql : `${aliasVeNokta}${belirtec}`) + ` ${belirtec}`)}
					}
					if ($.isEmptyObject(sent.sahalar.liste)) { sent.sahalar.add(`${aliasVeNokta}*`) }
					// sent.groupByOlustur();
					sent.gereksizTablolariSil({ disinda: [alias, fisAlias] })
				}
				let _result = detaySinif.loadServerData_queryDuzenle(e); if (result === undefined) { result = _result }
			}
			return result
		}
		return super.loadServerData_detaylar_queryDuzenle(e)
	}
	static loadServerData_detaylar_querySonucu(e) { e.fisSinif = e.fisSinif ?? this; return super.loadServerData_detaylar_querySonucu(e) }
	static orjBaslikListesi_argsDuzenle_detaylar(e) {
		super.orjBaslikListesi_argsDuzenle_detaylar(e); let {detaySiniflar} = this;
		if (detaySiniflar) { for (let detaySinif of detaySiniflar) detaySinif.orjBaslikListesi_argsDuzenle(e) }
	}
	static gridVeriYuklendi_detaylar(e) {
		super.gridVeriYuklendi_detaylar(e); let {detaySiniflar} = this;
		if (detaySiniflar) { for (let detaySinif of detaySiniflar) detaySinif.gridVeriYuklendi(e) }
	}
	getYazmaIcinDetaylar(e) {
		let detSinif = this.class.detaySinifFor?.({ }) ?? this.class.detaySinif;
		return this.detaylar.map(det => $.isPlainObject(det) ? new detSinif(det) : det)
	}
	async yukle(e) {
		e = e || {}; let result = await this.baslikYukle(e); if (result === false) { return result }
		await this.detaylariYukle(e); await this.detaylariYukleSonrasi(e);
		await this.yukleSonrasiIslemler(e); return true
	}
	async baslikYukle(e) {
		e = e || {}; let {sayacSaha} = this.class, {rec} = e;
		if (sayacSaha) {
			let fisSayac = this.sayac || rec?.[sayacSaha]; if (!fisSayac) {
				let keyHV = this.alternateKeyHostVars(); if (keyHV) { delete keyHV[sayacSaha] }
				if ($.isEmptyObject(keyHV)) { throw { isError: true, rc: 'fisSayacBelirlenemedi', errorText: 'Fiş için kaysayac bilgisi belirlenemedi' } }
			}
		}
		try { e.basit = true; return await super.yukle(e) } finally { delete e.basit }
	}
	async detaylariYukle(e) {
		e = e || {}; let {detaySiniflar} = e; if (!detaySiniflar && e.detaySinif) { detaySiniflar = [e.detaySinif] }
		if (!detaySiniflar) { detaySiniflar = this.class.detaySiniflar || [] }
		let fisSayac = this.sayac; $.extend(e, { fisSayac, fis: this, detaySiniflar }); let seq2Detaylar = {};
		for (let detaySinif of detaySiniflar) {
			let _e = $.extend({}, e, { detaySinif }); for (let key of ['rec', 'parentRec', 'detaySiniflar', 'tabloKolonlari']) { delete _e[key] }
			let detRecs = _e.detRecs = await this.tekilOku_detaylar(_e); for (let rec of detRecs) {
				let _detaySinif = this.class.detaySinifFor({ detaySinif, rec });
				if (!_detaySinif) { throw { isError: true, rc: 'detayBelirlenemedi', errorText: 'Detay sınıfı belirlenemedi' } }
				let det = new _detaySinif(); _e.rec = rec; det.setValues(_e);
				let seq = det.seq || 0; (seq2Detaylar[seq] = seq2Detaylar[seq] || []).push(det)
			}
		}
		this.detaylarReset(); let {detaylar} = this, siraliSeqArr = arraySort(Object.keys(seq2Detaylar).map(x => asInteger(x)));
		for (let seq of siraliSeqArr) { let _detaylar = seq2Detaylar[seq]; detaylar.push(..._detaylar) }
		e.detaySiniflar = detaySiniflar
	}
	detaylariYukleSonrasi(e) { }
	async yaz(e) {
		/* üst'e bakma */ e = e || {}; this.detaylariNumaralandir(e); let {sayac: _sayac} = this;
		let offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {trnId} = e;
		e.proc = async e => {
			e = e ?? {}; let paramName_fisSayac = '@fisSayac'; await this.yeniOncesiIslemler(e); let _e = { ...e, toplu: new MQToplu(), paramName_fisSayac };
			await this.topluYazmaKomutlariniOlustur(_e); await this.topluYazmaKomutlariniOlusturSonrasi(_e); if ($.isEmptyObject(_e.toplu.liste)) { return true }
			let {toplu: query, sayac} = _e; _e = { offlineMode, trnId, query, sayac }; let result = await this.sqlExecNoneWithResult(_e); if ($.isArray(result)) { result = result[0] ?? true }
			_e.sqlParam = result = result?.params?.[paramName_fisSayac] ?? result;
			await this.yazSonrasi_sayacGeriYukle(_e); await this.yeniSonrasiIslemler(e); return result
		};
		try { return offlineMode ? await e.proc(e) : (await app.sqlTrnDo(e)).result } catch (ex) { this.sayac = _sayac; throw ex }
	}
	yazSonrasi_sayacGeriYukle(e) {
		let {sqlParam} = e, fisSayac = (e.sayac ?? asInteger(sqlParam.value)) || null;
		if (!fisSayac) { throw { isError: true, rc: 'fisSayac', errorText: 'Kaydedilen fiş için sayaç bilgisi belirlenemedi' } }
		this.sayac = fisSayac
	}
	async degistir(e) {
		/* üst'e bakma */ e = e || {}; if (!$.isPlainObject(e)) { e = { islem: 'degistir', eskiInst: e } }
		this.detaylariNumaralandir(e); let offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {trnId} = e;
		e.proc = async e => {
			e = e ?? {}; await this.degistirOncesiIslemler(e); let _e = { ...e, toplu: new MQToplu() };
			await this.topluDegistirmeKomutlariniOlustur(_e); await this.topluDegistirmeKomutlariniOlusturSonrasi(_e); if ($.isEmptyObject(_e.toplu.liste)) { return true }
			_e = { offlineMode, trnId, query: _e.toplu }; let result = await this.sqlExecNoneWithResult(_e); result = result?.[0] ?? result;
			await this.degistirSonrasiIslemler(e); return result
		};
		return offlineMode ? await e.proc(e) : (await app.sqlTrnDo(e)).result
	}
	async sil(e) {
		/* üst'e bakma */ e = e || {}; let {sayac} = this; if (!sayac) { throw { isError: true, rc: 'fisSayac', errorText: 'Silinecek kayıt belirlenemiyor' } }
		let offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {trnId} = e;
		e.proc = async e => {
			e = e ?? {}; await this.silmeOncesiIslemler(e); let _e = { ...e, toplu: new MQToplu(), sayac };
			await this.topluSilmeKomutlariniOlustur(_e); await this.topluSilmeKomutlariniOlusturSonrasi(_e); if ($.isEmptyObject(_e.toplu.liste)) { return true }
			_e = { offlineMode, trnId, query: _e.toplu }; let result = await this.sqlExecNone(_e); await this.silmeSonrasiIslemler(e); return result
		};
		return offlineMode ? await e.proc(e) : (await app.sqlTrnDo(e)).result
	}
	async kaydetOncesiIslemler(e) {
		await super.kaydetOncesiIslemler(e); let {detaylar} = this;
		for (let det of detaylar) { await det?.kaydetOncesiIslemler(e) }
	}
	async kaydetSonrasiIslemler(e) {
		await super.kaydetSonrasiIslemler(e); let {detaylar} = this;
		for (let det of detaylar) { await det?.kaydetSonrasiIslemler(e) }
	}
	detaylariNumaralandir(e) {
		let {detaylar} = this; if (!detaylar) { return }
		for (let i = 0; i < detaylar.length; i++) { detaylar[i].seq = (i + 1) }
	}
	topluYazmaKomutlariniOlustur(e) {
		/*
			e = { toplu: new MQToplu() };
			d = new (class extends MQDetayli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
				static get table() { return 'abc' }
			});
			d.topluYazmaKomutlariniOlustur(e);
			e.toplu
		*/
		let {toplu, paramName_fisSayac} = e, {table} = this.class, hv = this.hostVars(e); toplu.add(new MQInsert({ table, hv }));
		let keyHV = this.alternateKeyHostVars(e); e.keyHV = keyHV; let sayac = e.sayac = this.topluYazmaKomutlariniOlustur_baslikSayacBelirle(e);
		let detHVArg = e.detHVArg = { fis: this.shallowCopy() }; detHVArg.fis.sayac = sayac ?? new MQSQLConst(paramName_fisSayac);
		let detaylar = this.getYazmaIcinDetaylar(e), detTable2HVListe = e.detTable2HVListe = {};
		for (let det of detaylar) {
			let hv = det.hostVars(detHVArg); if (!hv) { return false }
			let detTable = det.class.getDetayTable(detHVArg), hvListe = detTable2HVListe[detTable] = detTable2HVListe[detTable] || [];
			hvListe.push(hv)
		}
		for (let detTable in detTable2HVListe) { let hvListe = detTable2HVListe[detTable]; toplu.add(new MQInsert({ table: detTable, hvListe })) }
		e.params = toplu.params = toplu.params || []; this.topluYazmaKomutlariniOlustur_sqlParamsDuzenle(e)
	}
	topluYazmaKomutlariniOlustur_baslikSayacBelirle(e) {
		let offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {toplu, trnId, /*keyHV,*/ paramName_fisSayac} = e, {table, sayacSaha} = this.class;
		let query = new MQSent({ from: table /*, where: { birlestirDict: keyHV } */ }), {sahalar} = query;
		if (offlineMode) {
			sahalar.add(`MAX(${sayacSaha}) sayac`); let sayac = this.sqlExecTekilDeger({ offlineMode, trnId, query });
			return (sayac || 0) + 1
		}
		sahalar.add(`${paramName_fisSayac} = MAX(${sayacSaha})`); toplu.add(query);
		toplu.add(`IF COALESCE(@fisSayac, 0) = 0 RAISERROR('Başlık için fisSayac bilgisi belirlenemedi', 16, 1)`)
	}
	topluYazmaKomutlariniOlustur_sqlParamsDuzenle(e) {
		let {params, paramName_fisSayac} = e; params.push({ name: paramName_fisSayac, type: 'int', direction: 'inputOutput', value: 0 })
	}
	async topluDegistirmeKomutlariniOlustur(e) {
		let offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {toplu, trnId} = e;
		let {table, detaySinif: thisDetaySinif} = this.class, harSayacSaha, fisSayacSaha, seqSaha;
		let detTable2HVListe = e.detTable2HVListe = {}, detHVArg = e.detHVArg = { fis: this };
		let detaylar = this.getYazmaIcinDetaylar(e); for (let det of detaylar) {
			let detaySinif = det?.class ?? thisDetaySinif; if (detaySinif && $.isPlainObject(det)) { det = new detaySinif(det) }
			if (!harSayacSaha) { harSayacSaha = detaySinif.sayacSaha } if (!fisSayacSaha) { fisSayacSaha = detaySinif.fisSayacSaha } if (!seqSaha) { seqSaha = det.class.seqSaha }
			let hv = det.hostVars(detHVArg); if (!hv) { return false } hv._harsayac = det.okunanHarSayac;  /* yeni kayıt için null aksinde okunan harsayac */
			let detTable = det.class.getDetayTable(detHVArg), hvListe = detTable2HVListe[detTable] = detTable2HVListe[detTable] || [];
			hvListe.push(hv)
		}
		let fisHV = this.hostVars(e), keyHV = this.keyHostVars({ ...e, varsayilanAlma: true });
		let sent = new MQSent({ from: table, where: { birlestirDict: keyHV }, sahalar: ['*'] });
		let basRec = await this.sqlExecTekil({ offlineMode, trnId, query: sent }), degisenHV = degisimHV(fisHV, basRec);
		if (!$.isEmptyObject(degisenHV)) { toplu.add(new MQIliskiliUpdate({ from: table, where: { birlestirDict: keyHV }, set: { birlestirDict: degisenHV } })) }
		let {sayac: fisSayac} = this; for (let detTable in detTable2HVListe) {
			let ekleHVListe = [], harSayac2HV = {}, detHVListe = detTable2HVListe[detTable];
			for (let hv of detHVListe) { let {_harsayac: harSayac} = hv; if (harSayac) { harSayac2HV[harSayac] = hv } else { ekleHVListe.push(hv) } }
		/* detay tablo için hareketlerden sıra değişimleri, silinecekler, güncellenecekler ve eklenecekler düzenlenir !! tum detay tablolar icin union all ile okunmali */
			let sent = new MQSent({ from: detTable, where: { degerAta: fisSayac, saha: fisSayacSaha }, sahalar: ['*'] });
			let recs = await this.sqlExecSelect({ offlineMode, trnId, query: sent }), sayac2YeniSeq = {}, degisenSayac2HV = {}, silSayaclar = [];
			for (let rec of recs) {
				let harSayac = asInteger(rec[harSayacSaha]), eskiSeq = rec.seq, yHV = harSayac2HV[harSayac];
				if (yHV) {
				/* sira degisimi varsa oncelikli yapilir */ let {seq} = yHV; if (seq != eskiSeq) { sayac2YeniSeq[harSayac] = seq }
					let degisenHV = degisimHV(yHV, rec, [harSayacSaha, seqSaha, '_harsayac'].filter(x => !!x));
					if (!$.isEmptyObject(degisenHV)) { degisenSayac2HV[harSayac] = degisenHV }
					delete harSayac2HV[harSayac]  /* bulunan kayıt için sayac değişimi veya içerik değişimi için bilgiler toplandı */
				}
				else {
					if (harSayac) { /* bu kayıt artık yoktur ve silinmelidir */  silSayaclar.push(harSayac) }
					else if (fisSayacSaha) {
						let hv = {}; hv[fisSayacSaha] = fisSayac; if (seqSaha) { hv[seqSaha] = eskiSeq }
						silSayaclar.push(hv)  /* yanlış değil - aşağıda { typeof silSayaclar[0] == 'object' } kontrolü ile burası için farklı işlem yapılıyor (MQOrClause liste oluşturma işlemi) */
					}
				}
			}
			if (!$.isEmptyObject(harSayac2HV)) { ekleHVListe.push(...Object.values(harSayac2HV)) }
			/* ekleneceklerde harSayac kaldirilir */ for (let hv of ekleHVListe) { delete hv._harsayac }
			/* silinecekler komutu eklenir */ if (!$.isEmptyObject(silSayaclar)) {
				toplu.add(new MQIliskiliDelete({
					from: detTable, where: [
						typeof silSayaclar[0] == 'object'
							? new MQOrClause(silSayaclar.map(hv => new MQSubWhereClause({ birlestirDict: hv }).toString())
							) : { inDizi: silSayaclar, saha: harSayacSaha }
				   ]
				}))
			}
			/* harSayaclarda seq kaydirilacaklar kaydirilir */
			if (!$.isEmptyObject(sayac2YeniSeq)) {
				// (case kaysayac when 1 then $seq1 ... else seq end)
				let clause = `(case ${harSayacSaha}`, harSayacListe = [];
				for (let harSayac in sayac2YeniSeq) {
					let seq = sayac2YeniSeq[harSayac]; clause += ` when ${harSayac} then ${seq}`;
					harSayacListe.push(asInteger(harSayac))
				}
				clause += ` else ${seqSaha} end)`;
				toplu.add(new MQIliskiliUpdate({ from: detTable, where: { inDizi: harSayacListe, saha: harSayacSaha }, set: `${seqSaha} = ${clause}` }))
			}
			/* tek tek degisiklikler yapilir - seq harici */  if (!$.isEmptyObject(degisenSayac2HV)) {
				for (let [harSayac, hv] of Object.entries(degisenSayac2HV)) {
					if (!hv) { continue } harSayac = asInteger(harSayac); delete hv.seq;
					toplu.add(new MQIliskiliUpdate({ from: detTable, where: { degerAta: harSayac, saha: harSayacSaha }, set: { birlestirDict: hv } }))
				}
			}
			/* eklenmesi gerekenler toplu eklenir */  if (!$.isEmptyObject(ekleHVListe)) { toplu.add(new MQInsert({ table: detTable, hvListe: ekleHVListe })) }
		}
	}
	topluSilmeKomutlariniOlustur(e) {
		let {toplu, sayac} = e, {table, sayacSaha} = this.class;
		let detaySinif = this.class.detaySinifFor(e), {fisSayacSaha} = detaySinif, _detayTablo = detaySinif.getDetayTable({ fis: this });
		let detayTablolar = _detayTablo ? $.makeArray(_detayTablo) : detaySinif.detayTablolar;
		for (let detTable of detayTablolar) { toplu.add(new MQIliskiliDelete({ from: detTable, where: { degerAta: sayac, saha: fisSayacSaha } })) }
		toplu.add(new MQIliskiliDelete({ from: table, where: { degerAta: sayac, saha: sayacSaha } }))
	}
	topluYazmaKomutlariniOlusturSonrasi(e) { this.topluYazmaVeyaDegistirKomutlariniOlusturSonrasi(e) }
	topluDegistirmeKomutlariniOlusturSonrasi(e) { this.topluYazmaVeyaDegistirKomutlariniOlusturSonrasi(e) }
	topluSilmeKomutlariniOlusturSonrasi(e) { }
	topluYazmaVeyaDegistirKomutlariniOlusturSonrasi(e) { }
	eBilgiIcinYukle(e) { } eBilgiIcinDetaylariYukle(e) { }
	detayHostVarsDuzenle(e) { } detaySetValues(e) { }
	addDetay(...liste) {
		let {detaylar} = this;
		if (liste) { for (let item of liste) { if (item == null) continue; if ($.isArray(item)) detaylar.push(...item); else detaylar.push(item) } }
		return this
	}
	addDetaylar(liste) { return this.addDetay(liste) }
	detaylarReset() { this.detaylar = []; return this }
	static kolonFiltreIstendi(e) {
		e = e ?? {}; let gridPart = e.gridPart ?? e.sender; if (!gridPart) { return }
		return gridPart.kolonFiltreIstendi(e)
	}
}
class MQDetayliMaster extends MQDetayli {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hasTabs() { return false } static get tanimUISinif() { return MQKA.tanimUISinif }
	static get detayliMastermi() { return true } static get sabitBilgiRaporcuSinif() { return MQCogul.sabitBilgiRaporcuSinif }
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); /*let tanimForm = e.tanimFormBuilder; e.mfSinif = e.mfSinif ?? this;
		tanimForm.add(MQKA.getFormBuilders_ka(e)); this.formBuilder_addTabPanelWithGenelTab(e);*/
		let {tabPanel, kaForm} = e; if (this.hasTabs) { this.formBuilder_addTabPanelWithGenelTab(e); tabPanel = e.tabPanel }
		else { if (tabPanel) { tabPanel.addStyle(e => `$elementCSS > .tabs { display: none !important }`) } }
		if (kaForm && !this.adiKullanilirmi) {
			let {builders} = kaForm;
			let ind = builders.findIndex(fbd => fbd.id == 'aciklama');
			if (ind > -1) { builders.splice(ind, 1) }
		}
	}
	static rootFormBuilderDuzenleSonrasi(e) {
		super.rootFormBuilderDuzenleSonrasi(e); this.rootFormBuilderDuzenle_gridOncesi(e);
		this.rootFormBuilderDuzenle_grid(e); this.rootFormBuilderDuzenle_gridSonrasi(e)
	}
	static rootFormBuilderDuzenle_grid(e) {
		let gridForm = e.gridForm = e.gridForm ?? e.tabPage_genel ?? e.tanimFormBuilder, parentPart = e.parentPart ?? e.sender;
		let {gridHeight_bosluk} = this; if (gridHeight_bosluk == null) { gridHeight_bosluk = 0 }
		if (typeof gridHeight_bosluk == 'number') { gridHeight_bosluk = `${gridHeight_bosluk}px` }
		let gridParent = e.fbd_gridParent = gridForm.addFormWithParent('grid-parent').addStyle_fullWH(null, `calc(var(--full) - ${gridHeight_bosluk})`)
		let {gridKontrolcuSinif} = this, kontrolcu = gridKontrolcuSinif ? new gridKontrolcuSinif({ parentPart }) : null;
		let grid = e.fbd_grid = gridParent.addGridliGiris('grid').addStyle_fullWH()
			.addStyle(e => `$elementCSS { margin-top: 0 !important } $elementCSS > div { margin-top: 0 !important }`)
			.setKontrolcu(kontrolcu).setSource(e => this.rootFormBuilderDuzenle_grid_loadServerData(e))
			.onAfterRun(e => this.rootFormBuilderDuzenle_grid_onAfterRun(e))
	}
	static async rootFormBuilderDuzenle_grid_loadServerData(e) {
		let {builder} = e, {rootPart, inst} = builder, {part: gridPart} = builder, {kontrolcu} = gridPart, {gridDetaySinif} = inst.class;
		let _e = { ...e, fis: inst, inst, recs: [] }; for (let i = 0; i < Math.max(inst.detaylar?.length ?? 0, 1); i++) { _e.recs.push(this.newRec({ sinif: gridDetaySinif })) }
		let result = await kontrolcu?.fis2Grid(_e); if (result != true) { if (result?.errorText) { hConfirm(`<div class="red">${_result.errorText}</div>`) } return false }
		return _e.recs
	}
	static rootFormBuilderDuzenle_grid_onAfterRun(e) {
		let {builder} = e, {rootPart, part: gridPart} = builder, {grid, gridWidget} = gridPart;
		$.extend(rootPart, { fbd_grid: builder, gridPart, grid, gridWidget })
	}
	uiKaydetOncesiIslemler(e) {
		let {gridPart, inst} = e, {kontrolcu} = gridPart; let result = kontrolcu?.grid2Fis(e);
		if (result !== true) {
			if (result.errorText) { hConfirm(`<div class="red">${result.errorText}</div>`, ' ') }
			if (result.returnAction) {
				let {grid, gridWidget} = gridPart;
				let _e = { sender: this, grid, gridWidget, focusTo(e) { gridWidget.clearselection(); gridWidget.selectcell(e.rowIndex, e.belirtec || e.dataField) } };
				getFuncValue.call(this, result.returnAction, _e)
			}
			return false
		}
		inst.detaylar = e.recs
	}
	static rootFormBuilderDuzenle_gridOncesi(e) { } static rootFormBuilderDuzenle_gridSonrasi(e) { }
	static newRec(e) {
		let _e = { ...e }; let gridDetaySinif = e.sinif = e.sinif || this.gridDetaySinif, {gridPart} = _e;
		return gridPart?.newRec(_e) ?? (gridDetaySinif == null ? null : new gridDetaySinif(e))
	}
	static getGridKolonGrup(e) { return MQKA.getGridKolonGrup({ ...e, mfSinif: this }) }
}
class MQDetayliGUID extends MQDetayliMaster {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sayacSaha() { return 'id' } static get kami() { return true }
	get id() { return this.sayac } set id(value) { this.sayac = value }
	constructor(e) {
		e = e ?? {}; super(e);
		this.id = e.id ?? e.sayac ?? this.id
	}
	/*yaz(e) { this.id = this.id || newGUID(); return super.yaz(e) }*/
	topluYazmaKomutlariniOlustur_baslikSayacBelirle(e) { }
	topluYazmaKomutlariniOlustur_sqlParamsDuzenle(e) {
		let {params, paramName_fisSayac} = e; params.push({ name: paramName_fisSayac, type: 'uniqueidentifier', direction: 'input', value: this.id })
	}
	yazSonrasi_sayacGeriYukle(e) { }
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments);
		let {sayacSaha, adiKullanilirmi, adiSaha} = this.class, id = this.id = this.id || newGUID();
		if (sayacSaha && id) { hv[sayacSaha] = id }
		if (adiKullanilirmi && adiSaha) { hv[adiSaha] = this.aciklama }
	}
	setValues({ rec }) {
		super.setValues(...arguments);
		let {adiKullanilirmi, adiSaha} = this.class;
		if (adiKullanilirmi && adiSaha) { this.aciklama = rec[adiSaha] }
	}
	static logRecDonusturucuDuzenle({ result }) {
		super.logRecDonusturucuDuzenle(...arguments);
		let {sayacSaha: kodSaha} = this.class; result[kodSaha] = 'xsayac'
	}
	logHVDuzenle({ hv }) {
		super.logHVDuzenle(...arguments);
		hv.xkod = this.id || 0;
		let {kodKullanilirmi} = this.class; if (kodKullanilirmi) { hv.xkod = this.kod || '' }
	}
}
class MQDetayliVeAdi extends MQDetayliMaster { static { window[this.name] = this; this._key2Class[this.name] = this } static get adiKullanilirmi() { return true } }
class MQDetayliGUIDVeAdi extends MQDetayliGUID { static { window[this.name] = this; this._key2Class[this.name] = this } static get adiKullanilirmi() { return true } }
