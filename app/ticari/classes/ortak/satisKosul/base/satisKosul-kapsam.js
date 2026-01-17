class SatisKosulKapsam extends CObject {
	static get tipListe() { return ['tarih', 'must', 'plasiyer', 'plasiyerBolge', 'plasiyerTip', 'sube', 'subeGrup', 'cariTip', 'cariKosulGrup'] }
	static get alimTipListe() { return ['tarih', 'must'] }
	static get dateTipSet() { return asSet(['tarih']) }
	/** 'tipListe'deki işlemlerden hangilerinin JS, hangilerinin SQL tarafında yapılacağını belirtir.
		    offlineMode için SqlJS kullanılır ve SQLite'in Date işlemleri güvenlilir değildir.
	    - Online mode (MSSQLServer) için tüm işlemleri SQL tarafında yap
		- Offline mode (SQLite) için 'tarih' karşılaştırmasını JavaScript tabanlı, diğer işlemleri SQL tarafında yap
	*/
	static get uygunmuKontrol() {
		let {_uygunmuKontrol: result} = this; if (result == null) {
			let {tipListe} = this, offlineMode = window.MQCogul?.isOfflineMode ?? app?.offlineMode ?? false;
			let js = ['sube', 'subeGrup', (offlineMode ? 'tarih' : null)].filter(x => !!x);
			result = this._uygunmuKontrol = { js: asSet(js) };
			result.sql = asSet(tipListe.filter(x => !result.js[x]));
			result.all = { ...result.js, ...result.sql }
		}
		return result
	}
	static get tip2RowAttrListe() {
		let {_tip2RowAttrListe: result} = this; if (result == null) {
			result = this._tip2RowAttrListe = {
				plasiyer: ['plasb', 'plass'], plasiyerBolge: ['plbolgeb', 'plbolges'], plasiyerTip: ['pltipb', 'pltips'],
				cariTip: ['tipb', 'tips'], cariKosulGrup: ['ckgrupb', 'ckgrups'], sube: ['ozelsubekod'], subeGrup: ['ozelisygrupkod']
			}
		}
		return result
	}
	constructor(e, _alimmi) {
		e = e ?? {}; super(e);
		if (!empty(e)) { this.setValues({ rec: e, alim: e?.alim }, _alimmi) }
	}
	setValues(e = {}, _alimmi) {
		let {rec, mustRec, alim: alimmi} = e
		alimmi ??= _alimmi
		let {tipListe, dateTipSet} = this.class, {subeIcinOzeldir} = rec
		if (alimmi) { tipListe = this.class.alimTipListe }
		if (subeIcinOzeldir != null && !subeIcinOzeldir) { tipListe = tipListe.filter(tip => !(tip == 'sube' || tip == 'subeGrup')) }
		for (let tip of tipListe) {
			let bs = rec[`${tip}Kod`] ?? rec[`${tip}kod`] ?? rec[tip] ??
						mustRec?.[`${tip}Kod`] ?? mustRec?.[`${tip}kod`] ?? mustRec?.[tip];
			if (bs != null) {
				if (bs.basi === undefined && bs.sonu === undefined) { bs = new CBasiSonu({ basi: bs, sonu: bs }) }
				else if ($.isPlainObject(bs)) { bs = new CBasiSonu(bs) }
			}
			if (bs == null) {
				let basi = rec[`${tip}Basi`] ?? rec[`${tip}KodBasi`] ?? rec[`${tip}b`] ?? rec[`${tip}kodb`];
				let sonu = rec[`${tip}Sonu`] ?? rec[`${tip}KodSonu`] ?? rec[`${tip}s`] ?? rec[`${tip}kods`];
				bs = new CBasiSonu({ basi, sonu })
			}
			if (dateTipSet[tip]) {
				/* Date bilgileri sql record'dan da string olarak gelecek (tahmini olarak 'dd.MM.yyyy HH:mm:ss' formatında ve time kısmı atılacak) */
				for (let [key, value] of Object.entries(bs)) {
					if (!value) { continue }
					value = bs[key] = dateToString(asDate(value))
				}
			}
			if (bs) { this[tip] = bs }
		}
		/*if (mustRec) {
			let bosmu = item => !(item?.basi || item), setBS = (selector, value) => this[key] = new CBasiSonu({ basi: value, sonu: value });
			let setBSIfEmpty = (key, value) => { let item = this[key]; if (bosmu(item)) { setBS(key, value) };
			setBSIfEmpty('sube', mustRec.subeKod); setBSIfEmpty('subeGrup', mustRec.subeGrupKod)
		}*/
	}
	uygunmu(e = {}, _alimmi) {
		let {uygunmuKontrol, tipListe} = this.class
		let diger = e.kapsam ?? e.diger ?? e, alimmi = e.alim ?? e.alimmi ?? _alimmi
		if (alimmi)
			tipListe = this.class.alimTipListe
		if (uygunmuKontrol)
			tipListe = tipListe.filter(_ => uygunmuKontrol.all?.[_])
		return tipListe.every(tip =>
			this[tip]?.uygunmu(diger[`${tip}Kod`] ?? diger[`${tip}kod`] ?? diger[tip]) ?? true)
	}
	uygunlukClauseDuzenle({ alias, where: wh, alim }) {  /* this: diger */
		let {uygunmuKontrol, tipListe, dateTipSet} = this.class
		let aliasVeNokta = alias ? `${alias}.` : ''
		if (alim) {
			tipListe = this.class.alimTipListe
			uygunmuKontrol = { ...uygunmuKontrol }
			let {sql, js} = uygunmuKontrol
			$.extend(uygunmuKontrol, {
				sql: { ...sql, must: undefined },
				js: { ...js, must: true }
			})
		}
		for (let tip of tipListe) {
			if (uygunmuKontrol && !uygunmuKontrol.sql?.[tip]) { continue }
			let bs = this[tip] ?? {}, {basi, sonu} = bs
			if (!(basi || sonu)) { continue }
			let saha = { basi: `${aliasVeNokta}${tip}b`, sonu: `${aliasVeNokta}${tip}s` }
			let and = new MQAndClause(), addClause = (selector, operator) => {
				let value = bs[selector]
				if (!value)
					return
				if (dateTipSet[tip])
					value = asDate(value)
				and.add(`${saha[selector]} ${operator} ${MQSQLOrtak.sqlServerDegeri(value)}`)
			};
			addClause('basi', '<=')
			addClause('sonu', '>=')
			if (and.liste.length)
				wh.add(and)
		}
		return this
	}
}
