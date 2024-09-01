class MQSent extends MQSentVeIliskiliYapiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get unionmu() { return false }
	static get aggregateFunctions() { let result = this._aggregateFunctions; if (!result) { result = this._aggregateFunctions = ['SUM', 'COUNT', 'MIN', 'MAX', 'AVG'] } return result }
	static get aggregateFunctionsSet() { let result = this._aggregateFunctionsSet; if (!result) { result = this._aggregateFunctionsSet = asSet(this.aggregateFunctions) } return result }
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {
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
		if (birlestir) { this.birlestir(birlestir) }
		if (groupByOlustur) { this.groupByOlustur() }
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
		const _params = diger.params;
		if (!$.isEmptyObject(_params)) { const params = this.params = this.params || []; params.push(..._params) }
		return this
	}
	distinctYap() { this.distinct = true; return this }
	groupByOlustur(e) {
		const groupBy = this.groupBy = new MQGroupByClause(), {aggregateFunctions} = this.class, sahaListe = this.sahalar.liste;
		const ekleneceklerSet = {}; let aggregateVarmi = false;
		// for (const saha of sahaListe) {
		for (let i = 0; i < sahaListe.length; i++) {
			const saha = sahaListe[i]; let deger = saha.deger?.toString();
			if (!deger || deger == '' || deger == `''` || deger == '0' || isDigit(deger[0]) || deger[0] == `'`) { continue }
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
		let fromText = e.from;
		if (_iliskiDizi) { e.iliskiDizi = _iliskiDizi } let iliskiDizi = e.iliskiDizi || e.iliskiText || e.iliski;
		if (iliskiDizi && !$.isArray(iliskiDizi)) { iliskiDizi = [iliskiDizi] }
			// MQFromClause >> #add:
		let isOuter = false; const {from, zincirler} = this;
		let lastTable = from.liste[from.liste.length - 1];
		if (lastTable && config?.alaSQLmi) { isOuter = true; lastTable.addLeftInner(MQOuterJoin.newForFromText({ text: fromText, on: iliskiDizi })) }
		else {	 from.add(fromText); lastTable = from.liste[from.liste.length - 1] }
		for (const iliskiText of iliskiDizi) {
			//	tablo atılırsa iliskinin de kalkması için table yapısında bırakıldı
			const iliski = MQIliskiYapisi.newForText(iliskiText); if (!isOuter) { lastTable.addIliski(iliski) }
			const zincir = iliski.varsaZincir; if (zincir) { zincirler.add(zincir) }
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
		const {zincirler} = this;
		for (const iliskiText of iliskiDizi) {
			const iliski = MQIliskiYapisi.newForText(iliskiText), zincir = iliski.varsaZincir;
			if (zincir) { zincirler.add(zincir) }
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
		tableYapi.addLeftInner(xJoin); const {zincirler} = this;
		for (const iliskiText of iliskiDizi) { const iliski = MQIliskiYapisi.newForText(iliskiText), zincir = iliski.varsaZincir; if (zincir) { zincirler.add(zincir) } }
		return this
	}
	add(...sahalar) { this.sahalar.add(...sahalar); return this }
	addAll(e) { this.sahalar.addAll(e); return this }
	addWithAlias(alias, ...sahalar) { this.sahalar.addWithAlias(alias, ...sahalar) }
	addAllWithAlias(e) { this.sahalar.addAllWithAlias(e); return this }
	gereksizTablolariSil(e) {
		e = typeof e == 'object' && !$.isArray(e) ? e : { disinda: e };
		let {disinda} = e; if (disinda != null && typeof disinda == 'string') { disinda = [disinda] }
		const disindaSet = e.disinda = (disinda && $.isArray(disinda) ? asSet(disinda) : disinda) || {};
		for (const alias of ['har', 'fis']) { disindaSet[alias] = true } return this.gereksizTablolariSilDogrudan(e)
	}
	gereksizTablolariSilDogrudan(e) {
		e = typeof e == 'object' && !$.isArray(e) ? e : { disinda: e };
		let {disinda} = e; if (disinda && typeof disinda == 'string') { disinda = [disinda] }
		const disindaSet = disinda && $.isArray(disinda) ? asSet(disinda) : disinda, iterBlock = item => {
			const coll = item.liste || item; for (const anMQAliasliYapi of coll) {
				const degerAliasListe = anMQAliasliYapi.degerAliasListe || [];
				for (const degerAlias of degerAliasListe) { disindaSet[degerAlias] = true }
			}
		};
		iterBlock(this.sahalar); iterBlock(this.groupBy); iterBlock(this.having);
		const {where, from} = this; for (const text of where.liste) {
			try {
				const iliskiYapisi = MQIliskiYapisi.newForText(text);
				if (iliskiYapisi.isError)
					throw iliskiYapisi
				const aliasYapilar = [iliskiYapisi.sol, iliskiYapisi.sag];
				for (const aliasYapi of aliasYapilar) {
					let {degerAlias} = aliasYapi;
					if (degerAlias)
						disindaSet[degerAlias] = true
				}
			}
			catch (ex) {
				if (!(ex && ex.rc == 'queryBuilderError'))
					throw ex
			}
		}
		from.disindakiTablolariSil({ disindaSet: disindaSet });
		return this
	}
	asUnion(e) { return new MQUnion(this) }
	asUnionAll(e) { return new MQUnionAll(this) }
	static asTmpTable(e, _sent) {
		e = e || {};
		const table = typeof e == 'object' ? e.table : e;
		const sent = typeof e == 'object' ? (_sent || e.sent) : _sent;
		const ilkSent = sent.liste ? sent.liste[0] : sent;
		const result = new MQTmpTable({ table, sent: ilkSent, sahalar: ilkSent.sahalar.liste.map(saha => saha.alias) });
		return result
	}
	asTmpTable(e) { return this.class.asTmpTable(e, this) }
	buildString(e) {
		super.buildString(e);

		e.result += `SELECT		`;
		let value = this.top;
		if (value != null)
			e.result += ` TOP ${value} `;
		if (this.distinct)
			e.result += `DISTINCT `;
		
		value = this.sahalar.toString();
		e.result += value;

		let birlesikWhere = new MQWhereClause();
		this.from.iliskiler2Where({ where: birlesikWhere });
		birlesikWhere.birlestir(this.where);

		let ekle = clause => {
			clause = clause.toString();
			if (clause)
				e.result += `${CrLf}${clause}`;
		}
		ekle(this.from);
		ekle(birlesikWhere);
		ekle(this.groupBy);
		ekle(this.having);

		/*value = this.limit;
		if (value)
			e.result += ` LIMIT ${value}`;
		value = this.offset;
		if (value)
			e.result += ` OFFSET ${value}`;*/
	}

	// ext //
	fisSilindiEkle(e) { this.where.fisSilindiEkle(e); return this }
	fisHareket(e, _harTablo, _innerJoinFlag) {
		const innerJoinFlag = typeof e == 'object' ? (e.innerJoin || e.inner || e.innerJoinFlag) : _innerJoinFlag;
		const fisTable = typeof e == 'object' ? (e.fisTable || e.fisTablo) : e;
		const harTable = typeof e == 'object' ? (e.harTable || e.harTablo) : _harTablo;
		this.fromAdd(`${fisTable} fis`);
		if (innerJoinFlag) this.innerJoin({ alias: 'fis', from: `${harTable} har`, on: 'har.fissayac = fis.kaysayac' })
		else this.fromIliski({ from: `${harTable} har`, iliski: 'har.fissayac = fis.kaysayac' })
		return this
	}
	fis2HarBagla(e) {
		const harTable = typeof e == 'object' ? (e.harTable || e.harTablo) : e;
		this.fromIliski({ from: `${harTable} har`, iliski: 'fis.kaysayac = har.fissayac' })
		return this
	}
	fis2SubeBagla(e) { this.fromIliski('isyeri sub', 'fis.bizsubekod = sub.kod'); this.fromIliski('isygrup igrp', 'sub.isygrupkod = igrp.kod'); return this }
	fis2CariBagla(e) { this.fromIliski('carmst car', 'fis.must = car.must'); return this }
	fis2TicCariBagla(e) { this.fromIliski('carmst car', 'fis.ticmust = car.must'); return this }
	fis2AltHesapBagla(e) { this.fromIliski('althesap alth', 'fis.althesapkod = alth.kod'); return this }
	fis2AltHesapBagla_eski(e) { this.fromIliski('althesap alth', 'fis.cariitn = alth.kod'); return this }
	fis2PlasiyerBagla(e) { this.fromIliski('carmst pls', 'fis.must = car.must'); return this }
	fis2KasaBagla(e) { this.fromIliski('kasmst kas', 'fis.kasakod = kas.kod'); return this }
	fis2BankaHesapBagla(e) { this.fromIliski('banbizhesap bhes', 'fis.banhesapkod = bhes.kod'); return this }
	fis2KrediBankaHesapBagla(e) { this.fromIliski('banbizhesap bhes', 'fis.kredihesapkod = bhes.kod'); return this }
	fisAyrimBagla(e) { /* tamamlanacak */ return this }
	cariHepsiBagla(e) { e = e || {}; this.cariYardimciBagla(e); this.cariAyrimBagla(e); return this }
	cari2BolgeBagla(e) {
		e = e || {}; const alias = e.alias ?? 'car', aliasVeNokta = alias + '.';
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
		this.fromIliski('carmst kon', `(case ${aliasVeNokta}konsolidemusterikod = '' then ${aliasVeNokta}must else ${aliasVeNokta}konsolidemusterikod end) = kon.must`); this.zincirler.add(['car', 'kon']);
		this.fromIliski('carmst bfrm', `(case ${aliasVeNokta}bformkonkod = '' then ${aliasVeNokta}must else ${aliasVeNokta}bformkonkod end) = bfrm.must`); this.zincirler.add(['car', 'bfrm']);
		this.leftJoin({ alias: alias, table: 'carisatis csat', on: [`${aliasVeNokta}must = csat.must`, `csat.satistipkod = ''`] });
		this.leftJoin({ alias: 'csat', table: 'tahsilsekli ctsek', on: 'csat.tahseklino = ctsek.kodno' });
		this.fromIliski('banmst cban', `${aliasVeNokta}bankakod = cban.kod`);
		return this
	}
	cariAyrimBagla(e) { /* tamamlanacak */ e = e || {}; const alias = e.alias ?? 'car', aliasVeNokta = alias + '.'; return this }
	har2AltHesapBagla(e) { this.fromIliski('althesap alth', 'har.althesapkod = alth.kod'); return this }
	har2AltHesapBagla_eski(e) { this.fromIliski('althesap alth', 'har.cariitn = alth.kod'); return this }
	har2KasaBagla(e) { this.fromIliski('kasmst kas', 'har.kasa = kas.kod'); return this }
	har2BankaHesapBagla(e) { this.fromIliski('banbizhesap bhes', 'har.banhesapkod = bhes.kod'); return this }
	har2StokBagla(e) { this.fromIliski('stkmst stk', 'har.stokkod = stk.kod'); return this }
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
	/////////
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
