class EIslemFiltre extends Secimler {
    static { globalThis[this.name] = this; this._key2Class[this.name] = this }
	get gidenmi() { return this.class.gidenmi }
	get gelenmi() { return this.class.gelenmi }
	static get gidenClass() { return GidenEIslemFiltre }
	static get gelenClass() { return GelenEIslemFiltre }
	
	constructor(e = {}) {
		e = { ...e }
		e.eConf ??= MQEConf.getInstance()
		super(e)
		mergeInto(e, this, 'table2IDListe')
	}
	
	static giden(e) { return new this.gidenClass(e) }
	static gidenEmpty(e) { return this.gidenClass.empty(e) }
	static gelen(e) { return new this.gelenClass(e) }
	static gelenEmpty(e) { return this.gelenClass.empty(e) }
	
	getQueryStm(e) { return null }
	queryStmDuzenle(e) { }
	tbWhereClauseDuzenle(e = {}) {
		super.tbWhereClauseDuzenle(e)
	}
	sayaclarBagla(e = {}) {
		let { table2IDListe = this.table2IDListe, alias = 'fis' } = e
		if (empty(table2IDListe))
			return

		let { sent } = e
		let { from, where: wh } = sent
		let aMQTable = from.aliasIcinTable(alias)
		if (aMQTable) {
			let { deger: tbl } = aMQTable
			let idListe = table2IDListe[tbl] ?? []
			wh.inDizi(idListe, `${alias}.id`)
		}
	}
	
	listeOlustur(e) {
		super.listeOlustur(e)
		this.secimlerOlustur_ilk(e)
		this.secimlerOlustur_son(e)
	}
	secimlerOlustur_ilk(e) { }
	secimlerOlustur_son(e) { }
}
