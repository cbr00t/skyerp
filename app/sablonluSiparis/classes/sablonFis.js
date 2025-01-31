class MQSablonOrtak extends MQDetayliVeAdi {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get gereksizTablolariSilYapilirmi() { return false }
	static get detaySinif() { return MQSablonOrtakDetay } static get listeFisSinif() { return SablonluSiparisListeOrtakFis } static get fisSinif() { return this.listeFisSinif?.fisSinif }
	static get fisIcinDetaySinif(){ return this.listeFisSinif?.fisIcinDetaySinif } static get fisIcinDetayTable(){ return this.listeFisSinif?.fisIcinDetayTable }
	static get table() { return 'hizlisablon' } static get tableAlias() { return 'sab' } static get adiEtiket() { return 'Şablon Adı' }
	static get kodListeTipi() { return this.listeFisSinif.kodListeTipi } static get sinifAdi() { return this.listeFisSinif.sinifAdi } static get tumKolonlarGosterilirmi() { return true }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); let {secimler: sec} = e;
		sec.grupTopluEkle([ { kod: 'inst', etiket: 'Şablon', kapali: false } ])
		sec.secimTopluEkle({
			inst: new SecimBasSon({ etiket: 'Şablon', mfSinif: this, grupKod: 'inst' }),
			aciklama: new SecimOzellik({ etiket: 'Şablon Adı', grupKod: 'inst' })
		});
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => {
			let {tableAlias: alias} = this, {sayacSaha, adiSaha} = this;
			wh.basiSonu(sec.inst, `${alias}.${sayacSaha}`).ozellik(sec.aciklama, `${alias}.${adiSaha}`)
		})
	}
	static listeEkrani_init(e) { super.listeEkrani_init(e); let gridPart = e.gridPart ?? e.sender; gridPart.tarih = today(); gridPart.rowNumberOlmasin() }
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); let gridPart = e.gridPart ?? e.sender, {header, islemTuslariPart} = gridPart, {layout, sol} = islemTuslariPart;
		let {rootBuilder: rfb} = e; rfb.setInst(gridPart).addStyle(e => `$elementCSS { --header-height: 140px !important } $elementCSS .islemTuslari { overflow: hidden !important }`);
		sol.addClass('flex-row'); rfb.addDateInput('tarih', 'İşlem Tarihi').setParent(sol).etiketGosterim_yok()
			.degisince(({ builder: fbd }) => fbd.rootPart.tazeleDefer(e))
			.addStyle(e => `$elementCSS { margin-left: 30px } $elementCSS > input { width: 130px !important }`);
		rfb.addModelKullan('mustKod', 'Müşteri').setParent(header).comboBox().setMFSinif(MQCari).autoBind().degisince(({ builder: fbd }) => fbd.rootPart.tazeleDefer(e))
	}
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); $.extend(e.args, { rowsHeight: 60, groupable: false, selectionMode: 'none' }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); e.liste.push(...[
			new GridKolon({ belirtec: 'topsayi', text: 'Sip.Sayı', genislikCh: 10 }).noSql().tipNumerik(),
			new GridKolon({ belirtec: 'yeni', text: ' ', genislikCh: 8 }).noSql().tipButton('+').onClick(_e => { this.yeniIstendi({ ...e, ..._e }) })
		])
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let basitmi = e.basit ?? e.basitmi; if (basitmi) { return }
		let {tableAlias: alias, fisSinif} = this, {fisIcinDetayTable: detayTable, mustSaha} = fisSinif, gridPart = e.gridPart ?? e.sender ?? {};
		let {tarih, mustKod} = gridPart, {subeKod} = config.session, {stm, sent} = e;
		sent.sahalar.addWithAlias(alias, 'bvadegunkullanilir', 'vadegunu', 'emailadresler'); stm.with.add(sent.asTmpTable('hamveri'));
		sent = e.sent = stm.sent = new MQSent({
			from: 'hamveri ham', fromIliskiler: [{ from: `${fisSinif.table} fis`, iliski: 'ham.kaysayac = fis.sablonsayac' }],
			where: [{ alias: 'fis', birlestirDict: fisSinif.varsayilanKeyHostVars() }, `fis.kapandi = ''`],
			sahalar: ['fis.sablonsayac', 'MAX(fis.fisnox) fisnox', 'COUNT(*) topsayi']
		}).fisSilindiEkle(); if (subeKod != null) { sent.where.degerAta(subeKod, 'fis.bizsubekod') }
		if (tarih) { sent.where.degerAta(tarih, 'fis.tarih') } if (mustKod) { sent.where.degerAta(mustKod, `fis.${mustSaha}`) }
		sent.groupByOlustur(); stm.with.add(sent.asTmpTable('toplamlar'));
		sent = e.sent = stm.sent = new MQSent({
			from: 'hamveri ham', fromIliskiler: [{ alias: 'ham', leftJoin: 'toplamlar xtop', on: 'ham.kaysayac = xtop.sablonsayac' }],
			sahalar: [
				'ham.kaysayac', 'ham.aciklama', 'ham.bvadegunkullanilir', 'ham.vadegunu', 'ham.emailadresler',
				'COALESCE(xtop.topsayi, 0) topsayi', `COALESCE(xtop.fisnox, '') fisnox`
			]
		});
		stm.orderBy.liste = ['aciklama']
	}
	static loadServerData_detaylar(e) {
		let {detaySinif} = this, {parentRec} = e; return detaySinif.loadServerData(e).then(recs => {
			for (let rec of recs) { rec._parentRec = parentRec }
			return recs
		})
	}
	static async yeniIstendi(e) {
		try {
			let {sender: gridPart} = e, {listeFisSinif} = this; if (!listeFisSinif) { return null }
			let {tarih, mustKod} = gridPart, {rec} = e, {kaysayac: sablonSayac} = rec;
			let fis = new listeFisSinif({ sablonSayac, tarih, mustKod }), result = await fis.yukle({ ...e, rec: undefined }); if (!result) { return }
			let islem = 'yeni', kaydedince = e => gridPart.tazeleDefer();
			return fis.tanimla({ islem, kaydedince })
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Yeni'), 100); throw ex }
	}
	static async onaylaIstendi(e) {
		try {
			let gridPart = e.sender.parentPart, {listeFisSinif} = this; if (!listeFisSinif) { return null }
			let {tarih, mustKod} = gridPart, {rec} = e, {kaysayac: sayac, bonayli: onaylimi, _parentRec: parentRec} = rec, {kaysayac: sablonSayac} = parentRec;
			if (onaylimi) { throw { isError: true, errorText: 'Bu sipariş zaten onaylanmış' } }
			return true
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Onayla'), 100); throw ex }
	}
	static async degistirIstendi(e) {
		try {
			let gridPart = e.sender.parentPart, {listeFisSinif} = this; if (!listeFisSinif) { return null }
			let {tarih, mustKod} = gridPart, {rec} = e, {kaysayac: fisSayac, bonayli: onaylimi, _parentRec: parentRec} = rec, {kaysayac: sablonSayac} = parentRec;
			let fis = new listeFisSinif({ fisSayac, sablonSayac, tarih, mustKod }), result = await fis.yukle({ ...e, parentRec, rec: undefined }); if (!result) { return }
			let islem = onaylimi ? 'izle' : 'degistir', kaydedince = e => gridPart.tazeleDefer();
			return await fis.tanimla({ islem, kaydedince })
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Değiştir'), 100); throw ex }
	}
	static async silIstendi(e) {
		try {
			let gridPart = e.sender.parentPart, {listeFisSinif} = this; if (!listeFisSinif) { return null }
			let {tarih, mustKod} = gridPart, {rec} = e, {kaysayac: fisSayac, bonayli: onaylimi, _parentRec: parentRec} = rec, {kaysayac: sablonSayac} = parentRec;
			if (onaylimi) { throw { isError: true, errorText: 'Onaylı sipariş silinemez' } }
			let fis = new listeFisSinif({ fisSayac, sablonSayac, tarih, mustKod }), result = await fis.yukle({ ...e, parentRec, rec: undefined }); if (!result) { return }
			let islem = 'sil', kaydedince = e => gridPart.tazeleDefer();
			return await fis.tanimla({ islem, kaydedince })
		}
		catch (ex) { setTimeout(() => hConfirm(getErrorText(ex), 'Değiştir'), 100); throw ex }
	}
}
class MQSablon extends MQSablonOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get detaySinif() { return MQSablonDetay }
	static get listeFisSinif() { return SablonluSiparisListeFis }
}
class MQKonsinyeSablon extends MQSablonOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get detaySinif() { return MQKonsinyeSablonDetay }
	static get listeFisSinif() { return SablonluKonsinyeSiparisListeFis }
}

class MQSablonOrtakDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sablonSinif() { return MQSablonOrtak }
	static get fisSinif() { return this.sablonSinif.fisSinif } static get table() { return this.fisSinif.table }
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); $.extend(e.args, {
			rowsHeight: 50, groupable: true, filterable: true, showGroupsHeader: true, adaptive: false })
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); let {liste} = e, {sablonSinif} = this;
		liste.push(...[
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 15 }).tipDate(),
			new GridKolon({ belirtec: 'fisnox', text: 'Sip. No', genislikCh: 20 }),
			new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri' }),
			new GridKolon({ belirtec: 'sevkadresadi', text: 'Sevk Adres', genislikCh: 30 }),
			new GridKolon({ belirtec: 'bonayli', text: 'Onay?', genislikCh: 8 }).tipBool(),
			new GridKolon({ belirtec: 'onayla', text: ' ', genislikCh: 5 }).noSql().tipButton('O').onClick(_e => { sablonSinif.onaylaIstendi({ ...e, ..._e }) }),
			new GridKolon({ belirtec: 'degistir', text: ' ', genislikCh: 5 }).noSql().tipButton('D').onClick(_e => { sablonSinif.degistirIstendi({ ...e, ..._e }) }),
			new GridKolon({ belirtec: 'sil', text: ' ', genislikCh: 5 }).noSql().tipButton('X').onClick(_e => { sablonSinif.silIstendi({ ...e, ..._e }) })
		])
	}
	static loadServerDataDogrudan(e) { let stm = e.query = e.stm = new MQStm(); e.sent = stm.sent; this.loadServerData_queryDuzenle(e); return super.loadServerData_querySonucu(e) }
	static loadServerData_queryDuzenle(e) {
		let {sender: gridPart, parentRec} = e, {kaysayac: sablonSayac} = parentRec, {tarih, mustKod} = gridPart, {subeKod} = config.session;
		let {fisSinif} = this, {table, fisIcinDetayTable: detayTable, mustSaha} = fisSinif;
		let {stm} = e, sent = stm.sent = new MQSent({
			from: `${table} fis`,
			where: [{ alias: 'fis', birlestirDict: fisSinif.varsayilanKeyHostVars() }, { degerAta: sablonSayac, saha: 'fis.sablonsayac' }, `fis.kapandi = ''`],
			sahalar: [
				'fis.kaysayac', 'fis.tarih', 'fis.fisnox', `fis.${mustSaha} mustkod`, 'car.birunvan mustunvan',
				`(case when fis.onaytipi = 'BK' or fis.onaytipi = 'ON' then 0 else 1 end) bonayli`
			]
		}).fis2CariBagla().fisSilindiEkle(); if (subeKod != null) { sent.where.degerAta(subeKod, 'fis.bizsubekod') }
		if (tarih) { sent.where.degerAta(tarih, 'fis.tarih') } if (mustKod) { sent.where.degerAta(mustKod, `fis.${mustSaha}`) }
		stm.orderBy.add('tarih DESC', 'fisnox DESC')
	}
}
class MQSablonDetay extends MQSablonOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sablonSinif() { return MQSablon }
}
class MQKonsinyeSablonDetay extends MQSablonOrtakDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sablonSinif() { return MQKonsinyeSablon }
}
