class MQKod extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kami() { return true }
	static get kodSaha() { return 'kod' } static get tanimUISinif() { return ModelTanimPart }
	static get kodKullanilirmi() { return true } static get bosKodAlinirmi() { return false }
	static get zeminRenkDesteklermi() { return false } static get kodEtiket() { this.kodKullanilirmi ? super.kodEtiket : 'ID' }
	get kodUyarlanmis() { return this.kod }

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); let {pTanim} = e;
		$.extend(pTanim, { kod: new PInstStr(this.kodSaha) });
		if (this.zeminRenkDesteklermi) { pTanim.zeminRenk = new PInstStr() }
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); let {rec, result} = e;
		if (rec.silindi) { result.push('bg-lightgray', 'iptal') }
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); let {secimler: sec} = e;
		sec.secimEkle('instKod', new SecimString({ mfSinif: this, hidden: !this.kodKullanilirmi }));
		sec.whereBlockEkle(e => {
			let {aliasVeNokta, kodSaha} = this, {where: wh, secimler: sec} = e;
			wh.basiSonu(sec.instKod, `${aliasVeNokta}${kodSaha}`)
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); let {kodKullanilirmi, adiKullanilirmi} = this;
		if (kodKullanilirmi || adiKullanilirmi) {
			let {tanimFormBuilder: tanimForm} = e;
			if (tanimForm) { tanimForm.add(this.getFormBuilders_ka(e)) }
		}
	}
	static getFormBuilders_ka(e) { let _e = $.extend(e, { liste: [] }); this.formBuildersDuzenle_ka(_e); return e.liste }
	static formBuildersDuzenle_ka(e) {
		let {liste} = e, mfSinif = e.mfSinif ?? this, xEtiket =  mfSinif.kodEtiket ?? 'Kod';
		let kaForm = e.kaForm = new FBuilderWithInitLayout({ id: 'kaForm' }).yanYana(1.2);
		kaForm.addStyle(e => `$elementCSS { margin-top: -40px; z-index: 1100 }`); liste.push(kaForm);
		kaForm.addTextInput({ id: 'kod', etiket: xEtiket, placeholder: xEtiket })
			.addCSS('kodParent parent') .addStyle(e => `$elementCSS { min-width: 150px; max-width: 300px }`)
			.setVisibleKosulu(mfSinif.kodKullanilirmi ? true : 'jqx-hidden').onAfterRun(e => {
				let {input, rootPart, altInst} = e.builder, {yenimi, degistirmi} = rootPart;
				if (yenimi) { input.val('') } else if (degistirmi) { input.attr('readonly', ''); input.addClass('readOnly') }
			});
		if (mfSinif.zeminRenkDesteklermi) {
			kaForm.addColorInput({ id: 'zeminRenk', etiket: '' }).etiketGosterim_placeholder()
				.addStyle(
					e => `$elementCSS { min-width: 50px !important; width: 50px !important; height: 35px; margin: -5px 0 0 -10px !important; padding: 5px !important }`,
					e => {
						let {zeminRenk} = e.builder.altInst;
						let renk = zeminRenk ? getContrastedColor(zeminRenk) : null; if (zeminRenk & zeminRenk.length == 7 && zeminRenk != '#000000') { zeminRenk += '80' }
						return `$elementCSS > input { width: var(--full) !important /*color: ${renk || 'inherit'}; background: ${zeminRenk || 'inherit'}*/ }`
					}
				)
		}
	}
	static standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e); let {liste} = e; if (this.kodKullanilirmi) { liste.push(this.kodSaha) } }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); let mfSinif = e.mfSinif ?? this;
		let cellsRenderer = e.cellsRenderer = (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			let _osColor = rec.oscolor, htmlColor = _osColor ? os2HTMLColor(_osColor) : null;
			if (htmlColor) { let textColor = getContrastedColor(htmlColor); html = html.replace('style="', `style="background-color: ${htmlColor}; color: ${textColor} `) }
			return html
		};
		let {kodKullanilirmi, mqGUIDmi} = mfSinif, kodEtiket = mfSinif.kodEtiket ?? (mqGUIDmi ? 'ID' : 'Kod'), {liste} = e;
		liste.push(new GridKolon({ belirtec: mfSinif.kodSaha, text: kodEtiket, minWidth: 100, width: mqGUIDmi ? 320 : 250, cellsRenderer, hidden: !(kodKullanilirmi || mqGUIDmi), sql: kodKullanilirmi ? undefined : false }))
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {sent} = e, {aliasVeNokta, kodSaha} = this;
		if (!this.bosKodAlinirmi) { sent.where.add(`${aliasVeNokta}${kodSaha} <> ''`) }
		if (!sent.sahalar.liste.find(saha => saha.alias == kodSaha)) { sent.sahalar.add(`${aliasVeNokta}${kodSaha}`) }
		if (this.zeminRenkDesteklermi) sent.sahalar.add(`${aliasVeNokta}oscolor`)
	}
	tekilOku_queryDuzenle(e) {
		super.tekilOku_queryDuzenle(e); let {aliasVeNokta, kodSaha} = this.class, kod = this.kodUyarlanmis, {sent} = e;
		if (kodSaha && kod) { sent.where.degerAta(kod, `${aliasVeNokta}${kodSaha}`) }
	}
	static logRecDonusturucuDuzenle({ result }) {
		super.logRecDonusturucuDuzenle(...arguments); let {kodSaha} = this;
		result[kodSaha] = 'xkod'
	}
	logHVDuzenle({ hv }) {
		super.logHVDuzenle(...arguments);
		hv.xkod = this.kod || ''
	}
	keyHostVarsDuzenle(e) { super.keyHostVarsDuzenle(e); let {hv} = e; hv[this.class.kodSaha] = this.kodUyarlanmis }
	keySetValues(e) { super.keySetValues(e); let {rec} = e; let value = rec[this.class.kodSaha]; if (value != null) { this.kod = value } }
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); let {hv} = e; if (this.class.zeminRenkDesteklermi) hv.oscolor = html2OSColor(this.zeminRenk) || 0 }
	setValues(e) {
		e = e || {}; super.setValues(e); let {rec} = e;
		if (this.class.zeminRenkDesteklermi) { let {oscolor} = rec; this.zeminRenk = oscolor ? os2HTMLColor(oscolor) : '' }
	}
	cizgiliOzet(e) { return this.kod || '' } parantezliOzet(e) { return this.kod || '' } toString(e) { return this.parantezliOzet(e) }
	setId(value) { this.kod = value; return this }
}
class MQKA extends MQKod {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get adiKullanilirmi() { return true } static get adiSaha() { return this.adiKullanilirmi ? 'aciklama' : this.kodSaha } static get adiEtiket() { return 'Açıklama' }
	
