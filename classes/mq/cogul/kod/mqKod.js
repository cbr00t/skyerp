class MQKod extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodSaha() { return 'kod' } static get tanimUISinif() { return ModelTanimPart }
	static get kodKullanilirmi() { return true } static get bosKodAlinirmi() { return false }
	static get zeminRenkDesteklermi() { return false } static get kodEtiket() { this.kodKullanilirmi ? super.kodEtiket : 'ID' }
	get kodUyarlanmis() { return this.kod }

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { kod: new PInstStr(this.kodSaha) });
		if (this.zeminRenkDesteklermi) pTanim.zeminRenk = new PInstStr()
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const {rec, result} = e;
		if (rec.silindi) { result.push('bg-lightgray', 'iptal') }
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimEkle('instKod', new SecimString({ mfSinif: this, hidden: !this.kodKullanilirmi }));
		sec.whereBlockEkle(e => {
			const {aliasVeNokta, kodSaha} = this, wh = e.where, sec = e.secimler;
			wh.basiSonu(secimler.instKod, `${aliasVeNokta}${kodSaha}`)
		})
	}
	static rootFormBuilderDuzenle(e) { e = e || {}; super.rootFormBuilderDuzenle(e); const tanimForm = e.tanimFormBuilder; tanimForm.add(this.getFormBuilders_ka(e)) }
	static getFormBuilders_ka(e) { const _e = $.extend(e, { liste: [] }); this.formBuildersDuzenle_ka(_e); return e.liste }
	static formBuildersDuzenle_ka(e) {
		const {liste} = e, mfSinif = e.mfSinif ?? this, xEtiket =  mfSinif.kodEtiket ?? 'Kod';
		const kaForm = e.kaForm = new FBuilderWithInitLayout({ id: 'kaForm' }).yanYana(1.2); liste.push(kaForm);
		kaForm.addTextInput({ id: 'kod', etiket: xEtiket, placeholder: xEtiket })
			.addCSS('kodParent parent') .addStyle(e => `$elementCSS { min-width: 150px; max-width: 300px }`)
			.setVisibleKosulu(mfSinif.kodKullanilirmi ? true : 'jqx-hidden').onAfterRun(e => {
				const {input, rootPart, altInst} = e.builder, {yenimi, degistirmi} = rootPart;
				if (yenimi) { input.val('') } else if (degistirmi) { input.attr('readonly', ''); input.addClass('readOnly') }
			});
		if (mfSinif.zeminRenkDesteklermi) {
			kaForm.addColorInput({ id: 'zeminRenk', etiket: '' }).etiketGosterim_placeholder()
				.addStyle(
					e => `$elementCSS { min-width: 50px !important; width: 50px !important; height: 35px; margin: -5px 0 0 -10px !important; padding: 5px !important }`,
					e => {
						let {zeminRenk} = e.builder.altInst;
						const renk = zeminRenk ? getContrastedColor(zeminRenk) : null; if (zeminRenk & zeminRenk.length == 7 && zeminRenk != '#000000') { zeminRenk += '80' }
						return `$elementCSS > input { width: var(--full) !important /*color: ${renk || 'inherit'}; background: ${zeminRenk || 'inherit'}*/ }`
					}
				)
		}
	}
	static standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e); const {liste} = e; if (this.kodKullanilirmi) { liste.push(this.kodSaha) } }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const mfSinif = e.mfSinif ?? this;
		const cellsRenderer = e.cellsRenderer = (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			const _osColor = rec.oscolor, htmlColor = _osColor ? os2HTMLColor(_osColor) : null;
			if (htmlColor) { const textColor = getContrastedColor(htmlColor); html = html.replace('style="', `style="background-color: ${htmlColor}; color: ${textColor} `) }
			return html
		};
		const {kodKullanilirmi, mqGUIDmi} = mfSinif, kodEtiket = mfSinif.kodEtiket ?? (mqGUIDmi ? 'ID' : 'Kod'), {liste} = e;
		liste.push(new GridKolon({ belirtec: mfSinif.kodSaha, text: kodEtiket, minWidth: 100, width: mqGUIDmi ? 320 : 250, cellsRenderer, hidden: !(kodKullanilirmi || mqGUIDmi), sql: kodKullanilirmi ? undefined : false }))
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {aliasVeNokta, kodSaha} = this;
		if (!this.bosKodAlinirmi) { sent.where.add(`${aliasVeNokta}${kodSaha} <> ''`) }
		if (!sent.sahalar.liste.find(saha => saha.alias == kodSaha)) { sent.sahalar.add(`${aliasVeNokta}${kodSaha}`) }
		if (this.zeminRenkDesteklermi) sent.sahalar.add(`${aliasVeNokta}oscolor`)
	}
	tekilOku_queryDuzenle(e) {
		super.tekilOku_queryDuzenle(e); const {aliasVeNokta, kodSaha} = this.class, kod = this.kodUyarlanmis, {sent} = e;
		if (kodSaha && kod) { sent.where.degerAta(kod, `${aliasVeNokta}${kodSaha}`) }
	}
	keyHostVarsDuzenle(e) { super.keyHostVarsDuzenle(e); const {hv} = e; hv[this.class.kodSaha] = this.kodUyarlanmis }
	keySetValues(e) { super.keySetValues(e); const {rec} = e; let value = rec[this.class.kodSaha]; if (value != null) { this.kod = value } }
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; if (this.class.zeminRenkDesteklermi) hv.oscolor = html2OSColor(this.zeminRenk) || 0 }
	setValues(e) {
		e = e || {}; super.setValues(e); const {rec} = e;
		if (this.class.zeminRenkDesteklermi) { const {oscolor} = rec; this.zeminRenk = oscolor ? os2HTMLColor(oscolor) : '' }
	}
	cizgiliOzet(e) { return this.kod || '' } parantezliOzet(e) { return this.kod || '' } toString(e) { return this.parantezliOzet(e) }
}
class MQKA extends MQKod {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get adiKullanilirmi() { return true } static get adiSaha() { return this.adiKullanilirmi ? 'aciklama' : this.kodSaha } static get adiEtiket() { return 'Açıklama' }
	
