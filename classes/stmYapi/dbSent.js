class MQSent extends MQSentVeIliskiliYapiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get unionmu() { return false } get isDBWriteClause() { return this.toString()?.toUpperCase()?.includes('INTO ') }
	static get aggregateFunctions() { let result = this._aggregateFunctions; if (!result) { result = this._aggregateFunctions = ['SUM', 'COUNT', 'MIN', 'MAX', 'AVG'] } return result }
	static get aggregateFunctionsSet() { let result = this._aggregateFunctionsSet; if (!result) { result = this._aggregateFunctionsSet = asSet(this.aggregateFunctions) } return result }
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
			for (const fromIliskiOrLeftJoin of fromIliskiler) {
				if (fromIliskiOrLeftJoin.leftJoin || fromIliskiOrLeftJoin.on) { this.leftJoin(fromIliskiOrLeftJoin) }
				else { this.fromIliski(fromIliskiOrLeftJoin) }
			}
		}
		if (birlestir) { this.birlestir(birlestir) } if (groupByOlustur) { this.groupByOlustur() }
	}
	static hasAggregateFunctions(e) {
		if (typeof e != 'object') e = { sql: e };
		const {sql} = e; if (!sql) { return false }
		for (const prefix of this.aggregateFunctions) { if (sql.includes(`${prefix}(`) || sql.includes(`${prefix.toLowerCase()}(`)) { return true } }
		return false
	}
	fromGridWSArgs(e) { e = e || {}; this.where.fromGridWSArgs(e) }
	birlestir(diger) {
		this.sahalar.birlestir(diger.sahalar); this.from.birlestir(diger.from); this.where.birlestir(diger.where);
		this.groupBy.birlestir(diger.groupBy); this.having.birlestir(diger.having); this.zincirler.birlestir(diger.zincirler);
		const {params: _params} = diger; if (!$.isEmptyObject(_params)) { const params = this.params = this.params || []; params.push(..._params) }
		return this
	}
	distinctYap() { this.distinct = true; return this }
	groupByOlustur(e) {
		const groupBy = this.groupBy = new MQGroupByClause(), {aggregateFunctions} = this.class, sahaListe = this.sahalar.liste;
		const ekleneceklerSet = {}; let aggregateVarmi = false;
		for (let i = 0; i < sahaListe.length; i++) {
			const saha = sahaListe[i]; let deger = saha.deger?.toString();
			if (!deger || deger == '' || deger == `''` || deger == '0' || isDigit(deger[0]) || deger[0] == `'` || deger.endsWith('*')) { continue }
			const degerUpper = deger.toUpperCase(); if (degerUpper.startsWith('CAST(0') || degerUpper.startsWith("CAST(''") || degerUpper.startsWith('CAST(NULL') || degerUpper.startsWith('NULL')) { continue }
			const toplammi = this.class.hasAggregateFunctions(degerUpper); if (toplammi) { aggregateVarmi = true; continue }
			ekleneceklerSet[deger] = true
		}
		if (aggregateVarmi) { groupBy.addAll(Object.keys(ekleneceklerSet)) }
		return this
	}
	sahalarVeGroupByReset() { this.sahalarReset(); this.groupByReset(); return this }
	sahalarReset() { this.sahalar = new MQSahalar(); return this }
	groupByReset() { this.groupBy = new MQGroupByClause(); this.having = new MQHavingClause(); return this }
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
		for (const iliskiText of iliskiDizi) {
			//	tablo atılırsa iliskinin de kalkması için table yapısında bırakıldı
			const iliski = MQIliskiYapisi.newForText(iliskiText); if (!isOuter) { lastTable.addIliski(iliski) }
			const {varsaZincir: zincir} = iliski; if (zincir) { this.zincirEkle(zincir) }
		}
		return this
	}
	innerJoin(e) {
		e = e || {}; let {alias} = e; const fromText = e.from || e.leftJoin || e.fromText || e.table;
		let iliskiDizi = e.on || e.iliskiDizi || e.iliskiText || e.iliski; if (iliskiDizi && !$.isArray(iliskiDizi)) { iliskiDizi = [iliskiDizi] }
		const xJoin = MQInnerJoin.newForFromText({ text: fromText, on: iliskiDizi });
		const tableYapi = this.from.aliasIcinTable(alias);
		if (!tableYapi) { debugger; throw { isError: true, rc: 'innerJoinTable', errorText: `Inner Join (<i class="bold lightgray">${fromText}</i>) için eklenmek istenen alias (<b class="red">${alias}</b>) bulunamadı` } }
		tableYapi.addLeftInner(xJoin);
		for (const iliskiText of iliskiDizi) {
			const iliski = MQIliskiYapisi.newForText(iliskiText);
			const {varsaZincir: zincir} = iliski; if (zincir) { this.zincirEkle(zincir) }
		}
		return this
	}
	leftJoin(e) {
		e = e || {}; let {alias} = e; const fromText = e.from || e.leftJoin || e.fromText || e.table;
		let iliskiDizi = e.on || e.iliskiDizi || e.iliskiText || e.iliski; if (iliskiDizi && !$.isArray(iliskiDizi)) { iliskiDizi = [iliskiDizi] }
		const xJoin = MQLeftJoin.newForFromText({ text: fromText, on: iliskiDizi }), tableYapi = this.from.aliasIcinTable(alias);
		if (!tableYapi) {
			debugger; throw { isError: true, rc: 'leftJoinTable', errorText: `Left Join (<i class="bold lightgray">${fromText}</i>) için eklenmek istenen alias (<b class="red">${alias}</b>) bulunamadı` }
		}
		tableYapi.addLeftInner(xJoin);
		for (const iliskiText of iliskiDizi) {
			const iliski = MQIliskiYapisi.newForText(iliskiText);
			const {varsaZincir: zincir} = iliski; if (zincir) { this.zincirEkle(zincir) }
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
			for (const altAlias of altOncelikler) { recursiveOncelikDoldur(altAlias, oncelikDizi) }
		};
		let sortedAliases = Object.keys(alias2Oncelik).sort(); for (let alias of sortedAliases) {
			let oncelikDizi = []; recursiveOncelikDoldur(alias, oncelikDizi);
			if (oncelikDizi.length > 1) { result.push(oncelikDizi.reverse()) }
		}
		zincirler.liste = result; return this
	}
	gereksizTablolariSil(e) {
		e = typeof e == 'object' && !$.isArray(e) ? e : { disinda: e };
		let {disinda} = e; if (disinda != null && typeof disinda == 'string') { disinda = [disinda] }
		const disindaSet = e.disinda = (disinda && $.isArray(disinda) ? asSet(disinda) : disinda) || {};
		for (const alias of ['har', 'fis']) { disindaSet[alias] = true } return this.gereksizTablolariSilDogrudan(e)
	}
	gereksizTablolariSilDogrudan(e) {
		e = typeof e == 'object' && !$.isArray(e) ? e : { disinda: e };
		let {disinda} = e; if (disinda && typeof disinda == 'string') { disinda = [disinda] }
		let disindaSet = disinda && $.isArray(disinda) ? asSet(disinda) : disinda;
		this.zincirleriDuzenle({ ...e, disindaSet });
		const iterBlock = item => {
			const coll = item.liste || item; for (const anMQAliasliYapi of coll) {
				const degerAliasListe = anMQAliasliYapi.degerAliasListe || [];
				for (const degerAlias of degerAliasListe) { disindaSet[degerAlias] = true }
			}
		};
		iterBlock(this.sahalar); iterBlock(this.groupBy); iterBlock(this.having);
		const {where, zincirler, from} = this; for (const text of where.liste) {
			try {
				const iliskiYapisi = MQIliskiYapisi.newForText(text); if (iliskiYapisi.isError) { throw iliskiYapisi }
				const aliasYapilar = [iliskiYapisi.sol, iliskiYapisi.sag].filter(x => !!x);
				if (iliskiYapisi.saha) { aliasYapilar.push(MQAliasliYapi.newForSahaText(iliskiYapisi.saha)) }
				for (const {degerAlias} of aliasYapilar) { if (degerAlias) { disindaSet[degerAlias] = true } }
			}
			catch (ex) { if (!(ex && ex.rc == 'queryBuilderError')) { throw ex } }
		}
		for (let zincir of zincirler.liste) { let zincirAlias = zincir.at(-1); if (disindaSet[zincirAlias]) { $.extend(disindaSet, asSet(zincir.slice(0, -1))) } }
		/*let zincirler = this.zincirler?.liste; if (zincirler?.length) { $.extend(disindaSet, asSet(zincirler)) }*/
		from.disindakiTablolariSil({ disindaSet }); return this
	}
	asUnion(e) { let inst = new MQUnion(e); inst.add(this); return inst }
	asUnionAll(e) { let inst = new MQUnionAll(e); inst.add(this); return inst }
	static asTmpTable(e, _sent) {
		e = e || {}; const table = typeof e == 'object' ? e.table : e, sent = typeof e == 'object' ? (_sent || e.sent) : _sent;
		const ilkSent = sent.liste ? sent.liste[0] : sent, result = new MQTmpTable({ table, sent: ilkSent, sahalar: ilkSent.sahalar.liste.map(saha => saha.alias) });
		return result
	}
	asTmpTable(e) { return this.class.asTmpTable(e, this) }
	buildString(e) {
		const {sqlitemi} = window?.app ?? {};
		super.buildString(e); e.result += `SELECT `;
		let {top} = this; if (!sqlitemi && top != null) { e.result += ` TOP ${top} ` }
		if (this.distinct) { e.result += `DISTINCT ` }
		let value = this.sahalar.toString(); e.result += value;
		let where = new MQWhereClause(); this.from.iliskiler2Where({ where }); where.birlestir(this.where);
		let ekle = clause => { clause = clause?.toString(); if (clause) { e.result += `${CrLf}${clause}` } }
		ekle(this.from); ekle(where); ekle(this.groupBy); ekle(this.having)
	}
	// ext //
	fisSilindiEkle(e) { this.where.fisSilindiEkle(e); return this }
	fisHareket(e, _harTablo, _innerJoinFlag) {
		const innerJoinFlag = typeof e == 'object' ? (e.innerJoin || e.inner || e.innerJoinFlag) : _innerJoinFlag;
		const fisTable = typeof e == 'object' ? (e.fisTable || e.fisTablo) : e, harTable = typeof e == 'object' ? (e.harTable || e.harTablo) : _harTablo;
		this.fromAdd(`${fisTable} fis`);
		if (innerJoinFlag) { this.innerJoin({ alias: 'fis', from: `${harTable} har`, on: 'har.fissayac = fis.kaysayac' }) }
		else { this.fromIliski({ from: `${harTable} har`, iliski: 'har.fissayac = fis.kaysayac' }) }
		return this
	}
	fis2HarBagla(e) {
		const harTable = typeof e == 'object' ? (e.harTable || e.harTablo) : e;
		this.fromIliski({ from: `${harTable} har`, iliski: 'fis.kaysayac = har.fissayac' })
		return this
	}
	fis2SubeBagla(e) { this.fromIliski('isyeri sub', 'fis.bizsubekod = sub.kod'); this.sube2GrupBagla(e); return this }
	sube2GrupBagla(e) { this.fromIliski('isygrup igrp', 'sub.isygrupkod = igrp.kod'); return this }
	takip2GrupBagla(e) { this.fromIliski('takipgrup tak', 'tak.grupkod = tgrp.kod'); return this }
	fis2YerBagla(e) { return this.x2YerBagla({ ...e, alias: e.alias ?? 'fis' }) }
	har2YerBagla(e) { return this.x2YerBagla({ ...e, alias: e.alias ?? 'har' }) }
	x2YerBagla(e) { const {alias} = e, aliasVeNokta = alias ? `${alias}.` : ''; this.fromIliski('stkyer yer', `${aliasVeNokta}yerkod = yer.kod`) }
	fis2CariBagla(e) { e = e ?? {}; let mustSaha = (e.mustSaha ?? e.fisMustSaha) || 'must'; this.fromIliski('carmst car', `fis.${mustSaha} = car.must`); return this }
	fis2TicCariBagla(e) { this.fromIliski('carmst car', 'fis.ticmust = car.must'); return this }
	fis2AltHesapBagla(e) { this.fromIliski('althesap alth', 'fis.althesapkod = alth.kod'); return this }
	fis2PlasiyerBagla(e) { this.fromIliski('carmst pls', 'fis.must = car.must'); return this }
	fis2KasaBagla(e) { this.fromIliski('kasmst kas', 'fis.kasakod = kas.kod'); return this }
	fis2BankaHesapBagla(e) { this.fromIliski('banbizhesap bhes', 'fis.banhesapkod = bhes.kod'); return this }
	fis2KrediBankaHesapBagla(e) { this.fromIliski('banbizhesap bhes', 'fis.kredihesapkod = bhes.kod'); return this }
	fisAyrimBagla(e) { /* tamamlanacak */ return this }
	har2MuhHesapBagla(e) { this.fromIliski('muhhesap mhes', 'har.hesapkod = mhes.kod'); return this }
	har2CariBagla(e) { e = e ?? {}; let mustSaha = (e.mustSaha ?? e.harMustSaha) || 'must'; this.fromIliski('carmst car', `har.${mustSaha} = car.must`); return this }
	muhHesap2GrupBagla(e) { this.fromIliski('muhgrup mhgrp', 'mhes.grupkod = mhgrp.kod'); return this }
	cariHepsiBagla(e) { e = e || {}; this.cariYardimciBagla(e); this.cariAyrimBagla(e); return this }
	cari2BolgeBagla(e) {
		e = e || {}; const alias = e.alias ?? 'car', aliasVeNokta = alias ? `${alias}.` : '';
		this.fromIliski('carbolge bol', `${aliasVeNokta}bolgekod = bol.kod`); return this
	}
	bolge2AnaBolgeBagla(e) { this.fromIliski('caranabolge abol', 'bol.anabolgekod = abol.kod'); return this }
	cari2IlBagla(e) {
		e = e || {}; const alias = e.alias ?? 'car', aliasVeNokta = alias + '.';
		this.fromIliski('caril il', `${aliasVeNokta}ilkod = il.kod`); return this
	}
	cari2UlkeBagla(e) {
		e = e || {}; const alias = e.alias ?? 'car', aliasVeNokta = alias + '.';
		this.fromIliski('ulke ulk', `${aliasVeNokta}ulkekod = ulk.kod`); return this
	}
	cari2TipBagla(e) {
		e = e || {}; const alias = e.alias ?? 'car', aliasVeNokta = alias + '.';
		this.fromIliski('cartip ctip', `${aliasVeNokta}tipkod = ctip.kod`); return this
	}
	cari2IstGrupBagla(e) {
		e = e || {}; const alias = e.alias ?? 'car', aliasVeNokta = alias + '.';
		this.fromIliski('caristgrup cigrp', `${aliasVeNokta}cistgrupkod = cigrp.kod`); return this
	}
	cariYardimciBagla(e) {
		e = e || {}; const alias = e.alias ?? 'car', aliasVeNokta = alias + '.';
		this.cari2BolgeBagla(e); this.bolge2AnaBolgeBagla(e); this.cari2IstGrupBagla(e);
		this.cari2IlBagla(e); this.cari2TipBagla(e); this.cari2UlkeBagla(e);
		this.leftJoin({ alias: alias, table: 'muhhesap cmuh', on: `${aliasVeNokta}muhhesap = cmuh.kod` });
		this.fromIliski('carkosulgrup ckgrp', `${aliasVeNokta}kosulgrupkod = ckgrp.kod`);
		this.leftJoin({ alias: alias, table: 'carmemo cmem', on: `${aliasVeNokta}must = cmem.must` });
		this.fromIliski('carmst kon', `(case ${aliasVeNokta}konsolidemusterikod = '' then ${aliasVeNokta}must else ${aliasVeNokta}konsolidemusterikod end) = kon.must`); this.zincirEkle(['car', 'kon']);
		this.fromIliski('carmst bfrm', `(case ${aliasVeNokta}bformkonkod = '' then ${aliasVeNokta}must else ${aliasVeNokta}bformkonkod end) = bfrm.must`); this.zincirEkle(['car', 'bfrm']);
		this.leftJoin({ alias: alias, table: 'carisatis csat', on: [`${aliasVeNokta}must = csat.must`, `csat.satistipkod = ''`] });
		this.leftJoin({ alias: 'csat', table: 'tahsilsekli ctsek', on: 'csat.tahseklino = ctsek.kodno' });
		this.fromIliski('banmst cban', `${aliasVeNokta}bankakod = cban.kod`);
		return this
	}
	cariAyrimBagla(e) { /* tamamlanacak */ e = e || {}; const alias = e.alias ?? 'car', aliasVeNokta = alias + '.'; return this }
	har2AltHesapBagla(e) { this.fromIliski('althesap alth', 'har.cariitn = alth.kod'); return this }
	har2KasaBagla(e) { this.fromIliski('kasmst kas', 'har.kasakod = kas.kod'); return this }
	har2BankaHesapBagla(e) { this.fromIliski('banbizhesap bhes', 'har.banhesapkod = bhes.kod'); return this }
	har2StokBagla(e) { this.fromIliski('stkmst stk', 'har.stokkod = stk.kod'); return this }
	son2StokBagla(e) { this.fromIliski('stkmst stk', 'son.stokkod = stk.kod'); return this }
	son2YerBagla(e) { this.fromIliski('stkyer yer', 'son.yerkod = yer.kod'); return this }
	yer2GrupBagla(e) { this.fromIliski('stkyergrup ygrp', 'yer.yergrupkod = ygrp.kod'); return this }
	yer2SubeBagla(e) { this.fromIliski('isyeri sub', 'yer.bizsubekod = sub.kod'); return this }
	stokHepsiBagla(e) { e = e || {}; this.stokYardimciBagla(e); this.stokAyrimBagla(e); return this }
	stokYardimciBagla(e) {
		e = e || {}; const alias = e.alias ?? 'stk', aliasVeNokta = alias + '.';
		this.stok2GrupBagla(e); this.stokGrup2AnaGrupBagla(e); this.stok2IstGrupBagla(e); this.stok2BarkodBagla(e); return this
	}
	stokAyrimBagla(e) { /* tamamlanacak */ e = e || {}; const alias = e.alias ?? 'stk', aliasVeNokta = alias + '.'; return this }
	stok2GrupBagla(e) {
		e = e || {}; const alias = e.alias ?? 'stk',  aliasVeNokta = alias + '.';
		this.fromIliski('stkgrup grp', `${aliasVeNokta}grupkod = grp.kod`); return this
	}
	stokGrup2AnaGrupBagla(e) {
		e = e || {}; const alias = e.alias ?? 'grp',  aliasVeNokta = alias + '.';
		this.fromIliski('stkanagrup agrp', `${aliasVeNokta}anagrupkod = agrp.kod`); return this
	}
	stok2IstGrupBagla(e) {
		e = e || {}; const alias = e.alias ?? 'stk',  aliasVeNokta = alias + '.';
		this.fromIliski('stkistgrup sigrp', `${aliasVeNokta}sistgrupkod = sigrp.kod`); return this
	}
	stok2MarkaBagla(e) {
		e = e || {}; const alias = e.alias ?? 'stk',  aliasVeNokta = alias + '.';
		this.fromIliski('stokmarka smar', `${aliasVeNokta}smarkakod = smar.kod`); return this
	}
	stok2BarkodBagla(e) {
		e = e || {}; const alias = e.alias ?? 'stk',  aliasVeNokta = alias + '.';
		const iliskiler = [`${alias}.kod = sbar.stokkod`, 'sbar.paketsayac IS NULL', `sbar.varsayilan <> ''`];
		for (const item of HMRBilgi.hmrIter()) {
			const {defaultValue, rowAttr} = item;
			iliskiler.push(`sbar.${rowAttr} = ${MQSQLOrtak.sqlServerDegeri(defaultValue)}`)
		}
		this.leftJoin({ alias: alias, table: 'sbarref sbar', on: iliskiler });
		return this
	}
	stokGTIPBagla(e) {
		e = e || {}; const alias = e.alias ?? 'stk', aliasVeNokta = alias + '.';
		this.fromIliski('stkgtip gtip', `${aliasVeNokta}gtipkod = gtip.kod`); return this
	}
	har2HizmetBagla(e) { this.fromIliski('hizmst hiz', 'har.hizmetkod = hiz.kod'); return this }
	hizmetHepsiBagla(e) { e = e || {}; this.hizmetYardimciBagla(e); this.hizmetAyrimBagla(e); return this }
	hizmetYardimciBagla(e) {
		e = e || {}; const alias = e.alias ?? 'hiz', aliasVeNokta = alias + '.';
		this.hizmet2GrupBagla(e); this.hizmetGrup2AnaGrupBagla(e); this.hizmet2IstGrupBagla(e); return this
	}
	hizmetAyrimBagla(e) { /* tamamlanacak */ e = e || {}; const alias = e.alias ?? 'hiz', aliasVeNokta = alias + '.'; return this }
	hizmet2GrupBagla(e) {
		e = e || {}; const alias = e.alias ?? 'hiz',  aliasVeNokta = alias + '.';
		this.fromIliski('hizgrup grp', `${aliasVeNokta}grupkod = grp.kod`); return this
	}
	hizmetGrup2AnaGrupBagla(e) {
		e = e || {}; const alias = e.alias ?? 'grp',  aliasVeNokta = alias + '.';
		this.fromIliski('hizanagrup agrp', `${aliasVeNokta}anagrupkod = agrp.kod`); return this
	}
	hizmet2IstGrupBagla(e) {
		e = e || {}; const alias = e.alias ?? 'hiz',  aliasVeNokta = alias + '.';
		this.fromIliski('hizistgrup higrp', `${aliasVeNokta}histgrupkod = higrp.kod`); return this
	}
	har2VarsayilanUrunPaketBagla(e) {
		this.leftJoin({ alias: 'har', table: 'urunpaket varp', on: ['har.stokkod = varp.urunkod', `varp.varsayilan <> ''`] });
		return this
	}
	har2HizmetBagla(e) { this.fromIliski('hizmst hiz', 'har.hizmetkod = hiz.kod'); return this }
	har2DemirbasBagla(e) {
		e = e || {}; const sahaAdi = e.sahaAdi || 'demirbaskod';
		this.fromIliski('demmst dem', `har.${sahaAdi} = dem.kod`); return this
	}
	har2KDVBagla(e) { this.fromIliski('vergihesap kver', 'har.kdvhesapkod = kver.kod'); return this }
	har2OTVBagla(e) { this.fromIliski('vergihesap over', 'har.otvhesapkod = over.kod'); return this }
	har2StopajBagla(e) { this.fromIliski('vergihesap sver', 'har.stopajhesapkod = sver.kod'); return this }
	har2PaketBagla(e) { this.leftJoin({ alias: 'har', table: 'paket pak', on: 'har.paketsayac = pak.kaysayac' }); return this }
	har2HMRBagla(e) {
		e = e || {}; const harAlias = e.harAlias ?? e.alias ?? 'har', harAliasVeNokta = harAlias + '.';
		const kodSahaEkleFlag = e.kodEkle ?? e.kodSahaEkle ?? e.kodSahaEkleFlag, adiSahaEkleFlag = e.adiEkle ?? e.adiSahaEkle ?? e.adiSahaEkleFlag;
		for (const item of HMRBilgi.hmrIter()) {
			const {kami, mfSinif, rowAttr, rowAdiAttr} = item;
			if (kami && mfSinif) { const {table, tableAlias, kodSaha} = mfSinif; this.fromIliski(`${table} ${tableAlias}`, `${harAliasVeNokta}${rowAttr} = ${tableAlias}.${kodSaha}`) }
			if (kodSahaEkleFlag) { this.sahalar.add(`${harAliasVeNokta}${rowAttr}`) }
			if (adiSahaEkleFlag && kami && mfSinif && rowAdiAttr) { const {tableAlias, adiSaha} = mfSinif, {adiAttr} = item; this.sahalar.add(`${tableAlias}.${adiSaha} ${adiAttr}`) }
		}
		return this
	}
	/* CDB ext */
	cDB_execute(e) {
		super.cDB_execute(e); const {db} = e.ctx, {from, where} = this, recs = [];
		const alias2DBTable = {}; for (const {aliasVeyaDeger: alias, deger} of from.liste) { alias2DBTable[alias] = db.getTable(deger) }
		let tableAliasSet = {}, alias2WhereListe = {}, whereListe = where.liste.map(iliski => MQIliskiYapisi.newForText(iliski));
		let whereKalanlar = []; for (const {aliasVeyaDeger: alias} of from.liste) {
			tableAliasSet[alias] = true; let removeIndexes = [];
			for (let iliski of whereListe) {
				const uygunmu = [iliski.sol, iliski.sag].map(x => x?.alias).every(x => !x || tableAliasSet[x]); if (!uygunmu) { whereKalanlar.push(iliski); continue }
				(alias2WhereListe[alias] = alias2WhereListe[alias] ?? []).push(iliski)
			}
		}
		for (const {aliasVeyaDeger: alias, iliskiler} of from.liste) {
			let {primaryKeys, data, indexes} = alias2DBTable[alias] ?? {}, indexedData, whereListe = alias2WhereListe[alias];
			if (primaryKeys?.length) {
				const priAliasVeDeger2Iliski = {}; for (const key of primaryKeys) { priAliasVeDeger2Iliski[`${alias}.${key}`] = [] }
				let whereKalanlar = []; for (const iliski of whereListe) {
					const all = [iliski.sol, iliski.sag].map(iliski => iliski.deger).filter(deger => priAliasVeDeger2Iliski[deger]);
					for (const deger of all) {
						if (priAliasVeDeger2Iliski[deger] === undefined) { whereKalanlar.push(iliski) }
						else { priAliasVeDeger2Iliski[deger].push(iliski) }
					}
				} whereListe = whereKalanlar;
				for (const [priAliasVeDeger, iliskiler] of Object.entries(priAliasVeDeger2Iliski)) {
					for (const {sol, sag} of iliskiler) {
						if (sol.deger != priAliasVeDeger) { continue }
						const indexKeys = sag.deger?.sqlDegeri_unescaped()?.toString() ?? CDBTable.NullKey;
						let rowIdSet = indexes.primary.get(indexKeys); if (rowIdSet) {
							/*indexedData = new Map(data.entries().filter(entry => rowIdSet[entry[0]])) */
							indexedData = new Map(); for (const id in rowIdSet) { indexedData.set(id, data.get(id)) }
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
	constructor(e) {
		e = e || {}; super(e);
		if ($.isArray(e)) e = { liste: e }
		else if (typeof e != 'object') e = { liste: [e] }
		this.liste = []; if (!$.isEmptyObject(e.liste)) this.addAll(e.liste);
	}
	*getSentListe(e) { for (const item of this.liste) { yield item } }
	sentDo(e) {
		e = e || {}; if (typeof e != 'object') { e = { callback: e } }
		const {liste} = this;
		for (let i = 0; i < liste.length; i++) {
			const item = liste[i];
			if (e.callback.call(this, item, { item, index: i, liste }) === false) { return false }
		}
	}
	distinctYap() { for (const sent of this.getSentListe()) { sent.distinctYap() }; return this }
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
	birlestir(diger) { for (const sent of diger.getSentListe()) { this.add(sent) } return this }
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
