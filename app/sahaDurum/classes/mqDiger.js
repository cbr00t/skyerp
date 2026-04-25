class MQCari extends MQKAOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get dataKey() { return 'cari' }
	static get sinifAdi() { return 'Müşteriler' } static get tableAlias() { return 'car' }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); let {liste} = e;
		let colDef = liste.find(colDef => colDef.belirtec == 'kod'); $.extend(colDef, { genislikCh: 20 }); 
		colDef = liste.find(colDef => colDef.belirtec == 'aciklama'); $.extend(colDef, { genislikCh: null });
		liste.push(new GridKolon({ belirtec: 'eMail', text: 'e-Mail' }) /*new GridKolon({ belirtec: 'plasiyerKod', text: 'Plasiyer', genislikCh: 16 })*/)
	}
	static gridVeriYuklendi(e) { /* let {grid} = e; grid.jqxGrid('groups', ['plasiyerKod']) */ }
	static loadServerData(e) { return this.loadServerDataFromMustBilgi(e) }
	static async loadServerDataDogrudan(e) {
		e = e || {}; await super.loadServerDataDogrudan(e); let {wsArgs} = e, {session} = config, {loginTipi, user} = session;
		let selector = loginTipi == 'plasiyerLogin' ? 'plasiyerKod' : loginTipi == 'musteriLogin' ? 'kod' : null;
		if (user) { switch (loginTipi) { case 'plasiyerLogin': wsArgs.plasiyerKod = user; break; case 'musteriLogin': wsArgs.mustKod = user; break } }
		let {cariTipKod} = app.params.config; if (cariTipKod) { $.extend(wsArgs, { cariTipKod }) }
		let recs = await app.wsPlasiyerIcinCariler(wsArgs); if (recs && selector && user) { recs = recs.filter(rec => rec[selector] == user) }
		for (let rec of recs) {
			let {plasiyerKod, plasiyerAdi} = rec; let plasiyerText = plasiyerKod;
			if (plasiyerAdi) { plasiyerText += ` - ${plasiyerAdi}` }
			rec.plasiyerText = plasiyerText
		}
		return recs
	}
}

