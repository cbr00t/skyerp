class DRapor_AraSeviye extends DGrupluPanelRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altRaporClassPrefix() { return this.name }
}
class DRapor_AraSeviye_Main extends DAltRapor_TreeGridGruplu {
	static { window[this.name] = this; this._key2Class[this.name] = this } get tazeleYapilirmi() { return true }
	static get dvKodListe() { let result = this._dvKodListe; if (result === undefined) { result = this._dvKodListe = ['USD', 'EUR'] } return result } get dvKodListe() { return this.class.dvKodListe }
	static get yatayTip2Bilgi() {
		let result = this._yatayTip2Bilgi; if (result == null) {
			result = this._yatayTip2Bilgi = {
				YA: { kod: 'YILAY', belirtec: 'yilay', text: 'Yıl/Ay' },
				AY: { kod: 'AYADI', belirtec: 'ayadi', text: 'Aylık' },
				HF: { kod: 'HAFTA', belirtec: 'haftano', text: 'Haftalık' },
				SG: { kod: 'SUBEGRUP', belirtec: 'subegrup', text: 'Şube Grup' },
				SB: { kod: 'SUBE', belirtec: 'sube', text: 'Şube' },
				DB: { kod: 'DB', belirtec: 'db', text: 'Veritabanı' },
				SM: { kod: 'STOKMARKA', belirtec: 'stokmarka', text: 'Stok Marka' },
				AG: { kod: 'STANAGRP', belirtec: 'anagrup', text: 'Stok Ana Grup' },
				TG: { kod: 'STGRP', belirtec: 'grup', text: 'Stok Grup' },
				SI: { kod: 'STISTGRP', belirtec: 'sistgrup', text: 'Stok İst. Grup' },
				CT: { kod: 'CRTIP', belirtec: 'tip', text: 'Cari Tip' },
				UL: { kod: 'CRULKE', belirtec: 'ulke', text: 'Ülke' },
				IL: { kod: 'CRIL', belirtec: 'il', text: 'İl' },
				AB: { kod: 'CRANABOL', belirtec: 'anabolge', text: 'Ana Bölge' },
				BL: { kod: 'CRBOL', belirtec: 'bolge', text: 'Bölge' },
				PL: { kod: 'PLASIYER', belirtec: 'plasiyer', text: 'Plasiyer' },
				DG: { kod: 'DEPOGRUP', belirtec: 'yergrup', text: 'Yer Grup' },
				DP: { kod: 'DEPO', belirtec: 'yer', text: 'Yer' }
			}
		}
		if (!app.params.dRapor.konsolideCikti) { result = { ...result }; delete result.DB }
		return result
	}
	secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const {secimler} = e, {grupVeToplam} = this.tabloYapi;
		const islemYap = (keys, callSelector, args) => {
			for (const key of keys) {
				const item = key ? grupVeToplam[key] : null; if (item == null) { continue }
				const proc = item[callSelector]; if (proc) { proc.call(item, args) }
			}
		}; islemYap(Object.keys(grupVeToplam), 'secimlerDuzenle', e);
		secimler.whereBlockEkle(_e => {
			islemYap(Object.keys(grupVeToplam) || {}, 'tbWhereClauseDuzenle', { ...e, ..._e })
			/*islemYap(Object.keys(this.raporTanim?.attrSet || {}), 'tbWhereClauseDuzenle', { ...e, ..._e })*/
		})
	}
	cellsRenderer(e) {
		e.html = super.cellsRenderer(e); const {belirtec, rec} = e;
		switch (belirtec) {
			case 'renk': {
				const {oscolor1, oscolor2} = rec; if (oscolor1) {
					let color = { start: os2HTMLColor(oscolor1), end: os2HTMLColor(oscolor2) };
					e.html = `<div class="full-wh" style="font-weight: bold; color: ${getContrastedColor(color.start ?? '')}; background-repeat: no-repeat !important; background: linear-gradient(180deg, ${color.end} 20%, ${color.start} 80%) !important">${e.html}</div>`
				}
			} break
			case 'desen': {
				const {imagesayac} = rec; if (imagesayac) {
					let url = `${app.getWSUrlBase({ wsPath: 'ws/genel' })}/dbResimData/?id=${imagesayac}`;
					e.html = `<div class="grid-resim full-wh" style="font-weight: bold; background-repeat: no-repeat !important; background-size: cover; background-image: url(${url}) !important">${e.html}</div>`
				}
			} break
		}
		return e.html
	}
	async loadServerDataInternal(e) {
		await super.loadServerDataInternal(e); const {raporTanim, secimler} = this, attrSet = e.attrSet ?? raporTanim.attrSet, {maxRow, donemBS} = e;
		let _e = { ...e, stm: new MQStm(), attrSet, donemBS }, recs = await this.loadServerData_ilk(e); if (recs !== undefined) { return recs }
		this.loadServerData_queryDuzenle_tekil(_e); this.loadServerData_queryDuzenle_tekilSonrasi(_e); this.loadServerData_queryDuzenle_genelSon(_e);
		let query = _e.stm; recs = e.recs = query ? await app.sqlExecSelect({ query, maxRow }) : null;
		let _recs = await this.loadServerData_son(e); if (_recs !== undefined) { recs = _recs }
		return recs
	}
	super_loadServerDataInternal(e) { return super.loadServerDataInternal(e) }
	loadServerData_ilk(e) { } loadServerData_son(e) { }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e;
		if (app.params.dRapor.konsolideCikti) { result.addGrup(new TabloYapiItem().setKA('DB', 'Veritabanı').addColDef(new GridKolon({ belirtec: 'db', text: 'Veritabanı', genislikCh: 18 }))) }
		this.tabloYapiDuzenle_ozel?.(e)
	}
	tabloYapiDuzenle_son(e) {
		super.tabloYapiDuzenle_son(e); const {result} = e; this.tabloYapiDuzenle_son_ozel?.(e);
		result.addToplam(new TabloYapiItem().setKA('KAYITSAYISI', 'Kayıt Sayısı').addColDef(new GridKolon({ belirtec: 'kayitsayisi', text: 'Kayıt Sayısı', genislikCh: 10, filterType: 'numberinput', aggregates: ['sum'] }).tipNumerik()))
	}
	loadServerData_queryDuzenle_tekil(e) { e = e ?? {}; this.loadServerData_queryDuzenle(e); this.loadServerData_queryDuzenle_son(e) }
	loadServerData_queryDuzenle(e) {
		let alias = e.alias = e.alias ?? 'fis'; const {secimler, raporTanim, tabloYapi} = this, {yatayAnaliz} = raporTanim.kullanim, {stm} = e;
		let {attrSet: _attrSet} = e, attrSet = e.attrSet = raporTanim._ozelAttrSet = { ..._attrSet };
		for (const sent of stm.getSentListe()) { sent.sahalar.add(`COUNT(*) kayitsayisi`) }
		if (secimler) {
			for (const [key, secim] of Object.entries(secimler.liste)) {
				if (secim.isHidden || secim.isDisabled) { continue } const kod = secim.userData?.kod; if (!kod) { continue }
				const uygunmu = typeof secim.value == 'object' ? !$.isEmptyObject(secim.value) : !!secim.value;
				if (uygunmu) { attrSet[kod] = true }
			}
		}
		const {toplam} = tabloYapi; for (const key in attrSet) {
			const formul = toplam[key]?.formul; if (!formul) { continue }
			let {attrListe} = formul; if (attrListe?.length) { $.extend(attrSet, asSet(attrListe)) }
		}
		if (yatayAnaliz) { attrSet[DRapor_AraSeviye_Main.yatayTip2Bilgi[yatayAnaliz]?.kod] = true }
		this.loadServerData_queryDuzenle_ozel?.(e)
	}
	loadServerData_queryDuzenle_son(e) {
		this.loadServerData_queryDuzenle_son_ozel?.(e);
		let {alias, stm, attrSet} = e, {secimler, tabloYapi} = this;
		let dvKodSet = asSet(this.dvKodListe), gecerliDvKodSet = {}, dvKodVarmi = false;
		for (const key in attrSet) { const dvKod = key.split('_').slice(-1)[0]; if (dvKodSet[dvKod]) { gecerliDvKodSet[dvKod] = dvKodVarmi = true } }
		for (const sent of stm.getSentListe()) {
			for (const dvKod in gecerliDvKodSet) {
				const kurAlias = `kur${dvKod}`;
				sent.leftJoin({ alias, from: `ORTAK..ydvkur ${kurAlias}`, on: [`${alias}.tarih = ${kurAlias}.tarih`, `${kurAlias}.kod = '${dvKod}'`] })
			}
			sent.sahalar.add(`COUNT(*) kayitsayisi`)
		}
		let tbWhere = secimler?.getTBWhereClause(e); for (const {where: wh, sahalar} of stm.getSentListe()) { if (tbWhere?.liste?.length) { wh.birlestir(tbWhere) } }
	}
	loadServerData_queryDuzenle_tekilSonrasi(e) {
		let {ekDBListe} = app.params.dRapor, {stm, attrSet} = e, alias_db = 'db';
		if (ekDBListe?.length) {
			let asilUni = stm.sent = stm.sent.asUnionAll();
			for (let {sahalar} of asilUni.getSentListe()) {
				if (attrSet.DB && !sahalar.liste.find(saha => saha.alias == alias_db)) { sahalar.add(`${`[ <span class=royalblue>${config.session.dbName}</span> ]`.sqlServerDegeri() ?? '- Aktif VT -'} ${alias_db}`) } }
			for (let db of ekDBListe ?? []) {
				let uni = asilUni.deepCopy(); if (!uni.liste.length) { continue }
				for (let sent of uni.getSentListe()) {
					let {from, sahalar} = sent; for (let item of from.liste) {
						let {deger} = item, hasDB = deger.includes('.');
						if (!hasDB) { item.deger = deger = `${db}..${deger}` }
					}
					{ let saha = sahalar.liste.find(x => x.alias == alias_db); if (saha) { saha.deger = db.sqlServerDegeri() } }
				} asilUni.addAll(uni.liste)
			};
			stm = e.stm = stm.asToplamStm()
		}
	}
	loadServerData_queryDuzenle_genelSon(e) {
		let {stm, attrSet} = e, {orderBy} = stm, {grup} = this.tabloYapi;
		for (const kod in attrSet) { let {orderBySaha} = grup[kod] ?? {}; if (orderBySaha) { orderBy.add(orderBySaha) } }
	}
	loadServerData_recsDuzenle(e) { return super.loadServerData_recsDuzenle(e) }
	async loadServerData_recsDuzenleSon(e) {
		return await super.loadServerData_recsDuzenleSon(e) /* const {attrSet} = this.raporTanim, {toplam} = this.tabloYapi, avgBelirtec2ColDef = {};
		for (const key in attrSet) {
			if (!toplam[key]) { continue } let avgColDefs = toplam[key]?.colDefs?.filter(colDef => colDef?.aggregates?.includes('avg')); if (!avgColDefs?.length) { continue }
			for (const colDef of avgColDefs) { avgBelirtec2ColDef[colDef.belirtec] = colDef }
		}
		let {recs} = e; if (!$.isEmptyObject(avgBelirtec2ColDef)) {
			for (const rec of recs) {
				let {kayitsayisi: count} = rec; if (!count) { continue }
				for (const key in avgBelirtec2ColDef) {
					let value = rec[key]; if (!(value && typeof value == 'number')) { continue }
					let fra = avgBelirtec2ColDef[key]?.tip?.fra ?? 0;
					rec[key] = value = roundToFra(value / count, fra)
				}
			}
		}
		return recs*/
	}
	donemBagla(e) { const {donemBS, tarihSaha, sent} = e; if (donemBS) { sent.where.basiSonu(donemBS, tarihSaha) } return this }
	tabloYapiDuzenle_hmr(e) {
		const {result} = e; for (const {belirtec, etiket: text, numerikmi, kami: _kami, mfSinif} of HMRBilgi.hmrIter()) {
			const tip = belirtec.toUpperCase(), kami = _kami && !!mfSinif, genislikCh = 15;
			if (kami) { result.addKAPrefix(belirtec) }
			result.addGrup(new TabloYapiItem().setKA(tip, text).secimKullanilir().setMFSinif(mfSinif).addColDef(
				numerikmi
					? new GridKolon({ belirtec, text, genislikCh, filterType: 'numberinput' }).tipNumerik()
					: new GridKolon({ belirtec, text, genislikCh, filterType: 'input' }))
			)
		} return this
	}
	loadServerData_queryDuzenle_hmr(e) {
		const {stm, attrSet} = e, alias = e.alias == 'fis' ? 'har' : e.alias, aliasVeNokta = alias ? `${alias}.` : ''; for (let sent of stm.getSentListe()) {
			const {where: wh, sahalar} = sent; for (const {belirtec, rowAttr, kami, mfSinif} of HMRBilgi.hmrIter()) {
				const tip = belirtec.toUpperCase(); if (!attrSet[tip]) { continue }
				const hmrTable = kami && mfSinif ? mfSinif.table : null;
				if (hmrTable) {
					let {table: hmrTable, tableAlias: hmrTableAlias, idSaha, adiSaha} = mfSinif;
					sent.fromIliski(`${hmrTable} ${hmrTableAlias}`, `${alias}.${rowAttr} = ${hmrTableAlias}.${idSaha}`);
					sahalar.add(`${aliasVeNokta}${rowAttr} ${belirtec}kod`);
					if (adiSaha) { sahalar.add(`${hmrTableAlias}.${adiSaha} ${belirtec}adi`) }
					switch (tip) {
						case 'RENK': sahalar.add(`${hmrTableAlias}.oscolor1`, `${hmrTableAlias}.uyarlanmisoscolor2 oscolor2`); break
						case 'DESEN': sahalar.add(`${hmrTableAlias}.imagesayac`); break
					}
				}
				else { sahalar.add(`${aliasVeNokta}${rowAttr} ${belirtec}`) }
			}
		} return this
	}
	getBrmliMiktarClause(e) {
		e = e ?? {}; let brmTip = (e.brmTip ?? e.tip)?.toUpperCase(); const {tip2BrmListe} = MQStokGenelParam, brmListe = tip2BrmListe?.[brmTip]; if (!brmListe?.length) { return '0' }
		let {mstAlias, harAlias, miktarPrefix, getMiktarClause} = e; mstAlias = mstAlias ?? 'stk'; harAlias = harAlias ?? 'har'; miktarPrefix = miktarPrefix ?? '';
		getMiktarClause = getMiktarClause ?? (miktarClause => miktarClause);
		const mstAliasVeNokta = mstAlias ? `${mstAlias}.` : '', harAliasVeNokta = harAlias ? `${harAlias}.` : '';
		const getWhereClause = brmSaha => new MQSubWhereClause({ inDizi: brmListe ?? [], saha: `${mstAliasVeNokta}brm` }).toString();
		return `SUM(case when ${getWhereClause('brm')} then ${getMiktarClause(`${harAliasVeNokta}${miktarPrefix}miktar`)}` +
						` when ${getWhereClause('brm2')} then ${getMiktarClause(`${harAliasVeNokta}${miktarPrefix}miktar2`)}` +
						` else 0 end)`
	}
}
