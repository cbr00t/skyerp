class RRSahaText extends RRSahaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kayitTipi() { return 'SB' }  get attrOrValue() { return this.value }
	constructor(e) {
		super(e); e = this.getConstructorArgs(e) || {};
		this.value = coalesce(e.value, coalesce(e.attr, e.attrOrValue));
	}
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { attr: this.value }) }
	setValues(e) { super.setValues(e); const {rec} = e; $.extend(this, { value: rec.attr }) }
}
class RRSahaDegisken extends RRSahaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kayitTipi() { return '' } static get degiskenmi() { return true } get attrOrValue() { return this.attr }
	get sql() { let result = this._sql; if (result != null) { if (typeof result == 'string') result = this._sql = { 1: result } } return result }
	set sql(value) { this._sql = value }

	constructor(e) {
		super(e); e = this.getConstructorArgs(e) || {};
		this.attr = e.ATTR ?? e.attr ?? e.value ?? e.attrOrValue; this.sqlAta({ rec: e })
	}
	sqlAta(e) {
		const {rec} = e, _sql = rec.sql || {}, Prefix_SQL = 'SQL';
		for (let key in rec) {
			if (key.startsWith(Prefix_SQL)) {
				const value = rec[key]; if (!value) continue
				key = key.slice(Prefix_SQL.length) || '1'; _sql[key] = value
			}
		}
		this.sql = _sql
	}
	hostVarsDuzenle(e) { super.hostVarsDuzenle(e); const {hv} = e; $.extend(hv, { attr: this.attr }) }
	setValues(e) { super.setValues(e); const {rec} = e; $.extend(this, { attr: rec.attr }) }
	static getRaporTarihEkSahalari(e) {
		e = e || {};
		const onBelirtec = e.onBelirtec || '', onBaslik = e.onBaslik ? e.onBaslik + ' ' : '', sql = e.sql || e.tarihSql || 'tarih';
		const degerci = sql.toLowerCase() == (`cast(null as datetime)`) ? e => `CAST(NULL AS ${getFuncValue.call(this, e.nullIse)})` : e => e.sql;
		return [
			new RRSahaDegisken({
				attr: `${onBelirtec}yil`, baslik: `${onBaslik}Yıl`, genislikCh: 5,
				sql: degerci({ sql: `DATEPART(YEAR, ${sql})`, nullIse: 'INT' })
			}).tipNumerik(),
			new RRSahaDegisken({
				attr: `${onBelirtec}ayno`, baslik: `${onBaslik}Ay`, genislikCh: 4,
				sql: degerci({ sql: `DATEPART(MONTH, ${sql})`, nullIse: 'INT' })
			}).tipNumerik(),
			new RRSahaDegisken({
				attr: `${onBelirtec}ayadi`, baslik: `${onBaslik}Ay Adı`, genislikCh: 10,
				sql: degerci({ sql: `dbo.ayadi(${sql})`, nullIse: 'CHAR(10)' })
			}),
			new RRSahaDegisken({
				attr: `${onBelirtec}ayhamadi`, baslik: `${onBaslik}Ay Ham Adı`, genislikCh: 10,
				sql: degerci({ sql: `dbo.no2ayhamadi(DATEPART(MONTH, ${sql}))`, nullIse: 'CHAR(10)' })
			}),
			new RRSahaDegisken({
				attr: `${onBelirtec}gadeger`, baslik: `${onBaslik}Gün.Ay`, genislikCh: 8,
				sql: degerci({ sql: `dbo.gax(${sql})`, nullIse: 'CHAR(6)' })
			}),
			new RRSahaDegisken({
				attr: `${onBelirtec}ceyrekadi`, baslik: `${onBaslik}Çeyrek Dönem`, genislikCh: 10,
				sql: degerci({ sql: `dbo.ceyrekdonem(${sql})`, nullIse: 'CHAR(10)' })
			}),
			new RRSahaDegisken({
				attr: `${onBelirtec}yilhaftasi`, baslik: `${onBaslik}Yıl Haftası`, genislikCh: 6,
				sql: degerci({ sql: `DATEPART(WEEK, ${sql})`, nullIse: 'SMALLINT' })
			}).tipNumerik(),
			new RRSahaDegisken({
				attr: `${onBelirtec}haftagunu`, baslik: `${onBaslik}Hafta Günü`, genislikCh: 10,
				sql: degerci({ sql: `dbo.haftagunadi(${sql})`, nullIse: 'CHAR(10)' })
			})
		]
	}
}

class RROzelIslem extends RRaporDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kayitTipi() { return 'SS' } static get ozelIslemmi() { return true }
}
class RRKirilma extends RROzelIslem {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kayitTipi() { return 'KR' } static get kirilmami() { return true }
}
class RRFormul extends RROzelIslem {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kayitTipi() { return 'FR' } static get formulmu() { return true }
}