class MQKapanmayanHesaplar extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get dataKey() { return 'kapanmayanHesap' } static get sinifAdi() { return 'Kapanmayan Hesaplar' }
	get tableAlias() { return 'khes' }

	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		extend(args, { showGroupAggregates: false })
	}
	static ekCSSDuzenle({ dataField: belirtec, rec, result }) {
		super.ekCSSDuzenle(...arguments)
		if (belirtec == 'bedel') {
			result.push('bold')
			let odenen = asFloat(rec.bedel)
			if (odenen)
				result.push('royalblue')
		}
		else if (belirtec == 'acikkisim') {
			let { acikkisim: v } = rec
			if (v)
				result.push('fs-120', 'bold', v < 0 ? 'orangered' : 'forestgreen')
		}
		
		if (rec.gecikmegun) {
			if (belirtec == 'gecikmegun')
				result.push('fs-110', 'bold', 'orangered')
			result.push('bg-very-lightred')
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let tarihGosterim = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) =>
			changeTagContent(html, dateToString(asDate(value)) ?? '')
		let { cariHareketTakipNo } = app.params.tablet
		liste.push(...[
			new GridKolon({ belirtec: 'isladi', text: 'İşlem Adı', maxWidth: 40 * katSayi_ch2Px, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'belgeNox', text: 'Belge Seri/No', genislikCh: 20, filterType: 'input' }),
			new GridKolon({
				belirtec: 'tarih', text: 'Tarih', genislikCh: 12, agggregates: [],
				cellsRenderer: (...args) => tarihGosterim(...args)
			}).tipDate(),
			new GridKolon({
				belirtec: 'vade', text: 'Vade', genislikCh: 12, agggregates: [],
				cellsRenderer: (...args) => tarihGosterim(...args)
			}).tipDate(),
			new GridKolon({
				belirtec: 'bedel', text: 'Orj. Bedel', genislikCh: 15,
				aggregates: [{ TOPLAM: gridDipIslem_sum }]
			}).tipDecimal_bedel(),
			new GridKolon({
				belirtec: 'acikkisim', text: 'Açık Kısım', genislikCh: 15, cellClassName: 'bold',
				aggregates: [{ TOPLAM: gridDipIslem_sum }]
			}).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'gecikmegun', text: 'Gecikme', genislikCh: 8 }).tipDecimal(),
			new GridKolon({ belirtec: 'gelecekgun', text: 'Gel.Gün', genislikCh: 8 }).tipDecimal(),
			( cariHareketTakipNo ? new GridKolon({ belirtec: 'takiptext', text: 'Takip', genislikCh: 45, filterType: 'checkedlist' }) : null )
		].filter(Boolean))
	}
	static orjBaslikListesi_gridInit({ gridPart, grid }) {
		super.orjBaslikListesi_gridInit(...arguments)
		grid ??= gridPart?.grid
		let { cariHareketTakipNo } = app.params.tablet
		if (cariHareketTakipNo)
			grid.jqxGrid({ groupsExpandedByDefault: true, groups: ['takiptext'] })
	}
	static loadServerData(e = {}) {
		e.mustKod ??= e.parentRec?.must
		return this.loadServerDataFromMustBilgi(e)
	}
	static async loadServerDataDogrudan({ wsArgs } = {}) {
		await super.loadServerDataDogrudan(...arguments)
		let recs = await app.wsTicKapanmayanHesap(wsArgs)
		if (!recs)
			return recs

		let _alacakmi = null
		let must2Recs = {}
		for (let rec of recs) {
			let mustKod = rec.must ?? rec.mustkod
			;(must2Recs[mustKod] ??= []).push(rec)
			
			let { isaretligecikmegun: isaretliGecikmeGun } = rec
			let { bedel, acikkisim: acikKisim, takipno: takipNo, takipadi: takipAdi } = rec
			// if (mustKod == 'M05D47577') { debugger }
			if (isaretliGecikmeGun != null) {
				isaretliGecikmeGun = isString(isaretliGecikmeGun) ? asDate(isaretliGecikmeGun) : isaretliGecikmeGun
				if (isDate(isaretliGecikmeGun))
					isaretliGecikmeGun = ((isaretliGecikmeGun - minDate) / Date_OneDayNum) + 1
				rec.gecikmegun = rec.gelecekgun = 0
				;{
					let selector = isaretliGecikmeGun < 0 ? 'gelecekgun' : 'gecikmegun'
					rec[selector] += Math.abs(isaretliGecikmeGun)
				}
				delete rec.isaretligecikmegun
			}
			if (takipNo)
				rec.takiptext = `<b class="gray">${takipNo}</b>-${takipAdi}`
			rec.odenen = (bedel || 0) - (acikKisim || 0)
			rec._vadeVeyaTarih = asDate(rec.vade ?? rec.tarih)
			rec.vade ??= ''
		}

		let degistimi = false
		for (let [mustKod, _recs] of entries(must2Recs)) {
			let dengelimi = true
			let _alacakmi = null
			for (let { acikkisim: v } of _recs) {
				let buAlacakmi = v < 0
				if (_alacakmi == null)
					_alacakmi = buAlacakmi
				else if (_alacakmi != buAlacakmi) {
					dengelimi = false
					break
				}
			}
			if (dengelimi)
				continue

			let pDizi = [], nDizi = []
			;_recs.forEach(r => {
				let target = r.acikkisim < 0 ? nDizi : pDizi
				target.push(r)
			})
			
			let pi = 0, ni = 0
			while (pi < pDizi.length && ni < nDizi.length) {
				let pr = pDizi[pi], nr = nDizi[ni]
				let p = pr.acikkisim || 0
				let n = abs(nr.acikkisim || 0)
				let kucuk = min(p, n)
				
				// mahsuplaşma
				pr.acikkisim = roundToFra2(pr.acikkisim - kucuk)
				nr.acikkisim = roundToFra2(nr.acikkisim + kucuk)     // negatifi sıfıra yaklaştırır
				if (!pr.acikkisim) pi++
				if (!nr.acikkisim) ni++
			}
			if (pi || ni) {
				must2Recs[mustKod] = _recs = [
					...pDizi.slice(pi),
					...nDizi.slice(ni)
				]
				degistimi = true
			}
		}
		
		if (degistimi)
			recs = values(must2Recs).flat()
		
		recs.sort((_a, _b) => {    // reverse sort
			let a = { takipNo: _a.takipno ?? '', vadeVeyaTarih: asDate(_a._vadeVeyaTarih)?.getTime() }
			let b = { takipNo: _b.takipno ?? '', vadeVeyaTarih: asDate(_b._vadeVeyaTarih)?.getTime() }
			let cmp_takipNo = b.takipNo > a.takipNo ? 1 : b.takipNo < a.takipNo ? -1 : 0
			let cmp_tarih = b.vadeVeyaTarih - a.vadeVeyaTarih
			return cmp_takipNo || cmp_tarih
		})
		
		return recs
	}
}

