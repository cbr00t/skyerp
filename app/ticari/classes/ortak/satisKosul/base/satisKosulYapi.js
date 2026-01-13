class SatisKosulYapi extends MQCogul {
	static get tables() {
		let {_tables: result} = this
		if (!result) {
			let {subClasses: classes} = SatisKosul
			result = this._tables = [
				...classes.map(_ => _.table),
				...classes.flatMap(_ => values(_.detayTables)),
				...classes.map(_ => _.detayMustTable)
			].filter(Boolean)
		}
		return result
	}
	static get kosulSiniflar() {
		let {_kosulSiniflar: result} = this
		if (result == null)
			result = this._kosulSiniflar = [SatisKosul_Fiyat, SatisKosul_Iskonto, SatisKosul_Kampanya]
		return result
	}
	static get tipListe() {
		let {_tipListe: result} = this
		if (result == null)
			result = this._tipListe = this.kosulSiniflar.map(cls => cls.tipKod)
		return result
	}
	get satisKosullari() { return Array.from(this) }
	get tip2SatisKosul() {
		let result = {}
		for (let item of this) {
			let {tipKod} = item.class
			result[tipKod] = item
		}
		return result
	}
	get kapsam() { return this._kapsam }
	set kapsam(value) { this._kapsam = isPlainObject(value) ? new SatisKosulKapsam(value) : null /* this.reset() */ }
	constructor(e = {}) {
		super(e); let {kapsam} = e
		$.extend(this, { kapsam })
	}
	reset(e) {
		let {kapsam, class: { kosulSiniflar }} = this
		for (let cls of kosulSiniflar) {
			let {tipKod} = cls
			this[tipKod] = new cls({ kapsam })
		}
		this._initFlag = true
		return this
	}
	static async uygunKosullar(e = {}) {
		let inst = new this(e)
		return await inst.uygunKosullar(e) ? inst : null
	}
	async uygunKosullar(e = {}) {
		let {kosulSiniflar} = this.class
		let {kapsam = this.kapsam ?? {}} = e
		let _e = { ...e, kapsam }
		let promises = []
		for (let cls of kosulSiniflar) {
			let {tipKod} = cls
			promises.push(
				cls.uygunKosullar(_e)
					.then(result => {
						if (empty(result)) { delete this[tipKod] }
						else { this[tipKod] = result }
					})
					.catch(ex => { delete this[tipKod]; throw ex })
			)
		}
		await Promise.allSettled(promises)
		return this
	}
	static async yukle(e) {
		let inst = new this(e)
		return await inst.yukle(e) ? inst : null
	}
	async yukle(e) {
		e ??= {}; this.reset(e);
		let {kosulSiniflar} = this.class, kapsam = e.kapsam ?? this.kapsam
		let _e = { ...e, kapsam }, promises = [];
		for (let cls of kosulSiniflar) {
			let {tipKod} = cls, inst = this[tipKod]
			if (!inst)
				continue
			promises.push(
				inst.yukle(_e)
					.catch(ex => { delete this[tipKod]; inst = null; throw ex })
			)
		}
		await Promise.allSettled(promises); return this
	}
	*getIter() {
		let {tipListe} = this.class
		for (let tip of tipListe) {
			let item = this[tip]
			if (item != null)
				yield item
		}
	}
	[Symbol.iterator]() { return this.getIter() }

	static offlineBuildSQLiteQuery(e) {
		// do nothing
	}
	static offlineDropTable({ offlineMode } = {}) {
		if (offlineMode === false)
			return
		let {tables} = this
		for (let table of tables) {
			this.sqlExecNone(`DROP TABLE IF EXISTS ${table}`)
		}
	}
	static offlineClearTable({ offlineMode } = {}) {
		if (offlineMode === false)
			return
		let {tables} = this
		for (let table of tables)
			this.sqlExecNone(`DELETE FROM ${table}`)
	}
	static async offlineSaveToLocalTable(e = {}) {
		let autoIncSet = asSet('sayac', 'kaysayac')
		let pkSet = asSet(['rowid', 'id', ...keys(autoIncSet), 'kod', 'kodno', 'webrefid'])
		let cnv = {}
		; [106, 60, 62].forEach(_ => cnv[_] = 'REAL')
		; [48, 52, 56, 127, 104].forEach(_ => cnv[_] = 'INTEGER')
		try { await this.sqlExecNone('COMMIT') } catch (ex) { }
		let {tables} = this, queries = []
		for (let table of tables) {
			let colDefs = await app.sqlGetColumns({ offlineMode: false, table })
			if (empty(colDefs))
				continue
			colDefs = values(colDefs)
			let {length: len} = colDefs, pkList = []
			queries.push(`CREATE TABLE IF NOT EXISTS ${table} (`)
			colDefs.forEach((def, i) => {
				let {name, xtype} = def
				let pk = pkSet[name], autoInc = autoIncSet[name]
				let notNull = pk || autoInc
				let type = autoInc ? 'INTEGER' : cnv[xtype] || 'TEXT'
				let num = type == 'REAL' || type == 'INTEGER'
				let dflt = autoInc ? ' AUTO_INCREMENT' : notNull ? ` DEFAULT ${num ? 0 : `''`}` : ''
				let atEnd = i + 1 == len
				queries.push(`    ${name} ${type}${notNull ? ` NOT NULL` : ''}${dflt}${atEnd ? '' : ','}`)
				if (pk)
					pkList.push(name)
			})
			if (!empty(pkList))
				queries.push(`    , PRIMARY KEY (${pkList.join(', ')})`)
			queries.push(');')
		}
		if (!empty(queries)) {
			try { await this.sqlExecNone('BEGIN') } catch (ex) { }
			await this.sqlExecNone({ offlineMode: true, query: queries.join(CrLf) })
			try { await this.sqlExecNone('COMMIT') } catch (ex) { }
		}
		
		for (let table of tables) {
			let sent = new MQSent({ from: table, sahalar: ['*'] })
			let recs = await this.sqlExecSelect({ offlineMode: false, query: sent })
			if (empty(recs))
				continue
			try { await this.sqlExecNone('BEGIN') } catch (ex) { }
			for (let hvListe of arrayIterChunks(recs, 300)) {
				/*for (let hv of hvListe) {
					for (let [k, v] of entries(hv)) {
						if (v == null)
							delete hv[k]
					}
				}*/
				let ins = new MQInsert({ table, hvListe }).insertOnly()
				await this.sqlExecNone({ offlineMode: true, query: ins })
				window.progressManager?.progressStep()
			}
			try { await this.sqlExecNone('COMMIT') } catch (ex) { }
		}
	}
}
