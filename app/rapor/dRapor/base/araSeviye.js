class DRapor_AraSeviye extends DGrupluPanelRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/* static get altRaporClassPrefix() { return this.name } */
	get dvKodListe() {
		let {_dvKodListe: result} = this;
		if (result == null) { result = this._dvKodListe = Object.keys(this.dvKod2Rec ?? {}) }
		return result
	}
	get dovizKAListe() {
		let {_dovizKAListe: result} = this;
		if (result == null) {
			let recs = Object.values(this.dvKod2Rec ?? {});
			result = this._dovizKAListe = recs.map(rec => new CKodVeAdi(rec))
		}
		return result
	}
	async ilkIslemler(e) { await super.ilkIslemler(e); await this.dovizListeBelirle(e) }
	async dovizListeBelirle(e) {
		let dvKod2Rec = this.dvKod2Rec = {}, recs = await MQDoviz.loadServerData();
		for (let rec of recs) {
			let {kod, aciklama} = rec; rec.aciklama = aciklama || kod;
			dvKod2Rec[kod] = rec
		}
		return this
	}
}
class DRapor_AraSeviye_Main extends DAltRapor_TreeGridGruplu {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get mainmi() { return true }
	static get araSeviyemi() { return this == DRapor_AraSeviye_Main } get tazeleYapilirmi() { return true }
	static get secimWhereBaglanirmi() { return true } static get konsolideKullanilirmi() { return true }
	static get konsolideVarmi() { return this.konsolideKullanilirmi && app.params?.dRapor?.konsolideCikti } get konsolideVarmi() { return this.class.konsolideVarmi }
	static get finansalAnalizmi() { return this.donemselIslemlermi || this.eldekiVarliklarmi || this.nakitAkismi }
	static get donemselIslemlermi() { return false } static get eldekiVarliklarmi() { return false } static get nakitAkismi() { return false }
	get finansalAnalizmi() { return this.class.finansalAnalizmi } get donemselIslemlermi() { return this.class.donemselIslemlermi }
	get eldekiVarliklarmi() { return this.class.eldekiVarliklarmi } get nakitAkismi() { return this.class.nakitAkismi }
	get dvKod2Rec() { return this.rapor.dvKod2Rec } get dovizKAListe() { return this.rapor.dovizKAListe } get dvKodListe() { return this.rapor.dvKodListe }
	static get yatayTip2Bilgi() {
		let result = this._yatayTip2Bilgi; if (result == null) {
			result = this._yatayTip2Bilgi = {
				YA: { kod: 'YILAY', belirtec: 'yilay', text: 'Yıl/Ay' },
				AY: { kod: 'AYADI', belirtec: 'ayadi', text: 'Aylık' },
				HF: { kod: 'HAFTA', belirtec: 'haftano', text: 'Haftalık' },
				SG: { kod: 'SUBEGRUP', belirtec: 'subegrup', text: 'Şube Grup' },
				SB: { kod: 'SUBE', belirtec: 'sube', text: 'Şube' },
				DB: { kod: 'DB', belirtec: 'db', text: 'Veritabanı' },
				TR: { kod: 'TARIH', belirtec: 'tarih', text: 'Tarih' },
				VD: { kod: 'VADE', belirtec: 'vade', text: 'Vade' },
				SM: { kod: 'STOKMARKA', belirtec: 'stokmarka', text: 'Stok Marka' },
				AG: { kod: 'STANAGRP', belirtec: 'anagrup', text: 'Stok Ana Grup' },
				TG: { kod: 'STGRP', belirtec: 'grup', text: 'Stok Grup' },
				SI: { kod: 'STISTGRP', belirtec: 'sistgrup', text: 'Stok İst. Grup' },
				CT: { kod: 'CRTIP', belirtec: 'tip', text: 'Cari Tip' },
				UL: { kod: 'CRULKE', belirtec: 'ulke', text: 'Ülke' },
				IL: { kod: 'CRIL', belirtec: 'il', text: 'İl' },
				AB: { kod: 'CRANABOL', belirtec: 'anabolge', text: 'Ana Bölge' },
				BL: { kod: 'CRBOL', belirtec: 'bolge', text: 'Bölge' },
				CI: { kod: 'CISTGRP', belirtec: 'cistgrup', text: 'Cari İst. Grup' },
				PL: { kod: 'PLASIYER', belirtec: 'plasiyer', text: 'Plasiyer' },
				PR: { kod: 'PER', belirtec: 'per', text: 'Personel' },
				DG: { kod: 'DEPOGRUP', belirtec: 'yergrup', text: 'Yer Grup' },
				DP: { kod: 'DEPO', belirtec: 'yer', text: 'Yer' }
				/*HG: { kod: 'GRUP', belirtec: 'grup', text: 'Har. Ana Tip' }*/
			}
		}
		if (!this.konsolideVarmi) { result = { ...result }; delete result.DB }
		return result
	}
	static set yatayTip2Bilgi(value) { this._yatayTip2Bilgi = value }
	secimlerDuzenle(e) {
		super.secimlerDuzenle(e); let {secimler} = e, {grupVeToplam} = this.tabloYapi;
		if (this.konsolideVarmi) {
			let {session} = config, {dbName: buDBName} = session, {ekDBListe} = app.params?.dRapor ?? {};
			let tumDBNameSet = asSet([ buDBName, ...(ekDBListe ?? []) ]);
			let grupKod = 'DB'; secimler.grupEkle(grupKod, 'Veritabanı');
			let sec = new SecimBirKismi({ etiket: 'Veritabanı', grupKod }).birKismi().autoBind();
			app.wsDBListe()
				.then(arr => arr.filter(x => tumDBNameSet[x]).map(x => new CKodVeAdi([x, x])))
				.then(kaListe => sec.tekSecim = new TekSecim({ kaListe }));
			secimler.secimTopluEkle({ db: sec });
			// result.addGrupBasit('DB', 'Veritabanı', 'db')
		}
		let islemYap = (keys, callSelector, args) => {
			for (let key of keys) {
				let item = key ? grupVeToplam[key] : null; if (item == null) { continue }
				let proc = item[callSelector]; if (proc) { proc.call(item, args) }
			}
		};
		islemYap(Object.keys(grupVeToplam), 'secimlerDuzenle', e);
		secimler.whereBlockEkle(_e => {
			islemYap(Object.keys(grupVeToplam) || {}, 'tbWhereClauseDuzenle', { ...e, ..._e })
			/*islemYap(Object.keys(this.raporTanim?.attrSet || {}), 'tbWhereClauseDuzenle', { ...e, ..._e })*/
		})
	}
	tazele(e) {
		/*let {rfb_items} = this.rapor, {main} = rfb_items.id2Builder, {layout} = main, elmLabel = layout.children('label');
		let elmEkBilgi = elmLabel.children('.secimBilgi'); if (elmEkBilgi?.length) {
			let {secimler: sec} = this, ozetBilgiHTML = sec?.getGrupHeaderHTML();
			if (ozetBilgiHTML) { elmEkBilgi.html(ozetBilgiHTML) }
		}*/
		return super.tazele(e)
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
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e;
		if (this.konsolideVarmi) { result.addGrupBasit('DB', 'Veritabanı', 'db', null, null, null) }
		this.tabloYapiDuzenle_ozel?.(e)
	}
	tabloYapiDuzenle_son(e) {
		super.tabloYapiDuzenle_son(e); const {result} = e; this.tabloYapiDuzenle_son_ozel?.(e);
		result.addToplam(new TabloYapiItem().setKA('KAYITSAYISI', 'Kayıt Sayısı')
			 .addColDef(new GridKolon({ belirtec: 'kayitsayisi', text: 'Kayıt Sayısı', genislikCh: 10, filterType: 'numberinput', aggregates: ['sum'] }).tipNumerik()))
	}
	async loadServerDataInternal(e) {
		await super.loadServerDataInternal(e); let {raporTanim, secimler} = this, attrSet = e.attrSet ?? raporTanim.attrSet, {maxRow, donemBS} = e;
		let _e = { ...e, stm: new MQStm(), attrSet, donemBS, raporTanim, secimler, maxRow, donemBS };
		let recs = await this.loadServerData_ilk(_e); if (recs !== undefined) { return recs }
		if (this.loadServerData_queryDuzenle_tekil(_e) === false) { return null }
		if (this.loadServerData_queryDuzenle_tekilSonrasi(_e) === false) { return null }
		if (this.loadServerData_queryDuzenle_genelSon(_e) === false) { return null }
		let {stm: query} = _e;
		try {
			recs = e.recs = query ? await app.sqlExecSelect({ query, maxRow }) : null;
			let _recs = await this.loadServerData_son(e); if (_recs !== undefined) { recs = _recs }
			console.info({ sender: this, query, recs }, query?.getQueryYapi() ?? query.toString())
		}
		catch (ex) { console.warn({ sender: this, query, ex, errorText: getErrorText(ex) }, query?.getQueryYapi() ?? query.toString()); throw ex }
		return recs
	}
	super_loadServerDataInternal(e) { return super.loadServerDataInternal(e) }
	async loadServerData_ilk(e) {
		let {attrSet, yatayAnaliz} = e;
		if (yatayAnaliz && Object.keys(attrSet).length == 1 && attrSet.DB) {
			let {session} = config, {dbName: buDBName} = session, {ekDBListe} = app.params?.dRapor ?? {}, alias_db = 'db';
			let {secimler: sec} = this, {value: filtreDBListe} = sec.db, filtreDBSet = filtreDBListe?.length ? asSet(filtreDBListe) : null;
			let result = filtreDBListe?.length ? filtreDBListe : [buDBName, ...(ekDBListe ?? [])];
			let getDBText = db => db == buDBName ? `(<span class=forestgreen>${db}</span>)` : db;
			return result.map(db => ({ db: getDBText(db) }))
		}
	}
	loadServerData_son(e) { }
	gridVeriYuklendi({ rootPart }) {
		super.gridVeriYuklendi(...arguments);
		let {rfb_items} = this.rapor, {main} = rfb_items.id2Builder, {layout} = main, elmLabel = layout.children('label');
		let elmEkBilgi = elmLabel.children('.secimBilgi'); if (!elmEkBilgi?.length) { elmEkBilgi = $(`<div class="secimBilgi float-right"></div>`); elmEkBilgi.appendTo(elmLabel) }
		let {secimler} = this, _e = { liste: [] };
		for (let [key, sec] of Object.entries(secimler.liste)) {
			if (sec.isHidden || sec.isDisabled || key == 'tarihAralik') { continue }
			sec.ozetBilgiHTMLOlustur(_e)
		}
		let ozetBilgiHTML = _e.liste?.filter(x => !!x).join(' ');
		if (ozetBilgiHTML) { elmEkBilgi.html(ozetBilgiHTML) }
	}
	loadServerData_queryDuzenle_tekil(e) {
		e = e ?? {}; let {internal} = e;
		if (this.loadServerData_queryDuzenle(e) === false) { return false }
		if (!internal) { if (this.loadServerData_queryDuzenle_filtreBaglantiYap(e) === false) { return false } }
		if (this.loadServerData_queryDuzenle_son(e) === false) { return false }
	}
	loadServerData_queryDuzenle(e) {
		let alias = e.alias = e.alias ?? 'fis'; const {secimler, raporTanim, tabloYapi} = this, {yatayAnaliz} = raporTanim.kullanim, {stm} = e;
		let {attrSet: _attrSet} = e, attrSet = e.attrSet = raporTanim._ozelAttrSet = { ..._attrSet };
		for (const sent of stm) { sent.sahalar.add(`COUNT(*) kayitsayisi`) }
		if (secimler) {
			for (const [key, secim] of Object.entries(secimler.liste)) {
				if (secim.isHidden || secim.isDisabled) { continue } const kod = secim.userData?.kod; if (!kod) { continue }
				const uygunmu = typeof secim.value == 'object' ? !empty(secim.value) : !!secim.value;
				if (uygunmu) { attrSet[kod] = true }
			}
		}
		let {toplam} = tabloYapi; for (let key in attrSet) {
			const formul = toplam[key]?.formul; if (!formul) { continue }
			let {attrListe} = formul; if (attrListe?.length) { $.extend(attrSet, asSet(attrListe)) }
		}
		if (yatayAnaliz) { attrSet[DRapor_AraSeviye_Main.yatayTip2Bilgi[yatayAnaliz]?.kod] = true }
		this.loadServerData_queryDuzenle_ozel?.(e)
	}
	loadServerData_queryDuzenle_ek(e) { this.loadServerData_queryDuzenle_ek_ozel?.(e) }
	loadServerData_queryDuzenle_son(e) {
		let {internal, alias, stm, attrSet} = e; if (internal) { return }
		let {secimler, tabloYapi} = this, {totalmi} = this.class;
		this.loadServerData_queryDuzenle_son_ilk_ozel?.(e);
		if (alias) {
			let {dvKod2Rec: dvKodSet} = this, gecerliDvKodSet = {}, dvKodVarmi = false;
			for (let key in attrSet) {
				const dvKod = key.split('_').slice(-1)[0];
				if (dvKodSet[dvKod]) { gecerliDvKodSet[dvKod] = dvKodVarmi = true }
			}
			for (let sent of stm) {
				let {sahalar} = sent;
				for (let dvKod in gecerliDvKodSet) {
					let kurAlias = `kur${dvKod}`;
					sent.leftJoin(alias, `ORTAK..ydvkur ${kurAlias}`, [`${alias}.tarih = ${kurAlias}.tarih`, `${kurAlias}.kod = '${dvKod}'`])
				}
				sahalar.add(`${totalmi === false ? '1' : 'COUNT(*)'} kayitsayisi`)
			}
		}
		if (this.class.secimWhereBaglanirmi) {
			let tbWhere = secimler?.getTBWhereClause(e);
			for (let {where: wh, sahalar} of stm) { if (tbWhere?.liste?.length) { wh.birlestir(tbWhere) } }
			/*for (const sent of stm) { sent.gereksizTablolariSil({ disinda: [alias] }) }*/
		}
		this.loadServerData_queryDuzenle_son_son_ozel?.(e)
	}
	loadServerData_queryDuzenle_filtreBaglantiYap(e) {
		let {stm, attrSet: orjAttrSet} = e, {secimler, tabloYapi} = this;
		let internal = true, attrSet = { ...orjAttrSet };
		for (let [key, item] of Object.entries(tabloYapi.grup)) {
			let {kaYapimi} = item; if (!kaYapimi || item.secimKullanilmazFlag === false || item.formulmu) { continue }
			let sec_kod = secimler[key], sec_adi = secimler[`${key}Adi`], {mfSinif} = sec_kod ?? {};
			if (!mfSinif?.mqCogulmu || (sec_kod?.bosmu && sec_adi?.bosmu)) { continue }
			attrSet[key] = true
		}
		if (Object.keys(attrSet).length == Object.keys(orjAttrSet).length) { /* yeni birşey eklenmedi */ return }
		let _e = { ...e, stm: new MQStm(), attrSet, internal }; delete _e.sent; delete _e.uni;
		if (this.loadServerData_queryDuzenle_tekil(_e) === false) { return false }
		let {stm: _stm} = _e, _enm = _stm.getSentListe();    /* her iki stm içindeki sent sayısı aynı olmalıdır */
		for (let asilSent of stm) {
			let {done, value: sent} = _enm.next();
			asilSent.from.liste = [...sent.from.liste];
			if (done) { break }
		}
	}
	loadServerData_queryDuzenle_tekilSonrasi(e) {
		this.loadServerData_queryDuzenle_tekilSonrasi_ilk_ozel?.(e);
		let {stm, attrSet} = e, {with: _with} = stm, {konsolideVarmi, secimler: sec} = this;
		if (konsolideVarmi && !_with.toplamVarmi) {
			let {session} = config, {dbName: buDBName} = session, {ekDBListe} = app.params?.dRapor ?? {}, alias_db = 'db';
			let {value: filtreDBListe} = sec.db, filtreDBSet = filtreDBListe?.length ? asSet(filtreDBListe) : null;
			if (filtreDBListe?.length) {
				ekDBListe = filtreDBListe.filter(name => name != buDBName)
				/* if (!filtreDBSet[buDBName]) { filtreDBSet[buDBName] = true } */
			}
			let asilUniDuzenlendimi = false, asilUni = stm.sent = stm.sent.asUnionAll();
			if (!filtreDBSet || filtreDBSet[buDBName]) {
				if (!asilUni.liste.length) { asilUni.add(new MQSent()) }
				for (let {sahalar} of asilUni) {
					if (attrSet.DB && !sahalar.liste.find(saha => saha.alias == alias_db)) {
						sahalar.add(`${`(<span class=forestgreen>${buDBName}</span>)`.sqlServerDegeri() ?? '- Aktif VT -'} ${alias_db}`) }
				}
				asilUniDuzenlendimi = true
			}
			if (ekDBListe?.length && asilUni.liste.length) {
				let ekSentListe = []; for (let db of ekDBListe) {
					if (filtreDBSet && !filtreDBSet[db]) { continue }
					let {liste} = asilUni.deepCopy(); for (let sent of liste) {
						let {from, sahalar} = sent; for (let item of from.liste) {
							let {deger} = item, hasDB = deger.includes('.');
							if (!hasDB) { item.deger = deger = `${db}..${deger}` }
						}
						{
							let saha = sahalar.liste.find(x => x.alias == alias_db);
							if (attrSet.DB && !sahalar.liste.find(saha => saha.alias == alias_db)) {
								sahalar.add(`'NULL' ${alias_db}`);
								saha = sahalar.liste.find(x => x.alias == alias_db);
							}
							if (saha) { saha.deger = db.sqlServerDegeri() }
						}
					}
					ekSentListe.push(...liste)
				}
				if (!asilUniDuzenlendimi) { asilUni.liste = [] }
				if (ekSentListe.length) { asilUni.addAll(ekSentListe) }
			}
		}
		this.loadServerData_queryDuzenle_tekilSonrasi_son_ozel?.(e)
	}
	loadServerData_queryDuzenle_genelSon(e) {
		this.loadServerData_queryDuzenle_genelSon_ilk_ozel?.(e);
		let {stm, attrSet} = e, {grup} = this.tabloYapi;
		for (let sent of stm) { sent.groupByOlustur() }
		if (stm.sent.unionmu) { stm = e.stm = stm.asToplamStm() }
		/* stm.sent => bu noktada #asToplamStm sonucudur */
		for (let sent of stm) { sent.havingOlustur() }
		let {orderBy} = stm; for (let kod in attrSet) {
			let {orderBySaha} = grup[kod] ?? {};
			if (orderBySaha) { orderBy.add(orderBySaha) }
		}
		this.loadServerData_queryDuzenle_genelSon_son_ozel?.(e)
	}
	async loadServerData_recsDuzenle({ attrSet, recs }) {
		attrSet = attrSet ?? this.raporTanim.attrSet;
		if (attrSet.STOKRESIM) {
			for (let rec of recs) {
				let {resimid: id} = rec; if (!id) { continue }
				let url = app.getWSUrl({ session: false, api: 'stokResim', args: { id } });
				rec.stokresim = `<img class="full-wh" src="${url}"/>`
			}
		}
		return await super.loadServerData_recsDuzenle({ ...arguments })
	}
	loadServerData_recsDuzenleSon(e) {
		return super.loadServerData_recsDuzenleSon(e) /* const {attrSet} = this.raporTanim, {toplam} = this.tabloYapi, avgBelirtec2ColDef = {};
		for (let key in attrSet) {
			if (!toplam[key]) { continue } let avgColDefs = toplam[key]?.colDefs?.filter(colDef => colDef?.aggregates?.includes('avg')); if (!avgColDefs?.length) { continue }
			for (const colDef of avgColDefs) { avgBelirtec2ColDef[colDef.belirtec] = colDef }
		}
		let {recs} = e; if (!empty(avgBelirtec2ColDef)) {
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
	async raporTanim_tamamSonrasiIslemler({ raporTanim, raporTanim: { icerik } }) {
		await super.raporTanim_tamamSonrasiIslemler(...arguments)
		let PrefixMiktar = 'MIKTAR', miktarSet = {}, brmsizMiktarSet = {}
		for (let key in icerik) {
			if (key.startsWith(PrefixMiktar) || key.slice(2).startsWith(PrefixMiktar)) {
				miktarSet[key] = true
				let postfix = key.slice(key.indexOf(PrefixMiktar) + PrefixMiktar.length).trim()
				if (!postfix) { brmsizMiktarSet[key] = true }
			}
		}
		if (!(empty(brmsizMiktarSet) || icerik.BRM)) {
			icerik.BRM = true
			notify('Rapor Tanımı', `<b class=royalblue>MİKTAR</b> sahası nedeniyle <b class=firebrick>BRM</b> kolonu tanıma otomatik eklendi`, 'warning')
		}
	}
	
	donemBagla({ donemBS, tarihSaha, sent }) {
		if (donemBS) {
			let {where: wh} = sent, {basi, sonu} = donemBS;
			wh.basiSonu(donemBS, tarihSaha)
		}
		return this
	}
	tabloYapiDuzenle_gc(e) { return this.tabloYapiDuzenle_gcX({ ...e, gcTip: 'GC' }) }
	loadServerData_queryDuzenle_gc(e) { return this.loadServerData_queryDuzenle_gcX({ ...e, gcTip: 'GC' }) }
	tabloYapiDuzenle_ba(e) { return this.tabloYapiDuzenle_gcX({ ...e, gcTip: 'BA' }) }
	loadServerData_queryDuzenle_ba(e) { return this.loadServerData_queryDuzenle_gcX({ ...e, gcTip: 'BA' }) }
	tabloYapiDuzenle_gcX({ result, tip, etiket, gcTip, gcEtiketPrefixes, addSelf }) {
		addSelf = addSelf ?? false; gcTip = gcTip || 'GC';
		let {grup, toplam} = result;
		let belirtec = tip.toLowerCase(), gcBelirtec = gcTip.toLowerCase();
		etiket = etiket ?? tip; gcEtiketPrefixes = gcEtiketPrefixes || [gcTip[0], gcTip[1]];
		if (!grup[gcTip]) {
			result.addGrupBasit(gcTip, `${gcTip[0]}/${gcTip[1]}`, gcBelirtec, null, 60, ({ colDef }) =>
				colDef.alignCenter())
		}
		if (!toplam[tip]) {
			result.addToplamBasit(tip, etiket, belirtec, null, null, ({ item }) =>
				{ if (!addSelf) { item.hidden() } })
		}
		if (this.class.envantermi && !toplam[`DEVIR_${tip}`]) { result.addToplamBasit(`DEVIR_${tip}`, `D.${etiket}`, `devir${belirtec}`) }
		if (!toplam[`GIRIS_${tip}`]) { result.addToplamBasit(`GIRIS_${tip}`, `${gcEtiketPrefixes[0]}.${etiket}`, `giris${belirtec}`) }
		if (!toplam[`CIKIS_${tip}`]) { result.addToplamBasit(`CIKIS_${tip}`, `${gcEtiketPrefixes[1]}.${etiket}`, `cikis${belirtec}`) }
		if (!toplam[`KALAN_${tip}`]) { result.addToplamBasit(`KALAN_${tip}`, `K.${etiket}`, `kalan${belirtec}`) }
		/*if (!toplam[`GIRIS_${tip}`]) {
			result.addToplamBasit(`GIRIS_${tip}`, `${gcEtiketPrefixes[0]}.${etiket}`, `giris${belirtec}`, null, null, ({ item }) =>
				item.setFormul([tip, gcTip], ({ rec }) => rec[gcBelirtec] == 'G' || rec[gcBelirtec] == 'B' ? (rec[belirtec] || 0) : 0))
		}
		if (!toplam[`CIKIS_${tip}`]) {
			result.addToplamBasit(`CIKIS_${tip}`, `${gcEtiketPrefixes[1]}.${etiket}`, `cikis${belirtec}`, null, null, ({ item }) =>
				item.setFormul([tip, gcTip], ({ rec }) => rec[gcBelirtec] == 'C' || rec[gcBelirtec] == 'A' ? 0 - (rec[belirtec] || 0) : 0))
		}
		if (!toplam[`KALAN_${tip}`]) {
			result.addToplamBasit(`KALAN_${tip}`, `K.${etiket}`, `kalan${belirtec}`, null, null, ({ item }) =>
				item.setFormul([tip, gcTip, `GIRIS_${tip}`, `CIKIS_${tip}`], ({ rec }) => {
					let v = {
						devir: (rec[`devir${belirtec}`] || 0),
						giris: rec[gcBelirtec] == 'G' || rec[gcBelirtec] == 'B' ? (rec[belirtec] || 0) : 0,
						cikis: rec[gcBelirtec] == 'C' || rec[gcBelirtec] == 'A' ? 0 - (rec[belirtec] || 0) : 0
					};
					return v.devir + v.giris - v.cikis
				})
			)
		}*/
		return this
	}
	loadServerData_queryDuzenle_gcX({ stm, sent, attrSet, tip, asilClause, clause, kodClause, gcTip, gcClause, donemBS, tarihBS, tarihClause, sumFlag }) {
		sent = sent ?? stm.sent; let {where: wh, sahalar} = sent, {sqlNull} = Hareketci_UniBilgi.ortakArgs;
		donemBS ??= tarihBS ?? this.donemBS; asilClause ??= clause ?? kodClause;
		sumFlag = sumFlag ?? !this.hareketmi; let belirtec = tip.toLowerCase(), gcBelirtec = gcTip.toLowerCase();
		/*let dgckPrefixes = ['DEVIR_', 'GIRIS_', 'CIKIS_', 'KALAN_'];
		let dgckVarmi = false; for (let key in attrSet) {
			for (let prefix of dgckPrefixes) { if (key == prefix + tip) { dgckVarmi = true; break } }
		}
		if (dgckVarmi) {
			let tipListe = [gcTip, tip], entries = tipListe.map(tip => [tip, true]);
			$.extend(attrSet, Object.fromEntries(entries))
		}*/
		let getTarihWh = (kontrol, bs, zorunlumu) => {
			let wh = new MQSubWhereClause();
			if (getFuncValue.call(this, kontrol, bs)) { wh.basiSonu(bs, tarihClause) }
			else { wh.add(`1 = ${zorunlumu ? '2' : '1'}`) }
			return wh
		}
		let sumDuzenlenmis = _clause => sumFlag == null ? _clause : sumFlag ? _clause.asSumDeger() : _clause.sumOlmaksizin();
		asilClause = sumDuzenlenmis(asilClause);    /* asilClause: miktar, maliyet, bedel, ... */
		let tarihClauses = {
			devir: getTarihWh(donemBS?.basi, { sonu: donemBS?.basi?.clone()?.addDays(-1) }, true),
			cari: getTarihWh(donemBS?.bosDegilmi, donemBS, false),
			kalan: getTarihWh(donemBS?.bosDegilmi, { sonu: donemBS?.sonu }, false)
		};
		let gcClauses = {
			devir: sumDuzenlenmis(`(case when ${tarihClauses.devir} then ${clause.sumOlmaksizin()} else 0 end)`),
			giris: sumDuzenlenmis(`(case when ${tarihClauses.cari} and ${gcClause} = '${gcTip[0]}' then ${clause.sumOlmaksizin()} else 0 end)`),
			cikis: sumDuzenlenmis(`(case when ${tarihClauses.cari} and ${gcClause} = '${gcTip[1]}' then ${clause.sumOlmaksizin()} else 0 end)`),
			kalan: sumDuzenlenmis(`(${asilClause.sumOlmaksizin()} * (case when ${tarihClauses.kalan.degerAta(gcTip[0], gcClause)} then 1 else -1 end))`)
		}
		for (let key in attrSet) {
			if (key == gcTip) { sahalar.add(`${gcClause} ${gcBelirtec}`) }
			else if (key == tip) { sahalar.add(`${asilClause} ${belirtec}`) }
			else if (tarihClause && key == `DEVIR_${tip}`) { sahalar.add(`${gcClauses.devir} devir${belirtec}`) }
			else if (key == `GIRIS_${tip}`) { sahalar.add(`${gcClauses.giris} giris${belirtec}`) }
			else if (key == `CIKIS_${tip}`) { sahalar.add(`${gcClauses.cikis} cikis${belirtec}`) }
			else if (key == `KALAN_${tip}`) { sahalar.add(`${gcClauses.kalan} kalan${belirtec}`) }
		}
		return this
	}
	tabloYapiDuzenle_hmr({ result }) {
		for (let {belirtec, etiket: text, numerikmi, kami: _kami, mfSinif} of HMRBilgi.hmrIter()) {
			let tip = belirtec.toUpperCase(), kami = _kami && !!mfSinif, genislikCh = 15;
			if (kami) { result.addKAPrefix(belirtec) }
			result.addGrup(new TabloYapiItem().setKA(tip, text).secimKullanilir().setMFSinif(mfSinif).addColDef(
				numerikmi
					? new GridKolon({ belirtec, text, genislikCh, filterType: 'numberinput' }).tipNumerik()
					: new GridKolon({ belirtec, text, genislikCh, filterType: 'input' }))
			)
		}
		return this
	}
	loadServerData_queryDuzenle_hmr(e) {
		let {stm, attrSet} = e, alias = e.alias == 'fis' ? 'har' : e.alias, aliasVeNokta = alias ? `${alias}.` : '';
		for (let sent of stm) {
			const {where: wh, sahalar} = sent; for (const {belirtec, rowAttr, kami, mfSinif} of HMRBilgi.hmrIter()) {
				const tip = belirtec.toUpperCase(); if (!attrSet[tip]) { continue }
				const hmrTable = kami && kami ? mfSinif?.table : null;
				if (hmrTable) {
					let {tableAlias: hmrTableAlias, idSaha, adiSaha} = mfSinif;
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
	tabloYapiDuzenle_ozelIsaret({ result }) {
		let tekSecimSinif = NormalFiili;
		result.addGrupBasit('ISARET', 'İşaret', 'ozelisaret', tekSecimSinif, null, ({ item }) => {
			item
				.setOrderBy('ozelisaret').ozelWhereClause()
				.setSecimlerDuzenleyici(({ secimler, kod, item }) => {
					let {grupListe, liste} = secimler;
					let grupKod = kod; grupListe[grupKod].kapalimi = false;
					let sec = liste[kod] = new SecimTekSecim({ etiket: 'İşaret', tekSecimSinif, grupKod }).autoBind()
				}).setTBWhereClauseDuzenleyici(({ kod, secimler, where: wh, kodClause }) => {
					let sec = secimler.liste[kod], {tekSecim: tSec} = sec;
					if (!kodClause) { kodClause = item.colDefs[0].belirtec }
					let values = tSec.fiilimi ? ['', '*'] : ['', 'X'];
					if (values?.length) { wh.inDizi(values, kodClause) }
				})
		});
		return this
	}
	loadServerData_queryDuzenle_ozelIsaret({ stm, sent, attrSet, kodClause }) {
		if (!kodClause) { return this }
		sent = sent ?? stm.sent; let {where: wh, sahalar} = sent;
		for (let key in attrSet) {
			switch (key) { case 'ISARET': sahalar.add(kodClause); break }
		}
		return this
	}
	tabloYapiDuzenle_sube({ result }) {
		result.addKAPrefix('sube', 'subegrup')
			.addGrupBasit('SUBE', 'Şube', 'sube', DMQSube)
			.addGrupBasit('SUBEGRUP', 'Şube Grup', 'subegrup', DMQSubeGrup);
		return this
	}
	loadServerData_queryDuzenle_sube({ stm, sent, attrSet, kodClause }) {
		if (!kodClause) { return this }
		sent = sent ?? stm.sent; let {where: wh, sahalar} = sent;
		if (attrSet.SUBE || attrSet.SUBEGRUP) { sent.fromIliski('isyeri sub', `${kodClause} = sub.kod`) }
		if (attrSet.SUBEGRUP) { sent.sube2GrupBagla() }
		for (let key in attrSet) {
			switch (key) {
				case 'SUBE': sahalar.add(`${kodClause} subekod`, 'sub.aciklama subeadi'); wh.icerikKisitDuzenle_sube({ ...arguments[0], saha: kodClause }); break
				case 'SUBEGRUP': sahalar.add('sub.isygrupkod subegrupkod', 'igrp.aciklama subegrupadi'); wh.icerikKisitDuzenle_subeGrup({ ...arguments[0], saha: 'sub.isygrupkod' }); break
			}
		}
		return this
	}
	tabloYapiDuzenle_cari({ result }) {
		result.addKAPrefix('tip', 'bolge', 'cistgrup', 'cari', 'il', 'ulke')
			.addGrupBasit('CRTIP', 'Cari Tip', 'tip', DMQCariTip)
			.addGrupBasit('CRANABOL', 'Ana Bölge', 'anabolge', DMQCariAnaBolge).addGrupBasit('CRBOL', 'Bölge', 'bolge', DMQCariBolge)
			.addGrupBasit('CRISTGRP', 'Cari İst. Grup', 'cistgrup', DMQCariIstGrup).addGrupBasit('CARI', 'Cari', 'cari', DMQCari)
			.addGrupBasit('CRIL', 'Cari İl', 'il', DMQIl).addGrupBasit('CRULKE', 'Ülke', 'ulke', DMQUlke);
		return this
	}
	loadServerData_queryDuzenle_cari(e) {
		let {stm, attrSet, kodClause} = e; if (!kodClause) { return this }
		let sent = e.sent ?? stm.sent, {where: wh, sahalar} = sent;
		if (attrSet.CRTIP || attrSet.CRBOL || attrSet.CRANABOL || attrSet.CARI ||
				attrSet.CRIL || attrSet.CRULKE || attrSet.CRISTGRP) { sent.fromIliski('carmst car', `${kodClause} = car.must`) }
		if (attrSet.CRANABOL) { sent.cari2BolgeBagla() }
		for (let key in attrSet) {
			switch (key) {
				case 'CRTIP': sent.cari2TipBagla(); sent.sahalar.add('car.tipkod', 'ctip.aciklama tipadi'); wh.icerikKisitDuzenle_cariTip({ ...e, saha: 'car.tipkod' }); break
				case 'CRANABOL': sent.bolge2AnaBolgeBagla(); sent.sahalar.add('bol.anabolgekod', 'abol.aciklama anabolgeadi'); wh.icerikKisitDuzenle_cariAnaBolge({ ...e, saha: 'bol.anabolgekod' }); break
				case 'CRBOL': sent.cari2BolgeBagla(); sent.sahalar.add('car.bolgekod', 'bol.aciklama bolgeadi'); wh.icerikKisitDuzenle_cariBolge({ ...e, saha: 'car.bolgekod' }); break
				case 'CRISTGRP': sent.cari2IstGrupBagla(); sent.sahalar.add('car.cistgrupkod', 'cigrp.aciklama cistgrupadi'); wh.icerikKisitDuzenle_cariIstGrup({ ...e, saha: 'car.cistgrupkod' }); break
				case 'CARI': sent.sahalar.add(`${kodClause} carikod`, 'car.birunvan cariadi'); wh.icerikKisitDuzenle_cari({ ...e, saha: kodClause }); break
				case 'CRIL': sent.cari2IlBagla(); sent.sahalar.add('car.ilkod', 'il.aciklama iladi'); wh.icerikKisitDuzenle_cariIl({ ...e, saha: 'car.ilkod' }); break
				case 'CRULKE': sent.cari2UlkeBagla(); sent.sahalar.add('car.ulkekod', 'ulk.aciklama ulkeadi'); wh.icerikKisitDuzenle_cariUlke({ ...e, saha: 'car.ulkekod' }); break
			}
		}
		return this
	}
	tabloYapiDuzenle_plasiyer({ result }) {
		result.addKAPrefix('plasiyer').addGrupBasit('PLASIYER', 'Plasiyer', 'plasiyer', DMQPlasiyer);
		return this
	}
	loadServerData_queryDuzenle_plasiyer({ stm, sent, attrSet, kodClause }) {
		if (!kodClause) { return this } sent = sent ?? stm.sent; let {where: wh, sahalar} = sent;
		if (attrSet.PLASIYER) { sent.fromIliski('carmst pls', `${kodClause} = pls.must`) }
		for (let key in attrSet) {
			switch (key) {
				case 'PLASIYER':
					sahalar.add(`${kodClause} plasiyerkod`, 'pls.birunvan plasiyeradi'); wh.icerikKisitDuzenle_plasiyer({ ...arguments[0], saha: kodClause });
					break
			}
		}
		return this
	}
	tabloYapiDuzenle_yer({ result }) {
		result.addKAPrefix('yer', 'yergrup')
			.addGrupBasit('DEPO', 'Depo', 'yer', DMQYer)
			.addGrupBasit('DEPOGRUP', 'Depo Grup', 'yergrup', DMQYerGrup);
		return this
	}
	loadServerData_queryDuzenle_yer({ stm, sent, attrSet, kodClause }) {
		if (!kodClause) { return this }
		sent = sent ?? stm.sent; let {where: wh, sahalar} = sent;
		if (attrSet.DEPOGRUP || attrSet.DEPO) { sent.x2YerBagla({ kodClause }) }
		if (attrSet.DEPOGRUP) { sent.yer2GrupBagla() }
		for (let key in attrSet) {
			switch (key) {
				case 'DEPO': sahalar.add(`${kodClause} yerkod`, 'yer.aciklama yeradi'); wh.icerikKisitDuzenle_yer({ ...arguments[0], saha: kodClause }); break
				case 'DEPOGRUP': sahalar.add('yer.yergrupkod yergrupkod', 'ygrp.aciklama yergrupadi'); wh.icerikKisitDuzenle_yerGrup({ ...arguments[0], saha: 'yer.yergrupkod' }); break
			}
		}
		return this
	}
	tabloYapiDuzenle_stok({ result }) {
		result.addKAPrefix('anagrup', 'grup', 'sistgrup', 'stok', 'stokmarka')
			.addGrupBasit('STANAGRP', 'Stok Ana Grup', 'anagrup', DMQStokAnaGrup)
			.addGrupBasit('STGRP', 'Stok Grup', 'grup', DMQStokGrup)
			.addGrupBasit('STISTGRP', 'Stok İst. Grup', 'sistgrup', DMQStokIstGrup)
			.addGrupBasit('STOK', 'Stok', 'stok', DMQStok)
			.addGrupBasit('STOKMARKA', 'Stok Marka', 'stokmarka', DMQStokMarka)
			.addGrupBasit('BRM', 'Brm', 'brm', null, 60, ({ colDef }) => colDef.alignCenter())
			.addGrupBasit('BRM2', 'Br2', 'brm2', null, 60, ({ colDef }) => colDef.alignCenter())
			.addGrupBasit('BRMORANI', 'Brm Oranı', 'brmorani', null, 100, ({ colDef }) => colDef.tipDecimal())
			.addGrupBasit('STOKRESIM', 'Stok Resim', 'stokresim')
		return this
	}
	loadServerData_queryDuzenle_stok({ stm, sent, attrSet, kodClause }) {
		if (!kodClause) { return this }
		sent = sent ?? stm.sent; let {where: wh, sahalar} = sent;
		if (attrSet.STANAGRP || attrSet.STGRP || attrSet.STISTGRP || attrSet.STOK || attrSet.STOKMARKA || attrSet.STOKRESIM) { sent.x2StokBagla({ kodClause }) }
		if (attrSet.STANAGRP) { sent.stok2GrupBagla() } if (attrSet.STOKMARKA) { sent.stok2MarkaBagla() }
		for (let key in attrSet) {
			switch (key) {
				case 'STOK': sahalar.add(`${kodClause} stokkod`, 'stk.aciklama stokadi'); wh.icerikKisitDuzenle_stok({ ...arguments[0], saha: kodClause }); break
				case 'STANAGRP': sent.stokGrup2AnaGrupBagla(); sahalar.add('grp.anagrupkod', 'agrp.aciklama anagrupadi'); wh.icerikKisitDuzenle_stokAnaGrup({ ...arguments[0], saha: 'grp.anagrupkod' }); break
				case 'STGRP': sent.stok2GrupBagla(); sahalar.add('stk.grupkod', 'grp.aciklama grupadi'); wh.icerikKisitDuzenle_stokGrup({ ...arguments[0], saha: 'stk.grupkod' }); break
				case 'STISTGRP': sent.stok2IstGrupBagla(); sahalar.add('stk.sistgrupkod', 'sigrp.aciklama sistgrupadi'); wh.icerikKisitDuzenle_stokIstGrup({ ...arguments[0], saha: 'grp.sistgrupkod' }); break
				case 'STOKMARKA': sahalar.add('stk.smarkakod stokmarkakod', 'smar.aciklama stokmarkaadi'); break;
				case 'BRM': sahalar.add('stk.brm'); break
				case 'BRM2': sahalar.add('stk.brm2'); break
				case 'STOKRESIM': sahalar.add(`${kodClause} resimid`, 'NULL stokresim'); break
			}
		}
		return this
	}
	tabloYapiDuzenle_hizmet({ result }) {
		result.addKAPrefix('hizmet')
			.addGrupBasit('HIZMET', 'Hizmet', 'hizmet', DMQHizmet)
			.addGrupBasit('HIZMETTIP', 'Hizmet Tipi', 'hizmettiptext');
		return this
	}
	loadServerData_queryDuzenle_hizmet({ stm, sent, attrSet, kodClause }) {
		if (!kodClause) { return this } sent = sent ?? stm.sent; let {where: wh, sahalar} = sent;
		if (attrSet.HIZMET || attrSet.HIZMETTIP) { sent.x2HizmetBagla({ kodClause }) }
		for (let key in attrSet) {
			switch (key) {
				case 'HIZMET':
					sahalar.add(`${kodClause} hizmetkod`, 'hiz.aciklama hizmetadi'); wh.icerikKisitDuzenle_hizmet({ ...arguments[0], saha: kodClause });
					break
				case 'HIZMETTIP': sahalar.add(`${HizmetTipi.getClause('hiz.tip')} hizmettiptext`); break
			}
		}
		return this
	}
	tabloYapiDuzenle_takip({ result }) {
		result.addKAPrefix('takip', 'takipgrup')
			.addGrupBasit('TAKIPNO', 'Takip No', 'takip', DMQTakipNo)
			.addGrupBasit('TAKIPGRUP', 'Takip Grup', 'takipgrup', DMQTakipGrup);
		return this
	}
	loadServerData_queryDuzenle_takip({ stm, sent, attrSet, kodClause }) {
		if (!kodClause) { return this } sent = sent ?? stm.sent; let {where: wh, sahalar} = sent;
		if (attrSet.TAKIPNO || attrSet.TAKIPGRUP) { sent.fromIliski('takipmst tak', `${kodClause} = tak.kod`) }
		if (attrSet.TAKIPGRUP) { sent.fromIliski('takipgrup tgrp', 'tak.grupkod = tgrp.kod') }
		for (let key in attrSet) {
			switch (key) {
				case 'TAKIPNO': sahalar.add(`${kodClause} takipkod`, 'tak.aciklama takipadi'); wh.icerikKisitDuzenle_takipNo({ ...arguments[0], saha: kodClause }); break
				case 'TAKIPGRUP': sahalar.add('tgrp.kod takipgrupkod', 'tgrp.aciklama takipgrupadi'); break
			}
		}
		return this
	}
	tabloYapiDuzenle_odemeGun({ result }) {
		result.addGrupBasit('ODEMEGUN', 'Ödeme Gün', 'odgunkod');
		return this
	}
	loadServerData_queryDuzenle_odemeGun({ stm, sent, attrSet, kodClause }) {
		if (!kodClause) { return this } sent = sent ?? stm.sent; let {where: wh, sahalar} = sent;
		for (let key in attrSet) {
			switch (key) {case 'ODEMEGUN': sahalar.add(`${kodClause} odgunkod`); break }
		}
		return this
	}
	tabloYapiDuzenle_baBedel({ result }) {
		result
			.addToplamBasit_bedel('BORCBEDEL', 'Borç Bedel', 'borcbedel')
			.addToplamBasit_bedel('ALACAKBEDEL', 'Alacak Bedel', 'alacakbedel')
			.addToplamBasit_bedel('ISARETLIBEDEL', 'B-A Bakiye', 'isaretlibedel');
		return this
	}
	loadServerData_queryDuzenle_baBedel({ stm, sent, attrSet, baClause, bedelClause }) {
		if (!(baClause || bedelClause)) { return this }
		sent = sent ?? stm.sent; let {where: wh, sahalar} = sent;
		for (let key in attrSet) {
			switch (key) {
				case 'BORCBEDEL': sahalar.add(`SUM(case when ${baClause} = 'B' then ${bedelClause} else 0 end) borcbedel`); break
				case 'ALACAKBEDEL': sahalar.add(`SUM(case when ${baClause} = 'B' then 0 else ${bedelClause} end) alacakbedel`); break
				case 'ISARETLIBEDEL': sahalar.add(`SUM(case when ${baClause} = 'B' then ${bedelClause} else (0 - ${bedelClause}) end) isaretlibedel`); break
			}
		}
		return this
	}
	getBrmliMiktarClause(e) {
		e = e ?? {}; let brmTip = (e.brmTip ?? e.tip)?.toUpperCase();
		let {tip2BrmListe} = MQStokGenelParam, brmListe = tip2BrmListe?.[brmTip]; if (!brmListe?.length) { return '0' }
		let {mstAlias, harAlias, miktarPrefix, getMiktarClause} = e; mstAlias = mstAlias ?? 'stk'; harAlias = harAlias ?? 'har'; miktarPrefix = miktarPrefix ?? '';
		getMiktarClause = getMiktarClause ?? (miktarClause => miktarClause);
		const mstAliasVeNokta = mstAlias ? `${mstAlias}.` : '', harAliasVeNokta = harAlias ? `${harAlias}.` : '';
		const getWhereClause = brmSaha => new MQSubWhereClause({ inDizi: brmListe ?? [], saha: `${mstAliasVeNokta}brm` }).toString();
		return `SUM(case when ${getWhereClause('brm')} then ${getMiktarClause(`${harAliasVeNokta}${miktarPrefix}miktar`)}` +
						` when ${getWhereClause('brm2')} then ${getMiktarClause(`${harAliasVeNokta}${miktarPrefix}miktar2`)}` +
						` else 0 end)`
	}
	getDovizmi(e) {
		let dvKod = typeof e == 'object' ? e.dvKod ?? e.dvkod : e;
		switch (dvKod ?? '') {
			case '': case 'TL':
			case 'TRY': case 'TRL':
				return false
		}
		return true
	}
	getDvBosmuClause(e) {
		let dvKodClause = typeof e == 'object' ? e.dvKodClause : e;
		if ((dvKodClause || `''`) == `''`) { return '1 = 1' }
		return `COALESCE(${dvKodClause}, '') IN ('', 'TL', 'TRY', 'TRL')`
	}
	getRevizeDvKodClause(e) {
		let dvKodClause = typeof e == 'object' ? e.dvKodClause : e;
		if ((dvKodClause || `''`) == `''`) { return dvKodClause }
		let dvBosmuClause = this.getDvBosmuClause(dvKodClause);
		return `(case when ${dvBosmuClause} then '' else ${dvKodClause} end)`
	}
	getDovizliBedelClause(e, _tlBedelClause, _dvBedelClause, _sumOlmaksizinmi) {
		let objmi = typeof e == 'object', sumOlmaksizinmi = objmi ? e.sumOlmaksizin ?? e.sumOlmaksizinmi : _sumOlmaksizinmi;
		let dvKodClause = objmi ? e.dvKodClause : e, dvBosmuClause = this.getDvBosmuClause(dvKodClause);
		let tlBedelClause = objmi ? e.tlBedelClause ?? e.bedelClause : _tlBedelClause;
		let dvBedelClause = objmi ? e.dvBedelClause : _dvBedelClause;
		if (sumOlmaksizinmi) { tlBedelClause = tlBedelClause?.sumOlmaksizin(); dvBedelClause = dvBedelClause?.sumOlmaksizin() }
		if ((dvKodClause || `''`) == `''`) { return tlBedelClause }
		return `(case when ${dvBosmuClause} then ${tlBedelClause} else ${dvBedelClause} end)`;
	}
}