class MQKapanmayanHesaplar_Yaslandirma extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get dataKey() { return MustBilgi.yaslandirmaKey }
	static get sinifAdi() { return 'Kapanmayan Hesaplar (Total Bilgi)' }
	get tableAlias() { return 'ktot' }

	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		extend(args, {
			sortable: false, groupable: false, showFilterRow: false,
			rowsHeight: 30, adaptive: false
		})
	}
	static ekCSSDuzenle({ dataField: belirtec, rec, result }) {
		super.ekCSSDuzenle(...arguments)
		if (rec?.toplammi) {
			result.push('bg-lightroyalblue', 'bold')
			if (belirtec == 'gecmis')
				result.push('red')
			else if (belirtec == 'gelecek')
				result.push('green')
		}
		else {
			if (belirtec == 'gecmis')
				result.push('bg-lightpink')
			else if (belirtec == 'gelecek')
				result.push('bg-lightgreen')
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(...[
			new GridKolon({ belirtec: 'kademeText', text: 'Kademe', genislikCh: 10, columnType: 'n', align: 'right' }),
			new GridKolon({ belirtec: 'gecmis', text: 'Geçmiş', genislikCh: 14 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'gelecek', text: 'Gelecek', genislikCh: 14 }).tipDecimal_bedel()
		])
	}
	static loadServerData({ mustKod }) {
		let recs = this.loadServerDataFromMustBilgi(...arguments)
		if (!recs)
			return recs
		
		let toplam = { gecmis: 0, gelecek: 0 }
		/*if (mustKod == 'M05D48928') { debugger }*/
		for (let r of recs) {
			let rec = { ...r }
			let { isaretligecikmegun: isaretliGecikmeGun } = rec
			if (isaretliGecikmeGun != null) {
				isaretliGecikmeGun = isString(isaretliGecikmeGun) ? asDate(isaretliGecikmeGun) : isaretliGecikmeGun
				if (isDate(isaretliGecikmeGun))
					isaretliGecikmeGun = ((isaretliGecikmeGun - minDate) / Date_OneDayNum) + 1
				rec.gecmis = rec.gelecek = 0
				rec[isaretliGecikmeGun < 0 ? 'gelecek' : 'gecmis'] += Math.abs(isaretliGecikmeGun)
				delete rec.isaretligecikmegun
			}
			;['gecmis', 'gelecek'].forEach(k =>
				toplam[k] += rec[k])
		}
		
		let recToplam = { toplammi: true, kademeText: `<u>TOPLAM</u> =&gt;` }
		for (let key in toplam)
			recToplam[key] = toplam[key]
		
		recs = [recToplam, ...recs]
		
		return recs
	}
	static loadServerDataFromMustBilgi(e) {
		let recs = super.loadServerDataFromMustBilgi(e)
		if (!isArray(recs))
			recs = values(recs || {})
		return recs
	}
}
class MQKapanmayanHesaplar_Dip extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get dataKey() { return 'dip' }
	static get sinifAdi() { return 'Dip' } get tableAlias() { return 'dip' }
	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments);
		$.extend(args, { sortable: false, groupable: false, showFilterRow: false, rowsHeight: 30, adaptive: false })
	}
	static ekCSSDuzenle({ dataField: belirtec, rec, result }) {
		super.ekCSSDuzenle(...arguments)
		if (rec?.toplammi)
			result.push('bg-lightroyalblue', 'bold')
		
		if (belirtec == 'veri') {
			let { veri: bedel } = rec
			result.push('bold');
			if (bedel)
				result.push(bedel < 0 ? 'red' : 'green')
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments); liste.push(...[
			new GridKolon({ belirtec: 'etiket', text: ' ', genislikCh: 23 }),
			new GridKolon({ belirtec: 'veri', text: 'Bedel', genislikCh: 16 }).alignRight()
		])
	}
	static loadServerData(e) {
		e = e || {}; e.mustKod = e.mustKod ?? e.parentRec?.must;
		let _recs = this.loadServerDataFromMustBilgi(e); if (!_recs?.length) { return [] }
		let donusum = {
			risklimiti: 'Risk Limiti', vaderisklimiti: 'Vade R.Limiti', kalanrisk: 'Kalan Risk', vadelikalanrisk: 'Vadeli K.Risk', vadelikisim: 'Vadeli Kısım',
			ortalamavade: 'Ort. Vade', vadeliortalamavade: 'Vadeli Ort. Vade'
		};
		let recs = []; for (let _rec of _recs) {
			let rec = {}; for (let [key, etiket] of Object.entries(donusum)) {
				let veri = _rec[key]; if (!veri) { continue }
				if (typeof veri == 'string') { veri = asDate(veri) }
				if (typeof veri == 'number') { veri = fra2Str(veri) }
				else if (!isInvalidDate(veri)) { veri = dateKisaString(veri) }
				recs.push({ etiket, veri })
			}
		}
		return recs
	}
	static async loadServerDataDogrudan({ wsArgs }) {
		await super.loadServerDataDogrudan(...arguments);
		let {cariTipKod} = app.params.config; if (cariTipKod) { wsArgs.cariTipKod = cariTipKod }
		let recs = await app.wsTopluDurum(wsArgs); return recs
	}
	static loadServerDataFromMustBilgi(e) {
		let recs = super.loadServerDataFromMustBilgi(e);
		if (!$.isArray(recs)) { recs = Object.values(recs || {}) }
		return recs
	}
}

