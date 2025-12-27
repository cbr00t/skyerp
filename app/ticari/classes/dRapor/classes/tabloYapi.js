class TabloYapi extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get grupVeToplam() {
		let {_grupVeToplam: result} = this
		if (result == null) {
			let {grup, toplam} = this
			result = this._grupVeToplam = { ...grup, ...toplam }
		}
		return result
	}
	constructor(e = {}) {
		super(e)
		$.extend(this, {
			kaPrefixes: e.kaPrefixes ?? [], sortAttr: e.sortAttr ?? null,
			grup: e.grup ?? {}, toplam: e.toplam ?? {}
		})
	}
	addGrup(...items) {
		let {grup: result} = this
		for (let item of items) {
			if (isArray(item)) { this.addGrup(...item); continue }
			if (isPlainObject(item)) { item = new TabloYapiItem(item) }
			let {ka} = item, kod = ka?.kod; if (kod != null) { result[kod] = item }
		}
		return this
	}
	addToplam(...items) {
		let {toplam: result} = this
		for (let item of items) {
			if (isArray(item)) { this.addToplam(...item); continue }
			if (isPlainObject(item)) { item = new TabloYapiItem(item) }
			let {ka} = item, kod = ka?.kod; if (kod != null) { result[kod] = item }
		}
		return this
	}
	addGrupBasit(kod, text, belirtec, mfSinif, genislikCh, duzenleyici, orderBySaha) {
		return this.addItemBasit('addGrup', kod, text, belirtec, mfSinif, genislikCh, duzenleyici, orderBySaha)
	}
	addGrupBasit_numerik(kod, text, belirtec, mfSinif, genislikCh, duzenleyici, orderBySaha) {
		let _duzenleyici = duzenleyici
		duzenleyici = e => { e.colDef.tipNumerik(); _duzenleyici?.call(this, e) }
		return this.addItemBasit('addGrup', kod, text, belirtec, mfSinif, genislikCh, duzenleyici, orderBySaha)
	}
	addGrupBasit_fiyat(kod, text, belirtec, mfSinif, genislikCh, duzenleyici, orderBySaha) {
		let _duzenleyici = duzenleyici
		duzenleyici = e => { e.colDef.tipDecimal_fiyat(); _duzenleyici?.call(this, e) }
		return this.addItemBasit('addGrup', kod, text, belirtec, mfSinif, genislikCh, duzenleyici, orderBySaha)
	}
	addGrupBasit_bedel(kod, text, belirtec, mfSinif, genislikCh, duzenleyici, orderBySaha) {
		let _duzenleyici = duzenleyici
		duzenleyici = e => { e.colDef.tipDecimal_bedel(); _duzenleyici?.call(this, e) }
		return this.addItemBasit('addGrup', kod, text, belirtec, mfSinif, genislikCh, duzenleyici, orderBySaha)
	}
	addToplamBasit(kod, text, belirtec, mfSinif, genislikCh, duzenleyici, fra, orderBySaha) {
		let _duzenleyici = duzenleyici
		duzenleyici = e => { e.colDef.tipDecimal(fra); _duzenleyici?.call(this, e) }
		return this.addItemBasit('addToplam', kod, text, belirtec, mfSinif, genislikCh, duzenleyici, orderBySaha)
	}
	addToplamBasit_fiyat(kod, text, belirtec, mfSinif, genislikCh, duzenleyici, orderBySaha) {
		let _duzenleyici = duzenleyici
		duzenleyici = e => { e.colDef.tipDecimal_fiyat(); _duzenleyici?.call(this, e) }
		return this.addItemBasit('addToplam', kod, text, belirtec, mfSinif, genislikCh, duzenleyici, orderBySaha)
	}
	addToplamBasit_bedel(kod, text, belirtec, mfSinif, genislikCh, duzenleyici, orderBySaha) {
		let _duzenleyici = duzenleyici
		duzenleyici = e => { e.colDef.tipDecimal_bedel(); _duzenleyici?.call(this, e) }
		return this.addItemBasit('addToplam', kod, text, belirtec, mfSinif, genislikCh, duzenleyici, orderBySaha)
	}
	addItemBasit(selector, kod, text, belirtec, mfSinif, genislikCh, duzenleyici, orderBySaha) {
		let toplammi = selector == 'addToplam'
		let colDef = new GridKolon({
			belirtec, text,
			minWidth: (toplammi ? 150 : 180),
			maxWidth: genislikCh ?? (toplammi ? 200 : 500),
			filterType: 'checkedlist'
		})
		let item = new TabloYapiItem({ mfSinif }).setKA(kod, text)
		if (orderBySaha != null) {
			if (orderBySaha === false)
				orderBySaha = null
			item.setOrderBy(orderBySaha)
		}
		let _e = { tabloYapi: this, item, selector, kod, text, belirtec, mfSinif, genislikCh, colDef }
		duzenleyici?.call(this, _e)
		colDef = _e.colDef
		item.addColDef(colDef)
		return this[selector](item)
	}
	addKAPrefix(...items) {
		let {kaPrefixes} = this
		for (let item of items) {
			if (isArray(item)) {
				this.addKAPrefix(...item)
				continue
			}
			if (!(item == null || kaPrefixes.includes(item)))
				kaPrefixes.push(item)
		}
		return this
	}
	getKod2ColDef(e) {
		let kod = typeof e == 'object' ? e.kod ?? e.key : e;
		return this.grupVeToplam[kod]?.colDefs?.[0]
	}
	getKod2Alias(e) { return this.getKod2ColDef(e)?.belirtec }
	setGruplar(value) { this.grup = value ?? {}; return this } setToplamlar(value) { this.toplam = value ?? {}; return this }
	setSortAttr(value) { this.sortAttr = value; return this } setKAPrefixes(value) { this.kaPrefixes = value; return this }

	static async raporTanim_parseINI(e = {}) {
		// -----------------------------
		// küçük yardımcılar (projende zaten varsa sorun olmaz)
		// -----------------------------
		let pickAddSelector = ({ mode, tip }) => {
			let t = (tip ?? '').trim().toUpperCase()
			let isToplam = mode == 'toplam'
			if (isToplam) {
				if (t == 'D2') return 'addToplamBasit_bedel'
				if (t.startsWith('F')) return 'addToplamBasit_fiyat'
				return 'addToplamBasit'
			}
			// grup/sabit
			if (t == 'D2') return 'addGrupBasit_bedel'
			if (t.startsWith('F')) return 'addGrupBasit_fiyat'
			if (/^D\d+$/.test(t) || t == 'N') return 'addGrupBasit_numerik'
			return 'addGrupBasit'
		}
		let makeKey = attr =>
			(attr ?? '').toString().toUpperCase()
		// -----------------------------
		// data yükleme (senin şablona uygun)
		// -----------------------------
		let data = isObject(e) ? e.data : null
		let section = isObject(e) ? (e.section ?? e.sectionAdi ?? e.sectionName) : e
		let belirtec = isObject(e) ? (e.belirtec ?? e.dosya ?? e.dosyaAdi ?? e.file ?? e.fileName) : null
		if (data == null && belirtec && section) {
			// cache önerisi (aynı rapor sürekli parse edilmesin)
			this._raporTanim_iniCache = this._raporTanim_iniCache ?? new Map()
			let cacheKey = `${belirtec}::${section}`
			if (this._raporTanim_iniCache.has(cacheKey))
				data = this._raporTanim_iniCache.get(cacheKey)
			else {
				let _result = await app.wsSabitTanimlar_secIni_noDict({ belirtec, section }) ?? {}
				// ws dönüşü dict ise flat'le
				data = isObject(_result) ? values(_result).flat() : _result
				this._raporTanim_iniCache.set(cacheKey, data)
			}
		}
		if (data && !isArray(data))
			data = ('' + data).split('\n')
		if (isArray(data))
			data = data.map(_ => ('' + _).trim()).filter(_ => _)
		if (empty(data))
			return null

		// -----------------------------
		// 1) PASS: ham tanımları oku
		// -----------------------------
		let mode = 'grup'    // 'grup' (Sabitler) | 'toplam' (Toplamlar/Toplanabilirler)
		let order = 0, rawDefs = []
		for (let line0 of data) {
			let line = (line0 ?? '').trim()
			if (!line)
				continue
			let lw = line.toLowerCase()
			// başlıklar
			if (lw.startsWith('[') && lw.endsWith(']'))
				continue
			// yorum satırı
			if (lw.startsWith('#') || lw.startsWith(';') || lw.startsWith('//'))
				continue
			// ATTR= yoksa geç
			if (!/\battr\s*=/.test(lw))
				continue
			// "Tanım Bilgisi (Sabitler)" / "(Toplamlar)" mod yakalama
			// notlardaki SUM kuralı için gerekli :contentReference[oaicite:2]{index=2}
			mode = (
				lw.includes('toplam') || lw.includes('toplanabilir') ||
					lw.includes('sum(') || lw.includes('max(') || lw.includes('min(') ||
					lw.includes('fiyat') || lw.includes('bedel') ||
					lw.includes('kayitsayi')
				? 'toplam' : 'grup'
			)
			/*if (lw.includes('tanım bilgisi') || lw.includes('tanim bilgisi'))
				continue*/
			// tokenlar: TAB ile ayrılmış key=value
			let kv = {}
			for (let token of line.split('\t')) {
				token = token?.trim()
				if (!token)
					continue
				let eq = token.indexOf('=')
				if (eq < 0)
					continue
				let k = token.slice(0, eq).trim().toUpperCase()
				let v = token.slice(eq + 1).trim()
				kv[k] = v
			}
			let {ATTR: attr} = kv
			if (!attr)
				continue
			rawDefs.push({
				order: order++,
				mode, attr,
				bas1: kv.BAS1 ?? '', bas2: kv.BAS2 ?? '',
				gen: asInteger(kv.GEN) || undefined,
				sql: kv.SQL ?? '', tip: kv.TIP ?? '',
				duzenle: kv.DUZENLE ?? ''                    // varsa
			})
		}
		if (empty(rawDefs))
			return null
		// -----------------------------
		// 2) PASS: KA eşleştirme (prefixKod + prefixAdi => tek prefix)
		// senin "AI HELP" kısmının net çözümü bu: önce topla, sonra eşleştir. :contentReference[oaicite:3]{index=3}
		// -----------------------------
		let kaPairRe = /^(.*?)(kod|adi)$/i
		let pairMap = new Map()                                           // prefixLower -> { prefixRaw, kodDef, adiDef }
		for (let def of rawDefs) {
			let m = (def.attr ?? '').match(kaPairRe)
			if (!m)
				continue
			let prefixRaw = m[1]
			let suffix = (m[2] ?? '').toLowerCase()
			let prefixKey = prefixRaw.toLowerCase()
			let rec = pairMap.get(prefixKey)
			if (!rec) {
				rec = { prefixRaw, kodDef: null, adiDef: null }
				pairMap.set(prefixKey, rec)
			}
			if (suffix == 'kod')
				rec.kodDef = def
			else if (suffix == 'adi')
				rec.adiDef = def
		}
	
		let kaPrefixes = [], kaSet = new Set(), mergedDefs = []
		let consumed = new Set()
		for (let rec of pairMap.values()) {
			if (!rec.kodDef || !rec.adiDef)    // tek taraf varsa KA sayma (IlAdi gibi false-positive’leri engeller)
				continue
			let {prefixRaw} = rec
			kaPrefixes.push(prefixRaw)
			kaSet.add(prefixRaw)
			consumed.add(rec.kodDef)
			consumed.add(rec.adiDef)
			// Etiket/GEN/TIP için genelde "Adi" satırı daha kullanıcı-dostu oluyor, yoksa Kod'dan al
			// let labelDef = (empty(rec.adiDef.bas1) && empty(rec.adiDef.bas2)) ? rec.kodDef : rec.adiDef
			// Etiket'i Kod sahasından almak istersek
			let labelDef = (empty(rec.kodDef.bas1) && empty(rec.kodDef.bas2)) ? rec.adiDef : rec.kodDef
			mergedDefs.push({
				order: Math.min(rec.kodDef.order, rec.adiDef.order),
				mode: rec.kodDef.mode,          // pratikte aynı olması beklenir
				isKA: true,
				attr: prefixRaw,                // tabloYapi'de saha (prefix)
				kodAttr: prefixRaw + 'kod',     // default; aşağıda override edeceğiz
				adiAttr: prefixRaw + 'adi',
				// override: ini'de Kod/Adi farklı case ile geldiyse onu koru
				_kodAttrRaw: rec.kodDef.attr,
				_adiAttrRaw: rec.adiDef.attr,
				bas1: labelDef.bas1,
				bas2: labelDef.bas2,
				gen: Math.max(rec.kodDef.gen || 0, rec.adiDef.gen || 0) || undefined,
				tip: labelDef.tip || rec.kodDef.tip || rec.adiDef.tip || '',
				sqlKod: rec.kodDef.sql,
				sqlAdi: rec.adiDef.sql,
				duzenle: labelDef.duzenle || ''
			})
		}	
		// KA olmayanları ekle
		for (let def of rawDefs) {
			if (!consumed.has(def))
				mergedDefs.push({ ...def, isKA: false })
		}
		mergedDefs.sort((a, b) => a.order - b.order)
		// -----------------------------
		// çıktı sözlükleri
		// -----------------------------
		let items = {}, itemsGrup = [], itemsToplam = []
		let sentDuzenle = {}, metaByKey = {}, code = {}
		for (let def of mergedDefs) {
			let {attr} = def
			let etiket = [def.bas1, def.bas2].map(x => (x ?? '').trim()).filter(Boolean).join(' ')
			let genislikCh = def.gen || undefined
			let key = makeKey(def.attr)
			let addItemSelector = pickAddSelector(def)
			// DUZENLE js kodu varsa compile et (projendeki getFunc varsa onu kullan)
			let duzenleyici
			if (!empty(def.duzenle)) {
				let {duzenle: duzenleText} = def
				duzenleyici = ({ item, colDef, ...rest }) => {
					if (isString(duzenleText) && !(duzenleText.includes('=>') || duzenleText.includes('function(')))
						duzenleText = `(({ item, colDef, ...rest }) => { ${duzenleText} })`
					let fn = isString(duzenleText) ? getFunc(duzenleText) : duzenleText
					return fn?.call?.(this, { item, colDef, ...rest })
				}
			}
			// tabloYapi ekleyici
			let addItemFn = ({ tabloYapi }) => {
				if (kaSet.has(attr))
					tabloYapi.addKAPrefix(attr)
				tabloYapi[addItemSelector](key, etiket, def.attr, null, genislikCh * (katSayi_ch2Px + 5), duzenleyici)
			}
			items[key] = addItemFn
			;(def.mode == 'toplam' ? itemsToplam : itemsGrup).push(addItemFn)
			// SQL sahaları ekleyici
			sentDuzenle[key] = ({ sent, sent: { sahalar } }) => {
				if (!sahalar)
					return
				if (def.isKA) {
					// ini'deki gerçek attr isimlerini öncelikle koru (Kod/Adi case meselesi yüzünden)
					let kodAlias = (def._kodAttrRaw ?? def.kodAttr ?? `${attr}kod`).trim()
					let adiAlias = (def._adiAttrRaw ?? def.adiAttr ?? `${attr}adi`).trim()
					let cKod = (def.sqlKod ?? '').trim()
					let cAdi = (def.sqlAdi ?? '').trim()
					if (!cKod || !cAdi)
						return
					// KA satırları normalde "Sabitler" grubunda olur; ama yine de mode=toplam ise SUM uygula
					if (def.mode == 'toplam') {
						cKod = cKod.parantezli()
						cAdi = cAdi.parantezli()
						/*cKod = wrapSumIfNeeded(cKod)
						cAdi = wrapSumIfNeeded(cAdi)*/
					}
					cKod = cKod.gerekirseAliasli(kodAlias)
					cAdi = cAdi.gerekirseAliasli(adiAlias)
					// sahalar.add birden fazla arg alabiliyor (örnekteki gibi)
					sahalar.add(cKod, cAdi)
					return
				}
				let clause = (def.sql ?? '').trim()
				if (!clause)
					return
				// Toplamlar için SUM kuralı :contentReference[oaicite:4]{index=4}
				if (def.mode == 'toplam')
					// clause = wrapSumIfNeeded(clause)
					clause = clause.parantezli()
				clause = clause.gerekirseAliasli(attr)
				sahalar.add(clause)
			}
			metaByKey[key] = { ...def, key, etiket, addItemSelector }
			let escTplContent = s => {
				return (s ?? '')
					.replace(/\\/g, '\\\\')     // \ -> \\
					.replace(/`/g, '\\`')       // ` -> \`
					.replace(/\$\{/g, '\\${')   // ${ -> \${  (template literal içine gömülünce patlamasın)
			}
			code[key] = {
				item() {
					return (
						`.${addItemSelector}('${key}', '${toJSONStr(etiket)}', '${attr}', null,` +
							` ${genislikCh}, ${duzenleyici ? toJSONStr(duzenleyici.toString()) : 'null'}` +
						`)`
					)
				},
				sentDuzenle() {
					let sqlText    = escTplContent(def.sql)
					let sqlKodText = escTplContent(def.sqlKod)
					let sqlAdiText = escTplContent(def.sqlAdi)
					return def.isKA
						? `sahalar.add(\`${sqlKodText} ${attr}kod\`, \`${sqlAdiText} ${attr}adi\`)`
						: `sahalar.add(\`${sqlText} ${attr}\`)`
				}
			}
		}
		return {
			kaPrefixes,      // result.addKAPrefix(...kaPrefixes) için
			items,           // key => ({tabloYapi}) => ...
			itemsGrup,       // sırayla grup kolonlarını eklemek istersen
			itemsToplam,     // sırayla toplam kolonlarını eklemek istersen
			sentDuzenle,     // key => ({sent}) => sahalar.add(...)
			code,
			metaByKey,       // debug / UI için
			defs: mergedDefs // ham+merge sonrası liste (debug)
		}
	}
}

class TabloYapiItem extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get tipStringmi() { return !this.tip } get tipNumerikmi() { return this.tip == 'number' } get tipTarihmi() { return this.tip == 'date' } get tipBoolmu() { return this.tip == 'boolean' }
	get secimSinif() {
		return (this.tipNumerikmi ? SecimNumber : this.tipTarihmi ? SecimDate : SecimString)
		/*return this.kaYapimi
			? (this.tipNumerikmi ? SecimNumber : this.tipTarihmi ? SecimDate : SecimString)
			: (this.tipNumerikmi ? SecimTekilNumber : this.tipTarihmi ? SecimTekilDate : SecimOzellik)*/
	}
	get kaYapimi() { return !!this.mfSinif }  get formulmu() { return !!this.formul }
	get orderBySaha() {
		let {_orderBySaha: result} = this; if (result !== undefined) { return result }
		let {kaYapimi} = this; result = this.colDefs[0]?.belirtec;
		if (result && kaYapimi) {
			let lower = result.toLowerCase();
			if (!(lower.endsWith('kod') || lower.endsWith('adi'))) { result = [`${result}kod`, `${result}adi`] }
		}
		return result
	}
	set orderBySaha(value) { this._orderBySaha = value }
	constructor(e = {}) {
		super(e)
		$.extend(this, {
			tip: e.tip == 'string' ? null : e.tip,
			mfSinif: e.mfSinif, secimKullanilirFlag: e.secimKullanilirFlag,
			ozelWhereClauseFlag: e.ozelWhereClauseFlag, orderBySaha: e.orderBySaha,
			hrkAttr: e.hrkAttr, colDefs: e.colDefs ?? [],
			secimlerDuzenleyici: e.secimlerDuzenleyici, tbWhereClauseDuzenleyici: e.tbWhereClauseDuzenleyici,
			kodsuzmu: e.kodsuzmu, isHidden: e.hidden ?? e.isHidden
		});
		this.setKA(e.ka).setFormul(e.formul)
	}
	secimlerDuzenle(e) {
		let {secimKullanilirFlag, mfSinif} = this
		let {ka, secimSinif, colDefs, kaYapimi} = this, kod = ka?.kod, kodSaha = mfSinif?.kodSaha
		secimKullanilirFlag = secimKullanilirFlag ?? !!mfSinif; e.item = this;
		if (secimKullanilirFlag) {
			let clauseVarmi = kodSaha || colDefs[0]?.belirtec
			if (clauseVarmi && kod != null && secimSinif) {
				let {adiSaha} = mfSinif ?? {}, {secimler: sec} = e, {aciklama: etiket} = ka
				let grupKod = kod, zeminRenk = undefined, kapali = true
				sec.grupEkle({ kod: grupKod, aciklama: etiket, zeminRenk, kapali })
				let userData = { kod }, liste = {}
				liste[kod] = new secimSinif({ etiket: kaYapimi ? 'Kod' : 'Değer', mfSinif, grupKod, userData })
				if (kaYapimi && adiSaha)
					liste[kod + 'Adi'] = new SecimOzellik({ etiket: 'Adı', grupKod, userData })
				sec.secimTopluEkle(liste)
			}
		}
		this.secimlerDuzenleyici?.call(this, { ...e, kod })
	}
	tbWhereClauseDuzenle(e) {
		let {secimKullanilirFlag, mfSinif, ozelWhereClauseFlag, tbWhereClauseDuzenleyici} = this
		let {ka, secimSinif, colDefs, kaYapimi} = this, kod = ka?.kod; e.item = this
		secimKullanilirFlag = secimKullanilirFlag ?? !!mfSinif
		let kodSaha = mfSinif?.kodSaha, alias = mfSinif?.tableAlias || ''
		let aliasVeNokta = alias ? `${alias}.` : '', {belirtec} = colDefs[0], kodClause = `${aliasVeNokta}${kodSaha || belirtec}`
		let hv = e.hv ?? e.hrkHV, defHV = e.defHV ?? e.hrkDefHV
		let hvDegeri = e.hvDegeri ?? (hv || defHV ? (key => hv?.[key] ?? defHV?.[key]) : null)
		if (hvDegeri) {
			let _kodClause = hvDegeri(belirtec) ?? kodClause
			if (_kodClause?.sqlDoluDegermi())
				kodClause = _kodClause
		}
		let _e = { ...e, hv, kodClause, hv, defHV, hvDegeri }
		if (secimKullanilirFlag && !ozelWhereClauseFlag) {
			if (kodClause && kod != null && secimSinif) {
				let {adiSaha} = mfSinif ?? {}, {secimler: sec, where: wh} = _e
				wh.basiSonu(sec[kod], kodClause)
				if (kaYapimi && adiSaha)
					wh.ozellik(sec[kod + 'Adi'], `${aliasVeNokta}${adiSaha}`)
			}
		}
		tbWhereClauseDuzenleyici?.call(this, { ..._e, kod })
	}
	formulEval(e) {
		let {colDefs} = this; if (!colDefs?.length) { return this }
		let item = this, {rec} = e, {kod} = this.ka; let value = this.formul?.run({ item, kod, ...e }); if (value == null) { return this }
		for (let {belirtec} of colDefs) { rec[belirtec] = value } return this
	}
	addColDef(...items) {
		let {colDefs} = this; for (let item of items) {
			if (isArray(item)) { this.addColDef(...item); continue }
			if (item != null) { colDefs.push(item) }
		}
		return this
	}
	setKA(e, _aciklama) {
		if (e != null) {
			if (_aciklama !== undefined) { e = new CKodVeAdi({ kod: e, aciklama: _aciklama }) }
			if (isPlainObject(e)) { e = new CKodVeAdi(value) }
			if (isArray(e)) { e = new CKodVeAdi({ kod: value[0], aciklama: value[1] }) }
		}
		this.ka = e; return this
	}
	setFormul(e, _block) {
		if (_block !== undefined) { e = { attrListe: e, block: _block } }
		if (e != null && isPlainObject(e)) { e = new DRaporFormul(e) }
		this.formul = e; return this
	}
	setOrderBySaha(value) { this.orderBySaha = value; return this } setOrderBy(value) { return this.setOrderBySaha(value) }
	noOrderBy() { return this.setOrderBySaha(null) } setHrkAttr(value) { this.hrkAttr = value; return this }
	kodsuz() { this.kodsuzmu = true; return this } kodlu() { this.kodsuzmu = false; return this }
	hidden() { this.isHidden = true; return this } visible() { this.isHidden = false; return this }
	tipString() { this.tip = null; return this } tipNumerik() { this.tip = 'number'; return this } tipDate() { this.tip = 'date'; return this } tipBool() { this.tip = 'boolean'; return this }
	setColDefs(value) { this.colDefs = value; return this } setMFSinif(value) { this.mfSinif = value; return this }
	secimKullanilir() { this.secimKullanilirFlag = true; return this } secimKullanilmaz() { this.secimKullanilirFlag = false; return this }
	ozelWhereClause() { this.ozelWhereClauseFlag = true; return this } normalWhereClause() { this.ozelWhereClauseFlag = false; return this }
	setSecimlerDuzenleyici(value) { this.secimlerDuzenleyici = value; return this } setTBWhereClauseDuzenleyici(value) { this.tbWhereClauseDuzenleyici = value; return this }
}
class DRaporFormul extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e = {}) {
		super(e)
		this.setAttrListe(e.attrListe)
		this.setBlock(e.block)
	}
	run(e) {
		let {rec} = e, {block} = this; if (!(rec && block)) { return this }
		let formul = this, {item} = e, kod = e.kod ?? e.name ?? e.tip; return getFuncValue.call(this, block, { kod, rec, formul, item })
	}
	addAttr(...items) {
		let {attrListe} = this; for (let item of items) {
			if (isArray(item)) { this.addAttr(...item); continue }
			if (item != null) { attrListe.push(item) }
		}
		return this
	}
	setAttrListe(value) { this.attrListe = value ?? []; return this }
	setBlock(value) { if (typeof value == 'string') { value = getFunc(value) } this.block = value; return this }
}
