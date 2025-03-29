class CSTekilIslem extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get siraliInstVars() {
		let {_siraliInstVars: result} = this; if (result == null) {
			result = this._siraliInstVars = [
				'tipVeIade', 'islemAdi', 'finAnalizKullanilmaz', 'portfoyTipi', 'portfoyKod', 'portfoyAdi', 'dvKod', 'refBilgiPortoymu',
				'refPortfoyTipi', 'refPortfoyKod', 'refPortfoyAdi', 'refDvKod'
			]
		}
		return result
	}
    constructor(e) { e = e ?? {}; super(e); this.setValues(e) }
	setValues(e) {
		if ($.isEmptyObject(e)) { return this }
		let {siraliInstVars} = this.class, isArray = $.isArray(e);
		for (let i = 0; i < siraliInstVars.length; i++) {
			let key = siraliInstVars[i], value = e[isArray ? i : key];
			if (value !== undefined) { this[key] = value }
		}
		return this
	}
}

class CSIslemler extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static delim = '@'; static get tekilIslemSinif() { return CSTekilIslem }
	static get portfoyTip2Bilgi() {
		let {_portfoyTip2Bilgi: result} = this; if (result == null) {
			let e = { result: {} }; this.portfoyTip2BilgiDuzenle(e); result = e.result;
			for (let [tip, bilgi] of Object.entries(result)) { bilgi.kod = tip }
			this._portfoyTip2Bilgi = result
		}
		return result
	}
	static get anahtarcilar() { let e = { result: {} }; this.anahtarcilarDuzenle(e); return e.result }
	get csHareketBilgiler() { let e = { result: [] }; this.csHareketBilgileriDuzenle(e); return e.result }
	static portfoyTip2BilgiDuzenle({ result }) {
		$.extend(result, {
			P: { kisaAdi: 'Port', aciklama: 'Portföy' },
			H: { kisaAdi: 'B.Hes', aciklama: 'Banka Hesap' },
			C: { kisaAdi: '3.Şah', aciklama: '3. Şahıs' },
			XT: { kisaAdi: 'TahEd', aciklama: 'Tahsil Edildi' },
			XK: { kisaAdi: 'Karş', aciklama: 'Karşılıksız/Protesto' },
			XI: { kisaAdi: 'İade', aciklama: 'İade' },
			X3: { kisaAdi: '3.Şah.Bit', aciklama: '3. Şahıs İşi Bitti' },
			XZ: { kisaAdi: 'Tem.Bit', aciklama: 'Teminat İşi Bitti' }
		})
	}
	static getPortfoyTip2Bilgi(e) { let tip = typeof e == 'object' ? e.tip : e; return this.portfoyTip2Bilgi[tip] }
	static getPortfoyTipAdi(e) { return this.getPortfoyTip2Bilgi(e)?.aciklama ?? '??' }
	static getPortfoyTipKisaAdi(e) { return this.getPortfoyTip2Bilgi(e)?.kisaAdi ?? '??' }
	static anahtarcilarDuzenle({ result }) {
		$.extend(result, {
			tip: {
				giris: ({ portfoyTipi }) => portfoyTipi ?? null,
				cikis: ({ refBilgiPortoymu, refPortfoyTipi }, sadeceGercekOlanmi) =>
					!sadeceGercekOlanmi || refBilgiPortoymu ? refPortfoyTipi ?? null : null
			},
			portfoy: {
				giris: (aCSTekilIslem) => (
					aCSTekilIslem.portfoyTipi == null ? null :
						['portfoyTipi', 'portfoyKod', 'portfoyAdi', 'portfoyDvKod']
							.map(key => aCSTekilIslem[key]).join(this.delim)
				),
				cikis: (aCSTekilIslem, sadeceGercekOlanmi) => (
					sadeceGercekOlanmi && !aCSTekilIslem.refBilgiPortoymu ? null :
						['refPortfoyTipi', 'refPortfoyKod', 'refPortfoyAdi', 'refPortfoyDvKod']
							.map(key => aCSTekilIslem[key]).join(this.delim)
				)
			}
		})
	}
	csHareketBilgileriDuzenle({ result }) {
		let {tekilIslemSinif: cls} = this.class;
		result.push(...[
				/* Alacak Çek-Senet */
			new cls(['D', 'Portföy Devir', 'prt.finanalizkullanilmaz', 'P', 'fis.portfkod', 'prt.aciklama', 'prt.dvtipi']),
			new cls(['H', 'Banka Hesap Devir', 'bhes.finanalizkullanilmaz', 'H', 'fis.banhesapkod', 'bhes.aciklama', 'bhes.dvtipi']),
			new cls(['3', '3. Şahıs Devir', 'devctip.finanaliztipi', 'C', 'bel.devirciranta', 'devcir.birunvan', 'devcir.dvkod']),
			new cls(['AL', 'Alacak Belge Girişi', 'prt.finanalizkullanilmaz', 'P', 'fis.portfkod', 'prt.aciklama', 'prt.dvtipi', false, 'C',
					 'fis.fisciranta', 'fiscar.birunvan', 'fiscar.dvkod']),
			new cls(['ALI', 'Alacak Belge İadesi', 'prt.finanalizkullanilmaz', 'XI', null, `'İade'`, null, true, 'P',
					 'fis.portfkod', 'prt.aciklama', 'prt.dvtipi']),
			new cls(['3S', '3. Şahsa Verilen', 'prt.finanalizkullanilmaz', 'C', 'fis.fisciranta', 'fiscar.birunvan', 'fiscar.dvkod', true, 'P',
					 'fis.portfkod', 'prt.aciklama', 'prt.dvtipi']),
			new cls(['3SI', '3. Şahıs İade', 'prt.finanalizkullanilmaz', 'P', 'fis.portfkod', 'prt.aciklama', 'prt.dvtipi', true, 'C',
					 'fis.fisciranta', 'fiscar.birunvan', 'fiscar.dvkod']),
			new cls(['PT', 'Portföy Transfer', 'prt.finanalizkullanilmaz', 'P', 'fis.refportfkod', 'refprt.aciklama', 'refprt.dvtipi', true, 'P',
					 'fis.portfkod', 'prt.aciklama', 'prt.dvtipi']),
			new cls(['3K', '3. Şahıs Karşılıksız', 'fisctip.finanaliztipi', 'XK', null, `'Karşılıksız'`, null, true, 'C',
					 'fis.fisciranta', 'fiscar.birunvan', 'fiscar.dvkod']),
			new cls(['EK', 'Elden Karşılıksız', 'prt.finanalizkullanilmaz', 'XK', null, `'Karşılıksız'`, null, true, 'P',
					 'fis.portfkod', 'prt.aciklama', 'prt.dvtipi']),
			new cls(['EL', 'Elden Tahsil',  'prt.finanalizkullanilmaz', 'XT', null, `'Tahsil Edildi'`, null, true, 'P',
					 'fis.portfkod', 'prt.aciklama', 'prt.dvtipi']),
			new cls(['TH', 'Bankaya Takasa Verilen', 'prt.finanalizkullanilmaz', 'H', 'fis.banhesapkod', 'bhes.aciklama', 'bhes.dvtipi', true, 'P',
					 'fis.portfkod', 'prt.aciklama', 'prt.dvtipi']),
			new cls(['THI', 'Banka Takasdan İade', 'prt.finanalizkullanilmaz', 'P', 'fis.portfkod', 'prt.aciklama', 'prt.dvtipi', true, 'H',
					 'fis.banhesapkod', 'bhes.aciklama', 'bhes.dvtipi']),
			new cls(['TM', 'Bankaya Teminata Verilen', 'prt.finanalizkullanilmaz', 'H', 'fis.banhesapkod', 'bhes.aciklama', 'bhes.dvtipi', true, 'P',
					 'fis.portfkod', 'prt.aciklama', 'prt.dvtipi']),
			new cls(['TMI', 'Banka Teminatdan İade', 'prt.finanalizkullanilmaz', 'P', 'fis.portfkod', 'prt.aciklama', 'prt.dvtipi', true, 'H',
					 'fis.banhesapkod', 'bhes.aciklama', 'bhes.dvtipi']),
			new cls(['TE', 'Bankadan Tahsil',  'bhes.finanalizkullanilmaz', 'XT', null, `'Tahsil Edildi'`, null, true, 'H',
					 'fis.banhesapkod', 'bhes.aciklama', 'bhes.dvtipi']),
			new cls(['KR', 'Bankadan Karşılıksız', 'bhes.finanalizkullanilmaz', 'XK', null, `'Karşılıksız'`, null, true, 'H',
					 'fis.banhesapkod', 'bhes.aciklama', 'bhes.dvtipi']),
			new cls(['VR', 'Banka Hesap Virmanı', 'bhes.finanalizkullanilmaz', 'H', 'fis.banhesapkod', 'bhes.aciklama', 'bhes.dvtipi', true, 'H',
					 'fis.refhesapkod', 'refhes.aciklama', 'refhes.dvtipi']),
			new cls(['TX', 'Teminata Dönüşüm', 'prt.finanalizkullanilmaz', 'P', 'fis.refportfkod', 'refprt.aciklama', 'refprt.dvtipi', true, 'P',
					 'fis.portfkod', 'prt.aciklama', 'prt.dvtipi']),
			new cls(['TZ', 'Teminat İşi Bitti', 'prt.finanalizkullanilmaz', 'XZ', null, `'İşi Bitti'`, null, true, 'P',
					 'fis.portfkod', 'prt.aciklama', 'prt.dvtipi']),
				/*  Borç Senet*/
			new cls(['BS', 'Verilen Borç Senet', 'prt.finanalizkullanilmaz', 'C', 'fis.fisciranta', 'fiscar.birunvan', 'fiscar.dvkod', false, 'P',
					 'fis.portfkod', 'prt.aciklama', 'prt.dvtipi']),
			new cls(['BSI', 'Borç Senet İadesi', `''`, 'XI', null, `'İade'`, null, true, 'C', 'fis.fisciranta', 'fiscar.birunvan', 'fiscar.dvkod']),
				/* Borç Çek */
			new cls(['BC', 'Verilen Borç Çeki',  'bhes.finanalizkullanilmaz', 'C', 'fis.fisciranta', 'fiscar.birunvan', 'fiscar.dvkod', true, 'H',
					 'fis.banhesapkod', 'bhes.aciklama', 'bhes.dvtipi']),
			new cls(['BCI', 'Borç Çek İadesi', `''`, 'XI', null, `'İade'`, null, true, 'C',
					 'fis.fisciranta', 'fiscar.birunvan', 'fiscar.dvkod']),
				/* Borç Çek-Senet */
			new cls(['BE', 'Bankadan Ödenen',  'bhes.finanalizkullanilmaz', 'XT', null, `'Ödendi'`, null, true, 'H',
					 'fis.banhesapkod', 'bhes.aciklama', 'bhes.dvtipi']),
				// BE icin refkod cari idi ama ekrandan cari hesap alinmiyor - artik sadece banka hesap verilecek "
			new cls(['EO', 'Elden Ödenen',  'bhes.finanalizkullanilmaz', 'XT', null, `'Ödendi'`, null, true, 'C',
					 `dbo.emptycoalesce(bel.ciranta, bel.devirciranta)`,
					 `(case when bel.ciranta = '' then devcir.birunvan else belcir.birunvan end)`,
					 `(case when bel.ciranta = '' then devcir.dvkod else belcir.dvkod end)`]),
			new cls(['BT', 'Teminat İşi Bitti', 'bhes.finanalizkullanilmaz', 'P', 'fis.portfkod', 'prt.aciklama', 'prt.dvtipi']),
			new cls(['BN', 'Bankadan Çek ile Çekilen', 'bhes.finanalizkullanilmaz', 'H', 'fis.banhesapkod', 'bhes.aciklama', 'bhes.dvtipi'])
		].flat().filter(x => !!x))
	}
	getWhenler_tip({ tipVeIadeClause, anah2Tipler }) {
		let result = {}; for (let [portfTip, tipler] of Object.entries(anah2Tipler)) {
			let {aciklama: adi, kisaAdi: tipAdi} = this.class.getPortfoyTip2Bilgi(portfTip);
			let inStr = new MQInClause({ liste: tipler, saha: tipVeIadeClause }).toString();
			let getWhenClause = value => ` when ${inStr} then ${MQSQLOrtak.sqlServerDegeri(value)}`;
			let donusum = { tip: portfTip, adi, tipAdi }; for (let [key, value] of Object.entries(donusum)) {
				if (value != null) { (result[key] = result[key] ?? []).push(getWhenClause(value)) } }
		}
		return result
	}
	getWhenler_portfoy({ tipVeIadeClause, anah2Tipler }) {
		let {delim} = this.class, result = {};
		for (let [anah, tipler] of Object.entries(anah2Tipler)) {
			let tokens = anah.split(delim), [portfTip, kodClause, adiClause, dvKodClause] = tokens;
			let inStr = new MQInClause({ liste: tipler, saha: tipVeIadeClause }).toString();
			let getWhenClause = value => ` when ${inStr} then ${MQSQLOrtak.sqlServerDegeri(value)}`;
			let donusum = { kod: kodClause, adi: adiClause, doviz: dvKodClause }; for (let [key, value] of Object.entries(donusum)) {
				if (value != null) { (result[key] = result[key] ?? []).push(getWhenClause(value)) } }
		}
		return result
	}
	getPortfoyVeReferansTanimlari(e) {
		let cikismi = typeof e == 'object' ? e.cikismi ?? e.cikis : e;
		let selectors = Object.keys(this.class.anahtarcilar), {csHareketBilgiler: harBilgiler} = this, result = {};
		{
			let selector2Anahtarci = {}; for (let selector of selectors) { selector2Anahtarci[selector] = cikismi ? 'cikis' : 'giris' }
			let selector2Anah2Tipler = this.getXTipVePortfoyDict({ selector2Anahtarci, sadeceGercekOlanmi: true });
			let prefix = ''; this.xportfSahalariDuzenle({ result, prefix, selector2Anah2Tipler })
		}
		{
			let selector2Anahtarci = {}; for (let selector of selectors) { selector2Anahtarci[selector] = cikismi ? 'giris' : 'cikis' }
			let selector2Anah2Tipler = this.getXTipVePortfoyDict({ selector2Anahtarci, sadeceGercekOlanmi: true });
			let prefix = 'ref'; this.xportfSahalariDuzenle({ result, prefix, selector2Anah2Tipler })
		}
		{
			let alma2TipVeIade = {}; for (let {tipVeIade, finAnalizKullanilmaz: almaClause} of harBilgiler) {
				(alma2TipVeIade[almaClause] = alma2TipVeIade[almaClause] ?? []).push(tipVeIade) }
			let almaCase = `(case`; for (let [almaClause, tipVeIadeDizi] of Object.entries(alma2TipVeIade)) {
				let inClause = new MQInClause({ liste: tipVeIadeDizi, saha: `RTRIM(fis.fistipi + fis.iade)` }).toString();
				almaCase += ` when ${inClause} then ${almaClause}`
			}
			almaCase += ` else '' end)`;
			result.finanaliztipi = almaCase
		}
		return result    /* hv */
	}
	getXTipVePortfoyDict({ selector2Anahtarci, sadeceGercekOlanmi }) {
		let {csHareketBilgiler: harBilgiler} = this, {anahtarcilar} = this.class;
		let result = { tip: {}, portfoy: {} }, ekleyici = (selector, aCSTekilIslem) => {
			let anahtarci = selector2Anahtarci[selector];
			if (typeof anahtarci == 'string') { anahtarci = anahtarcilar[selector]?.[anahtarci] ?? this[`anahtarci_${anahtarci}`] ?? this[anahtarci] }
			let anah = anahtarci?.call(this, aCSTekilIslem, sadeceGercekOlanmi); if (!anah) { return null }
			let target = result[selector]; if (!target) { throw { isError: true, errorText: `selector değeri (<b>${selector}</b>) hatalıdır` } }
			(target[anah] = target[anah] ?? []).push(aCSTekilIslem.tipVeIade); return target
		}
		let selectors = Object.keys(result);
		for (let selector of selectors) {
			for (let aCSTekilIslem of harBilgiler) { ekleyici(selector, aCSTekilIslem) } }
		return result
	}
	xportfSahalariDuzenle({ result, prefix, selector2Anah2Tipler }) {
		let tipVeIadeClause = `rtrim(fis.fistipi + fis.iade)`, getAttr = attr => [prefix, attr].filter(x => !!x).join('');
		let key2AttrPostfix = {
			tip: 'portftipi', tipAdi: 'portftiptext', tipKisaAdi: 'portfkisatiptext',
			kod: 'portfkod', adi: 'portfadi', doviz: 'portdvkod'
		};
		for (let [selector, anah2Tipler] of Object.entries(selector2Anah2Tipler)) {
			let whenler = this[`getWhenler_${selector}`]?.({ tipVeIadeClause, anah2Tipler });
			for (let [key, whenClauses] of Object.entries(whenler)) {
				let caseClause = `(case${whenClauses.join('')} else '' end)`;
				let attr = getAttr(key2AttrPostfix[key]); result[attr] = caseClause
			}
		}
	}
	getFisTipiClauseIlkHareket() {
		let tipSet = asSet(['D', '3', 'H', 'BN', 'AL', 'BC', 'BS', '3S']);
		let kosulcu = ({ tipVeIade }) => !!tipSet[tipVeIade];
		return this.getFisTipiClause({ kosulcu })
	}
	getFisTipiClause({ kosulcu }) {
		let {csHareketBilgiler: harBilgiler} = this;
		let sqlDegeri = value => MQSQLOrtak.sqlServerDegeri(value);
		let tiClause = 'RTRIM(fis.fistipi + fis.iade)', caseClause = `(case ${tiClause}`;
		for (let aCSTekilIslem of harBilgiler) {
			if (kosulcu && !kosulcu(aCSTekilIslem)) { continue } let {tipVeIade, islemAdi} = aCSTekilIslem;
			caseClause += ` when ${sqlDegeri(tipVeIade)} then ${sqlDegeri(islemAdi)}`
		}
		caseClause += ` else '' end)`;
		return caseClause
	}
}
