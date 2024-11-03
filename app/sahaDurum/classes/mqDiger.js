class MQCari extends MQKAOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get dataKey() { return 'cari' }
	static get sinifAdi() { return 'Müşteriler' } static get tableAlias() { return 'car' }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		let colDef = liste.find(colDef => colDef.belirtec == 'kod'); $.extend(colDef, { genislikCh: 20 }); 
		colDef = liste.find(colDef => colDef.belirtec == 'aciklama'); $.extend(colDef, { genislikCh: null });
		liste.push(new GridKolon({ belirtec: 'eMail', text: 'e-Mail' }) /*new GridKolon({ belirtec: 'plasiyerKod', text: 'Plasiyer', genislikCh: 16 })*/)
	}
	static gridVeriYuklendi(e) { /* const {grid} = e; grid.jqxGrid('groups', ['plasiyerKod']) */ }
	static loadServerData(e) { return this.loadServerDataFromMustBilgi(e) }
	static async loadServerDataDogrudan(e) {
		e = e || {}; await super.loadServerDataDogrudan(e); const {wsArgs} = e, {session} = config, {loginTipi, user} = session;
		const selector = loginTipi == 'plasiyerLogin' ? 'plasiyerKod' : loginTipi == 'musteriLogin' ? 'kod' : null;
		if (user) { switch (loginTipi) { case 'plasiyerLogin': wsArgs.plasiyerKod = user; break; case 'musteriLogin': wsArgs.mustKod = user; break } }
		let {cariTipKod} = app.params.config; if (cariTipKod) { $.extend(wsArgs, { cariTipKod }) }
		let recs = await app.wsPlasiyerIcinCariler(wsArgs); if (recs && selector && user) { recs = recs.filter(rec => rec[selector] == user) }
		for (const rec of recs) {
			const {plasiyerKod, plasiyerAdi} = rec; let plasiyerText = plasiyerKod;
			if (plasiyerAdi) { plasiyerText += ` <b>${plasiyerAdi}</b>` } rec.plasiyerText = plasiyerText
		}
		return recs
	}
}
class MQKapanmayanHesaplar extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get dataKey() { return 'kapanmayanHesap' } static get sinifAdi() { return 'Kapanmayan Hesaplar' } get tableAlias() { return 'khes' }
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const belirtec = e.dataField, {rec, result} = e;
		if (belirtec == 'acikkisim') { result.push('red', 'bold') }
		if (belirtec == 'bedel') { const odenen = asFloat(rec.bedel); result.push('bold'); if (odenen < 0) { result.push('red') } else if (odenen > 0) { result.push('green') } }
		if (!!rec.gecikmegun) { result.push('bg-lightpink') } /*else if (!!rec.gelecekgun) result.push('bg-lightgreen')*/
	}
	static orjBaslikListesiDuzenle(e) {
		const tarihGosterim = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => changeTagContent(html, dateToString(asDate(value)));
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'isladi', text: 'İşlem Adı', maxWidth: 40 * katSayi_ch2Px, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'belgeNox', text: 'Belge Seri/No', genislikCh: 20, filterType: 'input' }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 12, cellsRenderer: (...args) => tarihGosterim(...args) }).tipDate(),
			new GridKolon({ belirtec: 'vade', text: 'Vade', genislikCh: 12, cellsRenderer: (...args) => tarihGosterim(...args) }).tipDate(),
			new GridKolon({ belirtec: 'bedel', text: 'Orj. Bedel', genislikCh: 15 , aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'acikkisim', text: 'Açık Kısım', genislikCh: 15, cellClassName: 'bold', aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'gecikmegun', text: 'Gecikme', genislikCh: 8 }).tipDecimal(), new GridKolon({ belirtec: 'gelecekgun', text: 'Gel.Gün', genislikCh: 8  }).tipDecimal()
		)
	}
	static loadServerData(e) { return this.loadServerDataFromMustBilgi(e) }
	static async loadServerDataDogrudan(e) {
		e = e || {}; await super.loadServerDataDogrudan(e); const {wsArgs} = e;
		const recs = await app.wsTicKapanmayanHesap(wsArgs); for (const rec of recs) { const {bedel, acikkisim} = rec; rec.odenen = (bedel || 0) - (acikkisim || 0) }
		return recs
	}
}
class MQCariEkstre extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get dataKey() { return 'cariEkstre' } static get sinifAdi() { return 'Cari Ekstreler' } get tableAlias() { return 'ceks' }
	static get detaySinif() { return MQCariEkstre_Detay } static get gridDetaylimi() { return true }
	static orjBaslikListesiDuzenle(e) {
		const tarihGosterim = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => changeTagContent(html, dateToString(asDate(value)));
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			/*new GridKolon({ belirtec: 'must', text: 'Müşteri', genislikCh: 16 }),*/
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 12, cellsRenderer: (...args) => tarihGosterim(...args) }).tipDate(),
			new GridKolon({ belirtec: 'fisnox', text: 'Belge Seri/No', genislikCh: 20 }),
			new GridKolon({ belirtec: 'isladi', text: 'İşlem Adı', maxWidth: 40 * katSayi_ch2Px }),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 10, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal(),
			new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 5 }),
			new GridKolon({ belirtec: 'sonuciskoran', text: 'İsk%', genislikCh: 6, aggregates: [{ ORT: gridDipIslem_avg }] }).tipDecimal(),
			new GridKolon({ belirtec: 'borcbedel', text: 'Borç Bedel.', genislikCh: 16, cellClassName: 'green', aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel(),
				/*cellClassName: (colDef, rowIndex, belirtec, value, rec) => { let result = [belirtec]; result.push(asFloat(value) < 0 ? 'red' : 'royalblue bold'); return result.join(' ') },*/
			new GridKolon({ belirtec: 'alacakbedel', text: 'Alacak Bedel.', genislikCh: 16, cellClassName: 'red', aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel()
		)
	}
	static loadServerData(e) { return this.loadServerDataFromMustBilgi(e) }
	static async loadServerDataDogrudan(e) {
		e = e || {}; await super.loadServerDataDogrudan(e); const {wsArgs} = e;
		let {cariTipKod} = app.params.config; if (cariTipKod) { wsArgs.cariTipKod = cariTipKod }
		return await app.wsTicCariEkstre(wsArgs)
	}
	static get tabloKolonlari_detaylar() { return this.detaySinif.orjBaslikListesi }
	static async loadServerData_detaylar(e) {
		let recs = await this.detaySinif.loadServerData(e); if (!recs?.length) return recs
		const {parentRec} = e, fisSayac = parentRec.icerikfissayac; recs = recs.filter(rec => rec.icerikfissayac == fisSayac); return recs
	}
}
class MQCariEkstre_Detay extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get dataKey() { return 'cariEkstre_detay' } static get sinifAdi() { return 'Cari Ekstre (Detay)' } get tableAlias() { return 'har' }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'shkod', text: 'Stok Kod', maxWidth: 13 * katSayi_ch2Px }),
			new GridKolon({ belirtec: 'stokadi', text: 'Stok Adı', maxWidth: 40 * katSayi_ch2Px }),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 10, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal(),
			new GridKolon({ belirtec: 'fiyat', text: 'Fiyat', genislikCh: 13, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_fiyat(),
			new GridKolon({ belirtec: 'sonuciskoran', text: 'İsk%', genislikCh: 6, aggregates: [{ ORT: gridDipIslem_avg }] }).tipDecimal(),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 13, cellClassName: 'bold', aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel()
		)
	}
	static loadServerData(e) { e = e || {}; const mustKod = e.mustKod = e.mustKod ?? e.parentRec?.must; return this.loadServerDataFromMustBilgi(e) }
	static async loadServerDataDogrudan(e) {
		e = e || {}; await super.loadServerDataDogrudan(e); const {wsArgs} = e;
		let {cariTipKod} = app.params.config; if (cariTipKod) { wsArgs.cariTipKod = cariTipKod }
		return await app.wsTicCariEkstre_icerik(wsArgs)
	}
}

