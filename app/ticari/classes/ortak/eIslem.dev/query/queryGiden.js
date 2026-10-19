class EIslemQuery_Giden extends EIslemQuery {
	get gidenmi() { return true }
	get table2Yapi() {
		return {
			...super.table2Yapi,
			piffis: { alias: 'fis', mustSaha: 'must', harTables: { stok: 'pifstok', hizmet: 'pifhizmet' } },
			sipfis: { alias: 'fis', mustSaha: 'must', harTables: { stok: 'sipstok', hizmet: 'siphizmet' } },
			stfis: { alias: 'fis', mustSaha: 'irsmust', harTables: { stok: 'ststok' } },
			topmakbuzara: { alias: 'ara', harTables: { stok: 'topmakbuzstok' } }
		}
	}
	sentOrtakDuzenle(e) {
		super.sentOrtakDuzenle(e)
		let { sqlNull, sqlEmpty, sqlZero } = Hareketci_UniBilgi.ortakArgs
		let { filtremi, filtre } = this
		let { alias = this.getAlias(table) } = e
		let { table, sent, idListe, mustSaha } = e
		let { where: wh, sahalar } = sent
		let stFismi = this.getSTFismi(table)
		let sutMakbuzmu = this.getSutMakbuzmu(table)
		
		switch (table) {
			case 'sipfis': {
				wh.add(`fis.ozeltip = 'E'`, `fis.almsat = 'T'`)
				break
			}
		}

		;{
			sahalar
				.add(`${table.sqlServerDegeri()} _table`)
				.addWithAlias(alias, ...[
					'id', 'kaysayac fisSayac', 'efatuuid uuid',
					'efayrimtipi eIslTip', 'efatonaydurumu onayDurum',
					'efimzats efImzaTS', 'efgonderimts efGonderimTS'
				])
				.addWithAlias('fis',
					'tarih', 'fisnox fisNox')
				.addWithAlias('car',
					'must mustKod', 'birunvan mustUnvan')
		}
		
		if (sutMakbuzmu) {
			sent
				.innerJoin('ara', 'topmakbuzfis fis', 'ara.fissayac = fis.kaysayac')
				.innerJoin('fis', 'topmakbuzstok har', 'ara.kaysayac = har.arasayac')
				.innerJoin('har', 'carmst car', 'ara.mustahsilkod = car.must')
			sahalar.add([
				...['zorunluUUID', 'dvKod'].map(k => `${sqlEmpty} ${k}`),
				'SUM(har.sonuc) sonucBedel'
			])
		}
		else {
			sent.innerJoin('fis', 'carmst car', `fis.${mustSaha} = car.must`)
			sahalar.addWithAlias('fis',
				`zorunluguidstr zorunluUUID`, 'dvkod dvKod')
			
			if (stFismi)
				sahalar.add(`${sqlZero} sonucBedel`)
			else {
				sahalar.add([
					`${new MQCase()
						.when(`RTRIM(fis.dvkod) = ''`, 'fis.net')
						.else('fis.dvnet')
					 } sonucBedel`
				])
			}
		}
	}
	sentSonDuzenle(e) {
		super.sentSonDuzenle(e)
		let { filtremi, filtre } = this
		let { alias = this.getAlias(table), idListe } = e
		let orjSentListe = makeArray(e.sent)
		let sentListe = e.sent = []
		for (let _sent of orjSentListe) {
			let sent = _sent.deepCopy(), { where: wh } = sent
			let args = { ...e, where: wh }
			if (filtremi) {
				if (filtre?.tbWhereClauseDuzenle(args) === false)
					continue
			}
			else
				wh.inDizi(idListe, `${alias}.id`)

			sent
				.groupByOlustur()
				.gereksizTablolariSil(['fis', alias])
			sentListe.push(sent)
		}
	}

	getSTFismi(table) { return table == 'stfis' }
	getSutMakbuzmu(table) { return table == 'topmakbuzara' }
}
