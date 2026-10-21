class EIslemQuery extends CObject {
	static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	get filtremi() { return this.table2IDListe == null }
	get table2Yapi() { return {} }
	get tables() { return keys(this.table2Yapi) }
	//get eIslTip() { return this.eIslSinif?.tip }
	//get eIslTipAdi() { return this.eIslSinif?.tipAdi }

	constructor(e = {}) {
		super(e)
		mergeInto(e, this, 'table2IDListe', 'filtre')
		
		//let { gelenmi, eIslSinif, eIslTip = e.efAyrimTipi } = this
		//eIslTip ||= gelenmi ? 'A' : 'E'
		//eIslSinif ??= EIslemOrtak.getClass(eIslTip)
		//extend(this, { eIslSinif })
	}
	getQuery(e = {}) {
		let sent = new MQUnionAll()
		let args = { ...e, stm: new MQStm({ sent }) }
		this.buildQuery(args)
		return args.stm
	}
	buildQuery(e = {}) {
		let { filtremi, table2Yapi, filtre } = this
		let { stm, stm: { sent: uni }, duzenleyici } = e

		for (let [table, info] of entries(table2Yapi)) {    // info: { alias, harTables, mustSaha }
			let idListe
			if (!filtremi && empty(idListe = this.getIDListe(table)))
				continue

			let sentListe = makeArray( this.getSent({ table, ...info, duzenleyici, idListe }) )
			if (!empty(sentListe))
				uni.add(...sentListe)
		}
	}
	getSent(e = {}) {
		let { table, alias, duzenleyici } = e
		alias ??= this.getAlias(table)
		let aliasVeNokta = alias ? `${alias}.` : ''
		
		let sentOrListe = new MQSent()
		let args = { ...e, alias, aliasVeNokta, sent: sentOrListe }
		this.sentDuzenle(args)
		duzenleyici?.call(this, args)
		sentOrListe = args.sent
		
		return sentOrListe
	}
	sentDuzenle(e) {
		this.sentOrtakDuzenle(e)
		this.sentEkDuzenle(e)
		this.sentSonDuzenle(e)
	}
	sentOrtakDuzenle(e) {
		let { table, alias = this.getAlias(table), sent } = e
		let { where: wh, sahalar } = sent
		sent.fromAdd(
			[table, alias]
				.filter(Boolean)
				.join(' ')
		)
	}
	sentEkDuzenle(e) { }
	sentSonDuzenle(e) { }

	getAlias(table) { return this.table2Yapi?.[table]?.alias ?? 'fis' }
	getHarTables(table) { return this.table2Yapi?.[table]?.harTables }
	getIDListe(table) { return this.table2IDListe?.[table] }
}