	constructor(e) { e = e || {}; super(e) }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); let {pTanim} = e;
		if (this.adiKullanilirmi) { $.extend(pTanim, { aciklama: new PInstStr(this.adiSaha) }) }
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); let {secimler: sec} = e;
		if (this.adiKullanilirmi) {
			sec.secimEkle('instAdi', new SecimOzellik({ etiket: `${this.sinifAdi} Adı` }));
			sec.whereBlockEkle(e => {
				let {aliasVeNokta} = this, {where: wh, secimler: sec} = e;
				wh.ozellik(sec.instAdi, `${aliasVeNokta}${this.adiSaha}`)
			})
		}
	}
	static formBuildersDuzenle_ka(e) {
		super.formBuildersDuzenle_ka(e); let mfSinif = e.mfSinif ?? this, {kodKullanilirmi} = mfSinif, xEtiket = mfSinif.adiEtiket ?? 'Açıklama';
		let {kaForm} = e; if (kodKullanilirmi) { kaForm.yanYana(2.3) } else { kaForm.altAlta() }
		kaForm.addTextInput({ id: 'aciklama', etiket: xEtiket, placeholder: xEtiket }).addCSS('aciklamaParent parent')
			.setVisibleKosulu(this.adiKullanilirmi ? true : 'jqx-hidden').addStyle(e => `$elementCSS { min-width: 300px${kodKullanilirmi ? '; max-width: 60%' : ''} }`);
		return this
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e); let {liste} = e;
		if (this.adiKullanilirmi) { liste.push(this.adiSaha) }
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); let mfSinif = e.mfSinif ?? this, {cellsRenderer, liste} = e, {adiKullanilirmi, adiSaha} = mfSinif;
		if (adiKullanilirmi) {
			let colDef_adi = liste.find(colDef => colDef.belirtec == adiSaha);
			if (!colDef_adi) {
				let adiEtiket = mfSinif.adiEtiket ?? 'Açıklama';
				liste.push(new GridKolon({
					belirtec: adiSaha, text: adiEtiket, cellsRenderer,
					minWidth: Math.min(200, asInteger($(window).width() / 4)), width: Math.min(700, asInteger($(window).width() / 2)),
				}))
			}
		}
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {sent} = e;
		if (this.adiKullanilirmi) {
			let {aliasVeNokta, adiSaha} = this;
			if (adiSaha && !sent.sahalar.liste.find(saha => saha.alias == adiSaha)) { sent.sahalar.add(`${aliasVeNokta}${adiSaha}`) }
		}
	}
	parantezliOzet(e) {
		e = e || {}; if (!(this.adiKullanilirmi && this.aciklama)) { return super.parantezliOzet(e) }
		if (!this.kod) { return this.aciklama }
		return `(${e.styled ? '<b>' : ''}${this.kod}${e.styled ? '</b>' : ''}) ${this.aciklama}`
	}
	cizgiliOzet(e) {
		e = e || {}; e = e || {}; if (!(this.adiKullanilirmi && this.aciklama)) { return super.cizgiliOzet(e) }
		if (!this.kod) { return this.aciklama }
		return `${e.styled ? '<b>' : ''}${this.kod}${e.styled ? '</b>' : ''}-${this.aciklama}`
	}
	static getGridKolonGrup(e) {
		e = e || {}; let mfSinif = e.mfSinif || this; let _mfSinif = mfSinif; if (isFunction(_mfSinif)) { _mfSinif = getFuncValue.call(this, _mfSinif, {}) }
		let {belirtec} = e, sinifAdi = e.sinifAdi || _mfSinif.sinifAdi, kodAttr = e.kodAttr || `${belirtec}Kod`, adiAttr = e.adiAttr || `${belirtec}Adi`;
		let kodEtiket = e.kodEtiket || sinifAdi, adiEtiket = e.adiEtiket || /*_mfSinif.adiEtiket ||*/ sinifAdi;
		let isDropDown = e.dropDown ?? e.isDropDown;
		let ekStmDuzenleyici = e.stmDuzenle ?? e.stmDuzenleyici;
		let ozelQueryDuzenle = e.ozelQueryDuzenle ?? e.ozelQueryDuzenleBlock;
		let degisince = e.degisince ?? e.ekDegisince ?? e.degisinceBlock, gelince = e.gelince ?? e.ekGelince ?? e.gelinceBlock;
		let argsDuzenleBlock = e.argsDuzenle ?? e.argsDuzenleBlock;
		let kolonGrup = new GridKolonGrup_KA({
			mfSinif: mfSinif || this, belirtec, adiAttr, degisince, gelince, isDropDown, ozelQueryDuzenle,
			kaKolonu: new GridKolon({ belirtec: kodAttr, text: adiEtiket || kodEtiket || `${sinifAdi}`, genislikCh: e.adiGenislikCh || 50 }),
			dataBlock: async e => {
				let {kod} = e; if (kod != null && !kod) { return [] }
				let {sender, gridPart, value, maxRow} = e, colDef = sender ?? {}, mfSinif = colDef.mfSinif ?? this;
				let belirtec = colDef.belirtec, kodAttr = colDef.kodAttr || e.kodAttr || `${belirtec}Kod`, adiAttr = colDef.adiAttr || e.adiAttr || `${belirtec}Adi`;
				let {tableAndAlias, aliasVeNokta, kodSaha, adiSaha} = mfSinif;
				let sent = new MQSent({
					from: tableAndAlias, where: [`${aliasVeNokta}${kodSaha} <> ''`],
					sahalar: [`${aliasVeNokta}${kodSaha} ${kodAttr}`, `${aliasVeNokta}${adiSaha} ${adiAttr}` ]
				});
				if (kod) { sent.where.degerAta(kod, `${aliasVeNokta}${kodSaha}`) }
				if (value) {
					let parts = value ? value.split(' ') : null; if (!$.isEmptyObject(parts)) {
						for (let part of parts) {
							part = part?.trim()?.toLocaleUpperCase(); if (part) {
								let or = new MQOrClause([ { like: `%${part}%`, saha: `${aliasVeNokta}${kodSaha}` }, { like: `%${part}%`, saha: `UPPER(${aliasVeNokta}${adiSaha})` } ]);
								sent.where.add(or)
							}
						}
					}
				}
				let stm = new MQStm({ sent: sent, orderBy: [kodAttr] }); let {stmDuzenleyiciler} = kolonGrup;
				if (ekStmDuzenleyici || stmDuzenleyiciler) {
					let fis = e.fis ?? gridPart.fis, {tableAlias, aliasVeNokta} = mfSinif, {sent} = stm, handlers = [];
					if (ekStmDuzenleyici) { handlers.push(ekStmDuzenleyici) }
					if (!$.isEmptyObject(stmDuzenleyiciler)) { handlers.push(...stmDuzenleyiciler) }
					let _e = { ...e, sender, colDef, fis, mfSinif, alias: tableAlias, aliasVeNokta, stm, sent };
					for (let handler of stmDuzenleyiciler) { _e.result = getFuncValue.call(mfSinif, handler, _e); if (_e.result === false) { return null } stm = _e.stm }
				}
				let offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {trnId} = e;
				let result = await this.sqlExecSelect({ offlineMode, trnId, maxRow: (maxRow == null ? app.params.ortak.autoComplete_maxRow : maxRow), query: stm });
				return result
			}
		});
		if (argsDuzenleBlock) { getFuncValue.call(this, argsDuzenleBlock, { ...e, kolonGrup }) }
		return kolonGrup
	}
}
class MQGuidVeAdi extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static mqGUIDmi() { return true }
	static get kodKullanilirmi() { return false } static get bosKodAlinirmi() { return true } static get kodSaha() { return 'id' }
	get id() { return this.kod } set id(value) { this.kod = value } get kodUyarlanmis() { return super.kodUyarlanmis || null }
	constructor(e) { e = e || {}; let {id} = e; if (id !== undefined) { e.kod = id; delete e.id } super(e) }
	static standartGorunumListesiDuzenle(e) {
		let {liste} = e, orjBaslikListesi = e.orjBaslikListesi ?? this.orjBaslikListesi;
		let ignoreBelirtecSet = asSet([config.dev ? null : this.kodSaha].filter(x => !!x));
		liste.push(...orjBaslikListesi.map(colDef => colDef.belirtec).filter(belirtec => !ignoreBelirtecSet[belirtec]))
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e) /*; let {sent} = e, {aliasVeNokta, kodSaha} = this; if (kodSaha) { sent.sahalar.add(`${aliasVeNokta}${kodSaha}`) } */ }
	keyHostVarsDuzenle(e) { super.keyHostVarsDuzenle(e); let {hv} = e; hv[this.class.kodSaha] = this.kod = this.kodUyarlanmis || newGUID() }
	alternateKeyHostVarsDuzenle(e) { this.kod = this.kod || newGUID(); return super.alternateKeyHostVarsDuzenle(e) }
	yeniTanimOncesiIslemler(e) { this.kod = this.kod || newGUID(); return super.yeniTanimOncesiIslemler(e) }
	kopyaIcinDuzenle(e) { this.kod = newGUID(); return super.kopyaIcinDuzenle(e) }
	kaydetOncesiIslemler(e) { this.kod = this.kod || newGUID(); return super.kaydetOncesiIslemler(e) }
}
class MQGuid extends MQGuidVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get adiKullanilirmi() { return false }
}
