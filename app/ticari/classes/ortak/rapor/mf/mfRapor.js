class MasterFisRaporOrtak extends ModelRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporGrup() { return super.raporGrup }
	get builder() { return this._builder || (this.parentPart || {}).builder }
	get gridWidget() { return this._gridWidget || (this.parentPart || {}).gridWidget }
	get mfKodListeTipi() { return (this.mfSinif || {}).kodListeTipi }
	get sabitKolonlar() {
		let result = this._sabitKolonlar;
		if (result == null) {
			const _e = { liste: [] }
			this.sabitKolonlarOlustur(_e);
			result = this._sabitKolonlar = _e.liste;
		}
		return result;
	}
	
	constructor(e) {
		e = e || {};
		super(e);

		$.extend(this, {
			parentPart: e.parentPart || e.sender,
			_builder: e.builder, _gridWidget: e.gridWidget
		});

		const {secimler} = e;
		if (secimler)
			this.birlestir(secimler);
	}

	listeOlustur(e) {
		super.listeOlustur(e);
	}

	sabitKolonlarOlustur(e) {
	}

	async dataSourceDuzenle_ara(e) {
		await super.dataSourceDuzenle_ara(e);
		
		await this.dataSourceDuzenle_baslik_ara(e);
	}

	async dataSourceDuzenle_baslik_ara(e) {
	}

	queryDuzenle(e) {
		super.queryDuzenle(e);
		
		const {mfSinif} = this;
		const tableAlias = e.alias || mfSinif.tableAlias;
		const {table} = mfSinif;
		const {rRapor, filtreRecs} = e;
		let {stm} = e;
		
		const basSent = e.basSent = stm.sent = new MQSent({ from: `${table} ${tableAlias}` });
		const _e = {
			modelRapor: this, stm: stm, sent: basSent, attrListesi: rRapor.tumAttrListesi,
			filtreRecs: filtreRecs, sahalarAlinmasin: true
		};
		mfSinif.loadServerData_queryOlustur(_e);
		mfSinif.raporQueryDuzenle(_e);
		stm = _e.stm;

		const tbWhereClause = this.getTBWhereClause({ alias: tableAlias });
		for (const sent of stm.getSentListe()) {
			sent.sahalarVeGroupByReset();
			sent.where.birlestir(tbWhereClause)
		}
		this.queryKolonlariDuzenle(_e);
		stm = _e.stm;

		for (const sent of stm.getSentListe()) {
			sent.groupByOlustur();
			sent.gereksizTablolariSil({ disinda: [tableAlias] })
		}

		e.stm = stm
	}
}