class MQKapanmayanHesaplar_Yaslandirma extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get dataKey() { return MustBilgi.yaslandirmaKey } static get sinifAdi() { return 'Kapanmayan Hesaplar (Total Bilgi)' } get tableAlias() { return 'ktot' }
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); const {args} = e; $.extend(args, { sortable: false, groupable: false, showFilterRow: false, rowsHeight: 30 }) }
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const belirtec = e.dataField, {rec, result} = e;
		if (rec?.toplammi) { result.push('bg-lightroyalblue', 'bold'); if (belirtec == 'gecmis') { result.push('red') } else if (belirtec == 'gelecek') { result.push('green') } }
		else { if (belirtec == 'gecmis') { result.push('bg-lightpink') } else if (belirtec == 'gelecek') { result.push('bg-lightgreen') }}
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'kademeText', text: 'Kademe', genislikCh: 6, minWidth: 0, columnType: 'n', align: 'right' }),
			new GridKolon({ belirtec: 'gecmis', text: 'Geçmiş', genislikCh: 14 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'gelecek', text: 'Gelecek', genislikCh: 14 }).tipDecimal_bedel()
		)
	}
	static loadServerData(e) {
		let recs = this.loadServerDataFromMustBilgi(e); if (recs) {
			const toplam = { gecmis: 0, gelecek: 0 };
			for (const rec of recs) { for (const key of ['gecmis', 'gelecek']) { toplam[key] = (toplam[key] || 0) + (rec[key] || 0) } };
			const recToplam = { toplammi: true, kademeText: `<u>TOPLAM</u> =&gt;` }; for (const key in toplam) { recToplam[key] = toplam[key] };
			recs = [recToplam, ...recs]
		} return recs
	}
	static loadServerDataFromMustBilgi(e) { let recs = super.loadServerDataFromMustBilgi(e); if (!$.isArray(recs)) { recs = Object.values(recs || {}) } return recs }
}
