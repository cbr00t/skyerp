class SatisKosulKapsam extends CObject {
	static get tipListe() { return ['tarih', 'must', 'plasiyer', 'plasiyerBolge', 'plasiyerTip', 'sube', 'subeGrup', 'cariTip', 'cariKosulGrup'] }
	static get dateTipSet() { return asSet(['tarih']) }
	/** 'tipListe'deki işlemlerden hangilerinin JS, hangilerinin SQL tarafında yapılacağını belirtir.
		    offlineMode için SqlJS kullanılır ve SQLite'in Date işlemleri güvenlilir değildir.
	    - Online mode (MSSQLServer) için tüm işlemleri SQL tarafında yap
		- Offline mode (SQLite) için 'tarih' karşılaştırmasını JavaScript tabanlı, diğer işlemleri SQL tarafında yap
	*/
	static get uygunmuKontrol() {
		let {_uygunmuKontrol: result} = this; if (result == null) {
			const {tipListe} = this, offlineMode = window.MQCogul?.isOfflineMode ?? app?.offlineMode ?? false;
			result = this._uygunmuKontrol = { js: asSet(offlineMode ? ['tarih'] : []) };
			result.sql = asSet(tipListe.filter(x => !result.js[x]))
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
	constructor(e) { e = e ?? {}; super(e); this.setValues({ rec: e }) }
	setValues(e) {
		e = e ?? {}; const {rec} = e, {tipListe, dateTipSet} = this.class;
		for (const tip of tipListe) {
			let bs = rec[`${tip}Kod`] ?? rec[`${tip}kod`] ?? rec[tip]; if (bs) {
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
	}
	uygunmu(e) {
		e = e ?? {}; let {uygunmuKontrol, tipListe} = this.class, diger = (typeof e == 'object' ? e.kapsam ?? e.diger : e) ?? {};
		if (uygunmuKontrol) { tipListe = tipListe.filter(x => uygunmuKontrol.js?.[x]) }
		return tipListe.every(tip => this[tip]?.uygunmu(diger[tip]) ?? true)
	}
	uygunlukClauseDuzenle({ alias, where: wh }) {  /* this: diger */
		let {uygunmuKontrol, tipListe} = this.class, aliasVeNokta = alias ? `${alias}.` : '';
		for (const tip of tipListe) {
			if (uygunmuKontrol && !uygunmuKontrol.sql?.[tip]) { continue }
			const bs = this[tip] ?? {}, {basi, sonu} = bs; if (!(basi || sonu)) { continue }
			const saha = { basi: `${aliasVeNokta}${tip}b`, sonu: `${aliasVeNokta}${tip}s` };
			const or = new MQOrClause(), addClause = (selector, operator) => {
				let value = bs[selector]; if (!value) { return }
				or.add(`${saha[selector]} ${operator} ${value.sqlServerDegeri()}`)
			};
			addClause('basi', '>='); addClause('sonu', '<=');
			if (or.liste.length) { wh.add(or) }
		}
		return this
	}
}
