class MQSent extends MQSentVeIliskiliYapiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get unionmu() { return false } get isDBWriteClause() { return this.toString()?.toUpperCase()?.includes('INTO ') }
	static get aggregateFunctions() {
		let result = this._aggregateFunctions;
		if (!result) { result = this._aggregateFunctions = ['SUM', 'COUNT', 'MIN', 'MAX', 'AVG', 'STRING_AGG'] }
		return result
	}
	static get aggregateFunctionsSet() {
		let result = this._aggregateFunctionsSet;
		if (!result) { result = this._aggregateFunctionsSet = asSet(this.aggregateFunctions) }
		return result
	}
	get alias2Deger() { return this.sahalar?.alias2Deger }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			distinct: asBool(e.distinct),
			sahalar: (($.isArray(e.sahalar) || $.isPlainObject(e.sahalar) || typeof e.sahalar == 'string' ? new MQSahalar(e.sahalar) : e.sahalar)) || new MQSahalar(),
			from: ($.isArray(e.from) || $.isPlainObject(e.from) || typeof e.from == 'string' ? new MQFromClause(e.from) : e.from) || new MQFromClause(),
			where: ($.isArray(e.where) || $.isPlainObject(e.where) || typeof e.where == 'string' ? new MQWhereClause(e.where) : e.where) || new MQWhereClause(),
			groupBy: ($.isArray(e.groupBy) || $.isPlainObject(e.groupBy) || typeof e.groupBy == 'string' ? new MQGroupByClause(e.groupBy) : e.groupBy) || new MQGroupByClause(),
			having: ($.isArray(e.having) || $.isPlainObject(e.having) || typeof e.having == 'string' ? new MQHavingClause(e.having) : e.having) || new MQHavingClause(),
			zincirler: ($.isArray(e.zincirler) || $.isPlainObject(e.zincirler) ? new MQZincirler(e.zincirler) : e.zincirler) || new MQZincirler(),
			top: e.top, limit: e.limit, offset: e.offset
		});
		let {fromIliskiler, birlestir, groupByOlustur} = e;
		if (!$.isEmptyObject(fromIliskiler)) {
			for (let fromIliskiOrLeftJoin of fromIliskiler) {
				if (fromIliskiOrLeftJoin.leftJoin || fromIliskiOrLeftJoin.on) { this.leftJoin(fromIliskiOrLeftJoin) }
				else { this.fromIliski(fromIliskiOrLeftJoin) }
			}
		}
		if (birlestir) { this.birlestir(birlestir) } if (groupByOlustur) { this.groupByOlustur() }
	}
	static hasAggregateFunctions(e, _aggregateFunctions) {
		if (typeof e != 'object') e = { sql: e, aggregateFunctions: _aggregateFunctions };
		let {sql} = e; if (!sql) { return false }
		let aggregateFunctions = e.aggregateFunctions ?? this.aggregateFunctions;
		for (let prefix of aggregateFunctions) { if (sql.includes(`${prefix}(`) || sql.includes(`${prefix.toLowerCase()}(`)) { return true } }
		return false
	}
	fromGridWSArgs(e) { e = e || {}; this.where.fromGridWSArgs(e) }
	birlestir(diger) {
		this.sahalar.birlestir(diger.sahalar); this.from.birlestir(diger.from); this.where.birlestir(diger.where);
		this.groupBy.birlestir(diger.groupBy); this.having.birlestir(diger.having); this.zincirler.birlestir(diger.zincirler);
		let {params: _params} = diger; if (!$.isEmptyObject(_params)) { let params = this.params = this.params || []; params.push(..._params) }
		return this
	}
	distinctYap() { this.distinct = true; return this }
	groupByOlustur(e) {
		let groupBy = this.groupBy = new MQGroupByClause();
		let {aggregateFunctions} = this.class, sahaListe = this.sahalar.liste;
		let ekleneceklerSet = {}; let aggregateVarmi = false;
		for (let i = 0; i < sahaListe.length; i++) {
			let saha = sahaListe[i]; let deger = saha.deger?.toString();
			if (!deger || deger == '' ||
				deger == `''` || deger == '0' ||
				isDigit(deger[0]) || deger[0] == `'` || deger.endsWith('*')) { continue }
			let degerUpper = deger.toUpperCase();
			if (degerUpper.startsWith('CAST(0') || degerUpper.startsWith("CAST(''") ||
				degerUpper.startsWith('CAST(NULL') || degerUpper.startsWith('NULL')) { continue }
			let toplammi = this.class.hasAggregateFunctions(degerUpper);
			if (toplammi) { aggregateVarmi = true; continue }
			ekleneceklerSet[deger] = true
		}
		if (aggregateVarmi) { groupBy.addAll(Object.keys(ekleneceklerSet)) }
		return this
	}
	havingOlustur(e) {
		e = e ?? {}; let {sahalar, having, class: cls} = this;
		let converter = e.converter ?? (clause => `${clause} <> 0`);
		let aggregateFunctionsSet = { ...cls.aggregateFunctionsSet };
		for (let key of ['COUNT', 'STRING_AGG']) { delete aggregateFunctionsSet[key] }
		let aggregateFunctions = Object.keys(aggregateFunctionsSet);
		let or = new MQOrClause(); for (let {alias, deger: clause} of sahalar.liste) {
			if (clause?.toUpperCase == null) { debugger }
			let clauseUpper = clause?.toUpperCase?.(); if (!clauseUpper) { continue }
			if (!cls.hasAggregateFunctions(clauseUpper, aggregateFunctions)) { continue }
			let convertedClause = converter(clause);
			if (alias == 'kayitsayisi' || alias == 'kayitSayisi') { having.add(convertedClause) }
			else { or.add(convertedClause) }
		}
		if (or.liste.length) { having.add(or) }
		return this
	}
	sahalarVeGroupByVeHavingReset() { return this.sahalarReset().groupByVeHavingReset() }
	sahalarReset() { this.sahalar = new MQSahalar(); return this }
	groupByVeHavingReset() { this.groupBy = new MQGroupByClause(); this.having = new MQHavingClause(); return this }
	fromAdd(e) {
		e = e || {}; if (typeof e != 'object') { e = { from: e } } else { e.from = e.from || e.fromText || e.table }
		let fromText = e.from; this.from.add(fromText); return this
	}
	fromIliski(e, _iliskiDizi) {
		e = e || {}; if (typeof e != 'object') { e = { from: e } } else { e.from = e.from || e.fromText || e.table }
		let {from: fromText} = e; if (_iliskiDizi) { e.iliskiDizi = _iliskiDizi } let iliskiDizi = e.iliskiDizi || e.iliskiText || e.iliski;
		if (iliskiDizi && !$.isArray(iliskiDizi)) { iliskiDizi = [iliskiDizi] }
			// MQFromClause >> #add:
		let isOuter = false, {from} = this, lastTable = from.liste[from.liste.length - 1];
		if (lastTable && config?.alaSQLmi) { isOuter = true; lastTable.addLeftInner(MQOuterJoin.newForFromText({ text: fromText, on: iliskiDizi })) }
		else { from.add(fromText); lastTable = from.liste[from.liste.length - 1] }
		for (let iliskiText of iliskiDizi) {
			//	tablo atılırsa iliskinin de kalkması için table yapısında bırakıldı
			let iliski = MQIliskiYapisi.newForText(iliskiText); if (!isOuter) { lastTable.addIliski(iliski) }
			let {varsaZincir: zincir} = iliski; if (zincir) { this.zincirEkle(zincir) }
		}
		return this
	}
	innerJoin(e, _from, _iliskiDizi) { return this.innerVeyaLeftJoin(e, _from, _iliskiDizi, true) }
	leftJoin(e, _from, _iliskiDizi) { return this.innerVeyaLeftJoin(e, _from, _iliskiDizi, false) }
	innerVeyaLeftJoin(e, _from, _iliskiDizi, innermi) {
		if (typeof e != 'object') { e = { alias: e, from: _from, on: _iliskiDizi } };
		let {alias} = e; let fromText = e.from || e.leftJoin || e.fromText || e.table;
		let iliskiDizi = e.on || e.iliskiDizi || e.iliskiText || e.iliski;
		if (iliskiDizi && !$.isArray(iliskiDizi)) { iliskiDizi = [iliskiDizi] }
		let joinClass = innermi ? MQInnerJoin : MQLeftJoin;
		let {from} = this, xJoin = joinClass.newForFromText({ text: fromText, on: iliskiDizi }), tableYapi = from.aliasIcinTable(alias);
		if (!tableYapi) {
			debugger; throw {
				isError: true, rc: 'xJoinTable',
				errorText: `${innermi ? 'Inner' : 'Left'} Join (<i class="bold lightgray">${fromText}</i>) için eklenmek istenen alias (<b class="red">${alias}</b>) bulunamadı`
			}
		}
		if (!from.addIcinUygunmu(xJoin)) { return this }
		tableYapi.addLeftInner(xJoin);
		for (let iliskiText of iliskiDizi) {
			let iliski = MQIliskiYapisi.newForText(iliskiText);
			let {varsaZincir: zincir} = iliski; if (zincir) { this.zincirEkle(zincir) }
		}
		return this
	}
	add(...sahalar) { this.sahalar.add(...sahalar); return this }
	addAll(e) { this.sahalar.addAll(e); return this }
	addWithAlias(alias, ...sahalar) { this.sahalar.addWithAlias(alias, ...sahalar) }
	addAllWithAlias(e) { this.sahalar.addAllWithAlias(e); return this }
	zincirEkle(item) { this.zincirler.liste.push(item); return this }
	zincirleriDuzenle(e) {
		let {zincirler} = this, alias2Oncelik = {}, result = [];
		for (let zincir of zincirler.liste) { if (zincir?.length) { alias2Oncelik[zincir.at(-1)] = zincir.slice(0, -1)} }
		let recursiveOncelikDoldur = (alias, oncelikDizi) => {
			if (!oncelikDizi.includes(alias)) { oncelikDizi.push(alias) }
			let buOncelikler = alias2Oncelik[alias] ?? [], altOncelikler = arrayFark(buOncelikler, oncelikDizi);
			for (let altAlias of altOncelikler) { recursiveOncelikDoldur(altAlias, oncelikDizi) }
		};
		let sortedAliases = Object.keys(alias2Oncelik).sort(); for (let alias of sortedAliases) {
			let oncelikDizi = []; recursiveOncelikDoldur(alias, oncelikDizi);
			if (oncelikDizi.length > 1) { result.push(oncelikDizi.reverse()) }
		}
		zincirler.liste = result;
		return this
	}
	gereksizTablolariSil(e) {
		e = typeof e == 'object' && !$.isArray(e) ? e : { disinda: e };
		let {disinda} = e; if (disinda != null && typeof disinda == 'string') { disinda = [disinda] }
		let disindaSet = e.disinda = (disinda && $.isArray(disinda) ? asSet(disinda) : disinda) || {};
		for (let alias of ['har', 'fis']) { disindaSet[alias] = true }
		return this.gereksizTablolariSilDogrudan(e)
	}
	gereksizTablolariSilDogrudan(e) {
		e = typeof e == 'object' && !$.isArray(e) ? e : { disinda: e };
		let {disinda} = e; if (disinda && typeof disinda == 'string') { disinda = [disinda] }
		let disindaSet = disinda && $.isArray(disinda) ? asSet(disinda) : disinda;
		this.zincirleriDuzenle({ ...e, disindaSet });
		let iterBlock = item => {
			let coll = item.liste || item; for (let anMQAliasliYapi of coll) {
				let degerAliasListe = anMQAliasliYapi.degerAliasListe || [];
				for (let degerAlias of degerAliasListe) { disindaSet[degerAlias] = true }
			}
		};
		iterBlock(this.sahalar); iterBlock(this.groupBy); iterBlock(this.having);
		let {where, zincirler, from} = this;
		let debugBreak = false; if (config.dev) {
			/*if (from.aliasIcinTable('ctip')) { debugBreak = true }
			let search = `fis.ba = 'A' and tsek.tahsiltipi = 'PS'`;
			if (this.toString().includes(search)) { debugBreak = true }*/
		}
		for (let text of where.liste) {
			try {
				let clauseObjmi = text instanceof MQClause;
				/*if (debugBreak && clauseObjmi) { debugger }*/
				if (clauseObjmi) { text = text.toString() }
				let iliskiYapisi = MQIliskiYapisi.newForText(text); if (iliskiYapisi.isError) { throw iliskiYapisi }
				let aliasYapilar = [iliskiYapisi.sol, iliskiYapisi.sag].filter(x => !!x);
				if (iliskiYapisi.saha) { aliasYapilar.push(MQAliasliYapi.newForSahaText(iliskiYapisi.saha)) }
				for (let {degerAliasListe} of aliasYapilar) {
					/* if (debugBreak) { debugger } */
					for (let degerAlias of degerAliasListe){
						if (degerAlias) { disindaSet[degerAlias] = true } }
				}
			}
			catch (ex) { if (!(ex && ex.rc == 'queryBuilderError')) { throw ex } }
		}
		let tumAliasSet = {}; for (let zincir of zincirler.liste) {
			/* if (debugBreak && zincir.includes('ctip')) { debugger } */
			let zincirAlias = zincir.at(-1); tumAliasSet[zincirAlias] = true;
			if (disindaSet[zincirAlias]) { $.extend(disindaSet, asSet(zincir.slice(0, -1))) }
		}
		/*let zincirler = this.zincirler?.liste; if (zincirler?.length) { $.extend(disindaSet, asSet(zincirler)) }*/
		//if (config.dev && tumAliasSet.tsek) { debugger }
		from.disindakiTablolariSil({ disindaSet });
		return this
	}
	asUnion(e) { let inst = new MQUnion(e); inst.add(this); return inst }
	asUnionAll(e) { let inst = new MQUnionAll(e); inst.add(this); return inst }
	static asTmpTable(e, _sent) {
		e = e || {}; let table = typeof e == 'object' ? e.table : e, sent = typeof e == 'object' ? (_sent || e.sent) : _sent;
		let ilkSent = sent.liste ? sent.liste[0] : sent, result = new MQTmpTable({ table, sent: ilkSent, sahalar: ilkSent.sahalar.liste.map(saha => saha.alias) });
		return result
	}
	asTmpTable(e) { return this.class.asTmpTable(e, this) }
	buildString(e) {
		let {sqlitemi} = window?.app ?? {};
		super.buildString(e); e.result += `SELECT `;
		if (this.distinct) { e.result += `DISTINCT ` }
		let {top} = this; if (!sqlitemi && top != null) { e.result += ` TOP ${top} ` }
		let value = this.sahalar.toString(); e.result += value;
		let where = new MQWhereClause(); this.from.iliskiler2Where({ where }); where.birlestir(this.where);
		let ekle = clause => { clause = clause?.toString(); if (clause) { e.result += `${CrLf}${clause}` } }
		ekle(this.from); ekle(where); ekle(this.groupBy); ekle(this.having)
	}
	// ext //
	fisSilindiEkle(e) { this.where.fisSilindiEkle(e); return this }
	fisHareket(e, _harTablo, _innerJoinFlag) {
		let innerJoinFlag = typeof e == 'object' ? (e.innerJoin || e.inner || e.innerJoinFlag) : _innerJoinFlag;
		let fisTable = typeof e == 'object' ? (e.fisTable || e.fisTablo) : e, harTable = typeof e == 'object' ? (e.harTable || e.harTablo) : _harTablo;
		this.fromAdd(`${fisTable} fis`);
		if (innerJoinFlag) { this.innerJoin({ alias: 'fis', from: `${harTable} har`, on: 'fis.kaysayac = har.fissayac' }) }
		else { this.fromIliski({ from: `${harTable} har`, iliski: 'fis.kaysayac = har.fissayac' }) }
		return this
	}
	fis2HarBagla(e) {
		let harTable = typeof e == 'object' ? (e.harTable || e.harTablo) : e;
		this.fromIliski({ from: `${harTable} har`, iliski: 'fis.kaysayac = har.fissayac' })
		return this
	}
	fis2IslBagla(e) { let alias = e?.alias ?? 'fis'; this.fromIliski('carisl isl', `${alias}.carislkod = isl.kod`); return this }
	fis2IslBagla_leftJoin(e) { let alias = e?.alias ?? 'fis'; this.leftJoin({ alias, from: 'carisl isl', on: `${alias}.carislkod = isl.kod` }); return this }
	fis2StokIslemBagla(e) { return this.x2StokIslemBagla({ ...e, alias: e?.alias ?? 'fis', leftJoin: false }) }
	fis2StokIslemBagla_leftJoin(e) { return this.x2StokIslemBagla({ ...e, alias: e.alias ?? 'fis', leftJoin: true }) }
	har2StokIslemBagla(e) { return this.x2StokIslemBagla({ ...e, alias: e?.alias ?? 'har', leftJoin: false }) }
	har2StokIslemBagla_leftJoin(e) { return this.x2StokIslemBagla({ ...e, alias: e?.alias ?? 'har', leftJoin: true }) }
	x2StokIslemBagla(e) {
		e = e ?? {}; let {alias, kodClause, leftJoin} = e, aliasVeNokta = alias ? `${alias}.` : '';
		kodClause = kodClause || `${aliasVeNokta}islkod`;
		if (leftJoin) { this.leftJoin({ alias, from: 'stkisl isl', on: `${alias}.islkod = isl.kod` }) }
		else { this.fromIliski('stkisl isl', `${kodClause} = isl.kod`); }
		return this
	}
	fis2MuhIslBagla(e) { return this.fis2MuhIslemBagla(e) }
	har2MuhIslBagla(e) { return this.har2MuhIslemBagla(e) }
	x2MuhIslBagla(e) { return this.x2MuhIslemBagla(e) }
	fis2MuhIslemBagla(e) { return this.x2MuhIslemBagla({ ...e, alias: e?.alias ?? 'fis', leftJoin: false }) }
	fis2MuhIslemBagla_leftJoin(e) { return this.x2MuhIslemBagla({ ...e, alias: e?.alias ?? 'fis', leftJoin: true }) }
	har2MuhIslemBagla(e) { return this.x2MuhIslemBagla({ ...e, alias: e?.alias ?? 'har', leftJoin: false }) }
	har2MuhIslemBagla_leftJoin(e) { return this.x2MuhIslemBagla({ ...e, alias: e?.alias ?? 'har', leftJoin: true }) }
	x2MuhIslemBagla(e) {
		e = e ?? {}; let {alias, kodClause, leftJoin} = e, aliasVeNokta = alias ? `${alias}.` : '';
		kodClause = kodClause || `${aliasVeNokta}islkod`;
		if (leftJoin) { this.leftJoin({ alias, from: 'muhisl isl', on: `${alias}.islkod = isl.kod` }) }
		else { this.fromIliski('muhisl isl', `${kodClause} = isl.kod`); }
		return this
	}
	fis2UretimIslemBagla(e) { let alias = e?.alias ?? 'fis'; this.fromIliski('urtisl isl', `${alias}.islkod = isl.kod`); return this }
	fis2TahSekliBagla(e) { return this.x2TahSekliBagla({ alias: 'fis', ...e }) }
	har2TahSekliBagla(e) { return this.x2TahSekliBagla({ alias: 'har', ...e }) }
	x2TahSekliBagla(e) {
		e = e ?? {}; let {alias} = e, kodSaha = e.kodSaha ?? 'tahseklino', kodClause = e.kodClause ?? `${alias}.${kodSaha}`;
		return this.fromIliski('tahsilsekli tsek', `${kodClause} = tsek.kodno`)
	}
	fis2SubeBagla(e) { this.x2SubeBagla({ ...e, alias: e?.alias ?? 'fis' }); this.sube2GrupBagla(e); return this }
	x2SubeBagla(e) {
		e = e ?? {}; let {alias, kodSaha, kodClause} = e;
		kodSaha = kodSaha ?? 'bizsubekod'; kodClause = kodClause ?? `${alias}.${kodSaha}`;
		this.fromIliski('isyeri sub', `${kodClause} = sub.kod`);
		return this
	}
	bolge2SubeBagla(e) { this.fromIliski('isyeri sub', 'bol.bizsubekod = sub.kod'); this.sube2GrupBagla(e); return this }
	sube2GrupBagla(e) { this.fromIliski('isygrup igrp', 'sub.isygrupkod = igrp.kod'); return this }
	takip2GrupBagla(e) { this.fromIliski('takipgrup tak', 'tak.grupkod = tgrp.kod'); return this }
	x2YerBagla(e) {
		e = e ?? {}; let {alias, kodSaha, kodClause} = e;
		kodSaha = kodSaha ?? 'yerkod'; kodClause = kodClause ?? `${alias}.${kodSaha}`;
		this.fromIliski('stkyer yer', `${kodClause} = yer.kod`);
		return this
	}
	fis2YerBagla(e) { return this.x2YerBagla({ ...e, alias: 'fis' }) }
	har2YerBagla(e) { return this.fis2YerBagla({ ...e, alias: 'har' }) }
	son2YerBagla(e) { return this.x2YerBagla({ ...e, alias: 'son' }) }
	har2KatDetayBagla(e) { let alias = e?.alias ?? 'har'; return this.x2KatDetayBagla({ alias }); }
	x2KatDetayBagla(e) {
		e = e ?? {}; let {alias, kodSaha, kodClause} = e; kodSaha = kodSaha ?? 'kdetaysayac'; kodClause = kodClause ?? `${alias}.${kodSaha}`;
		this.leftJoin(alias, 'kategoridetay kdet', `${kodClause} = kdet.kaysayac`);
		return this
	}
	x2CariBagla(e) { e = e ?? {}; let {kodClause} = e; this.fromIliski('carmst car', `${kodClause} = car.must`); return this }
	fis2CariBagla(e) { e = e ?? {}; let mustSaha = (e.mustSaha ?? e.fisMustSaha) || 'must'; this.fromIliski('carmst car', `fis.${mustSaha} = car.must`); return this }
	x2HizmetBagla(e) { let kodClause = e?.kodClause; this.fromIliski('hizmst hiz', `${kodClause} = hiz.kod`); return this }
	fis2HizmetBagla(e) { return this.x2HizmetBagla({ ...e, kodClause: 'fis.hizmetkod' }) }
	har2HizmetBagla(e) { return this.x2HizmetBagla({ ...e, kodClause: 'har.hizmetkod' }) }
	fis2TicCariBagla(e) { this.fromIliski('carmst car', 'fis.ticmust = car.must'); return this }
	fis2AltHesapBagla(e) { this.fromIliski('althesap alth', 'fis.althesapkod = alth.kod'); return this }
	fis2AltHesapBagla_eski(e) { this.fromIliski('althesap alth', 'fis.cariitn = alth.kod'); return this }
	fis2PlasiyerBagla(e) { this.fromIliski('carmst pls', 'fis.plasiyerkod = pls.must'); return this }
	fis2SevkAdresBagla(e) { this.fromIliski('carsevkadres sadr', 'fis.xadreskod = sadr.kod'); return this }
	fis2DegAdresBagla(e) { this.fromIliski('degiskenadres dadr', 'fis.degiskenvknox = dadr.vknox'); return this }
	x2KasaBagla(e) { e = e ?? {}; let {kodClause} = e; this.fromIliski('kasmst kas', `${kodClause} = kas.kod`); return this }
	fis2KasaBagla(e) { return this.x2KasaBagla({ ...e, kodClause: 'fis.kasakod' }) }
	fis2BankaHesapBagla(e) { return this.x2BankaHesapBagla({ ...e, kodClause: 'fis.banhesapkod' }) }
	fis2KrediBankaHesapBagla(e) { return this.x2BankaHesapBagla({ ...e, kodClause: 'fis.kredihesapkod' }) }
	x2BankaHesapBagla(e) { let kodClause = e?.kodClause; this.fromIliski('banbizhesap bhes', `${kodClause} = bhes.kod`); return this }
	fisAyrimBagla(e) { /* tamamlanacak */ return this }
	fis2MuhHesapBagla(e) { return this.x2MuhHesapBagla({ alias: 'fis' }) }
	har2MuhHesapBagla(e) { return this.x2MuhHesapBagla({ alias: 'har' }) }
	x2MuhHesapBagla(e) {
		e = e ?? {}, {alias, kodClause} = e, aliasVeNokta = alias ? `${alias}.` : '';
		kodClause = kodClause || `${aliasVeNokta}muhhesap`;
		this.fromIliski('muhhesap mhes', `${kodClause} = mhes.kod`);
		return this
	}
	har2CariBagla(e) { e = e ?? {}; let mustSaha = (e.mustSaha ?? e.harMustSaha) || 'must'; this.fromIliski('carmst car', `har.${mustSaha} = car.must`); return this }
	har2TicCariBagla(e) { e = e ?? {}; let mustSaha = (e.mustSaha ?? e.harMustSaha) || 'ticmustkod'; this.fromIliski('carmst car', `har.${mustSaha} = car.must`); return this }
	har2PosKosulBagla(e) { let kodSaha = e?.kodSaha ?? 'poskosulkod'; this.fromIliski('poskosul pkos', `har.${kodSaha} = pkos.kod`); return this }
	muhHesap2GrupBagla(e) { this.fromIliski('muhgrup mhgrp', 'mhes.grupkod = mhgrp.kod'); return this }
	cariHepsiBagla(e) { this.cariYardimciBagla(e); this.cariAyrimBagla(e); return this }
	cari2BolgeBagla(e) {
		let alias = e?.alias ?? 'car', aliasVeNokta = alias ? `${alias}.` : '';
		this.fromIliski('carbolge bol', `${aliasVeNokta}bolgekod = bol.kod`); return this
	}
	bolge2AnaBolgeBagla(e) { this.fromIliski('caranabolge abol', 'bol.anabolgekod = abol.kod'); return this }
	cari2IlBagla(e) {
		let alias = e?.alias ?? 'car', aliasVeNokta = alias + '.';
		this.fromIliski('caril il', `${aliasVeNokta}ilkod = il.kod`); return this
	}
	cari2UlkeBagla(e) {
		let alias = e?.alias ?? 'car', aliasVeNokta = alias + '.';
		this.fromIliski('ulke ulk', `${aliasVeNokta}ulkekod = ulk.kod`); return this
	}
	cari2TipBagla(e) {
		let alias = e?.alias ?? 'car', aliasVeNokta = alias + '.';
		this.fromIliski('cartip ctip', `${aliasVeNokta}tipkod = ctip.kod`); return this
	}
	cari2IstGrupBagla(e) {
		let alias = e?.alias ?? 'car', aliasVeNokta = alias + '.';
		this.fromIliski('caristgrup cigrp', `${aliasVeNokta}cistgrupkod = cigrp.kod`); return this
	}
	cariYardimciBagla(e) {
		let alias = e?.alias ?? 'car', aliasVeNokta = alias + '.';
		this.cari2BolgeBagla(e); this.bolge2AnaBolgeBagla(e); this.cari2IstGrupBagla(e);
		this.cari2IlBagla(e); this.cari2TipBagla(e); this.cari2UlkeBagla(e);
		this.leftJoin({ alias, table: 'muhhesap cmuh', on: `${aliasVeNokta}muhhesap = cmuh.kod` });
		this.fromIliski('carkosulgrup ckgrp', `${aliasVeNokta}kosulgrupkod = ckgrp.kod`);
		this.leftJoin({ alias, table: 'carmemo cmem', on: `${aliasVeNokta}must = cmem.must` });
		this.fromIliski('carmst kon', `(case ${aliasVeNokta}konsolidemusterikod = '' then ${aliasVeNokta}must else ${aliasVeNokta}konsolidemusterikod end) = kon.must`); this.zincirEkle(['car', 'kon']);
		this.fromIliski('carmst bfrm', `(case ${aliasVeNokta}bformkonkod = '' then ${aliasVeNokta}must else ${aliasVeNokta}bformkonkod end) = bfrm.must`); this.zincirEkle(['car', 'bfrm']);
		this.leftJoin({ alias, table: 'carisatis csat', on: [`${aliasVeNokta}must = csat.must`, `csat.satistipkod = ''`] });
		this.leftJoin({ alias: 'csat', table: 'tahsilsekli ctsek', on: 'csat.tahseklino = ctsek.kodno' });
		this.fromIliski('banmst cban', `${aliasVeNokta}bankakod = cban.kod`);
		return this
	}
	cariAyrimBagla(e) { /* tamamlanacak */ let alias = e?.alias ?? 'car', aliasVeNokta = alias + '.'; return this }
	har2AltHesapBagla(e) { this.fromIliski('althesap alth', 'har.cariitn = alth.kod'); return this }
	har2KasaBagla(e) { return this.x2KasaBagla({ ...e, kodClause: 'har.kasakod' }) }
	har2BankaHesapBagla(e) { this.fromIliski('banbizhesap bhes', 'har.banhesapkod = bhes.kod'); return this }
	x2StokBagla(e) {
		e = e ?? {}; let {alias, kodSaha, kodClause} = e;
		kodSaha = kodSaha ?? 'stokkod'; kodClause = kodClause ?? `${alias}.${kodSaha}`;
		this.fromIliski('stkmst stk', `${kodClause} = stk.kod`);
		return this
	}
	har2StokBagla(e) { return this.x2StokBagla({ ...e, alias: 'har' }) }
	son2StokBagla(e) { return this.x2StokBagla({ ...e, alias: 'son' }) }
	yer2GrupBagla(e) { this.fromIliski('stkyergrup ygrp', 'yer.yergrupkod = ygrp.kod'); return this }
	yer2SubeBagla(e) { this.fromIliski('isyeri sub', 'yer.bizsubekod = sub.kod'); return this }
	stokHepsiBagla(e) { this.stokYardimciBagla(e); this.stokAyrimBagla(e); return this }
	stokYardimciBagla(e) {
		let alias = e?.alias ?? 'stk', aliasVeNokta = alias + '.';
		this.stok2GrupBagla(e); this.stokGrup2AnaGrupBagla(e); this.stok2IstGrupBagla(e); this.stok2BarkodBagla(e); return this
	}
	stokAyrimBagla(e) { /* tamamlanacak */ let alias = e?.alias ?? 'stk', aliasVeNokta = alias + '.'; return this }
	stok2GrupBagla(e) {
		let alias = e?.alias ?? 'stk',  aliasVeNokta = alias + '.';
		this.fromIliski('stkgrup grp', `${aliasVeNokta}grupkod = grp.kod`); return this
	}
	stokGrup2AnaGrupBagla(e) {
		let alias = e?.alias ?? 'grp',  aliasVeNokta = alias + '.';
		this.fromIliski('stkanagrup agrp', `${aliasVeNokta}anagrupkod = agrp.kod`); return this
	}
	stok2IstGrupBagla(e) {
		let alias = e?.alias ?? 'stk',  aliasVeNokta = alias + '.';
		this.fromIliski('stkistgrup sigrp', `${aliasVeNokta}sistgrupkod = sigrp.kod`); return this
	}
	stok2MarkaBagla(e) {
		let alias = e?.alias ?? 'stk',  aliasVeNokta = alias + '.';
		this.fromIliski('stokmarka smar', `${aliasVeNokta}smarkakod = smar.kod`); return this
	}
	stok2BarkodBagla(e) {
		let alias = e?.alias ?? 'stk',  aliasVeNokta = alias + '.';
		let iliskiler = [`${alias}.kod = sbar.stokkod`, 'sbar.paketsayac IS NULL', `sbar.varsayilan <> ''`];
		for (let item of HMRBilgi.hmrIter()) {
			let {defaultValue, rowAttr} = item;
			iliskiler.push(`sbar.${rowAttr} = ${MQSQLOrtak.sqlServerDegeri(defaultValue)}`)
		}
		this.leftJoin({ alias, table: 'sbarref sbar', on: iliskiler });
		return this
	}
	stokGTIPBagla(e) {
		let alias = e?.alias ?? 'stk', aliasVeNokta = alias + '.';
		this.fromIliski('stkgtip gtip', `${aliasVeNokta}gtipkod = gtip.kod`); return this
	}
	hizmetHepsiBagla(e) { this.hizmetYardimciBagla(e); this.hizmetAyrimBagla(e); return this }
	hizmetYardimciBagla(e) {
		let alias = e?.alias ?? 'hiz', aliasVeNokta = alias + '.';
		this.hizmet2GrupBagla(e); this.hizmetGrup2AnaGrupBagla(e); this.hizmet2IstGrupBagla(e); return this
	}
	hizmetAyrimBagla(e) { /* tamamlanacak */ let alias = e?.alias ?? 'hiz', aliasVeNokta = alias + '.'; return this }
	hizmet2GrupBagla(e) {
		let alias = e?.alias ?? 'hiz',  aliasVeNokta = alias + '.';
		this.fromIliski('hizgrup grp', `${aliasVeNokta}grupkod = grp.kod`); return this
	}
	hizmetGrup2AnaGrupBagla(e) {
		let alias = e?.alias ?? 'grp',  aliasVeNokta = alias + '.';
		this.fromIliski('hizanagrup agrp', `${aliasVeNokta}anagrupkod = agrp.kod`); return this
	}
	hizmet2IstGrupBagla(e) {
		let alias = e?.alias ?? 'hiz',  aliasVeNokta = alias + '.';
		this.fromIliski('hizistgrup higrp', `${aliasVeNokta}histgrupkod = higrp.kod`); return this
	}
	bankaHesap2BankaBagla(e) { this.fromIliski('banmst ban', 'bhes.bankakod = ban.kod'); return this }
	har2VarsayilanUrunPaketBagla(e) {
		this.leftJoin({ alias: 'har', table: 'urunpaket varp', on: ['har.stokkod = varp.urunkod', `varp.varsayilan <> ''`] });
		return this
	}
	har2HizmetBagla(e) { this.fromIliski('hizmst hiz', 'har.hizmetkod = hiz.kod'); return this }
	har2DemirbasBagla(e) {
		let sahaAdi = e?.sahaAdi || 'demirbaskod';
		this.fromIliski('demmst dem', `har.${sahaAdi} = dem.kod`); return this
	}
	har2KDVBagla(e) { this.fromIliski('vergihesap kver', 'har.kdvhesapkod = kver.kod'); return this }
	har2OTVBagla(e) { this.fromIliski('vergihesap over', 'har.otvhesapkod = over.kod'); return this }
	har2StopajBagla(e) { this.fromIliski('vergihesap sver', 'har.stopajhesapkod = sver.kod'); return this }
	har2PaketBagla(e) { this.leftJoin({ alias: 'har', table: 'paket pak', on: 'har.paketsayac = pak.kaysayac' }); return this }
	har2HMRBagla(e) {
		let harAlias = e?.harAlias ?? e?.alias ?? 'har', harAliasVeNokta = harAlias + '.';
		let kodSahaEkleFlag = e.kodEkle ?? e.kodSahaEkle ?? e.kodSahaEkleFlag, adiSahaEkleFlag = e.adiEkle ?? e.adiSahaEkle ?? e.adiSahaEkleFlag;
		for (let item of HMRBilgi.hmrIter()) {
			let {kami, mfSinif, rowAttr, rowAdiAttr} = item;
			if (kami && mfSinif) { let {table, tableAlias, kodSaha} = mfSinif; this.fromIliski(`${table} ${tableAlias}`, `${harAliasVeNokta}${rowAttr} = ${tableAlias}.${kodSaha}`) }
			if (kodSahaEkleFlag) { this.sahalar.add(`${harAliasVeNokta}${rowAttr}`) }
			if (adiSahaEkleFlag && kami && mfSinif && rowAdiAttr) { let {tableAlias, adiSaha} = mfSinif, {adiAttr} = item; this.sahalar.add(`${tableAlias}.${adiSaha} ${adiAttr}`) }
		}
		return this
	}
	pcsBaslikBagla(e) {
		return this.fromIliski('csportfoy prt', 'fis.portfkod = prt.kod')
			.fromIliski('csportfoy refprt', 'fis.refportfkod = refprt.kod')
			.fromIliski('carmst fiscar', 'fis.fisciranta = fiscar.must')
			.fromIliski('caril fiscaril', 'fiscar.ilkod = fiscaril.kod')
			.fromIliski('cartip fisctip', 'fiscar.tipkod = fisctip.kod')
			.fromIliski('banbizhesap bhes', 'fis.banhesapkod = bhes.kod')
			.fromIliski('banbizhesap refhes', 'fis.refhesapkod = refhes.kod')
	}
	pcsPortfoy2DigerBagla(e) {
		this.pcsBaslikBagla(e)
			.fromIliski('carmst belcir', 'bel.ciranta = belcir.must')
			.fromIliski('carmst devcir', 'bel.devirciranta = devcir.must')
			.fromIliski('cartip devctip', 'devcir.tipkod = devctip.kod')
	}
	/* CDB ext */
	cDB_execute(e) {
		super.cDB_execute(e); let {db} = e.ctx, {from, where} = this, recs = [];
		let alias2DBTable = {}; for (let {aliasVeyaDeger: alias, deger} of from.liste) { alias2DBTable[alias] = db.getTable(deger) }
		let tableAliasSet = {}, alias2WhereListe = {}, whereListe = where.liste.map(iliski => MQIliskiYapisi.newForText(iliski));
		let whereKalanlar = []; for (let {aliasVeyaDeger: alias} of from.liste) {
			tableAliasSet[alias] = true; let removeIndexes = [];
			for (let iliski of whereListe) {
				let uygunmu = [iliski.sol, iliski.sag].map(x => x?.alias).every(x => !x || tableAliasSet[x]); if (!uygunmu) { whereKalanlar.push(iliski); continue }
				(alias2WhereListe[alias] = alias2WhereListe[alias] ?? []).push(iliski)
			}
		}
		for (let {aliasVeyaDeger: alias, iliskiler} of from.liste) {
			let {primaryKeys, data, indexes} = alias2DBTable[alias] ?? {}, indexedData, whereListe = alias2WhereListe[alias];
			if (primaryKeys?.length) {
				let priAliasVeDeger2Iliski = {}; for (let key of primaryKeys) { priAliasVeDeger2Iliski[`${alias}.${key}`] = [] }
				let whereKalanlar = []; for (let iliski of whereListe) {
					let all = [iliski.sol, iliski.sag].map(iliski => iliski.deger).filter(deger => priAliasVeDeger2Iliski[deger]);
					for (let deger of all) {
						if (priAliasVeDeger2Iliski[deger] === undefined) { whereKalanlar.push(iliski) }
						else { priAliasVeDeger2Iliski[deger].push(iliski) }
					}
				} whereListe = whereKalanlar;
				for (let [priAliasVeDeger, iliskiler] of Object.entries(priAliasVeDeger2Iliski)) {
					for (let {sol, sag} of iliskiler) {
						if (sol.deger != priAliasVeDeger) { continue }
						let indexKeys = sag.deger?.sqlDegeri_unescaped()?.toString() ?? CDBTable.NullKey;
						let rowIdSet = indexes.primary.get(indexKeys); if (rowIdSet) {
							/*indexedData = new Map(data.entries().filter(entry => rowIdSet[entry[0]])) */
							indexedData = new Map(); for (let id in rowIdSet) { indexedData.set(id, data.get(id)) }
						}
					}
				}
				if (indexedData == null) { /* ... */ }
			}
		}
	}
}
class MQCTESent extends MQSentVeIliskiliYapiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get baglac() { return '' }
	get siraliSahaVeDegerler() { let result = []; for (let sent of this.getSentListe()) { result.push(sent.alias2Deger) }; return result }
	get siraliSahalar() { return this.siraliSahaVeDegerler.map(dict => Object.keys(dict)) }
	constructor(e) {
		e = e || {}; super(e);
		if ($.isArray(e)) e = { liste: e }
		else if (typeof e != 'object') e = { liste: [e] }
		this.liste = []; if (!$.isEmptyObject(e.liste)) this.addAll(e.liste);
	}
	*getSentListe(e) { for (let item of this.liste) { yield item } }
	sentDo(e) {
		e = e || {}; if (typeof e != 'object') { e = { callback: e } }
		let {liste} = this;
		for (let i = 0; i < liste.length; i++) {
			let item = liste[i];
			if (e.callback.call(this, item, { item, index: i, liste }) === false) { return false }
		}
	}
	distinctYap() { for (let sent of this.getSentListe()) { sent.distinctYap() }; return this }
	add(e) {
		if (!e && typeof e != 'number') { return }
		this.liste.push(e); return this
	}
	addAll(coll) { this.liste.push(...coll); return this }
	asTmpTable(e) { return MQSent.asTmpTable(e, this) }
	buildString(e) { super.buildString(e); e.result += (this.liste.map(item => item.toString()).join(`${CrLf}${this.class.baglac}${CrLf}`)) }
}
class MQUnionBase extends MQCTESent {
	static { window[this.name] = this; this._key2Class[this.name] = this } get unionmu() { return true }
	birlestir(diger) { for (let sent of diger.getSentListe()) { this.add(sent) } return this }
}
class MQUnion extends MQUnionBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get unionmu() { return true } static get baglac() { return '  UNION' }
	asUnion(e) { return this } asUnionAll(e) { return new MQUnionAll(this) }
}
class MQUnionAll extends MQUnionBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get baglac() { return '  UNION ALL' }
	asUnion(e) { return new MQUnion(this) } asUnionAll(e) { return this }
}
class MQExceptBase extends MQCTESent { }
class MQExcept extends MQExceptBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get baglac() { return '  EXCEPT' }
}
class MQExceptAll extends MQExceptBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get baglac() { return '  EXCEPT ALL' }
}
