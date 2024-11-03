class MQKapanmayanHesaplar extends MQApiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Kapanmayan Hesaplar' }
	static get kodListeTipi() { return 'KAPHES' } static get table() { return 'kapanmayan_hesaplar' } static get tableAlias() { return 'khes' }
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const {rec, dataField: belirtec, result} = e;
		if (belirtec == 'acikkisim') { result.push('red', 'bold') }
		if (belirtec == 'odenen') { const odenen = asFloat(rec.odenen); result.push('bold'); if (odenen < 0) { result.push('red') } else if (odenen > 0) { result.push('green') } }
		if (!!rec.gecikmegun) { result.push('bg-lightpink') } /*else if (!!rec.gelecekgun) result.push('bg-lightgreen')*/
	}
	static orjBaslikListesiDuzenle(e) {
		const tarihGosterim = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => changeTagContent(html, dateToString(asDate(value)));
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'isladi', text: 'İşlem Adı', maxWidth: 40 * katSayi_ch2Px, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'belgeNox', text: 'Belge Seri/No', genislikCh: 20, filterType: 'input' }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 12 /*, cellsRenderer: (...args) => tarihGosterim(...args)*/ }).tipDate(),
			new GridKolon({ belirtec: 'vade', text: 'Vade', genislikCh: 12 /*, cellsRenderer: (...args) => tarihGosterim(...args)*/ }).tipDate(),
			new GridKolon({ belirtec: 'must', text: 'Müşteri', genislikCh: 16 }), new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', genislikCh: 40, sql: 'car.birunvan' }),
			new GridKolon({ belirtec: 'gecikmegun', text: 'Gecikme', genislikCh: 8 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'gelecekgun', text: 'Gel.Gün', genislikCh: 8 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'bedel', text: 'Orj. Bedel', genislikCh: 15 , aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'acikkisim', text: 'Açık Kısım', genislikCh: 15, cellClassName: 'bold', aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel()
		)
	}
	static loadServerDataDogrudan(e) {
		e = e || {}; const {mustKod} = e; let recs = app.wsTicKapanmayanHesap({ mustKod }); if (!recs?.length) { return recs }
		recs.sort((a, b) => (b.vade ?? b.tarih) - (a.vade ?? a.tarih)); return recs
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {tableAlias: alias} = this;
		sent.fromIliski('carmst car', `${alias}.must = car.must`)
	}
}
class MQCariEkstre extends MQApiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Cari Ekstre' }
	static get gridDetaylimi() { return true } static get detaySinif() { return MQCariEkstre_Icerik }
	static get kodListeTipi() { return 'CARIEKSTRE' } static get table() { return 'cari_ekstre' } static get tableAlias() { return 'ceks' }
	static get offlineSahaListe() { return [...super.offlineSahaListe, 'iceriktablotipi', 'icerikfissayac'] }
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const {rec, dataField: belirtec, result} = e;
		if (belirtec == 'alacakbedel') { result.push('red', 'bold') } if (belirtec == 'borcbedel') { result.push('red', 'green') }
	}
	static orjBaslikListesiDuzenle(e) {
		/*const tarihGosterim = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => changeTagContent(html, dateToString(asDate(value)));*/
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 12 /*, cellsRenderer: (...args) => tarihGosterim(...args)*/ }).tipDate(),
			new GridKolon({ belirtec: 'must', text: 'Müşteri', genislikCh: 16 }), new GridKolon({ belirtec: 'mustunvan', text: 'Müşteri Ünvan', genislikCh: 40, sql: 'car.birunvan' }),
			new GridKolon({ belirtec: 'fisnox', text: 'Belge Seri/No', genislikCh: 20 }),
			new GridKolon({ belirtec: 'isladi', text: 'İşlem Adı', maxWidth: 40 * katSayi_ch2Px }),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 10, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal(),
			new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 5 }),
			new GridKolon({ belirtec: 'sonuciskoran', text: 'İsk%', genislikCh: 6, aggregates: [{ ORT: gridDipIslem_avg }] }).tipDecimal(),
			new GridKolon({ belirtec: 'borcbedel', text: 'Borç Bedel.', genislikCh: 16, cellClassName: 'green', aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'alacakbedel', text: 'Alacak Bedel.', genislikCh: 16, cellClassName: 'red', aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel()
		)
	}
	static loadServerDataDogrudan(e) { e = e || {}; const {mustKod} = e; let recs = app.wsTicCariEkstre({ mustKod }); return recs }
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {tableAlias: alias} = this;
		sent.fromIliski('carmst car', `${alias}.must = car.must`)
	}
}
class MQCariEkstre_Icerik extends MQApiOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Cari Ekstre (İçerik)' }
	static get kodListeTipi() { return 'CARIEKSTREICERIK' } static get table() { return 'cari_ekstre_icerik' } static get tableAlias() { return 'har' }
	static get offlineSahaListe() { return [...super.offlineSahaListe, 'iceriktipi', 'icerikfissayac'] }
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const {rec, dataField: belirtec, result} = e;
		if (belirtec == 'alacakbedel') { result.push('red', 'bold') } if (belirtec == 'borcbedel') { result.push('red', 'green') }
	}
	static orjBaslikListesiDuzenle(e) {
		/*const tarihGosterim = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => changeTagContent(html, dateToString(asDate(value)));*/
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'shkod', text: 'Stok Kod', maxWidth: 13 * katSayi_ch2Px }),
			new GridKolon({ belirtec: 'stokadi', text: 'Stok Adı', maxWidth: 40 * katSayi_ch2Px }),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 10, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal(),
			new GridKolon({ belirtec: 'fiyat', text: 'Fiyat', genislikCh: 13, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_fiyat(),
			new GridKolon({ belirtec: 'sonuciskoran', text: 'İsk%', genislikCh: 6, aggregates: [{ ORT: gridDipIslem_avg }] }).tipDecimal(),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 13, cellClassName: 'bold', aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel()
		)
	}
	static loadServerData(e) {
		e = e ?? {}; let {parentRec, fisSayac} = e; if (!fisSayac && parentRec) { fisSayac = parentRec.icerikfissayac }
		if (!fisSayac && parentRec) { return [] }
		let promise_recs = super.loadServerData(e); if (fisSayac) { promise_recs = promise_recs?.then(recs => recs.filter(rec => rec.icerikfissayac == fisSayac)) }
		return promise_recs
	}
	static loadServerDataDogrudan(e) { e = e || {}; const {mustKod} = e; let recs = app.wsTicCariEkstre_icerik({ mustKod }); return recs }
}