	constructor(e) { e = e || {}; super(e) }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		if (this.adiKullanilirmi) { $.extend(pTanim, { aciklama: new PInstStr(this.adiSaha) }) }
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const {secimler} = e;
		if (this.adiKullanilirmi) {
			secimler.secimEkle('instAdi', new SecimOzellik({ etiket: `${this.sinifAdi} Adı` }));
			secimler.whereBlockEkle(e => {
				const {aliasVeNokta} = this, wh = e.where, sec = e.secimler;
				wh.ozellik(sec.instAdi, `${aliasVeNokta}${this.adiSaha}`)
			})
		}
	}
	static formBuildersDuzenle_ka(e) {
		super.formBuildersDuzenle_ka(e); const mfSinif = e.mfSinif ?? this, {kodKullanilirmi} = mfSinif, xEtiket = mfSinif.adiEtiket ?? 'Açıklama';
		const {kaForm} = e; if (kodKullanilirmi) { kaForm.yanYana(2.3) } else { kaForm.altAlta() }
		kaForm.addTextInput({ id: 'aciklama', etiket: xEtiket, placeholder: xEtiket }).addCSS('aciklamaParent parent')
			.setVisibleKosulu(this.adiKullanilirmi ? true : 'jqx-hidden').addStyle(e => `$elementCSS { min-width: 300px${kodKullanilirmi ? '; max-width: 60%' : ''} }`);
		return this
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {cellsRenderer, liste} = e, {adiSaha} = this;
		if (this.adiKullanilirmi) {
			const colDef_adi = liste.find(colDef => colDef.belirtec == adiSaha);
			if (!colDef_adi) {
				const adiEtiket = this.adiEtiket ?? 'Açıklama';
				liste.push(new GridKolon({ belirtec: adiSaha, text: adiEtiket,  minWidth: Math.min(200, asInteger($(window).width() / 4)), width: Math.min(600, asInteger($(window).width() / 2)), cellsRenderer }))
			}
		}
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e); const {liste} = e;
		if (this.adiKullanilirmi) { liste.push(this.adiSaha) }
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e;
		if (this.adiKullanilirmi) { const {aliasVeNokta, adiSaha} = this; if (adiSaha && !sent.sahalar.liste.find(saha => saha.alias == adiSaha)) { sent.sahalar.add(`${aliasVeNokta}${adiSaha}`) } }
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
		e = e || {}; const mfSinif = e.mfSinif || this; let _mfSinif = mfSinif; if (isFunction(_mfSinif)) { _mfSinif = getFuncValue.call(this, _mfSinif, {}) }
		const {belirtec} = e, sinifAdi = e.sinifAdi || _mfSinif.sinifAdi, kodAttr = e.kodAttr || `${belirtec}Kod`, adiAttr = e.adiAttr || `${belirtec}Adi`;
		const kodEtiket = e.kodEtiket || sinifAdi, adiEtiket = e.adiEtiket || /*_mfSinif.adiEtiket ||*/ sinifAdi;
		const ekStmDuzenleyici = e.stmDuzenle ?? e.stmDuzenleyici, degisince = e.degisince ?? e.ekDegisince ?? e.degisinceBlock, gelince = e.gelince ?? e.ekGelince ?? e.gelinceBlock;
		const argsDuzenleBlock = e.argsDuzenle ?? e.argsDuzenleBlock;
		let kolonGrup = new GridKolonGrup_KA({
			mfSinif: mfSinif || this, belirtec, adiAttr, degisince, gelince,
			kaKolonu: new GridKolon({ belirtec: kodAttr, text: adiEtiket || kodEtiket || `${sinifAdi}`, genislikCh: e.adiGenislikCh || 50 }),
			dataBlock: async e => {
				const {kod} = e; if (kod != null && !kod) { return [] }
				const {sender, gridPart, value, maxRow} = e, colDef = sender ?? {}, mfSinif = colDef.mfSinif ?? this;
				const belirtec = colDef.belirtec, kodAttr = colDef.kodAttr || e.kodAttr || `${belirtec}Kod`, adiAttr = colDef.adiAttr || e.adiAttr || `${belirtec}Adi`;
				const {tableAndAlias, aliasVeNokta, kodSaha, adiSaha} = mfSinif;
				const sent = new MQSent({ from: tableAndAlias, where: [`${aliasVeNokta}${kodSaha} <> ''`], sahalar: [`${aliasVeNokta}${kodSaha} ${kodAttr}`, `${aliasVeNokta}${adiSaha} ${adiAttr}` ] });
				if (kod) { sent.where.degerAta(kod, `${aliasVeNokta}${kodSaha}`) }
				if (value) {
					const parts = value ? value.split(' ') : null; if (!$.isEmptyObject(parts)) {
						for (let part of parts) {
							part = part?.trim()?.toLocaleUpperCase(); if (part) {
								const or = new MQOrClause([ { like: `%${part}%`, saha: `${aliasVeNokta}${kodSaha}` }, { like: `%${part}%`, saha: `UPPER(${aliasVeNokta}${adiSaha})` } ]);
								sent.where.add(or)
							}
						}
					}
				}
				let stm = new MQStm({ sent: sent, orderBy: [kodAttr] }); const {stmDuzenleyiciler} = kolonGrup;
				if (ekStmDuzenleyici || stmDuzenleyiciler) {
					const fis = e.fis ?? gridPart.fis, {tableAlias, aliasVeNokta} = mfSinif, sent = stm.sent, handlers = [];
					if (ekStmDuzenleyici) { handlers.push(ekStmDuzenleyici) }
					if (!$.isEmptyObject(stmDuzenleyiciler)) { handlers.push(...stmDuzenleyiciler) }
					const _e = $.extend({}, e, { sender, colDef, fis, mfSinif, alias: tableAlias, aliasVeNokta, stm, sent });
					for (const handler of stmDuzenleyiciler) { _e.result = getFuncValue.call(mfSinif, handler, _e); if (_e.result === false) { return null } stm = _e.stm }
				}
				const result = await app.sqlExecSelect({ maxRow: ( maxRow == null ? app.params.ortak.autoComplete_maxRow : maxRow ), query: stm }); return result
			}
		});
		if (argsDuzenleBlock) { const _e = $.extend({}, e, { kolonGrup }); let result = getFuncValue.call(this, argsDuzenleBlock, _e) }
		return kolonGrup
	}
}
class MQGuidVeAdi extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static mqGUIDmi() { return true }
	static get kodKullanilirmi() { return false } static get bosKodAlinirmi() { return true } static get kodSaha() { return 'id' }
	get id() { return this.kod } set id(value) { this.kod = value } get kodUyarlanmis() { return super.kodUyarlanmis || null }
	constructor(e) { e = e || {}; const {id} = e; if (id !== undefined) { e.kod = id; delete e.id } super(e) }
	static standartGorunumListesiDuzenle(e) {
		const {liste} = e, orjBaslikListesi = e.orjBaslikListesi ?? this.orjBaslikListesi;
		const ignoreBelirtecSet = asSet([config.dev ? null : this.kodSaha].filter(x => !!x));
		liste.push(...orjBaslikListesi.map(colDef => colDef.belirtec).filter(belirtec => !ignoreBelirtecSet[belirtec]))
	}
	static loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e) /*; const {sent} = e, {aliasVeNokta, kodSaha} = this; if (kodSaha) { sent.sahalar.add(`${aliasVeNokta}${kodSaha}`) } */ }
	keyHostVarsDuzenle(e) { super.keyHostVarsDuzenle(e); const {hv} = e; hv[this.class.kodSaha] = this.kodUyarlanmis || newGUID() }
	yeniTanimOncesiIslemler(e) { this.kod = this.kod || newGUID(); return super.yeniTanimOncesiIslemler(e) }
	kopyaIcinDuzenle(e) { this.kod = newGUID(); return super.kopyaIcinDuzenle(e) }
	kaydetOncesiIslemler(e) { this.kod = this.kod || newGUID(); return super.kaydetOncesiIslemler(e) }
}
class MQGuid extends MQGuidVeAdi { static { window[this.name] = this; this._key2Class[this.name] = this } static get adiKullanilirmi() { return false } }
