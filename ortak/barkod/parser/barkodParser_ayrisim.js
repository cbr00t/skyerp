class BarkodParser_Ayrisim extends BarkodParser_Kuralli {
	constructor(e) {
		e = e || {};
		super(e);
	}

	static get aciklama() { return 'Ayrışım' }
	static get ayrisimmi() { return true }
	get ayrisimAyiraclimi() { return this.formatAyiraclimi }
	get zVarmi() { return (this.kural || {}).zVarmi /* && !!this.zSeq */ }

	static getKuralSinif(e) {
		e = e || {};
		const {formatTipi} = e;
		return formatTipi == 'A' ? BarkodKurali_AyrisimAyiracli : BarkodKurali_Ayrisim
	}
	
	async parseDevam(e) {
		e = e || {};
		let result = await super.parseDevam(e);
		if (result)
			return result
		
		if (this.formatAyiraclimi)
			return this.parseDevam_ayiracli(e)

		const {basitmi} = e;
		const {kural, okunanBarkod} = this;
		if (okunanBarkod) {
			if (this.formatBaslangicmi && okunanBarkod.length > 2) {
				this.barkod = okunanBarkod.slice(2);
				if (this.shKod == okunanBarkod)
					this.shKod = this.barkod
			}
		}

		result = this.parcaAl({
			belirtec: 'S', bas: kural.stokbas, hane: kural.stokhane,
			callback: value => this.shKod = value
		});
		if (result) {
			if (this.shKod)
				result = e.basitmi ? true : this.shEkBilgileriBelirle(e)
		}
		else {
			result = this.parcaAl({
				belirtec: 'V', bas: kural.barkodbas, hane: kural.barkodhane,
				callback: value => this.barkod = value
			});
			if (result) {
				let parser = new BarkodParser_Referans();
				result = parser.parse({ basitmi: basitmi, barkod: this.barkod })
				if (result) {
					this.barkod = parser.barkod;
					this.shKod = parser.shKod;
				}
			}
			if (!result)
				return false
		}
		
		this.parcaAl({
			belirtec: 'K', bas: kural.miktarbas, hane: kural.miktarhane,
			callback: value => this.miktar = asFloat(value) || null
		});

		const {hmrBas2IOAttrDonusum} = kural;
		let keys = [
			'paket', 'model', 'renk', 'desen', 'beden', 'lotno', 'serino', 'raf',
			'emir', 'eou', 'tezgah', 'personel'
		];
		for (const key of keys) {
			this.parcaAl({
				bas: kural[`${key}bas`], hane: kural[`${key}hane`],
				callback: value =>
					this[hmrBas2IOAttrDonusum[key] || `${key}Kod`] = value
			})
		}
		keys = ['operasyon'];
		for (const key of keys) {
			this.parcaAl({
				bas: kural[`${key}bas`], hane: kural[`${key}hane`],
				callback: value =>
					this[hmrBas2IOAttrDonusum[key] || `${key}Kod`] = asInteger(value)
			})
		}
		for (let i = 1; i <= 9; i++) {
			const key = key.toLowerCase();
			const detKey = hmrBas2IOAttrDonusum[key] || `ekOz${i}`;
			this.parcaAl({
				bas: kural[`${key}bas`], hane: kural[`${key}hane`],
				callback: value =>
					this[detKey] = asFloat(value) || null
			})
		}

		return result
	}

	async parseDevam_ayiracli(e) {
		e = e || {};
		const {basitmi} = e;
		let {barkod} = this;
		let carpan = e.carpan || this.carpan;
		const {kural} = this;
		const {belirtecler, hmrBas2IOAttrDonusum} = kural;
		const barkodParcalar = this.barkodParcalar = barkod.split(kural.ayiracstr);
		let result = false, miktarAtandimi = false;
		for (let i = 0; i < barkodParcalar.length; i++) {
			const belirtec = belirtecler[i];
			let deger = (barkodParcalar[i] || '').trimEnd();
			if (deger) {
				switch (belirtec) {
					case "S":
						this.shKod = deger;
						result = true;
						if (deger)
							result = basitmi ? true : await this.shEkBilgileriBelirle(e)
						break;
					case "V":
						barkod = deger;
						// this.barkod = barkod = deger;

						const _e = { basitmi: basitmi, barkod: barkod };
						let parser = new BarkodParser_Referans(_e);
						let _parseResult = await parser.parse(_e);
						if (_parseResult) {
							// this.barkod = barkod = parser.barkod;
							barkod = parser.barkod;
							for (const key of ['shKod', 'brm', /*'carpan',*/ 'paketKod']) {
								if (parser[key])
									this[key] = parser[key];
							}
							for (const key of ['fiyat']) {
								if (parser[key])
									this[key] = asFloat(parser[key]) || null;
							}
							if (!miktarAtandimi && parser.miktar) {
								this.miktar = asFloat(parser.miktar) || null;
								if (parser.paketIcAdet)
									this.paketIcAdet = parser.paketIcAdet;
							}
							this.shKod = parser.shKod;
							result = true
						}
						break;
					case "K":
						this.miktar = asFloat(deger) || null;
						miktarAtandimi = true;
						break;
					case "Z":
						this.zSeq = asInteger(deger) || null;
						break;
					default:
						const hmrBelirtec2Bilgi = kural.class.hmrBelirtec2Bilgi || {};
						const bilgi = hmrBelirtec2Bilgi[belirtec];
						if (bilgi) {
							if (bilgi.isNumber)
								deger = asFloat(deger) || 0
							this[bilgi.key] = deger
						}
						break;
				}
			}
		}

		return result
	}

	async parseSonrasi(e) {
		e = e || {};
		const {kural, paketKod} = this;
		if (kural && paketKod) {
			let {miktar} = this;
			let {paketIcAdet} = kural;
			const {shKod} = this;
			if (!paketIcAdet && shKod) {
				const sent = new MQSent({
					from: 'paket pak',
					fromIliskiler: [
						{ from: 'urunpaket upak', iliski: 'pak.kaysayac = upak.paketsayac' }
					],
					where: [
						{ degerAta: shKod, saha: 'upak.urunkod' },
						{ degerAta: paketKod, saha: 'pak.kod' }
					],
					sahalar: ['upak.urunmiktari paketIcAdet']
				});
				const stm = new MQStm({ sent: sent });
				paketIcAdet = await app.sqlExecTekilDeger({ query: stm });
				if (paketIcAdet != null)
					paketIcAdet = asFloat(paketIcAdet);
			}
			if (paketIcAdet) {
				this.paketIcAdet = paketIcAdet
				// miktar = this.miktar = miktar * paketIcAdet
			}
		}
		
		return await super.parseSonrasi(e)
	}

	parcaAl(e) {
		const formatTipi = this.kural.formattipi;
		if (formatTipi == 'M')						// Maskeleme
			return false
		if (formatTipi == 'A')						// Ayıraçlı
			return null
		return super.parcaAl(e)						// Başlangıçlı (sabit karakter sayılı - üst seviyedeki işlemi yap)
	}
}