class MQCariEkstre extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get dataKey() { return 'cariEkstre' } static get sinifAdi() { return 'Cari Ekstreler' }
	get tableAlias() { return 'ceks' } static get gridDetaylimi() { return true }
	static get detaySinif() { return MQCariEkstre_Detay }
	static get tabloKolonlari_detaylar() { return this.detaySinif.orjBaslikListesi }

	static ekCSSDuzenle({ rowIndex, dataField: belirtec, rec, result }) {
		super.ekCSSDuzenle(...arguments)
		if (rec?.toplammi)
			result.push('bg-lightroyalblue', 'bold')
		
		if (belirtec == 'borcbedel' || belirtec == 'alacakbedel' || belirtec == 'bedel' || belirtec == 'bakiye') {
			let { [belirtec]: value } = rec
			result.push('bold')
			value = Number(value)
			if (value) {
				if (belirtec == 'alacakbedel')
					value = -value
				result.push(value < 0 ? 'red' : 'green')
			}
		}
		if (rowIndex === 0 && belirtec == 'bakiye')
			result.push('fs-130 bolder royalblue')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let tarihGosterim = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) =>
			changeTagContent(html, dateToString(asDate(value)) ?? '')
		let { cariHareketTakipNo } = app.params.tablet
		liste.push(...[
			/*new GridKolon({ belirtec: 'must', text: 'Müşteri', genislikCh: 16 }),*/
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 11, cellsRenderer: (...args) => tarihGosterim(...args) }).tipDate(),
			new GridKolon({ belirtec: 'fisnox', text: 'Belge Seri/No', genislikCh: 18 }),
			new GridKolon({ belirtec: 'isladi', text: 'İşlem Adı', genislikCh: 15 }),
			new GridKolon({ belirtec: 'sonuciskoran', text: 'İsk%', genislikCh: 6, aggregates: [{ ORT: gridDipIslem_avg }] }).tipDecimal(),
			new GridKolon({ belirtec: 'borcbedel', text: 'Borç Bedel.', genislikCh: 13, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'alacakbedel', text: 'Alacak Bedel.', genislikCh: 13, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel(),
			// new GridKolon({ belirtec: 'bedel', text: 'İşr. Bedel.', genislikCh: 13, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'bakiye', text: 'Bakiye', genislikCh: 17 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 9, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal(),
			new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 5, filterType: 'checkedlist' }),
			( cariHareketTakipNo ? new GridKolon({ belirtec: 'takiptext', text: 'Takip No', filterType: 'checkedlist' }) : null )
		].filter(Boolean))
	}
	static loadServerData(e = {}) {
		e.mustKod ??= e.parentRec?.must
		return this.loadServerDataFromMustBilgi(e)
	}
	static async loadServerDataDogrudan({ wsArgs }) {
		await super.loadServerDataDogrudan(...arguments)
		let { cariTipKod } = app.params.config
		if (cariTipKod)
			wsArgs.cariTipKod = cariTipKod
		let must2Bakiye = {}
		let recs = await app.wsTicCariEkstre(wsArgs)
		for (let rec of recs) {
			let { must, bedel, ba, borcbedel: borcBedel, alacakbedel: alacakBedel, takipno: takipNo, takipadi: takipAdi } = rec
			if (bedel == null)
				bedel = rec.bedel = (borcBedel || 0) - (alacakBedel || 0)
			
			if (ba == 'A')
				bedel = -bedel
			if (borcBedel == null && alacakBedel == null) {
				bedel ??= 0
				rec[bedel < 0 ? 'alacakbedel' : 'borcbedel'] = bedel;
				borcBedel = rec.borcbedel; alacakBedel = rec.alacakbedel
			}
			rec.bedel = bedel
			rec.bakiye = must2Bakiye[must] = (must2Bakiye[must] || 0) + bedel
			for (let key of ['borcbedel', 'alacakbedel'])
				rec[key] = Math.abs(rec[key] || 0)
			if (takipNo)
				rec.takiptext = `<b class="gray">${takipNo}</b>-${takipAdi}`
		}
		recs.reverse()
		return recs
	}
	static async loadServerData_detaylar({ parentRec }) {
		let recs = await this.detaySinif.loadServerData(...arguments)
		if (!recs?.length)
			return recs
		let { icerikfissayac: fisSayac } = parentRec
		recs = recs.filter(r =>
			r.icerikfissayac == fisSayac)
		return recs
	}
}
class MQCariEkstre_Detay extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get dataKey() { return 'cariEkstre_detay' }
	static get sinifAdi() { return 'Cari Ekstre (Detay)' }
	get tableAlias() { return 'har' }

	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(...[
			new GridKolon({ belirtec: 'shkod', text: 'Stok Kod', maxWidth: 15 * katSayi_ch2Px }),
			new GridKolon({ belirtec: 'stokadi', text: 'Stok Adı', maxWidth: 40 * katSayi_ch2Px }),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 12, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal(),
			new GridKolon({ belirtec: 'fiyat', text: 'Fiyat', genislikCh: 15, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_fiyat(),
			new GridKolon({ belirtec: 'sonuciskoran', text: 'İsk%', genislikCh: 6, aggregates: [{ ORT: gridDipIslem_avg }] }).tipDecimal(),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 15, cellClassName: 'bold', aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal_bedel()
		])
	}
	static loadServerData(e = {}) {
		e.mustKod ??= e.parentRec?.must
		return this.loadServerDataFromMustBilgi(e)
	}
	static async loadServerDataDogrudan({ wsArgs } = {}) {
		await super.loadServerDataDogrudan(...arguments)
		let { cariTipKod } = app.params.config
		if (cariTipKod)
			extend(wsArgs, { cariTipKod })
		return await app.wsTicCariEkstre_icerik(wsArgs)
	}
}
