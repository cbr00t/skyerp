class BarkodParser_Ayrisim extends BarkodParser_Kuralli {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get aciklama() { return 'Ayrışım' } static get ayrisimmi() { return true }
	get ayrisimAyiraclimi() { return this.formatAyiraclimi } get zVarmi() { return (this.kural || {}).zVarmi /* && !!this.zSeq */ }
	constructor(e) { e = e || {}; super(e); }
	static getKuralSinif(e) { e = e || {}; const {formatTipi} = e; return formatTipi == 'A' ? BarkodKurali_AyrisimAyiracli : BarkodKurali_Ayrisim }
	async parseDevam(e) {
		e = e || {}; let result = await super.parseDevam(e); if (result) { return result }
		if (this.formatAyiraclimi) { return this.parseDevam_ayiracli(e) }
		const {basitmi} = e, {kural, okunanBarkod} = this; if (okunanBarkod && this.formatBaslangicmi && okunanBarkod.length > 2) {
			this.barkod = okunanBarkod.slice(2); if (this.shKod == okunanBarkod) { this.shKod = this.barkod } }
		result = this.parcaAl({ belirtec: 'S', bas: kural.stokbas, hane: kural.stokhane, callback: value => this.shKod = value });
		if (result) { if (this.shKod) { result = e.basitmi ? true : this.shEkBilgileriBelirle(e) } }
		else {
			result = this.parcaAl({ belirtec: 'V', bas: kural.barkodbas, hane: kural.barkodhane, callback: value => this.barkod = value });
			if (result) {
				let parser = new BarkodParser_Referans(); result = parser.parse({ basitmi, barkod: this.barkod })
				if (result) { $.extend(this, { barkod: parser.barkod, shKod: parser.shKod }) }
			}
			if (!result) { return false }
		}
		this.parcaAl({ belirtec: 'K', bas: kural.miktarbas, hane: kural.miktarhane, callback: value => this.miktar = asFloat(value) || null });
		let {hmrBas2IOAttrDonusum} = kural, keys = [ 'paket', 'model', 'renk', 'desen', 'beden', 'lotNo', 'seriNo', 'raf', 'emir', 'eou', 'tezgah', 'personel', 'oemID' ];
		for (const key of keys) {
			let keyLower = key.toLowerCase();
			this.parcaAl({ bas: kural[`${keyLower}bas`], hane: kural[`${keyLower}hane`], callback: value => this[hmrBas2IOAttrDonusum[key] || `${key}Kod`] = value }) }
		keys = ['operasyon']; for (const key of keys) {
			let keyLower = key.toLowerCase();
			this.parcaAl({ bas: kural[`${keyLower}bas`], hane: kural[`${keyLower}hane`], callback: value => this[hmrBas2IOAttrDonusum[key] || `${key}Kod`] = asInteger(value) }) }
		for (let i = 1; i <= 9; i++) {
			let key = `ekOz${i}`, keyLower = key.toLowerCase();
			this.parcaAl({ bas: kural[`${keyLower}bas`], hane: kural[`${keyLower}hane`], callback: value => this[hmrBas2IOAttrDonusum[key] || key] = asFloat(value) || null })
		}
		return result
	}
	async parseDevam_ayiracli(e) {
		e = e || {}; let {basitmi} = e, {barkod} = this, carpan = e.carpan || this.carpan, {kural} = this, {belirtecler, hmrBas2IOAttrDonusum} = kural;
		let barkodParcalar = this.barkodParcalar = barkod.split(kural.ayiracstr), result = false, miktarAtandimi = false;
		for (let i = 0; i < barkodParcalar.length; i++) {
			let belirtec = belirtecler[i], deger = barkodParcalar[i]?.trimEnd(); if (!deger) { continue }
			switch (belirtec) {
				case 'S': this.shKod = deger; result = true; if (deger) { result = basitmi ? true : await this.shEkBilgileriBelirle(e) } break;
				case 'V':
					barkod = deger;
					let _e = { basitmi, barkod }, parser = new BarkodParser_Referans(_e), _parseResult = await parser.parse(_e);
					if (_parseResult) {
						barkod = parser.barkod; for (const key of ['shKod', 'brm', /*'carpan',*/ 'paketKod']) { if (parser[key]) { this[key] = parser[key] } }
						for (const key of ['fiyat']) { if (parser[key]) { this[key] = asFloat(parser[key]) || null } }
						if (!miktarAtandimi && parser.miktar) {
							this.miktar = asFloat(parser.miktar) || null;
							if (parser.paketIcAdet) { this.paketIcAdet = parser.paketIcAdet }
						}
						this.shKod = parser.shKod; result = true
					}
					break;
				case 'K': this.miktar = asFloat(deger) || null; miktarAtandimi = true; break
				case 'Z': this.zSeq = asInteger(deger) || null; break;
				default:
					let hmrBelirtec2Bilgi = kural.class.hmrBelirtec2Bilgi || {}, bilgi = hmrBelirtec2Bilgi[belirtec];
					if (bilgi) { if (bilgi.isNumber) { deger = asFloat(deger) || 0 } this[bilgi.key] = deger } break;
			}
		}
		return result
	}
	async parseSonrasi(e) {
		e = e || {}; const {kural, paketKod} = this; if (kural && paketKod) {
			let {miktar} = this, {paketIcAdet} = kural, {shKod} = this;
			if (!paketIcAdet && shKod) {
				let sent = new MQSent({
					from: 'paket pak', fromIliskiler: [{ from: 'urunpaket upak', iliski: 'pak.kaysayac = upak.paketsayac' }],
					where: [{ degerAta: shKod, saha: 'upak.urunkod' }, { degerAta: paketKod, saha: 'pak.kod' }],
					sahalar: ['upak.urunmiktari paketIcAdet']
				}), stm = new MQStm({ sent });
				paketIcAdet = await app.sqlExecTekilDeger({ query: stm }); if (paketIcAdet != null) { paketIcAdet = asFloat(paketIcAdet) }
			}
			if (paketIcAdet) { this.paketIcAdet = paketIcAdet }
		}
		return await super.parseSonrasi(e)
	}
	parcaAl(e) {
		const {formattipi: formatTipi} = this.kural;
		if (formatTipi == 'M') { return false }				// Maskeleme
		if (formatTipi == 'A') { return null }				// Ayıraçlı
		return super.parcaAl(e)								// Başlangıçlı (sabit karakter sayılı - üst seviyedeki işlemi yap)
	}
}
